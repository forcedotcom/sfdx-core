'use strict';

var _commonjsHelpers = require('./_commonjsHelpers-49936489.js');

var creatable = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.AsyncOptionalCreatable = exports.AsyncCreatable = void 0;
  /**
   * A base class for classes that must be constructed and initialized asynchronously.
   */
  class AsyncCreatable {
    /**
     * Constructs a new `AsyncCreatable` instance. For internal and subclass use only.
     * New subclass instances must be created with the static {@link create} method.
     *
     * @param options An options object providing initialization params.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(options) {
      /* leave up to implementer */
    }
    /**
     * Asynchronously constructs and initializes a new instance of a concrete subclass with the provided `options`.
     *
     * @param options An options object providing initialization params to the async constructor.
     */
    static async create(options) {
      const instance = new this(options);
      await instance.init();
      return instance;
    }
  }
  exports.AsyncCreatable = AsyncCreatable;
  /**
   * A base class for classes that must be constructed and initialized asynchronously without requiring an options object.
   */
  class AsyncOptionalCreatable {
    /**
     * Constructs a new `AsyncCreatable` instance. For internal and subclass use only.
     * New subclass instances must be created with the static {@link create} method.
     *
     * @param options An options object providing initialization params.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(options) {
      /* leave up to implementer */
    }
    /**
     * Asynchronously constructs and initializes a new instance of a concrete subclass with the optional `options`.
     *
     * @param options An options object providing initialization params to the async constructor.
     */
    static async create(options) {
      const instance = new this(options);
      await instance.init();
      return instance;
    }
  }
  exports.AsyncOptionalCreatable = AsyncOptionalCreatable;
});

var duration = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.sleep = exports.Duration = void 0;
  /**
   * A simple utility class for converting durations between minutes, seconds, and milliseconds.
   */
  class Duration {
    constructor(quantity, unit = Duration.Unit.MINUTES) {
      this.quantity = quantity;
      this.unit = unit;
    }
    /**
     * Returns a new `Duration` instance created from the specified number of milliseconds.
     *
     * @param quantity The number of milliseconds.
     */
    static milliseconds(quantity) {
      return new Duration(quantity, Duration.Unit.MILLISECONDS);
    }
    /**
     * Returns a new `Duration` instance created from the specified number of seconds.
     *
     * @param quantity The number of seconds.
     */
    static seconds(quantity) {
      return new Duration(quantity, Duration.Unit.SECONDS);
    }
    /**
     * Returns a new `Duration` instance created from the specified number of minutes.
     *
     * @param quantity The number of minutes.
     */
    static minutes(quantity) {
      return new Duration(quantity, Duration.Unit.MINUTES);
    }
    /**
     * Returns a new `Duration` instance created from the specified number of hours.
     *
     * @param quantity The number of hours.
     */
    static hours(quantity) {
      return new Duration(quantity, Duration.Unit.HOURS);
    }
    /**
     * Returns a new `Duration` instance created from the specified number of days.
     *
     * @param quantity The number of days.
     */
    static days(quantity) {
      return new Duration(quantity, Duration.Unit.DAYS);
    }
    /**
     * Returns a new `Duration` instance created from the specified number of weeks.
     *
     * @param quantity The number of weeks.
     */
    static weeks(quantity) {
      return new Duration(quantity, Duration.Unit.WEEKS);
    }
    /**
     * Returns the current number of milliseconds represented by this `Duration` instance.
     */
    get milliseconds() {
      switch (this.unit) {
        case Duration.Unit.MILLISECONDS:
          return this.quantity;
        case Duration.Unit.SECONDS:
          return this.quantity * Duration.MILLIS_IN_SECONDS;
        case Duration.Unit.MINUTES:
          return this.quantity * Duration.MILLIS_IN_SECONDS * Duration.SECONDS_IN_MINUTE;
        case Duration.Unit.HOURS:
          return this.quantity * Duration.MILLIS_IN_SECONDS * Duration.SECONDS_IN_MINUTE * Duration.MINUTES_IN_HOUR;
        case Duration.Unit.DAYS:
          return (
            this.quantity *
            Duration.MILLIS_IN_SECONDS *
            Duration.SECONDS_IN_MINUTE *
            Duration.MINUTES_IN_HOUR *
            Duration.HOURS_IN_DAY
          );
        case Duration.Unit.WEEKS:
          return (
            this.quantity *
            Duration.MILLIS_IN_SECONDS *
            Duration.SECONDS_IN_MINUTE *
            Duration.MINUTES_IN_HOUR *
            Duration.HOURS_IN_DAY *
            Duration.DAYS_IN_WEEK
          );
      }
    }
    /**
     * Returns the current number of seconds represented by this `Duration` instance, rounded to the nearest integer
     * value.
     */
    get seconds() {
      switch (this.unit) {
        case Duration.Unit.MILLISECONDS:
          return Math.round(this.quantity / Duration.MILLIS_IN_SECONDS);
        case Duration.Unit.SECONDS:
          return this.quantity;
        case Duration.Unit.MINUTES:
          return this.quantity * Duration.SECONDS_IN_MINUTE;
        case Duration.Unit.HOURS:
          return this.quantity * Duration.SECONDS_IN_MINUTE * Duration.MINUTES_IN_HOUR;
        case Duration.Unit.DAYS:
          return this.quantity * Duration.SECONDS_IN_MINUTE * Duration.MINUTES_IN_HOUR * Duration.HOURS_IN_DAY;
        case Duration.Unit.WEEKS:
          return (
            this.quantity *
            Duration.SECONDS_IN_MINUTE *
            Duration.MINUTES_IN_HOUR *
            Duration.HOURS_IN_DAY *
            Duration.DAYS_IN_WEEK
          );
      }
    }
    /**
     * Returns the current number of minutes represented by this `Duration` instance, rounded to the nearest integer
     * value.
     */
    get minutes() {
      switch (this.unit) {
        case Duration.Unit.MILLISECONDS:
          return Math.round(this.quantity / Duration.MILLIS_IN_SECONDS / Duration.SECONDS_IN_MINUTE);
        case Duration.Unit.SECONDS:
          return Math.round(this.quantity / Duration.SECONDS_IN_MINUTE);
        case Duration.Unit.MINUTES:
          return this.quantity;
        case Duration.Unit.HOURS:
          return this.quantity * Duration.MINUTES_IN_HOUR;
        case Duration.Unit.DAYS:
          return this.quantity * Duration.MINUTES_IN_HOUR * Duration.HOURS_IN_DAY;
        case Duration.Unit.WEEKS:
          return this.quantity * Duration.MINUTES_IN_HOUR * Duration.HOURS_IN_DAY * Duration.DAYS_IN_WEEK;
      }
    }
    /**
     * Returns the current number of hours represented by this `Duration` instance.
     */
    get hours() {
      switch (this.unit) {
        case Duration.Unit.MILLISECONDS:
          return Math.round(
            this.quantity / Duration.MILLIS_IN_SECONDS / Duration.SECONDS_IN_MINUTE / Duration.MINUTES_IN_HOUR
          );
        case Duration.Unit.SECONDS:
          return Math.round(this.quantity / Duration.SECONDS_IN_MINUTE / Duration.MINUTES_IN_HOUR);
        case Duration.Unit.MINUTES:
          return Math.round(this.quantity / Duration.MINUTES_IN_HOUR);
        case Duration.Unit.HOURS:
          return this.quantity;
        case Duration.Unit.DAYS:
          return this.quantity * Duration.HOURS_IN_DAY;
        case Duration.Unit.WEEKS:
          return this.quantity * Duration.HOURS_IN_DAY * Duration.DAYS_IN_WEEK;
      }
    }
    /**
     * Returns the current number of days represented by this `Duration` instance.
     */
    get days() {
      switch (this.unit) {
        case Duration.Unit.MILLISECONDS:
          return Math.round(
            this.quantity /
              Duration.MILLIS_IN_SECONDS /
              Duration.SECONDS_IN_MINUTE /
              Duration.MINUTES_IN_HOUR /
              Duration.HOURS_IN_DAY
          );
        case Duration.Unit.SECONDS:
          return Math.round(
            this.quantity / Duration.SECONDS_IN_MINUTE / Duration.MINUTES_IN_HOUR / Duration.HOURS_IN_DAY
          );
        case Duration.Unit.MINUTES:
          return Math.round(this.quantity / Duration.MINUTES_IN_HOUR / Duration.HOURS_IN_DAY);
        case Duration.Unit.HOURS:
          return Math.round(this.quantity / Duration.HOURS_IN_DAY);
        case Duration.Unit.DAYS:
          return this.quantity;
        case Duration.Unit.WEEKS:
          return this.quantity * Duration.DAYS_IN_WEEK;
      }
    }
    /**
     * Returns the current number of weeks represented by this `Duration` instance.
     */
    get weeks() {
      switch (this.unit) {
        case Duration.Unit.MILLISECONDS:
          return Math.round(
            this.quantity /
              Duration.MILLIS_IN_SECONDS /
              Duration.SECONDS_IN_MINUTE /
              Duration.MINUTES_IN_HOUR /
              Duration.HOURS_IN_DAY /
              Duration.DAYS_IN_WEEK
          );
        case Duration.Unit.SECONDS:
          return Math.round(
            this.quantity /
              Duration.SECONDS_IN_MINUTE /
              Duration.MINUTES_IN_HOUR /
              Duration.HOURS_IN_DAY /
              Duration.DAYS_IN_WEEK
          );
        case Duration.Unit.MINUTES:
          return Math.round(this.quantity / Duration.MINUTES_IN_HOUR / Duration.HOURS_IN_DAY / Duration.DAYS_IN_WEEK);
        case Duration.Unit.HOURS:
          return Math.round(this.quantity / Duration.HOURS_IN_DAY / Duration.DAYS_IN_WEEK);
        case Duration.Unit.DAYS:
          return Math.round(this.quantity / Duration.DAYS_IN_WEEK);
        case Duration.Unit.WEEKS:
          return this.quantity;
      }
    }
    /**
     * The string representation of this `Duration`. e.g. "645 seconds"
     */
    toString() {
      return this.pluralize();
    }
    pluralize(num = this.quantity, unit = this.unit) {
      const name = Duration.Unit[unit].toLowerCase();
      if (num === 1) return `${num} ${name.slice(0, name.length - 1)}`;
      return `${num} ${name}`;
    }
  }
  exports.Duration = Duration;
  /**
   * The number of milliseconds in one second.
   */
  Duration.MILLIS_IN_SECONDS = 1000;
  /**
   * The number of seconds in one minute.
   */
  Duration.SECONDS_IN_MINUTE = 60;
  /**
   * The number of minutes in one hour.
   */
  Duration.MINUTES_IN_HOUR = 60;
  /**
   * The number of hours in one day.
   */
  Duration.HOURS_IN_DAY = 24;
  /**
   * The number of days in one week.
   */
  Duration.DAYS_IN_WEEK = 7;
  (function(Duration) {
    (function(Unit) {
      Unit[(Unit['MINUTES'] = 0)] = 'MINUTES';
      Unit[(Unit['MILLISECONDS'] = 1)] = 'MILLISECONDS';
      Unit[(Unit['SECONDS'] = 2)] = 'SECONDS';
      Unit[(Unit['HOURS'] = 3)] = 'HOURS';
      Unit[(Unit['DAYS'] = 4)] = 'DAYS';
      Unit[(Unit['WEEKS'] = 5)] = 'WEEKS';
    })(Duration.Unit || (Duration.Unit = {}));
  })((Duration = exports.Duration || (exports.Duration = {})));
  // underlying function
  function sleep(durationOrQuantity, unit = Duration.Unit.MILLISECONDS) {
    const duration =
      durationOrQuantity instanceof Duration ? durationOrQuantity : new Duration(durationOrQuantity, unit);
    let handle;
    let doResolve;
    const wake = () => {
      if (!handle) return;
      clearTimeout(handle);
      handle = undefined;
      doResolve();
    };
    const promise = new Promise(resolve => {
      doResolve = resolve;
      handle = setTimeout(wake, duration.milliseconds);
    });
    return Object.assign(promise, { interrupt: wake });
  }
  exports.sleep = sleep;
});

