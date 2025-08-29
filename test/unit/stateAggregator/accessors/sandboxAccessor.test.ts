/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { expect } from 'chai';
import { StateAggregator } from '../../../../src/stateAggregator/stateAggregator';
import { MockTestOrgData, MockTestSandboxData, TestContext } from '../../../../src/testSetup';
import { uniqid } from '../../../../src/util/uniqid';

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
