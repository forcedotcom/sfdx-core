/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { StateAggregator } from '../../../../src/stateAggregator';
import { AuthFields } from '../../../../src/org';
import { MockTestOrgData, shouldThrowSync, TestContext } from '../../../../src/testSetup';
import { uniqid } from '../../../../src/util/uniqid';

const username = 'espresso@coffee.com';
const org = new MockTestOrgData(uniqid(), { username });

function expectPartialDeepMatch(actual: AuthFields, expected: AuthFields, ignore = ['refreshToken', 'accessToken']) {
  for (const key of ignore) {
    // @ts-expect-error - element is implicit any
    delete actual?.[key];
    // @ts-expect-error - element is implicit any
    delete expected?.[key];
  }
  expect(actual).to.deep.equal(expected);
}

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
