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

import { lookup } from 'node:dns';
import { URL } from 'node:url';
import { promisify } from 'node:util';

import { ensureString } from '@salesforce/ts-types';

import { AsyncOptionalCreatable, Duration, Env } from '@salesforce/kit';
import { Logger } from '../logger/logger';
import { SfdcUrl } from '../util/sfdcUrl';
import { Global } from '../global';
import { StatusResult } from './types';
import { PollingClient } from './pollingClient';

// Timeout for DNS lookup polling defaults to 3 seconds and should always be at least 3 seconds
const DNS_TIMEOUT = Math.max(3, new Env().getNumber('SFDX_DNS_TIMEOUT', 3));
// Retry frequency for DNS lookup polling defaults to 1 second and should be at least 1 second
const DNS_RETRY_FREQ = Math.max(1, new Env().getNumber('SFDX_DNS_RETRY_FREQUENCY', 1));

/**
 * A class used to resolve MyDomains. After a ScratchOrg is created its host name my not be propagated to the
 * Salesforce DNS service. This service is not exclusive to Salesforce My Domain URL and could be used for any hostname.
 *
 * ```
 * (async () => {
 *  const options: MyDomainResolver.Options = {
 *      url: new URL('http://mydomain.salesforce.com'),
 *      timeout: Duration.minutes(5),
 *      frequency: Duration.seconds(10)
 *  };
 *  const resolver: MyDomainResolver = await MyDomainResolver.create(options);
 *  const ipAddress: AnyJson = await resolver.resolve();
 *  console.log(`Successfully resolved host: ${options.url} to address: ${ipAddress}`);
 * })();
 * ```
 */
export class MyDomainResolver extends AsyncOptionalCreatable<MyDomainResolver.Options> {
  public static DEFAULT_DOMAIN = new URL('https://login.salesforce.com');

  private logger!: Logger;

  private options: MyDomainResolver.Options;

  /**
   * Constructor
   * **Do not directly construct instances of this class -- use {@link MyDomainResolver.create} instead.**
   *
   * @param options The options for the class instance
   */
  public constructor(options?: MyDomainResolver.Options) {
    super(options);
    this.options = options ?? { url: MyDomainResolver.DEFAULT_DOMAIN };
  }

  public getTimeout(): Duration {
    return this.options.timeout ?? Duration.seconds(DNS_TIMEOUT);
  }

  public getFrequency(): Duration {
    return this.options.frequency ?? Duration.seconds(DNS_RETRY_FREQ);
  }

  /**
   * Method that performs the dns lookup of the host. If the lookup fails the internal polling client will try again
   * given the optional interval. Returns the resolved ip address.
   *
   * If SFDX_DISABLE_DNS_CHECK environment variable is set to true, it will immediately return the host without
   * executing the dns loookup.
   */
  public async resolve(): Promise<string> {
    const env = new Env();
    if (env.getBoolean('SF_DISABLE_DNS_CHECK', env.getBoolean('SFDX_DISABLE_DNS_CHECK', false))) {
      this.logger.debug('SF_DISABLE_DNS_CHECK set to true. Skipping DNS check...');
      return this.options.url.host;
    }

    if (Global.isWeb) {
      this.logger.debug('Web browser detected. Skipping DNS check...');
      return this.options.url.host;
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: MyDomainResolver = this;
    const pollingOptions: PollingClient.Options = {
      async poll(): Promise<StatusResult> {
        const { hostname } = self.options.url;
        let dnsResult: { address: string };
        try {
          self.logger.debug(`Attempting to resolve url: ${hostname}`);
          if (new SfdcUrl(self.options.url).isLocalUrl()) {
            return {
              completed: true,
              payload: '127.0.0.1',
            };
          }
          dnsResult = await promisify(lookup)(hostname);
          self.logger.debug(`Successfully resolved host: ${hostname} result: ${JSON.stringify(dnsResult)}`);
          return {
            completed: true,
            payload: dnsResult.address,
          };
        } catch (e) {
          self.logger.debug(`An error occurred trying to resolve: ${hostname}`);
          self.logger.debug(`Error: ${(e as Error).message}`);
          self.logger.debug('Re-trying dns lookup again....');
          return {
            completed: false,
          };
        }
      },
      timeout: this.getTimeout(),
      frequency: this.getFrequency(),
      timeoutErrorName: 'MyDomainResolverTimeoutError',
    };
    const client = await PollingClient.create(pollingOptions);
    return ensureString(await client.subscribe());
  }

  /**
   * Used to initialize asynchronous components.
   */
  protected async init(): Promise<void> {
    this.logger = await Logger.child('MyDomainResolver');
  }
}

export namespace MyDomainResolver {
  /**
   * Options for the MyDomain DNS resolver.
   */
  export type Options = {
    /**
     * The host to resolve.
     */
    url: URL;

    /**
     * The retry interval.
     */
    timeout?: Duration;

    /**
     * The retry timeout.
     */
    frequency?: Duration;
  };
}
