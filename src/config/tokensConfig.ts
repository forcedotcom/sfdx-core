/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Optional } from '@salesforce/ts-types';
import { SfTokens } from '../stateAggregator';
import { ConfigFile } from './configFile';
import { ConfigContents, ConfigValue } from './configStore';

export class TokensConfig extends ConfigFile<ConfigFile.Options, SfTokens> {
  protected static encryptedKeys = [/token/i, /password/i, /secret/i];
  public static getDefaultOptions(): ConfigFile.Options {
    return {
      isGlobal: true,
      isState: true,
      filename: 'tokens.json',
    };
  }

  protected getMethod(contents: ConfigContents, key: string): Optional<ConfigValue> {
    return contents[key];
  }

  protected setMethod(contents: ConfigContents, key: string, value?: ConfigValue): void {
    contents[key] = value;
  }
}
