/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { URL } from 'url';
import { Duration, maxBy, merge, Env } from '@salesforce/kit';
import { asString, ensure, getNumber, isString, JsonCollection, JsonMap, Optional } from '@salesforce/ts-types';
import {
  Connection as JSForceConnection,
  ConnectionOptions,
  ExecuteOptions,
  Promise as JsforcePromise,
  QueryResult,
  RequestInfo,
  Tooling as JSForceTooling,
} from 'jsforce';
import { AuthFields, AuthInfo } from './authInfo';
import { MyDomainResolver } from './status/myDomainResolver';

import { ConfigAggregator } from './config/configAggregator';
import { Logger } from './logger';
import { SfdxError } from './sfdxError';
import { sfdc } from './util/sfdc';

/**
 * The 'async' in our request override replaces the jsforce promise with the node promise, then returns it back to
 * jsforce which expects .thenCall. Add .thenCall to the node promise to prevent breakage.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
Promise.prototype.thenCall = JsforcePromise.prototype.thenCall;

const clientId = `sfdx toolbelt:${process.env.SFDX_SET_CLIENT_IDS || ''}`;
export const SFDX_HTTP_HEADERS = {
  'content-type': 'application/json',
  'user-agent': clientId,
};

export const DNS_ERROR_NAME = 'Domain Not Found';
// Timeout for DNS lookup polling defaults to 30 seconds and should always be at least 3 seconds
const DNS_TIMEOUT = Math.max(3, new Env().getNumber('SFDX_DNS_TIMEOUT', 30) as number);
// Retry frequency for DNS lookup polling should be at least 10 seconds
const DNS_RETRY_FREQ = Math.max(10, new Env().getNumber('SFDX_DNS_RETRY_FREQUENCY', 10) as number);

// This interface is so we can add the autoFetchQuery method to both the Connection
// and Tooling classes and get nice typing info for it within editors.  JSForce is
// unlikely to accept a PR for this method, but that would be another approach.
export interface Tooling extends JSForceTooling {
  /**
   * Executes a query and auto-fetches (i.e., "queryMore") all results.  This is especially
   * useful with large query result sizes, such as over 2000 records.  The default maximum
   * fetch size is 10,000 records.  Modify this via the options argument.
   *
   * @param soql The SOQL string.
   * @param options The query options.  NOTE: the autoFetch option will always be true.
   */
  autoFetchQuery<T>(soql: string, options?: ExecuteOptions): Promise<QueryResult<T>>;
}

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
  // The following are all initialized in either this constructor or the super constructor, sometimes conditionally...
  /**
   * Tooling api reference.
   */
  public tooling!: Tooling;
  // We want to use 1 logger for this class and the jsForce base classes so override
  // the jsForce connection.tooling.logger and connection.logger.
  private logger!: Logger;
  private _transport!: { httpRequest: (info: RequestInfo) => JsonMap };
  private _normalizeUrl!: (url: string) => string;
  private options: Connection.Options;

  /**
   * Constructor
   * **Do not directly construct instances of this class -- use {@link Connection.create} instead.**
   *
   * @param options The options for the class instance.
   * @ignore
   */
  public constructor(options: Connection.Options) {
    super(options.connectionOptions || {});

    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.tooling.autoFetchQuery = Connection.prototype.autoFetchQuery;

    this.options = options;
  }
  /**
   * Creates an instance of a Connection. Performs additional async initializations.
   *
   * @param options Constructor options.
   */
  public static async create(
    this: new (options: Connection.Options) => Connection,
    options: Connection.Options
  ): Promise<Connection> {
    const configAggregator = options.configAggregator || (await ConfigAggregator.create());
    const versionFromConfig = asString(configAggregator.getInfo('apiVersion').value);
    const baseOptions: ConnectionOptions = {
      // Set the API version obtained from the config aggregator.
      // Will use jsforce default if undefined.
      version: versionFromConfig,
      callOptions: {
        client: clientId,
      },
    };

    // Get connection options from auth info and create a new jsForce connection
    options.connectionOptions = Object.assign(baseOptions, options.authInfo.getConnectionOptions());

    const conn = new this(options);
    await conn.init();
    // verifies that subsequent requests to org will not hit DNS errors

    if (!versionFromConfig) {
      await conn.useLatestApiVersion();
    }
    return conn;
  }
  /**
   * Async initializer.
   */
  public async init(): Promise<void> {
    // eslint-disable-next-line no-underscore-dangle
    this.logger = this.tooling._logger = await Logger.child('connection');
  }

  /**
   * Send REST API request with given HTTP request info, with connected session information
   * and SFDX headers.
   *
   * @param request HTTP request object or URL to GET request.
   * @param options HTTP API request options.
   */
  public async request(request: RequestInfo | string, options?: JsonMap): Promise<JsonCollection> {
    const requestInfo: RequestInfo = isString(request) ? { method: 'GET', url: request } : request;
    requestInfo.headers = Object.assign({}, SFDX_HTTP_HEADERS, requestInfo.headers);
    this.logger.debug(`request: ${JSON.stringify(requestInfo)}`);
    //  The "as" is a workaround for the jsforce typings.
    return super.request(requestInfo, options) as Promise<JsonCollection>;
  }

  /**
   * Send REST API request with given HTTP request info, with connected session information
   * and SFDX headers. This method returns a raw http response which includes a response body and statusCode.
   *
   * @param request HTTP request object or URL to GET request.
   */
  public async requestRaw(request: RequestInfo): Promise<JsonMap> {
    const headers = this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {};

    merge(headers, SFDX_HTTP_HEADERS, request.headers);

    return this._transport.httpRequest({
      method: request.method,
      url: request.url,
      headers,
      body: request.body,
    });
  }

  /**
   * The Force API base url for the instance.
   */
  public baseUrl(): string {
    // essentially the same as pathJoin(super.instanceUrl, 'services', 'data', `v${super.version}`);
    return super._baseUrl();
  }

  /**
   * Retrieves the highest api version that is supported by the target server instance.
   */
  public async retrieveMaxApiVersion(): Promise<string> {
    await this.isResolvable();
    type Versioned = { version: string };
    const versions = (await this.request(`${this.instanceUrl}/services/data`)) as Versioned[];
    this.logger.debug(`response for org versions: ${versions.map((item) => item.version).join(',')}`);
    const max = ensure(maxBy(versions, (version: Versioned) => version.version));

    return max.version;
  }
  /**
   * Use the latest API version available on `this.instanceUrl`.
   */
  public async useLatestApiVersion(): Promise<void> {
    try {
      this.setApiVersion(await this.retrieveMaxApiVersion());
    } catch (err) {
      if (err.name === DNS_ERROR_NAME) {
        throw err; // throws on DNS connection errors
      }
      // Don't fail if we can't use the latest, just use the default
      this.logger.warn('Failed to set the latest API version:', err);
    }
  }

  /**
   * Verify that instance has a reachable DNS entry, otherwise will throw error
   */
  public async isResolvable(): Promise<boolean> {
    if (!this.options.connectionOptions?.instanceUrl) {
      throw new SfdxError('Connection has no instanceUrl', 'NoInstanceUrl', [
        'Make sure the instanceUrl is set in your command or config',
      ]);
    }
    const resolver = await MyDomainResolver.create({
      url: new URL(this.options.connectionOptions.instanceUrl),
      timeout: Duration.seconds(DNS_TIMEOUT),
      frequency: Duration.seconds(DNS_RETRY_FREQ),
    });
    try {
      await resolver.resolve();
      return true;
    } catch (e) {
      throw new SfdxError('The org cannot be found', DNS_ERROR_NAME, [
        'Verify that the org still exists',
        'If your org is newly created, wait a minute and run your command again',
        "If you deployed or updated the org's My Domain, logout from the CLI and authenticate again",
      ]);
    }
  }

  /**
   * Get the API version used for all connection requests.
   */
  public getApiVersion(): string {
    return this.version;
  }

  /**
   * Set the API version for all connection requests.
   *
   * **Throws** *{@link SfdxError}{ name: 'IncorrectAPIVersion' }* Incorrect API version.
   *
   * @param version The API version.
   */
  public setApiVersion(version: string): void {
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
  public getAuthInfoFields(): AuthFields {
    return this.options.authInfo.getFields();
  }

  /**
   * Getter for the auth fields.
   */
  public getConnectionOptions(): AuthFields {
    return this.options.authInfo.getConnectionOptions();
  }

  /**
   * Getter for the username of the Salesforce Org.
   */
  public getUsername(): Optional<string> {
    return this.getAuthInfoFields().username;
  }

  /**
   * Returns true if this connection is using access token auth.
   */
  public isUsingAccessToken(): boolean {
    return this.options.authInfo.isUsingAccessToken();
  }

  /**
   * Normalize a Salesforce url to include a instance information.
   *
   * @param url Partial url.
   */
  public normalizeUrl(url: string): string {
    return this._normalizeUrl(url);
  }

  /**
   * Executes a query and auto-fetches (i.e., "queryMore") all results.  This is especially
   * useful with large query result sizes, such as over 2000 records.  The default maximum
   * fetch size is 10,000 records. Modify this via the options argument.
   *
   * @param soql The SOQL string.
   * @param executeOptions The query options. NOTE: the autoFetch option will always be true.
   */
  public async autoFetchQuery<T>(soql: string, executeOptions: ExecuteOptions = {}): Promise<QueryResult<T>> {
    const config: ConfigAggregator = await ConfigAggregator.create();
    // take the limit from the calling function, then the config, then default 10,000
    const maxFetch: number = (config.getInfo('maxQueryLimit').value as number) || executeOptions.maxFetch || 10000;

    const options: ExecuteOptions = Object.assign(executeOptions, {
      autoFetch: true,
      maxFetch,
    });
    const records: T[] = [];

    return new Promise<QueryResult<T>>((resolve, reject) => {
      const query = this.query<T>(soql, options)
        .on('record', (rec) => records.push(rec))
        .on('error', (err) => reject(err))
        .on('end', () => {
          const totalSize = getNumber(query, 'totalSize') || 0;
          if (totalSize > records.length) {
            process.emitWarning(
              `The query result is missing ${
                totalSize - records.length
              } records due to a ${maxFetch} record limit. Increase the number of records returned by setting the config value "maxQueryLimit" or the environment variable "SFDX_MAX_QUERY_LIMIT" to ${totalSize} or greater than ${maxFetch}.`
            );
          }
          resolve({
            done: true,
            totalSize,
            records,
          });
        });
    });
  }

  /**
   * Executes a query using either standard REST or Tooling API, returning a single record.
   * Will throw if either zero records are found OR multiple records are found.
   *
   * @param soql The SOQL string.
   * @param options The query options.
   */
  public async singleRecordQuery<T>(
    soql: string,
    options: SingleRecordQueryOptions = {
      choiceField: 'Name',
    }
  ): Promise<T> {
    const result = options.tooling ? await this.tooling.query<T>(soql) : await this.query<T>(soql);
    if (result.totalSize === 0) {
      throw new SfdxError(`No record found for ${soql}`, SingleRecordQueryErrors.NoRecords);
    }
    if (result.totalSize > 1) {
      throw new SfdxError(
        options.returnChoicesOnMultiple
          ? `Multiple records found. ${result.records.map((item) => item[options.choiceField as keyof T]).join(',')}`
          : 'The query returned more than 1 record',
        SingleRecordQueryErrors.MultipleRecords
      );
    }
    return result.records[0];
  }
}

export const SingleRecordQueryErrors = {
  NoRecords: 'SingleRecordQuery_NoRecords',
  MultipleRecords: 'SingleRecordQuery_MultipleRecords',
};
export interface SingleRecordQueryOptions {
  tooling?: boolean;
  returnChoicesOnMultiple?: boolean;
  choiceField?: string; // defaults to Name
}

export namespace Connection {
  /**
   * Connection Options.
   */
  export interface Options {
    /**
     * AuthInfo instance.
     */
    authInfo: AuthInfo;
    /**
     * ConfigAggregator for getting defaults.
     */
    configAggregator?: ConfigAggregator;
    /**
     * Additional connection parameters.
     */
    connectionOptions?: ConnectionOptions;
  }
}
