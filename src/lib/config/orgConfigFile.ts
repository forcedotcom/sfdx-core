import { join as pathJoin } from 'path';
import { ConfigFile } from './configFile';
import { SfdxError } from '../sfdxError';
import { Global } from '../global';

/**
 * Config file types
 */
export const enum OrgConfigType {
    MAX_REVISION = 'maxrevision.json',
    SOURCE_PATH_INFOS = 'sourcePathInfos.json',
    METADATA_TYPE_INFOS = 'metadataTypeInfos.json',
    USERS = 'orgUsers'
}

/**
 * Class that represents various configuration files associated with Org instances.
 */
export class OrgConfigFile extends ConfigFile {

    public static ORGS_FOLDER_NAME = 'orgs';

    /**
     * Creates an instance of a configuration backed by a json file
     * @param {OrgConfigType} orgConfigType - The type of org configuration
     * @param {string} nameOrId - An org id or username
     * @returns {Promise<OrgConfigFile>} - An object that controls reading and writing the config object.
     */
    public static async create(orgConfigType: OrgConfigType, nameOrId: string): Promise<OrgConfigFile> {
        if (!nameOrId) {
            throw new SfdxError('Please supply the org name or org id', 'MissingOrgNameOrId');
        }

        switch (orgConfigType) {
            case OrgConfigType.USERS:
                return new OrgConfigFile(await ConfigFile.getRootFolder(true), `${nameOrId}.json`, true, true, Global.STATE_FOLDER);
            default:
                return new OrgConfigFile(await ConfigFile.getRootFolder(false), orgConfigType.valueOf(), false, true, pathJoin(Global.STATE_FOLDER, this.ORGS_FOLDER_NAME, nameOrId));
        }
    }

    /**
     * Private ctor
     * @param {string} root - The root folder
     * @param {string} filename - The filename
     * @param {boolean} isGlobal - true if the configuration is global
     * @param {boolean} isState - true if it's a state folder
     * @param {string} configPath - relative path to the configuration
     */
    private constructor(root: string, filename: string, isGlobal: boolean, isState: boolean, configPath?: string) {
        super(root, filename, false, false, configPath);
    }
}
