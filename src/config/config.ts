/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
/**
 * Supported Org Default Types.
 * @typedef {object} ORG_DEFAULT
 * @property {string} DEVHUB Default developer hub username.
 * @property {string} USERNAME Default username.
 * @property {function} list `() => string[]` List the Org defaults.
 */

import { keyBy, set } from '@salesforce/kit';
import { Dictionary, ensure, isString } from '@salesforce/ts-types';
import { Crypto } from '../crypto';
import { Messages } from '../messages';
import { SfdxError } from '../sfdxError';
import { isSalesforceDomain, validateApiVersion } from '../util/sfdc';
import { ConfigFile } from './configFile';
import { ConfigContents, ConfigValue } from './configStore';

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
  validator: (value: ConfigValue) => boolean;

  /**
   * The message to return in the error if the validation fails.
   */
  failedMessage: string;
}

/**
 * The files where sfdx config values are stored for projects and the global space.
 *
 * *Note:* It is not recommended to instantiate this object directly when resolving
 * config values. Instead use {@link ConfigAggregator}
 *
 * @extends ConfigFile
 *
 * @example
 * const localConfig = await Config.retrieve<Config>();
 * localConfig.set('defaultusername', 'username@company.org');
 * await localConfig.write();
 *
 * @see https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_config_values.htm
 */
export class Config extends ConfigFile<ConfigFile.Options> {
  /**
   * Username associated with the default dev hub org.
   * @type {string}
   */
  public static readonly DEFAULT_DEV_HUB_USERNAME: string =
    'defaultdevhubusername';

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
   * true if polling should be used over streaming when creating scratch orgs.
   * @type {string}
   */
  public static readonly USE_BACKUP_POLLING_ORG_CREATE =
    'useBackupPolling.org:create';

  /**
   * The api version
   * @type {string}
   */
  public static readonly API_VERSION = 'apiVersion';

  public static getFileName(): string {
    return SFDX_CONFIG_FILE_NAME;
  }

  /**
   * @returns {ConfigPropertyMeta[]} Returns an object representing the supported allowed properties.
   */
  public static getAllowedProperties(): ConfigPropertyMeta[] {
    if (!Config.allowedProperties) {
      throw new SfdxError(
        'Config meta information has not been initialized. Use Config.create()'
      );
    }
    return Config.allowedProperties;
  }

  public static getDefaultOptions(
    isGlobal: boolean = false,
    filename?: string
  ): ConfigFile.Options {
    return {
      isGlobal,
      isState: true,
      filename: filename || Config.getFileName()
    };
  }

  /**
   * The value of a supported config property.
   * @param {boolean} isGlobal True for a global config. False for a local config.
   * @param {string} propertyName The name of the property to set.
   * @param {ConfigValue} [value] The property value.
   * @returns {Promise<object>}
   */
  public static async update(
    isGlobal: boolean,
    propertyName: string,
    value?: ConfigValue
  ): Promise<object> {
    const config = await Config.create(Config.getDefaultOptions(isGlobal));

    const content = await config.read();

    if (value == null) {
      delete content[propertyName];
    } else {
      set(content, propertyName, value);
    }

    return config.write(content);
  }

  /**
   * Clear all the configured properties both local and global.
   * @returns {Promise<void>}
   */
  public static async clear(): Promise<void> {
    let config = await Config.create(Config.getDefaultOptions(true));
    config.clear();
    await config.write();

    config = await Config.create(Config.getDefaultOptions(false));
    config.clear();
    await config.write();
  }

  private static allowedProperties: ConfigPropertyMeta[];
  private static messages: Messages;
  private static propertyConfigMap: Dictionary<ConfigPropertyMeta>;

  private crypto?: Crypto;

  public constructor(options?: ConfigFile.Options) {
    super(options || Config.getDefaultOptions(false));
  }

  /**
   * @returns {Promise<object>} Read, assign, and return the config contents.
   */
  public async read(): Promise<ConfigContents> {
    try {
      await super.read();
      await this.cryptProperties(false);
      return this.getContents();
    } finally {
      await this.clearCrypto();
    }
  }

