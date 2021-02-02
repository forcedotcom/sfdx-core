'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('./index-aea73a28.js');
var keyChainImpl = require('./keyChainImpl.js');
var logger = require('./logger.js');
var sfdxError = require('./sfdxError.js');
require('./_commonjsHelpers-49936489.js');
require('./index-ffe6ca9f.js');
require('child_process');
require('fs');
require('os');
require('path');
require('./config/configFile.js');
require('./global.js');
require('./util/fs.js');
require('crypto');
require('constants');
require('stream');
require('util');
require('assert');
require('./messages.js');
require('./util/internal.js');
require('./config/configStore.js');
require('events');
require('./index-e6d82ffe.js');
require('tty');
require('./config/keychainConfig.js');

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * Gets the os level keychain impl.
 * @param platform The os platform.
 * @ignore
 */
const retrieveKeychain = async platform => {
  const logger$1 = await logger.Logger.child('keyChain');
  logger$1.debug(`platform: ${platform}`);
  const useGenericUnixKeychainVar = index.lib.env.getBoolean('SFDX_USE_GENERIC_UNIX_KEYCHAIN');
  const shouldUseGenericUnixKeychain = !!useGenericUnixKeychainVar && useGenericUnixKeychainVar;
  if (/^win/.test(platform)) {
    return keyChainImpl.keyChainImpl.generic_windows;
  } else if (/darwin/.test(platform)) {
    // OSX can use the generic keychain. This is useful when running under an
    // automation user.
    if (shouldUseGenericUnixKeychain) {
      return keyChainImpl.keyChainImpl.generic_unix;
    } else {
      return keyChainImpl.keyChainImpl.darwin;
    }
  } else if (/linux/.test(platform)) {
    // Use the generic keychain if specified
    if (shouldUseGenericUnixKeychain) {
      return keyChainImpl.keyChainImpl.generic_unix;
    } else {
      // otherwise try and use the builtin keychain
      try {
        await keyChainImpl.keyChainImpl.linux.validateProgram();
        return keyChainImpl.keyChainImpl.linux;
      } catch (e) {
        // If the builtin keychain is not available use generic
        return keyChainImpl.keyChainImpl.generic_unix;
      }
    }
  } else {
    throw sfdxError.SfdxError.create('@salesforce/core', 'encryption', 'UnsupportedOperatingSystemError', [platform]);
  }
};

exports.retrieveKeychain = retrieveKeychain;
//# sourceMappingURL=keyChain.js.map
