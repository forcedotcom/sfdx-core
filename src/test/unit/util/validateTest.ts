/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import * as validate from '../../../lib/util/validate';

describe('util/index', () => {
    describe('validateApiVersion', () => {
        it('should return true for "42.0"', () => {
            expect(validate.validateApiVersion('42.0')).to.be.true;
        });

        it('should return false for "42"', () => {
            expect(validate.validateApiVersion('42')).to.be.false;
        });

        it('should return false for 42.0', () => {
            const num = 42.0;
            expect(validate.validateApiVersion(num as any)).to.be.false; // tslint:disable-line:no-any
        });
    });

    describe('validateEmail', () => {
        it('should return true for "me@my.org"', () => {
            expect(validate.validateEmail('me@my.org')).to.be.true;
        });

        it('should return false for "me@my."', () => {
            expect(validate.validateEmail('me@my.')).to.be.false;
        });

        it('should return false for "@my.com"', () => {
            expect(validate.validateEmail('@my')).to.be.false;
        });
    });

    describe('validateSalesforceId', () => {
        it('should return true for "00DB0000003uuuuuuu"', () => {
            expect(validate.validateSalesforceId('00DB0000003uuuuuuu')).to.be.true;
        });

        it('should return false for "00D"', () => {
            expect(validate.validateSalesforceId('00D')).to.be.false;
        });

        it('should return false for "00D***11100000K"', () => {
            expect(validate.validateSalesforceId('00D***11100000K')).to.be.false;
        });
    });

    describe('validatePathDoesNotContainInvalidChars', () => {
        it('should return true for "/this/is/my/path"', () => {
            expect(validate.validatePathDoesNotContainInvalidChars('/this/is/my/path')).to.be.true;
        });

        it('should return false for "this/is/path??"', () => {
            expect(validate.validatePathDoesNotContainInvalidChars('this/is/path??')).to.be.false;
        });

        it('should return false for "[this/is/path]"', () => {
            expect(validate.validatePathDoesNotContainInvalidChars('[this/is/path]')).to.be.false;
        });

        it('should return false for "/my/path > err.log"', () => {
            expect(validate.validatePathDoesNotContainInvalidChars('/my/path > err.log')).to.be.false;
        });
    });
});
