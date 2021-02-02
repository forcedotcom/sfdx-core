/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { env } from '@salesforce/kit';
import * as os from 'os';
import * as path from 'path';
import { fs } from './util/fs';
/**
 * Represents an environment mode.  Supports `production`, `development`, `demo`, and `test`
 * with the default mode being `production`.
 *
 * To set the mode, `export SFDX_ENV=<mode>` in your current environment.
 */
export var Mode;
(function(Mode) {
  Mode['PRODUCTION'] = 'production';
  Mode['DEVELOPMENT'] = 'development';
  Mode['DEMO'] = 'demo';
  Mode['TEST'] = 'test';
})(Mode || (Mode = {}));
/**
 * Global constants, methods, and configuration.
 */
export class Global {
  /**
   * Gets the current mode environment variable as a {@link Mode} instance.
   *
   * ```
   * console.log(Global.getEnvironmentMode() === Mode.PRODUCTION);
   * ```
   */
  static getEnvironmentMode() {
    return Mode[env.getKeyOf('SFDX_ENV', Mode, Mode.PRODUCTION, value => value.toUpperCase())];
  }
  /**
   * Creates a directory within {@link Global.DIR}, or {@link Global.DIR} itself if the `dirPath` param
   * is not provided. This is resolved or rejected when the directory creation operation has completed.
   *
   * @param dirPath The directory path to be created within {@link Global.DIR}.
   */
  static async createDir(dirPath) {
    dirPath = dirPath ? path.join(Global.DIR, dirPath) : Global.DIR;
    await fs.mkdirp(dirPath, fs.DEFAULT_USER_DIR_MODE);
  }
}
/**
 * The global folder in which state is stored.
 */
Global.STATE_FOLDER = '.sfdx';
/**
 * The full system path to the global state folder.
 *
 * **See** {@link Global.STATE_FOLDER}
 */
Global.DIR = path.join(os.homedir(), Global.STATE_FOLDER);
/**
 * The full system path to the global log file.
 */
Global.LOG_FILE_PATH = path.join(Global.DIR, 'sfdx.log');
//# sourceMappingURL=global.js.map
