/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { promisify } from 'util';
import { randomBytes, createHash } from 'crypto';
import { Connection as JSForceConnection } from 'jsforce';
import * as jsforce from 'jsforce';
import * as _ from 'lodash';
import { Logger } from './logger';
import { AuthInfo } from './authInfo';
import { SfdxError } from './sfdxError';

export interface OAuth2Options {
    clientId?: string;
    clientSecret?: string;
    loginUrl?: string;
    redirectUri?: string;
}

export interface ConnectionOptions extends OAuth2Options {
    accessToken?: string;
    callOptions?: Object;
    instanceUrl?: string;
    logLevel?: string;
    maxRequest?: number;
    oauth2?: Partial<OAuth2Options>;
    proxyUrl?: string;
    refreshFn?: Function;
    refreshToken?: string;
    serverUrl?: string;
    sessionId?: string;
    signedRequest?: string | Object;
    version?: string;
}

/**
 * Handles connections and requests to Salesforce Orgs.
 * @extends jsforce.Connection
 *
 * @example
 * const connection = await Connection.create(AuthInfo.create(myAdminUsername));
 * connection.query('my_soql_query');
 */
export class Connection extends JSForceConnection {

    private logger : Logger;

    // @overrides jsForce connection logger
    private _logger : Logger;
    public tooling : any;

    private authInfo: AuthInfo;
    private codeVerifier: string;
    private oauth2: any;
    private userInfo: any;

    private static readonly clientId : string = `sfdx toolbelt:${process.env.SFDX_SET_CLIENT_IDS || ''}`;
    private static readonly SFDX_HTTP_HEADERS = {
        'content-type': 'application/json',
        'user-agent': Connection.clientId
    };

    /**
     * Create and return a connection to an org using saved authentication info.
     *
     * @param authInfo The authentication info from the persistence store.
     */
    static async create(authInfo : AuthInfo) : Promise<Connection> {
        const logger = await Logger.child('connection');

        const baseOptions : ConnectionOptions = {
            // @TODO: eventually this will come from config but for now hardcode
            // version: await config.getApiVersion(),
            version: '42.0',
            callOptions: {
                client: Connection.clientId
            }
        };

        // Get connection options from auth info and create a new jsForce connection
        const connectionOptions : ConnectionOptions = Object.assign(baseOptions, authInfo.toJSON());
        const conn = new Connection(connectionOptions as any);

        if (authInfo.isOauth()) {
            // Set a OAuth access token refresh function handler
            conn.on('refresh', authInfo.oauthRefresh.bind(authInfo));

            // Set a code verifier string for OAuth authorization
            conn.codeVerifier = Connection.base64UrlEscape(randomBytes(Math.ceil(128)).toString('base64'));
        }

        // Set the jsForce connection logger to be our Bunyan logger.
        conn.logger = conn._logger = conn.tooling._logger = logger;

        conn.authInfo = authInfo;

        return conn;
    }

    async request(method : string = 'GET', url : string, headers? : any, body? : string) : Promise<any> {
        this.logger.debug(`request: ${url}`);

        const _headers = Object.assign({}, Connection.SFDX_HTTP_HEADERS, headers);
        return await this.request(method, url, body, _headers);
    }

    private async jwtAuthorize() {

    }

    private async refreshTokenAuthorize() {

    }

    private async oauthAuthorize() : Promise<any> {
        if (this.codeVerifier) {
            /**
             * This post params override is necessary because jsForce's oauth impl doesn't support
             * coder_verifier and code_challenge. This enables the server to disallow trading a one-time auth code
             * for an access/refresh token when the verifier and challenge are out of alignment.
             *
             * See - https://github.com/jsforce/jsforce/issues/665
             */
            this.oauth2._postParams = (params, callback) => {
                _.set(params, 'code_verifier', this.codeVerifier);
                return this.oauth2.prototype._postParams.call(this.authInfo, params, callback);
            };
        }

        // Ugh!  Need to improve typings!
        await (jsforce as any).prototype.authorize.call(this, this.authInfo.authCode);
        const user = await (this as any).sobject('User').retrieve(this.userInfo.id);
        return {
            orgId: this.userInfo.organizationId,
            username: user.Username
        };
    }

    /**
     * Authorizes with the org and saves the auth info.
     */
    async authorize() {
        let authData;

        if (this.authInfo.isJwt()) {
            authData = this.jwtAuthorize();
        } else if (this.authInfo.isRefreshTokenFlow()) {
            authData = this.refreshTokenAuthorize();
        } else {
            authData = this.oauthAuthorize();
        }
        await this.authInfo.save(authData);
    }

    /**
     * Makes a nodejs base64 encoded string compatible with rfc4648 alternative encoding for urls.
     *
     * @param base64Encoded a nodejs base64 encoded string
     */
    private static base64UrlEscape(base64Encoded : string) : string {
        // builtin node js base 64 encoding is not 64 url compatible.
        // See - https://toolsn.ietf.org/html/rfc4648#section-5
        return _.replace(base64Encoded, /\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    getAuthorizationUrl() : string {
        // The state parameter allows the redirectUri callback listener to ignore request that don't contain the state value.
        const params = {
            state: randomBytes(Math.ceil(6)).toString('hex'),
            prompt: 'login',
            response_type: 'code',
            scope: 'refresh_token api web'
        };

        if (this.codeVerifier) {
            // code verifier must be a base 64 url encoded hash of 128 bytes of random data. Our random data is also
            // base 64 url encoded. See Connection.create();
            const codeChallenge = Connection.base64UrlEscape(createHash('sha256').update(this.codeVerifier).digest('base64'));
            _.set(params, 'code_challenge', codeChallenge);
        }

        return this.oauth2.getAuthorizationUrl(params);
    }

    private logToServer(data : LogErrorData | LogDiagnosticData, type : LogType) {

    }

    logErrorToServer(data : LogErrorData) {
        return this.logToServer(data, LogType.ERROR);
    }

    logDiagnosticsToServer(data : LogDiagnosticData) {
        return this.logToServer(data, LogType.DIAGNOSTIC);
    }

    // These aren't working due to missing methods on the connection typing
    // query = promisify(JSForceConnection.prototype.query)
    // queryAll = promisify(JSForceConnection.prototype.queryAll)
    // queryMore = promisify(JSForceConnection.prototype.queryMore)
}

enum LogType {
    DIAGNOSTIC = 'DIAGNOSTIC',
    ERROR = 'ERROR'
}

export interface LogErrorData {

}

export interface LogDiagnosticData {

}

export default Connection;
