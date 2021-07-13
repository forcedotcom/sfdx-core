/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import * as sinon from 'sinon';

import { ensureJsonMap } from '@salesforce/ts-types';

import { Duration, sleep } from '@salesforce/kit';
import { StatusResult } from '../../../src/status/client';
import { PollingClient } from '../../../src/status/pollingClient';
import { shouldThrow } from '../../../src/testSetup';

function* generator(testName: string): IterableIterator<StatusResult> {
  yield { completed: false };
  yield { completed: false };
  yield { completed: false };
  yield { completed: false };
  yield { completed: false };
  yield { completed: false };
  yield { completed: false };
  yield { completed: false };
  yield { completed: false };
  yield { completed: false };
  yield { completed: false };
  yield {
    completed: true,
    payload: { name: testName },
  };
}

describe('clientTest', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('steel thread', async () => {
    const TEST_VALUE = 'foo';
    const pollingResultGenerator: IterableIterator<StatusResult> = generator(TEST_VALUE);
    const options: PollingClient.Options = {
      async poll(): Promise<StatusResult> {
        return Promise.resolve(pollingResultGenerator.next().value);
      },
      frequency: Duration.milliseconds(10),
      timeout: Duration.minutes(1),
    };
    const client: PollingClient = await PollingClient.create(options);

    const pollResult = ensureJsonMap(await client.subscribe());

    expect(pollResult.name).equals(TEST_VALUE);
  });

  it('should subscribeTimeout', async () => {
    let callCount = 0;
    const options: PollingClient.Options = {
      async poll() {
        callCount++;
        return Promise.resolve({ completed: false });
      },
      frequency: Duration.milliseconds(90),
      timeout: Duration.milliseconds(300),
    };

    const client = await PollingClient.create(options);
    try {
      await shouldThrow(client.subscribe());
    } catch (e) {
      expect(callCount).to.be.equal(4);
      expect(e).to.have.property('name', 'PollingClientTimeout');
    }
  });

  it('should error out', async () => {
    const TEST_VALUE = 'foo';
    let callCount = 0;
    const options: PollingClient.Options = {
      async poll() {
        callCount++;
        if (callCount === 2) {
          const error = new Error();
          error.name = TEST_VALUE;
          throw error;
        }
        return Promise.resolve({ completed: false });
      },
      frequency: Duration.milliseconds(90),
      timeout: Duration.milliseconds(400),
    };
    const client = await PollingClient.create(options);

    try {
      await shouldThrow(client.subscribe());
    } catch (e) {
      expect(callCount).to.be.equal(2);
      expect(e).to.have.property('name', TEST_VALUE);
    }
  });

  it('does not make calls before previous request completes', async () => {
    let callCount = 0;
    const options: PollingClient.Options = {
      async poll() {
        callCount++;
        await sleep(Duration.seconds(3)); // frequency is super-low, but polling function is slow to return.
        return Promise.resolve({ completed: false });
      },
      frequency: Duration.milliseconds(5),
      timeout: Duration.seconds(2),
    };
    const client = await PollingClient.create(options);
    try {
      await shouldThrow(client.subscribe());
    } catch (e) {
      expect(callCount).to.be.equal(1);
    }
  });
});
