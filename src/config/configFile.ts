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
import { promisify } from 'util';
import { isBoolean, isPlainObject } from '@salesforce/ts-types';
import { parseJsonMap } from '@salesforce/kit';
import * as mkdirp from 'mkdirp';
import * as lockfile from 'lockfile';
import { Global } from '../global';
import { Logger } from '../logger';
import { SfError } from '../sfError';
import { resolveProjectPath, resolveProjectPathSync } from '../util/internal';
import { Messages } from '../messages';
import { BaseConfigStore, ConfigContents } from './configStore';

const lockSync = lockfile.lock;
const unlockSync = lockfile.unlock;
const lock = promisify((filePath: string, opts: lockfile.Options, cb: (err: Error | null) => void) =>
  lockfile.lock(filePath, opts, cb)
);
const unlock = promisify(lockfile.unlock);

const lockFileOpts = {
  wait: 30_000,
  retries: 300,
  retryWait: 100,
  stale: 10_000,
};

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/core', 'config', ['couldNotObtainLock', 'couldNotUnlockFile']);
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
      filename: filename || this.getFileName(),
      stateFolder: Global.SF_STATE_FOLDER,
      useFileLock: true,
    };
  }

  /**
   * Helper used to determine what the local and global folder point to. Returns the file path of the root folder.
   *
   * @param isGlobal True if the config should be global. False for local.
   */
  public static async resolveRootFolder(isGlobal: boolean): Promise<string> {
    return isGlobal ? osHomedir() : await resolveProjectPath();
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
    const start = Date.now();
    if (!this.options.useFileLock) {
      await this._read(throwOnNotFound, force);
      return this.getContents();
    } else {
      return lock(this.getLockFilePath(), lockFileOpts)
        .then(async () => {
          try {
            await this._read(throwOnNotFound, force);
            await unlock(this.getLockFilePath()).catch((reason) => {
              throw messages.createError('couldNotUnlockFile', [this.getPath(), 'read'], [], reason);
            });
          } catch (err) {
            await unlock(this.getLockFilePath()).catch((reason) => {
              throw messages.createError('couldNotUnlockFile', [this.getPath(), 'read'], [], reason);
            });
            throw err;
          }
          this.logger.debug(`time in read: ${Date.now() - start}`);
          return this.getContents();
        })
        .catch(async (reason) => {
          this.logger.error(messages.getMessage('couldNotObtainLock', ['read', this.getPath()]), reason);
          throw messages.createError('couldNotObtainLock', ['read', this.getPath()], [], reason);
        });
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
    if (!this.options.useFileLock) {
      this._readSync(throwOnNotFound, force);
      return this.getContents();
    } else {
      lockSync(this.getLockFilePath(), lockFileOpts, (err) => {
        if (err) {
          this.logger.error(messages.getMessage('couldNotObtainLock', ['readSync', this.getPath()]), err);
          throw messages.createError('couldNotObtainLock', ['readSync', this.getPath()], undefined, err);
        }

        try {
          this._readSync(force);
          unlockSync(this.getLockFilePath(), (err) => {
            if (err) {
              this.logger.error(messages.getMessage('couldNotUnlockFile', [this.getPath(), 'readSync']), err);
              throw messages.createError('couldNotUnlockFile', [this.getPath(), 'readSync'], undefined, err);
            }
          });
        } catch (err) {
          unlockSync(this.getLockFilePath(), (err) => {
            if (err) {
              this.logger.error(messages.getMessage('couldNotUnlockFile', [this.getPath(), 'readSync']), err);
              throw messages.createError('couldNotUnlockFile', [this.getPath(), 'readSync'], undefined, err);
            }
          });
        }
      });
    }
    return this.getContents();
  }

  /**
   * Write the config file with new contents. If no new contents are provided it will write the existing config
   * contents that were set from {@link ConfigFile.read}, or an empty file if {@link ConfigFile.read} was not called.
   *
   * @param newContents The new contents of the file.
   */
  public async write(newContents?: P): Promise<P> {
    const start = Date.now();
    if (!this.options.useFileLock) {
      await this._write(newContents);
      return this.getContents();
    } else {
      return lock(this.getLockFilePath(), lockFileOpts)
        .then(async () => {
          await this._write(newContents);
          await unlock(this.getLockFilePath()).catch((reason) => {
            this.logger.error(messages.getMessage('couldNotUnlockFile', [this.getPath(), 'write']), reason);
            throw messages.createError('couldNotUnlockFile', [this.getPath(), 'write'], undefined, reason);
          });
          this.logger.debug(`time in write: ${Date.now() - start}`);
          return this.getContents();
        })
        .catch(async (reason) => {
          this.logger.error(messages.getMessage('couldNotObtainLock', ['write', this.getPath()]), reason);
          throw messages.createError('couldNotObtainLock', ['write', this.getPath()], undefined, reason);
        });
    }
  }

  /**
   * Write the config file with new contents. If no new contents are provided it will write the existing config
   * contents that were set from {@link ConfigFile.read}, or an empty file if {@link ConfigFile.read} was not called.
   *
   * @param newContents The new contents of the file.
   */
  public writeSync(newContents?: P): P {
    if (!this.options.useFileLock) {
      this._writeSync(newContents);
    } else {
      lockSync(this.getLockFilePath(), lockFileOpts, (err) => {
        if (err) {
          this.logger.error(messages.getMessage('couldNotObtainLock', ['writeSync', this.getPath()]), err);
          throw messages.createError('couldNotObtainLock', ['writeSync', this.getPath()], undefined, err);
        }
        try {
          this._writeSync(newContents);
          unlockSync(this.getLockFilePath(), (err) => {
            if (err) {
              this.logger.error(messages.getMessage('couldNotUnlockFile', [this.getPath(), 'writeSync']), err);
              throw messages.createError('couldNotUnlockFile', [this.getPath(), 'writeSync'], undefined, err);
            }
          });
        } catch {
          unlockSync(this.getLockFilePath(), (err) => {
            if (err) {
              this.logger.error(messages.getMessage('couldNotUnlockFile', [this.getPath(), 'writeSync']), err);
              throw messages.createError('couldNotUnlockFile', [this.getPath(), 'writeSync'], undefined, err);
            }
          });
        }
      });
    }

    return this.getContents();
  }

  /**
   * Check to see if the config file exists. Returns `true` if the config file exists and has access, false otherwise.
   */
  public async exists(): Promise<boolean> {
    return await this.access(fsConstants.R_OK);
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
      return await fs.promises.unlink(this.getPath());
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

      const _isGlobal: boolean = isBoolean(this.options.isGlobal) && this.options.isGlobal;
      const _isState: boolean = isBoolean(this.options.isState) && this.options.isState;

      // Don't let users store config files in homedir without being in the state folder.
      let configRootFolder = this.options.rootFolder
        ? this.options.rootFolder
        : ConfigFile.resolveRootFolderSync(!!this.options.isGlobal);

      if (_isGlobal || _isState) {
        configRootFolder = pathJoin(configRootFolder, this.options.stateFolder || Global.SF_STATE_FOLDER);
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

  private async _read(throwOnNotFound = false, force = false): Promise<P> {
    // Only need to read config files once.  They are kept up to date
    // internally and updated persistently via write().
    try {
      if (!this.hasRead || force) {
        this.logger.info(`Reading config file: ${this.getPath()}`);
        const obj = await this.loadFromFile(throwOnNotFound);
        this.setContentsFromObject(obj);
      }
    } catch (err) {
      if ((err as SfError).code === 'ENOENT') {
        if (!throwOnNotFound) {
          this.setContents();
        } else {
          throw err;
        }
      }
    } finally {
      this.hasRead = true;
    }
    return this.getContents();
  }

  private _readSync(throwOnNotFound = false, force = false): P {
    // Only need to read config files once.  They are kept up to date
    // internally and updated persistently via write().
    try {
      if (!this.hasRead || force) {
        this.logger.info(`Reading config file: ${this.getPath()}`);
        const obj = this.loadFromFileSync();
        this.setContentsFromObject(obj);
      }
    } catch (err) {
      if ((err as SfError).code === 'ENOENT') {
        if (!throwOnNotFound) {
          this.setContents();
        } else {
          throw err;
        }
      }
    } finally {
      this.hasRead = true;
    }
    return this.getContents();
  }

  private async _write(newContents: P | undefined): Promise<void> {
    // if newContents is not undefined, then assume no diff is needed.
    if (newContents) {
      this.setContents(newContents);
    } else {
      const fileContents = await this.loadFromFile(false);
      this.diffAndPatchContents(fileContents);
    }

    await mkdirp(pathDirname(this.getPath()));

    this.logger.info(`Writing to config file: ${this.getPath()}`);
    await fs.promises.writeFile(this.getPath(), JSON.stringify(this.toObject(), null, 2));
    this.setOriginalContents(this.getContents());
  }

  private _writeSync(newContents: P | undefined): void {
    // if newContents is not undefined, then assume no diff is needed.
    if (isPlainObject(newContents)) {
      this.setContents(newContents);
    } else {
      const fileContents = this.loadFromFileSync(false);
      this.diffAndPatchContents(fileContents);
    }

    mkdirp.sync(pathDirname(this.getPath()));

    this.logger.info(`Writing to config file: ${this.getPath()}`);
    fs.writeFileSync(this.getPath(), JSON.stringify(this.toObject(), null, 2));
    this.setOriginalContents(this.getContents());
  }

  private getLockFilePath(): string {
    this.createLockFilePath();
    return pathJoin(`${this.getPath()}.lock`);
  }
  private loadFromFileSync(throwOnError = true): P {
    try {
      return parseJsonMap<P>(fs.readFileSync(this.getPath(), 'utf8'));
    } catch (err) {
      if (throwOnError) {
        throw err;
      }
      return {} as P;
    }
  }

  private async loadFromFile(throwOnError = true): Promise<P> {
    try {
      const contents = await fs.promises.readFile(this.getPath(), 'utf8');
      return parseJsonMap<P>(contents);
    } catch (err) {
      if (throwOnError) {
        throw err;
      }
      return {} as P;
    }
  }

  private createLockFilePath() {
    const parentDir = pathDirname(this.getPath());
    if (!fs.existsSync(parentDir)) {
      mkdirp.sync(parentDir);
    }
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
    /**
     * Indicates file locking should be used for this config file.
     */
    useFileLock?: boolean;
  }
}
