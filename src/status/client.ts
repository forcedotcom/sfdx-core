/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Return type for the Streaming and Polling client.
 * @interface
 */
export interface StatusResult<T> {
    payload?: T;
    completed: boolean;
}
