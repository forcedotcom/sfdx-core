/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { env, Duration, upperFirst } from '@salesforce/kit';
import { AnyJson, getString } from '@salesforce/ts-types';
// @ts-ignore
import { OAuth2Config, OAuth2Options, SaveResult } from 'jsforce';
import { retryDecorator, RetryError } from 'ts-retry-promise';
import { Logger } from '../logger';
import mapKeys from '../util/mapKeys';
import { Messages } from '../messages';
import { SfError } from '../sfError';
import { SfdcUrl } from '../util/sfdcUrl';
import { StatusResult } from '../status/types';
import { PollingClient } from '../status/pollingClient';
import { MyDomainResolver } from '../status/myDomainResolver';
import { Lifecycle } from '../lifecycleEvents';
import { AuthInfo } from './authInfo';
import { Org } from './org';
import { checkScratchOrgInfoForErrors } from './scratchOrgErrorCodes';
import SettingsGenerator from './scratchOrgSettingsGenerator';
import { ScratchOrgInfo } from './scratchOrgTypes';
import { emit } from './scratchOrgLifecycleEvents';
export interface JsForceError extends Error {
  errorCode: string;
  fields: string[];
}

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'scratchOrgInfoApi');
const errorCodes = Messages.load('@salesforce/core', 'scratchOrgErrorCodes', ['C-1007']);

/**
 * Returns the url to be used to authorize into the new scratch org
 *
 * @param scratchOrgInfoComplete The completed ScratchOrgInfo
 * @param hubOrgLoginUrl the hun org login url
 * @param signupTargetLoginUrlConfig the login url
 * @returns {string}
 */
const getOrgInstanceAuthority = function (
  scratchOrgInfoComplete: ScratchOrgInfo,
  hubOrgLoginUrl: string,
  signupTargetLoginUrlConfig?: string
) {
  const createdOrgInstance = scratchOrgInfoComplete.SignupInstance;

  if (createdOrgInstance === 'utf8') {
    return hubOrgLoginUrl;
  }
  let altUrl;
  // For non-Falcon (ie - instance names not ending in -s) sandboxes, use the instance URL
  if (createdOrgInstance && !createdOrgInstance.toLowerCase().endsWith('s')) {
    altUrl = `https://${createdOrgInstance}.salesforce.com`;
  } else {
    // For Falcon sandboxes, try the LoginURL instead; createdOrgInstance will not yield a valid URL
    altUrl = scratchOrgInfoComplete.LoginUrl;
  }

  return signupTargetLoginUrlConfig ?? altUrl;
};

/**
 * Returns OAuth2Options object
 *
 * @returns {OAuth2Options, number, number, number} options, retries, timeout, delay
 * @param options
 */
const buildOAuth2Options = async (options: {
  hubOrg: Org;
  scratchOrgInfoComplete: ScratchOrgInfo;
  clientSecret?: string;
  retry?: number;
  signupTargetLoginUrlConfig?: string;
}): Promise<{
  options: OAuth2Config;
  retries: number;
  timeout?: number;
  delay?: number;
}> => {
  const logger = await Logger.child('buildOAuth2Options');
  const isJwtFlow = !!options.hubOrg.getConnection().getAuthInfoFields().privateKey;
  const oauth2Options: OAuth2Options = {
    loginUrl: getOrgInstanceAuthority(
      options.scratchOrgInfoComplete,
      options.hubOrg.getField(Org.Fields.LOGIN_URL),
      options.signupTargetLoginUrlConfig
    ),
  };

  logger.debug(`isJwtFlow: ${isJwtFlow}`);

  if (isJwtFlow && !process.env.SFDX_CLIENT_SECRET) {
    oauth2Options.privateKeyFile = options.hubOrg.getConnection().getAuthInfoFields().privateKey;
    const retries = options?.retry || env.getNumber('SFDX_JWT_AUTH_RETRY_ATTEMPTS') || 0;
    const timeoutInSeconds = env.getNumber('SFDX_JWT_AUTH_RETRY_TIMEOUT') || 300;
    const timeout = Duration.seconds(timeoutInSeconds).milliseconds;
    const delay = retries ? timeout / retries : 1000;
    return {
      options: oauth2Options,
      retries,
      timeout,
      delay,
    };
  } else {
    // Web Server OAuth "auth code exchange" flow
    if (process.env.SFDX_CLIENT_SECRET) {
      oauth2Options.clientSecret = process.env.SFDX_CLIENT_SECRET;
    } else if (options.clientSecret) {
      oauth2Options.clientSecret = options.clientSecret;
    }
    oauth2Options.redirectUri = options.scratchOrgInfoComplete.ConnectedAppCallbackUrl;
    oauth2Options.authCode = options.scratchOrgInfoComplete.AuthCode;
    return {
      options: oauth2Options,
      retries: 0,
    };
  }
};

