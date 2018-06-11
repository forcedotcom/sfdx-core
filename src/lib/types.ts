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

import { isString, isNumber, isBoolean, isPlainObject, isArray } from 'lodash';

export type AnyJson = boolean | number | string | undefined | JsonArray | JsonMap;
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
export function isJsonMap(json?: AnyJson): json is JsonMap {
    return isPlainObject(json);
}

/**
 * Tests whether any JSON value is an array.
 *
 * @param {AnyJson} json Any JSON value to test.
 * @returns {boolean}
 */
export function isJsonArray(json?: AnyJson): json is JsonArray {
    return isArray(json);
}

/**
 * Narrows an `AnyJson` value to a `string` if it is type compatible, or returns undefined otherwise.
 *
 * @param {AnyJson} value Any JSON value to test.
 * @returns {string}
 */
export function asString(value?: AnyJson): string | undefined {
    return isString(value) ? value : undefined;
}

/**
 * Narrows an `AnyJson` value to a `number` if it is type compatible, or returns undefined otherwise.
 *
 * @param {AnyJson} value Any JSON value to test.
 * @returns {number}
 */
export function asNumber(value?: AnyJson): number | undefined {
    return isNumber(value) ? value : undefined;
}

/**
 * Narrows an `AnyJson` value to a `boolean` if it is type compatible, or returns undefined otherwise.
 *
 * @param {AnyJson} value Any JSON value to test.
 * @returns {boolean}
 */
export function asBoolean(value?: AnyJson): boolean | undefined {
    return isBoolean(value) ? value : undefined;
}

/**
 * Narrows an `AnyJson` value to a `JsonMap` if it is type compatible, or returns undefined otherwise.
 *
 * @param {AnyJson} value Any JSON value to test.
 * @returns {JsonMap}
 */
export function asJsonMap(value?: AnyJson): JsonMap | undefined {
    return isJsonMap(value) ? value : undefined;
}

/**
 * Narrows an `AnyJson` value to a `JsonArray` if it is type compatible, or returns undefined otherwise.
 *
 * @param {AnyJson} value Any JSON value to test.
 * @returns {JsonArray}
 */
export function asJsonArray(value?: AnyJson): JsonArray | undefined {
    return isJsonArray(value) ? value : undefined;
}
