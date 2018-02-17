import { join as pathJoin } from 'path';
import { ConfigFile } from './configFile';
import { ProjectDir } from '../projectDir';
import { SfdxError } from '../sfdxError';
import { Global } from '../global';

export const enum OrgConfigType {
    MAX_REVISION = 'maxrevision.json',
    SOURCE_PATH_INFOS = 'sourcePathInfos.json',
    METADATA_TYPE_INFOS = 'metadataTypeInfos.json',
    USERS = 'orgUsers'
}

export class OrgConfigFile extends ConfigFile {

    public static ORGS_FOLDER_NAME = 'orgs';

    public static async create(orgConfigType: OrgConfigType, nameOrId: string): Promise<OrgConfigFile> {
        if (!nameOrId) {
            throw new SfdxError('Please supply the org name or org id', 'MissingOrgNameOrId');
        }

        switch (orgConfigType) {
            case OrgConfigType.USERS:
                return new OrgConfigFile(Global.DIR, `${nameOrId}.json`, true, true);
            default:
                return new OrgConfigFile(await ProjectDir.getPath(), orgConfigType.valueOf(), false, true, pathJoin(this.ORGS_FOLDER_NAME, nameOrId));
        }
    }

    private constructor(root: string, filename: string, isGlobal: boolean, isState: boolean, configPath?: string) {
        super(root, filename, false, false, configPath);
    }
}
