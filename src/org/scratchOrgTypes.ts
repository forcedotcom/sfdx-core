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

import { JsonMap } from '@salesforce/ts-types';

export type ScratchOrgInfo = {
  AdminEmail?: string;
  readonly CreatedDate?: string;
  ConnectedAppCallbackUrl?: string;
  ConnectedAppConsumerKey?: string;
  Country?: string;
  Description?: string;
  DurationDays?: number;
  Edition?: string;
  readonly ErrorCode?: string;
  readonly ExpirationDate?: string;
  Features?: string;
  HasSampleData?: boolean;
  readonly Id?: string;
  Language?: string;
  LoginUrl: string;
  readonly Name?: string;
  Namespace?: string;
  OrgName?: string;
  Release?: 'Current' | 'Previous' | 'Preview';
  readonly ScratchOrg?: string;
  SourceOrg?: string;
  readonly AuthCode: string;
  Snapshot?: string;
  readonly Status: 'New' | 'Creating' | 'Active' | 'Error' | 'Deleted';
  readonly SignupEmail: string;
  readonly SignupUsername: string;
  readonly SignupInstance: string;
  Username: string;
  settings?: Record<string, unknown>;
  objectSettings?: { [objectName: string]: ObjectSetting };
  orgPreferences?: {
    enabled: string[];
    disabled: string[];
  };
};

export type ObjectSetting = {
  sharingModel?: string;
  defaultRecordType?: string;
} & JsonMap;
