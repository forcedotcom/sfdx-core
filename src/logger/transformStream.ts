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
import { pipeline, Transform } from 'node:stream';
import { unwrapArray } from '../util/unwrapArray';
import { filterSecrets } from './filters';

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const build = require('pino-abstract-transport');

export default function (): Transform {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return build(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (source: any): Transform => {
      const myTransportStream = new Transform({
        objectMode: true,
        transform(chunk: Record<string, unknown>, enc, cb): void {
          if (debugAllows(chunk)) {
            // uses the original logger's filters.
            const filteredChunk = unwrapArray(filterSecrets([chunk]));
            const stringified = JSON.stringify(filteredChunk);
            this.push(stringified.concat('\n'));
          }
          cb();
        },
      });

      // Set up pipeline with proper error handling
      pipeline(source, myTransportStream, () => {});

      return myTransportStream;
    },
    {
      // This is needed to be able to pipeline transports.
      enablePipelining: true,
    }
  );
}
// Cache for debug regex to avoid recreating it on every message
let cachedDebugRegex: RegExp | null = null;
let lastDebugPattern: string | null = null;

const debugAllows = (chunk: Record<string, unknown>): boolean => {
  if (!process.env.DEBUG || process.env.DEBUG === '*') return true;
  if (typeof chunk.name !== 'string') return true;

  // Only create a new regex if the DEBUG pattern has changed
  if (process.env.DEBUG !== lastDebugPattern) {
    lastDebugPattern = process.env.DEBUG;
    cachedDebugRegex = new RegExp(process.env.DEBUG.replace(/\*/g, '.*'));
  }

  // Use the cached regex for pattern matching
  return cachedDebugRegex!.test(chunk.name);
};
