/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { strictEqual } from 'assert';
import { AuthInfo } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup';

describe('Mocking Auth data', () => {
  const $$ = new TestContext();
  it('example', async () => {
    const testData = new MockTestOrgData();
    await $$.stubAuths(testData);
    const auth = await AuthInfo.create({
      username: testData.username,
    });
    strictEqual(auth.getUsername(), testData.username);
  });
});
