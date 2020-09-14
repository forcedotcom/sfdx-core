/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { spyMethod, stubMethod } from '@salesforce/ts-sinon';
import { assert, expect } from 'chai';
import { AuthInfo } from '../../src/authInfo';
import { AuthRemover } from '../../src/authRemover';
import { Aliases } from '../../src/config/aliases';
import { AuthInfoConfig } from '../../src/config/authInfoConfig';
import { Config } from '../../src/config/config';
import { testSetup } from '../../src/testSetup';

describe('AuthRemover', () => {
  const username = 'espresso@coffee.com';
  const $$ = testSetup();

  describe('resolveUsername', () => {
    it('should return username if no alias exists', async () => {
      const remover = await AuthRemover.create();
      // @ts-ignore because private method
      const resolved = await remover.resolveUsername(username);
      expect(resolved).to.equal(username);
    });

    it('should return username if given an alias', async () => {
      const alias = 'MyAlias';
      $$.setConfigStubContents('Aliases', {
        contents: {
          orgs: { [alias]: username },
        },
      });
      const remover = await AuthRemover.create();
      // @ts-ignore because private method
      const resolved = await remover.resolveUsername(alias);
      expect(resolved).to.equal(username);
    });
  });

  describe('findAllAuthConfigs', () => {
    it('should return map of AuthInfoConfigs for all auth files', async () => {
      stubMethod($$.SANDBOX, AuthInfo, 'listAllAuthFiles').callsFake(async () =>
        Promise.resolve([`${username}.json`, 'user@example.com.json'])
      );
      const remover = await AuthRemover.create();
      const authConfigs = await remover.findAllAuthConfigs();

      expect(authConfigs.has(username)).to.equal(true);
      expect(authConfigs.get(username) instanceof AuthInfoConfig).to.be.true;

      expect(authConfigs.has('user@example.com')).to.equal(true);
      expect(authConfigs.get('user@example.com') instanceof AuthInfoConfig).to.be.true;
    });
  });

  describe('findAuthConfigs', () => {
    it('should return map of AuthInfoConfigs for provided username', async () => {
      stubMethod($$.SANDBOX, AuthInfo, 'listAllAuthFiles').callsFake(async () => Promise.resolve([`${username}.json`]));
      const remover = await AuthRemover.create();
      const authConfigs = await remover.findAuthConfigs(username);

      expect(authConfigs.has(username)).to.equal(true);
      expect(authConfigs.get(username) instanceof AuthInfoConfig).to.be.true;
    });

    it('should return map of AuthInfoConfigs for provided alias', async () => {
      const alias = 'MyAlias';
      $$.setConfigStubContents('Aliases', {
        contents: {
          orgs: { [alias]: username },
        },
      });
      stubMethod($$.SANDBOX, AuthInfo, 'listAllAuthFiles').callsFake(async () => Promise.resolve([`${username}.json`]));
      const remover = await AuthRemover.create();
      const authConfigs = await remover.findAuthConfigs(alias);
      expect(authConfigs.has(username)).to.equal(true);
      expect(authConfigs.get(username) instanceof AuthInfoConfig).to.be.true;
    });

    it('should return map of AuthInfoConfigs for defaultusername (set to username) if no username is provided', async () => {
      stubMethod($$.SANDBOX, AuthInfo, 'listAllAuthFiles').callsFake(async () => Promise.resolve([`${username}.json`]));
      $$.setConfigStubContents('Config', {
        contents: {
          [Config.DEFAULT_USERNAME]: username,
        },
      });
      const remover = await AuthRemover.create();
      const authConfigs = await remover.findAuthConfigs();
      expect(authConfigs.has(username)).to.equal(true);
      expect(authConfigs.get(username) instanceof AuthInfoConfig).to.be.true;
    });

    it('should return map of AuthInfoConfigs for defaultusername (set to alias) if no username is provided', async () => {
      stubMethod($$.SANDBOX, AuthInfo, 'listAllAuthFiles').callsFake(async () => Promise.resolve([`${username}.json`]));
      const alias = 'MyAlias';
      $$.setConfigStubContents('Aliases', {
        contents: {
          orgs: { [alias]: username },
        },
      });
      $$.setConfigStubContents('Config', {
        contents: {
          [Config.DEFAULT_USERNAME]: alias,
        },
      });
      const remover = await AuthRemover.create();
      const authConfigs = await remover.findAuthConfigs();
      expect(authConfigs.has(username)).to.equal(true);
      expect(authConfigs.get(username) instanceof AuthInfoConfig).to.be.true;
    });

    it('should return map of AuthInfoConfigs for defaultusername if provided username has no auth file ', async () => {
      stubMethod($$.SANDBOX, AuthInfo, 'listAllAuthFiles').callsFake(async () => Promise.resolve([`${username}.json`]));
      $$.setConfigStubContents('Config', {
        contents: {
          [Config.DEFAULT_USERNAME]: username,
        },
      });
      const remover = await AuthRemover.create();
      const authConfigs = await remover.findAuthConfigs('user@example.com');
      expect(authConfigs.has(username)).to.equal(true);
      expect(authConfigs.get(username) instanceof AuthInfoConfig).to.be.true;
    });

    it('should throw an error if no username is provided and defaultusername is not set', async () => {
      stubMethod($$.SANDBOX, AuthInfo, 'listAllAuthFiles').callsFake(async () => Promise.resolve([`${username}.json`]));
      const remover = await AuthRemover.create();
      try {
        await remover.findAuthConfigs();
        assert.fail();
      } catch (err) {
        expect(err.name).to.equal('NoOrgFound');
      }
    });
  });

  describe('filterAuthFilesForDefaultUsername', () => {
    it('should return auth files that belong to the defaultusername (username)', async () => {
      $$.setConfigStubContents('Config', {
        contents: {
          [Config.DEFAULT_USERNAME]: username,
        },
      });
      const remover = await AuthRemover.create();
      // @ts-ignore because private member
      const actual = await remover.filterAuthFilesForDefaultUsername([`${username}.json`, 'user@example.com']);
      expect(actual).to.deep.equal([`${username}.json`]);
    });

    it('should return auth files that belong to the defaultusername (alias)', async () => {
      const alias = 'MyAlias';
      $$.setConfigStubContents('Aliases', {
        contents: {
          orgs: { [alias]: username },
        },
      });
      $$.setConfigStubContents('Config', {
        contents: {
          [Config.DEFAULT_USERNAME]: alias,
        },
      });
      const remover = await AuthRemover.create();
      // @ts-ignore because private member
      const actual = await remover.filterAuthFilesForDefaultUsername([`${username}.json`, 'user@example.com']);
      expect(actual).to.deep.equal([`${username}.json`]);
    });

    it('should throw an error if defaultusername is not set', async () => {
      const remover = await AuthRemover.create();
      try {
        // @ts-ignore because private member
        await remover.filterAuthFilesForDefaultUsername([`${username}.json`]);
        assert.fail();
      } catch (err) {
        expect(err.name).to.equal('NoOrgFound');
      }
    });
  });

  describe('unsetConfigValues', () => {
    it('should unset config values for provided username locally and globally', async () => {
      const configWriteSpy = spyMethod($$.SANDBOX, Config.prototype, 'write');
      const configUnsetSpy = spyMethod($$.SANDBOX, Config.prototype, 'unset');

      const alias = 'MyAlias';
      $$.setConfigStubContents('Aliases', {
        contents: {
          orgs: { [alias]: username },
        },
      });
      $$.setConfigStubContents('Config', {
        contents: {
          [Config.DEFAULT_USERNAME]: alias,
          [Config.DEFAULT_DEV_HUB_USERNAME]: alias,
        },
      });
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
      // expect one call each for global and local config
      expect(configWriteSpy.callCount).to.equal(2);
    });

    it('should unset config values for provided username globally', async () => {
      const configWriteSpy = spyMethod($$.SANDBOX, Config.prototype, 'write');
      const configUnsetSpy = spyMethod($$.SANDBOX, Config.prototype, 'unset');
      const alias = 'MyAlias';
      $$.setConfigStubContents('Aliases', {
        contents: {
          orgs: { [alias]: username },
        },
      });
      $$.setConfigStubContents('Config', {
        contents: {
          [Config.DEFAULT_USERNAME]: alias,
          [Config.DEFAULT_DEV_HUB_USERNAME]: alias,
        },
      });
      const remover = await AuthRemover.create();
      // @ts-ignore because private member
      remover.localConfig = null;
      // @ts-ignore because private member
      await remover.unsetConfigValues(username);
      // expect 2 calls to unset:
      // 1. unset defaultdevhubusername locally
      // 2. unset defaultdevhubusername globally
      expect(configUnsetSpy.callCount).to.equal(2);
      expect(configUnsetSpy.args).to.deep.equal([[Config.DEFAULT_USERNAME], [Config.DEFAULT_DEV_HUB_USERNAME]]);
      // expect one call each for global and local config
      expect(configWriteSpy.callCount).to.equal(1);
    });
  });

  describe('unsetAliases', () => {
    it('should unset aliases for provided username', async () => {
      const aliasesSpy = spyMethod($$.SANDBOX, Aliases.prototype, 'unset');

      $$.setConfigStubContents('Aliases', {
        contents: {
          orgs: {
            MyAlias: username,
            MyOtherAlias: username,
          },
        },
      });

      const remover = await AuthRemover.create();
      // @ts-ignore because private member
      await remover.unsetAliases(username);
      // expect 2 calls: one for each alias
      expect(aliasesSpy.callCount).to.equal(2);
      expect(aliasesSpy.args).to.deep.equal([['MyAlias'], ['MyOtherAlias']]);
    });
  });

  describe('unlinkConfigFile', () => {
    it('should unlink AuthConfigFile', async () => {
      stubMethod($$.SANDBOX, AuthInfoConfig.prototype, 'exists').returns(Promise.resolve(true));
      const unlinkSpy = stubMethod($$.SANDBOX, AuthInfoConfig.prototype, 'unlink').returns(Promise.resolve());
      stubMethod($$.SANDBOX, AuthInfo, 'listAllAuthFiles').callsFake(async () => Promise.resolve([`${username}.json`]));
      const remover = await AuthRemover.create();
      await remover.findAllAuthConfigs();
      // @ts-ignore because private member
      await remover.unlinkConfigFile(username);
      expect(unlinkSpy.callCount).to.equal(1);
    });

    it('should unlink AuthConfigFile when username is not yet in this.authConfigs', async () => {
      stubMethod($$.SANDBOX, AuthInfoConfig.prototype, 'exists').returns(Promise.resolve(true));
      stubMethod($$.SANDBOX, AuthInfo, 'listAllAuthFiles').callsFake(async () => Promise.resolve([`${username}.json`]));
      const unlinkSpy = stubMethod($$.SANDBOX, AuthInfoConfig.prototype, 'unlink').returns(Promise.resolve());
      const findAuthConfigsSpy = spyMethod($$.SANDBOX, AuthRemover.prototype, 'findAuthConfigs');
      const remover = await AuthRemover.create();
      // @ts-ignore because private member
      await remover.unlinkConfigFile(username);
      expect(unlinkSpy.callCount).to.equal(1);
      expect(findAuthConfigsSpy.callCount).to.equal(1);
      expect(findAuthConfigsSpy.firstCall.args).to.deep.equal([username]);
    });

    it('should do nothing when there is no auth file', async () => {
      stubMethod($$.SANDBOX, AuthInfoConfig.prototype, 'exists').returns(Promise.resolve(false));
      stubMethod($$.SANDBOX, AuthInfo, 'listAllAuthFiles').callsFake(async () => Promise.resolve([]));
      const unlinkSpy = stubMethod($$.SANDBOX, AuthInfoConfig.prototype, 'unlink').returns(Promise.resolve());
      stubMethod($$.SANDBOX, AuthRemover.prototype, 'findAuthConfigs').returns(Promise.resolve(new Map()));

      const remover = await AuthRemover.create();
      // @ts-ignore because private member
      await remover.unlinkConfigFile(username);
      expect(unlinkSpy.callCount).to.equal(0);
    });
  });
});
