/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AnyJson, isPlainObject, JsonMap, Nullable, Optional } from '@salesforce/ts-types';
import { Global } from '../global';
import { SfdxError } from '../sfdxError';
import { ConfigFile } from './configFile';
import { ConfigValue } from './configStore';
import { SfdxDataHandler } from './sfdxDataHandler';

export enum SfInfoKeys {
  ORGS = 'orgs',
  TOKENS = 'tokens',
  ALIASES = 'aliases',
}

export type Timestamp = { timestamp: string };
export type SfEntry = JsonMap;

export type SfOrg = {
  alias: Optional<string>;
  username: Optional<string>;
  orgId: Optional<string>;
  instanceUrl: Optional<string>;
  accessToken?: string;
  oauthMethod?: 'jwt' | 'web' | 'token' | 'unknown';
  error?: string;
} & SfEntry;

export interface SfOrgs {
  [key: string]: SfOrg & Timestamp;
}

export type SfToken = {
  token: string;
  url: string;
  user?: string;
} & SfEntry;

export interface SfTokens {
  [key: string]: SfToken & Timestamp;
}

/**
 * The key will always be the alias and the value will always be the username, e.g.
 * { "MyAlias": "user@salesforce.com" }
 */
export interface SfAliases {
  [alias: string]: string;
}

export type Aliasable = string | Partial<SfOrg> | Partial<SfToken>;

export type SfInfo = {
  [SfInfoKeys.ORGS]: SfOrgs;
  [SfInfoKeys.TOKENS]: SfTokens;
  [SfInfoKeys.ALIASES]: SfAliases;
};

export function deepCopy<T extends AnyJson>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export class GlobalInfo extends ConfigFile<ConfigFile.Options, SfInfo> {
  protected static encryptedKeys = [/token/gi, /password/gi, /secret/gi];
  private static EMPTY_DATA_MODEL: SfInfo = {
    [SfInfoKeys.ORGS]: {},
    [SfInfoKeys.TOKENS]: {},
    [SfInfoKeys.ALIASES]: {},
  };
  private static instance: Optional<GlobalInfo>;

  private sfdxHandler = new SfdxDataHandler();

  public static get emptyDataModel(): SfInfo {
    return deepCopy<SfInfo>(GlobalInfo.EMPTY_DATA_MODEL);
  }

  public static async getInstance(): Promise<GlobalInfo> {
    if (!GlobalInfo.instance) {
      GlobalInfo.instance = await GlobalInfo.create();
    }
    return GlobalInfo.instance;
  }

  /**
   * Clear the cache to force reading from disk.
   *
   * *NOTE: Only call this method if you must and you know what you are doing.*
   */
  public static clearInstance(): void {
    delete GlobalInfo.instance;
  }

  public static getFileName(): string {
    return 'sf.json';
  }

  /**
   * Gets default options for the SfConfig
   */
  public static getDefaultOptions(): ConfigFile.Options {
    return {
      isGlobal: true,
      isState: true,
      filename: GlobalInfo.getFileName(),
      stateFolder: Global.SF_STATE_FOLDER,
    };
  }

  public get orgs(): OrgAccessor {
    return new OrgAccessor(this);
  }

  public get tokens(): TokenAccessor {
    return new TokenAccessor(this);
  }

  public get aliases(): AliasAccessor {
    return new AliasAccessor(this);
  }

  public set(key: string, value: ConfigValue): void {
    if (isPlainObject(value)) {
      value = this.timestamp(value as JsonMap);
    }
    super.set(key, value);
  }

  public async write(newContents?: SfInfo): Promise<SfInfo> {
    const result = await super.write(newContents);
    if (Global.SFDX_INTEROPERABILITY) await this.sfdxHandler.write(result);
    return result;
  }

  protected async init(): Promise<void> {
    await this.initCrypto();
    const contents = Global.SFDX_INTEROPERABILITY ? await this.mergeWithSfdxData() : await this.loadSfData();
    this.setContents(contents);
    await this.write(contents);
  }

  private timestamp<T extends JsonMap>(data: T): T {
    return Object.assign(data, { timestamp: new Date() });
  }

  private async loadSfData(): Promise<SfInfo> {
    const data = await this.read();
    return Object.assign(GlobalInfo.emptyDataModel, data);
  }

  private async mergeWithSfdxData(): Promise<SfInfo> {
    const sfData = await this.loadSfData();
    const merged = await this.sfdxHandler.merge(sfData);
    return merged;
  }
}

export class OrgAccessor {
  public constructor(private globalInfo: GlobalInfo) {}

  public getAll(decrypt = false): SfOrgs {
    return this.globalInfo.get(SfInfoKeys.ORGS, decrypt);
  }

