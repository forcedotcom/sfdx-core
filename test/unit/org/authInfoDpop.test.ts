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
/* eslint-disable camelcase */
import { createHash, generateKeyPairSync } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { stubMethod } from '@salesforce/ts-sinon';
import { expect, config as chaiConfig } from 'chai';
import { OAuth2 } from '@jsforce/jsforce-node';
import { AuthInfo } from '../../../src/org/authInfo';
import * as determineOrgModule from '../../../src/org/determineOrg';
import { DpopKey } from '../../../src/crypto/dpop';
import { SfdcUrl } from '../../../src/util/sfdcUrl';
import { shouldThrow, TestContext } from '../../../src/testSetup';
import {
  DpopMockOrg,
  expectedAccessTokenHash,
  FakeResponse,
  getHeader,
  InMemorySecretStore,
  nonceChallenge,
  proofOf,
  RecordedRequest,
  sequence,
  stripQuery,
  stubDpopKeyStore,
  stubTransport,
  urlIncludes,
  UUID_PATTERN,
} from '../dpopTestHelpers';

chaiConfig.truncateThreshold = 0;

const LOGIN = 'https://login.salesforce.com';
const INSTANCE = 'https://example.my.salesforce.com';
const ORG_ID = '00Dxx0000000001EAA';
const USER_ID = '005xx0000000001AAA';
const USERNAME = 'user@example.com';
const KEY_REFERENCE = '3b12f1df-5232-4804-897e-917bf397618a';
const REDIRECT_URI = 'http://localhost:1717/OauthRedirect';

const TOKEN_OK = {
  access_token: 'web-access',
  instance_url: INSTANCE,
  refresh_token: 'web-refresh',
  id: `${LOGIN}/id/${ORG_ID}/${USER_ID}`,
};

const IDENTITY = {
  sub: `${LOGIN}/id/${ORG_ID}/${USER_ID}`,
  user_id: USER_ID,
  organization_id: ORG_ID,
  preferred_username: USERNAME,
};

const TOKEN_PATH = '/services/oauth2/token';
const USERINFO_PATH = '/services/oauth2/userinfo';
const USER_SOBJECT_PATH = `/sobjects/User/${USER_ID}`;
const DEVHUB_QUERY = 'FROM%20ScratchOrgInfo';

const ok = (body: unknown, headers?: Record<string, string>): FakeResponse => ({ statusCode: 200, body, headers });

const identityRoutes = [
  urlIncludes(USERINFO_PATH, () => ok(IDENTITY)),
  urlIncludes(USER_SOBJECT_PATH, () => ok({ Username: USERNAME })),
];

const isTo = (path: string) => (request: RecordedRequest) => request.url.includes(path);

const expectResourceProof = (request: RecordedRequest, accessToken: string, nonce?: string): void => {
  const { payload } = proofOf(request);
  expect(payload.htm).to.equal(request.method);
  expect(payload.htu).to.equal(stripQuery(request.url));
  expect(payload.ath).to.equal(expectedAccessTokenHash(accessToken));
  if (nonce === undefined) {
    expect(payload).to.not.have.property('nonce');
  } else {
    expect(payload.nonce).to.equal(nonce);
  }
};

const expectTokenProof = (request: RecordedRequest, nonce?: string): void => {
  const { payload } = proofOf(request);
  expect(payload.htm).to.equal('POST');
  expect(payload.htu).to.equal(`${LOGIN}${TOKEN_PATH}`);
  expect(payload, 'token endpoint proofs never carry an access-token hash').to.not.have.property('ath');
  if (nonce === undefined) {
    expect(payload).to.not.have.property('nonce');
  } else {
    expect(payload.nonce).to.equal(nonce);
  }
};

