import { AsyncCreatable } from '@salesforce/kit';
import { AnyJson, Dictionary, JsonMap, Optional } from '@salesforce/ts-types';
/**
 * The allowed types stored in a config store.
 */
export declare type ConfigValue = AnyJson;
/**
 * The type of entries in a config store defined by the key and value type of {@link ConfigContents}.
 */
export declare type ConfigEntry = [string, ConfigValue];
/**
 * The type of content a config stores.
 */
export declare type ConfigContents = Dictionary<ConfigValue>;
/**
 * An interface for a config object with a persistent store.
 */
export interface ConfigStore {
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
  getContents(): ConfigContents;
  setContents(contents?: ConfigContents): void;
}
/**
 * An abstract class that implements all the config management functions but
 * none of the storage functions.
 *
 * **Note:** To see the interface, look in typescripts autocomplete help or the npm package's ConfigStore.d.ts file.
 */
export declare abstract class BaseConfigStore<T extends BaseConfigStore.Options> extends AsyncCreatable<T>
  implements ConfigStore {
  protected options: T;
  private contents;
  /**
   * Constructor.
   * @param options The options for the class instance.
   * @ignore
   */
  constructor(options: T);
  /**
   * Returns an array of {@link ConfigEntry} for each element in the config.
   */
  entries(): ConfigEntry[];
  /**
   * Returns the value associated to the key, or undefined if there is none.
   * @param key The key.
   */
  get(key: string): Optional<ConfigValue>;
  /**
   * Returns the list of keys that contain a value.
   * @param value The value to filter keys on.
   */
  getKeysByValue(value: ConfigValue): string[];
  /**
   * Returns a boolean asserting whether a value has been associated to the key in the config object or not.
   * @param key The key.
   */
  has(key: string): boolean;
  /**
   * Returns an array that contains the keys for each element in the config object.
   */
  keys(): string[];
  /**
   * Sets the value for the key in the config object.
   * @param key The Key.
   * @param value The value.
   */
  set(key: string, value: ConfigValue): ConfigContents;
  /**
   * Returns `true` if an element in the config object existed and has been removed, or `false` if the element does not
   * exist. {@link BaseConfigStore.has} will return false afterwards.
   * @param key The key.
   */
  unset(key: string): boolean;
  /**
   * Returns `true` if all elements in the config object existed and have been removed, or `false` if all the elements
   * do not exist (some may have been removed). {@link BaseConfigStore.has(key)} will return false afterwards.
   * @param keys The keys.
   */
  unsetAll(keys: string[]): boolean;
  /**
   * Removes all key/value pairs from the config object.
   */
  clear(): void;
  /**
   * Returns an array that contains the values for each element in the config object.
   */
  values(): ConfigValue[];
  /**
   * Returns the entire config contents.
   */
  getContents(): ConfigContents;
  /**
   * Sets the entire config contents.
   * @param contents The contents.
   */
  setContents(contents?: ConfigContents): void;
  /**
   * Invokes `actionFn` once for each key-value pair present in the config object.
   * @param {function} actionFn The function `(key: string, value: ConfigValue) => void` to be called for each element.
   */
  forEach(actionFn: (key: string, value: ConfigValue) => void): void;
  /**
   * Asynchronously invokes `actionFn` once for each key-value pair present in the config object.
   * @param {function} actionFn The function `(key: string, value: ConfigValue) => Promise<void>` to be called for
   * each element.
   * @returns {Promise<void>}
   */
  awaitEach(actionFn: (key: string, value: ConfigValue) => Promise<void>): Promise<void>;
  /**
   * Convert the config object to a JSON object. Returns the config contents.
   * Same as calling {@link ConfigStore.getContents}
   */
  toObject(): JsonMap;
  /**
   * Convert an object to a {@link ConfigContents} and set it as the config contents.
   * @param obj The object.
   */
  setContentsFromObject<U extends object>(obj: U): void;
  protected setMethod(contents: ConfigContents, key: string, value?: ConfigValue): void;
}
/**
 * @ignore
 */
export declare namespace BaseConfigStore {
  /**
   * Options for the config store.
   */
  interface Options {
    /**
     * Intial contents for the config.
     */
    contents?: ConfigContents;
  }
}
