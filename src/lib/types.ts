/**
 * Any valid JSON value.
 *
 * @typedef {boolean|number|string|null|JsonArray|JsonMap}
 */
export type AnyJson = boolean | number | string | null | JsonArray | JsonMap;

/**
 * Any JSON-compatible object.
 */
export interface JsonMap {
    [key: string]: AnyJson;
}

/**
 * Any JSON-compatible array.
 */
export interface JsonArray extends Array<AnyJson> {
}