var is = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.isKeyOf = exports.isJsonArray = exports.isJsonMap = exports.isAnyJson = exports.isArrayLike = exports.isArray = exports.isClassAssignableTo = exports.isInstance = exports.isDictionary = exports.isPlainObject = exports.isFunction = exports.isObject = exports.isBoolean = exports.isNumber = exports.isString = void 0;
  /**
   * Tests whether an `unknown` value is a `string`.
   *
   * @param value The value to test.
   */
  function isString(value) {
    return typeof value === 'string';
  }
  exports.isString = isString;
  /**
   * Tests whether an `unknown` value is a `number`.
   *
   * @param value The value to test.
   */
  function isNumber(value) {
    return typeof value === 'number';
  }
  exports.isNumber = isNumber;
  /**
   * Tests whether an `unknown` value is a `boolean`.
   *
   * @param value The value to test.
   */
  function isBoolean(value) {
    return typeof value === 'boolean';
  }
  exports.isBoolean = isBoolean;
  /**
   * Tests whether an `unknown` value is an `Object` subtype (e.g., arrays, functions, objects, regexes,
   * new Number(0), new String(''), and new Boolean(true)). Tests that wish to distinguish objects that
   * were created from literals or that otherwise were not created via a non-`Object` constructor and do
   * not have a prototype chain should instead use {@link isPlainObject}.
   *
   * Use of the type parameter `T` to further narrow the type signature of the value being tested is
   * strongly discouraged unless you are completely confident that the value is of the necessary shape to
   * conform with `T`. This function does nothing at either compile time or runtime to prove the value is of
   * shape `T`, so doing so amounts to nothing more than performing a type assertion, which is generally a
   * bad practice unless you have performed some other due diligence in proving that the value must be of
   * shape `T`. Use of the functions in the `has` co-library are useful for performing such full or partial
   * proofs.
   *
   * @param value The value to test.
   */
  function isObject(value) {
    return value != null && (typeof value === 'object' || typeof value === 'function');
  }
  exports.isObject = isObject;
  /**
   * Tests whether an `unknown` value is a `function`.
   *
   * @param value The value to test.
   */
  function isFunction(value) {
    return typeof value === 'function';
  }
  exports.isFunction = isFunction;
  /**
   * Tests whether or not an `unknown` value is a plain JavaScript object. That is, if it is an object created
   * by the Object constructor or one with a null `prototype`.
   *
   * Use of the type parameter `T` to further narrow the type signature of the value being tested is
   * strongly discouraged unless you are completely confident that the value is of the necessary shape to
   * conform with `T`. This function does nothing at either compile time or runtime to prove the value is of
   * shape `T`, so doing so amounts to nothing more than performing a type assertion, which is generally a
   * bad practice unless you have performed some other due diligence in proving that the value must be of
   * shape `T`. Use of the functions in the `has` co-library are useful for performing such full or partial
   * proofs.
   *
   * @param value The value to test.
   */
  function isPlainObject(value) {
    const isObjectObject = o => isObject(o) && Object.prototype.toString.call(o) === '[object Object]';
    if (!isObjectObject(value)) return false;
    const ctor = value.constructor;
    if (!isFunction(ctor)) return false;
    if (!isObjectObject(ctor.prototype)) return false;
    // eslint-disable-next-line no-prototype-builtins
    if (!ctor.prototype.hasOwnProperty('isPrototypeOf')) return false;
    return true;
  }
  exports.isPlainObject = isPlainObject;
  /**
   * A shortcut for testing the suitability of a value to be used as a `Dictionary<T>` type.  Shorthand for
   * writing `isPlainObject<Dictionary<T>>(value)`.  While some non-plain-object types are compatible with
   * index signatures, they were less typically used as such, so this function focuses on the 80% case.
   *
   * Use of the type parameter `T` to further narrow the type signature of the value being tested is
   * strongly discouraged unless you are completely confident that the value is of the necessary shape to
   * conform with `T`. This function does nothing at either compile time or runtime to prove the value is of
   * shape `T`, so doing so amounts to nothing more than performing a type assertion, which is generally a
   * bad practice unless you have performed some other due diligence in proving that the value must be of
   * shape `T`. Use of the functions in the `has` co-library are useful for performing such full or partial
   * proofs.
   *
   * @param value The value to test.
   */
  function isDictionary(value) {
    return isPlainObject(value);
  }
  exports.isDictionary = isDictionary;
  /**
   * Tests whether an `unknown` value is a `function`.
   *
   * @param value The value to test.
   */
  function isInstance(value, ctor) {
    return value instanceof ctor;
  }
  exports.isInstance = isInstance;
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
  exports.isClassAssignableTo = isClassAssignableTo;
  /**
   * Tests whether an `unknown` value is an `Array`.
   *
   * Use of the type parameter `T` to further narrow the type signature of the value being tested is
   * strongly discouraged unless you are completely confident that the value is of the necessary shape to
   * conform with `T`. This function does nothing at either compile time or runtime to prove the value is of
   * shape `T`, so doing so amounts to nothing more than performing a type assertion, which is generally a
   * bad practice unless you have performed some other due diligence in proving that the value must be of
   * shape `T`. Use of the functions in the `has` co-library are useful for performing such full or partial
   * proofs.
   *
   * @param value The value to test.
   */
  function isArray(value) {
    return Array.isArray(value);
  }
  exports.isArray = isArray;
  /**
   * Tests whether an `unknown` value conforms to {@link AnyArrayLike}.
   *
   * Use of the type parameter `T` to further narrow the type signature of the value being tested is
   * strongly discouraged unless you are completely confident that the value is of the necessary shape to
   * conform with `T`. This function does nothing at either compile time or runtime to prove the value is of
   * shape `T`, so doing so amounts to nothing more than performing a type assertion, which is generally a
   * bad practice unless you have performed some other due diligence in proving that the value must be of
   * shape `T`. Use of the functions in the `has` co-library are useful for performing such full or partial
   * proofs.
   *
   * @param value The value to test.
   */
  function isArrayLike(value) {
    // avoid circular dependency with has.ts
    const hasLength = v => isObject(v) && 'length' in v;
    return !isFunction(value) && (isString(value) || hasLength(value));
  }
  exports.isArrayLike = isArrayLike;
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
  exports.isAnyJson = isAnyJson;
  /**
   * Tests whether an `AnyJson` value is an object.
   *
   * @param value The value to test.
   */
  function isJsonMap(value) {
    return isPlainObject(value);
  }
  exports.isJsonMap = isJsonMap;
  /**
   * Tests whether an `AnyJson` value is an array.
   *
   * @param value The value to test.
   */
  function isJsonArray(value) {
    return isArray(value);
  }
  exports.isJsonArray = isJsonArray;
  /**
   * Tests whether or not a `key` string is a key of the given object type `T`.
   *
   * @param obj The target object to check the key in.
   * @param key The string to test as a key of the target object.
   */
  function isKeyOf(obj, key) {
    return Object.keys(obj).includes(key);
  }
  exports.isKeyOf = isKeyOf;
});

var as = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.asJsonArray = exports.asJsonMap = exports.asFunction = exports.asArray = exports.asInstance = exports.asDictionary = exports.asPlainObject = exports.asObject = exports.asBoolean = exports.asNumber = exports.asString = void 0;

  // underlying function
  function asString(value, defaultValue) {
    return is.isString(value) ? value : defaultValue;
  }
  exports.asString = asString;
  // underlying function
  function asNumber(value, defaultValue) {
    return is.isNumber(value) ? value : defaultValue;
  }
  exports.asNumber = asNumber;
  // underlying function
  function asBoolean(value, defaultValue) {
    return is.isBoolean(value) ? value : defaultValue;
  }
  exports.asBoolean = asBoolean;
  // underlying function
  function asObject(value, defaultValue) {
    return is.isObject(value) ? value : defaultValue;
  }
  exports.asObject = asObject;
  // underlying function
  function asPlainObject(value, defaultValue) {
    return is.isPlainObject(value) ? value : defaultValue;
  }
  exports.asPlainObject = asPlainObject;
  // underlying function
  function asDictionary(value, defaultValue) {
    return is.isDictionary(value) ? value : defaultValue;
  }
  exports.asDictionary = asDictionary;
  // underlying function
  function asInstance(value, ctor, defaultValue) {
    return is.isInstance(value, ctor) ? value : defaultValue;
  }
  exports.asInstance = asInstance;
  // underlying function
  function asArray(value, defaultValue) {
    return is.isArray(value) ? value : defaultValue;
  }
  exports.asArray = asArray;
  // underlying function
  function asFunction(value, defaultValue) {
    return is.isFunction(value) ? value : defaultValue;
  }
  exports.asFunction = asFunction;
  // underlying function
  function asJsonMap(value, defaultValue) {
    return is.isJsonMap(value) ? value : defaultValue;
  }
  exports.asJsonMap = asJsonMap;
  // underlying function
  function asJsonArray(value, defaultValue) {
    return is.isJsonArray(value) ? value : defaultValue;
  }
  exports.asJsonArray = asJsonArray;
});

var errors = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.JsonCloneError = exports.UnexpectedValueTypeError = exports.AssertionFailedError = exports.NamedError = void 0;
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
  exports.NamedError = NamedError;
  /**
   * Indicates an unexpected type was encountered during a type-narrowing operation.
   */
  class AssertionFailedError extends NamedError {
    constructor(message) {
      super('AssertionFailedError', message);
    }
  }
  exports.AssertionFailedError = AssertionFailedError;
  /**
   * Indicates an unexpected type was encountered during a type-narrowing operation.
   */
  class UnexpectedValueTypeError extends NamedError {
    constructor(message) {
      super('UnexpectedValueTypeError', message);
    }
  }
  exports.UnexpectedValueTypeError = UnexpectedValueTypeError;
  /**
   * Indicates an error while performing a JSON clone operation.
   */
  class JsonCloneError extends NamedError {
    constructor(cause) {
      super('JsonCloneError', cause.message);
    }
  }
  exports.JsonCloneError = JsonCloneError;
});

var to = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.toJsonArray = exports.toJsonMap = exports.toAnyJson = void 0;

  // underlying function
  function toAnyJson(value, defaultValue) {
    try {
      return value !== undefined ? JSON.parse(JSON.stringify(value)) : defaultValue;
    } catch (err) {
      throw new errors.JsonCloneError(err);
    }
  }
  exports.toAnyJson = toAnyJson;
  // underlying function
  function toJsonMap(value, defaultValue) {
    return as.asJsonMap(toAnyJson(value)) || defaultValue;
  }
  exports.toJsonMap = toJsonMap;
  // underlying method
  function toJsonArray(value, defaultValue) {
    return as.asJsonArray(toAnyJson(value)) || defaultValue;
  }
  exports.toJsonArray = toJsonArray;
});

var assert_1 = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.assertJsonArray = exports.assertJsonMap = exports.assertAnyJson = exports.assertFunction = exports.assertArray = exports.assertInstance = exports.assertDictionary = exports.assertPlainObject = exports.assertObject = exports.assertBoolean = exports.assertNumber = exports.assertString = exports.assertNonNull = exports.assert = void 0;

  /**
   * Asserts that a given `condition` is true, or raises an error otherwise.
   *
   * @param condition The condition to test.
   * @param message The error message to use if the condition is false.
   * @throws {@link AssertionFailedError} If the assertion failed.
   */
  function assert(condition, message) {
    if (!condition) {
      throw new errors.AssertionFailedError(message || 'Assertion condition was false');
    }
  }
  exports.assert = assert;
  /**
   * Narrows a type `Nullable<T>` to a `T` or raises an error.
   *
   * Use of the type parameter `T` to further narrow the type signature of the value being tested is
   * strongly discouraged unless you are completely confident that the value is of the necessary shape to
   * conform with `T`. This function does nothing at either compile time or runtime to prove the value is of
   * shape `T`, so doing so amounts to nothing more than performing a type assertion, which is generally a
   * bad practice unless you have performed some other due diligence in proving that the value must be of
   * shape `T`. Use of the functions in the `has` co-library are useful for performing such full or partial
   * proofs.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is `undefined` or `null`.
   * @throws {@link AssertionFailedError} If the value was undefined.
   */
  function assertNonNull(value, message) {
    assert(value != null, message || 'Value is not defined');
  }
  exports.assertNonNull = assertNonNull;
  /**
   * Narrows an `unknown` value to a `string` if it is type-compatible, or raises an error otherwise.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is not type-compatible.
   * @throws {@link AssertionFailedError} If the value was undefined.
   */
  function assertString(value, message) {
    assertNonNull(as.asString(value), message || 'Value is not a string');
  }
  exports.assertString = assertString;
  /**
   * Narrows an `unknown` value to a `number` if it is type-compatible, or raises an error otherwise.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is not type-compatible.
   * @throws {@link AssertionFailedError} If the value was undefined.
   */
  function assertNumber(value, message) {
    assertNonNull(as.asNumber(value), message || 'Value is not a number');
  }
  exports.assertNumber = assertNumber;
  /**
   * Narrows an `unknown` value to a `boolean` if it is type-compatible, or raises an error otherwise.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is not type-compatible.
   * @throws {@link AssertionFailedError} If the value was undefined.
   */
  function assertBoolean(value, message) {
    assertNonNull(as.asBoolean(value), message || 'Value is not a boolean');
  }
  exports.assertBoolean = assertBoolean;
  /**
   * Narrows an `unknown` value to an `object` if it is type-compatible, or raises an error otherwise.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is not type-compatible.
   * @throws {@link AssertionFailedError} If the value was undefined.
   */
  function assertObject(value, message) {
    assertNonNull(as.asObject(value), message || 'Value is not an object');
  }
  exports.assertObject = assertObject;
  /**
   * Narrows an `unknown` value to an `object` if it is type-compatible and tests positively with {@link isPlainObject},
   * or raises an error otherwise.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is not type-compatible.
   * @throws {@link AssertionFailedError} If the value was undefined.
   */
  function assertPlainObject(value, message) {
    assertNonNull(as.asPlainObject(value), message || 'Value is not a plain object');
  }
  exports.assertPlainObject = assertPlainObject;
  /**
   * Narrows an `unknown` value to a `Dictionary<T>` if it is type-compatible and tests positively
   * with {@link isDictionary}, or raises an error otherwise.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is not type-compatible.
   * @throws {@link AssertionFailedError} If the value was undefined.
   */
  function assertDictionary(value, message) {
    assertNonNull(as.asDictionary(value), message || 'Value is not a dictionary object');
  }
  exports.assertDictionary = assertDictionary;
  /**
   * Narrows an `unknown` value to instance of constructor type `T` if it is type-compatible, or raises an error
   * otherwise.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is not type-compatible.
   * @throws {@link AssertionFailedError} If the value was undefined.
   */
  function assertInstance(value, ctor, message) {
    assertNonNull(as.asInstance(value, ctor), message || `Value is not an instance of ${ctor.name}`);
  }
  exports.assertInstance = assertInstance;
  /**
   * Narrows an `unknown` value to an `Array` if it is type-compatible, or raises an error otherwise.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is not type-compatible.
   * @throws {@link AssertionFailedError} If the value was undefined.
   */
  function assertArray(value, message) {
    assertNonNull(as.asArray(value), message || 'Value is not an array');
  }
  exports.assertArray = assertArray;
  /**
   * Narrows an `unknown` value to an `AnyFunction` if it is type-compatible, or raises an error otherwise.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is not type-compatible.
   * @throws {@link AssertionFailedError} If the value was undefined.
   */
  function assertFunction(value, message) {
    assertNonNull(as.asFunction(value), message || 'Value is not a function');
  }
  exports.assertFunction = assertFunction;
  /**
   * Narrows an `unknown` value to an `AnyJson` if it is type-compatible, or returns `undefined` otherwise.
   *
   * See also caveats noted in {@link isAnyJson}.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is not type-compatible.
   * @throws {@link AssertionFailedError} If the value was not a JSON value type.
   */
  function assertAnyJson(value, message) {
    assertNonNull(to.toAnyJson(value), message || 'Value is not a JSON-compatible value type');
  }
  exports.assertAnyJson = assertAnyJson;
  /**
   * Narrows an `AnyJson` value to a `JsonMap` if it is type-compatible, or raises an error otherwise.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is not type-compatible.
   * @throws {@link AssertionFailedError} If the value was undefined.
   */
  function assertJsonMap(value, message) {
    assertNonNull(as.asJsonMap(value), message || 'Value is not a JsonMap');
  }
  exports.assertJsonMap = assertJsonMap;
  /**
   * Narrows an `AnyJson` value to a `JsonArray` if it is type-compatible, or raises an error otherwise.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is not type-compatible.
   * @throws {@link AssertionFailedError} If the value was undefined.
   */
  function assertJsonArray(value, message) {
    assertNonNull(as.asJsonArray(value), message || 'Value is not a JsonArray');
  }
  exports.assertJsonArray = assertJsonArray;
});

