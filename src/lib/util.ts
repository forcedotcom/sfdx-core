/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { access, readFile, writeFile } from 'fs';
import { isEmpty } from 'lodash';
import { promisify } from 'util';

import { SfdxError } from './sfdxError';

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

        throw await SfdxError.create('sfdx-core', 'JsonParseError', [jsonPath, lineNumber, errorPortion]);
    } else {
        throw error;
    }
};

export class SfdxUtil {
    /**
     * Promisified version of fs.readFile
     */
    public static readFile = promisify(readFile);

    /**
     * Promisified version of fs.writeFile
     */
    public static writeFile = promisify(writeFile);

    /**
     * Promisified version of fs.access
     */
    public static access = promisify(access);

    /**
     * Promisified version of mkdirp
     */
    public static mkdirp = promisify(require('mkdirp'));

    /**
     * Read a file and convert it to JSON
     *
     * @param {string} jsonPath The path of the file
     * @param {boolean} throwOnEmpty Whether to throw an error if the JSON file is empty
     * @return {Promise} promise The contents of the file as a JSON object
     */
    public static async readJSON(jsonPath: string, throwOnEmpty?: boolean): Promise<object> {
        const fileData = (await SfdxUtil.readFile(jsonPath, 'utf8')).toString();
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
        await SfdxUtil.writeFile(jsonPath, fileData, 'utf8');
    }

    /**
     * Parse json data from a file.
     * @param data Data to parse.
     * @param jsonPath The file path. Defaults to 'unknown'.
     * @param throwOnEmpty Throw an exception if the data contents are empty
     */
    public static async parseJSON(data: string, jsonPath: string = 'unknown', throwOnEmpty: boolean = true): Promise<object> {
        if (isEmpty(data) && throwOnEmpty) {
            throw await SfdxError.create('sfdx-core', 'JsonParseError', [jsonPath, 1, 'FILE HAS NO CONTENT']);
        }

        try {
            return JSON.parse(data || '{}');
        } catch (error) {
            await processJsonError(error, data, jsonPath);
        }
    }
}
