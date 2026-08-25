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

import { JSONParser, ParsedElementInfo, ParsedTokenInfo, TokenType } from '@streamparser/json';
import { SfError } from '../sfError';
import { ApexTypeStub, ApexTypeStubIterationOptions } from './apexSymbols';
import { APEX_SYMBOLS_MALFORMED_RESPONSE_ERROR } from './apexSymbolsErrors';
import {
  APEX_SYMBOLS_INVALID_CONTROL_ERROR,
  APEX_SYMBOLS_REQUEST_ABORTED_ERROR,
  APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR,
  DEFAULT_APEX_SYMBOLS_MAX_RESPONSE_BYTES,
} from './apexSymbolsTransport';

export const DEFAULT_APEX_SYMBOLS_MAX_TYPE_STUBS = 10_000;
export const DEFAULT_APEX_SYMBOLS_MAX_STUB_BYTES = 8 * 1024 * 1024;

const PARSER_CHUNK_BYTES = 64 * 1024;

const validatePositiveInteger = (value: number, name: string): void => {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new SfError(
      `Apex Symbols ${name} must be a positive integer. Received ${value}.`,
      APEX_SYMBOLS_INVALID_CONTROL_ERROR
    );
  }
};

const malformedResponse = (message: string, cause?: unknown): SfError =>
  SfError.create({
    message,
    name: APEX_SYMBOLS_MALFORMED_RESPONSE_ERROR,
    ...(cause instanceof Error ? { cause } : {}),
  });

const responseTooLarge = (message: string): SfError => new SfError(message, APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR);

const requestAborted = (reason?: unknown): SfError =>
  SfError.create({
    message: 'Apex Symbols type-stub iteration was aborted.',
    name: APEX_SYMBOLS_REQUEST_ABORTED_ERROR,
    ...(reason instanceof Error ? { cause: reason } : {}),
  });

const isApexTypeStub = (value: unknown): value is ApexTypeStub =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isContainerStart = (token: TokenType): boolean =>
  token === TokenType.LEFT_BRACE || token === TokenType.LEFT_BRACKET;

const isContainerEnd = (token: TokenType): boolean =>
  token === TokenType.RIGHT_BRACE || token === TokenType.RIGHT_BRACKET;

type EnvelopeTrackingState = {
  readonly containers: TokenType[];
  rootStarted: boolean;
  rootEnded: boolean;
  expectingRootKey: boolean;
  awaitingTypeStubsValue: boolean;
  typeStubsState: 'missing' | 'in-array' | 'complete';
  typeStubsArrayDepth?: number;
  currentStubStart?: number;
  completedStubBytes?: number;
};

const trackRootToken = (state: EnvelopeTrackingState, { token, value }: ParsedTokenInfo): void => {
  const atRoot = state.containers.length === 1 && state.containers[0] === TokenType.LEFT_BRACE;
  if (!atRoot) {
    return;
  }

  if (state.expectingRootKey) {
    if (token === TokenType.RIGHT_BRACE) {
      state.rootEnded = true;
    } else if (token === TokenType.STRING) {
      state.expectingRootKey = false;
      if (value === 'typeStubs') {
        if (state.typeStubsState !== 'missing' || state.awaitingTypeStubsValue) {
          throw malformedResponse('The Apex Symbols TYPE_STUB response contains more than one typeStubs field.');
        }
        state.awaitingTypeStubsValue = true;
      }
    }
    return;
  }

  if (state.awaitingTypeStubsValue && token !== TokenType.COLON) {
    if (token !== TokenType.LEFT_BRACKET) {
      throw malformedResponse('The Apex Symbols TYPE_STUB response did not contain a typeStubs array.');
    }
    state.awaitingTypeStubsValue = false;
    state.typeStubsState = 'in-array';
    state.typeStubsArrayDepth = state.containers.length + 1;
  } else if (token === TokenType.COMMA) {
    state.expectingRootKey = true;
  } else if (token === TokenType.RIGHT_BRACE) {
    state.rootEnded = true;
  }
};

const trackTypeStubArrayToken = (state: EnvelopeTrackingState, { token, offset }: ParsedTokenInfo): void => {
  if (state.typeStubsState !== 'in-array' || state.containers.length !== state.typeStubsArrayDepth) {
    return;
  }

  if (token === TokenType.RIGHT_BRACKET) {
    state.typeStubsState = 'complete';
    state.typeStubsArrayDepth = undefined;
  } else if (token !== TokenType.COMMA && state.currentStubStart === undefined) {
    state.currentStubStart = offset;
  }
};

const trackCompletedStub = (state: EnvelopeTrackingState, { token, offset }: ParsedTokenInfo): void => {
  if (
    state.currentStubStart !== undefined &&
    state.containers.length === (state.typeStubsArrayDepth ?? 0) + 1 &&
    isContainerEnd(token)
  ) {
    state.completedStubBytes = offset + 1 - state.currentStubStart;
  }
};

const updateContainers = (containers: TokenType[], token: TokenType): void => {
  if (isContainerStart(token)) {
    containers.push(token);
  } else if (isContainerEnd(token)) {
    containers.pop();
  }
};

