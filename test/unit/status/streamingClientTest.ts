/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { spyMethod, stubMethod } from '@salesforce/ts-sinon';
import { expect } from 'chai';
import { SinonSpyCall } from 'sinon';
import { Duration } from '@salesforce/kit';
import { get, JsonMap } from '@salesforce/ts-types';
import { CometClient, StatusResult, StreamingClient } from '../../../src/status/streamingClient';
import { Connection } from '../../../src/org';
// import { Crypto } from '../../../src/crypto/crypto';
import { Org } from '../../../src/org/org';
import { SfError } from '../../../src/sfError';
import {
  MockTestOrgData,
  shouldThrow,
  StreamingMockCometClient,
  StreamingMockSubscriptionCall,
  testSetup,
} from '../../../src/testSetup';

const MOCK_API_VERSION = '43.0';
const MOCK_TOPIC = 'topic';

const $$ = testSetup();

describe('streaming client tests', () => {
  let username: string;

  beforeEach(async () => {
    const id = $$.uniqid();
    username = `${id}@test.com`;
    $$.stubAuths(new MockTestOrgData(id, { username }));

    stubMethod($$.SANDBOX, Connection.prototype, 'useLatestApiVersion').returns(Promise.resolve());
    stubMethod($$.SANDBOX, Connection.prototype, 'getApiVersion').returns(MOCK_API_VERSION);
  });

  it('should set options apiVersion on system topics', async () => {
    const org = await Org.create({ aliasOrUsername: username });
    const options: StreamingClient.Options = new StreamingClient.DefaultOptions(org, '/system/Logging', () => ({
      completed: true,
    }));
    expect(options.apiVersion).to.equal('36.0');
  });

  it('should complete successfully', async () => {
    const TEST_STRING = $$.uniqid();

    const org = await Org.create({ aliasOrUsername: username });

    const streamProcessor = (message: JsonMap): StatusResult => {
      if (message.id === TEST_STRING) {
        return {
          payload: TEST_STRING,
          completed: true,
        };
      } else {
        throw new SfError('unexpected message', 'UnexpectedMessage');
      }
    };

    const options = new StreamingClient.DefaultOptions(org, MOCK_TOPIC, streamProcessor);

    expect(options.apiVersion).to.equal(MOCK_API_VERSION);

    options.streamingImpl = {
      getCometClient: (url: string): CometClient => new StreamingMockCometClient({
          url,
          id: TEST_STRING,
          subscriptionCall: StreamingMockSubscriptionCall.CALLBACK,
        }),
      setLogger: () => {},
    };

    const asyncStatusClient = await StreamingClient.create(options);
    const value = await asyncStatusClient.subscribe(() => Promise.resolve());

    expect(value).to.be.equal(TEST_STRING);
  });

  describe('Faye options', () => {
    const streamProcessor = (): StatusResult => ({
        completed: true,
      });

    it('bogus apiVersion', async () => {
      const org = await Org.create({ aliasOrUsername: username });

      $$.SANDBOX.restore();
      $$.SANDBOX.stub(Connection.prototype, 'getApiVersion').returns('$$');

      try {
        await shouldThrow(Promise.resolve(new StreamingClient.DefaultOptions(org, MOCK_TOPIC, streamProcessor)));
      } catch (e) {
        expect(e).to.have.property('name', 'InvalidApiVersionError');
      }
    });
  });

  it('streamProcessor should throw an error', async () => {
    const TEST_STRING = $$.uniqid();

    const org = await Org.create({ aliasOrUsername: username });

    const streamProcessor = (message: JsonMap): StatusResult => {
      if (message.id === TEST_STRING) {
        throw new SfError('TEST_ERROR', 'TEST_ERROR');
      } else {
        throw new SfError('unexpected message', 'UnexpectedMessage');
      }
    };

    const options = new StreamingClient.DefaultOptions(org, MOCK_TOPIC, streamProcessor);

    options.streamingImpl = {
      getCometClient: (url: string) => new StreamingMockCometClient({
          url,
          id: TEST_STRING,
          subscriptionCall: StreamingMockSubscriptionCall.CALLBACK,
        }),
      setLogger: () => {},
    };

    const asyncStatusClient: StreamingClient = await StreamingClient.create(options);
    const disconnectSpy = spyMethod($$.SANDBOX, StreamingClient.prototype, 'disconnectClient');
    try {
      await shouldThrow(
        asyncStatusClient.subscribe(() => Promise.resolve())
      );
    } catch (e) {
      expect(e).to.have.property('name', 'TEST_ERROR');
      expect(disconnectSpy.called).to.be.true;
    }
  });

  it('subscribe error back', async () => {
    const TEST_STRING = $$.uniqid();

    const org = await Org.create({ aliasOrUsername: username });

    const streamProcessor = (message: JsonMap): StatusResult => {
      if (message.id === TEST_STRING) {
        return {
          payload: TEST_STRING,
          completed: true,
        };
      } else {
        throw new SfError('unexpected message', 'UnexpectedMessage');
      }
    };

    const options = new StreamingClient.DefaultOptions(org, MOCK_TOPIC, streamProcessor);

    options.streamingImpl = {
      getCometClient: (url: string) => new StreamingMockCometClient({
          url,
          id: TEST_STRING,
          subscriptionCall: StreamingMockSubscriptionCall.ERRORBACK,
          subscriptionErrbackError: new SfError('TEST ERROR', TEST_STRING),
        }),
      setLogger: () => {},
    };

    const disconnectSpy = spyMethod($$.SANDBOX, StreamingClient.prototype, 'disconnect');
    const asyncStatusClient: StreamingClient = await StreamingClient.create(options);
    expect(disconnectSpy.called).to.be.false;
    try {
      await shouldThrow(
        asyncStatusClient.subscribe(() => Promise.resolve())
      );
    } catch (e) {
      expect(e).to.have.property('name', TEST_STRING);
      expect(disconnectSpy.called).to.be.true;
    }
  });

  it('handshake should succeed', async () => {
    const TEST_STRING = $$.uniqid();

    const org = await Org.create({ aliasOrUsername: username });

    const streamProcessor = (message: JsonMap): StatusResult => {
      if (message.id === TEST_STRING) {
        return {
          payload: TEST_STRING,
          completed: true,
        };
      } else {
        throw new SfError('unexpected message', 'UnexpectedMessage');
      }
    };

    const options = new StreamingClient.DefaultOptions(org, MOCK_TOPIC, streamProcessor);

    options.streamingImpl = {
      getCometClient: (url: string) => new StreamingMockCometClient({
          url,
          id: TEST_STRING,
          subscriptionCall: StreamingMockSubscriptionCall.CALLBACK,
        }),
      setLogger: () => {},
    };

    const asyncStatusClient: StreamingClient = await StreamingClient.create(options);

    const result = await asyncStatusClient.handshake();
    expect(result).to.be.equal(StreamingClient.ConnectionState.CONNECTED);
  });

  it('handshake should timeout', async () => {
    const TEST_STRING = $$.uniqid();

    const org = await Org.create({ aliasOrUsername: username });

    const streamProcessor = (): StatusResult => ({ completed: false });

    const options = new StreamingClient.DefaultOptions(org, MOCK_TOPIC, streamProcessor);

    options.handshakeTimeout = Duration.milliseconds(1);

    options.streamingImpl = {
      getCometClient: (url: string) => new StreamingMockCometClient({
          url,
          id: TEST_STRING,
          subscriptionCall: StreamingMockSubscriptionCall.CALLBACK,
        }),
      setLogger: () => {},
    };

    const asyncStatusClient = await StreamingClient.create(options);

    try {
      await shouldThrow(asyncStatusClient.handshake());
    } catch (e) {
      expect(e.name).to.equal(StreamingClient.TimeoutErrorType.HANDSHAKE);
    }
  });

  it('subscribe should timeout', async () => {
    const TEST_STRING = $$.uniqid();

    const org = await Org.create({ aliasOrUsername: username });

    const streamProcessor = (): StatusResult => ({
        completed: false,
      });

    const options = new StreamingClient.DefaultOptions(org, MOCK_TOPIC, streamProcessor);

    options.subscribeTimeout = Duration.milliseconds(1);

    options.streamingImpl = {
      getCometClient: (url: string) => new StreamingMockCometClient({
          url,
          id: TEST_STRING,
          subscriptionCall: StreamingMockSubscriptionCall.CALLBACK,
        }),
      setLogger: () => {},
    };

    const asyncStatusClient: StreamingClient = await StreamingClient.create(options);
    try {
      await shouldThrow(
        asyncStatusClient.subscribe(async (): Promise<void> => Promise.resolve())
      );
    } catch (e) {
      expect(e.name).to.equal(StreamingClient.TimeoutErrorType.SUBSCRIBE);
    }
  });

  it('subscribe should timeout setTimeout spy', async () => {
    const JENNYS_NUMBER = 8675309;
    const GHOSTBUSTERS_NUMBER = 5552368;

    const setTimeoutSpy = spyMethod($$.SANDBOX, global, 'setTimeout');

    const TEST_STRING = $$.uniqid();

    const org = await Org.create({ aliasOrUsername: username });

    const streamProcessor = (): StatusResult => ({
        completed: true,
      });

    const options = new StreamingClient.DefaultOptions(org, MOCK_TOPIC, streamProcessor);

    options.subscribeTimeout = Duration.milliseconds(JENNYS_NUMBER); // Jenny's phone number
    options.handshakeTimeout = Duration.milliseconds(GHOSTBUSTERS_NUMBER); // Ghostbusters phone number

    options.streamingImpl = {
      getCometClient: (url: string) => new StreamingMockCometClient({
          url,
          id: TEST_STRING,
          subscriptionCall: StreamingMockSubscriptionCall.CALLBACK,
        }),
      setLogger: () => {},
    };

    const asyncStatusClient = await StreamingClient.create(options);
    await asyncStatusClient.subscribe(() => Promise.resolve());

    expect(setTimeoutSpy.called).to.be.true;
    // Subscribe should call setTimeout with Jenny's number
    expect(
      setTimeoutSpy.getCalls().filter((value: SinonSpyCall) => get(value, 'lastArg') === JENNYS_NUMBER)
    ).to.have.length(1);
    // Ensure setTimeout is not called with the handshake timeout.
    expect(
      setTimeoutSpy.getCalls().filter((value: SinonSpyCall) => get(value, 'lastArg') === GHOSTBUSTERS_NUMBER)
    ).to.have.length(0);
  });

  it('should throw a handshake error when the API version is incorrect', async () => {
    const context = {
      log: () => {},
      options: {
        apiVersion: MOCK_API_VERSION,
      },
    };
    const apiVersionErrorMsg = {
      channel: '/meta/handshake',
      error: "400::API version in the URI is mandatory. URI format: '/cometd/43.0'",
    };

    try {
      await shouldThrow(StreamingClient.prototype['incoming'].call(context, apiVersionErrorMsg, () => {}));
    } catch (e) {
      expect(e).to.have.property('name', 'HandshakeApiVersionError');
    }
  });

  describe('DefaultStreaming options', () => {
    let options: StreamingClient.DefaultOptions;

    beforeEach(async () => {
      const org = await Org.create({ aliasOrUsername: username });

      const streamProcessor = (): StatusResult => ({ completed: false });

      options = new StreamingClient.DefaultOptions(org, MOCK_TOPIC, streamProcessor);
    });

    it('setTimeout equal to default', async () => {
      options.setSubscribeTimeout(StreamingClient.DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT);
      options.setHandshakeTimeout(StreamingClient.DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT);

      expect(options.handshakeTimeout).to.be.equal(StreamingClient.DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT);
      expect(options.subscribeTimeout).to.be.equal(StreamingClient.DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT);
    });

    it('setTimeout greater than the default', async () => {
      const newSubscribeTime = Duration.milliseconds(
        StreamingClient.DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT.milliseconds + 1
      );
      const newHandshakeTime = Duration.milliseconds(
        StreamingClient.DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT.milliseconds + 1
      );
      options.setSubscribeTimeout(newSubscribeTime);
      options.setHandshakeTimeout(newHandshakeTime);
      expect(options.subscribeTimeout.milliseconds).to.be.equal(newSubscribeTime.milliseconds);
      expect(options.handshakeTimeout.milliseconds).to.be.equal(newHandshakeTime.milliseconds);
    });

    it('setTimeout less that the default', async () => {
      const newSubscribeTime = Duration.milliseconds(
        StreamingClient.DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT.milliseconds - 1
      );
      const newHandshakeTime = Duration.milliseconds(
        StreamingClient.DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT.milliseconds - 1
      );

      try {
        await shouldThrow(Promise.resolve(options.setSubscribeTimeout(newSubscribeTime)));
      } catch (e) {
        expect(e).to.have.property('name', 'WaitParamValidValueError');
      }

      try {
        await shouldThrow(Promise.resolve(options.setHandshakeTimeout(newHandshakeTime)));
      } catch (e) {
        expect(e).to.have.property('name', 'WaitParamValidValueError');
      }
    });
  });
});
