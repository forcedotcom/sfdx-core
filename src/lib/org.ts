/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Org Fields.
 * @typedef OrgFields
 * @property {string} ALIAS The org alias.
 * @property {string} CREATED_ORG_INSTANCE The Salesforce instance the org was created on. e.g. `cs42`.
 * @property {string} DEV_HUB_USERNAME The username of the dev hub org that created this org. Only populated for scratch orgs.
 * @property {string} INSTANCE_URL The full url of the instance the org lives on.
 * @property {string} IS_DEV_HUB Is the current org a dev hub org. e.g. They have access to the `ScratchOrgInfo` object.
 * @property {string} LOGIN_URL The login url of the org. e.g. `https://login.salesforce.com` or `https://test.salesforce.com`.
 * @property {string} ORG_ID The org ID.
 * @property {string} STATUS The `OrgStatus` of the org.
 */

/**
 * Scratch Org status.
 * @typedef OrgStatus
 * @property {string} ACTIVE The scratch org is active.
 * @property {string} EXPIRED The scratch org has expired.
 * @property {string} UNKNOWN The org is a scratch Org but no dev hub is indicated.
 * @property {string} MISSING The dev hub configuration is reporting an active Scratch org but the AuthInfo cannot be found.
 */

import { join as pathJoin } from 'path';
import { Aliases } from './config/aliases';
import { Connection } from './connection';
import { Logger } from './logger';
import { Config } from './config/config';
import { ConfigContents } from './config/configStore';
import { ConfigAggregator, ConfigInfo } from './config/configAggregator';
import { get as _get, filter as _filter, isString as _isString } from 'lodash';
import { AuthFields, AuthInfo } from './authInfo';
import { Global} from './global';
import { OrgUsersConfig } from './config/orgUsersConfig';
import { SfdxError } from './sfdxError';
import { QueryResult } from 'jsforce';
import { AnyJson, Dictionary } from './types';
import { trimTo15 } from './util/sfdc';
import * as fs from './util/fs';

export enum OrgStatus {
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    UNKNOWN = 'UNKNOWN',
    MISSING = 'MISSING'
}

// A subset of fields from AuthInfoFields and properties that are specific to Org,
// and properties that are defined on Org itself.
export enum OrgFields {
    // From AuthInfo
    ALIAS = 'alias',
    CREATED = 'created',
    CREATED_ORG_INSTANCE = 'createdOrgInstance',
    DEV_HUB_USERNAME = 'devHubUsername',
    INSTANCE_URL = 'instanceUrl',
    IS_DEV_HUB = 'isDevHub',
    LOGIN_URL = 'loginUrl',
    ORG_ID = 'orgId',

    // From Org
    STATUS = 'status'

    // Should it be on org? Leave it off for now, as it might
    // be confusing to the consumer what this actually is.
    // USERNAMES = 'usernames',

    // Keep separation of concerns. I think these should be on a "user" that belongs to the org.
    // Org can have a list of user objects that belong to it? Should connection be on user and org.getConnection()
    // gets the orgs current user for the process? Maybe we just want to keep with the Org only model for
    // the end of time?
    // USER_ID = 'userId',
    // USERNAME = 'username',
    // PASSWORD = 'password',
    // USER_PROFILE_NAME = 'userProfileName'
}

const _manageDelete = function(cb, dirPath, throwWhenRemoveFails) {
    return cb().catch((e) => {
        if (throwWhenRemoveFails) {
            throw e;
        } else {
            this.logger.warn(`failed to read directory ${dirPath}`);
            return;
        }
    });
};

/**
 * Provides a way to manage a locally authenticated Org.
 *
 * @see {@link AuthInfo}
 * @see {@link Connection}
 * @see {@link Aliases}
 * @see {@link Config}
 *
 * @example
 * // Email username
 * const org1: Org = await Org.create('foo@example.com');
 * // An alias
 * const org2: Org = await Org.create('fooAlias');
 * // The defaultusername config property
 * const org2: Org = await Org.create();
 * // Full Connection
 * const org3: Org = await Org.create(await Connection.create(await AuthInfo.create('bar@example.com')));
 *
 * @see https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_usernames_orgs.htm
 */
export class Org {

    /**
     * Static initializer that allows creating an instance of an org from a alias or a plain string username. If no
     * username or alias is provided then the defaultusername is used. If isDevHub is true then the defaultdevhub is used.
     * @param {string} [aliasOrUsername] The string alias or username.
     * @param {ConfigAggregator} [aggregator] optional config aggregator.
     * @param {boolean} [isDevHub] true if this org is a devhub. defaults to false.
     * @return {Promise<Org>}
     */
    public static async create(aliasOrUsername?: string, aggregator?: ConfigAggregator, isDevHub?: boolean): Promise<Org>;

