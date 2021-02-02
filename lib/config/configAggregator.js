/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AsyncOptionalCreatable, merge, snakeCase, sortBy } from '@salesforce/kit';
import { definiteEntriesOf, get, isJsonMap } from '@salesforce/ts-types';
import { SfdxError } from '../sfdxError';
import { Config } from './config';
const propertyToEnvName = property => `SFDX_${snakeCase(property).toUpperCase()}`;
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
 * console.log(aggregator.getPropertyValue('defaultusername'));
 * ```
 */
export class ConfigAggregator extends AsyncOptionalCreatable {
  /**
   * **Do not directly construct instances of this class -- use {@link ConfigAggregator.create} instead.**
   * @ignore
   */
  constructor(options) {
    super(options || {});
  }
  /**
   * Initialize this instances async dependencies.
   */
  async init() {
    await this.loadProperties();
  }
  /**
   * Get a resolved config property.
   *
   * **Throws** *{@link SfdxError}{ name: 'UnknownConfigKey' }* An attempt to get a property that's not supported.
   *
   * @param key The key of the property.
   */
  getPropertyValue(key) {
    if (this.getAllowedProperties().some(element => key === element.key)) {
      return this.getConfig()[key];
    } else {
      throw new SfdxError(`Unknown config key: ${key}`, 'UnknownConfigKey');
    }
  }
  /**
   * Get a resolved config property.
   *
   * @param key The key of the property.
   */
  getInfo(key) {
    const location = this.getLocation(key);
    return {
      key,
      location,
      value: this.getPropertyValue(key),
      path: this.getPath(key),
      isLocal: () => location === 'Local' /* LOCAL */,
      isGlobal: () => location === 'Global' /* GLOBAL */,
      isEnvVar: () => location === 'Environment' /* ENVIRONMENT */
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
  getLocation(key) {
    if (this.getEnvVars().get(key) != null) {
      return 'Environment' /* ENVIRONMENT */;
    }
    if (this.getLocalConfig() && this.getLocalConfig().get(key)) {
      return 'Local' /* LOCAL */;
    }
    if (this.getGlobalConfig() && this.getGlobalConfig().get(key)) {
      return 'Global' /* GLOBAL */;
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
  getPath(key) {
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
   * ```
   * > console.log(aggregator.getConfigInfo());
   * [
   *     { key: 'logLevel', val: 'INFO', location: 'Environment', path: '$SFDX_LOG_LEVEL'}
   *     { key: 'defaultusername', val: '<username>', location: 'Local', path: './.sfdx/sfdx-config.json'}
   * ]
   * ```
   */
  getConfigInfo() {
    const infos = Object.keys(this.getConfig())
      .map(key => this.getInfo(key))
      .filter(info => !!info);
    return sortBy(infos, 'key');
  }
  /**
   * Get the local project config instance.
   */
  getLocalConfig() {
    return this.localConfig;
  }
  /**
   * Get the global config instance.
   */
  getGlobalConfig() {
    return this.globalConfig;
  }
  /**
   * Get the resolved config object from the local, global and environment config instances.
   */
  getConfig() {
    return this.config;
  }
  /**
   * Get the config properties that are environment variables.
   */
  getEnvVars() {
    return new Map(definiteEntriesOf(this.envVars));
  }
  /**
   * Re-read all property configurations from disk.
   */
  async reload() {
    await this.loadProperties();
    return this;
  }
  /**
   * Loads all the properties and aggregates them according to location.
   */
  async loadProperties() {
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
    const accumulator = {};
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
    const json = {};
    const reduced = configs.filter(isJsonMap).reduce((acc, el) => merge(acc, el), json);
    this.setConfig(reduced);
  }
  /**
   * Set the resolved config object.
   * @param config The config object to set.
   */
  setConfig(config) {
    this.config = config;
  }
  /**
   * Set the local config object.
   * @param config The config object value to set.
   */
  setLocalConfig(config) {
    this.localConfig = config;
  }
  /**
   * Set the global config object.
   * @param config The config object value to set.
   */
  setGlobalConfig(config) {
    this.globalConfig = config;
  }
  /**
   * Get the allowed properties.
   */
  getAllowedProperties() {
    return this.allowedProperties;
  }
  /**
   * Set the allowed properties.
   * @param properties The properties to set.
   */
  setAllowedProperties(properties) {
    this.allowedProperties = properties;
  }
  /**
   * Sets the env variables.
   * @param envVars The env variables to set.
   */
  setEnvVars(envVars) {
    this.envVars = envVars;
  }
}
//# sourceMappingURL=configAggregator.js.map
