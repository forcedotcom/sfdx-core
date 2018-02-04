/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import * as _ from 'lodash';

import { SfdxConfig, ConfigPropertyMeta } from './sfdxConfig';
import { SfdxError } from '../sfdxError';
import {SfdxConstant} from '../sfdxConstants';

const propertyToEnvName = (property) => `SFDX_${_.snakeCase(property).toUpperCase()}`;

export const enum LOCATIONS {
    GLOBAL = 'Global',
    LOCAL = 'Local',
    ENVIRONMENT = 'Environment'
}

/**
 * Aggregate global and local config files, as well as environment variables for
 * sfdx-config.json. The resolution happens in the following bottom-up order:
 *
 * 1. Environment variables  (SFDX_LOG_LEVEL)
 * 2. Workspace settings  (<workspace-root>/.sfdx/sfdx-config.json)
 * 3. Global settings  ($HOME/.sfdx/sfdx-config.json)
 *
 * The instantiator must first call initialize before being able to get resolved
 * config properties.
 */
export class SfdxConfigAggregator {
    /**
     * Initialize the aggregator by reading and merging the global and local
     * sfdx config files, then resolving environment variables. This method
     * must be called before getting resolved config properties.
     *
     * @returns {Promise<object>} config Returns the aggregated config object
     */
    public static async create(rootPathRetriever?: (isGlobal: boolean) => Promise<string>): Promise<SfdxConfigAggregator> {

        const configAggregator = new SfdxConfigAggregator();

        configAggregator.setLocalConfig(await SfdxConfig.create(false, rootPathRetriever));

        configAggregator.setGlobalConfig(await SfdxConfig.create(true, rootPathRetriever));

        configAggregator.setAllowedProperties(SfdxConfig.getAllowedProperties());

        configAggregator.setEnvVars(configAggregator.getAllowedProperties().reduce((obj, property) => {
            const val = process.env[propertyToEnvName(property.key)];
            if (!_.isNil(val)) {
                obj[property.key] = val;
            }
            return obj;
        }, {}));

        // Global config must be read first so it is on the left hand of the
        // object assign and is overwritten by the local config.

        const configs = [await configAggregator.globalConfig.read()];

        // We might not be in a project workspace
        if (configAggregator.localConfig) {
            configs.push(await configAggregator.localConfig.read());
        }

        configs.push(configAggregator.getEnvVars());

        configAggregator.setConfig(_.reduce(configs.filter(_.isObject), (result, configElement) =>
            _.merge(result, configElement), {}));

        return configAggregator;
    }

    private allowedProperties: any[];
    private localConfig: SfdxConfig;
    private globalConfig: SfdxConfig;
    private envVars: any[];
    private config: any[];

    /**
     * @constructor
     */
    private constructor() {}

    /* Get a resolved config property
     *
     * @param {string} key the key of the property
     * @returns {*} the value of the property
     * @throws {Error} Or there is an attempt to get a property that's not supported
     */
    public getPropertyValue(key: SfdxConstant) {
        if (this.getAllowedProperties().some((element) => key === element.key)) {
            return this.getConfig()[key];
        } else {
            throw new SfdxError(`Unknown config key: ${key}`, 'UnknownConfigKey');
        }
    }

    /**
     * Get a resolved config property
     *
     * @param {string} key - The key of the property
     * @returns {*} The value of the property
     */
    public getInfo(key: SfdxConstant) {
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
     * 1) $SFDX_LOG_LEVEL is resolved to 'Environment'
     * 2) ./.sfdx/sfdx-config.json if resolved to 'Local'
     * 3) ~/.sfdx/sfdx-config.json if resolved to 'Global'
     *
     * Please note that the path returns may be the absolute path instead of
     * "./" and "~/""
     *
     * @param {string} key the key of the property
     * @returns {*} the value of the property
     * @throws {Error} Throws error is initialized is not called prior
     */
    public getLocation(key: SfdxConstant): LOCATIONS {
        if (!_.isNil(this.getEnvVars()[key])) {
            return LOCATIONS.ENVIRONMENT;
        }

        if (!_.isNil(this.getLocalConfig().getContents()[key])) {
            return LOCATIONS.LOCAL;
        }
        if (!_.isNil(this.getGlobalConfig().getContents()[key])) {
            return LOCATIONS.GLOBAL;
        }
        return null;
    }

    /**
     * Get a resolved config property path.
     *
     * For example, getLocation('logLevel') will return:
     * 1) $SFDX_LOG_LEVEL is resolved to an environment variable
     * 2) ./.sfdx/sfdx-config.json if resolved to the local config
     * 3) ~/.sfdx/sfdx-config.json if resolved to the global config
     *
     * Please note that the path returns may be the absolute path instead of
     * "./" and "~/""
     *
     * @param {string} key the key of the property
     * @returns {*} the value of the property
     * @throws {Error} Throws error is initialized is not called prior
     */
    public getPath(key: SfdxConstant): string {
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
     * Get all resolved config property keys, values, and locations.
     *
     * For example,
     *    [
     *        { key: 'logLevel', val: 'INFO', location: '$SFDX_LOG_LEVEL'}
     *        { key: 'master', val: '<username>', location: './.sfdx/sfdx-config.json'}
     *    ]
     *
     * @returns {*} the value of the property
     * @throws {Error} Throws error is initialized is not called prior
     */
    public getConfigInfo() {
        const info = _.map(this.getConfig(), (val, key: SfdxConstant) => this.getInfo(key));
        return _.sortBy(info, 'key');
    }

    /**
     * @returns {SfdxConfig} Get the local config object
     */
    public getLocalConfig(): SfdxConfig {
        return this.localConfig;
    }

    /**
     * @returns {SfdxConfig} Get the global config object
     */
    public getGlobalConfig(): SfdxConfig {
        return this.globalConfig;
    }

    /**
     * Set the global config object
     * @param config - The config object to set
     */
    protected setConfig(config: any) {
        this.config = config;
    }

    /**
     * Set the local config object
     * @param {SfdxConfig} config - The config object value to set.
     */
    protected setLocalConfig(config: SfdxConfig) {
        this.localConfig = config;
    }

    /**
     * Set the global config object
     * @param {SfdxConfig} config - The config object value to set
     */
    protected setGlobalConfig(config: SfdxConfig) {
        this.globalConfig = config;
    }

    /**
     * @returns {ConfigPropertyMeta[]} - Get the allowed properties
     */
    protected getAllowedProperties(): ConfigPropertyMeta[] {
        return this.allowedProperties;
    }

    /**
     * Set the allowed properties
     * @param {ConfigPropertyMeta[]} properties - The properties to set
     */
    protected setAllowedProperties(properties: ConfigPropertyMeta[]) {
        this.allowedProperties = properties;
    }

    /**
     * Sets the env variables
     * @param {any[]} envVars - The env varibless to set.
     */
    protected setEnvVars(envVars: any) {
        this.envVars = envVars;
    }

    /**
     * @returns {any} - The environment variables as an object
     */
    protected getEnvVars(): any {
        return this.envVars;
    }

    /**
     * @returns {any[]} - Returns the raw config data.
     */
    protected getConfig(): any {
        return this.config;
    }
}
