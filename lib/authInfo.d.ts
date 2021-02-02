import { AsyncCreatable } from '@salesforce/kit';
import { AnyFunction, Nullable, Optional } from '@salesforce/ts-types';
import { OAuth2, OAuth2Options, TokenResponse } from 'jsforce';
import { Connection } from './connection';
/**
 * Fields for authorization, org, and local information.
 */
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
export declare type RefreshFn = (
  conn: Connection,
  callback: (err: Nullable<Error>, accessToken?: string, res?: object) => Promise<void>
) => Promise<void>;
/**
 * Options for {@link Connection}.
 */
export declare type ConnectionOptions = AuthFields & {
  /**
   * OAuth options.
   */
  oauth2?: Partial<OAuth2Options>;
  /**
   * Refresh token callback.
   */
  refreshFn?: RefreshFn;
};
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
export declare class OAuth2WithVerifier extends OAuth2 {
  readonly codeVerifier: string;
  constructor(options: OAuth2Options);
  /**
   * Overrides jsforce.OAuth2.getAuthorizationUrl.  Get Salesforce OAuth2 authorization page
   * URL to redirect user agent, adding a verification code for added security.
   *
   * @param params
   */
  getAuthorizationUrl(params: object): string;
  requestToken(code: string, callback?: (err: Error, tokenResponse: TokenResponse) => void): Promise<TokenResponse>;
  /**
   * Overrides jsforce.OAuth2._postParams because jsforce's oauth impl doesn't support
   * coder_verifier and code_challenge. This enables the server to disallow trading a one-time auth code
   * for an access/refresh token when the verifier and challenge are out of alignment.
   *
   * See https://github.com/jsforce/jsforce/issues/665
   */
  protected _postParams(params: object, callback: AnyFunction): Promise<any>;
}
/**
 * Salesforce URLs.
 */
export declare enum SfdcUrl {
  SANDBOX = 'https://test.salesforce.com',
  PRODUCTION = 'https://login.salesforce.com'
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
export declare class AuthInfo extends AsyncCreatable<AuthInfo.Options> {
  /**
   * Get a list of all auth files stored in the global directory.
   * @returns {Promise<string[]>}
   */
  static listAllAuthFiles(): Promise<string[]>;
  /**
   * Returns true if one or more authentications are persisted.
   */
  static hasAuthentications(): Promise<boolean>;
  /**
   * Get the authorization URL.
   * @param options The options to generate the URL.
   */
  static getAuthorizationUrl(options: OAuth2Options): string;
  /**
   * Forces the auth file to be re-read from disk for a given user. Returns `true` if a value was removed.
   * @param username The username for the auth info to re-read.
   */
  static clearCache(username: string): boolean;
  /**
   * Parse a sfdx auth url, usually obtained by `authInfo.getSfdxAuthUrl`.
   *
   * @example
   * ```
   * await AuthInfo.create(AuthInfo.parseSfdxAuthUrl(sfdxAuthUrl));
   * ```
   * @param sfdxAuthUrl
   */
  static parseSfdxAuthUrl(
    sfdxAuthUrl: string
  ): {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    loginUrl: string;
  };
  private static authFilenameFilterRegEx;
  private static cache;
  private fields;
  private usingAccessToken;
  private logger;
  private authInfoCrypto;
  private options;
  /**
   * Constructor
   * **Do not directly construct instances of this class -- use {@link AuthInfo.create} instead.**
   * @param options The options for the class instance
   */
  constructor(options: AuthInfo.Options);
  /**
   * Get the username.
   */
  getUsername(): Optional<string>;
  /**
   * Returns true if `this` is using the JWT flow.
   */
  isJwt(): boolean;
  /**
   * Returns true if `this` is using an access token flow.
   */
  isAccessTokenFlow(): boolean;
  /**
   * Returns true if `this` is using the oauth flow.
   */
  isOauth(): boolean;
  /**
   * Returns true if `this` is using the refresh token flow.
   */
  isRefreshTokenFlow(): boolean;
  /**
   * Updates the cache and persists the authentication fields (encrypted).
   * @param authData New data to save.
   */
  save(authData?: AuthFields): Promise<AuthInfo>;
  /**
   * Update the authorization fields, encrypting sensitive fields, but do not persist.
   * For convenience `this` object is returned.
   *
   * @param authData Authorization fields to update.
   * @param encrypt Encrypt the fields.
   */
  update(authData?: AuthFields, encrypt?: boolean): AuthInfo;
  /**
   * Get the auth fields (decrypted) needed to make a connection.
   */
  getConnectionOptions(): ConnectionOptions;
  /**
   * Get the authorization fields.
   */
  getFields(): AuthFields;
  /**
   * Returns true if this org is using access token auth.
   */
  isUsingAccessToken(): boolean;
  /**
   * Get the SFDX Auth URL.
   *
   * **See** [SFDX Authorization](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_auth.htm#cli_reference_force_auth)
   */
  getSfdxAuthUrl(): string;
  /**
   * Initializes an instance of the AuthInfo class.
   */
  init(): Promise<void>;
  /**
   * Initialize this AuthInfo instance with the specified options. If options are not provided, initialize it from cache
   * or by reading from the persistence store. For convenience `this` object is returned.
   * @param options Options to be used for creating an OAuth2 instance.
   *
   * **Throws** *{@link SfdxError}{ name: 'NamedOrgNotFound' }* Org information does not exist.
   * @returns {Promise<AuthInfo>}
   */
  private initAuthOptions;
  private loadAuthFromConfig;
  private isTokenOptions;
  private refreshFn;
  private buildJwtConfig;
  private buildRefreshTokenConfig;
  /**
   * Performs an authCode exchange but the Oauth2 feature of jsforce is extended to include a code_challenge
   * @param options The oauth options
   * @param oauth2 The oauth2 extension that includes a code_challenge
   */
  private exchangeToken;
  private lookup;
}
export declare namespace AuthInfo {
  /**
   * Constructor options for AuthInfo.
   */
  interface Options {
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
