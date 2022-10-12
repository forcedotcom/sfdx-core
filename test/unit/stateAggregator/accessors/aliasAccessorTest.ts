/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { StateAggregator } from '../../../../src/stateAggregator';
import { MockTestOrgData, TestContext, uniqid } from '../../../../src/testSetup';

const username1 = 'espresso@coffee.com';
const username2 = 'foobar@salesforce.com';
const alias1 = 'MyAlias';
const alias2 = 'MyOtherAlias';
const alias3 = 'MyThirdAlias';
const org = new MockTestOrgData(uniqid(), { username: username1 });
const token = { token: '123', url: 'https://login.salesforce.com', user: username1 };

describe('AliasAccessor', () => {
  const $$ = new TestContext();

  beforeEach(async () => {
    $$.stubAliases({
      [alias1]: username1,
      [alias2]: username2,
      [alias3]: username1,
    });

    $$.setConfigStubContents('TokensConfig', {
      contents: { [username1]: token },
    });

    await $$.stubAuths(org);
  });

  describe('getAll', () => {
    it('should return all the aliases if no username is provided', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const aliases = stateAggregator.aliases.getAll();
      expect(aliases).to.deep.equal({
        [alias1]: username1,
        [alias2]: username2,
        [alias3]: username1,
      });
    });

    it('should return all the aliases for a given username', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const aliases = stateAggregator.aliases.getAll(username1);
      expect(aliases).to.deep.equal([alias1, alias3]);
    });
  });

  describe('get', () => {
    it('should return first alias of username', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const aliases = stateAggregator.aliases.get(username1);
      expect(aliases).to.equal(alias1);
    });
  });

  describe('getUsername', () => {
    it('should return the username that corresponds to an alias', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const username = stateAggregator.aliases.getUsername(alias1);
      expect(username).to.equal(username1);
    });

    it('should return null if the alias does not exist', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const username = stateAggregator.aliases.getUsername('DOES_NOT_EXIST');
      expect(username).to.be.null;
    });
  });

  describe('resolveUsername', () => {
    it('should return a username if a username was provided', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const username = stateAggregator.aliases.resolveUsername(username1);
      expect(username).to.equal(username1);
    });

    it('should return a username if an alias was provided', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const username = stateAggregator.aliases.resolveUsername(alias1);
      expect(username).to.equal(username1);
    });
  });

  describe('resolveAlias', () => {
    it('should return an alias if an alias was provided', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const alias = stateAggregator.aliases.resolveAlias(alias1);
      expect(alias).to.equal(alias1);
    });

    it('should return an alias if a username was provided', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const alias = stateAggregator.aliases.resolveAlias(username1);
      expect(alias).to.equal(alias1);
    });
  });

  describe('set', () => {
    it('should set an alias for a username', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      stateAggregator.aliases.set('foobar', username1);
      const aliases = stateAggregator.aliases.getAll(username1);
      expect(aliases).to.include('foobar');
    });

    it('should set an alias for an org', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      stateAggregator.aliases.set('foobar', await org.getConfig());
      const aliases = stateAggregator.aliases.getAll(org.username);
      expect(aliases).to.include('foobar');
    });

    it('should set an alias for a token', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      stateAggregator.aliases.set('foobar', token);
      const aliases = stateAggregator.aliases.getAll(token.user);
      expect(aliases).to.include('foobar');
    });
  });

  describe('unsetAll', () => {
    it('should unset all the aliases for a given username', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      stateAggregator.aliases.unsetAll(username1);
      const aliases = stateAggregator.aliases.getAll(username1);
      expect(aliases).to.deep.equal([]);
    });
  });

  describe('has', () => {
    it('should return true if the alias exists', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      expect(stateAggregator.aliases.has(alias1)).to.be.true;
    });

    it('should return false if the alias exists', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      expect(stateAggregator.aliases.has('DOES_NOT_EXIST')).to.be.false;
    });
  });
});
