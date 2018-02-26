/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

// Node

import { isNil as _isNil, some as _some, keyBy as _keyBy, each as _each } from 'lodash';
import { Messages } from '../messages';
import { Config, ConfigOptions } from './config';
import { SfdxUtil } from '../util';
import { SfdxError } from '../sfdxError';
import { Crypto } from '../crypto';

const SFDX_CONFIG_FILE_NAME = 'sfdx-config.json';

/**
 * Internal helper to validate the ENOENT error type.
 * @param err - The error object to check.
 * @returns {Object} The contents object bound to "this"
 * @throws re-throws all other errors.
 * @private
 */
const _checkEnoent = function(err) {
    if (err.code === 'ENOENT') {
        this.contents = {};
        return this.contents;
    } else {
        throw err;
    }
};

/**
 * Interface for meta information about config properties
 */
export interface ConfigPropertyMeta {

    /**
     *  The config property name
     */
    key: string;

    /**
     *  Reference to the config data input validation
     */
    input?: ConfigPropertyMetaInput;

    /**
     *  True if the property should be indirectly hidden from the user.
     */
    hidden?: boolean;

    /**
     * True if the property values should be stored encrypted.
     */
    encrypted?: boolean;
}

/**
 * Config property input validation
 */
export interface ConfigPropertyMetaInput {

    /**
     * Test if the input value is valid.
     * @param value - the input value
     * @returns - {boolean} Returns true if the input data is valid.
     */
    validator: (value) => {};

    /**
     * The message to return in the error if the validation fails.
     */
    failedMessage: string;
}

export class SfdxConfig extends Config {

    /**
     * Username associated with the default dev hub org
     * @type {string}
     */
    public static readonly DEFAULT_DEV_HUB_USERNAME: string = 'defaultdevhubusername';

    /**
     * Username associate with the default org
     * @type {string}
     */
    public static readonly DEFAULT_USERNAME: string = 'defaultusername';

    /**
     * The sid for the debugger configuration
     * @type {string}
     */
    public static readonly ISV_DEBUGGER_SID: string = 'isvDebuggerSid';

    /**
     * The url for the debugger configuration
     * @type {string}
     */
    public static readonly ISV_DEBUGGER_URL: string = 'isvDebuggerUrl';

    /**
     * Creates an instance of an SfdxConfig
     * @param {ConfigOptions} options - The config options
     * @return {Promise<T extends Config>) - An instance of SfdxConfig
     * @example
     * const config: SfdxConfig = await Sfdx.create({ isGlobal: false }}
     * await config.setPropertyValue()
     */
    public static async create<T extends Config>(this: { new(): T }, options: ConfigOptions): Promise<T> {
        if (!SfdxConfig.messages) {
            SfdxConfig.messages = Messages.loadMessages('sfdx-core', 'config');
        }

        if (!SfdxConfig.allowedProperties) {
            SfdxConfig.allowedProperties = [
                {
                    key: 'instanceUrl',
                    input: {
                        // If a value is provided validate it otherwise no value is unset.
                        validator: (value) => _isNil(value) || SfdxUtil.isSalesforceDomain(value),
                        failedMessage: SfdxConfig.messages.getMessage('invalidInstanceUrl')
                    }
                },
                {
                    key: 'apiVersion',
                    hidden: true,
                    input: {
                        // If a value is provided validate it otherwise no value is unset.
                        validator: (value) => _isNil(value) || /[1-9]\d\.0/.test(value),
                        failedMessage: SfdxConfig.messages.getMessage('invalidApiVersion')
                    }
                },
                { key: SfdxConfig.DEFAULT_DEV_HUB_USERNAME },
                { key: SfdxConfig.DEFAULT_USERNAME },
                { key: SfdxConfig.ISV_DEBUGGER_SID, encrypted: true },
                { key: SfdxConfig.ISV_DEBUGGER_URL }
            ];
        }

        SfdxConfig.propertyConfigMap = _keyBy(SfdxConfig.allowedProperties, 'key');

        return await super.create(options) as T;
    }

    public static getDefaultOptions(isGlobal: boolean): ConfigOptions {
        return { isGlobal, isState: true, filename: SFDX_CONFIG_FILE_NAME };
    }

    /**
     * @returns {ConfigPropertyMeta[]} Returns an object representing the supported allowed properties.
     */
    public static getAllowedProperties(): ConfigPropertyMeta[] {
        if (!SfdxConfig.allowedProperties) {
            throw new SfdxError('SfdxConfig meta information has not been initialized. Use SfdxConfigcreate()');
        }
        return SfdxConfig.allowedProperties;
    }

