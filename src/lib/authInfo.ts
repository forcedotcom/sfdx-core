/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import * as _ from 'lodash';
import { Global } from './global';
import { SfdxError, SfdxErrorConfig } from './sfdxError';
import { Logger } from './logger';

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

/**
 * Handles persistence and fetching of user authentication information.
 */
export class AuthInfo {

    private readonly _authFileName : string;
    private logger : Logger;
    private fields: Partial<AuthFields> = {};
    private static cache: Map<string, Partial<AuthFields>> = new Map();

    constructor(username : string) {
        this.fields.username = username;
        this._authFileName = `${username}.json`;
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

    /**
     * Initialize an AuthInfo instance with a logger and the auth fields; either from
     * cache or by reading from persistence store.
     */
    async init() : Promise<AuthInfo> {
        this.logger = await Logger.child('AuthInfo');

        if (AuthInfo.cache.has(this.username)) {
            this.fields = AuthInfo.cache.get(this.username);
        }
        else {
            this.fields = await Global.fetchConfigInfo(this.authFileName);
            AuthInfo.cache.set(this.username, this.fields);
        }

        return this;
    }

    /**
     * Returns an instance of AuthInfo for the provided username.
     *
     * @param username The username for the authentication info.
     */
    static async create(username : string) : Promise<AuthInfo> {
        const authInfo = new AuthInfo(username);
        await authInfo.init();
        return authInfo;
    }

    isJwt() : boolean {
        // todo: do we need to check privateKeyFile or is privateKey good enough?
        const { refreshToken, privateKey, privateKeyFile } = this.fields;
        return !refreshToken && !!(privateKey || privateKeyFile);
    }

    isAccessTokenFlow() : boolean {
        const { refreshToken, privateKey } = this.fields;
        return !refreshToken && !privateKey;
    }

    isOauth() : boolean {
        return !this.isAccessTokenFlow() && !this.isJwt();
    }

    isRefreshTokenFlow() {
        const { refreshToken, authCode } = this.fields;
        return !authCode && !!refreshToken
    }

    /**
     * Updates the cache and persists the authentication fields.
     */
    async save(authData? : AuthFields) : Promise<any> {
        if (_.isPlainObject(authData)) {
            this.fields = Object.assign(authData, this.fields);
        }

        AuthInfo.cache.set(this.username, this.fields);
        await Global.saveConfigInfo(this.authFileName, this.fields);
    }

    /**
     * Refresh the access token for a JWT connection.
     *
     * @param conn The jsForce connection
     * @param callback The callback function to execute after access token refresh.
     */
    async jwtRefresh(conn, callback : Function) : Promise<any> {
        this.logger.info('JWT access token has expired. Updating...');

        // @TODO: figure out loginUrl (probably get from config class)
        // loginUrl: this.fields.loginUrl || org.config.getAppConfigIfInWorkspace().sfdcLoginUrl,
        const oauthConfig = {
            loginUrl: this.fields.loginUrl || 'https://login.salesforce.com',
            privateKeyFile: this.fields.privateKey
        };
        Object.assign(this.fields, oauthConfig);
        await conn.authorize(this.toJSON());
        await this.save();
        try {
            return await callback(null, this.fields.accessToken);
        }
        catch (err) {
            if (err.message && err.message.includes('Data Not Available')) {
                const errConfig : SfdxErrorConfig = new SfdxErrorConfig('sfdx-core', 'OrgDataNotAvailableError', [this.username]);
                for(let i=1; i < 5; i++) {
                    errConfig.addAction(`OrgDataNotAvailableErrorAction${i}`);
                }
                return callback(SfdxError.create(errConfig));
            }
            return callback(err);
        }

    }

    /**
     * Refresh the access token for an OAuth connection.
     *
     * @param accessToken the access token passed by the jsForce connection refresh event.
     */
    async oauthRefresh(accessToken: string) : Promise<any> {
        this.logger.info('OAuth access token has expired. Updating...');
        this.fields.accessToken = accessToken;
        await this.save();
        return this;
    }

    /**
     * Return only the auth fields needed to make a connection.
     */
    toJSON() {
        let json;

        const { accessToken, instanceUrl } = this.fields;

        if (this.isAccessTokenFlow()) {
            this.logger.info('Building fields for a connection using access token.');

            // Just auth with the accessToken
            json = { accessToken, instanceUrl };
        }
        else if (this.isJwt()) {
            this.logger.info('Building fields for a connection using JWT config.');
            json = {
                accessToken,
                instanceUrl,
                refreshFn: this.jwtRefresh.bind(this)
            };
        }
        else {
            // @TODO: figure out loginUrl and redirectUri (probably get from config class)
            //
            // redirectUri: org.config.getOauthCallbackUrl()
            // loginUrl: this.fields.instanceUrl || this.config.getAppConfig().sfdcLoginUrl
            this.logger.info('Building fields for a connection using OAuth config.');
            const { clientId, clientSecret, refreshToken } = this.fields;
            json = {
                oauth2: {
                    loginUrl: instanceUrl || 'https://login.salesforce.com',
                    clientId,
                    clientSecret,
                    redirectUri: `http://localhost:1717/OauthRedirect`
                },
                accessToken,
                instanceUrl,
                refreshToken
            };
        }
        return json;
    }
}

export default AuthInfo;
