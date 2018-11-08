/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { lookup } from 'dns';
import { URL } from 'url';
import { promisify } from 'util';

import { AnyJson } from '@salesforce/ts-types';

import { AsyncCreatable } from '@salesforce/kit';
import { Logger } from '../logger';
import { Time, TIME_UNIT } from '../util/time';
import { StatusResult } from './client';
import { PollingClient } from './pollingClient';

/**
 * A class used to resolve MyDomains. After a ScratchOrg is created it's host name my not be propagated to the
 * Salesforce DNS service. This service is not exclusive to Salesforce My Domain URL and could be used for any hostname.
 *
 * @example
 *
 * (async () => {
 *  const options: MyDomainResolverOptions = {
 *       url: new URL('http://mydomain.salesforce.com'),
 *       timeout: new Time(5, TIME_UNIT.MINUTES),
 *       frequency: new Time(10, TIME_UNIT.SECONDS),
 *   };
 *
 *   const resolver: MyDomainResolver = await MyDomainResolver.create(options);
 *   const ipAddress: string = await resolver.resolve();
 *   console.log(`Successfully resolved host: ${options.url} to address: ${ipAddress}`);
 * })();
 */
export class MyDomainResolver extends AsyncCreatable<MyDomainResolver.Options> {
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
   * @returns {Promise<string>} The resolved ip address.
   */
  public async resolve(): Promise<AnyJson> {
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
          self.logger.debug(
            `Successfully resolved host: ${host} result: ${JSON.stringify(
              dnsResult
            )}`
          );
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
      timeout: this.options.timeout || new Time(30, TIME_UNIT.SECONDS),
      frequency: this.options.frequency || new Time(10, TIME_UNIT.SECONDS),
      timeoutErrorName: 'MyDomainResolverTimeoutError'
    };
    const client = await PollingClient.create(pollingOptions);
    return client.subscribe();
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
    timeout?: Time;

    /**
     * The retry timeout
     */
    frequency?: Time;
  }
}
