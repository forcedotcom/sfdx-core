/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export class Cache extends Map {
  private static _instance: Cache;
  private _hits = 0;
  private _lookups = 0;

  public static instance(): Cache {
    if (!Cache._instance) {
      Cache._instance = new Cache();
    }
    return Cache._instance;
  }

  public static set<V>(key: string, value: V) {
    Cache.instance().set(key, value);
  }

  public static get<V>(key: string): V {
    Cache.instance()._lookups++;
    Cache.instance()._hits += Cache.instance().has(key) ? 1 : 0;
    return Cache._instance.get(key) as V;
  }

  public get hits(): number {
    return Cache.instance()._hits;
  }
  public get lookups(): number {
    return Cache.instance()._lookups;
  }
}
