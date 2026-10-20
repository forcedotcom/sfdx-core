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
import { createRequire } from 'node:module';
import { expect } from 'chai';
import { stubMethod } from '@salesforce/ts-sinon';
import { DpopKey } from '../../../src/crypto/dpop';
import { Connection } from '../../../src/org/connection';
import { Org } from '../../../src/org/org';
import { StreamingClient } from '../../../src/status/streamingClient';
import { MockTestOrgData, shouldThrow, TestContext } from '../../../src/testSetup';
import { DpopMockOrg, stubDpopKeyStore } from '../dpopTestHelpers';

const API_VERSION = '68.0';

type FayeDispatcher = { endpoint: unknown };
type FayeRequestParams = { method: string; headers: Record<string, string> };
type FayeNodeHttp = new (dispatcher: FayeDispatcher, endpoint: unknown) => {
  _buildParams(content: Buffer): FayeRequestParams;
};

// faye's own long-polling transport, to see the headers of the CometD requests it would send.
const NodeHttp = createRequire(__filename)('faye/src/transport/node_http') as FayeNodeHttp;

const nextRequest = (client: StreamingClient): FayeRequestParams => {
  // eslint-disable-next-line no-underscore-dangle
  const dispatcher = (client as unknown as { cometClient: { _dispatcher: FayeDispatcher } }).cometClient._dispatcher;
  // eslint-disable-next-line no-underscore-dangle
  return new NodeHttp(dispatcher, dispatcher.endpoint)._buildParams(Buffer.from('[]'));
};

/**
 * The Streaming API denies every handshake from a DPoP-bound session (`403::Handshake denied`, verified live with
 * every Authorization scheme and proof placement), and faye retries a denied handshake until the command times out.
 */
describe('StreamingClient DPoP', () => {
  const $$ = new TestContext();
  let dpopKey: DpopKey;

  beforeEach(async () => {
    stubDpopKeyStore($$.SANDBOX);
    dpopKey = await DpopKey.generate();
    stubMethod($$.SANDBOX, Connection.prototype, 'useLatestApiVersion').resolves();
    stubMethod($$.SANDBOX, Connection.prototype, 'getApiVersion').returns(API_VERSION);
    stubMethod($$.SANDBOX, Org.prototype, 'refreshAuth').resolves();
  });

  const createClient = async (mockOrg: MockTestOrgData): Promise<{ client: StreamingClient; conn: Connection }> => {
    await $$.stubAuths(mockOrg);
    const org = await Org.create({ aliasOrUsername: mockOrg.username });
    const client = await StreamingClient.create(
      new StreamingClient.DefaultOptions(org, 'topic', () => ({ completed: true }))
    );
    return { client, conn: org.getConnection() };
  };

  it('fails fast for a DPoP-bound session instead of retrying a denied handshake', async () => {
    const mockOrg = new DpopMockOrg({ tokenType: 'DPoP', dpopKeyReference: dpopKey.keyReference });

    try {
      await shouldThrow(createClient(mockOrg));
    } catch (e) {
      expect(e).to.have.property('name', 'DpopStreamingUnsupportedError');
      expect((e as Error).message).to.include(mockOrg.username);
    }
  });

  it('streams with a bearer token even when the authorization has a DPoP key', async () => {
    const mockOrg = new DpopMockOrg({ tokenType: 'Bearer', dpopKeyReference: dpopKey.keyReference });
    const { client, conn } = await createClient(mockOrg);

    const request = nextRequest(client);

    expect(request.headers.Authorization).to.equal(`OAuth ${conn.accessToken}`);
    expect(request.headers).to.not.have.property('DPoP');
  });

  it('streams with a bearer session', async () => {
    const { client, conn } = await createClient(new MockTestOrgData());

    expect(nextRequest(client).headers.Authorization).to.equal(`OAuth ${conn.accessToken}`);
  });
});
