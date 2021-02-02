import { Stats as fsStats } from 'fs';
import { BaseConfigStore, ConfigContents } from './configStore';
/**
 * Represents a json config file used to manage settings and state. Global config
 * files are stored in the home directory hidden state folder (.sfdx) and local config
 * files are stored in the project path, either in the hidden state folder or wherever
 * specified.
 *
 * ```
 * class MyConfig extends ConfigFile {
 *   public static getFileName(): string {
 *     return 'myConfigFilename.json';
 *   }
 * }
 * const myConfig = await MyConfig.create({
 *   isGlobal: true
 * });
 * myConfig.set('mykey', 'myvalue');
 * await myConfig.write();
 * ```
 */
export declare class ConfigFile<T extends ConfigFile.Options> extends BaseConfigStore<T> {
  /**
   * Returns the config's filename.
   */
  static getFileName(): string;
  /**
   * Returns the default options for the config file.
   * @param isGlobal If the file should be stored globally or locally.
   * @param filename The name of the config file.
   */
  static getDefaultOptions(isGlobal?: boolean, filename?: string): ConfigFile.Options;
  /**
   * Helper used to determined what the local and global folder point to. Returns the file path of the root folder.
   *
   * @param isGlobal True if the config should be global. False for local.
   */
  static resolveRootFolder(isGlobal: boolean): Promise<string>;
  private path;
  /**
   * Constructor
   * **Do not directly construct instances of this class -- use {@link ConfigFile.create} instead.**
   * @param options The options for the class instance
   * @ignore
   */
  constructor(options: T);
  /**
   * Determines if the config file is read/write accessible. Returns `true` if the user has capabilities specified
   * by perm.
   * @param {number} perm The permission.
   *
   * **See** {@link https://nodejs.org/dist/latest/docs/api/fs.html#fs_fs_access_path_mode_callback}
   */
  access(perm: number): Promise<boolean>;
  /**
   * Read the config file and set the config contents. Returns the config contents of the config file.
   * **Throws** *{@link SfdxError}{ name: 'UnexpectedJsonFileFormat' }* There was a problem reading or parsing the file.
   * @param [throwOnNotFound = false] Optionally indicate if a throw should occur on file read.
   */
  read(throwOnNotFound?: boolean): Promise<ConfigContents>;
  /**
   * Write the config file with new contents. If no new contents are provided it will write the existing config
   * contents that were set from {@link ConfigFile.read}, or an empty file if {@link ConfigFile.read} was not called.
   *
   * @param newContents The new contents of the file.
   */
  write(newContents?: ConfigContents): Promise<ConfigContents>;
  /**
   * Check to see if the config file exists. Returns `true` if the config file exists and has access, false otherwise.
   */
  exists(): Promise<boolean>;
  /**
   * Get the stats of the file. Returns the stats of the file.
   *
   * {@link fs.stat}
   */
  stat(): Promise<fsStats>;
  /**
   * Delete the config file if it exists. Returns `true` if the file was deleted, `false` otherwise.
   *
   * {@link fs.unlink}
   */
  unlink(): Promise<void>;
  /**
   * Returns the path to the config file.
   */
  getPath(): string;
  /**
   * Returns `true` if this config is using the global path, `false` otherwise.
   */
  isGlobal(): boolean;
  /**
   * Used to initialize asynchronous components.
   *
   * **Throws** *`Error`{ code: 'ENOENT' }* If the {@link ConfigFile.getFilename} file is not found when
   * options.throwOnNotFound is true.
   */
  protected init(): Promise<void>;
}
export declare namespace ConfigFile {
  /**
   * The interface for Config options.
   */
  interface Options extends BaseConfigStore.Options {
    /**
     * The root folder where the config file is stored.
     */
    rootFolder?: string;
    /**
     * The file name.
     */
    filename?: string;
    /**
     * If the file is in the global or project directory.
     */
    isGlobal?: boolean;
    /**
     * If the file is in the state folder or no (.sfdx).
     */
    isState?: boolean;
    /**
     * The full file path where the config file is stored.
     */
    filePath?: string;
    /**
     * Indicates if init should throw if the corresponding config file is not found.
     */
    throwOnNotFound?: boolean;
  }
}
