/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { join, resolve } from 'node:path';
import { Optional } from '@salesforce/ts-types';
import { fs } from '../fs/fs';
import { Messages } from '../messages';
import { SfError } from '../sfError';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'config');

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
  const projectPath = await traverse.forFile(dir, SFDX_PROJECT_JSON);
  if (!projectPath) {
    throw messages.createError('invalidProjectWorkspace', [dir]);
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
  const projectPath = traverse.forFileSync(dir, SFDX_PROJECT_JSON);
  if (!projectPath) {
    throw messages.createError('invalidProjectWorkspace', [dir]);
  }
  return projectPath;
}

/**
 * These methods were moved from the deprecated 'fs' module in v2 and are only used in sfdx-core above
 *
 * They were migrated into the 'traverse' constant in order to stub them in unit tests
 */
export const traverse = {
  /**
   * Searches a file path in an ascending manner (until reaching the filesystem root) for the first occurrence a
   * specific file name.  Resolves with the directory path containing the located file, or `null` if the file was
   * not found.
   *
   * @param dir The directory path in which to start the upward search.
   * @param file The file name to look for.
   */
  forFile: async (dir: string, file: string): Promise<Optional<string>> => {
    let foundProjectDir: Optional<string>;
    try {
      fs.statSync(join(dir, file));
      foundProjectDir = dir;
    } catch (err) {
      if (err && (err as SfError).code === 'ENOENT') {
        const nextDir = resolve(dir, '..');
        if (nextDir !== dir) {
          // stop at root
          foundProjectDir = await traverse.forFile(nextDir, file);
        }
      }
    }
    return foundProjectDir;
  },

  /**
   * Searches a file path synchronously in an ascending manner (until reaching the filesystem root) for the first occurrence a
   * specific file name.  Resolves with the directory path containing the located file, or `null` if the file was
   * not found.
   *
   * @param dir The directory path in which to start the upward search.
   * @param file The file name to look for.
   */
  forFileSync: (dir: string, file: string): Optional<string> => {
    let foundProjectDir: Optional<string>;
    try {
      fs.statSync(join(dir, file));
      foundProjectDir = dir;
    } catch (err) {
      if (err && (err as SfError).code === 'ENOENT') {
        const nextDir = resolve(dir, '..');
        if (nextDir !== dir) {
          // stop at root
          foundProjectDir = traverse.forFileSync(nextDir, file);
        }
      }
    }
    return foundProjectDir;
  },
};