var coerce = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.coerceJsonArray = exports.coerceJsonMap = exports.coerceAnyJson = void 0;

  // underlying function
  function coerceAnyJson(value, defaultValue) {
    return is.isAnyJson(value) ? value : defaultValue;
  }
  exports.coerceAnyJson = coerceAnyJson;
  // underlying function
  function coerceJsonMap(value, defaultValue) {
    return as.asJsonMap(coerceAnyJson(value)) || defaultValue;
  }
  exports.coerceJsonMap = coerceJsonMap;
  // underlying method
  function coerceJsonArray(value, defaultValue) {
    return as.asJsonArray(coerceAnyJson(value)) || defaultValue;
  }
  exports.coerceJsonArray = coerceJsonArray;
});

var ensure_1 = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.ensureJsonArray = exports.ensureJsonMap = exports.ensureAnyJson = exports.ensureFunction = exports.ensureArray = exports.ensureInstance = exports.ensureDictionary = exports.ensurePlainObject = exports.ensureObject = exports.ensureBoolean = exports.ensureNumber = exports.ensureString = exports.ensure = void 0;

  /**
   * Narrows a type `Nullable<T>` to a `T` or raises an error.
   *
   * Use of the type parameter `T` to further narrow the type signature of the value being tested is
   * strongly discouraged unless you are completely confident that the value is of the necessary shape to
   * conform with `T`. This function does nothing at either compile time or runtime to prove the value is of
   * shape `T`, so doing so amounts to nothing more than performing a type assertion, which is generally a
   * bad practice unless you have performed some other due diligence in proving that the value must be of
   * shape `T`. Use of the functions in the `has` co-library are useful for performing such full or partial
   * proofs.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is `undefined` or `null`.
   * @throws {@link UnexpectedValueTypeError} If the value was undefined.
   */
  function ensure(value, message) {
    if (value == null) {
      throw new errors.UnexpectedValueTypeError(message || 'Value is not defined');
    }
    return value;
  }
  exports.ensure = ensure;
  /**
   * Narrows an `unknown` value to a `string` if it is type-compatible, or raises an error otherwise.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is not type-compatible.
   * @throws {@link UnexpectedValueTypeError} If the value was undefined.
   */
  function ensureString(value, message) {
    return ensure(as.asString(value), message || 'Value is not a string');
  }
  exports.ensureString = ensureString;
  /**
   * Narrows an `unknown` value to a `number` if it is type-compatible, or raises an error otherwise.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is not type-compatible.
   * @throws {@link UnexpectedValueTypeError} If the value was undefined.
   */
  function ensureNumber(value, message) {
    return ensure(as.asNumber(value), message || 'Value is not a number');
  }
  exports.ensureNumber = ensureNumber;
  /**
   * Narrows an `unknown` value to a `boolean` if it is type-compatible, or raises an error otherwise.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is not type-compatible.
   * @throws {@link UnexpectedValueTypeError} If the value was undefined.
   */
  function ensureBoolean(value, message) {
    return ensure(as.asBoolean(value), message || 'Value is not a boolean');
  }
  exports.ensureBoolean = ensureBoolean;
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
  exports.ensureObject = ensureObject;
  /**
   * Narrows an `unknown` value to an `object` if it is type-compatible and tests positively with {@link isPlainObject},
   * or raises an error otherwise.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is not type-compatible.
   * @throws {@link UnexpectedValueTypeError} If the value was undefined.
   */
  function ensurePlainObject(value, message) {
    return ensure(as.asPlainObject(value), message || 'Value is not a plain object');
  }
  exports.ensurePlainObject = ensurePlainObject;
  /**
   * Narrows an `unknown` value to a `Dictionary<T>` if it is type-compatible and tests positively
   * with {@link isDictionary}, or raises an error otherwise.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is not type-compatible.
   * @throws {@link UnexpectedValueTypeError} If the value was undefined.
   */
  function ensureDictionary(value, message) {
    return ensure(as.asDictionary(value), message || 'Value is not a dictionary object');
  }
  exports.ensureDictionary = ensureDictionary;
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
  exports.ensureInstance = ensureInstance;
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
  exports.ensureArray = ensureArray;
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
  exports.ensureFunction = ensureFunction;
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
  exports.ensureAnyJson = ensureAnyJson;
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
  exports.ensureJsonMap = ensureJsonMap;
  /**
   * Narrows an `AnyJson` value to a `JsonArray` if it is type-compatible, or raises an error otherwise.
   *
   * @param value The value to test.
   * @param message The error message to use if `value` is not type-compatible.
   * @throws {@link UnexpectedValueTypeError} If the value was undefined.
   */
  function ensureJsonArray(value, message) {
    return ensure(as.asJsonArray(value), message || 'Value is not a JsonArray');
  }
  exports.ensureJsonArray = ensureJsonArray;
});

var has_1 = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.hasJsonArray = exports.hasJsonMap = exports.hasAnyJson = exports.hasFunction = exports.hasArray = exports.hasInstance = exports.hasDictionary = exports.hasPlainObject = exports.hasObject = exports.hasBoolean = exports.hasNumber = exports.hasString = exports.has = void 0;

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
  exports.has = has;
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
  exports.hasString = hasString;
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
  exports.hasNumber = hasNumber;
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
  exports.hasBoolean = hasBoolean;
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
  exports.hasObject = hasObject;
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
  exports.hasPlainObject = hasPlainObject;
  /**
   * Tests whether a value of type `T` contains a property `key` whose type tests positively when tested with
   * {@link isDictionary}. If so, the type of the tested value is narrowed to reflect the existence of that key for
   * convenient access in the same scope. Returns `false` if the property key does not exist on the object or the value
   * stored by that key is not of type `object`.
   *
   * ```
   * // type of obj -> unknown
   * if (hasNumber(obj, 'status')) {
   *   // type of obj -> { status: number }
   *   if (hasDictionary(obj, 'data')) {
   *     // type of obj -> { status: number } & { data: Dictionary }
   *   } else if (hasString('error')) {
   *     // type of obj -> { status: number } & { error: string }
   *   }
   * }
   * ```
   *
   * @param value The value to test.
   * @param keys A "dictionary" `object` key to check for existence.
   */
  function hasDictionary(value, key) {
    return has(value, key) && is.isDictionary(value[key]);
  }
  exports.hasDictionary = hasDictionary;
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
  exports.hasInstance = hasInstance;
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
  exports.hasArray = hasArray;
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
  exports.hasFunction = hasFunction;
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
  exports.hasAnyJson = hasAnyJson;
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
  exports.hasJsonMap = hasJsonMap;
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
  exports.hasJsonArray = hasJsonArray;
});

var internal = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.valueOrDefault = void 0;
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
  exports.valueOrDefault = valueOrDefault;
});

var get_1 = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.getJsonArray = exports.getJsonMap = exports.getAnyJson = exports.getFunction = exports.getArray = exports.getInstance = exports.getDictionary = exports.getPlainObject = exports.getObject = exports.getBoolean = exports.getNumber = exports.getString = exports.get = void 0;

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
        .split(/[.[\]'"]/)
        .filter(p => !!p)
        .reduce((r, p) => (has_1.has(r, p) ? r[p] : undefined), from),
      defaultValue
    );
  }
  exports.get = get;
  // underlying function
  function getString(from, path, defaultValue) {
    return internal.valueOrDefault(as.asString(get(from, path)), defaultValue);
  }
  exports.getString = getString;
  // underlying function
  function getNumber(from, path, defaultValue) {
    return internal.valueOrDefault(as.asNumber(get(from, path)), defaultValue);
  }
  exports.getNumber = getNumber;
  // underlying function
  function getBoolean(from, path, defaultValue) {
    return internal.valueOrDefault(as.asBoolean(get(from, path)), defaultValue);
  }
  exports.getBoolean = getBoolean;
  // underlying function
  function getObject(from, path, defaultValue) {
    return internal.valueOrDefault(as.asObject(get(from, path)), defaultValue);
  }
  exports.getObject = getObject;
  // underlying function
  function getPlainObject(from, path, defaultValue) {
    return internal.valueOrDefault(as.asPlainObject(get(from, path)), defaultValue);
  }
  exports.getPlainObject = getPlainObject;
  // underlying function
  function getDictionary(from, path, defaultValue) {
    return internal.valueOrDefault(as.asDictionary(get(from, path)), defaultValue);
  }
  exports.getDictionary = getDictionary;
  // underlying function
  function getInstance(from, path, ctor, defaultValue) {
    return internal.valueOrDefault(as.asInstance(get(from, path), ctor), defaultValue);
  }
  exports.getInstance = getInstance;
  // underlying function
  function getArray(from, path, defaultValue) {
    return internal.valueOrDefault(as.asArray(get(from, path)), defaultValue);
  }
  exports.getArray = getArray;
  // underlying function
  function getFunction(from, path, defaultValue) {
    return internal.valueOrDefault(as.asFunction(get(from, path)), defaultValue);
  }
  exports.getFunction = getFunction;
  // underlying function
  function getAnyJson(from, path, defaultValue) {
    return internal.valueOrDefault(coerce.coerceAnyJson(get(from, path)), defaultValue);
  }
  exports.getAnyJson = getAnyJson;
  // underlying function
  function getJsonMap(from, path, defaultValue) {
    return internal.valueOrDefault(as.asJsonMap(getAnyJson(from, path)), defaultValue);
  }
  exports.getJsonMap = getJsonMap;
  // underlying function
  function getJsonArray(from, path, defaultValue) {
    return internal.valueOrDefault(as.asJsonArray(getAnyJson(from, path)), defaultValue);
  }
  exports.getJsonArray = getJsonArray;
});

var object = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.definiteValuesOf = exports.definiteKeysOf = exports.definiteEntriesOf = exports.valuesOf = exports.entriesOf = exports.keysOf = void 0;
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
  exports.keysOf = keysOf;
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
  exports.entriesOf = entriesOf;
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
  exports.valuesOf = valuesOf;
  /**
   * Returns an array of all entry tuples of type `[K, NonNullable<T[K]>]` in an object `T` whose values are neither
   * `null` nor `undefined`. This can be convenient for enumerating the entries of unknown objects with optional
   * properties (including `Dictionary`s) without worrying about performing checks against possibly `undefined` or
   * `null` values.
   *
   * See also caveats outlined in {@link entriesOf}.
   *
   * @param obj The object of interest.
   */
  function definiteEntriesOf(obj) {
    return entriesOf(obj).filter(entry => entry[1] != null);
  }
  exports.definiteEntriesOf = definiteEntriesOf;
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
  exports.definiteKeysOf = definiteKeysOf;
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
  exports.definiteValuesOf = definiteValuesOf;
});

var narrowing = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  var __createBinding =
    (_commonjsHelpers.commonjsGlobal && _commonjsHelpers.commonjsGlobal.__createBinding) ||
    (Object.create
      ? function(o, m, k, k2) {
          if (k2 === undefined) k2 = k;
          Object.defineProperty(o, k2, {
            enumerable: true,
            get: function() {
              return m[k];
            }
          });
        }
      : function(o, m, k, k2) {
          if (k2 === undefined) k2 = k;
          o[k2] = m[k];
        });
  var __exportStar =
    (_commonjsHelpers.commonjsGlobal && _commonjsHelpers.commonjsGlobal.__exportStar) ||
    function(m, exports) {
      for (var p in m)
        if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
    };
  Object.defineProperty(exports, '__esModule', { value: true });
  __exportStar(as, exports);
  __exportStar(assert_1, exports);
  __exportStar(coerce, exports);
  __exportStar(ensure_1, exports);
  __exportStar(get_1, exports);
  __exportStar(has_1, exports);
  __exportStar(is, exports);
  __exportStar(object, exports);
  __exportStar(to, exports);
});

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, '__esModule', { value: true });

