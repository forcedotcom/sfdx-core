import { Config, ConfigOptions } from './config';

/**
 * Represents an auth file config backed by a json file
 */
export class AuthInfoConfig extends Config {

    /**
     * Default options for an auth file.
     * @param {string} filename - the name of the auth file. Sfdx uses <username>.json
     * @return {ConfigOptions} - The ConfigOptions
     */
    public static getDefaultOptions(filename: string): ConfigOptions {
        return {
            isGlobal: true,
            filename
        };
    }
}
