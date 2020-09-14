/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfdxError } from '../sfdxError';
import { fs } from './fs';
/**
 * The name of the project config file.
 *
 * @ignore
 */
// This has to be defined on util to prevent circular deps with project and configFile.
export const SFDX_PROJECT_JSON = 'sfdx-project.json';

/**
 * Performs an upward directory search for an sfdx project file. Returns the absolute path to the project.
 *
 * **See** {@link SFDX_PROJECT_JSON}
 *
 * **See** {@link traverseForFile}
 *
 * **Throws** *{@link SfdxError}{ name: 'InvalidProjectWorkspace' }* If the current folder is not located in a workspace.
 *
 * @param dir The directory path to start traversing from.
 * @ignore
 */
export async function resolveProjectPath(dir: string = process.cwd()): Promise<string> {
  const projectPath = await fs.traverseForFile(dir, SFDX_PROJECT_JSON);
  if (!projectPath) {
    throw SfdxError.create('@salesforce/core', 'config', 'InvalidProjectWorkspace');
  }
  return projectPath;
}

/**
 * Performs a synchronous upward directory search for an sfdx project file. Returns the absolute path to the project.
 *
 * **See** {@link SFDX_PROJECT_JSON}
 *
 * **See** {@link traverseForFile}
 *
 * **Throws** *{@link SfdxError}{ name: 'InvalidProjectWorkspace' }* If the current folder is not located in a workspace.
 *
 * @param dir The directory path to start traversing from.
 * @ignore
 */
export function resolveProjectPathSync(dir: string = process.cwd()): string {
  const projectPath = fs.traverseForFileSync(dir, SFDX_PROJECT_JSON);
  if (!projectPath) {
    throw SfdxError.create('@salesforce/core', 'config', 'InvalidProjectWorkspace');
  }
  return projectPath;
}