var alias = /*#__PURE__*/ Object.freeze({
  __proto__: null
});

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, '__esModule', { value: true });

var collection = /*#__PURE__*/ Object.freeze({
  __proto__: null
});

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, '__esModule', { value: true });

var conditional = /*#__PURE__*/ Object.freeze({
  __proto__: null
});

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, '__esModule', { value: true });

var _function = /*#__PURE__*/ Object.freeze({
  __proto__: null
});

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, '__esModule', { value: true });

var json = /*#__PURE__*/ Object.freeze({
  __proto__: null
});

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, '__esModule', { value: true });

var mapped = /*#__PURE__*/ Object.freeze({
  __proto__: null
});

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, '__esModule', { value: true });

var union = /*#__PURE__*/ Object.freeze({
  __proto__: null
});

var require$$0 = /*@__PURE__*/ _commonjsHelpers.getAugmentedNamespace(alias);

var require$$1 = /*@__PURE__*/ _commonjsHelpers.getAugmentedNamespace(collection);

var require$$2 = /*@__PURE__*/ _commonjsHelpers.getAugmentedNamespace(conditional);

var require$$3 = /*@__PURE__*/ _commonjsHelpers.getAugmentedNamespace(_function);

var require$$4 = /*@__PURE__*/ _commonjsHelpers.getAugmentedNamespace(json);

var require$$5 = /*@__PURE__*/ _commonjsHelpers.getAugmentedNamespace(mapped);

var require$$6 = /*@__PURE__*/ _commonjsHelpers.getAugmentedNamespace(union);

var types = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  var __createBinding =
    (_commonjsHelpers.commonjsGlobal && _commonjsHelpers.commonjsGlobal.__createBinding) ||
    (Object.create
      ? function(o, m, k, k2) {
          if (k2 === undefined) k2 = k;
          Object.defineProperty(o, k2, {
            enumerable: true,
            get: function() {
              return m[k];
            }
          });
        }
      : function(o, m, k, k2) {
          if (k2 === undefined) k2 = k;
          o[k2] = m[k];
        });
  var __exportStar =
    (_commonjsHelpers.commonjsGlobal && _commonjsHelpers.commonjsGlobal.__exportStar) ||
    function(m, exports) {
      for (var p in m)
        if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
    };
  Object.defineProperty(exports, '__esModule', { value: true });
  __exportStar(require$$0, exports);
  __exportStar(require$$1, exports);
  __exportStar(require$$2, exports);
  __exportStar(require$$3, exports);
  __exportStar(require$$4, exports);
  __exportStar(require$$5, exports);
  __exportStar(require$$6, exports);
});

var lib = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  var __createBinding =
    (_commonjsHelpers.commonjsGlobal && _commonjsHelpers.commonjsGlobal.__createBinding) ||
    (Object.create
      ? function(o, m, k, k2) {
          if (k2 === undefined) k2 = k;
          Object.defineProperty(o, k2, {
            enumerable: true,
            get: function() {
              return m[k];
            }
          });
        }
      : function(o, m, k, k2) {
          if (k2 === undefined) k2 = k;
          o[k2] = m[k];
        });
  var __exportStar =
    (_commonjsHelpers.commonjsGlobal && _commonjsHelpers.commonjsGlobal.__exportStar) ||
    function(m, exports) {
      for (var p in m)
        if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
    };
  Object.defineProperty(exports, '__esModule', { value: true });
  __exportStar(narrowing, exports);
  __exportStar(types, exports);
});

var errors$1 = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.InvalidDefaultEnvValueError = exports.JsonDataFormatError = exports.JsonStringifyError = exports.JsonParseError = exports.NamedError = void 0;
  class NamedError extends Error {
    constructor(name, messageOrCause, cause) {
      if (typeof messageOrCause === 'string') {
        super(messageOrCause);
        this.cause = cause;
      } else {
        super();
        this.cause = messageOrCause;
      }
      this.name = name;
    }
    get fullStack() {
      var _a, _b;
      let stack = this.stack;
      const causedStack =
        ((_a = this.cause) === null || _a === void 0 ? void 0 : _a.fullStack) ||
        ((_b = this.cause) === null || _b === void 0 ? void 0 : _b.stack);
      if (causedStack) {
        stack = `${stack ? stack + '\n' : ''}Caused by: ${causedStack}`;
      }
      return stack;
    }
  }
  exports.NamedError = NamedError;
  class JsonParseError extends NamedError {
    constructor(cause, path, line, errorPortion) {
      super('JsonParseError', JsonParseError.format(cause, path, line, errorPortion), cause);
      this.path = path;
      this.line = line;
      this.errorPortion = errorPortion;
    }
    /**
     * Creates a `JsonParseError` from a `SyntaxError` thrown during JSON parsing.
     *
     * @param error The `SyntaxError` to convert to a `JsonParseError`.
     * @param data The data input that caused the error.
     * @param jsonPath The path from which the data was read, if known.
     */
    static create(error, data, jsonPath) {
      // Get the position of the error from the error message. This is the error index
      // within the file contents as 1 long string.
      const positionMatch = /position (\d+)/.exec(error.message);
      if (!positionMatch) {
        return new JsonParseError(error, jsonPath);
      }
      const errPosition = parseInt(positionMatch[1], 10);
      // Get a buffered error portion to display.
      const BUFFER = 20;
      const start = Math.max(0, errPosition - BUFFER);
      const end = Math.min(data.length, errPosition + BUFFER);
      const errorPortion = data.slice(start, end);
      // Only need to count new lines before the error position.
      const lineNumber = data.slice(0, errPosition).split('\n').length;
      return new JsonParseError(error, jsonPath, lineNumber, errorPortion);
    }
    static format(cause, path, line, errorPortion) {
      if (line == null) return cause.message || 'Unknown cause';
      return `Parse error in file ${path || 'unknown'} on line ${line}\n${errorPortion || cause.message}`;
    }
  }
  exports.JsonParseError = JsonParseError;
  class JsonStringifyError extends NamedError {
    constructor(cause) {
      super('JsonStringifyError', cause);
    }
  }
  exports.JsonStringifyError = JsonStringifyError;
  class JsonDataFormatError extends NamedError {
    constructor(message) {
      super('JsonDataFormatError', message);
    }
  }
  exports.JsonDataFormatError = JsonDataFormatError;
  class InvalidDefaultEnvValueError extends NamedError {
    constructor(message) {
      super('InvalidDefaultEnvValueError', message);
    }
  }
  exports.InvalidDefaultEnvValueError = InvalidDefaultEnvValueError;
});

/**
 * @license
 * Lodash (Custom Build) lodash.com/license | Underscore.js 1.8.3 underscorejs.org/LICENSE
 * Build: `lodash exports="node" include="defaults,findKey,keyBy,includes,mapKeys,minBy,maxBy,merge,omit,once,set,sortBy,toNumber" -o vendor/lodash.js`
 */

