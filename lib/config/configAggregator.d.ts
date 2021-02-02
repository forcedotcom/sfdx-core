import { AsyncOptionalCreatable } from '@salesforce/kit';
import { AnyJson, JsonMap, Optional } from '@salesforce/ts-types';
import { Config } from './config';
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
 * console.log(aggregator.getPropertyValue('defaultusername'));
 * ```
 */
export declare class ConfigAggregator extends AsyncOptionalCreatable<JsonMap> {
  private allowedProperties;
  private localConfig;
  private globalConfig;
  private envVars;
  private config;
  /**
   * **Do not directly construct instances of this class -- use {@link ConfigAggregator.create} instead.**
   * @ignore
   */
  constructor(options?: JsonMap);
  /**
   * Initialize this instances async dependencies.
   */
  init(): Promise<void>;
  /**
   * Get a resolved config property.
   *
   * **Throws** *{@link SfdxError}{ name: 'UnknownConfigKey' }* An attempt to get a property that's not supported.
   *
   * @param key The key of the property.
   */
  getPropertyValue(key: string): Optional<AnyJson>;
  /**
   * Get a resolved config property.
   *
   * @param key The key of the property.
   */
  getInfo(key: string): ConfigInfo;
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
  getLocation(key: string): Optional<ConfigAggregator.Location>;
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
  getPath(key: string): Optional<string>;
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
  getConfigInfo(): ConfigInfo[];
  /**
   * Get the local project config instance.
   */
  getLocalConfig(): Config;
  /**
   * Get the global config instance.
   */
  getGlobalConfig(): Config;
  /**
   * Get the resolved config object from the local, global and environment config instances.
   */
  getConfig(): JsonMap;
  /**
   * Get the config properties that are environment variables.
   */
  getEnvVars(): Map<string, string>;
  /**
   * Re-read all property configurations from disk.
   */
  reload(): Promise<ConfigAggregator>;
  /**
   * Loads all the properties and aggregates them according to location.
   */
  private loadProperties;
  /**
   * Set the resolved config object.
   * @param config The config object to set.
   */
  private setConfig;
  /**
   * Set the local config object.
   * @param config The config object value to set.
   */
  private setLocalConfig;
  /**
   * Set the global config object.
   * @param config The config object value to set.
   */
  private setGlobalConfig;
  /**
   * Get the allowed properties.
   */
  private getAllowedProperties;
  /**
   * Set the allowed properties.
   * @param properties The properties to set.
   */
  private setAllowedProperties;
  /**
   * Sets the env variables.
   * @param envVars The env variables to set.
   */
  private setEnvVars;
}
export declare namespace ConfigAggregator {
  /**
   * An enum of all possible locations for a config value.
   */
  const enum Location {
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
    ENVIRONMENT = 'Environment'
  }
}
