/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */

import { URL } from 'url';
import * as FormData from 'form-data';
import { AsyncResult, DeployOptions, DeployResultLocator } from 'jsforce/api/metadata';
import { Duration, maxBy, env } from '@salesforce/kit';
import {
  asString,
  ensure,
  getString,
  isString,
  JsonCollection,
  JsonMap,
  Nullable,
  Optional,
} from '@salesforce/ts-types';
import {
  Connection as JSForceConnection,
  ConnectionConfig,
  HttpRequest,
  QueryOptions,
  QueryResult,
  Record,
  Schema,
  HttpMethods,
} from 'jsforce';
import { Tooling as JSForceTooling } from 'jsforce/lib/api/tooling';
import { StreamPromise } from 'jsforce/lib/util/promise';
import { MyDomainResolver } from '../status/myDomainResolver';
import { ConfigAggregator } from '../config/configAggregator';
import { Logger } from '../logger';
import { SfError } from '../sfError';
import { sfdc } from '../util/sfdc';
import { Messages } from '../messages';
import { Lifecycle } from '../lifecycleEvents';
import { AuthFields, AuthInfo } from './authInfo';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/core', 'connection', [
  'incorrectAPIVersionError',
  'domainNotFoundError',
  'noInstanceUrlError',
]);

const clientId = `sfdx toolbelt:${process.env.SFDX_SET_CLIENT_IDS || ''}`;
export const SFDX_HTTP_HEADERS = {
  'content-type': 'application/json',
  'user-agent': clientId,
};

export const DNS_ERROR_NAME = 'DomainNotFoundError';
type recentValidationOptions = { id: string; rest?: boolean };
export type DeployOptionsWithRest = Partial<DeployOptions> & { rest?: boolean };

// This interface is so we can add the autoFetchQuery method to both the Connection
// and Tooling classes and get nice typing info for it within editors.  JSForce is
// unlikely to accept a PR for this method, but that would be another approach.
export interface Tooling<S extends Schema = Schema> extends JSForceTooling<S> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _logger: any;
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
export class Connection<S extends Schema = Schema> extends JSForceConnection<S> {
  // The following are all initialized in either this constructor or the super constructor, sometimes conditionally...
  /**
   * Tooling api reference.
   */
  public get tooling(): Tooling<S> {
    return super.tooling as Tooling<S>;
  }
  // We want to use 1 logger for this class and the jsForce base classes so override
  // the jsForce connection.tooling.logger and connection.logger.
  private logger!: Logger;
  private options: Connection.Options<S>;

  // All connections are tied to a username
  private username!: string;

  /**
   * Constructor
   * **Do not directly construct instances of this class -- use {@link Connection.create} instead.**
   *
   * @param options The options for the class instance.
   * @ignore
   */
  public constructor(options: Connection.Options<S>) {
    super(options.connectionOptions || {});
    this.options = options;
    this.username = options.authInfo.getUsername();
  }

