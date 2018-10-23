/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { set } from '@salesforce/kit';
import { AnyFunction, Dictionary, ensure, JsonMap } from '@salesforce/ts-types';
import { EventEmitter } from 'events';
// @ts-ignore No typings are available for faye
import * as Faye from 'faye';
import { Logger } from '../logger';
import { Org } from '../org';
import { SfdxError, SfdxErrorConfig } from '../sfdxError';
import { Time, TIME_UNIT } from '../util/time';
import { StatusResult } from './client';

/**
 * Comet client interface. The is to allow for mocking the inner streaming Cometd implementation.
 * The Faye implementation is used by default but it could be used to adapt another Cometd impl.
 * @abstract
 */
export abstract class CometClient extends EventEmitter {
    /**
     * Disable polling features.
     * @param {string} label Polling feature label.
     * @abstract
     */
    public abstract disable(label: string): void;

    /**
     * Add a custom extension to the underlying client.
     * @param {JsonMap} extension The json function for the extension.
     * @abstract
     */
    public abstract addExtension(extension: Dictionary): void;

    /**
     * Sets an http header name/value.
     * @param {string} name The header name.
     * @param {string} value The header value.
     * @abstract
     */
    public abstract setHeader(name: string, value: string): void;

    /**
     * handshake with the streaming channel
     * @param {function} callback Callback for the handshake when it successfully completes. The handshake should throw
     * errors when errors are encountered.
     * @abstract
     */
    public abstract handshake(callback: () => void): void;

    /**
     * Subscribes to Comet topics. Subscribe should perform a handshake if one hasn't been performed yet.
     * @param {string} channel The topic to subscribe to.
     * @param {function(message)} callback The callback to execute once a message has been received.
     * @returns {CometSubscription} A subscription object.
     */
    public abstract subscribe(channel: string, callback: (message: JsonMap) => void): CometSubscription;
    public abstract disconnect(): void;
}

/**
 * Inner streaming client interface. This implements the Cometd behavior.
 * Also allows for mocking the functional behavior.
 * @interface
 */
export interface StreamingClientIfc {
    getCometClient: (url: string) => CometClient;
    setLogger: (logLine: (message: string) => void) => void;
}

/**
 * The subscription object returned from the cometd subscribe object.
 */
export interface CometSubscription {
    callback(callback: () => void): void;
    errback(callback: (error: Error) => void): void;
}

/**
 * Options for the StreamingClient
 * @interface
 */
export interface StreamingOptions<T> {
    // The org streaming target.
    org: Org;
    // The hard timeout that happens with subscribe
    subscribeTimeout: Time;
    // The hard timeout that happens with a handshake.
    handshakeTimeout: Time;
    // The streaming channel aka topic
    channel: string;
    // The salesforce api version
    apiVersion: string;
    // The function for processing streaming messages
    streamProcessor: (message: JsonMap) => StatusResult<T>;
    // The function for build the inner client impl. Allows for mocking.
    streamingImpl: StreamingClientIfc;
}

/**
 * Default Streaming Options. Uses Faye as the cometd impl.
 */
export class DefaultStreamingOptions<T> implements StreamingOptions<T> {

    public static readonly DEFAULT_SUBSCRIBE_TIMEOUT = new Time(3, TIME_UNIT.MINUTES);
    public static readonly DEFAULT_HANDSHAKE_TIMEOUT = new Time(30, TIME_UNIT.SECONDS);

    public apiVersion: string;
    public org: Org;
    public streamProcessor: (message: JsonMap) => StatusResult<T>;
    public subscribeTimeout: Time;
    public handshakeTimeout: Time;
    public channel: string;
    public streamingImpl: StreamingClientIfc;

    /**
     * Constructor for DefaultStreamingOptions
     * @param {Org} org The streaming target org
     * @param {string} channel The streaming channel or topic. If the topic is a system topic then api 36.0 is used.
     * System topics are deprecated.
     * @param {function(JsonMap)} streamProcessor The function called that can process streaming messages.
     * @see {@link StatusResult}
     */
    constructor(org: Org, channel: string, streamProcessor: (message: JsonMap) => StatusResult<T>) {

        if (!streamProcessor) {
            throw new SfdxError('Missing stream processor', 'MissingArg');
        }

        if (!org) {
            throw new SfdxError('Missing org', 'MissingArg');
        }

        if (!channel) {
            throw new SfdxError('Missing streaming channel', 'MissingArg');
        }

        this.org = org;
        this.apiVersion = org.getConnection().getApiVersion();

        if (channel.startsWith('/system')) {
            this.apiVersion = '36.0';
        }

        this.streamProcessor = streamProcessor;
        this.channel = channel;
        this.subscribeTimeout = DefaultStreamingOptions.DEFAULT_SUBSCRIBE_TIMEOUT;
        this.handshakeTimeout = DefaultStreamingOptions.DEFAULT_HANDSHAKE_TIMEOUT;
        this.streamingImpl = {
            getCometClient: (url: string) => {
                return new Faye.Client(url);
            },
            setLogger: (logLine: (message: string) => void) => {
                Faye.logger = {};
                ['info', 'error', 'fatal', 'warn', 'debug'].forEach(element => {
                    set(Faye.logger, element, logLine);
                });
            }
        };
    }

