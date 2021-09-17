/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export class Cache extends Map {
  /* eslint-disable @typescript-eslint/explicit-member-accessibility */
  static #instance: Cache;
  static #enabled = true;
  #hits: number;
  #lookups: number;
  /* eslint-enable @typescript-eslint/explicit-member-accessibility */

  private constructor() {
    super();
    this.#hits = 0;
    this.#lookups = 0;
  }

  public static instance(): Cache {
    if (!Cache.#instance) {
      Cache.#enabled = true;
      Cache.#instance = new Cache();
    }
    return Cache.#instance;
  }

  public static set<V>(key: string, value: V) {
    Cache.instance();
    if (Cache.#enabled) {
      Cache.instance().set(key, value);
    }
  }

  public static get<V>(key: string): V | undefined {
    if (!Cache.#enabled) {
      return undefined;
    }
    Cache.instance().#lookups++;
    Cache.instance().#hits += Cache.instance().has(key) ? 1 : 0;
    return Cache.#instance.get(key) as V;
  }

  public static disable(): void {
    Cache.#enabled = false;
  }

  public static enable(): void {
    Cache.#enabled = true;
  }

  public static get hits(): number {
    return Cache.instance().#hits;
  }
  public static get lookups(): number {
    return Cache.instance().#lookups;
  }
}
