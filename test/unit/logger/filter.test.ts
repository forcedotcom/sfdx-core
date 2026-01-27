/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { assert, expect, config } from 'chai';
import { filterSecrets, HIDDEN } from '../../../src/logger/filters';
import { unwrapArray } from '../../../src/util/unwrapArray';

config.truncateThreshold = 0;

describe('filters', () => {
  const tokenDescs = [
    {
      token: '00D55000000M2qA!AQ0AQHg3LnYDOyobmH07',
      type: 'opaque token',
      redaction: 'REDACTED ACCESS TOKEN',
    },
    {
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eeeeyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
      type: 'jwt',
      redaction: 'REDACTED JWT TOKEN',
    },
  ];
  for (const tokenDesc of tokenDescs) {
    describe(`for token type: ${tokenDesc.type}`, () => {
      const simpleString = `sid=${tokenDesc.token}`;
      const stringWithObject = ` The rain in Spain: ${JSON.stringify({
        // eslint-disable-next-line camelcase
        access_token: tokenDesc.token,
      })}`;

      it(`filters ${simpleString} correctly`, () => {
        const result = getUnwrapped(simpleString);
        expect(result).to.not.contain(tokenDesc.token);
        expect(result).to.contain(tokenDesc.redaction);
      });

      it(`filters ${stringWithObject} correctly`, () => {
        const result = getUnwrapped(stringWithObject);
        expect(result).to.not.contain(tokenDesc.token);
        expect(result).to.contain(tokenDesc.redaction);
      });

      it('filters regular object correctly', () => {
        const result = getUnwrapped({ accessToken: `${tokenDesc.token}`, refreshToken: `${tokenDesc.token}` });
        assert(result);
        const bigString = JSON.stringify(result);
        expect(bigString).to.not.contain(tokenDesc.token);
        expect(bigString).to.contain(tokenDesc.redaction);
        expect(bigString).to.contain('refresh_token - HIDDEN');
      });

      it('filters key/value object correctly', () => {
        const result = getUnwrapped({ key: 'Access Token', value: `${tokenDesc.token}` });
        assert(result);
        const bigString = JSON.stringify(result);
        expect(bigString).to.not.contain(tokenDesc.token);
        expect(bigString).to.contain(tokenDesc.redaction);
      });

      it('filters auth code correctly', () => {
        const result = getUnwrapped({ authCode: 'authcode value' });
        assert(result);
        const bigString = JSON.stringify(result);
        expect(bigString).to.not.contain('authCode value');
        expect(bigString).to.contain('authcode - HIDDEN');
      });

      describe('client id', () => {
        it('filters clientId correctly', () => {
          const result = getUnwrapped({ clientId: 'clientIdValue' });
          assert(result);
          const bigString = JSON.stringify(result);
          expect(bigString).to.not.contain('clientIdValue');
          expect(bigString).to.contain('REDACTED CLIENT ID');
        });

        it('filters clientId correctly (case insensitive)', () => {
          const result = getUnwrapped({ ClientId: 'clientIdValue' });
          assert(result);
          const bigString = JSON.stringify(result);
          expect(bigString).to.not.contain('clientIdValue');
          expect(bigString).to.contain('REDACTED CLIENT ID');
        });

        it('filters clientId correctly (separator)', () => {
          // eslint-disable-next-line camelcase
          const result = getUnwrapped({ Client_Id: 'clientIdValue' });
          assert(result);
          const bigString = JSON.stringify(result);
          expect(bigString).to.not.contain('clientIdValue');
          expect(bigString).to.contain('REDACTED CLIENT ID');
        });
      });

      it('filters array correctly', () => {
        const result = getUnwrapped([
          { key: 'ACCESS token ', value: `${tokenDesc.token}` },
          { key: 'refresh  TOKEN', value: `${tokenDesc.token}` },
          { key: 'Sfdx Auth Url', value: `${tokenDesc.token}` },
        ]);
        assert(result);
        assert(Array.isArray(result));
        const bigString = JSON.stringify(result);

        expect(bigString).to.not.contain(tokenDesc.token);
        expect(bigString).to.contain(tokenDesc.redaction);
        expect(bigString).to.contain('refresh_token - HIDDEN');
      });

      it('filters another array correctly', () => {
        const result = getUnwrapped([
          { key: ' AcCESS 78token', value: ` ${tokenDesc.token} ` },
          { key: ' refresh  _TOKEn ', value: ` ${tokenDesc.token} ` },
          { key: ' SfdX__AuthUrl  ', value: ` ${tokenDesc.token} ` },
        ]);
        assert(result);
        assert(Array.isArray(result));
        const bigString = JSON.stringify(result);
        expect(bigString).to.not.contain(tokenDesc.token);
        expect(bigString).to.contain(HIDDEN);
        expect(bigString).to.contain('refresh_token - HIDDEN');
      });

      describe('does not filter innocent stuff', () => {
        it('basic string', () => {
          const result = getUnwrapped('some string');
          expect(result).to.equal('some string');
        });
        it('basic object', () => {
          const input = { foo: 'bar' };
          const result = getUnwrapped(input);
          expect(result).to.deep.equal(input);
        });
        it('basic array', () => {
          const input = ['foo', 'bar'];
          const result = getUnwrapped(input);
          expect(result).to.deep.equal(input);
        });
        it('object with one bad prop', () => {
          const input = { foo: 'bar', accessToken: `${tokenDesc.token}` };
          const result = getUnwrapped(input);
          expect(result).to.have.property('foo', 'bar');
          expect(result).to.have.property('accessToken').contains(tokenDesc.redaction);
        });
        describe('clientId', () => {
          it('default connected app', () => {
            const input = { clientId: 'PlatformCLI' };
            const result = getUnwrapped(input);
            expect(result).to.deep.equal(input);
          });
          it('default connected app (case insensitive)', () => {
            const input = { ClientID: 'PlatformCLI' };
            const result = getUnwrapped(input);
            expect(result).to.deep.equal(input);
          });
          it('default connected app (case insensitive)', () => {
            // eslint-disable-next-line camelcase
            const input = { client_id: 'PlatformCLI' };
            const result = getUnwrapped(input);
            expect(result).to.deep.equal(input);
          });
        });
      });
    });
  }
});

const getUnwrapped = (input: unknown): unknown => unwrapArray(filterSecrets(input));
