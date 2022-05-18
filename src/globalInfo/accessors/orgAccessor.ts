/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import { Nullable, Optional } from '@salesforce/ts-types';
import { AuthInfoConfig } from '../../config/authInfoConfig';
import { Global } from '../../global';
import { GlobalInfo } from '../globalInfoConfig';
import { SfOrgs, SfOrg, SfInfoKeys } from '../types';
import { AuthFields } from '../../org';

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

export class OrgAccessor {
  // The regular expression that filters files stored in $HOME/.sfdx
  private static AUTH_FILE_REGEX = /^[^.][^@]*@[^.]+(\.[^.\s]+)+\.json$/;

  private orgConfigs: Map<string, Nullable<AuthInfoConfig>> = new Map();
  private orgContents: Map<string, AuthFields> = new Map();

  public constructor() {
    for (const file of this.getAllAuthFiles()) {
      const username = file.replace('.json', '');
      this.orgConfigs.set(username, null);
      this.orgContents.set(username, {});
    }
  }

  public async read(username: string, decrypt = false, throwOnNotFound = false): Promise<AuthFields> {
    const config = await AuthInfoConfig.create({
      ...AuthInfoConfig.getOptions(username),
      throwOnNotFound,
    });
    this.orgConfigs.set(username, config);
    return this.get(username, decrypt) as AuthFields;
  }

  public async readAll(decrypt = false): Promise<AuthFields[]> {
    for (const username of this.list()) {
      const config = await AuthInfoConfig.create({
        ...AuthInfoConfig.getOptions(username),
        throwOnNotFound: false,
      });
      this.orgConfigs.set(username, config);
    }
    return this.getAll(decrypt);
  }

  public get(username: string, decrypt = false): Nullable<AuthFields> {
    const config = this.orgConfigs.get(username);
    if (config) {
      this.orgContents.set(username, config.getContents(decrypt));
    }

    return this.orgContents.get(username);
  }

  public getAll(decrypt = false): AuthFields[] {
    return this.list().reduce((orgs, username) => {
      const org = this.get(username, decrypt);
      return org ? orgs.concat([org]) : orgs;
    }, [] as AuthFields[]);
  }

  public has(username: string): boolean {
    return this.orgConfigs.has(username);
  }

  public async exists(username: string): Promise<boolean> {
    const config = this.orgConfigs.get(username);
    return config ? await config.exists() : false;
  }

  public list(): string[] {
    return [...this.orgConfigs.keys()];
  }

  public set(username: string, org: AuthFields): void {
    const config = this.orgConfigs.get(username);
    if (config) {
      config.setContentsFromObject(org);
      this.orgContents.set(username, config.getContents());
    } else {
      this.orgContents.set(username, org);
    }
  }

  public update(username: string, org: Partial<AuthFields>): void {
    const existing = this.get(username);
    const merged = Object.assign({}, existing || {}, org);
    return this.set(username, merged);
  }

  public async remove(username: string): Promise<void> {
    return this.orgConfigs.get(username)?.unlink();
  }

  public async write(username: string): Promise<Nullable<AuthFields>> {
    const config = this.orgConfigs.get(username);
    if (config) {
      return config.write();
    } else {
      await this.read(username);
      const contents = this.orgContents.get(username) ?? {};
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const config = this.orgConfigs.get(username)!;
      config.setContentsFromObject(contents);
      return config.write();
    }
  }

  private getAllAuthFiles(): string[] {
    return fs.readdirSync(Global.SFDX_DIR).filter((file) => file.match(OrgAccessor.AUTH_FILE_REGEX));
  }
}
