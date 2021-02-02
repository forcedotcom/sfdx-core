import { AsyncOptionalCreatable, Duration, Env } from '@salesforce/kit';
import { AnyFunction, AnyJson, JsonMap } from '@salesforce/ts-types';
import { EventEmitter } from 'events';
import { Org } from '../org';
import { StatusResult } from './client';
/**
 * Types for defining extensions.
 */
export interface StreamingExtension {
  /**
   * Extension for outgoing message.
   * @param message The message.
   * @param callback The callback to invoke after the message is processed.
   */
  outgoing?: (message: JsonMap, callback: AnyFunction) => void;
  /**
   * Extension for the incoming message.
   * @param message The message.
   * @param callback The callback to invoke after the message is processed.
   */
  incoming?: (message: JsonMap, callback: AnyFunction) => void;
}
/**
 * Function type for processing messages
 */
export declare type StreamProcessor = (message: JsonMap) => StatusResult;
/**
 * Comet client interface. The is to allow for mocking the inner streaming Cometd implementation.
 * The Faye implementation is used by default but it could be used to adapt another Cometd impl.
 */
export declare abstract class CometClient extends EventEmitter {
  /**
   * Disable polling features.
   * @param label Polling feature label.
   */
  abstract disable(label: string): void;
  /**
   * Add a custom extension to the underlying client.
   * @param extension The json function for the extension.
   */
  abstract addExtension(extension: StreamingExtension): void;
  /**
   * Sets an http header name/value.
   * @param name The header name.
   * @param value The header value.
   */
  abstract setHeader(name: string, value: string): void;
  /**
   * handshake with the streaming channel
   * @param callback Callback for the handshake when it successfully completes. The handshake should throw
   * errors when errors are encountered.
   */
  abstract handshake(callback: () => void): void;
  /**
   * Subscribes to Comet topics. Subscribe should perform a handshake if one hasn't been performed yet.
   * @param channel The topic to subscribe to.
   * @param callback The callback to execute once a message has been received.
   */
  abstract subscribe(channel: string, callback: (message: JsonMap) => void): CometSubscription;
  /**
   * Method to call to disconnect the client from the server.
   */
  abstract disconnect(): void;
}
/**
 * Inner streaming client interface. This implements the Cometd behavior.
 * Also allows for mocking the functional behavior.
 */
export interface StreamingClientIfc {
  /**
   * Returns a comet client implementation.
   * @param url The target url of the streaming service endpoint.
   */
  getCometClient: (url: string) => CometClient;
  /**
   * Sets the logger function for the CometClient.
   * @param logLine A log message passed to the the assigned function.
   */
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
export declare class StreamingClient extends AsyncOptionalCreatable<StreamingClient.Options> {
  private readonly targetUrl;
  private readonly options;
  private logger;
  private cometClient;
  /**
   * Constructor
   * @param options Streaming client options
   * {@link AsyncCreatable.create}
   */
  constructor(options?: StreamingClient.Options);
  /**
   * Asynchronous initializer.
   */
  init(): Promise<void>;
  /**
   * Allows replaying of of Streaming events starting with replayId.
   * @param replayId The starting message id to replay from.
   */
  replay(replayId: number): void;
  /**
   * Provides a convenient way to handshake with the server endpoint before trying to subscribe.
   */
  handshake(): Promise<StreamingClient.ConnectionState>;
  /**
   * Subscribe to streaming events. When the streaming processor that's set in the options completes execution it
   * returns a payload in the StatusResult object. The payload is just echoed here for convenience.
   *
   * **Throws** *{@link SfdxError}{ name: '{@link StreamingClient.TimeoutErrorType.SUBSCRIBE}'}* When the subscribe timeout occurs.
   * @param streamInit This function should call the platform apis that result in streaming updates on push topics.
   * {@link StatusResult}
   */
  subscribe(streamInit?: () => Promise<void>): Promise<AnyJson>;
  /**
   * Handler for incoming streaming messages.
   * @param message The message to process.
   * @param cb The callback. Failure to call this can cause the internal comet client to hang.
   */
  private incoming;
  private doTimeout;
  private disconnectClient;
  private disconnect;
  /**
   * Simple inner log wrapper
   * @param message The message to log
   */
  private log;
}
export declare namespace StreamingClient {
  /**
   * Options for the StreamingClient
   * @interface
   */
  interface Options {
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
  class DefaultOptions implements StreamingClient.Options {
    static readonly SFDX_ENABLE_FAYE_COOKIES_ALLOW_ALL_PATHS = 'SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING';
    static readonly SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING = 'SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING';
    static readonly DEFAULT_SUBSCRIBE_TIMEOUT: Duration;
    static readonly DEFAULT_HANDSHAKE_TIMEOUT: Duration;
    apiVersion: string;
    org: Org;
    streamProcessor: StreamProcessor;
    subscribeTimeout: Duration;
    handshakeTimeout: Duration;
    channel: string;
    streamingImpl: StreamingClientIfc;
    private envDep;
    /**
     * Constructor for DefaultStreamingOptions
     * @param org The streaming target org
     * @param channel The streaming channel or topic. If the topic is a system topic then api 36.0 is used.
     * System topics are deprecated.
     * @param streamProcessor The function called that can process streaming messages.
     * @see {@link StatusResult}
     */
    constructor(org: Org, channel: string, streamProcessor: StreamProcessor, envDep?: Env);
    /**
     * Setter for the subscribe timeout.
     *
     * **Throws** An error if the newTime is less than the default time.
     * @param newTime The new subscribe timeout.
     * {@link DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT}
     */
    setSubscribeTimeout(newTime: Duration): void;
    /**
     * Setter for the handshake timeout.
     *
     * **Throws** An error if the newTime is less than the default time.
     * @param newTime The new handshake timeout
     * {@link DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT}
     */
    setHandshakeTimeout(newTime: Duration): void;
  }
  /**
   * Connection state
   * @see {@link StreamingClient.handshake}
   */
  enum ConnectionState {
    /**
     * Used to indicated that the streaming client is connected.
     */
    CONNECTED = 0
  }
  /**
   * Indicators to test error names for StreamingTimeouts
   */
  enum TimeoutErrorType {
    /**
     * To indicate the error occurred on handshake
     */
    HANDSHAKE = 'genericHandshakeTimeoutMessage',
    /**
     * To indicate the error occurred on subscribe
     */
    SUBSCRIBE = 'genericTimeoutMessage'
  }
}
