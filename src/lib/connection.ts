/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { promisify } from 'util';
import { randomBytes, createHash } from 'crypto';
import * as _ from 'lodash';
import { Logger } from './logger';
import { AuthInfo, AuthFields } from './authInfo';
import { SfdxError } from './sfdxError';
import { Connection as JSForceConnection, ConnectionOptions } from 'jsforce';

/**
 * Handles connections and requests to Salesforce Orgs.
 * @extends jsforce.Connection
 *
 * @example
 * const connection = await Connection.create(AuthInfo.create(myAdminUsername));
 * connection.query('my_soql_query');
 */
export class Connection extends JSForceConnection {

    /**
     * Create and return a connection to an org using saved authentication info.
     *
     * @param authInfo The authentication info from the persistence store.
     */
    public static async create(authInfo: AuthInfo): Promise<Connection> {
        const logger = await Logger.child('connection');

        //
        // TODO: THIS FUNCTION HAS TO SETUP THE PROPER CONNECTION BASED ON THE AUTH INFO
        //       PASSED IN.  SHOULD WE HAVE this function create JwtConnection,
        //       AccessTokenConnection, OAuthConnection, etc???
        //

        const baseOptions: ConnectionOptions = {
            // @TODO: eventually this will come from config but for now hardcode the version.
            // version: await config.getApiVersion(),
            version: '42.0',
            callOptions: {
                client: Connection.clientId
            }
        };

        // Get connection options from auth info and create a new jsForce connection
        const connectionOptions: ConnectionOptions = Object.assign(baseOptions, authInfo.toJSON());
        console.log('connectionOptions =', connectionOptions);
        return new Connection(connectionOptions, authInfo, logger);
    }

    private static readonly clientId: string = `sfdx toolbelt:${process.env.SFDX_SET_CLIENT_IDS || ''}`;
    private static readonly SFDX_HTTP_HEADERS = {
        'content-type': 'application/json',
        'user-agent': Connection.clientId
    };

    /**
     * Makes a nodejs base64 encoded string compatible with rfc4648 alternative encoding for urls.
     *
     * @param base64Encoded a nodejs base64 encoded string
     */
    private static base64UrlEscape(base64Encoded: string): string {
        // builtin node js base 64 encoding is not 64 url compatible.
        // See - https://toolsn.ietf.org/html/rfc4648#section-5
        return _.replace(base64Encoded, /\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    // @overrides jsForce connection logger
    public tooling: any;

    private logger: Logger;
    private _logger: Logger;

    private authInfo: AuthInfo;
    private codeVerifier: string;
    private oauth2: any;
    private userInfo: any;

    // @TODO IMPLEMENT THIS AS IT EXISTS ON FORCE
    // async request(method : string = 'GET', url : string, headers? : any, body? : string) : Promise<any> {
    //     this.logger.debug(`request: ${url}`);

    //     const _headers = Object.assign({}, Connection.SFDX_HTTP_HEADERS, headers);
    //     return await this.request(method, url, body, _headers);
    // }

    constructor(options: ConnectionOptions, authInfo: AuthInfo, logger?: Logger) {
        super(options);

        this.authInfo = authInfo;

        // Set the jsForce connection logger to be our Bunyan logger.
        if (logger) {
            this.logger = this._logger = this.tooling._logger = logger;
        }

        if (authInfo.isOauth()) {
            // Set an OAuth access token refresh function handler
            super.on('refresh', authInfo.oauthRefresh.bind(authInfo));

            // Set a code verifier string for OAuth authorization
            this.codeVerifier = Connection.base64UrlEscape(randomBytes(Math.ceil(128)).toString('base64'));
        }
    }

    public logErrorToServer(data: LogErrorData) {
        return this.logToServer(data, LogType.ERROR);
    }

    public logDiagnosticsToServer(data: LogDiagnosticData) {
        return this.logToServer(data, LogType.DIAGNOSTIC);
    }

    public getAuthorizationUrl(): string {
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

    private logToServer(data: LogErrorData | LogDiagnosticData, type: LogType) {

    }

    private async oauthAuthorize(): Promise<any> {
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

        await super.authorize(this.authInfo.authCode);
        const user = await super.sobject('User').retrieve(this.userInfo.id);
        return {
            orgId: this.userInfo.organizationId,
            username: user['Username']
        };
    }
}

enum LogType {
    DIAGNOSTIC = 'DIAGNOSTIC',
    ERROR = 'ERROR'
}

export interface LogErrorData {
    commandName: string;
    commandParams?: string[];
    commandTimestamp: number;
    hubOrgId: string;
    toolbeltVersion: string;
    sourceApiVersion: number;
    origin: string;
    artifactName: string;
    orgType: string;
    instanceUrl: string;
    errorName: string;
    errorMessage: string;
    errorStack: string;
    __errorWhitelist__?: string[];
}

export interface LogDiagnosticData {
    commandName: string;
    hubOrgId: string;
    toolbeltVersion: string;
    usageDate: string;
    totalExecutions: number;
    totalErrors: number;
    avgRuntime: number;
    minRuntime: number;
    maxRuntime: number;
}

export default Connection;
