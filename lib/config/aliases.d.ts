import { JsonMap, Optional } from '@salesforce/ts-types';
import { ConfigGroup } from './configGroup';
import { ConfigContents, ConfigValue } from './configStore';
/**
 * Different groups of aliases. Currently only support orgs.
 */
export declare enum AliasGroup {
  ORGS = 'orgs'
}
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
export declare class Aliases extends ConfigGroup<ConfigGroup.Options> {
  /**
   * The aliases state file filename.
   */
  static getFileName(): string;
  /**
   * Get Aliases specific options.
   */
  static getDefaultOptions(): ConfigGroup.Options;
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
  static parseAndUpdate(aliasKeyAndValues: string[], group?: AliasGroup): Promise<JsonMap>;
  /**
   * Get an alias from a key and group. Shorthand for `Alias.create({}).get(key)`. Returns the promise resolved when the
   * alias is created.
   * @param key The value of the alias to match.
   * @param group The group the alias belongs to. Defaults to Orgs.
   */
  static fetch(key: string, group?: AliasGroup): Promise<Optional<string>>;
  /**
   * Constructor
   * **Do not directly construct instances of this class -- use {@link Aliases.create} instead.**
   * @param options The options for the class instance
   */
  constructor(options: ConfigGroup.Options);
  protected setMethod(contents: ConfigContents, key: string, value?: ConfigValue): void;
}
