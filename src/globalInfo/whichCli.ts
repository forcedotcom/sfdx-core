/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export interface WhichCliInterface {
  cliName: string;
  isSfdx: () => boolean;
  isSf: () => boolean;
  isOther: () => boolean;
}

/**
 * default impl of WhichCliInterface
 * examines process.argv[0] to see current process has been started from sf or sfdx
 */
export class WhichCli implements WhichCliInterface {
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

export class WhichCliFactory<T extends WhichCliInterface> {
  // @ts-ignore
  public static whichCli: T;
  public static instance<T extends WhichCliInterface>(c: new () => T): T {
    if (!this.whichCli) {
      WhichCliFactory.whichCli = new c();
    }
    return WhichCliFactory.whichCli;
  }
}

export const whichCli = WhichCliFactory.instance(WhichCli);
