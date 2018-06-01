/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as _ from 'lodash';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import { promisify } from 'util';
import { SfdxError } from './sfdxError';
import { URL } from 'url';
import { AnyJson, JsonMap, isJsonMap, isJsonArray } from './types';

/**
 * Common utility methods.
 */
export class SfdxUtil {

    /**
     * The name of the project config file.
     */
    // This has to be defined on util to prevent circular deps with project and configFile.
    public static readonly SFDX_PROJECT_JSON = 'sfdx-project.json';

    /**
     * The default file system mode to use when creating directories.
     */
    public static readonly DEFAULT_USER_DIR_MODE: string = '700';

    /**
     * The default file system mode to use when creating files.
     */
    public static readonly DEFAULT_USER_FILE_MODE: string = '600';

    /**
     * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_readfile_path_options_callback|fs.readFile}.
     */
    public static readonly readFile = promisify(fs.readFile);

    /**
     * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback|fs.readdir}.
     */
    public static readonly readdir = promisify(fs.readdir);

    /**
     * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback|fs.writeFile}.
     */
    public static readonly writeFile = promisify(fs.writeFile);

    /**
     * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_access_path_mode_callback|fs.access}.
     */
    public static readonly access = promisify(fs.access);

    /**
     * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_open_path_flags_mode_callback|fs.open}.
     */
    public static readonly open = promisify(fs.open);

    /**
     * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_unlink_path_callback|fs.unlink}.
     */
    public static readonly unlink = promisify(fs.unlink);

    /**
     * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback|fs.rmdir}.
     */
    public static readonly rmdir = promisify(fs.rmdir);

    /**
     * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_fstat_fd_callback|fs.stat}.
     */
    public static readonly stat = promisify(fs.stat);

    /**
     * Promisified version of {@link https://npmjs.com/package/mkdirp|mkdirp}.
     */
    public static readonly mkdirp: (folderPath: string, mode?: string | object) => Promise<void> = promisify(mkdirp);

    /**
     * Read a file and convert it to JSON.
     *
     * @param {string} jsonPath The path of the file.
     * @param {boolean} [throwOnEmpty] Whether to throw an error if the JSON file is empty.
     * @return {Promise<AnyJson>} The contents of the file as a JSON object.
     */
    public static async readJSON(jsonPath: string, throwOnEmpty?: boolean): Promise<AnyJson> {
        const fileData = await SfdxUtil.readFile(jsonPath, 'utf8');
        return await SfdxUtil.parseJSON(fileData, jsonPath, throwOnEmpty);
    }

    /**
     * Read a file and convert it to JSON, throwing an error if the parsed contents are not a `JsonMap`.
     *
     * @param {string} jsonPath The path of the file.
     * @param {boolean} [throwOnEmpty] Whether to throw an error if the JSON file is empty.
     * @return {Promise<JsonMap>} The contents of the file as a JSON object.
     */
    public static async readJSONObject(jsonPath: string, throwOnEmpty?: boolean): Promise<JsonMap> {
        const fileData = await SfdxUtil.readFile(jsonPath, 'utf8');
        return await SfdxUtil.parseJSONObject(fileData, jsonPath, throwOnEmpty);
    }

    /**
     * Convert a JSON-compatible object to a `string` and write it to a file.
     *
     * @param {string} jsonPath The path of the file to write.
     * @param {object} data The JSON object to write.
     * @return {Promise<void>}
     */
    public static async writeJSON(jsonPath: string, data: AnyJson): Promise<void> {
        const fileData: string = JSON.stringify(data, null, 4);
        await SfdxUtil.writeFile(jsonPath, fileData, { encoding: 'utf8', mode: SfdxUtil.DEFAULT_USER_FILE_MODE });
    }

