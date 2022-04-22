/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AsyncOptionalCreatable, merge, sortBy } from '@salesforce/kit';
import { AnyJson, Dictionary, isArray, isJsonMap, JsonMap, Optional } from '@salesforce/ts-types';
import { snakeCase } from 'change-case';
import { Messages } from '../messages';
import { EnvVars } from './envVars';
import { Config, ConfigPropertyMeta } from './config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/core', 'config', ['unknownConfigKey', 'deprecatedConfigKey']);

const propertyToEnvName = (property: string, prefix = 'SFDX_'): string =>
  `${prefix || ''}${snakeCase(property).toUpperCase()}`;

/**
 * Information about a config property.
 */
export interface ConfigInfo {
  /**
   * key The config key.
   */
  key: string;

  /**
   * The location of the config property.
   */
  location?: ConfigAggregator.Location;

  /**
   * The config value.
   */
  value?: AnyJson;

  /**
   * The path of the config value.
   */
  path?: string;
  /**
   * `true` if the config property is in the local project.
   */
  isLocal: () => boolean;

  /**
   * `true` if the config property is in the global space.
   */
  isGlobal: () => boolean;

  /**
   * `true` if the config property is an environment variable.
   */
  isEnvVar: () => boolean;

  /**
   * True if the config property is deprecated.
   */
  deprecated?: boolean;
}

/**
 * Aggregate global and local project config files, as well as environment variables for
 * `sfdx-config.json`. The resolution happens in the following bottom-up order:
 *
 * 1. Environment variables  (`SFDX_LOG_LEVEL`)
 * 1. Workspace settings  (`<workspace-root>/.sfdx/sfdx-config.json`)
 * 1. Global settings  (`$HOME/.sfdx/sfdx-config.json`)
 *
 * Use {@link ConfigAggregator.create} to instantiate the aggregator.
 *
 * ```
 * const aggregator = await ConfigAggregator.create();
 * console.log(aggregator.getPropertyValue('target-org'));
 * ```
 */
export class ConfigAggregator extends AsyncOptionalCreatable<JsonMap> {
  private static instance: AsyncOptionalCreatable;
  private static encrypted = true;

  // Initialized in loadProperties
  private allowedProperties!: ConfigPropertyMeta[];
  private localConfig?: Config;
  private globalConfig: Config;
  private envVars!: EnvVars;

  private get config(): JsonMap {
    return this.resolveProperties(this.globalConfig.getContents(), this.localConfig && this.localConfig.getContents());
  }

  /**
   * **Do not directly construct instances of this class -- use {@link ConfigAggregator.create} instead.**
   *
   * @ignore
   */
  public constructor(options?: JsonMap) {
    super(options || {});

    // Don't throw an project error with the aggregator, since it should resolve to global if
    // there is no project.
    try {
      this.localConfig = new Config(Config.getDefaultOptions(false));
    } catch (err) {
      if ((err as Error).name !== 'InvalidProjectWorkspaceError') {
        throw err;
      }
    }

    this.globalConfig = new Config(Config.getDefaultOptions(true));

    this.setAllowedProperties(Config.getAllowedProperties());
  }
  /**
   * Get the static ConfigAggregator instance. If one doesn't exist, one will be created with
   * the **encrypted** config values. Encrypted config values need to be resolved
   * asynchronously by calling {@link ConfigAggregator.reload}
   */
  // Use typing from AsyncOptionalCreatable to support extending ConfigAggregator.
  // We really don't want ConfigAggregator extended but typescript doesn't support a final.
  public static getInstance<P, T extends AsyncOptionalCreatable<P>>(this: new () => T): T {
    if (!ConfigAggregator.instance) {
      ConfigAggregator.instance = new this();
      (ConfigAggregator.instance as ConfigAggregator).loadPropertiesSync();
    }
    return ConfigAggregator.instance as T;
  }

  // Use typing from AsyncOptionalCreatable to support extending ConfigAggregator.
  // We really don't want ConfigAggregator extended but typescript doesn't support a final.
  public static async create<P, T extends AsyncOptionalCreatable<P>>(
    this: new (options?: P) => T,
    options?: P
  ): Promise<T> {
    let config: ConfigAggregator = ConfigAggregator.instance as ConfigAggregator;
    if (!config) {
      config = ConfigAggregator.instance = new this(options) as unknown as ConfigAggregator;
      await config.init();
    }
    if (ConfigAggregator.encrypted) {
      await config.loadProperties();
    }
    return ConfigAggregator.instance as T;
  }

