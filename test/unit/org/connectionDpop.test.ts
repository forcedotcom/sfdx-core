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
import { generateKeyPairSync } from 'node:crypto';
import { createRequire } from 'node:module';
import { expect } from 'chai';
import { stubMethod } from '@salesforce/ts-sinon';
import { AuthInfo } from '../../../src/org/authInfo';
import { Connection } from '../../../src/org/connection';
import * as determineOrgModule from '../../../src/org/determineOrg';
import { DpopKey } from '../../../src/crypto/dpop';
import { MyDomainResolver } from '../../../src/status/myDomainResolver';
import { SfdcUrl } from '../../../src/util/sfdcUrl';
import { MockTestOrgData, shouldThrow, TestContext } from '../../../src/testSetup';
import {
  BASE64URL_SHA256_PATTERN,
  decodeProof,
  DpopMockOrg,
  expectedAccessTokenHash,
  FakeResponse,
  getHeader,
  nonceChallenge,
  proofOf,
  RecordedRequest,
  sequence,
  stripQuery,
  stubDpopKeyStore,
  stubTransport,
  urlIncludes,
  verifyProof,
} from '../dpopTestHelpers';

const API_VERSION = '68.0';
const FRESH_TOKEN = 'fresh-access-token';
const ROTATED_RT = 'rotated-refresh-token';
const TOKEN_PATH = '/services/oauth2/token';
const SOBJECTS_PATH = `/services/data/v${API_VERSION}/sobjects`;
const SOAP_PATH = `/services/Soap/m/${API_VERSION}`;
const SOAP_PROOF = /<DpopProofHeader><proof>([^<]+)<\/proof><\/DpopProofHeader>/;

const DESCRIBE_METADATA_RESPONSE =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://soap.sforce.com/2006/04/metadata">' +
  '<soapenv:Body><describeMetadataResponse><result>' +
  '<organizationNamespace></organizationNamespace><partialSaveAllowed>true</partialSaveAllowed><testRequired>false</testRequired>' +
  '</result></describeMetadataResponse></soapenv:Body></soapenv:Envelope>';

const soapOk = (): FakeResponse => ({
  statusCode: 200,
  headers: { 'content-type': 'text/xml' },
  body: DESCRIBE_METADATA_RESPONSE,
});

const ok = (body: unknown = { ok: true }): FakeResponse => ({ statusCode: 200, body });

const invalidSession = (): FakeResponse => ({
  statusCode: 401,
  body: [{ errorCode: 'INVALID_SESSION_ID', message: 'Session expired or invalid' }],
});

const isTo = (path: string) => (request: RecordedRequest) => request.url.includes(path);

const soapProofOf = (request: RecordedRequest): string | undefined => request.body?.match(SOAP_PROOF)?.[1];

