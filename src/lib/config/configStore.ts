/**
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 *
 * Note: These have to go here for jsdoc
 */
/**
 * The allowed types stored in a config store.
 * @typedef {(string | boolean | object)} ConfigValue
 */
/**
 * The type of entries in a config store defined by the key and value type of {@link ConfigContents}.
 * @typedef {object} ConfigEntry
 * @property {string} key
 * @property {ConfigValue} value
 */
/**
 * The type of content a config stores.
 * @typedef {Map<string, ConfigValue>} ConfigContents
 */

import * as _ from 'lodash';
import { JsonMap } from '../types';

/**
 * The allowed types stored in a config store.
 */
export type ConfigValue = string | boolean | object;

/**
 * The type of entries in a config store defined by the key and value type of {@link ConfigContents}.
 */
export type ConfigEntry = [string, ConfigValue];

/**
 * The type of content a config stores.
 */
export type ConfigContents = Map<string, ConfigValue>;

/**
 * An interface for a config object with a persistent store.
 * @interface
 */
export interface ConfigStore {
    // Map manipulation methods
    entries(): ConfigEntry[];
    get(key): ConfigValue;
    getKeysByValue(value: ConfigValue): string[];
    has(key): boolean;
    keys(): string[];
    set(key: string, value: ConfigValue): ConfigContents;
    unset(key: string): boolean;
    unsetAll(keys: string[]): boolean;
    clear(): void;
    values(): ConfigValue[];

    forEach(actionFn: any): void;
    awaitEach(actionFn: any): Promise<void>;

    // Content methods
    getContents(): ConfigContents;
    setContents(contents?: ConfigContents): void;

    // Storage methods

}

/**
 * An abstract class that implements all the config management functions but
 * none of the storage functions.
 *
 * **Note:** To see the interface, look in typescripts autocomplete help or the npm package's ConfigStore.d.ts file.
 * @implements {ConfigStore}
 */
export abstract class BaseConfigStore implements ConfigStore {
    private contents: ConfigContents;

    public constructor(contents?: ConfigContents) {
        this.setContents(contents);
    }

    /**
     * Returns an array of {@link ConfigEntry} for each element in the config.
     * @returns {ConfigEntry}
     */
    public entries(): ConfigEntry[] {
        return _.entries(this.contents);
    }

    /**
     * Returns the value associated to the key, or undefined if there is none.
     * @param {string} key The key.
     * @return {ConfigValue}
     */
    public get(key: string): ConfigValue { // tslint:disable-next-line no-reserved-keywords
        return this.contents.get(key);
    }

    /**
     * Returns the list of keys that contain a value.
     * @param {ConfigValue} value The value to filter keys on.
     * @returns {string[]}
     */
    public getKeysByValue(value: ConfigValue): string[] {
        const matchedEntries = _.filter(this.entries(), (entry: ConfigEntry) => entry[1] === value);
        // Only return the keys
        return matchedEntries.map((entry: ConfigEntry) => entry[0]);
    }

    /**
     * Returns a boolean asserting whether a value has been associated to the key in the config object or not.
     * @param {string} key The key.
     */
    public has(key: string): boolean {
        return this.contents.has(key);
    }

    /**
     * Returns an array that contains the keys for each element in the config object.
     * @returns {string[]}
     */
    public keys(): string[] {
        return _.keys(this.contents);
    }

    /**
     * Sets the value for the key in the config object.
     * @param {string} key The Key.
     * @param {ConfigValue} value The value.
     * @returns {ConfigContents} Returns the config object
     */
    public set(key: string, value: ConfigValue): ConfigContents { // tslint:disable-next-line no-reserved-keywords
        return this.contents.set(key, value);
    }

    /**
     * Returns true if an element in the config object existed and has been removed, or false if the element does not exist. {@link BaseConfigStore.has(key)} will return false afterwards.
     * @param {string} key The key.
     * @returns {boolean}
     */
    public unset(key: string): boolean {
        return this.contents.delete(key);
    }

    /**
     * Returns true if all elements in the config object existed and have been removed, or false if all the elements do not exist (some may have been removed). {@link BaseConfigStore.has(key)} will return false afterwards.
     * @param {string[]} keys The keys.
     * @returns {boolean}
     */
    public unsetAll(keys: string[]): boolean {
        return keys.reduce((val, key) => val && this.unset(key), true);
    }

    /**
     * Removes all key/value pairs from the config object.
     */
    public clear(): void {
        return this.contents.clear();
    }

    /**
     * Returns an array that contains the values for each element in the config object.
     * @returns {ConfigValue[]}
     */
    public values(): ConfigValue[] {
        return _.values(this.contents) as ConfigValue[];
    }

    /**
     * Returns the entire config contents.
     * @returns {ConfigContents}
     */
    public getContents(): ConfigContents {
        if (!this.contents) {
            this.setContents();
        }
        return this.contents;
    }

    /**
     * Set the entire config contents.
     * @param {ConfigContents} contents The contents.
     */
    public setContents(contents?: ConfigContents): void {
        this.contents = contents || new Map<string, ConfigValue>();
    }

    /**
     * Invokes `actionFn` once for each key-value pair present in the config object.
     * @param {function} actionFn The function `(key: string, value: ConfigValue) => void` to be called for each element.
     */
    public forEach(actionFn: (key: string, value: ConfigValue) => void): void {
        const entries = this.entries();
        for (let i = 0, entry = entries[i]; i < entries.length; i++) {
            actionFn(entry[0], entry[1]);
        }
    }

    /**
     * Asynchronously invokes `actionFn` once for each key-value pair present in the config object.
     * @param {function} actionFn The function `(key: string, value: ConfigValue) => Promise<void>` to be called for each element.
     * @returns {Promise<void>}
     */
    public async awaitEach(actionFn: (key: string, value: ConfigValue) => Promise<void>): Promise<void> {
        const entries = this.entries();
        for (let i = 0, entry = entries[i]; i < entries.length; i++) {
            await actionFn(entry[0], entry[1]);
        }
        return Promise.resolve();
    }

    /**
     * Convert the config object to a JSON object.
     * @returns {JsonMap}
     */
    public toObject(): JsonMap {
        return _.entries(this.contents).reduce((obj, entry: ConfigEntry) => {
            obj[entry[0]] = entry[1];
            return obj;
        }, {});
    }

    /**
     * Convert a JSON object to a {@link ConfigContents} and set it as the config contents.
     * @param {JsonMap} obj The object.
     */
    public setContentsFromObject(obj: JsonMap): void {
        this.contents = new Map<string, ConfigValue>(_.entries(obj as object));
    }
}
