/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { AuthInfo } from '../../../src/org/authInfo';
import { Connection } from '../../../src/org/connection';
import { Org } from '../../../src/org/org';
import { PermissionSetAssignment } from '../../../src/org/permissionSetAssignment';
import { MockTestOrgData, shouldThrow, testSetup } from '../../../src/testSetup';

const $$ = testSetup();

describe('permission set assignment tests', () => {
  let userTestdata: MockTestOrgData;

  beforeEach(() => {
    userTestdata = new MockTestOrgData();
  });

  describe('create tests', () => {
    let org: Org;
    beforeEach(async () => {
      $$.stubAuths(userTestdata);
      org = await Org.create({
        connection: await Connection.create({
          authInfo: await AuthInfo.create({ username: userTestdata.username }),
        }),
      });
    });

    it('should create a perm set assignment.', async () => {
      let query = '';
      // @ts-ignore
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

      // @ts-ignore
      $$.SANDBOX.stub(Connection.prototype, 'sobject').callsFake(() => {
        return {
          create() {
            return Promise.resolve({ success: true });
          },
        };
      });

      const assignment: PermissionSetAssignment = await PermissionSetAssignment.init(org);
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
      // @ts-ignore
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

      // @ts-ignore
      $$.SANDBOX.stub(Connection.prototype, 'sobject').callsFake(() => {
        return {
          create() {
            return Promise.resolve({ success: true });
          },
        };
      });

      const assignment: PermissionSetAssignment = await PermissionSetAssignment.init(org);
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
      // @ts-ignore
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

      // @ts-ignore
      $$.SANDBOX.stub(Connection.prototype, 'sobject').callsFake(() => {
        return {
          create() {
            return Promise.resolve({ success: true });
          },
        };
      });

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
      // @ts-ignore
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

      // @ts-ignore
      $$.SANDBOX.stub(Connection.prototype, 'sobject').callsFake(() => {
        return {
          create() {
            return Promise.resolve({ errors: ['error one', 'error two'] });
          },
        };
      });

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
      // @ts-ignore
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

      // @ts-ignore
      $$.SANDBOX.stub(Connection.prototype, 'sobject').callsFake(() => {
        return {
          create() {
            return Promise.resolve({ errors: [] });
          },
        };
      });

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
