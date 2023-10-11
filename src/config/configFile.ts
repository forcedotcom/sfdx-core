/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import { constants as fsConstants, Stats as fsStats } from 'fs';
import { homedir as osHomedir } from 'os';
import { dirname as pathDirname, join as pathJoin } from 'path';
import { lock, lockSync } from 'proper-lockfile';
import { parseJsonMap } from '@salesforce/kit';
import { Global } from '../global';
import { Logger } from '../logger/logger';
import { SfError } from '../sfError';
import { resolveProjectPath, resolveProjectPathSync } from '../util/internal';
import { lockOptions, lockRetryOptions } from '../util/lockRetryOptions';
import { BaseConfigStore } from './configStore';
import { ConfigContents } from './configStackTypes';
import { stateFromContents } from './lwwMap';

/**
 * Represents a json config file used to manage settings and state. Global config
 * files are stored in the home directory hidden state folder (.sfdx) and local config
 * files are stored in the project path, either in the hidden state folder or wherever
 * specified.
 *
 * ```
 * class MyConfig extends ConfigFile {
 *   public static getFileName(): string {
 *     return 'myConfigFilename.json';
 *   }
 * }
 * const myConfig = await MyConfig.create({
 *   isGlobal: true
 * });
 * myConfig.set('mykey', 'myvalue');
 * await myConfig.write();
 * ```
 */
export class ConfigFile<
  T extends ConfigFile.Options = ConfigFile.Options,
  P extends ConfigContents = ConfigContents
