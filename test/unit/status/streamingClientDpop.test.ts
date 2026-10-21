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
import { DpopKey } from '../../../src/crypto/dpop';
import { Connection } from '../../../src/org/connection';
import { Org } from '../../../src/org/org';
import { CometClient, StreamingClient } from '../../../src/status/streamingClient';
import { MockTestOrgData, shouldThrow, TestContext } from '../../../src/testSetup';
import { DpopMockOrg, stubDpopKeyStore } from '../dpopTestHelpers';

const API_VERSION = '68.0';

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

  /** Creates a client over a comet client that records the headers it is given. */
  const createClient = async (
    mockOrg: MockTestOrgData
  ): Promise<{ headers: Record<string, string>; conn: Connection }> => {
    const headers: Record<string, string> = {};
    const cometClient = {
      addExtension: () => {},
      disable: () => {},
      handshake: () => {},
      setHeader: (name: string, value: string) => {
        headers[name] = value;
      },
      subscribe: () => {},
      disconnect: () => {},
      on: () => {},
    } as unknown as CometClient;
    await $$.stubAuths(mockOrg);
    const org = await Org.create({ aliasOrUsername: mockOrg.username });
    const options = new StreamingClient.DefaultOptions(org, 'topic', () => ({ completed: true }));
    options.streamingImpl = { getCometClient: () => cometClient, setLogger: () => {} };
    await StreamingClient.create(options);
    return { headers, conn: org.getConnection() };
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
    const { headers, conn } = await createClient(mockOrg);

    expect(headers).to.deep.equal({ Authorization: `OAuth ${conn.accessToken}` });
  });

  it('streams with a bearer session', async () => {
    const { headers, conn } = await createClient(new MockTestOrgData());

    expect(headers).to.deep.equal({ Authorization: `OAuth ${conn.accessToken}` });
  });
});