    /**
     * Setter for the subscribe timeout.
     * @param {Time} newTime The new subscribe timeout.
     * @throws {SfdxError} An error if the newTime is less than the default time.
     */
    public setSubscribeTimeout(newTime: Time) {
        this.subscribeTimeout = this.validateTimeout(newTime,
            DefaultStreamingOptions.DEFAULT_SUBSCRIBE_TIMEOUT);
    }

    /**
     * Setter for the handshake timeout.
     * @param {Time} newTime The new handshake timeout
     * @throws {SfdxError} An error if the newTime is less than the default time.
     */
    public setHandshakeTimeout(newTime: Time) {
        this.handshakeTimeout = this.validateTimeout(newTime,
            DefaultStreamingOptions.DEFAULT_HANDSHAKE_TIMEOUT);
    }

    private validateTimeout(newTime: Time, existingTime: Time) {
        if (newTime.milliseconds >= existingTime.milliseconds) {
            return newTime;
        }
        throw SfdxError.create('@salesforce/core', 'streaming', 'waitParamValidValueError', [existingTime.minutes]);
    }
}

/**
 * Connection state
 * @typedef StreamingConnectionState
 * @property {string} CONNECTED Used to indicated that the streaming client is connected.
 * @see {@link StreamingClient.handshake}
 */
export enum StreamingConnectionState {
    CONNECTED
}

/**
 * Indicators to test error names for StreamingTimeouts
 */
export enum StreamingTimeoutErrorType {
    HANDSHAKE = 'genericHandshakeTimeoutMessage',
    SUBSCRIBE = 'genericTimeoutMessage'
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
 * @example
 *
 *  streamProcessor(message: JsonMap): StatusResult<string> {
 *      const payload = ensureJsonMap(message.payload);
 *      const id = ensureString(payload.id);
 *
 *      if (payload.status !== 'Active') {
 *          return  { completed: false };
 *      }
 *
 *      return {
 *          completed: true,
 *          payload: id
 *      };
 *  }
 *
 *  const org: Org = await Org.create(this.org.name);
 *  const options = new DefaultStreamingOptions(org, TOPIC, this.streamProcessor.bind(this));
 *
 *  try  {
 *      const asyncStatusClient = await StreamingClient.init(options);
 *
 *      await asyncStatusClient.handshake();
 *
 *      await asyncStatusClient.subscribe(async () => {
 *               // Now that we are subscribed, we can initiate the request that will cause the events to start streaming.
 *               const requestResponse = asJsonMap(asAnyJson(await org.getConnection().request(url)));
 *               this.id = ensureString(requestResponse.id);
 *           });
 *
 *  } catch(e) {
 *      // handle streaming message errors and timeouts here. ex. If the handshake fails you could try polling.
 *      // ....
 *  }
 *
 */
export class StreamingClient<T> {

    /**
     * A static initializer for creating a StreamingClient
     * @param {StreamingOptions<U>} options The StreamingClient options.
     * @returns {Promise<StreamingClient<U>>}
     */
    public static async init<U>(options: StreamingOptions<U>): Promise<StreamingClient<U>> {

        // get the apiVersion from the connection if not already an option
        const conn = options.org.getConnection();
        options.apiVersion = options.apiVersion || conn.getApiVersion();

        const streamingClient: StreamingClient<U> =
            new StreamingClient<U>(options, await Logger.child('StreamingClient'));

        await streamingClient.options.org.refreshAuth();

        const accessToken = conn.getConnectionOptions().accessToken;

        if (accessToken && accessToken.length > 5) {
            streamingClient.logger.debug(`accessToken: XXXXXX${accessToken.substring(accessToken.length - 5, accessToken.length - 1)}`);
            streamingClient.cometClient.setHeader('Authorization', `OAuth ${accessToken}`);
        } else {
            throw new SfdxError('Missing or invalid access token', 'MissingOrInvalidAccessToken');
        }

        streamingClient.log(`Streaming client target url: ${streamingClient.targetUrl}`);
        streamingClient.log(`options.subscribeTimeout (ms): ${options.subscribeTimeout.milliseconds}`);
        streamingClient.log(`options.handshakeTimeout (ms): ${options.handshakeTimeout.milliseconds}`);

        return streamingClient;
    }

    private readonly targetUrl: string;
    private readonly options: StreamingOptions<T>;
    private logger: Logger;
    private cometClient: CometClient;

