'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('./index-aea73a28.js');
var os = require('os');
var path = require('path');
var util_fs = require('./util/fs.js');
require('./_commonjsHelpers-49936489.js');
require('crypto');
require('fs');
require('constants');
require('stream');
require('util');
require('assert');
require('./sfdxError.js');
require('./index-ffe6ca9f.js');
require('./messages.js');

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
(function(Mode) {
  Mode['PRODUCTION'] = 'production';
  Mode['DEVELOPMENT'] = 'development';
  Mode['DEMO'] = 'demo';
  Mode['TEST'] = 'test';
})(exports.Mode || (exports.Mode = {}));
/**
 * Global constants, methods, and configuration.
 */
class Global {
  /**
   * Gets the current mode environment variable as a {@link Mode} instance.
   *
   * ```
   * console.log(Global.getEnvironmentMode() === Mode.PRODUCTION);
   * ```
   */
  static getEnvironmentMode() {
    return exports.Mode[
      index.lib.env.getKeyOf('SFDX_ENV', exports.Mode, exports.Mode.PRODUCTION, value => value.toUpperCase())
    ];
  }
  /**
   * Creates a directory within {@link Global.DIR}, or {@link Global.DIR} itself if the `dirPath` param
   * is not provided. This is resolved or rejected when the directory creation operation has completed.
   *
   * @param dirPath The directory path to be created within {@link Global.DIR}.
   */
  static async createDir(dirPath) {
    dirPath = dirPath ? path.join(Global.DIR, dirPath) : Global.DIR;
    await util_fs.fs.mkdirp(dirPath, util_fs.fs.DEFAULT_USER_DIR_MODE);
  }
}
/**
 * The global folder in which state is stored.
 */
Global.STATE_FOLDER = '.sfdx';
/**
 * The full system path to the global state folder.
 *
 * **See** {@link Global.STATE_FOLDER}
 */
Global.DIR = path.join(os.homedir(), Global.STATE_FOLDER);
/**
 * The full system path to the global log file.
 */
Global.LOG_FILE_PATH = path.join(Global.DIR, 'sfdx.log');

exports.Global = Global;
//# sourceMappingURL=global.js.map
