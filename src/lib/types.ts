/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * An object with arbitrary string-indexed values of a generic type.
 *
 * @typedef {Object<string, T>} Dictionary<T>
 */
/**
 * An object with arbitrary string-indexed values of any type.
 *
 * @typedef {Dictionary<any>} AnyDictionary
 */
/**
 * Any valid JSON value.
 *
 * @typedef {boolean|number|string|null|JsonArray|JsonMap} AnyJson
 */
/**
 * Any JSON-compatible object.
 *
 * @typedef {Dictionary<AnyJson>} JsonMap
 */
/**
 * Any JSON-compatible array.
 *
 * @typedef {Array<AnyJson>} JsonArray
 */

export interface Dictionary<T> { [key: string]: T; }
export type AnyDictionary = Dictionary<any>; // tslint:disable-line:no-any
export type AnyJson = boolean | number | string | null | JsonArray | JsonMap;
export interface JsonMap { [key: string]: AnyJson; }
export interface JsonArray extends Array<AnyJson> { }
