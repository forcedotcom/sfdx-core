/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable class-methods-use-this */

import * as path from 'node:path';
import { AsyncOptionalCreatable, Duration } from '@salesforce/kit';
import {
  AnyFunction,
  AnyJson,
  ensure,
  ensureJsonArray,
  ensureString,
  isBoolean,
  isString,
  JsonArray,
  JsonMap,
  Nullable,
} from '@salesforce/ts-types';
import { HttpRequest, SaveResult } from '@jsforce/jsforce-node';
import { fs } from '../fs/fs';
import { Config } from '../config/config';
import { ConfigAggregator } from '../config/configAggregator';
import { ConfigContents } from '../config/configStackTypes';
import { OrgUsersConfig } from '../config/orgUsersConfig';
import { Global } from '../global';
import { Lifecycle } from '../lifecycleEvents';
import { Logger } from '../logger/logger';
import { SfError } from '../sfError';
import { trimTo15, validateSalesforceId } from '../util/sfdc';
import { WebOAuthServer } from '../webOAuthServer';
import { Messages } from '../messages';
import { StateAggregator } from '../stateAggregator/stateAggregator';
import { PollingClient } from '../status/pollingClient';
import { StatusResult } from '../status/types';
import { Connection, SingleRecordQueryErrors } from './connection';
import { AuthFields, AuthInfo } from './authInfo';
import { scratchOrgCreate, ScratchOrgCreateOptions, ScratchOrgCreateResult } from './scratchOrgCreate';
import { OrgConfigProperties } from './orgConfigProperties';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'org');

export type XOR<T, U> = (T & { [K in keyof U]?: never }) | (U & { [K in keyof T]?: never });

export type OrganizationInformation = {
  Name: string;
  InstanceName: string;
  IsSandbox: boolean;
  TrialExpirationDate: string | null;
  NamespacePrefix: string | null;
};

export enum OrgTypes {
  Scratch = 'scratch',
  Sandbox = 'sandbox',
}

export type StatusEvent = {
  sandboxProcessObj: SandboxProcessObject;
  interval: number;
  remainingWait: number;
  waitingOnAuth: boolean;
};

export type ResultEvent = {
  sandboxProcessObj: SandboxProcessObject;
  sandboxRes: SandboxUserAuthResponse;
};

export type SandboxUserAuthRequest = {
  sandboxName: string;
  clientId: string;
  callbackUrl: string;
};

export enum SandboxEvents {
  EVENT_STATUS = 'status',
  EVENT_ASYNC_RESULT = 'asyncResult',
  EVENT_RESULT = 'result',
  EVENT_AUTH = 'auth',
  EVENT_RESUME = 'resume',
  EVENT_MULTIPLE_SBX_PROCESSES = 'multipleMatchingSbxProcesses',
}

export type SandboxUserAuthResponse = {
  authUserName: string;
  authCode: string;
  instanceUrl: string;
  loginUrl: string;
};

const resumableSandboxStatus = ['Activating', 'Pending', 'Pending Activation', 'Processing', 'Sampling', 'Completed'];

export function sandboxIsResumable(value: string): boolean {
  return resumableSandboxStatus.includes(value);
}

export type SandboxProcessObject = {
  Id: string;
  Status: string;
  SandboxName: string;
  SandboxInfoId: string;
  LicenseType: string;
  CreatedDate: string;
  SandboxOrganization?: string;
  CopyProgress?: number;
  SourceId?: string;
  Description?: string;
  ApexClassId?: string;
  EndDate?: string;
  Features?: string[];
};
const sandboxProcessFields = [
  'Id',
  'Status',
  'SandboxName',
  'SandboxInfoId',
  'LicenseType',
  'CreatedDate',
  'CopyProgress',
  'SandboxOrganization',
  'SourceId',
  'Description',
  'EndDate',
  'Features',
];

const sandboxInfoFields = [
  'Id',
  'IsDeleted',
  'CreatedDate',
  'CreatedById',
  'LastModifiedDate',
  'LastModifiedById',
  'SandboxName',
  'LicenseType',
  'TemplateId',
  'HistoryDays',
  'CopyChatter',
  'AutoActivate',
  'ApexClassId',
  'Description',
  'SourceId',
  'ActivationUserGroupId',
  'Features',
];

export type SandboxRequest = {
  SandboxName: string;
  LicenseType?: string;
  /** Should match a SandboxInfoId, not a SandboxProcessId */
  SourceId?: string;
  Description?: string;
  ApexClassId?: string;
  ActivationUserGroupId?: string;
  Features?: string[] | string;
};

export type ResumeSandboxRequest = {
  SandboxName?: string;
  SandboxProcessObjId?: string;
};

// https://developer.salesforce.com/docs/atlas.en-us.api_tooling.meta/api_tooling/tooling_api_objects_sandboxinfo.htm
export type SandboxInfo = {
  Id: string; // 0GQB0000000TVobOAG
  IsDeleted: boolean;
  CreatedDate: string; // 2023-06-16T18:35:47.000+0000
  CreatedById: string; // 005B0000004TiUpIAK
  LastModifiedDate: string; // 2023-09-27T20:50:26.000+0000
  LastModifiedById: string; // 005B0000004TiUpIAK
  SandboxName: string; // must be 10 or less alphanumeric chars
  LicenseType: 'DEVELOPER' | 'DEVELOPER PRO' | 'PARTIAL' | 'FULL';
  TemplateId?: string; // reference to PartitionLevelScheme
  HistoryDays: -1 | 0 | 10 | 20 | 30 | 60 | 90 | 120 | 150 | 180; // full sandboxes only
  CopyChatter: boolean;
  AutoActivate: boolean; // only editable for an update/refresh
  ApexClassId?: string; // apex class ID. Only editable on create.
  Description?: string;
  SourceId?: string; // SandboxInfoId as the source org used for a clone
  ActivationUserGroupId?: string; // Support might be added back in API v61.0 (Summer '24)
  CopyArchivedActivities?: boolean; // only for full sandboxes; depends if a license was purchased
  Features?: string[];
};

export type ScratchOrgRequest = Omit<ScratchOrgCreateOptions, 'hubOrg'>;

export type SandboxFields = {
  sandboxOrgId: string;
  prodOrgUsername: string;
  sandboxName?: string;
  sandboxUsername?: string;
  sandboxProcessId?: string;
  sandboxInfoId?: string;
  timestamp?: string;
};

export type SandboxInfoQueryFields = XOR<{ name: string }, { id: string }>;

/**
 * Provides a way to manage a locally authenticated Org.
 *
 * **See** {@link AuthInfo}
 *
 * **See** {@link Connection}
 *
 * **See** {@link Aliases}
 *
 * **See** {@link Config}
 *
 * ```
 * // Email username
 * const org1: Org = await Org.create({ aliasOrUsername: 'foo@example.com' });
 * // The target-org config property
 * const org2: Org = await Org.create();
 * // Full Connection
 * const org3: Org = await Org.create({
 *   connection: await Connection.create({
 *     authInfo: await AuthInfo.create({ username: 'username' })
 *   })
 * });
 * ```
 *
 * **See** https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_usernames_orgs.htm
 */
export class Org extends AsyncOptionalCreatable<Org.Options> {
  private status: Org.Status = Org.Status.UNKNOWN;
  private configAggregator!: ConfigAggregator;

  // Initialized in create
  private logger!: ReturnType<Logger['getRawLogger']>;
  private connection!: Connection;

  private options: Org.Options;

  private orgId?: string;

  /**
   * @ignore
   */
  public constructor(options?: Org.Options) {
    super(options);
    this.options = options ?? {};
  }

