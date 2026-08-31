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

import {
  ApexSymbolsMaterializedControls,
  ApexSymbolsStreamResponse,
  ApexTypeStub,
  ApexTypeStubResponse,
} from './apexSymbols';
import {
  DEFAULT_APEX_SYMBOLS_MAX_STUB_BYTES,
  DEFAULT_APEX_SYMBOLS_MAX_TYPE_STUBS,
  iterateApexTypeStubs,
} from './apexTypeStubIterator';

export { APEX_SYMBOLS_MALFORMED_RESPONSE_ERROR } from './apexSymbolsErrors';
export { DEFAULT_APEX_SYMBOLS_MAX_STUB_BYTES, DEFAULT_APEX_SYMBOLS_MAX_TYPE_STUBS } from './apexTypeStubIterator';

export const DEFAULT_APEX_SYMBOLS_MATERIALIZED_MAX_RESPONSE_BYTES = 64 * 1024 * 1024;

export const materializeApexSymbolsResponse = async (
  response: ApexSymbolsStreamResponse,
  controls?: ApexSymbolsMaterializedControls
): Promise<ApexTypeStubResponse> => {
  const typeStubs: ApexTypeStub[] = [];
  for await (const typeStub of iterateApexTypeStubs(response.body, {
    maxResponseBytes: controls?.maxResponseBytes ?? DEFAULT_APEX_SYMBOLS_MATERIALIZED_MAX_RESPONSE_BYTES,
    maxTypeStubs: controls?.maxTypeStubs ?? DEFAULT_APEX_SYMBOLS_MAX_TYPE_STUBS,
    maxStubBytes: controls?.maxStubBytes ?? DEFAULT_APEX_SYMBOLS_MAX_STUB_BYTES,
    ...(controls?.signal ? { signal: controls.signal } : {}),
  })) {
    typeStubs.push(typeStub);
  }

  return { typeStubs } satisfies ApexTypeStubResponse;
};
