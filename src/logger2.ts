/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import path = require('path');
import pino from 'pino';
import { Global } from './global';

const ROOT_NAME = 'sf';
const destinationFile = path.join(Global.SF_DIR, `sf.new-${new Date().toISOString().split('T')[0]}.log`);

/** used when debug mode, writes to stdout */
const debugTransport = {
  target: 'pino-pretty',
  level: 'trace',
  options: { colorize: true },
} as const;

/** write to the normal file */
const primaryTransport = {
  target: 'pino/file',
  level: 'info',
  options: { destination: destinationFile, mkdir: true },
} as const;

export const logger = pino({
  name: ROOT_NAME,
  level: 'info',
  base: {},
  transport: {
    targets: process.env.DEBUG ? [primaryTransport, debugTransport] : [primaryTransport],
  },
  sync: false,
});

// TODO: handle removing files with dates more than 7 days ago.  Make a quasi random creation of a new job to do it outside the main thread.
// TODO: redaction at property level
// TODO: deeper redaction inside property values
// TODO: test mode (writing logs to a different location, or buffer, to retrieve from TestSetup)

// TODO: telemetry as custom level (1)
