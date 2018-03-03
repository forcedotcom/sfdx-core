/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { join as pathJoin } from 'path';
import { Aliases } from './config/aliases';
import { Connection } from './connection';
import { Logger } from './logger';
import { RequestInfo } from 'jsforce';
import { SfdxConfig } from './config/sfdxConfig';
import { SfdxConfigAggregator, ConfigInfo } from './config/sfdxConfigAggregator';
import { isNil as _isNil , maxBy as _maxBy, get as _get, filter as _filter, isString as _isString } from 'lodash';
import { AuthFields, AuthInfo } from './authInfo';
import { Global} from './global';
import { SfdxUtil } from './util';
import { OrgUsersConfig } from './config/orgUsersConfig';
import { SfdxError } from './sfdxError';

/**
 * Org status
 * ACTIVE  - The Scratch Org is active
 * EXPIRED - The scratch org has expired
 * UNKNOWN - The org is a Scratch Org but no dev hub is indicated
 * MISSING - The dev hub configuration is reporting an active scratch org but the AuthInfo cannot be found.
 */
export enum OrgStatus {
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    UNKNOWN = 'UNKNOWN',
    MISSING = 'MISSING'
}

/**
 * Additional information tracked for the org.
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
 * Manage Org meta information
 */
export class Org {

    /**
     * Static initializer that allows creating an instance of an org from a alias or a plain string username. If no
     * username or alias is provided then the defaultusername is used. If isDevHub is true then the defaultdevhub is used.
     * @param {string} aliasOrUsername - The string alias or username
     * @param {SfdxConfigAggregator} aggregator - optional config aggregator
     * @param {boolean} isDevHub - optional - true if this org is a devhub. defaults to false
     * @return {Promise<Org>}
     */
    public static async create(aliasOrUsername?: string, aggregator?: SfdxConfigAggregator, isDevHub?: boolean): Promise<Org>;

    /**
     * Static initializer that allows creating an instance of an org from a Connection object
     * @param {Connection} connection - The connection
     * @param {SfdxConfigAggregator} aggregator - optional config aggregator
     * @param {boolean} isDevHub - optional - true if this org is a devhub. defaults to false
     * @return {Promise<Org>}
     */
    // tslint:disable-next-line:unified-signatures
    public static async create(connection?: Connection, aggregator?: SfdxConfigAggregator, isDevHub?: boolean): Promise<Org>;

