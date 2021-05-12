/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { keyBy, set } from '@salesforce/kit';
import { Dictionary, ensure, isString } from '@salesforce/ts-types';
import { Logger } from '../logger';
import { Crypto } from '../crypto/crypto';
import { Messages } from '../messages';
import { sfdc } from '../util/sfdc';
import { ConfigFile } from './configFile';
import { ConfigContents, ConfigValue } from './configStore';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/core', 'config', [
  'invalidInstanceUrl',
  'invalidApiVersion',
  'invalidIsvDebuggerSid',
  'invalidIsvDebuggerUrl',
  'invalidBooleanConfigValue',
  'invalidNumberConfigValue',
  'invalidWrite',
  'unknownConfigKey',
  'invalidConfigValue',
]);

const log = Logger.childFromRoot('core:config');
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
   * Tests if the input value is valid and returns true if the input data is valid.
   *
   * @param value The input value.
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
 * ```
 * const localConfig = await Config.create({});
 * localConfig.set('defaultusername', 'username@company.org');
 * await localConfig.write();
 * ```
 * https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_config_values.htm
 */
export class Config extends ConfigFile<ConfigFile.Options> {
  /**
   * Username associated with the default dev hub org.
   */
  public static readonly DEFAULT_DEV_HUB_USERNAME: string = 'defaultdevhubusername';

  /**
   * Username associate with the default org.
   */
  public static readonly DEFAULT_USERNAME: string = 'defaultusername';

  /**
   * The sid for the debugger configuration.
   */
  public static readonly ISV_DEBUGGER_SID: string = 'isvDebuggerSid';

  /**
   * The url for the debugger configuration.
   */
  public static readonly ISV_DEBUGGER_URL: string = 'isvDebuggerUrl';

  /**
   * The api version
   */
  public static readonly API_VERSION = 'apiVersion';

  /**
   * Disables telemetry reporting
   */
  public static readonly DISABLE_TELEMETRY = 'disableTelemetry';

  /**
   * allows users to override the 10,000 result query limit
   */
  public static readonly MAX_QUERY_LIMIT = 'maxQueryLimit';

  private static get propertyConfigMap(): Dictionary<ConfigPropertyMeta> {
    return keyBy(Config.allowedProperties, 'key');
  }

  private static allowedProperties: ConfigPropertyMeta[] = [
    {
      key: 'instanceUrl',
      input: {
        // If a value is provided validate it otherwise no value is unset.
        validator: (value) => value == null || (isString(value) && sfdc.isSalesforceDomain(value)),
        failedMessage: messages.getMessage('invalidInstanceUrl'),
      },
    },
    {
      key: Config.API_VERSION,
      hidden: true,
      input: {
        // If a value is provided validate it otherwise no value is unset.
        validator: (value) => value == null || (isString(value) && sfdc.validateApiVersion(value)),
        failedMessage: messages.getMessage('invalidApiVersion'),
      },
    },
    { key: Config.DEFAULT_DEV_HUB_USERNAME },
    { key: Config.DEFAULT_USERNAME },
    {
      key: Config.ISV_DEBUGGER_SID,
      encrypted: true,
      input: {
        // If a value is provided validate it otherwise no value is unset.
        validator: (value) => value == null || isString(value),
        failedMessage: messages.getMessage('invalidIsvDebuggerSid'),
      },
    },
    {
      key: Config.ISV_DEBUGGER_URL,
      input: {
        // If a value is provided validate it otherwise no value is unset.
        validator: (value) => value == null || isString(value),
        failedMessage: messages.getMessage('invalidIsvDebuggerUrl'),
      },
    },
    {
      key: Config.DISABLE_TELEMETRY,
      input: {
        validator: (value) => value == null || ['true', 'false'].includes(value.toString()),
        failedMessage: messages.getMessage('invalidBooleanConfigValue'),
      },
    },
    // This should be brought in by a plugin, but there isn't a way to do that right now.
    {
      key: 'restDeploy',
      hidden: true,
      input: {
        validator: (value) => value != null && ['true', 'false'].includes(value.toString()),
        failedMessage: messages.getMessage('invalidBooleanConfigValue'),
      },
    },
    {
      key: Config.MAX_QUERY_LIMIT,
      input: {
        // the bit shift will remove the negative bit, and any decimal numbers
        // then the parseFloat will handle converting it to a number from a string
        validator: (value) => (value as number) >>> 0 === parseFloat(value as string) && (value as number) > 0,
        failedMessage: messages.getMessage('invalidNumberConfigValue'),
      },
    },
  ];

  private crypto?: Crypto;

  public constructor(options?: ConfigFile.Options) {
    super(options || Config.getDefaultOptions(false));

    // Resolve the config path on creation.
    this.getPath();
  }

  /**
   * Returns the default file name for a config file.
   *
   * **See** {@link SFDX_CONFIG_FILE_NAME}
   */
  public static getFileName(): string {
    return SFDX_CONFIG_FILE_NAME;
  }

  /**
   * Returns an array of objects representing the allowed config properties.
   */
  public static getAllowedProperties(): ConfigPropertyMeta[] {
    return Config.allowedProperties;
  }

