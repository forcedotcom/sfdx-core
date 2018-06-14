/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * @module util
 */

import { URL } from 'url';
import { toUpper, size, isPlainObject, includes, isNil, findKey, endsWith } from 'lodash';
import { SfdxError } from '../sfdxError';
import { traverseForFile } from './fs';

/**
 * The name of the project config file.
 */
// This has to be defined on util to prevent circular deps with project and configFile.
export const SFDX_PROJECT_JSON = 'sfdx-project.json';

/**
 * Performs an upward directory search for an sfdx project file.
 *
 * @param {string} [dir=process.cwd()] The directory path to start traversing from.
 * @returns {Promise<string>} The absolute path to the project.
 * @throws {SfdxError} **`{name: 'InvalidProjectWorkspace'}`** If the current folder is not located in a workspace.
 * @see util.SFDX_PROJECT_JSON
 * @see util.traverseForFile
 * @see {@link https://nodejs.org/api/process.html#process_process_cwd|process.cwd()}
 */
export async function resolveProjectPath(dir: string = process.cwd()): Promise<string> {
    const projectPath = await traverseForFile(dir, SFDX_PROJECT_JSON);
    if (!projectPath) {
        throw SfdxError.create('@salesforce/core', 'config', 'InvalidProjectWorkspace');
    }
    return projectPath;
}

/**
 * Returns `true` if a provided URL contains a Salesforce owned domain.
 *
 * @param {string} urlString The URL to inspect.
 * @returns {boolean}
 */
export function isSalesforceDomain(urlString: string): boolean {
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

    return !isNil(whitelistOfSalesforceDomainPatterns.find((pattern) => endsWith(url.hostname, pattern))) ||
        includes(whitelistOfSalesforceHosts, url.hostname);
}

/**
 * Returns `true` is an environment variable is "truthy". Truthiness is defined as set to a non-null, non-empty,
 * string that's not equal to `false`.
 *
 * @param {string} name The name of the environment variable to check.
 * @returns {boolean}
 */
export function isEnvVarTruthy(name: string): boolean {
    if (!name) {
        return false;
    }
    const value = process.env[name];
    return value && size(value) > 0 && toUpper(value) !== 'FALSE';
}

/**
 *  Returns the first key within the object that has an upper case first letter.
 *
 *  @param {Object<string, any>} obj The object in which to check key casing.
 *  @returns {string}
 */
export function findUpperCaseKeys(obj: { [key: string]: any }): string { // tslint:disable-line:no-any
    let _key;
    findKey(obj, (val, key) => {
        if (key[0] === key[0].toUpperCase()) {
            _key = key;
        } else if (isPlainObject(val)) {
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
export function trimTo15(id: string): string {
    if (id && id.length && id.length > 15) {
        id = id.substring(0, 15);
    }
    return id;
}
