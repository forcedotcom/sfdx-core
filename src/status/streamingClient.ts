/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */

import { resolve as resolveUrl } from 'node:url';
import { AsyncOptionalCreatable, Duration, Env, env, set } from '@salesforce/kit/lib';
import { AnyFunction, AnyJson, ensure, ensureString, JsonMap } from '@salesforce/ts-types/lib';
import Faye from 'faye';
import { Logger } from '../logger/logger';
import { Org } from '../org/org';
import { SfError } from '../sfError';
import { Messages } from '../messages';
import { CometClient, CometSubscription, Message, StatusResult, StreamingExtension, StreamProcessor } from './types';
export { CometClient, CometSubscription, Message, StatusResult, StreamingExtension, StreamProcessor };

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'streaming');

/**
 * Inner streaming client interface. This implements the Cometd behavior.
 * Also allows for mocking the functional behavior.
 */
export interface StreamingClientIfc {
  /**
   * Returns a comet client implementation.
   *
   * @param url The target url of the streaming service endpoint.
   */
  getCometClient: (url: string) => CometClient;

  /**
   * Sets the logger function for the CometClient.
   *
   * @param logLine A log message passed to the the assigned function.
   */
  setLogger: (logLine: (message: string) => void) => void;
}

/**
 * Validation helper
 *
 * @param newTime New Duration to validate.
 * @param existingTime Existing time to validate.
 */
function validateTimeout(newTime: Duration, existingTime: Duration): Duration {
  if (newTime.milliseconds >= existingTime.milliseconds) {
    return newTime;
  }
  throw messages.createError('waitParamValidValueError', [existingTime.minutes]);
}

/**
 * Api wrapper to support Salesforce streaming. The client contains an internal implementation of a cometd specification.
 *
 * Salesforce client and timeout information
 *
 * Streaming API imposes two timeouts, as supported in the Bayeux protocol.
 *
 * Socket timeout: 110 seconds
 * A client receives events (JSON-formatted HTTP responses) while it waits on a connection. If no events are generated
 * and the client is still waiting, the connection times out after 110 seconds and the server closes the connection.
 * Clients should reconnect before two minutes to avoid the connection timeout.
 *
 * Reconnect timeout: 40 seconds
 * After receiving the events, a client needs to reconnect to receive the next set of events. If the reconnection
 * doesn't happen within 40 seconds, the server expires the subscription and the connection is closed. If this happens,
 * the client must start again and handshake, subscribe, and connect. Each Streaming API client logs into an instance
 * and maintains a session. When the client handshakes, connects, or subscribes, the session timeout is restarted. A
 * client session times out if the client doesn’t reconnect to the server within 40 seconds after receiving a response
 * (an event, subscribe result, and so on).
 *
 * Note that these timeouts apply to the Streaming API client session and not the Salesforce authentication session. If
 * the client session times out, the authentication session remains active until the organization-specific timeout
 * policy goes into effect.
 *
 * ```
 * const streamProcessor = (message: JsonMap): StatusResult => {
 *    const payload = ensureJsonMap(message.payload);
 *    const id = ensureString(payload.id);
 *
 *     if (payload.status !== 'Active') {
 *       return  { completed: false };
 *     }
 *
 *     return {
 *         completed: true,
 *         payload: id
 *     };
 *   };
 *
 * const org = await Org.create();
 * const options = new StreamingClient.DefaultOptions(org, 'MyPushTopics', streamProcessor);
 *
 * const asyncStatusClient = await StreamingClient.create(options);
 *
 * await asyncStatusClient.handshake();
 *
 * const info: RequestInfo = {
 *     method: 'POST',
 *     url: `${org.getField(OrgFields.INSTANCE_URL)}/SomeService`,
 *     headers: { HEADER: 'HEADER_VALUE'},
 *     body: 'My content'
 * };
 *
 * await asyncStatusClient.subscribe(async () => {
 *    const connection = await org.getConnection();
 *    // Now that we are subscribed, we can initiate the request that will cause the events to start streaming.
 *    const requestResponse: JsonCollection = await connection.request(info);
 *    const id = ensureJsonMap(requestResponse).id;
 *    console.log(`this.id: ${JSON.stringify(ensureString(id), null, 4)}`);
 * });
 * ```
 */
export class StreamingClient extends AsyncOptionalCreatable<StreamingClient.Options> {
  private readonly targetUrl: string;
  private readonly options: StreamingClient.Options;
  private logger!: Logger;
  private cometClient: CometClient;

