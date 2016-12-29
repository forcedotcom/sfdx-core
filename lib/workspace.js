/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

// Node
const os = require('os');
const util = require('util');
const path = require('path');
const mkdirp = require('mkdirp');

// Thirdparty
const Promise = require('bluebird');
const optional = require('optional-js');

const fs = Promise.promisifyAll(require('fs'));

// Local
const sfdxError = require(path.join(__dirname, 'sfdxError'));
const logger = require(path.join(__dirname, 'logger'));

const APP_CLOUD_FOLDER = '.appcloud';

const _DEFAULT_PORT = 1717;
const _WORKSPACE_CONFIG_FILENAME = 'workspace-config.json';
const _DEFAULT_MDAPI_POLL_TIMEOUT = 1 * (60 * 1000);
const _DEFAULT_MDAPI_POLL_INTERVAL = 5 * 1000;

const DEFAULTS = {
    DefaultMdapiPollTimeout: _DEFAULT_MDAPI_POLL_TIMEOUT,
    DefaultMdapiPollInterval: _DEFAULT_MDAPI_POLL_INTERVAL,
    SfdcLoginUrl: 'https://login.salesforce.com'
};

/**
 * Get the home directory from os. The home directory can be overridden by XDG_DATA_HOME.
 * This is used to determine where to put the global state directory.
 * @returns {string} the absolute path of the home directory
 */
const getHomeDir = function () {
    return (process.env.XDG_DATA_HOME) ? process.env.XDG_DATA_HOME : os.homedir();
};

/**
 * Get the path of the current workspace by traversing backwards from the current
 * directory until we find the SFDX workspace config file.
 * @returns {string} absolute path of the workspace directory
 */
function getWorkspacePath() {
    let foundProjectDir = null;

    const traverseForFile = function(workingDir, file) {
        try {
            fs.statSync(path.join(workingDir, file));
            foundProjectDir = workingDir;
        }
        catch (err) {
            if (err && err.code === 'ENOENT') {
                const indexOflastSlash = workingDir.lastIndexOf(path.sep);
                if (indexOflastSlash > 0) {
                    traverseForFile(workingDir.substring(0, indexOflastSlash), file);
                } else {
                    throw sfdxError('InvalidProjectWorkspace', [], 'workspace');
                }
            }
        }
    };

    traverseForFile(process.cwd(), _WORKSPACE_CONFIG_FILENAME);
    return foundProjectDir;
}

/**
 * The workspace API object. All these methods are exported to requesting modules.
 * We define the workspace object first so methods can reference other workspace
 * methods.
 */