var lodash = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  (function() {
    function t(t, e, n) {
      switch (n.length) {
        case 0:
          return t.call(e);
        case 1:
          return t.call(e, n[0]);
        case 2:
          return t.call(e, n[0], n[1]);
        case 3:
          return t.call(e, n[0], n[1], n[2]);
      }
      return t.apply(e, n);
    }
    function e(t, e, n, r) {
      for (var o = -1, u = null == t ? 0 : t.length; ++o < u; ) {
        var c = t[o];
        e(r, c, n(c), t);
      }
      return r;
    }
    function n(t, e) {
      for (var n = -1, r = null == t ? 0 : t.length; ++n < r && false !== e(t[n], n, t); );
    }
    function r(t, e) {
      for (var n = -1, r = null == t ? 0 : t.length, o = 0, u = []; ++n < r; ) {
        var c = t[n];
        e(c, n, t) && (u[o++] = c);
      }
      return u;
    }
    function o(t, e) {
      for (var n = -1, r = null == t ? 0 : t.length, o = Array(r); ++n < r; ) o[n] = e(t[n], n, t);
      return o;
    }
    function u(t, e) {
      for (var n = -1, r = e.length, o = t.length; ++n < r; ) t[o + n] = e[n];
      return t;
    }
    function c(t, e) {
      for (var n = -1, r = null == t ? 0 : t.length; ++n < r; ) if (e(t[n], n, t)) return true;
      return false;
    }
    function i(t, e, n) {
      var r;
      return (
        n(t, function(t, n, o) {
          if (e(t, n, o)) return (r = n), false;
        }),
        r
      );
    }
    function a(t) {
      return function(e) {
        return null == e ? ue : e[t];
      };
    }
    function f(t, e) {
      var n = t.length;
      for (t.sort(e); n--; ) t[n] = t[n].c;
      return t;
    }
    function l(t) {
      return function(e) {
        return t(e);
      };
    }
    function s(t, e) {
      return o(e, function(e) {
        return t[e];
      });
    }
    function b(t) {
      var e = -1,
        n = Array(t.size);
      return (
        t.forEach(function(t, r) {
          n[++e] = [r, t];
        }),
        n
      );
    }
    function h(t) {
      var e = Object;
      return function(n) {
        return t(e(n));
      };
    }
    function p(t) {
      var e = -1,
        n = Array(t.size);
      return (
        t.forEach(function(t) {
          n[++e] = t;
        }),
        n
      );
    }
    function y() {}
    function j(t) {
      var e = -1,
        n = null == t ? 0 : t.length;
      for (this.clear(); ++e < n; ) {
        var r = t[e];
        this.set(r[0], r[1]);
      }
    }
    function v(t) {
      var e = -1,
        n = null == t ? 0 : t.length;
      for (this.clear(); ++e < n; ) {
        var r = t[e];
        this.set(r[0], r[1]);
      }
    }
    function _(t) {
      var e = -1,
        n = null == t ? 0 : t.length;
      for (this.clear(); ++e < n; ) {
        var r = t[e];
        this.set(r[0], r[1]);
      }
    }
    function g(t) {
      var e = -1,
        n = null == t ? 0 : t.length;
      for (this.__data__ = new _(); ++e < n; ) this.add(t[e]);
    }
    function d(t) {
      this.size = (this.__data__ = new v(t)).size;
    }
    function A(t, e) {
      var n = In(t),
        r = !n && Fn(t),
        o = !n && !r && Bn(t),
        u = !n && !r && !o && Un(t);
      if ((n = n || r || o || u)) {
        for (var r = t.length, c = String, i = -1, a = Array(r); ++i < r; ) a[i] = c(i);
        r = a;
      } else r = [];
      var f,
        c = r.length;
      for (f in t)
        (!e && !Pe.call(t, f)) ||
          (n &&
            ('length' == f ||
              (o && ('offset' == f || 'parent' == f)) ||
              (u && ('buffer' == f || 'byteLength' == f || 'byteOffset' == f)) ||
              At(f, c))) ||
          r.push(f);
      return r;
    }
    function w(t, e, n) {
      ((n === ue || Mt(t[e], n)) && (n !== ue || e in t)) || x(t, e, n);
    }
    function m(t, e, n) {
      var r = t[e];
      (Pe.call(t, e) && Mt(r, n) && (n !== ue || e in t)) || x(t, e, n);
    }
    function O(t, e) {
      for (var n = t.length; n--; ) if (Mt(t[n][0], e)) return n;
      return -1;
    }
    function S(t, e, n, r) {
      return (
        dn(t, function(t, o, u) {
          e(r, t, n(t), u);
        }),
        r
      );
    }
    function k(t, e) {
      return t && ut(e, Qt(e), t);
    }
    function z(t, e) {
      return t && ut(e, Xt(e), t);
    }
    function x(t, e, n) {
      '__proto__' == e && Ye
        ? Ye(t, e, { configurable: true, enumerable: true, value: n, writable: true })
        : (t[e] = n);
    }
    function E(t, e, r, o, u, c) {
      var i,
        a = 1 & e,
        f = 2 & e,
        l = 4 & e;
      if ((r && (i = u ? r(t, o, u, c) : r(t)), i !== ue)) return i;
      if (!Lt(t)) return t;
      if ((o = In(t))) {
        if (((i = vt(t)), !a)) return ot(t, i);
      } else {
        var s = Sn(t),
          b = '[object Function]' == s || '[object GeneratorFunction]' == s;
        if (Bn(t)) return et(t, a);
        if ('[object Object]' == s || '[object Arguments]' == s || (b && !u)) {
          if (((i = f || b ? {} : _t(t)), !a)) return f ? it(t, z(i, t)) : ct(t, k(i, t));
        } else {
          if (!de[s]) return u ? t : {};
          i = gt(t, s, a);
        }
      }
      if ((c || (c = new d()), (u = c.get(t)))) return u;
      if ((c.set(t, i), $n(t)))
        return (
          t.forEach(function(n) {
            i.add(E(n, e, r, n, t, c));
          }),
          i
        );
      if (Mn(t))
        return (
          t.forEach(function(n, o) {
            i.set(o, E(n, e, r, o, t, c));
          }),
          i
        );
      var f = l ? (f ? bt : st) : f ? Xt : Qt,
        h = o ? ue : f(t);
      return (
        n(h || t, function(n, o) {
          h && ((o = n), (n = t[o])), m(i, o, E(n, e, r, o, t, c));
        }),
        i
      );
    }
    function F(t, e, n) {
      for (var r = -1, o = t.length; ++r < o; ) {
        var u = t[r],
          c = e(u);
        if (null != c && (i === ue ? c === c && !Vt(c) : n(c, i)))
          var i = c,
            a = u;
      }
      return a;
    }
    function I(t, e, n, r, o) {
      var c = -1,
        i = t.length;
      for (n || (n = dt), o || (o = []); ++c < i; ) {
        var a = t[c];
        0 < e && n(a) ? (1 < e ? I(a, e - 1, n, r, o) : u(o, a)) : r || (o[o.length] = a);
      }
      return o;
    }
    function B(t, e) {
      return t && An(t, e, Qt);
    }
    function M(t, e) {
      e = tt(e, t);
      for (var n = 0, r = e.length; null != t && n < r; ) t = t[zt(e[n++])];
      return n && n == r ? t : ue;
    }
    function $(t, e, n) {
      return (e = e(t)), In(t) ? e : u(e, n(t));
    }
    function U(t) {
      if (null == t) t = t === ue ? '[object Undefined]' : '[object Null]';
      else if (Xe && Xe in Object(t)) {
        var e = Pe.call(t, Xe),
          n = t[Xe];
        try {
          t[Xe] = ue;
          var r = true;
        } catch (t) {}
        var o = Ne.call(t);
        r && (e ? (t[Xe] = n) : delete t[Xe]), (t = o);
      } else t = Ne.call(t);
      return t;
    }
    function D(t, e) {
      return t > e;
    }
    function P(t) {
      return Nt(t) && '[object Arguments]' == U(t);
    }
    function L(t, e, n, r, o) {
      if (t === e) e = true;
      else if (null == t || null == e || (!Nt(t) && !Nt(e))) e = t !== t && e !== e;
      else
        t: {
          var u = In(t),
            c = In(e),
            i = u ? '[object Array]' : Sn(t),
            a = c ? '[object Array]' : Sn(e),
            i = '[object Arguments]' == i ? '[object Object]' : i,
            a = '[object Arguments]' == a ? '[object Object]' : a,
            f = '[object Object]' == i,
            c = '[object Object]' == a;
          if ((a = i == a) && Bn(t)) {
            if (!Bn(e)) {
              e = false;
              break t;
            }
            (u = true), (f = false);
          }
          if (a && !f) o || (o = new d()), (e = u || Un(t) ? ft(t, e, n, r, L, o) : lt(t, e, i, n, r, L, o));
          else {
            if (!(1 & n) && ((u = f && Pe.call(t, '__wrapped__')), (i = c && Pe.call(e, '__wrapped__')), u || i)) {
              (t = u ? t.value() : t), (e = i ? e.value() : e), o || (o = new d()), (e = L(t, e, n, r, o));
              break t;
            }
            if (a)
              e: if ((o || (o = new d()), (u = 1 & n), (i = st(t)), (c = i.length), (a = st(e).length), c == a || u)) {
                for (f = c; f--; ) {
                  var l = i[f];
                  if (!(u ? l in e : Pe.call(e, l))) {
                    e = false;
                    break e;
                  }
                }
                if ((a = o.get(t)) && o.get(e)) e = a == e;
                else {
                  (a = true), o.set(t, e), o.set(e, t);
                  for (var s = u; ++f < c; ) {
                    var l = i[f],
                      b = t[l],
                      h = e[l];
                    if (r) var p = u ? r(h, b, l, e, t, o) : r(b, h, l, t, e, o);
                    if (p === ue ? b !== h && !L(b, h, n, r, o) : !p) {
                      a = false;
                      break;
                    }
                    s || (s = 'constructor' == l);
                  }
                  a &&
                    !s &&
                    ((n = t.constructor),
                    (r = e.constructor),
                    n != r &&
                      'constructor' in t &&
                      'constructor' in e &&
                      !(typeof n == 'function' && n instanceof n && typeof r == 'function' && r instanceof r) &&
                      (a = false)),
                    o.delete(t),
                    o.delete(e),
                    (e = a);
                }
              } else e = false;
            else e = false;
          }
        }
      return e;
    }
    function N(t) {
      return Nt(t) && '[object Map]' == Sn(t);
    }
    function C(t, e) {
      var n = e.length,
        r = n;
      if (null == t) return !r;
      for (t = Object(t); n--; ) {
        var o = e[n];
        if (o[2] ? o[1] !== t[o[0]] : !(o[0] in t)) return false;
      }
      for (; ++n < r; ) {
        var o = e[n],
          u = o[0],
          c = t[u],
          i = o[1];
        if (o[2]) {
          if (c === ue && !(u in t)) return false;
        } else if (((o = new d()), !L(i, c, 3, void 0, o))) return false;
      }
      return true;
    }
    function T(t) {
      return Nt(t) && '[object Set]' == Sn(t);
    }
    function V(t) {
      return Nt(t) && Pt(t.length) && !!ge[U(t)];
    }
    function R(t) {
      return typeof t == 'function'
        ? t
        : null == t
        ? te
        : typeof t == 'object'
        ? In(t)
          ? q(t[0], t[1])
          : K(t)
        : ne(t);
    }
    function W(t, e) {
      return t < e;
    }
    function G(t, e) {
      var n = -1,
        r = $t(t) ? Array(t.length) : [];
      return (
        dn(t, function(t, o, u) {
          r[++n] = e(t, o, u);
        }),
        r
      );
    }
    function K(t) {
      var e = yt(t);
      return 1 == e.length && e[0][2]
        ? St(e[0][0], e[0][1])
        : function(n) {
            return n === t || C(n, e);
          };
    }
    function q(t, e) {
      return mt(t) && e === e && !Lt(e)
        ? St(zt(t), e)
        : function(n) {
            var r = Ht(n, t);
            return r === ue && r === e ? Jt(n, t) : L(e, r, 3);
          };
    }
    function H(t, e, n, r, o) {
      t !== e &&
        An(
          e,
          function(u, c) {
            if (Lt(u)) {
              o || (o = new d());
              var i = o,
                a = '__proto__' == c ? ue : t[c],
                f = '__proto__' == c ? ue : e[c],
                l = i.get(f);
              if (l) w(t, c, l);
              else {
                var l = r ? r(a, f, c + '', t, e, i) : ue,
                  s = l === ue;
                if (s) {
                  var b = In(f),
                    h = !b && Bn(f),
                    p = !b && !h && Un(f),
                    l = f;
                  b || h || p
                    ? In(a)
                      ? (l = a)
                      : Ut(a)
                      ? (l = ot(a))
                      : h
                      ? ((s = false), (l = et(f, true)))
                      : p
                      ? ((s = false), (l = rt(f, true)))
                      : (l = [])
                    : Ct(f) || Fn(f)
                    ? ((l = a), Fn(a) ? (l = Kt(a)) : (!Lt(a) || (n && Dt(a))) && (l = _t(f)))
                    : (s = false);
                }
                s && (i.set(f, l), H(l, f, n, r, i), i.delete(f)), w(t, c, l);
              }
            } else (i = r ? r('__proto__' == c ? ue : t[c], u, c + '', t, e, o) : ue), i === ue && (i = u), w(t, c, i);
          },
          Xt
        );
    }
    function J(t, e) {
      var n = [],
        r = -1;
      return (
        (e = o(e.length ? e : [te], l(ht()))),
        f(
          G(t, function(t) {
            return {
              a: o(e, function(e) {
                return e(t);
              }),
              b: ++r,
              c: t
            };
          }),
          function(t, e) {
            var r;
            t: {
              r = -1;
              for (var o = t.a, u = e.a, c = o.length, i = n.length; ++r < c; ) {
                var a;
                e: {
                  a = o[r];
                  var f = u[r];
                  if (a !== f) {
                    var l = a !== ue,
                      s = null === a,
                      b = a === a,
                      h = Vt(a),
                      p = f !== ue,
                      y = null === f,
                      j = f === f,
                      v = Vt(f);
                    if ((!y && !v && !h && a > f) || (h && p && j && !y && !v) || (s && p && j) || (!l && j) || !b) {
                      a = 1;
                      break e;
                    }
                    if ((!s && !h && !v && a < f) || (v && l && b && !s && !h) || (y && l && b) || (!p && b) || !j) {
                      a = -1;
                      break e;
                    }
                  }
                  a = 0;
                }
                if (a) {
                  r = r >= i ? a : a * ('desc' == n[r] ? -1 : 1);
                  break t;
                }
              }
              r = t.b - e.b;
            }
            return r;
          }
        )
      );
    }
    function Q(t) {
      return function(e) {
        return M(e, t);
      };
    }
    function X(t) {
      return kn(kt(t, void 0, te), t + '');
    }
    function Y(t) {
      if (typeof t == 'string') return t;
      if (In(t)) return o(t, Y) + '';
      if (Vt(t)) return _n ? _n.call(t) : '';
      var e = t + '';
      return '0' == e && 1 / t == -ce ? '-0' : e;
    }
    function Z(t, e) {
      e = tt(e, t);
      var n;
      if (2 > e.length) n = t;
      else {
        n = e;
        var r = 0,
          o = -1,
          u = -1,
          c = n.length;
        for (
          0 > r && (r = -r > c ? 0 : c + r),
            o = o > c ? c : o,
            0 > o && (o += c),
            c = r > o ? 0 : (o - r) >>> 0,
            r >>>= 0,
            o = Array(c);
          ++u < c;

        )
          o[u] = n[u + r];
        n = M(t, o);
      }
      (t = n), null == t || delete t[zt(Ft(e))];
    }
    function tt(t, e) {
      return In(t) ? t : mt(t, e) ? [t] : zn(qt(t));
    }
    function et(t, e) {
      if (e) return t.slice();
      var n = t.length,
        n = Ge ? Ge(n) : new t.constructor(n);
      return t.copy(n), n;
    }
    function nt(t) {
      var e = new t.constructor(t.byteLength);
      return new We(e).set(new We(t)), e;
    }
    function rt(t, e) {
      return new t.constructor(e ? nt(t.buffer) : t.buffer, t.byteOffset, t.length);
    }
    function ot(t, e) {
      var n = -1,
        r = t.length;
      for (e || (e = Array(r)); ++n < r; ) e[n] = t[n];
      return e;
    }
    function ut(t, e, n) {
      var r = !n;
      n || (n = {});
      for (var o = -1, u = e.length; ++o < u; ) {
        var c = e[o],
          i = ue;
        i === ue && (i = t[c]), r ? x(n, c, i) : m(n, c, i);
      }
      return n;
    }
    function ct(t, e) {
      return ut(t, mn(t), e);
    }
    function it(t, e) {
      return ut(t, On(t), e);
    }
    function at(t) {
      return Ct(t) ? ue : t;
    }
    function ft(t, e, n, r, o, u) {
      var i = 1 & n,
        a = t.length,
        f = e.length;
      if (a != f && !(i && f > a)) return false;
      if ((f = u.get(t)) && u.get(e)) return f == e;
      var f = -1,
        l = true,
        s = 2 & n ? new g() : ue;
      for (u.set(t, e), u.set(e, t); ++f < a; ) {
        var b = t[f],
          h = e[f];
        if (r) var p = i ? r(h, b, f, e, t, u) : r(b, h, f, t, e, u);
        if (p !== ue) {
          if (p) continue;
          l = false;
          break;
        }
        if (s) {
          if (
            !c(e, function(t, e) {
              if (!s.has(e) && (b === t || o(b, t, n, r, u))) return s.push(e);
            })
          ) {
            l = false;
            break;
          }
        } else if (b !== h && !o(b, h, n, r, u)) {
          l = false;
          break;
        }
      }
      return u.delete(t), u.delete(e), l;
    }
    function lt(t, e, n, r, o, u, c) {
      switch (n) {
        case '[object DataView]':
          if (t.byteLength != e.byteLength || t.byteOffset != e.byteOffset) break;
          (t = t.buffer), (e = e.buffer);
        case '[object ArrayBuffer]':
          if (t.byteLength != e.byteLength || !u(new We(t), new We(e))) break;
          return true;
        case '[object Boolean]':
        case '[object Date]':
        case '[object Number]':
          return Mt(+t, +e);
        case '[object Error]':
          return t.name == e.name && t.message == e.message;
        case '[object RegExp]':
        case '[object String]':
          return t == e + '';
        case '[object Map]':
          var i = b;
        case '[object Set]':
          if ((i || (i = p), t.size != e.size && !(1 & r))) break;
          return (n = c.get(t)) ? n == e : ((r |= 2), c.set(t, e), (e = ft(i(t), i(e), r, o, u, c)), c.delete(t), e);
        case '[object Symbol]':
          if (vn) return vn.call(t) == vn.call(e);
      }
      return false;
    }
    function st(t) {
      return $(t, Qt, mn);
    }
    function bt(t) {
      return $(t, Xt, On);
    }
    function ht() {
      var t = y.iteratee || ee,
        t = t === ee ? R : t;
      return arguments.length ? t(arguments[0], arguments[1]) : t;
    }
    function pt(t, e) {
      var n = t.__data__,
        r = typeof e;
      return ('string' == r || 'number' == r || 'symbol' == r || 'boolean' == r
      ? '__proto__' !== e
      : null === e)
        ? n[typeof e == 'string' ? 'string' : 'hash']
        : n.map;
    }
    function yt(t) {
      for (var e = Qt(t), n = e.length; n--; ) {
        var r = e[n],
          o = t[r];
        e[n] = [r, o, o === o && !Lt(o)];
      }
      return e;
    }
    function jt(t, e) {
      var n = null == t ? ue : t[e];
      return (!Lt(n) || (Le && Le in n) ? 0 : (Dt(n) ? Te : je).test(xt(n))) ? n : ue;
    }
    function vt(t) {
      var e = t.length,
        n = new t.constructor(e);
      return e && 'string' == typeof t[0] && Pe.call(t, 'index') && ((n.index = t.index), (n.input = t.input)), n;
    }
    function _t(t) {
      return typeof t.constructor != 'function' || Ot(t) ? {} : gn(Ke(t));
    }
    function gt(t, e, n) {
      var r = t.constructor;
      switch (e) {
        case '[object ArrayBuffer]':
          return nt(t);
        case '[object Boolean]':
        case '[object Date]':
          return new r(+t);
        case '[object DataView]':
          return (e = n ? nt(t.buffer) : t.buffer), new t.constructor(e, t.byteOffset, t.byteLength);
        case '[object Float32Array]':
        case '[object Float64Array]':
        case '[object Int8Array]':
        case '[object Int16Array]':
        case '[object Int32Array]':
        case '[object Uint8Array]':
        case '[object Uint8ClampedArray]':
        case '[object Uint16Array]':
        case '[object Uint32Array]':
          return rt(t, n);
        case '[object Map]':
          return new r();
        case '[object Number]':
        case '[object String]':
          return new r(t);
        case '[object RegExp]':
          return (e = new t.constructor(t.source, he.exec(t))), (e.lastIndex = t.lastIndex), e;
        case '[object Set]':
          return new r();
        case '[object Symbol]':
          return vn ? Object(vn.call(t)) : {};
      }
    }
    function dt(t) {
      return In(t) || Fn(t) || !!(Qe && t && t[Qe]);
    }
    function At(t, e) {
      var n = typeof t;
      return (
        (e = null == e ? 9007199254740991 : e),
        !!e && ('number' == n || ('symbol' != n && _e.test(t))) && -1 < t && 0 == t % 1 && t < e
      );
    }
    function wt(t, e, n) {
      if (!Lt(n)) return false;
      var r = typeof e;
      return !!('number' == r ? $t(n) && At(e, n.length) : 'string' == r && e in n) && Mt(n[e], t);
    }
    function mt(t, e) {
      if (In(t)) return false;
      var n = typeof t;
      return (
        !('number' != n && 'symbol' != n && 'boolean' != n && null != t && !Vt(t)) ||
        (fe.test(t) || !ae.test(t) || (null != e && t in Object(e)))
      );
    }
    function Ot(t) {
      var e = t && t.constructor;
      return t === ((typeof e == 'function' && e.prototype) || $e);
    }
    function St(t, e) {
      return function(n) {
        return null != n && (n[t] === e && (e !== ue || t in Object(n)));
      };
    }
    function kt(e, n, r) {
      return (
        (n = nn(n === ue ? e.length - 1 : n, 0)),
        function() {
          for (var o = arguments, u = -1, c = nn(o.length - n, 0), i = Array(c); ++u < c; ) i[u] = o[n + u];
          for (u = -1, c = Array(n + 1); ++u < n; ) c[u] = o[u];
          return (c[n] = r(i)), t(e, this, c);
        }
      );
    }
    function zt(t) {
      if (typeof t == 'string' || Vt(t)) return t;
      var e = t + '';
      return '0' == e && 1 / t == -ce ? '-0' : e;
    }
    function xt(t) {
      if (null != t) {
        try {
          return De.call(t);
        } catch (t) {}
        return t + '';
      }
      return '';
    }
    function Et(t) {
      return (null == t ? 0 : t.length) ? I(t, 1) : [];
    }
    function Ft(t) {
      var e = null == t ? 0 : t.length;
      return e ? t[e - 1] : ue;
    }
    function It(t, e) {
      var n;
      if (typeof e != 'function') throw new TypeError('Expected a function');
      return (
        (t = Wt(t)),
        function() {
          return 0 < --t && (n = e.apply(this, arguments)), 1 >= t && (e = ue), n;
        }
      );
    }
    function Bt(t, e) {
      function n() {
        var r = arguments,
          o = e ? e.apply(this, r) : r[0],
          u = n.cache;
        return u.has(o) ? u.get(o) : ((r = t.apply(this, r)), (n.cache = u.set(o, r) || u), r);
      }
      if (typeof t != 'function' || (null != e && typeof e != 'function')) throw new TypeError('Expected a function');
      return (n.cache = new (Bt.Cache || _)()), n;
    }
    function Mt(t, e) {
      return t === e || (t !== t && e !== e);
    }
    function $t(t) {
      return null != t && Pt(t.length) && !Dt(t);
    }
    function Ut(t) {
      return Nt(t) && $t(t);
    }
    function Dt(t) {
      return (
        !!Lt(t) &&
        ((t = U(t)),
        '[object Function]' == t ||
          '[object GeneratorFunction]' == t ||
          '[object AsyncFunction]' == t ||
          '[object Proxy]' == t)
      );
    }
    function Pt(t) {
      return typeof t == 'number' && -1 < t && 0 == t % 1 && 9007199254740991 >= t;
    }
    function Lt(t) {
      var e = typeof t;
      return null != t && ('object' == e || 'function' == e);
    }
    function Nt(t) {
      return null != t && typeof t == 'object';
    }
    function Ct(t) {
      return (
        !(!Nt(t) || '[object Object]' != U(t)) &&
        ((t = Ke(t)),
        null === t ||
          ((t = Pe.call(t, 'constructor') && t.constructor),
          typeof t == 'function' && t instanceof t && De.call(t) == Ce))
      );
    }
    function Tt(t) {
      return typeof t == 'string' || (!In(t) && Nt(t) && '[object String]' == U(t));
    }
    function Vt(t) {
      return typeof t == 'symbol' || (Nt(t) && '[object Symbol]' == U(t));
    }
    function Rt(t) {
      return t
        ? ((t = Gt(t)), t === ce || t === -ce ? 1.7976931348623157e308 * (0 > t ? -1 : 1) : t === t ? t : 0)
        : 0 === t
        ? t
        : 0;
    }
    function Wt(t) {
      t = Rt(t);
      var e = t % 1;
      return t === t ? (e ? t - e : t) : 0;
    }
    function Gt(t) {
      if (typeof t == 'number') return t;
      if (Vt(t)) return ie;
      if (
        (Lt(t) && ((t = typeof t.valueOf == 'function' ? t.valueOf() : t), (t = Lt(t) ? t + '' : t)),
        typeof t != 'string')
      )
        return 0 === t ? t : +t;
      t = t.replace(se, '');
      var e = ye.test(t);
      return e || ve.test(t) ? we(t.slice(2), e ? 2 : 8) : pe.test(t) ? ie : +t;
    }
    function Kt(t) {
      return ut(t, Xt(t));
    }
    function qt(t) {
      return null == t ? '' : Y(t);
    }
    function Ht(t, e, n) {
      return (t = null == t ? ue : M(t, e)), t === ue ? n : t;
    }
    function Jt(t, e) {
      var n;
      if ((n = null != t)) {
        n = t;
        var r;
        r = tt(e, n);
        for (var o = -1, u = r.length, c = false; ++o < u; ) {
          var i = zt(r[o]);
          if (!(c = null != n && null != n && i in Object(n))) break;
          n = n[i];
        }
        c || ++o != u ? (n = c) : ((u = null == n ? 0 : n.length), (n = !!u && Pt(u) && At(i, u) && (In(n) || Fn(n))));
      }
      return n;
    }
    function Qt(t) {
      if ($t(t)) t = A(t);
      else if (Ot(t)) {
        var e,
          n = [];
        for (e in Object(t)) Pe.call(t, e) && 'constructor' != e && n.push(e);
        t = n;
      } else t = en(t);
      return t;
    }
    function Xt(t) {
      if ($t(t)) t = A(t, true);
      else if (Lt(t)) {
        var e,
          n = Ot(t),
          r = [];
        for (e in t) ('constructor' != e || (!n && Pe.call(t, e))) && r.push(e);
        t = r;
      } else {
        if (((e = []), null != t)) for (n in Object(t)) e.push(n);
        t = e;
      }
      return t;
    }
    function Yt(t) {
      return null == t ? [] : s(t, Qt(t));
    }
    function Zt(t) {
      return function() {
        return t;
      };
    }
    function te(t) {
      return t;
    }
    function ee(t) {
      return R(typeof t == 'function' ? t : E(t, 1));
    }
    function ne(t) {
      return mt(t) ? a(zt(t)) : Q(t);
    }
    function re() {
      return [];
    }
    function oe() {
      return false;
    }
    var ue,
      ce = 1 / 0,
      ie = NaN,
      ae = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
      fe = /^\w*$/,
      le = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
      se = /^\s+|\s+$/g,
      be = /\\(\\)?/g,
      he = /\w*$/,
      pe = /^[-+]0x[0-9a-f]+$/i,
      ye = /^0b[01]+$/i,
      je = /^\[object .+?Constructor\]$/,
      ve = /^0o[0-7]+$/i,
      _e = /^(?:0|[1-9]\d*)$/,
      ge = {};
    (ge['[object Float32Array]'] = ge['[object Float64Array]'] = ge['[object Int8Array]'] = ge[
      '[object Int16Array]'
    ] = ge['[object Int32Array]'] = ge['[object Uint8Array]'] = ge['[object Uint8ClampedArray]'] = ge[
      '[object Uint16Array]'
    ] = ge['[object Uint32Array]'] = true),
      (ge['[object Arguments]'] = ge['[object Array]'] = ge['[object ArrayBuffer]'] = ge['[object Boolean]'] = ge[
        '[object DataView]'
      ] = ge['[object Date]'] = ge['[object Error]'] = ge['[object Function]'] = ge['[object Map]'] = ge[
        '[object Number]'
      ] = ge['[object Object]'] = ge['[object RegExp]'] = ge['[object Set]'] = ge['[object String]'] = ge[
        '[object WeakMap]'
      ] = false);
    var de = {};
    (de['[object Arguments]'] = de['[object Array]'] = de['[object ArrayBuffer]'] = de['[object DataView]'] = de[
      '[object Boolean]'
    ] = de['[object Date]'] = de['[object Float32Array]'] = de['[object Float64Array]'] = de['[object Int8Array]'] = de[
      '[object Int16Array]'
    ] = de['[object Int32Array]'] = de['[object Map]'] = de['[object Number]'] = de['[object Object]'] = de[
      '[object RegExp]'
    ] = de['[object Set]'] = de['[object String]'] = de['[object Symbol]'] = de['[object Uint8Array]'] = de[
      '[object Uint8ClampedArray]'
    ] = de['[object Uint16Array]'] = de['[object Uint32Array]'] = true),
      (de['[object Error]'] = de['[object Function]'] = de['[object WeakMap]'] = false);
    var Ae,
      we = parseInt,
      me =
        typeof _commonjsHelpers.commonjsGlobal == 'object' &&
        _commonjsHelpers.commonjsGlobal &&
        _commonjsHelpers.commonjsGlobal.Object === Object &&
        _commonjsHelpers.commonjsGlobal,
      Oe = typeof self == 'object' && self && self.Object === Object && self,
      Se = me || Oe || Function('return this')(),
      ke = exports && !exports.nodeType && exports,
      ze = ke && 'object' == 'object' && module && !module.nodeType && module,
      xe = ze && ze.exports === ke,
      Ee = xe && me.process;
    t: {
      try {
        Ae = Ee && Ee.binding && Ee.binding('util');
        break t;
      } catch (t) {}
      Ae = void 0;
    }
    var Fe = Ae && Ae.isMap,
      Ie = Ae && Ae.isSet,
      Be = Ae && Ae.isTypedArray,
      Me = Array.prototype,
      $e = Object.prototype,
      Ue = Se['__core-js_shared__'],
      De = Function.prototype.toString,
      Pe = $e.hasOwnProperty,
      Le = (function() {
        var t = /[^.]+$/.exec((Ue && Ue.keys && Ue.keys.IE_PROTO) || '');
        return t ? 'Symbol(src)_1.' + t : '';
      })(),
      Ne = $e.toString,
      Ce = De.call(Object),
      Te = RegExp(
        '^' +
          De.call(Pe)
            .replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
            .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') +
          '$'
      ),
      Ve = xe ? Se.Buffer : ue,
      Re = Se.Symbol,
      We = Se.Uint8Array,
      Ge = Ve ? Ve.f : ue,
      Ke = h(Object.getPrototypeOf),
      qe = Object.create,
      He = $e.propertyIsEnumerable,
      Je = Me.splice,
      Qe = Re ? Re.isConcatSpreadable : ue,
      Xe = Re ? Re.toStringTag : ue,
      Ye = (function() {
        try {
          var t = jt(Object, 'defineProperty');
          return t({}, '', {}), t;
        } catch (t) {}
      })(),
      Ze = Object.getOwnPropertySymbols,
      tn = Ve ? Ve.isBuffer : ue,
      en = h(Object.keys),
      nn = Math.max,
      rn = Date.now,
      on = jt(Se, 'DataView'),
      un = jt(Se, 'Map'),
      cn = jt(Se, 'Promise'),
      an = jt(Se, 'Set'),
      fn = jt(Se, 'WeakMap'),
      ln = jt(Object, 'create'),
      sn = xt(on),
      bn = xt(un),
      hn = xt(cn),
      pn = xt(an),
      yn = xt(fn),
      jn = Re ? Re.prototype : ue,
      vn = jn ? jn.valueOf : ue,
      _n = jn ? jn.toString : ue,
      gn = (function() {
        function t() {}
        return function(e) {
          return Lt(e) ? (qe ? qe(e) : ((t.prototype = e), (e = new t()), (t.prototype = ue), e)) : {};
        };
      })();
    (j.prototype.clear = function() {
      (this.__data__ = ln ? ln(null) : {}), (this.size = 0);
    }),
      (j.prototype.delete = function(t) {
        return (t = this.has(t) && delete this.__data__[t]), (this.size -= t ? 1 : 0), t;
      }),
      (j.prototype.get = function(t) {
        var e = this.__data__;
        return ln ? ((t = e[t]), '__lodash_hash_undefined__' === t ? ue : t) : Pe.call(e, t) ? e[t] : ue;
      }),
      (j.prototype.has = function(t) {
        var e = this.__data__;
        return ln ? e[t] !== ue : Pe.call(e, t);
      }),
      (j.prototype.set = function(t, e) {
        var n = this.__data__;
        return (this.size += this.has(t) ? 0 : 1), (n[t] = ln && e === ue ? '__lodash_hash_undefined__' : e), this;
      }),
      (v.prototype.clear = function() {
        (this.__data__ = []), (this.size = 0);
      }),
      (v.prototype.delete = function(t) {
        var e = this.__data__;
        return (t = O(e, t)), !(0 > t) && (t == e.length - 1 ? e.pop() : Je.call(e, t, 1), --this.size, true);
      }),
      (v.prototype.get = function(t) {
        var e = this.__data__;
        return (t = O(e, t)), 0 > t ? ue : e[t][1];
      }),
      (v.prototype.has = function(t) {
        return -1 < O(this.__data__, t);
      }),
      (v.prototype.set = function(t, e) {
        var n = this.__data__,
          r = O(n, t);
        return 0 > r ? (++this.size, n.push([t, e])) : (n[r][1] = e), this;
      }),
      (_.prototype.clear = function() {
        (this.size = 0), (this.__data__ = { hash: new j(), map: new (un || v)(), string: new j() });
      }),
      (_.prototype.delete = function(t) {
        return (t = pt(this, t).delete(t)), (this.size -= t ? 1 : 0), t;
      }),
      (_.prototype.get = function(t) {
        return pt(this, t).get(t);
      }),
      (_.prototype.has = function(t) {
        return pt(this, t).has(t);
      }),
      (_.prototype.set = function(t, e) {
        var n = pt(this, t),
          r = n.size;
        return n.set(t, e), (this.size += n.size == r ? 0 : 1), this;
      }),
      (g.prototype.add = g.prototype.push = function(t) {
        return this.__data__.set(t, '__lodash_hash_undefined__'), this;
      }),
      (g.prototype.has = function(t) {
        return this.__data__.has(t);
      }),
      (d.prototype.clear = function() {
        (this.__data__ = new v()), (this.size = 0);
      }),
      (d.prototype.delete = function(t) {
        var e = this.__data__;
        return (t = e.delete(t)), (this.size = e.size), t;
      }),
      (d.prototype.get = function(t) {
        return this.__data__.get(t);
      }),
      (d.prototype.has = function(t) {
        return this.__data__.has(t);
      }),
      (d.prototype.set = function(t, e) {
        var n = this.__data__;
        if (n instanceof v) {
          var r = n.__data__;
          if (!un || 199 > r.length) return r.push([t, e]), (this.size = ++n.size), this;
          n = this.__data__ = new _(r);
        }
        return n.set(t, e), (this.size = n.size), this;
      });
    var dn = (function(t, e) {
        return function(n, r) {
          if (null == n) return n;
          if (!$t(n)) return t(n, r);
          for (var o = n.length, u = e ? o : -1, c = Object(n); (e ? u-- : ++u < o) && false !== r(c[u], u, c); );
          return n;
        };
      })(B),
      An = (function(t) {
        return function(e, n, r) {
          var o = -1,
            u = Object(e);
          r = r(e);
          for (var c = r.length; c--; ) {
            var i = r[t ? c : ++o];
            if (false === n(u[i], i, u)) break;
          }
          return e;
        };
      })(),
      wn = Ye
        ? function(t, e) {
            return Ye(t, 'toString', { configurable: true, enumerable: false, value: Zt(e), writable: true });
          }
        : te,
      mn = Ze
        ? function(t) {
            return null == t
              ? []
              : ((t = Object(t)),
                r(Ze(t), function(e) {
                  return He.call(t, e);
                }));
          }
        : re,
      On = Ze
        ? function(t) {
            for (var e = []; t; ) u(e, mn(t)), (t = Ke(t));
            return e;
          }
        : re,
      Sn = U;
    ((on && '[object DataView]' != Sn(new on(new ArrayBuffer(1)))) ||
      (un && '[object Map]' != Sn(new un())) ||
      (cn && '[object Promise]' != Sn(cn.resolve())) ||
      (an && '[object Set]' != Sn(new an())) ||
      (fn && '[object WeakMap]' != Sn(new fn()))) &&
      (Sn = function(t) {
        var e = U(t);
        if ((t = (t = '[object Object]' == e ? t.constructor : ue) ? xt(t) : ''))
          switch (t) {
            case sn:
              return '[object DataView]';
            case bn:
              return '[object Map]';
            case hn:
              return '[object Promise]';
            case pn:
              return '[object Set]';
            case yn:
              return '[object WeakMap]';
          }
        return e;
      });
    var kn = (function(t) {
        var e = 0,
          n = 0;
        return function() {
          var r = rn(),
            o = 16 - (r - n);
          if (((n = r), 0 < o)) {
            if (800 <= ++e) return arguments[0];
          } else e = 0;
          return t.apply(ue, arguments);
        };
      })(wn),
      zn = (function(t) {
        t = Bt(t, function(t) {
          return 500 === e.size && e.clear(), t;
        });
        var e = t.cache;
        return t;
      })(function(t) {
        var e = [];
        return (
          46 === t.charCodeAt(0) && e.push(''),
          t.replace(le, function(t, n, r, o) {
            e.push(r ? o.replace(be, '$1') : n || t);
          }),
          e
        );
      }),
      xn = (function(t, n) {
        return function(r, o) {
          var u = In(r) ? e : S,
            c = n ? n() : {};
          return u(r, t, ht(o, 2), c);
        };
      })(function(t, e, n) {
        x(t, n, e);
      }),
      En = X(function(t, e) {
        if (null == t) return [];
        var n = e.length;
        return 1 < n && wt(t, e[0], e[1]) ? (e = []) : 2 < n && wt(e[0], e[1], e[2]) && (e = [e[0]]), J(t, I(e, 1));
      });
    Bt.Cache = _;
    var Fn = P(
        (function() {
          return arguments;
        })()
      )
        ? P
        : function(t) {
            return Nt(t) && Pe.call(t, 'callee') && !He.call(t, 'callee');
          },
      In = Array.isArray,
      Bn = tn || oe,
      Mn = Fe ? l(Fe) : N,
      $n = Ie ? l(Ie) : T,
      Un = Be ? l(Be) : V,
      Dn = X(function(t, e) {
        t = Object(t);
        var n = -1,
          r = e.length,
          o = 2 < r ? e[2] : ue;
        for (o && wt(e[0], e[1], o) && (r = 1); ++n < r; )
          for (var o = e[n], u = Xt(o), c = -1, i = u.length; ++c < i; ) {
            var a = u[c],
              f = t[a];
            (f === ue || (Mt(f, $e[a]) && !Pe.call(t, a))) && (t[a] = o[a]);
          }
        return t;
      }),
      Pn = (function(t) {
        return X(function(e, n) {
          var r = -1,
            o = n.length,
            u = 1 < o ? n[o - 1] : ue,
            c = 2 < o ? n[2] : ue,
            u = 3 < t.length && typeof u == 'function' ? (o--, u) : ue;
          for (c && wt(n[0], n[1], c) && ((u = 3 > o ? ue : u), (o = 1)), e = Object(e); ++r < o; )
            (c = n[r]) && t(e, c, r, u);
          return e;
        });
      })(function(t, e, n) {
        H(t, e, n);
      }),
      Ln = (function(t) {
        return kn(kt(t, ue, Et), t + '');
      })(function(t, e) {
        var n = {};
        if (null == t) return n;
        var r = false;
        (e = o(e, function(e) {
          return (e = tt(e, t)), r || (r = 1 < e.length), e;
        })),
          ut(t, bt(t), n),
          r && (n = E(n, 7, at));
        for (var u = e.length; u--; ) Z(n, e[u]);
        return n;
      });
    (y.before = It),
      (y.constant = Zt),
      (y.defaults = Dn),
      (y.flatten = Et),
      (y.iteratee = ee),
      (y.keyBy = xn),
      (y.keys = Qt),
      (y.keysIn = Xt),
      (y.mapKeys = function(t, e) {
        var n = {};
        return (
          (e = ht(e, 3)),
          B(t, function(t, r, o) {
            x(n, e(t, r, o), t);
          }),
          n
        );
      }),
      (y.memoize = Bt),
      (y.merge = Pn),
      (y.omit = Ln),
      (y.once = function(t) {
        return It(2, t);
      }),
      (y.property = ne),
      (y.set = function(t, e, n) {
        if (null != t && Lt(t)) {
          e = tt(e, t);
          for (var r = -1, o = e.length, u = o - 1, c = t; null != c && ++r < o; ) {
            var i = zt(e[r]),
              a = n;
            if (r != u) {
              var f = c[i],
                a = ue;
              a === ue && (a = Lt(f) ? f : At(e[r + 1]) ? [] : {});
            }
            m(c, i, a), (c = c[i]);
          }
        }
        return t;
      }),
      (y.sortBy = En),
      (y.toPlainObject = Kt),
      (y.values = Yt),
      (y.eq = Mt),
      (y.findKey = function(t, e) {
        return i(t, ht(e, 3), B);
      }),
      (y.get = Ht),
      (y.hasIn = Jt),
      (y.identity = te),
      (y.includes = function(t, e, n, r) {
        if (((t = $t(t) ? t : Yt(t)), (n = n && !r ? Wt(n) : 0), (r = t.length), 0 > n && (n = nn(r + n, 0)), Tt(t)))
          t = n <= r && -1 < t.indexOf(e, n);
        else {
          if ((r = !!r)) {
            if (e === e)
              t: {
                for (n -= 1, r = t.length; ++n < r; )
                  if (t[n] === e) {
                    t = n;
                    break t;
                  }
                t = -1;
              }
            else
              t: {
                for (e = t.length, n += -1; ++n < e; )
                  if (((r = t[n]), r !== r)) {
                    t = n;
                    break t;
                  }
                t = -1;
              }
            r = -1 < t;
          }
          t = r;
        }
        return t;
      }),
      (y.isArguments = Fn),
      (y.isArray = In),
      (y.isArrayLike = $t),
      (y.isArrayLikeObject = Ut),
      (y.isBuffer = Bn),
      (y.isFunction = Dt),
      (y.isLength = Pt),
      (y.isMap = Mn),
      (y.isObject = Lt),
      (y.isObjectLike = Nt),
      (y.isPlainObject = Ct),
      (y.isSet = $n),
      (y.isString = Tt),
      (y.isSymbol = Vt),
      (y.isTypedArray = Un),
      (y.last = Ft),
      (y.maxBy = function(t, e) {
        return t && t.length ? F(t, ht(e, 2), D) : ue;
      }),
      (y.minBy = function(t, e) {
        return t && t.length ? F(t, ht(e, 2), W) : ue;
      }),
      (y.stubArray = re),
      (y.stubFalse = oe),
      (y.toFinite = Rt),
      (y.toInteger = Wt),
      (y.toNumber = Gt),
      (y.toString = qt),
      (y.VERSION = '4.17.5'),
      ze && (((ze.exports = y)._ = y), (ke._ = y));
  }.call(_commonjsHelpers.commonjsGlobal));
});

