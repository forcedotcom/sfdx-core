import { ConfigFile } from './config/configFile';
import { ConfigContents } from './config/configStore';
import { JsonMap } from '@salesforce/ts-types';
export declare type PackageDirDependency = {
  package: string;
  versionNumber?: string;
  [k: string]: unknown;
};
export declare type PackageDir = {
  ancestorId?: string;
  ancestorVersion?: string;
  default?: boolean;
  definitionFile?: string;
  dependencies?: PackageDirDependency[];
  includeProfileUserLicenses?: boolean;
  package?: string;
  path: string;
  postInstallScript?: string;
  postInstallUrl?: string;
  releaseNotesUrl?: string;
  uninstallScript?: string;
  versionDescription?: string;
  versionName?: string;
  versionNumber?: string;
};
export declare type ProjectJson = ConfigContents & {
  packageDirectories: PackageDir[];
  namespace?: string;
  sourceApiVersion?: string;
  sfdcLoginUrl?: string;
  signupTargetLoginUrl?: string;
  oauthLocalPort?: number;
  plugins?: {
    [k: string]: unknown;
  };
  packageAliases?: {
    [k: string]: string;
  };
};
/**
 * The sfdx-project.json config object. This file determines if a folder is a valid sfdx project.
 *
 * *Note:* Any non-standard (not owned by Salesforce) properties stored in sfdx-project.json should
 * be in a top level property that represents your project or plugin.
 *
 * ```
 * const project = await SfdxProjectJson.retrieve();
 * const myPluginProperties = project.get('myplugin') || {};
 * myPluginProperties.myprop = 'someValue';
 * project.set('myplugin', myPluginProperties);
 * await project.write();
 * ```
 *
 * **See** [force:project:create](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_create_new.htm)
 */
export declare class SfdxProjectJson extends ConfigFile<ConfigFile.Options> {
  static BLOCKLIST: string[];
  static getFileName(): string;
  static getDefaultOptions(isGlobal?: boolean): ConfigFile.Options;
  constructor(options: ConfigFile.Options);
  read(): Promise<ConfigContents>;
  write(newContents?: ConfigContents): Promise<ConfigContents>;
  getContents(): ProjectJson;
  getDefaultOptions(options?: ConfigFile.Options): ConfigFile.Options;
  /**
   * Validates sfdx-project.json against the schema.
   *
   * Set the `SFDX_PROJECT_JSON_VALIDATION` environment variable to `true` to throw an error when schema validation fails.
   * A warning is logged by default when the file is invalid.
   *
   * ***See*** [sfdx-project.schema.json] (https://raw.githubusercontent.com/forcedotcom/schemas/master/schemas/sfdx-project.schema.json)
   */
  schemaValidate(): Promise<void>;
  /**
   * Returns the `packageDirectories` within sfdx-project.json, first reading
   * and validating the file if necessary.
   */
  getPackageDirectories(): Promise<PackageDir[]>;
}
/**
 * Represents an SFDX project directory. This directory contains a {@link SfdxProjectJson} config file as well as
 * a hidden .sfdx folder that contains all the other local project config files.
 *
 * ```
 * const project = await SfdxProject.resolve();
 * const projectJson = await project.resolveProjectConfig();
 * console.log(projectJson.sfdcLoginUrl);
 * ```
 */
export declare class SfdxProject {
  private path;
  /**
   * Get a Project from a given path or from the working directory.
   * @param path The path of the project.
   *
   * **Throws** *{@link SfdxError}{ name: 'InvalidProjectWorkspace' }* If the current folder is not located in a workspace.
   */
  static resolve(path?: string): Promise<SfdxProject>;
  /**
   * Performs an upward directory search for an sfdx project file. Returns the absolute path to the project.
   *
   * @param dir The directory path to start traversing from.
   *
   * **Throws** *{@link SfdxError}{ name: 'InvalidProjectWorkspace' }* If the current folder is not located in a workspace.
   *
   * **See** {@link traverseForFile}
   *
   * **See** [process.cwd()](https://nodejs.org/api/process.html#process_process_cwd)
   */
  static resolveProjectPath(dir?: string): Promise<string>;
  /**
   * Performs a synchronous upward directory search for an sfdx project file. Returns the absolute path to the project.
   *
   * @param dir The directory path to start traversing from.
   *
   * **Throws** *{@link SfdxError}{ name: 'InvalidProjectWorkspace' }* If the current folder is not located in a workspace.
   *
   * **See** {@link traverseForFileSync}
   *
   * **See** [process.cwd()](https://nodejs.org/api/process.html#process_process_cwd)
   */
  static resolveProjectPathSync(dir?: string): string;
  private static instances;
  private projectConfig;
  private sfdxProjectJson;
  private sfdxProjectJsonGlobal;
  /**
   * Do not directly construct instances of this class -- use {@link SfdxProject.resolve} instead.
   *
   * @ignore
   */
  private constructor();
  /**
   * Returns the project path.
   */
  getPath(): string;
  /**
   * Get the sfdx-project.json config. The global sfdx-project.json is used for user defaults
   * that are not checked in to the project specific file.
   *
   * *Note:* When reading values from {@link SfdxProjectJson}, it is recommended to use
   * {@link SfdxProject.resolveProjectConfig} instead.
   *
   * @param isGlobal True to get the global project file, otherwise the local project config.
   */
  retrieveSfdxProjectJson(isGlobal?: boolean): Promise<SfdxProjectJson>;
  /**
   * The project config is resolved from local and global {@link SfdxProjectJson},
   * {@link ConfigAggregator}, and a set of defaults. It is recommended to use
   * this when reading values from SfdxProjectJson.
   * @returns A resolved config object that contains a bunch of different
   * properties, including some 3rd party custom properties.
   */
  resolveProjectConfig(): Promise<JsonMap>;
}
