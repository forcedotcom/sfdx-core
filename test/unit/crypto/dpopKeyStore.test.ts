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
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect } from 'chai';
import { DpopKeyStore, SecretStore } from '../../../src/crypto/dpopKeyStore';
import { TestContext } from '../../../src/testSetup';
import { InMemorySecretStore } from '../dpopTestHelpers';

const REFERENCE = '3b12f1df-5232-4804-897e-917bf397618a';

const unavailableKeychain: SecretStore = {
  setSecret: () => Promise.reject(new Error('native store unavailable')),
  getSecret: () => Promise.reject(new Error('native store unavailable')),
  deleteSecret: () => Promise.reject(new Error('native store unavailable')),
};

describe('DpopKeyStore', () => {
  const $$ = new TestContext();
  let home: string;

  beforeEach(async () => {
    $$.SANDBOXES.CRYPTO.restore();
    home = await mkdtemp(join(tmpdir(), 'sfdx-core-dpop-key-'));
  });

  afterEach(async () => {
    await rm(home, { recursive: true, force: true });
  });

  it('keeps the private PEM in a separate 0600 file when no native keychain is available', async () => {
    const store = new DpopKeyStore({ keychain: unavailableKeychain, directory: home });
    const filePath = join(home, 'dpop', `${REFERENCE}.key`);

    await store.store(REFERENCE, 'private-dpop-key');

    expect(await store.retrieve(REFERENCE)).to.equal('private-dpop-key');
    expect(await readFile(filePath, 'utf8')).to.equal('private-dpop-key');
    if (process.platform !== 'win32') {
      expect((await stat(filePath)).mode & 0o777).to.equal(0o600);
      expect((await stat(join(home, 'dpop'))).mode & 0o777).to.equal(0o700);
    }

    expect(await store.delete(REFERENCE)).to.be.true;
    expect(existsSync(filePath)).to.be.false;
  });

  it('uses the native keychain when available and writes no key file', async () => {
    const keychain = new InMemorySecretStore();
    const store = new DpopKeyStore({ keychain, directory: home });

    await store.store(REFERENCE, 'private-dpop-key');

    expect(await store.retrieve(REFERENCE)).to.equal('private-dpop-key');
    expect([...keychain.secrets.values()]).to.deep.equal(['private-dpop-key']);
    expect(existsSync(join(home, 'dpop', `${REFERENCE}.key`))).to.be.false;

    await store.delete(REFERENCE);
    expect(keychain.secrets.size).to.equal(0);
    expect(keychain.deleted.map((ref) => ref.account)).to.deep.equal([REFERENCE]);
  });

  it('rejects key references that could escape the key directory', async () => {
    const store = new DpopKeyStore({ keychain: unavailableKeychain, directory: home });

    for (const reference of ['../escape', 'nested/key', '']) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await store.store(reference, 'private-dpop-key');
        expect.fail(`expected store(${JSON.stringify(reference)}) to reject`);
      } catch (e) {
        expect(e).to.have.property('name', 'InvalidDpopKeyReferenceError');
      }
    }
  });

  it('reports false when deleting a key that does not exist', async () => {
    const store = new DpopKeyStore({ keychain: unavailableKeychain, directory: home });

    expect(await store.delete(REFERENCE)).to.be.false;
  });
});
