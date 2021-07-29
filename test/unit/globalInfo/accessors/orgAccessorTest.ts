/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { stubMethod } from '@salesforce/ts-sinon';
import { expect } from 'chai';
import { GlobalInfo, SfOrg } from '../../../../src/globalInfo';
import { testSetup } from '../../../../src/testSetup';

describe('OrgAccessor', () => {
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
    it('should return all the orgs', async () => {
      const globalInfo = await GlobalInfo.create();
      const orgs = globalInfo.orgs.getAll();
      expect(orgs).to.deep.equal({ [username]: org });
    });
  });

  describe('get', () => {
    it('should return org that corresponds to a username', async () => {
      const globalInfo = await GlobalInfo.create();
      const result = globalInfo.orgs.get(username);
      expect(result).to.deep.equal(org);
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
      const result = globalInfo.orgs.get('foobar@baz.com');
      expect(result).to.deep.equal(newOrg);
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
      const newOrg = Object.assign(org, { instanceUrl });
      globalInfo.orgs.update(username, newOrg);
      const result = globalInfo.orgs.get(username);
      expect(result.instanceUrl).to.deep.equal(instanceUrl);
    });

    it('should add the username if does not exist on the object', async () => {
      const globalInfo = await GlobalInfo.create();
      const newOrg = Object.assign(org, { instanceUrl });
      delete newOrg.username;

      globalInfo.orgs.set(username, newOrg);
      const result = globalInfo.orgs.get(username);
      expect(result.username).to.deep.equal(username);
    });
  });
});
