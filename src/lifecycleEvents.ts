/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AnyJson, Dictionary } from '@salesforce/ts-types';
import * as Debug from 'debug';

// Data of any type can be passed to the callback. Can be cast to any type that is given in emit().
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type callback = (data: any) => Promise<void>;

declare const global: {
  salesforceCoreLifecycle?: Lifecycle;
};

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
  private debug = Debug(`sfdx:${this.constructor.name}`);
  private readonly listeners: Dictionary<callback[]>;

  private constructor() {
    this.listeners = {};
  }
  /**
   * Retrieve the singleton instance of this class so that all listeners and emitters can interact from any library or tool
   */
  public static getInstance(): Lifecycle {
    // Across a npm dependency tree, there may be a LOT of versions of @salesforce/core. We want to ensure that consumers are notified when
    // listening on a lifecycle event that is fired by a different version of @salesforce/core. Adding the instance on the global object will
    // ensure this. Note: There needs to be version checking up update lifecycle to the newer version if ANYTHING is ever added to this class.
    // One way this can be done by adding a version = require(../package.json).version to the Lifecycle class, then checking that here.
    // For example, if instance is created with @salesforce/core@2.12.2 and something is added in 2.14.0, someone who depends on version 2.14.0
    // may get an instance that was created with 2.12.2.
    // Nothing should EVER be removed, even across major versions.
    if (!global.salesforceCoreLifecycle) {
      global.salesforceCoreLifecycle = new Lifecycle();
    }
    return global.salesforceCoreLifecycle;
  }

  /**
   * Remove all listeners for a given event
   *
   * @param eventName The name of the event to remove listeners of
   */
  public removeAllListeners(eventName: string): void {
    this.listeners[eventName] = [];
  }

  /**
   * Get an array of listeners (callback functions) for a given event
   *
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
   *
   * @param eventName The name of the event that is being listened for
   * @param cb The callback function to run when the event is emitted
   */
  public on<T = AnyJson>(eventName: string, cb: (data: T) => Promise<void>): void {
    const listeners = this.getListeners(eventName);
    if (listeners.length !== 0) {
      this.debug(
        `${
          listeners.length + 1
        } lifecycle events with the name ${eventName} have now been registered. When this event is emitted all ${
          listeners.length + 1
        } listeners will fire.`
      );
    }
    listeners.push(cb);
    this.listeners[eventName] = listeners;
  }

  /**
   * Emit a given event, causing all callback functions to be run in the order they were registered
   *
   * @param eventName The name of the event to emit
   * @param data The argument to be passed to the callback function
   */
  public async emit<T = AnyJson>(eventName: string, data: T): Promise<void> {
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
