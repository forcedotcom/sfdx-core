/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
import { set } from '@salesforce/kit';
import {
    AnyJson,
    Dictionary,
    has,
    JsonMap,
    Optional,
    takeAnyJson
} from '@salesforce/ts-types';

/**
 * The allowed types stored in a config store.
 */
export type ConfigValue = AnyJson;

/**
 * The type of entries in a config store defined by the key and value type of {@link ConfigContents}.
 */
export type ConfigEntry = [string, ConfigValue];

/**
 * The type of content a config stores.
 */
export type ConfigContents = Dictionary<ConfigValue>;

/**
 * An interface for a config object with a persistent store.
 * @interface
 */
export interface ConfigStore {
    // Map manipulation methods
    entries(): ConfigEntry[];
    get(key: string): Optional<ConfigValue>;
    getKeysByValue(value: ConfigValue): string[];
    has(key: string): boolean;
    keys(): string[];
    set(key: string, value: ConfigValue): ConfigContents;
    unset(key: string): boolean;
    unsetAll(keys: string[]): boolean;
    clear(): void;
    values(): ConfigValue[];

    forEach(actionFn: (key: string, value: ConfigValue) => void): void;
    awaitEach(actionFn: (key: string, value: ConfigValue) => Promise<void>): Promise<void>;

    // Content methods
    getContents(): ConfigContents;
    setContents(contents?: ConfigContents): void;
}

/**
 * An abstract class that implements all the config management functions but
 * none of the storage functions.
 *
 * **Note:** To see the interface, look in typescripts autocomplete help or the npm package's ConfigStore.d.ts file.
 * @implements {ConfigStore}
 */
export abstract class BaseConfigStore implements ConfigStore {

    // Initialized in setContents
    private contents: ConfigContents = {};

    constructor(contents?: ConfigContents) {
        this.setContents(contents);
    }

    /**
     * Returns an array of {@link ConfigEntry} for each element in the config.
     * @returns {ConfigEntry}
     */
    public entries(): ConfigEntry[] {
        return Object.entries(this.contents);
    }

    /**
     * Returns the value associated to the key, or undefined if there is none.
     * @param {string} key The key.
     * @return {Optional<ConfigValue>}
     */
    public get(key: string): Optional<ConfigValue> {
        return takeAnyJson(this.contents, key);
    }

    /**
     * Returns the list of keys that contain a value.
     * @param {ConfigValue} value The value to filter keys on.
     * @returns {string[]}
     */
    public getKeysByValue(value: ConfigValue): string[] {
        const matchedEntries = this.entries().filter((entry: ConfigEntry) => entry[1] === value);
        // Only return the keys
        return matchedEntries.map((entry: ConfigEntry) => entry[0]);
    }

    /**
     * Returns a boolean asserting whether a value has been associated to the key in the config object or not.
     * @param {string} key The key.
     */
    public has(key: string): boolean {
        return has(this.contents, key);
    }

    /**
     * Returns an array that contains the keys for each element in the config object.
     * @returns {string[]}
     */
    public keys(): string[] {
        return Object.keys(this.contents);
    }

    /**
     * Sets the value for the key in the config object.
     * @param {string} key The Key.
     * @param {ConfigValue} value The value.
     * @returns {ConfigContents} Returns the config object.
     */
    public set(key: string, value: ConfigValue): ConfigContents {
        set(this.contents, key, value);
        return this.contents;
    }

    /**
     * Returns true if an element in the config object existed and has been removed, or false if the element does not exist. {@link BaseConfigStore.has(key)} will return false afterwards.
     * @param {string} key The key.
     * @returns {boolean}
     */
    public unset(key: string): boolean {
        return delete this.contents[key];
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
        this.contents = {};
    }

    /**
     * Returns an array that contains the values for each element in the config object.
     * @returns {ConfigValue[]}
     */
    public values(): ConfigValue[] {
        return Object.values(this.contents);
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
     * Sets the entire config contents.
     * @param {ConfigContents} contents The contents.
     */
    public setContents(contents?: ConfigContents): void {
        this.contents = contents || {};
    }

    /**
     * Invokes `actionFn` once for each key-value pair present in the config object.
     * @param {function} actionFn The function `(key: string, value: ConfigValue) => void` to be called for each element.
     */
    public forEach(actionFn: (key: string, value: ConfigValue) => void): void {
        const entries = this.entries();
        for (const entry of entries) {
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
        for (const entry of entries) {
            await actionFn(entry[0], entry[1]);
        }
    }

    /**
     * Convert the config object to a JSON object.
     * @returns {JsonMap} Returns the config contents. Same as calling ConfigStore.getContents
     */
    public toObject(): JsonMap {
        return this.contents;
    }

    /**
     * Convert an object to a {@link ConfigContents} and set it as the config contents.
     * @param {object} obj The object.
     */
    public setContentsFromObject<T extends object>(obj: T): void {
        this.contents = {};
        Object.entries(obj).forEach(([key, value]) => {
            set(this.contents, key, value);
        });
    }
}
