/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */


// Node
const path = require('path');
const util = require('util');

// Thirdparty
const Promise = require('bluebird');
const optional = require('optional-js');

// Local
const lib = path.join(__dirname, '..');
const Force = require(path.join(lib, 'force'));

const configValidator = require(path.join(lib, 'configValidator'));
const workspace = require(path.join(lib, 'workspace'));
const sfdxError = require(path.join(lib, 'sfdxError'));

const logger = require(path.join(lib, 'logger'));

const orgTypes = require(path.join(__dirname, 'orgTypes'));
const OrgPrefRegistry = require(path.join(__dirname, 'orgPrefRegistry'));
const orgConfigAttributes = require(path.join(__dirname, 'orgConfigAttributes'));

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
                const err = sfdxError('QueryError', ['OrganizationSettingsDetail'], 'api');
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

 class Org {
     constructor(name, type) {
         this.name = name;
         this.type = type;
         this.logger = logger.child(`${this.constructor.name}.${this.getFileName()}`);
         this.force = new Force(this, this.logger);
     }

     /**
      * Get the name from the workspace if this.name doesn't exist.
      */
     getName() {
         return optional.ofNullable(this.name).orElse(workspace.getConfig()[`${this.getType()}OrgName`]);
     }

     /**
      * Get the type of this org. Will default to scratch to try and find the org name in
      * workspaceOrg.json.scratchOrgName.
      */
     getType() {
         return this.type || 'scratch';
     }


     /**
      * Sets the name of this org. After setting the name readConfig will result in the org associated
      * with $HOME/.appcloud/[name].json being returned.
      * @param name - the name of the org.
      */
     setName(name) {
         this.name = name;
     }

     getFileName() {
         return `${this.getName()}.json`;
     }

     /**
      * Refresh a users access token.
      * @returns {Promise.<>}
      */
     refreshAuth() {
         return this.force.describeData();
     }

     /**
      * Set the password for the scratch org.
      * @param password - The new password.
      * @returns {Promise.<String>}
      */
     setPassword(password) {
         return this.force.setPassword(password);
     }

     readConfig() {
         return workspace.readGlobalConfig(this.getFileName())
             .then((config) => configValidator.getCleanObject(config, orgConfigAttributes, false))
             .then((cleanConfig) => {
                 this.name = cleanConfig.username;
                 this.config = cleanConfig;
                 return cleanConfig;
             })
             .catch((error) => {
                 let returnError = error;

                 if (error.code === 'ENOENT') {
                     if (util.isNullOrUndefined(this.name)) {
                         returnError = sfdxError('DefaultOrgNotFound', this.getType(), 'org');
                     } else {
                         returnError = sfdxError('OrgNotFound', this.name, 'org');
                     }
                 }

                 throw returnError;
             });
     }

     /**
      * Returns a promise to save a valid org's auth configuration to disk.
      * @param configObject - The object to save. If the object isn't valid an error will be thrown.
      * { orgId:, redirectUri:, accessToken:, refreshToken:, instanceUrl:, clientId: }
      * @param saveAsDefault - Should save the org as a default type in the project
      * @returns {Promise.<Object>} The access tokens will be encrypted. Call get config to get decrypted access tokens.
      */
     saveConfig(configObject, saveAsDefault) {
         if (configObject.username !== this.getName()) {
             throw sfdxError('InvalidUsernameOnOrg', [configObject.username, this.getName()], 'org');
         }

         // For security reasons we don't want to arbitrarily write the configObject to disk.
         return configValidator.getCleanObject(configObject, orgConfigAttributes, true)
             .then((dataToSave) =>
                workspace.saveGlobalConfig(this.getFileName(), dataToSave)
                 .then(() => {
                     this.logger.info(`Saved org configuration: ${this.getFileName()}`);
                     return dataToSave;
                 })
             )
             .then(savedData => {
                 if (saveAsDefault) {
                     workspace.saveWorkspaceOrg(this.getType(), savedData.username);
                     this.logger.info(`Updated workspace org reference for type ${this.getType()}`);
                 }

                 return savedData;
             });
     }

     /**
      * Removes the org auth config file from the global state directory
      */
     deleteConfig() {
         // If the org being deleted is the workspace org then we need to do this so that subsequent calls to the
         // cli won't fail when trying to retrieve scratch org info from the global state directory.
         if (workspace.getConfig().scratchOrgName === this.getName()) {
             this.configApi.removeWorkspaceOrgConfig();
         }
         return workspace.deleteGlobalConfig(this.getFileName());
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
                             const err = sfdxError('ProblemSettingOrgPrefs', [], 'org');
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

 /**
  * Get an instance of an org. If no name is provided, an instance of a scratch
  * org will be created which will try to save and read from workspaceOrg.scratchOrgName
  */
 Org.get = function(name, type) {
     const org = new Org(name, type);
     return org.readConfig().then(() => org);
 };

 module.exports = Org;
