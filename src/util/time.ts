/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/** using globalThis.performance instead importing from node:perf_hooks so it works in browser */
export const nowBigInt = (): bigint => BigInt((globalThis.performance.now() + performance.timeOrigin) * 1_000_000);
