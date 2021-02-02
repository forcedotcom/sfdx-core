'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('../index-ffe6ca9f.js');
var fs = require('fs');
var os = require('os');
var path = require('path');
var global = require('../global.js');
var logger = require('../logger.js');
var messages = require('../messages.js');
var sfdxError = require('../sfdxError.js');
var util_fs = require('../util/fs.js');
var util_internal = require('../util/internal.js');
var config_configStore = require('./configStore.js');
require('../_commonjsHelpers-49936489.js');
require('../index-aea73a28.js');
require('crypto');
require('constants');
require('stream');
require('util');
require('assert');
require('events');
require('../index-e6d82ffe.js');
require('tty');

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
messages.Messages.importMessagesDirectory(path.join(__dirname));
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
class ConfigFile extends config_configStore.BaseConfigStore {
  /**
   * Constructor
   * **Do not directly construct instances of this class -- use {@link ConfigFile.create} instead.**
   * @param options The options for the class instance
   * @ignore
   */
  constructor(options) {
    super(options);
    // whether file contents have been read
    this.hasRead = false;
  }
  /**
   * Returns the config's filename.
   */
  static getFileName() {
    // Can not have abstract static methods, so throw a runtime error.
    throw new sfdxError.SfdxError('Unknown filename for config file.');
  }
  /**
   * Returns the default options for the config file.
   * @param isGlobal If the file should be stored globally or locally.
   * @param filename The name of the config file.
   */
  static getDefaultOptions(isGlobal = false, filename) {
    return {
      isGlobal,
      isState: true,
      filename: filename || this.getFileName()
    };
  }
  /**
   * Helper used to determined what the local and global folder point to. Returns the file path of the root folder.
   *
   * @param isGlobal True if the config should be global. False for local.
   */
  static async resolveRootFolder(isGlobal) {
    if (!index.lib.isBoolean(isGlobal)) {
      throw new sfdxError.SfdxError('isGlobal must be a boolean', 'InvalidTypeForIsGlobal');
    }
    return isGlobal ? os.homedir() : await util_internal.resolveProjectPath();
  }
  /**
   * Determines if the config file is read/write accessible. Returns `true` if the user has capabilities specified
   * by perm.
   * @param {number} perm The permission.
   *
   * **See** {@link https://nodejs.org/dist/latest/docs/api/fs.html#fs_fs_access_path_mode_callback}
   */
  async access(perm) {
    try {
      await util_fs.fs.access(this.getPath(), perm);
      return true;
    } catch (err) {
      return false;
    }
  }
  /**
   * Read the config file and set the config contents. Returns the config contents of the config file. As an
   * optimization, files are only read once per process and updated in memory and via `write()`. To force
   * a read from the filesystem pass `force=true`.
   * **Throws** *{@link SfdxError}{ name: 'UnexpectedJsonFileFormat' }* There was a problem reading or parsing the file.
   * @param [throwOnNotFound = false] Optionally indicate if a throw should occur on file read.
   * @param [force = true] Optionally force the file to be read from disk even when already read within the process.
   */
  async read(throwOnNotFound = false, force = true) {
    try {
      // Only need to read config files once.  They are kept up to date
      // internally and updated persistently via write().
      if (!this.hasRead || force) {
        this.logger.info(`Reading config file: ${this.getPath()}`);
        const obj = await util_fs.fs.readJsonMap(this.getPath());
        this.setContentsFromObject(obj);
      }
      return this.getContents();
    } catch (err) {
      if (err.code === 'ENOENT') {
        if (!throwOnNotFound) {
          this.setContents();
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
  async write(newContents) {
    if (newContents != null) {
      this.setContents(newContents);
    }
    await util_fs.fs.mkdirp(path.dirname(this.getPath()));
    this.logger.info(`Writing to config file: ${this.getPath()}`);
    await util_fs.fs.writeJson(this.getPath(), this.toObject());
    return this.getContents();
  }
  /**
   * Check to see if the config file exists. Returns `true` if the config file exists and has access, false otherwise.
   */
  async exists() {
    return await this.access(fs.constants.R_OK);
  }
  /**
   * Get the stats of the file. Returns the stats of the file.
   *
   * {@link fs.stat}
   */
  async stat() {
    return util_fs.fs.stat(this.getPath());
  }
  /**
   * Delete the config file if it exists. Returns `true` if the file was deleted, `false` otherwise.
   *
   * {@link fs.unlink}
   */
  async unlink() {
    const exists = await this.exists();
    if (exists) {
      return await util_fs.fs.unlink(this.getPath());
    }
    throw new sfdxError.SfdxError(`Target file doesn't exist. path: ${this.getPath()}`, 'TargetFileNotFound');
  }
  /**
   * Returns the path to the config file.
   */
  getPath() {
    return this.path;
  }
  /**
   * Returns `true` if this config is using the global path, `false` otherwise.
   */
  isGlobal() {
    return !!this.options.isGlobal;
  }
  /**
   * Used to initialize asynchronous components.
   *
   * **Throws** *`Error`{ code: 'ENOENT' }* If the {@link ConfigFile.getFilename} file is not found when
   * options.throwOnNotFound is true.
   */
  async init() {
    this.logger = await logger.Logger.child(this.constructor.name);
    const statics = this.constructor;
    let defaultOptions = {};
    try {
      defaultOptions = statics.getDefaultOptions();
    } catch (e) {
      /* Some implementations don't let you call default options */
    }
    // Merge default and passed in options
    this.options = Object.assign(defaultOptions, this.options);
    if (!this.options.filename) {
      throw new sfdxError.SfdxError('The ConfigOptions filename parameter is invalid.', 'InvalidParameter');
    }
    const _isGlobal = index.lib.isBoolean(this.options.isGlobal) && this.options.isGlobal;
    const _isState = index.lib.isBoolean(this.options.isState) && this.options.isState;
    // Don't let users store config files in homedir without being in the
    // state folder.
    let configRootFolder = this.options.rootFolder
      ? this.options.rootFolder
      : await ConfigFile.resolveRootFolder(!!this.options.isGlobal);
    if (_isGlobal || _isState) {
      configRootFolder = path.join(configRootFolder, global.Global.STATE_FOLDER);
    }
    this.messages = messages.Messages.loadMessages('@salesforce/core', 'config');
    this.path = path.join(configRootFolder, this.options.filePath ? this.options.filePath : '', this.options.filename);
    await this.read(this.options.throwOnNotFound);
  }
}

exports.ConfigFile = ConfigFile;
//# sourceMappingURL=configFile.js.map
