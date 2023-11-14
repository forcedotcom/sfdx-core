/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { performance } from 'node:perf_hooks';

export const nowBigInt = (): bigint => BigInt((performance.now() + performance.timeOrigin) * 1_000_000);
