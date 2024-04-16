declare module '@salesforce/core/config/authInfoConfig' {
  import { AuthFields } from '@salesforce/core/org/authInfo';
  import { ConfigFile } from '@salesforce/core/config/configFile';
  /**
   * An auth config file that stores information such as access tokens, usernames, etc.,
   * in the global sfdx directory (~/.sfdx).
   *
   * ```
   * const authInfo = await AuthInfoConfig.create(AuthInfoConfig.getOptions(username));
   * ```
   */
  export class AuthInfoConfig extends ConfigFile<ConfigFile.Options, AuthFields> {
    protected static encryptedKeys: RegExp[];
    /**
     * Gets the config options for a given org ID.
     *
     * @param username The username for the org.
     */
    static getOptions(username: string): ConfigFile.Options;
  }
}
declare module '@salesforce/core/config/config' {
  import { Nullable } from '@salesforce/ts-types';
  import { OrgConfigProperties } from '@salesforce/core/org/orgConfigProperties';
  import { ConfigFile } from '@salesforce/core/config/configFile';
  import { ConfigContents, ConfigValue, Key } from '@salesforce/core/config/configStackTypes';
  /**
   * Interface for meta information about config properties
   */
  export type ConfigPropertyMeta = {
    /**
     * The config property name.
     */
    key: string;
    /**
     * Description
     */
    description: string;
    /**
     * Reference to the config data input validation.
     */
    input?: ConfigPropertyMetaInput;
    /**
     * True if the property should be indirectly hidden from the user.
     */
    hidden?: boolean;
    /**
     * True if the property values should be stored encrypted.
     */
    encrypted?: boolean;
    /**
     * True if the property is deprecated
     */
    deprecated?: boolean;
    /**
     * Reference to config property name that will eventually replace this one.
     * Is only used if deprecated is set to true.
     */
    newKey?: string;
  };
  /**
   * Config property input validation
   */
  export type ConfigPropertyMetaInput = {
    /**
     * Tests if the input value is valid and returns true if the input data is valid.
     *
     * @param value The input value.
     */
    validator: (value: ConfigValue) => boolean;
    /**
     * The message to return in the error if the validation fails.
     */
    failedMessage: string | ((value: ConfigValue) => string);
  };
  export enum SfConfigProperties {
    /**
     * Disables telemetry reporting
     */
    DISABLE_TELEMETRY = 'disable-telemetry',
  }
  export const SF_ALLOWED_PROPERTIES: {
    key: SfConfigProperties;
    description: string;
    input: {
      validator: (value: ConfigValue) => boolean;
      failedMessage: string;
    };
  }[];
  export enum SfdxPropertyKeys {
    /**
     * Username associated with the default dev hub org.
     *
     * @deprecated Replaced by OrgConfigProperties.TARGET_DEV_HUB in v3 {@link https://github.com/forcedotcom/sfdx-core/blob/v3/MIGRATING_V2-V3.md#config}
     * will remain in v3 for the foreseeable future so that `sfdx-core` can map between `sf` and `sfdx` config values
     */
    DEFAULT_DEV_HUB_USERNAME = 'defaultdevhubusername',
    /**
     * Username associate with the default org.
     *
     * @deprecated Replaced by OrgConfigProperties.TARGET_ORG in v3 {@link https://github.com/forcedotcom/sfdx-core/blob/v3/MIGRATING_V2-V3.md#config}
     * will remain in v3 for the foreseeable future so that `sfdx-core` can map between `sf` and `sfdx` config values
     */
    DEFAULT_USERNAME = 'defaultusername',
    /**
     * The sid for the debugger configuration.
     *
     * @deprecated Replaced by OrgConfigProperties.ORG_ISV_DEBUGGER_SID in v3 {@link https://github.com/forcedotcom/sfdx-core/blob/v3/MIGRATING_V2-V3.md#config}
     */
    ISV_DEBUGGER_SID = 'isvDebuggerSid',
    /**
     * The url for the debugger configuration.
     *
     * @deprecated Replaced by OrgConfigProperties.ORG_ISV_DEBUGGER_URL in v3 {@link https://github.com/forcedotcom/sfdx-core/blob/v3/MIGRATING_V2-V3.md#config}
     */
    ISV_DEBUGGER_URL = 'isvDebuggerUrl',
    /**
     * The api version
     *
     * @deprecated Replaced by OrgConfigProperties.ORG_API_VERSION in v3 {@link https://github.com/forcedotcom/sfdx-core/blob/v3/MIGRATING_V2-V3.md#config}
     */
    API_VERSION = 'apiVersion',
    /**
     * Disables telemetry reporting
     *
     * @deprecated Replaced by SfPropertyKeys.DISABLE_TELEMETRY in v3 {@link https://github.com/forcedotcom/sfdx-core/blob/v3/MIGRATING_V2-V3.md#config}
     */
    DISABLE_TELEMETRY = 'disableTelemetry',
    /**
     * Custom templates repo or local location.
     *
     * @deprecated Replaced by OrgConfigProperties.ORG_CUSTOM_METADATA_TEMPLATES in v3 {@link https://github.com/forcedotcom/sfdx-core/blob/v3/MIGRATING_V2-V3.md#config}
     */
    CUSTOM_ORG_METADATA_TEMPLATES = 'customOrgMetadataTemplates',
    /**
     * allows users to override the 10,000 result query limit
     *
     * @deprecated Replaced by OrgConfigProperties.ORG_MAX_QUERY_LIMIT in v3 {@link https://github.com/forcedotcom/sfdx-core/blob/v3/MIGRATING_V2-V3.md#config}
     */
    MAX_QUERY_LIMIT = 'maxQueryLimit',
    /**
     * @deprecated
     */
    REST_DEPLOY = 'restDeploy',
    /**
     * @deprecated Replaced by OrgConfigProperties.ORG_INSTANCE_URL in v3 {@link https://github.com/forcedotcom/sfdx-core/blob/v3/MIGRATING_V2-V3.md#config}
     */
    INSTANCE_URL = 'instanceUrl',
  }
  export const SFDX_ALLOWED_PROPERTIES: (
    | {
        key: SfdxPropertyKeys;
        description: string;
        newKey: OrgConfigProperties;
        deprecated: boolean;
        input: {
          validator: (value: ConfigValue) => boolean;
          failedMessage: string;
        };
        encrypted?: undefined;
        hidden?: undefined;
      }
    | {
        key: SfdxPropertyKeys;
        newKey: OrgConfigProperties;
        deprecated: boolean;
        description: string;
        input?: undefined;
        encrypted?: undefined;
        hidden?: undefined;
      }
    | {
        key: SfdxPropertyKeys;
        newKey: OrgConfigProperties;
        deprecated: boolean;
        description: string;
        encrypted: boolean;
        input: {
          validator: (value: ConfigValue) => boolean;
          failedMessage: string;
        };
        hidden?: undefined;
      }
    | {
        key: SfdxPropertyKeys;
        newKey: SfConfigProperties;
        deprecated: boolean;
        description: string;
        input: {
          validator: (value: ConfigValue) => boolean;
          failedMessage: string;
        };
        encrypted?: undefined;
        hidden?: undefined;
      }
    | {
        key: SfdxPropertyKeys;
        description: string;
        hidden: boolean;
        newKey: string;
        deprecated: boolean;
        input: {
          validator: (value: ConfigValue) => boolean;
          failedMessage: string;
        };
        encrypted?: undefined;
      }
  )[];
  export const SfProperty: {
    [index: string]: ConfigPropertyMeta;
  };
  export type ConfigProperties = ConfigContents;
  /**
   * The files where sfdx config values are stored for projects and the global space.
   *
   * *Note:* It is not recommended to instantiate this object directly when resolving
   * config values. Instead use {@link ConfigAggregator}
   *
   * ```
   * const localConfig = await Config.create();
   * localConfig.set('target-org', 'username@company.org');
   * await localConfig.write();
   * ```
   * https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_config_values.htm
   */
  export class Config extends ConfigFile<ConfigFile.Options, ConfigProperties> {
    private static allowedProperties;
    private sfdxPath?;
    constructor(options?: ConfigFile.Options);
    /**
     * Returns the default file name for a config file.
     *
     * **See** {@link CONFIG_FILE_NAME}
     */
    static getFileName(): string;
    /**
     * Returns an array of objects representing the allowed config properties.
     */
    static getAllowedProperties(): ConfigPropertyMeta[];
    /**
     * Add an array of allowed config properties.
     *
     * @param metas Array of objects to set as the allowed config properties.
     */
    static addAllowedProperties(metas: ConfigPropertyMeta[]): void;
    /**
     * The value of a supported config property.
     *
     * @param isGlobal True for a global config. False for a local config.
     * @param propertyName The name of the property to set.
     * @param value The property value.
     */
    static update<K extends Key<ConfigProperties>>(
      isGlobal: boolean,
      propertyName: K,
      value?: ConfigProperties[K]
    ): Promise<ConfigContents>;
    /**
     * Clear all the configured properties both local and global.
     */
    static clear(): Promise<void>;
    static getPropertyConfigMeta(propertyName: string): Nullable<ConfigPropertyMeta>;
    private static propertyConfigMap;
    /**
     * Read, assign, and return the config contents.
     */
    read(force?: boolean): Promise<ConfigProperties>;
    readSync(force?: boolean): ConfigProperties;
    /**
     * Writes Config properties taking into account encrypted properties.
     *
     * @param newContents The new Config value to persist.
     */
    write(): Promise<ConfigProperties>;
    /**
     * DO NOT CALL - The config file needs to encrypt values which can only be done asynchronously.
     * Call {@link SfdxConfig.write} instead.
     *
     * **Throws** *{@link SfError}{ name: 'InvalidWriteError' }* Always.
     *
     * @param newContents Contents to write
     */
    writeSync(newContents?: ConfigProperties): ConfigProperties;
    /**
     * Sets a value for a property.
     *
     * **Throws** *{@link SfError}{ name: 'UnknownConfigKeyError' }* An attempt to get a property that's not supported.
     * **Throws** *{@link SfError}{ name: 'InvalidConfigValueError' }* If the input validator fails.
     *
     * @param key The property to set.
     * @param value The value of the property.
     */
    set<K extends Key<ConfigProperties>>(key: K, value: ConfigProperties[K]): ConfigProperties;
    /**
     * Unsets a value for a property.
     *
     * **Throws** *{@link SfError}{ name: 'UnknownConfigKeyError' }* If the input validator fails.
     *
     * @param key The property to unset.
     */
    unset(key: string): boolean;
    /**
     * Get an individual property config.
     *
     * **Throws** *{@link SfError}{ name: 'UnknownConfigKeyError' }* An attempt to get a property that's not supported.
     *
     * @param propertyName The name of the property.
     */
    getPropertyConfig(propertyName: string): ConfigPropertyMeta;
    /**
     * Initializer for supported config types.
     */
    protected init(): Promise<void>;
    /**
     * Encrypts and content properties that have a encryption attribute.
     *
     * @param encrypt `true` to encrypt.
     */
    private cryptProperties;
  }
}
declare module '@salesforce/core/config/configAggregator' {
  import { AsyncOptionalCreatable } from '@salesforce/kit';
  import { AnyJson, Dictionary, JsonMap, Optional } from '@salesforce/ts-types';
  import { Config, ConfigPropertyMeta } from '@salesforce/core/config/config';
  /**
   * Information about a config property.
   */
  export type ConfigInfo = {
    /**
     * key The config key.
     */
    key: string;
    /**
     * The location of the config property.
     */
    location?: ConfigAggregator.Location;
    /**
     * The config value.
     */
    value?: AnyJson;
    /**
     * The path of the config value.
     */
    path?: string;
    /**
     * `true` if the config property is in the local project.
     */
    isLocal: () => boolean;
    /**
     * `true` if the config property is in the global space.
     */
    isGlobal: () => boolean;
    /**
     * `true` if the config property is an environment variable.
     */
    isEnvVar: () => boolean;
    /**
     * True if the config property is deprecated.
     */
    deprecated?: boolean;
  };
  /**
   * Aggregate global and local project config files, as well as environment variables for
   * `config.json`. The resolution happens in the following bottom-up order:
   *
   * 1. Environment variables  (`SF_LOG_LEVEL`)
   * 1. Workspace settings  (`<workspace-root>/.sf/config.json`)
   * 1. Global settings  (`$HOME/.sf/config.json`)
   *
   * Use {@link ConfigAggregator.create} to instantiate the aggregator.
   *
   * ```
   * const aggregator = await ConfigAggregator.create();
   * console.log(aggregator.getPropertyValue('target-org'));
   * ```
   */
  export class ConfigAggregator extends AsyncOptionalCreatable<ConfigAggregator.Options> {
    protected static instance: AsyncOptionalCreatable;
    protected static encrypted: boolean;
    private allowedProperties;
    private readonly localConfig?;
    private readonly globalConfig;
    private envVars;
    /**
     * **Do not directly construct instances of this class -- use {@link ConfigAggregator.create} instead.**
     *
     * @ignore
     */
    constructor(options?: ConfigAggregator.Options);
    private get config();
    static create<P extends ConfigAggregator.Options, T extends AsyncOptionalCreatable<P>>(
      this: new (options?: P) => T,
      options?: P
    ): Promise<T>;
    /**
     * Get the info for a given key. If the ConfigAggregator was not asynchronously created OR
     * the {@link ConfigAggregator.reload} was not called, the config value may be encrypted.
     *
     * @param key The config key.
     */
    static getValue(key: string): ConfigInfo;
    /**
     * Get the static ConfigAggregator instance. If one doesn't exist, one will be created with
     * the **encrypted** config values. Encrypted config values need to be resolved
     * asynchronously by calling {@link ConfigAggregator.reload}
     */
    private static getInstance;
    /**
     * Initialize this instances async dependencies.
     */
    init(): Promise<void>;
    /**
     * Get a resolved config property.
     * If you use a deprecated property, a warning will be emitted and it will attempt to resolve the new property's value
     *
     * **Throws** *{@link SfError}{ name: 'UnknownConfigKeyError' }* An attempt to get a property that's not supported.
     *
     * @param key The key of the property.
     */
    getPropertyValue<T extends AnyJson>(key: string): Optional<T>;
    /**
     * Get a resolved config property meta.
     * If the property is deprecated, it will return the new key's meta, if it exists, with a deprecation warning
     *
     * **Throws** *{@link SfError}{ name: 'UnknownConfigKeyError' }* An attempt to get a property that's not supported.
     *
     * @param key The key of the property.
     */
    getPropertyMeta(key: string): ConfigPropertyMeta;
    /**
     * Get a resolved config property.
     * If a property is deprecated, it will try to use the the new key, if there is a config there.
     *
     * @param key The key of the property.
     * @param throwOnDeprecation True, if you want an error throw when reading a deprecated config
     */
    getInfo(key: string, throwOnDeprecation?: boolean): ConfigInfo;
    /**
     * Gets a resolved config property location.
     *
     * For example, `getLocation('logLevel')` will return:
     * 1. `Location.GLOBAL` if resolved to an environment variable.
     * 1. `Location.LOCAL` if resolved to local project config.
     * 1. `Location.ENVIRONMENT` if resolved to the global config.
     *
     * @param key The key of the property.
     */
    getLocation(key: string): Optional<ConfigAggregator.Location>;
    /**
     * Get a resolved file path or environment variable name of the property.
     *
     * For example, `getPath('logLevel')` will return:
     * 1. `$SF_LOG_LEVEL` if resolved to an environment variable.
     * 1. `./.sf/config.json` if resolved to the local config.
     * 1. `~/.sf/config.json` if resolved to the global config.
     * 1. `undefined`, if not resolved.
     *
     * **Note:** that the path returned may be the absolute path instead of
     * relative paths such as `./` and `~/`.
     *
     * @param key The key of the property.
     */
    getPath(key: string): Optional<string>;
    /**
     * Get all resolved config property keys, values, locations, and paths.
     *
     * ```
     * > console.log(aggregator.getConfigInfo());
     * [
     *     { key: 'logLevel', val: 'INFO', location: 'Environment', path: '$SF_LOG_LEVEL'}
     *     { key: 'target-org', val: '<username>', location: 'Local', path: './.sf/config.json'}
     * ]
     * ```
     */
    getConfigInfo(): ConfigInfo[];
    /**
     * Get the local project config instance.
     */
    getLocalConfig(): Config | undefined;
    /**
     * Get the global config instance.
     */
    getGlobalConfig(): Config;
    /**
     * Get the resolved config object from the local, global and environment config instances.
     */
    getConfig(): JsonMap;
    unsetByValue(key: string): Promise<void>;
    /**
     * Get the config properties that are environment variables.
     */
    getEnvVars(): Dictionary<string>;
    /**
     * Re-read all property configurations from disk.
     */
    reload(): Promise<ConfigAggregator>;
    /**
     * Add an allowed config property.
     */
    addAllowedProperties(configMetas: ConfigPropertyMeta | ConfigPropertyMeta[]): void;
    /**
     * Set the allowed properties.
     *
     * @param properties The properties to set.
     */
    protected setAllowedProperties(properties: ConfigPropertyMeta[]): void;
    /**
     * Get the allowed properties.
     */
    protected getAllowedProperties(): ConfigPropertyMeta[];
    /**
     * Loads all the properties and aggregates them according to location.
     */
    protected loadProperties(): Promise<void>;
    /**
     * Loads all the properties and aggregates them according to location.
     */
    private loadPropertiesSync;
    private resolveProperties;
  }
  export namespace ConfigAggregator {
    /**
     * An enum of all possible locations for a config value.
     */
    const enum Location {
      /**
       * Represents the global config.
       */
      GLOBAL = 'Global',
      /**
       * Represents the local project config.
       */
      LOCAL = 'Local',
      /**
       * Represents environment variables.
       */
      ENVIRONMENT = 'Environment',
    }
    type Options = {
      customConfigMeta?: ConfigPropertyMeta[];
    };
  }
}
declare module '@salesforce/core/config/configFile' {
  /// <reference types="node" />
  import { Stats as fsStats } from 'node:fs';
  import { Logger } from '@salesforce/core/logger/logger';
  import { BaseConfigStore } from '@salesforce/core/config/configStore';
  import { ConfigContents } from '@salesforce/core/config/configStackTypes';
  /**
   * Represents a json config file used to manage settings and state. Global config
   * files are stored in the home directory hidden state folder (.sfdx) and local config
   * files are stored in the project path, either in the hidden state folder or wherever
   * specified.
   *
   * ```
   * class MyConfig extends ConfigFile {
   *   public static getFileName(): string {
   *     return 'myConfigFilename.json';
   *   }
   * }
   * const myConfig = await MyConfig.create({
   *   isGlobal: true
   * });
   * myConfig.set('mykey', 'myvalue');
   * await myConfig.write();
   * ```
   */
  export class ConfigFile<
    T extends ConfigFile.Options = ConfigFile.Options,
    P extends ConfigContents = ConfigContents
  > extends BaseConfigStore<T, P> {
    protected hasRead: boolean;
    protected logger: Logger;
    private path;
    /**
     * Create an instance of a config file without reading the file. Call `read` or `readSync`
     * after creating the ConfigFile OR instantiate with {@link ConfigFile.create} instead.
     *
     * @param options The options for the class instance
     * @ignore
     */
    constructor(options?: T);
    /**
     * Returns the config's filename.
     */
    static getFileName(): string;
    /**
     * Returns the default options for the config file.
     *
     * @param isGlobal If the file should be stored globally or locally.
     * @param filename The name of the config file.
     */
    static getDefaultOptions(isGlobal?: boolean, filename?: string): ConfigFile.Options;
    /**
     * Helper used to determine what the local and global folder point to. Returns the file path of the root folder.
     *
     * @param isGlobal True if the config should be global. False for local.
     */
    static resolveRootFolder(isGlobal: boolean): Promise<string>;
    /**
     * Helper used to determine what the local and global folder point to. Returns the file path of the root folder.
     *
     * @param isGlobal True if the config should be global. False for local.
     */
    static resolveRootFolderSync(isGlobal: boolean): string;
    /**
     * Determines if the config file is read/write accessible. Returns `true` if the user has capabilities specified
     * by perm.
     *
     * @param {number} perm The permission.
     *
     * **See** {@link https://nodejs.org/dist/latest/docs/api/fs.html#fs_fs_access_path_mode_callback}
     */
    access(perm?: number): Promise<boolean>;
    /**
     * Determines if the config file is read/write accessible. Returns `true` if the user has capabilities specified
     * by perm.
     *
     * @param {number} perm The permission.
     *
     * **See** {@link https://nodejs.org/dist/latest/docs/api/fs.html#fs_fs_access_path_mode_callback}
     */
    accessSync(perm?: number): boolean;
    /**
     * Read the config file and set the config contents. Returns the config contents of the config file. As an
     * optimization, files are only read once per process and updated in memory and via `write()`. To force
     * a read from the filesystem pass `force=true`.
     * **Throws** *{@link SfError}{ name: 'UnexpectedJsonFileFormat' }* There was a problem reading or parsing the file.
     *
     * @param [throwOnNotFound = false] Optionally indicate if a throw should occur on file read.
     * @param [force = false] Optionally force the file to be read from disk even when already read within the process.
     */
    read(throwOnNotFound?: boolean, force?: boolean): Promise<P>;
    /**
     * Read the config file and set the config contents. Returns the config contents of the config file. As an
     * optimization, files are only read once per process and updated in memory and via `write()`. To force
     * a read from the filesystem pass `force=true`.
     * **Throws** *{@link SfError}{ name: 'UnexpectedJsonFileFormat' }* There was a problem reading or parsing the file.
     *
     * @param [throwOnNotFound = false] Optionally indicate if a throw should occur on file read.
     * @param [force = false] Optionally force the file to be read from disk even when already read within the process.
     */
    readSync(throwOnNotFound?: boolean, force?: boolean): P;
    /**
     * Write the config file with new contents. If no new contents are provided it will write the existing config
     * contents that were set from {@link ConfigFile.read}, or an empty file if {@link ConfigFile.read} was not called.
     *
     * @param newContents The new contents of the file.
     */
    write(): Promise<P>;
    /**
     * Write the config file with new contents. If no new contents are provided it will write the existing config
     * contents that were set from {@link ConfigFile.read}, or an empty file if {@link ConfigFile.read} was not called.
     *
     * @param newContents The new contents of the file.
     */
    writeSync(): P;
    /**
     * Check to see if the config file exists. Returns `true` if the config file exists and has access, false otherwise.
     */
    exists(): Promise<boolean>;
    /**
     * Check to see if the config file exists. Returns `true` if the config file exists and has access, false otherwise.
     */
    existsSync(): boolean;
    /**
     * Get the stats of the file. Returns the stats of the file.
     *
     * {@link fs.stat}
     */
    stat(): Promise<fsStats>;
    /**
     * Get the stats of the file. Returns the stats of the file.
     *
     * {@link fs.stat}
     */
    statSync(): fsStats;
    /**
     * Delete the config file if it exists.
     *
     * **Throws** *`Error`{ name: 'TargetFileNotFound' }* If the {@link ConfigFile.getFilename} file is not found.
     * {@link fs.unlink}
     */
    unlink(): Promise<void>;
    /**
     * Delete the config file if it exists.
     *
     * **Throws** *`Error`{ name: 'TargetFileNotFound' }* If the {@link ConfigFile.getFilename} file is not found.
     * {@link fs.unlink}
     */
    unlinkSync(): void;
    /**
     * Returns the absolute path to the config file.
     *
     * The first time getPath is called, the path is resolved and becomes immutable. This allows implementers to
     * override options properties, like filePath, on the init method for async creation. If that is required for
     * creation, the config files can not be synchronously created.
     */
    getPath(): string;
    /**
     * Returns `true` if this config is using the global path, `false` otherwise.
     */
    isGlobal(): boolean;
    /**
     * Used to initialize asynchronous components.
     *
     * **Throws** *`Error`{ code: 'ENOENT' }* If the {@link ConfigFile.getFilename} file is not found when
     * options.throwOnNotFound is true.
     */
    protected init(): Promise<void>;
    private logAndMergeContents;
    private handleWriteError;
  }
  export namespace ConfigFile {
    /**
     * The interface for Config options.
     */
    type Options = {
      /**
       * The root folder where the config file is stored.
       */
      rootFolder?: string;
      /**
       * The state folder where the config file is stored.
       */
      stateFolder?: string;
      /**
       * The file name.
       */
      filename?: string;
      /**
       * If the file is in the global or project directory.
       */
      isGlobal?: boolean;
      /**
       * If the file is in the state folder or no (.sfdx).
       */
      isState?: boolean;
      /**
       * The full file path where the config file is stored.
       */
      filePath?: string;
      /**
       * Indicates if init should throw if the corresponding config file is not found.
       */
      throwOnNotFound?: boolean;
    } & BaseConfigStore.Options;
  }
}
declare module '@salesforce/core/config/configStackTypes' {
  import { Dictionary, AnyJson } from '@salesforce/ts-types';
  export type Key<P extends ConfigContents> = Extract<keyof P, string>;
  /**
   * The allowed types stored in a config store.
   */
  export type ConfigValue = AnyJson;
  /**
   * The type of entries in a config store defined by the key and value type of {@link ConfigContents}.
   */
  export type ConfigEntry = [string, ConfigValue];
  /**
   * The type of content a config stores.
   */
  export type ConfigContents<T = ConfigValue> = Dictionary<T>;
}
declare module '@salesforce/core/config/configStore' {
  import { AsyncOptionalCreatable } from '@salesforce/kit';
  import { JsonMap, Optional } from '@salesforce/ts-types';
  import { Crypto } from '@salesforce/core/crypto/crypto';
  import { LWWMap } from '@salesforce/core/config/lwwMap';
  import { ConfigContents, ConfigEntry, ConfigValue, Key } from '@salesforce/core/config/configStackTypes';
  /**
   * An interface for a config object with a persistent store.
   */
  export type ConfigStore<P extends ConfigContents = ConfigContents> = {
    entries(): ConfigEntry[];
    get<K extends Key<P>>(key: K, decrypt: boolean): P[K];
    get<T extends ConfigValue>(key: string, decrypt: boolean): T;
    getKeysByValue(value: ConfigValue): Array<Key<P>>;
    has(key: string): boolean;
    keys(): Array<Key<P>>;
    set<K extends Key<P>>(key: K, value: P[K]): void;
    set<T extends ConfigValue>(key: string, value: T): void;
    update<K extends Key<P>>(key: K, value: Partial<P[K]>): void;
    update<T extends ConfigValue>(key: string, value: Partial<T>): void;
    unset(key: string): boolean;
    unsetAll(keys: string[]): boolean;
    clear(): void;
    values(): ConfigValue[];
    forEach(actionFn: (key: string, value: ConfigValue) => void): void;
    getContents(): P;
  };
  /**
   * An abstract class that implements all the config management functions but
   * none of the storage functions.
   *
   * **Note:** To see the interface, look in typescripts autocomplete help or the npm package's ConfigStore.d.ts file.
   */
  export abstract class BaseConfigStore<
      T extends BaseConfigStore.Options = BaseConfigStore.Options,
      P extends ConfigContents = ConfigContents
    >
    extends AsyncOptionalCreatable<T>
    implements ConfigStore<P>
  {
    protected static encryptedKeys: Array<string | RegExp>;
    protected options: T;
    protected crypto?: Crypto;
    protected contents: LWWMap<P>;
    private statics;
    /**
     * Constructor.
     *
     * @param options The options for the class instance.
     * @ignore
     */
    constructor(options?: T);
    /**
     * Returns an array of {@link ConfigEntry} for each element in the config.
     */
    entries(): ConfigEntry[];
    /**
     * Returns the value associated to the key, or undefined if there is none.
     *
     * @param key The key (object property)
     * @param decrypt If it is an encrypted key, decrypt the value.
     * If the value is an object, a clone will be returned.
     */
    get<K extends Key<P>>(key: K, decrypt?: boolean): P[K];
    get<V = ConfigValue>(key: string, decrypt?: boolean): V;
    /**
     * Returns the list of keys that contain a value.
     *
     * @param value The value to filter keys on.
     */
    getKeysByValue(value: ConfigValue): Array<Key<P>>;
    /**
     * Returns a boolean asserting whether a value has been associated to the key in the config object or not.
     *
     */
    has(key: string): boolean;
    /**
     * Returns an array that contains the keys for each element in the config object.
     */
    keys(): Array<Key<P>>;
    /**
     * Sets the value for the key in the config object. This will override the existing value.
     * To do a partial update, use {@link BaseConfigStore.update}.
     *
     * @param key The key.
     * @param value The value.
     */
    set<K extends Key<P>>(key: K, value: P[K]): void;
    /**
     * Updates the value for the key in the config object. If the value is an object, it
     * will be merged with the existing object.
     *
     * @param key The key.
     * @param value The value.
     */
    update<K extends Key<P>>(key: K, value: Partial<P[K]>): void;
    /**
     * Returns `true` if an element in the config object existed and has been removed, or `false` if the element does not
     * exist. {@link BaseConfigStore.has} will return false afterwards.
     *
     * @param key The key
     */
    unset<K extends Key<P>>(key: K): boolean;
    /**
     * Returns `true` if all elements in the config object existed and have been removed, or `false` if all the elements
     * do not exist (some may have been removed). {@link BaseConfigStore.has(key)} will return false afterwards.
     *
     * @param keys The keys
     */
    unsetAll(keys: Array<Key<P>>): boolean;
    /**
     * Removes all key/value pairs from the config object.
     */
    clear(): void;
    /**
     * Returns an array that contains the values for each element in the config object.
     */
    values(): ConfigValue[];
    /**
     * Returns the entire config contents.
     *
     * *NOTE:* Data will still be encrypted unless decrypt is passed in. A clone of
     * the data will be returned to prevent storing un-encrypted data in memory and
     * potentially saving to the file system.
     *
     * @param decrypt: decrypt all data in the config. A clone of the data will be returned.
     *
     */
    getContents(decrypt?: boolean): Readonly<P>;
    /**
     * Invokes `actionFn` once for each key-value pair present in the config object.
     *
     * @param {function} actionFn The function `(key: string, value: ConfigValue) => void` to be called for each element.
     */
    forEach(actionFn: (key: string, value: ConfigValue) => void): void;
    /**
     * Convert the config object to a JSON object. Returns the config contents.
     * Same as calling {@link ConfigStore.getContents}
     */
    toObject(): JsonMap;
    /**
     * Convert an object to a {@link ConfigContents} and set it as the config contents.
     *
     * @param obj The object.
     */
    setContentsFromObject(obj: P): void;
    /**
     * Keep ConfigFile concurrency-friendly.
     * Avoid using this unless you're reading the file for the first time
     * and guaranteed to no be cross-saving existing contents
     * */
    protected setContentsFromFileContents(contents: P, timestamp?: bigint): void;
    /**
     * Sets the entire config contents.
     *
     * @param contents The contents.
     */
    protected setContents(contents?: P): void;
    protected getEncryptedKeys(): Array<string | RegExp>;
    /**
     * This config file has encrypted keys and it should attempt to encrypt them.
     *
     * @returns Has encrypted keys
     */
    protected hasEncryption(): boolean;
    protected initialContents(): P;
    /**
     * Used to initialize asynchronous components.
     */
    protected init(): Promise<void>;
    /**
     * Initialize the crypto dependency.
     */
    protected initCrypto(): Promise<void>;
    /**
     * Closes the crypto dependency. Crypto should be close after it's used and no longer needed.
     */
    protected clearCrypto(): Promise<void>;
    /**
     * Should the given key be encrypted on set methods and decrypted on get methods.
     *
     * @param key The key. Supports query key like `a.b[0]`.
     * @returns Should encrypt/decrypt
     */
    protected isCryptoKey(key: string): string | RegExp | undefined;
    protected encrypt(value: unknown): Optional<string>;
    protected decrypt(value: unknown): string | undefined;
    /**
     * Encrypt all values in a nested JsonMap.
     *
     * @param keyPaths: The complete path of the (nested) data
     * @param data: The current (nested) data being worked on.
     */
    protected recursiveEncrypt<J extends JsonMap>(data: J, parentKey?: string): J;
    /**
     * Decrypt all values in a nested JsonMap.
     *
     * @param keyPaths: The complete path of the (nested) data
     * @param data: The current (nested) data being worked on.
     */
    protected recursiveDecrypt(data: JsonMap, parentKey?: string): JsonMap;
    /**
     * Encrypt/Decrypt all values in a nested JsonMap.
     *
     * @param keyPaths: The complete path of the (nested) data
     * @param data: The current (nested) data being worked on.
     */
    private recursiveCrypto;
  }
  /**
   * @ignore
   */
  export namespace BaseConfigStore {
    /**
     * Options for the config store.
     */
    type Options = {
      /**
       * Keys to encrypt.
       *
       * The preferred way to set encrypted keys is to use {@link BaseConfigStore.encryptedKeys}
       * so they are constant for all instances of a Config class. However, this is useful for
       * instantiating subclasses of ConfigStore on the fly (like {@link ConfigFile}) without
       * defining a new class.
       */
      encryptedKeys?: Array<string | RegExp>;
    };
  }
}
declare module '@salesforce/core/config/envVars' {
  /// <reference types="node" />
  import { Dictionary, Nullable } from '@salesforce/ts-types';
  import { Env } from '@salesforce/kit';
  export enum EnvironmentVariable {
    'FORCE_OPEN_URL' = 'FORCE_OPEN_URL',
    'FORCE_SHOW_SPINNER' = 'FORCE_SHOW_SPINNER',
    'FORCE_SPINNER_DELAY' = 'FORCE_SPINNER_DELAY',
    'HTTP_PROXY' = 'HTTP_PROXY',
    'HTTPS_PROXY' = 'HTTPS_PROXY',
    'NODE_EXTRA_CA_CERTS' = 'NODE_EXTRA_CA_CERTS',
    'NODE_TLS_REJECT_UNAUTHORIZED' = 'NODE_TLS_REJECT_UNAUTHORIZED',
    'SFDX_ACCESS_TOKEN' = 'SFDX_ACCESS_TOKEN',
    'SFDX_API_VERSION' = 'SFDX_API_VERSION',
    'SFDX_AUDIENCE_URL' = 'SFDX_AUDIENCE_URL',
    'SFDX_CONTENT_TYPE' = 'SFDX_CONTENT_TYPE',
    'SFDX_DEFAULTDEVHUBUSERNAME' = 'SFDX_DEFAULTDEVHUBUSERNAME',
    'SFDX_DEFAULTUSERNAME' = 'SFDX_DEFAULTUSERNAME',
    'SFDX_DISABLE_AUTOUPDATE' = 'SFDX_DISABLE_AUTOUPDATE',
    'SFDX_AUTOUPDATE_DISABLE' = 'SFDX_AUTOUPDATE_DISABLE',
    'SFDX_DISABLE_SOURCE_MEMBER_POLLING' = 'SFDX_DISABLE_SOURCE_MEMBER_POLLING',
    'SFDX_DISABLE_TELEMETRY' = 'SFDX_DISABLE_TELEMETRY',
    'SFDX_DNS_TIMEOUT' = 'SFDX_DNS_TIMEOUT',
    'SFDX_DOMAIN_RETRY' = 'SFDX_DOMAIN_RETRY',
    'SFDX_IMPROVED_CODE_COVERAGE' = 'SFDX_IMPROVED_CODE_COVERAGE',
    'SFDX_INSTANCE_URL' = 'SFDX_INSTANCE_URL',
    'SFDX_JSON_TO_STDOUT' = 'SFDX_JSON_TO_STDOUT',
    'SFDX_DISABLE_LOG_FILE' = 'SFDX_DISABLE_LOG_FILE',
    'SFDX_LOG_LEVEL' = 'SFDX_LOG_LEVEL',
    'SFDX_LOG_ROTATION_COUNT' = 'SFDX_LOG_ROTATION_COUNT',
    'SFDX_LOG_ROTATION_PERIOD' = 'SFDX_LOG_ROTATION_PERIOD',
    'SFDX_MAX_QUERY_LIMIT' = 'SFDX_MAX_QUERY_LIMIT',
    'SFDX_MDAPI_TEMP_DIR' = 'SFDX_MDAPI_TEMP_DIR',
    'SFDX_NPM_REGISTRY' = 'SFDX_NPM_REGISTRY',
    'SFDX_PRECOMPILE_ENABLE' = 'SFDX_PRECOMPILE_ENABLE',
    'SFDX_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE' = 'SFDX_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE',
    'SFDX_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_VERSION_CREATE' = 'SFDX_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_VERSION_CREATE',
    'SFDX_REST_DEPLOY' = 'SFDX_REST_DEPLOY',
    'SFDX_SOURCE_MEMBER_POLLING_TIMEOUT' = 'SFDX_SOURCE_MEMBER_POLLING_TIMEOUT',
    'SFDX_USE_GENERIC_UNIX_KEYCHAIN' = 'SFDX_USE_GENERIC_UNIX_KEYCHAIN',
    'SFDX_USE_PROGRESS_BAR' = 'SFDX_USE_PROGRESS_BAR',
    'SFDX_LAZY_LOAD_MODULES' = 'SFDX_LAZY_LOAD_MODULES',
    'SFDX_S3_HOST' = 'SFDX_S3_HOST',
    'SFDX_UPDATE_INSTRUCTIONS' = 'SFDX_UPDATE_INSTRUCTIONS',
    'SFDX_INSTALLER' = 'SFDX_INSTALLER',
    'SFDX_ENV' = 'SFDX_ENV',
    'SF_TARGET_ORG' = 'SF_TARGET_ORG',
    'SF_TARGET_DEV_HUB' = 'SF_TARGET_DEV_HUB',
    'SF_ACCESS_TOKEN' = 'SF_ACCESS_TOKEN',
    'SF_ORG_API_VERSION' = 'SF_ORG_API_VERSION',
    'SF_AUDIENCE_URL' = 'SF_AUDIENCE_URL',
    'SF_CONTENT_TYPE' = 'SF_CONTENT_TYPE',
    'SF_DISABLE_AUTOUPDATE' = 'SF_DISABLE_AUTOUPDATE',
    'SF_AUTOUPDATE_DISABLE' = 'SF_AUTOUPDATE_DISABLE',
    'SF_DISABLE_SOURCE_MEMBER_POLLING' = 'SF_DISABLE_SOURCE_MEMBER_POLLING',
    'SF_DISABLE_TELEMETRY' = 'SF_DISABLE_TELEMETRY',
    'SF_DNS_TIMEOUT' = 'SF_DNS_TIMEOUT',
    'SF_DOMAIN_RETRY' = 'SF_DOMAIN_RETRY',
    'SF_IMPROVED_CODE_COVERAGE' = 'SF_IMPROVED_CODE_COVERAGE',
    'SF_ORG_INSTANCE_URL' = 'SF_ORG_INSTANCE_URL',
    'SF_JSON_TO_STDOUT' = 'SF_JSON_TO_STDOUT',
    'SF_DISABLE_LOG_FILE' = 'SF_DISABLE_LOG_FILE',
    'SF_LOG_LEVEL' = 'SF_LOG_LEVEL',
    'SF_LOG_ROTATION_COUNT' = 'SF_LOG_ROTATION_COUNT',
    'SF_LOG_ROTATION_PERIOD' = 'SF_LOG_ROTATION_PERIOD',
    'SF_ORG_MAX_QUERY_LIMIT' = 'SF_ORG_MAX_QUERY_LIMIT',
    'SF_MDAPI_TEMP_DIR' = 'SF_MDAPI_TEMP_DIR',
    'SF_NPM_REGISTRY' = 'SF_NPM_REGISTRY',
    'SF_PRECOMPILE_ENABLE' = 'SF_PRECOMPILE_ENABLE',
    'SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE' = 'SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE',
    'SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_VERSION_CREATE' = 'SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_VERSION_CREATE',
    'SF_SOURCE_MEMBER_POLLING_TIMEOUT' = 'SF_SOURCE_MEMBER_POLLING_TIMEOUT',
    'SF_USE_GENERIC_UNIX_KEYCHAIN' = 'SF_USE_GENERIC_UNIX_KEYCHAIN',
    'SF_USE_PROGRESS_BAR' = 'SF_USE_PROGRESS_BAR',
    'SF_LAZY_LOAD_MODULES' = 'SF_LAZY_LOAD_MODULES',
    'SF_S3_HOST' = 'SF_S3_HOST',
    'SF_UPDATE_INSTRUCTIONS' = 'SF_UPDATE_INSTRUCTIONS',
    'SF_INSTALLER' = 'SF_INSTALLER',
    'SF_ENV' = 'SF_ENV',
    'SF_CAPITALIZE_RECORD_TYPES' = 'SF_CAPITALIZE_RECORD_TYPES',
  }
  type EnvMetaData = {
    description: string;
    /** the env has been renamed.  synonymOf points to the new env */
    synonymOf: Nullable<string>;
  };
  type EnvType = {
    [key in EnvironmentVariable]: EnvMetaData;
  };
  export const SUPPORTED_ENV_VARS: EnvType;
  export class EnvVars extends Env {
    constructor(env?: NodeJS.ProcessEnv);
    static propertyToEnvName(property: string, prefix?: string): string;
    private static defaultPrefix;
    getPropertyFromEnv<T>(property: string, prefix?: string): Nullable<T>;
    asDictionary(): Dictionary<unknown>;
    asMap(): Map<string, unknown>;
    private resolve;
    private get;
  }
  export const envVars: EnvVars;
  export {};
}
declare module '@salesforce/core/config/lwwMap' {
  import { LWWRegister } from '@salesforce/core/config/lwwRegister';
  import { ConfigContents, Key } from '@salesforce/core/config/configStackTypes';
  export const SYMBOL_FOR_DELETED: 'UNIQUE_IDENTIFIER_FOR_DELETED';
  export type LWWState<P> = {
    [Property in keyof P]: LWWRegister<P[Property] | typeof SYMBOL_FOR_DELETED>['state'];
  };
  /**
   * @param contents object aligning with ConfigContents
   * @param timestamp a bigInt that sets the timestamp.  Defaults to the current time
   * construct a LWWState from an object
   * @param keysToCheckForDeletion if a key is in this array, AND not in the contents, it will be marked as deleted
   * */
  export const stateFromContents: <P extends ConfigContents>(contents: P, timestamp?: bigint) => LWWState<P>;
  export class LWWMap<P extends ConfigContents> {
    #private;
    constructor(state?: LWWState<P>);
    get value(): P;
    get state(): LWWState<P>;
    merge(state: LWWState<P>): LWWState<P>;
    set<K extends Key<P>>(key: K, value: P[K]): void;
    get<K extends Key<P>>(key: K): P[K] | undefined;
    delete<K extends Key<P>>(key: K): void;
    has(key: string): boolean;
  }
}
declare module '@salesforce/core/config/lwwRegister' {
  type LWWRegisterState<T> = {
    timestamp: bigint;
    value: T;
  };
  /** a CRDT implementation.  Uses timestamps to resolve conflicts when updating the value (last write wins)
   * mostly based on https://jakelazaroff.com/words/an-interactive-intro-to-crdts/
   *
   * @param T the type of the value stored in the register
   */
  export class LWWRegister<T> {
    state: LWWRegisterState<T>;
    constructor(state: LWWRegisterState<T>);
    get value(): T;
    get timestamp(): bigint;
    set(value: T): void;
    merge(incoming: LWWRegisterState<T>): LWWRegisterState<T>;
  }
  export {};
}
declare module '@salesforce/core/config/orgUsersConfig' {
  import { ConfigFile } from '@salesforce/core/config/configFile';
  type UserConfig = {
    usernames: string[];
  };
  /**
   * A config file that stores usernames for an org.
   */
  export class OrgUsersConfig extends ConfigFile<OrgUsersConfig.Options, UserConfig> {
    /**
     * Constructor.
     * **Do not directly construct instances of this class -- use {@link OrgUsersConfig.create} instead.**
     *
     * @param options The options for the class instance
     * @ignore
     */
    constructor(options?: OrgUsersConfig.Options);
    /**
     * Gets the config options for a given org ID.
     *
     * @param orgId The orgId. Generally this org would have multiple users configured.
     */
    static getOptions(orgId: string): OrgUsersConfig.Options;
  }
  export namespace OrgUsersConfig {
    /**
     * The config file options.
     */
    type Options = {
      /**
       * The org id associated with this user.
       */
      orgId: string;
    } & ConfigFile.Options;
  }
  export {};
}
declare module '@salesforce/core/config/sandboxOrgConfig' {
  import { ConfigFile } from '@salesforce/core/config/configFile';
  /**
   * A config file that stores usernames for an org.
   */
  export class SandboxOrgConfig extends ConfigFile<SandboxOrgConfig.Options> {
    /**
     * Constructor.
     * **Do not directly construct instances of this class -- use {@link SandboxConfig.create} instead.**
     *
     * @param options The options for the class instance
     * @ignore
     */
    constructor(options?: SandboxOrgConfig.Options);
    /**
     * Gets the config options for a given org ID.
     *
     * @param orgId The orgId. Generally this org would have multiple users configured.
     */
    static getOptions(orgId: string): SandboxOrgConfig.Options;
  }
  export namespace SandboxOrgConfig {
    /**
     * The config file options.
     */
    type Options = {
      /**
       * The org id associated with this sandbox.
       */
      orgId: string;
    } & ConfigFile.Options;
    enum Fields {
      /**
       * The username of the user who created the sandbox.
       */
      PROD_ORG_USERNAME = 'prodOrgUsername',
    }
  }
}
declare module '@salesforce/core/config/sandboxProcessCache' {
  import { SandboxProcessObject, SandboxRequest } from '@salesforce/core/org/org';
  import { TTLConfig } from '@salesforce/core/config/ttlConfig';
  export type SandboxRequestCacheEntry = {
    alias?: string;
    setDefault?: boolean;
    prodOrgUsername: string;
    action: 'Create' | 'Refresh';
    sandboxProcessObject: Partial<SandboxProcessObject>;
    sandboxRequest: Partial<SandboxRequest>;
    tracksSource?: boolean;
  };
  export class SandboxRequestCache extends TTLConfig<TTLConfig.Options, SandboxRequestCacheEntry> {
    static getDefaultOptions(): TTLConfig.Options;
    static unset(key: string): Promise<void>;
    static set(key: string, sandboxProcessObject: SandboxRequestCacheEntry): Promise<void>;
    static getFileName(): string;
  }
}
declare module '@salesforce/core/config/ttlConfig' {
  import { Duration } from '@salesforce/kit';
  import { JsonMap, Nullable } from '@salesforce/ts-types';
  import { ConfigFile } from '@salesforce/core/config/configFile';
  /**
   * A Time To Live configuration file where each entry is timestamped and removed once the TTL has expired.
   *
   * @example
   * ```
   * import { Duration } from '@salesforce/kit';
   * const config = await TTLConfig.create({
   *   isGlobal: false,
   *   ttl: Duration.days(1)
   * });
   * ```
   */
  export class TTLConfig<T extends TTLConfig.Options, P extends JsonMap> extends ConfigFile<T, TTLConfig.Contents<P>> {
    set(key: string, value: Partial<TTLConfig.Entry<P>>): void;
    getLatestEntry(): Nullable<[string, TTLConfig.Entry<P>]>;
    getLatestKey(): Nullable<string>;
    isExpired(
      dateTime: number,
      value: P & {
        timestamp: string;
      }
    ): boolean;
    protected init(): Promise<void>;
    private timestamp;
  }
  export namespace TTLConfig {
    type Options = ConfigFile.Options & {
      ttl: Duration;
    };
    type Entry<T extends JsonMap> = T & {
      timestamp: string;
    };
    type Contents<T extends JsonMap> = Record<string, Entry<T>>;
  }
}
declare module '@salesforce/core/crypto/crypto' {
  import { AsyncOptionalCreatable } from '@salesforce/kit';
  import { KeyChain } from '@salesforce/core/crypto/keyChainImpl';
  type CryptoOptions = {
    keychain?: KeyChain;
    platform?: string;
    retryStatus?: string;
    noResetOnClose?: boolean;
  };
  /**
   * Class for managing encrypting and decrypting private auth information.
   */
  export class Crypto extends AsyncOptionalCreatable<CryptoOptions> {
    private key;
    private options;
    private noResetOnClose;
    /**
     * Constructor
     * **Do not directly construct instances of this class -- use {@link Crypto.create} instead.**
     *
     * @param options The options for the class instance.
     * @ignore
     */
    constructor(options?: CryptoOptions);
    private static unsetCryptoVersion;
    /**
     * Encrypts text. Returns the encrypted string or undefined if no string was passed.
     *
     * @param text The text to encrypt.
     */
    encrypt(text: string): string;
    /**
     * Decrypts text.
     *
     * @param text The text to decrypt.
     */
    decrypt(text: string): string;
    /**
     * Takes a best guess if the value provided was encrypted by {@link Crypto.encrypt} by
     * checking the delimiter, tag length, and valid characters.
     *
     * @param text The text
     * @returns true if the text is encrypted, false otherwise.
     */
    isEncrypted(text?: string): boolean;
    /**
     * Clears the crypto state. This should be called in a finally block.
     */
    close(): void;
    isV2Crypto(): boolean;
    /**
     * Initialize async components.
     */
    protected init(): Promise<void>;
    private encryptV1;
    private encryptV2;
    private decryptV1;
    private decryptV2;
    private getKeyChain;
  }
  export {};
}
declare module '@salesforce/core/crypto/keyChain' {
  import { KeyChain } from '@salesforce/core/crypto/keyChainImpl';
  /**
   * Gets the os level keychain impl.
   *
   * @param platform The os platform.
   * @ignore
   */
  export const retrieveKeychain: (platform: string) => Promise<KeyChain>;
}
declare module '@salesforce/core/crypto/keyChainImpl' {
  /// <reference types="node" />
  /// <reference types="node" />
  /// <reference types="node" />
  import * as childProcess from 'node:child_process';
  import * as nodeFs from 'node:fs';
  import { Nullable } from '@salesforce/ts-types';
  export type FsIfc = Pick<typeof nodeFs, 'statSync'>;
  /**
   * Basic keychain interface.
   */
  export type PasswordStore = {
    /**
     * Gets a password
     *
     * @param opts cli level password options.
     * @param fn function callback for password.
     * @param retryCount number of reties to get the password.
     */
    getPassword(
      opts: ProgramOpts,
      fn: (error: Nullable<Error>, password?: string) => void,
      retryCount?: number
    ): Promise<void>;
    /**
     * Sets a password.
     *
     * @param opts cli level password options.
     * @param fn function callback for password.
     */
    setPassword(opts: ProgramOpts, fn: (error: Nullable<Error>, contents?: SecretContents) => void): Promise<void>;
  };
  /**
   * @private
   */
  export class KeychainAccess implements PasswordStore {
    private osImpl;
    private fsIfc;
    /**
     * Abstract prototype for general cross platform keychain interaction.
     *
     * @param osImpl The platform impl for (linux, darwin, windows).
     * @param fsIfc The file system interface.
     */
    constructor(osImpl: OsImpl, fsIfc: FsIfc);
    /**
     * Validates the os level program is executable.
     */
    validateProgram(): Promise<void>;
    /**
     * Returns a password using the native program for credential management.
     *
     * @param opts Options for the credential lookup.
     * @param fn Callback function (err, password).
     * @param retryCount Used internally to track the number of retries for getting a password out of the keychain.
     */
    getPassword(
      opts: ProgramOpts,
      fn: (error: Nullable<Error>, password?: string) => void,
      retryCount?: number
    ): Promise<void>;
    /**
     * Sets a password using the native program for credential management.
     *
     * @param opts Options for the credential lookup.
     * @param fn Callback function (err, ConfigContents).
     */
    setPassword(opts: ProgramOpts, fn: (error: Nullable<Error>, contents?: SecretContents) => void): Promise<void>;
  }
  type ProgramOpts = {
    account: string;
    service: string;
    password?: string;
  };
  type OsImpl = {
    getProgram(): string;
    getProgramOptions(opts: ProgramOpts): string[];
    getCommandFunc(
      opts: ProgramOpts,
      fn: (program: string, opts: string[]) => childProcess.ChildProcess
    ): childProcess.ChildProcess;
    onGetCommandClose(
      code: number,
      stdout: string,
      stderr: string,
      opts: ProgramOpts,
      fn: (err: Nullable<Error>, result?: string) => void
    ): Promise<void>;
    setProgramOptions(opts: ProgramOpts): string[];
    setCommandFunc(
      opts: ProgramOpts,
      fn: (program: string, opts: string[]) => childProcess.ChildProcess
    ): childProcess.ChildProcess;
    onSetCommandClose(
      code: number,
      stdout: string,
      stderr: string,
      opts: ProgramOpts,
      fn: (err: Nullable<Error>) => void
    ): Promise<void>;
  };
  enum SecretField {
    SERVICE = 'service',
    ACCOUNT = 'account',
    KEY = 'key',
  }
  type SecretContents = {
    [SecretField.ACCOUNT]: string;
    [SecretField.KEY]?: string;
    [SecretField.SERVICE]: string;
  };
  /**
   * @@ignore
   */
  export class GenericKeychainAccess implements PasswordStore {
    getPassword(opts: ProgramOpts, fn: (error: Nullable<Error>, password?: string) => void): Promise<void>;
    setPassword(opts: ProgramOpts, fn: (error: Nullable<Error>, contents?: SecretContents) => void): Promise<void>;
    protected isValidFileAccess(cb: (error: Nullable<NodeJS.ErrnoException>) => Promise<void>): Promise<void>;
  }
  /**
   * @ignore
   */
  export class GenericUnixKeychainAccess extends GenericKeychainAccess {
    protected isValidFileAccess(cb: (error: Nullable<Error>) => Promise<void>): Promise<void>;
  }
  /**
   * @ignore
   */
  export class GenericWindowsKeychainAccess extends GenericKeychainAccess {
    protected isValidFileAccess(cb: (error: Nullable<Error>) => Promise<void>): Promise<void>;
  }
  /**
   * @ignore
   */
  export const keyChainImpl: {
    generic_unix: GenericUnixKeychainAccess;
    generic_windows: GenericWindowsKeychainAccess;
    darwin: KeychainAccess;
    linux: KeychainAccess;
    validateProgram: (
      programPath: string,
      fsIfc: FsIfc,
      isExeIfc: (mode: number, gid: number, uid: number) => boolean
    ) => Promise<void>;
  };
  export type KeyChain = GenericUnixKeychainAccess | GenericWindowsKeychainAccess | KeychainAccess;
  export {};
}
declare module '@salesforce/core/crypto/secureBuffer' {
  /// <reference types="node" />
  import { Optional } from '@salesforce/ts-types';
  /**
   * Returns the intended type of the object to return. This is implementation specific.
   *
   * @param buffer A buffer containing the decrypted secret.
   */
  export type DecipherCallback<T> = (buffer: Buffer) => T;
  /**
   * Used to store and retrieve a sensitive information in memory. This is not meant for at rest encryption.
   *
   * ```
   * const sString: SecureBuffer<string> = new SecureBuffer();
   * sString.consume(secretTextBuffer);
   * const value: string = sString.value((buffer: Buffer): string => {
   *     const password: string = buffer.toString('utf8');
   *     // doSomething with the password
   *     // returns something of type <T>
   *     return testReturnValue;
   * });
   * ```
   */
  export class SecureBuffer<T> {
    private key;
    private iv;
    private secret?;
    /**
     * Invokes a callback with a decrypted version of the buffer.
     *
     * @param cb The callback containing the decrypted buffer parameter that returns a desired.
     * typed object. It's important to understand that once the callback goes out of scope the buffer parameters is
     * overwritten with random data. Do not make a copy of this buffer and persist it!
     */
    value(cb: DecipherCallback<T>): Optional<T>;
    /**
     * Overwrites the value of the encrypted secret with random data.
     */
    clear(): void;
    /**
     * Consumes a buffer of data that's intended to be secret.
     *
     * @param buffer Data to encrypt. The input buffer is overwritten with random data after it's encrypted
     * and assigned internally.
     */
    consume(buffer: Buffer): void;
  }
}
declare module '@salesforce/core/deviceOauthService' {
  import { AsyncCreatable } from '@salesforce/kit';
  import { OAuth2Config } from '@jsforce/jsforce-node';
  import { JsonMap, Nullable } from '@salesforce/ts-types';
  import { AuthInfo } from '@salesforce/core/org/authInfo';
  export type DeviceCodeResponse = {
    device_code: string;
    interval: number;
    user_code: string;
    verification_uri: string;
  } & JsonMap;
  export type DeviceCodePollingResponse = {
    access_token: string;
    refresh_token: string;
    signature: string;
    scope: string;
    instance_url: string;
    id: string;
    token_type: string;
    issued_at: string;
  } & JsonMap;
  /**
   * Handles device based login flows
   *
   * Usage:
   * ```
   * const oauthConfig = {
   *   loginUrl: this.flags.instanceurl,
   *   clientId: this.flags.clientid,
   * };
   * const deviceOauthService = await DeviceOauthService.create(oauthConfig);
   * const loginData = await deviceOauthService.requestDeviceLogin();
   * console.log(loginData);
   * const approval = await deviceOauthService.awaitDeviceApproval(loginData);
   * const authInfo = await deviceOauthService.authorizeAndSave(approval);
   * ```
   */
  export class DeviceOauthService extends AsyncCreatable<OAuth2Config> {
    static RESPONSE_TYPE: string;
    static GRANT_TYPE: string;
    static SCOPE: string;
    private static POLLING_COUNT_MAX;
    private logger;
    private options;
    private pollingCount;
    constructor(options: OAuth2Config);
    /**
     * Begin the authorization flow by requesting the login
     *
     * @returns {Promise<DeviceCodeResponse>}
     */
    requestDeviceLogin(): Promise<DeviceCodeResponse>;
    /**
     * Polls the server until successful response OR max attempts have been made
     *
     * @returns {Promise<Nullable<DeviceCodePollingResponse>>}
     */
    awaitDeviceApproval(loginData: DeviceCodeResponse): Promise<Nullable<DeviceCodePollingResponse>>;
    /**
     * Creates and saves new AuthInfo
     *
     * @returns {Promise<AuthInfo>}
     */
    authorizeAndSave(approval: DeviceCodePollingResponse): Promise<AuthInfo>;
    protected init(): Promise<void>;
    private getLoginOptions;
    private getPollingOptions;
    private getDeviceFlowRequestUrl;
    private poll;
    private shouldContinuePolling;
    private pollForDeviceApproval;
  }
}
declare module '@salesforce/core/global' {
  /**
   * Represents an environment mode.  Supports `production`, `development`, `demo`, and `test`
   * with the default mode being `production`.
   *
   * To set the mode, `export SFDX_ENV=<mode>` in your current environment.
   */
  export enum Mode {
    PRODUCTION = 'production',
    DEVELOPMENT = 'development',
    DEMO = 'demo',
    TEST = 'test',
  }
  /**
   * Global constants, methods, and configuration.
   */
  export class Global {
    /**
     * Enable interoperability between `.sfdx` and `.sf`.
     *
     * When @salesforce/core@v2 is deprecated and no longer used, this can be removed.
     */
    static SFDX_INTEROPERABILITY: boolean;
    /**
     * The global folder in which sfdx state is stored.
     */
    static readonly SFDX_STATE_FOLDER = '.sfdx';
    /**
     * The global folder in which sf state is stored.
     */
    static readonly SF_STATE_FOLDER = '.sf';
    /**
     * The preferred global folder in which state is stored.
     */
    static readonly STATE_FOLDER = '.sfdx';
    /**
     * The full system path to the global sfdx state folder.
     *
     * **See** {@link Global.SFDX_STATE_FOLDER}
     */
    static get SFDX_DIR(): string;
    /**
     * The full system path to the global sf state folder.
     *
     * **See**  {@link Global.SF_STATE_FOLDER}
     */
    static get SF_DIR(): string;
    /**
     * The full system path to the preferred global state folder
     */
    static get DIR(): string;
    /**
     * Gets the current mode environment variable as a {@link Mode} instance.
     *
     * ```
     * console.log(Global.getEnvironmentMode() === Mode.PRODUCTION);
     * ```
     */
    static getEnvironmentMode(): Mode;
    /**
     * Creates a directory within {@link Global.SFDX_DIR}, or {@link Global.SFDX_DIR} itself if the `dirPath` param
     * is not provided. This is resolved or rejected when the directory creation operation has completed.
     *
     * @param dirPath The directory path to be created within {@link Global.SFDX_DIR}.
     */
    static createDir(dirPath?: string): Promise<void>;
  }
}
declare module '@salesforce/core/index' {
  export { OAuth2Config } from '@jsforce/jsforce-node';
  export { ConfigFile } from '@salesforce/core/config/configFile';
  export { TTLConfig } from '@salesforce/core/config/ttlConfig';
  export { envVars, EnvironmentVariable, SUPPORTED_ENV_VARS, EnvVars } from '@salesforce/core/config/envVars';
  export { ConfigStore } from '@salesforce/core/config/configStore';
  export { ConfigEntry, ConfigContents, ConfigValue } from '@salesforce/core/config/configStackTypes';
  export { StateAggregator } from '@salesforce/core/stateAggregator/stateAggregator';
  export {
    DeviceOauthService,
    DeviceCodeResponse,
    DeviceCodePollingResponse,
  } from '@salesforce/core/deviceOauthService';
  export { OrgUsersConfig } from '@salesforce/core/config/orgUsersConfig';
  export {
    ConfigPropertyMeta,
    ConfigPropertyMetaInput,
    Config,
    SfdxPropertyKeys,
    SfConfigProperties,
    SFDX_ALLOWED_PROPERTIES,
    SF_ALLOWED_PROPERTIES,
  } from '@salesforce/core/config/config';
  export { SandboxRequestCacheEntry, SandboxRequestCache } from '@salesforce/core/config/sandboxProcessCache';
  export { ConfigInfo, ConfigAggregator } from '@salesforce/core/config/configAggregator';
  export { AuthFields, AuthInfo, AuthSideEffects, OrgAuthorization } from '@salesforce/core/org/authInfo';
  export { AuthRemover } from '@salesforce/core/org/authRemover';
  export { Connection, SFDX_HTTP_HEADERS } from '@salesforce/core/org/connection';
  export { Mode, Global } from '@salesforce/core/global';
  export { Lifecycle } from '@salesforce/core/lifecycleEvents';
  export { WebOAuthServer } from '@salesforce/core/webOAuthServer';
  export { SfdcUrl } from '@salesforce/core/util/sfdcUrl';
  export { getJwtAudienceUrl } from '@salesforce/core/util/getJwtAudienceUrl';
  export {
    Fields,
    FieldValue,
    LoggerLevel,
    LoggerLevelValue,
    LogLine,
    LoggerOptions,
    Logger,
  } from '@salesforce/core/logger/logger';
  export { Messages, StructuredMessage } from '@salesforce/core/messages';
  export {
    Org,
    SandboxProcessObject,
    StatusEvent,
    SandboxInfo,
    SandboxEvents,
    SandboxUserAuthResponse,
    SandboxUserAuthRequest,
    SandboxRequest,
    ResumeSandboxRequest,
    OrgTypes,
    ResultEvent,
    ScratchOrgRequest,
  } from '@salesforce/core/org/org';
  export { OrgConfigProperties, ORG_CONFIG_ALLOWED_PROPERTIES } from '@salesforce/core/org/orgConfigProperties';
  export {
    PackageDir,
    NamedPackageDir,
    PackageDirDependency,
    SfProject,
    SfProjectJson,
  } from '@salesforce/core/sfProject';
  export { SchemaValidator } from '@salesforce/core/schema/validator';
  export { SfError } from '@salesforce/core/sfError';
  export { PollingClient } from '@salesforce/core/status/pollingClient';
  export {
    CometClient,
    CometSubscription,
    StreamingClient,
    StatusResult,
  } from '@salesforce/core/status/streamingClient';
  export { MyDomainResolver } from '@salesforce/core/status/myDomainResolver';
  export { DefaultUserFields, REQUIRED_FIELDS, User, UserFields } from '@salesforce/core/org/user';
  export { PermissionSetAssignment, PermissionSetAssignmentFields } from '@salesforce/core/org/permissionSetAssignment';
  export { lockInit } from '@salesforce/core/util/fileLocking';
  export {
    ScratchOrgCreateOptions,
    ScratchOrgCreateResult,
    scratchOrgCreate,
    scratchOrgResume,
  } from '@salesforce/core/org/scratchOrgCreate';
  export { ScratchOrgInfo } from '@salesforce/core/org/scratchOrgTypes';
  export {
    ScratchOrgLifecycleEvent,
    scratchOrgLifecycleEventName,
    scratchOrgLifecycleStages,
  } from '@salesforce/core/org/scratchOrgLifecycleEvents';
  export { ScratchOrgCache } from '@salesforce/core/org/scratchOrgCache';
  export { default as ScratchOrgSettingsGenerator } from '@salesforce/core/org/scratchOrgSettingsGenerator';
  export * from '@salesforce/core/util/sfdc';
  export * from '@salesforce/core/testSetup';
}
declare module '@salesforce/core/lifecycleEvents' {
  import { AnyJson } from '@salesforce/ts-types';
  type callback = (data: any) => Promise<void>;
  /**
   * An asynchronous event listener and emitter that follows the singleton pattern. The singleton pattern allows lifecycle
   * events to be emitted from deep within a library and still be consumed by any other library or tool. It allows other
   * developers to react to certain situations or events in your library without them having to manually call the method themselves.
   *
   * An example might be transforming metadata before it is deployed to an environment. As long as an event was emitted from the
   * deploy library and you were listening on that event in the same process, you could transform the metadata before the deploy
   * regardless of where in the code that metadata was initiated.
   *
   * @example
   * ```
   * // Listen for an event in a plugin hook
   * Lifecycle.getInstance().on('deploy-metadata', transformMetadata)
   *
   * // Deep in the deploy code, fire the event for all libraries and plugins to hear.
   * Lifecycle.getInstance().emit('deploy-metadata', metadataToBeDeployed);
   *
   * // if you don't need to await anything
   * use `void Lifecycle.getInstance().emit('deploy-metadata', metadataToBeDeployed)` ;
   * ```
   */
  export class Lifecycle {
    private readonly listeners;
    private readonly uniqueListeners;
    static readonly telemetryEventName = 'telemetry';
    static readonly warningEventName = 'warning';
    private logger?;
    private constructor();
    /**
     * return the package.json version of the sfdx-core library.
     */
    static staticVersion(): string;
    /**
     * Retrieve the singleton instance of this class so that all listeners and emitters can interact from any library or tool
     */
    static getInstance(): Lifecycle;
    /**
     * return the package.json version of the sfdx-core library.
     */
    version(): string;
    /**
     * Remove all listeners for a given event
     *
     * @param eventName The name of the event to remove listeners of
     */
    removeAllListeners(eventName: string): void;
    /**
     * Get an array of listeners (callback functions) for a given event
     *
     * @param eventName The name of the event to get listeners of
     */
    getListeners(eventName: string): callback[];
    /**
     * Create a listener for the `telemetry` event
     *
     * @param cb The callback function to run when the event is emitted
     */
    onTelemetry(cb: (data: Record<string, unknown>) => Promise<void>): void;
    /**
     * Create a listener for the `warning` event
     *
     * @param cb The callback function to run when the event is emitted
     */
    onWarning(cb: (warning: string) => Promise<void>): void;
    /**
     * Create a new listener for a given event
     *
     * @param eventName The name of the event that is being listened for
     * @param cb The callback function to run when the event is emitted
     * @param uniqueListenerIdentifier A unique identifier for the listener. If a listener with the same identifier is already registered, a new one will not be added
     */
    on<T = AnyJson>(eventName: string, cb: (data: T) => Promise<void>, uniqueListenerIdentifier?: string): void;
    /**
     * Emit a `telemetry` event, causing all callback functions to be run in the order they were registered
     *
     * @param data The data to emit
     */
    emitTelemetry(data: AnyJson): Promise<void>;
    /**
     * Emit a `warning` event, causing all callback functions to be run in the order they were registered
     *
     * @param data The warning (string) to emit
     */
    emitWarning(warning: string): Promise<void>;
    /**
     * Emit a given event, causing all callback functions to be run in the order they were registered
     *
     * @param eventName The name of the event to emit
     * @param data The argument to be passed to the callback function
     */
    emit<T = AnyJson>(eventName: string, data: T): Promise<void>;
  }
  export {};
}
declare module '@salesforce/core/logger/cleanup' {
  /**
   * New logger (Summer 2023) changes how file rotation works.  Each day, the logger writes to a new file
   * To get old files cleaned up, this can be called when a new root logger is instantiated
   * based on CLEAN_ODDS, it could exit OR delete some old log files
   *
   * to start this without waiting, use void cleanup()
   *
   * accepts params to override the default behavior (used to cleanup huge log file during perf tests)
   */
  export const cleanup: (maxMs?: number, force?: boolean) => Promise<void>;
  export const getOldLogFiles: (files: string[], maxMs?: number) => string[];
}
declare module '@salesforce/core/logger/filters' {
  export const HIDDEN = 'HIDDEN';
  /**
   *
   * @param args you *probably are passing this an object, but it can handle any type
   * @returns
   */
  export const filterSecrets: (...args: unknown[]) => unknown;
}
declare module '@salesforce/core/logger/logger' {
  import { Logger as PinoLogger } from 'pino';
  /**
   * The common set of `Logger` options.
   */
  export type LoggerOptions = {
    /**
     * The logger name.
     */
    name: string;
    /**
     * The desired log level.
     */
    level?: LoggerLevelValue;
    /**
     * Create a logger with the fields set
     */
    fields?: Fields;
    /** log to memory instead of to a file.  Intended for Unit Testing */
    useMemoryLogger?: boolean;
  };
  /**
   * Standard `Logger` levels.
   *
   * **See** {@link https://getpino.io/#/docs/api?id=logger-level |Logger Levels}
   */
  export enum LoggerLevel {
    TRACE = 10,
    DEBUG = 20,
    INFO = 30,
    WARN = 40,
    ERROR = 50,
    FATAL = 60,
  }
  /**
   * Any numeric `Logger` level.
   */
  export type LoggerLevelValue = LoggerLevel | number;
  /**
   * An object
   */
  export type Fields = Record<string, unknown>;
  /**
   * All possible field value types.
   */
  export type FieldValue = string | number | boolean | Fields;
  /**
   * Log line interface
   */
  export type LogLine = {
    name: string;
    hostname: string;
    pid: string;
    log: string;
    level: number;
    msg: string;
    time: string;
    v: number;
  };
  /**
   * A logging abstraction powered by {@link https://github.com/pinojs/pino | Pino} that provides both a default
   * logger configuration that will log to the default path, and a way to create custom loggers based on the same foundation.
   *
   * ```
   * // Gets the root sfdx logger
   * const logger = await Logger.root();
   *
   * // Creates a child logger of the root sfdx logger with custom fields applied
   * const childLogger = await Logger.child('myRootChild', {tag: 'value'});
   *
   * // Creates a custom logger unaffiliated with the root logger
   * const myCustomLogger = new Logger('myCustomLogger');
   *
   * // Creates a child of a custom logger unaffiliated with the root logger with custom fields applied
   * const myCustomChildLogger = myCustomLogger.child('myCustomChild', {tag: 'value'});
   *
   * // get a raw pino logger from the root instance of Logger
   * // you can use these to avoid constructing another Logger wrapper class and to get better type support
   * const logger = Logger.getRawRootLogger().child({name: 'foo', otherProp: 'bar'});
   * logger.info({some: 'stuff'}, 'a message');
   *
   *
   * // get a raw pino logger from the current instance
   * const childLogger = await Logger.child('myRootChild', {tag: 'value'});
   * const logger = childLogger.getRawLogger();
   * ```
   *
   * **See** https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_dev_cli_log_messages.htm
   */
  export class Logger {
    /**
     * The name of the root sfdx `Logger`.
     */
    static readonly ROOT_NAME = 'sf';
    /**
     * The default `LoggerLevel` when constructing new `Logger` instances.
     */
    static readonly DEFAULT_LEVEL = LoggerLevel.WARN;
    /**
     * A list of all lower case `LoggerLevel` names.
     *
     * **See** {@link LoggerLevel}
     */
    static readonly LEVEL_NAMES: string[];
    private static rootLogger?;
    private pinoLogger;
    private memoryLogger?;
    /**
     * Constructs a new `Logger`.
     *
     * @param optionsOrName A set of `LoggerOptions` or name to use with the default options.
     *
     * **Throws** *{@link SfError}{ name: 'RedundantRootLoggerError' }* More than one attempt is made to construct the root
     * `Logger`.
     */
    constructor(optionsOrName: LoggerOptions | string);
    /**
     *
     * Gets the root logger.  It's a singleton
     * See also getRawLogger if you don't need the root logger
     */
    static root(): Promise<Logger>;
    /**
     * Gets the root logger.  It's a singleton
     */
    static getRoot(): Logger;
    /**
     * Destroys the root `Logger`.
     *
     * @ignore
     */
    static destroyRoot(): void;
    /**
     * Create a child of the root logger, inheriting this instance's configuration such as `level`, transports, etc.
     *
     * @param name The name of the child logger.
     * @param fields Additional fields included in all log lines.
     */
    static child(name: string, fields?: Fields): Promise<Logger>;
    /**
     * Create a child of the root logger, inheriting this instance's configuration such as `level`, transports, etc.
     *
     * @param name The name of the child logger.
     * @param fields Additional fields included in all log lines.
     */
    static childFromRoot(name: string, fields?: Fields): Logger;
    /**
     * Gets a numeric `LoggerLevel` value by string name.
     *
     * @param {string} levelName The level name to convert to a `LoggerLevel` enum value.
     *
     * **Throws** *{@link SfError}{ name: 'UnrecognizedLoggerLevelNameError' }* The level name was not case-insensitively recognized as a valid `LoggerLevel` value.
     * @see {@Link LoggerLevel}
     */
    static getLevelByName(levelName: string): LoggerLevelValue;
    /** get the bare (pino) logger instead of using the class hierarchy */
    static getRawRootLogger(): PinoLogger;
    /** get the bare (pino) logger instead of using the class hierarchy */
    getRawLogger(): PinoLogger;
    /**
     * Gets the name of this logger.
     */
    getName(): string;
    /**
     * Gets the current level of this logger.
     */
    getLevel(): LoggerLevelValue;
    /**
     * Set the logging level of all streams for this logger.  If a specific `level` is not provided, this method will
     * attempt to read it from the environment variable `SFDX_LOG_LEVEL`, and if not found,
     * {@link Logger.DEFAULT_LOG_LEVEL} will be used instead. For convenience `this` object is returned.
     *
     * @param {LoggerLevelValue} [level] The logger level.
     *
     * **Throws** *{@link SfError}{ name: 'UnrecognizedLoggerLevelNameError' }* A value of `level` read from `SFDX_LOG_LEVEL`
     * was invalid.
     *
     * ```
     * // Sets the level from the environment or default value
     * logger.setLevel()
     *
     * // Set the level from the INFO enum
     * logger.setLevel(LoggerLevel.INFO)
     *
     * // Sets the level case-insensitively from a string value
     * logger.setLevel(Logger.getLevelByName('info'))
     * ```
     */
    setLevel(level?: LoggerLevelValue): Logger;
    /**
     * Compares the requested log level with the current log level.  Returns true if
     * the requested log level is greater than or equal to the current log level.
     *
     * @param level The requested log level to compare against the currently set log level.
     */
    shouldLog(level: LoggerLevelValue): boolean;
    /**
     * Gets an array of log line objects. Each element is an object that corresponds to a log line.
     */
    getBufferedRecords(): LogLine[];
    /**
     * Reads a text blob of all the log lines contained in memory or the log file.
     */
    readLogContentsAsText(): string;
    /**
     * Create a child logger, typically to add a few log record fields. For convenience this object is returned.
     *
     * @param name The name of the child logger that is emitted w/ log line.  Will be prefixed with the parent logger name and `:`
     * @param fields Additional fields included in all log lines for the child logger.
     */
    child(name: string, fields?: Fields): Logger;
    /**
     * Add a field to all log lines for this logger. For convenience `this` object is returned.
     *
     * @param name The name of the field to add.
     * @param value The value of the field to be logged.
     */
    addField(name: string, value: FieldValue): Logger;
    /**
     * Logs at `trace` level with filtering applied. For convenience `this` object is returned.
     *
     * @param args Any number of arguments to be logged.
     */
    trace(...args: any[]): Logger;
    /**
     * Logs at `debug` level with filtering applied. For convenience `this` object is returned.
     *
     * @param args Any number of arguments to be logged.
     */
    debug(...args: unknown[]): Logger;
    /**
     * Logs at `debug` level with filtering applied.
     *
     * @param cb A callback that returns on array objects to be logged.
     */
    debugCallback(cb: () => unknown[] | string): void;
    /**
     * Logs at `info` level with filtering applied. For convenience `this` object is returned.
     *
     * @param args Any number of arguments to be logged.
     */
    info(...args: unknown[]): Logger;
    /**
     * Logs at `warn` level with filtering applied. For convenience `this` object is returned.
     *
     * @param args Any number of arguments to be logged.
     */
    warn(...args: unknown[]): Logger;
    /**
     * Logs at `error` level with filtering applied. For convenience `this` object is returned.
     *
     * @param args Any number of arguments to be logged.
     */
    error(...args: unknown[]): Logger;
    /**
     * Logs at `fatal` level with filtering applied. For convenience `this` object is returned.
     *
     * @param args Any number of arguments to be logged.
     */
    fatal(...args: unknown[]): Logger;
  }
  export const computeLevel: (optionsLevel?: number | string) => string;
}
declare module '@salesforce/core/logger/memoryLogger' {
  /// <reference types="node" />
  import { Writable } from 'node:stream';
  /**
   * Used by test setup to keep UT from writing to disk.
   */
  export class MemoryLogger extends Writable {
    loggedData: Array<Record<string, unknown>>;
    constructor();
    _write(chunk: Record<string, unknown>, encoding: string, callback: (err?: Error) => void): void;
  }
}
declare module '@salesforce/core/logger/transformStream' {
  /// <reference types="node" />
  import { Transform } from 'node:stream';
  export default function (): Transform;
}
declare module '@salesforce/core/messageTransformer' {
  import ts from 'typescript';
  /**
   *
   * @experimental
   * transforms `messages` references from dynamic run-time to static compile-time values
   */
  export const messageTransformer: () => ts.TransformerFactory<ts.SourceFile>;
  export default messageTransformer;
}
declare module '@salesforce/core/messages' {
  import { AnyJson } from '@salesforce/ts-types';
  import { SfError } from '@salesforce/core/sfError';
  export type Tokens = Array<string | boolean | number | null | undefined>;
  export type StructuredMessage = {
    message: string;
    name: string;
    actions?: string[];
  };
  /**
   * A loader function to return messages.
   *
   * @param locale The local set by the framework.
   */
  export type LoaderFunction<T extends string> = (locale: string) => Messages<T>;
  export type StoredMessage =
    | string
    | string[]
    | {
        [s: string]: StoredMessage;
      };
  export type StoredMessageMap = Map<string, StoredMessage>;
  /**
   * The core message framework manages messages and allows them to be accessible by
   * all plugins and consumers of sfdx-core. It is set up to handle localization down
   * the road at no additional effort to the consumer. Messages can be used for
   * anything from user output (like the console), to error messages, to returned
   * data from a method.
   *
   * Messages are loaded from loader functions. The loader functions will only run
   * when a message is required. This prevents all messages from being loaded into memory at
   * application startup. The functions can load from memory, a file, or a server.
   *
   * In the beginning of your app or file, add the loader functions to be used later. If using
   * json or js files in a root messages directory (`<moduleRoot>/messages`), load the entire directory
   * automatically with {@link Messages.importMessagesDirectory}. Message files must be the following formates.
   *
   * A `.json` file:
   * ```json
   * {
   *    "msgKey": "A message displayed in the user",
   *    "msgGroup": {
   *       "anotherMsgKey": "Another message displayed to the user"
   *    },
   *    "listOfMessage": ["message1", "message2"]
   * }
   * ```
   *
   * A `.js` file:
   * ```javascript
   * module.exports = {
   *    msgKey: 'A message displayed in the user',
   *    msgGroup: {
   *       anotherMsgKey: 'Another message displayed to the user'
   *    },
   *    listOfMessage: ['message1', 'message2']
   * }
   * ```
   *
   * A `.md` file:
   * ```markdown
   * # msgKey
   * A message displayed in the user
   *
   * # msgGroup.anotherMsgKey
   * Another message displayed to the user
   *
   * # listOfMessage
   * - message1
   * - message2
   * ```
   *
   * The values support [util.format](https://nodejs.org/api/util.html#util_util_format_format_args) style strings
   * that apply the tokens passed into {@link Message.getMessage}
   *
   * **Note:** When running unit tests individually, you may see errors that the messages aren't found.
   * This is because `index.js` isn't loaded when tests run like they are when the package is required.
   * To allow tests to run, import the message directory in each test (it will only
   * do it once) or load the message file the test depends on individually.
   *
   * ```typescript
   * // Create loader functions for all files in the messages directory
   * Messages.importMessagesDirectory(__dirname);
   *
   * // or, for ESM code
   * Messages.importMessagesDirectoryFromMetaUrl(import.meta.url)
   *
   * // Now you can use the messages from anywhere in your code or file.
   * // If using importMessageDirectory, the bundle name is the file name.
   * const messages: Messages = Messages.loadMessages(packageName, bundleName);
   *
   * // Messages now contains all the message in the bundleName file.
   * messages.getMessage('authInfoCreationError');
   * ```
   */
  export class Messages<T extends string> {
    readonly messages: StoredMessageMap;
    private static loaders;
    private static bundles;
    /**
     * The locale of the messages in this bundle.
     */
    readonly locale: string;
    /**
     * The bundle name.
     */
    readonly bundleName: string;
    /**
     * Create a new messages bundle.
     *
     * **Note:** Use {Messages.loadMessages} unless you are writing your own loader function.
     *
     * @param bundleName The bundle name.
     * @param locale The locale.
     * @param messages The messages. Can not be modified once created.
     */
    constructor(bundleName: string, locale: string, messages: StoredMessageMap);
    /**
     * Internal readFile. Exposed for unit testing. Do not use util/fs.readFile as messages.js
     * should have no internal dependencies.
     *
     * @param filePath read file target.
     * @ignore
     */
    static readFile: (filePath: string) => AnyJson;
    /**
     * Get the locale. This will always return 'en_US' but will return the
     * machine's locale in the future.
     */
    static getLocale(): string;
    /**
     * Set a custom loader function for a package and bundle that will be called on {@link Messages.loadMessages}.
     *
     * @param packageName The npm package name.
     * @param bundle The name of the bundle.
     * @param loader The loader function.
     */
    static setLoaderFunction(packageName: string, bundle: string, loader: LoaderFunction<string>): void;
    /**
     * Generate a file loading function. Use {@link Messages.importMessageFile} unless
     * overriding the bundleName is required, then manually pass the loader
     * function to {@link Messages.setLoaderFunction}.
     *
     * @param bundleName The name of the bundle.
     * @param filePath The messages file path.
     */
    static generateFileLoaderFunction(bundleName: string, filePath: string): LoaderFunction<string>;
    /**
     * Add a single message file to the list of loading functions using the file name as the bundle name.
     * The loader will only be added if the bundle name is not already taken.
     *
     * @param packageName The npm package name.
     * @param filePath The path of the file.
     */
    static importMessageFile(packageName: string, filePath: string): void;
    /**
     * Support ESM plugins who can't use __dirname
     *
     * @param metaUrl pass in `import.meta.url`
     * @param truncateToProjectPath Will look for the messages directory in the project root (where the package.json file is located).
     * i.e., the module is typescript and the messages folder is in the top level of the module directory.
     * @param packageName The npm package name. Figured out from the root directory's package.json.
     */
    static importMessagesDirectoryFromMetaUrl(
      metaUrl: string,
      truncateToProjectPath?: boolean,
      packageName?: string
    ): void;
    /**
     * Import all json and js files in a messages directory. Use the file name as the bundle key when
     * {@link Messages.loadMessages} is called. By default, we're assuming the moduleDirectoryPart is a
     * typescript project and will truncate to root path (where the package.json file is). If your messages
     * directory is in another spot or you are not using typescript, pass in false for truncateToProjectPath.
     *
     * ```
     * // e.g. If your message directory is in the project root, you would do:
     * Messages.importMessagesDirectory(__dirname);
     * ```
     *
     * @param moduleDirectoryPath The path to load the messages folder.
     * @param truncateToProjectPath Will look for the messages directory in the project root (where the package.json file is located).
     * i.e., the module is typescript and the messages folder is in the top level of the module directory.
     * @param packageName The npm package name. Figured out from the root directory's package.json.
     */
    static importMessagesDirectory(
      moduleDirectoryPath: string,
      truncateToProjectPath?: boolean,
      packageName?: string
    ): void;
    /**
     * Load messages for a given package and bundle. If the bundle is not already cached, use the loader function
     * created from {@link Messages.setLoaderFunction} or {@link Messages.importMessagesDirectory}.
     *
     * ```typescript
     * Messages.importMessagesDirectory(__dirname);
     * const messages = Messages.loadMessages('packageName', 'bundleName');
     * ```
     *
     * @param packageName The name of the npm package.
     * @param bundleName The name of the bundle to load.
     */
    static loadMessages(packageName: string, bundleName: string): Messages<string>;
    /**
     * Check if a bundle already been loaded.
     *
     * @param packageName The npm package name.
     * @param bundleName The bundle name.
     */
    static isCached(packageName: string, bundleName: string): boolean;
    /**
     * Get a message using a message key and use the tokens as values for tokenization.
     *
     * If the key happens to be an array of messages, it will combine with OS.EOL.
     *
     * @param key The key of the message.
     * @param tokens The values to substitute in the message.
     *
     * **See** https://nodejs.org/api/util.html#util_util_format_format_args
     */
    getMessage(key: T, tokens?: Tokens): string;
    /**
     * Get messages using a message key and use the tokens as values for tokenization.
     *
     * This will return all messages if the key is an array in the messages file.
     *
     * ```json
     * {
     *   "myKey": [ "message1", "message2" ]
     * }
     * ```
     *
     * ```markdown
     * # myKey
     * * message1
     * * message2
     * ```
     *
     * @param key The key of the messages.
     * @param tokens The values to substitute in the message.
     *
     * **See** https://nodejs.org/api/util.html#util_util_format_format_args
     */
    getMessages(key: T, tokens?: Tokens): string[];
    /**
     * Convenience method to create errors using message labels.
     *
     * `error.name` will be the upper-cased key, remove prefixed `error.` and will always end in Error.
     * `error.actions` will be loaded using `${key}.actions` if available.
     *
     * @param key The key of the error message.
     * @param tokens The error message tokens.
     * @param actionTokens The action messages tokens.
     * @param exitCodeOrCause The exit code which will be used by SfdxCommand or the underlying error that caused this error to be raised.
     * @param cause The underlying error that caused this error to be raised.
     */
    createError(
      key: T,
      tokens?: Tokens,
      actionTokens?: Tokens,
      exitCodeOrCause?: number | Error,
      cause?: Error
    ): SfError;
    /**
     * Convenience method to create warning using message labels.
     *
     * `warning.name` will be the upper-cased key, remove prefixed `warning.` and will always end in Warning.
     * `warning.actions` will be loaded using `${key}.actions` if available.
     *
     * @param key The key of the warning message.
     * @param tokens The warning message tokens.
     * @param actionTokens The action messages tokens.
     */
    createWarning(key: T, tokens?: Tokens, actionTokens?: Tokens): StructuredMessage;
    /**
     * Convenience method to create info using message labels.
     *
     * `info.name` will be the upper-cased key, remove prefixed `info.` and will always end in Info.
     * `info.actions` will be loaded using `${key}.actions` if available.
     *
     * @param key The key of the warning message.
     * @param tokens The warning message tokens.
     * @param actionTokens The action messages tokens.
     */
    createInfo(key: T, tokens?: Tokens, actionTokens?: Tokens): StructuredMessage;
    /**
     * Formats message contents given a message type, key, tokens and actions tokens
     *
     * `<type>.name` will be the upper-cased key, remove prefixed `<type>.` and will always end in 'Error | Warning | Info.
     * `<type>.actions` will be loaded using `${key}.actions` if available.
     *
     * @param type The type of the message set must 'error' | 'warning' | 'info'.
     * @param key The key of the warning message.
     * @param tokens The warning message tokens.
     * @param actionTokens The action messages tokens.
     * @param preserveName Do not require that the name end in the type ('error' | 'warning' | 'info').
     */
    private formatMessageContents;
    private getMessageWithMap;
  }
}
declare module '@salesforce/core/org/authInfo' {
  import { AsyncOptionalCreatable } from '@salesforce/kit';
  import { Nullable } from '@salesforce/ts-types';
  import { OAuth2Config, OAuth2 } from '@jsforce/jsforce-node';
  import { Connection } from '@salesforce/core/org/connection';
  import { Org } from '@salesforce/core/org/org';
  /**
   * Fields for authorization, org, and local information.
   */
  export type AuthFields = {
    accessToken?: string;
    alias?: string;
    authCode?: string;
    clientId?: string;
    clientSecret?: string;
    created?: string;
    createdOrgInstance?: string;
    devHubUsername?: string;
    instanceUrl?: string;
    instanceApiVersion?: string;
    instanceApiVersionLastRetrieved?: string;
    isDevHub?: boolean;
    loginUrl?: string;
    orgId?: string;
    password?: string;
    privateKey?: string;
    refreshToken?: string;
    scratchAdminUsername?: string;
    snapshot?: string;
    userId?: string;
    username?: string;
    usernames?: string[];
    userProfileName?: string;
    expirationDate?: string;
    tracksSource?: boolean;
    [Org.Fields.NAME]?: string;
    [Org.Fields.INSTANCE_NAME]?: string;
    [Org.Fields.NAMESPACE_PREFIX]?: Nullable<string>;
    [Org.Fields.IS_SANDBOX]?: boolean;
    [Org.Fields.IS_SCRATCH]?: boolean;
    [Org.Fields.TRIAL_EXPIRATION_DATE]?: Nullable<string>;
  };
  export type OrgAuthorization = {
    orgId: string;
    username: string;
    oauthMethod: 'jwt' | 'web' | 'token' | 'unknown';
    aliases: Nullable<string[]>;
    configs: Nullable<string[]>;
    isScratchOrg?: boolean;
    isDevHub?: boolean;
    isSandbox?: boolean;
    instanceUrl?: string;
    accessToken?: string;
    error?: string;
    isExpired: boolean | 'unknown';
  };
  /**
   * Options for access token flow.
   */
  export type AccessTokenOptions = {
    accessToken?: string;
    loginUrl?: string;
    instanceUrl?: string;
  };
  export type AuthSideEffects = {
    alias?: string;
    setDefault: boolean;
    setDefaultDevHub: boolean;
    setTracksSource?: boolean;
  };
  export type JwtOAuth2Config = OAuth2Config & {
    privateKey?: string;
    privateKeyFile?: string;
    authCode?: string;
    refreshToken?: string;
    username?: string;
  };
  /**
   * A function to update a refresh token when the access token is expired.
   */
  export type RefreshFn = (
    conn: Connection,
    callback: (err: Nullable<Error>, accessToken?: string, res?: Record<string, unknown>) => Promise<void>
  ) => Promise<void>;
  /**
   * Options for {@link Connection}.
   */
  export type ConnectionOptions = AuthFields & {
    /**
     * OAuth options.
     */
    oauth2?: Partial<JwtOAuth2Config>;
    /**
     * Refresh token callback.
     */
    refreshFn?: RefreshFn;
  };
  export const DEFAULT_CONNECTED_APP_INFO: {
    clientId: string;
    clientSecret: string;
  };
  /**
   * Handles persistence and fetching of user authentication information using
   * JWT, OAuth, or refresh tokens. Sets up the refresh flows that jsForce will
   * use to keep tokens active. An AuthInfo can also be created with an access
   * token, but AuthInfos created with access tokens can't be persisted to disk.
   *
   * **See** [Authorization](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_auth.htm)
   *
   * **See** [Salesforce DX Usernames and Orgs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_usernames_orgs.htm)
   *
   * ```
   * // Creating a new authentication file.
   * const authInfo = await AuthInfo.create({
   *   username: myAdminUsername,
   *   oauth2Options: {
   *     loginUrl, authCode, clientId, clientSecret
   *   }
   * );
   * authInfo.save();
   *
   * // Creating an authorization info with an access token.
   * const authInfo = await AuthInfo.create({
   *   username: accessToken
   * });
   *
   * // Using an existing authentication file.
   * const authInfo = await AuthInfo.create({
   *   username: myAdminUsername
   * });
   *
   * // Using the AuthInfo
   * const connection = await Connection.create({ authInfo });
   * ```
   */
  export class AuthInfo extends AsyncOptionalCreatable<AuthInfo.Options> {
    private usingAccessToken;
    private logger;
    private stateAggregator;
    private username;
    private options;
    /**
     * Constructor
     * **Do not directly construct instances of this class -- use {@link AuthInfo.create} instead.**
     *
     * @param options The options for the class instance
     */
    constructor(options?: AuthInfo.Options);
    /**
     * Returns the default instance url
     *
     * @returns {string}
     */
    static getDefaultInstanceUrl(): string;
    /**
     * Get a list of all authorizations based on auth files stored in the global directory.
     * One can supply a filter (see @param orgAuthFilter) and calling this function without
     * a filter will return all authorizations.
     *
     * @param orgAuthFilter A predicate function that returns true for those org authorizations that are to be retained.
     *
     * @returns {Promise<OrgAuthorization[]>}
     */
    static listAllAuthorizations(orgAuthFilter?: (orgAuth: OrgAuthorization) => boolean): Promise<OrgAuthorization[]>;
    /**
     * Returns true if one or more authentications are persisted.
     */
    static hasAuthentications(): Promise<boolean>;
    /**
     * Get the authorization URL.
     *
     * @param options The options to generate the URL.
     */
    static getAuthorizationUrl(
      options: JwtOAuth2Config & {
        scope?: string;
      },
      oauth2?: OAuth2
    ): string;
    /**
     * Parse a sfdx auth url, usually obtained by `authInfo.getSfdxAuthUrl`.
     *
     * @example
     * ```
     * await AuthInfo.create(AuthInfo.parseSfdxAuthUrl(sfdxAuthUrl));
     * ```
     * @param sfdxAuthUrl
     */
    static parseSfdxAuthUrl(
      sfdxAuthUrl: string
    ): Pick<AuthFields, 'clientId' | 'clientSecret' | 'refreshToken' | 'loginUrl'>;
    /**
     * Given a set of decrypted fields and an authInfo, determine if the org belongs to an available
     * dev hub, or if the org is a sandbox of another CLI authed production org.
     *
     * @param fields
     * @param orgAuthInfo
     */
    static identifyPossibleScratchOrgs(fields: AuthFields, orgAuthInfo: AuthInfo): Promise<void>;
    /**
     * Find all dev hubs available in the local environment.
     */
    static getDevHubAuthInfos(): Promise<OrgAuthorization[]>;
    private static identifyPossibleSandbox;
    /**
     * Checks active scratch orgs to match by the ScratchOrg field (the 15-char org id)
     * if you pass an 18-char scratchOrgId, it will be trimmed to 15-char for query purposes
     * Throws is no matching scratch org is found
     */
    private static queryScratchOrg;
    /**
     * Get the username.
     */
    getUsername(): string;
    /**
     * Returns true if `this` is using the JWT flow.
     */
    isJwt(): boolean;
    /**
     * Returns true if `this` is using an access token flow.
     */
    isAccessTokenFlow(): boolean;
    /**
     * Returns true if `this` is using the oauth flow.
     */
    isOauth(): boolean;
    /**
     * Returns true if `this` is using the refresh token flow.
     */
    isRefreshTokenFlow(): boolean;
    /**
     * Updates the cache and persists the authentication fields (encrypted).
     *
     * @param authData New data to save.
     */
    save(authData?: AuthFields): Promise<AuthInfo>;
    /**
     * Update the authorization fields, encrypting sensitive fields, but do not persist.
     * For convenience `this` object is returned.
     *
     * @param authData Authorization fields to update.
     */
    update(authData?: AuthFields): AuthInfo;
    /**
     * Get the auth fields (decrypted) needed to make a connection.
     */
    getConnectionOptions(): ConnectionOptions;
    getClientId(): string;
    getRedirectUri(): string;
    /**
     * Get the authorization fields.
     *
     * @param decrypt Decrypt the fields.
     *
     * Returns a ReadOnly object of the fields.  If you need to modify the fields, use AuthInfo.update()
     */
    getFields(decrypt?: boolean): Readonly<AuthFields>;
    /**
     * Get the org front door (used for web based oauth flows)
     */
    getOrgFrontDoorUrl(): string;
    /**
     * Returns true if this org is using access token auth.
     */
    isUsingAccessToken(): boolean;
    /**
     * Get the SFDX Auth URL.
     *
     * **See** [SFDX Authorization](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_auth.htm#cli_reference_force_auth)
     */
    getSfdxAuthUrl(): string;
    /**
     * Convenience function to handle typical side effects encountered when dealing with an AuthInfo.
     * Given the values supplied in parameter sideEffects, this function will set auth alias, default auth
     * and default dev hub.
     *
     * @param sideEffects - instance of AuthSideEffects
     */
    handleAliasAndDefaultSettings(sideEffects: AuthSideEffects): Promise<void>;
    /**
     * Set the target-env (default) or the target-dev-hub to the alias if
     * it exists otherwise to the username. Method will try to set the local
     * config first but will default to global config if that fails.
     *
     * @param options
     */
    setAsDefault(options?: { org?: boolean; devHub?: boolean }): Promise<void>;
    /**
     * Sets the provided alias to the username
     *
     * @param alias alias to set
     */
    setAlias(alias: string): Promise<void>;
    /**
     * Initializes an instance of the AuthInfo class.
     */
    init(): Promise<void>;
    private getInstanceUrl;
    /**
     * Initialize this AuthInfo instance with the specified options. If options are not provided, initialize it from cache
     * or by reading from the persistence store. For convenience `this` object is returned.
     *
     * @param options Options to be used for creating an OAuth2 instance.
     *
     * **Throws** *{@link SfError}{ name: 'NamedOrgNotFoundError' }* Org information does not exist.
     * @returns {Promise<AuthInfo>}
     */
    private initAuthOptions;
    private loadDecryptedAuthFromConfig;
    private isTokenOptions;
    private refreshFn;
    private readJwtKey;
    private authJwt;
    private tryJwtAuth;
    private buildRefreshTokenConfig;
    /**
     * Performs an authCode exchange but the Oauth2 feature of jsforce is extended to include a code_challenge
     *
     * @param options The oauth options
     * @param oauth2 The oauth2 extension that includes a code_challenge
     */
    private exchangeToken;
    private retrieveUserInfo;
    /**
     * Given an error while getting the User object, handle different possibilities of response.body.
     *
     * @param response
     * @private
     */
    private throwUserGetException;
    private getNamespacePrefix;
    /**
     * Returns `true` if the org is a Dev Hub.
     *
     * Check access to the ScratchOrgInfo object to determine if the org is a dev hub.
     */
    private determineIfDevHub;
  }
  export namespace AuthInfo {
    /**
     * Constructor options for AuthInfo.
     */
    type Options = {
      /**
       * Org signup username.
       */
      username?: string;
      /**
       * OAuth options.
       */
      oauth2Options?: JwtOAuth2Config;
      /**
       * Options for the access token auth.
       */
      accessTokenOptions?: AccessTokenOptions;
      oauth2?: OAuth2;
      /**
       * In certain situations, a new auth info wants to use the connected app
       * information from another parent org. Typically for scratch org or sandbox
       * creation.
       */
      parentUsername?: string;
      isDevHub?: boolean;
    };
  }
}
declare module '@salesforce/core/org/authRemover' {
  import { AsyncOptionalCreatable } from '@salesforce/kit';
  import { JsonMap } from '@salesforce/ts-types';
  import { AuthFields } from '@salesforce/core/org/authInfo';
  /**
   * Handles  the removing of authorizations, which includes deleting the auth file
   * in the global .sfdx folder, deleting any configs that are associated with the username/alias,
   * and deleting any aliases associated with the username
   *
   * ```
   * const remover = await AuthRemover.create();
   * await remover.removeAuth('example@mycompany.com');
   * ```
   *
   * ```
   * const remover = await AuthRemover.create();
   * await remover.removeAllAuths();
   * ```
   *
   * ```
   * const remover = await AuthRemover.create();
   * const auth = await remover.findAuth(
   *  example@mycompany.com
   * );
   * await remover.removeAuth(auth.username);
   * ```
   */
  export class AuthRemover extends AsyncOptionalCreatable {
    private config;
    private stateAggregator;
    private logger;
    /**
     * Removes the authentication and any configs or aliases associated with it
     *
     * @param usernameOrAlias the username or alias that you want to remove
     */
    removeAuth(usernameOrAlias: string): Promise<void>;
    /**
     * Removes all authentication files and any configs or aliases associated with them
     */
    removeAllAuths(): Promise<void>;
    /**
     * Finds authorization files for username/alias in the global .sfdx folder
     * **Throws** *{@link SfError}{ name: 'TargetOrgNotSetError' }* if no target-org
     * **Throws** *{@link SfError}{ name: 'NamedOrgNotFoundError' }* if specified user is not found
     *
     * @param usernameOrAlias username or alias of the auth you want to find, defaults to the configured target-org
     * @returns {Promise<SfOrg>}
     */
    findAuth(usernameOrAlias?: string): Promise<AuthFields>;
    /**
     * Finds all org authorizations in the global info file (.sf/sf.json)
     *
     * @returns {Record<string, AuthFields>}
     */
    findAllAuths(): Record<string, AuthFields & JsonMap>;
    protected init(): Promise<void>;
    /**
     * Returns the username for a given alias if the alias exists.
     *
     * @param usernameOrAlias username or alias
     * @returns {Promise<string>}
     */
    private resolveUsername;
    /**
     * @returns {string}
     */
    private getTargetOrg;
    /**
     * Returns aliases for provided username
     *
     * @param username username that's been aliased
     * @returns {Promise<string[]>}
     */
    private getAliases;
    /**
     * Unsets any configured values (both global and local) for provided username
     *
     * @param username username that you want to remove from config files
     */
    private unsetConfigValues;
    /**
     * Unsets any aliases for provided username
     *
     * @param username username that you want to remove from aliases
     */
    private unsetAliases;
  }
}
declare module '@salesforce/core/org/connection' {
  /// <reference types="node" />
  import { AsyncResult, DeployOptions, DeployResultLocator } from '@jsforce/jsforce-node/lib/api/metadata';
  import { JsonMap, Optional } from '@salesforce/ts-types';
  import {
    Connection as JSForceConnection,
    ConnectionConfig,
    HttpRequest,
    QueryOptions,
    QueryResult,
    Record,
    Schema,
  } from '@jsforce/jsforce-node';
  import { Tooling as JSForceTooling } from '@jsforce/jsforce-node/lib/api/tooling';
  import { StreamPromise } from '@jsforce/jsforce-node/lib/util/promise';
  import { ConfigAggregator } from '@salesforce/core/config/configAggregator';
  import { AuthFields, AuthInfo } from '@salesforce/core/org/authInfo';
  export const SFDX_HTTP_HEADERS: {
    'content-type': string;
    'user-agent': string;
  };
  export const DNS_ERROR_NAME = 'DomainNotFoundError';
  export type DeployOptionsWithRest = Partial<DeployOptions> & {
    rest?: boolean;
  };
  export interface Tooling<S extends Schema = Schema> extends JSForceTooling<S> {
    _logger: any;
  }
  /**
   * Handles connections and requests to Salesforce Orgs.
   *
   * ```
   * // Uses latest API version
   * const connection = await Connection.create({
   *   authInfo: await AuthInfo.create({ username: 'myAdminUsername' })
   * });
   * connection.query('SELECT Name from Account');
   *
   * // Use different API version
   * connection.setApiVersion("42.0");
   * connection.query('SELECT Name from Account');
   * ```
   */
  export class Connection<S extends Schema = Schema> extends JSForceConnection<S> {
    private logger;
    private options;
    private username;
    private hasResolved;
    private maxApiVersion;
    /**
     * Constructor
     * **Do not directly construct instances of this class -- use {@link Connection.create} instead.**
     *
     * @param options The options for the class instance.
     * @ignore
     */
    constructor(options: Connection.Options<S>);
    /**
     * Tooling api reference.
     */
    get tooling(): Tooling<S>;
    /**
     * Creates an instance of a Connection. Performs additional async initializations.
     *
     * @param options Constructor options.
     */
    static create<S extends Schema>(
      this: new (options: Connection.Options<S>) => Connection<S>,
      options: Connection.Options<S>
    ): Promise<Connection<S>>;
    /**
     * Async initializer.
     */
    init(): Promise<void>;
    /**
     * deploy a zipped buffer from the SDRL with REST or SOAP
     *
     * @param zipInput data to deploy
     * @param options JSForce deploy options + a boolean for rest
     */
    deploy(zipInput: Buffer, options: DeployOptionsWithRest): Promise<DeployResultLocator<AsyncResult & Schema>>;
    /**
     * Send REST API request with given HTTP request info, with connected session information
     * and SFDX headers.
     *
     * @param request HTTP request object or URL to GET request.
     * @param options HTTP API request options.
     */
    request<R = unknown>(request: string | HttpRequest, options?: JsonMap): StreamPromise<R>;
    /**
     * The Force API base url for the instance.
     */
    baseUrl(): string;
    /**
     * Retrieves the highest api version that is supported by the target server instance.
     */
    retrieveMaxApiVersion(): Promise<string>;
    /**
     * Use the latest API version available on `this.instanceUrl`.
     */
    useLatestApiVersion(): Promise<void>;
    /**
     * Verify that instance has a reachable DNS entry, otherwise will throw error
     */
    isResolvable(): Promise<boolean>;
    /**
     * Get the API version used for all connection requests.
     */
    getApiVersion(): string;
    /**
     * Set the API version for all connection requests.
     *
     * **Throws** *{@link SfError}{ name: 'IncorrectAPIVersionError' }* Incorrect API version.
     *
     * @param version The API version.
     */
    setApiVersion(version: string): void;
    /**
     * Getter for AuthInfo.
     */
    getAuthInfo(): AuthInfo;
    /**
     * Getter for the AuthInfo fields.
     */
    getAuthInfoFields(): AuthFields;
    /**
     * Getter for the auth fields.
     */
    getConnectionOptions(): AuthFields;
    /**
     * Getter for the username of the Salesforce Org.
     */
    getUsername(): Optional<string>;
    /**
     * Returns true if this connection is using access token auth.
     */
    isUsingAccessToken(): boolean;
    /**
     * Normalize a Salesforce url to include a instance information.
     *
     * @param url Partial url.
     */
    normalizeUrl(url: string): string;
    /**
     * Executes a query and auto-fetches (i.e., "queryMore") all results.  This is especially
     * useful with large query result sizes, such as over 2000 records.  The default maximum
     * fetch size is 10,000 records. Modify this via the options argument.
     *
     * @param soql The SOQL string.
     * @param queryOptions The query options. NOTE: the autoFetch option will always be true.
     */
    autoFetchQuery<T extends Schema = S>(
      soql: string,
      queryOptions?: Partial<
        QueryOptions & {
          tooling: boolean;
        }
      >
    ): Promise<QueryResult<T>>;
    /**
     * Executes a query using either standard REST or Tooling API, returning a single record.
     * Will throw if either zero records are found OR multiple records are found.
     *
     * @param soql The SOQL string.
     * @param options The query options.
     */
    singleRecordQuery<T extends Record>(soql: string, options?: SingleRecordQueryOptions): Promise<T>;
    /**
     * Executes a get request on the baseUrl to force an auth refresh
     * Useful for the raw methods (request, requestRaw) that use the accessToken directly and don't handle refreshes
     */
    refreshAuth(): Promise<void>;
    private getCachedApiVersion;
  }
  export const SingleRecordQueryErrors: {
    NoRecords: string;
    MultipleRecords: string;
  };
  export type SingleRecordQueryOptions = {
    tooling?: boolean;
    returnChoicesOnMultiple?: boolean;
    choiceField?: string;
  };
  export namespace Connection {
    /**
     * Connection Options.
     */
    type Options<S extends Schema> = {
      /**
       * AuthInfo instance.
       */
      authInfo: AuthInfo;
      /**
       * ConfigAggregator for getting defaults.
       */
      configAggregator?: ConfigAggregator;
      /**
       * Additional connection parameters.
       */
      connectionOptions?: ConnectionConfig<S>;
    };
  }
}
declare module '@salesforce/core/org/org' {
  import { AsyncOptionalCreatable, Duration } from '@salesforce/kit';
  import { AnyJson, JsonMap, Nullable } from '@salesforce/ts-types';
  import { ConfigAggregator } from '@salesforce/core/config/configAggregator';
  import { OrgUsersConfig } from '@salesforce/core/config/orgUsersConfig';
  import { Connection } from '@salesforce/core/org/connection';
  import { AuthFields, AuthInfo } from '@salesforce/core/org/authInfo';
  import { ScratchOrgCreateOptions, ScratchOrgCreateResult } from '@salesforce/core/org/scratchOrgCreate';
  export type OrganizationInformation = {
    Name: string;
    InstanceName: string;
    IsSandbox: boolean;
    TrialExpirationDate: string | null;
    NamespacePrefix: string | null;
  };
  export enum OrgTypes {
    Scratch = 'scratch',
    Sandbox = 'sandbox',
  }
  export type StatusEvent = {
    sandboxProcessObj: SandboxProcessObject;
    interval: number;
    remainingWait: number;
    waitingOnAuth: boolean;
  };
  export type ResultEvent = {
    sandboxProcessObj: SandboxProcessObject;
    sandboxRes: SandboxUserAuthResponse;
  };
  export type SandboxUserAuthRequest = {
    sandboxName: string;
    clientId: string;
    callbackUrl: string;
  };
  export enum SandboxEvents {
    EVENT_STATUS = 'status',
    EVENT_ASYNC_RESULT = 'asyncResult',
    EVENT_RESULT = 'result',
    EVENT_AUTH = 'auth',
    EVENT_RESUME = 'resume',
    EVENT_MULTIPLE_SBX_PROCESSES = 'multipleMatchingSbxProcesses',
  }
  export type SandboxUserAuthResponse = {
    authUserName: string;
    authCode: string;
    instanceUrl: string;
    loginUrl: string;
  };
  export function sandboxIsResumable(value: string): boolean;
  export type SandboxProcessObject = {
    Id: string;
    Status: string;
    SandboxName: string;
    SandboxInfoId: string;
    LicenseType: string;
    CreatedDate: string;
    SandboxOrganization?: string;
    CopyProgress?: number;
    SourceId?: string;
    Description?: string;
    ApexClassId?: string;
    EndDate?: string;
  };
  export type SandboxRequest = {
    SandboxName: string;
    LicenseType?: string;
    /** Should match a SandboxInfoId, not a SandboxProcessId */
    SourceId?: string;
    Description?: string;
  };
  export type ResumeSandboxRequest = {
    SandboxName?: string;
    SandboxProcessObjId?: string;
  };
  export type SandboxInfo = {
    Id: string;
    IsDeleted: boolean;
    CreatedDate: string;
    CreatedById: string;
    LastModifiedDate: string;
    LastModifiedById: string;
    SandboxName: string;
    LicenseType: 'DEVELOPER' | 'DEVELOPER PRO' | 'PARTIAL' | 'FULL';
    TemplateId?: string;
    HistoryDays: -1 | 0 | 10 | 20 | 30 | 60 | 90 | 120 | 150 | 180;
    CopyChatter: boolean;
    AutoActivate: boolean;
    ApexClassId?: string;
    Description?: string;
    SourceId?: string;
    CopyArchivedActivities?: boolean;
  };
  export type ScratchOrgRequest = Omit<ScratchOrgCreateOptions, 'hubOrg'>;
  export type SandboxFields = {
    sandboxOrgId: string;
    prodOrgUsername: string;
    sandboxName?: string;
    sandboxUsername?: string;
    sandboxProcessId?: string;
    sandboxInfoId?: string;
    timestamp?: string;
  };
  /**
   * Provides a way to manage a locally authenticated Org.
   *
   * **See** {@link AuthInfo}
   *
   * **See** {@link Connection}
   *
   * **See** {@link Aliases}
   *
   * **See** {@link Config}
   *
   * ```
   * // Email username
   * const org1: Org = await Org.create({ aliasOrUsername: 'foo@example.com' });
   * // The target-org config property
   * const org2: Org = await Org.create();
   * // Full Connection
   * const org3: Org = await Org.create({
   *   connection: await Connection.create({
   *     authInfo: await AuthInfo.create({ username: 'username' })
   *   })
   * });
   * ```
   *
   * **See** https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_usernames_orgs.htm
   */
  export class Org extends AsyncOptionalCreatable<Org.Options> {
    private status;
    private configAggregator;
    private logger;
    private connection;
    private options;
    private orgId?;
    /**
     * @ignore
     */
    constructor(options?: Org.Options);
    /**
     * create a sandbox from a production org
     * 'this' needs to be a production org with sandbox licenses available
     *
     * @param sandboxReq SandboxRequest options to create the sandbox with
     * @param options Wait: The amount of time to wait before timing out, Interval: The time interval between polling
     */
    createSandbox(
      sandboxReq: SandboxRequest,
      options?: {
        wait?: Duration;
        interval?: Duration;
        async?: boolean;
      }
    ): Promise<SandboxProcessObject>;
    /**
     * Refresh (update) a sandbox from a production org.
     * 'this' needs to be a production org with sandbox licenses available
     *
     * @param sandboxInfo SandboxInfo to update the sandbox with
     * @param options Wait: The amount of time to wait before timing out, Interval: The time interval between polling
     */
    refreshSandbox(
      sandboxInfo: SandboxInfo,
      options?: {
        wait?: Duration;
        interval?: Duration;
        async?: boolean;
      }
    ): Promise<SandboxProcessObject>;
    /**
     *
     * @param sandboxReq SandboxRequest options to create the sandbox with
     * @param sourceSandboxName the name of the sandbox that your new sandbox will be based on
     * @param options Wait: The amount of time to wait before timing out, defaults to 0, Interval: The time interval between polling defaults to 30 seconds
     * @returns {SandboxProcessObject} the newly created sandbox process object
     */
    cloneSandbox(
      sandboxReq: SandboxRequest,
      sourceSandboxName: string,
      options: {
        wait?: Duration;
        interval?: Duration;
      }
    ): Promise<SandboxProcessObject>;
    /**
     * Resume a sandbox create or refresh from a production org.
     * `this` needs to be a production org with sandbox licenses available.
     *
     * @param resumeSandboxRequest SandboxRequest options to create/refresh the sandbox with
     * @param options Wait: The amount of time to wait (default: 0 minutes) before timing out,
     * Interval: The time interval (default: 30 seconds) between polling
     */
    resumeSandbox(
      resumeSandboxRequest: ResumeSandboxRequest,
      options?: {
        wait?: Duration;
        interval?: Duration;
        async?: boolean;
      }
    ): Promise<SandboxProcessObject>;
    /**
     * Creates a scratchOrg
     * 'this' needs to be a valid dev-hub
     *
     * @param {options} ScratchOrgCreateOptions
     * @returns {ScratchOrgCreateResult}
     */
    scratchOrgCreate(options: ScratchOrgRequest): Promise<ScratchOrgCreateResult>;
    /**
     * Reports sandbox org creation status. If the org is ready, authenticates to the org.
     *
     * @param {sandboxname} string the sandbox name
     * @param options Wait: The amount of time to wait before timing out, Interval: The time interval between polling
     * @returns {SandboxProcessObject} the sandbox process object
     */
    sandboxStatus(
      sandboxname: string,
      options: {
        wait?: Duration;
        interval?: Duration;
      }
    ): Promise<SandboxProcessObject>;
    /**
     * Clean all data files in the org's data path. Usually <workspace>/.sfdx/orgs/<username>.
     *
     * @param orgDataPath A relative path other than "orgs/".
     * @param throwWhenRemoveFails Should the remove org operations throw an error on failure?
     */
    cleanLocalOrgData(orgDataPath?: string, throwWhenRemoveFails?: boolean): Promise<void>;
    /**
     * @ignore
     */
    retrieveOrgUsersConfig(): Promise<OrgUsersConfig>;
    /**
     * Cleans up all org related artifacts including users, sandbox config (if a sandbox), source tracking files, and auth file.
     *
     * @param throwWhenRemoveFails Determines if the call should throw an error or fail silently.
     */
    remove(throwWhenRemoveFails?: boolean): Promise<void>;
    /**
     * Check if org is a sandbox org by checking its SandboxOrgConfig.
     *
     */
    isSandbox(): Promise<boolean>;
    /**
     * Check that this org is a scratch org by asking the dev hub if it knows about it.
     *
     * **Throws** *{@link SfError}{ name: 'NotADevHubError' }* Not a Dev Hub.
     *
     * **Throws** *{@link SfError}{ name: 'NoResultsError' }* No results.
     *
     * @param devHubUsernameOrAlias The username or alias of the dev hub org.
     */
    checkScratchOrg(devHubUsernameOrAlias?: string): Promise<Partial<AuthFields>>;
    /**
     * Returns the Org object or null if this org is not affiliated with a Dev Hub (according to the local config).
     */
    getDevHubOrg(): Promise<Org | undefined>;
    /**
     * Returns `true` if the org is a Dev Hub.
     *
     * **Note** This relies on a cached value in the auth file. If that property
     * is not cached, this method will **always return false even if the org is a
     * dev hub**. If you need accuracy, use the {@link Org.determineIfDevHubOrg} method.
     */
    isDevHubOrg(): boolean;
    /**
     * Will delete 'this' instance remotely and any files locally
     *
     * @param controllingOrg username or Org that 'this.devhub' or 'this.production' refers to. AKA a DevHub for a scratch org, or a Production Org for a sandbox
     */
    deleteFrom(controllingOrg: string | Org): Promise<void>;
    /**
     * Will delete 'this' instance remotely and any files locally
     */
    delete(): Promise<void>;
    /**
     * Returns `true` if the org is a Dev Hub.
     *
     * Use a cached value. If the cached value is not set, then check access to the
     * ScratchOrgInfo object to determine if the org is a dev hub.
     *
     * @param forceServerCheck Ignore the cached value and go straight to the server
     * which will be required if the org flips on the dev hub after the value is already
     * cached locally.
     */
    determineIfDevHubOrg(forceServerCheck?: boolean): Promise<boolean>;
    /**
     * Returns `true` if the org is a scratch org.
     *
     * **Note** This relies on a cached value in the auth file. If that property
     * is not cached, this method will **always return false even if the org is a
     * scratch org**. If you need accuracy, use the {@link Org.determineIfScratch} method.
     */
    isScratch(): boolean;
    /**
     * Returns `true` if the org uses source tracking.
     * Side effect: updates files where the property doesn't currently exist
     */
    tracksSource(): Promise<boolean>;
    /**
     * Set the tracking property on the org's auth file
     *
     * @param value true or false (whether the org should use source tracking or not)
     */
    setTracksSource(value: boolean): Promise<void>;
    /**
     * Returns `true` if the org is a scratch org.
     *
     * Use a cached value. If the cached value is not set, then check
     * `Organization.IsSandbox == true && Organization.TrialExpirationDate != null`
     * using {@link Org.retrieveOrganizationInformation}.
     */
    determineIfScratch(): Promise<boolean>;
    /**
     * Returns `true` if the org is a sandbox.
     *
     * Use a cached value. If the cached value is not set, then check
     * `Organization.IsSandbox == true && Organization.TrialExpirationDate == null`
     * using {@link Org.retrieveOrganizationInformation}.
     */
    determineIfSandbox(): Promise<boolean>;
    /**
     * Retrieve a handful of fields from the Organization table in Salesforce. If this does not have the
     * data you need, just use {@link Connection.singleRecordQuery} with `SELECT <needed fields> FROM Organization`.
     *
     * @returns org information
     */
    retrieveOrganizationInformation(): Promise<OrganizationInformation>;
    /**
     * Some organization information is locally cached, such as if the org name or if it is a scratch org.
     * This method populates/updates the filesystem from information retrieved from the org.
     */
    updateLocalInformation(): Promise<
      | Pick<
          AuthFields,
          | Org.Fields.NAME
          | Org.Fields.INSTANCE_NAME
          | Org.Fields.NAMESPACE_PREFIX
          | Org.Fields.IS_SANDBOX
          | Org.Fields.IS_SCRATCH
          | Org.Fields.TRIAL_EXPIRATION_DATE
        >
      | undefined
    >;
    /**
     * Refreshes the auth for this org's instance by calling HTTP GET on the baseUrl of the connection object.
     */
    refreshAuth(): Promise<void>;
    /**
     * Reads and returns the content of all user auth files for this org as an array.
     */
    readUserAuthFiles(): Promise<AuthInfo[]>;
    /**
     * Adds a username to the user config for this org. For convenience `this` object is returned.
     *
     * ```
     * const org: Org = await Org.create({
     *   connection: await Connection.create({
     *     authInfo: await AuthInfo.create('foo@example.com')
     *   })
     * });
     * const userAuth: AuthInfo = await AuthInfo.create({
     *   username: 'bar@example.com'
     * });
     * await org.addUsername(userAuth);
     * ```
     *
     * @param {AuthInfo | string} auth The AuthInfo for the username to add.
     */
    addUsername(auth: AuthInfo | string): Promise<Org>;
    /**
     * Removes a username from the user config for this object. For convenience `this` object is returned.
     *
     * **Throws** *{@link SfError}{ name: 'MissingAuthInfoError' }* Auth info is missing.
     *
     * @param {AuthInfo | string} auth The AuthInfo containing the username to remove.
     */
    removeUsername(auth: AuthInfo | string): Promise<Org>;
    /**
     * set the sandbox config related to this given org
     *
     * @param orgId {string} orgId of the sandbox
     * @param config {SandboxFields} config of the sandbox
     */
    setSandboxConfig(orgId: string, config: SandboxFields): Promise<Org>;
    /**
     * get the sandbox config for the given orgId
     *
     * @param orgId {string} orgId of the sandbox
     */
    getSandboxConfig(orgId: string): Promise<Nullable<SandboxFields>>;
    /**
     * Retrieves the highest api version that is supported by the target server instance. If the apiVersion configured for
     * Sfdx is greater than the one returned in this call an api version mismatch occurs. In the case of the CLI that
     * results in a warning.
     */
    retrieveMaxApiVersion(): Promise<string>;
    /**
     * Returns the admin username used to create the org.
     */
    getUsername(): string | undefined;
    /**
     * Returns the orgId for this org.
     */
    getOrgId(): string;
    /**
     * Returns for the config aggregator.
     */
    getConfigAggregator(): ConfigAggregator;
    /**
     * Returns an org field. Returns undefined if the field is not set or invalid.
     */
    getField<T = AnyJson>(key: Org.Fields): T;
    /**
     * Returns a map of requested fields.
     */
    getFields(keys: Org.Fields[]): JsonMap;
    /**
     * Returns the JSForce connection for the org.
     * side effect: If you pass it an apiVersion, it will set it on the Org
     * so that future calls to getConnection() will also use that version.
     *
     * @param apiVersion The API version to use for the connection.
     */
    getConnection(apiVersion?: string): Connection;
    supportsSourceTracking(): Promise<boolean>;
    /**
     * query SandboxProcess via sandbox name
     *
     * @param name SandboxName to query for
     */
    querySandboxProcessBySandboxName(name: string): Promise<SandboxProcessObject>;
    /**
     * query SandboxProcess via SandboxInfoId
     *
     * @param id SandboxInfoId to query for
     */
    querySandboxProcessBySandboxInfoId(id: string): Promise<SandboxProcessObject>;
    /**
     * query SandboxProcess via Id
     *
     * @param id SandboxProcessId to query for
     */
    querySandboxProcessById(id: string): Promise<SandboxProcessObject>;
    /**
     * query SandboxProcess via SandboxOrganization (sandbox Org ID)
     *
     * @param sandboxOrgId SandboxOrganization ID to query for
     */
    querySandboxProcessByOrgId(sandboxOrgId: string): Promise<SandboxProcessObject>;
    /**
     * Initialize async components.
     */
    protected init(): Promise<void>;
    /**
     * **Throws** *{@link SfError}{ name: 'NotSupportedError' }* Throws an unsupported error.
     */
    protected getDefaultOptions(): Org.Options;
    private getLocalDataDir;
    /**
     * Gets the sandboxProcessObject and then polls for it to complete.
     *
     * @param sandboxProcessName sanbox process name
     * @param options { wait?: Duration; interval?: Duration }
     * @returns {SandboxProcessObject} The SandboxProcessObject for the sandbox
     */
    private authWithRetriesByName;
    /**
     * Polls the sandbox org for the sandboxProcessObject.
     *
     * @param sandboxProcessObj: The in-progress sandbox signup request
     * @param options { wait?: Duration; interval?: Duration }
     * @returns {SandboxProcessObject}
     */
    private authWithRetries;
    /**
     * Query the sandbox for the SandboxProcessObject by sandbox name
     *
     * @param sandboxName The name of the sandbox to query
     * @returns {SandboxProcessObject} The SandboxProcessObject for the sandbox
     */
    private queryLatestSandboxProcessBySandboxName;
    private queryProduction;
    private destroySandbox;
    private destroyScratchOrg;
    /**
     * this method will delete the sandbox org from the production org and clean up any local files
     *
     * @param prodOrg - Production org associated with this sandbox
     * @private
     */
    private deleteSandbox;
    /**
     * If this Org is a scratch org, calling this method will delete the scratch org from the DevHub and clean up any local files
     *
     * @param devHub - optional DevHub Org of the to-be-deleted scratch org
     * @private
     */
    private deleteScratchOrg;
    /**
     * Delete an auth info file from the local file system and any related cache information for
     * this Org. You don't want to call this method directly. Instead consider calling Org.remove()
     */
    private removeAuth;
    /**
     * Deletes the users config file
     */
    private removeUsersConfig;
    private manageDelete;
    /**
     * Remove the org users auth file.
     *
     * @param throwWhenRemoveFails true if manageDelete should throw or not if the deleted fails.
     */
    private removeUsers;
    private removeSandboxConfig;
    private writeSandboxAuthFile;
    private pollStatusAndAuth;
    /**
     * query SandboxProcess using supplied where clause
     *
     * @param where clause to query for
     * @private
     */
    private querySandboxProcess;
    /**
     * determines if the sandbox has successfully been created
     *
     * @param sandboxProcessObj sandbox signup progress
     * @private
     */
    private sandboxSignupComplete;
    private validateWaitOptions;
    /**
     * removes source tracking files hosted in the project/.sf/orgs/<org id>/
     *
     * @private
     */
    private removeSourceTrackingFiles;
  }
  export namespace Org {
    /**
     * Constructor Options for and Org.
     */
    type Options = {
      aliasOrUsername?: string;
      connection?: Connection;
      aggregator?: ConfigAggregator;
      isDevHub?: boolean;
    };
    /**
     * Scratch Org status.
     */
    enum Status {
      /**
       * The scratch org is active.
       */
      ACTIVE = 'ACTIVE',
      /**
       * The scratch org has expired.
       */
      EXPIRED = 'EXPIRED',
      /**
       * The org is a scratch Org but no dev hub is indicated.
       */
      UNKNOWN = 'UNKNOWN',
      /**
       * The dev hub configuration is reporting an active Scratch org but the AuthInfo cannot be found.
       */
      MISSING = 'MISSING',
    }
    /**
     * Org Fields.
     */
    enum Fields {
      /**
       * The org alias.
       */
      ALIAS = 'alias',
      CREATED = 'created',
      NAME = 'name',
      NAMESPACE_PREFIX = 'namespacePrefix',
      INSTANCE_NAME = 'instanceName',
      TRIAL_EXPIRATION_DATE = 'trailExpirationDate',
      /**
       * The Salesforce instance the org was created on. e.g. `cs42`.
       */
      CREATED_ORG_INSTANCE = 'createdOrgInstance',
      /**
       * The username of the dev hub org that created this org. Only populated for scratch orgs.
       */
      DEV_HUB_USERNAME = 'devHubUsername',
      /**
       * The full url of the instance the org lives on.
       */
      INSTANCE_URL = 'instanceUrl',
      /**
       * Is the current org a dev hub org. e.g. They have access to the `ScratchOrgInfo` object.
       */
      IS_DEV_HUB = 'isDevHub',
      /**
       * Is the current org a scratch org. e.g. Organization has IsSandbox == true and TrialExpirationDate != null.
       */
      IS_SCRATCH = 'isScratch',
      /**
       * Is the current org a sandbox (not a scratch org on a non-prod instance), but an actual Sandbox org). e.g. Organization has IsSandbox == true and TrialExpirationDate == null.
       */
      IS_SANDBOX = 'isSandbox',
      /**
       * The login url of the org. e.g. `https://login.salesforce.com` or `https://test.salesforce.com`.
       */
      LOGIN_URL = 'loginUrl',
      /**
       * The org ID.
       */
      ORG_ID = 'orgId',
      /**
       * The `OrgStatus` of the org.
       */
      STATUS = 'status',
      /**
       * The snapshot used to create the scratch org.
       */
      SNAPSHOT = 'snapshot',
      /**
       * true: the org supports and wants source tracking
       * false: the org opted out of tracking or can't support it
       */
      TRACKS_SOURCE = 'tracksSource',
    }
  }
}
declare module '@salesforce/core/org/orgConfigProperties' {
  import { ConfigValue } from '@salesforce/core/config/configStackTypes';
  export enum OrgConfigProperties {
    /**
     * Username associate with the default org.
     */
    TARGET_ORG = 'target-org',
    /**
     * Username associated with the default dev hub org.
     */
    TARGET_DEV_HUB = 'target-dev-hub',
    /**
     * The api version
     */
    ORG_API_VERSION = 'org-api-version',
    /**
     * Custom templates repo or local location.
     */
    ORG_CUSTOM_METADATA_TEMPLATES = 'org-custom-metadata-templates',
    /**
     * Allows users to override the 10,000 result query limit.
     */
    ORG_MAX_QUERY_LIMIT = 'org-max-query-limit',
    /**
     * The instance url of the org.
     */
    ORG_INSTANCE_URL = 'org-instance-url',
    /**
     * The sid for the debugger configuration.
     */
    ORG_ISV_DEBUGGER_SID = 'org-isv-debugger-sid',
    /**
     * The url for the debugger configuration.
     */
    ORG_ISV_DEBUGGER_URL = 'org-isv-debugger-url',
    /**
     * Capitalize record types when deploying scratch org settings
     */
    ORG_CAPITALIZE_RECORD_TYPES = 'org-capitalize-record-types',
  }
  export const ORG_CONFIG_ALLOWED_PROPERTIES: (
    | {
        key: OrgConfigProperties;
        description: string;
        input?: undefined;
        hidden?: undefined;
        encrypted?: undefined;
      }
    | {
        key: OrgConfigProperties;
        description: string;
        input: {
          validator: (value: ConfigValue) => boolean;
          failedMessage: string;
        };
        hidden?: undefined;
        encrypted?: undefined;
      }
    | {
        key: OrgConfigProperties;
        description: string;
        hidden: boolean;
        input: {
          validator: (value: ConfigValue) => boolean;
          failedMessage: string;
        };
        encrypted?: undefined;
      }
    | {
        key: OrgConfigProperties;
        description: string;
        encrypted: boolean;
        input: {
          validator: (value: ConfigValue) => boolean;
          failedMessage: string;
        };
        hidden?: undefined;
      }
  )[];
}
declare module '@salesforce/core/org/permissionSetAssignment' {
  import { Org } from '@salesforce/core/org/org';
  /**
   * Map of fields name for a permission set assignment
   */
  export type PermissionSetAssignmentFields = {
    assigneeId: string;
    permissionSetId: string;
  };
  /**
   * A class for assigning a Salesforce User to one or more permission sets.
   */
  export class PermissionSetAssignment {
    private logger;
    private org;
    private constructor();
    /**
     * Creates a new instance of PermissionSetAssignment.
     *
     * @param org The target org for the assignment.
     */
    static init(org: Org): Promise<PermissionSetAssignment>;
    /**
     * Assigns a user to one or more permission sets.
     *
     * @param id A user id
     * @param permSetString An array of permission set names.
     */
    create(id: string, permSetString: string): Promise<PermissionSetAssignmentFields>;
    /**
     * Parses a permission set name based on if it has a namespace or not.
     *
     * @param permSetString The permission set string.
     */
    private parsePermissionSetString;
  }
}
declare module '@salesforce/core/org/scratchOrgCache' {
  import { JsonMap } from '@salesforce/ts-types';
  import { TTLConfig } from '@salesforce/core/config/ttlConfig';
  export type CachedOptions = {
    hubUsername: string;
    /** stores the scratch definition, including settings/objectSettings */
    definitionjson: JsonMap;
    hubBaseUrl: string;
    /** may be required for auth*/
    clientSecret?: string;
    signupTargetLoginUrlConfig?: string;
    apiVersion?: string;
    alias?: string;
    setDefault?: boolean;
    tracksSource?: boolean;
  };
  export class ScratchOrgCache extends TTLConfig<TTLConfig.Options, CachedOptions> {
    static getFileName(): string;
    static getDefaultOptions(): TTLConfig.Options;
    static unset(key: string): Promise<void>;
  }
}
declare module '@salesforce/core/org/scratchOrgCreate' {
  import { Duration } from '@salesforce/kit';
  import { Org } from '@salesforce/core/org/org';
  import { ScratchOrgInfo } from '@salesforce/core/org/scratchOrgTypes';
  import { AuthFields, AuthInfo } from '@salesforce/core/org/authInfo';
  export const DEFAULT_STREAM_TIMEOUT_MINUTES = 6;
  export type ScratchOrgCreateResult = {
    username?: string;
    scratchOrgInfo?: ScratchOrgInfo;
    authInfo?: AuthInfo;
    authFields?: AuthFields;
    warnings: string[];
  };
  export type ScratchOrgCreateOptions = {
    /** the environment hub org */
    hubOrg: Org;
    /** The connected app consumer key. */
    connectedAppConsumerKey?: string;
    /** duration of the scratch org (in days) (default:1, min:1, max:30) */
    durationDays?: number;
    /** create the scratch org with no namespace */
    nonamespace?: boolean;
    /** create the scratch org with no second-generation package ancestors */
    noancestors?: boolean;
    /** the streaming client socket timeout (in minutes) must be an instance of the Duration utility class (default:6) */
    wait?: Duration;
    /** number of scratch org auth retries after scratch org is successfully signed up (default:0, min:0, max:10) */
    retry?: number;
    /** target server instance API version */
    apiversion?: string;
    /**
     * org definition in JSON format, stringified
     *
     * @deprecated use orgConfig
     */
    definitionjson?: string;
    /**
     * path to an org definition file
     *
     * @deprecated use orgConfig
     * */
    definitionfile?: string;
    /** overrides definitionjson */
    orgConfig?: Record<string, unknown>;
    /** OAuth client secret of personal connected app */
    clientSecret?: string;
    /** alias to set for the created org */
    alias?: string;
    /** after complete, set the org as the default */
    setDefault?: boolean;
    /** if false, do not use source tracking for this scratch org */
    tracksSource?: boolean;
  };
  export const scratchOrgResume: (jobId: string) => Promise<ScratchOrgCreateResult>;
  export const scratchOrgCreate: (options: ScratchOrgCreateOptions) => Promise<ScratchOrgCreateResult>;
}
declare module '@salesforce/core/org/scratchOrgErrorCodes' {
  import { Optional } from '@salesforce/ts-types';
  import { ScratchOrgInfo } from '@salesforce/core/org/scratchOrgTypes';
  import { ScratchOrgCache } from '@salesforce/core/org/scratchOrgCache';
  export const validateScratchOrgInfoForResume: ({
    jobId,
    scratchOrgInfo,
    cache,
    hubUsername,
  }: {
    jobId: string;
    scratchOrgInfo: ScratchOrgInfo;
    cache: ScratchOrgCache;
    hubUsername: string;
  }) => Promise<ScratchOrgInfo>;
  export const checkScratchOrgInfoForErrors: (
    orgInfo: Optional<ScratchOrgInfo>,
    hubUsername: Optional<string>
  ) => Promise<ScratchOrgInfo>;
}
declare module '@salesforce/core/org/scratchOrgFeatureDeprecation' {
  type FeatureTypes = {
    simpleFeatureMapping: {
      [key: string]: string[];
    };
    quantifiedFeatureMapping: Record<string, string | number | boolean | null | undefined>;
    deprecatedFeatures: string[];
  };
  export class ScratchOrgFeatureDeprecation {
    private featureTypes;
    constructor(options?: FeatureTypes);
    /**
     * Gets list of feature warnings that should be logged
     *
     * @param features The requested features.
     * @returns List of string feature warnings.
     */
    getFeatureWarnings(features: string | string[]): string[];
    /**
     * Removes all deprecated features for the organization.
     *
     * @param features List of features to filter
     * @returns feature array with proper mapping.
     */
    filterDeprecatedFeatures(features: string[]): string[];
  }
  export {};
}
declare module '@salesforce/core/org/scratchOrgInfoApi' {
  import { Duration } from '@salesforce/kit';
  import { SaveResult } from '@jsforce/jsforce-node';
  import { AuthInfo } from '@salesforce/core/org/authInfo';
  import { Org } from '@salesforce/core/org/org';
  import SettingsGenerator from '@salesforce/core/org/scratchOrgSettingsGenerator';
  import { ScratchOrgInfo } from '@salesforce/core/org/scratchOrgTypes';
  export interface JsForceError extends Error {
    errorCode: string;
    fields: string[];
  }
  /**
   *
   * @param hubOrg Org
   * @param id Record ID for the ScratchOrgInfoObject
   * @returns Promise<ScratchOrgInfo>
   */
  export const queryScratchOrgInfo: (hubOrg: Org, id: string) => Promise<ScratchOrgInfo>;
  /**
   * after we successfully signup an org we need to trade the auth token for access and refresh token.
   *
   * scratchOrgInfoComplete - The completed ScratchOrgInfo which should contain an access token.
   * hubOrg - the environment hub org
   * clientSecret - The OAuth client secret. May be null for JWT OAuth flow.
   * signupTargetLoginUrlConfig - Login url
   * retry - auth retry attempts
   *
   * @returns {Promise<AuthInfo>}
   */
  export const authorizeScratchOrg: (options: {
    scratchOrgInfoComplete: ScratchOrgInfo;
    hubOrg: Org;
    clientSecret?: string;
    signupTargetLoginUrlConfig?: string;
    retry?: number;
  }) => Promise<AuthInfo>;
  /**
   * This extracts orgPrefs/settings from the user input and performs a basic scratchOrgInfo request.
   *
   * @param hubOrg - the environment hub org
   * @param scratchOrgRequest - An object containing the fields of the ScratchOrgInfo
   * @param settings - An object containing org settings
   * @returns {Promise<SaveResult>}
   */
  export const requestScratchOrgCreation: (
    hubOrg: Org,
    scratchOrgRequest: ScratchOrgInfo,
    settings: SettingsGenerator
  ) => Promise<SaveResult>;
  /**
   * This retrieves the ScratchOrgInfo, polling until the status is Active or Error
   *
   * @param hubOrg
   * @param scratchOrgInfoId - the id of the scratchOrgInfo that we are retrieving
   * @param timeout - A Duration object
   * @returns {Promise<ScratchOrgInfo>}
   */
  export const pollForScratchOrgInfo: (
    hubOrg: Org,
    scratchOrgInfoId: string,
    timeout?: Duration
  ) => Promise<ScratchOrgInfo>;
  /**
   * Deploy settings to the newly created scratch org
   *
   * @param scratchOrg an instance of the Org class
   * @param orgSettings an instance of the SettingsGenerator class
   * @param apiVersion the api version (used when created the package.xml)
   */
  export const deploySettings: (
    scratchOrg: Org,
    orgSettings: SettingsGenerator,
    apiVersion: string,
    timeout?: Duration
  ) => Promise<void>;
  /**
   *
   * @param scratchOrgAuthInfo an AuthInfo class from the scratch org
   * @returns AuthInfo
   */
  export const resolveUrl: (scratchOrgAuthInfo: AuthInfo) => Promise<AuthInfo>;
  export const updateRevisionCounterToZero: (scratchOrg: Org) => Promise<void>;
}
declare module '@salesforce/core/org/scratchOrgInfoGenerator' {
  import { SfProjectJson } from '@salesforce/core/sfProject';
  import { Org } from '@salesforce/core/org/org';
  import { ScratchOrgInfo } from '@salesforce/core/org/scratchOrgTypes';
  type PartialScratchOrgInfo = Pick<
    ScratchOrgInfo,
    | 'ConnectedAppConsumerKey'
    | 'AuthCode'
    | 'Snapshot'
    | 'Status'
    | 'LoginUrl'
    | 'SignupEmail'
    | 'SignupUsername'
    | 'SignupInstance'
    | 'Username'
  >;
  export type ScratchOrgInfoPayload = {
    orgName: string;
    package2AncestorIds: string;
    features: string | string[];
    connectedAppConsumerKey: string;
    namespace: string;
    connectedAppCallbackUrl: string;
    durationDays: number;
  } & PartialScratchOrgInfo;
  /**
   * Generates the package2AncestorIds scratch org property
   *
   * @param scratchOrgInfo - the scratchOrgInfo passed in by the user
   * @param projectJson - sfProjectJson
   * @param hubOrg - the hub org, in case we need to do queries
   */
  export const getAncestorIds: (
    scratchOrgInfo: ScratchOrgInfoPayload,
    projectJson: SfProjectJson,
    hubOrg: Org
  ) => Promise<string>;
  /**
   * Takes in a scratchOrgInfo and fills in the missing fields
   *
   * @param hubOrg the environment hub org
   * @param scratchOrgInfoPayload - the scratchOrgInfo passed in by the user
   * @param nonamespace create the scratch org with no namespace
   * @param ignoreAncestorIds true if the sfdx-project.json ancestorId keys should be ignored
   */
  export const generateScratchOrgInfo: ({
    hubOrg,
    scratchOrgInfoPayload,
    nonamespace,
    ignoreAncestorIds,
  }: {
    hubOrg: Org;
    scratchOrgInfoPayload: ScratchOrgInfoPayload;
    nonamespace?: boolean;
    ignoreAncestorIds?: boolean;
  }) => Promise<ScratchOrgInfoPayload>;
  /**
   * Returns a valid signup json
   *
   * definitionjson org definition in JSON format
   * definitionfile path to an org definition file
   * connectedAppConsumerKey The connected app consumer key. May be null for JWT OAuth flow.
   * durationdays duration of the scratch org (in days) (default:1, min:1, max:30)
   * nonamespace create the scratch org with no namespace
   * noancestors do not include second-generation package ancestors in the scratch org
   * orgConfig overrides definitionjson
   *
   * @returns scratchOrgInfoPayload: ScratchOrgInfoPayload;
   ignoreAncestorIds: boolean;
   warnings: string[];
   */
  export const getScratchOrgInfoPayload: (options: {
    durationDays: number;
    definitionjson?: string;
    definitionfile?: string;
    connectedAppConsumerKey?: string;
    nonamespace?: boolean;
    noancestors?: boolean;
    orgConfig?: Record<string, unknown>;
  }) => Promise<{
    scratchOrgInfoPayload: ScratchOrgInfoPayload;
    ignoreAncestorIds: boolean;
    warnings: string[];
  }>;
  export {};
}
declare module '@salesforce/core/org/scratchOrgLifecycleEvents' {
  import { AuthFields } from '@salesforce/core/org/authInfo';
  import { ScratchOrgInfo } from '@salesforce/core/org/scratchOrgTypes';
  export const scratchOrgLifecycleEventName = 'scratchOrgLifecycleEvent';
  export const scratchOrgLifecycleStages: readonly [
    'prepare request',
    'send request',
    'wait for org',
    'available',
    'authenticate',
    'deploy settings',
    'done'
  ];
  export type ScratchOrgLifecycleEvent = {
    stage: (typeof scratchOrgLifecycleStages)[number];
    scratchOrgInfo?: ScratchOrgInfo;
  };
  export const emit: (event: ScratchOrgLifecycleEvent) => Promise<void>;
  export const emitPostOrgCreate: (authFields: AuthFields) => Promise<void>;
}
declare module '@salesforce/core/org/scratchOrgSettingsGenerator' {
  import { Duration } from '@salesforce/kit';
  import { JsonMap } from '@salesforce/ts-types';
  import { ScratchOrgInfo, ObjectSetting } from '@salesforce/core/org/scratchOrgTypes';
  import { Org } from '@salesforce/core/org/org';
  export enum RequestStatus {
    Pending = 'Pending',
    InProgress = 'InProgress',
    Succeeded = 'Succeeded',
    SucceededPartial = 'SucceededPartial',
    Failed = 'Failed',
    Canceling = 'Canceling',
    Canceled = 'Canceled',
  }
  export type SettingType = {
    members: string[];
    name: 'CustomObject' | 'RecordType' | 'BusinessProcess' | 'Settings';
  };
  export type PackageFile = {
    '@': {
      xmlns: string;
    };
    types: SettingType[];
    version: string;
  };
  export const createObjectFileContent: ({
    allRecordTypes,
    allBusinessProcesses,
    apiVersion,
    settingData,
    objectSettingsData,
  }: {
    allRecordTypes?: string[];
    allBusinessProcesses?: string[];
    apiVersion: string;
    settingData?: Record<string, unknown>;
    objectSettingsData?: {
      [objectName: string]: ObjectSetting;
    };
  }) => PackageFile;
  export const createRecordTypeAndBusinessProcessFileContent: (
    objectName: string,
    json: Record<string, unknown>,
    allRecordTypes: string[],
    allBusinessProcesses: string[],
    capitalizeRecordTypes: boolean
  ) => JsonMap;
  /**
   * Helper class for dealing with the settings that are defined in a scratch definition file.  This class knows how to extract the
   * settings from the definition, how to expand them into a MD directory and how to generate a package.xml.
   */
  export default class SettingsGenerator {
    private settingData?;
    private objectSettingsData?;
    private logger;
    private writer;
    private allRecordTypes;
    private allBusinessProcesses;
    private readonly shapeDirName;
    private readonly packageFilePath;
    private readonly capitalizeRecordTypes;
    constructor(options?: {
      mdApiTmpDir?: string;
      shapeDirName?: string;
      asDirectory?: boolean;
      capitalizeRecordTypes?: boolean;
    });
    /** extract the settings from the scratch def file, if they are present. */
    extract(scratchDef: ScratchOrgInfo): Promise<{
      settings: Record<string, unknown> | undefined;
      objectSettings:
        | {
            [objectName: string]: ObjectSetting;
          }
        | undefined;
    }>;
    /** True if we are currently tracking setting or object setting data. */
    hasSettings(): boolean;
    /** Create temporary deploy directory used to upload the scratch org shape.
     * This will create the dir, all of the .setting files and minimal object files needed for objectSettings
     */
    createDeploy(): Promise<void>;
    /**
     * Deploys the settings to the org.
     */
    deploySettingsViaFolder(scratchOrg: Org, apiVersion: string, timeout?: Duration): Promise<void>;
    createDeployPackageContents(apiVersion: string): Promise<void>;
    getShapeDirName(): string;
    /**
     * Returns the destination where the writer placed the settings content.
     *
     */
    getDestinationPath(): string | undefined;
    private writeObjectSettingsIfNeeded;
    private writeSettingsIfNeeded;
  }
}
declare module '@salesforce/core/org/scratchOrgTypes' {
  import { JsonMap } from '@salesforce/ts-types';
  export type ScratchOrgInfo = {
    AdminEmail?: string;
    readonly CreatedDate?: string;
    ConnectedAppCallbackUrl?: string;
    ConnectedAppConsumerKey?: string;
    Country?: string;
    Description?: string;
    DurationDays?: number;
    Edition?: string;
    readonly ErrorCode?: string;
    readonly ExpirationDate?: string;
    Features?: string;
    HasSampleData?: boolean;
    readonly Id?: string;
    Language?: string;
    LoginUrl: string;
    readonly Name?: string;
    Namespace?: string;
    OrgName?: string;
    Release?: 'Current' | 'Previous' | 'Preview';
    readonly ScratchOrg?: string;
    SourceOrg?: string;
    readonly AuthCode: string;
    Snapshot?: string;
    readonly Status: 'New' | 'Creating' | 'Active' | 'Error' | 'Deleted';
    readonly SignupEmail: string;
    readonly SignupUsername: string;
    readonly SignupInstance: string;
    Username: string;
    settings?: Record<string, unknown>;
    objectSettings?: {
      [objectName: string]: ObjectSetting;
    };
    orgPreferences?: {
      enabled: string[];
      disabled: string[];
    };
  };
  export type ObjectSetting = {
    sharingModel?: string;
    defaultRecordType?: string;
  } & JsonMap;
}
declare module '@salesforce/core/org/user' {
  import { AsyncCreatable } from '@salesforce/kit';
  import { SecureBuffer } from '@salesforce/core/crypto/secureBuffer';
  import { Org } from '@salesforce/core/org/org';
  import { AuthInfo } from '@salesforce/core/org/authInfo';
  /**
   * A Map of Required Salesforce User fields.
   */
  export const REQUIRED_FIELDS: {
    id: string;
    username: string;
    lastName: string;
    alias: string;
    timeZoneSidKey: string;
    localeSidKey: string;
    emailEncodingKey: string;
    profileId: string;
    languageLocaleKey: string;
    email: string;
  };
  /**
   * Required fields type needed to represent a Salesforce User object.
   *
   * **See** https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_objects_user.htm
   */
  export type UserFields = {
    -readonly [K in keyof typeof REQUIRED_FIELDS]: string;
  };
  /**
   * Provides a default set of fields values that can be used to create a user. This is handy for
   * software development purposes.
   *
   * ```
   * const connection: Connection = await Connection.create({
   *   authInfo: await AuthInfo.create({ username: 'user@example.com' })
   * });
   * const org: Org = await Org.create({ connection });
   * const options: DefaultUserFields.Options = {
   *   templateUser: org.getUsername()
   * };
   * const fields = (await DefaultUserFields.create(options)).getFields();
   * ```
   */
  export class DefaultUserFields extends AsyncCreatable<DefaultUserFields.Options> {
    private logger;
    private userFields;
    private options;
    /**
     * @ignore
     */
    constructor(options: DefaultUserFields.Options);
    /**
     * Get user fields.
     */
    getFields(): UserFields;
    /**
     * Initialize asynchronous components.
     */
    protected init(): Promise<void>;
  }
  export namespace DefaultUserFields {
    /**
     * Used to initialize default values for fields based on a templateUser user. This user will be part of the
     * Standard User profile.
     */
    type Options = {
      templateUser: string;
      newUserName?: string;
    };
  }
  export type PasswordConditions = {
    length: number;
    complexity: number;
  };
  /**
   * A class for creating a User, generating a password for a user, and assigning a user to one or more permission sets.
   * See methods for examples.
   */
  export class User extends AsyncCreatable<User.Options> {
    private org;
    private logger;
    /**
     * @ignore
     */
    constructor(options: User.Options);
    /**
     * Generate default password for a user. Returns An encrypted buffer containing a utf8 encoded password.
     */
    static generatePasswordUtf8(passwordCondition?: PasswordConditions): SecureBuffer<void>;
    /**
     * Initialize a new instance of a user and return it.
     */
    init(): Promise<void>;
    /**
     * Assigns a password to a user. For a user to have the ability to assign their own password, the org needs the
     * following org feature: EnableSetPasswordInApi.
     *
     * @param info The AuthInfo object for user to assign the password to.
     * @param password [throwWhenRemoveFails = User.generatePasswordUtf8()] A SecureBuffer containing the new password.
     */
    assignPassword(info: AuthInfo, password?: SecureBuffer<void>): Promise<void>;
    /**
     * Methods to assign one or more permission set names to a user.
     *
     * @param id The Salesforce id of the user to assign the permission set to.
     * @param permsetNames An array of permission set names.
     *
     * ```
     * const username = 'user@example.com';
     * const connection: Connection = await Connection.create({
     *   authInfo: await AuthInfo.create({ username })
     * });
     * const org = await Org.create({ connection });
     * const user: User = await User.create({ org });
     * const fields: UserFields = await user.retrieve(username);
     * await user.assignPermissionSets(fields.id, ['sfdx', 'approver']);
     * ```
     */
    assignPermissionSets(id: string, permsetNames: string[]): Promise<void>;
    /**
     * Method for creating a new User.
     *
     * By default scratch orgs only allow creating 2 additional users. Work with Salesforce Customer Service to increase
     * user limits.
     *
     * The Org Preferences required to increase the number of users are:
     * Standard User Licenses
     * Salesforce CRM Content User
     *
     * @param fields The required fields for creating a user.
     *
     * ```
     * const connection: Connection = await Connection.create({
     *   authInfo: await AuthInfo.create({ username: 'user@example.com' })
     * });
     * const org = await Org.create({ connection });
     *
     * const defaultUserFields = await DefaultUserFields.create({ templateUser: 'devhub_user@example.com' });
     * const user: User = await User.create({ org });
     * const info: AuthInfo = await user.createUser(defaultUserFields.getFields());
     * ```
     */
    createUser(fields: UserFields): Promise<AuthInfo>;
    /**
     * Method to retrieve the UserFields for a user.
     *
     * @param username The username of the user.
     *
     * ```
     * const username = 'boris@thecat.com';
     * const connection: Connection = await Connection.create({
     *   authInfo: await AuthInfo.create({ username })
     * });
     * const org = await Org.create({ connection });
     * const user: User = await User.create({ org });
     * const fields: UserFields = await user.retrieve(username);
     * ```
     */
    retrieve(username: string): Promise<UserFields>;
    /**
     * Helper method that verifies the server's User object is available and if so allows persisting the Auth information.
     *
     * @param newUserAuthInfo The AuthInfo for the new user.
     */
    private describeUserAndSave;
    /**
     * Helper that makes a REST request to create the user, and update additional required fields.
     *
     * @param fields The configuration the new user should have.
     */
    private createUserInternal;
    private rawRequest;
    /**
     * Update the remaining required fields for the user.
     *
     * @param fields The fields for the user.
     */
    private updateRequiredUserFields;
  }
  export namespace User {
    /**
     * Used to initialize default values for fields based on a templateUser user. This user will be part of the
     * Standard User profile.
     */
    type Options = {
      org: Org;
    };
  }
}
declare module '@salesforce/core/schema/validator' {
  import { AnyJson, JsonMap } from '@salesforce/ts-types';
  import { Logger } from '@salesforce/core/logger/logger';
  /**
   * Loads a JSON schema and performs validations against JSON objects.
   */
  export class SchemaValidator {
    private schemaPath;
    private readonly schemasDir;
    private readonly logger;
    private schema?;
    /**
     * Creates a new `SchemaValidator` instance given a logger and path to a schema file.
     *
     * @param logger An {@link Logger} instance on which to base this class's logger.
     * @param schemaPath The path to the schema file to load and use for validation.
     */
    constructor(logger: Logger, schemaPath: string);
    /**
     * Loads a JSON schema from the `schemaPath` parameter provided at instantiation.
     */
    load(): Promise<JsonMap>;
    /**
     * Loads a JSON schema from the `schemaPath` parameter provided at instantiation.
     */
    loadSync(): JsonMap;
    /**
     * Performs validation of JSON data against the schema located at the `schemaPath` value provided
     * at instantiation.
     *
     * **Throws** *{@link SfError}{ name: 'ValidationSchemaFieldError' }* If there are known validations errors.
     * **Throws** *{@link SfError}{ name: 'ValidationSchemaUnknownError' }* If there are unknown validations errors.
     *
     * @param json A JSON value to validate against this instance's target schema.
     * @returns The validated JSON data.
     */
    validate(json: AnyJson): Promise<AnyJson>;
    /**
     * Performs validation of JSON data against the schema located at the `schemaPath` value provided
     * at instantiation.
     *
     * **Throws** *{@link SfError}{ name: 'ValidationSchemaFieldError' }* If there are known validations errors.
     * **Throws** *{@link SfError}{ name: 'ValidationSchemaUnknownError' }* If there are unknown validations errors.
     *
     * @param json A JSON value to validate against this instance's target schema.
     * @returns The validated JSON data.
     */
    validateSync<T extends AnyJson>(json: T): T;
    /**
     * Loads local, external schemas from URIs in the same directory as the local schema file.
     * Does not support loading from remote URIs.
     * Returns a map of external schema local URIs to loaded schema JSON objects.
     *
     * @param schema The main schema to look up references ($ref) in.
     * @returns An array of found referenced schemas.
     */
    private loadExternalSchemas;
    /**
     * Load another schema relative to the primary schema when referenced.  Only supports local schema URIs.
     *
     * @param uri The first segment of the $ref schema.
     */
    private loadExternalSchema;
    /**
     * Get a string representation of the schema validation errors.
     * Adds additional (human friendly) information to certain errors.
     *
     * @param errors An array of AJV (DefinedError) objects.
     */
    private getErrorsText;
  }
}
declare module '@salesforce/core/sfError' {
  import { AnyJson } from '@salesforce/ts-types';
  export type SfErrorOptions<T extends ErrorDataProperties = ErrorDataProperties> = {
    message: string;
    exitCode?: number;
    name?: string;
    data?: T;
    /** pass an Error.  For convenience in catch blocks, code will check that it is, in fact, an Error */
    cause?: unknown;
    context?: string;
    actions?: string[];
  };
  type ErrorDataProperties = AnyJson;
  type SfErrorToObjectResult = {
    name: string;
    message: string;
    exitCode: number;
    actions?: string[];
    context?: string;
    data?: ErrorDataProperties;
  };
  /**
   * A generalized sfdx error which also contains an action. The action is used in the
   * CLI to help guide users past the error.
   *
   * To throw an error in a synchronous function you must either pass the error message and actions
   * directly to the constructor, e.g.
   *
   * ```
   * // To load a message bundle (Note that __dirname should contain a messages folder)
   * Messages.importMessagesDirectory(__dirname);
   * const messages = Messages.load('myPackageName', 'myBundleName');
   *
   * // To throw a non-bundle based error:
   * throw new SfError(message.getMessage('myError'), 'MyErrorName');
   * ```
   */
  export class SfError<T extends ErrorDataProperties = ErrorDataProperties> extends Error {
    #private;
    readonly name: string;
    /**
     * Action messages. Hints to the users regarding what can be done to fix related issues.
     */
    actions?: string[];
    /**
     * SfdxCommand can return this process exit code.
     */
    exitCode: number;
    /**
     * The related context for this error.
     */
    context?: string;
    data?: T;
    /**
     * Create an SfError.
     *
     * @param message The error message.
     * @param name The error name. Defaults to 'SfError'.
     * @param actions The action message(s).
     * @param exitCodeOrCause The exit code which will be used by SfdxCommand or he underlying error that caused this error to be raised.
     * @param cause The underlying error that caused this error to be raised.
     */
    constructor(message: string, name?: string, actions?: string[], exitCodeOrCause?: number | Error, cause?: unknown);
    get code(): string;
    set code(code: string);
    /** like the constructor, but takes an typed object and let you also set context and data properties */
    static create<T extends ErrorDataProperties = ErrorDataProperties>(inputs: SfErrorOptions<T>): SfError<T>;
    /**
     * Convert an Error to an SfError.
     *
     * @param err The error to convert.
     */
    static wrap<T extends ErrorDataProperties = ErrorDataProperties>(err: unknown): SfError<T>;
    /**
     * Sets the context of the error. For convenience `this` object is returned.
     *
     * @param context The command name.
     */
    setContext(context: string): SfError;
    /**
     * An additional payload for the error. For convenience `this` object is returned.
     *
     * @param data The payload data.
     */
    setData(data: T): SfError;
    /**
     * Convert an {@link SfError} state to an object. Returns a plain object representing the state of this error.
     */
    toObject(): SfErrorToObjectResult;
  }
  export {};
}
declare module '@salesforce/core/sfProject' {
  import { Dictionary, JsonMap, Nullable, Optional } from '@salesforce/ts-types';
  import { ConfigFile } from '@salesforce/core/config/configFile';
  import { ConfigContents } from '@salesforce/core/config/configStackTypes';
  export type PackageDirDependency = {
    [k: string]: unknown;
    package: string;
    versionNumber?: string;
  };
  export type PackageDir = {
    ancestorId?: string;
    ancestorVersion?: string;
    default?: boolean;
    definitionFile?: string;
    dependencies?: PackageDirDependency[];
    includeProfileUserLicenses?: boolean;
    package?: string;
    packageMetadataAccess?: {
      permissionSets: string | string[];
      permissionSetLicenses: string | string[];
    };
    path: string;
    postInstallScript?: string;
    postInstallUrl?: string;
    releaseNotesUrl?: string;
    scopeProfiles?: boolean;
    uninstallScript?: string;
    versionDescription?: string;
    versionName?: string;
    versionNumber?: string;
    unpackagedMetadata?: {
      path: string;
    };
    seedMetadata?: {
      path: string;
    };
  };
  export type NamedPackageDir = PackageDir & {
    /**
     * The [normalized](https://nodejs.org/api/path.html#path_path_normalize_path) path used as the package name.
     */
    name: string;
    /**
     * The absolute path of the package.
     */
    fullPath: string;
  };
  export type ProjectJson = ConfigContents & {
    packageDirectories: PackageDir[];
    namespace?: string;
    sourceApiVersion?: string;
    sfdcLoginUrl?: string;
    signupTargetLoginUrl?: string;
    oauthLocalPort?: number;
    plugins?: {
      [k: string]: unknown;
    };
    packageAliases?: {
      [k: string]: string;
    };
  };
  /**
   * The sfdx-project.json config object. This file determines if a folder is a valid sfdx project.
   *
   * *Note:* Any non-standard (not owned by Salesforce) properties stored in sfdx-project.json should
   * be in a top level property that represents your project or plugin.
   *
   * ```
   * const project = await SfProject.resolve();
   * const projectJson = await project.resolveProjectConfig();
   * const myPluginProperties = projectJson.get('myplugin') || {};
   * myPluginProperties.myprop = 'someValue';
   * projectJson.set('myplugin', myPluginProperties);
   * await projectJson.write();
   * ```
   *
   * **See** [force:project:create](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_create_new.htm)
   */
  export class SfProjectJson extends ConfigFile<ConfigFile.Options, ProjectJson> {
    static BLOCKLIST: string[];
    static getFileName(): string;
    static getDefaultOptions(isGlobal?: boolean): ConfigFile.Options;
    read(): Promise<ProjectJson>;
    readSync(): ProjectJson;
    write(): Promise<ProjectJson>;
    writeSync(): ProjectJson;
    getDefaultOptions(options?: ConfigFile.Options): ConfigFile.Options;
    /**
     * Validates sfdx-project.json against the schema.
     *
     * Set the `SFDX_PROJECT_JSON_VALIDATION` environment variable to `true` to throw an error when schema validation fails.
     * A warning is logged by default when the file is invalid.
     *
     * ***See*** [sfdx-project.schema.json] ((https://github.com/forcedotcom/schemas/blob/main/sfdx-project.schema.json)
     */
    schemaValidate(): Promise<void>;
    /**
     * Returns the `packageDirectories` within sfdx-project.json, first reading
     * and validating the file if necessary.
     */
    getPackageDirectories(): Promise<PackageDir[]>;
    /**
     * Validates sfdx-project.json against the schema.
     *
     * Set the `SFDX_PROJECT_JSON_VALIDATION` environment variable to `true` to throw an error when schema validation fails.
     * A warning is logged by default when the file is invalid.
     *
     * ***See*** [sfdx-project.schema.json] ((https://github.com/forcedotcom/schemas/blob/main/sfdx-project.schema.json)
     */
    schemaValidateSync(): void;
    /**
     * Returns a read-only list of `packageDirectories` within sfdx-project.json, first reading
     * and validating the file if necessary. i.e. modifying this array will not affect the
     * sfdx-project.json file.
     */
    getPackageDirectoriesSync(): NamedPackageDir[];
    /**
     * Returns a read-only list of `packageDirectories` within sfdx-project.json, first reading
     * and validating the file if necessary. i.e. modifying this array will not affect the
     * sfdx-project.json file.
     *
     * There can be multiple packages in packageDirectories that point to the same directory.
     * This method only returns one packageDirectory entry per unique directory path. This is
     * useful when doing source operations based on directories but probably not as useful
     * for packaging operations that want to do something for each package entry.
     */
    getUniquePackageDirectories(): NamedPackageDir[];
    /**
     * Get a list of the unique package names from within sfdx-project.json. Use {@link SfProject.getUniquePackageDirectories}
     * for data other than the names.
     */
    getUniquePackageNames(): string[];
    /**
     * Has package directories defined in the project.
     */
    hasPackages(): boolean;
    /**
     * Has multiple package directories (MPD) defined in the project.
     */
    hasMultiplePackages(): boolean;
    /**
     * Has at least one package alias defined in the project.
     */
    hasPackageAliases(): Promise<boolean>;
    /**
     * Get package aliases defined in the project.
     */
    getPackageAliases(): Nullable<Dictionary<string>>;
    /**
     * Add a package alias to the project.
     * If the alias already exists, it will be overwritten.
     *
     * @param alias
     * @param id
     */
    addPackageAlias(alias: string, id: string): void;
    /**
     * Add a package directory to the project.
     * If the package directory already exists, the new directory
     * properties will be merged with the existing properties.
     *
     * @param packageDir
     */
    addPackageDirectory(packageDir: NamedPackageDir): void;
    private doesPackageExist;
    private validateKeys;
  }
  /**
   * Represents an SFDX project directory. This directory contains a {@link SfProjectJson} config file as well as
   * a hidden .sfdx folder that contains all the other local project config files.
   *
   * ```
   * const project = await SfProject.resolve();
   * const projectJson = await project.resolveProjectConfig();
   * console.log(projectJson.sfdcLoginUrl);
   * ```
   */
  export class SfProject {
    private path;
    private static instances;
    private projectConfig;
    private sfProjectJson;
    private sfProjectJsonGlobal;
    private packageDirectories?;
    private activePackage;
    private packageAliases;
    /**
     * Do not directly construct instances of this class -- use {@link SfProject.resolve} instead.
     *
     * @ignore
     */
    protected constructor(path: string);
    /**
     * Get a Project from a given path or from the working directory.
     *
     * @param path The path of the project.
     *
     * **Throws** *{@link SfError}{ name: 'InvalidProjectWorkspaceError' }* If the current folder is not located in a workspace.
     */
    static resolve(path?: string): Promise<SfProject>;
    /**
     * Get a Project from a given path or from the working directory.
     *
     * @param path The path of the project.
     *
     * **Throws** *{@link SfError}{ name: 'InvalidProjectWorkspaceError' }* If the current folder is not located in a workspace.
     */
    static getInstance(path?: string): SfProject;
    /**
     * Performs an upward directory search for an sfdx project file. Returns the absolute path to the project.
     *
     * @param dir The directory path to start traversing from.
     *
     * **Throws** *{@link SfError}{ name: 'InvalidProjectWorkspaceError' }* If the current folder is not located in a workspace.
     *
     * **See** {@link traverseForFile}
     *
     * **See** [process.cwd()](https://nodejs.org/api/process.html#process_process_cwd)
     */
    static resolveProjectPath(dir?: string): Promise<string>;
    /**
     * Performs a synchronous upward directory search for an sfdx project file. Returns the absolute path to the project.
     *
     * @param dir The directory path to start traversing from.
     *
     * **Throws** *{@link SfError}{ name: 'InvalidProjectWorkspaceError' }* If the current folder is not located in a workspace.
     *
     * **See** {@link traverseForFileSync}
     *
     * **See** [process.cwd()](https://nodejs.org/api/process.html#process_process_cwd)
     */
    static resolveProjectPathSync(dir?: string): string;
    /** shared method for resolve and getInstance.
     * Cannot be a module-level function because instances is private */
    private static getMemoizedInstance;
    /**
     * Returns the project path.
     */
    getPath(): string;
    /**
     * Get the sfdx-project.json config. The global sfdx-project.json is used for user defaults
     * that are not checked in to the project specific file.
     *
     * *Note:* When reading values from {@link SfProjectJson}, it is recommended to use
     * {@link SfProject.resolveProjectConfig} instead.
     *
     * @param isGlobal True to get the global project file, otherwise the local project config.
     */
    retrieveSfProjectJson(isGlobal?: boolean): Promise<SfProjectJson>;
    /**
     * Get the sfdx-project.json config. The global sfdx-project.json is used for user defaults
     * that are not checked in to the project specific file.
     *
     * *Note:* When reading values from {@link SfProjectJson}, it is recommended to use
     * {@link SfProject.resolveProjectConfig} instead.
     *
     * This is the sync method of {@link SfProject.resolveSfProjectJson}
     *
     * @param isGlobal True to get the global project file, otherwise the local project config.
     */
    getSfProjectJson(isGlobal?: boolean): SfProjectJson;
    /**
     * Returns a read-only list of `packageDirectories` within sfdx-project.json, first reading
     * and validating the file if necessary. i.e. modifying this array will not affect the
     * sfdx-project.json file.
     */
    getPackageDirectories(): NamedPackageDir[];
    /**
     * Returns a read-only list of `packageDirectories` within sfdx-project.json, first reading
     * and validating the file if necessary. i.e. modifying this array will not affect the
     * sfdx-project.json file.
     *
     * There can be multiple packages in packageDirectories that point to the same directory.
     * This method only returns one packageDirectory entry per unique directory path. This is
     * useful when doing source operations based on directories but probably not as useful
     * for packaging operations that want to do something for each package entry.
     */
    getUniquePackageDirectories(): NamedPackageDir[];
    /**
     * Get a list of the unique package names from within sfdx-project.json. Use {@link SfProject.getUniquePackageDirectories}
     * for data other than the names.
     */
    getUniquePackageNames(): string[];
    /**
     * Returns the package from a file path.
     *
     * @param path A file path. E.g. /Users/jsmith/projects/ebikes-lwc/force-app/apex/my-cls.cls
     */
    getPackageFromPath(path: string): Optional<NamedPackageDir>;
    /**
     * Returns the package name, E.g. 'force-app', from a file path.
     *
     * @param path A file path. E.g. /Users/jsmith/projects/ebikes-lwc/force-app/apex/my-cls.cls
     */
    getPackageNameFromPath(path: string): Optional<string>;
    /**
     * Returns the package directory.
     *
     * @param packageName Name of the package directory.  E.g., 'force-app'
     */
    getPackage(packageName: string): Optional<NamedPackageDir>;
    /**
     * Returns the package directory.
     *
     * @param packageName Name of the package directory.  E.g., 'force-app'
     */
    findPackage(predicate: (packageDir: NamedPackageDir) => boolean): Optional<NamedPackageDir>;
    /**
     * Returns the absolute path of the package directory ending with the path separator.
     * E.g., /Users/jsmith/projects/ebikes-lwc/force-app/
     *
     * @param packageName Name of the package directory.  E.g., 'force-app'
     */
    getPackagePath(packageName: string): Optional<string>;
    /**
     * Has package directories defined in the project.
     */
    hasPackages(): boolean;
    /**
     * Has multiple package directories (MPD) defined in the project.
     */
    hasMultiplePackages(): boolean;
    /**
     * Get the currently activated package on the project. This has no implication on sfdx-project.json
     * but is useful for keeping track of package and source specific options in a process.
     */
    getActivePackage(): Nullable<NamedPackageDir>;
    /**
     * Set the currently activated package on the project. This has no implication on sfdx-project.json
     * but is useful for keeping track of package and source specific options in a process.
     *
     * @param packageName The package name to activate. E.g. 'force-app'
     */
    setActivePackage(packageName: Nullable<string>): void;
    /**
     * Get the project's default package directory defined in sfdx-project.json using first 'default: true'
     * found. The first entry is returned if no default is specified.
     */
    getDefaultPackage(): NamedPackageDir;
    /**
     * The project config is resolved from local and global {@link SfProjectJson},
     * {@link ConfigAggregator}, and a set of defaults. It is recommended to use
     * this when reading values from SfProjectJson.
     *
     * The global {@link SfProjectJson} is used to allow the user to provide default values they
     * may not want checked into their project's source.
     *
     * @returns A resolved config object that contains a bunch of different
     * properties, including some 3rd party custom properties.
     */
    resolveProjectConfig(): Promise<JsonMap>;
    hasPackageAliases(): Promise<boolean>;
    /**
     * Returns a read-only list of `packageDirectories` within sfdx-project.json, first reading
     * and validating the file if necessary. i.e. modifying this array will not affect the
     * sfdx-project.json file.
     */
    getPackageAliases(): Nullable<Dictionary<string>>;
    getPackageIdFromAlias(alias: string): Optional<string>;
    getAliasesFromPackageId(id: string): string[];
  }
}
declare module '@salesforce/core/stateAggregator/accessors/aliasAccessor' {
  import { AsyncOptionalCreatable } from '@salesforce/kit';
  import { Nullable } from '@salesforce/ts-types';
  import { AuthFields } from '@salesforce/core/org/authInfo';
  import { ConfigContents } from '@salesforce/core/config/configStackTypes';
  export type Aliasable = string | Partial<AuthFields>;
  export const DEFAULT_GROUP = 'orgs';
  export const FILENAME = 'alias.json';
  export class AliasAccessor extends AsyncOptionalCreatable {
    private fileLocation;
    /** orgs is the default group */
    private aliasStore;
    /**
     * Returns all the aliases for all the values
     */
    getAll(): ConfigContents<string>;
    /**
     * Returns all the aliases for a given entity
     *
     * @param entity the aliasable entity that you want to get the aliases of
     */
    getAll(entity: Aliasable): string[];
    /**
     * Returns the first alias found for a given entity
     *
     * @param entity the aliasable entity that you want to get the alias of
     */
    get(entity: Aliasable): Nullable<string>;
    /**
     * Returns the value that corresponds to the given alias if it exists
     *
     * @param alias the alias that corresponds to a value
     */
    getValue(alias: string): Nullable<string>;
    /**
     * Returns the username that corresponds to the given alias if it exists
     *
     * @param alias the alias that corresponds to a username
     */
    getUsername(alias: string): Nullable<string>;
    /**
     * If the provided string is an alias, it returns the corresponding username.
     * If the provided string is not an alias, we assume that the provided string
     * is the username and return it.
     *
     * This method is helpful when you don't know if the string you have is a username
     * or an alias.
     *
     * @param usernameOrAlias a string that might be a username or might be an alias
     */
    resolveUsername(usernameOrAlias: string): string;
    /**
     * If the provided string is an alias, return it.
     * If the provided string is not an alias, return the username of the provided alias
     *
     * This method is helpful when you don't know if the string you have is a username
     * or an alias.
     *
     * @param usernameOrAlias a string that might be a username or might be an alias
     */
    resolveAlias(usernameOrAlias: string): string | undefined;
    /**
     * Set an alias for the given aliasable entity.  Writes to the file
     *
     * @param alias the alias you want to set
     * @param entity the aliasable entity that's being aliased
     */
    setAndSave(alias: string, entity: Aliasable): Promise<void>;
    /**
     * Unset the given alias(es).  Writes to the file
     *
     */
    unsetAndSave(alias: string): Promise<void>;
    /**
     * Unset all the aliases for the given array of entity.
     *
     * @param entity the aliasable entity for which you want to unset all aliases
     */
    unsetValuesAndSave(aliasees: Aliasable[]): Promise<void>;
    /**
     * Returns true if the provided alias exists
     *
     * @param alias the alias you want to check
     */
    has(alias: string): boolean;
    protected init(): Promise<void>;
    /**
     * go to the fileSystem and read the file, storing a copy in the class's store
     * if the file doesn't exist, create it empty
     */
    private readFileToAliasStore;
    private saveAliasStoreToFile;
  }
  export const getFileLocation: () => string;
}
declare module '@salesforce/core/stateAggregator/accessors/orgAccessor' {
  /// <reference types="node" />
  import * as fs from 'node:fs';
  import { Nullable } from '@salesforce/ts-types';
  import { AsyncOptionalCreatable } from '@salesforce/kit';
  import { AuthInfoConfig } from '@salesforce/core/config/authInfoConfig';
  import { AuthFields } from '@salesforce/core/org/authInfo';
  import { ConfigFile } from '@salesforce/core/config/configFile';
  import { ConfigContents } from '@salesforce/core/config/configStackTypes';
  export abstract class BaseOrgAccessor<T extends ConfigFile, P extends ConfigContents> extends AsyncOptionalCreatable {
    private configs;
    /** map of Org files by username  */
    private contents;
    private logger;
    /**
     * Read the auth file for the given username. Once the file has been read, it can be re-accessed with the `get` method.
     *
     * @param username username to read
     * @param decrypt if true, decrypt encrypted values
     * @param throwOnNotFound throw if file is not found for username
     */
    read(username: string, decrypt?: boolean, throwOnNotFound?: boolean): Promise<Nullable<P>>;
    /**
     * Read all the auth files under the global state directory
     *
     * @param decrypt if true, decrypt encrypted values
     */
    readAll(decrypt?: boolean): Promise<P[]>;
    get(username: string, decrypt?: boolean, throwOnNotFound?: true): P;
    /**
     * Return the contents of all the auth files from cache. The `read` or `readAll` methods must be called first in order to populate the cache.
     *
     * @param decrypt if true, decrypt encrypted values
     * @returns
     */
    getAll(decrypt?: boolean): P[];
    /**
     * Returns true if the username has been cached.
     *
     * @param username
     */
    has(username: string): boolean;
    /**
     * Returns true if there is an auth file for the given username. The `read` or `readAll` methods must be called first in order to populate the cache.
     *
     * @param username
     */
    exists(username: string): Promise<boolean>;
    /**
     * Return the file stats for a given userame's auth file.
     *
     * @param username
     */
    stat(username: string): Promise<Nullable<fs.Stats>>;
    /**
     * Returns true if there is an auth file for the given username
     *
     * @param username
     */
    hasFile(username: string): Promise<boolean>;
    /**
     * Return all auth files under the global state directory.
     */
    list(): Promise<string[]>;
    /**
     * Set the contents for a given username.
     *
     * @param username
     * @param org
     */
    set(username: string, org: P): void;
    /**
     * Update the contents for a given username.
     *
     * @param username
     * @param org
     */
    update(username: string, org: Partial<P>): void;
    /**
     * Delete the auth file for a given username.
     *
     * @param username
     */
    remove(username: string): Promise<void>;
    /**
     * Write the contents of the auth file for a given username.
     *
     * @param username
     */
    write(username: string): Promise<Nullable<P>>;
    protected init(): Promise<void>;
    private getAllFiles;
    private parseUsername;
    private parseFilename;
    protected abstract initAuthFile(username: string, throwOnNotFound?: boolean): Promise<T>;
    protected abstract getFileRegex(): RegExp;
    protected abstract getFileExtension(): string;
  }
  export class OrgAccessor extends BaseOrgAccessor<AuthInfoConfig, AuthFields> {
    protected initAuthFile(username: string, throwOnNotFound?: boolean): Promise<AuthInfoConfig>;
    protected getFileRegex(): RegExp;
    protected getFileExtension(): string;
  }
}
declare module '@salesforce/core/stateAggregator/accessors/sandboxAccessor' {
  import { SandboxOrgConfig } from '@salesforce/core/config/sandboxOrgConfig';
  import { SandboxFields } from '@salesforce/core/org/org';
  import { BaseOrgAccessor } from '@salesforce/core/stateAggregator/accessors/orgAccessor';
  export class SandboxAccessor extends BaseOrgAccessor<SandboxOrgConfig, SandboxFields> {
    protected initAuthFile(username: string, throwOnNotFound?: boolean): Promise<SandboxOrgConfig>;
    protected getFileRegex(): RegExp;
    protected getFileExtension(): string;
  }
}
declare module '@salesforce/core/stateAggregator/stateAggregator' {
  import { AsyncOptionalCreatable } from '@salesforce/kit';
  import { AliasAccessor } from '@salesforce/core/stateAggregator/accessors/aliasAccessor';
  import { OrgAccessor } from '@salesforce/core/stateAggregator/accessors/orgAccessor';
  import { SandboxAccessor } from '@salesforce/core/stateAggregator/accessors/sandboxAccessor';
  export class StateAggregator extends AsyncOptionalCreatable {
    private static instanceMap;
    aliases: AliasAccessor;
    orgs: OrgAccessor;
    sandboxes: SandboxAccessor;
    /**
     * Reuse a StateAggregator if one was already created for the current global state directory
     * Otherwise, create one and adds it to map for future reuse.
     * HomeDir might be stubbed in tests
     */
    static getInstance(): Promise<StateAggregator>;
    /**
     * Clear the cache to force reading from disk.
     *
     * *NOTE: Only call this method if you must and you know what you are doing.*
     */
    static clearInstance(path?: string): void;
    protected init(): Promise<void>;
  }
}
declare module '@salesforce/core/status/myDomainResolver' {
  /// <reference types="node" />
  import { URL } from 'node:url';
  import { AsyncOptionalCreatable, Duration } from '@salesforce/kit';
  /**
   * A class used to resolve MyDomains. After a ScratchOrg is created its host name my not be propagated to the
   * Salesforce DNS service. This service is not exclusive to Salesforce My Domain URL and could be used for any hostname.
   *
   * ```
   * (async () => {
   *  const options: MyDomainResolver.Options = {
   *      url: new URL('http://mydomain.salesforce.com'),
   *      timeout: Duration.minutes(5),
   *      frequency: Duration.seconds(10)
   *  };
   *  const resolver: MyDomainResolver = await MyDomainResolver.create(options);
   *  const ipAddress: AnyJson = await resolver.resolve();
   *  console.log(`Successfully resolved host: ${options.url} to address: ${ipAddress}`);
   * })();
   * ```
   */
  export class MyDomainResolver extends AsyncOptionalCreatable<MyDomainResolver.Options> {
    static DEFAULT_DOMAIN: URL;
    private logger;
    private options;
    /**
     * Constructor
     * **Do not directly construct instances of this class -- use {@link MyDomainResolver.create} instead.**
     *
     * @param options The options for the class instance
     */
    constructor(options?: MyDomainResolver.Options);
    getTimeout(): Duration;
    getFrequency(): Duration;
    /**
     * Method that performs the dns lookup of the host. If the lookup fails the internal polling client will try again
     * given the optional interval. Returns the resolved ip address.
     *
     * If SFDX_DISABLE_DNS_CHECK environment variable is set to true, it will immediately return the host without
     * executing the dns loookup.
     */
    resolve(): Promise<string>;
    getCnames(): Promise<string[]>;
    /**
     * Used to initialize asynchronous components.
     */
    protected init(): Promise<void>;
  }
  export namespace MyDomainResolver {
    /**
     * Options for the MyDomain DNS resolver.
     */
    type Options = {
      /**
       * The host to resolve.
       */
      url: URL;
      /**
       * The retry interval.
       */
      timeout?: Duration;
      /**
       * The retry timeout.
       */
      frequency?: Duration;
    };
  }
}
declare module '@salesforce/core/status/pollingClient' {
  import { AsyncOptionalCreatable, Duration } from '@salesforce/kit';
  import { AnyJson } from '@salesforce/ts-types';
  import { Logger } from '@salesforce/core/logger/logger';
  import { StatusResult } from '@salesforce/core/status/types';
  /**
   * This is a polling client that can be used to poll the status of long running tasks. It can be used as a replacement
   * for Streaming when streaming topics are not available or when streaming handshakes are failing. Why wouldn't you
   * want to use this? It can impact Salesforce API usage.
   *
   * ```
   * const options: PollingClient.Options = {
   *      async poll(): Promise<StatusResult>  {
   *       return Promise.resolve({ completed: true, payload: 'Hello World' });
   *     },
   *     frequency: Duration.milliseconds(10),
   *      timeout: Duration.minutes(1)
   *   };
   * const client = await PollingClient.create(options);
   * const pollResult = await client.subscribe();
   * console.log(`pollResult: ${pollResult}`);
   * ```
   */
  export class PollingClient extends AsyncOptionalCreatable<PollingClient.Options> {
    protected logger: Logger;
    private options;
    /**
     * Constructor
     *
     * @param options Polling client options
     * @ignore
     */
    constructor(options?: PollingClient.Options);
    /**
     * Asynchronous initializer.
     */
    init(): Promise<void>;
    /**
     * Returns a promise to call the specified polling function using the interval and timeout specified
     * in the polling options.
     */
    subscribe<T = AnyJson>(): Promise<T>;
  }
  export namespace PollingClient {
    /**
     * Options for the polling client.
     */
    type Options = {
      /**
       * Polling function.
       */
      poll: () => Promise<StatusResult>;
      /**
       * How frequent should the polling function be called.
       */
      frequency: Duration;
      /**
       * Hard timeout for polling.
       */
      timeout: Duration;
      /**
       * Change the name of the timeout error.
       *
       * ```
       * if (err.name === 'MyChangedName) ...
       * ```
       */
      timeoutErrorName?: string;
    };
    /**
     * Default options set for polling. The default options specify a timeout of 3 minutes and polling frequency of 15
     * seconds;
     */
    class DefaultPollingOptions implements PollingClient.Options {
      frequency: Duration;
      poll: () => Promise<StatusResult>;
      timeout: Duration;
      /**
       * constructor
       *
       * @param poll The function used for polling status.
       * {@link StatusResult}
       */
      constructor(poll: () => Promise<StatusResult>);
    }
  }
}
declare module '@salesforce/core/status/streamingClient' {
  import { AsyncOptionalCreatable, Duration, Env } from '@salesforce/kit/lib';
  import { AnyJson } from '@salesforce/ts-types/lib';
  import { Org } from '@salesforce/core/org/org';
  import {
    CometClient,
    CometSubscription,
    Message,
    StatusResult,
    StreamingExtension,
    StreamProcessor,
  } from '@salesforce/core/status/types';
  export { CometClient, CometSubscription, Message, StatusResult, StreamingExtension, StreamProcessor };
  /**
   * Inner streaming client interface. This implements the Cometd behavior.
   * Also allows for mocking the functional behavior.
   */
  export type StreamingClientIfc = {
    /**
     * Returns a comet client implementation.
     *
     * @param url The target url of the streaming service endpoint.
     */
    getCometClient: (url: string) => CometClient;
    /**
     * Sets the logger function for the CometClient.
     *
     * @param logLine A log message passed to the the assigned function.
     */
    setLogger: (logLine: (message: string) => void) => void;
  };
  /**
   * Api wrapper to support Salesforce streaming. The client contains an internal implementation of a cometd specification.
   *
   * Salesforce client and timeout information
   *
   * Streaming API imposes two timeouts, as supported in the Bayeux protocol.
   *
   * Socket timeout: 110 seconds
   * A client receives events (JSON-formatted HTTP responses) while it waits on a connection. If no events are generated
   * and the client is still waiting, the connection times out after 110 seconds and the server closes the connection.
   * Clients should reconnect before two minutes to avoid the connection timeout.
   *
   * Reconnect timeout: 40 seconds
   * After receiving the events, a client needs to reconnect to receive the next set of events. If the reconnection
   * doesn't happen within 40 seconds, the server expires the subscription and the connection is closed. If this happens,
   * the client must start again and handshake, subscribe, and connect. Each Streaming API client logs into an instance
   * and maintains a session. When the client handshakes, connects, or subscribes, the session timeout is restarted. A
   * client session times out if the client doesn’t reconnect to the server within 40 seconds after receiving a response
   * (an event, subscribe result, and so on).
   *
   * Note that these timeouts apply to the Streaming API client session and not the Salesforce authentication session. If
   * the client session times out, the authentication session remains active until the organization-specific timeout
   * policy goes into effect.
   *
   * ```
   * const streamProcessor = (message: JsonMap): StatusResult => {
   *    const payload = ensureJsonMap(message.payload);
   *    const id = ensureString(payload.id);
   *
   *     if (payload.status !== 'Active') {
   *       return  { completed: false };
   *     }
   *
   *     return {
   *         completed: true,
   *         payload: id
   *     };
   *   };
   *
   * const org = await Org.create();
   * const options = new StreamingClient.DefaultOptions(org, 'MyPushTopics', streamProcessor);
   *
   * const asyncStatusClient = await StreamingClient.create(options);
   *
   * await asyncStatusClient.handshake();
   *
   * const info: RequestInfo = {
   *     method: 'POST',
   *     url: `${org.getField(OrgFields.INSTANCE_URL)}/SomeService`,
   *     headers: { HEADER: 'HEADER_VALUE'},
   *     body: 'My content'
   * };
   *
   * await asyncStatusClient.subscribe(async () => {
   *    const connection = await org.getConnection();
   *    // Now that we are subscribed, we can initiate the request that will cause the events to start streaming.
   *    const requestResponse: JsonCollection = await connection.request(info);
   *    const id = ensureJsonMap(requestResponse).id;
   *    console.log(`this.id: ${JSON.stringify(ensureString(id), null, 4)}`);
   * });
   * ```
   */
  export class StreamingClient extends AsyncOptionalCreatable<StreamingClient.Options> {
    private readonly targetUrl;
    private readonly options;
    private logger;
    private cometClient;
    /**
     * Constructor
     *
     * @param options Streaming client options
     * {@link AsyncCreatable.create}
     */
    constructor(options?: StreamingClient.Options);
    /**
     * Asynchronous initializer.
     */
    init(): Promise<void>;
    /**
     * Allows replaying of of Streaming events starting with replayId.
     *
     * @param replayId The starting message id to replay from.
     */
    replay(replayId: number): void;
    /**
     * Provides a convenient way to handshake with the server endpoint before trying to subscribe.
     */
    handshake(): Promise<StreamingClient.ConnectionState>;
    /**
     * Subscribe to streaming events. When the streaming processor that's set in the options completes execution it
     * returns a payload in the StatusResult object. The payload is just echoed here for convenience.
     *
     * **Throws** *{@link SfError}{ name: '{@link StreamingClient.TimeoutErrorType.SUBSCRIBE}'}* When the subscribe timeout occurs.
     *
     * @param streamInit This function should call the platform apis that result in streaming updates on push topics.
     * {@link StatusResult}
     */
    subscribe(streamInit?: () => Promise<void>): Promise<AnyJson | void>;
    /**
     * Handler for incoming streaming messages.
     *
     * @param message The message to process.
     * @param cb The callback. Failure to call this can cause the internal comet client to hang.
     */
    private incoming;
    private doTimeout;
    private disconnectClient;
    private disconnect;
    /**
     * Simple inner log wrapper
     *
     * @param message The message to log
     */
    private log;
  }
  export namespace StreamingClient {
    /**
     * Options for the StreamingClient
     *
     * @interface
     */
    type Options = {
      /**
       * The org streaming target.
       */
      org: Org;
      /**
       * The hard timeout that happens with subscribe
       */
      subscribeTimeout: Duration;
      /**
       * The hard timeout that happens with a handshake.
       */
      handshakeTimeout: Duration;
      /**
       * The streaming channel aka topic
       */
      channel: string;
      /**
       * The salesforce api version
       */
      apiVersion: string;
      /**
       * The function for processing streaming messages
       */
      streamProcessor: StreamProcessor;
      /**
       * The function for build the inner client impl. Allows for mocking.
       */
      streamingImpl: StreamingClientIfc;
    };
    /**
     * Default Streaming Options. Uses Faye as the cometd impl.
     */
    class DefaultOptions implements StreamingClient.Options {
      static readonly SFDX_ENABLE_FAYE_COOKIES_ALLOW_ALL_PATHS = 'SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING';
      static readonly SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING = 'SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING';
      static readonly DEFAULT_SUBSCRIBE_TIMEOUT: Duration;
      static readonly DEFAULT_HANDSHAKE_TIMEOUT: Duration;
      apiVersion: string;
      org: Org;
      streamProcessor: StreamProcessor;
      subscribeTimeout: Duration;
      handshakeTimeout: Duration;
      channel: string;
      streamingImpl: StreamingClientIfc;
      /**
       * Constructor for DefaultStreamingOptions
       *
       * @param org The streaming target org
       * @param channel The streaming channel or topic. If the topic is a system topic then api 36.0 is used.
       * System topics are deprecated.
       * @param streamProcessor The function called that can process streaming messages.
       * @param envDep
       * @see {@link StatusResult}
       */
      constructor(org: Org, channel: string, streamProcessor: StreamProcessor, envDep?: Env);
      /**
       * Setter for the subscribe timeout.
       *
       * **Throws** An error if the newTime is less than the default time.
       *
       * @param newTime The new subscribe timeout.
       * {@link DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT}
       */
      setSubscribeTimeout(newTime: Duration): void;
      /**
       * Setter for the handshake timeout.
       *
       * **Throws** An error if the newTime is less than the default time.
       *
       * @param newTime The new handshake timeout
       * {@link DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT}
       */
      setHandshakeTimeout(newTime: Duration): void;
    }
    /**
     * Connection state
     *
     * @see {@link StreamingClient.handshake}
     */
    enum ConnectionState {
      /**
       * Used to indicated that the streaming client is connected.
       */
      CONNECTED = 0,
    }
    /**
     * Indicators to test error names for StreamingTimeouts
     */
    enum TimeoutErrorType {
      /**
       * To indicate the error occurred on handshake
       */
      HANDSHAKE = 'GenericHandshakeTimeoutError',
      /**
       * To indicate the error occurred on subscribe
       */
      SUBSCRIBE = 'GenericTimeoutError',
    }
  }
}
declare module '@salesforce/core/status/types' {
  /// <reference types="node" />
  import { EventEmitter } from 'node:events';
  import { AnyFunction, AnyJson, JsonMap } from '@salesforce/ts-types';
  export type Message = JsonMap;
  export type Callback<T = unknown> = (...args: any[]) => T;
  export type StatusResult = {
    /**
     * If the result of the streaming or polling client is expected to return a result
     */
    payload?: AnyJson;
    /**
     * Indicates to the streaming or polling client that the subscriber has what its needs. If `true` the client will end
     * the messaging exchanges with the endpoint.
     */
    completed: boolean;
  };
  /**
   * The subscription object returned from the cometd subscribe object.
   */
  export type CometSubscription = {
    callback(callback: () => void): void;
    errback(callback: (error: Error) => void): void;
  };
  /**
   * Types for defining extensions.
   */
  export type StreamingExtension = {
    /**
     * Extension for outgoing message.
     *
     * @param message The message.
     * @param callback The callback to invoke after the message is processed.
     */
    outgoing?: (message: JsonMap, callback: AnyFunction) => void;
    /**
     * Extension for the incoming message.
     *
     * @param message The message.
     * @param callback The callback to invoke after the message is processed.
     */
    incoming?: (message: JsonMap, callback: AnyFunction) => void;
  };
  /**
   * Function type for processing messages
   */
  export type StreamProcessor = (message: JsonMap) => StatusResult;
  /**
   * Comet client interface. The is to allow for mocking the inner streaming Cometd implementation.
   * The Faye implementation is used by default but it could be used to adapt another Cometd impl.
   */
  export abstract class CometClient extends EventEmitter {
    /**
     * Disable polling features.
     *
     * @param label Polling feature label.
     */
    abstract disable(label: string): void;
    /**
     * Add a custom extension to the underlying client.
     *
     * @param extension The json function for the extension.
     */
    abstract addExtension(extension: StreamingExtension): void;
    /**
     * Sets an http header name/value.
     *
     * @param name The header name.
     * @param value The header value.
     */
    abstract setHeader(name: string, value: string): void;
    /**
     * handshake with the streaming channel
     *
     * @param callback Callback for the handshake when it successfully completes. The handshake should throw
     * errors when errors are encountered.
     */
    abstract handshake(callback: () => void): void;
    /**
     * Subscribes to Comet topics. Subscribe should perform a handshake if one hasn't been performed yet.
     *
     * @param channel The topic to subscribe to.
     * @param callback The callback to execute once a message has been received.
     */
    abstract subscribe(channel: string, callback: (message: JsonMap) => void): CometSubscription;
    /**
     * Method to call to disconnect the client from the server.
     */
    abstract disconnect(): void;
  }
}
declare module '@salesforce/core/testSetup' {
  /// <reference types="node" />
  import { EventEmitter } from 'node:events';
  import { SinonSandbox, SinonStatic, SinonStub } from 'sinon';
  import { AnyJson, JsonMap, Optional } from '@salesforce/ts-types';
  import { ConfigContents } from '@salesforce/core/config/configStackTypes';
  import { Connection } from '@salesforce/core/org/connection';
  import { Logger } from '@salesforce/core/logger/logger';
  import { SfError } from '@salesforce/core/sfError';
  import { CometClient, CometSubscription, Message, StreamingExtension } from '@salesforce/core/status/streamingClient';
  import { SandboxFields } from '@salesforce/core/org/org';
  import { AuthFields } from '@salesforce/core/org/authInfo';
  import { uniqid } from '@salesforce/core/util/uniqid';
  export { uniqid };
  export { SecureBuffer } from '@salesforce/core/crypto/secureBuffer';
  /**
   * Different parts of the system that are mocked out. They can be restored for
   * individual tests. Test's stubs should always go on the DEFAULT which is exposed
   * on the TestContext.
   */
  export type SandboxTypes = {
    DEFAULT: SinonSandbox;
    CRYPTO: SinonSandbox;
    CONFIG: SinonSandbox;
    PROJECT: SinonSandbox;
    CONNECTION: SinonSandbox;
    FS: SinonSandbox;
    ORGS: SinonSandbox;
  };
  /**
   * Different hooks into {@link ConfigFile} used for testing instead of doing file IO.
   */
  export type ConfigStub = {
    /**
     * readFn A function that controls all aspect of {@link ConfigFile.read}. For example, it won't set the contents
     * unless explicitly done. Only use this if you know what you are doing. Use retrieveContents
     * instead.
     */
    readFn?: () => Promise<ConfigContents>;
    /**
     * A function that controls all aspects of {@link ConfigFile.write}. For example, it won't read the contents unless
     * explicitly done. Only use this if you know what you are doing. Use updateContents instead.
     */
    writeFn?: (contents?: AnyJson) => Promise<void>;
    /**
     * The contents that are used with @{link ConfigFile.readSync} and @{link ConfigFile.read}. If retrieveContents is set,
     * it will use that instead of @{link ConfigFile.read} but NOT @{link ConfigFile.readSync}. This will also contain the
     * new config when @{link ConfigFile.write} or @{link ConfigFile.writeSync} is called. This will persist through config instances,
     * such as {@link Alias.update} and {@link Alias.fetch}.
     */
    contents?: ConfigContents;
    /**
     * A function to conditionally read based on the config instance. The `this` value will be the config instance.
     */
    retrieveContents?: () => Promise<JsonMap>;
  };
  /**
   * Instantiate a @salesforce/core test context.
   */
  export class TestContext {
    /**
     * The default sandbox is cleared out before each test run.
     *
     * **See** [sinon sandbox]{@link https://sinonjs.org/releases/v14/sandbox/}.
     */
    SANDBOX: SinonSandbox;
    /**
     * An object of different sandboxes. Used when
     * needing to restore parts of the system for customized testing.
     */
    SANDBOXES: SandboxTypes;
    /**
     * The test logger that is used when {@link Logger.child} is used anywhere. It uses memory logging.
     */
    TEST_LOGGER: Logger;
    /**
     * id A unique id for the test run.
     */
    id: string;
    /**
     * An object used in tests that interact with config files.
     */
    configStubs: {
      [configName: string]: Optional<ConfigStub>;
      AuthInfoConfig?: ConfigStub;
      Config?: ConfigStub;
      SfProjectJson?: ConfigStub;
      OrgUsersConfig?: ConfigStub;
    };
    /**
     * A record of stubs created during instantiation.
     */
    stubs: Record<string, SinonStub>;
    constructor(options?: { sinon?: SinonStatic; sandbox?: SinonSandbox; setup?: boolean });
    /**
     * Generate unique string.
     */
    uniqid(): string;
    /**
     * A function used when resolving the local path. Calls localPathResolverSync by default.
     *
     * @param uid Unique id.
     */
    localPathRetriever(uid: string): Promise<string>;
    /**
     * A function used when resolving the local path.
     *
     * @param uid Unique id.
     */
    localPathRetrieverSync(uid: string): string;
    /**
     * A function used when resolving the global path. Calls globalPathResolverSync by default.
     *
     * @param uid Unique id.
     */
    globalPathRetriever(uid: string): Promise<string>;
    /**
     * A function used when resolving the global path.
     *
     * @param uid Unique id.
     */
    globalPathRetrieverSync(uid: string): string;
    /**
     * A function used for resolving paths. Calls localPathRetriever and globalPathRetriever.
     *
     * @param isGlobal `true` if the config is global.
     * @param uid user id.
     */
    rootPathRetriever(isGlobal: boolean, uid?: string): Promise<string>;
    /**
     * A function used for resolving paths. Calls localPathRetrieverSync and globalPathRetrieverSync.
     *
     * @param isGlobal `true` if the config is global.
     * @param uid user id.
     */
    rootPathRetrieverSync(isGlobal: boolean, uid?: string): string;
    /**
     * Used to mock http request to Salesforce.
     *
     * @param request An HttpRequest.
     * @param options Additional options.
     *
     * **See** {@link Connection.request}
     */
    fakeConnectionRequest(request: AnyJson, options?: AnyJson): Promise<AnyJson>;
    /**
     * Gets a config stub contents by name.
     *
     * @param name The name of the config.
     * @param group If the config supports groups.
     */
    getConfigStubContents(name: string, group?: string): ConfigContents;
    /**
     * Sets a config stub contents by name
     *
     * @param name The name of the config stub.
     * @param value The actual stub contents. The Mock data.
     */
    setConfigStubContents(name: string, value: ConfigContents): void;
    /**
     * Set stubs for working in the context of a SfProject
     */
    inProject(inProject?: boolean): void;
    /**
     * Stub salesforce org authorizations.
     */
    stubAuths(...orgs: MockTestOrgData[]): Promise<void>;
    /**
     * Stub salesforce user authorizations.
     *
     * @param users The users to stub.
     * The key is the username of the admin user and it must be included in the users array in order to obtain the orgId key for the remaining users.
     * The admin user is excluded from the users array.
     *
     */
    stubUsers(users: Record<string, MockTestOrgData[]>): void;
    /**
     * Stub salesforce sandbox authorizations.
     */
    stubSandboxes(...sandboxes: MockTestSandboxData[]): Promise<void>;
    /**
     * Stub the aliases in the global aliases config file.
     */
    stubAliases(aliases: Record<string, string>, group?: string): void;
    /**
     * Stub contents in the config file.
     */
    stubConfig(config: Record<string, string>): Promise<void>;
    restore(): void;
    init(): void;
    /**
     * Add beforeEach and afterEach hooks to init the stubs and restore them.
     * This is called automatically when the class is instantiated unless the setup option is set to false.
     */
    setup(): void;
  }
  /**
   * Instantiate a @salesforce/core test context. This is automatically created by `const $$ = testSetup()`
   * but is useful if you don't want to have a global stub of @salesforce/core and you want to isolate it to
   * a single describe.
   *
   * **Note:** Call `stubContext` in your beforeEach to have clean stubs of @salesforce/core every test run.
   *
   * @example
   * ```
   * const $$ = instantiateContext();
   *
   * beforeEach(() => {
   *   $$.init()
   * });
   *
   * afterEach(() => {
   *   $$.restore();
   * });
   * ```
   * @param sinon
   */
  export const instantiateContext: (sinon?: SinonStatic) => TestContext;
  /**
   * Stub a @salesforce/core test context. This will mock out logging to a file, config file reading and writing,
   * local and global path resolution, and http request using connection (soon)*.
   *
   * This is automatically stubbed in the global beforeEach created by
   * `const $$ = testSetup()` but is useful if you don't want to have a global stub of @salesforce/core and you
   * want to isolate it to a single describe.
   *
   * **Note:** Always call `restoreContext` in your afterEach.
   *
   * @example
   * ```
   * const $$ = instantiateContext();
   *
   * beforeEach(() => {
   *   $$.init()
   * });
   *
   * afterEach(() => {
   *   $$.restore();
   * });
   * ```
   * @param testContext
   */
  export const stubContext: (testContext: TestContext) => Record<string, SinonStub>;
  /**
   * Restore a @salesforce/core test context. This is automatically stubbed in the global beforeEach created by
   * `const $$ = testSetup()` but is useful if you don't want to have a global stub of @salesforce/core and you
   * want to isolate it to a single describe.
   *
   * @example
   * ```
   * const $$ = instantiateContext();
   *
   * beforeEach(() => {
   *   $$.init()
   * });
   *
   * afterEach(() => {
   *   $$.restore();
   * });
   * ```
   * @param testContext
   */
  export const restoreContext: (testContext: TestContext) => void;
  /**
   * A pre-canned error for try/catch testing.
   *
   * **See** {@link shouldThrow}
   */
  export const unexpectedResult: SfError<AnyJson>;
  /**
   * Use for this testing pattern:
   * ```
   *  try {
   *      await call()
   *      assert.fail("this should never happen");
   *  } catch (e) {
   *  ...
   *  }
   *
   *  Just do this
   *
   *  try {
   *      await shouldThrow(call()); // If this succeeds unexpectedResultError is thrown.
   *  } catch(e) {
   *  ...
   *  }
   * ```
   *
   * @param f The async function that is expected to throw.
   */
  export function shouldThrow(f: Promise<unknown>, message?: string): Promise<never>;
  /**
   * Use for this testing pattern:
   * ```
   *  try {
   *      call()
   *      assert.fail("this should never happen");
   *  } catch (e) {
   *  ...
   *  }
   *
   *  Just do this
   *
   *  try {
   *      shouldThrowSync(call); // If this succeeds unexpectedResultError is thrown.
   *  } catch(e) {
   *  ...
   *  }
   * ```
   *
   * @param f The function that is expected to throw.
   */
  export function shouldThrowSync(f: () => unknown, message?: string): never;
  /**
   * A helper to determine if a subscription will use callback or errorback.
   * Enable errback to simulate a subscription failure.
   */
  export enum StreamingMockSubscriptionCall {
    CALLBACK = 0,
    ERRORBACK = 1,
  }
  /**
   * Additional subscription options for the StreamingMock.
   */
  export type StreamingMockCometSubscriptionOptions = {
    /**
     * Target URL.
     */
    url: string;
    /**
     * Simple id to associate with this instance.
     */
    id: string;
    /**
     * What is the subscription outcome a successful callback or an error?.
     */
    subscriptionCall: StreamingMockSubscriptionCall;
    /**
     * If it's an error that states what that error should be.
     */
    subscriptionErrbackError?: SfError;
    /**
     * A list of messages to playback for the client. One message per process tick.
     */
    messagePlaylist?: Message[];
  };
  /**
   * Simulates a comet subscription to a streaming channel.
   */
  export class StreamingMockCometSubscription extends EventEmitter implements CometSubscription {
    static SUBSCRIPTION_COMPLETE: string;
    static SUBSCRIPTION_FAILED: string;
    private options;
    constructor(options: StreamingMockCometSubscriptionOptions);
    /**
     * Sets up a streaming subscription callback to occur after the setTimeout event loop phase.
     *
     * @param callback The function to invoke.
     */
    callback(callback: () => void): void;
    /**
     * Sets up a streaming subscription errback to occur after the setTimeout event loop phase.
     *
     * @param callback The function to invoke.
     */
    errback(callback: (error: Error) => void): void;
  }
  /**
   * Simulates a comet client. To the core streaming client this mocks the internal comet impl.
   * The uses setTimeout(0ms) event loop phase just so the client can simulate actual streaming without the response
   * latency.
   */
  export class StreamingMockCometClient extends CometClient {
    private readonly options;
    /**
     * Constructor
     *
     * @param {StreamingMockCometSubscriptionOptions} options Extends the StreamingClient options.
     */
    constructor(options: StreamingMockCometSubscriptionOptions);
    /**
     * Fake addExtension. Does nothing.
     */
    addExtension(extension: StreamingExtension): void;
    /**
     * Fake disable. Does nothing.
     */
    disable(label: string): void;
    /**
     * Fake handshake that invoke callback after the setTimeout event phase.
     *
     * @param callback The function to invoke.
     */
    handshake(callback: () => void): void;
    /**
     * Fake setHeader. Does nothing,
     */
    setHeader(name: string, value: string): void;
    /**
     * Fake subscription that completed after the setTimout event phase.
     *
     * @param channel The streaming channel.
     * @param callback The function to invoke after the subscription completes.
     */
    subscribe(channel: string, callback: (message: Message) => void): CometSubscription;
    /**
     * Fake disconnect. Does Nothing.
     */
    disconnect(): Promise<void>;
  }
  type MockUserInfo = {
    Id: string;
    Username: string;
    LastName: string;
    Alias: string;
    Configs: string[] | undefined;
    TimeZoneSidKey: string;
    LocaleSidKey: string;
    EmailEncodingKey: string;
    ProfileId: string;
    LanguageLocaleKey: string;
    Email: string;
  };
  /**
   * Mock class for Salesforce Orgs.
   *
   * @example
   * ```
   * const testOrg = new MockTestOrgData();
   * await $$.stubAuths(testOrg)
   * ```
   */
  export class MockTestOrgData {
    testId: string;
    aliases?: string[];
    configs?: string[];
    username: string;
    devHubUsername?: string;
    orgId: string;
    loginUrl: string;
    instanceUrl: string;
    clientId: string;
    clientSecret: string;
    authcode: string;
    accessToken: string;
    refreshToken: string | undefined;
    tracksSource: boolean | undefined;
    userId: string;
    redirectUri: string;
    isDevHub?: boolean;
    isScratchOrg?: boolean;
    isExpired?: boolean | 'unknown';
    password?: string;
    namespacePrefix?: string;
    constructor(
      id?: string,
      options?: {
        username: string;
      }
    );
    /**
     * Add devhub username to properties.
     */
    createDevHubUsername(username: string): void;
    /**
     * Mark this org as a devhub.
     */
    makeDevHub(): void;
    /**
     * Returns a MockTestOrgData that represents a user created in the org.
     */
    createUser(user: string): MockTestOrgData;
    /**
     * Return mock user information based on this org.
     */
    getMockUserInfo(): MockUserInfo;
    /**
     * Return the auth config file contents.
     */
    getConfig(): Promise<AuthFields>;
    /**
     * Return the Connection for the org.
     */
    getConnection(): Promise<Connection>;
  }
  /**
   * Mock class for Salesforce Sandboxes.
   *
   * @example
   * ```
   * const testOrg = new MockTestSandboxData();
   * await $$.stubSandboxes(testOrg)
   * ```
   */
  export class MockTestSandboxData {
    id: string;
    sandboxOrgId: string;
    prodOrgUsername: string;
    sandboxName?: string;
    username?: string;
    constructor(
      id?: string,
      options?: Partial<{
        prodOrgUsername: string;
        name: string;
        username: string;
      }>
    );
    /**
     * Return the auth config file contents.
     */
    getConfig(): Promise<SandboxFields>;
  }
}
declare module '@salesforce/core/util/cache' {
  export class Cache extends Map {
    #private;
    private constructor();
    static get hits(): number;
    static get lookups(): number;
    static instance(): Cache;
    static set<V>(key: string, value: V): void;
    static get<V>(key: string): V | undefined;
    static disable(): void;
    static enable(): void;
  }
}
declare module '@salesforce/core/util/directoryWriter' {
  /// <reference types="node" />
  /// <reference types="node" />
  import { Readable } from 'node:stream';
  import { StructuredWriter } from '@salesforce/core/util/structuredWriter';
  export class DirectoryWriter implements StructuredWriter {
    private readonly rootDestination?;
    constructor(rootDestination?: string | undefined);
    get buffer(): Buffer;
    addToStore(contents: string | Readable | Buffer, targetPath: string): Promise<void>;
    finalize(): Promise<void>;
    getDestinationPath(): string | undefined;
  }
}
declare module '@salesforce/core/util/fileLocking' {
  type LockInitResponse = {
    writeAndUnlock: (data: string) => Promise<void>;
    unlock: () => Promise<void>;
  };
  type LockInitSyncResponse = {
    writeAndUnlock: (data: string) => void;
    unlock: () => void;
  };
  /**
   *
   *This method exists as a separate function so it can be used by ConfigFile OR outside of ConfigFile.
   *
   * @param filePath where to save the file
   * @returns 2 functions:
   * - writeAndUnlock: a function that takes the data to write and writes it to the file, then unlocks the file whether write succeeded or not
   * - unlock: a function that unlocks the file (in case you don't end up calling writeAndUnlock)
   */
  export const lockInit: (filePath: string) => Promise<LockInitResponse>;
  /**
   * prefer async {@link lockInit}.
   * See its documentation for details.
   */
  export const lockInitSync: (filePath: string) => LockInitSyncResponse;
  export {};
}
declare module '@salesforce/core/util/findUppercaseKeys' {
  import { JsonMap, Optional } from '@salesforce/ts-types';
  export const findUpperCaseKeys: (data?: JsonMap, sectionBlocklist?: string[]) => Optional<string>;
}
declare module '@salesforce/core/util/getJwtAudienceUrl' {
  import { OAuth2Config } from '@jsforce/jsforce-node';
  export function getJwtAudienceUrl(
    options: OAuth2Config & {
      createdOrgInstance?: string;
    }
  ): Promise<string>;
}
declare module '@salesforce/core/util/internal' {
  import { Optional } from '@salesforce/ts-types';
  /**
   * The name of the project config file.
   *
   * @ignore
   */
  export const SFDX_PROJECT_JSON = 'sfdx-project.json';
  /**
   * Performs an upward directory search for an sfdx project file. Returns the absolute path to the project.
   *
   * **See** {@link SFDX_PROJECT_JSON}
   *
   * **See** {@link traverseForFile}
   *
   * **Throws** *{@link SfError}{ name: 'InvalidProjectWorkspaceError' }* If the current folder is not located in a workspace.
   *
   * @param dir The directory path to start traversing from.
   * @ignore
   */
  export function resolveProjectPath(dir?: string): Promise<string>;
  /**
   * Performs a synchronous upward directory search for an sfdx project file. Returns the absolute path to the project.
   *
   * **See** {@link SFDX_PROJECT_JSON}
   *
   * **See** {@link traverseForFile}
   *
   * **Throws** *{@link SfError}{ name: 'InvalidProjectWorkspaceError' }* If the current folder is not located in a workspace.
   *
   * @param dir The directory path to start traversing from.
   * @ignore
   */
  export function resolveProjectPathSync(dir?: string): string;
  /**
   * These methods were moved from the deprecated 'fs' module in v2 and are only used in sfdx-core above
   *
   * They were migrated into the 'traverse' constant in order to stub them in unit tests
   */
  export const traverse: {
    /**
     * Searches a file path in an ascending manner (until reaching the filesystem root) for the first occurrence a
     * specific file name.  Resolves with the directory path containing the located file, or `null` if the file was
     * not found.
     *
     * @param dir The directory path in which to start the upward search.
     * @param file The file name to look for.
     */
    forFile: (dir: string, file: string) => Promise<Optional<string>>;
    /**
     * Searches a file path synchronously in an ascending manner (until reaching the filesystem root) for the first occurrence a
     * specific file name.  Resolves with the directory path containing the located file, or `null` if the file was
     * not found.
     *
     * @param dir The directory path in which to start the upward search.
     * @param file The file name to look for.
     */
    forFileSync: (dir: string, file: string) => Optional<string>;
  };
}
declare module '@salesforce/core/util/lockRetryOptions' {
  export const lockOptions: {
    stale: number;
  };
  export const lockRetryOptions: {
    retries: {
      retries: number;
      maxTimeout: number;
      factor: number;
    };
    stale: number;
  };
}
declare module '@salesforce/core/util/mapKeys' {
  /**
   * Use mapKeys to convert object keys to another format using the specified conversion function.
   *
   * E.g., to deep convert all object keys to camelCase:  mapKeys(myObj, _.camelCase, true)
   * to shallow convert object keys to lower case:  mapKeys(myObj, _.toLower)
   *
   * NOTE: This mutates the object passed in for conversion.
   *
   * @param target - {Object} The object to convert the keys
   * @param converter - {Function} The function that converts the object key
   * @param deep - {boolean} Whether to do a deep object key conversion
   * @return {Object} - the object with the converted keys
   */
  export default function mapKeys<T>(
    obj: T,
    converter: (key: string) => string,
    deep?: boolean
  ): Record<string, unknown>;
}
declare module '@salesforce/core/util/sfdc' {
  /**
   * Converts an 18 character Salesforce ID to 15 characters.
   *
   * @param id The id to convert.
   */
  export function trimTo15(id: string): string;
  export function trimTo15(id?: undefined): undefined;
  export function trimTo15(id: string | undefined): string | undefined;
  /**
   * Tests whether an API version matches the format `i.0`.
   *
   * @param value The API version as a string.
   */
  export const validateApiVersion: (value: string) => boolean;
  /**
   * Tests whether an email matches the format `me@my.org`
   *
   * @param value The email as a string.
   */
  export const validateEmail: (value: string) => boolean;
  /**
   * Tests whether a Salesforce ID is in the correct format, a 15- or 18-character length string with only letters and numbers
   *
   * @param value The ID as a string.
   */
  export const validateSalesforceId: (value: string) => boolean;
  /**
   * Tests whether a path is in the correct format; the value doesn't include the characters "[", "]", "?", "<", ">", "?", "|"
   *
   * @param value The path as a string.
   */
  export const validatePathDoesNotContainInvalidChars: (value: string) => boolean;
  export const accessTokenRegex: RegExp;
  export const sfdxAuthUrlRegex: RegExp;
  /**
   * Tests whether a given string is an access token
   *
   * @param value
   */
  export const matchesAccessToken: (value: string) => boolean;
}
declare module '@salesforce/core/util/sfdcUrl' {
  /// <reference types="node" />
  import { URL } from 'node:url';
  export function getLoginAudienceCombos(audienceUrl: string, loginUrl: string): Array<[string, string]>;
  export class SfdcUrl extends URL {
    /**
     * Salesforce URLs
     */
    static readonly SANDBOX = 'https://test.salesforce.com';
    static readonly PRODUCTION = 'https://login.salesforce.com';
    private static readonly cache;
    private logger;
    constructor(input: string | URL, base?: string | URL);
    static isValidUrl(input: string | URL): boolean;
    /**
     * Returns the appropriate jwt audience url for this url
     * Use SFDX_AUDIENCE_URL env var to override the audience url
     *
     * @param createdOrgInstance The Salesforce instance the org was created on. e.g. `cs42`
     * @return {Promise<string>} The audience url
     */
    getJwtAudienceUrl(createdOrgInstance?: string): Promise<string>;
    /**
     * Tests whether this url contains a Salesforce owned domain
     *
     * @return {boolean} true if this is a salesforce domain
     */
    isSalesforceDomain(): boolean;
    /**
     * Tests whether this url is an internal Salesforce domain
     *
     * @returns {boolean} true if this is an internal domain
     */
    isInternalUrl(): boolean;
    /**
     * Tests whether this url runs on a local machine
     *
     * @returns {boolean} true if this is a local machine
     */
    isLocalUrl(): boolean;
    toLightningDomain(): string;
    /**
     * Tests whether this url has the lightning domain extension
     * This method that performs the dns lookup of the host. If the lookup fails the internal polling (1 second), client will try again until timeout
     * If SFDX_DOMAIN_RETRY environment variable is set (number) it overrides the default timeout duration (240 seconds)
     *
     * @returns {Promise<true | never>} The resolved ip address or never
     * @throws {@link SfError} If can't resolve DNS.
     */
    checkLightningDomain(): Promise<true>;
    /**
     * Method that performs the dns lookup of the host. If the lookup fails the internal polling (1 second), client will try again until timeout
     * If SFDX_DOMAIN_RETRY environment variable is set (number) it overrides the default timeout duration (240 seconds)
     *
     * @returns the resolved ip address.
     * @throws {@link SfError} If can't resolve DNS.
     */
    lookup(): Promise<string>;
    /**
     * Test whether this url represents a lightning domain
     *
     * @returns {boolean} true if this domain is a lightning domain
     */
    isLightningDomain(): boolean;
  }
}
declare module '@salesforce/core/util/structuredWriter' {
  /// <reference types="node" />
  /// <reference types="node" />
  import { Readable } from 'node:stream';
  export type StructuredWriter = {
    addToStore(contents: string | Readable | Buffer, path: string): Promise<void>;
    finalize(): Promise<void>;
    getDestinationPath(): string | undefined;
    get buffer(): Buffer;
  };
}
declare module '@salesforce/core/util/time' {
  export const nowBigInt: () => bigint;
}
declare module '@salesforce/core/util/uniqid' {
  /**
   * A function to generate a unique id and return it in the context of a template, if supplied.
   *
   * A template is a string that can contain `${%s}` to be replaced with a unique id.
   * If the template contains the "%s" placeholder, it will be replaced with the unique id otherwise the id will be appended to the template.
   *
   * @param options an object with the following properties:
   * - template: a template string.
   * - length: the length of the unique id as presented in hexadecimal.
   */
  export function uniqid(options?: { template?: string; length?: number }): string;
}
declare module '@salesforce/core/util/unwrapArray' {
  export const unwrapArray: (args: unknown) => unknown;
}
declare module '@salesforce/core/util/zipWriter' {
  /// <reference types="node" />
  /// <reference types="node" />
  import { Readable, Writable } from 'node:stream';
  import { StructuredWriter } from '@salesforce/core/util/structuredWriter';
  export class ZipWriter extends Writable implements StructuredWriter {
    private readonly rootDestination?;
    private zip;
    private zipBuffer?;
    private logger;
    constructor(rootDestination?: string | undefined);
    get buffer(): Buffer;
    addToStore(contents: string | Readable | Buffer, path: string): Promise<void>;
    finalize(): Promise<void>;
    getDestinationPath(): string | undefined;
  }
}
declare module '@salesforce/core/webOAuthServer' {
  /// <reference types="node" />
  import * as http from 'node:http';
  import { AsyncCreatable } from '@salesforce/kit';
  import { AuthInfo } from '@salesforce/core/org/authInfo';
  import { JwtOAuth2Config } from '@salesforce/core/org/authInfo';
  /**
   * Handles the creation of a web server for web based login flows.
   *
   * Usage:
   * ```
   * const oauthConfig = {
   *   loginUrl: this.flags.instanceurl,
   *   clientId: this.flags.clientid,
   * };
   *
   * const oauthServer = await WebOAuthServer.create({ oauthConfig });
   * await oauthServer.start();
   * await open(oauthServer.getAuthorizationUrl(), { wait: false });
   * const authInfo = await oauthServer.authorizeAndSave();
   * ```
   */
  export class WebOAuthServer extends AsyncCreatable<WebOAuthServer.Options> {
    static DEFAULT_PORT: number;
    private authUrl;
    private logger;
    private webServer;
    private oauth2;
    private oauthConfig;
    private oauthError;
    constructor(options: WebOAuthServer.Options);
    /**
     * Returns the configured oauthLocalPort or the WebOAuthServer.DEFAULT_PORT
     *
     * @returns {Promise<number>}
     */
    static determineOauthPort(): Promise<number>;
    /**
     * Returns the authorization url that's used for the login flow
     *
     * @returns {string}
     */
    getAuthorizationUrl(): string;
    /**
     * Executes the oauth request and creates a new AuthInfo when successful
     *
     * @returns {Promise<AuthInfo>}
     */
    authorizeAndSave(): Promise<AuthInfo>;
    /**
     * Starts the web server
     */
    start(): Promise<void>;
    protected init(): Promise<void>;
    /**
     * Executes the oauth request
     *
     * @returns {Promise<AuthInfo>}
     */
    private executeOauthRequest;
    /**
     * Parses the auth code from the request url
     *
     * @param response the http response
     * @param request the http request
     * @returns {Nullable<string>}
     */
    private parseAuthCodeFromRequest;
    /**
     * Closes the request
     *
     * @param request the http request
     */
    private closeRequest;
    /**
     * Validates that the state param in the auth url matches the state
     * param in the http request
     *
     * @param request the http request
     */
    private validateState;
  }
  export namespace WebOAuthServer {
    type Options = {
      oauthConfig: JwtOAuth2Config;
    };
    type Request = http.IncomingMessage & {
      query: {
        code: string;
        state: string;
        error?: string;
        error_description?: string;
      };
    };
  }
  /**
   * Handles the actions specific to the http server
   */
  export class WebServer extends AsyncCreatable<WebServer.Options> {
    static DEFAULT_CLIENT_SOCKET_TIMEOUT: number;
    server: http.Server;
    port: number;
    host: string;
    private logger;
    private sockets;
    private redirectStatus;
    constructor(options: WebServer.Options);
    /**
     * Starts the http server after checking that the port is open
     */
    start(): Promise<void>;
    /**
     * Closes the http server and all open sockets
     */
    close(): void;
    /**
     * sends a response error.
     *
     * @param status the statusCode for the response.
     * @param message the message for the http body.
     * @param response the response to write the error to.
     */
    sendError(status: number, message: string, response: http.ServerResponse): void;
    /**
     * sends a response redirect.
     *
     * @param status the statusCode for the response.
     * @param url the url to redirect to.
     * @param response the response to write the redirect to.
     */
    doRedirect(status: number, url: string, response: http.ServerResponse): void;
    /**
     * sends a response to the browser reporting an error.
     *
     * @param error the oauth error
     * @param response the HTTP response.
     */
    reportError(error: Error, response: http.ServerResponse): void;
    /**
     * sends a response to the browser reporting the success.
     *
     * @param response the HTTP response.
     */
    reportSuccess(response: http.ServerResponse): void;
    /**
     * Preflight request:
     *
     * https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request
     * https://www.w3.org/TR/2020/SPSD-cors-20200602/#resource-preflight-requests
     */
    handlePreflightRequest(response: http.ServerResponse): void;
    handleSuccess(response: http.ServerResponse): Promise<void>;
    handleError(response: http.ServerResponse): Promise<void>;
    protected init(): Promise<void>;
    private handleRedirect;
    /**
     * Make sure we can't open a socket on the localhost/host port. It's important because we don't want to send
     * auth tokens to a random strange port listener. We want to make sure we can startup our server first.
     *
     * @private
     */
    private checkOsPort;
    /**
     * check and get the socket timeout form what was set in process.env.SFDX_HTTP_SOCKET_TIMEOUT
     *
     * @returns {number} - represents the socket timeout in ms
     * @private
     */
    private getSocketTimeout;
  }
  namespace WebServer {
    type Options = {
      port?: number;
      host?: string;
    };
  }
  export {};
}
declare module '@salesforce/core' {
  import main = require('@salesforce/core/index');
  export = main;
}
