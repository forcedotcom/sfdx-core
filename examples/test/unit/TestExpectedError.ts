/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { strictEqual } from 'assert';
import { SfError } from '@salesforce/core';
import { shouldThrow } from '@salesforce/core/lib/testSetup';

class TestObject {
  public static async method() {
    throw new SfError('Error', 'ExpectedError');
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
