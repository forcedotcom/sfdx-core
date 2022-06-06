import { AuthInfo, Connection } from '@salesforce/core';
import { MockTestOrgData, testSetup } from '@salesforce/core/lib/testSetup';
import { strictEqual } from 'assert';

const $$ = testSetup();

describe('Mocking an SFDX connection', () => {
  it('example', async () => {
    const testData = new MockTestOrgData();
    await $$.stubAuths(testData)
    const connection = await Connection.create({
      authInfo: await AuthInfo.create({
        username: testData.username,
      }),
    });
    strictEqual(connection.accessToken, testData.accessToken);
  });
});
