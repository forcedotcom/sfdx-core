import { Config } from './configFile';

/**
 * Represent a keychain config backed by a json file.
 * @private
 */
export class KeychainConfigFile extends Config {
    public static readonly KEYCHAIN_FILENAME = 'key.json';

    /**
     * static initializer
     * @returns {Promise<Config>} - A config object backed by a json file.
     */
    public static async create(): Promise<Config> {
        return new Config(
            await Config.resolveRootFolder(true), KeychainConfigFile.KEYCHAIN_FILENAME, true);
    }
}