  /**
   * Get the info for a given key. If the ConfigAggregator was not asynchronously created OR
   * the {@link ConfigAggregator.reload} was not called, the config value may be encrypted.
   *
   * @param key The config key.
   */
  public static getValue(key: string): ConfigInfo {
    return this.getInstance().getInfo(key);
  }

  /**
   * Initialize this instances async dependencies.
   */
  public async init(): Promise<void> {
    await this.loadProperties();
  }

  /**
   * Get a resolved config property.
   *
   * **Throws** *{@link SfError}{ name: 'UnknownConfigKeyError' }* An attempt to get a property that's not supported.
   *
   * @param key The key of the property.
   */
  public getPropertyValue<T extends AnyJson>(key: string): Optional<T> {
    if (!this.getAllowedProperties().some((element) => key === element.key)) {
      throw messages.createError('unknownConfigKey', [key]);
    }
    if (this.getConfig()[key]) {
      return this.getConfig()[key] as T;
    }
    const newKey = this.getPropertyMeta(key).newKey;
    if (newKey) {
      return this.getConfig()[newKey] as T;
    }
  }

  /**
   * Get a resolved config property meta.
   *
   * **Throws** *{@link SfError}{ name: 'UnknownConfigKeyError' }* An attempt to get a property that's not supported.
   *
   * @param key The key of the property.
   */
  public getPropertyMeta(key: string): ConfigPropertyMeta {
    const match = this.getAllowedProperties().find((element) => key === element.key);
    if (match) {
      return match;
    } else {
      throw messages.createError('unknownConfigKey', [key]);
    }
  }

  /**
   * Get a resolved config property.
   *
   * @param key The key of the property.
   * @param throwOnDeprecation True, if you want an error throw when reading a deprecated config
   */
  public getInfo(key: string, throwOnDeprecation = false): ConfigInfo {
    const meta = this.getPropertyMeta(key);
    if (throwOnDeprecation && meta.deprecated && meta.newKey) {
      throw messages.createError('deprecatedConfigKey', [key, meta.newKey]);
    }
    const location = this.getLocation(key);
    return {
      key,
      location,
      value: this.getPropertyValue(key),
      path: this.getPath(key),
      isLocal: () => location === ConfigAggregator.Location.LOCAL,
      isGlobal: () => location === ConfigAggregator.Location.GLOBAL,
      isEnvVar: () => location === ConfigAggregator.Location.ENVIRONMENT,
      deprecated: meta.deprecated ?? false,
    };
  }

  /**
   * Gets a resolved config property location.
   *
   * For example, `getLocation('logLevel')` will return:
   * 1. `Location.GLOBAL` if resolved to an environment variable.
   * 1. `Location.LOCAL` if resolved to local project config.
   * 1. `Location.ENVIRONMENT` if resolved to the global config.
   *
   * @param key The key of the property.
   */
  public getLocation(key: string): Optional<ConfigAggregator.Location> {
    if (this.getEnvVars().get(key) != null) {
      return ConfigAggregator.Location.ENVIRONMENT;
    }
    if (this.localConfig && this.localConfig.get(key)) {
      return ConfigAggregator.Location.LOCAL;
    }
    if (this.globalConfig && this.globalConfig.get(key)) {
      return ConfigAggregator.Location.GLOBAL;
    }
    // no location found for the key.  Try it under the new key name for backwards compatibility.
    const newKey = this.getPropertyMeta(key).newKey;
    if (!newKey) {
      return;
    }
    if (this.getEnvVars().get(newKey) != null) {
      return ConfigAggregator.Location.ENVIRONMENT;
    }
    if (this.localConfig && this.localConfig.get(newKey)) {
      return ConfigAggregator.Location.LOCAL;
    }
    if (this.globalConfig && this.globalConfig.get(newKey)) {
      return ConfigAggregator.Location.GLOBAL;
    }
  }

