'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var config_configFile = require('./configFile.js');
require('../index-ffe6ca9f.js');
require('../_commonjsHelpers-49936489.js');
require('fs');
require('os');
require('path');
require('../global.js');
require('../index-aea73a28.js');
require('../util/fs.js');
require('crypto');
require('constants');
require('stream');
require('util');
require('assert');
require('../sfdxError.js');
require('../messages.js');
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
 * An auth config file that stores information such as access tokens, usernames, etc.,
 * in the global sfdx directory (~/.sfdx).
 *
 * ```
 * const authInfo = await AuthInfoConfig.create(AuthInfoConfig.getOptions(username));
 * ```
 */
class AuthInfoConfig extends config_configFile.ConfigFile {
  /**
   * Gets the config options for a given org ID.
   * @param username The username for the org.
   */
  static getOptions(username) {
    return {
      isGlobal: true,
      isState: true,
      filename: `${username}.json`
    };
  }
}

exports.AuthInfoConfig = AuthInfoConfig;
//# sourceMappingURL=authInfoConfig.js.map
