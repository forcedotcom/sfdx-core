/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

import { join as pathJoin, dirname as pathDirname } from 'path';
import { isBoolean as _isBoolean, isNil as _isNil } from 'lodash';
import { Global } from '../global';
import { SfdxError } from '../sfdxError';
import { homedir as osHomedir } from 'os';
import { SfdxUtil } from '../util';
import { ProjectDir } from '../projectDir';

/**
 * Represents a json config file that the toolbelt uses to manage settings and
 * state. Global config files are stord in the home directory hidden state
 * folder (.sfdx) and local config files are stored in the project path, either
 * in the hidden state folder or wherever specified.
 */
export class ConfigFile {

    /**
     * Helper used to determined what the local and global folder point to.
     * @param {boolean} isGlobal - True if the config should be global. False for local.
     * @returns {Promise<string>} - The filepath of the root folder.
     */
    public static async resolveRootFolder(isGlobal: boolean): Promise<string> {
        return isGlobal ? osHomedir() : await ProjectDir.getPath();
    }

    protected name: string;
    protected path: string;
    protected contents: object;
    protected isGlobal: boolean;

    /**
     * Constructor that sets the path and name. The path is generated from
     * all the passed in parameters.
     *
     * @param {string} rootFolder The root folder containing the .sfdx folder.
     * @param {string} fileName The name of the config file.
     * @param {boolean} isGlobal If true, file root is set to the home directory.
     * If false or not a boolean, file root is set to the project directory.
     * @param {boolean} isState If true, file is stored in the hidden state folder
     * within the file root. This will automatically be set to true if isGlobal is true.
     * @param {string} filePath The path of the config file appended to the file
     * root. i.e. a relative path from the global or local project directories.
     * @throws {Error} Throws an InvalidParameter error if name is not a non-empty string.
     * @throws {Error} Throws an InvalidProjectWorkspace error trying to instantiate a
     * local config file outside of a project workspace
     */
    protected constructor(rootFolder: string, fileName: string,
                          isGlobal: boolean = false, isState: boolean = true, filePath: string = '') {
        if (!rootFolder) {
            throw new SfdxError('rootFolder is not specified', 'InvalidParameter');
        }

        if (!fileName) {
            throw new SfdxError('The name parameter is invalid.', 'InvalidParameter');
        }

        const _isGlobal: boolean = _isBoolean(isGlobal) && isGlobal;
        const _isState: boolean = _isBoolean(isState) && isState;

        // Don't let users store config files in homedir without being in the
        // state folder.
        let configRootFolder = rootFolder;
        if (_isGlobal || _isState) {
            configRootFolder = pathJoin(rootFolder, Global.STATE_FOLDER);
        }
        this.isGlobal = _isGlobal;
        this.name = fileName;
        this.path = pathJoin(configRootFolder, filePath, fileName);
    }

    /**
     * Determines if the config file is read write accessible
     * @param {number} perm - The permission
     * @returns {Promise<boolean>} - returns true if the user has capabilities specified by perm.
     * @see {@link https://nodejs.org/api/fs.html#fs_fs_access_path_mode_callback}
     */
    public async access(perm: number): Promise<boolean> {
        try {
            await SfdxUtil.access(this.path, perm);
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * Read the config file and set "this.contents"
     * @param {boolean} throwOnNotFound - Optionally indicate if a throw should occur on file read.
     * @returns {Promise<object>} the json contents of the config file
     * @throws {Error} Throws error if there was a problem reading or parsing the file
     */
    public async read(throwOnNotFound: boolean = false): Promise<any> {
        try {
            this.contents = await SfdxUtil.readJSON(this.path);
            return this.contents;
        } catch (err) {
            if (err.code === 'ENOENT') {
                if (!throwOnNotFound) {
                    this.contents = {};
                    return this.contents;
                }
            }
            throw err;
        }
    }

    /**
     * Calls json.parse on the file content.
     * @param {boolean} throwOnNotFound - Optionally indicate if a throw should occur on undefined results.
     * @returns { Promise<object> } - The json representation of the config
     * @see SfdxUtil.parseJSON
     */
    public async readJSON(throwOnNotFound: boolean = true): Promise<object> {
        return this.read(throwOnNotFound);
    }

    /**
     * Write the config file with new contents. If no new contents are passed in
     * it will write this.contents that was set from read().
     *
     * @param {object} newContents the new contents of the file
     * @returns {Promise<object>} the written contents
     */
    public async write(newContents?: any): Promise<object> {
        if (!_isNil(newContents)) {
            this.contents = newContents;
        }

        await SfdxUtil.mkdirp(pathDirname(this.path));

        await SfdxUtil.writeFile(this.path, JSON.stringify(this.contents, null, 4));

        return this.contents;
    }

    /**
     * Check to see if the config file exists
     *
     * @returns {Promise<boolean>} true if the config file exists and has access false otherwise.
     */
    public async exists(): Promise<boolean> {
        try {
            await SfdxUtil.stat(this.path);
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * Delete the config file
     *
     * @returns {Promise<boolean>} true if the file was deleted false otherwise
     */
    public async unlink(): Promise<void> {
        const exists = await this.exists();
        if (exists) {
            return await SfdxUtil.unlink(this.path);
        }
        throw new SfdxError(`Target file doesn't exist. path: ${this.path}`, 'TargetFileNotFound');
    }

    /**
     * @returns {string} The path to the config file.
     */
    public getPath(): string {
        return this.path;
    }

    /**
     * @returns {string} The config contents from the json config
     */
    public getContents(): object {
        return this.contents;
    }

    /**
     * Sets the config contents
     * @param value {any} The target config contents
     * @returns {any}
     */
    public setContents(value: object): void {
        this.contents = value;
    }

    /**
     * @returns {boolean} true if this config is using the global path false otherwise
     */
    public getIsGlobal(): boolean {
        return this.isGlobal;
    }
}
