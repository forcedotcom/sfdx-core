/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export interface WhoAmIInterface {
  cliName: string;
  isSfdx: () => boolean;
  isSf: () => boolean;
  isOther: () => boolean;
}

/**
 * default impl of WhoAmIInterface
 * examines process.argv[0] to see current process has been started from sf or sfdx
 */
export class WhoAmI implements WhoAmIInterface {
  public cliName: string;
  public constructor() {
    this.cliName = process.argv[0] || 'sf';
  }

  public isOther(): boolean {
    return !this.isSf() && !this.isSfdx();
  }

  public isSf(): boolean {
    return this.cliName.startsWith('sf');
  }

  public isSfdx(): boolean {
    return this.cliName.startsWith('sfdx');
  }
}

export class WhoAmIFactory<T extends WhoAmIInterface> {
  // @ts-ignore
  public static whoAmI;
  public static instance<T extends WhoAmIInterface>(c: new () => T): T {
    if (!this.whoAmI) {
      WhoAmIFactory.whoAmI = new c();
    }
    return WhoAmIFactory.whoAmI;
  }
}

export const whoAmI = WhoAmIFactory.instance(WhoAmI);
