/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export type SandboxRequest = {
  SandboxName: string;
  LicenseType?: string;
  /** Should match a SandboxInfoId, not a SandboxProcessId */
  SourceId?: string;
  Description?: string;
};
export type ResumeSandboxRequest = {
  SandboxName?: string;
  SandboxProcessObjId?: string;
};

export type SandboxFields = {
  sandboxOrgId: string;
  prodOrgUsername: string;
  sandboxName?: string;
  sandboxUsername?: string;
  sandboxProcessId?: string;
  sandboxInfoId?: string;
};

export type SandboxProcessObject = {
  Id: string;
  Status: string;
  SandboxName: string;
  SandboxInfoId: string;
  LicenseType: string;
  CreatedDate: string;
  SandboxOrganization?: string;
  CopyProgress?: number;
  SourceId?: string;
  Description?: string;
  ApexClassId?: string;
  EndDate?: string;
};

export interface StatusEvent {
  sandboxProcessObj: SandboxProcessObject;
  interval: number;
  remainingWait: number;
  waitingOnAuth: boolean;
}

export interface SandboxUserAuthResponse {
  authUserName: string;
  authCode: string;
  instanceUrl: string;
  loginUrl: string;
}

export interface SandboxUserAuthRequest {
  sandboxName: string;
  clientId: string;
  callbackUrl: string;
}

export interface ResultEvent {
  sandboxProcessObj: SandboxProcessObject;
  sandboxRes: SandboxUserAuthResponse;
}
