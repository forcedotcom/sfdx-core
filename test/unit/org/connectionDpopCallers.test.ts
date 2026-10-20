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
import {
  apexNodeExecuteAnonymousEnvelope,
  APEX_NS,
  EXECUTE_ANONYMOUS_RESPONSE,
  FakeSalesforce,
  SOAP_ENV_NS,
} from '../dpopFakeSalesforce';
import {
  DpopMockOrg,
  FakeResponse,
  getHeader,
  RecordedRequest,
  stubDpopKeyStore,
  stubTransport,
} from '../dpopTestHelpers';

const API_VERSION = '68.0';
const NONCE = 'resource-nonce';
const APEX = 'System.debug(&apos;hello&apos;);';
/** The shape of the SFAP API token the agents plugin swaps into `connection.accessToken`. */
const SFAP_TOKEN = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJzZmFwIn0.c2lnbmF0dXJl';
const SFAP_URL = 'https://api.salesforce.com/einstein/ai-agent/v1/agents/0XxRM0000004C92/sessions';

const executeAnonymousOk = (): FakeResponse => ({
  statusCode: 200,
  headers: { 'content-type': 'text/xml' },
  body: EXECUTE_ANONYMOUS_RESPONSE,
});

/**
 * Requests that plugins build themselves and send through `Connection.request`, rather than through jsforce's
 * REST or SOAP APIs.
 */
describe('Connection DPoP with caller-built requests', () => {
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

  const dpopOrg = (): DpopMockOrg =>
    new DpopMockOrg({
      tokenType: 'DPoP',
      dpopKeyReference: dpopKey.keyReference,
      dpopNonce: NONCE,
      instanceApiVersion: API_VERSION,
    });

  /** What apex-node's ExecuteService sends for `sf apex run`. */
  const executeAnonymous = (conn: Connection): Promise<unknown> =>
    conn.request({
      method: 'POST',
      url: `${conn.instanceUrl}/services/Soap/s/${conn.version}/${(conn.accessToken as string).split('!')[0]}`,
      body: apexNodeExecuteAnonymousEnvelope(conn.accessToken as string, APEX),
      headers: { 'content-type': 'text/xml', soapaction: 'executeAnonymous' },
    });

  describe('Apex SOAP (sf apex run)', () => {
    it('binds an apex-node executeAnonymous envelope so Salesforce accepts it', async () => {
      const org = dpopOrg();
      const salesforce = new FakeSalesforce({
        publicJwk: dpopKey.publicJwk,
        accessToken: () => org.accessToken,
        nonce: () => NONCE,
      });
      const { requests } = stubTransport($$.SANDBOX, [
        (request) =>
          request.url.includes('/services/Soap/s/') ? salesforce.respond(executeAnonymousOk)(request) : undefined,
      ]);
      const conn = await connect(org);

      const result = await executeAnonymous(conn).catch((e: Error) => e);

      expect(salesforce.rejections, 'Salesforce rejections').to.deep.equal([]);
      expect(result).to.not.be.instanceOf(Error);
      expect(requests).to.have.length(1);
    });

    it('puts the proof in the namespace a SessionHeader declares on itself', async () => {
      const org = dpopOrg();
      const salesforce = new FakeSalesforce({
        publicJwk: dpopKey.publicJwk,
        accessToken: () => org.accessToken,
        nonce: () => NONCE,
      });
      stubTransport($$.SANDBOX, [salesforce.respond(executeAnonymousOk)]);
      const conn = await connect(org);

      await conn
        .request({
          method: 'POST',
          url: `${conn.instanceUrl}/services/Soap/s/${API_VERSION}`,
          body:
            `<e:Envelope xmlns:e="${SOAP_ENV_NS}"><e:Header>` +
            `<SessionHeader xmlns="${APEX_NS}"><sessionId>${org.accessToken}</sessionId></SessionHeader>` +
            '</e:Header><e:Body/></e:Envelope>',
          headers: { 'Content-Type': 'text/xml; charset=utf-8' },
        })
        .catch((e: Error) => e);

      expect(salesforce.rejections, 'Salesforce rejections').to.deep.equal([]);
    });

    it('leaves the envelope unchanged for a bearer session', async () => {
      const org = new MockTestOrgData();
      const { requests } = stubTransport($$.SANDBOX, [() => executeAnonymousOk()]);
      const conn = await connect(org);

      await executeAnonymous(conn);

      expect(requests[0].body).to.equal(apexNodeExecuteAnonymousEnvelope(org.accessToken, APEX));
      expect(getHeader(requests[0].headers, 'DPoP')).to.be.undefined;
    });
  });

  describe('tokens the session did not issue', () => {
    it('sends a swapped-in API token as Bearer, without a proof', async () => {
      const org = dpopOrg();
      // The SFAP API takes its own JWT as a plain bearer token, not bound to the session's DPoP key.
      const sfap = (request: RecordedRequest): FakeResponse | undefined => {
        if (!request.url.startsWith(SFAP_URL)) return undefined;
        return getHeader(request.headers, 'Authorization') === `Bearer ${SFAP_TOKEN}`
          ? { statusCode: 200, body: { sessionId: 'agent-session' } }
          : { statusCode: 401, body: { message: 'Unauthorized' } };
      };
      const { requests } = stubTransport($$.SANDBOX, [sfap]);
      const conn = await connect(org);
      // What the agents plugin does after exchanging the session for an SFAP token.
      conn.accessToken = SFAP_TOKEN;

      const result = await conn.request({ method: 'POST', url: SFAP_URL, body: '{}' }).catch((e: Error) => e);

      expect(getHeader(requests[0].headers, 'Authorization')).to.equal(`Bearer ${SFAP_TOKEN}`);
      expect(getHeader(requests[0].headers, 'DPoP'), 'the session key must not sign a foreign token').to.be.undefined;
      expect(result).to.deep.equal({ sessionId: 'agent-session' });
      expect(requests).to.have.length(1);
    });
  });
});
