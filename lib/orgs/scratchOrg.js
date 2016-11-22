/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

// Node
const util = require('util');
const path = require('path');

// Thirdparty
const Promise = require('bluebird');
const optional = require('optional-js');

// Local
const lib = path.join(__dirname, '..');
const workspace = require(path.join(lib, 'workspace'));
const almError = require(path.join(lib, 'almError'));
const messages = require(path.join(lib,  'messages'));

const Org = require(path.join(__dirname, 'org'));
const OrgPrefRegistry = require(path.join(__dirname, 'orgPrefRegistry'));
const orgTypes = require(path.join(__dirname, 'orgTypes'));

almError.keyToNameMap.workspaceScratchOrgNotFound = 'NoScratchOrgFound';
almError.keyToNameMap.namedScratchOrgNotFound = 'NoScratchOrgFound';

/**
 * Builds the query string to get DurableIds for org preferences in the OrganizationSettingsDetail metadata object
 * @param prefs The array of prefs and their values.
 * @returns {string} The query string
 * @private
 */
const _buildOrganizationSettingsDetailQuery = function(prefs) {
    let prefNames = '';
    for (let i=0; i<prefs.length; i++) {
        if (i > 0) {
            prefNames += ', ';
        }
        const pref = prefs[i];
        const settingName = Object.keys(pref)[0];
        prefNames += `'${settingName}'`;
    }
    return `SELECT DurableId, SettingName FROM ${OrgPrefRegistry.ORGANIZATION_SETTINGS_DETAIL_API} WHERE SettingName IN (${prefNames})`;
};

/**
 * Builds the array of org pref DurableIds and the SettingValues to which the prefs should be set
 * @param orgApi The current instance of the scratch org api
 * @param prefs The array of prefs and their values; ex. [{"ChatterEnabled":true}, {"S1DesktopEnabled":true}]
 * @returns the array of DurableIds and SettingValues; ex. [{"DurableId":"ABCDEFG", "SettingValue":true}, {"Durableid":"HIJKLMNO", "SettingValue":true}]
 * @private
 */
const _buildOrganizationSettingsDetailToolingCreateSobject = function(orgApi, prefs) {
    const query = _buildOrganizationSettingsDetailQuery(prefs);

    return orgApi.force.toolingQuery(orgApi, query)
        .then((result) => {
            if (!result.records || !result.records[0]) {
                const err = new Error(messages(orgApi.configApi.getLocale()).getMessage('ProblemQueryingOrganizationSettingsDetail'));
                err.name = 'ProblemQueryingOrganizationSettingsDetail';
                orgApi.logger.error(err);
                return Promise.reject(err);
            }
            const queryResults = result.records;
            const orgPrefs = [];
            for (let i = 0; i < queryResults.length; i++) {
                const prefName = queryResults[i].SettingName;
                let prefValue;
                for (let j = 0; j < prefs.length; j++) {
                    if (Object.keys(prefs[j])[0] === prefName) {
                        prefValue = prefs[j][prefName];
                        break;
                    }
                }
                const pref = {};
                pref.DurableId = queryResults[i].DurableId;
                pref.SettingValue = prefValue;
                orgPrefs.push(pref);
            }
            return orgPrefs;
        }).catch((err) => Promise.reject(err));
};

/**
 * Constructor for the ScratchOrg api. This api knows what the configuration of the scratch org should be. It also knows
 * how to store and retrieve the configuration in a secure manner.
 * @param force - The force api.
 * @constructor
 */
class ScratchOrg extends Org {
    /**
     * Override getName to get the name from the workspace if this.name doesn't exist.
     */
    getName() {
        return optional.ofNullable(this.name).orElse(workspace.getConfig().scratchOrgName);
    }

    /**
     * Sets the name of this scratch org. After setting the name any call to getConfig will result in the org associated
     * with $HOME/.appcloud/[name].json being returned.
     * @param name - the name of the org.
     */
    setName(name) {
        this.name = name;
    }

    /**
     * Override to return custom error messages
     * @returns {Promise}
     */
    readConfig() {
        return super()
            .catch((error) => {
                let returnError = error;

                if (error.code === 'ENOENT') {
                    if (util.isNullOrUndefined(this.name)) {
                        returnError = almError('workspaceScratchOrgNotFound');
                    } else {
                        returnError = almError('namedScratchOrgNotFound', this.name);
                    }
                }

                throw returnError;
            });
    }

    /**
     * Override save config to also set the workspace org to the saved scratch org
     */
    saveConfig(configObject) {
        if (configObject.username !== this.getName()) {
            throw almError('InvalidUsernameOnOrg');
        }

        return super()
            .then(savedData => {
                if (savedData.type === orgTypes.WORKSPACE) {
                    workspace.saveWorkspaceOrg(savedData.username);
                    this.logger.info('Updated workspace org reference');
                }

                return savedData;
            });
    }

    // Sould these in the org base class? i.e. someone creates a "Sandbox" or "Developer" org and they want to set references on those?
    /**
     * Sets the org preferences by calling the Tooling Api
     * @param prefsMap A map of sobjects to an array of their respective org preferences
     * { "OrderSettings" : [{"IsOrdersEnabled":true}], "OrganizationSettingsDetail" : [{"ChatterEnabled":true}] }
     * @returns {*|Promise.<{}>}
     */
    setPreferences(prefsMap) {
        if (!util.isNullOrUndefined(prefsMap)) {
            return Promise.each(prefsMap.entries(), (pref) => {
                const apiName = pref[0];
                const apiPrefs = pref[1];
                let retVal;
                if (apiName === OrgPrefRegistry.ORGANIZATION_SETTINGS_DETAIL_API) {
                    retVal = _buildOrganizationSettingsDetailToolingCreateSobject(this, apiPrefs);
                } else {
                    retVal = Promise.resolve(apiPrefs);
                }
                return retVal.then((toolingCreateSobjectArr) => {
                    /*
                     return Promise.each(toolingCreateSobjectArr).map((toolingCreateSobject) => {
                     return this.force.toolingCreate(this, apiName, toolingCreateSobject);
                     });
                     */

                    const results = [];
                    return Promise.each(toolingCreateSobjectArr, (toolingCreateSobject) => {
                        const ret = this.force.toolingCreate(this, apiName, toolingCreateSobject);
                        results.push(ret);
                        return ret;
                    }).thenReturn(results).all();
                }).then(results => {
                    for (let i = 0; i < results.length; i++) {
                        if (!results[i].success) {
                            const err = new Error(messages(this.config.getLocale()).getMessage('ProblemSettingOrgPrefs'));
                            err.name = 'ProblemSettingOrgPrefs';
                            this.logger.error(err);
                            Promise.reject(err);
                        }
                    }
                    return results;
                }).catch((err) => Promise.reject(err));
            });
        }
        else {
            return Promise.resolve();
        }
    }
}

module.exports = ScratchOrg;
