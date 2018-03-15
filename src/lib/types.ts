/**
 * Any valid JSON value.
 *
 * @typedef {boolean|number|string|null|JsonArray|JsonMap} AnyJson
 */
/**
 * Any JSON-compatible object.
 *
 * @typedef {object} JsonMap
 */
/**
 * Any JSON-compatible array.
 *
 * @typedef {Array<AnyJson>} JsonArray
 */

export type AnyJson = boolean | number | string | null | JsonArray | JsonMap;
export interface JsonMap { [key: string]: AnyJson; }
export interface JsonArray extends Array<AnyJson> { }