const trackEnvelopeToken = (state: EnvelopeTrackingState, tokenInfo: ParsedTokenInfo): void => {
  if (!state.rootStarted) {
    if (tokenInfo.token !== TokenType.LEFT_BRACE) {
      throw malformedResponse('The Apex Symbols TYPE_STUB response must be a JSON object.');
    }
    state.rootStarted = true;
    state.containers.push(tokenInfo.token);
    return;
  }

  trackRootToken(state, tokenInfo);
  trackTypeStubArrayToken(state, tokenInfo);
  trackCompletedStub(state, tokenInfo);
  updateContainers(state.containers, tokenInfo.token);
};

/**
 * Incrementally parses the `typeStubs` array from a Tooling Apex Symbols `TYPE_STUB` response.
 *
 * Completed stubs are emitted without retaining the response envelope or previously emitted siblings. Stopping
 * iteration early closes the supplied async iterator, which cancels an `ApexSymbolsStreamResponse.body` upstream.
 *
 * @example
 * ```ts
 * const response = await connection.retrieveApexSymbols(
 *   { category: 'DATABASE' },
 *   { mode: 'stream' }
 * );
 * for await (const stub of iterateApexTypeStubs(response.body)) {
 *   console.log(stub.namespacePrefix, stub.name);
 * }
 * ```
 *
 * @param body Decompressed UTF-8 response bytes, normally from `ApexSymbolsStreamResponse.body`.
 * @param options Finite response, item-count, per-item, and cancellation limits.
 */
export const iterateApexTypeStubs = async function* (
  body: AsyncIterable<Uint8Array>,
  options: ApexTypeStubIterationOptions = {}
): AsyncIterable<ApexTypeStub> {
  const maxResponseBytes = options.maxResponseBytes ?? DEFAULT_APEX_SYMBOLS_MAX_RESPONSE_BYTES;
  const maxTypeStubs = options.maxTypeStubs ?? DEFAULT_APEX_SYMBOLS_MAX_TYPE_STUBS;
  const maxStubBytes = options.maxStubBytes ?? DEFAULT_APEX_SYMBOLS_MAX_STUB_BYTES;
  validatePositiveInteger(maxResponseBytes, 'maxResponseBytes');
  validatePositiveInteger(maxTypeStubs, 'maxTypeStubs');
  validatePositiveInteger(maxStubBytes, 'maxStubBytes');

  if (options.signal?.aborted) {
    throw requestAborted(options.signal.reason);
  }

  const pending: ApexTypeStub[] = [];
  let totalBytes = 0;
  let typeStubCount = 0;
  const envelope: EnvelopeTrackingState = {
    containers: [],
    rootStarted: false,
    rootEnded: false,
    expectingRootKey: true,
    awaitingTypeStubsValue: false,
    typeStubsState: 'missing',
  };

  const checkAborted = (): void => {
    if (options.signal?.aborted) {
      throw requestAborted(options.signal.reason);
    }
  };

  const parser = new JSONParser({ paths: ['$.typeStubs.*'], keepStack: false, stringBufferSize: 64 * 1024 });
  parser.onToken = (tokenInfo): void => trackEnvelopeToken(envelope, tokenInfo);
  parser.onValue = ({ value }: ParsedElementInfo): void => {
    if (!isApexTypeStub(value)) {
      throw malformedResponse('The Apex Symbols typeStubs array contained a value that is not an object.');
    }

    typeStubCount += 1;
    if (typeStubCount > maxTypeStubs) {
      throw responseTooLarge(`The Apex Symbols response exceeded the ${maxTypeStubs}-stub limit.`);
    }

    const stubBytes = envelope.completedStubBytes ?? Buffer.byteLength(JSON.stringify(value), 'utf8');
    if (stubBytes > maxStubBytes) {
      throw responseTooLarge(
        `A type stub in the Apex Symbols response exceeded the ${maxStubBytes}-byte per-stub limit.`
      );
    }

    pending.push(value);
    envelope.currentStubStart = undefined;
    envelope.completedStubBytes = undefined;
  };

  const parse = (operation: () => void): void => {
    try {
      operation();
    } catch (error) {
      if (error instanceof SfError) {
        throw error;
      }
      throw malformedResponse('The Apex Symbols endpoint returned a malformed TYPE_STUB response.', error);
    }
  };

  for await (const chunk of body) {
    checkAborted();
    const parserChunkBytes = Math.min(PARSER_CHUNK_BYTES, maxStubBytes);

    for (let offset = 0; offset < chunk.byteLength; offset += parserChunkBytes) {
      checkAborted();
      const parserChunk = chunk.subarray(offset, offset + parserChunkBytes);
      totalBytes += parserChunk.byteLength;
      if (totalBytes > maxResponseBytes) {
        throw responseTooLarge(`The Apex Symbols response exceeded the ${maxResponseBytes}-byte limit.`);
      }

      parse(() => parser.write(parserChunk));
      if (envelope.currentStubStart !== undefined && totalBytes - envelope.currentStubStart > maxStubBytes) {
        throw responseTooLarge(
          `A type stub in the Apex Symbols response exceeded the ${maxStubBytes}-byte per-stub limit.`
        );
      }

      for (const stub of pending) {
        checkAborted();
        yield stub;
      }
      pending.length = 0;
    }
  }

  if (!parser.isEnded) {
    parse(() => parser.end());
  }
  for (const stub of pending) {
    checkAborted();
    yield stub;
  }

  if (!envelope.rootEnded || envelope.typeStubsState !== 'complete') {
    throw malformedResponse('The Apex Symbols TYPE_STUB response did not contain a complete typeStubs array.');
  }
};
