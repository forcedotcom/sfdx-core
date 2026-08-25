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

import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { expect } from 'chai';
import { APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR } from '../../../src/org/apexSymbolsTransport';

type MemoryResult = {
  emitted: number;
  totalResponseBytes: number;
  peakRss: number;
  materializedError?: string;
};

const runMemoryFixture = async (): Promise<MemoryResult> =>
  new Promise((resolvePromise, reject) => {
    execFile(
      process.execPath,
      [
        '--max-old-space-size=96',
        '-r',
        'ts-node/register/transpile-only',
        resolve('test/unit/org/apexTypeStubMemory.fixture.ts'),
      ],
      { timeout: 20_000 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Apex Symbols memory fixture failed: ${stderr || error.message}`));
          return;
        }
        resolvePromise(JSON.parse(stdout) as MemoryResult);
      }
    );
  });

describe('Apex type-stub iterator memory', () => {
  it('consumes a response larger than the heap and bounds materialization', async () => {
    const result = await runMemoryFixture();

    expect(result.emitted).to.equal(2_048);
    expect(result.totalResponseBytes).to.be.greaterThan(128 * 1024 * 1024 - 1);
    expect(result.peakRss).to.be.lessThan(256 * 1024 * 1024);
    expect(result.materializedError).to.equal(APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR);
  });
});
