/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { strictEqual } from 'assert';
import * as os from 'os';
import { testSetup } from '@salesforce/core/lib/testSetup';
import { stubMethod } from '@salesforce/ts-sinon';

const $$ = testSetup();

describe('Using the built in Sinon sandbox.', () => {
  it('example', async () => {
    const unsupportedOS = 'LEO';
    stubMethod($$.SANDBOX, os, 'platform').returns(unsupportedOS);
    strictEqual(os.platform(), unsupportedOS);
  });
});