    /**
     * The value of a supported config property
     * @param {boolean} isGlobal - True for a global config. False for a local config.
     * @param {string} propertyName - The name of the property to set
     * @param {string | boolean} value - The property value
     * @returns {Promise<object>}
     */
    public static async setPropertyValue(isGlobal: boolean, propertyName: string,
                                         value?: string | boolean): Promise<object> {

        const config = await SfdxConfig.create(SfdxConfig.getDefaultOptions(isGlobal));

        const content = await config.read();

        if (_isNil(value)) {
            delete content[propertyName];
        } else {
            content[propertyName] = value;
        }

        return config.write(content);
    }

    /**
     * Clear all the configured properties both local and global
     * @returns {Promise<void>}
     */
    public static async clear(): Promise<void> {
        let config  = await SfdxConfig.create(SfdxConfig.getDefaultOptions(true));
        await config.write({});

        config = await SfdxConfig.create(SfdxConfig.getDefaultOptions(false));
        await config.write({});
    }

    private static allowedProperties: ConfigPropertyMeta[];
    private static messages: Messages;
    private static propertyConfigMap;

    private crypto: Crypto;

    /**
     * @returns {Promise<object>} Read, assign, and return the config contents.
     */
    public async read(): Promise<object> {
        try {
            await this.setContents(await SfdxUtil.readJSON(this.getPath(), false));
            await this.cryptProperties(false);
            return this.getContents();
        } catch (err) {
            _checkEnoent.call(this, err);
        } finally {
            await this.clearCyrpto();
        }
    }

    /**
     * Writes SfdxConfg properties taking into account encrypted properites.
     * @param newContents - The new SfdxConfig value to persist.
     * @return {Promise<object>}
     */
    public async write(newContents?: any): Promise<object> {
        if (!_isNil(newContents)) {
            this.setContents(newContents);
        }

        await this.cryptProperties(true);

        await super.write();

        await this.cryptProperties(false);

        return this.getContents();
    }

    /**
     * Sets a value for a property
     * @param {string} propertyName - The property to set.
     * @param {string | boolean} value - The value of the property
     * @returns {Promise<void>}
     */
    public async setPropertyValue(propertyName: string, value: string | boolean) {

        const property = SfdxConfig.allowedProperties.find((allowedProp) => allowedProp.key === propertyName);
        const contents = this.getContents();
        if (!property) {
            throw SfdxError.create('sfdx-core', 'config', 'UnknownConfigKey', [propertyName]);
        }
        if (property.input) {
            if (property.input && property.input.validator(value)) {
                contents[property.key] = value;
                this.setContents(contents);
            } else {
                throw SfdxError.create('sfdx-core', 'config', 'invalidConfigValue', [property.input.failedMessage]);
            }
        } else {
            contents[property.key] = value;
            this.setContents(contents);
        }
    }

    /**
     * Intializes the crypto dependency
     * @return {Promise<void>}
     */
    private async initCrypto(): Promise<void> {
        if (!this.crypto) {
            this.crypto = await Crypto.create();
        }
    }

    /**
     * Closes the crpto dependency. Crypto should be close after it's used and no longer needed.
     * @return {Promise<void>}
     */
    private async clearCyrpto(): Promise<void> {
        if (this.crypto) {
            this.crypto.close();
            delete this.crypto;
        }
    }

    /**
     * Get an individual property config
     * @param {string} propertyName - The name of the property
     * @return {ConfigPropertyMeta} - The meta config
     */
    private getPropertyConfig(propertyName: string): ConfigPropertyMeta {
        const prop = SfdxConfig.propertyConfigMap[propertyName];

        if (!prop) {
            throw SfdxError.create('sfdx-core', 'config', 'UnknownConfigKey', [propertyName]);
        }
        return prop;
    }

    /**
     * Encrypts and content properties that have a encryption attribute.
     * @param {boolean} encrypt - true to encrypt
     * @return {Promise<void>}
     */
    private async cryptProperties(encrypt: boolean) {
        const hasEncryptedProperties =
            _some(this.getContents(), (val, key) => !!SfdxConfig.propertyConfigMap[key].encrypted);

        if (hasEncryptedProperties) {
            await this.initCrypto();

            _each(this.getContents(), (value, key) => {
                if (this.getPropertyConfig(key).encrypted) {
                    this.getContents()[key] = encrypt ? this.crypto.encrypt(value) : this.crypto.decrypt(value);

                }
            });
        }
    }
}

/**
 * Supported Org Default Types
 * @type {object}
 */
export const ORG_DEFAULT = {
    /** {string} Default Developer Hub Username */
    DEVHUB: SfdxConfig.DEFAULT_DEV_HUB_USERNAME,
    /** {string} Default Username */
    USERNAME: SfdxConfig.DEFAULT_USERNAME,

    /**
     * List the Org defaults
     * @returns {stringp[]} List of default orgs
     */
    list() {
        return [ORG_DEFAULT.DEVHUB, ORG_DEFAULT.USERNAME];
    }
};
