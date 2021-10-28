/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Node
import * as fs from 'fs';

// @salesforce
import { Optional } from '@salesforce/ts-types';
import { env, Duration, upperFirst } from '@salesforce/kit';
import { ensureString, getString } from '@salesforce/ts-types';

// Thirdparty
import { RecordResult, OAuth2Options } from 'jsforce';
import { retry, retryDecorator, RetryError } from 'ts-retry-promise';

// Local
import { Org } from './org';
import { Logger } from './logger';
import mapKeys from './util/mapKeys';
import { AuthInfo } from './authInfo';
import { Messages } from './messages';
import { SfdxError } from './sfdxError';
import { SfdcUrl } from './util/sfdcUrl';
import { MyDomainResolver } from './status/myDomainResolver';

import SettingsGenerator from './scratchOrgSettingsGenerator';

export interface ScratchOrgInfo {
  AdminEmail?: string;
  readonly CreatedDate?: string;
  ConnectedAppCallbackUrl?: string;
  ConnectedAppConsumerKey?: string;
  Country?: string;
  Description?: string;
  DurationDays?: string;
  Edition?: string;
  readonly ErrorCode?: string;
  readonly ExpirationDate?: string;
  Features?: string;
  HasSampleData?: boolean;
  readonly Id?: string;
  Language?: string;
  LoginUrl: string;
  readonly Name?: string;
  Namespace?: string;
  OrgName?: string;
  Release?: 'Current' | 'Previous' | 'Preview';
  readonly ScratchOrg?: string;
  SourceOrg?: string;
  readonly AuthCode: string;
  Snapshot: string;
  readonly Status: 'New' | 'Creating' | 'Active' | 'Error' | 'Deleted';
  readonly SignupEmail: string;
  readonly SignupUsername: string;
  readonly SignupInstance: string;
  Username: string;
  settings: Optional<Record<string, unknown>>;
  objectSettings: Optional<Record<string, unknown>>;
  orgPreferences: Optional<{
    enabled: string[];
    disabled: string[];
  }>;
}

export interface JsForceError extends Error {
  errorCode: string;
  fields: string[];
}

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'scratchOrgInfoApi');

