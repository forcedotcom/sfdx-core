/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AnyJson, isPlainObject, JsonMap, Optional } from '@salesforce/ts-types';
import { Global } from '../global';
import { ConfigFile } from '../config/configFile';
import { ConfigValue } from '../config/configStore';
import { SfdxDataHandler } from './sfdxDataHandler';
import { GlobalInfoOrgAccessor } from './accessors/orgAccessor';
import { GlobaInfoTokenAccessor } from './accessors/tokenAccessor';
import { GlobalInfoAliasAccessor } from './accessors/aliasAccessor';
import { SfInfo, SfInfoKeys } from './types';
import { GlobalInfoSandboxAccessor } from './accessors/sandboxAccessor';

export function deepCopy<T extends AnyJson>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

/**
 * @deprecated use StateAggregator instead.
 */
export class GlobalInfo extends ConfigFile<ConfigFile.Options, SfInfo> {
  protected static encryptedKeys = [/token/gi, /password/gi, /secret/gi];
  private static EMPTY_DATA_MODEL: SfInfo = {
    [SfInfoKeys.ORGS]: {},
    [SfInfoKeys.TOKENS]: {},
    [SfInfoKeys.ALIASES]: {},
    [SfInfoKeys.SANDBOXES]: {},
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

  public get orgs(): GlobalInfoOrgAccessor {
    return new GlobalInfoOrgAccessor(this);
  }

  public get tokens(): GlobaInfoTokenAccessor {
    return new GlobaInfoTokenAccessor(this);
  }

  public get aliases(): GlobalInfoAliasAccessor {
    return new GlobalInfoAliasAccessor(this);
  }

  public get sandboxes(): GlobalInfoSandboxAccessor {
    return new GlobalInfoSandboxAccessor(this);
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
  }

  private timestamp<T extends JsonMap>(data: T): T {
    return { ...data, timestamp: new Date() };
  }

  private async loadSfData(): Promise<SfInfo> {
    const data = await this.read();
    return { ...GlobalInfo.emptyDataModel, ...data };
  }

  private async mergeWithSfdxData(): Promise<SfInfo> {
    const sfData = await this.loadSfData();
    const merged = await this.sfdxHandler.merge(sfData);
    await this.write(merged);
    return merged;
  }
}
