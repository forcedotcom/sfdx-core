/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/ban-types */

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as Transport from 'jsforce/lib/transport';
import { AsyncCreatable, Duration, parseJsonMap } from '@salesforce/kit';
import { OAuth2Options } from 'jsforce';
import { Nullable, ensureString, JsonMap } from '@salesforce/ts-types';
import { Logger } from './logger';
import { AuthInfo, DEFAULT_CONNECTED_APP_INFO } from './org/authInfo';
import { SfdxError } from './sfdxError';
import { SFDX_HTTP_HEADERS } from './org/connection';
import { Messages } from './messages';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/core', 'auth', ['pollingTimeout']);

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

interface DeviceLoginOptions {
  url: string;
  headers: object;
  method: string;
  form: {
    client_id: string;
    response_type: string;
    scope: string;
  };
}

interface DevicePollingOptions {
  url: string;
  headers: object;
  method: string;
  form: {
    client_id: string;
    grant_type: string;
    code: string;
  };
}

async function wait(ms = 1000): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function makeRequest<T extends JsonMap>(options: DeviceLoginOptions | DevicePollingOptions): Promise<T> {
  const rawResponse = await new Transport().httpRequest(options);
  const response = parseJsonMap<T>(rawResponse.body);
  if (response.error) {
    const err = new SfdxError('Request Failed.');
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
export class DeviceOauthService extends AsyncCreatable<OAuth2Options> {
  public static RESPONSE_TYPE = 'device_code';
  public static GRANT_TYPE = 'device';
  public static SCOPE = 'refresh_token web api';
  private static POLLING_COUNT_MAX = 100;

  private logger!: Logger;
  private options: OAuth2Options;
  private pollingCount = 0;

  public constructor(options: OAuth2Options) {
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
    const response = await this.pollForDeviceApproval(pollingOptions, interval);
    return response;
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

  private getLoginOptions(url: string): DeviceLoginOptions {
    return {
      url,
      headers: SFDX_HTTP_HEADERS,
      method: 'POST',
      form: {
        client_id: ensureString(this.options.clientId),
        response_type: DeviceOauthService.RESPONSE_TYPE,
        scope: DeviceOauthService.SCOPE,
      },
    };
  }

  private getPollingOptions(url: string, code: string): DevicePollingOptions {
    return {
      url,
      headers: SFDX_HTTP_HEADERS,
      method: 'POST',
      form: {
        code,
        grant_type: DeviceOauthService.GRANT_TYPE,
        client_id: ensureString(this.options.clientId),
      },
    };
  }

  private getDeviceFlowRequestUrl(): string {
    return `${ensureString(this.options.loginUrl)}/services/oauth2/token`;
  }

  private async poll(pollingOptions: DevicePollingOptions): Promise<Nullable<DeviceCodePollingResponse>> {
    this.logger.debug(
      `polling for device approval (attempt ${this.pollingCount} of ${DeviceOauthService.POLLING_COUNT_MAX})`
    );
    try {
      return await makeRequest<DeviceCodePollingResponse>(pollingOptions);
    } catch (e) {
      const err = e.data;
      if (err.error && err.status === 400 && err.error === 'authorization_pending') {
        // do nothing because we're still waiting
      } else {
        if (err.error && err.error_description) {
          this.logger.error(`Polling error: ${err.error}: ${err.error_description}`);
        } else {
          this.logger.error('Unknown Polling Error:');
          this.logger.error(err);
        }
        throw err;
      }
    }
  }

  private shouldContinuePolling() {
    return this.pollingCount < DeviceOauthService.POLLING_COUNT_MAX;
  }

  private async pollForDeviceApproval(
    pollingOptions: DevicePollingOptions,
    interval: number
  ): Promise<Nullable<DeviceCodePollingResponse>> {
    this.logger.debug('BEGIN POLLING FOR DEVICE APPROVAL');
    let result: Nullable<DeviceCodePollingResponse>;
    while (this.shouldContinuePolling()) {
      result = await this.poll(pollingOptions);
      if (result) {
        this.logger.debug('POLLING FOR DEVICE APPROVAL SUCCESS');
        break;
      } else {
        this.logger.debug(`waiting ${interval} ms...`);
        await wait(interval);
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
