/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { set } from '@salesforce/kit';
import { spyMethod, stubMethod } from '@salesforce/ts-sinon';
import {
  AnyJson,
  ensureJsonArray,
  ensureJsonMap,
  ensureString,
  JsonMap,
  Optional
} from '@salesforce/ts-types';
import { deepStrictEqual } from 'assert';
import { assert, expect } from 'chai';
import { constants as fsConstants } from 'fs';
import { OAuth2 } from 'jsforce';
// @ts-ignore
import * as Transport from 'jsforce/lib/transport';
import { tmpdir as osTmpdir } from 'os';
import { join as pathJoin } from 'path';
import { AuthFields, AuthInfo } from '../../src/authInfo';
import { Aliases } from '../../src/config/aliases';
import { Config } from '../../src/config/config';
import { ConfigAggregator } from '../../src/config/configAggregator';
import { ConfigFile } from '../../src/config/configFile';
import { OrgUsersConfig } from '../../src/config/orgUsersConfig';
import { Connection } from '../../src/connection';
import { Global } from '../../src/global';
import { Org, OrgFields } from '../../src/org';
import { MockTestOrgData, testSetup } from '../../src/testSetup';
import * as fs from '../../src/util/fs';

const $$ = testSetup();

// Setup the test environment.

describe('Org Tests', () => {
  let testData: MockTestOrgData;

  beforeEach(async () => {
    testData = new MockTestOrgData();
    $$.configStubs.AuthInfoConfig = { contents: await testData.getConfig() };
    stubMethod($$.SANDBOX, Connection.prototype, 'useLatestApiVersion').returns(
      Promise.resolve()
    );
  });

  describe('fields', () => {
    it('getField should get authinfo fields', async () => {
      const org: Org = await Org.create({ aliasOrUsername: testData.username });
      expect(org.getField(OrgFields.ORG_ID)).to.eq(testData.orgId);
    });

    it('getField should get org properties', async () => {
      const org: Org = await Org.create({ aliasOrUsername: testData.username });
      expect(org.getField(OrgFields.STATUS)).to.eq('UNKNOWN');
    });

    it('getFields should get a bunch of fields', async () => {
      const org: Org = await Org.create({ aliasOrUsername: testData.username });
      expect(org.getFields([OrgFields.ORG_ID, OrgFields.STATUS])).to.deep.eq({
        orgId: testData.orgId,
        status: 'UNKNOWN'
      });
    });
  });

  describe('org:create', () => {
    it('should create an org from a username', async () => {
      const org: Org = await Org.create({ aliasOrUsername: testData.username });
      expect(org.getUsername()).to.eq(testData.username);
    });

    it('should create an org from an alias', async () => {
      const ALIAS: string = 'foo';
      await Aliases.parseAndUpdate([`${ALIAS}=${testData.username}`]);
      const org: Org = await Org.create({ aliasOrUsername: ALIAS });
      expect(org.getUsername()).to.eq(testData.username);
    });

    it('should create an org from the default username', async () => {
      const config: Config = await Config.create<Config>(
        Config.getDefaultOptions(true)
      );
      await config.set(Config.DEFAULT_USERNAME, testData.username);
      await config.write();

      const configAggregator: ConfigAggregator = await ConfigAggregator.create();

      const org: Org = await Org.create({ aggregator: configAggregator });
      expect(org.getUsername()).to.eq(testData.username);
    });

    it('should create a default devhub org', async () => {
      const config: Config = await Config.create<Config>(
        Config.getDefaultOptions(true)
      );
      await config.set(Config.DEFAULT_DEV_HUB_USERNAME, testData.username);
      await config.write();

      const configAggregator: ConfigAggregator = await ConfigAggregator.create();

      const org: Org = await Org.create({
        aggregator: configAggregator,
        isDevHub: true
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
      $$.SANDBOXES.CONNECTION.stub(Connection.prototype, 'request').callsFake(
        () =>
          Promise.resolve([
            { version: '89.0' },
            { version: '90.0' },
            { version: '88.0' }
          ])
      );
      const org: Org = await Org.create({
        connection: await Connection.create(
          await AuthInfo.create({ username: testData.username })
        )
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
        const org: Org = await Org.create({
          connection: await Connection.create(
            await AuthInfo.create({ username: testData.username })
          )
        });

        expect(removeStub.callCount).to.be.equal(0);
        await org.cleanLocalOrgData();
        expect(removeStub.callCount).to.be.equal(1);
      });
    });

    it('InvalidProjectWorkspace', async () => {
      $$.SANDBOXES.CONFIG.restore();
      const orgSpy = spyMethod($$.SANDBOX, Org.prototype, 'cleanLocalOrgData');
      let invalidProjectWorkspace = false;
      stubMethod($$.SANDBOX, ConfigFile, 'resolveRootFolder').callsFake(() => {
        if (orgSpy.callCount > 0) {
          invalidProjectWorkspace = true;
          const error = new Error();
          error.name = 'InvalidProjectWorkspace';
          throw error;
        }
        return $$.rootPathRetriever(false);
      });
      stubMethod($$.SANDBOX, fs, 'readJsonMap').callsFake(() =>
        Promise.resolve({})
      );
      const orgDataPath = 'foo';
      const org: Org = await Org.create({
        connection: await Connection.create(
          await AuthInfo.create({ username: testData.username })
        )
      });
      await org.cleanLocalOrgData(orgDataPath);
      expect(invalidProjectWorkspace).to.be.equal(true);
    });

    it('Random Error', async () => {
      $$.SANDBOXES.CONFIG.restore();
      const orgSpy = spyMethod($$.SANDBOX, Org.prototype, 'cleanLocalOrgData');
      stubMethod($$.SANDBOX, Config, 'resolveRootFolder').callsFake(() => {
        if (orgSpy.callCount > 0) {
          const err = new Error();
          err.name = 'gozer';
          throw err;
        }
        return osTmpdir();
      });
      stubMethod($$.SANDBOX, fs, 'readJsonMap').callsFake(() =>
        Promise.resolve({})
      );
      const orgDataPath = 'foo';
      const org: Org = await Org.create({
        connection: await Connection.create(
          await AuthInfo.create({ username: testData.username })
        )
      });
      try {
        await org.cleanLocalOrgData(orgDataPath);
        assert.fail('This should have failed');
      } catch (e) {
        expect(e).to.have.property('name', 'gozer');
      }
    });
  });

  describe('remove', () => {
    const configFileReadJsonMock = async function(this: ConfigFile) {
      if (this.getPath().includes(`${testData.username}.json`)) {
        return Promise.resolve(await testData.getConfig());
      }

      return Promise.resolve({});
    };

    beforeEach(() => {
      $$.configStubs.AuthInfoConfig = {
        retrieveContents: configFileReadJsonMock
      };
    });

    it('should remove all assets associated with the org', async () => {
      const org: Org = await Org.create({
        connection: await Connection.create(
          await AuthInfo.create({ username: testData.username })
        )
      });

      const deletedPaths: string[] = [];
      stubMethod($$.SANDBOX, ConfigFile.prototype, 'unlink').callsFake(function(
        this: ConfigFile
      ) {
        deletedPaths.push(this.getPath());
        return Promise.resolve({});
      });

      stubMethod($$.SANDBOX, fs, 'remove').callsFake(() => {
        return Promise.resolve({});
      });

      await org.remove();

      expect(deletedPaths).includes(
        pathJoin(
          await $$.globalPathRetriever($$.id),
          Global.STATE_FOLDER,
          `${testData.orgId}.json`
        )
      );
    });

    it('should not fail when no scratch org has been written', async () => {
      const org: Org = await Org.create({
        connection: await Connection.create(
          await AuthInfo.create({ username: testData.username })
        )
      });

      const error: Error = new Error();
      set(error, 'code', 'ENOENT');

      stubMethod($$.SANDBOX, ConfigFile.prototype, 'unlink').callsFake(
        async () => {
          throw error;
        }
      );

      stubMethod($$.SANDBOX, fs, 'remove').callsFake(async () => {
        return Promise.reject(error);
      });

      try {
        await org.remove();
      } catch (e) {
        assert.fail(
          'Removes should throw and error when removing an orgConfig'
        );
      }
    });

    it('should remove config setting', async () => {
      const configAggregator: ConfigAggregator = await ConfigAggregator.create();
      const org: Org = await Org.create({
        connection: await Connection.create(
          await AuthInfo.create({ username: testData.username })
        ),
        aggregator: configAggregator
      });

      const config: Config = await Config.create<Config>(
        Config.getDefaultOptions(true)
      );
      await config.set(Config.DEFAULT_USERNAME, testData.username);
      await config.write();

      await configAggregator.reload();
      expect(configAggregator.getInfo(Config.DEFAULT_USERNAME)).has.property(
        'value',
        testData.username
      );

      await org.remove();
      await configAggregator.reload();

      const defaultusername = configAggregator.getInfo(Config.DEFAULT_USERNAME);
      const info = configAggregator.getInfo(Config.DEFAULT_USERNAME);
      expect(defaultusername.value).eq(undefined);
      expect(info.value).eq(undefined);
    });

    it('should remove the alias', async () => {
      const org: Org = await Org.create({
        connection: await Connection.create(
          await AuthInfo.create({ username: testData.username })
        )
      });

      await Aliases.parseAndUpdate([`foo=${testData.username}`]);
      let alias = await Aliases.fetch('foo');
      expect(alias).eq(testData.username);

      await org.remove();

      alias = await Aliases.fetch('foo');
      expect(alias).eq(undefined);
    });
  });

  describe('with multiple scratch org users', () => {
    let orgs: Org[];
    beforeEach(async () => {
      orgs = [];

      const orgIdUser: string = 'p.venkman@gb.org';
      const addedUser: string = 'winston@gb.org';
      const accessTokenUser: string = 'ltully@gb.org';

      const users = [
        new MockTestOrgData().createUser(orgIdUser),
        new MockTestOrgData().createUser(addedUser),
        new MockTestOrgData().createUser(accessTokenUser)
      ];

      $$.SANDBOXES.CONFIG.restore();
      stubMethod($$.SANDBOX, ConfigFile, 'resolveRootFolder').callsFake(
        (isGlobal: boolean) => $$.rootPathRetriever(isGlobal, $$.id)
      );

      let userAuthResponse: AnyJson = null;
      stubMethod($$.SANDBOX, OAuth2.prototype, '_postParams').callsFake(() =>
        Promise.resolve(userAuthResponse)
      );

      let responseBody: AnyJson = null;
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').callsFake(
        () => {
          return Promise.resolve(responseBody);
        }
      );

      for (const user of users) {
        userAuthResponse = {
          access_token: user.accessToken,
          instance_url: user.instanceUrl,
          id: user.testId,
          refresh_token: user.refreshToken
        };

        responseBody = {
          body: JSON.stringify({ Username: user.username, OrgId: user.orgId })
        };

        const userAuth = await AuthInfo.create({
          username: user.username,
          oauth2Options: {
            authCode: 'test',
            clientId: user.clientId,
            clientSecret: user.clientSecret,
            loginUrl: user.loginUrl
          }
        });

        await userAuth.save({ orgId: user.orgId });

        const configAggregator: ConfigAggregator = await ConfigAggregator.create();

        const org: Org = await Org.create({
          connection: await Connection.create(
            await AuthInfo.create({ username: user.username })
          ),
          aggregator: configAggregator
        });

        orgs.push(org);
      }

      await orgs[0].addUsername(
        await AuthInfo.create({ username: orgs[1].getUsername() })
      );
    });

    it('should validate expected files', async () => {
      const user0Config: OrgUsersConfig = await orgs[0].retrieveOrgUsersConfig();
      const user1Config: OrgUsersConfig = await orgs[1].retrieveOrgUsersConfig();

      expect(await user0Config.access(fsConstants.R_OK)).to.be.true;
      expect(await user1Config.access(fsConstants.R_OK)).to.be.false;
    });

    it('should remove aliases and config settings', async () => {
      const config: Config = await Config.create<Config>(
        Config.getDefaultOptions(true)
      );

      const org0Username = orgs[0].getUsername();
      await config.set(Config.DEFAULT_USERNAME, org0Username);
      await config.write();

      const configAggregator = await orgs[0].getConfigAggregator().reload();
      const info = configAggregator.getInfo(Config.DEFAULT_USERNAME);
      expect(info).has.property('value', org0Username);

      const org1Username = orgs[1].getUsername();
      await Aliases.parseAndUpdate([`foo=${org1Username}`]);
      let alias = await Aliases.fetch('foo');
      expect(alias).eq(org1Username);

      await orgs[0].remove();

      await configAggregator.reload();
      expect(configAggregator.getInfo(Config.DEFAULT_USERNAME)).has.property(
        'value',
        undefined
      );

      alias = await Aliases.fetch('foo');
      expect(alias).eq(undefined);
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
      stubMethod($$.SANDBOX, Connection.prototype, 'query').callsFake(
        async () => {
          if (returnResult === 'throw') {
            const error = new Error();
            error.name = 'INVALID_TYPE';
            throw error;
          }
          return returnResult;
        }
      );

      const fakeDevHub = 'foo@devhub.com';

      const configAggregator: ConfigAggregator = await ConfigAggregator.create();
      connection = await Connection.create(
        await AuthInfo.create({ username: testData.username })
      );
      org = await Org.create({ connection, aggregator: configAggregator });

      const config: Config = await Config.create<Config>(
        Config.getDefaultOptions(true)
      );
      await config.set(Config.DEFAULT_DEV_HUB_USERNAME, fakeDevHub);
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
        expect(err).to.have.property('name', 'NoResults');
      }
    });

    it('validate is not scratch org', async () => {
      returnResult = 'throw';
      try {
        await org.checkScratchOrg();
        assert.fail('This test is expected to fail.');
      } catch (err) {
        expect(err).to.have.property('name', 'NotADevHub');
      }
    });
  });

  describe('getDevHubOrg', () => {
    const devHubUser = 'ray@gb.org';
    beforeEach(() => {
      const retrieve = async function(this: ConfigFile) {
        if (this.getPath().includes(devHubUser)) {
          const mockDevHubData: MockTestOrgData = new MockTestOrgData();
          mockDevHubData.username = devHubUser;
          return Promise.resolve(mockDevHubData.getConfig());
        }
        return Promise.resolve(await testData.getConfig());
      };
      $$.configStubs.AuthInfoConfig = { retrieveContents: retrieve };
    });

    it('steel thread', async () => {
      testData.createDevHubUsername(devHubUser);
      const org: Org = await Org.create({
        connection: await Connection.create(
          await AuthInfo.create({ username: testData.username })
        )
      });

      const devHub: Optional<Org> = await org.getDevHubOrg();
      expect(devHub!.getUsername()).eq(devHubUser);
    });

    it('org is devhub', async () => {
      testData.makeDevHub();
      const org: Org = await Org.create({
        connection: await Connection.create(
          await AuthInfo.create({ username: testData.username })
        )
      });

      const devHub: Optional<Org> | undefined = await org.getDevHubOrg();
      expect(devHub!.getUsername()).eq(testData.username);
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
      const org: Org = await Org.create({
        connection: await Connection.create(
          await AuthInfo.create({ username: testData.username })
        )
      });
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

      const retrieve = async function(this: ConfigFile) {
        const path = this.getPath();

        if (path && path.includes(mock0.username)) {
          return mock0.getConfig();
        } else if (path && path.includes(mock1.username)) {
          return mock1.getConfig();
        } else if (path && path.includes(mock2.username)) {
          return mock2.getConfig();
        } else if (path && path.includes(mock0.orgId)) {
          return {
            usernames: [
              orgs[0].getUsername(),
              orgs[1].getUsername(),
              orgs[2].getUsername()
            ]
          };
        } else {
          throw new Error(`Unhandled Path: ${path}`);
        }
      };
      $$.configStubs.AuthInfoConfig = { retrieveContents: retrieve };

      orgs[0] = await Org.create({
        connection: await Connection.create(
          await AuthInfo.create({ username: mock0.username })
        )
      });
      orgs[1] = await Org.create({
        connection: await Connection.create(
          await AuthInfo.create({ username: mock1.username })
        )
      });
      orgs[2] = await Org.create({
        connection: await Connection.create(
          await AuthInfo.create({ username: mock2.username })
        )
      });
    });

    it('should read all auth files from an org file', async () => {
      await orgs[0].addUsername(
        await AuthInfo.create({ username: orgs[1].getUsername() })
      );
      await orgs[0].addUsername(
        await AuthInfo.create({ username: orgs[2].getUsername() })
      );

      const orgUsers: AuthInfo[] = await orgs[0].readUserAuthFiles();
      let expectedUsers = [mock0.username, mock1.username, mock2.username];
      for (const info of orgUsers) {
        expectedUsers = expectedUsers.filter(
          user => info.getFields().username !== user
        );
      }
      expect(expectedUsers.length).to.eq(0);
    });

    it('should read just the scratch org admin auth file when no org file', async () => {
      const orgUsers: AuthInfo[] = await orgs[0].readUserAuthFiles();
      let expectedUsers = [mock0.username];
      for (const info of orgUsers) {
        expectedUsers = expectedUsers.filter(
          user => info.getFields().username !== user
        );
      }
      expect(expectedUsers.length).to.eq(0);
    });

    describe('removeUsername', () => {
      it('should remove all usernames', async () => {
        await orgs[0].addUsername(ensureString(orgs[1].getUsername()));
        await orgs[0].addUsername(ensureString(orgs[2].getUsername()));

        await orgs[0].removeUsername(ensureString(orgs[1].getUsername()));
        let usersPresent = ensureJsonArray(
          $$.getConfigStubContents('OrgUsersConfig').usernames
        );
        expect(usersPresent.length).to.be.eq(2);
        expect(usersPresent).to.not.include(mock1.username);

        await orgs[0].removeUsername(ensureString(orgs[2].getUsername()));
        usersPresent = ensureJsonArray(
          $$.getConfigStubContents('OrgUsersConfig').usernames
        );
        expect(usersPresent.length).to.be.eq(1);
        expect(usersPresent).to.not.include(mock2.username);
      });
    });
  });
});
