/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/ban-types */

import * as pathImport from 'path';
import * as dns from 'dns';
import * as jwt from 'jsonwebtoken';
import { cloneJson, env, includes } from '@salesforce/kit';
import { stubMethod, spyMethod } from '@salesforce/ts-sinon';
import { AnyJson, ensureString, getJsonMap, getString, JsonMap, toJsonMap } from '@salesforce/ts-types';
import { assert, expect } from 'chai';
import { Transport } from 'jsforce/lib/transport';

import { OAuth2 } from 'jsforce';
import { SinonSpy, SinonStub } from 'sinon';
import { AuthFields, AuthInfo, OAuth2Config } from '../../../src/org';
import { MockTestOrgData, testSetup } from '../../../src/testSetup';
import { OrgConfigProperties } from '../../../src/org/orgConfigProperties';
import { OrgAccessor } from '../../../src/stateAggregator';
import { Crypto } from '../../../src/crypto/crypto';

class AuthInfoMockOrg extends MockTestOrgData {
  public privateKey = 'authInfoTest/jwt/server.key';
  public expirationDate = '12-02-20';
  public encryptedAccessToken = this.accessToken;
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

  const stubUserRequest = (
    userInfoResponse: JsonMap = {
      statusCode: 200,
      body: { preferred_username: testOrg.username, organization_id: testOrg.orgId },
    },
    userResponse: JsonMap = { statusCode: 200, body: { Username: testOrg.username.toUpperCase() } }
  ): SinonStub => {
    const userInfoResponseBody = {
      statusCode: userInfoResponse.statusCode,
      body: JSON.stringify(userInfoResponse.body),
    };
    const userResponseBody = {
      statusCode: userResponse.statusCode,
      body: JSON.stringify(userResponse.body),
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

  describe('create', () => {
    const verifyAuthInfoRefreshToken = (
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

        verifyAuthInfoRefreshToken(authInfo, authResponse);

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

        verifyAuthInfoRefreshToken(authInfo, authResponse);

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

        verifyAuthInfoRefreshToken(authInfo, authResponse, refreshTokenConfig);

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

    describe('Web Auth', () => {
      it('should return a refresh token AuthInfo instance when passed an authcode', async () => {
        const authCodeConfig = {
          authCode: testOrg.authcode,
          loginUrl: testOrg.loginUrl,
        };
        const authCodeConfigClone = cloneJson(authCodeConfig);
        const authResponse = {
          access_token: testOrg.accessToken,
          instance_url: testOrg.instanceUrl,
          id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
          refresh_token: testOrg.refreshToken,
        };

        // Stub the http requests (OAuth2.requestToken() and the request for the username)
        postParamsStub.returns(Promise.resolve(authResponse));
        const stub = stubUserRequest();

        // Create the refresh token AuthInfo instance
        const authInfo = await AuthInfo.create({ oauth2Options: authCodeConfig });

        // Ensure we query for the username
        expect(stub.called).to.be.true;
        const authInfoConnOpts = authInfo.getConnectionOptions();
        expect(authInfoConnOpts).to.have.property('accessToken', authResponse.access_token);
        expect(authInfoConnOpts).to.have.property('instanceUrl', authResponse.instance_url);
        expect(authInfoConnOpts).to.not.have.property('refreshToken');
        expect(authInfoConnOpts['oauth2']).to.have.property('loginUrl', testOrg.instanceUrl); // why is this instanceUrl?
        expect(authInfoConnOpts['oauth2']).to.have.property('clientId', testOrg.defaultConnectedAppInfo.clientId);
        expect(authInfoConnOpts['oauth2']).to.have.property('redirectUri', testOrg.redirectUri);
        expect(authInfo.getUsername()).to.equal(testOrg.username.toUpperCase());
        expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
        expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be true').to.be.true;
        expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
        expect(authInfo.isOauth(), 'authInfo.isOauth() should be true').to.be.true;

        // Verify authInfo.fields are encrypted
        const crypto = await Crypto.create();
        expect(crypto.decrypt(authInfo.getFields().accessToken)).equals(authResponse.access_token);
        expect(crypto.decrypt(authInfo.getFields().refreshToken)).equals(authResponse.refresh_token);

        // Verify expected methods are called with expected args
        expect(authInfoStubs.initAuthOptions.called).to.be.true;
        expect(authInfoStubs.initAuthOptions.firstCall.args[0]).to.equal(authCodeConfig);
        expect(authInfoStubs.update.called).to.be.true;
        expect(authInfoStubs.exchangeToken.called).to.be.true;
        expect(authInfoStubs.exchangeToken.firstCall.args[0]).to.include(authCodeConfig);

        // Verify the authCodeConfig object was not mutated by init() or buildWebAuthConfig()
        expect(authCodeConfig).to.deep.equal(authCodeConfigClone);

        const expectedAuthConfig = {
          accessToken: authResponse.access_token,
          instanceUrl: testOrg.instanceUrl,
          username: testOrg.username.toUpperCase(),
          orgId: authResponse.id.split('/')[0],
          loginUrl: authCodeConfig.loginUrl,
          refreshToken: authResponse.refresh_token,
          isDevHub: false,
          // These need to be passed in by the consumer. Since they are not, they will show up as undefined.
          // In a non-test environment, the exchange will fail because no clientId is supplied.
          clientId: undefined,
          clientSecret: undefined,
        };
        expect(authInfoStubs.update.firstCall.args[0]).to.deep.equal(expectedAuthConfig);
      });

      it('should return access token and refresh token when using authCode; verifier should be the same.', async () => {
        /**
         * The way web oauth works is first you must request a one-time auth code. Typically
         * you send a hashed number to the server; the number is called the code verifier and the hashed value the code_challenge
         * After the code is returned you then request an access token by passing along the returned code
         * an you also include the UNHASHED code verifier value. If these two items match from when the authcode was issued the
         * access/refresh tokens are then returned.
         *
         * Typically the authCode is obtained by authenticating to salesforce via a generated url that contains the
         * connected app info plus this code challenge. After successful authentication the browser is sent a redirect url
         * that includes the authCode.
         *
         * This test just makes sure the auth code exchange method is using the same codeVerifier. By creating the
         * codeVerifier instance you can first generate the url then pass it to AuthInfo. Then everything lines up.
         */
        const options: OAuth2Config & { authCode?: string } = {
          clientId: testOrg.clientId,
          clientSecret: testOrg.clientSecret,
          loginUrl: testOrg.loginUrl,
          redirectUri: testOrg.redirectUri,
        };
        const oauth2 = new OAuth2(options);
        options.authCode = '123456';

        const authResponse = {
          access_token: testOrg.accessToken,
          instance_url: testOrg.instanceUrl,
          id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
          refresh_token: testOrg.refreshToken,
        };
        // Stub the http requests (OAuth2.requestToken() and the request for the username)
        postParamsStub.returns(Promise.resolve(authResponse));
        stubUserRequest();

        await AuthInfo.create({ oauth2Options: options, oauth2 });
        expect(authInfoStubs.exchangeToken.args.length).to.equal(1);
        expect(authInfoStubs.exchangeToken.args[0].length).to.equal(2);
        expect(authInfoStubs.exchangeToken.args[0][1]).to.have.property('codeVerifier', oauth2.codeVerifier);
      });

      it('should throw a AuthCodeExchangeError when auth fails via an auth code', async () => {
        const authCodeConfig = {
          authCode: testOrg.authcode,
          loginUrl: testOrg.loginUrl,
        };

        // Stub the http request (OAuth2.requestToken())
        postParamsStub.throws(new Error('authInfoTest_ERROR_MSG'));

        // Create the auth code AuthInfo instance
        try {
          await AuthInfo.create({ oauth2Options: authCodeConfig });
          assert.fail('should have thrown an error within AuthInfo.buildWebAuthConfig()');
        } catch (err) {
          expect(err.name).to.equal('AuthCodeExchangeError');
        }
      });

      it('should throw a AuthCodeUsernameRetrievalError when userInfo retrieval fails after auth code exchange', async () => {
        const authCodeConfig = {
          authCode: testOrg.authcode,
          loginUrl: testOrg.loginUrl,
        };
        const authResponse = {
          access_token: testOrg.accessToken,
          instance_url: testOrg.instanceUrl,
          id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
          refresh_token: testOrg.refreshToken,
        };

        // Stub the http request (OAuth2.requestToken())
        postParamsStub.returns(Promise.resolve(authResponse));
        stubUserRequest({
          statusCode: 404,
          body: [
            {
              message: 'Could not retrieve the username after successful auth code exchange.\nDue to: %s',
              errorCode: 'AuthCodeUsernameRetrievalError',
            },
          ],
        });

        // Create the auth code AuthInfo instance
        try {
          await AuthInfo.create({ oauth2Options: authCodeConfig });
          assert.fail('should have thrown an error within AuthInfo.buildWebAuthConfig()');
        } catch (err) {
          expect(err.name).to.equal('AuthCodeUsernameRetrievalError');
        }
      });

      it('should throw a AuthCodeUsernameRetrievalError when user sobject retrieval fails after auth code exchange', async () => {
        const authCodeConfig = {
          authCode: testOrg.authcode,
          loginUrl: testOrg.loginUrl,
        };
        const authResponse = {
          access_token: testOrg.accessToken,
          instance_url: testOrg.instanceUrl,
          id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
          refresh_token: testOrg.refreshToken,
        };

        // Stub the http request (OAuth2.requestToken())
        postParamsStub.returns(Promise.resolve(authResponse));

        stubUserRequest(
          { body: { preferred_username: testOrg.username, organization_id: testOrg.orgId }, statusCode: 200 },
          {
            statusCode: 404,
            body: [
              {
                message: 'Could not retrieve the username after successful auth code exchange.\nDue to: %s',
                errorCode: 'AuthCodeUsernameRetrievalError',
              },
            ],
          }
        );

        // Create the auth code AuthInfo instance
        try {
          await AuthInfo.create({ oauth2Options: authCodeConfig });
          assert.fail('should have thrown an error within AuthInfo.buildWebAuthConfig()');
        } catch (err) {
          expect(err.name).to.equal('AuthCodeUsernameRetrievalError');
        }
      });

      it('should throw an error when neither username nor options have been passed', async () => {
        try {
          await AuthInfo.create();
          assert.fail('Expected AuthInfo.create() to throw an error when no params are passed');
        } catch (err) {
          expect(err.name).to.equal('AuthInfoCreationError');
        }
      });
    });
  });

  describe('save', () => {
    it('should update the AuthInfo fields, and write to file', async () => {
      const refreshTokenConfig = {
        refreshToken: testOrg.refreshToken,
        loginUrl: testOrg.loginUrl,
      };
      const authResponse = {
        access_token: testOrg.accessToken,
        instance_url: testOrg.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        expirationDate: testOrg.expirationDate,
      };

      // Stub the http request (OAuth2.refreshToken())
      postParamsStub.returns(Promise.resolve(authResponse));

      // Create the AuthInfo instance
      const authInfo = await AuthInfo.create({
        username: testOrg.username,
        oauth2Options: refreshTokenConfig,
      });

      expect(authInfo.getUsername()).to.equal(testOrg.username);

      // reset the AuthInfo.update stub so we only look at what happens with AuthInfo.save().
      authInfoStubs.update.resetHistory();

      // Save new fields
      const changedData = { accessToken: testOrg.accessToken, expirationDate: testOrg.expirationDate };

      // stubMethod($$.SANDBOX, testOrg, 'fetchConfigInfo').returns(Promise.resolve({}));
      await authInfo.save(changedData);

      expect(authInfoStubs.update.called).to.be.true;
      expect(authInfoStubs.update.firstCall.args[0]).to.deep.equal(changedData);
      // expect(configFileWrite.called).to.be.true;

      const crypto = await Crypto.create();
      // const decryptedActualFields = configFileWrite.lastCall.thisValue.toObject();
      const decryptedActualFields = $$.stubs.configWrite.lastCall.thisValue.toObject();
      decryptedActualFields.accessToken = crypto.decrypt(decryptedActualFields.accessToken);
      decryptedActualFields.refreshToken = crypto.decrypt(decryptedActualFields.refreshToken);
      decryptedActualFields.clientSecret = crypto.decrypt(decryptedActualFields.clientSecret);
      delete decryptedActualFields.timestamp;
      const expectedFields = {
        accessToken: changedData.accessToken,
        instanceUrl: testOrg.instanceUrl,
        username: testOrg.username,
        orgId: authResponse.id.split('/')[0],
        loginUrl: refreshTokenConfig.loginUrl,
        refreshToken: refreshTokenConfig.refreshToken,
        isDevHub: false,
        // clientId and clientSecret are now stored in the file, even the defaults.
        // We just hard code the legacy values here to ensure old auth files will still work.
        clientId: 'SalesforceDevelopmentExperience',
        clientSecret: '1384510088588713504',
        expirationDate: testOrg.expirationDate,
      };
      // Note that this also verifies the clientId and clientSecret are not persisted,
      // and that data is encrypted when saved (because we have to decrypt it to verify here).
      expect(decryptedActualFields).to.deep.equal(expectedFields);
    });

    it('should not save accesstoken files', async () => {
      // invalid access token
      const username =
        '00DB0000000H3bm!AQcAQFpuHljRg_fn_n.0g_3GJTXeCI_sQEucmwq2o5yd3.mwof3ODbsfWrJ4MCro8DOjpaloqoRFzAJ8w8f.TrjRiSaFSpvo';

      // Create the AuthInfo instance
      const authInfo = await AuthInfo.create({
        username,
        accessTokenOptions: {
          accessToken: username,
          instanceUrl: testOrg.instanceUrl,
        },
      });

      expect(authInfo.getUsername()).to.equal(username);

      $$.stubs.configWrite.rejects(new Error('Should not call save'));
      await authInfo.save();
      // If the test doesn't blow up, it is a success because the write (reject) never happened
    });
  });

  describe('refreshFn', () => {
    it('should call init() and save()', async () => {
      const context = {
        getUsername: () => '',
        getFields: (decrypt = false) => ({
          loginUrl: testOrg.loginUrl,
          clientId: testOrg.clientId,
          privateKey: 'authInfoTest/jwt/server.key',
          accessToken: decrypt ? testOrg.accessToken : testOrg.encryptedAccessToken,
        }),
        initAuthOptions: $$.SANDBOX.stub(),
        save: $$.SANDBOX.stub(),
        logger: $$.TEST_LOGGER,
      };
      const testCallback = $$.SANDBOX.stub();
      testCallback.returns(Promise.resolve());

      context.initAuthOptions.returns(Promise.resolve());
      context.save.returns(Promise.resolve());
      // @ts-ignore
      await AuthInfo.prototype['refreshFn'].call(context, null, testCallback);

      expect(context.initAuthOptions.called, 'Should have called AuthInfo.initAuthOptions() during refreshFn()').to.be
        .true;
      const expectedInitArgs = {
        loginUrl: context.getFields().loginUrl,
        clientId: context.getFields().clientId,
        privateKey: context.getFields().privateKey,
        accessToken: testOrg.accessToken,
      };
      expect(context.initAuthOptions.firstCall.args[0]).to.deep.equal(expectedInitArgs);
      expect(context.save.called, 'Should have called AuthInfo.save() during refreshFn()').to.be.true;
      expect(testCallback.called, 'Should have called the callback passed to refreshFn()').to.be.true;
      expect(testCallback.firstCall.args[1]).to.equal(testOrg.accessToken);
    });

    it('should path.resolve jwtkeyfilepath', async () => {
      const resolveSpy = $$.SANDBOX.spy(pathImport, 'resolve');

      authInfoStubs.authJwt.restore();
      stubMethod($$.SANDBOX, AuthInfo.prototype, 'authJwt').resolves({
        instanceUrl: '',
        accessToken: '',
      });
      stubMethod($$.SANDBOX, AuthInfo.prototype, 'determineIfDevHub').resolves(false);

      await AuthInfo.create({
        username: testOrg.username,
        oauth2Options: {
          clientId: testOrg.clientId,
          privateKeyFile: testOrg.privateKey,
        },
      });
      expect(resolveSpy.lastCall.args[0]).to.equal(testOrg.privateKey);
    });

    it('should call the callback with OrgDataNotAvailableError when AuthInfo.init() fails', async () => {
      const context = {
        getUsername: () => '',
        getFields: () => ({
          loginUrl: testOrg.loginUrl,
          clientId: testOrg.clientId,
          privateKey: testOrg.privateKey,
          accessToken: testOrg.encryptedAccessToken,
        }),
        initAuthOptions: $$.SANDBOX.stub(),
        save: $$.SANDBOX.stub(),
        logger: $$.TEST_LOGGER,
      };
      const testCallback = $$.SANDBOX.spy();
      context.initAuthOptions.throws(new Error('Error: Data Not Available'));
      context.save.returns(Promise.resolve());
      await AuthInfo.prototype['refreshFn'].call(context, null, testCallback);
      expect(testCallback.called).to.be.true;
      const sfError = testCallback.firstCall.args[0];
      expect(sfError.name).to.equal('OrgDataNotAvailableError', sfError.message);
    });
  });

  describe('getAuthorizationUrl', () => {
    let scope: string;
    beforeEach(() => {
      scope = env.getString('SFDX_AUTH_SCOPES', '');
    });
    afterEach(() => {
      env.setString('SFDX_AUTH_SCOPES', scope);
    });

    it('should return the correct url', () => {
      const options = {
        clientId: testOrg.clientId,
        redirectUri: testOrg.redirectUri,
        loginUrl: testOrg.loginUrl,
      };
      const url = AuthInfo.getAuthorizationUrl(options);

      expect(url.startsWith(options.loginUrl), 'authorization URL should start with the loginUrl').to.be.true;
      expect(url).to.contain('state=');
      expect(url).to.contain('prompt=login');
      expect(url).to.contain('scope=refresh_token%20api%20web');
    });

    it('should return the correct url with modified scope', () => {
      const options = {
        clientId: testOrg.clientId,
        redirectUri: testOrg.redirectUri,
        loginUrl: testOrg.loginUrl,
        scope: 'test',
      };
      const url = AuthInfo.getAuthorizationUrl(options);

      expect(url.startsWith(options.loginUrl), 'authorization URL should start with the loginUrl').to.be.true;
      expect(url).to.contain('state=');
      expect(url).to.contain('prompt=login');
      expect(url).to.contain('scope=test');
    });

    it('should return the correct url with env scope', () => {
      env.setString('SFDX_AUTH_SCOPES', 'from-env');
      const options = {
        clientId: testOrg.clientId,
        redirectUri: testOrg.redirectUri,
        loginUrl: testOrg.loginUrl,
      };
      const url = AuthInfo.getAuthorizationUrl(options);

      expect(url.startsWith(options.loginUrl), 'authorization URL should start with the loginUrl').to.be.true;
      expect(url).to.contain('state=');
      expect(url).to.contain('prompt=login');
      expect(url).to.contain('scope=from-env');
    });

    it('should return the correct url with option over env', () => {
      env.setString('SFDX_AUTH_SCOPES', 'from-env');
      const options = {
        clientId: testOrg.clientId,
        redirectUri: testOrg.redirectUri,
        loginUrl: testOrg.loginUrl,
        scope: 'from-option',
      };
      const url = AuthInfo.getAuthorizationUrl(options);

      expect(url.startsWith(options.loginUrl), 'authorization URL should start with the loginUrl').to.be.true;
      expect(url).to.contain('state=');
      expect(url).to.contain('prompt=login');
      expect(url).to.contain('scope=from-option');
    });
  });
});
