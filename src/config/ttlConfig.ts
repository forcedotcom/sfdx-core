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
import { JsonMap, Nullable } from '@salesforce/ts-types';
import { ConfigFile } from './configFile';

/**
 * A Time To Live configuration file where each entry is timestamped and removed once the TTL has expired.
 *
 * @example
 * ```
 * import { Duration } from '@salesforce/kit';
 * const config = await TTLConfig.create({
 *   isGlobal: false,
 *   ttl: Duration.days(1)
 * });
 * ```
 */
export class TTLConfig<T extends TTLConfig.Options, P extends JsonMap> extends ConfigFile<T, TTLConfig.Contents<P>> {
  public set(key: string, value: Partial<TTLConfig.Entry<P>>): void {
    super.set(key, this.timestamp(value));
  }

  public getLatestEntry(): Nullable<[string, TTLConfig.Entry<P>]> {
    const entries = this.entries() as Array<[string, TTLConfig.Entry<P>]>;
    const sorted = entries.sort(
      ([, valueA], [, valueB]) => new Date(valueB.timestamp).getTime() - new Date(valueA.timestamp).getTime()
    );
    return sorted.length > 0 ? sorted[0] : null;
  }

  public getLatestKey(): Nullable<string> {
    const [key] = this.getLatestEntry() ?? [null];
    return key;
  }

  public isExpired(dateTime: number, value: P & { timestamp: string }): boolean {
    return dateTime - new Date(value.timestamp).getTime() > this.options.ttl.milliseconds;
  }

  protected async init(): Promise<void> {
    // Normally, this is done in super.init() but we don't call it to prevent
    // redundant read() calls.
    if (this.hasEncryption()) {
      await this.initCrypto();
    }
    const contents = await this.read(this.options.throwOnNotFound);
    const date = new Date().getTime();

    // delete all the expired entries
    Object.entries(contents)
      .filter(([, value]) => this.isExpired(date, value))
      .map(([key]) => this.unset(key));
  }

  // eslint-disable-next-line class-methods-use-this
  private timestamp(value: Partial<TTLConfig.Entry<P>>): TTLConfig.Entry<P> {
    return { ...value, timestamp: new Date().toISOString() } as TTLConfig.Entry<P>;
  }
}

export namespace TTLConfig {
  export type Options = ConfigFile.Options & { ttl: Duration };
  export type Entry<T extends JsonMap> = T & { timestamp: string };
  export type Contents<T extends JsonMap> = Record<string, Entry<T>>;
}
