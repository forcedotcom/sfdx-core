/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * A mutual exclusion (mutex) class that ensures only one asynchronous operation
 * can execute at a time, providing thread-safe execution of critical sections.
 *
 * @example
 * ```typescript
 * const mutex = new Mutex();
 *
 * // Only one of these will execute at a time
 * mutex.lock(async () => {
 *   // Critical section code here
 *   return someAsyncOperation();
 * });
 * ```
 */
export class Mutex {
  /**
   * Internal promise chain that maintains the mutex state.
   * Each new lock acquisition is chained to this promise.
   *
   * @private
   */
  private mutex = Promise.resolve();

  /**
   * Acquires the mutex lock and executes the provided function.
   * The function will not execute until all previously queued operations complete.
   *
   * @template T - The return type of the function
   * @param fn - The function to execute while holding the mutex lock. Can be synchronous or asynchronous.
   * @returns A promise that resolves with the result of the function execution
   *
   * @example
   * ```typescript
   * const result = await mutex.lock(async () => {
   *   // This code is guaranteed to run exclusively
   *   return await someAsyncOperation();
   * });
   * ```
   */
  public async lock<T>(fn: () => Promise<T> | T): Promise<T> {
    const unlock = await this.acquire();
    try {
      return await fn();
    } finally {
      unlock();
    }
  }

  /**
   * Acquires the mutex by waiting for the current promise chain to resolve
   * and returns a release function to unlock the mutex.
   *
   * @private
   * @returns A promise that resolves to a function that releases the mutex lock
   */
  private async acquire(): Promise<() => void> {
    let release: () => void;
    const promise = new Promise<void>((resolve) => {
      release = resolve;
    });

    const currentMutex = this.mutex;
    this.mutex = this.mutex.then(() => promise);

    await currentMutex;
    return release!;
  }
}
