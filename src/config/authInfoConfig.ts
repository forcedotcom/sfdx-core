/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { ConfigFile } from './configFile';

/**
 * @deprecated
 * An auth config file that stores information such as access tokens, usernames, etc.,
 * in the global sfdx directory (~/.sfdx).
 *
 * ```
 * const authInfo = await AuthInfoConfig.create(AuthInfoConfig.getOptions(username));
 * ```
 */
export class AuthInfoConfig extends ConfigFile<ConfigFile.Options> {
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
