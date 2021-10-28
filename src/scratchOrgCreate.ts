/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// third
import { Duration } from '@salesforce/kit';
import { Optional } from '@salesforce/ts-types';

// Local
import { Org } from './org';
import { Logger } from './logger';
import { AuthInfo } from './authInfo';
import { Messages } from './messages';
import { SfdxError } from './sfdxError';
import { Connection } from './connection';
import { SfdxProject } from './sfdxProject';
import { ConfigAggregator } from './config/configAggregator';
import {
  authorizeScratchOrg,
  requestScratchOrgCreation,
  pollForScratchOrgInfo,
  deploySettingsAndResolveUrl,
} from './scratchOrgInfoApi';
import SettingsGenerator from './scratchOrgSettingsGenerator';
import { generateScratchOrgInfo, getScratchOrgInfoPayload } from './scratchOrgInfoGenerator';

Messages.importMessagesDirectory(__dirname);
const messages: Messages = Messages.loadMessages('@salesforce/core', 'scratchOrgCreate');

export interface ScratchOrgCreateResult {
  username: Optional<string>;
  authInfo: Optional<AuthInfo>;
  warnings: string[];
}
export interface ScratchOrgCreateOptions {
  hubOrg: Org;
  connectedAppConsumerKey: string;
  durationDays: number;
  nonamespace: boolean;
  noancestors: boolean;
  wait: Duration;
  setdefaultusername: boolean;
  setalias: string;
  retry: number;
  apiversion: string;
  definitionjson: string;
  definitionfile: string;
  orgConfig: Record<string, unknown>;
  configAggregator: ConfigAggregator;
  test: boolean;
  clientSecret: string;
}

export const scratchOrgCreate = async (options: ScratchOrgCreateOptions): Promise<ScratchOrgCreateResult> => {
  const logger = await Logger.child('scratchOrgCreate');
  logger.debug('scratchOrgCreate');
  const settingsGenerator = new SettingsGenerator();
  const {
    hubOrg,
    connectedAppConsumerKey,
    durationDays,
    nonamespace,
    noancestors,
    setdefaultusername,
    setalias,
    retry,
    apiversion,
    definitionjson,
    definitionfile,
    orgConfig,
    configAggregator,
    clientSecret,
  } = options;

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
  await settingsGenerator.extract(scratchOrgInfo);
  logger.debug(`the scratch org def file has settings: ${settingsGenerator.hasSettings()}`);

  // creates the scratch org info in the devhub
  const scratchOrgInfoRequestResult = await requestScratchOrgCreation(hubOrg, scratchOrgInfo, settingsGenerator);

  let scratchOrgInfoId!: string;
  if (scratchOrgInfoRequestResult.success === true) {
    scratchOrgInfoId = scratchOrgInfoRequestResult.id;
    logger.debug(`scratch org has recordId ${scratchOrgInfoRequestResult.id}`);
  }

  const scratchOrgInfoResult = await pollForScratchOrgInfo(options.hubOrg, scratchOrgInfoId, options.wait);

  const signupTargetLoginUrlConfig = await getsSgnupTargetLoginUrlConfig();

  const scratchOrgAuthInfo = await authorizeScratchOrg({
    scratchOrgInfoComplete: scratchOrgInfoResult,
    hubOrg,
    clientSecret,
    setAsDefault: setdefaultusername,
    alias: setalias,
    signupTargetLoginUrlConfig,
    retry: retry || 0,
  });

  // we'll need this scratch org connection later;
  const scratchOrg = await Org.create({ connection: await Connection.create({ authInfo: scratchOrgAuthInfo }) });
  const username = scratchOrg.getUsername();

  const authInfo = await deploySettingsAndResolveUrl(
    scratchOrgAuthInfo,
    apiversion ??
      (configAggregator.getPropertyValue('apiVersion') as string) ??
      (await scratchOrg.retrieveMaxApiVersion()),
    settingsGenerator
  );

  logger.trace('Settings deployed to org');
  /** updating the revision num to zero during org:creation if source members are created during org:create.This only happens for some specific scratch org definition file.*/
  await updateRevisionCounterToZero(scratchOrg);

  return {
    username,
    authInfo,
    warnings,
  };
};

export const getsSgnupTargetLoginUrlConfig = async (): Promise<string | undefined> => {
  try {
    const project = await SfdxProject.resolve();
    const projectJson = await project.resolveProjectConfig();
    return projectJson.signupTargetLoginUrl as string;
  } catch {
    // a project isn't required for org:create
  }
};

export const updateRevisionCounterToZero = async (scratchOrg: Org): Promise<void> => {
  const conn = scratchOrg.getConnection();
  const queryResult = await conn.tooling.sobject('SourceMember').find({ RevisionCounter: { $gt: 0 } }, ['Id']);
  try {
    await conn.tooling
      .sobject('SourceMember')
      .update(queryResult.map((record) => ({ Id: record.Id, RevisionCounter: 0 })));
  } catch (err) {
    const message = messages.getMessage('SourceStatusResetFailure', [scratchOrg.getOrgId(), scratchOrg.getUsername()]);
    throw new SfdxError(message, 'SourceStatusResetFailure');
  }
};
