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

import { Dispatcher, EnvHttpProxyAgent, fetch, ProxyAgent } from 'undici';
import { SfError } from '../sfError';
import { ApexSymbolsStreamResponse } from './apexSymbols';

export const APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR = 'ApexSymbolsResponseTooLargeError';
export const APEX_SYMBOLS_REQUEST_TIMEOUT_ERROR = 'ApexSymbolsRequestTimeoutError';
export const APEX_SYMBOLS_REQUEST_ABORTED_ERROR = 'ApexSymbolsRequestAbortedError';
export const APEX_SYMBOLS_IDLE_TIMEOUT_ERROR = 'ApexSymbolsIdleTimeoutError';
export const APEX_SYMBOLS_INVALID_CONTROL_ERROR = 'ApexSymbolsInvalidControlError';

export const DEFAULT_APEX_SYMBOLS_TIMEOUT_MS = 30 * 60 * 1_000;
export const DEFAULT_APEX_SYMBOLS_IDLE_TIMEOUT_MS = 60 * 1_000;
export const DEFAULT_APEX_SYMBOLS_MAX_RESPONSE_BYTES = 512 * 1024 * 1024;

export type ApexSymbolsTransportRequest = {
  readonly url: string;
  readonly apiVersion: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly timeoutMs: number;
  readonly idleTimeoutMs: number;
  readonly maxResponseBytes: number;
  readonly signal?: AbortSignal;
  readonly httpProxy?: string;
  readonly onComplete?: (metrics: ApexSymbolsTransportMetrics) => void;
};

export type ApexSymbolsTransportMetrics = {
  readonly apiVersion: string;
  readonly statusCode?: number;
  readonly timeToFirstByteMs?: number;
  readonly totalTimeMs: number;
  readonly responseBytes: number;
  readonly requestId?: string;
  readonly errorName?: string;
};

const hasEnvironmentProxy = (): boolean =>
  Boolean(
    process.env.https_proxy ?? process.env.http_proxy ?? process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY ?? undefined
  );

const createDispatcher = (httpProxy?: string): Dispatcher | undefined => {
  if (httpProxy) {
    return new ProxyAgent(httpProxy);
  }

  return hasEnvironmentProxy() ? new EnvHttpProxyAgent() : undefined;
};

const errorWithOptionalCause = (message: string, name: string, cause?: unknown): SfError =>
  SfError.create({
    message,
    name,
    ...(cause instanceof Error ? { cause } : {}),
  });

const validatePositiveInteger = (value: number, name: string): void => {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new SfError(
      `Apex Symbols ${name} must be a positive integer. Received ${value}.`,
      APEX_SYMBOLS_INVALID_CONTROL_ERROR
    );
  }
};

