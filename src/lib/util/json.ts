import { findKey } from 'lodash';
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * @module json
 */

import { isEmpty, isString, isNumber, isBoolean, isPlainObject, isArray, forEach } from 'lodash';
import { SfdxError } from '../sfdxError';
import { AnyJson, JsonArray, JsonMap } from '../types';
import { readFile, writeFile, DEFAULT_USER_FILE_MODE } from './fs';

/**
 * Read a file and convert it to JSON.
 *
 * @param {string} jsonPath The path of the file.
 * @param {boolean} [throwOnEmpty] Whether to throw an error if the JSON file is empty.
 * @return {Promise<AnyJson>} The contents of the file as a JSON object.
 */
export async function readJson(jsonPath: string, throwOnEmpty?: boolean): Promise<AnyJson> {
    const fileData = await readFile(jsonPath, 'utf8');
    return await parseJson(fileData, jsonPath, throwOnEmpty);
}

/**
 * Read a file and convert it to JSON, throwing an error if the parsed contents are not a `JsonMap`.
 *
 * @param {string} jsonPath The path of the file.
 * @param {boolean} [throwOnEmpty] Whether to throw an error if the JSON file is empty.
 * @return {Promise<JsonMap>} The contents of the file as a JSON object.
 */
export async function readJsonObject(jsonPath: string, throwOnEmpty?: boolean): Promise<JsonMap> {
    const fileData = await readFile(jsonPath, 'utf8');
    return await parseJsonObject(fileData, jsonPath, throwOnEmpty);
}

/**
 * Convert a JSON-compatible object to a `string` and write it to a file.
 *
 * @param {string} jsonPath The path of the file to write.
 * @param {object} data The JSON object to write.
 * @return {Promise<void>}
 */
export async function writeJson(jsonPath: string, data: AnyJson): Promise<void> {
    const fileData: string = JSON.stringify(data, null, 4);
    await writeFile(jsonPath, fileData, { encoding: 'utf8', mode: DEFAULT_USER_FILE_MODE });
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
export async function parseJson(data: string, jsonPath: string = 'unknown', throwOnEmpty: boolean = true): Promise<AnyJson> {
    if (isEmpty(data) && throwOnEmpty) {
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
export async function parseJsonObject(data: string, jsonPath?: string, throwOnEmpty?: boolean): Promise<JsonMap> {
    const json = await parseJson(data, jsonPath, throwOnEmpty);
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
export function getJsonValuesByName<T extends AnyJson>(json: JsonMap, name: string): T[] {
    let matches: T[] = [];
    if (json.hasOwnProperty(name)) {
        matches.push(json[name] as T); // Asserting T here assumes the caller knows what they are asking for
    }
    const maybeRecurse = (element: AnyJson): void => {
        if (isJsonMap(element)) {
            matches = matches.concat(getJsonValuesByName(element, name));
        }
    };
    forEach(json, (value) => isJsonArray(value) ? forEach(value, maybeRecurse) : maybeRecurse(value));
    return matches;
}

/**
 * Tests whether any JSON value is an object.
 *
 * @param {AnyJson} json Any JSON value to test.
 * @returns {boolean}
 */
export function isJsonMap(json?: AnyJson): json is JsonMap {
    return isPlainObject(json);
}

/**
 * Tests whether any JSON value is an array.
 *
 * @param {AnyJson} json Any JSON value to test.
 * @returns {boolean}
 */
export function isJsonArray(json?: AnyJson): json is JsonArray {
    return isArray(json);
}

/**
 * Narrows an `AnyJson` value to a `string` if it is type compatible, or returns undefined otherwise.
 *
 * @param {AnyJson} value Any JSON value to test.
 * @returns {string}
 */
export function asString(value?: AnyJson): string | undefined {
    return isString(value) ? value : undefined;
}

/**
 * Narrows an `AnyJson` value to a `number` if it is type compatible, or returns undefined otherwise.
 *
 * @param {AnyJson} value Any JSON value to test.
 * @returns {number}
 */
export function asNumber(value?: AnyJson): number | undefined {
    return isNumber(value) ? value : undefined;
}

/**
 * Narrows an `AnyJson` value to a `boolean` if it is type compatible, or returns undefined otherwise.
 *
 * @param {AnyJson} value Any JSON value to test.
 * @returns {boolean}
 */
export function asBoolean(value?: AnyJson): boolean | undefined {
    return isBoolean(value) ? value : undefined;
}

/**
 * Narrows an `AnyJson` value to a `JsonMap` if it is type compatible, or returns undefined otherwise.
 *
 * @param {AnyJson} value Any JSON value to test.
 * @returns {JsonMap}
 */
export function asJsonMap(value?: AnyJson): JsonMap | undefined {
    return isJsonMap(value) ? value : undefined;
}

/**
 * Narrows an `AnyJson` value to a `JsonArray` if it is type compatible, or returns undefined otherwise.
 *
 * @param {AnyJson} value Any JSON value to test.
 * @returns {JsonArray}
 */
export function asJsonArray(value?: AnyJson): JsonArray | undefined {
    return isJsonArray(value) ? value : undefined;
}

/**
 * Narrows an `AnyJson` value to a `string` if it is type compatible, or raise an `SfdxError` otherwise.
 *
 * @param {AnyJson} value Any JSON value to test.
 * @returns {string}
 */
export function ensureString(value ?: AnyJson): string {
    if (!isString(value)) {
        throw new SfdxError('Value is not a string');
    }
    return value;
}

/**
 * Narrows an `AnyJson` value to a `number` if it is type compatible, or raise an `SfdxError` otherwise.
 *
 * @param {AnyJson} value Any JSON value to test.
 * @returns {number}
 */
export function ensureNumber(value ?: AnyJson): number {
    if (!isNumber(value)) {
        throw new SfdxError('Value is not a string');
    }
    return value;
}

/**
 * Narrows an `AnyJson` value to a `boolean` if it is type compatible, or raise an `SfdxError` otherwise.
 *
 * @param {AnyJson} value Any JSON value to test.
 * @returns {boolean}
 */
export function ensureBoolean(value ?: AnyJson): boolean {
    if (!isBoolean(value)) {
        throw new SfdxError('Value is not a boolean');
    }
    return value;
}

/**
 * Narrows an `AnyJson` value to a `JsonMap` if it is type compatible, or raise an `SfdxError` otherwise.
 *
 * @param {AnyJson} value Any JSON value to test.
 * @returns {JsonMap}
 */
export function ensureJsonMap(value?: AnyJson): JsonMap {
    if (!isJsonMap(value)) {
        throw new SfdxError('Value is not a JsonMap');
    }
    return value;
}

/**
 * Narrows an `AnyJson` value to a `JsonArray` if it is type compatible, or raise an `SfdxError` otherwise.
 *
 * @param {AnyJson} value Any JSON value to test.
 * @returns {JsonArray}
 */
export function ensureJsonArray(value?: AnyJson): JsonArray {
    if (!isJsonArray(value)) {
        throw new SfdxError('Value is not a JsonArray');
    }
    return value;
}

/**
 * Returns the first key within the object that has an upper case first letter.
 *
 * @param {JsonMap} json The object in which to check key casing.
 * @returns {string}
 */
export function findUpperCaseKeys(json: JsonMap): string {
    let _key;
    findKey(json, (val, key) => {
        if (key[0] === key[0].toUpperCase()) {
            _key = key;
        } else if (isPlainObject(val)) {
            _key = this.findUpperCaseKeys(val);
        }
        return _key;
    });
    return _key;
}

async function processJsonError(error: Error, data: string, jsonPath: string): Promise<void> {
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
}
