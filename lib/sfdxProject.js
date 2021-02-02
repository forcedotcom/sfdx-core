'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var config_configAggregator = require('./config/configAggregator.js');
var config_configFile = require('./config/configFile.js');
var index = require('./index-aea73a28.js');
var schema_validator = require('./schema/validator.js');
var util_internal = require('./util/internal.js');
var sfdxError = require('./sfdxError.js');
var util_sfdc = require('./util/sfdc.js');
require('./index-ffe6ca9f.js');
require('./_commonjsHelpers-49936489.js');
require('./config/config.js');
require('./crypto.js');
require('crypto');
require('os');
require('./keyChain.js');
require('./keyChainImpl.js');
require('child_process');
require('fs');
require('./config/keychainConfig.js');
require('./util/fs.js');
require('constants');
require('stream');
require('util');
require('assert');
require('./messages.js');
require('./global.js');
require('./logger.js');
require('events');
require('./index-e6d82ffe.js');
require('tty');
require('./config/configStore.js');
require('./secureBuffer.js');
require('url');

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
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
class SfdxProjectJson extends config_configFile.ConfigFile {
  constructor(options) {
    super(options);
  }
  static getFileName() {
    return util_internal.SFDX_PROJECT_JSON;
  }
  static getDefaultOptions(isGlobal = false) {
    const options = config_configFile.ConfigFile.getDefaultOptions(isGlobal, SfdxProjectJson.getFileName());
    options.isState = false;
    return options;
  }
  async read() {
    const contents = await super.read();
    // Verify that the configObject does not have upper case keys; throw if it does.  Must be heads down camel case.
    const upperCaseKey = util_sfdc.sfdc.findUpperCaseKeys(this.toObject(), SfdxProjectJson.BLOCKLIST);
    if (upperCaseKey) {
      throw sfdxError.SfdxError.create('@salesforce/core', 'core', 'InvalidJsonCasing', [upperCaseKey, this.getPath()]);
    }
    await this.schemaValidate();
    return contents;
  }
  async write(newContents) {
    // Verify that the configObject does not have upper case keys; throw if it does.  Must be heads down camel case.
    const upperCaseKey = util_sfdc.sfdc.findUpperCaseKeys(newContents, SfdxProjectJson.BLOCKLIST);
    if (upperCaseKey) {
      throw sfdxError.SfdxError.create('@salesforce/core', 'core', 'InvalidJsonCasing', [upperCaseKey, this.getPath()]);
    }
    await this.schemaValidate();
    return super.write(newContents);
  }
  getContents() {
    return super.getContents();
  }
  getDefaultOptions(options) {
    const defaultOptions = {
      isState: false
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
  async schemaValidate() {
    if (!this.hasRead) {
      // read calls back into this method after necessarily setting this.hasRead=true
      await this.read();
    } else {
      try {
        const projectJsonSchemaPath = require.resolve('@salesforce/schemas/sfdx-project.schema.json');
        const validator = new schema_validator.SchemaValidator(this.logger, projectJsonSchemaPath);
        await validator.load();
        await validator.validate(this.getContents());
      } catch (err) {
        if (index.lib.env.getBoolean('SFDX_PROJECT_JSON_VALIDATION', false)) {
          err.name = 'SfdxSchemaValidationError';
          const sfdxError$1 = sfdxError.SfdxError.wrap(err);
          sfdxError$1.actions = [this.messages.getMessage('SchemaValidationErrorAction', [this.getPath()])];
          throw sfdxError$1;
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
  async getPackageDirectories() {
    // Ensure sfdx-project.json has first been read and validated.
    if (!this.hasRead) {
      await this.read();
    }
    const contents = this.getContents();
    const packageDirs = contents.packageDirectories.map(packageDir => {
      // Change packageDir paths to have path separators that match the OS
      const regex = path.sep === '/' ? /\\/g : /\//g;
      packageDir.path = packageDir.path.replace(regex, path.sep);
      return packageDir;
    });
    return packageDirs;
  }
}
SfdxProjectJson.BLOCKLIST = ['packageAliases'];
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
class SfdxProject {
  /**
   * Do not directly construct instances of this class -- use {@link SfdxProject.resolve} instead.
   *
   * @ignore
   */
  constructor(path) {
    this.path = path;
  }
  /**
   * Get a Project from a given path or from the working directory.
   * @param path The path of the project.
   *
   * **Throws** *{@link SfdxError}{ name: 'InvalidProjectWorkspace' }* If the current folder is not located in a workspace.
   */
  static async resolve(path) {
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
  static async resolveProjectPath(dir) {
    return util_internal.resolveProjectPath(dir);
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
  static resolveProjectPathSync(dir) {
    return util_internal.resolveProjectPathSync(dir);
  }
  /**
   * Returns the project path.
   */
  getPath() {
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
  async retrieveSfdxProjectJson(isGlobal = false) {
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
  async resolveProjectConfig() {
    if (!this.projectConfig) {
      // Get sfdx-project.json from the ~/.sfdx directory to provide defaults
      const global = await this.retrieveSfdxProjectJson(true);
      const local = await this.retrieveSfdxProjectJson();
      await global.read();
      await local.read();
      const defaultValues = {
        sfdcLoginUrl: 'https://login.salesforce.com'
      };
      this.projectConfig = index.lib.defaults(local.toObject(), global.toObject(), defaultValues);
      // Add fields in sfdx-config.json
      Object.assign(this.projectConfig, (await config_configAggregator.ConfigAggregator.create()).getConfig());
      // LEGACY - Allow override of sfdcLoginUrl via env var FORCE_SFDC_LOGIN_URL
      if (process.env.FORCE_SFDC_LOGIN_URL) {
        this.projectConfig.sfdcLoginUrl = process.env.FORCE_SFDC_LOGIN_URL;
      }
    }
    return this.projectConfig;
  }
}
// Cache of SfdxProject instances per path.
SfdxProject.instances = new Map();

exports.SfdxProject = SfdxProject;
exports.SfdxProjectJson = SfdxProjectJson;
//# sourceMappingURL=sfdxProject.js.map
