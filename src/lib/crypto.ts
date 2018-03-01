/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { isNil } from 'lodash';
import * as crypto from 'crypto';

import { Logger } from './logger';
import { Messages } from './messages';
import { SfdxError } from './sfdxError';
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
    getPassword(_keychain, service, account) {
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
    setPassword(_keychain, service, account, password) {
        return new Promise( (resolve, reject) =>
            _keychain.setPassword({ service, account, password }, (err) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ username: account, password });
            })
        );
    }
};

export class Crypto {

    public static async create(): Promise<Crypto> {
        return await new Crypto().init();
    }

    private messages: Messages;

    constructor(private keyChain?) { }

    /**
     * Initialize any crypto dependencies. In this case we need to generate an encryption key.
     *
     * @param retryStatus - A string message to track retries
     * @returns {Promise<Crypto>}
     */
    public async init(retryStatus?: string, platform?: string): Promise<Crypto> {
        const logger = await Logger.child('crypto');

        if (!platform) {
            platform = os.platform();
        }

        logger.debug(`retryStatus: ${retryStatus}`);

        this.messages = Messages.loadMessages('sfdx-core', 'encryption');

        try {
            let savedKey = await keychainPromises.getPassword(await this.getKeyChain(platform), KEY_NAME, ACCOUNT);
            _key = savedKey['password'];
            savedKey = null;
            return this;
        } catch (err) {
            // No password found
            if (err.name  === 'PasswordNotFoundError') {
                // If we already tried to create a new key then bail.
                if (retryStatus === 'KEY_SET') {
                    logger.debug('a key was set but the retry to get the password failed.');
                    throw err;
                } else {
                    logger.debug('password not found in keychain attempting to created one and re-init.');
                }

                const key = crypto.randomBytes(Math.ceil(16)).toString('hex');
                // Create a new password in the KeyChain.
                await keychainPromises.setPassword(this.keyChain, KEY_NAME, ACCOUNT, key);

                return this.init('KEY_SET', platform);
            } else {
                throw err;
            }
        }
    }

    /**
     * Encrypts text.
     *
     * @param text - The text to encrypt.
     * @returns {undefined|String} The encrypted string or undefined if no string was passed.
     */
    public encrypt(text): string {
        if (isNil(text)) {
            return undefined;
        }

        if (isNil(_key)) {
            const errMsg = this.messages.getMessage('KeychainPasswordCreationError');
            throw new SfdxError(errMsg, 'KeychainPasswordCreationError');
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

    private async getKeyChain(platform: string) {
        if (!this.keyChain) {
            this.keyChain = await retrieveKeychain(platform);
        }
        return this.keyChain;
    }
}
