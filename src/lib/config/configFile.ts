/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

// Node
import { join as pathJoin, dirname as pathDirname } from 'path';

import { isBoolean as _isBoolean, isNil as _isNil } from 'lodash';
import { Global } from '../global';
import { SfdxError } from '../sfdxError';

// Local
import { SfdxUtil } from '../util';

/**
 * Represents a json config file that the toolbelt uses to manage settings and
 * state. Global config files are stord in the home directory hidden state
 * folder (.sfdx) and local config files are stored in the project path, either
 * in the hidden state folder or wherever specified.
 */
export class ConfigFile {

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
     * Read the config file and set "this.contents"
     *
     * @returns {Promise<object>} the json contents of the config file
     * @throws {Error} Throws error if there was a problem reading or parsing the file
     */
    public async read(): Promise<object> {
        try {
            this.contents = await SfdxUtil.readJSON(this.path);
            return this.contents;
        } catch (err) {
            if (err.code === 'ENOENT') {
                this.contents = {};
                return this.contents;
            } else {
                throw err;
            }
        }
    }

    /**
     * Write the config file with new contents. If no new contents are passed in
     * it will write this.contents that was set from read().
     *
     * @param {object} newContents the new contents of the file
     * @returns {Promise<object>} the written contents
     */
    public async write(newContents): Promise<object> {
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
    public async deletes(): Promise<void> {
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
