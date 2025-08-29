/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import * as http from 'node:http';
import { parse as parseQueryString } from 'node:querystring';
import { parse as parseUrl } from 'node:url';
import { Socket } from 'node:net';
import { EventEmitter } from 'node:events';
import { OAuth2 } from '@jsforce/jsforce-node';
import { AsyncCreatable, Env, set, toNumber } from '@salesforce/kit';
import { asString, ensureString, get, Nullable } from '@salesforce/ts-types';
import { Logger } from './logger/logger';
import { AuthInfo, DEFAULT_CONNECTED_APP_INFO, CODE_BUILDER_CONNECTED_APP_INFO } from './org/authInfo';
import { SfError } from './sfError';
import { Messages } from './messages';
import { SfProjectJson } from './sfProject';
import { JwtOAuth2Config } from './org/authInfo';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'auth');

// Server ignores requests for site icons
const iconPaths = ['/favicon.ico', '/apple-touch-icon-precomposed.png'];

const CODE_BUILDER_REDIRECT_URI = 'https://api.code-builder.platform.salesforce.com/api/auth/salesforce/callback';

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
  private oauth2!: OAuth2;
  private oauthConfig: JwtOAuth2Config;
  private oauthError = new Error('Oauth Error');
  private clientApp?: string;
  private username?: string;

  public constructor(options: WebOAuthServer.Options) {
    super(options);
    this.oauthConfig = options.oauthConfig;

    // runtime check due to TS's loose type validation when using union types.
    if (Object.hasOwn(options, 'username') && !Object.hasOwn(options, 'clientApp')) {
      throw messages.createError('error.missingWebOauthServer.options');
    }
    if (Object.hasOwn(options, 'clientApp') && !Object.hasOwn(options, 'username')) {
      throw messages.createError('error.missingWebOauthServer.options');
    }
    if ('clientApp' in options) {
      this.clientApp = options.clientApp;
      this.username = options.username;
    }
  }

  /**
   * Returns the configured oauthLocalPort or the WebOAuthServer.DEFAULT_PORT
   *
   * @returns {Promise<number>}
   */
  public static async determineOauthPort(): Promise<number> {
    try {
      const sfProject = await SfProjectJson.create();
      return (sfProject.get('oauthLocalPort') as number) || WebOAuthServer.DEFAULT_PORT;
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
      const handler = (): void => {
        this.logger.debug(`OAuth web login service listening on port: ${this.webServer.port}`);
        this.executeOauthRequest()
          .then(async (response) => {
            try {
              // Link client app to an existing auth file.
              if (this.clientApp) {
                const authInfo = await AuthInfo.create({
                  oauth2Options: this.oauthConfig,
                  oauth2: this.oauth2,
                });
                const authFields = authInfo.getFields(true);

                // get user authInfo and save client app creds in `clientApps`
                const userAuthInfo = await AuthInfo.create({
                  username: this.username,
                });

                const decryptedCopy = userAuthInfo.getFields(true);

                if (decryptedCopy.clientApps && this.clientApp in decryptedCopy.clientApps) {
                  throw new SfError(
                    `The username ${this.username ?? '<undefined>'} is already linked to a client app named "${
                      this.clientApp
                    }". Please authenticate again with a different client app name.`
                  );
                }

                await userAuthInfo.save({
                  clientApps: {
                    ...userAuthInfo.getFields(true).clientApps,
                    [this.clientApp]: {
                      clientId: ensureString(authFields.clientId),
                      clientSecret: authFields.clientSecret,
                      accessToken: ensureString(authFields.accessToken),
                      refreshToken: ensureString(authFields.refreshToken),
                      oauthFlow: 'web',
                    },
                  },
                });

                await this.webServer.handleSuccess(response);
                response.end();
                resolve(authInfo);
              } else {
                // new auth, create new file.
                const authInfo = await AuthInfo.create({
                  oauth2Options: this.oauthConfig,
                  oauth2: this.oauth2,
                });
                await authInfo.save();
                await this.webServer.handleSuccess(response);
                response.end();
                resolve(authInfo);
              }
            } catch (err) {
              this.oauthError = err as Error;
              await this.webServer.handleError(response);
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
      if (this.webServer.server.listening) {
        handler();
      } else {
        this.webServer.server.once('listening', handler);
      }
    });
  }

  /**
   * Starts the web server
   */
  public async start(): Promise<void> {
    await this.webServer.start();
  }

  protected async init(): Promise<void> {
    this.logger = await Logger.child(this.constructor.name);
    const port = await WebOAuthServer.determineOauthPort();
    this.oauthConfig.loginUrl ??= AuthInfo.getDefaultInstanceUrl();
    const env = new Env();

    if (env.getBoolean('CODE_BUILDER')) {
      if (this.oauthConfig.clientId && this.oauthConfig.clientId !== CODE_BUILDER_CONNECTED_APP_INFO.clientId) {
        this.logger.warn(messages.getMessage('warn.invalidClientId', [this.oauthConfig.clientId]));
      }
      this.oauthConfig.clientId = CODE_BUILDER_CONNECTED_APP_INFO.clientId;
      const cbStateSha = env.getString('CODE_BUILDER_STATE');
      if (!cbStateSha) {
        throw messages.createError('error.invalidCodeBuilderState');
      }
      this.oauthConfig.state = JSON.stringify({
        PORT: port,
        CODE_BUILDER_STATE: cbStateSha,
      });
      this.oauthConfig.redirectUri = CODE_BUILDER_REDIRECT_URI;
    } else {
      this.oauthConfig.clientId ??= DEFAULT_CONNECTED_APP_INFO.clientId;
      this.oauthConfig.redirectUri ??= `http://localhost:${port}/OauthRedirect`;
    }

    // Unless explicitly turned off, use a code verifier as a best practice
    if (this.oauthConfig.useVerifier !== false) this.oauthConfig.useVerifier = true;

    this.webServer = await WebServer.create({ port });
    this.oauth2 = new OAuth2(this.oauthConfig);
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
      // - async method when sync expected
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      this.webServer.server.on('request', async (request: WebOAuthServer.Request, response) => {
        if (request.url) {
          const url = parseUrl(request.url);
          this.logger.debug(`processing request for uri: ${url.pathname ?? 'null'}`);
          if (request.method === 'GET') {
            if (url.pathname?.startsWith('/OauthRedirect') && url.query) {
              // eslint-disable-next-line no-param-reassign
              request.query = parseQueryString(url.query) as {
                code: string;
                state: string;
                error?: string | undefined;
                error_description?: string;
              };
              if (request.query.error) {
                const errorName: string =
                  typeof request.query.error_description === 'string'
                    ? request.query.error_description
                    : request.query.error;
                this.oauthError = new SfError(errorName, request.query.error);
                await this.webServer.handleError(response);
                return reject(this.oauthError);
              }
              this.logger.debug(`request.query.state: ${request.query.state}`);
              try {
                this.oauthConfig.authCode = asString(this.parseAuthCodeFromRequest(response, request));
                resolve(response);
              } catch (err) {
                reject(err);
              }
            } else if (url.pathname === '/OauthSuccess') {
              this.webServer.reportSuccess(response);
            } else if (url.pathname === '/OauthError') {
              this.webServer.reportError(this.oauthError, response);
            } else if (iconPaths.includes(url.pathname ?? '')) {
              this.logger.debug(`Ignoring request for icon path: ${url.pathname ?? 'null'}`);
            } else {
              this.webServer.sendError(404, 'Resource not found', response);
              const errName = 'invalidRequestUri';
              const errMessage = messages.getMessage(errName, [url.pathname]);
              reject(new SfError(errMessage, errName));
            }
          } else if (
            request.method === 'OPTIONS' &&
            request.headers['access-control-request-private-network'] === 'true' &&
            request.headers['access-control-request-method']
          ) {
            this.webServer.handlePreflightRequest(response);
          } else {
            this.webServer.sendError(405, 'Unsupported http methods', response);
            const errName = 'invalidRequestMethod';
            const errMessage = messages.getMessage(errName, [request.method]);
            reject(new SfError(errMessage, errName));
          }
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
      const error = new SfError('urlStateMismatch');
      this.webServer.sendError(400, error.message, response);
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
        throw messages.createError('missingAuthCode');
      }
      this.logger.debug(`oauthConfig.loginUrl: ${this.oauthConfig.loginUrl ?? '<undefined>'}`);
      this.logger.debug(`oauthConfig.clientId: ${this.oauthConfig.clientId ?? '<undefined>'}`);
      this.logger.debug(`oauthConfig.redirectUri: ${this.oauthConfig.redirectUri ?? '<undefined>'}`);
      this.logger.debug(`oauthConfig.useVerifier: ${this.oauthConfig.useVerifier ?? '<undefined>'}`);
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
  export type Options =
    | {
        oauthConfig: JwtOAuth2Config & {
          /**
           * OAuth scopes to be requested for the access token.
           *
           * This should be a string with each scope separated by spaces:
           * "refresh_token sfap_api chatbot_api web api"
           *
           * If not specified, all scopes assigned to the connected app are requested.
           */
          scope?: string;
        };
      }
    | {
        oauthConfig: JwtOAuth2Config & {
          /**
           * OAuth scopes to be requested for the access token.
           *
           * This should be a string with each scope separated by spaces:
           * "refresh_token sfap_api chatbot_api web api"
           *
           * If not specified, all scopes assigned to the connected app are requested.
           */
          scope?: string;
        };
        clientApp: string;
        username: string;
      };

  export type Request = http.IncomingMessage & {
    query: { code: string; state: string; error?: string; error_description?: string };
  };
}

/**
 * Handles the actions specific to the http server
 */
export class WebServer extends AsyncCreatable<WebServer.Options> {
  public static DEFAULT_CLIENT_SOCKET_TIMEOUT = 20_000;
  public server!: http.Server;
  public port = WebOAuthServer.DEFAULT_PORT;
  public host = 'localhost';
  private logger!: Logger;
  private sockets: Socket[] = [];
  private redirectStatus = new EventEmitter();

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
      if ((err as Error).name === 'EADDRINUSE') {
        throw messages.createError('portInUse', [this.port], [this.port]);
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
   * @param status the statusCode for the response.
   * @param message the message for the http body.
   * @param response the response to write the error to.
   */
  public sendError(status: number, message: string, response: http.ServerResponse): void {
    // eslint-disable-next-line no-param-reassign
    response.statusMessage = message;
    // eslint-disable-next-line no-param-reassign
    response.statusCode = status;
    response.end();
  }

  /**
   * sends a response redirect.
   *
   * @param status the statusCode for the response.
   * @param url the url to redirect to.
   * @param response the response to write the redirect to.
   */
  public doRedirect(status: number, url: string, response: http.ServerResponse): void {
    this.logger.debug(`Redirecting to ${url}`);
    response.setHeader('Content-Type', 'text/plain');
    const body = `${status} - Redirecting to ${url}`;
    response.setHeader('Content-Length', Buffer.byteLength(body));
    response.writeHead(status, { Location: url });
    response.end(body);
  }

  /**
   * sends a response to the browser reporting an error.
   *
   * @param error the oauth error
   * @param response the HTTP response.
   */
  public reportError(error: Error, response: http.ServerResponse): void {
    response.setHeader('Content-Type', 'text/html');
    const currentYear = new Date().getFullYear();
    const encodedImg = messages.getMessage('serverSfdcImage');
    const body = messages.getMessage('serverErrorHTMLResponse', [encodedImg, error.name, error.message, currentYear]);
    response.setHeader('Content-Length', Buffer.byteLength(body, 'utf8'));
    response.end(body);
    if (error.stack) {
      this.logger.debug(error.stack);
    }
    this.redirectStatus.emit('complete');
  }

  /**
   * sends a response to the browser reporting the success.
   *
   * @param response the HTTP response.
   */
  public reportSuccess(response: http.ServerResponse): void {
    response.setHeader('Content-Type', 'text/html');
    const currentYear = new Date().getFullYear();
    const encodedImg = messages.getMessage('serverSfdcImage');
    const body = messages.getMessage('serverSuccessHTMLResponse', [encodedImg, currentYear]);
    response.setHeader('Content-Length', Buffer.byteLength(body, 'utf8'));
    response.end(body);
    this.redirectStatus.emit('complete');
  }

  /**
   * Preflight request:
   *
   * https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request
   * https://www.w3.org/TR/2020/SPSD-cors-20200602/#resource-preflight-requests
   */
  public handlePreflightRequest(response: http.ServerResponse): void {
    // We don't validate the origin here because:
    // 1. The default login URL (login.salesforce.com) will not match after a redirect or if user choose a custom domain in login.
    // 2. There's no fixed list of auth URLs we could check against.
    // eslint-disable-next-line no-param-reassign
    response.statusCode = 204; // No Content response
    response.setHeader('Access-Control-Allow-Methods', 'GET');
    response.setHeader('Access-Control-Request-Headers', 'GET');
    response.end();
  }

  public async handleSuccess(response: http.ServerResponse): Promise<void> {
    return this.handleRedirect(response, '/OauthSuccess');
  }

  public async handleError(response: http.ServerResponse): Promise<void> {
    return this.handleRedirect(response, '/OauthError');
  }

  protected async init(): Promise<void> {
    this.logger = await Logger.child(this.constructor.name);
  }

  private async handleRedirect(response: http.ServerResponse, url: '/OauthSuccess' | '/OauthError'): Promise<void> {
    return new Promise((resolve) => {
      this.redirectStatus.on('complete', () => {
        this.logger.debug('Redirect complete');
        resolve();
      });
      this.doRedirect(303, url, response);
    });
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
        const error = new SfError('timeout', 'SOCKET_TIMEOUT');
        reject(error);
      });

      // An existing connection, means that the port is occupied
      socket.connect(clientConfig, () => {
        socket.destroy();
        const error = new SfError('Address in use', 'EADDRINUSE');
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
  export type Options = {
    port?: number;
    host?: string;
  };
}