describe('Connection DPoP', () => {
  const $$ = new TestContext();
  let dpopKey: DpopKey;

  beforeEach(async () => {
    $$.SANDBOXES.CONNECTION.restore();
    $$.SANDBOX.stub(MyDomainResolver.prototype, 'resolve').resolves('1.1.1.1');
    stubMethod($$.SANDBOX, AuthInfo.prototype, 'determineIfDevHub').resolves(false);
    stubMethod($$.SANDBOX, determineOrgModule, 'determineOrg').resolves();
    stubDpopKeyStore($$.SANDBOX);
    dpopKey = await DpopKey.generate();
  });

  const connect = async (org: MockTestOrgData): Promise<{ conn: Connection; authInfo: AuthInfo }> => {
    await $$.stubAuths(org);
    const authInfo = await AuthInfo.create({ username: org.username });
    const conn = await Connection.create({ authInfo, connectionOptions: { version: API_VERSION } });
    return { conn, authInfo };
  };

  /** A refresh-token (web) authorization whose resource token is still Bearer but has a DPoP key. */
  const bearerWithKeyOrg = (): DpopMockOrg =>
    new DpopMockOrg({
      tokenType: 'Bearer',
      dpopKeyReference: dpopKey.keyReference,
      dpopNonce: 'initial-resource-nonce',
      instanceApiVersion: API_VERSION,
    });

  /** A DPoP-bound refresh-token (web) authorization. */
  const dpopOrg = (nonce = 'reference-resource-nonce'): DpopMockOrg =>
    new DpopMockOrg({
      tokenType: 'DPoP',
      dpopKeyReference: dpopKey.keyReference,
      dpopNonce: nonce,
      instanceApiVersion: API_VERSION,
    });

  describe('REST', () => {
    it('signs the bearer token and retries a nonce challenge once with a fresh proof', async () => {
      const org = bearerWithKeyOrg();
      const { requests } = stubTransport($$.SANDBOX, [
        urlIncludes(SOBJECTS_PATH, sequence(nonceChallenge('resource-nonce'), ok())),
        urlIncludes(TOKEN_PATH, () => ok({ access_token: FRESH_TOKEN, instance_url: org.instanceUrl })),
      ]);
      const { conn } = await connect(org);

      const response = await conn.request(`${org.instanceUrl}${SOBJECTS_PATH}`);

      expect(response).to.deep.equal({ ok: true });
      expect(requests.filter(isTo(TOKEN_PATH)), 'a nonce challenge is not an expired session').to.have.length(0);
      const resources = requests.filter(isTo(SOBJECTS_PATH));
      expect(resources).to.have.length(2);
      for (const request of resources) {
        expect(getHeader(request.headers, 'Authorization')).to.equal(`Bearer ${org.accessToken}`);
      }
      const [first, second] = resources.map(proofOf);
      expect(getHeader(resources[0].headers, 'DPoP')).to.not.equal(getHeader(resources[1].headers, 'DPoP'));
      expect(first.payload.nonce).to.equal('initial-resource-nonce');
      expect(second.payload.nonce).to.equal('resource-nonce');
      expect(second.payload.ath).to.match(BASE64URL_SHA256_PATTERN);
      expect(second.payload.ath).to.equal(expectedAccessTokenHash(org.accessToken));
      expect(second.payload.htm).to.equal('GET');
      expect(second.payload.htu).to.equal(`${org.instanceUrl}${SOBJECTS_PATH}`);
    });

    it('restores the DPoP key from its keychain reference in the auth file', async () => {
      const org = dpopOrg();
      const { requests } = stubTransport($$.SANDBOX, [urlIncludes(SOBJECTS_PATH, () => ok())]);
      const { conn } = await connect(org);

      await conn.request(`${org.instanceUrl}${SOBJECTS_PATH}?limit=1`);

      expect(requests).to.have.length(1);
      expect(getHeader(requests[0].headers, 'Authorization')).to.equal(`DPoP ${org.accessToken}`);
      const { header, payload } = proofOf(requests[0]);
      expect(header.jwk).to.deep.equal(dpopKey.publicJwk);
      expect(payload).to.include({
        htm: 'GET',
        htu: stripQuery(requests[0].url),
        nonce: 'reference-resource-nonce',
        ath: expectedAccessTokenHash(org.accessToken),
      });
    });

    it('rejects a DPoP token type whose signing key cannot be loaded', async () => {
      const org = new DpopMockOrg({
        tokenType: 'DPoP',
        dpopKeyReference: '00000000-0000-4000-8000-000000000000',
        instanceApiVersion: API_VERSION,
      });

      try {
        await shouldThrow(connect(org));
      } catch (e) {
        expect(e).to.have.property('name', 'DpopSessionUnavailableError');
      }
    });
  });

  describe('SOAP', () => {
    it('sends the token and proof in SOAP headers, not HTTP auth headers', async () => {
      const org = dpopOrg();
      const { requests } = stubTransport($$.SANDBOX, [urlIncludes(SOAP_PATH, soapOk)]);
      const { conn } = await connect(org);

      await conn.metadata.describe(API_VERSION);

      expect(requests).to.have.length(1);
      const [request] = requests;
      expect(getHeader(request.headers, 'Authorization')).to.be.undefined;
      expect(getHeader(request.headers, 'DPoP')).to.be.undefined;
      expect(request.body).to.include(`<sessionId>${org.accessToken}</sessionId>`);
      expect(decodeProof(soapProofOf(request)).payload).to.include({
        htm: 'POST',
        htu: `${org.instanceUrl}${SOAP_PATH}`,
        nonce: 'reference-resource-nonce',
        ath: expectedAccessTokenHash(org.accessToken),
      });
      verifyProof(soapProofOf(request));
    });

    it('retries a nonce challenge with a fresh SOAP proof', async () => {
      const org = dpopOrg();
      const { requests } = stubTransport($$.SANDBOX, [
        urlIncludes(SOAP_PATH, sequence(nonceChallenge('soap-resource-nonce'), soapOk())),
      ]);
      const { conn } = await connect(org);

      await conn.metadata.describe(API_VERSION);

      expect(requests).to.have.length(2);
      const proofs = requests.map(soapProofOf);
      expect(proofs[0]).to.be.a('string');
      expect(proofs[1]).to.be.a('string');
      expect(proofs[1]).to.not.equal(proofs[0]);
      expect(decodeProof(proofs[0]).payload.nonce).to.equal('reference-resource-nonce');
      expect(decodeProof(proofs[1]).payload.nonce).to.equal('soap-resource-nonce');
      expect(requests[1].body).to.include(`<sessionId>${org.accessToken}</sessionId>`);
    });

    it('leaves Bearer SOAP envelopes unchanged', async () => {
      const org = new MockTestOrgData();
      const { requests } = stubTransport($$.SANDBOX, [urlIncludes(SOAP_PATH, soapOk)]);
      const { conn } = await connect(org);

      await conn.metadata.describe(API_VERSION);

      expect(requests).to.have.length(1);
      expect(requests[0].body).to.include(`<sessionId>${org.accessToken}</sessionId>`);
      expect(requests[0].body).to.not.include('DpopProofHeader');
      expect(getHeader(requests[0].headers, 'DPoP')).to.be.undefined;
    });
  });

  describe('session refresh', () => {
    it('retries the refresh token nonce without ath and keeps DPoP authorization', async () => {
      const org = dpopOrg('initial-resource-nonce');
      const originalRefreshToken = org.refreshToken as string;
      const { requests } = stubTransport($$.SANDBOX, [
        urlIncludes(
          TOKEN_PATH,
          sequence(
            nonceChallenge('token-nonce', 400),
            ok({
              access_token: FRESH_TOKEN,
              refresh_token: ROTATED_RT,
              instance_url: org.instanceUrl,
              id: `${org.loginUrl}/id/${org.orgId}/${org.userId}`,
              token_type: 'DPoP',
            })
          )
        ),
        urlIncludes(SOBJECTS_PATH, sequence(invalidSession(), ok())),
      ]);
      const { conn, authInfo } = await connect(org);

      const response = await conn.request(`${org.instanceUrl}${SOBJECTS_PATH}`);

      expect(response).to.deep.equal({ ok: true });
      const tokenRequests = requests.filter(isTo(TOKEN_PATH));
      expect(tokenRequests).to.have.length(2);
      for (const request of tokenRequests) {
        const form = new URLSearchParams(request.body);
        expect(form.get('grant_type')).to.equal('refresh_token');
        expect(form.get('refresh_token')).to.equal(originalRefreshToken);
        expect(proofOf(request).payload).to.not.have.property('ath');
        expect(proofOf(request).payload.htm).to.equal('POST');
      }
      expect(proofOf(tokenRequests[0]).payload).to.not.have.property('nonce');
      expect(proofOf(tokenRequests[1]).payload.nonce).to.equal('token-nonce');

      const resources = requests.filter(isTo(SOBJECTS_PATH));
      expect(resources).to.have.length(2);
      expect(getHeader(resources[0].headers, 'Authorization')).to.equal(`DPoP ${org.accessToken}`);
      expect(getHeader(resources[1].headers, 'Authorization')).to.equal(`DPoP ${FRESH_TOKEN}`);
      expect(proofOf(resources[0]).payload.ath).to.equal(expectedAccessTokenHash(org.accessToken));
      expect(proofOf(resources[0]).payload.nonce).to.equal('initial-resource-nonce');
      expect(proofOf(resources[1]).payload.ath).to.equal(expectedAccessTokenHash(FRESH_TOKEN));
      expect(getHeader(resources[0].headers, 'DPoP')).to.not.equal(getHeader(resources[1].headers, 'DPoP'));

      const fields = authInfo.getFields(true);
      expect(fields.accessToken).to.equal(FRESH_TOKEN);
      expect(fields.refreshToken).to.equal(ROTATED_RT);
      expect(fields.tokenType).to.equal('DPoP');
      expect(fields.dpopKeyReference).to.equal(dpopKey.keyReference);
    });

    it('re-mints a JWT session with the persisted DPoP signing key and nonce', async () => {
      const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
      stubMethod($$.SANDBOX, AuthInfo.prototype, 'readJwtKey').resolves(
        privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
      );
      stubMethod($$.SANDBOX, SfdcUrl.prototype, 'lookup').resolves();
      const org = new DpopMockOrg({
        privateKey: 'path/to/server.key',
        tokenType: 'DPoP',
        dpopKeyReference: dpopKey.keyReference,
        dpopNonce: 'jwt-session-nonce',
        instanceApiVersion: API_VERSION,
      });
      org.refreshToken = undefined;
      const { requests } = stubTransport($$.SANDBOX, [
        urlIncludes(TOKEN_PATH, () =>
          ok({
            access_token: FRESH_TOKEN,
            instance_url: org.instanceUrl,
            id: `${org.loginUrl}/id/${org.orgId}/${org.userId}`,
            token_type: 'DPoP',
          })
        ),
        urlIncludes(SOBJECTS_PATH, sequence(invalidSession(), ok())),
      ]);
      const { conn, authInfo } = await connect(org);

      const response = await conn.request(`${org.instanceUrl}${SOBJECTS_PATH}`);

      expect(response).to.deep.equal({ ok: true });
      const tokenRequests = requests.filter(isTo(TOKEN_PATH));
      expect(tokenRequests).to.have.length(1);
      const form = new URLSearchParams(tokenRequests[0].body);
      expect(form.get('grant_type')).to.equal('urn:ietf:params:oauth:grant-type:jwt-bearer');
      expect(form.get('assertion')).to.be.a('string').and.not.be.empty;
      const tokenProof = proofOf(tokenRequests[0]);
      expect(tokenProof.header.jwk, 'the persisted key signs the re-mint').to.deep.equal(dpopKey.publicJwk);
      expect(tokenProof.payload.nonce).to.equal('jwt-session-nonce');
      expect(tokenProof.payload).to.not.have.property('ath');

      const resources = requests.filter(isTo(SOBJECTS_PATH));
      expect(resources).to.have.length(2);
      expect(getHeader(resources[0].headers, 'Authorization')).to.equal(`DPoP ${org.accessToken}`);
      expect(getHeader(resources[1].headers, 'Authorization')).to.equal(`DPoP ${FRESH_TOKEN}`);
      expect(proofOf(resources[0]).payload).to.include({
        ath: expectedAccessTokenHash(org.accessToken),
        nonce: 'jwt-session-nonce',
      });
      expect(proofOf(resources[1]).payload).to.include({
        ath: expectedAccessTokenHash(FRESH_TOKEN),
        nonce: 'jwt-session-nonce',
      });
      expect(authInfo.getFields(true).accessToken).to.equal(FRESH_TOKEN);
    });

    it('re-mints a JWT session without a DPoP key as Bearer', async () => {
      const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
      stubMethod($$.SANDBOX, AuthInfo.prototype, 'readJwtKey').resolves(
        privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
      );
      stubMethod($$.SANDBOX, SfdcUrl.prototype, 'lookup').resolves();
      const generate = $$.SANDBOX.spy(DpopKey, 'generate');
      // A JWT authorization from before DPoP.
      const org = new DpopMockOrg({ privateKey: 'path/to/server.key', instanceApiVersion: API_VERSION });
      org.refreshToken = undefined;
      const { requests } = stubTransport($$.SANDBOX, [
        urlIncludes(TOKEN_PATH, () =>
          ok({
            access_token: FRESH_TOKEN,
            instance_url: org.instanceUrl,
            id: `${org.loginUrl}/id/${org.orgId}/${org.userId}`,
            token_type: 'Bearer',
          })
        ),
        urlIncludes(SOBJECTS_PATH, sequence(invalidSession(), ok())),
      ]);
      const { conn, authInfo } = await connect(org);

      const response = await conn.request(`${org.instanceUrl}${SOBJECTS_PATH}`);

      expect(response).to.deep.equal({ ok: true });
      expect(generate.called, 'a re-mint does not create a DPoP key').to.be.false;
      const tokenRequests = requests.filter(isTo(TOKEN_PATH));
      expect(tokenRequests).to.have.length(1);
      expect(new URLSearchParams(tokenRequests[0].body).get('grant_type')).to.equal(
        'urn:ietf:params:oauth:grant-type:jwt-bearer'
      );
      expect(getHeader(tokenRequests[0].headers, 'DPoP')).to.be.undefined;

      const resources = requests.filter(isTo(SOBJECTS_PATH));
      expect(resources).to.have.length(2);
      expect(getHeader(resources[1].headers, 'Authorization')).to.equal(`Bearer ${FRESH_TOKEN}`);
      expect(getHeader(resources[1].headers, 'DPoP')).to.be.undefined;

      const fields = authInfo.getFields(true);
      expect(fields.accessToken).to.equal(FRESH_TOKEN);
      expect(fields.tokenType).to.equal('Bearer');
      expect(fields.dpopKeyReference).to.be.undefined;
    });

    describe('when the app now requires DPoP', () => {
      const dpopRequired = (): FakeResponse => ({
        statusCode: 400,
        body: { error: 'invalid_request', error_description: 'app requires proof of possession' },
      });

      it('asks the user to log in again when a JWT session without a DPoP key is re-minted', async () => {
        const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
        stubMethod($$.SANDBOX, AuthInfo.prototype, 'readJwtKey').resolves(
          privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
        );
        stubMethod($$.SANDBOX, SfdcUrl.prototype, 'lookup').resolves();
        const org = new DpopMockOrg({ privateKey: 'path/to/server.key', instanceApiVersion: API_VERSION });
        org.refreshToken = undefined;
        stubTransport($$.SANDBOX, [urlIncludes(TOKEN_PATH, dpopRequired), urlIncludes(SOBJECTS_PATH, invalidSession)]);
        const { conn } = await connect(org);

        try {
          await shouldThrow(conn.request(`${org.instanceUrl}${SOBJECTS_PATH}`));
        } catch (e) {
          // jsforce's session refresh keeps only the message of the refresh error.
          expect((e as Error).message)
            .to.include("doesn't use DPoP, but its app requires DPoP")
            .and.include('Log in to the org again');
        }
      });

      it('asks the user to log in again when a session without a DPoP key is refreshed', async () => {
        const org = new MockTestOrgData();
        stubTransport($$.SANDBOX, [urlIncludes(TOKEN_PATH, dpopRequired), urlIncludes(SOBJECTS_PATH, invalidSession)]);
        const { conn } = await connect(org);

        try {
          await shouldThrow(conn.request(`${org.instanceUrl}${SOBJECTS_PATH}`));
        } catch (e) {
          // jsforce's session refresh keeps only the message of the refresh error.
          expect((e as Error).message)
            .to.include("doesn't use DPoP, but its app requires DPoP")
            .and.include('Log in to the org again');
        }
      });
    });
  });

  describe('transport retries', () => {
    // Stub the exact undici instance jsforce uses; jsforce retries 5xx GETs inside its fetch wrapper.
    const undici = createRequire(require.resolve('@jsforce/jsforce-node'))('undici') as {
      fetch: (url: string, init: { headers?: Record<string, string> }) => Promise<Response>;
      Response: typeof Response;
    };

    const stubFetch = (statuses: number[]): Array<Record<string, string>> => {
      const sentHeaders: Array<Record<string, string>> = [];
      $$.SANDBOX.stub(undici, 'fetch').callsFake((_url, init) => {
        sentHeaders.push({ ...(init.headers ?? {}) });
        const status = statuses[Math.min(sentHeaders.length - 1, statuses.length - 1)];
        return Promise.resolve(
          new undici.Response(status === 200 ? JSON.stringify({ ok: true }) : null, {
            status,
            headers: { 'content-type': 'application/json' },
          })
        );
      });
      return sentHeaders;
    };

    it('signs a fresh DPoP proof for every transport retry', async () => {
      const org = dpopOrg();
      const { conn } = await connect(org);
      const sentHeaders = stubFetch([503, 200]);

      const response = await conn.request(`${org.instanceUrl}${SOBJECTS_PATH}`);

      expect(response).to.deep.equal({ ok: true });
      expect(sentHeaders).to.have.length(2);
      const proofs = sentHeaders.map((headers) => getHeader(headers, 'DPoP'));
      expect(proofs[0]).to.be.a('string');
      expect(proofs[1]).to.be.a('string');
      expect(proofs[1], 'a DPoP proof must never be replayed').to.not.equal(proofs[0]);
      for (const proof of proofs) {
        expect(verifyProof(proof).payload).to.include({ htm: 'GET', ath: expectedAccessTokenHash(org.accessToken) });
      }
      expect(verifyProof(proofs[0]).payload.jti).to.not.equal(verifyProof(proofs[1]).payload.jti);
    });

    it('does not replay a caller-supplied fixed DPoP proof', async () => {
      const org = dpopOrg();
      const { conn } = await connect(org);
      const sentHeaders = stubFetch([503]);

      try {
        await conn.request({
          method: 'GET',
          url: `${org.instanceUrl}${SOBJECTS_PATH}`,
          headers: { DPoP: 'fixed-proof' },
        });
      } catch {
        // The 503 surfaces to the caller; only the number of attempts matters here.
      }

      expect(sentHeaders).to.have.length(1);
      expect(getHeader(sentHeaders[0], 'DPoP')).to.equal('fixed-proof');
    });
  });
});
