/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import * as sinon from 'sinon';

import { ensureJsonMap } from '@salesforce/ts-types';

import { Duration } from '@salesforce/kit';
import { StatusResult } from '../../../src/status/client';
import { PollingClient } from '../../../src/status/pollingClient';
import { shouldThrow } from '../../../src/testSetup';

function* generator(testName: string): IterableIterator<StatusResult> {
  yield { completed: false };
  yield { completed: false };
  yield {
    completed: true,
    payload: { name: testName }
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
      timeout: Duration.minutes(1)
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
      timeout: Duration.milliseconds(300)
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
      timeout: Duration.milliseconds(400)
    };
    const client = await PollingClient.create(options);

    try {
      await shouldThrow(client.subscribe());
    } catch (e) {
      expect(callCount).to.be.equal(2);
      expect(e).to.have.property('name', TEST_VALUE);
    }
  });
});
