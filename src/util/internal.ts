/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import { join, resolve } from 'path';
import { Optional } from '@salesforce/ts-types';
import { Messages } from '../messages';
import { SfError } from '../sfError';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/core', 'config', ['invalidProjectWorkspace']);

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
 * **Throws** *{@link SfError}{ name: 'InvalidProjectWorkspaceError' }* If the current folder is not located in a workspace.
 *
 * @param dir The directory path to start traversing from.
 * @ignore
 */
export async function resolveProjectPath(dir: string = process.cwd()): Promise<string> {
  const projectPath = await traverseForFile(dir, SFDX_PROJECT_JSON);
  if (!projectPath) {
    throw messages.createError('invalidProjectWorkspace');
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
 * **Throws** *{@link SfError}{ name: 'InvalidProjectWorkspaceError' }* If the current folder is not located in a workspace.
 *
 * @param dir The directory path to start traversing from.
 * @ignore
 */
export function resolveProjectPathSync(dir: string = process.cwd()): string {
  const projectPath = traverseForFileSync(dir, SFDX_PROJECT_JSON);
  if (!projectPath) {
    throw messages.createError('invalidProjectWorkspace');
  }
  return projectPath;
}

/**
 * Searches a file path in an ascending manner (until reaching the filesystem root) for the first occurrence a
 * specific file name.  Resolves with the directory path containing the located file, or `null` if the file was
 * not found.
 *
 * @param dir The directory path in which to start the upward search.
 * @param file The file name to look for.
 */
async function traverseForFile(dir: string, file: string): Promise<Optional<string>> {
  let foundProjectDir: Optional<string>;
  try {
    await fs.promises.stat(join(dir, file));
    foundProjectDir = dir;
  } catch (err) {
    if (err && (err as SfError).code === 'ENOENT') {
      const nextDir = resolve(dir, '..');
      if (nextDir !== dir) {
        // stop at root
        foundProjectDir = await traverseForFile(nextDir, file);
      }
    }
  }
  return foundProjectDir;
}

/**
 * Searches a file path synchronously in an ascending manner (until reaching the filesystem root) for the first occurrence a
 * specific file name.  Resolves with the directory path containing the located file, or `null` if the file was
 * not found.
 *
 * @param dir The directory path in which to start the upward search.
 * @param file The file name to look for.
 */
function traverseForFileSync(dir: string, file: string): Optional<string> {
  let foundProjectDir: Optional<string>;
  try {
    fs.statSync(join(dir, file));
    foundProjectDir = dir;
  } catch (err) {
    if (err && (err as SfError).code === 'ENOENT') {
      const nextDir = resolve(dir, '..');
      if (nextDir !== dir) {
        // stop at root
        foundProjectDir = traverseForFileSync(nextDir, file);
      }
    }
  }
  return foundProjectDir;
}