  /**
   * Generate a URL to a metadata UI builder/setup section in an org.
   *
   * Bot: open in Agentforce Builder
   * ApexPage: opens page
   * Flow: open in Flow Builder
   * FlexiPage: open in Lightning App Builder
   * CustomObject: open in Object Manager
   * ApexClass: open in Setup -> Apex Classes UI
   *
   * if you pass any other metadata type you'll get a path to Lightning App Builder
   *
   * @example
   * // use SDR resolver:
   * import { MetadataResolver } from '@salesforce/source-deploy-retrieve';
   *
   * const metadataResolver = new MetadataResolver();
   * const components = metadataResolver.getComponentsFromPath(filePath);
   * const typeName = components[0]?.type?.name;
   *
   * const metadataBuilderUrl = await org.getMetadataUIURL(typeName, filePath);
   *
   * @typeName Bot | ApexPage | Flow | FlexiPage | CustomObject | ApexClass
   * @file Absolute file path to the metadata file
   */
  public async getMetadataUIURL(typeName: string, file: string): Promise<string> {
    const botFileNameToId = async (conn: Connection, filePath: string): Promise<string> =>
      (
        await conn.singleRecordQuery<{ Id: string }>(
          `SELECT id FROM BotDefinition WHERE DeveloperName='${path.basename(filePath, '.bot-meta.xml')}'`
        )
      ).Id;
    /** query flexipage via toolingAPI to get its ID (starts with 0M0) */
    const flexiPageFilenameToId = async (conn: Connection, filePath: string): Promise<string> =>
      (
        await conn.singleRecordQuery<{ Id: string }>(
          `SELECT id FROM flexipage WHERE DeveloperName='${path.basename(filePath, '.flexipage-meta.xml')}'`,
          { tooling: true }
        )
      ).Id;

    /** query the rest API to turn a flow's filepath into a FlowId  (starts with 301) */
    const flowFileNameToId = async (conn: Connection, filePath: string): Promise<string> => {
      try {
        const flow = await conn.singleRecordQuery<{ DurableId: string }>(
          `SELECT DurableId FROM FlowVersionView WHERE FlowDefinitionView.ApiName = '${path.basename(
            filePath,
            '.flow-meta.xml'
          )}' ORDER BY VersionNumber DESC LIMIT 1`
        );
        return flow.DurableId;
      } catch (error) {
        throw messages.createError('FlowIdNotFound', [filePath]);
      }
    };

    const customObjectFileNameToId = async (conn: Connection, filePath: string): Promise<string> => {
      try {
        const customObject = await conn.singleRecordQuery<{ Id: string }>(
          `SELECT Id FROM CustomObject WHERE DeveloperName = '${path.basename(
            filePath.replace(/__c/g, ''),
            '.object-meta.xml'
          )}'`,
          {
            tooling: true,
          }
        );
        return customObject.Id;
      } catch (error) {
        throw messages.createError('CustomObjectIdNotFound', [filePath]);
      }
    };

    const apexClassFileNameToId = async (conn: Connection, filePath: string): Promise<string> => {
      try {
        const apexClass = await conn.singleRecordQuery<{ Id: string }>(
          `SELECT Id FROM ApexClass WHERE Name = '${path.basename(filePath, '.cls')}'`,
          {
            tooling: true,
          }
        );
        return apexClass.Id;
      } catch (error) {
        throw messages.createError('ApexClassIdNotFound', [filePath]);
      }
    };

    let redirectUri = '';

    switch (typeName) {
      case 'ApexClass':
        redirectUri = `lightning/setup/ApexClasses/page?address=%2F${await apexClassFileNameToId(
          this.connection,
          file
        )}`;
        break;
      case 'CustomObject':
        redirectUri = `lightning/setup/ObjectManager/${await customObjectFileNameToId(
          this.connection,
          file
        )}/Details/view`;
        break;
      case 'Bot':
        redirectUri = `/AiCopilot/copilotStudio.app#/copilot/builder?copilotId=${await botFileNameToId(
          this.connection,
          file
        )}`;
        break;
      case 'ApexPage':
        redirectUri = `/apex/${path.basename(file).replace('.page-meta.xml', '').replace('.page', '')}`;
        break;
      case 'Flow':
        redirectUri = `/builder_platform_interaction/flowBuilder.app?flowId=${await flowFileNameToId(
          this.connection,
          file
        )}`;
        break;
      case 'FlexiPage':
        redirectUri = `/visualEditor/appBuilder.app?pageId=${await flexiPageFilenameToId(this.connection, file)}`;
        break;
      default:
        redirectUri = '/lightning/setup/FlexiPageList/home';
        break;
    }

    return this.getFrontDoorUrl(redirectUri);
  }

  /**
   * Get a Frontdoor URL
   *
   * This uses the UI Bridge API to generate a single-use Frontdoor URL:
   * https://help.salesforce.com/s/articleView?id=xcloud.frontdoor_singleaccess.htm&type=5
   */
  public async getFrontDoorUrl(redirectUri?: string): Promise<string> {
    // the `singleaccess` endpoint returns 403 when using an expired token and jsforce only triggers a token refresh on 401 so we check if it's valid first
    await this.refreshAuth();

    type SingleAccessUrlRes = { frontdoor_uri: string | undefined };

    const singleAccessUrl = new URL('/services/oauth2/singleaccess', this.connection.instanceUrl);
    if (redirectUri) {
      singleAccessUrl.searchParams.append('redirect_uri', redirectUri);
    }

    const response = await this.connection.requestGet<SingleAccessUrlRes>(singleAccessUrl.toString());
    if (response.frontdoor_uri) return response.frontdoor_uri;
    throw new SfError(messages.getMessage('FrontdoorURLError')).setData(response);
  }

  /**
   * create a sandbox from a production org
   * 'this' needs to be a production org with sandbox licenses available
   *
   * @param sandboxReq SandboxRequest options to create the sandbox with
   * @param options Wait: The amount of time to wait before timing out, Interval: The time interval between polling
   */
  public async createSandbox(
    sandboxReq: SandboxRequest,
    options: { wait?: Duration; interval?: Duration; async?: boolean } = {
      wait: Duration.minutes(6),
      async: false,
      interval: Duration.seconds(30),
    }
  ): Promise<SandboxProcessObject> {
    this.logger.debug(sandboxReq, 'CreateSandbox called with SandboxRequest');
    // The tooling create API expects a string, not an array, so convert.
    if (sandboxReq.Features && Array.isArray(sandboxReq.Features)) {
      sandboxReq.Features = JSON.stringify(sandboxReq.Features);
    }
    const createResult = await this.connection.tooling.create('SandboxInfo', sandboxReq);
    this.logger.debug(createResult, 'Return from calling tooling.create');

    if (Array.isArray(createResult) || !createResult.success) {
      throw messages.createError('sandboxInfoCreateFailed', [JSON.stringify(createResult)]);
    }

    const sandboxCreationProgress = await this.querySandboxProcessBySandboxInfoId(createResult.id);
    this.logger.debug(sandboxCreationProgress, 'Return from calling singleRecordQuery with tooling');

    const isAsync = !!options.async;

    if (isAsync) {
      // The user didn't want us to poll, so simply return the status
      await Lifecycle.getInstance().emit(SandboxEvents.EVENT_ASYNC_RESULT, sandboxCreationProgress);
      return sandboxCreationProgress;
    }
    const [wait, pollInterval] = this.validateWaitOptions(options);
    this.logger.debug(
      sandboxCreationProgress,
      `create - pollStatusAndAuth sandboxProcessObj, max wait time of ${wait.minutes} minutes`
    );
    return this.pollStatusAndAuth({
      sandboxProcessObj: sandboxCreationProgress,
      wait,
      pollInterval,
    });
  }

  /**
   * Refresh (update) a sandbox from a production org.
   * 'this' needs to be a production org with sandbox licenses available
   *
   * @param sandboxInfo SandboxInfo to update the sandbox with
   * @param options Wait: The amount of time to wait before timing out, Interval: The time interval between polling
   */
  public async refreshSandbox(
    sandboxInfo: SandboxInfo,
    options: { wait?: Duration; interval?: Duration; async?: boolean } = {
      wait: Duration.minutes(6),
      async: false,
      interval: Duration.seconds(30),
    }
  ): Promise<SandboxProcessObject> {
    this.logger.debug(sandboxInfo, 'RefreshSandbox called with SandboxInfo');
    const refreshResult = await this.connection.tooling.update('SandboxInfo', sandboxInfo);
    this.logger.debug(refreshResult, 'Return from calling tooling.update');

    if (!refreshResult.success) {
      throw messages.createError('sandboxInfoRefreshFailed', [JSON.stringify(refreshResult)]);
    }

    const soql = `SELECT ${sandboxProcessFields.join(',')} FROM SandboxProcess WHERE SandboxName='${
      sandboxInfo.SandboxName
    }' ORDER BY CreatedDate DESC`;
    const sbxProcessObjects = (await this.connection.tooling.query<SandboxProcessObject>(soql)).records.filter(
      (item) => !item.Status.startsWith('Del')
    );
    this.logger.debug(sbxProcessObjects, `SandboxProcesses for ${sandboxInfo.SandboxName}`);

    // throw if none found
    if (sbxProcessObjects?.length === 0) {
      throw new Error(`No SandboxProcesses found for: ${sandboxInfo.SandboxName}`);
    }
    const sandboxRefreshProgress = sbxProcessObjects[0];

    const isAsync = !!options.async;

    if (isAsync) {
      // The user didn't want us to poll, so simply return the status
      await Lifecycle.getInstance().emit(SandboxEvents.EVENT_ASYNC_RESULT, sandboxRefreshProgress);
      return sandboxRefreshProgress;
    }
    const [wait, pollInterval] = this.validateWaitOptions(options);
    this.logger.debug(
      sandboxRefreshProgress,
      `refresh - pollStatusAndAuth sandboxProcessObj, max wait time of ${wait.minutes} minutes`
    );
    return this.pollStatusAndAuth({
      sandboxProcessObj: sandboxRefreshProgress,
      wait,
      pollInterval,
    });
  }

