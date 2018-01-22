/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { toUpper, isNil } from 'lodash';
import * as crypto from 'crypto';

import { Logger } from './logger';
import { Messages } from './messages';
import { SfdxError, SfdxErrorConfig } from './sfdxError';
import { retrieveKeychain } from './keyChain';

const TAG_DELIMITER = ':';
const BYTE_COUNT_FOR_IV = 6;
const _algo = 'aes-256-gcm';
let _key = null;

const KEY_NAME = 'sfdx';
const ACCOUNT = 'local';

/**
 * osxKeyChain promise wrapper.
 * @type {{get: KeychainPromises.get, set: KeychainPromises.set}}
 */
const keychainPromises = {

    /**
     * Gets a password item
     * @param service - The keychain service name
     * @param account - The keychain account name
     */
    get(_keychain, service, account) {
        return new Promise((resolve, reject) =>
            _keychain.getPassword({ service, account }, (err, password) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ username: account, password });
            })
        );
    },

    /**
     * Sets a generic password item in OSX keychain
     * @param service - The keychain service name
     * @param account - The keychain account name
     * @param password - The password for the keychain item
     */
    set(_keychain, service, account, password) {
        return new Promise( (resolve, reject) =>
            _keychain.setPassword({ service, account, password }, (err) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ username: account, password });
            })
        );
    },

    /**
     * Move a keychain password from one keychain to another.
     * @param oldKeychain - The keychin with the password
     * @param newKeychain - The target keychain
     * @param service - service name
     * @param account - account name
     */
    migrate(oldKeychain, newKeychain, service, account) {
        return keychainPromises.get(oldKeychain, service, account)
            .then((passwordResult) =>
                keychainPromises.set(newKeychain, service, account, passwordResult['password']));
    }
};

export class Crypto {

    private enableTokenEncryption: boolean;

    private messages: Messages;

    constructor(private keyChain?) {
        this.enableTokenEncryption = toUpper(process.env.SFDX_DISABLE_ENCRYPTION) !== 'TRUE';
    }

    /**
     * Initialize any crypto dependencies. In this case we need to generate an encryption key.
     *
     * @param retryStatus - A string message to track retries
     * @returns {Promise<any>}
     */
    public async init(retryStatus?: string, platform?: string): Promise<any> {
        const logger = await Logger.child('crypto');

        if (!platform) {
            platform = os.platform();
        }

        logger.debug(`process.env.SFDX_DISABLE_ENCRYPTION: ${process.env.SFDX_DISABLE_ENCRYPTION}`);
        logger.debug(`retryStatus: ${retryStatus}`);

        this.messages = await Messages.loadMessages('sfdx-core');

        if (!this.enableTokenEncryption) {
            return Promise.resolve(null);
        }

        if (!this.keyChain) {
            this.keyChain = await retrieveKeychain(platform);

            return keychainPromises.get(this.keyChain, KEY_NAME, ACCOUNT).then((savedKey) => {
                logger.debug('password retrieved from keychain');

                _key = savedKey['password'];

                // Just want to have something returned. But I do not want to return the encryption key.
                return 'ENCRYPTION_KEY_FOUND';
            }).catch((err) => {
                // No password found
                if (err.name  === 'PasswordNotFound') {
                    // If we already tried to create a new key then bail.
                    if (retryStatus === 'KEY_SET') {
                        logger.debug('a key was set but the retry to get the password failed.');
                        throw err;
                    } else {
                        logger.debug('password not found in keychin attempting to created one and re-init.');
                    }

                    const key = crypto.randomBytes(Math.ceil(16)).toString('hex');
                    // Create a new password in the KeyChain.
                    return keychainPromises.set(this.keyChain, KEY_NAME, ACCOUNT, key)
                        .then(() => this.init('KEY_SET', platform));
                } else {
                    throw err;
                }
            });
        }

        logger.debug('keychain retrieved');
    }

    /**
     * Encrypts text.
     * @param text - The text to encrypt.
     * @returns {undefined|String} - If enableTokenEncryption is set to false or not defined in package.json then the text
     * is simply returned unencrypted.
     */
    public encrypt(text): string {
        if (isNil(text)) {
            return undefined;
        }

        if (!this.enableTokenEncryption) {
            return text;
        }

        if (isNil(_key)) {
            throw new Error('Failed to create a password in the OSX keychain.');
        }

        const iv = crypto.randomBytes(BYTE_COUNT_FOR_IV).toString('hex');
        const cipher = crypto.createCipheriv(_algo, _key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const tag = cipher.getAuthTag().toString('hex');
        return `${iv}${encrypted}${TAG_DELIMITER}${tag}`;

    }

    /**
     * Decrypts text.
     * @param text - The text to decrypt.
     * @returns {undefined|String} - If enableTokenEncryption is set to false or not defined in package.json then the text
     * is simply returned. The text is then assumed to be unencrypted.
     */
    public decrypt(text): string {
        if (isNil(text)) {
            return undefined;
        }

        if (!this.enableTokenEncryption) {
            return text;
        }

        const tokens = text.split(TAG_DELIMITER);

        if (tokens.length !== 2) {
            const errMsg = this.messages.getMessage('InvalidEncryptedFormatError');
            const actionMsg = this.messages.getMessage('InvalidEncryptedFormatErrorAction');
            throw new SfdxError(errMsg, 'InvalidEncryptedFormatError', [actionMsg]);
        }

        const tag = tokens[1];
        const iv = tokens[0].substring(0, (BYTE_COUNT_FOR_IV * 2));
        const secret = tokens[0].substring((BYTE_COUNT_FOR_IV * 2), tokens[0].length);

        const decipher = crypto.createDecipheriv(_algo, _key, iv);

        let dec;
        try {
            decipher.setAuthTag(Buffer.from(tag, 'hex'));
            dec = decipher.update(secret, 'hex', 'utf8');
            dec += decipher.final('utf8');
        } catch (e) {
            const errMsg = this.messages.getMessage('AuthDecryptError', [e.message]);
            throw new SfdxError(errMsg, 'AuthDecryptError');
        }
        return dec;
    }

    public close(): void {
        _key = null;
    }
}
