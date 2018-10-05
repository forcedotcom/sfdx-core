/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import { setInterval } from 'timers';

import { AnyFunction } from '@salesforce/ts-types';
import { Logger } from '../logger';
import { SfdxError } from '../sfdxError';
import { Time, TIME_UNIT } from '../util/time';
import { StatusResult } from './client';

/**
 * Options for the polling client.
 * @interface
 */
export interface PollingOptions<T> {
    // Polling function
    poll: () => Promise<StatusResult<T>>;
    // How frequent should the polling function be called.
    frequency: Time;
    // Hard timeout for polling.
    timeout: Time;
    timeoutErrorName?: string;
}

/**
 * Default options set for polling. The default options specify a timeout of 3 minutes and polling frequency of 15
 * seconds;
 */
export class DefaultPollingOptions <T> implements PollingOptions<T> {
    public frequency: Time;
    public poll: () => Promise<StatusResult<T>>;
    public timeout: Time;

    /**
     * constructor
     * @param {function} poll The function used for polling status.
     * @see StatusResult
     */
    constructor(poll: () => Promise<StatusResult<T>>) {
        this.poll = poll;
        this.timeout = new Time(3, TIME_UNIT.MINUTES);
        this.frequency = new Time(15, TIME_UNIT.SECONDS);
    }
}

/**
 * This is a polling client that can be used to poll the status of long running tasks. It can be used as a replacement
 * for Streaming when streaming topics are not available or when streaming handshakes are failing. Why wouldn't you
 * want to use this? It can impact Salesforce API usage.
 *
 * @example
 *  const options: PollingOptions<string> = {
 *
 *      async poll(): Promise<StatusResult<string>>  {
 *          return Promise.resolve(doSoqlQuery();
 *      },
 *      frequency: new Time(10, TIME_UNIT.MILLISECONDS),
 *      timeout: new Time(1, TIME_UNIT.MINUTES)
 *  };
 *
 *  const client = new PollingClient(options);
 *
 *  const pollResult: string = await client.subscribe();
 *
 *  // do Something with pollResult
 *  ...
 */
export class PollingClient<T> {

    /**
     * Initialize and return a polling client.
     *
     * @param {PollingOptions<U>} options Polling options.
     * @returns {Promise<PollingClient<U>>}
     * @see {@link PollingOptions}
     * @see {@link DefaultPollingOptions}
     * @async
     */
    public static async init<U>(options: PollingOptions<U>): Promise<PollingClient<U>> {
        return new PollingClient<U>(options, await Logger.child('PollingClient'));
    }

    protected logger: Logger;

    private options: PollingOptions<T>;
    private timeout?: NodeJS.Timer;
    private interval?: NodeJS.Timer;

    /**
     * Constructor
     * @param {PollingOptions<T>} options Polling client options
     * @param {Logger} logger Internal logging instace
     * @see {@link PollingClient.init}
     */
    protected constructor(options: PollingOptions<T>, logger: Logger) {
        this.options = options;
        this.logger = logger;
        this.logger.debug('Polling enabled.');
    }

    /**
     * Returns a promise to call the specified polling function using the interval and timeout specified
     * in the polling options.
     * @returns {Promise<T>} A promise to call the specified polling function using the interval and timeout specified
     * in the polling options.
     * @async
     */
    public subscribe(): Promise<T> {
        // This promise is held open while setInterval tries to resolve or reject.
        // If set interval can't do it then the timeout will reject.
        return new Promise((resolve, reject) => {
            // Use set interval to periodically call the polling function

            // This try catch enables support for time{0} since setInterval only supports
            // time {1}. In other words, we should call first then wait for the first interval.
            this.doPoll().then((result: StatusResult<T> | undefined) => {
                if (result && result.completed) {
                    resolve(result.payload);
                } else {
                    this.interval = setInterval(
                        PollingClient.prototype.doPoll.bind(this, resolve, reject),
                        this.options.frequency.milliseconds);
                }
            }).catch(() => {
                this.interval = setInterval(
                    PollingClient.prototype.doPoll.bind(this, resolve, reject),
                    this.options.frequency.milliseconds);
            });

            // hard polling timeout.
            this.timeout = setTimeout(() => {
                this.logger.debug('Polling timed out');
                this.clearAll();
                // @todo should go in messages.
                reject(new SfdxError('The client has timed out.',
                    this.options.timeoutErrorName || 'PollingClientTimeout'));
            }, this.options.timeout.milliseconds);
        });
    }

    private async doPoll(resolve?: AnyFunction, reject?: AnyFunction): Promise<StatusResult<T> | undefined> {
        try {
            // Poll can be an async function.
            const sample: StatusResult<T> = await this.options.poll();
            if (sample.completed) {
                this.clearAll();
                if (resolve) {
                    resolve(sample.payload);
                } else {
                    return sample;
                }
            }
        } catch (e) {
            this.clearAll();
            if (reject) {
                reject(e);
            } else {
                throw e;
            }
        }
    }

    private clearAll() {
        if (this.interval) {
            this.logger.debug('Clearing the polling interval');
            clearInterval(this.interval);
        }
        if (this.timeout) {
            this.logger.debug('Clearing the timeout interval');
            clearTimeout(this.timeout);
        }
    }
}
