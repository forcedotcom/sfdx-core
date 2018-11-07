import { strictEqual } from 'assert';
import { MockTestOrgData, testSetup } from '@salesforce/core/lib/testSetup';
import { AuthInfo } from '@salesforce/core';

const $$ = testSetup();

describe('Mocking Auth data', () => {
  it('example', async () => {
    const testData = new MockTestOrgData();
    $$.setConfigStubContents('AuthInfoConfig', {
      contents: await testData.getConfig()
    });
    const auth: AuthInfo = await AuthInfo.create(testData.username);
    strictEqual(auth.getUsername(), testData.username);
  });
});