    /**
     * Static initializer that allows creating an instance of an org from a Connection object.
     * @param {Connection} [connection] The connection
     * @param {ConfigAggregator} [aggregator] A config aggregator. (Optional)
     * @param {boolean} [isDevHub] True if this org is a devhub. defaults to false (Optional)
     * @return {Promise<Org>}
     */
    // tslint:disable-next-line:unified-signatures
    public static async create(connection?: Connection, aggregator?: ConfigAggregator, isDevHub?: boolean): Promise<Org>;

    /**
     * Static initializer that allows creating an instance of an org from an alias, username, or Connection. If no identifier
     * is provided then the defaultusername is used. If isDevHub is true then the defaultdevhubusername is used.
     * @see {@link Config}
     * @param {string | Connection} [connection] The string alias or username.
     * @param {ConfigAggregator} [aggregator] optional config aggregator.
     * @param {boolean} [isDevHub] true if this org is a devhub. defaults to false.
     * @return {Promise<Org>}
     */
    public static async create(connection?: string | Connection, aggregator?: ConfigAggregator, isDevHub?: boolean): Promise<Org> {
        const _aggregator = aggregator ? aggregator : await ConfigAggregator.create();

        const org = new Org(_aggregator);

        org.logger = await Logger.child('Org');

        let _connection: Connection;

        if (!connection) {
            org.logger.debug('No connection specified. Trying default configurations');
            connection = isDevHub ?
                _aggregator.getInfo(Config.DEFAULT_DEV_HUB_USERNAME).value as string :
                _aggregator.getInfo(Config.DEFAULT_USERNAME).value as string;
            if (!connection) {
                throw new SfdxError(`No ${isDevHub ? 'default Devhub' : 'default' } username or Connection found.`, 'NoUsername' );
            }
        }

        if (_isString(connection)) {
            org.logger.debug('connection type is string');
            const aliasValue: string = await Aliases.fetch(connection);
            _connection = await Connection.create(
                await AuthInfo.create(aliasValue || connection), _aggregator);
        } else {
            _connection = connection;
        }

        org.logger.debug(`connection created for org user: ${_connection.getUsername()}`);
        org.setConnection(_connection);
        return org;
    }

    private logger: Logger;
    private connection: Connection;
    // tslint:disable-next-line:no-unused-variable
    private status: OrgStatus = OrgStatus.UNKNOWN;
    private configAggregator: ConfigAggregator;

    /**
     * **Do not directly construct instances of this class -- use {@link Org.create} instead.**
     *
     * @private
     * @constructor
     */
    private constructor(_aggregator: ConfigAggregator) {
        this.configAggregator = _aggregator;
    }

    /**
     * Clean all data files in the org's data path. Usually <workspace>/.sfdx/orgs/<username>.
     * @param {string} [orgDataPath] A relative path other than "orgs/".
     * @returns {Promise<void>}
     */
    public async cleanLocalOrgData(orgDataPath?: string, throwWhenRemoveFails: boolean = false): Promise<void> {
        let dataPath;
        try {
            const rootFolder: string = await Config.resolveRootFolder(false);
            dataPath = pathJoin(rootFolder, Global.STATE_FOLDER, orgDataPath ? orgDataPath : 'orgs');
            this.logger.debug(`cleaning data for path: ${dataPath}`);
        } catch (err) {
            if (err.name === 'InvalidProjectWorkspace') {
                // If we aren't in a project dir, we can't clean up data files.
                // If the user unlink this org outside of the workspace they used it in,
                // data files will be left over.
                return;
            }
            throw err;
        }

        return _manageDelete.call(this, async () => await fs.remove(dataPath), dataPath,
            throwWhenRemoveFails);
    }

    public async retrieveOrgUsersConfig(): Promise<OrgUsersConfig> {
        return await OrgUsersConfig.create(OrgUsersConfig.getOptions(this.getOrgId()));
    }

