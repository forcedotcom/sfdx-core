/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { strict as assert } from 'node:assert';
import { JsonMap, isJsonMap } from '@salesforce/ts-types';
import { Messages } from '../messages';

Messages.importMessagesDirectory(__dirname);
const coreMessages = Messages.loadMessages('@salesforce/core', 'core');

/** will throw on any upperCase unless they are present in the allowList.  Recursively searches the object, returning valid keys */
export const ensureNoUppercaseKeys =
  (path: string) =>
  (allowList: string[] = []) =>
  (data: JsonMap): string[] => {
    const keys = getKeys(data, allowList);
    const upperCaseKeys = keys.filter((key) => /^[A-Z]/.test(key)).join(', ');
    assert.strictEqual(upperCaseKeys.length, 0, coreMessages.getMessage('invalidJsonCasing', [upperCaseKeys, path]));
    return keys;
  };

const getKeys = (data: JsonMap, allowList: string[]): string[] =>
  Object.entries(data)
    .filter(([k]) => !allowList.includes(k))
    .flatMap(([key, value]) => (isJsonMap(value) ? [key, ...getKeys(value, allowList)] : [key]));
