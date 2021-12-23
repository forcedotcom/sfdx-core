/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

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
import { Lifecycle } from './lifecycleEvents';
import { MyDomainResolver } from './status/myDomainResolver';
import { checkScratchOrgInfoForErrors } from './scratchOrgErrorCodes';
import SettingsGenerator, { ObjectSetting } from './scratchOrgSettingsGenerator';

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
  settings?: Record<string, unknown>;
  objectSettings?: { [objectName: string]: ObjectSetting };
  orgPreferences?: {
    enabled: string[];
    disabled: string[];
  };
}

export interface JsForceError extends Error {
  errorCode: string;
  fields: string[];
}

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'scratchOrgInfoApi');

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
 * @param hubOrg the environment hub org
 * @param clientSecret The OAuth client secret. May be null for JWT OAuth flow.
 * @param scratchOrgInfoComplete The completed ScratchOrgInfo which should contain an access token.
 * @param retry auth retry attempts
 * @param signupTargetLoginUrlConfig the login url
 * @returns {OAuth2Options, number, number, number} options, retries, timeout, delay
 */
const buildOAuth2Options = async (options: {
  hubOrg: Org;
  scratchOrgInfoComplete: ScratchOrgInfo;
  clientSecret?: string;
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
 * @param hubOrg the environment hub org
 * @param username The OAuth client secret. May be null for JWT OAuth flow.
 * @param oauth2Options The completed ScratchOrgInfo which should contain an access token.
 * @param retries auth retry attempts
 * @param timeout the login url
 * @param delay the login url
 * @returns {OAuth2Options, number, number, number} options, retries, timeout, delay
 */
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
      throw error.lastError || error;
    }
  } else {
    return await AuthInfo.create({
      username: options.username,
      parentUsername: options.hubOrg.getUsername(),
      oauth2Options: options.oauth2Options,
    });
  }
};

/**
 * after we successfully signup an org we need to trade the auth token for access and refresh token.
 *
 * @param scratchOrgInfoComplete - The completed ScratchOrgInfo which should contain an access token.
 * @param hubOrg - the environment hub org
 * @param authInfo - The AuthInfo object
 * @param setAsDefault - {boolean} - whether to save this org as the default for this workspace.
 * @param alias - scratch org alias
 * @returns {Promise<void>}
 */
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
    await options.authInfo.setAlias(options.alias);
    logger.debug(`AuthInfo has alias to ${options.authInfo.getFields().alias}`);
  }
  if (options.setAsDefault) {
    await options.authInfo.setAsDefault({ defaultUsername: true });
  }

  logger.debug(`orgConfig.loginUrl: ${options.authInfo.getFields().loginUrl}`);
  logger.debug(`orgConfig.instanceUrl: ${options.authInfo.getFields().instanceUrl}`);
};

/**
 * after we successfully signup an org we need to trade the auth token for access and refresh token.
 *
 * @param scratchOrgInfoComplete - The completed ScratchOrgInfo which should contain an access token.
 * @param hubOrg - the environment hub org
 * @param clientSecret - The OAuth client secret. May be null for JWT OAuth flow.
 * @param setAsDefault - {boolean} - whether to save this org as the default for this workspace.
 * @param signupTargetLoginUrlConfig - Login url
 * @param alias - scratch org alias
 * @param retry - auth retry attempts
 * @returns {Promise<AuthInfo>}
 */
export const authorizeScratchOrg = async (options: {
  scratchOrgInfoComplete: ScratchOrgInfo;
  hubOrg: Org;
  clientSecret?: string;
  setAsDefault: boolean;
  signupTargetLoginUrlConfig?: string;
  alias?: string;
  retry?: number;
}): Promise<AuthInfo> => {
  const { scratchOrgInfoComplete, hubOrg, clientSecret, setAsDefault, signupTargetLoginUrlConfig, alias } = options;
  const logger = await Logger.child('authorizeScratchOrg');
  logger.debug(`scratchOrgInfoComplete: ${JSON.stringify(scratchOrgInfoComplete, null, 4)}`);

  // if we didn't have it marked as a devhub but just successfully used it as one, this will update the authFile, fix cache, etc
  if (!hubOrg.isDevHubOrg()) {
    await hubOrg.determineIfDevHubOrg(true);
  }

  await Lifecycle.getInstance().emit('authorizeScratchOrg', {
    status: 'buildOAuth2Options',
  });

  const oAuth2Options = await buildOAuth2Options({
    hubOrg,
    clientSecret,
    scratchOrgInfoComplete,
    retry: options?.retry,
    signupTargetLoginUrlConfig,
  });

  await Lifecycle.getInstance().emit('authorizeScratchOrg', {
    status: 'getAuthInfo',
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
  const usernameKey = Object.keys(scratchOrgInfo).find((key: string) => key.toUpperCase() === 'USERNAME');
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
      throw sfdxError;
    }
    // An org file already exists
    throw SfdxError.create('@salesforce/core', 'scratchOrgErrorCodes', 'C-1007');
  }
};

/**
 * This extracts orgPrefs/settings from the user input and performs a basic scratchOrgInfo request.
 *
 * @param hubOrg - the environment hub org
 * @param scratchOrgRequest - An object containing the fields of the ScratchOrgInfo
 * @param settings - An object containing org settings
 * @returns {Promise<RecordResult>}
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
    // this is a jsforce error which contains the property "fields" which regular error don't
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

  const response = await retry(
    async () => {
      const resultInProgress = await hubOrg
        .getConnection()
        .sobject<ScratchOrgInfo>('ScratchOrgInfo')
        .retrieve(scratchOrgInfoId);
      logger.debug(`polling client result: ${JSON.stringify(resultInProgress, null, 4)}`);
      await Lifecycle.getInstance().emit('scratchOrgInfoApi-pollForScratchOrgInfo', {
        status: resultInProgress.Status,
      });
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
 * @param scratchOrgAuthInfo - an object containing the AuthInfo of the ScratchOrg
 * @param apiVersion - the target api version
 * @param orgSettings - The ScratchOrg settings
 * @param scratchOrg - The scratchOrg Org info
 * @returns {Promise<Optional<AuthInfo>>}
 */
export const deploySettingsAndResolveUrl = async (
  scratchOrgAuthInfo: AuthInfo,
  apiVersion: string,
  orgSettings: SettingsGenerator,
  scratchOrg: Org
): Promise<Optional<AuthInfo>> => {
  const logger = await Logger.child('scratchOrgInfoApi-deploySettingsAndResolveUrl');

  if (orgSettings.hasSettings()) {
    // deploy the settings to the newly created scratch org
    logger.debug(`deploying scratch org settings with apiVersion ${apiVersion}`);

    try {
      await orgSettings.createDeploy();
      await orgSettings.deploySettingsViaFolder(scratchOrg, apiVersion);
    } catch (error) {
      throw SfdxError.wrap(error as Error);
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
      logger.debug('processScratchOrgInfoResult - err: %s', error);
      if (sfdxError.name === 'MyDomainResolverTimeoutError') {
        sfdxError.setData({
          orgId: scratchOrgAuthInfo.getFields().orgId,
          username: scratchOrgAuthInfo.getFields().username,
          instanceUrl: scratchOrgAuthInfo.getFields().instanceUrl,
        });
        logger.debug('processScratchOrgInfoResult - err data: %s', sfdxError.data);
      }
      throw sfdxError;
    }

    return scratchOrgAuthInfo;
  }
};
