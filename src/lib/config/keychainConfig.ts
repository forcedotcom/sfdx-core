import { ConfigFile } from './configFile';

/**
 * Represent a keychain config backed by a json file.
 * @private
 */
export class KeychainConfig extends ConfigFile {
    public static getFileName(): string {
        return 'key.json';
    }
}
