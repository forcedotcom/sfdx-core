/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AuthFields, AuthInfo} from '../../lib/authInfo';
import { Connection } from '../../lib/connection';
import { Org, OrgMetaInfo, OrgStatus } from '../../lib/org';
import { OAuth2, RequestInfo } from 'jsforce';

import { expect } from 'chai';
import {SfdxConfigAggregator} from '../../lib/config/sfdxConfigAggregator';

class MockAuthInfo extends AuthInfo {

    private _fields: Partial<AuthFields> = {};

    constructor(username) {
        super(username);
        this._fields.username = username;
    }

    public setDevHubUsername(username): MockAuthInfo {
        this._fields.devHubUsername = username;
        return this;
    }

    public getConnectionOptions(): Partial<AuthFields> {
        return {
            instanceUrl: 'http://sfdxtest.instance.salesforce.com',
            devHubUsername: this._fields.devHubUsername,
            username: this._fields.username
        };
    }
}

class MockConnection extends Connection {
    public static apiVersion = '90.0';

    constructor() {
        super({ loginUrl: 'http://sfdxtest.login.salesforce.com'}, new MockAuthInfo('test@example.com'));
    }

    public async request(request: RequestInfo | string, options?): Promise<any> {
        return [{ version: '89.0' }, { version: MockConnection.apiVersion }, { version: '88.0' }];
    }
}

describe('Org Tests', () => {
    describe('retrieveMaxApiVersion', () => {

        it('no username', async () => {

            const org: Org = await Org.create(new MockConnection());

            const apiVersion = await org.retrieveMaxApiVersion();
            expect(apiVersion).has.property('version', MockConnection.apiVersion);
        });

    });

    describe('computeAndUpdateStatusForMetaConfig', () => {

        it('Missing status', async () => {

            const testDevHubUsername = 'admin2@gb.org';
            const devHubMeta: OrgMetaInfo = {
                info: new MockAuthInfo(testDevHubUsername), devHubMissing: false, expired: false
            };

            const testOrgUsername = 'apparition@gb.org';
            const scratchOrgMeta: OrgMetaInfo = {
                info: new MockAuthInfo(testOrgUsername).setDevHubUsername(testDevHubUsername),
                devHubMissing: true,
                expired: false
            };

            const devHubMetaMap: Map<string, OrgMetaInfo> = new Map();
            devHubMetaMap.set(testDevHubUsername, devHubMeta);

            const org: Org = await Org.create(new MockConnection());
            org.computeAndUpdateStatusFromMetaInfo(scratchOrgMeta, devHubMetaMap);
            expect(org).to.have.property('status', OrgStatus.MISSING);
        });

        it('Unknown status', async () => {
            const testOrgUsername = 'apparition@gb.org';
            const scratchOrgMeta: OrgMetaInfo = {
                info: new MockAuthInfo(testOrgUsername), devHubMissing: true, expired: false
            };

            const testName = 'devhub@gb.org';
            const devHubMetaMap: Map<string, OrgMetaInfo> = new Map();
            const devHubMeta: OrgMetaInfo = {
                info: new MockAuthInfo('devhub@gb.org'), devHubMissing: false, expired: false
            };
            devHubMetaMap.set(testName, devHubMeta);

            const org: Org = await Org.create(new MockConnection());
            org.computeAndUpdateStatusFromMetaInfo(scratchOrgMeta, devHubMetaMap);
            expect(org).to.have.property('status', OrgStatus.UNKNOWN);
        });
    });

    describe('getName', () => {
        it('should return default username', () => {});
    });
});
