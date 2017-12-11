/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import * as path from 'path';
import * as _ from 'lodash';

/**
 * Represents an environment mode.  By default it supports 'production', 'development', and 'test'
 * with the default mode being 'production'.  Alternatively, types can be passed in and the first
 * type will be the default.  A method is generated for each type, e.g. for a type of
 *  `production` there will be an `isProduction()` method generated.
 */
export class Mode {
    private static readonly DEFAULT_TYPES : string[] = ['production', 'development', 'test'];

    constructor(readonly mode : string, readonly types : string[] = Mode.DEFAULT_TYPES) {
        mode = mode && mode.toLowerCase();
        const _default = _.includes(types, 'production') ? 'production' : types[0];
        this.mode = this.types.includes(mode) ? mode : _default;

        this.types.forEach(modeType => {
            this[`is${_.capitalize(modeType)}`] = () => (modeType === this.mode);
        });
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

    private static envMode : Mode;

    static getEnvironmentMode() : Mode {
        return Global.envMode = Global.envMode || new Mode(process.env.SFDX_ENV);
    }

    static setEnvironmentMode(mode : Mode);
    static setEnvironmentMode(mode : string);
    static setEnvironmentMode(mode : string | Mode) {
        Global.envMode = mode instanceof Mode ? mode : new Mode(mode);
    }
}

export default Global;
