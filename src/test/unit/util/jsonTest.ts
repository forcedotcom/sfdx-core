import { SfdxError } from './../../../lib/sfdxError';
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { assert, expect } from 'chai';
import { JsonMap } from '../../../lib/types';
import * as fs from '../../../lib/util/fs';
import * as json from '../../../lib/util/json';
import { testSetup } from '../../testSetup';

// Setup the test environment.
const $$ = testSetup();

describe('readJson', () => {
    let readFileStub;

    beforeEach(() => {
        readFileStub = $$.SANDBOX.stub(fs, 'readFile');
    });

    it('should throw a ParseError for empty JSON file', async () => {
        readFileStub.returns(Promise.resolve(''));

        try {
            await json.readJson('emptyFile');
            assert.fail('readJson should have thrown a ParseError');
        } catch (error) {
            expect(error.message).to.contain('Parse error in file emptyFile on line 1\nFILE HAS NO CONTENT');
        }
    });

    it('should throw a ParseError for invalid multiline JSON file', () => {
        readFileStub.returns(Promise.resolve(`{
            "key": 12345,
            "value": true,
        }`));
        return json.readJson('invalidJSON')
            .then(() => assert.fail('readJson should have thrown a ParseError'))
            .catch((rv) => expect(rv.message).to.contain('Parse error in file invalidJSON on line 4'));
    });

    it('should throw a ParseError for invalid multiline JSON file 2', () => {
        readFileStub.returns(Promise.resolve('{\n"a":}'));
        return json.readJson('invalidJSON2')
            .then(() => assert.fail('readJson should have thrown a ParseError'))
            .catch((rv) => expect(rv.message).to.contain('Parse error in file invalidJSON2 on line 2'));
    });

    it('should throw a ParseError for invalid single line JSON file', () => {
        readFileStub.returns(Promise.resolve('{ "key": 12345, "value": [1,2,3], }'));
        return json.readJson('invalidJSON_no_newline')
            .then(() => assert.fail('readJson should have thrown a ParseError'))
            .catch((rv) => expect(rv.message).to.contain('Parse error in file invalidJSON_no_newline on line 1'));
    });

    it('should return a JSON object', () => {
        const validJSON = { key: 12345, value: true };
        const validJSONStr = JSON.stringify(validJSON);
        readFileStub.returns(Promise.resolve(validJSONStr));
        return json.readJson('validJSONStr')
            .then((rv) => expect(rv).to.eql(validJSON));
    });
});

describe('readJsonMap', () => {
    let readFileStub;

    beforeEach(() => {
        readFileStub = $$.SANDBOX.stub(fs, 'readFile');
    });

    it('should throw a UnexpectedJsonFileFormat for non-object JSON content', async () => {
        readFileStub.returns(Promise.resolve('[]'));

        try {
            await json.readJsonMap('arrayFile');
            assert.fail('readJson should have thrown a UnexpectedJsonFileFormat');
        } catch (error) {
            expect(error.message).to.contain('UnexpectedJsonFileFormat');
        }
    });

    it('should return a JSON object', async () => {
        const validJSON = { key: 12345, value: true };
        const validJSONStr = JSON.stringify(validJSON);
        readFileStub.returns(Promise.resolve(validJSONStr));
        const rv = await json.readJsonMap('validJSONStr');
        expect(rv).to.eql(validJSON);
    });
});

describe('writeJson', () => {
    it('should call writeFile with correct args', async () => {
        $$.SANDBOX.stub(fs, 'writeFile').returns(Promise.resolve(null));
        const testFilePath = 'utilTest_testFilePath';
        const testJSON = { username: 'utilTest_username'};
        const stringifiedTestJSON = JSON.stringify(testJSON, null, 4);
        await json.writeJson(testFilePath, testJSON);
        expect(fs.writeFile['called']).to.be.true;
        expect(fs.writeFile['firstCall'].args[0]).to.equal(testFilePath);
        expect(fs.writeFile['firstCall'].args[1]).to.deep.equal(stringifiedTestJSON);
        expect(fs.writeFile['firstCall'].args[2]).to.deep.equal({ encoding: 'utf8', mode: '600' });
    });
});

