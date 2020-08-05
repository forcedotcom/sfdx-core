/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AnyJson, Dictionary } from '@salesforce/ts-types';
import * as Debug from 'debug';

// Data of any type can be passed to the callback. Can be cast to any type that is given in emit().
// tslint:disable-next-line:no-any
type callback = (data: any) => Promise<void>;

/**
 * An asynchronous event listener and emitter that follows the singleton pattern. The singleton pattern allows lifecycle
 * events to be emitted from deep within a library and still be consumed by any other library or tool. It allows other
 * developers to react to certain situations or events in your library without them having to manually call the method themselves.
 *
 * An example might be transforming metadata before it is deployed to an environment. As long as an event was emitted from the
 * deploy library and you were listening on that event in the same process, you could transform the metadata before the deploy
 * regardless of where in the code that metadata was initiated.
 *
 * @example
 * ```
 * // Listen for an event in a plugin hook
 * Lifecycle.getInstance().on('deploy-metadata', transformMetadata)
 *
 * // Deep in the deploy code, fire the event for all libraries and plugins to hear.
 * Lifecycle.getInstance().emit('deploy-metadata', metadataToBeDeployed);
 * ```
 */
export class Lifecycle {
  /**
   * Retrieve the singleton instance of this class so that all listeners and emitters can interact from any library or tool
   */
  public static getInstance(): Lifecycle {
    if (!this.instance) {
      this.instance = new Lifecycle();
    }
    return this.instance;
  }

  private static instance: Lifecycle;
  private debug = Debug(`sfdx:${this.constructor.name}`);
  private listeners: Dictionary<callback[]>;

  private constructor() {
    this.listeners = {};
  }

  /**
   * Remove all listeners for a given event
   * @param eventName The name of the event to remove listeners of
   */
  public removeAllListeners(eventName: string) {
    this.listeners[eventName] = [];
  }

  /**
   * Get an array of listeners (callback functions) for a given event
   * @param eventName The name of the event to get listeners of
   */
  public getListeners(eventName: string): callback[] {
    const listeners = this.listeners[eventName];
    if (listeners) {
      return listeners;
    } else {
      this.listeners[eventName] = [];
      return [];
    }
  }

  /**
   * Create a new listener for a given event
   * @param eventName The name of the event that is being listened for
   * @param cb The callback function to run when the event is emitted
   */
  public on<T = AnyJson>(eventName: string, cb: (data: T) => Promise<void>) {
    const listeners = this.getListeners(eventName);
    if (listeners.length !== 0) {
      this.debug(
        `${listeners.length +
          1} lifecycle events with the name ${eventName} have now been registered. When this event is emitted all ${listeners.length +
          1} listeners will fire.`
      );
    }
    listeners.push(cb);
    this.listeners[eventName] = listeners;
  }

  /**
   * Emit a given event, causing all callback functions to be run in the order they were registered
   * @param eventName The name of the event to emit
   * @param data The argument to be passed to the callback function
   */
  public async emit<T = AnyJson>(eventName: string, data: T) {
    const listeners = this.getListeners(eventName);
    if (listeners.length === 0) {
      this.debug(
        `A lifecycle event with the name ${eventName} does not exist. An event must be registered before it can be emitted.`
      );
    } else {
      for (const cb of listeners) {
        await cb(data);
      }
    }
  }
}
