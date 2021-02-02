/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { maxBy, merge } from '@salesforce/kit';
import { asString, ensure, isString } from '@salesforce/ts-types';
import { Connection as JSForceConnection } from 'jsforce';
import { Promise as JsforcePromise } from 'jsforce';
import { ConfigAggregator } from './config/configAggregator';
import { Logger } from './logger';
import { SfdxError } from './sfdxError';
import { sfdc } from './util/sfdc';
/**
 * The 'async' in our request override replaces the jsforce promise with the node promise, then returns it back to
 * jsforce which expects .thenCall. Add .thenCall to the node promise to prevent breakage.
 */
// @ts-ignore
Promise.prototype.thenCall = JsforcePromise.prototype.thenCall;
const clientId = `sfdx toolbelt:${process.env.SFDX_SET_CLIENT_IDS || ''}`;
export const SFDX_HTTP_HEADERS = {
  'content-type': 'application/json',
  'user-agent': clientId
};
/**
 * Handles connections and requests to Salesforce Orgs.
 *
 * ```
 * // Uses latest API version
 * const connection = await Connection.create({
 *   authInfo: await AuthInfo.create({ username: 'myAdminUsername' })
 * });
 * connection.query('SELECT Name from Account');
 *
 * // Use different API version
 * connection.setApiVersion("42.0");
 * connection.query('SELECT Name from Account');
 * ```
 */
export class Connection extends JSForceConnection {
  /**
   * Creates an instance of a Connection. Performs additional async initializations.
   * @param options Constructor options.
   */
  static async create(options) {
    const _aggregator = options.configAggregator || (await ConfigAggregator.create());
    const versionFromConfig = asString(_aggregator.getInfo('apiVersion').value);
    const baseOptions = {
      // Set the API version obtained from the config aggregator.
      // Will use jsforce default if undefined.
      version: versionFromConfig,
      callOptions: {
        client: clientId
      }
    };
    // Get connection options from auth info and create a new jsForce connection
    options.connectionOptions = Object.assign(baseOptions, options.authInfo.getConnectionOptions());
    const conn = new this(options);
    await conn.init();
    if (!versionFromConfig) {
      await conn.useLatestApiVersion();
    }
    return conn;
  }
  /**
   * Constructor
   * **Do not directly construct instances of this class -- use {@link Connection.create} instead.**
   * @param options The options for the class instance.
   * @ignore
   */
  constructor(options) {
    super(options.connectionOptions || {});
    this.tooling.autoFetchQuery = Connection.prototype.autoFetchQuery;
    this.options = options;
  }
  /**
   * Async initializer.
   */
  async init() {
    this.logger = this._logger = this.tooling._logger = await Logger.child('connection');
  }
  /**
   * Send REST API request with given HTTP request info, with connected session information
   * and SFDX headers.
   *
   * @param request HTTP request object or URL to GET request.
   * @param options HTTP API request options.
   */
  async request(request, options) {
    const _request = isString(request) ? { method: 'GET', url: request } : request;
    _request.headers = Object.assign({}, SFDX_HTTP_HEADERS, _request.headers);
    this.logger.debug(`request: ${JSON.stringify(_request)}`);
    //  The "as" is a workaround for the jsforce typings.
    return super.request(_request, options);
  }
  /**
   * Send REST API request with given HTTP request info, with connected session information
   * and SFDX headers. This method returns a raw http response which includes a response body and statusCode.
   *
   * @param request HTTP request object or URL to GET request.
   */
  async requestRaw(request) {
    const _headers = this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {};
    merge(_headers, SFDX_HTTP_HEADERS, request.headers);
    return this._transport.httpRequest({
      method: request.method,
      url: request.url,
      headers: _headers,
      body: request.body
    });
  }
  /**
   * The Force API base url for the instance.
   */
  baseUrl() {
    // essentially the same as pathJoin(super.instanceUrl, 'services', 'data', `v${super.version}`);
    return super._baseUrl();
  }
  /**
   * Retrieves the highest api version that is supported by the target server instance.
   */
  async retrieveMaxApiVersion() {
    const versions = await this.request(`${this.instanceUrl}/services/data`);
    this.logger.debug(`response for org versions: ${versions}`);
    const max = ensure(maxBy(versions, version => version.version));
    return max.version;
  }
  /**
   * Use the latest API version available on `this.instanceUrl`.
   */
  async useLatestApiVersion() {
    try {
      this.setApiVersion(await this.retrieveMaxApiVersion());
    } catch (err) {
      // Don't fail if we can't use the latest, just use the default
      this.logger.warn('Failed to set the latest API version:', err);
    }
  }
  /**
   * Get the API version used for all connection requests.
   */
  getApiVersion() {
    return this.version;
  }
  /**
   * Set the API version for all connection requests.
   *
   * **Throws** *{@link SfdxError}{ name: 'IncorrectAPIVersion' }* Incorrect API version.
   * @param version The API version.
   */
  setApiVersion(version) {
    if (!sfdc.validateApiVersion(version)) {
      throw new SfdxError(
        `Invalid API version ${version}. Expecting format "[1-9][0-9].0", i.e. 42.0`,
        'IncorrectAPIVersion'
      );
    }
    this.version = version;
  }
  /**
   * Getter for the AuthInfo.
   */
  getAuthInfoFields() {
    return this.options.authInfo.getFields();
  }
  /**
   * Getter for the auth fields.
   */
  getConnectionOptions() {
    return this.options.authInfo.getConnectionOptions();
  }
  /**
   * Getter for the username of the Salesforce Org.
   */
  getUsername() {
    return this.getAuthInfoFields().username;
  }
  /**
   * Returns true if this connection is using access token auth.
   */
  isUsingAccessToken() {
    return this.options.authInfo.isUsingAccessToken();
  }
  /**
   * Normalize a Salesforce url to include a instance information.
   * @param url Partial url.
   */
  normalizeUrl(url) {
    return this._normalizeUrl(url);
  }
  /**
   * Executes a query and auto-fetches (i.e., "queryMore") all results.  This is especially
   * useful with large query result sizes, such as over 2000 records.  The default maximum
   * fetch size is 10,000 records. Modify this via the options argument.
   * @param soql The SOQL string.
   * @param options The query options. NOTE: the autoFetch option will always be true.
   */
  async autoFetchQuery(soql, options = {}) {
    const _options = Object.assign(options, {
      autoFetch: true
    });
    const records = [];
    this._logger.debug(`Auto-fetching query: ${soql}`);
    return new Promise((resolve, reject) =>
      this.query(soql, _options)
        .on('record', rec => records.push(rec))
        .on('error', err => reject(err))
        .on('end', () =>
          resolve({
            done: true,
            totalSize: records.length,
            records
          })
        )
    );
  }
}
//# sourceMappingURL=connection.js.map
