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
 * const authInfo = await AuthInfoConfig.create(AuthInfoConfig.getOptions(username));
 * ```
 */
export class AuthInfoConfig extends ConfigFile<AuthInfoConfig.Options> {
  /**
   * Gets the config options for a given org ID.
   * @param username The username for the org.
   */
  public static getOptions(username: string): AuthInfoConfig.Options {
    return {
      isGlobal: true, // Only allow global auth files
      isState: true,
      filename: `${username}.json`
    };
  }

  /**
   * Init method.
   *
   * **Throws** *{@link SfdxError}{ name: 'NamedOrgNotFound' }* If the username.json file is not found when
   * options.throwOnNotFound is true or undefined.
   */
  public async init(): Promise<void> {
    return super.init(this.options.throwOnNotFound === undefined ? true : this.options.throwOnNotFound);
  }
}

export namespace AuthInfoConfig {
  /**
   * Options for the AuthInfoConfig.
   */
  export interface Options extends ConfigFile.Options {
    /**
     * Indicates if init should throw if the corresponding config file is not found.
     */
    throwOnNotFound?: boolean;
  }
}
