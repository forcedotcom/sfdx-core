/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
