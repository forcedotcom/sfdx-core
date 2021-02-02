'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('./index-aea73a28.js');
var index$1 = require('./index-ffe6ca9f.js');
var crypto = require('crypto');
var os = require('os');
var path = require('path');
var keyChain = require('./keyChain.js');
var logger = require('./logger.js');
var messages = require('./messages.js');
var secureBuffer = require('./secureBuffer.js');
var sfdxError = require('./sfdxError.js');
require('./_commonjsHelpers-49936489.js');
require('./keyChainImpl.js');
require('child_process');
require('fs');
require('./config/configFile.js');
require('./global.js');
require('./util/fs.js');
require('constants');
require('stream');
require('util');
require('assert');
require('./util/internal.js');
require('./config/configStore.js');
require('./config/keychainConfig.js');
require('events');
require('./index-e6d82ffe.js');
require('tty');

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const TAG_DELIMITER = ':';
const BYTE_COUNT_FOR_IV = 6;
const _algo = 'aes-256-gcm';
const KEY_NAME = 'sfdx';
const ACCOUNT = 'local';
messages.Messages.importMessagesDirectory(path.join(__dirname));
/**
 * osxKeyChain promise wrapper.
 */
const keychainPromises = {
  /**
   * Gets a password item.
   * @param service The keychain service name.
   * @param account The keychain account name.
   */
  getPassword(_keychain, service, account) {
    return new Promise((resolve, reject) =>
      _keychain.getPassword({ service, account }, (err, password) => {
        if (err) return reject(err);
        return resolve({ username: account, password: index$1.lib.ensure(password) });
      })
    );
  },
  /**
   * Sets a generic password item in OSX keychain.
   * @param service The keychain service name.
   * @param account The keychain account name.
   * @param password The password for the keychain item.
   */
  setPassword(_keychain, service, account, password) {
    return new Promise((resolve, reject) =>
      _keychain.setPassword({ service, account, password }, err => {
        if (err) return reject(err);
        return resolve({ username: account, password });
      })
    );
  }
};
/**
 * Class for managing encrypting and decrypting private auth information.
 */
class Crypto extends index.lib.AsyncOptionalCreatable {
  /**
   * Constructor
   * **Do not directly construct instances of this class -- use {@link Crypto.create} instead.**
   * @param options The options for the class instance.
   * @ignore
   */
  constructor(options) {
    super(options);
    this._key = new secureBuffer.SecureBuffer();
    this.options = options || {};
  }
  /**
   * Encrypts text. Returns the encrypted string or undefined if no string was passed.
   * @param text The text to encrypt.
   */
  encrypt(text) {
    if (text == null) {
      return;
    }
    if (this._key == null) {
      const errMsg = this.messages.getMessage('KeychainPasswordCreationError');
      throw new sfdxError.SfdxError(errMsg, 'KeychainPasswordCreationError');
    }
    const iv = crypto.randomBytes(BYTE_COUNT_FOR_IV).toString('hex');
    return this._key.value(buffer => {
      const cipher = crypto.createCipheriv(_algo, buffer.toString('utf8'), iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const tag = cipher.getAuthTag().toString('hex');
      return `${iv}${encrypted}${TAG_DELIMITER}${tag}`;
    });
  }
  /**
   * Decrypts text.
   * @param text The text to decrypt.
   */
  decrypt(text) {
    if (text == null) {
      return;
    }
    const tokens = text.split(TAG_DELIMITER);
    if (tokens.length !== 2) {
      const errMsg = this.messages.getMessage('InvalidEncryptedFormatError');
      const actionMsg = this.messages.getMessage('InvalidEncryptedFormatErrorAction');
      throw new sfdxError.SfdxError(errMsg, 'InvalidEncryptedFormatError', [actionMsg]);
    }
    const tag = tokens[1];
    const iv = tokens[0].substring(0, BYTE_COUNT_FOR_IV * 2);
    const secret = tokens[0].substring(BYTE_COUNT_FOR_IV * 2, tokens[0].length);
    return this._key.value(buffer => {
      const decipher = crypto.createDecipheriv(_algo, buffer.toString('utf8'), iv);
      let dec;
      try {
        decipher.setAuthTag(Buffer.from(tag, 'hex'));
        dec = decipher.update(secret, 'hex', 'utf8');
        dec += decipher.final('utf8');
      } catch (e) {
        const useGenericUnixKeychain =
          index.lib.env.getBoolean('SFDX_USE_GENERIC_UNIX_KEYCHAIN') ||
          index.lib.env.getBoolean('USE_GENERIC_UNIX_KEYCHAIN');
        if (os.platform() === 'darwin' && !useGenericUnixKeychain) {
          e.actions = messages.Messages.loadMessages('@salesforce/core', 'crypto').getMessage('MacKeychainOutOfSync');
        }
        e.message = this.messages.getMessage('AuthDecryptError', [e.message]);
        throw sfdxError.SfdxError.wrap(e);
      }
      return dec;
    });
  }
  /**
   * Clears the crypto state. This should be called in a finally block.
   */
  close() {
    if (!this.noResetOnClose) {
      this._key.clear();
    }
  }
  /**
   * Initialize async components.
   */
  async init() {
    const logger$1 = await logger.Logger.child('crypto');
    if (!this.options.platform) {
      this.options.platform = os.platform();
    }
    logger$1.debug(`retryStatus: ${this.options.retryStatus}`);
    this.messages = messages.Messages.loadMessages('@salesforce/core', 'encryption');
    this.noResetOnClose = !!this.options.noResetOnClose;
    try {
      this._key.consume(
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
          logger$1.debug('a key was set but the retry to get the password failed.');
          throw err;
        } else {
          logger$1.debug('password not found in keychain attempting to created one and re-init.');
        }
        const key = crypto.randomBytes(Math.ceil(16)).toString('hex');
        // Create a new password in the KeyChain.
        await keychainPromises.setPassword(index$1.lib.ensure(this.options.keychain), KEY_NAME, ACCOUNT, key);
        return this.init();
      } else {
        throw err;
      }
    }
  }
  async getKeyChain(platform) {
    if (!this.options.keychain) {
      this.options.keychain = await keyChain.retrieveKeychain(platform);
    }
    return this.options.keychain;
  }
}

exports.Crypto = Crypto;
//# sourceMappingURL=crypto.js.map
