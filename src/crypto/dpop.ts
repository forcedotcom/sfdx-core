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
  createHash,
  createPrivateKey,
  createPublicKey,
  generateKeyPair,
  KeyObject,
  randomUUID,
  sign,
} from 'node:crypto';
import { promisify } from 'node:util';
import { HttpMethods } from '@jsforce/jsforce-node';
import { Messages } from '../messages';
import { SfError } from '../sfError';
import { DpopKeyStore } from './dpopKeyStore';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'dpop');

const generateKeyPairAsync = promisify(generateKeyPair);

/**
 * The public half of a DPoP key, as embedded in the `jwk` header of every proof.
 */
export type DpopPublicJwk = {
  kty: 'EC';
  crv: 'P-256';
  x: string;
  y: string;
};

export type DpopProofOptions = {
  /** The HTTP method of the request. */
  method: HttpMethods;
  /** The HTTPS request URL. The query and fragment are not part of the proof. */
  url: string | URL;
  /** A server-provided `DPoP-Nonce`. */
  nonce?: string;
  /** The access token sent with the request; adds an `ath` claim. Omit for token endpoint requests. */
  accessToken?: string;
};

export type DpopKeyStoreOption = {
  /** Where to persist the private key. Defaults to {@link DpopKeyStore.create}. */
  store?: DpopKeyStore;
};

/**
 * An ES256 key used to sign RFC 9449 DPoP proofs. The private key is persisted by reference in a
 * {@link DpopKeyStore}, never in an auth file, and is never serialized or logged.
 *
 * ```
 * const key = await DpopKey.generate();
 * const proof = key.createProof({ method: 'GET', url, accessToken });
 * ```
 */
export class DpopKey {
  /** The public JWK embedded in each proof. */
  public readonly publicJwk: DpopPublicJwk;
  /** The RFC 7638 SHA-256 thumbprint of the public JWK, sent as `dpop_jkt`. */
  public readonly thumbprint: string;
  /** Local handle for the private key in the key store. Saved in auth files as `dpopKeyReference`. */
  public readonly keyReference: string;
  readonly #privateKey: KeyObject;

  private constructor(privateKey: KeyObject, keyReference: string) {
    this.#privateKey = privateKey;
    this.keyReference = keyReference;
    const { kty, crv, x, y } = createPublicKey(privateKey).export({ format: 'jwk' });
    if (kty !== 'EC' || crv !== 'P-256' || !x || !y) {
      throw messages.createError('invalidDpopProofOptions', ['DPoP keys must be P-256 EC keys']);
    }
    this.publicJwk = { kty, crv, x, y };
    // RFC 7638: the required members, in lexicographic order, with no whitespace.
    this.thumbprint = createHash('sha256').update(JSON.stringify({ crv, kty, x, y })).digest('base64url');
  }

  /**
   * Generates a new key and persists its private half.
   *
   * @param options The key store to use.
   */
  public static async generate(options: DpopKeyStoreOption = {}): Promise<DpopKey> {
    const { privateKey } = await generateKeyPairAsync('ec', { namedCurve: 'P-256' });
    const key = new DpopKey(privateKey, randomUUID());
    const store = options.store ?? (await DpopKeyStore.create());
    await store.store(key.keyReference, privateKey.export({ type: 'pkcs8', format: 'pem' }).toString());
    return key;
  }

  /**
   * Loads a previously generated key.
   *
   * @param keyReference The key's reference.
   * @param options The key store to use.
   */
  public static async load(keyReference: string, options: DpopKeyStoreOption = {}): Promise<DpopKey> {
    const store = options.store ?? (await DpopKeyStore.create());
    return new DpopKey(createPrivateKey(await store.retrieve(keyReference)), keyReference);
  }

  /**
   * Deletes a previously generated key.
   *
   * @param keyReference The key's reference.
   * @param options The key store to use.
   * @returns Whether a key was deleted.
   */
  public static async delete(keyReference: string, options: DpopKeyStoreOption = {}): Promise<boolean> {
    const store = options.store ?? (await DpopKeyStore.create());
    return store.delete(keyReference);
  }

  /**
   * Signs a proof for a single request. Proofs must not be reused; create a new one for every attempt.
   *
   * **Throws** *{@link SfError}{ name: 'InvalidDpopProofOptionsError' }* When the options are invalid.
   *
   * @param options The request to bind the proof to.
   */
  public createProof(options: DpopProofOptions): string {
    const url = validateUrl(options.url);
    if (options.nonce === '') {
      throw messages.createError('invalidDpopProofOptions', ['nonce must not be empty']);
    }

    const header = { typ: 'dpop+jwt', alg: 'ES256', jwk: this.publicJwk };
    const claims = {
      htm: options.method,
      htu: `${url.origin}${url.pathname}`,
      iat: Math.floor(Date.now() / 1000),
      jti: randomUUID(),
      ...(options.nonce ? { nonce: options.nonce } : {}),
      // RFC 9449 `ath`: the base64url SHA-256 hash of the access token.
      ...(options.accessToken !== undefined
        ? { ath: createHash('sha256').update(options.accessToken).digest('base64url') }
        : {}),
    };
    const signingInput = `${base64url(header)}.${base64url(claims)}`;
    // JWS ES256 signatures are the raw r||s pair, not DER.
    const signature = sign('sha256', Buffer.from(signingInput), { key: this.#privateKey, dsaEncoding: 'ieee-p1363' });
    return `${signingInput}.${signature.toString('base64url')}`;
  }
}

/**
 * Loads the DPoP key of a logged-in authorization.
 *
 * **Throws** *{@link SfError}{ name: 'DpopSessionUnavailableError' }* When the key can't be loaded; the user must log in again.
 *
 * @param keyReference The authorization's `dpopKeyReference`.
 * @param username The authorization's username, for the error message.
 */
export const loadSessionDpopKey = async (keyReference: string, username: string): Promise<DpopKey> => {
  try {
    return await DpopKey.load(keyReference);
  } catch (e) {
    const error = e instanceof Error ? e : SfError.wrap(e);
    throw messages.createError('dpopSessionUnavailable', [username, error.message], [], error);
  }
};

const base64url = (value: unknown): string => Buffer.from(JSON.stringify(value)).toString('base64url');

const validateUrl = (input: string | URL): URL => {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw messages.createError('invalidDpopProofOptions', ['url must be an absolute URL']);
  }
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw messages.createError('invalidDpopProofOptions', ['url must be HTTPS without embedded credentials']);
  }
  return url;
};
