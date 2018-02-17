/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import * as sinon from 'sinon';
import { assert, expect } from 'chai';

import { SfdxUtil } from '../../lib/util';
import Messages from '../../lib/messages';
import { testSetup } from '../testSetup';

// Setup the test environment.
const $$ = testSetup();

describe('Util', () => {
    describe('readJSON', () => {
        let readFileStub;

        beforeEach(() => {
            readFileStub = $$.SANDBOX.stub(SfdxUtil, 'readFile');
        });

        it('should throw a ParseError for empty JSON file', async () => {
            readFileStub.returns(Promise.resolve(''));

            try {
                await SfdxUtil.readJSON('emptyfile');
                assert.fail('readJSON should have thrown a ParseError');
            } catch (error) {
                expect(error.message).to.contain('Parse error in file emptyfile on line 1\nFILE HAS NO CONTENT');
            }
        });

        it('should throw a ParseError for invalid multiline JSON file', () => {
            readFileStub.returns(Promise.resolve(`{
                "key": 12345,
                "value": true,
            }`));
            return SfdxUtil.readJSON('invalidJSON')
                .then(() => assert.fail('readJSON should have thrown a ParseError'))
                .catch((rv) => expect(rv.message).to.contain('Parse error in file invalidJSON on line 4'));
        });

        it('should throw a ParseError for invalid multiline JSON file 2', () => {
            readFileStub.returns(Promise.resolve('{\n"a":}'));
            return SfdxUtil.readJSON('invalidJSON2')
                .then(() => assert.fail('readJSON should have thrown a ParseError'))
                .catch((rv) => expect(rv.message).to.contain('Parse error in file invalidJSON2 on line 2'));
        });

        it('should throw a ParseError for invalid single line JSON file', () => {
            readFileStub.returns(Promise.resolve('{ "key": 12345, "value": [1,2,3], }'));
            return SfdxUtil.readJSON('invalidJSON_no_newline')
                .then(() => assert.fail('readJSON should have thrown a ParseError'))
                .catch((rv) => expect(rv.message).to.contain('Parse error in file invalidJSON_no_newline on line 1'));
        });

        it('should return a JSON object', () => {
            const validJSON = { key: 12345, value: true };
            const validJSONStr = JSON.stringify(validJSON);
            readFileStub.returns(Promise.resolve(validJSONStr));
            return SfdxUtil.readJSON('validJSONStr')
                .then((rv) => expect(rv).to.eql(validJSON));
        });
    });

    describe('writeJSON', () => {
        it('should call writeFile with correct args', async () => {
            $$.SANDBOX.stub(SfdxUtil, 'writeFile').returns(Promise.resolve(null));
            const testFilePath = 'utilTest_testFilePath';
            const testJSON = { username: 'utilTest_username'};
            const stringifiedTestJSON = JSON.stringify(testJSON, null, 4);
            await SfdxUtil.writeJSON(testFilePath, testJSON);
            expect(SfdxUtil.writeFile['called']).to.be.true;
            expect(SfdxUtil.writeFile['firstCall'].args[0]).to.equal(testFilePath);
            expect(SfdxUtil.writeFile['firstCall'].args[1]).to.deep.equal(stringifiedTestJSON);
            expect(SfdxUtil.writeFile['firstCall'].args[2]).to.deep.equal({ encoding: 'utf8', mode: '600' });
        });
    });

    describe('isSalesforceDomain', () => {
        it('is whitelist domain', () => {
            expect(SfdxUtil.isSalesforceDomain('http://www.salesforce.com')).to.be.true;
        });

        it('is not whiteList or host', () => {
            expect(SfdxUtil.isSalesforceDomain('http://www.ghostbusters.com')).to.be.false;
        });

        it('is whiteList host', () => {
            expect(SfdxUtil.isSalesforceDomain('http://developer.salesforce.com')).to.be.true;
        });

        it('falsy', () => {
            expect(SfdxUtil.isSalesforceDomain(undefined)).to.be.false;
        });
    });

    describe('remove', () => {
        it('with the path', () => {

        });

        it('without the path', () => {

        });

        it ('no access to path', () => {

        });

        it ('empty dir', () => {

        });

        it ('directory with one file', () => {

        });

        it ('multi nesting', () => {

        });
    });
});