    /**
     * Constructs a streaming client.
     * @param {StreamingOptions<T>} options Config options for the StreamingClient
     * @param {Logger} logger The child logger to use for streaming.
     * @see {@link StreamingOptions}
     * @private
     */
    private constructor(options: StreamingOptions<T>, logger: Logger) {

        this.logger = logger;
        this.options = options;

        const instanceUrl = ensure(options.org.getConnection().getAuthInfoFields().instanceUrl);
        const urlElements = [instanceUrl, 'cometd', options.apiVersion];

        this.targetUrl = urlElements.join('/');
        this.cometClient = this.options.streamingImpl.getCometClient(this.targetUrl);
        this.options.streamingImpl.setLogger(this.log.bind(this));

        this.cometClient.on('transport:up', () => this.log('Transport up event received'));
        this.cometClient.on('transport:down', () => this.log('Transport down event received'));

        this.cometClient.addExtension({
            incoming: this.incoming.bind(this)
        });

        this.cometClient.disable('websocket');
    }

    public replay(replayId: number) {
        this.cometClient.addExtension({
            outgoing: (message: { channel: string, ext?: JsonMap }, callback: AnyFunction): void => {
                if (message.channel === '/meta/subscribe') {
                    if (!message.ext) { message.ext = {}; }
                    const replayFromMap: JsonMap = {};
                    replayFromMap[this.options.channel] = replayId;
                    // add "ext : { "replay" : { CHANNEL : REPLAY_VALUE }}" to subscribe message
                    message.ext['replay'] = replayFromMap;
                }
                callback(message);
            }
        });
    }

    /**
     * Provides a convenient way to handshake with the server endpoint before trying to subscribe.
     * @async
     * @returns {Promise<StreamingConnectionState>}
     */
    public handshake(): Promise<StreamingConnectionState> {

        let timeout: NodeJS.Timer;

        return new Promise((resolve, reject) => {
            timeout = setTimeout(() => {
                const timeoutError: SfdxError = SfdxError.create('@salesforce/core',
                    'streaming', StreamingTimeoutErrorType.HANDSHAKE, [this.targetUrl]);
                this.doTimeout(timeout, timeoutError);
                reject(timeoutError);
            }, this.options.handshakeTimeout.milliseconds);

            this.cometClient.handshake(() => {
                this.log('handshake completed');
                clearTimeout(timeout);
                this.log('cleared handshake timeout');
                resolve(StreamingConnectionState.CONNECTED);
            });
        });
    }

    /**
     * Subscribe to streaming events.
     * @param {function} [streamInit] - This function should call the platform apis that result in streaming updates on push topics.
     * @returns {Promise<T>} - When the streaming processor that's set in the options completes, it returns a payload in
     * the StatusResult object. The payload is just echoed here for convenience.
     * @async
     * @see {@link StatusResult}
     */
    public subscribe(streamInit?: () => Promise<void>): Promise<T> {
        let timeout: NodeJS.Timer;

        // This outer promise is to hold the streaming promise chain open until the streaming processor
        // says it's complete.
        return new Promise((subscribeResolve, subscribeReject) => {
            // This is the inner promise chain that's satisfied when the client impl (Faye/Mock) says it's subscribed.
            return new Promise((subscriptionResolve, subscriptionReject) => {

                timeout = setTimeout(() => {
                    const timeoutError: SfdxError = SfdxError.create('@salesforce/core',
                        'streaming', StreamingTimeoutErrorType.SUBSCRIBE);
                    this.doTimeout(timeout, timeoutError);
                    subscribeReject(timeoutError);
                }, this.options.subscribeTimeout.milliseconds);

                // Initialize the subscription.
                const subscription: CometSubscription = this.cometClient.subscribe(this.options.channel,
                    message => {
                        try {
                            // The result of the stream processor determines the state of the outer promise.
                            const result: StatusResult<T> = this.options.streamProcessor(message);

                            // The stream processor says it's complete. Clean up and resolve the outer promise.
                            if (result && result.completed) {
                                clearTimeout(timeout);
                                this.cometClient.disconnect();
                                subscribeResolve(result.payload);
                            }
                        } catch (e) {
                            // it's completely valid for the stream processor to throw an error. If it does we will
                            // reject the outer promise. Keep in mind if we are here the subscription was resolved.
                            clearTimeout(timeout);
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
                // Need to catch the subscription rejection or it will result in an unhandled rejection error.
                clearTimeout(timeout);

                // No subscription so we can reject the out promise as well.
                subscribeReject(error);
            });
        });
    }

    private incoming(message: { channel?: string, error?: string }, cb: AnyFunction): void {
        this.log(message);
        // Look for a specific error message during the handshake.  If found, throw an error
        // with actions for the user.
        if (message &&
            message.channel === '/meta/handshake' &&
            message.error &&
            message.error.includes('400::API version in the URI is mandatory')) {
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

    private doTimeout(timeout: NodeJS.Timer, error: SfdxError) {
        this.disconnect();
        clearTimeout(timeout);
        this.log(JSON.stringify(error));
        return error;
    }

    private disconnect() {
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
                this.cometClient.disconnect();
            }
        }
    }

    /**
     * Simple inner log wrapper
     * @param {any} message The message to log
     * @private
     */
    private log(message: any) { // tslint:disable-line:no-any
        if (this.logger) {
            this.logger.debug(message);
        }
    }
}
