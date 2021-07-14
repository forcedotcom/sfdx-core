/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import * as path from 'path';
import { env } from '@salesforce/kit';
import { fs } from './util/fs';

/**
 * Represents an environment mode.  Supports `production`, `development`, `demo`, and `test`
 * with the default mode being `production`.
 *
 * To set the mode, `export SFDX_ENV=<mode>` in your current environment.
 */
export enum Mode {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  DEMO = 'demo',
  TEST = 'test',
}

/**
 * Global constants, methods, and configuration.
 */
export class Global {
  /**
   * Enable interoperability between `.sfdx` and `.sf`.
   *
   * When @salesforce/core@v2 is deprecated and no longer used, this can be removed.
   */
  public static SFDX_INTEROPERABILITY = env.getBoolean('SF_SFDX_INTEROPERABILITY', true);

  /**
   * The global folder in which sfdx state is stored.
   */
  public static readonly SFDX_STATE_FOLDER = '.sfdx';

  /**
   * The global folder in which sf state is stored.
   */
  public static readonly SF_STATE_FOLDER = '.sf';

  /**
   * The full system path to the global sfdx state folder.
   *
   * **See** {@link Global.SFDX_STATE_FOLDER}
   */
  public static readonly SFDX_DIR: string = path.join(os.homedir(), Global.SFDX_STATE_FOLDER);

  /**
   * The full system path to the global sf state folder.
   *
   * **See** {@link Global.SF_STATE_FOLDER}
   */
  public static readonly SF_DIR: string = path.join(os.homedir(), Global.SF_STATE_FOLDER);

  /**
   * The full system path to the global log file.
   */
  public static readonly LOG_FILE_PATH: string = path.join(Global.SFDX_DIR, 'sfdx.log');

  /**
   * Gets the current mode environment variable as a {@link Mode} instance.
   *
   * ```
   * console.log(Global.getEnvironmentMode() === Mode.PRODUCTION);
   * ```
   */
  public static getEnvironmentMode(): Mode {
    return Mode[env.getKeyOf('SFDX_ENV', Mode, Mode.PRODUCTION, (value) => value.toUpperCase())];
  }

  /**
   * Creates a directory within {@link Global.SFDX_DIR}, or {@link Global.SFDX_DIR} itself if the `dirPath` param
   * is not provided. This is resolved or rejected when the directory creation operation has completed.
   *
   * @param dirPath The directory path to be created within {@link Global.SFDX_DIR}.
   */
  public static async createDir(dirPath?: string): Promise<void> {
    dirPath = dirPath ? path.join(Global.SFDX_DIR, dirPath) : Global.SFDX_DIR;
    await fs.mkdirp(dirPath, fs.DEFAULT_USER_DIR_MODE);
  }
}