var external = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.toNumber = exports.sortBy = exports.set = exports.once = exports.omit = exports.merge = exports.maxBy = exports.minBy = exports.mapKeys = exports.keyBy = exports.includes = exports.findKey = exports.defaults = void 0;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore ignore the demand for typings for the locally built lodash

  // underlying function
  function defaults(obj, ...otherArgs) {
    return lodash.defaults(obj, ...otherArgs);
  }
  exports.defaults = defaults;
  /**
   * This method is like `find` except that it returns the key of the first element predicate returns truthy for
   * instead of the element itself.
   *
   * @param obj The object to search.
   * @param predicate The function invoked per iteration.
   */
  function findKey(obj, predicate) {
    return lodash.findKey(obj, predicate);
  }
  exports.findKey = findKey;
  /**
   * Checks if target is in collection using SameValueZero for equality comparisons. If fromIndex is negative,
   * it’s used as the offset from the end of collection.
   *
   * @param collection The collection to search.
   * @param target The value to search for.
   * @param fromIndex The index to search from.
   */
  function includes(collection, target, fromIndex) {
    return lodash.includes(collection, target, fromIndex);
  }
  exports.includes = includes;
  // underlying function
  function keyBy(collection, iteratee) {
    return lodash.keyBy(collection, iteratee);
  }
  exports.keyBy = keyBy;
  // underlying function
  function mapKeys(obj, iteratee) {
    return lodash.mapKeys(obj, iteratee);
  }
  exports.mapKeys = mapKeys;
  /**
   * This method is like `_.min` except that it accepts `iteratee` which is
   * invoked for each element in `array` to generate the criterion by which
   * the value is ranked. The iteratee is invoked with one argument: (value).
   *
   * @param array The array to iterate over.
   * @param iteratee The iteratee invoked per element.
   */
  function minBy(collection, iteratee) {
    return lodash.minBy(collection, iteratee);
  }
  exports.minBy = minBy;
  /**
   * This method is like `_.max` except that it accepts `iteratee` which is
   * invoked for each element in `array` to generate the criterion by which
   * the value is ranked. The iteratee is invoked with one argument: (value).
   *
   * @param array The array to iterate over.
   * @param iteratee The iteratee invoked per element.
   */
  function maxBy(collection, iteratee) {
    return lodash.maxBy(collection, iteratee);
  }
  exports.maxBy = maxBy;
  // underlying function
  function merge(obj, ...otherArgs) {
    return lodash.merge(obj, ...otherArgs);
  }
  exports.merge = merge;
  // underlying function
  function omit(obj, ...paths) {
    return lodash.omit(obj, ...paths);
  }
  exports.omit = omit;
  /**
   * Creates a function that is restricted to invoking `func` once. Repeat calls to the function return the value
   * of the first call. The `func` is invoked with the this binding and arguments of the created function.
   *
   * @param func The function to restrict.
   */
  function once(func) {
    return lodash.once(func);
  }
  exports.once = once;
  // underlying function
  function set(obj, path, value) {
    return lodash.set(obj, path, value);
  }
  exports.set = set;
  // underlying function
  function sortBy(collection, ...iteratees) {
    return lodash.sortBy(collection, ...iteratees);
  }
  exports.sortBy = sortBy;
  /**
   * Converts `value` to a number.
   *
   * @param value The value to process.
   *
   * ```
   * _.toNumber(3);
   * // => 3
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3');
   * // => 3
   * ```
   */
  function toNumber(value) {
    return lodash.toNumber(value);
  }
  exports.toNumber = toNumber;
});