  /**
   * Creates an instance of a Connection. Performs additional async initializations.
   *
   * @param options Constructor options.
   */
  public static async create<S extends Schema>(
    this: new (options: Connection.Options<S>) => Connection<S>,
    options: Connection.Options<S>
  ): Promise<Connection<S>> {
    const baseOptions: ConnectionConfig = {
      version: options.connectionOptions?.version,
      callOptions: {
        client: clientId,
      },
    };

    if (!baseOptions.version) {
      // Set the API version obtained from the config aggregator.
      const configAggregator = options.configAggregator || (await ConfigAggregator.create());
      baseOptions.version = asString(configAggregator.getInfo('org-api-version').value);
    }

    const providedOptions = options.authInfo.getConnectionOptions();

    // Get connection options from auth info and create a new jsForce connection
    options.connectionOptions = Object.assign(baseOptions, providedOptions) as ConnectionConfig<S>;

    const conn = new this(options);
    await conn.init();

    try {
      // No version passed in or in the config, so load one.
      if (!baseOptions.version) {
        const cachedVersion = await conn.loadInstanceApiVersion();
        if (cachedVersion) {
          conn.setApiVersion(cachedVersion);
        }
      } else {
        conn.logger.debug(
          `The org-api-version ${baseOptions.version} was found from ${
            options.connectionOptions?.version ? 'passed in options' : 'config'
          }`
        );
      }
    } catch (err) {
      const e = err as Error;
      if (e.name === DNS_ERROR_NAME) {
        throw e;
      }
      conn.logger.debug(`Error trying to load the API version: ${e.name} - ${e.message}`);
    }
    conn.logger.debug(`Using apiVersion ${conn.getApiVersion()}`);
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
   * TODO: This should be moved into JSForce V2 once ready
   * this is only a temporary solution to support both REST and SOAP APIs
   *
   * deploy a zipped buffer from the SDRL with REST or SOAP
   *
   * @param zipInput data to deploy
   * @param options JSForce deploy options + a boolean for rest
   * @param callback
   */
  public async deploy(
    zipInput: Buffer,
    options: DeployOptionsWithRest
  ): Promise<DeployResultLocator<AsyncResult & Schema>> {
    const rest = options.rest;
    // neither API expects this option
    delete options.rest;
    if (rest) {
      this.logger.debug('deploy with REST');
      await this.refreshAuth();
      const headers: { [key: string]: string } = {
        Authorization: this && `OAuth ${this.accessToken}`,
        'Sforce-Call-Options': 'client=sfdx-core',
      };
      const client = this.oauth2 && this.oauth2.clientId;

      if (client) {
        headers.clientId = client;
      }

      const form = new FormData();

      // Add the zip file
      form.append('file', zipInput, {
        contentType: 'application/zip',
        filename: 'package.xml',
      });

      // Add the deploy options
      form.append('entity_content', JSON.stringify({ deployOptions: options }), {
        contentType: 'application/json',
      });

      const url = `${this.baseUrl()}/metadata/deployRequest`;

      const httpRequest: HttpRequest = { method: 'POST', url, headers, body: form };
      return this.request(httpRequest);
    } else {
      this.logger.debug('deploy with SOAP');
      return this.metadata.deploy(zipInput, options);
    }
  }

  /**
   * Send REST API request with given HTTP request info, with connected session information
   * and SFDX headers.
   *
   * @param request HTTP request object or URL to GET request.
   * @param options HTTP API request options.
   */
  public request<R = unknown>(request: string | HttpRequest, options?: JsonMap): StreamPromise<R> {
    const httpRequest: HttpRequest = isString(request) ? { method: 'GET', url: request } : request;
    httpRequest.headers = Object.assign({}, SFDX_HTTP_HEADERS, httpRequest.headers);
    this.logger.debug(`request: ${JSON.stringify(httpRequest)}`);
    //  The "as" is a workaround for the jsforce typings.
    return super.request(httpRequest, options);
  }

  /**
   * The Force API base url for the instance.
   */
  public baseUrl(): string {
    // essentially the same as pathJoin(super.instanceUrl, 'services', 'data', `v${super.version}`);
    return super._baseUrl();
  }

  /**
   * TODO: This should be moved into JSForce V2 once ready
   * this is only a temporary solution to support both REST and SOAP APIs
   *
   * Will deploy a recently validated deploy request
   *
   * @param options.id = the deploy ID that's been validated already from a previous checkOnly deploy request
   * @param options.rest = a boolean whether or not to use the REST API
   */
  public async deployRecentValidation(options: recentValidationOptions): Promise<JsonCollection> {
    const rest = options.rest;
    delete options.rest;
    if (rest) {
      const url = `${this.baseUrl()}/metadata/deployRequest`;
      const messageBody = JSON.stringify({
        validatedDeployRequestId: options.id,
      });
      const requestInfo: HttpRequest = {
        method: 'POST',
        url,
        body: messageBody,
      };
      const requestOptions = { headers: 'json' };
      return this.request(requestInfo, requestOptions);
    } else {
      // the _invoke is private in jsforce, we can call the SOAP deployRecentValidation like this
      // @ts-ignore
      return this.metadata['_invoke']('deployRecentValidation', {
        validationId: options.id,
      }) as JsonCollection;
    }
  }
  /**
   * Retrieves the highest api version that is supported by the target server instance.
   */
  public async retrieveMaxApiVersion(): Promise<string> {
    await this.isResolvable();
    type Versioned = { version: string };
    const versions: Versioned[] = await this.request<Versioned[]>(`${this.instanceUrl}/services/data`);
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
      const error = err as Error;
      if (error.name === DNS_ERROR_NAME) {
        throw error; // throws on DNS connection errors
      }
      // Don't fail if we can't use the latest, just use the default
      this.logger.warn('Failed to set the latest API version:', error);
    }
  }

