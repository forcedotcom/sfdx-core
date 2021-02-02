'use strict';

var _commonjsHelpers = require('./_commonjsHelpers-49936489.js');

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Tests whether an `unknown` value is a `string`.
 *
 * @param value The value to test.
 */
function isString(value) {
  return typeof value === 'string';
}
var isString_1 = isString;
/**
 * Tests whether an `unknown` value is a `number`.
 *
 * @param value The value to test.
 */
function isNumber(value) {
  return typeof value === 'number';
}
var isNumber_1 = isNumber;
/**
 * Tests whether an `unknown` value is a `boolean`.
 *
 * @param value The value to test.
 */
function isBoolean(value) {
  return typeof value === 'boolean';
}
var isBoolean_1 = isBoolean;
/**
 * Tests whether an `unknown` value is an `Object` subtype (e.g., arrays, functions, objects, regexes,
 * new Number(0), new String(''), and new Boolean(true)). Tests that wish to distinguish objects that
 * were created from literals or that otherwise were not created via a non-`Object` constructor and do
 * not have a prototype chain should instead use {@link isPlainObject}.
 *
 * @param value The value to test.
 */
function isObject(value) {
  return value != null && (typeof value === 'object' || typeof value === 'function');
}
var isObject_1 = isObject;
/**
 * Tests whether or not an `unknown` value is a plain JavaScript object. That is, if it is an object created
 * by the Object constructor or one with a null `prototype`.
 *
 * @param value The value to test.
 */
function isPlainObject(value) {
  const isObjectObject = o => {
    return isObject(o) && Object.prototype.toString.call(o) === '[object Object]';
  };
  if (!isObjectObject(value)) return false;
  const ctor = value.constructor;
  if (!isFunction(ctor)) return false;
  if (!isObjectObject(ctor.prototype)) return false;
  if (!ctor.prototype.hasOwnProperty('isPrototypeOf')) return false;
  return true;
}
var isPlainObject_1 = isPlainObject;
/**
 * Tests whether an `unknown` value is a `function`.
 *
 * @param value The value to test.
 */
function isInstance(value, ctor) {
  return value instanceof ctor;
}
var isInstance_1 = isInstance;
/**
 * Tests whether an `unknown` value is a class constructor that is either equal to or extends another class
 * constructor.
 *
 * @param value The value to test.
 * @param cls The class to test against.
 */
function isClassAssignableTo(value, cls) {
  // avoid circular dependency with has.ts
  const has = (v, k) => isObject(v) && k in v;
  return value === cls || (has(value, 'prototype') && value.prototype instanceof cls);
}
var isClassAssignableTo_1 = isClassAssignableTo;
/**
 * Tests whether an `unknown` value is an `Array`.
 *
 * @param value The value to test.
 */
function isArray(value) {
  return Array.isArray(value);
}
var isArray_1 = isArray;
/**
 * Tests whether an `unknown` value conforms to {@link AnyArrayLike}.
 *
 * @param value The value to test.
 */
function isArrayLike(value) {
  // avoid circular dependency with has.ts
  const hasLength = v => isObject(v) && 'length' in v;
  return !isFunction(value) && (isString(value) || hasLength(value));
}
var isArrayLike_1 = isArrayLike;
/**
 * Tests whether an `unknown` value is a `function`.
 *
 * @param value The value to test.
 */
function isFunction(value) {
  return typeof value === 'function';
}
var isFunction_1 = isFunction;
/**
 * Tests whether `unknown` value is a valid JSON type. Note that objects and arrays are only checked using a shallow
 * test. To be sure that a given value is JSON-compatible at runtime, see {@link toAnyJson}.
 *
 * @param value The value to test.
 */
function isAnyJson(value) {
  return (
    value === null || isString(value) || isNumber(value) || isBoolean(value) || isPlainObject(value) || isArray(value)
  );
}
var isAnyJson_1 = isAnyJson;
/**
 * Tests whether an `AnyJson` value is an object.
 *
 * @param value The value to test.
 */
function isJsonMap(value) {
  return isPlainObject(value);
}
var isJsonMap_1 = isJsonMap;
/**
 * Tests whether an `AnyJson` value is an array.
 *
 * @param value The value to test.
 */
function isJsonArray(value) {
  return isArray(value);
}
var isJsonArray_1 = isJsonArray;
/**
 * Tests whether or not a `key` string is a key of the given object type `T`.
 *
 * @param obj The target object to check the key in.
 * @param key The string to test as a key of the target object.
 */
function isKeyOf(obj, key) {
  return Object.keys(obj).includes(key);
}
var isKeyOf_1 = isKeyOf;

