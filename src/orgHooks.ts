/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as Config from '@oclif/config';
import { Optional } from '@salesforce/ts-types';
import { AuthFields } from './authInfo';

type HookOpts<T> = {
  Command: Config.Command.Class;
  argv: string[];
  commandId: string;
  result: Optional<T>;
};

export type OrgCreateResult = Pick<
  AuthFields,
  | 'accessToken'
  | 'clientId'
  | 'created'
  | 'createdOrgInstance'
  | 'devHubUsername'
  | 'expirationDate'
  | 'instanceUrl'
  | 'loginUrl'
  | 'orgId'
  | 'username'
>;

type PostOrgCreateOpts = HookOpts<OrgCreateResult>;

/**
 * Extends OCLIF's Hooks interface to add types for hooks that run on sfdx org commands
 */
export interface OrgHooks extends Config.Hooks {
  postorgcreate: PostOrgCreateOpts;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OrgHook<T> = (this: Config.Hook.Context, options: T extends keyof Config.Hooks ? OrgHooks[T] : T) => any;

// eslint-disable-next-line no-redeclare
export declare namespace OrgHook {
  export type PostOrgCreate = Config.Hook<OrgHooks['postorgcreate']>;
}
