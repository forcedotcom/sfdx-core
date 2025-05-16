/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'node:fs';
import { dirname } from 'node:path';
import { lock, lockSync, check, checkSync } from 'proper-lockfile';
import { Duration } from '@salesforce/kit';
import { retryDecorator } from 'ts-retry-promise';
import { SfError } from '../sfError';
import { Logger } from '../logger/logger';
import { Global } from '../global';
import { lockOptions, lockRetryOptions } from './lockRetryOptions';

export type LockInitResponse = { writeAndUnlock: (data: string) => Promise<void>; unlock: () => Promise<void> };
type LockInitSyncResponse = { writeAndUnlock: (data: string) => void; unlock: () => void };

export const noop = (): void => {};
export const asyncNoop = async (): Promise<void> => {};
/**
 *
 *This method exists as a separate function so it can be used by ConfigFile OR outside of ConfigFile.
 *
 * @param filePath where to save the file
 * @returns 2 functions:
 * - writeAndUnlock: a function that takes the data to write and writes it to the file, then unlocks the file whether write succeeded or not
 * - unlock: a function that unlocks the file (in case you don't end up calling writeAndUnlock)
 */
export const lockInit = async (filePath: string): Promise<LockInitResponse> => {
  // make sure we can write to the directory
  try {
    await fs.promises.mkdir(dirname(filePath), { recursive: true });
  } catch (err) {
    throw SfError.wrap(err as Error);
  }

  const unlock = Global.isWeb ? asyncNoop : await lock(filePath, { ...lockRetryOptions, realpath: false, fs });
  return {
    writeAndUnlock: async (data: string): Promise<void> => {
      const logger = await Logger.child('fileLocking.writeAndUnlock');
      logger.debug(`Writing to file: ${filePath}`);
      try {
        await fs.promises.writeFile(filePath, data);
      } finally {
        await unlock();
      }
    },
    unlock,
  };
};

/**
 * prefer async {@link lockInit}.
 * See its documentation for details.
 */
export const lockInitSync = (filePath: string): LockInitSyncResponse => {
  // make sure we can write to the directory
  try {
    fs.mkdirSync(dirname(filePath), { recursive: true });
  } catch (err) {
    throw SfError.wrap(err as Error);
  }

  const unlock = Global.isWeb ? noop : lockSync(filePath, { ...lockOptions, realpath: false, fs });
  return {
    writeAndUnlock: (data: string): void => {
      const logger = Logger.childFromRoot('fileLocking.writeAndUnlock');
      logger.debug(`Writing to file: ${filePath}`);
      try {
        fs.writeFileSync(filePath, data);
      } finally {
        unlock();
      }
    },
    unlock,
  };
};

/**
 * Poll until the file is unlocked.
 *
 * @param filePath file path to check
 */
export const pollUntilUnlock = async (filePath: string): Promise<void> => {
  if (Global.isWeb) {
    return;
  }
  try {
    await retryDecorator(check, {
      timeout: Duration.minutes(1).milliseconds,
      delay: 10,
      until: (locked) => locked === false,
      // don't retry errors (typically enoent or access on the lockfile, therefore not locked)
      retryIf: () => false,
    })(filePath, lockRetryOptions);
  } catch (e) {
    // intentionally swallow the error, same reason as above
  }
};

export const pollUntilUnlockSync = (filePath: string): void => {
  if (Global.isWeb) {
    return;
  }
  // Set a counter to ensure that the while loop does not run indefinitely
  let counter = 0;
  let locked = true;
  while (locked && counter < 100) {
    try {
      locked = checkSync(filePath, lockOptions);
      counter++;
    } catch {
      // Likely a file not found error, which means the file is not locked
      locked = false;
    }
  }
};
