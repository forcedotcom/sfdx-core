/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { strictEqual } from 'assert';
import { Logger, LogLine } from '@salesforce/core';
import { TestContext } from '@salesforce/core/lib/testSetup';

const TEST_STRING = 'foo was here';

class TestObject {
  public constructor(private logger: Logger) {
    this.logger = logger.child('TestObject');
  }

  public method() {
    this.logger.error(TEST_STRING);
  }
}

describe('Testing log lines', () => {
  const $$ = new TestContext();

  it('example', async () => {
    const obj: TestObject = new TestObject($$.TEST_LOGGER);
    obj.method();
    const records: LogLine[] = $$.TEST_LOGGER.getBufferedRecords();
    strictEqual(records.length, 1);
    strictEqual(records[0].msg, TEST_STRING);
  });
});
