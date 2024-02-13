/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/ban-types */

import Transport from 'jsforce/lib/transport';
import { AsyncCreatable, Duration, parseJsonMap, sleep } from '@salesforce/kit';
import { HttpRequest, OAuth2Config } from 'jsforce';
import { ensureString, isString, JsonMap, Nullable } from '@salesforce/ts-types';
import FormData from 'form-data';
import { Logger } from './logger/logger';
import { AuthInfo, DEFAULT_CONNECTED_APP_INFO } from './org/authInfo';
import { SFDX_HTTP_HEADERS } from './org/connection';
import { SfError } from './sfError';
import { Messages } from './messages';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'auth');

export interface DeviceCodeResponse extends JsonMap {
  device_code: string;
  interval: number;
  user_code: string;
  verification_uri: string;
}

export interface DeviceCodePollingResponse extends JsonMap {
  access_token: string;
  refresh_token: string;
  signature: string;
  scope: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
}

interface DeviceCodeAuthError extends SfError {
  error: string;
  error_description: string;
  status: number;
}

async function makeRequest<T extends JsonMap>(options: HttpRequest): Promise<T> {
  const rawResponse = await new Transport().httpRequest(options);

  if (rawResponse?.headers?.['content-type'] === 'text/html') {
    const htmlResponseError = messages.createError('error.HttpApi');
    htmlResponseError.setData(rawResponse.body);
    throw htmlResponseError;
  }

  const response = parseJsonMap<T>(rawResponse.body);

  if (response.error) {
    const errorDescription = typeof response.error_description === 'string' ? response.error_description : '';
    const error = typeof response.error === 'string' ? response.error : 'Unknown';
    const err = new SfError(`Request Failed: ${error} ${errorDescription}`);
    err.data = Object.assign(response, { status: rawResponse.statusCode });
    throw err;
  } else {
    return response;
  }
}

/**
 * Handles device based login flows
 *
 * Usage:
 * ```
 * const oauthConfig = {
 *   loginUrl: this.flags.instanceurl,
 *   clientId: this.flags.clientid,
 * };
 * const deviceOauthService = await DeviceOauthService.create(oauthConfig);
 * const loginData = await deviceOauthService.requestDeviceLogin();
 * console.log(loginData);
 * const approval = await deviceOauthService.awaitDeviceApproval(loginData);
 * const authInfo = await deviceOauthService.authorizeAndSave(approval);
 * ```
 */
export class DeviceOauthService extends AsyncCreatable<OAuth2Config> {
  public static RESPONSE_TYPE = 'device_code';
  public static GRANT_TYPE = 'device';
  public static SCOPE = 'refresh_token web api';
  private static POLLING_COUNT_MAX = 100;

  private logger!: Logger;
  private options: OAuth2Config;
  private pollingCount = 0;

  public constructor(options: OAuth2Config) {
    super(options);
    this.options = options;
    if (!this.options.clientId) this.options.clientId = DEFAULT_CONNECTED_APP_INFO.clientId;
    if (!this.options.loginUrl) this.options.loginUrl = AuthInfo.getDefaultInstanceUrl();
  }

  /**
   * Begin the authorization flow by requesting the login
   *
   * @returns {Promise<DeviceCodeResponse>}
   */
  public async requestDeviceLogin(): Promise<DeviceCodeResponse> {
    const deviceFlowRequestUrl = this.getDeviceFlowRequestUrl();
    const loginOptions = this.getLoginOptions(deviceFlowRequestUrl);
    return makeRequest<DeviceCodeResponse>(loginOptions);
  }

  /**
   * Polls the server until successful response OR max attempts have been made
   *
   * @returns {Promise<Nullable<DeviceCodePollingResponse>>}
   */
  public async awaitDeviceApproval(loginData: DeviceCodeResponse): Promise<Nullable<DeviceCodePollingResponse>> {
    const deviceFlowRequestUrl = this.getDeviceFlowRequestUrl();
    const pollingOptions = this.getPollingOptions(deviceFlowRequestUrl, loginData.device_code);
    const interval = Duration.seconds(loginData.interval).milliseconds;
    return this.pollForDeviceApproval(pollingOptions, interval);
  }

