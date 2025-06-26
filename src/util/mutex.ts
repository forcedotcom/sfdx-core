/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Simple mutex implementation using promises
 */
export class Mutex {
  private mutex = Promise.resolve();

  public async lock<T>(fn: () => Promise<T> | T): Promise<T> {
    const unlock = await this.acquire();
    try {
      return await fn();
    } finally {
      unlock();
    }
  }

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
