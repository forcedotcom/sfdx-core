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
