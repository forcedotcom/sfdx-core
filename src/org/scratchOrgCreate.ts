/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// third
import { Duration } from '@salesforce/kit';
import { ensureString, getString } from '@salesforce/ts-types';

// Local
import { Messages } from '../messages';
import { Logger } from '../logger';
import { ConfigAggregator } from '../config/configAggregator';
import { SfdxProject } from '../sfdxProject';
import { SfdxError } from '../sfdxError';
import { Org } from './org';
import {
  authorizeScratchOrg,
  requestScratchOrgCreation,
  pollForScratchOrgInfo,
  deploySettingsAndResolveUrl,
  ScratchOrgInfo,
} from './scratchOrgInfoApi';
import SettingsGenerator from './scratchOrgSettingsGenerator';
import { generateScratchOrgInfo, getScratchOrgInfoPayload } from './scratchOrgInfoGenerator';
import { AuthFields, AuthInfo } from './authInfo';
import { Connection } from './connection';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/core', 'scratchOrgCreate', ['SourceStatusResetFailureError']);

export const DEFAULT_STREAM_TIMEOUT_MINUTES = 6;

export interface ScratchOrgCreateResult {
  username?: string;
  scratchOrgInfo?: ScratchOrgInfo;
  authInfo?: AuthInfo;
  authFields?: AuthFields;
  warnings: string[];
}

/**
 * interface ScratchOrgCreateOptions
 *
 * @param hubOrg the environment hub org
 * @param connectedAppConsumerKey The connected app consumer key.
 * @param durationDays duration of the scratch org (in days) (default:1, min:1, max:30)
 * @param nonamespace create the scratch org with no namespace
 * @param noancestors do not include second-generation package ancestors in the scratch org
 * @param wait the streaming client socket timeout (in minutes) must be an instance of the Duration utility class (default:6, min:2)
 * @param retry number of scratch org auth retries after scratch org is successfully signed up (default:0, min:0, max:10)
 * @param apiversion target server instance API version
 * @param definitionjson org definition in JSON format
 * @param definitionfile path to an org definition file
 * @param orgConfig overrides definitionjson
 * @param clientSecret OAuth client secret of personal connected app
 */

export interface ScratchOrgCreateOptions {
  hubOrg: Org;
  connectedAppConsumerKey?: string;
  durationDays?: number;
  nonamespace?: boolean;
  noancestors?: boolean;
  wait?: Duration;
  retry?: number;
  apiversion?: string;
  definitionjson?: string;
  definitionfile?: string;
  orgConfig?: Record<string, unknown>;
  clientSecret?: string;
}

const validateDuration = (durationDays: number): void => {
  const min = 1;
  const max = 30;
  if (Number.isInteger(durationDays)) {
    if (durationDays < min) {
      throw new SfdxError(
        `Expected 'durationDays' greater than or equal to ${min} but received ${durationDays}`,
        'BoundsError'
      );
    }
    if (durationDays > max) {
      throw new SfdxError(
        `Expected 'durationDays' less than or equal to ${max} but received ${durationDays}`,
        'BoundsError'
      );
    }
    return;
  }
  throw new SfdxError("Expected 'durationDays' to be an integer number", 'TypeError');
};

const validateRetry = (retry: number): void => {
  if (Number.isInteger(retry)) {
    return;
  }
  throw new SfdxError("Expected 'retry' to be an integer number", 'TypeError');
};

const validateWait = (wait: Duration): void => {
  const min = 2;
  if (wait.minutes < min) {
    throw new SfdxError(`Expected 'wait' greater than or equal to ${min} but received ${wait}`, 'BoundsError');
  }
};

export const scratchOrgCreate = async (options: ScratchOrgCreateOptions): Promise<ScratchOrgCreateResult> => {
  const logger = await Logger.child('scratchOrgCreate');
  logger.debug('scratchOrgCreate');

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
  } = options;

  validateDuration(durationDays);
  validateRetry(retry);
  validateWait(wait);

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
  await settingsGenerator.extract(scratchOrgInfo);
  logger.debug(`the scratch org def file has settings: ${settingsGenerator.hasSettings()}`);

  // creates the scratch org info in the devhub
  const scratchOrgInfoRequestResult = await requestScratchOrgCreation(hubOrg, scratchOrgInfo, settingsGenerator);

  const scratchOrgInfoId = ensureString(getString(scratchOrgInfoRequestResult, 'id'));

  logger.debug(`scratch org has recordId ${scratchOrgInfoId}`);

  const scratchOrgInfoResult = await pollForScratchOrgInfo(hubOrg, scratchOrgInfoId, wait);

  const signupTargetLoginUrlConfig = await getSignupTargetLoginUrl();

  const scratchOrgAuthInfo = await authorizeScratchOrg({
    scratchOrgInfoComplete: scratchOrgInfoResult,
    hubOrg,
    clientSecret,
    signupTargetLoginUrlConfig,
    retry: retry || 0,
  });

  // we'll need this scratch org connection later;
  const connection = await Connection.create({ authInfo: scratchOrgAuthInfo });
  const scratchOrg = await Org.create({ connection }); // scartchOrg should come from command

  const username = scratchOrg.getUsername();

  logger.debug(`scratch org username ${username}`);

  const configAggregator = new ConfigAggregator();
  const authInfo = await deploySettingsAndResolveUrl(
    scratchOrgAuthInfo,
    apiversion ??
      (configAggregator.getPropertyValue('apiVersion') as string) ??
      (await scratchOrg.retrieveMaxApiVersion()),
    settingsGenerator,
    scratchOrg
  );

  logger.trace('Settings deployed to org');
  /** updating the revision num to zero during org:creation if source members are created during org:create.This only happens for some specific scratch org definition file.*/
  await updateRevisionCounterToZero(scratchOrg);

  return {
    username,
    scratchOrgInfo: scratchOrgInfoResult,
    authInfo,
    authFields: authInfo?.getFields(),
    warnings,
  };
};

const getSignupTargetLoginUrl = async (): Promise<string | undefined> => {
  try {
    const project = await SfdxProject.resolve();
    const projectJson = await project.resolveProjectConfig();
    return projectJson.signupTargetLoginUrl as string;
  } catch {
    // a project isn't required for org:create
  }
};

const updateRevisionCounterToZero = async (scratchOrg: Org): Promise<void> => {
  const conn = scratchOrg.getConnection();
  const queryResult = await conn.tooling.sobject('SourceMember').find({ RevisionCounter: { $gt: 0 } }, ['Id']);
  try {
    await conn.tooling
      .sobject('SourceMember')
      .update(queryResult.map((record) => ({ Id: record.Id, RevisionCounter: 0 })));
  } catch (err) {
    const message = messages.getMessage('SourceStatusResetFailureError', [
      scratchOrg.getOrgId(),
      scratchOrg.getUsername(),
    ]);
    throw new SfdxError(message, 'SourceStatusResetFailure');
  }
};
