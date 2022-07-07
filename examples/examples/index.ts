/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as sfdxCore from '@salesforce/core';

console.log('\n*** Exported Sfdx-Core Modules ***');
Object.keys(sfdxCore)
  .sort()
  .forEach((module) => console.log(`sfdx-core: ${module}`));
