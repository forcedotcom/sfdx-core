/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as crypto from 'crypto';
import * as os from 'os';
import { join as pathJoin } from 'path';
import { ensure, Nullable, Optional } from '@salesforce/ts-types';
import { AsyncOptionalCreatable, env } from '@salesforce/kit';
import { Logger } from '../logger';
import { Messages } from '../messages';
import { retrieveKeychain } from './keyChain';
import { KeyChain } from './keyChainImpl';
import { SecureBuffer } from './secureBuffer';

const TAG_DELIMITER = ':';
const BYTE_COUNT_FOR_IV = 6;
const ALGO = 'aes-256-gcm';

const KEY_NAME = 'sfdx';
const ACCOUNT = 'local';

Messages.importMessagesDirectory(pathJoin(__dirname));
const messages = Messages.load('@salesforce/core', 'encryption', [
  'keychainPasswordCreationError',
  'invalidEncryptedFormatError',
  'authDecryptError',
  'macKeychainOutOfSync',
]);

interface CredType {
  username: string;
  password: string;
}

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
    return new Promise((resolve, reject): {} =>
      _keychain.getPassword({ service, account }, (err: Nullable<Error>, password?: string) => {
        if (err) return reject(err);
        return resolve({ username: account, password: ensure(password) });
      })
    );
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

  /**
   * Constructor
   * **Do not directly construct instances of this class -- use {@link Crypto.create} instead.**
   *
   * @param options The options for the class instance.
   * @ignore
   */
  public constructor(options?: CryptoOptions) {
    super(options);
    this.options = options || {};
  }

  /**
   * Encrypts text. Returns the encrypted string or undefined if no string was passed.
   *
   * @param text The text to encrypt.
   */
  public encrypt(text?: string): Optional<string> {
    if (text == null) {
      return;
    }

    if (this.key == null) {
      throw messages.createError('keychainPasswordCreationError');
    }

    const iv = crypto.randomBytes(BYTE_COUNT_FOR_IV).toString('hex');

    return this.key.value((buffer: Buffer): string => {
      const cipher = crypto.createCipheriv(ALGO, buffer.toString('utf8'), iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag().toString('hex');
      return `${iv}${encrypted}${TAG_DELIMITER}${tag}`;
    });
  }

  /**
   * Decrypts text.
   *
   * @param text The text to decrypt.
   */
  public decrypt(text?: string): Optional<string> {
    if (text == null) {
      return;
    }

    const tokens = text.split(TAG_DELIMITER);

    if (tokens.length !== 2) {
      throw messages.createError('invalidEncryptedFormatError');
    }

    const tag = tokens[1];
    const iv = tokens[0].substring(0, BYTE_COUNT_FOR_IV * 2);
    const secret = tokens[0].substring(BYTE_COUNT_FOR_IV * 2, tokens[0].length);

    return this.key.value((buffer: Buffer) => {
      const decipher = crypto.createDecipheriv(ALGO, buffer.toString('utf8'), iv);

      let dec;
      try {
        decipher.setAuthTag(Buffer.from(tag, 'hex'));
        dec = decipher.update(secret, 'hex', 'utf8');
        dec += decipher.final('utf8');
      } catch (err) {
        const error = messages.createError('authDecryptError', [err.message], [], err);
        const useGenericUnixKeychain =
          env.getBoolean('SFDX_USE_GENERIC_UNIX_KEYCHAIN') || env.getBoolean('USE_GENERIC_UNIX_KEYCHAIN');
        if (os.platform() === 'darwin' && !useGenericUnixKeychain) {
          error.actions = [messages.getMessage('macKeychainOutOfSync')];
        }
        throw error;
      }
      return dec;
    });
  }

  /**
   * Clears the crypto state. This should be called in a finally block.
   */
  public close(): void {
    if (!this.noResetOnClose) {
      this.key.clear();
    }
  }

  /**
   * Initialize async components.
   */
  protected async init(): Promise<void> {
    const logger = await Logger.child('crypto');

    if (!this.options.platform) {
      this.options.platform = os.platform();
    }

    logger.debug(`retryStatus: ${this.options.retryStatus}`);

    this.noResetOnClose = !!this.options.noResetOnClose;

    try {
      this.key.consume(
        Buffer.from(
          (await keychainPromises.getPassword(await this.getKeyChain(this.options.platform), KEY_NAME, ACCOUNT))
            .password,
          'utf8'
        )
      );
    } catch (err) {
      // No password found
      if (err.name === 'PasswordNotFoundError') {
        // If we already tried to create a new key then bail.
        if (this.options.retryStatus === 'KEY_SET') {
          logger.debug('a key was set but the retry to get the password failed.');
          throw err;
        } else {
          logger.debug('password not found in keychain attempting to created one and re-init.');
        }

        const key = crypto.randomBytes(Math.ceil(16)).toString('hex');
        // Create a new password in the KeyChain.
        await keychainPromises.setPassword(ensure(this.options.keychain), KEY_NAME, ACCOUNT, key);

        return this.init();
      } else {
        throw err;
      }
    }
  }

  private async getKeyChain(platform: string): Promise<KeyChain> {
    if (!this.options.keychain) {
      this.options.keychain = await retrieveKeychain(platform);
    }
    return this.options.keychain;
  }
}
