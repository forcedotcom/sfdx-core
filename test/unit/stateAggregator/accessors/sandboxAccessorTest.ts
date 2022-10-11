/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { StateAggregator } from '../../../../src/stateAggregator';
import { MockTestOrgData, MockTestSandboxData, TestContext, uniqid } from '../../../../src/testSetup';

const sandboxUsername = 'espresso@coffee.com.mysandbox';
const prodOrgUsername = 'espresso@coffee.com';
const id = uniqid();
const org = new MockTestOrgData(id, { username: sandboxUsername });
const sandboxMock = new MockTestSandboxData(id, { username: sandboxUsername, prodOrgUsername });

describe('SandboxAccessor', () => {
  const $$ = new TestContext();
  beforeEach(async () => {
    await $$.stubAuths(org);
    await $$.stubSandboxes(sandboxMock);
  });

  describe('readAll', () => {
    it('should return all the sandboxes', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const actual = await stateAggregator.sandboxes.readAll();
      expect(actual).to.deep.equal([await sandboxMock.getConfig()]);
    });
  });

  describe('read', () => {
    it('should return the sandbox for a given username', async () => {
      const stateAggregator = await StateAggregator.getInstance();
      const actual = await stateAggregator.sandboxes.read(sandboxUsername);
      expect(actual).to.deep.equal(await sandboxMock.getConfig());
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
