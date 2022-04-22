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
import { SfSandbox } from '../../../../src/globalInfo';

describe('SandboxAccessor', () => {
  const sandboxUsername = 'espresso@coffee.com.mysandbox';
  const prodOrgUsername = 'espresso@coffee.com';
  const org = { username: sandboxUsername, orgId: '12345' };
  const $$ = testSetup();
  const sandbox = { prodOrgUsername, sandboxName: '', sandboxUsername, sandboxOrgId: '12345' };
  const sandboxes = { [org.orgId]: { ...sandbox } as SfSandbox };

  beforeEach(async () => {
    $$.SANDBOXES.CONFIG.restore();

    stubMethod($$.SANDBOX, GlobalInfo.prototype, 'read').callsFake(async function (this: GlobalInfo) {
      const contents = {
        orgs: { [sandboxUsername]: org },
        sandboxes: {
          ...sandboxes,
        },
      };
      this.setContentsFromObject(contents);
      return this.getContents();
    });
    stubMethod($$.SANDBOX, GlobalInfo.prototype, 'write').callsFake(() => {});
  });

  describe('getAll', () => {
    it('should return all the sandboxes if no username is provided', async () => {
      const globalInfo = await GlobalInfo.create();
      const sandboxes = globalInfo.sandboxes.getAll();
      expect(sandboxes).to.deep.equal(sandboxes);
    });

    it('should return all the sandboxes for a given production org username', async () => {
      const globalInfo = await GlobalInfo.create();
      const sandboxes = globalInfo.sandboxes.getAll(prodOrgUsername);
      expect(sandboxes[org.orgId]).to.deep.equal(sandbox);
    });
  });

  describe('get', () => {
    it('should return prodOrgUsername', async () => {
      const globalInfo = await GlobalInfo.create();
      const sandbox = globalInfo.sandboxes.get(org.orgId);
      expect(sandbox).to.have.property('prodOrgUsername', prodOrgUsername);
    });
    it('should null for unknown sandboxUsername', async () => {
      const globalInfo = await GlobalInfo.create();
      const sandbox = globalInfo.sandboxes.get('foobarbaz');
      expect(sandbox).to.not.be.ok;
    });
  });

  describe('set', () => {
    it('should set a prodOrgUsername for a sandboxUsername', async () => {
      const globalInfo = await GlobalInfo.create();
      globalInfo.sandboxes.set(org.orgId, {
        sandboxUsername: '',
        sandboxOrgId: '',
        prodOrgUsername,
        sandboxName: '',
        timestamp: '',
      });
      const sandbox = globalInfo.sandboxes.get(org.orgId);
      expect(sandbox).to.have.property('prodOrgUsername', prodOrgUsername);
    });
  });
});
