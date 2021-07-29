/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/ban-types */

import * as dns from 'dns';
import * as pathImport from 'path';
import { URL } from 'url';
import { cloneJson, Duration, env, includes, set } from '@salesforce/kit';
import { spyMethod, stubMethod } from '@salesforce/ts-sinon';
import { AnyFunction, AnyJson, ensureString, getJsonMap, getString, JsonMap, toJsonMap } from '@salesforce/ts-types';
import { assert, expect } from 'chai';
import { OAuth2, OAuth2Options } from 'jsforce';
import { match } from 'sinon';
// @ts-ignore
import * as Transport from 'jsforce/lib/transport';
import * as jwt from 'jsonwebtoken';
import { AuthFields, AuthInfo, OAuth2WithVerifier } from '../../../src/org/authInfo';
import { Config } from '../../../src/config/config';
import { ConfigAggregator } from '../../../src/config/configAggregator';
import { ConfigFile } from '../../../src/config/configFile';
import { ConfigContents } from '../../../src/config/configStore';
import { AliasAccessor, GlobalInfo, OrgAccessor } from '../../../src/config/globalInfoConfig';
import { Crypto } from '../../../src/crypto/crypto';
import { SfdxError } from '../../../src/sfdxError';
import { testSetup } from '../../../src/testSetup';
import { fs } from '../../../src/util/fs';
import { MyDomainResolver } from '../../../src/exported';
import { OrgConfigProperties } from '../../../src/org/orgConfigProperties';

const TEST_KEY = {
  service: 'sfdx',
  account: 'local',
  key: '8e8fd1e6dc06a37bf420898dbc3ee35c',
};

// Setup the test environment.
const $$ = testSetup();

describe('AuthInfo No fs mock', () => {
  beforeEach(() => {
    // Testing crypto functionality, so restore global stubs.
    $$.SANDBOXES.CRYPTO.restore();
    $$.SANDBOXES.CONFIG.restore();

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
      await AuthInfo.create({ username: 'does_not_exist@gb.com' });
      assert.fail(`should have thrown error with name: ${expectedErrorName}`);
    } catch (e) {
      expect(e).to.have.property('name', expectedErrorName);
    }
  });
});

// Cleanly encapsulate the test data.
class MetaAuthDataMock {
  private _instanceUrl = 'http://mydevhub.localhost.internal.salesforce.com:6109';
  private _accessToken = 'authInfoTest_access_token';
  private _encryptedAccessToken: string = this._accessToken;
  private _refreshToken = 'authInfoTest_refresh_token';
  private _encryptedRefreshToken: string = this._refreshToken;
  private _clientId = 'authInfoTest_client_id';
  private _loginUrl = 'https://foo.bar.baz';
  private _jwtUsername = 'authInfoTest_username_JWT';
  private _redirectUri = 'http://localhost:1717/OauthRedirect';
  private _authCode = 'authInfoTest_authCode';
  private _authInfoLookupCount = 0;
  private _defaultConnectedAppInfo: AuthFields = {
    clientId: 'SalesforceDevelopmentExperience',
    clientSecret: '1384510088588713504',
  };
  private _expirationDate = '12-02-20';
  private _clientSecret = 'client_secret';
  private _orgId = 'testOrgId';

  public constructor() {
    this._jwtUsername = `${this._jwtUsername}_${$$.uniqid()}`;
  }

  public get instanceUrl(): string {
    return this._instanceUrl;
  }

  public set instanceUrl(value: string) {
    this._instanceUrl = value;
  }

  public get accessToken(): string {
    return this._accessToken;
  }

  public get refreshToken(): string {
    return this._refreshToken;
  }

  public get clientId(): string {
    return this._clientId;
  }

  public get loginUrl(): string {
    return this._loginUrl;
  }

  public set loginUrl(value: string) {
    this._loginUrl = value;
  }

  public get jwtUsername(): string {
    return this._jwtUsername;
  }

  public set jwtUsername(value: string) {
    this._jwtUsername = value;
  }

  public get username(): string {
    return this._jwtUsername;
  }

  public get redirectUri(): string {
    return this._redirectUri;
  }

  public get authCode(): string {
    return this._authCode;
  }

  public set authCode(value: string) {
    this._authCode = value;
  }

  public get defaultConnectedAppInfo(): AuthFields {
    return this._defaultConnectedAppInfo;
  }

  public get encryptedAccessToken(): string {
    return this._encryptedAccessToken;
  }

  public set encryptedAccessToken(value: string) {
    this._encryptedAccessToken = value;
  }

  public get encryptedRefreshToken(): string {
    return this._encryptedRefreshToken;
  }

  public set encryptedRefreshToken(value: string) {
    this._encryptedRefreshToken = value;
  }

  public get expirationDate(): string {
    return this._expirationDate;
  }

  public set expirationDate(value: string) {
    this._expirationDate = value;
  }

  public get authInfoLookupCount(): number {
    return this._authInfoLookupCount;
  }

  public get clientSecret(): string {
    return this._clientSecret;
  }

  public get orgId(): string {
    return this._orgId;
  }

  public fetchConfigInfo(path: string): ConfigContents {
    if (path.includes('sf.json')) {
      this._authInfoLookupCount = this._authInfoLookupCount + 1;
      // const configContents = new Map<string, ConfigValue>();
      const configContents = {};

      set(configContents, 'instanceUrl', 'http://mydevhub.localhost.internal.salesforce.com:6109');
      set(configContents, 'accessToken', this.encryptedAccessToken);
      set(configContents, 'privateKey', '123456');
      set(configContents, 'username', this.username);
      return configContents;
    } else {
      return {};
    }
  }

  public async statForKeyFile(path: string): Promise<{}> {
    if (!path.includes('key.json')) {
      return new SfdxError(`Unexpected path: ${path}`, 'UnexpectedInput');
    }

    return Promise.resolve({
      dev: 16777221,
      mode: 16768,
      nlink: 32,
      uid: 1613127851,
      gid: 0,
      rdev: 0,
      blksize: 4194304,
      ino: 81943357,
      size: 1024,
      blocks: 0,
      atimeMs: 1517934734270.9426,
      mtimeMs: 1517879310026.148,
      ctimeMs: 1517879310026.148,
      birthtimeMs: 1510678165000,
      atime: new Date('2018-02-06T16:32:14.271Z'),
      mtime: new Date('2018-02-06T01:08:30.026Z'),
      ctime: new Date('2018-02-06T01:08:30.026Z'),
      birthtime: new Date('2017-11-14T16:49:25.000Z'),
    });
  }
}

