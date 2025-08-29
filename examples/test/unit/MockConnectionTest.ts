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

import { strictEqual } from 'assert';
import { AuthInfo, Connection } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup';

describe('Mocking an SFDX connection', () => {
  const $$ = new TestContext();
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
