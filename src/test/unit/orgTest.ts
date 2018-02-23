/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { constants as fsConstants } from 'fs';
import { AuthInfo, AuthFields } from '../../lib/authInfo';
import { Connection } from '../../lib/connection';
import { Org, OrgMetaInfo, OrgStatus } from '../../lib/org';
import { OAuth2 } from 'jsforce';
import { expect, assert } from 'chai';
import { testSetup } from '../testSetup';
import { Config } from '../../lib/config/configFile';
import { Crypto } from '../../lib/crypto';
import { KeyValueStore } from '../../lib/config/fileKeyValueStore';
import { SfdxConfig } from '../../lib/config/sfdxConfig';
import { tmpdir as osTmpdir } from 'os';
import { join as pathJoin } from 'path';
import { SfdxUtil } from '../../lib/util';
import { Global } from '../../lib/global';
import { OrgConfigFile, OrgConfigType } from '../../lib/config/orgConfigFile';
import { ProjectDir } from '../../lib/projectDir';
import { SfdxConfigAggregator } from '../../lib/config/sfdxConfigAggregator';
import { Alias } from '../../lib/alias';
import { set as _set, get as _get, isEqual as _isEqual } from 'lodash';
import * as Transport from 'jsforce/lib/transport';
import { RequestInfo } from '../../../typings/jsforce';

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
    public clientId: string;
    public clientSecret: string;
    public authcode: string;
    public accessToken: string;
    public refreshToken: string;

    constructor() {
        this.testId = $$.uniqid();
        this.orgId = `${this.testId}`;
        this.username = `admin_${this.testId}@gb.org`;
        this.loginUrl = `http://login.${this.testId}.salesforce.com`;
        this.instanceUrl = `http://instance.${this.testId}.salesforce.com`;
        this.clientId = `${this.testId}/client_id`;
        this.clientSecret = `${this.testId}/client_secret`;
        this.authcode = `${this.testId}/authcode`;
        this.accessToken = `${this.testId}/accessToken`;
        this.refreshToken =  '${this.testId}/refreshToken';
    }

    public createDevHubUsername(username: string): void {
        this.devHubUsername = username;
    }

    public makeDevHub(): void {
        _set(this, 'isDevHub', true);
    }

    public createUser(user: string): MockTestOrgData {
        const userMock = new MockTestOrgData();
        userMock.username = user;
        userMock.alias = this.alias;
        userMock.devHubUsername = this.devHubUsername;
        userMock.orgId = this.orgId;
        userMock.loginUrl = this.loginUrl;
        userMock.instanceUrl = this.instanceUrl;
        userMock.clientId = this.clientId;
        userMock.clientSecret = this.clientSecret;
        return userMock;
    }

    public async getConfig() {
        const crypto = await Crypto.create();
        const config: any = {
            orgId: this.orgId,
            accessToken: crypto.encrypt(this.accessToken),
            refreshToken: crypto.encrypt(this.refreshToken),
            instanceUrl: this.instanceUrl,
            loginUrl: this.loginUrl,
            username: this.username,
            createdOrgInstance: 'CS1',
            created: '1519163543003'
            // "devHubUsername": "tn@su-blitz.org"
        };

        if (this.devHubUsername) {
            _set(config, 'devHubUsername', this.devHubUsername);
        }

        const isDevHub = _get(this, 'isDevHub');
        if (isDevHub) {
            _set(config, 'isDevHub', isDevHub);
        }

        return config;
    }
}

