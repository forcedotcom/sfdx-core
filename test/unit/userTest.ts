/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { stubMethod } from '@salesforce/ts-sinon';
import { AnyJson } from '@salesforce/ts-types';
import { expect } from 'chai';
import { AuthInfo } from '../../src/authInfo';
import { Connection } from '../../src/connection';
import { Org } from '../../src/org';
import { PermissionSetAssignment } from '../../src/permissionSetAssignment';
import { SecureBuffer } from '../../src/secureBuffer';
import { MockTestOrgData, shouldThrow, testSetup } from '../../src/testSetup';
import { DefaultUserFields, User, UserFields } from '../../src/user';

const $$ = testSetup();

describe('User Tests', () => {
  let adminTestData: MockTestOrgData;
  let user1: MockTestOrgData;

  let refreshSpy: sinon.SinonSpy;
  beforeEach(async () => {
    adminTestData = new MockTestOrgData();
    user1 = new MockTestOrgData();

    $$.fakeConnectionRequest = (): Promise<AnyJson> => {
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

    stubMethod($$.SANDBOX, AuthInfo.prototype, 'buildRefreshTokenConfig').callsFake(() => {
      return {};
    });

    stubMethod($$.SANDBOX, Connection.prototype, 'describe').resolves({ fields: {} });

    refreshSpy = stubMethod($$.SANDBOX, Org.prototype, 'refreshAuth').resolves({});
  });

  describe('init tests', () => {
    it('refresh auth called', async () => {
      stubMethod($$.SANDBOX, Connection.prototype, 'requestRaw').resolves({
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
      stubMethod($$.SANDBOX, Connection.prototype, 'requestRaw').resolves({
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
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      stubMethod($$.SANDBOX, Connection.prototype, 'requestRaw').resolves({
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
      const user: User = await User.create({ org });

      const options: DefaultUserFields.Options = {
        templateUser: org.getUsername() || '',
      };
      const fields = (await DefaultUserFields.create(options)).getFields();
      const info: AuthInfo = await user.createUser(fields);

      expect(info.getUsername()).to.equal(fields.username);
    });
  });

  describe('assignPassword', () => {
    let org: Org;
    let userId: string;
    let password: string;
    beforeEach(async () => {
      stubMethod($$.SANDBOX, Connection, 'create').callsFake(() => {
        return {
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
        };
      });
      $$.configStubs.AuthInfoConfig = { contents: await user1.getConfig() };
      const connection: Connection = await Connection.create({
        authInfo: await AuthInfo.create({ username: user1.username }),
      });
      org = await Org.create({ connection });
    });

    it('should set password', async () => {
      const user: User = await User.create({ org });
      const fields: UserFields = await user.retrieve(user1.username);

      const TEST_PASSWORD = 'test123456';

      const buffer: SecureBuffer<void> = new SecureBuffer<void>();
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
      stubMethod($$.SANDBOX, Connection.prototype, 'requestRaw').resolves({
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

      const user: User = await User.create({ org });
      const fields: UserFields = await user.retrieve(user1.username);

      await user.assignPermissionSets(fields.id, ['TestPermSet']);
      expect(permSetAssignSpy.calledOnce).to.equal(true);
    });
  });
});
