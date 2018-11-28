/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { ConfigFile } from './configFile';

/**
 * An auth config file that stores information such as access tokens, usernames, etc.,
 * in the global sfdx directory (~/.sfdx).
 *
 * ```
 * const authInfo = await AuthInfoConfig.retrieve<AuthInfoConfig>(AuthInfoConfig.getOptions(username));
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
      filename: `${username}.json`
    };
  }
}