    public static async create(connection: string | Connection, aggregator?: SfdxConfigAggregator, isDevHub?: boolean): Promise<Org> {
        const _aggregator = aggregator ? aggregator : await SfdxConfigAggregator.create();

        const org = new Org(_aggregator);

        org.logger = await Logger.child('Org');

        let _connection: Connection;

        if (_isString(connection)) {
            org.logger.debug('connection type is string');
            const aliasValue: string = await Aliases.fetch(connection);
            _connection = await Connection.create(
                await AuthInfo.create(aliasValue || connection));
        } else {
            _connection = connection;
        }

        if (!_connection) {
            org.logger.debug('No connection specified. Trying default configurations');
            const username: string = isDevHub ?
                _aggregator.getInfo(SfdxConfig.DEFAULT_DEV_HUB_USERNAME).value as string :
                _aggregator.getInfo(SfdxConfig.DEFAULT_USERNAME).value as string;

            if (username) {
                _connection = await Connection.create(await AuthInfo.create(username));
            } else {
                throw new SfdxError(`No ${isDevHub ? 'default Devhub' : 'default' } username or Connection found.`, 'NoUsername' );
            }
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
    private _usingAccessToken: boolean = false;

    private constructor(_aggregator: SfdxConfigAggregator) {
        this.configAggregator = _aggregator;
    }

    /**
     * Determines the value of the status field.
     * @param {OrgMetaInfo} metaInfo - the scratchOrg which will have the status updated.
     * @param {Map<string, AuthInfo>} devhubMetas - a map of devhub metadata found locally keyed by username
     */
    public computeAndUpdateStatusFromMetaInfo(metaInfo: OrgMetaInfo, devhubMetas: Map<string, OrgMetaInfo>) {
        if (metaInfo) {
            if (metaInfo.expired) {
                this.status = OrgStatus.EXPIRED;
            }

            // Get the devhub username from the org meta info;
            const devHubUsernameForOrg = metaInfo.info.getFields().devHubUsername;
            const devHub = !_isNil(devHubUsernameForOrg) ? devhubMetas.get(devHubUsernameForOrg) : null;

            // this means we know we have a scratch org, but no dev hub is providing ownership.
            // the org is likely gone. this could also mean the dev hub this auth file is
            // associated with, hasn't been locally authorized.
            if (metaInfo.devHubMissing) {
                this.status = _isNil(devHubUsernameForOrg) || _isNil(devHub) ? OrgStatus.UNKNOWN : OrgStatus.MISSING;
            }
        }
    }

    /**
     * Clean all data files in the org's data path, then remove the data directory.
     * Usually <workspace>/.sfdx/orgs/<username>
     * @param {string} orgDataPath
     * @returns {Promise<void>}
     */
    public async cleanData(orgDataPath?: string, throwWhenRemoveFails: boolean = false): Promise<void> {
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
     * @returns {boolean} -  Returns true if this org is using access token auth.
     */
    public isUsingAccessToken(): boolean {
        return this._usingAccessToken;
    }

    /**
     * Removes the scratch org config file at $HOME/.sfdx/[name].json, any project level org
     * files, all user auth files for the org, matching default config settings, and any
     * matching aliases.
     */
    public async remove(throwWhenRemoveFails?: false): Promise<void> {

        // If deleting via the access token there shouldn't be any auth config files
        // so just return;
        if (this.isUsingAccessToken()) {
            return Promise.resolve();
        }

        const auths: AuthInfo[] = await this.readUserAuthFiles();
        const aliases: Aliases = await Aliases.retrieve<Aliases>();
        this.logger.info(`Cleaning up usernames in org: ${this.getOrgId()}`);

        for (const auth of auths) {
            const username = auth.getFields().username;

            const alias = aliases.get(username);

            if (alias) {
                aliases.unset(username);
            }

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

            if ((configInfo.value === username || configInfo.value === alias) &&
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
     *  Check that this org is a scratch org by asking the dev hub if it knows about this org.
     *  @param devHubUsername - the username of the dev hub org
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
     * Returns Org object representing this org's Dev Hub org.
     *
     *  @returns {Org} - Org object or null if org is not affiliated to a Dev Hub (according to local config).
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
     * @returns Boolean - Returns true if org if a Dev Hub.
     */
    public isDevHubOrg(): boolean {
        return this.getConnection().getAuthInfo().getFields().isDevHub;
    }

    /**
     * Refreshes the auth for this org instance by calling the baseUrl on the connection object.
     * @returns {Promise<any>} - Refresh a users access token.
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
     *  @returns {Array} - An array of all user auth file content.
     */
    public async readUserAuthFiles(): Promise<AuthInfo[]> {
        const config: OrgUsersConfig = await this.retrieveOrgUsersConfig();
        const contents: any = await config.read();
        const thisUsername = this.getConnection().getAuthInfo().getFields().username;
        const usernames: string[] = contents.usernames || [thisUsername];
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
     * @param {AuthInfo} auth - The AuthInfo for the username to add.
     * @returns {Promise<Org>} - This Org
     */
    public async addUsername(auth: AuthInfo): Promise<Org> {

        if (!auth) {
            throw new SfdxError('Missing auth info', 'MissingAuthInfo');
        }

        this.logger.debug(`adding username ${auth.getFields().username}`);

        const orgConfig: OrgUsersConfig = await this.retrieveOrgUsersConfig();

        const contents: any = await orgConfig.read();

        if (!contents.usernames) {
            contents.usernames = [];
        }

        let shouldUpdate = false;

        const thisUsername = this.getConnection().getAuthInfo().getFields().username;
        if (!contents.usernames.includes(thisUsername)) {
            contents.usernames.push(thisUsername);
            shouldUpdate = true;
        }

        if (auth) {
            contents.usernames.push(auth.getFields().username);
            shouldUpdate = true;
        }

        if (shouldUpdate) {
            await orgConfig.write(contents);
        }
        return this;
    }

    /**
     * Removes a username from the user config for this object
     * @param {AuthInfo} auth - The AuthInfo containing the username to remove
     * @returns {Promise<Org>} - This Org
     */
    public async removeUsername(auth: AuthInfo): Promise<Org> {
        if (!auth) {
            throw new SfdxError('Missing auth info', 'MissingAuthInfo');
        }

        this.logger.debug(`removing username ${auth.getFields().username}`);

        const orgConfig: OrgUsersConfig = await this.retrieveOrgUsersConfig();

        const contents: any = await orgConfig.read();

        const targetUser = auth.getFields().username;
        contents.usernames = _filter(contents.usernames, (username) => username !== targetUser);

        await orgConfig.write(contents);
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
     * Return the username for the org.
     * @return {string} - The username
     */
    public getUsername(): string {
        return this.getMetaInfo().info.getFields().username;
    }

    /**
     * Returns the orgId for this org
     * @return {string} - The org Id
     */
    public getOrgId(): string {
        return this.getMetaInfo().info.getFields().orgId;
    }

    /**
     * Set indcator if this org is using access token authentication.
     * @param {boolean} value - Return true if this org should us access token authentication. False otherwise.
     * @returns {Org} - This org instance
     */
    public setUsingAccessToken(value: boolean) {
        this._usingAccessToken = value;
        return this;
    }

    /**
     * Getter for the config aggregator
     * @returns {SfdxConfigAggregator} The config aggregator
     */
    public getConfigAggregator(): SfdxConfigAggregator {
        return this.configAggregator;
    }

    /**
     * returns Meta information about this org
     * @returns {OrgMetaInfo} - OrgMetaInformation
     */
    public getMetaInfo(): OrgMetaInfo {
        return {
            info: this.getConnection().getAuthInfo()
        };
    }

    /**
     * @returns {Connection} - Getter for the JSforce connection for the org.
     */
    public getConnection(): Connection {
        return this.connection;
    }

    /**
     * Set the jsforce connection to use for this org.
     * @param {Connection} connection The connection to use.
     * @returns {Org} - Returns "this" instance.
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
