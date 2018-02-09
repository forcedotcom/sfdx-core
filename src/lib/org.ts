/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { map as _map } from 'lodash';

import { join as pathJoin } from 'path';
import { Connection } from './connection';
import { Logger } from './logger';
import { RequestInfo, RequestMethod } from 'jsforce';
import { SfdxConfig } from './config/sfdxConfig';
import { isNil as _isNil , maxBy as _maxBy } from 'lodash';
import { AuthInfo } from './authInfo';
import { Global} from './global';

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

/**
 * Manage ScratchOrg meta information
 */
export class Org {

    /**
     * Static initializer to create an org instance.
     * @returns {Promise<Org>}
     */
    public static async create(connection: Connection): Promise<Org> {
        const org = new Org();

        org.logger = await Logger.child('Org');
        org.setConnection(connection);
        return org;
    }

    private logger: Logger;
    private connection: Connection;
    private status: OrgStatus = OrgStatus.UNKNOWN;

    private constructor() {}

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
            const devHubUsernameForgOrg = metaInfo.info.getConnectionOptions().devHubUsername;
            const devHub = !_isNil(devHubUsernameForgOrg) ? devhubMetas.get(devHubUsernameForgOrg) : null;

            // this means we know we have a scratch org, but no dev hub is providing ownership.
            // the org is likely gone. this could also mean the dev hub this auth file is
            // associated with, hasn't been locally authorized.
            if (metaInfo.devHubMissing) {
                this.status = _isNil(devHubUsernameForgOrg) || _isNil(devHub) ? OrgStatus.UNKNOWN : OrgStatus.MISSING;
            }
        }
    }

    public getDataPath(filename?: string): string {
        return pathJoin(...['orgs', this.getName(), filename].filter((e) => !!e));
    }

    /**
     * Clean all data files in the org's data path, then remove the data directory.
     * Usually <workspace>/.sfdx/orgs/<username>
     */
    public async cleanData(orgDataPath: string): Promise<void> {
        let dataPath;
        try {
            dataPath = pathJoin(SfdxConfig.getRootFolder(), Global.STATE_FOLDER, orgDataPath || this.getDataPath());
        } catch (err) {
            if (err.name === 'InvalidProjectWorkspace') {
                // If we aren't in a project dir, we can't clean up data files.
                // If the user deletes this org outside of the workspace they used it in,
                // data files will be left over.
                return;
            }
            throw err;
        }

        const dirListing: string[] = await SfdxConfig.readdir(dataPath);

        dirListing = _map(dirListing, (file) => pathJoin(dataPath, file));
        dirListing = _map(dirListing, (file) => )

        const removeDir = (dirPath) => {
            let stats;

            try {
                stats = fs.readdirSync(dirPath)
                    .map(file => path.join(dirPath,file))
                    .map(filePath => ({ filePath, stat: fs.statSync(filePath) }));

                stats.filter(({ stat }) => stat.isDirectory()).forEach(({ filePath }) => removeDir(filePath));
                stats.filter(({ stat }) => stat.isFile()).forEach(({ filePath }) => fs.unlinkSync(filePath));

                fs.rmdirSync(dirPath);
            } catch (err) {
                this.logger.warn(`failed to read directory ${dirPath}`);
            }
        };

        removeDir(dataPath);
    }


    /**
     * Get the full path to the file storing the maximum revision value from the last valid pull from workspace scratch org
     * @param wsPath - The root path of the workspace
     * @returns {*}
     */
    getMaxRevision() {
        return new StateFile(this.config, this.getDataPath('maxrevision.json'));
    }

    /**
     * Get the full path to the file storing the workspace source path information
     * @param wsPath - The root path of the workspace
     * @returns {*}
     */
    getSourcePathInfos() {
        return new StateFile(this.config, this.getDataPath('sourcePathInfos.json'));
    }

    /**
     * Get the full path to the file storing the workspace metadata typeDefs
     * @param wsPath - The root path of the workspace
     * @returns {*}
     */
    getMetadataTypeInfos() {
        return new StateFile(this.config, this.getDataPath('metadataTypeInfos.json'));
    }

    /**
     * Removes the scratch org config file at $HOME/.sfdx/[name].json, any project level org
     * files, all user auth files for the org, matching default config settings, and any
     * matching aliases.
     */
    deleteConfig() {

        // If deleting via the access token there shouldn't be any auth config files
        // so just return;
        if (this.usingAccessToken) {
            return Promise.resolve();
        }

        let orgFileName;
        const aliases = [];

        // If the org being deleted is the workspace org then we need to do this so that subsequent calls to the
        // cli won't fail when trying to retrieve scratch org info from ~/.sfdx
        const cleanup = (name) => {
            let alias;
            return Alias.byValue(name)
                .then(_alias => {
                    alias = _alias;
                    _alias && aliases.push(_alias);
                })
                .then(() => this.resolvedAggregator())
                .then(aggregator => {
                    // Get the aggregated config for this type of org
                    const info = aggregator.getInfo(this.type);

                    // We only want to delete the default if it is in the local or global
                    // config file. i.e. we can't delete an env var.
                    if ((info.value === name || info.value === alias) && (info.isGlobal() || info.isLocal())) {
                        // Pass in undefined to unset it
                        return SfdxConfig.set(info.isGlobal(), this.type);
                    }
                    return Promise.resolve();
                })
                .then(() => this.cleanData(path.join('orgs', name)))
                .then(() => srcDevUtil.deleteGlobalConfig(`${name}.json`));
        };

        return this.getConfig()
            .then(orgData => {
                orgFileName = `${orgData.orgId}.json`;
                return srcDevUtil.getGlobalConfig(orgFileName, {});
            })
            .then(({ usernames }) => {
                if (!usernames) {
                    usernames = [this.getName()];
                    orgFileName = null;
                }
                return usernames;
            })
            .then((usernames) => {
                this.logger.info(`Cleaning up usernames: ${usernames} in org: ${this.authConfig.orgId}`);
                return Promise.all(usernames.map(username => cleanup(username)));
            })
            .then(() => Alias.unset(aliases))
            .then(() => {
                if (orgFileName) {
                    return srcDevUtil.deleteGlobalConfig(orgFileName);
                }
                return Promise.resolve();
            });
    }

    getFileName() {
        return `${this.name}.json`;
    }

    /**
     *  Check that this org is a scratch org by asking the dev hub if it knows about this org.
     *  @param devHubUsername - the username of the dev hub org
     *  @returns {Promise<Config>}
     */
    checkScratchOrg(devHubUsername) {
        return this.getConfig().then(config => {
            let hubOrgPromise;
            // If we know the hub org from the auth, use that instead and ignore
            // the flag and defaults.
            if (config.devHubUsername) {
                hubOrgPromise = Org.create(config.devHubUsername);
            } else {
                hubOrgPromise = Org.create(devHubUsername, Org.Defaults.DEVHUB);
            }

            return hubOrgPromise
                .catch(err => {
                    err.action = messages.getMessage('action', [], 'generatePassword');
                    throw err;
                })
                .then(hubOrg => srcDevUtil.queryOrgInfoFromDevHub(hubOrg, config.orgId)
                    .then((results = {}) => {
                        // If no results, org is not associated with the devhub
                        if (_.get(results, 'records.length') !== 1) {
                            return hubOrg.getConfig().then(hubConfig => {
                                throw almError({ keyName: 'notFoundOnDevHub', bundle: 'generatePassword' }, [hubConfig.username], { keyName: 'action', bundle: 'generatePassword' });
                            });
                        }
                        return Promise.resolve(config);
                    })
                    .catch(err => {
                        if (err.name === 'INVALID_TYPE') {
                            return hubOrg.getConfig().then(hubConfig => {
                                throw almError({ keyName: 'notADevHub', bundle: 'generatePassword' }, [hubConfig.username], { keyName: 'action', bundle: 'generatePassword' });
                            });

                        }
                        throw err;
                    })
                );
        });
    }

    /**
     * Returns Org object representing this org's Dev Hub org.
     *
     *  @returns {Org} - Org object or null if org is not affiliated to a Dev Hub (according to local config).
     */
    getDevHubOrg() {
        return this.getConfig()
            .then((orgData) => {
                let org = null;

                if (orgData.isDevHub) {
                    org = this;
                } else if (orgData.devHubUsername) {
                    org = Org.create(orgData.devHubUsername, Org.Defaults.DEVHUB);
                }

                return org;
            });
    }

    /**
     * Returns true if org if a Dev Hub.
     *
     *  @returns Boolean
     */
    isDevHubOrg() {
        return this.getConfig()
            .then((orgData) => orgData.isDevHub);
    }

    /**
     * Refresh a users access token.
     * @returns {*|Promise.<{}>}
     */
    refreshAuth() {
        return this.force.describeData(this);
    }


    /**
     *  Reads and returns the global, hidden org file in $HOME/.sfdx for this org.
     *    E.g., $HOME/.sfdx/00Dxx0000001gPFEAY.json
     *  @returns {Object} - The contents of the org file, or an empty object if not found.
     */
    readOrgFile() {
        return this.getConfig().then(orgData => srcDevUtil.getGlobalConfig(`${orgData.orgId}.json`, {}));
    }

    /**
     *  Reads and returns the content of all user auth files for this org.
     *  @returns {Array} - An array of all user auth file content.
     */
    readUserAuthFiles() {
        return this.readOrgFile()
            .then(({ usernames }) => usernames || [this.name])
            .map((username) => srcDevUtil.getGlobalConfig(`${username}.json`));
    }


    /**
     * Retrieves the highest api version that is supported by the target server instance. If the apiVersion configured for
     * Sfdx is greater than the one returned in this call an api version mismatch occurs. In the case of the CLI that
     * results in a warning
     * @returns {Promise<string>} The max api version number. i.i 46.0
     */
    public async retrieveMaxApiVersion(): Promise<string> {

        const url: string = `${this.connection.getAuthInfo().getConnectionOptions().instanceUrl}/services/data`;

        const info: RequestInfo = { method: 'GET', url };

        const versions = await this.connection.request(info);

        return _maxBy(versions, (_ver: any) => _ver.version);
    }

    public getName(): string {
        return this.connection.getAuthInfo().username;
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
