/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import { setInterval } from 'timers';
import { Time, TIME_UNIT } from '../util/time';
import { SfdxError } from '../sfdxError';
import { StatusResult } from './client';
import { Logger } from '../logger';

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
}

/**
 * Default options set for polling.
 */
export class DefaultPollingOptions <T> implements PollingOptions<T> {
    public frequency: Time;
    public poll: () => Promise<StatusResult<T>>;
    public timeout: Time;

    /**
     * constructor
     * @param {() => Promise<StatusResult<T>>} poll The function used for polling status.
     */
    constructor(poll: () => Promise<StatusResult<T>>) {
        this.poll = poll;
        this.timeout = new Time(3, TIME_UNIT.MINUTES);
        this.frequency = new Time(3, TIME_UNIT.SECONDS);
    }
}

/**
 * This is a polling client that can be used to poll the status of long running tasks. It can be used as a replacement
 * for Streaming when streaming topics are not available or when streaming handshakes are failing. Why wouldn't you you
 * want to use this? It can impact API usage.
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

    private options: PollingOptions<T>;
    private timeout: NodeJS.Timer;
    private interval: NodeJS.Timer;
    private logger: Logger;

    constructor(options: PollingOptions<T>) {
        this.options = options;
        this.logger = new Logger('PollingClient');
        this.logger.debug('Polling enabled.');
    }

    public subscribe(): Promise<T> {
        return new Promise((resolve, reject) => {
            // Use set interval to periodically call the polling function
            this.interval = setInterval(async () => {
                try {
                    // Poll can be an async function.
                    const sample: StatusResult<T> = await this.options.poll();
                    if (sample.completed) {
                        this.clearAll();
                        resolve(sample.payload);
                    }
                } catch (e) {
                    this.clearAll();
                    reject(e);
                }
            }, this.options.frequency.milliseconds);

            // hard polling timeout.
            this.timeout = setTimeout(() => {
                this.clearAll();
                // @todo should go in messages.
                reject(new SfdxError('The client has timed out.', 'ClientTimeout'));
            }, this.options.timeout.milliseconds);
        });
    }

    private clearAll() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }
}