describe('AuthInfo', () => {
  let authInfoInit: sinon.SinonSpy;
  let authInfoUpdate: sinon.SinonSpy;
  let authInfoBuildJwtConfig: sinon.SinonSpy;
  let authInfoBuildRefreshTokenConfig: sinon.SinonSpy;
  let authInfoExchangeToken: sinon.SinonSpy;

  let configFileWrite: sinon.SinonStub;

  let readFileStub: sinon.SinonStub;
  let _postParmsStub: sinon.SinonStub;

  let testMetadata: MetaAuthDataMock;

  beforeEach(async () => {
    // Testing config functionality, so restore global stubs.
    $$.SANDBOXES.CONFIG.restore();

    testMetadata = new MetaAuthDataMock();

    stubMethod($$.SANDBOX, fs, 'stat').callsFake(async (path: string) => {
      return testMetadata.statForKeyFile(path);
    });

    // Common stubs
    configFileWrite = stubMethod($$.SANDBOX, ConfigFile.prototype, 'write').callsFake(async () => {
      return Promise.resolve();
    });

    stubMethod($$.SANDBOX, fs, 'mkdirp').resolves();
    stubMethod($$.SANDBOX, fs, 'write')
      .withArgs(match(/.*key.json/))
      .resolves()
      .rejects(); // .callThrough;
    stubMethod($$.SANDBOX, fs, 'readJsonMap')
      .withArgs(match(/.*key.json/))
      .resolves({})
      .rejects();

    function read(this: GlobalInfo) {
      const authData = testMetadata.fetchConfigInfo(this.getPath());
      const username = (authData.username || testMetadata.username) as string;
      const contents = {
        orgs: { [username]: authData },
      };
      this.setContentsFromObject(contents);
      return this.getContents();
    }
    stubMethod($$.SANDBOX, ConfigFile.prototype, 'read').callsFake(read);
    stubMethod($$.SANDBOX, ConfigFile.prototype, 'readSync').callsFake(read);

    const crypto = await Crypto.create();
    testMetadata.encryptedAccessToken = crypto.encrypt(testMetadata.accessToken) || '';
    testMetadata.encryptedRefreshToken = crypto.encrypt(testMetadata.refreshToken) || '';

    // These stubs return different objects based on the tests
    _postParmsStub = stubMethod($$.SANDBOX, OAuth2.prototype, '_postParams');
    readFileStub = stubMethod($$.SANDBOX, fs, 'readFile');

    // Spies
    authInfoInit = spyMethod($$.SANDBOX, AuthInfo.prototype, 'initAuthOptions');
    authInfoUpdate = spyMethod($$.SANDBOX, AuthInfo.prototype, 'update');
    authInfoBuildJwtConfig = spyMethod($$.SANDBOX, AuthInfo.prototype, 'buildJwtConfig');
    authInfoBuildRefreshTokenConfig = spyMethod($$.SANDBOX, AuthInfo.prototype, 'buildRefreshTokenConfig');
    authInfoExchangeToken = spyMethod($$.SANDBOX, AuthInfo.prototype, 'exchangeToken');
  });

  describe('Secret Tests', () => {
    let authInfo: AuthInfo;
    let decryptedRefreshToken: string;
    beforeEach(async () => {
      const authCodeConfig = {
        authCode: testMetadata.authCode,
        loginUrl: testMetadata.loginUrl,
      };
      const authResponse = {
        access_token: testMetadata.accessToken,
        instance_url: testMetadata.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        refresh_token: testMetadata.refreshToken,
      };

      // Stub the http requests (OAuth2.requestToken() and the request for the username)
      _postParmsStub.returns(Promise.resolve(authResponse));
      const userInfoResponseBody = {
        body: JSON.stringify({ preferred_username: testMetadata.username, organization_id: testMetadata.orgId }),
      };
      const userResponseBody = {
        body: JSON.stringify({ Username: testMetadata.username.toUpperCase() }),
      };
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest')
        .onFirstCall()
        .returns(Promise.resolve(userInfoResponseBody))
        .onSecondCall()
        .returns(Promise.resolve(userResponseBody));
      authInfo = await AuthInfo.create({ oauth2Options: authCodeConfig });

      decryptedRefreshToken = authInfo.getFields(true).refreshToken;
    });

    // Walk an object deeply looking for the attribute name of clientSecret or values that contain the client secret
    // or decrypted refresh token.
    const walkAndSearchForSecrets = (obj: JsonMap) => {
      const keys = Object.keys(obj);
      keys.forEach((key: string) => {
        const child = getJsonMap(obj, key);
        if (child) {
          walkAndSearchForSecrets(child);
        }
        const keyUpper = key.toUpperCase();

        // If the key is likely a clientSecret "ish" attribute and the value is a string.
        // reminder:'clientSecretFn' is always legit.
        if (keyUpper.includes('SECRET') && keyUpper.includes('CLIENT') && getString(obj, key)) {
          throw new Error('Key indicates client secret.');
        }

        if (includes(getJsonMap(obj, key), testMetadata.defaultConnectedAppInfo.clientSecret)) {
          throw new Error(`Client secret present as value in object with key: ${key}`);
        }

        if (includes(getJsonMap(obj, key), decryptedRefreshToken)) {
          throw new Error(`Refresh token present as value in object with key: ${key}`);
        }
      });
    };

    describe('getFields', () => {
      it('return value should not have a client secret or decrypted refresh token', () => {
        const fields = authInfo.getFields();
        const strObj: string = JSON.stringify(fields);

        // verify the returned object doesn't have secrets
        expect(() => walkAndSearchForSecrets(toJsonMap(fields) || {})).to.not.throw();

        expect(strObj).does.not.include(ensureString(testMetadata.defaultConnectedAppInfo.clientSecret));
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
        const fields: AuthFields = authInfo.getConnectionOptions();
        const strObj: string = JSON.stringify(fields);

        // verify the returned object doesn't have secrets
        expect(() => walkAndSearchForSecrets(toJsonMap(fields) || {})).to.not.throw();

        // double check the stringified objects don't have secrets.
        expect(strObj).does.not.include(ensureString(testMetadata.defaultConnectedAppInfo.clientSecret));
        expect(strObj).does.not.include(decryptedRefreshToken);
      });
    });

    describe('AuthInfo', () => {
      it('should not have a client secret or decrypted refresh token', () => {
        const authInfoString = JSON.stringify(authInfo);

        // verify the returned object doesn't have secrets
        expect(() => walkAndSearchForSecrets(toJsonMap(authInfo) || {})).to.not.throw();

        // double check the stringified objects don't have secrets.
        expect(authInfoString).does.not.include(ensureString(testMetadata.defaultConnectedAppInfo.clientSecret));
        expect(authInfoString).does.not.include(decryptedRefreshToken);
      });
    });
  });

  describe('create()', () => {
    it('should return an AuthInfo instance when passed an access token as username', async () => {
      stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'loadProperties').callsFake(async () => {});
      stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'getPropertyValue').returns(testMetadata.instanceUrl);

      const username =
        '00Dxx0000000001!AQEAQI3AIbublfW11ATFJl9T122vVPj5QaInBp6h9nPsUK8oW4rW5Os0ZjtsUU.DG9rXytUCh3RZvc_XYoRULiHeTMjyi6T1';
      const authInfo = await AuthInfo.create({ username });

      const expectedFields = {
        accessToken: username,
        instanceUrl: testMetadata.instanceUrl,
        loginUrl: testMetadata.instanceUrl,
      };
      expect(authInfo.getConnectionOptions()).to.deep.equal(expectedFields);
      expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be true').to.be.true;
      expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be false').to.be.false;
      expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
      expect(authInfo.isOauth(), 'authInfo.isOauth() should be false').to.be.false;
    });

    it('should return an AuthInfo instance when passed a parent username', async () => {
      stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'loadProperties').callsFake(async () => {});
      stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'getPropertyValue').returns(testMetadata.instanceUrl);
      stubMethod($$.SANDBOX, OrgAccessor.prototype, 'has').returns(false);
      // Stub the http request (OAuth2.refreshToken())
      // This will be called for both, and we want to make sure the clientSecrete is the
      // same for both.
      _postParmsStub.callsFake((params) => {
        expect(params.client_secret).to.deep.equal(testMetadata.clientSecret);
        return {
          access_token: testMetadata.accessToken,
          instance_url: testMetadata.instanceUrl,
          refresh_token: testMetadata.refreshToken,
          id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        };
      });

      const parentUsername = 'test@test.com_username_SaveTest1';
      await AuthInfo.create({
        username: parentUsername,
        oauth2Options: {
          clientId: testMetadata.clientId,
          clientSecret: testMetadata.clientSecret,
          loginUrl: testMetadata.instanceUrl,
          authCode: testMetadata.authCode,
        },
      });

      const authInfo = await AuthInfo.create({
        username: testMetadata.username,
        parentUsername,
        oauth2Options: {
          loginUrl: testMetadata.instanceUrl,
          authCode: testMetadata.authCode,
        },
      });

      expect(_postParmsStub.calledTwice).to.true;
      expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
      expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be false').to.be.true;
      expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
      expect(authInfo.isOauth(), 'authInfo.isOauth() should be true').to.be.true;

      const expectedAuthConfig = {
        accessToken: testMetadata.accessToken,
        instanceUrl: testMetadata.instanceUrl,
        username: testMetadata.username,
        orgId: '00DAuthInfoTest_orgId',
        loginUrl: testMetadata.instanceUrl,
        refreshToken: testMetadata.refreshToken,
        clientId: testMetadata.clientId,
        clientSecret: testMetadata.clientSecret,
      };
      expect(authInfoUpdate.secondCall.args[0]).to.deep.equal(expectedAuthConfig);
    });

    it('should return an AuthInfo instance when passed an access token and instanceUrl for the access token flow', async () => {
      const userInfoResponseBody = {
        body: JSON.stringify({ preferred_username: testMetadata.username, organization_id: testMetadata.orgId }),
      };
      const userResponseBody = {
        body: JSON.stringify({ Username: testMetadata.username.toUpperCase() }),
      };
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest')
        .onFirstCall()
        .returns(Promise.resolve(userInfoResponseBody))
        .onSecondCall()
        .returns(Promise.resolve(userResponseBody));
      stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'loadProperties').callsFake(async () => {});
      stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'getPropertyValue').returns(testMetadata.instanceUrl);

      const accessToken =
        '00Dxx0000000001!AQEAQI3AIbublfW11ATFJl9T122vVPj5QaInBp6h9nPsUK8oW4rW5Os0ZjtsUU.DG9rXytUCh3RZvc_XYoRULiHeTMjyi6T1';
      const authInfo = await AuthInfo.create({
        username: 'test',
        accessTokenOptions: {
          accessToken,
          instanceUrl: testMetadata.instanceUrl,
          loginUrl: testMetadata.instanceUrl,
        },
      });

      const expectedFields = {
        accessToken,
        instanceUrl: testMetadata.instanceUrl,
        loginUrl: testMetadata.instanceUrl,
      };
      expect(authInfo.getConnectionOptions()).to.deep.equal(expectedFields);
      expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be true').to.be.true;
      expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be false').to.be.false;
      expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
      expect(authInfo.isOauth(), 'authInfo.isOauth() should be false').to.be.false;
    });

    //
    // JWT Tests
    //

    describe('ordered test', () => {
      // There is an implicit order in these tests. Hence the isolation in the describe and the unique
      // username that is generated in the MetaMock constructor.
      const sharedTestMeta = new MetaAuthDataMock();
      beforeEach(async () => {
        testMetadata = sharedTestMeta;
      });

      it('should return a JWT AuthInfo instance when passed a username and JWT auth options', async () => {
        const jwtConfig = {
          clientId: testMetadata.clientId,
          loginUrl: testMetadata.loginUrl,
          privateKey: 'authInfoTest/jwt/server.key',
        };
        const jwtConfigClone = cloneJson(jwtConfig);
        const authResponse = {
          access_token: testMetadata.accessToken,
          instance_url: testMetadata.instanceUrl,
          id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        };

        // Stub file I/O, http requests, and the DNS lookup
        readFileStub.returns(Promise.resolve('authInfoTest_private_key'));
        _postParmsStub.returns(Promise.resolve(authResponse));
        stubMethod($$.SANDBOX, jwt, 'sign').returns(Promise.resolve('authInfoTest_jwtToken'));
        stubMethod($$.SANDBOX, dns, 'lookup').callsFake((url: string, done: (v: AnyJson, w: JsonMap) => {}) =>
          done(null, { address: '1.1.1.1', family: 4 })
        );
        $$.SANDBOX.stub(OrgAccessor.prototype, 'has').returns(false);

        // Create the JWT AuthInfo instance
        const authInfo = await AuthInfo.create({
          username: testMetadata.jwtUsername,
          oauth2Options: jwtConfig,
        });

        // Verify the returned AuthInfo instance
        const authInfoConnOpts = authInfo.getConnectionOptions();
        expect(authInfoConnOpts).to.have.property('accessToken', authResponse.access_token);
        expect(authInfoConnOpts).to.have.property('instanceUrl', authResponse.instance_url);
        expect(authInfoConnOpts).to.have.property('refreshFn').and.is.a('function');
        expect(authInfo.getUsername()).to.equal(testMetadata.jwtUsername);
        expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
        expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be false').to.be.false;
        expect(authInfo.isJwt(), 'authInfo.isJwt() should be true').to.be.true;
        expect(authInfo.isOauth(), 'authInfo.isOauth() should be false').to.be.false;

        // Verify expected methods are called with expected args
        expect(authInfoInit.called).to.be.true;
        expect(authInfoInit.firstCall.args[0]).to.equal(jwtConfig);
        expect(authInfoUpdate.called).to.be.true;
        expect(authInfoBuildJwtConfig.called).to.be.true;
        expect(authInfoBuildJwtConfig.firstCall.args[0]).to.include(jwtConfig);
        expect(
          testMetadata.authInfoLookupCount,
          'should have read an auth file once to ensure auth data did not already exist'
        ).to.equal(1);
        expect(readFileStub.called).to.be.true;

        // Verify the jwtConfig object was not mutated by init() or buildJwtConfig()
        expect(jwtConfig).to.deep.equal(jwtConfigClone);

        const expectedAuthConfig = {
          accessToken: authResponse.access_token,
          clientId: testMetadata.clientId,
          instanceUrl: testMetadata.instanceUrl,
          orgId: authResponse.id.split('/')[0],
          loginUrl: jwtConfig.loginUrl,
          privateKey: jwtConfig.privateKey,
        };
        expect(authInfoUpdate.firstCall.args[0]).to.deep.equal(expectedAuthConfig);
      });
    });

    it('should return a JWT AuthInfo instance when passed a username from an auth file', async () => {
      const username = 'authInfoTest_username_jwt';

      // Make the file read stub return JWT auth data
      const jwtData = {};
      set(jwtData, 'accessToken', testMetadata.encryptedAccessToken);
      set(jwtData, 'clientId', testMetadata.clientId);
      set(jwtData, 'loginUrl', testMetadata.loginUrl);
      set(jwtData, 'instanceUrl', testMetadata.instanceUrl);
      set(jwtData, 'privateKey', 'authInfoTest/jwt/server.key');
      set(jwtData, 'username', username);
      testMetadata.fetchConfigInfo = () => jwtData;

      // Create the JWT AuthInfo instance
      const authInfo = await AuthInfo.create({ username });

      // Verify the returned AuthInfo instance
      const authInfoConnOpts = authInfo.getConnectionOptions();
      expect(authInfoConnOpts).to.have.property('accessToken', testMetadata.accessToken);
      expect(authInfoConnOpts).to.have.property('instanceUrl', testMetadata.instanceUrl);
      expect(authInfoConnOpts).to.have.property('refreshFn').and.is.a('function');
      expect(authInfo.getUsername()).to.equal(username);
      expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
      expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be false').to.be.false;
      expect(authInfo.isJwt(), 'authInfo.isJwt() should be true').to.be.true;
      expect(authInfo.isOauth(), 'authInfo.isOauth() should be false').to.be.false;

      // Verify authInfo.fields are encrypted
      expect(authInfo.getFields().accessToken).equals(getString(jwtData, 'accessToken'));
    });

    it('should throw an AuthInfoOverwriteError when both username and oauth data passed and auth file exists', async () => {
      const username = 'authInfoTest_username_jwt_from_auth_file';
      const jwtConfig = {
        clientId: testMetadata.clientId,
        loginUrl: testMetadata.loginUrl,
        privateKey: 'authInfoTest/jwt/server.key',
      };

      // Make the file read stub return JWT auth data
      const jwtData = {};
      set(jwtData, 'accessToken', testMetadata.encryptedAccessToken);
      set(jwtData, 'clientId', testMetadata.clientId);
      set(jwtData, 'loginUrl', testMetadata.loginUrl);
      set(jwtData, 'instanceUrl', testMetadata.instanceUrl);
      set(jwtData, 'privateKey', 'authInfoTest/jwt/server.key');
      testMetadata.fetchConfigInfo = () => jwtData;

      $$.SANDBOX.stub(OrgAccessor.prototype, 'has').returns(true);

      // Create the JWT AuthInfo instance
      try {
        await AuthInfo.create({ username, oauth2Options: jwtConfig });
        assert.fail('Error thrown', 'No Error thrown', 'Expected AuthInfo.create() to throw an AuthInfoOverwriteError');
      } catch (err) {
        expect(err.name).to.equal('AuthInfoOverwriteError');
      }
    });

    it('should throw a JWTAuthError when auth fails via a OAuth2.jwtAuthorize()', async () => {
      const username = 'authInfoTest_username_jwt_ERROR1';
      const jwtConfig = {
        clientId: testMetadata.clientId,
        loginUrl: testMetadata.loginUrl,
        privateKey: 'authInfoTest/jwt/server.key',
      };

      // Stub file I/O, http requests, and the DNS lookup
      readFileStub.returns(Promise.resolve('authInfoTest_private_key'));
      _postParmsStub.throws(new Error('authInfoTest_ERROR_MSG'));
      stubMethod($$.SANDBOX, jwt, 'sign').returns(Promise.resolve('authInfoTest_jwtToken'));
      stubMethod($$.SANDBOX, dns, 'lookup').callsFake((url: string, done: (v: AnyJson, w: JsonMap) => {}) =>
        done(null, { address: '1.1.1.1', family: 4 })
      );

      // Create the JWT AuthInfo instance
      try {
        await AuthInfo.create({ username, oauth2Options: jwtConfig });
        assert.fail('should have thrown an error within AuthInfo.buildJwtConfig()');
      } catch (err) {
        expect(err.name).to.equal('JwtAuthError');
      }
    });

    it('should catch a DNS error and set the instanceUrl when DNS lookup fails', async () => {
      const username = 'authInfoTest_username_jwt_ERROR2';
      const jwtConfig = {
        clientId: testMetadata.clientId,
        loginUrl: testMetadata.loginUrl,
        privateKey: 'authInfoTest/jwt/server.key',
      };
      const authResponse = {
        access_token: testMetadata.accessToken,
        instance_url: testMetadata.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
      };

      // Stub file I/O, http requests, and the DNS lookup
      readFileStub.returns(Promise.resolve('authInfoTest_private_key'));
      _postParmsStub.returns(Promise.resolve(authResponse));
      stubMethod($$.SANDBOX, jwt, 'sign').returns(Promise.resolve('authInfoTest_jwtToken'));
      stubMethod($$.SANDBOX, dns, 'lookup').callsFake((url: string | Error, done: (v: Error) => {}) =>
        done(new Error('authInfoTest_ERROR_MSG'))
      );
      stubMethod($$.SANDBOX, MyDomainResolver.prototype, 'getTimeout').returns(Duration.milliseconds(10));
      stubMethod($$.SANDBOX, dns, 'resolveCname').callsFake((host: string, callback: AnyFunction) => {
        callback(null, []);
      });
      // Create the JWT AuthInfo instance
      const authInfo = await AuthInfo.create({
        username,
        oauth2Options: jwtConfig,
      });

      expect(authInfo.getConnectionOptions()).to.have.property('instanceUrl', jwtConfig.loginUrl);
    });

    //
    // Refresh token tests
    //

    it('should return a refresh token AuthInfo instance when passed a username and refresh token auth options', async () => {
      const username = 'authInfoTest_username_RefreshToken';
      const refreshTokenConfig = {
        refreshToken: testMetadata.refreshToken,
        loginUrl: testMetadata.loginUrl,
      };
      const refreshTokenConfigClone = cloneJson(refreshTokenConfig);
      const authResponse = {
        access_token: testMetadata.accessToken,
        instance_url: testMetadata.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
      };

      // Stub the http request (OAuth2.refreshToken())
      _postParmsStub.returns(Promise.resolve(authResponse));

      // Create the refresh token AuthInfo instance
      const authInfo = await AuthInfo.create({
        username,
        oauth2Options: refreshTokenConfig,
      });

      // Verify the returned AuthInfo instance
      const authInfoConnOpts = authInfo.getConnectionOptions();
      expect(authInfoConnOpts).to.have.property('accessToken', authResponse.access_token);
      expect(authInfoConnOpts).to.have.property('instanceUrl', authResponse.instance_url);
      expect(authInfoConnOpts).to.not.have.property('refreshToken');
      expect(authInfoConnOpts['oauth2']).to.have.property('loginUrl', testMetadata.instanceUrl);
      expect(authInfoConnOpts['oauth2']).to.have.property('clientId', testMetadata.defaultConnectedAppInfo.clientId);
      expect(authInfoConnOpts['oauth2']).to.have.property('redirectUri', testMetadata.redirectUri);
      expect(authInfo.getUsername()).to.equal(username);
      expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
      expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be true').to.be.true;
      expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
      expect(authInfo.isOauth(), 'authInfo.isOauth() should be true').to.be.true;

      // Verify authInfo.fields are encrypted
      const crypto = await Crypto.create();
      expect(crypto.decrypt(authInfo.getFields().accessToken)).equals(authResponse.access_token);
      expect(crypto.decrypt(authInfo.getFields().refreshToken)).equals(refreshTokenConfig.refreshToken);

      // Verify expected methods are called with expected args
      expect(authInfoInit.called).to.be.true;
      expect(authInfoInit.firstCall.args[0]).to.equal(refreshTokenConfig);
      expect(authInfoUpdate.called).to.be.true;
      expect(authInfoBuildRefreshTokenConfig.called).to.be.true;
      expect(authInfoBuildRefreshTokenConfig.firstCall.args[0]).to.include(refreshTokenConfig);

      // Verify the refreshTokenConfig object was not mutated by init() or buildRefreshTokenConfig()
      expect(refreshTokenConfig).to.deep.equal(refreshTokenConfigClone);

      const expectedAuthConfig = {
        accessToken: authResponse.access_token,
        instanceUrl: testMetadata.instanceUrl,
        orgId: authResponse.id.split('/')[0],
        loginUrl: refreshTokenConfig.loginUrl,
        refreshToken: refreshTokenConfig.refreshToken,
        clientId: testMetadata.defaultConnectedAppInfo.clientId,
        clientSecret: testMetadata.defaultConnectedAppInfo.clientSecret,
        username,
      };
      expect(authInfoUpdate.firstCall.args[0]).to.deep.equal(expectedAuthConfig);
    });

    it('should return a refresh token AuthInfo instance with username in auth options', async () => {
      const username = 'authInfoTest_username_RefreshToken';
      const refreshTokenConfig = {
        refreshToken: testMetadata.refreshToken,
        loginUrl: testMetadata.loginUrl,
        username,
      };
      const refreshTokenConfigClone = cloneJson(refreshTokenConfig);
      const authResponse = {
        access_token: testMetadata.accessToken,
        instance_url: testMetadata.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
      };

      // Stub the http request (OAuth2.refreshToken())
      _postParmsStub.returns(Promise.resolve(authResponse));

      // Create the refresh token AuthInfo instance
      const authInfo = await AuthInfo.create({
        oauth2Options: refreshTokenConfig,
      });

      // Verify the returned AuthInfo instance
      const authInfoConnOpts = authInfo.getConnectionOptions();
      expect(authInfoConnOpts).to.have.property('accessToken', authResponse.access_token);
      expect(authInfoConnOpts).to.have.property('instanceUrl', authResponse.instance_url);
      expect(authInfoConnOpts).to.not.have.property('refreshToken');
      expect(authInfoConnOpts['oauth2']).to.have.property('loginUrl', testMetadata.instanceUrl);
      expect(authInfoConnOpts['oauth2']).to.have.property('clientId', testMetadata.defaultConnectedAppInfo.clientId);
      expect(authInfoConnOpts['oauth2']).to.have.property('redirectUri', testMetadata.redirectUri);
      expect(authInfo.getUsername()).to.equal(username);
      expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
      expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be true').to.be.true;
      expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
      expect(authInfo.isOauth(), 'authInfo.isOauth() should be true').to.be.true;

      // Verify authInfo.fields are encrypted
      const crypto = await Crypto.create();
      expect(crypto.decrypt(authInfo.getFields().accessToken)).equals(authResponse.access_token);
      expect(crypto.decrypt(authInfo.getFields().refreshToken)).equals(refreshTokenConfig.refreshToken);

      // Verify expected methods are called with expected args
      expect(authInfoInit.called).to.be.true;
      expect(authInfoInit.firstCall.args[0]).to.equal(refreshTokenConfig);
      expect(authInfoUpdate.called).to.be.true;
      expect(authInfoBuildRefreshTokenConfig.called).to.be.true;
      expect(authInfoBuildRefreshTokenConfig.firstCall.args[0]).to.include(refreshTokenConfig);

      // Verify the refreshTokenConfig object was not mutated by init() or buildRefreshTokenConfig()
      expect(refreshTokenConfig).to.deep.equal(refreshTokenConfigClone);

      const expectedAuthConfig = {
        accessToken: authResponse.access_token,
        instanceUrl: testMetadata.instanceUrl,
        orgId: authResponse.id.split('/')[0],
        loginUrl: refreshTokenConfig.loginUrl,
        refreshToken: refreshTokenConfig.refreshToken,
        clientId: testMetadata.defaultConnectedAppInfo.clientId,
        clientSecret: testMetadata.defaultConnectedAppInfo.clientSecret,
        username,
      };
      expect(authInfoUpdate.firstCall.args[0]).to.deep.equal(expectedAuthConfig);
    });

    it('should return a refresh token AuthInfo instance with custom clientId and clientSecret', async () => {
      const username = 'authInfoTest_username_RefreshToken_Custom';
      const refreshTokenConfig = {
        clientId: 'authInfoTest_clientId',
        clientSecret: 'authInfoTest_clientSecret',
        refreshToken: testMetadata.refreshToken,
        loginUrl: testMetadata.loginUrl,
      };
      const authResponse = {
        access_token: testMetadata.accessToken,
        instance_url: testMetadata.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
      };

      // Stub the http request (OAuth2.refreshToken())
      _postParmsStub.returns(Promise.resolve(authResponse));

      // Create the refresh token AuthInfo instance
      const authInfo = await AuthInfo.create({
        username,
        oauth2Options: refreshTokenConfig,
      });

      // Verify the returned AuthInfo instance
      const authInfoConnOpts = authInfo.getConnectionOptions();
      expect(authInfoConnOpts).to.have.property('accessToken', authResponse.access_token);
      expect(authInfoConnOpts).to.have.property('instanceUrl', authResponse.instance_url);
      expect(authInfoConnOpts).to.not.have.property('refreshToken');
      expect(authInfoConnOpts['oauth2']).to.have.property('loginUrl', testMetadata.instanceUrl);
      expect(authInfoConnOpts['oauth2']).to.have.property('clientId', refreshTokenConfig.clientId);
      expect(authInfoConnOpts['oauth2']).to.have.property('redirectUri', testMetadata.redirectUri);
      expect(authInfo.getUsername()).to.equal(username);
      expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
      expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be true').to.be.true;
      expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
      expect(authInfo.isOauth(), 'authInfo.isOauth() should be true').to.be.true;

      // Verify authInfo.fields are encrypted
      const crypto = await Crypto.create();
      expect(crypto.decrypt(authInfo.getFields().accessToken)).equals(authResponse.access_token);
      expect(crypto.decrypt(authInfo.getFields().refreshToken)).equals(refreshTokenConfig.refreshToken);
      expect(crypto.decrypt(authInfo.getFields().clientSecret)).equals(refreshTokenConfig.clientSecret);

      // Verify expected methods are called with expected args
      expect(authInfoInit.called).to.be.true;
      expect(authInfoInit.firstCall.args[0]).to.equal(refreshTokenConfig);
      expect(authInfoUpdate.called).to.be.true;
      expect(authInfoBuildRefreshTokenConfig.called).to.be.true;
      expect(authInfoBuildRefreshTokenConfig.firstCall.args[0]).to.deep.equal(refreshTokenConfig);

      const expectedAuthConfig = {
        accessToken: authResponse.access_token,
        instanceUrl: testMetadata.instanceUrl,
        orgId: authResponse.id.split('/')[0],
        loginUrl: refreshTokenConfig.loginUrl,
        refreshToken: refreshTokenConfig.refreshToken,
        clientId: refreshTokenConfig.clientId,
        clientSecret: refreshTokenConfig.clientSecret,
        username,
      };
      expect(authInfoUpdate.firstCall.args[0]).to.deep.equal(expectedAuthConfig);
    });

    it('should throw a RefreshTokenAuthError when auth fails via a refresh token', async () => {
      const username = 'authInfoTest_username_RefreshToken_ERROR';
      const refreshTokenConfig = {
        clientId: 'authInfoTest_clientId',
        clientSecret: 'authInfoTest_clientSecret',
        refreshToken: testMetadata.refreshToken,
        loginUrl: testMetadata.loginUrl,
      };

      // Stub the http request (OAuth2.refreshToken())
      _postParmsStub.throws(new Error('authInfoTest_ERROR_MSG'));

      // Create the refresh token AuthInfo instance
      try {
        await AuthInfo.create({ username, oauth2Options: refreshTokenConfig });
        assert.fail('should have thrown an error within AuthInfo.buildRefreshTokenConfig()');
      } catch (err) {
        expect(err.name).to.equal('RefreshTokenAuthError');
      }
    });

    //
    // Web Auth (auth code) tests
    //

    it('should return a refresh token AuthInfo instance when passed an authcode', async () => {
      const username = 'authInfoTest_username_AuthCode';
      const authCodeConfig = {
        authCode: testMetadata.authCode,
        loginUrl: testMetadata.loginUrl,
      };
      const authCodeConfigClone = cloneJson(authCodeConfig);
      const authResponse = {
        access_token: testMetadata.accessToken,
        instance_url: testMetadata.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        refresh_token: testMetadata.refreshToken,
      };

      // Stub the http requests (OAuth2.requestToken() and the request for the username)
      _postParmsStub.returns(Promise.resolve(authResponse));
      const userInfoResponseBody = {
        body: JSON.stringify({ preferred_username: username, organization_id: testMetadata.orgId }),
      };
      const userResponseBody = {
        body: JSON.stringify({ Username: username.toUpperCase() }),
      };
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest')
        .onFirstCall()
        .returns(Promise.resolve(userInfoResponseBody))
        .onSecondCall()
        .returns(Promise.resolve(userResponseBody));

      // Create the refresh token AuthInfo instance
      const authInfo = await AuthInfo.create({ oauth2Options: authCodeConfig });

      // Ensure we query for the username
      expect(Transport.prototype.httpRequest.called).to.be.true;

      // Verify the returned AuthInfo instance
      const authInfoConnOpts = authInfo.getConnectionOptions();
      expect(authInfoConnOpts).to.have.property('accessToken', authResponse.access_token);
      expect(authInfoConnOpts).to.have.property('instanceUrl', authResponse.instance_url);
      expect(authInfoConnOpts).to.not.have.property('refreshToken');
      expect(authInfoConnOpts['oauth2']).to.have.property('loginUrl', testMetadata.instanceUrl); // why is this instanceUrl?
      expect(authInfoConnOpts['oauth2']).to.have.property('clientId', testMetadata.defaultConnectedAppInfo.clientId);
      expect(authInfoConnOpts['oauth2']).to.have.property('redirectUri', testMetadata.redirectUri);
      expect(authInfo.getUsername()).to.equal(username.toUpperCase());
      expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
      expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be true').to.be.true;
      expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
      expect(authInfo.isOauth(), 'authInfo.isOauth() should be true').to.be.true;

      // Verify authInfo.fields are encrypted
      const crypto = await Crypto.create();
      expect(crypto.decrypt(authInfo.getFields().accessToken)).equals(authResponse.access_token);
      expect(crypto.decrypt(authInfo.getFields().refreshToken)).equals(authResponse.refresh_token);

      // Verify expected methods are called with expected args
      expect(authInfoInit.called).to.be.true;
      expect(authInfoInit.firstCall.args[0]).to.equal(authCodeConfig);
      expect(authInfoUpdate.called).to.be.true;
      expect(authInfoExchangeToken.called).to.be.true;
      expect(authInfoExchangeToken.firstCall.args[0]).to.include(authCodeConfig);

      // Verify the authCodeConfig object was not mutated by init() or buildWebAuthConfig()
      expect(authCodeConfig).to.deep.equal(authCodeConfigClone);

      const expectedAuthConfig = {
        accessToken: authResponse.access_token,
        instanceUrl: testMetadata.instanceUrl,
        username: username.toUpperCase(),
        orgId: authResponse.id.split('/')[0],
        loginUrl: authCodeConfig.loginUrl,
        refreshToken: authResponse.refresh_token,
        // These need to be passed in by the consumer. Since they are not, they will show up as undefined.
        // In a non-test environment, the exchange will fail because no clientId is supplied.
        clientId: undefined,
        clientSecret: undefined,
      };
      expect(authInfoUpdate.firstCall.args[0]).to.deep.equal(expectedAuthConfig);
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
      const clientId = 'clientId';
      const clientSecret = 'clientSecret';
      const loginUrl = 'loginUrl';
      const redirectUri = 'redirectUri';
      const username = 'authInfoTest_username_AuthCode';

      const options: OAuth2Options = { clientId, clientSecret, loginUrl, redirectUri };
      const oauth2 = new OAuth2WithVerifier(options);
      options.authCode = '123456';

      const authResponse = {
        access_token: testMetadata.accessToken,
        instance_url: testMetadata.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        refresh_token: testMetadata.refreshToken,
      };
      // Stub the http requests (OAuth2.requestToken() and the request for the username)
      _postParmsStub.returns(Promise.resolve(authResponse));
      const userInfoResponseBody = {
        body: JSON.stringify({ preferred_username: username, organization_id: testMetadata.orgId }),
      };
      const userResponseBody = {
        body: JSON.stringify({ Username: username.toUpperCase() }),
      };
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest')
        .onFirstCall()
        .returns(Promise.resolve(userInfoResponseBody))
        .onSecondCall()
        .returns(Promise.resolve(userResponseBody));
      await AuthInfo.create({ oauth2Options: options, oauth2 });
      expect(authInfoExchangeToken.args.length).to.equal(1);
      expect(authInfoExchangeToken.args[0].length).to.equal(2);
      expect(authInfoExchangeToken.args[0][1]).to.have.property('codeVerifier', oauth2.codeVerifier);
    });

    it('should throw a AuthCodeExchangeError when auth fails via an auth code', async () => {
      const authCodeConfig = {
        authCode: testMetadata.authCode,
        loginUrl: testMetadata.loginUrl,
      };

      // Stub the http request (OAuth2.requestToken())
      _postParmsStub.throws(new Error('authInfoTest_ERROR_MSG'));

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
        authCode: testMetadata.authCode,
        loginUrl: testMetadata.loginUrl,
      };
      const authResponse = {
        access_token: testMetadata.accessToken,
        instance_url: testMetadata.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        refresh_token: testMetadata.refreshToken,
      };

      // Stub the http request (OAuth2.requestToken())
      _postParmsStub.returns(Promise.resolve(authResponse));
      const userInfoResponseBody = {
        statusCode: 404,
        body: JSON.stringify([
          {
            message: 'Could not retrieve the username after successful auth code exchange.\nDue to: %s',
            errorCode: 'AuthCodeUsernameRetrievalError',
          },
        ]),
      };
      const userResponseBody = {
        body: JSON.stringify({ Username: testMetadata.username.toUpperCase() }),
      };
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest')
        .onFirstCall()
        .returns(Promise.resolve(userInfoResponseBody))
        .onSecondCall()
        .returns(Promise.resolve(userResponseBody));

      // Create the auth code AuthInfo instance
      try {
        await AuthInfo.create({ oauth2Options: authCodeConfig });
        assert.fail('should have thrown an error within AuthInfo.buildWebAuthConfig()');
      } catch (err) {
        expect(err.name).to.equal('AuthCodeUsernameRetrievalError');
      }
    });
    it('should throw a AuthCodeUsernameRetrievalError when userInfo retrieval fails after auth code exchange', async () => {
      const authCodeConfig = {
        authCode: testMetadata.authCode,
        loginUrl: testMetadata.loginUrl,
      };
      const authResponse = {
        access_token: testMetadata.accessToken,
        instance_url: testMetadata.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        refresh_token: testMetadata.refreshToken,
      };

      // Stub the http request (OAuth2.requestToken())
      _postParmsStub.returns(Promise.resolve(authResponse));
      const userInfoResponseBody = {
        statusCode: 404,
        body: JSON.stringify([
          {
            message: 'Could not retrieve the username after successful auth code exchange.\nDue to: %s',
            errorCode: 'AuthCodeUsernameRetrievalError',
          },
        ]),
      };
      const userResponseBody = {
        body: JSON.stringify({ Username: testMetadata.username.toUpperCase() }),
      };
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest')
        .onFirstCall()
        .returns(Promise.resolve(userInfoResponseBody))
        .onSecondCall()
        .returns(Promise.resolve(userResponseBody));

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
        authCode: testMetadata.authCode,
        loginUrl: testMetadata.loginUrl,
      };
      const authResponse = {
        access_token: testMetadata.accessToken,
        instance_url: testMetadata.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        refresh_token: testMetadata.refreshToken,
      };

      // Stub the http request (OAuth2.requestToken())
      _postParmsStub.returns(Promise.resolve(authResponse));
      const userInfoResponseBody = {
        body: JSON.stringify({ preferred_username: testMetadata.username, organization_id: testMetadata.orgId }),
      };
      const userResponseBody = {
        statusCode: 404,
        body: JSON.stringify([
          {
            message: 'Could not retrieve the username after successful auth code exchange.\nDue to: %s',
            errorCode: 'AuthCodeUsernameRetrievalError',
          },
        ]),
      };
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest')
        .onFirstCall()
        .returns(Promise.resolve(userInfoResponseBody))
        .onSecondCall()
        .returns(Promise.resolve(userResponseBody));

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

  describe('save()', () => {
    it('should update the AuthInfo fields, and write to file', async () => {
      const username = 'authInfoTest_username_SaveTest1';
      const refreshTokenConfig = {
        refreshToken: testMetadata.refreshToken,
        loginUrl: testMetadata.loginUrl,
      };
      const authResponse = {
        access_token: testMetadata.accessToken,
        instance_url: testMetadata.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        expirationDate: testMetadata.expirationDate,
      };

      // Stub the http request (OAuth2.refreshToken())
      _postParmsStub.returns(Promise.resolve(authResponse));

      // Create the AuthInfo instance
      const authInfo = await AuthInfo.create({
        username,
        oauth2Options: refreshTokenConfig,
      });

      expect(authInfo.getUsername()).to.equal(username);

      // reset the AuthInfo.update stub so we only look at what happens with AuthInfo.save().
      authInfoUpdate.resetHistory();

      // Save new fields
      const changedData = { accessToken: testMetadata.accessToken, expirationDate: testMetadata.expirationDate };

      stubMethod($$.SANDBOX, testMetadata, 'fetchConfigInfo').returns(Promise.resolve({}));
      await authInfo.save(changedData);

      expect(authInfoUpdate.called).to.be.true;
      expect(authInfoUpdate.firstCall.args[0]).to.deep.equal(changedData);
      expect(configFileWrite.called).to.be.true;

      const crypto = await Crypto.create();
      const decryptedActualFields = configFileWrite.lastCall.thisValue.toObject().orgs[username];
      decryptedActualFields.accessToken = crypto.decrypt(decryptedActualFields.accessToken);
      decryptedActualFields.refreshToken = crypto.decrypt(decryptedActualFields.refreshToken);
      decryptedActualFields.clientSecret = crypto.decrypt(decryptedActualFields.clientSecret);
      delete decryptedActualFields.timestamp;
      const expectedFields = {
        accessToken: changedData.accessToken,
        instanceUrl: testMetadata.instanceUrl,
        username,
        orgId: authResponse.id.split('/')[0],
        loginUrl: refreshTokenConfig.loginUrl,
        refreshToken: refreshTokenConfig.refreshToken,
        // clientId and clientSecret are now stored in the file, even the defaults.
        // We just hard code the legacy values here to ensure old auth files will still work.
        clientId: 'SalesforceDevelopmentExperience',
        clientSecret: '1384510088588713504',
        expirationDate: testMetadata.expirationDate,
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
          instanceUrl: testMetadata.instanceUrl,
        },
      });

      expect(authInfo.getUsername()).to.equal(username);

      configFileWrite.rejects(new Error('Should not call save'));
      await authInfo.save();
      // If the test doesn't blow up, it is a success because the write (reject) never happened
    });
  });

  describe('refreshFn()', () => {
    it('should call init() and save()', async () => {
      const context = {
        getUsername: () => '',
        getFields: (decrypt = false) => ({
          loginUrl: testMetadata.loginUrl,
          clientId: testMetadata.clientId,
          privateKey: 'authInfoTest/jwt/server.key',
          accessToken: decrypt ? testMetadata.accessToken : testMetadata.encryptedAccessToken,
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
        accessToken: testMetadata.accessToken,
      };
      expect(context.initAuthOptions.firstCall.args[0]).to.deep.equal(expectedInitArgs);
      expect(context.save.called, 'Should have called AuthInfo.save() during refreshFn()').to.be.true;
      expect(testCallback.called, 'Should have called the callback passed to refreshFn()').to.be.true;
      expect(testCallback.firstCall.args[1]).to.equal(testMetadata.accessToken);
    });

    it('should path.resolve jwtkeyfilepath', async () => {
      const pathSpy = $$.SANDBOX.spy(pathImport, 'resolve');
      const context = {
        update: () => {},
        buildJwtConfig: () => {},
        isTokenOptions: () => false,
        getUsername: () => '',
        privateKeyFile: 'authInfoTest/jwt/server.key',
        options: {},
      };

      await AuthInfo.prototype['initAuthOptions'].call(context, context);

      expect(pathSpy.calledOnce).to.be.true;
    });

    it('should call the callback with OrgDataNotAvailableError when AuthInfo.init() fails', async () => {
      const context = {
        getUsername: () => '',
        getFields: () => ({
          loginUrl: testMetadata.loginUrl,
          clientId: testMetadata.clientId,
          privateKey: 'authInfoTest/jwt/server.key',
          accessToken: testMetadata.encryptedAccessToken,
        }),
        initAuthOptions: $$.SANDBOX.stub(),
        save: $$.SANDBOX.stub(),
        logger: $$.TEST_LOGGER,
      };
      const testCallback = $$.SANDBOX.spy();
      context.initAuthOptions.throws(new Error('Error: Data Not Available'));
      context.save.returns(Promise.resolve());
      // @ts-ignore
      await AuthInfo.prototype['refreshFn'].call(context, null, testCallback);
      expect(testCallback.called).to.be.true;
      const sfdxError = testCallback.firstCall.args[0];
      expect(sfdxError.name).to.equal('OrgDataNotAvailableError', sfdxError.message);
    });
  });

  describe('getAuthorizationUrl()', () => {
    let scope: string;
    beforeEach(() => {
      scope = env.getString('SFDX_AUTH_SCOPES', '');
    });
    afterEach(() => {
      env.setString('SFDX_AUTH_SCOPES', scope);
    });

    it('should return the correct url', () => {
      const options = {
        clientId: testMetadata.clientId,
        redirectUri: testMetadata.redirectUri,
        loginUrl: testMetadata.loginUrl,
      };
      const url: string = AuthInfo.getAuthorizationUrl.call(null, options);

      expect(url.startsWith(options.loginUrl), 'authorization URL should start with the loginUrl').to.be.true;
      expect(url).to.contain('state=');
      expect(url).to.contain('prompt=login');
      expect(url).to.contain('scope=refresh_token%20api%20web');
    });

    it('should return the correct url with modified scope', () => {
      const options = {
        clientId: testMetadata.clientId,
        redirectUri: testMetadata.redirectUri,
        loginUrl: testMetadata.loginUrl,
        scope: 'test',
      };
      const url: string = AuthInfo.getAuthorizationUrl.call(null, options);

      expect(url.startsWith(options.loginUrl), 'authorization URL should start with the loginUrl').to.be.true;
      expect(url).to.contain('state=');
      expect(url).to.contain('prompt=login');
      expect(url).to.contain('scope=test');
    });

    it('should return the correct url with env scope', () => {
      env.setString('SFDX_AUTH_SCOPES', 'from-env');
      const options = {
        clientId: testMetadata.clientId,
        redirectUri: testMetadata.redirectUri,
        loginUrl: testMetadata.loginUrl,
      };
      const url: string = AuthInfo.getAuthorizationUrl.call(null, options);

      expect(url.startsWith(options.loginUrl), 'authorization URL should start with the loginUrl').to.be.true;
      expect(url).to.contain('state=');
      expect(url).to.contain('prompt=login');
      expect(url).to.contain('scope=from-env');
    });

    it('should return the correct url with option over env', () => {
      env.setString('SFDX_AUTH_SCOPES', 'from-env');
      const options = {
        clientId: testMetadata.clientId,
        redirectUri: testMetadata.redirectUri,
        loginUrl: testMetadata.loginUrl,
        scope: 'from-option',
      };
      const url: string = AuthInfo.getAuthorizationUrl.call(null, options);

      expect(url.startsWith(options.loginUrl), 'authorization URL should start with the loginUrl').to.be.true;
      expect(url).to.contain('state=');
      expect(url).to.contain('prompt=login');
      expect(url).to.contain('scope=from-option');
    });
  });

  describe('getSfdxAuthUrl()', () => {
    it('should return the correct sfdx auth url', async () => {
      const username = 'authInfoTest_username_RefreshToken';
      const refreshTokenConfig = {
        refreshToken: testMetadata.refreshToken,
        loginUrl: testMetadata.loginUrl,
      };
      const authResponse = {
        access_token: testMetadata.accessToken,
        instance_url: testMetadata.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
      };

      // Stub the http request (OAuth2.refreshToken())
      _postParmsStub.returns(Promise.resolve(authResponse));

      // Create the refresh token AuthInfo instance
      const authInfo = await AuthInfo.create({
        username,
        oauth2Options: refreshTokenConfig,
      });

      expect(authInfo.getSfdxAuthUrl()).to.contain(
        `force://SalesforceDevelopmentExperience:1384510088588713504:${testMetadata.refreshToken}@mydevhub.localhost.internal.salesforce.com:6109`
      );
    });

    it('should handle undefined client secret', async () => {
      const username = 'authInfoTest_username_RefreshToken';
      const refreshTokenConfig = {
        refreshToken: testMetadata.refreshToken,
        loginUrl: testMetadata.loginUrl,
      };

      const authResponse = {
        access_token: testMetadata.accessToken,
        instance_url: testMetadata.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
      };

      // Stub the http request (OAuth2.refreshToken())
      _postParmsStub.returns(Promise.resolve(authResponse));

      // Create the refresh token AuthInfo instance
      const authInfo = await AuthInfo.create({
        username,
        oauth2Options: refreshTokenConfig,
      });

      // delete the client secret
      delete authInfo.getFields().clientSecret;

      expect(authInfo.getSfdxAuthUrl()).to.contain(
        `force://SalesforceDevelopmentExperience::${testMetadata.refreshToken}@mydevhub.localhost.internal.salesforce.com:6109`
      );
    });

    it('should handle undefined refresh token', async () => {
      const username = 'authInfoTest_username_RefreshToken';
      const refreshTokenConfig = {
        refreshToken: testMetadata.refreshToken,
        loginUrl: testMetadata.loginUrl,
      };

      const authResponse = {
        access_token: testMetadata.accessToken,
        instance_url: testMetadata.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
      };

      // Stub the http request (OAuth2.refreshToken())
      _postParmsStub.returns(Promise.resolve(authResponse));

      // Create the refresh token AuthInfo instance
      const authInfo = await AuthInfo.create({
        username,
        oauth2Options: refreshTokenConfig,
      });

      // delete the refresh token
      delete authInfo.getFields().refreshToken;

      expect(() => authInfo.getSfdxAuthUrl()).to.throw('undefined refreshToken');
    });

    it('should handle undefined instance url', async () => {
      const username = 'authInfoTest_username_RefreshToken';
      const refreshTokenConfig = {
        refreshToken: testMetadata.refreshToken,
        loginUrl: testMetadata.loginUrl,
      };

      const authResponse = {
        access_token: testMetadata.accessToken,
        instance_url: testMetadata.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
      };

      // Stub the http request (OAuth2.refreshToken())
      _postParmsStub.returns(Promise.resolve(authResponse));

      // Create the refresh token AuthInfo instance
      const authInfo = await AuthInfo.create({
        username,
        oauth2Options: refreshTokenConfig,
      });

      // delete the instance url
      delete authInfo.getFields().instanceUrl;

      expect(() => authInfo.getSfdxAuthUrl()).to.throw('undefined instanceUrl');
    });
  });

  describe('setAlias', () => {
    const username = 'authInfoTest_username';
    const alias = 'MyAlias';

    it('should set alias', async () => {
      const globalInfoSpy = spyMethod($$.SANDBOX, AliasAccessor.prototype, 'set');
      $$.SANDBOX.stub(OrgAccessor.prototype, 'has').returns(true);
      const authInfo = await AuthInfo.create({ username });
      await authInfo.setAlias(alias);
      expect(globalInfoSpy.calledOnce).to.be.true;
      expect(globalInfoSpy.firstCall.args[0]).to.equal(alias);
      expect(globalInfoSpy.firstCall.args[1]).to.equal(username);
    });
  });

  describe('setAsDefault', () => {
    const username = 'authInfoTest_username';
    const alias = 'MyAlias';
    let configSpy: sinon.SinonSpy;

    beforeEach(() => {
      configSpy = spyMethod($$.SANDBOX, Config.prototype, 'set');
      $$.SANDBOX.stub(OrgAccessor.prototype, 'has').returns(true);
    });

    it('should set username to target-org', async () => {
      const authInfo = await AuthInfo.create({ username });
      await authInfo.setAsDefault({ org: true });
      expect(configSpy.called).to.be.true;
      expect(configSpy.firstCall.args).to.deep.equal([OrgConfigProperties.TARGET_ORG, username]);
    });

    it('should set username to target-dev-hub', async () => {
      const authInfo = await AuthInfo.create({ username });
      await authInfo.setAsDefault({ devHub: true });
      expect(configSpy.called).to.be.true;
      expect(configSpy.firstCall.args).to.deep.equal([OrgConfigProperties.TARGET_DEV_HUB, username]);
    });

    it('should set alias to target-org', async () => {
      stubMethod($$.SANDBOX, AliasAccessor.prototype, 'get').returns(alias);
      const authInfo = await AuthInfo.create({ username });
      await authInfo.setAsDefault({ org: true });
      expect(configSpy.called).to.be.true;
      expect(configSpy.firstCall.args).to.deep.equal([OrgConfigProperties.TARGET_ORG, alias]);
    });

    it('should set alias to target-dev-hub', async () => {
      stubMethod($$.SANDBOX, AliasAccessor.prototype, 'get').returns(alias);
      const authInfo = await AuthInfo.create({ username });
      await authInfo.setAsDefault({ devHub: true });
      expect(configSpy.called).to.be.true;
      expect(configSpy.firstCall.args).to.deep.equal([OrgConfigProperties.TARGET_DEV_HUB, alias]);
    });
  });

  describe('audienceUrl', () => {
    const sfdxAudienceUrlSetting = process.env.SFDX_AUDIENCE_URL;

    beforeEach(() => {
      process.env.SFDX_AUDIENCE_URL = '';
    });

    afterEach(() => {
      process.env.SFDX_AUDIENCE_URL = sfdxAudienceUrlSetting || '';
    });

    async function runTest(options: JsonMap, expectedUrl: string) {
      const context = {
        getUsername: () => testMetadata.jwtUsername,
        logger: $$.TEST_LOGGER,
      };
      const defaults = {
        clientId: testMetadata.clientId,
        loginUrl: testMetadata.loginUrl,
        privateKey: 'fake/pk',
      };

      const authResponse = {
        access_token: testMetadata.accessToken,
        instance_url: testMetadata.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
      };

      // Stub file I/O, http requests, and the DNS lookup
      readFileStub.returns(Promise.resolve('audienceUrlTest_privateKey'));
      _postParmsStub.returns(Promise.resolve(authResponse));
      const signStub: sinon.SinonStub = stubMethod($$.SANDBOX, jwt, 'sign').returns(
        Promise.resolve('audienceUrlTest_jwtToken')
      );
      stubMethod($$.SANDBOX, dns, 'lookup').callsFake((url: string, done: (v: AnyJson, w: JsonMap) => {}) =>
        done(null, { address: '1.1.1.1', family: 4 })
      );

      await AuthInfo.prototype['buildJwtConfig'].call(context, Object.assign(defaults, options));

      expect(signStub.firstCall.args[0]).to.have.property('aud', expectedUrl);
    }

    describe('internal urls', () => {
      it('should use the correct audience URL for an internal URL (.internal)', async () => {
        await runTest({ loginUrl: testMetadata.instanceUrl }, testMetadata.instanceUrl);
      });

      it('should use the correct audience URL for an internal URL (.vpod)', async () => {
        const vpodUrl = 'http://mydevhub.vpod.salesforce.com';
        await runTest({ loginUrl: vpodUrl }, vpodUrl);
      });

      it('should use the correct audience URL for an internal URL (.blitz)', async () => {
        const blitzUrl = 'http://mydevhub.blitz.salesforce.com';
        await runTest({ loginUrl: blitzUrl }, blitzUrl);
      });

      it('should use the correct audience URL for an internal URL (.stm)', async () => {
        const stmUrl = 'http://mydevhub.stm.salesforce.com';
        await runTest({ loginUrl: stmUrl }, stmUrl);
      });
    });

    describe('sandboxes', () => {
      it('should use the correct audience URL for a sandbox', async () => {
        await runTest({ loginUrl: 'http://test.salesforce.com/foo/bar' }, 'https://test.salesforce.com');
      });

      it('should use the correct audience URL for createdOrgInstance beginning with "cs"', async () => {
        await runTest({ createdOrgInstance: 'cs17' }, 'https://test.salesforce.com');
      });

      it('should use the correct audience URL for createdOrgInstance beginning with "CS"', async () => {
        await runTest({ createdOrgInstance: 'CS17' }, 'https://test.salesforce.com');
      });

      it('should use the correct audience URL for createdOrgInstance ending with "s"', async () => {
        await runTest({ createdOrgInstance: 'usa2s' }, 'https://test.salesforce.com');
      });

      it('should use the correct audience URL for createdOrgInstance capitalized and ending with "s"', async () => {
        await runTest({ createdOrgInstance: 'IND2S' }, 'https://test.salesforce.com');
      });

      it('should use the correct audience URL for sandbox enhanced domains', async () => {
        await runTest(
          { loginUrl: 'https://customdomain--sandboxname.sandbox.my.salesforce.com' },
          'https://test.salesforce.com'
        );
      });

      it('should use the correct audience URL for scratch orgs with domains', async () => {
        await runTest({ loginUrl: 'https://cs17.my.salesforce.com' }, 'https://test.salesforce.com');
      });

      it('should use the correct audience URL for scratch orgs with domains (capitalized)', async () => {
        await runTest({ loginUrl: 'https://CS17.my.salesforce.com' }, 'https://test.salesforce.com');
      });

      it('should use the correct audience URL for scratch orgs without domains', async () => {
        await runTest({ loginUrl: 'https://cs17.salesforce.com' }, 'https://test.salesforce.com');
      });

      it('should use the correct audience URL for a typical scratch org domain', async () => {
        await runTest(
          { loginUrl: 'https://computing-nosoftware-9542-dev-ed.cs77.my.salesforce.com' },
          'https://test.salesforce.com'
        );
      });
      it('should use the correct audience URL for scratch orgs without domains (capitalized)', async () => {
        await runTest({ loginUrl: 'https://CS17.salesforce.com' }, 'https://test.salesforce.com');
      });
    });

    describe('falcon', () => {
      it('returns sandbox audience for falcon domains', async () => {
        await runTest({ loginUrl: 'https://usa2s.sfdc-yfeipo.salesforce.com/' }, 'https://test.salesforce.com');
      });

      it('returns sandbox audience for falcon domains in india', async () => {
        await runTest({ loginUrl: 'https://ind2s.sfdc-yfeipo.salesforce.com/' }, 'https://test.salesforce.com');
      });

      it('returns sandbox audience for weirdly uppercased falcon domains', async () => {
        await runTest({ loginUrl: 'https://USA2S.sfdc-yfeipo.salesforce.com/' }, 'https://test.salesforce.com');
      });

      it('returns prod audience for falcon domains', async () => {
        await runTest({ loginUrl: 'https://usa2.sfdc-yfeipo.salesforce.com/' }, 'https://login.salesforce.com');
      });
    });

    it('should use the correct audience URL for SFDX_AUDIENCE_URL env var', async () => {
      process.env.SFDX_AUDIENCE_URL = 'http://authInfoTest/audienceUrl/test';
      await runTest({}, process.env.SFDX_AUDIENCE_URL);
    });

    it('should use the correct audience URL for createdOrgInstance beginning with "gs1"', async () => {
      await runTest({ createdOrgInstance: 'gs1' }, 'https://gs1.salesforce.com');
    });

    it('should use the correct audience URL for production enhanced domains', async () => {
      await runTest({ loginUrl: 'https://customdomain.my.salesforce.com' }, 'https://login.salesforce.com');
    });
    it('should use correct audience url derived from cname in salesforce.com', async () => {
      const sandboxNondescriptUrl = new URL('https://efficiency-flow-2380-dev-ed.my.salesforce.com');
      const usa3sVIP = new URL('https://usa3s.sfdc-ypmv18.salesforce.com');
      $$.SANDBOX.stub(dns, 'resolveCname').callsFake((host: string, callback: AnyFunction) => {
        callback(null, [usa3sVIP.host]);
      });
      await runTest({ loginUrl: sandboxNondescriptUrl.toString() }, 'https://test.salesforce.com');
    });
    it('should use correct audience url derived from cname in force.com', async () => {
      const sandboxNondescriptUrl = new URL('https://efficiency-flow-2380-dev-ed.my.salesforce.com');
      const usa3sVIP = new URL('https://usa3s.sfdc-ypmv18.force.com');
      $$.SANDBOX.stub(dns, 'resolveCname').callsFake((host: string, callback: AnyFunction) => {
        callback(null, [usa3sVIP.host]);
      });
      await runTest({ loginUrl: sandboxNondescriptUrl.toString() }, 'https://test.salesforce.com');
    });
  });

  describe('getDefaultInstanceUrl', () => {
    it('should return the configured instance url if it exists', async () => {
      stubMethod($$.SANDBOX, ConfigAggregator, 'getValue').returns({ value: testMetadata.instanceUrl });
      const result = AuthInfo.getDefaultInstanceUrl();
      expect(result).to.equal(testMetadata.instanceUrl);
    });

    it('should return the default instance url if no configured instance url exists', async () => {
      stubMethod($$.SANDBOX, ConfigAggregator, 'getValue').returns({ value: null });
      const result = AuthInfo.getDefaultInstanceUrl();
      expect(result).to.equal('https://login.salesforce.com');
    });
  });

  describe('hasAuthentications', () => {
    it('should return false', async () => {
      stubMethod($$.SANDBOX, OrgAccessor.prototype, 'getAll').returns({});
      const result = await AuthInfo.hasAuthentications();
      expect(result).to.be.false;
    });

    it('should return true', async () => {
      const result: boolean = await AuthInfo.hasAuthentications();
      expect(result).to.be.equal(true);
    });
  });

  describe('listAllAuthorizations', () => {
    describe('with no AuthInfo.create errors', () => {
      const username = 'espresso@coffee.com';
      let timestamp;

      beforeEach(async () => {
        stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'loadProperties').callsFake(async () => {});
        stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'getPropertyValue').returns(testMetadata.instanceUrl);
        stubMethod($$.SANDBOX, OrgAccessor.prototype, 'has').returns(false);
        // Stub the http request (OAuth2.refreshToken())
        // This will be called for both, and we want to make sure the clientSecrete is the
        // same for both.
        _postParmsStub.callsFake((params) => {
          expect(params.client_secret).to.deep.equal(testMetadata.clientSecret);
          return {
            access_token: testMetadata.accessToken,
            instance_url: testMetadata.instanceUrl,
            refresh_token: testMetadata.refreshToken,
            id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
          };
        });

        const jwtData = {};
        set(jwtData, 'accessToken', testMetadata.encryptedAccessToken);
        set(jwtData, 'clientId', testMetadata.clientId);
        set(jwtData, 'loginUrl', testMetadata.loginUrl);
        set(jwtData, 'instanceUrl', testMetadata.instanceUrl);
        set(jwtData, 'privateKey', 'authInfoTest/jwt/server.key');
        set(jwtData, 'username', username);
        testMetadata.fetchConfigInfo = () => jwtData;

        const authInfo = await AuthInfo.create({
          username,
          oauth2Options: {
            clientId: testMetadata.clientId,
            clientSecret: testMetadata.clientSecret,
            loginUrl: testMetadata.instanceUrl,
            authCode: testMetadata.authCode,
          },
        });
        timestamp = (await GlobalInfo.getInstance()).orgs.get(username).timestamp;
        stubMethod($$.SANDBOX, AuthInfo, 'create').withArgs({ username }).returns(Promise.resolve(authInfo));
      });

      it('should return list of authorizations with web oauthMethod', async () => {
        const auths = await AuthInfo.listAllAuthorizations();
        expect(auths).to.deep.equal([
          {
            alias: undefined,
            username: 'espresso@coffee.com',
            orgId: '00DAuthInfoTest_orgId',
            instanceUrl: 'http://mydevhub.localhost.internal.salesforce.com:6109',
            accessToken: 'authInfoTest_access_token',
            oauthMethod: 'web',
            timestamp,
          },
        ]);
      });

      it('should return list of authorizations with jwt oauthMethod', async () => {
        stubMethod($$.SANDBOX, AuthInfo.prototype, 'isJwt').returns(true);
        const auths = await AuthInfo.listAllAuthorizations();
        expect(auths).to.deep.equal([
          {
            alias: undefined,
            username: 'espresso@coffee.com',
            orgId: '00DAuthInfoTest_orgId',
            instanceUrl: 'http://mydevhub.localhost.internal.salesforce.com:6109',
            accessToken: 'authInfoTest_access_token',
            oauthMethod: 'jwt',
            timestamp,
          },
        ]);
      });

      it('should return list of authorizations with token oauthMethod', async () => {
        stubMethod($$.SANDBOX, AuthInfo.prototype, 'isJwt').returns(false);
        stubMethod($$.SANDBOX, AuthInfo.prototype, 'isOauth').returns(false);
        const auths = await AuthInfo.listAllAuthorizations();
        expect(auths).to.deep.equal([
          {
            alias: undefined,
            username: 'espresso@coffee.com',
            orgId: '00DAuthInfoTest_orgId',
            instanceUrl: 'http://mydevhub.localhost.internal.salesforce.com:6109',
            accessToken: 'authInfoTest_access_token',
            oauthMethod: 'token',
            timestamp,
          },
        ]);
      });

      it('should return list of authorizations with alias', async () => {
        stubMethod($$.SANDBOX, AliasAccessor.prototype, 'get').returns('MyAlias');
        const auths = await AuthInfo.listAllAuthorizations();
        expect(auths).to.deep.equal([
          {
            alias: 'MyAlias',
            username: 'espresso@coffee.com',
            orgId: '00DAuthInfoTest_orgId',
            instanceUrl: 'http://mydevhub.localhost.internal.salesforce.com:6109',
            accessToken: 'authInfoTest_access_token',
            oauthMethod: 'web',
            timestamp,
          },
        ]);
      });
    });

    describe('with AuthInfo.create errors', () => {
      beforeEach(async () => {
        const username = 'espresso@coffee.com';
        stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'loadProperties').callsFake(async () => {});
        stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'getPropertyValue').returns(testMetadata.instanceUrl);

        const jwtData = {};
        set(jwtData, 'accessToken', testMetadata.encryptedAccessToken);
        set(jwtData, 'clientId', testMetadata.clientId);
        set(jwtData, 'loginUrl', testMetadata.loginUrl);
        set(jwtData, 'instanceUrl', testMetadata.instanceUrl);
        set(jwtData, 'privateKey', 'authInfoTest/jwt/server.key');
        set(jwtData, 'orgId', '00DAuthInfoTest_orgId');
        set(jwtData, 'username', username);
        testMetadata.fetchConfigInfo = () => jwtData;
        stubMethod($$.SANDBOX, AuthInfo, 'create').withArgs({ username }).throws(new Error('FAIL!'));
      });

      it('should return list of authorizations with unknown oauthMethod', async () => {
        const auths = await AuthInfo.listAllAuthorizations();
        expect(auths).to.deep.equal([
          {
            alias: undefined,
            username: 'espresso@coffee.com',
            orgId: '00DAuthInfoTest_orgId',
            instanceUrl: 'http://mydevhub.localhost.internal.salesforce.com:6109',
            accessToken: undefined,
            oauthMethod: 'unknown',
            error: 'FAIL!',
            timestamp: undefined,
          },
        ]);
      });

      it('should return list of authorizations with unknown oauthMethod and alias', async () => {
        stubMethod($$.SANDBOX, AliasAccessor.prototype, 'get').returns('MyAlias');
        const auths = await AuthInfo.listAllAuthorizations();
        expect(auths).to.deep.equal([
          {
            alias: 'MyAlias',
            username: 'espresso@coffee.com',
            orgId: '00DAuthInfoTest_orgId',
            instanceUrl: 'http://mydevhub.localhost.internal.salesforce.com:6109',
            accessToken: undefined,
            oauthMethod: 'unknown',
            error: 'FAIL!',
            timestamp: undefined,
          },
        ]);
      });
    });
  });

  describe('parseSfdxAuthUrl()', () => {
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

    it('should parse the token that includes = for padding', () => {
      const options = AuthInfo.parseSfdxAuthUrl(
        'force://PlatformCLI::5Aep861_OKMvio5gy8xCNsXxybPdupY9fVEZyeVOvb4kpOZx5Z1QLB7k7n5flEqEWKcwUQEX1I.O5DCFwjlYU==@test.my.salesforce.com'
      );

      expect(options.refreshToken).to.equal(
        '5Aep861_OKMvio5gy8xCNsXxybPdupY9fVEZyeVOvb4kpOZx5Z1QLB7k7n5flEqEWKcwUQEX1I.O5DCFwjlYU=='
      );
      expect(options.clientId).to.equal('PlatformCLI');
      expect(options.clientSecret).to.equal('');
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
        AuthInfo.parseSfdxAuthUrl(
          'PlatformCLI::5Aep861_OKMvio5gy8xCNsXxybPdupY9fVEZyeVOvb4kpOZx5Z1QLB7k7n5flEqEWKcwUQEX1I.O5DCFwjlYUB.@test.my.salesforce.com'
        );
        assert.fail();
      } catch (e) {
        expect(e.name).to.equal('INVALID_SFDX_AUTH_URL');
      }
    });
  });
  describe('Handle User Get Errors', () => {
    let authCodeConfig: any;
    beforeEach(async () => {
      authCodeConfig = {
        authCode: testMetadata.authCode,
        loginUrl: testMetadata.loginUrl,
      };
      const authResponse = {
        access_token: testMetadata.accessToken,
        instance_url: testMetadata.instanceUrl,
        id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
        refresh_token: testMetadata.refreshToken,
      };

      // Stub the http requests (OAuth2.requestToken() and the request for the username)
      _postParmsStub.returns(Promise.resolve(authResponse));
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
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').returns(Promise.resolve(responseBody));
      try {
        await AuthInfo.create({ oauth2Options: authCodeConfig });
        assert(false, 'should throw');
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
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').returns(Promise.resolve(responseBody));
      try {
        await AuthInfo.create({ oauth2Options: authCodeConfig });
        assert(false, 'should throw');
      } catch (err) {
        expect(err).to.have.property('message').to.include('The REST API is not enabled for this Organization');
      }
    });
    it('user get returns 403 with string body', async () => {
      const responseBody = {
        statusCode: 403,
        body: 'The REST API is not enabled for this Organization',
      };
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').returns(Promise.resolve(responseBody));
      try {
        await AuthInfo.create({ oauth2Options: authCodeConfig });
        assert(false, 'should throw');
      } catch (err) {
        expect(err).to.have.property('message').to.include('The REST API is not enabled for this Organization');
      }
    });
    it('user get returns server error with no body', async () => {
      const responseBody = {
        statusCode: 500,
      };
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').returns(Promise.resolve(responseBody));
      try {
        await AuthInfo.create({ oauth2Options: authCodeConfig });
        assert(false, 'should throw');
      } catch (err) {
        expect(err).to.have.property('message').to.include('UNKNOWN');
      }
    });
    it('user get returns server error with html body', async () => {
      const responseBody = {
        statusCode: 500,
        body: '<html lang=""><body>Server error occurred, please contact Salesforce Support if the error persists</body></html>',
      };
      stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').returns(Promise.resolve(responseBody));
      try {
        await AuthInfo.create({ oauth2Options: authCodeConfig });
        assert(false, 'should throw');
      } catch (err) {
        expect(err).to.have.property('message').to.include('Server error occurred');
      }
    });
  });
});
