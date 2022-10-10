/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
