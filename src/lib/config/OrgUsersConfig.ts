import {ConfigFile, ConfigOptions} from './configFile';

/**
 * Class that represents various configuration files associated with Org instances.
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
     * @param {string} orgId - The orgId. Generally this org would have multiple users configured.
     * @return {ConfigOptions} - The ConfigOptions.
     */
    public static getOptions(orgId: string): ConfigOptions {
        return {
            isGlobal: true,
            isState: true,
            filename: `${orgId}.json`
        };
    }
}
