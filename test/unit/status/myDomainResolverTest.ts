/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Duration } from '@salesforce/kit';
import { AnyFunction } from '@salesforce/ts-types';
import { expect } from 'chai';
import * as dns from 'dns';
import { URL } from 'url';
import { MyDomainResolver } from '../../../src/status/myDomainResolver';
import { testSetup } from '../../../src/testSetup';
import { shouldThrow } from '../../../src/testSetup';

const $$ = testSetup();

describe('myDomainResolver', () => {
  const POSITIVE_HOST = 'mydomainresolvertest.com';
  const NEGATIVE_HOST = 'mydomainresolvertest2.com';
  const TEST_IP = '1.1.1.1';
  const CALL_COUNT = 3;

  let lookupAsyncSpy: { callCount: number };
  beforeEach(() => {
    lookupAsyncSpy = $$.SANDBOX.stub(dns, 'lookup').callsFake((host: string, callback: AnyFunction) => {
      const isDefaultHost = host === MyDomainResolver.DEFAULT_DOMAIN.host;
      const isPositiveComplete = host === POSITIVE_HOST && lookupAsyncSpy.callCount === CALL_COUNT;
      if (isDefaultHost || isPositiveComplete) {
        callback(null, { address: TEST_IP });
      } else {
        callback(new Error());
      }
    });
  });

  it('should resolve', async () => {
    const options: MyDomainResolver.Options = {
      url: new URL(`http://${POSITIVE_HOST}`),
      timeout: Duration.milliseconds(50),
      frequency: Duration.milliseconds(10)
    };
    const resolver: MyDomainResolver = await MyDomainResolver.create(options);
    const ip = await resolver.resolve();
    expect(ip).to.be.equal(TEST_IP);
    expect(lookupAsyncSpy.callCount).to.be.equal(CALL_COUNT);
  });

  it('should resolve with defaults', async () => {
    const resolver: MyDomainResolver = await MyDomainResolver.create();
    const ip = await resolver.resolve();
    expect(ip).to.be.equal(TEST_IP);
    expect(lookupAsyncSpy.callCount).to.be.equal(1);
  });

  it('should resolve localhost', async () => {
    const options: MyDomainResolver.Options = {
      url: new URL('http://ghostbusters.internal.salesforce.com'),
      timeout: Duration.milliseconds(50),
      frequency: Duration.milliseconds(10)
    };
    const resolver: MyDomainResolver = await MyDomainResolver.create(options);
    const ip = await resolver.resolve();
    expect(ip).to.be.equal('127.0.0.1');
    expect(lookupAsyncSpy.callCount).to.be.equal(0);
  });

  it('should timeout', async () => {
    const options: MyDomainResolver.Options = {
      url: new URL(`https://${NEGATIVE_HOST}`),
      timeout: Duration.milliseconds(50),
      frequency: Duration.milliseconds(10)
    };
    const resolver: MyDomainResolver = await MyDomainResolver.create(options);
    try {
      await shouldThrow(resolver.resolve());
    } catch (e) {
      expect(e.name).to.equal('MyDomainResolverTimeoutError');
    }
  });
});
