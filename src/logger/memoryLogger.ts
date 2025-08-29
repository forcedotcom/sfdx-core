/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Writable } from 'node:stream';
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
