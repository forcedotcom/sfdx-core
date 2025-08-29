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
import { Duration } from '@salesforce/kit';
import { JsonMap } from '@salesforce/ts-types';
import { Global } from '../global';
import { TTLConfig } from '../config/ttlConfig';

export type CachedOptions = {
  hubUsername: string;
  /** stores the scratch definition, including settings/objectSettings */
  definitionjson: JsonMap;
  hubBaseUrl: string;
  /** may be required for auth*/
  clientSecret?: string;
  signupTargetLoginUrlConfig?: string;
  apiVersion?: string;
  alias?: string;
  setDefault?: boolean;
  tracksSource?: boolean;
};

export class ScratchOrgCache extends TTLConfig<TTLConfig.Options, CachedOptions> {
  protected static readonly encryptedKeys = ['clientSecret'];
  public static getFileName(): string {
    return 'scratch-create-cache.json';
  }

  public static getDefaultOptions(): TTLConfig.Options {
    return {
      isGlobal: true,
      isState: true,
      filename: ScratchOrgCache.getFileName(),
      stateFolder: Global.SF_STATE_FOLDER,
      encryptedKeys: ScratchOrgCache.encryptedKeys,
      ttl: Duration.days(1),
    };
  }

  public static async unset(key: string): Promise<void> {
    const cache = await ScratchOrgCache.create();
    cache.unset(key);
    await cache.write();
  }
}
