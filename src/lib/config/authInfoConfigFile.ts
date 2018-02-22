import { Config } from './configFile';

/**
 * Represents an auth file config backed by a json file
 */
export class AuthInfoConfigFile extends Config {
    /**
     * Static intializer
     * @param {string} filename - The filename
     * @returns {Promise<Config>} - A config backed by a json file.
     */
    public static async create(filename: string): Promise<Config> {
        return new Config(await Config.resolveRootFolder(true), filename, true);
    }
}
