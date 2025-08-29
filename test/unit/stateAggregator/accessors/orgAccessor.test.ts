/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { expect } from 'chai';
import { StateAggregator } from '../../../../src/stateAggregator/stateAggregator';
import { AuthFields } from '../../../../src/org/authInfo';
import { Lifecycle } from '../../../../src';
import { MockTestOrgData, shouldThrowSync, TestContext } from '../../../../src/testSetup';
import { uniqid } from '../../../../src/util/uniqid';
import { expectPartialDeepMatch } from '../../helpers';

const username = 'espresso@coffee.com';
const org = new MockTestOrgData(uniqid(), { username });

describe('OrgAccessor', () => {
  const $$ = new TestContext();

  beforeEach(async () => {
    await $$.stubAuths(org);
  });

  describe('readAll', () => {
    it('should return all the orgs', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const orgs = await stateAggregator.orgs.readAll();
      expect(orgs.length).to.equal(1);
      expectPartialDeepMatch(orgs[0], await org.getConfig());
    });

    it('should emit warnings when errors are thrown', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const errMsg = 'invalid keychain file perms';
      const genericKeychainInvalidPermsError = new Error(errMsg);
      genericKeychainInvalidPermsError.name = 'GenericKeychainInvalidPermsError';
      // @ts-expect-error private method
      $$.SANDBOX.stub(stateAggregator.orgs, 'initAuthFile').throws(genericKeychainInvalidPermsError);
      const emitWarningStub = $$.SANDBOX.stub(Lifecycle.prototype, 'emitWarning');
      const orgs = await stateAggregator.orgs.readAll();
      expect(orgs.length).to.equal(0);
      expect(emitWarningStub.calledOnce).to.be.true;
      const warningMsg = `The auth file for ${username} is invalid. Due to: ${errMsg}`;
      expect(emitWarningStub.firstCall.firstArg).to.equal(warningMsg);
    });
  });

  describe('getAll', () => {
    it('should return all the orgs', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      await stateAggregator.orgs.readAll();
      const orgs = stateAggregator.orgs.getAll();
      expect(orgs.length).to.equal(1);
      expectPartialDeepMatch(orgs[0], await org.getConfig());
    });
  });

  describe('read', () => {
    it('should return org that corresponds to a username', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const result = await stateAggregator.orgs.read(username);
      if (result) {
        expectPartialDeepMatch(result, await org.getConfig());
      } else {
        throw new Error('No org returned');
      }
    });

    it('should throw if JsonParseError', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const jsonParseError = new Error();
      jsonParseError.name = 'JsonParseError';
      $$.SANDBOX.stub(stateAggregator.orgs, 'get').throws(jsonParseError);
      try {
        await stateAggregator.orgs.read(username);
        expect(true, 'Expected JsonParseError to be thrown').to.be.false;
      } catch (e) {
        expect(e).instanceOf(Error);
        expect((e as Error).name).to.equal('JsonParseError');
      }
    });

    it('should throw if GenericKeychainInvalidPermsError', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const genericKeychainInvalidPermsError = new Error();
      genericKeychainInvalidPermsError.name = 'GenericKeychainInvalidPermsError';
      $$.SANDBOX.stub(stateAggregator.orgs, 'get').throws(genericKeychainInvalidPermsError);
      try {
        await stateAggregator.orgs.read(username);
        expect(true, 'Expected GenericKeychainInvalidPermsError to be thrown').to.be.false;
      } catch (e) {
        expect(e).instanceOf(Error);
        expect((e as Error).name).to.equal('GenericKeychainInvalidPermsError');
      }
    });
  });

  describe('get', () => {
    it('should return org that corresponds to a username', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      await stateAggregator.orgs.read(username);
      const result = stateAggregator.orgs.get(username);
      expectPartialDeepMatch(result, await org.getConfig());
    });

    describe('invalid usernames', () => {
      const badUsername = 'me@dx.oops';

      // explanation doc'd in https://salesforce.quip.com/BiusAnH1wdcE
      it('returns an empty object when not told to throw', async () => {
        const stateAggregator = await StateAggregator.getInstance();
        await stateAggregator.orgs.read(badUsername);
        const result = stateAggregator.orgs.get(badUsername);
        expect(result).to.deep.equal({});
      });

      it('throws when no org is found and consumer wants it to throw', async () => {
        const stateAggregator = await StateAggregator.getInstance();
        await stateAggregator.orgs.read(badUsername);
        try {
          shouldThrowSync(() => stateAggregator.orgs.get(badUsername, false, true));
        } catch (e) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect((e as Error).name).to.equal('NamedOrgNotFoundError');
        }
      });
    });
  });

  describe('has', () => {
    it('should return true if org exists', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      await stateAggregator.orgs.readAll();
      const result = stateAggregator.orgs.has(username);
      expect(result).to.deep.equal(true);
    });

    it('should return false if org does not exist', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      await stateAggregator.orgs.readAll();
      const result = stateAggregator.orgs.has('DOES_NOT_EXIST');
      expect(result).to.deep.equal(false);
    });
  });

  describe('set', () => {
    it('should set the org if its already been read', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      await stateAggregator.orgs.readAll();
      const updated = { ...(await org.getConfig()), isDevHub: true };
      stateAggregator.orgs.set(username, updated);
      const result = stateAggregator.orgs.get(username);
      expectPartialDeepMatch(result, updated);
    });

    it('should set the org if its not been read', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const newUsername = 'foobar@baz.com';
      const newOrg = await new MockTestOrgData(uniqid(), { username: newUsername }).getConfig();
      stateAggregator.orgs.set(newUsername, newOrg);
      const result = stateAggregator.orgs.has(newUsername);
      expect(result).to.be.true;
    });

    it('should add the username if does not exist on the object', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const newUsername = 'foobar@baz.com';
      const newOrg = { ...(await new MockTestOrgData().getConfig()), username: null };
      stateAggregator.orgs.set(newUsername, newOrg as unknown as AuthFields);
      const result = stateAggregator.orgs.get(newUsername);
      expect(result.username).to.deep.equal(newUsername);
    });
  });

  describe('update', () => {
    const instanceUrl = 'https://login.salesforce.com';
    it('should update the org', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const newOrg = { ...org, instanceUrl };
      stateAggregator.orgs.update(username, newOrg);
      const result = stateAggregator.orgs.get(username);
      expect(result.instanceUrl).to.deep.equal(instanceUrl);
    });

    it('should add the username if does not exist on the object', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const newOrg = { ...org, instanceUrl };
      // @ts-expect-error - operand must be optional
      delete newOrg['username'];

      stateAggregator.orgs.set(username, newOrg);
      const result = stateAggregator.orgs.get(username);
      expect(result.username).to.deep.equal(username);
    });
  });

  describe('hasFile', () => {
    it('should return true if an auth file exists in the state directory', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      expect(await stateAggregator.orgs.hasFile(username)).to.be.true;
    });

    it('should return false if an auth file does not exist in the state directory', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      expect(await stateAggregator.orgs.hasFile('DOES_NOT_EXIST')).to.be.false;
    });
  });

  describe('exists', () => {
    it('should return true if an AuthInfoConfig exists', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      await stateAggregator.orgs.readAll();
      expect(await stateAggregator.orgs.exists(username)).to.be.true;
    });

    it('should return false if an AuthInfoConfig does not exist', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      await stateAggregator.orgs.readAll();
      expect(await stateAggregator.orgs.exists('DOES_NOT_EXIST')).to.be.false;
    });
  });

  describe('list', () => {
    it('should return a list of auth file names', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      expect(await stateAggregator.orgs.list()).to.deep.equal([`${username}.json`]);
    });
  });
});
