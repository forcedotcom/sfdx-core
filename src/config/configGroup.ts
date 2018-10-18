/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * Options when creating the config file. Extends {@link ConfigOptions}.
 * @typedef {object} ConfigGroupOptions
 * @extends ConfigOptions
 * @property {string} defaultGroup The default group for properties to go into.
 */

import { get, set } from '@salesforce/kit';
import { AnyJson, Dictionary, JsonMap, Optional } from '@salesforce/ts-types';
import { SfdxError } from '../sfdxError';
import { ConfigFile, ConfigOptions } from './configFile';
import { ConfigContents, ConfigEntry, ConfigValue } from './configStore';

/**
 * The interface for Config options.
 * *NOTE:* And changes to this interface must also change the jsdoc typedef header above.
 * @interface
 */
export interface ConfigGroupOptions extends ConfigOptions {
    defaultGroup: string;
}

/**
 * A config file that stores config values in groups. e.g. to store different config
 * values for different commands, without having manually manipulate the config.
 *
 * **Note:** All config methods are overwritten to use the {@link ConfigGroup.setDefaultGroup}.
 *
 * @extends ConfigFile
 *
 * @example
 * class MyPluginConfig extents ConfigGroup {
 *     class MyConfig extents ConfigFile {
 *     public static getFileName(): string {
 *         return 'myPluginConfigFilename.json';
 *     }
 * }
 * const myConfig = await MyPluginConfig.retrieve<MyPluginConfig>(ConfigGroup.getOptions('all'));
 * myconfig.setDefaultGroup('myCommand'); // Can be set in your command's init.
 * myConfig.set('mykey', 'myvalue'); // Sets 'myKey' for the 'myCommand' group.
 * myConfig.setInGroup('myKey', 'myvalue', 'all'); // Manually set in another group.
 * await myconfig.write();
 */
export class ConfigGroup extends ConfigFile {

    /**
     * Overrides {@link ConfigFile.create} to pass in {@link ConfigGroup.getOptions}.
     * @override
     * @see {@link ConfigFile.create}
     */
    public static async create<T extends ConfigFile>(options: ConfigOptions): Promise<T> {
        const config: T = (await super.create(options)) as T;
        // First cast T to config file, before we can cast to ConfigGroup
        const group: ConfigGroup = (config as ConfigFile) as ConfigGroup;
        group.setDefaultGroup((options as ConfigGroupOptions).defaultGroup);
        return config;
    }

    /**
     * Get ConfigGroup specific options, such as the default group.
     * @param {string} defaultGroup The default group to use when creating the config.
     * @param {string} [filename] The filename of the config file. Uses the static {@link getFileName} by default.
     */
    public static getOptions(defaultGroup: string, filename?: string): ConfigGroupOptions {
        const options: ConfigGroupOptions = this.getDefaultOptions(true, filename) as ConfigGroupOptions;
        options.defaultGroup = defaultGroup;
        return options;
    }

    private defaultGroup: string = 'default';

    /**
     * Sets the default group for all {@link BaseConfigStore} methods to use.
     * @param {String} group The group.
     * @throws {SfdxError} **`{name: 'MissingGroupName'}`:** The group parameter is null or undefined.
     */
    public setDefaultGroup(group: string): void {
        if (!group) {
            throw new SfdxError('null or undefined group', 'MissingGroupName');
        }

        this.defaultGroup = group;
    }

    /**
     * Set a group of entries in a bulk save.
     * @param {object} newEntries An object representing the aliases to set.
     * @param {string} [group = 'default'] The group the property belongs to.
     * @returns {Promise<object>} The new property that was saved.
     */
    public async updateValues(newEntries: object, group?: string): Promise<object> {
        // Make sure the contents are loaded
        await this.read();
        Object.entries(newEntries).forEach(([key, val]) => this.setInGroup(key, val, group || this.defaultGroup));
        await this.write();
        return newEntries;
    }

    /**
     * Set a value on a group.
     * @param {string} key The key.
     * @param {string} value The value.
     * @param {string} [group = 'default'] The group.
     * @returns {Promise<void>} The promise resolved when the value is set.
     */
    public async updateValue(key: string, value: ConfigValue, group?: string): Promise<void> {
        // Make sure the content is loaded
        await this.read();
        this.setInGroup(key, value, group || this.defaultGroup);
        // Then save it
        await this.write();
    }

