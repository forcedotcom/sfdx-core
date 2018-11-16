/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { lookup } from 'dns';
import { URL } from 'url';
import { promisify } from 'util';

import { ensureString } from '@salesforce/ts-types';

import { AsyncOptionalCreatable, Duration } from '@salesforce/kit';
import { Logger } from '../logger';
import { StatusResult } from './client';
import { PollingClient } from './pollingClient';

/**
 * A class used to resolve MyDomains. After a ScratchOrg is created it's host name my not be propagated to the
 * Salesforce DNS service. This service is not exclusive to Salesforce My Domain URL and could be used for any hostname.
 *
 * @example
 *
 * (async () => {
 * const options: MyDomainResolver.Options = {
 *    url: new URL('http://mydomain.salesforce.com'),
 *     timeout: Duration.minutes(5),
 *     frequency: Duration.seconds(10)
 * };
 *
 *   const resolver: MyDomainResolver = await MyDomainResolver.create(options);
 *   const ipAddress: AnyJson = await resolver.resolve();
 *   console.log(`Successfully resolved host: ${options.url} to address: ${ipAddress}`);
 * })();
 */
export class MyDomainResolver extends AsyncOptionalCreatable<MyDomainResolver.Options> {
  public static DEFAULT_DOMAIN = new URL('https://login.salesforce.com');

  private logger!: Logger;

  private options: MyDomainResolver.Options;

  public constructor(options?: MyDomainResolver.Options) {
    super(options);
    this.options = options || { url: MyDomainResolver.DEFAULT_DOMAIN };
  }

  /**
   * Method that performs the dns lookup of the host. If the lookup fails the internal polling client will try again
   * given the optional interval.
   * @returns {Promise<AnyJson>} The resolved ip address.
   */
  public async resolve(): Promise<string> {
    const self: MyDomainResolver = this;
    const pollingOptions: PollingClient.Options = {
      async poll(): Promise<StatusResult> {
        const host: string = self.options.url.host;
        let dnsResult: { address: string };

        try {
          self.logger.debug(`Attempting to resolve url: ${host}`);
          if (host && host.includes('.internal.salesforce.com')) {
            return {
              completed: true,
              payload: '127.0.0.1'
            };
          }
          dnsResult = await promisify(lookup)(host);
          self.logger.debug(`Successfully resolved host: ${host} result: ${JSON.stringify(dnsResult)}`);
          return {
            completed: true,
            payload: dnsResult.address
          };
        } catch (e) {
          self.logger.debug(`An error occurred trying to resolve: ${host}`);
          self.logger.debug(`Error: ${e.message}`);
          self.logger.debug('Re-trying dns lookup again....');
          return {
            completed: false
          };
        }
      },
      timeout: this.options.timeout || Duration.seconds(30),
      frequency: this.options.frequency || Duration.seconds(10),
      timeoutErrorName: 'MyDomainResolverTimeoutError'
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
   * Options for the MyDomain DNS resolver
   */
  export interface Options {
    /**
     * The host to resolve
     */
    url: URL;

    /**
     * The retry interval
     */
    timeout?: Duration;

    /**
     * The retry timeout
     */
    frequency?: Duration;
  }
}
