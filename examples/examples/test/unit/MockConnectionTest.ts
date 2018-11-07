import { AuthInfo, Connection } from '@salesforce/core';
import { MockTestOrgData, testSetup } from '@salesforce/core/lib/testSetup';
import { strictEqual } from 'assert';

const $$ = testSetup();

describe('Mocking an SFDX connection', () => {
  it('example', async () => {
    const testData = new MockTestOrgData();
    $$.setConfigStubContents('AuthInfoConfig', {
      contents: await testData.getConfig()
    });
    const connection: Connection = await Connection.create(
      await AuthInfo.create(testData.username)
    );
    strictEqual(connection.accessToken, testData.accessToken);
  });
});
