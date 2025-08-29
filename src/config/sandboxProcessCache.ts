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
import { SandboxProcessObject, SandboxRequest } from '../org/org';
import { Global } from '../global';
import { TTLConfig } from './ttlConfig';

export type SandboxRequestCacheEntry = {
  alias?: string;
  setDefault?: boolean;
  prodOrgUsername: string;
  action: 'Create' | 'Refresh'; // Sandbox create and refresh requests can be cached
  sandboxProcessObject: Partial<SandboxProcessObject>;
  sandboxRequest: Partial<SandboxRequest>;
  tracksSource?: boolean;
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
