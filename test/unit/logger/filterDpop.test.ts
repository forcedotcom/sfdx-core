/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { expect, config } from 'chai';
import { filterSecrets } from '../../../src/logger/filters';
import { unwrapArray } from '../../../src/util/unwrapArray';

config.truncateThreshold = 0;

const getUnwrapped = (input: unknown): string => JSON.stringify(unwrapArray(filterSecrets(input)));

// Opaque values so redaction must come from the header name, not from the JWT/access-token patterns.
const SECRET_HEADERS = {
  Authorization: 'DPoP opaque-authorization-value',
  DPoP: 'opaque-dpop-proof-value',
  'DPoP-Nonce': 'opaque-dpop-nonce-value',
  Cookie: 'opaque-cookie-value',
  'Set-Cookie': 'opaque-set-cookie-value',
  'X-SFDC-Session': 'opaque-sfdc-session-value',
};

describe('filters for DPoP and credential headers', () => {
  it('keeps safe headers', () => {
    const result = getUnwrapped({ accept: 'application/json', 'content-type': 'application/json' });

    expect(result).to.contain('application/json');
  });

  for (const [name, value] of Object.entries(SECRET_HEADERS)) {
    it(`redacts the ${name} header in request and response logs`, () => {
      for (const headers of [{ [name]: value }, { [name.toLowerCase()]: value }]) {
        const asObject = getUnwrapped({ request: { headers } });
        const asString = getUnwrapped(`response headers: ${JSON.stringify(headers)}`);

        expect(asObject).to.not.contain(value);
        expect(asString).to.not.contain(value);
      }
    });
  }

  it('redacts a persisted DPoP nonce field', () => {
    const result = getUnwrapped({ username: 'user@example.com', dpopNonce: 'opaque-dpop-nonce-value' });

    expect(result).to.contain('user@example.com');
    expect(result).to.not.contain('opaque-dpop-nonce-value');
  });
});
