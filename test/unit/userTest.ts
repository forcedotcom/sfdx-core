/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { DefaultUserFields, User, UserFields } from '../../src/user';
import { shouldThrow, testSetup, MockTestOrgData } from '../../src/testSetup';
import { expect } from 'chai';
import { Org } from '../../src/org';
import { AnyJson } from '@salesforce/ts-types';
import { AuthInfo } from '../../src/authInfo';
import { Connection } from '../../src/connection';
import { RequestInfo } from 'jsforce';
import { SecureBuffer } from '../../src/secureBuffer';
import { PermissionSetAssignment } from '../../src/permissionSetAssignment';

const $$ = testSetup();

describe('User Tests', () => {
    let adminTestdata: MockTestOrgData;
    let user1: MockTestOrgData;

    let refreshSpy;
    beforeEach( async () => {
        adminTestdata = new MockTestOrgData();
        user1 = new MockTestOrgData();

        $$.fakeConnectionRequest = (): Promise<AnyJson> => {
            return Promise.resolve({});
        };

        $$.SANDBOX.stub(Connection.prototype, 'query').callsFake((query: string) => {
            if (query.includes(adminTestdata.username)) {
                return {
                    records: [ adminTestdata.getMockUserInfo() ],
                    totalSize: 1
                };
            }

            if (query.includes(user1.username)) {
                return {
                    records: [ user1.getMockUserInfo() ],
                    totalSize: 1
                };
            }

            if (query.includes('Standard User')) {
                return { records: [ { Id: '123456' } ] };
            }

            return {};
        });

        $$.SANDBOX.stub(AuthInfo.prototype, 'buildRefreshTokenConfig').callsFake(() => {
            return {};
        });

        $$.SANDBOX.stub(Connection.prototype, 'describe').callsFake(async () => {
            return Promise.resolve({fields: {}});
        });

        refreshSpy = $$.SANDBOX.stub(Org.prototype, 'refreshAuth').callsFake(() => {
            return Promise.resolve({});
        });

    });

    describe('init tests', () => {
        it ('no org', async () => {
            try {
                await shouldThrow(User.init(null));
            } catch (e) {
                expect(e).to.have.property('name', 'orgRequired');
            }
        });

        it ('refresh auth called', async () => {
            $$.SANDBOX.stub(Connection.prototype, 'requestRaw').callsFake(async () => {
                return Promise.resolve({
                    statusCode: 201,
                    body: `{"id": "${user1.getMockUserInfo()['Id']}"}`,
                    headers: {
                        'auto-approve-user': user1.refreshToken
                    }
                });
            });
            expect(refreshSpy.calledOnce).to.equal(false);
            const org = await Org.create(await Connection.create(await AuthInfo.create(adminTestdata.username)));
            await User.init(org);
            expect(refreshSpy.calledOnce).to.equal(true);
        });

        it ('refresh auth called error code 400', async () => {
            $$.SANDBOX.stub(Connection.prototype, 'requestRaw').callsFake(async () => {
                return Promise.resolve({ body: `{
                    "statusCode": "400"
                }`});
            });

            const org = await Org.create(await Connection.create(await AuthInfo.create(adminTestdata.username)));
            const user = await User.init(org);

            try {
                const fields: UserFields = await DefaultUserFields.init(adminTestdata.username, user1.username);
                await shouldThrow(user.create(fields));
            } catch ( e ) {
                expect(e).to.have.property('name', 'UserCreateHttpError');
            }
        });
    });

    describe('generatePasswordUtf8', () => {
        it ('Should generate a password', () => {
            const password: SecureBuffer<void> = User.generatePasswordUtf8();
            password.value((buffer: Buffer): void => {
                const _password: string = buffer.toString('utf8');
                expect(_password.length).to.be.equal(6);
            });
        });
    });

    describe('createUser', () => {
        it ('no fields provided', async () => {
            $$.SANDBOX.stub(Connection.prototype, 'requestRaw').callsFake(async (info: RequestInfo) => {
                return Promise.resolve({
                    statusCode: 201,
                    body: `{"id": "${user1.getMockUserInfo()['Id']}"}`,
                    headers: {
                        'auto-approve-user': user1.refreshToken
                    }
                });
            });

            const org = await Org.create(await Connection.create(await AuthInfo.create(adminTestdata.username)));
            const user: User = await User.init(org);
            try {
                await shouldThrow(user.create(null));
            } catch (e) {
                expect(e).to.have.property('name', 'missingFields');
            }
        });

        it ('should create a user', async () => {
            $$.SANDBOX.stub(Connection.prototype, 'requestRaw').callsFake(async () => {
                return Promise.resolve({
                    statusCode: 201,
                    body: '{"id": "123456"}',
                    headers: {
                        'auto-approve-user': '789101'
                    }
                });
            });

            const org = await Org.create(await Connection.create(await AuthInfo.create(adminTestdata.username)));
            const user: User = await User.init(org);
            const fields: UserFields = await DefaultUserFields.init(org.getUsername());
            const info: AuthInfo = await user.create(fields);

            expect(info.getUsername()).to.equal(fields.username);
        });
    });

    describe('assignPassword', () => {
        let org: Org;
        let userId;
        let password;
        beforeEach(async () => {
            $$.SANDBOX.stub(Connection, 'create').callsFake(() => {
                return {
                    getUsername() {
                        return user1.username;
                    },
                    soap: {
                        setPassword(_userId: string, _password: string) {
                            userId = _userId;
                            password = _password;
                        }
                    },
                    query(query: string) {
                        if (query.includes(user1.username)) {
                            return {
                                records: [ user1.getMockUserInfo() ],
                                totalSize: 1
                            };
                        }
                    }
                };
            });
            $$.configStubs.AuthInfoConfig = { contents: await user1.getConfig() };
            const connection: Connection = await Connection.create(await AuthInfo.create(user1.username));
            org = await Org.create(connection);

        });

        it ('should set password', async () => {
            const user: User = await User.init(org);
            const fields: UserFields = await user.retrieve(user1.username);

            const TEST_PASSWORD: string = 'test123456';

            const buffer: SecureBuffer<void> = new SecureBuffer<void>();
            buffer.consume(Buffer.from(TEST_PASSWORD));

            const userAuthInfo = await AuthInfo.create(fields.username);
            await user.assignPassword(userAuthInfo, buffer);

            expect(userId).to.equal(user1.userId);
            expect(password).to.equal(TEST_PASSWORD);
        });
    });

    describe('assignPermissionSets', () => {

        let org: Org;

        beforeEach(async () => {
            $$.SANDBOX.stub(Connection.prototype, 'requestRaw').callsFake(async () => {
                return Promise.resolve({
                    statusCode: 201,
                    body: '{"id": "56789"}',
                    headers: {
                        'auto-approve-user': '123456'
                    }
                });
            });

            org = await Org.create(await Connection.create(await AuthInfo.create(adminTestdata.username)));

        });

        it ('missing fields', async () => {
            const user: User = await User.init(org);
            try {
                await shouldThrow(user.assignPermissionSets(null, ['foo']));
            } catch (e) {
                expect(e).to.have.property('name', 'missingId');
            }
        });

        it ('missing permsetNames', async () => {
            const user: User = await User.init(org);
            const info: AuthInfo = await user.create(await DefaultUserFields.init(adminTestdata.username));
            const savedFields: UserFields = await user.retrieve(info.getUsername());
            try {
                await shouldThrow(user.assignPermissionSets(savedFields.id, null));
            } catch (e) {
                expect(e).to.have.property('name', 'permsetNamesAreRequired');
            }
        });

        it ('Should assign the permission set', async () => {
            const permSetAssignSpy =
                $$.SANDBOX.stub(PermissionSetAssignment.prototype, 'create').returns(Promise.resolve({}));

            const user: User = await User.init(org);
            const fields: UserFields = await user.retrieve(user1.username);

            await user.assignPermissionSets(fields.id, ['TestPermSet']);
            expect(permSetAssignSpy.calledOnce).to.equal(true);
        });
    });
});
