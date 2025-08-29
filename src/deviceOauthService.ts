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
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/ban-types */

import Transport from '@jsforce/jsforce-node/lib/transport';
import { AsyncCreatable, Duration, parseJsonMap, sleep } from '@salesforce/kit';
import { HttpRequest, OAuth2Config } from '@jsforce/jsforce-node';
import { ensureString, isString, JsonMap, Nullable } from '@salesforce/ts-types';
import FormData from 'form-data';
import { Logger } from './logger/logger';
import { AuthInfo, DEFAULT_CONNECTED_APP_INFO } from './org/authInfo';
import { SFDX_HTTP_HEADERS } from './org/connection';
import { SfError } from './sfError';
import { Messages } from './messages';
import { Lifecycle } from './lifecycleEvents';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'auth');

/**
 * @deprecated Will be removed mid January 2026
 */
export type DeviceCodeResponse = {
  device_code: string;
  interval: number;
  user_code: string;
  verification_uri: string;
} & JsonMap;

/**
 * @deprecated Will be removed mid January 2026
 */
export type DeviceCodePollingResponse = {
  access_token: string;
  refresh_token: string;
  signature: string;
  scope: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
} & JsonMap;

type DeviceCodeAuthError = {
  error: string;
  error_description: string;
  status: number;
} & SfError;

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
 * THIS CLASS IS DEPRECATED AND WILL BE REMOVED MID JANUARY 2026.
 *
 * @deprecated Use other oauth flows instead
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
    void Lifecycle.getInstance().emitWarning('Device Oauth flow is deprecated and will be removed mid January 2026');
    this.options = options;
    if (!this.options.clientId) this.options.clientId = DEFAULT_CONNECTED_APP_INFO.clientId;
    if (!this.options.loginUrl) this.options.loginUrl = AuthInfo.getDefaultInstanceUrl();
  }

  /**
   * @deprecated Will be removed mid January 2026
   */
  public async requestDeviceLogin(): Promise<DeviceCodeResponse> {
    const deviceFlowRequestUrl = this.getDeviceFlowRequestUrl();
    const loginOptions = this.getLoginOptions(deviceFlowRequestUrl);
    return makeRequest<DeviceCodeResponse>(loginOptions);
  }

  /**
   * @deprecated Will be removed mid January 2026
   */
  public async awaitDeviceApproval(loginData: DeviceCodeResponse): Promise<Nullable<DeviceCodePollingResponse>> {
    const deviceFlowRequestUrl = this.getDeviceFlowRequestUrl();
    const pollingOptions = this.getPollingOptions(deviceFlowRequestUrl, loginData.device_code);
    const interval = Duration.seconds(loginData.interval).milliseconds;
    return this.pollForDeviceApproval(pollingOptions, interval);
  }

  /**
   * @deprecated Will be removed mid January 2026
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
    this.logger.debug(`this.options.clientId: ${this.options.clientId ?? '<undefined>'}`);
    this.logger.debug(`this.options.loginUrl: ${this.options.loginUrl ?? '<undefined>'}`);
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
