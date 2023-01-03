/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import {
  findUpperCaseKeys,
  matchesAccessToken,
  sfdc,
  trimTo15,
  validateApiVersion,
  validateEmail,
  validatePathDoesNotContainInvalidChars,
  validateSalesforceId,
} from '../../../src/util/sfdc';

describe('util/sfdc', () => {
  describe('trimTo15', () => {
    it('should trim an 18 character id to 15 characters', () => {
      const id = sfdc.trimTo15('ABCDEFGHIJKLMNOPQR');
      const trimmed = sfdc.trimTo15(id);
      expect(trimmed.length).to.eq(15);
      expect(trimmed.endsWith('O')).to.be.true;
    });
    it('should trim an 18 character id to 15 characters', () => {
      const id = trimTo15('ABCDEFGHIJKLMNOPQR');
      const trimmed = trimTo15(id);
      expect(trimmed.length).to.eq(15);
      expect(trimmed.endsWith('O')).to.be.true;
    });
    it('returns undefined when not passed a string', () => {
      expect(trimTo15()).to.be.undefined;
      expect(trimTo15(undefined)).to.be.undefined;
    });
    it('returns same id when 15 char or less', () => {
      expect(trimTo15('ABCDEFGHIJKLMNO')).to.equal('ABCDEFGHIJKLMNO');
      expect(trimTo15('ABC')).to.equal('ABC');
    });
  });

  describe('validateApiVersion', () => {
    it('should return true for "42.0"', () => {
      expect(sfdc.validateApiVersion('42.0')).to.be.true;
      expect(validateApiVersion('42.0')).to.be.true;
    });

    it('should return false for "42"', () => {
      expect(sfdc.validateApiVersion('42')).to.be.false;
      expect(validateApiVersion('42')).to.be.false;
    });

    it('should return false for 42.0', () => {
      const num = 42.0;
      expect(sfdc.validateApiVersion(num as never)).to.be.false;
      expect(validateApiVersion(num as never)).to.be.false;
    });
  });

  describe('validateEmail', () => {
    it('should return true for "me@my.org"', () => {
      expect(sfdc.validateEmail('me@my.org')).to.be.true;
      expect(validateEmail('me@my.org')).to.be.true;
    });

    it('should return false for "me@my."', () => {
      expect(sfdc.validateEmail('me@my.')).to.be.false;
      expect(validateEmail('me@my.')).to.be.false;
    });

    it('should return false for "@my.com"', () => {
      expect(sfdc.validateEmail('@my')).to.be.false;
      expect(validateEmail('@my')).to.be.false;
    });
  });

  describe('validateSalesforceId', () => {
    it('should return true for "00DB0000003uuuuuuu"', () => {
      expect(sfdc.validateSalesforceId('00DB0000003uuuuuuu')).to.be.true;
      expect(validateSalesforceId('00DB0000003uuuuuuu')).to.be.true;
    });

    it('should return false for "00D"', () => {
      expect(sfdc.validateSalesforceId('00D')).to.be.false;
      expect(validateSalesforceId('00D')).to.be.false;
    });

    it('should return false for "00D***11100000K"', () => {
      expect(sfdc.validateSalesforceId('00D***11100000K')).to.be.false;
      expect(validateSalesforceId('00D***11100000K')).to.be.false;
    });
  });

  describe('validatePathDoesNotContainInvalidChars', () => {
    it('should return true for "/this/is/my/path"', () => {
      expect(sfdc.validatePathDoesNotContainInvalidChars('/this/is/my/path')).to.be.true;
      expect(validatePathDoesNotContainInvalidChars('/this/is/my/path')).to.be.true;
    });

    it('should return false for "this/is/path??"', () => {
      expect(sfdc.validatePathDoesNotContainInvalidChars('this/is/path??')).to.be.false;
      expect(validatePathDoesNotContainInvalidChars('this/is/path??')).to.be.false;
    });

    it('should return false for "[this/is/path]"', () => {
      expect(sfdc.validatePathDoesNotContainInvalidChars('[this/is/path]')).to.be.false;
      expect(validatePathDoesNotContainInvalidChars('[this/is/path]')).to.be.false;
    });

    it('should return false for "/my/path > err.log"', () => {
      expect(sfdc.validatePathDoesNotContainInvalidChars('/my/path > err.log')).to.be.false;
      expect(validatePathDoesNotContainInvalidChars('/my/path > err.log')).to.be.false;
    });
    it('should return true for "c:\\myfile"', () => {
      expect(sfdc.validatePathDoesNotContainInvalidChars('c:\\myfile')).to.be.true;
      expect(validatePathDoesNotContainInvalidChars('c:\\myfile')).to.be.true;
    });
  });

  describe('findUpperCaseKeys', () => {
    it('should return the first upper case key', () => {
      const testObj = {
        lowercase: true,
        UpperCase: false,
        nested: { camelCase: true },
      };
      expect(sfdc.findUpperCaseKeys(testObj)).to.equal('UpperCase');
      expect(findUpperCaseKeys(testObj)).to.equal('UpperCase');
    });

    it('should return the first nested upper case key', () => {
      const testObj = {
        lowercase: true,
        uppercase: false,
        nested: { NestedUpperCase: true },
      };
      expect(sfdc.findUpperCaseKeys(testObj)).to.equal('NestedUpperCase');
      expect(findUpperCaseKeys(testObj)).to.equal('NestedUpperCase');
    });

    it('should return undefined when no upper case key is found', () => {
      const testObj = {
        lowercase: true,
        uppercase: false,
        nested: { camelCase: true },
      };
      expect(sfdc.findUpperCaseKeys(testObj)).to.be.undefined;
      expect(findUpperCaseKeys(testObj)).to.be.undefined;
    });

    it('should return the first nested upper case key unless blocklisted', () => {
      const testObj = {
        lowercase: true,
        uppercase: false,
        nested: { NestedUpperCase: true },
      };
      expect(sfdc.findUpperCaseKeys(testObj, ['nested'])).to.equal(undefined);
      expect(findUpperCaseKeys(testObj, ['nested'])).to.equal(undefined);
    });
  });

  describe('matchesAccessToken', () => {
    it('should return true for a valid access token', () => {
      expect(
        sfdc.matchesAccessToken(
          '00D0t000000HkBf!AQ8AQAuHh7lXOFdOA202PMQuGflRrtUkVIfSNK1BrWLlJTJuvypx3r8dLONoJdniYKap1nsTlbxRbbGDqT6r2Rze_Ii5no2y'
        )
      ).to.equal(true);
      expect(
        matchesAccessToken(
          '00D0t000000HkBf!AQ8AQAuHh7lXOFdOA202PMQuGflRrtUkVIfSNK1BrWLlJTJuvypx3r8dLONoJdniYKap1nsTlbxRbbGDqT6r2Rze_Ii5no2y'
        )
      ).to.equal(true);
    });
    it('should return false for an invalid access token', () => {
      expect(sfdc.matchesAccessToken('iamjustaregularusername@example.com')).to.equal(false);
      expect(matchesAccessToken('iamjustaregularusername@example.com')).to.equal(false);
    });
  });
});
