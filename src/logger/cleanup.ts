/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'node:fs';
import { join } from 'node:path';
import { Global } from '../global';
import { Logger } from './logger';

/**
 * the odds of running are 1 in CLEAN_ODDS
 * ex: CLEAN_ODDS=100 implies 1 in 100
 * ex: CLEAN_ODDS=1 implies 1 in 1 (run every time)
 * */
const CLEAN_ODDS = 100;
const MAX_FILE_AGE_DAYS = 7;
const MAX_FILE_AGE_MS = 1000 * 60 * 60 * 24 * MAX_FILE_AGE_DAYS;

const shouldClean = Math.random() * CLEAN_ODDS > CLEAN_ODDS - 1;

/**
 * New logger (Summer 2023) changes how file rotation works.  Each day, the logger writes to a new file
 * To get old files cleaned up, this can be called when a new root logger is instantiated
 * based on CLEAN_ODDS, it could exit OR delete some old log files
 *
 * to start this without waiting, use void cleanup()
 *
 * accepts params to override the default behavior (used to cleanup huge log file during perf tests)
 */
export const cleanup = async (maxMs = MAX_FILE_AGE_MS, force = false): Promise<void> => {
  if (shouldClean || force) {
    try {
      const filesToConsider = await fs.promises // get the files in that dir
        .readdir(Global.SF_DIR);

      const filesToDelete = getOldLogFiles(filesToConsider, maxMs);
      await Promise.all(filesToDelete.map((f) => fs.promises.unlink(join(Global.SF_DIR, f))));
    } catch (e) {
      // we never, ever, ever throw since we're not awaiting this promise, so just log a warning
      (await Logger.child('cleanup')).warn('Failed to cleanup old log files', e);
    }
  }
};

export const getOldLogFiles = (files: string[], maxMs = MAX_FILE_AGE_MS): string[] =>
  files
    .filter((f) => f.endsWith('.log'))
    // map of filename and the date sf-YYYY-MM-DD.log => YYYY-MM-DD
    .map((f) => ({ file: f, date: f.match(/sf-(\d{4}-\d{2}-\d{2}).*\.log/)?.[1] }))
    .filter(hasDate)
    .map((f) => ({ file: f.file, date: new Date(f.date) }))
    .filter((f) => f.date < new Date(Date.now() - maxMs))
    .map((f) => f.file);

const hasDate = (f: unknown): f is { file: string; date: string } =>
  typeof f === 'object' && f !== null && 'date' in f && typeof f.date === 'string';
