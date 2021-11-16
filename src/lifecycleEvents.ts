/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AnyJson, Dictionary } from '@salesforce/ts-types';
import * as Debug from 'debug';
import { compare } from 'semver';
// needed for TS to not put everything inside /lib/src
// @ts-ignore
import * as pjson from '../package.json';

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
 *
 * // if you don't need to await anything
 * use `void Lifecycle.getInstance().emit('deploy-metadata', metadataToBeDeployed)` ;
 * ```
 */
export class Lifecycle {
  public static readonly telemetryEventName = 'telemetry';
  public static readonly warningEventName = 'warning';
  private debug = Debug(`sfdx:${this.constructor.name}`);

  private constructor(private readonly listeners: Dictionary<callback[]> = {}) {}

  /**
   * return the package.json version of the sfdx-core library.
   */
  public static staticVersion(): string {
    return pjson.version;
  }

  /**
   * Retrieve the singleton instance of this class so that all listeners and emitters can interact from any library or tool
   */
  public static getInstance(): Lifecycle {
    // Across a npm dependency tree, there may be a LOT of versions of `@salesforce/core`. We want to ensure that consumers are notified when
    // listening on a lifecycle event that is fired by a different version of `@salesforce/core`. Adding the instance on the global object will
    // ensure this.
    //
    // For example, a consumer calls `Lifecycle.getInstance().on('myEvent', ...)` on version `@salesforce/core@2.12.2`, and another consumer calls
    // `Lifecycle.getInstance().emit('myEvent', ...)` on version `@salesforce/core@2.13.0`, the on handler will never be called.
    //
    // Note: If ANYTHING is ever added to this class, it needs to check and update `global.salesforceCoreLifecycle` to the newer version.
    // One way this can be done by adding a `version = require(../package.json).version` to the Lifecycle class, then checking if
    // `global.salesforceCoreLifecycle` is greater or equal to that version.
    //
    // For example, let's say a new method is added in `@salesforce/core@3.0.0`. If `Lifecycle.getInstance()` is called fist by
    // `@salesforce/core@2.12.2` then by someone who depends on version `@salesforce/core@3.0.0` (who depends on the new method)
    // they will get a "method does not exist on object" error because the instance on the global object will be of `@salesforce/core@2.12.2`.
    //
    // Nothing should EVER be removed, even across major versions.

    if (!global.salesforceCoreLifecycle) {
      // it's not been loaded yet (basic singleton pattern)
      global.salesforceCoreLifecycle = new Lifecycle();
    } else if (
      // an older version was loaded that should be replaced
      compare(global.salesforceCoreLifecycle.version(), Lifecycle.staticVersion()) === -1
    ) {
      const oldInstance = global.salesforceCoreLifecycle;
      // use the newer version and transfer any listeners from the old version
      // object spread keeps them from being references
      global.salesforceCoreLifecycle = new Lifecycle({ ...oldInstance.listeners });
      // clean up any listeners on the old version
      Object.keys(oldInstance.listeners).map((eventName) => {
        oldInstance.removeAllListeners(eventName);
      });
    }
    return global.salesforceCoreLifecycle;
  }

  /**
   * return the package.json version of the sfdx-core library.
   */
  public version(): string {
    return pjson.version;
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
   * Create a listener for the `telemetry` event
   *
   * @param cb The callback function to run when the event is emitted
   */
  public onTelemetry(cb: (data: Record<string, unknown>) => Promise<void>): void {
    this.on(Lifecycle.telemetryEventName, cb);
  }

  /**
   * Create a listener for the `warning` event
   *
   * @param cb The callback function to run when the event is emitted
   */
  public onWarning(cb: (warning: string) => Promise<void>): void {
    this.on(Lifecycle.warningEventName, cb);
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
   * Emit a `telemetry` event, causing all callback functions to be run in the order they were registered
   *
   * @param data The data to emit
   */
  public async emitTelemetry(data: AnyJson): Promise<void> {
    return this.emit(Lifecycle.telemetryEventName, data);
  }
  /**
   * Emit a `warning` event, causing all callback functions to be run in the order they were registered
   *
   * @param data The warning (string) to emit
   */
  public async emitWarning(warning: string): Promise<void> {
    // if there are no listeners, warnings should go to the node process so they're not lost
    // this also preserves behavior in UT where there's a spy on process.emitWarning
    if (this.getListeners(Lifecycle.warningEventName).length === 0) {
      process.emitWarning(warning);
    }
    return this.emit(Lifecycle.warningEventName, warning);
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
