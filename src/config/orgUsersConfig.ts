/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {ConfigFile, ConfigOptions} from './configFile';

/**
 * A config file that stores usernames for an org.
 *
 * @extends ConfigFile
 */
export class OrgUsersConfig extends ConfigFile {

    /**
     * **Do not use.** Call {@link OrgUsersConfig.getOptions} instead.
     */
    public static getDefaultOptions(isGlobal: boolean, filename?: string): ConfigOptions {
        throw Error('The method OrgUsersConfig.getDefaultOptions is not supported. Call OrgUsersConfig.getOptions().');
    }

    /**
     * Gets the config options for a given org ID.
     * @param {string} orgId The orgId. Generally this org would have multiple users configured.
     * @return {ConfigOptions} The ConfigOptions.
     */
    public static getOptions(orgId: string): ConfigOptions {
        return {
            isGlobal: true,
            isState: true,
            filename: `${orgId}.json`
        };
    }
}