  /**
   * Constructor
   *
   * @param options Streaming client options
   * {@link AsyncCreatable.create}
   */
  public constructor(options?: StreamingClient.Options) {
    super(options);
    this.options = ensure(options);

    const instanceUrl = ensure(this.options.org.getConnection().getAuthInfoFields().instanceUrl);
    /**
     * The salesforce network infrastructure issues a cookie called sfdx-stream if it sees /cometd in the url.
     * Without this cookie request response streams will experience intermittent client session failures.
     *
     * The following cookies should be sent on a /meta/handshake
     *
     * "set-cookie": [
     * "BrowserId=<ID>;Path=/;Domain=.salesforce.com;Expires=Sun, 13-Jan-2019 20:16:19 GMT;Max-Age=5184000",
     * "t=<ID>;Path=/cometd/;HttpOnly",
     * "BAYEUX_BROWSER=<ID>;Path=/cometd/;Secure",
     * "sfdc-stream=<ID>; expires=Wed, 14-Nov-2018 23:16:19 GMT; path=/"
     * ],
     *
     * Enable SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING to debug potential session problems and to verify cookie
     * exchanges.
     */
    this.targetUrl = resolveUrl(instanceUrl, `cometd/${this.options.apiVersion}`);
    this.cometClient = this.options.streamingImpl.getCometClient(this.targetUrl);
    this.options.streamingImpl.setLogger(this.log.bind(this));

    this.cometClient.on('transport:up', () => this.log('Transport up event received'));
    this.cometClient.on('transport:down', () => this.log('Transport down event received'));

    this.cometClient.addExtension({
      incoming: this.incoming.bind(this),
    });

    this.cometClient.disable('websocket');
  }

  /**
   * Asynchronous initializer.
   */
  public async init(): Promise<void> {
    // get the apiVersion from the connection if not already an option
    const conn = this.options.org.getConnection();
    this.options.apiVersion = this.options.apiVersion || conn.getApiVersion();

    this.logger = await Logger.child(this.constructor.name);

    await this.options.org.refreshAuth();

    const accessToken = conn.getConnectionOptions().accessToken;

    if (accessToken && accessToken.length > 5) {
      this.logger.debug(`accessToken: XXXXXX${accessToken.substring(accessToken.length - 5, accessToken.length - 1)}`);
      this.cometClient.setHeader('Authorization', `OAuth ${accessToken}`);
    } else {
      throw new SfError('Missing or invalid access token', 'MissingOrInvalidAccessToken');
    }

    this.log(`Streaming client target url: ${this.targetUrl}`);
    this.log(`options.subscribeTimeout (ms): ${this.options.subscribeTimeout.milliseconds}`);
    this.log(`options.handshakeTimeout (ms): ${this.options.handshakeTimeout.milliseconds}`);
  }

  /**
   * Allows replaying of of Streaming events starting with replayId.
   *
   * @param replayId The starting message id to replay from.
   */
  public replay(replayId: number): void {
    this.cometClient.addExtension({
      outgoing: (message: JsonMap, callback: AnyFunction): void => {
        if (message.channel === '/meta/subscribe') {
          if (!message.ext) {
            message.ext = {};
          }
          const replayFromMap: JsonMap = {};
          replayFromMap[this.options.channel] = replayId;
          // add "ext : { "replay" : { CHANNEL : REPLAY_VALUE }}" to subscribe message
          set(message, 'ext.replay', replayFromMap);
        }
        callback(message);
      },
    });
  }

  /**
   * Provides a convenient way to handshake with the server endpoint before trying to subscribe.
   */
  public handshake(): Promise<StreamingClient.ConnectionState> {
    let timeout: NodeJS.Timeout;

    return new Promise((resolve, reject) => {
      timeout = setTimeout(() => {
        const timeoutError = messages.createError('genericHandshakeTimeout', [this.targetUrl]);
        this.doTimeout(timeout, timeoutError);
        reject(timeoutError);
      }, this.options.handshakeTimeout.milliseconds);

      this.cometClient.handshake(() => {
        this.log('handshake completed');
        clearTimeout(timeout);
        this.log('cleared handshake timeout');
        resolve(StreamingClient.ConnectionState.CONNECTED);
      });
    });
  }

