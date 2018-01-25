/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

import * as path from 'path';
import * as _ from 'lodash';

import { SfdxError } from './sfdxError';


const almError = require(path.join(__dirname, 'almError'));
const srcDevUtil = require(path.join(__dirname, 'srcDevUtil'));

const _set = (aliases, group, alias, property) => {
    if (_.isNil(aliases[group])) {
        aliases[group] = {};
    }

    if (_.isUndefined(property)) {
        delete aliases[group][alias];
    } else {
        const value = _.entries(aliases[group]).find((val) => val[1] === property);

        if (value) {
            delete aliases[group][value[0]];
        }

        aliases[group][alias] = property;
    }
    return aliases;
};

/**
 * Manages access to a key value store in the global .sfdx folder under <fileStoreName>.
 *
 * All key value pairs are stored under a group.
 *
 */
class KeyValueStore {

    private fileStoreName;
    private groups;

    constructor(fileName: string) {
        this.fileStoreName = fileName;
    }

    /**
     * Set a group of aliases in a bulk save.
     * @param {array} keyAndValues An object representing the aliases to set.
     * @param {string} group The group the alias belongs to.
     * @returns {Promise<object>} The new aliases that were saved.
     */
    setValues(newAliases: any, group: string='default'): Promise<any> {
        return srcDevUtil.getGlobalConfig(this.fileStoreName, {})
            .then(aliases => {
                _.forEach(newAliases, (val, key) => _set(aliases, group, key, val));
                return aliases;
            })
            .then(aliases => srcDevUtil.saveGlobalConfig(this.fileStoreName, aliases))
            .then(() => newAliases);
    }

    /**
     * Delete an alias from a group
     * @param {string} alias The name of the alias to delete
     * @param {string} group The group the alias belongs to. Defaults to Orgs
     * @returns {Promise} The promise resolved when the alias is deleted
     */
    delete(alias: string, group: string='default'): Promise<any> {
        return this.set(alias, undefined, group);
    }

    /**
     * Set an alias on a group
     * @param {string} alias The name of the alias to set
     * @param {string} property The value of the alias
     * @param {string} group The group the alias belongs to. Defaults to Orgs
     * @returns {Promise} The promise resolved when the alias is set
     */
    set(alias:string , property: string | number, group: string='default'): Promise<any> {
        return srcDevUtil.getGlobalConfig(this.fileStoreName, {})
            .then(aliases => _set(aliases, group, alias, property))
            .then(aliases => srcDevUtil.saveGlobalConfig(this.fileStoreName, aliases));
    }

    /**
     * Unset one or more aliases on a group
     * @param {string[]} aliases The names of the aliases to unset
     * @param {string} group The group the alias belongs to. Defaults to Orgs
     * @returns {Promise} The promise resolved when the aliases are unset
     */
    unset(aliasesToUnset: Array<string>, group: string='default'): Promise<any> {
        return srcDevUtil.getGlobalConfig(this.fileStoreName, {})
            .then(aliases => {
                aliases[group] = _.omit(aliases[group], aliasesToUnset);
                return aliases;
            })
            .then(aliases => srcDevUtil.saveGlobalConfig(this.fileStoreName, aliases));
    }

    /**
     * Get an alias from a group
     * @param {string} alias The name of the alias to get
     * @param {string} group The group the alias belongs to. Defaults to Orgs
     * @returns {Promise} The promise resolved when the alias is retrieved
     */
    get(alias: string, group: string='default') {
        return this.list(group)
            .then(aliases => aliases[alias]);
    }

    /**
     * Get all alias from a group
     * @param {string} group The group of aliases to retrieve. Defaults to Orgs
     * @returns {Promise} The promise resolved when the aliases are retrieved
     */
    list(group: string='default'): Promise<any> {
        return srcDevUtil.getGlobalConfig(this.fileStoreName, {})
            .then(aliases => (aliases[group] || {}));
    }

    /**
     * Get an alias from a group by value
     * @param {string} value The value of the alias to match
     * @param {string} group The group the alias belongs to. Defaults to Orgs
     * @returns {Promise} The promise resolved when the alias is retrieved
     */
    byValue(value: string | number, group: string='default'): Promise<any> {
        return this.list(group)
            .then(aliases => Object.keys(aliases).find(key => aliases[key] === value));
    }
}

module.exports = KeyValueStore;