    /**
     * Parse JSON `string` data.
     *
     * @param {string} data Data to parse.
     * @param {String} [jsonPath=unknown] The file path from which the JSON was loaded.
     * @param {boolean} [throwOnEmpty=true] If the data contents are empty.
     * @returns {Promise<AnyJson>}
     * @throws {SfdxError} **`{name: 'JsonParseError'}`** If the data contents are empty.
     */
    public static async parseJSON(data: string, jsonPath: string = 'unknown', throwOnEmpty: boolean = true): Promise<AnyJson> {
        if (_.isEmpty(data) && throwOnEmpty) {
            throw SfdxError.create('@salesforce/core', 'core', 'JsonParseError', [jsonPath, 1, 'FILE HAS NO CONTENT']);
        }

        try {
            return JSON.parse(data || '{}');
        } catch (error) {
            await processJsonError(error, data, jsonPath);
        }
    }

    /**
     * Parse JSON `string` data, expecting the result to be a `JsonMap`.
     *
     * @param {string} data Data to parse.
     * @param {String} [jsonPath=unknown] The file path from which the JSON was loaded.
     * @param {boolean} [throwOnEmpty=true] If the data contents are empty.
     * @returns {Promise<JsonMap>}
     * @throws {SfdxError} **`{name: 'JsonParseError'}`** If the data contents are empty.
     * @throws {SfdxError} **`{name: 'UnexpectedJsonFileFormat'}`** If the data contents are not a `JsonMap`.
     */
    public static async parseJSONObject(data: string, jsonPath?: string, throwOnEmpty?: boolean): Promise<JsonMap> {
        const json = await this.parseJSON(data, jsonPath, throwOnEmpty);
        if (json === null || json instanceof Array || (typeof json !== 'object')) {
            throw new SfdxError('UnexpectedJsonFileFormat');
        }
        return json;
    }

    /**
     * Finds all elements of type `T` with a given name in a `JsonMap`.  Not suitable for use
     * with object graphs containing circular references.  The specification of an appropriate
     * type `T` that will satisfy all matching element values is the responsibility of the caller.
     *
     * @param {JsonMap} json The JSON object tree to search for elements of the given name.
     * @param {string} name The name of elements to search for.
     * @returns {T[]} An array of matching elements.
     */
    public static getJSONElementsByName<T extends AnyJson>(json: JsonMap, name: string): T[] {
        let matches: T[] = [];
        if (json.hasOwnProperty(name)) {
            matches.push(json[name] as T); // Asserting T here assumes the caller knows what they are asking for
        }
        const maybeRecurse = (element: AnyJson): void => {
            if (isJsonMap(element)) {
                matches = matches.concat(SfdxUtil.getJSONElementsByName(element, name));
            }
        };
        _.forEach(json, (value) => isJsonArray(value) ? _.forEach(value, maybeRecurse) : maybeRecurse(value));
        return matches;
    }

    /**
     * Returns `true` if a provided URL contains a Salesforce owned domain.
     *
     * @param {string} urlString The URL to inspect.
     * @returns {boolean}
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
     * Returns `true` is an environment variable is "truthy". Truthiness is defined as set to a non-null, non-empty,
     * string that's not equal to `false`.
     *
     * @param {string} name The name of the environment variable to check.
     * @returns {boolean}
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
     *
     * @param {string} dirPath The path to remove.
     * @returns {Promise<void>}
     * @throws {SfdxError}
     *    **`{name: 'PathIsNullOrUndefined'}`** The path is not defined.
     * @throws {SfdxError}
     *    **`{name: 'DirMissingOrNoAccess'}`** The folder or any sub-folder is missing or has no access.
     */
    public static async remove(dirPath: string): Promise<void> {
        if (!dirPath) {
            throw new SfdxError('Path is null or undefined.', 'PathIsNullOrUndefined');
        }
        try {
            await SfdxUtil.access(dirPath, fs.constants.R_OK);
        } catch (err) {
            throw new SfdxError(`The path: ${dirPath} doesn\'t exist or access is denied.`, 'DirMissingOrNoAccess');
        }
        const files = await SfdxUtil.readdir(dirPath);
        const stats = await Promise.all(_.map(files, (file) => SfdxUtil.stat(path.join(dirPath, file))));
        const metas = _.map(stats, (stat, index) => {
            stat['path'] = path.join(dirPath, files[index]);
            return stat;
        });
        await Promise.all(_.map(metas, (meta) => {
            if (meta.isDirectory()) {
                return SfdxUtil.remove(meta['path']);
            } else {
                return SfdxUtil.unlink(meta['path']);
            }
        }));
        await SfdxUtil.rmdir(dirPath);
    }

