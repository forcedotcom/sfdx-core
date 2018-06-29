import { PollingClient, PollingOptions } from '../../../lib/status/pollingClient';
import { StatusResult } from '../../../lib/status/client';
import { Time, TIME_UNIT } from '../../../lib/util/time';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { shouldThrow } from '../../testSetup';

interface TestType {
    name: string;
}

function* generator(testName: string): IterableIterator<StatusResult<TestType>> {
    yield {completed: false};
    yield {completed: false};
    yield {
        completed: true,
        payload: { name: testName }
    };
}

describe('clientTest', () => {

    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it ('steel thread', async () => {

        const TEST_VALUE = 'foo';
        const pollingResultGenerator: IterableIterator<StatusResult<TestType>> = generator(TEST_VALUE);
        const options: PollingOptions<TestType> = {
            async poll(): Promise<StatusResult<TestType>> {
                return Promise.resolve(pollingResultGenerator.next().value);
            },
            frequency: new Time(10, TIME_UNIT.MILLISECONDS),
            timeout: new Time(1, TIME_UNIT.MINUTES)
        };
        const client: PollingClient<TestType> = await PollingClient.init<TestType>(options);

        const pollResult: TestType = await client.subscribe();

        expect(pollResult.name).equals(TEST_VALUE);
    });

    it ('should subscribeTimeout', async () => {
        let callCount: number = 0;
        const options: PollingOptions<TestType> = {
            async poll() {
                callCount++;
                return Promise.resolve({completed: false});
            },
            frequency: new Time(90, TIME_UNIT.MILLISECONDS),
            timeout: new Time(300, TIME_UNIT.MILLISECONDS)
        };

        const client: PollingClient<TestType> = await PollingClient.init<TestType>(options);
        try {
            await shouldThrow(client.subscribe());
        } catch (e) {
            expect(callCount).to.be.equal(3);
            expect(e).to.have.property('name', 'ClientTimeout');
        }
    });

    it ('should error out', async () => {
        const TEST_VALUE = 'foo';
        let callCount: number = 0;
        const options: PollingOptions<TestType> = {
            async poll() {
                callCount++;
                if (callCount === 2) {
                    const error = new Error();
                    error.name = TEST_VALUE;
                    throw error;
                }
                return Promise.resolve({completed: false});
            },
            frequency: new Time(90, TIME_UNIT.MILLISECONDS),
            timeout: new Time(400, TIME_UNIT.MILLISECONDS)
        };
        const client: PollingClient<TestType> = await PollingClient.init<TestType>(options);
        try {
            await shouldThrow(client.subscribe());
        } catch (e) {
            expect(callCount).to.be.equal(2);
            expect(e).to.have.property('name', TEST_VALUE);
        }
    });
});
