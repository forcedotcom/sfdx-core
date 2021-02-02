import { Dictionary, JsonMap, Optional } from '@salesforce/ts-types';
import { ConfigFile } from './configFile';
import { ConfigContents, ConfigEntry, ConfigValue } from './configStore';
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
export declare class ConfigGroup<T extends ConfigGroup.Options> extends ConfigFile<T> {
  /**
   * Get ConfigGroup specific options, such as the default group.
   * @param defaultGroup The default group to use when creating the config.
   * @param filename The filename of the config file. Uses the static {@link getFileName} by default.
   */
  static getOptions(defaultGroup: string, filename?: string): ConfigGroup.Options;
  protected defaultGroup: string;
  /**
   * Sets the default group for all {@link BaseConfigStore} methods to use.
   * **Throws** *{@link SfdxError}{ name: 'MissingGroupName' }* The group parameter is null or undefined.
   * @param group The group.
   */
  setDefaultGroup(group: string): void;
  /**
   * Set a group of entries in a bulk save. Returns The new properties that were saved.
   * @param newEntries An object representing the aliases to set.
   * @param group The group the property belongs to.
   */
  updateValues(newEntries: Dictionary<ConfigValue>, group?: string): Promise<Dictionary<ConfigValue>>;
  /**
   * Set a value on a group. Returns the promise resolved when the value is set.
   * @param key The key.
   * @param value The value.
   * @param group The group.
   */
  updateValue(key: string, value: ConfigValue, group?: string): Promise<void>;
  /**
   * Gets an array of key value pairs.
   */
  entries(): ConfigEntry[];
  /**
   * Returns a specified element from ConfigGroup. Returns the associated value.
   * @param key The key.
   */
  get(key: string): Optional<ConfigValue>;
  /**
   * Returns a boolean if an element with the specified key exists in the default group.
   * @param {string} key The key.
   */
  has(key: string): boolean;
  /**
   * Returns an array of the keys from the default group.
   */
  keys(): string[];
  /**
   * Returns an array of the values from the default group.
   */
  values(): ConfigValue[];
  /**
   * Add or updates an element with the specified key in the default group.
   * @param key The key.
   * @param value The value.
   */
  set(key: string, value: ConfigValue): ConfigContents;
  /**
   * Removes an element with the specified key from the default group. Returns `true` if the item was deleted.
   * @param key The key.
   */
  unset(key: string): boolean;
  /**
   * Remove all key value pairs from the default group.
   */
  clear(): void;
  /**
   * Get all config contents for a group.
   * @param {string} [group = 'default'] The group.
   */
  getGroup(group?: string): Optional<ConfigContents>;
  /**
   * Returns the value associated to the key and group, or undefined if there is none.
   * @param key The key.
   * @param group The group. Defaults to the default group.
   */
  getInGroup(key: string, group?: string): Optional<ConfigValue>;
  /**
   * Convert the config object to a json object.
   */
  toObject(): JsonMap;
  /**
   * Convert an object to a {@link ConfigContents} and set it as the config contents.
   * @param {object} obj The object.
   */
  setContentsFromObject<U extends object>(obj: U): void;
  /**
   * Sets the value for the key and group in the config object.
   * @param key The key.
   * @param value The value.
   * @param group The group. Uses the default group if not specified.
   */
  setInGroup(key: string, value?: ConfigValue, group?: string): ConfigContents;
  /**
   * Initialize the asynchronous dependencies.
   */
  init(): Promise<void>;
}
export declare namespace ConfigGroup {
  /**
   * Options when creating the config file.
   */
  interface Options extends ConfigFile.Options {
    /**
     * The default group for properties to go into.
     */
    defaultGroup: string;
  }
}
