/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as sinon from 'sinon';
import { assert, expect } from 'chai';
import * as path from 'path';
import * as os from 'os';

import { Crypto } from '../../lib/crypto';

const _join = path.join;

const scripts = [
`#!/bin/sh
echo WTH ERROR 1>&2
exit 17`];

const SCRIPT = path.join(os.tmpdir(), 'security');
/*
const createScript = function(content) {
    fs.writeFileSync(SCRIPT, content);
    fs.chmodSync(SCRIPT, '555');
};

if (os.platform() === 'darwin') {
    describe('CryptoKeyFailureTests', () => {
    });
}
*/
