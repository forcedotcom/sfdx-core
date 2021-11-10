/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { join as pathJoin } from 'path';
import { AsyncCreatable } from '@salesforce/kit';
import {
  AnyFunction,
  AnyJson,
  asString,
  ensure,
  ensureJsonArray,
  ensureString,
  getNumber,
  getString,
  isArray,
  isBoolean,
  isString,
  JsonArray,
  JsonMap,
  Optional,
} from '@salesforce/ts-types';
import { QueryResult } from 'jsforce';
import { AuthFields, AuthInfo } from './authInfo';
import { Aliases } from './config/aliases';
import { AuthInfoConfig } from './config/authInfoConfig';
import { Config } from './config/config';
import { ConfigAggregator, ConfigInfo } from './config/configAggregator';
import { ConfigContents } from './config/configStore';
import { OrgUsersConfig } from './config/orgUsersConfig';
import { SandboxOrgConfig } from './config/sandboxOrgConfig';
import { Connection, SingleRecordQueryErrors } from './connection';
import { Global } from './global';
import { Logger } from './logger';
import { SfdxError } from './sfdxError';
import { fs } from './util/fs';
import { sfdc } from './util/sfdc';

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
 * // The defaultusername config property
 * const org2: Org = await Org.create({});
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
export class Org extends AsyncCreatable<Org.Options> {
  private status: Org.Status = Org.Status.UNKNOWN;
  private configAggregator!: ConfigAggregator;

  // Initialized in create
  private logger!: Logger;
  private connection!: Connection;

  private options: Org.Options;

  /**
   * @ignore
   */
  public constructor(options: Org.Options) {
    super(options);
    this.options = options;
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
      dataPath = pathJoin(rootFolder, Global.STATE_FOLDER, orgDataPath ? orgDataPath : 'orgs');
      this.logger.debug(`cleaning data for path: ${dataPath}`);
    } catch (err) {
      if (err instanceof Error && err.name === 'InvalidProjectWorkspace') {
        // If we aren't in a project dir, we can't clean up data files.
        // If the user unlink this org outside of the workspace they used it in,
        // data files will be left over.
        return;
      }
      throw err;
    }

