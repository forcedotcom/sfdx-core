/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';
// Node
const path = require('path');

// Thirdparty
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');

// Local
const projectRoot = path.join(__dirname, '..', '..');
const TestWorkspace = require(path.join(projectRoot, 'test', 'TestWorkspace'));
const Force = require(path.join(projectRoot, 'lib', 'force'));
const Org = require(path.join(projectRoot, 'lib', 'orgs', 'org'));

const TEST_LOGIN_URL = 'www.example.com';
const TEST_CLIENT_ID = '123456';
const TEST_USERNAME = 'bob@example.com';
const TEST_ACCESS_TOKEN = '456789';
const TEST_ORG_ID = '00xx0000';
const TEST_REFRESH_TOKEN = 'abcde';
const TEST_INSTANCE_URL = 'www.instance.com';
const TEST_PRIVATE_KEY = '../../private.key';
const WORKSPACE_TYPE = 'workspace';
const TEST_CLIENT_SECRET = 'efghijk';
const TEST_REDIRECT_URI = 'http://localhost:1234';
const TEST_AUTH_CODE = 'a0u0t0h';

chai.use(chaiAsPromised);

const stubForce = () => {
    sinon.stub(Force, 'jwtAuthorize', () => Promise.resolve({
        accessToken: TEST_ACCESS_TOKEN,
        instanceUrl: TEST_INSTANCE_URL,
        orgId: TEST_ORG_ID,
        username: TEST_USERNAME
    }));

    sinon.stub(Force, 'authorize', () => Promise.resolve({
        accessToken: TEST_ACCESS_TOKEN,
        refreshToken: TEST_REFRESH_TOKEN,
        instanceUrl: TEST_INSTANCE_URL,
        orgId: TEST_ORG_ID,
        username: TEST_USERNAME
    }));
};

/**
 * Test cases for force.js
 */
describe('force', () => {

    let testWorkspace;
    let force;
    let scratchOrg;

    before(() => {
        stubForce(force);
        testWorkspace = new TestWorkspace();
        return testWorkspace.setup();
    });

    beforeEach(() => {
        scratchOrg = new Org(TEST_USERNAME);
        force = scratchOrg.force;
    });

    afterEach(() => {
        Force.jwtAuthorize.reset();
        Force.authorize.reset();
    });

    after(() => {
        Force.jwtAuthorize.restore();
        Force.authorize.restore();
        testWorkspace.clean();
    });

    describe('authorizeAndSave', () => {

        describe('JWT flow', () => {
            it('Should return the expected attributes', () => {

                const oauthConfig = {
                    clientId: TEST_CLIENT_ID,
                    loginUrl: TEST_LOGIN_URL,
                    username: TEST_USERNAME,
                    privateKeyFile: TEST_PRIVATE_KEY
                };

                return force.authorizeAndSave(oauthConfig, WORKSPACE_TYPE)
                    .then(() => scratchOrg.readConfig())// Need to call get config to decrypt secret stuff.
                    .then((result) => {
                        chai.expect(result).to.have.property('orgId').and.equal(TEST_ORG_ID);
                        chai.expect(result).to.have.property('accessToken').and.equal(TEST_ACCESS_TOKEN);
                        chai.expect(result).to.have.property('instanceUrl').and.equal(TEST_INSTANCE_URL);
                        chai.expect(result).to.have.property('username').and.equal(TEST_USERNAME);
                        chai.expect(result).to.have.property('clientId').and.equal(TEST_CLIENT_ID);
                        chai.expect(result).to.have.property('privateKey').and.equal(TEST_PRIVATE_KEY);
                        chai.expect(result).to.have.property('type').and.equal(WORKSPACE_TYPE);
                        chai.expect(Force.jwtAuthorize.calledOnce).to.equal(true);
                        chai.expect(Force.authorize.called).to.equal(false);
                    }
                );
            });
        });

        describe('web server oauth flow', () => {
            it('Should return the expected attributes', () => {

                const oauthConfig = {
                    clientId: TEST_CLIENT_ID,
                    loginUrl: TEST_LOGIN_URL,
                    clientSecret: TEST_CLIENT_SECRET,
                    redirectUri: TEST_REDIRECT_URI,
                    authCode: TEST_AUTH_CODE
                };

                return force.authorizeAndSave(oauthConfig, WORKSPACE_TYPE)
                    .then(() => scratchOrg.readConfig()) // Need to call get config to decrypt secret stuff.
                    .then((result) => {
                        chai.expect(result).to.have.property('orgId').and.equal(TEST_ORG_ID);
                        chai.expect(result).to.have.property('accessToken').and.equal(TEST_ACCESS_TOKEN);
                        chai.expect(result).to.have.property('refreshToken').and.equal(TEST_REFRESH_TOKEN);
                        chai.expect(result).to.have.property('instanceUrl').and.equal(TEST_INSTANCE_URL);
                        chai.expect(result).to.have.property('username').and.equal(TEST_USERNAME);
                        chai.expect(result).to.have.property('clientId').and.equal(TEST_CLIENT_ID);
                        chai.expect(result).to.have.property('clientSecret').and.equal(TEST_CLIENT_SECRET);
                        chai.expect(result).to.have.property('type').and.equal(WORKSPACE_TYPE);
                        chai.expect(Force.authorize.calledOnce).to.equal(true);
                        chai.expect(Force.jwtAuthorize.called).to.equal(false);
                    }
                );
            });
        });
    });

    describe('assignPermissionSet', () => {

        let records;

        const ASSIGNEE_ID = 'baz';
        let assignIdResult;
        let permSetIdResult;

        beforeEach(() => {
            sinon.stub(force, 'resolveConnection', () => Promise.resolve({

                _baseUrl() { return 'http://www.example.com'; },

                requestGet() {
                    return {
                        identity: `${ASSIGNEE_ID}/baz`
                    };
                },

                query() {
                    return records;
                },

                sobject() {
                    return {
                        describe() {
                            return Promise.resolve();
                        },
                        create(sobjectData) {

                            assignIdResult = sobjectData.AssigneeId;
                            permSetIdResult = sobjectData.PermissionSetId;

                            const error = new Error();
                            error.errorCode = 'DUPLICATE_VALUE';
                            return Promise.reject(error);
                        }
                    };
                }

            }));
        });

        afterEach(() => {
            force.resolveConnection.restore();
        });

        it('no records for permset', () => {
            records = { records: [] };

            chai.expect(force.assignPermissionSet({}, '')).to.eventually.be.rejected
                .and.have.property('name', 'assignCommandPermissionSetNotFoundError');
        });

        it('resolve for duplicate value', () => {
            records = {
                records: [{ Id: 5 }]
            };

            chai.expect(force.assignPermissionSet({}, '')).to.eventually.be.resolved;
        });

        it('Check the results of the reg ex', () => {
            const expectedPermSetId = 5;
            records = {
                records: [{ Id: expectedPermSetId }]
            };

            return force.assignPermissionSet({}, '').then(() => {
                chai.expect(assignIdResult).to.equal(ASSIGNEE_ID);
                chai.expect(permSetIdResult).to.equal(expectedPermSetId);
            });
        });
    });
});
