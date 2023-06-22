/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Lifecycle } from '../lifecycleEvents';
import { AuthFields } from './authInfo';
import { ScratchOrgInfo } from './scratchOrgTypes';

const emitter = Lifecycle.getInstance();

export const scratchOrgLifecycleEventName = 'scratchOrgLifecycleEvent';
export const scratchOrgLifecycleStages = [
  'prepare request',
  'send request',
  'wait for org',
  'available',
  'authenticate',
  'deploy settings',
  'done',
] as const;
export interface ScratchOrgLifecycleEvent {
  stage: (typeof scratchOrgLifecycleStages)[number];
  scratchOrgInfo?: ScratchOrgInfo;
}

export const emit = async (event: ScratchOrgLifecycleEvent): Promise<void> =>
  emitter.emit(scratchOrgLifecycleEventName, event);

const postOrgCreateHookFields = [
  'accessToken',
  'clientId',
  'created',
  'createdOrgInstance',
  'devHubUsername',
  'expirationDate',
  'instanceUrl',
  'loginUrl',
  'orgId',
  'username',
] as const;

type PostOrgCreateHook = Pick<AuthFields, (typeof postOrgCreateHookFields)[number]>;

const isHookField = (key: string): key is (typeof postOrgCreateHookFields)[number] =>
  postOrgCreateHookFields.includes(key as (typeof postOrgCreateHookFields)[number]);

export const emitPostOrgCreate = async (authFields: AuthFields): Promise<void> => {
  await emitter.emit(
    'postorgcreate',
    Object.fromEntries(Object.entries(authFields).filter(([key]) => isHookField(key))) as PostOrgCreateHook
  );
};