  /**
   *
   * @param sandboxReq SandboxRequest options to create the sandbox with
   * @param sourceSandboxName the name of the sandbox that your new sandbox will be based on
   * @param options Wait: The amount of time to wait before timing out, defaults to 0, Interval: The time interval between polling defaults to 30 seconds
   * @returns {SandboxProcessObject} the newly created sandbox process object
   */
  public async cloneSandbox(
    sandboxReq: SandboxRequest,
    sourceSandboxName: string,
    options: { wait?: Duration; interval?: Duration }
  ): Promise<SandboxProcessObject> {
    const SourceId = (await this.querySandboxProcessBySandboxName(sourceSandboxName)).SandboxInfoId;
    this.logger.debug(`Clone sandbox sourceId ${SourceId}`);
    return this.createSandbox({ ...sandboxReq, SourceId }, options);
  }

  /**
   * Resume a sandbox create or refresh from a production org.
   * `this` needs to be a production org with sandbox licenses available.
   *
   * @param resumeSandboxRequest SandboxRequest options to create/refresh the sandbox with
   * @param options Wait: The amount of time to wait (default: 0 minutes) before timing out,
   * Interval: The time interval (default: 30 seconds) between polling
   */
  public async resumeSandbox(
    resumeSandboxRequest: ResumeSandboxRequest,
    options: { wait?: Duration; interval?: Duration; async?: boolean } = {
      wait: Duration.minutes(0),
      async: false,
      interval: Duration.seconds(30),
    }
  ): Promise<SandboxProcessObject> {
    this.logger.debug(resumeSandboxRequest, 'ResumeSandbox called with ResumeSandboxRequest');
    let sandboxCreationProgress: SandboxProcessObject;
    // seed the sandboxCreationProgress via the resumeSandboxRequest options
    if (resumeSandboxRequest.SandboxProcessObjId) {
      sandboxCreationProgress = await this.querySandboxProcessById(resumeSandboxRequest.SandboxProcessObjId);
    } else if (resumeSandboxRequest.SandboxName) {
      try {
        // There can be multiple sandbox processes returned when querying by name. Use the most recent
        // process and fire a warning event with all processes.
        sandboxCreationProgress = await this.querySandboxProcessBySandboxName(resumeSandboxRequest.SandboxName);
      } catch (err) {
        if (err instanceof SfError && err.name === 'SingleRecordQuery_MultipleRecords' && err.data) {
          const sbxProcesses = err.data as SandboxProcessObject[];
          // 0 index will always be the most recently created process since the query sorts on created date desc.
          sandboxCreationProgress = sbxProcesses[0];
          await Lifecycle.getInstance().emit(SandboxEvents.EVENT_MULTIPLE_SBX_PROCESSES, sbxProcesses);
        } else {
          throw err;
        }
      }
    } else {
      throw messages.createError('sandboxNotFound', [
        resumeSandboxRequest.SandboxName ?? resumeSandboxRequest.SandboxProcessObjId,
      ]);
    }
    this.logger.debug(sandboxCreationProgress, 'Return from calling singleRecordQuery with tooling');

    if (!sandboxIsResumable(sandboxCreationProgress.Status)) {
      throw messages.createError('sandboxNotResumable', [
        sandboxCreationProgress.SandboxName,
        sandboxCreationProgress.Status,
      ]);
    }

    await Lifecycle.getInstance().emit(SandboxEvents.EVENT_RESUME, sandboxCreationProgress);

    const [wait, pollInterval] = this.validateWaitOptions(options);
    // if wait is 0, return the sandboxCreationProgress immediately
    if (wait.seconds === 0) {
      if (sandboxCreationProgress.Status === 'Completed') {
        // check to see if sandbox can authenticate via sandboxAuth endpoint
        const sandboxInfo = await this.sandboxSignupComplete(sandboxCreationProgress);
        if (sandboxInfo) {
          await Lifecycle.getInstance().emit(SandboxEvents.EVENT_AUTH, sandboxInfo);
          try {
            this.logger.debug(sandboxInfo, 'sandbox signup complete');
            await this.writeSandboxAuthFile(sandboxCreationProgress, sandboxInfo);
            return sandboxCreationProgress;
          } catch (err) {
            // eat the error, we don't want to throw an error if we can't write the file
          }
        }
      }
      await Lifecycle.getInstance().emit(SandboxEvents.EVENT_ASYNC_RESULT, sandboxCreationProgress);
      throw messages.createError('sandboxCreateNotComplete');
    }

    this.logger.debug(
      sandboxCreationProgress,
      `resume - pollStatusAndAuth sandboxProcessObj, max wait time of ${wait.minutes} minutes`
    );
    return this.pollStatusAndAuth({
      sandboxProcessObj: sandboxCreationProgress,
      wait,
      pollInterval,
    });
  }

  /**
   * Creates a scratchOrg
   * 'this' needs to be a valid dev-hub
   *
   * @param {options} ScratchOrgCreateOptions
   * @returns {ScratchOrgCreateResult}
   */

  public async scratchOrgCreate(options: ScratchOrgRequest): Promise<ScratchOrgCreateResult> {
    return scratchOrgCreate({ ...options, hubOrg: this });
  }

  /**
   * Reports sandbox org creation status. If the org is ready, authenticates to the org.
   *
   * @param {sandboxname} string the sandbox name
   * @param options Wait: The amount of time to wait before timing out, Interval: The time interval between polling
   * @returns {SandboxProcessObject} the sandbox process object
   */
  public async sandboxStatus(
    sandboxname: string,
    options: { wait?: Duration; interval?: Duration }
  ): Promise<SandboxProcessObject> {
    return this.authWithRetriesByName(sandboxname, options);
  }

  /**
   * Clean all data files in the org's data path. Usually <workspace>/.sfdx/orgs/<username>.
   *
   * @param orgDataPath A relative path other than "orgs/".
   * @param throwWhenRemoveFails Should the remove org operations throw an error on failure?
   */

  public async cleanLocalOrgData(orgDataPath?: string, throwWhenRemoveFails = false): Promise<void> {
    let dataPath: string;
    try {
      dataPath = await this.getLocalDataDir(orgDataPath);
      this.logger.debug(`cleaning data for path: ${dataPath}`);
    } catch (err) {
      if (err instanceof Error && err.name === 'InvalidProjectWorkspaceError') {
        // If we aren't in a project dir, we can't clean up data files.
        // If the user unlink this org outside of the workspace they used it in,
        // data files will be left over.
        return;
      }
      throw err;
    }

    return this.manageDelete(async () => fs.promises.rmdir(dataPath), dataPath, throwWhenRemoveFails);
  }

  /**
   * @ignore
   */
  public async retrieveOrgUsersConfig(): Promise<OrgUsersConfig> {
    return OrgUsersConfig.create(OrgUsersConfig.getOptions(this.getOrgId()));
  }

  /**
   * Cleans up all org related artifacts including users, sandbox config (if a sandbox), source tracking files, and auth file.
   *
   * @param throwWhenRemoveFails Determines if the call should throw an error or fail silently.
   */
  public async remove(throwWhenRemoveFails = false): Promise<void> {
    // If deleting via the access token there shouldn't be any auth config files
    // so just return;
    if (this.getConnection().isUsingAccessToken()) {
      return Promise.resolve();
    }
    await this.removeSandboxConfig();
    await this.removeUsers(throwWhenRemoveFails);
    await this.removeUsersConfig();
    // An attempt to remove this org's auth file occurs in this.removeUsersConfig. That's because this org's usersname is also
    // included in the OrgUser config file.
    //
    // So, just in case no users are added to this org we will try the remove again.
    await this.removeAuth();
    await this.removeSourceTrackingFiles();
  }

