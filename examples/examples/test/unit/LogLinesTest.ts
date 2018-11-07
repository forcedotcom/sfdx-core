import { Logger, LogLine } from '@salesforce/core';
import { testSetup } from '@salesforce/core/lib/testSetup';
import { strictEqual } from 'assert';

const $$ = testSetup();

const TEST_STRING = 'foo was here';

class TestObject {
  constructor(private logger: Logger) {
    this.logger = logger.child('TestObject');
  }

  public method() {
    this.logger.error(TEST_STRING);
  }
}

describe('Testing log lines', () => {
  it('example', async () => {
    const obj: TestObject = new TestObject($$.TEST_LOGGER);
    obj.method();
    const records: LogLine[] = $$.TEST_LOGGER.getBufferedRecords();
    strictEqual(records.length, 1);
    strictEqual(records[0].msg, TEST_STRING);
  });
});
