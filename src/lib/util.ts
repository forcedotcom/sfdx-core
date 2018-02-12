/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { toUpper as _toUpper, size as _size } from 'lodash';
import { access, open, readdir, readFile, stat, writeFile,  unlink } from 'fs';
import { isEmpty } from 'lodash';
import { promisify } from 'util';
import { isNil as _isNil, endsWith as _endsWith, includes as _includes } from 'lodash';
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
     * Promisified version of fs.readFile
     */
    public static readFile = promisify(readFile);

    /**
     * Promisified version of fs.readdir
     */
    public static readdir = promisify(readdir);

    /**
     * Promisified version of fs.writeFile
     */
    public static writeFile = promisify(writeFile);

    /**
     * Promisified version of fs.access
     */
    public static access = promisify(access);

    /**
     * Promisified version of fs.open
     */
    public static open = promisify(open);

    /**
     * Promisified version of mkdirp
     * @param {string} folderPath The path of the folder to create.
     * @param {string} mode The mode to create the directory.
     * @returns {Promise<void>}
     */
    public static mkdirp: (folderPath: string, mode?: string | object) => Promise<void> = promisify(require('mkdirp'));

    public static DEFAULT_USER_DIR_MODE: string = '700';
    public static DEFAULT_USER_FILE_MODE: string = '600';

    /**
     * Promisified version of unlink
     */
    public static unlink = promisify(unlink);

    /**
     * Promisified version of stat
     */
    public static stat = promisify(stat);

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
        if (isEmpty(data) && throwOnEmpty) {
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
     * @param {*} urlString the url to inspect
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

        return !_isNil(whitelistOfSalesforceDomainPatterns.find((pattern) => _endsWith(url.hostname, pattern))) ||
            _includes(whitelistOfSalesforceHosts, url.hostname);
    }

    /**
     * Methods to ensure a environment variable is truthy. Truthy is defined as set to a non-null, non-empty, string
     * that's not equal to false.
     * @param {string} name - The name of the environment variable to check.
     * @returns {boolean} - true if the value of the env variable is truthy. false otherwise.
     */
    public static isEnvVarTruthy(name: string): boolean {
        if (!name) {
            return false;
        }
        const value = process.env[name];
        return value && _size(value) > 0 && _toUpper(value) !== 'FALSE';
    }
}

export default SfdxUtil;
