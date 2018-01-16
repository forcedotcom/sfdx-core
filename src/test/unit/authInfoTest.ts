/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import * as dns from 'dns';
import * as sinon from 'sinon';
import { assert, expect } from 'chai';

import { AuthInfo } from '../../lib/authInfo';
import { Logger } from '../../lib/logger';
import Messages from '../../lib/messages';
import Global from '../../lib/global';
import { SfdxUtil } from '../../lib/util';
import { OAuth2 } from 'jsforce';
import * as Transport from 'jsforce/lib/transport';
import * as jwt from 'jsonwebtoken';

Messages.importMessageFile(path.join(__dirname, '..', '..', '..', 'messages', 'sfdx-core.json'));

describe('AuthInfo', () => {

    const sandbox = sinon.sandbox.create();
    const TEST_LOGGER = new Logger({ name: 'SFDX_Core_Test_Logger' }).useMemoryLogging();

    // TODO: fix this when it's no longer hard coded.
    const instanceUrl = 'http://mydevhub.localhost.internal.salesforce.com:6109';

    const ACCESS_TOKEN = 'authInfoTest_access_token';
    const REFRESH_TOKEN = 'authInfoTest_refresh_token';
    const CLIENT_ID = 'authInfoTest_client_id';
    const LOGIN_URL = 'authInfoTest_login_url';
    const JWT_USERNAME = 'authInfoTest_username_JWT';
    const REDIRECT_URI = 'http://localhost:1717/OauthRedirect';
    const AUTH_CODE = 'authInfoTest_authCode';
    const DEFAULT_CONNECTED_APP_INFO = {
        clientId: 'SalesforceDevelopmentExperience',
        clientSecret: '1384510088588713504'
    };

    let readFileStub;
    let _postParmsStub;

    beforeEach(() => {
        // Common stubs
        sandbox.stub(Logger, 'child').returns(Promise.resolve(TEST_LOGGER));
        sandbox.stub(Global, 'saveConfigInfo').returns(Promise.resolve());

        // These stubs return different objects based on the tests
        _postParmsStub = sandbox.stub(OAuth2.prototype, '_postParams');
        readFileStub = sandbox.stub(SfdxUtil, 'readFile');

        // Spies
        sandbox.spy(AuthInfo.prototype, 'init');
        sandbox.spy(AuthInfo.prototype, 'update');
        sandbox.spy(AuthInfo.prototype, 'buildJwtConfig');
        sandbox.spy(AuthInfo.prototype, 'buildRefreshTokenConfig');
        sandbox.spy(AuthInfo.prototype, 'buildWebAuthConfig');
        sandbox.spy(Global, 'fetchConfigInfo');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('create()', () => {
        it('should return an AuthInfo instance when passed an access token as username', async () => {
            const username = '00Dxx0000000001!AQEAQI3AIbublfW11ATFJl9T122vVPj5QaInBp6h9nPsUK8oW4rW5Os0ZjtsUU.DG9rXytUCh3RZvc_XYoRULiHeTMjyi6T1';
            const authInfo = await AuthInfo.create(username);

            const expectedFields = { accessToken: username, instanceUrl };
            expect(authInfo.toJSON()).to.deep.equal(expectedFields);
            expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be true').to.be.true;
            expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be false').to.be.false;
            expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
            expect(authInfo.isOauth(), 'authInfo.isOauth() should be false').to.be.false;
        });

        //
        // JWT Tests
        //

        it('should return a JWT AuthInfo instance when passed a username and JWT auth options', async () => {
            const jwtConfig = {
                clientId: `${CLIENT_ID}_JWT`,
                loginUrl: `${LOGIN_URL}_JWT`,
                privateKeyFile: 'authInfoTest/jwt/server.key'
            };
            const authResponse = {
                access_token: `${ACCESS_TOKEN}_JWT`,
                instance_url: instanceUrl,
                id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId'
            };

            // Stub file I/O, http requests, and the DNS lookup
            readFileStub.returns(Promise.resolve('authInfoTest_private_key'));
            _postParmsStub.returns(Promise.resolve(authResponse));
            sandbox.stub(jwt, 'sign').returns(Promise.resolve('authInfoTest_jwtToken'));
            sandbox.stub(dns, 'lookup').returns(Promise.resolve());

            // Create the JWT AuthInfo instance
            const authInfo = await AuthInfo.create(JWT_USERNAME, jwtConfig);

            // Verify the returned AuthInfo instance
            const authInfoJSON = authInfo.toJSON();
            expect(authInfoJSON).to.have.property('accessToken', authResponse.access_token);
            expect(authInfoJSON).to.have.property('instanceUrl', authResponse.instance_url);
            expect(authInfoJSON).to.have.property('refreshFn').and.is.a('function');
            expect(authInfo.username).to.equal(JWT_USERNAME);
            expect(authInfo.authFileName).to.equal(`${JWT_USERNAME}.json`);
            expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
            expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be false').to.be.false;
            expect(authInfo.isJwt(), 'authInfo.isJwt() should be true').to.be.true;
            expect(authInfo.isOauth(), 'authInfo.isOauth() should be false').to.be.false;

            // Verify expected methods are called with expected args
            expect(AuthInfo.prototype.init['called']).to.be.true;
            expect(AuthInfo.prototype.init['firstCall'].args[0]).to.equal(jwtConfig);
            expect(AuthInfo.prototype.update['called']).to.be.true;
            expect(AuthInfo.prototype['buildJwtConfig']['called']).to.be.true;
            expect(AuthInfo.prototype['buildJwtConfig']['firstCall'].args[0]).to.equal(jwtConfig);
            expect(SfdxUtil.readFile['called']).to.be.true;

            const expectedAuthConfig = {
                accessToken: authResponse.access_token,
                instanceUrl,
                orgId: authResponse.id.split('/')[0],
                loginUrl: jwtConfig.loginUrl,
                privateKey: jwtConfig.privateKeyFile
            };
            expect(AuthInfo.prototype.update['firstCall'].args[0]).to.deep.equal(expectedAuthConfig);
        });

        it('should return a cached JWT AuthInfo instance when passed a username', async () => {
            // Create the JWT AuthInfo instance
            const authInfo = await AuthInfo.create(JWT_USERNAME);

            // Verify the returned AuthInfo instance
            const authInfoJSON = authInfo.toJSON();
            expect(authInfoJSON).to.have.property('accessToken', `${ACCESS_TOKEN}_JWT`);
            expect(authInfoJSON).to.have.property('instanceUrl', instanceUrl);
            expect(authInfoJSON).to.have.property('refreshFn').and.is.a('function');
            expect(authInfo.username).to.equal(JWT_USERNAME);
            expect(authInfo.authFileName).to.equal(`${JWT_USERNAME}.json`);
            expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
            expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be false').to.be.false;
            expect(authInfo.isJwt(), 'authInfo.isJwt() should be true').to.be.true;
            expect(authInfo.isOauth(), 'authInfo.isOauth() should be false').to.be.false;

            // Verify correct method calls
            expect(AuthInfo.prototype.init['called']).to.be.true;
            expect(AuthInfo.prototype.init['firstCall'].args[0], 'should NOT have passed any args to AuthInfo.init()').to.be.undefined;
            expect(AuthInfo.prototype.update['called']).to.be.true;
            expect(AuthInfo.prototype['buildJwtConfig']['called'], 'should NOT have called AuthInfo.buildJwtConfig() - should get from cache').to.be.false;
            expect(Global.fetchConfigInfo['called'], 'should NOT have called Global.fetchConfigInfo() for auth info').to.be.false;
        });

        it('should return a JWT AuthInfo instance when passed a username from an auth file', async () => {
            const username = 'authInfoTest_username_jwt-NOT-CACHED';

            // Make the file read stub return JWT auth data
            const jwtData = {
                accessToken: `${ACCESS_TOKEN}_JWT`,
                clientId: `${CLIENT_ID}_JWT`,
                loginUrl: `${LOGIN_URL}_JWT`,
                instanceUrl,
                privateKey: 'authInfoTest/jwt/server.key'
            };
            readFileStub.returns(Promise.resolve(JSON.stringify(jwtData)));

            // Create the JWT AuthInfo instance
            const authInfo = await AuthInfo.create(username);

            // Verify the returned AuthInfo instance
            const authInfoJSON = authInfo.toJSON();
            expect(authInfoJSON).to.have.property('accessToken', jwtData.accessToken);
            expect(authInfoJSON).to.have.property('instanceUrl', instanceUrl);
            expect(authInfoJSON).to.have.property('refreshFn').and.is.a('function');
            expect(authInfo.username).to.equal(username);
            expect(authInfo.authFileName).to.equal(`${username}.json`);
            expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
            expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be false').to.be.false;
            expect(authInfo.isJwt(), 'authInfo.isJwt() should be true').to.be.true;
            expect(authInfo.isOauth(), 'authInfo.isOauth() should be false').to.be.false;

            // Verify correct method calls
            expect(AuthInfo.prototype.init['called']).to.be.true;
            expect(AuthInfo.prototype.init['firstCall'].args[0], 'should NOT have passed any args to AuthInfo.init()').to.be.undefined;
            expect(AuthInfo.prototype.update['called']).to.be.true;
            expect(AuthInfo.prototype['buildJwtConfig']['called'], 'should NOT have called AuthInfo.buildJwtConfig() - should get from cache').to.be.false;
            expect(Global.fetchConfigInfo['called'], 'should have called Global.fetchConfigInfo() for auth info').to.be.true;
        });

        it('should throw a JWTAuthError when auth fails via a OAuth2.jwtAuthorize()', async () => {
            const username = 'authInfoTest_username_jwt_ERROR1';
            const jwtConfig = {
                clientId: `${CLIENT_ID}_JWT`,
                loginUrl: `${LOGIN_URL}_JWT`,
                privateKeyFile: 'authInfoTest/jwt/server.key'
            };

            // Stub file I/O, http requests, and the DNS lookup
            readFileStub.returns(Promise.resolve('authInfoTest_private_key'));
            _postParmsStub.throws(new Error('authInfoTest_ERROR_MSG'));
            sandbox.stub(jwt, 'sign').returns(Promise.resolve('authInfoTest_jwtToken'));
            sandbox.stub(dns, 'lookup').returns(Promise.resolve());

            // Create the JWT AuthInfo instance
            try {
                await AuthInfo.create(username, jwtConfig);
                assert.fail('should have thrown an error within AuthInfo.buildJwtConfig()');
            } catch (err) {
                expect(err.name).to.equal('JWTAuthError');
            }
        });

        //
        // Refresh token tests
        //

        it('should return a refresh token AuthInfo instance when passed a username and refresh token auth options', async () => {
            const username = 'authInfoTest_username_RefreshToken';
            const refreshTokenConfig = {
                refreshToken: `${REFRESH_TOKEN}_RefreshToken`,
                loginUrl: `${LOGIN_URL}_RefreshToken`
            };
            const authResponse = {
                access_token: `${ACCESS_TOKEN}_RefreshToken`,
                instance_url: instanceUrl,
                id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId'
            };

            // Stub the http request (OAuth2.refreshToken())
            _postParmsStub.returns(Promise.resolve(authResponse));

            // Create the refresh token AuthInfo instance
            const authInfo = await AuthInfo.create(username, refreshTokenConfig);

            // Verify the returned AuthInfo instance
            const authInfoJSON = authInfo.toJSON();
            expect(authInfoJSON).to.have.property('accessToken', authResponse.access_token);
            expect(authInfoJSON).to.have.property('instanceUrl', authResponse.instance_url);
            expect(authInfoJSON).to.have.property('refreshToken', refreshTokenConfig.refreshToken);
            expect(authInfoJSON['oauth2']).to.have.property('loginUrl', instanceUrl);
            expect(authInfoJSON['oauth2']).to.have.property('clientId', DEFAULT_CONNECTED_APP_INFO.clientId);
            expect(authInfoJSON['oauth2']).to.have.property('clientSecret', DEFAULT_CONNECTED_APP_INFO.clientSecret);
            expect(authInfoJSON['oauth2']).to.have.property('redirectUri', REDIRECT_URI);
            expect(authInfo.username).to.equal(username);
            expect(authInfo.authFileName).to.equal(`${username}.json`);
            expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
            expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be true').to.be.true;
            expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
            expect(authInfo.isOauth(), 'authInfo.isOauth() should be true').to.be.true;

            // Verify expected methods are called with expected args
            expect(AuthInfo.prototype.init['called']).to.be.true;
            expect(AuthInfo.prototype.init['firstCall'].args[0]).to.equal(refreshTokenConfig);
            expect(AuthInfo.prototype.update['called']).to.be.true;
            expect(AuthInfo.prototype['buildRefreshTokenConfig']['called']).to.be.true;
            expect(AuthInfo.prototype['buildRefreshTokenConfig']['firstCall'].args[0]).to.equal(refreshTokenConfig);

            const expectedAuthConfig = {
                accessToken: authResponse.access_token,
                instanceUrl,
                orgId: authResponse.id.split('/')[0],
                loginUrl: refreshTokenConfig.loginUrl,
                refreshToken: refreshTokenConfig.refreshToken,
                clientId: DEFAULT_CONNECTED_APP_INFO.clientId,
                clientSecret: DEFAULT_CONNECTED_APP_INFO.clientSecret
            };
            expect(AuthInfo.prototype.update['firstCall'].args[0]).to.deep.equal(expectedAuthConfig);
        });

        it('should return a refresh token AuthInfo instance with custom clientId and clientSecret', async () => {
            const username = 'authInfoTest_username_RefreshToken_Custom';
            const refreshTokenConfig = {
                clientId: 'authInfoTest_clientId',
                clientSecret: 'authInfoTest_clientSecret',
                refreshToken: `${REFRESH_TOKEN}_RefreshToken`,
                loginUrl: `${LOGIN_URL}_RefreshToken`
            };
            const authResponse = {
                access_token: `${ACCESS_TOKEN}_RefreshToken`,
                instance_url: instanceUrl,
                id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId'
            };

            // Stub the http request (OAuth2.refreshToken())
            _postParmsStub.returns(Promise.resolve(authResponse));

            // Create the refresh token AuthInfo instance
            const authInfo = await AuthInfo.create(username, refreshTokenConfig);

            // Verify the returned AuthInfo instance
            const authInfoJSON = authInfo.toJSON();
            expect(authInfoJSON).to.have.property('accessToken', authResponse.access_token);
            expect(authInfoJSON).to.have.property('instanceUrl', authResponse.instance_url);
            expect(authInfoJSON).to.have.property('refreshToken', refreshTokenConfig.refreshToken);
            expect(authInfoJSON['oauth2']).to.have.property('loginUrl', instanceUrl);
            expect(authInfoJSON['oauth2']).to.have.property('clientId', refreshTokenConfig.clientId);
            expect(authInfoJSON['oauth2']).to.have.property('clientSecret', refreshTokenConfig.clientSecret);
            expect(authInfoJSON['oauth2']).to.have.property('redirectUri', REDIRECT_URI);
            expect(authInfo.username).to.equal(username);
            expect(authInfo.authFileName).to.equal(`${username}.json`);
            expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
            expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be true').to.be.true;
            expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
            expect(authInfo.isOauth(), 'authInfo.isOauth() should be true').to.be.true;

            // Verify expected methods are called with expected args
            expect(AuthInfo.prototype.init['called']).to.be.true;
            expect(AuthInfo.prototype.init['firstCall'].args[0]).to.equal(refreshTokenConfig);
            expect(AuthInfo.prototype.update['called']).to.be.true;
            expect(AuthInfo.prototype['buildRefreshTokenConfig']['called']).to.be.true;
            expect(AuthInfo.prototype['buildRefreshTokenConfig']['firstCall'].args[0]).to.equal(refreshTokenConfig);

            const expectedAuthConfig = {
                accessToken: authResponse.access_token,
                instanceUrl,
                orgId: authResponse.id.split('/')[0],
                loginUrl: refreshTokenConfig.loginUrl,
                refreshToken: refreshTokenConfig.refreshToken,
                clientId: refreshTokenConfig.clientId,
                clientSecret: refreshTokenConfig.clientSecret
            };
            expect(AuthInfo.prototype.update['firstCall'].args[0]).to.deep.equal(expectedAuthConfig);
        });

        it('should throw a RefreshTokenAuthError when auth fails via a refresh token', async () => {
            const username = 'authInfoTest_username_RefreshToken_ERROR';
            const refreshTokenConfig = {
                clientId: 'authInfoTest_clientId',
                clientSecret: 'authInfoTest_clientSecret',
                refreshToken: `${REFRESH_TOKEN}_RefreshToken`,
                loginUrl: `${LOGIN_URL}_RefreshToken`
            };

            // Stub the http request (OAuth2.refreshToken())
            _postParmsStub.throws(new Error('authInfoTest_ERROR_MSG'));

            // Create the refresh token AuthInfo instance
            try {
                await AuthInfo.create(username, refreshTokenConfig);
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
                authCode: `${AUTH_CODE}`,
                loginUrl: `${LOGIN_URL}_AuthCode`
            };
            const authResponse = {
                access_token: `${ACCESS_TOKEN}_AuthCode`,
                instance_url: instanceUrl,
                id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId',
                refresh_token: `${REFRESH_TOKEN}_AuthCode`
            };

            // Stub the http requests (OAuth2.requestToken() and the request for the username)
            _postParmsStub.returns(Promise.resolve(authResponse));
            const responseBody = { body: JSON.stringify({ Username: username }) };
            sandbox.stub(Transport.prototype, 'httpRequest').returns(Promise.resolve(responseBody));

            // Create the refresh token AuthInfo instance
            const authInfo = await AuthInfo.create(null, authCodeConfig);

            // Verify the returned AuthInfo instance
            const authInfoJSON = authInfo.toJSON();
            expect(authInfoJSON).to.have.property('accessToken', authResponse.access_token);
            expect(authInfoJSON).to.have.property('instanceUrl', authResponse.instance_url);
            expect(authInfoJSON).to.have.property('refreshToken', authResponse.refresh_token);
            expect(authInfoJSON['oauth2']).to.have.property('loginUrl', instanceUrl);
            expect(authInfoJSON['oauth2']).to.have.property('clientId', DEFAULT_CONNECTED_APP_INFO.clientId);
            expect(authInfoJSON['oauth2']).to.have.property('clientSecret', DEFAULT_CONNECTED_APP_INFO.clientSecret);
            expect(authInfoJSON['oauth2']).to.have.property('redirectUri', REDIRECT_URI);
            expect(authInfo.username).to.equal(username);
            expect(authInfo.authFileName).to.equal(`${username}.json`);
            expect(authInfo.isAccessTokenFlow(), 'authInfo.isAccessTokenFlow() should be false').to.be.false;
            expect(authInfo.isRefreshTokenFlow(), 'authInfo.isRefreshTokenFlow() should be true').to.be.true;
            expect(authInfo.isJwt(), 'authInfo.isJwt() should be false').to.be.false;
            expect(authInfo.isOauth(), 'authInfo.isOauth() should be true').to.be.true;

            // Verify expected methods are called with expected args
            expect(AuthInfo.prototype.init['called']).to.be.true;
            expect(AuthInfo.prototype.init['firstCall'].args[0]).to.equal(authCodeConfig);
            expect(AuthInfo.prototype.update['called']).to.be.true;
            expect(AuthInfo.prototype['buildWebAuthConfig']['called']).to.be.true;
            expect(AuthInfo.prototype['buildWebAuthConfig']['firstCall'].args[0]).to.equal(authCodeConfig);

            const expectedAuthConfig = {
                accessToken: authResponse.access_token,
                instanceUrl,
                username,
                orgId: authResponse.id.split('/')[0],
                loginUrl: authCodeConfig.loginUrl,
                refreshToken: authResponse.refresh_token
            };
            expect(AuthInfo.prototype.update['firstCall'].args[0]).to.deep.equal(expectedAuthConfig);
        });

        it('should throw a AuthCodeExchangeError when auth fails via an auth code', async () => {
            const authCodeConfig = {
                authCode: `${AUTH_CODE}`,
                loginUrl: `${LOGIN_URL}_AuthCode`
            };

            // Stub the http request (OAuth2.requestToken())
            _postParmsStub.throws(new Error('authInfoTest_ERROR_MSG'));

            // Create the auth code AuthInfo instance
            try {
                await AuthInfo.create(null, authCodeConfig);
                assert.fail('should have thrown an error within AuthInfo.buildWebAuthConfig()');
            } catch (err) {
                expect(err.name).to.equal('AuthCodeExchangeError');
            }
        });

        it('should throw an error when neither username nor options have been passed', async () => {
            let authInfo;
            try {
                authInfo = await AuthInfo.create();
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
                refreshToken: `${REFRESH_TOKEN}_SaveTest1`,
                loginUrl: `${LOGIN_URL}_SaveTest1`
            };
            const authResponse = {
                access_token: `${ACCESS_TOKEN}_SaveTest1`,
                instance_url: instanceUrl,
                id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId'
            };

            // Stub the http request (OAuth2.refreshToken())
            _postParmsStub.returns(Promise.resolve(authResponse));

            sandbox.spy(AuthInfo['cache'], 'set');

            // Create the AuthInfo instance
            const authInfo = await AuthInfo.create(username, refreshTokenConfig);

            expect(authInfo.username).to.equal(username);

            // reset the AuthInfo.update stub so we only look at what happens with AuthInfo.save().
            AuthInfo.prototype.update['reset']();

            // Save new fields
            const changedData = { accessToken: `${ACCESS_TOKEN}_CHANGED` };
            authInfo.save(changedData);

            expect(AuthInfo.prototype.update['called']).to.be.true;
            expect(AuthInfo.prototype.update['firstCall'].args[0]).to.deep.equal(changedData);
            expect(AuthInfo['cache'].set['called']).to.be.true;
            expect(Global.saveConfigInfo['called']).to.be.true;
            expect(Global.saveConfigInfo['firstCall'].args[0]).to.equal(`${username}.json`);

            const expectedFields = {
                accessToken: changedData.accessToken,
                instanceUrl,
                username,
                orgId: authResponse.id.split('/')[0],
                loginUrl: refreshTokenConfig.loginUrl,
                refreshToken: refreshTokenConfig.refreshToken,
                clientId: DEFAULT_CONNECTED_APP_INFO.clientId,
                clientSecret: DEFAULT_CONNECTED_APP_INFO.clientSecret
            };
            expect(Global.saveConfigInfo['firstCall'].args[1]).to.deep.equal(expectedFields);
        });

        it('should encrypt the data before saving');
    });

    describe('jwtRefresh()', () => {
        it('should call init() and save()', async () => {
            const context = {
                fields: {
                    loginUrl: LOGIN_URL,
                    clientId: CLIENT_ID,
                    privateKey: 'authInfoTest/jwt/server.key',
                    accessToken: ACCESS_TOKEN
                },
                init: sandbox.stub(),
                save: sandbox.stub(),
                logger: TEST_LOGGER
            };
            const testCallback = sandbox.stub();
            testCallback.returns(Promise.resolve());

            context.init.returns(Promise.resolve());
            context.save.returns(Promise.resolve());

            await AuthInfo.prototype.jwtRefresh.call(context, null, testCallback);

            expect(context.init.called, 'Should have called AuthInfo.init() during jwtRefresh()').to.be.true;
            const expectedInitArgs = {
                loginUrl: context.fields.loginUrl,
                clientId: context.fields.clientId,
                privateKeyFile: context.fields.privateKey
            };
            expect(context.init.firstCall.args[0]).to.deep.equal(expectedInitArgs);
            expect(context.save.called, 'Should have called AuthInfo.save() during jwtRefresh()').to.be.true;
            expect(testCallback.called, 'Should have called the callback passed to jwtRefresh()').to.be.true;
            expect(testCallback.firstCall.args[1]).to.equal(context.fields.accessToken);
        });
    });

    describe('oauthRefresh()', () => {
        it('should call save()', async () => {
            const context = {
                save: sandbox.stub(),
                logger: TEST_LOGGER
            };
            context.save.returns(Promise.resolve());
            const accessToken = `${ACCESS_TOKEN}_oauthRefreshTest`;

            await AuthInfo.prototype.oauthRefresh.call(context, accessToken);

            expect(context.save.called, 'Should have called AuthInfo.save() during oauthRefresh()').to.be.true;
            expect(context.save.firstCall.args[0]).to.deep.equal({ accessToken });
        });
    });

    describe('getAuthorizationUrl()', () => {
        it('should return the correct url', () => {
            const options = {
                clientId: CLIENT_ID,
                redirectUri: REDIRECT_URI,
                loginUrl: LOGIN_URL
            };
            const url: string = AuthInfo.prototype.getAuthorizationUrl.call(null, options);

            expect(url.startsWith(options.loginUrl), 'authorization URL should start with the loginUrl').to.be.true;
            expect(url).to.contain('state=');
            expect(url).to.contain('prompt=login');
            expect(url).to.contain('scope=refresh_token%20api%20web');
        });
    });

    describe('audienceUrl', () => {
        const sfdxAudienceUrlSetting = process.env.SFDX_AUDIENCE_URL;

        afterEach(() => {
            process.env.SFDX_AUDIENCE_URL = sfdxAudienceUrlSetting || '';
        });

        async function runTest(options, expectedUrl: string) {
            const context = {
                username: JWT_USERNAME,
                logger: TEST_LOGGER
            };
            const defaults = {
                clientId: CLIENT_ID,
                loginUrl: LOGIN_URL,
                privateKeyFile: 'fake/pk'
            };
            const _options = Object.assign(defaults, options);
            const authResponse = {
                access_token: `${ACCESS_TOKEN}_JWT`,
                instance_url: instanceUrl,
                id: '00DAuthInfoTest_orgId/005AuthInfoTest_userId'
            };

            // Stub file I/O, http requests, and the DNS lookup
            readFileStub.returns(Promise.resolve('audienceUrlTest_privateKey'));
            _postParmsStub.returns(Promise.resolve(authResponse));
            sandbox.stub(jwt, 'sign').returns(Promise.resolve('audienceUrlTest_jwtToken'));
            sandbox.stub(dns, 'lookup').returns(Promise.resolve());

            await AuthInfo.prototype['buildJwtConfig'].call(context, options);

            expect(jwt.sign['firstCall'].args[0]).to.have.property('aud', expectedUrl);
        }

        it('should use the correct audience URL for SFDX_AUDIENCE_URL env var', async () => {
            process.env.SFDX_AUDIENCE_URL = 'http://authInfoTest/audienceUrl/test';
            await runTest({}, process.env.SFDX_AUDIENCE_URL);
        });

        it('should use the correct audience URL for a sandbox', async () => {
            await runTest({ loginUrl: 'http://test.salesforce.com/foo/bar' }, 'https://test.salesforce.com');
        });

        it('should use the correct audience URL for an internal URL (.internal)', async () => {
            await runTest({ loginUrl: instanceUrl }, instanceUrl);
        });

        it('should use the correct audience URL for an internal URL (.vpod)', async () => {
            const vpodUrl = 'http://mydevhub.vpod.salesforce.com:6109';
            await runTest({ loginUrl: vpodUrl }, vpodUrl);
        });

        it('should use the correct audience URL for an internal URL (.blitz)', async () => {
            const blitzUrl = 'http://mydevhub.blitz.salesforce.com:6109';
            await runTest({ loginUrl: blitzUrl }, blitzUrl);
        });

        it('should use the correct audience URL for an internal URL (.stm)', async () => {
            const stmUrl = 'http://mydevhub.stm.salesforce.com:6109';
            await runTest({ loginUrl: stmUrl }, stmUrl);
        });

        it('should use the correct audience URL for createdOrgInstance beginning with "cs"', async () => {
            await runTest({ createdOrgInstance: 'cs17' }, 'https://test.salesforce.com');
        });

        it('should use the correct audience URL for createdOrgInstance beginning with "gs1"', async () => {
            await runTest({ createdOrgInstance: 'gs1' }, 'https://gs1.salesforce.com');
        });
    });
});
