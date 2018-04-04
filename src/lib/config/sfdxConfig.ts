/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * Contains meta information about sfdx config properties.
 * @typedef {object} ConfigPropertyMeta
 * @property {string} key The config property name.
 * @property {input} value Reference to the config data input validation.
 * @property {boolean} hidden True if the property should be indirectly hidden from the user.
 * @property {boolean} encrypted True if the property values should be stored encrypted.
 */
/**
 * Contains meta information about sfdx config properties.
 * @typedef {object} ConfigPropertyMetaInput
 * @property {function} validator Test if the input value is valid.
 * @property {string} failedMessage The message to return in the error if the validation fails.
 */

import * as _ from 'lodash';
import { Messages } from '../messages';
import { ConfigContents, ConfigValue } from './configStore';
import { ConfigFile, ConfigOptions } from './configFile';
import { SfdxUtil } from '../util';
import { SfdxError } from '../sfdxError';
import { Crypto } from '../crypto';

const SFDX_CONFIG_FILE_NAME = 'sfdx-config.json';

/**
 * Interface for meta information about config properties
 */
export interface ConfigPropertyMeta {

    /**
     *  The config property name.
     */
    key: string;

    /**
     *  Reference to the config data input validation.
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
     * @param value The input value.
     * @returns {boolean} Returns true if the input data is valid.
     */
    validator: (value) => {};

    /**
     * The message to return in the error if the validation fails.
     */
    failedMessage: string;
}

/**
 * The files where sfdx config values are stored for projects and the global space.
 *
 * *Note:* It is not recommended to instantiate this object directly when resolving
 * config values. Instead use {@link SfdxConfigAggregator}
 *
 * @extends ConfigFile
 *
 * @example
 * const localConfig = await SfdxConfig.retrieve<SfdxConfig>();
 * localConfig.set('defaultusername', 'username@company.org');
 * await localConfig.write();
 *
 * @see https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_config_values.htm
 */
export class SfdxConfig extends ConfigFile {

    /**
     * Username associated with the default dev hub org.
     * @type {string}
     */
    public static readonly DEFAULT_DEV_HUB_USERNAME: string = 'defaultdevhubusername';

    /**
     * Username associate with the default org.
     * @type {string}
     */
    public static readonly DEFAULT_USERNAME: string = 'defaultusername';

    /**
     * The sid for the debugger configuration.
     * @type {string}
     */
    public static readonly ISV_DEBUGGER_SID: string = 'isvDebuggerSid';

    /**
     * The url for the debugger configuration.
     * @type {string}
     */
    public static readonly ISV_DEBUGGER_URL: string = 'isvDebuggerUrl';

    /**
     * Creates an instance of an SfdxConfig.
     * @param {ConfigOptions} options The config options.
     * @return {Promise<SfdxConfig>} An instance of SfdxConfig.
     * @throws {SfdxError} **`{name: 'InvalidInstanceUrl'}`** Invalid instance URL.
     * @throws {SfdxError} **`{name: 'InvalidApiVersion'}`** Invalid API version.
     * @example
     * const config: SfdxConfig = await Sfdx.create<SfdxConfig>({ isGlobal: false }};
     * config.set(allowedPropertyKey, value);
     * await config.write();
     */
    public static async create<T extends ConfigFile>(options: ConfigOptions): Promise<T> {
        if (!SfdxConfig.messages) {
            SfdxConfig.messages = Messages.loadMessages('@salesforce/core', 'config');
        }

        if (!SfdxConfig.allowedProperties) {
            SfdxConfig.allowedProperties = [
                {
                    key: 'instanceUrl',
                    input: {
                        // If a value is provided validate it otherwise no value is unset.
                        validator: (value) => _.isNil(value) || SfdxUtil.isSalesforceDomain(value),
                        failedMessage: SfdxConfig.messages.getMessage('InvalidInstanceUrl')
                    }
                },
                {
                    key: 'apiVersion',
                    hidden: true,
                    input: {
                        // If a value is provided validate it otherwise no value is unset.
                        validator: SfdxUtil.validateApiVersion,
                        failedMessage: SfdxConfig.messages.getMessage('InvalidApiVersion')
                    }
                },
                { key: SfdxConfig.DEFAULT_DEV_HUB_USERNAME },
                { key: SfdxConfig.DEFAULT_USERNAME },
                { key: SfdxConfig.ISV_DEBUGGER_SID, encrypted: true },
                { key: SfdxConfig.ISV_DEBUGGER_URL }
            ];
        }

        SfdxConfig.propertyConfigMap = _.keyBy(SfdxConfig.allowedProperties, 'key');

        return await super.create(options) as T;
    }

