/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import * as _ from 'lodash';
import { ConfigContents } from './config/configStore';
import { ConfigFile } from './config/configFile';
import { SfdxConfigAggregator } from './config/sfdxConfigAggregator';
import { SfdxError } from './sfdxError';
import { SfdxUtil } from './util';

/**
 * The sfdx-project.json config object. This file determines if a folder is a valid sfdx project.
 *
 * *Note:* Any non-standard (not owned by Salesforce) properties stored in sfdx-project.json should
 * be in a top level property that represents your project or plugin.
 *
 * @extends ConfigFile
 *
 * @example
 * const project = await SfdxProjectJson.retrieve<SfdxProjectJson>();
 * const myPluginProperties = project.get('myplugin') || {};
 * myPluginProperties.myprop = 'someValue';
 * project.set('myplugin', myPluginProperties);
 * await project.write();
 */
export class SfdxProjectJson extends ConfigFile {
    public static getFileName() {
        return SfdxUtil.SFDX_PROJECT_JSON;
    }

    public async read(throwOnNotFound: boolean = false): Promise<ConfigContents> {
        const contents = await super.read();

        // Verify that the configObject does not have upper case keys; throw if it does.  Must be heads down camelcase.
        const upperCaseKey = SfdxUtil.findUpperCaseKeys(contents);
        if (upperCaseKey) {
            throw SfdxError.create('sfdx-core', 'core', 'InvalidJsonCasing', [upperCaseKey, this.getPath()]);
        }
        return contents;
    }
}

/**
 * An SFDX project directory. This directory contains a {@link SfdxProjectJson} config file as well as
 * a hidden .sfdx folder that contains all the other local project config files.
 */
export class Project {
    /**
     * Get a Project from a given path or from the working directory.
     * @param {string} path The path of the project.
     * @returns {Promise<Project>} The resolved project.
     */
    public static async resolve(path ?: string): Promise<Project> {
        if (!path) {
            path = await Project.resolveProjectPathFromCurrentWorkingDirectory();
        }
        return new Project(path);
    }

    /**
     * Traverses for the sfdx project path from the current working directory.
     * @throws InvalidProjectWorkspace - If the current folder is not located in a workspace
     * @returns {Promise<string>} -The absolute path to the project
     * @see {@link SfdxUtil.resolveProjectPathFromCurrentWorkingDirectory}
     */
    public static async resolveProjectPathFromCurrentWorkingDirectory(): Promise<string> {
        return await SfdxUtil.resolveProjectPathFromCurrentWorkingDirectory();
    }

    private projectConfig: any;

    // Dynamically referenced in retrieveSfdxProjectJson
    // tslint:disable-next-line:no-unused-variable
    private sfdxProjectJson: SfdxProjectJson;
    // tslint:disable-next-line:no-unused-variable
    private sfdxProjectJsonGlobal: SfdxProjectJson;

    private constructor(private path) {}

    /**
     * Get the path of this project.
     */
    public getPath(): string {
        return this.path;
    }

    /**
     * Get the sfdx-project.json config. The global sfdx-project.json is used for user defaults
     * that are not checked in to the project specific file.
     *
     * *Note:* When reading values from {@link SfdxProjectJson}, it is recommended to use
     * {@link Project.resolveProjectConfig} instead.
     *
     * @param {boolean} isGlobal True to get the global project file, otherwise the local project config.
     */
    public async retrieveSfdxProjectJson(isGlobal: boolean = false): Promise<SfdxProjectJson> {
        const prop = `sfdxProjectJson${isGlobal ? 'Global' : ''}`;
        if (!this[prop]) {
            this[prop] = await SfdxProjectJson.retrieve<SfdxProjectJson>(SfdxProjectJson.getDefaultOptions(isGlobal));
        }
        return this[prop];
    }

    /**
     * The project config is resolved from local and global @link{SfdxProjectJson},
     * @link{SfdxConfigAggregator}, and a set of defaults. It is recommended to use
     * this when reading values from SfdxProjectJson.
     * @returns {object} The resolved project config.
     */
    public async resolveProjectConfig(): Promise<object> {
        if (!this.projectConfig) {
            // Get sfdx-project.json from the ~/.sfdx directory to provide defaults
            const global = await (await this.retrieveSfdxProjectJson(true)).read();
            const local = await (await this.retrieveSfdxProjectJson()).read();

            const defaults = {
                sfdcLoginUrl: 'https://login.salesforce.com'
            };

            this.projectConfig = _.defaults(global, local, defaults);

            // Add fields in sfdx-config.json
            _.assign(this.projectConfig, (await SfdxConfigAggregator.create()).getConfig());

            // LEGACY - Allow override of sfdcLoginUrl via env var FORCE_SFDC_LOGIN_URL
            if (process.env.FORCE_SFDC_LOGIN_URL) {
                this.projectConfig.sfdcLoginUrl = process.env.FORCE_SFDC_LOGIN_URL;
            }
        }

        return this.projectConfig;
    }
}