const checkScratchOrgInfoForErrors = (orgInfo: ScratchOrgInfo, hubUsername: Optional<string>, logger: Logger) => {
  if (orgInfo.Status === 'Active') {
    return orgInfo;
  }
  if (orgInfo.Status === 'Error' && orgInfo.ErrorCode) {
    throw new SfdxError(messages.getMessage('signupFailed', [orgInfo.ErrorCode]), 'RemoteOrgSignupFailed');
  }
  if (orgInfo.Status === 'Error') {
    // Maybe the request object can help the user somehow
    logger.error('No error code on signup error! Logging request.');
    logger.error(orgInfo);
    throw new SfdxError(messages.getMessage('signupFailedUnknown', [orgInfo.Id, hubUsername]));
  }
  throw new SfdxError(messages.getMessage('signupUnexpected'), 'UnexpectedSignupStatus');
};
/**
 * Returns the url to be used to authorize into the new scratch org
 *
 * @param scratchOrgInfoComplete
 * @param force
 * @param useLoginUrl
 * @returns {*}
 * @private
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

const buildOAuth2Options = async (options: {
  hubOrg: Org;
  clientSecret: string;
  scratchOrgInfoComplete: ScratchOrgInfo;
  retry?: number;
  signupTargetLoginUrlConfig?: string;
}): Promise<{
  options: OAuth2Options;
  retries: number;
  timeout?: number;
  delay?: number;
}> => {
  const logger = await Logger.child('buildOAuth2Options');
  const isJwtFlow = !!options.hubOrg.getConnection().getAuthInfoFields().privateKey;
  const oauth2Options: OAuth2Options = {
    loginUrl: getOrgInstanceAuthority(
      options.scratchOrgInfoComplete,
      options.hubOrg.getField(Org.Fields.LOGIN_URL) as string,
      options.signupTargetLoginUrlConfig
    ),
  };

  logger.debug(`_authorize - isJwtFlow: ${isJwtFlow}`);

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

const getAuthInfo = async (options: {
  hubOrg: Org;
  username: string;
  oauth2Options: OAuth2Options;
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
      if (error.message.startsWith('Timeout after')) {
        throw SfdxError.create('salesforce-alm', 'org_create', 'jwtAuthRetryTimedOut', [
          options.username,
          options.timeout,
          options.retries,
        ]);
      }
      throw error.lastError || error;
    }
  } else {
    try {
      return await AuthInfo.create({
        username: options.username,
        parentUsername: options.hubOrg.getUsername(),
        oauth2Options: options.oauth2Options,
      });
    } catch (error) {
      throw SfdxError.wrap(error as Error);
    }
  }
};

const saveAuthInfo = async (options: {
  scratchOrgInfoComplete: ScratchOrgInfo;
  hubOrg: Org;
  authInfo: AuthInfo;
  setAsDefault: boolean;
  alias?: string;
}): Promise<void> => {
  const logger = await Logger.child('saveAuthInfo');

  await options.authInfo.save({
    devHubUsername: options.hubOrg.getUsername(),
    created: new Date(options.scratchOrgInfoComplete.CreatedDate ?? new Date()).valueOf().toString(),
    expirationDate: options.scratchOrgInfoComplete.ExpirationDate,
    clientId: options.scratchOrgInfoComplete.ConnectedAppConsumerKey,
    createdOrgInstance: options.scratchOrgInfoComplete.SignupInstance,
    isDevHub: false,
    snapshot: options.scratchOrgInfoComplete.Snapshot,
  });

  if (options.alias) {
    logger.debug(`_authorize - setting alias to ${options.alias}`);
    await options.authInfo.setAlias(options.alias);
    logger.debug(`_authorize - AuthInfo has alias to ${options.authInfo.getFields().alias}`);
  }
  if (options.setAsDefault) {
    await options.authInfo.setAsDefault({ defaultUsername: true });
  }

  logger.debug(`_authorize - orgConfig.loginUrl: ${options.authInfo.getFields().loginUrl}`);
  logger.debug(`_authorize - orgConfig.instanceUrl: ${options.authInfo.getFields().instanceUrl}`);
};

/**
 * after we successfully signup an org we need to trade the auth token for access and refresh token.
 *
 * @param scratchOrgInfoComplete - The completed ScratchOrgInfo which should contain an access token.
 * @param force - the force api
 * @param hubOrg - the environment hub org
 * @param scratchOrg - the scratch org to save to disk
 * @param clientSecret - The OAuth client secret. May be null for JWT OAuth flow.
 * @param saveAsDefault {boolean} - whether to save this org as the default for this workspace.
 * @returns {*}
 * @private
 */
