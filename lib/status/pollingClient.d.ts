import { AsyncOptionalCreatable, Duration } from '@salesforce/kit';
import { AnyJson } from '@salesforce/ts-types';
import { Logger } from '../logger';
import { StatusResult } from './client';
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
export declare class PollingClient extends AsyncOptionalCreatable<PollingClient.Options> {
  protected logger: Logger;
  private options;
  private timeout?;
  private interval?;
  /**
   * Constructor
   * @param options Polling client options
   * @ignore
   */
  constructor(options?: PollingClient.Options);
  /**
   * Asynchronous initializer.
   */
  init(): Promise<void>;
  /**
   * Returns a promise to call the specified polling function using the interval and timeout specified
   * in the polling options.
   */
  subscribe(): Promise<AnyJson>;
  private doPoll;
  private clearAll;
}
export declare namespace PollingClient {
  /**
   * Options for the polling client.
   */
  interface Options {
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
  class DefaultPollingOptions implements PollingClient.Options {
    frequency: Duration;
    poll: () => Promise<StatusResult>;
    timeout: Duration;
    /**
     * constructor
     * @param poll The function used for polling status.
     * {@link StatusResult}
     */
    constructor(poll: () => Promise<StatusResult>);
  }
}
