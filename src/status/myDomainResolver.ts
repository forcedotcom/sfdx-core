/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { lookup, resolveCname } from 'dns';
import { URL } from 'url';
import { promisify } from 'util';

import { ensureString } from '@salesforce/ts-types';

import { AsyncOptionalCreatable, Duration, Env } from '@salesforce/kit';
import { Logger } from '../logger';
import { SfdcUrl } from '../util/sfdcUrl';
import { StatusResult } from './streamingClient';
import { PollingClient } from './pollingClient';

// Timeout for DNS lookup polling defaults to 3 seconds and should always be at least 3 seconds
const DNS_TIMEOUT = Math.max(3, new Env().getNumber('SFDX_DNS_TIMEOUT', 3) as number);
// Retry frequency for DNS lookup polling defaults to 1 second and should be at least 1 second
const DNS_RETRY_FREQ = Math.max(1, new Env().getNumber('SFDX_DNS_RETRY_FREQUENCY', 1) as number);

/**
 * A class used to resolve MyDomains. After a ScratchOrg is created it's host name my not be propagated to the
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
    this.options = options || { url: MyDomainResolver.DEFAULT_DOMAIN };
  }

  public getTimeout(): Duration {
    return this.options.timeout || Duration.seconds(DNS_TIMEOUT);
  }

  public getFrequency(): Duration {
    return this.options.frequency || Duration.seconds(DNS_RETRY_FREQ);
  }

  /**
   * Method that performs the dns lookup of the host. If the lookup fails the internal polling client will try again
   * given the optional interval. Returns the resolved ip address.
   *
   * If SFDX_DISABLE_DNS_CHECK environment variable is set to true, it will immediately return the host without
   * executing the dns loookup.
   */
  public async resolve(): Promise<string> {
    if (new Env().getBoolean('SFDX_DISABLE_DNS_CHECK', false)) {
      this.logger.debug('SFDX_DISABLE_DNS_CHECK set to true. Skipping DNS check...');
      return this.options.url.host;
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: MyDomainResolver = this;
    const pollingOptions: PollingClient.Options = {
      async poll(): Promise<StatusResult> {
        const { host } = self.options.url;
        let dnsResult: { address: string };
        try {
          self.logger.debug(`Attempting to resolve url: ${host}`);
          if (new SfdcUrl(self.options.url).isLocalUrl()) {
            return {
              completed: true,
              payload: '127.0.0.1',
            };
          }
          dnsResult = await promisify(lookup)(host);
          self.logger.debug(`Successfully resolved host: ${host} result: ${JSON.stringify(dnsResult)}`);
          return {
            completed: true,
            payload: dnsResult.address,
          };
        } catch (e) {
          self.logger.debug(`An error occurred trying to resolve: ${host}`);
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

  public async getCnames(): Promise<string[]> {
    try {
      await this.resolve();
      return await promisify(resolveCname)(this.options.url.host);
    } catch (e) {
      this.logger.debug(`An error occurred trying to resolve: ${this.options.url.host}`);
      this.logger.debug(`Error: ${(e as Error).message}`);
      return [];
    }
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
  export interface Options {
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
  }
}
