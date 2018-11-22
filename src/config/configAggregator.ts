/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * An enum of all possible locations for a config value.
 * @typedef Location
 * @property {string} GLOBAL Represents the global config.
 * @property {string} LOCAL Represents the local project config.
 * @property {string} ENVIRONMENT Represents environment variables.
 */
/**
 * Information about a config property.
 * @typedef ConfigInfo
 * @property {string} key The config key.
 * @property {string | boolean} value The config value.
 * @property {Location} location The location of the config property.
 * @property {string} path The path of the config value.
 * @property {function} isLocal `() => boolean` Location is `Location.LOCAL`.
 * @property {function} isGlobal `() => boolean` Location is `Location.GLOBAL`.
 * @property {function} isEnvVar `() => boolean` Location is `Location.ENVIRONMENT`.
 */

import { AsyncOptionalCreatable, merge, snakeCase, sortBy } from '@salesforce/kit';
import { AnyJson, definiteEntriesOf, Dictionary, get, isJsonMap, JsonMap, Optional } from '@salesforce/ts-types';
import { SfdxError } from '../sfdxError';
import { Config, ConfigPropertyMeta } from './config';

const propertyToEnvName = (property: string) => `SFDX_${snakeCase(property).toUpperCase()}`;

export const enum Location {
  GLOBAL = 'Global',
  LOCAL = 'Local',
  ENVIRONMENT = 'Environment'
}

/**
 * Information about a config property.
 */
export interface ConfigInfo {
  key: string;
  location?: Location;
  value?: AnyJson;
  path?: string;
  /**
   * @returns true if the config property is in the local project
   */
  isLocal: () => boolean;

  /**
   * @returns true if the config property is in the global space
   */
  isGlobal: () => boolean;

  /**
   * @returns true if the config property is an environment variable.
   */
  isEnvVar: () => boolean;
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
 * @example
 * const aggregator = await ConfigAggregator.create();
 * console.log(aggregator.getPropertyValue('defaultusername'));
 *
 * @hideconstructor
 */
export class ConfigAggregator extends AsyncOptionalCreatable<JsonMap> {
  // Initialized in loadProperties
  private allowedProperties!: ConfigPropertyMeta[];
  private localConfig!: Config;
  private globalConfig!: Config;
  private envVars!: Dictionary<string>;
  private config!: JsonMap;

  /**
   * **Do not directly construct instances of this class -- use {@link ConfigAggregator.resolve} instead.**
   *
   * @private
   * @constructor
   */
  public constructor(options?: JsonMap) {
    super(options || {});
  }

  public async init(): Promise<void> {
    await this.loadProperties();
  }

  /**
   * Retrieve the path to the config file.
   * @callback retrieverFunction
   * @param {boolean} isGlobal Is it the global or local project config file?
   * @returns {Promise<string>} The path of the config file.
   */

  /**
   * Get a resolved config property.
   *
   * @param {string} key The key of the property.
   * @returns {Optional<AnyJson>}
   * @throws {SfdxError}
   *  **`{name: 'UnknownConfigKey'}`:** An attempt to get a property that's not supported.
   */
  public getPropertyValue(key: string): Optional<AnyJson> {
    if (this.getAllowedProperties().some(element => key === element.key)) {
      return this.getConfig()[key];
    } else {
      throw new SfdxError(`Unknown config key: ${key}`, 'UnknownConfigKey');
    }
  }