describe('AuthInfo DPoP', () => {
  const $$ = new TestContext();
  let keychain: InMemorySecretStore;

  beforeEach(() => {
    ({ keychain } = stubDpopKeyStore($$.SANDBOX));
  });

  describe('getAuthorizationUrl', () => {
    it('binds the authorization code to the key thumbprint with dpop_jkt', async () => {
      const dpopKey = await DpopKey.generate();
      const options = { clientId: 'PlatformCLI', loginUrl: LOGIN, redirectUri: REDIRECT_URI, state: 'fixed-state' };
      const oauth2 = new OAuth2({ ...options, useVerifier: true });

      const opened = new URL(AuthInfo.getAuthorizationUrl({ ...options, dpopKey }, oauth2));

      expect(`${opened.origin}${opened.pathname}`).to.equal(`${LOGIN}/services/oauth2/authorize`);
      expect(opened.searchParams.get('response_type')).to.equal('code');
      expect(opened.searchParams.get('client_id')).to.equal('PlatformCLI');
      expect(opened.searchParams.get('state')).to.equal('fixed-state');
      expect(opened.searchParams.get('code_challenge')).to.equal(
        createHash('sha256')
          .update(oauth2.codeVerifier as string)
          .digest('base64url')
      );
      expect(opened.searchParams.get('dpop_jkt')).to.equal(dpopKey.thumbprint);
      expect(opened.searchParams.get('redirect_uri')).to.equal(REDIRECT_URI);
    });

    it('omits dpop_jkt when no DPoP key is supplied', () => {
      const options = { clientId: 'PlatformCLI', loginUrl: LOGIN, redirectUri: REDIRECT_URI };

      const opened = new URL(AuthInfo.getAuthorizationUrl(options, new OAuth2({ ...options, useVerifier: true })));

      expect(opened.searchParams.has('dpop_jkt')).to.be.false;
    });
  });

  describe('auth code exchange', () => {
    let oauth2: OAuth2;
    let dpopKey: DpopKey;
    const oauth2Options = { clientId: 'PlatformCLI', loginUrl: LOGIN, redirectUri: REDIRECT_URI };

    beforeEach(async () => {
      stubMethod($$.SANDBOX, AuthInfo.prototype, 'determineIfDevHub').resolves(false);
      stubMethod($$.SANDBOX, determineOrgModule, 'determineOrg').resolves();
      dpopKey = await DpopKey.generate();
      oauth2 = new OAuth2({ ...oauth2Options, useVerifier: true });
    });

    const exchange = (): Promise<AuthInfo> =>
      AuthInfo.create({ oauth2Options: { ...oauth2Options, authCode: 'auth-code' }, oauth2, dpopKey });

    it('sends DPoP proofs for the token request and every identity read', async () => {
      const { requests } = stubTransport($$.SANDBOX, [
        urlIncludes(TOKEN_PATH, () => ok({ ...TOKEN_OK, token_type: 'Bearer' })),
        ...identityRoutes,
      ]);

      const authInfo = await exchange();

      const [token, ...resources] = requests;
      expect(token.method).to.equal('POST');
      expect(token.url).to.equal(`${LOGIN}${TOKEN_PATH}`);
      const form = new URLSearchParams(token.body);
      expect(form.get('grant_type')).to.equal('authorization_code');
      expect(form.get('code')).to.equal('auth-code');
      expect(form.get('code_verifier')).to.equal(oauth2.codeVerifier);
      expect(form.get('client_id')).to.equal('PlatformCLI');
      expectTokenProof(token);
      expect(proofOf(token).header.jwk).to.deep.equal(dpopKey.publicJwk);

      expect(resources.map((request) => stripQuery(request.url))).to.deep.equal([
        `${INSTANCE}${USERINFO_PATH}`,
        `${INSTANCE}/services/data/v51.0${USER_SOBJECT_PATH}`,
      ]);
      for (const request of resources) {
        expect(getHeader(request.headers, 'Authorization')).to.equal('Bearer web-access');
        expectResourceProof(request, 'web-access');
      }

      const fields = authInfo.getFields(true);
      expect(fields.username).to.equal(USERNAME);
      expect(fields.accessToken).to.equal('web-access');
      expect(fields.refreshToken).to.equal('web-refresh');
      expect(fields.tokenType).to.equal('Bearer');
      expect(fields.dpopKeyReference).to.equal(dpopKey.keyReference);
    });

    it('retries the authorization-code exchange once with the challenged nonce', async () => {
      const { requests } = stubTransport($$.SANDBOX, [
        urlIncludes(TOKEN_PATH, sequence(nonceChallenge('nonce-1', 400), ok({ ...TOKEN_OK, token_type: 'DPoP' }))),
        ...identityRoutes,
      ]);

      const authInfo = await exchange();

      const tokenRequests = requests.filter(isTo(TOKEN_PATH));
      expect(tokenRequests).to.have.length(2);
      expect(getHeader(tokenRequests[0].headers, 'DPoP')).to.not.equal(getHeader(tokenRequests[1].headers, 'DPoP'));
      expectTokenProof(tokenRequests[0]);
      expectTokenProof(tokenRequests[1], 'nonce-1');
      expect(new URLSearchParams(tokenRequests[1].body).get('code')).to.equal('auth-code');

      const userinfo = requests.find(isTo(USERINFO_PATH)) as RecordedRequest;
      expect(getHeader(userinfo.headers, 'Authorization')).to.equal('DPoP web-access');
      expectResourceProof(userinfo, 'web-access', 'nonce-1');

      const fields = authInfo.getFields(true);
      expect(fields.tokenType).to.equal('DPoP');
      expect(fields.dpopNonce).to.equal('nonce-1');
      expect(fields.dpopKeyReference).to.match(UUID_PATTERN);
      expect(fields.dpopKeyReference).to.equal(dpopKey.keyReference);
    });

    it('uses the token response nonce and replaces it after a resource nonce challenge', async () => {
      const { requests } = stubTransport($$.SANDBOX, [
        urlIncludes(TOKEN_PATH, () =>
          ok({ ...TOKEN_OK, token_type: 'DPoP' }, { 'dpop-nonce': 'token-resource-nonce' })
        ),
        urlIncludes(USERINFO_PATH, sequence(nonceChallenge('userinfo-nonce'), ok(IDENTITY))),
        urlIncludes(USER_SOBJECT_PATH, () => ok({ Username: USERNAME })),
      ]);

      const authInfo = await exchange();

      const userinfoRequests = requests.filter(isTo(USERINFO_PATH));
      expect(userinfoRequests).to.have.length(2);
      for (const request of userinfoRequests) {
        expect(getHeader(request.headers, 'Authorization')).to.equal('DPoP web-access');
      }
      expectResourceProof(userinfoRequests[0], 'web-access', 'token-resource-nonce');
      expectResourceProof(userinfoRequests[1], 'web-access', 'userinfo-nonce');
      expect(getHeader(userinfoRequests[0].headers, 'DPoP')).to.not.equal(
        getHeader(userinfoRequests[1].headers, 'DPoP')
      );
      expectResourceProof(requests.find(isTo(USER_SOBJECT_PATH)) as RecordedRequest, 'web-access', 'userinfo-nonce');

      const fields = authInfo.getFields(true);
      expect(fields.tokenType).to.equal('DPoP');
      expect(fields.dpopNonce).to.equal('userinfo-nonce');
    });

    it('does not retry a nonce challenge more than once', async () => {
      const { requests } = stubTransport($$.SANDBOX, [
        urlIncludes(TOKEN_PATH, () => nonceChallenge('always-new-nonce', 400)),
      ]);

      try {
        await shouldThrow(exchange());
      } catch (e) {
        expect(e).to.have.property('name', 'AuthCodeExchangeError');
      }
      expect(requests.filter(isTo(TOKEN_PATH))).to.have.length(2);
    });

    it('falls back from a DPoP userinfo 403 to DPoP-authenticated User reads', async () => {
      const { requests } = stubTransport($$.SANDBOX, [
        urlIncludes(TOKEN_PATH, () => ok({ ...TOKEN_OK, token_type: 'DPoP' })),
        urlIncludes(USERINFO_PATH, () => ({
          statusCode: 403,
          body: [{ message: 'userinfo scope required', errorCode: 'UNKNOWN_ERROR' }],
        })),
        urlIncludes(USER_SOBJECT_PATH, () => ok({ Id: USER_ID, Username: USERNAME })),
      ]);

      const authInfo = await exchange();

      const fields = authInfo.getFields(true);
      expect(fields.username).to.equal(USERNAME);
      expect(fields.orgId).to.equal(ORG_ID);
      const resources = requests.filter((request) => !isTo(TOKEN_PATH)(request));
      expect(resources.map((request) => stripQuery(request.url))).to.deep.equal([
        `${INSTANCE}${USERINFO_PATH}`,
        `${INSTANCE}/services/data/v51.0${USER_SOBJECT_PATH}`,
      ]);
      for (const request of resources) {
        expect(getHeader(request.headers, 'Authorization')).to.equal('DPoP web-access');
        expectResourceProof(request, 'web-access');
      }
    });

    it('sends no DPoP headers and stores no DPoP fields without a key', async () => {
      const { requests } = stubTransport($$.SANDBOX, [
        urlIncludes(TOKEN_PATH, () => ok({ ...TOKEN_OK, token_type: 'Bearer' })),
        ...identityRoutes,
      ]);

      const authInfo = await AuthInfo.create({ oauth2Options: { ...oauth2Options, authCode: 'auth-code' }, oauth2 });

      expect(requests.every((request) => getHeader(request.headers, 'DPoP') === undefined)).to.be.true;
      const fields = authInfo.getFields(true);
      expect(fields.dpopKeyReference).to.be.undefined;
      expect(fields.dpopNonce).to.be.undefined;
      expect(fields.tokenType).to.not.equal('DPoP');
    });
  });

  describe('JWT bearer', () => {
    const JWT_USERNAME = 'jwt@example.com';
    const JWT_TOKEN = { access_token: 'new-access', instance_url: INSTANCE, id: `${LOGIN}/id/${ORG_ID}/${USER_ID}` };
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });

    beforeEach(() => {
      stubMethod($$.SANDBOX, AuthInfo.prototype, 'readJwtKey').resolves(
        privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
      );
      stubMethod($$.SANDBOX, SfdcUrl.prototype, 'lookup').resolves();
      stubMethod($$.SANDBOX, determineOrgModule, 'determineOrg').resolves();
    });

    const jwtAuth = (): Promise<AuthInfo> =>
      AuthInfo.create({
        username: JWT_USERNAME,
        oauth2Options: { clientId: 'connected-app', privateKey: 'path/to/server.key', loginUrl: LOGIN },
      });

    it('uses DPoP for a new JWT bearer authorization by default', async () => {
      const { requests } = stubTransport($$.SANDBOX, [
        urlIncludes(TOKEN_PATH, () => ok({ ...JWT_TOKEN, token_type: 'Bearer' })),
        urlIncludes(DEVHUB_QUERY, () => ok({ records: [] })),
      ]);

      const authInfo = await jwtAuth();

      const fields = authInfo.getFields(true);
      expect(fields.clientId).to.equal('connected-app');
      expect(fields.accessToken).to.equal('new-access');
      expect(fields.tokenType).to.equal('Bearer');
      expect(fields.dpopKeyReference).to.match(UUID_PATTERN);
      expect([...keychain.secrets.keys()].some((key) => key.endsWith(`:${fields.dpopKeyReference as string}`))).to.be
        .true;

      const [token, devHub] = requests;
      expect(requests).to.have.length(2);
      expectTokenProof(token);
      const form = new URLSearchParams(token.body);
      expect(form.get('grant_type')).to.equal('urn:ietf:params:oauth:grant-type:jwt-bearer');
      const assertion = jwt.decode(form.get('assertion') as string) as { iss: string; sub: string; aud: string };
      expect(assertion.iss).to.equal('connected-app');
      expect(assertion.sub).to.equal(JWT_USERNAME);
      expect(assertion.aud).to.equal(LOGIN);

      expect(getHeader(devHub.headers, 'Authorization')).to.equal('Bearer new-access');
      expectResourceProof(devHub, 'new-access');
    });

    it('logs in with JWT without DPoP with dpop: false', async () => {
      const { requests } = stubTransport($$.SANDBOX, [
        urlIncludes(TOKEN_PATH, () => ok({ ...JWT_TOKEN, token_type: 'Bearer' })),
        urlIncludes(DEVHUB_QUERY, () => ok({ records: [] })),
      ]);

      const authInfo = await AuthInfo.create({
        username: JWT_USERNAME,
        oauth2Options: { clientId: 'connected-app', privateKey: 'path/to/server.key', loginUrl: LOGIN },
        dpop: false,
      });

      const fields = authInfo.getFields(true);
      expect(fields.accessToken).to.equal('new-access');
      expect(fields.tokenType).to.equal('Bearer');
      expect(fields.dpopKeyReference).to.be.undefined;
      expect(keychain.secrets.size, 'no DPoP key is created').to.equal(0);

      const [token, devHub] = requests;
      expect(requests).to.have.length(2);
      expect(new URLSearchParams(token.body).get('grant_type')).to.equal('urn:ietf:params:oauth:grant-type:jwt-bearer');
      expect(getHeader(token.headers, 'DPoP')).to.be.undefined;
      expect(getHeader(devHub.headers, 'Authorization')).to.equal('Bearer new-access');
      expect(getHeader(devHub.headers, 'DPoP')).to.be.undefined;
    });

    const jwtLoginWithoutDpop = (): Promise<AuthInfo> =>
      AuthInfo.create({
        username: JWT_USERNAME,
        oauth2Options: { clientId: 'connected-app', privateKey: 'path/to/server.key', loginUrl: LOGIN },
        dpop: false,
      });

    it('explains that the app requires DPoP when a JWT login without DPoP is rejected for it', async () => {
      stubTransport($$.SANDBOX, [
        urlIncludes(TOKEN_PATH, () => ({
          statusCode: 400,
          body: { error: 'invalid_request', error_description: 'app requires proof of possession' },
        })),
      ]);

      try {
        await shouldThrow(jwtLoginWithoutDpop());
      } catch (e) {
        expect(e).to.have.property('name', 'DpopRequiredForLoginError');
        expect(e).to.have.nested.property('cause.message', 'app requires proof of possession');
      }
    });

    it('keeps the JWT error for other invalid_request rejections', async () => {
      stubTransport($$.SANDBOX, [
        urlIncludes(TOKEN_PATH, () => ({
          statusCode: 400,
          body: { error: 'invalid_request', error_description: 'invalid assertion' },
        })),
      ]);

      try {
        await shouldThrow(jwtLoginWithoutDpop());
      } catch (e) {
        expect(e).to.have.property('name', 'JwtAuthError');
      }
    });

    it('binds JWT bearer access tokens to DPoP and reuses the token nonce for resource requests', async () => {
      const { requests } = stubTransport($$.SANDBOX, [
        urlIncludes(
          TOKEN_PATH,
          sequence(nonceChallenge('jwt-token-nonce', 400), ok({ ...JWT_TOKEN, token_type: 'DPoP' }))
        ),
        urlIncludes(DEVHUB_QUERY, () => ok({ records: [] })),
      ]);

      const authInfo = await jwtAuth();

      const fields = authInfo.getFields(true);
      expect(fields.tokenType).to.equal('DPoP');
      expect(fields.dpopKeyReference).to.match(UUID_PATTERN);
      expect(fields.dpopNonce).to.equal('jwt-token-nonce');

      const tokenRequests = requests.filter(isTo(TOKEN_PATH));
      expect(tokenRequests).to.have.length(2);
      expectTokenProof(tokenRequests[0]);
      expectTokenProof(tokenRequests[1], 'jwt-token-nonce');
      for (const request of tokenRequests) {
        expect(new URLSearchParams(request.body).get('grant_type')).to.equal(
          'urn:ietf:params:oauth:grant-type:jwt-bearer'
        );
        expect(new URLSearchParams(request.body).get('assertion')).to.be.a('string').and.not.be.empty;
      }

      const devHub = requests.find(isTo(DEVHUB_QUERY)) as RecordedRequest;
      expect(getHeader(devHub.headers, 'Authorization')).to.equal('DPoP new-access');
      expectResourceProof(devHub, 'new-access', 'jwt-token-nonce');
    });
  });

  describe('auth files', () => {
    it('rejects a DPoP token type without its key reference', async () => {
      const testOrg = new DpopMockOrg({ tokenType: 'DPoP', clientId: 'SfDpopProbe' });
      await $$.stubAuths(testOrg);

      try {
        await shouldThrow(AuthInfo.create({ username: testOrg.username }));
      } catch (e) {
        expect(e).to.have.property('name', 'InvalidDpopAuthError');
      }
    });

    it('persists the DPoP key reference without private material and reads it back', async () => {
      const dpopKey = await DpopKey.generate();
      const [pem] = [...keychain.secrets.values()];
      const testOrg = new DpopMockOrg();
      await $$.stubAuths(testOrg);
      const authInfo = await AuthInfo.create({ username: testOrg.username });

      await authInfo.save({ tokenType: 'DPoP', dpopKeyReference: dpopKey.keyReference, dpopNonce: 'dpop-nonce' });

      const persisted = $$.getConfigStubContents('AuthInfoConfig');
      expect(persisted.dpopKeyReference).to.equal(dpopKey.keyReference);
      expect(persisted).to.not.have.property('dpopPrivateKey');
      expect(JSON.stringify(persisted)).to.not.include(pem);
      expect(JSON.stringify(persisted)).to.not.include('PRIVATE KEY');
      expect(persisted.dpopNonce, 'the DPoP nonce is encrypted at rest').to.not.equal('dpop-nonce');

      const fields = authInfo.getFields(true);
      expect(fields.tokenType).to.equal('DPoP');
      expect(fields.dpopKeyReference).to.equal(dpopKey.keyReference);
      expect(fields.dpopNonce).to.equal('dpop-nonce');
    });

    it('clears DPoP fields when re-authenticating with a Bearer web authorization', async () => {
      stubMethod($$.SANDBOX, AuthInfo.prototype, 'determineIfDevHub').resolves(false);
      stubMethod($$.SANDBOX, determineOrgModule, 'determineOrg').resolves();
      const testOrg = new DpopMockOrg({
        tokenType: 'DPoP',
        dpopKeyReference: KEY_REFERENCE,
        dpopNonce: 'old-nonce',
      });
      $$.setConfigStubContents('AuthInfoConfig', { contents: await testOrg.getConfig() });
      stubTransport($$.SANDBOX, [
        urlIncludes(TOKEN_PATH, () =>
          ok({ ...TOKEN_OK, instance_url: testOrg.instanceUrl, token_type: 'Bearer', refresh_token: 'bearer-refresh' })
        ),
        urlIncludes(USERINFO_PATH, () => ok({ ...IDENTITY, preferred_username: testOrg.username })),
        urlIncludes(USER_SOBJECT_PATH, () => ok({ Username: testOrg.username })),
      ]);

      const authInfo = await AuthInfo.create({
        oauth2Options: { authCode: 'auth-code', loginUrl: testOrg.loginUrl, clientId: 'PlatformCLI' },
      });
      await authInfo.save();

      const fields = authInfo.getFields(true);
      expect(fields.refreshToken).to.equal('bearer-refresh');
      expect(fields.tokenType).to.not.equal('DPoP');
      expect(fields.dpopKeyReference).to.be.undefined;
      expect(fields.dpopNonce).to.be.undefined;
      const persisted = $$.getConfigStubContents('AuthInfoConfig');
      expect(persisted).to.not.have.property('dpopKeyReference');
      expect(persisted).to.not.have.property('dpopNonce');
    });
  });

  describe('getSfdxAuthUrl', () => {
    it('rejects exporting DPoP-bound web credentials as an auth URL', async () => {
      const testOrg = new DpopMockOrg({ tokenType: 'DPoP', dpopKeyReference: KEY_REFERENCE });
      testOrg.refreshToken = 'web-refresh';
      await $$.stubAuths(testOrg);
      const authInfo = await AuthInfo.create({ username: testOrg.username });

      expect(() => authInfo.getSfdxAuthUrl())
        .to.throw()
        .with.property('name', 'DpopAuthUrlUnsupportedError');
    });

    it('rejects exporting DPoP-bound JWT credentials as an auth URL', async () => {
      const testOrg = new DpopMockOrg({
        tokenType: 'DPoP',
        dpopKeyReference: KEY_REFERENCE,
        privateKey: '/keys/assertion.key',
      });
      // A JWT authorization never carries a refresh token; the DPoP check must still win.
      testOrg.refreshToken = undefined;
      await $$.stubAuths(testOrg);
      const authInfo = await AuthInfo.create({ username: testOrg.username });

      expect(() => authInfo.getSfdxAuthUrl())
        .to.throw()
        .with.property('name', 'DpopAuthUrlUnsupportedError');
    });
  });
});
