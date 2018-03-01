/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import * as _ from 'lodash';
import { join as pathJoin, sep as pathSep } from 'path';
import { ConfigContents } from './config/configStore';
import { ConfigFile } from './config/configFile';
import { SfdxConfigAggregator } from './config/sfdxConfigAggregator';
import { SfdxError } from './sfdxError';
import { SfdxUtil } from './util';

/**
 * The sfdx-project.json config object. This file determines if a folder is a valid sfdx project.
 */
export class SfdxProjectJson extends ConfigFile {
    public static getFileName() {
        return 'sfdx-project.json';
    }

    public async read(throwOnNotFound: boolean = false): Promise<ConfigContents> {
        const contents = await this.read();

        // Verify that the configObject does not have upper case keys; throw if it does.  Must be heads down camelcase.
        const upperCaseKey = SfdxUtil.findUpperCaseKeys(contents);
        if (upperCaseKey) {
            throw SfdxError.create('sfdx-core', 'core', 'InvalidJsonCasing', [upperCaseKey, this.getPath()]);
        }
        return contents;
    }
}

/**
 * An SFDX project directory. This directory contains an sfdx-project.json config file as well as
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
     * Computes the path of the project.
     * @throws InvalidProjectWorkspace - If the current folder is not located in a workspace
     * @returns {Promise<string>} -The absolute path to the project
     */
    public static async resolveProjectPathFromCurrentWorkingDirectory(): Promise<string> {
        let foundProjectDir: string = null;

        const traverseForFile = async (workingDir: string, file: string) => {
            try {
                await SfdxUtil.stat(pathJoin(workingDir, file));
                foundProjectDir = workingDir;
            } catch (err) {
                if (err && err.code === 'ENOENT') {
                    const indexOfLastSlash: number = workingDir.lastIndexOf(pathSep);
                    if (indexOfLastSlash > 0) {
                        await traverseForFile(workingDir.substring(0, indexOfLastSlash), file);
                    } else {
                        throw SfdxError.create('sfdx-core', 'config', 'InvalidProjectWorkspace');
                    }
                }
            }
        };

        await traverseForFile(process.cwd(), SfdxProjectJson.getFileName());

        return foundProjectDir;
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
     * @param {boolean} isGlobal True to get the global project file, otherwise the local project config.
     */
    public async retrieveSfdxProjectJson(isGlobal: boolean = false): Promise<SfdxProjectJson> {
        const prop = `sfdxProjectJson${isGlobal ? 'Global' : ''}`;
        if (!this[prop]) {
            this[prop] = await SfdxProjectJson.create(SfdxProjectJson.getDefaultOptions(isGlobal));
        }
        return this[prop];
    }

    /**
     * The project config is resolved from sfdx-project.json, @link{SfdxConfigAggregator}, and a
     * set of defaults.
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
