/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/ban-types */

import * as crypto from 'node:crypto';
import * as os from 'node:os';
import { join as pathJoin } from 'node:path';
import { ensure, isString, Nullable, Optional } from '@salesforce/ts-types';
import { AsyncOptionalCreatable, env } from '@salesforce/kit';
import { Logger } from '../logger/logger';
import { Lifecycle } from '../lifecycleEvents';
import { Messages } from '../messages';
import { Cache } from '../util/cache';
import { Global } from '../global';
import { SfError } from '../sfError';
import { retrieveKeychain } from './keyChain';
import { KeyChain } from './keyChainImpl';
import { SecureBuffer } from './secureBuffer';

const TAG_DELIMITER = ':';
const IV_BYTES = {
  v1: 6,
  v2: 12,
};
const ENCODING = {
  v1: 'utf8',
  v2: 'hex',
} as const;
const KEY_SIZE = {
  v1: 16,
  v2: 32,
};
const ALGO = 'aes-256-gcm';

const AUTH_TAG_LENGTH = 32;
const ENCRYPTED_CHARS = /[a-f0-9]/;

const KEY_NAME = 'sfdx';
const ACCOUNT = 'local';

let cryptoLogger: Logger;
const getCryptoLogger = (): Logger => {
  cryptoLogger ??= Logger.childFromRoot('crypto');
  return cryptoLogger;
};

type CryptoEncoding = 'utf8' | 'hex';
type CryptoVersion = keyof typeof IV_BYTES;
let cryptoVersion: CryptoVersion;
const getCryptoVersion = (): CryptoVersion => {
  if (!cryptoVersion) {
    cryptoVersion = env.getBoolean('SF_CRYPTO_V2') ? 'v2' : 'v1';
    getCryptoLogger().debug(`Using ${cryptoVersion} Crypto`);
    void Lifecycle.getInstance().emitTelemetry({
      eventName: 'crypto_version',
      library: 'sfdx-core',
      function: 'getCryptoVersion',
      cryptoVersion,
    });
  }
  return cryptoVersion;
};

Messages.importMessagesDirectory(pathJoin(__dirname));
const messages = Messages.loadMessages('@salesforce/core', 'encryption');

interface CredType {
  username: string;
  password: string;
}

const makeSecureBuffer = (password: string | undefined, encoding: CryptoEncoding): SecureBuffer<string> => {
  const newSb = new SecureBuffer<string>();
  newSb.consume(Buffer.from(ensure(password), encoding));
  return newSb;
};

/**
 * osxKeyChain promise wrapper.
 */
const keychainPromises = {
  /**
   * Gets a password item.
   *
   * @param _keychain
   * @param service The keychain service name.
   * @param account The keychain account name.
   */
  getPassword(_keychain: KeyChain, service: string, account: string, encoding: CryptoEncoding): Promise<CredType> {
    const cacheKey = `${Global.DIR}:${service}:${account}`;
    const sb = Cache.get<SecureBuffer<string>>(cacheKey);
    if (!sb) {
      return new Promise((resolve, reject): {} =>
        _keychain.getPassword({ service, account }, (err: Nullable<Error>, password?: string) => {
          if (err) return reject(err);
          Cache.set(cacheKey, makeSecureBuffer(password, encoding));
          return resolve({ username: account, password: ensure(password) });
        })
      );
    } else {
      const pw = sb.value((buffer) => buffer.toString(encoding));
      Cache.set(cacheKey, makeSecureBuffer(pw, encoding));
      return new Promise((resolve): void => resolve({ username: account, password: ensure(pw) }));
    }
  },

  /**
   * Sets a generic password item in OSX keychain.
   *
   * @param _keychain
   * @param service The keychain service name.
   * @param account The keychain account name.
   * @param password The password for the keychain item.
   */
  setPassword(_keychain: KeyChain, service: string, account: string, password: string): Promise<CredType> {
    return new Promise((resolve, reject): {} =>
      _keychain.setPassword({ service, account, password }, (err: Nullable<Error>) => {
        if (err) return reject(err);
        return resolve({ username: account, password });
      })
    );
  },
};

interface CryptoOptions {
  keychain?: KeyChain;
  platform?: string;
  retryStatus?: string;
  noResetOnClose?: boolean;
}

/**
 * Class for managing encrypting and decrypting private auth information.
 */
export class Crypto extends AsyncOptionalCreatable<CryptoOptions> {
  private key: SecureBuffer<string> = new SecureBuffer();

  private options: CryptoOptions;

  private noResetOnClose!: boolean;

