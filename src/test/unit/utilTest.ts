/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import { assert, expect } from 'chai';

import sfdxUtil from '../../lib/util';
import Messages from '../../lib/messages';

Messages.importMessageFile(path.join(__dirname, '..', '..', '..', 'messages', 'sfdx-core.json'));

describe('Util', () => {
    const sandbox = sinon.sandbox.create();

    describe('readJSON', () => {
        let readFileStub;

        beforeEach(() => {
            readFileStub = sandbox.stub(sfdxUtil, 'readFile');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should throw a ParseError for empty JSON file', async () => {
            readFileStub.returns(Promise.resolve(''));

            try {
                await sfdxUtil.readJSON('emptyfile');
                assert.fail('readJSON should have thrown a ParseError');
            } catch(error) {
                expect(error.message).to.contain('Parse error in file emptyfile on line 1\nFILE HAS NO CONTENT')
            }
        });

        it('should throw a ParseError for invalid multiline JSON file', () => {
            readFileStub.returns(Promise.resolve(`{
                "key": 12345,
                "value": true,
            }`));
            return sfdxUtil.readJSON('invalidJSON')
                .then(() => assert.fail('readJSON should have thrown a ParseError'))
                .catch((rv) => expect(rv.message).to.contain('Parse error in file invalidJSON on line 4'));
        });

        it('should throw a ParseError for invalid multiline JSON file 2', () => {
            readFileStub.returns(Promise.resolve('{\n"a":}'));
            return sfdxUtil.readJSON('invalidJSON2')
                .then(() => assert.fail('readJSON should have thrown a ParseError'))
                .catch((rv) => expect(rv.message).to.contain('Parse error in file invalidJSON2 on line 2'));
        });

        it('should throw a ParseError for invalid single line JSON file', () => {
            readFileStub.returns(Promise.resolve(`{ "key": 12345, "value": [1,2,3], }`));
            return sfdxUtil.readJSON('invalidJSON_no_newline')
                .then(() => assert.fail('readJSON should have thrown a ParseError'))
                .catch((rv) => expect(rv.message).to.contain('Parse error in file invalidJSON_no_newline on line 1'));
        });

        it('should return a JSON object', () => {
            const validJSON = { "key": 12345, "value": true };
            const validJSONStr = JSON.stringify(validJSON);
            readFileStub.returns(Promise.resolve(validJSONStr));
            return sfdxUtil.readJSON('validJSONStr')
                .then((rv) => expect(rv).to.eql(validJSON));
        });
    });
});