  /**
   * Subscribe to streaming events. When the streaming processor that's set in the options completes execution it
   * returns a payload in the StatusResult object. The payload is just echoed here for convenience.
   *
   * **Throws** *{@link SfError}{ name: '{@link StreamingClient.TimeoutErrorType.SUBSCRIBE}'}* When the subscribe timeout occurs.
   *
   * @param streamInit This function should call the platform apis that result in streaming updates on push topics.
   * {@link StatusResult}
   */
  public subscribe(streamInit?: () => Promise<void>): Promise<AnyJson | void> {
    let timeout: NodeJS.Timeout;

    // This outer promise is to hold the streaming promise chain open until the streaming processor
    // says it's complete.
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return new Promise((subscribeResolve, subscribeReject) =>
      // This is the inner promise chain that's satisfied when the client impl (Faye/Mock) says it's subscribed.
      new Promise<void>((subscriptionResolve, subscriptionReject) => {
        timeout = setTimeout(() => {
          const timeoutError = messages.createError('genericTimeout');
          this.doTimeout(timeout, timeoutError);
          subscribeReject(timeoutError);
        }, this.options.subscribeTimeout.milliseconds);

        // Initialize the subscription.
        const subscription: CometSubscription = this.cometClient.subscribe(this.options.channel, (message: Message) => {
          try {
            // The result of the stream processor determines the state of the outer promise.
            const result: StatusResult = this.options.streamProcessor(message);

            // The stream processor says it's complete. Clean up and resolve the outer promise.
            if (result?.completed) {
              clearTimeout(timeout);
              this.disconnectClient();
              subscribeResolve(result.payload);
            } // This 'if' is intended to be evaluated until it's completed or until the timeout fires.
          } catch (e) {
            // it's completely valid for the stream processor to throw an error. If it does we will
            // reject the outer promise. Keep in mind if we are here the subscription was resolved.
            clearTimeout(timeout);
            this.disconnectClient();
            subscribeReject(e);
          }
        });

        subscription.callback(() => {
          subscriptionResolve();
        });

        subscription.errback((error) => {
          subscriptionReject(error);
        });
      })
        .then(() =>
          // Now that we successfully have a subscription started up we are safe to initialize the function that
          // will affect the streaming events. I.E. create an org or run apex tests.
          streamInit?.()
        )
        .catch((error) => {
          this.disconnect();
          // Need to catch the subscription rejection or it will result in an unhandled rejection error.
          clearTimeout(timeout);

          // No subscription so we can reject the out promise as well.
          subscribeReject(error);
        })
    );
  }

  /**
   * Handler for incoming streaming messages.
   *
   * @param message The message to process.
   * @param cb The callback. Failure to call this can cause the internal comet client to hang.
   */
  private incoming(message: JsonMap, cb: AnyFunction): void {
    this.log(message);
    // Look for a specific error message during the handshake.  If found, throw an error
    // with actions for the user.
    if (
      message &&
      message.channel === '/meta/handshake' &&
      message.error &&
      ensureString(message.error).includes('400::API version in the URI is mandatory')
    ) {
      throw messages.createError('handshakeApiVersionError', [this.options.apiVersion]);
    }
    cb(message);
  }

  private doTimeout(timeout: NodeJS.Timeout, error: SfError): SfError {
    this.disconnect();
    clearTimeout(timeout);
    this.log(JSON.stringify(error));
    return error;
  }

  private disconnectClient(): void {
    if (this.cometClient) {
      this.cometClient.disconnect();
    }
  }

