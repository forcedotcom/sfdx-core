/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { ConfigGroup } from './configGroup';
import { ConfigContents, ConfigValue } from './configStore';

/**
 * Different groups of aliases. Currently only support orgs.
 */
export enum AliasGroup {
  ORGS = 'orgs',
}

export class AliasesConfig extends ConfigGroup<ConfigGroup.Options> {
  public static getDefaultOptions(): ConfigGroup.Options {
    return { ...ConfigGroup.getOptions(AliasGroup.ORGS, 'alias.json'), isGlobal: true, isState: true };
  }

  // eslint-disable-next-line class-methods-use-this
  protected setMethod(contents: ConfigContents, key: string, value?: ConfigValue): void {
    contents[key] = value;
  }
}
