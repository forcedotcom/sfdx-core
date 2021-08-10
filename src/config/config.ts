/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { dirname as pathDirname, join as pathJoin } from 'path';
import { keyBy, set } from '@salesforce/kit';
import { Dictionary, ensure, isBoolean, isString, JsonPrimitive } from '@salesforce/ts-types';
import { Global } from '../global';
import { Logger } from '../logger';
import { Messages } from '../messages';
import { sfdc } from '../util/sfdc';
import { fs } from '../util/fs';
import { SfdcUrl } from '../util/sfdcUrl';
import { OrgConfigProperties, ORG_CONFIG_ALLOWED_PROPERTIES } from '../org/orgConfigProperties';
import { ConfigFile } from './configFile';
import { ConfigContents, ConfigValue } from './configStore';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/core', 'config', [
  'deprecatedConfigKey',
  'invalidApiVersion',
  'invalidBooleanConfigValue',
  'invalidConfigValue',
  'invalidInstanceUrl',
  'invalidIsvDebuggerSid',
  'invalidIsvDebuggerUrl',
  'invalidNumberConfigValue',
  'unknownConfigKey',
]);

const log = Logger.childFromRoot('core:config');
const SFDX_CONFIG_FILE_NAME = 'sfdx-config.json';
const CONFIG_FILE_NAME = 'config.json';

/**
 * Interface for meta information about config properties
 */
export interface ConfigPropertyMeta {
  /**
   * The config property name.
   */
  key: string;

  /**
   * Description
   */
  description: string;

  /**
   * Reference to the config data input validation.
   */
  input?: ConfigPropertyMetaInput;

  /**
   * True if the property should be indirectly hidden from the user.
   */
  hidden?: boolean;

  /**
   * True if the property values should be stored encrypted.
   */
  encrypted?: boolean;

  /**
   * True if the property is deprecated
   */
  deprecated?: boolean;

  /**
   * Reference to config property name that will eventually replace this one.
   * Is only used if deprecated is set to true.
   */
  newKey?: string;
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
  failedMessage: string | ((value: ConfigValue) => string);
}

export enum SfdxPropertyKeys {
  /**
   * Username associated with the default dev hub org.
   */
  DEFAULT_DEV_HUB_USERNAME = 'defaultdevhubusername',

  /**
   * Username associate with the default org.
   */
  DEFAULT_USERNAME = 'defaultusername',

  /**
   * The sid for the debugger configuration.
   */
  ISV_DEBUGGER_SID = 'isvDebuggerSid',

  /**
   * The url for the debugger configuration.
   */
  ISV_DEBUGGER_URL = 'isvDebuggerUrl',

  /**
   * The api version
   */
  API_VERSION = 'apiVersion',

  /**
   * Disables telemetry reporting
   */
  DISABLE_TELEMETRY = 'disableTelemetry',

  /**
   * allows users to override the 10,000 result query limit
   */
  MAX_QUERY_LIMIT = 'maxQueryLimit',

  /** */
  REST_DEPLOY = 'restDeploy',

  /** */
  INSTANCE_URL = 'instanceUrl',
}

export const SFDX_ALLOWED_PROPERTIES = [
  {
    key: SfdxPropertyKeys.INSTANCE_URL,
    description: '',
    input: {
      // If a value is provided validate it otherwise no value is unset.
      validator: (value: ConfigValue) => value == null || (isString(value) && new SfdcUrl(value).isSalesforceDomain()),
      failedMessage: messages.getMessage('invalidInstanceUrl'),
    },
  },
  {
    key: SfdxPropertyKeys.API_VERSION,
    description: '',
    hidden: true,
    input: {
      // If a value is provided validate it otherwise no value is unset.
      validator: (value: ConfigValue) => value == null || (isString(value) && sfdc.validateApiVersion(value)),
      failedMessage: messages.getMessage('invalidApiVersion'),
    },
  },
  {
    key: SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME,
    newKey: OrgConfigProperties.TARGET_DEV_HUB,
    deprecated: true,
    description: '',
  },
  {
    key: SfdxPropertyKeys.DEFAULT_USERNAME,
    newKey: OrgConfigProperties.TARGET_ORG,
    deprecated: true,
    description: '',
  },
  {
    key: SfdxPropertyKeys.ISV_DEBUGGER_SID,
    description: '',
    encrypted: true,
    input: {
      // If a value is provided validate it otherwise no value is unset.
      validator: (value: ConfigValue) => value == null || isString(value),
      failedMessage: messages.getMessage('invalidIsvDebuggerSid'),
    },
  },
  {
    key: SfdxPropertyKeys.ISV_DEBUGGER_URL,
    description: '',
    input: {
      // If a value is provided validate it otherwise no value is unset.
      validator: (value: ConfigValue) => value == null || isString(value),
      failedMessage: messages.getMessage('invalidIsvDebuggerUrl'),
    },
  },
  {
    key: SfdxPropertyKeys.DISABLE_TELEMETRY,
    description: '',
    input: {
      validator: (value: ConfigValue) => value == null || ['true', 'false'].includes(value.toString()),
      failedMessage: messages.getMessage('invalidBooleanConfigValue'),
    },
  },
  // This should be brought in by a plugin, but there isn't a way to do that right now.
  {
    key: SfdxPropertyKeys.REST_DEPLOY,
    description: '',
    hidden: true,
    input: {
      validator: (value: ConfigValue) => value != null && ['true', 'false'].includes(value.toString()),
      failedMessage: messages.getMessage('invalidBooleanConfigValue'),
    },
  },
  {
    key: SfdxPropertyKeys.MAX_QUERY_LIMIT,
    description: '',
    input: {
      // the bit shift will remove the negative bit, and any decimal numbers
      // then the parseFloat will handle converting it to a number from a string
      validator: (value: ConfigValue) =>
        (value as number) >>> 0 === parseFloat(value as string) && (value as number) > 0,
      failedMessage: messages.getMessage('invalidNumberConfigValue'),
    },
  },
];

