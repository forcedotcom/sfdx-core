/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfTokens } from '../globalInfo';
import { ConfigFile } from './configFile';

export class TokensConfig extends ConfigFile<ConfigFile.Options, SfTokens> {
  protected static encryptedKeys = [/token/gi, /password/gi, /secret/gi];
  public static getDefaultOptions(): ConfigFile.Options {
    return {
      isGlobal: true, // Only allow global auth files
      isState: true,
      filename: 'tokens.json',
    };
  }
}
