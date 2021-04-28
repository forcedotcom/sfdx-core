/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { isEmpty } from '@salesforce/kit';
import { JsonMap } from '@salesforce/ts-types';
import { SfAuthorization } from '../authInfo';
import { Global } from '../global';
import { ConfigFile } from './configFile';
import { ConfigContents, ConfigValue } from './configStore';
import { SfdxDataHandler } from './sfdxDataHandler';

export enum SfDataKeys {
  AUTHORIZATIONS = 'authorizations',
}

type Timestamp = { timestamp: Date };

export interface Authorizations {
  [key: string]: SfAuthorization & Timestamp;
}

export type SfData = {
  [SfDataKeys.AUTHORIZATIONS]: Authorizations;
};

export class GlobalInfo extends ConfigFile<ConfigFile.Options> {
  public static EMPTY_DATA_MODEL: SfData = {
    [SfDataKeys.AUTHORIZATIONS]: {},
  };
  private static instance: GlobalInfo;
  private static enableInteroperability = true;
  private sfdxHandler = new SfdxDataHandler();

  public static async getInstance(): Promise<GlobalInfo> {
    if (!GlobalInfo.instance) {
      GlobalInfo.instance = await GlobalInfo.create(GlobalInfo.getOptions());
    }
    return GlobalInfo.instance;
  }

  public static getFileName(): string {
    return 'sf.json';
  }

  /**
   * Gets default options for the SfConfig
   */
  public static getOptions(): ConfigFile.Options {
    return {
      isGlobal: true,
      isState: true,
      filename: GlobalInfo.getFileName(),
      stateFolder: Global.SF_STATE_FOLDER,
    };
  }

  public getContents(): SfData {
    return this['contents'] as SfData;
  }

  public get authorizations(): Authorizations {
    return this.getContents()[SfDataKeys.AUTHORIZATIONS];
  }

  public getAuthorization(username: string): SfAuthorization {
    return this.getContents()[SfDataKeys.AUTHORIZATIONS][username];
  }

  public hasAuthorization(username: string): boolean {
    return !!this.getContents()[SfDataKeys.AUTHORIZATIONS][username];
  }

  public setAuthorization(username: string, authorization: SfAuthorization): void {
    this.set(`${SfDataKeys.AUTHORIZATIONS}["${username}"]`, authorization);
  }

  public unsetAuthorization(username: string): void {
    this.unset(`${SfDataKeys.AUTHORIZATIONS}["${username}"]`);
  }

  public set<U extends JsonMap>(key: string, value: U): ConfigContents {
    return super.set(key, this.timestamp(value));
  }

  public async write(newContents?: SfData): Promise<SfData> {
    const result = (await super.write(newContents)) as SfData;
    if (GlobalInfo.enableInteroperability) await this.sfdxHandler.write(result);
    return result;
  }

  protected async init(): Promise<void> {
    const contents = GlobalInfo.enableInteroperability ? await this.mergeWithSfdxData() : await this.loadSfData();
    this.setContents(contents);
  }

  private timestamp(data: JsonMap): ConfigValue {
    return Object.assign(data, { timestamp: new Date() });
  }

  private async loadSfData(): Promise<SfData> {
    const data = (await this.read()) as SfData;
    return isEmpty(data) ? GlobalInfo.EMPTY_DATA_MODEL : data;
  }

  private async mergeWithSfdxData(): Promise<SfData> {
    const sfData = await this.loadSfData();
    const merged = await this.sfdxHandler.merge(sfData);
    return merged;
  }
}
