/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Duration } from '@salesforce/kit';
import { SandboxProcessObject, SandboxRequest } from '../org';
import { Global } from '../global';
import { TTLConfig } from './ttlConfig';

export type SandboxRequestCacheEntry = {
  alias?: string;
  setDefault: boolean;
  prodOrgUsername: string;
  sandboxProcessObject: Partial<SandboxProcessObject>;
  sandboxRequest: Partial<SandboxRequest>;
};

export class SandboxRequestCache extends TTLConfig<TTLConfig.Options, SandboxRequestCacheEntry> {
  public static getDefaultOptions(): TTLConfig.Options {
    return {
      isGlobal: true,
      isState: true,
      filename: SandboxRequestCache.getFileName(),
      stateFolder: Global.SF_STATE_FOLDER,
      ttl: Duration.days(14),
    };
  }

  public static async unset(key: string): Promise<void> {
    const cache = await SandboxRequestCache.create();
    cache.unset(key);
    await cache.write();
  }

  public static async set(key: string, sandboxProcessObject: SandboxRequestCacheEntry): Promise<void> {
    const cache = await SandboxRequestCache.create();
    cache.set(key, sandboxProcessObject);
    await cache.write();
  }

  public static getFileName(): string {
    return 'sandbox-create-cache.json';
  }
}
