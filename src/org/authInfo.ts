/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { randomBytes } from 'crypto';
import { resolve as pathResolve } from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { AsyncOptionalCreatable, cloneJson, env, isEmpty, parseJson, parseJsonMap } from '@salesforce/kit';
import {
  AnyJson,
  asString,
  ensure,
  ensureJsonMap,
  ensureString,
  getString,
  isArray,
  isPlainObject,
  isString,
  JsonMap,
  Nullable,
  Optional,
} from '@salesforce/ts-types';
import { OAuth2, OAuth2Config as JsforceOAuth2Config, QueryResult, TokenResponse } from 'jsforce';
import Transport from 'jsforce/lib/transport';
import * as jwt from 'jsonwebtoken';
import { Config } from '../config/config';
import { ConfigAggregator } from '../config/configAggregator';
import { Logger } from '../logger';
import { SfError } from '../sfError';
import { sfdc } from '../util/sfdc';
import { StateAggregator } from '../stateAggregator';
import { Messages } from '../messages';
import { SfdcUrl } from '../util/sfdcUrl';
import { Connection, SFDX_HTTP_HEADERS } from './connection';
import { OrgConfigProperties } from './orgConfigProperties';
import { Org } from './org';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/core', 'core', [
  'authInfoCreationError',
  'authInfoOverwriteError',
  'namedOrgNotFound',
  'orgDataNotAvailableError',
  'orgDataNotAvailableError.actions',
  'refreshTokenAuthError',
  'jwtAuthError',
  'authCodeUsernameRetrievalError',
  'authCodeExchangeError',
]);

// These should these be brought into jsforce, especially all the jwt stuff.
// See https://github.com/jsforce/jsforce/issues/896
export type OAuth2Config = JsforceOAuth2Config & {
  privateKey?: string;
  privateKeyFile?: string;
  authCode?: string;
  refreshToken?: string;
  loginUrl?: string;
};

/**
 * Fields for authorization, org, and local information.
 */
export type AuthFields = {
  accessToken?: string;
  alias?: string;
  authCode?: string;
  clientId?: string;
  clientSecret?: string;
  created?: string;
  createdOrgInstance?: string;
  devHubUsername?: string;
  instanceUrl?: string;
  instanceApiVersion?: string;
  instanceApiVersionLastRetrieved?: string;
  isDevHub?: boolean;
  loginUrl?: string;
  orgId?: string;
  password?: string;
  privateKey?: string;
  refreshToken?: string;
  scratchAdminUsername?: string;
  snapshot?: string;
  userId?: string;
  username?: string;
  usernames?: string[];
  userProfileName?: string;
  expirationDate?: string;
  tracksSource?: boolean;
};

export type OrgAuthorization = {
  orgId: string;
  username: string;
  oauthMethod: 'jwt' | 'web' | 'token' | 'unknown';
  aliases: Nullable<string[]>;
  configs: Nullable<string[]>;
  isScratchOrg?: boolean;
  isDevHub?: boolean;
  isSandbox?: boolean;
  instanceUrl?: string;
  accessToken?: string;
  error?: string;
  isExpired: boolean | 'unknown';
};

/**
 * Options for access token flow.
 */
export interface AccessTokenOptions {
  accessToken?: string;
  loginUrl?: string;
  instanceUrl?: string;
}

export type AuthSideEffects = {
  alias?: string;
  setDefault: boolean;
  setDefaultDevHub: boolean;
  setTracksSource?: boolean;
};

type UserInfo = AnyJson & {
  username: string;
  organizationId: string;
};

/* eslint-disable camelcase */
type UserInfoResult = AnyJson & {
  preferred_username: string;
  organization_id: string;
  user_id: string;
};
/* eslint-enable camelcase */

type User = AnyJson & {
  Username: string;
};

/**
 * A function to update a refresh token when the access token is expired.
 */
export type RefreshFn = (
  conn: Connection,
  callback: (err: Nullable<Error>, accessToken?: string, res?: Record<string, unknown>) => Promise<void>
) => Promise<void>;

/**
 * Options for {@link Connection}.
 */
export type ConnectionOptions = AuthFields & {
  /**
   * OAuth options.
   */
  oauth2?: Partial<OAuth2Config>;
  /**
   * Refresh token callback.
   */
  refreshFn?: RefreshFn;
};

// Extend OAuth2 to add JWT Bearer Token Flow support.
class JwtOAuth2 extends OAuth2 {
  public constructor(options: OAuth2Config) {
    super(options);
  }

  public jwtAuthorize(innerToken: string): Promise<AnyJson> {
    // @ts-ignore
    return super._postParams({
      // eslint-disable-next-line camelcase
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: innerToken,
    });
  }
}

// parses the id field returned from jsForce oauth2 methods to get
// user ID and org ID.
function parseIdUrl(idUrl: string) {
  const idUrls = idUrl.split('/');
  const userId = idUrls.pop();
  const orgId = idUrls.pop();

  return {
    userId,
    orgId,
    url: idUrl,
  };
}

