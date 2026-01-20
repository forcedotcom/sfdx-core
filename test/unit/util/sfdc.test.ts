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
            'eyJ0bmsiOiJjb3JlL3Byb2QvMDBENDYwMDAwMDE5TWt5RUFFIiwidmVyIjoiMS4wIiwia2lkIjoiQ09SRV9BVEpXVC4wMEQ0NjAwMDAwMTlNa3kuMTc2NTM4MDM2NDU2MyIsInR0eSI6InNmZGMtY29yZS10b2tlbiIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzY3AiOiJyZWZyZXNoX3Rva2VuIHdlYiBhcGkiLCJhdWQiOlsiaHR0cHM6Ly9uYTQwLWRldi1odWIubXkuc2FsZXNmb3JjZS5jb20iXSwic3ViIjoidWlkOjAwNTQ2MDAwMDAyakRGRkFBMiIsIm5iZiI6MTc2ODkyODU1MiwibXR5Ijoib2F1dGgiLCJzZmkiOiI2MzY0NGVkYTI5NjY4MmNlOWIxNmQ1ZjdkN2MzM2Y0MTMyMzViYTcxMDkyYWMwZTU4ZTQ2Y2U2ZDMyY2NkNjI3Iiwicm9sZXMiOltdLCJpc3MiOiJodHRwczovL25hNDAtZGV2LWh1Yi5teS5zYWxlc2ZvcmNlLmNvbSIsImhzYyI6ZmFsc2UsImV4cCI6MTc2ODkzNTc2NywiaWF0IjoxNzY4OTI4NTY3LCJjbGllbnRfaWQiOiIzTVZHOWkxSFJwR0xYcC5vYXIwejZ6NnhzS09VakEuNVBjTVlWanhISlQ1M1NIcE4za09aaWVXT1IyUXhIRmlyX2JybDM1bFNCa2ZiSWtlSDZTRHcwIn0.dVlR-OQGoYsaftRJ_c5ENFEKhVyuu26qhcOGjt9rg6z_sJ7kFi8F-tgHptHZ3I2XEB02C-_lzmDHqk9Qc9GN6OyZaNbcGsJGSpZaLqUxCIXm9Uwsh6RLj2B4MO6n4JwBS2pH_qLj1SkmrTR0nUP7uIJRj1ZuCHRkOtXPtI8nuOZ9cmIn_PWpv2jMSjfmgBs7dpOFITJ_A1yETuEWqMKeV-_znJqAnhkzfm4ejU4kwvu19RWlhIasWoz9RzgWtKkSlnW1akP-fPpvUt_Y0NWZBmKCW8z-gXNwZlNEKv8s5AQgwzg5dO7tryNAeyK3NS9RY7XVnVb2MB8g6-xJGpu5bA'
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

      it('should return false when the header does not have `typ` == `JWT`', () => {
        expect(
          matchesAccessToken(
            'ewogICJhbGciOiAiSFMyNTYiLAogICJ0eXAiOiAiSlciCn0.eyJzdWIiOiIxMjM0NTZhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYTc4OTAiLCJhdWQiOlsiYWJjIl0sImV4cCI6IjIwNTI1OTExMTIiLCJpc3MiOiJteS5zaXRlLmNvbSIsIm10eSI6ImFzZGZhc2RmYXNkZiIsIm5iZiI6IjExMTExMSIsInNmaSI6ImFhYWFhYSIsInNjcCI6WyJhc2RmYXNkZmFzZGYiXSwiaWF0IjoxNTE2MjM5MDIyfQ.NQ-waqIZ9AZUxEOzdPojl-oUt8aYAGbJ466e70sPffM'
          )
        ).to.equal(false);
      });

      it('should return true for a header section with unexpected keys', () => {
        expect(
          matchesAccessToken(
            // This token has an extra key `ext` in its header.
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImV4dCI6IlRoaXMga2V5IHNob3VsZCBub3QgZXhpc3QiLCJraWQiOiJhYmNkZWZnIiwidHR5Ijoic2ZkYy1jb3JlLXRva2VuIiwidG5rIjoiYWJjZGVmZyIsInZlciI6IjEuMCJ9.eyJzdWIiOiIxMjM0NTZhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYTc4OTAiLCJhdWQiOlsiYWJjIl0sImV4cCI6IjEyMzQ1NjciLCJpc3MiOiJteS5zaXRlLmNvbSIsIm10eSI6ImFzZGZhc2RmYXNkZiIsIm5iZiI6IjExMTExMSIsInNmaSI6ImFhYWFhYSIsInNjcCI6WyJhc2RmYXNkZmFzZGYiXSwiaWF0IjoxNTE2MjM5MDIyfQ.ocsifsRJGQLdejkO_GDSCA3EK7B7qFzxtWJMC9xUMNo'
          )
        ).to.equal(true);
      });
    });
    it('should return false for an invalid access token', () => {
      expect(matchesAccessToken('iamjustaregularusername@example.com')).to.equal(false);
    });
  });
});
