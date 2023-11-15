/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'node:fs';
import { dirname } from 'node:path';
import { lock, lockSync } from 'proper-lockfile';
import { SfError } from '../sfError';
import { Logger } from '../logger/logger';
import { lockOptions, lockRetryOptions } from './lockRetryOptions';

type LockInitResponse = { writeAndUnlock: (data: string) => Promise<void>; unlock: () => Promise<void> };
type LockInitSyncResponse = { writeAndUnlock: (data: string) => void; unlock: () => void };

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

  const [unlock] = await Promise.all(
    fs.existsSync(filePath)
      ? // if the file exists, wait for it to be unlocked
        [lock(filePath, lockRetryOptions)]
      : // lock the entire directory to keep others from trying to create the file while we are
        [
          lock(dirname(filePath), lockRetryOptions),
          (
            await Logger.child('fileLocking.lockInit')
          ).debug(
            `No file found at ${filePath}.  Write will create it.  Locking the entire directory until file is written.`
          ),
        ]
  );

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

  const [unlock] = fs.existsSync(filePath)
    ? // if the file exists, wait for it to be unlocked
      [lockSync(filePath, lockOptions)]
    : // lock the entire directory to keep others from trying to create the file while we are
      [
        lockSync(dirname(filePath), lockOptions),
        Logger.childFromRoot('fileLocking.lockInit').debug(
          `No file found at ${filePath}.  Write will create it.  Locking the entire directory until file is written.`
        ),
      ];
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
