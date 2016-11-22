/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

// Node
const crypto = require('crypto');
const os = require('os');
const path = require('path');
const util = require('util');

// Thirdparty
const Promise = require('bluebird');

// Local
const configApi = require(path.join(__dirname, 'configApi'));
const keychain = require(path.join(__dirname, 'keyChain'));
const messages = require(path.join(__dirname,  'messages'));

const _Keychain = function(platform) {
    
    if (/^win/.test(platform)) {
        return keychain.windows;
    }
    else if (/darwin/.test(platform)) {
        return keychain.darwin;
    }
    else if (/linux/.test(platform)) {
        return keychain.linux;
    }
    else {
        const error = new Error(`Unsupported Operating System:${platform}`);
        error.name = 'UnsupportedOperatingSystem';
        throw error;
    }
}(os.platform());

/**
 * osxKeyChain promise wrapper.
 * @type {{get: KeychainPromises.get, set: KeychainPromises.set}}
 */
const KeychainPromises = {

    /**
     * Gets a password item
     * @param service - The keychain service name
     * @param account - The keychain account name
     */
    get(service, account) {
        return new Promise((resolve, reject) => {
            _Keychain.getPassword({ service, account }, (err, password) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ username: account, password });
            });
        });
    },

    /**
     * Sets a generic password item in OSX keychain
     * @param service - The keychain service name
     * @param account - The keychain account name
     * @param password - The password for the keychain item
     */
    set(service, account, password) {
        return new Promise( (resolve, reject) => {
            _Keychain.setPassword({ service, account, password }, (err) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ username: account, password });
            });
        });
    }
};

/**
 * Crypto class for appcloud.
 * @param packageDotJson - Override object for package.json properties. Used for unit testing.
 * @constructor
 */
function AppCloudCrypto () {
    this.config = new configApi.Config();
    this.appConfig = this.config.getAppConfig();
    this.enableTokenEncryption = util.isNullOrUndefined(this.appConfig.EnableTokenEncryption) ?
        true :
        this.appConfig.EnableTokenEncryption;
}

const TAG_DELIMITER = ':';
const BYTE_COUNT_FOR_IV = 6;
const _algo = 'aes-256-gcm';
let _key = null;

/**
 * Initialize any crypto dependencies. In this case we need to generate an encryption key.
 * @param retried - I 
 * @returns {*}
 */
AppCloudCrypto.prototype.init = function (retried) {

    if (!this.enableTokenEncryption) {
        return Promise.resolve(null);
    }

    // First try and get a password from the OSX keychain.
    return KeychainPromises.get('appcloud', 'local').then((savedKey) => {

        if (!util.isNullOrUndefined(savedKey)) {
            _key = savedKey.password;
        } 
        else {
            throw new Error('No appcloud encryption key found.');
        }

        // Just want to have something returned. But I do not want to return the encryption key.
        return 'ENCRYPTION_KEY_FOUND';
    }).catch((err) => {

        // No password found
        if (!util.isNullOrUndefined(err) && err.name  === 'PasswordNotFound') {

            if (!util.isNullOrUndefined(retried)) {
                throw new Error(`${messages(this.config.getLocale()).getMessage('keyChainItemCreateFailed')}: ${err.message}`);
            }


            const key = crypto.randomBytes(Math.ceil(16)).toString('hex');
            // Create a new password in the KeyChain.
            return KeychainPromises.set('appcloud', 'local', key)
                .then(() => this.init(true))
                .catch((err2) => {
                    throw new Error(`${messages(this.config.getLocale()).getMessage('keyChainItemCreateFailed')}: ${err2.message}`);
                });
        }
        else {
            throw err;
        }
    });
};

/**
 * Encrypts text.
 * @param text - The text to encrypt.
 * @returns {undefined|String} - If enableTokenEncryption is set to false or not defined in package.json then the text 
 * is simply returned unencrypted.
 */
AppCloudCrypto.prototype.encrypt = function (text) {

    if (util.isNullOrUndefined(text)) {
        return undefined;
    }

    if (!this.enableTokenEncryption) {
        return text;
    }

    if (util.isNullOrUndefined(_key)) {
        throw new Error('Failed to create a password in the OSX keychain.');
    }

    const iv = crypto.randomBytes(BYTE_COUNT_FOR_IV).toString('hex');
    const cipher = crypto.createCipheriv(_algo, _key, iv);

    let encrypted = cipher.update(text,'utf8','hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag().toString('hex');
    return `${iv}${encrypted}${TAG_DELIMITER}${tag}`;

};

/**
 * Decrypts text.
 * @param text - The text to decrypt.
 * @returns {undefined|String} - If enableTokenEncryption is set to false or not defined in package.json then the text 
 * is simply returned. The is then assumed to be unencrypted.
 */
AppCloudCrypto.prototype.decrypt = function(text) {
    if (util.isNullOrUndefined(text)) {
        return undefined;
    }

    if (!this.enableTokenEncryption) {
        return text;
    }

    if (util.isNullOrUndefined(_key)) {
        throw new Error('Failed to create a password in the OSX keychain.');
    }

    const tokens = text.split(TAG_DELIMITER);

    if (tokens.length !== 2) {
        throw new Error('Invalid encrypted string');
    }

    const tag = tokens[1];
    const iv = tokens[0].substring(0, (BYTE_COUNT_FOR_IV * 2));
    const secret = tokens[0].substring((BYTE_COUNT_FOR_IV * 2), tokens[0].length);

    const decipher = crypto.createDecipheriv(_algo, _key, iv);

    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    let dec = decipher.update(secret, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};

AppCloudCrypto.prototype.close = function() {
    // Make _key eligible for gc.
    _key = null;
};

module.exports = AppCloudCrypto;