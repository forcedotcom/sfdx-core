/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { pipeline, Transform } from 'stream';
import { accessTokenRegex, sfdxAuthUrlRegex } from '../exported';
import { unwrapArray } from '../util/unwrapArray';
import { filterSecrets } from './filters';

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const build = require('pino-abstract-transport');

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
export default async function (options: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return build(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (source: any): Transform => {
      const myTransportStream = new Transform({
        objectMode: true,
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        transform(chunk: Record<string, unknown>, enc, cb) {
          if (debugAllows(chunk)) {
            // uses the original logger's filters.
            const filteredChunk = unwrapArray(filterSecrets([chunk]));

            // stringify the payload again to make it easier to run replacements on
            // filter things that look like certain tokens
            const stringified = JSON.stringify(filteredChunk)
              .replace(new RegExp(accessTokenRegex, 'g'), '<REDACTED ACCESS TOKEN>')
              .replace(new RegExp(sfdxAuthUrlRegex, 'g'), '<REDACTED ACCESS TOKEN>');
            this.push(`${stringified}\n`);
          }
          cb();
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      pipeline(source, myTransportStream, () => {});
      return myTransportStream;
    },
    {
      // This is needed to be able to pipeline transports.
      enablePipelining: true,
    }
  );
}

/** if the DEBUG= is set, see if that matches the logger name.  If not, we don't want to keep going */
const debugAllows = (chunk: Record<string, unknown>): boolean => {
  if (!process.env.DEBUG) return true;
  if (process.env.DEBUG === '*') return true;
  if (typeof chunk.name !== 'string') return true;
  // turn wildcard patterns into regexes
  const regexFromDebug = new RegExp(process.env.DEBUG.replace(/\*/g, '.*'));
  if (!regexFromDebug.test(chunk.name)) {
    // console.log(`no match : ${chunk.name} for ${process.env.DEBUG}`);
    return false;
  } else {
    // console.log(`match : ${chunk.name} for ${process.env.DEBUG}`);
    return true;
  }
};
