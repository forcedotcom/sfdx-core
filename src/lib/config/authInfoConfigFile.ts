import { ConfigFile } from './configFile';

/**
 * Represents an auth file config backed by a json file
 */
export class AuthInfoConfigFile extends ConfigFile {
    /**
     * Static intializer
     * @param {string} filename - The filename
     * @returns {Promise<ConfigFile>} - A config backed by a json file.
     */
    public static async create(filename: string): Promise<ConfigFile> {
        return new ConfigFile(await ConfigFile.resolveRootFolder(true), filename, true);
    }
}
