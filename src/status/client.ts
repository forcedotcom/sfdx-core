/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AnyJson } from '@salesforce/ts-types';

/**
 * Return type for the Streaming and Polling client.
 * @interface
 */
export interface StatusResult {
  payload?: AnyJson;
  completed: boolean;
}
