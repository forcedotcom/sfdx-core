/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as http from 'http';
import { parse as parseQueryString } from 'querystring';
import { parse as parseUrl } from 'url';
import { Socket } from 'net';

import { AsyncCreatable, set, toNumber, Env } from '@salesforce/kit';
import { Nullable, get, asString } from '@salesforce/ts-types';
import { OAuth2Options } from 'jsforce';
import { Logger } from './logger';
import { AuthInfo, DEFAULT_CONNECTED_APP_INFO, OAuth2WithVerifier } from './authInfo';
import { SfdxError } from './sfdxError';
import { Messages } from './messages';
import { SfdxProjectJson } from './sfdxProject';

const messages = Messages.loadMessages('@salesforce/core', 'auth');

/**
 * Handles the creation of a web server for web based login flows.
 *
 * Usage:
 * ```
 * const oauthConfig = {
 *   loginUrl: this.flags.instanceurl,
 *   clientId: this.flags.clientid,
 * };
 *
 * const oauthServer = await WebOAuthServer.create({ oauthConfig });
 * await oauthServer.start();
 * await open(oauthServer.getAuthorizationUrl(), { wait: false });
 * const authInfo = await oauthServer.authorizeAndSave();
 * ```
 */
export class WebOAuthServer extends AsyncCreatable<WebOAuthServer.Options> {
  public static DEFAULT_PORT = 1717;
  private authUrl!: string;
  private logger!: Logger;
  private webServer!: WebServer;
  private oauth2!: OAuth2WithVerifier;
  private oauthConfig: OAuth2Options;

  public constructor(options: WebOAuthServer.Options) {
    super(options);
    this.oauthConfig = options.oauthConfig;
  }

  /**
   * Returns the configured oauthLocalPort or the WebOAuthServer.DEFAULT_PORT
   *
   * @returns {Promise<number>}
   */
  public static async determineOauthPort(): Promise<number> {
    try {
      const sfdxProject = await SfdxProjectJson.create({});
      return (sfdxProject.get('oauthLocalPort') as number) || WebOAuthServer.DEFAULT_PORT;
    } catch {
      return WebOAuthServer.DEFAULT_PORT;
    }
  }

  /**
   * Returns the authorization url that's used for the login flow
   *
   * @returns {string}
   */
  public getAuthorizationUrl(): string {
    return this.authUrl;
  }

  /**
   * Executes the oauth request and creates a new AuthInfo when successful
   *
   * @returns {Promise<AuthInfo>}
   */
  public async authorizeAndSave(): Promise<AuthInfo> {
    if (!this.webServer.server) await this.start();

    return new Promise((resolve, reject) => {
      const handler = () => {
        this.logger.debug(`OAuth web login service listening on port: ${this.webServer.port}`);
        this.executeOauthRequest()
          .then(async (response) => {
            try {
              const authInfo = await AuthInfo.create({
                oauth2Options: this.oauthConfig,
                oauth2: this.oauth2,
              });
              await authInfo.save();
              this.webServer.doRedirect(303, authInfo.getOrgFrontDoorUrl(), response);
              response.end();
              resolve(authInfo);
            } catch (err) {
              this.webServer.reportError(err, response);
              reject(err);
            }
          })
          .catch((err) => {
            this.logger.debug('error reported, closing server connection and re-throwing');
            reject(err);
          })
          .finally(() => {
            this.logger.debug('closing server connection');
            this.webServer.close();
          });
      };
      // if the server is already listening the listening event won't be fired anymore so execute handler() directly
      if (this.webServer.server.listening){
        handler();
      } else {
        this.webServer.server.once('listening', handler);
      }
    });
  }

  /**
   * Starts the web server
   */
  public async start() {
    await this.webServer.start();
  }

  protected async init(): Promise<void> {
    this.logger = await Logger.child(this.constructor.name);
    const port = await WebOAuthServer.determineOauthPort();

    if (!this.oauthConfig.clientId) this.oauthConfig.clientId = DEFAULT_CONNECTED_APP_INFO.clientId;
    if (!this.oauthConfig.loginUrl) this.oauthConfig.loginUrl = AuthInfo.getDefaultInstanceUrl();
    if (!this.oauthConfig.redirectUri) this.oauthConfig.redirectUri = `http://localhost:${port}/OauthRedirect`;

    this.webServer = await WebServer.create({ port });
    this.oauth2 = new OAuth2WithVerifier(this.oauthConfig);
    this.authUrl = AuthInfo.getAuthorizationUrl(this.oauthConfig, this.oauth2);
  }

