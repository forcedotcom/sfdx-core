/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { lookup } from 'dns';
import { URL } from 'url';
import { promisify } from 'util';

import { StatusResult } from './client';

import { AsyncCreatable } from '@salesforce/kit';
import { AnyFunction } from '@salesforce/ts-types';
import { Logger } from '../logger';
import { Time, TIME_UNIT } from '../util/time';
import { PollingClient, PollingOptions } from './pollingClient';

let lookupAsync: AnyFunction;

/**
 * Options for the MyDomain DNS resolver
 */
export interface MyDomainResolverOptions {
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
export class MyDomainResolver extends AsyncCreatable<MyDomainResolverOptions> {

    private logger!: Logger;

    /**
     * Method that performs the dns lookup of the host. If the lookup fails the internal polling client will try again
     * given the optional interval.
     * @returns {Promise<string>} The resolved ip address.
     */
    public async resolve(): Promise<string> {

        const self: MyDomainResolver = this;
        const pollingOptions: PollingOptions<string> = {
            async poll(): Promise<StatusResult<string>> {
                const host: string = self.options.url.host;
                let dnsResult: { address: string };

                try {
                    if (!lookupAsync) {
                        lookupAsync = promisify(lookup);
                    }
                    self.logger.debug(`Attempting to resolve url: ${host}`);
                    if (host && host.includes('.internal.salesforce.com')) {
                        return {
                            completed: true,
                            payload: '127.0.0.1'
                        };
                    }
                    dnsResult = await lookupAsync(host);
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
            timeout: this.options.timeout || new Time(30, TIME_UNIT.SECONDS),
            frequency: this.options.frequency || new Time(10, TIME_UNIT.SECONDS),
            timeoutErrorName: 'MyDomainResolverTimeoutError'
        };
        const client: PollingClient<string> = await PollingClient.init<string>(pollingOptions);
        return client.subscribe();
    }

    /**
     * Used to initialize asynchronous components.
     */
    protected async init(): Promise<void> {
        this.logger = await Logger.child('MyDomainResolver');
    }

    /**
     * Returns the default options.
     */
    protected getDefaultOptions(): MyDomainResolverOptions {
        return { url : new URL('login.salesforce.com') };
    }
}
