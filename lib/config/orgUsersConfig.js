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
export class OrgUsersConfig extends ConfigFile {
  /**
   * Gets the config options for a given org ID.
   * @param orgId The orgId. Generally this org would have multiple users configured.
   */
  static getOptions(orgId) {
    return {
      isGlobal: true,
      isState: true,
      filename: `${orgId}.json`,
      orgId
    };
  }
  /**
   * Constructor.
   * **Do not directly construct instances of this class -- use {@link OrgUsersConfig.create} instead.**
   * @param options The options for the class instance
   * @ignore
   */
  constructor(options) {
    super(options);
  }
}
//# sourceMappingURL=orgUsersConfig.js.map
