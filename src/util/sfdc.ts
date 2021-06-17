/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { findKey } from '@salesforce/kit';
import { AnyJson, asJsonMap, isJsonMap, JsonMap, Optional } from '@salesforce/ts-types';

export const sfdc = {
  /**
   * Converts an 18 character Salesforce ID to 15 characters.
   *
   * @param id The id to convert.
   */
  trimTo15: (id?: string): Optional<string> => {
    if (id && id.length && id.length > 15) {
      id = id.substring(0, 15);
    }
    return id;
  },

  /**
   * Tests whether an API version matches the format `i.0`.
   *
   * @param value The API version as a string.
   */
  validateApiVersion: (value: string): boolean => {
    return value == null || /^[1-9]\d\.0$/.test(value);
  },

  /**
   * Tests whether an email matches the format `me@my.org`
   *
   * @param value The email as a string.
   */
  validateEmail: (value: string): boolean => {
    return /^[^.][^@]*@[^.]+(\.[^.\s]+)+$/.test(value);
  },

  /**
   * Tests whether a Salesforce ID is in the correct format, a 15- or 18-character length string with only letters and numbers
   *
   * @param value The ID as a string.
   */
  validateSalesforceId: (value: string): boolean => {
    return /[a-zA-Z0-9]{18}|[a-zA-Z0-9]{15}/.test(value) && (value.length === 15 || value.length === 18);
  },

  /**
   * Tests whether a path is in the correct format; the value doesn't include the characters "[", "]", "?", "<", ">", "?", "|"
   *
   * @param value The path as a string.
   */
  validatePathDoesNotContainInvalidChars: (value: string): boolean => {
    // eslint-disable-next-line no-useless-escape
    return !/[\["\?<>\|\]]+/.test(value);
  },

  /**
   * Returns the first key within the object that has an upper case first letter.
   *
   * @param data The object in which to check key casing.
   * @param sectionBlocklist properties in the object to exclude from the search. e.g. a blocklist of `["a"]` and data of `{ "a": { "B" : "b"}}` would ignore `B` because it is in the object value under `a`.
   */
  findUpperCaseKeys: (data?: JsonMap, sectionBlocklist: string[] = []): Optional<string> => {
    let key: Optional<string>;
    findKey(data, (val: AnyJson, k: string) => {
      if (k.substr(0, 1) === k.substr(0, 1).toUpperCase()) {
        key = k;
      } else if (isJsonMap(val)) {
        if (sectionBlocklist.includes(k)) {
          return key;
        }
        key = sfdc.findUpperCaseKeys(asJsonMap(val));
      }
      return key;
    });
    return key;
  },

  /**
   * Tests whether a given string is an access token
   *
   * @param value
   */
  matchesAccessToken: (value: string): boolean => {
    return /^(00D\w{12,15})![.\w]*$/.test(value);
  },
};