describe('getJsonValuesByName', () => {
    it('returns a flattened array of all elements of a given name found in a JSON tree', () => {
        const data: JsonMap = {
            a: 'fail',
            b: 'root',
            c: 'fail',
            d: {
                a: 'fail',
                b: 'd',
                c: 'fail'
            },
            e: [
                'fail',
                {
                    a: 'fail',
                    b: 'e',
                    c: 'fail'
                },
                'fail'
            ]
        };
        expect(json.getJsonValuesByName(data, 'b')).to.deep.equal(['root', 'd', 'e']);
    });

    describe('findUpperCaseKeys', () => {
        it('should return the first upper case key', () => {
            const testObj = { lowercase: true, UpperCase: false, nested: { camelCase: true } };
            expect(json.findUpperCaseKeys(testObj)).to.equal('UpperCase');
        });

        it('should return the first nested upper case key', () => {
            const testObj = { lowercase: true, uppercase: false, nested: { NestedUpperCase: true } };
            expect(json.findUpperCaseKeys(testObj)).to.equal('NestedUpperCase');
        });

        it('should return undefined when no upper case key is found', () => {
            const testObj = { lowercase: true, uppercase: false, nested: { camelCase: true } };
            expect(json.findUpperCaseKeys(testObj)).to.be.undefined;
        });
    });
});

describe('type narrowing', () => {
    describe('isJsonMap', () => {
        it('should return false when passed undefined', () => {
            expect(json.isJsonMap(undefined)).to.be.false;
        });

        it('should return true when passed a JsonMap', () => {
            const value = {a: 'b', c: 'd'};
            expect(json.isJsonMap(value)).to.be.true;
        });
    });

    describe('isJsonArray', () => {
        it('should return false when passed undefined', () => {
            expect(json.isJsonArray(undefined)).to.be.false;
        });

        it('should return true when passed a JsonArray', () => {
            const value = ['a', 'b'];
            expect(json.isJsonArray(value)).to.be.true;
        });
    });

    describe('asString', () => {
        it('should return undefined when passed undefined', () => {
            expect(json.asString(undefined)).to.be.undefined;
        });

        it('should return a string when passed a string', () => {
            const value = 'string';
            expect(json.asString(value)).to.equal(value);
        });
    });

    describe('asNumber', () => {
        it('should return undefined when passed undefined', () => {
            expect(json.asNumber(undefined)).to.be.undefined;
        });

        it('should return a number when passed a number', () => {
            const value = 1;
            expect(json.asNumber(value)).to.equal(value);
        });
    });

    describe('asBoolean', () => {
        it('should return undefined when passed undefined', () => {
            expect(json.asBoolean(undefined)).to.be.undefined;
        });

        it('should return a boolean when passed a boolean', () => {
            const value = true;
            expect(json.asBoolean(value)).to.equal(value);
        });
    });

    describe('asJsonMap', () => {
        it('should return undefined when passed undefined', () => {
            expect(json.asJsonMap(undefined)).to.be.undefined;
        });

        it('should return a JsonMap when passed a JsonMap', () => {
            const value = { a: 'b', c: 'd' };
            expect(json.asJsonMap(value)).to.equal(value);
        });
    });

    describe('asJsonArray', () => {
        it('should return undefined when passed undefined', () => {
            expect(json.asJsonArray(undefined)).to.be.undefined;
        });

        it('should return a JsonArray when passed a JsonArray', () => {
            const value = ['a', 'b'];
            expect(json.asJsonArray(value)).to.equal(value);
        });
    });

    describe('ensureString', () => {
        it('should raise an error when passed undefined', () => {
            expect(() => json.ensureString(undefined)).to.throw(SfdxError);
        });

        it('should return a string when passed a string', () => {
            const value = 'string';
            expect(json.asString(value)).to.equal(value);
        });
    });

    describe('ensureNumber', () => {
        it('should raise an error when passed undefined', () => {
            expect(() => json.ensureNumber(undefined)).to.throw(SfdxError);
        });

        it('should return a number when passed a number', () => {
            const value = 1;
            expect(json.asNumber(value)).to.equal(value);
        });
    });

    describe('ensureBoolean', () => {
        it('should raise an error when passed undefined', () => {
            expect(() => json.ensureBoolean(undefined)).to.throw(SfdxError);
        });

        it('should return a boolean when passed a number', () => {
            const value = true;
            expect(json.asBoolean(value)).to.equal(value);
        });
    });

    describe('ensureJsonMap', () => {
        it('should raise an error when passed undefined', () => {
            expect(() => json.ensureJsonMap(undefined)).to.throw(SfdxError);
        });

        it('should return a JsonMap when passed a JsonMap', () => {
            const value = { a: 'b', c: 'd' };
            expect(json.asJsonMap(value)).to.deep.equal(value);
        });
    });

    describe('ensureJsonArray', () => {
        it('should raise an error when passed undefined', () => {
            expect(() => json.ensureJsonArray(undefined)).to.throw(SfdxError);
        });

        it('should return a JsonArray when passed a JsonArray', () => {
            const value = ['a', 'b'];
            expect(json.asJsonArray(value)).to.deep.equal(value);
        });
    });
});
