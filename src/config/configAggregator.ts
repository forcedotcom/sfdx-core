/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * An enum of all possible locations for a config value.
 * @typedef LOCATIONS
 * @property {string} GLOBAL Represents the global config.
 * @property {string} LOCAL Represents the local project config.
 * @property {string} ENVIRONMENT Represents environment variables.
 */
/**
 * Information about a config property.
 * @typedef ConfigInfo
 * @property {string} key The config key.
 * @property {string | boolean} value The config value.
 * @property {LOCATIONS} location The location of the config property.
 * @property {string} path The path of the config value.
 * @property {function} isLocal `() => boolean` Location is `LOCATIONS.LOCAL`.
 * @property {function} isGlobal `() => boolean` Location is `LOCATIONS.GLOBAL`.
 * @property {function} isEnvVar `() => boolean` Location is `LOCATIONS.ENVIRONMENT`.
 */

import { get, merge, snakeCase, sortBy } from '@salesforce/kit';
import { definiteEntries, Dictionary, isObject, Optional } from '@salesforce/ts-types';
import { SfdxError } from '../sfdxError';
import { Config, ConfigPropertyMeta } from './config';

const propertyToEnvName = (property: string) => `SFDX_${snakeCase(property).toUpperCase()}`;

export const enum LOCATIONS {
    GLOBAL = 'Global',
    LOCAL = 'Local',
    ENVIRONMENT = 'Environment'
}

/**
 * Information about a config property.
 */
export interface ConfigInfo {
    key: string;
    location?: LOCATIONS;
    value: string | boolean;
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
export class ConfigAggregator {

    /**
     * Initialize the aggregator by reading and merging the global and local
     * sfdx config files, then resolving environment variables. This method
     * must be called before getting resolved config properties.
     *
     * @returns {Promise<ConfigAggregator>} Returns the aggregated config object
     */
    public static async create(): Promise<ConfigAggregator> {
        const configAggregator = new ConfigAggregator();
        await configAggregator.loadProperties();
        return configAggregator;
    }

    // Initialized in loadProperties
    private allowedProperties!: ConfigPropertyMeta[];
    private localConfig!: Config;
    private globalConfig!: Config;
    private envVars!: Dictionary<string>;
    private config!: object;

    /**
     * **Do not directly construct instances of this class -- use {@link ConfigAggregator.resolve} instead.**
     *
     * @private
     * @constructor
     */
    protected constructor() {}

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
     * @returns {string | boolean}
     * @throws {SfdxError}
     *  **`{name: 'UnknownConfigKey'}`:** An attempt to get a property that's not supported.
     */
    public getPropertyValue(key: string): string | boolean   {
        if (this.getAllowedProperties().some(element => key === element.key)) {
            // @ts-ignore TODO: Need to sort out object types on config stuff
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
            isLocal: () => location === LOCATIONS.LOCAL,
            isGlobal: () => location === LOCATIONS.GLOBAL,
            isEnvVar: () => location === LOCATIONS.ENVIRONMENT
        };
    }

    /**
     * Gets a resolved config property location.
     *
     * For example, `getLocation('logLevel')` will return:
     * 1. `LOCATIONS.GLOBAL` if resolved to an environment variable.
     * 1. `LOCATIONS.LOCAL` if resolved to local project config.
     * 1. `LOCATIONS.ENVIRONMENT` if resolved to the global config.
     *
     * @param {string} key The key of the property.
     * @returns {Optional<LOCATIONS>}
     */
    public getLocation(key: string): Optional<LOCATIONS> {
        if (this.getEnvVars().get(key) != null) {
            return LOCATIONS.ENVIRONMENT;
        }
        if (this.getLocalConfig() && this.getLocalConfig().get(key)) {
            return LOCATIONS.LOCAL;
        }
        if (this.getGlobalConfig() && this.getGlobalConfig().get(key)) {
            return LOCATIONS.GLOBAL;
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
     * @returns {object}
     */
    public getConfig(): object {
        return this.config;
    }

    /**
     * Get the config properties that are environment variables.
     * @returns {Map<string, string>}
     */
    public getEnvVars(): Map<string, string> {
        return new Map(definiteEntries(this.envVars));
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
            this.setLocalConfig(await Config.create<Config>(Config.getDefaultOptions(false)));
        } catch (err) {
            if (err.name !== 'InvalidProjectWorkspace') {
                throw err;
            }
        }

        this.setGlobalConfig(await Config.create<Config>(Config.getDefaultOptions(true)));

        this.setAllowedProperties(Config.getAllowedProperties());

        const accumulator: Dictionary<string> = {};
        this.setEnvVars(this.getAllowedProperties().reduce((obj, property) => {
            const val = process.env[propertyToEnvName(property.key)];
            if (val != null) {
                obj[property.key] = val;
            }
            return obj;
        }, accumulator));

        // Global config must be read first so it is on the left hand of the
        // object assign and is overwritten by the local config.

        await this.globalConfig.read();
        const configs = [(this.globalConfig.toObject() as object)];

        // We might not be in a project workspace
        if (this.localConfig) {
            await this.localConfig.read();
            configs.push((this.localConfig.toObject()) as object);
        }

        configs.push(this.envVars);

        const reduced = configs.filter(isObject)
            .reduce((result, configElement) => merge(result, configElement), {});
        this.setConfig(reduced);
    }

    /**
     * Set the resolved config object.
     * @param config The config object to set.
     * @private
     */
    private setConfig(config: object) {
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
