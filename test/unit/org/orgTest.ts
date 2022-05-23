/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { deepStrictEqual, fail } from 'assert';
import * as fs from 'fs';
import { constants as fsConstants } from 'fs';
import { join as pathJoin } from 'path';
import { Duration, set } from '@salesforce/kit';
import { stubMethod } from '@salesforce/ts-sinon';
import { AnyJson, ensureJsonArray, ensureJsonMap, ensureString, JsonMap, Optional } from '@salesforce/ts-types';
import { assert, expect } from 'chai';
import { OAuth2 } from 'jsforce';
import { Transport } from 'jsforce/lib/transport';
import { SinonStub } from 'sinon';
import {
  AuthInfo,
  Connection,
  Org,
  SandboxProcessObject,
  SandboxUserAuthResponse,
  SingleRecordQueryErrors,
} from '../../../src/org';
import { Config } from '../../../src/config/config';
import { ConfigAggregator } from '../../../src/config/configAggregator';
import { ConfigFile } from '../../../src/config/configFile';
import { OrgUsersConfig } from '../../../src/config/orgUsersConfig';
import { Global } from '../../../src/global';
import { MockTestOrgData, testSetup } from '../../../src/testSetup';
import { MyDomainResolver } from '../../../src/status/myDomainResolver';
import { StateAggregator } from '../../../src/stateAggregator';
import { OrgConfigProperties } from '../../../src/org/orgConfigProperties';
import { Messages } from '../../../src/messages';
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'org');

// Setup the test environment.
const $$ = testSetup();

