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
/* eslint-disable camelcase */
import { createHash, createPublicKey, webcrypto } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';
import jwt from 'jsonwebtoken';
import { SinonSandbox, SinonStub } from 'sinon';
import { HttpRequest } from '@jsforce/jsforce-node';
import { Transport } from '@jsforce/jsforce-node/lib/transport';
import { StreamPromise } from '@jsforce/jsforce-node/lib/util/promise';
import { DpopKeyStore, SecretReference, SecretStore } from '../../src/crypto/dpopKeyStore';
import { AuthInfoConfig } from '../../src/config/authInfoConfig';
import { Crypto } from '../../src/crypto/crypto';
import { AuthFields } from '../../src/org/authInfo';
import { MockTestOrgData } from '../../src/testSetup';

export type DpopProofHeader = {
  alg: string;
  typ: string;
  jwk: webcrypto.JsonWebKey;
};

export type DpopProofPayload = {
  htm: string;
  htu: string;
  jti: string;
  iat: number;
  nonce?: string;
  ath?: string;
};

export type DecodedDpopProof = {
  header: DpopProofHeader;
  payload: DpopProofPayload;
};

export type RecordedRequest = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
};

export type FakeResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body?: unknown;
};

/**
 * Returns a response for a recorded request, or undefined to let the next handler try.
 */
export type FakeRoute = (request: RecordedRequest, requests: RecordedRequest[]) => FakeResponse | undefined;

/**
 * Secret store that keeps everything in memory so tests never touch the OS keychain.
 */
export class InMemorySecretStore implements SecretStore {
  public readonly secrets = new Map<string, string>();
  public readonly deleted: SecretReference[] = [];

  private static keyOf(ref: SecretReference): string {
    return `${ref.service}:${ref.account}`;
  }

  public setSecret(ref: SecretReference, secret: string): Promise<void> {
    this.secrets.set(InMemorySecretStore.keyOf(ref), secret);
    return Promise.resolve();
  }

  public getSecret(ref: SecretReference): Promise<string> {
    const secret = this.secrets.get(InMemorySecretStore.keyOf(ref));
    if (secret === undefined) {
      return Promise.reject(new Error(`No secret for ${InMemorySecretStore.keyOf(ref)}`));
    }
    return Promise.resolve(secret);
  }

  public deleteSecret(ref: SecretReference): Promise<void> {
    this.deleted.push(ref);
    this.secrets.delete(InMemorySecretStore.keyOf(ref));
    return Promise.resolve();
  }
}

/**
 * Stubs DpopKeyStore.create so every DPoP key generated or loaded in the test uses an in-memory keychain.
 */
export const stubDpopKeyStore = (
  sandbox: SinonSandbox,
  keychain: InMemorySecretStore = new InMemorySecretStore()
): { store: DpopKeyStore; keychain: InMemorySecretStore } => {
  const store = new DpopKeyStore({ keychain, directory: join(tmpdir(), 'sfdx-core-dpop-unused') });
  sandbox.stub(DpopKeyStore, 'create').resolves(store);
  return { store, keychain };
};

export const getHeader = (headers: Record<string, string> | undefined, name: string): string | undefined => {
  const match = Object.entries(headers ?? {}).find(([key]) => key.toLowerCase() === name.toLowerCase());
  return match?.[1];
};

export const decodeProof = (proof: string | undefined): DecodedDpopProof => {
  if (!proof) throw new Error('Expected a DPoP proof');
  const decoded = jwt.decode(proof, { complete: true });
  if (!decoded || typeof decoded.payload === 'string') throw new Error('DPoP proof was not a JWT');
  return { header: decoded.header as unknown as DpopProofHeader, payload: decoded.payload as DpopProofPayload };
};

/**
 * Verifies the proof signature against the public key embedded in its own header, then decodes it.
 */
export const verifyProof = (proof: string | undefined): DecodedDpopProof => {
  const decoded = decodeProof(proof);
  const publicKey = createPublicKey({ key: decoded.header.jwk, format: 'jwk' });
  jwt.verify(proof as string, publicKey, { algorithms: ['ES256'] });
  return decoded;
};

