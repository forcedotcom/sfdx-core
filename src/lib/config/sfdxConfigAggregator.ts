/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import * as _ from 'lodash';

import { SfdxConfig, ConfigPropertyMeta } from './sfdxConfig';
import { SfdxError } from '../sfdxError';

const propertyToEnvName = (property) => `SFDX_${_.snakeCase(property).toUpperCase()}`;

/**
 * Possible locations for a config value
 * @readonly
 * @enum {string}
 */
export const enum LOCATIONS {
    GLOBAL = 'Global',
    LOCAL = 'Local',
    ENVIRONMENT = 'Environment'
}

/**
 * Information about a config property
 *
 * @param {string} key The config key.
 * @param {string | boolean} value The config value.
 * @param {LOCATIONS} location The location of the config property.
 * @param {string} path The path of the config value.
 */
export interface ConfigInfo {
    key: string;
    location: string;
    value: string | boolean;
    path: string;
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
 * Aggregate global and local config files, as well as environment variables for
 * sfdx-config.json. The resolution happens in the following bottom-up order:
 *
 * 1. Environment variables  (SFDX_LOG_LEVEL)
 * 2. Workspace settings  (<workspace-root>/.sfdx/sfdx-config.json)
 * 3. Global settings  ($HOME/.sfdx/sfdx-config.json)
 *
 * Use {@link SfdxConfigAggregator.create} to instantiate the aggregator.
 *
 * @example
 * const aggregator = await SfdxConfigAggregator.create();
 *
 * @hideconstructor
 */
export class SfdxConfigAggregator {

    /**
     * Initialize the aggregator by reading and merging the global and local
     * sfdx config files, then resolving environment variables. This method
     * must be called before getting resolved config properties.
     *
     * @returns {Promise<SfdxConfigAggregator>} Returns the aggregated config object
     */
    public static async create(): Promise<SfdxConfigAggregator> {
        const configAggregator = new SfdxConfigAggregator();
        await configAggregator.loadProperties();
        return configAggregator;
    }

    private allowedProperties: any[];
    private localConfig: SfdxConfig;
    private globalConfig: SfdxConfig;
    private envVars: object;
    private config: object[];

    /**
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
     * Get a resolved config property
     *
     * @param {string} key The key of the property.
     * @returns {string | boolean} The value of the property.
     * @throws {Error} If there is an attempt to get a property that's not supported.
     */
    public getPropertyValue(key: string): string | boolean   {
        if (this.getAllowedProperties().some((element) => key === element.key)) {
            return this.getConfig()[key];
        } else {
            throw new SfdxError(`Unknown config key: ${key}`, 'UnknownConfigKey');
        }
    }

    /**
     * Get a resolved config property
     *
     * @param {string} key The key of the property
     * @returns {ConfigInfo} The value of the property
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
     * For example, getLocation('logLevel') will return:
     * 1) 'Environment' if resolved to an environment variable
     * 2) 'Local if resolved to local config
     * 3) 'Global' if resolved to the global config
     *
     * @param {string} key The key of the property.
     * @returns {LOCATIONS} The value of the property.
     */
    public getLocation(key: string): LOCATIONS {
        if (!_.isNil(this.getEnvVars()[key])) {
            return LOCATIONS.ENVIRONMENT;
        }

        if (!_.isNil(_.get(this.getLocalConfig(), `contents[${key}]`))) {
            return LOCATIONS.LOCAL;
        }
        if (!_.isNil(_.get(this.getGlobalConfig(), `contents[${key}]`))) {
            return LOCATIONS.GLOBAL;
        }
        return null;
    }

