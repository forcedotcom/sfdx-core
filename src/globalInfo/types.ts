/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { JsonMap } from '@salesforce/ts-types';

/**
 * @deprecated
 */
export enum SfInfoKeys {
  ORGS = 'orgs',
  TOKENS = 'tokens',
  ALIASES = 'aliases',
  SANDBOXES = 'sandboxes',
}

export type Timestamp = { timestamp: string };
export type SfEntry = JsonMap;

/**
 * @deprecated
 */
export type SfOrg = {
  username: string;
  orgId: string;
  instanceUrl: string;
  accessToken?: string;
} & SfEntry;

/**
 * @deprecated
 */
export interface SfOrgs {
  [key: string]: SfOrg & Timestamp;
}

export type SfToken = {
  token: string;
  url: string;
  user?: string;
} & SfEntry;

/**
 */
export type SfTokens = {
  [key: string]: SfToken & Timestamp;
};

/**
 * The key will always be the alias and the value will always be the username, e.g.
 * { "MyAlias": "user@salesforce.com" }
 */
export type SfAliases = {
  [alias: string]: string;
};

/**
 * @deprecated
 */
export type SfSandbox = {
  sandboxOrgId: string;
  prodOrgUsername: string;
  sandboxName?: string;
  sandboxUsername?: string;
  sandboxProcessId?: string;
  sandboxInfoId?: string;
} & Timestamp &
  SfEntry;

/**
 * The key will always be the sandbox username and the value will always be the
 * production org username
 * { "user@salesforce.com.mysandbox": "user@salesforce.com" }
 *
 * @deprecated
 */
export interface SfSandboxes {
  [sandboxOrgId: string]: SfSandbox;
}

/**
 * @deprecated
 */
export type SfInfo = {
  [SfInfoKeys.ORGS]: SfOrgs;
  [SfInfoKeys.TOKENS]: SfTokens;
  [SfInfoKeys.ALIASES]: SfAliases;
  [SfInfoKeys.SANDBOXES]: SfSandboxes;
};
