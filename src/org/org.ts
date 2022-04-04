/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { join as pathJoin } from 'path';
import * as fs from 'fs';
import { AsyncOptionalCreatable, Duration } from '@salesforce/kit';
import {
  AnyFunction,
  AnyJson,
  ensure,
  ensureJsonArray,
  ensureString,
  getNumber,
  isArray,
  isBoolean,
  isString,
  JsonArray,
  JsonMap,
  Nullable,
  Optional,
} from '@salesforce/ts-types';
import { HttpRequest, SaveResult } from 'jsforce';
import { Config } from '../config/config';
import { ConfigAggregator, ConfigInfo } from '../config/configAggregator';
import { ConfigContents } from '../config/configStore';
import { OrgUsersConfig } from '../config/orgUsersConfig';
import { Global } from '../global';
import { Lifecycle } from '../lifecycleEvents';
import { Logger } from '../logger';
import { SfError } from '../sfError';
import { sfdc } from '../util/sfdc';
import { WebOAuthServer } from '../webOAuthServer';
import { Messages } from '../messages';
import { GlobalInfo, SfSandbox } from '../globalInfo';
import { PollingClient } from '../status/pollingClient';
import { StatusResult } from '../status/types';
import { Connection, SingleRecordQueryErrors } from './connection';
import { AuthFields, AuthInfo } from './authInfo';
import { scratchOrgCreate, ScratchOrgCreateOptions, ScratchOrgCreateResult } from './scratchOrgCreate';
import { OrgConfigProperties } from './orgConfigProperties';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/core', 'org', [
  'deleteOrgHubError',
  'insufficientAccessToDelete',
  'missingAuthUsername',
  'noDevHubFound',
  'notADevHub',
  'noUsernameFound',
  'orgPollingTimeout',
  'sandboxDeleteFailed',
  'sandboxInfoCreateFailed',
  'sandboxNotFound',
  'scratchOrgNotFound',
  'error.AuthInfoOrgIdUndefined',
]);

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

export interface StatusEvent {
  sandboxProcessObj: SandboxProcessObject;
  interval: number;
  remainingWait: number;
  waitingOnAuth: boolean;
}

export interface ResultEvent {
  sandboxProcessObj: SandboxProcessObject;
  sandboxRes: SandboxUserAuthResponse;
}

export interface SandboxUserAuthRequest {
  sandboxName: string;
  clientId: string;
  callbackUrl: string;
}

export enum SandboxEvents {
  EVENT_STATUS = 'status',
  EVENT_ASYNC_RESULT = 'asyncResult',
  EVENT_RESULT = 'result',
  EVENT_AUTH = 'auth',
}

export interface SandboxUserAuthResponse {
  authUserName: string;
  authCode: string;
  instanceUrl: string;
  loginUrl: string;
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
} & AnyJson;

export type SandboxRequest = {
  SandboxName: string;
  LicenseType?: string;
  SourceId?: string;
  Description?: string;
};

export type ScratchOrgRequest = Pick<
  ScratchOrgCreateOptions,
  | 'connectedAppConsumerKey'
  | 'durationDays'
  | 'nonamespace'
  | 'noancestors'
  | 'wait'
  | 'retry'
  | 'apiversion'
  | 'definitionjson'
  | 'definitionfile'
  | 'orgConfig'
  | 'clientSecret'
