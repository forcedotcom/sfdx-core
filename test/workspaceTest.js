/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

const path = require('path');
const fs = require('fs');

// Thirdparty
const Promise = require('bluebird');
const sinon = require('sinon');
const { assert, expect } = require('chai');

// Local Module
const workspace = require(path.join(__dirname, '..', 'lib', 'workspace'));

describe('srcDevUtil', () => {

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