  /**
   * Check if org is a sandbox org by checking its SandboxOrgConfig.
   *
   */
  public async isSandbox(): Promise<boolean> {
    return (await StateAggregator.getInstance()).sandboxes.hasFile(this.getOrgId());
  }
  /**
   * Check that this org is a scratch org by asking the dev hub if it knows about it.
   *
   * **Throws** *{@link SfError}{ name: 'NotADevHubError' }* Not a Dev Hub.
   *
   * **Throws** *{@link SfError}{ name: 'NoResultsError' }* No results.
   *
   * @param devHubUsernameOrAlias The username or alias of the dev hub org.
   */
  public async checkScratchOrg(devHubUsernameOrAlias?: string): Promise<Partial<AuthFields>> {
    let aliasOrUsername = devHubUsernameOrAlias;
    if (!aliasOrUsername) {
      aliasOrUsername = this.configAggregator.getPropertyValue<string>(OrgConfigProperties.TARGET_DEV_HUB);
    }

    const devHubConnection = (await Org.create({ aliasOrUsername })).getConnection();

    const thisOrgAuthConfig = this.getConnection().getAuthInfoFields();

    const trimmedId = trimTo15(thisOrgAuthConfig.orgId);

    const DEV_HUB_SOQL = `SELECT CreatedDate,Edition,ExpirationDate FROM ActiveScratchOrg WHERE ScratchOrg='${
      trimmedId ?? '<undefined>'
    }'`;

    try {
      const results = await devHubConnection.query(DEV_HUB_SOQL);
      if (results.records.length !== 1) {
        throw new SfError('No results', 'NoResultsError');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'INVALID_TYPE') {
        throw messages.createError('notADevHub', [devHubConnection.getUsername()]);
      }
      throw err;
    }

    return thisOrgAuthConfig;
  }

  /**
   * Returns the Org object or null if this org is not affiliated with a Dev Hub (according to the local config).
   */
  public async getDevHubOrg(): Promise<Org | undefined> {
    if (this.isDevHubOrg()) {
      return this;
    } else if (this.getField(Org.Fields.DEV_HUB_USERNAME)) {
      const devHubUsername = ensureString(this.getField(Org.Fields.DEV_HUB_USERNAME));
      return Org.create({
        connection: await Connection.create({
          authInfo: await AuthInfo.create({ username: devHubUsername }),
        }),
      });
    }
  }

  /**
   * Returns `true` if the org is a Dev Hub.
   *
   * **Note** This relies on a cached value in the auth file. If that property
   * is not cached, this method will **always return false even if the org is a
   * dev hub**. If you need accuracy, use the {@link Org.determineIfDevHubOrg} method.
   */
  public isDevHubOrg(): boolean {
    const isDevHub = this.getField(Org.Fields.IS_DEV_HUB);
    if (isBoolean(isDevHub)) {
      return isDevHub;
    } else {
      return false;
    }
  }

  /**
   * Will delete 'this' instance remotely and any files locally
   *
   * @param controllingOrg username or Org that 'this.devhub' or 'this.production' refers to. AKA a DevHub for a scratch org, or a Production Org for a sandbox
   */
  public async deleteFrom(controllingOrg: string | Org): Promise<void> {
    const resolvedOrg =
      typeof controllingOrg === 'string'
        ? await Org.create({
            aggregator: this.configAggregator,
            aliasOrUsername: controllingOrg,
          })
        : controllingOrg;
    if (await this.isSandbox()) {
      await this.deleteSandbox(resolvedOrg);
    } else {
      await this.deleteScratchOrg(resolvedOrg);
    }
  }

  /**
   * Will delete 'this' instance remotely and any files locally
   */
  public async delete(): Promise<void> {
    const username = ensureString(this.getUsername());

    // unset any aliases referencing this org
    const stateAgg = await StateAggregator.getInstance();
    const existingAliases = stateAgg.aliases.getAll(username);
    await stateAgg.aliases.unsetValuesAndSave(existingAliases);

    // unset any configs referencing this org
    await Promise.all([...existingAliases, username].flatMap((name) => this.configAggregator.unsetByValue(name)));

    if (await this.isSandbox()) {
      await this.deleteSandbox();
    } else {
      await this.deleteScratchOrg();
    }
  }

  /**
   * Returns `true` if the org is a Dev Hub.
   *
   * Use a cached value. If the cached value is not set, then check access to the
   * ScratchOrgInfo object to determine if the org is a dev hub.
   *
   * @param forceServerCheck Ignore the cached value and go straight to the server
   * which will be required if the org flips on the dev hub after the value is already
   * cached locally.
   */
  public async determineIfDevHubOrg(forceServerCheck = false): Promise<boolean> {
    const cachedIsDevHub = this.getField(Org.Fields.IS_DEV_HUB);
    if (!forceServerCheck && isBoolean(cachedIsDevHub)) {
      return cachedIsDevHub;
    }
    if (this.isDevHubOrg()) {
      return true;
    }
    this.logger.debug('isDevHub is not cached - querying server...');
    const conn = this.getConnection();
    let isDevHub = false;
    try {
      await conn.query('SELECT Id FROM ScratchOrgInfo limit 1');
      isDevHub = true;
    } catch (err) {
      /* Not a dev hub */
    }

    const username = ensure(this.getUsername());
    const authInfo = await AuthInfo.create({ username });
    await authInfo.save({ isDevHub });
    // Reset the connection with the updated auth file
    this.connection = await Connection.create({ authInfo });
    return isDevHub;
  }

  /**
   * Returns `true` if the org is a scratch org.
   *
   * **Note** This relies on a cached value in the auth file. If that property
   * is not cached, this method will **always return false even if the org is a
   * scratch org**. If you need accuracy, use the {@link Org.determineIfScratch} method.
   */
  public isScratch(): boolean {
    const isScratch = this.getField(Org.Fields.IS_SCRATCH);
    if (isBoolean(isScratch)) {
      return isScratch;
    } else {
      return false;
    }
  }

  /**
   * Returns `true` if the org uses source tracking.
   * Side effect: updates files where the property doesn't currently exist
   */
  public async tracksSource(): Promise<boolean> {
    // use the property if it exists
    const tracksSource = this.getField(Org.Fields.TRACKS_SOURCE);
    if (isBoolean(tracksSource)) {
      return tracksSource;
    }
    // scratch orgs with no property use tracking by default
    if (await this.determineIfScratch()) {
      // save true for next time to avoid checking again
      await this.setTracksSource(true);
      return true;
    }
    if (await this.determineIfSandbox()) {
      // does the sandbox know about the SourceMember object?
      const supportsSourceMembers = await this.supportsSourceTracking();
      await this.setTracksSource(supportsSourceMembers);
      return supportsSourceMembers;
    }
    // any other non-sandbox, non-scratch orgs won't use tracking
    await this.setTracksSource(false);
    return false;
  }

  /**
   * Set the tracking property on the org's auth file
   *
   * @param value true or false (whether the org should use source tracking or not)
   */
  public async setTracksSource(value: boolean): Promise<void> {
    const originalAuth = await AuthInfo.create({ username: this.getUsername() });
    return originalAuth.handleAliasAndDefaultSettings({
      setDefault: false,
      setDefaultDevHub: false,
      setTracksSource: value,
    });
  }

  /**
   * Returns `true` if the org is a scratch org.
   *
   * Use a cached value. If the cached value is not set, then check
   * `Organization.IsSandbox == true && Organization.TrialExpirationDate != null`
   * using {@link Org.retrieveOrganizationInformation}.
   */
  public async determineIfScratch(): Promise<boolean> {
    const cache = this.getField<boolean | undefined>(Org.Fields.IS_SCRATCH);
    if (cache !== undefined) {
      return cache;
    }
    const updated = await this.updateLocalInformation();
    return updated?.isScratch === true;
  }

  /**
   * Returns `true` if the org is a sandbox.
   *
   * Use a cached value. If the cached value is not set, then check
   * `Organization.IsSandbox == true && Organization.TrialExpirationDate == null`
   * using {@link Org.retrieveOrganizationInformation}.
   */
  public async determineIfSandbox(): Promise<boolean> {
    const cache = this.getField<boolean | undefined>(Org.Fields.IS_SANDBOX);
    if (cache !== undefined) {
      return cache;
    }
    const updated = await this.updateLocalInformation();
    return updated?.isSandbox === true;
  }

  /**
   * Retrieve a handful of fields from the Organization table in Salesforce. If this does not have the
   * data you need, just use {@link Connection.singleRecordQuery} with `SELECT <needed fields> FROM Organization`.
   *
   * @returns org information
   */
  public async retrieveOrganizationInformation(): Promise<OrganizationInformation> {
    return this.getConnection().singleRecordQuery<OrganizationInformation>(
      'SELECT Name, InstanceName, IsSandbox, TrialExpirationDate, NamespacePrefix FROM Organization'
    );
  }

