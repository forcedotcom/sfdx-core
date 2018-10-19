"use strict";
/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * Options when creating the config file.
 * @typedef {object} ConfigOptions
 * @property {string} rootFolder The root folder where the config file is stored.
 * @property {string} filename The file name.
 * @property {boolean} isGlobal If the file is in the global or project directory.
 * @property {boolean} isState If the file is in the state folder or no (.sfdx).
 * @property {string} filePath The full file path where the config file is stored.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ts_types_1 = require("@salesforce/ts-types");
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
const global_1 = require("../global");
const sfdxError_1 = require("../sfdxError");
const fs_2 = require("../util/fs");
const internal_1 = require("../util/internal");
const configStore_1 = require("./configStore");
/**
 * Represents a json config file used to manage settings and state. Global config
 * files are stored in the home directory hidden state folder (.sfdx) and local config
 * files are stored in the project path, either in the hidden state folder or wherever
 * specified.
 *
 * @extends BaseConfigStore
 *
 * @example
 * class MyConfig extents ConfigFile {
 *     public static getFileName(): string {
 *         return 'myConfigFilename.json';
 *     }
 * }
 * const myConfig = await MyConfig.create<MyConfig>();
 * myConfig.set('mykey', 'myvalue');
 * await myconfig.write();
 */
