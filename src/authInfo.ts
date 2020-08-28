/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AsyncCreatable, cloneJson, env, isEmpty, parseJsonMap, set } from '@salesforce/kit';
import {
  AnyFunction,
  AnyJson,
  asString,
  ensure,
  ensureJsonMap,
  ensureString,
  getString,
  isPlainObject,
  isString,
  JsonMap,
  keysOf,
  Nullable,
  Optional
} from '@salesforce/ts-types';
import { createHash, randomBytes } from 'crypto';
import * as dns from 'dns';
import { OAuth2, OAuth2Options, TokenResponse } from 'jsforce';
// @ts-ignore No typings directly available for jsforce/lib/transport
import * as Transport from 'jsforce/lib/transport';
import * as jwt from 'jsonwebtoken';
import { resolve as pathResolve } from 'path';
import { parse as urlParse } from 'url';
import { AuthInfoConfig } from './config/authInfoConfig';
import { ConfigAggregator } from './config/configAggregator';
import { Connection, SFDX_HTTP_HEADERS } from './connection';
import { Crypto } from './crypto';
import { Global } from './global';
import { Logger } from './logger';
import { SfdxError, SfdxErrorConfig } from './sfdxError';
import { fs } from './util/fs';

/**
 * Fields for authorization, org, and local information.
 */
// Fields that are persisted in auth files
export interface AuthFields {
  accessToken?: string;
  alias?: string;
  authCode?: string;
  clientId?: string;
  clientSecret?: string;
  created?: string;
  createdOrgInstance?: string;
  devHubUsername?: string;
  instanceUrl?: string;
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
}

/**
 * Options for access token flow.
 */
export interface AccessTokenOptions {
  accessToken?: string;
  loginUrl?: string;
  instanceUrl?: string;
}

/**
 * A function to update a refresh token when the access token is expired.
 */
export type RefreshFn = (
  conn: Connection,
  callback: (err: Nullable<Error>, accessToken?: string, res?: object) => Promise<void>
) => Promise<void>;

/**
 * Options for {@link Connection}.
 */
export type ConnectionOptions = AuthFields & {
  /**
   * OAuth options.
   */
  oauth2?: Partial<OAuth2Options>;
  /**
   * Refresh token callback.
   */
  refreshFn?: RefreshFn;
};

// Extend OAuth2 to add JWT Bearer Token Flow support.
class JwtOAuth2 extends OAuth2 {
  constructor(options: OAuth2Options) {
    super(options);
  }

  public async jwtAuthorize(innerToken: string, callback?: AnyFunction): Promise<AnyJson> {
    // tslint:disable-line:no-any
    // @ts-ignore TODO: need better typings for jsforce
    return super._postParams(
      {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: innerToken
      },
      callback
    );
  }
}

/**
 * Extend OAuth2 to add code verifier support for the auth code (web auth) flow
 * const oauth2 = new OAuth2WithVerifier({ loginUrl, clientSecret, clientId, redirectUri });
 *
 * const authUrl = oauth2.getAuthorizationUrl({
 *    state: 'foo',
 *    prompt: 'login',
 *    scope: 'api web'
 * });
 * console.log(authUrl);
 * const authCode = await retrieveCode();
 * const authInfo = await AuthInfo.create({ oauth2Options: { clientId, clientSecret, loginUrl, authCode }, oauth2});
 * console.log(`access token: ${authInfo.getFields().accessToken}`);
 */
export class OAuth2WithVerifier extends OAuth2 {
  public readonly codeVerifier: string;

  constructor(options: OAuth2Options) {
    super(options);

    // Set a code verifier string for OAuth authorization
    this.codeVerifier = base64UrlEscape(randomBytes(Math.ceil(128)).toString('base64'));
  }

