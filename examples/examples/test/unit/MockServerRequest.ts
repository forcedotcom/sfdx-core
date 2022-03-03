import { AuthInfo, Connection, SfError } from '@salesforce/core';
import { MockTestOrgData, testSetup } from '@salesforce/core/lib/testSetup';
import { AnyJson, ensureJsonMap, JsonMap } from '@salesforce/ts-types';
import { ensureString } from '@salesforce/ts-types';
import { deepStrictEqual } from 'assert';
import { QueryResult } from 'jsforce';

const $$ = testSetup();

describe('Mocking a force server call', () => {
  it('example', async () => {
    const records: AnyJson = { records: ['123456', '234567'] };
    const testData = new MockTestOrgData();
    $$.setConfigStubContents('GlobalInfo', {
      contents: {
        orgs: {
          [testData.username]: await testData.getConfig(),
        },
      },
    });
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
    const result: QueryResult<{}> = await connection.query('select Id From Account');
    deepStrictEqual(result, records);
  });
});