  private disconnect(): void {
    this.log('Disconnecting the comet client');
    // This is a patch for faye. If Faye encounters errors while attempting to handshake it will keep trying
    // and will prevent the timeout from disconnecting. Here for example we will detect there is no client id but
    // unauthenticated connections are being made to salesforce. Let's close the dispatcher if it exists and
    // has no clientId.
    // @ts-ignore
    // eslint-disable-next-line no-underscore-dangle
    if (this.cometClient._dispatcher) {
      this.log('Closing the faye dispatcher');
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-underscore-dangle
      const dispatcher = this.cometClient._dispatcher;
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
      this.log(`dispatcher.clientId: ${dispatcher.clientId}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!dispatcher.clientId) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        dispatcher.close();
      } else {
        this.disconnectClient();
      }
    }
  }

  /**
   * Simple inner log wrapper
   *
   * @param message The message to log
   */
  private log(message: unknown): void {
    if (this.logger) {
      this.logger.debug(message);
    }
  }
}

export namespace StreamingClient {
  /**
   * Options for the StreamingClient
   *
   * @interface
   */
  export interface Options {
    /**
     * The org streaming target.
     */
    org: Org;
    /**
     * The hard timeout that happens with subscribe
     */
    subscribeTimeout: Duration;
    /**
     * The hard timeout that happens with a handshake.
     */
    handshakeTimeout: Duration;
    /**
     * The streaming channel aka topic
     */
    channel: string;
    /**
     * The salesforce api version
     */
    apiVersion: string;
    /**
     * The function for processing streaming messages
     */
    streamProcessor: StreamProcessor;
    /**
     * The function for build the inner client impl. Allows for mocking.
     */
    streamingImpl: StreamingClientIfc;
  }

  /**
   * Default Streaming Options. Uses Faye as the cometd impl.
   */
  export class DefaultOptions implements StreamingClient.Options {
    public static readonly SFDX_ENABLE_FAYE_COOKIES_ALLOW_ALL_PATHS = 'SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING';
    public static readonly SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING = 'SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING';

    public static readonly DEFAULT_SUBSCRIBE_TIMEOUT = Duration.minutes(3);
    public static readonly DEFAULT_HANDSHAKE_TIMEOUT = Duration.seconds(30);

    public apiVersion: string;
    public org: Org;
    public streamProcessor: StreamProcessor;
    public subscribeTimeout: Duration;
    public handshakeTimeout: Duration;
    public channel: string;
    public streamingImpl: StreamingClientIfc;

    /**
     * Constructor for DefaultStreamingOptions
     *
     * @param org The streaming target org
     * @param channel The streaming channel or topic. If the topic is a system topic then api 36.0 is used.
     * System topics are deprecated.
     * @param streamProcessor The function called that can process streaming messages.
     * @param envDep
     * @see {@link StatusResult}
     */
    public constructor(org: Org, channel: string, streamProcessor: StreamProcessor, envDep: Env = env) {
      if (envDep) {
        const logger = Logger.childFromRoot('StreamingClient');
        logger.warn('envDep is deprecated');
      }
      if (!streamProcessor) {
        throw new SfError('Missing stream processor', 'MissingArg');
      }

      if (!org) {
        throw new SfError('Missing org', 'MissingArg');
      }

      if (!channel) {
        throw new SfError('Missing streaming channel', 'MissingArg');
      }

      this.org = org;
      this.apiVersion = org.getConnection().getApiVersion();

      if (channel.startsWith('/system')) {
        this.apiVersion = '36.0';
      }

      if (!(parseFloat(this.apiVersion) > 0)) {
        throw messages.createError('invalidApiVersion', [this.apiVersion]);
      }

      this.streamProcessor = streamProcessor;
      this.channel = channel;
      this.subscribeTimeout = StreamingClient.DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT;
      this.handshakeTimeout = StreamingClient.DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT;
      this.streamingImpl = {
        getCometClient: (url: string): CometClient =>
          // @ts-ignore
          new Faye.Client(url),
        setLogger: (logLine: (message: string) => void): void => {
          // @ts-ignore
          Faye.logger = {};
          ['info', 'error', 'fatal', 'warn', 'debug'].forEach((element) => {
            // @ts-ignore
            set(Faye.logger, element, logLine);
          });
        },
      };
    }

    /**
     * Setter for the subscribe timeout.
     *
     * **Throws** An error if the newTime is less than the default time.
     *
     * @param newTime The new subscribe timeout.
     * {@link DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT}
     */
    public setSubscribeTimeout(newTime: Duration): void {
      this.subscribeTimeout = validateTimeout(newTime, DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT);
    }

    /**
     * Setter for the handshake timeout.
     *
     * **Throws** An error if the newTime is less than the default time.
     *
     * @param newTime The new handshake timeout
     * {@link DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT}
     */
    public setHandshakeTimeout(newTime: Duration): void {
      this.handshakeTimeout = validateTimeout(newTime, DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT);
    }
  }

  /**
   * Connection state
   *
   * @see {@link StreamingClient.handshake}
   */
  export enum ConnectionState {
    /**
     * Used to indicated that the streaming client is connected.
     */
    CONNECTED,
  }

  /**
   * Indicators to test error names for StreamingTimeouts
   */
  export enum TimeoutErrorType {
    /**
     * To indicate the error occurred on handshake
     */
    HANDSHAKE = 'GenericHandshakeTimeoutError',
    /**
     * To indicate the error occurred on subscribe
     */
    SUBSCRIBE = 'GenericTimeoutError',
  }
}
