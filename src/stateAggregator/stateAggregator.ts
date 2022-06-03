/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AsyncOptionalCreatable } from '@salesforce/kit';
import { Optional } from '@salesforce/ts-types';
import { AliasAccessor } from './accessors/aliasAccessor';
import { OrgAccessor } from './accessors/orgAccessor';
import { SandboxAccessor } from './accessors/sandboxAccessor';
import { TokenAccessor } from './accessors/tokenAccessor';

export class StateAggregator extends AsyncOptionalCreatable {
  private static instance: Optional<StateAggregator>;

  public aliases!: AliasAccessor;
  public orgs!: OrgAccessor;
  public sandboxes!: SandboxAccessor;
  public tokens!: TokenAccessor;

  public static async getInstance(): Promise<StateAggregator> {
    if (!StateAggregator.instance) {
      StateAggregator.instance = await StateAggregator.create();
    }
    return StateAggregator.instance;
  }

  /**
   * Clear the cache to force reading from disk.
   *
   * *NOTE: Only call this method if you must and you know what you are doing.*
   */
  public static clearInstance(): void {
    delete StateAggregator.instance;
  }

  protected async init(): Promise<void> {
    this.orgs = await OrgAccessor.create();
    this.sandboxes = await SandboxAccessor.create();
    this.aliases = await AliasAccessor.create();
    this.tokens = await TokenAccessor.create();
  }
}
