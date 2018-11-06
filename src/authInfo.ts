/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * Options for OAuth2.
 * @typedef OAuth2Options
 * @property {string} authzServiceUrl
 * @property {string} tokenServiceUrl
 * @property {string} clientId
 * @property {string} clientSecret
 * @property {string} httpProxy
 * @property {string} loginUrl
 * @property {string} proxyUrl
 * @property {string} redirectUri
 * @property {string} refreshToken
 * @property {string} revokeServiceUrl
 * @property {string} authCode
 * @property {string} privateKeyFile
 * @see https://jsforce.github.io/jsforce/doc/OAuth2.html
 */

/**
 * Fields for authorization, organization, and local information.
 * @typedef AuthFields
 * @property {string} accessToken
 * @property {string} alias
 * @property {string} authCode
 * @property {string} clientId
 * @property {string} clientSecret
 * @property {string} created
 * @property {string} createdOrgInstance
 * @property {string} devHubUsername
 * @property {string} instanceUrl
 * @property {string} isDevHub
 * @property {string} loginUrl
 * @property {string} orgId
 * @property {string} password
 * @property {string} privateKey
 * @property {string} refreshToken
 * @property {string} scratchAdminUsername
 * @property {string} snapshot
 * @property {string} userId
 * @property {string} username
 * @property {string} usernames
 * @property {string} userProfileName
 */

/**
 * Options for access token flow.
 * @typedef AccessTokenOptions
 * @property {string} accessToken
 * @property {string} loginUrl
 * @property {string} instanceUrl
 */

import {
  AsyncCreatable,
  cloneJson,
  isEmpty,
  parseJsonMap,
  set
} from '@salesforce/kit';
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
import { parse as urlParse } from 'url';
import { AuthInfoConfig } from './config/authInfoConfig';
import { ConfigAggregator } from './config/configAggregator';
import { ConfigFile } from './config/configFile';
import { Connection, SFDX_HTTP_HEADERS } from './connection';
import { Crypto } from './crypto';
import { Global } from './global';
import { Logger } from './logger';
import { SfdxError, SfdxErrorConfig } from './sfdxError';
import * as fs from './util/fs';

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
}

export interface AccessTokenOptions {
  accessToken?: string;
  loginUrl?: string;
  instanceUrl?: string;
}

export type RefreshFn = (
  conn: Connection,
  callback: (
    err: Nullable<Error>,
    accessToken?: string,
    res?: object
  ) => Promise<void>
) => Promise<void>;

export type ConnectionOptions = AuthFields & {
  oauth2?: Partial<OAuth2Options>;
  refreshFn?: RefreshFn;
};

// Extend OAuth2 to add JWT Bearer Token Flow support.
class JwtOAuth2 extends OAuth2 {
  constructor(options: OAuth2Options) {
    super(options);
  }

