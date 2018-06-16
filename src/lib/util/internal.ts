/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { size, toUpper } from 'lodash';
import { SfdxError } from '../sfdxError';
import { traverseForFile } from './fs';

/**
 * @property {string} SFDX_PROJECT_JSON The name of the project config file.
 * @private
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
 * @private
 */
export async function resolveProjectPath(dir: string = process.cwd()): Promise<string> {
    const projectPath = await traverseForFile(dir, SFDX_PROJECT_JSON);
    if (!projectPath) {
        throw SfdxError.create('@salesforce/core', 'config', 'InvalidProjectWorkspace');
    }
    return projectPath;
}

/**
 * Returns `true` is an environment variable is "truthy". Truthiness is defined as set to a non-null, non-empty,
 * string that's not equal to `false`.
 *
 * @param {string} name The name of the environment variable to check.
 * @returns {boolean}
 * @private
 */
export function isEnvVarTruthy(name: string): boolean {
    if (!name) {
        return false;
    }
    const value = process.env[name];
    return value && size(value) > 0 && toUpper(value) !== 'FALSE';
}
