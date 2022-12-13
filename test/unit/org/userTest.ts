/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { stubMethod } from '@salesforce/ts-sinon';
import { AnyJson, isString } from '@salesforce/ts-types';
import { expect } from 'chai';
import { SecureBuffer } from '../../../src/crypto/secureBuffer';
import { MockTestOrgData, shouldThrow, shouldThrowSync, TestContext } from '../../../src/testSetup';
import { DefaultUserFields, User, PermissionSetAssignment, Org, Connection, AuthInfo } from '../../../src/org';

describe('User Tests', () => {
  const $$ = new TestContext();
  let adminTestData: MockTestOrgData;
  let user1: MockTestOrgData;

  let refreshSpy: sinon.SinonSpy;
  beforeEach(async () => {
    adminTestData = new MockTestOrgData();
    user1 = new MockTestOrgData();

    await $$.stubAuths(adminTestData, user1);

    $$.fakeConnectionRequest = (request): Promise<AnyJson> => {
      if (isString(request) && request.endsWith('sobjects/User/describe')) {
        return Promise.resolve({ fields: {} });
      }
      return Promise.resolve({});
    };

    stubMethod($$.SANDBOX, Connection.prototype, 'query').callsFake((query: string) => {
      if (query.includes(adminTestData.username)) {
        return {
          records: [adminTestData.getMockUserInfo()],
          totalSize: 1,
        };
      }

      if (query.includes(user1.username)) {
        return {
          records: [user1.getMockUserInfo()],
          totalSize: 1,
        };
      }

      if (query.includes('Standard User')) {
        return { records: [{ Id: '123456' }] };
      }

      return {};
    });

    stubMethod($$.SANDBOX, AuthInfo.prototype, 'buildRefreshTokenConfig').callsFake(() => ({
      instanceUrl: '',
      accessToken: '',
    }));

    stubMethod($$.SANDBOX, AuthInfo.prototype, 'determineIfDevHub').resolves(false);

    refreshSpy = stubMethod($$.SANDBOX, Org.prototype, 'refreshAuth').resolves({});
  });

  describe('init tests', () => {
    it('refresh auth called', async () => {
      stubMethod($$.SANDBOX, User.prototype, 'rawRequest').resolves({
        statusCode: 201,
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        body: `{"id": "${user1.getMockUserInfo()['Id']}"}`,
        headers: {
          'auto-approve-user': user1.refreshToken,
        },
      });
      expect(refreshSpy.calledOnce).to.equal(false);
      const org = await Org.create({
        connection: await Connection.create({
          authInfo: await AuthInfo.create({ username: adminTestData.username }),
        }),
      });
      await User.create({ org });
      expect(refreshSpy.calledOnce).to.equal(true);
    });

    it('refresh auth called error code 400', async () => {
      stubMethod($$.SANDBOX, User.prototype, 'rawRequest').resolves({
        body: `{
                    "statusCode": "400"
                }`,
      });

      const org = await Org.create({
        connection: await Connection.create({
          authInfo: await AuthInfo.create({ username: adminTestData.username }),
        }),
      });
      const user = await User.create({ org });

      try {
        const options: DefaultUserFields.Options = {
          templateUser: adminTestData.username,
          newUserName: user1.username,
        };
        const fields: DefaultUserFields = await DefaultUserFields.create(options);
        await shouldThrow(user.createUser(fields.getFields()));
      } catch (e) {
        expect(e).to.have.property('name', 'UserCreateHttpError');
      }
    });
  });

  describe('generatePasswordUtf8', () => {
    const iterations = 1000;

    it(`Should generate ${iterations} passwords containing at least one number and one upper and lowercase letter `, () => {
      for (let i = 0; i < iterations; i++) {
        const password: SecureBuffer<void> = User.generatePasswordUtf8();
        password.value((buffer: Buffer): void => {
          const passwordAsArrayOfCharacters = buffer.toString('utf8').split('');
          expect(passwordAsArrayOfCharacters.length).to.be.equal(13);
          expect(
            passwordAsArrayOfCharacters.some((char) =>
              ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(char)
            )
          );
          expect(passwordAsArrayOfCharacters.some((char) => char.toUpperCase() !== char.toLowerCase()));
          expect(passwordAsArrayOfCharacters.some((char) => char.toLowerCase() !== char.toLowerCase()));
        });
      }
    });

    it('Should generate length 12 and complexity 5 password containing at least one number and one  lowercase letter ', () => {
      const passwordCondition = { length: 12, complexity: 5 };
      const password: SecureBuffer<void> = User.generatePasswordUtf8(passwordCondition);
      password.value((buffer: Buffer): void => {
        const passwordAsArrayOfCharacters = buffer.toString('utf8');
        const complexity5Regex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$|%^&*()[]_-])(?=.{12})');

        expect(complexity5Regex.test(passwordAsArrayOfCharacters));
      });
    });
    it('Should generate length 14 and complexity 3 password containing at least one number and one  lowercase letter ', () => {
      const passwordCondition = { length: 14, complexity: 3 };
      const password: SecureBuffer<void> = User.generatePasswordUtf8(passwordCondition);
      password.value((buffer: Buffer): void => {
        const passwordAsArrayOfCharacters = buffer.toString('utf8');
        const complexity3Regex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{14})');

        expect(complexity3Regex.test(passwordAsArrayOfCharacters));
      });
    });

    it('Should throw an error because of complexity not a valid value', () => {
      try {
        const passwordCondition = { length: 14, complexity: 9 };
        shouldThrowSync(() => User.generatePasswordUtf8(passwordCondition));
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(err.message).to.equal('Invalid complexity value. Specify a value between 0 and 5, inclusive.');
      }
    });

    it('Should throw an error because of length not a valid value', () => {
      try {
        const passwordCondition = { length: 7, complexity: 2 };
        shouldThrowSync(() => User.generatePasswordUtf8(passwordCondition));
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(err.message).to.equal('Invalid length value. Specify a value between 8 and 1000, inclusive.');
      }
    });
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      stubMethod($$.SANDBOX, User.prototype, 'rawRequest').resolves({
        statusCode: 201,
        body: '{"id": "123456"}',
        headers: {
          'auto-approve-user': '789101',
        },
      });

      const org = await Org.create({
        connection: await Connection.create({
          authInfo: await AuthInfo.create({ username: adminTestData.username }),
        }),
      });
      const user = await User.create({ org });

      const options: DefaultUserFields.Options = {
        templateUser: org.getUsername() || '',
      };
      const fields = (await DefaultUserFields.create(options)).getFields();
      const info = await user.createUser(fields);

      expect(info.getUsername()).to.equal(fields.username);
    });
  });

  describe('assignPassword', () => {
    let org: Org;
    let userId: string;
    let password: string;
    beforeEach(async () => {
      stubMethod($$.SANDBOX, Connection, 'create').callsFake(() => ({
        getAuthInfoFields() {
          return { orgId: '00DXXX' };
        },
        getUsername() {
          return user1.username;
        },
        soap: {
          setPassword(_userId: string, _password: string) {
            userId = _userId;
            password = _password;
          },
        },
        query(query: string) {
          if (query.includes(user1.username)) {
            return {
              records: [user1.getMockUserInfo()],
              totalSize: 1,
            };
          }
        },
      }));

      const connection = await Connection.create({
        authInfo: await AuthInfo.create({ username: user1.username }),
      });
      org = await Org.create({ connection });
    });

    it('should set password', async () => {
      const user = await User.create({ org });
      const fields = await user.retrieve(user1.username);

      const TEST_PASSWORD = 'test123456';

      const buffer = new SecureBuffer<void>();
      buffer.consume(Buffer.from(TEST_PASSWORD));

      const userAuthInfo = await AuthInfo.create({ username: fields.username });
      await user.assignPassword(userAuthInfo, buffer);

      expect(userId).to.equal(user1.userId);
      expect(password).to.equal(TEST_PASSWORD);
    });
  });

  describe('assignPermissionSets', () => {
    let org: Org;

    beforeEach(async () => {
      stubMethod($$.SANDBOX, User.prototype, 'rawRequest').resolves({
        statusCode: 201,
        body: '{"id": "56789"}',
        headers: {
          'auto-approve-user': '123456',
        },
      });

      org = await Org.create({
        connection: await Connection.create({
          authInfo: await AuthInfo.create({ username: adminTestData.username }),
        }),
      });
    });

    it('Should assign the permission set', async () => {
      const permSetAssignSpy = stubMethod($$.SANDBOX, PermissionSetAssignment.prototype, 'create').returns(
        Promise.resolve({})
      );

      const user = await User.create({ org });
      const fields = await user.retrieve(user1.username);

      await user.assignPermissionSets(fields.id, ['TestPermSet']);
      expect(permSetAssignSpy.calledOnce).to.equal(true);
    });
  });
  describe('retrieve', () => {
    it('should retrieve a user', async () => {
      await $$.stubUsers({ [adminTestData.username]: [adminTestData, user1] });

      const org = await Org.create({ aliasOrUsername: adminTestData.username });
      const admin = await User.create({ org });
      const user = await admin.retrieve(user1.username);
      expect(user.username).to.equal(user1.username);
    });
  });
});
