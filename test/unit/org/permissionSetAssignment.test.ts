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
import { expect, config } from 'chai';
import { AuthInfo } from '../../../src/org/authInfo';
import { Connection } from '../../../src/org/connection';
import { Org } from '../../../src/org/org';
import { PermissionSetAssignment } from '../../../src/org/permissionSetAssignment';
import { MockTestOrgData, shouldThrow, TestContext } from '../../../src/testSetup';

config.truncateThreshold = 0;

describe('permission set assignment tests', () => {
  const $$ = new TestContext();
  let userTestData: MockTestOrgData;

  beforeEach(() => {
    userTestData = new MockTestOrgData();
  });

  describe('create tests', () => {
    let org: Org;
    beforeEach(async () => {
      await $$.stubAuths(userTestData);
      org = await Org.create({
        connection: await Connection.create({
          authInfo: await AuthInfo.create({ username: userTestData.username }),
        }),
      });
    });

    it('should create a perm set assignment.', async () => {
      let query = '';
      // @ts-expect-error - fake function does not match target signature
      $$.SANDBOX.stub(Connection.prototype, 'query').callsFake((_query: string) => {
        query = _query.toLowerCase();
        if (query.includes('from permissionset')) {
          return {
            records: [{ Id: '123456' }],
            totalSize: 1,
          };
        }

        return {};
      });

      $$.SANDBOX.stub(Connection.prototype, 'sobject').callsFake(() => ({
        // @ts-expect-error - cannot assign type not quite the same
        create() {
          return Promise.resolve({ success: true });
        },
      }));

      const assignment = await PermissionSetAssignment.init(org);
      const PERM_SET_NAME = 'Foo';
      const NS = 'NS';
      await assignment.create('123456', `${NS}__${PERM_SET_NAME}`);

      expect(query).to.include('namespaceprefix');
      expect(query).to.include(NS.toLowerCase());
      expect(query).to.include('name');
      expect(query).to.include(PERM_SET_NAME.toLowerCase());
    });

    it('Failed to find permsets with namespace', async () => {
      let query = '';
      // @ts-expect-error - fake function does not match target signature
      $$.SANDBOX.stub(Connection.prototype, 'query').callsFake((_query: string) => {
        query = _query.toLowerCase();
        if (query.includes('from permissionset')) {
          return {
            records: [],
            totalSize: 0,
          };
        }

        return {};
      });

      $$.SANDBOX.stub(Connection.prototype, 'sobject').callsFake(() => ({
        // @ts-expect-error - type mismatch
        create() {
          return Promise.resolve({ success: true });
        },
      }));

      const assignment = await PermissionSetAssignment.init(org);
      const PERM_SET_NAME = 'Foo';
      const NS = 'NS';
      try {
        await shouldThrow(assignment.create('123456', `${NS}__${PERM_SET_NAME}`));
      } catch (e) {
        expect(e).to.have.property('name', 'AssignCommandPermissionSetNotFoundForNSError');
      }
    });

    it('Failed to find permsets without namespace', async () => {
      let query = '';
      // @ts-expect-error - fake function does not match target signature
      $$.SANDBOX.stub(Connection.prototype, 'query').callsFake((_query: string) => {
        query = _query.toLowerCase();
        if (query.includes('from permissionset')) {
          return {
            records: [],
            totalSize: 0,
          };
        }

        return {};
      });

      $$.SANDBOX.stub(Connection.prototype, 'sobject').callsFake(() => ({
        // @ts-expect-error - type mismatch
        create() {
          return Promise.resolve({ success: true });
        },
      }));

      const assignment: PermissionSetAssignment = await PermissionSetAssignment.init(org);
      const PERM_SET_NAME = 'Foo';
      try {
        await shouldThrow(assignment.create('123456', `${PERM_SET_NAME}`));
      } catch (e) {
        expect(e).to.have.property('name', 'AssignCommandPermissionSetNotFoundError');
      }
    });

    it('permset assignment with errors', async () => {
      let query = '';
      // @ts-expect-error - fake function does not match target signature
      $$.SANDBOX.stub(Connection.prototype, 'query').callsFake((_query: string) => {
        query = _query.toLowerCase();
        if (query.includes('from permissionset')) {
          return {
            records: [{ Id: '123456' }],
            totalSize: 1,
          };
        }

        return {};
      });

      $$.SANDBOX.stub(Connection.prototype, 'sobject').callsFake(() => ({
        // @ts-expect-error - type mismatch
        create() {
          return Promise.resolve({ success: false, errors: ['error one', 'error two'] });
        },
      }));

      const assignment: PermissionSetAssignment = await PermissionSetAssignment.init(org);
      const PERM_SET_NAME = 'Foo';
      const NS = 'NS';
      try {
        await shouldThrow(assignment.create('123456', `${NS}__${PERM_SET_NAME}`));
      } catch (e) {
        expect(e).to.have.property('name', 'errorsEncounteredCreatingAssignment');
      }
    });

    it('permset assignment with empty errors', async () => {
      let query = '';
      // @ts-expect-error - fake function does not match target signature
      $$.SANDBOX.stub(Connection.prototype, 'query').callsFake((_query: string) => {
        query = _query.toLowerCase();
        if (query.includes('from permissionset')) {
          return {
            records: [{ Id: '123456' }],
            totalSize: 1,
          };
        }

        return {};
      });

      $$.SANDBOX.stub(Connection.prototype, 'sobject').callsFake(() => ({
        // @ts-expect-error - type mismatch
        create() {
          return Promise.resolve({ errors: [] });
        },
      }));

      const assignment: PermissionSetAssignment = await PermissionSetAssignment.init(org);
      const PERM_SET_NAME = 'Foo';
      const NS = 'NS';
      try {
        await shouldThrow(assignment.create('123456', `${NS}__${PERM_SET_NAME}`));
      } catch (e) {
        expect(e).to.have.property('name', 'UnexpectedResult');
      }
    });
  });
});
