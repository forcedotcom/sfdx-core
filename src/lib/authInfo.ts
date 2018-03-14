/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { parse as urlParse } from 'url';
import * as dns from 'dns';
import { randomBytes, createHash } from 'crypto';
import * as _ from 'lodash';
import { OAuth2, OAuth2Options } from 'jsforce';
import * as Transport from 'jsforce/lib/transport';
import * as jwt from 'jsonwebtoken';
import { AuthInfoConfig } from './config/authInfoConfig';
import { ConfigFile } from './config/configFile';
import { Global } from './global';
import { SfdxError, SfdxErrorConfig } from './sfdxError';
import { Logger } from './logger';
import { SfdxUtil } from './util';
import { SFDX_HTTP_HEADERS } from './connection';
import { Crypto } from './crypto';

// Fields that are persisted in auth files
export interface AuthFields {
    accessToken: string;
    alias: string;
    authCode: string;
    clientId: string;
    clientSecret: string;
    created: string;
    createdOrgInstance: string;
    devHubUsername: string;
    instanceUrl: string;
    isDevHub: boolean;
    loginUrl: string;
    orgId: string;
    password: string;
    privateKey: string;
    refreshToken: string;
    scratchAdminUsername: string;
    userId: string;
    username: string;
    usernames: string[];
    userProfileName: string;
}

// Extend OAuth2 to add JWT Bearer Token Flow support.
class JwtOAuth2 extends OAuth2 {
    constructor(options: OAuth2Options) {
        super(options);
    }

    public async jwtAuthorize(innerToken: string, callback?): Promise<any> {
        return super._postParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: innerToken
        }, callback);
    }
}

// Extend OAuth2 to add code verifier support for the auth code (web auth) flow
class AuthCodeOAuth2 extends OAuth2 {

    private codeVerifier: string;

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
    public getAuthorizationUrl(params) {
        // code verifier must be a base 64 url encoded hash of 128 bytes of random data. Our random data is also
        // base 64 url encoded. See Connection.create();
        const codeChallenge = base64UrlEscape(createHash('sha256').update(this.codeVerifier).digest('base64'));
        _.set(params, 'code_challenge', codeChallenge);

        return super.getAuthorizationUrl(params);
    }

    public async requestToken(code: string, callback?) {
        return super.requestToken(code, callback);
    }

    /**
     * Overrides jsforce.OAuth2._postParams because jsforce's oauth impl doesn't support
     * coder_verifier and code_challenge. This enables the server to disallow trading a one-time auth code
     * for an access/refresh token when the verifier and challenge are out of alignment.
     *
     * See - https://github.com/jsforce/jsforce/issues/665
     */
    // tslint:disable-next-line:no-unused-variable
    private async _postParams(params, callback) {
        _.set(params, 'code_verifier', this.codeVerifier);
        return super._postParams(params, callback);
    }
}

export enum SFDC_URLS {
    sandbox = 'https://test.salesforce.com',
    production = 'https://login.salesforce.com'
}

const INTERNAL_URL_PARTS = ['.internal.', '.vpod.', 'stm.salesforce.com', '.blitz.salesforce.com', 'mobile1.t.salesforce.com'];

function isInternalUrl(loginUrl: string = ''): boolean {
    return loginUrl.startsWith('https://gs1.') || _.some(INTERNAL_URL_PARTS, (part) => loginUrl.includes(part));
}

function getJwtAudienceUrl(options) {
    // default audience must be...
    let audienceUrl: string = SFDC_URLS.production;
    const loginUrl = _.get(options, 'loginUrl', '');
    const createdOrgInstance = _.get(options, 'createdOrgInstance', '').trim().toLowerCase();

    if (process.env.SFDX_AUDIENCE_URL) {
        audienceUrl = process.env.SFDX_AUDIENCE_URL;
    } else if (isInternalUrl(loginUrl)) {
        // This is for internal developers when just doing authorize;
        audienceUrl = loginUrl;
    } else if (createdOrgInstance.startsWith('cs') || urlParse(loginUrl).hostname === 'test.salesforce.com') {
        audienceUrl = SFDC_URLS.sandbox;
    } else if (createdOrgInstance.startsWith('gs1')) {
        audienceUrl = 'https://gs1.salesforce.com';
    }

    return audienceUrl;
}

