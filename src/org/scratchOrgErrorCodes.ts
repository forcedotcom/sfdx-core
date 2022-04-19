/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Optional } from '@salesforce/ts-types';
import { Messages } from '../messages';
import { SfError } from '../sfError';
import { Logger } from '../logger';
import { ScratchOrgInfo } from './scratchOrgTypes';
import { ScratchOrgCache } from './scratchOrgCache';
import { emit } from './scratchOrgLifecycleEvents';

const WORKSPACE_CONFIG_FILENAME = 'sfdx-project.json';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'scratchOrgErrorCodes');
const namedMessages = Messages.load('@salesforce/core', 'scratchOrgErrorCodes', [
  'SignupFailedActionError',
  'SignupFailedUnknownError',
  'SignupFailedError',
  'SignupUnexpectedError',
]);

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
}: {
  jobId: string;
  soi: ScratchOrgInfo;
  cache: ScratchOrgCache;
  hubUsername: string;
}): Promise<ScratchOrgInfo> => {
  if (!scratchOrgInfo || !scratchOrgInfo.Id || scratchOrgInfo.Status === 'Deleted') {
    // 1. scratch org info does not exist in that dev hub or has been deleted
    cache.unset(jobId);
    await cache.write();
    throw soi.Status === 'Deleted'
      ? messages.createError('ScratchOrgDeletedError')
      : messages.createError('NoScratchOrgInfoError');
  }
  if (['New', 'Creating'].includes(soi.Status)) {
    // 2. SOI exists, still isn't finished.  Stays in cache for future attempts
    throw messages.createError('StillInProgressError', [soi.Status], ['action.StillInProgress']);
  }
  return checkScratchOrgInfoForErrors(soi, hubUsername);
};

export const checkScratchOrgInfoForErrors = async (
  orgInfo: Optional<ScratchOrgInfo>,
  hubUsername: Optional<string>
): Promise<ScratchOrgInfo> => {
  if (!orgInfo || !orgInfo.Id) {
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
