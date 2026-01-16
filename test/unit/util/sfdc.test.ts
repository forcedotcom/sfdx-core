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
    it('should return true for a valid opaque access token', () => {
      expect(
        matchesAccessToken(
          '00D0t000000HkBf!AQ8AQAuHh7lXOFdOA202PMQuGflRrtUkVIfSNK1BrWLlJTJuvypx3r8dLONoJdniYKap1nsTlbxRbbGDqT6r2Rze_Ii5no2y'
        )
      ).to.equal(true);
    });
    describe('JWT validation', () => {
      it('should return true for a valid JWT access token', () => {
        expect(
          matchesAccessToken(
            // Note: The `exp` property in this token corresponds to Jan 16, 2035. If this code suddenly starts failing in 2035, that's why.
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFiY2RlZmciLCJ0dHkiOiJzZmRjLWNvcmUtdG9rZW4iLCJ0bmsiOiJhYmNkZWZnIiwidmVyIjoiMS4wIn0.eyJzdWIiOiIxMjM0NTZhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYTc4OTAiLCJuYW1lIjoiSm9obiBEb2UiLCJhdWQiOlsiYWJjIl0sImV4cCI6IjIwNTI1OTExMTIiLCJpc3MiOiJteS5zaXRlLmNvbSIsIm10eSI6ImFzZGZhc2RmYXNkZiIsIm5iZiI6IjExMTExMSIsInNmaSI6ImFhYWFhYSIsInNjcCI6WyJhc2RmYXNkZmFzZGYiXSwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.XWLM29ZTH135BBH7V0Psx_3ti2D1DRGbEvvr7FLrNAA'
          )
        ).to.equal(true);
      });

      it('should return false for a token with the wrong number of segments', () => {
        expect(
          matchesAccessToken(
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0'
          )
        ).to.equal(false);
      });

      const tokensWithMalformedSegments = [
        {
          segName: '1st',
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJeee9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
        },
        {
          segName: '2nd',
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eeeeyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
        },
      ];

      tokensWithMalformedSegments.forEach((tokenDesc) => {
        it(`should return false when the ${tokenDesc.segName} segment is not a base64-encoded JSON`, () => {
          expect(matchesAccessToken(tokenDesc.token)).to.equal(false);
        });
      });

      const tokensWithMissingKeys = [
        {
          segName: '1st',
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTZhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYTc4OTAiLCJuYW1lIjoiSm9obiBEb2UiLCJhdWQiOlsiYWJjIl0sImV4cCI6IjEyMzQ1NjciLCJpc3MiOiJteS5zaXRlLmNvbSIsIm10eSI6ImFzZGZhc2RmYXNkZiIsIm5iZiI6IjExMTExMSIsInNmaSI6ImFhYWFhYSIsInNjcCI6WyJhc2RmYXNkZmFzZGYiXSwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
        },
        {
          segName: '2nd',
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFiY2RlZmciLCJ0dHkiOiJzZmRjLWNvcmUtdG9rZW4iLCJ0bmsiOiJhYmNkZWZnIiwidmVyIjoiMS4wIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
        },
      ];
      tokensWithMissingKeys.forEach((tokenDesc) => {
        it(`should return false when ${tokenDesc.segName} segment is missing required keys`, () => {
          expect(matchesAccessToken(tokenDesc.token)).to.equal(false);
        });
      });

      it('rejects token with expiration date in the past', () => {
        // This token has an `exp` property of "1675198836", corresponding to Jan 31, 2023.
        expect(
          matchesAccessToken(
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFiY2RlZmciLCJ0dHkiOiJzZmRjLWNvcmUtdG9rZW4iLCJ0bmsiOiJhYmNkZWZnIiwidmVyIjoiMS4wIn0.eyJzdWIiOiIxMjM0NTZhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYTc4OTAiLCJuYW1lIjoiSm9obiBEb2UiLCJhdWQiOlsiYWJjIl0sImV4cCI6IjE2NzUxOTg4MzYiLCJpc3MiOiJteS5zaXRlLmNvbSIsIm10eSI6ImFzZGZhc2RmYXNkZiIsIm5iZiI6IjExMTExMSIsInNmaSI6ImFhYWFhYSIsInNjcCI6WyJhc2RmYXNkZmFzZGYiXSwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.JVeMwFhLpzZ-DpAKBYPLNQScOtbhX28HoZLJmjANv7A'
          )
        ).to.equal(false);
      });
    });
    it('should return false for an invalid access token', () => {
      expect(matchesAccessToken('iamjustaregularusername@example.com')).to.equal(false);
    });
  });
});
