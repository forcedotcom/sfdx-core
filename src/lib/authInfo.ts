/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { parse as urlParse } from 'url';
import { lookup } from 'dns';
import { promisify } from 'util';
import * as _ from 'lodash';
import { OAuth2, OAuth2Options } from 'jsforce';
import * as jwt from 'jsonwebtoken';
import { Global } from './global';
import { SfdxError, SfdxErrorConfig } from './sfdxError';
import { Logger } from './logger';
import { SfdxUtil } from './util';

const lookupAsync = promisify(lookup);

// Fields that are persisted in auth files
export interface AuthFields {
    accessToken: string;
    authCode: string;
    alias: string;
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
    privateKeyFile: string;
    refreshToken: string;
    scratchAdminUsername: string;
    userId: string;
    username: string;
    userProfileName: string;
}

// Extend OAuth2 to add JWT Bearer Token Flow support.
class JwtOAuth2 extends OAuth2 {
    constructor(options: OAuth2Options) {
        super(options);
    }

    public async jwtAuthorize(innerToken, callback?): Promise<any> {
        return super._postParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: innerToken
        }, callback);
    }
}

export enum SFDC_URLS {
    sandbox = 'https://test.salesforce.com',
    production = 'https://login.salesforce.com'
}

const INTERNAL_URL_PARTS = ['.internal.', '.vpod.', 'stm.salesforce.com', '.blitz.salesforce.com'];

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

function _parseIdUrl(idUrl) {
    const idUrls = idUrl.split('/');
    const userId = idUrls.pop();
    const orgId = idUrls.pop();

    return {
        id: userId,
        organizationId: orgId,
        url: idUrl
    };
}

const DEFAULT_CONNECTED_APP_INFO = {
    clientId: 'SalesforceDevelopmentExperience',
    clientSecret: '1384510088588713504'
};

/**
 * Handles persistence and fetching of user authentication information.
 */
export class AuthInfo {

    /**
     * Returns an instance of AuthInfo for the provided username.
     *
     * @param username The username for the authentication info.
     */
    public static async create(username: string, options?: OAuth2Options): Promise<AuthInfo> {
        const authInfo = new AuthInfo(username);

        // If the username is an access token, use that for auth and don't persist
        const accessTokenMatch = _.isString(username) && username.match(/^(00D\w{12,15})![\.\w]*$/);
        if (accessTokenMatch) {
            // TODO: remove hardcoding when sfdx-core config class is ready
            const instanceUrl = 'http://mydevhub.localhost.internal.salesforce.com:6109';
            // If it is an env var, use it instead of the local workspace sfdcLoginUrl property,
            // otherwise try to use the local sfdx-project property instead.
            // if (sfdxConfig.getInfo('instanceUrl').isEnvVar()) {
            //     instanceUrl = sfdxConfig.get('instanceUrl');
            // } else {
            //     instanceUrl = sfdxConfig.get('instanceUrl') || urls.production;
            // }

            authInfo.fields = {
                accessToken: username,
                instanceUrl,
                orgId: accessTokenMatch[1]
            };
        } else {
            await authInfo.init(options);
        }

        return authInfo;
    }

    // Cache of auth fields by username.
    private static cache: Map<string, Partial<AuthFields>> = new Map();

    private readonly _authFileName: string;
    private logger: Logger;
    private fields: Partial<AuthFields> = {};

    constructor(username: string) {
        this.fields.username = username;
        this._authFileName = `${username}.json`;
    }

    /**
     * Initialize an AuthInfo instance with a logger and the auth fields; either from
     * cache or by reading from persistence store.
     */
    public async init(options?: OAuth2Options): Promise<AuthInfo> {
        this.logger = await Logger.child('AuthInfo');

        // If options were passed, use those before checking cache and reading an auth file.
        let authConfig: OAuth2Options;
        if (options) {
            // jwt flow
            if (options.privateKeyFile) {
                authConfig = await this.buildJwtConfig(options);
            } else if (!options.authCode && options.refreshToken) {
                // refresh token flow
                authConfig = await this.buildRefreshTokenConfig(options);
            } else {
                // authcode exchange / web auth flow
                authConfig = await this.buildWebAuthConfig(options);
            }
        } else {
            if (AuthInfo.cache.has(this.username)) {
                // Set the auth fields and return this immediately so as not to re-cache
                this.update(AuthInfo.cache.get(this.username));
                return this;
            } else {
                // Fetch from the persisted auth file
                authConfig = await Global.fetchConfigInfo(this.authFileName);

                // Decrypt access token and refresh token here
            }
        }

        // Update the auth fields
        this.update(authConfig);

        // Cache the fields by username
        AuthInfo.cache.set(this.username, this.fields);

        return this;
    }

    get authFileName() {
        return this._authFileName;
    }

    get username() {
        return this.fields.username;
    }

    get authCode() {
        return this.fields.authCode;
    }

    public isJwt(): boolean {
        const { refreshToken, privateKey, privateKeyFile } = this.fields;
        return !refreshToken && !!(privateKey || privateKeyFile);
    }

    public isAccessTokenFlow(): boolean {
        const { refreshToken, privateKey } = this.fields;
        return !refreshToken && !privateKey;
    }

    public isOauth(): boolean {
        return !this.isAccessTokenFlow() && !this.isJwt();
    }