  /**
   * Verify that instance has a reachable DNS entry, otherwise will throw error
   */
  public async isResolvable(): Promise<boolean> {
    if (!this.options.connectionOptions?.instanceUrl) {
      throw messages.createError('noInstanceUrlError');
    }
    const resolver = await MyDomainResolver.create({
      url: new URL(this.options.connectionOptions.instanceUrl),
    });
    try {
      await resolver.resolve();
      return true;
    } catch (e) {
      throw messages.createError('domainNotFoundError', [], [], e as Error);
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
   * **Throws** *{@link SfError}{ name: 'IncorrectAPIVersionError' }* Incorrect API version.
   *
   * @param version The API version.
   */
  public setApiVersion(version: string): void {
    if (!sfdc.validateApiVersion(version)) {
      throw messages.createError('incorrectAPIVersionError', [version]);
    }
    this.version = version;
  }

  /**
   * Getter for AuthInfo.
   */
  public getAuthInfo(): AuthInfo {
    return this.options.authInfo;
  }

  /**
   * Getter for the AuthInfo fields.
   */
  public getAuthInfoFields(): AuthFields {
    // If the GlobalInfo.unsetOrg is called, the AuthFields are no longer accessible.
    return this.options.authInfo.getFields() || {};
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
    return this.username;
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
   * @param queryOptions The query options. NOTE: the autoFetch option will always be true.
   */
  public async autoFetchQuery<T extends Schema = S>(
    soql: string,
    queryOptions: Partial<QueryOptions> = {}
  ): Promise<QueryResult<T>> {
    const config: ConfigAggregator = await ConfigAggregator.create();
    // take the limit from the calling function, then the config, then default 10,000
    const maxFetch: number = (config.getInfo('org-max-query-limit').value as number) || queryOptions.maxFetch || 10000;

    const options: Partial<QueryOptions> = Object.assign(queryOptions, {
      autoFetch: true,
      maxFetch,
    });

    const query = await this.query<T>(soql, options);

    if (query.records.length && query.totalSize > query.records.length) {
      void Lifecycle.getInstance().emitWarning(
        `The query result is missing ${
          query.totalSize - query.records.length
        } records due to a ${maxFetch} record limit. Increase the number of records returned by setting the config value "maxQueryLimit" or the environment variable "SFDX_MAX_QUERY_LIMIT" to ${
          query.totalSize
        } or greater than ${maxFetch}.`
      );
    }

    return query;
  }

  /**
   * Executes a query using either standard REST or Tooling API, returning a single record.
   * Will throw if either zero records are found OR multiple records are found.
   *
   * @param soql The SOQL string.
   * @param options The query options.
   */
  public async singleRecordQuery<T extends Record>(
    soql: string,
    options: SingleRecordQueryOptions = {
      choiceField: 'Name',
    }
  ): Promise<T> {
    const result = options.tooling ? await this.tooling.query<T>(soql) : await this.query<T>(soql);
    if (result.totalSize === 0) {
      throw new SfError(`No record found for ${soql}`, SingleRecordQueryErrors.NoRecords);
    }
    if (result.totalSize > 1) {
      throw new SfError(
        options.returnChoicesOnMultiple
          ? `Multiple records found. ${result.records.map((item) => item[options.choiceField as keyof T]).join(',')}`
          : 'The query returned more than 1 record',
        SingleRecordQueryErrors.MultipleRecords
      );
    }
    return result.records[0];
  }

  /**
   * Executes a get request on the baseUrl to force an auth refresh
   * Useful for the raw methods (request, requestRaw) that use the accessToken directly and don't handle refreshes
   */
  public async refreshAuth(): Promise<void> {
    this.logger.debug('Refreshing auth for org.');
    const requestInfo = {
      url: this.baseUrl(),
      method: 'GET' as HttpMethods,
    };
    await this.request(requestInfo);
  }

  private async loadInstanceApiVersion(): Promise<Nullable<string>> {
    const authFileFields = this.options.authInfo.getFields();
    const lastCheckedDateString = authFileFields.instanceApiVersionLastRetrieved;
    let version = getString(authFileFields, 'instanceApiVersion');
    let lastChecked: Optional<number>;

    try {
      if (lastCheckedDateString && isString(lastCheckedDateString)) {
        lastChecked = Date.parse(lastCheckedDateString);
      }
    } catch (e) {
      /* Do nothing, it will just request the version again */
    }

    // Grab the latest api version from the server and cache it in the auth file
    const useLatest = async () => {
      // verifies DNS
      await this.useLatestApiVersion();
      version = this.getApiVersion();
      await this.options.authInfo.save({
        instanceApiVersion: version,
        // This will get messed up if the user changes their local time on their machine.
        // Not a big deal since it will just get updated sooner/later.
        instanceApiVersionLastRetrieved: new Date().toLocaleString(),
      });
    };

    const ignoreCache = env.getBoolean('SFDX_IGNORE_API_VERSION_CACHE', false);
    if (lastChecked && !ignoreCache) {
      const now = new Date();
      const has24HoursPastSinceLastCheck = now.getTime() - lastChecked > Duration.hours(24).milliseconds;
      this.logger.debug(
        `Last checked on ${lastCheckedDateString} (now is ${now.toLocaleString()}) - ${
          has24HoursPastSinceLastCheck ? '' : 'not '
        }getting latest`
      );
      if (has24HoursPastSinceLastCheck) {
        await useLatest();
      }
    } else {
      this.logger.debug(
        `Using the latest because lastChecked=${lastChecked} and SFDX_IGNORE_API_VERSION_CACHE=${ignoreCache}`
      );
      // No version found in the file (we never checked before)
      // so get the latest.
      await useLatest();
    }
    this.logger.debug(`Loaded latest org-api-version ${version}`);
    return version;
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
  export interface Options<S extends Schema> {
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
    connectionOptions?: ConnectionConfig<S>;
  }
}

// jsforce does some interesting proxy loading on lib classes.
// Setting this in the Connection.tooling getter will not work, it
// must be set on the prototype.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
JSForceTooling.prototype.autoFetchQuery = Connection.prototype.autoFetchQuery; // eslint-disable-line @typescript-eslint/unbound-method