    return this.manageDelete(async () => await fs.remove(dataPath), dataPath, throwWhenRemoveFails);
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
    await this.removeSandboxConfig(throwWhenRemoveFails);
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
    return !!(await this.getSandboxOrgConfigField(SandboxOrgConfig.Fields.PROD_ORG_USERNAME));
  }
  /**
   * Check that this org is a scratch org by asking the dev hub if it knows about it.
   *
   * **Throws** *{@link SfdxError}{ name: 'NotADevHub' }* Not a Dev Hub.
   *
   * **Throws** *{@link SfdxError}{ name: 'NoResults' }* No results.
   *
   * @param devHubUsernameOrAlias The username or alias of the dev hub org.
   */
  public async checkScratchOrg(devHubUsernameOrAlias?: string): Promise<Partial<AuthFields>> {
    let aliasOrUsername = devHubUsernameOrAlias;
    if (!aliasOrUsername) {
      aliasOrUsername = asString(this.configAggregator.getPropertyValue(Config.DEFAULT_DEV_HUB_USERNAME));
    }

    const devHubConnection = (await Org.create({ aliasOrUsername })).getConnection();

    const thisOrgAuthConfig = this.getConnection().getAuthInfoFields();

    const trimmedId: string = sfdc.trimTo15(thisOrgAuthConfig.orgId) as string;

    const DEV_HUB_SOQL = `SELECT CreatedDate,Edition,ExpirationDate FROM ActiveScratchOrg WHERE ScratchOrg='${trimmedId}'`;

    let results;
    try {
      results = await (devHubConnection.query(DEV_HUB_SOQL) as Promise<QueryResult<Record<string, unknown>>>);
    } catch (err) {
      if (err instanceof Error && err.name === 'INVALID_TYPE') {
        throw SfdxError.create('@salesforce/core', 'org', 'NotADevHub', [devHubConnection.getUsername()]);
      }
      throw err;
    }

    if (getNumber(results, 'records.length') !== 1) {
      throw new SfdxError('No results', 'NoResults');
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
    const auth = await AuthInfo.create({ username });
    await auth.save({ isDevHub });
    AuthInfo.clearCache(username);
    // Reset the connection with the updated auth file
    this.connection = await Connection.create({
      authInfo: await AuthInfo.create({ username }),
    });
    return isDevHub;
  }

  /**
   * Refreshes the auth for this org's instance by calling HTTP GET on the baseUrl of the connection object.
   */
  public async refreshAuth(): Promise<void> {
    this.logger.debug('Refreshing auth for org.');
    const requestInfo = {
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
      throw new SfdxError('Missing auth info', 'MissingAuthInfo');
    }

    const authInfo = isString(auth) ? await AuthInfo.create({ username: auth }) : auth;
    this.logger.debug(`adding username ${authInfo.getFields().username}`);

    const orgConfig = await this.retrieveOrgUsersConfig();

    const contents = await orgConfig.read();
    // TODO: This is kind of screwy because contents values can be `AnyJson | object`...
    // needs config refactoring to improve
    const usernames = contents.usernames || [];

    if (!isArray(usernames)) {
      throw new SfdxError('Usernames is not an array', 'UnexpectedDataFormat');
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
   * **Throws** *{@link SfdxError}{ name: 'MissingAuthInfo' }* Auth info is missing.
   *
   * @param {AuthInfo | string} auth The AuthInfo containing the username to remove.
   */
  public async removeUsername(auth: AuthInfo | string): Promise<Org> {
    if (!auth) {
      throw new SfdxError('Missing auth info', 'MissingAuthInfo');
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
   * Sets the key/value pair in the sandbox config for this org. For convenience `this` object is returned.
   *
   *
   * @param {key} The key for this value
   * @param {value} The value to save
   */
  public async setSandboxOrgConfigField(field: SandboxOrgConfig.Fields, value: string): Promise<Org> {
    const sandboxOrgConfig = await this.retrieveSandboxOrgConfig();
    sandboxOrgConfig.set(field, value);
    await sandboxOrgConfig.write();
    return this;
  }

  /**
   * Returns an org config field. Returns undefined if the field is not set or invalid.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getSandboxOrgConfigField(field: SandboxOrgConfig.Fields): Promise<any> {
    const sandboxOrgConfig = await this.retrieveSandboxOrgConfig();
    return sandboxOrgConfig.get(field);
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
    return this.getField(Org.Fields.ORG_ID) as string;
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
  public getField(key: Org.Fields): AnyJson {
    // @ts-ignore TODO: Need to refactor storage of these values on both Org and AuthFields
    return this[key] || this.getConnection().getAuthInfoFields()[key];
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

  /**
   * Initialize async components.
   */
  protected async init(): Promise<void> {
    this.logger = await Logger.child('Org');

    this.configAggregator = this.options.aggregator ? this.options.aggregator : await ConfigAggregator.create();

    if (!this.options.connection) {
      if (this.options.aliasOrUsername == null) {
        this.configAggregator = this.getConfigAggregator();
        const aliasOrUsername = this.options.isDevHub
          ? getString(this.configAggregator.getInfo(Config.DEFAULT_DEV_HUB_USERNAME), 'value')
          : getString(this.configAggregator.getInfo(Config.DEFAULT_USERNAME), 'value');
        this.options.aliasOrUsername = aliasOrUsername || undefined;
      }

      const username = this.options.aliasOrUsername;
      this.connection = await Connection.create({
        // If no username is provided or resolvable from an alias, AuthInfo will throw an SfdxError.
        authInfo: await AuthInfo.create({
          username: (username != null && (await Aliases.fetch(username))) || username,
          isDevHub: this.options.isDevHub,
        }),
      });
    } else {
      this.connection = this.options.connection;
    }
  }

  /**
   * **Throws** *{@link SfdxError} Throws and unsupported error.
   */
  protected getDefaultOptions(): Org.Options {
    throw new SfdxError('Not Supported');
  }

  private async queryProduction(org: Org, field: string, value: string): Promise<{ SandboxInfoId: string }> {
    return org.connection.singleRecordQuery<{ SandboxInfoId: string }>(
      `SELECT SandboxInfoId FROM SandboxProcess WHERE ${field} ='${value}' AND Status NOT IN ('D', 'E')`,
      { tooling: true }
    );
  }

  /**
   * this method will delete the sandbox org from the production org and clean up any local files
   *
   * @param prodOrg - Production org associated with this sandbox
   * @private
   */
  private async deleteSandbox(prodOrg?: Org): Promise<void> {
    prodOrg ??= await Org.create({
      aggregator: this.configAggregator,
      aliasOrUsername: await this.getSandboxOrgConfigField(SandboxOrgConfig.Fields.PROD_ORG_USERNAME),
    });
    let result: { SandboxInfoId: string };

    // attempt to locate sandbox id by username
    try {
      // try to calculate sandbox name from the production org
      // production org: admin@integrationtesthub.org
      // this.getUsername: admin@integrationtesthub.org.dev1
      // sandboxName in Production: dev1
      const sandboxName = (this.getUsername() || '').split(`${prodOrg.getUsername()}.`)[1];
      if (!sandboxName) {
        this.logger.debug('Could not construct a sandbox name');
        throw new Error();
      }
      this.logger.debug(`attempting to locate sandbox with username ${sandboxName}`);
      result = await this.queryProduction(prodOrg, 'SandboxName', sandboxName);
      if (!result) {
        this.logger.debug(`Failed to find sandbox with username: ${sandboxName}`);
        throw new Error();
      }
    } catch {
      // if an error is thrown, don't panic yet. we'll try querying by orgId
      const trimmedId = sfdc.trimTo15(this.getOrgId()) as string;
      this.logger.debug(`defaulting to trimming id from ${this.getOrgId()} to ${trimmedId}`);
      try {
        result = await this.queryProduction(prodOrg, 'SandboxOrganization', trimmedId);
      } catch {
        throw SfdxError.create('@salesforce/core', 'org', 'SandboxNotFound', [trimmedId]);
      }
    }

    const deleteResult = await prodOrg.connection.tooling.delete('SandboxInfo', result.SandboxInfoId);
    this.logger.debug('Return from calling tooling.delete: %o ', deleteResult);
    await this.remove();

    if (Array.isArray(deleteResult) || !deleteResult.success) {
      throw SfdxError.create('@salesforce/core', 'org', 'SandboxDeleteFailed', [JSON.stringify(deleteResult)]);
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
      throw SfdxError.create('@salesforce/core', 'org', 'NoDevHubFound');
    }
    if (devHub.getOrgId() === this.getOrgId()) {
      // we're attempting to delete a DevHub
      throw SfdxError.create('@salesforce/core', 'org', 'DeleteOrgHubError');
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
      await devHubConn.delete('ActiveScratchOrg', activeScratchOrgRecordId);
      await this.remove();
    } catch (err) {
      this.logger.info(err instanceof Error ? err.message : err);
      if (err instanceof Error && (err.name === 'INVALID_TYPE' || err.name === 'INSUFFICIENT_ACCESS_OR_READONLY')) {
        // most likely from devHubConn.delete
        this.logger.info('Insufficient privilege to access ActiveScratchOrgs.');
        throw SfdxError.create('@salesforce/core', 'org', 'InsufficientAccessToDelete');
      }
      if (err instanceof Error && err.name === SingleRecordQueryErrors.NoRecords) {
        // most likely from singleRecordQuery
        this.logger.info('The above error can be the result of deleting an expired or already deleted org.');
        this.logger.info('attempting to cleanup the auth file');
        await this.removeAuth();
        throw SfdxError.create('@salesforce/core', 'org', 'ScratchOrgNotFound');
      }
      throw err;
    }
  }

  /**
   * Returns a promise to delete an auth info file from the local file system and any related cache information for
   * this Org.. You don't want to call this method directly. Instead consider calling Org.remove()
   */
  private async removeAuth(): Promise<void> {
    const username = ensure(this.getUsername());
    this.logger.debug(`Removing auth for user: ${username}`);
    const config = await AuthInfoConfig.create({
      ...AuthInfoConfig.getOptions(username),
      throwOnNotFound: false,
    });

    this.logger.debug(`Clearing auth cache for user: ${username}`);
    AuthInfo.clearCache(username);
    if (await config.exists()) {
      await config.unlink();
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

  /**
   * @ignore
   */
  private async retrieveSandboxOrgConfig(): Promise<SandboxOrgConfig> {
    return await SandboxOrgConfig.create(SandboxOrgConfig.getOptions(this.getOrgId()));
  }

  private manageDelete(cb: AnyFunction<Promise<void>>, dirPath: string, throwWhenRemoveFails: boolean): Promise<void> {
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
  private async removeUsers(throwWhenRemoveFails: boolean): Promise<void> {
    this.logger.debug(`Removing users associate with org: ${this.getOrgId()}`);
    const config = await this.retrieveOrgUsersConfig();
    this.logger.debug(`using path for org users: ${config.getPath()}`);
    if (await config.exists()) {
      const authInfos: AuthInfo[] = await this.readUserAuthFiles();
      const aliases: Aliases = await Aliases.create(Aliases.getDefaultOptions());
      this.logger.info(`Cleaning up usernames in org: ${this.getOrgId()}`);

      for (const auth of authInfos) {
        const username = auth.getFields().username;

        const aliasKeys = (username && aliases.getKeysByValue(username)) || [];
        aliases.unsetAll(aliasKeys);

        let orgForUser;
        if (username === this.getUsername()) {
          orgForUser = this;
        } else {
          const info = await AuthInfo.create({ username });
          const connection: Connection = await Connection.create({ authInfo: info });
          orgForUser = await Org.create({ connection });
        }

        const orgType = this.isDevHubOrg() ? Config.DEFAULT_DEV_HUB_USERNAME : Config.DEFAULT_USERNAME;

        const configInfo: ConfigInfo = orgForUser.configAggregator.getInfo(orgType);

        if (
          (configInfo.value === username || aliasKeys.includes(configInfo.value as string)) &&
          (configInfo.isGlobal() || configInfo.isLocal())
        ) {
          await Config.update(configInfo.isGlobal(), orgType, undefined);
        }
        await orgForUser.removeAuth();
      }

      await aliases.write();
    }
  }

  /**
   * Remove an associate sandbox config.
   *
   * @param throwWhenRemoveFails true if manageDelete should throw or not if the deleted fails.
   */
  private async removeSandboxConfig(throwWhenRemoveFails: boolean): Promise<void> {
    const sandboxOrgConfig = await this.retrieveSandboxOrgConfig();
    if (await sandboxOrgConfig.exists()) {
      await this.manageDelete(
        async () => await sandboxOrgConfig.unlink(),
        sandboxOrgConfig.getPath(),
        throwWhenRemoveFails
      );
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
