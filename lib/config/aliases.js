'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('../index-ffe6ca9f.js');
var sfdxError = require('../sfdxError.js');
var config_configGroup = require('./configGroup.js');
require('../_commonjsHelpers-49936489.js');
require('../index-aea73a28.js');
require('../messages.js');
require('fs');
require('os');
require('path');
require('util');
require('./configFile.js');
require('../global.js');
require('../util/fs.js');
require('crypto');
require('constants');
require('stream');
require('assert');
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
const ALIAS_FILE_NAME = 'alias.json';
(function(AliasGroup) {
  AliasGroup['ORGS'] = 'orgs';
})(exports.AliasGroup || (exports.AliasGroup = {}));
/**
 * Aliases specify alternate names for groups of properties used by the Salesforce CLI, such as orgs.
 * By default, all aliases are stored under 'orgs', but groups allow aliases to be applied for
 * other commands, settings, and parameters.
 *
 * **Note:** All aliases are stored at the global level.
 *
 * ```
 * const aliases = await Aliases.create({});
 * aliases.set('myAlias', 'username@company.org');
 * await aliases.write();
 * // Shorthand to get an alias.
 * const username: string = await Aliases.fetch('myAlias');
 * ```
 * https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_usernames_orgs.htm
 */
class Aliases extends config_configGroup.ConfigGroup {
  /**
   * The aliases state file filename.
   */
  static getFileName() {
    return ALIAS_FILE_NAME;
  }
  /**
   * Get Aliases specific options.
   */
  static getDefaultOptions() {
    return config_configGroup.ConfigGroup.getOptions(exports.AliasGroup.ORGS, Aliases.getFileName());
  }
  /**
   * Updates a group of aliases in a bulk save and returns the new aliases that were saved.
   *
   * ```
   * const aliases = await Aliases.parseAndUpdate(['foo=bar', 'bar=baz'])
   * ```
   * @param aliasKeyAndValues An array of strings in the format `<alias>=<value>`.
   * Each element will be saved in the Aliases state file under the group.
   * @param group The group the alias belongs to. Defaults to ORGS.
   */
  static async parseAndUpdate(aliasKeyAndValues, group = exports.AliasGroup.ORGS) {
    const newAliases = {};
    if (aliasKeyAndValues.length === 0) {
      throw sfdxError.SfdxError.create('@salesforce/core', 'core', 'NoAliasesFound', []);
    }
    for (const arg of aliasKeyAndValues) {
      const split = arg.split('=');
      if (split.length !== 2) {
        throw sfdxError.SfdxError.create('@salesforce/core', 'core', 'InvalidFormat', [arg]);
      }
      const [name, value] = split;
      newAliases[name] = value || undefined;
    }
    const aliases = await Aliases.create(Aliases.getDefaultOptions());
    return await aliases.updateValues(newAliases, group);
  }
  /**
   * Get an alias from a key and group. Shorthand for `Alias.create({}).get(key)`. Returns the promise resolved when the
   * alias is created.
   * @param key The value of the alias to match.
   * @param group The group the alias belongs to. Defaults to Orgs.
   */
  static async fetch(key, group = exports.AliasGroup.ORGS) {
    const aliases = await Aliases.create(Aliases.getDefaultOptions());
    return index.lib.asString(aliases.getInGroup(key, group));
  }
  /**
   * Constructor
   * **Do not directly construct instances of this class -- use {@link Aliases.create} instead.**
   * @param options The options for the class instance
   */
  constructor(options) {
    super(options);
  }
  // Don't use kit's set to prevent nested object save
  setMethod(contents, key, value) {
    contents[key] = value;
  }
}

exports.Aliases = Aliases;
//# sourceMappingURL=aliases.js.map
