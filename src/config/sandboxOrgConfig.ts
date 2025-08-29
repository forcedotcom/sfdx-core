/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Global } from '../global';
import { ConfigFile } from './configFile';

/**
 * A config file that stores usernames for an org.
 */
export class SandboxOrgConfig extends ConfigFile<SandboxOrgConfig.Options> {
  /**
   * Constructor.
   * **Do not directly construct instances of this class -- use {@link SandboxConfig.create} instead.**
   *
   * @param options The options for the class instance
   * @ignore
   */
  public constructor(options?: SandboxOrgConfig.Options) {
    super(options);
  }
  /**
   * Gets the config options for a given org ID.
   *
   * @param orgId The orgId. Generally this org would have multiple users configured.
   */
  public static getOptions(orgId: string): SandboxOrgConfig.Options {
    return {
      isGlobal: true,
      isState: true,
      filename: `${orgId}.sandbox.json`,
      orgId,
      stateFolder: Global.SFDX_STATE_FOLDER,
    };
  }
}

export namespace SandboxOrgConfig {
  /**
   * The config file options.
   */
  export type Options = {
    /**
     * The org id associated with this sandbox.
     */
    orgId: string;
  } & ConfigFile.Options;

  export enum Fields {
    /**
     * The username of the user who created the sandbox.
     */
    PROD_ORG_USERNAME = 'prodOrgUsername',
  }
}