    /**
     *  Returns the first key within the object that has an upper case first letter.
     *
     *  @param {Object<string, any>} obj The object in which to check key casing.
     *  @returns {string}
     */
    public static findUpperCaseKeys(obj: { [key: string]: any }): string { // tslint:disable-line:no-any
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
     * Converts an 18 character Salesforce ID to 15 characters.
     *
     * @param {string} id The id to convert.
     * @return {string}
     */
    public static trimTo15(id: string): string {
        if (id && id.length && id.length > 15) {
            id = id.substring(0, 15);
        }
        return id;
    }

    /**
     * Searches a file path in an ascending manner (until reaching the filesystem root) for the first occurrence a
     * specific file name.  Resolves with the directory path containing the located file, or `null` if the file was
     * not found.
     *
     * @param {string} dir The directory path in which to start the upward search.
     * @param {string} file The file name to look for.
     * @returns {Promise<string>}
     */
    public static async traverseForFile(dir: string, file: string): Promise<string> {
        let foundProjectDir: string = null;
        try {
            await SfdxUtil.stat(path.join(dir, file));
            foundProjectDir = dir;
        } catch (err) {
            if (err && err.code === 'ENOENT') {
                const nextDir = path.resolve(dir, '..');
                if (nextDir !== dir) { // stop at root
                    foundProjectDir = await SfdxUtil.traverseForFile(nextDir, file);
                }
            }
        }
        return foundProjectDir;
    }

    /**
     * Performs an upward directory search for an sfdx project file.
     *
     * @param {string} [dir=process.cwd()] The directory path to start traversing from.
     * @returns {Promise<string>} The absolute path to the project.
     * @throws {SfdxError} **`{name: 'InvalidProjectWorkspace'}`** If the current folder is not located in a workspace.
     * @see SfdxUtil.SFDX_PROJECT_JSON
     * @see SfdxUtil.traverseForFile
     * @see {@link https://nodejs.org/api/process.html#process_process_cwd|process.cwd()}
     */
    public static async resolveProjectPath(dir: string = process.cwd()): Promise<string> {
        const projectPath = await SfdxUtil.traverseForFile(dir, SfdxUtil.SFDX_PROJECT_JSON);
        if (!projectPath) {
            throw SfdxError.create('@salesforce/core', 'config', 'InvalidProjectWorkspace');
        }
        return projectPath;
    }

    /**
     * Tests whether an API version matches the format `i.0`.
     *
     * @param value The API version as a string.
     * @returns {boolean}
     */
    public static validateApiVersion(value: string): boolean {
        return _.isNil(value) || /[1-9]\d\.0/.test(value);
    }

    /**
     * Tests whether an email matches the format `me@my.org`
     *
     * @param value The email as a string.
     * @returns {boolean}
     */
    public static validateEmail(value: string): boolean {
        return /^[^.][^@]*@[^.]+(\.[^.\s]+)+$/.test(value);
    }

    /**
     * Tests whether a Salesforce ID is in the correct format, a 15- or 18-character length string with only letters and numbers
     * @param value The ID as a string.
     * @returns {boolean}
     */
    public static validateSalesforceId(value: string): boolean {
        return /[a-zA-Z0-9]{18}|[a-zA-Z0-9]{15}/.test(value) && (value.length === 15 || value.length === 18);
    }

    /**
     * Tests whether a path is in the correct format; the value doesn't include the characters "[", "]", "?", "<", ">", "?", "|"
     * @param value The path as a string.
     * @returns {boolean}
     */
    public static validatePathDoesNotContainInvalidChars(value: string): boolean {
        return !/[\[:"\?<>\|\]]+/.test(value);
    }

    /**
     * **This class contains static members only and cannot be instantiated.**
     *
     * @private
     */
    private constructor() {
    }
}

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

        throw SfdxError.create('@salesforce/core', 'core', 'JsonParseError', [jsonPath, lineNumber, errorPortion]);
    } else {
        throw error;
    }
};
