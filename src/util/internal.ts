/*
 * Copyright 2026, Salesforce, Inc.
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

import * as path from 'node:path';
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
  forFile: (dir: string, file: string): Promise<Optional<string>> =>
    Promise.resolve(findFileInParentDirectories(dir, file)),

  /**
   * Searches a file path synchronously in an ascending manner (until reaching the filesystem root) for the first occurrence a
   * specific file name.  Resolves with the directory path containing the located file, or `null` if the file was
   * not found.
   *
   * @param dir The directory path in which to start the upward search.
   * @param file The file name to look for.
   */
  forFileSync: (dir: string, file: string): Optional<string> => findFileInParentDirectories(dir, file),
};

const findFileInParentDirectories = (dir: string, file: string): Optional<string> => {
  const normalizedDir = path.normalize(dir);
  let startDir: Optional<string>;
  if (path.isAbsolute(normalizedDir)) {
    startDir = normalizedDir;
  } else {
    const cwd = process.cwd();
    if (path.isAbsolute(cwd)) {
      startDir = path.normalize(path.join(cwd, normalizedDir));
    }
  }

  // A relative path is only meaningful when the active runtime supplies an absolute cwd.
  // In web builds process.cwd() may be empty; do not probe a relative path or ascend from it.
  if (!startDir || !path.isAbsolute(startDir)) {
    return undefined;
  }

  const visitedDirs = new Set<string>();
  let currentDir: Optional<string> = startDir;

  while (currentDir && !visitedDirs.has(currentDir)) {
    visitedDirs.add(currentDir);
    try {
      fs.statSync(path.join(currentDir, file));
      return currentDir;
    } catch (err) {
      if (!err || (err as SfError).code !== 'ENOENT') {
        return undefined;
      }
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return undefined;
    }
    currentDir = parentDir;
  }

  return undefined;
};
