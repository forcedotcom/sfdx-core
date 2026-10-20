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
import { DpopKey } from '../../src/crypto/dpop';
import { AuthInfo } from '../../src/org/authInfo';
import { Connection } from '../../src/org/connection';
import * as determineOrgModule from '../../src/org/determineOrg';
import { MyDomainResolver } from '../../src/status/myDomainResolver';
import { TestContext } from '../../src/testSetup';
import {
  apexNodeExecuteAnonymousEnvelope,
  APEX_NS,
  FakeSalesforce,
  METADATA_NS,
  parseXml,
  SOAP_ENV_NS,
} from './dpopFakeSalesforce';
import {
  DpopMockOrg,
  FakeResponse,
  RecordedRequest,
  stubDpopKeyStore,
  stubTransport,
  urlIncludes,
} from './dpopTestHelpers';

const API_VERSION = '68.0';
const TOKEN = '00D000000000001!bound-access-token';
const INSTANCE = 'https://fake.my.salesforce.com';
const REST_URL = `${INSTANCE}/services/data/v${API_VERSION}/limits`;
const APEX_URL = `${INSTANCE}/services/Soap/s/${API_VERSION}/00D000000000001`;
const NONCE = 'server-nonce';
const APEX = 'System.debug(&apos;dpop probe&apos;);';

/** The apex-node envelope with an extra header inserted after its SessionHeader, as the live probe sent them. */
const apexEnvelopeWith = (extraHeader: string): string =>
  apexNodeExecuteAnonymousEnvelope(TOKEN, APEX).replace('</cmd:SessionHeader>', `</cmd:SessionHeader>${extraHeader}`);

const soapRequest = (body: string, headers: Record<string, string> = {}): RecordedRequest => ({
  method: 'POST',
  url: APEX_URL,
  headers: { 'content-type': 'text/xml', soapaction: 'executeAnonymous', ...headers },
  body,
});

