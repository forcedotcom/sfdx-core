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

import { entriesOf } from '@salesforce/ts-types';
import { nowBigInt } from '../util/time';
import { LWWRegister } from './lwwRegister';
import { ConfigContents, Key } from './configStackTypes';

export const SYMBOL_FOR_DELETED = 'UNIQUE_IDENTIFIER_FOR_DELETED' as const;

export type LWWState<P> = {
  [Property in keyof P]: LWWRegister<P[Property] | typeof SYMBOL_FOR_DELETED>['state'];
};

/**
 * @param contents object aligning with ConfigContents
 * @param timestamp a bigInt that sets the timestamp.  Defaults to the current time
 * construct a LWWState from an object
 * @param keysToCheckForDeletion if a key is in this array, AND not in the contents, it will be marked as deleted
 * */
export const stateFromContents = <P extends ConfigContents>(contents: P, timestamp?: bigint): LWWState<P> =>
  Object.fromEntries(
    entriesOf(contents).map(
      ([key, value]): [keyof P, LWWRegister<P[typeof key] | typeof SYMBOL_FOR_DELETED>['state']] => [
        key,
        new LWWRegister<typeof value>({ timestamp: timestamp ?? nowBigInt(), value }),
      ]
    )
    // I'd love to get rid of this ASsertion but don't know how.
  ) as LWWState<P>;

export class LWWMap<P extends ConfigContents> {
  /** map of key to LWWRegister.  Used for managing conflicts */
  #data = new Map<string, LWWRegister<unknown>>();

  public constructor(state?: LWWState<P>) {
    // create a new register for each key in the initial state
    for (const [key, register] of entriesOf(state ?? {})) {
      this.#data.set(key, new LWWRegister(register));
    }
  }

  public get value(): P {
    return Object.fromEntries(
      Array.from(this.#data.entries())
        .filter(([, register]) => register.value !== SYMBOL_FOR_DELETED)
        .map(([key, register]) => [key, register.value])
    ) as P;
  }

  public get state(): LWWState<P> {
    return Object.fromEntries(
      Array.from(this.#data.entries()).map(([key, register]) => [key, register.state])
    ) as LWWState<P>;
  }

  // Merge top-level properties of the incoming state with the current state.
  // The value with the latest timestamp wins.
  public merge(state: LWWState<P>): LWWState<P> {
    // properties that are in the incoming state but not the current state might have been deleted.
    // recursively merge each key's register with the incoming state for that key
    for (const [key, remote] of entriesOf(state)) {
      const local = this.#data.get(key);
      // if the register already exists, merge it with the incoming state
      if (local) local.merge(remote);
      // otherwise, instantiate a new `LWWRegister` with the incoming state
      else this.#data.set(key, new LWWRegister(remote));
    }
    return this.state;
  }

  public set<K extends Key<P>>(key: K, value: P[K]): void {
    // get the register at the given key
    const register = this.#data.get(key);

    // if the register already exists, set the value
    if (register) register.set(value);
    // otherwise, instantiate a new `LWWRegister` with the value
    else this.#data.set(key, new LWWRegister({ timestamp: nowBigInt(), value }));
  }

  public get<K extends Key<P>>(key: K): P[K] | undefined {
    // map loses the typing
    const value = this.#data.get(key)?.value;
    if (value === SYMBOL_FOR_DELETED) return undefined;
    return value as P[K];
  }

  public delete<K extends Key<P>>(key: K): void {
    this.#data.set(
      key,
      new LWWRegister<typeof SYMBOL_FOR_DELETED>({
        timestamp: nowBigInt(),
        value: SYMBOL_FOR_DELETED,
      })
    );
  }

  public has(key: string): boolean {
    // if a register doesn't exist or its value is null, the map doesn't contain the key
    return this.#data.has(key) && this.#data.get(key)?.value !== SYMBOL_FOR_DELETED;
  }
}
