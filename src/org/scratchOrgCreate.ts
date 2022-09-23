/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Duration } from '@salesforce/kit';
import { ensureString } from '@salesforce/ts-types';
import { Messages } from '../messages';
import { Logger } from '../logger';
import { ConfigAggregator } from '../config/configAggregator';
import { OrgConfigProperties } from '../org/orgConfigProperties';
import { SfProject } from '../sfProject';
import { StateAggregator } from '../stateAggregator';
import { Org } from './org';
import {
  authorizeScratchOrg,
  requestScratchOrgCreation,
  pollForScratchOrgInfo,
  deploySettings,
  resolveUrl,
  queryScratchOrgInfo,
} from './scratchOrgInfoApi';
import { ScratchOrgInfo } from './scratchOrgTypes';
import SettingsGenerator from './scratchOrgSettingsGenerator';
import { generateScratchOrgInfo, getScratchOrgInfoPayload } from './scratchOrgInfoGenerator';
import { AuthFields, AuthInfo } from './authInfo';
import { emit, emitPostOrgCreate } from './scratchOrgLifecycleEvents';
import { ScratchOrgCache } from './scratchOrgCache';
import { validateScratchOrgInfoForResume } from './scratchOrgErrorCodes';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/core', 'scratchOrgCreate', [
  'DurationDaysValidationMaxError',
  'DurationDaysValidationMinError',
  'RetryNotIntError',
  'DurationDaysNotIntError',
  'CacheMissError',
]);

export const DEFAULT_STREAM_TIMEOUT_MINUTES = 6;

export interface ScratchOrgCreateResult {
  username?: string;
  scratchOrgInfo?: ScratchOrgInfo;
  authInfo?: AuthInfo;
  authFields?: AuthFields;
  warnings: string[];
}
export interface ScratchOrgCreateOptions {
  /** the environment hub org */
  hubOrg: Org;
  /** The connected app consumer key. */
  connectedAppConsumerKey?: string;
  /** duration of the scratch org (in days) (default:1, min:1, max:30) */
  durationDays?: number;
  /** create the scratch org with no namespace */
  nonamespace?: boolean;
  /** create the scratch org with no second-generation package ancestors */
  noancestors?: boolean;
  /** the streaming client socket timeout (in minutes) must be an instance of the Duration utility class (default:6) */
  wait?: Duration;
  /** number of scratch org auth retries after scratch org is successfully signed up (default:0, min:0, max:10) */
  retry?: number;
  /** target server instance API version */
  apiversion?: string;
  /**
   * org definition in JSON format, stringified
   *
   * @deprecated use orgConfig
   */
  definitionjson?: string;
  /**
   * path to an org definition file
   *
   * @deprecated use orgConfig
   * */
  definitionfile?: string;
  /** overrides definitionjson */
  orgConfig?: Record<string, unknown>;
  /** OAuth client secret of personal connected app */
  clientSecret?: string;
  /** alias to set for the created org */
  alias?: string;
  /** after complete, set the org as the default */
  setDefault?: boolean;
  /** if false, do not use source tracking for this scratch org */
  tracksSource?: boolean;
}

const validateDuration = (durationDays: number): void => {
  const min = 1;
  const max = 30;
  if (Number.isInteger(durationDays)) {
    if (durationDays < min) {
      throw messages.createError('DurationDaysValidationMinError', [min, durationDays]);
    }
    if (durationDays > max) {
      throw messages.createError('DurationDaysValidationMaxError', [max, durationDays]);
    }
    return;
  }
  throw messages.createError('DurationDaysNotIntError');
};

const validateRetry = (retry: number): void => {
  if (!Number.isInteger(retry)) {
    throw messages.createError('RetryNotIntError');
  }
};

export const scratchOrgResume = async (jobId: string): Promise<ScratchOrgCreateResult> => {
  const [logger, cache] = await Promise.all([
    Logger.child('scratchOrgResume'),
    ScratchOrgCache.create(),
    emit({ stage: 'send request' }),
  ]);
  logger.debug(`resuming scratch org creation for jobId: ${jobId}`);
  if (!cache.has(jobId)) {
    throw messages.createError('CacheMissError', [jobId]);
  }
  const {
    hubUsername,
    apiVersion,
    clientSecret,
    signupTargetLoginUrlConfig,
    definitionjson,
    alias,
    setDefault,
    tracksSource,
  } = cache.get(jobId);

  const hubOrg = await Org.create({ aliasOrUsername: hubUsername });
  const soi = await queryScratchOrgInfo(hubOrg, jobId);

  await validateScratchOrgInfoForResume({ jobId, scratchOrgInfo: soi, cache, hubUsername });
  // At this point, the scratch org is "good".

  // Some hubs have all the usernames set to `null`
  const username = soi.Username ?? soi.SignupUsername;

  // re-auth only if the org isn't in StateAggregator
  const stateAggregator = await StateAggregator.getInstance();
  const scratchOrgAuthInfo = (await stateAggregator.orgs.exists(username))
    ? await AuthInfo.create({ username })
    : await authorizeScratchOrg({
        scratchOrgInfoComplete: soi,
        hubOrg,
        clientSecret,
        signupTargetLoginUrlConfig,
        retry: 0,
      });

  const scratchOrg = await Org.create({ aliasOrUsername: username });

  const configAggregator = await ConfigAggregator.create();

  await emit({ stage: 'deploy settings', scratchOrgInfo: soi });
  const settingsGenerator = new SettingsGenerator();
  settingsGenerator.extract({ ...soi, ...definitionjson });
  const [authInfo] = await Promise.all([
    resolveUrl(scratchOrgAuthInfo),
    deploySettings(
      scratchOrg,
      settingsGenerator,
      apiVersion ??
        configAggregator.getPropertyValue(OrgConfigProperties.ORG_API_VERSION) ??
        (await scratchOrg.retrieveMaxApiVersion())
    ),
  ]);

  await scratchOrgAuthInfo.handleAliasAndDefaultSettings({
    alias,
    setDefault: setDefault ?? false,
    setDefaultDevHub: false,
    setTracksSource: tracksSource ?? true,
  });
  cache.unset(soi.Id ?? jobId);
  const authFields = authInfo.getFields();

  await Promise.all([emit({ stage: 'done', scratchOrgInfo: soi }), cache.write(), emitPostOrgCreate(authFields)]);

  return {
    username,
    scratchOrgInfo: soi,
    authInfo,
    authFields,
    warnings: [],
  };
};

