/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from './connection';
import { Logger } from './logger';
import { RequestInfo, RequestMethod } from 'jsforce';
import * as _ from 'lodash';
import { AuthInfo } from './authInfo';

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
    public static async create(): Promise<Org> {
        const org = new Org();

        org.logger = await Logger.child('Org');

        return org;
    }

    private logger: Logger;
    private connection: Connection;
    private status: OrgStatus = OrgStatus.UNKNOWN;

    private constructor() {}

    /**
     * Set the jsforce connection to use for this org.
     * @param {Connection} connection The connection to use.
     * @returns {Org} - Returns "this" instance.
     */
    public setConnection(connection: Connection): Org {
        if (connection) {
            this.connection = connection;
            return this;
        } else {
            throw new Error('Connection not specified.');

        }
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
            const devHubUsernameForgOrg = metaInfo.info.getConnectionOptions().devHubUsername;
            const devHub = !_.isNil(devHubUsernameForgOrg) ? devhubMetas.get(devHubUsernameForgOrg) : null;

            // this means we know we have a scratch org, but no dev hub is providing ownership.
            // the org is likely gone. this could also mean the dev hub this auth file is
            // associated with, hasn't been locally authorized.
            if (metaInfo.devHubMissing) {
                this.status = _.isNil(devHubUsernameForgOrg) || _.isNil(devHub) ? OrgStatus.UNKNOWN : OrgStatus.MISSING;
            }
        }
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

        return _.maxBy(versions, (_ver: any) => _ver.version);
    }
}
