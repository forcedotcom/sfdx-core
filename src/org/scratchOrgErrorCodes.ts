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
import { queryScratchOrgInfo } from './scratchOrgInfoApi';
import { Org } from './org';

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
  hubOrg,
  cache,
  hubUsername,
  timeout,
}: {
  jobId: string;
  hubOrg: Org;
  cache: ScratchOrgCache;
  hubUsername: string;
  timeout: Duration;
}): Promise<ScratchOrgInfo> => {
  const scratchOrgInfo = await queryScratchOrgInfo(hubOrg, jobId);
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

    if (timeout.minutes === 0) {
      throw namedMessages.createError('StillInProgressError', [scratchOrgInfo.Status], ['action.StillInProgress']);
    }

    logger.debug(`PollingTimeout in minutes: ${timeout.minutes}`);

    const options: PollingClient.Options = {
      async poll(): Promise<StatusResult> {
        try {
          const resultInProgress = await queryScratchOrgInfo(hubOrg, jobId);
          logger.debug(`polling client result: ${JSON.stringify(resultInProgress, null, 4)}`);

          if (resultInProgress.Status === 'Active' || resultInProgress.Status === 'Error') {
            return {
              completed: true,
              payload: resultInProgress as unknown as AnyJson,
            };
          }
          await emit({ stage: 'wait for org', scratchOrgInfo: resultInProgress });

          logger.debug(`Scratch org status is ${resultInProgress.Status}`);
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
    try {
      const result = await client.subscribe<ScratchOrgInfo>();
      return await checkScratchOrgInfoForErrors(result, hubUsername);
    } catch (error) {
      const e = error as Error;
      if (e.name === 'ScratchOrgResumeTimeOutError') {
        e.message = e.message + ` (Last known Status: ${scratchOrgInfo.Status})`;
      }
      throw error;
    }
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
