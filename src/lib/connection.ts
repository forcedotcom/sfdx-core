/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { isString } from 'lodash';
import { Logger } from './logger';
import { AuthInfo } from './authInfo';
import { Connection as JSForceConnection, ConnectionOptions, RequestInfo } from 'jsforce';

const clientId: string = `sfdx toolbelt:${process.env.SFDX_SET_CLIENT_IDS || ''}`;
export const SFDX_HTTP_HEADERS = {
    'content-type': 'application/json',
    'user-agent': clientId
};

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
     * Create and return a connection to an org using authentication info.
     *
     * @param authInfo The authentication info from the persistence store.
     */
    public static async create(authInfo: AuthInfo): Promise<Connection> {
        const logger = await Logger.child('connection');

        const baseOptions: ConnectionOptions = {
            // @TODO: eventually this will come from config but for now hardcode the version.
            // version: await config.getApiVersion(),
            version: '42.0',
            callOptions: {
                client: clientId
            }
        };

        // Get connection options from auth info and create a new jsForce connection
        const connectionOptions: ConnectionOptions = Object.assign(baseOptions, authInfo.toJSON());
        return new Connection(connectionOptions, authInfo, logger);
    }

    // We want to use 1 logger for this class and the jsForce base classes so override
    // the jsForce connection.tooling.logger and connection.logger.
    public tooling: any;
    private logger: Logger;
    private _logger: Logger;

    private authInfo: AuthInfo;
    private userInfo: any;

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
        }
    }

    /**
     * Send REST API request with given HTTP request info, with connected session information
     * and SFDX headers.
     *
     * @override jsforce.connection.request
     *
     * @param request HTTP request object or URL to GET request
     * @param options HTTP API request options
     */
    public async request(request: RequestInfo | string, options?): Promise<any> {
        const _request: RequestInfo = isString(request) ? { method: 'GET', url: request } : request;
        _request.headers = Object.assign({}, SFDX_HTTP_HEADERS, request.headers);
        this.logger.debug(`request: ${JSON.stringify(_request)}`);
        return await super.request(_request, options);
    }
}

export default Connection;
