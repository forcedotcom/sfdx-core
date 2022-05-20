/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { GlobalInfo, StateAggregator } from '../../../../src/globalInfo';
import { MockTestOrgData, MockTestSandboxData, testSetup, uniqid } from '../../../../src/testSetup';

const sandboxUsername = 'espresso@coffee.com.mysandbox';
const prodOrgUsername = 'espresso@coffee.com';
const id = uniqid();
const org = new MockTestOrgData(id, { username: sandboxUsername });
const sandbox = new MockTestSandboxData(id, { username: sandboxUsername, prodOrgUsername });

describe('SandboxAccessor', () => {
  const $$ = testSetup();
  beforeEach(async () => {
    await $$.stubAuths(org);
    await $$.stubSandboxes(sandbox);
  });

  describe('readAll', () => {
    it('should return all the sandboxes', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const actual = await stateAggregator.sandboxes.readAll();
      expect(actual).to.deep.equal([await sandbox.getConfig()]);
    });
  });

  describe('read', () => {
    it('should return the sandbox for a given username', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const actual = await stateAggregator.sandboxes.read(sandboxUsername);
      expect(actual).to.deep.equal(await sandbox.getConfig());
    });
  });

  describe('get', () => {
    it('should return prodOrgUsername', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      await stateAggregator.sandboxes.readAll();
      const sandbox = stateAggregator.sandboxes.get(sandboxUsername);
      expect(sandbox).to.have.property('prodOrgUsername', prodOrgUsername);
    });
    it('should null for unknown sandboxUsername', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      await stateAggregator.sandboxes.readAll();
      const sandbox = stateAggregator.sandboxes.get('foobarbaz');
      expect(sandbox).to.not.be.ok;
    });
  });

  describe('set', () => {
    it('should set a prodOrgUsername for a sandboxUsername', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      stateAggregator.sandboxes.set(sandboxUsername, {
        sandboxUsername: '',
        sandboxOrgId: '',
        prodOrgUsername,
        sandboxName: '',
      });
      const sandbox = stateAggregator.sandboxes.get(sandboxUsername);
      expect(sandbox).to.have.property('prodOrgUsername', prodOrgUsername);
    });
  });
});

describe('GlobalInfoSandboxAccessor', () => {
  const $$ = testSetup();

  beforeEach(async () => {
    $$.setConfigStubContents('GlobalInfo', {
      contents: {
        orgs: { [sandboxUsername]: await org.getConfig() },
        sandboxes: { [sandbox.id]: await sandbox.getConfig() },
      },
    });
  });

  describe('getAll', () => {
    it('should return all the sandboxes if no username is provided', async () => {
      const globalInfo = await GlobalInfo.create();
      const actual = globalInfo.sandboxes.getAll();
      expect(actual).to.deep.equal({ [sandbox.id]: await sandbox.getConfig() });
    });

    it('should return all the sandboxes for a given production org username', async () => {
      const globalInfo = await GlobalInfo.create();
      const sandboxes = globalInfo.sandboxes.getAll(prodOrgUsername);
      expect(sandboxes[org.orgId]).to.deep.equal(await sandbox.getConfig());
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
