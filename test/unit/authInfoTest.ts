/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { cloneJson, get, set } from '@salesforce/kit';
import { spyMethod, stubMethod } from '@salesforce/ts-sinon';
import {
    AnyJson,
    ensureString,
    isBoolean,
    isFunction, isJsonArray, isJsonMap,
    isNumber,
    isPlainObject,
    isString,
    JsonMap
} from '@salesforce/ts-types';
import { assert, expect } from 'chai';
import * as dns from 'dns';
import { OAuth2 } from 'jsforce';
// @ts-ignore WebStorm is reporting an error for the nested import
import * as Transport from 'jsforce/lib/transport';
import * as jwt from 'jsonwebtoken';
import { AuthFields, AuthInfo } from '../../src/authInfo';
import { AuthInfoConfig } from '../../src/config/authInfoConfig';
import { ConfigFile } from '../../src/config/configFile';
import { ConfigContents } from '../../src/config/configStore';
import { Crypto } from '../../src/crypto';
import { ConfigAggregator } from '../../src/exported';
import { SfdxError } from '../../src/sfdxError';
import { testSetup } from '../../src/testSetup';
import * as fs from '../../src/util/fs';

const TEST_KEY = {
    service: 'sfdx',
    account: 'local',
    key: '8e8fd1e6dc06a37bf420898dbc3ee35c'
};

// Setup the test environment.
const $$ = testSetup();