    public isRefreshTokenFlow() {
        const { refreshToken, authCode } = this.fields;
        return !authCode && !!refreshToken;
    }

    /**
     * Updates the cache and persists the authentication fields.
     */
    public async save(authData?: Partial<AuthFields>): Promise<any> {
        this.update(authData);
        AuthInfo.cache.set(this.username, this.fields);

        // Encrypt access token and refresh token here

        console.log('Saving authdata=', this.fields);

        await Global.saveConfigInfo(this.authFileName, this.fields);
        this.logger.info(`Saved auth info for username: ${this.username}`);
    }

    /**
     * Update the authorization fields but do not persist.
     *
     * @param authData Authorization fields to update.
     */
    public update(authData: Partial<AuthFields>) {
        if (_.isPlainObject(authData)) {
            Object.assign(this.fields, authData);
            this.logger.info(`Updated auth info for username: ${this.username}`);
        }
    }

    /**
     * A callback function for a JWT connection to refresh the access token.
     *
     * @param conn The jsForce connection
     * @param callback The callback function to execute after access token refresh.
     */
    public async jwtRefresh(conn, callback: (err, accessToken?, res?) => void): Promise<any> {
        this.logger.info('JWT access token has expired. Updating...');

        // @TODO: figure out loginUrl (probably get from config class)
        // loginUrl: this.fields.loginUrl || org.config.getAppConfigIfInWorkspace().sfdcLoginUrl,
        const options: OAuth2Options = {
            loginUrl: this.fields.loginUrl,
            clientId: this.fields.clientId,
            privateKeyFile: this.fields.privateKey
        };
        await this.init(options);
        await this.save();
        try {
            return await callback(null, this.fields.accessToken);
        } catch (err) {
            if (err.message && err.message.includes('Data Not Available')) {
                const errConfig: SfdxErrorConfig = new SfdxErrorConfig('sfdx-core', 'OrgDataNotAvailableError', [this.username]);
                for (let i = 1; i < 5; i++) {
                    errConfig.addAction(`OrgDataNotAvailableErrorAction${i}`);
                }
                return callback(SfdxError.create(errConfig));
            }
            return callback(err);
        }
    }

    /**
     * A function for the connection refresh handler that will refresh the access token
     * for an OAuth connection.
     * NOTE: Should be bound to an AuthInfo instance when defined as an on('refresh')
     *       handler for the connection.
     * @example
     *   const authInfo = AuthInfo.create(myUsername);
     *   const connection = Connection.create(authInfo);
     *   connection.on('refresh', authInfo.oauthRefresh.bind(authInfo));
     *
     * @param accessToken the access token passed by the jsForce connection refresh event.
     */
    public async oauthRefresh(accessToken: string): Promise<any> {
        this.logger.info('OAuth access token has expired. Updating...');
        await this.save({ accessToken });
        return this;
    }

    /**
     * Return only the auth fields needed to make a connection.
     */
    public toJSON() {
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
                refreshFn: this.jwtRefresh.bind(this)
            };
        } else {
            // @TODO: figure out loginUrl and redirectUri (probably get from config class)
            //
            // redirectUri: org.config.getOauthCallbackUrl()
            // loginUrl: this.fields.instanceUrl || this.config.getAppConfig().sfdcLoginUrl
            this.logger.info('Returning fields for a connection using OAuth config.');
            json = {
                oauth2: {
                    loginUrl: instanceUrl || 'https://login.salesforce.com',
                    clientId: this.fields.clientId || DEFAULT_CONNECTED_APP_INFO.clientId,
                    clientSecret: this.fields.clientSecret || DEFAULT_CONNECTED_APP_INFO.clientSecret,
                    redirectUri: 'http://localhost:1717/OauthRedirect'
                },
                accessToken,
                instanceUrl,
                refreshToken: this.fields.refreshToken
            };
        }
        return json;
    }

    // Build OAuth config for a JWT auth flow
    private async buildJwtConfig(options: OAuth2Options): Promise<any> {
        const privateKey = await SfdxUtil.readFile(options.privateKeyFile, 'utf8');
        const audienceUrl = getJwtAudienceUrl(options);
        const jwtToken = await jwt.sign(
            {
                iss: options.clientId,
                sub: this.username,
                aud: audienceUrl,
                exp: Date.now() + 300
            },
            privateKey,
            {
                algorithm: 'RS256'
            }
        );

        const oauth2 = new JwtOAuth2({ loginUrl : options.loginUrl });
        const _authFields = await oauth2.jwtAuthorize(jwtToken);

        const authFields: Partial<AuthFields> = {
            accessToken: _authFields.access_token,
            orgId: _parseIdUrl(_authFields.id).organizationId,
            loginUrl: options.loginUrl
        };
        try {
            await lookupAsync(urlParse(_authFields.instance_url).hostname);
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
        const _authFields = await oauth2.refreshToken(options.refreshToken);

        return {
            accessToken: _authFields.access_token,
            instanceUrl: _authFields.instance_url,
            orgId: _parseIdUrl(_authFields.id).organizationId,
            loginUrl: options.loginUrl || _authFields.instance_url,
            refreshToken: options.refreshToken
        };
    }

    private async buildWebAuthConfig(options: OAuth2Options): Promise<any> {
    }
}

export default AuthInfo;