// Generic global config properties. Specific properties can be loaded like orgConfigProperties.ts.
export const SfProperty: { [index: string]: ConfigPropertyMeta } = {};

export type ConfigProperties = { [index: string]: JsonPrimitive };

/**
 * The files where sfdx config values are stored for projects and the global space.
 *
 * *Note:* It is not recommended to instantiate this object directly when resolving
 * config values. Instead use {@link ConfigAggregator}
 *
 * ```
 * const localConfig = await Config.create();
 * localConfig.set('defaultusername', 'username@company.org');
 * await localConfig.write();
 * ```
 * https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_config_values.htm
 */
export class Config extends ConfigFile<ConfigFile.Options, ConfigProperties> {
  private static allowedProperties: ConfigPropertyMeta[] = [
    ...SFDX_ALLOWED_PROPERTIES,
    ...ORG_CONFIG_ALLOWED_PROPERTIES,
  ];

  private sfdxPath?: string;

  public constructor(options?: ConfigFile.Options) {
    super(
      Object.assign(
        {
          isGlobal: false,
        },
        options,
        {
          // Don't let consumers of config override this. If they really really want to,
          // they can extend this class.
          isState: true,
          filename: Config.getFileName(),
          stateFolder: Global.SF_STATE_FOLDER,
        }
      )
    );

    // Resolve the config path on creation.
    this.getPath();
  }

  /**
   * Returns the default file name for a config file.
   *
   * **See** {@link CONFIG_FILE_NAME}
   */
  public static getFileName(): string {
    return CONFIG_FILE_NAME;
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
    const currentMetaKeys = Object.keys(Config.propertyConfigMap());

    metas.forEach((meta) => {
      if (currentMetaKeys.includes(meta.key)) {
        log.info(`Key ${meta.key} already exists in allowedProperties, skipping.`);
        return;
      }

      Config.allowedProperties.push(meta);
    });
  }

  /**
   * The value of a supported config property.
   *
   * @param isGlobal True for a global config. False for a local config.
   * @param propertyName The name of the property to set.
   * @param value The property value.
   */
  public static async update(isGlobal: boolean, propertyName: string, value?: ConfigValue): Promise<ConfigContents> {
    const config = await Config.create({ isGlobal });

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
    const globalConfig = await Config.create({ isGlobal: true });
    globalConfig.clear();
    await globalConfig.write();

    const localConfig = await Config.create();
    localConfig.clear();
    await localConfig.write();
  }

  private static propertyConfigMap(): Dictionary<ConfigPropertyMeta> {
    return keyBy(Config.allowedProperties, 'key');
  }

  /**
   * Read, assign, and return the config contents.
   */
  public async read(force = true): Promise<ConfigProperties> {
    try {
      const config = await super.read(false, force);
      // Merge .sfdx/sfdx-config.json and .sf/config.json
      const sfdxConfig = Global.SFDX_INTEROPERABILITY ? this.readSfdxConfigSync() : {};
      this.setContents(Object.assign(sfdxConfig, config));
      await this.cryptProperties(false);
      return this.getContents();
    } finally {
      await this.clearCrypto();
    }
  }

