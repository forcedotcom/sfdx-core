'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('../index-aea73a28.js');
var index$1 = require('../index-ffe6ca9f.js');
var crypto = require('../crypto.js');
var messages = require('../messages.js');
var sfdxError = require('../sfdxError.js');
var util_sfdc = require('../util/sfdc.js');
var config_configFile = require('./configFile.js');
require('../_commonjsHelpers-49936489.js');
require('crypto');
require('os');
require('path');
require('../keyChain.js');
require('../keyChainImpl.js');
require('child_process');
require('fs');
require('./keychainConfig.js');
require('../util/fs.js');
require('constants');
require('stream');
require('util');
require('assert');
require('../global.js');
require('../logger.js');
require('events');
require('../index-e6d82ffe.js');
require('tty');
require('../secureBuffer.js');
require('../util/internal.js');
require('./configStore.js');
require('url');

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const SFDX_CONFIG_FILE_NAME = 'sfdx-config.json';
/**
 * The files where sfdx config values are stored for projects and the global space.
 *
 * *Note:* It is not recommended to instantiate this object directly when resolving
 * config values. Instead use {@link ConfigAggregator}
 *
 * ```
 * const localConfig = await Config.create({});
 * localConfig.set('defaultusername', 'username@company.org');
 * await localConfig.write();
 * ```
 * https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_config_values.htm
 */
