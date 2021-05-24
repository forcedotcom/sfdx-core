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

export enum SfDataKeys {
  ORGS = 'orgs',
  TOKENS = 'tokens',
}

export type Entry = { timestamp: string } & JsonMap;

export type Org = {
  alias: Optional<string>;
  username: Optional<string>;
  orgId: Optional<string>;
  instanceUrl: Optional<string>;
  accessToken?: string;
  oauthMethod?: 'jwt' | 'web' | 'token' | 'unknown';
  error?: string;
} & Entry;
export interface Orgs {
  [key: string]: Org;
}

export type Token = {
  token: string;
  url: string;
  user: string;
} & Entry;

export interface Tokens {
  [key: string]: Token;
}

export type SfData = {
  [SfDataKeys.ORGS]: Orgs;
  [SfDataKeys.TOKENS]: Tokens;
};

export function deepCopy<T extends AnyJson>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export class GlobalInfo extends ConfigFile<ConfigFile.Options, SfData> {
  protected static encryptedKeys = ['accessToken', 'refreshToken', 'password', 'clientSecret'];
  private static EMPTY_DATA_MODEL: SfData = {
    [SfDataKeys.ORGS]: {},
    [SfDataKeys.TOKENS]: {},
  };
  private static instance: Optional<GlobalInfo>;

  // When @salesforce/core@v2 is deprecated and no longer used, this can be removed
  private static enableInteroperability = true;

  private sfdxHandler = new SfdxDataHandler();

  public static get emptyDataModel(): SfData {
    return deepCopy<SfData>(GlobalInfo.EMPTY_DATA_MODEL);
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

  public getOrgs(decrypt = false): Orgs {
    return this.get(SfDataKeys.ORGS, decrypt);
  }

  public getOrg(username: string, decrypt = false): Optional<Org> {
    const auth: Org = this.get(`${SfDataKeys.ORGS}["${username}"]`, decrypt);
    // For legacy, some things wants the username in the returned auth info.
    if (auth && !auth.username) auth.username = username;
    return auth;
  }

  public hasOrg(username: string): boolean {
    return !!this.getOrgs()[username];
  }

  public setOrg(username: string, org: Org): void {
    // For legacy, and to keep things standard, some things wants the username in auth info.
    if (!org.username) org.username = username;
    this.set(`${SfDataKeys.ORGS}["${username}"]`, org);
  }

  public updateOrg(username: string, authorization: Partial<Org>): void {
    // For legacy, and to keep things standard, some things wants the username in auth info.
    if (!authorization.username) authorization.username = username;
    this.update(`${SfDataKeys.ORGS}["${username}"]`, authorization);
  }

  public unsetOrg(username: string): void {
    this.unset(`${SfDataKeys.ORGS}["${username}"]`);
  }

  public getTokens(decrypt = false): Tokens {
    return this.get(SfDataKeys.TOKENS, decrypt) || {};
  }

  public getToken(name: string, decrypt = false): Optional<Token> {
    return this.get(`${SfDataKeys.TOKENS}["${name}"]`, decrypt);
  }

  public hasToken(name: string): boolean {
    return !!this.getTokens()[name];
  }

  public setToken(name: string, token: Token): void {
    this.set(`${SfDataKeys.TOKENS}["${name}"]`, token);
  }

  public updateToken(name: string, token: Partial<Token>): void {
    this.update(`${SfDataKeys.TOKENS}["${name}"]`, token);
  }

  public unsetToken(name: string): void {
    this.unset(`${SfDataKeys.TOKENS}["${name}"]`);
  }

  public set(key: string, value: ConfigValue): void {
    if (isPlainObject(value)) {
      value = this.timestamp(value as JsonMap);
    }
    super.set(key, value);
  }

  public async write(newContents?: SfData): Promise<SfData> {
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

  private async loadSfData(): Promise<SfData> {
    const data = await this.read();
    return isEmpty(data) ? GlobalInfo.emptyDataModel : data;
  }

  private async mergeWithSfdxData(): Promise<SfData> {
    const sfData = await this.loadSfData();
    const merged = await this.sfdxHandler.merge(sfData);
    return merged;
  }
}
