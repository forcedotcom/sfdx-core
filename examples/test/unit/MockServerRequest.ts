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

import { deepStrictEqual } from 'assert';
import { AuthInfo, Connection, SfError } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup';
import { AnyJson, ensureJsonMap, JsonMap } from '@salesforce/ts-types';
import { ensureString } from '@salesforce/ts-types';

describe('Mocking a force server call', () => {
  const $$ = new TestContext();
  it('example', async () => {
    const records: AnyJson = { records: ['123456', '234567'] };
    const testData = new MockTestOrgData();
    await $$.stubAuths(testData);
    $$.fakeConnectionRequest = (request: AnyJson): Promise<AnyJson> => {
      const _request: JsonMap = ensureJsonMap(request);
      if (request && ensureString(_request.url).includes('Account')) {
        return Promise.resolve(records);
      } else {
        return Promise.reject(new SfError(`Unexpected request: ${_request.url}`));
      }
    };
    const connection: Connection = await Connection.create({
      authInfo: await AuthInfo.create({ username: testData.username }),
    });
    const result = await connection.query('select Id From Account');
    deepStrictEqual(result, records);
  });
});
