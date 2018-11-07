import { SfdxError } from '@salesforce/core';
import { shouldThrow } from '@salesforce/core/lib/testSetup';
import { strictEqual } from 'assert';

class TestObject {
  public static async method() {
    throw new SfdxError('Error', 'ExpectedError');
  }
}

describe('Testing for expected errors', () => {
  it('example', async () => {
    try {
      await shouldThrow(TestObject.method());
    } catch (e) {
      strictEqual(e.name, 'ExpectedError');
    }
  });
});
