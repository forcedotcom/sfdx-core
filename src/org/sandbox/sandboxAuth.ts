/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Duration } from '@salesforce/kit';
import { Logger } from '../../logger';
import { Connection } from '../connection';
import { AuthFields, AuthInfo } from '../authInfo';
import { WebOAuthServer } from '../../webOAuthServer';
import { Messages } from '../../messages';
import { Lifecycle } from '../../lifecycleEvents';
import { StateAggregator } from '../../stateAggregator';
import { PollingClient, SfError } from '../../exported';
import { StatusResult } from '../../status/types';
import {
  SandboxProcessObject,
  SandboxUserAuthResponse,
  SandboxFields,
  SandboxEvents,
  ResultEvent,
  StatusEvent,
} from './types';
import {
  queryLatestSandboxProcessBySandboxName,
  querySandboxProcessBySandboxInfoId,
  sandboxSignupComplete,
} from './sandboxProcessQueries';
import { validateWaitOptions } from './waitValidation';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'org');

type SanboxAuthInputs = {
  sandboxProcessObj: SandboxProcessObject;
  conn: Connection;
  prodOrgUsername: string;
};

type SandboxAuthPollingInputs = {
  wait: Duration;
  interval: Duration;
};

export const writeSandboxAuthFile = async ({
  prodOrgUsername,
  conn,
  sandboxProcessObj,
  sandboxRes,
}: SanboxAuthInputs & {
  sandboxRes: SandboxUserAuthResponse;
}): Promise<void> => {
  const logger = Logger.childFromRoot('writeSandboxAuthFile');
  logger.debug(
    `writeSandboxAuthFile sandboxProcessObj: ${JSON.stringify(sandboxProcessObj)}, sandboxRes: ${JSON.stringify(
      sandboxRes
    )}`
  );
  if (sandboxRes.authUserName) {
    const productionAuthFields = conn.getAuthInfoFields();
    logger.debug('Result from getAuthInfoFields: AuthFields', productionAuthFields);

    // let's do headless auth via jwt (if we have privateKey) or web auth
    const oauth2Options: AuthFields & {
      redirectUri?: string;
    } = {
      loginUrl: sandboxRes.loginUrl,
      instanceUrl: sandboxRes.instanceUrl,
      username: sandboxRes.authUserName,
    };

    // If we don't have a privateKey then we assume it's web auth.
    if (!productionAuthFields.privateKey) {
      oauth2Options.redirectUri = `http://localhost:${await WebOAuthServer.determineOauthPort()}/OauthRedirect`;
      oauth2Options.authCode = sandboxRes.authCode;
    } else {
      oauth2Options.privateKey = productionAuthFields.privateKey;
      oauth2Options.clientId = productionAuthFields.clientId;
    }

    const authInfo = await AuthInfo.create({
      username: sandboxRes.authUserName,
      oauth2Options,
      parentUsername: productionAuthFields.username,
    });

    logger.debug(
      'Creating AuthInfo for sandbox',
      sandboxRes.authUserName,
      productionAuthFields.username,
      oauth2Options
    );
    // save auth info for new sandbox
    await authInfo.save();

    const sandboxOrgId = authInfo.getFields().orgId as string;

    if (!sandboxOrgId) {
      throw messages.createError('AuthInfoOrgIdUndefined');
    }
    // set the sandbox config value
    const sfSandbox = {
      sandboxUsername: sandboxRes.authUserName,
      sandboxOrgId,
      prodOrgUsername,
      sandboxName: sandboxProcessObj.SandboxName,
      sandboxProcessId: sandboxProcessObj.Id,
      sandboxInfoId: sandboxProcessObj.SandboxInfoId,
      timestamp: new Date().toISOString(),
    } as SandboxFields;
    const stateAggregator = await StateAggregator.getInstance();
    stateAggregator.sandboxes.set(sandboxOrgId, sfSandbox);
    await stateAggregator.sandboxes.write(sandboxOrgId);

    await Lifecycle.getInstance().emit(SandboxEvents.EVENT_RESULT, {
      sandboxProcessObj,
      sandboxRes,
    } as ResultEvent);
  } else {
    // no authed sandbox user, error
    throw messages.createError('missingAuthUsername', [sandboxProcessObj.SandboxName]);
  }
};

export const pollStatusAndAuth = async ({
  conn,
  sandboxProcessObj,
  wait,
  pollInterval,
  prodOrgUsername,
}: SanboxAuthInputs & {
  wait: Duration;
  pollInterval: Duration;
}): Promise<SandboxProcessObject> => {
  const logger = Logger.childFromRoot('org:sandbox:pollStatusAndAuth');
  logger.debug(
    'PollStatusAndAuth called with SandboxProcessObject',
    sandboxProcessObj,
    wait.minutes,
    pollInterval.seconds
  );
  let remainingWait = wait;
  let waitingOnAuth = false;
  const pollingClient = await PollingClient.create({
    poll: async (): Promise<StatusResult> => {
      const updatedSandboxProcessObj = await querySandboxProcessBySandboxInfoId(conn, sandboxProcessObj.SandboxInfoId);
      // check to see if sandbox can authenticate via sandboxAuth endpoint
      const sandboxInfo = await sandboxSignupComplete({ sandboxProcessObj: updatedSandboxProcessObj, conn });
      if (sandboxInfo) {
        await Lifecycle.getInstance().emit(SandboxEvents.EVENT_AUTH, sandboxInfo);
        try {
          logger.debug('sandbox signup complete with', sandboxInfo);
          await writeSandboxAuthFile({
            sandboxProcessObj,
            sandboxRes: sandboxInfo,
            conn,
            prodOrgUsername,
          });
          return { completed: true, payload: sandboxProcessObj };
        } catch (err) {
          const error = err as Error;
          logger.debug('Exception while calling writeSandboxAuthFile', err);
          if (error?.name === 'JwtAuthError' && error?.stack?.includes("user hasn't approved")) {
            waitingOnAuth = true;
          } else {
            throw SfError.wrap(error);
          }
        }
      }

      await Lifecycle.getInstance().emit(SandboxEvents.EVENT_STATUS, {
        sandboxProcessObj,
        remainingWait: remainingWait.seconds,
        interval: pollInterval.seconds,
        waitingOnAuth,
      } as StatusEvent);
      remainingWait = Duration.seconds(remainingWait.seconds - pollInterval.seconds);
      return { completed: false, payload: sandboxProcessObj };
    },
    frequency: pollInterval,
    timeout: wait,
  });

  return pollingClient.subscribe<SandboxProcessObject>();
};

/**
 * Gets the sandboxProcessObject and then polls for it to complete.
 *
 * @param sandboxProcessName sanbox process name
 * @param options { wait?: Duration; interval?: Duration }
 * @returns {SandboxProcessObject} The SandboxProcessObject for the sandbox
 */
export const authWithRetriesByName = async ({
  conn,
  prodOrgUsername,
  sandboxProcessName,
  wait,
  interval,
}: {
  conn: Connection;
  prodOrgUsername: string;
  sandboxProcessName: string;
} & Partial<SandboxAuthPollingInputs>): Promise<SandboxProcessObject> => {
  const [validatedWait, pollInterval] = validateWaitOptions({ wait, interval });

  return pollStatusAndAuth({
    conn,
    prodOrgUsername,
    sandboxProcessObj: await queryLatestSandboxProcessBySandboxName(conn, sandboxProcessName),
    wait: validatedWait,
    pollInterval,
  });
};
