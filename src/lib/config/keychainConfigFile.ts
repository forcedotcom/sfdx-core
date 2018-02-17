import { ConfigFile } from './configFile';

export class KeychainConfigFile extends ConfigFile {
    public static readonly KEYCHAIN_FILENAME = 'key.json';

    public static async create(): Promise<ConfigFile> {
        return new ConfigFile(
            await ConfigFile.getRootFolder(true), KeychainConfigFile.KEYCHAIN_FILENAME, true);
    }
}
