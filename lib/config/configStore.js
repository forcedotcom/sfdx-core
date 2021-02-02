/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AsyncCreatable, set } from '@salesforce/kit';
import { definiteEntriesOf, definiteValuesOf, get, getAnyJson } from '@salesforce/ts-types';
/**
 * An abstract class that implements all the config management functions but
 * none of the storage functions.
 *
 * **Note:** To see the interface, look in typescripts autocomplete help or the npm package's ConfigStore.d.ts file.
 */
export class BaseConfigStore extends AsyncCreatable {
  /**
   * Constructor.
   * @param options The options for the class instance.
   * @ignore
   */
  constructor(options) {
    super(options);
    this.options = options;
    this.setContents(this.options.contents);
  }
  /**
   * Returns an array of {@link ConfigEntry} for each element in the config.
   */
  entries() {
    return definiteEntriesOf(this.contents);
  }
  /**
   * Returns the value associated to the key, or undefined if there is none.
   * @param key The key.
   */
  get(key) {
    return getAnyJson(this.contents, key);
  }
  /**
   * Returns the list of keys that contain a value.
   * @param value The value to filter keys on.
   */
  getKeysByValue(value) {
    const matchedEntries = this.entries().filter(entry => entry[1] === value);
    // Only return the keys
    return matchedEntries.map(entry => entry[0]);
  }
  /**
   * Returns a boolean asserting whether a value has been associated to the key in the config object or not.
   * @param key The key.
   */
  has(key) {
    return !!get(this.contents, key);
  }
  /**
   * Returns an array that contains the keys for each element in the config object.
   */
  keys() {
    return Object.keys(this.contents);
  }
  /**
   * Sets the value for the key in the config object.
   * @param key The Key.
   * @param value The value.
   */
  set(key, value) {
    this.setMethod(this.contents, key, value);
    return this.contents;
  }
  /**
   * Returns `true` if an element in the config object existed and has been removed, or `false` if the element does not
   * exist. {@link BaseConfigStore.has} will return false afterwards.
   * @param key The key.
   */
  unset(key) {
    return delete this.contents[key];
  }
  /**
   * Returns `true` if all elements in the config object existed and have been removed, or `false` if all the elements
   * do not exist (some may have been removed). {@link BaseConfigStore.has(key)} will return false afterwards.
   * @param keys The keys.
   */
  unsetAll(keys) {
    return keys.reduce((val, key) => val && this.unset(key), true);
  }
  /**
   * Removes all key/value pairs from the config object.
   */
  clear() {
    this.contents = {};
  }
  /**
   * Returns an array that contains the values for each element in the config object.
   */
  values() {
    return definiteValuesOf(this.contents);
  }
  /**
   * Returns the entire config contents.
   */
  getContents() {
    if (!this.contents) {
      this.setContents();
    }
    return this.contents;
  }
  /**
   * Sets the entire config contents.
   * @param contents The contents.
   */
  setContents(contents) {
    this.contents = contents || {};
  }
  /**
   * Invokes `actionFn` once for each key-value pair present in the config object.
   * @param {function} actionFn The function `(key: string, value: ConfigValue) => void` to be called for each element.
   */
  forEach(actionFn) {
    const entries = this.entries();
    for (const entry of entries) {
      actionFn(entry[0], entry[1]);
    }
  }
  /**
   * Asynchronously invokes `actionFn` once for each key-value pair present in the config object.
   * @param {function} actionFn The function `(key: string, value: ConfigValue) => Promise<void>` to be called for
   * each element.
   * @returns {Promise<void>}
   */
  async awaitEach(actionFn) {
    const entries = this.entries();
    for (const entry of entries) {
      await actionFn(entry[0], entry[1]);
    }
  }
  /**
   * Convert the config object to a JSON object. Returns the config contents.
   * Same as calling {@link ConfigStore.getContents}
   */
  toObject() {
    return this.contents;
  }
  /**
   * Convert an object to a {@link ConfigContents} and set it as the config contents.
   * @param obj The object.
   */
  setContentsFromObject(obj) {
    this.contents = {};
    Object.entries(obj).forEach(([key, value]) => {
      this.setMethod(this.contents, key, value);
    });
  }
  // Allows extended classes the ability to override the set method. i.e. maybe they don't want
  // nested object set from kit.
  setMethod(contents, key, value) {
    set(contents, key, value);
  }
}
//# sourceMappingURL=configStore.js.map