  // `true` when the key is 32 hex chars, which is a key created by v1 crypto.
  // This is used to determine encoding (utf8/hex), and for v2 crypto to retry
  // using v1 crypto.
  private v1KeyLength = false;

  private cryptoVersion: CryptoVersion;

  /**
   * Constructor
   * **Do not directly construct instances of this class -- use {@link Crypto.create} instead.**
   *
   * @param options The options for the class instance.
   * @ignore
   */
  public constructor(options?: CryptoOptions) {
    super(options);
    this.options = options ?? {};
    this.cryptoVersion = this.getCryptoVersion();
  }

  /**
   * Encrypts text. Returns the encrypted string or undefined if no string was passed.
   *
   * @param text The text to encrypt.
   */
  public encrypt(text: string): string;
  public encrypt(text?: string): Optional<string> {
    if (text == null) {
      return;
    }

    if (this.key == null) {
      throw messages.createError('keychainPasswordCreationError');
    }

    // When everything is v2, we can remove the else
    if (this.isV2Crypto()) {
      return this.encryptV2(text);
    } else {
      return this.encryptV1(text);
    }
  }

  /**
   * Decrypts text.
   *
   * @param text The text to decrypt.
   */
  public decrypt(text: string): string;
  public decrypt(text?: string): Optional<string> {
    if (text == null) {
      return;
    }

    const tokens = text.split(TAG_DELIMITER);

    if (tokens.length !== 2) {
      throw messages.createError('invalidEncryptedFormatError');
    }

    // When everything is v2, we can remove the else
    if (this.isV2Crypto()) {
      return this.decryptV2(tokens);
    } else {
      return this.decryptV1(tokens);
    }
  }

  /**
   * Takes a best guess if the value provided was encrypted by {@link Crypto.encrypt} by
   * checking the delimiter, tag length, and valid characters.
   *
   * @param text The text
   * @returns true if the text is encrypted, false otherwise.
   */
  // eslint-disable-next-line class-methods-use-this
  public isEncrypted(text?: string): boolean {
    if (text == null) {
      return false;
    }

    const tokens = text.split(TAG_DELIMITER);

    if (tokens.length !== 2) {
      return false;
    }

    const tag = tokens[1];
    const value = tokens[0];
    return (
      tag.length === AUTH_TAG_LENGTH &&
      value.length >= IV_BYTES[this.getCryptoVersion()] &&
      ENCRYPTED_CHARS.test(tag) &&
      ENCRYPTED_CHARS.test(tokens[0])
    );
  }

  /**
   * Clears the crypto state. This should be called in a finally block.
   */
  public close(): void {
    if (!this.noResetOnClose) {
      this.key.clear();
    }
  }

  public isV2Crypto(): boolean {
    return this.getCryptoVersion() === 'v2';
  }

  /**
   * Initialize async components.
   */
  protected async init(): Promise<void> {
    if (!this.options.platform) {
      this.options.platform = os.platform();
    }

    getCryptoLogger().debug(`retryStatus: ${this.options.retryStatus}`);

    this.noResetOnClose = !!this.options.noResetOnClose;

    try {
      const keyChain = await this.getKeyChain(this.options.platform);
      const pwd = (await keychainPromises.getPassword(keyChain, KEY_NAME, ACCOUNT, ENCODING[this.getCryptoVersion()]))
        .password;
      // This supports the v1 key size (32 hex chars) and the v2 key size (64 hex chars).
      if (pwd.length === KEY_SIZE.v2 * 2) {
        getCryptoLogger().debug('Detected v2 key size');
      } else {
        getCryptoLogger().debug('Detected v1 key size');
        this.v1KeyLength = true;
      }
      this.key.consume(Buffer.from(pwd, this.v1KeyLength ? ENCODING.v1 : ENCODING.v2));
    } catch (err) {
      // No password found
      if ((err as Error).name === 'PasswordNotFoundError') {
        // If we already tried to create a new key then bail.
        if (this.options.retryStatus === 'KEY_SET') {
          getCryptoLogger().debug('a key was set but the retry to get the password failed.');
          throw err;
        } else {
          getCryptoLogger().debug('password not found in keychain. attempting to create one and re-init.');
        }

        const key = crypto.randomBytes(KEY_SIZE[this.getCryptoVersion()]).toString('hex');
        // Create a new password in the KeyChain.
        await keychainPromises.setPassword(ensure(this.options.keychain), KEY_NAME, ACCOUNT, key);

        return this.init();
      } else {
        throw err;
      }
    }
  }

