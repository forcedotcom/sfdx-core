/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SandboxOrgConfig } from '../../config/sandboxOrgConfig';
import { SandboxFields } from '../../org';
import { BaseOrgAccessor } from './orgAccessor';

export class SandboxAccessor extends BaseOrgAccessor<SandboxOrgConfig, SandboxFields> {
  protected async initAuthFile(username: string, throwOnNotFound = false): Promise<SandboxOrgConfig> {
    return SandboxOrgConfig.create({
      ...SandboxOrgConfig.getOptions(username),
      throwOnNotFound,
    });
  }

  protected getFileRegex(): RegExp {
    return /^(00D.*?)\.sandbox\.json$/;
  }

  protected getFileExtension(): string {
    return '.sandbox.json';
  }
}
