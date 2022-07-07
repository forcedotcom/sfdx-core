/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { strictEqual } from 'assert';
import { AuthInfo, Connection } from '@salesforce/core';
import { MockTestOrgData, testSetup } from '@salesforce/core/lib/testSetup';

const $$ = testSetup();

describe('Mocking an SFDX connection', () => {
  it('example', async () => {
    const testData = new MockTestOrgData();
    await $$.stubAuths(testData);
    const connection = await Connection.create({
      authInfo: await AuthInfo.create({
        username: testData.username,
      }),
    });
    strictEqual(connection.accessToken, testData.accessToken);
  });
});