  /**
   * Get a resolved file path or environment variable name of the property.
   *
   * For example, `getPath('logLevel')` will return:
   * 1. `$SFDX_LOG_LEVEL` if resolved to an environment variable.
   * 1. `./.sfdx/sfdx-config.json` if resolved to the local config.
   * 1. `~/.sfdx/sfdx-config.json` if resolved to the global config.
   * 1. `undefined`, if not resolved.
   *
   * **Note:** that the path returned may be the absolute path instead of
   * relative paths such as `./` and `~/`.
   *
   * @param key The key of the property.
   */
  public getPath(key: string): Optional<string> {
    if (this.envVars.getString(key) != null) {
      return `$${propertyToEnvName(key)}`;
    }
    if (this.localConfig && this.localConfig.getContents()[key] != null) {
      return this.localConfig.getPath();
    }
    if (this.globalConfig.getContents()[key] != null) {
      return this.globalConfig.getPath();
    }
    // no path found for the key.  Try it under the new key name for backwards compatibility.
    const newKey = this.getPropertyMeta(key).newKey;
    if (!newKey) {
      return;
    }
    if (this.envVars.getString(newKey) != null) {
      return `$${propertyToEnvName(newKey)}`;
    }
    if (this.localConfig && this.localConfig.getContents()[newKey] != null) {
      return this.localConfig.getPath();
    }
    if (this.globalConfig.getContents()[newKey] != null) {
      return this.globalConfig.getPath();
    }
  }

  /**
   * Get all resolved config property keys, values, locations, and paths.
   *
   * ```
   * > console.log(aggregator.getConfigInfo());
   * [
   *     { key: 'logLevel', val: 'INFO', location: 'Environment', path: '$SFDX_LOG_LEVEL'}
   *     { key: 'target-org', val: '<username>', location: 'Local', path: './.sf/config.json'}
   * ]
   * ```
   */
  public getConfigInfo(): ConfigInfo[] {
    const infos = Object.keys(this.getConfig())
      .filter((key) => this.getAllowedProperties().some((element) => key === element.key))
      .map((key) => this.getInfo(key))
      .filter((info): info is ConfigInfo => !!info);
    return sortBy(infos, 'key');
  }

  /**
   * Get the local project config instance.
   */
  public getLocalConfig(): Config | undefined {
    return this.localConfig;
  }

  /**
   * Get the global config instance.
   */
  public getGlobalConfig(): Config {
    return this.globalConfig;
  }

  /**
   * Get the resolved config object from the local, global and environment config instances.
   */
  public getConfig(): JsonMap {
    return this.config;
  }

  /**
   * Get the config properties that are environment variables.
   */
  public getEnvVars(): Map<string, string> {
    return this.envVars.asMap();
  }

  /**
   * Re-read all property configurations from disk.
   */
  public async reload(): Promise<ConfigAggregator> {
    await this.loadProperties();
    return this;
  }

  /**
   * Add an allowed config property.
   */
  public addAllowedProperties(configMetas: ConfigPropertyMeta | ConfigPropertyMeta[]): void {
    if (isArray(configMetas)) {
      this.allowedProperties.push(...configMetas);
    } else {
      this.allowedProperties.push(configMetas);
    }
  }

  /**
   * Loads all the properties and aggregates them according to location.
   */
  private async loadProperties(): Promise<void> {
    this.resolveProperties(await this.globalConfig.read(), this.localConfig && (await this.localConfig.read()));
    ConfigAggregator.encrypted = false;
  }

  /**
   * Loads all the properties and aggregates them according to location.
   */
  private loadPropertiesSync(): void {
    this.resolveProperties(this.globalConfig.readSync(), this.localConfig && this.localConfig.readSync());
  }

  private resolveProperties(globalConfig: JsonMap, localConfig?: JsonMap): JsonMap {
    this.envVars = new EnvVars();

    for (const property of this.getAllowedProperties()) {
      this.envVars.setPropertyFromEnv(property.key);
    }

    // Global config must be read first so it is on the left hand of the
    // object assign and is overwritten by the local config.

    const configs = [globalConfig];

    // We might not be in a project workspace
    if (localConfig) {
      configs.push(localConfig);
    }

    configs.push(this.envVars.asDictionary() as Dictionary<string>);

    const json: JsonMap = {};
    const reduced = configs.filter(isJsonMap).reduce((acc: JsonMap, el: AnyJson) => merge(acc, el), json);
    return reduced;
  }

  /**
   * Get the allowed properties.
   */
  private getAllowedProperties(): ConfigPropertyMeta[] {
    return this.allowedProperties;
  }

  /**
   * Set the allowed properties.
   *
   * @param properties The properties to set.
   */
  private setAllowedProperties(properties: ConfigPropertyMeta[]) {
    this.allowedProperties = properties;
  }
}

export namespace ConfigAggregator {
  /**
   * An enum of all possible locations for a config value.
   */
  export const enum Location {
    /**
     * Represents the global config.
     */
    GLOBAL = 'Global',

    /**
     * Represents the local project config.
     */
    LOCAL = 'Local',

    /**
     * Represents environment variables.
     */
    ENVIRONMENT = 'Environment',
  }
}
