/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AsyncOptionalCreatable } from '@salesforce/kit';
import { Global } from '../global';
import { AliasAccessor } from './accessors/aliasAccessor';
import { OrgAccessor } from './accessors/orgAccessor';
import { SandboxAccessor } from './accessors/sandboxAccessor';
import { TokenAccessor } from './accessors/tokenAccessor';
export class StateAggregator extends AsyncOptionalCreatable {
  private static instanceMap: Map<string, StateAggregator> = new Map();
  public aliases!: AliasAccessor;
  public orgs!: OrgAccessor;
  public sandboxes!: SandboxAccessor;
  public tokens!: TokenAccessor;

  /**
   * Reuse a StateAggregator if one was already created for the current global state directory
   * Otherwise, create one and adds it to map for future reuse.
   * HomeDir might be stubbed in tests
   */
  public static async getInstance(): Promise<StateAggregator> {
    if (!StateAggregator.instanceMap.has(Global.DIR)) {
      StateAggregator.instanceMap.set(Global.DIR, await StateAggregator.create());
    }
    // TS assertion is valid because there either was one OR it was just now instantiated
    return StateAggregator.instanceMap.get(Global.DIR) as StateAggregator;
  }

  /**
   * Clear the cache to force reading from disk.
   *
   * *NOTE: Only call this method if you must and you know what you are doing.*
   */
  public static clearInstance(path = Global.DIR): void {
    StateAggregator.instanceMap.delete(path);
  }

  protected async init(): Promise<void> {
    this.orgs = await OrgAccessor.create();
    this.sandboxes = await SandboxAccessor.create();
    this.aliases = await AliasAccessor.create();
    this.tokens = await TokenAccessor.create();
  }
}
