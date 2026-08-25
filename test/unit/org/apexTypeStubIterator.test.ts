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
import { shouldThrow } from '../../../src/testSetup';
import { APEX_SYMBOLS_MALFORMED_RESPONSE_ERROR } from '../../../src/org/apexSymbolsErrors';
import {
  APEX_SYMBOLS_REQUEST_ABORTED_ERROR,
  APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR,
} from '../../../src/org/apexSymbolsTransport';
import { iterateApexTypeStubs } from '../../../src/org/apexTypeStubIterator';

const bodyFor = (json: string, chunkBytes = json.length): AsyncIterable<Uint8Array> =>
  (async function* (): AsyncIterable<Uint8Array> {
    const bytes = Buffer.from(json);
    for (let offset = 0; offset < bytes.byteLength; offset += chunkBytes) {
      yield bytes.subarray(offset, offset + chunkBytes);
    }
  })();

const collect = async (body: AsyncIterable<unknown>): Promise<unknown[]> => {
  const values: unknown[] = [];
  for await (const value of body) {
    values.push(value);
  }
  return values;
};

describe('Apex type-stub iterator', () => {
  it('emits stubs across one-byte UTF-8 boundaries without retaining the envelope', async () => {
    const values = await collect(
      iterateApexTypeStubs(
        bodyFor(
          '{"requestId":"ignored","typeStubs":[{"name":"Café","compileError":null},{"name":"Broken","compileError":"bad"}],"more":"ignored"}',
          1
        )
      )
    );

    expect(values).to.deep.equal([
      { name: 'Café', compileError: null },
      { name: 'Broken', compileError: 'bad' },
    ]);
  });

  it('does not pull another upstream chunk until the emitted stub is consumed', async () => {
    let pulls = 0;
    let sourceClosed = false;
    const body = (async function* (): AsyncIterable<Uint8Array> {
      try {
        pulls += 1;
        yield Buffer.from('{"typeStubs":[{"name":"One"}');
        pulls += 1;
        yield Buffer.from(',{"name":"Two"}]}');
      } finally {
        sourceClosed = true;
      }
    })();
    const iterator = iterateApexTypeStubs(body)[Symbol.asyncIterator]();

    expect(await iterator.next()).to.deep.include({ done: false, value: { name: 'One' } });
    expect(pulls).to.equal(1);

    await iterator.return?.();
    expect(sourceClosed).to.be.true;
  });

  it('accepts an empty typeStubs array', async () => {
    expect(await collect(iterateApexTypeStubs(bodyFor('{"typeStubs":[]}')))).to.deep.equal([]);
  });

  for (const [description, json] of [
    ['a non-object envelope', '[]'],
    ['a missing typeStubs field', '{"other":[]}'],
    ['a non-array typeStubs field', '{"typeStubs":{}}'],
    ['a duplicate typeStubs field', '{"typeStubs":[],"typeStubs":[]}'],
    ['a non-object type stub', '{"typeStubs":[null]}'],
    ['a truncated response', '{"typeStubs":[{"name":"A"}'],
    ['trailing JSON', '{"typeStubs":[]}{}'],
  ] as const) {
    it(`rejects ${description}`, async () => {
      try {
        await shouldThrow(collect(iterateApexTypeStubs(bodyFor(json, 1))));
      } catch (error) {
        expect(error).to.have.property('name', APEX_SYMBOLS_MALFORMED_RESPONSE_ERROR);
      }
    });
  }

  it('enforces the total response byte limit', async () => {
    try {
      await shouldThrow(collect(iterateApexTypeStubs(bodyFor('{"typeStubs":[]}'), { maxResponseBytes: 5 })));
    } catch (error) {
      expect(error).to.have.property('name', APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR);
    }
  });

  it('enforces the type-stub count limit before emitting an extra stub', async () => {
    try {
      await shouldThrow(collect(iterateApexTypeStubs(bodyFor('{"typeStubs":[{},{}]}'), { maxTypeStubs: 1 })));
    } catch (error) {
      expect(error).to.have.property('name', APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR);
    }
  });

  it('enforces the per-stub byte limit while a stub is still being parsed', async () => {
    let sourceClosed = false;
    const body = (async function* (): AsyncIterable<Uint8Array> {
      try {
        yield Buffer.from(`{"typeStubs":[{"documentation":"${'x'.repeat(100_000)}"}]}`);
      } finally {
        sourceClosed = true;
      }
    })();

    try {
      await shouldThrow(collect(iterateApexTypeStubs(body, { maxStubBytes: 1_000 })));
    } catch (error) {
      expect(error).to.have.property('name', APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR);
      expect(sourceClosed).to.be.true;
    }
  });

  it('honors a pre-aborted signal without pulling from the body', async () => {
    let pulled = false;
    const body = (async function* (): AsyncIterable<Uint8Array> {
      pulled = true;
      yield Buffer.from('{"typeStubs":[]}');
    })();
    const controller = new AbortController();
    controller.abort();

    try {
      await shouldThrow(collect(iterateApexTypeStubs(body, { signal: controller.signal })));
    } catch (error) {
      expect(error).to.have.property('name', APEX_SYMBOLS_REQUEST_ABORTED_ERROR);
      expect(pulled).to.be.false;
    }
  });
});