class Config extends config_configFile.ConfigFile {
  constructor(options) {
    super(options || Config.getDefaultOptions(false));
  }
  /**
   * Returns the default file name for a config file.
   *
   * **See** {@link SFDX_CONFIG_FILE_NAME}
   */
  static getFileName() {
    return SFDX_CONFIG_FILE_NAME;
  }
  /**
   * Returns an object representing the supported allowed properties.
   */
  static getAllowedProperties() {
    if (!Config.allowedProperties) {
      throw new sfdxError.SfdxError('Config meta information has not been initialized. Use Config.create()');
    }
    return Config.allowedProperties;
  }
  /**
   * Gets default options.
   * @param isGlobal Make the config global.
   * @param filename Override the default file. {@link Config.getFileName}
   */
  static getDefaultOptions(isGlobal = false, filename) {
    return {
      isGlobal,
      isState: true,
      filename: filename || this.getFileName()
    };
  }
  /**
   * The value of a supported config property.
   * @param isGlobal True for a global config. False for a local config.
   * @param propertyName The name of the property to set.
   * @param value The property value.
   */
  static async update(isGlobal, propertyName, value) {
    const config = await Config.create(Config.getDefaultOptions(isGlobal));
    const content = await config.read();
    if (value == null) {
      delete content[propertyName];
    } else {
      index.lib.set(content, propertyName, value);
    }
    return config.write(content);
  }
  /**
   * Clear all the configured properties both local and global.
   */
  static async clear() {
    let config = await Config.create(Config.getDefaultOptions(true));
    config.clear();
    await config.write();
    config = await Config.create(Config.getDefaultOptions(false));
    config.clear();
    await config.write();
  }
  /**
   * Read, assign, and return the config contents.
   */
  async read() {
    try {
      await super.read();
      await this.cryptProperties(false);
      return this.getContents();
    } finally {
      await this.clearCrypto();
    }
  }
  /**
   * Writes Config properties taking into account encrypted properties.
   * @param newContents The new Config value to persist.
   */
  async write(newContents) {
    if (newContents != null) {
      this.setContents(newContents);
    }
    await this.cryptProperties(true);
    await super.write();
    await this.cryptProperties(false);
    return this.getContents();
  }
  /**
   * Sets a value for a property.
   *
   * **Throws** *{@link SfdxError}{ name: 'InvalidConfigValue' }* If the input validator fails.
   * @param key The property to set.
   * @param value The value of the property.
   */
  set(key, value) {
    const property = Config.allowedProperties.find(allowedProp => allowedProp.key === key);
    if (!property) {
      throw sfdxError.SfdxError.create('@salesforce/core', 'config', 'UnknownConfigKey', [key]);
    }
    if (property.input) {
      if (property.input && property.input.validator(value)) {
        super.set(property.key, value);
      } else {
        throw sfdxError.SfdxError.create('@salesforce/core', 'config', 'InvalidConfigValue', [
          property.input.failedMessage
        ]);
      }
    } else {
      super.set(property.key, value);
    }
    return this.getContents();
  }
  /**
   * Unsets a value for a property.
   *
   * **Throws** *{@link SfdxError}{ name: 'UnknownConfigKey' }* If the input validator fails.
   * @param key The property to unset.
   */
  unset(key) {
    const property = Config.allowedProperties.find(allowedProp => allowedProp.key === key);
    if (!property) {
      throw sfdxError.SfdxError.create('@salesforce/core', 'config', 'UnknownConfigKey', [key]);
    }
    return super.unset(property.key);
  }
  /**
   * Initializer for supported config types.
   */
  async init() {
    if (!Config.messages) {
      Config.messages = messages.Messages.loadMessages('@salesforce/core', 'config');
    }
    if (!Config.allowedProperties) {
      Config.allowedProperties = [
        {
          key: 'instanceUrl',
          input: {
            // If a value is provided validate it otherwise no value is unset.
            validator: value =>
              value == null || (index$1.lib.isString(value) && util_sfdc.sfdc.isSalesforceDomain(value)),
            failedMessage: Config.messages.getMessage('InvalidInstanceUrl')
          }
        },
        {
          key: Config.API_VERSION,
          hidden: true,
          input: {
            // If a value is provided validate it otherwise no value is unset.
            validator: value =>
              value == null || (index$1.lib.isString(value) && util_sfdc.sfdc.validateApiVersion(value)),
            failedMessage: Config.messages.getMessage('InvalidApiVersion')
          }
        },
        { key: Config.DEFAULT_DEV_HUB_USERNAME },
        { key: Config.DEFAULT_USERNAME },
        {
          key: Config.ISV_DEBUGGER_SID,
          encrypted: true,
          input: {
            // If a value is provided validate it otherwise no value is unset.
            validator: value => value == null || index$1.lib.isString(value),
            failedMessage: Config.messages.getMessage('InvalidIsvDebuggerSid')
          }
        },
        {
          key: Config.ISV_DEBUGGER_URL,
          input: {
            // If a value is provided validate it otherwise no value is unset.
            validator: value => value == null || index$1.lib.isString(value),
            failedMessage: Config.messages.getMessage('InvalidIsvDebuggerUrl')
          }
        },
        {
          key: Config.DISABLE_TELEMETRY,
          input: {
            validator: value => value == null || ['true', 'false'].includes(value.toString()),
            failedMessage: Config.messages.getMessage('InvalidBooleanConfigValue')
          }
        },
        // This should be brought in by a plugin, but there isn't a way to do that right now.
        {
          key: 'restDeploy',
          hidden: true,
          input: {
            validator: value => value != null && ['true', 'false'].includes(value.toString()),
            failedMessage: Config.messages.getMessage('InvalidBooleanConfigValue')
          }
        },
        {
          key: Config.MAX_QUERY_LIMIT,
          input: {
            validator: value => index$1.lib.isNumber(value),
            failedMessage: Config.messages.getMessage('InvalidNumberConfigValue')
          }
        }
      ];
    }
    Config.propertyConfigMap = index.lib.keyBy(Config.allowedProperties, 'key');
    // Super ConfigFile calls read, which has a dependecy on crypto, which finally has a dependency on
    // Config.propertyConfigMap being set. This is why init is called after the setup.
    await super.init();
  }
  /**
   * Initialize the crypto dependency.
   */
  async initCrypto() {
    if (!this.crypto) {
      this.crypto = await crypto.Crypto.create();
    }
  }
  /**
   * Closes the crypto dependency. Crypto should be close after it's used and no longer needed.
   */
  async clearCrypto() {
    if (this.crypto) {
      this.crypto.close();
      delete this.crypto;
    }
  }
  /**
   * Get an individual property config.
   * @param propertyName The name of the property.
   */
  getPropertyConfig(propertyName) {
    const prop = Config.propertyConfigMap[propertyName];
    if (!prop) {
      throw sfdxError.SfdxError.create('@salesforce/core', 'config', 'UnknownConfigKey', [propertyName]);
    }
    return prop;
  }
  /**
   * Encrypts and content properties that have a encryption attribute.
   * @param encrypt `true` to encrypt.
   */
  async cryptProperties(encrypt) {
    const hasEncryptedProperties = this.entries().some(([key]) => {
      return !!index$1.lib.ensure(Config.propertyConfigMap[key]).encrypted;
    });
    if (hasEncryptedProperties) {
      await this.initCrypto();
      const crypto = index$1.lib.ensure(this.crypto);
      this.forEach((key, value) => {
        if (this.getPropertyConfig(key).encrypted && index$1.lib.isString(value)) {
          this.set(key, index$1.lib.ensure(encrypt ? crypto.encrypt(value) : crypto.decrypt(value)));
        }
      });
    }
  }
}
/**
 * Username associated with the default dev hub org.
 */
Config.DEFAULT_DEV_HUB_USERNAME = 'defaultdevhubusername';
/**
 * Username associate with the default org.
 */
Config.DEFAULT_USERNAME = 'defaultusername';
/**
 * The sid for the debugger configuration.
 */
Config.ISV_DEBUGGER_SID = 'isvDebuggerSid';
/**
 * The url for the debugger configuration.
 */
Config.ISV_DEBUGGER_URL = 'isvDebuggerUrl';
/**
 * The api version
 */
Config.API_VERSION = 'apiVersion';
/**
 * Disables telemetry reporting
 */
Config.DISABLE_TELEMETRY = 'disableTelemetry';
/**
 * allows users to override the 10,000 result query limit
 */
Config.MAX_QUERY_LIMIT = 'maxQueryLimit';

exports.Config = Config;
//# sourceMappingURL=config.js.map
