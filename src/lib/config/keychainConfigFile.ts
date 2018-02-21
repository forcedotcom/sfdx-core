import { ConfigFile } from './configFile';

/**
 * Represent a keychain config backed by a json file.
 */
export class KeychainConfigFile extends ConfigFile {
    public static readonly KEYCHAIN_FILENAME = 'key.json';

    /**
     * static intializer
     * @returns {Promise<ConfigFile>} - A config object backed by a json file.
     */
    public static async create(): Promise<ConfigFile> {
        return new ConfigFile(
            await ConfigFile.getRootFolder(true), KeychainConfigFile.KEYCHAIN_FILENAME, true);
    }
}
