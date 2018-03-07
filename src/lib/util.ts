/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { join as pathJoin } from 'path';
import * as _ from 'lodash';
import * as fs from 'fs';
import { sep as pathSep } from 'path';
import { promisify } from 'util';
import { SfdxError } from './sfdxError';
import { URL } from 'url';

const processJsonError = async (error: Error, data: string, jsonPath: string): Promise<void> => {
    if (error.name === 'SyntaxError') {
        const BUFFER = 20;

        // Get the position of the error from the error message.  This is the error index
        // within the file contents as 1 long string.
        const errPosition = parseInt(error.message.match(/position (\d+)/)[1], 10);

        // Get a buffered error portion to display, highlighting the error in red
        const start = Math.max(0, (errPosition - BUFFER));
        const end = Math.min(data.length, (errPosition + BUFFER));

        const errorPortion = data.substring(start, errPosition) +
            // logger.color.bgRed(data.substring(errPosition, errPosition + 1)) +
            data.substring(errPosition + 2, end);

        // only need to count new lines before the error position
        const lineNumber = data.substring(0, errPosition).split('\n').length;

        throw SfdxError.create('sfdx-core', 'core', 'JsonParseError', [jsonPath, lineNumber, errorPortion]);
    } else {
        throw error;
    }
};

/**
 * Common utility methods.
 */
export class SfdxUtil {
    /**
     * The file name of the sfdx-project.json.
     */
    // This has to be defined on util to prevent circular deps with project and configFile.
    public static SFDX_PROJECT_JSON = 'sfdx-project.json';

    /**
     * Promisified version of fs.readFile
     * @see https://nodejs.org/api/fs.html#fs_fs_readfile_path_options_callback
     */
    public static readFile = promisify(fs.readFile);

    /**
     * Promisified version of fs.readdir
     * @see https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback
     */
    public static readdir = promisify(fs.readdir);

    /**
     * Promisified version of fs.writeFile
     * @see https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
     */
    public static writeFile = promisify(fs.writeFile);

    /**
     * Promisified version of fs.access
     * @see https://nodejs.org/api/fs.html#fs_fs_access_path_mode_callback
     */
    public static access = promisify(fs.access);

    /**
     * Promisified version of fs.open
     * @see https://nodejs.org/api/fs.html#fs_fs_open_path_flags_mode_callback
     */
    public static open = promisify(fs.open);

    /**
     * Promisified version of mkdirp
     * @param {string} folderPath The path of the folder to create.
     * @param {string} mode The mode to create the directory.
     * @returns {Promise<void>}
     * @see https://nodejs.org/api/fs.html#fs_fs_mkdir_path_mode_callback
     */
    public static mkdirp: (folderPath: string, mode?: string | object) => Promise<void> = promisify(require('mkdirp'));

    public static DEFAULT_USER_DIR_MODE: string = '700';
    public static DEFAULT_USER_FILE_MODE: string = '600';

    /**
     * Promisified version of unlink
     * @see https://nodejs.org/api/fs.html#fs_fs_unlink_path_callback
     */
    public static unlink = promisify(fs.unlink);

    /**
     * Promisified version of rmdir
     * @see https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback
     */
    public static rmdir = promisify(fs.rmdir);

    /**
     * Promisified version of stat
     * @see https://nodejs.org/api/fs.html#fs_fs_fstat_fd_callback
     */
    public static stat = promisify(fs.stat);

    /**
     * Read a file and convert it to JSON
     *
     * @param {string} jsonPath The path of the file
     * @param {boolean} throwOnEmpty Whether to throw an error if the JSON file is empty
     * @return {Promise} promise The contents of the file as a JSON object
     */
    public static async readJSON(jsonPath: string, throwOnEmpty?: boolean): Promise<object> {
        const fileData = (await SfdxUtil.readFile(jsonPath, 'utf8'));
        return await SfdxUtil.parseJSON(fileData, jsonPath, throwOnEmpty);
    }

    /**
     * Convert a JSON object to a string and write it to a file.
     *
     * @param {string} jsonPath The path of the file
     * @param {object} data The JSON object to write
     * @return {Promise} promise
     */
    public static async writeJSON(jsonPath: string, data: object): Promise<void> {
        const fileData: string = JSON.stringify(data, null, 4);
        await SfdxUtil.writeFile(jsonPath, fileData, { encoding: 'utf8', mode: SfdxUtil.DEFAULT_USER_FILE_MODE });
    }

    /**
     * Parse json data from a file.
     * @param data Data to parse.
     * @param jsonPath The file path. Defaults to 'unknown'.
     * @param throwOnEmpty Throw an exception if the data contents are empty
     */
    public static async parseJSON(data: string, jsonPath: string = 'unknown', throwOnEmpty: boolean = true): Promise<object> {
        if (_.isEmpty(data) && throwOnEmpty) {
            throw SfdxError.create('sfdx-core', 'core', 'JsonParseError', [jsonPath, 1, 'FILE HAS NO CONTENT']);
        }

        try {
            return JSON.parse(data || '{}');
        } catch (error) {
            await processJsonError(error, data, jsonPath);
        }
    }

