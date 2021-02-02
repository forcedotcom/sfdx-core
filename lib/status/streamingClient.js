/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AsyncOptionalCreatable, Duration, env, set } from '@salesforce/kit';
import { ensure, ensureString } from '@salesforce/ts-types';
import { EventEmitter } from 'events';
// @ts-ignore No typings are available for faye
import * as Faye from 'sfdx-faye';
import { Logger } from '../logger';
import { SfdxError, SfdxErrorConfig } from '../sfdxError';
import { resolve as resolveUrl } from 'url';
/**
 * Comet client interface. The is to allow for mocking the inner streaming Cometd implementation.
 * The Faye implementation is used by default but it could be used to adapt another Cometd impl.
 */
export class CometClient extends EventEmitter {}
/**
 * Validation helper
 * @param newTime New Duration to validate.
 * @param existingTime Existing time to validate.
 */
function validateTimeout(newTime, existingTime) {
  if (newTime.milliseconds >= existingTime.milliseconds) {
    return newTime;
  }
  throw SfdxError.create('@salesforce/core', 'streaming', 'waitParamValidValueError', [existingTime.minutes]);
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
 * const org = await Org.create({});
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
export class StreamingClient extends AsyncOptionalCreatable {
  /**
   * Constructor
   * @param options Streaming client options
   * {@link AsyncCreatable.create}
   */
  constructor(options) {
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
     *    "BrowserId=<ID>;Path=/;Domain=.salesforce.com;Expires=Sun, 13-Jan-2019 20:16:19 GMT;Max-Age=5184000",
     *    "t=<ID>;Path=/cometd/;HttpOnly",
     *    "BAYEUX_BROWSER=<ID>;Path=/cometd/;Secure",
     *    "sfdc-stream=<ID>; expires=Wed, 14-Nov-2018 23:16:19 GMT; path=/"
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
      incoming: this.incoming.bind(this)
    });
    this.cometClient.disable('websocket');
  }
  /**
   * Asynchronous initializer.
   */
  async init() {
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
      throw new SfdxError('Missing or invalid access token', 'MissingOrInvalidAccessToken');
    }
    this.log(`Streaming client target url: ${this.targetUrl}`);
    this.log(`options.subscribeTimeout (ms): ${this.options.subscribeTimeout.milliseconds}`);
    this.log(`options.handshakeTimeout (ms): ${this.options.handshakeTimeout.milliseconds}`);
  }
  /**
   * Allows replaying of of Streaming events starting with replayId.
   * @param replayId The starting message id to replay from.
   */
  replay(replayId) {
    this.cometClient.addExtension({
      outgoing: (message, callback) => {
        if (message.channel === '/meta/subscribe') {
          if (!message.ext) {
            message.ext = {};
          }
          const replayFromMap = {};
          replayFromMap[this.options.channel] = replayId;
          // add "ext : { "replay" : { CHANNEL : REPLAY_VALUE }}" to subscribe message
          set(message, 'ext.replay', replayFromMap);
        }
        callback(message);
      }
    });
  }
  /**
   * Provides a convenient way to handshake with the server endpoint before trying to subscribe.
   */
  handshake() {
    let timeout;
    return new Promise((resolve, reject) => {
      timeout = setTimeout(() => {
        const timeoutError = SfdxError.create(
          '@salesforce/core',
          'streaming',
          StreamingClient.TimeoutErrorType.HANDSHAKE,
          [this.targetUrl]
        );
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
   * **Throws** *{@link SfdxError}{ name: '{@link StreamingClient.TimeoutErrorType.SUBSCRIBE}'}* When the subscribe timeout occurs.
   * @param streamInit This function should call the platform apis that result in streaming updates on push topics.
   * {@link StatusResult}
   */
  subscribe(streamInit) {
    let timeout;
    // This outer promise is to hold the streaming promise chain open until the streaming processor
    // says it's complete.
    return new Promise((subscribeResolve, subscribeReject) => {
      // This is the inner promise chain that's satisfied when the client impl (Faye/Mock) says it's subscribed.
      return new Promise((subscriptionResolve, subscriptionReject) => {
        timeout = setTimeout(() => {
          const timeoutError = SfdxError.create(
            '@salesforce/core',
            'streaming',
            StreamingClient.TimeoutErrorType.SUBSCRIBE
          );
          this.doTimeout(timeout, timeoutError);
          subscribeReject(timeoutError);
        }, this.options.subscribeTimeout.milliseconds);
        // Initialize the subscription.
        const subscription = this.cometClient.subscribe(this.options.channel, message => {
          try {
            // The result of the stream processor determines the state of the outer promise.
            const result = this.options.streamProcessor(message);
            // The stream processor says it's complete. Clean up and resolve the outer promise.
            if (result && result.completed) {
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
        subscription.errback(error => {
          subscriptionReject(error);
        });
      })
        .then(() => {
          // Now that we successfully have a subscription started up we are safe to initialize the function that
          // will affect the streaming events. I.E. create an org or run apex tests.
          return streamInit && streamInit();
        })
        .catch(error => {
          this.disconnect();
          // Need to catch the subscription rejection or it will result in an unhandled rejection error.
          clearTimeout(timeout);
          // No subscription so we can reject the out promise as well.
          subscribeReject(error);
        });
    });
  }
  /**
   * Handler for incoming streaming messages.
   * @param message The message to process.
   * @param cb The callback. Failure to call this can cause the internal comet client to hang.
   */
  incoming(message, cb) {
    this.log(message);
    // Look for a specific error message during the handshake.  If found, throw an error
    // with actions for the user.
    if (
      message &&
      message.channel === '/meta/handshake' &&
      message.error &&
      ensureString(message.error).includes('400::API version in the URI is mandatory')
    ) {
      const errConfig = new SfdxErrorConfig(
        '@salesforce/core',
        'streaming',
        'handshakeApiVersionError',
        [this.options.apiVersion],
        'handshakeApiVersionErrorAction'
      );
      throw SfdxError.create(errConfig);
    }
    cb(message);
  }
  doTimeout(timeout, error) {
    this.disconnect();
    clearTimeout(timeout);
    this.log(JSON.stringify(error));
    return error;
  }
  disconnectClient() {
    if (this.cometClient) {
      this.cometClient.disconnect();
    }
  }
  disconnect() {
    this.log('Disconnecting the comet client');
    // This is a patch for faye. If Faye encounters errors while attempting to handshake it will keep trying
    // and will prevent the timeout from disconnecting. Here for example we will detect there is no client id but
    // unauthenticated connections are being made to salesforce. Let's close the dispatcher if it exists and
    // has no clientId.
    // @ts-ignore
    if (this.cometClient._dispatcher) {
      this.log('Closing the faye dispatcher');
      // @ts-ignore
      const dispatcher = this.cometClient._dispatcher;
      this.log(`dispatcher.clientId: ${dispatcher.clientId}`);
      if (!dispatcher.clientId) {
        dispatcher.close();
      } else {
        this.disconnectClient();
      }
    }
  }
  /**
   * Simple inner log wrapper
   * @param message The message to log
   */
  log(message) {
    if (this.logger) {
      this.logger.debug(message);
    }
  }
}
(function(StreamingClient) {
  /**
   * Default Streaming Options. Uses Faye as the cometd impl.
   */
  class DefaultOptions {
    /**
     * Constructor for DefaultStreamingOptions
     * @param org The streaming target org
     * @param channel The streaming channel or topic. If the topic is a system topic then api 36.0 is used.
     * System topics are deprecated.
     * @param streamProcessor The function called that can process streaming messages.
     * @see {@link StatusResult}
     */
    constructor(org, channel, streamProcessor, envDep = env) {
      if (!streamProcessor) {
        throw new SfdxError('Missing stream processor', 'MissingArg');
      }
      if (!org) {
        throw new SfdxError('Missing org', 'MissingArg');
      }
      if (!channel) {
        throw new SfdxError('Missing streaming channel', 'MissingArg');
      }
      this.envDep = envDep;
      this.org = org;
      this.apiVersion = org.getConnection().getApiVersion();
      if (channel.startsWith('/system')) {
        this.apiVersion = '36.0';
      }
      if (!(parseFloat(this.apiVersion) > 0)) {
        throw SfdxError.create('@salesforce/core', 'streaming', 'invalidApiVersion', [this.apiVersion]);
      }
      this.streamProcessor = streamProcessor;
      this.channel = channel;
      this.subscribeTimeout = StreamingClient.DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT;
      this.handshakeTimeout = StreamingClient.DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT;
      this.streamingImpl = {
        getCometClient: url => {
          const x = this.envDep.getString(StreamingClient.DefaultOptions.SFDX_ENABLE_FAYE_COOKIES_ALLOW_ALL_PATHS);
          return new Faye.Client(url, {
            // This parameter ensures all cookies regardless of path are included in subsequent requests. Otherwise
            // only cookies with the path "/" and "/cometd" are known to be included.
            // if SFDX_ENABLE_FAYE_COOKIES_ALLOW_ALL_PATHS is *not* set the default to true.
            cookiesAllowAllPaths:
              x === undefined
                ? true
                : this.envDep.getBoolean(StreamingClient.DefaultOptions.SFDX_ENABLE_FAYE_COOKIES_ALLOW_ALL_PATHS),
            // WARNING - The allows request/response exchanges to be written to the log instance which includes
            // header and cookie information.
            enableRequestResponseLogging: this.envDep.getBoolean(
              StreamingClient.DefaultOptions.SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING
            )
          });
        },
        setLogger: logLine => {
          Faye.logger = {};
          ['info', 'error', 'fatal', 'warn', 'debug'].forEach(element => {
            set(Faye.logger, element, logLine);
          });
        }
      };
    }
    /**
     * Setter for the subscribe timeout.
     *
     * **Throws** An error if the newTime is less than the default time.
     * @param newTime The new subscribe timeout.
     * {@link DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT}
     */
    setSubscribeTimeout(newTime) {
      this.subscribeTimeout = validateTimeout(newTime, DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT);
    }
    /**
     * Setter for the handshake timeout.
     *
     * **Throws** An error if the newTime is less than the default time.
     * @param newTime The new handshake timeout
     * {@link DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT}
     */
    setHandshakeTimeout(newTime) {
      this.handshakeTimeout = validateTimeout(newTime, DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT);
    }
  }
  DefaultOptions.SFDX_ENABLE_FAYE_COOKIES_ALLOW_ALL_PATHS = 'SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING';
  DefaultOptions.SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING = 'SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING';
  DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT = Duration.minutes(3);
  DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT = Duration.seconds(30);
  StreamingClient.DefaultOptions = DefaultOptions;
  /**
   * Connection state
   * @see {@link StreamingClient.handshake}
   */
  let ConnectionState;
  (function(ConnectionState) {
    /**
     * Used to indicated that the streaming client is connected.
     */
    ConnectionState[(ConnectionState['CONNECTED'] = 0)] = 'CONNECTED';
  })((ConnectionState = StreamingClient.ConnectionState || (StreamingClient.ConnectionState = {})));
  /**
   * Indicators to test error names for StreamingTimeouts
   */
  let TimeoutErrorType;
  (function(TimeoutErrorType) {
    /**
     * To indicate the error occurred on handshake
     */
    TimeoutErrorType['HANDSHAKE'] = 'genericHandshakeTimeoutMessage';
    /**
     * To indicate the error occurred on subscribe
     */
    TimeoutErrorType['SUBSCRIBE'] = 'genericTimeoutMessage';
  })((TimeoutErrorType = StreamingClient.TimeoutErrorType || (StreamingClient.TimeoutErrorType = {})));
})(StreamingClient || (StreamingClient = {}));
//# sourceMappingURL=streamingClient.js.map
