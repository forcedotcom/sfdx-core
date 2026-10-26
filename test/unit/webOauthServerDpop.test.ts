/*
 * Copyright 2026, Salesforce, Inc.
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
import * as http from 'node:http';
import { expect } from 'chai';
import { SinonSpy, SinonStub } from 'sinon';
import { StubbedType, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { MockTestOrgData, shouldThrow, TestContext } from '../../src/testSetup';
import { WebOAuthServer, WebServer } from '../../src/webOAuthServer';
import { AuthInfo } from '../../src/org/authInfo';
import { DpopKey } from '../../src/crypto/dpop';
import { stubDpopKeyStore } from './dpopTestHelpers';

describe('WebOauthServer DPoP', () => {
  const $$ = new TestContext();
  let generateSpy: SinonSpy<Parameters<typeof DpopKey.generate>, ReturnType<typeof DpopKey.generate>>;

  beforeEach(() => {
    stubDpopKeyStore($$.SANDBOX);
    generateSpy = $$.SANDBOX.spy(DpopKey, 'generate');
  });

  describe('getAuthorizationUrl', () => {
    it('binds the authorization request to a freshly generated DPoP key with dpop_jkt', async () => {
      const oauthServer = await WebOAuthServer.create({ oauthConfig: {} });
      const opened = new URL(oauthServer.getAuthorizationUrl());

      expect(generateSpy.calledOnce).to.be.true;
      const dpopKey = await generateSpy.firstCall.returnValue;
      expect(opened.searchParams.get('dpop_jkt')).to.equal(dpopKey.thumbprint);
      expect(opened.searchParams.get('client_id')).to.equal('PlatformCLI');
      expect(opened.searchParams.get('code_challenge')).to.be.a('string').and.not.be.empty;
      expect(opened.searchParams.get('state')).to.be.a('string').and.not.be.empty;
    });

    it('does not generate a key or send dpop_jkt with dpop: false', async () => {
      const oauthServer = await WebOAuthServer.create({ oauthConfig: {}, dpop: false });
      const opened = new URL(oauthServer.getAuthorizationUrl());

      expect(generateSpy.called).to.be.false;
      expect(opened.searchParams.has('dpop_jkt')).to.be.false;
      expect(opened.searchParams.get('code_challenge')).to.be.a('string').and.not.be.empty;
    });

    it('fails closed when DPoP is enabled but no key can be created', async () => {
      generateSpy.restore();
      $$.SANDBOX.stub(DpopKey, 'generate').rejects(new Error('no ES256 signer available'));

      try {
        await shouldThrow(WebOAuthServer.create({ oauthConfig: {} }));
      } catch (e) {
        expect(e).to.have.property('name', 'DpopAuthConfigurationError');
      }
    });
  });

  describe('authorizeAndSave', () => {
    let authInfoStub: StubbedType<AuthInfo>;
    let authStub: SinonStub;

    beforeEach(async () => {
      const authFields = await new MockTestOrgData().getConfig();
      authInfoStub = stubInterface<AuthInfo>($$.SANDBOX, { getFields: () => authFields });
      authStub = stubMethod($$.SANDBOX, AuthInfo, 'create').callsFake(async () => authInfoStub);
      stubMethod($$.SANDBOX, WebServer.prototype, 'doRedirect').callsFake(async () => {});
      stubMethod($$.SANDBOX, WebOAuthServer.prototype, 'executeOauthRequest').callsFake(async () =>
        stubInterface<http.ServerResponse>($$.SANDBOX, {})
      );
    });

    const authorize = async (options: { dpop?: boolean } = {}): Promise<AuthInfo.Options> => {
      const oauthServer = await WebOAuthServer.create({ oauthConfig: {}, ...options });
      await oauthServer.start();
      // @ts-expect-error because private member
      stubMethod($$.SANDBOX, oauthServer.webServer, 'handleSuccess').resolves();
      await oauthServer.authorizeAndSave();
      expect(authInfoStub.save.callCount).to.equal(1);
      expect(authStub.callCount).to.equal(1);
      return authStub.firstCall.args[0] as AuthInfo.Options;
    };

    it('exchanges the code with the same DPoP key used for dpop_jkt', async () => {
      const authCreateOptions = await authorize();

      const dpopKey = await generateSpy.firstCall.returnValue;
      expect(authCreateOptions.dpopKey).to.equal(dpopKey);
      expect(authCreateOptions.oauth2Options).to.have.property('clientId', 'PlatformCLI');
      expect(authCreateOptions.oauth2).to.have.property('codeVerifier');
    });

    it('exchanges the code without a DPoP key with dpop: false', async () => {
      const authCreateOptions = await authorize({ dpop: false });

      expect(authCreateOptions.dpopKey).to.be.undefined;
    });
  });

  describe('authorization errors', () => {
    /** Sends the browser back to the redirect URI with `query`, and returns what authorizeAndSave rejects with. */
    const redirectWithError = async (query: string, options: { dpop?: boolean } = {}): Promise<Error> => {
      const oauthServer = await WebOAuthServer.create({ oauthConfig: {}, ...options });
      await oauthServer.start();
      // @ts-expect-error because private member
      const webServer = oauthServer.webServer;
      const response = { setHeader: () => {}, writeHead: () => {}, end: () => {} } as unknown as http.ServerResponse;
      const origOn = webServer.server.on;
      let requestListener: http.RequestListener;
      stubMethod($$.SANDBOX, webServer.server, 'on').callsFake((event: string, callback: http.RequestListener) => {
        if (event !== 'request') return origOn.call(webServer.server, event, callback);
        requestListener = callback;
        callback(
          { method: 'GET', url: `http://localhost:1717/OauthRedirect?${query}` } as unknown as http.IncomingMessage,
          response
        );
      });
      stubMethod($$.SANDBOX, webServer, 'doRedirect').callsFake(async (_status: number, url: string) => {
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await requestListener(
          { method: 'GET', url: `http://localhost:1717${url}` } as unknown as http.IncomingMessage,
          response
        );
      });
      try {
        await shouldThrow(oauthServer.authorizeAndSave());
      } catch (e) {
        return e as Error;
      }
      throw new Error('unreachable');
    };

    it('explains that the app requires DPoP when a login without DPoP is rejected for it', async () => {
      const error = await redirectWithError(
        'error=invalid_request&error_description=missing+required+dpop_jkt+for+code+binding&state=972475373f51',
        { dpop: false }
      );

      expect(error).to.have.property('name', 'DpopRequiredForLoginError');
    });

    it('keeps other authorization errors from a login without DPoP', async () => {
      const error = await redirectWithError(
        'error=access_denied&error_description=end-user+denied+authorization&state=972475373f51',
        { dpop: false }
      );

      expect(error).to.have.property('name', 'access_denied');
    });
  });
});
