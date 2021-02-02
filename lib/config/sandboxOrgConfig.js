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
 * A config file that stores usernames for an org.
 */
class SandboxOrgConfig extends config_configFile.ConfigFile {
  /**
   * Gets the config options for a given org ID.
   * @param orgId The orgId. Generally this org would have multiple users configured.
   */
  static getOptions(orgId) {
    return {
      isGlobal: true,
      isState: true,
      filename: `${orgId}.sandbox.json`,
      orgId
    };
  }
  /**
   * Constructor.
   * **Do not directly construct instances of this class -- use {@link SandboxConfig.create} instead.**
   * @param options The options for the class instance
   * @ignore
   */
  constructor(options) {
    super(options);
  }
}
(function(SandboxOrgConfig) {
  (function(Fields) {
    /**
     * The username of the user who created the sandbox.
     */
    Fields['PROD_ORG_USERNAME'] = 'prodOrgUsername';
  })(SandboxOrgConfig.Fields || (SandboxOrgConfig.Fields = {}));
})(SandboxOrgConfig || (SandboxOrgConfig = {}));

exports.SandboxOrgConfig = SandboxOrgConfig;
//# sourceMappingURL=sandboxOrgConfig.js.map
