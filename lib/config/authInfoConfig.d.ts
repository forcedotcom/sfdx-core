import { ConfigFile } from './configFile';
/**
 * An auth config file that stores information such as access tokens, usernames, etc.,
 * in the global sfdx directory (~/.sfdx).
 *
 * ```
 * const authInfo = await AuthInfoConfig.create(AuthInfoConfig.getOptions(username));
 * ```
 */
export declare class AuthInfoConfig extends ConfigFile<ConfigFile.Options> {
  /**
   * Gets the config options for a given org ID.
   * @param username The username for the org.
   */
  static getOptions(username: string): ConfigFile.Options;
}
