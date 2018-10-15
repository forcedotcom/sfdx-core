/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */
import * as dns from 'dns';

import { expect } from 'chai';
import { testSetup } from '../../../lib/testSetup';

import { MyDomainResolver, MyDomainResolverOptions } from '../../../lib/status/myDomainResolver';
import { Time, TIME_UNIT } from '../../../lib/util/time';

import { AnyFunction } from '@salesforce/ts-types';
import { URL } from 'url';
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
            if (host === POSITIVE_HOST && lookupAsyncSpy.callCount === CALL_COUNT) {
                callback(null, { address: TEST_IP });
            } else {
                callback(new Error());
            }
        });
    });

    it('should resolve', async () => {
        const options: MyDomainResolverOptions = {
            url: new URL(`http://${POSITIVE_HOST}`),
            timeout: new Time(50, TIME_UNIT.MILLISECONDS),
            frequency: new Time(10, TIME_UNIT.MILLISECONDS)
        };
        const resolver: MyDomainResolver = await MyDomainResolver.create(options);
        const ip = await resolver.resolve();
        expect(ip).to.be.equal(TEST_IP);
        expect(lookupAsyncSpy.callCount).to.be.equal(CALL_COUNT);
    });

    it('should timeout', async () => {
        const options: MyDomainResolverOptions = {
            url: new URL(`https://${NEGATIVE_HOST}`),
            timeout: new Time(100, TIME_UNIT.MILLISECONDS),
            frequency: new Time(10, TIME_UNIT.MILLISECONDS)
        };
        const resolver: MyDomainResolver = await MyDomainResolver.create(options);
        try {
            await shouldThrow( resolver.resolve());
        } catch (e) {
            expect(e.name).to.equal('MyDomainResolverTimeoutError');
        }
    });
});
