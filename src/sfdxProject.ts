/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { sep as pathSep } from 'path';

import { ConfigAggregator } from './config/configAggregator';
import { ConfigFile } from './config/configFile';
import { ConfigContents } from './config/configStore';

import { defaults, env } from '@salesforce/kit';
import { JsonMap } from '@salesforce/ts-types';
import { SchemaValidator } from './schema/validator';
import { resolveProjectPath, SFDX_PROJECT_JSON } from './util/internal';

// @ts-ignore
import projectJsonSchema = require('@salesforce/schema/sfdx-project-schema.json');
import { SfdxError } from './sfdxError';
import { sfdc } from './util/sfdc';

export interface PackageDirDependency {
  package: string;
  versionNumber?: string;
  [k: string]: unknown;
}

export interface PackageDir {
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
}

export interface ProjectJson {
  packageDirectories: PackageDir[];
  namespace?: string;
  sourceApiVersion?: string;
  sfdcLoginUrl?: string;
  signupTargetLoginUrl?: string;
  oauthLocalPort?: number;
  plugins?: { [k: string]: unknown };
  packageAliases?: { [k: string]: string };
}

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
  public static BLACKLIST = ['packageAliases'];

  public static getFileName() {
    return SFDX_PROJECT_JSON;
  }

  public static getDefaultOptions(isGlobal = false): ConfigFile.Options {
    const options = ConfigFile.getDefaultOptions(isGlobal, SfdxProjectJson.getFileName());
    options.isState = false;
    return options;
  }

  public constructor(options: ConfigFile.Options) {
    super(options);
  }

  public async read(): Promise<ConfigContents> {
    const contents = await super.read();

    // Verify that the configObject does not have upper case keys; throw if it does.  Must be heads down camel case.
    const upperCaseKey = sfdc.findUpperCaseKeys(this.toObject(), SfdxProjectJson.BLACKLIST);
    if (upperCaseKey) {
      throw SfdxError.create('@salesforce/core', 'core', 'InvalidJsonCasing', [upperCaseKey, this.getPath()]);
    }

    if (env.getBoolean('SFDX_SCHEMA_VALIDATE', false)) {
      await this.schemaValidate();
    }
    return contents;
  }

  public async write(newContents?: ConfigContents): Promise<ConfigContents> {
    // Verify that the configObject does not have upper case keys; throw if it does.  Must be heads down camel case.
    const upperCaseKey = sfdc.findUpperCaseKeys(newContents, SfdxProjectJson.BLACKLIST);
    if (upperCaseKey) {
      throw SfdxError.create('@salesforce/core', 'core', 'InvalidJsonCasing', [upperCaseKey, this.getPath()]);
    }

    if (env.getBoolean('SFDX_SCHEMA_VALIDATE', false)) {
      await this.schemaValidate();
    }
    return super.write(newContents);
  }

  public getDefaultOptions(options?: ConfigFile.Options): ConfigFile.Options {
    const defaultOptions: ConfigFile.Options = {
      isState: false
    };

    Object.assign(defaultOptions, options || {});
    return defaultOptions;
  }

  /**
   * Validates sfdx-project.json against the schema.
   *
   * ***See*** [sfdx-project.schema.json] (https://raw.githubusercontent.com/forcedotcom/schemas/master/schemas/sfdx-project.schema.json)
   */
  public async schemaValidate(): Promise<void> {
    if (!this.hasRead) {
      // read calls back into this method after setting this.hadRead = true
      await this.read();
    } else {
      const validator = new SchemaValidator(this.logger, projectJsonSchema);
      await validator.load();
      await validator.validate(this.getContents());
    }
  }

  /**
   * Returns the `packageDirectories` within sfdx-project.json, first reading
   * and validating the file if necessary.
   */
  public async getPackageDirectories(): Promise<PackageDir[]> {
    // Ensure sfdx-project.json has first been read and validated.
    if (!this.hasRead) {
      await this.read();
    }

    const contents = (this.getContents() as unknown) as ProjectJson;
    const packageDirs: PackageDir[] = contents.packageDirectories.map(packageDir => {
      // Change packageDir paths to have path separators that match the OS
      const regex = pathSep === '/' ? /\\/g : /\//g;
      packageDir.path = packageDir.path.replace(regex, pathSep);
      return packageDir;
    });
    return packageDirs;
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
  /**
   * Get a Project from a given path or from the working directory.
   * @param path The path of the project.
   *
   * **Throws** *{@link SfdxError}{ name: 'InvalidProjectWorkspace' }* If the current folder is not located in a workspace.
   */
  public static async resolve(path?: string): Promise<SfdxProject> {
    const _path = path || process.cwd();
    if (!SfdxProject.instances.has(_path)) {
      const project = new SfdxProject(await this.resolveProjectPath(_path));
      SfdxProject.instances.set(_path, project);
    }
    // @ts-ignore Because of the pattern above this is guaranteed to return an instance
    return SfdxProject.instances.get(_path);
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

  // Cache of SfdxProject instances per path.
  private static instances = new Map<string, SfdxProject>();

  private projectConfig: any; // tslint:disable-line:no-any

  // Dynamically referenced in retrieveSfdxProjectJson
  private sfdxProjectJson!: SfdxProjectJson;
  private sfdxProjectJsonGlobal!: SfdxProjectJson;

  /**
   * Do not directly construct instances of this class -- use {@link SfdxProject.resolve} instead.
   *
   * @ignore
   */
  private constructor(private path: string) {}

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
   * The project config is resolved from local and global {@link SfdxProjectJson},
   * {@link ConfigAggregator}, and a set of defaults. It is recommended to use
   * this when reading values from SfdxProjectJson.
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
        sfdcLoginUrl: 'https://login.salesforce.com'
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
