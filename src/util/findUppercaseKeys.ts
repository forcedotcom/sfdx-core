/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { JsonMap, Optional, isJsonMap, asJsonMap, AnyJson } from '@salesforce/ts-types';
import { findKey } from '@salesforce/kit';

export const findUpperCaseKeys = (data?: JsonMap, sectionBlocklist: string[] = []): Optional<string> => {
  let key: Optional<string>;
  findKey(data, (val: AnyJson, k: string) => {
    if (/^[A-Z]/.test(k)) {
      key = k;
    } else if (isJsonMap(val)) {
      if (sectionBlocklist.includes(k)) {
        return key;
      }
      key = findUpperCaseKeys(asJsonMap(val));
    }
    return key;
  });
  return key;
};
