import { AnyJson } from '@salesforce/ts-types';
declare type callback = (data: any) => Promise<void>;
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
export declare class Lifecycle {
  /**
   * Retrieve the singleton instance of this class so that all listeners and emitters can interact from any library or tool
   */
  static getInstance(): Lifecycle;
  private static instance;
  private debug;
  private listeners;
  private constructor();
  /**
   * Remove all listeners for a given event
   * @param eventName The name of the event to remove listeners of
   */
  removeAllListeners(eventName: string): void;
  /**
   * Get an array of listeners (callback functions) for a given event
   * @param eventName The name of the event to get listeners of
   */
  getListeners(eventName: string): callback[];
  /**
   * Create a new listener for a given event
   * @param eventName The name of the event that is being listened for
   * @param cb The callback function to run when the event is emitted
   */
  on<T = AnyJson>(eventName: string, cb: (data: T) => Promise<void>): void;
  /**
   * Emit a given event, causing all callback functions to be run in the order they were registered
   * @param eventName The name of the event to emit
   * @param data The argument to be passed to the callback function
   */
  emit<T = AnyJson>(eventName: string, data: T): Promise<void>;
}
export {};
