/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { deepStrictEqual } from 'assert';
import { constants as fsConstants } from 'fs';
import { tmpdir as osTmpdir } from 'os';
import { join as pathJoin } from 'path';
import { set } from '@salesforce/kit';
import { stubMethod } from '@salesforce/ts-sinon';
import { AnyJson, ensureJsonArray, ensureJsonMap, ensureString, JsonMap, Optional } from '@salesforce/ts-types';
import { assert, expect } from 'chai';
import { OAuth2 } from 'jsforce';
import { Transport } from 'jsforce/lib/transport';
import { AuthFields, AuthInfo } from '../../../src/org/authInfo';
import { Config } from '../../../src/config/config';
import { ConfigAggregator } from '../../../src/config/configAggregator';
import { ConfigFile } from '../../../src/config/configFile';
import { OrgUsersConfig } from '../../../src/config/orgUsersConfig';
import { SandboxOrgConfig } from '../../../src/config/sandboxOrgConfig';
import { Connection } from '../../../src/org/connection';
import { Global } from '../../../src/global';
import { Org } from '../../../src/org/org';
import { MockTestOrgData, testSetup } from '../../../src/testSetup';
import { fs } from '../../../src/util/fs';
import { MyDomainResolver } from '../../../src/status/myDomainResolver';
import { GlobalInfo, OrgAccessor } from '../../../src/globalInfo';
import { OrgConfigProperties } from '../../../src/org/orgConfigProperties';

const $$ = testSetup();

// Setup the test environment.

