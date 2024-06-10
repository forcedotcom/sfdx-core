/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
      frequency: Duration.milliseconds(10),
    };
    const resolver: MyDomainResolver = await MyDomainResolver.create(options);
    const ip = await resolver.resolve();
    expect(ip).to.be.equal(TEST_IP);
    expect(lookupAsyncSpy.callCount).to.be.equal(CALL_COUNT);
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
describe('cname resolver', () => {
  const $$ = new TestContext();
  const TEST_IP = '1.1.1.1';
  const sandboxCs = 'https://site-ruby-9820-dev-ed.cs50.my.salesforce.com';
  const sandboxNondescript = 'https://efficiency-flow-2380-dev-ed.my.salesforce.com';
  const sandboxCsUrl = new URL(sandboxCs);
  const sandboxNondescriptUrl = new URL(sandboxNondescript);
  const usa3sVIP = new URL('https://usa3s.sfdc-ypmv18.salesforce.com');

  beforeEach(() => {
    $$.SANDBOX.stub(dns, 'lookup').callsFake((host: string, callback: AnyFunction) => {
      const isPositiveComplete = host === sandboxCsUrl.host || host === sandboxNondescriptUrl.host;
      if (isPositiveComplete) {
        callback(null, { address: TEST_IP });
      } else {
        callback(new Error());
      }
    });
    $$.SANDBOX.stub(dns, 'resolveCname').callsFake((host: string, callback: AnyFunction) => {
      if (host === new URL(sandboxCs).host) {
        callback(null, [sandboxCsUrl.host]);
      } else if (host === sandboxNondescriptUrl.host) {
        callback(null, [usa3sVIP.host]);
      } else {
        callback(new Error());
      }
    });
  });

  it('should resolve cname to same url', async () => {
    const options: MyDomainResolver.Options = {
      url: sandboxCsUrl,
    };
    const resolver: MyDomainResolver = await MyDomainResolver.create(options);
    const cnames = await resolver.getCnames();
    expect(cnames).to.be.deep.equal([sandboxCsUrl.host]);
  });

  it('should resolve cname to usa3s', async () => {
    const options: MyDomainResolver.Options = {
      url: sandboxNondescriptUrl,
    };
    const resolver: MyDomainResolver = await MyDomainResolver.create(options);
    const cnames = await resolver.getCnames();
    expect(cnames).to.be.deep.equal([usa3sVIP.host]);
  });

  it('should not resolve cname', async () => {
    const options: MyDomainResolver.Options = {
      url: new URL('https://foo.bar.baz.com'),
      timeout: Duration.milliseconds(10),
    };
    const resolver: MyDomainResolver = await MyDomainResolver.create(options);
    const cnames = await resolver.getCnames();
    expect(cnames).to.be.deep.equal([]);
  });
});
