/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { ConfigFile } from './configFile';

/**
 * A config file that stores usernames for an org.
 */
export class OrgUsersConfig extends ConfigFile<OrgUsersConfig.Options> {
  /**
   * Gets the config options for a given org ID.
   * @param orgId The orgId. Generally this org would have multiple users configured.
   */
  public static getOptions(orgId: string): OrgUsersConfig.Options {
    return {
      isGlobal: true,
      isState: true,
      filename: `${orgId}.json`,
      orgId
    };
  }

  /**
   * Constructor
   * **Do not directly construct instances of this class -- use {@link OrgUsersConfig.create} instead.**
   * @param options The options for the class instance
   */
  public constructor(options: OrgUsersConfig.Options) {
    super(options);
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