  // enables overriding the version in tests
  private getCryptoVersion(): CryptoVersion {
    return this.cryptoVersion ?? getCryptoVersion();
  }

  private encryptV1(text: string): Optional<string> {
    const iv = crypto.randomBytes(IV_BYTES.v1).toString('hex');

    return this.key.value((buffer: Buffer): string => {
      const cipher = crypto.createCipheriv(ALGO, buffer.toString('utf8'), iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag().toString('hex');
      return `${iv}${encrypted}${TAG_DELIMITER}${tag}`;
    });
  }

  private encryptV2(text: string): Optional<string> {
    const iv = crypto.randomBytes(IV_BYTES.v2);

    return this.key.value((buffer: Buffer): string => {
      const cipher = crypto.createCipheriv(ALGO, buffer, iv);
      const ivHex = iv.toString('hex');

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag().toString('hex');
      return `${ivHex}${encrypted}${TAG_DELIMITER}${tag}`;
    });
  }

  private decryptV1(tokens: string[]): Optional<string> {
    const tag = tokens[1];
    const iv = tokens[0].substring(0, IV_BYTES.v1 * 2);
    const secret = tokens[0].substring(IV_BYTES.v1 * 2, tokens[0].length);

    return this.key.value((buffer: Buffer) => {
      const decipher = crypto.createDecipheriv(ALGO, buffer.toString('utf8'), iv);

      try {
        decipher.setAuthTag(Buffer.from(tag, 'hex'));
        return `${decipher.update(secret, 'hex', 'utf8')}${decipher.final('utf8')}`;
      } catch (err) {
        const error = messages.createError('authDecryptError', [(err as Error).message], [], err as Error);
        const useGenericUnixKeychain =
          env.getBoolean('SF_USE_GENERIC_UNIX_KEYCHAIN') || env.getBoolean('USE_GENERIC_UNIX_KEYCHAIN');
        if (os.platform() === 'darwin' && !useGenericUnixKeychain) {
          error.actions = [messages.getMessage('macKeychainOutOfSync')];
        }
        throw error;
      }
    });
  }

  private decryptV2(tokens: string[]): Optional<string> {
    const tag = tokens[1];
    const iv = tokens[0].substring(0, IV_BYTES.v2 * 2);
    const secret = tokens[0].substring(IV_BYTES.v2 * 2, tokens[0].length);

    return this.key.value((buffer: Buffer) => {
      let decipher = crypto.createDecipheriv(ALGO, buffer, Buffer.from(iv, 'hex'));

      let dec!: string;
      try {
        decipher.setAuthTag(Buffer.from(tag, 'hex'));
        dec = decipher.update(secret, 'hex', 'utf8');
        dec += decipher.final('utf8');
      } catch (_err: unknown) {
        const err = (isString(_err) ? SfError.wrap(_err) : _err) as Error;
        const handleDecryptError = (decryptErr: Error): void => {
          const error = messages.createError('authDecryptError', [decryptErr.message], [], decryptErr);
          const useGenericUnixKeychain =
            env.getBoolean('SF_USE_GENERIC_UNIX_KEYCHAIN') || env.getBoolean('USE_GENERIC_UNIX_KEYCHAIN');
          if (os.platform() === 'darwin' && !useGenericUnixKeychain) {
            error.actions = [messages.getMessage('macKeychainOutOfSync')];
          }
          throw error;
        };

        if (this.v1KeyLength && err?.message === 'Unsupported state or unable to authenticate data') {
          getCryptoLogger().debug('v2 decryption failed so trying v1 decryption');
          try {
            const ivLegacy = tokens[0].substring(0, IV_BYTES.v1 * 2);
            const secretLegacy = tokens[0].substring(IV_BYTES.v1 * 2, tokens[0].length);
            // v1 encryption uses a utf8 encoded string from the buffer
            decipher = crypto.createDecipheriv(ALGO, buffer.toString('utf8'), ivLegacy);
            decipher.setAuthTag(Buffer.from(tag, 'hex'));
            dec = decipher.update(secretLegacy, 'hex', 'utf8');
            dec += decipher.final('utf8');
          } catch (_err2: unknown) {
            const err2 = (isString(_err2) ? SfError.wrap(_err2) : _err2) as Error;
            handleDecryptError(err2);
          }
        } else {
          handleDecryptError(err);
        }
      }
      return dec;
    });
  }

  private async getKeyChain(platform: string): Promise<KeyChain> {
    if (!this.options.keychain) {
      this.options.keychain = await retrieveKeychain(platform);
    }
    return this.options.keychain;
  }
}
