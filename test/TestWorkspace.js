/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const sinon = require('sinon');
const Optional = require('optional-js');
// const { execSync } = require('child_process');

const _ = require('lodash');

// For stubbing
const util = require('util');
const os = require('os');

const projectRoot = path.join(__dirname, '..');
const Org = require(path.join(projectRoot, 'lib', 'orgs', 'org'));
const workspace = require(path.join(projectRoot, 'lib', 'workspace'));
const OrgTypes = require(path.join(projectRoot, 'lib', 'orgs', 'orgTypes'));
const logger = require(path.join(projectRoot, 'lib', 'logger'));

const TMP_TEST_HOME_DIR = path.join(__dirname, 'temp');
// const pathToAppcloud = path.join(__dirname, '..');

/**
 * Recursively act on all files or directories in a directory
 */
const actOn = function(dir, perform, onType) {
    // Act on files by default
    onType = onType || 'file';

    fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat) {
            if (stat.isDirectory()) {
                actOn(filePath, perform, onType);
                if (onType === 'dir') {
                    perform(filePath);
                }
            } else if (stat.isFile() && onType === 'file') {
                perform(filePath);
            }
        }
    });
};

/**
 * Create a test/temp directory to act as a home folder with a workspace inside.
 * The current working directory (process.cwd) will return this test workspace
 * path.
 *
 * This can eventually be modified to allow test for multiple workspace but for
 * now it will only allow one test workspace at a time.
 *
 * When using this class in tests, it should be constructed in the test's setup
 * function, and needs to setup() before the tests runs to ensure all
 * files and folders are created and the workspace is resolved. The test's teardown
 * function should call the clean method to remove all created files and folders,
 * and reset the mocks.
 *
 * setup() {
 *     this.testWorkspace = new TestWorkspace();
 *     return this.testWorkspace.setup();
 * }
 *
 * teardown() {
 *     return this.testWorkspace.clean();
 * }
 *
 * @param options - Either a simple name for the workspace or an object of options
 * Well known options:
 * home - optional directory name to be used as HOME directory
 * name - name for the workspace folder
 * config - Object of attributes found in config.json
 * namespace - namespace of the Release Org
 */
class TestWorkspace {
    constructor(options) {
        this.opts = Optional.ofNullable(options).orElseGet(() => {});
        this.opts = (typeof this.opts === 'object') ? this.opts : { name:this.opts };
        this.homeDir = Optional.ofNullable(this.opts.home).orElse(TMP_TEST_HOME_DIR);
        this.name = Optional.ofNullable(this.opts.name).orElse(`testWorkspace${Date.now()}`);
        this.path = path.join(this.homeDir, this.name);
        this.namespace = _.get(this, 'opts.config.Namespace') || _.get(this, 'opts.Namespace');
        this.defaultArtifact = `artifact${Date.now()}`;
        this.isMdapiSource = this.opts.isMdapiSource || false;
        this.disableEncryption = Optional.ofNullable(process.env.ACDX_DISABLE_ENCRYPTION);

        if (fs.existsSync(this.homeDir)) {
            throw new Error(`The temporary test directory still exists. A previous test did not clean it up. (${this.homeDir})`);
        }

        sinon.stub(os, 'homedir').returns(this.homeDir);
        // mkdir on artifact dir
        fs.ensureDirSync(path.join(this.path, this.defaultArtifact));

        sinon.stub(process, 'cwd').returns(this.path);

        // Reset the workspace
        workspace.clearCache();
    }

    setup(config) {
        // Workspace's require a config.json, or we get the "This directory
        // is not part of a valid project workspace." error.
        this.config = {
            Namespace: this.namespace,
            SfdcLoginUrl: 'http://login.salesforce.com',
            ApiVersion: '38.0',
            DefaultArtifact: this.defaultArtifact,
            SoftExit: true
        };
        if (this.disableEncryption.isPresent()) {
            this.config.EnableTokenEncryption = false;
        }
        if (Object.prototype.hasOwnProperty.call(this.opts, 'config')) {
            Object.assign(this.config, this.opts.config);
        }
        if (config) {
            Object.assign(this.config, config);
        }
        fs.writeFileSync(path.join(this.path, workspace.getWorkspaceConfigFilename()), JSON.stringify(this.config));

        // Write the new log file
        logger.reset();

        return workspace.resolveConfig();
    }

    getNamespace() {
        return this.namespace;
    }

    getFullName(name, separator) {
        return this.namespace ? this.namespace + separator + name : name;
    }

    getWorkspacePath() {
        return this.path;
    }

    createWorkspaceGlobalConfig(config) {
        config = config || {
                'Email': 'developer@company.com',
                'Country': 'US',
                'LastName': 'dev'
            };
        return workspace.saveGlobalConfig(workspace.getWorkspaceConfigFilename(), config);
    }

    configureHubOrg(config, hubOrg) {
        const hubOrgConfig = hubOrg || {
                'orgId':'234567',
                'instanceUrl':'http://www.example.com',
                'username':'foo@example.com',
                'accessToken':'123456',
                'refreshToken':'345678',
                'clientId':'123456,',
                'clientSecret':'789101',
                'type': OrgTypes.HUB
            };
        this.hubOrg = new Org('hubOrg');
        return this.hubOrgApi.saveConfig(hubOrgConfig);
    }

    configureScratchOrg(config, orgUsername, orgType) {
        const username = orgUsername || 'test@test.com';
        // Save a workspace scratch org config
        const scratchOrg = Org.get(username, 'scratch');

        const orgConfig = {
            accessToken: '123456',
            refreshToken: '345678',
            instanceUrl: 'http://www.example.com',
            username,
            orgId: '234567',
            redirectUri: 'http://www.example.com',
            clientId: '456789',
            type: orgType || OrgTypes.WORKSPACE
        };
        return scratchOrg.saveConfig(orgConfig, true);
    }

    clean() {
        if (util.isFunction(os.homedir.restore)) {
            os.homedir.restore();
        }
        if (util.isFunction(process.cwd.restore)) {
            process.cwd.restore();
        }
        fs.removeSync(this.homeDir);
        workspace.clearCache();
    }
}

module.exports = TestWorkspace;