    /**
     * Removes the scratch org config file at $HOME/.sfdx/[name].json, any project level org
     * files, all user auth files for the org, matching default config settings, and any
     * matching aliases.
     * @param {boolean} [throwWhenRemoveFails = false] Determines if the call should throw an error or fail silently.
     * @returns {Promise<void>}
     */
    public async remove(throwWhenRemoveFails?: false): Promise<void> {

        // If deleting via the access token there shouldn't be any auth config files
        // so just return;
        if (this.getConnection().isUsingAccessToken()) {
            return Promise.resolve();
        }

        const auths: AuthInfo[] = await this.readUserAuthFiles();
        const aliases: Aliases = await Aliases.retrieve<Aliases>();
        this.logger.info(`Cleaning up usernames in org: ${this.getOrgId()}`);

        for (const auth of auths) {
            const username = auth.getFields().username;

            const aliasKeys = aliases.getKeysByValue(username) || [];
            aliases.unsetAll(aliasKeys);

            let orgForUser;
            if (username === this.getUsername()) {
                orgForUser = this;
            } else {
                const _info = await AuthInfo.create(username);
                const connection: Connection = await Connection.create(_info);
                orgForUser = await Org.create(connection);
            }

            const orgType = await this.isDevHubOrg() ? Config.DEFAULT_DEV_HUB_USERNAME : Config.DEFAULT_USERNAME;

            const configInfo: ConfigInfo = await orgForUser.configAggregator.getInfo(orgType);

            if ((configInfo.value === username || aliasKeys.includes(configInfo.value as string)) &&
                (configInfo.isGlobal() || configInfo.isLocal())) {

                await Config.update(configInfo.isGlobal() as boolean, orgType, undefined);
            }

            const orgUsers: OrgUsersConfig = await this.retrieveOrgUsersConfig();
            _manageDelete.call(this, async () => await orgUsers.unlink(), orgUsers.getPath(),
                throwWhenRemoveFails);
        }

        await aliases.write();
    }

    /**
     * Check that this org is a scratch org by asking the dev hub if it knows about it.
     * @param {string} [devHubUsername] The username of the dev hub org.
     * @returns {Promise<Config>}
     * @throws {SfdxError} **`{name: 'NotADevHub'}`** Not a Dev Hub.
     * @throws {SfdxError} **`{name: 'NoResults'}`** No results.
     */
    public async checkScratchOrg(devHubUsername?: string): Promise<Partial<AuthFields>> {

        let targetDevHub: string | boolean = devHubUsername;
        if (!targetDevHub) {
            targetDevHub = this.configAggregator.getPropertyValue(Config.DEFAULT_DEV_HUB_USERNAME);
        }

        const devHubConnection = await Connection.create(await AuthInfo.create(targetDevHub as string));

        const thisOrgAuthConfig: Partial<AuthFields> = this.getConnection().getAuthInfoFields();

        const trimmedId: string = trimTo15(thisOrgAuthConfig.orgId);

        const DEV_HUB_SOQL = `SELECT CreatedDate,Edition,ExpirationDate FROM ActiveScratchOrg WHERE ScratchOrg=\'${trimmedId}\'`;

        let results;
        try {
            results = await (devHubConnection.query(DEV_HUB_SOQL) as Promise<QueryResult<object>>);

        } catch (err) {
            if (err.name === 'INVALID_TYPE') {
                throw SfdxError.create('@salesforce/core', 'org', 'NotADevHub',
                    [devHubConnection.getUsername()]);
            }
            throw err;
        }

        if (_get(results, 'records.length') !== 1) {
            throw new SfdxError('No results', 'NoResults');
        }

        return thisOrgAuthConfig;
    }

    /**
     * Returns the Org object or null if this org is not affiliated with a Dev Hub (according to the local config).
     * @returns {Promise<Org>}
     */
    public async getDevHubOrg(): Promise<Org> {
        if (this.isDevHubOrg()) {
            return Promise.resolve(this);
        } else if (this.getField(OrgFields.DEV_HUB_USERNAME)) {
            return Org.create(await Connection.create(await AuthInfo.create(this.getField(OrgFields.DEV_HUB_USERNAME) as string)));
        }
    }

    /**
     * Returns `true` if the org is a Dev Hub.
     * @returns {Boolean}
     */
    public isDevHubOrg(): boolean {
        return this.getField(OrgFields.IS_DEV_HUB) as boolean;
    }

    /**
     * Refreshes the auth for this org's instance by calling HTTP GET on the baseUrl of the connection object.
     * @returns {Promise<void>}
     */
    public async refreshAuth(): Promise<void> {
        this.logger.debug('Refreshing auth for org.');
        const requestInfo = {
            url: this.getConnection().baseUrl(),
            method: 'GET'
        };
        const conn = this.getConnection();
        await conn.request(requestInfo);
    }

    /**
     *  Reads and returns the content of all user auth files for this org as an array.
     *  @returns {Promise<AuthInfo[]>}
     */
    public async readUserAuthFiles(): Promise<AuthInfo[]> {
        const config: OrgUsersConfig = await this.retrieveOrgUsersConfig();
        const contents: ConfigContents = await config.read();
        const thisUsername = this.getUsername();
        const usernames: string[] = contents.get('usernames') as string[] || [thisUsername];
        return Promise.all(usernames.map((username) => {
            if (username === thisUsername) {
                return AuthInfo.create(this.getConnection().getUsername());
            } else {
                return AuthInfo.create(username);
            }
        }));
    }