    /**
     * Gets an array of key value pairs.
     * @returns {ConfigEntry[]}
     * @override
     */
    public entries(): ConfigEntry[] {
        const group = this.getGroup();
        if (group) {
            return Object.entries(group);
        }
        return [];
    }

    /**
     * Returns a specified element from ConfigGroup.
     * @param {string} key The key.
     * @returns {Optional<ConfigValue>} The associated value.
     * @override
     */
    public get(key: string): Optional<ConfigValue> {
        return this.getInGroup(key);
    }

    /**
     * Returns a boolean if an element with the specified key exists in the default group.
     * @param {string} key The key.
     * @returns {boolean}
     * @override
     */
    public has(key: string): boolean {
        const group = this.getGroup();
        return !!group && super.has(this.defaultGroup) && !!group[key];
    }

    /**
     * Returns an array of the keys from the default group.
     * @returns {string[]}
     * @override
     */
    public keys(): string[] {
        return Object.keys(this.getGroup(this.defaultGroup) || {});
    }

    /**
     * Returns an array of the values from the default group.
     * @returns {ConfigValue[]}
     * @override
     */
    public values(): ConfigValue[] {
        return Object.values(this.getGroup(this.defaultGroup) || {});
    }

    /**
     * Add or updates an element with the specified key in the default group.
     * @param {string} key The key.
     * @param {ConfigValue} value The value.
     * @returns {ConfigContents}
     * @override
     */
    public set(key: string, value: ConfigValue): ConfigContents {
        return this.setInGroup(key, value, this.defaultGroup);
    }

    /**
     * Removes an element with the specified key from the default group.
     * @param {string} key The key.
     * @returns {boolean} True if the item was deleted.
     * @override
     */
    public unset(key: string): boolean {
        const groupContents = this.getGroup(this.defaultGroup);
        if (groupContents) {
            delete groupContents[key];
            return true;
        }
        return false;
    }

    /**
     * Remove all key value pairs from the default group.
     * @override
     */
    public clear(): void {
        delete this.getContents()[this.defaultGroup];
    }

    /**
     * Get all config content for a group.
     * @param {string} [group = 'default'] The group.
     * @returns {ConfigContents} The contents.
     */
    public getGroup(group?: string): Optional<ConfigContents> {
        return get(this.getContents(), group || this.defaultGroup);
    }

    /**
     * Returns the value associated to the key and group, or undefined if there is none.
     * @param {string} key The key.
     * @param {string} [group = 'default'] The group. Defaults to the default group.
     * @returns {Optional<ConfigValue>}
     */
    public getInGroup(key: string, group?: string): Optional<ConfigValue> {
        const groupContents = this.getGroup(group);
        if (groupContents) {
            return groupContents[key];
        }
    }

    /**
     * Convert the config object to a json object.
     * @returns {JsonMap}
     * @override
     */
    public toObject(): JsonMap {
        return Array.from(Object.entries(this.getContents())).reduce((obj, entry: ConfigEntry) => {
            obj[entry[0]] = Array.from(Object.entries(entry[1] as ConfigContents)).reduce((sub, subentry: ConfigEntry) => {
                // @ts-ignore TODO: refactor config to not intermingle js maps and json maps
                sub[subentry[0]] = subentry[1];
                return sub;
            }, {} as JsonMap);
            return obj;
        }, {} as JsonMap);
    }

    /**
     * Convert an object to a {@link ConfigContents} and set it as the config contents.
     * @param {object} obj The object.
     */
    public setContentsFromObject<T extends object>(obj: T): void {
        const contents = new Map<string, ConfigValue>(Object.entries(obj));
        Array.from(contents.entries()).forEach(([groupKey, groupContents]) => {
            if (groupContents) {
                Object.entries(groupContents).forEach(([contentKey, contentValue]) => {
                    this.setInGroup(contentKey, contentValue, groupKey);
                });
            }
        });
    }

    /**
     * Sets the value for the key and group in the config object.
     * @param key The key.
     * @param [value] The value.
     * @param [group = 'default'] The group. Defaults to the default group.
     * @returns {ConfigContents} The contents.
     */
    public setInGroup(key: string, value?: ConfigValue, group?: string): ConfigContents {
        let content: Dictionary<AnyJson>;

        group = group || this.defaultGroup;

        if (!super.has(group)) {
            super.set(group, {});
        }
        content = this.getGroup(group) || {};
        set(content, key, value);

        return content;
    }
}
