import { AsyncCreatable } from '@salesforce/kit';
import { AnyJson, JsonMap, Optional } from '@salesforce/ts-types';
import { AuthFields, AuthInfo } from './authInfo';
import { ConfigAggregator } from './config/configAggregator';
import { OrgUsersConfig } from './config/orgUsersConfig';
import { SandboxOrgConfig } from './config/sandboxOrgConfig';
import { Connection } from './connection';
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
export declare class Org extends AsyncCreatable<Org.Options> {
  private status;
  private configAggregator;
  private logger;
  private connection;
  private options;
  /**
   * @ignore
   */
  constructor(options: Org.Options);
  /**
   * Clean all data files in the org's data path. Usually <workspace>/.sfdx/orgs/<username>.
   * @param orgDataPath A relative path other than "orgs/".
   * @param throwWhenRemoveFails Should the remove org operations throw an error on failure?
   */
  cleanLocalOrgData(orgDataPath?: string, throwWhenRemoveFails?: boolean): Promise<void>;
  /**
   * @ignore
   */
  retrieveOrgUsersConfig(): Promise<OrgUsersConfig>;
  /**
   * Removes the scratch org config file at $HOME/.sfdx/[name].json, any project level org
   * files, all user auth files for the org, matching default config settings, and any
   * matching aliases.
   * @param throwWhenRemoveFails Determines if the call should throw an error or fail silently.
   */
  remove(throwWhenRemoveFails?: boolean): Promise<void>;
  /**
   * Check that this org is a scratch org by asking the dev hub if it knows about it.
   *
   * **Throws** *{@link SfdxError}{ name: 'NotADevHub' }* Not a Dev Hub.
   *
   * **Throws** *{@link SfdxError}{ name: 'NoResults' }* No results.
   *
   * @param devHubUsernameOrAlias The username or alias of the dev hub org.
   */
  checkScratchOrg(devHubUsernameOrAlias?: string): Promise<Partial<AuthFields>>;
  /**
   * Returns the Org object or null if this org is not affiliated with a Dev Hub (according to the local config).
   */
  getDevHubOrg(): Promise<Optional<Org>>;
  /**
   * Returns `true` if the org is a Dev Hub.
   *
   * **Note** This relies on a cached value in the auth file. If that property
   * is not cached, this method will **always return false even if the org is a
   * dev hub**. If you need accuracy, use the {@link Org.determineIfDevHubOrg} method.
   */
  isDevHubOrg(): boolean;
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
  determineIfDevHubOrg(forceServerCheck?: boolean): Promise<boolean>;
  /**
   * Refreshes the auth for this org's instance by calling HTTP GET on the baseUrl of the connection object.
   */
  refreshAuth(): Promise<void>;
  /**
   *  Reads and returns the content of all user auth files for this org as an array.
   */
  readUserAuthFiles(): Promise<AuthInfo[]>;
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
  addUsername(auth: AuthInfo | string): Promise<Org>;
  /**
   * Removes a username from the user config for this object. For convenience `this` object is returned.
   *
   * **Throws** *{@link SfdxError}{ name: 'MissingAuthInfo' }* Auth info is missing.
   *
   * @param {AuthInfo | string} auth The AuthInfo containing the username to remove.
   */
  removeUsername(auth: AuthInfo | string): Promise<Org>;
  /**
   * Sets the key/value pair in the sandbox config for this org. For convenience `this` object is returned.
   *
   *
   * @param {key} The key for this value
   * @param {value} The value to save
   */
  setSandboxOrgConfigField(field: SandboxOrgConfig.Fields, value: string): Promise<Org>;
  /**
   * Returns an org config field. Returns undefined if the field is not set or invalid.
   */
  getSandboxOrgConfigField(field: SandboxOrgConfig.Fields): Promise<Optional<AnyJson>>;
  /**
   * Retrieves the highest api version that is supported by the target server instance. If the apiVersion configured for
   * Sfdx is greater than the one returned in this call an api version mismatch occurs. In the case of the CLI that
   * results in a warning.
   */
  retrieveMaxApiVersion(): Promise<string>;
  /**
   * Returns the admin username used to create the org.
   */
  getUsername(): Optional<string>;
  /**
   * Returns the orgId for this org.
   */
  getOrgId(): string;
  /**
   * Returns for the config aggregator.
   */
  getConfigAggregator(): ConfigAggregator;
  /**
   * Returns an org field. Returns undefined if the field is not set or invalid.
   */
  getField(key: Org.Fields): AnyJson;
  /**
   * Returns a map of requested fields.
   */
  getFields(keys: Org.Fields[]): JsonMap;
  /**
   * Returns the JSForce connection for the org.
   */
  getConnection(): Connection;
  /**
   * Initialize async components.
   */
  protected init(): Promise<void>;
  /**
   * **Throws** *{@link SfdxError} Throws and unsupported error.
   */
  protected getDefaultOptions(): Org.Options;
  /**
   * Returns a promise to delete an auth info file from the local file system and any related cache information for
   * this Org.. You don't want to call this method directly. Instead consider calling Org.remove()
   */
  private removeAuth;
  /**
   * Deletes the users config file
   */
  private removeUsersConfig;
  /**
   * @ignore
   */
  private retrieveSandboxOrgConfig;
  private manageDelete;
  /**
   * Remove the org users auth file.
   * @param throwWhenRemoveFails true if manageDelete should throw or not if the deleted fails.
   */
  private removeUsers;
  /**
   * Remove an associate sandbox config.
   * @param throwWhenRemoveFails true if manageDelete should throw or not if the deleted fails.
   */
  private removeSandboxConfig;
}
export declare namespace Org {
  /**
   * Constructor Options for and Org.
   */
  interface Options {
    aliasOrUsername?: string;
    connection?: Connection;
    aggregator?: ConfigAggregator;
    isDevHub?: boolean;
  }
  /**
   * Scratch Org status.
   */
  enum Status {
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
    MISSING = 'MISSING'
  }
  /**
   * Org Fields.
   */
  enum Fields {
    /**
     * The org alias.
     */
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
     *  The org ID.
     */
    ORG_ID = 'orgId',
    /**
     * The `OrgStatus` of the org.
     */
    STATUS = 'status',
    /**
     * The snapshot used to create the scratch org.
     */
    SNAPSHOT = 'snapshot'
  }
}
