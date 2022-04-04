/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Nullable } from '@salesforce/ts-types';
import { GlobalInfo } from '../globalInfoConfig';
import { SfInfoKeys, SfSandbox, SfSandboxes } from '../types';

export class SandboxAccessor {
  public constructor(private globalInfo: GlobalInfo) {}

  /**
   * Returns all the sandboxes (or all the sandboxes for a given prod org)
   *
   * @param entity entity as a string should be a production org username
   * and when entity is a SfSandbox, the prod org entity.prodOrgUsername will
   * used in the filter.
   */
  public getAll(entity?: string | SfSandbox): SfSandboxes {
    const all = this.globalInfo.get(SfInfoKeys.SANDBOXES) || {};
    if (!entity) {
      return all;
    }
    const prodOrgUsername = typeof entity === 'string' ? entity : entity.prodOrgUsername;
    return Object.fromEntries(Object.entries(all).filter(([, value]) => value.prodOrgUsername === prodOrgUsername));
  }

  /**
   * Returns the SfSandbox config entry that corresponds to the given
   * sandbox org id if it exists
   *
   * @param sandboxOrgId the sandboxOrgId that corresponds to a sandbox
   */
  public get(sandboxOrgId?: string): Nullable<SfSandbox> {
    return sandboxOrgId ? this.getAll()[sandboxOrgId] ?? null : null;
  }

  /**
   * Returns true if the given sandbox org id exists
   *
   * @param sandboxOrgId the sandboxOrgId that corresponds to a sandbox
   */
  public has(sandboxOrgId?: string): boolean {
    return !!(sandboxOrgId ? this.getAll()[sandboxOrgId] ?? null : null);
  }

  /**
   * Set an sandboxOrgId for the given sandbox entity
   *
   * @param sandboxOrgId the sandboxOrgId you want to set
   * @param entity the sandbox entity
   */
  public set(sandboxOrgId: string, entity: SfSandbox): void {
    this.globalInfo.set(`${SfInfoKeys.SANDBOXES}["${sandboxOrgId}"]`, entity);
  }

  public unset(sandboxOrgId: string): void {
    delete this.globalInfo.get(SfInfoKeys.SANDBOXES)[sandboxOrgId];
  }
}