describe('AuthInfo No fs mock', () => {
    beforeEach(() => {
        // Testing crypto functionality, so restore global stubs.
        $$.SANDBOXES.CRYPTO.restore();
        $$.SANDBOXES.CONFIG.restore();

        stubMethod($$.SANDBOX, Crypto.prototype, 'getKeyChain').callsFake(() => Promise.resolve({
            setPassword: () => Promise.resolve(),
            getPassword: (data: JsonMap, cb: (val1: AnyJson, key: string) => {}) => cb(undefined, TEST_KEY.key)
        }));
        stubMethod($$.SANDBOX, AuthInfoConfig.prototype, 'read').callsFake(async () => {
            const error = new SfdxError('Test error', 'testError');
            set(error, 'code', 'ENOENT');
            return Promise.reject(error);
        });
    });

    it('missing config', async () => {
        const expectedErrorName = 'NamedOrgNotFound';
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

    private _instanceUrl: string = 'http://mydevhub.localhost.internal.salesforce.com:6109';
    private _accessToken: string = 'authInfoTest_access_token';
    private _encryptedAccessToken: string = this._accessToken;
    private _refreshToken: string = 'authInfoTest_refresh_token';
    private _encryptedRefreshToken: string = this._refreshToken;
    private _clientId: string = 'authInfoTest_client_id';
    private _loginUrl: string = 'authInfoTest_login_url';
    private _jwtUsername: string = 'authInfoTest_username_JWT';
    private _redirectUri: string = 'http://localhost:1717/OauthRedirect';
    private _authCode: string = 'authInfoTest_authCode';
    private _authInfoLookupCount: number = 0;
    private _defaultConnectedAppInfo: AuthFields = {
        clientId: 'SalesforceDevelopmentExperience',
        clientSecret: '1384510088588713504'
    };

    constructor() {
        this._jwtUsername = `${this._jwtUsername}_${$$.uniqid()}`;
    }

    get instanceUrl(): string {
        return this._instanceUrl;
    }

    set instanceUrl(value: string) {
        this._instanceUrl = value;
    }

    get accessToken(): string {
        return this._accessToken;
    }

    get refreshToken(): string {
        return this._refreshToken;
    }

    get clientId(): string {
        return this._clientId;
    }

    get loginUrl(): string {
        return this._loginUrl;
    }

    set loginUrl(value: string) {
        this._loginUrl = value;
    }

    get jwtUsername(): string {
        return this._jwtUsername;
    }

    set jwtUsername(value: string) {
        this._jwtUsername = value;
    }

    get username(): string {
        return this._jwtUsername;
    }

    get redirectUri(): string {
        return this._redirectUri;
    }

    get authCode(): string {
        return this._authCode;
    }

    set authCode(value: string) {
        this._authCode = value;
    }

    get defaultConnectedAppInfo(): AuthFields {
        return this._defaultConnectedAppInfo;
    }

    set defaultConnectedAppInfo(value: AuthFields) {
        this._defaultConnectedAppInfo = value;
    }

    get encryptedAccessToken(): string {
        return this._encryptedAccessToken;
    }

    set encryptedAccessToken(value: string) {
        this._encryptedAccessToken = value;
    }

    get encryptedRefreshToken(): string {
        return this._encryptedRefreshToken;
    }

    set encryptedRefreshToken(value: string) {
        this._encryptedRefreshToken = value;
    }

    get authInfoLookupCount(): number {
        return this._authInfoLookupCount;
    }

    public async fetchConfigInfo(path: string): Promise<ConfigContents> {
        if (path.toUpperCase().includes('JWT')) {
            this._authInfoLookupCount = this._authInfoLookupCount + 1;
            // const configContents = new Map<string, ConfigValue>();
            const configContents = {};

            set(configContents, 'instanceUrl', 'http://mydevhub.localhost.internal.salesforce.com:6109');
            set(configContents, 'accessToken', this.encryptedAccessToken);
            set(configContents, 'privateKey', '123456');
            return Promise.resolve(configContents);
        } else {
            return Promise.reject(
                new SfdxError('Not mocked - unhandled test case', 'UnsupportedTestCase'));
        }
    }

    public async statForKeyFile(path: string): Promise<any> { // tslint:disable-line:no-any
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
            birthtime: new Date('2017-11-14T16:49:25.000Z')
        });
    }
}

describe('AuthInfo', () => {
    let authInfoInit: sinon.SinonSpy;
    let authInfoUpdate: sinon.SinonSpy;
    let authInfoBuildJwtConfig: sinon.SinonSpy;
    let authInfoBuildRefreshTokenConfig: sinon.SinonSpy;
    let authInfoBuildWebAuthConfig: sinon.SinonSpy;

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

        stubMethod($$.SANDBOX, ConfigFile.prototype, 'read').callsFake(async function(this: AuthInfoConfig) {
            console.log(`this.constructor.name: ${JSON.stringify(this.constructor.name, null, 4)}`);
            this.setContentsFromObject(await testMetadata.fetchConfigInfo(this.getPath()));
            return this.getContents();
        });

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
        authInfoBuildWebAuthConfig = spyMethod($$.SANDBOX, AuthInfo.prototype, 'buildWebAuthConfig');
    });

    describe('Secret Tests', () => {
        let authInfo: AuthInfo;
        let decryptedRefreshToken: string;
        beforeEach (async () => {
            const authCodeConfig = {
                authCode: testMetadata.authCode,
                loginUrl: testMetadata.loginUrl
            };
            const authResponse = {
                access_token: testMetadata.accessToken,
                instance_url: testMetadata.instanceUrl,
                id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
                refresh_token: testMetadata.refreshToken
            };

            // Stub the http requests (OAuth2.requestToken() and the request for the username)
            _postParmsStub.returns(Promise.resolve(authResponse));
            const responseBody = { body: JSON.stringify({ Username: testMetadata.username }) };
            stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').returns(Promise.resolve(responseBody));
            authInfo = await AuthInfo.create({ oauth2Options: authCodeConfig });

            const crypto = await Crypto.create();
            decryptedRefreshToken = crypto.decrypt(authInfo.getFields().refreshToken) || '';
        });

        describe('updateInfo', () => {
            it('cache hit and miss', async () => {
                const postInitLookupCount: number = testMetadata.authInfoLookupCount;
                const username = authInfo.getFields().username || '';

                // username is cached at this point from before each
                await AuthInfo.create({ username });

                // because it was cached there should be no change in the lookup count.
                expect(testMetadata.authInfoLookupCount).to.equal(postInitLookupCount);

                // clearCache will remove the username entry from the cache.
                AuthInfo.clearCache(username);

                // The cached name will cause a cache mis
                await AuthInfo.create({ username });

                // And thus cause a re-read.
                expect(testMetadata.authInfoLookupCount).to.equal(postInitLookupCount + 1);
            });
        });

        // @todo replace this with includes from kit.
        const includes = (element: AnyJson, value: AnyJson) => {
            if (element && !isFunction(element) && !isBoolean(element) && !isNumber(element)) {
                if (isJsonMap(element)) return Object.values(element).includes(value);

                if (element.includes) {
                    if (isJsonArray(element)) return element.includes(value);

                    if (isString(value)) return element.includes(value);
                }
            }
            return false;
        };

        // Walk an object deeply looking for the attribute name of clientSecret or values that contain the client secret
        // or decrypted refresh token.
        const walkAndSearchForSecrets = (obj: object) => {
            const keys = Object.keys(obj);
            keys.forEach((key: string) => {
                if (isPlainObject(get(obj, key))) {
                    walkAndSearchForSecrets(get(obj, key));
                }
                const keyUpper = key.toUpperCase();

                // If the key is likely a clientSecret "ish" attribute and the value is a string.
                // reminder:'clientSecretFn' is always legit.
                if (keyUpper.includes('SECRET') && keyUpper.includes('CLIENT') && isString(get(obj, key))) {
                    throw new Error('Key indicates client secret.');
                }

                if (includes(get(obj, key), testMetadata.defaultConnectedAppInfo.clientSecret)) {
                    throw new Error(`Client secret present as value in object with key: ${key}`);
                }

                if (includes(get(obj, key), decryptedRefreshToken)) {
                    throw new Error(`Refresh token present as value in object with key: ${key}`);
                }
            });
        };

        describe('getFields', () => {
            it('return value should not have a client secret or decrypted refresh token', () => {
                const fields: AuthFields = authInfo.getFields();
                const strObj: string = JSON.stringify(fields);

                // verify the returned object doesn't have secrets
                expect(() => walkAndSearchForSecrets(fields)).to.not.throw();

                expect(strObj).does.not.include(ensureString(testMetadata.defaultConnectedAppInfo.clientSecret));
                expect(strObj).does.not.include(decryptedRefreshToken);
            });
        });

        describe('getConnectionOptions', () => {
            it ('return value should not have a client secret or decrypted refresh token', () => {
                const fields: AuthFields = authInfo.getConnectionOptions();
                const strObj: string = JSON.stringify(fields);

                // verify the returned object doesn't have secrets
                expect(() => walkAndSearchForSecrets(fields)).to.not.throw();

                // double check the stringified objects don't have secrets.
                expect(strObj).does.not.include(ensureString(testMetadata.defaultConnectedAppInfo.clientSecret));
                expect(strObj).does.not.include(decryptedRefreshToken);
            });
        });

        describe('AuthInfo', () => {
            it ('should not have a client secret or decrypted refresh token', () => {
                const authInfoString: string = JSON.stringify(authInfo);

                // verify the returned object doesn't have secrets
                expect(() => walkAndSearchForSecrets(authInfo)).to.not.throw();

                // double check the stringified objects don't have secrets.
                expect(authInfoString).does.not.include(ensureString(testMetadata.defaultConnectedAppInfo.clientSecret));
                expect(authInfoString).does.not.include(decryptedRefreshToken);
            });
        });
    });

    describe('create()', () => {
        it('should return an AuthInfo instance when passed an access token as username', async () => {
            stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'loadProperties').callsFake(async () => { });
            stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'getPropertyValue').returns(testMetadata.instanceUrl);

            const username = '00Dxx0000000001!AQEAQI3AIbublfW11ATFJl9T122vVPj5QaInBp6h9nPsUK8oW4rW5Os0ZjtsUU.DG9rXytUCh3RZvc_XYoRULiHeTMjyi6T1';
            const authInfo = await AuthInfo.create({ username });

            const expectedFields = { accessToken: username, instanceUrl: testMetadata.instanceUrl };
            expect(authInfo.getConnectionOptions()).to.deep.equal(expectedFields);
            expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be true').to.be.true;
            expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be false').to.be.false;
            expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
            expect(authInfo.isOauth(), 'authInfo.isOauth() should be false').to.be.false;
        });

        it('should return an AuthInfo instance when passed an access token and instanceUrl for the access token flow', async () => {
            stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'loadProperties').callsFake(async () => { });
            stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'getPropertyValue').returns(testMetadata.instanceUrl);

            const accessToken = '00Dxx0000000001!AQEAQI3AIbublfW11ATFJl9T122vVPj5QaInBp6h9nPsUK8oW4rW5Os0ZjtsUU.DG9rXytUCh3RZvc_XYoRULiHeTMjyi6T1';
            const authInfo = await AuthInfo.create({
                username: 'test',
                accessTokenOptions: {
                    accessToken, instanceUrl: testMetadata.instanceUrl, loginUrl: testMetadata.instanceUrl
                }
            });

            const expectedFields = { accessToken, instanceUrl: testMetadata.instanceUrl };
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
                    privateKey: 'authInfoTest/jwt/server.key'
                };
                const jwtConfigClone = cloneJson(jwtConfig);
                const authResponse = {
                    access_token: testMetadata.accessToken,
                    instance_url: testMetadata.instanceUrl,
                    id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId'
                };

                // Stub file I/O, http requests, and the DNS lookup
                readFileStub.returns(Promise.resolve('authInfoTest_private_key'));
                _postParmsStub.returns(Promise.resolve(authResponse));
                stubMethod($$.SANDBOX, jwt, 'sign').returns(Promise.resolve('authInfoTest_jwtToken'));
                stubMethod($$.SANDBOX, dns, 'lookup').callsFake((url: string, done: (v: AnyJson, w: JsonMap) => {}) =>
                    done(null, { address: '1.1.1.1', family: 4 }));

                // Create the JWT AuthInfo instance
                const authInfo = await AuthInfo.create({ username: testMetadata.jwtUsername, oauth2Options: jwtConfig });

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
                expect(readFileStub.called).to.be.true;
                expect(AuthInfoConfig.getOptions(testMetadata.jwtUsername).filename).to.equal(`${testMetadata.jwtUsername}.json`);

                // Verify the jwtConfig object was not mutated by init() or buildJwtConfig()
                expect(jwtConfig).to.deep.equal(jwtConfigClone);

                const expectedAuthConfig = {
                    accessToken: authResponse.access_token,
                    instanceUrl: testMetadata.instanceUrl,
                    orgId: authResponse.id.split('/')[0],
                    loginUrl: jwtConfig.loginUrl,
                    privateKey: jwtConfig.privateKey
                };
                expect(authInfoUpdate.firstCall.args[0]).to.deep.equal(expectedAuthConfig);
            });

            // This test relies on the previous test caching the AuthInfo.
            it('should return a cached JWT AuthInfo instance when passed a username', async () => {
                // Create the JWT AuthInfo instance
                const authInfo = await AuthInfo.create({ username: testMetadata.jwtUsername });

                // Verify the returned AuthInfo instance
                const authInfoConnOpts = authInfo.getConnectionOptions();
                expect(authInfoConnOpts).to.have.property('accessToken', testMetadata.accessToken);
                expect(authInfoConnOpts).to.have.property('instanceUrl', testMetadata.instanceUrl);
                expect(authInfoConnOpts).to.have.property('refreshFn').and.is.a('function');
                expect(authInfo.getUsername()).to.equal(testMetadata.jwtUsername);
                expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
                expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be false').to.be.false;
                expect(authInfo.isJwt(), 'authInfo.isJwt() should be true').to.be.true;
                expect(authInfo.isOauth(), 'authInfo.isOauth() should be false').to.be.false;

                // Verify correct method calls
                expect(authInfoInit.called).to.be.true;
                expect(authInfoInit.firstCall.args[0], 'should NOT have passed any args to AuthInfo.init()').to.be.undefined;
                expect(authInfoUpdate.called).to.be.true;
                expect(authInfoBuildJwtConfig.called, 'should NOT have called AuthInfo.buildJwtConfig() - should get from cache').to.be.false;
                expect(testMetadata.authInfoLookupCount === 0, 'should NOT have called Global.fetchConfigInfo() for auth info').to.be.true;
                expect(AuthInfoConfig.getOptions(testMetadata.jwtUsername).filename).to.equal(`${testMetadata.jwtUsername}.json`);
            });
        });

        it('should return a JWT AuthInfo instance when passed a username from an auth file', async () => {
            const username = 'authInfoTest_username_jwt-NOT-CACHED';

            // Make the file read stub return JWT auth data
            const jwtData = {};
            set(jwtData, 'accessToken', testMetadata.encryptedAccessToken);
            set(jwtData, 'clientId', testMetadata.clientId);
            set(jwtData, 'loginUrl', testMetadata.loginUrl);
            set(jwtData, 'instanceUrl', testMetadata.instanceUrl);
            set(jwtData, 'privateKey', 'authInfoTest/jwt/server.key');

            testMetadata.fetchConfigInfo = () => {
                return Promise.resolve(jwtData);
            };

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
            expect(authInfo['fields'].accessToken).equals(get(jwtData, 'accessToken'));

            // Verify correct method calls
            expect(authInfoInit.called).to.be.true;
            expect(authInfoInit.firstCall.args[0], 'should NOT have passed any args to AuthInfo.init()').to.be.undefined;
            expect(authInfoUpdate.called).to.be.true;
            expect(authInfoBuildJwtConfig.called, 'should NOT have called AuthInfo.buildJwtConfig() - should get from cache').to.be.false;
            expect(testMetadata.authInfoLookupCount === 0, 'should not have called Global.fetchConfigInfo() for auth info - using overridden instance').to.be.true;
            expect(AuthInfoConfig.getOptions(username).filename).to.equal(`${username}.json`);
        });

        it('should throw a JWTAuthError when auth fails via a OAuth2.jwtAuthorize()', async () => {
            const username = 'authInfoTest_username_jwt_ERROR1';
            const jwtConfig = {
                clientId: testMetadata.clientId,
                loginUrl: testMetadata.loginUrl,
                privateKey: 'authInfoTest/jwt/server.key'
            };

            // Stub file I/O, http requests, and the DNS lookup
            readFileStub.returns(Promise.resolve('authInfoTest_private_key'));
            _postParmsStub.throws(new Error('authInfoTest_ERROR_MSG'));
            stubMethod($$.SANDBOX, jwt, 'sign').returns(Promise.resolve('authInfoTest_jwtToken'));
            stubMethod($$.SANDBOX, dns, 'lookup').callsFake((url: string,  done: (v: AnyJson, w: JsonMap) => {}) =>
                done(null, { address: '1.1.1.1', family: 4 }));

            // Create the JWT AuthInfo instance
            try {
                await AuthInfo.create({ username, oauth2Options: jwtConfig });
                assert.fail('should have thrown an error within AuthInfo.buildJwtConfig()');
            } catch (err) {
                expect(err.name).to.equal('JWTAuthError');
            }
        });

        it('should catch a DNS error and set the instanceUrl when DNS lookup fails', async () => {
            const username = 'authInfoTest_username_jwt_ERROR2';
            const jwtConfig = {
                clientId: testMetadata.clientId,
                loginUrl: testMetadata.loginUrl,
                privateKey: 'authInfoTest/jwt/server.key'
            };
            const authResponse = {
                access_token: testMetadata.accessToken,
                instance_url: testMetadata.instanceUrl,
                id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId'
            };

            // Stub file I/O, http requests, and the DNS lookup
            readFileStub.returns(Promise.resolve('authInfoTest_private_key'));
            _postParmsStub.returns(Promise.resolve(authResponse));
            stubMethod($$.SANDBOX, jwt, 'sign').returns(Promise.resolve('authInfoTest_jwtToken'));
            stubMethod($$.SANDBOX, dns, 'lookup').callsFake((url: string | Error,  done: (v: Error) => {}) =>
                done(new Error('authInfoTest_ERROR_MSG')));

            // Create the JWT AuthInfo instance
            const authInfo = await AuthInfo.create({ username, oauth2Options: jwtConfig });

            expect(authInfo.getConnectionOptions()).to.have.property('instanceUrl', jwtConfig.loginUrl);
        });

        //
        // Refresh token tests
        //

        it('should return a refresh token AuthInfo instance when passed a username and refresh token auth options', async () => {
            const username = 'authInfoTest_username_RefreshToken';
            const refreshTokenConfig = {
                refreshToken: testMetadata.refreshToken,
                loginUrl: testMetadata.loginUrl
            };
            const refreshTokenConfigClone = cloneJson(refreshTokenConfig);
            const authResponse = {
                access_token: testMetadata.accessToken,
                instance_url: testMetadata.instanceUrl,
                id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId'
            };

            // Stub the http request (OAuth2.refreshToken())
            _postParmsStub.returns(Promise.resolve(authResponse));

            // Create the refresh token AuthInfo instance
            const authInfo = await AuthInfo.create({ username, oauth2Options: refreshTokenConfig });

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
            expect(crypto.decrypt(authInfo['fields'].accessToken)).equals(authResponse.access_token);
            expect(crypto.decrypt(authInfo['fields'].refreshToken)).equals(refreshTokenConfig.refreshToken);

            // Verify expected methods are called with expected args
            expect(authInfoInit.called).to.be.true;
            expect(authInfoInit.firstCall.args[0]).to.equal(refreshTokenConfig);
            expect(authInfoUpdate.called).to.be.true;
            expect(authInfoBuildRefreshTokenConfig.called).to.be.true;
            expect(authInfoBuildRefreshTokenConfig.firstCall.args[0]).to.include(refreshTokenConfig);
            expect(AuthInfoConfig.getOptions(username).filename).to.equal(`${username}.json`);

            // Verify the refreshTokenConfig object was not mutated by init() or buildRefreshTokenConfig()
            expect(refreshTokenConfig).to.deep.equal(refreshTokenConfigClone);

            const expectedAuthConfig = {
                accessToken: authResponse.access_token,
                instanceUrl: testMetadata.instanceUrl,
                orgId: authResponse.id.split('/')[0],
                loginUrl: refreshTokenConfig.loginUrl,
                refreshToken: refreshTokenConfig.refreshToken,
                clientId: testMetadata.defaultConnectedAppInfo.clientId,
                clientSecret: testMetadata.defaultConnectedAppInfo.clientSecret
            };
            expect(authInfoUpdate.firstCall.args[0]).to.deep.equal(expectedAuthConfig);
        });

        it('should return a refresh token AuthInfo instance with username in auth options', async () => {
            const username = 'authInfoTest_username_RefreshToken';
            const refreshTokenConfig = {
                refreshToken: testMetadata.refreshToken,
                loginUrl: testMetadata.loginUrl,
                username
            };
            const refreshTokenConfigClone = cloneJson(refreshTokenConfig);
            const authResponse = {
                access_token: testMetadata.accessToken,
                instance_url: testMetadata.instanceUrl,
                id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId'
            };

            // Stub the http request (OAuth2.refreshToken())
            _postParmsStub.returns(Promise.resolve(authResponse));

            // Create the refresh token AuthInfo instance
            const authInfo = await AuthInfo.create({ oauth2Options: refreshTokenConfig });

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
            expect(crypto.decrypt(authInfo['fields'].accessToken)).equals(authResponse.access_token);
            expect(crypto.decrypt(authInfo['fields'].refreshToken)).equals(refreshTokenConfig.refreshToken);

            // Verify expected methods are called with expected args
            expect(authInfoInit.called).to.be.true;
            expect(authInfoInit.firstCall.args[0]).to.equal(refreshTokenConfig);
            expect(authInfoUpdate.called).to.be.true;
            expect(authInfoBuildRefreshTokenConfig.called).to.be.true;
            expect(authInfoBuildRefreshTokenConfig.firstCall.args[0]).to.include(refreshTokenConfig);
            expect(AuthInfoConfig.getOptions(username).filename).to.equal(`${username}.json`);

            // Verify the refreshTokenConfig object was not mutated by init() or buildRefreshTokenConfig()
            expect(refreshTokenConfig).to.deep.equal(refreshTokenConfigClone);

            const expectedAuthConfig = {
                accessToken: authResponse.access_token,
                instanceUrl: testMetadata.instanceUrl,
                orgId: authResponse.id.split('/')[0],
                loginUrl: refreshTokenConfig.loginUrl,
                refreshToken: refreshTokenConfig.refreshToken,
                clientId: testMetadata.defaultConnectedAppInfo.clientId,
                clientSecret: testMetadata.defaultConnectedAppInfo.clientSecret
            };
            expect(authInfoUpdate.firstCall.args[0]).to.deep.equal(expectedAuthConfig);
        });

        it('should return a refresh token AuthInfo instance with custom clientId and clientSecret', async () => {
            const username = 'authInfoTest_username_RefreshToken_Custom';
            const refreshTokenConfig = {
                clientId: 'authInfoTest_clientId',
                clientSecret: 'authInfoTest_clientSecret',
                refreshToken: testMetadata.refreshToken,
                loginUrl: testMetadata.loginUrl
            };
            const authResponse = {
                access_token: testMetadata.accessToken,
                instance_url: testMetadata.instanceUrl,
                id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId'
            };

            // Stub the http request (OAuth2.refreshToken())
            _postParmsStub.returns(Promise.resolve(authResponse));

            // Create the refresh token AuthInfo instance
            const authInfo = await AuthInfo.create({ username, oauth2Options: refreshTokenConfig });

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
            expect(crypto.decrypt(authInfo['fields'].accessToken)).equals(authResponse.access_token);
            expect(crypto.decrypt(authInfo['fields'].refreshToken)).equals(refreshTokenConfig.refreshToken);
            expect(crypto.decrypt(authInfo['fields'].clientSecret)).equals(refreshTokenConfig.clientSecret);

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
                clientSecret: refreshTokenConfig.clientSecret
            };
            expect(authInfoUpdate.firstCall.args[0]).to.deep.equal(expectedAuthConfig);
        });

        it('should throw a RefreshTokenAuthError when auth fails via a refresh token', async () => {
            const username = 'authInfoTest_username_RefreshToken_ERROR';
            const refreshTokenConfig = {
                clientId: 'authInfoTest_clientId',
                clientSecret: 'authInfoTest_clientSecret',
                refreshToken: testMetadata.refreshToken,
                loginUrl: testMetadata.loginUrl
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
                loginUrl: testMetadata.loginUrl
            };
            const authCodeConfigClone = cloneJson(authCodeConfig);
            const authResponse = {
                access_token: testMetadata.accessToken,
                instance_url: testMetadata.instanceUrl,
                id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
                refresh_token: testMetadata.refreshToken
            };

            // Stub the http requests (OAuth2.requestToken() and the request for the username)
            _postParmsStub.returns(Promise.resolve(authResponse));
            const responseBody = { body: JSON.stringify({ Username: username }) };
            stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').returns(Promise.resolve(responseBody));

            // Create the refresh token AuthInfo instance
            const authInfo = await AuthInfo.create({ oauth2Options: authCodeConfig });

            // Verify the returned AuthInfo instance
            const authInfoConnOpts = authInfo.getConnectionOptions();
            expect(authInfoConnOpts).to.have.property('accessToken', authResponse.access_token);
            expect(authInfoConnOpts).to.have.property('instanceUrl', authResponse.instance_url);
            expect(authInfoConnOpts).to.not.have.property('refreshToken');
            expect(authInfoConnOpts['oauth2']).to.have.property('loginUrl', testMetadata.instanceUrl); // why is this instanceUrl?
            expect(authInfoConnOpts['oauth2']).to.have.property('clientId', testMetadata.defaultConnectedAppInfo.clientId);
            expect(authInfoConnOpts['oauth2']).to.have.property('redirectUri', testMetadata.redirectUri);
            expect(authInfo.getUsername()).to.equal(username);
            expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
            expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be true').to.be.true;
            expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
            expect(authInfo.isOauth(), 'authInfo.isOauth() should be true').to.be.true;

            // Verify authInfo.fields are encrypted
            const crypto = await Crypto.create();
            expect(crypto.decrypt(authInfo['fields'].accessToken)).equals(authResponse.access_token);
            expect(crypto.decrypt(authInfo['fields'].refreshToken)).equals(authResponse.refresh_token);

            // Verify expected methods are called with expected args
            expect(authInfoInit.called).to.be.true;
            expect(authInfoInit.firstCall.args[0]).to.equal(authCodeConfig);
            expect(authInfoUpdate.called).to.be.true;
            expect(authInfoBuildWebAuthConfig.called).to.be.true;
            expect(authInfoBuildWebAuthConfig.firstCall.args[0]).to.include(authCodeConfig);
            expect(AuthInfoConfig.getOptions(username).filename).to.equal(`${username}.json`);

            // Verify the authCodeConfig object was not mutated by init() or buildWebAuthConfig()
            expect(authCodeConfig).to.deep.equal(authCodeConfigClone);

            const expectedAuthConfig = {
                accessToken: authResponse.access_token,
                instanceUrl: testMetadata.instanceUrl,
                username,
                orgId: authResponse.id.split('/')[0],
                loginUrl: authCodeConfig.loginUrl,
                refreshToken: authResponse.refresh_token
            };
            expect(authInfoUpdate.firstCall.args[0]).to.deep.equal(expectedAuthConfig);
        });

        it('should throw a AuthCodeExchangeError when auth fails via an auth code', async () => {
            const authCodeConfig = {
                authCode: testMetadata.authCode,
                loginUrl: testMetadata.loginUrl
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

        it('should throw a AuthCodeUsernameRetrievalError when username retrieval fails after auth code exchange', async () => {
            const authCodeConfig = {
                authCode: testMetadata.authCode,
                loginUrl: testMetadata.loginUrl
            };
            const authResponse = {
                access_token: testMetadata.accessToken,
                instance_url: testMetadata.instanceUrl,
                id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
                refresh_token: testMetadata.refreshToken
            };

            // Stub the http request (OAuth2.requestToken())
            _postParmsStub.returns(Promise.resolve(authResponse));
            stubMethod($$.SANDBOX, Transport.prototype, 'httpRequest').throws(new Error('authInfoTest_ERROR_MSG'));

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
        it('should update the AuthInfo fields, cache, and write to file', async () => {
            const username = 'authInfoTest_username_SaveTest1';
            const refreshTokenConfig = {
                refreshToken: testMetadata.refreshToken,
                loginUrl: testMetadata.loginUrl
            };
            const authResponse = {
                access_token: testMetadata.accessToken,
                instance_url: testMetadata.instanceUrl,
                id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId'
            };

            // Stub the http request (OAuth2.refreshToken())
            _postParmsStub.returns(Promise.resolve(authResponse));

            const cacheSetSpy: sinon.SinonSpy = spyMethod($$.SANDBOX, AuthInfo['cache'], 'set');

            // Create the AuthInfo instance
            const authInfo = await AuthInfo.create({ username, oauth2Options: refreshTokenConfig });

            expect(authInfo.getUsername()).to.equal(username);

            // reset the AuthInfo.update stub so we only look at what happens with AuthInfo.save().
            authInfoUpdate.resetHistory();

            // Save new fields
            const changedData = { accessToken: testMetadata.accessToken };
            await authInfo.save(changedData);

            expect(authInfoUpdate.called).to.be.true;
            expect(authInfoUpdate.firstCall.args[0]).to.deep.equal(changedData);
            expect(cacheSetSpy.called).to.be.true;
            expect(configFileWrite.called).to.be.true;
            expect(configFileWrite.firstCall.thisValue.options.filename).to.equal(`${username}.json`);

            const crypto = await Crypto.create();
            const decryptedActualFields = configFileWrite.firstCall.thisValue.toObject();
            decryptedActualFields.accessToken = crypto.decrypt(decryptedActualFields.accessToken);
            decryptedActualFields.refreshToken = crypto.decrypt(decryptedActualFields.refreshToken);
            const expectedFields = {
                accessToken: changedData.accessToken,
                instanceUrl: testMetadata.instanceUrl,
                username,
                orgId: authResponse.id.split('/')[0],
                loginUrl: refreshTokenConfig.loginUrl,
                refreshToken: refreshTokenConfig.refreshToken
            };
            // Note that this also verifies the clientId and clientSecret are not persisted,
            // and that data is encrypted when saved (because we have to decrypt it to verify here).
            expect(decryptedActualFields).to.deep.equal(expectedFields);
        });
    });

    describe('update()', () => {
        let encryptStub: sinon.SinonStub;
        let crypto: Crypto;
        beforeEach(async () => {
            crypto = await Crypto.create();
            encryptStub = $$.SANDBOX.stub().callsFake((fields: AuthFields) => {
                fields.password = crypto.encrypt(fields.password);
                fields.clientSecret = crypto.encrypt(fields.clientSecret);
                fields.accessToken = crypto.encrypt(fields.accessToken);
                return fields;
            });
        });

        it('should encrypt the data before assigning to this.fields', async () => {
            const context: any = { // tslint:disable-line:no-any
                getUsername: () => context.fields.username,
                fields: {
                    accessToken: crypto.encrypt(testMetadata.accessToken),
                    instanceUrl: testMetadata.instanceUrl,
                    username: 'authInfoTest_updateTest',
                    orgId: '00DAuthInfoTest_orgId',
                    loginUrl: testMetadata.loginUrl,
                    refreshToken: crypto.encrypt(testMetadata.refreshToken)
                },
                authInfoCrypto: {
                    encryptFields: encryptStub
                },
                logger: $$.TEST_LOGGER
            };
            const updatedFields = {
                password: 'authInfoTest_password',
                clientSecret: 'authInfoTest_updateTest_clientSecret',
                accessToken: 'authInfoTest_updateTest_ACCESS_TOKEN'
            };
            await AuthInfo.prototype.update.call(context, updatedFields);
            expect(crypto.decrypt(context.fields.accessToken)).to.equal(updatedFields.accessToken);
            expect(crypto.decrypt(context.fields.password)).to.equal(updatedFields.password);
            expect(crypto.decrypt(context.fields.clientSecret)).to.equal(updatedFields.clientSecret);
            expect(crypto.decrypt(context.fields.refreshToken)).to.equal(testMetadata.refreshToken);
            expect(context.fields.loginUrl).to.equal(testMetadata.loginUrl);
        });

        it('should NOT encrypt the data when encrypt arg is false', async () => {
            const context: any = { // tslint:disable-line:no-any
                getUsername: () => context.fields.username,
                fields: {
                    accessToken: testMetadata.accessToken,
                    instanceUrl: testMetadata.instanceUrl,
                    username: 'authInfoTest_updateTest',
                    orgId: '00DAuthInfoTest_orgId',
                    loginUrl: testMetadata.loginUrl,
                    refreshToken: testMetadata.refreshToken
                },
                logger: $$.TEST_LOGGER
            };
            const updatedFields = {
                password: 'authInfoTest_password',
                clientSecret: 'authInfoTest_updateTest_clientSecret',
                accessToken: 'authInfoTest_updateTest_ACCESS_TOKEN'
            };
            await AuthInfo.prototype.update.call(context, updatedFields, false);
            expect(context.fields).to.deep.equal(Object.assign(context.fields, updatedFields));
        });
    });

    describe('refreshFn()', () => {
        let crypto: Crypto;
        let decryptStub: sinon.SinonStub;

        beforeEach(async () => {
            crypto = await Crypto.create();
            decryptStub = $$.SANDBOX.stub().callsFake((fields: AuthFields) => {
                fields.accessToken = crypto.decrypt(fields.accessToken);
                return fields;
            });
        });

        it('should call init() and save()', async () => {
            const context = {
                getUsername: () => '',
                fields: {
                    loginUrl: testMetadata.loginUrl,
                    clientId: testMetadata.clientId,
                    privateKey: 'authInfoTest/jwt/server.key',
                    accessToken: testMetadata.encryptedAccessToken
                },
                authInfoCrypto: { decryptFields: decryptStub },
                initAuthOptions: $$.SANDBOX.stub(),
                save: $$.SANDBOX.stub(),
                logger: $$.TEST_LOGGER
            };
            const testCallback = $$.SANDBOX.stub();
            testCallback.returns(Promise.resolve());

            context.initAuthOptions.returns(Promise.resolve());
            context.save.returns(Promise.resolve());

            await AuthInfo.prototype['refreshFn'].call(context, null, testCallback);

            expect(context.initAuthOptions.called, 'Should have called AuthInfo.initAuthOptions() during refreshFn()').to.be.true;
            const expectedInitArgs = {
                loginUrl: context.fields.loginUrl,
                clientId: context.fields.clientId,
                privateKey: context.fields.privateKey,
                accessToken: testMetadata.accessToken
            };
            expect(context.initAuthOptions.firstCall.args[0]).to.deep.equal(expectedInitArgs);
            expect(context.save.called, 'Should have called AuthInfo.save() during refreshFn()').to.be.true;
            expect(testCallback.called, 'Should have called the callback passed to refreshFn()').to.be.true;
            expect(testCallback.firstCall.args[1]).to.equal(testMetadata.accessToken);
        });

        it('should call the callback with OrgDataNotAvailableError when AuthInfo.init() fails', async () => {
            const context = {
                getUsername: () => '',
                fields: {
                    loginUrl: testMetadata.loginUrl,
                    clientId: testMetadata.clientId,
                    privateKey: 'authInfoTest/jwt/server.key',
                    accessToken: testMetadata.encryptedAccessToken
                },
                authInfoCrypto: { decryptFields: decryptStub },
                initAuthOptions: $$.SANDBOX.stub(),
                save: $$.SANDBOX.stub(),
                logger: $$.TEST_LOGGER
            };
            const testCallback = $$.SANDBOX.spy();
            context.initAuthOptions.throws(new Error('Error: Data Not Available'));
            context.save.returns(Promise.resolve());

            await AuthInfo.prototype['refreshFn'].call(context, null, testCallback);
            expect(testCallback.called).to.be.true;
            const sfdxError = testCallback.firstCall.args[0];
            expect(sfdxError.name).to.equal('OrgDataNotAvailableError');
        });
    });

    describe('getAuthorizationUrl()', () => {
        it('should return the correct url', () => {
            const options = {
                clientId: testMetadata.clientId,
                redirectUri: testMetadata.redirectUri,
                loginUrl: testMetadata.loginUrl
            };
            const url: string = AuthInfo.getAuthorizationUrl.call(null, options);

            expect(url.startsWith(options.loginUrl), 'authorization URL should start with the loginUrl').to.be.true;
            expect(url).to.contain('state=');
            expect(url).to.contain('prompt=login');
            expect(url).to.contain('scope=refresh_token%20api%20web');
        });
    });

    describe('getSfdxAuthUrl()', () => {
        it('should return the correct sfdx auth url', async () => {
            const username = 'authInfoTest_username_RefreshToken';
            const refreshTokenConfig = {
                refreshToken: testMetadata.refreshToken,
                loginUrl: testMetadata.loginUrl
            };
            const authResponse = {
                access_token: testMetadata.accessToken,
                instance_url: testMetadata.instanceUrl,
                id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId'
            };

            // Stub the http request (OAuth2.refreshToken())
            _postParmsStub.returns(Promise.resolve(authResponse));

            // Create the refresh token AuthInfo instance
            const authInfo = await AuthInfo.create({ username, oauth2Options: refreshTokenConfig });

            expect(authInfo.getSfdxAuthUrl()).to.contain(`force://SalesforceDevelopmentExperience:1384510088588713504:${testMetadata.refreshToken}@mydevhub.localhost.internal.salesforce.com:6109`);
        });
    });

    describe('audienceUrl', () => {
        const sfdxAudienceUrlSetting = process.env.SFDX_AUDIENCE_URL;

        afterEach(() => {
            process.env.SFDX_AUDIENCE_URL = sfdxAudienceUrlSetting || '';
        });

        async function runTest(options: JsonMap, expectedUrl: string) {
            const context = {
                getUsername: () => testMetadata.jwtUsername,
                logger: $$.TEST_LOGGER
            };
            const defaults = {
                clientId: testMetadata.clientId,
                loginUrl: testMetadata.loginUrl,
                privateKey: 'fake/pk'
            };

            const authResponse = {
                access_token: testMetadata.accessToken,
                instance_url: testMetadata.instanceUrl,
                id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId'
            };

            // Stub file I/O, http requests, and the DNS lookup
            readFileStub.returns(Promise.resolve('audienceUrlTest_privateKey'));
            _postParmsStub.returns(Promise.resolve(authResponse));
            const signStub: sinon.SinonStub =
                stubMethod($$.SANDBOX, jwt, 'sign').returns(Promise.resolve('audienceUrlTest_jwtToken'));
            stubMethod($$.SANDBOX, dns, 'lookup').callsFake((url: string,  done: (v: AnyJson, w: JsonMap) => {}) =>
                done(null, { address: '1.1.1.1', family: 4 }));

            await AuthInfo.prototype['buildJwtConfig'].call(context, Object.assign(defaults, options));

            expect(signStub.firstCall.args[0]).to.have.property('aud', expectedUrl);
        }

        it('should use the correct audience URL for SFDX_AUDIENCE_URL env var', async () => {
            process.env.SFDX_AUDIENCE_URL = 'http://authInfoTest/audienceUrl/test';
            await runTest({}, process.env.SFDX_AUDIENCE_URL);
        });

        it('should use the correct audience URL for a sandbox', async () => {
            await runTest({ loginUrl: 'http://test.salesforce.com/foo/bar' }, 'https://test.salesforce.com');
        });

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

        it('should use the correct audience URL for an internal URL (.mobile1)', async () => {
            const mobile1Url = 'http://mobile1.t.salesforce.com';
            await runTest({ loginUrl: mobile1Url }, mobile1Url);
        });

        it('should use the correct audience URL for createdOrgInstance beginning with "cs"', async () => {
            await runTest({ createdOrgInstance: 'cs17' }, 'https://test.salesforce.com');
        });

        it('should use the correct audience URL for createdOrgInstance beginning with "gs1"', async () => {
            await runTest({ createdOrgInstance: 'gs1' }, 'https://gs1.salesforce.com');
        });
    });

    describe('hasAuthentications', () => {
        it('should return false', async () => {
            stubMethod($$.SANDBOX, AuthInfo, 'listAllAuthFiles').callsFake(async (): Promise<string[]> => {
                return Promise.resolve([]);
            });

            const result: boolean = await AuthInfo.hasAuthentications();
            expect(result).to.be.false;
        });

        it('should return true', async () => {

            stubMethod($$.SANDBOX, AuthInfo, 'listAllAuthFiles').callsFake(async (): Promise<string[]> => {
                return Promise.resolve(['file1']);
            });

            const result: boolean = await AuthInfo.hasAuthentications();
            expect(result).to.be.equal(true);
        });
    });

    describe('listAllAuthFiles', () => {
        let files: string[];
        beforeEach(() => {
            stubMethod($$.SANDBOX, fs, 'readdir').callsFake(() => Promise.resolve(files));
        });
        it('matches username', async () => {
            files = ['good@match.org.json'];
            const orgs = await AuthInfo.listAllAuthFiles();
            expect(orgs[0]).equals(files[0]);
        });
        it('matches username with single char', async () => {
            files = ['a@match.org.json'];
            const orgs = await AuthInfo.listAllAuthFiles();
            expect(orgs[0]).equals(files[0]);
        });
        it('matches username with periods', async () => {
            files = ['super.good@match.org.json'];
            const orgs = await AuthInfo.listAllAuthFiles();
            expect(orgs[0]).equals(files[0]);
        });
        it('matches username with subdomain', async () => {
            files = ['good@sub.match.org.json'];
            const orgs = await AuthInfo.listAllAuthFiles();
            expect(orgs[0]).equals(files[0]);
        });
        it('does not match hidden usernames', async () => {
            files = ['.no@match.org.json'];
            try {
                await AuthInfo.listAllAuthFiles();
                assert.fail();
            } catch (e) {
                expect(e).to.have.property('name', 'NoAuthInfoFound');
            }
        });
    });
});
