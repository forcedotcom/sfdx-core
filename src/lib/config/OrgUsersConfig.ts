import {Config, ConfigOptions} from './configFile';
import { Global } from '../global';

/**
 * Class that represents various configuration files associated with Org instances.
 */
export class OrgUsersConfig extends Config {

    public static ORGS_FOLDER_NAME: string = 'orgs';

    public static getDefaultOptions(orgId: string): ConfigOptions {
        return {
            isGlobal: true,
            isState: true,
            filename: `${orgId}.json`,
            filePath: Global.STATE_FOLDER
        };
    }
}
