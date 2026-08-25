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

import { expect } from 'chai';
import { ApexSymbolsStreamResponse } from '../../../src/org/apexSymbols';
import {
  APEX_SYMBOLS_MALFORMED_RESPONSE_ERROR,
  materializeApexSymbolsResponse,
} from '../../../src/org/apexSymbolsMaterializer';
import { APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR } from '../../../src/org/apexSymbolsTransport';
import { shouldThrow } from '../../../src/testSetup';

const responseFor = (body: string): ApexSymbolsStreamResponse => ({
  apiVersion: '68.0',
  statusCode: 200,
  headers: { 'content-type': 'application/json' },
  body: (async function* (): AsyncIterable<Uint8Array> {
    const midpoint = Math.floor(body.length / 2);
    yield Buffer.from(body.slice(0, midpoint));
    yield Buffer.from(body.slice(midpoint));
  })(),
  cancel: () => undefined,
});

describe('Apex Symbols materializer', () => {
  it('materializes a typed response split across chunks', async () => {
    const result = await materializeApexSymbolsResponse(responseFor('{"typeStubs":[]}'), { mode: 'materialized' });

    expect(result).to.deep.equal({ typeStubs: [] });
  });

  it('uses TYPE_STUB as the sole materialized response contract', async () => {
    const result = await materializeApexSymbolsResponse(responseFor('{"typeStubs":[]}'));

    expect(result).to.deep.equal({ typeStubs: [] });
  });

  it('rejects malformed JSON', async () => {
    try {
      await shouldThrow(materializeApexSymbolsResponse(responseFor('{')));
    } catch (error) {
      expect(error).to.have.property('name', APEX_SYMBOLS_MALFORMED_RESPONSE_ERROR);
    }
  });

  it('rejects an invalid TYPE_STUB envelope', async () => {
    try {
      await shouldThrow(materializeApexSymbolsResponse(responseFor('{"typeStubs":{}}')));
    } catch (error) {
      expect(error).to.have.property('name', APEX_SYMBOLS_MALFORMED_RESPONSE_ERROR);
    }
  });

  it('enforces the type-stub count limit', async () => {
    try {
      await shouldThrow(
        materializeApexSymbolsResponse(responseFor('{"typeStubs":[{},{}]}'), { mode: 'materialized', maxTypeStubs: 1 })
      );
    } catch (error) {
      expect(error).to.have.property('name', APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR);
    }
  });

  it('enforces the per-stub byte limit', async () => {
    try {
      await shouldThrow(
        materializeApexSymbolsResponse(responseFor('{"typeStubs":[{"name":"LongClassName"}]}'), {
          mode: 'materialized',
          maxStubBytes: 5,
        })
      );
    } catch (error) {
      expect(error).to.have.property('name', APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR);
    }
  });
});
