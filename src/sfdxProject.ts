/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { basename, dirname, isAbsolute, normalize, sep } from 'path';

import { defaults, env } from '@salesforce/kit';
import { Dictionary, ensure, JsonMap, Nullable, Optional } from '@salesforce/ts-types';
import { ConfigAggregator } from './config/configAggregator';
import { ConfigFile } from './config/configFile';
import { ConfigContents } from './config/configStore';

import { SchemaValidator } from './schema/validator';
import { fs } from './util/fs';
import { resolveProjectPath, resolveProjectPathSync, SFDX_PROJECT_JSON } from './util/internal';

import { SfdxError } from './sfdxError';
import { sfdc } from './util/sfdc';

export type PackageDirDependency = {
  [k: string]: unknown;
  package: string;
  versionNumber?: string;
};

export type PackageDir = {
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

export type NamedPackageDir = PackageDir & {
  /**
   * The [normalized](https://nodejs.org/api/path.html#path_path_normalize_path) path used as the package name.
   */
  name: string;
  /**
   * The absolute path of the package.
   */
  fullPath: string;
};

export type ProjectJson = ConfigContents & {
  packageDirectories: PackageDir[];
  namespace?: string;
  sourceApiVersion?: string;
  sfdcLoginUrl?: string;
  signupTargetLoginUrl?: string;
  oauthLocalPort?: number;
  plugins?: { [k: string]: unknown };
  packageAliases?: { [k: string]: string };
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
export class SfdxProjectJson extends ConfigFile<ConfigFile.Options> {
  public static BLOCKLIST = ['packageAliases'];

  public constructor(options: ConfigFile.Options) {
    super(options);
  }

  public static getFileName() {
    return SFDX_PROJECT_JSON;
  }

  public static getDefaultOptions(isGlobal = false): ConfigFile.Options {
    const options = ConfigFile.getDefaultOptions(isGlobal, SfdxProjectJson.getFileName());
    options.isState = false;
    return options;
  }

  public async read(): Promise<ConfigContents> {
    const contents = await super.read();
    this.validateKeys();
    await this.schemaValidate();
    return contents;
  }

  public readSync(): ConfigContents {
    const contents = super.readSync();
    this.validateKeys();
    this.schemaValidateSync();
    return contents;
  }

  public async write(newContents?: ConfigContents): Promise<ConfigContents> {
    this.setContents(newContents);
    this.validateKeys();
    await this.schemaValidate();
    return super.write();
  }

  public writeSync(newContents?: ConfigContents): ConfigContents {
    this.setContents(newContents);
    this.validateKeys();
    this.schemaValidateSync();
    return super.writeSync();
  }

  public getContents(): ProjectJson {
    return super.getContents() as ProjectJson;
  }

  public getDefaultOptions(options?: ConfigFile.Options): ConfigFile.Options {
    const defaultOptions: ConfigFile.Options = {
      isState: false,
    };

    Object.assign(defaultOptions, options || {});
    return defaultOptions;
  }

  /**
   * Validates sfdx-project.json against the schema.
   *
   * Set the `SFDX_PROJECT_JSON_VALIDATION` environment variable to `true` to throw an error when schema validation fails.
   * A warning is logged by default when the file is invalid.
   *
   * ***See*** [sfdx-project.schema.json] (https://raw.githubusercontent.com/forcedotcom/schemas/master/schemas/sfdx-project.schema.json)
   */
  public async schemaValidate(): Promise<void> {
    if (!this.hasRead) {
      // read calls back into this method after necessarily setting this.hasRead=true
      await this.read();
    } else {
      try {
        const projectJsonSchemaPath = require.resolve('@salesforce/schemas/sfdx-project.schema.json');
        const validator = new SchemaValidator(this.logger, projectJsonSchemaPath);
        await validator.load();
        await validator.validate(this.getContents());
      } catch (err) {
        if (env.getBoolean('SFDX_PROJECT_JSON_VALIDATION', false)) {
          err.name = 'SfdxSchemaValidationError';
          const sfdxError = SfdxError.wrap(err);
          sfdxError.actions = [this.messages.getMessage('SchemaValidationErrorAction', [this.getPath()])];
          throw sfdxError;
        } else {
          this.logger.warn(this.messages.getMessage('SchemaValidationWarning', [this.getPath(), err.message]));
        }
      }
    }
  }

  /**
   * Returns the `packageDirectories` within sfdx-project.json, first reading
   * and validating the file if necessary.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async getPackageDirectories(): Promise<PackageDir[]> {
    return this.getPackageDirectoriesSync();
  }

  /**
   * Validates sfdx-project.json against the schema.
   *
   * Set the `SFDX_PROJECT_JSON_VALIDATION` environment variable to `true` to throw an error when schema validation fails.
   * A warning is logged by default when the file is invalid.
   *
   * ***See*** [sfdx-project.schema.json] (https://raw.githubusercontent.com/forcedotcom/schemas/master/schemas/sfdx-project.schema.json)
   */
  public schemaValidateSync(): void {
    if (!this.hasRead) {
      // read calls back into this method after necessarily setting this.hasRead=true
      this.readSync();
    } else {
      try {
        const projectJsonSchemaPath = require.resolve('@salesforce/schemas/sfdx-project.schema.json');
        const validator = new SchemaValidator(this.logger, projectJsonSchemaPath);
        validator.loadSync();
        validator.validateSync(this.getContents());
      } catch (err) {
        if (env.getBoolean('SFDX_PROJECT_JSON_VALIDATION', false)) {
          err.name = 'SfdxSchemaValidationError';
          const sfdxError = SfdxError.wrap(err);
          sfdxError.actions = [this.messages.getMessage('SchemaValidationErrorAction', [this.getPath()])];
          throw sfdxError;
        } else {
          this.logger.warn(this.messages.getMessage('SchemaValidationWarning', [this.getPath(), err.message]));
        }
      }
    }
  }

  /**
   * Returns a read-only list of `packageDirectories` within sfdx-project.json, first reading
   * and validating the file if necessary. i.e. modifying this array will not affect the
   * sfdx-project.json file.
   */
  public getPackageDirectoriesSync(): NamedPackageDir[] {
    const contents = this.getContents();

    // This has to be done on the fly so it won't be written back to the file
    // This is a fast operation so no need to cache it so it stays immutable.
    const packageDirs = (contents.packageDirectories || []).map((packageDir) => {
      if (isAbsolute(packageDir.path)) {
        throw new SfdxError(
          'InvalidProjectWorkspace',
          this.messages.getMessage('InvalidAbsolutePath', [packageDir.path])
        );
      }

      const regex = sep === '/' ? /\\/g : /\//g;
      // Change packageDir paths to have path separators that match the OS
      const path = packageDir.path.replace(regex, sep);
      // Normalize and remove any ending path separators
      const name = normalize(path).replace(new RegExp(`\\${sep}$`), '');
      // Always end in a path sep for standardization on folder paths
      const fullPath = `${dirname(this.getPath())}${sep}${name}${sep}`;

      if (!this.doesPackageExist(fullPath)) {
        throw new SfdxError(
          'InvalidPackageDirectory',
          this.messages.getMessage('InvalidPackageDirectory', [packageDir.path])
        );
      }

      return Object.assign({}, packageDir, { name, path, fullPath });
    });

    const defaultDirs = packageDirs.filter((packageDir) => packageDir.default);

    if (defaultDirs.length === 0) {
      throw new SfdxError(this.messages.getMessage('MissingDefaultPath'));
    } else if (defaultDirs.length > 1) {
      throw new SfdxError(this.messages.getMessage('MultipleDefaultPaths'));
    }

    return packageDirs;
  }

  /**
   * Returns a read-only list of `packageDirectories` within sfdx-project.json, first reading
   * and validating the file if necessary. i.e. modifying this array will not affect the
   * sfdx-project.json file.
   *
   * There can be multiple packages in packageDirectories that point to the same directory.
   * This method only returns one packageDirectory entry per unique directory path. This is
   * useful when doing source operations based on directories but probably not as useful
   * for packaging operations that want to do something for each package entry.
   */
  public getUniquePackageDirectories(): NamedPackageDir[] {
    const visited: Dictionary<boolean> = {};
    const uniqueValues: NamedPackageDir[] = [];

    // Keep original order defined in sfdx-project.json
    this.getPackageDirectoriesSync().forEach((packageDir) => {
      if (!visited[packageDir.name]) {
        visited[packageDir.name] = true;
        uniqueValues.push(packageDir);
      }
    });

    return uniqueValues;
  }

  /**
   * Get a list of the unique package names from within sfdx-project.json. Use {@link SfdxProject.getUniquePackageDirectories}
   * for data other than the names.
   */
  public getUniquePackageNames(): string[] {
    return this.getUniquePackageDirectories().map((pkgDir) => pkgDir.name);
  }

  /**
   * Has package directories defined in the project.
   */
  public hasPackages(): boolean {
    return this.getContents().packageDirectories && this.getContents().packageDirectories.length > 0;
  }

  /**
   * Has multiple package directories (MPD) defined in the project.
   */
  public hasMultiplePackages(): boolean {
    return this.getContents().packageDirectories && this.getContents().packageDirectories.length > 1;
  }

  private doesPackageExist(packagePath: string) {
    return fs.existsSync(packagePath);
  }

  private validateKeys(): void {
    // Verify that the configObject does not have upper case keys; throw if it does.  Must be heads down camel case.
    const upperCaseKey = sfdc.findUpperCaseKeys(this.toObject(), SfdxProjectJson.BLOCKLIST);
    if (upperCaseKey) {
      throw SfdxError.create('@salesforce/core', 'core', 'InvalidJsonCasing', [upperCaseKey, this.getPath()]);
    }
  }
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
export class SfdxProject {
  // Cache of SfdxProject instances per path.
  private static instances = new Map<string, SfdxProject>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private projectConfig: any;

  // Dynamically referenced in retrieveSfdxProjectJson
  private sfdxProjectJson!: SfdxProjectJson;
  private sfdxProjectJsonGlobal!: SfdxProjectJson;

  private packageDirectories?: NamedPackageDir[];
  private activePackage: Nullable<NamedPackageDir>;

  /**
   * Do not directly construct instances of this class -- use {@link SfdxProject.resolve} instead.
   *
   * @ignore
   */
  private constructor(private path: string) {}

  /**
   * Get a Project from a given path or from the working directory.
   *
   * @param path The path of the project.
   *
   * **Throws** *{@link SfdxError}{ name: 'InvalidProjectWorkspace' }* If the current folder is not located in a workspace.
   */
  public static async resolve(path?: string): Promise<SfdxProject> {
    path = await this.resolveProjectPath(path || process.cwd());
    if (!SfdxProject.instances.has(path)) {
      const project = new SfdxProject(path);
      SfdxProject.instances.set(path, project);
    }
    return ensure(SfdxProject.instances.get(path));
  }

  /**
   * Get a Project from a given path or from the working directory.
   *
   * @param path The path of the project.
   *
   * **Throws** *{@link SfdxError}{ name: 'InvalidProjectWorkspace' }* If the current folder is not located in a workspace.
   */
  public static getInstance(path?: string): SfdxProject {
    // Store instance based on the path of the actual project.
    path = this.resolveProjectPathSync(path || process.cwd());

    if (!SfdxProject.instances.has(path)) {
      const project = new SfdxProject(path);
      SfdxProject.instances.set(path, project);
    }
    return ensure(SfdxProject.instances.get(path));
  }

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
  public static async resolveProjectPath(dir?: string): Promise<string> {
    return resolveProjectPath(dir);
  }

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
  public static resolveProjectPathSync(dir?: string): string {
    return resolveProjectPathSync(dir);
  }

  /**
   * Returns the project path.
   */
  public getPath(): string {
    return this.path;
  }

  /**
   * Get the sfdx-project.json config. The global sfdx-project.json is used for user defaults
   * that are not checked in to the project specific file.
   *
   * *Note:* When reading values from {@link SfdxProjectJson}, it is recommended to use
   * {@link SfdxProject.resolveProjectConfig} instead.
   *
   * @param isGlobal True to get the global project file, otherwise the local project config.
   */
  public async retrieveSfdxProjectJson(isGlobal = false): Promise<SfdxProjectJson> {
    const options = SfdxProjectJson.getDefaultOptions(isGlobal);
    if (isGlobal) {
      if (!this.sfdxProjectJsonGlobal) {
        this.sfdxProjectJsonGlobal = await SfdxProjectJson.create(options);
      }
      return this.sfdxProjectJsonGlobal;
    } else {
      options.rootFolder = this.getPath();
      if (!this.sfdxProjectJson) {
        this.sfdxProjectJson = await SfdxProjectJson.create(options);
      }
      return this.sfdxProjectJson;
    }
  }

  /**
   * Get the sfdx-project.json config. The global sfdx-project.json is used for user defaults
   * that are not checked in to the project specific file.
   *
   * *Note:* When reading values from {@link SfdxProjectJson}, it is recommended to use
   * {@link SfdxProject.resolveProjectConfig} instead.
   *
   * This is the sync method of {@link SfdxProject.resolveSfdxProjectJson}
   *
   * @param isGlobal True to get the global project file, otherwise the local project config.
   */
  public getSfdxProjectJson(isGlobal = false): SfdxProjectJson {
    const options = SfdxProjectJson.getDefaultOptions(isGlobal);
    if (isGlobal) {
      if (!this.sfdxProjectJsonGlobal) {
        this.sfdxProjectJsonGlobal = new SfdxProjectJson(options);
        this.sfdxProjectJsonGlobal.readSync();
      }
      return this.sfdxProjectJsonGlobal;
    } else {
      options.rootFolder = this.getPath();
      if (!this.sfdxProjectJson) {
        this.sfdxProjectJson = new SfdxProjectJson(options);
        this.sfdxProjectJson.readSync();
      }
      return this.sfdxProjectJson;
    }
  }

  /**
   * Returns a read-only list of `packageDirectories` within sfdx-project.json, first reading
   * and validating the file if necessary. i.e. modifying this array will not affect the
   * sfdx-project.json file.
   */
  public getPackageDirectories(): NamedPackageDir[] {
    if (!this.packageDirectories) {
      this.packageDirectories = this.getSfdxProjectJson().getPackageDirectoriesSync();
    }
    return this.packageDirectories;
  }

  /**
   * Returns a read-only list of `packageDirectories` within sfdx-project.json, first reading
   * and validating the file if necessary. i.e. modifying this array will not affect the
   * sfdx-project.json file.
   *
   * There can be multiple packages in packageDirectories that point to the same directory.
   * This method only returns one packageDirectory entry per unique directory path. This is
   * useful when doing source operations based on directories but probably not as useful
   * for packaging operations that want to do something for each package entry.
   */
  public getUniquePackageDirectories(): NamedPackageDir[] {
    return this.getSfdxProjectJson().getUniquePackageDirectories();
  }

  /**
   * Get a list of the unique package names from within sfdx-project.json. Use {@link SfdxProject.getUniquePackageDirectories}
   * for data other than the names.
   */
  public getUniquePackageNames(): string[] {
    return this.getSfdxProjectJson().getUniquePackageNames();
  }

  /**
   * Returns the package from a file path.
   *
   * @param path A file path. E.g. /Users/jsmith/projects/ebikes-lwc/force-app/apex/my-cls.cls
   */
  public getPackageFromPath(path: string): Optional<NamedPackageDir> {
    const packageDirs = this.getPackageDirectories();
    const match = packageDirs.find(
      (packageDir) => basename(path) === packageDir.name || path.includes(packageDir.fullPath)
    );
    return match;
  }

  /**
   * Returns the package name, E.g. 'force-app', from a file path.
   *
   * @param path A file path. E.g. /Users/jsmith/projects/ebikes-lwc/force-app/apex/my-cls.cls
   */
  public getPackageNameFromPath(path: string): Optional<string> {
    const packageDir = this.getPackageFromPath(path);
    return packageDir ? packageDir.name : undefined;
  }

  /**
   * Returns the package directory.
   *
   * @param packageName Name of the package directory.  E.g., 'force-app'
   */
  public getPackage(packageName: string): Optional<NamedPackageDir> {
    const packageDirs = this.getPackageDirectories();
    return packageDirs.find((packageDir) => packageDir.name === packageName);
  }

  /**
   * Returns the absolute path of the package directory ending with the path separator.
   * E.g., /Users/jsmith/projects/ebikes-lwc/force-app/
   *
   * @param packageName Name of the package directory.  E.g., 'force-app'
   */
  public getPackagePath(packageName: string): Optional<string> {
    const packageDir = this.getPackage(packageName);
    return packageDir && packageDir.fullPath;
  }

  /**
   * Has package directories defined in the project.
   */
  public hasPackages(): boolean {
    return this.getSfdxProjectJson().hasPackages();
  }

  /**
   * Has multiple package directories (MPD) defined in the project.
   */
  public hasMultiplePackages(): boolean {
    return this.getSfdxProjectJson().hasMultiplePackages();
  }

  /**
   * Get the currently activated package on the project. This has no implication on sfdx-project.json
   * but is useful for keeping track of package and source specific options in a process.
   */
  public getActivePackage(): Nullable<NamedPackageDir> {
    return this.activePackage;
  }

  /**
   * Set the currently activated package on the project. This has no implication on sfdx-project.json
   * but is useful for keeping track of package and source specific options in a process.
   *
   * @param pkgName The package name to activate. E.g. 'force-app'
   */
  public setActivePackage(packageName: Nullable<string>) {
    if (packageName == null) {
      this.activePackage = null;
    } else {
      this.activePackage = this.getPackage(packageName);
    }
  }

  /**
   * Get the project's default package directory defined in sfdx-project.json using first 'default: true'
   * found. The first entry is returned if no default is specified.
   */
  public getDefaultPackage(): NamedPackageDir {
    if (!this.hasPackages()) {
      throw new SfdxError('The sfdx-project.json does not have any packageDirectories defined.');
    }
    const defaultPackage = this.getPackageDirectories().find((packageDir) => packageDir.default === true);
    return defaultPackage || this.getPackageDirectories()[0];
  }

  /**
   * The project config is resolved from local and global {@link SfdxProjectJson},
   * {@link ConfigAggregator}, and a set of defaults. It is recommended to use
   * this when reading values from SfdxProjectJson.
   *
   * @returns A resolved config object that contains a bunch of different
   * properties, including some 3rd party custom properties.
   */
  public async resolveProjectConfig(): Promise<JsonMap> {
    if (!this.projectConfig) {
      // Get sfdx-project.json from the ~/.sfdx directory to provide defaults
      const global = await this.retrieveSfdxProjectJson(true);
      const local = await this.retrieveSfdxProjectJson();

      await global.read();
      await local.read();

      const defaultValues = {
        sfdcLoginUrl: 'https://login.salesforce.com',
      };

      this.projectConfig = defaults(local.toObject(), global.toObject(), defaultValues);

      // Add fields in sfdx-config.json
      Object.assign(this.projectConfig, (await ConfigAggregator.create()).getConfig());

      // LEGACY - Allow override of sfdcLoginUrl via env var FORCE_SFDC_LOGIN_URL
      if (process.env.FORCE_SFDC_LOGIN_URL) {
        this.projectConfig.sfdcLoginUrl = process.env.FORCE_SFDC_LOGIN_URL;
      }
    }

    return this.projectConfig;
  }
}