  public async jwtAuthorize(
    innerToken: string,
    callback?: AnyFunction
  ): Promise<AnyJson> {
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

// Extend OAuth2 to add code verifier support for the auth code (web auth) flow
class AuthCodeOAuth2 extends OAuth2 {
  private codeVerifier: string;

  constructor(options: OAuth2Options) {
    super(options);

    // Set a code verifier string for OAuth authorization
    this.codeVerifier = base64UrlEscape(
      randomBytes(Math.ceil(128)).toString('base64')
    );
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

  public async requestToken(
    code: string,
    callback?: (err: Error, tokenResponse: TokenResponse) => void
  ) {
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

export enum SFDC_URLS {
  sandbox = 'https://test.salesforce.com',
  production = 'https://login.salesforce.com'
}

const INTERNAL_URL_PARTS = [
  '.internal.',
  '.vpod.',
  'stm.salesforce.com',
  '.blitz.salesforce.com',
  'mobile1.t.salesforce.com'
];

function isInternalUrl(loginUrl: string = ''): boolean {
  return (
    loginUrl.startsWith('https://gs1.') ||
    INTERNAL_URL_PARTS.some(part => loginUrl.includes(part))
  );
}

function getJwtAudienceUrl(options: OAuth2Options) {
  // default audience must be...
  let audienceUrl: string = SFDC_URLS.production;
  const loginUrl = getString(options, 'loginUrl', '');
  const createdOrgInstance = getString(options, 'createdOrgInstance', '')
    .trim()
    .toLowerCase();

  if (process.env.SFDX_AUDIENCE_URL) {
    audienceUrl = process.env.SFDX_AUDIENCE_URL;
  } else if (isInternalUrl(loginUrl)) {
    // This is for internal developers when just doing authorize;
    audienceUrl = loginUrl;
  } else if (
    createdOrgInstance.startsWith('cs') ||
    urlParse(loginUrl).hostname === 'test.salesforce.com'
  ) {
    audienceUrl = SFDC_URLS.sandbox;
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

const DEFAULT_CONNECTED_APP_INFO = {
  clientId: 'SalesforceDevelopmentExperience',
  clientSecret: '1384510088588713504'
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

  private _crypt(
    fields: AuthFields,
    method: 'encrypt' | 'decrypt'
  ): AuthFields {
    const copy: AuthFields = {};
    for (const key of keysOf(fields)) {
      const rawValue = fields[key];
      if (rawValue !== undefined) {
        if (
          isString(rawValue) &&
          AuthInfoCrypto.encryptedFields.includes(key)
        ) {
          copy[key] = this[method](asString(rawValue));
        } else {
          copy[key] = rawValue;
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

interface AuthInfoOptions {
  username?: string;
  oauth2Options?: OAuth2Options;
  accessTokenOptions?: AccessTokenOptions;
}

/**
 * Handles persistence and fetching of user authentication information using
 * JWT, OAuth, or refresh tokens. Sets up the refresh flows that jsForce will
 * use to keep tokens active. An AuthInfo can also be created with an access
 * token, but AuthInfos created with access tokens can't be persisted to disk.
 *
 * @example
 * // Creating a new authentication file.
 * const authInfo = await AuthInfo.create(myAdminUsername, {
 *     loginUrl, authCode, clientId, clientSecret
 * });
 * authInfo.save();
 *
 * // Creating an authorization info with an access token.
 * const authInfo = await AuthInfo.create(accessToken);
 *
 * // Using an existing authentication file.
 * const authInfo = await AuthInfo.create(myAdminUsername);
 *
 * // Using the AuthInfo
 * const connection = await Connection.create(authInfo);
 *
 * @see https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_auth.htm
 * @see https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_usernames_orgs.htm
 */
export class AuthInfo extends AsyncCreatable<AuthInfoOptions> {
  /**
   * Get a list of all auth files stored in the global directory.
   * @returns {Promise<string[]>}
   */
  public static async listAllAuthFiles(): Promise<string[]> {
    const globalFiles = await fs.readdir(Global.DIR);
    const authFiles = globalFiles.filter(file =>
      file.match(AuthInfo.authFilenameFilterRegEx)
    );

    // Want to throw a clean error if no files are found.
    if (isEmpty(authFiles)) {
      const errConfig: SfdxErrorConfig = new SfdxErrorConfig(
        '@salesforce/core',
        'core',
        'NoAuthInfoFound'
      );
      throw SfdxError.create(errConfig);
    }

    // At least one auth file is in the global dir.
    return authFiles;
  }

  /**
   * Returns true if one or more authentications are persisted.
   * @returns {Promise<boolean>}
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
   * @param {OAuth2Options} options The options to generate the URL.
   * @returns {string}
   */
  public static getAuthorizationUrl(options: OAuth2Options): string {
    const oauth2 = new AuthCodeOAuth2(options);

    // The state parameter allows the redirectUri callback listener to ignore request
    // that don't contain the state value.
    const params = {
      state: randomBytes(Math.ceil(6)).toString('hex'),
      prompt: 'login',
      scope: 'refresh_token api web'
    };

    return oauth2.getAuthorizationUrl(params);
  }

  /**
   * Forces the auth file to be re-read from disk for a given user.
   * @param {string} username The username for the auth info to re-read.
   * @returns {boolean} True if a value was removed.
   */
  public static clearCache(username: string): boolean {
    if (username) {
      return AuthInfo.cache.delete(username);
    }
    return false;
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

  private options: AuthInfoOptions;

  /**
   * @ignore
   */
  public constructor(options?: AuthInfoOptions) {
    super(options);
    this.options = options || {};
  }

  /**
   * Get the username.
   * @returns {string}
   */
  public getUsername(): Optional<string> {
    return this.fields.username;
  }

  /**
   * Returns true if `this` is using the JWT flow.
   * @returns {boolean}
   */
  public isJwt(): boolean {
    const { refreshToken, privateKey } = this.fields;
    return !refreshToken && !!privateKey;
  }

  /**
   * Returns true if `this` is using an access token flow.
   * @returns {boolean}
   */
  public isAccessTokenFlow(): boolean {
    const { refreshToken, privateKey } = this.fields;
    return !refreshToken && !privateKey;
  }

  /**
   * Returns true if `this` is using the oauth flow.
   * @returns {boolean}
   */
  public isOauth(): boolean {
    return !this.isAccessTokenFlow() && !this.isJwt();
  }

  /**
   * Returns true if `this` is using the refresh token flow.
   * @returns {boolean}
   */
  public isRefreshTokenFlow(): boolean {
    const { refreshToken, authCode } = this.fields;
    return !authCode && !!refreshToken;
  }

  /**
   * Updates the cache and persists the authentication fields (encrypted).
   * @param {AuthFields} [authData] New data to save.
   * @returns {Promise<AuthInfo>}
   */
  public async save(authData?: AuthFields): Promise<AuthInfo> {
    this.update(authData);
    const username = ensure(this.getUsername());
    AuthInfo.cache.set(username, this.fields);

    const dataToSave = cloneJson(this.fields);

    // Do not persist the default client ID and secret
    if (dataToSave.clientId === DEFAULT_CONNECTED_APP_INFO.clientId) {
      delete dataToSave.clientId;
      delete dataToSave.clientSecret;
    }

    this.logger.debug(dataToSave);

    const config: ConfigFile = await AuthInfoConfig.create(
      AuthInfoConfig.getOptions(username)
    );
    config.setContentsFromObject(dataToSave);
    await config.write();

    this.logger.info(`Saved auth info for username: ${this.getUsername()}`);
    return this;
  }

  /**
   * Update the authorization fields, encrypting sensitive fields, but do not persist.
   *
   * @param {AuthFields} authData Authorization fields to update.
   * @param {boolean} encrypt Encrypt the fields.
   * @returns {AuthInfo} For convenience `this` object is returned.
   */
  public update(authData?: AuthFields, encrypt: boolean = true): AuthInfo {
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
   *
   * @returns {AuthFields}
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
          clientId: this.fields.clientId || DEFAULT_CONNECTED_APP_INFO.clientId,
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
   * @returns {AuthFields}
   */
  public getFields(): AuthFields {
    return this.fields;
  }

  /**
   * Returns true if this org is using access token auth.
   * @returns {boolean}
   */
  public isUsingAccessToken(): boolean {
    return this.usingAccessToken;
  }

  /**
   * Get the SFDX Auth URL.
   * @see https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_auth.htm#cli_reference_force_auth
   * @returns {string}
   */
  public getSfdxAuthUrl(): string {
    const decryptedFields = this.authInfoCrypto.decryptFields(this.fields);
    const instanceUrl = ensure(decryptedFields.instanceUrl).replace(
      /^https?:\/\//,
      ''
    );
    let sfdxAuthUrl = 'force://';

    if (decryptedFields.clientId) {
      sfdxAuthUrl += `${decryptedFields.clientId}:${
        decryptedFields.clientSecret
      }:`;
    }

    sfdxAuthUrl += `${decryptedFields.refreshToken}@${instanceUrl}`;
    return sfdxAuthUrl;
  }

  /**
   * Initializes an instance of the AuthInfo class.
   */
  public async init(): Promise<void> {
    // Must specify either username and/or options
    const options =
      this.options.oauth2Options || this.options.accessTokenOptions;
    if (
      !this.options.username &&
      !(this.options.oauth2Options || this.options.accessTokenOptions)
    ) {
      throw SfdxError.create(
        '@salesforce/core',
        'core',
        'AuthInfoCreationError'
      );
    }

    this.fields.username =
      this.options.username || getString(options, 'username') || undefined;

    // If the username is an access token, use that for auth and don't persist
    const accessTokenMatch =
      isString(this.fields.username) &&
      this.fields.username.match(/^(00D\w{12,15})![\.\w]*$/);
    if (accessTokenMatch) {
      // Need to initAuthOptions the logger and authInfoCrypto since we don't call init()
      this.logger = await Logger.child('AuthInfo');
      this.authInfoCrypto = await AuthInfoCrypto.create({
        noResetOnClose: true
      });

      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      const instanceUrl: string =
        (aggregator.getPropertyValue('instanceUrl') as string) ||
        SFDC_URLS.production;

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
   * Initialize this AuthInfo instance with the specified options. If options are not provided
   * initialize from cache or by reading from persistence store.
   * @param {OAuth2Options} [options] Options to be used for creating an OAuth2 instance.
   * @throws {SfdxError}
   *    **`{name: 'NamedOrgNotFound'}`:** Org information does not exist.
   * @returns {Promise<AuthInfo>} For convenience `this` object is returned.
   */
  private async initAuthOptions(
    options?: OAuth2Options | AccessTokenOptions
  ): Promise<AuthInfo> {
    this.logger = await Logger.child('AuthInfo');
    this.authInfoCrypto = await AuthInfoCrypto.create();

    // If options were passed, use those before checking cache and reading an auth file.
    let authConfig: AuthFields;

    if (options) {
      options = cloneJson(options);

      if (this.isTokenOptions(options)) {
        authConfig = options;
      } else {
        // jwt flow
        // Support both sfdx and jsforce private key values
        if (!options.privateKey && options.privateKeyFile) {
          options.privateKey = options.privateKeyFile;
        }
        if (options.privateKey) {
          authConfig = await this.buildJwtConfig(options);
        } else if (!options.authCode && options.refreshToken) {
          // refresh token flow (from sfdxUrl or OAuth refreshFn)
          authConfig = await this.buildRefreshTokenConfig(options);
        } else {
          // authcode exchange / web auth flow
          authConfig = await this.buildWebAuthConfig(options);
        }
      }

      // Update the auth fields WITH encryption
      this.update(authConfig);
    } else {
      const username = ensure(this.getUsername());
      if (AuthInfo.cache.has(username)) {
        authConfig = ensure(AuthInfo.cache.get(username));
      } else {
        // Fetch from the persisted auth file
        try {
          const config: AuthInfoConfig = await AuthInfoConfig.create(
            AuthInfoConfig.getOptions(username)
          );
          await config.read(true);
          authConfig = config.toObject();
        } catch (e) {
          if (e.code === 'ENOENT') {
            throw SfdxError.create(
              '@salesforce/core',
              'core',
              'NamedOrgNotFound',
              [username]
            );
          } else {
            throw e;
          }
        }
      }
      // Update the auth fields WITHOUT encryption (already encrypted)
      this.update(authConfig, false);
    }

    // Cache the fields by username (fields are encrypted)
    AuthInfo.cache.set(ensure(this.getUsername()), this.fields);

    return this;
  }

  private isTokenOptions(
    options: OAuth2Options | AccessTokenOptions
  ): options is AccessTokenOptions {
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
    callback: (
      err: Nullable<Error>,
      accessToken?: string,
      res?: object
    ) => Promise<void>
  ): Promise<void> {
    this.logger.info('Access token has expired. Updating...');

    try {
      const fields = this.authInfoCrypto.decryptFields(this.fields);
      await this.initAuthOptions(fields);
      await this.save();
      return await callback(null, fields.accessToken);
    } catch (err) {
      if (err.message && err.message.includes('Data Not Available')) {
        const errConfig = new SfdxErrorConfig(
          '@salesforce/core',
          'core',
          'OrgDataNotAvailableError',
          [this.getUsername()]
        );
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
    const privateKeyContents = await fs.readFile(
      ensure(options.privateKey),
      'utf8'
    );
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
      throw SfdxError.create('@salesforce/core', 'core', 'JWTAuthError', [
        err.message
      ]);
    }

    const authFields: AuthFields = {
      accessToken: asString(_authFields.access_token),
      orgId: _parseIdUrl(ensureString(_authFields.id)).orgId,
      loginUrl: options.loginUrl,
      privateKey: options.privateKey
    };

    const instanceUrl = ensureString(_authFields.instance_url);
    const parsedUrl = urlParse(instanceUrl);
    try {
      // Check if the url is resolvable. This can fail when my-domains have not been replicated.
      await this.lookup(ensure(parsedUrl.hostname));
      authFields.instanceUrl = instanceUrl;
    } catch (err) {
      this.logger.debug(
        `Instance URL [${
          _authFields.instance_url
        }] is not available.  DNS lookup failed. Using loginUrl [${
          options.loginUrl
        }] instead. This may result in a "Destination URL not reset" error.`
      );
      authFields.instanceUrl = options.loginUrl;
    }

    return authFields;
  }

  // Build OAuth config for a refresh token auth flow
  private async buildRefreshTokenConfig(
    options: OAuth2Options
  ): Promise<AuthFields> {
    if (!options.clientId) {
      Object.assign(options, DEFAULT_CONNECTED_APP_INFO);
    }

    const oauth2 = new OAuth2(options);
    let _authFields: TokenResponse;
    try {
      _authFields = await oauth2.refreshToken(ensure(options.refreshToken));
    } catch (err) {
      throw SfdxError.create(
        '@salesforce/core',
        'core',
        'RefreshTokenAuthError',
        [err.message]
      );
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

  // build an OAuth config given an auth code.
  private async buildWebAuthConfig(
    options: OAuth2Options
  ): Promise<AuthFields> {
    const oauth2 = new AuthCodeOAuth2(options);

    // Exchange the auth code for an access token and refresh token.
    let _authFields;
    try {
      this.logger.info(
        `Exchanging auth code for access token using loginUrl: ${
          options.loginUrl
        }`
      );
      _authFields = await oauth2.requestToken(ensure(options.authCode));
    } catch (err) {
      throw SfdxError.create(
        '@salesforce/core',
        'core',
        'AuthCodeExchangeError',
        [err.message]
      );
    }

    // @ts-ignore TODO: need better typings for jsforce
    const { userId, orgId } = _parseIdUrl(_authFields.id);

    // Make a REST call for the username directly.  Normally this is done via a connection
    // but we don't want to create circular dependencies or lots of snowflakes
    // within this file to support it.
    const apiVersion = 'v42.0'; // hardcoding to v42.0 just for this call is okay.
    // @ts-ignore TODO: need better typings
    const url = `${
      _authFields.instance_url
    }/services/data/${apiVersion}/sobjects/User/${userId}`;
    const headers = Object.assign(
      { Authorization: `Bearer ${_authFields.access_token}` },
      SFDX_HTTP_HEADERS
    );

    let username: Optional<string>;
    try {
      this.logger.info(
        `Sending request for Username after successful auth code exchange to URL: ${url}`
      );
      const response = await new Transport().httpRequest({ url, headers });
      username = asString(parseJsonMap(response.body).Username);
    } catch (err) {
      throw SfdxError.create(
        '@salesforce/core',
        'core',
        'AuthCodeUsernameRetrievalError',
        [orgId, err.message]
      );
    }

    return {
      accessToken: _authFields.access_token,
      // @ts-ignore TODO: need better typings for jsforce
      instanceUrl: _authFields.instance_url,
      orgId,
      username,
      // @ts-ignore TODO: need better typings for jsforce
      loginUrl: options.loginUrl || _authFields.instance_url,
      refreshToken: _authFields.refresh_token
    };
  }

  // See https://nodejs.org/api/dns.html#dns_dns_lookup_hostname_options_callback
  private async lookup(
    host: string
  ): Promise<{ address: string; family: number }> {
    return new Promise<{ address: string; family: number }>(
      (resolve, reject) => {
        dns.lookup(host, (err, address: string, family: number) => {
          if (err) {
            reject(err);
          } else {
            resolve({ address, family });
          }
        });
      }
    );
  }
}
