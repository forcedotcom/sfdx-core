/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AsyncOptionalCreatable } from '@salesforce/kit';
import { entriesOf, isPlainObject } from '@salesforce/ts-types';
import { definiteEntriesOf, definiteValuesOf, isJsonMap, isString, JsonMap, Optional } from '@salesforce/ts-types';
import { Crypto } from '../crypto/crypto';
import { SfError } from '../sfError';
import { nowBigInt } from '../util/time';
import { LWWMap, stateFromContents } from './lwwMap';
import { ConfigContents, ConfigEntry, ConfigValue, Key } from './configStackTypes';

/**
 * An interface for a config object with a persistent store.
 */
export interface ConfigStore<P extends ConfigContents = ConfigContents> {
  // Map manipulation methods
  entries(): ConfigEntry[];
  // NEXT_RELEASE: update types to specify return can be P[K] | undefined
  get<K extends Key<P>>(key: K, decrypt: boolean): P[K];
  // NEXT_RELEASE: update types to specify return can be T | undefined
  get<T extends ConfigValue>(key: string, decrypt: boolean): T;
  getKeysByValue(value: ConfigValue): Array<Key<P>>;
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

  // Content methods
  getContents(): P;
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
  // If encryptedKeys is an array of RegExps, they should not contain the /g (global) or /y (sticky) flags to avoid stateful issues.
  protected static encryptedKeys: Array<string | RegExp> = [];
  protected options: T;
  protected crypto?: Crypto;

  // Initialized in setContents
  protected contents = new LWWMap<P>();
  private statics = this.constructor as typeof BaseConfigStore;

  /**
   * Constructor.
   *
   * @param options The options for the class instance.
   * @ignore
   */
  public constructor(options?: T) {
    super(options);
    this.options = options ?? ({} as T);
    this.setContents(this.initialContents());
  }

  /**
   * Returns an array of {@link ConfigEntry} for each element in the config.
   */
  public entries(): ConfigEntry[] {
    return definiteEntriesOf(this.contents.value ?? {});
  }

