/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as path from 'path';
import pino, { Logger } from 'pino';
import { Global } from '../global';

const ROOT_NAME = 'sf';
const enabled = process.env.SFDX_DISABLE_LOG_FILE !== 'true' && process.env.SF_LOG_LEVEL !== 'true';
const level = process.env.SF_LOG_LEVEL ?? process.env.SFDX_LOG_LEVEL ?? 'warn';

const rotator = new Map([
  ['minute', new Date().toISOString().split(':').slice(0, 2).join('-')],
  ['day', new Date().toISOString().split('T')[0]],
]);

const destinationFile = path.join(Global.SF_DIR, `sf.new-${rotator.get('day')}.log`);

const transportStream = {
  target: '../../lib/logger/transformStream',
};

/**
 * basic root-level logger with default/env behavior.
 * you probably want to use this, and if you need a child, want to call .child() on it
 * */
const rootLogger = pino({
  name: ROOT_NAME,
  enabled,
  level,
  transport: {
    pipeline: [
      transportStream,
      process.env.DEBUG
        ? {
            // used when debug mode, writes to stdout (colorized)
            target: 'pino-pretty',
            options: { colorize: true },
          }
        : {
            // write to a rotating file
            target: 'pino/file',
            options: { destination: destinationFile, mkdir: true, level: 'warn' },
          },
    ],
  },
  sync: false,
});

export { rootLogger };
/**
 * @experimental
 *
 * You want a separate root-level logger where you can customize the destination file and name.
 * Each of these will return a new, disconnected logger logger to a different place
 */
export const getCustomLogger = ({ customPath, name = ROOT_NAME }: { customPath: string; name?: string }): Logger => {
  /** write to a custom file (for testing) */
  const testTransport = {
    target: 'pino/file',
    options: { destination: customPath, mkdir: true },
  } as const;

  const customLogger = pino({
    name,
    enabled,
    level,
    transport: {
      pipeline: [transportStream, testTransport],
    },
    sync: true,
  });

  customLogger.warn({ customPath, name }, 'custom logger created');
  return customLogger;
};

// TODO: handle removing files with dates more than 7 days ago.  Make a quasi random creation of a new job to do it outside the main thread.
// TODO: test mode (writing logs to a different location, or buffer, to retrieve from TestSetup)

// TODO: telemetry as custom level (1)
// TODO: how to inject/hoist this into oclif to override DEBUG library and get telemetry from there?
