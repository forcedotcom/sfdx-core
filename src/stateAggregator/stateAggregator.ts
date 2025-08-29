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

import { AsyncOptionalCreatable } from '@salesforce/kit';
import { Global } from '../global';
import { Mutex } from '../util/mutex';
import { AliasAccessor } from './accessors/aliasAccessor';
import { OrgAccessor } from './accessors/orgAccessor';
import { SandboxAccessor } from './accessors/sandboxAccessor';
export class StateAggregator extends AsyncOptionalCreatable {
  private static instanceMap: Map<string, StateAggregator> = new Map();
  private static readonly mutex = new Mutex();
  public aliases!: AliasAccessor;
  public orgs!: OrgAccessor;
  public sandboxes!: SandboxAccessor;

  /**
   * Reuse a StateAggregator if one was already created for the current global state directory
   * Otherwise, create one and adds it to map for future reuse.
   * HomeDir might be stubbed in tests
   */
  public static async getInstance(): Promise<StateAggregator> {
    return StateAggregator.mutex.lock(async () => {
      if (!StateAggregator.instanceMap.has(Global.DIR)) {
        StateAggregator.instanceMap.set(Global.DIR, await StateAggregator.create());
      }
      // TS assertion is valid because there either was one OR it was just now instantiated
      return StateAggregator.instanceMap.get(Global.DIR) as StateAggregator;
    });
  }

  /**
   * Clear the cache to force reading from disk.
   *
   * *NOTE: Only call this method if you must and you know what you are doing.*
   * *NOTE: This call is NOT thread-safe, so it should only be called when no other threads are using the StateAggregator.*
   */
  public static clearInstance(path = Global.DIR): void {
    StateAggregator.instanceMap.delete(path);
  }

  /**
   * Clear the cache to force reading from disk in a thread-safe manner.
   *
   * *NOTE: Only call this method if you must and you know what you are doing.*
   */
  public static async clearInstanceAsync(path = Global.DIR): Promise<void> {
    return StateAggregator.mutex.lock(() => {
      StateAggregator.clearInstance(path);
    });
  }

  protected async init(): Promise<void> {
    this.orgs = await OrgAccessor.create();
    this.sandboxes = await SandboxAccessor.create();
    this.aliases = await AliasAccessor.create();
  }
}
