import { JsonCollection, JsonMap, Optional } from '@salesforce/ts-types';
import {
  Connection as JSForceConnection,
  ConnectionOptions,
  ExecuteOptions,
  QueryResult,
  RequestInfo,
  Tooling as JSForceTooling
} from 'jsforce';
import { AuthFields, AuthInfo } from './authInfo';
import { ConfigAggregator } from './config/configAggregator';
export declare const SFDX_HTTP_HEADERS: {
  'content-type': string;
  'user-agent': string;
};
export interface Tooling extends JSForceTooling {
  /**
   * Executes a query and auto-fetches (i.e., "queryMore") all results.  This is especially
   * useful with large query result sizes, such as over 2000 records.  The default maximum
   * fetch size is 10,000 records.  Modify this via the options argument.
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
export declare class Connection extends JSForceConnection {
  /**
   * Creates an instance of a Connection. Performs additional async initializations.
   * @param options Constructor options.
   */
  static create(
    this: new (options: Connection.Options) => Connection,
    options: Connection.Options
  ): Promise<Connection>;
  /**
   * Tooling api reference.
   */
  tooling: Tooling;
  private logger;
  private _logger;
  private _transport;
  private _normalizeUrl;
  private options;
  /**
   * Constructor
   * **Do not directly construct instances of this class -- use {@link Connection.create} instead.**
   * @param options The options for the class instance.
   * @ignore
   */
  constructor(options: Connection.Options);
  /**
   * Async initializer.
   */
  init(): Promise<void>;
  /**
   * Send REST API request with given HTTP request info, with connected session information
   * and SFDX headers.
   *
   * @param request HTTP request object or URL to GET request.
   * @param options HTTP API request options.
   */
  request(request: RequestInfo | string, options?: JsonMap): Promise<JsonCollection>;
  /**
   * Send REST API request with given HTTP request info, with connected session information
   * and SFDX headers. This method returns a raw http response which includes a response body and statusCode.
   *
   * @param request HTTP request object or URL to GET request.
   */
  requestRaw(request: RequestInfo): Promise<JsonMap>;
  /**
   * The Force API base url for the instance.
   */
  baseUrl(): string;
  /**
   * Retrieves the highest api version that is supported by the target server instance.
   */
  retrieveMaxApiVersion(): Promise<string>;
  /**
   * Use the latest API version available on `this.instanceUrl`.
   */
  useLatestApiVersion(): Promise<void>;
  /**
   * Get the API version used for all connection requests.
   */
  getApiVersion(): string;
  /**
   * Set the API version for all connection requests.
   *
   * **Throws** *{@link SfdxError}{ name: 'IncorrectAPIVersion' }* Incorrect API version.
   * @param version The API version.
   */
  setApiVersion(version: string): void;
  /**
   * Getter for the AuthInfo.
   */
  getAuthInfoFields(): AuthFields;
  /**
   * Getter for the auth fields.
   */
  getConnectionOptions(): AuthFields;
  /**
   * Getter for the username of the Salesforce Org.
   */
  getUsername(): Optional<string>;
  /**
   * Returns true if this connection is using access token auth.
   */
  isUsingAccessToken(): boolean;
  /**
   * Normalize a Salesforce url to include a instance information.
   * @param url Partial url.
   */
  normalizeUrl(url: string): string;
  /**
   * Executes a query and auto-fetches (i.e., "queryMore") all results.  This is especially
   * useful with large query result sizes, such as over 2000 records.  The default maximum
   * fetch size is 10,000 records. Modify this via the options argument.
   * @param soql The SOQL string.
   * @param options The query options. NOTE: the autoFetch option will always be true.
   */
  autoFetchQuery<T>(soql: string, options?: ExecuteOptions): Promise<QueryResult<T>>;
}
export declare namespace Connection {
  /**
   * Connection Options.
   */
  interface Options {
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