describe('FakeSalesforce', () => {
  const $$ = new TestContext();
  let key: DpopKey;
  let otherKey: DpopKey;
  let fake: FakeSalesforce;

  beforeEach(async () => {
    stubDpopKeyStore($$.SANDBOX);
    key = await DpopKey.generate();
    otherKey = await DpopKey.generate();
    fake = new FakeSalesforce({ publicJwk: key.publicJwk, accessToken: () => TOKEN, nonce: () => NONCE });
  });

  const proof = (overrides: { method?: string; url?: string; accessToken?: string; nonce?: string } = {}): string =>
    key.createProof({ method: 'GET', url: REST_URL, accessToken: TOKEN, nonce: NONCE, ...overrides });

  const rest = (headers: Record<string, string>): RecordedRequest => ({ method: 'GET', url: REST_URL, headers });

  describe('REST', () => {
    it('accepts a DPoP-scheme token with a matching proof', () => {
      expect(fake.check(rest({ Authorization: `DPoP ${TOKEN}`, DPoP: proof() }))).to.be.undefined;
    });

    it('rejects the hand-built Bearer header plugins send today', () => {
      expect(fake.check(rest({ Authorization: `Bearer ${TOKEN}` }))).to.equal(
        'Authorization scheme is Bearer, not DPoP'
      );
    });

    it('rejects a DPoP-scheme token without a proof', () => {
      expect(fake.check(rest({ Authorization: `DPoP ${TOKEN}` }))).to.equal('no DPoP proof');
    });

    it('rejects a replayed proof', () => {
      const headers = { Authorization: `DPoP ${TOKEN}`, DPoP: proof() };
      expect(fake.check(rest(headers))).to.be.undefined;
      expect(fake.check(rest(headers))).to.equal('proof jti was replayed');
    });

    it('rejects a proof from another key', () => {
      const foreign = otherKey.createProof({ method: 'GET', url: REST_URL, accessToken: TOKEN, nonce: NONCE });
      expect(fake.check(rest({ Authorization: `DPoP ${TOKEN}`, DPoP: foreign }))).to.equal(
        'proof is signed by a key the token is not bound to'
      );
    });

    it('rejects a proof for another token, method, URL, or nonce', () => {
      const withProof = (dpop: string): RecordedRequest => rest({ Authorization: `DPoP ${TOKEN}`, DPoP: dpop });
      expect(fake.check(withProof(proof({ accessToken: 'other-token' })))).to.equal(
        'proof ath does not match the access token'
      );
      expect(fake.check(withProof(proof({ method: 'POST' })))).to.match(/^proof htm/);
      expect(fake.check(withProof(proof({ url: `${INSTANCE}/services/data` })))).to.match(/^proof htu/);
      expect(fake.check(withProof(proof({ nonce: 'stale' })))).to.equal(`proof nonce stale is not ${NONCE}`);
    });

    it('rejects an unknown token', () => {
      const other = key.createProof({ method: 'GET', url: REST_URL, accessToken: 'other', nonce: NONCE });
      expect(fake.check(rest({ Authorization: 'DPoP other', DPoP: other }))).to.equal('unknown access token');
    });
  });

  describe('Apex SOAP (the shapes the live probe sent)', () => {
    const soapProof = (): string =>
      key.createProof({ method: 'POST', url: APEX_URL, accessToken: TOKEN, nonce: NONCE });

    it('accepts the proof with the SessionHeader prefix', () => {
      const body = apexEnvelopeWith(`<cmd:DpopProofHeader><cmd:proof>${soapProof()}</cmd:proof></cmd:DpopProofHeader>`);
      expect(fake.check(soapRequest(body))).to.be.undefined;
    });

    it('accepts the proof with the SessionHeader namespace as its default namespace', () => {
      const body = apexEnvelopeWith(
        `<DpopProofHeader xmlns="${APEX_NS}"><proof>${soapProof()}</proof></DpopProofHeader>`
      );
      expect(fake.check(soapRequest(body))).to.be.undefined;
    });

    it('rejects the proof outside the SessionHeader namespace', () => {
      const body = apexEnvelopeWith(`<DpopProofHeader><proof>${soapProof()}</proof></DpopProofHeader>`);
      expect(fake.check(soapRequest(body))).to.equal(`no DpopProofHeader in the SessionHeader namespace (${APEX_NS})`);
    });

    it('rejects the proof sent only as HTTP headers', () => {
      const request = soapRequest(apexNodeExecuteAnonymousEnvelope(TOKEN, APEX), {
        Authorization: `DPoP ${TOKEN}`,
        DPoP: soapProof(),
      });
      expect(fake.check(request)).to.equal(`no DpopProofHeader in the SessionHeader namespace (${APEX_NS})`);
    });

    it('rejects an envelope without a proof', () => {
      expect(fake.check(soapRequest(apexNodeExecuteAnonymousEnvelope(TOKEN, APEX)))).to.match(/^no DpopProofHeader/);
    });
  });

  describe('what the transport already sends (verified live)', () => {
    let org: DpopMockOrg;
    let conn: Connection;
    let requests: RecordedRequest[];

    beforeEach(async () => {
      $$.SANDBOXES.CONNECTION.restore();
      $$.SANDBOX.stub(MyDomainResolver.prototype, 'resolve').resolves('1.1.1.1');
      stubMethod($$.SANDBOX, AuthInfo.prototype, 'determineIfDevHub').resolves(false);
      stubMethod($$.SANDBOX, determineOrgModule, 'determineOrg').resolves();
      org = new DpopMockOrg({ tokenType: 'DPoP', dpopKeyReference: key.keyReference, instanceApiVersion: API_VERSION });
      fake = new FakeSalesforce({ publicJwk: key.publicJwk, accessToken: () => org.accessToken });
      const describeResponse: FakeResponse = {
        statusCode: 200,
        headers: { 'content-type': 'text/xml' },
        body:
          `<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="${SOAP_ENV_NS}" xmlns="${METADATA_NS}">` +
          '<soapenv:Body><describeMetadataResponse><result><organizationNamespace></organizationNamespace>' +
          '</result></describeMetadataResponse></soapenv:Body></soapenv:Envelope>',
      };
      ({ requests } = stubTransport($$.SANDBOX, [
        urlIncludes(
          '/services/Soap/m/',
          fake.respond(() => describeResponse)
        ),
        urlIncludes('/services/data/', fake.respond()),
      ]));
      await $$.stubAuths(org);
      const authInfo = await AuthInfo.create({ username: org.username });
      conn = await Connection.create({ authInfo, connectionOptions: { version: API_VERSION } });
    });

    it('accepts REST requests', async () => {
      await conn.request(`${org.instanceUrl}/services/data/v${API_VERSION}/limits`);
      expect(fake.rejections).to.deep.equal([]);
    });

    it('accepts Metadata API SOAP requests', async () => {
      await conn.metadata.describe(API_VERSION);
      expect(fake.rejections).to.deep.equal([]);
      expect(requests).to.have.length(1);
    });
  });

  describe('parseXml', () => {
    it('resolves prefixed, default, and undeclared namespaces', () => {
      const [envelope] = parseXml(
        `<?xml version="1.0"?><a:E xmlns:a="urn:a" xmlns="urn:d"><b x='1'/><c xmlns=""><d/></c></a:E>`
      ).children;
      expect(envelope).to.include({ uri: 'urn:a', local: 'E' });
      expect(envelope.children.map((child) => child.uri)).to.deep.equal(['urn:d', undefined]);
      expect(envelope.children[1].children[0].uri).to.be.undefined;
    });

    it('rejects mismatched tags and unbound prefixes', () => {
      expect(() => parseXml('<a><b></a>')).to.throw('</a> closes <b>');
      expect(() => parseXml('<x:a/>')).to.throw('unbound prefix x');
    });
  });
});
