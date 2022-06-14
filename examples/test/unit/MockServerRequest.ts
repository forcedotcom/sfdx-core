/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { deepStrictEqual } from 'assert';
import { AuthInfo, Connection, SfError } from '@salesforce/core';
import { MockTestOrgData, testSetup } from '@salesforce/core/lib/testSetup';
import { AnyJson, ensureJsonMap, JsonMap } from '@salesforce/ts-types';
import { ensureString } from '@salesforce/ts-types';

const $$ = testSetup();

describe('Mocking a force server call', () => {
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