  public get(username: string, decrypt = false): Optional<SfOrg> {
    const auth = this.globalInfo.get<SfOrg>(`${SfInfoKeys.ORGS}["${username}"]`, decrypt);
    // For legacy, some things wants the username in the returned auth info.
    if (auth && !auth.username) auth.username = username;
    return auth;
  }

  public has(username: string): boolean {
    return !!this.getAll()[username];
  }

  public set(username: string, org: SfOrg): void {
    // For legacy, and to keep things standard, some things wants the username in auth info.
    if (!org.username) org.username = username;
    this.globalInfo.set(`${SfInfoKeys.ORGS}["${username}"]`, org);
  }

  public update(username: string, authorization: Partial<SfOrg>): void {
    // For legacy, and to keep things standard, some things wants the username in auth info.
    if (!authorization.username) authorization.username = username;
    this.globalInfo.update(`${SfInfoKeys.ORGS}["${username}"]`, authorization);
  }

  public unset(username: string): void {
    delete this.globalInfo.get(SfInfoKeys.ORGS)[username];
  }
}

export class TokenAccessor {
  public constructor(private globalInfo: GlobalInfo) {}

  public getAll(decrypt = false): SfTokens {
    return this.globalInfo.get(SfInfoKeys.TOKENS, decrypt) || {};
  }

  public get(name: string, decrypt = false): Optional<SfToken & Timestamp> {
    return this.globalInfo.get(`${SfInfoKeys.TOKENS}["${name}"]`, decrypt);
  }

  public has(name: string): boolean {
    return !!this.getAll()[name];
  }

  public set(name: string, token: SfToken): void {
    this.globalInfo.set(`${SfInfoKeys.TOKENS}["${name}"]`, token);
  }

  public update(name: string, token: Partial<SfToken>): void {
    this.globalInfo.update(`${SfInfoKeys.TOKENS}["${name}"]`, token);
  }

  public unset(name: string): void {
    delete this.globalInfo.get(SfInfoKeys.TOKENS)[name];
  }
}

export class AliasAccessor {
  public constructor(private globalInfo: GlobalInfo) {}

  /**
   * Returns all the aliases
   */
  public all(): SfAliases {
    return this.globalInfo.get(SfInfoKeys.ALIASES) || {};
  }

  /**
   * Returns all the aliases for a given entity
   *
   * @param entity the aliasable entity that you want to get the aliases of
   */
  public getAll(entity: Aliasable): string[] {
    const username = this.getNameOf(entity);
    return Object.entries(this.all())
      .filter((entry) => entry[1] === username)
      .map((entry) => entry[0]);
  }

  /**
   * Returns the first alias found for a given entity
   *
   * @param entity the aliasable entity that you want to get the alias of
   */
  public get(entity: Aliasable): Nullable<string> {
    const matchedAliases = this.getAll(entity);

    if (matchedAliases.length === 0) return null;
    return matchedAliases[0];
  }

  /**
   * Returns the username that corresponds to the given alias if it exists
   *
   * @param alias the alias that corresponds to a username
   */
  public getUsername(alias: string): Nullable<string> {
    return this.all()[alias] ?? null;
  }

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
  public resolveUsername(usernameOrAlias: string): string {
    return this.getUsername(usernameOrAlias) ?? usernameOrAlias;
  }

  /**
   * Set an alias for the given aliasable entity
   *
   * @param alias the alias you want to set
   * @param entity the aliasable entity that's being aliased
   */
  public set(alias: string, entity: Aliasable): void {
    const username = this.getNameOf(entity);
    this.globalInfo.set(`${SfInfoKeys.ALIASES}["${alias}"]`, username);
  }

  /**
   * Updates the alias for the given aliasable entity
   *
   * @param alias the alias you want to set
   * @param entity the aliasable entity that's being aliased
   */
  public update(alias: string, entity: Aliasable): void {
    const username = this.getNameOf(entity);
    this.globalInfo.update(`${SfInfoKeys.ALIASES}["${alias}"]`, username);
  }

  public unset(alias: string): void {
    delete this.globalInfo.get(SfInfoKeys.ALIASES)[alias];
  }

  /**
   * This method unsets all the aliases for the given entity.
   *
   * @param entity the aliasable entity for which you want to unset all aliases
   */
  public unsetAll(entity: Aliasable): void {
    const aliases = this.getAll(entity);
    aliases.forEach((alias) => this.unset(alias));
  }

  /**
   * Returns the username of given aliasable entity
   */
  private getNameOf(entity: Aliasable): string {
    if (typeof entity === 'string') return entity;
    const aliaseeName = entity.username ?? entity.user;
    if (!aliaseeName) {
      throw new SfdxError(`Invalid aliasee, it must contain a user or username property: ${JSON.stringify(entity)}`);
    }
    return aliaseeName as string;
  }
}
