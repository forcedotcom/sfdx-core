/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import * as path from 'path';
import { SfdxUtil } from './util';

export enum Modes {
    PRODUCTION = 'production',
    DEVELOPMENT = 'development',
    TEST = 'test'
}

/**
 * Represents an environment mode.  Supports 'production', 'development', and 'test'
 * with the default mode being 'production'.
 */
export class Mode {
    constructor(readonly mode: string) {
        mode = mode && mode.toUpperCase();
        this.mode = Modes[mode] || Modes.PRODUCTION;
    }

    public is(mode: string) {
        return mode === this.mode;
    }

    public toString() {
        return this.mode;
    }
}

/**
 * Global constants, methods and configuration.
 */
export class Global {
    public static readonly STATE_FOLDER = '.sfdx';
    public static readonly DIR: string = path.join(os.homedir(), Global.STATE_FOLDER);
    public static readonly LOG_FILE_PATH: string = path.join(Global.DIR, 'sfdx.log');

    public static getEnvironmentMode(): Mode {
        return new Mode(process.env.SFDX_ENV);
    }

    /**
     * Creates a directory within the global directory, or the global directory
     * itself if a dirPath is not specified.
     * @param {string} dirPath The directory path to be created within the global directory.
     * @returns {Promise<void>}
     */
    public static async createDir(dirPath?: string): Promise<void> {
        dirPath = dirPath ? path.join(Global.DIR, dirPath) : Global.DIR;
        await SfdxUtil.mkdirp(dirPath, SfdxUtil.DEFAULT_USER_DIR_MODE);
    }

    /**
     * Single place to read global config information.
     * @param {string} fileName The name of the JSON config file from which to read.
     * @returns {Promise<object>} The json data read from the config file.
     */
    public static async fetchConfigInfo(fileName: string): Promise<object> {
        return await SfdxUtil.readJSON(path.join(Global.DIR, fileName));
    }

    /**
     * Single place to write global config information.
     * @param {string} fileName fileName The name of the JSON config file to write.
     * @param {object} info The JSON data to write.
     * @returns {Promise<void>}
     */
    public static async saveConfigInfo(fileName: string, info: object): Promise<void> {
        return await SfdxUtil.writeJSON(path.join(Global.DIR, fileName), info);
    }
}

export default Global;