    /**
     * Returns true if a provided url contains a Salesforce owned domain.
     * @param {*} urlString the url to inspect.
     */
    public static isSalesforceDomain(urlString: string): boolean {
        let url: URL;

        try {
            url = new URL(urlString);
        } catch (e) {
            return false;
        }

        // Source https://help.salesforce.com/articleView?id=000003652&type=1
        const whitelistOfSalesforceDomainPatterns: string[] = [
            '.content.force.com',
            '.force.com',
            '.salesforce.com',
            '.salesforceliveagent.com',
            '.secure.force.com'
        ];

        const whitelistOfSalesforceHosts: string[] = [
            'developer.salesforce.com',
            'trailhead.salesforce.com'
        ];

        return !_.isNil(whitelistOfSalesforceDomainPatterns.find((pattern) => _.endsWith(url.hostname, pattern))) ||
            _.includes(whitelistOfSalesforceHosts, url.hostname);
    }

    /**
     * Methods to ensure a environment variable is truthy. Truthy is defined as set to a non-null, non-empty, string
     * that's not equal to false.
     * @param {string} name The name of the environment variable to check.
     * @returns {boolean} true if the value of the env variable is truthy.
     */
    public static isEnvVarTruthy(name: string): boolean {
        if (!name) {
            return false;
        }
        const value = process.env[name];
        return value && _.size(value) > 0 && _.toUpper(value) !== 'FALSE';
    }

    /**
     * Deletes a folder recursively, removing all descending files and folders.
     * @param {string} path The path to remove.
     * @returns {Promise<void>}
     * @throws {SfdxError} If the folder or any sub-folder is missing or has no access.
     */
    public static remove(path: string): Promise<void> {
        if (!path) {
            throw new SfdxError('Path is null or undefined.', 'PathIsNullOrUndefined');
        }
        return SfdxUtil.access(path, fs.constants.R_OK)
            .catch(() => {
                throw new SfdxError(`The path: ${path} doesn\'t exists or access is denied.`);
            })
            .then(() => SfdxUtil.readdir(path))
            .then((files) => {
                return Promise.all(_.map(files, (file) => SfdxUtil.stat(pathJoin(path, file))))
                    .then((stats) => {
                        stats.forEach((stat, index) => {
                            stat['path'] = pathJoin(path, files[index]);
                        });
                        return stats;
                    });
            })
            .then((metas) => {
                return Promise.all(_.map(metas, (meta: any) => {
                    if (meta.isDirectory()) {
                        return SfdxUtil.remove(meta.path);
                    } else {
                        return SfdxUtil.unlink(meta.path);
                    }
                }));
            }).then(() => {
                return SfdxUtil.rmdir(path);
            });
    }

    /**
     *  Returns the first key within the object that has an upper case first letter.
     *
     *  @param {Object} obj The object to check key casing.
     *  @return {string} The key that starts with upper case.
     */
    public static findUpperCaseKeys(obj: object): string {
        let _key;
        _.findKey(obj, (val, key) => {
            if (key[0] === key[0].toUpperCase()) {
                _key = key;
            } else if (_.isPlainObject(val)) {
                _key = this.findUpperCaseKeys(val);
            }
            return _key;
        });

        return _key;
    }

    /**
     * Converts the 18 character Salesforce ID to 15 characters.
     * @param {string} id the id to convert.
     * @return {string} 15 character version of the ID.
     */
    public static trimTo15(id: string): string {
        if (id && id.length && id.length > 15) {
            id = id.substring(0, 15);
        }
        return id;
    }

    /**
     * Traverse the filesystem for a specific file.
     * @param {string} workingDir The directory in which to start traversing.
     * @param {string} file The file name to look for.
     * @returns {string} The path of the file, or null if not found.
     */
    public static async traverseForFile(workingDir: string, file: string): Promise<string> {
        let foundProjectDir: string = null;
        try {
            await SfdxUtil.stat(pathJoin(workingDir, file));
            foundProjectDir = workingDir;
        } catch (err) {
            if (err && err.code === 'ENOENT') {
                const indexOfLastSlash: number = workingDir.lastIndexOf(pathSep);
                if (indexOfLastSlash > 0) {
                    await SfdxUtil.traverseForFile(workingDir.substring(0, indexOfLastSlash), file);
                }
            }
        }
        return foundProjectDir;
    }

    /**
     * Traverses for the sfdx project path from the current working directory.
     * @throws InvalidProjectWorkspace - If the current folder is not located in a workspace.
     * @returns {Promise<string>} The absolute path to the project.
     */
    public static async resolveProjectPathFromCurrentWorkingDirectory(): Promise<string> {
        const path = await SfdxUtil.traverseForFile(process.cwd(), SfdxUtil.SFDX_PROJECT_JSON);

        if (!path) {
            throw SfdxError.create('sfdx-core', 'config', 'InvalidProjectWorkspace');
        }

        return path;
    }

    /**
     * Tests whether an API version is in the correct format.
     * @param value The API version as a string.
     * @returns {boolean} true if the value is in the format "i.0"
     */
    public static validateApiVersion(value: string): boolean {
        return _.isNil(value) || /[1-9]\d\.0/.test(value);
    }
}
