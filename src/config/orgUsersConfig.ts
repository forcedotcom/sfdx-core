/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Global } from '../global';
import { ConfigFile } from './configFile';

type UserConfig = {
  usernames: string[];
};
/**
 * A config file that stores usernames for an org.
 */
export class OrgUsersConfig extends ConfigFile<OrgUsersConfig.Options, UserConfig> {
  /**
   * Constructor.
   * **Do not directly construct instances of this class -- use {@link OrgUsersConfig.create} instead.**
   *
   * @param options The options for the class instance
   * @ignore
   */
  public constructor(options?: OrgUsersConfig.Options) {
    super(options);
  }

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
      stateFolder: Global.SFDX_STATE_FOLDER,
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
