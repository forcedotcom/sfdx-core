/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { ConfigFile } from './configFile';

/**
 * A config file that stores usernames for an org.
 */
export class OrgUsersConfig extends ConfigFile<OrgUsersConfig.Options> {
  /**
   * Gets the config options for a given org ID.
   *
   * @param orgId The orgId. Generally this org would have multiple users configured.
   */
  public static getOptions(orgId: string): OrgUsersConfig.Options {
    return {
      isGlobal: true,
      isState: true,
      filename: `${orgId}.json`,
      orgId,
    };
  }
}

export namespace OrgUsersConfig {
  /**
   * The config file options.
   */
  export interface Options extends ConfigFile.Options {
    /**
     * The org id associated with this user.
     */
    orgId: string;
  }
}