>;

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
  private logger!: Logger;
  private connection!: Connection;

  private options: Org.Options;

  private orgId?: string;

  /**
   * @ignore
   */
  public constructor(options?: Org.Options) {
    super(options);
    this.options = options || {};
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
    this.logger.debug('CreateSandbox called with SandboxRequest: %s ', sandboxReq);
    const createResult = await this.connection.tooling.create('SandboxInfo', sandboxReq);
    this.logger.debug('Return from calling tooling.create: %s ', createResult);

    if (Array.isArray(createResult) || !createResult.success) {
      throw messages.createError('sandboxInfoCreateFailed', [JSON.stringify(createResult)]);
    }

    const sandboxCreationProgress = await this.querySandboxProcess(createResult.id);
    this.logger.debug('Return from calling singleRecordQuery with tooling: %s', sandboxCreationProgress);

    const isAsync = !!options.async;

    if (isAsync) {
      // The user didn't want us to poll, so simply return the status
      await Lifecycle.getInstance().emit(SandboxEvents.EVENT_ASYNC_RESULT, sandboxCreationProgress);
      return sandboxCreationProgress;
    }

    const wait = options.wait ?? Duration.minutes(6);
    const interval = options.interval ?? Duration.seconds(30);
    let pollInterval = options.async ? Duration.seconds(0) : interval;
    // pollInterval cannot be > wait.
    pollInterval = pollInterval.seconds > wait.seconds ? wait : pollInterval;
    this.logger.debug(
      'pollStatusAndAuth sandboxProcessObj %s, max wait time of %d minutes',
      sandboxCreationProgress,
      wait.minutes
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
   * Clean all data files in the org's data path. Usually <workspace>/.sfdx/orgs/<username>.
   *
   * @param orgDataPath A relative path other than "orgs/".
   * @param throwWhenRemoveFails Should the remove org operations throw an error on failure?
   */

  public async cleanLocalOrgData(orgDataPath?: string, throwWhenRemoveFails = false): Promise<void> {
    let dataPath: string;
    try {
      const rootFolder: string = await Config.resolveRootFolder(false);
      dataPath = pathJoin(rootFolder, Global.SFDX_STATE_FOLDER, orgDataPath ? orgDataPath : 'orgs');
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

    return this.manageDelete(async () => await fs.promises.rmdir(dataPath), dataPath, throwWhenRemoveFails);
  }

  /**
   * @ignore
   */
  public async retrieveOrgUsersConfig(): Promise<OrgUsersConfig> {
    return await OrgUsersConfig.create(OrgUsersConfig.getOptions(this.getOrgId()));
  }

  /**
   * Removes the scratch org config file at $HOME/.sfdx/[name].json, any project level org
   * files, all user auth files for the org, matching default config settings, and any
   * matching aliases.
   *
   * @param throwWhenRemoveFails Determines if the call should throw an error or fail silently.
   */
  public async remove(throwWhenRemoveFails = false): Promise<void> {
    // If deleting via the access token there shouldn't be any auth config files
    // so just return;
    if (this.getConnection().isUsingAccessToken()) {
      return Promise.resolve();
    }
    (await GlobalInfo.getInstance()).sandboxes.unset(this.getOrgId());
    await this.removeUsers(throwWhenRemoveFails);
    await this.removeUsersConfig();
    // An attempt to remove this org's auth file occurs in this.removeUsersConfig. That's because this org's usersname is also
    // included in the OrgUser config file.
    //
    // So, just in case no users are added to this org we will try the remove again.
    await this.removeAuth();
  }

  /**
   * Check if org is a sandbox org by checking its SandboxOrgConfig.
   *
   */
  public async isSandbox(): Promise<boolean> {
    return (await GlobalInfo.getInstance()).sandboxes.has(this.getOrgId());
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

    const trimmedId: string = sfdc.trimTo15(thisOrgAuthConfig.orgId) as string;

    const DEV_HUB_SOQL = `SELECT CreatedDate,Edition,ExpirationDate FROM ActiveScratchOrg WHERE ScratchOrg='${trimmedId}'`;

    try {
      const results = await devHubConnection.query(DEV_HUB_SOQL);
      if (getNumber(results, 'records.length') !== 1) {
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
  public async getDevHubOrg(): Promise<Optional<Org>> {
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
    if (typeof controllingOrg === 'string') {
      controllingOrg = await Org.create({
        aggregator: this.configAggregator,
        aliasOrUsername: controllingOrg,
      });
    }
    if (await this.isSandbox()) {
      await this.deleteSandbox(controllingOrg);
    } else {
      await this.deleteScratchOrg(controllingOrg);
    }
  }

  /**
   * Will delete 'this' instance remotely and any files locally
   */
  public async delete(): Promise<void> {
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
   * Returns `true` if the org is a scratch org.
   *
   * Use a cached value. If the cached value is not set, then check
   * `Organization.IsSandbox == true && Organization.TrialExpirationDate != null`
   * using {@link Org.retrieveOrganizationInformation}.
   */
  public async determineIfScratch(): Promise<boolean> {
    let cache = this.getField(Org.Fields.IS_SCRATCH);

    if (!cache) {
      await this.updateLocalInformation();
      cache = this.getField(Org.Fields.IS_SCRATCH);
    }
    return cache as boolean;
  }

  /**
   * Returns `true` if the org is a sandbox.
   *
   * Use a cached value. If the cached value is not set, then check
   * `Organization.IsSandbox == true && Organization.TrialExpirationDate == null`
   * using {@link Org.retrieveOrganizationInformation}.
   */
  public async determineIfSandbox(): Promise<boolean> {
    let cache = this.getField(Org.Fields.IS_SANDBOX);

    if (!cache) {
      await this.updateLocalInformation();
      cache = this.getField(Org.Fields.IS_SANDBOX);
    }
    return cache as boolean;
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

  /**
   * Some organization information is locally cached, such as if the org name or if it is a scratch org.
   * This method populates/updates the filesystem from information retrieved from the org.
   */
  public async updateLocalInformation(): Promise<void> {
    const username = this.getUsername();
    if (username) {
      const organization = await this.retrieveOrganizationInformation();
      const isScratch = organization.IsSandbox && organization.TrialExpirationDate;
      const isSandbox = organization.IsSandbox && !organization.TrialExpirationDate;
      const info = await GlobalInfo.getInstance();

      info.orgs.update(username, {
        [Org.Fields.NAME]: organization.Name,
        [Org.Fields.INSTANCE_NAME]: organization.InstanceName,
        [Org.Fields.NAMESPACE_PREFIX]: organization.NamespacePrefix,
        [Org.Fields.IS_SANDBOX]: isSandbox,
        [Org.Fields.IS_SCRATCH]: isScratch,
        [Org.Fields.TRIAL_EXPIRATION_DATE]: organization.TrialExpirationDate,
      });
      await info.write();
    }
  }

  /**
   * Refreshes the auth for this org's instance by calling HTTP GET on the baseUrl of the connection object.
   */
  public async refreshAuth(): Promise<void> {
    this.logger.debug('Refreshing auth for org.');
    const requestInfo: HttpRequest = {
      url: this.getConnection().baseUrl(),
      method: 'GET',
    };
    const conn = this.getConnection();
    await conn.request(requestInfo);
  }

  /**
   * Reads and returns the content of all user auth files for this org as an array.
   */
  public async readUserAuthFiles(): Promise<AuthInfo[]> {
    const config: OrgUsersConfig = await this.retrieveOrgUsersConfig();
    const contents: ConfigContents = await config.read();
    const thisUsername = ensure(this.getUsername());
    const usernames: JsonArray = ensureJsonArray(contents.usernames || [thisUsername]);
    return Promise.all(
      usernames.map((username) => {
        if (username === thisUsername) {
          return AuthInfo.create({
            username: this.getConnection().getUsername(),
          });
        } else {
          return AuthInfo.create({ username: ensureString(username) });
        }
      })
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
    this.logger.debug(`adding username ${authInfo.getFields().username}`);

    const orgConfig = await this.retrieveOrgUsersConfig();

    const contents = await orgConfig.read();
    // TODO: This is kind of screwy because contents values can be `AnyJson | object`...
    // needs config refactoring to improve
    const usernames = contents.usernames || [];

    if (!isArray(usernames)) {
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

    this.logger.debug(`removing username ${authInfo.getFields().username}`);

    const orgConfig: OrgUsersConfig = await this.retrieveOrgUsersConfig();

    const contents: ConfigContents = await orgConfig.read();

    const targetUser = authInfo.getFields().username;
    const usernames = (contents.usernames || []) as string[];
    contents.usernames = usernames.filter((username) => username !== targetUser);

    await orgConfig.write();
    return this;
  }

  /**
   * set the sandbox config related to this given org
   *
   * @param orgId {string} orgId of the sandbox
   * @param config {SfSandbox} config of the sandbox
   */
  public async setSandboxConfig(orgId: string, config: SfSandbox): Promise<Org> {
    (await GlobalInfo.getInstance()).sandboxes.set(orgId, config);
    return this;
  }

  /**
   * get the sandbox config for the given orgId
   *
   * @param orgId {string} orgId of the sandbox
   */
  public async getSandboxConfig(orgId: string): Promise<Nullable<SfSandbox>> {
    return (await GlobalInfo.getInstance()).sandboxes.get(orgId);
  }

  /**
   * Retrieves the highest api version that is supported by the target server instance. If the apiVersion configured for
   * Sfdx is greater than the one returned in this call an api version mismatch occurs. In the case of the CLI that
   * results in a warning.
   */
  public async retrieveMaxApiVersion(): Promise<string> {
    return await this.getConnection().retrieveMaxApiVersion();
  }

  /**
   * Returns the admin username used to create the org.
   */
  public getUsername(): Optional<string> {
    return this.getConnection().getUsername();
  }

  /**
   * Returns the orgId for this org.
   */
  public getOrgId(): string {
    return this.orgId || this.getField(Org.Fields.ORG_ID);
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Legacy. We really shouldn't be doing this.
    const ownProp = this[key];
    if (ownProp && typeof ownProp !== 'function') return ownProp;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.getConnection().getAuthInfoFields()[key];
  }

  /**
   * Returns a map of requested fields.
   */
  public getFields(keys: Org.Fields[]): JsonMap {
    const json: JsonMap = {};
    return keys.reduce((map, key) => {
      map[key] = this.getField(key);
      return map;
    }, json);
  }

  /**
   * Returns the JSForce connection for the org.
   */
  public getConnection(): Connection {
    return this.connection;
  }

  public async supportsSourceTracking(): Promise<boolean> {
    if (this.isScratch()) {
      return true;
    }
    const conn = this.getConnection();
    try {
      await conn.tooling.sobject('SourceMember').describe();
      return true;
    } catch (err) {
      if ((err as Error).message.includes('The requested resource does not exist')) {
        return false;
      }
      throw err;
    }
  }

  /**
   * Initialize async components.
   */
  protected async init(): Promise<void> {
    const globalInfo = await GlobalInfo.getInstance();
    this.logger = await Logger.child('Org');

    this.configAggregator = this.options.aggregator ? this.options.aggregator : await ConfigAggregator.create();

    if (!this.options.connection) {
      if (this.options.aliasOrUsername == null) {
        this.configAggregator = this.getConfigAggregator();
        const aliasOrUsername = this.options.isDevHub
          ? this.configAggregator.getPropertyValue<string>(OrgConfigProperties.TARGET_DEV_HUB)
          : this.configAggregator.getPropertyValue<string>(OrgConfigProperties.TARGET_ORG);
        this.options.aliasOrUsername = aliasOrUsername || undefined;
      }

      const username = globalInfo.aliases.resolveUsername(this.options.aliasOrUsername as string);
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
  protected getDefaultOptions(): Org.Options {
    throw new SfError('Not Supported', 'NotSupportedError');
  }

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
    prodOrg ??= await Org.create({
      aggregator: this.configAggregator,
      aliasOrUsername: sandbox?.prodOrgUsername,
    });
    let sandboxInfoId: string | undefined = sandbox?.sandboxInfoId;
    if (!sandboxInfoId) {
      let result: { SandboxInfoId: string };
      try {
        // grab sandboxName from config or try to calculate from the sandbox username
        const sandboxName = sandbox?.sandboxName || (this.getUsername() || '').split(`${prodOrg.getUsername()}.`)[1];
        if (!sandboxName) {
          this.logger.debug('Sandbox name is not available');
          // jump to query by orgId
          throw new Error();
        }
        this.logger.debug(`attempting to locate sandbox with sandbox ${sandboxName}`);
        try {
          result = await this.queryProduction(prodOrg, 'SandboxName', sandboxName);
        } catch (err) {
          this.logger.debug(`Failed to find sandbox with sandbox name: ${sandboxName}`);
          // jump to query by orgId
          throw err;
        }
      } catch {
        // if an error is thrown, don't panic yet. we'll try querying by orgId
        const trimmedId = sfdc.trimTo15(this.getOrgId()) as string;
        this.logger.debug(`defaulting to trimming id from ${this.getOrgId()} to ${trimmedId}`);
        try {
          result = await this.queryProduction(prodOrg, 'SandboxOrganization', trimmedId);
          sandboxInfoId = result.SandboxInfoId;
        } catch {
          throw messages.createError('sandboxNotFound', [trimmedId]);
        }
      }
    }

    const deleteResult = await this.destroySandbox(prodOrg, sandboxInfoId as string);
    this.logger.debug('Return from calling tooling.delete: %o ', deleteResult);
    await this.remove();

    if (Array.isArray(deleteResult) || !deleteResult.success) {
      throw messages.createError('sandboxDeleteFailed', [JSON.stringify(deleteResult)]);
    }
  }

  /**
   * If this Org is a scratch org, calling this method will delete the scratch org from the DevHub and clean up any local files
   *
   * @param devHub - optional DevHub Org of the to-be-deleted scratch org
   * @private
   */
  private async deleteScratchOrg(devHub?: Org): Promise<void> {
    // if we didn't get a devHub, we'll get it from the this org
    devHub ??= await this.getDevHubOrg();
    if (!devHub) {
      throw messages.createError('noDevHubFound');
    }
    if (devHub.getOrgId() === this.getOrgId()) {
      // we're attempting to delete a DevHub
      throw messages.createError('deleteOrgHubError');
    }

    try {
      const devHubConn = devHub.getConnection();
      const username = this.getUsername();
      const activeScratchOrgRecordId = (
        await devHubConn.singleRecordQuery<{ Id: string }>(
          `SELECT Id FROM ActiveScratchOrg WHERE SignupUsername='${username}'`
        )
      ).Id;
      this.logger.trace(`found matching ActiveScratchOrg with SignupUsername: ${username}.  Deleting...`);
      await this.destroyScratchOrg(devHub, activeScratchOrgRecordId);
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
    const config = await GlobalInfo.getInstance();
    const username = this.getUsername();
    // If there is no username, it has already been removed from the globalInfo.
    // We can skip the unset and just ensure that globalInfo is updated.
    if (username) {
      this.logger.debug(`Removing auth for user: ${username}`);
      this.logger.debug(`Clearing auth cache for user: ${username}`);
      config.orgs.unset(username);
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
    const globalInfo = await GlobalInfo.getInstance();
    this.logger.debug(`Removing users associate with org: ${this.getOrgId()}`);
    const config = await this.retrieveOrgUsersConfig();
    this.logger.debug(`using path for org users: ${config.getPath()}`);
    const authInfos: AuthInfo[] = await this.readUserAuthFiles();

    await Promise.all(
      authInfos
        .map((auth) => auth.getFields().username)
        .map(async (username) => {
          const aliasKeys = (username && globalInfo.aliases.getAll(username)) || [];
          globalInfo.aliases.unsetAll(username as string);

          const orgForUser =
            username === this.getUsername()
              ? this
              : await Org.create({
                  connection: await Connection.create({ authInfo: await AuthInfo.create({ username }) }),
                });

          const orgType = this.isDevHubOrg() ? OrgConfigProperties.TARGET_DEV_HUB : OrgConfigProperties.TARGET_ORG;
          const configInfo: ConfigInfo = orgForUser.configAggregator.getInfo(orgType);
          const needsConfigUpdate =
            (configInfo.isGlobal() || configInfo.isLocal()) &&
            (configInfo.value === username || aliasKeys.includes(configInfo.value as string));

          return [
            orgForUser.removeAuth(),
            needsConfigUpdate ? Config.update(configInfo.isGlobal(), orgType, undefined) : undefined,
          ].filter(Boolean);
        })
    );

    await globalInfo.write();
  }

  private async writeSandboxAuthFile(sandboxProcessObj: SandboxProcessObject, sandboxRes: SandboxUserAuthResponse) {
    this.logger.debug('writeSandboxAuthFile sandboxProcessObj: %s, sandboxRes: %s', sandboxProcessObj, sandboxRes);
    if (sandboxRes.authUserName) {
      const productionAuthFields: AuthFields = this.connection.getAuthInfoFields();
      this.logger.debug('Result from getAuthInfoFields: AuthFields %s', productionAuthFields);

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
      }

      const authInfo = await AuthInfo.create({
        username: sandboxRes.authUserName,
        oauth2Options,
        parentUsername: productionAuthFields.username,
      });

      // save auth info for new sandbox
      await authInfo.save();

      if (!authInfo.getFields().orgId) {
        throw messages.createError('error.AuthInfoOrgIdUndefined');
      }
      // set the sandbox config value
      const sfSandbox = {
        sandboxUsername: sandboxRes.authUserName,
        sandboxOrgId: authInfo.getFields().orgId,
        prodOrgUsername: this.getUsername(),
        sandboxName: sandboxProcessObj.SandboxName,
        sandboxProcessId: sandboxProcessObj.Id,
        sandboxInfoId: sandboxProcessObj.SandboxInfoId,
        timestamp: new Date().toISOString(),
      } as SfSandbox;

      await this.setSandboxConfig(authInfo.getFields().orgId as string, sfSandbox);
      const globalInfo = await GlobalInfo.getInstance();
      await globalInfo.write();

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
    this.logger.debug(
      'PollStatusAndAuth called with SandboxProcessObject%s, wait of %d minutes, pollInterval of %d seconds',
      options.sandboxProcessObj,
      options.wait.minutes,
      options.pollInterval.seconds
    );
    let remainingWait = options.wait;
    let waitingOnAuth = false;
    const pollingClient = await PollingClient.create({
      poll: async (): Promise<StatusResult> => {
        this.logger.debug('TEMPORARY: Enter Poll');
        const sandboxProcessObj = await this.querySandboxProcess(options.sandboxProcessObj.SandboxInfoId);
        // check to see if sandbox can authenticated via sandboxAuth endpoint
        this.logger.debug(
          `TEMPORARY: before sandboxSignupComplete sandboxProcessObj.SandboxInfoId: ${sandboxProcessObj.SandboxInfoId}`
        );
        const sandboxInfo = await this.sandboxSignupComplete(sandboxProcessObj);
        if (sandboxInfo) {
          await Lifecycle.getInstance().emit(SandboxEvents.EVENT_AUTH, sandboxInfo);
          try {
            this.logger.debug('sandbox signup complete with %s', sandboxInfo);
            await this.writeSandboxAuthFile(sandboxProcessObj, sandboxInfo);
            return { completed: true, payload: sandboxProcessObj };
          } catch (err) {
            const error = err as Error;
            this.logger.debug('Exception while calling writeSandboxAuthFile %s', err);
            if (error?.name === 'JwtAuthError' && error?.stack?.includes("user hasn't approved")) {
              waitingOnAuth = true;
            } else {
              throw SfError.wrap(error);
            }
          }
        }
        this.logger.debug('TEMPORARY: Before emit stastus event');

        remainingWait = Duration.seconds(remainingWait.seconds - options.pollInterval.seconds);
        await Lifecycle.getInstance().emit(SandboxEvents.EVENT_STATUS, {
          sandboxProcessObj,
          remainingWait: remainingWait.seconds,
          interval: options.pollInterval.seconds,
          waitingOnAuth,
        } as StatusEvent);
        return { completed: false, payload: sandboxProcessObj };
      },
      frequency: options.pollInterval,
      timeout: options.wait,
    });

    return pollingClient.subscribe<SandboxProcessObject>();
  }
  /**
   * Polls for the new sandbox to be created - and will write the associated auth files
   *
   * @private
   * @param options
   *  sandboxProcessObj: The in-progress sandbox signup request
   *  retries: the number of retries to poll for every 30s
   *  async: wait for polling, or just return
   *  pollInterval: Duration to sleep between poll events, default 30 seconds
   */
  // private async pollStatusAndAuthOld(options: {
  //   sandboxProcessObj: SandboxProcessObject;
  //   retries: number;
  //   async: boolean;
  //   pollInterval: Duration;
  // }): Promise<SandboxProcessObject> {
  //   const { pollInterval, async: isAsync } = options;
  //   let { sandboxProcessObj, retries } = options;
  //   this.logger.debug('PollStatusAndAuth called with SandboxProcessObject%s, retries %s', sandboxProcessObj, retries);
  //   const lifecycle = Lifecycle.getInstance();
  //   let pollFinished = false;
  //   let waitingOnAuth = false;
  //   do {
  //     sandboxProcessObj = await this.querySandboxProcess(sandboxProcessObj.SandboxInfoId);
  //     // check to see if
  //     const sandboxInfo = await this.sandboxSignupComplete(sandboxProcessObj);
  //     if (sandboxInfo) {
  //       await Lifecycle.getInstance().emit(SandboxEvents.EVENT_AUTH, sandboxInfo);
  //       try {
  //         this.logger.debug('sandbox signup complete with %s', sandboxInfo);
  //         await this.writeSandboxAuthFile(sandboxProcessObj, sandboxInfo);
  //         pollFinished = true;
  //         break;
  //       } catch (err) {
  //         const error = err as Error;
  //         this.logger.debug('Exception while calling writeSandboxAuthFile %s', err);
  //         if (error?.name === 'JwtAuthError' && error?.stack?.includes("user hasn't approved")) {
  //           waitingOnAuth = true;
  //         } else {
  //           throw SfError.wrap(error);
  //         }
  //       }
  //     }
  //     await this.waitForNextRetry(lifecycle, sandboxProcessObj, pollInterval, retries, waitingOnAuth);
  //     retries--;
  //     if (!retries && !isAsync) {
  //       // timed out on retries
  //       throw messages.createError('orgPollingTimeout', [sandboxProcessObj.Status]);
  //     }
  //   } while (!pollFinished && !isAsync);
  //
  //   return sandboxProcessObj;
  // }
  //
  // private async waitForNextRetry(
  //   lifecycle: Lifecycle,
  //   sandboxProcessObj: SandboxProcessObject,
  //   pollInterval: Duration,
  //   retries: number,
  //   waitingOnAuth: boolean
  // ) {
  //   await Promise.all([
  //     await lifecycle.emit(SandboxEvents.EVENT_STATUS, {
  //       sandboxProcessObj,
  //       interval: pollInterval.seconds,
  //       retries,
  //       waitingOnAuth,
  //     } as StatusEvent),
  //     await sleep(pollInterval),
  //   ]);
  // }

  /**
   * query SandboxProcess via SandboxInfoId
   *
   * @param id SandboxInfoId to query for
   * @private
   */
  private async querySandboxProcess(id: string): Promise<SandboxProcessObject> {
    const queryStr = `SELECT Id, Status, SandboxName, SandboxInfoId, LicenseType, CreatedDate, CopyProgress, SandboxOrganization, SourceId, Description, EndDate FROM SandboxProcess WHERE SandboxInfoId='${id}' AND Status != 'D'`;
    return await this.connection.singleRecordQuery(queryStr, {
      tooling: true,
    });
  }

  /**
   * determines if the sandbox has successfully been created
   *
   * @param sandboxProcessObj sandbox signup progeress
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

      this.logger.debug('Calling sandboxAuth with SandboxUserAuthRequest', sandboxReq);

      const url = `${this.connection.tooling._baseUrl()}/sandboxAuth`;
      const params: HttpRequest = {
        method: 'POST',
        url,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sandboxReq),
      };

      const result: SandboxUserAuthResponse = await this.connection.tooling.request(params);

      this.logger.debug('Result of calling sandboxAuth %s', result);
      return result;
    } catch (err) {
      const error = err as Error;
      // There are cases where the endDate is set before the sandbox has actually completed.
      // In that case, the sandboxAuth call will throw a specific exception.
      if (error?.name === 'INVALID_STATUS') {
        this.logger.debug('Error while authenticating the user %s', error?.toString());
      } else {
        // If it fails for any unexpected reason, just pass that through
        throw SfError.wrap(error);
      }
    }
  }
}

export namespace Org {
  /**
   * Constructor Options for and Org.
   */
  export interface Options {
    aliasOrUsername?: string;
    connection?: Connection;
    aggregator?: ConfigAggregator;
    isDevHub?: boolean;
  }

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
     * Is the current org a dev hub org. e.g. Organization has IsSandbox == true and TrialExpirationDate == null.
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