export const requestApexSymbolsStream = async (
  request: ApexSymbolsTransportRequest
): Promise<ApexSymbolsStreamResponse> => {
  validatePositiveInteger(request.timeoutMs, 'timeoutMs');
  validatePositiveInteger(request.idleTimeoutMs, 'idleTimeoutMs');
  validatePositiveInteger(request.maxResponseBytes, 'maxResponseBytes');

  const dispatcher = createDispatcher(request.httpProxy);
  const controller = new AbortController();
  const startedAt = performance.now();
  let abortError: SfError | undefined;
  let idleTimer: NodeJS.Timeout | undefined;
  let cleanedUp = false;
  let firstByteAt: number | undefined;
  let responseBytes = 0;
  const diagnosticState: { statusCode?: number; requestId?: string } = {};

  const cleanup = async (): Promise<void> => {
    if (cleanedUp) {
      return;
    }
    cleanedUp = true;
    clearTimeout(totalTimer);
    clearTimeout(idleTimer);
    request.signal?.removeEventListener('abort', onCallerAbort);
    await dispatcher?.close();
    try {
      request.onComplete?.({
        apiVersion: request.apiVersion,
        statusCode: diagnosticState.statusCode,
        ...(firstByteAt === undefined ? {} : { timeToFirstByteMs: firstByteAt - startedAt }),
        totalTimeMs: performance.now() - startedAt,
        responseBytes,
        ...(diagnosticState.requestId ? { requestId: diagnosticState.requestId } : {}),
        ...(abortError ? { errorName: abortError.name } : {}),
      });
    } catch {
      // Diagnostics must never change the request outcome.
    }
  };

  const abortWith = (error: SfError): void => {
    if (controller.signal.aborted) {
      return;
    }
    abortError = error;
    controller.abort(error);
  };

  const onCallerAbort = (): void => {
    abortWith(
      errorWithOptionalCause(
        'The Apex Symbols request was aborted.',
        APEX_SYMBOLS_REQUEST_ABORTED_ERROR,
        request.signal?.reason
      )
    );
  };

  if (request.signal?.aborted) {
    await dispatcher?.close();
    throw errorWithOptionalCause(
      'The Apex Symbols request was aborted before it was sent.',
      APEX_SYMBOLS_REQUEST_ABORTED_ERROR,
      request.signal.reason
    );
  }

  request.signal?.addEventListener('abort', onCallerAbort, { once: true });

  const totalTimer = setTimeout(() => {
    abortWith(
      new SfError(
        `The Apex Symbols request exceeded the ${request.timeoutMs}ms total timeout.`,
        APEX_SYMBOLS_REQUEST_TIMEOUT_ERROR
      )
    );
  }, request.timeoutMs);

  let response: Awaited<ReturnType<typeof fetch>>;
  try {
    response = await fetch(request.url, {
      method: 'GET',
      headers: request.headers,
      redirect: 'follow',
      signal: controller.signal,
      ...(dispatcher ? { dispatcher } : {}),
    });
  } catch (error) {
    await cleanup();
    throw abortError ?? error;
  }

  const headers = Object.fromEntries(response.headers.entries());
  diagnosticState.statusCode = response.status;
  diagnosticState.requestId = headers['x-sfdc-request-id'] ?? headers['x-request-id'];
  const contentLength = Number(headers['content-length']);
  const contentEncoding = headers['content-encoding'];
  if (
    (!contentEncoding || contentEncoding === 'identity') &&
    Number.isFinite(contentLength) &&
    contentLength > request.maxResponseBytes
  ) {
    const error = new SfError(
      `The Apex Symbols response content-length of ${contentLength} bytes exceeds the ${request.maxResponseBytes}-byte limit.`,
      APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR
    );
    abortWith(error);
    await response.body?.cancel(error).catch(() => undefined);
    await cleanup();
    throw error;
  }

  const body = (async function* (): AsyncIterable<Uint8Array> {
    if (!response.body) {
      await cleanup();
      return;
    }

    const reader = response.body.getReader();
    let completed = false;
    try {
      while (true) {
        idleTimer = setTimeout(() => {
          abortWith(
            new SfError(
              `The Apex Symbols response produced no data for ${request.idleTimeoutMs}ms.`,
              APEX_SYMBOLS_IDLE_TIMEOUT_ERROR
            )
          );
        }, request.idleTimeoutMs);

        let result: Awaited<ReturnType<typeof reader.read>>;
        try {
          // Sequential reads are required to preserve consumer backpressure.
          // eslint-disable-next-line no-await-in-loop
          result = await reader.read();
        } catch (error) {
          throw abortError ?? error;
        } finally {
          clearTimeout(idleTimer);
          idleTimer = undefined;
        }

        if (result.done) {
          completed = true;
          return;
        }

        firstByteAt ??= performance.now();

        const value: unknown = result.value;
        if (!(value instanceof Uint8Array)) {
          throw new TypeError('The Apex Symbols response contained a non-byte stream chunk.');
        }

        responseBytes += value.byteLength;
        if (responseBytes > request.maxResponseBytes) {
          const error = new SfError(
            `The Apex Symbols response exceeded the ${request.maxResponseBytes}-byte limit.`,
            APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR
          );
          abortWith(error);
          throw error;
        }

        yield value;
      }
    } finally {
      if (!completed && !controller.signal.aborted) {
        abortWith(new SfError('Apex Symbols response consumption stopped early.', APEX_SYMBOLS_REQUEST_ABORTED_ERROR));
      }
      if (!completed) {
        await reader.cancel(abortError).catch(() => undefined);
      }
      reader.releaseLock();
      await cleanup();
    }
  })();

  controller.signal.addEventListener(
    'abort',
    () => {
      if (response.body && !response.body.locked) {
        void response.body.cancel(abortError).catch(() => undefined);
      }
      void cleanup();
    },
    { once: true }
  );

  return {
    apiVersion: request.apiVersion,
    statusCode: response.status,
    headers,
    body,
    cancel: (reason?: unknown): void => {
      abortWith(
        errorWithOptionalCause('The Apex Symbols request was canceled.', APEX_SYMBOLS_REQUEST_ABORTED_ERROR, reason)
      );
    },
  };
};
