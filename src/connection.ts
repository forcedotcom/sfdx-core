/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { isString, maxBy } from 'lodash';
import { Logger } from './logger';
import { AuthFields, AuthInfo } from './authInfo';
import { ConfigAggregator } from './config/configAggregator';
import { Connection as JSForceConnection } from 'jsforce';
import { Tooling as JSForceTooling } from 'jsforce';
import { Promise as JsforcePromise } from 'jsforce';
import { ConnectionOptions } from 'jsforce';
import { RequestInfo } from 'jsforce';
import { QueryResult } from 'jsforce';
import { ExecuteOptions } from 'jsforce';
import { SfdxError } from './sfdxError';
import { validateApiVersion } from './util/sfdc';
import { JsonMap } from '@salesforce/ts-json';

/**
 * The 'async' in our request override replaces the jsforce promise with the node promise, then returns it back to
 * jsforce which expects .thenCall. Add .thenCall to the node promise to prevent breakage.
 */
Promise.prototype['thenCall'] = JsforcePromise.prototype.thenCall;

const clientId: string = `sfdx toolbelt:${process.env.SFDX_SET_CLIENT_IDS || ''}`;
export const SFDX_HTTP_HEADERS = {
    'content-type': 'application/json',
    'user-agent': clientId
};

// This interface is so we can add the autoFetchQuery method to both the Connection
// and Tooling classes and get nice typing info for it within editors.  JSForce is
// unlikely to accept a PR for this method, but that would be another approach.
export interface Tooling extends JSForceTooling {
    /**
     * Executes a query and auto-fetches (i.e., "queryMore") all results.  This is especially
     * useful with large query result sizes, such as over 2000 records.  The default maximum
     * fetch size is 10,000 records.  Modify this via the options argument.
     * @param {string} soql The SOQL string.
     * @param {ExecuteOptions} options The query options.  NOTE: the autoFetch option will always be true.
     * @returns {Promise.<QueryResult<T>>}
     */
    autoFetchQuery<T>(soql: string, options?: ExecuteOptions): Promise<QueryResult<T>>;
}

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
     * server unless the apiVersion [config]{@link Config} value is set.
     *
     * @param {AuthInfo} authInfo The authentication info from the persistence store.
     * @param {ConfigAggregator} [configAggregator] The aggregated config object.
     * @returns {Promise<Connection>}
     */
    public static async create(authInfo: AuthInfo, configAggregator?: ConfigAggregator): Promise<Connection> {
        const logger = await Logger.child('connection');
        const _aggregator = configAggregator || await ConfigAggregator.create();
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

    public tooling: Tooling;

    // We want to use 1 logger for this class and the jsForce base classes so override
    // the jsForce connection.tooling.logger and connection.logger.
    private logger: Logger;
    private _logger: Logger;

    private authInfo: AuthInfo;

    constructor(options: ConnectionOptions, authInfo: AuthInfo, logger?: Logger) {
        super(options);

        this.tooling.autoFetchQuery = Connection.prototype.autoFetchQuery;

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
     * @param {RequestInfo | string} request HTTP request object or URL to GET request.
     * @param [options] HTTP API request options.
     * @returns {Promise<object>} The request Promise.
     */
    public async request(request: RequestInfo | string, options?): Promise<object> {
        const _request: RequestInfo = isString(request) ? { method: 'GET', url: request } : request;
        _request.headers = Object.assign({}, SFDX_HTTP_HEADERS, _request.headers);
        this.logger.debug(`request: ${JSON.stringify(_request)}`);
        return super.request(_request, options);
    }

    /**
     * Send REST API request with given HTTP request info, with connected session information
     * and SFDX headers. This method returns a raw http response which includes a response body and statusCode.
     *
     * @override
     *
     * @param {RequestInfo | string} request HTTP request object or URL to GET request.
     * @returns {Promise<JsonMap>} The request Promise.
     */
    public async requestRaw(request: RequestInfo): Promise<JsonMap> {
        return this['_transport'].httpRequest({
            method: request.method,
            url: request.url,
            headers: request.headers,
            body: request.body
        });
    }

    /**
     * @returns {string} The Force API base url for the instance.
     */
    public baseUrl(): string {
        // essentially the same as pathJoin(super.instanceUrl, 'services', 'data', `v${super.version}`);
        return super._baseUrl();
    }

    /**
     * Retrieves the highest api version that is supported by the target server instance.
     * @returns {Promise<string>} The max API version number. i.e 46.0
     */
    public async retrieveMaxApiVersion(): Promise<string> {
        const versions: object[] = (await this.request(`${this.instanceUrl}/services/data`)) as object[];
        this.logger.debug(`response for org versions: ${versions}`);
        // tslint:disable-next-line:no-any
        return (maxBy(versions, (version: any) => version.version)).version;
    }

    /**
     * Use the latest API version available on `this.instanceUrl`.
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
     * Get the API version used for all connection requests.
     * @returns {string}
     */
    public getApiVersion(): string {
        return this.version;
    }

    /**
     * Set the API version for all connection requests.
     * @param {string} version The API version.
     * @throws {SfdxError} **`{name: 'IncorrectAPIVersion'}`:** Incorrect API version.
     */
    public setApiVersion(version: string): void {
        if (!validateApiVersion(version)) {
            throw new SfdxError(`Invalid API version ${version}. Expecting format "[1-9][0-9].0", i.e. 42.0`, 'IncorrectAPIVersion');
        }
        this.version = version;
    }

    /**
     * Getter for the AuthInfo
     * @returns {AuthInfo} A cloned authInfo.
     */
    public getAuthInfoFields(): AuthFields {
        return this.authInfo.getFields();
    }

    public getConnectionOptions(): AuthFields {
        return this.authInfo.getConnectionOptions();
    }

    /**
     * Getter for the username of the Salesforce Org
     * @returns {string}
     */
    public getUsername(): string {
        return this.getAuthInfoFields().username;
    }

    /**
     * Returns true if this connection is using access token auth.
     * @returns {boolean}
     */
    public isUsingAccessToken(): boolean {
        return this.authInfo.isUsingAccessToken();
    }

    public normalizeUrl(url: string): string {
        return this['_normalizeUrl'](url);
    }

    /**
     * Executes a query and auto-fetches (i.e., "queryMore") all results.  This is especially
     * useful with large query result sizes, such as over 2000 records.  The default maximum
     * fetch size is 10,000 records.  Modify this via the options argument.
     * @param {string} soql The SOQL string.
     * @param {ExecuteOptions} options The query options.  NOTE: the autoFetch option will always be true.
     * @returns {Promise.<QueryResult<T>>}
     */
    public async autoFetchQuery<T>(soql: string, options: ExecuteOptions = {}): Promise<QueryResult<T>> {
        const _options: ExecuteOptions = Object.assign(options, { autoFetch: true });
        const records: T[] = [];

        this._logger.debug(`Auto-fetching query: ${soql}`);

        return new Promise<QueryResult<T>>((resolve, reject) =>
            this.query<T>(soql, _options)
                .on('record', ((rec: T) => records.push(rec)))
                .on('error', (err) => reject(err))
                .on('end', () => resolve({
                    done: true,
                    nextRecordsUrl: null,
                    totalSize: records.length,
                    records
                }))
        );
    }
}