> extends BaseConfigStore<T, P> {
  // whether file contents have been read
  protected hasRead = false;

  // Initialized in init
  protected logger!: Logger;

  // Initialized in create
  private path!: string;

  /**
   * Create an instance of a config file without reading the file. Call `read` or `readSync`
   * after creating the ConfigFile OR instantiate with {@link ConfigFile.create} instead.
   *
   * @param options The options for the class instance
   * @ignore
   */
  public constructor(options?: T) {
    super(options);

    this.logger = Logger.childFromRoot(this.constructor.name);
    const statics = this.constructor as typeof ConfigFile;
    let defaultOptions = {};
    try {
      defaultOptions = statics.getDefaultOptions();
    } catch (e) {
      /* Some implementations don't let you call default options */
    }

    // Merge default and passed in options
    this.options = Object.assign(defaultOptions, this.options);
  }
  /**
   * Returns the config's filename.
   */
  public static getFileName(): string {
    // Can not have abstract static methods, so throw a runtime error.
    throw new SfError('Unknown filename for config file.');
  }

  /**
   * Returns the default options for the config file.
   *
   * @param isGlobal If the file should be stored globally or locally.
   * @param filename The name of the config file.
   */
  public static getDefaultOptions(isGlobal = false, filename?: string): ConfigFile.Options {
    return {
      isGlobal,
      isState: true,
      filename: filename ?? this.getFileName(),
      stateFolder: Global.SFDX_STATE_FOLDER,
    };
  }

  /**
   * Helper used to determine what the local and global folder point to. Returns the file path of the root folder.
   *
   * @param isGlobal True if the config should be global. False for local.
   */
  public static async resolveRootFolder(isGlobal: boolean): Promise<string> {
    return isGlobal ? osHomedir() : resolveProjectPath();
  }

  /**
   * Helper used to determine what the local and global folder point to. Returns the file path of the root folder.
   *
   * @param isGlobal True if the config should be global. False for local.
   */
  public static resolveRootFolderSync(isGlobal: boolean): string {
    return isGlobal ? osHomedir() : resolveProjectPathSync();
  }

  /**
   * Determines if the config file is read/write accessible. Returns `true` if the user has capabilities specified
   * by perm.
   *
   * @param {number} perm The permission.
   *
   * **See** {@link https://nodejs.org/dist/latest/docs/api/fs.html#fs_fs_access_path_mode_callback}
   */
  public async access(perm?: number): Promise<boolean> {
    try {
      await fs.promises.access(this.getPath(), perm);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Determines if the config file is read/write accessible. Returns `true` if the user has capabilities specified
   * by perm.
   *
   * @param {number} perm The permission.
   *
   * **See** {@link https://nodejs.org/dist/latest/docs/api/fs.html#fs_fs_access_path_mode_callback}
   */
  public accessSync(perm?: number): boolean {
    try {
      fs.accessSync(this.getPath(), perm);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Read the config file and set the config contents. Returns the config contents of the config file. As an
   * optimization, files are only read once per process and updated in memory and via `write()`. To force
   * a read from the filesystem pass `force=true`.
   * **Throws** *{@link SfError}{ name: 'UnexpectedJsonFileFormat' }* There was a problem reading or parsing the file.
   *
   * @param [throwOnNotFound = false] Optionally indicate if a throw should occur on file read.
   * @param [force = false] Optionally force the file to be read from disk even when already read within the process.
   */
  public async read(throwOnNotFound = false, force = false): Promise<P> {
    try {
      // Only need to read config files once.  They are kept up to date
      // internally and updated persistently via write().
      if (!this.hasRead || force) {
        this.logger.info(
          `Reading config file: ${this.getPath()} because ${
            !this.hasRead ? 'hasRead is false' : 'force parameter is true'
          }`
        );
        const obj = parseJsonMap<P>(await fs.promises.readFile(this.getPath(), 'utf8'), this.getPath());
        this.setContentsFromFileContents(obj, (await fs.promises.stat(this.getPath(), { bigint: true })).mtimeNs);
      }
      // Necessarily set this even when an error happens to avoid infinite re-reading.
      // To attempt another read, pass `force=true`.
      this.hasRead = true;
      return this.getContents();
    } catch (err) {
      this.hasRead = true;
      if ((err as SfError).code === 'ENOENT') {
        if (!throwOnNotFound) {
          this.setContentsFromFileContents({} as P, process.hrtime.bigint());
          return this.getContents();
        }
      }
      // Necessarily set this even when an error happens to avoid infinite re-reading.
      // To attempt another read, pass `force=true`.
      throw err;
    }
  }

  /**
   * Read the config file and set the config contents. Returns the config contents of the config file. As an
   * optimization, files are only read once per process and updated in memory and via `write()`. To force
   * a read from the filesystem pass `force=true`.
   * **Throws** *{@link SfError}{ name: 'UnexpectedJsonFileFormat' }* There was a problem reading or parsing the file.
   *
   * @param [throwOnNotFound = false] Optionally indicate if a throw should occur on file read.
   * @param [force = false] Optionally force the file to be read from disk even when already read within the process.
   */
  public readSync(throwOnNotFound = false, force = false): P {
    try {
      // Only need to read config files once.  They are kept up to date
      // internally and updated persistently via write().
      if (!this.hasRead || force) {
        this.logger.info(`Reading config file: ${this.getPath()}`);
        const obj = parseJsonMap<P>(fs.readFileSync(this.getPath(), 'utf8'));
        this.setContentsFromFileContents(obj, fs.statSync(this.getPath(), { bigint: true }).mtimeNs);
      }
      // Necessarily set this even when an error happens to avoid infinite re-reading.
      // To attempt another read, pass `force=true`.
      this.hasRead = true;
      return this.getContents();
    } catch (err) {
      this.hasRead = true;
      if ((err as SfError).code === 'ENOENT') {
        if (!throwOnNotFound) {
          this.setContentsFromFileContents({} as P, process.hrtime.bigint());
          return this.getContents();
        }
      }
      throw err;
    } finally {
      // Necessarily set this even when an error happens to avoid infinite re-reading.
      // To attempt another read, pass `force=true`.
      this.hasRead = true;
    }
  }

  /**
   * Write the config file with new contents. If no new contents are provided it will write the existing config
   * contents that were set from {@link ConfigFile.read}, or an empty file if {@link ConfigFile.read} was not called.
   *
   * @param newContents The new contents of the file.
   */
  public async write(): Promise<P> {
    // make sure we can write to the directory
    try {
      await fs.promises.mkdir(pathDirname(this.getPath()), { recursive: true });
    } catch (err) {
      throw SfError.wrap(err as Error);
    }

    let unlockFn: (() => Promise<void>) | undefined;
    // lock the file.  Returns an unlock function to call when done.
    try {
      unlockFn = await lock(this.getPath(), lockRetryOptions);
      // get the file modstamp.  Do this after the lock acquisition in case the file is being written to.
      const fileTimestamp = (await fs.promises.stat(this.getPath(), { bigint: true })).mtimeNs;

      // read the file contents into a LWWMap using the modstamp
      const stateFromFile = stateFromContents<P>(
        parseJsonMap<P>(await fs.promises.readFile(this.getPath(), 'utf8'), this.getPath()),
        fileTimestamp,
        this.getPath()
      );
      // merge the new contents into the in-memory LWWMap
      this.contents.merge(stateFromFile);
    } catch (err) {
      if (err instanceof Error && err.message.includes('ENOENT')) {
        this.logger.debug(`No file found at ${this.getPath()}.  Write will create it.`);
      } else {
        throw err;
      }
    }
    // write the merged LWWMap to file
    this.logger.info(`Writing to config file: ${this.getPath()}`);
    await fs.promises.writeFile(this.getPath(), JSON.stringify(this.toObject(), null, 2));

    // unlock the file
    if (typeof unlockFn !== 'undefined') {
      await unlockFn();
    }

    return this.getContents();
  }

  /**
   * Write the config file with new contents. If no new contents are provided it will write the existing config
   * contents that were set from {@link ConfigFile.read}, or an empty file if {@link ConfigFile.read} was not called.
   *
   * @param newContents The new contents of the file.
   */
  public writeSync(): P {
    try {
      fs.mkdirSync(pathDirname(this.getPath()), { recursive: true });
    } catch (err) {
      throw SfError.wrap(err as Error);
    }

    let unlockFn: (() => void) | undefined;
    try {
      // lock the file.  Returns an unlock function to call when done.
      unlockFn = lockSync(this.getPath(), lockOptions);
      // get the file modstamp.  Do this after the lock acquisition in case the file is being written to.
      const fileTimestamp = fs.statSync(this.getPath(), { bigint: true }).mtimeNs;

      // read the file contents into a LWWMap using the modstamp
      const stateFromFile = stateFromContents<P>(
        parseJsonMap<P>(fs.readFileSync(this.getPath(), 'utf8'), this.getPath()),
        fileTimestamp,
        this.getPath()
      );
      // merge the new contents into the in-memory LWWMap
      this.contents.merge(stateFromFile);
    } catch (err) {
      if (err instanceof Error && err.message.includes('ENOENT')) {
        this.logger.debug(`No file found at ${this.getPath()}.  Write will create it.`);
      } else {
        throw err;
      }
    }

    // write the merged LWWMap to file

    this.logger.info(`Writing to config file: ${this.getPath()}`);
    fs.writeFileSync(this.getPath(), JSON.stringify(this.toObject(), null, 2));

    if (typeof unlockFn !== 'undefined') {
      // unlock the file
      unlockFn();
    }
    return this.getContents();
  }

  /**
   * Check to see if the config file exists. Returns `true` if the config file exists and has access, false otherwise.
   */
  public async exists(): Promise<boolean> {
    return this.access(fsConstants.R_OK);
  }

  /**
   * Check to see if the config file exists. Returns `true` if the config file exists and has access, false otherwise.
   */
  public existsSync(): boolean {
    return this.accessSync(fsConstants.R_OK);
  }

  /**
   * Get the stats of the file. Returns the stats of the file.
   *
   * {@link fs.stat}
   */
  public async stat(): Promise<fsStats> {
    return fs.promises.stat(this.getPath());
  }

  /**
   * Get the stats of the file. Returns the stats of the file.
   *
   * {@link fs.stat}
   */
  public statSync(): fsStats {
    return fs.statSync(this.getPath());
  }

  /**
   * Delete the config file if it exists.
   *
   * **Throws** *`Error`{ name: 'TargetFileNotFound' }* If the {@link ConfigFile.getFilename} file is not found.
   * {@link fs.unlink}
   */
  public async unlink(): Promise<void> {
    const exists = await this.exists();
    if (exists) {
      return fs.promises.unlink(this.getPath());
    }
    throw new SfError(`Target file doesn't exist. path: ${this.getPath()}`, 'TargetFileNotFound');
  }

  /**
   * Delete the config file if it exists.
   *
   * **Throws** *`Error`{ name: 'TargetFileNotFound' }* If the {@link ConfigFile.getFilename} file is not found.
   * {@link fs.unlink}
   */
  public unlinkSync(): void {
    const exists = this.existsSync();
    if (exists) {
      return fs.unlinkSync(this.getPath());
    }
    throw new SfError(`Target file doesn't exist. path: ${this.getPath()}`, 'TargetFileNotFound');
  }

  /**
   * Returns the absolute path to the config file.
   *
   * The first time getPath is called, the path is resolved and becomes immutable. This allows implementers to
   * override options properties, like filePath, on the init method for async creation. If that is required for
   * creation, the config files can not be synchronously created.
   */
  public getPath(): string {
    if (!this.path) {
      if (!this.options.filename) {
        throw new SfError('The ConfigOptions filename parameter is invalid.', 'InvalidParameter');
      }

      // Don't let users store config files in homedir without being in the state folder.
      let configRootFolder = this.options.rootFolder
        ? this.options.rootFolder
        : ConfigFile.resolveRootFolderSync(Boolean(this.options.isGlobal));

      if (this.options.isGlobal === true || this.options.isState === true) {
        configRootFolder = pathJoin(configRootFolder, this.options.stateFolder ?? Global.SFDX_STATE_FOLDER);
      }

      this.path = pathJoin(configRootFolder, this.options.filePath ? this.options.filePath : '', this.options.filename);
    }
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
   *
   * **Throws** *`Error`{ code: 'ENOENT' }* If the {@link ConfigFile.getFilename} file is not found when
   * options.throwOnNotFound is true.
   */
  protected async init(): Promise<void> {
    await super.init();

    // Read the file, which also sets the path and throws any errors around project paths.
    await this.read(this.options.throwOnNotFound);
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
     * The state folder where the config file is stored.
     */
    stateFolder?: string;
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
    /**
     * Indicates if init should throw if the corresponding config file is not found.
     */
    throwOnNotFound?: boolean;
  }
}