    /**
     * Adds a username to the user config for this org.
     * @param {AuthInfo | string} auth The AuthInfo for the username to add.
     * @returns {Promise<Org>} For convenience `this` object is returned.
     * @example
     * const org: Org = await Org.create(await Connection.create(await AuthInfo.create('foo@example.com')));
     * const userAuth: AuthInfo = await AuthInfo.create('bar@example.com');
     * await org.addUsername(userAuth);
     */
    public async addUsername(auth: AuthInfo | string): Promise<Org> {

        if (!auth) {
            throw new SfdxError('Missing auth info', 'MissingAuthInfo');
        }

        const _auth: AuthInfo = _isString(auth) ? await AuthInfo.create(auth) : auth;
        this.logger.debug(`adding username ${_auth.getFields().username}`);

        const orgConfig: OrgUsersConfig = await this.retrieveOrgUsersConfig();

        const contents: ConfigContents = await orgConfig.read();
        const usernames = contents.get('usernames') as string[] || [];

        let shouldUpdate = false;

        const thisUsername = this.getUsername();
        if (!usernames.includes(thisUsername)) {
            usernames.push(thisUsername);
            shouldUpdate = true;
        }

        if (auth) {
            usernames.push(_auth.getFields().username);
            shouldUpdate = true;
        }

        if (shouldUpdate) {
            orgConfig.set('usernames', usernames);
            await orgConfig.write();
        }
        return this;
    }

    /**
     * Removes a username from the user config for this object.
     * @param {AuthInfo | string} auth The AuthInfo containing the username to remove.
     * @returns {Promise<Org>} For convenience `this` object is returned.
     * @throws {SfdxError} **`{name: 'MissingAuthInfo'}`** Auth info is missing.
     */
    public async removeUsername(auth: AuthInfo | string): Promise<Org> {
        if (!auth) {
            throw new SfdxError('Missing auth info', 'MissingAuthInfo');
        }

        const _auth: AuthInfo = _isString(auth) ? await AuthInfo.create(auth) : auth;

        this.logger.debug(`removing username ${_auth.getFields().username}`);

        const orgConfig: OrgUsersConfig = await this.retrieveOrgUsersConfig();

        const contents: ConfigContents = await orgConfig.read();

        const targetUser = _auth.getFields().username;
        contents.set('usernames', _filter(contents.get('usernames') as string[], (username) => username !== targetUser));

        await orgConfig.write();
        return this;
    }

    /**
     * Retrieves the highest api version that is supported by the target server instance. If the apiVersion configured for
     * Sfdx is greater than the one returned in this call an api version mismatch occurs. In the case of the CLI that
     * results in a warning.
     * @returns {Promise<string>} The max api version number, i.e `46.0`.
     */
    public async retrieveMaxApiVersion(): Promise<string> {
        return await this.getConnection().retrieveMaxApiVersion();
    }

    /**
     * Returns the admin username used to create the org.
     * @return {string}
     */
    public getUsername(): string {
        return this.getConnection().getUsername();
    }

    /**
     * Returns the orgId for this org.
     * @return {string}
     */
    public getOrgId(): string {
        return this.getField(OrgFields.ORG_ID) as string;
    }

    /**
     * Returns for the config aggregator.
     * @returns {ConfigAggregator}
     */
    public getConfigAggregator(): ConfigAggregator {
        return this.configAggregator;
    }

    /**
     * Returns an org field. Returns undefined if the field is not set or invalid.
     * @returns {AnyJson}
     */
    public getField(key: OrgFields): AnyJson {
        return this[key] || this.getConnection().getAuthInfoFields()[key];
    }

    /**
     * Returns a map of requested fields.
     * @returns {Dictionary<AnyJson>}
     */
    public getFields(keys: OrgFields[]): Dictionary<AnyJson> {
        return keys.reduce((map, key) => { map[key] = this.getField(key); return map; }, {});
    }

    /**
     * Returns the JSForce connection for the org.
     * @returns {Connection}
     */
    public getConnection(): Connection {
        return this.connection;
    }

    /**
     * Sets the JSForce connection to use for this org.
     * @param {Connection} connection The connection to use.
     * @returns {Org} For convenience `this` object is returned.
     * @throws {SfdxError} **`{name: 'UndefinedConnection'}`** The connection was not defined.
     * @see {@link http://jsforce.github.io/jsforce/doc/Connection.html}
     */
    private setConnection(connection: Connection): Org {
        if (connection) {
            this.connection = connection;
            return this;
        } else {
            throw new SfdxError('Connection not specified', 'UndefinedConnection');
        }
    }
}
