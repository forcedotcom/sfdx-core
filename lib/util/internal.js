'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var sfdxError = require('../sfdxError.js');
var util_fs = require('./fs.js');
require('../index-aea73a28.js');
require('../_commonjsHelpers-49936489.js');
require('../index-ffe6ca9f.js');
require('../messages.js');
require('fs');
require('os');
require('path');
require('util');
require('crypto');
require('constants');
require('stream');
require('assert');

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * The name of the project config file.
 * @ignore
 */
// This has to be defined on util to prevent circular deps with project and configFile.
const SFDX_PROJECT_JSON = 'sfdx-project.json';
/**
 * Performs an upward directory search for an sfdx project file. Returns the absolute path to the project.
 *
 * **See** {@link SFDX_PROJECT_JSON}
 *
 * **See** {@link traverseForFile}
 *
 * **Throws** *{@link SfdxError}{ name: 'InvalidProjectWorkspace' }* If the current folder is not located in a workspace.
 * @param dir The directory path to start traversing from.
 * @ignore
 */
async function resolveProjectPath(dir = process.cwd()) {
  const projectPath = await util_fs.fs.traverseForFile(dir, SFDX_PROJECT_JSON);
  if (!projectPath) {
    throw sfdxError.SfdxError.create('@salesforce/core', 'config', 'InvalidProjectWorkspace');
  }
  return projectPath;
}
/**
 * Performs a synchronous upward directory search for an sfdx project file. Returns the absolute path to the project.
 *
 * **See** {@link SFDX_PROJECT_JSON}
 *
 * **See** {@link traverseForFile}
 *
 * **Throws** *{@link SfdxError}{ name: 'InvalidProjectWorkspace' }* If the current folder is not located in a workspace.
 * @param dir The directory path to start traversing from.
 * @ignore
 */
function resolveProjectPathSync(dir = process.cwd()) {
  const projectPath = util_fs.fs.traverseForFileSync(dir, SFDX_PROJECT_JSON);
  if (!projectPath) {
    throw sfdxError.SfdxError.create('@salesforce/core', 'config', 'InvalidProjectWorkspace');
  }
  return projectPath;
}

exports.SFDX_PROJECT_JSON = SFDX_PROJECT_JSON;
exports.resolveProjectPath = resolveProjectPath;
exports.resolveProjectPathSync = resolveProjectPathSync;
//# sourceMappingURL=internal.js.map
