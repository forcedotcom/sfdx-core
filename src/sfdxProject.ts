/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { defaults } from '@salesforce/kit';

import { ConfigAggregator } from './config/configAggregator';
import { ConfigFile } from './config/configFile';
import { ConfigContents } from './config/configStore';

import { JsonMap } from '@salesforce/ts-types';
import { SfdxError } from './sfdxError';
import { resolveProjectPath, SFDX_PROJECT_JSON } from './util/internal';
import { sfdc } from './util/sfdc';

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
 * **See** https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_create_new.htm
 */
export class SfdxProjectJson extends ConfigFile<ConfigFile.Options> {
  public static getFileName() {
    return SFDX_PROJECT_JSON;
  }

  public static getDefaultOptions(isGlobal: boolean = false): ConfigFile.Options {
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
    const upperCaseKey = sfdc.findUpperCaseKeys(this.toObject());
    if (upperCaseKey) {
      throw SfdxError.create('@salesforce/core', 'core', 'InvalidJsonCasing', [upperCaseKey, this.getPath()]);
    }
    return contents;
  }

  public getDefaultOptions(options?: ConfigFile.Options): ConfigFile.Options {
    const defaultOptions: ConfigFile.Options = {
      isState: false
    };

    Object.assign(defaultOptions, options || {});
    return defaultOptions;
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
    return new SfdxProject(await this.resolveProjectPath(path));
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
   * **See** {@link https://nodejs.org/api/process.html#process_process_cwd|process.cwd()}
   */
  public static async resolveProjectPath(dir?: string): Promise<string> {
    return resolveProjectPath(dir);
  }

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
  public async retrieveSfdxProjectJson(isGlobal: boolean = false): Promise<SfdxProjectJson> {
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