describe('Org Tests', () => {
  let testData: MockTestOrgData;

  const createOrgViaAuthInfo = async (username = testData.username) => {
    return Org.create({
      connection: await Connection.create({
        authInfo: await AuthInfo.create({ username }),
      }),
    });
  };

  beforeEach(async () => {
    testData = new MockTestOrgData();

    $$.configStubs.GlobalInfo = {
      contents: {
        orgs: {
          [testData.username]: await testData.getConfig(),
        },
      },
    };
    $$.SANDBOX.stub(MyDomainResolver.prototype, 'resolve').resolves('1.1.1.1');

    stubMethod($$.SANDBOX, Connection.prototype, 'useLatestApiVersion').returns(Promise.resolve());
  });

  describe('fields', () => {
    it('getField should get authinfo fields', async () => {
      const org: Org = await Org.create({ aliasOrUsername: testData.username });
      expect(org.getField(Org.Fields.ORG_ID)).to.eq(testData.orgId);
    });

    it('getField should get org properties', async () => {
      const org: Org = await Org.create({ aliasOrUsername: testData.username });
      expect(org.getField(Org.Fields.STATUS)).to.eq('UNKNOWN');
    });

    it('getFields should get a bunch of fields', async () => {
      const org: Org = await Org.create({ aliasOrUsername: testData.username });
      expect(org.getFields([Org.Fields.ORG_ID, Org.Fields.STATUS])).to.deep.eq({
        orgId: testData.orgId,
        status: 'UNKNOWN',
      });
    });
  });

  describe('org:create', () => {
    it('should create an org from a username', async () => {
      const org: Org = await Org.create({ aliasOrUsername: testData.username });
      expect(org.getUsername()).to.eq(testData.username);
    });

    it('should create an org from an alias', async () => {
      const config = await testData.getConfig();
      delete config.username;
      $$.configStubs.GlobalInfo = { contents: { orgs: { [testData.username]: config } } };
      const alias = 'foo';
      (await GlobalInfo.getInstance()).aliases.set(alias, testData.username);
      const org: Org = await Org.create({ aliasOrUsername: alias });
      expect(org.getUsername()).to.eq(testData.username);
    });

    it('should create an org from the target-org username', async () => {
      const config: Config = await Config.create(Config.getDefaultOptions(true));
      config.set(OrgConfigProperties.TARGET_ORG, testData.username);
      await config.write();

      const configAggregator: ConfigAggregator = await ConfigAggregator.create();

      const org: Org = await Org.create({ aggregator: configAggregator });
      expect(org.getUsername()).to.eq(testData.username);
    });

    it('should create a default devhub org', async () => {
      const config: Config = await Config.create(Config.getDefaultOptions(true));
      config.set(OrgConfigProperties.TARGET_DEV_HUB, testData.username);
      await config.write();

      const configAggregator: ConfigAggregator = await ConfigAggregator.create();

      const org: Org = await Org.create({
        aggregator: configAggregator,
        isDevHub: true,
      });
      expect(org.getUsername()).to.eq(testData.username);
    });

    it('should expose getUsername', async () => {
      const org: Org = await Org.create({ aliasOrUsername: testData.username });
      expect(org.getUsername()).to.eq(testData.username);
    });

    it('should expose getOrgId', async () => {
      const org: Org = await Org.create({ aliasOrUsername: testData.username });
      expect(org.getOrgId()).to.eq(testData.orgId);
    });
  });

  describe('retrieveMaxApiVersion', () => {
    it('no username', async () => {
      $$.SANDBOXES.CONNECTION.restore();
      stubMethod($$.SANDBOXES.CONNECTION, Connection.prototype, 'request').callsFake(() =>
        Promise.resolve([{ version: '89.0' }, { version: '90.0' }, { version: '88.0' }])
      );
      const org: Org = await Org.create({
        connection: await Connection.create({
          authInfo: await AuthInfo.create({ username: testData.username }),
          connectionOptions: {
            instanceUrl: 'https://orgTest.instanceUrl',
          },
        }),
      });
      const apiVersion = await org.retrieveMaxApiVersion();
      expect(apiVersion).to.equal('90.0');
    });
  });

  describe('cleanLocalOrgData', () => {
    describe('mock remove', () => {
      let removeStub: sinon.SinonStub;
      beforeEach(() => {
        removeStub = stubMethod($$.SANDBOX, fs, 'remove').callsFake(() => {
          return Promise.resolve();
        });
      });

      it('no org data path', async () => {
        const org = await createOrgViaAuthInfo();

        expect(removeStub.callCount).to.be.equal(0);
        await org.cleanLocalOrgData();
        expect(removeStub.callCount).to.be.equal(1);
      });
    });

    it('InvalidProjectWorkspaceError', async () => {
      $$.SANDBOXES.CONFIG.restore();
      // Cleared the config, so manually set the authorization.
      (await GlobalInfo.getInstance()).orgs.set(testData.username, await testData.getConfig());
      stubMethod($$.SANDBOX, GlobalInfo.prototype, 'write').callsFake(() => {});
      let invalidProjectWorkspace = false;
      stubMethod($$.SANDBOX, ConfigFile, 'resolveRootFolder').callsFake(() => {
        invalidProjectWorkspace = true;
        const error = new Error();
        error.name = 'InvalidProjectWorkspaceError';
        throw error;
      });
      stubMethod($$.SANDBOX, ConfigFile, 'resolveRootFolderSync').callsFake(() => {
        return $$.rootPathRetrieverSync(false);
      });
      stubMethod($$.SANDBOX, fs, 'readJsonMap').callsFake(() => Promise.resolve({}));
      const orgDataPath = 'foo';
      const org = await createOrgViaAuthInfo();

      await org.cleanLocalOrgData(orgDataPath);
      expect(invalidProjectWorkspace).to.be.equal(true);
    });

    it('Random Error', async () => {
      $$.SANDBOXES.CONFIG.restore();
      // Cleared the config, so manually set the authorization.
      (await GlobalInfo.getInstance()).orgs.set(testData.username, await testData.getConfig());
      stubMethod($$.SANDBOX, GlobalInfo.prototype, 'write').callsFake(() => {});
      stubMethod($$.SANDBOX, ConfigFile, 'resolveRootFolder').callsFake(() => {
        const err = new Error();
        err.name = 'gozer';
        throw err;
      });
      stubMethod($$.SANDBOX, ConfigFile, 'resolveRootFolderSync').callsFake(() => {
        return osTmpdir();
      });
      stubMethod($$.SANDBOX, fs, 'readJsonMap').callsFake(() => Promise.resolve({}));
      const orgDataPath = 'foo';
      const org = await createOrgViaAuthInfo();

      try {
        await org.cleanLocalOrgData(orgDataPath);
        assert.fail('This should have failed');
      } catch (e) {
        expect(e).to.have.property('name', 'gozer');
      }
    });
  });

  describe('remove', () => {
    const configFileReadJsonMock = async function (this: ConfigFile<ConfigFile.Options>) {
      if (this.getPath().includes('sf.json')) {
        return Promise.resolve({ orgs: { [testData.username]: await testData.getConfig() } });
      }

      return Promise.resolve({});
    };

    beforeEach(() => {
      $$.configStubs.GlobalInfo = {
        retrieveContents: configFileReadJsonMock,
      };
    });

    describe('delete', () => {
      describe('scratch org', () => {
        it('should throw error when attempting to delete devhub org', async () => {
          const org = await createOrgViaAuthInfo();
          const dev = await createOrgViaAuthInfo();

          try {
            await org.deleteFrom(dev);
            assert.fail('the above should throw an error');
          } catch (e) {
            expect(e.message).to.contain('The Dev Hub org cannot be deleted.');
          }
        });

        it('should delete the org from the DevHub org', async () => {
          const dev = await createOrgViaAuthInfo();

          const orgTestData = new MockTestOrgData();
          const org = await createOrgViaAuthInfo(orgTestData.username);

          const devHubQuery = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves({
            Id: orgTestData.orgId,
          });
          const devHubDelete = stubMethod($$.SANDBOX, Connection.prototype, 'delete').resolves();
          const removeSpy = stubMethod($$.SANDBOX, org, 'remove');

          await org.deleteFrom(dev);

          expect(devHubQuery.calledOnce).to.be.true;
          expect(devHubQuery.firstCall.args[0]).to.equal(
            `SELECT Id FROM ActiveScratchOrg WHERE SignupUsername='${orgTestData.username}'`
          );
          expect(devHubDelete.calledOnce).to.be.true;
          expect(devHubDelete.firstCall.args).to.deep.equal(['ActiveScratchOrg', orgTestData.orgId]);
          expect(removeSpy.calledOnce).to.be.true;
        });

        it('should handle INVALID_TYPE or INSUFFICIENT_ACCESS_OR_READONLY errors', async () => {
          const dev = await createOrgViaAuthInfo();

          const orgTestData = new MockTestOrgData();
          const org = await createOrgViaAuthInfo(orgTestData.username);

          const e = new Error('test error');
          e.name = 'INVALID_TYPE';

          stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').throws(e);

          try {
            await org.deleteFrom(dev);
            assert.fail('the above should throw an error');
          } catch (err) {
            expect(err.message).to.contain(
              'You do not have the appropriate permissions to delete a scratch org. Please contact your Salesforce admin.'
            );
          }
        });

        it('should handle SingleRecordQueryErrors.NoRecords errors', async () => {
          const dev = await createOrgViaAuthInfo();

          const orgTestData = new MockTestOrgData();
          const org = await createOrgViaAuthInfo(orgTestData.username);

          const e = new Error('test error');
          e.name = SingleRecordQueryErrors.NoRecords;

          stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').throws(e);

          try {
            await org.deleteFrom(dev);
            assert.fail('the above should throw an error');
          } catch (err) {
            expect(err.message).to.contain('Attempting to delete an expired or deleted org');
          }
        });
      });

      describe('sandbox', () => {
        it('should calculate sandbox name from production username correctly', async () => {
          const prodTestData = new MockTestOrgData('1234', { username: 'admin@production.org' });
          const prod = await createOrgViaAuthInfo(prodTestData.username);

          const orgTestData = new MockTestOrgData('4321', { username: 'admin@production.org.dev1' });
          const org = await createOrgViaAuthInfo(orgTestData.username);

          stubMethod($$.SANDBOX, org, 'getSandboxOrgConfigField').resolves(prodTestData.username);
          const prodQuerySpy = stubMethod($$.SANDBOX, prod.getConnection(), 'singleRecordQuery').resolves({
            SandboxInfoId: orgTestData.orgId,
          });
          const prodDelete = stubMethod($$.SANDBOX, prod.getConnection().tooling, 'delete').resolves({ success: true });
          const removeSpy = stubMethod($$.SANDBOX, org, 'remove');

          await org.deleteFrom(prod);

          expect(prodQuerySpy.calledOnce).to.be.true;
          expect(prodQuerySpy.firstCall.args[0]).to.equal(
            "SELECT SandboxInfoId FROM SandboxProcess WHERE SandboxName ='dev1' AND Status NOT IN ('D', 'E')"
          );
          expect(prodDelete.calledOnce).to.be.true;
          expect(prodDelete.firstCall.args).to.deep.equal(['SandboxInfo', orgTestData.orgId]);
          expect(removeSpy.calledOnce).to.be.true;
        });

        it('should calculate sandbox name from orgId after first query throws', async () => {
          const prodTestData = new MockTestOrgData('1234', { username: 'admin@production.org' });
          const prod = await createOrgViaAuthInfo(prodTestData.username);

          const orgTestData = new MockTestOrgData('4321', { username: 'admin@production.org.dev1' });
          const org = await createOrgViaAuthInfo(orgTestData.username);

          stubMethod($$.SANDBOX, org, 'getSandboxOrgConfigField').resolves(prodTestData.username);
          const prodQuerySpy = stubMethod($$.SANDBOX, prod.getConnection(), 'singleRecordQuery')
            .onFirstCall()
            .throws('abc')
            .onSecondCall()
            .resolves({
              SandboxInfoId: orgTestData.orgId,
            });
          const prodDelete = stubMethod($$.SANDBOX, prod.getConnection().tooling, 'delete').resolves({ success: true });
          const removeSpy = stubMethod($$.SANDBOX, org, 'remove');
          stubMethod($$.SANDBOX, org, 'getOrgId').returns(orgTestData.orgId);

          await org.deleteFrom(prod);

          expect(prodQuerySpy.calledTwice).to.be.true;
          expect(prodQuerySpy.firstCall.args[0]).to.equal(
            "SELECT SandboxInfoId FROM SandboxProcess WHERE SandboxName ='dev1' AND Status NOT IN ('D', 'E')"
          );
          expect(prodQuerySpy.secondCall.args[0]).to.equal(
            "SELECT SandboxInfoId FROM SandboxProcess WHERE SandboxOrganization ='4321' AND Status NOT IN ('D', 'E')"
          );
          expect(prodDelete.calledOnce).to.be.true;
          expect(prodDelete.firstCall.args).to.deep.equal(['SandboxInfo', orgTestData.orgId]);
          expect(removeSpy.calledOnce).to.be.true;
        });

        it('should calculate and locate sandbox from trimTo15 orgId', async () => {
          const prodTestData = new MockTestOrgData();
          const prod = await createOrgViaAuthInfo(prodTestData.username);

          const orgTestData = new MockTestOrgData('0GR4p000000U8CBGA0');
          const org = await createOrgViaAuthInfo(orgTestData.username);

          stubMethod($$.SANDBOX, org, 'getSandboxOrgConfigField').resolves(prodTestData.username);
          const prodQuerySpy = stubMethod($$.SANDBOX, prod.getConnection(), 'singleRecordQuery').resolves({
            SandboxInfoId: orgTestData.orgId,
          });
          const prodDelete = stubMethod($$.SANDBOX, prod.getConnection().tooling, 'delete').resolves({ success: true });
          const removeSpy = stubMethod($$.SANDBOX, org, 'remove');
          stubMethod($$.SANDBOX, org, 'getOrgId').returns(orgTestData.orgId);

          await org.deleteFrom(prod);

          expect(prodQuerySpy.calledOnce).to.be.true;
          expect(prodQuerySpy.firstCall.args[0]).to.equal(
            "SELECT SandboxInfoId FROM SandboxProcess WHERE SandboxOrganization ='0GR4p000000U8CB' AND Status NOT IN ('D', 'E')"
          );
          expect(prodDelete.calledOnce).to.be.true;
          expect(prodDelete.firstCall.args).to.deep.equal(['SandboxInfo', orgTestData.orgId]);
          expect(removeSpy.calledOnce).to.be.true;
        });
      });
    });

    it('should remove all assets associated with the org', async () => {
      const org = await createOrgViaAuthInfo();

      const deletedPaths: string[] = [];
      stubMethod($$.SANDBOX, ConfigFile.prototype, 'unlink').callsFake(function (this: ConfigFile<ConfigFile.Options>) {
        deletedPaths.push(this.getPath());
        return Promise.resolve({});
      });

      stubMethod($$.SANDBOX, fs, 'remove').callsFake(() => {
        return Promise.resolve({});
      });

      stubMethod($$.SANDBOX, ConfigFile.prototype, 'exists').callsFake(async () => {
        return Promise.resolve(true);
      });

      await org.remove();

      expect(deletedPaths).includes(
        pathJoin(await $$.globalPathRetriever($$.id), Global.SFDX_STATE_FOLDER, `${testData.orgId}.json`)
      );

      expect(deletedPaths).includes(
        pathJoin(await $$.globalPathRetriever($$.id), Global.SFDX_STATE_FOLDER, `${testData.orgId}.sandbox.json`)
      );
    });

    it('should not fail when no scratch org has been written', async () => {
      const org = await createOrgViaAuthInfo();

      const error: Error = new Error();
      set(error, 'code', 'ENOENT');

      stubMethod($$.SANDBOX, ConfigFile.prototype, 'unlink').callsFake(async () => {
        throw error;
      });

      stubMethod($$.SANDBOX, fs, 'remove').callsFake(async () => {
        return Promise.reject(error);
      });

      try {
        await org.remove();
      } catch (e) {
        assert.fail('Removes should throw and error when removing an orgConfig');
      }
    });

    it('should remove config setting', async () => {
      stubMethod($$.SANDBOX, ConfigFile.prototype, 'exists').callsFake(async function () {
        return this.path && this.path.endsWith(`${testData.orgId}.json`);
      });

      stubMethod($$.SANDBOX, fs, 'unlink').callsFake(() => {
        return Promise.resolve({});
      });

      const configAggregator: ConfigAggregator = await ConfigAggregator.create();
      const org: Org = await Org.create({
        connection: await Connection.create({
          authInfo: await AuthInfo.create({ username: testData.username }),
        }),
        aggregator: configAggregator,
      });

      const config: Config = await Config.create(Config.getDefaultOptions(true));
      config.set(OrgConfigProperties.TARGET_ORG, testData.username);
      await config.write();

      await configAggregator.reload();
      expect(configAggregator.getInfo(OrgConfigProperties.TARGET_ORG)).has.property('value', testData.username);

      await org.remove();
      await configAggregator.reload();

      const targetOrg = configAggregator.getInfo(OrgConfigProperties.TARGET_ORG);
      expect(targetOrg.value).eq(undefined);
    });

    it('should remove the alias', async () => {
      stubMethod($$.SANDBOX, ConfigFile.prototype, 'exists').callsFake(async function () {
        return this.path && this.path.endsWith(`${testData.orgId}.json`);
      });

      stubMethod($$.SANDBOX, fs, 'unlink').callsFake(() => {
        return Promise.resolve({});
      });
      const org = await createOrgViaAuthInfo();

      const globalInfo = await GlobalInfo.getInstance();
      globalInfo.aliases.set('foo', testData.username);
      const user = globalInfo.aliases.getUsername('foo');
      expect(user).eq(testData.username);

      await org.remove();

      const alias = globalInfo.aliases.get('foo');
      expect(alias).eq(null);
    });

    it('should not fail when no sandboxOrgConfig', async () => {
      const org = await createOrgViaAuthInfo();

      const deletedPaths: string[] = [];
      stubMethod($$.SANDBOX, ConfigFile.prototype, 'unlink').callsFake(function (this: ConfigFile<ConfigFile.Options>) {
        deletedPaths.push(this.getPath());
        return Promise.resolve({});
      });

      stubMethod($$.SANDBOX, fs, 'remove').callsFake(() => {
        return Promise.resolve({});
      });

      await org.remove();

      expect(deletedPaths).not.includes(
        pathJoin(await $$.globalPathRetriever($$.id), Global.SFDX_STATE_FOLDER, `${testData.orgId}.sandbox.json`)
      );
    });
  });

  describe('with multiple scratch org users', () => {
    let orgs: Org[];
    beforeEach(async () => {
      orgs = [];

      const orgIdUser = 'p.venkman@gb.org';
      const addedUser = 'winston@gb.org';
      const accessTokenUser = 'ltully@gb.org';

      const users = [
        new MockTestOrgData().createUser(orgIdUser),
        new MockTestOrgData().createUser(addedUser),
        new MockTestOrgData().createUser(accessTokenUser),
      ];

      $$.SANDBOXES.CONFIG.restore();
      const uniqDirForTestRun = $$.uniqid();
      stubMethod($$.SANDBOX, ConfigFile, 'resolveRootFolderSync').callsFake((isGlobal: boolean) =>
        $$.rootPathRetrieverSync(isGlobal, uniqDirForTestRun)
      );

      let userAuthResponse: AnyJson = null;
      stubMethod($$.SANDBOX, OAuth2.prototype, '_postParams').callsFake(() => Promise.resolve(userAuthResponse));

      let responseBody: AnyJson = null;
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').callsFake(() => {
        return Promise.resolve(responseBody);
      });

      for (const user of users) {
        userAuthResponse = {
          // eslint-disable-next-line camelcase
          access_token: user.accessToken,
          // eslint-disable-next-line camelcase
          instance_url: user.instanceUrl,
          id: user.testId,
          // eslint-disable-next-line camelcase
          refresh_token: user.refreshToken,
        };

        responseBody = {
          body: JSON.stringify({ Username: user.username, OrgId: user.orgId }),
        };
        const oauth2Options = {
          authCode: 'test',
          clientSecret: user.clientSecret,
          loginUrl: user.loginUrl,
          redirectUri: user.redirectUri,
        };
        const authInfo = await AuthInfo.create({
          username: user.username,
          oauth2Options,
        });
        await authInfo.save({ orgId: user.orgId });

        const configAggregator: ConfigAggregator = await ConfigAggregator.create();

        const org: Org = await Org.create({
          connection: await Connection.create({
            authInfo,
          }),
          aggregator: configAggregator,
        });

        orgs.push(org);
      }

      await orgs[0].addUsername(await AuthInfo.create({ username: orgs[1].getUsername() }));
    });

    it('should validate expected files', async () => {
      const user0Config: OrgUsersConfig = await orgs[0].retrieveOrgUsersConfig();
      const user1Config: OrgUsersConfig = await orgs[1].retrieveOrgUsersConfig();

      expect(await user0Config.access(fsConstants.R_OK)).to.be.true;
      expect(await user1Config.access(fsConstants.R_OK)).to.be.false;
    });

    it('should remove aliases and config settings', async () => {
      const config: Config = await Config.create(Config.getDefaultOptions(true));

      const org0Username = orgs[0].getUsername();
      config.set(OrgConfigProperties.TARGET_ORG, ensureString(org0Username));
      await config.write();

      expect(await config.exists()).to.be.true;

      const configAggregator = await orgs[0].getConfigAggregator().reload();
      const info = configAggregator.getInfo(OrgConfigProperties.TARGET_ORG);
      expect(info).has.property('value', org0Username);

      const org1Username = orgs[1].getUsername();

      const globalInfo = await GlobalInfo.getInstance();
      globalInfo.aliases.set('foo', org1Username);
      const user = globalInfo.aliases.getUsername('foo');
      expect(user).eq(org1Username);

      await orgs[0].remove();

      await configAggregator.reload();
      expect(configAggregator.getInfo(OrgConfigProperties.TARGET_ORG)).has.property('value', undefined);

      const alias = globalInfo.aliases.get(user);
      expect(alias).eq(null);
    });

    it('should not try to delete auth files when deleting an org via access token', async () => {
      await orgs[2].remove();

      const user0Config: OrgUsersConfig = await orgs[0].retrieveOrgUsersConfig();
      const user1Config: OrgUsersConfig = await orgs[1].retrieveOrgUsersConfig();

      expect(await user0Config.access(fsConstants.R_OK)).to.be.true;
      expect(await user1Config.access(fsConstants.R_OK)).to.be.false;
    });
  });

  describe('checkScratchOrg', () => {
    let returnResult: JsonMap | string;
    let org: Org;
    let connection: Connection;
    beforeEach(async () => {
      stubMethod($$.SANDBOX, Connection.prototype, 'query').callsFake(async () => {
        if (returnResult === 'throw') {
          const error = new Error();
          error.name = 'INVALID_TYPE';
          throw error;
        }
        return returnResult;
      });

      const devHub = 'foo@devhub.com';
      const devHubConfig = new MockTestOrgData();
      devHubConfig.username = devHub;

      $$.configStubs.GlobalInfo = {
        contents: {
          orgs: {
            [testData.username]: await testData.getConfig(),
            [devHub]: await devHubConfig.getConfig(),
          },
        },
      };

      const configAggregator: ConfigAggregator = await ConfigAggregator.create();
      connection = await Connection.create({
        authInfo: await AuthInfo.create({ username: testData.username }),
      });
      org = await Org.create({ connection, aggregator: configAggregator });

      const config: Config = await Config.create(Config.getDefaultOptions(true));
      config.set(OrgConfigProperties.TARGET_DEV_HUB, devHub);
      await config.write();

      await org.getConfigAggregator().reload();
    });

    it('validate is a scratch org', async () => {
      returnResult = { records: [{}] };
      const fields: Partial<AuthFields> = await org.checkScratchOrg();
      deepStrictEqual(fields, connection.getAuthInfoFields());
    });

    it('validate is not scratch org', async () => {
      returnResult = { records: [] };
      try {
        await org.checkScratchOrg();
        assert.fail('This test is expected to fail.');
      } catch (err) {
        expect(err).to.have.property('name', 'NoResultsError');
      }
    });

    it('validate is not scratch org', async () => {
      returnResult = 'throw';
      try {
        await org.checkScratchOrg();
        assert.fail('This test is expected to fail.');
      } catch (err) {
        expect(err).to.have.property('name', 'NotADevHubError');
      }
    });
  });

  describe('getDevHubOrg', () => {
    const devHubUser = 'ray@gb.org';
    beforeEach(async () => {
      const mockDevHubData: MockTestOrgData = new MockTestOrgData();
      mockDevHubData.username = devHubUser;
      const retrieve = async function (this: ConfigFile<ConfigFile.Options>) {
        return {
          orgs: {
            [testData.username]: await testData.getConfig(),
            [mockDevHubData.username]: await mockDevHubData.getConfig(),
          },
        };
      };
      $$.configStubs.GlobalInfo = { retrieveContents: retrieve };
    });

    it('steel thread', async () => {
      testData.createDevHubUsername(devHubUser);
      const org = await createOrgViaAuthInfo();

      const devHub: Optional<Org> = await org.getDevHubOrg();
      expect(devHub.getUsername()).eq(devHubUser);
    });

    it('org is devhub', async () => {
      testData.makeDevHub();
      const org = await createOrgViaAuthInfo();

      const devHub: Optional<Org> | undefined = await org.getDevHubOrg();
      expect(devHub.getUsername()).eq(testData.username);
    });
  });

  describe('refresh auth', () => {
    let url: string;
    beforeEach(() => {
      $$.fakeConnectionRequest = (requestInfo: AnyJson): Promise<AnyJson> => {
        url = ensureString(ensureJsonMap(requestInfo).url);
        return Promise.resolve({});
      };
    });
    it('should request an refresh token', async () => {
      const org = await createOrgViaAuthInfo();

      await org.refreshAuth();
      // Todo add the apiversion to the test string
      expect(url).to.include(`${testData.instanceUrl}/services/data/v`);
    });
  });

  describe('readUserAuthFiles', () => {
    let orgs: Org[];

    let mock0: MockTestOrgData;
    let mock1: MockTestOrgData;
    let mock2: MockTestOrgData;

    beforeEach(async () => {
      orgs = [];

      mock0 = new MockTestOrgData();
      mock1 = new MockTestOrgData();
      mock2 = new MockTestOrgData();

      $$.configStubs.GlobalInfo = {
        contents: {
          orgs: {
            [mock0.username]: await mock0.getConfig(),
            [mock1.username]: await mock1.getConfig(),
            [mock2.username]: await mock2.getConfig(),
          },
        },
      };

      orgs[0] = await Org.create({
        connection: await Connection.create({
          authInfo: await AuthInfo.create({ username: mock0.username }),
        }),
      });
      orgs[1] = await Org.create({
        connection: await Connection.create({
          authInfo: await AuthInfo.create({ username: mock1.username }),
        }),
      });
      orgs[2] = await Org.create({
        connection: await Connection.create({
          authInfo: await AuthInfo.create({ username: mock2.username }),
        }),
      });
    });

    it('should read all auth files from an org file', async () => {
      await orgs[0].addUsername(await AuthInfo.create({ username: orgs[1].getUsername() }));
      await orgs[0].addUsername(await AuthInfo.create({ username: orgs[2].getUsername() }));

      const orgUsers: AuthInfo[] = await orgs[0].readUserAuthFiles();
      let expectedUsers = [mock0.username, mock1.username, mock2.username];
      for (const info of orgUsers) {
        expectedUsers = expectedUsers.filter((user) => info.getFields().username !== user);
      }
      expect(expectedUsers.length).to.eq(0);
    });

    it('should read just the scratch org admin auth file when no org file', async () => {
      const orgUsers: AuthInfo[] = await orgs[0].readUserAuthFiles();
      let expectedUsers = [mock0.username];
      for (const info of orgUsers) {
        expectedUsers = expectedUsers.filter((user) => info.getFields().username !== user);
      }
      expect(expectedUsers.length).to.eq(0);
    });

    describe('removeUsername', () => {
      it('should remove all usernames', async () => {
        await orgs[0].addUsername(ensureString(orgs[1].getUsername()));
        await orgs[0].addUsername(ensureString(orgs[2].getUsername()));

        await orgs[0].removeUsername(ensureString(orgs[1].getUsername()));
        let usersPresent = ensureJsonArray($$.getConfigStubContents('OrgUsersConfig').usernames);
        expect(usersPresent.length).to.be.eq(2);
        expect(usersPresent).to.not.include(mock1.username);

        await orgs[0].removeUsername(ensureString(orgs[2].getUsername()));
        usersPresent = ensureJsonArray($$.getConfigStubContents('OrgUsersConfig').usernames);
        expect(usersPresent.length).to.be.eq(1);
        expect(usersPresent).to.not.include(mock2.username);
      });
    });
  });

  describe('determineDevHub', () => {
    it('should return true and cache if dev hub', async () => {
      const org: Org = await Org.create({ aliasOrUsername: testData.username });
      $$.fakeConnectionRequest = async () => {
        return { records: [] };
      };
      expect(org.isDevHubOrg()).to.be.false;
      expect(await org.determineIfDevHubOrg()).to.be.true;
      expect(org.isDevHubOrg()).to.be.true;
    });
    it('should return false and cache if dev hub', async () => {
      const org: Org = await Org.create({ aliasOrUsername: testData.username });
      $$.fakeConnectionRequest = async () => {
        throw new Error();
      };
      expect(org.isDevHubOrg()).to.be.false;
      expect(await org.determineIfDevHubOrg()).to.be.false;
      expect(org.isDevHubOrg()).to.be.false;
    });
    it('should not call server is cached', async () => {
      $$.configStubs.GlobalInfo.contents = {
        orgs: {
          [testData.username]: { isDevHub: false },
        },
      };
      const org: Org = await Org.create({ aliasOrUsername: testData.username });
      const spy = $$.SANDBOX.spy();
      $$.fakeConnectionRequest = spy;
      expect(org.isDevHubOrg()).to.be.false;
      expect(await org.determineIfDevHubOrg()).to.be.false;
      expect(spy.called).to.be.false;
    });
    it('should call server is cached but forced', async () => {
      $$.configStubs.GlobalInfo.contents = {
        orgs: {
          [testData.username]: { isDevHub: false },
        },
      };
      const org: Org = await Org.create({ aliasOrUsername: testData.username });
      const spy = $$.SANDBOX.stub().returns(Promise.resolve({ records: [] }));
      $$.fakeConnectionRequest = spy;
      expect(org.isDevHubOrg()).to.be.false;
      expect(await org.determineIfDevHubOrg(true)).to.be.true;
      expect(spy.called).to.be.true;
      expect(org.isDevHubOrg()).to.be.true;
    });
  });

  describe('sandbox org config', () => {
    it('set field', async () => {
      const org: Org = await Org.create({ aliasOrUsername: testData.username });
      expect(await org.getSandboxOrgConfigField(SandboxOrgConfig.Fields.PROD_ORG_USERNAME)).to.be.undefined;

      await org.setSandboxOrgConfigField(SandboxOrgConfig.Fields.PROD_ORG_USERNAME, 'user@sandbox.org');

      expect(await org.getSandboxOrgConfigField(SandboxOrgConfig.Fields.PROD_ORG_USERNAME)).to.eq('user@sandbox.org');
    });

    it('Test sandbox config removal.', async () => {
      // Stub exists so only the auth file and sandbox config file exist. No users config file.
      stubMethod($$.SANDBOX, ConfigFile.prototype, 'exists').callsFake(async function () {
        if (this.path && this.path.endsWith(`${testData.orgId}.json`)) {
          return Promise.resolve(false);
        }
        return Promise.resolve(true);
      });

      stubMethod($$.SANDBOX, OrgAccessor.prototype, 'has').callsFake(async function () {
        if (this.path && this.path.includes(testData.orgId)) {
          return Promise.resolve(false);
        }
        return Promise.resolve(true);
      });

      // Stub to track the deleted paths.
      const deletedPaths: string[] = [];
      stubMethod($$.SANDBOX, ConfigFile.prototype, 'unlink').callsFake(function (this: ConfigFile<ConfigFile.Options>) {
        deletedPaths.push(this.getPath());
        return Promise.resolve({});
      });

      const unsetSpy = stubMethod($$.SANDBOX, OrgAccessor.prototype, 'unset').returns(null);

      // Create an org and add a sandbox config
      const org: Org = await Org.create({ aliasOrUsername: testData.username });
      expect(await org.getSandboxOrgConfigField(SandboxOrgConfig.Fields.PROD_ORG_USERNAME)).to.be.undefined;
      await org.setSandboxOrgConfigField(SandboxOrgConfig.Fields.PROD_ORG_USERNAME, 'user@sandbox.org');
      expect(await org.getSandboxOrgConfigField(SandboxOrgConfig.Fields.PROD_ORG_USERNAME)).to.eq('user@sandbox.org');

      // Remove the org
      await org.remove();
      // Expect the authorization to be removed
      expect(unsetSpy.firstCall.args).to.deep.equal([testData.username]);
      // Expect the sandbox config is deleted.
      expect(deletedPaths).includes(
        pathJoin(await $$.globalPathRetriever($$.id), Global.SFDX_STATE_FOLDER, `${testData.orgId}.sandbox.json`)
      );
    });
  });
});
