/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// docs: https://github.com/moxystudio/node-proper-lockfile

export const lockOptions = { stale: 10_000 };
export const lockRetryOptions = {
  ...lockOptions,
  retries: { retries: 10, maxTimeout: 1_000, factor: 2 },
};
