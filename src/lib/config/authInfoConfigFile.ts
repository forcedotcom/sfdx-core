import { ConfigFile } from './configFile';

export class AuthInfoConfigFile extends ConfigFile {
    public static async create(filename: string): Promise<ConfigFile> {
        return new ConfigFile(await ConfigFile.getRootFolder(true), filename, true);
    }
}
