/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import * as http from 'http';
import { expect } from 'chai';

import { assert } from '@salesforce/ts-types';
import { StubbedType, spyMethod, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { Env } from '@salesforce/kit';
import { MockTestOrgData, TestContext } from '../../src/testSetup';
import { SfProjectJson } from '../../src/sfProject';
import { WebOAuthServer, WebServer } from '../../src/webOAuthServer';
import { AuthFields, AuthInfo } from '../../src/org/authInfo';

describe('WebOauthServer', () => {
  const $$ = new TestContext();
  const authCode = 'abc123456';

  describe('determineOauthPort', () => {
    it('should return configured oauth port if it exists', async () => {
      $$.SANDBOX.stub(SfProjectJson.prototype, 'get').withArgs('oauthLocalPort').returns(8080);
      const port = await WebOAuthServer.determineOauthPort();
      expect(port).to.equal(8080);
    });

    it('should return default oauth port if no configured value exists', async () => {
      const port = await WebOAuthServer.determineOauthPort();
      expect(port).to.equal(WebOAuthServer.DEFAULT_PORT);
    });
  });

  describe('getAuthorizationUrl', () => {
    it('should return authorization url', async () => {
      const oauthServer = await WebOAuthServer.create({ oauthConfig: {} });
      const authUrl = oauthServer.getAuthorizationUrl();
      expect(authUrl).to.not.be.undefined;
      expect(authUrl).to.include('client_id=PlatformCLI');
    });
  });

  describe('authorizeAndSave', () => {
    const testData = new MockTestOrgData();
    let authFields: AuthFields;
    let authInfoStub: StubbedType<AuthInfo>;
    let serverResponseStub: StubbedType<http.ServerResponse>;
    let redirectStub: sinon.SinonStub;
    let authStub: sinon.SinonStub;

    beforeEach(async () => {
      authFields = await testData.getConfig();
      authInfoStub = stubInterface<AuthInfo>($$.SANDBOX, {
        getFields: () => authFields,
      });
      serverResponseStub = stubInterface<http.ServerResponse>($$.SANDBOX, {});

      authStub = stubMethod($$.SANDBOX, AuthInfo, 'create').callsFake(async () => authInfoStub);
    });

    it('should save new AuthInfo', async () => {
      redirectStub = stubMethod($$.SANDBOX, WebServer.prototype, 'doRedirect').callsFake(async () => {});
      stubMethod($$.SANDBOX, WebOAuthServer.prototype, 'executeOauthRequest').callsFake(async () => serverResponseStub);
      const oauthServer = await WebOAuthServer.create({ oauthConfig: {} });
      await oauthServer.start();
      // @ts-expect-error because private member
      const handleSuccessStub = stubMethod($$.SANDBOX, oauthServer.webServer, 'handleSuccess').resolves();
      const authInfo = await oauthServer.authorizeAndSave();
      expect(authInfoStub.save.callCount).to.equal(1);
      expect(authInfo.getFields()).to.deep.equal(authFields);
      expect(handleSuccessStub.calledOnce).to.be.true;
    });

    it('should redirect and handle /OauthSuccess on success', async () => {
      const oauthServer = await WebOAuthServer.create({ oauthConfig: {} });
      const validateStateStub = stubMethod($$.SANDBOX, oauthServer, 'validateState').returns(true);
      await oauthServer.start();

      // @ts-expect-error because private member
      const webServer = oauthServer.webServer;
      const reportSuccessSpy = spyMethod($$.SANDBOX, webServer, 'reportSuccess');

      const origOn = webServer.server.on;
      let requestListener: http.RequestListener;
      stubMethod($$.SANDBOX, webServer.server, 'on').callsFake((event, callback) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-argument
        if (event !== 'request') return origOn.call(webServer.server, event, callback);
        requestListener = callback;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        callback(
          {
            method: 'GET',
            url: `http://localhost:1717/OauthRedirect?code=${authCode}&state=972475373f51`,
            query: { code: authCode },
          },
          {
            setHeader: () => {},
            writeHead: () => {},
            end: () => {},
          }
        );
      });

      // stub the redirect to ensure proper redirect handling and the web server is closed.
      redirectStub = stubMethod($$.SANDBOX, webServer, 'doRedirect').callsFake(async (status, url, response) => {
        expect(status).to.equal(303);
        expect(url).to.equal('/OauthSuccess');
        expect(response).to.be.ok;
        await requestListener(
          // @ts-expect-error
          { method: 'GET', url: `http://localhost:1717${url}` },
          {
            setHeader: () => {},
            writeHead: () => {},
            end: () => {},
          }
        );
      });

      const authInfo = await oauthServer.authorizeAndSave();
      expect(authInfo.getFields()).to.deep.equal(authFields);
      expect(redirectStub.callCount).to.equal(1);
      expect(validateStateStub.callCount).to.equal(1);
      expect(reportSuccessSpy.callCount).to.equal(1);
    });

    it('should redirect and handle /OauthError on error', async () => {
      const oauthServer = await WebOAuthServer.create({ oauthConfig: {} });
      const validateStateStub = stubMethod($$.SANDBOX, oauthServer, 'validateState').returns(true);
      await oauthServer.start();

      // @ts-expect-error because private member
      const webServer = oauthServer.webServer;
      const reportErrorSpy = spyMethod($$.SANDBOX, webServer, 'reportError');

      const authError = new Error('BAD ERROR');
      authStub.rejects(authError);

      const origOn = webServer.server.on;
      let requestListener: http.RequestListener;
      stubMethod($$.SANDBOX, webServer.server, 'on').callsFake((event, callback) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-argument
        if (event !== 'request') return origOn.call(webServer.server, event, callback);
        requestListener = callback;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        callback(
          {
            method: 'GET',
            url: `http://localhost:1717/OauthRedirect?code=${authCode}&state=972475373f51`,
            query: { code: authCode },
          },
          {
            setHeader: () => {},
            writeHead: () => {},
            end: () => {},
          }
        );
      });

      // stub the redirect to ensure proper redirect handling and the web server is closed.
      redirectStub = stubMethod($$.SANDBOX, webServer, 'doRedirect').callsFake(async (status, url, response) => {
        expect(status).to.equal(303);
        expect(url).to.equal('/OauthError');
        expect(response).to.be.ok;
        await requestListener(
          // @ts-expect-error
          { method: 'GET', url: `http://localhost:1717${url}` },
          {
            setHeader: () => {},
            writeHead: () => {},
            end: () => {},
          }
        );
      });

      try {
        await oauthServer.authorizeAndSave();
        assert(false, 'authorizeAndSave should fail');
      } catch (e) {
        expect((e as Error).message, 'BAD ERROR');
      }
      expect(authStub.callCount).to.equal(1);
      expect(redirectStub.callCount).to.equal(1);
      expect(validateStateStub.callCount).to.equal(1);
      expect(reportErrorSpy.callCount).to.equal(1);
      expect(reportErrorSpy.args[0][0]).to.equal(authError);
    });
  });

  it('should error if postback has error', async () => {
    const oauthServer = await WebOAuthServer.create({ oauthConfig: {} });
    await oauthServer.start();

    // @ts-expect-error because private member
    const webServer = oauthServer.webServer;
    const endSpy = $$.SANDBOX.spy();

    const origOn = webServer.server.on;
    let requestListener: http.RequestListener;
    stubMethod($$.SANDBOX, webServer.server, 'on').callsFake((event, callback) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-argument
      if (event !== 'request') return origOn.call(webServer.server, event, callback);
      requestListener = callback;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      callback(
        {
          method: 'GET',
          url: 'http://localhost:1717/OauthRedirect?error=access_denied&error_description=end-user+denied+authorization&state=972475373f51',
        },
        {
          setHeader: () => {},
          writeHead: () => {},
          end: endSpy,
        }
      );
    });

    // stub the redirect to ensure proper redirect handling and the web server is closed.
    stubMethod($$.SANDBOX, webServer, 'doRedirect').callsFake(async (status, url, response) => {
      expect(status).to.equal(303);
      expect(url).to.equal('/OauthError');
      expect(response).to.be.ok;
      await requestListener(
        // @ts-expect-error
        { method: 'GET', url: `http://localhost:1717${url}` },
        {
          setHeader: () => {},
          writeHead: () => {},
          end: endSpy,
        }
      );
    });

    try {
      await oauthServer.authorizeAndSave();
      assert(false, 'should reject');
    } catch (err) {
      expect((err as Error).name).to.equal('access_denied');
    }
    expect(endSpy.args[0][0]).contain('end-user denied authorization');
  });

  describe('parseAuthCodeFromRequest', () => {
    let serverResponseStub: StubbedType<http.ServerResponse>;
    let serverRequestStub: StubbedType<WebOAuthServer.Request>;

    beforeEach(async () => {
      serverResponseStub = stubInterface<http.ServerResponse>($$.SANDBOX, {});
      serverRequestStub = stubInterface<WebOAuthServer.Request>($$.SANDBOX, {
        query: { code: authCode },
      });
    });

    it('should return auth code from the request', async () => {
      stubMethod($$.SANDBOX, WebOAuthServer.prototype, 'validateState').returns(true);
      const oauthServer = await WebOAuthServer.create({ oauthConfig: {} });
      // @ts-expect-error because private member
      const code = oauthServer.parseAuthCodeFromRequest(serverResponseStub, serverRequestStub);
      expect(code).to.equal(authCode);
    });

    it('should close the request when state is not valid', async () => {
      stubMethod($$.SANDBOX, WebOAuthServer.prototype, 'validateState').returns(false);
      const closeStub = stubMethod($$.SANDBOX, WebOAuthServer.prototype, 'closeRequest').returns(null);
      const sendErrorStub = stubMethod($$.SANDBOX, WebServer.prototype, 'sendError').returns(null);
      const oauthServer = await WebOAuthServer.create({ oauthConfig: {} });
      // @ts-expect-error because private member
      oauthServer.parseAuthCodeFromRequest(serverResponseStub, serverRequestStub);
      expect(closeStub.callCount).to.equal(1);
      expect(sendErrorStub.callCount).to.equal(1);
    });
  });

  describe('validateState', () => {
    it('should return false when state params do not match', async () => {
      const serverRequestStub = stubInterface<WebOAuthServer.Request>($$.SANDBOX, {
        query: { state: 'abc123456' },
      });
      const oauthServer = await WebOAuthServer.create({ oauthConfig: {} });
      // @ts-expect-error because private member
      const actual = oauthServer.validateState(serverRequestStub);
      expect(actual).to.equal(false);
    });

    it('should return true when state params do match', async () => {
      const serverRequestStub = stubInterface<WebOAuthServer.Request>($$.SANDBOX, {
        query: { state: 'abc123456' },
      });
      const oauthServer = await WebOAuthServer.create({ oauthConfig: {} });
      // @ts-expect-error because private member
      oauthServer.authUrl = 'http://login.salesforce.com?state=abc123456';
      // @ts-expect-error because private member
      const actual = oauthServer.validateState(serverRequestStub);
      expect(actual).to.equal(true);
    });
  });
});

