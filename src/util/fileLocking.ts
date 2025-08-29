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
import { dirname } from 'node:path';
import { lock, lockSync, check, checkSync } from 'proper-lockfile';
import { Duration } from '@salesforce/kit';
import { retryDecorator } from 'ts-retry-promise';
import { fs } from '../fs/fs';
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
      (await Logger.child('fileLocking.writeAndUnlock')).debug(`Writing to file: ${filePath}`);
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