    public static getFileName(): string {
        return SFDX_CONFIG_FILE_NAME;
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
     * The value of a supported config property.
     * @param {boolean} isGlobal True for a global config. False for a local config.
     * @param {string} propertyName The name of the property to set.
     * @param {string | boolean} value The property value.
     * @returns {Promise<object>}
     */
    public static async update(isGlobal: boolean, propertyName: string, value?: ConfigValue): Promise<object> {

        const config = await SfdxConfig.create(SfdxConfig.getDefaultOptions(isGlobal));

        const content = await config.read();

        if (_.isNil(value)) {
            content.delete(propertyName);
        } else {
            content.set(propertyName, value);
        }

        return config.write(content);
    }

    /**
     * Clear all the configured properties both local and global.
     * @returns {Promise<void>}
     */
    public static async clear(): Promise<void> {
        let config  = await SfdxConfig.create(SfdxConfig.getDefaultOptions(true));
        config.clear();
        await config.write();

        config = await SfdxConfig.create(SfdxConfig.getDefaultOptions(false));
        config.clear();
        await config.write();
    }

    private static allowedProperties: ConfigPropertyMeta[];
    private static messages: Messages;
    private static propertyConfigMap;

    private crypto: Crypto;

    /**
     * @returns {Promise<object>} Read, assign, and return the config contents.
     */
    public async read(): Promise<ConfigContents> {
        try {
            await super.read();
            await this.cryptProperties(false);
            return this.getContents();
        } finally {
            await this.clearCyrpto();
        }
    }

    /**
     * Writes SfdxConfg properties taking into account encrypted properties.
     * @param {ConfigContents} newContents The new SfdxConfig value to persist.
     * @return {Promise<ConfigContents>}
     */
    public async write(newContents?: ConfigContents): Promise<ConfigContents> {
        if (!_.isNil(newContents)) {
            this.setContents(newContents);
        }

        await this.cryptProperties(true);

        await super.write();

        await this.cryptProperties(false);

        return this.getContents();
    }

    /**
     * Sets a value for a property.
     * @param {string} propertyName The property to set.
     * @param {string | boolean} value The value of the property.
     * @returns {Promise<void>}
     * @throws {SfdxError} **`{name: 'InvalidConfigValue'}`** Invalid configuration value.
     */
    public set(key: string, value: ConfigValue): ConfigContents { // tslint:disable-next-line no-reserved-keywords

        const property = SfdxConfig.allowedProperties.find((allowedProp) => allowedProp.key === key);

        if (!property) {
            throw SfdxError.create('@salesforce/core', 'config', 'UnknownConfigKey', [key]);
        }
        if (property.input) {
            if (property.input && property.input.validator(value)) {
                super.set(property.key, value);
            } else {
                throw SfdxError.create('@salesforce/core', 'config', 'InvalidConfigValue', [property.input.failedMessage]);
            }
        } else {
            super.set(property.key, value);
        }
        return this.getContents();
    }

    /**
     * Initialize the crypto dependency.
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
     * Get an individual property config.
     * @param {string} propertyName The name of the property.
     * @return {ConfigPropertyMeta} The meta config.
     */
    private getPropertyConfig(propertyName: string): ConfigPropertyMeta {
        const prop = SfdxConfig.propertyConfigMap[propertyName];

        if (!prop) {
            throw SfdxError.create('@salesforce/core', 'config', 'UnknownConfigKey', [propertyName]);
        }
        return prop;
    }

    /**
     * Encrypts and content properties that have a encryption attribute.
     * @param {boolean} encrypt `true` to encrypt.
     * @return {Promise<void>}
     */
    private async cryptProperties(encrypt: boolean) {
        const hasEncryptedProperties =
            _.some(this.entries(), ([key, val]) => !!SfdxConfig.propertyConfigMap[key].encrypted);

        if (hasEncryptedProperties) {
            await this.initCrypto();

            this.forEach((key, value) => {
                if (this.getPropertyConfig(key).encrypted) {
                    this.set(key, encrypt ? this.crypto.encrypt(value) : this.crypto.decrypt(value));
                }
            });
        }
    }
}

/**
 * Supported Org Default Types.
 * @type {object}
 */
export const ORG_DEFAULT = {
    /** {string} Default Developer Hub Username */
    DEVHUB: SfdxConfig.DEFAULT_DEV_HUB_USERNAME,
    /** {string} Default Username */
    USERNAME: SfdxConfig.DEFAULT_USERNAME,

    /**
     * List the Org defaults.
     * @returns {string[]} List of default orgs.
     */
    list() {
        return [ORG_DEFAULT.DEVHUB, ORG_DEFAULT.USERNAME];
    }
};