  /**
   * Executes the oauth request
   *
   * @returns {Promise<AuthInfo>}
   */
  private async executeOauthRequest(): Promise<http.ServerResponse> {
    return new Promise((resolve, reject) => {
      this.logger.debug('Starting web auth flow');
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      this.webServer.server.on('request', async (request, response) => {
        const url = parseUrl(request.url);
        this.logger.debug(`processing request for uri: ${url.pathname as string}`);
        if (request.method === 'GET') {
          if (url.pathname && url.pathname.startsWith('/OauthRedirect')) {
            request.query = parseQueryString(url.query as string);
            if (request.query.error) {
              const err = new SfdxError(request.query.error_description || request.query.error, request.query.error);
              this.webServer.reportError(err, response);
              return reject(err);
            }
            this.logger.debug(`request.query.state: ${request.query.state as string}`);
            try {
              this.oauthConfig.authCode = asString(this.parseAuthCodeFromRequest(response, request));
              resolve(response);
            } catch (err) {
              reject(err);
            }
          } else {
            this.webServer.sendError(404, 'Resource not found', response);
            reject(SfdxError.create('@salesforce/core', 'auth', 'invalidRequestUri', [url.pathname]));
          }
        } else {
          this.webServer.sendError(405, 'Unsupported http methods', response);
          reject(SfdxError.create('@salesforce/core', 'auth', 'invalidRequestMethod', [request.method]));
        }
      });
    });
  }

  /**
   * Parses the auth code from the request url
   *
   * @param response the http response
   * @param request the http request
   * @returns {Nullable<string>}
   */
  private parseAuthCodeFromRequest(response: http.ServerResponse, request: WebOAuthServer.Request): Nullable<string> {
    if (!this.validateState(request)) {
      const error = new SfdxError('urlStateMismatch');
      this.webServer.sendError(400, `${error.message}\n`, response);
      this.closeRequest(request);
      this.logger.warn('urlStateMismatchAttempt detected.');
      if (!get(this.webServer.server, 'urlStateMismatchAttempt')) {
        this.logger.error(error.message);
        set(this.webServer.server, 'urlStateMismatchAttempt', true);
      }
    } else {
      const authCode = request.query.code;
      if (authCode && authCode.length > 4) {
        // AuthCodes are generally long strings. For security purposes we will just log the last 4 of the auth code.
        this.logger.debug(`Successfully obtained auth code: ...${authCode.substring(authCode.length - 5)}`);
      } else {
        this.logger.debug('Expected an auth code but could not find one.');
        throw SfdxError.create('@salesforce/core', 'auth', 'missingAuthCode');
      }
      this.logger.debug(`oauthConfig.loginUrl: ${this.oauthConfig.loginUrl}`);
      this.logger.debug(`oauthConfig.clientId: ${this.oauthConfig.clientId}`);
      this.logger.debug(`oauthConfig.redirectUri: ${this.oauthConfig.redirectUri}`);
      return authCode;
    }
    return null;
  }

  /**
   * Closes the request
   *
   * @param request the http request
   */
  private closeRequest(request: WebOAuthServer.Request): void {
    request.connection.end();
    request.connection.destroy();
  }

  /**
   * Validates that the state param in the auth url matches the state
   * param in the http request
   *
   * @param request the http request
   */
  private validateState(request: WebOAuthServer.Request): boolean {
    const state = request.query.state;
    const query = parseUrl(this.authUrl, true).query;
    return !!(state && state === query.state);
  }
}

export namespace WebOAuthServer {
  export interface Options {
    oauthConfig: OAuth2Options;
  }

  export type Request = http.IncomingMessage & { query: { code: string; state: string } };
}

/**
 * Handles the actions specific to the http server
 */
export class WebServer extends AsyncCreatable<WebServer.Options> {
  public static DEFAULT_CLIENT_SOCKET_TIMEOUT = 20000;
  public server!: http.Server;
  public port = WebOAuthServer.DEFAULT_PORT;
  public host = 'localhost';
  private logger!: Logger;
  private sockets: Socket[] = [];

