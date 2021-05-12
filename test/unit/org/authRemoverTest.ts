/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { spyMethod, stubMethod } from '@salesforce/ts-sinon';
import { assert, expect } from 'chai';
import { AuthRemover } from '../../../src/org/authRemover';
import { Aliases } from '../../../src/config/aliases';
import { Config } from '../../../src/config/config';
import { ConfigAggregator } from '../../../src/config/configAggregator';
import { GlobalInfo } from '../../../src/config/globalInfoConfig';
import { testSetup } from '../../../src/testSetup';

describe('AuthRemover', () => {
  const username = 'espresso@coffee.com';
  const $$ = testSetup();

  beforeEach(async () => {
    $$.SANDBOXES.CONFIG.restore();
    // Turn off the interoperability feature so that we don't have to mock
    // the old .sfdx config files
    // @ts-ignore
    GlobalInfo.enableInteroperability = false;

    stubMethod($$.SANDBOX, GlobalInfo.prototype, 'read').callsFake(async function (this: GlobalInfo) {
      const authData = {
        username,
        orgId: '12345',
      };
      const contents = {
        authorizations: { [username]: authData },
      };
      this.setContentsFromObject(contents);
      return this.getContents();
    });
  });
  afterEach(() => {
    // @ts-ignore becuase private member
    GlobalInfo.instance = null;
  });

  describe('resolveUsername', () => {
    it('should return username if no alias exists', async () => {
      const remover = await AuthRemover.create();
      // @ts-ignore because private method
      const resolved = await remover.resolveUsername(username);
      expect(resolved).to.equal(username);
    });

    it('should return username if given an alias', async () => {
      const alias = 'MyAlias';
      stubMethod($$.SANDBOX, Aliases.prototype, 'get').withArgs(alias).returns(username);
      const remover = await AuthRemover.create();
      // @ts-ignore because private method
      const resolved = await remover.resolveUsername(alias);
      expect(resolved).to.equal(username);
    });
  });

  describe('findAllAuths', () => {
    it('should return all authorization', async () => {
      stubMethod($$.SANDBOX, GlobalInfo.prototype, 'getAuthorizations').returns({ [username]: {} });
      const remover = await AuthRemover.create();
      const auths = remover.findAllAuths();

      expect(auths).to.have.property(username);
    });
  });

  describe('findAuth', () => {
    it('should return authorization for provided username', async () => {
      stubMethod($$.SANDBOX, GlobalInfo.prototype, 'getAuthorization').returns({ username, orgId: '12345' });
      const remover = await AuthRemover.create();
      const auth = await remover.findAuth(username);

      expect(auth).to.deep.equal({ username, orgId: '12345' });
    });

    it('should return authorization for provided alias', async () => {
      const alias = 'MyAlias';
      stubMethod($$.SANDBOX, Aliases.prototype, 'get').withArgs(alias).returns(username);
      stubMethod($$.SANDBOX, GlobalInfo.prototype, 'getAuthorization').returns({ username, orgId: '12345' });
      const remover = await AuthRemover.create();
      const auth = await remover.findAuth(alias);
      expect(auth).to.deep.equal({ username, orgId: '12345' });
    });

    it('should return authorization for defaultusername (set to username) if no username is provided', async () => {
      stubMethod($$.SANDBOX, GlobalInfo.prototype, 'getAuthorization').returns({ username, orgId: '12345' });
      stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'getInfo')
        .withArgs(Config.DEFAULT_USERNAME)
        .returns({ value: username });
      const remover = await AuthRemover.create();
      const auth = await remover.findAuth();
      expect(auth).to.deep.equal({ username, orgId: '12345' });
    });

    it('should return authorization for defaultusername (set to alias) if no username is provided', async () => {
      const alias = 'MyAlias';
      stubMethod($$.SANDBOX, GlobalInfo.prototype, 'getAuthorization').returns({ username, orgId: '12345' });
      stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'getInfo')
        .withArgs(Config.DEFAULT_USERNAME)
        .returns({ value: alias });
      stubMethod($$.SANDBOX, Aliases.prototype, 'get').withArgs(alias).returns(username);
      const remover = await AuthRemover.create();
      const auth = await remover.findAuth();
      expect(auth).to.deep.equal({ username, orgId: '12345' });
    });

    it('should throw an error if no username is provided and defaultusername is not set', async () => {
      stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'getInfo')
        .withArgs(Config.DEFAULT_USERNAME)
        .returns({ value: undefined });
      const remover = await AuthRemover.create();
      try {
        await remover.findAuth();
        assert.fail();
      } catch (err) {
        expect(err.name).to.equal('DefaultUsernameNotSetError');
        expect(err.actions).has.length(3);
      }
    });
  });

  describe('unsetConfigValues', () => {
    it('should unset config values for provided username locally and globally', async () => {
      const configWriteSpy = spyMethod($$.SANDBOX, Config.prototype, 'write');
      const configUnsetSpy = spyMethod($$.SANDBOX, Config.prototype, 'unset');

      const alias = 'MyAlias';
      stubMethod($$.SANDBOX, Aliases.prototype, 'getKeysByValue').returns([alias]);
      stubMethod($$.SANDBOX, Config.prototype, 'getKeysByValue').returns([
        Config.DEFAULT_USERNAME,
        Config.DEFAULT_DEV_HUB_USERNAME,
      ]);

      const remover = await AuthRemover.create();
      // @ts-ignore because private member
      await remover.unsetConfigValues(username);
      // expect 4 calls to unset:
      // 1. unset defaultusername locally
      // 2. unset defaultusername globally
      // 3. unset defaultdevhubusername locally
      // 4. unset defaultdevhubusername globally
      expect(configUnsetSpy.callCount).to.equal(4);
      expect(configUnsetSpy.args).to.deep.equal([
        [Config.DEFAULT_USERNAME],
        [Config.DEFAULT_DEV_HUB_USERNAME],
        [Config.DEFAULT_USERNAME],
        [Config.DEFAULT_DEV_HUB_USERNAME],
      ]);
      expect(configWriteSpy.callCount).to.equal(1);
    });
  });

  describe('unsetAliases', () => {
    it('should unset aliases for provided username', async () => {
      const aliasesSpy = spyMethod($$.SANDBOX, Aliases.prototype, 'unset');
      stubMethod($$.SANDBOX, Aliases.prototype, 'getKeysByValue').returns(['MyAlias', 'MyOtherAlias']);

      const remover = await AuthRemover.create();
      // @ts-ignore because private member
      await remover.unsetAliases(username);
      // expect 2 calls: one for each alias
      expect(aliasesSpy.callCount).to.equal(2);
      expect(aliasesSpy.args).to.deep.equal([['MyAlias'], ['MyOtherAlias']]);
    });
  });
});
