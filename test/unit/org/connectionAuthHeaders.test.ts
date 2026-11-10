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
import { expect } from 'chai';
import { stubMethod } from '@salesforce/ts-sinon';
import { AuthInfo } from '../../../src/org/authInfo';
import { Connection } from '../../../src/org/connection';
import * as determineOrgModule from '../../../src/org/determineOrg';
import { DpopKey } from '../../../src/crypto/dpop';
import { MyDomainResolver } from '../../../src/status/myDomainResolver';
import { MockTestOrgData, TestContext } from '../../../src/testSetup';
import { FakeSalesforce } from '../dpopFakeSalesforce';
import { DpopMockOrg, stubDpopKeyStore } from '../dpopTestHelpers';

const API_VERSION = '68.0';
const NONCE = 'resource-nonce';

/**
 * Plugins that send HTTP requests themselves (e.g. bulk results downloads with undici `fetch`) need headers
 * Salesforce accepts for the session, instead of hand-building `Authorization: Bearer <accessToken>`.
 */
describe('Connection.getAuthHeaders', () => {
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

  const connect = async (org: MockTestOrgData): Promise<Connection> => {
    await $$.stubAuths(org);
    const authInfo = await AuthInfo.create({ username: org.username });
    return Connection.create({ authInfo, connectionOptions: { version: API_VERSION } });
  };

  it('returns headers Salesforce accepts for a DPoP-bound session, fresh for every request', async () => {
    const org = new DpopMockOrg({
      tokenType: 'DPoP',
      dpopKeyReference: dpopKey.keyReference,
      dpopNonce: NONCE,
      instanceApiVersion: API_VERSION,
    });
    const salesforce = new FakeSalesforce({
      publicJwk: dpopKey.publicJwk,
      accessToken: () => org.accessToken,
      nonce: () => NONCE,
    });
    const conn = await connect(org);
    const url = `${org.instanceUrl}/services/data/v${API_VERSION}/jobs/query/750xx0000000001/results?maxRecords=50000`;

    const first = conn.getAuthHeaders('GET', url);
    const second = conn.getAuthHeaders('GET', url);

    expect(salesforce.check({ method: 'GET', url, headers: first })).to.be.undefined;
    expect(salesforce.check({ method: 'GET', url, headers: second }), 'each call signs a new proof').to.be.undefined;
  });

  it('returns a plain Bearer header for a bearer session', async () => {
    const org = new MockTestOrgData();
    const conn = await connect(org);

    expect(conn.getAuthHeaders('GET', `${org.instanceUrl}/services/data`)).to.deep.equal({
      Authorization: `Bearer ${org.accessToken}`,
    });
  });

  it('sends a bearer session once with Bearer headers, ignoring DPoP nonces', async () => {
    const org = new MockTestOrgData();
    const conn = await connect(org);
    const url = `${org.instanceUrl}/services/data`;
    const sent: Array<Record<string, string>> = [];

    await conn.sendWithAuth('GET', url, async (headers) => {
      sent.push(headers);
      return new Response('', {
        status: 401,
        headers: { 'DPoP-Nonce': 'n', 'WWW-Authenticate': 'DPoP error="use_dpop_nonce"' },
      });
    });
    conn.recordDpopNonce('n');

    expect(sent).to.deep.equal([{ Authorization: `Bearer ${org.accessToken}` }]);
    expect(conn.getAuthInfo().getFields(true).dpopNonce).to.be.undefined;
  });
});