var internal$1 = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.upperFirst = exports.snakeCase = exports.lowerFirst = exports.isEmpty = void 0;

  /**
   * Checks if value is empty. A value is considered empty unless it’s an arguments object, array, string, or
   * jQuery-like collection with a length greater than 0 or an object with own enumerable properties.
   *
   * @param value The value to inspect.
   */
  function isEmpty(value) {
    if (value == null) return true;
    if (lib.isNumber(value)) return false;
    if (lib.isBoolean(value)) return false;
    if (lib.isArrayLike(value) && value.length > 0) return false;
    if (lib.hasNumber(value, 'size') && value.size > 0) return false;
    if (lib.isObject(value) && Object.keys(value).length > 0) return false;
    return true;
  }
  exports.isEmpty = isEmpty;
  // underlying function
  function lowerFirst(value) {
    return value && value.charAt(0).toLowerCase() + value.slice(1);
  }
  exports.lowerFirst = lowerFirst;
  // underlying function
  function snakeCase(str) {
    return (
      str &&
      str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .toLowerCase()
        .replace(/\W/g, '_')
        .replace(/^_+|_+$/g, '')
    );
  }
  exports.snakeCase = snakeCase;
  // underlying function
  function upperFirst(value) {
    return value && value.charAt(0).toUpperCase() + value.slice(1);
  }
  exports.upperFirst = upperFirst;
});

