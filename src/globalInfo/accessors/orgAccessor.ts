/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Optional } from '@salesforce/ts-types';
import { GlobalInfo } from '../globalInfoConfig';
import { SfOrgs, SfOrg, SfInfoKeys } from '../types';

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
