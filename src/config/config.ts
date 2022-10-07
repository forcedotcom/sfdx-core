/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { dirname as pathDirname, join as pathJoin } from 'path';
import * as fs from 'fs';
import { keyBy, parseJsonMap, set } from '@salesforce/kit';
import { Dictionary, ensure, isString, JsonPrimitive, Nullable } from '@salesforce/ts-types';
import { Global } from '../global';
import { Logger } from '../logger';
import { Messages } from '../messages';
import { sfdc } from '../util/sfdc';
import { SfdcUrl } from '../util/sfdcUrl';
import { ORG_CONFIG_ALLOWED_PROPERTIES, OrgConfigProperties } from '../org/orgConfigProperties';
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
  'invalidWrite',
  'unknownConfigKey',
  'defaultUsername',
  'defaultDevHubUsername',
  'isvDebuggerSid',
  'isvDebuggerUrl',
  'apiVersion',
  'disableTelemetry',
  'maxQueryLimit',
  'restDeploy',
  'instanceUrl',
  'disable-telemetry',
  'customOrgMetadataTemplates',
]);

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

export enum SfConfigProperties {
  /**
   * Disables telemetry reporting
   */
  DISABLE_TELEMETRY = 'disable-telemetry',
}

export const SF_ALLOWED_PROPERTIES = [
  {
    key: SfConfigProperties.DISABLE_TELEMETRY,
    description: messages.getMessage(SfConfigProperties.DISABLE_TELEMETRY),
    input: {
      validator: (value: ConfigValue): boolean => value == null || ['true', 'false'].includes(value.toString()),
      failedMessage: messages.getMessage('invalidBooleanConfigValue'),
    },
  },
];

export enum SfdxPropertyKeys {
  /**
   * Username associated with the default dev hub org.
   *
   * @deprecated Replaced by OrgConfigProperties.TARGET_DEV_HUB in v3 {@link https://github.com/forcedotcom/sfdx-core/blob/v3/MIGRATING_V2-V3.md#config}
   * will remain in v3 for the foreseeable future so that `sfdx-core` can map between `sf` and `sfdx` config values
   */
  DEFAULT_DEV_HUB_USERNAME = 'defaultdevhubusername',

  /**
   * Username associate with the default org.
   *
   * @deprecated Replaced by OrgConfigProperties.TARGET_ORG in v3 {@link https://github.com/forcedotcom/sfdx-core/blob/v3/MIGRATING_V2-V3.md#config}
   * will remain in v3 for the foreseeable future so that `sfdx-core` can map between `sf` and `sfdx` config values
   */
  DEFAULT_USERNAME = 'defaultusername',

  /**
   * The sid for the debugger configuration.
   *
   * @deprecated Replaced by OrgConfigProperties.ORG_ISV_DEBUGGER_SID in v3 {@link https://github.com/forcedotcom/sfdx-core/blob/v3/MIGRATING_V2-V3.md#config}
   */
  ISV_DEBUGGER_SID = 'isvDebuggerSid',

  /**
   * The url for the debugger configuration.
   *
   * @deprecated Replaced by OrgConfigProperties.ORG_ISV_DEBUGGER_URL in v3 {@link https://github.com/forcedotcom/sfdx-core/blob/v3/MIGRATING_V2-V3.md#config}
   */
  ISV_DEBUGGER_URL = 'isvDebuggerUrl',

  /**
   * The api version
   *
   * @deprecated Replaced by OrgConfigProperties.ORG_API_VERSION in v3 {@link https://github.com/forcedotcom/sfdx-core/blob/v3/MIGRATING_V2-V3.md#config}
   */
  API_VERSION = 'apiVersion',

  /**
   * Disables telemetry reporting
   *
   * @deprecated Replaced by SfPropertyKeys.DISABLE_TELEMETRY in v3 {@link https://github.com/forcedotcom/sfdx-core/blob/v3/MIGRATING_V2-V3.md#config}
   */
  DISABLE_TELEMETRY = 'disableTelemetry',

  /**
   * Custom templates repo or local location.
   *
   * @deprecated Replaced by OrgConfigProperties.ORG_CUSTOM_METADATA_TEMPLATES in v3 {@link https://github.com/forcedotcom/sfdx-core/blob/v3/MIGRATING_V2-V3.md#config}
   */
  CUSTOM_ORG_METADATA_TEMPLATES = 'customOrgMetadataTemplates',

