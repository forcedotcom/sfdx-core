/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { GlobalInfo, SfOrg, StateAggregator } from '../../../../src/stateAggregator';
import { AuthFields } from '../../../../src/org';
import { MockTestOrgData, testSetup, uniqid } from '../../../../src/testSetup';

const username = 'espresso@coffee.com';
const alias = 'MyAlias';
const org = new MockTestOrgData(uniqid(), { username });
const token = { token: '123', url: 'https://login.salesforce.com', user: username };

function expectPartialDeepMatch(actual: AuthFields, expected: AuthFields, ignore = ['refreshToken', 'accessToken']) {
  for (const key of ignore) {
    delete actual[key];
    delete expected[key];
  }
  expect(actual).to.deep.equal(expected);
}

describe('OrgAccessor', () => {
  const $$ = testSetup();

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
      expectPartialDeepMatch(result, await org.getConfig());
    });
  });

  describe('get', () => {
    it('should return org that corresponds to a username', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      await stateAggregator.orgs.read(username);
      const result = stateAggregator.orgs.get(username);
      expectPartialDeepMatch(result, await org.getConfig());
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
      stateAggregator.orgs.set(newUsername, newOrg);
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
      delete newOrg.username;

      stateAggregator.orgs.set(username, newOrg);
      const result = stateAggregator.orgs.get(username);
      expect(result.username).to.deep.equal(username);
    });
  });

  describe('hasFile', () => {
    it('should return true if an auth file exists in the state directory', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      expect(stateAggregator.orgs.hasFile(username)).to.be.true;
    });

    it('should return false if an auth file does not exist in the state directory', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      expect(stateAggregator.orgs.hasFile('DOES_NOT_EXIST')).to.be.false;
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
      expect(stateAggregator.orgs.list()).to.deep.equal([`${username}.json`]);
    });
  });
});

describe('GlobalInfoOrgAccessor', () => {
  const $$ = testSetup();

  beforeEach(async () => {
    $$.setConfigStubContents('GlobalInfo', {
      contents: {
        orgs: { [username]: await org.getConfig() },
        aliases: { [alias]: username },
        tokens: { [username]: token },
      },
    });
  });

  describe('getAll', () => {
    it('should return all the orgs', async () => {
      const globalInfo = await GlobalInfo.create();
      const orgs = globalInfo.orgs.getAll();
      expectPartialDeepMatch(orgs[username], await org.getConfig());
    });
  });

  describe('get', () => {
    it('should return org that corresponds to a username', async () => {
      const globalInfo = await GlobalInfo.create();
      const result = globalInfo.orgs.get(username);
      expectPartialDeepMatch(result, await org.getConfig());
    });
  });

  describe('has', () => {
    it('should return true if org exists', async () => {
      const globalInfo = await GlobalInfo.create();
      const result = globalInfo.orgs.has(username);
      expect(result).to.deep.equal(true);
    });

    it('should return false if org does not exist', async () => {
      const globalInfo = await GlobalInfo.create();
      const result = globalInfo.orgs.has('DOES_NOT_EXIST');
      expect(result).to.deep.equal(false);
    });
  });

  describe('set', () => {
    it('should set the org', async () => {
      const globalInfo = await GlobalInfo.create();
      const newOrg = { username: 'foobar@baz.com', token: '123' } as unknown as SfOrg;
      globalInfo.orgs.set('foobar@baz.com', newOrg);
      const result = globalInfo.orgs.has('foobar@baz.com');
      expect(result).to.be.true;
    });

    it('should add the username if does not exist on the object', async () => {
      const globalInfo = await GlobalInfo.create();
      const newOrg = { token: '123' } as unknown as SfOrg;
      globalInfo.orgs.set('foobar@baz.com', newOrg);
      const result = globalInfo.orgs.get('foobar@baz.com');
      expect(result.username).to.deep.equal('foobar@baz.com');
    });
  });

  describe('update', () => {
    const instanceUrl = 'https://login.salesforce.com';
    it('should update the org', async () => {
      const globalInfo = await GlobalInfo.create();
      const newOrg = { ...org, instanceUrl };
      globalInfo.orgs.update(username, newOrg);
      const result = globalInfo.orgs.get(username);
      expect(result.instanceUrl).to.deep.equal(instanceUrl);
    });

    it('should add the username if does not exist on the object', async () => {
      const globalInfo = await GlobalInfo.create();
      const newOrg = { ...org, instanceUrl };
      delete newOrg.username;

      globalInfo.orgs.set(username, newOrg);
      const result = globalInfo.orgs.get(username);
      expect(result.username).to.deep.equal(username);
    });
  });
});