var is = /*#__PURE__*/ Object.defineProperty(
  {
    isString: isString_1,
    isNumber: isNumber_1,
    isBoolean: isBoolean_1,
    isObject: isObject_1,
    isPlainObject: isPlainObject_1,
    isInstance: isInstance_1,
    isClassAssignableTo: isClassAssignableTo_1,
    isArray: isArray_1,
    isArrayLike: isArrayLike_1,
    isFunction: isFunction_1,
    isAnyJson: isAnyJson_1,
    isJsonMap: isJsonMap_1,
    isJsonArray: isJsonArray_1,
    isKeyOf: isKeyOf_1
  },
  '__esModule',
  { value: true }
);

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// underlying function
function asString(value, defaultValue) {
  return is.isString(value) ? value : defaultValue;
}
var asString_1 = asString;
// underlying function
function asNumber(value, defaultValue) {
  return is.isNumber(value) ? value : defaultValue;
}
var asNumber_1 = asNumber;
// underlying function
function asBoolean(value, defaultValue) {
  return is.isBoolean(value) ? value : defaultValue;
}
var asBoolean_1 = asBoolean;
// underlying function
function asObject(value, defaultValue) {
  return is.isObject(value) ? value : defaultValue;
}
var asObject_1 = asObject;
// underlying function
function asPlainObject(value, defaultValue) {
  return is.isPlainObject(value) ? value : defaultValue;
}
var asPlainObject_1 = asPlainObject;
// underlying function
function asInstance(value, ctor, defaultValue) {
  return is.isInstance(value, ctor) ? value : defaultValue;
}
var asInstance_1 = asInstance;
// underlying function
function asArray(value, defaultValue) {
  return is.isArray(value) ? value : defaultValue;
}
var asArray_1 = asArray;
// underlying function
function asFunction(value, defaultValue) {
  return is.isFunction(value) ? value : defaultValue;
}
var asFunction_1 = asFunction;
// underlying function
function asJsonMap(value, defaultValue) {
  return is.isJsonMap(value) ? value : defaultValue;
}
var asJsonMap_1 = asJsonMap;
// underlying function
function asJsonArray(value, defaultValue) {
  return is.isJsonArray(value) ? value : defaultValue;
}
var asJsonArray_1 = asJsonArray;

var as = /*#__PURE__*/ Object.defineProperty(
  {
    asString: asString_1,
    asNumber: asNumber_1,
    asBoolean: asBoolean_1,
    asObject: asObject_1,
    asPlainObject: asPlainObject_1,
    asInstance: asInstance_1,
    asArray: asArray_1,
    asFunction: asFunction_1,
    asJsonMap: asJsonMap_1,
    asJsonArray: asJsonArray_1
  },
  '__esModule',
  { value: true }
);

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// underlying function
function coerceAnyJson(value, defaultValue) {
  return is.isAnyJson(value) ? value : defaultValue;
}
var coerceAnyJson_1 = coerceAnyJson;
// underlying function
function coerceJsonMap(value, defaultValue) {
  return as.asJsonMap(coerceAnyJson(value)) || defaultValue;
}
var coerceJsonMap_1 = coerceJsonMap;
// underlying method
function coerceJsonArray(value, defaultValue) {
  return as.asJsonArray(coerceAnyJson(value)) || defaultValue;
}
var coerceJsonArray_1 = coerceJsonArray;

