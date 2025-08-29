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

import { isPlainObject } from '@salesforce/ts-types';

/**
 * Use mapKeys to convert object keys to another format using the specified conversion function.
 *
 * E.g., to deep convert all object keys to camelCase:  mapKeys(myObj, _.camelCase, true)
 * to shallow convert object keys to lower case:  mapKeys(myObj, _.toLower)
 *
 * NOTE: This mutates the object passed in for conversion.
 *
 * @param target - {Object} The object to convert the keys
 * @param converter - {Function} The function that converts the object key
 * @param deep - {boolean} Whether to do a deep object key conversion
 * @return {Object} - the object with the converted keys
 */

export default function mapKeys<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  obj: T,
  converter: (key: string) => string,
  deep?: boolean
): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const target = Object.assign({}, obj);
  return Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Object.entries(target).map(([key, value]) => {
      const k = converter.call(null, key);
      if (deep) {
        let v = value;
        if (Array.isArray(value)) {
          v = value.map((v1) => {
            if (isPlainObject(v1)) {
              return mapKeys(v1, converter, deep);
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return v1;
          });
        } else if (isPlainObject(value)) {
          v = mapKeys(value, converter, deep);
        }
        return [k, v];
      }
      return [k, value];
    })
  );
}
