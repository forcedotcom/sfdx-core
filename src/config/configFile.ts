/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { isBoolean } from '@salesforce/ts-types';
import { constants as fsConstants, Stats as fsStats } from 'fs';
import { homedir as osHomedir } from 'os';
import { dirname as pathDirname, join as pathJoin } from 'path';
import { Global } from '../global';
import { SfdxError } from '../sfdxError';
import { fs } from '../util/fs';
import { resolveProjectPath } from '../util/internal';
import { BaseConfigStore, ConfigContents } from './configStore';

/**
 * Represents a json config file used to manage settings and state. Global config
 * files are stored in the home directory hidden state folder (.sfdx) and local config
 * files are stored in the project path, either in the hidden state folder or wherever
 * specified.
 *
 * ```
 * class MyConfig extends ConfigFile {
 *      public static getFileName(): string {
 *        return 'myConfigFilename.json';
 *      }
 *    }
 * const myConfig = await MyConfig.create({});
 * myConfig.set('mykey', 'myvalue');
 * await myConfig.write();
 * ```
 */
export class ConfigFile<T extends ConfigFile.Options> extends BaseConfigStore<T> {
  /**
   * Returns the config's filename.
   */
  public static getFileName(): string {
    // Can not have abstract static methods, so throw a runtime error.
    throw new SfdxError('Unknown filename for config file.');
  }

  /**
   * Returns the default options for the config file.
   * @param isGlobal If the file should be stored globally or locally.
   * @param filename The name of the config file.
   */
  public static getDefaultOptions(isGlobal: boolean = false, filename?: string): ConfigFile.Options {
    return {
      isGlobal,
      isState: true,
      filename: filename || ConfigFile.getFileName()
    };
  }

  /**
   * Helper used to determined what the local and global folder point to. Returns the file path of the root folder.
   *
   * @param isGlobal True if the config should be global. False for local.
   */
  public static async resolveRootFolder(isGlobal: boolean): Promise<string> {
    if (!isBoolean(isGlobal)) {
      throw new SfdxError('isGlobal must be a boolean', 'InvalidTypeForIsGlobal');
    }
    return isGlobal ? osHomedir() : await resolveProjectPath();
  }

  // Initialized in create
  private path!: string;

  /**
   * Constructor
   * **Do not directly construct instances of this class -- use {@link ConfigFile.create} instead.**
   * @param options The options for the class instance
   */
  public constructor(options: T) {
    super(options);
  }

  /**
   * Determines if the config file is read/write accessible. Returns `true` if the user has capabilities specified
   * by perm.
   * @param {number} perm The permission.
   * {@link fs.access}
   */
  public async access(perm: number): Promise<boolean> {
    try {
      await fs.access(this.getPath(), perm);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Read the config file and set the config contents. Returns the config contents of the config file.
   * **Throws** *{@link SfdxError}{ name: 'UnexpectedJsonFileFormat' }* There was a problem reading or parsing the file.
   * @param [throwOnNotFound = false] Optionally indicate if a throw should occur on file read.
   */
  public async read(throwOnNotFound: boolean = false): Promise<ConfigContents> {
    try {
      const obj = await fs.readJsonMap(this.getPath());
      this.setContentsFromObject(obj);
      return this.getContents();
    } catch (err) {
      if (err.code === 'ENOENT') {
        if (!throwOnNotFound) {
          this.setContents();
          return this.getContents();
        }
      }
      throw err;
    }
  }

  /**
   * Write the config file with new contents if no new contents are passed in. Returns the contents.
   * it will write the existing config contents that were set from {@link ConfigFile.read}, or an
   * empty file if {@link ConfigFile.read} was not called.
   *
   * @param newContents The new contents of the file.
   */
  public async write(newContents?: ConfigContents): Promise<ConfigContents> {
    if (newContents != null) {
      this.setContents(newContents);
    }

    await fs.mkdirp(pathDirname(this.getPath()));

    await fs.writeJson(this.getPath(), this.toObject());

    return this.getContents();
  }

  /**
   * Check to see if the config file exists. Returns `true` if the config file exists and has access, false otherwise.
   */
  public async exists(): Promise<boolean> {
    return await this.access(fsConstants.R_OK);
  }

  /**
   * Get the stats of the file. Returns the stats of the file.
   *
   * {@link fs.stat}
   */
  public async stat(): Promise<fsStats> {
    return fs.stat(this.getPath());
  }

  /**
   * Delete the config file if it exists. Returns `true` if the file was deleted, `false` otherwise.
   *
   * {@link fs.unlink}
   */
  public async unlink(): Promise<void> {
    const exists = await this.exists();
    if (exists) {
      return await fs.unlink(this.getPath());
    }
    throw new SfdxError(`Target file doesn't exist. path: ${this.getPath()}`, 'TargetFileNotFound');
  }

  /**
   * Returns the path to the config file.
   */
  public getPath(): string {
    return this.path;
  }

  /**
   * Returns `true` if this config is using the global path, `false` otherwise.
   */
  public isGlobal(): boolean {
    return !!this.options.isGlobal;
  }

  /**
   * Used to initialize asynchronous components.
   */
  protected async init(): Promise<void> {
    let defaultOptions = {};
    try {
      defaultOptions = ConfigFile.getDefaultOptions();
    } catch (e) {
      /* Some implementations don't let you call default options */
    }

    // Merge default and passed in options
    this.options = Object.assign(defaultOptions, this.options);

    if (!this.options.filename) {
      throw new SfdxError('The ConfigOptions filename parameter is invalid.', 'InvalidParameter');
    }

    const _isGlobal: boolean = isBoolean(this.options.isGlobal) && this.options.isGlobal;
    const _isState: boolean = isBoolean(this.options.isState) && this.options.isState;

    // Don't let users store config files in homedir without being in the
    // state folder.
    let configRootFolder = this.options.rootFolder
      ? this.options.rootFolder
      : await ConfigFile.resolveRootFolder(!!this.options.isGlobal);

    if (_isGlobal || _isState) {
      configRootFolder = pathJoin(configRootFolder, Global.STATE_FOLDER);
    }

    this.path = pathJoin(configRootFolder, this.options.filePath ? this.options.filePath : '', this.options.filename);

    await this.read();
  }
}

export namespace ConfigFile {
  /**
   * The interface for Config options.
   */
  export interface Options extends BaseConfigStore.Options {
    /**
     * The root folder where the config file is stored.
     */
    rootFolder?: string;
    /**
     * The file name.
     */
    filename?: string;
    /**
     * If the file is in the global or project directory.
     */
    isGlobal?: boolean;
    /**
     * If the file is in the state folder or no (.sfdx).
     */
    isState?: boolean;
    /**
     * The full file path where the config file is stored.
     */
    filePath?: string;
  }
}
