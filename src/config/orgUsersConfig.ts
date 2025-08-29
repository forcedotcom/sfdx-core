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
  export type Options = {
    /**
     * The org id associated with this user.
     */
    orgId: string;
  } & ConfigFile.Options;
}
