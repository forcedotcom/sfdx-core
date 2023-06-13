/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import pino from 'pino';

const ROOT_NAME = 'sf';

const logger = pino({ name: ROOT_NAME, level: 'warn' }, pino.destination(1));

// TODO: handle dated files
// TODO: handle removing files with dates more than 7 days ago.  Make a quasi random creation of a new job to do it outside the main thread.
// TODO: redaction at property level
// TODO: deeper redaction inside property values
// TODO: test mode (writing logs to a different location, or buffer, to retrieve from TestSetup)
