/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AnyJson, Optional } from '@salesforce/ts-types';
import { Duration } from '@salesforce/kit';
import { Messages } from '../messages';
import { SfError } from '../sfError';
import { Logger } from '../logger/logger';
import { StatusResult } from '../status/types';
import { PollingClient } from '../status/pollingClient';
import { ScratchOrgInfo } from './scratchOrgTypes';
import { ScratchOrgCache } from './scratchOrgCache';
import { emit } from './scratchOrgLifecycleEvents';

const WORKSPACE_CONFIG_FILENAME = 'sfdx-project.json';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'scratchOrgErrorCodes');
const namedMessages = Messages.loadMessages('@salesforce/core', 'scratchOrgErrorCodes');

// getMessage will throw when the code isn't found
// and we don't know whether a given code takes arguments or not
const optionalErrorCodeMessage = (errorCode: string, args: string[]): string | undefined => {
  try {
    // only apply args if message requires them
    let message = messages.getMessage(errorCode);
    if (message.includes('%s')) {
      message = messages.getMessage(errorCode, args);
    }
    return message;
  } catch {
    // generic error message
    return undefined;
  }
};

export const validateScratchOrgInfoForResume = async ({
  jobId,
  scratchOrgInfo,
  cache,
  hubUsername,
  timeout,
}: {
  jobId: string;
  scratchOrgInfo: ScratchOrgInfo;
  cache: ScratchOrgCache;
  hubUsername: string;
  timeout: Duration;
}): Promise<ScratchOrgInfo> => {
  if (!scratchOrgInfo?.Id || scratchOrgInfo.Status === 'Deleted') {
    // 1. scratch org info does not exist in that dev hub or has been deleted
    cache.unset(jobId);
    await cache.write();
    throw scratchOrgInfo.Status === 'Deleted'
      ? namedMessages.createError('ScratchOrgDeletedError')
      : namedMessages.createError('NoScratchOrgInfoError');
  }

  if (['New', 'Creating'].includes(scratchOrgInfo.Status)) {
    // 2. scratchOrgInfo exists, still isn't finished.  Stays in cache for future attempts
    const logger = await Logger.child('scratchOrgResume');
    logger.debug(`PollingTimeout in minutes: ${timeout.minutes}`);

    const options: PollingClient.Options = {
      async poll(): Promise<StatusResult> {
        try {
          if (scratchOrgInfo.Status === 'Active' || scratchOrgInfo.Status === 'Error') {
            return {
              completed: true,
              payload: scratchOrgInfo as unknown as AnyJson,
            };
          }
          await emit({ stage: 'wait for org', scratchOrgInfo });

          logger.debug(`Scratch org status is ${scratchOrgInfo.Status}`);
          return {
            completed: false,
          };
        } catch (error) {
          logger.debug(`Error: ${(error as Error).message}`);
          logger.debug('Re-trying deploy check again....');
          return {
            completed: false,
          };
        }
      },
      frequency: Duration.seconds(1),
      timeoutErrorName: 'ScratchOrgResumeTimeOutError',
      timeout,
    };
    const client = await PollingClient.create(options);
    const result = await client.subscribe<ScratchOrgInfo>();
    return checkScratchOrgInfoForErrors(result, hubUsername);
  }
  return checkScratchOrgInfoForErrors(scratchOrgInfo, hubUsername);
};

export const checkScratchOrgInfoForErrors = async (
  orgInfo: Optional<ScratchOrgInfo>,
  hubUsername: Optional<string>
): Promise<ScratchOrgInfo> => {
  if (!orgInfo?.Id) {
    throw new SfError('No scratch org info found.', 'ScratchOrgInfoNotFound');
  }
  if (orgInfo.Status === 'Active') {
    await emit({ stage: 'available', scratchOrgInfo: orgInfo });
    return orgInfo;
  }

  if (orgInfo.Status === 'Error' && orgInfo.ErrorCode) {
    await ScratchOrgCache.unset(orgInfo.Id);
    const message = optionalErrorCodeMessage(orgInfo.ErrorCode, [WORKSPACE_CONFIG_FILENAME]);
    if (message) {
      throw new SfError(message, 'RemoteOrgSignupFailed', [
        namedMessages.getMessage('SignupFailedActionError', [orgInfo.ErrorCode]),
      ]);
    }
    throw new SfError(namedMessages.getMessage('SignupFailedError', [orgInfo.ErrorCode]));
  }
  if (orgInfo.Status === 'Error') {
    await ScratchOrgCache.unset(orgInfo.Id);
    const logger = await Logger.child('ScratchOrgErrorCodes');
    // Maybe the request object can help the user somehow
    logger.error('No error code on signup error! Logging request.');
    logger.error(orgInfo);
    throw new SfError(
      namedMessages.getMessage('SignupFailedUnknownError', [orgInfo.Id, hubUsername]),
      'signupFailedUnknown'
    );
  }
  throw new SfError(namedMessages.getMessage('SignupUnexpectedError'), 'UnexpectedSignupStatus');
};
