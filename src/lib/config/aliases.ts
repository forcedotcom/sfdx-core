/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import { ConfigFile, ConfigOptions } from './configFile';
import { ConfigGroup, ConfigGroupOptions } from './configGroup';
import { SfdxError } from '../sfdxError';

const ALIAS_FILE_NAME = 'alias.json';

/**
 * Different groups of aliases. Currently only support orgs.
 * @readonly
 * @enum {string}
 */
export enum AliasGroup {
    'ORGS' = 'orgs'
}

/**
 * Aliases specify alternate names for different groups of properties used by sfdx, such as orgs.
 * By default, all aliases are stored under 'orgs' but groups allow aliases to be applied for
 * other commands, settings, and flags.
 *
 * **Note:** All aliases are stored at the global level.
 *
 * @extends ConfigGroup
 *
 * @example
 * const aliases = await Aliases.retrieve<Aliases>();
 * aliases.set('myAlias', 'username@company.org');
 * await aliases.write();
 *
 * // Shorthand to get an alias.
 * const username: string = Aliases.fetch('myAlias');
 * @see https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_usernames_orgs.htm
 */
export class Aliases extends ConfigGroup {

    /**
     * The aliases state file filename.
     * @override
     * @returns {string}
     */
    public static getFileName(): string {
        return ALIAS_FILE_NAME;
    }

    /**
     * Get Aliases specific options.
     * @returns {ConfigGroupOptions}
     */
    public static getOptions(): ConfigGroupOptions {
        const options: ConfigGroupOptions = this.getDefaultOptions(true, this.getFileName()) as ConfigGroupOptions;
        options.defaultGroup = AliasGroup.ORGS;
        return options;
    }

    /**
     * Overrides {@link ConfigFile.create} to pass in {@link Aliases.getOptions}.
     * @override
     * @param {ConfigOptions} options
     * @see {@link ConfigFile.create}
     * @returns {Promise<T>}
     */
    public static async create<T extends ConfigFile>(options: ConfigOptions): Promise<T> {
        return (await super.create(options || Aliases.getOptions())) as T;
    }

    /**
     * Overrides {@link ConfigFile.retrieve} to pass in {@link Aliases.getOptions}.
     * @param {ConfigOptions} [options] Specify to override builtin options.
     * @see {@link ConfigFile.retrieve}
     * @see {@link ConfigGroupOptions}
     * @returns {Promise<T>}
     * @override
     */
    public static async retrieve<T extends ConfigFile>(options?: ConfigOptions): Promise<T> {
        return (await super.retrieve(options || Aliases.getOptions())) as T;
    }

    /**
     * Updates a group of aliases in a bulk save.
     * @param {array} aliasKeyAndValues An array of strings in the format `<alias>=<value>`.
     * Each element will be saved in the Aliases state file under the group.
     * @param {AliasGroup} [group = AliasGroup.ORGS] The group the alias belongs to. Defaults to ORGS.
     * @returns {Promise<object>} The new aliases that were saved.
     * @example
     * const aliases = Aliases.parseAndUpdate(['foo=bar', 'bar=baz'])
     */
    public static async parseAndUpdate(aliasKeyAndValues: string[], group: AliasGroup = AliasGroup.ORGS): Promise<object> {
        const newAliases = {};
        if (aliasKeyAndValues.length === 0) {
            throw SfdxError.create('@salesforce/core', 'core', 'NoAliasesFound', []);
        }

        for (const arg of aliasKeyAndValues) {
            const split = arg.split('=');

            if (split.length !== 2) {
                throw SfdxError.create('@salesforce/core', 'core', 'InvalidFormat', [arg]);
            }
            const [name, value] = split;
            newAliases[name] = value || undefined;
        }

        const aliases: Aliases = await Aliases.retrieve<Aliases>();

        return await aliases.updateValues(newAliases, group);
    }

    /**
     * Get an alias from a key and group. Shorthand for `Alias.retrieve().get(key)`.
     * @param {string} key The value of the alias to match
     * @param {string} [group=AliasGroup.Orgs] The group the alias belongs to. Defaults to Orgs
     * @returns {Promise<string>} The promise resolved when the alias is retrieved
     */
    public static async fetch(key: string, group = AliasGroup.ORGS): Promise<string> {
        return (await Aliases.retrieve<Aliases>()).getInGroup(key, group) as string;
    }
}
