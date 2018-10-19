/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { defaults } from '@salesforce/kit';
import { ConfigAggregator } from './config/configAggregator';
import { ConfigFile, ConfigOptions } from './config/configFile';
import { ConfigContents } from './config/configStore';
import { SfdxError } from './sfdxError';
import { resolveProjectPath, SFDX_PROJECT_JSON } from './util/internal';
import { findUpperCaseKeys } from './util/sfdc';

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
 *
 * @see https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_create_new.htm
 */
export class SfdxProjectJson extends ConfigFile {

    public static getFileName() {
        return SFDX_PROJECT_JSON;
    }

    public static getDefaultOptions(isGlobal: boolean = false): ConfigOptions {
        const options = super.getDefaultOptions(isGlobal);
        options.isState = false;
        return options;
    }

    public async read(): Promise<ConfigContents> {
        const contents = await super.read();

        // Verify that the configObject does not have upper case keys; throw if it does.  Must be heads down camel case.
        const upperCaseKey = findUpperCaseKeys(this.toObject());
        if (upperCaseKey) {
            throw SfdxError.create('@salesforce/core', 'core', 'InvalidJsonCasing', [upperCaseKey, this.getPath()]);
        }
        return contents;
    }
}

/**
 * Represents an SFDX project directory. This directory contains a {@link SfdxProjectJson} config file as well as
 * a hidden .sfdx folder that contains all the other local project config files.
 *
 * @example
 * const project = await Project.resolve();
 * const projectJson = await project.resolveProjectConfig();
 * console.log(projectJson.sfdcLoginUrl);
 */
export class SfdxProject {
    /**
     * Get a Project from a given path or from the working directory.
     * @param {string} path The path of the project.
     * @throws InvalidProjectWorkspace If the current folder is not located in a workspace.
     * @returns {Promise<SfdxProject>} The resolved project.
     */
    public static async resolve(path?: string): Promise<SfdxProject> {
        return new SfdxProject(await this.resolveProjectPath(path));
    }

    /**
     * Performs an upward directory search for an sfdx project file.
     *
     * @param {string} [dir=process.cwd()] The directory path to start traversing from.
     * @returns {Promise<string>} The absolute path to the project.
     * @throws {SfdxError} **`{name: 'InvalidProjectWorkspace'}`** If the current folder is not located in a workspace.
     * @see fs.traverseForFile
     * @see {@link https://nodejs.org/api/process.html#process_process_cwd|process.cwd()}
     */
    public static async resolveProjectPath(dir?: string): Promise<string> {
        return resolveProjectPath(dir);
    }

    private projectConfig: any; // tslint:disable-line:no-any

    // Dynamically referenced in retrieveSfdxProjectJson
    private sfdxProjectJson!: SfdxProjectJson;
    private sfdxProjectJsonGlobal!: SfdxProjectJson;

    /**
     * Do not directly construct instances of this class -- use {@link Project.resolve} instead.
     *
     * @private
     * @constructor
     */
    private constructor(private path: string) { }

    /**
     * Returns the project path.
     * @returns {string}
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
        const options = SfdxProjectJson.getDefaultOptions(isGlobal);
        if (isGlobal) {
            if (!this.sfdxProjectJsonGlobal) {
                this.sfdxProjectJsonGlobal = await SfdxProjectJson.retrieve<SfdxProjectJson>(options);
            }
            return this.sfdxProjectJsonGlobal;
        } else {
            options.rootFolder = this.getPath();
            if (!this.sfdxProjectJson) {
                this.sfdxProjectJson = await SfdxProjectJson.retrieve<SfdxProjectJson>(options);
            }
            return this.sfdxProjectJson;
        }
    }

    /**
     * The project config is resolved from local and global {@link SfdxProjectJson},
     * {@link ConfigAggregator}, and a set of defaults. It is recommended to use
     * this when reading values from SfdxProjectJson.
     * @returns {object} A resolved config object that contains a bunch of different
     * properties, including some 3rd party custom properties.
     */
    public async resolveProjectConfig(): Promise<object> {
        if (!this.projectConfig) {
            // Get sfdx-project.json from the ~/.sfdx directory to provide defaults
            const global = await this.retrieveSfdxProjectJson(true);
            const local = await this.retrieveSfdxProjectJson();

            await global.read();
            await local.read();

            const defaultValues = {
                sfdcLoginUrl: 'https://login.salesforce.com'
            };

            this.projectConfig = defaults(local.toObject(), global.toObject(), defaultValues);

            // Add fields in sfdx-config.json
            Object.assign(this.projectConfig, (await ConfigAggregator.create()).getConfig());

            // LEGACY - Allow override of sfdcLoginUrl via env var FORCE_SFDC_LOGIN_URL
            if (process.env.FORCE_SFDC_LOGIN_URL) {
                this.projectConfig.sfdcLoginUrl = process.env.FORCE_SFDC_LOGIN_URL;
            }
        }

        return this.projectConfig;
    }
}
