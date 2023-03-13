/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Transport } from 'jsforce/lib/transport';
import { StubbedType, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { expect } from 'chai';
import { MockTestOrgData, TestContext } from '../../src/testSetup';
import { DeviceOauthService } from '../../src/deviceOauthService';
import { AuthFields, AuthInfo, DEFAULT_CONNECTED_APP_INFO, SFDX_HTTP_HEADERS } from '../../src/org';

const deviceCodeResponse = {
  device_code: '1234',
  interval: 0,
  user_code: '1234',
  verification_uri: 'https://login.salesforce.com',
};

const devicePollingResponse = {
  access_token: '1234',
  refresh_token: '1234',
  signature: '1234',
  scope: '1234',
  instance_url: 'https://login.salesforce.com',
  id: '1234',
  token_type: '1234',
  issued_at: '1234',
};

type UnknownError = {
  error: string;
  status: number;
  error_description: string;
};

describe('DeviceOauthService', () => {
  const $$ = new TestContext();

  describe('init', () => {
    it('should use the provided client id', async () => {
      const service = await DeviceOauthService.create({ clientId: 'CoffeeBeans' });
      // @ts-expect-error because private member
      expect(service.options.clientId).to.equal('CoffeeBeans');
    });

    it('should use default client id if not provided', async () => {
      const service = await DeviceOauthService.create({});
      // @ts-expect-error because private member
      expect(service.options.clientId).to.equal(DEFAULT_CONNECTED_APP_INFO.clientId);
    });

    it('should use the provided login url', async () => {
      const service = await DeviceOauthService.create({ loginUrl: 'https://login.example.com' });
      // @ts-expect-error because private member
      expect(service.options.loginUrl).to.equal('https://login.example.com');
    });

    it('should use default login url if not provided', async () => {
      const service = await DeviceOauthService.create({});
      // @ts-expect-error because private member
      expect(service.options.loginUrl).to.equal('https://login.salesforce.com');
    });
  });

  describe('requestDeviceLogin', () => {
    it('should return the device code response', async () => {
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').returns(
        Promise.resolve({ body: JSON.stringify(deviceCodeResponse) })
      );
      const service = await DeviceOauthService.create({});
      const login = await service.requestDeviceLogin();
      expect(login).to.deep.equal(deviceCodeResponse);
    });
  });

  describe('awaitDeviceApproval', () => {
    it('should return the device polling response', async () => {
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').returns(
        Promise.resolve({ body: JSON.stringify(devicePollingResponse) })
      );
      const service = await DeviceOauthService.create({});
      const approval = await service.awaitDeviceApproval(deviceCodeResponse);
      expect(approval).to.deep.equal(devicePollingResponse);
    });

    it('should continue polling if request returns authorization_pending error', async () => {
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest')
        .onFirstCall()
        .returns(
          Promise.resolve({
            statusCode: 400,
            body: JSON.stringify({ error: 'authorization_pending' }),
          })
        )
        .onSecondCall()
        .returns(Promise.resolve({ body: JSON.stringify(devicePollingResponse) }));
      const shouldContinuePollingStub = stubMethod($$.SANDBOX, DeviceOauthService.prototype, 'shouldContinuePolling')
        .onFirstCall()
        .returns(true)
        .onSecondCall()
        .returns(true)
        .onThirdCall()
        .returns(false);
      const service = await DeviceOauthService.create({});
      const approval = await service.awaitDeviceApproval(deviceCodeResponse);
      expect(approval).to.deep.equal(devicePollingResponse);
      expect(shouldContinuePollingStub.callCount).to.equal(2);
    });

    it('should stop polling if max attempts reached', async () => {
      const service = await DeviceOauthService.create({});
      // @ts-expect-error because private member
      service.pollingCount = DeviceOauthService.POLLING_COUNT_MAX + 1;
      try {
        await service.awaitDeviceApproval(deviceCodeResponse);
      } catch (err) {
        expect((err as Error).name).to.equal('PollingTimeoutError');
      }
    });

    it('should stop polling if unknown error from server', async () => {
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').callsFake(async () => ({
        statusCode: 401,
        body: JSON.stringify({ error: 'UnknownError' }),
      }));
      const service = await DeviceOauthService.create({});
      try {
        await service.awaitDeviceApproval(deviceCodeResponse);
      } catch (err) {
        // @ts-expect-error: because private member
        expect(service.pollingCount).to.equal(0);
        expect((err as UnknownError).status).to.equal(401);
      }
    });

    it('should stop polling if error from server', async () => {
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').callsFake(async () => ({
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid grant type',
          error_description: 'Invalid grant type',
        }),
      }));
      const service = await DeviceOauthService.create({});
      try {
        await service.awaitDeviceApproval(deviceCodeResponse);
      } catch (err) {
        // @ts-expect-error: because private member
        expect(service.pollingCount).to.equal(0);
        const error = err as UnknownError;
        expect(error.status).to.equal(400);
        expect(error.error_description).to.equal('Invalid grant type');
      }
    });
  });

  describe('authorizeAndSave', () => {
    const testData = new MockTestOrgData();
    let authFields: AuthFields;
    let authInfoStub: StubbedType<AuthInfo>;

    beforeEach(async () => {
      authFields = await testData.getConfig();
      authInfoStub = stubInterface<AuthInfo>($$.SANDBOX, {
        getFields: () => authFields,
      });

      stubMethod($$.SANDBOX, AuthInfo, 'create').returns(Promise.resolve(authInfoStub));
    });

    it('should return the created AuthInfo', async () => {
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').returns(
        Promise.resolve({ body: JSON.stringify(devicePollingResponse) })
      );
      const service = await DeviceOauthService.create({});
      const authInfo = await service.authorizeAndSave(devicePollingResponse);
      expect(authInfoStub.save.callCount).to.equal(1);
      expect(authInfo.getFields()).to.deep.equal(authFields);
    });
  });

  describe('getLoginOptions', () => {
    it('should return the configuration for the login request', async () => {
      const url = 'https://login.salesforce.com/services/oauth2/token';
      const service = await DeviceOauthService.create({});
      // @ts-expect-error because private method
      const opts = service.getLoginOptions(url);
      expect(opts.url).to.equal(url);
      if (!opts.headers) throw new Error('headers should be defined');
      expect(opts.headers['content-type']).to.include('multipart/form-data; boundary=');
      expect(opts.headers['user-agent']).to.equal(SFDX_HTTP_HEADERS['user-agent']);
      expect(opts.method).to.equal('POST');
      expect(opts.body?.toString()).to.include('client_id');
      expect(opts.body?.toString()).to.include('PlatformCLI');
      expect(opts.body?.toString()).to.include('response_type');
      expect(opts.body?.toString()).to.include('device_code');
      expect(opts.body?.toString()).to.include('refresh_token');
    });
  });

  describe('getPollingOptions', () => {
    it('should return the configuration for the login request', async () => {
      const url = 'https://login.salesforce.com/services/oauth2/token';
      const service = await DeviceOauthService.create({});
      // @ts-expect-error because private method
      const opts = service.getPollingOptions(url, '12345');
      expect(opts.url).to.equal(url);
      if (!opts.headers) throw new Error('Expected headers to be defined');
      expect(opts.headers['content-type']).to.include('multipart/form-data; boundary=');
      expect(opts.headers['user-agent']).to.equal(SFDX_HTTP_HEADERS['user-agent']);
      expect(opts.method).to.equal('POST');
      expect(opts.body?.toString()).to.include('client_id');
      expect(opts.body?.toString()).to.include('PlatformCLI');
      expect(opts.body?.toString()).to.include('grant_type');
      expect(opts.body?.toString()).to.include('grant_type');
      expect(opts.body?.toString()).to.include('device');
      expect(opts.body?.toString()).to.include('code');
      expect(opts.body?.toString()).to.include('12345');
    });
  });
});
