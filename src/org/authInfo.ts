/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable class-methods-use-this */

import { randomBytes } from 'node:crypto';
import { resolve as pathResolve } from 'node:path';
import * as os from 'node:os';
import { AsyncOptionalCreatable, Duration, env, isEmpty, parseJson, parseJsonMap } from '@salesforce/kit';
import {
  AnyJson,
  asString,
  ensure,
  ensureJsonMap,
  ensureString,
  isArray,
  isPlainObject,
  isString,
  JsonMap,
  Many,
  Nullable,
  Optional,
} from '@salesforce/ts-types';
import { OAuth2Config, OAuth2, TokenResponse } from '@jsforce/jsforce-node';
import Transport from '@jsforce/jsforce-node/lib/transport';
import * as jwt from 'jsonwebtoken';
import { fs } from '../fs/fs';
import { Config } from '../config/config';
import { ConfigAggregator } from '../config/configAggregator';
import { Logger } from '../logger/logger';
import { SfError } from '../sfError';
import { matchesOpaqueAccessToken, trimTo15, validateApiVersion } from '../util/sfdc';
import { StateAggregator } from '../stateAggregator/stateAggregator';
import { filterSecrets } from '../logger/filters';
import { Messages } from '../messages';
import { getLoginAudienceCombos, SfdcUrl } from '../util/sfdcUrl';
import { findSuggestion } from '../util/findSuggestion';
import { lockInit } from '../util/fileLocking';
import { Connection, SFDX_HTTP_HEADERS } from './connection';
import { determineOrg } from './determineOrg';
import { Org, SandboxFields } from './org';
import { OrgConfigProperties } from './orgConfigProperties';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'core');

/**
 * Fields for authorization, org, and local information.
 */
export type AuthFields = {
  clientApps?: {
    [key: string]: {
      clientId: string;
      clientSecret?: string;
      accessToken: string;
      refreshToken: string;
      oauthFlow: 'web';
    };
  };
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
  snapshot?: string;
  userId?: string;
  username?: string;
  usernames?: string[];
  userProfileName?: string;
  expirationDate?: string;
  tracksSource?: boolean;
  [Org.Fields.NAME]?: string;
  [Org.Fields.INSTANCE_NAME]?: string;
  [Org.Fields.NAMESPACE_PREFIX]?: Nullable<string>;
  [Org.Fields.IS_SANDBOX]?: boolean;
  [Org.Fields.IS_SCRATCH]?: boolean;
  [Org.Fields.TRIAL_EXPIRATION_DATE]?: Nullable<string>;
  [Org.Fields.ORG_EDITION]?: string;
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
export type AccessTokenOptions = {
  accessToken?: string;
  loginUrl?: string;
  instanceUrl?: string;
};

export type AuthSideEffects = {
  alias?: string;
  setDefault: boolean;
  setDefaultDevHub: boolean;
  setTracksSource?: boolean;
};

export type JwtOAuth2Config = OAuth2Config & {
  privateKey?: string;
  privateKeyFile?: string;
  authCode?: string;
  refreshToken?: string;
  username?: string;
  state?: string;
};

type UserInfo = AnyJson & {
  username: string;
  organizationId: string;
};

type UserInfoResult = AnyJson & {
  preferred_username: string;
  organization_id: string;
  user_id: string;
};

type User = AnyJson & {
  Username: string;
};

type AuthOptions = JwtOAuth2Config & AccessTokenOptions;

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
  oauth2?: Partial<JwtOAuth2Config>;
  /**
   * Refresh token callback.
   */
  refreshFn?: RefreshFn;
};

// parses the id field returned from jsForce oauth2 methods to get
// user ID and org ID.
function parseIdUrl(idUrl: string): { userId: string | undefined; orgId: string | undefined; url: string } {
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
  clientSecret: '',
};