export const authorizeScratchOrg = async (options: {
  scratchOrgInfoComplete: ScratchOrgInfo;
  hubOrg: Org;
  clientSecret: string;
  setAsDefault: boolean;
  signupTargetLoginUrlConfig?: string;
  alias?: string;
  retry?: number;
}): Promise<AuthInfo> => {
  const { scratchOrgInfoComplete, hubOrg, clientSecret, setAsDefault, signupTargetLoginUrlConfig, alias } = options;
  const logger = await Logger.child('authorizeScratchOrg');
  logger.debug(`_authorize - scratchOrgInfoComplete: ${JSON.stringify(scratchOrgInfoComplete, null, 4)}`);

  // if we didn't have it marked as a devhub but just successfully used it as one, this will update the authFile, fix cache, etc
  if (!hubOrg.isDevHubOrg()) {
    await hubOrg.determineIfDevHubOrg(true);
  }

  const oAuth2Options = await buildOAuth2Options({
    hubOrg,
    clientSecret,
    scratchOrgInfoComplete,
    retry: options?.retry,
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

  await saveAuthInfo({
    scratchOrgInfoComplete,
    hubOrg,
    authInfo,
    setAsDefault,
    alias,
  });

  return authInfo;
};

const checkOrgDoesntExist = async (scratchOrgInfo: Record<string, unknown>): Promise<void> => {
  const usernameKey = Object.keys(scratchOrgInfo).find((key: string) =>
    key ? key.toUpperCase() === 'USERNAME' : false
  );
  if (!usernameKey) {
    return;
  }

  const username = getString(scratchOrgInfo, usernameKey);

  if (username && username.length > 0) {
    try {
      await AuthInfo.create({ username: username.toLowerCase() });
    } catch (error) {
      const sfdxError = SfdxError.wrap(error as Error);
      // if an AuthInfo couldn't be created that means no AuthFile exists.
      if (sfdxError.name === 'NamedOrgNotFound') {
        return;
      }
      // Something unexpected
      throw error;
    }
    // An org file already exists
    throw SfdxError.create('scratchOrgInfoApi', 'signup', 'C-1007');
  }
};

/**
 * This extracts orgPrefs/settings from the user input and performs a basic scratchOrgInfo request.
 *
 * @param scratchOrgInfo - An object containing the fields of the ScratchOrgInfo.
 * @returns {*|promise}
 */
export const requestScratchOrgCreation = async (
  hubOrg: Org,
  scratchOrgRequest: ScratchOrgInfo,
  settings: SettingsGenerator
): Promise<RecordResult> => {
  // If these were present, they were already used to initialize the scratchOrgSettingsGenerator.
  // They shouldn't be submitted as part of the scratchOrgInfo.
  delete scratchOrgRequest.settings;
  delete scratchOrgRequest.objectSettings;

  // We do not allow you to specify the old and the new way of doing post create settings
  if (scratchOrgRequest.orgPreferences && settings.hasSettings()) {
    // This is not allowed
    throw new SfdxError('signupDuplicateSettingsSpecified');
  }

  // deprecated old style orgPreferences
  if (scratchOrgRequest.orgPreferences) {
    throw new SfdxError(messages.getMessage('deprecatedPrefFormat'));
  }

  const scratchOrgInfo = mapKeys(scratchOrgRequest, upperFirst, true);

  await checkOrgDoesntExist(scratchOrgInfo); // throw if it does exists.
  try {
    return await hubOrg.getConnection().sobject('ScratchOrgInfo').create(scratchOrgInfo);
  } catch (error) {
    const jsForceError = error as JsForceError;
    if (jsForceError.errorCode === 'REQUIRED_FIELD_MISSING') {
      throw new SfdxError(messages.getMessage('signupFieldsMissing', [jsForceError.fields.toString()]));
    }
    throw jsForceError;
  }
};

/**
 * This retrieves the ScratchOrgInfo, polling until the status is Active or Error
 *
 * @param hubOrg
 * @param scratchOrgInfoId - the id of the scratchOrgInfo that we are retrieving
 * @param timeout - A Duration object
 * @returns {BBPromise}
 */
export const pollForScratchOrgInfo = async (
  hubOrg: Org,
  scratchOrgInfoId: string,
  // org:create specifies a default timeout of 6.  This longer default is for other consumers
  timeout: Duration = Duration.minutes(15)
): Promise<ScratchOrgInfo> => {
  const logger = await Logger.child('scratchOrgInfoApi-pollForScratchOrgInfo');
  logger.debug(`PollingTimeout in minutes: ${timeout.minutes}`);
  logger.debug(`pollForScratchOrgInfo this.scratchOrgInfoId: ${scratchOrgInfoId} from devHub ${hubOrg.getUsername()}`);

  const response = await retry(
    async () => {
      const resultInProgress = await hubOrg
        .getConnection()
        .sobject<ScratchOrgInfo>('ScratchOrgInfo')
        .retrieve(scratchOrgInfoId);
      logger.debug(`polling client result: ${JSON.stringify(resultInProgress, null, 4)}`);
      // Once it's "done" we can return it
      if (resultInProgress.Status === 'Active' || resultInProgress.Status === 'Error') {
        return resultInProgress;
      }
      // all other statuses, OR lack of status (e.g. network errors) will cause a retry
      throw new Error(`Scratch org status is ${resultInProgress.Status}`);
    },
    {
      retries: 'INFINITELY',
      timeout: timeout.milliseconds,
      delay: Duration.seconds(2).milliseconds,
      backoff: 'LINEAR',
      maxBackOff: Duration.seconds(30).milliseconds,
    }
  ).catch(() => {
    throw new SfdxError(`The scratch org did not complete within ${timeout.minutes} minutes`, 'orgCreationTimeout', [
      'Try your force:org:create command again with a longer --wait value',
    ]);
  });
  return checkScratchOrgInfoForErrors(response, hubOrg.getUsername(), logger);
};

/**
 * This authenticates into the newly created org and sets org preferences
 *
 * @param scratchOrgInfoResult - an object containing the fields of the ScratchOrgInfo
 * @param clientSecret - the OAuth client secret. May be null for JWT OAuth flow
 * @param scratchOrg - The ScratchOrg configuration
 * @param saveAsDefault - Save the org as the default for commands to run against
 * @returns {*}
 */
export const deploySettingsAndResolveUrl = async (
  scratchOrgAuthInfo: AuthInfo,
  apiVersion: string,
  orgSettings: SettingsGenerator
): Promise<Optional<AuthInfo>> => {
  const logger = await Logger.child('scratchOrgInfoApi-deploySettingsAndResolveUrl');

  if (orgSettings.hasSettings()) {
    // deploy the settings to the newly created scratch org
    logger.debug(`deploying scratch org settings with apiVersion ${apiVersion}`);

    let deployDir;
    try {
      deployDir = await orgSettings.createDeployDir();
      await orgSettings.deploySettingsViaFolder(ensureString(scratchOrgAuthInfo.getUsername()), deployDir);
    } finally {
      // delete the deploy dir
      if (deployDir && fs.existsSync(deployDir)) {
        try {
          fs.rmdirSync(deployDir, { recursive: true });
        } catch (error) {
          const sfdxError = SfdxError.wrap(error as Error);
          logger.debug(`Error when trying to clean up settings deploy dir: ${deployDir}. ${sfdxError?.message}`);
        }
      }
    }
  }
  if (scratchOrgAuthInfo.getFields().instanceUrl) {
    logger.debug(
      `processScratchOrgInfoResult - resultData.instanceUrl: ${JSON.stringify(
        scratchOrgAuthInfo.getFields().instanceUrl
      )}`
    );
    const options = {
      timeout: Duration.minutes(3),
      frequency: Duration.seconds(10),
      url: new SfdcUrl(ensureString(scratchOrgAuthInfo.getFields().instanceUrl)),
    };
    try {
      const resolver = await MyDomainResolver.create(options);
      await resolver.resolve();
    } catch (error) {
      const sfdxError = SfdxError.wrap(error as Error);
      logger.debug(`processScratchOrgInfoResult - err: ${JSON.stringify(error, null, 4)}`);
      if (sfdxError.name === 'MyDomainResolverTimeoutError') {
        sfdxError.setData({
          orgId: scratchOrgAuthInfo.getFields().orgId,
          username: scratchOrgAuthInfo.getFields().username,
          instanceUrl: scratchOrgAuthInfo.getFields().instanceUrl,
        });
        logger.debug(`processScratchOrgInfoResult - err data: ${JSON.stringify(sfdxError.data, null, 4)}`);
      }
      throw sfdxError;
    }

    return scratchOrgAuthInfo;
  }
};
