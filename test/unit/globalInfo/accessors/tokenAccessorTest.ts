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

describe('TokenAccessor', () => {
  const username = 'espresso@coffee.com';
  const alias = 'MyAlias';
  const org = { username, orgId: '12345', alias };
  const token = { token: '123', url: 'https://login.salesforce.com', user: username };
  const $$ = testSetup();

  beforeEach(async () => {
    $$.SANDBOXES.CONFIG.restore();

    stubMethod($$.SANDBOX, GlobalInfo.prototype, 'read').callsFake(async function (this: GlobalInfo) {
      const contents = {
        orgs: { [username]: org },
        aliases: { [alias]: username },
        tokens: { [username]: token },
      };
      this.setContentsFromObject(contents);
      return this.getContents();
    });
    stubMethod($$.SANDBOX, GlobalInfo.prototype, 'write').callsFake(() => {});
  });

  describe('getAll', () => {
    it('should return all the tokens', async () => {
      const globalInfo = await GlobalInfo.create();
      const tokens = globalInfo.tokens.getAll();
      expect(tokens).to.deep.equal({ [username]: token });
    });
  });

  describe('get', () => {
    it('should return token that corresponds to a username', async () => {
      const globalInfo = await GlobalInfo.create();
      const result = globalInfo.tokens.get(username);
      expect(result).to.deep.equal(token);
    });
  });

  describe('has', () => {
    it('should return true if token exists', async () => {
      const globalInfo = await GlobalInfo.create();
      const result = globalInfo.tokens.has(username);
      expect(result).to.deep.equal(true);
    });

    it('should return false if token does not exist', async () => {
      const globalInfo = await GlobalInfo.create();
      const result = globalInfo.tokens.has('DOES_NOT_EXIST');
      expect(result).to.deep.equal(false);
    });
  });

  describe('set', () => {
    it('should set the token', async () => {
      const globalInfo = await GlobalInfo.create();
      const newToken = { username: 'foobar@baz.com', token: '123', url: 'https://login.salesforce.com' };
      globalInfo.tokens.set('foobar@baz.com', newToken);
      const result = globalInfo.tokens.has('foobar@baz.com');
      expect(result).to.be.true;
    });
  });

  describe('update', () => {
    it('should update the token', async () => {
      const globalInfo = await GlobalInfo.create();
      const instanceUrl = 'https://login.salesforce.com';
      const newToken = { ...token, instanceUrl };
      globalInfo.tokens.update(username, newToken);
      const result = globalInfo.tokens.get(username);
      expect(result.instanceUrl).to.deep.equal(instanceUrl);
    });
  });

  describe('unset', () => {
    it('should remove the token', async () => {
      const globalInfo = await GlobalInfo.create();
      globalInfo.tokens.unset(username);
      const result = globalInfo.tokens.get(username);
      expect(result).to.be.undefined;
    });
  });
});