export const proofOf = (request: RecordedRequest): DecodedDpopProof => verifyProof(getHeader(request.headers, 'DPoP'));

/**
 * Independent implementation of the RFC 9449 `ath` claim.
 */
export const expectedAccessTokenHash = (accessToken: string): string =>
  createHash('sha256').update(accessToken).digest('base64url');

export const stripQuery = (url: string): string => {
  const parsed = new URL(url);
  return `${parsed.origin}${parsed.pathname}`;
};

const toStreamPromise = (response: FakeResponse): StreamPromise<unknown> =>
  StreamPromise.create(() => ({
    stream: new PassThrough(),
    promise: Promise.resolve({
      statusCode: response.statusCode,
      headers: { 'content-type': 'application/json', ...(response.headers ?? {}) },
      body:
        response.body === undefined
          ? ''
          : typeof response.body === 'string'
          ? response.body
          : JSON.stringify(response.body),
    }),
  }));

/**
 * Replaces jsforce's Transport with a router that records every request and answers from `routes` in order.
 * Unmatched requests fail loudly so tests can't silently hit the network.
 */
export const stubTransport = (
  sandbox: SinonSandbox,
  routes: FakeRoute[]
): { requests: RecordedRequest[]; stub: SinonStub } => {
  const requests: RecordedRequest[] = [];
  const stub = sandbox.stub(Transport.prototype, 'httpRequest').callsFake((req: HttpRequest) => {
    const recorded: RecordedRequest = {
      method: (req.method ?? 'GET').toUpperCase(),
      url: req.url,
      headers: { ...((req.headers ?? {}) as Record<string, string>) },
      body: typeof req.body === 'string' ? req.body : undefined,
    };
    requests.push(recorded);
    for (const route of routes) {
      const response = route(recorded, requests);
      if (response) return toStreamPromise(response) as ReturnType<Transport['httpRequest']>;
    }
    throw new Error(`Unexpected request: ${recorded.method} ${recorded.url}`);
  });
  return { requests, stub };
};

export const urlIncludes =
  (fragment: string, respond: (request: RecordedRequest, requests: RecordedRequest[]) => FakeResponse): FakeRoute =>
  (request, requests) =>
    request.url.includes(fragment) ? respond(request, requests) : undefined;

/**
 * Responds with each entry in turn, repeating the last one once exhausted.
 */
export const sequence = (...responses: FakeResponse[]): ((request: RecordedRequest) => FakeResponse) => {
  let index = 0;
  return () => responses[Math.min(index++, responses.length - 1)];
};

export const nonceChallenge = (nonce: string, statusCode = 401): FakeResponse => ({
  statusCode,
  headers: { 'dpop-nonce': nonce, 'www-authenticate': `DPoP error="use_dpop_nonce"` },
  body: { error: 'use_dpop_nonce', error_description: 'Authorization server requires nonce in DPoP proof' },
});

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const BASE64URL_SHA256_PATTERN = /^[A-Za-z0-9_-]{43}$/;

const getEncryptedKeys = (): RegExp[] => (AuthInfoConfig as unknown as { encryptedKeys: RegExp[] }).encryptedKeys;

/**
 * Mock org whose auth file carries extra (possibly DPoP) fields, encrypted the same way AuthInfoConfig would.
 */
export class DpopMockOrg extends MockTestOrgData {
  public constructor(private readonly extraFields: Record<string, unknown> = {}, id?: string) {
    super(id);
  }

  public async getConfig(): Promise<AuthFields> {
    const crypto = await Crypto.create();
    const extras = Object.fromEntries(
      Object.entries(this.extraFields).map(([key, value]) => [
        key,
        typeof value === 'string' && getEncryptedKeys().some((regex) => regex.test(key))
          ? crypto.encrypt(value)
          : value,
      ])
    );
    return { ...(await super.getConfig()), ...extras };
  }
}
