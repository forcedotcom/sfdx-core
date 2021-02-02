'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('../index-ffe6ca9f.js');
var sfdxError = require('../sfdxError.js');
var config_configFile = require('./configFile.js');
require('../_commonjsHelpers-49936489.js');
require('../index-aea73a28.js');
require('../messages.js');
require('fs');
require('os');
require('path');
require('util');
require('../global.js');
require('../util/fs.js');
require('crypto');
require('constants');
require('stream');
require('assert');
require('../logger.js');
require('events');
require('../index-e6d82ffe.js');
require('tty');
require('../util/internal.js');
require('./configStore.js');

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * A config file that stores config values in groups. e.g. to store different config
 * values for different commands, without having manually manipulate the config.
 *
 * **Note:** All config methods are overwritten to use the {@link ConfigGroup.setDefaultGroup}.
 *
 * ```
 * class MyPluginConfig extends ConfigGroup<ConfigGroup.Options> {
 *   public static getFileName(): string {
 *     return 'myPluginConfigFilename.json';
 *   }
 * }
 * const myConfig = await MyPluginConfig.create(ConfigGroup.getOptions('all'));
 * myConfig.setDefaultGroup('myCommand'); // Can be set in your command's init.
 * myConfig.set('mykey', 'myvalue'); // Sets 'myKey' for the 'myCommand' group.
 * myConfig.setInGroup('myKey', 'myvalue', 'all'); // Manually set in another group.
 * await myConfig.write();
 * ```
 */
class ConfigGroup extends config_configFile.ConfigFile {
  constructor() {
    super(...arguments);
    this.defaultGroup = 'default';
  }
  /**
   * Get ConfigGroup specific options, such as the default group.
   * @param defaultGroup The default group to use when creating the config.
   * @param filename The filename of the config file. Uses the static {@link getFileName} by default.
   */
  static getOptions(defaultGroup, filename) {
    const options = config_configFile.ConfigFile.getDefaultOptions(true, filename);
    const configGroupOptions = { defaultGroup };
    Object.assign(configGroupOptions, options);
    return configGroupOptions;
  }
  /**
   * Sets the default group for all {@link BaseConfigStore} methods to use.
   * **Throws** *{@link SfdxError}{ name: 'MissingGroupName' }* The group parameter is null or undefined.
   * @param group The group.
   */
  setDefaultGroup(group) {
    if (!group) {
      throw new sfdxError.SfdxError('null or undefined group', 'MissingGroupName');
    }
    this.defaultGroup = group;
  }
  /**
   * Set a group of entries in a bulk save. Returns The new properties that were saved.
   * @param newEntries An object representing the aliases to set.
   * @param group The group the property belongs to.
   */
  async updateValues(newEntries, group) {
    // Make sure the contents are loaded
    await this.read();
    Object.entries(newEntries).forEach(([key, val]) => this.setInGroup(key, val, group || this.defaultGroup));
    await this.write();
    return newEntries;
  }
  /**
   * Set a value on a group. Returns the promise resolved when the value is set.
   * @param key The key.
   * @param value The value.
   * @param group The group.
   */
  async updateValue(key, value, group) {
    // Make sure the content is loaded
    await this.read();
    this.setInGroup(key, value, group || this.defaultGroup);
    // Then save it
    await this.write();
  }
  /**
   * Gets an array of key value pairs.
   */
  entries() {
    const group = this.getGroup();
    if (group) {
      return index.lib.definiteEntriesOf(group);
    }
    return [];
  }
  /**
   * Returns a specified element from ConfigGroup. Returns the associated value.
   * @param key The key.
   */
  get(key) {
    return this.getInGroup(key);
  }
  /**
   * Returns a boolean if an element with the specified key exists in the default group.
   * @param {string} key The key.
   */
  has(key) {
    const group = this.getGroup();
    return !!group && super.has(this.defaultGroup) && !!group[key];
  }
  /**
   * Returns an array of the keys from the default group.
   */
  keys() {
    return Object.keys(this.getGroup(this.defaultGroup) || {});
  }
  /**
   * Returns an array of the values from the default group.
   */
  values() {
    return index.lib.definiteValuesOf(this.getGroup(this.defaultGroup) || {});
  }
  /**
   * Add or updates an element with the specified key in the default group.
   * @param key The key.
   * @param value The value.
   */
  set(key, value) {
    return this.setInGroup(key, value, this.defaultGroup);
  }
  /**
   * Removes an element with the specified key from the default group. Returns `true` if the item was deleted.
   * @param key The key.
   */
  unset(key) {
    const groupContents = this.getGroup(this.defaultGroup);
    if (groupContents) {
      delete groupContents[key];
      return true;
    }
    return false;
  }
  /**
   * Remove all key value pairs from the default group.
   */
  clear() {
    delete this.getContents()[this.defaultGroup];
  }
  /**
   * Get all config contents for a group.
   * @param {string} [group = 'default'] The group.
   */
  getGroup(group = this.defaultGroup) {
    return index.lib.getJsonMap(this.getContents(), group) || undefined;
  }
  /**
   * Returns the value associated to the key and group, or undefined if there is none.
   * @param key The key.
   * @param group The group. Defaults to the default group.
   */
  getInGroup(key, group) {
    const groupContents = this.getGroup(group);
    if (groupContents) {
      return groupContents[key];
    }
  }
  /**
   * Convert the config object to a json object.
   */
  toObject() {
    return this.getContents();
  }
  /**
   * Convert an object to a {@link ConfigContents} and set it as the config contents.
   * @param {object} obj The object.
   */
  setContentsFromObject(obj) {
    const contents = new Map(Object.entries(obj));
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
   * @param value The value.
   * @param group The group. Uses the default group if not specified.
   */
  setInGroup(key, value, group) {
    let content;
    group = group || this.defaultGroup;
    if (!super.has(group)) {
      super.set(group, {});
    }
    content = this.getGroup(group) || {};
    this.setMethod(content, key, value);
    return content;
  }
  /**
   * Initialize the asynchronous dependencies.
   */
  async init() {
    await super.init();
    this.setDefaultGroup(this.options.defaultGroup);
  }
}

exports.ConfigGroup = ConfigGroup;
//# sourceMappingURL=configGroup.js.map
