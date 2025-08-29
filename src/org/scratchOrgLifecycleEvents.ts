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
import { Lifecycle } from '../lifecycleEvents';
import { AuthFields } from './authInfo';
import { ScratchOrgInfo } from './scratchOrgTypes';

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
export type ScratchOrgLifecycleEvent = {
  stage: (typeof scratchOrgLifecycleStages)[number];
  scratchOrgInfo?: ScratchOrgInfo;
};

export const emit = async (event: ScratchOrgLifecycleEvent): Promise<void> =>
  Lifecycle.getInstance().emit(scratchOrgLifecycleEventName, event);

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
  await Lifecycle.getInstance().emit(
    'postorgcreate',
    Object.fromEntries(Object.entries(authFields).filter(([key]) => isHookField(key))) as PostOrgCreateHook
  );
};
