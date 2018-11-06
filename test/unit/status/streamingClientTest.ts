/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { spyMethod, stubMethod } from '@salesforce/ts-sinon';
import { StatusResult } from '../../../src/status/client';
import {
    DefaultStreamingOptions,
    StreamingClient,
    StreamingConnectionState,
    StreamingOptions,
    StreamingTimeoutErrorType
} from '../../../src/status/streamingClient';

import { expect } from 'chai';
import { SinonSpyCall } from 'sinon';
import { Connection } from '../../../src/connection';
import { Crypto } from '../../../src/crypto';
import { Org } from '../../../src/org';
import { SfdxError } from '../../../src/sfdxError';
import { shouldThrow, StreamingMockCometClient, StreamingMockSubscriptionCall, testSetup } from '../../../src/testSetup';
import { Time, TIME_UNIT } from '../../../src/util/time';

import { get, JsonMap } from '@salesforce/ts-types';

const MOCK_API_VERSION: string = '43.0';
const MOCK_TOPIC: string = 'topic';

const $$ = testSetup();

describe('streaming client tests', () => {
    let _username: string;

    beforeEach(async () => {

        const _id: string = $$.uniqid();
        _username = `${_id}@test.com`;

        const crypto = await Crypto.create();

        $$.configStubs.AuthInfoConfig = { contents: {
                orgId: _id,
                username: _username,
                instanceUrl: 'http://www.example.com',
                accessToken: crypto.encrypt(_id)
            }
        };
        stubMethod($$.SANDBOX, Connection.prototype, 'useLatestApiVersion').returns(Promise.resolve());
        stubMethod($$.SANDBOX, Connection.prototype, 'getApiVersion').returns(MOCK_API_VERSION);
    });

    it ('should set options apiVersion on system topics', async () => {
        const org: Org = await Org.create({ aliasOrUsername: _username });
        const options: StreamingOptions<string> =
            new DefaultStreamingOptions(org, '/system/Logging', () => ({ completed: true }));
        expect(options.apiVersion).to.equal('36.0');
    });

    it ('should complete successfully', async () => {

        const TEST_STRING: string = $$.uniqid();

        const org: Org = await Org.create({ aliasOrUsername: _username });

        const streamProcessor = (message: JsonMap): StatusResult<string> => {
            if (message.id === TEST_STRING) {
                return {
                    payload: TEST_STRING,
                    completed: true
                };
            } else {
                throw new SfdxError('unexpected message', 'UnexpectedMessage');
            }
        };

        const options: StreamingOptions<string> =
            new DefaultStreamingOptions(org, MOCK_TOPIC, streamProcessor);

        expect(options.apiVersion).to.equal(MOCK_API_VERSION);

        options.streamingImpl = {
            getCometClient: (url: string) => {
                return new StreamingMockCometClient({ url, id: TEST_STRING,
                    subscriptionCall: StreamingMockSubscriptionCall.CALLBACK });
            },
            setLogger: () => {}
        };

        const asyncStatusClient: StreamingClient<string> = await StreamingClient.init(options);
        const value: string = await asyncStatusClient.subscribe(() => {
            return Promise.resolve();
        });

        expect(value).to.be.equal(TEST_STRING);
    });

    it ('streamProcessor should throw an error', async () => {

        const TEST_STRING: string = $$.uniqid();

        const org: Org = await Org.create({ aliasOrUsername: _username });

        const streamProcessor = (message: JsonMap): StatusResult<string> => {
            if (message.id === TEST_STRING) {
                throw new SfdxError('TEST_ERROR', 'TEST_ERROR');
            } else {
                throw new SfdxError('unexpected message', 'UnexpectedMessage');
            }
        };

        const options: StreamingOptions<string> =
            new DefaultStreamingOptions(org, MOCK_TOPIC, streamProcessor);

        options.streamingImpl = {
            getCometClient: (url: string) => {
                return new StreamingMockCometClient({url, id: TEST_STRING,
                    subscriptionCall: StreamingMockSubscriptionCall.CALLBACK});
            },
            setLogger: () => {}
        };

        const asyncStatusClient: StreamingClient<string> = await StreamingClient.init(options);
        try {
            await shouldThrow(asyncStatusClient.subscribe(() => {
                return Promise.resolve();
            }));
        } catch (e) {
            expect(e).to.have.property('name', 'TEST_ERROR');
        }
    });

    it ('subscribe error back', async () => {

        const TEST_STRING: string = $$.uniqid();

        const org: Org = await Org.create({ aliasOrUsername: _username });

        const streamProcessor = (message: JsonMap): StatusResult<string> => {
            if (message.id === TEST_STRING) {
                return {
                    payload: TEST_STRING,
                    completed: true
                };
            } else {
                throw new SfdxError('unexpected message', 'UnexpectedMessage');
            }
        };

        const options: StreamingOptions<string> =
            new DefaultStreamingOptions(org, MOCK_TOPIC, streamProcessor);

        options.streamingImpl = {
            getCometClient: (url: string) => {
                return new StreamingMockCometClient({url, id: TEST_STRING,
                    subscriptionCall: StreamingMockSubscriptionCall.ERRORBACK,
                    subscriptionErrbackError: new SfdxError('TEST ERROR', TEST_STRING)});
            },
            setLogger: () => {}
        };

        const asyncStatusClient: StreamingClient<string> = await StreamingClient.init(options);
        try {
            await shouldThrow(asyncStatusClient.subscribe(() => {
                return Promise.resolve();
            }));
        } catch (e) {
            expect(e).to.have.property('name', TEST_STRING);
        }
    });

    it ('handshake should succeed', async () => {
        const TEST_STRING: string = $$.uniqid();

        const org: Org = await Org.create({aliasOrUsername: _username });

        const streamProcessor = (message: JsonMap): StatusResult<string> => {
            if (message.id === TEST_STRING) {
                return {
                    payload: TEST_STRING,
                    completed: true
                };
            } else {
                throw new SfdxError('unexpected message', 'UnexpectedMessage');
            }
        };

        const options: StreamingOptions<string> =
            new DefaultStreamingOptions(org, MOCK_TOPIC, streamProcessor);

        options.streamingImpl = {
            getCometClient: (url: string) => {
                return new StreamingMockCometClient({url, id: TEST_STRING,
                    subscriptionCall: StreamingMockSubscriptionCall.CALLBACK});
            },
            setLogger: () => {}
        };

        const asyncStatusClient: StreamingClient<string> = await StreamingClient.init(options);

        const result: StreamingConnectionState = await asyncStatusClient.handshake();
        expect(result).to.be.equal(StreamingConnectionState.CONNECTED);
    });

    it ('handshake should timeout', async () => {
        const TEST_STRING: string = $$.uniqid();

        const org: Org = await Org.create({ aliasOrUsername: _username });

        const streamProcessor = (): StatusResult<string> => {
            return { completed: false };
        };

        const options: StreamingOptions<string> =
            new DefaultStreamingOptions(org, MOCK_TOPIC, streamProcessor);

        options.handshakeTimeout = new Time(1, TIME_UNIT.MILLISECONDS);

        options.streamingImpl = {
            getCometClient: (url: string) => {
                return new StreamingMockCometClient({url, id: TEST_STRING,
                    subscriptionCall: StreamingMockSubscriptionCall.CALLBACK});
            },
            setLogger: () => {}
        };

        const asyncStatusClient: StreamingClient<string> = await StreamingClient.init(options);

        try {
            await shouldThrow(asyncStatusClient.handshake());
        } catch (e) {
            expect(e.name).to.equal(StreamingTimeoutErrorType.HANDSHAKE);
        }
    });

    it ('subscribe should timeout', async () => {
        const TEST_STRING: string = $$.uniqid();

        const org: Org = await Org.create({ aliasOrUsername: _username });

        const streamProcessor = (): StatusResult<string> => {
            return {
                completed: false
            };
        };

        const options: StreamingOptions<string> =
            new DefaultStreamingOptions(org, MOCK_TOPIC, streamProcessor);

        options.subscribeTimeout = new Time(1, TIME_UNIT.MILLISECONDS);

        options.streamingImpl = {
            getCometClient: (url: string) => {
                return new StreamingMockCometClient({url, id: TEST_STRING,
                    subscriptionCall: StreamingMockSubscriptionCall.CALLBACK});
            },
            setLogger: () => {}
        };

        const asyncStatusClient: StreamingClient<string> = await StreamingClient.init(options);
        try {
            await shouldThrow(asyncStatusClient.subscribe( async (): Promise<void> => {
                return Promise.resolve();
            }));
        } catch (e) {
            expect(e.name).to.equal(StreamingTimeoutErrorType.SUBSCRIBE);
        }
    });

    it ('subscribe should timeout setTimeout spy', async () => {
        const JENNYS_NUMBER: number = 8675309;
        const GHOSTBUSTERS_NUMBER: number = 5552368;

        const setTimeoutSpy = spyMethod($$.SANDBOX, global, 'setTimeout');

        const TEST_STRING: string = $$.uniqid();

        const org: Org = await Org.create({ aliasOrUsername: _username });

        const streamProcessor = (): StatusResult<string> => {
            return {
                completed: true
            };
        };

        const options: StreamingOptions<string> =
            new DefaultStreamingOptions(org, MOCK_TOPIC, streamProcessor);

        options.subscribeTimeout = new Time(JENNYS_NUMBER, TIME_UNIT.MILLISECONDS); // Jenny's phone number
        options.handshakeTimeout = new Time(GHOSTBUSTERS_NUMBER, TIME_UNIT.MILLISECONDS); // Ghostbusters phone number

        options.streamingImpl = {
            getCometClient: (url: string) => {
                return new StreamingMockCometClient({url, id: TEST_STRING,
                    subscriptionCall: StreamingMockSubscriptionCall.CALLBACK});
            },
            setLogger: () => {}
        };

        const asyncStatusClient: StreamingClient<string> = await StreamingClient.init(options);
        await asyncStatusClient.subscribe(() => Promise.resolve());

        expect(setTimeoutSpy.called).to.be.true;
        // Subscribe should call setTimeout with Jenny's number
        expect(setTimeoutSpy.getCalls().filter((value: SinonSpyCall) =>
            get(value, 'lastArg') === JENNYS_NUMBER)).to.have.length(1);
        // Ensure setTimeout is not called with the handshake timeout.
        expect(setTimeoutSpy.getCalls().filter((value: SinonSpyCall) =>
            get(value, 'lastArg') === GHOSTBUSTERS_NUMBER)).to.have.length(0);
    });

    it ('should throw a handshake error when the API version is incorrect', async () => {
        const context = {
            log: () => {},
            options: {
                apiVersion: MOCK_API_VERSION
            }
        };
        const apiVersionErrorMsg = {
            channel: '/meta/handshake',
            error: '400::API version in the URI is mandatory. URI format: \'/cometd/43.0\''
        };

        try {
            await shouldThrow(StreamingClient.prototype['incoming'].call(context, apiVersionErrorMsg, () => {}));
        } catch (e) {
            expect(e).to.have.property('name', 'handshakeApiVersionError');
        }
    });

    describe('DefaultStreaming options', () => {
        let options: DefaultStreamingOptions<string>;

        beforeEach(async () => {
            const org: Org = await Org.create({ aliasOrUsername: _username });

            const streamProcessor = (): StatusResult<string> => {
                return { completed: false };
            };

            options = new DefaultStreamingOptions(org, MOCK_TOPIC, streamProcessor);
        });

        it('setTimeout equal to default', async () => {

            options.setSubscribeTimeout(DefaultStreamingOptions.DEFAULT_SUBSCRIBE_TIMEOUT);
            options.setHandshakeTimeout(DefaultStreamingOptions.DEFAULT_HANDSHAKE_TIMEOUT);

            expect(options.handshakeTimeout).to.be.equal(DefaultStreamingOptions.DEFAULT_HANDSHAKE_TIMEOUT);
            expect(options.subscribeTimeout).to.be.equal(DefaultStreamingOptions.DEFAULT_SUBSCRIBE_TIMEOUT);
        });

        it('setTimeout greater than the default', async () => {
            const newSubscribeTime: Time =
                new Time((DefaultStreamingOptions.DEFAULT_SUBSCRIBE_TIMEOUT.milliseconds + 1), TIME_UNIT.MILLISECONDS);
            const newHandshakeTime: Time =
                new Time((DefaultStreamingOptions.DEFAULT_HANDSHAKE_TIMEOUT.milliseconds + 1), TIME_UNIT.MILLISECONDS);
            options.setSubscribeTimeout(newSubscribeTime);
            options.setHandshakeTimeout(newHandshakeTime);
            expect(options.subscribeTimeout.milliseconds).to.be.equal(newSubscribeTime.milliseconds);
            expect(options.handshakeTimeout.milliseconds).to.be.equal(newHandshakeTime.milliseconds);
        });

        it('setTimeout less that the default', async () => {
            const newSubscribeTime: Time =
                new Time((DefaultStreamingOptions.DEFAULT_SUBSCRIBE_TIMEOUT.milliseconds - 1), TIME_UNIT.MILLISECONDS);
            const newHandshakeTime: Time =
                new Time((DefaultStreamingOptions.DEFAULT_HANDSHAKE_TIMEOUT.milliseconds - 1), TIME_UNIT.MILLISECONDS);

            try {
                await shouldThrow(Promise.resolve(options.setSubscribeTimeout(newSubscribeTime)));
            } catch (e) {
                expect(e).to.have.property('name', 'waitParamValidValueError');
            }

            try {
                await shouldThrow(Promise.resolve(options.setHandshakeTimeout(newHandshakeTime)));
            } catch (e) {
                expect(e).to.have.property('name', 'waitParamValidValueError');
            }
        });
    });
});