export const CODE_BUILDER_CONNECTED_APP_INFO = {
  clientId: 'CodeBuilder',
  clientSecret: '',
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
    this.options = options ?? {};
  }

  /**
   * Returns the default instance url
   *
   * @returns {string}
   */
  public static getDefaultInstanceUrl(): string {
    const configuredInstanceUrl = ConfigAggregator.getValue(OrgConfigProperties.ORG_INSTANCE_URL)?.value as string;
    return configuredInstanceUrl ?? SfdcUrl.PRODUCTION;
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
        // prevent ConfigFile collision bug
        // eslint-disable-next-line no-await-in-loop
        const authInfo = await AuthInfo.create({ username });
        const authFields = authInfo.getFields();
        const { orgId, instanceUrl, devHubUsername, expirationDate, isDevHub } = authFields;
        const isScratchOrg = Boolean(devHubUsername) || Boolean(authFields[Org.Fields.IS_SCRATCH]);
        const expDate = expirationDate ?? authFields[Org.Fields.TRIAL_EXPIRATION_DATE];
        // eslint-disable-next-line no-await-in-loop
        const hasSandboxFile = await stateAggregator.sandboxes.hasFile(orgId as string);
        const isSandbox = Boolean(authFields[Org.Fields.IS_SANDBOX]) || hasSandboxFile;
        final.push({
          aliases,
          configs,
          username,
          instanceUrl,
          isScratchOrg,
          isDevHub: isDevHub ?? false,
          isSandbox,
          orgId: orgId as string,
          accessToken: authInfo.getConnectionOptions().accessToken,
          oauthMethod: authInfo.isJwt() ? 'jwt' : authInfo.isOauth() ? 'web' : 'token',
          isExpired:
            isScratchOrg && expDate ? new Date(ensureString(expDate)).getTime() < new Date().getTime() : 'unknown',
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
      const auths = await (await StateAggregator.getInstance()).orgs.list();
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
  public static getAuthorizationUrl(options: JwtOAuth2Config & { scope?: string }, oauth2?: OAuth2): string {
    // Unless explicitly turned off, use a code verifier for enhanced security
    const oauth2Verifier = oauth2 ?? new OAuth2({ useVerifier: true, ...options });

    // The state parameter allows the redirectUri callback listener to ignore request
    // that don't contain the state value.
    const params = {
      state: options.state ?? randomBytes(Math.ceil(6)).toString('hex'),
      prompt: 'login',
      // Default connected app is 'refresh_token api web'
      scope: options.scope ?? env.getString('SFDX_AUTH_SCOPES', 'refresh_token api web'),
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
      /^force:\/\/([a-zA-Z0-9._-]+={0,2}):([a-zA-Z0-9._-]*={0,2}):([a-zA-Z0-9._-]+={0,2})@([a-zA-Z0-9:._-]+)/
    );

    if (!match) {
      throw new SfError(messages.getMessage('invalidSfdxAuthUrlError'), 'INVALID_SFDX_AUTH_URL');
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
   * dev hub, or if the org is a sandbox of another CLI authed production org.
   *
   * @param fields
   * @param orgAuthInfo
   */
  public static async identifyPossibleScratchOrgs(fields: AuthFields, orgAuthInfo: AuthInfo): Promise<void> {
    if (env.getBoolean('SF_SKIP_SCRATCH_ORG_CHECK')) {
      (await Logger.child('Common', { tag: 'identifyPossibleScratchOrgs' })).debug(
        'Skipping scratch org identification due to SF_SKIP_SCRATCH_ORG_CHECK'
      );
      return;
    }

    // fields property is passed in because the consumers of this method have performed the decrypt.
    // This is so we don't have to call authInfo.getFields(true) and decrypt again OR accidentally save an
    // authInfo before it is necessary.
    const logger = await Logger.child('Common', { tag: 'identifyPossibleScratchOrgs' });

    await determineOrg(orgAuthInfo);

    // re-read fields after determineOrg may have updated them
    const updatedFields = orgAuthInfo.getFields();

    // return if we already know the hub org, we know it is a devhub or prod-like, or no orgId present
    if (Boolean(updatedFields.isDevHub) || Boolean(updatedFields.devHubUsername) || !updatedFields.orgId) return;

    if (updatedFields.isSandbox) {
      logger.debug('determineOrg already identified org as sandbox, skipping expensive org scan');
      return;
    }

    // for scratch orgs, skip the full listAllAuthorizations + sandbox identification and
    // instead do a lightweight DevHub lookup using raw configs (no AuthInfo creation/decryption)
    if (updatedFields.isScratch) {
      logger.debug('determineOrg identified org as scratch, doing lightweight DevHub lookup');
      const stateAggregator = await StateAggregator.getInstance();
      const allConfigs = await stateAggregator.orgs.readAll();
      const devHubUsernames = allConfigs.filter((c) => c.isDevHub).map((c) => ensureString(c.username));

      for (const hubUsername of devHubUsernames) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const soi = await AuthInfo.queryScratchOrg(hubUsername, updatedFields.orgId);
          // eslint-disable-next-line no-await-in-loop
          await orgAuthInfo.save({
            ...fields,
            devHubUsername: hubUsername,
            expirationDate: soi.ExpirationDate,
            isScratch: true,
          });
          logger.debug(`set ${hubUsername} as devhub for scratch org ${orgAuthInfo.getUsername()}`);
          return;
        } catch (error) {
          if (error instanceof Error && error.name === 'NoActiveScratchOrgFound') {
            logger.debug(`devhub ${hubUsername} does not own this scratch org`);
          } else {
            logger.debug(`Error connecting to devhub ${hubUsername}`, error);
          }
        }
      }
      return;
    }

    logger.debug('getting devHubs and prod orgs to identify scratch orgs and sandboxes');

    // TODO: someday we make this easier by asking the org if it is a scratch org

    const allOrgs = await AuthInfo.listAllAuthorizations();
    const hubAuthInfos = allOrgs.filter((org) => org.isDevHub);

    // skip sandbox identification if the instance URL is not sandbox-like
    // enhanced domains: *.sandbox.my.salesforce.com; pre-enhanced My Domain: company--sbxname.my.salesforce.com
    const isSandboxLikeUrl =
      fields.instanceUrl != null && (fields.instanceUrl.includes('.sandbox.') || fields.instanceUrl.includes('--'));
    const possibleProdOrgs = isSandboxLikeUrl ? allOrgs.filter((org) => !org.isScratchOrg && !org.isSandbox) : [];
    if (!isSandboxLikeUrl) {
      logger.debug('instance URL is not sandbox-like, skipping sandbox identification');
    }

    logger.debug(`found ${hubAuthInfos.length} DevHubs`);
    logger.debug(`found ${possibleProdOrgs.length} possible prod orgs`);
    if (hubAuthInfos.length === 0 && possibleProdOrgs.length === 0) {
      return;
    }

    let identified = false;

    // ask all those orgs if they know this orgId, but stop once one claims it
    await Promise.all([
      ...hubAuthInfos.map(async (hubAuthInfo) => {
        if (identified) return;
        try {
          const soi = await AuthInfo.queryScratchOrg(hubAuthInfo.username, fields.orgId as string);
          if (identified) return;
          identified = true;
          logger.debug(`found orgId ${fields.orgId ?? '<undefined>'} in devhub ${hubAuthInfo.username}`);
          try {
            await orgAuthInfo.save({
              ...fields,
              devHubUsername: hubAuthInfo.username,
              expirationDate: soi.ExpirationDate,
              isScratch: true,
            });
            logger.debug(
              `set ${hubAuthInfo.username} as devhub and expirationDate ${
                soi.ExpirationDate
              } for scratch org ${orgAuthInfo.getUsername()}`
            );
          } catch (error) {
            logger.debug(`error updating auth file for ${orgAuthInfo.getUsername()}`, error);
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'NoActiveScratchOrgFound') {
            logger.error(`devhub ${hubAuthInfo.username} has no scratch orgs`, error);
          } else {
            logger.error(`Error connecting to devhub ${hubAuthInfo.username}`, error);
          }
        }
      }),
      ...possibleProdOrgs.map(async (pOrgAuthInfo) => {
        if (identified) return;
        const found = await AuthInfo.identifyPossibleSandbox(pOrgAuthInfo, fields, orgAuthInfo, logger);
        if (found) identified = true;
      }),
    ]);
  }

  /**
   * Find all dev hubs available in the local environment.
   */
  public static async getDevHubAuthInfos(): Promise<OrgAuthorization[]> {
    return AuthInfo.listAllAuthorizations((possibleHub) => possibleHub?.isDevHub ?? false);
  }

  private static async identifyPossibleSandbox(
    possibleProdOrg: OrgAuthorization,
    fields: AuthFields,
    orgAuthInfo: AuthInfo,
    logger: Logger
  ): Promise<boolean> {
    if (!fields.orgId) {
      return false;
    }

    try {
      const prodOrg = await Org.create({ aliasOrUsername: possibleProdOrg.username });
      const sbxProcess = await prodOrg.querySandboxProcessByOrgId(fields.orgId);
      if (!sbxProcess?.SandboxInfoId) {
        return false;
      }
      logger.debug(`${fields.orgId} is a sandbox of ${possibleProdOrg.username}`);

      try {
        await orgAuthInfo.save({
          ...fields,
          isScratch: false,
          isSandbox: true,
        });
      } catch (err) {
        logger.debug(`error updating auth file for: ${orgAuthInfo.getUsername()}`, err);
        throw err; // rethrow; don't want a sandbox config file with an invalid auth file
      }

      try {
        // set the sandbox config value
        const sfSandbox: SandboxFields = {
          sandboxUsername: fields.username,
          sandboxOrgId: fields.orgId,
          prodOrgUsername: possibleProdOrg.username,
          sandboxName: sbxProcess.SandboxName,
          sandboxProcessId: sbxProcess.Id,
          sandboxInfoId: sbxProcess.SandboxInfoId,
          timestamp: new Date().toISOString(),
        };

        const stateAggregator = await StateAggregator.getInstance();
        stateAggregator.sandboxes.set(fields.orgId, sfSandbox);
        logger.debug(`writing sandbox auth file for: ${orgAuthInfo.getUsername()} with ID: ${fields.orgId}`);
        await stateAggregator.sandboxes.write(fields.orgId);
      } catch (e) {
        logger.debug(`error writing sandbox auth file for: ${orgAuthInfo.getUsername()}`, e);
      }
      return true;
    } catch (err) {
      logger.debug(`${fields.orgId} is not a sandbox of ${possibleProdOrg.username}`);
      return false;
    }
  }

  /**
   * Checks active scratch orgs to match by the ScratchOrg field (the 15-char org id)
   * if you pass an 18-char scratchOrgId, it will be trimmed to 15-char for query purposes
   * Throws is no matching scratch org is found
   */
  private static async queryScratchOrg(
    devHubUsername: string | undefined,
    scratchOrgId: string
  ): Promise<{ Id: string; ExpirationDate: string }> {
    const devHubOrg = await Org.create({ aliasOrUsername: devHubUsername });
    const trimmedId = trimTo15(scratchOrgId);
    const conn = devHubOrg.getConnection();
    const data = await conn.query<{ Id: string; ExpirationDate: string; ScratchOrg: string }>(
      `select Id, ExpirationDate, ScratchOrg from ScratchOrgInfo where ScratchOrg = '${trimmedId}' and Status = 'Active'`
    );
    // where ScratchOrg='00DDE00000485Lg' will return a record for both 00DDE00000485Lg and 00DDE00000485LG.
    // this is our way of enforcing case sensitivity on a 15-char Id (which is unfortunately how ScratchOrgInfo stores it)
    const result = data.records.filter((r) => r.ScratchOrg === trimmedId)[0];
    if (result) return result;

    throw new SfError(
      `DevHub ${devHubUsername ?? '<undefined>'} has no active scratch orgs that match ${trimmedId}`,
      'NoActiveScratchOrgFound'
    );
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

    if (matchesOpaqueAccessToken(username)) {
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
      if (authData.instanceApiVersion && !validateApiVersion(authData.instanceApiVersion)) {
        this.logger.warn(
          `Ignoring invalid instanceApiVersion "${authData.instanceApiVersion}" (expected format: "XX.0")`
        );
        authData.instanceApiVersion = undefined;
      }
      this.username = authData.username ?? this.username;
      this.stateAggregator.orgs.update(this.username, authData);
      this.logger.info(`Updated auth info for username: ${this.username}`);
    }
    return this;
  }

  /**
   * Get the auth fields (decrypted) needed to make a connection.
   *
   * @param clientApp Name of the CA/ECA associated with the user.
   */
  public getConnectionOptions(clientApp?: string): ConnectionOptions {
    const decryptedCopy = this.getFields(true);
    const { accessToken, instanceUrl, loginUrl } = decryptedCopy;

    // return main app auth fields
    if (!clientApp) {
      if (this.isAccessTokenFlow()) {
        this.logger.info('Returning fields for a connection using access token.');

        // Just auth with the accessToken
        return { accessToken, instanceUrl, loginUrl };
      }
      if (this.isJwt()) {
        this.logger.info('Returning fields for a connection using JWT config.');
        return {
          accessToken,
          instanceUrl,
          refreshFn: this.refreshFn.bind(this),
        };
      }
      // @TODO: figure out loginUrl and redirectUri (probably get from config class)
      //
      // redirectUri: org.config.getOauthCallbackUrl()
      // loginUrl: this.fields.instanceUrl || this.config.getAppConfig().sfdcLoginUrl
      this.logger.info('Returning fields for a connection using OAuth config.');

      // Decrypt a user provided client secret or use the default.
      return {
        oauth2: {
          loginUrl: instanceUrl ?? SfdcUrl.PRODUCTION,
          clientId: this.getClientId(),
          redirectUri: this.getRedirectUri(),
        },
        accessToken,
        instanceUrl,
        refreshFn: this.refreshFn.bind(this),
      };
    }

    if (!decryptedCopy.clientApps) {
      throw new SfError(`${this.username} does not have any client app linked.`);
    }

    if (!(clientApp in decryptedCopy.clientApps)) {
      throw new SfError(`${this.username} does not have a "${clientApp}" client app linked.`);
    }

    const decryptedApp = decryptedCopy.clientApps[clientApp];

    return {
      oauth2: {
        loginUrl: instanceUrl ?? SfdcUrl.PRODUCTION,
        clientId: decryptedApp.clientId,
        redirectUri: this.getRedirectUri(),
      },
      accessToken: decryptedApp.accessToken,
      instanceUrl,
      // Specific refreshFn for AuthInfo's clientApps.
      //
      // Each client app stores the oauth flow used for its initial auth, here we ensure each refresh returns
      // a token, update the auth file with it and send it back to jsforce's through the callback.
      refreshFn: async (_conn, callback): Promise<void> => {
        // This only handles refresh for web flow.
        // When more flows are supported for client apps, check the `app.oauthFlow` field to set the appropiate refresh helper.
        const authFields = await this.buildRefreshTokenConfig({
          clientId: decryptedApp.clientId,
          clientSecret: decryptedApp.clientSecret,
          refreshToken: decryptedApp.refreshToken,
          loginUrl: instanceUrl,
        });

        await this.save({
          clientApps: {
            ...decryptedCopy.clientApps,
            [clientApp]: {
              accessToken: ensureString(authFields.accessToken),
              clientId: decryptedApp.clientId,
              clientSecret: decryptedApp.clientSecret,
              // Persist the server-returned refresh token (rotated under RTR), falling back to the one we
              // sent when the response omits it (RTR off). Persisting the old token here would send an
              // invalidated credential on the next refresh once RTR is enabled on this connected app.
              refreshToken: ensureString(authFields.refreshToken ?? decryptedApp.refreshToken),
              oauthFlow: 'web',
            },
          },
        });
        await callback(null, authFields.accessToken);
      },
    };
  }

  public getClientId(): string {
    return this.getFields()?.clientId ?? DEFAULT_CONNECTED_APP_INFO.clientId;
  }

  public getRedirectUri(): string {
    return 'http://localhost:1717/OauthRedirect';
  }

  /**
   * Get the authorization fields.
   *
   * @param decrypt Decrypt the fields.
   *
   * Returns a ReadOnly object of the fields.  If you need to modify the fields, use AuthInfo.update()
   */
  public getFields(decrypt?: boolean): Readonly<AuthFields> {
    return this.stateAggregator.orgs.get(this.username, decrypt) ?? {};
  }

  /**
   * Get the org front door (used for web based oauth flows)
   *
   * @deprecated Will be removed in the next major version. Use the `Org.getFrontDoorUrl()` method instead.
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
    const { clientId, clientSecret, refreshToken, instanceUrl } = this.getFields(true);
    // host includes an optional port on the instanceUrl
    const url = new URL(ensure(instanceUrl, 'undefined instanceUrl')).host;
    const clientIdAndSecret = clientId ? `${clientId}:${clientSecret ?? ''}` : '';
    const token = ensure(refreshToken, 'undefined refreshToken');
    return `force://${clientIdAndSecret}:${token}@${url}`;
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
      Boolean(sideEffects.alias) ||
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
    return this.stateAggregator.aliases.setAndSave(alias, this.getUsername());
  }

  /**
   * Initializes an instance of the AuthInfo class.
   */
  public async init(): Promise<void> {
    this.stateAggregator = await StateAggregator.getInstance();

    const username = this.options.username;
    const authOptions: AuthOptions | undefined = this.options.oauth2Options ?? this.options.accessTokenOptions;

    // Must specify either username and/or options
    if (!username && !authOptions) {
      throw messages.createError('authInfoCreationError');
    }

    // If a username AND oauth options, ensure an authorization for the username doesn't
    // already exist. Throw if it does so we don't overwrite the authorization.
    if (username && authOptions) {
      if (await this.stateAggregator.orgs.hasFile(username)) {
        throw messages.createError('authInfoOverwriteError');
      }
    }

    const oauthUsername = username ?? authOptions?.username;

    if (oauthUsername) {
      this.username = oauthUsername;
      await this.stateAggregator.orgs.read(oauthUsername, false, false);
    } // Else it will be set in initAuthOptions below.

    // If the username is an access token, use that for auth and don't persist
    if (isString(oauthUsername) && matchesOpaqueAccessToken(oauthUsername)) {
      // Need to initAuthOptions the logger and authInfoCrypto since we don't call init()
      this.logger = await Logger.child('AuthInfo');

      const aggregator = await ConfigAggregator.create();
      const instanceUrl = this.getInstanceUrl(aggregator, authOptions);

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
      const likeName = findSuggestion(username, [
        ...(await this.stateAggregator.orgs.list()).map((f) => f.split('.json')[0]),
        ...Object.keys(this.stateAggregator.aliases.getAll()),
      ]);

      throw SfError.create({
        name: 'NamedOrgNotFoundError',
        message: messages.getMessage('namedOrgNotFound', [username]),
        actions:
          likeName === ''
            ? undefined
            : [`It looks like you mistyped the username or alias. Did you mean "${likeName}"?`],
      });
    } else {
      await this.initAuthOptions(authOptions);
    }
  }

  private getInstanceUrl(aggregator: ConfigAggregator, options?: AuthOptions): string {
    const instanceUrl = options?.instanceUrl ?? aggregator.getPropertyValue(OrgConfigProperties.ORG_INSTANCE_URL);
    return instanceUrl ?? SfdcUrl.PRODUCTION;
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
  private async initAuthOptions(options?: JwtOAuth2Config | AccessTokenOptions): Promise<AuthInfo> {
    this.logger = await Logger.child('AuthInfo');

    // If options were passed, use those before checking cache and reading an auth file.
    let authConfig: AuthFields;

    if (options) {
      options = structuredClone(options);

      if (this.isTokenOptions(options)) {
        authConfig = options;
        const userInfo = await this.retrieveUserInfo(
          ensureString(options.instanceUrl),
          ensureString(options.accessToken)
        );
        this.update({ username: userInfo?.username, orgId: userInfo?.organizationId });
      } else {
        if (this.options.parentUsername) {
          if (process.env.SF_SCRATCH_SIGNUP_CONNECTED_APP) {
            // When the signup app is overridden, use it as the clientId for the auth code exchange.
            // Skip loading parent fields entirely — we don't need the parent's privateKey/clientSecret
            // and the parent org may not be in the StateAggregator cache.
            options.clientId = process.env.SF_SCRATCH_SIGNUP_CONNECTED_APP;
            if (process.env.SFDX_CLIENT_SECRET) {
              options.clientSecret = process.env.SFDX_CLIENT_SECRET;
            }
          } else {
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
        }

        // jwt flow
        // Support both sfdx and jsforce private key values
        if (!options.privateKey && options.privateKeyFile) {
          options.privateKey = pathResolve(options.privateKeyFile);
        }

        // Route to JWT only when there's a privateKey AND no refreshToken. A legitimate JWT auth never
        // carries a refreshToken (authJwt writes none, and `login jwt` deletes-then-recreates the auth file).
        // The edge case that contains BOTH a privateKey AND a refreshToken is when auth was originally JWT
        // and later switched to Web auth. Web auth does not delete the existing auth file, so `AuthInfo.update`
        // merges over the old file. In that case the refreshToken is the intended credential, so fall
        // through to the refresh-token flow instead of misrouting into JWT, which also matches isJwt().
        if (options.privateKey && !options.refreshToken) {
          authConfig = await this.authJwt(options);
        } else if (!options.authCode && options.refreshToken) {
          // refresh token flow (from sfdxUrl or OAuth refreshFn).
          // RTR CAUTION: this POST rotates the token server-side and invalidates the old one immediately.
          // Everything from here until the caller's save() (determineIfDevHub, orgs.read, update/encrypt,
          // determineOrg) runs on borrowed time -- a throw in that window strands the rotated token on the
          // wire while the old one is already dead server-side, permanently breaking the auth until re-login.
          // determineIfDevHub and determineOrg swallow their own errors, so the practical window is small,
          // but it is non-zero. A save-early seam for this branch would close it (tracked as a follow-up).
          authConfig = await this.buildRefreshTokenConfig(options);
        } else if (this.options.oauth2 instanceof OAuth2) {
          // authcode exchange / web auth flow
          authConfig = await this.exchangeToken(options, this.options.oauth2);
        } else {
          authConfig = await this.exchangeToken(options);
        }
      }

      authConfig.isDevHub = await this.determineIfDevHub(
        ensureString(authConfig.instanceUrl),
        ensureString(authConfig.accessToken)
      );

      if (authConfig.username) await this.stateAggregator.orgs.read(authConfig.username, false, false);

      // Update the auth fields WITH encryption
      this.update(authConfig);

      // A web/auth-code or refresh-token authorization is never a JWT one, so it must not carry a
      // privateKey. When this flow overwrites an existing auth file (e.g. the user was JWT-authed for
      // this org, then re-authed via web), the save path merges (Object.assign) over the existing
      // file and would otherwise retain the stale privateKey, which later misroutes refreshFn into
      // the JWT flow. Only clear it when a stale value actually lingers so we don't add an empty key
      // to a fresh authorization.
      if (!authConfig.privateKey && this.getFields().privateKey) {
        this.stateAggregator.orgs.update(this.username, { privateKey: undefined });
      }

      // Populate Organization metadata (orgEdition, isScratch, isSandbox, etc.) in a single query.
      await determineOrg(this);
    }

    return this;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async loadDecryptedAuthFromConfig(username: string): Promise<AuthFields> {
    // Fetch from the persisted auth file
    const authInfo = this.stateAggregator.orgs.get(username, true);
    if (!authInfo) {
      throw messages.createError('namedOrgNotFound', [username]);
    }
    return authInfo;
  }

  private isTokenOptions(options: JwtOAuth2Config | AccessTokenOptions): options is AccessTokenOptions {
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
    _conn: Connection,
    callback: (err: Nullable<Error | SfError>, accessToken?: string, res?: Record<string, unknown>) => Promise<void>
  ): Promise<void> {
    this.logger.info('Access token has expired. Updating...');

    try {
      const fields = this.getFields(true);

      // JWT auth mints a fresh access token from a locally-signed assertion and consumes no stored credential,
      // so concurrent JWT refreshes are independent and safe. The refresh-token flow is different: every caller
      // refreshes by re-sending the *same persisted refresh token* read from the auth file, and with Refresh
      // Token Rotation enabled the server returns a new refresh token and invalidates the old one *immediately*.
      // So two connections/processes refreshing at once would both send that on-disk token and double-rotate the
      // auth. Serialize just that flow.
      //
      // Gate on `refreshToken` alone (not `refreshToken && !privateKey`): a legitimate JWT auth never carries
      // a refresh token, so this still excludes JWT, and it also covers the fixed edge case where both-fields
      // exist from an original JWT login and switching to web (stale privateKey + real refreshToken), which
      // initAuthOptions routes through the refresh-token flow and which therefore must take the lock too.
      //  See the router in initAuthOptions and isJwt().
      if (fields.refreshToken) {
        await this.refreshWithTokenRotationLock(fields.refreshToken);
      } else {
        // This method will request the new access token and save to the current AuthInfo instance (but don't persist them!).
        await this.initAuthOptions(fields);
        // Persist fields with refreshed access token to auth file.
        await this.save();
      }

      // Pass new access token to the jsforce's session-refresh callback for proper propagation:
      // https://jsforce.github.io/jsforce/types/session_refresh_delegate.SessionRefreshFunc.html
      const { accessToken } = this.getFields(true);
      return await callback(null, accessToken);
    } catch (err) {
      const error = err as Error;
      if (error?.message?.includes('Data Not Available')) {
        // Set cause to keep original stacktrace
        return callback(messages.createError('orgDataNotAvailableError', [this.getUsername()], [], error));
      }
      return callback(error);
    }
  }

  /**
   * Single-flight a refresh-token refresh so two connections/processes can't rotate the same token at once.
   *
   * With Refresh Token Rotation (RTR) enabled, each refresh returns a new refresh token and invalidates the
   * previous one; a second refresh sent with the now-stale refresh token fails and invalidates the current token too.
   * We take a cross-process lock (which also serializes same-process contenders), then re-read the latest
   * tokens from disk: if another actor already rotated while we waited, we adopt their fresh credentials
   * instead of refreshing again with our now-invalid token.
   *
   * Each pass is one call to `tryRotateOrAdopt`, which (1) adopts if disk already holds a rotated token, else
   * (2) tries to acquire the lock and, once held, re-checks-then-refreshes. If we can't acquire (a live holder
   * is mid-rotation, ELOCKED), we do NOT
   * fall back to an unlocked refresh, which would race the holder and double-rotate under RTR; we simply loop
   * back to (1) and re-run the pass (re-read disk, then try to acquire the lock again). `proper-lockfile` only
   * grants the lock on genuine release or genuine staleness (a live
   * holder refreshes its lock mtime ~every 5s and so is never stolen from), so looping converges: a slow
   * holder is waited out, a dead holder's lock crosses the ~10s stale line and is stolen on a later attempt.
   * Only a holder that keeps the lock alive for the whole budget below yields the timeout error.
   *
   * The lock uses a dedicated `<authfile>.token-rotation.lock`, kept separate from ConfigFile's
   * own `<authfile>.lock` write lock, because proper-lockfile is not re-entrant: holding the auth-file lock
   * here and then letting save() re-acquire the same path would self-block.
   *
   * KNOWN LIMITATIONS (all inherent, not bugs):
   *
   * (1) Only actors that take THIS lock are serialized. Within a single CLI release this is a non-issue: the
   * CLI deduplicates @salesforce/core to one version, so every in-process refresher runs this same locking
   * code (and the lock path is derived deterministically, so differing versions that BOTH lock still
   * interoperate). The realistic gap is a 2nd/3rd-party plugin: those install under the CLI's plugin data dir
   * with their OWN non-deduped node_modules and may bundle a core version predating this lock. Such a plugin
   * (or any external tool that refreshes the token directly) won't honor `<authfile>.token-rotation.lock` and
   * can still double-rotate the same auth while we hold it. There is no server-side coordination to prevent this.
   *
   * (2) On the web runtime (Global.isWeb), lockInit is a no-op that takes no lock (matching existing
   * ConfigFile behavior), so nothing is serialized there.
   *
   * (3) A genuinely-stuck holder makes this block for up to the budget below plus one in-flight lock cycle
   * (~40s) before throwing. Because that happens inside a live jsforce session-refresh, an upstream client
   * with a shorter timeout may give up first with a less specific error. Only the pathological stuck case
   * pays this; the common paths return in one lock cycle or via the lock-free adopt.
   *
   * @param heldRefreshToken the refresh token this connection currently holds (read from the auth file); the
   * baseline we compare against disk to detect a rotation, and the token we would send if we do rotate.
   */
  private async refreshWithTokenRotationLock(heldRefreshToken: string): Promise<void> {
    const username = ensure(this.getUsername());

    // Cutoff for STARTING another attempt -- not a wall-clock cap on the whole method. Each attempt either
    // finishes (adopt or refresh) or reports contention (ELOCKED); we re-attempt ONLY while contended. One
    // lockInit acquisition cycle is ~10s (its lockRetryOptions retry budget before it throws ELOCKED) and the
    // cutoff is consulted only between attempts, so a genuinely stuck holder pushes the actual time-to-throw
    // to roughly this cutoff plus one in-flight cycle. Sizing it to ~35s (~3.5x a cycle) starts a 3rd attempt
    // at ~20s with room to spare and leaves headroom for a 4th: enough for a dead holder's lock to cross the
    // 10s stale line and be stolen on a later attempt, and for a slow-but-live holder to release.
    const attemptDeadline = Date.now() + Duration.seconds(35).milliseconds;

    while (Date.now() < attemptDeadline) {
      // eslint-disable-next-line no-await-in-loop
      if (await this.tryRotateOrAdopt(username, heldRefreshToken)) {
        return;
      }
      // Otherwise the lock was contended (a live holder is mid-rotation): loop and re-attempt. We never
      // refresh unlocked -- that would race the holder and double-rotate under RTR. No sleep needed: lockInit
      // already backed off ~10s, and the next attempt re-reads disk before doing anything.
    }

    // Past the cutoff with every attempt still contended: a process kept the rotation lock's mtime fresh for
    // the entire budget without completing -- genuinely stuck, not merely slow or crashed (a crash lets the
    // lock go stale and be stolen by an attempt above).
    throw messages.createError('refreshTokenRotationTimeoutError', [username]);
  }

  /**
   * One rotation attempt: adopt an already-rotated token if disk has one, else take the lock and
   * double-check-then-rotate under it.
   *
   * @returns `true` if we adopted or refreshed (caller is done); `false` if the lock was contended
   * (`ELOCKED`) and the caller should re-attempt. Throws on any non-`ELOCKED` failure.
   */
  private async tryRotateOrAdopt(username: string, heldRefreshToken: string): Promise<boolean> {
    // Fast path / adopt: if another connection or process already rotated the token, adopt those fresh
    // credentials without taking the lock. On the first pass this thins the herd (late arrivals never
    // contend); on later passes it catches a holder that rotated and released while we were waiting.
    if (await this.adoptIfAlreadyRotated(username, heldRefreshToken)) {
      return true;
    }

    // proper-lockfile appends `.lock`, so this locks `<authfile>.token-rotation.lock`.
    const lockPath = `${this.stateAggregator.orgs.getPath(username)}.token-rotation`;
    let unlock: (() => Promise<void>) | undefined;
    try {
      ({ unlock } = await lockInit(lockPath));
    } catch (err) {
      // Contended: a live holder is mid-rotation. Report it so the caller re-attempts (never refreshing
      // unlocked, which would double-rotate under RTR). Any non-ELOCKED error is a real failure.
      if ((err as { code?: string })?.code === 'ELOCKED') {
        return false;
      }
      throw err;
    }

    // We hold the lock. Run to completion regardless of the caller's cutoff -- we never abandon a rotation we
    // hold the lock for; the cutoff only gates whether a NEW attempt starts.
    try {
      // Double-check under the lock: the holder we queued behind may have rotated while we waited.
      if (await this.adoptIfAlreadyRotated(username, heldRefreshToken)) {
        return true;
      }
      // No one rotated: perform the refresh (updates this instance in memory) and persist the new token
      // before we release the lock, so everyone waiting behind us adopts it instead of re-rotating.
      await this.initAuthOptions(this.getFields(true));
      await this.save();
      return true;
    } finally {
      await unlock();
    }
  }

  /**
   * Re-read the on-disk auth (without disturbing this instance's in-memory fields) and, if another
   * connection/process has already rotated the refresh token, adopt those fresh credentials. Disk is
   * already current in that case, so no save is needed.
   *
   * NOTE: this gates on the refresh token only, not access-token freshness (we don't persist access-token
   * expiry). If the adopted access token has since expired, jsforce gets a 401 and re-enters refreshFn,
   * which then rotates under the lock (our refresh token now matches disk, so the double-check falls through
   * to a real refresh). That is one extra round trip in a narrow case, and still strictly better than the
   * pre-adopt behavior, where refreshing with our rotated-out token would have failed outright.
   *
   * @returns true if a rotated token was adopted; false if the on-disk token still matches ours.
   */
  private async adoptIfAlreadyRotated(username: string, heldRefreshToken: string): Promise<boolean> {
    const onDisk = await this.stateAggregator.orgs.peek(username, true);
    if (onDisk?.refreshToken && onDisk.refreshToken !== heldRefreshToken) {
      this.logger.info('Refresh token was already rotated by another process; adopting refreshed credentials.');
      this.update(onDisk);
      return true;
    }
    return false;
  }

  private async readJwtKey(keyFile: string): Promise<string> {
    return fs.promises.readFile(keyFile, 'utf8');
  }

  // Build OAuth config for a JWT auth flow
  private async authJwt(options: JwtOAuth2Config): Promise<AuthFields> {
    if (!options.clientId) {
      throw messages.createError('missingClientId');
    }
    const privateKeyContents = await this.readJwtKey(ensureString(options.privateKey));
    const { loginUrl = SfdcUrl.PRODUCTION } = options;
    const url = new SfdcUrl(loginUrl);
    const createdOrgInstance = (this.getFields().createdOrgInstance ?? '').trim().toLowerCase();
    const audienceUrl = await url.getJwtAudienceUrl(createdOrgInstance);
    let authFieldsBuilder: JsonMap | undefined;
    const authErrors = [];
    // given that we can no longer depend on instance names or URls to determine audience, let's try them all
    const loginAndAudienceUrls = getLoginAudienceCombos(audienceUrl, loginUrl);
    for (const [login, audience] of loginAndAudienceUrls) {
      try {
        // sequentially, in probabilistic order
        // eslint-disable-next-line no-await-in-loop
        authFieldsBuilder = await this.tryJwtAuth(options.clientId, login, audience, privateKeyContents);
        break;
      } catch (err) {
        const error = err as Error;
        const message = error.message.includes('audience')
          ? `${error.message}  [audience=${audience} login=${login}]`
          : error.message;
        authErrors.push(message);
      }
    }
    if (!authFieldsBuilder) {
      // messages.createError expects names to end in `error` and this one says Errors so do it manually.
      throw new SfError(messages.getMessage('jwtAuthErrors', [authErrors.join('\n')]), 'JwtAuthError');
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
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Instance URL [${authFieldsBuilder.instance_url}] is not available.  DNS lookup failed. Using loginUrl [${options.loginUrl}] instead. This may result in a "Destination URL not reset" error.`
      );
      authFields.instanceUrl = options.loginUrl;
    }

    return authFields;
  }

  private async tryJwtAuth(
    clientId: string,
    loginUrl: string,
    audienceUrl: string,
    privateKeyContents: string
  ): Promise<JsonMap> {
    const jwtToken = jwt.sign(
      {
        iss: clientId,
        sub: this.getUsername(),
        aud: audienceUrl,
        exp: Date.now() + 300,
      },
      privateKeyContents,
      {
        algorithm: 'RS256',
      }
    );

    const oauth2 = new OAuth2({ loginUrl });
    return ensureJsonMap(
      await oauth2.requestToken({
        // eslint-disable-next-line camelcase
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtToken,
      })
    );
  }

  // Build OAuth config for a refresh token auth flow
  private async buildRefreshTokenConfig(options: JwtOAuth2Config): Promise<AuthFields> {
    const fullOptions: JwtOAuth2Config = {
      ...options,
      redirectUri: options.redirectUri ?? this.getRedirectUri(),
      // Ideally, this would be removed at some point in the distant future when all auth files
      // now have the clientId stored in it.
      ...(options.clientId
        ? {}
        : { clientId: DEFAULT_CONNECTED_APP_INFO.clientId, clientSecret: DEFAULT_CONNECTED_APP_INFO.clientSecret }),
    };

    const oauth2 = new OAuth2(fullOptions);
    let authFieldsBuilder: TokenResponse;
    try {
      authFieldsBuilder = await oauth2.refreshToken(ensure(fullOptions.refreshToken));
    } catch (err: unknown) {
      const cause = err instanceof Error ? err : SfError.wrap(err);
      throw messages.createError('refreshTokenAuthError', [cause.message], undefined, cause);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { orgId } = parseIdUrl(authFieldsBuilder.id);

    let username = this.getUsername();
    if (!username) {
      const userInfo = await this.retrieveUserInfo(authFieldsBuilder.instance_url, authFieldsBuilder.access_token);
      username = ensureString(userInfo?.username);
    }
    return {
      orgId,
      username,
      accessToken: authFieldsBuilder.access_token,
      instanceUrl: authFieldsBuilder.instance_url,
      loginUrl: fullOptions.loginUrl ?? authFieldsBuilder.instance_url,
      // Refresh Token Rotation (RTR): when the app has RTR enabled, the token endpoint returns a
      // NEW refresh_token that we must persist, replacing the one we sent. When RTR is off, the
      // response omits refresh_token, so we keep the existing one.
      // https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_refresh_token_flow.htm&type=5
      refreshToken: authFieldsBuilder.refresh_token ?? fullOptions.refreshToken,
      clientId: fullOptions.clientId,
      clientSecret: fullOptions.clientSecret,
    };
  }

  /**
   * Performs an authCode exchange but the Oauth2 feature of jsforce is extended to include a code_challenge
   *
   * @param options The oauth options
   * @param oauth2 The oauth2 extension that includes a code_challenge
   */
  private async exchangeToken(options: JwtOAuth2Config, oauth2: OAuth2 = new OAuth2(options)): Promise<AuthFields> {
    if (!oauth2.redirectUri) {
      oauth2.redirectUri = this.getRedirectUri();
    }
    if (!oauth2.clientId) {
      oauth2.clientId = this.getClientId();
    }

    // Exchange the auth code for an access token and refresh token.
    let authFields: TokenResponse;
    try {
      this.logger.debug(`Exchanging auth code for access token using loginUrl: ${options.loginUrl ?? '<undefined>'}`);
      authFields = await oauth2.requestToken(ensure(options.authCode));
      this.logger.debug(`Successfully requested an access token with scopes: "${authFields.scope}".`);
    } catch (err) {
      const msg = err instanceof Error ? `${err.name}::${err.message}` : typeof err === 'string' ? err : 'UNKNOWN';
      const redacted = filterSecrets(options);
      throw SfError.create({
        message: messages.getMessage('authCodeExchangeError', [msg]),
        name: 'AuthCodeExchangeError',
        ...(err instanceof Error ? { cause: err } : {}),
        data: (isArray(redacted) ? redacted[0] : redacted) as JwtOAuth2Config,
      });
    }

    const { orgId } = parseIdUrl(authFields.id);

    let username: Optional<string> = this.getUsername();

    // Only need to query for the username if it isn't known. For example, a new auth code exchange
    // rather than refreshing a token on an existing connection.
    if (!username) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const userInfo = await this.retrieveUserInfo(authFields.instance_url, authFields.access_token);
      username = userInfo?.username;
    }

    return {
      accessToken: authFields.access_token,
      instanceUrl: authFields.instance_url,
      orgId,
      username,
      loginUrl: options.loginUrl ?? authFields.instance_url,
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
    const userInfoUrl = `${baseUrl.toString()}services/oauth2/userinfo`;
    const headers = Object.assign({ Authorization: `Bearer ${accessToken}` }, SFDX_HTTP_HEADERS);
    try {
      this.logger.info(`Sending request for Username after successful auth code exchange to URL: ${userInfoUrl}`);
      let response = await new Transport().httpRequest({ url: userInfoUrl, method: 'GET', headers });
      if (response.statusCode >= 400) {
        this.throwUserGetException(response);
      } else {
        const userInfoJson = parseJsonMap(response.body) as UserInfoResult;
        const url = `${baseUrl.toString()}services/data/${apiVersion}/sobjects/User/${userInfoJson.user_id}`;
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
  private throwUserGetException(response: { body?: string }): void {
    let errorMsg = '';
    const bodyAsString = response.body ?? JSON.stringify({ message: 'UNKNOWN', errorCode: 'UNKNOWN' });
    try {
      const body = parseJson(bodyAsString) as Many<{ message?: string; errorCode?: string }>;
      if (isArray(body)) {
        errorMsg = body.map((line) => line.message ?? line.errorCode ?? 'UNKNOWN').join(os.EOL);
      } else {
        errorMsg = body.message ?? body.errorCode ?? 'UNKNOWN';
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
    const scratchOrgInfoUrl = `${baseUrl.toString()}services/data/${apiVersion}/query?q=SELECT%20Id%20FROM%20ScratchOrgInfo%20limit%201`;
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
  export type Options = {
    /**
     * Org signup username.
     */
    username?: string;
    /**
     * OAuth options.
     */
    oauth2Options?: JwtOAuth2Config;
    clientApps?: Array<{
      name: string;
      accessToken: string;
      refreshToken: string;
      clientId: string;
      clientSecret?: string;
    }>;
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
  };
}
