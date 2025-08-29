/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable class-methods-use-this */

import { SandboxOrgConfig } from '../../config/sandboxOrgConfig';
import { SandboxFields } from '../../org/org';
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
