/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { EventEmitter } from 'events';
import { AnyFunction, AnyJson, JsonMap } from '@salesforce/ts-types';

export type Message = JsonMap;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Callback<T = unknown> = (...args: any[]) => T;

export interface StatusResult {
  /**
   * If the result of the streaming or polling client is expected to return a result
   */
  payload?: AnyJson;
  /**
   * Indicates to the streaming or polling client that the subscriber has what its needs. If `true` the client will end
   * the messaging exchanges with the endpoint.
   */
  completed: boolean;
}

/**
 * The subscription object returned from the cometd subscribe object.
 */
export interface CometSubscription {
  callback(callback: () => void): void;
  errback(callback: (error: Error) => void): void;
}

/**
 * Types for defining extensions.
 */
export interface StreamingExtension {
  /**
   * Extension for outgoing message.
   *
   * @param message The message.
   * @param callback The callback to invoke after the message is processed.
   */
  outgoing?: (message: JsonMap, callback: AnyFunction) => void;
  /**
   * Extension for the incoming message.
   *
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
export abstract class CometClient extends EventEmitter {
  /**
   * Disable polling features.
   *
   * @param label Polling feature label.
   */
  public abstract disable(label: string): void;

  /**
   * Add a custom extension to the underlying client.
   *
   * @param extension The json function for the extension.
   */
  public abstract addExtension(extension: StreamingExtension): void;

  /**
   * Sets an http header name/value.
   *
   * @param name The header name.
   * @param value The header value.
   */
  public abstract setHeader(name: string, value: string): void;

  /**
   * handshake with the streaming channel
   *
   * @param callback Callback for the handshake when it successfully completes. The handshake should throw
   * errors when errors are encountered.
   */
  public abstract handshake(callback: () => void): void;

  /**
   * Subscribes to Comet topics. Subscribe should perform a handshake if one hasn't been performed yet.
   *
   * @param channel The topic to subscribe to.
   * @param callback The callback to execute once a message has been received.
   */
  public abstract subscribe(channel: string, callback: (message: JsonMap) => void): CometSubscription;

  /**
   * Method to call to disconnect the client from the server.
   */
  public abstract disconnect(): void;
}
