/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import * as path from 'path';
import { SfdxUtil } from './util';

/**
 * Represents an environment mode.  Supports `production`, `development`, `demo`, and `test`
 * with the default mode being `production`.
 *
 * To set the mode, `export SFDX_ENV=<mode>` in your current environment.
 * @typedef Mode
 * @property {string} PRODUCTION
 * @property {string} DEVELOPMENT
 * @property {string} DEMO
 * @property {string} TEST
 */
export enum Mode {
    PRODUCTION = 'production',
    DEVELOPMENT = 'development',
    DEMO = 'demo',
    TEST = 'test'
}

/**
 * Global constants, methods, and configuration.
 */
export class Global {
    /**
     * The global folder in which state is stored.
     */
    public static readonly STATE_FOLDER = '.sfdx';

    /**
     * The full system path to the global state folder.
     *
     * @see Global.STATE_FOLDER
     */
    public static readonly DIR: string = path.join(os.homedir(), Global.STATE_FOLDER);

    /**
     * The full system path to the global log file.
     */
    public static readonly LOG_FILE_PATH: string = path.join(Global.DIR, 'sfdx.log');

    /**
     * Gets the current mode environment variable as a {@link Mode} instance.
     *
     * @example
     * console.log(Global.getEnvironmentMode() === Mode.PRODUCTION);
     *
     * @returns {Mode}
     */
    public static getEnvironmentMode(): Mode {
        return Mode[(process.env.SFDX_ENV || Mode.PRODUCTION).toUpperCase()];
    }

    /**
     * Creates a directory within {@link Global.DIR}, or {@link Global.DIR} itself if the `dirPath` param
     * is not provided.
     *
     * @param {string} [dirPath] The directory path to be created within {@link Global.DIR}.
     * @returns {Promise<void>} Resolved or rejected when the directory creation operation has completed.
     */
    public static async createDir(dirPath?: string): Promise<void> {
        dirPath = dirPath ? path.join(Global.DIR, dirPath) : Global.DIR;
        await SfdxUtil.mkdirp(dirPath, SfdxUtil.DEFAULT_USER_DIR_MODE);
    }
}