export const scratchOrgCreate = async (options: ScratchOrgCreateOptions): Promise<ScratchOrgCreateResult> => {
  const logger = await Logger.child('scratchOrgCreate');

  logger.debug('scratchOrgCreate');
  await emit({ stage: 'prepare request' });
  const {
    hubOrg,
    connectedAppConsumerKey,
    durationDays = 1,
    nonamespace,
    noancestors,
    wait = Duration.minutes(DEFAULT_STREAM_TIMEOUT_MINUTES),
    retry = 0,
    apiversion,
    definitionjson,
    definitionfile,
    orgConfig,
    clientSecret = undefined,
    alias,
    setDefault = false,
    tracksSource = true,
  } = options;

  validateDuration(durationDays);
  validateRetry(retry);

  const { scratchOrgInfoPayload, ignoreAncestorIds, warnings } = await getScratchOrgInfoPayload({
    definitionjson,
    definitionfile,
    connectedAppConsumerKey,
    durationDays,
    nonamespace,
    noancestors,
    orgConfig,
  });

  const scratchOrgInfo = await generateScratchOrgInfo({
    hubOrg,
    scratchOrgInfoPayload,
    nonamespace,
    ignoreAncestorIds,
  });

  // gets the scratch org settings (will use in both signup paths AND to deploy the settings)
  const settingsGenerator = new SettingsGenerator();
  const settings = await settingsGenerator.extract(scratchOrgInfo);
  logger.debug(`the scratch org def file has settings: ${settingsGenerator.hasSettings()}`);

  const [scratchOrgInfoRequestResult, signupTargetLoginUrlConfig] = await Promise.all([
    // creates the scratch org info in the devhub
    requestScratchOrgCreation(hubOrg, scratchOrgInfo, settingsGenerator),
    getSignupTargetLoginUrl(),
  ]);

  const scratchOrgInfoId = ensureString(scratchOrgInfoRequestResult.id);
  const cache = await ScratchOrgCache.create();
  cache.set(scratchOrgInfoId, {
    hubUsername: hubOrg.getUsername(),
    hubBaseUrl: hubOrg.getField(Org.Fields.INSTANCE_URL)?.toString(),
    definitionjson: { ...(definitionjson ? JSON.parse(definitionjson) : {}), ...orgConfig, ...settings },
    clientSecret,
    alias,
    setDefault,
    tracksSource,
  });
  await cache.write();
  logger.debug(`scratch org has recordId ${scratchOrgInfoId}`);

  // this is where we stop--no polling
  if (wait.minutes === 0) {
    const soi = await queryScratchOrgInfo(hubOrg, scratchOrgInfoId);
    return {
      username: soi.SignupUsername,
      warnings: [],
      scratchOrgInfo: soi,
    };
  }

  const soi = await pollForScratchOrgInfo(hubOrg, scratchOrgInfoId, wait);

  const scratchOrgAuthInfo = await authorizeScratchOrg({
    scratchOrgInfoComplete: soi,
    hubOrg,
    clientSecret,
    signupTargetLoginUrlConfig,
    retry: retry || 0,
  });

  // we'll need this scratch org connection later;
  const scratchOrg = await Org.create({
    aliasOrUsername: soi.Username ?? soi.SignupUsername,
  });
  const username = scratchOrg.getUsername();
  logger.debug(`scratch org username ${username}`);

  await emit({ stage: 'deploy settings', scratchOrgInfo: soi });

  const configAggregator = await ConfigAggregator.create();

  const [authInfo] = await Promise.all([
    resolveUrl(scratchOrgAuthInfo),
    deploySettings(
      scratchOrg,
      settingsGenerator,
      apiversion ??
        configAggregator.getPropertyValue(OrgConfigProperties.ORG_API_VERSION) ??
        (await scratchOrg.retrieveMaxApiVersion())
    ),
  ]);

  await scratchOrgAuthInfo.handleAliasAndDefaultSettings({
    ...{
      alias,
      setDefault,
      setDefaultDevHub: false,
      setTracksSource: tracksSource === false ? false : true,
    },
  });
  cache.unset(scratchOrgInfoId);
  const authFields = authInfo.getFields();
  await Promise.all([emit({ stage: 'done', scratchOrgInfo: soi }), cache.write(), emitPostOrgCreate(authFields)]);

  return {
    username,
    scratchOrgInfo: soi,
    authInfo,
    authFields: authInfo?.getFields(),
    warnings,
  };
};

const getSignupTargetLoginUrl = async (): Promise<string | undefined> => {
  try {
    const project = await SfProject.resolve();
    const projectJson = await project.resolveProjectConfig();
    return projectJson.signupTargetLoginUrl as string;
  } catch {
    // a project isn't required for org:create
  }
};
