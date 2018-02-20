/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AuthInfo, AuthFields } from '../../lib/authInfo';
import { Connection } from '../../lib/connection';
import { Org, OrgMetaInfo, OrgStatus } from '../../lib/org';
import { OAuth2, RequestInfo } from 'jsforce';
import { expect, assert } from 'chai';
import { testSetup } from '../testSetup';
import { ConfigFile } from '../../lib/config/configFile';
import { AuthInfoConfigFile } from '../../lib/config/authInfoConfigFile';
import { KeyValueStore } from  '../../lib/config/fileKeyValueStore';
import { SfdxConfig } from '../../lib/config/sfdxConfig';
import { tmpdir as osTmpdir } from 'os';
import { join as pathJoin } from 'path';
import { SfdxUtil } from '../../lib/util';
import { Global } from '../../lib/global';
import { OrgConfigFile, OrgConfigType } from '../../lib/config/orgConfigFile';
import { ProjectDir } from '../../lib/projectDir';
import { SfdxConfigAggregator } from '../../lib/config/sfdxConfigAggregator';
import { Alias } from '../../lib/alias';
import { cloneDeep as _cloneDeep } from 'lodash';

const $$ = testSetup();

// Setup the test environment.

class MockTestOrgData {
    public testId: string;
    public alias: string;
    public username: string;
    public devHubUsername: string;
    public orgId: string;
    public loginUrl: string;
    public instanceUrl: string;

    constructor() {
        this.testId = $$.uniqid();
        this.orgId = `${this.testId}`;
        this.username = `admin_${this.testId}@gb.org`;
        this.loginUrl = `http://login.${this.testId}.salesforce.com`;
        this.instanceUrl = `http://instance.${this.testId}.salesforce.com`;
    }

    public createDevHubUsername(): void {
        this.devHubUsername = `admin_${this.testId}@gb.org`;
    }

    public createUser(user: string): MockTestOrgData {
        const userMock = _cloneDeep(this);
        this.intializeUser(user);
        return userMock;
    }

    private intializeUser(user: string) {
        this.username = `${user}_${this.testId}@gb.org`;
    }
}

class MockAuthInfo extends AuthInfo {
    public static readonly MOCK_ORG_ID = '18005552368';

    private _testData: MockTestOrgData;

    constructor(testData?: MockTestOrgData) {
        super(testData.username);
        this._testData = testData;
    }

    public setDevHubUsername(username): MockAuthInfo {
        this._testData.devHubUsername = username;
        return this;
    }

    public getConnectionOptions(): Partial<AuthFields> {
        return {
            instanceUrl: this._testData.instanceUrl,
            devHubUsername: this._testData.devHubUsername,
            username: this._testData.username,
            orgId: this._testData.orgId
        };
    }
}

class MockConnection extends Connection {

    public static readonly apiVersion = '90.0';

    public static readonly TEST_USERNAME = 'egon@gb.com';

    constructor(testData?: MockTestOrgData) {

        let _testData: MockTestOrgData = testData;
        if (!_testData) {
            _testData = new MockTestOrgData();
        }

        super({ loginUrl: _testData.loginUrl}, new MockAuthInfo(_testData));
    }

    public async request(request: RequestInfo | string, options?): Promise<any> {
        return [{ version: '89.0' }, { version: MockConnection.apiVersion }, { version: '88.0' }];
    }
}

