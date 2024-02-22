/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import pathImport from 'node:path';
import dns from 'node:dns';
import jwt from 'jsonwebtoken';
import { env, includes } from '@salesforce/kit';
import { spyMethod, stubMethod } from '@salesforce/ts-sinon';
import { AnyJson, getJsonMap, JsonMap, toJsonMap } from '@salesforce/ts-types';
import { expect } from 'chai';
import { Transport } from 'jsforce/lib/transport';

import { OAuth2 } from 'jsforce';
import { SinonSpy, SinonStub, match } from 'sinon';
import { Org } from '../../../src/org/org';
import { AuthFields, AuthInfo } from '../../../src/org/authInfo';
import { JwtOAuth2Config } from '../../../src/org/authInfo';
import { MockTestOrgData, shouldThrow, shouldThrowSync, TestContext } from '../../../src/testSetup';
import { OrgConfigProperties } from '../../../src/org/orgConfigProperties';
import { StateAggregator } from '../../../src/stateAggregator/stateAggregator';
import { AliasAccessor } from '../../../src/stateAggregator/accessors/aliasAccessor';
import { OrgAccessor } from '../../../src/stateAggregator/accessors/orgAccessor';
import { Crypto } from '../../../src/crypto/crypto';
import { Config } from '../../../src/config/config';
import { SfdcUrl } from '../../../src/util/sfdcUrl';

class AuthInfoMockOrg extends MockTestOrgData {
  public privateKey = 'authInfoTest/jwt/server.key';
  public expirationDate = '12-02-20';
  public encryptedAccessToken = this.accessToken;
  public defaultConnectedAppInfo = {
    clientId: 'PlatformCLI',
    clientSecret: '',
  };

  public async getConfig(): Promise<AuthFields> {
    return {
      accessToken: this.accessToken,
      clientId: this.clientId,
      instanceUrl: this.instanceUrl,
      loginUrl: this.loginUrl,
      privateKey: this.privateKey,
      username: this.username,
      orgId: this.orgId,
      namespacePrefix: this.namespacePrefix,
    };
  }
}