  public async querySandboxInfo(by: SandboxInfoQueryFields): Promise<SandboxInfo> {
    if (by.id) {
      // Validate that the ID is a valid Salesforce ID
      if (!validateSalesforceId(by.id)) {
        throw new SfError(`Invalid Salesforce ID format: ${by.id}`, 'InvalidSalesforceId');
      }
    }

    const whereClause = by.id ? `Id='${by.id}'` : `SandboxName='${by.name ?? '<undefined>'}'`;
    const soql = `SELECT ${sandboxInfoFields.join(
      ','
    )} FROM SandboxInfo WHERE ${whereClause} ORDER BY CreatedDate DESC`;
    const result = (await this.connection.tooling.query<SandboxInfo>(soql)).records.filter((item) => !item.IsDeleted);

    if (result.length === 0) {
      throw new SfError(`No record found for ${soql}`, SingleRecordQueryErrors.NoRecords);
    }
    if (result.length > 1) {
      const err = new SfError('The query returned more than 1 record', SingleRecordQueryErrors.MultipleRecords);
      err.data = result;
      throw err;
    }
    return result[0];
  }

  /**
   * Some organization information is locally cached, such as if the org name or if it is a scratch org.
   * This method populates/updates the filesystem from information retrieved from the org.
   */
  public async updateLocalInformation(): Promise<
    | Pick<
        AuthFields,
        | Org.Fields.NAME
        | Org.Fields.INSTANCE_NAME
        | Org.Fields.NAMESPACE_PREFIX
        | Org.Fields.IS_SANDBOX
        | Org.Fields.IS_SCRATCH
        | Org.Fields.TRIAL_EXPIRATION_DATE
      >
    | undefined
  > {
    const username = this.getUsername();
    if (username) {
      const [stateAggregator, organization] = await Promise.all([
        StateAggregator.getInstance(),
        this.retrieveOrganizationInformation(),
      ]);
      const updateFields = {
        [Org.Fields.NAME]: organization.Name,
        [Org.Fields.INSTANCE_NAME]: organization.InstanceName,
        [Org.Fields.NAMESPACE_PREFIX]: organization.NamespacePrefix,
        [Org.Fields.IS_SANDBOX]: organization.IsSandbox && !organization.TrialExpirationDate,
        [Org.Fields.IS_SCRATCH]: organization.IsSandbox && Boolean(organization.TrialExpirationDate),
        [Org.Fields.TRIAL_EXPIRATION_DATE]: organization.TrialExpirationDate,
      };
      stateAggregator.orgs.update(username, updateFields);
      await stateAggregator.orgs.write(username);
      return updateFields;
    }
  }

  /**
   * Executes a GET request on the baseUrl to force an auth refresh.
   * This is useful for the raw methods (request, requestRaw) that use the accessToken directly and don't handle refreshes.
   *
   * This method issues a request using the current access token to check if it is still valid.
   * If the request returns 200, no refresh happens, and we keep the token.
   * If it returns 401, jsforce will request a new token and set it in the connection instance.
   */

  public async refreshAuth(): Promise<ReturnType<Connection['refreshAuth']>> {
    await this.getConnection().refreshAuth();
  }

  /**
   * Reads and returns the content of all user auth files for this org as an array.
   */
  public async readUserAuthFiles(): Promise<AuthInfo[]> {
    const config: OrgUsersConfig = await this.retrieveOrgUsersConfig();
    const contents: ConfigContents = await config.read();
    const thisUsername = ensure(this.getUsername());
    const usernames: JsonArray = ensureJsonArray(contents.usernames ?? [thisUsername]);
    return Promise.all(
      usernames.map((username) =>
        AuthInfo.create({
          username: username === thisUsername ? this.getConnection().getUsername() : ensureString(username),
        })
      )
    );
  }

  /**
   * Adds a username to the user config for this org. For convenience `this` object is returned.
   *
   * ```
   * const org: Org = await Org.create({
   *   connection: await Connection.create({
   *     authInfo: await AuthInfo.create('foo@example.com')
   *   })
   * });
   * const userAuth: AuthInfo = await AuthInfo.create({
   *   username: 'bar@example.com'
   * });
   * await org.addUsername(userAuth);
   * ```
   *
   * @param {AuthInfo | string} auth The AuthInfo for the username to add.
   */
  public async addUsername(auth: AuthInfo | string): Promise<Org> {
    if (!auth) {
      throw new SfError('Missing auth info', 'MissingAuthInfo');
    }

    const authInfo = isString(auth) ? await AuthInfo.create({ username: auth }) : auth;
    this.logger.debug(`adding username ${authInfo.getFields().username ?? '<undefined>'}`);

    const orgConfig = await this.retrieveOrgUsersConfig();

    const contents = await orgConfig.read();
    // TODO: This is kind of screwy because contents values can be `AnyJson | object`...
    // needs config refactoring to improve
    const usernames = contents.usernames ?? [];

    if (!Array.isArray(usernames)) {
      throw new SfError('Usernames is not an array', 'UnexpectedDataFormat');
    }

    let shouldUpdate = false;

    const thisUsername = ensure(this.getUsername());
    if (!usernames.includes(thisUsername)) {
      usernames.push(thisUsername);
      shouldUpdate = true;
    }

    const username = authInfo.getFields().username;
    if (username) {
      usernames.push(username);
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      orgConfig.set('usernames', usernames);
      await orgConfig.write();
    }

    return this;
  }

  /**
   * Removes a username from the user config for this object. For convenience `this` object is returned.
   *
   * **Throws** *{@link SfError}{ name: 'MissingAuthInfoError' }* Auth info is missing.
   *
   * @param {AuthInfo | string} auth The AuthInfo containing the username to remove.
   */
  public async removeUsername(auth: AuthInfo | string): Promise<Org> {
    if (!auth) {
      throw new SfError('Missing auth info', 'MissingAuthInfoError');
    }

    const authInfo: AuthInfo = isString(auth) ? await AuthInfo.create({ username: auth }) : auth;

    this.logger.debug(`removing username ${authInfo.getFields().username ?? '<undefined>'}`);

    const orgConfig: OrgUsersConfig = await this.retrieveOrgUsersConfig();
    const contents = await orgConfig.read();

    const targetUser = authInfo.getFields().username;

    const usernames = (contents.usernames ?? []).filter((username) => username !== targetUser);

    orgConfig.set('usernames', usernames);
    await orgConfig.write();
    return this;
  }

  /**
   * set the sandbox config related to this given org
   *
   * @param orgId {string} orgId of the sandbox
   * @param config {SandboxFields} config of the sandbox
   */
  public async setSandboxConfig(orgId: string, config: SandboxFields): Promise<Org> {
    (await StateAggregator.getInstance()).sandboxes.set(orgId, config);
    return this;
  }

  /**
   * get the sandbox config for the given orgId
   *
   * @param orgId {string} orgId of the sandbox
   */
  public async getSandboxConfig(orgId: string): Promise<Nullable<SandboxFields>> {
    return (await StateAggregator.getInstance()).sandboxes.read(orgId);
  }

  /**
   * Retrieves the highest api version that is supported by the target server instance. If the apiVersion configured for
   * Sfdx is greater than the one returned in this call an api version mismatch occurs. In the case of the CLI that
   * results in a warning.
   */
  public async retrieveMaxApiVersion(): Promise<string> {
    return this.getConnection().retrieveMaxApiVersion();
  }

  /**
   * Returns the admin username used to create the org.
   */
  public getUsername(): string | undefined {
    return this.getConnection().getUsername();
  }

  /**
   * Returns the orgId for this org.
   */
  public getOrgId(): string {
    return this.orgId ?? this.getField(Org.Fields.ORG_ID);
  }

  /**
   * Returns for the config aggregator.
   */
  public getConfigAggregator(): ConfigAggregator {
    return this.configAggregator;
  }

