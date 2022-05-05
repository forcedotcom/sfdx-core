/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AsyncOptionalCreatable, cloneJson, set } from '@salesforce/kit';
import { isPlainObject } from '@salesforce/ts-types';
import {
  AnyJson,
  definiteEntriesOf,
  definiteValuesOf,
  Dictionary,
  get,
  isJsonMap,
  isString,
  JsonMap,
  Optional,
} from '@salesforce/ts-types';
import * as diffPatch from 'jsondiffpatch';
import { Crypto } from '../crypto/crypto';
import { SfError } from '../sfError';
import { deepCopy, getRootKey } from '../util/utils';

const oKeys = Object.keys;
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

export type Key<P extends ConfigContents> = Extract<keyof P, string>;

/**
 * An interface for a config object with a persistent store.
 */
export interface ConfigStore<P extends ConfigContents = ConfigContents> {
  // Map manipulation methods
  entries(): ConfigEntry[];
  get<K extends Key<P>>(key: K, decrypt: boolean): P[K];
  get<T extends ConfigValue>(key: string, decrypt: boolean): T;

  getKeysByValue(value: ConfigValue, includeDeleted: boolean): Array<Key<P>>;
  has(key: string): boolean;
  keys(): Array<Key<P>>;
  set<K extends Key<P>>(key: K, value: P[K]): void;
  set<T extends ConfigValue>(key: string, value: T): void;
  update<K extends Key<P>>(key: K, value: Partial<P[K]>): void;
  update<T extends ConfigValue>(key: string, value: Partial<T>): void;
  unset(key: string): boolean;
  unsetAll(keys: string[]): boolean;
  clear(): void;
  values(): ConfigValue[];

  forEach(actionFn: (key: string, value: ConfigValue) => void): void;
  awaitEach(actionFn: (key: string, value: ConfigValue) => Promise<void>): Promise<void>;

  // Content methods
  getContents(): P;
  getOriginalContents(): P;
  setContents(contents?: P): void;
  setOriginalContents(contents?: P): void;
}

/**
 * An abstract class that implements all the config management functions but
 * none of the storage functions.
 *
 * **Note:** To see the interface, look in typescripts autocomplete help or the npm package's ConfigStore.d.ts file.
 */
