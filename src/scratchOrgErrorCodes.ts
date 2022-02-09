/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Optional } from '@salesforce/ts-types';
import { Logger } from './logger';
import { Messages } from './messages';
import { SfdxError } from './sfdxError';
import { ScratchOrgInfo } from './scratchOrgInfoApi';

const WORKSPACE_CONFIG_FILENAME = 'sfdx-project.json';

Messages.importMessagesDirectory(__dirname);
const messages: Messages = Messages.loadMessages('@salesforce/core', 'scratchOrgErrorCodes');

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

export const checkScratchOrgInfoForErrors = (
  orgInfo: Optional<ScratchOrgInfo>,
  hubUsername: Optional<string>,
  logger: Logger
): ScratchOrgInfo => {
  if (!orgInfo) {
    throw new SfdxError('No scratch org info found.', 'ScratchOrgInfoNotFound');
  }
  if (orgInfo.Status === 'Active') {
    return orgInfo;
  }
  if (orgInfo.Status === 'Error' && orgInfo.ErrorCode) {
    const message = optionalErrorCodeMessage(orgInfo.ErrorCode, [WORKSPACE_CONFIG_FILENAME]);
    if (message) {
      throw new SfdxError(message, 'RemoteOrgSignupFailed', [
        messages.getMessage('signupFailedAction', [orgInfo.ErrorCode]),
      ]);
    }
    throw new SfdxError(messages.getMessage('signupFailed', [orgInfo.ErrorCode]));
  }
  if (orgInfo.Status === 'Error') {
    // Maybe the request object can help the user somehow
    logger.error('No error code on signup error! Logging request.');
    logger.error(orgInfo);
    throw new SfdxError(messages.getMessage('signupFailedUnknown', [orgInfo.Id, hubUsername]), 'signupFailedUnknown');
  }
  throw new SfdxError(messages.getMessage('signupUnexpected'), 'UnexpectedSignupStatus');
};
