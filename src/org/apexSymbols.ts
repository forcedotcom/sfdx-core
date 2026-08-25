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

export const apexSymbolCategories = ['BUILTIN', 'DATABASE', 'DYNAMIC'] as const;
export type ApexSymbolCategory = (typeof apexSymbolCategories)[number];

export const apexTypeKinds = ['CLASS', 'INTERFACE', 'ENUM', 'TRIGGER'] as const;
export type ApexTypeKind = (typeof apexTypeKinds)[number];

export type ApexSymbolsRequest = {
  readonly category: ApexSymbolCategory;
  readonly namespace?: string;
  readonly name?: string;
};

export type ApexSymbolsTransportControls = {
  readonly timeoutMs?: number;
  readonly idleTimeoutMs?: number;
  readonly maxResponseBytes?: number;
  readonly signal?: AbortSignal;
};

export type ApexSymbolsMaterializedControls = ApexSymbolsTransportControls & {
  readonly mode: 'materialized';
  readonly maxTypeStubs?: number;
  readonly maxStubBytes?: number;
};

export type ApexSymbolsStreamControls = ApexSymbolsTransportControls & {
  readonly mode: 'stream';
};

export type ApexSymbolsRequestControls = ApexSymbolsMaterializedControls | ApexSymbolsStreamControls;

export type ApexTypeStubIterationOptions = {
  readonly maxResponseBytes?: number;
  readonly maxTypeStubs?: number;
  readonly maxStubBytes?: number;
  readonly signal?: AbortSignal;
};

export type ApexTypeReference = {
  readonly namespacePrefix?: string | null;
  readonly name: string;
  readonly typeParameters?: readonly ApexTypeReference[] | null;
};

export type ApexAnnotationParameterStub = {
  readonly name: string;
  readonly type: ApexTypeReference;
  readonly value: string;
};

export type ApexAnnotationStub = {
  readonly name: string;
  readonly parameters: readonly ApexAnnotationParameterStub[];
  readonly documentation?: string | null;
};

export type ApexParameterStub = {
  readonly name?: string | null;
  readonly type?: ApexTypeReference | null;
  readonly annotations: readonly ApexAnnotationStub[];
  readonly documentation?: string | null;
};

export type ApexAccessorStub = {
  readonly modifiers: readonly string[];
  readonly documentation?: string | null;
};

export type ApexFieldStub = {
  readonly name: string;
  readonly type?: ApexTypeReference | null;
  readonly modifiers: readonly string[];
  readonly annotations: readonly ApexAnnotationStub[];
  readonly documentation?: string | null;
  readonly definingType?: ApexTypeReference | null;
};

export type ApexPropertyStub = {
  readonly name: string;
  readonly type?: ApexTypeReference | null;
  readonly modifiers: readonly string[];
  readonly annotations: readonly ApexAnnotationStub[];
  readonly getter?: ApexAccessorStub | null;
  readonly setter?: ApexAccessorStub | null;
  readonly documentation?: string | null;
  readonly definingType?: ApexTypeReference | null;
};

export type ApexMethodStub = {
  readonly name: string;
  readonly isConstructor?: boolean | null;
  readonly returnType?: ApexTypeReference | null;
  readonly modifiers: readonly string[];
  readonly annotations: readonly ApexAnnotationStub[];
  readonly parameters: readonly ApexParameterStub[];
  readonly documentation?: string | null;
  readonly definingType?: ApexTypeReference | null;
};

type ApexTypeStubIdentity = {
  readonly name: string;
  readonly namespacePrefix: string | null;
  readonly typeParameters?: readonly ApexTypeReference[] | null;
  readonly documentation?: string | null;
};

export type ApexResolvedTypeStub = ApexTypeStubIdentity & {
  readonly compileError?: null;
  readonly kind: ApexTypeKind;
  readonly modifiers: readonly string[];
  readonly annotations: readonly ApexAnnotationStub[];
  readonly superClass?: ApexTypeReference | null;
  readonly interfaces: readonly ApexTypeReference[];
  readonly fields: readonly ApexFieldStub[];
  readonly properties: readonly ApexPropertyStub[];
  readonly methods: readonly ApexMethodStub[];
  readonly innerTypes: readonly ApexTypeStub[];
  readonly triggerOperations?: readonly string[] | null;
  readonly triggerObjectType?: ApexTypeReference | null;
};

export type ApexCompileErrorTypeStub = ApexTypeStubIdentity & {
  readonly compileError: string;
  readonly kind?: ApexTypeKind | null;
  readonly modifiers?: readonly string[] | null;
  readonly annotations?: readonly ApexAnnotationStub[] | null;
  readonly superClass?: ApexTypeReference | null;
  readonly interfaces?: readonly ApexTypeReference[] | null;
  readonly fields?: readonly ApexFieldStub[] | null;
  readonly properties?: readonly ApexPropertyStub[] | null;
  readonly methods?: readonly ApexMethodStub[] | null;
  readonly innerTypes?: readonly ApexTypeStub[] | null;
  readonly triggerOperations?: readonly string[] | null;
  readonly triggerObjectType?: ApexTypeReference | null;
};

export type ApexTypeStub = ApexResolvedTypeStub | ApexCompileErrorTypeStub;

export type ApexTypeStubResponse = {
  readonly typeStubs: readonly ApexTypeStub[];
};

export type ApexSymbolsStreamResponse = {
  readonly apiVersion: string;
  readonly statusCode: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: AsyncIterable<Uint8Array>;
  readonly cancel: (reason?: unknown) => void;
};

export const buildApexSymbolsUrl = (instanceUrl: string, apiVersion: string, request: ApexSymbolsRequest): string => {
  const url = new URL(`/services/data/v${apiVersion}/tooling/symbols`, instanceUrl);
  url.searchParams.set('category', request.category);

  if (request.namespace !== undefined) {
    url.searchParams.set('namespace', request.namespace);
  }
  if (request.name !== undefined) {
    url.searchParams.set('name', request.name);
  }

  return url.toString();
};
