/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import { JsonMap, Nullable, Optional } from '@salesforce/ts-types';
import { isEmpty } from '@salesforce/kit';
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
    org.username ??= username;
    this.globalInfo.set(`${SfInfoKeys.ORGS}["${username}"]`, org);
  }

  public update(username: string, org: Partial<SfOrg>): void {
    // For legacy, and to keep things standard, some things wants the username in auth info.
    org.username ??= username;
    this.globalInfo.update(`${SfInfoKeys.ORGS}["${username}"]`, org);
  }

  public unset(username: string): void {
    delete this.globalInfo.get(SfInfoKeys.ORGS)[username];
  }
}

export abstract class BaseOrgAccessor<T extends ConfigFile, P extends ConfigContents> {
  private configs: Map<string, Nullable<T>> = new Map();
  private contents: Map<string, P> = new Map();

  public async read(username: string, decrypt = false, throwOnNotFound = true): Promise<P> {
    try {
      const config = await this.initAuthFile(username, throwOnNotFound);
      this.configs.set(username, config);
      return this.get(username, decrypt) as P;
    } catch (err) {
      return {} as P;
    }
  }

  public async readAll(decrypt = false): Promise<P[]> {
    for (const file of await this.getAllFiles()) {
      const username = this.parseUsername(file);
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
      return org && !isEmpty(org) ? orgs.concat([org]) : orgs;
    }, [] as P[]);
  }

  public has(username: string): boolean {
    return this.contents.has(username);
  }

  public async exists(username: string): Promise<boolean> {
    const config = this.configs.get(username);
    return config ? await config.exists() : false;
  }

  public async hasFile(username: string): Promise<boolean> {
    try {
      await fs.promises.access(this.parseFilename(username));
      return true;
    } catch {
      return false;
    }
  }

  public async list(): Promise<string[]> {
    return this.getAllFiles();
  }

  public set(username: string, org: P): void {
    const config = this.configs.get(username);
    if (config) {
      config.setContentsFromObject(org);
      const contents = config.getContents();
      contents.username ??= username;
      this.contents.set(username, contents as P);
    } else {
      // @ts-ignore
      org.username ??= username;
      this.contents.set(username, org);
    }
  }

  public update(username: string, org: Partial<P> & JsonMap): void {
    const existing = this.get(username) || {};
    const merged = Object.assign({}, existing, org) as P;
    return this.set(username, merged);
  }

  public async remove(username: string): Promise<void> {
    await this.configs.get(username)?.unlink();
    this.configs.delete(username);
    this.contents.delete(username);
  }

  public async write(username: string): Promise<Nullable<P>> {
    const config = this.configs.get(username);
    if (config) {
      return (await config.write()) as P;
    } else {
      const contents = this.contents.get(username) || {};
      await this.read(username, false, false);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const config = this.configs.get(username)!;
      config.setContentsFromObject(contents);
      return (await config.write()) as P;
    }
  }

  private async getAllFiles(): Promise<string[]> {
    try {
      return (await fs.promises.readdir(Global.DIR)).filter((file) => file.match(this.getFileRegex()));
    } catch {
      return [];
    }
  }

  private parseUsername(filename: string): string {
    return filename.replace(this.getFileExtension(), '');
  }

  private parseFilename(username: string): string {
    return `${username}${this.getFileExtension()}`;
  }

  protected abstract initAuthFile(username: string, throwOnNotFound?: boolean): Promise<T>;
  protected abstract getFileRegex(): RegExp;
  protected abstract getFileExtension(): string;
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

  protected getFileExtension(): string {
    return '.json';
  }
}
