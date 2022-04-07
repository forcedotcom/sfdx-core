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

export const checkScratchOrgInfoForErrors = async (
  orgInfo: Optional<ScratchOrgInfo>,
  hubUsername: Optional<string>,
  logger: Logger
): Promise<ScratchOrgInfo> => {
  if (!orgInfo || !orgInfo.Id) {
    throw new SfError('No scratch org info found.', 'ScratchOrgInfoNotFound');
  }
  if (orgInfo.Status === 'Active') {
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
