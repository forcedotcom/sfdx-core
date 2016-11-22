/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */


// Node
const path = require('path');

// Local
const Force = require(path.join(__dirname, '..', 'force'));

const configValidator = require(path.join(__dirname, '..', 'configValidator'));
const orgConfigAttributes = require(path.join(__dirname, '..', 'orgConfigAttributes'));
const workspace = require(path.join(__dirname, '..', 'workspace'));

const logger = require(path.join(__dirname, 'logApi'));

 class Org {
     constructor() {
         this.logger = logger.child(`${this.constructor.name}.${this.getFileName()}`);
         this.force = new Force(this, this.logger);
     }

     getName() {
         return this.name || 'unknown';
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
                 return cleanConfig;
             });
     }

     /**
      * Returns a promise to save a valid org's auth configuration to disk.
      * @param configObject - The object to save. If the object isn't valid an error will be thrown.
      * { orgId:, redirectUri:, accessToken:, refreshToken:, instanceUrl:, clientId: }
      * @returns {Promise.<Object>} The access tokens will be encrypted. Call get config to get decrypted access tokens.
      */
     saveConfig(configObject) {
         // For security reasons we don't want to arbitrarily write the configObject to disk.
         return configValidator.getCleanObject(configObject, orgConfigAttributes, true)
             .then((dataToSave) => workspace.saveGlobalConfig(this.getFileName(), dataToSave)
             .then(() => {
                 this.logger.info(`Saved org configuration: ${this.getFileName()}`);
                 return dataToSave;
             }));
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
 }

 module.exports = Org;
