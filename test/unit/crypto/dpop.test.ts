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
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inspect } from 'node:util';
import jwt from 'jsonwebtoken';
import { expect } from 'chai';
import { SinonFakeTimers } from 'sinon';
import { DpopKey, DpopProofOptions } from '../../../src/crypto/dpop';
import { DpopKeyStore, SecretStore } from '../../../src/crypto/dpopKeyStore';
import { TestContext } from '../../../src/testSetup';
import {
  BASE64URL_SHA256_PATTERN,
  decodeProof,
  expectedAccessTokenHash,
  InMemorySecretStore,
  UUID_PATTERN,
} from '../dpopTestHelpers';

const NOW_MS = 1_700_000_000_000;

const unavailableKeychain: SecretStore = {
  setSecret: () => Promise.reject(new Error('native store unavailable')),
  getSecret: () => Promise.reject(new Error('native store unavailable')),
  deleteSecret: () => Promise.reject(new Error('native store unavailable')),
};

describe('DpopKey', () => {
  const $$ = new TestContext();
  let clock: SinonFakeTimers;
  let keychain: InMemorySecretStore;
  let store: DpopKeyStore;
  let directory: string;

  beforeEach(async () => {
    $$.SANDBOXES.CRYPTO.restore();
    directory = await mkdtemp(join(tmpdir(), 'sfdx-core-dpop-'));
    keychain = new InMemorySecretStore();
    store = new DpopKeyStore({ keychain, directory });
    clock = $$.SANDBOX.useFakeTimers({ now: NOW_MS, toFake: ['Date'] });
  });

  afterEach(async () => {
    clock.restore();
    await rm(directory, { recursive: true, force: true });
  });

  it('signs a proof that verifies against the key and embeds the public JWK', async () => {
    const key = await DpopKey.generate({ store });
    const proof = key.createProof({
      method: 'POST',
      url: new URL('https://login.salesforce.com/services/oauth2/token'),
      accessToken: 'a-sensitive-token',
    });

    const verified = jwt.verify(proof, key.getPublicKey(), { algorithms: ['ES256'], complete: true });
    const { header } = decodeProof(proof);

    expect(verified.payload).to.have.property('htm', 'POST');
    expect(header.jwk).to.deep.equal(key.publicJwk);
  });

  it('does not expose the private key when serialized or inspected', async () => {
    const key = await DpopKey.generate({ store });
    const [pem] = [...keychain.secrets.values()];

    expect(pem).to.include('BEGIN PRIVATE KEY');
    expect(JSON.stringify(key)).to.not.include(pem);
    expect(JSON.stringify(key)).to.not.include('PRIVATE KEY');
    expect(inspect(key, { depth: 10 })).to.not.include(pem);
    expect(inspect(key, { depth: 10 })).to.not.include('PRIVATE KEY');
  });

  it('stores a reference and reloads the key through the keychain', async () => {
    const generated = await DpopKey.generate({ store });
    expect(generated.keyReference).to.match(UUID_PATTERN);

    const restored = await DpopKey.load(generated.keyReference, { store });
    const proof = restored.createProof({
      method: 'GET',
      url: new URL('https://example.my.salesforce.com/services/data/v68.0/limits'),
    });
    const verified = jwt.verify(proof, restored.getPublicKey(), { algorithms: ['ES256'], complete: true });

    expect(restored.thumbprint).to.equal(generated.thumbprint);
    expect(verified.payload).to.have.property('htm', 'GET');
  });

  it('stores and reloads the key from a separate file when the keychain is unavailable', async () => {
    const fallbackStore = new DpopKeyStore({ keychain: unavailableKeychain, directory });
    const generated = await DpopKey.generate({ store: fallbackStore });
    const restored = await DpopKey.load(generated.keyReference, { store: fallbackStore });
    const proof = restored.createProof({
      method: 'GET',
      url: new URL('https://example.my.salesforce.com/services/data/v68.0/limits'),
    });
    const verified = jwt.verify(proof, restored.getPublicKey(), { algorithms: ['ES256'], complete: true });

    expect(restored.thumbprint).to.equal(generated.thumbprint);
    expect(verified.payload).to.have.property('htm', 'GET');
  });

  it('creates an ES256 key and signs a request-bound proof', async () => {
    const key = await DpopKey.generate({ store });
    const proof = key.createProof({
      method: 'POST',
      url: new URL('https://login.salesforce.com/services/oauth2/token'),
    });
    const verified = jwt.verify(proof, key.getPublicKey(), { algorithms: ['ES256'], complete: true });
    const { header, payload } = decodeProof(proof);

    expect([...keychain.secrets.values()][0]).to.include('BEGIN PRIVATE KEY');
    expect(key.thumbprint).to.match(BASE64URL_SHA256_PATTERN);
    expect(key.publicJwk).to.include({ kty: 'EC', crv: 'P-256' });
    expect(header).to.include({ alg: 'ES256', typ: 'dpop+jwt' });
    expect(verified.payload).to.include({
      htm: 'POST',
      htu: 'https://login.salesforce.com/services/oauth2/token',
      iat: NOW_MS / 1000,
    });
    expect(payload.jti).to.be.a('string').and.not.be.empty;
    expect(payload).to.not.have.property('nonce');
    expect(payload).to.not.have.property('ath');
  });

  it('generates a unique jti for every proof', async () => {
    const key = await DpopKey.generate({ store });
    const options: DpopProofOptions = { method: 'GET', url: 'https://example.my.salesforce.com/services/data' };

    expect(decodeProof(key.createProof(options)).payload.jti).to.not.equal(
      decodeProof(key.createProof(options)).payload.jti
    );
  });

  it('adds nonce and access-token hash claims to resource proofs', async () => {
    const key = await DpopKey.generate({ store });
    const proof = key.createProof({
      method: 'GET',
      url: new URL('https://example.my.salesforce.com/services/data/v68.0/query?q=SELECT+Id+FROM+Account'),
      nonce: 'server-nonce',
      accessToken: 'opaque-access-token',
    });
    const { payload } = decodeProof(proof);

    expect(DpopKey.accessTokenHash('opaque-access-token')).to.equal(expectedAccessTokenHash('opaque-access-token'));
    expect(payload).to.include({
      nonce: 'server-nonce',
      ath: DpopKey.accessTokenHash('opaque-access-token'),
      htm: 'GET',
    });
    expect(payload.htu).to.equal('https://example.my.salesforce.com/services/data/v68.0/query');
  });

  it('deletes a stored key reference', async () => {
    const key = await DpopKey.generate({ store });
    await DpopKey.delete(key.keyReference, { store });

    expect(keychain.secrets.size).to.equal(0);
    try {
      await DpopKey.load(key.keyReference, { store });
      expect.fail('expected load of a deleted key to fail');
    } catch (e) {
      expect(e).to.be.an('error');
    }
  });
});
