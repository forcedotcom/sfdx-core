/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { asString, Dictionary, JsonMap, Optional } from '@salesforce/ts-types/lib';
import { Messages } from '../messages';
import { Global } from '../global';
import { ConfigGroup } from './configGroup';
import { ConfigContents, ConfigValue } from './configStore';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/core', 'core', ['noAliasesFound', 'invalidFormat']);

const ALIAS_FILE_NAME = 'alias.json';

/**
 * Different groups of aliases. Currently only support orgs.
 */
export enum AliasGroup {
  ORGS = 'orgs',
}

/**
 * Aliases specify alternate names for groups of properties used by the Salesforce CLI, such as orgs.
 * By default, all aliases are stored under 'orgs', but groups allow aliases to be applied for
 * other commands, settings, and parameters.
 *
 * **Note:** All aliases are stored at the global level.
 *
 * ```
 * const aliases = await Aliases.create();
 * aliases.set('myAlias', 'username@company.org');
 * await aliases.write();
 * // Shorthand to get an alias.
 * const username: string = await Aliases.fetch('myAlias');
 * ```
 * https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_usernames_orgs.htm
 */
export class Aliases extends ConfigGroup {
  /**
   * The aliases state file filename.
   */
  public static getFileName(): string {
    return ALIAS_FILE_NAME;
  }

  /**
   * Get Aliases specific options.
   */
  public static getDefaultOptions(): ConfigGroup.Options {
    const opts = ConfigGroup.getOptions(AliasGroup.ORGS, Aliases.getFileName());
    opts.stateFolder = Global.SFDX_STATE_FOLDER;
    return opts;
  }

  /**
   * Updates a group of aliases in a bulk save and returns the new aliases that were saved.
   *
   * ```
   * const aliases = await Aliases.parseAndUpdate(['foo=bar', 'bar=baz'])
   * ```
   *
   * @param aliasKeyAndValues An array of strings in the format `<alias>=<value>`.
   * Each element will be saved in the Aliases state file under the group.
   * @param group The group the alias belongs to. Defaults to ORGS.
   */
  public static async parseAndUpdate(
    aliasKeyAndValues: string[],
    group: AliasGroup = AliasGroup.ORGS
  ): Promise<JsonMap> {
    const newAliases: Dictionary<string> = {};
    if (aliasKeyAndValues.length === 0) {
      throw messages.createError('noAliasesFound');
    }

    for (const arg of aliasKeyAndValues) {
      const split = arg.split('=');

      if (split.length !== 2) {
        throw messages.createError('invalidFormat', [arg]);
      }
      const [name, value] = split;
      newAliases[name] = value || undefined;
    }

    const aliases = await Aliases.create(Aliases.getDefaultOptions());

    return await aliases.updateValues(newAliases, group);
  }

  /**
   * Get an alias from a key and group. Shorthand for `Alias.create().get(key)`. Returns the promise resolved when the
   * alias is created.
   *
   * @param key The value of the alias to match.
   * @param group The group the alias belongs to. Defaults to Orgs.
   */
  public static async fetch(key: string, group = AliasGroup.ORGS): Promise<Optional<string>> {
    const aliases = await Aliases.create(Aliases.getDefaultOptions());
    return asString(aliases.getInGroup(key, group));
  }

  public static get(key: string, group = AliasGroup.ORGS) {
    const aliases = new Aliases(Aliases.getDefaultOptions());
    aliases.readSync();
    return asString(aliases.getInGroup(key, group));
  }

  // Don't use kit's set to prevent nested object save
  protected setMethod(contents: ConfigContents, key: string, value?: ConfigValue): void {
    contents[key] = value;
  }
}