  /**
   * Returns the value associated to the key, or undefined if there is none.
   *
   * @param key The key (object property)
   * @param decrypt If it is an encrypted key, decrypt the value.
   * If the value is an object, a clone will be returned.
   */
  // NEXT_RELEASE: update types to specify return can be  | undefined
  public get<K extends Key<P>>(key: K, decrypt?: boolean): P[K];
  // NEXT_RELEASE: update types to specify return can be  | undefined
  // NEXT_RELEASE: consider getting rid of ConfigValue and letting it just use the Key<> approach
  public get<V = ConfigValue>(key: string, decrypt?: boolean): V;
  // NEXT_RELEASE: update types to specify return can be  | undefined
  public get<K extends Key<P>>(key: K | string, decrypt = false): P[K] | ConfigValue {
    const rawValue = this.contents.get(key as K);

    if (this.hasEncryption() && decrypt) {
      if (isJsonMap(rawValue)) {
        return this.recursiveDecrypt(structuredClone(rawValue), key);
      } else if (this.isCryptoKey(key)) {
        return this.decrypt(rawValue) as P[K] | ConfigValue;
      }
    }
    // NEXT_RELEASE: update types to specify return can be  | undefined
    return rawValue as P[K] | ConfigValue;
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
   */
  public has(key: string): boolean {
    return this.contents.has(key) ?? false;
  }

  /**
   * Returns an array that contains the keys for each element in the config object.
   */
  public keys(): Array<Key<P>> {
    return Object.keys(this.contents.value ?? {}) as Array<Key<P>>;
  }

  /**
   * Sets the value for the key in the config object. This will override the existing value.
   * To do a partial update, use {@link BaseConfigStore.update}.
   *
   * @param key The key.
   * @param value The value.
   */
  public set<K extends Key<P>>(key: K, value: P[K]): void {
    if (this.hasEncryption()) {
      if (isJsonMap(value)) {
        value = this.recursiveEncrypt(value, key as string) as P[K];
      } else if (this.isCryptoKey(key as string)) {
        value = this.encrypt(value) as P[K];
      }
    }
    // set(key, undefined) means unset
    if (value === undefined) {
      this.unset(key);
    } else {
      this.contents.set(key, value);
    }
  }

  /**
   * Updates the value for the key in the config object. If the value is an object, it
   * will be merged with the existing object.
   *
   * @param key The key.
   * @param value The value.
   */
  public update<K extends Key<P>>(key: K, value: Partial<P[K]>): void {
    const existingValue = this.get(key, true);
    if (isPlainObject(existingValue) && isPlainObject(value)) {
      const mergedValue = Object.assign({}, existingValue, value);
      this.set(key, mergedValue as P[K]);
    } else {
      this.set(key, value as P[K]);
    }
  }

  /**
   * Returns `true` if an element in the config object existed and has been removed, or `false` if the element does not
   * exist. {@link BaseConfigStore.has} will return false afterwards.
   *
   * @param key The key
   */
  public unset<K extends Key<P>>(key: K): boolean {
    if (this.has(key)) {
      this.contents.delete(key);
      return true;
    }
    return false;
  }

  /**
   * Returns `true` if all elements in the config object existed and have been removed, or `false` if all the elements
   * do not exist (some may have been removed). {@link BaseConfigStore.has(key)} will return false afterwards.
   *
   * @param keys The keys
   */
  public unsetAll(keys: Array<Key<P>>): boolean {
    return keys.map((key) => this.unset(key)).every(Boolean);
  }

  /**
   * Removes all key/value pairs from the config object.
   */
  public clear(): void {
    this.keys().map((key) => this.unset(key));
  }

  /**
   * Returns an array that contains the values for each element in the config object.
   */
  public values(): ConfigValue[] {
    return definiteValuesOf(this.contents.value ?? {});
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
  public getContents(decrypt = false): Readonly<P> {
    if (this.hasEncryption() && decrypt) {
      return this.recursiveDecrypt(structuredClone(this.contents?.value ?? {})) as P;
    }
    return this.contents?.value ?? ({} as P);
  }

  /**
   * Invokes `actionFn` once for each key-value pair present in the config object.
   *
   * @param {function} actionFn The function `(key: string, value: ConfigValue) => void` to be called for each element.
   */
  public forEach(actionFn: (key: string, value: ConfigValue) => void): void {
    this.entries().map((entry) => actionFn(entry[0], entry[1]));
  }

  /**
   * Convert the config object to a JSON object. Returns the config contents.
   * Same as calling {@link ConfigStore.getContents}
   */
  public toObject(): JsonMap {
    return this.contents.value ?? {};
  }

  /**
   * Convert an object to a {@link ConfigContents} and set it as the config contents.
   *
   * @param obj The object.
   */
  public setContentsFromObject(obj: P): void {
    const objForWrite = this.hasEncryption() ? this.recursiveEncrypt(obj) : obj;
    entriesOf(objForWrite).map(([key, value]) => {
      this.set(key, value);
    });
  }

  /**
   * Keep ConfigFile concurrency-friendly.
   * Avoid using this unless you're reading the file for the first time
   * and guaranteed to no be cross-saving existing contents
   * */
  protected setContentsFromFileContents(contents: P, timestamp?: bigint): void {
    const state = stateFromContents(contents, timestamp ?? nowBigInt());
    this.contents = new LWWMap<P>(state);
  }

  /**
   * Sets the entire config contents.
   *
   * @param contents The contents.
   */
  protected setContents(contents: P = {} as P): void {
    if (this.hasEncryption()) {
      contents = this.recursiveEncrypt(contents);
    }
    entriesOf(contents).map(([key, value]) => {
      this.contents.set(key, value);
    });
  }

  protected getEncryptedKeys(): Array<string | RegExp> {
    return [...(this.options?.encryptedKeys ?? []), ...(this.statics?.encryptedKeys ?? [])];
  }

  /**
   * This config file has encrypted keys and it should attempt to encrypt them.
   *
   * @returns Has encrypted keys
   */
  protected hasEncryption(): boolean {
    return this.getEncryptedKeys().length > 0;
  }

  // eslint-disable-next-line class-methods-use-this
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
  protected isCryptoKey(key: string): string | RegExp | undefined {
    function resolveProperty(): string {
      // Handle query keys
      const dotAccessor = /\.([a-zA-Z0-9@._-]+)$/;
      const singleQuoteAccessor = /\['([a-zA-Z0-9@._-]+)'\]$/;
      const doubleQuoteAccessor = /\["([a-zA-Z0-9@._-]+)"\]$/;
      const matcher = dotAccessor.exec(key) ?? singleQuoteAccessor.exec(key) ?? doubleQuoteAccessor.exec(key);
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
      throw new SfError(
        `can only encrypt strings but found: ${typeof value} : ${JSON.stringify(value)}`,
        'InvalidCryptoValueError'
      );
    return this.crypto.isEncrypted(value) ? value : this.crypto.encrypt(value);
  }

  protected decrypt(value: unknown): string | undefined {
    if (!value) return;
    if (!this.crypto) throw new SfError('crypto is not initialized', 'CryptoNotInitializedError');
    if (!isString(value))
      throw new SfError(
        `can only encrypt strings but found: ${typeof value} : ${JSON.stringify(value)}`,
        'InvalidCryptoValueError'
      );
    return this.crypto.isEncrypted(value) ? this.crypto.decrypt(value) : value;
  }

  /**
   * Encrypt all values in a nested JsonMap.
   *
   * @param keyPaths: The complete path of the (nested) data
   * @param data: The current (nested) data being worked on.
   */
  protected recursiveEncrypt<J extends JsonMap>(data: J, parentKey?: string): J {
    for (const key of Object.keys(data)) {
      this.recursiveCrypto(this.encrypt.bind(this), [...(parentKey ? [parentKey] : []), key], data);
    }
    return data;
  }

  /**
   * Decrypt all values in a nested JsonMap.
   *
   * @param keyPaths: The complete path of the (nested) data
   * @param data: The current (nested) data being worked on.
   */
  protected recursiveDecrypt(data: JsonMap, parentKey?: string): JsonMap {
    for (const key of Object.keys(data)) {
      this.recursiveCrypto(this.decrypt.bind(this), [...(parentKey ? [parentKey] : []), key], data);
    }
    return data;
  }

  /**
   * Encrypt/Decrypt all values in a nested JsonMap.
   *
   * @param keyPaths: The complete path of the (nested) data
   * @param data: The current (nested) data being worked on.
   */
  private recursiveCrypto(method: (value: unknown) => Optional<string>, keyPaths: string[], data: JsonMap): void {
    const key = keyPaths.pop() as string;
    const value = data[key];
    if (isJsonMap(value)) {
      for (const newKey of Object.keys(value)) {
        this.recursiveCrypto(method, [...keyPaths, key, newKey], value);
      }
    } else if (this.isCryptoKey(key)) {
      data[key] = method(value);
    }
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
  }
}
