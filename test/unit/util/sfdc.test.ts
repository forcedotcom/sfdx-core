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
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFiY2RlZmciLCJ0dHkiOiJzZmRjLWNvcmUtdG9rZW4iLCJ0bmsiOiJhYmNkZWZnIiwidmVyIjoiMS4wIn0.eyJzdWIiOiIxMjM0NTZhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYTc4OTAiLCJhdWQiOlsiYWJjIl0sImV4cCI6IjIwNTI1OTExMTIiLCJpc3MiOiJteS5zaXRlLmNvbSIsIm10eSI6ImFzZGZhc2RmYXNkZiIsIm5iZiI6IjExMTExMSIsInNmaSI6ImFhYWFhYSIsInNjcCI6WyJhc2RmYXNkZmFzZGYiXSwiaWF0IjoxNTE2MjM5MDIyfQ.l9ccflgu7FuynJ8yWC1WQDn_QwG6EBskfXpSKWJKpcg'
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
            // missing the `kid` required header key
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsInR0eSI6InNmZGMtY29yZS10b2tlbiIsInRuayI6ImFiY2RlZmciLCJ2ZXIiOiIxLjAifQ.eyJzdWIiOiIxMjM0NTZhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYTc4OTAiLCJhdWQiOlsiYWJjIl0sImV4cCI6IjIwNTI1OTExMTIiLCJpc3MiOiJteS5zaXRlLmNvbSIsIm10eSI6ImFzZGZhc2RmYXNkZiIsIm5iZiI6IjExMTExMSIsInNmaSI6ImFhYWFhYSIsInNjcCI6WyJhc2RmYXNkZmFzZGYiXSwiaWF0IjoxNTE2MjM5MDIyfQ.NQ-waqIZ9AZUxEOzdPojl-oUt8aYAGbJ466e70sPffM',
        },
        {
          segName: '2nd',
          token:
            // Missing required `exp` payload key
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFiY2RlZmciLCJ0dHkiOiJzZmRjLWNvcmUtdG9rZW4iLCJ0bmsiOiJhYmNkZWZnIiwidmVyIjoiMS4wIn0.eyJzdWIiOiIxMjM0NTZhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYTc4OTAiLCJhdWQiOlsiYWJjIl0sImlzcyI6Im15LnNpdGUuY29tIiwibXR5IjoiYXNkZmFzZGZhc2RmIiwibmJmIjoiMTExMTExIiwic2ZpIjoiYWFhYWFhIiwic2NwIjpbImFzZGZhc2RmYXNkZiJdLCJpYXQiOjE1MTYyMzkwMjJ9.8-TI38jRA-98x_Yuonzs5HHyvzB1UElfcwTr3irj6NA',
        },
      ];
      tokensWithMissingKeys.forEach((tokenDesc) => {
        it(`should return false when ${tokenDesc.segName} segment is missing required keys`, () => {
          expect(matchesAccessToken(tokenDesc.token)).to.equal(false);
        });
      });

      it('should return true for a header section with unexpected keys', () => {
        expect(
          matchesAccessToken(
            // This token has an extra key `ext` in its header.
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImV4dCI6IlRoaXMga2V5IHNob3VsZCBub3QgZXhpc3QiLCJraWQiOiJhYmNkZWZnIiwidHR5Ijoic2ZkYy1jb3JlLXRva2VuIiwidG5rIjoiYWJjZGVmZyIsInZlciI6IjEuMCJ9.eyJzdWIiOiIxMjM0NTZhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYTc4OTAiLCJhdWQiOlsiYWJjIl0sImV4cCI6IjEyMzQ1NjciLCJpc3MiOiJteS5zaXRlLmNvbSIsIm10eSI6ImFzZGZhc2RmYXNkZiIsIm5iZiI6IjExMTExMSIsInNmaSI6ImFhYWFhYSIsInNjcCI6WyJhc2RmYXNkZmFzZGYiXSwiaWF0IjoxNTE2MjM5MDIyfQ.ocsifsRJGQLdejkO_GDSCA3EK7B7qFzxtWJMC9xUMNo'
          )
        ).to.equal(true);
      });

      it('should return false for a payload section with unexpected keys', () => {
        expect(
          matchesAccessToken(
            // This token has an extra key `ext` in its payload.
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFiY2RlZmciLCJ0dHkiOiJzZmRjLWNvcmUtdG9rZW4iLCJ0bmsiOiJhYmNkZWZnIiwidmVyIjoiMS4wIn0.eyJzdWIiOiIxMjM0NTZhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYTc4OTAiLCJhdWQiOlsiYWJjIl0sImV4dCI6IlRoaXMga2V5IHNob3VsZCBub3QgZXhpc3QiLCJleHAiOiIxMjM0NTY3IiwiaXNzIjoibXkuc2l0ZS5jb20iLCJtdHkiOiJhc2RmYXNkZmFzZGYiLCJuYmYiOiIxMTExMTEiLCJzZmkiOiJhYWFhYWEiLCJzY3AiOlsiYXNkZmFzZGZhc2RmIl0sImlhdCI6MTUxNjIzOTAyMn0.YiEdY9P7r1tcQsaWcB5AxStlY3W1w-xgYFEdeeoM0sY'
          )
        ).to.equal(false);
      });
    });
    it('should return false for an invalid access token', () => {
      expect(matchesAccessToken('iamjustaregularusername@example.com')).to.equal(false);
    });
  });
});