  /**
   * Get a resolved config property.
   *
   * @param {string} key The key of the property.
   * @returns {ConfigInfo}
   */
  public getInfo(key: string): ConfigInfo {
    const location = this.getLocation(key);
    return {
      key,
      location,
      value: this.getPropertyValue(key),
      path: this.getPath(key),
      isLocal: () => location === Location.LOCAL,
      isGlobal: () => location === Location.GLOBAL,
      isEnvVar: () => location === Location.ENVIRONMENT
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
   * @param {string} key The key of the property.
   * @returns {Optional<Location>}
   */
  public getLocation(key: string): Optional<Location> {
    if (this.getEnvVars().get(key) != null) {
      return Location.ENVIRONMENT;
    }
    if (this.getLocalConfig() && this.getLocalConfig().get(key)) {
      return Location.LOCAL;
    }
    if (this.getGlobalConfig() && this.getGlobalConfig().get(key)) {
      return Location.GLOBAL;
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
   * @param {string} key The key of the property.
   * @returns {Optional<string>}
   */
  public getPath(key: string): Optional<string> {
    if (this.envVars[key] != null) {
      return `\$${propertyToEnvName(key)}`;
    }
    if (get(this.getLocalConfig(), `contents[${key}]`) != null) {
      return this.getLocalConfig().getPath();
    }
    if (get(this.getGlobalConfig(), `contents[${key}]`) != null) {
      return this.getGlobalConfig().getPath();
    }
  }

  /**
   * Get all resolved config property keys, values, locations, and paths.
   *
   * @example
   * > console.log(aggregator.getConfigInfo());
   * [
   *     { key: 'logLevel', val: 'INFO', location: 'Environment', path: '$SFDX_LOG_LEVEL'}
   *     { key: 'defaultusername', val: '<username>', location: 'Local', path: './.sfdx/sfdx-config.json'}
   * ]
   *
   * @returns {ConfigInfo[]}
   */
  public getConfigInfo(): ConfigInfo[] {
    const infos = Object.keys(this.getConfig())
      .map(key => this.getInfo(key))
      .filter((info): info is ConfigInfo => !!info);
    return sortBy(infos, 'key');
  }

  /**
   * Get the local project config instance.
   *
   * @returns {Config}
   */
  public getLocalConfig(): Config {
    return this.localConfig;
  }

  /**
   * Get the global config instance.
   *
   * @returns {Config}
   */
  public getGlobalConfig(): Config {
    return this.globalConfig;
  }

  /**
   * Get the resolved config object from the local, global and environment config instances.
   * @returns {JsonMap}
   */
  public getConfig(): JsonMap {
    return this.config;
  }

  /**
   * Get the config properties that are environment variables.
   * @returns {Map<string, string>}
   */
  public getEnvVars(): Map<string, string> {
    return new Map(definiteEntriesOf(this.envVars));
  }

  /**
   * Re-read all property configurations from disk.
   * @returns {Promise<void>}
   */
  public async reload(): Promise<ConfigAggregator> {
    await this.loadProperties();
    return this;
  }

  /**
   * Loads all the properties and aggregates them according to location.
   * @returns {Promise<void>}
   * @private
   */
  private async loadProperties(): Promise<void> {
    // Don't throw an project error with the aggregator, since it should resolve to global if
    // there is no project.
    try {
      this.setLocalConfig(await Config.create(Config.getDefaultOptions(false)));
    } catch (err) {
      if (err.name !== 'InvalidProjectWorkspace') {
        throw err;
      }
    }

    this.setGlobalConfig(await Config.create(Config.getDefaultOptions(true)));

    this.setAllowedProperties(Config.getAllowedProperties());

    const accumulator: Dictionary<string> = {};
    this.setEnvVars(
      this.getAllowedProperties().reduce((obj, property) => {
        const val = process.env[propertyToEnvName(property.key)];
        if (val != null) {
          obj[property.key] = val;
        }
        return obj;
      }, accumulator)
    );

    // Global config must be read first so it is on the left hand of the
    // object assign and is overwritten by the local config.

    await this.globalConfig.read();
    const configs = [this.globalConfig.toObject()];

    // We might not be in a project workspace
    if (this.localConfig) {
      await this.localConfig.read();
      configs.push(this.localConfig.toObject());
    }

    configs.push(this.envVars);

    const json: JsonMap = {};
    const reduced = configs.filter(isJsonMap).reduce((acc: JsonMap, el: AnyJson) => merge(acc, el), json);
    this.setConfig(reduced);
  }

  /**
   * Set the resolved config object.
   * @param config The config object to set.
   * @private
   */
  private setConfig(config: JsonMap) {
    this.config = config;
  }

  /**
   * Set the local config object.
   * @param {Config} config The config object value to set.
   * @private
   */
  private setLocalConfig(config: Config) {
    this.localConfig = config;
  }

  /**
   * Set the global config object.
   * @param {Config} config The config object value to set.
   * @private
   */
  private setGlobalConfig(config: Config) {
    this.globalConfig = config;
  }

  /**
   * Get the allowed properties.
   * @returns {ConfigPropertyMeta[]}
   * @private
   */
  private getAllowedProperties(): ConfigPropertyMeta[] {
    return this.allowedProperties;
  }

  /**
   * Set the allowed properties.
   * @param {ConfigPropertyMeta[]} properties The properties to set.
   * @private
   */
  private setAllowedProperties(properties: ConfigPropertyMeta[]) {
    this.allowedProperties = properties;
  }

  /**
   * Sets the env variables.
   * @param {Dictionary<string>} envVars The env variables to set.
   * @private
   */
  private setEnvVars(envVars: Dictionary<string>) {
    this.envVars = envVars;
  }
}