// parses the id field returned from jsForce oauth2 methods to get
// user ID and org ID.
function _parseIdUrl(idUrl) {
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

let authInfoCrypto: AuthInfoCrypto;

class AuthInfoCrypto extends Crypto {
    public static async create(): Promise<AuthInfoCrypto> {
        return await new AuthInfoCrypto().init() as AuthInfoCrypto;
    }

    private static readonly encryptedFields = ['accessToken', 'refreshToken', 'password', 'clientSecret'];

    public decryptFields(fields: Partial<AuthFields>) {
        return this._crypt(fields, 'decrypt');
    }

    public encryptFields(fields: Partial<AuthFields>) {
        return this._crypt(fields, 'encrypt');
    }

    private _crypt(fields: Partial<AuthFields>, method: string): Partial<AuthFields> {
        return _.mapValues(fields, (val, key) => AuthInfoCrypto.encryptedFields.includes(key) ? this[method](val) : val);
    }
}

// Makes a nodejs base64 encoded string compatible with rfc4648 alternative encoding for urls.
// @param base64Encoded a nodejs base64 encoded string
function base64UrlEscape(base64Encoded: string): string {
    // builtin node js base 64 encoding is not 64 url compatible.
    // See - https://toolsn.ietf.org/html/rfc4648#section-5
    return _.replace(base64Encoded, /\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Handles persistence and fetching of user authentication information.
 */
export class AuthInfo {

    /**
     * Returns an instance of AuthInfo for the provided username and/or options.
     *
     * @param username The username for the authentication info.
     * @param options Options to be used for creating an OAuth2 instance.
     */
    public static async create(username?: string, options?: OAuth2Options, isUsingAccessToken?: boolean): Promise<AuthInfo> {

        // Must specify either username and/or options
        if (!username && !options) {
            throw SfdxError.create('sfdx-core', 'core', 'AuthInfoCreationError');
        }

        const authInfo = new AuthInfo(username);

        authInfo.setIsUsingAccessToken(isUsingAccessToken);

        // If the username is an access token, use that for auth and don't persist
        const accessTokenMatch = _.isString(username) && username.match(/^(00D\w{12,15})![\.\w]*$/);
        if (accessTokenMatch) {
            // Need to setup the logger and authInfoCrypto since we don't call init()
            authInfo.logger = await Logger.child('AuthInfo');
            authInfoCrypto = await AuthInfoCrypto.create();

            // TODO: remove hardcoding when sfdx-core config class is ready
            const instanceUrl = 'http://mydevhub.localhost.internal.salesforce.com:6109';
            // If it is an env var, use it instead of the local workspace sfdcLoginUrl property,
            // otherwise try to use the local sfdx-project property instead.
            // if (sfdxConfig.getInfo('instanceUrl').isEnvVar()) {
            //     instanceUrl = sfdxConfig.get('instanceUrl');
            // } else {
            //     instanceUrl = sfdxConfig.get('instanceUrl') || urls.production;
            // }

            authInfo.update({
                accessToken: username,
                instanceUrl,
                orgId: accessTokenMatch[1]
            });
        } else {
            await authInfo.init(options);
        }

        return authInfo;
    }

    /**
     * Returns a list of all auth files stored in the global directory
     */
    public static async listAllAuthFiles(): Promise<string[]> {
        const globalFiles = await SfdxUtil.readdir(Global.DIR);
        const authFiles = globalFiles.filter((file) => file.match(AuthInfo.authFilenameFilterRegEx));

        // Want to throw a clean error if no files are found.
        if (_.isEmpty(authFiles)) {
            const errConfig: SfdxErrorConfig =
                new SfdxErrorConfig('sfdx-core', 'core', 'noAuthInfoFound');
            throw SfdxError.create(errConfig);
        }

        // At least one auth file is in the global dir.
        return authFiles;
    }

    /**
     * Returns true if this sfdx instance already has 1 or more authentications.
     * @returns {Promise<boolean>}
     */
    public static async hasAuthentications(): Promise<boolean> {
        try {
            const authFiles: string[] = await this.listAllAuthFiles();
            return !_.isEmpty(authFiles);
        } catch (err) {
            if (err.name === 'OrgDataNotAvailableError' || err.code === 'ENOENT') {
                return false;
            }
            throw err;
        }
    }

    // The regular expression that filters files stored in $HOME/.sfdx
    private static authFilenameFilterRegEx: RegExp = /^[^.][^@]*@[^.]+(\.[^.\s]+)+\.json$/;

    // Cache of auth fields by username.
    private static cache: Map<string, Partial<AuthFields>> = new Map();

    // All sensitive fields are encrypted
    private fields: Partial<AuthFields> = {};

    private usingAccessToken: boolean;

    private logger: Logger;

    constructor(username: string) {
        this.fields.username = username;
    }

    /**
     * Initialize an AuthInfo instance with a logger and the auth fields; either from
     * cache or by reading from persistence store.
     */
    public async init(options?: OAuth2Options): Promise<AuthInfo> {
        this.logger = await Logger.child('AuthInfo');
        authInfoCrypto = await AuthInfoCrypto.create();

        // If options were passed, use those before checking cache and reading an auth file.
        let authConfig: OAuth2Options;
        if (options) {
            // jwt flow
            if (options.privateKey) {
                authConfig = await this.buildJwtConfig(options);
            } else if (!options.authCode && options.refreshToken) {
                // refresh token flow (from sfdxUrl or OAuth refreshFn)
                authConfig = await this.buildRefreshTokenConfig(options);
            } else {
                // authcode exchange / web auth flow
                authConfig = await this.buildWebAuthConfig(options);
            }

            // Update the auth fields WITH encryption
            this.update(authConfig);
        } else {
            if (AuthInfo.cache.has(this.username)) {
                authConfig = AuthInfo.cache.get(this.username);
            } else {
                // Fetch from the persisted auth file
                try {
                    const config: AuthInfoConfig =
                        await AuthInfoConfig.create(AuthInfoConfig.getOptions(this.username));
                    await config.read();
                    authConfig = config.toObject();
                } catch (e) {
                    if (e.code === 'ENOENT') {
                        throw SfdxError.create('sfdx-core', 'core', 'namedOrgNotFound', [this.username]);
                    } else {
                        throw e;
                    }
                }
            }
            // Update the auth fields WITHOUT encryption (already encrypted)
            this.update(authConfig, false);
        }

        // Cache the fields by username (fields are encrypted)
        AuthInfo.cache.set(this.username, this.fields);

        return this;
    }

    get username(): string {
        return this.fields.username;
    }

    public isJwt(): boolean {
        const { refreshToken, privateKey } = this.fields;
        return !refreshToken && !!privateKey;
    }

    public isAccessTokenFlow(): boolean {
        const { refreshToken, privateKey } = this.fields;
        return !refreshToken && !privateKey;
    }

    public isOauth(): boolean {
        return !this.isAccessTokenFlow() && !this.isJwt();
    }

    public isRefreshTokenFlow(): boolean {
        const { refreshToken, authCode } = this.fields;
        return !authCode && !!refreshToken;
    }

    /**
     * Updates the cache and persists the authentication fields (encrypted).
     */
    public async save(authData?: Partial<AuthFields>): Promise<AuthInfo> {
        this.update(authData);
        AuthInfo.cache.set(this.username, this.fields);

        const dataToSave = _.clone(this.fields);

        // Do not persist the default client ID and secret
        if (dataToSave.clientId === DEFAULT_CONNECTED_APP_INFO.clientId) {
            delete dataToSave.clientId;
            delete dataToSave.clientSecret;
        }

        const config: ConfigFile = await AuthInfoConfig.create(AuthInfoConfig.getOptions(this.username));
        config.setContentsFromObject(dataToSave);
        await config.write();

        this.logger.info(`Saved auth info for username: ${this.username}`);
        return this;
    }

    /**
     * Update the authorization fields, encrypting sensitive fields, but do not persist.
     *
     * @param authData Authorization fields to update.
     */
    public update(authData: Partial<AuthFields>, encrypt: boolean = true): AuthInfo {
        if (_.isPlainObject(authData)) {
            if (encrypt) {
                authData = authInfoCrypto.encryptFields(authData);
            }
            Object.assign(this.fields, authData);
            this.logger.info(`Updated auth info for username: ${this.username}`);
        }
        return this;
    }

    /**
     * Return only the auth fields (decrypted) needed to make a connection.
     *
     * @returns Partial<AuthFields> AuthFields used in making jsForce connections.
     */
    public getConnectionOptions(): Partial<AuthFields> {
        let json;

        const { accessToken, instanceUrl } = this.fields;

        if (this.isAccessTokenFlow()) {
            this.logger.info('Returning fields for a connection using access token.');

            // Just auth with the accessToken
            json = { accessToken, instanceUrl };
        } else if (this.isJwt()) {
            this.logger.info('Returning fields for a connection using JWT config.');
            json = {
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
            const clientSecret = this.fields.clientSecret ? authInfoCrypto.decrypt(this.fields.clientSecret) : DEFAULT_CONNECTED_APP_INFO.clientSecret;
            json = {
                oauth2: {
                    loginUrl: instanceUrl || 'https://login.salesforce.com',
                    clientId: this.fields.clientId || DEFAULT_CONNECTED_APP_INFO.clientId,
                    clientSecret,
                    redirectUri: 'http://localhost:1717/OauthRedirect'
                },
                accessToken,
                instanceUrl,
                refreshFn: this.refreshFn.bind(this)
            };
        }

        // decrypt the fields
        return authInfoCrypto.decryptFields(json);
    }

    public getAuthorizationUrl(options: OAuth2Options): string {
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

    public getFields(): Partial<AuthFields> {
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
     * Sets an indicator if this org is using access token authentication.
     * @param {boolean} value Return true if this org should us access token authentication. False otherwise.
     * @returns {Org} For convenience this object is returned.
     */
    protected setIsUsingAccessToken(isUsingAccessToken: boolean): AuthInfo {
        this.usingAccessToken = isUsingAccessToken;
        return this;
    }

    // A callback function for a connection to refresh an access token.  This is used
    // both for a JWT connection and an OAuth connection.
    private async refreshFn(conn, callback: (err, accessToken?, res?) => void): Promise<any> {
        this.logger.info('Access token has expired. Updating...');

        try {
            await this.init(authInfoCrypto.decryptFields(this.fields));
            await this.save();
            return await callback(null, authInfoCrypto.decrypt(this.fields.accessToken));
        } catch (err) {
            if (err.message && err.message.includes('Data Not Available')) {
                const errConfig: SfdxErrorConfig = new SfdxErrorConfig('sfdx-core', 'core', 'OrgDataNotAvailableError', [this.username]);
                for (let i = 1; i < 5; i++) {
                    errConfig.addAction(`OrgDataNotAvailableErrorAction${i}`);
                }
                return callback(SfdxError.create(errConfig));
            }
            return callback(err);
        }
    }

    // Build OAuth config for a JWT auth flow
    private async buildJwtConfig(options: OAuth2Options): Promise<any> {
        const privateKeyContents = await SfdxUtil.readFile(options.privateKey, 'utf8');
        const audienceUrl = getJwtAudienceUrl(options);
        const jwtToken = await jwt.sign(
            {
                iss: options.clientId,
                sub: this.username,
                aud: audienceUrl,
                exp: Date.now() + 300
            },
            privateKeyContents,
            {
                algorithm: 'RS256'
            }
        );

        const oauth2 = new JwtOAuth2({ loginUrl : options.loginUrl });
        let _authFields;
        try {
            _authFields = await oauth2.jwtAuthorize(jwtToken);
        } catch (err) {
            throw SfdxError.create('sfdx-core', 'core', 'JWTAuthError', [err.message]);
        }

        const authFields: Partial<AuthFields> = {
            accessToken: _authFields.access_token,
            orgId: _parseIdUrl(_authFields.id).orgId,
            loginUrl: options.loginUrl,
            privateKey: options.privateKey
        };
        try {
            await dns.lookup(urlParse(_authFields.instance_url).hostname, null);
            authFields.instanceUrl = _authFields.instance_url;
        } catch (err) {
            this.logger.info(`Instance URL [${_authFields.instance_url}] is not available.  DNS lookup failed.`);
            authFields.instanceUrl = options.loginUrl;
        }

        return authFields;
    }

    // Build OAuth config for a refresh token auth flow
    private async buildRefreshTokenConfig(options: OAuth2Options): Promise<any> {
        if (!options.clientId) {
            Object.assign(options, DEFAULT_CONNECTED_APP_INFO);
        }

        const oauth2 = new OAuth2(options);
        let _authFields;
        try {
            _authFields = await oauth2.refreshToken(options.refreshToken);
        } catch (err) {
            throw SfdxError.create('sfdx-core', 'core', 'RefreshTokenAuthError', [err.message]);
        }

        return {
            accessToken: _authFields.access_token,
            instanceUrl: _authFields.instance_url,
            orgId: _parseIdUrl(_authFields.id).orgId,
            loginUrl: options.loginUrl || _authFields.instance_url,
            refreshToken: options.refreshToken,
            clientId: options.clientId,
            clientSecret: options.clientSecret
        };
    }

    // build an OAuth config given an auth code.
    private async buildWebAuthConfig(options: OAuth2Options): Promise<any> {
        const oauth2 = new AuthCodeOAuth2(options);

        // Exchange the auth code for an access token and refresh token.
        let _authFields;
        try {
            this.logger.info(`Exchanging auth code for access token using loginUrl: ${options.loginUrl}`);
            _authFields = await oauth2.requestToken(options.authCode);
        } catch (err) {
            throw SfdxError.create('sfdx-core', 'core', 'AuthCodeExchangeError', [err.message]);
        }

        const { userId, orgId } = _parseIdUrl(_authFields.id);

        // Make a REST call for the username directly.  Normally this is done via a connection
        // but we don't want to create circular dependencies or lots of snowflakes
        // within this file to support it.
        const apiVersion = 'v42.0';  // !!! TODO: GET THIS FROM CONFIG.JS !!!
        const url = `${_authFields.instance_url}/services/data/${apiVersion}/sobjects/User/${userId}`;
        const headers = Object.assign({ Authorization: `Bearer ${_authFields.access_token}` }, SFDX_HTTP_HEADERS);

        let username;
        try {
            this.logger.info(`Sending request for Username after successful auth code exchange to URL: ${url}`);
            const response = await new Transport().httpRequest({ url, headers });
            username = _.get(JSON.parse(response.body), 'Username');
        } catch (err) {
            throw SfdxError.create('sfdx-core', 'core', 'AuthCodeUsernameRetrievalError', [orgId, err.message]);
        }

        return {
            accessToken: _authFields.access_token,
            instanceUrl: _authFields.instance_url,
            orgId,
            username,
            loginUrl: options.loginUrl || _authFields.instance_url,
            refreshToken: _authFields.refresh_token
        };
    }
}
