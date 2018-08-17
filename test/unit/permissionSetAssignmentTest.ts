import * as _ from 'lodash';
import { PermissionSetAssignment } from '../../src/permissionSetAssignment';
import { MockTestOrgData, shouldThrow, testSetup } from '../../src/testSetup';
import { expect } from 'chai';
import { Connection } from '../../src/connection';
import { Org } from '../../src/org';
import { AuthInfo } from '../../src/authInfo';

const $$ = testSetup();

describe('permission set assignment tests', () => {
    let userTestdata: MockTestOrgData;

    beforeEach(() => {
        userTestdata = new MockTestOrgData();
    });

    describe('init tests', () => {
        it ('no org', async () => {
            try {
                await shouldThrow(PermissionSetAssignment.init(null));
            } catch (e) {
                expect(e).to.have.property('name', 'orgRequired');
            }
        });
    });

    describe('create tests', () => {

        let org: Org;
        beforeEach(async () => {
            org = await Org.create(await Connection.create(await AuthInfo.create(userTestdata.username)));
        });

        it ('no id', async () => {
            const assignment: PermissionSetAssignment = await PermissionSetAssignment.init(org);
            try {
                await shouldThrow(assignment.create(null, null));
            } catch (e) {
                expect(e).to.have.property('name', 'userIdRequired');
            }
        });

        it ('no perm set', async () => {
            const assignment: PermissionSetAssignment = await PermissionSetAssignment.init(org);
            try {
                await shouldThrow(assignment.create('123456', null));
            } catch (e) {
                expect(e).to.have.property('name', 'permSetRequired');
            }
        });

        it ('should create a perm set assignment.', async () => {
            let query: string = '';
            $$.SANDBOX.stub(Connection.prototype, 'query').callsFake((_query: string) => {
                query = _.toLower(_query);
                if (query.includes('from permissionset')) {
                    return {
                        records: [ { Id: '123456' } ],
                        totalSize: 1
                    };
                }

                return {};
            });

            $$.SANDBOX.stub(Connection.prototype, 'sobject').callsFake(() => {
                return {
                    create() {
                        return Promise.resolve({ success: true });
                    }
                };
            });

            const assignment: PermissionSetAssignment = await PermissionSetAssignment.init(org);
            const PERM_SET_NAME = 'Foo';
            const NS = 'NS';
            await assignment.create('123456', `${NS}__${PERM_SET_NAME}`);

            expect(query).to.include('namespaceprefix');
            expect(query).to.include(_.toLower(NS));
            expect(query).to.include('name');
            expect(query).to.include(_.toLower(PERM_SET_NAME));
        });

        it ('Failed to find permsets with namespace', async () => {
            let query: string = '';
            $$.SANDBOX.stub(Connection.prototype, 'query').callsFake((_query: string) => {
                query = _.toLower(_query);
                if (query.includes('from permissionset')) {
                    return {
                        records: [],
                        totalSize: 0
                    };
                }

                return {};
            });

            $$.SANDBOX.stub(Connection.prototype, 'sobject').callsFake(() => {
                return {
                    create() {
                        return Promise.resolve({ success: true });
                    }
                };
            });

            const assignment: PermissionSetAssignment = await PermissionSetAssignment.init(org);
            const PERM_SET_NAME = 'Foo';
            const NS = 'NS';
            try {
                await shouldThrow(assignment.create('123456', `${NS}__${PERM_SET_NAME}`));
            } catch (e) {
                expect(e).to.have.property('name', 'assignCommandPermissionSetNotFoundForNSError');
            }
        });

        it ('Failed to find permsets without namespace', async () => {
            let query: string = '';
            $$.SANDBOX.stub(Connection.prototype, 'query').callsFake((_query: string) => {
                query = _.toLower(_query);
                if (query.includes('from permissionset')) {
                    return {
                        records: [],
                        totalSize: 0
                    };
                }

                return {};
            });

            $$.SANDBOX.stub(Connection.prototype, 'sobject').callsFake(() => {
                return {
                    create() {
                        return Promise.resolve({ success: true });
                    }
                };
            });

            const assignment: PermissionSetAssignment = await PermissionSetAssignment.init(org);
            const PERM_SET_NAME = 'Foo';
            try {
                await shouldThrow(assignment.create('123456', `${PERM_SET_NAME}`));
            } catch (e) {
                expect(e).to.have.property('name', 'assignCommandPermissionSetNotFoundError');
            }
        });

        it ('permset assignment with errors', async () => {
            let query: string = '';
            $$.SANDBOX.stub(Connection.prototype, 'query').callsFake((_query: string) => {
                query = _.toLower(_query);
                if (query.includes('from permissionset')) {
                    return {
                        records: [ { Id: '123456' } ],
                        totalSize: 1
                    };
                }

                return {};
            });

            $$.SANDBOX.stub(Connection.prototype, 'sobject').callsFake(() => {
                return {
                    create() {
                        return Promise.resolve({ errors: ['error one', 'error two']});
                    }
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

        it ('permset assignment with empty errors', async () => {
            let query: string = '';
            $$.SANDBOX.stub(Connection.prototype, 'query').callsFake((_query: string) => {
                query = _.toLower(_query);
                if (query.includes('from permissionset')) {
                    return {
                        records: [ { Id: '123456' } ],
                        totalSize: 1
                    };
                }

                return {};
            });

            $$.SANDBOX.stub(Connection.prototype, 'sobject').callsFake(() => {
                return {
                    create() {
                        return Promise.resolve({ errors: []});
                    }
                };
            });

            const assignment: PermissionSetAssignment = await PermissionSetAssignment.init(org);
            const PERM_SET_NAME = 'Foo';
            const NS = 'NS';
            try {
                await shouldThrow(assignment.create('123456', `${NS}__${PERM_SET_NAME}`));
            } catch (e) {
                expect(e).to.have.property('name', 'notSuccessfulButNoErrorsReported');
            }
        });
    });
});
