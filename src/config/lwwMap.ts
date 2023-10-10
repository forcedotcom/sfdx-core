/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { entriesOf } from '@salesforce/ts-types';
import { uniqid } from '../util/uniqid';
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
 *
 * */
export const stateFromContents = <P extends ConfigContents>(
  contents: P,
  timestamp = process.hrtime.bigint(),
  id?: string
): LWWState<P> =>
  Object.fromEntries(
    entriesOf(contents).map(([key, value]) => [
      key,
      new LWWRegister(id ?? uniqid(), { peer: 'file', timestamp, value }),
    ])
  ) as unknown as LWWState<P>;

export class LWWMap<P extends ConfigContents> {
  public readonly id: string;
  /** map of key to LWWRegister.  Used for managing conflicts */
  #data = new Map<string, LWWRegister<unknown | typeof SYMBOL_FOR_DELETED>>();

  public constructor(id?: string, state?: LWWState<P>) {
    this.id = id ?? uniqid();

    // create a new register for each key in the initial state
    for (const [key, register] of entriesOf(state ?? {})) {
      this.#data.set(key, new LWWRegister(this.id, register));
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
      Array.from(this.#data.entries())
        // .filter(([, register]) => Boolean(register))
        .map(([key, register]) => [key, register.state])
    ) as LWWState<P>;
  }

  public merge(state: LWWState<P>): LWWState<P> {
    // recursively merge each key's register with the incoming state for that key
    for (const [key, remote] of entriesOf(state)) {
      const local = this.#data.get(key);
      // if the register already exists, merge it with the incoming state
      if (local) local.merge(remote);
      // otherwise, instantiate a new `LWWRegister` with the incoming state
      else this.#data.set(key, new LWWRegister(this.id, remote));
    }
    return this.state;
  }

  public set<K extends Key<P>>(key: K, value: P[K]): void {
    // get the register at the given key
    const register = this.#data.get(key);

    // if the register already exists, set the value
    if (register) register.set(value);
    // otherwise, instantiate a new `LWWRegister` with the value
    else this.#data.set(key, new LWWRegister(this.id, { peer: this.id, timestamp: process.hrtime.bigint(), value }));
  }

  // TODO: how to handle the deep `get` that is currently allowed ex: get('foo.bar.baz')
  public get<K extends Key<P>>(key: K): P[K] | undefined {
    // map loses the typing
    const value = this.#data.get(key)?.value;
    if (value === SYMBOL_FOR_DELETED) return undefined;
    return value as P[K];
  }

  public delete(key: string): void {
    // set the register to null, if it exists
    this.#data.get(key)?.set(SYMBOL_FOR_DELETED);
  }

  public has(key: string): boolean {
    // if a register doesn't exist or its value is null, the map doesn't contain the key
    return this.#data.has(key) && this.#data.get(key)?.value !== SYMBOL_FOR_DELETED;
  }
}