  /**
   * Add an array of allowed config properties.
   *
   * @param metas Array of objects to set as the allowed config properties.
   */
  public static addAllowedProperties(metas: ConfigPropertyMeta[]): void {
    const currentMetaKeys = Object.keys(Config.propertyConfigMap);

    metas.forEach((meta) => {
      if (currentMetaKeys.includes(meta.key)) {
        log.info(`Key ${meta.key} already exists in allowedProperties, skipping.`);
        return;
      }

      Config.allowedProperties.push(meta);
    });
  }

  /**
   * Gets default options.
   *
   * @param isGlobal Make the config global.
   * @param filename Override the default file. {@link Config.getFileName}
   */
  public static getDefaultOptions(isGlobal = false, filename?: string): ConfigFile.Options {
    return {
      isGlobal,
      isState: true,
      filename: filename || this.getFileName(),
    };
  }

  /**
   * The value of a supported config property.
   *
   * @param isGlobal True for a global config. False for a local config.
   * @param propertyName The name of the property to set.
   * @param value The property value.
   */
  public static async update(isGlobal: boolean, propertyName: string, value?: ConfigValue): Promise<ConfigContents> {
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
   */
  public static async clear(): Promise<void> {
    let config = await Config.create(Config.getDefaultOptions(true));
    config.clear();
    await config.write();

    config = await Config.create(Config.getDefaultOptions(false));
    config.clear();
    await config.write();
  }
  /**
   * Read, assign, and return the config contents.
   */
  public async read(force = true): Promise<ConfigContents> {
    try {
      await super.read(false, force);
      await this.cryptProperties(false);
      return this.getContents();
    } finally {
      await this.clearCrypto();
    }
  }

  /**
   * Writes Config properties taking into account encrypted properties.
   *
   * @param newContents The new Config value to persist.
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
   * DO NOT CALL - The config file needs to encrypt values which can only be done asynchronously.
   * Call {@link SfdxConfig.write} instead.
   *
   * **Throws** *{@link SfdxError}{ name: 'InvalidWriteError' }* Always.
   *
   * @param newContents Contents to write
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public writeSync(newContents?: ConfigContents): ConfigContents {
    throw messages.createError('invalidWrite');
  }

  /**
   * Sets a value for a property.
   *
   * **Throws** *{@link SfdxError}{ name: 'UnknownConfigKeyError' }* An attempt to get a property that's not supported.
   * **Throws** *{@link SfdxError}{ name: 'InvalidConfigValueError' }* If the input validator fails.
   *
   * @param key The property to set.
   * @param value The value of the property.
   */
  public set(key: string, value: ConfigValue): ConfigContents {
    const property = Config.allowedProperties.find((allowedProp) => allowedProp.key === key);

    if (!property) {
      throw messages.createError('unknownConfigKey', [key]);
    }
    if (property.input) {
      if (property.input && property.input.validator(value)) {
        super.set(property.key, value);
      } else {
        throw messages.createError('invalidConfigValue', [property.input.failedMessage ?? '']);
      }
    } else {
      super.set(property.key, value);
    }
    return this.getContents();
  }

  /**
   * Unsets a value for a property.
   *
   * **Throws** *{@link SfdxError}{ name: 'UnknownConfigKeyError' }* If the input validator fails.
   *
   * @param key The property to unset.
   */
  public unset(key: string): boolean {
    const property = Config.allowedProperties.find((allowedProp) => allowedProp.key === key);

    if (!property) {
      throw messages.createError('unknownConfigKey', [key]);
    }
    return super.unset(property.key);
  }

  /**
   * Initializer for supported config types.
   */
  protected async init(): Promise<void> {
    // Super ConfigFile calls read, which has a dependency on crypto, which finally has a dependency on
    // Config.propertyConfigMap being set. This is why init is called after the setup.
    await super.init();
  }

  /**
   * Initialize the crypto dependency.
   */
  private async initCrypto(): Promise<void> {
    if (!this.crypto) {
      this.crypto = await Crypto.create();
    }
  }

  /**
   * Closes the crypto dependency. Crypto should be close after it's used and no longer needed.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  private async clearCrypto(): Promise<void> {
    if (this.crypto) {
      this.crypto.close();
      delete this.crypto;
    }
  }

  /**
   * Get an individual property config.
   *
   * **Throws** *{@link SfdxError}{ name: 'UnknownConfigKeyError' }* An attempt to get a property that's not supported.
   *
   * @param propertyName The name of the property.
   */
  private getPropertyConfig(propertyName: string): ConfigPropertyMeta {
    const prop = Config.propertyConfigMap[propertyName];

    if (!prop) {
      throw messages.createError('unknownConfigKey', [propertyName]);
    }
    return prop;
  }

  /**
   * Encrypts and content properties that have a encryption attribute.
   *
   * @param encrypt `true` to encrypt.
   */
  private async cryptProperties(encrypt: boolean): Promise<void> {
    const hasEncryptedProperties = this.entries().some(([key]) => {
      return !!Config.propertyConfigMap[key]?.encrypted;
    });

    if (hasEncryptedProperties) {
      await this.initCrypto();
      const crypto = ensure(this.crypto);

      this.forEach((key, value) => {
        if (this.getPropertyConfig(key).encrypted && isString(value)) {
          this.set(key, ensure(encrypt ? crypto.encrypt(value) : crypto.decrypt(value)));
        }
      });
    }
  }
}