const workspace = {
    /**
     * Get the name of the workspace config file.
     * @returns {string} the workspace config file name
     */
    getWorkspaceConfigFilename() {
        return _WORKSPACE_CONFIG_FILENAME;
    },

    /**
     * Get the path of this workspace
     * @returns {string} The path of this workspace
     */
    getPath() {
        if (util.isNullOrUndefined(workspace.path)) {
            workspace.path = getWorkspacePath();
            workspace.resolveStateFolder(workspace.path);
        }

        return workspace.path;
    },

    /**
     * Get the workspace config from the workspace-config.json file. First merged
     * the defaults, global workspace config, and the workspace config. Second set
     * the workspace scratch org. Third, apply any overrides from env variables.
     * The only override currently is the login URL through FORCE_SFDC_LOGIN_URL.
     * @param {string} projectDir The project directory. Will default to the
     * workspace path.
     * @returns {Promise} The config once all configs are resolved and merged.
     */
    resolveConfigContent(projectDir) {
        if (util.isNullOrUndefined(projectDir)) {
            projectDir = workspace.getPath();
        }

        const workspaceConfigDotJsonPath = path.join(projectDir, _WORKSPACE_CONFIG_FILENAME);
        let globalConfigObject;

        return workspace.readGlobalConfig(_WORKSPACE_CONFIG_FILENAME)
        .then(configObject => {
            globalConfigObject = configObject;
        })
        .catch(e => {
            if (e.code === 'ENOENT') {
                globalConfigObject = {};
            } else {
                throw e;
            }
        })
        // Add additional fields from the workspace workspace-config.json
        .then(() =>  workspace.pathExists(workspaceConfigDotJsonPath))
        .then(exist => {
            if (!exist) {
                throw sfdxError('MissingAppConfig', [], 'workspace');
            }
            return workspace.readJSON(workspaceConfigDotJsonPath);
        })
        .then(workspaceConfigObject => {
            const mergedConfig = Object.assign({}, DEFAULTS, globalConfigObject, workspaceConfigObject);
            const workspaceOrgConfigPath = workspace.getWorkspaceOrgConfigPath(projectDir);

            return workspace.pathExists(workspaceOrgConfigPath)
            .then(exist => {
                if (exist) {
                    return workspace.readJSON(workspaceOrgConfigPath);
                }
                return Promise.resolve({});
            })
            .then(wsOrgObject => {
                mergedConfig.scratchOrgName = wsOrgObject.scratchOrgName;

                // Allow override of SfdcLoginUtl via env var FORCE_SFDC_LOGIN_URL
                if (process.env.FORCE_SFDC_LOGIN_URL) {
                    mergedConfig.SfdcLoginUrl = process.env.FORCE_SFDC_LOGIN_URL;
                }
                return mergedConfig;
            });
        });
    },

    /**
     * Returns the resolved workspace config from disk, then caches it.
     * @returns {Promise} The merged workspace config object.
     */
    resolveConfig() {
        if (util.isNullOrUndefined(workspace.config)) {
            return workspace.resolveConfigContent().then(config => {
                workspace.config = config;
                return config;
            });
        }
        return Promise.resolve(workspace.config);
    },

    /**
     * Returns the cached workspace config.
     * @throws {Error} If the config is not resolved prior.
     * @returns {object} The merged workspace config object.
     */
    getConfig() {
        if (util.isNullOrUndefined(workspace.config)) {
            throw new Error('Dev error: workspace config not resolved. Must call workspace.resolveConfig before being able to access the config.');
        }

        return workspace.config;
    },


    /**
     * Users may override the oauth port used for the http server.
     * @returns {number} 1717 is the default listen port number
     */
    getOauthLocalPort() {
        const configPort = Number(optional.ofNullable(workspace.getConfig().OauthLocalPort).orElse(_DEFAULT_PORT));

        if (Number.isNaN(configPort) || configPort < 1 || configPort > (Math.pow(2, 16) - 1)) {
            throw sfdxError('InvalidOAuthRedirectUrlPort', configPort, 'workspace');
        }
        return configPort;
    },

    /**
     * @returns {string} The App Cloud standard Connected App Callback URL.
     */
    getOauthCallbackUrl() {
        return `http://localhost:${workspace.getOauthLocalPort()}/OauthRedirect`;
    },

    /**
     * Save a new org as the workspace org in the workspace org config
     * file within the local state folder. This will replace the whole file with
     * the new scratch org.
     * @param {string} orgName the name of the new scratch org
     * @returns {Promise} resolved when the file is saved
     */
    saveWorkspaceOrg(type, orgName) {
        if (util.isNullOrUndefined(orgName)) {
            throw sfdxError('MissingRequiredParameter', orgName);
        }

        // First load the config so we don't replace any values
        return workspace.resolveConfig().then(config => {
            config[`${type}OrgName`] = orgName;

            const filePath = workspace.getWorkspaceOrgConfigPath();
            // file is customer-editable, so write w/ spaces for readability
            const fileData = JSON.stringify({ config }, null, 4);
            const fileOpts = { flag: 'w', encoding: 'utf-8' };

            return workspace.ensureDirectoryExists(workspace.getStateFolderPath())
            .then(() => fs.writeFileAsync(filePath, fileData, fileOpts));
        });
    },

    /**
     * Remove the workspace org config filePath.
     * @returns {Promise} resolved when the workspace org file is deleted.
     */
    removeWorkspaceOrgConfig() {
        delete workspace.appConfig.scratchOrgName;
        return workspace.deleteIfExists(workspace.getWorkspaceOrgConfigPath());
    },

    /**
     * Set the EnableTokenEncryption in the global config.
     * @param {boolean} value the value to set encryption to.
     * @return {Promise} resolved with the global file is saved.
     */
    saveEnableEncryption(value) {
        return workspace.readGlobalConfig(_WORKSPACE_CONFIG_FILENAME)
            .then((wsConfig) => {
                wsConfig.EnableTokenEncryption = value;
                return workspace.saveGlobalConfig(_WORKSPACE_CONFIG_FILENAME, wsConfig);
            });
    },

    // ******* File system methods *******

    /**
     * Read a file and convert it to JSON.
     *
     * @param {string} jsonPath The path of the file.
     * @return {Promise} promise The contents of the file as a JSON object.
     */
    readJSON(jsonPath) {
        let fileContents;
        return fs.readFileAsync(jsonPath, 'utf8')
        .then(data => {
            if (!data.length) {
                throw sfdxError('JsonParseError', [jsonPath, 1, 'FILE HAS NO CONTENT']);
            }
            fileContents = data;
            return data;
        })
        .then(JSON.parse)
        .catch(err => {
            if (err.name === 'SyntaxError') {
                const BUFFER = 20;

                // Get the position of the error from the error message.  This is the error index
                // within the file contents as 1 long string.
                const errPosition = parseInt(err.message.match(/position (\d+)/)[1]);

                // Get a buffered error portion to display, highlighting the error in red
                const start = Math.max(0, (errPosition - BUFFER));
                const end = Math.min(fileContents.length, (errPosition + BUFFER));

                const errorPortion = fileContents.substring(start, errPosition) +
                    logger.color.bgRed(fileContents.substring(errPosition, errPosition + 1)) +
                    fileContents.substring(errPosition + 2, end);

                // only need to count new lines before the error position
                const lineNumber = fileContents.substring(0, errPosition).split('\n').length;

                throw sfdxError('JsonParseError', [jsonPath, lineNumber, errorPortion]);
            } else {
                throw err;
            }
        });
    },

    /**
     * Simple helper method to determine if a fs path exists.
     * @param localPath The path to check. Either a file or directory.
     * @returns {Promise} true if the path exists false otherwise.
     */
    pathExists(localPath) {
        return fs.statAsync(localPath).catch(err => {
            // Rethrow the error if it's something other than directory does not exist
            if (err.code !== 'ENOENT') {
                throw err;
            }
            return false;
        });
    },

    /**
     * Ensure that a directory exists, creating as necessary
     * @param {string} dirPath The path to the directory.
     * @returns {Promise} Resolved when the the directory is checked or created.
     */
    ensureDirectoryExists(dirPath) {
        return workspace.pathExists(dirPath).then(exist => {
            if (!exist) {
                return mkdirp(dirPath);
            }
            return Promise.resolve();
        });
    },

    /**
     * If a file exists, delete it.
     * @param {string} filePath The path of the file to delete.
     * @returns {Promise} Resolved when the file is deleted.
     */
    deleteIfExists(filePath) {
        return workspace.pathExists(filePath).then(exist => {
            if (exist) {
                return fs.unlinkAync(filePath);
            }
            return Promise.resolve();
        });
    },

    // ******* WORKSPACE STATE METHODS *******

    /**
     * Get the name of the directory containing workspace state
     * @returns {string}
     */
    getStateFolderName() {
        return APP_CLOUD_FOLDER;
    },

    /**
     * Get the path of the directory containing workspace state
     * @returns {string}
     */
    getStateFolderPath(wsPath) {
        if (!wsPath) {
            wsPath = workspace.getPath();
        }
        return path.join(wsPath, workspace.getStateFolderName());
    },

    /**
     * Get the path of the directory containing workspace state
     * @returns {string}
     */
    getStateFilePath(jsonConfigFileName) {
        if (util.isNullOrUndefined(jsonConfigFileName)) {
            throw sfdxError('MissingRequiredParameter', jsonConfigFileName);
        }
        return path.join(workspace.getPath(), workspace.getStateFolderName(), jsonConfigFileName);
    },

    /**
     * Get the full path to the file storing the workspace org config information
     * @param wsPath - The root path of the workspace
     * @returns {*}
     */
    getWorkspaceOrgConfigPath(wsPath) {
        return path.join(workspace.getStateFolderPath(wsPath), 'workspaceorg.json');
    },

    // ******* GLOBAL STATE METHODS *******

    /**
     * Get the path of the global state folder. This is where all org auth files,
     * including the hub org, and other global state live.
     @returns {string} the global state folder path
     */
    getGlobalStateFolderPath() {
        return path.join(getHomeDir(), APP_CLOUD_FOLDER);
    },

    /**
     * Get the file path of a global config file.
     * @returns {string} the global config file path
     */
    getGlobalStateFilePath(jsonConfigFileName) {
        if (util.isNullOrUndefined(jsonConfigFileName)) {
            throw sfdxError('MissingRequiredParameter', jsonConfigFileName);
        }

        return path.join(workspace.getGlobalStateFolderPath(), jsonConfigFileName);
    },

    /**
     * Read the JSON config file from the global state folder.
     * @param {string} jsonConfigFileName The name of the config file.
     * @returns {Promise} The JSON object of the config file.
     */
    readGlobalConfig(jsonConfigFileName) {
        const configFilePath = workspace.getGlobalStateFilePath(jsonConfigFileName);
        return this.readJSON(configFilePath);
    },

    /**
     * Save a config file to the global state folder.
     * @param {string} jsonConfigFileName The name for the config file.
     * @param {object} jsonConfigObject The json object to save.
     * @returns {Promise} Resolved when the file is saved.
     */
    saveGlobalConfig(jsonConfigFileName, jsonConfigObject) {
        if (util.isNullOrUndefined(jsonConfigObject)) {
            throw sfdxError('MissingRequiredParameter', 'jsonConfigObject');
        }

        // Missing param is checked in getGlobalStateFilePath
        const configFilePath = workspace.getGlobalStateFilePath(jsonConfigFileName);
        const configData = JSON.stringify(jsonConfigObject, undefined, 4);
        const configOpts = { encoding: 'utf8', flag: 'w+' };

        return workspace.resolveStateFolder(getHomeDir())
            .then(() => fs.writeFileAsync(configFilePath, configData, configOpts));
    },

    /**
     * Delete a config file in the global state folder.
     * @param {string} jsonConfigFileName The name for the config file.
     * @returns {Promise} Resolved when the file is deleted.
     */
    deleteGlobalConfig(jsonConfigFileName) {
        const configFilePath = workspace.getGlobalStateFilePath(jsonConfigFileName);
        return workspace.deleteIfExists(configFilePath);
    },

    /**
     * Check if the state folder exists. If it doesn't create it.
     * @returns {Promise} Resolved when the folder is checked or created.
     */
    resolveStateFolder(projectDir) {
        const appCloudPath = path.join(projectDir, APP_CLOUD_FOLDER);
        return workspace.ensureDirectoryExists(appCloudPath);
    },

    /**
     * Validate that user name is valid by checking we have an auth record.
     * @param {string} username The username for the target org.
     * @returns {Promise} Resolved with true if the username is valid, false otherwise
     */
    validateUsername(username) {
       if (util.isNullOrUndefined(username)) {
           return Promise.resolve(false);
       }
       const filepath = path.join(workspace.getGlobalStateFolderPath(), `${username}.json`);
       return workspace.pathExists(filepath);
   },

    /**
     * Clears the workspace cache which requires a read back out to the workspace
     * files. Primarily used by tests but can also be used if there are any major
     * edits to the config files in the same node process.
     */
    clearCache() {
        workspace.path = undefined;
        workspace.config = undefined;
    }
};

module.exports = workspace;
