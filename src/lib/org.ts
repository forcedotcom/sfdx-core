/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { join as pathJoin } from 'path';
import { Alias } from './alias';
import { Connection } from './connection';
import { Logger } from './logger';
import { RequestInfo } from 'jsforce';
import { SfdxConfig } from './config/sfdxConfig';
import { SfdxConfigAggregator, ConfigInfo } from './config/sfdxConfigAggregator';
import { isNil as _isNil , maxBy as _maxBy, get as _get, filter as _filter } from 'lodash';
import { AuthFields, AuthInfo } from './authInfo';
import { Global} from './global';
import { SfdxUtil } from './util';
import { OrgConfigFile, OrgConfigType } from './config/orgConfigFile';
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
    devHubMissing: boolean;

    /**
     * True if this org has expired.
     */
    expired: boolean;
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
 * Manage ScratchOrg meta information
 */
export class Org {

    /**
     * Static initializer to create an org instance.
     * @returns {Promise<Org>}
     */
    public static async create(connection: Connection): Promise<Org> {

        const org = new Org(await SfdxConfigAggregator.create());

        org.logger = await Logger.child('Org');
        org.setConnection(connection);
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

    public setConfigAggregator(configAggregator: SfdxConfigAggregator): Org {
        this.configAggregator = configAggregator;
        return this;
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

    public getDataPath(filename?: string): string {
        return pathJoin(...[OrgConfigFile.ORGS_FOLDER_NAME, this.getName(), filename].filter((e) => !!e));
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
            dataPath = pathJoin(rootFolder, Global.STATE_FOLDER, orgDataPath || this.getDataPath());
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

    /**
     * @returns {Promise<object>} - A promise for an object that contains the max revision.
     */
    public async retrieveMaxRevisionConfig(): Promise<OrgConfigFile> {
        return OrgConfigFile.create(OrgConfigType.MAX_REVISION, this.getName());
    }

    /**
     * @returns {Promise<object>} - A promise for an object containing the source path state
     */
    public async retrieveSourcePathInfosConfig(): Promise<OrgConfigFile> {
        return OrgConfigFile.create(OrgConfigType.SOURCE_PATH_INFOS, this.getName());
    }

    /**
     * Get the full path to the file storing the workspace metadata typeDefs
     * @returns {Promise<object>} - A promise for an object containing the source path state
     */
    public async retrieveMetadataTypeInfosConfig(): Promise<OrgConfigFile> {
        return OrgConfigFile.create(OrgConfigType.METADATA_TYPE_INFOS, this.getName());
    }

    public async retrieveOrgUsersConfig(): Promise<OrgConfigFile> {
        return OrgConfigFile.create(OrgConfigType.USERS,
            this.getConnection().getAuthInfo().getFields().orgId);
    }

    /**
     * @returns {boolean} -  Returns true if this org is using access token auth.
     */
    public getUsingAccessToken(): boolean {
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
        if (this.getUsingAccessToken()) {
            return Promise.resolve();
        }

        const aliases = [];

        const auths: AuthInfo[] = await this.readUserAuthFiles();

        this.logger.info(`Cleaning up usernames in org: ${this.getConnection().getAuthInfo().getFields().orgId}`);

        for (const auth of auths) {
            const username = auth.getFields().username;

            const alias = await Alias.fetchName(username);

            if (alias) {
                aliases.push(alias);
            }

            let orgForUser;
            if (username === this.getConnection().getAuthInfo().getFields().username) {
                orgForUser = this;
            } else {
                const _info = await AuthInfo.create(username);
                const connection = await Connection.create(_info);
                orgForUser = await Org.create(connection);
            }

            const orgType = await this.isDevHubOrg() ? SfdxConfig.DEFAULT_DEV_HUB_USERNAME : SfdxConfig.DEFAULT_USERNAME;

            const configInfo: ConfigInfo = await orgForUser.configAggregator.getInfo(orgType);

            if ((configInfo.value === username || configInfo.value === alias) &&
                (configInfo.isGlobal() || configInfo.isLocal())) {

                await SfdxConfig.setPropertyValue(configInfo.isGlobal() as boolean, orgType, undefined,
                    this.configAggregator.getRootPathRetriever());
            }

            // Probably a good idea to let ConfigFile delete these before deleting Orgs/<orgname>
            const sourceConfig: OrgConfigFile = await this.retrieveSourcePathInfosConfig();
            _manageDelete.call(this, async () => await sourceConfig.unlink(), sourceConfig.getPath(),
                throwWhenRemoveFails);

            const mdTypeConfig: OrgConfigFile = await this.retrieveMetadataTypeInfosConfig();
            _manageDelete.call(this, async () => await mdTypeConfig.unlink(), mdTypeConfig.getPath(),
                throwWhenRemoveFails);

            const maxRevision: OrgConfigFile = await this.retrieveMaxRevisionConfig();
            _manageDelete.call(this, async () => await maxRevision.unlink(), maxRevision.getPath(),
                throwWhenRemoveFails);

            const orgUsers: OrgConfigFile = await this.retrieveOrgUsersConfig();
            _manageDelete.call(this, async () => await orgUsers.unlink(), orgUsers.getPath(),
                throwWhenRemoveFails);

            // Now delete the parent folder named after the org
            await orgForUser.cleanData(pathJoin(OrgConfigFile.ORGS_FOLDER_NAME, username));
        }

        return await Alias.unset(aliases);
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

        const DEV_HUB_SOQL = `SELECT CreatedDate,Edition,ExpirationDate FROM ActiveScratchOrg WHERE ScratchOrg=\'${thisOrgAuthConfig.orgId}\'`;

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

        const orgData = this.getConnection().getAuthInfo().getFields();

        if (this.isDevHubOrg()) {
            return this;
        } else if (orgData.devHubUsername) {
            return Org.create(await Connection.create(await AuthInfo.create(orgData.username)));
        }
    }

    /**
     * @returns Boolean - Returns true if org if a Dev Hub.
     */
    public isDevHubOrg(): boolean {
        return this.getConnection().getAuthInfo().getConnectionOptions().isDevHub;
    }

    /**
     * @returns {Promise<any>} - Refresh a users access token.
     */
    public async refreshAuth(): Promise<any> {
        const requestInfo = {
            url: this.getConnection().baseUrl(),
            method: 'GET'
        };
        return this.getConnection().request(requestInfo);
    }

    /**
     *  Reads and returns the content of all user auth files for this org.
     *  @returns {Array} - An array of all user auth file content.
     */
    public async readUserAuthFiles(): Promise<AuthInfo[]> {
        const config: OrgConfigFile = await this.retrieveOrgUsersConfig();
        const contents: any = await config.readJSON();
        const usernames: string[] = contents.usernames || [this.getConnection().getAuthInfo().getConnectionOptions().username];
        return Promise.all(usernames.map((username) => {
            if (username === this.getConnection().getAuthInfo().getConnectionOptions().username) {
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

        const orgConfig: OrgConfigFile = await this.retrieveOrgUsersConfig();

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
        const orgConfig: OrgConfigFile = await this.retrieveOrgUsersConfig();

        const contents: any = await orgConfig.read();

        const targetUser = auth.getConnectionOptions().username;
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

        return _maxBy(versions, (_ver: any) => _ver.version);
    }

    public getName(): string {
        return this.getConnection().getAuthInfo().username;
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
     * @returns {Connection} - Getter for the JSforce connection for the org.
     */
    protected getConnection(): Connection {
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
            throw new Error('Connection not specified.');
        }
    }
}