export const DEFAULT_CONNECTED_APP_INFO = {
  clientId: 'PlatformCLI',
  // Legacy. The connected app info is owned by the thing that
  // creates new AuthInfos. Currently that is the auth:* commands which
  // aren't owned by this core library. These values need to be here
  // for any old auth files where the id and secret aren't stored.
  //
  // Ideally, this would be removed at some point in the distant future
  // when all auth files now have the clientId stored in it.
  legacyClientId: 'SalesforceDevelopmentExperience',
  legacyClientSecret: '1384510088588713504',
};

/**
 * Handles persistence and fetching of user authentication information using
 * JWT, OAuth, or refresh tokens. Sets up the refresh flows that jsForce will
 * use to keep tokens active. An AuthInfo can also be created with an access
 * token, but AuthInfos created with access tokens can't be persisted to disk.
 *
 * **See** [Authorization](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_auth.htm)
 *
 * **See** [Salesforce DX Usernames and Orgs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_usernames_orgs.htm)
 *
 * ```
 * // Creating a new authentication file.
 * const authInfo = await AuthInfo.create({
 *   username: myAdminUsername,
 *   oauth2Options: {
 *     loginUrl, authCode, clientId, clientSecret
 *   }
 * );
 * authInfo.save();
 *
 * // Creating an authorization info with an access token.
 * const authInfo = await AuthInfo.create({
 *   username: accessToken
 * });
 *
 * // Using an existing authentication file.
 * const authInfo = await AuthInfo.create({
 *   username: myAdminUsername
 * });
 *
 * // Using the AuthInfo
 * const connection = await Connection.create({ authInfo });
 * ```
 */

export class AuthInfo extends AsyncOptionalCreatable<AuthInfo.Options> {
  // Possibly overridden in create
  private usingAccessToken = false;

  // Initialized in init
  private logger!: Logger;
  private stateAggregator!: StateAggregator;
  private username!: string;

  private options: AuthInfo.Options;

  /**
   * Constructor
   * **Do not directly construct instances of this class -- use {@link AuthInfo.create} instead.**
   *
   * @param options The options for the class instance
   */
  public constructor(options?: AuthInfo.Options) {
    super(options);
    this.options = options || {};
  }

  /**
   * Returns the default instance url
   *
   * @returns {string}
   */
  public static getDefaultInstanceUrl(): string {
    const configuredInstanceUrl = ConfigAggregator.getValue(OrgConfigProperties.ORG_INSTANCE_URL).value as string;
    return configuredInstanceUrl || SfdcUrl.PRODUCTION;
  }

  /**
   * Get a list of all authorizations based on auth files stored in the global directory.
   * One can supply a filter (see @param orgAuthFilter) and calling this function without
   * a filter will return all authorizations.
   *
   * @param orgAuthFilter A predicate function that returns true for those org authorizations that are to be retained.
   *
   * @returns {Promise<OrgAuthorization[]>}
   */
  public static async listAllAuthorizations(
    orgAuthFilter = (orgAuth: OrgAuthorization): boolean => !!orgAuth
  ): Promise<OrgAuthorization[]> {
    const stateAggregator = await StateAggregator.getInstance();
    const config = (await ConfigAggregator.create()).getConfigInfo();
    const orgs = await stateAggregator.orgs.readAll();
    const final: OrgAuthorization[] = [];
    for (const org of orgs) {
      const username = ensureString(org.username);
      const aliases = stateAggregator.aliases.getAll(username) ?? undefined;
      // Get a list of configuration values that are set to either the username or one
      // of the aliases
      const configs = config
        .filter((c) => aliases.includes(c.value as string) || c.value === username)
        .map((c) => c.key);
      try {
        const authInfo = await AuthInfo.create({ username });
        const { orgId, instanceUrl, devHubUsername, expirationDate, isDevHub } = authInfo.getFields();
        final.push({
          aliases,
          configs,
          username,
          instanceUrl,
          isScratchOrg: Boolean(devHubUsername),
          isDevHub: isDevHub || false,
          isSandbox: stateAggregator.sandboxes.hasFile(orgId as string),
          orgId: orgId as string,
          accessToken: authInfo.getConnectionOptions().accessToken,
          oauthMethod: authInfo.isJwt() ? 'jwt' : authInfo.isOauth() ? 'web' : 'token',
          isExpired:
            Boolean(devHubUsername) && expirationDate
              ? new Date(ensureString(expirationDate)).getTime() < new Date().getTime()
              : 'unknown',
        });
      } catch (err) {
        final.push({
          aliases,
          configs,
          username,
          orgId: org.orgId as string,
          instanceUrl: org.instanceUrl,
          accessToken: undefined,
          oauthMethod: 'unknown',
          error: (err as Error).message,
          isExpired: 'unknown',
        });
      }
    }

    return final.filter(orgAuthFilter);
  }

