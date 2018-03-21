/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { isString, cloneDeep, maxBy } from 'lodash';
import { Logger } from './logger';
import { AuthInfo } from './authInfo';
import { SfdxConfigAggregator } from './config/sfdxConfigAggregator';
import { Connection as JSForceConnection, ConnectionOptions, RequestInfo } from 'jsforce';
import { SfdxUtil } from './util';
import { SfdxError } from './sfdxError';

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
 * // Uses latest API version
 * const connection = await Connection.create(await AuthInfo.create(myAdminUsername));
 * connection.query('SELECT Name from Account');
 *
 * // Use different API version
 * connection.setApiVersion("42.0");
 * connection.query('SELECT Name from Account');
 */
export class Connection extends JSForceConnection {

    /**
     * Create and return a connection to an org using authentication info.
     * The returned connection uses the latest API version available on the
     * server unless the apiVersion [config]{@link SfdxConfig} value is set.
     *
     * @param authInfo The authentication info from the persistence store.
     */
    public static async create(authInfo: AuthInfo, configAggregator?: SfdxConfigAggregator): Promise<Connection> {
        const logger = await Logger.child('connection');
        const _aggregator = configAggregator || await SfdxConfigAggregator.create();
        const versionFromConfig = _aggregator.getInfo('apiVersion').value as string;
        const baseOptions: ConnectionOptions = {
            // Set the API version obtained from the config aggregator.
            // Will use jsforce default if undefined.
            version: versionFromConfig,
            callOptions: {
                client: clientId
            }
        };

        // Get connection options from auth info and create a new jsForce connection
        const connectionOptions: ConnectionOptions = Object.assign(baseOptions, authInfo.getConnectionOptions());
        const conn = new Connection(connectionOptions, authInfo, logger);
        if (!versionFromConfig) {
            await conn.useLatestApiVersion();
        }
        return conn;
    }

    // We want to use 1 logger for this class and the jsForce base classes so override
    // the jsForce connection.tooling.logger and connection.logger.
    private logger: Logger;
    private _logger: Logger;

    private authInfo: AuthInfo;

    constructor(options: ConnectionOptions, authInfo: AuthInfo, logger?: Logger) {
        super(options);

        this.authInfo = authInfo;

        // Set the jsForce connection logger to be our Bunyan logger.
        if (logger) {
            this.logger = this._logger = this.tooling._logger = logger;
        }
    }

    /**
     * Send REST API request with given HTTP request info, with connected session information
     * and SFDX headers.
     *
     * @override
     *
     * @param request HTTP request object or URL to GET request
     * @param options HTTP API request options
     */
    public async request(request: RequestInfo | string, options?): Promise<any> {
        const _request: RequestInfo = isString(request) ? { method: 'GET', url: request } : request;
        _request.headers = Object.assign({}, SFDX_HTTP_HEADERS, _request.headers);
        this.logger.debug(`request: ${JSON.stringify(_request)}`);
        return super.request(_request, options);
    }

    /**
     * @returns {string} - The force api base url for the instance
     */
    public baseUrl(): string {
        // essentially the same as pathJoin(super.instanceUrl, 'services', 'data', `v${super.version}`);
        return super._baseUrl();
    }

    /**
     * Retrieves the highest api version that is supported by the target server instance.
     * @returns {Promise<string>} The max api version number. i.e 46.0
     */
    public async retrieveMaxApiVersion(): Promise<string> {
        const versions: object[] = (await this.request(`${this.instanceUrl}/services/data`)) as object[];
        this.logger.debug(`response for org versions: ${versions}`);
        return maxBy(versions, (version: any) => version.version).version;
    }

    /**
     * Use the latest API version available on `this.instanceUrl.
     */
    public async useLatestApiVersion(): Promise<void> {
        try {
            this.setApiVersion(await this.retrieveMaxApiVersion());
        } catch (err) {
            // Don't fail if we can't use the latest, just use the default
            this.logger.warn('Failed to set the latest API version:', err);
        }
    }

    /**
     * Get the API version used for all connection request.
     * @returns {string}
     */
    public getApiVersion(): string {
        return this.version;
    }

    /**
     * Set the API version for all connection request.
     * @param {string} version The API version.
     * @throws {SfdxError} **`{name: 'IncorrectAPIVersion'}`:** Incorrect API version.
     */
    public setApiVersion(version: string): void {
        if (!SfdxUtil.validateApiVersion(version)) {
            throw new SfdxError(`Invalid API version ${version}. Expecting format "[1-9][0-9].0", i.e. 42.0`, 'IncorrectAPIVersion');
        }
        this.version = version;
    }

    /**
     * Getter for the AuthInfo
     * @returns {AuthInfo} A cloned authInfo.
     */
    public getAuthInfo(): AuthInfo {
        return cloneDeep(this.authInfo);
    }

    /**
     * Getter for the username of the Salesforce Org
     * @returns {string}
     */
    public getUsername(): string {
        return this.getAuthInfo().getFields().username;
    }
}
