/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { shouldThrow, testSetup } from '../../../src/testSetup';
import { MyDomainResolver } from '../../../src/status/myDomainResolver';
import { checkLightningDomain } from '../../../src/util/checkLightningDomain';

const $$ = testSetup();
const TEST_IP = '1.1.1.1';

describe('checkLightningDomain', () => {
  beforeEach(() => {
    $$.SANDBOX.stub(MyDomainResolver.prototype, 'resolve').resolves(TEST_IP);
  });

  afterEach(() => {
    $$.SANDBOX.restore();
  });

  it('return true for internal urls', async () => {
    const url = 'http://my-domain.stm.salesforce.com';
    const response = await checkLightningDomain(url);
    expect(response).to.be.true;
  });

  it('return true for urls that dns can resolve', async () => {
    const url = 'http://login.salesforce.com';
    const respose = await checkLightningDomain(url);
    expect(respose).to.be.true;
  });

  it('throws on domain resolution failure', async () => {
    $$.SANDBOX.restore();
    $$.SANDBOX.stub(MyDomainResolver.prototype, 'resolve').rejects();
    const url = 'http://login.salesforce.com';
    try {
      await shouldThrow(checkLightningDomain(url));
    } catch (e) {
      expect(e.name).to.equal('Error');
    }
  });
});
