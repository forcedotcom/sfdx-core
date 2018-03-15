/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Scratch Org status.
 * @typedef OrgStatus
 * @property ACTIVE {string} The scratch org is active.
 * @property EXPIRED {string} The scratch org has expired.
 * @property UNKNOWN {string} The org is a scratch Org but no dev hub is indicated.
 * @property MISSING {string} The dev hub configuration is reporting an active Scratch org but the AuthInfo cannot be found.
 */

import { join as pathJoin } from 'path';
import { Aliases } from './config/aliases';
import { Connection } from './connection';
import { Logger } from './logger';
import { RequestInfo } from 'jsforce';
import { SfdxConfig } from './config/sfdxConfig';
import { SfdxConfigAggregator, ConfigInfo } from './config/sfdxConfigAggregator';
import { maxBy as _maxBy, get as _get, filter as _filter, isString as _isString } from 'lodash';
import { AuthFields, AuthInfo } from './authInfo';
import { Global} from './global';
import { SfdxUtil } from './util';
import { OrgUsersConfig } from './config/orgUsersConfig';
import { SfdxError } from './sfdxError';

export enum OrgStatus {
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    UNKNOWN = 'UNKNOWN',
    MISSING = 'MISSING'
}

/**
 * Additional information tracked for an org beyond what's provided by the local auth information.
 */
export interface OrgMetaInfo {

    /**
     * The auth info used for the org connection
     */
    info: AuthInfo;

    /**
     * If true the dev hub configuration is missing
     */
    devHubMissing?: boolean;

    /**
     * True if this org has expired.
     */
    expired?: boolean;
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
 * @see {@link SfdxConfig}
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
 */
export class Org {

    /**
     * Static initializer that allows creating an instance of an org from a alias or a plain string username. If no
     * username or alias is provided then the defaultusername is used. If isDevHub is true then the defaultdevhub is used.
     * @param {string} [aliasOrUsername] The string alias or username.
     * @param {SfdxConfigAggregator} [aggregator] optional config aggregator.
     * @param {boolean} [isDevHub] true if this org is a devhub. defaults to false.
     * @return {Promise<Org>}
     */
    public static async create(aliasOrUsername?: string, aggregator?: SfdxConfigAggregator, isDevHub?: boolean): Promise<Org>;

    /**
     * Static initializer that allows creating an instance of an org from a Connection object.
     * @param {Connection} [connection] The connection
     * @param {SfdxConfigAggregator} [aggregator] A config aggregator. (Optional)
     * @param {boolean} [isDevHub] True if this org is a devhub. defaults to false (Optional)
     * @return {Promise<Org>}
     */
    // tslint:disable-next-line:unified-signatures
    public static async create(connection?: Connection, aggregator?: SfdxConfigAggregator, isDevHub?: boolean): Promise<Org>;