  /**
   * allows users to override the 10,000 result query limit
   *
   * @deprecated Replaced by OrgConfigProperties.ORG_MAX_QUERY_LIMIT in v3 {@link https://github.com/forcedotcom/sfdx-core/blob/v3/MIGRATING_V2-V3.md#config}
   */
  MAX_QUERY_LIMIT = 'maxQueryLimit',

  /**
   * @deprecated
   */
  REST_DEPLOY = 'restDeploy',

  /**
   * @deprecated Replaced by OrgConfigProperties.ORG_INSTANCE_URL in v3 {@link https://github.com/forcedotcom/sfdx-core/blob/v3/MIGRATING_V2-V3.md#config}
   */
  INSTANCE_URL = 'instanceUrl',
}

export const SFDX_ALLOWED_PROPERTIES = [
  {
    key: SfdxPropertyKeys.INSTANCE_URL,
    description: messages.getMessage(SfdxPropertyKeys.INSTANCE_URL),
    newKey: OrgConfigProperties.ORG_INSTANCE_URL,
    deprecated: true,
    input: {
      // If a value is provided validate it otherwise no value is unset.
      validator: (value: ConfigValue): boolean => {
        if (value == null) return true;
        // validate if the value is a string and is a valid url and is either a salesforce domain
        // or an internal url.
        return (
          isString(value) &&
          SfdcUrl.isValidUrl(value) &&
          (new SfdcUrl(value).isSalesforceDomain() || new SfdcUrl(value).isInternalUrl())
        );
      },
      failedMessage: messages.getMessage('invalidInstanceUrl'),
    },
  },
  {
    key: SfdxPropertyKeys.API_VERSION,
    newKey: OrgConfigProperties.ORG_API_VERSION,
    deprecated: true,
    description: messages.getMessage(SfdxPropertyKeys.API_VERSION),
    hidden: true,
    input: {
      // If a value is provided validate it otherwise no value is unset.
      validator: (value: ConfigValue): boolean => value == null || (isString(value) && sfdc.validateApiVersion(value)),
      failedMessage: messages.getMessage('invalidApiVersion'),
    },
  },
  {
    // will remain in v3 for the foreseeable future so that `sfdx-core` can map between `sf` and `sfdx` config values
    key: SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME,
    newKey: OrgConfigProperties.TARGET_DEV_HUB,
    deprecated: true,
    description: messages.getMessage('defaultDevHubUsername'),
  },
  {
    // will remain in v3 for the foreseeable future so that `sfdx-core` can map between `sf` and `sfdx` config values
    key: SfdxPropertyKeys.DEFAULT_USERNAME,
    newKey: OrgConfigProperties.TARGET_ORG,
    deprecated: true,
    description: messages.getMessage('defaultUsername'),
  },
  {
    key: SfdxPropertyKeys.ISV_DEBUGGER_SID,
    newKey: OrgConfigProperties.ORG_ISV_DEBUGGER_SID,
    deprecated: true,
    description: messages.getMessage(SfdxPropertyKeys.ISV_DEBUGGER_SID),
    encrypted: true,
    input: {
      // If a value is provided validate it otherwise no value is unset.
      validator: (value: ConfigValue): boolean => value == null || isString(value),
      failedMessage: messages.getMessage('invalidIsvDebuggerSid'),
    },
  },
  {
    key: SfdxPropertyKeys.ISV_DEBUGGER_URL,
    newKey: OrgConfigProperties.ORG_ISV_DEBUGGER_URL,
    deprecated: true,
    description: messages.getMessage(SfdxPropertyKeys.ISV_DEBUGGER_URL),
    input: {
      // If a value is provided validate it otherwise no value is unset.
      validator: (value: ConfigValue): boolean => value == null || isString(value),
      failedMessage: messages.getMessage('invalidIsvDebuggerUrl'),
    },
  },
  {
    key: SfdxPropertyKeys.DISABLE_TELEMETRY,
    newKey: SfConfigProperties.DISABLE_TELEMETRY,
    deprecated: true,
    description: messages.getMessage(SfdxPropertyKeys.DISABLE_TELEMETRY),
    input: {
      validator: (value: ConfigValue): boolean => value == null || ['true', 'false'].includes(value.toString()),
      failedMessage: messages.getMessage('invalidBooleanConfigValue'),
    },
  },
  {
    key: SfdxPropertyKeys.CUSTOM_ORG_METADATA_TEMPLATES,
    newKey: OrgConfigProperties.ORG_CUSTOM_METADATA_TEMPLATES,
    deprecated: true,
    description: messages.getMessage(SfdxPropertyKeys.CUSTOM_ORG_METADATA_TEMPLATES),
  },
  {
    key: SfdxPropertyKeys.REST_DEPLOY,
    description: messages.getMessage(SfdxPropertyKeys.REST_DEPLOY),
    hidden: true,
    newKey: 'org-metadata-rest-deploy',
    deprecated: true,
    input: {
      validator: (value: ConfigValue): boolean => value != null && ['true', 'false'].includes(value.toString()),
      failedMessage: messages.getMessage('invalidBooleanConfigValue'),
    },
  },
  {
    key: SfdxPropertyKeys.MAX_QUERY_LIMIT,
    description: messages.getMessage(SfdxPropertyKeys.MAX_QUERY_LIMIT),
    hidden: true,
    newKey: OrgConfigProperties.ORG_MAX_QUERY_LIMIT,
    deprecated: true,
    input: {
      // the bit shift will remove the negative bit, and any decimal numbers
      // then the parseFloat will handle converting it to a number from a string
      validator: (value: ConfigValue): boolean =>
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
 * localConfig.set('target-org', 'username@company.org');
 * await localConfig.write();
 * ```
 * https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_config_values.htm
 */
export class Config extends ConfigFile<ConfigFile.Options, ConfigProperties> {
  private static allowedProperties: ConfigPropertyMeta[] = [
    ...SFDX_ALLOWED_PROPERTIES,
    ...SF_ALLOWED_PROPERTIES,
    ...ORG_CONFIG_ALLOWED_PROPERTIES,
  ];

  private sfdxConfig: SfdxConfig;

  public constructor(options?: ConfigFile.Options) {
    super(
      Object.assign(
        {
          isGlobal: false,
        },
        options ?? {},
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
    this.sfdxConfig = new SfdxConfig(this.options, this);
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

    // If logger is needed elsewhere in this file, do not move this outside of the Config class.
    // It was causing issues with Bunyan log rotation. See https://github.com/forcedotcom/sfdx-core/pull/562
    const logger = Logger.childFromRoot('core:config');

    metas.forEach((meta) => {
      if (currentMetaKeys.includes(meta.key)) {
        logger.info(`Key ${meta.key} already exists in allowedProperties, skipping.`);
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

  public static getPropertyConfigMeta(propertyName: string): Nullable<ConfigPropertyMeta> {
    const prop = Config.propertyConfigMap()[propertyName];
    if (prop?.deprecated && prop?.newKey) {
      return Config.propertyConfigMap()[prop.newKey];
    }

    return prop;
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
      const merged = this.sfdxConfig.merge(config);
      this.setContents(merged);
      await this.cryptProperties(false);
      return this.getContents();
    } finally {
      await this.clearCrypto();
    }
  }

  public readSync(force = true): ConfigProperties {
    const config = super.readSync(false, force);
    // Merge .sfdx/sfdx-config.json and .sf/config.json
    const merged = this.sfdxConfig.merge(config);
    this.setContents(merged);
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
    if (Global.SFDX_INTEROPERABILITY) await this.sfdxConfig.write();

    await this.cryptProperties(false);

    return this.getContents();
  }

  /**
   * DO NOT CALL - The config file needs to encrypt values which can only be done asynchronously.
   * Call {@link SfdxConfig.write} instead.
   *
   * **Throws** *{@link SfError}{ name: 'InvalidWriteError' }* Always.
   *
   * @param newContents Contents to write
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  public writeSync(newContents?: ConfigProperties): ConfigProperties {
    throw messages.createError('invalidWrite');
  }

  /**
   * Sets a value for a property.
   *
   * **Throws** *{@link SfError}{ name: 'UnknownConfigKeyError' }* An attempt to get a property that's not supported.
   * **Throws** *{@link SfError}{ name: 'InvalidConfigValueError' }* If the input validator fails.
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
      if (property.input?.validator(value)) {
        super.set(property.key, value);
      } else {
        let valueError: string = value?.toString() ?? '';
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
   * **Throws** *{@link SfError}{ name: 'UnknownConfigKeyError' }* If the input validator fails.
   *
   * @param key The property to unset.
   */
  public unset(key: string): boolean {
    const property = Config.allowedProperties.find((allowedProp) => allowedProp.key === key);

    if (!property) {
      throw messages.createError('unknownConfigKey', [key]);
    }

    if (property.deprecated && property.newKey) {
      throw messages.createError('deprecatedConfigKey', [key, property.newKey]);
    }

    return super.unset(property.key);
  }

  /**
   * Get an individual property config.
   *
   * **Throws** *{@link SfError}{ name: 'UnknownConfigKeyError' }* An attempt to get a property that's not supported.
   *
   * @param propertyName The name of the property.
   */
  // eslint-disable-next-line class-methods-use-this
  public getPropertyConfig(propertyName: string): ConfigPropertyMeta {
    const prop = Config.propertyConfigMap()[propertyName];

    if (!prop) {
      throw messages.createError('unknownConfigKey', [propertyName]);
    }
    return prop;
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
   * Encrypts and content properties that have a encryption attribute.
   *
   * @param encrypt `true` to encrypt.
   */
  private async cryptProperties(encrypt: boolean): Promise<void> {
    const hasEncryptedProperties = this.entries().some(([key]) => !!Config.propertyConfigMap()[key]?.encrypted);

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

export class SfdxConfig {
  private sfdxPath: string;
  public constructor(private options: ConfigFile.Options = {}, private config: Config) {
    this.sfdxPath = this.getSfdxPath();
  }

  /**
   * If Global.SFDX_INTEROPERABILITY is enabled, merge the sfdx config into the sf config
   */
  public merge(config: ConfigProperties): ConfigProperties | undefined {
    if (!Global.SFDX_INTEROPERABILITY) return config;
    const sfdxConfig = this.readSync();

    const sfdxPropKeys = Object.values(SfdxPropertyKeys) as string[];

    // Get a list of config keys that are NOT provided by SfdxPropertyKeys
    const nonSfdxPropKeys = Config.getAllowedProperties()
      .filter((p) => !sfdxPropKeys.includes(p.key))
      .map((p) => p.key);

    // Remove any config from .sf that isn't also in .sfdx
    // This handles the scenario where a config has been deleted
    // from .sfdx and we want to mirror that change in .sf
    for (const key of nonSfdxPropKeys) {
      if (!sfdxConfig[key]) delete config[key];
    }

    return Object.assign(config, sfdxConfig);
  }

  public async write(config = this.config.toObject()): Promise<void> {
    try {
      const translated = this.translate(config as ConfigProperties, 'toOld');
      const sfdxPath = this.getSfdxPath();
      await fs.promises.mkdir(pathDirname(sfdxPath), { recursive: true });
      await fs.promises.writeFile(sfdxPath, JSON.stringify(translated, null, 2));
    } catch (error) {
      /* Do nothing */
    }
  }

  private readSync(): ConfigProperties {
    try {
      const contents = parseJsonMap<ConfigProperties>(fs.readFileSync(this.getSfdxPath(), 'utf8'));
      return this.translate(contents, 'toNew');
    } catch (error) {
      /* Do nothing */
      return {};
    }
  }

  private getSfdxPath(): string {
    if (!this.sfdxPath) {
      const stateFolder = Global.SFDX_STATE_FOLDER;
      const fileName = SFDX_CONFIG_FILE_NAME;

      // Don't let users store config files in homedir without being in the state folder.
      let configRootFolder = this.options.rootFolder
        ? this.options.rootFolder
        : ConfigFile.resolveRootFolderSync(!!this.options.isGlobal);

      if (this.options.isGlobal === true || this.options.isState === true) {
        configRootFolder = pathJoin(configRootFolder, stateFolder);
      }

      this.sfdxPath = pathJoin(configRootFolder, fileName);
    }
    return this.sfdxPath;
  }

  /**
   * If toNew is specified: migrate all deprecated configs with a newKey to the newKey.
   * - For example, defaultusername will be renamed to target-org.
   *
   * If toOld is specified: migrate all deprecated configs back to their original key.
   * - For example, target-org will be renamed to defaultusername.
   */
  private translate(contents: ConfigProperties, direction: 'toNew' | 'toOld'): ConfigProperties {
    const translated = {} as ConfigProperties;
    for (const [key, value] of Object.entries(contents)) {
      const propConfig =
        direction === 'toNew'
          ? this.config.getPropertyConfig(key)
          : Config.getAllowedProperties().find((c) => c.newKey === key) ?? ({} as ConfigPropertyMeta);
      if (propConfig.deprecated && propConfig.newKey) {
        const normalizedKey = direction === 'toNew' ? propConfig.newKey : propConfig.key;
        translated[normalizedKey] = value;
      } else {
        translated[key] = value;
      }
    }
    return translated;
  }
}