describe('Org Tests', () => {

    let testData: MockTestOrgData;
    beforeEach(() => {
        testData = new MockTestOrgData();
    });

    describe('retrieveMaxApiVersion', () => {

        it('no username', async () => {

            const org: Org = await Org.create(new MockConnection());

            const apiVersion = await org.retrieveMaxApiVersion();
            expect(apiVersion).has.property('version', MockConnection.apiVersion);
        });
    });

    describe('computeAndUpdateStatusForMetaConfig', () => {

        it('Missing status', async () => {

            const testDevHubMockData: MockTestOrgData = new MockTestOrgData();
            const devHubMeta: OrgMetaInfo = {
                info: new MockAuthInfo(testDevHubMockData), devHubMissing: false, expired: false
            };

            const testOrgMockData: MockTestOrgData = new MockTestOrgData();
            const scratchOrgMeta: OrgMetaInfo = {
                info: new MockAuthInfo(testOrgMockData).setDevHubUsername(testDevHubMockData.username),
                devHubMissing: true,
                expired: false
            };

            const devHubMetaMap: Map<string, OrgMetaInfo> = new Map();
            devHubMetaMap.set(testDevHubMockData.username, devHubMeta);

            const org: Org = await Org.create(new MockConnection());
            org.computeAndUpdateStatusFromMetaInfo(scratchOrgMeta, devHubMetaMap);
            expect(org).to.have.property('status', OrgStatus.MISSING);
        });

        it('Unknown status', async () => {
            const testOrgData: MockTestOrgData = new MockTestOrgData();
            const scratchOrgMeta: OrgMetaInfo = {
                info: new MockAuthInfo(testOrgData), devHubMissing: true, expired: false
            };

            const testDevHubData: MockTestOrgData = new MockTestOrgData();
            const devHubMetaMap: Map<string, OrgMetaInfo> = new Map();
            const devHubMeta: OrgMetaInfo = {
                info: new MockAuthInfo(testDevHubData), devHubMissing: false, expired: false
            };
            devHubMetaMap.set(testDevHubData.username, devHubMeta);

            const org: Org = await Org.create(new MockConnection());
            org.computeAndUpdateStatusFromMetaInfo(scratchOrgMeta, devHubMetaMap);
            expect(org).to.have.property('status', OrgStatus.UNKNOWN);
        });
    });

    describe('cleanData', () => {
        describe('mock remove', () => {
            let removePath = '';
            let removeStub;
            beforeEach(() => {
                const rootPath = osTmpdir();
                $$.SANDBOX.stub(SfdxConfig, 'getRootFolder').callsFake(() => {
                    return Promise.resolve(rootPath);
                });

                removeStub = $$.SANDBOX.stub(SfdxUtil, 'remove').callsFake((path) => {
                    removePath = path;
                    return Promise.resolve();
                });
            });

            it ('with data path', async () => {
                const orgDataPath = 'foo';
                const org: Org = await Org.create(new MockConnection());
                await org.cleanData(orgDataPath);
                expect(removePath.endsWith(pathJoin(Global.STATE_FOLDER, orgDataPath))).to.be.equal(true);
            });

            it ('no org data path', async () => {
                const connection: MockConnection = new MockConnection();
                const org: Org = await Org.create(connection);

                expect(removeStub.callCount).to.be.equal(0);
                await org.cleanData();
                expect(removeStub.callCount).to.be.equal(1);

                expect(removePath).to.include(pathJoin(Global.STATE_FOLDER, OrgConfigFile.ORGS_FOLDER_NAME,
                    connection.getAuthInfo().getConnectionOptions().username));
            });
        });

        it ('InvalidProjectWorkspace', async () => {
            const orgSpy = $$.SANDBOX.spy(Org.prototype, 'cleanData');
            let invalidProjectWorkspace = false;
            $$.SANDBOX.stub(SfdxConfig, 'getRootFolder').callsFake(() => {
                if (orgSpy.callCount > 0) {
                    invalidProjectWorkspace = true;
                    const error = new Error();
                    error.name = 'InvalidProjectWorkspace';
                    throw error;
                }
                return osTmpdir();
            });
            const orgDataPath = 'foo';
            const org: Org = await Org.create(new MockConnection());
            await org.cleanData(orgDataPath);
            expect(invalidProjectWorkspace).to.be.equal(true);
        });

        it ('Random Error', async () => {
            const orgSpy = $$.SANDBOX.spy(Org.prototype, 'cleanData');
            $$.SANDBOX.stub(SfdxConfig, 'getRootFolder').callsFake(() => {
                if (orgSpy.callCount > 0) {
                    const err = new Error();
                    err.name = 'gozer';
                    throw err;
                }
                return osTmpdir();
            });
            const orgDataPath = 'foo';
            const org: Org = await Org.create(new MockConnection());
            try {
                await org.cleanData(orgDataPath);
                assert.fail('This should have failed');
            } catch (e) {
                expect(e).to.have.property('name', 'gozer');
            }
        });
    });

    describe('getDataPath', () => {

        it ('should return the dataPath for the org.', async () => {
            const testFilename = 'bar';
            const org: Org = await Org.create(new MockConnection(testData));
            expect(org.getDataPath('bar')).to.be.equal(
                pathJoin(OrgConfigFile.ORGS_FOLDER_NAME, testData.username, testFilename));
        });

        it ('undefined field name', async () => {
            const org: Org = await Org.create(new MockConnection(testData));
            expect(org.getDataPath(undefined)).to.be.equal(
                pathJoin(OrgConfigFile.ORGS_FOLDER_NAME, testData.username));
        });

        it ('null field name', async () => {
            const org: Org = await Org.create(new MockConnection(testData));

            expect(org.getDataPath(null)).to.be.equal(
                pathJoin(OrgConfigFile.ORGS_FOLDER_NAME, testData.username));
        });
    });

    describe('orgConfigs', () => {
        beforeEach(() => {
            $$.SANDBOX.stub(ProjectDir, 'getPath').callsFake(() => {
                return Promise.resolve(osTmpdir());
            });
        });
        describe('getMaxRevision', () => {
            it('valid value', async () => {
                let maxRevisionPath = '';
                $$.SANDBOX.stub(ConfigFile.prototype, 'read').callsFake(function() {
                    maxRevisionPath = this.path;
                    return Promise.resolve(JSON.parse('1'));
                });

                const org: Org = await Org.create(new MockConnection());
                const maxRevisionConfig: OrgConfigFile = await org.retrieveMaxRevisionConfig();
                const maxRevision = await maxRevisionConfig.read();
                expect(maxRevision).to.be.equal(1);
                expect(maxRevisionPath).to.include(OrgConfigType.MAX_REVISION.valueOf());
            });
        });

        describe('getSourcePathInfos', () => {
            it ('valid', async () => {
                let sourcePathInfosPath = '';
                $$.SANDBOX.stub(ConfigFile.prototype, 'read').callsFake(function() {
                    sourcePathInfosPath = this.path;
                    return Promise.resolve([['foo', { sourcePath: 'bar' }]]);
                });

                const org: Org = await Org.create(new MockConnection(testData));
                const sourceInfosConfig: OrgConfigFile = await org.retrieveSourcePathInfosConfig();
                const sourceInfos: any = await sourceInfosConfig.read();

                expect(sourcePathInfosPath).to.include(pathJoin(OrgConfigFile.ORGS_FOLDER_NAME,
                    testData.username, OrgConfigType.SOURCE_PATH_INFOS.valueOf()));
                expect(sourceInfos.length).to.be.equal(1);
                expect(sourceInfos[0].length).to.be.equal(2);
                expect(sourceInfos[0][0]).to.be.equal('foo');
                expect(sourceInfos[0][1].sourcePath).to.be.equal('bar');
            });
        });

        describe('getMetadataTypeInfo', () => {
            it ('valid', async () => {

                const connection: Connection = new MockConnection(testData);

                let metadataTypeInfosPath = '';
                $$.SANDBOX.stub(ConfigFile.prototype, 'read').callsFake(function() {
                    metadataTypeInfosPath = this.path;
                    return Promise.resolve({ sourceApiVersion: '41.0' });
                });

                const org: Org = await Org.create(connection);
                const metadataConfig: OrgConfigFile = await org.retrieveMetadataTypeInfosConfig();
                const metadataTypeInfos = await metadataConfig.read();
                expect(metadataTypeInfos).to.have.property('sourceApiVersion', '41.0');
                expect(metadataTypeInfosPath).to.include(pathJoin(OrgConfigFile.ORGS_FOLDER_NAME,
                    testData.username, OrgConfigType.METADATA_TYPE_INFOS.valueOf()));
            });
        });
    });

    describe('remove', () => {

        const connection: Connection = new MockConnection();

        let rootFolder = '';
        let aliases = {  orgs: {} };

        const configFileReadJSONMock = function() {
            if (this.path.includes(connection.getAuthInfo().getConnectionOptions().username)) {
                return Promise.resolve(connection.getAuthInfo().getConnectionOptions());
            }

            if (this.path && this.path.includes(Alias.ALIAS_FILE_NAME)) {
                return Promise.resolve(aliases);
            }

            return Promise.resolve({});
        };

        beforeEach(() => {
            testData = new MockTestOrgData();

            $$.SANDBOX.stub(ProjectDir, 'getPath').callsFake(() => {
                rootFolder = osTmpdir();
                return Promise.resolve(rootFolder);
            });

            $$.SANDBOX.stub(AuthInfoConfigFile.prototype, 'readJSON').callsFake(configFileReadJSONMock);
            $$.SANDBOX.stub(KeyValueStore.prototype, 'readJSON').callsFake(configFileReadJSONMock);

            $$.SANDBOX.stub(KeyValueStore.prototype, 'write').callsFake((contents) => {
                aliases = contents;
                return Promise.resolve(contents);
            });
        });

        it('should remove all assets associated with the org', async () => {

            const org: Org = await Org.create(new MockConnection(testData));

            const deletedPaths = [];
            $$.SANDBOX.stub(ConfigFile.prototype, 'unlink').callsFake(function() {
                deletedPaths.push(this.path);
                return Promise.resolve({});
            });

            let orgPath = '';
            $$.SANDBOX.stub(SfdxUtil, 'remove').callsFake((path) => {
                orgPath = path;
                return Promise.resolve({});
            });

            await org.remove();
            expect(deletedPaths).includes(pathJoin(rootFolder, OrgConfigFile.ORGS_FOLDER_NAME, testData.username,
                OrgConfigType.SOURCE_PATH_INFOS.valueOf()));
            expect(deletedPaths).includes(pathJoin(rootFolder, OrgConfigFile.ORGS_FOLDER_NAME, testData.username,
                OrgConfigType.MAX_REVISION.valueOf()));
            expect(deletedPaths).includes(pathJoin(rootFolder, OrgConfigFile.ORGS_FOLDER_NAME, testData.username,
                OrgConfigType.METADATA_TYPE_INFOS.valueOf()));
            expect(deletedPaths).includes(pathJoin(Global.DIR, `${testData.orgId}.json`));
        });

        it ('should not fail when no scratch org has been written', async () => {
            const org: Org = await Org.create(new MockConnection(testData));

            const error: any = new Error();
            error.code = 'ENOENT';

            $$.SANDBOX.stub(ConfigFile.prototype, 'unlink').callsFake(async function() {
                throw error;
            });

            $$.SANDBOX.stub(SfdxUtil, 'remove').callsFake(async () => {
                return Promise.reject(error);
            });

            try {
                await org.remove();
            } catch (e) {
                assert.fail('Removes should throw and error when removing an orgConfig');
            }
        });

        it('should remove config setting', async () => {

            const org: Org = (await Org.create(new MockConnection(testData)));

            const config: SfdxConfig = await SfdxConfig.create(true, $$.rootPathRetriever);
            await config.setPropertyValue(SfdxConfig.DEFAULT_USERNAME, testData.username);
            await config.write();

            const sfdxConfigAggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create($$.rootPathRetriever);
            org.setConfigAggregator(sfdxConfigAggregator);

            expect(sfdxConfigAggregator.getInfo(SfdxConfig.DEFAULT_USERNAME)).has.property('value', testData.username);

            await org.remove();

            await sfdxConfigAggregator.reload();

            const defaultusername = sfdxConfigAggregator.getInfo(SfdxConfig.DEFAULT_USERNAME);
            const info = sfdxConfigAggregator.getInfo(SfdxConfig.DEFAULT_USERNAME);
            expect(defaultusername.value).eq(undefined);
            expect(info.value).eq(undefined);
        });

        it('should remove the alias', async () => {
            const org: Org = await Org.create(new MockConnection(testData));

            await Alias.parseAndUpdate([`foo=${testData.username}`]);
            let alias = await Alias.fetch('foo');
            expect(alias).eq(testData.username);

            await org.remove();

            alias = await Alias.fetch('foo');
            expect(alias).eq(undefined);
        });
    });
});
