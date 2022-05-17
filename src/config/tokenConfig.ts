/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { ConfigFile } from './configFile';

export class TokenConfig extends ConfigFile<ConfigFile.Options> {
  protected static encryptedKeys = [/token/gi, /password/gi, /secret/gi];
  public static getOptions(): ConfigFile.Options {
    return {
      isGlobal: true, // Only allow global auth files
      isState: true,
      filename: 'tokens.json',
    };
  }
}
