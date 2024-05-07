/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Duration } from '@salesforce/kit';
import { JsonMap } from '@salesforce/ts-types';
import { Global } from '../../global';
import { TTLConfig } from '../../config/ttlConfig';

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
  public static getFileName(): string {
    return 'scratch-create-cache.json';
  }

  public static getDefaultOptions(): TTLConfig.Options {
    return {
      isGlobal: true,
      isState: true,
      filename: ScratchOrgCache.getFileName(),
      stateFolder: Global.SF_STATE_FOLDER,
      ttl: Duration.days(1),
    };
  }

  public static async unset(key: string): Promise<void> {
    const cache = await ScratchOrgCache.create();
    cache.unset(key);
    await cache.write();
  }
}