  public constructor(options: WebServer.Options) {
    super(options);
    if (options.port) this.port = options.port;
    if (options.host) this.host = options.host;
  }

  /**
   * Starts the http server after checking that the port is open
   */
  public async start(): Promise<void> {
    try {
      this.logger.debug('Starting web server');
      await this.checkOsPort();
      this.logger.debug(`Nothing listening on host: localhost port: ${this.port} - good!`);
      this.server = http.createServer();

      this.server.on('connection', (socket) => {
        this.logger.debug(`socket connection initialized from ${socket.remoteAddress as string}`);
        this.sockets.push(socket);
      });
      this.server.listen(this.port, this.host);
    } catch (err) {
      if (err.name === 'EADDRINUSE') {
        const error = SfdxError.create('@salesforce/core', 'auth', 'PortInUse', ['PortInUseAction']);
        error.actions = [messages.getMessage('PortInUseAction', [this.port])];
        throw error;
      } else {
        throw err;
      }
    }
  }

  /**
   * Closes the http server and all open sockets
   */
  public close(): void {
    this.sockets.forEach((socket) => {
      socket.end();
      socket.destroy();
    });

    this.server.getConnections((_, num) => {
      this.logger.debug(`number of connections open: ${num}`);
    });

    this.server.close();
  }

  /**
   * sends a response error.
   *
   * @param statusCode he statusCode for the response.
   * @param message the message for the http body.
   * @param response the response to write the error to.
   */
  public sendError(status: number, message: string, response: http.ServerResponse): void {
    response.statusMessage = message;
    response.statusCode = status;
    response.end();
  }

  /**
   * sends a response redirect.
   *
   * @param statusCode the statusCode for the response.
   * @param url the url to redirect to.
   * @param response the response to write the redirect to.
   */
  public doRedirect(status: number, url: string, response: http.ServerResponse): void {
    response.setHeader('Content-Type', 'text/plain');
    const body = `${status} - Redirecting to ${url}`;
    response.setHeader('Content-Length', Buffer.byteLength(body));
    response.writeHead(status, { Location: url });
    response.end(body);
  }

  /**
   * sends a response to the browser reporting an error.
   *
   * @param error the error
   * @param response the response to write the redirect to.
   */
  public reportError(error: Error, response: http.ServerResponse): void {
    response.setHeader('Content-Type', 'text/html');
    const body = messages.getMessage('serverErrorHTMLResponse', [error.message]);
    response.setHeader('Content-Length', Buffer.byteLength(body));
    response.end(body);
  }

  protected async init(): Promise<void> {
    this.logger = await Logger.child(this.constructor.name);
  }

  /**
   * Make sure we can't open a socket on the localhost/host port. It's important because we don't want to send
   * auth tokens to a random strange port listener. We want to make sure we can startup our server first.
   *
   * @private
   */
  private async checkOsPort(): Promise<number> {
    return new Promise((resolve, reject) => {
      const clientConfig = { port: this.port, host: this.host };
      const socket = new Socket();

      socket.setTimeout(this.getSocketTimeout(), () => {
        socket.destroy();
        const error = new SfdxError('timeout', 'SOCKET_TIMEOUT');
        reject(error);
      });

      // An existing connection, means that the port is occupied
      socket.connect(clientConfig, () => {
        socket.destroy();
        const error = new SfdxError('Address in use', 'EADDRINUSE');
        error.data = {
          port: clientConfig.port,
          address: clientConfig.host,
        };
        reject(error);
      });

      // An error means that no existing connection exists, which is what we want
      socket.on('error', () => {
        // eslint-disable-next-line no-console
        socket.destroy();
        resolve(this.port);
      });
    });
  }

  /**
   * check and get the socket timeout form what was set in process.env.SFDX_HTTP_SOCKET_TIMEOUT
   *
   * @returns {number} - represents the socket timeout in ms
   * @private
   */
  private getSocketTimeout(): number {
    const env = new Env();
    const socketTimeout = toNumber(env.getNumber('SFDX_HTTP_SOCKET_TIMEOUT'));
    return Number.isInteger(socketTimeout) && socketTimeout > 0
      ? socketTimeout
      : WebServer.DEFAULT_CLIENT_SOCKET_TIMEOUT;
  }
}

namespace WebServer {
  export interface Options {
    port?: number;
    host?: string;
  }
}
