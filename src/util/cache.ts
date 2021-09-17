/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export class Cache extends Map {
  /* eslint-disable @typescript-eslint/explicit-member-accessibility */
  static #instance: Cache;
  #hits = 0;
  #lookups = 0;
  #enabled = true;
  /* eslint-enable @typescript-eslint/explicit-member-accessibility */

  public static instance(): Cache {
    if (!Cache.#instance) {
      Cache.#instance = new Cache();
    }
    return Cache.#instance;
  }

  public static set<V>(key: string, value: V) {
    if (Cache.instance().#enabled) {
      Cache.instance().set(key, value);
    }
  }

  public static get<V>(key: string): V {
    if (Cache.instance().#enabled) {
      return undefined as unknown as V;
    }
    Cache.instance().#lookups++;
    Cache.instance().#hits += Cache.instance().has(key) ? 1 : 0;
    return Cache.#instance.get(key) as V;
  }

  public static disable(): void {
    Cache.instance().#enabled = false;
  }

  public static enable(): void {
    Cache.instance().#enabled = true;
  }

  public get hits(): number {
    return Cache.instance().#hits;
  }
  public get lookups(): number {
    return Cache.instance().#lookups;
  }
}
