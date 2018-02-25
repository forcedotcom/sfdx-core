import { Config, ConfigOptions } from './config';

/**
 * Represent a keychain config backed by a json file.
 * @private
 */
export class KeychainConfig extends Config {
    public static readonly KEYCHAIN_FILENAME = 'key.json';

    public static getDefaultOptions(): ConfigOptions {
        return {
            filename: KeychainConfig.KEYCHAIN_FILENAME,
            isGlobal: true
        };
    }
}
