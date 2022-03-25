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
   * Returns all the sandboxes for all the values
   */
  public getAll(): SfSandboxes;
  /**
   * Returns all the sandboxes for a given prod org
   *
   * @param entity the sandbox entity that you want to get the sandboxes for
   */
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  public getAll(entity: string | SfSandbox): SfSandboxes;
  public getAll(entity?: string | SfSandbox): SfSandboxes {
    const all = this.globalInfo.get(SfInfoKeys.SANDBOXES) || {};
    if (entity) {
      const e = typeof entity === 'string' ? ({ prodOrgUsername: entity } as Partial<SfSandbox>) : entity;
      return Object.entries(all)
        .filter(([, value]) => value.prodOrgUsername === e.prodOrgUsername)
        .map((entry) => entry)
        .reduce((a, [b, value]) => {
          return Object.assign(a, { [b]: { ...value } });
        }, {});
    } else {
      return all;
    }
  }

  /**
   * Returns the SfSandbox config entry that corresponds to the given
   * sandbox org id if it exists
   *
   * @param sandboxOrgId the sandboxOrgId that corresponds to a sandbox
   */
  public get(sandboxOrgId?: string): Nullable<SfSandbox> {
    return this.getAll()[sandboxOrgId || 'some value that ensures a miss'] ?? null;
  }

  /**
   * Returns true if the given sandbox org id exists
   *
   * @param sandboxOrgId the sandboxOrgId that corresponds to a sandbox
   */
  public has(sandboxOrgId?: string): boolean {
    return !!(this.getAll()[sandboxOrgId || 'some value that ensures a miss'] ?? undefined);
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
