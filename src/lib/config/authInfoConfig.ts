import { Config, ConfigOptions } from './config';

/**
 * Represents an auth file config backed by a json file
 */
export class AuthInfoConfig extends Config {

    public static getDefaultOptions(filename: string): ConfigOptions {
        return {
            isGlobal: true,
            filename
        };
    }
}
