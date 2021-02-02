import { ConfigFile } from './configFile';
/**
 * A config file that stores usernames for an org.
 */
export declare class OrgUsersConfig extends ConfigFile<OrgUsersConfig.Options> {
  /**
   * Gets the config options for a given org ID.
   * @param orgId The orgId. Generally this org would have multiple users configured.
   */
  static getOptions(orgId: string): OrgUsersConfig.Options;
  /**
   * Constructor.
   * **Do not directly construct instances of this class -- use {@link OrgUsersConfig.create} instead.**
   * @param options The options for the class instance
   * @ignore
   */
  constructor(options: OrgUsersConfig.Options);
}
export declare namespace OrgUsersConfig {
  /**
   * The config file options.
   */
  interface Options extends ConfigFile.Options {
    /**
     * The org id associated with this user.
     */
    orgId: string;
  }
}
