/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AnyJson } from '@salesforce/ts-types';

/**
 * Return type for the Streaming and Polling client.
 */
export interface StatusResult {
  /**
   * If the result of the streaming or polling client is expected to return a result
   */
  payload?: AnyJson;
  /**
   * Indicates to the streaming or polling client that the subscriber has what its needs. If `true` the client will end
   * the messaging exchanges with the endpoint.
   */
  completed: boolean;
}
