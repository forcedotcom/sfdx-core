/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AuthFields } from '../org/authInfo';
import { ConfigFile } from './configFile';

/**
 * An auth config file that stores information such as access tokens, usernames, etc.,
 * in the global sfdx directory (~/.sfdx).
 *
 * ```
 * const authInfo = await AuthInfoConfig.create(AuthInfoConfig.getOptions(username));
 * ```
 */
export class AuthInfoConfig extends ConfigFile<ConfigFile.Options, AuthFields> {
  protected static encryptedKeys = [/token/i, /password/i, /secret/i];
  /**
   * Gets the config options for a given org ID.
   *
   * @param username The username for the org.
   */
  public static getOptions(username: string): ConfigFile.Options {
    return {
      isGlobal: true, // Only allow global auth files
      isState: true,
      filename: `${username}.json`,
    };
  }
}
