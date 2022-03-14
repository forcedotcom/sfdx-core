/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Lifecycle } from '../lifecycleEvents';
import { ScratchOrgInfo } from './scratchOrgTypes';

const emitter = Lifecycle.getInstance();

export const scratchOrgLifecycleEventName = 'scratchOrgLifecycleEvent';

export interface ScratchOrgLifecycleEvent {
  stage: 'building request' | 'requested' | 'pending' | 'ready' | 'authing' | 'deploying';
  scratchOrgInfo?: ScratchOrgInfo;
}

export const emit = async (event: ScratchOrgLifecycleEvent) => {
  emitter.emit(scratchOrgLifecycleEventName, event);
};
