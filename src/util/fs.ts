/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as crypto from 'crypto';
import * as path from 'path';
import { promisify } from 'util';
import { parseJson, parseJsonMap } from '@salesforce/kit';
import { AnyJson, JsonMap, Optional } from '@salesforce/ts-types';
import * as fsLib from 'graceful-fs';
import * as mkdirpLib from 'mkdirp';
import { SfError } from '../sfError';

type PerformFunction = (filePath: string, file?: string, dir?: string) => Promise<void>;
type PerformFunctionSync = (filePath: string, file?: string, dir?: string) => void;

export type WriteJsonOptions = {
  /**
   * The number of indent spaces
   */
  space?: number;
};

/**
 * @deprecated Use fs/promises instead
 */
export const fs = Object.assign({}, fsLib, {
  /**
   * The default file system mode to use when creating directories.
   */
  DEFAULT_USER_DIR_MODE: '700',

  /**
   * The default file system mode to use when creating files.
   */
  DEFAULT_USER_FILE_MODE: '600',

  /**
   * A convenience reference to {@link https://nodejs.org/api/fsLib.html#fs_fs_constants}
   * to reduce the need to import multiple `fs` modules.
   */
  constants: fsLib.constants,

  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_readfile_path_options_callback|fsLib.readFile}.
   */
  readFile: promisify(fsLib.readFile),

  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_readdir_path_options_callback|fsLib.readdir}.
   */
  readdir: promisify(fsLib.readdir),

  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_writefile_file_data_options_callback|fsLib.writeFile}.
   */
  writeFile: promisify(fsLib.writeFile),

  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_access_path_mode_callback|fsLib.access}.
   */
  access: promisify(fsLib.access),

  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_open_path_flags_mode_callback|fsLib.open}.
   */
  open: promisify(fsLib.open),

  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_unlink_path_callback|fsLib.unlink}.
   */
  unlink: promisify(fsLib.unlink),

  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_readdir_path_options_callback|fsLib.rmdir}.
   */
  rmdir: promisify(fsLib.rmdir),

  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_fstat_fd_callback|fsLib.stat}.
   */
  stat: promisify(fsLib.stat),

  /**
   * Promisified version of {@link https://npmjs.com/package/mkdirp|mkdirp}.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  mkdirp: (folderPath: string, mode?: string | object): Promise<string | undefined> => mkdirpLib(folderPath, mode),

  mkdirpSync: mkdirpLib.sync,

  /**
   * Deletes a folder recursively, removing all descending files and folders.
   *
   * **Throws** *PathIsNullOrUndefined* The path is not defined.
   * **Throws** *DirMissingOrNoAccess* The folder or any sub-folder is missing or has no access.
   *
   * @param {string} dirPath The path to remove.
   */
  remove: async (dirPath: string): Promise<void> => {
    if (!dirPath) {
      throw new SfError('Path is null or undefined.', 'PathIsNullOrUndefined');
    }
    try {
      await fs.access(dirPath, fsLib.constants.R_OK);
    } catch (err) {
      throw new SfError(`The path: ${dirPath} doesn't exist or access is denied.`, 'DirMissingOrNoAccess');
    }
    const files = await fs.readdir(dirPath);
    const stats = await Promise.all(files.map((file) => fs.stat(path.join(dirPath, file))));
    const metas = stats.map((value, index) => Object.assign(value, { path: path.join(dirPath, files[index]) }));
    await Promise.all(metas.map((meta) => (meta.isDirectory() ? fs.remove(meta.path) : fs.unlink(meta.path))));
    await fs.rmdir(dirPath);
  },

  /**
   * Deletes a folder recursively, removing all descending files and folders.
   *
   * NOTE: It is recommended to call the asynchronous `remove` when possible as it will remove all files in parallel rather than serially.
   *
   * **Throws** *PathIsNullOrUndefined* The path is not defined.
   * **Throws** *DirMissingOrNoAccess* The folder or any sub-folder is missing or has no access.
   *
   * @param {string} dirPath The path to remove.
   */
  removeSync: (dirPath: string): void => {
    if (!dirPath) {
      throw new SfError('Path is null or undefined.', 'PathIsNullOrUndefined');
    }
    try {
      fs.accessSync(dirPath, fsLib.constants.R_OK);
    } catch (err) {
      throw new SfError(`The path: ${dirPath} doesn't exist or access is denied.`, 'DirMissingOrNoAccess');
    }
    fs.actOnSync(
      dirPath,
      (fullPath, file) => {
        if (file) {
          fs.unlinkSync(fullPath);
        } else {
          // All files in this directory will be acted on before the directory.
          fs.rmdirSync(fullPath);
        }
      },
      'all'
    );
    // Remove the top level
    fs.rmdirSync(dirPath);
  },

  /**
   * Searches a file path in an ascending manner (until reaching the filesystem root) for the first occurrence a
   * specific file name.  Resolves with the directory path containing the located file, or `null` if the file was
   * not found.
   *
   * @param dir The directory path in which to start the upward search.
   * @param file The file name to look for.
   */
  traverseForFile: async (dir: string, file: string): Promise<Optional<string>> => {
    let foundProjectDir: Optional<string>;
    try {
      await fs.stat(path.join(dir, file));
      foundProjectDir = dir;
    } catch (err) {
      if (err && (err as SfError).code === 'ENOENT') {
        const nextDir = path.resolve(dir, '..');
        if (nextDir !== dir) {
          // stop at root
          foundProjectDir = await fs.traverseForFile(nextDir, file);
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
  traverseForFileSync: (dir: string, file: string): Optional<string> => {
    let foundProjectDir: Optional<string>;
    try {
      fs.statSync(path.join(dir, file));
      foundProjectDir = dir;
    } catch (err) {
      if (err && (err as SfError).code === 'ENOENT') {
        const nextDir = path.resolve(dir, '..');
        if (nextDir !== dir) {
          // stop at root
          foundProjectDir = fs.traverseForFileSync(nextDir, file);
        }
      }
    }
    return foundProjectDir;
  },

  /**
   * Read a file and convert it to JSON. Returns the contents of the file as a JSON object
   *
   * @param jsonPath The path of the file.
   * @param throwOnEmpty Whether to throw an error if the JSON file is empty.
   */
  readJson: async (jsonPath: string, throwOnEmpty?: boolean): Promise<AnyJson> => {
    const fileData = await fs.readFile(jsonPath, 'utf8');
    return parseJson(fileData, jsonPath, throwOnEmpty);
  },

  /**
   * Read a file and convert it to JSON. Returns the contents of the file as a JSON object
   *
   * @param jsonPath The path of the file.
   * @param throwOnEmpty Whether to throw an error if the JSON file is empty.
   */
  readJsonSync: (jsonPath: string, throwOnEmpty?: boolean): AnyJson => {
    const fileData = fs.readFileSync(jsonPath, 'utf8');
    return parseJson(fileData, jsonPath, throwOnEmpty);
  },

  /**
   * Read a file and convert it to JSON, throwing an error if the parsed contents are not a `JsonMap`.
   *
   * @param jsonPath The path of the file.
   * @param throwOnEmpty Whether to throw an error if the JSON file is empty.
   */
  readJsonMap: async <T extends JsonMap = JsonMap>(jsonPath: string, throwOnEmpty?: boolean): Promise<T> => {
    const fileData = await fs.readFile(jsonPath, 'utf8');
    return parseJsonMap<T>(fileData, jsonPath, throwOnEmpty);
  },

  /**
   * Read a file and convert it to JSON, throwing an error if the parsed contents are not a `JsonMap`.
   *
   * @param jsonPath The path of the file.
   * @param throwOnEmpty Whether to throw an error if the JSON file is empty.
   */
  readJsonMapSync: <T extends JsonMap = JsonMap>(jsonPath: string, throwOnEmpty?: boolean): T => {
    const fileData = fs.readFileSync(jsonPath, 'utf8');
    return parseJsonMap<T>(fileData, jsonPath, throwOnEmpty);
  },

  /**
   * Convert a JSON-compatible object to a `string` and write it to a file.
   *
   * @param jsonPath The path of the file to write.
   * @param data The JSON object to write.
   */
  writeJson: async (jsonPath: string, data: AnyJson, options: WriteJsonOptions = {}): Promise<void> => {
    options = Object.assign({ space: 2 }, options);
    const fileData: string = JSON.stringify(data, null, options.space);
    await fs.writeFile(jsonPath, fileData, {
      encoding: 'utf8',
      mode: '600',
    });
  },

  /**
   * Convert a JSON-compatible object to a `string` and write it to a file.
   *
   * @param jsonPath The path of the file to write.
   * @param data The JSON object to write.
   */
  writeJsonSync: (jsonPath: string, data: AnyJson, options: WriteJsonOptions = {}): void => {
    options = Object.assign({ space: 2 }, options);
    const fileData: string = JSON.stringify(data, null, options.space);
    fs.writeFileSync(jsonPath, fileData, {
      encoding: 'utf8',
      mode: '600',
    });
  },

  /**
   * Checks if a file path exists
   *
   * @param filePath the file path to check the existence of
   */
  fileExists: async (filePath: string): Promise<boolean> => {
    try {
      await fs.access(filePath);
      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * Checks if a file path exists
   *
   * @param filePath the file path to check the existence of
   */
  fileExistsSync: (filePath: string): boolean => {
    try {
      fs.accessSync(filePath);
      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * Recursively act on all files or directories in a directory
   *
   * @param dir path to directory
   * @param perform function to be run on contents of dir
   * @param onType optional parameter to specify type to actOn
   * @returns void
   */

  actOn: async (dir: string, perform: PerformFunction, onType: 'file' | 'dir' | 'all' = 'file'): Promise<void> => {
    for (const file of await fs.readdir(dir)) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);

      if (stat) {
        if (stat.isDirectory()) {
          await fs.actOn(filePath, perform, onType);
          if (onType === 'dir' || onType === 'all') {
            await perform(filePath);
          }
        } else if (stat.isFile() && (onType === 'file' || onType === 'all')) {
          await perform(filePath, file, dir);
        }
      }
    }
  },

  /**
   * Recursively act on all files or directories in a directory
   *
   * @param dir path to directory
   * @param perform function to be run on contents of dir
   * @param onType optional parameter to specify type to actOn
   * @returns void
   */

  actOnSync: (dir: string, perform: PerformFunctionSync, onType: 'file' | 'dir' | 'all' = 'file'): void => {
    for (const file of fs.readdirSync(dir)) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat) {
        if (stat.isDirectory()) {
          fs.actOnSync(filePath, perform, onType);
          if (onType === 'dir' || onType === 'all') {
            perform(filePath);
          }
        } else if (stat.isFile() && (onType === 'file' || onType === 'all')) {
          perform(filePath, file, dir);
        }
      }
    }
  },

  /**
   * Checks if files are the same
   *
   * @param file1Path the first file path to check
   * @param file2Path the second file path to check
   * @returns boolean
   */
  areFilesEqual: async (file1Path: string, file2Path: string): Promise<boolean> => {
    try {
      const file1Size = (await fs.stat(file1Path)).size;
      const file2Size = (await fs.stat(file2Path)).size;
      if (file1Size !== file2Size) {
        return false;
      }

      const contentA = await fs.readFile(file1Path);
      const contentB = await fs.readFile(file2Path);

      return fs.getContentHash(contentA) === fs.getContentHash(contentB);
    } catch (err) {
      throw new SfError(
        `The path: ${(err as { path: string }).path} doesn't exist or access is denied.`,
        'DirMissingOrNoAccess'
      );
    }
  },

  /**
   * Checks if files are the same
   *
   * @param file1Path the first file path to check
   * @param file2Path the second file path to check
   * @returns boolean
   */
  areFilesEqualSync: (file1Path: string, file2Path: string): boolean => {
    try {
      const file1Size = fs.statSync(file1Path).size;
      const file2Size = fs.statSync(file2Path).size;
      if (file1Size !== file2Size) {
        return false;
      }

      const contentA = fs.readFileSync(file1Path);
      const contentB = fs.readFileSync(file2Path);

      return fs.getContentHash(contentA) === fs.getContentHash(contentB);
    } catch (err) {
      throw new SfError(
        `The path: ${(err as { path: string }).path} doesn't exist or access is denied.`,
        'DirMissingOrNoAccess'
      );
    }
  },

  /**
   * Creates a hash for the string that's passed in
   *
   * @param contents The string passed into the function
   * @returns string
   */
  getContentHash(contents: string | Buffer) {
    return crypto.createHash('sha1').update(contents).digest('hex');
  },
});