/**
 * Returns OAuth2Options object
 *
 * hubOrg the environment hub org
 * username The OAuth client secret. May be null for JWT OAuth flow.
 * oauth2Options The completed ScratchOrgInfo which should contain an access token.
 * retries auth retry a
 * timeout the login url
 * delay the login url
 *
 * @returns {OAuth2Options, number, number, number} options, retries, timeout, delay
 */
const getAuthInfo = async (options: {
  hubOrg: Org;
  username: string;
  oauth2Options: OAuth2Config;
  retries: number;
  timeout?: number;
  delay?: number;
}): Promise<AuthInfo> => {
  const logger = await Logger.child('getAuthInfo');

  const retryAuthorize = retryDecorator(async (opts: AuthInfo.Options): Promise<AuthInfo> => AuthInfo.create(opts), {
    timeout: options.timeout,
    delay: options.delay,
    retries: options.retries,
  });

  if (options.retries) {
    try {
      return await retryAuthorize({
        username: options.username,
        parentUsername: options.hubOrg.getUsername(),
        oauth2Options: options.oauth2Options,
      });
    } catch (err) {
      const error = err as RetryError;
      logger.error(error);
      throw error.lastError || error;
    }
  } else {
    return AuthInfo.create({
      username: options.username,
      parentUsername: options.hubOrg.getUsername(),
      oauth2Options: options.oauth2Options,
    });
  }
};

/**
 *
 * @param hubOrg Org
 * @param id Record ID for the ScratchOrgInfoObject
 * @returns Promise<ScratchOrgInfo>
 */
export const queryScratchOrgInfo = async (hubOrg: Org, id: string): Promise<ScratchOrgInfo> => {
  return (await hubOrg.getConnection().sobject('ScratchOrgInfo').retrieve(id)) as unknown as ScratchOrgInfo;
};

/**
 * after we successfully signup an org we need to trade the auth token for access and refresh token.
 *
 * scratchOrgInfoComplete - The completed ScratchOrgInfo which should contain an access token.
 * hubOrg - the environment hub org
 * clientSecret - The OAuth client secret. May be null for JWT OAuth flow.
 * signupTargetLoginUrlConfig - Login url
 * retry - auth retry attempts
 *
 * @returns {Promise<AuthInfo>}
 */
export const authorizeScratchOrg = async (options: {
  scratchOrgInfoComplete: ScratchOrgInfo;
  hubOrg: Org;
  clientSecret?: string;
  signupTargetLoginUrlConfig?: string;
  retry?: number;
}): Promise<AuthInfo> => {
  const { scratchOrgInfoComplete, hubOrg, clientSecret, signupTargetLoginUrlConfig, retry } = options;
  await emit({ stage: 'authenticate', scratchOrgInfo: scratchOrgInfoComplete });
  const logger = await Logger.child('authorizeScratchOrg');
  logger.debug(`scratchOrgInfoComplete: ${JSON.stringify(scratchOrgInfoComplete, null, 4)}`);

  // if we didn't have it marked as a devhub but just successfully used it as one, this will update the authFile, fix cache, etc
  if (!hubOrg.isDevHubOrg()) {
    await hubOrg.determineIfDevHubOrg(true);
  }

  const oAuth2Options = await buildOAuth2Options({
    hubOrg,
    clientSecret,
    scratchOrgInfoComplete,
    retry,
    signupTargetLoginUrlConfig,
  });

  const authInfo = await getAuthInfo({
    hubOrg,
    username: scratchOrgInfoComplete.SignupUsername,
    oauth2Options: oAuth2Options.options,
    retries: oAuth2Options.retries,
    timeout: oAuth2Options.timeout,
    delay: oAuth2Options.delay,
  });

  await authInfo.save({
    devHubUsername: hubOrg.getUsername(),
    created: new Date(scratchOrgInfoComplete.CreatedDate ?? new Date()).valueOf().toString(),
    expirationDate: scratchOrgInfoComplete.ExpirationDate,
    clientId: scratchOrgInfoComplete.ConnectedAppConsumerKey,
    createdOrgInstance: scratchOrgInfoComplete.SignupInstance,
    isDevHub: false,
    snapshot: scratchOrgInfoComplete.Snapshot,
  });

  return authInfo;
};

