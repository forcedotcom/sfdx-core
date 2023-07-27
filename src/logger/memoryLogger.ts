/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Writable } from 'stream';
import { unwrapArray } from '../util/unwrapArray';
import { filterSecrets } from './filters';

/**
 * Used by test setup to keep UT from writing to disk.
 */
export class MemoryLogger extends Writable {
  public loggedData: Array<Record<string, unknown>> = [];

  public constructor() {
    super({ objectMode: true });
  }

  public _write(chunk: Record<string, unknown>, encoding: string, callback: (err?: Error) => void): void {
    const filteredChunk = unwrapArray(filterSecrets([chunk]));
    this.loggedData.push(
      typeof filteredChunk === 'string'
        ? (JSON.parse(filteredChunk) as Record<string, unknown>)
        : (filteredChunk as Record<string, unknown>)
    );
    callback();
  }
}