  /**
   * Writes Config properties taking into account encrypted properties.
   * @param {ConfigContents} newContents The new Config value to persist.
   * @return {Promise<ConfigContents>}
   */
  public async write(newContents?: ConfigContents): Promise<ConfigContents> {
    if (newContents != null) {
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
   * @param {ConfigValue} value The value of the property.
   * @returns {Promise<void>}
   * @throws {SfdxError} **`{name: 'InvalidConfigValue'}`** Invalid configuration value.
   */
  public set(key: string, value: ConfigValue): ConfigContents {
    const property = Config.allowedProperties.find(
      allowedProp => allowedProp.key === key
    );

    if (!property) {
      throw SfdxError.create('@salesforce/core', 'config', 'UnknownConfigKey', [
        key
      ]);
    }
    if (property.input) {
      if (property.input && property.input.validator(value)) {
        super.set(property.key, value);
      } else {
        throw SfdxError.create(
          '@salesforce/core',
          'config',
          'InvalidConfigValue',
          [property.input.failedMessage]
        );
      }
    } else {
      super.set(property.key, value);
    }
    return this.getContents();
  }

  protected async init(): Promise<void> {
    await super.init();
    if (!Config.messages) {
      Config.messages = Messages.loadMessages('@salesforce/core', 'config');
    }

    if (!Config.allowedProperties) {
      Config.allowedProperties = [
        {
          key: 'instanceUrl',
          input: {
            // If a value is provided validate it otherwise no value is unset.
            validator: value =>
              value == null || (isString(value) && isSalesforceDomain(value)),
            failedMessage: Config.messages.getMessage('InvalidInstanceUrl')
          }
        },
        {
          key: Config.API_VERSION,
          hidden: true,
          input: {
            // If a value is provided validate it otherwise no value is unset.
            validator: value => isString(value) && validateApiVersion(value),
            failedMessage: Config.messages.getMessage('InvalidApiVersion')
          }
        },
        { key: Config.DEFAULT_DEV_HUB_USERNAME },
        { key: Config.DEFAULT_USERNAME },
        { key: Config.ISV_DEBUGGER_SID, encrypted: true },
        { key: Config.ISV_DEBUGGER_URL },
        // This should be brought in by a plugin, but there isn't a way to do that right now.
        {
          key: 'restDeploy',
          hidden: true,
          input: {
            validator: value =>
              value != null && ['true', 'false'].includes(value.toString()),
            failedMessage: Config.messages.getMessage(
              'InvalidBooleanConfigValue'
            )
          }
        },
        {
          key: Config.USE_BACKUP_POLLING_ORG_CREATE,
          input: {
            validator: value =>
              value == null || value === 'true' || value === 'false',
            failedMessage: `${
              Config.USE_BACKUP_POLLING_ORG_CREATE
            } must be a boolean value. true/false.`
          }
        }
      ];
    }

    Config.propertyConfigMap = keyBy(Config.allowedProperties, 'key');
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
   * Closes the crypto dependency. Crypto should be close after it's used and no longer needed.
   * @return {Promise<void>}
   */
  private async clearCrypto(): Promise<void> {
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
    const prop = Config.propertyConfigMap[propertyName];

    if (!prop) {
      throw SfdxError.create('@salesforce/core', 'config', 'UnknownConfigKey', [
        propertyName
      ]);
    }
    return prop;
  }

  /**
   * Encrypts and content properties that have a encryption attribute.
   * @param {boolean} encrypt `true` to encrypt.
   * @return {Promise<void>}
   */
  private async cryptProperties(encrypt: boolean): Promise<void> {
    const hasEncryptedProperties = this.entries().some(([key]) => {
      return !!ensure(Config.propertyConfigMap[key]).encrypted;
    });

    if (hasEncryptedProperties) {
      await this.initCrypto();
      const crypto = ensure(this.crypto);

      this.forEach((key, value) => {
        if (this.getPropertyConfig(key).encrypted && isString(value)) {
          this.set(
            key,
            ensure(encrypt ? crypto.encrypt(value) : crypto.decrypt(value))
          );
        }
      });
    }
  }
}

export const ORG_DEFAULT = {
  DEVHUB: Config.DEFAULT_DEV_HUB_USERNAME,
  USERNAME: Config.DEFAULT_USERNAME,

  list(): string[] {
    return [ORG_DEFAULT.DEVHUB, ORG_DEFAULT.USERNAME];
  }
};
