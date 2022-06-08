/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/ban-types */

import * as dns from 'dns';
import * as jwt from 'jsonwebtoken';
import { cloneJson, includes } from '@salesforce/kit';
import { stubMethod, spyMethod } from '@salesforce/ts-sinon';
import { AnyJson, ensureString, getJsonMap, getString, JsonMap, toJsonMap } from '@salesforce/ts-types';
import { assert, expect } from 'chai';
import { Transport } from 'jsforce/lib/transport';

import { OAuth2 } from 'jsforce';
import { SinonSpy, SinonStub } from 'sinon';
import { AuthFields, AuthInfo } from '../../../src/org';
import { MockTestOrgData, testSetup } from '../../../src/testSetup';
import { OrgConfigProperties } from '../../../src/org/orgConfigProperties';
import { OrgAccessor } from '../../../src/stateAggregator';
import { Crypto } from '../../../src/crypto/crypto';

class AuthInfoMockOrg extends MockTestOrgData {
  public privateKey = 'authInfoTest/jwt/server.key';
  public defaultConnectedAppInfo = {
    clientId: 'SalesforceDevelopmentExperience',
    clientSecret: '1384510088588713504',
  };

  public async getConfig(): Promise<AuthFields> {
    return {
      accessToken: this.accessToken,
      clientId: this.clientId,
      instanceUrl: this.instanceUrl,
      loginUrl: this.loginUrl,
      privateKey: this.privateKey,
      username: this.username,
    };
  }
}

