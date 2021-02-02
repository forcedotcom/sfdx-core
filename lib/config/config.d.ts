import { ConfigFile } from './configFile';
import { ConfigContents, ConfigValue } from './configStore';
/**
 * Interface for meta information about config properties
 */
export interface ConfigPropertyMeta {
  /**
   *  The config property name.
   */
  key: string;
  /**
   *  Reference to the config data input validation.
   */
  input?: ConfigPropertyMetaInput;
  /**
   *  True if the property should be indirectly hidden from the user.
   */
  hidden?: boolean;
  /**
   * True if the property values should be stored encrypted.
   */
  encrypted?: boolean;
}
/**
 * Config property input validation
 */
export interface ConfigPropertyMetaInput {
  /**
   * Tests if the input value is valid and returns true if the input data is valid.
   * @param value The input value.
   */
  validator: (value: ConfigValue) => boolean;
  /**
   * The message to return in the error if the validation fails.
   */
  failedMessage: string;
}
/**
 * The files where sfdx config values are stored for projects and the global space.
 *
 * *Note:* It is not recommended to instantiate this object directly when resolving
 * config values. Instead use {@link ConfigAggregator}
 *
 * ```
 * const localConfig = await Config.create({});
 * localConfig.set('defaultusername', 'username@company.org');
 * await localConfig.write();
 * ```
 * https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_config_values.htm
 */
export declare class Config extends ConfigFile<ConfigFile.Options> {
  /**
   * Username associated with the default dev hub org.
   */
  static readonly DEFAULT_DEV_HUB_USERNAME: string;
  /**
   * Username associate with the default org.
   */
  static readonly DEFAULT_USERNAME: string;
  /**
   * The sid for the debugger configuration.
   */
  static readonly ISV_DEBUGGER_SID: string;
  /**
   * The url for the debugger configuration.
   */
  static readonly ISV_DEBUGGER_URL: string;
  /**
   * The api version
   */
  static readonly API_VERSION = 'apiVersion';
  /**
   * Disables telemetry reporting
   */
  static readonly DISABLE_TELEMETRY = 'disableTelemetry';
  /**
   * allows users to override the 10,000 result query limit
   */
  static readonly MAX_QUERY_LIMIT = 'maxQueryLimit';
  /**
   * Returns the default file name for a config file.
   *
   * **See** {@link SFDX_CONFIG_FILE_NAME}
   */
  static getFileName(): string;
  /**
   * Returns an object representing the supported allowed properties.
   */
  static getAllowedProperties(): ConfigPropertyMeta[];
  /**
   * Gets default options.
   * @param isGlobal Make the config global.
   * @param filename Override the default file. {@link Config.getFileName}
   */
  static getDefaultOptions(isGlobal?: boolean, filename?: string): ConfigFile.Options;
  /**
   * The value of a supported config property.
   * @param isGlobal True for a global config. False for a local config.
   * @param propertyName The name of the property to set.
   * @param value The property value.
   */
  static update(isGlobal: boolean, propertyName: string, value?: ConfigValue): Promise<ConfigContents>;
  /**
   * Clear all the configured properties both local and global.
   */
  static clear(): Promise<void>;
  private static allowedProperties;
  private static messages;
  private static propertyConfigMap;
  private crypto?;
  constructor(options?: ConfigFile.Options);
  /**
   * Read, assign, and return the config contents.
   */
  read(): Promise<ConfigContents>;
  /**
   * Writes Config properties taking into account encrypted properties.
   * @param newContents The new Config value to persist.
   */
  write(newContents?: ConfigContents): Promise<ConfigContents>;
  /**
   * Sets a value for a property.
   *
   * **Throws** *{@link SfdxError}{ name: 'InvalidConfigValue' }* If the input validator fails.
   * @param key The property to set.
   * @param value The value of the property.
   */
  set(key: string, value: ConfigValue): ConfigContents;
  /**
   * Unsets a value for a property.
   *
   * **Throws** *{@link SfdxError}{ name: 'UnknownConfigKey' }* If the input validator fails.
   * @param key The property to unset.
   */
  unset(key: string): boolean;
  /**
   * Initializer for supported config types.
   */
  protected init(): Promise<void>;
  /**
   * Initialize the crypto dependency.
   */
  private initCrypto;
  /**
   * Closes the crypto dependency. Crypto should be close after it's used and no longer needed.
   */
  private clearCrypto;
  /**
   * Get an individual property config.
   * @param propertyName The name of the property.
   */
  private getPropertyConfig;
  /**
   * Encrypts and content properties that have a encryption attribute.
   * @param encrypt `true` to encrypt.
   */
  private cryptProperties;
}
