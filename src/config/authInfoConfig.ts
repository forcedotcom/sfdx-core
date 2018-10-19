/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { ConfigFile, ConfigOptions } from './configFile';

/**
 * An auth config file that stores information such as access tokens, usernames, etc.,
 * in the global sfdx directory (~/.sfdx).
 *
 * @extends ConfigFile
 *
 * @example
 * const authInfo = await AuthInfoConfig.retrieve<AuthInfoConfig>(AuthInfoConfig.getOptions(username));
 */
export class AuthInfoConfig extends ConfigFile {
    public static getDefaultOptions(isGlobal: boolean, filename?: string): ConfigOptions {
        throw Error('The method AuthInfoConfig.getDefaultOptions is not supported. Call AuthInfoConfig.getOptions().');
    }

    /**
     * Gets the config options for a given org ID.
     * @param {string} orgId The orgId. Generally this org would have multiple users configured.
     * @return {ConfigOptions} The ConfigOptions.
     */
    public static getOptions(username: string): ConfigOptions {
        return {
            isGlobal: true, // Only allow global auth files
            isState: true,
            filename: `${username}.json`
        };
    }
}