    /**
     * Get a resolved config property path.
     *
     * For example, getLocation('logLevel') will return:
     * 1) $SFDX_LOG_LEVEL if resolved to an environment variable
     * 2) ./.sfdx/sfdx-config.json if resolved to the local config
     * 3) ~/.sfdx/sfdx-config.json if resolved to the global config
     *
     * Please note that the path returns may be the absolute path instead of
     * "./" and "~/""
     *
     * @param {string} key The key of the property.
     * @returns {string} The file path or environment variable name of the property.
     */
    public getPath(key: string): string {
        if (!_.isNil(this.envVars[key])) {
            return `\$${propertyToEnvName(key)}`;
        }
        if (!_.isNil(_.get(this.getLocalConfig(), `contents[${key}]`))) {
            return this.getLocalConfig().getPath();
        }
        if (!_.isNil(_.get(this.getGlobalConfig(), `contents[${key}]`))) {
            return this.getGlobalConfig().getPath();
        }
        return null;
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
     * @returns {ConfigInfo[]} The value of the property.
     */
    public getConfigInfo(): ConfigInfo[] {
        const info = _.map(this.getConfig(), (val, key: string) => this.getInfo(key));
        return _.sortBy(info, 'key') as any;
    }

    /**
     * Get the local config object.
     *
     * @returns {SfdxConfig} Get the local config object.
     */
    public getLocalConfig(): SfdxConfig {
        return this.localConfig;
    }

    /**
     * Get the global config object.
     *
     * @returns {SfdxConfig} Get the global config object
     */
    public getGlobalConfig(): SfdxConfig {
        return this.globalConfig;
    }

    /**
     * Get the resolved config object.
     * @returns {object[]} Returns the raw config data.
     */
    public getConfig(): object[] {
        return this.config;
    }

    /**
     * Get the config properties that are environment variables
     * @returns {object} The environment variables as an object
     */
    public getEnvVars(): object {
        return this.envVars;
    }

    /**
     * Causes the instance to re-read all property configurations.
     * @returns {Promise<void>}
     */
    public async reload(): Promise<SfdxConfigAggregator> {
        await this.loadProperties();
        return this;
    }

    /**
     * Loads all the properties and aggregates them according to location.
     * @returns {Promise<void>}
     */
    private async loadProperties(): Promise<void> {
        // Don't throw an project error with the aggregator, since it should resolve to global if
        // there is no project.
        try {
            this.setLocalConfig(await SfdxConfig.create<SfdxConfig>(SfdxConfig.getDefaultOptions(false)));
        } catch (err) {
            if (err.name !== 'InvalidProjectWorkspace') {
                throw err;
            }
        }

        this.setGlobalConfig(await SfdxConfig.create<SfdxConfig>(SfdxConfig.getDefaultOptions(true)));

        this.setAllowedProperties(SfdxConfig.getAllowedProperties());

        this.setEnvVars(this.getAllowedProperties().reduce((obj, property) => {
            const val = process.env[propertyToEnvName(property.key)];
            if (!_.isNil(val)) {
                obj[property.key] = val;
            }
            return obj;
        }, {}));

        // Global config must be read first so it is on the left hand of the
        // object assign and is overwritten by the local config.

        const configs = [(await this.globalConfig.read() as object)];

        // We might not be in a project workspace
        if (this.localConfig) {
            configs.push((await this.localConfig.read()) as object);
        }

        configs.push(this.getEnvVars());

        this.setConfig(_.reduce(configs.filter(_.isObject), (result, configElement) =>
            _.merge(result, configElement), {}));

    }

    /**
     * Set the resolved config object
     * @param config The config object to set
     * @private
     */
    private setConfig(config: any) {
        this.config = config;
    }

    /**
     * Set the local config object
     * @param {SfdxConfig} config The config object value to set.
     * @private
     */
    private setLocalConfig(config: SfdxConfig) {
        this.localConfig = config;
    }

    /**
     * Set the global config object
     * @param {SfdxConfig} config The config object value to set
     * @private
     */
    private setGlobalConfig(config: SfdxConfig) {
        this.globalConfig = config;
    }

    /**
     * Get the allowed properties
     * @returns {ConfigPropertyMeta[]} Get the allowed properties
     * @private
     */
    private getAllowedProperties(): ConfigPropertyMeta[] {
        return this.allowedProperties;
    }

    /**
     * Set the allowed properties
     * @param {ConfigPropertyMeta[]} properties The properties to set
     * @private
     */
    private setAllowedProperties(properties: ConfigPropertyMeta[]) {
        this.allowedProperties = properties;
    }

    /**
     * Sets the env variables
     * @param {object} envVars The env variables to set.
     * @private
     */
    private setEnvVars(envVars: object) {
        this.envVars = envVars;
    }
}
