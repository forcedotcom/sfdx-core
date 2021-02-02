'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var util_fs = require('../util/fs.js');
var config_configFile = require('./configFile.js');
require('../index-aea73a28.js');
require('../_commonjsHelpers-49936489.js');
require('crypto');
require('fs');
require('constants');
require('stream');
require('util');
require('assert');
require('../sfdxError.js');
require('../index-ffe6ca9f.js');
require('../messages.js');
require('os');
require('../global.js');
require('../logger.js');
require('events');
require('../index-e6d82ffe.js');
require('tty');
require('../util/internal.js');
require('./configStore.js');

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * Represent a key chain config backed by a json file.
 */
// istanbul ignore next - getPassword/setPassword is always mocked out
class KeychainConfig extends config_configFile.ConfigFile {
  static getFileName() {
    return 'key.json';
  }
  /**
   * Gets default options for the KeychainConfig
   */
  static getDefaultOptions() {
    return config_configFile.ConfigFile.getDefaultOptions(true, KeychainConfig.getFileName());
  }
  /**
   * Write the config file with new contents. If no new contents are passed in
   * it will write this.contents that was set from read(). Returns the written contents.
   *
   * @param newContents the new contents of the file
   */
  async write(newContents) {
    if (newContents != null) {
      this.setContents(newContents);
    }
    await util_fs.fs.mkdirp(path.dirname(this.getPath()));
    await util_fs.fs.writeFile(this.getPath(), JSON.stringify(this.getContents(), null, 4), { mode: '600' });
    return this.getContents();
  }
}

exports.KeychainConfig = KeychainConfig;
//# sourceMappingURL=keychainConfig.js.map
