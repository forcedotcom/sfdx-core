/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

import { Stats as fsStats, constants as fsConstants } from 'fs';
import { join as pathJoin, dirname as pathDirname } from 'path';
import { isBoolean as _isBoolean, isNil as _isNil } from 'lodash';
import { BaseConfigStore, ConfigContents } from './configStore';
import { Global } from '../global';
import { SfdxError } from '../sfdxError';
import { homedir as osHomedir } from 'os';
import { SfdxUtil } from '../util';

/**
 * The interface for Config options.
 * @class
 * @interface
 */
export interface ConfigOptions {
    rootFolder?: string;
    filename?: string;
    isGlobal?: boolean;
    isState?: boolean;
    filePath?: string;
}

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
export class ConfigFile extends BaseConfigStore {
    /**
     * Returns the config's filename.
     * @returns {string}
     */
    public static getFileName(): string {
        // Can not have abstract static methods, so throw a runtime error.
        throw new SfdxError('Unknown filename for config file.');
    }

    /**
     * Returns the default options for the config file.
     * @param {boolean} isGlobal - If the file should be stored globally or locally.
     * @param {string} filename - The name of the config file.
     * @return {ConfigOptions} - The ConfigOptions.
     */
    public static getDefaultOptions(isGlobal: boolean = false, filename?: string): ConfigOptions {
        return {
            isGlobal,
            isState: true,
            filename: filename || this.getFileName()
        };
    }

    /**
     * Helper used to determined what the local and global folder point to.
     *
     * @param {boolean} isGlobal - True if the config should be global. False for local.
     * @returns {Promise<string>} - The file path of the root folder.
     */
    public static async resolveRootFolder(isGlobal: boolean): Promise<string> {
        if (!_isBoolean(isGlobal)) {
            throw new SfdxError('isGlobal must be a boolean', 'InvalidTypeForIsGlobal');
        }
        return isGlobal ? osHomedir() : await SfdxUtil.resolveProjectPathFromCurrentWorkingDirectory();
    }

    /**
     * Create an instance of this config file, without actually reading or writing the file.
     * After the instance is created, you can call {@link ConfigFile.read} to read the existing
     * file or {@link ConfigFile.write} to create or overwrite the file.
     *
     * **Note:** Cast to the extended class. e.g. `await MyConfig.create<MyConfig>();`
     *
     * @param {ConfigOptions} options The options used to create the file. Will use {@link ConfigFile.getDefaultOptions} by default.
     * {@link ConfigFile.getDefaultOptions} with no parameters by default.
     */
    public static async create<T extends ConfigFile>(options?: ConfigOptions): Promise<T> {
        const config: T = new this() as T;
        config.options = options || this.getDefaultOptions();

        if (!config.options.filename) {
            throw new SfdxError('The ConfigOptions filename parameter is invalid.', 'InvalidParameter');
        }

        const _isGlobal: boolean = _isBoolean(config.options.isGlobal) && config.options.isGlobal;
        const _isState: boolean = _isBoolean(config.options.isState) && config.options.isState;

        // Don't let users store config files in homedir without being in the
        // state folder.
        let configRootFolder = config.options.rootFolder ? config.options.rootFolder :
            await this.resolveRootFolder(config.options.isGlobal);

        if (_isGlobal || _isState) {
            configRootFolder = pathJoin(configRootFolder, Global.STATE_FOLDER);
        }

        config.path = pathJoin(configRootFolder,
            config.options.filePath ? config.options.filePath : '', config.options.filename);

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
     * @param {ConfigOptions} options The options used to create the file. Will use {@link ConfigFile.getDefaultOptions} by default.
     * {@link ConfigFile.getDefaultOptions} with no parameters by default.
     */
    public static async retrieve<T extends ConfigFile>(options?: ConfigOptions): Promise<T> {
        const config: T = await this.create(options) as T;
        await config.read();
        return config;
    }

    private options: ConfigOptions;
    private path: string;

    /**
     * Determines if the config file is read write accessible.
     * @param {number} perm - The permission.
     * @returns {Promise<boolean>} - returns true if the user has capabilities specified by perm.
     * @see {@link SfdxUtil.access}
     */
    public async access(perm: number): Promise<boolean> {
        try {
            await SfdxUtil.access(this.getPath(), perm);
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * Read the config file and set the config contents.
     * @param {boolean} throwOnNotFound - Optionally indicate if a throw should occur on file read.
     * @returns {Promise<object>} the config contents of the config file.
     * @throws {Error} Throws error if there was a problem reading or parsing the file.
     */
    public async read(throwOnNotFound: boolean = false): Promise<ConfigContents> {
        try {
            this.setContentsFromObject(await SfdxUtil.readJSON(this.getPath()));
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
     * Write the config file with new contents. If no new contents are passed in
     * it will write the existing config contents that was set from {@link ConfigFile.read}, or empty
     * if {@link ConfigFile.read} was not called.
     *
     * @param {object} newContents The new contents of the file.
     * @returns {Promise<object>} The written contents.
     */
    public async write(newContents?: ConfigContents): Promise<object> {
        if (!_isNil(newContents)) {
            this.setContents(newContents);
        }

        await SfdxUtil.mkdirp(pathDirname(this.getPath()));

        await SfdxUtil.writeFile(this.getPath(), JSON.stringify(this.toObject(), null, 4));

        return this.getContents();
    }

    /**
     * Check to see if the config file exists.
     *
     * @returns {Promise<boolean>} True if the config file exists and has access false otherwise.
     */
    public async exists(): Promise<boolean> {
        return await this.access(fsConstants.R_OK);
    }

    /**
     * Get the stats of the file.
     *
     * @returns {Promise<fs.Stats>} stats The stats of the file.
     * @see {@link SfdxUtil.stat}
     */
    public async stat(): Promise<fsStats> {
        return SfdxUtil.stat(this.getPath());
    }

    /**
     * Delete the config file if it exists.
     *
     * @returns {Promise<boolean>} True if the file was deleted, false otherwise.
     * @see {@link SfdxUtil.unlink}
     */
    public async unlink(): Promise<void> {
        const exists = await this.exists();
        if (exists) {
            return await SfdxUtil.unlink(this.getPath());
        }
        throw new SfdxError(`Target file doesn't exist. path: ${this.getPath()}`, 'TargetFileNotFound');
    }

    /**
     * Returns path to the config file.
     * @returns {string}
     */
    public getPath(): string {
        return this.path;
    }

    /**
     * Returns true if this config is using the global path, false otherwise.
     * @returns {boolean}
     */
    public getIsGlobal(): boolean {
        return this.options.isGlobal;
    }

}
