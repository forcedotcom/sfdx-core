/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AnyJson, isPlainObject, JsonMap, Optional } from '@salesforce/ts-types';
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

export interface SfAliases {
  [key: string]: string;
}

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

  public getAllAliases(): SfAliases {
    return this.get(SfInfoKeys.ALIASES) || {};
  }

  /**
   * This method always returns the first alias found if it exists.
   *
   * @param aliasee - The entity whose alias you want to find
   */
  public getAlias(aliasee: string | Partial<SfOrg> | Partial<SfToken>): string | null {
    const matchedAliases = this.getAliases(aliasee);

    if (matchedAliases.length === 0) return null;
    return matchedAliases[0];
  }

  /**
   * This method always returns an array of aliases or an empty array if none exist.
   *
   * @param aliasee - The entity whose aliases you want to find
   */
  public getAliases(aliasee: string | Partial<SfOrg> | Partial<SfToken>): string[] {
    const aliaseeName = this.getAliaseeName(aliasee);
    const matchedAliases = Object.entries(this.getAllAliases()).filter((entry) => entry[1] === aliaseeName);

    // Only return the actual aliases
    return matchedAliases.map((entry) => entry[0]);
  }

  /**
   * This method returns the name that an alias refers to if one exists.
   *
   * @param alias -The alias of the name you want to get.
   */
  public getAliasee(alias: string): string | null {
    return this.getAllAliases()[alias] ?? null;
  }

  public setAlias(alias: string, aliasee: string | Partial<SfOrg> | Partial<SfToken>): void {
    const aliaseeName = this.getAliaseeName(aliasee);
    this.set(`${SfInfoKeys.ALIASES}["${alias}"]`, aliaseeName);
  }

  public updateAlias(alias: string, aliasee: string | Partial<SfOrg> | Partial<SfToken>): void {
    const aliaseeName = this.getAliaseeName(aliasee);
    this.update(`${SfInfoKeys.ALIASES}["${alias}"]`, aliaseeName);
  }

  public unsetAlias(alias: string): void {
    delete this.get(SfInfoKeys.ALIASES)[alias];
  }

  /**
   * This method unsets all the aliases for a particular aliasee.
   *
   * @param aliasee - The entity whose aliases you want to unset.
   */
  public unsetAliases(aliasee: string | Partial<SfOrg> | Partial<SfToken>): void {
    const aliases = this.getAliases(aliasee);
    aliases.forEach((alias) => this.unsetAlias(alias));
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

  private getAliaseeName(aliasee: string | Partial<SfOrg> | Partial<SfToken>): string {
    if (typeof aliasee === 'string') return aliasee;
    const aliaseeName = aliasee.username ?? aliasee.user;
    if (!aliaseeName) {
      throw new SfdxError(`Invalid aliasee, it must contain a user or username property: ${JSON.stringify(aliasee)}`);
    }
    return aliaseeName as string;
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