describe('WebServer', () => {
  const $$ = new TestContext();
  describe('checkOsPort', () => {
    it('should return the port if port is not in use', async () => {
      const server = await WebServer.create({});
      // @ts-expect-error because private member
      const port = await server.checkOsPort();
      expect(port).to.equal(WebOAuthServer.DEFAULT_PORT);
    });

    it('should throw an error if the port is in use', async () => {
      const existingServer = await WebServer.create({});
      await existingServer.start();
      const newServer = await WebServer.create({});
      try {
        // @ts-expect-error because private member
        await newServer.checkOsPort();
      } catch (err) {
        expect((err as Error).name).to.include('EADDRINUSE');
      } finally {
        existingServer.close();
      }
    });

    it('should throw an error if it times out', async () => {
      stubMethod($$.SANDBOX, WebServer.prototype, 'getSocketTimeout').returns(0);
      const server = await WebServer.create({});
      try {
        // @ts-expect-error because private member
        await server.checkOsPort();
      } catch (err) {
        expect((err as Error).name).to.include('SOCKET_TIMEOUT');
      }
    });
  });

  describe('getSocketTimeout', () => {
    it('should return default timeout when env var does not exist', async () => {
      const server = await WebServer.create({});
      // @ts-expect-error because private member
      const timeout = server.getSocketTimeout();
      expect(timeout).to.equal(WebServer.DEFAULT_CLIENT_SOCKET_TIMEOUT);
    });

    it('should return env var value for timeout when env var does exist', async () => {
      stubMethod($$.SANDBOX, Env.prototype, 'getNumber').returns(5000);
      const server = await WebServer.create({});
      // @ts-expect-error because private member
      const timeout = server.getSocketTimeout();
      expect(timeout).to.equal(5000);
    });

    it('should return default timeout when env var is invalid value', async () => {
      stubMethod($$.SANDBOX, Env.prototype, 'getNumber').returns('foo');
      const server = await WebServer.create({});
      // @ts-expect-error because private member
      const timeout = server.getSocketTimeout();
      expect(timeout).to.equal(WebServer.DEFAULT_CLIENT_SOCKET_TIMEOUT);
    });

    it('should return default timeout when env var is 0', async () => {
      stubMethod($$.SANDBOX, Env.prototype, 'getNumber').returns(0);
      const server = await WebServer.create({});
      // @ts-expect-error because private member
      const timeout = server.getSocketTimeout();
      expect(timeout).to.equal(WebServer.DEFAULT_CLIENT_SOCKET_TIMEOUT);
    });
  });
});
