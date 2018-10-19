/**
 * Options when creating the config file.
 * @typedef {object} ConfigOptions
 * @property {string} rootFolder The root folder where the config file is stored.
 * @property {string} filename The file name.
 * @property {boolean} isGlobal If the file is in the global or project directory.
 * @property {boolean} isState If the file is in the state folder or no (.sfdx).
 * @property {string} filePath The full file path where the config file is stored.
 */
/// <reference types="node" />
import { Stats as fsStats } from 'fs';
import { BaseConfigStore, ConfigContents } from './configStore';
/**
 * The interface for Config options.
 * *NOTE:* And changes to this interface must also change the jsdoc typedef header above.
 * @interface
 */
export interface ConfigOptions {
    rootFolder?: string;
    filename?: string;
    isGlobal?: boolean;
    isState?: boolean;
    filePath?: string;
}
/**
 * Represents a json config file used to manage settings and state. Global config
 * files are stored in the home directory hidden state folder (.sfdx) and local config
 * files are stored in the project path, either in the hidden state folder or wherever
 * specified.
 *
 * @extends BaseConfigStore
 *
 * @example
 * class MyConfig extents ConfigFile {
 *     public static getFileName(): string {
 *         return 'myConfigFilename.json';
 *     }
 * }
 * const myConfig = await MyConfig.create<MyConfig>();
 * myConfig.set('mykey', 'myvalue');
 * await myconfig.write();
 */
export declare class ConfigFile extends BaseConfigStore {
    /**
     * Returns the config's filename.
     * @returns {string}
     */
    static getFileName(): string;
    /**
     * Returns the default options for the config file.
     * @param {boolean} isGlobal If the file should be stored globally or locally.
     * @param {string} filename The name of the config file.
     * @return {ConfigOptions} The ConfigOptions.
     */
    static getDefaultOptions(isGlobal?: boolean, filename?: string): ConfigOptions;
    /**
     * Helper used to determined what the local and global folder point to.
     *
     * @param {boolean} isGlobal True if the config should be global. False for local.
     * @returns {Promise<string>} The file path of the root folder.
     */
    static resolveRootFolder(isGlobal: boolean): Promise<string>;
    /**
     * Create an instance of this config file, without actually reading or writing the file.
     * After the instance is created, you can call {@link ConfigFile.read} to read the existing
     * file or {@link ConfigFile.write} to create or overwrite the file.
     *
     * **Note:** Cast to the extended class. e.g. `await MyConfig.create<MyConfig>();`
     *
     * @param {ConfigOptions} [options] The options used to create the file. Will use {@link ConfigFile.getDefaultOptions} by default.
     * {@link ConfigFile.getDefaultOptions} with no parameters by default.
     */
    static create<T extends ConfigFile>(options?: ConfigOptions): Promise<T>;
    /**
     * Creates the config instance and reads the contents of the existing file, if there is one.
     *
     * This is the same as
     * ```
     * const myConfig = await MyConfig.create<MyConfig>();
     * await myConfig.read();
     * ```
     *
     * **Note:** Cast to the extended class. e.g. `await MyConfig.retrieve<MyConfig>();`
     *
     * @param {ConfigOptions} [options] The options used to create the file. Will use {@link ConfigFile.getDefaultOptions} by default.
     * {@link ConfigFile.getDefaultOptions} with no parameters by default.
     */
    static retrieve<T extends ConfigFile>(options?: ConfigOptions): Promise<T>;
    private options;
    private path;
    /**
     * Determines if the config file is read/write accessible.
     * @param {number} perm The permission.
     * @returns {Promise<boolean>} `true` if the user has capabilities specified by perm.
     * @see {@link https://nodejs.org/api/fs.html#fs_fs_access_path_mode_callback|fs.access}
     */
    access(perm: number): Promise<boolean>;
    /**
     * Read the config file and set the config contents.
     * @param {boolean} [throwOnNotFound = false] Optionally indicate if a throw should occur on file read.
     * @returns {Promise<object>} The config contents of the config file.
     * @throws {SfdxError}
     *    **`{name: 'UnexpectedJsonFileFormat'}`:** There was a problem reading or parsing the file.
     */
    read(throwOnNotFound?: boolean): Promise<ConfigContents>;
    /**
     * Write the config file with new contents. If no new contents are passed in
     * it will write the existing config contents that were set from {@link ConfigFile.read}, or an
     * empty file if {@link ConfigFile.read} was not called.
     *
     * @param {object} [newContents] The new contents of the file.
     * @returns {Promise<object>} The written contents.
     */
    write(newContents?: ConfigContents): Promise<object>;
    /**
     * Check to see if the config file exists.
     *
     * @returns {Promise<boolean>} True if the config file exists and has access, false otherwise.
     */
    exists(): Promise<boolean>;
    /**
     * Get the stats of the file.
     *
     * @returns {Promise<fs.Stats>} stats The stats of the file.
     * @see {@link https://nodejs.org/api/fs.html#fs_fs_fstat_fd_callback|fs.stat}
     */
    stat(): Promise<fsStats>;
    /**
     * Delete the config file if it exists.
     *
     * @returns {Promise<boolean>} True if the file was deleted, false otherwise.
     * @see {@link https://nodejs.org/api/fs.html#fs_fs_unlink_path_callback|fs.unlink}
     */
    unlink(): Promise<void>;
    /**
     * Returns the path to the config file.
     * @returns {string}
     */
    getPath(): string;
    /**
     * Returns true if this config is using the global path, false otherwise.
     * @returns {boolean}
     */
    isGlobal(): boolean;
}
