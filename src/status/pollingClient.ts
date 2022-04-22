/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AsyncOptionalCreatable, Duration } from '@salesforce/kit';
import { AnyJson, ensure } from '@salesforce/ts-types';
import { retryDecorator, NotRetryableError } from 'ts-retry-promise';
import { Logger } from '../logger';
import { SfError } from '../sfError';
import { Lifecycle } from '../lifecycleEvents';
import { StatusResult } from './types';

/**
 * This is a polling client that can be used to poll the status of long running tasks. It can be used as a replacement
 * for Streaming when streaming topics are not available or when streaming handshakes are failing. Why wouldn't you
 * want to use this? It can impact Salesforce API usage.
 *
 * ```
 * const options: PollingClient.Options = {
 *      async poll(): Promise<StatusResult>  {
 *       return Promise.resolve({ completed: true, payload: 'Hello World' });
 *     },
 *     frequency: Duration.milliseconds(10),
 *      timeout: Duration.minutes(1)
 *   };
 * const client = await PollingClient.create(options);
 * const pollResult = await client.subscribe();
 * console.log(`pollResult: ${pollResult}`);
 * ```
 */
export class PollingClient extends AsyncOptionalCreatable<PollingClient.Options> {
  protected logger!: Logger;
  private options: PollingClient.Options;

  /**
   * Constructor
   *
   * @param options Polling client options
   * @ignore
   */
  public constructor(options?: PollingClient.Options) {
    super(options);
    this.options = ensure(options);
  }

  /**
   * Asynchronous initializer.
   */
  public async init(): Promise<void> {
    this.logger = await Logger.child(this.constructor.name);
  }

  /**
   * Returns a promise to call the specified polling function using the interval and timeout specified
   * in the polling options.
   */
  public async subscribe<T = AnyJson>(): Promise<T> {
    let errorInPollingFunction; // keep this around for returning in the catch block
    const doPoll = async () => {
      let result;
      try {
        result = await this.options.poll();
      } catch (error) {
        const err = (errorInPollingFunction = error as Error);
        if (
          ['ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'socket hang up'].some((retryableNetworkError) =>
            err.message.includes(retryableNetworkError)
          )
        ) {
          this.logger.debug('Network error on the request', err);
          await Lifecycle.getInstance().emitWarning('Network error occurred. Continuing to poll.');
          throw SfError.wrap(err);
        }
        // there was an actual error thrown, so we don't want to keep retrying
        throw new NotRetryableError(err.name);
      }
      if (result.completed) {
        return result.payload as unknown as T;
      }
      throw new Error('Operation did not complete.  Retrying...'); // triggers a retry
    };
    const finalResult = retryDecorator(doPoll, {
      timeout: this.options.timeout.milliseconds,
      delay: this.options.frequency.milliseconds,
      retries: 'INFINITELY',
    });
    try {
      return await finalResult();
    } catch (error) {
      if (errorInPollingFunction) {
        throw errorInPollingFunction;
      }
      await Lifecycle.getInstance().emit('POLLING_TIME_OUT', error);
      this.logger.debug('Polling timed out');
      throw new SfError('The client has timed out.', this.options.timeoutErrorName ?? 'PollingClientTimeout');
    }
  }
}

export namespace PollingClient {
  /**
   * Options for the polling client.
   */
  export interface Options {
    /**
     * Polling function.
     */
    poll: () => Promise<StatusResult>;
    /**
     * How frequent should the polling function be called.
     */
    frequency: Duration;
    /**
     * Hard timeout for polling.
     */
    timeout: Duration;
    /**
     * Change the name of the timeout error.
     *
     * ```
     * if (err.name === 'MyChangedName) ...
     * ```
     */
    timeoutErrorName?: string;
  }

  /**
   * Default options set for polling. The default options specify a timeout of 3 minutes and polling frequency of 15
   * seconds;
   */
  export class DefaultPollingOptions implements PollingClient.Options {
    public frequency: Duration;
    public poll: () => Promise<StatusResult>;
    public timeout: Duration;

    /**
     * constructor
     *
     * @param poll The function used for polling status.
     * {@link StatusResult}
     */
    public constructor(poll: () => Promise<StatusResult>) {
      this.poll = poll;
      this.timeout = Duration.minutes(3);
      this.frequency = Duration.seconds(15);
    }
  }
}
