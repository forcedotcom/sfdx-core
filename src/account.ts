/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AsyncCreatable } from '@salesforce/kit';

/**
 * Provides a way to manage a locally connected environment.
 *
 */
export class Account extends AsyncCreatable<Account.Options> {
  public async init() {
    // do something
  }
}

export namespace Account {
  /**
   * Constructor Options for and Org.
   */
  export interface Options {
    name: string;
  }
}
