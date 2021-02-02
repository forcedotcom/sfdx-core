import { AnyJson, JsonMap } from '@salesforce/ts-types';
import * as fsLib from 'graceful-fs';
declare type PerformFunction = (filePath: string, file?: string, dir?: string) => Promise<void>;
export declare const fs: {
  /**
   * The default file system mode to use when creating directories.
   */
  DEFAULT_USER_DIR_MODE: string;
  /**
   * The default file system mode to use when creating files.
   */
  DEFAULT_USER_FILE_MODE: string;
  /**
   * A convenience reference to {@link https://nodejs.org/api/fsLib.html#fs_fs_constants}
   * to reduce the need to import multiple `fs` modules.
   */
  constants: typeof fsLib.constants;
  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_readfile_path_options_callback|fsLib.readFile}.
   */
  readFile: typeof fsLib.readFile.__promisify__;
  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_readdir_path_options_callback|fsLib.readdir}.
   */
  readdir: typeof fsLib.readdir.__promisify__;
  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_writefile_file_data_options_callback|fsLib.writeFile}.
   */
  writeFile: typeof fsLib.writeFile.__promisify__;
  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_access_path_mode_callback|fsLib.access}.
   */
  access: typeof fsLib.access.__promisify__;
  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_open_path_flags_mode_callback|fsLib.open}.
   */
  open: typeof fsLib.open.__promisify__;
  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_unlink_path_callback|fsLib.unlink}.
   */
  unlink: typeof fsLib.unlink.__promisify__;
  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_readdir_path_options_callback|fsLib.rmdir}.
   */
  rmdir: typeof fsLib.rmdir.__promisify__;
  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_fstat_fd_callback|fsLib.stat}.
   */
  stat: typeof fsLib.stat.__promisify__;
  statSync: typeof fsLib.statSync;
  /**
   * Promisified version of {@link https://npmjs.com/package/mkdirp|mkdirp}.
   */
  mkdirp: (folderPath: string, mode?: string | object | undefined) => Promise<void>;
  /**
   * Deletes a folder recursively, removing all descending files and folders.
   *
   * **Throws** *PathIsNullOrUndefined* The path is not defined.
   * **Throws** *DirMissingOrNoAccess* The folder or any sub-folder is missing or has no access.
   * @param {string} dirPath The path to remove.
   */
  remove: (dirPath: string) => Promise<void>;
  /**
   * Searches a file path in an ascending manner (until reaching the filesystem root) for the first occurrence a
   * specific file name.  Resolves with the directory path containing the located file, or `null` if the file was
   * not found.
   *
   * @param dir The directory path in which to start the upward search.
   * @param file The file name to look for.
   */
  traverseForFile: (dir: string, file: string) => Promise<string | undefined>;
  /**
   * Searches a file path synchronously in an ascending manner (until reaching the filesystem root) for the first occurrence a
   * specific file name.  Resolves with the directory path containing the located file, or `null` if the file was
   * not found.
   *
   * @param dir The directory path in which to start the upward search.
   * @param file The file name to look for.
   */
  traverseForFileSync: (dir: string, file: string) => string | undefined;
  /**
   * Read a file and convert it to JSON. Returns the contents of the file as a JSON object
   *
   * @param jsonPath The path of the file.
   * @param throwOnEmpty Whether to throw an error if the JSON file is empty.
   */
  readJson: (jsonPath: string, throwOnEmpty?: boolean | undefined) => Promise<AnyJson>;
  /**
   * Read a file and convert it to JSON, throwing an error if the parsed contents are not a `JsonMap`.
   *
   * @param jsonPath The path of the file.
   * @param throwOnEmpty Whether to throw an error if the JSON file is empty.
   */
  readJsonMap: (jsonPath: string, throwOnEmpty?: boolean | undefined) => Promise<JsonMap>;
  /**
   * Convert a JSON-compatible object to a `string` and write it to a file.
   *
   * @param jsonPath The path of the file to write.
   * @param data The JSON object to write.
   */
  writeJson: (jsonPath: string, data: AnyJson) => Promise<void>;
  /**
   * Checks if a file path exists
   *
   * @param filePath the file path to check the existence of
   */
  fileExists: (filePath: string) => Promise<boolean>;
  /**
   * Recursively act on all files or directories in a directory
   *
   * @param dir path to directory
   * @param perform function to be run on contents of dir
   * @param onType optional parameter to specify type to actOn
   * @returns void
   */
  actOn: (dir: string, perform: PerformFunction, onType?: 'dir' | 'file') => Promise<void>;
  /**
   * Checks if files are the same
   *
   * @param file1Path the first file path to check
   * @param file2Path the second file path to check
   * @returns boolean
   */
  areFilesEqual: (file1Path: string, file2Path: string) => Promise<boolean>;
  /**
   * Creates a hash for the string that's passed in
   * @param contents The string passed into the function
   * @returns string
   */
  getContentHash(contents: string | Buffer): string;
};
export {};
