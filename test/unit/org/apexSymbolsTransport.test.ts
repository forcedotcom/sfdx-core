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

import { createServer, Server, ServerResponse } from 'node:http';
import { AddressInfo } from 'node:net';
import { gzipSync } from 'node:zlib';
import { expect } from 'chai';
import { shouldThrow } from '../../../src/testSetup';
import {
  APEX_SYMBOLS_IDLE_TIMEOUT_ERROR,
  APEX_SYMBOLS_REQUEST_ABORTED_ERROR,
  APEX_SYMBOLS_REQUEST_TIMEOUT_ERROR,
  APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR,
  ApexSymbolsTransportMetrics,
  ApexSymbolsTransportRequest,
  requestApexSymbolsStream,
} from '../../../src/org/apexSymbolsTransport';

const defaultRequest = (url: string): ApexSymbolsTransportRequest => ({
  url,
  apiVersion: '68.0',
  headers: {},
  timeoutMs: 2_000,
  idleTimeoutMs: 1_000,
  maxResponseBytes: 1_000_000,
});

const collect = async (body: AsyncIterable<Uint8Array>): Promise<string> => {
  const chunks: Uint8Array[] = [];
  for await (const chunk of body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
};

describe('Apex Symbols transport', () => {
  let server: Server | undefined;

  const listen = async (handler: (response: ServerResponse) => void): Promise<string> => {
    server = createServer((_request, response) => handler(response));
    await new Promise<void>((resolve, reject) => {
      server?.once('error', reject);
      server?.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address() as AddressInfo;
    return `http://127.0.0.1:${address.port}`;
  };

  afterEach(async () => {
    server?.closeAllConnections();
    await new Promise<void>((resolve) => server?.close(() => resolve()) ?? resolve());
    server = undefined;
  });

  it('emits bytes before the HTTP response completes', async () => {
    let responseEnded = false;
    let metrics: ApexSymbolsTransportMetrics | undefined;
    const url = await listen((response) => {
      response.writeHead(200, { 'content-type': 'application/json', 'x-sfdc-request-id': 'request-123' });
      response.write('{"typeStubs":[');
      setTimeout(() => {
        responseEnded = true;
        response.end(']}');
      }, 100);
    });

    const response = await requestApexSymbolsStream({
      ...defaultRequest(url),
      onComplete: (value): void => {
        metrics = value;
      },
    });
    const iterator = response.body[Symbol.asyncIterator]();
    const first = await iterator.next();

    if (first.done) {
      expect.fail('Expected the first response chunk before stream completion.');
    }
    expect(Buffer.from(first.value).toString('utf8')).to.equal('{"typeStubs":[');
    expect(responseEnded).to.be.false;

    const remaining = await collect({ [Symbol.asyncIterator]: () => iterator });
    expect(remaining).to.equal(']}');
    expect(metrics).to.deep.include({
      apiVersion: '68.0',
      statusCode: 200,
      responseBytes: Buffer.byteLength('{"typeStubs":[]}'),
      requestId: 'request-123',
    });
    expect(metrics?.timeToFirstByteMs).to.be.a('number');
    expect(metrics?.totalTimeMs).to.be.a('number');
  });

  it('cancels the underlying HTTP request', async () => {
    let resolveClosed: (() => void) | undefined;
    const closed = new Promise<void>((resolve) => {
      resolveClosed = resolve;
    });
    const url = await listen((response) => {
      response.writeHead(200, { 'content-type': 'application/json' });
      const interval = setInterval(() => response.write('data'), 10);
      response.once('close', () => {
        clearInterval(interval);
        resolveClosed?.();
      });
    });

    const response = await requestApexSymbolsStream(defaultRequest(url));
    const iterator = response.body[Symbol.asyncIterator]();
    await iterator.next();
    response.cancel();
    await closed;
    await iterator.return?.();
  });

  it('does not retry HTTP 420 responses', async () => {
    let requestCount = 0;
    const url = await listen((response) => {
      requestCount += 1;
      response.writeHead(420, { 'content-type': 'application/json' });
      response.end('[]');
    });

    const response = await requestApexSymbolsStream(defaultRequest(url));

    expect(response.statusCode).to.equal(420);
    expect(await collect(response.body)).to.equal('[]');
    expect(requestCount).to.equal(1);
  });

  it('rejects a response whose content-length exceeds the byte limit', async () => {
    const url = await listen((response) => {
      response.writeHead(200, { 'content-type': 'application/json', 'content-length': '20' });
      response.end('x'.repeat(20));
    });

    try {
      await shouldThrow(requestApexSymbolsStream({ ...defaultRequest(url), maxResponseBytes: 10 }));
    } catch (error) {
      expect(error).to.have.property('name', APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR);
    }
  });

  it('enforces the incremental byte limit when content-length is absent', async () => {
    const url = await listen((response) => {
      response.writeHead(200, { 'content-type': 'application/json', 'transfer-encoding': 'chunked' });
      response.write('123456');
      response.end('7890');
    });
    const response = await requestApexSymbolsStream({ ...defaultRequest(url), maxResponseBytes: 5 });

    try {
      await shouldThrow(collect(response.body));
    } catch (error) {
      expect(error).to.have.property('name', APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR);
    }
  });

  it('enforces the byte limit against the decompressed response', async () => {
    const compressed = gzipSync('x'.repeat(10_000));
    const url = await listen((response) => {
      response.writeHead(200, {
        'content-type': 'application/json',
        'content-encoding': 'gzip',
        'content-length': compressed.byteLength,
      });
      response.end(compressed);
    });
    const response = await requestApexSymbolsStream({ ...defaultRequest(url), maxResponseBytes: 5_000 });

    try {
      await shouldThrow(collect(response.body));
    } catch (error) {
      expect(error).to.have.property('name', APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR);
    }
  });

  it('aborts when the total timeout expires before response headers arrive', async () => {
    const url = await listen((response) => {
      setTimeout(() => response.end('{}'), 200);
    });

    try {
      await shouldThrow(requestApexSymbolsStream({ ...defaultRequest(url), timeoutMs: 25 }));
    } catch (error) {
      expect(error).to.have.property('name', APEX_SYMBOLS_REQUEST_TIMEOUT_ERROR);
    }
  });

  it('aborts an idle response', async () => {
    const url = await listen((response) => {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.write('first');
      setTimeout(() => response.end('second'), 200);
    });
    const response = await requestApexSymbolsStream({ ...defaultRequest(url), idleTimeoutMs: 25 });
    const iterator = response.body[Symbol.asyncIterator]();
    await iterator.next();

    try {
      await shouldThrow(iterator.next());
    } catch (error) {
      expect(error).to.have.property('name', APEX_SYMBOLS_IDLE_TIMEOUT_ERROR);
    }
  });

  it('does not send an already-aborted request', async () => {
    const controller = new AbortController();
    controller.abort();

    try {
      await shouldThrow(
        requestApexSymbolsStream({ ...defaultRequest('http://127.0.0.1:1'), signal: controller.signal })
      );
    } catch (error) {
      expect(error).to.have.property('name', APEX_SYMBOLS_REQUEST_ABORTED_ERROR);
    }
  });
});