  /**
   * Creates and saves new AuthInfo
   *
   * @returns {Promise<AuthInfo>}
   */
  public async authorizeAndSave(approval: DeviceCodePollingResponse): Promise<AuthInfo> {
    const authInfo = await AuthInfo.create({
      oauth2Options: {
        loginUrl: approval.instance_url,
        refreshToken: approval.refresh_token,
        clientSecret: this.options.clientSecret,
        clientId: this.options.clientId,
      },
    });
    await authInfo.save();
    return authInfo;
  }

  protected async init(): Promise<void> {
    this.logger = await Logger.child(this.constructor.name);
    this.logger.debug(`this.options.clientId: ${this.options.clientId}`);
    this.logger.debug(`this.options.loginUrl: ${this.options.loginUrl}`);
  }

  private getLoginOptions(url: string): HttpRequest {
    const form = new FormData();
    form.append('client_id', ensureString(this.options.clientId));
    form.append('response_type', DeviceOauthService.RESPONSE_TYPE);
    form.append('scope', DeviceOauthService.SCOPE);
    return {
      url,
      headers: { ...SFDX_HTTP_HEADERS, ...form.getHeaders() },
      method: 'POST',
      body: form.getBuffer(),
    };
  }

  private getPollingOptions(url: string, code: string): HttpRequest {
    const form = new FormData();
    form.append('client_id', ensureString(this.options.clientId));
    form.append('grant_type', DeviceOauthService.GRANT_TYPE);
    form.append('code', code);
    return {
      url,
      headers: { ...SFDX_HTTP_HEADERS, ...form.getHeaders() },
      method: 'POST',
      body: form.getBuffer(),
    };
  }

  private getDeviceFlowRequestUrl(): string {
    return `${ensureString(this.options.loginUrl)}/services/oauth2/token`;
  }

  private async poll(httpRequest: HttpRequest): Promise<Nullable<DeviceCodePollingResponse>> {
    this.logger.debug(
      `polling for device approval (attempt ${this.pollingCount} of ${DeviceOauthService.POLLING_COUNT_MAX})`
    );
    try {
      return await makeRequest<DeviceCodePollingResponse>(httpRequest);
    } catch (e: unknown) {
      if (e instanceof SfError && e.name === 'HttpApiError') {
        throw e;
      }

      const err = (e instanceof SfError ? e.data : SfError.wrap(isString(e) ? e : 'unknown').data) as
        | DeviceCodeAuthError
        | undefined;
      if (err?.error && err?.status === 400 && err?.error === 'authorization_pending') {
        // do nothing because we're still waiting
      } else {
        if (err?.error && err?.error_description) {
          this.logger.error(`Polling error: ${err.error}: ${err.error_description}`);
        } else {
          this.logger.error('Unknown Polling Error:');
          this.logger.error(err ?? e);
        }
        throw err ?? e;
      }
    }
  }

  private shouldContinuePolling(): boolean {
    return this.pollingCount < DeviceOauthService.POLLING_COUNT_MAX;
  }

  private async pollForDeviceApproval(
    httpRequest: HttpRequest,
    interval: number
  ): Promise<Nullable<DeviceCodePollingResponse>> {
    this.logger.debug('BEGIN POLLING FOR DEVICE APPROVAL');
    let result: Nullable<DeviceCodePollingResponse>;
    while (this.shouldContinuePolling()) {
      // eslint-disable-next-line no-await-in-loop
      result = await this.poll(httpRequest);
      if (result) {
        this.logger.debug('POLLING FOR DEVICE APPROVAL SUCCESS');
        break;
      } else {
        this.logger.debug(`waiting ${interval} ms...`);
        // eslint-disable-next-line no-await-in-loop
        await sleep(interval);
        this.pollingCount += 1;
      }
    }

    if (this.pollingCount >= DeviceOauthService.POLLING_COUNT_MAX) {
      // stop polling, the user has likely abandoned the command...
      this.logger.error(`Polling timed out because max polling was hit: ${this.pollingCount}`);
      throw messages.createError('pollingTimeout');
    }

    return result;
  }
}
