/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import { KeyValueStore } from './fileKeyValueStore';
import { SfdxError } from './sfdxError';

const ALIAS_FILE_NAME = 'alias.json';
const aliasFileStore = new KeyValueStore(ALIAS_FILE_NAME);

/**
 * Manage aliases in the global .sfdx folder under alias.json. Aliases allow users
 * to specify alternate names for different properties used by the cli, such as orgs.
 *
 * All aliases are stored under a group. By default, all aliases are stored for
 * orgs but groups allow aliases to be applied for other commands, settings, and flags.
 *
 */
export class Alias {

    // Different groups of aliases. Only support orgs for now.
    public static GROUPS = { ORGS: 'orgs' };

    /**
     * Updates a group of aliases in a bulk save.
     * @param {array} aliasKeyAndValues An array of strings in the format <alias>=<value>
     * @param {string} group The group the alias belongs to. Defaults to ORGS.
     * @returns {Promise<object>} The new aliases that were saved.
     */
    public static async parseAndUpdate(aliasKeyAndValues, group = Alias.GROUPS.ORGS): Promise<object> {
        const newAliases = {};
        if (aliasKeyAndValues.length === 0) {
            throw SfdxError.create('sfdx-core', 'core', 'NoAliasesFound');
        }

        for (const arg of aliasKeyAndValues) {
            const split = arg.split('=');

            if (split.length !== 2) {
                throw SfdxError.create('sfdx-core', 'core', 'InvalidFormat', [arg]);
            }
            const [name, value] = split;
            newAliases[name] = value || undefined;
        }

        return await aliasFileStore.updateValues(newAliases, group);
    }

    /**
     * Removes an alias from a group
     * @param {string} alias The name of the alias to delete
     * @param {string} group The group the alias belongs to. Defaults to Orgs
     * @returns {Promise} The promise resolved when the alias is delete
     */
    public static async remove(alias, group = Alias.GROUPS.ORGS) {
        return await aliasFileStore.remove(alias, group);
    }

    /**
     * Update an alias on a group
     * @param {string} alias The name of the alias to set
     * @param {string} property The value of the alias
     * @param {string} group The group the alias belongs to. Defaults to Orgs
     * @returns {Promise} The promise resolved when the alias is set
     */
    public static async update(alias, property, group = Alias.GROUPS.ORGS) {
        return await aliasFileStore.update(alias, property, group);
    }

    /**
     * Unset one or more aliases on a group
     * @param {string[]} aliases The names of the aliases to unset
     * @param {string} group The group the alias belongs to. Defaults to Orgs
     * @returns {Promise} The promise resolved when the aliases are unset
     */
    public static async unset(aliasesToUnset, group = Alias.GROUPS.ORGS) {
        return await aliasFileStore.unset(aliasesToUnset, group);
    }

    /**
     * Get an alias from a group
     * @param {string} alias The name of the alias to get
     * @param {string} group The group the alias belongs to. Defaults to Orgs
     * @returns {Promise} The promise resolved when the alias is retrieved
     */
    public static async fetch(alias, group = Alias.GROUPS.ORGS) {
        return await aliasFileStore.fetch(alias, group);
    }

    /**
     * Get all alias from a group
     * @param {string} group The group of aliases to retrieve. Defaults to Orgs
     * @returns {Promise} The promise resolved when the aliases are retrieved
     */
    public static async list(group = Alias.GROUPS.ORGS) {
        return await aliasFileStore.list(group);
    }

    /**
     * Get an alias from a group by value
     * @param {string} value The value of the alias to match
     * @param {string} group The group the alias belongs to. Defaults to Orgs
     * @returns {Promise} The promise resolved when the alias is retrieved
     */
    public static async byValue(value, group = Alias.GROUPS.ORGS) {
        return await aliasFileStore.byValue(value, group);
    }

}