const checkOrgDoesntExist = async (scratchOrgInfo: Record<string, unknown>): Promise<void> => {
  const usernameKey = Object.keys(scratchOrgInfo).find((key: string) => key.toUpperCase() === 'USERNAME');
  if (!usernameKey) {
    return;
  }

  const username = getString(scratchOrgInfo, usernameKey);

  if (username && username.length > 0) {
    try {
      await AuthInfo.create({ username: username.toLowerCase() });
    } catch (error) {
      const sfError = SfError.wrap(error as Error);
      // if an AuthInfo couldn't be created that means no AuthFile exists.
      if (sfError.name === 'NamedOrgNotFound') {
        return;
      }
      // Something unexpected
      throw sfError;
    }
    // An org file already exists
    throw errorCodes.createError('C-1007');
  }
};

/**
 * This extracts orgPrefs/settings from the user input and performs a basic scratchOrgInfo request.
 *
 * @param hubOrg - the environment hub org
 * @param scratchOrgRequest - An object containing the fields of the ScratchOrgInfo
 * @param settings - An object containing org settings
 * @returns {Promise<SaveResult>}
 */
export const requestScratchOrgCreation = async (
  hubOrg: Org,
  scratchOrgRequest: ScratchOrgInfo,
  settings: SettingsGenerator
): Promise<SaveResult> => {
  // If these were present, they were already used to initialize the scratchOrgSettingsGenerator.
  // They shouldn't be submitted as part of the scratchOrgInfo.
  delete scratchOrgRequest.settings;
  delete scratchOrgRequest.objectSettings;

  // We do not allow you to specify the old and the new way of doing post create settings
  if (scratchOrgRequest.orgPreferences && settings.hasSettings()) {
    // This is not allowed
    throw new SfError('SignupDuplicateSettingsSpecifiedError');
  }

  // deprecated old style orgPreferences
  if (scratchOrgRequest.orgPreferences) {
    throw new SfError(messages.getMessage('DeprecatedPrefFormat'));
  }

  const scratchOrgInfo = mapKeys(scratchOrgRequest, upperFirst, true);

  await checkOrgDoesntExist(scratchOrgInfo); // throw if it does exist.
  try {
    await emit({ stage: 'send request' });
    // return await will cause this catch block to run instead of the caller's catch block
    return await hubOrg.getConnection().sobject('ScratchOrgInfo').create(scratchOrgInfo);
  } catch (error) {
    // this is a jsforce error which contains the property "fields" which regular error don't
    const jsForceError = error as JsForceError;
    if (jsForceError.errorCode === 'REQUIRED_FIELD_MISSING') {
      throw new SfError(messages.getMessage('SignupFieldsMissingError', [jsForceError.fields.toString()]));
    }
    throw SfError.wrap(jsForceError);
  }
};

/**
 * This retrieves the ScratchOrgInfo, polling until the status is Active or Error
 *
 * @param hubOrg
 * @param scratchOrgInfoId - the id of the scratchOrgInfo that we are retrieving
 * @param timeout - A Duration object
 * @returns {Promise<ScratchOrgInfo>}
 */
