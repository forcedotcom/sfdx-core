/**
 * Represents an environment mode.  Supports `production`, `development`, `demo`, and `test`
 * with the default mode being `production`.
 *
 * To set the mode, `export SFDX_ENV=<mode>` in your current environment.
 */
export declare enum Mode {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  DEMO = 'demo',
  TEST = 'test'
}
/**
 * Global constants, methods, and configuration.
 */
export declare class Global {
  /**
   * The global folder in which state is stored.
   */
  static readonly STATE_FOLDER = '.sfdx';
  /**
   * The full system path to the global state folder.
   *
   * **See** {@link Global.STATE_FOLDER}
   */
  static readonly DIR: string;
  /**
   * The full system path to the global log file.
   */
  static readonly LOG_FILE_PATH: string;
  /**
   * Gets the current mode environment variable as a {@link Mode} instance.
   *
   * ```
   * console.log(Global.getEnvironmentMode() === Mode.PRODUCTION);
   * ```
   */
  static getEnvironmentMode(): Mode;
  /**
   * Creates a directory within {@link Global.DIR}, or {@link Global.DIR} itself if the `dirPath` param
   * is not provided. This is resolved or rejected when the directory creation operation has completed.
   *
   * @param dirPath The directory path to be created within {@link Global.DIR}.
   */
  static createDir(dirPath?: string): Promise<void>;
}