  /**
   * Overrides jsforce.OAuth2.getAuthorizationUrl.  Get Salesforce OAuth2 authorization page
   * URL to redirect user agent, adding a verification code for added security.
   *
   * @param params
   */
  public getAuthorizationUrl(params: object) {
    // code verifier must be a base 64 url encoded hash of 128 bytes of random data. Our random data is also
    // base 64 url encoded. See Connection.create();
    const codeChallenge = base64UrlEscape(
      createHash('sha256')
        .update(this.codeVerifier)
        .digest('base64')
    );
    set(params, 'code_challenge', codeChallenge);

    return super.getAuthorizationUrl(params);
  }

  public async requestToken(code: string, callback?: (err: Error, tokenResponse: TokenResponse) => void) {
    return super.requestToken(code, callback);
  }

  /**
   * Overrides jsforce.OAuth2._postParams because jsforce's oauth impl doesn't support
   * coder_verifier and code_challenge. This enables the server to disallow trading a one-time auth code
   * for an access/refresh token when the verifier and challenge are out of alignment.
   *
   * See https://github.com/jsforce/jsforce/issues/665
   */
  // tslint:disable-next-line:no-unused-variable
  protected async _postParams(params: object, callback: AnyFunction) {
    set(params, 'code_verifier', this.codeVerifier);
    // @ts-ignore TODO: need better typings for jsforce
    return super._postParams(params, callback);
  }
}

/**
 * Salesforce URLs.
 */
export enum SfdcUrl {
  SANDBOX = 'https://test.salesforce.com',
  PRODUCTION = 'https://login.salesforce.com'
}

const INTERNAL_URL_PARTS = [
  '.internal.',
  '.vpod.',
  'stm.salesforce.com',
  '.blitz.salesforce.com',
  'mobile1.t.salesforce.com'
];

function isInternalUrl(loginUrl = ''): boolean {
  return loginUrl.startsWith('https://gs1.') || INTERNAL_URL_PARTS.some(part => loginUrl.includes(part));
}

function getJwtAudienceUrl(options: OAuth2Options) {
  // default audience must be...
  let audienceUrl: string = SfdcUrl.PRODUCTION;
  const loginUrl = getString(options, 'loginUrl', '');
  const createdOrgInstance = getString(options, 'createdOrgInstance', '')
    .trim()
    .toLowerCase();

  if (process.env.SFDX_AUDIENCE_URL) {
    audienceUrl = process.env.SFDX_AUDIENCE_URL;
  } else if (isInternalUrl(loginUrl)) {
    // This is for internal developers when just doing authorize;
    audienceUrl = loginUrl;
  } else if (createdOrgInstance.startsWith('cs') || urlParse(loginUrl).hostname === 'test.salesforce.com') {
    audienceUrl = SfdcUrl.SANDBOX;
  } else if (createdOrgInstance.startsWith('gs1')) {
    audienceUrl = 'https://gs1.salesforce.com';
  }

  return audienceUrl;
}

// parses the id field returned from jsForce oauth2 methods to get
// user ID and org ID.
function _parseIdUrl(idUrl: string) {
  const idUrls = idUrl.split('/');
  const userId = idUrls.pop();
  const orgId = idUrls.pop();

  return {
    userId,
    orgId,
    url: idUrl
  };
}

// Legacy. The connected app info is owned by the thing that
// creates new AuthInfos. Currently that is the auth:* commands which
// aren't owned by this core library. These values need to be here
// for any old auth files where the id and secret aren't stored.
//
// Ideally, this would be removed at some point in the distant future
// when all auth files now have the clientId stored in it.
const DEFAULT_CONNECTED_APP_INFO = {
  legacyClientId: 'SalesforceDevelopmentExperience',
  legacyClientSecret: '1384510088588713504'
};

class AuthInfoCrypto extends Crypto {
  private static readonly encryptedFields: Array<keyof AuthFields> = [
    'accessToken',
    'refreshToken',
    'password',
    'clientSecret'
  ];

  public decryptFields(fields: AuthFields): AuthFields {
    return this._crypt(fields, 'decrypt');
  }

  public encryptFields(fields: AuthFields): AuthFields {
    return this._crypt(fields, 'encrypt');
  }

