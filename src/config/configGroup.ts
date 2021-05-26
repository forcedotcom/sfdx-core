/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { definiteEntriesOf, definiteValuesOf, Dictionary, getJsonMap, JsonMap, Optional } from '@salesforce/ts-types';
import { SfdxError } from '../sfdxError';
import { ConfigFile } from './configFile';
import { ConfigContents, ConfigEntry, ConfigValue, Key } from './configStore';

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
export class ConfigGroup<
  T extends ConfigGroup.Options = ConfigGroup.Options,
  P extends ConfigContents = ConfigContents
> extends ConfigFile<T, P> {
  protected defaultGroup = 'default' as Key<P>;
  /**
   * Get ConfigGroup specific options, such as the default group.
   *
   * @param defaultGroup The default group to use when creating the config.
   * @param filename The filename of the config file. Uses the static {@link getFileName} by default.
   */
  public static getOptions(defaultGroup: string, filename?: string): ConfigGroup.Options {
    const options: ConfigFile.Options = ConfigFile.getDefaultOptions(true, filename);
    const configGroupOptions: ConfigGroup.Options = { defaultGroup };
    Object.assign(configGroupOptions, options);
    return configGroupOptions;
  }

  /**
   * Sets the default group for all {@link BaseConfigStore} methods to use.
   * **Throws** *{@link SfdxError}{ name: 'MissingGroupNameError' }* The group parameter is null or undefined.
   *
   * @param group The group.
   */
  public setDefaultGroup(group: Key<P>): void {
    if (!group) {
      throw new SfdxError('null or undefined group', 'MissingGroupNameError');
    }

    this.defaultGroup = group;
  }

  /**
   * Set a group of entries in a bulk save. Returns The new properties that were saved.
   *
   * @param newEntries An object representing the aliases to set.
   * @param group The group the property belongs to.
   */
  public async updateValues(newEntries: Dictionary<ConfigValue>, group?: string): Promise<Dictionary<ConfigValue>> {
    // Make sure the contents are loaded
    await this.read();
    Object.entries(newEntries).forEach(([key, val]) => this.setInGroup(key, val, group || this.defaultGroup));
    await this.write();
    return newEntries;
  }

  /**
   * Set a value on a group. Returns the promise resolved when the value is set.
   *
   * @param key The key.
   * @param value The value.
   * @param group The group.
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
   */
  public entries(): ConfigEntry[] {
    const group = this.getGroup();
    if (group) {
      return definiteEntriesOf(group);
    }
    return [];
  }

  /**
   * Returns a specified element from ConfigGroup. Returns the associated value.
   *
   * @param key The key.
   */
  public get<K extends Extract<keyof P, string>>(key: string): P[K] {
    return this.getInGroup(key) as P[K];
  }

  /**
   * Returns a boolean if an element with the specified key exists in the default group.
   *
   * @param {string} key The key.
   */
  public has(key: string): boolean {
    const group = this.getGroup();
    return !!group && super.has(this.defaultGroup) && !!group[key];
  }

  /**
   * Returns an array of the keys from the default group.
   */
  public keys(): Array<Key<P>> {
    return Object.keys(this.getGroup(this.defaultGroup) || {}) as Array<Key<P>>;
  }

  /**
   * Returns an array of the values from the default group.
   */
  public values(): ConfigValue[] {
    return definiteValuesOf(this.getGroup(this.defaultGroup) || {});
  }

  /**
   * Add or updates an element with the specified key in the default group.
   *
   * @param key The key.
   * @param value The value.
   */
  public set<K extends Extract<keyof P, string>>(key: K, value: P[K]): P {
    return this.setInGroup(key, value, this.defaultGroup) as P;
  }

  /**
   * Removes an element with the specified key from the default group. Returns `true` if the item was deleted.
   *
   * @param key The key.
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
   */
  public clear(): void {
    delete this.getContents()[this.defaultGroup];
  }

  /**
   * Get all config contents for a group.
   *
   * @param {string} [group = 'default'] The group.
   */
  public getGroup(group: string = this.defaultGroup): Optional<ConfigContents> {
    return getJsonMap(this.getContents(), group) || undefined;
  }

  /**
   * Returns the value associated to the key and group, or undefined if there is none.
   *
   * @param key The key.
   * @param group The group. Defaults to the default group.
   */
  public getInGroup(key: string, group?: string): Optional<ConfigValue> {
    const groupContents = this.getGroup(group as Key<P>);
    if (groupContents) {
      return groupContents[key];
    }
  }

  /**
   * Convert the config object to a json object.
   */
  public toObject(): JsonMap {
    return this.getContents();
  }

  /**
   * Convert an object to a {@link ConfigContents} and set it as the config contents.
   *
   * @param {object} obj The object.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  public setContentsFromObject<U extends object>(obj: U): void {
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
   *
   * @param key The key.
   * @param value The value.
   * @param group The group. Uses the default group if not specified.
   */
  public setInGroup(key: string, value?: ConfigValue, group?: string): ConfigContents {
    group = group || this.defaultGroup;

    if (!super.has(group as Key<P>)) {
      super.set(group as Extract<keyof P, string>, {} as P[Extract<keyof P, string>]);
    }
    const content = this.getGroup(group as Key<P>) || {};
    this.setMethod(content as P, key, value);

    return content;
  }

  /**
   * Initialize the asynchronous dependencies.
   */
  public async init(): Promise<void> {
    await super.init();
    if (this.options.defaultGroup) {
      this.setDefaultGroup(this.options.defaultGroup as Key<P>);
    }
  }
}

export namespace ConfigGroup {
  /**
   * Options when creating the config file.
   */
  export interface Options extends ConfigFile.Options {
    /**
     * The default group for properties to go into.
     */
    defaultGroup?: string;
  }
}
