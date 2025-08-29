/*
 * Copyright 2025, Salesforce, Inc.
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
import dns from 'node:dns';
import { URL } from 'node:url';
import { Duration, Env } from '@salesforce/kit';
import { AnyFunction } from '@salesforce/ts-types';
import { expect } from 'chai';
import { MyDomainResolver } from '../../../src/status/myDomainResolver';
import { TestContext } from '../../../src/testSetup';
import { shouldThrow } from '../../../src/testSetup';

describe('myDomainResolver', () => {
  const $$ = new TestContext();
  const POSITIVE_HOST = 'mydomainresolvertest.com';
  const NEGATIVE_HOST = 'mydomainresolvertest2.com';
  const TEST_IP = '1.1.1.1';
  const CALL_COUNT = 3;

  let lookupAsyncSpy: sinon.SinonStub;

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
      frequency: Duration.milliseconds(10),
    };
    const resolver: MyDomainResolver = await MyDomainResolver.create(options);
    const ip = await resolver.resolve();
    expect(ip).to.be.equal(TEST_IP);
    expect(lookupAsyncSpy.callCount).to.be.equal(CALL_COUNT);
  });

  it('should do lookup without port', async () => {
    const options: MyDomainResolver.Options = {
      url: new URL(`https://${POSITIVE_HOST}:6101`),
    };
    const resolver: MyDomainResolver = await MyDomainResolver.create(options);
    const ip = await resolver.resolve();
    expect(ip).to.be.equal(TEST_IP);
    // verify that it uses hostname (without port) not host
    expect(lookupAsyncSpy.args[0][0]).to.be.equal(POSITIVE_HOST);
  });

  describe('disable dns check', () => {
    const env = new Env();
    it('should return host if SFDX_DISABLE_DNS_CHECK is set to true', async () => {
      expect(env.getBoolean('SFDX_DISABLE_DNS_CHECK')).to.be.false;
      expect(env.getBoolean('SF_DISABLE_DNS_CHECK')).to.be.false;
      env.setBoolean('SFDX_DISABLE_DNS_CHECK', true);
      expect(env.getBoolean('SFDX_DISABLE_DNS_CHECK')).to.be.true;
      expect(env.getBoolean('SF_DISABLE_DNS_CHECK')).to.be.false;
      const options: MyDomainResolver.Options = {
        url: new URL(`http://${POSITIVE_HOST}`),
        timeout: Duration.milliseconds(50),
        frequency: Duration.milliseconds(10),
      };
      const resolver: MyDomainResolver = await MyDomainResolver.create(options);
      const ip = await resolver.resolve();
      expect(ip).to.be.equal(POSITIVE_HOST);
      expect(lookupAsyncSpy.callCount).to.be.equal(0);
      env.unset('SFDX_DISABLE_DNS_CHECK');
      env.unset('SF_DISABLE_DNS_CHECK');
    });

    it('should return host if SF_DISABLE_DNS_CHECK is set to true', async () => {
      expect(env.getBoolean('SFDX_DISABLE_DNS_CHECK')).to.be.false;
      expect(env.getBoolean('SF_DISABLE_DNS_CHECK')).to.be.false;
      env.setBoolean('SF_DISABLE_DNS_CHECK', true);
      expect(env.getBoolean('SF_DISABLE_DNS_CHECK')).to.be.true;
      expect(env.getBoolean('SFDX_DISABLE_DNS_CHECK')).to.be.false;
      const options: MyDomainResolver.Options = {
        url: new URL(`http://${POSITIVE_HOST}`),
        timeout: Duration.milliseconds(50),
        frequency: Duration.milliseconds(10),
      };
      const resolver: MyDomainResolver = await MyDomainResolver.create(options);
      const ip = await resolver.resolve();
      expect(ip).to.be.equal(POSITIVE_HOST);
      expect(lookupAsyncSpy.callCount).to.be.equal(0);
      env.unset('SFDX_DISABLE_DNS_CHECK');
      env.unset('SF_DISABLE_DNS_CHECK');
    });
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
      frequency: Duration.milliseconds(10),
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
      frequency: Duration.milliseconds(10),
    };
    const resolver: MyDomainResolver = await MyDomainResolver.create(options);
    try {
      await shouldThrow(resolver.resolve());
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((e as Error).name).to.equal('MyDomainResolverTimeoutError');
    }
  });

  it('should resolve localhost', async () => {
    const options: MyDomainResolver.Options = {
      url: new URL('http://ghostbusters.internal.salesforce.com'),
    };
    const resolver: MyDomainResolver = await MyDomainResolver.create(options);
    const ip = await resolver.resolve();
    expect(ip).to.be.equal('127.0.0.1');
    expect(lookupAsyncSpy.callCount).to.be.equal(0);
  });
});
