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
});