describe('Org Tests', () => {

    let testData: MockTestOrgData;

    beforeEach(() => {
        testData = new MockTestOrgData();
        $$.SANDBOX.stub(Crypto.prototype, 'getKeyChain').callsFake(() => Promise.resolve({
            setPassword: () => Promise.resolve(),
            getPassword: (data, cb) => cb(undefined, '12345678901234567890123456789012')
        }));
    });

    describe('retrieveMaxApiVersion', () => {
        it('no username', async () => {
            $$.SANDBOX.stub(Config.prototype, 'readJSON').callsFake(async () => {
                return Promise.resolve(await testData.getConfig());
            });

            $$.SANDBOX.stub(Connection.prototype, 'request').callsFake(() => Promise.resolve(
                [{version: '89.0'}, {version: '90.0'}, {version: '88.0'}]));

            const org: Org = await Org.create(await Connection.create(await AuthInfo.create(testData.username)));
            const apiVersion = await org.retrieveMaxApiVersion();
            expect(apiVersion).has.property('version', '90.0');
        });
    });

    describe('computeAndUpdateStatusForMetaConfig', () => {

        it('Missing status', async () => {

            const testDevHubMockData: MockTestOrgData = new MockTestOrgData();
            const testOrgMockData: MockTestOrgData = new MockTestOrgData();

            $$.SANDBOX.stub(Config.prototype, 'readJSON').callsFake(async function() {
                if (this.path.includes(testDevHubMockData.username)) {
                    return Promise.resolve(await testDevHubMockData.getConfig());
                } else {
                    testOrgMockData.createDevHubUsername(testDevHubMockData.username);
                    return Promise.resolve(testOrgMockData.getConfig());
                }
            });

            const devHubMeta: OrgMetaInfo = {
                info: await AuthInfo.create(testDevHubMockData.username),
                devHubMissing: false,
                expired: false
            };

            const scratchOrgMeta: OrgMetaInfo = {
                info: await AuthInfo.create(testOrgMockData.username),
                devHubMissing: true,
                expired: false
            };

            const devHubMetaMap: Map<string, OrgMetaInfo> = new Map();
            devHubMetaMap.set(testDevHubMockData.username, devHubMeta);

            const org: Org = await Org.create(await Connection.create(scratchOrgMeta.info));
            org.computeAndUpdateStatusFromMetaInfo(scratchOrgMeta, devHubMetaMap);
            expect(org).to.have.property('status', OrgStatus.MISSING);
        });

        it('Unknown status', async () => {
            const testOrgData: MockTestOrgData = new MockTestOrgData();
            const testDevHubData: MockTestOrgData = new MockTestOrgData();

            $$.SANDBOX.stub(Config.prototype, 'readJSON').callsFake(async function() {
                if (this.path.includes(testDevHubData)) {
                    return Promise.resolve(await testDevHubData.getConfig());
                } else {
                    return Promise.resolve(testOrgData.getConfig());
                }
            });

            const scratchOrgMeta: OrgMetaInfo = {
                info: await AuthInfo.create(testOrgData.username),
                devHubMissing: true,
                expired: false
            };

            const devHubMetaMap: Map<string, OrgMetaInfo> = new Map();
            const devHubMeta: OrgMetaInfo = {
                info: await AuthInfo.create(testDevHubData.username),
                devHubMissing: false,
                expired: false
            };
            devHubMetaMap.set(testDevHubData.username, devHubMeta);

            const org: Org = await Org.create(await Connection.create(scratchOrgMeta.info));
            org.computeAndUpdateStatusFromMetaInfo(scratchOrgMeta, devHubMetaMap);
            expect(org).to.have.property('status', OrgStatus.UNKNOWN);
        });
    });

    describe('cleanData', () => {
        beforeEach(() => {
            $$.SANDBOX.stub(Config.prototype, 'readJSON').callsFake(async () => {
                return Promise.resolve(await testData.getConfig());
            });
        });
        describe('mock remove', () => {
            let removePath = '';
            let removeStub;
            beforeEach(() => {
                const rootPath = osTmpdir();
                $$.SANDBOX.stub(SfdxConfig, 'resolveRootFolder').callsFake(() => {
                    return Promise.resolve(rootPath);
                });

                removeStub = $$.SANDBOX.stub(SfdxUtil, 'remove').callsFake((path) => {
                    removePath = path;
                    return Promise.resolve();
                });
            });

            it ('with data path', async () => {
                const orgDataPath = 'foo';
                const org: Org = await Org.create(
                    await Connection.create(await AuthInfo.create(testData.username)));
                await org.cleanData(orgDataPath);
                expect(removePath.endsWith(pathJoin(Global.STATE_FOLDER, orgDataPath))).to.be.equal(true);
            });

            it ('no org data path', async () => {
                const org: Org = await Org.create(
                    await Connection.create(await AuthInfo.create(testData.username)));

                expect(removeStub.callCount).to.be.equal(0);
                await org.cleanData();
                expect(removeStub.callCount).to.be.equal(1);

                expect(removePath).to.include(pathJoin(Global.STATE_FOLDER, OrgConfigFile.ORGS_FOLDER_NAME,
                    testData.username));
            });
        });

        it ('InvalidProjectWorkspace', async () => {

            const orgSpy = $$.SANDBOX.spy(Org.prototype, 'cleanData');
            let invalidProjectWorkspace = false;
            $$.SANDBOX.stub(Config, 'resolveRootFolder').callsFake(() => {
                if (orgSpy.callCount > 0) {
                    invalidProjectWorkspace = true;
                    const error = new Error();
                    error.name = 'InvalidProjectWorkspace';
                    throw error;
                }
                return $$.rootPathRetriever(false);
            });
            const orgDataPath = 'foo';
            const org: Org = await Org.create(
                await Connection.create(await AuthInfo.create(testData.username)));
            await org.cleanData(orgDataPath);
            expect(invalidProjectWorkspace).to.be.equal(true);
        });

        it ('Random Error', async () => {
            const orgSpy = $$.SANDBOX.spy(Org.prototype, 'cleanData');
            $$.SANDBOX.stub(SfdxConfig, 'resolveRootFolder').callsFake(() => {
                if (orgSpy.callCount > 0) {
                    const err = new Error();
                    err.name = 'gozer';
                    throw err;
                }
                return osTmpdir();
            });
            const orgDataPath = 'foo';
            const org: Org = await Org.create(
                await Connection.create(await AuthInfo.create(testData.username)));
            try {
                await org.cleanData(orgDataPath);
                assert.fail('This should have failed');
            } catch (e) {
                expect(e).to.have.property('name', 'gozer');
            }
        });
    });

    describe('getDataPath', () => {
        beforeEach(() => {
            $$.SANDBOX.stub(Config.prototype, 'readJSON').callsFake(async () => {
                return Promise.resolve(await testData.getConfig());
            });
        });

        it ('should return the dataPath for the org.', async () => {
            const testFilename = 'bar';
            const org: Org = await Org.create(
                await Connection.create(await AuthInfo.create(testData.username)));
            expect(org.getDataPath('bar')).to.be.equal(
                pathJoin(OrgConfigFile.ORGS_FOLDER_NAME, testData.username, testFilename));
        });

        it ('undefined field name', async () => {
            const org: Org = await Org.create(
                await Connection.create(await AuthInfo.create(testData.username)));
            expect(org.getDataPath(undefined)).to.be.equal(
                pathJoin(OrgConfigFile.ORGS_FOLDER_NAME, testData.username));
        });

        it ('null field name', async () => {
            const org: Org = await Org.create(
                await Connection.create(await AuthInfo.create(testData.username)));

            expect(org.getDataPath(null)).to.be.equal(
                pathJoin(OrgConfigFile.ORGS_FOLDER_NAME, testData.username));
        });
    });

    describe('orgConfigs', () => {
        beforeEach(() => {

            $$.SANDBOX.stub(Config.prototype, 'readJSON').callsFake(async function() {
                if (this.path.includes(`${testData.username}.json`)) {
                    return Promise.resolve(await testData.getConfig());
                } else {
                    throw new Error(`Unsupported path: ${this.path}`);
                }
            });

            $$.SANDBOX.stub(ProjectDir, 'getPath').callsFake(() => {
                return Promise.resolve(osTmpdir());
            });
        });
        describe('getMaxRevision', () => {
            it('valid value', async () => {
                let maxRevisionPath = '';
                $$.SANDBOX.stub(Config.prototype, 'read').callsFake(function() {
                    maxRevisionPath = this.path;
                    return Promise.resolve(JSON.parse('1'));
                });

                const org: Org = await Org.create(
                    await Connection.create(await AuthInfo.create(testData.username)));
                const maxRevisionConfig: OrgConfigFile = await org.retrieveMaxRevisionConfig();
                const maxRevision = await maxRevisionConfig.read();
                expect(maxRevision).to.be.equal(1);
                expect(maxRevisionPath).to.include(OrgConfigType.MAX_REVISION.valueOf());
            });
        });

        describe('getSourcePathInfos', () => {
            it ('valid', async () => {
                let sourcePathInfosPath = '';
                $$.SANDBOX.stub(Config.prototype, 'read').callsFake(function() {
                    sourcePathInfosPath = this.path;
                    return Promise.resolve([['foo', { sourcePath: 'bar' }]]);
                });

                const org: Org = await Org.create(
                    await Connection.create(await AuthInfo.create(testData.username)));
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

                let metadataTypeInfosPath = '';
                $$.SANDBOX.stub(Config.prototype, 'read').callsFake(function() {
                    metadataTypeInfosPath = this.path;
                    return Promise.resolve({ sourceApiVersion: '41.0' });
                });

                const org: Org = await Org.create(
                    await Connection.create(await AuthInfo.create(testData.username)));
                const metadataConfig: OrgConfigFile = await org.retrieveMetadataTypeInfosConfig();
                const metadataTypeInfos = await metadataConfig.read();
                expect(metadataTypeInfos).to.have.property('sourceApiVersion', '41.0');
                expect(metadataTypeInfosPath).to.include(pathJoin(OrgConfigFile.ORGS_FOLDER_NAME,
                    testData.username, OrgConfigType.METADATA_TYPE_INFOS.valueOf()));
            });
        });
    });

    describe('remove', () => {

        // const connection: Connection = new MockConnection();

        const rootFolder = '';
        let aliases = {  orgs: {} };
        const testId: string = $$.uniqid();

        const configFileReadJSONMock = async function() {
            if (this.path.includes(`${testData.username}.json`)) {
                return Promise.resolve(await testData.getConfig());
            }

            if (this.path && this.path.includes(Alias.ALIAS_FILE_NAME)) {
                return Promise.resolve(aliases);
            }

            return Promise.resolve({});
        };

        beforeEach(() => {
            testData = new MockTestOrgData();

            $$.SANDBOX.stub(Config, 'resolveRootFolder').callsFake(async (isGlobal: boolean) => {
                return await $$.rootPathRetriever(isGlobal, testId);
            });

            $$.SANDBOX.stub(Config.prototype, 'readJSON').callsFake(configFileReadJSONMock);

            $$.SANDBOX.stub(KeyValueStore.prototype, 'write').callsFake((contents) => {
                aliases = contents;
                return Promise.resolve(contents);
            });
        });

        it('should remove all assets associated with the org', async () => {

            const org: Org = await Org.create(
                await Connection.create(await AuthInfo.create(testData.username)));

            const deletedPaths = [];
            $$.SANDBOX.stub(Config.prototype, 'unlink').callsFake(function() {
                deletedPaths.push(this.path);
                return Promise.resolve({});
            });

            $$.SANDBOX.stub(SfdxUtil, 'remove').callsFake((path) => {
                return Promise.resolve({});
            });

            await org.remove();

            expect(deletedPaths).includes(pathJoin(await $$.localPathRetriever(testId), Global.STATE_FOLDER,
                OrgConfigFile.ORGS_FOLDER_NAME, testData.username, OrgConfigType.SOURCE_PATH_INFOS.valueOf()));
            expect(deletedPaths).includes(pathJoin(await $$.localPathRetriever(testId), Global.STATE_FOLDER,
                OrgConfigFile.ORGS_FOLDER_NAME, testData.username, OrgConfigType.MAX_REVISION.valueOf()));
            expect(deletedPaths).includes(pathJoin(await $$.localPathRetriever(testId), Global.STATE_FOLDER,
                OrgConfigFile.ORGS_FOLDER_NAME, testData.username, OrgConfigType.METADATA_TYPE_INFOS.valueOf()));
            expect(deletedPaths).includes(pathJoin(await $$.globalPathRetriever(testId), Global.STATE_FOLDER,
                `${testData.orgId}.json`));
        });

        it ('should not fail when no scratch org has been written', async () => {
            const org: Org = await Org.create(
                await Connection.create(await AuthInfo.create(testData.username)));

            const error: any = new Error();
            error.code = 'ENOENT';

            $$.SANDBOX.stub(Config.prototype, 'unlink').callsFake(async function() {
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
            const sfdxConfigAggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create();
            const org: Org = await Org.create(
                await Connection.create(await AuthInfo.create(testData.username)), sfdxConfigAggregator);

            const config: SfdxConfig = await SfdxConfig.create(true);
            await config.setPropertyValue(SfdxConfig.DEFAULT_USERNAME, testData.username);
            await config.write();

            await sfdxConfigAggregator.reload();
            expect(sfdxConfigAggregator.getInfo(SfdxConfig.DEFAULT_USERNAME)).has.property('value', testData.username);

            await org.remove();
            await sfdxConfigAggregator.reload();

            const defaultusername = sfdxConfigAggregator.getInfo(SfdxConfig.DEFAULT_USERNAME);
            const info = sfdxConfigAggregator.getInfo(SfdxConfig.DEFAULT_USERNAME);
            expect(defaultusername.value).eq(undefined);
            expect(info.value).eq(undefined);
        });

        it('should remove the alias', async () => {
            const org: Org = await Org.create(
                await Connection.create(await AuthInfo.create(testData.username)));

            await Alias.parseAndUpdate([`foo=${testData.username}`]);
            let alias = await Alias.fetchValue('foo');
            expect(alias).eq(testData.username);

            await org.remove();

            alias = await Alias.fetchValue('foo');
            expect(alias).eq(undefined);
        });
    });

    describe('with multiple scratch org users', () => {

        let orgs: Org[];
        beforeEach(async () => {
            // Alias is currently a singleton so if the path to alias.json changes,
            // which it does frequently in the unit tests, the singleton needs to be invalidated.
            // Should never need to be called by a user.
            Alias.invalidate();

            orgs = [];
            const testId = $$.uniqid();

            const orgIdUser: string = 'p.venkman@gb.org';
            const addedUser: string = 'winston@gb.org';

            const users = [
                new MockTestOrgData().createUser(orgIdUser),
                new MockTestOrgData().createUser(addedUser)
            ];

            $$.SANDBOX.stub(Config, 'resolveRootFolder')
                .callsFake((isGlobal) => $$.rootPathRetriever(isGlobal, testId));

            let userAuthResponse = null;
            $$.SANDBOX.stub(OAuth2.prototype, '_postParams').callsFake(() => Promise.resolve(userAuthResponse));

            let responseBody = null;
            $$.SANDBOX.stub(Transport.prototype, 'httpRequest').callsFake(() => {
                return Promise.resolve(responseBody);
            });

            for (const user of users) {
                userAuthResponse = {
                    access_token: user.accessToken,
                    instance_url: user.instanceUrl,
                    id: user.testId,
                    refresh_token: user.refreshToken
                };

                responseBody = { body: JSON.stringify({ Username: user.username, OrgId: user.orgId }) };

                const userAuth = await AuthInfo.create(user.username, {
                    clientId: user.clientId,
                    clientSecret: user.clientSecret,
                    loginUrl: user.loginUrl
                });

                await userAuth.save( {orgId: user.orgId});

                const sfdxConfigAggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create();

                const org: Org = await Org.create(
                    await Connection.create(await AuthInfo.create(user.username)), sfdxConfigAggregator);

                const maxRevConfig: OrgConfigFile = await org.retrieveMaxRevisionConfig();
                maxRevConfig.write(1);

                const metaTypeConfig: OrgConfigFile = await org.retrieveMetadataTypeInfosConfig();
                metaTypeConfig.write({ sourceApiVersion: '42.0' });

                const sourcePathConfig: OrgConfigFile = await org.retrieveSourcePathInfosConfig();
                sourcePathConfig.write([[
                    '/Users/tnoonan/foo/force-app',
                    {
                        state: 'n',
                        sourcePath: '/Users/tnoonan/foo/force-app',
                        isDirectory: true,
                        isMetadataFile: false,
                        size: 102,
                        modifiedTime: 1518292409000,
                        changeTime: 1518292409000,
                        contentHash: 'b28b7af69320201d1cf206ebf28373980add1451',
                        isWorkspace: false,
                        isArtifactRoot: true
                    }
                ]]);

                orgs.push(org);
            }

            await orgs[0].addUsername(orgs[1].getMetaInfo().info);
        });

        it('should validate expected files', async () => {
            for (const org of orgs) {
                const maxRevConfig = await org.retrieveMaxRevisionConfig();
                const metaTypeConfig: OrgConfigFile = await org.retrieveMetadataTypeInfosConfig();
                const sourcePathConfig: OrgConfigFile = await org.retrieveSourcePathInfosConfig();

                expect(await maxRevConfig.access(fsConstants.R_OK)).to.be.true;
                expect(await metaTypeConfig.access(fsConstants.R_OK)).to.be.true;
                expect(await sourcePathConfig.access(fsConstants.R_OK)).to.be.true;
            }

            const user0Config: OrgConfigFile = await orgs[0].retrieveOrgUsersConfig();
            const user1Config: OrgConfigFile = await orgs[1].retrieveOrgUsersConfig();

            expect(await user0Config.access(fsConstants.R_OK)).to.be.true;
            expect(await user1Config.access(fsConstants.R_OK)).to.be.false;
        });

        it('should validate org artifacts are gone', async () => {
            await orgs[0].remove();
            for (const org of orgs) {
                const maxRevConfig = await org.retrieveMaxRevisionConfig();
                const metaTypeConfig: OrgConfigFile = await org.retrieveMetadataTypeInfosConfig();
                const sourcePathConfig: OrgConfigFile = await org.retrieveSourcePathInfosConfig();

                expect(await maxRevConfig.access(fsConstants.R_OK)).to.be.false;
                expect(await metaTypeConfig.access(fsConstants.R_OK)).to.be.false;
                expect(await sourcePathConfig.access(fsConstants.R_OK)).to.be.false;
            }
        });

        it('should remove aliases and config settings', async () => {
            const config: SfdxConfig = await SfdxConfig.create(true);

            const org0Username = orgs[0].getMetaInfo().info.getFields().username;
            await config.setPropertyValue(SfdxConfig.DEFAULT_USERNAME, org0Username);
            await config.write();

            const sfdxConfigAggregator = await orgs[0].getConfigAggregator().reload();
            const info = sfdxConfigAggregator.getInfo(SfdxConfig.DEFAULT_USERNAME);
            expect(info).has.property('value', org0Username);

            const org1Username = orgs[1].getMetaInfo().info.getFields().username;
            await Alias.parseAndUpdate(
                [`foo=${org1Username}`]);
            let alias = await Alias.fetchValue('foo');
            expect(alias).eq(org1Username);

            await orgs[0].remove();

            await sfdxConfigAggregator.reload();
            expect(sfdxConfigAggregator.getInfo(SfdxConfig.DEFAULT_USERNAME)).has.property('value', undefined);

            alias = await Alias.fetchValue('foo');
            expect(alias).eq(undefined);
        });

        it('should not try to delete auth files when deleting an org via access token', async () => {
            orgs[0].setUsingAccessToken(true);

            await orgs[0].remove();

            for (const org of orgs) {
                const maxRevConfig = await org.retrieveMaxRevisionConfig();
                const metaTypeConfig: OrgConfigFile = await org.retrieveMetadataTypeInfosConfig();
                const sourcePathConfig: OrgConfigFile = await org.retrieveSourcePathInfosConfig();

                expect(await maxRevConfig.access(fsConstants.R_OK)).to.be.true;
                expect(await metaTypeConfig.access(fsConstants.R_OK)).to.be.true;
                expect(await sourcePathConfig.access(fsConstants.R_OK)).to.be.true;
            }

            const user0Config: OrgConfigFile = await orgs[0].retrieveOrgUsersConfig();
            const user1Config: OrgConfigFile = await orgs[1].retrieveOrgUsersConfig();

            expect(await user0Config.access(fsConstants.R_OK)).to.be.true;
            expect(await user1Config.access(fsConstants.R_OK)).to.be.false;

        });
    });

    describe ('checkScratchOrg', () => {
        let returnResult;
        const testId = $$.uniqid();
        let org: Org;
        let connection: Connection;
        beforeEach(async () => {
            $$.SANDBOX.stub(Config.prototype, 'readJSON').callsFake(async () => {
                return Promise.resolve(await testData.getConfig());
            });

            $$.SANDBOX.stub(Connection.prototype, 'query').callsFake(async (query) => {
                if (returnResult === 'throw') {
                    const error = new Error();
                    error.name = 'INVALID_TYPE';
                    throw error;
                }
                return returnResult;
            });

            $$.SANDBOX.stub(Config, 'resolveRootFolder')
                .callsFake((isGlobal) => $$.rootPathRetriever(isGlobal, testId));

            const fakeDevHub = 'foo@devhub.com';

            const sfdxConfigAggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create();
            connection = await Connection.create(await AuthInfo.create(testData.username));
            org = await Org.create(connection, sfdxConfigAggregator);

            const config: SfdxConfig = await SfdxConfig.create(true);
            await config.setPropertyValue(SfdxConfig.DEFAULT_DEV_HUB_USERNAME, fakeDevHub);
            await config.write();

            await org.getConfigAggregator().reload();
        });

        it('validate is a scratch org', async () => {
            returnResult = { records: [ {} ] };
            const fields: Partial<AuthFields> = await org.checkScratchOrg();
            expect(_isEqual(fields, connection.getAuthInfo().getFields())).to.be.true;
        });

        it('validate is not scratch org', async () => {
            returnResult = { records: [] };
            try {
                const fields: Partial<AuthFields> = await org.checkScratchOrg();
                assert.fail('This test is expected to fail.');
            } catch (err) {
                expect(err).to.have.property('name', 'NoResults');
            }
        });

        it('validate is not scratch org', async () => {
            returnResult = 'throw';
            try {
                await org.checkScratchOrg();
                assert.fail('This test is expected to fail.');
            } catch (err) {
                expect(err).to.have.property('name', 'notADevHub');
            }
        });
    });

    describe('getDevHubOrg', () => {

        const devHubUser = 'ray@gb.org';
        beforeEach(() => {
            $$.SANDBOX.stub(Config, 'resolveRootFolder')
                .callsFake((isGlobal) => $$.rootPathRetriever(isGlobal));

            $$.SANDBOX.stub(Config.prototype, 'readJSON').callsFake(async function() {
                if (this.path.includes(devHubUser)) {
                    const mockDevHubData: MockTestOrgData = new MockTestOrgData();
                    mockDevHubData.username = devHubUser;
                    return Promise.resolve(mockDevHubData);
                }
                return Promise.resolve(await testData.getConfig());
            });
        });

        it ('steel thread', async () => {
            testData.createDevHubUsername(devHubUser);
            const org: Org = await Org.create( await Connection.create(await AuthInfo.create(testData.username)));

            const devHub: Org = await org.getDevHubOrg();
            expect(devHub.getMetaInfo().info.getFields().username).eq(devHubUser);
        });

        it ('org is devhub', async () => {
            testData.makeDevHub();
            const org: Org = await Org.create( await Connection.create(await AuthInfo.create(testData.username)));

            const devHub: Org = await org.getDevHubOrg();
            expect(devHub.getMetaInfo().info.getFields().username).eq(testData.username);
        });
    });

    describe('refresh auth', () => {
        let url;
        beforeEach(() => {
            $$.SANDBOX.stub(Config.prototype, 'readJSON').callsFake(async function() {
                return Promise.resolve(await testData.getConfig());
            });

            $$.SANDBOX.stub(Connection.prototype, 'request').callsFake(async (requestInfo: RequestInfo): Promise<any> => {
                url = requestInfo.url;
                return Promise.resolve({});
            });
        });
        it ('should request an refresh token', async () => {
            const org: Org = await Org.create( await Connection.create(await AuthInfo.create(testData.username)));
            await org.refreshAuth();
            // Todo add the apiversion to the test string
            expect(url).to.include(`${testData.instanceUrl}/services/data/v`);
        });
    });
});
