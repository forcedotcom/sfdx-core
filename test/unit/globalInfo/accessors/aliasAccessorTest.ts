/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { stubMethod } from '@salesforce/ts-sinon';
import { expect } from 'chai';
import { GlobalInfo } from '../../../../src/globalInfo';
import { testSetup } from '../../../../src/testSetup';

describe('AliasAccessor', () => {
  const username1 = 'espresso@coffee.com';
  const username2 = 'foobar@salesforce.com';
  const alias1 = 'MyAlias';
  const alias2 = 'MyOtherAlias';
  const alias3 = 'MyThirdAlias';
  const org = { username: username1, orgId: '12345' };
  const token = { token: '123', url: 'https://login.salesforce.com', user: username1 };
  const $$ = testSetup();

  beforeEach(async () => {
    $$.SANDBOXES.CONFIG.restore();

    stubMethod($$.SANDBOX, GlobalInfo.prototype, 'read').callsFake(async function (this: GlobalInfo) {
      const contents = {
        orgs: { [username1]: org },
        aliases: {
          [alias1]: username1,
          [alias2]: username2,
          [alias3]: username1,
        },
        tokens: { [username1]: token },
      };
      this.setContentsFromObject(contents);
      return this.getContents();
    });
    stubMethod($$.SANDBOX, GlobalInfo.prototype, 'write').callsFake(() => {});
  });

  describe('getAll', () => {
    it('should return all the aliases if no username is provided', async () => {
      const globalInfo = await GlobalInfo.create();
      const aliases = globalInfo.aliases.getAll();
      expect(aliases).to.deep.equal({
        [alias1]: username1,
        [alias2]: username2,
        [alias3]: username1,
      });
    });

    it('should return all the aliases for a given username', async () => {
      const globalInfo = await GlobalInfo.create();
      const aliases = globalInfo.aliases.getAll(username1);
      expect(aliases).to.deep.equal([alias1, alias3]);
    });
  });

  describe('get', () => {
    it('should return first alias of username', async () => {
      const globalInfo = await GlobalInfo.create();
      const aliases = globalInfo.aliases.get(username1);
      expect(aliases).to.equal(alias1);
    });
  });

  describe('getUsername', () => {
    it('should return the username that corresponds to an alias', async () => {
      const globalInfo = await GlobalInfo.create();
      const username = globalInfo.aliases.getUsername(alias1);
      expect(username).to.equal(username1);
    });

    it('should return null if the alias does not exist', async () => {
      const globalInfo = await GlobalInfo.create();
      const username = globalInfo.aliases.getUsername('DOES_NOT_EXIST');
      expect(username).to.be.null;
    });
  });

  describe('resolveUsername', () => {
    it('should return a username if a username was provided', async () => {
      const globalInfo = await GlobalInfo.create();
      const username = globalInfo.aliases.resolveUsername(username1);
      expect(username).to.equal(username1);
    });

    it('should return a username if an alias was provided', async () => {
      const globalInfo = await GlobalInfo.create();
      const username = globalInfo.aliases.getUsername(alias1);
      expect(username).to.equal(username1);
    });
  });

  describe('set', () => {
    it('should set an alias for a username', async () => {
      const globalInfo = await GlobalInfo.create();
      globalInfo.aliases.set('foobar', username1);
      const aliases = globalInfo.aliases.getAll(username1);
      expect(aliases).to.include('foobar');
    });

    it('should set an alias for an org', async () => {
      const globalInfo = await GlobalInfo.create();
      globalInfo.aliases.set('foobar', org);
      const aliases = globalInfo.aliases.getAll(org.username);
      expect(aliases).to.include('foobar');
    });

    it('should set an alias for a token', async () => {
      const globalInfo = await GlobalInfo.create();
      globalInfo.aliases.set('foobar', token);
      const aliases = globalInfo.aliases.getAll(token.user);
      expect(aliases).to.include('foobar');
    });
  });

  describe('update', () => {
    it('should update an alias for a username', async () => {
      const globalInfo = await GlobalInfo.create();
      globalInfo.aliases.update('foobar', username1);
      const aliases = globalInfo.aliases.getAll(username1);
      expect(aliases).to.include('foobar');
    });

    it('should update an alias for an org', async () => {
      const globalInfo = await GlobalInfo.create();
      globalInfo.aliases.set('foobar', org);
      const aliases = globalInfo.aliases.getAll(org.username);
      expect(aliases).to.include('foobar');
    });

    it('should update an alias for a token', async () => {
      const globalInfo = await GlobalInfo.create();
      globalInfo.aliases.update('foobar', token);
      const aliases = globalInfo.aliases.getAll(token.user);
      expect(aliases).to.include('foobar');
    });
  });

  describe('unsetAll', () => {
    it('should unset all the aliases for a given username', async () => {
      const globalInfo = await GlobalInfo.create();
      globalInfo.aliases.unsetAll(username1);
      const aliases = globalInfo.aliases.getAll(username1);
      expect(aliases).to.deep.equal([]);
    });
  });
});
