/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as os from 'node:os';
import * as path from 'node:path';
import { env } from '@salesforce/kit';
import { fs } from './fs/fs';
import { SfError } from './sfError';

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
   * The preferred global folder in which state is stored.
   */
  public static readonly STATE_FOLDER = Global.SFDX_STATE_FOLDER;

  /**
   * Whether the code is running in a web browser.
   */
  public static get isWeb(): boolean {
    return 'window' in globalThis || 'self' in globalThis;
  }

  /**
   * The full system path to the global sfdx state folder.
   *
   * **See** {@link Global.SFDX_STATE_FOLDER}
   */
  public static get SFDX_DIR(): string {
    return path.join(os.homedir(), Global.SFDX_STATE_FOLDER);
  }

  /**
   * The full system path to the global sf state folder.
   *
   * **See**  {@link Global.SF_STATE_FOLDER}
   */
  public static get SF_DIR(): string {
    return path.join(os.homedir(), Global.SF_STATE_FOLDER);
  }

  /**
   * The full system path to the preferred global state folder
   */
  public static get DIR(): string {
    return path.join(os.homedir(), Global.SFDX_STATE_FOLDER);
  }

  /**
   * Gets the current mode environment variable as a {@link Mode} instance.
   *
   * ```
   * console.log(Global.getEnvironmentMode() === Mode.PRODUCTION);
   * ```
   */
  public static getEnvironmentMode(): Mode {
    const envValue = env.getString('SF_ENV') ?? env.getString('SFDX_ENV', Mode.PRODUCTION);
    return envValue in Mode || envValue.toUpperCase() in Mode
      ? Mode[envValue.toUpperCase() as keyof typeof Mode]
      : Mode.PRODUCTION;
  }

  /**
   * Creates a directory within {@link Global.SFDX_DIR}, or {@link Global.SFDX_DIR} itself if the `dirPath` param
   * is not provided. This is resolved or rejected when the directory creation operation has completed.
   *
   * @param dirPath The directory path to be created within {@link Global.SFDX_DIR}.
   */
  public static async createDir(dirPath?: string): Promise<void> {
    const resolvedPath = dirPath ? path.join(Global.SFDX_DIR, dirPath) : Global.SFDX_DIR;
    try {
      if (process.platform === 'win32' || Global.isWeb) {
        await fs.promises.mkdir(resolvedPath, { recursive: true });
      } else {
        await fs.promises.mkdir(resolvedPath, { recursive: true, mode: 0o700 });
      }
    } catch (error) {
      throw new SfError(`Failed to create directory or set permissions for: ${resolvedPath}`);
    }
  }
}