describe('Connection.sendWithAuth and recordDpopNonce', () => {
  const $$ = new TestContext();
  const NEW_NONCE = 'rotated-nonce';
  let dpopKey: DpopKey;
  let org: DpopMockOrg;
  let serverNonce: string;
  let salesforce: FakeSalesforce;
  let conn: Connection;
  let url: string;

  beforeEach(async () => {
    $$.SANDBOXES.CONNECTION.restore();
    $$.SANDBOX.stub(MyDomainResolver.prototype, 'resolve').resolves('1.1.1.1');
    stubMethod($$.SANDBOX, AuthInfo.prototype, 'determineIfDevHub').resolves(false);
    stubMethod($$.SANDBOX, determineOrgModule, 'determineOrg').resolves();
    stubDpopKeyStore($$.SANDBOX);
    dpopKey = await DpopKey.generate();
    org = new DpopMockOrg({
      tokenType: 'DPoP',
      dpopKeyReference: dpopKey.keyReference,
      dpopNonce: NONCE,
      instanceApiVersion: API_VERSION,
    });
    serverNonce = NONCE;
    salesforce = new FakeSalesforce({
      publicJwk: dpopKey.publicJwk,
      accessToken: () => org.accessToken,
      nonce: () => serverNonce,
    });
    await $$.stubAuths(org);
    const authInfo = await AuthInfo.create({ username: org.username });
    conn = await Connection.create({ authInfo, connectionOptions: { version: API_VERSION } });
    url = `${org.instanceUrl}/services/data/v${API_VERSION}/jobs/query/750xx0000000001/results`;
  });

  /** A fake `fetch` against FakeSalesforce that challenges a stale nonce, as Salesforce does. */
  const fakeFetch =
    (sent: Array<Record<string, string>>) =>
    async (headers: Record<string, string>): Promise<Response> => {
      sent.push(headers);
      const rejected = salesforce.check({ method: 'GET', url, headers });
      if (rejected?.includes('nonce')) {
        return new Response('', {
          status: 401,
          headers: { 'DPoP-Nonce': serverNonce, 'WWW-Authenticate': 'DPoP error="use_dpop_nonce"' },
        });
      }
      return new Response(rejected ?? 'ok', { status: rejected ? 401 : 200 });
    };

  it('answers a use_dpop_nonce challenge with new headers and saves the nonce', async () => {
    serverNonce = NEW_NONCE;
    const sent: Array<Record<string, string>> = [];

    const response = await conn.sendWithAuth('GET', url, fakeFetch(sent));

    expect(response.status).to.equal(200);
    expect(sent).to.have.length(2);
    expect(sent[1].DPoP).to.not.equal(sent[0].DPoP);
    expect(conn.getAuthInfo().getFields(true).dpopNonce).to.equal(NEW_NONCE);
    expect(salesforce.check({ method: 'GET', url, headers: conn.getAuthHeaders('GET', url) })).to.be.undefined;
  });

  it('records a nonce from a successful response without retrying', async () => {
    const sent: Array<Record<string, string>> = [];

    const response = await conn.sendWithAuth('GET', url, async (headers) => {
      sent.push(headers);
      return new Response('ok', { status: 200, headers: { 'DPoP-Nonce': NEW_NONCE } });
    });

    expect(response.status).to.equal(200);
    expect(sent).to.have.length(1);
    expect(conn.getAuthInfo().getFields(true).dpopNonce).to.equal(NEW_NONCE);
  });

  it('reads Node-style responses with plain header objects', async () => {
    serverNonce = NEW_NONCE;
    let attempts = 0;

    const response = await conn.sendWithAuth('GET', url, async (headers) => {
      attempts += 1;
      const rejected = salesforce.check({ method: 'GET', url, headers });
      return rejected
        ? { statusCode: 401, headers: { 'dpop-nonce': serverNonce, 'www-authenticate': 'DPoP error="use_dpop_nonce"' } }
        : { statusCode: 200, headers: {} };
    });

    expect(response.statusCode).to.equal(200);
    expect(attempts).to.equal(2);
  });

  it('retries a challenge only once', async () => {
    let attempts = 0;

    const response = await conn.sendWithAuth('GET', url, async () => {
      attempts += 1;
      return new Response('', {
        status: 401,
        headers: { 'DPoP-Nonce': `nonce-${attempts}`, 'WWW-Authenticate': 'DPoP error="use_dpop_nonce"' },
      });
    });

    expect(response.status).to.equal(401);
    expect(attempts).to.equal(2);
  });

  it('records a nonce for callers that send requests themselves', async () => {
    serverNonce = NEW_NONCE;
    expect(salesforce.check({ method: 'GET', url, headers: conn.getAuthHeaders('GET', url) })).to.include('nonce');

    conn.recordDpopNonce(NEW_NONCE);

    expect(salesforce.check({ method: 'GET', url, headers: conn.getAuthHeaders('GET', url) })).to.be.undefined;
    expect(conn.getAuthInfo().getFields(true).dpopNonce).to.equal(NEW_NONCE);
  });
});