  /**
   * Returns an org field. Returns undefined if the field is not set or invalid.
   */
  public getField<T = AnyJson>(key: Org.Fields): T {
    /* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    // @ts-ignore Legacy. We really shouldn't be doing this.
    const ownProp = this[key];
    if (ownProp && typeof ownProp !== 'function') return ownProp;
    // @ts-ignore
    return this.getConnection().getAuthInfoFields()[key];
    /* eslint-enable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
  }

  /**
   * Returns a map of requested fields.
   */
  public getFields(keys: Org.Fields[]): JsonMap {
    return Object.fromEntries(keys.map((key) => [key, this.getField(key)]));
  }

  /**
   * Returns the JSForce connection for the org.
   * side effect: If you pass it an apiVersion, it will set it on the Org
   * so that future calls to getConnection() will also use that version.
   *
   * @param apiVersion The API version to use for the connection.
   */
  public getConnection(apiVersion?: string): Connection {
    if (apiVersion) {
      if (this.connection.getApiVersion() === apiVersion) {
        this.logger.warn(`Default API version is already ${apiVersion}`);
      } else {
        this.connection.setApiVersion(apiVersion);
      }
    }

    return this.connection;
  }

  public async supportsSourceTracking(): Promise<boolean> {
    if (this.isScratch()) {
      return true;
    }
    try {
      await this.getConnection().tooling.sobject('SourceMember').describe();
      return true;
    } catch (err) {
      if ((err as Error).message.includes('The requested resource does not exist')) {
        return false;
      }
      throw err;
    }
  }

  /**
   * query SandboxProcess via sandbox name
   *
   * @param name SandboxName to query for
   */
  public async querySandboxProcessBySandboxName(name: string): Promise<SandboxProcessObject> {
    return this.querySandboxProcess(`SandboxName='${name}'`);
  }

  /**
   * query SandboxProcess via SandboxInfoId
   *
   * @param id SandboxInfoId to query for
   */
  public async querySandboxProcessBySandboxInfoId(id: string): Promise<SandboxProcessObject> {
    return this.querySandboxProcess(`SandboxInfoId='${id}'`);
  }

  /**
   * query SandboxProcess via Id
   *
   * @param id SandboxProcessId to query for
   */
  public async querySandboxProcessById(id: string): Promise<SandboxProcessObject> {
    return this.querySandboxProcess(`Id='${id}'`);
  }

  /**
   * query SandboxProcess via SandboxOrganization (sandbox Org ID)
   *
   * @param sandboxOrgId SandboxOrganization ID to query for
   */
  public async querySandboxProcessByOrgId(sandboxOrgId: string): Promise<SandboxProcessObject> {
    // Must query with a 15 character Org ID
    return this.querySandboxProcess(`SandboxOrganization='${trimTo15(sandboxOrgId)}'`);
  }

  /**
   * Initialize async components.
   */
  protected async init(): Promise<void> {
    this.logger = (await Logger.child('Org')).getRawLogger();
    this.configAggregator = this.options.aggregator ?? (await ConfigAggregator.create());

    if (!this.options.connection) {
      const stateAggregator = await StateAggregator.getInstance();
      if (this.options.aliasOrUsername == null) {
        this.configAggregator = this.getConfigAggregator();
        const aliasOrUsername = this.options.isDevHub
          ? this.configAggregator.getPropertyValue<string>(OrgConfigProperties.TARGET_DEV_HUB)
          : this.configAggregator.getPropertyValue<string>(OrgConfigProperties.TARGET_ORG);
        this.options.aliasOrUsername = aliasOrUsername ?? undefined;
      }

      const username = stateAggregator.aliases.resolveUsername(this.options.aliasOrUsername as string);
      if (!username) {
        throw messages.createError('noUsernameFound');
      }
      this.connection = await Connection.create({
        // If no username is provided or resolvable from an alias, AuthInfo will throw an SfError.
        authInfo: await AuthInfo.create({ username, isDevHub: this.options.isDevHub }),
      });
    } else {
      this.connection = this.options.connection;
    }
    this.orgId = this.getField(Org.Fields.ORG_ID);
  }

  /**
   * **Throws** *{@link SfError}{ name: 'NotSupportedError' }* Throws an unsupported error.
   */
  // eslint-disable-next-line class-methods-use-this
  protected getDefaultOptions(): Org.Options {
    throw new SfError('Not Supported', 'NotSupportedError');
  }

  private async getLocalDataDir(orgDataPath: Nullable<string>): Promise<string> {
    const rootFolder: string = await Config.resolveRootFolder(false);
    return path.join(rootFolder, Global.SFDX_STATE_FOLDER, orgDataPath ? orgDataPath : 'orgs');
  }

  /**
   * Gets the sandboxProcessObject and then polls for it to complete.
   *
   * @param sandboxProcessName sanbox process name
   * @param options { wait?: Duration; interval?: Duration }
   * @returns {SandboxProcessObject} The SandboxProcessObject for the sandbox
   */
  private async authWithRetriesByName(
    sandboxProcessName: string,
    options: { wait?: Duration; interval?: Duration }
  ): Promise<SandboxProcessObject> {
    return this.authWithRetries(await this.queryLatestSandboxProcessBySandboxName(sandboxProcessName), options);
  }

  /**
   * Polls the sandbox org for the sandboxProcessObject.
   *
   * @param sandboxProcessObj: The in-progress sandbox signup request
   * @param options { wait?: Duration; interval?: Duration }
   * @returns {SandboxProcessObject}
   */
  private async authWithRetries(
    sandboxProcessObj: SandboxProcessObject,
    options: { wait?: Duration; interval?: Duration } = {
      wait: Duration.minutes(0),
      interval: Duration.seconds(30),
    }
  ): Promise<SandboxProcessObject> {
    const [wait, pollInterval] = this.validateWaitOptions(options);
    this.logger.debug(sandboxProcessObj, `AuthWithRetries sandboxProcessObj, max wait time of ${wait.minutes} minutes`);
    return this.pollStatusAndAuth({
      sandboxProcessObj,
      wait,
      pollInterval,
    });
  }

  /**
   * Query the sandbox for the SandboxProcessObject by sandbox name
   *
   * @param sandboxName The name of the sandbox to query
   * @returns {SandboxProcessObject} The SandboxProcessObject for the sandbox
   */
  private async queryLatestSandboxProcessBySandboxName(sandboxNameIn: string): Promise<SandboxProcessObject> {
    const { tooling } = this.getConnection();
    this.logger.debug(`QueryLatestSandboxProcessBySandboxName called with SandboxName: ${sandboxNameIn}`);
    const queryStr = `SELECT ${sandboxProcessFields.join(
      ','
    )} FROM SandboxProcess WHERE SandboxName='${sandboxNameIn}' AND Status != 'D' ORDER BY CreatedDate DESC LIMIT 1`;

    const queryResult = await tooling.query(queryStr);
    this.logger.debug(queryResult, 'Return from calling queryToolingApi');
    if (queryResult?.records?.length === 1) {
      return queryResult.records[0] as SandboxProcessObject;
    } else if (queryResult.records && queryResult.records.length > 1) {
      throw messages.createError('MultiSandboxProcessNotFoundBySandboxName', [sandboxNameIn]);
    } else {
      throw messages.createError('SandboxProcessNotFoundBySandboxName', [sandboxNameIn]);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private async queryProduction(org: Org, field: string, value: string): Promise<{ SandboxInfoId: string }> {
    return org.connection.singleRecordQuery<{ SandboxInfoId: string }>(
      `SELECT SandboxInfoId FROM SandboxProcess WHERE ${field} ='${value}' AND Status NOT IN ('D', 'E')`,
      { tooling: true }
    );
  }

  private async destroySandbox(org: Org, id: string): Promise<SaveResult> {
    return org.getConnection().tooling.delete('SandboxInfo', id);
  }

  private async destroyScratchOrg(org: Org, id: string): Promise<SaveResult> {
    return org.getConnection().delete('ActiveScratchOrg', id);
  }

  /**
   * this method will delete the sandbox org from the production org and clean up any local files
   *
   * @param prodOrg - Production org associated with this sandbox
   * @private
   */
  private async deleteSandbox(prodOrg?: Org): Promise<void> {
    const sandbox = await this.getSandboxConfig(this.getOrgId());
    const resolvedProdOrg =
      prodOrg ??
      (await Org.create({
        aggregator: this.configAggregator,
        aliasOrUsername: sandbox?.prodOrgUsername,
      }));
    let sandboxInfoId: string | undefined = sandbox?.sandboxInfoId;
    if (!sandboxInfoId) {
      let result: { SandboxInfoId: string };
      try {
        // grab sandboxName from config or try to calculate from the sandbox username
        const sandboxName =
          sandbox?.sandboxName ??
          (this.getUsername() ?? '').split(`${resolvedProdOrg.getUsername() ?? '<undefined>'}.`)[1];
        if (!sandboxName) {
          this.logger.debug('Sandbox name is not available');
          // jump to query by orgId
          throw new Error();
        }
        this.logger.debug(`attempting to locate sandbox with sandbox ${sandboxName}`);
        try {
          result = await this.queryProduction(resolvedProdOrg, 'SandboxName', sandboxName);
        } catch (err) {
          this.logger.debug(`Failed to find sandbox with sandbox name: ${sandboxName}`);
          // jump to query by orgId
          throw err;
        }
      } catch {
        // if an error is thrown, don't panic yet. we'll try querying by orgId
        const trimmedId = trimTo15(this.getOrgId());
        this.logger.debug(`defaulting to trimming id from ${this.getOrgId()} to ${trimmedId}`);
        try {
          result = await this.queryProduction(resolvedProdOrg, 'SandboxOrganization', trimmedId);
          sandboxInfoId = result.SandboxInfoId;
        } catch {
          // eating exceptions when trying to find sandbox process record by orgId
          // allows idempotent cleanup of sandbox orgs
          this.logger.debug(`Failed find a SandboxProcess for the sandbox org: ${this.getOrgId()}`);
        }
      }
    }

    if (sandboxInfoId) {
      const deleteResult = await this.destroySandbox(resolvedProdOrg, sandboxInfoId);
      this.logger.debug(deleteResult, 'Return from calling tooling.delete');
    }
    // cleanup remaining artifacts
    await this.remove();
  }

  /**
   * If this Org is a scratch org, calling this method will delete the scratch org from the DevHub and clean up any local files
   *
   * @param devHub - optional DevHub Org of the to-be-deleted scratch org
   * @private
   */
  private async deleteScratchOrg(devHub?: Org): Promise<void> {
    // if we didn't get a devHub, we'll get it from the this org
    const resolvedDevHub = devHub ?? (await this.getDevHubOrg());
    if (!resolvedDevHub) {
      throw messages.createError('noDevHubFound');
    }
    if (resolvedDevHub.getOrgId() === this.getOrgId()) {
      // we're attempting to delete a DevHub
      throw messages.createError('deleteOrgHubError');
    }

    try {
      const devHubConn = resolvedDevHub.getConnection();
      const username = ensureString(this.getUsername(), 'org is missing username');

      const activeScratchOrgRecordId = (
        await devHubConn.singleRecordQuery<{ Id: string }>(
          `SELECT Id FROM ActiveScratchOrg WHERE SignupUsername='${username}'`
        )
      ).Id;
      this.logger.trace(`found matching ActiveScratchOrg with SignupUsername: ${username}.  Deleting...`);
      await this.destroyScratchOrg(resolvedDevHub, activeScratchOrgRecordId);
      await this.remove();
    } catch (err) {
      this.logger.info(err instanceof Error ? err.message : err);
      if (err instanceof Error && (err.name === 'INVALID_TYPE' || err.name === 'INSUFFICIENT_ACCESS_OR_READONLY')) {
        // most likely from devHubConn.delete
        this.logger.info('Insufficient privilege to access ActiveScratchOrgs.');
        throw messages.createError('insufficientAccessToDelete');
      }
      if (err instanceof Error && err.name === SingleRecordQueryErrors.NoRecords) {
        // most likely from singleRecordQuery
        this.logger.info('The above error can be the result of deleting an expired or already deleted org.');
        this.logger.info('attempting to cleanup the auth file');
        await this.removeAuth();
        throw messages.createError('scratchOrgNotFound');
      }
      throw err;
    }
  }

  /**
   * Delete an auth info file from the local file system and any related cache information for
   * this Org. You don't want to call this method directly. Instead consider calling Org.remove()
   */
  private async removeAuth(): Promise<void> {
    const stateAggregator = await StateAggregator.getInstance();
    const username = this.getUsername();
    // If there is no username, it has already been removed from the globalInfo.
    // We can skip the unset and just ensure that globalInfo is updated.
    if (username) {
      this.logger.debug(`Removing auth for user: ${username}`);
      this.logger.debug(`Clearing auth cache for user: ${username}`);
      await stateAggregator.orgs.remove(username);
    }
  }

  /**
   * Deletes the users config file
   */
  private async removeUsersConfig(): Promise<void> {
    const config = await this.retrieveOrgUsersConfig();
    if (await config.exists()) {
      this.logger.debug(`Removing org users config at: ${config.getPath()}`);
      await config.unlink();
    }
  }

  private async manageDelete(
    cb: AnyFunction<Promise<void>>,
    dirPath: string,
    throwWhenRemoveFails: boolean
  ): Promise<void> {
    return cb().catch((e) => {
      if (throwWhenRemoveFails) {
        throw e;
      } else {
        this.logger.warn(`failed to read directory ${dirPath}`);
        return;
      }
    });
  }

  /**
   * Remove the org users auth file.
   *
   * @param throwWhenRemoveFails true if manageDelete should throw or not if the deleted fails.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async removeUsers(throwWhenRemoveFails: boolean): Promise<void> {
    const stateAggregator = await StateAggregator.getInstance();
    this.logger.debug(`Removing users associate with org: ${this.getOrgId()}`);
    const config = await this.retrieveOrgUsersConfig();
    this.logger.debug(`using path for org users: ${config.getPath()}`);

    const usernames = (await this.readUserAuthFiles()).map((auth) => auth.getFields().username).filter(isString);

    await Promise.all(
      usernames.map(async (username) => {
        const orgForUser =
          username === this.getUsername()
            ? this
            : await Org.create({
                connection: await Connection.create({ authInfo: await AuthInfo.create({ username }) }),
              });

        const orgType = this.isDevHubOrg() ? OrgConfigProperties.TARGET_DEV_HUB : OrgConfigProperties.TARGET_ORG;
        const configInfo = orgForUser.configAggregator.getInfo(orgType);
        const needsConfigUpdate =
          (configInfo.isGlobal() || configInfo.isLocal()) &&
          (configInfo.value === username || stateAggregator.aliases.get(configInfo.value as string) === username);

        return [
          orgForUser.removeAuth(),
          needsConfigUpdate ? Config.update(configInfo.isGlobal(), orgType, undefined) : undefined,
        ].filter(Boolean);
      })
    );

    // now that we're done with all the aliases, we can unset those
    await stateAggregator.aliases.unsetValuesAndSave(usernames);
  }

  private async removeSandboxConfig(): Promise<void> {
    const stateAggregator = await StateAggregator.getInstance();
    await stateAggregator.sandboxes.remove(this.getOrgId());
  }

  private async writeSandboxAuthFile(
    sandboxProcessObj: SandboxProcessObject,
    sandboxRes: SandboxUserAuthResponse
  ): Promise<void> {
    this.logger.debug(sandboxProcessObj, 'writeSandboxAuthFile sandboxProcessObj');
    this.logger.debug(sandboxRes, 'writeSandboxAuthFile sandboxRes');
    if (sandboxRes.authUserName) {
      const productionAuthFields = this.connection.getAuthInfoFields();
      this.logger.debug(productionAuthFields, 'Result from getAuthInfoFields: AuthFields');

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

      // Before creating the AuthInfo, delete any existing auth files for the sandbox.
      // This is common when refreshing sandboxes, and will cause AuthInfo to throw
      // because it doesn't want to overwrite existing auth files.
      const stateAggregator = await StateAggregator.getInstance();
      try {
        await stateAggregator.orgs.read(sandboxRes.authUserName);
        await stateAggregator.orgs.remove(sandboxRes.authUserName);
      } catch (e) {
        // ignore since this is only for deleting existing auth files.
      }

      const authInfo = await AuthInfo.create({
        username: sandboxRes.authUserName,
        oauth2Options,
        parentUsername: productionAuthFields.username,
      });

      this.logger.debug(
        {
          sandboxResAuthUsername: sandboxRes.authUserName,
          productionAuthFieldsUsername: productionAuthFields.username,
          ...oauth2Options,
        },
        'Creating AuthInfo for sandbox'
      );
      // save auth info for sandbox
      await authInfo.save({
        isScratch: false,
        isSandbox: true,
      });

      const sandboxOrgId = authInfo.getFields().orgId;

      if (!sandboxOrgId) {
        throw messages.createError('AuthInfoOrgIdUndefined');
      }
      // set the sandbox config value
      const sfSandbox: SandboxFields = {
        sandboxUsername: sandboxRes.authUserName,
        sandboxOrgId,
        prodOrgUsername: this.getUsername() as string,
        sandboxName: sandboxProcessObj.SandboxName,
        sandboxProcessId: sandboxProcessObj.Id,
        sandboxInfoId: sandboxProcessObj.SandboxInfoId,
        timestamp: new Date().toISOString(),
      };

      await this.setSandboxConfig(sandboxOrgId, sfSandbox);
      await (await StateAggregator.getInstance()).sandboxes.write(sandboxOrgId);

      await Lifecycle.getInstance().emit(SandboxEvents.EVENT_RESULT, {
        sandboxProcessObj,
        sandboxRes,
      } as ResultEvent);
    } else {
      // no authed sandbox user, error
      throw messages.createError('missingAuthUsername', [sandboxProcessObj.SandboxName]);
    }
  }

  private async pollStatusAndAuth(options: {
    sandboxProcessObj: SandboxProcessObject;
    wait: Duration;
    pollInterval: Duration;
  }): Promise<SandboxProcessObject> {
    this.logger.debug(options, 'PollStatusAndAuth called with SandboxProcessObject');
    let remainingWait = options.wait;
    let waitingOnAuth = false;
    const pollingClient = await PollingClient.create({
      poll: async (): Promise<StatusResult> => {
        const sandboxProcessObj = await this.querySandboxProcessById(options.sandboxProcessObj.Id);
        // check to see if sandbox can authenticate via sandboxAuth endpoint
        const sandboxInfo = await this.sandboxSignupComplete(sandboxProcessObj);
        if (sandboxInfo) {
          await Lifecycle.getInstance().emit(SandboxEvents.EVENT_AUTH, sandboxInfo);
          try {
            this.logger.debug(sandboxInfo, 'sandbox signup complete with');
            await this.writeSandboxAuthFile(sandboxProcessObj, sandboxInfo);
            return { completed: true, payload: sandboxProcessObj };
          } catch (err) {
            const error = err as Error;
            this.logger.debug('Exception while calling writeSandboxAuthFile', err);
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
          interval: options.pollInterval.seconds,
          waitingOnAuth,
        } as StatusEvent);
        remainingWait = Duration.seconds(remainingWait.seconds - options.pollInterval.seconds);
        return { completed: false, payload: sandboxProcessObj };
      },
      frequency: options.pollInterval,
      timeout: options.wait,
    });

    return pollingClient.subscribe<SandboxProcessObject>();
  }

  /**
   * query SandboxProcess using supplied where clause
   *
   * @param where clause to query for
   * @private
   */
  private async querySandboxProcess(where: string): Promise<SandboxProcessObject> {
    const soql = `SELECT ${sandboxProcessFields.join(
      ','
    )} FROM SandboxProcess WHERE ${where} ORDER BY CreatedDate DESC`;
    const result = (await this.connection.tooling.query<SandboxProcessObject>(soql)).records.filter(
      (item) => !item.Status.startsWith('Del')
    );
    if (result.length === 0) {
      throw new SfError(`No record found for ${soql}`, SingleRecordQueryErrors.NoRecords);
    }
    if (result.length > 1) {
      const err = new SfError('The query returned more than 1 record', SingleRecordQueryErrors.MultipleRecords);
      err.data = result;
      throw err;
    }
    return result[0];
  }
  /**
   * determines if the sandbox has successfully been created
   *
   * @param sandboxProcessObj sandbox signup progress
   * @private
   */
  private async sandboxSignupComplete(
    sandboxProcessObj: SandboxProcessObject
  ): Promise<SandboxUserAuthResponse | undefined> {
    this.logger.debug('sandboxSignupComplete called with SandboxProcessObject', sandboxProcessObj);
    if (!sandboxProcessObj.EndDate) {
      return;
    }

    try {
      // call server side /sandboxAuth API to auth the sandbox org user with the connected app
      const authFields = this.connection.getAuthInfoFields();
      const callbackUrl = `http://localhost:${await WebOAuthServer.determineOauthPort()}/OauthRedirect`;

      const sandboxReq: SandboxUserAuthRequest = {
        // the sandbox signup has been completed on production, we have production clientId by this point
        clientId: authFields.clientId as string,
        sandboxName: sandboxProcessObj.SandboxName,
        callbackUrl,
      };

      this.logger.debug(sandboxReq, 'Calling sandboxAuth with SandboxUserAuthRequest');

      // eslint-disable-next-line no-underscore-dangle
      const url = `${this.connection.tooling._baseUrl()}/sandboxAuth`;
      const params: HttpRequest = {
        method: 'POST',
        url,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sandboxReq),
      };

      const result: SandboxUserAuthResponse = await this.connection.tooling.request(params);

      this.logger.debug(result, 'Result of calling sandboxAuth');
      return result;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : SfError.wrap(isString(err) ? err : 'unknown');
      // There are cases where the endDate is set before the sandbox has actually completed.
      // In that case, the sandboxAuth call will throw a specific exception.
      if (error?.name === 'INVALID_STATUS') {
        this.logger.debug('Error while authenticating the user:', error.message);
      } else {
        // If it fails for any unexpected reason, rethrow
        throw error;
      }
    }
  }

  private validateWaitOptions(options: {
    wait?: Duration;
    interval?: Duration;
    async?: boolean;
  }): [Duration, Duration] {
    const wait = options.wait ?? Duration.minutes(30);
    const interval = options.interval ?? Duration.seconds(30);
    let pollInterval = options.async ? Duration.seconds(0) : interval;
    // pollInterval cannot be > wait.
    pollInterval = pollInterval.seconds > wait.seconds ? wait : pollInterval;
    return [wait, pollInterval];
  }

  /**
   * removes source tracking files hosted in the project/.sf/orgs/<org id>/
   *
   * @private
   */
  private async removeSourceTrackingFiles(): Promise<void> {
    try {
      const rootFolder = await Config.resolveRootFolder(false);
      await fs.promises.rm(path.join(rootFolder, Global.SF_STATE_FOLDER, 'orgs', this.getOrgId()), {
        recursive: true,
        force: true,
      });
    } catch (e) {
      const err = SfError.wrap(e as string | Error);
      // consume the error in case something  went wrong
      this.logger.debug(`error deleting source tracking information for ${this.getOrgId()} error: ${err.message}`);
    }
  }
}

export namespace Org {
  /**
   * Constructor Options for and Org.
   */
  export type Options = {
    aliasOrUsername?: string;
    connection?: Connection;
    aggregator?: ConfigAggregator;
    isDevHub?: boolean;
  };

  /**
   * Scratch Org status.
   */
  export enum Status {
    /**
     * The scratch org is active.
     */
    ACTIVE = 'ACTIVE',
    /**
     * The scratch org has expired.
     */
    EXPIRED = 'EXPIRED',
    /**
     * The org is a scratch Org but no dev hub is indicated.
     */
    UNKNOWN = 'UNKNOWN',
    /**
     * The dev hub configuration is reporting an active Scratch org but the AuthInfo cannot be found.
     */
    MISSING = 'MISSING',
  }

  /**
   * Org Fields.
   */
  // A subset of fields from AuthInfoFields and properties that are specific to Org,
  // and properties that are defined on Org itself.
  export enum Fields {
    /**
     * The org alias.
     */
    // From AuthInfo
    ALIAS = 'alias',
    CREATED = 'created',

    // From Organization
    NAME = 'name',
    NAMESPACE_PREFIX = 'namespacePrefix',
    INSTANCE_NAME = 'instanceName',
    TRIAL_EXPIRATION_DATE = 'trailExpirationDate',

    /**
     * The Salesforce instance the org was created on. e.g. `cs42`.
     */
    CREATED_ORG_INSTANCE = 'createdOrgInstance',
    /**
     * The username of the dev hub org that created this org. Only populated for scratch orgs.
     */
    DEV_HUB_USERNAME = 'devHubUsername',
    /**
     * The full url of the instance the org lives on.
     */
    INSTANCE_URL = 'instanceUrl',
    /**
     * Is the current org a dev hub org. e.g. They have access to the `ScratchOrgInfo` object.
     */
    IS_DEV_HUB = 'isDevHub',
    /**
     * Is the current org a scratch org. e.g. Organization has IsSandbox == true and TrialExpirationDate != null.
     */
    IS_SCRATCH = 'isScratch',
    /**
     * Is the current org a sandbox (not a scratch org on a non-prod instance), but an actual Sandbox org). e.g. Organization has IsSandbox == true and TrialExpirationDate == null.
     */
    IS_SANDBOX = 'isSandbox',
    /**
     * The login url of the org. e.g. `https://login.salesforce.com` or `https://test.salesforce.com`.
     */
    LOGIN_URL = 'loginUrl',
    /**
     * The org ID.
     */
    ORG_ID = 'orgId',
    /**
     * The `OrgStatus` of the org.
     */
    STATUS = 'status',
    /**
     * The snapshot used to create the scratch org.
     */
    SNAPSHOT = 'snapshot',
    /**
     * true: the org supports and wants source tracking
     * false: the org opted out of tracking or can't support it
     */
    TRACKS_SOURCE = 'tracksSource',

    // Should it be on org? Leave it off for now, as it might
    // be confusing to the consumer what this actually is.
    // USERNAMES = 'usernames',

    // Keep separation of concerns. I think these should be on a "user" that belongs to the org.
    // Org can have a list of user objects that belong to it? Should connection be on user and org.getConnection()
    // gets the orgs current user for the process? Maybe we just want to keep with the Org only model for
    // the end of time?
    // USER_ID = 'userId',
    // USERNAME = 'username',
    // PASSWORD = 'password',
    // USER_PROFILE_NAME = 'userProfileName'
  }
}
