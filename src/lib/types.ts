/**
 * Any valid JSON value.
 *
 * @typedef {boolean|number|string|null|JsonArray|JsonMap} AnyJson
 */
/**
 * Any JSON-compatible object.
 *
 * @typedef {Object<string, AnyJson>} JsonMap
 */
/**
 * Any JSON-compatible array.
 *
 * @typedef {Array<AnyJson>} JsonArray
 */

/**
 * An object with arbitrary string-indexed values of a generic type.
 *
 * @typedef {Object<string, T>} Dictionary<T>
 */
/**
 * An object with arbitrary string-indexed values of any type.
 *
 * @typedef {Dictionary<any>} Dictionary<any>
 */

import { isPlainObject, isArray } from 'lodash';

export type AnyJson = boolean | number | string | null | JsonArray | JsonMap;
export interface JsonMap { [key: string]: AnyJson; }
export interface JsonArray extends Array<AnyJson> { }

export interface Dictionary<T> { [key: string]: T; }
export type AnyDictionary = Dictionary<any>; // tslint:disable-line:no-any

/**
 * Tests whether any JSON value is an object.
 *
 * @param {AnyJson} json Any JSON value to test.
 * @returns {boolean}
 */
export function isJsonMap(json: AnyJson): json is JsonMap {
    return isPlainObject(json);
}

/**
 * Tests whether any JSON value is an array.
 *
 * @param {AnyJson} json Any JSON value to test.
 * @returns {boolean}
 */
export function isJsonArray(json: AnyJson): json is JsonArray {
    return isArray(json);
}