export abstract class BaseConfigStore<
    T extends BaseConfigStore.Options = BaseConfigStore.Options,
    P extends ConfigContents = ConfigContents
  >
  extends AsyncOptionalCreatable<T>
  implements ConfigStore<P>
{
  protected static encryptedKeys: Array<string | RegExp> = [];
  protected options: T;
  protected crypto?: Crypto;

  // Initialized in setContents
  private contents!: P;
  private originalContents!: P;
  private statics = this.constructor as typeof BaseConfigStore;

  /**
   * Constructor.
   *
   * @param options The options for the class instance.
   * @ignore
   */
  public constructor(options?: T) {
    super(options);
    this.options = options || ({} as T);
    this.setContents(this.initialContents());
  }

  /**
   * Returns an array of {@link ConfigEntry} for each element in the config.
   */
  public entries(): ConfigEntry[] {
    return definiteEntriesOf(this.contents);
  }

  /**
   * Returns the value associated to the key, or undefined if there is none.
   *
   * @param key The key. Supports query key like `a.b[0]`.
   * @param decrypt If it is an encrypted key, decrypt the value.
   * If the value is an object, a clone will be returned.
   */
  public get<K extends Key<P>>(key: K, decrypt?: boolean): P[K];
  public get<T = ConfigValue>(key: string, decrypt?: boolean): T;
  public get<K extends Key<P>>(key: K | string, decrypt = false): P[K] | ConfigValue {
    const k = key as string;
    let value = this.getMethod(this.contents, k);

    if (this.hasEncryption() && decrypt) {
      if (isJsonMap(value)) {
        value = this.recursiveDecrypt(cloneJson(value), k);
      } else if (this.isCryptoKey(k)) {
        value = this.decrypt(value);
      }
    }
    return value as P[K];
  }

  /**
   * Returns the list of keys that contain a value.
   *
   * @param value The value to filter keys on.
   */
  public getKeysByValue(value: ConfigValue): Array<Key<P>> {
    const matchedEntries = this.entries().filter((entry: ConfigEntry) => entry[1] === value);
    // Only return the keys
    return matchedEntries.map((entry: ConfigEntry) => entry[0]) as Array<Key<P>>;
  }

  /**
   * Returns a boolean asserting whether a value has been associated to the key in the config object or not.
   *
   * @param key The key. Supports query key like `a.b[0]`.
   */
  public has(key: string): boolean {
    return !!this.getMethod(this.contents, key);
  }

  /**
   * Returns an array that contains the keys for each element in the config object.
   */
  public keys(): Array<Key<P>> {
    return oKeys(this.contents) as Array<Key<P>>;
  }

  /**
   * Sets the value for the key in the config object. This will override the existing value.
   * To do a partial update, use {@link BaseConfigStore.update}.
   *
   * @param key The key. Supports query key like `a.b[0]`.
   * @param value The value.
   */
  public set<K extends Key<P>>(key: K, value: P[K]): void;
  public set<T = ConfigValue>(key: string, value: T): void;
  public set<K extends Key<P>>(key: K | string, value: P[K] | ConfigValue): void {
    if (this.hasEncryption()) {
      if (isJsonMap(value)) {
        value = this.recursiveEncrypt(value, key as string) as P[K];
      } else if (this.isCryptoKey(key as string)) {
        value = this.encrypt(value) as P[K];
      }
    }
    this.setMethod(this.contents, key as string, value);
  }

  /**
   * Updates the value for the key in the config object. If the value is an object, it
   * will be merged with the existing object.
   *
   * @param key The key. Supports query key like `a.b[0]`.
   * @param value The value.
   */
  public update<K extends Key<P>>(key: K, value: Partial<P[K]>): void;
  public update<T = ConfigValue>(key: string, value: Partial<T>): void;
  public update<K extends Key<P>>(key: K | string, value: Partial<P[K]> | Partial<ConfigValue>): void {
    const existingValue = this.get(key, true);
    if (isPlainObject(existingValue) && isPlainObject(value)) {
      value = Object.assign({}, existingValue, value);
    }
    this.set(key, value);
  }

  /**
   * Returns `true` if an element in the config object existed and has been removed, or `false` if the element does not
   * exist. {@link BaseConfigStore.has} will return false afterwards.
   *
   * @param key The key. Supports query key like `a.b[0]`.
   */
  public unset(key: string): boolean {
    if (this.has(key)) {
      if (this.contents[key]) {
        delete this.contents[key];
      } else {
        // It is a query key, so just set it to undefined
        this.setMethod(this.contents, key, undefined);
      }
      return true;
    }
    return false;
  }

  /**
   * Returns `true` if all elements in the config object existed and have been removed, or `false` if all the elements
   * do not exist (some may have been removed). {@link BaseConfigStore.has(key)} will return false afterwards.
   *
   * @param keys The keys. Supports query keys like `a.b[0]`.
   */
  public unsetAll(keys: string[]): boolean {
    return keys.reduce((val: boolean, key) => val && this.unset(key), true);
  }

  /**
   * Removes all key/value pairs from the config object.
   */
  public clear(): void {
    this.setContents({} as P);
  }

  /**
   * Returns an array that contains the values for each element in the config object.
   */
  public values(): ConfigValue[] {
    return definiteValuesOf(this.contents);
  }

  /**
   * Returns the entire config contents.
   *
   * *NOTE:* Data will still be encrypted unless decrypt is passed in. A clone of
   * the data will be returned to prevent storing un-encrypted data in memory and
   * potentially saving to the file system.
   *
   * @param decrypt: decrypt all data in the config. A clone of the data will be returned.
   *
   */
  public getContents(decrypt = false): P {
    if (!this.contents) {
      this.setContents();
    }
    if (this.hasEncryption() && decrypt) {
      return this.recursiveDecrypt(cloneJson(this.contents)) as P;
    }
    return this.contents;
  }

  /**
   * Returns the entire config contents in the state from when the config was set with setContents.
   *
   */
  public getOriginalContents(): P {
    return this.originalContents;
  }

  public setOriginalContents(contents: P = {} as P): void {
    this.originalContents = deepCopy(contents);
  }

  /**
   * Sets the entire config contents.
   *
   * @param contents The contents.
   */
  public setContents(contents: P = {} as P): void {
    if (this.hasEncryption()) {
      contents = this.recursiveEncrypt(contents);
    }
    this.contents = contents;
    this.setOriginalContents(contents);
  }

  /**
   * Invokes `actionFn` once for each key-value pair present in the config object.
   *
   * @param {function} actionFn The function `(key: string, value: ConfigValue) => void` to be called for each element.
   */
  public forEach(actionFn: (key: string, value: ConfigValue) => void): void {
    // TODO: how to capture changes to the config object?
    const entries = this.entries();
    for (const entry of entries) {
      actionFn(entry[0], entry[1]);
    }
  }

  /**
   * Asynchronously invokes `actionFn` once for each key-value pair present in the config object.
   *
   * @param {function} actionFn The function `(key: string, value: ConfigValue) => Promise<void>` to be called for
   * each element.
   * @returns {Promise<void>}
   */
  public async awaitEach(actionFn: (key: string, value: ConfigValue) => Promise<void>): Promise<void> {
    // TODO: how to capture changes to the config object?
    const entries = this.entries();
    for (const entry of entries) {
      await actionFn(entry[0], entry[1]);
    }
  }

  /**
   * Convert the config object to a JSON object. Returns the config contents.
   * Same as calling {@link ConfigStore.getContents}
   */
  public toObject(): JsonMap {
    return this.contents;
  }

  /**
   * Convert an object to a {@link ConfigContents} and set it as the config contents.
   *
   * @param obj The object.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  public setContentsFromObject<U extends object>(obj: U): void {
    this.setContents(this.getContentsFromObject(obj));
  }

  /**
   * Produce the differences between the as-is config (typically loaded during write),
   * the original config (typically loaded during read) and the current config as changed by calls to set and unset.
   *
   * Given the as-is config, determine what modifications are needed against the current config that account for the
   * changes made to the as-is config, the original config and the current config.
   * Assumptions:
   * - The as-is config is the config as it was loaded from the file system, right before this function is called.
   * - The original config is the config as it was loaded from the file system, right before the user started making changes.
   * - The current config is the config as it is currently.
   * - When no changes are detected, the current config is source of truth.
   * - When are entries in as-is or in original or in current config, common root keys in original and current config are compared.
   * -- If there are no changes and as=is and there are no modifications or deleteions to current, the current contents are set to as-is.
   * - The fully qualified keys are used to determine the differences and then those differences are applied to the current config.
   * - Any keys that are no longer present in as-is and have not been modified in current are deleted from the current config.
   *
   * @param obj The object.
   */
  public diffAndPatchContents(asIsContents: P): void {
    const asIsKeys = this.buildRootKeys(asIsContents);
    const currentKeys = this.buildRootKeys(this.getContents());
    const originalKeys = this.buildRootKeys(this.getOriginalContents());

    // create new map of values where keys are fully qualified paths using index notation
    const currentFqn: AnyJson = {};
    this.buildKeyDotPaths(currentFqn, this.getContents(), []);
    const currentFqnKeys = Object.keys(currentFqn);
    const asIsFqn: AnyJson = {};
    this.buildKeyDotPaths(asIsFqn, asIsContents, []);
    const asIsFqnKeys = Object.keys(asIsFqn);
    const originalFqn: AnyJson = {};
    this.buildKeyDotPaths(originalFqn, this.getOriginalContents(), []);
    const originalFqnKeys = Object.keys(originalFqn);

    // determine changes
    const asIsUnsetsFqnKeys = originalFqnKeys.filter((key) => !asIsFqnKeys.includes(key));
    const asIsSetsFqnKeys = asIsFqnKeys.filter((key) => !originalFqnKeys.includes(key));
    const currentSetsFqnKeys = currentFqnKeys.filter(
      (key) => originalFqnKeys.includes(key) && originalFqn[key] !== currentFqn[key]
    );
    const currentDeletedFqnKeys = currentFqnKeys.filter((key) => !originalFqnKeys.includes(key));

    // This next section deals with wholesale content changes based on presence of keys in as-is, original or current config.
    // Assumptions
    // - If as-is and original are empty, then any changes made to current are accepted as source of truth.
    // - If as-is is empty and original is not, then all entries in original are to be deleted from current, except for those that are modified in current.
    // - If as-is is not empty and original is empty, so entries in as-is are assumed to have been added, then all entries in as-is are to be added to current.

    // as-is and original are empty - don't care what was done in current - current is source of truth
    if (asIsKeys.length === 0 && originalKeys.length === 0) {
      return;
    }

    // if as-is is empty and original is not, then assume all entries were deleted by as-is, so retain only
    // those entries in current that were modified by the user
    if (asIsKeys.length === 0 && originalKeys.length > 0) {
      const keepKeys = currentKeys.filter((key) =>
        currentSetsFqnKeys.some((modifiedKey) => modifiedKey.startsWith(getRootKey(key, this.options.baseKeys)))
      );
      const newContents = this.buildContents(keepKeys, [this.getContents()]);
      this.setContents(newContents);
      this.pruneUndefinedEntries(this.getContents());
      return;
    }

    // if as-is is not empty and original is empty, then all entries were added by as-is, so retain as-is and current
    if (
      asIsKeys.length > 0 &&
      originalKeys.length === 0 &&
      currentSetsFqnKeys.length === 0 &&
      currentDeletedFqnKeys.length === 0
    ) {
      const newContents = this.buildContents(asIsKeys, [asIsContents]);
      this.setContents(newContents);
      this.pruneUndefinedEntries(this.getContents());
      return;
    }

    // nothing has changed between original and current, use current as source of truth
    if (currentSetsFqnKeys.length === 0 && currentDeletedFqnKeys.length === 0) {
      return;
    }

    // apply changes to contents
    let patch = originalFqn;

    const asIsDiff = diffPatch.diff(originalFqn, asIsFqn);
    if (asIsDiff) {
      patch = diffPatch.patch(patch, asIsDiff);
    }

    const currentDiff = diffPatch.diff(patch, currentFqn);
    if (currentDiff) {
      patch = diffPatch.patch(patch, currentDiff);
    }

    // apply patched contents to current contents
    Object.entries(patch).forEach(([key, value]) => {
      this.set(key, value);
    });

    // apply as-is unsets
    asIsUnsetsFqnKeys.forEach((key) => {
      this.unset(key);
    });
    // apply as-is sets
    asIsSetsFqnKeys.forEach((key) => {
      this.set(key, asIsFqn[key]);
    });

    // calculate top level keys to delete from current
    // using original keys find those that are not in as-is and not in modified
    const keysToDelete = originalKeys.filter(
      (key) =>
        !asIsKeys.includes(key) && !currentSetsFqnKeys.some((k) => k.startsWith(getRootKey(key, this.options.baseKeys)))
    );
    keysToDelete.forEach((key) => {
      if (originalKeys.includes(key)) {
        this.unset(key);
      }
    });
    //
    this.pruneUndefinedEntries(this.getContents());
  }

  protected getEncryptedKeys(): Array<string | RegExp> {
    return [...(this.options?.encryptedKeys || []), ...(this.statics?.encryptedKeys || [])];
  }

  /**
   * This config file has encrypted keys and it should attempt to encrypt them.
   *
   * @returns Has encrypted keys
   */
  protected hasEncryption(): boolean {
    return this.getEncryptedKeys().length > 0;
  }

  // Allows extended classes the ability to override the set method. i.e. maybe they want
  // nested object set from kit.
  protected setMethod(contents: ConfigContents, key: string, value?: ConfigValue): void {
    set(contents, key, value);
  }

  // Allows extended classes the ability to override the get method. i.e. maybe they want
  // nested object get from ts-types.
  // NOTE: Key must stay string to be reliably overwritten.
  protected getMethod(contents: ConfigContents, key: string): Optional<ConfigValue> {
    return get(contents, key) as ConfigValue;
  }

  protected initialContents(): P {
    return {} as P;
  }

  /**
   * Used to initialize asynchronous components.
   */
  protected async init(): Promise<void> {
    if (this.hasEncryption()) {
      await this.initCrypto();
    }
  }

  /**
   * Initialize the crypto dependency.
   */
  protected async initCrypto(): Promise<void> {
    if (!this.crypto) {
      this.crypto = await Crypto.create();
    }
  }

  /**
   * Closes the crypto dependency. Crypto should be close after it's used and no longer needed.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async clearCrypto(): Promise<void> {
    if (this.crypto) {
      this.crypto.close();
      delete this.crypto;
    }
  }

  /**
   * Should the given key be encrypted on set methods and decrypted on get methods.
   *
   * @param key The key. Supports query key like `a.b[0]`.
   * @returns Should encrypt/decrypt
   */
  protected isCryptoKey(key: string) {
    function resolveProperty(): string {
      // Handle query keys
      const dotAccessor = /\.([a-zA-Z0-9@._-]+)$/;
      const singleQuoteAccessor = /\['([a-zA-Z0-9@._-]+)'\]$/;
      const doubleQuoteAccessor = /\["([a-zA-Z0-9@._-]+)"\]$/;
      const matcher = dotAccessor.exec(key) || singleQuoteAccessor.exec(key) || doubleQuoteAccessor.exec(key);
      return matcher ? matcher[1] : key;
    }

    // Any keys named the following should be encrypted/decrypted
    return (this.statics.encryptedKeys || []).find((keyOrExp) => {
      const property = resolveProperty();
      if (keyOrExp instanceof RegExp) {
        return keyOrExp.test(property);
      } else {
        return keyOrExp === property;
      }
    });
  }

  protected encrypt(value: unknown): Optional<string> {
    if (!value) return;
    if (!this.crypto) throw new SfError('crypto is not initialized', 'CryptoNotInitializedError');
    if (!isString(value))
      throw new SfError(`can only encrypt strings but found: ${typeof value} : ${value}`, 'InvalidCryptoValueError');
    return this.crypto.isEncrypted(value) ? value : this.crypto.encrypt(value);
  }

  protected decrypt(value: unknown): Optional<string> {
    if (!value) return;
    if (!this.crypto) throw new SfError('crypto is not initialized', 'CryptoNotInitializedError');
    if (!isString(value))
      throw new SfError(`can only encrypt strings but found: ${typeof value} : ${value}`, 'InvalidCryptoValueError');
    return this.crypto.isEncrypted(value) ? this.crypto.decrypt(value) : value;
  }

  /**
   * Encrypt all values in a nested JsonMap.
   *
   * @param parentKey: The complete path of the (nested) data
   * @param data: The current (nested) data being worked on.
   */
  protected recursiveEncrypt<T extends JsonMap>(data: T, parentKey?: string): T {
    for (const key of Object.keys(data)) {
      this.recursiveCrypto(this.encrypt.bind(this), [...(parentKey ? [parentKey] : []), key], data);
    }
    return data;
  }

  /**
   * Decrypt all values in a nested JsonMap.
   *
   * @param parentKey: The complete path of the (nested) data
   * @param data: The current (nested) data being worked on.
   */
  protected recursiveDecrypt(data: JsonMap, parentKey?: string): JsonMap {
    for (const key of Object.keys(data)) {
      this.recursiveCrypto(this.decrypt.bind(this), [...(parentKey ? [parentKey] : []), key], data);
    }
    return data;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  protected getContentsFromObject<U extends object>(obj: U): P {
    const contents = {} as P;
    Object.entries(obj).forEach(([key, value]) => {
      this.setMethod(contents, key, value);
    });
    return contents;
  }

  /**
   * Encrypt/Decrypt all values in a nested JsonMap.
   *
   * @param method The method to use to encrypt.
   * @param keyPaths: The complete path of the (nested) data
   * @param data: The current (nested) data being worked on.
   */
  private recursiveCrypto(method: (value: unknown) => Optional<string>, keyPaths: string[], data: JsonMap) {
    const key = keyPaths.pop() as string;
    const value = data[key];
    if (isJsonMap(value)) {
      for (const newKey of Object.keys(value)) {
        this.recursiveCrypto(method, [...keyPaths, key, newKey], value);
      }
    } else {
      if (this.isCryptoKey(key)) {
        data[key] = method(value);
      }
    }
  }

  /**
   * Build the key dot paths, "a.b.c", from an object that may have nested entries { a: { b: { c: "foo" }}}
   *
   * @param keyPaths
   * @param obj
   * @param keys
   * @private
   */
  private buildKeyDotPaths(keyPaths: AnyJson, obj: AnyJson | undefined, keys: string[]): AnyJson {
    if (typeof obj !== 'object' || obj === null) {
      keyPaths = Object.assign(keyPaths, { [keys.join('')]: obj });
      return [keys, obj as AnyJson];
    }
    return Object.entries(obj).map(([key, value]) => {
      return this.buildKeyDotPaths(keyPaths, value, [...keys, `["${key}"]`]);
    });
  }

  /**
   * Given contents, calculate the root keys present, considered the base keys that may have been
   * provided with this config was constructed
   *
   * @param contents
   * @private
   */
  private buildRootKeys(contents: P): string[] {
    if (!this.options.baseKeys || this.options.baseKeys.length === 0) return oKeys(contents);
    return (this.options.baseKeys ?? [])
      .map((key) => {
        if (!contents[key]) return [];
        const subKeys = oKeys(contents[key] ?? {});
        if (subKeys.length === 0) return [];
        return subKeys.map((subKey) => `["${key}"]["${subKey}"]`);
      })
      .flat(3);
  }

  /**
   * Recursively prunes entries that are undefined
   *
   * @param obj
   * @private
   */
  private pruneUndefinedEntries(obj: P) {
    Object.entries(obj).forEach(([key, value]) => {
      if (value === undefined) {
        delete obj[key];
      }
      if (typeof value === 'object') {
        this.pruneUndefinedEntries(value as P);
      }
    });
  }

  /**
   * Given as set of root keys to keep, produce as single instance of P that represents
   * the set of contents of P provided.
   * Key/value are set in order of the contents array.
   *
   * @param keepKeys
   * @param contents
   * @private
   */
  private buildContents(keepKeys: string[], contents: P[]): P {
    const newContents = {} as P;
    contents.forEach((content) => {
      keepKeys.forEach((key) => {
        if (get(content, key)) {
          set(newContents, key, get(content, key));
        }
      });
    });
    return newContents;
  }
}

/**
 * @ignore
 */
export namespace BaseConfigStore {
  /**
   * Options for the config store.
   */
  export interface Options {
    /**
     * Keys to encrypt.
     *
     * The preferred way to set encrypted keys is to use {@link BaseConfigStore.encryptedKeys}
     * so they are constant for all instances of a Config class. However, this is useful for
     * instantiating subclasses of ConfigStore on the fly (like {@link ConfigFile}) without
     * defining a new class.
     */
    encryptedKeys?: Array<string | RegExp>;
    baseKeys?: string[];
  }
}
