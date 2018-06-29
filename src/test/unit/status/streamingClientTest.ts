import { StatusResult } from '../../../lib/status/client';
import {
    DefaultStreamingOptions,
    StreamingClient,
    StreamingConnectionState,
    StreamingTimeoutError,
    StreamingOptions
} from '../../../lib/status/streamingClient';

import { Org } from '../../../lib/org';
import { Connection } from '../../../lib/connection';
import { shouldThrow, StreamingMockCometClient, StreamingMockSubscriptionCall, testSetup } from '../../testSetup';
import { expect } from 'chai';
import { Crypto } from '../../../lib/crypto';
import { SfdxError } from '../../../lib/sfdxError';
import { Time, TIME_UNIT } from '../../../lib/util/time';

const MOCK_API_VERSION: string = '43.0';
const MOCK_TOPIC: string = 'topic';

const $$ = testSetup();

describe('streaming client tests', () => {
    let _username: string;

    beforeEach(async () => {

        const _id: string = $$.uniqid();
        _username = `${_id}@test.com`;

        const crypto = await Crypto.create();

        $$.configStubs['AuthInfoConfig'] = { contents: {
                orgId: _id,
                username: _username,
                instanceUrl: 'http://www.example.com',
                accessToken: crypto.encrypt(_id)
            }
        };
        $$.SANDBOX.stub(Connection.prototype, 'useLatestApiVersion').returns(Promise.resolve());
    });

    it ('should complete successfully', async () => {

        const TEST_STRING: string = $$.uniqid();

        const org: Org = await Org.create(_username);

        const streamProcessor = (message): StatusResult<string> => {
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
            new DefaultStreamingOptions(org, MOCK_API_VERSION,
            MOCK_TOPIC, streamProcessor);

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

        const org: Org = await Org.create(_username);

        const streamProcessor = (message): StatusResult<string> => {
            if (message.id === TEST_STRING) {
                throw new SfdxError('TEST_ERROR', 'TEST_ERROR');
            } else {
                throw new SfdxError('unexpected message', 'UnexpectedMessage');
            }
        };

        const options: StreamingOptions<string> =
            new DefaultStreamingOptions(org, MOCK_API_VERSION,
                MOCK_TOPIC, streamProcessor);

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

        const org: Org = await Org.create(_username);

        const streamProcessor = (message): StatusResult<string> => {
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
            new DefaultStreamingOptions(org, MOCK_API_VERSION,
                MOCK_TOPIC, streamProcessor);

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

        const org: Org = await Org.create(_username);

        const streamProcessor = (message): StatusResult<string> => {
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
            new DefaultStreamingOptions(org, MOCK_API_VERSION,
                MOCK_TOPIC, streamProcessor);

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

        const org: Org = await Org.create(_username);

        const streamProcessor = (): StatusResult<string> => {
            return { completed: false };
        };

        const options: StreamingOptions<string> =
            new DefaultStreamingOptions(org, MOCK_API_VERSION,
                MOCK_TOPIC, streamProcessor);

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
            expect(e).to.have.property('name', StreamingTimeoutError.HANDSHAKE);
        }
    });

    it ('subscribe should timeout', async () => {
        const TEST_STRING: string = $$.uniqid();

        const org: Org = await Org.create(_username);

        const streamProcessor = (): StatusResult<string> => {
            return {
                completed: false
            };
        };

        const options: StreamingOptions<string> =
            new DefaultStreamingOptions(org, MOCK_API_VERSION,
                MOCK_TOPIC, streamProcessor);

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
            await shouldThrow(asyncStatusClient.subscribe( async () => {
                return Promise.resolve();
            }));
        } catch (e) {
            expect(e).to.have.property('name', StreamingTimeoutError.SUBSCRIBE);
        }
    });

    describe('DefaultStreaming options', () => {
        let options: DefaultStreamingOptions<string>;

        beforeEach(async () => {
            const org: Org = await Org.create(_username);

            const streamProcessor = (): StatusResult<string> => {
                return { completed: false };
            };

            options = new DefaultStreamingOptions(org, MOCK_API_VERSION, MOCK_TOPIC, streamProcessor);
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
                await shouldThrowAsync(Promise.resolve(options.setSubscribeTimeout(newSubscribeTime)));
            } catch (e) {
                expect(e).to.have.property('name', 'waitParamValidValueError');
            }

            try {
                await shouldThrowAsync(Promise.resolve(options.setHandshakeTimeout(newHandshakeTime)));
            } catch (e) {
                expect(e).to.have.property('name', 'waitParamValidValueError');
            }
        });
    });
});
