/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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

  public static get hits(): number {
    return Cache.instance().#hits;
  }
  public static get lookups(): number {
    return Cache.instance().#lookups;
  }

  public static instance(): Cache {
    if (!Cache.#instance) {
      Cache.#enabled = true;
      Cache.#instance = new Cache();
    }
    return Cache.#instance;
  }

  public static set<V>(key: string, value: V): void {
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
}
