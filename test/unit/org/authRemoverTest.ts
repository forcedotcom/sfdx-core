/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { spyMethod } from '@salesforce/ts-sinon';
import { assert, expect } from 'chai';
import { AuthRemover } from '../../../src/org/authRemover';
import { Config } from '../../../src/config/config';
import { AliasAccessor } from '../../../src/globalInfo';
import { MockTestOrgData, testSetup } from '../../../src/testSetup';
import { OrgConfigProperties } from '../../../src/org/orgConfigProperties';
import { AuthFields } from '../../../src/org';

describe('AuthRemover', () => {
  const username = 'espresso@coffee.com';
  const orgId = '123456';
  const org = new MockTestOrgData(orgId, { username });
  const $$ = testSetup();

  function expectPartialDeepMatch(actual: AuthFields, expected: AuthFields, ignore = ['refreshToken', 'accessToken']) {
    for (const key of ignore) {
      delete actual[key];
      delete expected[key];
    }
    expect(actual).to.deep.equal(expected);
  }

  beforeEach(async () => {
    await $$.stubAuths(org);
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
      $$.setConfigStubContents('AliasesConfig', { contents: { [alias]: username } });
      const remover = await AuthRemover.create();

      // @ts-ignore because private method
      const resolved = await remover.resolveUsername(alias);
      expect(resolved).to.equal(username);
    });
  });

  describe('findAllAuths', () => {
    it('should return all authorization', async () => {
      const remover = await AuthRemover.create();
      const auths = remover.findAllAuths();

      expect(auths).to.have.property(username);
    });
  });

  describe('findAuth', () => {
    it('should return authorization for provided username', async () => {
      const remover = await AuthRemover.create();
      const auth = await remover.findAuth(username);
      expectPartialDeepMatch(auth, await org.getConfig());
    });

    it('should return authorization for provided alias', async () => {
      const alias = 'MyAlias';
      $$.setConfigStubContents('AliasesConfig', { contents: { [alias]: username } });
      const remover = await AuthRemover.create();
      const auth = await remover.findAuth(alias);
      expectPartialDeepMatch(auth, await org.getConfig());
    });

    it('should return authorization for target-org (set to username) if no username is provided', async () => {
      $$.setConfigStubContents('Config', { contents: { [OrgConfigProperties.TARGET_ORG]: username } });
      const remover = await AuthRemover.create();
      const auth = await remover.findAuth();
      expectPartialDeepMatch(auth, await org.getConfig());
    });

    it('should return authorization for target-org (set to alias) if no username is provided', async () => {
      const alias = 'MyAlias';
      $$.setConfigStubContents('AliasesConfig', { contents: { [alias]: username } });
      $$.setConfigStubContents('Config', { contents: { [OrgConfigProperties.TARGET_ORG]: alias } });
      const remover = await AuthRemover.create();
      const auth = await remover.findAuth();
      expectPartialDeepMatch(auth, await org.getConfig());
    });

    it('should throw an error if no username is provided and target-org is not set', async () => {
      const remover = await AuthRemover.create();
      try {
        await remover.findAuth();
        assert.fail();
      } catch (err) {
        expect(err.name).to.equal('TargetOrgNotSetError');
        expect(err.actions).has.length(3);
      }
    });
  });

  describe('unsetConfigValues', () => {
    it('should unset config values for provided username locally and globally', async () => {
      const configUnsetSpy = spyMethod($$.SANDBOX, Config.prototype, 'unset');

      const alias = 'MyAlias';
      $$.setConfigStubContents('AliasesConfig', { contents: { [alias]: username } });
      $$.setConfigStubContents('Config', {
        contents: { [OrgConfigProperties.TARGET_ORG]: alias, [OrgConfigProperties.TARGET_DEV_HUB]: alias },
      });

      const remover = await AuthRemover.create();
      // @ts-ignore because private member
      await remover.unsetConfigValues(username);
      // expect 4 calls to unset:
      // 1. unset target-org locally
      // 2. unset target-org globally
      // 3. unset target-dev-hub locally
      // 4. unset target-dev-hub globally
      expect(configUnsetSpy.callCount).to.equal(4);
      expect(configUnsetSpy.args).to.deep.equal([
        [OrgConfigProperties.TARGET_ORG],
        [OrgConfigProperties.TARGET_DEV_HUB],
        [OrgConfigProperties.TARGET_ORG],
        [OrgConfigProperties.TARGET_DEV_HUB],
      ]);
      expect($$.stubs.configWrite.callCount).to.equal(2);
    });
  });

  describe('unsetAliases', () => {
    it('should unset aliases for provided username', async () => {
      const aliasesSpy = spyMethod($$.SANDBOX, AliasAccessor.prototype, 'unset');
      const alias1 = 'MyAlias';
      const alias2 = 'MyOtherAlias';
      $$.setConfigStubContents('AliasesConfig', { contents: { [alias1]: username, [alias2]: username } });
      const remover = await AuthRemover.create();
      // @ts-ignore because private member
      await remover.unsetAliases(username);
      // expect 2 calls: one for each alias
      expect(aliasesSpy.callCount).to.equal(2);
      expect(aliasesSpy.args).to.deep.equal([[alias1], [alias2]]);
    });
  });
});
