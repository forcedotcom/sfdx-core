#!/usr/bin/env node

/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { displayDefaultUsernames } from './';

(async () => {
  await displayDefaultUsernames();
})().catch(console.error);
