/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Duration } from '@salesforce/kit';
import { JsonMap, Nullable } from '@salesforce/ts-types';
import { ConfigFile } from './configFile';

/**
 * A Time To Live configuration file where each entry is timestamped and removed once the TTL has expired.
 *
 * @example
 * import { Duration } from '@salesforce/kit';
 * const config = await TTLConfig.create({
 *   isGlobal: false,
 *   ttl: Duration.days(1)
 * });
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
    const contents = await this.read(this.options.throwOnNotFound);
    const purged = {} as TTLConfig.Contents<P>;
    const date = new Date().getTime();
    for (const [key, opts] of Object.entries(contents)) {
      if (!this.isExpired(date, opts)) purged[key] = opts;
    }
    this.setContents(purged);
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
