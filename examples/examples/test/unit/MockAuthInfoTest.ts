import { AuthInfo } from '@salesforce/core';
import { MockTestOrgData, testSetup } from '@salesforce/core/lib/testSetup';
import { strictEqual } from 'assert';

const $$ = testSetup();

describe('Mocking Auth data', () => {
  it('example', async () => {
    const testData = new MockTestOrgData();
    await $$.stubAuths(testData)
    const auth = await AuthInfo.create({
      username: testData.username,
    });
    strictEqual(auth.getUsername(), testData.username);
  });
});