  private _crypt(fields: AuthFields, method: 'encrypt' | 'decrypt'): AuthFields {
    const copy: AuthFields = {};
    for (const key of keysOf(fields)) {
      const rawValue = fields[key];
      if (rawValue !== undefined) {
        if (isString(rawValue) && AuthInfoCrypto.encryptedFields.includes(key)) {
          copy[key] = this[method](asString(rawValue)) as never;
        } else {
          copy[key] = rawValue as never;
        }
      }
    }
    return copy;
  }
}

// Makes a nodejs base64 encoded string compatible with rfc4648 alternative encoding for urls.
// @param base64Encoded a nodejs base64 encoded string
function base64UrlEscape(base64Encoded: string): string {
  // builtin node js base 64 encoding is not 64 url compatible.
  // See https://toolsn.ietf.org/html/rfc4648#section-5
  return base64Encoded
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

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
export class AuthInfo extends AsyncCreatable<AuthInfo.Options> {
  /**
   * Get a list of all auth files stored in the global directory.
   * @returns {Promise<string[]>}
   */
  public static async listAllAuthFiles(): Promise<string[]> {
    const globalFiles = await fs.readdir(Global.DIR);
    const authFiles = globalFiles.filter(file => file.match(AuthInfo.authFilenameFilterRegEx));

    // Want to throw a clean error if no files are found.
    if (isEmpty(authFiles)) {
      const errConfig: SfdxErrorConfig = new SfdxErrorConfig('@salesforce/core', 'core', 'NoAuthInfoFound');
      throw SfdxError.create(errConfig);
    }

    // At least one auth file is in the global dir.
    return authFiles;
  }

  /**
   * Returns true if one or more authentications are persisted.
   */
  public static async hasAuthentications(): Promise<boolean> {
    try {
      const authFiles: string[] = await this.listAllAuthFiles();
      return !isEmpty(authFiles);
    } catch (err) {
      if (err.name === 'OrgDataNotAvailableError' || err.code === 'ENOENT') {
        return false;
      }
      throw err;
    }
  }

  /**
   * Get the authorization URL.
   * @param options The options to generate the URL.
   */
  public static getAuthorizationUrl(options: OAuth2Options & { scope: string }): string {
    const oauth2 = new OAuth2WithVerifier(options);

    // The state parameter allows the redirectUri callback listener to ignore request
    // that don't contain the state value.
    const params = {
      state: randomBytes(Math.ceil(6)).toString('hex'),
      prompt: 'login',
      // Default connected app is 'refresh_token api web'
      scope: options.scope || env.getString('SFDX_AUTH_SCOPES', 'refresh_token api web')
    };

    return oauth2.getAuthorizationUrl(params);
  }

  /**
   * Forces the auth file to be re-read from disk for a given user. Returns `true` if a value was removed.
   * @param username The username for the auth info to re-read.
   */
  public static clearCache(username: string): boolean {
    if (username) {
      return AuthInfo.cache.delete(username);
    }
    return false;
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
  public static parseSfdxAuthUrl(sfdxAuthUrl: string) {
    const match = sfdxAuthUrl.match(
      /^force:\/\/([a-zA-Z0-9._-]+):([a-zA-Z0-9._-]*):([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+)/
    );

    if (!match) {
      throw new SfdxError(
        'Invalid sfdx auth url. Must be in the format `force://<clientId>:<clientSecret>:<refreshToken>@<loginUrl>`. The instanceUrl must not have the protocol set.',
        'INVALID_SFDX_AUTH_URL'
      );
    }
    const [, clientId, clientSecret, refreshToken, loginUrl] = match;
    return {
      clientId,
      clientSecret,
      refreshToken,
      loginUrl: `https://${loginUrl}`
    };
  }

  // The regular expression that filters files stored in $HOME/.sfdx
  private static authFilenameFilterRegEx: RegExp = /^[^.][^@]*@[^.]+(\.[^.\s]+)+\.json$/;

  // Cache of auth fields by username.
  private static cache: Map<string, AuthFields> = new Map();

  // All sensitive fields are encrypted
  private fields: AuthFields = {};

  // Possibly overridden in create
  private usingAccessToken = false;

  // Initialized in init
  private logger!: Logger;

  private authInfoCrypto!: AuthInfoCrypto;

  private options: AuthInfo.Options;

  /**
   * Constructor
   * **Do not directly construct instances of this class -- use {@link AuthInfo.create} instead.**
   * @param options The options for the class instance
   */
  public constructor(options: AuthInfo.Options) {
    super(options);
    this.options = options;
  }

  /**
   * Get the username.
   */
  public getUsername(): Optional<string> {
    return this.fields.username;
  }

  /**
   * Returns true if `this` is using the JWT flow.
   */
  public isJwt(): boolean {
    const { refreshToken, privateKey } = this.fields;
    return !refreshToken && !!privateKey;
  }

  /**
   * Returns true if `this` is using an access token flow.
   */
  public isAccessTokenFlow(): boolean {
    const { refreshToken, privateKey } = this.fields;
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
    const { refreshToken, authCode } = this.fields;
    return !authCode && !!refreshToken;
  }

  /**
   * Updates the cache and persists the authentication fields (encrypted).
   * @param authData New data to save.
   */
  public async save(authData?: AuthFields): Promise<AuthInfo> {
    this.update(authData);
    const username = ensure(this.getUsername());
    AuthInfo.cache.set(username, this.fields);

    const dataToSave = cloneJson(this.fields);

    this.logger.debug(dataToSave);

    const config = await AuthInfoConfig.create({
      ...AuthInfoConfig.getOptions(username),
      throwOnNotFound: false
    });
    config.setContentsFromObject(dataToSave);
    await config.write();

    this.logger.info(`Saved auth info for username: ${this.getUsername()}`);
    return this;
  }

  /**
   * Update the authorization fields, encrypting sensitive fields, but do not persist.
   * For convenience `this` object is returned.
   *
   * @param authData Authorization fields to update.
   * @param encrypt Encrypt the fields.
   */
  public update(authData?: AuthFields, encrypt = true): AuthInfo {
    if (authData && isPlainObject(authData)) {
      let copy = cloneJson(authData);
      if (encrypt) {
        copy = this.authInfoCrypto.encryptFields(copy);
      }
      Object.assign(this.fields, copy);
      this.logger.info(`Updated auth info for username: ${this.getUsername()}`);
    }
    return this;
  }

  /**
   * Get the auth fields (decrypted) needed to make a connection.
   */
  public getConnectionOptions(): ConnectionOptions {
    let opts: ConnectionOptions;

    const { accessToken, instanceUrl } = this.fields;

    if (this.isAccessTokenFlow()) {
      this.logger.info('Returning fields for a connection using access token.');

      // Just auth with the accessToken
      opts = { accessToken, instanceUrl };
    } else if (this.isJwt()) {
      this.logger.info('Returning fields for a connection using JWT config.');
      opts = {
        accessToken,
        instanceUrl,
        refreshFn: this.refreshFn.bind(this)
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
          loginUrl: instanceUrl || 'https://login.salesforce.com',
          clientId: this.fields.clientId || DEFAULT_CONNECTED_APP_INFO.legacyClientId,
          redirectUri: 'http://localhost:1717/OauthRedirect'
        },
        accessToken,
        instanceUrl,
        refreshFn: this.refreshFn.bind(this)
      };
    }

    // decrypt the fields
    return this.authInfoCrypto.decryptFields(opts);
  }

  /**
   * Get the authorization fields.
   */
  public getFields(): AuthFields {
    return this.fields;
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
    const decryptedFields = this.authInfoCrypto.decryptFields(this.fields);
    const instanceUrl = ensure(decryptedFields.instanceUrl).replace(/^https?:\/\//, '');
    let sfdxAuthUrl = 'force://';

    if (decryptedFields.clientId) {
      sfdxAuthUrl += `${decryptedFields.clientId}:${decryptedFields.clientSecret || ''}:`;
    }

    sfdxAuthUrl += `${decryptedFields.refreshToken}@${instanceUrl}`;
    return sfdxAuthUrl;
  }

  /**
   * Initializes an instance of the AuthInfo class.
   */
  public async init(): Promise<void> {
    // Must specify either username and/or options
    const options = this.options.oauth2Options || this.options.accessTokenOptions;
    if (!this.options.username && !(this.options.oauth2Options || this.options.accessTokenOptions)) {
      throw SfdxError.create('@salesforce/core', 'core', 'AuthInfoCreationError');
    }

    // If a username AND oauth options were passed, ensure an auth file for the username doesn't
    // already exist.  Throw if it does so we don't overwrite the auth file.
    if (this.options.username && this.options.oauth2Options) {
      const authInfoConfig = await AuthInfoConfig.create({
        ...AuthInfoConfig.getOptions(this.options.username),
        throwOnNotFound: false
      });
      if (await authInfoConfig.exists()) {
        throw SfdxError.create(
          new SfdxErrorConfig(
            '@salesforce/core',
            'core',
            'AuthInfoOverwriteError',
            undefined,
            'AuthInfoOverwriteErrorAction'
          )
        );
      }
    }

    this.fields.username = this.options.username || getString(options, 'username') || undefined;

    // If the username is an access token, use that for auth and don't persist
    const accessTokenMatch = isString(this.fields.username) && this.fields.username.match(/^(00D\w{12,15})![\.\w]*$/);
    if (accessTokenMatch) {
      // Need to initAuthOptions the logger and authInfoCrypto since we don't call init()
      this.logger = await Logger.child('AuthInfo');
      this.authInfoCrypto = await AuthInfoCrypto.create({
        noResetOnClose: true
      });

      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      const instanceUrl: string = (aggregator.getPropertyValue('instanceUrl') as string) || SfdcUrl.PRODUCTION;

      this.update({
        accessToken: this.options.username,
        instanceUrl,
        orgId: accessTokenMatch[1]
      });

      this.usingAccessToken = true;
    } else {
      await this.initAuthOptions(options);
    }
  }

  /**
   * Initialize this AuthInfo instance with the specified options. If options are not provided, initialize it from cache
   * or by reading from the persistence store. For convenience `this` object is returned.
   * @param options Options to be used for creating an OAuth2 instance.
   *
   * **Throws** *{@link SfdxError}{ name: 'NamedOrgNotFound' }* Org information does not exist.
   * @returns {Promise<AuthInfo>}
   */
  private async initAuthOptions(options?: OAuth2Options | AccessTokenOptions): Promise<AuthInfo> {
    this.logger = await Logger.child('AuthInfo');
    this.authInfoCrypto = await AuthInfoCrypto.create();

    // If options were passed, use those before checking cache and reading an auth file.
    let authConfig: AuthFields;

    if (options) {
      options = cloneJson(options);

      if (this.isTokenOptions(options)) {
        authConfig = options;
      } else {
        if (this.options.parentUsername) {
          const parentUserFields = await this.loadAuthFromConfig(this.options.parentUsername);
          const parentFields = this.authInfoCrypto.decryptFields(parentUserFields);

          options.clientId = parentFields.clientId;

          if (process.env.SFDX_CLIENT_SECRET) {
            options.clientSecret = process.env.SFDX_CLIENT_SECRET;
          } else {
            // Grab whatever flow is defined
            Object.assign(options, {
              clientSecret: parentFields.clientSecret,
              privateKey: parentFields.privateKey ? pathResolve(parentFields.privateKey) : parentFields.privateKey
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
          if (this.options.oauth2 instanceof OAuth2WithVerifier) {
            // authcode exchange / web auth flow
            authConfig = await this.exchangeToken(options, this.options.oauth2);
          } else {
            authConfig = await this.exchangeToken(options);
          }
        }
      }

      // Update the auth fields WITH encryption
      this.update(authConfig);
    } else {
      authConfig = await this.loadAuthFromConfig(ensure(this.getUsername()));
      // Update the auth fields WITHOUT encryption (already encrypted)
      this.update(authConfig, false);
    }

    const username = this.getUsername();
    if (username) {
      // Cache the fields by username (fields are encrypted)
      AuthInfo.cache.set(username, this.fields);
    }

    return this;
  }

  private async loadAuthFromConfig(username: string): Promise<AuthFields> {
    if (AuthInfo.cache.has(username)) {
      return ensure(AuthInfo.cache.get(username));
    } else {
      // Fetch from the persisted auth file
      try {
        const config: AuthInfoConfig = await AuthInfoConfig.create({
          ...AuthInfoConfig.getOptions(username),
          throwOnNotFound: true
        });
        return config.toObject();
      } catch (e) {
        if (e.code === 'ENOENT') {
          throw SfdxError.create('@salesforce/core', 'core', 'NamedOrgNotFound', [username]);
        } else {
          throw e;
        }
      }
    }
  }

  private isTokenOptions(options: OAuth2Options | AccessTokenOptions): options is AccessTokenOptions {
    // Although OAuth2Options does not contain refreshToken, privateKey, or privateKeyFile, a JS consumer could still pass those in
    // which WILL have an access token as well, but it should be considered an OAuth2Options at that point.
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
    callback: (err: Nullable<Error>, accessToken?: string, res?: object) => Promise<void>
  ): Promise<void> {
    this.logger.info('Access token has expired. Updating...');

    try {
      const fields = this.authInfoCrypto.decryptFields(this.fields);
      await this.initAuthOptions(fields);
      await this.save();
      return await callback(null, fields.accessToken);
    } catch (err) {
      if (err.message && err.message.includes('Data Not Available')) {
        const errConfig = new SfdxErrorConfig('@salesforce/core', 'core', 'OrgDataNotAvailableError', [
          this.getUsername()
        ]);
        for (let i = 1; i < 5; i++) {
          errConfig.addAction(`OrgDataNotAvailableErrorAction${i}`);
        }
        return await callback(SfdxError.create(errConfig));
      }
      return await callback(err);
    }
  }

  // Build OAuth config for a JWT auth flow
  private async buildJwtConfig(options: OAuth2Options): Promise<AuthFields> {
    const privateKeyContents = await fs.readFile(ensure(options.privateKey), 'utf8');
    const audienceUrl = getJwtAudienceUrl(options);
    const jwtToken = await jwt.sign(
      {
        iss: options.clientId,
        sub: this.getUsername(),
        aud: audienceUrl,
        exp: Date.now() + 300
      },
      privateKeyContents,
      {
        algorithm: 'RS256'
      }
    );

    const oauth2 = new JwtOAuth2({ loginUrl: options.loginUrl });
    let _authFields: JsonMap;
    try {
      _authFields = ensureJsonMap(await oauth2.jwtAuthorize(jwtToken));
    } catch (err) {
      throw SfdxError.create('@salesforce/core', 'core', 'JWTAuthError', [err.message]);
    }

    const authFields: AuthFields = {
      accessToken: asString(_authFields.access_token),
      orgId: _parseIdUrl(ensureString(_authFields.id)).orgId,
      loginUrl: options.loginUrl,
      privateKey: options.privateKey,
      clientId: options.clientId
    };

    const instanceUrl = ensureString(_authFields.instance_url);
    const parsedUrl = urlParse(instanceUrl);
    try {
      // Check if the url is resolvable. This can fail when my-domains have not been replicated.
      await this.lookup(ensure(parsedUrl.hostname));
      authFields.instanceUrl = instanceUrl;
    } catch (err) {
      this.logger.debug(
        `Instance URL [${_authFields.instance_url}] is not available.  DNS lookup failed. Using loginUrl [${options.loginUrl}] instead. This may result in a "Destination URL not reset" error.`
      );
      authFields.instanceUrl = options.loginUrl;
    }

    return authFields;
  }

  // Build OAuth config for a refresh token auth flow
  private async buildRefreshTokenConfig(options: OAuth2Options): Promise<AuthFields> {
    // Ideally, this would be removed at some point in the distant future when all auth files
    // now have the clientId stored in it.
    if (!options.clientId) {
      options.clientId = DEFAULT_CONNECTED_APP_INFO.legacyClientId;
      options.clientSecret = DEFAULT_CONNECTED_APP_INFO.legacyClientSecret;
    }

    const oauth2 = new OAuth2(options);
    let _authFields: TokenResponse;
    try {
      _authFields = await oauth2.refreshToken(ensure(options.refreshToken));
    } catch (err) {
      throw SfdxError.create('@salesforce/core', 'core', 'RefreshTokenAuthError', [err.message]);
    }

    return {
      accessToken: _authFields.access_token,
      // @ts-ignore TODO: need better typings for jsforce
      instanceUrl: _authFields.instance_url,
      // @ts-ignore TODO: need better typings for jsforce
      orgId: _parseIdUrl(_authFields.id).orgId,
      // @ts-ignore TODO: need better typings for jsforce
      loginUrl: options.loginUrl || _authFields.instance_url,
      refreshToken: options.refreshToken,
      clientId: options.clientId,
      clientSecret: options.clientSecret
    };
  }

  /**
   * Performs an authCode exchange but the Oauth2 feature of jsforce is extended to include a code_challenge
   * @param options The oauth options
   * @param oauth2 The oauth2 extension that includes a code_challenge
   */
  private async exchangeToken(options: OAuth2Options, oauth2: OAuth2 = new OAuth2(options)): Promise<AuthFields> {
    // Exchange the auth code for an access token and refresh token.
    let _authFields: TokenResponse;
    try {
      this.logger.info(`Exchanging auth code for access token using loginUrl: ${options.loginUrl}`);
      _authFields = await oauth2.requestToken(ensure(options.authCode));
    } catch (err) {
      throw SfdxError.create('@salesforce/core', 'core', 'AuthCodeExchangeError', [err.message]);
    }

    // @ts-ignore TODO: need better typings for jsforce
    const { userId, orgId } = _parseIdUrl(_authFields.id);

    let username: Optional<string> = this.getUsername();

    // Only need to query for the username if it isn't known. For example, a new auth code exchange
    // rather than refreshing a token on an existing connection.
    if (!username) {
      // Make a REST call for the username directly.  Normally this is done via a connection
      // but we don't want to create circular dependencies or lots of snowflakes
      // within this file to support it.
      const apiVersion = 'v42.0'; // hardcoding to v42.0 just for this call is okay.
      const instance = ensure(getString(_authFields, 'instance_url'));
      const url = `${instance}/services/data/${apiVersion}/sobjects/User/${userId}`;
      const headers = Object.assign({ Authorization: `Bearer ${_authFields.access_token}` }, SFDX_HTTP_HEADERS);

      try {
        this.logger.info(`Sending request for Username after successful auth code exchange to URL: ${url}`);
        const response = await new Transport().httpRequest({ url, headers });
        username = asString(parseJsonMap(response.body).Username);
      } catch (err) {
        throw SfdxError.create('@salesforce/core', 'core', 'AuthCodeUsernameRetrievalError', [orgId, err.message]);
      }
    }

    return {
      accessToken: _authFields.access_token,
      // @ts-ignore TODO: need better typings for jsforce
      instanceUrl: _authFields.instance_url,
      orgId,
      username,
      // @ts-ignore TODO: need better typings for jsforce
      loginUrl: options.loginUrl || _authFields.instance_url,
      refreshToken: _authFields.refresh_token,
      clientId: options.clientId,
      clientSecret: options.clientSecret
    };
  }

  // See https://nodejs.org/api/dns.html#dns_dns_lookup_hostname_options_callback
  private async lookup(host: string): Promise<{ address: string; family: number }> {
    return new Promise<{ address: string; family: number }>((resolve, reject) => {
      dns.lookup(host, (err, address: string, family: number) => {
        if (err) {
          reject(err);
        } else {
          resolve({ address, family });
        }
      });
    });
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
    oauth2Options?: OAuth2Options;
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
  }
}
