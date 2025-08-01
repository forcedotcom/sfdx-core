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

type CryptoV2Value = 'true' | 'false' | undefined;
const getCryptoV2EnvVar = (): CryptoV2Value => {
  let sfCryptoV2 = process.env.SF_CRYPTO_V2?.toLowerCase();
  if (sfCryptoV2 !== undefined) {
    getCryptoLogger().debug(`SF_CRYPTO_V2=${sfCryptoV2}`);

    // normalize all values that aren't "true" to be "false"
    if (sfCryptoV2 !== 'true') {
      sfCryptoV2 = 'false';
    }
  }
  return sfCryptoV2 as CryptoV2Value;
};

type CryptoEncoding = 'utf8' | 'hex';
type CryptoVersion = keyof typeof IV_BYTES;
let cryptoVersion: CryptoVersion | undefined;
const getCryptoVersion = (): CryptoVersion => {
  if (!cryptoVersion) {
    // This only happens when generating a new key, so use the env var
    // and (for now) default to 'v1'.
    cryptoVersion = getCryptoV2EnvVar() === 'true' ? 'v2' : 'v1';
  }
  return cryptoVersion;
};

// Detect the crypto version based on the password (key) length.
// This happens once per process.
const detectCryptoVersion = (pwd?: string): void => {
  if (!cryptoVersion) {
    // check the env var to see if it's set
    const sfCryptoV2 = getCryptoV2EnvVar();

    // Password length of 64 is v2 crypto and uses hex encoding.
    // Password length of 32 is v1 crypto and uses utf8 encoding.
    if (pwd?.length === KEY_SIZE.v2 * 2) {
      cryptoVersion = 'v2';
      getCryptoLogger().debug('Using v2 crypto');
      if (sfCryptoV2 === 'false') {
        getCryptoLogger().warn(messages.getMessage('v1CryptoWithV2KeyWarning'));
      }
    } else if (pwd?.length === KEY_SIZE.v1 * 2) {
      cryptoVersion = 'v1';
      getCryptoLogger().debug('Using v1 crypto');
      if (sfCryptoV2 === 'true') {
        getCryptoLogger().warn(messages.getMessage('v2CryptoWithV1KeyWarning'));
      }
    } else {
      getCryptoLogger().debug("crypto key doesn't match v1 or v2. using SF_CRYPTO_V2.");
      getCryptoVersion();
    }

    void Lifecycle.getInstance().emitTelemetry({
      eventName: 'crypto_version',
      library: 'sfdx-core',
      function: 'detectCryptoVersion',
      cryptoVersion, // 'v1' or 'v2'
      cryptoEnvVar: sfCryptoV2, // 'true' or 'false' or 'undefined'
    });
  }
};

Messages.importMessagesDirectory(pathJoin(__dirname));
const messages = Messages.loadMessages('@salesforce/core', 'encryption');

type CredType = {
  username: string;
  password: string;
};

