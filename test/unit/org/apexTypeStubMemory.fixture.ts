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

import { ApexSymbolsStreamResponse } from '../../../src/org/apexSymbols';
import { materializeApexSymbolsResponse } from '../../../src/org/apexSymbolsMaterializer';
import { APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR } from '../../../src/org/apexSymbolsTransport';
import { iterateApexTypeStubs } from '../../../src/org/apexTypeStubIterator';

const stubCount = 2_048;
const documentation = 'x'.repeat(64 * 1024);

const syntheticBody = (): AsyncIterable<Uint8Array> =>
  (async function* (): AsyncIterable<Uint8Array> {
    yield Buffer.from('{"typeStubs":[');
    for (let index = 0; index < stubCount; index += 1) {
      yield Buffer.from(`${index === 0 ? '' : ','}{"name":"Class${index}","documentation":"${documentation}"}`);
    }
    yield Buffer.from(']}');
  })();

const streamResponse = (): ApexSymbolsStreamResponse => ({
  apiVersion: '68.0',
  statusCode: 200,
  headers: {},
  body: syntheticBody(),
  cancel: () => undefined,
});

const run = async (): Promise<void> => {
  let emitted = 0;
  let peakRss = process.memoryUsage().rss;
  for await (const stub of iterateApexTypeStubs(syntheticBody(), {
    maxResponseBytes: 160 * 1024 * 1024,
    maxTypeStubs: stubCount,
    maxStubBytes: 70 * 1024,
  })) {
    if (!stub.name) {
      throw new Error('The memory fixture received a type stub without a name.');
    }
    emitted += 1;
    peakRss = Math.max(peakRss, process.memoryUsage().rss);
  }

  let materializedError: string | undefined;
  try {
    await materializeApexSymbolsResponse(streamResponse(), {
      mode: 'materialized',
      maxResponseBytes: 4 * 1024 * 1024,
      maxTypeStubs: stubCount,
      maxStubBytes: 70 * 1024,
    });
  } catch (error) {
    materializedError = error instanceof Error ? error.name : undefined;
  }

  process.stdout.write(
    JSON.stringify({
      emitted,
      totalResponseBytes: stubCount * documentation.length,
      peakRss,
      materializedError,
      expectedMaterializedError: APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR,
    })
  );
};

void run();
