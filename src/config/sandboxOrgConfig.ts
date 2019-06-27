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
export class SandboxOrgConfig extends ConfigFile<SandboxOrgConfig.Options> {
  /**
   * Gets the config options for a given org ID.
   * @param orgId The orgId. Generally this org would have multiple users configured.
   */
  public static getOptions(orgId: string): SandboxOrgConfig.Options {
    return {
      isGlobal: true,
      isState: true,
      filename: `${orgId}.sandbox.json`,
      orgId
    };
  }

  /**
   * Constructor.
   * **Do not directly construct instances of this class -- use {@link SandboxConfig.create} instead.**
   * @param options The options for the class instance
   * @ignore
   */
  public constructor(options: SandboxOrgConfig.Options) {
    super(options);
  }
}

export namespace SandboxOrgConfig {
  /**
   * The config file options.
   */
  export interface Options extends ConfigFile.Options {
    /**
     * The org id associated with this sandbox.
     */
    orgId: string;
  }

  export enum Fields {
    /**
     * The username of the user who created the sandbox.
     */
    PROD_ORG_USERNAME = 'prodOrgUsername'
  }
}