var coerce = /*#__PURE__*/ Object.defineProperty(
  {
    coerceAnyJson: coerceAnyJson_1,
    coerceJsonMap: coerceJsonMap_1,
    coerceJsonArray: coerceJsonArray_1
  },
  '__esModule',
  { value: true }
);

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * A minimal `NamedError` implementation not intended for widespread use -- just enough to support this library's needs.
 * For a complete `NamedError` solution, see [@salesforce/kit]{@link https://preview.npmjs.com/package/@salesforce/kit}.
 */
class NamedError extends Error {
  constructor(name, message) {
    super(message);
    this.name = name;
  }
}
var NamedError_1 = NamedError;
/**
 * Indicates an unexpected type was encountered during a type-narrowing operation.
 */
class UnexpectedValueTypeError extends NamedError {
  constructor(message) {
    super('UnexpectedValueTypeError', message);
  }
}
var UnexpectedValueTypeError_1 = UnexpectedValueTypeError;
/**
 * Indicates an error while performing a JSON clone operation.
 */
class JsonCloneError extends NamedError {
  constructor(cause) {
    super('JsonCloneError', cause.message);
  }
}
var JsonCloneError_1 = JsonCloneError;

var errors = /*#__PURE__*/ Object.defineProperty(
  {
    NamedError: NamedError_1,
    UnexpectedValueTypeError: UnexpectedValueTypeError_1,
    JsonCloneError: JsonCloneError_1
  },
  '__esModule',
  { value: true }
);

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// underlying function
function toAnyJson(value, defaultValue) {
  try {
    return value !== undefined ? JSON.parse(JSON.stringify(value)) : defaultValue;
  } catch (err) {
    throw new errors.JsonCloneError(err);
  }
}
var toAnyJson_1 = toAnyJson;
// underlying function
function toJsonMap(value, defaultValue) {
  return as.asJsonMap(toAnyJson(value)) || defaultValue;
}
var toJsonMap_1 = toJsonMap;
// underlying method
function toJsonArray(value, defaultValue) {
  return as.asJsonArray(toAnyJson(value)) || defaultValue;
}
var toJsonArray_1 = toJsonArray;

var to = /*#__PURE__*/ Object.defineProperty(
  {
    toAnyJson: toAnyJson_1,
    toJsonMap: toJsonMap_1,
    toJsonArray: toJsonArray_1
  },
  '__esModule',
  { value: true }
);

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Narrows a type `Nullable<T>` to a `T` or raises an error.
 *
 * @param value The value to test.
 * @param message The error message to use if `value` is `undefined` or `null`.
 * @throws {@link UnexpectedValueTypeError} If the value was undefined.
 */
function ensure(value, message) {
  if (value == null) {
    throw new errors.UnexpectedValueTypeError(message || 'Value is undefined');
  }
  return value;
}
var ensure_2 = ensure;
/**
 * Narrows an `unknown` value to a `string` if it is type-compatible, or raises an error otherwise.
 *
 * @param value The value to test.
 * @param message The error message to use if `value` is not type-compatible.
 * @throws {@link UnexpectedValueTypeError} If the value was undefined.
 */
function ensureString(value, message) {
  return ensure(as.asString(value), message || 'Value is not an string');
}
var ensureString_1 = ensureString;
/**
 * Narrows an `unknown` value to a `number` if it is type-compatible, or raises an error otherwise.
 *
 * @param value The value to test.
 * @param message The error message to use if `value` is not type-compatible.
 * @throws {@link UnexpectedValueTypeError} If the value was undefined.
 */
function ensureNumber(value, message) {
  return ensure(as.asNumber(value), message || 'Value is not an number');
}
var ensureNumber_1 = ensureNumber;
/**
 * Narrows an `unknown` value to a `boolean` if it is type-compatible, or raises an error otherwise.
 *
 * @param value The value to test.
 * @param message The error message to use if `value` is not type-compatible.
 * @throws {@link UnexpectedValueTypeError} If the value was undefined.
 */
function ensureBoolean(value, message) {
  return ensure(as.asBoolean(value), message || 'Value is not an boolean');
}
var ensureBoolean_1 = ensureBoolean;
/**
 * Narrows an `unknown` value to an `object` if it is type-compatible, or raises an error otherwise.
 *
 * @param value The value to test.
 * @param message The error message to use if `value` is not type-compatible.
 * @throws {@link UnexpectedValueTypeError} If the value was undefined.
 */
function ensureObject(value, message) {
  return ensure(as.asObject(value), message || 'Value is not an object');
}
var ensureObject_1 = ensureObject;
/**
 * Narrows an `unknown` value to an `object` if it is type-compatible and tests positively with {@link isPlainObject},
 * or raises an error otherwise.
 *
 * @param value The value to test.
 * @param message The error message to use if `value` is not type-compatible.
 * @throws {@link UnexpectedValueTypeError} If the value was undefined.
 */
function ensurePlainObject(value, message) {
  return ensure(as.asObject(value), message || 'Value is not an object');
}
var ensurePlainObject_1 = ensurePlainObject;
/**
 * Narrows an `unknown` value to instance of constructor type `T` if it is type-compatible, or raises an error
 * otherwise.
 *
 * @param value The value to test.
 * @param message The error message to use if `value` is not type-compatible.
 * @throws {@link UnexpectedValueTypeError} If the value was undefined.
 */
function ensureInstance(value, ctor, message) {
  return ensure(as.asInstance(value, ctor), message || `Value is not an instance of ${ctor.name}`);
}
var ensureInstance_1 = ensureInstance;
/**
 * Narrows an `unknown` value to an `Array` if it is type-compatible, or raises an error otherwise.
 *
 * @param value The value to test.
 * @param message The error message to use if `value` is not type-compatible.
 * @throws {@link UnexpectedValueTypeError} If the value was undefined.
 */
function ensureArray(value, message) {
  return ensure(as.asArray(value), message || 'Value is not an array');
}
var ensureArray_1 = ensureArray;
/**
 * Narrows an `unknown` value to an `AnyFunction` if it is type-compatible, or raises an error otherwise.
 *
 * @param value The value to test.
 * @param message The error message to use if `value` is not type-compatible.
 * @throws {@link UnexpectedValueTypeError} If the value was undefined.
 */
function ensureFunction(value, message) {
  return ensure(as.asFunction(value), message || 'Value is not a function');
}
var ensureFunction_1 = ensureFunction;
/**
 * Narrows an `unknown` value to an `AnyJson` if it is type-compatible, or returns `undefined` otherwise.
 *
 * See also caveats noted in {@link isAnyJson}.
 *
 * @param value The value to test.
 * @param message The error message to use if `value` is not type-compatible.
 * @throws {@link UnexpectedValueTypeError} If the value was not a JSON value type.
 */
function ensureAnyJson(value, message) {
  return ensure(to.toAnyJson(value), message || 'Value is not a JSON-compatible value type');
}
var ensureAnyJson_1 = ensureAnyJson;
/**
 * Narrows an `AnyJson` value to a `JsonMap` if it is type-compatible, or raises an error otherwise.
 *
 * @param value The value to test.
 * @param message The error message to use if `value` is not type-compatible.
 * @throws {@link UnexpectedValueTypeError} If the value was undefined.
 */
function ensureJsonMap(value, message) {
  return ensure(as.asJsonMap(value), message || 'Value is not a JsonMap');
}
var ensureJsonMap_1 = ensureJsonMap;
/**
 * Narrows an `AnyJson` value to a `JsonArray` if it is type-compatible, or raises an error otherwise.
 *
 * @param value The value to test.
 * @param message The error message to use if `value` is not type-compatible.
 * @throws {@link UnexpectedValueTypeError} If the value was undefined.
 */
function ensureJsonArray(value, message) {
  return ensure(as.asJsonArray(value), message || 'Value is not JsonArray');
}
var ensureJsonArray_1 = ensureJsonArray;

var ensure_1 = /*#__PURE__*/ Object.defineProperty(
  {
    ensure: ensure_2,
    ensureString: ensureString_1,
    ensureNumber: ensureNumber_1,
    ensureBoolean: ensureBoolean_1,
    ensureObject: ensureObject_1,
    ensurePlainObject: ensurePlainObject_1,
    ensureInstance: ensureInstance_1,
    ensureArray: ensureArray_1,
    ensureFunction: ensureFunction_1,
    ensureAnyJson: ensureAnyJson_1,
    ensureJsonMap: ensureJsonMap_1,
    ensureJsonArray: ensureJsonArray_1
  },
  '__esModule',
  { value: true }
);

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Tests whether a value of type `T` contains one or more property `keys`. If so, the type of the tested value is
 * narrowed to reflect the existence of those keys for convenient access in the same scope. Returns false if the
 * property key does not exist on the target type, which must be an object. Returns true if the property key exists,
 * even if the associated value is `undefined` or `null`.
 *
 * ```
 * // type of obj -> unknown
 * if (has(obj, 'name')) {
 *   // type of obj -> { name: unknown }
 *   if (has(obj, 'data')) {
 *     // type of obj -> { name: unknown } & { data: unknown }
 *   } else if (has(obj, ['error', 'status'])) {
 *     // type of obj -> { name: unknown } & { error: unknown, status: unknown }
 *   }
 * }
 * ```
 *
 * @param value The value to test.
 * @param keys One or more `string` keys to check for existence.
 */
function has(value, keys) {
  return is.isObject(value) && (is.isArray(keys) ? keys.every(k => k in value) : keys in value);
}
var has_2 = has;
/**
 * Tests whether a value of type `T` contains a property `key` of type `string`. If so, the type of the tested value is
 * narrowed to reflect the existence of that key for convenient access in the same scope. Returns `false` if the
 * property key does not exist on the object or the value stored by that key is not of type `string`.
 *
 * ```
 * // type of obj -> unknown
 * if (hasString(obj, 'name')) {
 *   // type of obj -> { name: string }
 *   if (hasString(obj, 'message')) {
 *     // type of obj -> { name: string } & { message: string }
 *   }
 * }
 * ```
 *
 * @param value The value to test.
 * @param keys A `string` key to check for existence.
 */
function hasString(value, key) {
  return has(value, key) && is.isString(value[key]);
}
var hasString_1 = hasString;
/**
 * Tests whether a value of type `T` contains a property `key` of type `number`. If so, the type of the tested value is
 * narrowed to reflect the existence of that key for convenient access in the same scope. Returns `false` if the
 * property key does not exist on the object or the value stored by that key is not of type `number`.
 *
 * ```
 * // type of obj -> unknown
 * if (hasNumber(obj, 'offset')) {
 *   // type of obj -> { offset: number }
 *   if (hasNumber(obj, 'page') && hasArray(obj, 'items')) {
 *     // type of obj -> { offset: number } & { page: number } & { items: unknown[] }
 *   }
 * }
 * ```
 *
 * @param value The value to test.
 * @param keys A `number` key to check for existence.
 */
function hasNumber(value, key) {
  return has(value, key) && is.isNumber(value[key]);
}
var hasNumber_1 = hasNumber;
/**
 * Tests whether a value of type `T` contains a property `key` of type `boolean`. If so, the type of the tested value is
 * narrowed to reflect the existence of that key for convenient access in the same scope. Returns `false` if the
 * property key does not exist on the object or the value stored by that key is not of type `boolean`.
 *
 * ```
 * // type of obj -> unknown
 * if (hasBoolean(obj, 'enabled')) {
 *   // type of obj -> { enabled: boolean }
 *   if (hasBoolean(obj, 'hidden')) {
 *     // type of obj -> { enabled: boolean } & { hidden: boolean }
 *   }
 * }
 * ```
 *
 * @param value The value to test.
 * @param keys A `boolean` key to check for existence.
 */
function hasBoolean(value, key) {
  return has(value, key) && is.isBoolean(value[key]);
}
var hasBoolean_1 = hasBoolean;
/**
 * Tests whether a value of type `T` contains a property `key` of type `object`. If so, the type of the tested value is
 * narrowed to reflect the existence of that key for convenient access in the same scope. Returns `false` if the
 * property key does not exist on the object or the value stored by that key is not of type `object`.
 *
 * ```
 * // type of obj -> unknown
 * if (hasNumber(obj, 'status')) {
 *   // type of obj -> { status: number }
 *   if (hasObject(obj, 'data')) {
 *     // type of obj -> { status: number } & { data: object }
 *   } else if (hasString('error')) {
 *     // type of obj -> { status: number } & { error: string }
 *   }
 * }
 * ```
 *
 * @param value The value to test.
 * @param keys An `object` key to check for existence.
 */
function hasObject(value, key) {
  return has(value, key) && is.isObject(value[key]);
}
var hasObject_1 = hasObject;
/**
 * Tests whether a value of type `T` contains a property `key` whose type tests positively when tested with
 * {@link isPlainObject}. If so, the type of the tested value is narrowed to reflect the existence of that key for
 * convenient access in the same scope. Returns `false` if the property key does not exist on the object or the value
 * stored by that key is not of type `object`.
 *
 * ```
 * // type of obj -> unknown
 * if (hasNumber(obj, 'status')) {
 *   // type of obj -> { status: number }
 *   if (hasPlainObject(obj, 'data')) {
 *     // type of obj -> { status: number } & { data: object }
 *   } else if (hasString('error')) {
 *     // type of obj -> { status: number } & { error: string }
 *   }
 * }
 * ```
 *
 * @param value The value to test.
 * @param keys A "plain" `object` key to check for existence.
 */
function hasPlainObject(value, key) {
  return has(value, key) && is.isPlainObject(value[key]);
}
var hasPlainObject_1 = hasPlainObject;
/**
 * Tests whether a value of type `T` contains a property `key` whose type tests positively when tested with
 * {@link isInstance} when compared with the given constructor type `C`. If so, the type of the tested value is
 * narrowed to reflect the existence of that key for convenient access in the same scope. Returns `false` if the
 * property key does not exist on the object or the value stored by that key is not an instance of `C`.
 *
 * ```
 * class ServerResponse { ... }
 * // type of obj -> unknown
 * if (hasNumber(obj, 'status')) {
 *   // type of obj -> { status: number }
 *   if (hasInstance(obj, 'data', ServerResponse)) {
 *     // type of obj -> { status: number } & { data: ServerResponse }
 *   } else if (hasString('error')) {
 *     // type of obj -> { status: number } & { error: string }
 *   }
 * }
 * ```
 *
 * @param value The value to test.
 * @param keys An instance of type `C` key to check for existence.
 */
function hasInstance(value, key, ctor) {
  return has(value, key) && value[key] instanceof ctor;
}
var hasInstance_1 = hasInstance;
/**
 * Tests whether a value of type `T` contains a property `key` of type {@link AnyArray}. If so, the type of the tested
 * value is narrowed to reflect the existence of that key for convenient access in the same scope. Returns `false` if
 * the property key does not exist on the object or the value stored by that key is not of type {@link AnyArray}.
 *
 * ```
 * // type of obj -> unknown
 * if (hasNumber(obj, 'offset')) {
 *   // type of obj -> { offset: number }
 *   if (hasNumber(obj, 'page') && hasArray(obj, 'items')) {
 *     // type of obj -> { offset: number } & { page: number } & { items: AnyArray }
 *   }
 * }
 * ```
 *
 * @param value The value to test.
 * @param keys An `AnyArray` key to check for existence.
 */
function hasArray(value, key) {
  return has(value, key) && is.isArray(value[key]);
}
var hasArray_1 = hasArray;
/**
 * Tests whether a value of type `T` contains a property `key` of type {@link AnyFunction}. If so, the type of the
 * tested value is narrowed to reflect the existence of that key for convenient access in the same scope. Returns
 * `false` if the property key does not exist on the object or the value stored by that key is not of type
 * {@link AnyFunction}.
 *
 * ```
 * // type of obj -> unknown
 * if (hasFunction(obj, 'callback')) {
 *   // type of obj -> { callback: AnyFunction }
 *   obj.callback(response);
 * }
 * ```
 *
 * @param value The value to test.
 * @param keys An `AnyFunction` key to check for existence.
 */
function hasFunction(value, key) {
  return has(value, key) && is.isFunction(value[key]);
}
var hasFunction_1 = hasFunction;
/**
 * Tests whether a value of type `T` contains a property `key` of type {@link AnyJson}, _using a shallow test for
 * `AnyJson` compatibility_ (see {@link isAnyJson} for more information). If so, the type of the
 * tested value is narrowed to reflect the existence of that key for convenient access in the same scope. Returns
 * `false` if the property key does not exist on the object or the value stored by that key is not of type
 * {@link AnyJson}.
 *
 * ```
 * // type of obj -> unknown
 * if (hasAnyJson(obj, 'body')) {
 *   // type of obj -> { body: AnyJson }
 * }
 * ```
 *
 * @param value The value to test.
 * @param keys An `AnyJson` key to check for existence.
 */
function hasAnyJson(value, key) {
  return has(value, key) && is.isAnyJson(value[key]);
}
var hasAnyJson_1 = hasAnyJson;
/**
 * Tests whether a value of type `T extends AnyJson` contains a property `key` of type {@link JsonMap}. If so, the type
 * of the tested value is narrowed to reflect the existence of that key for convenient access in the same scope. Returns
 * `false` if the property key does not exist on the object or the value stored by that key is not of type
 * {@link JsonMap}.
 *
 * ```
 * // type of obj -> unknown
 * if (hasJsonMap(obj, 'body')) {
 *   // type of obj -> { body: JsonMap }
 * }
 * ```
 *
 * @param value The value to test.
 * @param keys A `JsonMap` key to check for existence.
 */
function hasJsonMap(value, key) {
  return hasAnyJson(value, key) && is.isJsonMap(value[key]);
}
var hasJsonMap_1 = hasJsonMap;
/**
 * Tests whether a value of type `T extends AnyJson` contains a property `key` of type {@link JsonArray}. If so, the
 * type of the tested value is narrowed to reflect the existence of that key for convenient access in the same scope.
 * Returns `false` if the property key does not exist on the object or the value stored by that key is not of type
 * {@link JsonArray}.
 *
 * ```
 * // type of obj -> unknown
 * if (hasJsonArray(obj, 'body')) {
 *   // type of obj -> { body: JsonArray }
 * }
 * ```
 *
 * @param value The value to test.
 * @param keys A `JsonArray` key to check for existence.
 */
function hasJsonArray(value, key) {
  return hasAnyJson(value, key) && is.isJsonArray(value[key]);
}
var hasJsonArray_1 = hasJsonArray;

var has_1 = /*#__PURE__*/ Object.defineProperty(
  {
    has: has_2,
    hasString: hasString_1,
    hasNumber: hasNumber_1,
    hasBoolean: hasBoolean_1,
    hasObject: hasObject_1,
    hasPlainObject: hasPlainObject_1,
    hasInstance: hasInstance_1,
    hasArray: hasArray_1,
    hasFunction: hasFunction_1,
    hasAnyJson: hasAnyJson_1,
    hasJsonMap: hasJsonMap_1,
    hasJsonArray: hasJsonArray_1
  },
  '__esModule',
  { value: true }
);

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Returns the given `value` if not either `undefined` or `null`, or the given `defaultValue` otherwise if defined.
 * Returns `null` if the value is `null` and `defaultValue` is `undefined`.
 *
 * @param value The value to test.
 * @param defaultValue The default to return if `value` was not defined.
 * @ignore
 */
function valueOrDefault(value, defaultValue) {
  return value != null || defaultValue === undefined ? value : defaultValue;
}
var valueOrDefault_1 = valueOrDefault;

var internal = /*#__PURE__*/ Object.defineProperty(
  {
    valueOrDefault: valueOrDefault_1
  },
  '__esModule',
  { value: true }
);

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Given a deep-search query path, returns an object property or array value of an object or array.
 *
 * ```
 * const obj = { foo: { bar: ['baz'] } };
 * const value = get(obj, 'foo.bar[0]');
 * // type of value -> unknown; value === 'baz'
 *
 * const value = get(obj, 'foo.bar.nothing', 'default');
 * // type of value -> unknown; value === 'default'
 *
 * const value = get(obj, 'foo["bar"][0]');
 * // type of value -> unknown; value === 'baz'
 *
 * const arr = [obj];
 * const value = get(arr, '[0].foo.bar[0]');
 * // type of value -> unknown; value === 'baz'
 * ```
 *
 * @param from Any value to query.
 * @param path The query path.
 * @param defaultValue The default to return if the query result was not defined.
 */
function get(from, path, defaultValue) {
  return internal.valueOrDefault(
    path
      .split(/[\.\[\]\'\"]/)
      .filter(p => !!p)
      .reduce((r, p) => (has_1.has(r, p) ? r[p] : undefined), from),
    defaultValue
  );
}
var get_2 = get;
// underlying function
function getString(from, path, defaultValue) {
  return internal.valueOrDefault(as.asString(get(from, path)), defaultValue);
}
var getString_1 = getString;
// underlying function
function getNumber(from, path, defaultValue) {
  return internal.valueOrDefault(as.asNumber(get(from, path)), defaultValue);
}
var getNumber_1 = getNumber;
// underlying function
function getBoolean(from, path, defaultValue) {
  return internal.valueOrDefault(as.asBoolean(get(from, path)), defaultValue);
}
var getBoolean_1 = getBoolean;
// underlying function
function getObject(from, path, defaultValue) {
  return internal.valueOrDefault(as.asObject(get(from, path)), defaultValue);
}
var getObject_1 = getObject;
// underlying function
function getPlainObject(from, path, defaultValue) {
  return internal.valueOrDefault(as.asPlainObject(get(from, path)), defaultValue);
}
var getPlainObject_1 = getPlainObject;
// underlying function
function getInstance(from, path, ctor, defaultValue) {
  return internal.valueOrDefault(as.asInstance(get(from, path), ctor), defaultValue);
}
var getInstance_1 = getInstance;
// underlying function
function getArray(from, path, defaultValue) {
  return internal.valueOrDefault(as.asArray(get(from, path)), defaultValue);
}
var getArray_1 = getArray;
// underlying function
function getFunction(from, path, defaultValue) {
  return internal.valueOrDefault(as.asFunction(get(from, path)), defaultValue);
}
var getFunction_1 = getFunction;
// underlying function
function getAnyJson(from, path, defaultValue) {
  return internal.valueOrDefault(coerce.coerceAnyJson(get(from, path)), defaultValue);
}
var getAnyJson_1 = getAnyJson;
// underlying function
function getJsonMap(from, path, defaultValue) {
  return internal.valueOrDefault(as.asJsonMap(getAnyJson(from, path)), defaultValue);
}
var getJsonMap_1 = getJsonMap;
// underlying function
function getJsonArray(from, path, defaultValue) {
  return internal.valueOrDefault(as.asJsonArray(getAnyJson(from, path)), defaultValue);
}
var getJsonArray_1 = getJsonArray;

var get_1 = /*#__PURE__*/ Object.defineProperty(
  {
    get: get_2,
    getString: getString_1,
    getNumber: getNumber_1,
    getBoolean: getBoolean_1,
    getObject: getObject_1,
    getPlainObject: getPlainObject_1,
    getInstance: getInstance_1,
    getArray: getArray_1,
    getFunction: getFunction_1,
    getAnyJson: getAnyJson_1,
    getJsonMap: getJsonMap_1,
    getJsonArray: getJsonArray_1
  },
  '__esModule',
  { value: true }
);

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Returns the keys of an object of type `T`. This is like `Object.keys` except the return type
 * captures the known keys of `T`.
 *
 * Note that it is the responsibility of the caller to use this wisely -- there are cases where
 * the runtime set of keys returned may be broader than the type checked set at compile time,
 * so there's potential for this to be abused in ways that are not inherently type safe. For
 * example, given base class `Animal`, subclass `Fish`, and `const animal: Animal = new Fish();`
 * then `keysOf(animal)` will not type-check the entire set of keys of the object `animal` since
 * it is actually an instance of type `Fish`, which has an extended property set.
 *
 * In general, it should be both convenient and type-safe to use this when enumerating the keys
 * of simple data objects with known properties.
 *
 * ```
 * interface Point { x: number; y: number; }
 * const point: Point = { x: 1, y: 2 };
 * const keys = keysOf(point);
 * // type of keys -> ('a' | 'b')[]
 * for (const key of keys) {
 *   console.log(key, point[key]);
 * }
 * // x 1
 * // y 2
 * ```
 *
 * @param obj The object of interest.
 */
function keysOf(obj) {
  return Object.keys(obj || {});
}
var keysOf_1 = keysOf;
/**
 * Returns the entries of an object of type `T`. This is like `Object.entries` except the return type
 * captures the known keys and value types of `T`.
 *
 * Note that it is the responsibility of the caller to use this wisely -- there are cases where
 * the runtime set of entries returned may be broader than the type checked set at compile time,
 * so there's potential for this to be abused in ways that are not inherently type safe. For
 * example, given base class `Animal`, subclass `Fish`, and `const animal: Animal = new Fish();`
 * then `entriesOf(animal)` will not type-check the entire set of keys of the object `animal` since
 * it is actually an instance of type `Fish`, which has an extended property set.
 *
 * In general, it should be both convenient and type-safe to use this when enumerating the entries
 * of simple data objects with known properties.
 *
 * ```
 * interface Point { x: number; y: number; }
 * const point: Point = { x: 1, y: 2 };
 * // type of entries -> ['x' | 'y', number][]
 * const entries = entriesOf(point);
 * for (const entry of entries) {
 *   console.log(entry[0], entry[1]);
 * }
 * // x 1
 * // y 2
 * ```
 *
 * @param obj The object of interest.
 */
function entriesOf(obj) {
  return Object.entries(obj || {});
}
var entriesOf_1 = entriesOf;
/**
 * Returns the values of an object of type `T`. This is like `Object.values` except the return type
 * captures the possible value types of `T`.
 *
 * Note that it is the responsibility of the caller to use this wisely -- there are cases where
 * the runtime set of values returned may be broader than the type checked set at compile time,
 * so there's potential for this to be abused in ways that are not inherently type safe. For
 * example, given base class `Animal`, subclass `Fish`, and `const animal: Animal = new Fish();`
 * then `valuesOf(animal)` will not type-check the entire set of values of the object `animal` since
 * it is actually an instance of type `Fish`, which has an extended property set.
 *
 * In general, it should be both convenient and type-safe to use this when enumerating the values
 * of simple data objects with known properties.
 *
 * ```
 * interface Point { x: number; y: number; }
 * const point: Point = { x: 1, y: 2 };
 * const values = valuesOf(point);
 * // type of values -> number[]
 * for (const value of values) {
 *   console.log(value);
 * }
 * // 1
 * // 2
 * ```
 *
 * @param obj The object of interest.
 */
function valuesOf(obj) {
  return Object.values(obj || {});
}
var valuesOf_1 = valuesOf;
/**
 * Returns an array of all `string` keys in an object of type `T` whose values are neither `null` nor `undefined`.
 * This can be convenient for enumerating the keys of definitely assigned properties in an object or `Dictionary`.
 *
 * See also caveats outlined in {@link keysOf}.
 *
 * @param obj The object of interest.
 */
function definiteKeysOf(obj) {
  return definiteEntriesOf(obj).map(entry => entry[0]);
}
var definiteKeysOf_1 = definiteKeysOf;
/**
 * Returns an array of all entry tuples of type `[K, NonNullable<T[K]>]` in an object `T` whose values are neither
 * `null` nor `undefined`. This can be convenient for enumerating the entries of unknown objects with optional properties
 * (including `Dictionary`s) without worrying about performing checks against possibly `undefined` or `null` values.
 *
 * See also caveats outlined in {@link entriesOf}.
 *
 * @param obj The object of interest.
 */
function definiteEntriesOf(obj) {
  return entriesOf(obj).filter(entry => entry[1] != null);
}
var definiteEntriesOf_1 = definiteEntriesOf;
/**
 * Returns an array of all values of type `T` in an object `T` for values that are neither `null` nor `undefined`.
 * This can be convenient for enumerating the values of unknown objects with optional properties (including
 * `Dictionary`s) without worrying about performing checks against possibly `undefined` or `null` values.
 *
 * @param obj The object of interest.
 */
function definiteValuesOf(obj) {
  return definiteEntriesOf(obj).map(entry => entry[1]);
}
var definiteValuesOf_1 = definiteValuesOf;

var object = /*#__PURE__*/ Object.defineProperty(
  {
    keysOf: keysOf_1,
    entriesOf: entriesOf_1,
    valuesOf: valuesOf_1,
    definiteKeysOf: definiteKeysOf_1,
    definiteEntriesOf: definiteEntriesOf_1,
    definiteValuesOf: definiteValuesOf_1
  },
  '__esModule',
  { value: true }
);

var narrowing = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
  }
  Object.defineProperty(exports, '__esModule', { value: true });
  __export(as);
  __export(coerce);
  __export(ensure_1);
  __export(get_1);
  __export(has_1);
  __export(is);
  __export(object);
  __export(to);
});

var lib = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
  }
  Object.defineProperty(exports, '__esModule', { value: true });
  __export(narrowing);
});

exports.lib = lib;
//# sourceMappingURL=index-ffe6ca9f.js.map
