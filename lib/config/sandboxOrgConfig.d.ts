import { ConfigFile } from './configFile';
/**
 * A config file that stores usernames for an org.
 */
export declare class SandboxOrgConfig extends ConfigFile<SandboxOrgConfig.Options> {
  /**
   * Gets the config options for a given org ID.
   * @param orgId The orgId. Generally this org would have multiple users configured.
   */
  static getOptions(orgId: string): SandboxOrgConfig.Options;
  /**
   * Constructor.
   * **Do not directly construct instances of this class -- use {@link SandboxConfig.create} instead.**
   * @param options The options for the class instance
   * @ignore
   */
  constructor(options: SandboxOrgConfig.Options);
}
export declare namespace SandboxOrgConfig {
  /**
   * The config file options.
   */
  interface Options extends ConfigFile.Options {
    /**
     * The org id associated with this sandbox.
     */
    orgId: string;
  }
  enum Fields {
    /**
     * The username of the user who created the sandbox.
     */
    PROD_ORG_USERNAME = 'prodOrgUsername'
  }
}
