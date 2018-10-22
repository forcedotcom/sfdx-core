/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * @module fs
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
 *
 * @function readFile
 * @returns {Promise<string>|Promise<Buffer>|Promise<string|Buffer>}
 */
export const readFile = promisify(fs.readFile);

/**
 * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback|fs.readdir}.
 *
 * @function readdir
 * @returns {Promise<Array<string>>|Promise<Array<Buffer>>|Promise<Array<string|Buffer>>}
 */
export const readdir = promisify(fs.readdir);

/**
 * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback|fs.writeFile}.
 *
 * @function writeFile
 * @returns {Promise<void>}
 */
export const writeFile = promisify(fs.writeFile);

/**
 * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_access_path_mode_callback|fs.access}.
 *
 * @function access
 * @returns {Promise<void>}
 */
export const access = promisify(fs.access);

/**
 * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_open_path_flags_mode_callback|fs.open}.
 *
 * @function open
 * @returns {Promise<number>}
 */
export const open = promisify(fs.open);

/**
 * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_unlink_path_callback|fs.unlink}.
 *
 * @function unlink
 * @returns {Promise<void>}
 */
export const unlink = promisify(fs.unlink);

/**
 * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback|fs.rmdir}.
 *
 * @function rmdir
 * @returns {Promise<void>}
 */
export const rmdir = promisify(fs.rmdir);

/**
 * Promisified version of {@link https://nodejs.org/api/fs.html#fs_fs_fstat_fd_callback|fs.stat}.
 *
 * @function stat
 * @returns {Promise<fs.Stats>}
 */
export const stat = promisify(fs.stat);

/**
 * Promisified version of {@link https://npmjs.com/package/mkdirp|mkdirp}.
 *
 * @function mkdirp
 * @returns {Promise<void>}
 */
export const mkdirp: (folderPath: string, mode?: string | object) => Promise<void> = promisify(mkdirpLib);

/**
 * Deletes a folder recursively, removing all descending files and folders.
 *
 * @param {string} dirPath The path to remove.
 * @returns {Promise<void>}
 * @throws {SfdxError}
 *    **`{name: 'PathIsNullOrUndefined'}`** The path is not defined.
 * @throws {SfdxError}
 *    **`{name: 'DirMissingOrNoAccess'}`** The folder or any sub-folder is missing or has no access.
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
    await Promise.all(metas.map(meta => meta.isDirectory() ? remove(meta.path) : unlink(meta.path)));
    await rmdir(dirPath);
}

/**
 * Searches a file path in an ascending manner (until reaching the filesystem root) for the first occurrence a
 * specific file name.  Resolves with the directory path containing the located file, or `null` if the file was
 * not found.
 *
 * @param {string} dir The directory path in which to start the upward search.
 * @param {string} file The file name to look for.
 * @returns {Promise<Optional<string>>}
 */
export async function traverseForFile(dir: string, file: string): Promise<Optional<string>> {
    let foundProjectDir: Optional<string>;
    try {
        await stat(path.join(dir, file));
        foundProjectDir = dir;
    } catch (err) {
        if (err && err.code === 'ENOENT') {
            const nextDir = path.resolve(dir, '..');
            if (nextDir !== dir) { // stop at root
                foundProjectDir = await traverseForFile(nextDir, file);
            }
        }
    }
    return foundProjectDir;
}

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
export async function readJsonMap(jsonPath: string, throwOnEmpty?: boolean): Promise<JsonMap> {
    const fileData = await readFile(jsonPath, 'utf8');
    return await parseJsonMap(fileData, jsonPath, throwOnEmpty);
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
