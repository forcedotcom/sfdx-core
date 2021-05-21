/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { isEmpty } from '@salesforce/kit';
import { AnyJson, JsonMap, Optional } from '@salesforce/ts-types';
import { Global } from '../global';
import { ConfigFile } from './configFile';
import { ConfigValue } from './configStore';
import { SfdxDataHandler } from './sfdxDataHandler';

export enum SfDataKeys {
  AUTHORIZATIONS = 'authorizations',
}

export type OrgAuthorization = {
  alias: Optional<string>;
  username: Optional<string>;
  orgId: Optional<string>;
  instanceUrl: Optional<string>;
  accessToken?: string;
  oauthMethod?: 'jwt' | 'web' | 'token' | 'unknown';
  error?: string;
  timestamp: string;
} & JsonMap;
export interface OrgAuthorizations {
  [key: string]: OrgAuthorization;
}

export type SfData = {
  [SfDataKeys.AUTHORIZATIONS]: OrgAuthorizations;
};

export function deepCopy<T extends AnyJson>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export class GlobalInfo extends ConfigFile<ConfigFile.Options, SfData> {
  protected static encryptedKeys = ['accessToken', 'refreshToken', 'password', 'clientSecret'];
  private static EMPTY_DATA_MODEL: SfData = {
    [SfDataKeys.AUTHORIZATIONS]: {},
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
      GlobalInfo.instance = await GlobalInfo.create({});
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

  public getAuthorizations(decrypt = false): OrgAuthorizations {
    return this.get(SfDataKeys.AUTHORIZATIONS, decrypt);
  }

  public getAuthorization(username: string, decrypt = false): Optional<OrgAuthorization> {
    const auth: OrgAuthorization = this.get(`${SfDataKeys.AUTHORIZATIONS}["${username}"]`, decrypt);
    // For legacy, some things wants the username in the returned auth info.
    if (auth && !auth.username) auth.username = username;
    return auth;
  }

  public hasAuthorization(username: string): boolean {
    return !!this.getAuthorizations()[username];
  }

  public setAuthorization(username: string, authorization: OrgAuthorization): void {
    // For legacy, and to keep things standard, some things wants the username in auth info.
    if (!authorization.username) authorization.username = username;
    this.set(`${SfDataKeys.AUTHORIZATIONS}["${username}"]`, authorization);
  }

  public updateAuthorization(username: string, authorization: Partial<OrgAuthorization>): void {
    // For legacy, and to keep things standard, some things wants the username in auth info.
    if (!authorization.username) authorization.username = username;
    this.update(`${SfDataKeys.AUTHORIZATIONS}["${username}"]`, authorization);
  }

  public unsetAuthorization(username: string): void {
    this.unset(`${SfDataKeys.AUTHORIZATIONS}["${username}"]`);
  }

  public set(key: string, value: ConfigValue): SfData {
    return super.set(key, this.timestamp(value as JsonMap));
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
