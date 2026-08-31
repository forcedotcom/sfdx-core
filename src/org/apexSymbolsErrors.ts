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

import { SfError } from '../sfError';
import { ApexSymbolsStreamResponse } from './apexSymbols';
import { APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR } from './apexSymbolsTransport';

export const APEX_SYMBOLS_ENDPOINT_UNAVAILABLE_ERROR = 'ApexSymbolsEndpointUnavailableError';
export const APEX_SYMBOLS_REQUEST_IN_PROGRESS_ERROR = 'ApexSymbolsRequestInProgressError';
export const APEX_SYMBOLS_REQUEST_ERROR = 'ApexSymbolsRequestError';
export const APEX_SYMBOLS_MALFORMED_RESPONSE_ERROR = 'ApexSymbolsMalformedResponseError';

const MINIMUM_ORG_RELEASE = 264;
const MAX_ERROR_RESPONSE_BYTES = 1024 * 1024;
const REQUEST_IN_PROGRESS_CODE = 'UNKNOWN_EXCEPTION';
const REQUEST_IN_PROGRESS_MESSAGE = 'Symbol table request already in progress for this org. Please retry later.';

type SalesforceError = {
  readonly message: string;
  readonly errorCode: string;
};

const isSalesforceError = (value: unknown): value is SalesforceError =>
  typeof value === 'object' &&
  value !== null &&
  'message' in value &&
  typeof value.message === 'string' &&
  'errorCode' in value &&
  typeof value.errorCode === 'string';

const parseSalesforceErrors = (body: string): SalesforceError[] => {
  try {
    const parsed: unknown = JSON.parse(body);
    if (Array.isArray(parsed)) {
      return parsed.filter(isSalesforceError);
    }
    return isSalesforceError(parsed) ? [parsed] : [];
  } catch {
    return [];
  }
};

const readErrorBody = async (response: ApexSymbolsStreamResponse): Promise<string> => {
  const chunks: Uint8Array[] = [];
  let bytes = 0;

  for await (const chunk of response.body) {
    bytes += chunk.byteLength;
    if (bytes > MAX_ERROR_RESPONSE_BYTES) {
      response.cancel();
      throw new SfError(
        `The Apex Symbols error response exceeded the ${MAX_ERROR_RESPONSE_BYTES}-byte limit.`,
        APEX_SYMBOLS_RESPONSE_TOO_LARGE_ERROR
      );
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
};

const serverCause = (error: SalesforceError | undefined, statusCode: number): Error => {
  const cause = new Error(error?.message ?? `Apex Symbols request failed with HTTP status ${statusCode}.`);
  cause.name = error?.errorCode ?? `HTTP_${statusCode}`;
  return cause;
};

export const throwIfApexSymbolsErrorResponse = async (response: ApexSymbolsStreamResponse): Promise<void> => {
  if (response.statusCode < 400) {
    return;
  }

  const responseBody = await readErrorBody(response);
  const errors = parseSalesforceErrors(responseBody);
  const firstError = errors[0];
  const cause = serverCause(firstError, response.statusCode);
  const data = {
    statusCode: response.statusCode,
    apiVersion: response.apiVersion,
    errors,
  };

  if (firstError?.errorCode === REQUEST_IN_PROGRESS_CODE && firstError.message === REQUEST_IN_PROGRESS_MESSAGE) {
    throw SfError.create({
      message: firstError.message,
      name: APEX_SYMBOLS_REQUEST_IN_PROGRESS_ERROR,
      cause,
      data,
    });
  }

  if (response.statusCode === 404) {
    throw SfError.create({
      message:
        `The Apex Symbols endpoint is unavailable at REST API version ${response.apiVersion}. ` +
        `The org might be older than core release ${MINIMUM_ORG_RELEASE}.`,
      name: APEX_SYMBOLS_ENDPOINT_UNAVAILABLE_ERROR,
      cause,
      data: { ...data, minimumOrgRelease: MINIMUM_ORG_RELEASE },
    });
  }

  throw SfError.create({
    message: firstError?.message ?? cause.message,
    name: APEX_SYMBOLS_REQUEST_ERROR,
    cause,
    data,
  });
};