describe('Org Tests', () => {
  let testData: MockTestOrgData;
  let createOrgViaAuthInfo: (username?: string, org?: MockTestOrgData) => Promise<Org>;

  beforeEach(async () => {
    testData = new MockTestOrgData();

    $$.setConfigStubContents('AuthInfoConfig', { contents: await testData.getConfig() });
    $$.SANDBOX.stub(MyDomainResolver.prototype, 'resolve').resolves('1.1.1.1');

    stubMethod($$.SANDBOX, Connection.prototype, 'useLatestApiVersion').returns(Promise.resolve());

    createOrgViaAuthInfo = async (username = testData.username, org?: MockTestOrgData) => {
      const existing = $$.getConfigStubContents('AuthInfoConfig') ?? {};
      const updated = org ?? (await testData.getConfig());

      $$.setConfigStubContents('AuthInfoConfig', { contents: Object.assign(existing, updated) });
      return Org.create({
        connection: await Connection.create({
          authInfo: await AuthInfo.create({ username }),
        }),
      });
    };
  });

  describe('fields', () => {
    it('getField should get authinfo fields', async () => {
      const org = await Org.create({ aliasOrUsername: testData.username });
      expect(org.getField(Org.Fields.ORG_ID)).to.eq(testData.orgId);
    });

    it('getField should get org properties', async () => {
      const org = await Org.create({ aliasOrUsername: testData.username });
      expect(org.getField(Org.Fields.STATUS)).to.eq('UNKNOWN');
    });

    it('getFields should get a bunch of fields', async () => {
      const org = await Org.create({ aliasOrUsername: testData.username });
      expect(org.getFields([Org.Fields.ORG_ID, Org.Fields.STATUS])).to.deep.eq({
        orgId: testData.orgId,
        status: 'UNKNOWN',
      });
    });
  });

  describe('org:create', () => {
    it('should create an org from a username', async () => {
      const org = await Org.create({ aliasOrUsername: testData.username });
      expect(org.getUsername()).to.eq(testData.username);
    });

    it('should create an org from an alias', async () => {
      const config = await testData.getConfig();
      delete config.username;
      const alias = 'foo';
      $$.setConfigStubContents('AuthInfoConfig', { contents: config });
      $$.setConfigStubContents('AliasesConfig', { contents: { [alias]: testData.username } });
      const org = await Org.create({ aliasOrUsername: alias });
      expect(org.getUsername()).to.eq(testData.username);
    });

    it('should create an org from the target-org username', async () => {
      const config = await Config.create(Config.getDefaultOptions(true));
      config.set(OrgConfigProperties.TARGET_ORG, testData.username);
      await config.write();

      const configAggregator = await ConfigAggregator.create();

      const org: Org = await Org.create({ aggregator: configAggregator });
      expect(org.getUsername()).to.eq(testData.username);
    });

    it('should create a default devhub org', async () => {
      const config = await Config.create(Config.getDefaultOptions(true));
      config.set(OrgConfigProperties.TARGET_DEV_HUB, testData.username);
      await config.write();

      const configAggregator = await ConfigAggregator.create();

      const org = await Org.create({
        aggregator: configAggregator,
        isDevHub: true,
      });
      expect(org.getUsername()).to.eq(testData.username);
    });

    it('should expose getUsername', async () => {
      const org = await Org.create({ aliasOrUsername: testData.username });
      expect(org.getUsername()).to.eq(testData.username);
    });

    it('should expose getOrgId', async () => {
      const org = await Org.create({ aliasOrUsername: testData.username });
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
        removeStub = stubMethod($$.SANDBOX, fs.promises, 'rmdir').resolves();
      });

      it('no org data path', async () => {
        const org = await createOrgViaAuthInfo();

        expect(removeStub.callCount).to.be.equal(0);
        await org.cleanLocalOrgData();
        expect(removeStub.callCount).to.be.equal(1);
      });
    });

    it('InvalidProjectWorkspaceError', async () => {
      let invalidProjectWorkspaceError = false;
      stubMethod($$.SANDBOX, Org.prototype, 'getLocalDataDir').callsFake(() => {
        invalidProjectWorkspaceError = true;
        const error = new Error();
        error.name = 'InvalidProjectWorkspaceError';
        throw error;
      });

      const org = await createOrgViaAuthInfo();
      await org.cleanLocalOrgData('INVALID_PATH');
      expect(invalidProjectWorkspaceError).to.be.true;
    });

    it('Random Error', async () => {
      stubMethod($$.SANDBOX, Org.prototype, 'getLocalDataDir').callsFake(() => {
        const error = new Error();
        error.name = 'UnknownError';
        throw error;
      });

      try {
        const org = await createOrgViaAuthInfo();
        await org.cleanLocalOrgData('INVALID_PATH');
        assert.fail('This should have failed');
      } catch (e) {
        expect(e).to.have.property('name', 'UnknownError');
      }
    });
  });

  describe('remove', () => {
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
          const dev = await createOrgViaAuthInfo(testData.username);
          const orgTestData = new MockTestOrgData();
          const org = await createOrgViaAuthInfo(orgTestData.username, orgTestData);

          const devHubQuery = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves({
            Id: orgTestData.orgId,
          });
          const devHubDelete = stubMethod($$.SANDBOX, Org.prototype, 'destroyScratchOrg').resolves();
          const removeSpy = stubMethod($$.SANDBOX, org, 'remove');

          await org.deleteFrom(dev);

          expect(devHubQuery.calledOnce).to.be.true;
          expect(devHubQuery.firstCall.args[0]).to.equal(
            `SELECT Id FROM ActiveScratchOrg WHERE SignupUsername='${orgTestData.username}'`
          );

          expect(devHubDelete.calledOnce).to.be.true;
          expect(devHubDelete.firstCall.args[1]).to.equal(orgTestData.orgId);
          expect(removeSpy.calledOnce).to.be.true;
        });

        it('should handle INVALID_TYPE or INSUFFICIENT_ACCESS_OR_READONLY errors', async () => {
          const dev = await createOrgViaAuthInfo();

          const orgTestData = new MockTestOrgData();
          const org = await createOrgViaAuthInfo(orgTestData.username, orgTestData);

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
          const org = await createOrgViaAuthInfo(orgTestData.username, orgTestData);

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
        it('should calculate sandbox name from orgId after first query throws', async () => {
          const prodTestData = new MockTestOrgData('1234', { username: 'admin@production.org' });
          const prod = await createOrgViaAuthInfo(prodTestData.username);

          const orgTestData = new MockTestOrgData('4321', { username: 'admin@production.org.dev1' });
          const org = await createOrgViaAuthInfo(orgTestData.username);
          stubMethod($$.SANDBOX, org, 'getSandboxConfig').resolves({ sandboxName: 'foo' });
          const prodQuerySpy = stubMethod($$.SANDBOX, org, 'queryProduction')
            .onFirstCall()
            .throws('abc')
            .onSecondCall()
            .resolves({
              SandboxInfoId: orgTestData.orgId,
            });
          stubMethod($$.SANDBOX, org, 'isSandbox').resolves(true);
          const prodDelete = stubMethod($$.SANDBOX, prod.getConnection().tooling, 'delete').resolves({ success: true });
          const removeSpy = stubMethod($$.SANDBOX, org, 'remove');
          stubMethod($$.SANDBOX, org, 'getOrgId').returns(orgTestData.orgId);

          await org.deleteFrom(prod);

          expect(prodQuerySpy.calledTwice).to.be.true;
          expect(prodDelete.calledOnce).to.be.true;
          expect(prodDelete.firstCall.args).to.deep.equal(['SandboxInfo', orgTestData.orgId]);
          expect(removeSpy.calledOnce).to.be.true;
        });

        it('should calculate and locate sandbox from trimTo15 orgId', async () => {
          const prodTestData = new MockTestOrgData();
          const prod = await createOrgViaAuthInfo(prodTestData.username);

          const orgTestData = new MockTestOrgData('0GR4p000000U8CBGA0');
          const org = await createOrgViaAuthInfo(orgTestData.username);

          stubMethod($$.SANDBOX, org, 'isSandbox').resolves(true);
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

    describe('createSandbox', () => {
      let prod: Org;
      let createStub: SinonStub;
      let querySandboxProcessStub: SinonStub;
      let pollStatusAndAuthStub: SinonStub;

      beforeEach(async () => {
        const prodTestData = new MockTestOrgData();
        prod = await createOrgViaAuthInfo(prodTestData.username);
        createStub = stubMethod($$.SANDBOX, prod.getConnection().tooling, 'create').resolves({
          id: '0GQ4p000000U6nFGAS',
          success: true,
        });
        querySandboxProcessStub = stubMethod($$.SANDBOX, prod, 'querySandboxProcess').resolves();
        pollStatusAndAuthStub = stubMethod($$.SANDBOX, prod, 'pollStatusAndAuth').resolves();
      });

      it('will create the SandboxInfo sObject correctly', async () => {
        await prod.createSandbox({ SandboxName: 'testSandbox' }, { wait: Duration.seconds(30) });
        expect(createStub.calledOnce).to.be.true;
        expect(querySandboxProcessStub.calledOnce).to.be.true;
        expect(pollStatusAndAuthStub.calledOnce).to.be.true;
      });

      it('will throw an error if it fails to create SandboxInfo', async () => {
        createStub.restore();
        createStub = stubMethod($$.SANDBOX, prod.getConnection().tooling, 'create').resolves({
          error: 'duplicate value found: SandboxName duplicates value on record with id: 0GQ4p000000U6rv',
          success: false,
        });
        try {
          await prod.createSandbox({ SandboxName: 'testSandbox' }, { wait: Duration.seconds(30) });
          assert.fail('the above should throw a duplicate error');
        } catch (e) {
          expect(createStub.calledOnce).to.be.true;
          expect(e.message).to.include('The sandbox org creation failed with a result of');
          expect(e.message).to.include(
            'duplicate value found: SandboxName duplicates value on record with id: 0GQ4p000000U6rv'
          );
          expect(e.exitCode).to.equal(1);
        }
      });

      it('will auth sandbox user correctly', async () => {
        const sandboxResponse = {
          SandboxName: 'test',
          EndDate: '2021-19-06T20:25:46.000+0000',
        } as SandboxProcessObject;
        const requestStub = stubMethod($$.SANDBOX, prod.getConnection().tooling, 'request').resolves();
        const instanceUrl = 'http://instance.123.salesforce.com.services/data/v50.0/tooling/';
        stubMethod($$.SANDBOX, prod.getConnection().tooling, '_baseUrl').returns(instanceUrl);

        // @ts-expect-error because private method
        await prod.sandboxSignupComplete(sandboxResponse);
        expect(requestStub.firstCall.args).to.deep.equal([
          {
            body: '{"sandboxName":"test","callbackUrl":"http://localhost:1717/OauthRedirect"}',
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
            url: `${instanceUrl}/sandboxAuth`,
          },
        ]);
      });

      it('will fail to auth sandbox user correctly - but will swallow the error', async () => {
        // @ts-expect-error because private member
        const logStub = stubMethod($$.SANDBOX, prod.logger, 'debug');
        const sandboxResponse = {
          SandboxName: 'test',
          EndDate: '2021-19-06T20:25:46.000+0000',
        } as SandboxProcessObject;
        // @ts-ignore
        stubMethod<SandboxUserAuthResponse>($$.SANDBOX, prod.getConnection().tooling, 'request').throws({
          name: 'INVALID_STATUS',
        });

        // @ts-expect-error because private method
        await prod.sandboxSignupComplete(sandboxResponse);
        expect(logStub.callCount).to.equal(3);
        // error swallowed
        expect(logStub.thirdCall.args[0]).to.equal('Error while authenticating the user');
      });
    });

    describe('cloneSandbox', () => {
      let prod: Org;
      let createStub: sinon.SinonStub;
      let querySandboxProcessStub: sinon.SinonStub;
      let pollStatusAndAuthStub: sinon.SinonStub;
      let devHubQueryStub: sinon.SinonStub;

      const orgId = '0GQ4p000000U6nFGAS';

      beforeEach(async () => {
        const prodTestData = new MockTestOrgData();
        prod = await createOrgViaAuthInfo(prodTestData.username);
        createStub = stubMethod($$.SANDBOX, prod.getConnection().tooling, 'create').resolves({
          id: orgId,
          success: true,
        });
        querySandboxProcessStub = stubMethod($$.SANDBOX, prod, 'querySandboxProcess').resolves({
          Id: '00D56000000CDsAKJS',
        });
        pollStatusAndAuthStub = stubMethod($$.SANDBOX, prod, 'pollStatusAndAuth').resolves();
        devHubQueryStub = stubMethod($$.SANDBOX, prod.getConnection().tooling, 'query').resolves({
          records: [
            {
              Id: orgId,
            },
          ],
        });

        // SourceSandbox
        await prod.createSandbox({ SandboxName: 'testSandbox' }, { wait: Duration.seconds(30) });

        // reset the history of these stubs so we only look at what happens with `cloneSandbox()`
        createStub.resetHistory();
        pollStatusAndAuthStub.resetHistory();
        querySandboxProcessStub.resetHistory();
        devHubQueryStub.resetHistory();
      });

      it('will clone the sandbox given a SandBoxName', async () => {
        await prod.cloneSandbox({ SandboxName: 'testSandbox' }, 'testSandbox', { wait: Duration.seconds(30) });
        expect(createStub.calledOnce).to.be.true;
        expect(querySandboxProcessStub.calledTwice).to.be.true;
        expect(pollStatusAndAuthStub.calledOnce).to.be.true;
      });

      it('fails to get sanboxInfo from tooling.query', async () => {
        querySandboxProcessStub.restore();
        devHubQueryStub.restore();
        devHubQueryStub = stubMethod($$.SANDBOX, prod.getConnection().tooling, 'query').throws();
        try {
          await prod.cloneSandbox({ SandboxName: 'testSandbox' }, 'testSandbox', { wait: Duration.seconds(30) });
          fail('the above should throw an error');
        } catch (e) {
          expect(devHubQueryStub.calledOnce).to.be.true;
          expect(createStub.called).to.be.false;
          expect(pollStatusAndAuthStub.called).to.be.false;
        }
      });

      it('when creating sandbox tooling create rejects', async () => {
        createStub.restore();
        createStub = stubMethod($$.SANDBOX, prod.getConnection().tooling, 'create').rejects();
        try {
          await prod.cloneSandbox({ SandboxName: 'testSandbox' }, 'testSandbox', { wait: Duration.seconds(30) });
          fail('the above should throw an error');
        } catch (e) {
          expect(createStub.calledOnce).to.be.true;
          expect(querySandboxProcessStub.calledOnce).to.be.true;
          expect(pollStatusAndAuthStub.called).to.be.false;
          expect(devHubQueryStub.called).to.be.false;
        }
      });
    });

    it('should remove all assets associated with the org', async () => {
      const org = await createOrgViaAuthInfo();

      const deletedPaths: string[] = [];
      stubMethod($$.SANDBOX, ConfigFile.prototype, 'unlink').callsFake(function (this: ConfigFile<ConfigFile.Options>) {
        deletedPaths.push(this.getPath());
        return Promise.resolve({});
      });

      stubMethod($$.SANDBOX, fs, 'rmdir').resolves();
      stubMethod($$.SANDBOX, ConfigFile.prototype, 'exists').resolves(true);

      await org.remove();

      expect(deletedPaths).includes(
        pathJoin(await $$.globalPathRetriever($$.id), Global.SFDX_STATE_FOLDER, `${testData.orgId}.json`)
      );
    });

    it('should not fail when no scratch org has been written', async () => {
      const org = await createOrgViaAuthInfo();

      const error: Error = new Error();
      set(error, 'code', 'ENOENT');

      stubMethod($$.SANDBOX, ConfigFile.prototype, 'unlink').rejects(error);
      stubMethod($$.SANDBOX, fs, 'rmdir').rejects(error);

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

      stubMethod($$.SANDBOX, fs.promises, 'unlink').resolves();

      const configAggregator = await ConfigAggregator.create();
      const org = await Org.create({
        connection: await Connection.create({
          authInfo: await AuthInfo.create({ username: testData.username }),
        }),
        aggregator: configAggregator,
      });

      const config = await Config.create(Config.getDefaultOptions(true));
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

      stubMethod($$.SANDBOX, fs.promises, 'unlink').resolves();

      const org = await createOrgViaAuthInfo();

      const stateAggregator = await StateAggregator.getInstance();
      stateAggregator.aliases.set('foo', testData.username);

      const user = stateAggregator.aliases.getUsername('foo');
      expect(user).eq(testData.username);

      await org.remove();

      const alias = stateAggregator.aliases.get('foo');
      expect(alias).eq(null);
    });

    it('should not fail when no sandboxOrgConfig', async () => {
      const org = await createOrgViaAuthInfo();

      const deletedPaths: string[] = [];
      stubMethod($$.SANDBOX, ConfigFile.prototype, 'unlink').callsFake(function (this: ConfigFile<ConfigFile.Options>) {
        deletedPaths.push(this.getPath());
        return Promise.resolve({});
      });

      stubMethod($$.SANDBOX, fs, 'rmdir').resolves();

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

      stubMethod($$.SANDBOX, AuthInfo.prototype, 'determineIfDevHub').resolves(false);

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
      const user0Config = await orgs[0].retrieveOrgUsersConfig();
      const user1Config = await orgs[1].retrieveOrgUsersConfig();

      expect(await user0Config.access(fsConstants.R_OK)).to.be.true;
      expect(await user1Config.access(fsConstants.R_OK)).to.be.false;
    });

    it('should remove aliases and config settings', async () => {
      const config = await Config.create(Config.getDefaultOptions(true));

      const org0Username = orgs[0].getUsername();
      config.set(OrgConfigProperties.TARGET_ORG, ensureString(org0Username));
      await config.write();

      expect(await config.exists()).to.be.true;

      const configAggregator = await orgs[0].getConfigAggregator().reload();
      const info = configAggregator.getInfo(OrgConfigProperties.TARGET_ORG);
      expect(info).has.property('value', org0Username);

      const org1Username = orgs[1].getUsername();

      const stateAggregator = await StateAggregator.getInstance();
      stateAggregator.aliases.set('foo', org1Username);
      const user = stateAggregator.aliases.getUsername('foo');
      expect(user).eq(org1Username);

      await orgs[0].remove();

      await configAggregator.reload();
      expect(configAggregator.getInfo(OrgConfigProperties.TARGET_ORG)).has.property('value', undefined);

      const alias = stateAggregator.aliases.get(user);
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

      await $$.stubAuths(testData, devHubConfig);

      const configAggregator = await ConfigAggregator.create();
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
      const fields = await org.checkScratchOrg();
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
      await $$.stubAuths(testData, mockDevHubData);
    });

    it.skip('steel thread', async () => {
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

      await $$.stubAuths(mock0, mock1, mock2);

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
      const org = await Org.create({ aliasOrUsername: testData.username });
      $$.fakeConnectionRequest = async () => {
        return { records: [] };
      };
      expect(org.isDevHubOrg()).to.be.false;
      expect(await org.determineIfDevHubOrg()).to.be.true;
      expect(org.isDevHubOrg()).to.be.true;
    });
    it('should return false and cache if dev hub', async () => {
      const org = await Org.create({ aliasOrUsername: testData.username });
      $$.fakeConnectionRequest = async () => {
        throw new Error();
      };
      expect(org.isDevHubOrg()).to.be.false;
      expect(await org.determineIfDevHubOrg()).to.be.false;
      expect(org.isDevHubOrg()).to.be.false;
    });
    it('should not call server is cached', async () => {
      testData.isDevHub = false;
      await $$.stubAuths(testData);
      const org = await Org.create({ aliasOrUsername: testData.username });
      const spy = $$.SANDBOX.spy();
      $$.fakeConnectionRequest = spy;
      expect(org.isDevHubOrg()).to.be.false;
      expect(await org.determineIfDevHubOrg()).to.be.false;
      expect(spy.called).to.be.false;
    });
    it('should call server is cached but forced', async () => {
      testData.isDevHub = false;
      await $$.stubAuths(testData);
      const org = await Org.create({ aliasOrUsername: testData.username });
      const spy = $$.SANDBOX.stub().returns(Promise.resolve({ records: [] }));
      $$.fakeConnectionRequest = spy;
      expect(org.isDevHubOrg()).to.be.false;
      expect(await org.determineIfDevHubOrg(true)).to.be.true;
      expect(spy.called).to.be.true;
      expect(org.isDevHubOrg()).to.be.true;
    });
  });

  describe('sandboxStatus', () => {
    let prod: Org;
    let queryStub: SinonStub;
    let pollStatusAndAuthStub: SinonStub;
    const sandboxNameIn = 'test-sandbox';
    const queryStr = `SELECT Id, Status, SandboxName, SandboxInfoId, LicenseType, CreatedDate, CopyProgress, SandboxOrganization, SourceId, Description, EndDate FROM SandboxProcess WHERE SandboxName='${sandboxNameIn}' AND Status != 'D' ORDER BY CreatedDate DESC LIMIT 1`;

    const statusResult = {
      records: [
        {
          Id: '00D1u000001QQZz',
          Status: 'Active',
          SandboxName: 'test-sandbox',
          SandboxInfoId: '00D1u000001QQZz',
          LicenseType: 'Developer',
          CreatedDate: '2022-01-01',
        },
      ],
    };
    beforeEach(async () => {
      const prodTestData = new MockTestOrgData();
      prod = await createOrgViaAuthInfo(prodTestData.username);
      queryStub = stubMethod($$.SANDBOX, prod.getConnection().tooling, 'query').resolves(statusResult);
      pollStatusAndAuthStub = stubMethod($$.SANDBOX, prod, 'pollStatusAndAuth').resolves(statusResult.records[0]);
    });

    it('should return sandbox status', async () => {
      const result = await prod.sandboxStatus(sandboxNameIn, { wait: Duration.minutes(10) });
      expect(queryStub.calledOnce).to.be.true;
      expect(queryStub.firstCall.firstArg).to.be.equal(queryStr);
      expect(pollStatusAndAuthStub.calledOnce).to.be.true;
      expect(result).to.be.equal(statusResult.records[0]);
    });

    it('should fail when query returns empty records for the sandbox', async () => {
      queryStub.restore();
      queryStub = stubMethod($$.SANDBOX, prod.getConnection().tooling, 'query').resolves({
        records: [],
      });
      try {
        await prod.sandboxStatus(sandboxNameIn, { wait: Duration.minutes(10) });
        assert.fail('This should have failed');
      } catch (e) {
        expect(e.message).to.be.equal(messages.getMessage('SandboxProcessNotFoundBySandboxName', [sandboxNameIn]));
        expect(queryStub.calledOnce).to.be.true;
        expect(queryStub.firstCall.firstArg).to.be.equal(queryStr);
        expect(pollStatusAndAuthStub.called).to.be.false;
      }
    });

    it('should fail when query returns multiple records for the sandbox', async () => {
      queryStub.restore();
      queryStub = stubMethod($$.SANDBOX, prod.getConnection().tooling, 'query').resolves({
        records: [...statusResult.records, ...statusResult.records],
      });
      try {
        await prod.sandboxStatus(sandboxNameIn, { wait: Duration.minutes(10) });
        assert.fail('This should have failed');
      } catch (e) {
        expect(e.message).to.be.equal(messages.getMessage('MultiSandboxProcessNotFoundBySandboxName', [sandboxNameIn]));
        expect(queryStub.calledOnce).to.be.true;
        expect(queryStub.firstCall.firstArg).to.be.equal(queryStr);
        expect(pollStatusAndAuthStub.called).to.be.false;
      }
    });
  });

  describe('source tracking detection', () => {
    it('orgs with property return the property', async () => {
      $$.configStubs.GlobalInfo.contents = {
        orgs: {
          [testData.username]: { tracksSource: false },
        },
      };
      const org = await Org.create({ aliasOrUsername: testData.username });
      const usesTracking = await org.tracksSource();
      expect(usesTracking).to.be.false;
    });

    it('scratch orgs without property return true', async () => {
      $$.configStubs.GlobalInfo.contents = {
        orgs: {
          [testData.username]: { isScratch: true },
        },
      };
      const org = await Org.create({ aliasOrUsername: testData.username });
      const usesTracking = await org.tracksSource();
      expect(usesTracking).to.be.true;
    });

    it('prod orgs without property return false', async () => {
      $$.configStubs.GlobalInfo.contents = {
        orgs: {
          [testData.username]: { isScratch: false },
        },
      };

      const org = await Org.create({ aliasOrUsername: testData.username });
      stubMethod($$.SANDBOX, org, 'determineIfSandbox').resolves(false);
      stubMethod($$.SANDBOX, org, 'determineIfScratch').resolves(false);
      const usesTracking = await org.tracksSource();
      expect(usesTracking).to.be.false;
    });

    describe('sandboxes without property', () => {
      it('return true if they support tracking', async () => {
        $$.configStubs.GlobalInfo.contents = {
          orgs: {
            [testData.username]: { isScratch: false },
          },
        };

        const org = await Org.create({ aliasOrUsername: testData.username });
        stubMethod($$.SANDBOX, org, 'determineIfScratch').resolves(false);
        stubMethod($$.SANDBOX, org, 'determineIfSandbox').resolves(true);
        stubMethod($$.SANDBOX, org, 'supportsSourceTracking').resolves(true);

        const usesTracking = await org.tracksSource();
        expect(usesTracking).to.be.true;
      });

      it("return false if they don't support tracking", async () => {
        $$.configStubs.GlobalInfo.contents = {
          orgs: {
            [testData.username]: { isScratch: false },
          },
        };

        const org = await Org.create({ aliasOrUsername: testData.username });
        stubMethod($$.SANDBOX, org, 'determineIfScratch').resolves(false);
        stubMethod($$.SANDBOX, org, 'determineIfSandbox').resolves(true);
        stubMethod($$.SANDBOX, org, 'supportsSourceTracking').resolves(false);

        const usesTracking = await org.tracksSource();
        expect(usesTracking).to.be.false;
      });
    });
  });
});
