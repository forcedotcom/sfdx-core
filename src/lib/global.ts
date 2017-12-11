/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import * as path from 'path';

export enum Modes {
    PRODUCTION = 'production',
    DEVELOPMENT = 'development',
    TEST = 'test'
};

/**
 * Represents an environment mode.  Supports 'production', 'development', and 'test'
 * with the default mode being 'production'.
 */
export class Mode {
    constructor(readonly mode : string) {
        mode = mode && mode.toUpperCase();
        this.mode = Modes[mode] || Modes.PRODUCTION;
    }

    is(mode: string) {
        return mode === this.mode;
    }

    toString() {
        return this.mode;
    }
}

/**
 * Global constants, methods and configuration.
 */
export class Global {
    static readonly DIR : string = path.join(os.homedir(), '.sfdx');
    static readonly LOG_FILE_PATH : string = path.join(Global.DIR, 'sfdx.log');

    static getEnvironmentMode() : Mode {
        return new Mode(process.env.SFDX_ENV);
    }
}

export default Global;
