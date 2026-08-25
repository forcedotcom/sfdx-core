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
  APEX_SYMBOLS_ENDPOINT_UNAVAILABLE_ERROR,
  APEX_SYMBOLS_REQUEST_ERROR,
  APEX_SYMBOLS_REQUEST_IN_PROGRESS_ERROR,
  throwIfApexSymbolsErrorResponse,
} from '../../../src/org/apexSymbolsErrors';
import { APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR } from '../../../src/org/apexSymbolsTransport';
import { shouldThrow } from '../../../src/testSetup';

const responseFor = (statusCode: number, body: string): ApexSymbolsStreamResponse => ({
  apiVersion: '68.0',
  statusCode,
  headers: {},
  body: (async function* (): AsyncIterable<Uint8Array> {
    yield Buffer.from(body);
  })(),
  cancel: () => undefined,
});

describe('Apex Symbols errors', () => {
  it('does not consume successful responses', async () => {
    let consumed = false;
    const response: ApexSymbolsStreamResponse = {
      ...responseFor(200, ''),
      body: (async function* (): AsyncIterable<Uint8Array> {
        consumed = true;
        yield Buffer.from('success');
      })(),
    };

    await throwIfApexSymbolsErrorResponse(response);

    expect(consumed).to.be.false;
  });

  it('maps the exact server concurrency error without retrying it', async () => {
    const response = responseFor(
      500,
      JSON.stringify([
        {
          message: 'Symbol table request already in progress for this org. Please retry later.',
          errorCode: 'UNKNOWN_EXCEPTION',
        },
      ])
    );

    try {
      await shouldThrow(throwIfApexSymbolsErrorResponse(response));
    } catch (error) {
      expect(error).to.have.property('name', APEX_SYMBOLS_REQUEST_IN_PROGRESS_ERROR);
      expect(error).to.have.nested.property('cause.name', 'UNKNOWN_EXCEPTION');
    }
  });

  it('does not misclassify other UNKNOWN_EXCEPTION responses', async () => {
    const response = responseFor(
      500,
      JSON.stringify([{ message: 'A different server failure.', errorCode: 'UNKNOWN_EXCEPTION' }])
    );

    try {
      await shouldThrow(throwIfApexSymbolsErrorResponse(response));
    } catch (error) {
      expect(error).to.have.property('name', APEX_SYMBOLS_REQUEST_ERROR);
      expect(error).to.have.nested.property('cause.name', 'UNKNOWN_EXCEPTION');
    }
  });

  it('maps route-level 404 responses to the minimum-release error', async () => {
    const response = responseFor(404, JSON.stringify([{ message: 'Not Found', errorCode: 'NOT_FOUND' }]));

    try {
      await shouldThrow(throwIfApexSymbolsErrorResponse(response));
    } catch (error) {
      expect(error).to.have.property('name', APEX_SYMBOLS_ENDPOINT_UNAVAILABLE_ERROR);
      expect(error).to.have.nested.property('data.minimumOrgRelease', 264);
      expect(error).to.have.nested.property('data.apiVersion', '68.0');
    }
  });

  it('bounds malformed HTTP error bodies', async () => {
    const response = responseFor(500, 'x'.repeat(1024 * 1024 + 1));

    try {
      await shouldThrow(throwIfApexSymbolsErrorResponse(response));
    } catch (error) {
      expect(error).to.have.property('name', APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR);
    }
  });
});