describe.only('AuthInfo', () => {
  // Setup the test environment.
  const $$ = testSetup();

  let testOrg: AuthInfoMockOrg;

  let postParamsStub: SinonStub;
  let orgAccessorReadSpy: SinonSpy;
  let authInfoStubs = {} as Record<string, SinonSpy | SinonStub>;

  // Walk an object deeply looking for the attribute name of clientSecret or values that contain the client secret
  // or decrypted refresh token.
  const walkAndSearchForSecrets = (obj: JsonMap, decryptedRefreshToken: string) => {
    const keys = Object.keys(obj);
    keys.forEach((key: string) => {
      const child = getJsonMap(obj, key);
      if (child) {
        walkAndSearchForSecrets(child, decryptedRefreshToken);
      }
      const keyUpper = key.toUpperCase();

      // If the key is likely a clientSecret "ish" attribute and the value is a string.
      // reminder:'clientSecretFn' is always legit.
      if (keyUpper.includes('SECRET') && keyUpper.includes('CLIENT') && getString(obj, key)) {
        throw new Error('Key indicates client secret.');
      }

      if (includes(getJsonMap(obj, key), testOrg.defaultConnectedAppInfo.clientSecret)) {
        throw new Error(`Client secret present as value in object with key: ${key}`);
      }

      if (includes(getJsonMap(obj, key), decryptedRefreshToken)) {
        throw new Error(`Refresh token present as value in object with key: ${key}`);
      }
    });
  };

  const stubUserRequest = (): SinonStub => {
    const userInfoResponseBody = {
      body: JSON.stringify({ preferred_username: testOrg.username, organization_id: testOrg.orgId }),
    };
    const userResponseBody = {
      body: JSON.stringify({ Username: testOrg.username.toUpperCase() }),
    };
    return stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest')
      .onFirstCall()
      .resolves(userInfoResponseBody)
      .onSecondCall()
      .resolves(userResponseBody);
  };

  beforeEach(async () => {
    testOrg = new AuthInfoMockOrg();

    postParamsStub = stubMethod($$.SANDBOX, OAuth2.prototype, '_postParams');

    orgAccessorReadSpy = spyMethod($$.SANDBOX, OrgAccessor.prototype, 'read');

    authInfoStubs = {
      initAuthOptions: spyMethod($$.SANDBOX, AuthInfo.prototype, 'initAuthOptions'),
      update: spyMethod($$.SANDBOX, AuthInfo.prototype, 'update'),
      authJwt: spyMethod($$.SANDBOX, AuthInfo.prototype, 'authJwt'),
      buildRefreshTokenConfig: spyMethod($$.SANDBOX, AuthInfo.prototype, 'buildRefreshTokenConfig'),
      exchangeToken: spyMethod($$.SANDBOX, AuthInfo.prototype, 'exchangeToken'),
    };
  });

  describe('Secret Tests', () => {
    let authInfo: AuthInfo;
    let decryptedRefreshToken: string;

    beforeEach(async () => {
      const oauth2Options = { authCode: testOrg.authcode, loginUrl: testOrg.loginUrl };
      const authResponse = {
        access_token: testOrg.accessToken,
        instance_url: testOrg.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        refresh_token: testOrg.refreshToken,
      };

      // Stub the http requests (OAuth2.requestToken() and the request for the username)
      postParamsStub.returns(Promise.resolve(authResponse));
      stubUserRequest();
      authInfo = await AuthInfo.create({ oauth2Options });

      decryptedRefreshToken = authInfo.getFields(true).refreshToken;
    });

    describe('getFields', () => {
      it('return value should not have a client secret or decrypted refresh token', () => {
        const fields = authInfo.getFields();
        const strObj = JSON.stringify(fields);
        // verify the returned object doesn't have secrets
        expect(() => walkAndSearchForSecrets(toJsonMap(fields) || {}, decryptedRefreshToken)).to.not.throw();

        expect(strObj).does.not.include(ensureString(testOrg.defaultConnectedAppInfo.clientSecret));
        expect(strObj).does.not.include(decryptedRefreshToken);
      });
    });

    describe('getOrgFrontDoorUrl', () => {
      it('return front door url', () => {
        const url = authInfo.getOrgFrontDoorUrl();
        const fields = authInfo.getFields(true);
        expect(url).include(fields.accessToken);
        expect(url).include(fields.instanceUrl);
        expect(url).include('/secur/frontdoor');
      });
    });

    describe('getConnectionOptions', () => {
      it('return value should not have a client secret or decrypted refresh token', () => {
        const fields = authInfo.getConnectionOptions();
        const strObj = JSON.stringify(fields);

        // verify the returned object doesn't have secrets
        expect(() => walkAndSearchForSecrets(toJsonMap(fields) || {}, decryptedRefreshToken)).to.not.throw();

        // double check the stringified objects don't have secrets.
        expect(strObj).does.not.include(ensureString(testOrg.defaultConnectedAppInfo.clientSecret));
        expect(strObj).does.not.include(decryptedRefreshToken);
      });
    });

    describe('AuthInfo', () => {
      it('should not have a client secret or decrypted refresh token', () => {
        const authInfoString = JSON.stringify(authInfo);

        // verify the returned object doesn't have secrets
        expect(() => walkAndSearchForSecrets(toJsonMap(authInfo) || {}, decryptedRefreshToken)).to.not.throw();

        // double check the stringified objects don't have secrets.
        expect(authInfoString).does.not.include(ensureString(testOrg.defaultConnectedAppInfo.clientSecret));
        expect(authInfoString).does.not.include(decryptedRefreshToken);
      });
    });
  });

  describe('create()', () => {
    it('should return an AuthInfo instance when passed an access token as username', async () => {
      $$.stubConfig({ [OrgConfigProperties.ORG_INSTANCE_URL]: testOrg.instanceUrl });

      const username =
        '00Dxx0000000001!AQEAQI3AIbublfW11ATFJl9T122vVPj5QaInBp6h9nPsUK8oW4rW5Os0ZjtsUU.DG9rXytUCh3RZvc_XYoRULiHeTMjyi6T1';
      const authInfo = await AuthInfo.create({ username });

      const expectedFields = {
        accessToken: username,
        instanceUrl: testOrg.instanceUrl,
        loginUrl: testOrg.instanceUrl,
      };
      expect(authInfo.getConnectionOptions()).to.deep.equal(expectedFields);
      expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be true').to.be.true;
      expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be false').to.be.false;
      expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
      expect(authInfo.isOauth(), 'authInfo.isOauth() should be false').to.be.false;
    });

    it('should return an AuthInfo instance when passed a parent username', async () => {
      $$.stubConfig({ [OrgConfigProperties.ORG_INSTANCE_URL]: testOrg.instanceUrl });
      // Stub the http request (OAuth2.refreshToken())
      // This will be called for both, and we want to make sure the clientSecret is the
      // same for both.
      postParamsStub.callsFake((params) => {
        expect(params.client_secret).to.deep.equal(testOrg.clientSecret);
        return {
          access_token: testOrg.accessToken,
          instance_url: testOrg.instanceUrl,
          refresh_token: testOrg.refreshToken,
          id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        };
      });

      const parentUsername = 'test@test.com_username_SaveTest1';
      await AuthInfo.create({
        username: parentUsername,
        oauth2Options: {
          clientId: testOrg.clientId,
          clientSecret: testOrg.clientSecret,
          loginUrl: testOrg.instanceUrl,
          authCode: testOrg.authcode,
        },
      });

      const authInfo = await AuthInfo.create({
        username: testOrg.username,
        parentUsername,
        oauth2Options: {
          loginUrl: testOrg.instanceUrl,
          authCode: testOrg.authcode,
        },
      });

      expect(postParamsStub.calledTwice).to.true;
      expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
      expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be false').to.be.true;
      expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
      expect(authInfo.isOauth(), 'authInfo.isOauth() should be true').to.be.true;

      const expectedAuthConfig = {
        accessToken: testOrg.accessToken,
        instanceUrl: testOrg.instanceUrl,
        username: testOrg.username,
        orgId: '00DAuthInfoTest_orgId',
        loginUrl: testOrg.instanceUrl,
        refreshToken: testOrg.refreshToken,
        clientId: testOrg.clientId,
        clientSecret: testOrg.clientSecret,
        isDevHub: false,
      };
      expect(authInfoStubs.update.secondCall.args[0]).to.deep.equal(expectedAuthConfig);
    });

    it('should return an AuthInfo instance when passed an access token and instanceUrl for the access token flow', async () => {
      $$.stubConfig({ [OrgConfigProperties.ORG_INSTANCE_URL]: testOrg.instanceUrl });

      stubUserRequest();

      const accessToken =
        '00Dxx0000000001!AQEAQI3AIbublfW11ATFJl9T122vVPj5QaInBp6h9nPsUK8oW4rW5Os0ZjtsUU.DG9rXytUCh3RZvc_XYoRULiHeTMjyi6T1';
      const authInfo = await AuthInfo.create({
        username: 'test',
        accessTokenOptions: {
          accessToken,
          instanceUrl: testOrg.instanceUrl,
          loginUrl: testOrg.instanceUrl,
        },
      });

      const expectedFields = {
        accessToken,
        instanceUrl: testOrg.instanceUrl,
        loginUrl: testOrg.instanceUrl,
      };
      expect(authInfo.getConnectionOptions()).to.deep.equal(expectedFields);
      expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be true').to.be.true;
      expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be false').to.be.false;
      expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
      expect(authInfo.isOauth(), 'authInfo.isOauth() should be false').to.be.false;
    });

    describe('JWT', () => {
      it('should return a JWT AuthInfo instance when passed a username and JWT auth options', async () => {
        $$.setConfigStubContents('AuthInfoConfig', { contents: await testOrg.getConfig() });
        const jwtConfig = {
          clientId: testOrg.clientId,
          loginUrl: testOrg.loginUrl,
          privateKey: testOrg.privateKey,
        };
        const jwtConfigClone = cloneJson(jwtConfig);
        const authResponse = {
          access_token: testOrg.accessToken,
          instance_url: testOrg.instanceUrl,
          id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        };

        // Stub file I/O, http requests, and the DNS lookup
        const readJwtKey = stubMethod($$.SANDBOX, AuthInfo.prototype, 'readJwtKey').resolves(
          'authInfoTest_private_key'
        );
        postParamsStub.resolves(authResponse);
        stubMethod($$.SANDBOX, jwt, 'sign').resolves('authInfoTest_jwtToken');
        stubMethod($$.SANDBOX, dns, 'lookup').callsFake((url: string, done: (v: AnyJson, w: JsonMap) => {}) =>
          done(null, { address: '1.1.1.1', family: 4 })
        );

        // Create the JWT AuthInfo instance
        const authInfo = await AuthInfo.create({
          username: testOrg.username,
          oauth2Options: jwtConfig,
        });

        // Verify the returned AuthInfo instance
        const authInfoConnOpts = authInfo.getConnectionOptions();
        expect(authInfoConnOpts).to.have.property('accessToken', authResponse.access_token);
        expect(authInfoConnOpts).to.have.property('instanceUrl', authResponse.instance_url);
        expect(authInfoConnOpts).to.have.property('refreshFn').and.is.a('function');
        expect(authInfo.getUsername()).to.equal(testOrg.username);
        expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
        expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be false').to.be.false;
        expect(authInfo.isJwt(), 'authInfo.isJwt() should be true').to.be.true;
        expect(authInfo.isOauth(), 'authInfo.isOauth() should be false').to.be.false;

        // Verify expected methods are called with expected args
        expect(authInfoStubs.initAuthOptions.called).to.be.true;
        expect(authInfoStubs.initAuthOptions.firstCall.args[0]).to.equal(jwtConfig);
        expect(authInfoStubs.update.called).to.be.true;
        expect(authInfoStubs.authJwt.called).to.be.true;
        expect(authInfoStubs.authJwt.firstCall.args[0]).to.include(jwtConfig);
        expect(
          orgAccessorReadSpy.callCount,
          'should have read an auth file once to ensure auth data did not already exist'
        ).to.equal(1);
        expect(readJwtKey.called).to.be.true;

        // Verify the jwtConfig object was not mutated by init() or authJwt()
        expect(jwtConfig).to.deep.equal(jwtConfigClone);

        const expectedAuthConfig = {
          accessToken: authResponse.access_token,
          clientId: testOrg.clientId,
          instanceUrl: testOrg.instanceUrl,
          orgId: authResponse.id.split('/')[0],
          loginUrl: jwtConfig.loginUrl,
          privateKey: jwtConfig.privateKey,
          isDevHub: false,
        };
        expect(authInfoStubs.update.firstCall.args[0]).to.deep.equal(expectedAuthConfig);
      });

      it('should return a JWT AuthInfo instance when passed a username from an auth file', async () => {
        const jwtData = await testOrg.getConfig();
        $$.setConfigStubContents('AuthInfoConfig', { contents: jwtData });

        // Create the JWT AuthInfo instance
        const authInfo = await AuthInfo.create({ username: testOrg.username });

        // Verify the returned AuthInfo instance
        const authInfoConnOpts = authInfo.getConnectionOptions();
        expect(authInfoConnOpts).to.have.property('accessToken', testOrg.accessToken);
        expect(authInfoConnOpts).to.have.property('instanceUrl', testOrg.instanceUrl);
        expect(authInfoConnOpts).to.have.property('refreshFn').and.is.a('function');
        expect(authInfo.getUsername()).to.equal(testOrg.username);
        expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
        expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be false').to.be.false;
        expect(authInfo.isJwt(), 'authInfo.isJwt() should be true').to.be.true;
        expect(authInfo.isOauth(), 'authInfo.isOauth() should be false').to.be.false;

        // Verify authInfo.fields are encrypted
        expect(authInfo.getFields().accessToken).equals(jwtData.accessToken);
      });

      it('should throw an AuthInfoOverwriteError when both username and oauth data passed and auth file exists', async () => {
        $$.setConfigStubContents('AuthInfoConfig', { contents: await testOrg.getConfig() });
        stubMethod($$.SANDBOX, OrgAccessor.prototype, 'hasFile').resolves(true);

        // Create the JWT AuthInfo instance
        try {
          await AuthInfo.create({
            username: testOrg.username,
            oauth2Options: {
              clientId: testOrg.clientId,
              loginUrl: testOrg.loginUrl,
              privateKey: testOrg.privateKey,
            },
          });
          assert.fail(
            'Error thrown',
            'No Error thrown',
            'Expected AuthInfo.create() to throw an AuthInfoOverwriteError'
          );
        } catch (err) {
          expect(err.name).to.equal('AuthInfoOverwriteError');
        }
      });

      it('should throw a JWTAuthError when auth fails via a OAuth2.jwtAuthorize()', async () => {
        const jwtConfig = {
          clientId: testOrg.clientId,
          loginUrl: testOrg.loginUrl,
          privateKey: testOrg.privateKey,
        };

        // Stub file I/O, http requests, and the DNS lookup
        stubMethod($$.SANDBOX, AuthInfo.prototype, 'readJwtKey').resolves('authInfoTest_private_key');
        postParamsStub.throws(new Error('authInfoTest_ERROR_MSG'));
        stubMethod($$.SANDBOX, jwt, 'sign').returns(Promise.resolve('authInfoTest_jwtToken'));
        stubMethod($$.SANDBOX, dns, 'lookup').callsFake((url: string, done: (v: AnyJson, w: JsonMap) => {}) =>
          done(null, { address: '1.1.1.1', family: 4 })
        );

        // Create the JWT AuthInfo instance
        try {
          await AuthInfo.create({ username: testOrg.username, oauth2Options: jwtConfig });
          assert.fail('should have thrown an error within AuthInfo.authJwt()');
        } catch (err) {
          expect(err.name).to.equal('JwtAuthError');
        }
      });
    });

    describe('Refresh Token', () => {
      const verifyAuthInfo = (
        authInfo: AuthInfo,
        authResponse: { access_token: string; instance_url: string },
        config?: { clientId?: string }
      ) => {
        // Verify the returned AuthInfo instance
        const authInfoConnOpts = authInfo.getConnectionOptions();
        expect(authInfoConnOpts).to.have.property('accessToken', authResponse.access_token);
        expect(authInfoConnOpts).to.have.property('instanceUrl', authResponse.instance_url);
        expect(authInfoConnOpts).to.not.have.property('refreshToken');
        expect(authInfoConnOpts['oauth2']).to.have.property('loginUrl', testOrg.instanceUrl);
        if (config?.clientId) {
          expect(authInfoConnOpts['oauth2']).to.have.property('clientId', config?.clientId);
        } else {
          expect(authInfoConnOpts['oauth2']).to.have.property('clientId', testOrg.defaultConnectedAppInfo.clientId);
        }

        expect(authInfoConnOpts['oauth2']).to.have.property('redirectUri', testOrg.redirectUri);
        expect(authInfo.getUsername()).to.equal(testOrg.username);
        expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
        expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be true').to.be.true;
        expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
        expect(authInfo.isOauth(), 'authInfo.isOauth() should be true').to.be.true;
      };

      it('should return a refresh token AuthInfo instance when passed a username and refresh token auth options', async () => {
        const refreshTokenConfig = {
          refreshToken: testOrg.refreshToken,
          loginUrl: testOrg.loginUrl,
        };
        const refreshTokenConfigClone = cloneJson(refreshTokenConfig);
        const authResponse = {
          access_token: testOrg.accessToken,
          instance_url: testOrg.instanceUrl,
          id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        };

        // Stub the http request (OAuth2.refreshToken())
        postParamsStub.returns(Promise.resolve(authResponse));

        // Create the refresh token AuthInfo instance
        const authInfo = await AuthInfo.create({
          username: testOrg.username,
          oauth2Options: refreshTokenConfig,
        });

        verifyAuthInfo(authInfo, authResponse);

        // Verify authInfo.fields are encrypted
        const crypto = await Crypto.create();
        expect(crypto.decrypt(authInfo.getFields().accessToken)).equals(authResponse.access_token);
        expect(crypto.decrypt(authInfo.getFields().refreshToken)).equals(refreshTokenConfig.refreshToken);

        // Verify expected methods are called with expected args
        expect(authInfoStubs.initAuthOptions.called).to.be.true;
        expect(authInfoStubs.initAuthOptions.firstCall.args[0]).to.equal(refreshTokenConfig);
        expect(authInfoStubs.update.called).to.be.true;
        expect(authInfoStubs.buildRefreshTokenConfig.called).to.be.true;
        expect(authInfoStubs.buildRefreshTokenConfig.firstCall.args[0]).to.include(refreshTokenConfig);

        // Verify the refreshTokenConfig object was not mutated by init() or buildRefreshTokenConfig()
        expect(refreshTokenConfig).to.deep.equal(refreshTokenConfigClone);

        const expectedAuthConfig = {
          accessToken: authResponse.access_token,
          instanceUrl: testOrg.instanceUrl,
          orgId: authResponse.id.split('/')[0],
          loginUrl: refreshTokenConfig.loginUrl,
          refreshToken: refreshTokenConfig.refreshToken,
          clientId: testOrg.defaultConnectedAppInfo.clientId,
          clientSecret: testOrg.defaultConnectedAppInfo.clientSecret,
          isDevHub: false,
          username: testOrg.username,
        };
        expect(authInfoStubs.update.firstCall.args[0]).to.deep.equal(expectedAuthConfig);
      });

      it('should return a refresh token AuthInfo instance with username in auth options', async () => {
        const refreshTokenConfig = {
          refreshToken: testOrg.refreshToken,
          loginUrl: testOrg.loginUrl,
          username: testOrg.username,
        };
        const refreshTokenConfigClone = cloneJson(refreshTokenConfig);
        const authResponse = {
          access_token: testOrg.accessToken,
          instance_url: testOrg.instanceUrl,
          id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        };

        // Stub the http request (OAuth2.refreshToken())
        postParamsStub.returns(Promise.resolve(authResponse));

        // Create the refresh token AuthInfo instance
        const authInfo = await AuthInfo.create({
          oauth2Options: refreshTokenConfig,
        });

        verifyAuthInfo(authInfo, authResponse);

        // Verify authInfo.fields are encrypted
        const crypto = await Crypto.create();
        expect(crypto.decrypt(authInfo.getFields().accessToken)).equals(authResponse.access_token);
        expect(crypto.decrypt(authInfo.getFields().refreshToken)).equals(refreshTokenConfig.refreshToken);

        // Verify expected methods are called with expected args
        expect(authInfoStubs.initAuthOptions.called).to.be.true;
        expect(authInfoStubs.initAuthOptions.firstCall.args[0]).to.equal(refreshTokenConfig);
        expect(authInfoStubs.update.called).to.be.true;
        expect(authInfoStubs.buildRefreshTokenConfig.called).to.be.true;
        expect(authInfoStubs.buildRefreshTokenConfig.firstCall.args[0]).to.include(refreshTokenConfig);

        // Verify the refreshTokenConfig object was not mutated by init() or buildRefreshTokenConfig()
        expect(refreshTokenConfig).to.deep.equal(refreshTokenConfigClone);

        const expectedAuthConfig = {
          accessToken: authResponse.access_token,
          instanceUrl: testOrg.instanceUrl,
          orgId: authResponse.id.split('/')[0],
          loginUrl: refreshTokenConfig.loginUrl,
          refreshToken: refreshTokenConfig.refreshToken,
          clientId: testOrg.defaultConnectedAppInfo.clientId,
          clientSecret: testOrg.defaultConnectedAppInfo.clientSecret,
          isDevHub: false,
          username: testOrg.username,
        };
        expect(authInfoStubs.update.firstCall.args[0]).to.deep.equal(expectedAuthConfig);
      });

      it('should return a refresh token AuthInfo instance with custom clientId and clientSecret', async () => {
        const refreshTokenConfig = {
          clientId: 'authInfoTest_clientId',
          clientSecret: 'authInfoTest_clientSecret',
          refreshToken: testOrg.refreshToken,
          loginUrl: testOrg.loginUrl,
          redirectUri: 'http://localhost:1717/OauthRedirect',
        };
        const authResponse = {
          access_token: testOrg.accessToken,
          instance_url: testOrg.instanceUrl,
          id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        };

        // Stub the http request (OAuth2.refreshToken())
        postParamsStub.returns(Promise.resolve(authResponse));

        // Create the refresh token AuthInfo instance
        const authInfo = await AuthInfo.create({
          username: testOrg.username,
          oauth2Options: refreshTokenConfig,
        });

        verifyAuthInfo(authInfo, authResponse, refreshTokenConfig);

        // Verify authInfo.fields are encrypted
        const crypto = await Crypto.create();
        expect(crypto.decrypt(authInfo.getFields().accessToken)).equals(authResponse.access_token);
        expect(crypto.decrypt(authInfo.getFields().refreshToken)).equals(refreshTokenConfig.refreshToken);
        expect(crypto.decrypt(authInfo.getFields().clientSecret)).equals(refreshTokenConfig.clientSecret);

        // Verify expected methods are called with expected args
        expect(authInfoStubs.initAuthOptions.called).to.be.true;
        expect(authInfoStubs.initAuthOptions.firstCall.args[0]).to.equal(refreshTokenConfig);
        expect(authInfoStubs.update.called).to.be.true;
        expect(authInfoStubs.buildRefreshTokenConfig.called).to.be.true;
        expect(authInfoStubs.buildRefreshTokenConfig.firstCall.args[0]).to.include(refreshTokenConfig);

        const expectedAuthConfig = {
          accessToken: authResponse.access_token,
          instanceUrl: testOrg.instanceUrl,
          orgId: authResponse.id.split('/')[0],
          loginUrl: refreshTokenConfig.loginUrl,
          refreshToken: refreshTokenConfig.refreshToken,
          clientId: refreshTokenConfig.clientId,
          clientSecret: refreshTokenConfig.clientSecret,
          isDevHub: false,
          username: testOrg.username,
        };
        expect(authInfoStubs.update.firstCall.args[0]).to.deep.equal(expectedAuthConfig);
      });

      it('should throw a RefreshTokenAuthError when auth fails via a refresh token', async () => {
        const username = 'authInfoTest_username_RefreshToken_ERROR';
        const refreshTokenConfig = {
          clientId: 'authInfoTest_clientId',
          clientSecret: 'authInfoTest_clientSecret',
          refreshToken: testOrg.refreshToken,
          loginUrl: testOrg.loginUrl,
        };

        // Stub the http request (OAuth2.refreshToken())
        postParamsStub.throws(new Error('authInfoTest_ERROR_MSG'));

        // Create the refresh token AuthInfo instance
        try {
          await AuthInfo.create({ username, oauth2Options: refreshTokenConfig });
          assert.fail('should have thrown an error within AuthInfo.buildRefreshTokenConfig()');
        } catch (err) {
          expect(err.name).to.equal('RefreshTokenAuthError');
        }
      });
    });
  });
});
