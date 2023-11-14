/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import {
  matchesAccessToken,
  trimTo15,
  validateApiVersion,
  validateEmail,
  validatePathDoesNotContainInvalidChars,
  validateSalesforceId,
} from '../../../src/util/sfdc';

describe('util/sfdc', () => {
  describe('trimTo15', () => {
    it('should trim an 18 character id to 15 characters', () => {
      const id = trimTo15('ABCDEFGHIJKLMNOPQR');
      const trimmed = trimTo15(id);
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
      expect(validateApiVersion('42.0')).to.be.true;
    });

    it('should return false for "42"', () => {
      expect(validateApiVersion('42')).to.be.false;
    });

    it('should return false for 42.0', () => {
      const num = 42.0;
      expect(validateApiVersion(num as never)).to.be.false;
    });
  });

  describe('validateEmail', () => {
    it('should return true for "me@my.org"', () => {
      expect(validateEmail('me@my.org')).to.be.true;
    });

    it('should return false for "me@my."', () => {
      expect(validateEmail('me@my.')).to.be.false;
    });

    it('should return false for "@my.com"', () => {
      expect(validateEmail('@my')).to.be.false;
    });
  });

  describe('validateSalesforceId', () => {
    it('should return true for "00DB0000003uuuuuuu"', () => {
      expect(validateSalesforceId('00DB0000003uuuuuuu')).to.be.true;
    });

    it('should return false for "00D"', () => {
      expect(validateSalesforceId('00D')).to.be.false;
    });

    it('should return false for "00D***11100000K"', () => {
      expect(validateSalesforceId('00D***11100000K')).to.be.false;
    });
  });

  describe('validatePathDoesNotContainInvalidChars', () => {
    it('should return true for "/this/is/my/path"', () => {
      expect(validatePathDoesNotContainInvalidChars('/this/is/my/path')).to.be.true;
    });

    it('should return false for "this/is/path??"', () => {
      expect(validatePathDoesNotContainInvalidChars('this/is/path??')).to.be.false;
    });

    it('should return false for "[this/is/path]"', () => {
      expect(validatePathDoesNotContainInvalidChars('[this/is/path]')).to.be.false;
    });

    it('should return false for "/my/path > err.log"', () => {
      expect(validatePathDoesNotContainInvalidChars('/my/path > err.log')).to.be.false;
    });
    it('should return true for "c:\\myfile"', () => {
      expect(validatePathDoesNotContainInvalidChars('c:\\myfile')).to.be.true;
    });
  });

  describe('matchesAccessToken', () => {
    it('should return true for a valid access token', () => {
      expect(
        matchesAccessToken(
          '00D0t000000HkBf!AQ8AQAuHh7lXOFdOA202PMQuGflRrtUkVIfSNK1BrWLlJTJuvypx3r8dLONoJdniYKap1nsTlbxRbbGDqT6r2Rze_Ii5no2y'
        )
      ).to.equal(true);
    });
    it('should return false for an invalid access token', () => {
      expect(matchesAccessToken('iamjustaregularusername@example.com')).to.equal(false);
    });
  });
});