describe('AuthInfo', () => {
  // Setup the test environment.
  const $$ = new TestContext();

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
      if (keyUpper.includes('SECRET') && keyUpper.includes('CLIENT') && obj[key]) {
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
      postParamsStub.resolves(authResponse);
      stubUserRequest();
      authInfo = await AuthInfo.create({ oauth2Options });

      // @ts-expect-error - undefined un-assignable to string
      decryptedRefreshToken = authInfo.getFields(true).refreshToken;
    });

    describe('getFields', () => {
      it('return value should not have a client secret or decrypted refresh token', () => {
        const fields = authInfo.getFields();
        const strObj = JSON.stringify(fields);
        // verify the returned object doesn't have secrets
        expect(() => walkAndSearchForSecrets(toJsonMap(fields) || {}, decryptedRefreshToken)).to.not.throw();

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
        expect(strObj).does.not.include(decryptedRefreshToken);
      });
    });

    describe('AuthInfo', () => {
      it('should not have a client secret or decrypted refresh token', () => {
        const authInfoString = JSON.stringify(authInfo);

        // verify the returned object doesn't have secrets
        expect(() => walkAndSearchForSecrets(toJsonMap(authInfo) || {}, decryptedRefreshToken)).to.not.throw();

        // double check the stringified objects don't have secrets.
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
      await $$.stubConfig({ [OrgConfigProperties.ORG_INSTANCE_URL]: testOrg.instanceUrl });

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
      await $$.stubConfig({ [OrgConfigProperties.ORG_INSTANCE_URL]: testOrg.instanceUrl });
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
      await $$.stubConfig({ [OrgConfigProperties.ORG_INSTANCE_URL]: testOrg.instanceUrl });

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
        const jwtConfigClone = structuredClone(jwtConfig);
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

        try {
          await shouldThrow(
            AuthInfo.create({
              username: testOrg.username,
              oauth2Options: {
                clientId: testOrg.clientId,
                loginUrl: testOrg.loginUrl,
                privateKey: testOrg.privateKey,
              },
            })
          );
        } catch (err) {
          expect((err as Error).name).to.equal('AuthInfoOverwriteError');
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
        stubMethod($$.SANDBOX, jwt, 'sign').resolves('authInfoTest_jwtToken');
        stubMethod($$.SANDBOX, dns, 'lookup').callsFake((url: string, done: (v: AnyJson, w: JsonMap) => {}) =>
          done(null, { address: '1.1.1.1', family: 4 })
        );

        // Create the JWT AuthInfo instance
        try {
          await shouldThrow(AuthInfo.create({ username: testOrg.username, oauth2Options: jwtConfig }));
        } catch (err) {
          expect((err as Error).name).to.equal('JwtAuthError');
        }
      });

      it('should return a JWT AuthInfo instance when passed a username and JWT auth options despite failed DNS lookup', async () => {
        $$.setConfigStubContents('AuthInfoConfig', { contents: await testOrg.getConfig() });

        const jwtConfig = {
          clientId: testOrg.clientId,
          loginUrl: testOrg.loginUrl,
          privateKey: testOrg.privateKey,
        };
        const jwtConfigClone = structuredClone(jwtConfig);
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
        stubMethod($$.SANDBOX, SfdcUrl.prototype, 'lookup').throws();

        // Create the JWT AuthInfo instance
        const authInfo = await AuthInfo.create({
          username: testOrg.username,
          oauth2Options: jwtConfig,
        });

        // Verify the returned AuthInfo instance
        const authInfoConnOpts = authInfo.getConnectionOptions();
        expect(authInfoConnOpts).to.have.property('accessToken', authResponse.access_token);
        expect(authInfoConnOpts).to.have.property('instanceUrl', testOrg.loginUrl);
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
          instanceUrl: testOrg.loginUrl,
          orgId: authResponse.id.split('/')[0],
          loginUrl: jwtConfig.loginUrl,
          privateKey: jwtConfig.privateKey,
          isDevHub: false,
        };
        expect(authInfoStubs.update.firstCall.args[0]).to.deep.equal(expectedAuthConfig);
      });
    });

    describe('Refresh Token', () => {
      it('should return a refresh token AuthInfo instance when passed a username and refresh token auth options', async () => {
        const refreshTokenConfig = {
          refreshToken: testOrg.refreshToken,
          loginUrl: testOrg.loginUrl,
        };
        const refreshTokenConfigClone = structuredClone(refreshTokenConfig);
        const authResponse = {
          access_token: testOrg.accessToken,
          instance_url: testOrg.instanceUrl,
          id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        };

        // Stub the http request (OAuth2.refreshToken())
        postParamsStub.resolves(authResponse);

        // Create the refresh token AuthInfo instance
        const authInfo = await AuthInfo.create({
          username: testOrg.username,
          oauth2Options: refreshTokenConfig,
        });

        verifyAuthInfoRefreshToken(authInfo, authResponse);

        // Verify authInfo.fields are encrypted
        const crypto = await Crypto.create();
        // @ts-expect-error - undefined un-assignable to string
        expect(crypto.decrypt(authInfo.getFields().accessToken)).equals(authResponse.access_token);
        // @ts-expect-error - undefined un-assignable to string
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
        const refreshTokenConfigClone = structuredClone(refreshTokenConfig);
        const authResponse = {
          access_token: testOrg.accessToken,
          instance_url: testOrg.instanceUrl,
          id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        };

        // Stub the http request (OAuth2.refreshToken())
        postParamsStub.resolves(authResponse);

        // Create the refresh token AuthInfo instance
        const authInfo = await AuthInfo.create({
          oauth2Options: refreshTokenConfig,
        });

        verifyAuthInfoRefreshToken(authInfo, authResponse);

        // Verify authInfo.fields are encrypted
        const crypto = await Crypto.create();
        // @ts-expect-error - undefined un-assignable to string
        expect(crypto.decrypt(authInfo.getFields().accessToken)).equals(authResponse.access_token);
        // @ts-expect-error - undefined un-assignable to string
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

      it('should return a refresh token AuthInfo instance without any username', async () => {
        const refreshTokenConfig = {
          refreshToken: testOrg.refreshToken,
          loginUrl: testOrg.loginUrl,
        };
        const refreshTokenConfigClone = structuredClone(refreshTokenConfig);
        const authResponse = {
          access_token: testOrg.accessToken,
          instance_url: testOrg.instanceUrl,
          id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        };

        // Stub the http request (OAuth2.refreshToken())
        postParamsStub.resolves(authResponse);
        stubUserRequest();

        // Create the refresh token AuthInfo instance
        const authInfo = await AuthInfo.create({
          oauth2Options: refreshTokenConfig,
        });

        // Verify the returned AuthInfo instance
        const authInfoConnOpts = authInfo.getConnectionOptions();
        expect(authInfoConnOpts).to.have.property('accessToken', authResponse.access_token);
        expect(authInfoConnOpts).to.have.property('instanceUrl', authResponse.instance_url);
        expect(authInfoConnOpts).to.not.have.property('refreshToken');
        expect(authInfoConnOpts['oauth2']).to.have.property('loginUrl', testOrg.instanceUrl);
        expect(authInfoConnOpts['oauth2']).to.have.property('clientId', testOrg.defaultConnectedAppInfo.clientId);
        expect(authInfoConnOpts['oauth2']).to.have.property('redirectUri', testOrg.redirectUri);
        expect(authInfo.getUsername()).to.equal(testOrg.username.toUpperCase());
        expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
        expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be true').to.be.true;
        expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
        expect(authInfo.isOauth(), 'authInfo.isOauth() should be true').to.be.true;

        // Verify authInfo.fields are encrypted
        const crypto = await Crypto.create();
        // @ts-expect-error - undefined un-assignable to string
        expect(crypto.decrypt(authInfo.getFields().accessToken)).equals(authResponse.access_token);
        // @ts-expect-error - undefined un-assignable to string
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
          username: testOrg.username.toUpperCase(),
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
        postParamsStub.resolves(authResponse);

        // Create the refresh token AuthInfo instance
        const authInfo = await AuthInfo.create({
          username: testOrg.username,
          oauth2Options: refreshTokenConfig,
        });

        verifyAuthInfoRefreshToken(authInfo, authResponse, refreshTokenConfig);

        // Verify authInfo.fields are encrypted
        const crypto = await Crypto.create();
        // @ts-expect-error - undefined un-assignable to string
        expect(crypto.decrypt(authInfo.getFields().accessToken)).equals(authResponse.access_token);
        // @ts-expect-error - undefined un-assignable to string
        expect(crypto.decrypt(authInfo.getFields().refreshToken)).equals(refreshTokenConfig.refreshToken);
        // @ts-expect-error - undefined un-assignable to string
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
          await shouldThrow(AuthInfo.create({ username, oauth2Options: refreshTokenConfig }));
        } catch (err) {
          expect((err as Error).name).to.equal('RefreshTokenAuthError');
        }
      });
    });

    describe('Web Auth', () => {
      it('should return a refresh token AuthInfo instance when passed an authcode', async () => {
        const authCodeConfig = {
          authCode: testOrg.authcode,
          loginUrl: testOrg.loginUrl,
        };
        const authCodeConfigClone = structuredClone(authCodeConfig);
        const authResponse = {
          access_token: testOrg.accessToken,
          instance_url: testOrg.instanceUrl,
          id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
          refresh_token: testOrg.refreshToken,
        };

        // Stub the http requests (OAuth2.requestToken() and the request for the username)
        postParamsStub.resolves(authResponse);
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
        // @ts-expect-error - undefined un-assignable to string
        expect(crypto.decrypt(authInfo.getFields().accessToken)).equals(authResponse.access_token);
        // @ts-expect-error - undefined un-assignable to string
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
        const options: JwtOAuth2Config & { authCode?: string } = {
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
        postParamsStub.resolves(authResponse);
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
          await shouldThrow(AuthInfo.create({ oauth2Options: authCodeConfig }));
        } catch (err) {
          expect((err as Error).name).to.equal('AuthCodeExchangeError');
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
        postParamsStub.resolves(authResponse);
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
          await shouldThrow(AuthInfo.create({ oauth2Options: authCodeConfig }));
        } catch (err) {
          expect((err as Error).name).to.equal('AuthCodeUsernameRetrievalError');
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
        postParamsStub.resolves(authResponse);

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
          await shouldThrow(AuthInfo.create({ oauth2Options: authCodeConfig }));
        } catch (err) {
          expect((err as Error).name).to.equal('AuthCodeUsernameRetrievalError');
        }
      });

      it('should throw an error when neither username nor options have been passed', async () => {
        try {
          await shouldThrow(AuthInfo.create());
        } catch (err) {
          expect((err as Error).name).to.equal('AuthInfoCreationError');
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
      postParamsStub.resolves(authResponse);

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
      await authInfo.save(changedData);

      expect(authInfoStubs.update.called).to.be.true;
      expect(authInfoStubs.update.firstCall.args[0]).to.deep.equal(changedData);
      // expect(configFileWrite.called).to.be.true;

      const crypto = await Crypto.create();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const decryptedActualFields = $$.stubs.configWrite.lastCall.thisValue.toObject() as AuthFields & {
        timestamp: string;
      };
      // @ts-expect-error - undefined un-assignable to string
      decryptedActualFields.accessToken = crypto.decrypt(decryptedActualFields.accessToken);
      // @ts-expect-error - undefined un-assignable to string
      decryptedActualFields.refreshToken = crypto.decrypt(decryptedActualFields.refreshToken);
      // @ts-expect-error - undefined un-assignable to string
      decryptedActualFields.clientSecret = crypto.decrypt(decryptedActualFields.clientSecret);
      // @ts-expect-error - operand must be optional
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
        clientId: 'PlatformCLI',
        clientSecret: undefined,
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
      testCallback.resolves();

      context.initAuthOptions.resolves();
      context.save.resolves();
      // @ts-expect-error - null not valid
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
      stubMethod($$.SANDBOX, AuthInfo.prototype, 'getNamespacePrefix').resolves();

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
      context.save.resolves();
      // @ts-expect-error: null connection
      await AuthInfo.prototype['refreshFn'].call(context, null, testCallback);
      expect(testCallback.called).to.be.true;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const sfError = testCallback.firstCall.args[0];
      expect(sfError.name).to.equal('OrgDataNotAvailableError', sfError.message as string);
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

  describe('getSfdxAuthUrl', () => {
    it('should return the correct sfdx auth url', async () => {
      const authResponse = {
        access_token: testOrg.accessToken,
        instance_url: testOrg.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
      };

      // Stub the http request (OAuth2.refreshToken())
      postParamsStub.resolves(authResponse);

      // Create the refresh token AuthInfo instance
      const authInfo = await AuthInfo.create({
        username: testOrg.username,
        oauth2Options: {
          refreshToken: testOrg.refreshToken,
          loginUrl: testOrg.loginUrl,
        },
      });

      expect(authInfo.getSfdxAuthUrl()).to.contain(
        `force://PlatformCLI::${testOrg.refreshToken}@${testOrg.instanceUrl.replace('https://', '')}`
      );
    });

    it('should handle undefined client secret', async () => {
      const authResponse = {
        access_token: testOrg.accessToken,
        instance_url: testOrg.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
      };

      // Stub the http request (OAuth2.refreshToken())
      postParamsStub.resolves(authResponse);

      // Create the refresh token AuthInfo instance
      const authInfo = await AuthInfo.create({
        username: testOrg.username,
        oauth2Options: {
          refreshToken: testOrg.refreshToken,
          loginUrl: testOrg.loginUrl,
        },
      });

      // delete the client secret
      authInfo.update({ clientSecret: undefined });
      const instanceUrl = testOrg.instanceUrl.replace('https://', '');
      expect(authInfo.getSfdxAuthUrl()).to.contain(`force://PlatformCLI::${testOrg.refreshToken}@${instanceUrl}`);
    });

    it('should handle undefined refresh token', async () => {
      const authResponse = {
        access_token: testOrg.accessToken,
        instance_url: testOrg.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
      };

      // Stub the http request (OAuth2.refreshToken())
      postParamsStub.resolves(authResponse);

      // Create the refresh token AuthInfo instance
      const authInfo = await AuthInfo.create({
        username: testOrg.username,
        oauth2Options: {
          refreshToken: testOrg.refreshToken,
          loginUrl: testOrg.loginUrl,
        },
      });

      // delete the refresh token
      authInfo.update({ ...authInfo.getFields(), refreshToken: undefined });
      expect(() => authInfo.getSfdxAuthUrl()).to.throw('undefined refreshToken');
    });

    it('should handle undefined instance url', async () => {
      const authResponse = {
        access_token: testOrg.accessToken,
        instance_url: testOrg.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
      };

      // Stub the http request (OAuth2.refreshToken())
      postParamsStub.resolves(authResponse);

      // Create the refresh token AuthInfo instance
      const authInfo = await AuthInfo.create({
        username: testOrg.username,
        oauth2Options: {
          refreshToken: testOrg.refreshToken,
          loginUrl: testOrg.loginUrl,
        },
      });

      // delete the instance url
      authInfo.update({ ...authInfo.getFields(), instanceUrl: undefined });

      expect(() => authInfo.getSfdxAuthUrl()).to.throw('undefined instanceUrl');
    });
  });

  describe('setAlias', () => {
    const alias = 'MyAlias';

    it('should set alias', async () => {
      const aliasAccessorSpy = spyMethod($$.SANDBOX, AliasAccessor.prototype, 'set');
      const authInfo = await AuthInfo.create({ username: testOrg.username });
      await authInfo.setAlias(alias);
      expect(aliasAccessorSpy.calledOnce).to.be.true;
      expect(aliasAccessorSpy.firstCall.args).to.deep.equal([alias, testOrg.username]);
    });
  });

  describe('setAsDefault', () => {
    const alias = 'MyAlias';
    let configSpy: sinon.SinonSpy;

    beforeEach(() => {
      configSpy = spyMethod($$.SANDBOX, Config.prototype, 'set');
    });

    it('should set username to target-org', async () => {
      stubMethod($$.SANDBOX, AliasAccessor.prototype, 'get').returns(null);
      const authInfo = await AuthInfo.create({ username: testOrg.username });
      await authInfo.setAsDefault({ org: true });
      expect(configSpy.called).to.be.true;
      expect(configSpy.firstCall.args).to.deep.equal([OrgConfigProperties.TARGET_ORG, testOrg.username]);
    });

    it('should set username to target-dev-hub', async () => {
      stubMethod($$.SANDBOX, AliasAccessor.prototype, 'get').returns(null);
      const authInfo = await AuthInfo.create({ username: testOrg.username });
      await authInfo.setAsDefault({ devHub: true });
      expect(configSpy.called).to.be.true;
      expect(configSpy.firstCall.args).to.deep.equal([OrgConfigProperties.TARGET_DEV_HUB, testOrg.username]);
    });

    it('should set alias to target-org', async () => {
      stubMethod($$.SANDBOX, AliasAccessor.prototype, 'get').returns(alias);
      const authInfo = await AuthInfo.create({ username: testOrg.username });
      await authInfo.setAsDefault({ org: true });
      expect(configSpy.called).to.be.true;
      expect(configSpy.firstCall.args).to.deep.equal([OrgConfigProperties.TARGET_ORG, alias]);
    });

    it('should set alias to target-dev-hub', async () => {
      stubMethod($$.SANDBOX, AliasAccessor.prototype, 'get').returns(alias);
      const authInfo = await AuthInfo.create({ username: testOrg.username });
      await authInfo.setAsDefault({ devHub: true });
      expect(configSpy.called).to.be.true;
      expect(configSpy.firstCall.args).to.deep.equal([OrgConfigProperties.TARGET_DEV_HUB, alias]);
    });

    it('should use global config if local config fails', async () => {
      stubMethod($$.SANDBOX, AliasAccessor.prototype, 'get').returns(null);
      stubMethod($$.SANDBOX, Config, 'create')
        .withArgs({ isGlobal: false })
        .throws()
        .withArgs({ isGlobal: true })
        .callThrough();
      const authInfo = await AuthInfo.create({ username: testOrg.username });
      await authInfo.setAsDefault({ org: true });
      expect(configSpy.called).to.be.true;
      expect(configSpy.firstCall.args).to.deep.equal([OrgConfigProperties.TARGET_ORG, testOrg.username]);
    });
  });

  describe('getDefaultInstanceUrl', () => {
    it('should return the configured instance url if it exists', async () => {
      await $$.stubConfig({ [OrgConfigProperties.ORG_INSTANCE_URL]: testOrg.instanceUrl });
      expect(AuthInfo.getDefaultInstanceUrl()).to.equal(testOrg.instanceUrl);
    });

    it('should return the default instance url if no configured instance url exists', () => {
      expect(AuthInfo.getDefaultInstanceUrl()).to.equal('https://login.salesforce.com');
    });
  });

  describe('hasAuthentications', () => {
    it('should return false', async () => {
      stubMethod($$.SANDBOX, OrgAccessor.prototype, 'list').returns([]);
      expect(await AuthInfo.hasAuthentications()).to.be.false;
    });

    it('should return true', async () => {
      await $$.stubAuths(testOrg);
      expect(await AuthInfo.hasAuthentications()).to.be.true;
    });
  });
  describe('getNamespacePrefix', () => {
    it('should get the namespace associated to the org', async () => {
      $$.setConfigStubContents('AuthInfoConfig', { contents: await testOrg.getConfig() });

      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest')
        .withArgs(
          match({
            url: `${testOrg.instanceUrl}//services/data/v51.0/query?q=Select%20Namespaceprefix%20FROM%20Organization`,
          })
        )
        .resolves({
          statusCode: 200,
          body: JSON.stringify({
            records: [
              {
                NamespacePrefix: `acme_${testOrg.testId}`,
              },
            ],
          }),
        });
      const authInfo = await AuthInfo.create({ username: testOrg.username });
      // @ts-expect-error because private method
      expect(await authInfo.getNamespacePrefix(testOrg.instanceUrl, testOrg.accessToken)).to.equal(
        `acme_${testOrg.testId}`
      );

      expect(authInfo.getFields().namespacePrefix).to.equal(`acme_${testOrg.testId}`);
    });
    it('should not set namespace prop if org doesn not have one', async () => {
      const orgConfig = await testOrg.getConfig();
      orgConfig.namespacePrefix = undefined;
      $$.setConfigStubContents('AuthInfoConfig', { contents: orgConfig });

      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest')
        .withArgs(
          match({
            url: `${testOrg.instanceUrl}//services/data/v51.0/query?q=Select%20Namespaceprefix%20FROM%20Organization`,
          })
        )
        .resolves({
          statusCode: 200,
          body: JSON.stringify({
            records: [
              {
                NamespacePrefix: null,
              },
            ],
          }),
        });
      const authInfo = await AuthInfo.create({ username: testOrg.username });
      // @ts-expect-error because private method
      expect(await authInfo.getNamespacePrefix(testOrg.instanceUrl, testOrg.accessToken)).to.be.undefined;
      expect(authInfo.getFields().namespacePrefix).to.be.undefined;
    });
  });

  describe('listAllAuthorizations', () => {
    describe('with no AuthInfo.create errors', () => {
      beforeEach(async () => {
        await $$.stubAuths(testOrg);
      });

      it('should return list of authorizations with web oauthMethod', async () => {
        stubMethod($$.SANDBOX, AuthInfo.prototype, 'isJwt').returns(false);
        stubMethod($$.SANDBOX, AuthInfo.prototype, 'isOauth').returns(true);
        const auths = await AuthInfo.listAllAuthorizations(
          (orgAuth) => orgAuth.oauthMethod !== 'jwt' && !orgAuth.isScratchOrg
        );
        expect(auths).to.deep.equal([
          {
            aliases: [],
            configs: [],
            isScratchOrg: false,
            username: testOrg.username,
            orgId: testOrg.orgId,
            instanceUrl: testOrg.instanceUrl,
            accessToken: testOrg.accessToken,
            oauthMethod: 'web',
            isDevHub: false,
            isExpired: 'unknown',
            isSandbox: false,
          },
        ]);
      });

      it('should return list of authorizations with jwt oauthMethod', async () => {
        stubMethod($$.SANDBOX, AuthInfo.prototype, 'isJwt').returns(true);
        const auths = await AuthInfo.listAllAuthorizations();
        expect(auths).to.deep.equal([
          {
            aliases: [],
            configs: [],
            isScratchOrg: false,
            username: testOrg.username,
            orgId: testOrg.orgId,
            instanceUrl: testOrg.instanceUrl,
            accessToken: testOrg.accessToken,
            oauthMethod: 'jwt',
            isDevHub: false,
            isExpired: 'unknown',
            isSandbox: false,
          },
        ]);
      });

      it('should return list of authorizations with token oauthMethod', async () => {
        stubMethod($$.SANDBOX, AuthInfo.prototype, 'isJwt').returns(false);
        stubMethod($$.SANDBOX, AuthInfo.prototype, 'isOauth').returns(false);
        const auths = await AuthInfo.listAllAuthorizations();
        expect(auths).to.deep.equal([
          {
            aliases: [],
            configs: [],
            isScratchOrg: false,
            username: testOrg.username,
            orgId: testOrg.orgId,
            instanceUrl: testOrg.instanceUrl,
            accessToken: testOrg.accessToken,
            oauthMethod: 'token',
            isDevHub: false,
            isExpired: 'unknown',
            isSandbox: false,
          },
        ]);
      });

      it('should return list of authorizations with aliases', async () => {
        $$.stubAliases({ MyAlias: testOrg.username });
        const auths = await AuthInfo.listAllAuthorizations(
          (orgAuth) => orgAuth.aliases?.length === 1 && orgAuth.aliases.includes('MyAlias')
        );
        expect(auths).to.deep.equal([
          {
            aliases: ['MyAlias'],
            configs: [],
            isScratchOrg: false,
            username: testOrg.username,
            orgId: testOrg.orgId,
            instanceUrl: testOrg.instanceUrl,
            accessToken: testOrg.accessToken,
            oauthMethod: 'jwt',
            isDevHub: false,
            isExpired: 'unknown',
            isSandbox: false,
          },
        ]);
      });

      it('should return list of authorizations with configs', async () => {
        $$.stubAliases({ MyAlias: testOrg.username });
        await $$.stubConfig({
          [OrgConfigProperties.TARGET_ORG]: 'MyAlias',
          [OrgConfigProperties.TARGET_DEV_HUB]: testOrg.username,
        });
        const auths = await AuthInfo.listAllAuthorizations((orgAuth) =>
          orgAuth.configs ? orgAuth.configs.includes(OrgConfigProperties.TARGET_ORG) : false
        );
        expect(auths).to.deep.equal([
          {
            aliases: ['MyAlias'],
            configs: [OrgConfigProperties.TARGET_DEV_HUB, OrgConfigProperties.TARGET_ORG],
            isScratchOrg: false,
            username: testOrg.username,
            orgId: testOrg.orgId,
            instanceUrl: testOrg.instanceUrl,
            accessToken: testOrg.accessToken,
            oauthMethod: 'jwt',
            isDevHub: false,
            isExpired: 'unknown',
            isSandbox: false,
          },
        ]);
      });

      it('should return list of authorizations devhub username', async () => {
        const expiryDate = new Date(Date.now());
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        stubMethod($$.SANDBOX, AuthInfo.prototype, 'getFields').returns({
          ...(await testOrg.getConfig()),
          devHubUsername: 'foobarusername',
          expirationDate: expiryDate.toISOString(),
        });
        const auths = await AuthInfo.listAllAuthorizations();
        expect(auths).to.deep.equal([
          {
            aliases: [],
            configs: [],
            isScratchOrg: true,
            username: testOrg.username,
            orgId: testOrg.orgId,
            instanceUrl: testOrg.instanceUrl,
            accessToken: testOrg.accessToken,
            oauthMethod: 'jwt',
            isDevHub: false,
            isExpired: false,
            isSandbox: false,
          },
        ]);
      });
    });

    describe('with AuthInfo.create errors', () => {
      beforeEach(async () => {
        await $$.stubAuths(testOrg);
        stubMethod($$.SANDBOX, AuthInfo, 'create').withArgs({ username: testOrg.username }).throws(new Error('FAIL!'));
      });

      it('should return list of authorizations with unknown oauthMethod', async () => {
        const auths = await AuthInfo.listAllAuthorizations((orgAuth) => orgAuth.error === 'FAIL!');
        expect(auths).to.deep.equal([
          {
            aliases: [],
            configs: [],
            username: testOrg.username,
            orgId: testOrg.orgId,
            instanceUrl: testOrg.instanceUrl,
            isExpired: 'unknown',
            accessToken: undefined,
            oauthMethod: 'unknown',
            error: 'FAIL!',
          },
        ]);
      });

      it('should return list of authorizations with unknown oauthMethod and alias', async () => {
        $$.stubAliases({ MyAlias: testOrg.username });
        const auths = await AuthInfo.listAllAuthorizations();
        expect(auths).to.deep.equal([
          {
            aliases: ['MyAlias'],
            configs: [],
            username: testOrg.username,
            orgId: testOrg.orgId,
            instanceUrl: testOrg.instanceUrl,
            isExpired: 'unknown',
            accessToken: undefined,
            oauthMethod: 'unknown',
            error: 'FAIL!',
          },
        ]);
      });
    });
  });

  describe('parseSfdxAuthUrl', () => {
    it('should parse the correct url with no client secret', () => {
      const options = AuthInfo.parseSfdxAuthUrl(
        'force://PlatformCLI::5Aep861_OKMvio5gy8xCNsXxybPdupY9fVEZyeVOvb4kpOZx5Z1QLB7k7n5flEqEWKcwUQEX1I.O5DCFwjlYUB.@test.my.salesforce.com'
      );

      expect(options.refreshToken).to.equal(
        '5Aep861_OKMvio5gy8xCNsXxybPdupY9fVEZyeVOvb4kpOZx5Z1QLB7k7n5flEqEWKcwUQEX1I.O5DCFwjlYUB.'
      );
      expect(options.clientId).to.equal('PlatformCLI');
      expect(options.clientSecret).to.equal('');
      expect(options.loginUrl).to.equal('https://test.my.salesforce.com');
    });

    it('should parse an id, secret, and token that include = for padding', () => {
      const options = AuthInfo.parseSfdxAuthUrl(
        'force://3MVG9SemV5D80oBfPBCgboxuJ9cOMLWNM1DDOZ8zgvJGsz13H3J66coUBCFF3N0zEgLYijlkqeWk4ot_Q2.4o=:438437816653243682==:5Aep861_OKMvio5gy8xCNsXxybPdupY9fVEZyeVOvb4kpOZx5Z1QLB7k7n5flEqEWKcwUQEX1I.O5DCFwjlYU==@test.my.salesforce.com'
      );

      expect(options.refreshToken).to.equal(
        '5Aep861_OKMvio5gy8xCNsXxybPdupY9fVEZyeVOvb4kpOZx5Z1QLB7k7n5flEqEWKcwUQEX1I.O5DCFwjlYU=='
      );
      expect(options.clientId).to.equal(
        '3MVG9SemV5D80oBfPBCgboxuJ9cOMLWNM1DDOZ8zgvJGsz13H3J66coUBCFF3N0zEgLYijlkqeWk4ot_Q2.4o='
      );
      expect(options.clientSecret).to.equal('438437816653243682==');
      expect(options.loginUrl).to.equal('https://test.my.salesforce.com');
    });

    it('should parse the correct url with client secret', () => {
      const options = AuthInfo.parseSfdxAuthUrl(
        'force://3MVG9SemV5D80oBfPBCgboxuJ9cOMLWNM1DDOZ8zgvJGsz13H3J66coUBCFF3N0zEgLYijlkqeWk4ot_Q2.4o:438437816653243682:5Aep861_OKMvio5gy8xCNsXxybPdupY9fVEZyeVOvb4kpOZx5Z1QLB7k7n5flEqEWKcwUQEX1I.O5DCFwjlYUB.@test.my.salesforce.com'
      );

      expect(options.refreshToken).to.equal(
        '5Aep861_OKMvio5gy8xCNsXxybPdupY9fVEZyeVOvb4kpOZx5Z1QLB7k7n5flEqEWKcwUQEX1I.O5DCFwjlYUB.'
      );
      expect(options.clientId).to.equal(
        '3MVG9SemV5D80oBfPBCgboxuJ9cOMLWNM1DDOZ8zgvJGsz13H3J66coUBCFF3N0zEgLYijlkqeWk4ot_Q2.4o'
      );
      expect(options.clientSecret).to.equal('438437816653243682');
      expect(options.loginUrl).to.equal('https://test.my.salesforce.com');
    });

    it('should throw with incorrect url', () => {
      try {
        shouldThrowSync(() =>
          AuthInfo.parseSfdxAuthUrl(
            'PlatformCLI::5Aep861_OKMvio5gy8xCNsXxybPdupY9fVEZyeVOvb4kpOZx5Z1QLB7k7n5flEqEWKcwUQEX1I.O5DCFwjlYUB.@test.my.salesforce.com'
          )
        );
      } catch (e) {
        expect((e as Error).name).to.equal('INVALID_SFDX_AUTH_URL');
      }
    });
  });

  describe('Handle User HTTP Get Errors', () => {
    let authCodeConfig: { authCode: string; loginUrl: string };

    beforeEach(() => {
      authCodeConfig = {
        authCode: testOrg.authcode,
        loginUrl: testOrg.loginUrl,
      };

      // Stub the http requests (OAuth2.requestToken() and the request for the username)
      postParamsStub.resolves({
        access_token: testOrg.accessToken,
        instance_url: testOrg.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        refresh_token: testOrg.refreshToken,
      });
    });

    it('user get returns 403 with body of json array', async () => {
      const responseBody = {
        statusCode: 403,
        body: JSON.stringify([
          {
            message: 'The REST API is not enabled for this Organization',
            errorCode: 'RESTAPINOTENABLED',
          },
        ]),
      };
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').resolves(responseBody);
      try {
        await shouldThrow(AuthInfo.create({ oauth2Options: authCodeConfig }));
      } catch (err) {
        expect(err).to.have.property('message').to.include('The REST API is not enabled for this Organization');
      }
    });

    it('user get returns 403 with body of json map', async () => {
      const responseBody = {
        statusCode: 403,
        body: JSON.stringify({
          message: 'The REST API is not enabled for this Organization',
          errorCode: 'RESTAPINOTENABLED',
        }),
      };
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').resolves(responseBody);
      try {
        await shouldThrow(AuthInfo.create({ oauth2Options: authCodeConfig }));
      } catch (err) {
        expect(err).to.have.property('message').to.include('The REST API is not enabled for this Organization');
      }
    });

    it('user get returns 403 with string body', async () => {
      const responseBody = {
        statusCode: 403,
        body: 'The REST API is not enabled for this Organization',
      };
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').resolves(responseBody);
      try {
        await shouldThrow(AuthInfo.create({ oauth2Options: authCodeConfig }));
      } catch (err) {
        expect(err).to.have.property('message').to.include('The REST API is not enabled for this Organization');
      }
    });

    it('user get returns server error with no body', async () => {
      const responseBody = { statusCode: 500 };
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').resolves(responseBody);
      try {
        await shouldThrow(AuthInfo.create({ oauth2Options: authCodeConfig }));
      } catch (err) {
        expect(err).to.have.property('message').to.include('UNKNOWN');
      }
    });

    it('user get returns server error with html body', async () => {
      const responseBody = {
        statusCode: 500,
        body: '<html lang=""><body>Server error occurred, please contact Salesforce Support if the error persists</body></html>',
      };
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').resolves(responseBody);
      try {
        await shouldThrow(AuthInfo.create({ oauth2Options: authCodeConfig }));
      } catch (err) {
        expect(err).to.have.property('message').to.include('Server error occurred');
      }
    });
  });

  describe('getDevHubAuthInfos', () => {
    let adminTestData: MockTestOrgData;
    let user1: MockTestOrgData;

    beforeEach(async () => {
      adminTestData = new MockTestOrgData();
      user1 = new MockTestOrgData();
    });

    it('should not find a dev hub when no authInfos exist', async () => {
      stubMethod($$.SANDBOX, AuthInfo, 'listAllAuthorizations').resolves([]);
      const result = await AuthInfo.getDevHubAuthInfos();
      expect(result).to.have.lengthOf(0);
    });

    it('should not find a dev hub when one auth info exists that is not a dev hub', async () => {
      await $$.stubAuths(user1);
      const result = await AuthInfo.getDevHubAuthInfos();
      expect(result).to.have.lengthOf(0);
    });

    it('should find a dev hub', async () => {
      adminTestData.makeDevHub();
      await $$.stubAuths(adminTestData, user1);
      const result = await AuthInfo.getDevHubAuthInfos();
      expect(result).to.have.lengthOf(1);
    });
  });

  describe('identifyPossibleScratchOrgs', () => {
    let adminTestData: MockTestOrgData;
    let user1: MockTestOrgData;

    beforeEach(async () => {
      adminTestData = new MockTestOrgData();
      user1 = new MockTestOrgData();
    });

    it('should not update auth file - no dev hubs', async () => {
      await $$.stubAuths(adminTestData, user1);

      const authInfo = await AuthInfo.create({
        username: user1.username,
      });

      const getDevHubAuthInfosStub = stubMethod($$.SANDBOX, AuthInfo, 'getDevHubAuthInfos').resolves([]);
      stubMethod($$.SANDBOX, AuthInfo, 'listAllAuthorizations').resolves([]);
      const queryScratchOrgStub = stubMethod($$.SANDBOX, AuthInfo, 'queryScratchOrg');
      const authInfoSaveStub = stubMethod($$.SANDBOX, AuthInfo.prototype, 'save');
      stubMethod($$.SANDBOX, Org.prototype, 'querySandboxProcessByOrgId').throws();

      await AuthInfo.identifyPossibleScratchOrgs({ orgId: user1.orgId }, authInfo);
      expect(getDevHubAuthInfosStub.callCount).to.be.equal(1);
      expect(queryScratchOrgStub.callCount).to.be.equal(0);
      expect(authInfoSaveStub.callCount).to.be.equal(0);
    });

    it('should not update auth file - state already known', async () => {
      adminTestData.makeDevHub();
      user1.isScratchOrg = true;
      user1.devHubUsername = adminTestData.username;

      await $$.stubAuths(adminTestData, user1);

      const authInfo = await AuthInfo.create({
        username: user1.username,
      });

      const getDevHubAuthInfosStub = stubMethod($$.SANDBOX, AuthInfo, 'getDevHubAuthInfos').resolves([]);
      const queryScratchOrgStub = stubMethod($$.SANDBOX, AuthInfo, 'queryScratchOrg');
      const authInfoSaveStub = stubMethod($$.SANDBOX, AuthInfo.prototype, 'save');
      stubMethod($$.SANDBOX, Org.prototype, 'querySandboxProcessByOrgId').throws();

      await AuthInfo.identifyPossibleScratchOrgs(authInfo.getFields(), authInfo);
      expect(getDevHubAuthInfosStub.callCount).to.be.equal(0);
      expect(queryScratchOrgStub.callCount).to.be.equal(0);
      expect(authInfoSaveStub.callCount).to.be.equal(0);
    });

    it('should not update auth file - no fields.orgId', async () => {
      adminTestData.makeDevHub();
      user1.isScratchOrg = true;
      // @ts-expect-error - operand must be optional
      delete user1.orgId;
      user1.devHubUsername = adminTestData.username;

      await $$.stubAuths(adminTestData, user1);
      const authInfo = await AuthInfo.create({
        username: user1.username,
      });

      const getDevHubAuthInfosSpy = spyMethod($$.SANDBOX, AuthInfo, 'getDevHubAuthInfos');
      const queryScratchOrgStub = stubMethod($$.SANDBOX, AuthInfo, 'queryScratchOrg');
      const authInfoSaveStub = stubMethod($$.SANDBOX, AuthInfo.prototype, 'save');
      stubMethod($$.SANDBOX, Org.prototype, 'querySandboxProcessByOrgId').throws();

      await AuthInfo.identifyPossibleScratchOrgs(authInfo.getFields(), authInfo);
      expect(getDevHubAuthInfosSpy.callCount).to.be.equal(0);
      expect(queryScratchOrgStub.callCount).to.be.equal(0);
      expect(authInfoSaveStub.callCount).to.be.equal(0);
    });

    it('should update auth file as a scratch org', async () => {
      adminTestData.makeDevHub();

      await $$.stubAuths(adminTestData, user1);

      const authInfo = await AuthInfo.create({
        username: user1.username,
      });

      const devhubAuths = await AuthInfo.getDevHubAuthInfos();
      const getDevHubAuthInfosStub = stubMethod($$.SANDBOX, AuthInfo, 'getDevHubAuthInfos').resolves(devhubAuths);
      stubMethod($$.SANDBOX, AuthInfo, 'listAllAuthorizations').resolves([]);
      const queryScratchOrgStub = stubMethod($$.SANDBOX, AuthInfo, 'queryScratchOrg').resolves({
        Id: '123',
        ExpirationDate: '2020-01-01',
      });
      const authInfoSaveStub = stubMethod($$.SANDBOX, AuthInfo.prototype, 'save');
      stubMethod($$.SANDBOX, Org.prototype, 'querySandboxProcessByOrgId').throws();

      await AuthInfo.identifyPossibleScratchOrgs(authInfo.getFields(), authInfo);
      expect(getDevHubAuthInfosStub.callCount).to.be.equal(1);
      expect(queryScratchOrgStub.callCount).to.be.equal(1);
      expect(authInfoSaveStub.callCount).to.be.equal(1);
    });

    it('should update auth file as a sandbox from possible prod orgs', async () => {
      adminTestData.makeDevHub();

      await $$.stubAuths(adminTestData, user1);

      const authInfo = await AuthInfo.create({
        username: user1.username,
      });

      const stateAggregator = await StateAggregator.getInstance();
      const stateAggregatorStub = stubMethod($$.SANDBOX, StateAggregator, 'getInstance');
      const sandboxSetStub = stubMethod($$.SANDBOX, stateAggregator.sandboxes, 'set');
      const sandboxWriteStub = stubMethod($$.SANDBOX, stateAggregator.sandboxes, 'write');
      stateAggregatorStub.resolves(stateAggregator);
      const devhubAuths = await AuthInfo.getDevHubAuthInfos();
      stubMethod($$.SANDBOX, AuthInfo, 'getDevHubAuthInfos').resolves([]);
      stubMethod($$.SANDBOX, AuthInfo, 'listAllAuthorizations').resolves(devhubAuths);
      const authInfoSaveStub = stubMethod($$.SANDBOX, AuthInfo.prototype, 'save').resolves();
      const queryScratchOrgStub = stubMethod($$.SANDBOX, AuthInfo, 'queryScratchOrg');
      const queryScratchOrgError = new Error('not a scratch org');
      queryScratchOrgError.name = 'SingleRecordQuery_NoRecords';
      queryScratchOrgStub.throws(queryScratchOrgError);
      const sbxQueryStub = stubMethod($$.SANDBOX, Org.prototype, 'querySandboxProcessByOrgId');
      sbxQueryStub.resolves({
        Id: '0GRB0000000L0ZVOA0',
        Status: 'Completed',
        SandboxName: 'TestSandbox',
        SandboxInfoId: '0GQB0000000PCOdOAO',
        LicenseType: 'DEVELOPER',
        CreatedDate: '2021-01-22T22:49:52.000+0000',
      });

      await AuthInfo.identifyPossibleScratchOrgs(authInfo.getFields(), authInfo);

      expect(authInfoSaveStub.callCount).to.be.equal(2);
      expect(authInfoSaveStub.secondCall.args[0]).to.have.property('isSandbox', true);
      expect(authInfoSaveStub.secondCall.args[0]).to.have.property('isScratch', false);
      expect(sandboxSetStub.calledOnce).to.be.true;
      expect(sandboxSetStub.firstCall.args[0]).to.equal(authInfo.getFields().orgId);
      expect(sandboxSetStub.firstCall.args[1]).to.have.property('prodOrgUsername', adminTestData.username);
      expect(sandboxWriteStub.calledOnce).to.be.true;
      expect(sandboxWriteStub.firstCall.args[0]).to.equal(authInfo.getFields().orgId);
    });
  });

  describe('determineIfDevHub', () => {
    it('should return true if request succeeds', async () => {
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').resolves({
        statusCode: 200,
        body: JSON.stringify([]),
      });
      const authInfo = await AuthInfo.create({ username: testOrg.username });
      // @ts-expect-error because private method
      expect(await authInfo.determineIfDevHub(testOrg.instanceUrl, testOrg.accessToken)).to.be.true;
    });

    it('should return false if request returns 400', async () => {
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').resolves({
        statusCode: 400,
        body: JSON.stringify([]),
      });
      const authInfo = await AuthInfo.create({ username: testOrg.username });
      // @ts-expect-error because private method
      expect(await authInfo.determineIfDevHub(testOrg.instanceUrl, testOrg.accessToken)).to.be.false;
    });

    it('should return false if request fails', async () => {
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').throws();
      const authInfo = await AuthInfo.create({ username: testOrg.username });
      // @ts-expect-error because private method
      expect(await authInfo.determineIfDevHub(testOrg.instanceUrl, testOrg.accessToken)).to.be.false;
    });
  });

  describe('loadDecryptedAuthFromConfig', () => {
    const expectedErrorName = 'NamedOrgNotFoundError';
    it('should throw error if no auth file is found', async () => {
      try {
        const authInfo = await AuthInfo.create({ username: testOrg.username });
        // @ts-expect-error because private method
        await shouldThrow(authInfo.loadDecryptedAuthFromConfig('DOES_NOT_EXIST'));
      } catch (e) {
        expect(e).to.have.property('name', expectedErrorName);
      }
    });
  });
});

describe('AuthInfo No fs mock', () => {
  const $$ = new TestContext();

  const TEST_KEY = {
    service: 'sfdx',
    account: 'local',
    key: '8e8fd1e6dc06a37bf420898dbc3ee35c',
  };

  beforeEach(() => {
    // Testing crypto functionality, so restore global stubs.
    $$.SANDBOX.restore();
    $$.SANDBOXES.CRYPTO.restore();
    $$.SANDBOXES.CONFIG.restore();
    $$.SANDBOXES.ORGS.restore();

    stubMethod($$.SANDBOX, Crypto.prototype, 'getKeyChain').callsFake(() =>
      Promise.resolve({
        setPassword: () => Promise.resolve(),
        getPassword: (data: JsonMap, cb: (val1: AnyJson, key: string) => {}) => cb(null, TEST_KEY.key),
      })
    );
  });

  it('missing config', async () => {
    const expectedErrorName = 'NamedOrgNotFoundError';
    try {
      await shouldThrow(AuthInfo.create({ username: 'does_not_exist@gb.com' }));
    } catch (e) {
      expect(e).to.have.property('name', expectedErrorName);
    }
  });

  it('invalid devhub username', async () => {
    const expectedErrorName = 'NamedOrgNotFoundError';
    try {
      await shouldThrow(AuthInfo.create({ username: 'does_not_exist@gb.com', isDevHub: true }));
    } catch (e) {
      expect(e).to.have.property('name', expectedErrorName);
      expect(e).to.have.property('message', 'No authorization information found for does_not_exist@gb.com.');
    }
  });
});
