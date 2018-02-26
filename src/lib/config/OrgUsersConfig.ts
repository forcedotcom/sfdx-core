import {Config, ConfigOptions} from './config';

/**
 * Class that represents various configuration files associated with Org instances.
 */
export class OrgUsersConfig extends Config {

    public static ORGS_FOLDER_NAME: string = 'orgs';

    /**
     * Gets the default options
     * @param {string} orgId - The orgId. Generally this org would have multiple users configured.
     * @return {ConfigOptions} - The ConfigOptions
     */
    public static getDefaultOptions(orgId: string): ConfigOptions {
        return {
            isGlobal: true,
            isState: true,
            filename: `${orgId}.json`
        };
    }
}
