// Node
const path = require('path');
const fs = require('fs');

// Thirdparty
const Promise = require('bluebird');
const sinon = require('sinon');
const { assert, expect } = require('chai');

// Package
const TestWorkspace = require(path.join(__dirname, '..', 'TestWorkspace'));
const workspace = require(path.join(__dirname, '..', '..', 'lib', 'workspace'));

let testWorkspace;

describe('workspace utils', () => {

    const sandbox = sinon.sandbox.create();

    beforeEach(() => {
    });

    afterEach(() => {

    });

    describe('readJSON', () => {
        /* eslint-disable quotes */
        const invalidJSON = `{
            "key": 12345,
            "value": true,
        }`;
        const invalidJSON_no_newline = `{ "key": 12345, "value": [1,2,3], }`;
        const validJSON = { "key": 12345, "value": true };
        /* eslint-enable quotes */

        let readFileStub;

        beforeEach(() => {
            readFileStub = sandbox.stub(fs, 'readFileAsync');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should throw a ParseError for empty JSON file', () => {
            readFileStub.returns(Promise.resolve(''));
            return workspace.readJSON('emptyfile')
                .then(() => assert.fail('readJSON should have thrown a ParseError'))
                .catch((rv) => expect(rv.message).to.contain('Parse error in file emptyfile on line 1\nFILE HAS NO CONTENT'));
        });

        it('should throw a ParseError for invalid multiline JSON file', () => {
            readFileStub.returns(Promise.resolve(invalidJSON));
            return workspace.readJSON('invalidJSON')
                .then(() => assert.fail('readJSON should have thrown a ParseError'))
                .catch((rv) => expect(rv.message).to.contain('Parse error in file invalidJSON on line 4'));
        });

        it('should throw a ParseError for invalid multiline JSON file 2', () => {
            readFileStub.returns(Promise.resolve('{\n"a":}'));
            return workspace.readJSON('invalidJSON2')
                .then(() => assert.fail('readJSON should have thrown a ParseError'))
                .catch((rv) => expect(rv.message).to.contain('Parse error in file invalidJSON2 on line 2'));
        });

        it('should throw a ParseError for invalid single line JSON file', () => {
            readFileStub.returns(Promise.resolve(invalidJSON_no_newline));
            return workspace.readJSON('invalidJSON_no_newline')
                .then(() => assert.fail('readJSON should have thrown a ParseError'))
                .catch((rv) => expect(rv.message).to.contain('Parse error in file invalidJSON_no_newline on line 1'));
        });

        it('should return a JSON object', () => {
            const validJSONStr = JSON.stringify(validJSON);
            readFileStub.returns(Promise.resolve(validJSONStr));
            return workspace.readJSON('validJSONStr')
                .then((rv) => expect(rv).to.eql(validJSON));
        });
    });
});

/**
 * Test cases for the Config API.
 */
describe('config', () => {
    describe('getConfig', () => {
        before(() => {
            testWorkspace = new TestWorkspace();
            return testWorkspace.setup();
        });
        after(() => {
            testWorkspace.clean();
        });
        it('Should get a config object.', () => {
                const appConfig = workspace.getConfig();

                expect(appConfig).to.have.property('SfdcLoginUrl');
                expect(appConfig).to.have.property('ApiVersion');
            }
        );
    });

    describe('getConfigContent', () => {
        beforeEach(() => {
            testWorkspace = new TestWorkspace();
        });
        afterEach(() => {
            testWorkspace.clean();
        });

        it('Should fetch content from both workspace-config.json files', () => {
            const exampleEmail = 'email@example.com';
            const exampleLastName = 'ExampleLastName';
            const workspaceConfig = { Email: exampleEmail };
            const appcloudWorkspaceConfig = { LastName: 'ExampleLastName' };

            return testWorkspace.createWorkspaceGlobalConfig(appcloudWorkspaceConfig)
                .then(() => testWorkspace.setup(workspaceConfig))
                .then(() => {
                    const configContents = workspace.getConfig();

                    expect(configContents).to.have.property('Email').and.equal(exampleEmail);
                    expect(configContents).to.have.property('LastName').and.equal(exampleLastName);
                });
        });

        it('The workspace workspace-config should override the global workspace-config', () => {
            const email = 'email@example.com';
            const overridenEmail = 'overriden@example.com';
            const workspaceConfig = { Email: email };
            const appcloudWorkspaceConfig = { Email: overridenEmail };

            return testWorkspace.createWorkspaceGlobalConfig(appcloudWorkspaceConfig)
                .then(() => testWorkspace.setup(workspaceConfig))
                .then(() => {
                    const configContents = workspace.getConfig();
                    expect(configContents).to.have.property('Email').and.equal(email);
                });
        });

        it('Not having an ~/.appcloud/workspace-config.json does not throw an error', () => {
            const email = 'email@example.com';
            const workspaceConfig = { Email: email };
            return testWorkspace.setup(workspaceConfig)
            .then(() => workspace.resolveConfigContent())
            .then(configContents => {
                expect(configContents).to.have.property('Email').and.equal(email);
            });
        });
    });

    describe('oauthLocalPortTests', () => {
        let port;
        before(() => {
            sinon.stub(workspace, 'getConfig', () => ({
                    'OauthLocalPort': `${port}`
                })
            );
        });
        after(() => {
            workspace.getConfig.restore();
        });

        it('Port should be 3333', () => {
            port = 3333;
            expect(workspace.getOauthLocalPort()).to.equal(port);
        });

        it('Should throw an exception for negative port', () => {
            port = -1;
            expect(workspace.getOauthLocalPort).to.throw(Error, 'Invalid OAuth');
        });

        it('Should throw an exception for long port', () => {
            port = 800000;
            expect(workspace.getOauthLocalPort).to.throw(Error, 'Invalid OAuth');
        });

        it('Should throw an exception for undefined port', () => {
            port = undefined;
            expect(workspace.getOauthLocalPort).to.throw(Error, 'Invalid OAuth');
        });

        it('Should throw an exception for null invalid port', () => {
            port = null;
            expect(workspace.getOauthLocalPort).to.throw(Error, 'Invalid OAuth');
        });
    });
});