    /**
     * Static initializer that allows creating an instance of an org from an alias, username, or Connection. If no identifier
     * is provided then the defaultusername is used. If isDevHub is true then the defaultdevhubusername is used.
     * @see {@link SfdxConfig}
     * @param {string | Connection} [connection] The string alias or username.
     * @param {SfdxConfigAggregator} [aggregator] optional config aggregator.
     * @param {boolean} [isDevHub] true if this org is a devhub. defaults to false.
     * @return {Promise<Org>}
     */
    public static async create(connection?: string | Connection, aggregator?: SfdxConfigAggregator, isDevHub?: boolean): Promise<Org> {
        const _aggregator = aggregator ? aggregator : await SfdxConfigAggregator.create();

        const org = new Org(_aggregator);

        org.logger = await Logger.child('Org');

        let _connection: Connection;

        if (!connection) {
            org.logger.debug('No connection specified. Trying default configurations');
            connection = isDevHub ?
                _aggregator.getInfo(SfdxConfig.DEFAULT_DEV_HUB_USERNAME).value as string :
                _aggregator.getInfo(SfdxConfig.DEFAULT_USERNAME).value as string;
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

        org.logger.debug(`connection created for org user: ${_connection.getAuthInfo().getFields().username}`);
        org.setConnection(_connection);
        return org;
    }

    private logger: Logger;
    private connection: Connection;
    // tslint:disable-next-line:no-unused-variable
    private status: OrgStatus = OrgStatus.UNKNOWN;
    private configAggregator: SfdxConfigAggregator;

    /**
     * **Do not directly construct instances of this class -- use {@link Org.create} instead.**
     *
     * @private
     * @constructor
     */
    private constructor(_aggregator: SfdxConfigAggregator) {
        this.configAggregator = _aggregator;
    }

    /**
     * Clean all data files in the org's data path.
     * Usually <workspace>/.sfdx/orgs/<username>
     * @param {string} [orgDataPath] - a relative path other than "orgs/"
     * @returns {Promise<void>}
     */
    public async cleanLocalOrgData(orgDataPath?: string, throwWhenRemoveFails: boolean = false): Promise<void> {
        let dataPath;
        try {
            const rootFolder: string = await SfdxConfig.resolveRootFolder(false);
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

        return _manageDelete.call(this, async () => await SfdxUtil.remove(dataPath), dataPath,
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
        if (this.getConnection().getAuthInfo().isUsingAccessToken()) {
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
            if (username === this.getConnection().getAuthInfo().getFields().username) {
                orgForUser = this;
            } else {
                const _info = await AuthInfo.create(username);
                const connection: Connection = await Connection.create(_info);
                orgForUser = await Org.create(connection);
            }

            const orgType = await this.isDevHubOrg() ? SfdxConfig.DEFAULT_DEV_HUB_USERNAME : SfdxConfig.DEFAULT_USERNAME;

            const configInfo: ConfigInfo = await orgForUser.configAggregator.getInfo(orgType);

            if ((configInfo.value === username || aliasKeys.includes(configInfo.value as string)) &&
                (configInfo.isGlobal() || configInfo.isLocal())) {

                await SfdxConfig.update(configInfo.isGlobal() as boolean, orgType, undefined);
            }

            const orgUsers: OrgUsersConfig = await this.retrieveOrgUsersConfig();
            _manageDelete.call(this, async () => await orgUsers.unlink(), orgUsers.getPath(),
                throwWhenRemoveFails);
        }

        await aliases.write();
    }

    /**
     *  Check that this org is a scratch org by asking the dev hub if it knows about it.
     *  @param {string} [devHubUsername] The username of the dev hub org.
     *  @returns {Promise<Config>}
     */
    public async checkScratchOrg(devHubUsername?: string): Promise<Partial<AuthFields>> {

        let targetDevHub: string | boolean = devHubUsername;
        if (!targetDevHub) {
            targetDevHub = this.configAggregator.getPropertyValue(SfdxConfig.DEFAULT_DEV_HUB_USERNAME);
        }

        const devHubConnection: any = await Connection.create(await AuthInfo.create(targetDevHub as string));

        const thisOrgAuthConfig: Partial<AuthFields> = this.getConnection().getAuthInfo().getFields();

        const trimmedId: string = SfdxUtil.trimTo15(thisOrgAuthConfig.orgId);

        const DEV_HUB_SOQL = `SELECT CreatedDate,Edition,ExpirationDate FROM ActiveScratchOrg WHERE ScratchOrg=\'${trimmedId}\'`;

        let results;
        try {
            results = await devHubConnection.query(DEV_HUB_SOQL);

        } catch (err) {
            if (err.name === 'INVALID_TYPE') {
                throw SfdxError.create('sfdx-core', 'org', 'notADevHub',
                    [devHubConnection.getAuthInfo().getFields().username]);
            }
            throw err;
        }

        if (_get(results, 'records.length') !== 1) {
            throw new SfdxError('No results', 'NoResults');
        }

        return thisOrgAuthConfig;
    }

    /**
     * Returns an Org object representing this org's dev hub.
     *
     * @returns {Promise<Org>}  Returns the Org object or null if this org is not affiliated with a Dev Hub
     * (according to the local config).
     */
    public async getDevHubOrg(): Promise<Org> {
        const orgData: OrgMetaInfo = this.getMetaInfo();

        if (this.isDevHubOrg()) {
            return Promise.resolve(this);
        } else if (orgData.info.getFields().devHubUsername) {
            return Org.create(await Connection.create(await AuthInfo.create(orgData.info.getFields().devHubUsername)));
        }
    }

    /**
     * Returns true if the org is a Dev Hub.
     * @returns {Boolean}
     */
    public isDevHubOrg(): boolean {
        return this.getConnection().getAuthInfo().getFields().isDevHub;
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
        await this.getConnection().request(requestInfo);
    }

    /**
     *  Reads and returns the content of all user auth files for this org.
     *  @returns {Promise<AuthInfo[]>} An array of all user auth file content.
     */
    public async readUserAuthFiles(): Promise<AuthInfo[]> {
        const config: OrgUsersConfig = await this.retrieveOrgUsersConfig();
        const contents: any = await config.read();
        const thisUsername = this.getConnection().getAuthInfo().getFields().username;
        const usernames: string[] = contents.get('usernames') || [thisUsername];
        return Promise.all(usernames.map((username) => {
            if (username === thisUsername) {
                return this.getConnection().getAuthInfo();
            } else {
                return AuthInfo.create(username);
            }
        }));
    }

    /**
     * Adds a username to the user config for this org.
     * @param {AuthInfo | string} auth The AuthInfo for the username to add.
     * @returns {Promise<Org>} This Org
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

        const contents: any = await orgConfig.read();
        const usernames = contents.get('usernames') || [];

        let shouldUpdate = false;

        const thisUsername = this.getConnection().getAuthInfo().getFields().username;
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
     * Removes a username from the user config for this object
     * @param {AuthInfo | string} auth - The AuthInfo containing the username to remove
     * @returns {Promise<Org>} - This Org
     */
    public async removeUsername(auth: AuthInfo | string): Promise<Org> {
        if (!auth) {
            throw new SfdxError('Missing auth info', 'MissingAuthInfo');
        }

        const _auth: AuthInfo = _isString(auth) ? await AuthInfo.create(auth) : auth;

        this.logger.debug(`removing username ${_auth.getFields().username}`);

        const orgConfig: OrgUsersConfig = await this.retrieveOrgUsersConfig();

        const contents: any = await orgConfig.read();

        const targetUser = _auth.getFields().username;
        contents.set('usernames', _filter(contents.get('usernames'), (username) => username !== targetUser));

        await orgConfig.write();
        return this;
    }

    /**
     * Retrieves the highest api version that is supported by the target server instance. If the apiVersion configured for
     * Sfdx is greater than the one returned in this call an api version mismatch occurs. In the case of the CLI that
     * results in a warning
     * @returns {Promise<string>} The max api version number. i.i 46.0
     */
    public async retrieveMaxApiVersion(): Promise<string> {

        const url: string = `${this.getConnection().getAuthInfo().getConnectionOptions().instanceUrl}/services/data`;

        const info: RequestInfo = { method: 'GET', url };

        const versions = await this.getConnection().request(info);

        this.logger.debug(`response for org versions: ${versions}`);

        return _maxBy(versions, (_ver: any) => _ver.version);
    }

    /**
     * Returns the admin username used to create the org.
     * @return {string}
     */
    public getUsername(): string {
        return this.getMetaInfo().info.getFields().username;
    }

    /**
     * Returns the orgId for this org.
     * @return {string}
     */
    public getOrgId(): string {
        return this.getMetaInfo().info.getFields().orgId;
    }

    /**
     * Getter for the config aggregator.
     * @returns {SfdxConfigAggregator}
     */
    public getConfigAggregator(): SfdxConfigAggregator {
        return this.configAggregator;
    }

    /**
     * Returns meta information about this org.
     * @returns {OrgMetaInfo}
     */
    public getMetaInfo(): OrgMetaInfo {
        return {
            info: this.getConnection().getAuthInfo()
        };
    }

    /**
     * Getter for the JSForce connection for the org.
     * @returns {Connection}
     */
    public getConnection(): Connection {
        return this.connection;
    }

    /**
     * Set the JSForce connection to use for this org.
     * @param {Connection} connection The connection to use.
     * @returns {Org} For convenience this object is returned.
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
