/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { StateAggregator } from '../../../../src/stateAggregator';
import { MockTestOrgData, testSetup, uniqid } from '../../../../src/testSetup';

const username = 'espresso@coffee.com';
const alias = 'MyAlias';
const org = new MockTestOrgData(uniqid(), { username });
const token = { token: '123', url: 'https://login.salesforce.com', user: username };

describe('TokenAccessor', () => {
  const $$ = testSetup();

  beforeEach(async () => {
    $$.stubAliases({ [alias]: username });

    $$.setConfigStubContents('TokensConfig', {
      contents: { [username]: token },
    });

    await $$.stubAuths(org);
  });

  describe('getAll', () => {
    it('should return all the tokens', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const tokens = stateAggregator.tokens.getAll();
      expect(tokens).to.deep.equal({ [username]: token });
    });
  });

  describe('get', () => {
    it('should return token that corresponds to a username', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const result = stateAggregator.tokens.get(username);
      expect(result).to.deep.equal(token);
    });
  });

  describe('has', () => {
    it('should return true if token exists', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const result = stateAggregator.tokens.has(username);
      expect(result).to.deep.equal(true);
    });

    it('should return false if token does not exist', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const result = stateAggregator.tokens.has('DOES_NOT_EXIST');
      expect(result).to.deep.equal(false);
    });
  });

  describe('set', () => {
    it('should set the token', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const newToken = {
        username: 'foobar@baz.com',
        token: '123',
        url: 'https://login.salesforce.com',
        timestamp: new Date().toISOString(),
      };
      stateAggregator.tokens.set('foobar@baz.com', newToken);
      const result = stateAggregator.tokens.has('foobar@baz.com');
      expect(result).to.be.true;
    });
  });

  describe('update', () => {
    it('should update the token', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const instanceUrl = 'https://login.salesforce.com';
      const newToken = { ...token, instanceUrl };
      stateAggregator.tokens.update(username, newToken);
      const result = stateAggregator.tokens.get(username);
      expect(result.instanceUrl).to.deep.equal(instanceUrl);
    });
  });

  describe('unset', () => {
    it('should remove the token', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      stateAggregator.tokens.unset(username);
      const result = stateAggregator.tokens.get(username);
      expect(result).to.be.undefined;
    });
  });
});