  /**
   * Returns true if one or more authentications are persisted.
   */
  public static async hasAuthentications(): Promise<boolean> {
    try {
      const auths = (await StateAggregator.getInstance()).orgs.list();
      return !isEmpty(auths);
    } catch (err) {
      const error = err as SfError;
      if (error.name === 'OrgDataNotAvailableError' || error.code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get the authorization URL.
   *
   * @param options The options to generate the URL.
   */
  public static getAuthorizationUrl(options: OAuth2Config & { scope?: string }, oauth2?: OAuth2): string {
    // Always use a verifier for enhanced security
    options.useVerifier = true;
    const oauth2Verifier = oauth2 || new OAuth2(options);

    // The state parameter allows the redirectUri callback listener to ignore request
    // that don't contain the state value.
    const params = {
      state: randomBytes(Math.ceil(6)).toString('hex'),
      prompt: 'login',
      // Default connected app is 'refresh_token api web'
      scope: options.scope || env.getString('SFDX_AUTH_SCOPES', 'refresh_token api web'),
    };

    return oauth2Verifier.getAuthorizationUrl(params);
  }

  /**
   * Parse a sfdx auth url, usually obtained by `authInfo.getSfdxAuthUrl`.
   *
   * @example
   * ```
   * await AuthInfo.create(AuthInfo.parseSfdxAuthUrl(sfdxAuthUrl));
   * ```
   * @param sfdxAuthUrl
   */
  public static parseSfdxAuthUrl(
    sfdxAuthUrl: string
  ): Pick<AuthFields, 'clientId' | 'clientSecret' | 'refreshToken' | 'loginUrl'> {
    const match = sfdxAuthUrl.match(
      /^force:\/\/([a-zA-Z0-9._-]+):([a-zA-Z0-9._-]*):([a-zA-Z0-9._-]+={0,2})@([a-zA-Z0-9._-]+)/
    );

    if (!match) {
      throw new SfError(
        'Invalid SFDX auth URL. Must be in the format "force://<clientId>:<clientSecret>:<refreshToken>@<instanceUrl>".  Note that the SFDX auth URL uses the "force" protocol, and not "http" or "https".  Also note that the "instanceUrl" inside the SFDX auth URL doesn\'t include the protocol ("https://").',
        'INVALID_SFDX_AUTH_URL'
      );
    }
    const [, clientId, clientSecret, refreshToken, loginUrl] = match;
    return {
      clientId,
      clientSecret,
      refreshToken,
      loginUrl: `https://${loginUrl}`,
    };
  }

  /**
   * Given a set of decrypted fields and an authInfo, determine if the org belongs to an available
   * dev hub.
   *
   * @param fields
   * @param orgAuthInfo
   */
  public static async identifyPossibleScratchOrgs(fields: AuthFields, orgAuthInfo: AuthInfo): Promise<void> {
    // fields property is passed in because the consumers of this method have performed the decrypt.
    // This is so we don't have to call authInfo.getFields(true) and decrypt again OR accidentally save an
    // authInfo before it is necessary.
    const logger = await Logger.child('Common', { tag: 'identifyPossibleScratchOrgs' });

    // return if we already know the hub org we know it is a devhub or prod-like or no orgId present
    if (fields.isDevHub || fields.devHubUsername || !fields.orgId) return;

    logger.debug('getting devHubs');

    // TODO: return if url is not sandbox-like to avoid constantly asking about production orgs
    // TODO: someday we make this easier by asking the org if it is a scratch org

    const hubAuthInfos = await AuthInfo.getDevHubAuthInfos();
    logger.debug(`found ${hubAuthInfos.length} DevHubs`);
    if (hubAuthInfos.length === 0) return;

    // ask all those orgs if they know this orgId
    await Promise.all(
      hubAuthInfos.map(async (hubAuthInfo) => {
        try {
          const data = await AuthInfo.queryScratchOrg(hubAuthInfo.username, fields.orgId as string);
          if (data.totalSize > 0) {
            // if any return a result
            logger.debug(`found orgId ${fields.orgId} in devhub ${hubAuthInfo.username}`);
            try {
              await orgAuthInfo.save({ ...fields, devHubUsername: hubAuthInfo.username });
              logger.debug(`set ${hubAuthInfo.username} as devhub for scratch org ${orgAuthInfo.getUsername()}`);
            } catch (error) {
              logger.debug(`error updating auth file for ${orgAuthInfo.getUsername()}`, error);
            }
          }
        } catch (error) {
          logger.error(`Error connecting to devhub ${hubAuthInfo.username}`, error);
        }
      })
    );
  }

  /**
   * Find all dev hubs available in the local environment.
   */
  public static async getDevHubAuthInfos(): Promise<OrgAuthorization[]> {
    return await AuthInfo.listAllAuthorizations((possibleHub) => possibleHub?.isDevHub ?? false);
  }

  private static async queryScratchOrg(
    devHubUsername: string | undefined,
    scratchOrgId: string
  ): Promise<QueryResult<QueryResult<{ Id: string }>>> {
    const devHubOrg = await Org.create({ aliasOrUsername: devHubUsername });
    const conn = devHubOrg.getConnection();
    const data = await conn.query<QueryResult<{ Id: string }>>(
      `select Id from ScratchOrgInfo where ScratchOrg = '${sfdc.trimTo15(scratchOrgId)}'`
    );
    return data;
  }
  /**
   * Get the username.
   */
  public getUsername(): string {
    return this.username;
  }

  /**
   * Returns true if `this` is using the JWT flow.
   */
  public isJwt(): boolean {
    const { refreshToken, privateKey } = this.getFields();
    return !refreshToken && !!privateKey;
  }

  /**
   * Returns true if `this` is using an access token flow.
   */
  public isAccessTokenFlow(): boolean {
    const { refreshToken, privateKey } = this.getFields();
    return !refreshToken && !privateKey;
  }

  /**
   * Returns true if `this` is using the oauth flow.
   */
  public isOauth(): boolean {
    return !this.isAccessTokenFlow() && !this.isJwt();
  }

  /**
   * Returns true if `this` is using the refresh token flow.
   */
  public isRefreshTokenFlow(): boolean {
    const { refreshToken, authCode } = this.getFields();
    return !authCode && !!refreshToken;
  }

  /**
   * Updates the cache and persists the authentication fields (encrypted).
   *
   * @param authData New data to save.
   */
  public async save(authData?: AuthFields): Promise<AuthInfo> {
    this.update(authData);
    const username = ensure(this.getUsername());

    if (sfdc.matchesAccessToken(username)) {
      this.logger.debug('Username is an accesstoken. Skip saving authinfo to disk.');
      return this;
    }

    await this.stateAggregator.orgs.write(username);
    this.logger.info(`Saved auth info for username: ${username}`);
    return this;
  }

  /**
   * Update the authorization fields, encrypting sensitive fields, but do not persist.
   * For convenience `this` object is returned.
   *
   * @param authData Authorization fields to update.
   */
  public update(authData?: AuthFields): AuthInfo {
    if (authData && isPlainObject(authData)) {
      this.username = authData.username || this.username;
      this.stateAggregator.orgs.update(this.username, authData);
      this.logger.info(`Updated auth info for username: ${this.username}`);
    }
    return this;
  }

  /**
   * Get the auth fields (decrypted) needed to make a connection.
   */
  public getConnectionOptions(): ConnectionOptions {
    let opts: ConnectionOptions;

    const decryptedCopy = this.getFields(true);
    const { accessToken, instanceUrl, loginUrl } = decryptedCopy;

    if (this.isAccessTokenFlow()) {
      this.logger.info('Returning fields for a connection using access token.');

      // Just auth with the accessToken
      opts = { accessToken, instanceUrl, loginUrl };
    } else if (this.isJwt()) {
      this.logger.info('Returning fields for a connection using JWT config.');
      opts = {
        accessToken,
        instanceUrl,
        refreshFn: this.refreshFn.bind(this),
      };
    } else {
      // @TODO: figure out loginUrl and redirectUri (probably get from config class)
      //
      // redirectUri: org.config.getOauthCallbackUrl()
      // loginUrl: this.fields.instanceUrl || this.config.getAppConfig().sfdcLoginUrl
      this.logger.info('Returning fields for a connection using OAuth config.');

      // Decrypt a user provided client secret or use the default.
      opts = {
        oauth2: {
          loginUrl: instanceUrl || SfdcUrl.PRODUCTION,
          clientId: this.getClientId(),
          redirectUri: this.getRedirectUri(),
        },
        accessToken,
        instanceUrl,
        refreshFn: this.refreshFn.bind(this),
      };
    }

    // decrypt the fields
    return opts;
  }

  public getClientId(): string {
    return this.getFields()?.clientId || DEFAULT_CONNECTED_APP_INFO.legacyClientId;
  }

  public getRedirectUri(): string {
    return 'http://localhost:1717/OauthRedirect';
  }

  /**
   * Get the authorization fields.
   *
   * @param decrypt Decrypt the fields.
   */
  public getFields(decrypt?: boolean): AuthFields {
    return this.stateAggregator.orgs.get(this.username, decrypt) ?? {};
  }

  /**
   * Get the org front door (used for web based oauth flows)
   */
  public getOrgFrontDoorUrl(): string {
    const authFields = this.getFields(true);
    const base = ensureString(authFields.instanceUrl).replace(/\/+$/, '');
    const accessToken = ensureString(authFields.accessToken);
    return `${base}/secur/frontdoor.jsp?sid=${accessToken}`;
  }

  /**
   * Returns true if this org is using access token auth.
   */
  public isUsingAccessToken(): boolean {
    return this.usingAccessToken;
  }

  /**
   * Get the SFDX Auth URL.
   *
   * **See** [SFDX Authorization](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_auth.htm#cli_reference_force_auth)
   */
  public getSfdxAuthUrl(): string {
    const decryptedFields = this.getFields(true);
    const instanceUrl = ensure(decryptedFields.instanceUrl, 'undefined instanceUrl').replace(/^https?:\/\//, '');
    let sfdxAuthUrl = 'force://';

    if (decryptedFields.clientId) {
      sfdxAuthUrl += `${decryptedFields.clientId}:${decryptedFields.clientSecret || ''}:`;
    }

    sfdxAuthUrl += `${ensure(decryptedFields.refreshToken, 'undefined refreshToken')}@${instanceUrl}`;
    return sfdxAuthUrl;
  }

  /**
   * Convenience function to handle typical side effects encountered when dealing with an AuthInfo.
   * Given the values supplied in parameter sideEffects, this function will set auth alias, default auth
   * and default dev hub.
   *
   * @param sideEffects - instance of AuthSideEffects
   */
  public async handleAliasAndDefaultSettings(sideEffects: AuthSideEffects): Promise<void> {
    if (
      sideEffects.alias ||
      sideEffects.setDefault ||
      sideEffects.setDefaultDevHub ||
      typeof sideEffects.setTracksSource === 'boolean'
    ) {
      if (sideEffects.alias) await this.setAlias(sideEffects.alias);
      if (sideEffects.setDefault) await this.setAsDefault({ org: true });
      if (sideEffects.setDefaultDevHub) await this.setAsDefault({ devHub: true });
      if (typeof sideEffects.setTracksSource === 'boolean') {
        await this.save({ tracksSource: sideEffects.setTracksSource });
      } else {
        await this.save();
      }
    }
  }

  /**
   * Set the target-env (default) or the target-dev-hub to the alias if
   * it exists otherwise to the username. Method will try to set the local
   * config first but will default to global config if that fails.
   *
   * @param options
   */
  public async setAsDefault(options: { org?: boolean; devHub?: boolean } = { org: true }): Promise<void> {
    let config: Config;
    // if we fail to create the local config, default to the global config
    try {
      config = await Config.create({ isGlobal: false });
    } catch {
      config = await Config.create({ isGlobal: true });
    }

    const username = ensureString(this.getUsername());
    const alias = this.stateAggregator.aliases.get(username);
    const value = alias ?? username;

    if (options.org) {
      config.set(OrgConfigProperties.TARGET_ORG, value);
    }

    if (options.devHub) {
      config.set(OrgConfigProperties.TARGET_DEV_HUB, value);
    }
    await config.write();
  }

  /**
   * Sets the provided alias to the username
   *
   * @param alias alias to set
   */
  public async setAlias(alias: string): Promise<void> {
    this.stateAggregator.aliases.set(alias, this.getUsername());
    await this.stateAggregator.aliases.write();
  }

  /**
   * Initializes an instance of the AuthInfo class.
   */
  public async init(): Promise<void> {
    this.stateAggregator = await StateAggregator.getInstance();

    const username = this.options.username;
    const authOptions = this.options.oauth2Options || this.options.accessTokenOptions;

    // Must specify either username and/or options
    if (!username && !authOptions) {
      throw messages.createError('authInfoCreationError');
    }

    // If a username AND oauth options, ensure an authorization for the username doesn't
    // already exist. Throw if it does so we don't overwrite the authorization.
    if (username && authOptions) {
      if (this.stateAggregator.orgs.hasFile(username)) {
        throw messages.createError('authInfoOverwriteError');
      }
    }

    const oauthUsername = username || getString(authOptions, 'username');

    if (oauthUsername) {
      this.username = oauthUsername;
      await this.stateAggregator.orgs.read(oauthUsername);
    } // Else it will be set in initAuthOptions below.

    // If the username is an access token, use that for auth and don't persist
    if (isString(oauthUsername) && sfdc.matchesAccessToken(oauthUsername)) {
      // Need to initAuthOptions the logger and authInfoCrypto since we don't call init()
      this.logger = await Logger.child('AuthInfo');

      const aggregator = await ConfigAggregator.create();
      const instanceUrl = this.getInstanceUrl(authOptions, aggregator);

      this.update({
        accessToken: oauthUsername,
        instanceUrl,
        orgId: oauthUsername.split('!')[0],
        loginUrl: instanceUrl,
      });

      this.usingAccessToken = true;
    }
    // If a username with NO oauth options, ensure authorization already exist.
    else if (username && !authOptions && !(await this.stateAggregator.orgs.exists(username))) {
      throw messages.createError('namedOrgNotFound', [username]);
    } else {
      await this.initAuthOptions(authOptions);
    }
  }

  private getInstanceUrl(options: unknown, aggregator: ConfigAggregator) {
    const instanceUrl = getString(options, 'instanceUrl') || (aggregator.getPropertyValue('instanceUrl') as string);
    return instanceUrl || SfdcUrl.PRODUCTION;
  }

  /**
   * Initialize this AuthInfo instance with the specified options. If options are not provided, initialize it from cache
   * or by reading from the persistence store. For convenience `this` object is returned.
   *
   * @param options Options to be used for creating an OAuth2 instance.
   *
   * **Throws** *{@link SfError}{ name: 'NamedOrgNotFoundError' }* Org information does not exist.
   * @returns {Promise<AuthInfo>}
   */
  private async initAuthOptions(options?: OAuth2Config | AccessTokenOptions): Promise<AuthInfo> {
    this.logger = await Logger.child('AuthInfo');

    // If options were passed, use those before checking cache and reading an auth file.
    let authConfig: AuthFields;

    if (options) {
      options = cloneJson(options);

      if (this.isTokenOptions(options)) {
        authConfig = options;
        const userInfo = await this.retrieveUserInfo(
          ensureString(options.instanceUrl),
          ensureString(options.accessToken)
        );
        this.update({ username: userInfo?.username, orgId: userInfo?.organizationId });
      } else {
        if (this.options.parentUsername) {
          const parentFields = await this.loadDecryptedAuthFromConfig(this.options.parentUsername);

          options.clientId = parentFields.clientId;

          if (process.env.SFDX_CLIENT_SECRET) {
            options.clientSecret = process.env.SFDX_CLIENT_SECRET;
          } else {
            // Grab whatever flow is defined
            Object.assign(options, {
              clientSecret: parentFields.clientSecret,
              privateKey: parentFields.privateKey ? pathResolve(parentFields.privateKey) : parentFields.privateKey,
            });
          }
        }

        // jwt flow
        // Support both sfdx and jsforce private key values
        if (!options.privateKey && options.privateKeyFile) {
          options.privateKey = pathResolve(options.privateKeyFile);
        }

        if (options.privateKey) {
          authConfig = await this.buildJwtConfig(options);
        } else if (!options.authCode && options.refreshToken) {
          // refresh token flow (from sfdxUrl or OAuth refreshFn)
          authConfig = await this.buildRefreshTokenConfig(options);
        } else {
          if (this.options.oauth2 instanceof OAuth2) {
            // authcode exchange / web auth flow
            authConfig = await this.exchangeToken(options, this.options.oauth2);
          } else {
            authConfig = await this.exchangeToken(options);
          }
        }
      }

      authConfig.isDevHub = await this.determineIfDevHub(
        ensureString(authConfig.instanceUrl),
        ensureString(authConfig.accessToken)
      );

      if (authConfig.username) await this.stateAggregator.orgs.read(authConfig.username);

      // Update the auth fields WITH encryption
      this.update(authConfig);
    }

    return this;
  }

  private async loadDecryptedAuthFromConfig(username: string): Promise<AuthFields> {
    // Fetch from the persisted auth file
    const authInfo = this.stateAggregator.orgs.get(username, true);
    if (!authInfo) {
      throw messages.createError('namedOrgNotFound', [username]);
    }
    return authInfo;
  }

  private isTokenOptions(options: OAuth2Config | AccessTokenOptions): options is AccessTokenOptions {
    // Although OAuth2Config does not contain refreshToken, privateKey, or privateKeyFile, a JS consumer could still pass those in
    // which WILL have an access token as well, but it should be considered an OAuth2Config at that point.
    return (
      'accessToken' in options &&
      !('refreshToken' in options) &&
      !('privateKey' in options) &&
      !('privateKeyFile' in options) &&
      !('authCode' in options)
    );
  }

  // A callback function for a connection to refresh an access token.  This is used
  // both for a JWT connection and an OAuth connection.
  private async refreshFn(
    conn: Connection,
    callback: (err: Nullable<Error | SfError>, accessToken?: string, res?: Record<string, unknown>) => Promise<void>
  ): Promise<void> {
    this.logger.info('Access token has expired. Updating...');

    try {
      const fields = this.getFields(true);
      await this.initAuthOptions(fields);
      await this.save();
      return await callback(null, fields.accessToken);
    } catch (err) {
      const error = err as Error;
      if (error?.message?.includes('Data Not Available')) {
        // Set cause to keep original stacktrace
        return await callback(messages.createError('orgDataNotAvailableError', [this.getUsername()], [], error));
      }
      return await callback(error);
    }
  }

  // Build OAuth config for a JWT auth flow
  private async buildJwtConfig(options: OAuth2Config): Promise<AuthFields> {
    const privateKeyContents = await fs.promises.readFile(ensure(options.privateKey), 'utf8');
    const { loginUrl = SfdcUrl.PRODUCTION } = options;
    const url = new SfdcUrl(loginUrl);
    const createdOrgInstance = getString(options, 'createdOrgInstance', '').trim().toLowerCase();
    const audienceUrl = await url.getJwtAudienceUrl(createdOrgInstance);
    const jwtToken = jwt.sign(
      {
        iss: options.clientId,
        sub: this.getUsername(),
        aud: audienceUrl,
        exp: Date.now() + 300,
      },
      privateKeyContents,
      {
        algorithm: 'RS256',
      }
    );

    const oauth2 = new JwtOAuth2({ loginUrl: options.loginUrl });
    let authFieldsBuilder: JsonMap;
    try {
      authFieldsBuilder = ensureJsonMap(await oauth2.jwtAuthorize(jwtToken));
    } catch (err) {
      throw messages.createError('jwtAuthError', [(err as Error).message]);
    }

    const authFields: AuthFields = {
      accessToken: asString(authFieldsBuilder.access_token),
      orgId: parseIdUrl(ensureString(authFieldsBuilder.id)).orgId,
      loginUrl: options.loginUrl,
      privateKey: options.privateKey,
      clientId: options.clientId,
    };

    const instanceUrl = ensureString(authFieldsBuilder.instance_url);
    const sfdcUrl = new SfdcUrl(instanceUrl);
    try {
      // Check if the url is resolvable. This can fail when my-domains have not been replicated.
      await sfdcUrl.lookup();
      authFields.instanceUrl = instanceUrl;
    } catch (err) {
      this.logger.debug(
        `Instance URL [${authFieldsBuilder.instance_url}] is not available.  DNS lookup failed. Using loginUrl [${options.loginUrl}] instead. This may result in a "Destination URL not reset" error.`
      );
      authFields.instanceUrl = options.loginUrl;
    }

    return authFields;
  }

  // Build OAuth config for a refresh token auth flow
  private async buildRefreshTokenConfig(options: OAuth2Config): Promise<AuthFields> {
    // Ideally, this would be removed at some point in the distant future when all auth files
    // now have the clientId stored in it.
    if (!options.clientId) {
      options.clientId = DEFAULT_CONNECTED_APP_INFO.legacyClientId;
      options.clientSecret = DEFAULT_CONNECTED_APP_INFO.legacyClientSecret;
    }

    if (!options.redirectUri) {
      options.redirectUri = this.getRedirectUri();
    }

    const oauth2 = new OAuth2(options);
    let authFieldsBuilder: TokenResponse;
    try {
      authFieldsBuilder = await oauth2.refreshToken(ensure(options.refreshToken));
    } catch (err) {
      throw messages.createError('refreshTokenAuthError', [(err as Error).message]);
    }

    // @ts-ignore
    const { orgId } = parseIdUrl(authFieldsBuilder.id);

    let username = this.getUsername();
    if (!username) {
      // @ts-ignore
      const userInfo = await this.retrieveUserInfo(authFieldsBuilder.instance_url, authFieldsBuilder.access_token);
      username = ensureString(userInfo?.username);
    }
    return {
      orgId,
      username,
      accessToken: authFieldsBuilder.access_token,
      // @ts-ignore TODO: need better typings for jsforce
      instanceUrl: authFieldsBuilder.instance_url,
      // @ts-ignore TODO: need better typings for jsforce
      loginUrl: options.loginUrl || authFieldsBuilder.instance_url,
      refreshToken: options.refreshToken,
      clientId: options.clientId,
      clientSecret: options.clientSecret,
    };
  }

  /**
   * Performs an authCode exchange but the Oauth2 feature of jsforce is extended to include a code_challenge
   *
   * @param options The oauth options
   * @param oauth2 The oauth2 extension that includes a code_challenge
   */
  private async exchangeToken(options: OAuth2Config, oauth2: OAuth2 = new OAuth2(options)): Promise<AuthFields> {
    if (!oauth2.redirectUri) {
      oauth2.redirectUri = this.getRedirectUri();
    }
    if (!oauth2.clientId) {
      oauth2.clientId = this.getClientId();
    }

    // Exchange the auth code for an access token and refresh token.
    let authFields: TokenResponse;
    try {
      this.logger.info(`Exchanging auth code for access token using loginUrl: ${options.loginUrl}`);
      authFields = await oauth2.requestToken(ensure(options.authCode));
    } catch (err) {
      throw messages.createError('authCodeExchangeError', [(err as Error).message]);
    }

    // @ts-ignore TODO: need better typings for jsforce
    const { orgId } = parseIdUrl(authFields.id);

    let username: Optional<string> = this.getUsername();

    // Only need to query for the username if it isn't known. For example, a new auth code exchange
    // rather than refreshing a token on an existing connection.
    if (!username) {
      // @ts-ignore
      const userInfo = await this.retrieveUserInfo(authFields.instance_url, authFields.access_token);
      username = userInfo?.username;
    }

    return {
      accessToken: authFields.access_token,
      // @ts-ignore TODO: need better typings for jsforce
      instanceUrl: authFields.instance_url,
      orgId,
      username,
      // @ts-ignore TODO: need better typings for jsforce
      loginUrl: options.loginUrl || authFields.instance_url,
      refreshToken: authFields.refresh_token,
      clientId: options.clientId,
      clientSecret: options.clientSecret,
    };
  }

  private async retrieveUserInfo(instanceUrl: string, accessToken: string): Promise<Optional<UserInfo>> {
    // Make a REST call for the username directly.  Normally this is done via a connection
    // but we don't want to create circular dependencies or lots of snowflakes
    // within this file to support it.
    const apiVersion = 'v51.0'; // hardcoding to v51.0 just for this call is okay.
    const instance = ensure(instanceUrl);
    const baseUrl = new SfdcUrl(instance);
    const userInfoUrl = `${baseUrl}services/oauth2/userinfo`;
    const headers = Object.assign({ Authorization: `Bearer ${accessToken}` }, SFDX_HTTP_HEADERS);
    try {
      this.logger.info(`Sending request for Username after successful auth code exchange to URL: ${userInfoUrl}`);
      let response = await new Transport().httpRequest({ url: userInfoUrl, method: 'GET', headers });
      if (response.statusCode >= 400) {
        this.throwUserGetException(response);
      } else {
        const userInfoJson = parseJsonMap(response.body) as UserInfoResult;
        const url = `${baseUrl}/services/data/${apiVersion}/sobjects/User/${userInfoJson.user_id}`;
        this.logger.info(`Sending request for User SObject after successful auth code exchange to URL: ${url}`);
        response = await new Transport().httpRequest({ url, method: 'GET', headers });
        if (response.statusCode >= 400) {
          this.throwUserGetException(response);
        } else {
          // eslint-disable-next-line camelcase
          userInfoJson.preferred_username = (parseJsonMap(response.body) as User).Username;
        }
        return { username: userInfoJson.preferred_username, organizationId: userInfoJson.organization_id };
      }
    } catch (err) {
      throw messages.createError('authCodeUsernameRetrievalError', [(err as Error).message]);
    }
  }

  /**
   * Given an error while getting the User object, handle different possibilities of response.body.
   *
   * @param response
   * @private
   */
  private throwUserGetException(response: unknown) {
    let errorMsg = '';
    const bodyAsString = getString(response, 'body', JSON.stringify({ message: 'UNKNOWN', errorCode: 'UNKNOWN' }));
    try {
      const body = parseJson(bodyAsString);
      if (isArray(body)) {
        errorMsg = body
          .map((line) => getString(line, 'message') ?? getString(line, 'errorCode', 'UNKNOWN'))
          .join(os.EOL);
      } else {
        errorMsg = getString(body, 'message') ?? getString(body, 'errorCode', 'UNKNOWN');
      }
    } catch (err) {
      errorMsg = `${bodyAsString}`;
    }
    throw new SfError(errorMsg);
  }

  /**
   * Returns `true` if the org is a Dev Hub.
   *
   * Check access to the ScratchOrgInfo object to determine if the org is a dev hub.
   */
  private async determineIfDevHub(instanceUrl: string, accessToken: string): Promise<boolean> {
    // Make a REST call for the ScratchOrgInfo obj directly.  Normally this is done via a connection
    // but we don't want to create circular dependencies or lots of snowflakes
    // within this file to support it.
    const apiVersion = 'v51.0'; // hardcoding to v51.0 just for this call is okay.
    const instance = ensure(instanceUrl);
    const baseUrl = new SfdcUrl(instance);
    const scratchOrgInfoUrl = `${baseUrl}/services/data/${apiVersion}/query?q=SELECT%20Id%20FROM%20ScratchOrgInfo%20limit%201`;
    const headers = Object.assign({ Authorization: `Bearer ${accessToken}` }, SFDX_HTTP_HEADERS);

    try {
      const res = await new Transport().httpRequest({ url: scratchOrgInfoUrl, method: 'GET', headers });
      if (res.statusCode >= 400) {
        return false;
      }
      return true;
    } catch (err) {
      /* Not a dev hub */
      return false;
    }
  }
}

export namespace AuthInfo {
  /**
   * Constructor options for AuthInfo.
   */
  export interface Options {
    /**
     * Org signup username.
     */
    username?: string;
    /**
     * OAuth options.
     */
    oauth2Options?: OAuth2Config;
    /**
     * Options for the access token auth.
     */
    accessTokenOptions?: AccessTokenOptions;

    oauth2?: OAuth2;

    /**
     * In certain situations, a new auth info wants to use the connected app
     * information from another parent org. Typically for scratch org or sandbox
     * creation.
     */
    parentUsername?: string;

    isDevHub?: boolean;
  }
}