  public readSync(force = true): ConfigProperties {
    const config = super.readSync(false, force);
    // Merge .sfdx/sfdx-config.json and .sf/config.json
    const sfdxConfig = Global.SFDX_INTEROPERABILITY ? this.readSfdxConfigSync() : {};
    this.setContents(Object.assign(sfdxConfig, config));
    return this.getContents();
  }

  /**
   * Writes Config properties taking into account encrypted properties.
   *
   * @param newContents The new Config value to persist.
   */
  public async write(newContents?: ConfigProperties): Promise<ConfigProperties> {
    if (newContents != null) {
      this.setContents(newContents);
    }

    await this.cryptProperties(true);

    await super.write();
    if (Global.SFDX_INTEROPERABILITY) await this.writeSfdxConfig();

    await this.cryptProperties(false);

    return this.getContents();
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
  public set(key: string, value: JsonPrimitive): ConfigProperties {
    const property = Config.allowedProperties.find((allowedProp) => allowedProp.key === key);

    if (!property) {
      throw messages.createError('unknownConfigKey', [key]);
    }
    if (property.deprecated && property.newKey) {
      throw messages.createError('deprecatedConfigKey', [key, property.newKey]);
    }

    if (property.input) {
      if (property.input && property.input.validator(value)) {
        super.set(property.key, value);
      } else {
        let valueError: string = value?.toString() || '';
        if (property.input.failedMessage) {
          valueError = isString(property.input.failedMessage)
            ? property.input.failedMessage
            : property.input.failedMessage(value);
        }
        throw messages.createError('invalidConfigValue', [valueError]);
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

  private readSfdxConfigSync(): ConfigProperties {
    try {
      const contents = fs.readJsonMapSync(this.getSfdxPath());
      return this.normalize(contents as ConfigProperties, 'toNew');
    } catch (error) {
      /* Do nothing */
      return {};
    }
  }

  private async writeSfdxConfig() {
    try {
      await fs.mkdirp(pathDirname(this.getSfdxPath()));
      this.logger.info(`Writing to config file: ${this.getPath()}`);
      const mapped = this.normalize(this.toObject() as ConfigProperties, 'toOld');
      await fs.writeJson(this.getSfdxPath(), mapped);
    } catch (error) {
      /* Do nothing */
    }
  }

  /**
   * If toNew is specified: migrate all deprecated configs with a newKey to the newKey.
   * - For example, defaultusername will be renamed to target-org.
   *
   * If toOld is specified: migrate all deprecated configs back to their original key.
   * - For example, target-org will be renamed to defaultusername.
   */
  private normalize(contents: ConfigProperties, direction: 'toNew' | 'toOld'): ConfigProperties {
    const mapped = {} as ConfigProperties;
    for (const [key, value] of Object.entries(contents)) {
      const propConfig =
        direction === 'toNew'
          ? this.getPropertyConfig(key)
          : Config.allowedProperties.find((c) => c.newKey === key) ?? ({} as ConfigPropertyMeta);
      if (propConfig.deprecated && propConfig.newKey) {
        const normalizedKey = direction === 'toNew' ? propConfig.newKey : propConfig.key;
        mapped[normalizedKey] = value;
      } else {
        mapped[key] = value;
      }
    }
    return mapped;
  }

  private getSfdxPath(): string {
    if (!this.sfdxPath) {
      const stateFolder = Global.SFDX_STATE_FOLDER;
      const fileName = SFDX_CONFIG_FILE_NAME;

      const _isGlobal: boolean = isBoolean(this.options.isGlobal) && this.options.isGlobal;
      const _isState: boolean = isBoolean(this.options.isState) && this.options.isState;

      // Don't let users store config files in homedir without being in the state folder.
      let configRootFolder = this.options.rootFolder
        ? this.options.rootFolder
        : ConfigFile.resolveRootFolderSync(!!this.options.isGlobal);

      if (_isGlobal || _isState) {
        configRootFolder = pathJoin(configRootFolder, stateFolder);
      }

      this.sfdxPath = pathJoin(configRootFolder, fileName);
    }
    return this.sfdxPath;
  }

  /**
   * Get an individual property config.
   *
   * **Throws** *{@link SfdxError}{ name: 'UnknownConfigKeyError' }* An attempt to get a property that's not supported.
   *
   * @param propertyName The name of the property.
   */
  private getPropertyConfig(propertyName: string): ConfigPropertyMeta {
    const prop = Config.propertyConfigMap()[propertyName];

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
      return !!Config.propertyConfigMap()[key]?.encrypted;
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
