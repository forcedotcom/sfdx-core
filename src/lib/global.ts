/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import * as path from 'path';
import sfdxUtil from './util';

export default class Global {
    static readonly DIR : string = path.join(os.homedir(), '.sfdx');
    static readonly LOG_FILE_PATH : string = path.join(Global.DIR, 'sfdx.log');
}
