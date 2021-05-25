/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { isEmpty } from '@salesforce/kit';
import { AnyJson, isPlainObject, JsonMap, Optional } from '@salesforce/ts-types';
import { Global } from '../global';
import { ConfigFile } from './configFile';
import { ConfigValue } from './configStore';
import { SfdxDataHandler } from './sfdxDataHandler';

export enum SfInfoKeys {
  ORGS = 'orgs',
  TOKENS = 'tokens',
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

export type SfInfo = {
  [SfInfoKeys.ORGS]: SfOrgs;
  [SfInfoKeys.TOKENS]: SfTokens;
};

export function deepCopy<T extends AnyJson>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export class GlobalInfo extends ConfigFile<ConfigFile.Options, SfInfo> {
  protected static encryptedKeys = [/token/gi, /password/gi, /secret/gi];
  private static EMPTY_DATA_MODEL: SfInfo = {
    [SfInfoKeys.ORGS]: {},
    [SfInfoKeys.TOKENS]: {},
  };
  private static instance: Optional<GlobalInfo>;

  // When @salesforce/core@v2 is deprecated and no longer used, this can be removed
  private static enableInteroperability = true;

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

  public getOrgs(decrypt = false): SfOrgs {
    return this.get(SfInfoKeys.ORGS, decrypt);
  }

  public getOrg(username: string, decrypt = false): Optional<SfOrg & Timestamp> {
    const auth: SfOrg & Timestamp = this.get(`${SfInfoKeys.ORGS}["${username}"]`, decrypt);
    // For legacy, some things wants the username in the returned auth info.
    if (auth && !auth.username) auth.username = username;
    return auth;
  }

  public hasOrg(username: string): boolean {
    return !!this.getOrgs()[username];
  }

  public setOrg(username: string, org: SfOrg): void {
    // For legacy, and to keep things standard, some things wants the username in auth info.
    if (!org.username) org.username = username;
    this.set(`${SfInfoKeys.ORGS}["${username}"]`, org);
  }

  public updateOrg(username: string, authorization: Partial<SfOrg>): void {
    // For legacy, and to keep things standard, some things wants the username in auth info.
    if (!authorization.username) authorization.username = username;
    this.update(`${SfInfoKeys.ORGS}["${username}"]`, authorization);
  }

  public unsetOrg(username: string): void {
    this.unset(`${SfInfoKeys.ORGS}["${username}"]`);
  }

  public getTokens(decrypt = false): SfTokens {
    return this.get(SfInfoKeys.TOKENS, decrypt) || {};
  }

  public getToken(name: string, decrypt = false): Optional<SfToken & Timestamp> {
    return this.get(`${SfInfoKeys.TOKENS}["${name}"]`, decrypt);
  }

  public hasToken(name: string): boolean {
    return !!this.getTokens()[name];
  }

  public setToken(name: string, token: SfToken): void {
    this.set(`${SfInfoKeys.TOKENS}["${name}"]`, token);
  }

  public updateToken(name: string, token: Partial<SfToken>): void {
    this.update(`${SfInfoKeys.TOKENS}["${name}"]`, token);
  }

  public unsetToken(name: string): void {
    this.unset(`${SfInfoKeys.TOKENS}["${name}"]`);
  }

  public set(key: string, value: ConfigValue): void {
    if (isPlainObject(value)) {
      value = this.timestamp(value as JsonMap);
    }
    super.set(key, value);
  }

  public async write(newContents?: SfInfo): Promise<SfInfo> {
    const result = await super.write(newContents);
    if (GlobalInfo.enableInteroperability) await this.sfdxHandler.write(result);
    return result;
  }

  protected async init(): Promise<void> {
    await this.initCrypto();
    const contents = GlobalInfo.enableInteroperability ? await this.mergeWithSfdxData() : await this.loadSfData();
    this.setContents(contents);
  }

  private timestamp<T extends JsonMap>(data: T): T {
    return Object.assign(data, { timestamp: new Date() });
  }

  private async loadSfData(): Promise<SfInfo> {
    const data = await this.read();
    return isEmpty(data) ? GlobalInfo.emptyDataModel : data;
  }

  private async mergeWithSfdxData(): Promise<SfInfo> {
    const sfData = await this.loadSfData();
    const merged = await this.sfdxHandler.merge(sfData);
    return merged;
  }
}