export const pollForScratchOrgInfo = async (
  hubOrg: Org,
  scratchOrgInfoId: string,
  // org:create specifies a default timeout of 6.  This longer default is for other consumers
  timeout: Duration = Duration.minutes(15)
): Promise<ScratchOrgInfo> => {
  const logger = await Logger.child('scratchOrgInfoApi-pollForScratchOrgInfo');
  logger.debug(`PollingTimeout in minutes: ${timeout.minutes}`);

  const pollingOptions: PollingClient.Options = {
    async poll(): Promise<StatusResult> {
      try {
        const resultInProgress = await queryScratchOrgInfo(hubOrg, scratchOrgInfoId);
        logger.debug(`polling client result: ${JSON.stringify(resultInProgress, null, 4)}`);
        // Once it's "done" we can return it
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
        logger.debug(`An error occurred trying to retrieve scratchOrgInfo for ${scratchOrgInfoId}`);
        logger.debug(`Error: ${(error as Error).message}`);
        logger.debug('Re-trying deploy check again....');
        return {
          completed: false,
        };
      }
    },
    timeout,
    frequency: Duration.seconds(1),
    timeoutErrorName: 'ScratchOrgInfoTimeoutError',
  };

  const client = await PollingClient.create(pollingOptions);
  try {
    const resultInProgress = await client.subscribe<ScratchOrgInfo>();
    return checkScratchOrgInfoForErrors(resultInProgress, hubOrg.getUsername());
  } catch (error) {
    if (error instanceof Error) {
      const sfError = SfError.wrap(error);
      sfError.setData({
        username: hubOrg.getUsername(),
        orgId: hubOrg.getOrgId(),
        scratchOrgInfoId,
      });
      throw sfError;
    }
    throw new SfError(`The scratch org did not complete within ${timeout.minutes} minutes`, 'orgCreationTimeout', [
      'Try your force:org:create command again with a longer --wait value',
    ]);
  }
};

/**
 * Deploy settings to the newly created scratch org
 *
 * @param scratchOrg an instance of the Org class
 * @param orgSettings an instance of the SettingsGenerator class
 * @param apiVersion the api version (used when created the package.xml)
 */
export const deploySettings = async (
  scratchOrg: Org,
  orgSettings: SettingsGenerator,
  apiVersion: string
): Promise<void> => {
  const logger = await Logger.child('scratchOrgInfoApi-deploySettings');
  if (orgSettings.hasSettings()) {
    // deploy the settings to the newly created scratch org
    logger.debug(`deploying scratch org settings with apiVersion ${apiVersion}`);

    try {
      await orgSettings.createDeploy();
      await orgSettings.deploySettingsViaFolder(scratchOrg, apiVersion);
      // updating the revision num to zero during org:creation if source members are created during org:create.
      // This only happens for some specific scratch org definition file.
      await updateRevisionCounterToZero(scratchOrg);
      logger.trace('Settings deployed to org');
    } catch (error) {
      throw SfError.wrap(error as Error);
    }
  }
};

/**
 *
 * @param scratchOrgAuthInfo an AuthInfo class from the scratch org
 * @returns AuthInfo
 */
export const resolveUrl = async (scratchOrgAuthInfo: AuthInfo): Promise<AuthInfo> => {
  const logger = await Logger.child('scratchOrgInfoApi-resolveUrl');
  const { instanceUrl } = scratchOrgAuthInfo.getFields();
  if (!instanceUrl) {
    const sfError = new SfError('Org does not have instanceUrl');
    sfError.setData({
      orgId: scratchOrgAuthInfo.getFields().orgId,
      username: scratchOrgAuthInfo.getFields().username,
      instanceUrl,
    });
    throw sfError;
  }
  logger.debug(`processScratchOrgInfoResult - resultData.instanceUrl: ${instanceUrl}`);
  const options = {
    timeout: Duration.minutes(3),
    frequency: Duration.seconds(10),
    url: new SfdcUrl(instanceUrl),
  };
  try {
    const resolver = await MyDomainResolver.create(options);
    await resolver.resolve();
    return scratchOrgAuthInfo;
  } catch (error) {
    const sfError = SfError.wrap(error as Error);
    logger.debug('processScratchOrgInfoResult - err: %s', error);
    if (sfError.name === 'MyDomainResolverTimeoutError') {
      sfError.setData({
        orgId: scratchOrgAuthInfo.getFields().orgId,
        username: scratchOrgAuthInfo.getFields().username,
        instanceUrl,
      });
      logger.debug('processScratchOrgInfoResult - err data: %s', sfError.data);
    }
    throw sfError;
  }
};

export const updateRevisionCounterToZero = async (scratchOrg: Org): Promise<void> => {
  const conn = scratchOrg.getConnection();
  const queryResult = await conn.tooling.sobject('SourceMember').find({ RevisionCounter: { $gt: 0 } }, ['Id']);
  if (queryResult.length === 0) {
    return;
  }
  try {
    await conn.tooling
      .sobject('SourceMember')
      .update(queryResult.map((record) => ({ Id: record.Id, RevisionCounter: 0 })));
  } catch (err) {
    await Lifecycle.getInstance().emitWarning(
      messages.getMessage('SourceStatusResetFailureError', [scratchOrg.getOrgId(), scratchOrg.getUsername()])
    );
  }
};
