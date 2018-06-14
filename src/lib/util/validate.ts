/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * @module util
 */

import { isNil } from 'lodash';

/**
 * Tests whether an API version matches the format `i.0`.
 *
 * @param value The API version as a string.
 * @returns {boolean}
 */
export function validateApiVersion(value: string): boolean {
    return isNil(value) || /[1-9]\d\.0/.test(value);
}

/**
 * Tests whether an email matches the format `me@my.org`
 *
 * @param value The email as a string.
 * @returns {boolean}
 */
export function validateEmail(value: string): boolean {
    return /^[^.][^@]*@[^.]+(\.[^.\s]+)+$/.test(value);
}

/**
 * Tests whether a Salesforce ID is in the correct format, a 15- or 18-character length string with only letters and numbers
 * @param value The ID as a string.
 * @returns {boolean}
 */
export function validateSalesforceId(value: string): boolean {
    return /[a-zA-Z0-9]{18}|[a-zA-Z0-9]{15}/.test(value) && (value.length === 15 || value.length === 18);
}

/**
 * Tests whether a path is in the correct format; the value doesn't include the characters "[", "]", "?", "<", ">", "?", "|"
 * @param value The path as a string.
 * @returns {boolean}
 */
export function validatePathDoesNotContainInvalidChars(value: string): boolean {
    return !/[\[:"\?<>\|\]]+/.test(value);
}
