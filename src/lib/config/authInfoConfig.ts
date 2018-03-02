import { ConfigFile, ConfigOptions } from './configFile';

/**
 * Represents an auth file config backed by a json file
 * @extends Config
 */
export class AuthInfoConfig extends ConfigFile {
    public static getDefaultOptions(isGlobal: boolean, filename?: string): ConfigOptions {
        throw Error('The method AuthInfoConfig.getDefaultOptions is not supported. Call AuthInfoConfig.getOptions().');
    }

    /**
     * Gets the config options for a given org ID.
     * @param {string} orgId - The orgId. Generally this org would have multiple users configured.
     * @return {ConfigOptions} - The ConfigOptions.
     */
    public static getOptions(username: string): ConfigOptions {
        return {
            isGlobal: true, // Only allow global auth files
            isState: true,
            filename: `${username}.json`
        };
    }
}
