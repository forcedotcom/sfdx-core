/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import { JsonMap, Nullable, Optional } from '@salesforce/ts-types';
import { AuthInfoConfig } from '../../config/authInfoConfig';
import { Global } from '../../global';
import { GlobalInfo } from '../globalInfoConfig';
import { SfOrgs, SfOrg, SfInfoKeys } from '../types';
import { AuthFields } from '../../org';
import { ConfigContents, ConfigFile } from '../../exported';

/**
 * @deprecated
 */
export class GlobalInfoOrgAccessor {
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

  public update(username: string, org: Partial<SfOrg>): void {
    // For legacy, and to keep things standard, some things wants the username in auth info.
    if (!org.username) org.username = username;
    this.globalInfo.update(`${SfInfoKeys.ORGS}["${username}"]`, org);
  }

  public unset(username: string): void {
    delete this.globalInfo.get(SfInfoKeys.ORGS)[username];
  }
}

export abstract class BaseOrgAccessor<T extends ConfigFile, P extends ConfigContents> {
  private configs: Map<string, Nullable<T>> = new Map();
  private contents: Map<string, P> = new Map();
  private files: string[];

  public constructor() {
    this.files = this.getAllFiles();
    // for (const file of this.files) {
    //   const username = file.replace('.json', '');
    //   this.configs.set(username, null);
    //   this.contents.set(username, {} as P);
    // }
  }

  public async read(username: string, decrypt = false, throwOnNotFound = false): Promise<P> {
    const config = await this.initAuthFile(username, throwOnNotFound);
    this.configs.set(username, config);
    return this.get(username, decrypt) as P;
  }

  public async readAll(decrypt = false): Promise<P[]> {
    for (const file of this.files) {
      const username = file.replace('.json', '');
      const config = await this.initAuthFile(username);
      this.configs.set(username, config);
    }
    return this.getAll(decrypt);
  }

  public get(username: string, decrypt = false): Nullable<P> {
    const config = this.configs.get(username);
    if (config) {
      this.contents.set(username, config.getContents(decrypt) as P);
    }

    return this.contents.get(username);
  }

  public getAll(decrypt = false): P[] {
    return [...this.configs.keys()].reduce((orgs, username) => {
      const org = this.get(username, decrypt);
      return org ? orgs.concat([org]) : orgs;
    }, [] as P[]);
  }

  public has(username: string): boolean {
    return this.configs.has(username);
  }

  public async exists(username: string): Promise<boolean> {
    const config = this.configs.get(username);
    return config ? await config.exists() : false;
  }

  public hasFile(username: string): boolean {
    return Boolean(this.files.find((f) => f.replace('.json', '') === username));
  }

  public list(): string[] {
    return this.files;
  }

  public set(username: string, org: P): void {
    const config = this.configs.get(username);
    if (config) {
      config.setContentsFromObject(org);
      this.contents.set(username, config.getContents() as P);
    } else {
      this.contents.set(username, org);
    }
  }

  public update(username: string, org: Partial<P> & JsonMap): void {
    const existing = this.get(username);
    const merged = Object.assign({}, existing || {}, org) as P;
    return this.set(username, merged);
  }

  public async remove(username: string): Promise<void> {
    return this.configs.get(username)?.unlink();
  }

  public async write(username: string): Promise<Nullable<P>> {
    const config = this.configs.get(username);
    if (config) {
      return (await config.write()) as P;
    } else {
      await this.read(username);
      const contents = this.contents.get(username) ?? {};
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const config = this.configs.get(username)!;
      config.setContentsFromObject(contents);
      return (await config.write()) as P;
    }
  }

  private getAllFiles(): string[] {
    return fs.readdirSync(Global.SFDX_DIR).filter((file) => file.match(this.getFileRegex()));
  }

  protected abstract initAuthFile(username: string, throwOnNotFound?: boolean): Promise<T>;
  protected abstract getFileRegex(): RegExp;
}

export class OrgAccessor extends BaseOrgAccessor<AuthInfoConfig, AuthFields> {
  protected async initAuthFile(username: string, throwOnNotFound = false): Promise<AuthInfoConfig> {
    return AuthInfoConfig.create({
      ...AuthInfoConfig.getOptions(username),
      throwOnNotFound,
    });
  }

  protected getFileRegex(): RegExp {
    // The regular expression that filters files stored in $HOME/.sfdx
    return /^[^.][^@]*@[^.]+(\.[^.\s]+)+\.json$/;
  }
}
