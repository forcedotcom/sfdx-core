/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { spyMethod, stubMethod } from '@salesforce/ts-sinon';
import { expect } from 'chai';
import { SinonSpyCall } from 'sinon';
import { Duration, Env } from '@salesforce/kit';
import { get, JsonMap } from '@salesforce/ts-types';
import * as Faye from 'sfdx-faye';
import { StatusResult } from '../../../src/status/client';
import { CometClient, StreamingClient } from '../../../src/status/streamingClient';

import { Connection } from '../../../src/org/connection';
import { Crypto } from '../../../src/crypto/crypto';
import { Org } from '../../../src/org/org';
import { SfdxError } from '../../../src/sfdxError';
import {
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
    const id: string = $$.uniqid();
    username = `${id}@test.com`;

    const crypto = await Crypto.create();

    $$.configStubs.GlobalInfo = {
      contents: {
        orgs: {
          [username]: {
            orgId: id,
            username,
            instanceUrl: 'http://www.example.com',
            accessToken: crypto.encrypt(id),
          },
        },
      },
    };
    stubMethod($$.SANDBOX, Connection.prototype, 'useLatestApiVersion').returns(Promise.resolve());
    stubMethod($$.SANDBOX, Connection.prototype, 'getApiVersion').returns(MOCK_API_VERSION);
  });

  it('should set options apiVersion on system topics', async () => {
    const org: Org = await Org.create({ aliasOrUsername: username });
    const options: StreamingClient.Options = new StreamingClient.DefaultOptions(org, '/system/Logging', () => ({
      completed: true,
    }));
    expect(options.apiVersion).to.equal('36.0');
  });

  it('should complete successfully', async () => {
    const TEST_STRING: string = $$.uniqid();

    const org: Org = await Org.create({ aliasOrUsername: username });

    const streamProcessor = (message: JsonMap): StatusResult => {
      if (message.id === TEST_STRING) {
        return {
          payload: TEST_STRING,
          completed: true,
        };
      } else {
        throw new SfdxError('unexpected message', 'UnexpectedMessage');
      }
    };

    const options: StreamingClient.Options = new StreamingClient.DefaultOptions(org, MOCK_TOPIC, streamProcessor);

    expect(options.apiVersion).to.equal(MOCK_API_VERSION);

    options.streamingImpl = {
      getCometClient: (url: string): CometClient => {
        return new StreamingMockCometClient({
          url,
          id: TEST_STRING,
          subscriptionCall: StreamingMockSubscriptionCall.CALLBACK,
        });
      },
      setLogger: () => {},
    };

    const asyncStatusClient: StreamingClient = await StreamingClient.create(options);
    const value = await asyncStatusClient.subscribe(() => {
      return Promise.resolve();
    });

    expect(value).to.be.equal(TEST_STRING);
  });

  describe('Faye options', () => {
    const streamProcessor = (): StatusResult => {
      return {
        completed: true,
      };
    };

    let env: Env;

    beforeEach(() => {
      env = new Env({});
    });

    function getStub(org: Org): sinon.SinonStub {
      const stub = $$.SANDBOX.stub(Faye, 'Client');

      const options: StreamingClient.Options = new StreamingClient.DefaultOptions(
        org,
        MOCK_TOPIC,
        streamProcessor,
        env
      );

      options.streamingImpl.getCometClient('http://example.com');
      return stub;
    }

    it('expect default options', async () => {
      const org: Org = await Org.create({ aliasOrUsername: username });
      const stub = getStub(org);

      expect(stub.args[0]).to.not.be.undefined;
      expect(stub.args[0]).to.have.length(2);
      const clientOptions = stub.args[0][1];
      expect(clientOptions).to.have.property('cookiesAllowAllPaths', true);
      expect(clientOptions).to.have.property('enableRequestResponseLogging', false);
    });

    it('set enableRequestResponseLogging', async () => {
      env.setBoolean(StreamingClient.DefaultOptions.SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING, true);

      const org: Org = await Org.create({ aliasOrUsername: username });
      const stub = getStub(org);

      expect(stub.args[0]).to.not.be.undefined;
      expect(stub.args[0]).to.have.length(2);

      const clientOptions = stub.args[0][1];
      expect(clientOptions).to.have.property('enableRequestResponseLogging', true);
    });

    it('unset cookiesAllowAllPaths', async () => {
      env.setBoolean(StreamingClient.DefaultOptions.SFDX_ENABLE_FAYE_COOKIES_ALLOW_ALL_PATHS, true);

      const org: Org = await Org.create({ aliasOrUsername: username });
      const stub = getStub(org);

      expect(stub.args[0]).to.not.be.undefined;
      expect(stub.args[0]).to.have.length(2);

      const clientOptions = stub.args[0][1];
      expect(clientOptions).to.have.property('cookiesAllowAllPaths', true);
    });

    it('bogus apiVersion', async () => {
      const org: Org = await Org.create({ aliasOrUsername: username });

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
    const TEST_STRING: string = $$.uniqid();

    const org: Org = await Org.create({ aliasOrUsername: username });

    const streamProcessor = (message: JsonMap): StatusResult => {
      if (message.id === TEST_STRING) {
        throw new SfdxError('TEST_ERROR', 'TEST_ERROR');
      } else {
        throw new SfdxError('unexpected message', 'UnexpectedMessage');
      }
    };

    const options: StreamingClient.Options = new StreamingClient.DefaultOptions(org, MOCK_TOPIC, streamProcessor);

    options.streamingImpl = {
      getCometClient: (url: string) => {
        return new StreamingMockCometClient({
          url,
          id: TEST_STRING,
          subscriptionCall: StreamingMockSubscriptionCall.CALLBACK,
        });
      },
      setLogger: () => {},
    };

    const asyncStatusClient: StreamingClient = await StreamingClient.create(options);
    const disconnectSpy = spyMethod($$.SANDBOX, StreamingClient.prototype, 'disconnectClient');
    try {
      await shouldThrow(
        asyncStatusClient.subscribe(() => {
          return Promise.resolve();
        })
      );
    } catch (e) {
      expect(e).to.have.property('name', 'TEST_ERROR');
      expect(disconnectSpy.called).to.be.true;
    }
  });

  it('subscribe error back', async () => {
    const TEST_STRING: string = $$.uniqid();

    const org: Org = await Org.create({ aliasOrUsername: username });

    const streamProcessor = (message: JsonMap): StatusResult => {
      if (message.id === TEST_STRING) {
        return {
          payload: TEST_STRING,
          completed: true,
        };
      } else {
        throw new SfdxError('unexpected message', 'UnexpectedMessage');
      }
    };

    const options: StreamingClient.Options = new StreamingClient.DefaultOptions(org, MOCK_TOPIC, streamProcessor);

    options.streamingImpl = {
      getCometClient: (url: string) => {
        return new StreamingMockCometClient({
          url,
          id: TEST_STRING,
          subscriptionCall: StreamingMockSubscriptionCall.ERRORBACK,
          subscriptionErrbackError: new SfdxError('TEST ERROR', TEST_STRING),
        });
      },
      setLogger: () => {},
    };

    const disconnectSpy = spyMethod($$.SANDBOX, StreamingClient.prototype, 'disconnect');
    const asyncStatusClient: StreamingClient = await StreamingClient.create(options);
    expect(disconnectSpy.called).to.be.false;
    try {
      await shouldThrow(
        asyncStatusClient.subscribe(() => {
          return Promise.resolve();
        })
      );
    } catch (e) {
      expect(e).to.have.property('name', TEST_STRING);
      expect(disconnectSpy.called).to.be.true;
    }
  });

  it('handshake should succeed', async () => {
    const TEST_STRING: string = $$.uniqid();

    const org: Org = await Org.create({ aliasOrUsername: username });

    const streamProcessor = (message: JsonMap): StatusResult => {
      if (message.id === TEST_STRING) {
        return {
          payload: TEST_STRING,
          completed: true,
        };
      } else {
        throw new SfdxError('unexpected message', 'UnexpectedMessage');
      }
    };

    const options: StreamingClient.Options = new StreamingClient.DefaultOptions(org, MOCK_TOPIC, streamProcessor);

    options.streamingImpl = {
      getCometClient: (url: string) => {
        return new StreamingMockCometClient({
          url,
          id: TEST_STRING,
          subscriptionCall: StreamingMockSubscriptionCall.CALLBACK,
        });
      },
      setLogger: () => {},
    };

    const asyncStatusClient: StreamingClient = await StreamingClient.create(options);

    const result = await asyncStatusClient.handshake();
    expect(result).to.be.equal(StreamingClient.ConnectionState.CONNECTED);
  });

  it('handshake should timeout', async () => {
    const TEST_STRING: string = $$.uniqid();

    const org: Org = await Org.create({ aliasOrUsername: username });

    const streamProcessor = (): StatusResult => {
      return { completed: false };
    };

    const options: StreamingClient.Options = new StreamingClient.DefaultOptions(org, MOCK_TOPIC, streamProcessor);

    options.handshakeTimeout = Duration.milliseconds(1);

    options.streamingImpl = {
      getCometClient: (url: string) => {
        return new StreamingMockCometClient({
          url,
          id: TEST_STRING,
          subscriptionCall: StreamingMockSubscriptionCall.CALLBACK,
        });
      },
      setLogger: () => {},
    };

    const asyncStatusClient: StreamingClient = await StreamingClient.create(options);

    try {
      await shouldThrow(asyncStatusClient.handshake());
    } catch (e) {
      expect(e.name).to.equal(StreamingClient.TimeoutErrorType.HANDSHAKE);
    }
  });

  it('subscribe should timeout', async () => {
    const TEST_STRING: string = $$.uniqid();

    const org: Org = await Org.create({ aliasOrUsername: username });

    const streamProcessor = (): StatusResult => {
      return {
        completed: false,
      };
    };

    const options: StreamingClient.Options = new StreamingClient.DefaultOptions(org, MOCK_TOPIC, streamProcessor);

    options.subscribeTimeout = Duration.milliseconds(1);

    options.streamingImpl = {
      getCometClient: (url: string) => {
        return new StreamingMockCometClient({
          url,
          id: TEST_STRING,
          subscriptionCall: StreamingMockSubscriptionCall.CALLBACK,
        });
      },
      setLogger: () => {},
    };

    const asyncStatusClient: StreamingClient = await StreamingClient.create(options);
    try {
      await shouldThrow(
        asyncStatusClient.subscribe(async (): Promise<void> => {
          return Promise.resolve();
        })
      );
    } catch (e) {
      expect(e.name).to.equal(StreamingClient.TimeoutErrorType.SUBSCRIBE);
    }
  });

  it('subscribe should timeout setTimeout spy', async () => {
    const JENNYS_NUMBER = 8675309;
    const GHOSTBUSTERS_NUMBER = 5552368;

    const setTimeoutSpy = spyMethod($$.SANDBOX, global, 'setTimeout');

    const TEST_STRING: string = $$.uniqid();

    const org: Org = await Org.create({ aliasOrUsername: username });

    const streamProcessor = (): StatusResult => {
      return {
        completed: true,
      };
    };

    const options: StreamingClient.Options = new StreamingClient.DefaultOptions(org, MOCK_TOPIC, streamProcessor);

    options.subscribeTimeout = Duration.milliseconds(JENNYS_NUMBER); // Jenny's phone number
    options.handshakeTimeout = Duration.milliseconds(GHOSTBUSTERS_NUMBER); // Ghostbusters phone number

    options.streamingImpl = {
      getCometClient: (url: string) => {
        return new StreamingMockCometClient({
          url,
          id: TEST_STRING,
          subscriptionCall: StreamingMockSubscriptionCall.CALLBACK,
        });
      },
      setLogger: () => {},
    };

    const asyncStatusClient: StreamingClient = await StreamingClient.create(options);
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
      const org: Org = await Org.create({ aliasOrUsername: username });

      const streamProcessor = (): StatusResult => {
        return { completed: false };
      };

      options = new StreamingClient.DefaultOptions(org, MOCK_TOPIC, streamProcessor);
    });

    it('setTimeout equal to default', async () => {
      options.setSubscribeTimeout(StreamingClient.DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT);
      options.setHandshakeTimeout(StreamingClient.DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT);

      expect(options.handshakeTimeout).to.be.equal(StreamingClient.DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT);
      expect(options.subscribeTimeout).to.be.equal(StreamingClient.DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT);
    });

    it('setTimeout greater than the default', async () => {
      const newSubscribeTime: Duration = Duration.milliseconds(
        StreamingClient.DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT.milliseconds + 1
      );
      const newHandshakeTime: Duration = Duration.milliseconds(
        StreamingClient.DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT.milliseconds + 1
      );
      options.setSubscribeTimeout(newSubscribeTime);
      options.setHandshakeTimeout(newHandshakeTime);
      expect(options.subscribeTimeout.milliseconds).to.be.equal(newSubscribeTime.milliseconds);
      expect(options.handshakeTimeout.milliseconds).to.be.equal(newHandshakeTime.milliseconds);
    });

    it('setTimeout less that the default', async () => {
      const newSubscribeTime: Duration = Duration.milliseconds(
        StreamingClient.DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT.milliseconds - 1
      );
      const newHandshakeTime: Duration = Duration.milliseconds(
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
