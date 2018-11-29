/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { parseJson, parseJsonMap } from '@salesforce/kit';
import { AnyJson, JsonMap, Optional } from '@salesforce/ts-types';
import * as fs from 'fs';
import * as mkdirpLib from 'mkdirp';
import * as path from 'path';
import { promisify } from 'util';
import { SfdxError } from '../sfdxError';

/**
 * The default file system mode to use when creating directories.
 */
export const DEFAULT_USER_DIR_MODE = '700';

/**
 * The default file system mode to use when creating files.
 */
export const DEFAULT_USER_FILE_MODE = '600';

/**
 * A convenience reference to {@link https://nodejs.org/api/fs.html#fs_fs_constants}
 * to reduce the need to import multiple `fs` modules.
 */
export const constants = fs.constants;

/**
 * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_readfile_path_options_callback|fs.readFile}.
 */
export const readFile = promisify(fs.readFile);

/**
 * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback|fs.readdir}.
 */
export const readdir = promisify(fs.readdir);

/**
 * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback|fs.writeFile}.
 */
export const writeFile = promisify(fs.writeFile);

/**
 * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_access_path_mode_callback|fs.access}.
 */
export const access = promisify(fs.access);

/**
 * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_open_path_flags_mode_callback|fs.open}.
 */
export const open = promisify(fs.open);

/**
 * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_unlink_path_callback|fs.unlink}.
 */
export const unlink = promisify(fs.unlink);

/**
 * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback|fs.rmdir}.
 */
export const rmdir = promisify(fs.rmdir);

/**
 * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_fstat_fd_callback|fs.stat}.
 */
export const stat = promisify(fs.stat);

/**
 * Promisified version of {@link https://npmjs.com/package/mkdirp|mkdirp}.
 */
export const mkdirp: (folderPath: string, mode?: string | object) => Promise<void> = promisify(mkdirpLib);

/**
 * Deletes a folder recursively, removing all descending files and folders.
 *
 * **Throws** *PathIsNullOrUndefined* The path is not defined.
 * **Throws** *DirMissingOrNoAccess* The folder or any sub-folder is missing or has no access.
 * @param {string} dirPath The path to remove.
 */
export async function remove(dirPath: string): Promise<void> {
  if (!dirPath) {
    throw new SfdxError('Path is null or undefined.', 'PathIsNullOrUndefined');
  }
  try {
    await access(dirPath, fs.constants.R_OK);
  } catch (err) {
    throw new SfdxError(`The path: ${dirPath} doesn\'t exist or access is denied.`, 'DirMissingOrNoAccess');
  }
  const files = await readdir(dirPath);
  const stats = await Promise.all(files.map(file => stat(path.join(dirPath, file))));
  const metas = stats.map((value, index) => Object.assign(value, { path: path.join(dirPath, files[index]) }));
  await Promise.all(metas.map(meta => (meta.isDirectory() ? remove(meta.path) : unlink(meta.path))));
  await rmdir(dirPath);
}

/**
 * Searches a file path in an ascending manner (until reaching the filesystem root) for the first occurrence a
 * specific file name.  Resolves with the directory path containing the located file, or `null` if the file was
 * not found.
 *
 * @param dir The directory path in which to start the upward search.
 * @param file The file name to look for.
 */
export async function traverseForFile(dir: string, file: string): Promise<Optional<string>> {
  let foundProjectDir: Optional<string>;
  try {
    await stat(path.join(dir, file));
    foundProjectDir = dir;
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      const nextDir = path.resolve(dir, '..');
      if (nextDir !== dir) {
        // stop at root
        foundProjectDir = await traverseForFile(nextDir, file);
      }
    }
  }
  return foundProjectDir;
}

/**
 * Read a file and convert it to JSON. Returns the contents of the file as a JSON object
 *
 * @param jsonPath The path of the file.
 * @param throwOnEmpty Whether to throw an error if the JSON file is empty.
 */
export async function readJson(jsonPath: string, throwOnEmpty?: boolean): Promise<AnyJson> {
  const fileData = await readFile(jsonPath, 'utf8');
  return await parseJson(fileData, jsonPath, throwOnEmpty);
}

/**
 * Read a file and convert it to JSON, throwing an error if the parsed contents are not a `JsonMap`.
 *
 * @param jsonPath The path of the file.
 * @param throwOnEmpty Whether to throw an error if the JSON file is empty.
 */
export async function readJsonMap(jsonPath: string, throwOnEmpty?: boolean): Promise<JsonMap> {
  const fileData = await readFile(jsonPath, 'utf8');
  return await parseJsonMap(fileData, jsonPath, throwOnEmpty);
}

/**
 * Convert a JSON-compatible object to a `string` and write it to a file.
 *
 * @param jsonPath The path of the file to write.
 * @param data The JSON object to write.
 */
export async function writeJson(jsonPath: string, data: AnyJson): Promise<void> {
  const fileData: string = JSON.stringify(data, null, 4);
  await writeFile(jsonPath, fileData, {
    encoding: 'utf8',
    mode: DEFAULT_USER_FILE_MODE
  });
}