var nodash = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  var __createBinding =
    (_commonjsHelpers.commonjsGlobal && _commonjsHelpers.commonjsGlobal.__createBinding) ||
    (Object.create
      ? function(o, m, k, k2) {
          if (k2 === undefined) k2 = k;
          Object.defineProperty(o, k2, {
            enumerable: true,
            get: function() {
              return m[k];
            }
          });
        }
      : function(o, m, k, k2) {
          if (k2 === undefined) k2 = k;
          o[k2] = m[k];
        });
  var __exportStar =
    (_commonjsHelpers.commonjsGlobal && _commonjsHelpers.commonjsGlobal.__exportStar) ||
    function(m, exports) {
      for (var p in m)
        if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
    };
  Object.defineProperty(exports, '__esModule', { value: true });
  __exportStar(external, exports);
  __exportStar(internal$1, exports);
});

var env = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.env = exports.Env = void 0;

  /**
   * An injectable abstraction on top of `process.env` with various convenience functions
   * for accessing environment variables of different anticipated shapes.
   */
  class Env {
    constructor(store = (process && process.env) || {}) {
      this.store = store;
      this.store = store;
    }
    // underlying method
    getString(key, def) {
      return this.store[key] || def;
    }
    // underlying method
    getStringIn(key, values, def) {
      const re = new RegExp(values.join('|'), 'i');
      if (def && !re.test(def.toString())) {
        const valueAsString = values.join(', ');
        throw new errors$1.InvalidDefaultEnvValueError(`${def} is not a member of ${valueAsString}`);
      }
      const value = this.getString(key);
      if (!value) return def;
      return re.test(value) ? value : def;
    }
    // underlying method
    getKeyOf(key, obj, defOrTransform, transform) {
      let value;
      let def;
      if (typeof defOrTransform === 'function') {
        transform = defOrTransform;
      } else {
        def = defOrTransform;
      }
      if (def === undefined) {
        value = this.getStringIn(key, Object.keys(obj));
      } else {
        if (transform) def = transform(def);
        value = this.getStringIn(key, Object.keys(obj), def);
      }
      if (!value) return;
      if (typeof transform === 'function') value = transform(value);
      if (lib.isKeyOf(obj, value)) return value;
    }
    /**
     * Sets a `string` value for a given key, or removes the current value when no value is given.
     *
     * @param key The name of the envar.
     * @param value The value to set.
     */
    setString(key, value) {
      if (value == null) {
        this.unset(key);
        return;
      }
      this.store[key] = value;
    }
    // underlying method
    getList(key, def) {
      const value = this.getString(key);
      return value ? value.split(',') : def;
    }
    /**
     * Sets a `string` value from a list for a given key by joining values with a `,` into a raw `string` value,
     * or removes the current value when no value is given.
     *
     * @param key The name of the envar.
     * @param values The values to set.
     */
    setList(key, values) {
      if (values == null) {
        this.unset(key);
        return;
      }
      this.setString(key, values.join(','));
    }
    /**
     * Gets a `boolean` value for a given key. Returns the default value if no value was found.
     *
     * @param key The name of the envar.
     * @param def A default boolean, which itself defaults to `false` if not otherwise supplied.
     */
    getBoolean(key, def = false) {
      const value = this.getString(key, def.toString());
      return value.toLowerCase() === 'true' || value === '1';
    }
    /**
     * Sets a `boolean` value for a given key, or removes the current value when no value is given.
     *
     * @param key The name of the envar.
     * @param value The value to set.
     */
    setBoolean(key, value) {
      if (value == null) {
        this.unset(key);
        return;
      }
      this.setString(key, value.toString());
    }
    /**
     * Gets a `number` value for a given key. Returns the default value if no value was found.
     *
     * @param key The name of the envar.
     * @param def A default number, which itself defaults to `undefined` if not otherwise supplied.
     */
    getNumber(key, def) {
      const value = this.getString(key);
      if (value) {
        const num = nodash.toNumber(value);
        return isNaN(num) && lib.isNumber(def) ? def : num;
      }
      return lib.isNumber(def) ? def : undefined;
    }
    /**
     * Sets a `number` value for a given key, or removes the current value when no value is given.
     *
     * @param key The name of the envar.
     * @param value The value to set.
     */
    setNumber(key, value) {
      if (value == null) {
        this.unset(key);
        return;
      }
      this.setString(key, lib.isNumber(value) ? String(value) : value);
    }
    /**
     * Unsets a value for a given key.
     *
     * @param key The name of the envar.
     */
    unset(key) {
      delete this.store[key];
    }
    /**
     * Gets an array of all definitely assigned key-value pairs from the underlying envar store.
     */
    entries() {
      return lib.definiteEntriesOf(this.store);
    }
  }
  exports.Env = Env;
  /**
   * The default `Env` instance, which wraps `process.env`.
   */
  exports.env = new Env();
});

var json$1 = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.jsonIncludes = exports.getJsonValuesByName = exports.cloneJson = exports.parseJsonMap = exports.parseJson = void 0;

  /**
   * Parse JSON `string` data.
   *
   * @param data Data to parse.
   * @param jsonPath The file path from which the JSON was loaded.
   * @param throwOnEmpty If the data contents are empty.
   * @throws {@link JsonParseError} If the data contents are empty or the data is invalid.
   */
  function parseJson(data, jsonPath, throwOnEmpty = true) {
    data = data.trim();
    if (!throwOnEmpty && data.length === 0) data = '{}';
    try {
      return JSON.parse(data);
    } catch (error) {
      throw errors$1.JsonParseError.create(error, data, jsonPath);
    }
  }
  exports.parseJson = parseJson;
  /**
   * Parse JSON `string` data, expecting the result to be a `JsonMap`.
   *
   * ```
   * const json = parseJson(myJsonString);
   * // typeof json -> AnyJson
   * ```
   *
   * If you are the producer of the JSON being parsed or have a high degree of confidence in the source of the JSON
   * (e.g. static resources in your project or unwavering data services of high integrity) then you may provide a more
   * specific type as the type parameter, `T`. This practice is _not_ recommended unless you are fully confident in the
   * ability of the type provided to accurately reflect the parsed data, given that _no_ runtime checks will be performed
   * by this method to validate the JSON. In particular, despite the fact that the provided type must extend `JsonMap`,
   * it is possible to circumvent the compiler's ability to do strict null checking by failing to capture `undefined` or
   * `null` property states in the types you apply. It's a best practice to mark all properties of such types as
   * optional, especially when in doubt.
   *
   * ```
   * interface Location extends JsonMap { lat: number; lng: number; }
   * interface WayPoint extends JsonMap { name: string; loc: Location; }
   * const json = JSON.stringify({ name: 'Bill', loc: { lat: 10.0, lng: -10.0 } });
   * // Warning -- since the properties in the interfaces above are non-optional, the type assertion below is not
   * // perfectly type-sound -- make sure you trust your JSON data exactly conforms to the interface(s) you supply,
   * // or you are risking runtime errors!
   * const wayPoint = parseJsonMap<WayPoint>(json);
   * // typeof wayPoint -> WayPoint
   * ```
   *
   * @param data The string data to parse.
   * @param jsonPath The file path from which the JSON was loaded.
   * @param throwOnEmpty If the data contents are empty.
   * @throws {@link JsonParseError} If the data contents are empty or the data is invalid.
   * @throws {@link JsonDataFormatError} If the data contents are not a `JsonMap`.
   */
  function parseJsonMap(data, jsonPath, throwOnEmpty) {
    const json = parseJson(data, jsonPath, throwOnEmpty);
    if (json === null || lib.isJsonArray(json) || typeof json !== 'object') {
      throw new errors$1.JsonDataFormatError('Expected parsed JSON data to be an object');
    }
    return json; // apply the requested type assertion
  }
  exports.parseJsonMap = parseJsonMap;
  /**
   * Perform a deep clone of an object or array compatible with JSON stringification.
   * Object fields that are not compatible with stringification will be omitted. Array
   * entries that are not compatible with stringification will be censored as `null`.
   *
   * @param obj A JSON-compatible object or array to clone.
   * @throws {@link JsonStringifyError} If the object contains circular references or causes
   * other JSON stringification errors.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  function cloneJson(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (err) {
      throw new errors$1.JsonStringifyError(err);
    }
  }
  exports.cloneJson = cloneJson;
  /**
   * Finds all elements of type `T` with a given name in a `JsonMap`. Not suitable for use
   * with object graphs containing circular references. The specification of an appropriate
   * type `T` that will satisfy all matching element values is the responsibility of the caller.
   *
   * @param json The `JsonMap` tree to search for elements of the given name.
   * @param name The name of elements to search for.
   */
  function getJsonValuesByName(json, name) {
    let matches = [];
    if (Object.prototype.hasOwnProperty.call(json, name)) {
      matches.push(json[name]); // Asserting T here assumes the caller knows what they are asking for
    }
    const maybeRecurse = element => {
      if (lib.isJsonMap(element)) {
        matches = matches.concat(getJsonValuesByName(element, name));
      }
    };
    Object.values(json).forEach(value => (lib.isJsonArray(value) ? value.forEach(maybeRecurse) : maybeRecurse(value)));
    return matches;
  }
  exports.getJsonValuesByName = getJsonValuesByName;
  /**
   * Tests whether an `AnyJson` value contains another `AnyJson` value.  This is a shallow
   * check only and does not recurse deeply into collections.
   *
   * @param json The container to search.
   * @param value The value search for.
   */
  function jsonIncludes(json, value) {
    if (json == null || value === undefined || lib.isNumber(json) || lib.isBoolean(json)) return false;
    if (lib.isJsonMap(json)) return Object.values(json).includes(value);
    if (lib.isJsonArray(json)) return json.includes(value);
    if (lib.isString(value)) return json.includes(value);
    return false;
  }
  exports.jsonIncludes = jsonIncludes;
});

var lib$1 = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * Licensed under the BSD 3-Clause license.
   * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
   */
  var __createBinding =
    (_commonjsHelpers.commonjsGlobal && _commonjsHelpers.commonjsGlobal.__createBinding) ||
    (Object.create
      ? function(o, m, k, k2) {
          if (k2 === undefined) k2 = k;
          Object.defineProperty(o, k2, {
            enumerable: true,
            get: function() {
              return m[k];
            }
          });
        }
      : function(o, m, k, k2) {
          if (k2 === undefined) k2 = k;
          o[k2] = m[k];
        });
  var __exportStar =
    (_commonjsHelpers.commonjsGlobal && _commonjsHelpers.commonjsGlobal.__exportStar) ||
    function(m, exports) {
      for (var p in m)
        if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
    };
  Object.defineProperty(exports, '__esModule', { value: true });
  __exportStar(creatable, exports);
  __exportStar(duration, exports);
  __exportStar(env, exports);
  __exportStar(errors$1, exports);
  __exportStar(json$1, exports);
  __exportStar(nodash, exports);
});

exports.lib = lib$1;
//# sourceMappingURL=index-aea73a28.js.map