class ConfigFile extends configStore_1.BaseConfigStore {
    /**
     * Returns the config's filename.
     * @returns {string}
     */
    static getFileName() {
        // Can not have abstract static methods, so throw a runtime error.
        throw new sfdxError_1.SfdxError('Unknown filename for config file.');
    }
    /**
     * Returns the default options for the config file.
     * @param {boolean} isGlobal If the file should be stored globally or locally.
     * @param {string} filename The name of the config file.
     * @return {ConfigOptions} The ConfigOptions.
     */
    static getDefaultOptions(isGlobal = false, filename) {
        return {
            isGlobal,
            isState: true,
            filename: filename || this.getFileName()
        };
    }
    /**
     * Helper used to determined what the local and global folder point to.
     *
     * @param {boolean} isGlobal True if the config should be global. False for local.
     * @returns {Promise<string>} The file path of the root folder.
     */
    static async resolveRootFolder(isGlobal) {
        if (!ts_types_1.isBoolean(isGlobal)) {
            throw new sfdxError_1.SfdxError('isGlobal must be a boolean', 'InvalidTypeForIsGlobal');
        }
        return isGlobal ? os_1.homedir() : await internal_1.resolveProjectPath();
    }
    /**
     * Create an instance of this config file, without actually reading or writing the file.
     * After the instance is created, you can call {@link ConfigFile.read} to read the existing
     * file or {@link ConfigFile.write} to create or overwrite the file.
     *
     * **Note:** Cast to the extended class. e.g. `await MyConfig.create<MyConfig>();`
     *
     * @param {ConfigOptions} [options] The options used to create the file. Will use {@link ConfigFile.getDefaultOptions} by default.
     * {@link ConfigFile.getDefaultOptions} with no parameters by default.
     */
    static async create(options = {}) {
        const config = new this();
        let defaultOptions = {};
        try {
            defaultOptions = this.getDefaultOptions();
        }
        catch (e) { /* Some implementations don't let you call default options */ }
        // Merge default and passed in options
        config.options = Object.assign(defaultOptions, options);
        if (!config.options.filename) {
            throw new sfdxError_1.SfdxError('The ConfigOptions filename parameter is invalid.', 'InvalidParameter');
        }
        const _isGlobal = ts_types_1.isBoolean(config.options.isGlobal) && config.options.isGlobal;
        const _isState = ts_types_1.isBoolean(config.options.isState) && config.options.isState;
        // Don't let users store config files in homedir without being in the
        // state folder.
        let configRootFolder = config.options.rootFolder ? config.options.rootFolder :
            await this.resolveRootFolder(!!config.options.isGlobal);
        if (_isGlobal || _isState) {
            configRootFolder = path_1.join(configRootFolder, global_1.Global.STATE_FOLDER);
        }
        config.path = path_1.join(configRootFolder, config.options.filePath ? config.options.filePath : '', config.options.filename);
        return config;
    }
    /**
     * Creates the config instance and reads the contents of the existing file, if there is one.
     *
     * This is the same as
     * ```
     * const myConfig = await MyConfig.create<MyConfig>();
     * await myConfig.read();
     * ```
     *
     * **Note:** Cast to the extended class. e.g. `await MyConfig.retrieve<MyConfig>();`
     *
     * @param {ConfigOptions} [options] The options used to create the file. Will use {@link ConfigFile.getDefaultOptions} by default.
     * {@link ConfigFile.getDefaultOptions} with no parameters by default.
     */
    static async retrieve(options) {
        const config = await this.create(options);
        await config.read();
        return config;
    }
    /**
     * Determines if the config file is read/write accessible.
     * @param {number} perm The permission.
     * @returns {Promise<boolean>} `true` if the user has capabilities specified by perm.
     * @see {@link https://nodejs.org/api/fs.html#fs_fs_access_path_mode_callback|fs.access}
     */
    async access(perm) {
        try {
            await fs_2.access(this.getPath(), perm);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    /**
     * Read the config file and set the config contents.
     * @param {boolean} [throwOnNotFound = false] Optionally indicate if a throw should occur on file read.
     * @returns {Promise<object>} The config contents of the config file.
     * @throws {SfdxError}
     *    **`{name: 'UnexpectedJsonFileFormat'}`:** There was a problem reading or parsing the file.
     */
    async read(throwOnNotFound = false) {
        try {
            const obj = await fs_2.readJsonMap(this.getPath());
            this.setContentsFromObject(obj);
            return this.getContents();
        }
        catch (err) {
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
     * Write the config file with new contents. If no new contents are passed in
     * it will write the existing config contents that were set from {@link ConfigFile.read}, or an
     * empty file if {@link ConfigFile.read} was not called.
     *
     * @param {object} [newContents] The new contents of the file.
     * @returns {Promise<object>} The written contents.
     */
    async write(newContents) {
        if (newContents != null) {
            this.setContents(newContents);
        }
        await fs_2.mkdirp(path_1.dirname(this.getPath()));
        await fs_2.writeJson(this.getPath(), this.toObject());
        return this.getContents();
    }
    /**
     * Check to see if the config file exists.
     *
     * @returns {Promise<boolean>} True if the config file exists and has access, false otherwise.
     */
    async exists() {
        return await this.access(fs_1.constants.R_OK);
    }
    /**
     * Get the stats of the file.
     *
     * @returns {Promise<fs.Stats>} stats The stats of the file.
     * @see {@link https://nodejs.org/api/fs.html#fs_fs_fstat_fd_callback|fs.stat}
     */
    async stat() {
        return fs_2.stat(this.getPath());
    }
    /**
     * Delete the config file if it exists.
     *
     * @returns {Promise<boolean>} True if the file was deleted, false otherwise.
     * @see {@link https://nodejs.org/api/fs.html#fs_fs_unlink_path_callback|fs.unlink}
     */
    async unlink() {
        const exists = await this.exists();
        if (exists) {
            return await fs_2.unlink(this.getPath());
        }
        throw new sfdxError_1.SfdxError(`Target file doesn't exist. path: ${this.getPath()}`, 'TargetFileNotFound');
    }
    /**
     * Returns the path to the config file.
     * @returns {string}
     */
    getPath() {
        return this.path;
    }
    /**
     * Returns true if this config is using the global path, false otherwise.
     * @returns {boolean}
     */
    isGlobal() {
        return !!this.options.isGlobal;
    }
}
exports.ConfigFile = ConfigFile;
//# sourceMappingURL=configFile.js.map