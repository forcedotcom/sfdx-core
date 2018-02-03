/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

// Node
import * as Path from 'path';

import * as _ from 'lodash';
import { SfdxConstant } from '../sfdxConstants';
import { SfdxError } from '../sfdxError';

// Local
import { SfdxUtil } from '../util';

/**
 * Represents a json config file that the toolbelt uses to manage settings and
 * state. Global config files are stores in the home directory hidden state
 * folder (.sfdx) and local config files are stored in the project path, either
 * in the hidden state folder or wherever specifed.
 *
 */
// l
export class ConfigFile {

    protected name: string;
    protected path: string;
    protected contents: any;
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
     * witin the file root. This will automatically be set to true if isGlobal is true.
     * @param {string} filePath The path of the config file appended to the file
     * root. i.e. a relatvie path from the global or local project directories.
     * @throws {Error} Throws an InvalidParameter error if name is not a non-empty string.
     * @throws {Error} Throws an InvalidProjectWorkspace error trying to instantiate a
     * local config file outside of a project workpace
     */
    protected constructor(rootFolder: string, fileName: string, isGlobal: boolean = false, isState: boolean = true, filePath: string = '') {
        if (!rootFolder) {
            throw new SfdxError('rootFolder is not specified', 'InvalidParameter');
        }

        if (!fileName) {
            throw new SfdxError('The name parameter is invalid.', 'InvalidParameter');
        }

        isGlobal = _.isBoolean(isGlobal) && isGlobal;
        isState = _.isBoolean(isState) && isState;

        // Don't let users store config files in homedir without being in the
        // state folder.
        let configRootFolder = rootFolder;
        if (isGlobal || isState) {
            configRootFolder = Path.join(rootFolder, SfdxConstant.STATE_FOLDER);
        }
        this.isGlobal = isGlobal;
        this.name = fileName;
        this.path = Path.join(configRootFolder, filePath, fileName);
    }

    /**
     * Read the config file and set this.contents
     *
     * @returns {Promise<object>} the json contents of the config file
     * @throws {Error} Throws error if there was a problem reading or parsing the file
     */
    public async read() {
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
     * Write the config file with new contents. If no new contents is passed in,
     * it will write this.contents that was set from read().
     *
     * @param {object} newContents the new contents of the file
     * @returns {Promise<object>} the written contents
     */
    public async write(newContents) {
        if (!_.isNil(newContents)) {
            this.contents = newContents;
        }

        await SfdxUtil.mkdirp(Path.dirname(this.path));

        await SfdxUtil.writeFile(this.path, JSON.stringify(this.contents, null, 4));

        return this.contents;
    }

    /**
     * Check to see if the config file exists
     *
     * @returns {Promise<boolean>} true if the config file exists and has access,
     * false otherwise.
     */
    public async exists() {
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
     * @returns {Promise<boolean>} true if the file was deleted, false otherwise
     */
    public async deletes() {
        const exists = this.exists();
        if (exists) {
            await SfdxUtil.unlink(this.path);
            return true;
        }
        return false;
    }

    public getPath(): string {
        return this.path;
    }

    public getContents(): string {
        return this.contents;
    }

    public setContents(value: any) {
        this.contents = value;
    }

    public getIsGlobal(): boolean {
        return this.isGlobal;
    }
}
