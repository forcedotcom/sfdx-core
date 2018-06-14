/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import * as util from '../../../lib/util';

describe('util/index', () => {
    describe('isSalesforceDomain', () => {
        it('is whitelist domain', () => {
            expect(util.isSalesforceDomain('http://www.salesforce.com')).to.be.true;
        });

        it('is not whiteList or host', () => {
            expect(util.isSalesforceDomain('http://www.ghostbusters.com')).to.be.false;
        });

        it('is whiteList host', () => {
            expect(util.isSalesforceDomain('http://developer.salesforce.com')).to.be.true;
        });

        it('falsy', () => {
            expect(util.isSalesforceDomain(undefined)).to.be.false;
        });
    });

    describe('findUpperCaseKeys', () => {
        it('should return the first upper case key', () => {
            const testObj = { lowercase: true, UpperCase: false, nested: { camelCase: true } };
            expect(util.findUpperCaseKeys(testObj)).to.equal('UpperCase');
        });

        it('should return the first nested upper case key', () => {
            const testObj = { lowercase: true, uppercase: false, nested: { NestedUpperCase: true } };
            expect(util.findUpperCaseKeys(testObj)).to.equal('NestedUpperCase');
        });

        it('should return undefined when no upper case key is found', () => {
            const testObj = { lowercase: true, uppercase: false, nested: { camelCase: true } };
            expect(util.findUpperCaseKeys(testObj)).to.be.undefined;
        });
    });

    it('should trim an 18 character id to 15 characters', () => {
        const id: string = util.trimTo15('ABCDEFGHIJKLMNOPQR');
        const trimmed = util.trimTo15(id);
        expect(trimmed.length).to.eq(15);
        expect(trimmed.endsWith('O')).to.be.true;
    });
});