const makeSecureBuffer = (password: string, encoding: CryptoEncoding): SecureBuffer<string> => {
  const newSb = new SecureBuffer<string>();
  newSb.consume(Buffer.from(password, encoding));
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
  getPassword(_keychain: KeyChain, service: string, account: string): Promise<CredType> {
    const cacheKey = `${Global.DIR}:${service}:${account}`;
    const sb = Cache.get<SecureBuffer<string>>(cacheKey);
    if (!sb) {
      return new Promise((resolve, reject): {} =>
        _keychain.getPassword({ service, account }, (err: Nullable<Error>, password?: string) => {
          if (err) return reject(err);
          const pwd = ensure(password, 'Expected the keychain password to be set');
          detectCryptoVersion(pwd);
          Cache.set(cacheKey, makeSecureBuffer(pwd, ENCODING[getCryptoVersion()]));
          return resolve({ username: account, password: pwd });
        })
      );
    } else {
      // If the password is cached, we know the crypto version and encoding because it was
      // detected by the non-cache code path just above this.
      const encoding = ENCODING[getCryptoVersion()];
      const pwd = ensure(
        sb.value((buffer) => buffer.toString(encoding)),
        'Expected the keychain password to be set'
      );
      Cache.set(cacheKey, makeSecureBuffer(pwd, encoding));
      return new Promise((resolve): void => resolve({ username: account, password: pwd }));
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

type CryptoOptions = {
  keychain?: KeyChain;
  platform?: string;
  retryStatus?: string;
  noResetOnClose?: boolean;
};

/**
 * Class for managing encrypting and decrypting private auth information.
 */
export class Crypto extends AsyncOptionalCreatable<CryptoOptions> {
  private key: SecureBuffer<string> = new SecureBuffer();

  private options: CryptoOptions;

  private noResetOnClose!: boolean;

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
  }

  // @ts-expect-error only for test access
  // eslint-disable-next-line class-methods-use-this
  private static unsetCryptoVersion(): void {
    cryptoVersion = undefined;
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
      value.length >= IV_BYTES[getCryptoVersion()] &&
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

  // eslint-disable-next-line class-methods-use-this
  public isV2Crypto(): boolean {
    return getCryptoVersion() === 'v2';
  }

  /**
   * Initialize async components.
   */
  protected async init(): Promise<void> {
    if (!this.options.platform) {
      this.options.platform = os.platform();
    }

    this.noResetOnClose = !!this.options.noResetOnClose;

    try {
      const keyChain = await this.getKeyChain(this.options.platform);
      const pwd = (await keychainPromises.getPassword(keyChain, KEY_NAME, ACCOUNT)).password;
      // The above line ensures the crypto version is detected and set so we can rely on it now.
      this.key.consume(Buffer.from(pwd, ENCODING[getCryptoVersion()]));
    } catch (err) {
      // No password found
      if ((err as Error).name === 'PasswordNotFoundError') {
        // If we already tried to create a new key then bail.
        if (this.options.retryStatus === 'KEY_SET') {
          getCryptoLogger().debug('a key was set but the retry to get the password failed.');
          throw err;
        } else {
          getCryptoLogger().debug(
            `password not found in keychain. Creating new one (Crypto ${getCryptoVersion()}) and re-init.`
          );
        }

        // 2/6/2024: This generates a new key using the crypto version based on the SF_CRYPTO_V2 env var.
        // Sometime in the future we could hardcode this to be `KEY_SIZE.v2` so that it becomes the default.
        const key = crypto.randomBytes(KEY_SIZE[getCryptoVersion()]).toString('hex');
        // Set the new password in the KeyChain.
        await keychainPromises.setPassword(ensure(this.options.keychain), KEY_NAME, ACCOUNT, key);

        return this.init();
      } else {
        throw err;
      }
    }
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
      const decipher = crypto.createDecipheriv(ALGO, buffer, Buffer.from(iv, 'hex'));

      try {
        decipher.setAuthTag(Buffer.from(tag, 'hex'));
        return `${decipher.update(secret, 'hex', 'utf8')}${decipher.final('utf8')}`;
      } catch (_err: unknown) {
        const err = (isString(_err) ? SfError.wrap(_err) : _err) as Error;
        const error = messages.createError('authDecryptError', [err.message], [], err);
        const useGenericUnixKeychain =
          env.getBoolean('SF_USE_GENERIC_UNIX_KEYCHAIN') || env.getBoolean('USE_GENERIC_UNIX_KEYCHAIN');
        if (os.platform() === 'darwin' && !useGenericUnixKeychain) {
          error.actions = [messages.getMessage('macKeychainOutOfSync')];
        }
        throw error;
      }
    });
  }

  private async getKeyChain(platform: string): Promise<KeyChain> {
    this.options.keychain ??= await retrieveKeychain(platform);
    return this.options.keychain;
  }
}
