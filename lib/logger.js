'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _commonjsHelpers = require('./_commonjsHelpers-49936489.js');
var os$1 = require('os');
var fs$1 = require('fs');
var util = require('util');
var assert = require('assert');
var events = require('events');
var Stream = require('stream');
var index$1 = require('./index-aea73a28.js');
var index = require('./index-ffe6ca9f.js');
var index$2 = require('./index-e6d82ffe.js');
var path = require('path');
var global = require('./global.js');
var sfdxError = require('./sfdxError.js');
var util_fs = require('./util/fs.js');
require('tty');
require('crypto');
require('constants');
require('./messages.js');

function _interopDefaultLegacy(e) {
  return e && typeof e === 'object' && 'default' in e ? e : { default: e };
}

var os__default = /*#__PURE__*/ _interopDefaultLegacy(os$1);
var fs__default = /*#__PURE__*/ _interopDefaultLegacy(fs$1);
var util__default = /*#__PURE__*/ _interopDefaultLegacy(util);
var assert__default = /*#__PURE__*/ _interopDefaultLegacy(assert);
var events__default = /*#__PURE__*/ _interopDefaultLegacy(events);
var Stream__default = /*#__PURE__*/ _interopDefaultLegacy(Stream);

var hasProp = Object.prototype.hasOwnProperty;

function throwsMessage(err) {
  return '[Throws: ' + (err ? err.message : '?') + ']';
}

function safeGetValueFromPropertyOnObject(obj, property) {
  if (hasProp.call(obj, property)) {
    try {
      return obj[property];
    } catch (err) {
      return throwsMessage(err);
    }
  }

  return obj[property];
}

function ensureProperties(obj) {
  var seen = []; // store references to objects we have seen before

  function visit(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (seen.indexOf(obj) !== -1) {
      return '[Circular]';
    }
    seen.push(obj);

    if (typeof obj.toJSON === 'function') {
      try {
        var fResult = visit(obj.toJSON());
        seen.pop();
        return fResult;
      } catch (err) {
        return throwsMessage(err);
      }
    }

    if (Array.isArray(obj)) {
      var aResult = obj.map(visit);
      seen.pop();
      return aResult;
    }

    var result = Object.keys(obj).reduce(function(result, prop) {
      // prevent faulty defined getter properties
      result[prop] = visit(safeGetValueFromPropertyOnObject(obj, prop));
      return result;
    }, {});
    seen.pop();
    return result;
  }
  return visit(obj);
}

var safeJsonStringify = function(data, replacer, space) {
  return JSON.stringify(ensureProperties(data), replacer, space);
};

var ensureProperties_1 = ensureProperties;
safeJsonStringify.ensureProperties = ensureProperties_1;

/**
 * Copyright (c) 2015 Trent Mick.
 * Copyright (c) 2015 Joyent Inc.
 *
 * The bunyan logging library for node.js.
 *
 * -*- mode: js -*-
 * vim: expandtab:ts=4:sw=4
 */

var VERSION = '1.8.2';

/*
 * Bunyan log format version. This becomes the 'v' field on all log records.
 * This will be incremented if there is any backward incompatible change to
 * the log record format. Details will be in 'CHANGES.md' (the change log).
 */
var LOG_VERSION = 0;

var xxx = function xxx(s) {
  // internal dev/debug logging
  var args = ['XX' + 'X: ' + s].concat(Array.prototype.slice.call(arguments, 1));
  console.error.apply(this, args);
};
var xxx = function xxx() {}; // comment out to turn on debug logging

/*
 * Runtime environment notes:
 *
 * Bunyan is intended to run in a number of runtime environments. Here are
 * some notes on differences for those envs and how the code copes.
 *
 * - node.js: The primary target environment.
 * - NW.js: http://nwjs.io/  An *app* environment that feels like both a
 *   node env -- it has node-like globals (`process`, `global`) and
 *   browser-like globals (`window`, `navigator`). My *understanding* is that
 *   bunyan can operate as if this is vanilla node.js.
 * - browser: Failing the above, we sniff using the `window` global
 *   <https://developer.mozilla.org/en-US/docs/Web/API/Window/window>.
 *      - browserify: http://browserify.org/  A browser-targetting bundler of
 *        node.js deps. The runtime is a browser env, so can't use fs access,
 *        etc. Browserify's build looks for `require(<single-string>)` imports
 *        to bundle. For some imports it won't be able to handle, we "hide"
 *        from browserify with `require('frobshizzle' + '')`.
 * - Other? Please open issues if things are broken.
 */
var runtimeEnv;
if (typeof process !== 'undefined' && process.versions) {
  if (process.versions.nw) {
    runtimeEnv = 'nw';
  } else if (process.versions.node) {
    runtimeEnv = 'node';
  }
}
if (!runtimeEnv && typeof window !== 'undefined' && window.window === window) {
  runtimeEnv = 'browser';
}
if (!runtimeEnv) {
  throw new Error('unknown runtime environment');
}

var os, fs, dtrace;
if (runtimeEnv === 'browser') {
  os = {
    hostname: function() {
      return window.location.host;
    }
  };
  fs = {};
  dtrace = null;
} else {
  os = os__default['default'];
  fs = fs__default['default'];

  if (process.env.BUNYAN_DTRACE) {
    try {
      dtrace = _commonjsHelpers.commonjsRequire('dtrace-provider' + '');
    } catch (e) {
      dtrace = null;
    }
  } else {
    dtrace = null;
  }
}

var EventEmitter = events__default['default'].EventEmitter;
var stream = Stream__default['default'];

try {
  var safeJsonStringify$1 = safeJsonStringify;
} catch (e) {
  safeJsonStringify$1 = null;
}
if (process.env.BUNYAN_TEST_NO_SAFE_JSON_STRINGIFY) {
  safeJsonStringify$1 = null;
}

// The 'mv' module is required for rotating-file stream support.
try {
  var mv = _commonjsHelpers.commonjsRequire('mv' + '');
} catch (e) {
  mv = null;
}

try {
  var sourceMapSupport = _commonjsHelpers.commonjsRequire('source-map-support' + '');
} catch (_) {
  sourceMapSupport = null;
}

//---- Internal support stuff

/**
 * A shallow copy of an object. Bunyan logging attempts to never cause
 * exceptions, so this function attempts to handle non-objects gracefully.
 */
function objCopy(obj) {
  if (obj == null) {
    // null or undefined
    return obj;
  } else if (Array.isArray(obj)) {
    return obj.slice();
  } else if (typeof obj === 'object') {
    var copy = {};
    Object.keys(obj).forEach(function(k) {
      copy[k] = obj[k];
    });
    return copy;
  } else {
    return obj;
  }
}

var format = util__default['default'].format;
if (!format) {
  // If node < 0.6, then use its `util.format`:
  // <https://github.com/joyent/node/blob/master/lib/util.js#L22>:
  var inspect = util__default['default'].inspect;
  var formatRegExp = /%[sdj%]/g;
  format = function format(f) {
    if (typeof f !== 'string') {
      var objects = [];
      for (var i = 0; i < arguments.length; i++) {
        objects.push(inspect(arguments[i]));
      }
      return objects.join(' ');
    }

    var i = 1;
    var args = arguments;
    var len = args.length;
    var str = String(f).replace(formatRegExp, function(x) {
      if (i >= len) return x;
      switch (x) {
        case '%s':
          return String(args[i++]);
        case '%d':
          return Number(args[i++]);
        case '%j':
          return JSON.stringify(args[i++], safeCycles());
        case '%%':
          return '%';
        default:
          return x;
      }
    });
    for (var x = args[i]; i < len; x = args[++i]) {
      if (x === null || typeof x !== 'object') {
        str += ' ' + x;
      } else {
        str += ' ' + inspect(x);
      }
    }
    return str;
  };
}

/**
 * Gather some caller info 3 stack levels up.
 * See <http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi>.
 */
function getCaller3Info() {
  if (this === undefined) {
    // Cannot access caller info in 'strict' mode.
    return;
  }
  var obj = {};
  var saveLimit = Error.stackTraceLimit;
  var savePrepare = Error.prepareStackTrace;
  Error.stackTraceLimit = 3;
  Error.captureStackTrace(this, getCaller3Info);

  Error.prepareStackTrace = function(_, stack) {
    var caller = stack[2];
    if (sourceMapSupport) {
      caller = sourceMapSupport.wrapCallSite(caller);
    }
    obj.file = caller.getFileName();
    obj.line = caller.getLineNumber();
    var func = caller.getFunctionName();
    if (func) obj.func = func;
  };
  this.stack;
  Error.stackTraceLimit = saveLimit;
  Error.prepareStackTrace = savePrepare;
  return obj;
}

function _indent(s, indent) {
  if (!indent) indent = '    ';
  var lines = s.split(/\r?\n/g);
  return indent + lines.join('\n' + indent);
}

/**
 * Warn about an bunyan processing error.
 *
 * @param msg {String} Message with which to warn.
 * @param dedupKey {String} Optional. A short string key for this warning to
 *      have its warning only printed once.
 */
function _warn(msg, dedupKey) {
  assert__default['default'].ok(msg);
  if (dedupKey) {
    if (_warned[dedupKey]) {
      return;
    }
    _warned[dedupKey] = true;
  }
  process.stderr.write(msg + '\n');
}
function _haveWarned(dedupKey) {
  return _warned[dedupKey];
}
var _warned = {};

function ConsoleRawStream() {}
ConsoleRawStream.prototype.write = function(rec) {
  if (rec.level < INFO) {
    console.log(rec);
  } else if (rec.level < WARN) {
    console.info(rec);
  } else if (rec.level < ERROR) {
    console.warn(rec);
  } else {
    console.error(rec);
  }
};

//---- Levels

var TRACE = 10;
var DEBUG = 20;
var INFO = 30;
var WARN = 40;
var ERROR = 50;
var FATAL = 60;

var levelFromName = {
  trace: TRACE,
  debug: DEBUG,
  info: INFO,
  warn: WARN,
  error: ERROR,
  fatal: FATAL
};
var nameFromLevel = {};
Object.keys(levelFromName).forEach(function(name) {
  nameFromLevel[levelFromName[name]] = name;
});

// Dtrace probes.
var dtp = undefined;
var probes = dtrace && {};

/**
 * Resolve a level number, name (upper or lowercase) to a level number value.
 *
 * @param nameOrNum {String|Number} A level name (case-insensitive) or positive
 *      integer level.
 * @api public
 */
function resolveLevel(nameOrNum) {
  var level;
  var type = typeof nameOrNum;
  if (type === 'string') {
    level = levelFromName[nameOrNum.toLowerCase()];
    if (!level) {
      throw new Error(format('unknown level name: "%s"', nameOrNum));
    }
  } else if (type !== 'number') {
    throw new TypeError(format('cannot resolve level: invalid arg (%s):', type, nameOrNum));
  } else if (nameOrNum < 0 || Math.floor(nameOrNum) !== nameOrNum) {
    throw new TypeError(format('level is not a positive integer: %s', nameOrNum));
  } else {
    level = nameOrNum;
  }
  return level;
}

function isWritable(obj) {
  if (obj instanceof stream.Writable) {
    return true;
  }
  return typeof obj.write === 'function';
}

//---- Logger class

/**
 * Create a Logger instance.
 *
 * @param options {Object} See documentation for full details. At minimum
 *    this must include a 'name' string key. Configuration keys:
 *      - `streams`: specify the logger output streams. This is an array of
 *        objects with these fields:
 *          - `type`: The stream type. See README.md for full details.
 *            Often this is implied by the other fields. Examples are
 *            'file', 'stream' and "raw".
 *          - `level`: Defaults to 'info'.
 *          - `path` or `stream`: The specify the file path or writeable
 *            stream to which log records are written. E.g.
 *            `stream: process.stdout`.
 *          - `closeOnExit` (boolean): Optional. Default is true for a
 *            'file' stream when `path` is given, false otherwise.
 *        See README.md for full details.
 *      - `level`: set the level for a single output stream (cannot be used
 *        with `streams`)
 *      - `stream`: the output stream for a logger with just one, e.g.
 *        `process.stdout` (cannot be used with `streams`)
 *      - `serializers`: object mapping log record field names to
 *        serializing functions. See README.md for details.
 *      - `src`: Boolean (default false). Set true to enable 'src' automatic
 *        field with log call source info.
 *    All other keys are log record fields.
 *
 * An alternative *internal* call signature is used for creating a child:
 *    new Logger(<parent logger>, <child options>[, <child opts are simple>]);
 *
 * @param _childSimple (Boolean) An assertion that the given `_childOptions`
 *    (a) only add fields (no config) and (b) no serialization handling is
 *    required for them. IOW, this is a fast path for frequent child
 *    creation.
 */
function Logger(options, _childOptions, _childSimple) {
  xxx('Logger start:', options);
  if (!(this instanceof Logger)) {
    return new Logger(options, _childOptions);
  }

  // Input arg validation.
  var parent;
  if (_childOptions !== undefined) {
    parent = options;
    options = _childOptions;
    if (!(parent instanceof Logger)) {
      throw new TypeError('invalid Logger creation: do not pass a second arg');
    }
  }
  if (!options) {
    throw new TypeError('options (object) is required');
  }
  if (!parent) {
    if (!options.name) {
      throw new TypeError('options.name (string) is required');
    }
  } else {
    if (options.name) {
      throw new TypeError('invalid options.name: child cannot set logger name');
    }
  }
  if (options.stream && options.streams) {
    throw new TypeError('cannot mix "streams" and "stream" options');
  }
  if (options.streams && !Array.isArray(options.streams)) {
    throw new TypeError('invalid options.streams: must be an array');
  }
  if (options.serializers && (typeof options.serializers !== 'object' || Array.isArray(options.serializers))) {
    throw new TypeError('invalid options.serializers: must be an object');
  }

  EventEmitter.call(this);

  // Fast path for simple child creation.
  if (parent && _childSimple) {
    // `_isSimpleChild` is a signal to stream close handling that this child
    // owns none of its streams.
    this._isSimpleChild = true;

    this._level = parent._level;
    this.streams = parent.streams;
    this.serializers = parent.serializers;
    this.src = parent.src;
    var fields = (this.fields = {});
    var parentFieldNames = Object.keys(parent.fields);
    for (var i = 0; i < parentFieldNames.length; i++) {
      var name = parentFieldNames[i];
      fields[name] = parent.fields[name];
    }
    var names = Object.keys(options);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      fields[name] = options[name];
    }
    return;
  }

  // Start values.
  var self = this;
  if (parent) {
    this._level = parent._level;
    this.streams = [];
    for (var i = 0; i < parent.streams.length; i++) {
      var s = objCopy(parent.streams[i]);
      s.closeOnExit = false; // Don't own parent stream.
      this.streams.push(s);
    }
    this.serializers = objCopy(parent.serializers);
    this.src = parent.src;
    this.fields = objCopy(parent.fields);
    if (options.level) {
      this.level(options.level);
    }
  } else {
    this._level = Number.POSITIVE_INFINITY;
    this.streams = [];
    this.serializers = null;
    this.src = false;
    this.fields = {};
  }

  if (!dtp && dtrace) {
    dtp = dtrace.createDTraceProvider('bunyan');

    for (var level in levelFromName) {
      var probe;

      probes[levelFromName[level]] = probe = dtp.addProbe('log-' + level, 'char *');

      // Explicitly add a reference to dtp to prevent it from being GC'd
      probe.dtp = dtp;
    }

    dtp.enable();
  }

  // Handle *config* options (i.e. options that are not just plain data
  // for log records).
  if (options.stream) {
    self.addStream({
      type: 'stream',
      stream: options.stream,
      closeOnExit: false,
      level: options.level
    });
  } else if (options.streams) {
    options.streams.forEach(function(s) {
      self.addStream(s, options.level);
    });
  } else if (parent && options.level) {
    this.level(options.level);
  } else if (!parent) {
    if (runtimeEnv === 'browser') {
      /*
       * In the browser we'll be emitting to console.log by default.
       * Any console.log worth its salt these days can nicely render
       * and introspect objects (e.g. the Firefox and Chrome console)
       * so let's emit the raw log record. Are there browsers for which
       * that breaks things?
       */
      self.addStream({
        type: 'raw',
        stream: new ConsoleRawStream(),
        closeOnExit: false,
        level: options.level
      });
    } else {
      self.addStream({
        type: 'stream',
        stream: process.stdout,
        closeOnExit: false,
        level: options.level
      });
    }
  }
  if (options.serializers) {
    self.addSerializers(options.serializers);
  }
  if (options.src) {
    this.src = true;
  }
  xxx('Logger: ', self);

  // Fields.
  // These are the default fields for log records (minus the attributes
  // removed in this constructor). To allow storing raw log records
  // (unrendered), `this.fields` must never be mutated. Create a copy for
  // any changes.
  var fields = objCopy(options);
  delete fields.stream;
  delete fields.level;
  delete fields.streams;
  delete fields.serializers;
  delete fields.src;
  if (this.serializers) {
    this._applySerializers(fields);
  }
  if (!fields.hostname && !self.fields.hostname) {
    fields.hostname = os.hostname();
  }
  if (!fields.pid) {
    fields.pid = process.pid;
  }
  Object.keys(fields).forEach(function(k) {
    self.fields[k] = fields[k];
  });
}

util__default['default'].inherits(Logger, EventEmitter);

/**
 * Add a stream
 *
 * @param stream {Object}. Object with these fields:
 *    - `type`: The stream type. See README.md for full details.
 *      Often this is implied by the other fields. Examples are
 *      'file', 'stream' and "raw".
 *    - `path` or `stream`: The specify the file path or writeable
 *      stream to which log records are written. E.g.
 *      `stream: process.stdout`.
 *    - `level`: Optional. Falls back to `defaultLevel`.
 *    - `closeOnExit` (boolean): Optional. Default is true for a
 *      'file' stream when `path` is given, false otherwise.
 *    See README.md for full details.
 * @param defaultLevel {Number|String} Optional. A level to use if
 *      `stream.level` is not set. If neither is given, this defaults to INFO.
 */
Logger.prototype.addStream = function addStream(s, defaultLevel) {
  var self = this;
  if (defaultLevel === null || defaultLevel === undefined) {
    defaultLevel = INFO;
  }

  s = objCopy(s);

  // Implicit 'type' from other args.
  if (!s.type) {
    if (s.stream) {
      s.type = 'stream';
    } else if (s.path) {
      s.type = 'file';
    }
  }
  s.raw = s.type === 'raw'; // PERF: Allow for faster check in `_emit`.

  if (s.level !== undefined) {
    s.level = resolveLevel(s.level);
  } else {
    s.level = resolveLevel(defaultLevel);
  }
  if (s.level < self._level) {
    self._level = s.level;
  }

  switch (s.type) {
    case 'stream':
      assert__default['default'].ok(
        isWritable(s.stream),
        '"stream" stream is not writable: ' + util__default['default'].inspect(s.stream)
      );

      if (!s.closeOnExit) {
        s.closeOnExit = false;
      }
      break;
    case 'file':
      if (s.reemitErrorEvents === undefined) {
        s.reemitErrorEvents = true;
      }
      if (!s.stream) {
        s.stream = fs.createWriteStream(s.path, { flags: 'a', encoding: 'utf8' });
        if (!s.closeOnExit) {
          s.closeOnExit = true;
        }
      } else {
        if (!s.closeOnExit) {
          s.closeOnExit = false;
        }
      }
      break;
    case 'rotating-file':
      assert__default['default'].ok(!s.stream, '"rotating-file" stream should not give a "stream"');
      assert__default['default'].ok(s.path);
      assert__default['default'].ok(mv, '"rotating-file" stream type is not supported: ' + 'missing "mv" module');
      s.stream = new RotatingFileStream(s);
      if (!s.closeOnExit) {
        s.closeOnExit = true;
      }
      break;
    case 'raw':
      if (!s.closeOnExit) {
        s.closeOnExit = false;
      }
      break;
    default:
      throw new TypeError('unknown stream type "' + s.type + '"');
  }

  if (s.reemitErrorEvents && typeof s.stream.on === 'function') {
    // TODO: When we have `<logger>.close()`, it should remove event
    //      listeners to not leak Logger instances.
    s.stream.on('error', function onStreamError(err) {
      self.emit('error', err, s);
    });
  }

  self.streams.push(s);
  delete self.haveNonRawStreams; // reset
};

/**
 * Add serializers
 *
 * @param serializers {Object} Optional. Object mapping log record field names
 *    to serializing functions. See README.md for details.
 */
Logger.prototype.addSerializers = function addSerializers(serializers) {
  var self = this;

  if (!self.serializers) {
    self.serializers = {};
  }
  Object.keys(serializers).forEach(function(field) {
    var serializer = serializers[field];
    if (typeof serializer !== 'function') {
      throw new TypeError(format('invalid serializer for "%s" field: must be a function', field));
    } else {
      self.serializers[field] = serializer;
    }
  });
};

/**
 * Create a child logger, typically to add a few log record fields.
 *
 * This can be useful when passing a logger to a sub-component, e.g. a
 * 'wuzzle' component of your service:
 *
 *    var wuzzleLog = log.child({component: 'wuzzle'})
 *    var wuzzle = new Wuzzle({..., log: wuzzleLog})
 *
 * Then log records from the wuzzle code will have the same structure as
 * the app log, *plus the component='wuzzle' field*.
 *
 * @param options {Object} Optional. Set of options to apply to the child.
 *    All of the same options for a new Logger apply here. Notes:
 *      - The parent's streams are inherited and cannot be removed in this
 *        call. Any given `streams` are *added* to the set inherited from
 *        the parent.
 *      - The parent's serializers are inherited, though can effectively be
 *        overwritten by using duplicate keys.
 *      - Can use `level` to set the level of the streams inherited from
 *        the parent. The level for the parent is NOT affected.
 * @param simple {Boolean} Optional. Set to true to assert that `options`
 *    (a) only add fields (no config) and (b) no serialization handling is
 *    required for them. IOW, this is a fast path for frequent child
 *    creation. See 'tools/timechild.js' for numbers.
 */
Logger.prototype.child = function(options, simple) {
  return new this.constructor(this, options || {}, simple);
};

/**
 * A convenience method to reopen 'file' streams on a logger. This can be
 * useful with external log rotation utilities that move and re-open log files
 * (e.g. logrotate on Linux, logadm on SmartOS/Illumos). Those utilities
 * typically have rotation options to copy-and-truncate the log file, but
 * you may not want to use that. An alternative is to do this in your
 * application:
 *
 *      var log = bunyan.createLogger(...);
 *      ...
 *      process.on('SIGUSR2', function () {
 *          log.reopenFileStreams();
 *      });
 *      ...
 *
 * See <https://github.com/trentm/node-bunyan/issues/104>.
 */
Logger.prototype.reopenFileStreams = function() {
  var self = this;
  self.streams.forEach(function(s) {
    if (s.type === 'file') {
      if (s.stream) {
        // Not sure if typically would want this, or more immediate
        // `s.stream.destroy()`.
        s.stream.end();
        s.stream.destroySoon();
        delete s.stream;
      }
      s.stream = fs.createWriteStream(s.path, { flags: 'a', encoding: 'utf8' });
      s.stream.on('error', function(err) {
        self.emit('error', err, s);
      });
    }
  });
};

/* BEGIN JSSTYLED */
/**
 * Close this logger.
 *
 * This closes streams (that it owns, as per 'endOnClose' attributes on
 * streams), etc. Typically you **don't** need to bother calling this.
Logger.prototype.close = function () {
    if (this._closed) {
        return;
    }
    if (!this._isSimpleChild) {
        self.streams.forEach(function (s) {
            if (s.endOnClose) {
                xxx('closing stream s:', s);
                s.stream.end();
                s.endOnClose = false;
            }
        });
    }
    this._closed = true;
}
 */
/* END JSSTYLED */

/**
 * Get/set the level of all streams on this logger.
 *
 * Get Usage:
 *    // Returns the current log level (lowest level of all its streams).
 *    log.level() -> INFO
 *
 * Set Usage:
 *    log.level(INFO)       // set all streams to level INFO
 *    log.level('info')     // can use 'info' et al aliases
 */
Logger.prototype.level = function level(value) {
  if (value === undefined) {
    return this._level;
  }
  var newLevel = resolveLevel(value);
  var len = this.streams.length;
  for (var i = 0; i < len; i++) {
    this.streams[i].level = newLevel;
  }
  this._level = newLevel;
};

/**
 * Get/set the level of a particular stream on this logger.
 *
 * Get Usage:
 *    // Returns an array of the levels of each stream.
 *    log.levels() -> [TRACE, INFO]
 *
 *    // Returns a level of the identified stream.
 *    log.levels(0) -> TRACE      // level of stream at index 0
 *    log.levels('foo')           // level of stream with name 'foo'
 *
 * Set Usage:
 *    log.levels(0, INFO)         // set level of stream 0 to INFO
 *    log.levels(0, 'info')       // can use 'info' et al aliases
 *    log.levels('foo', WARN)     // set stream named 'foo' to WARN
 *
 * Stream names: When streams are defined, they can optionally be given
 * a name. For example,
 *       log = new Logger({
 *         streams: [
 *           {
 *             name: 'foo',
 *             path: '/var/log/my-service/foo.log'
 *             level: 'trace'
 *           },
 *         ...
 *
 * @param name {String|Number} The stream index or name.
 * @param value {Number|String} The level value (INFO) or alias ('info').
 *    If not given, this is a 'get' operation.
 * @throws {Error} If there is no stream with the given name.
 */
Logger.prototype.levels = function levels(name, value) {
  if (name === undefined) {
    assert__default['default'].equal(value, undefined);
    return this.streams.map(function(s) {
      return s.level;
    });
  }
  var stream;
  if (typeof name === 'number') {
    stream = this.streams[name];
    if (stream === undefined) {
      throw new Error('invalid stream index: ' + name);
    }
  } else {
    var len = this.streams.length;
    for (var i = 0; i < len; i++) {
      var s = this.streams[i];
      if (s.name === name) {
        stream = s;
        break;
      }
    }
    if (!stream) {
      throw new Error(format('no stream with name "%s"', name));
    }
  }
  if (value === undefined) {
    return stream.level;
  } else {
    var newLevel = resolveLevel(value);
    stream.level = newLevel;
    if (newLevel < this._level) {
      this._level = newLevel;
    }
  }
};

/**
 * Apply registered serializers to the appropriate keys in the given fields.
 *
 * Pre-condition: This is only called if there is at least one serializer.
 *
 * @param fields (Object) The log record fields.
 * @param excludeFields (Object) Optional mapping of keys to `true` for
 *    keys to NOT apply a serializer.
 */
Logger.prototype._applySerializers = function(fields, excludeFields) {
  var self = this;

  xxx('_applySerializers: excludeFields', excludeFields);

  // Check each serializer against these (presuming number of serializers
  // is typically less than number of fields).
  Object.keys(this.serializers).forEach(function(name) {
    if (fields[name] === undefined || (excludeFields && excludeFields[name])) {
      return;
    }
    xxx('_applySerializers; apply to "%s" key', name);
    try {
      fields[name] = self.serializers[name](fields[name]);
    } catch (err) {
      _warn(
        format(
          'bunyan: ERROR: Exception thrown from the "%s" ' +
            'Bunyan serializer. This should never happen. This is a bug' +
            'in that serializer function.\n%s',
          name,
          err.stack || err
        )
      );
      fields[name] = format('(Error in Bunyan log "%s" serializer ' + 'broke field. See stderr for details.)', name);
    }
  });
};

/**
 * Emit a log record.
 *
 * @param rec {log record}
 * @param noemit {Boolean} Optional. Set to true to skip emission
 *      and just return the JSON string.
 */
Logger.prototype._emit = function(rec, noemit) {
  var i;

  // Lazily determine if this Logger has non-'raw' streams. If there are
  // any, then we need to stringify the log record.
  if (this.haveNonRawStreams === undefined) {
    this.haveNonRawStreams = false;
    for (i = 0; i < this.streams.length; i++) {
      if (!this.streams[i].raw) {
        this.haveNonRawStreams = true;
        break;
      }
    }
  }

  // Stringify the object. Attempt to warn/recover on error.
  var str;
  if (noemit || this.haveNonRawStreams) {
    try {
      str = JSON.stringify(rec, safeCycles()) + '\n';
    } catch (e) {
      if (safeJsonStringify$1) {
        str = safeJsonStringify$1(rec) + '\n';
      } else {
        var dedupKey = e.stack.split(/\n/g, 2).join('\n');
        _warn(
          'bunyan: ERROR: Exception in ' +
            '`JSON.stringify(rec)`. You can install the ' +
            '"safe-json-stringify" module to have Bunyan fallback ' +
            'to safer stringification. Record:\n' +
            _indent(format('%s\n%s', util__default['default'].inspect(rec), e.stack)),
          dedupKey
        );
        str = format('(Exception in JSON.stringify(rec): %j. ' + 'See stderr for details.)\n', e.message);
      }
    }
  }

  if (noemit) return str;

  var level = rec.level;
  for (i = 0; i < this.streams.length; i++) {
    var s = this.streams[i];
    if (s.level <= level) {
      xxx('writing log rec "%s" to "%s" stream (%d <= %d): %j', rec.msg, s.type, s.level, level, rec);
      s.stream.write(s.raw ? rec : str);
    }
  }
  return str;
};

/**
 * Build a log emitter function for level minLevel. I.e. this is the
 * creator of `log.info`, `log.error`, etc.
 */
function mkLogEmitter(minLevel) {
  return function() {
    var log = this;

    function mkRecord(args) {
      var excludeFields;
      if (args[0] instanceof Error) {
        // `log.<level>(err, ...)`
        fields = {
          // Use this Logger's err serializer, if defined.
          err:
            log.serializers && log.serializers.err ? log.serializers.err(args[0]) : Logger.stdSerializers.err(args[0])
        };
        excludeFields = { err: true };
        if (args.length === 1) {
          msgArgs = [fields.err.message];
        } else {
          msgArgs = Array.prototype.slice.call(args, 1);
        }
      } else if ((typeof args[0] !== 'object' && args[0] !== null) || Array.isArray(args[0])) {
        // `log.<level>(msg, ...)`
        fields = null;
        msgArgs = Array.prototype.slice.call(args);
      } else if (Buffer.isBuffer(args[0])) {
        // `log.<level>(buf, ...)`
        // Almost certainly an error, show `inspect(buf)`. See bunyan
        // issue #35.
        fields = null;
        msgArgs = Array.prototype.slice.call(args);
        msgArgs[0] = util__default['default'].inspect(msgArgs[0]);
      } else {
        // `log.<level>(fields, msg, ...)`
        fields = args[0];
        if (args.length === 1 && fields.err && fields.err instanceof Error) {
          msgArgs = [fields.err.message];
        } else {
          msgArgs = Array.prototype.slice.call(args, 1);
        }
      }

      // Build up the record object.
      var rec = objCopy(log.fields);
      rec.level = minLevel;
      var recFields = fields ? objCopy(fields) : null;
      if (recFields) {
        if (log.serializers) {
          log._applySerializers(recFields, excludeFields);
        }
        Object.keys(recFields).forEach(function(k) {
          rec[k] = recFields[k];
        });
      }
      rec.msg = format.apply(log, msgArgs);
      if (!rec.time) {
        rec.time = new Date();
      }
      // Get call source info
      if (log.src && !rec.src) {
        rec.src = getCaller3Info();
      }
      rec.v = LOG_VERSION;

      return rec;
    }
    var fields = null;
    var msgArgs = arguments;
    var str = null;
    var rec = null;
    if (!this._emit) {
      /*
       * Show this invalid Bunyan usage warning *once*.
       *
       * See <https://github.com/trentm/node-bunyan/issues/100> for
       * an example of how this can happen.
       */
      var dedupKey = 'unbound';
      if (!_haveWarned[dedupKey]) {
        var caller = getCaller3Info();
        _warn(
          format(
            'bunyan usage error: %s:%s: attempt to log ' + 'with an unbound log method: `this` is: %s',
            caller.file,
            caller.line,
            util__default['default'].inspect(this)
          ),
          dedupKey
        );
      }
      return;
    } else if (arguments.length === 0) {
      // `log.<level>()`
      return this._level <= minLevel;
    } else if (this._level > minLevel);
    else {
      rec = mkRecord(msgArgs);
      str = this._emit(rec);
    }
    probes &&
      probes[minLevel].fire(function() {
        return [str || (rec && log._emit(rec, true)) || log._emit(mkRecord(msgArgs), true)];
      });
  };
}

/**
 * The functions below log a record at a specific level.
 *
 * Usages:
 *    log.<level>()  -> boolean is-trace-enabled
 *    log.<level>(<Error> err, [<string> msg, ...])
 *    log.<level>(<string> msg, ...)
 *    log.<level>(<object> fields, <string> msg, ...)
 *
 * where <level> is the lowercase version of the log level. E.g.:
 *
 *    log.info()
 *
 * @params fields {Object} Optional set of additional fields to log.
 * @params msg {String} Log message. This can be followed by additional
 *    arguments that are handled like
 *    [util.format](http://nodejs.org/docs/latest/api/all.html#util.format).
 */
Logger.prototype.trace = mkLogEmitter(TRACE);
Logger.prototype.debug = mkLogEmitter(DEBUG);
Logger.prototype.info = mkLogEmitter(INFO);
Logger.prototype.warn = mkLogEmitter(WARN);
Logger.prototype.error = mkLogEmitter(ERROR);
Logger.prototype.fatal = mkLogEmitter(FATAL);

//---- Standard serializers
// A serializer is a function that serializes a JavaScript object to a
// JSON representation for logging. There is a standard set of presumed
// interesting objects in node.js-land.

Logger.stdSerializers = {};

// Serialize an HTTP request.
Logger.stdSerializers.req = function req(req) {
  if (!req || !req.connection) return req;
  return {
    method: req.method,
    url: req.url,
    headers: req.headers,
    remoteAddress: req.connection.remoteAddress,
    remotePort: req.connection.remotePort
  };
  // Trailers: Skipping for speed. If you need trailers in your app, then
  // make a custom serializer.
  //if (Object.keys(trailers).length > 0) {
  //  obj.trailers = req.trailers;
  //}
};

// Serialize an HTTP response.
Logger.stdSerializers.res = function res(res) {
  if (!res || !res.statusCode) return res;
  return {
    statusCode: res.statusCode,
    header: res._header
  };
};

/*
 * This function dumps long stack traces for exceptions having a cause()
 * method. The error classes from
 * [verror](https://github.com/davepacheco/node-verror) and
 * [restify v2.0](https://github.com/mcavage/node-restify) are examples.
 *
 * Based on `dumpException` in
 * https://github.com/davepacheco/node-extsprintf/blob/master/lib/extsprintf.js
 */
function getFullErrorStack(ex) {
  var ret = ex.stack || ex.toString();
  if (ex.cause && typeof ex.cause === 'function') {
    var cex = ex.cause();
    if (cex) {
      ret += '\nCaused by: ' + getFullErrorStack(cex);
    }
  }
  return ret;
}

// Serialize an Error object
// (Core error properties are enumerable in node 0.4, not in 0.6).
Logger.stdSerializers.err = function err(err) {
  if (!err || !err.stack) return err;
  var obj = {
    message: err.message,
    name: err.name,
    stack: getFullErrorStack(err),
    code: err.code,
    signal: err.signal
  };
  return obj;
};

// A JSON stringifier that handles cycles safely.
// Usage: JSON.stringify(obj, safeCycles())
function safeCycles() {
  var seen = [];
  return function(key, val) {
    if (!val || typeof val !== 'object') {
      return val;
    }
    if (seen.indexOf(val) !== -1) {
      return '[Circular]';
    }
    seen.push(val);
    return val;
  };
}

var RotatingFileStream = null;
if (mv) {
  RotatingFileStream = function RotatingFileStream(options) {
    this.path = options.path;

    this.count = options.count == null ? 10 : options.count;
    assert__default['default'].equal(
      typeof this.count,
      'number',
      format('rotating-file stream "count" is not a number: %j (%s) in %j', this.count, typeof this.count, this)
    );
    assert__default['default'].ok(
      this.count >= 0,
      format('rotating-file stream "count" is not >= 0: %j in %j', this.count, this)
    );

    // Parse `options.period`.
    if (options.period) {
      // <number><scope> where scope is:
      //    h   hours (at the start of the hour)
      //    d   days (at the start of the day, i.e. just after midnight)
      //    w   weeks (at the start of Sunday)
      //    m   months (on the first of the month)
      //    y   years (at the start of Jan 1st)
      // with special values 'hourly' (1h), 'daily' (1d), "weekly" (1w),
      // 'monthly' (1m) and 'yearly' (1y)
      var period =
        {
          hourly: '1h',
          daily: '1d',
          weekly: '1w',
          monthly: '1m',
          yearly: '1y'
        }[options.period] || options.period;
      var m = /^([1-9][0-9]*)([hdwmy]|ms)$/.exec(period);
      if (!m) {
        throw new Error(format('invalid period: "%s"', options.period));
      }
      this.periodNum = Number(m[1]);
      this.periodScope = m[2];
    } else {
      this.periodNum = 1;
      this.periodScope = 'd';
    }

    var lastModified = null;
    try {
      var fileInfo = fs.statSync(this.path);
      lastModified = fileInfo.mtime.getTime();
    } catch (err) {
      // file doesn't exist
    }
    var rotateAfterOpen = false;
    if (lastModified) {
      var lastRotTime = this._calcRotTime(0);
      if (lastModified < lastRotTime) {
        rotateAfterOpen = true;
      }
    }

    // TODO: template support for backup files
    // template: <path to which to rotate>
    //      default is %P.%n
    //      '/var/log/archive/foo.log'  -> foo.log.%n
    //      '/var/log/archive/foo.log.%n'
    //      codes:
    //          XXX support strftime codes (per node version of those)
    //              or whatever module. Pick non-colliding for extra
    //              codes
    //          %P      `path` base value
    //          %n      integer number of rotated log (1,2,3,...)
    //          %d      datetime in YYYY-MM-DD_HH-MM-SS
    //                      XXX what should default date format be?
    //                          prior art? Want to avoid ':' in
    //                          filenames (illegal on Windows for one).

    this.stream = fs.createWriteStream(this.path, { flags: 'a', encoding: 'utf8' });

    this.rotQueue = [];
    this.rotating = false;
    if (rotateAfterOpen) {
      this._debug('rotateAfterOpen -> call rotate()');
      this.rotate();
    } else {
      this._setupNextRot();
    }
  };

  util__default['default'].inherits(RotatingFileStream, EventEmitter);

  RotatingFileStream.prototype._debug = function() {
    // Set this to `true` to add debug logging.
    {
      return false;
    }
  };

  RotatingFileStream.prototype._setupNextRot = function() {
    this.rotAt = this._calcRotTime(1);
    this._setRotationTimer();
  };

  RotatingFileStream.prototype._setRotationTimer = function() {
    var self = this;
    var delay = this.rotAt - Date.now();
    // Cap timeout to Node's max setTimeout, see
    // <https://github.com/joyent/node/issues/8656>.
    var TIMEOUT_MAX = 2147483647; // 2^31-1
    if (delay > TIMEOUT_MAX) {
      delay = TIMEOUT_MAX;
    }
    this.timeout = setTimeout(function() {
      self._debug('_setRotationTimer timeout -> call rotate()');
      self.rotate();
    }, delay);
    if (typeof this.timeout.unref === 'function') {
      this.timeout.unref();
    }
  };

  RotatingFileStream.prototype._calcRotTime = function _calcRotTime(periodOffset) {
    this._debug('_calcRotTime: %s%s', this.periodNum, this.periodScope);
    var d = new Date();

    this._debug('  now local: %s', d);
    this._debug('    now utc: %s', d.toISOString());
    var rotAt;
    switch (this.periodScope) {
      case 'ms':
        // Hidden millisecond period for debugging.
        if (this.rotAt) {
          rotAt = this.rotAt + this.periodNum * periodOffset;
        } else {
          rotAt = Date.now() + this.periodNum * periodOffset;
        }
        break;
      case 'h':
        if (this.rotAt) {
          rotAt = this.rotAt + this.periodNum * 60 * 60 * 1000 * periodOffset;
        } else {
          // First time: top of the next hour.
          rotAt = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours() + periodOffset);
        }
        break;
      case 'd':
        if (this.rotAt) {
          rotAt = this.rotAt + this.periodNum * 24 * 60 * 60 * 1000 * periodOffset;
        } else {
          // First time: start of tomorrow (i.e. at the coming midnight) UTC.
          rotAt = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + periodOffset);
        }
        break;
      case 'w':
        // Currently, always on Sunday morning at 00:00:00 (UTC).
        if (this.rotAt) {
          rotAt = this.rotAt + this.periodNum * 7 * 24 * 60 * 60 * 1000 * periodOffset;
        } else {
          // First time: this coming Sunday.
          var dayOffset = 7 - d.getUTCDay();
          if (periodOffset < 1) {
            dayOffset = -d.getUTCDay();
          }
          if (periodOffset > 1 || periodOffset < -1) {
            dayOffset += 7 * periodOffset;
          }
          rotAt = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + dayOffset);
        }
        break;
      case 'm':
        if (this.rotAt) {
          rotAt = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + this.periodNum * periodOffset, 1);
        } else {
          // First time: the start of the next month.
          rotAt = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + periodOffset, 1);
        }
        break;
      case 'y':
        if (this.rotAt) {
          rotAt = Date.UTC(d.getUTCFullYear() + this.periodNum * periodOffset, 0, 1);
        } else {
          // First time: the start of the next year.
          rotAt = Date.UTC(d.getUTCFullYear() + periodOffset, 0, 1);
        }
        break;
      default:
        assert__default['default'].fail(format('invalid period scope: "%s"', this.periodScope));
    }

    if (this._debug()) {
      this._debug('  **rotAt**: %s (utc: %s)', rotAt, new Date(rotAt).toUTCString());
      var now = Date.now();
      this._debug(
        '        now: %s (%sms == %smin == %sh to go)',
        now,
        rotAt - now,
        (rotAt - now) / 1000 / 60,
        (rotAt - now) / 1000 / 60 / 60
      );
    }
    return rotAt;
  };

  RotatingFileStream.prototype.rotate = function rotate() {
    // XXX What about shutdown?
    var self = this;

    // If rotation period is > ~25 days, we have to break into multiple
    // setTimeout's. See <https://github.com/joyent/node/issues/8656>.
    if (self.rotAt && self.rotAt > Date.now()) {
      return self._setRotationTimer();
    }

    this._debug('rotate');
    if (self.rotating) {
      throw new TypeError('cannot start a rotation when already rotating');
    }
    self.rotating = true;

    self.stream.end(); // XXX can do moves sync after this? test at high rate

    function del() {
      var toDel = self.path + '.' + String(n - 1);
      if (n === 0) {
        toDel = self.path;
      }
      n -= 1;
      self._debug('  rm %s', toDel);
      fs.unlink(toDel, function(delErr) {
        //XXX handle err other than not exists
        moves();
      });
    }

    function moves() {
      if (self.count === 0 || n < 0) {
        return finish();
      }
      var before = self.path;
      var after = self.path + '.' + String(n);
      if (n > 0) {
        before += '.' + String(n - 1);
      }
      n -= 1;
      fs.exists(before, function(exists) {
        if (!exists) {
          moves();
        } else {
          self._debug('  mv %s %s', before, after);
          mv(before, after, function(mvErr) {
            if (mvErr) {
              self.emit('error', mvErr);
              finish(); // XXX finish here?
            } else {
              moves();
            }
          });
        }
      });
    }

    function finish() {
      self._debug('  open %s', self.path);
      self.stream = fs.createWriteStream(self.path, { flags: 'a', encoding: 'utf8' });
      var q = self.rotQueue,
        len = q.length;
      for (var i = 0; i < len; i++) {
        self.stream.write(q[i]);
      }
      self.rotQueue = [];
      self.rotating = false;
      self.emit('drain');
      self._setupNextRot();
    }

    var n = this.count;
    del();
  };

  RotatingFileStream.prototype.write = function write(s) {
    if (this.rotating) {
      this.rotQueue.push(s);
      return false;
    } else {
      return this.stream.write(s);
    }
  };

  RotatingFileStream.prototype.end = function end(s) {
    this.stream.end();
  };

  RotatingFileStream.prototype.destroy = function destroy(s) {
    this.stream.destroy();
  };

  RotatingFileStream.prototype.destroySoon = function destroySoon(s) {
    this.stream.destroySoon();
  };
} /* if (mv) */

/**
 * RingBuffer is a Writable Stream that just stores the last N records in
 * memory.
 *
 * @param options {Object}, with the following fields:
 *
 *    - limit: number of records to keep in memory
 */
function RingBuffer(options) {
  this.limit = options && options.limit ? options.limit : 100;
  this.writable = true;
  this.records = [];
  EventEmitter.call(this);
}

util__default['default'].inherits(RingBuffer, EventEmitter);

RingBuffer.prototype.write = function(record) {
  if (!this.writable) throw new Error('RingBuffer has been ended already');

  this.records.push(record);

  if (this.records.length > this.limit) this.records.shift();

  return true;
};

RingBuffer.prototype.end = function() {
  if (arguments.length > 0) this.write.apply(this, Array.prototype.slice.call(arguments));
  this.writable = false;
};

RingBuffer.prototype.destroy = function() {
  this.writable = false;
  this.emit('close');
};

RingBuffer.prototype.destroySoon = function() {
  this.destroy();
};

//---- Exports

var bunyan = Logger;

var TRACE_1 = TRACE;
var DEBUG_1 = DEBUG;
var INFO_1 = INFO;
var WARN_1 = WARN;
var ERROR_1 = ERROR;
var FATAL_1 = FATAL;
var resolveLevel_1 = resolveLevel;
var levelFromName_1 = levelFromName;
var nameFromLevel_1 = nameFromLevel;

var VERSION_1 = VERSION;
var LOG_VERSION_1 = LOG_VERSION;

var createLogger = function createLogger(options) {
  return new Logger(options);
};

var RingBuffer_1 = RingBuffer;
var RotatingFileStream_1 = RotatingFileStream;

// Useful for custom `type == 'raw'` streams that may do JSON stringification
// of log records themselves. Usage:
//    var str = JSON.stringify(rec, bunyan.safeCycles());
var safeCycles_1 = safeCycles;
bunyan.TRACE = TRACE_1;
bunyan.DEBUG = DEBUG_1;
bunyan.INFO = INFO_1;
bunyan.WARN = WARN_1;
bunyan.ERROR = ERROR_1;
bunyan.FATAL = FATAL_1;
bunyan.resolveLevel = resolveLevel_1;
bunyan.levelFromName = levelFromName_1;
bunyan.nameFromLevel = nameFromLevel_1;
bunyan.VERSION = VERSION_1;
bunyan.LOG_VERSION = LOG_VERSION_1;
bunyan.createLogger = createLogger;
bunyan.RingBuffer = RingBuffer_1;
bunyan.RotatingFileStream = RotatingFileStream_1;
bunyan.safeCycles = safeCycles_1;

var Bunyan = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.assign(/*#__PURE__*/ Object.create(null), bunyan, {
    default: bunyan,
    TRACE: TRACE_1,
    DEBUG: DEBUG_1,
    INFO: INFO_1,
    WARN: WARN_1,
    ERROR: ERROR_1,
    FATAL: FATAL_1,
    resolveLevel: resolveLevel_1,
    levelFromName: levelFromName_1,
    nameFromLevel: nameFromLevel_1,
    VERSION: VERSION_1,
    LOG_VERSION: LOG_VERSION_1,
    createLogger: createLogger,
    RingBuffer: RingBuffer_1,
    RotatingFileStream: RotatingFileStream_1,
    safeCycles: safeCycles_1
  })
);

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
(function(LoggerLevel) {
  LoggerLevel[(LoggerLevel['TRACE'] = 10)] = 'TRACE';
  LoggerLevel[(LoggerLevel['DEBUG'] = 20)] = 'DEBUG';
  LoggerLevel[(LoggerLevel['INFO'] = 30)] = 'INFO';
  LoggerLevel[(LoggerLevel['WARN'] = 40)] = 'WARN';
  LoggerLevel[(LoggerLevel['ERROR'] = 50)] = 'ERROR';
  LoggerLevel[(LoggerLevel['FATAL'] = 60)] = 'FATAL';
})(exports.LoggerLevel || (exports.LoggerLevel = {}));
(function(LoggerFormat) {
  LoggerFormat[(LoggerFormat['JSON'] = 0)] = 'JSON';
  LoggerFormat[(LoggerFormat['LOGFMT'] = 1)] = 'LOGFMT';
})(exports.LoggerFormat || (exports.LoggerFormat = {}));
/**
 * A logging abstraction powered by {@link https://github.com/forcedotcom/node-bunyan|Bunyan} that provides both a default
 * logger configuration that will log to `sfdx.log`, and a way to create custom loggers based on the same foundation.
 *
 * ```
 * // Gets the root sfdx logger
 * const logger = await Logger.root();
 *
 * // Creates a child logger of the root sfdx logger with custom fields applied
 * const childLogger = await Logger.child('myRootChild', {tag: 'value'});
 *
 * // Creates a custom logger unaffiliated with the root logger
 * const myCustomLogger = new Logger('myCustomLogger');
 *
 * // Creates a child of a custom logger unaffiliated with the root logger with custom fields applied
 * const myCustomChildLogger = myCustomLogger.child('myCustomChild', {tag: 'value'});
 * ```
 * **See** https://github.com/forcedotcom/node-bunyan
 *
 * **See** https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_log_messages.htm
 */
class Logger$1 {
  /**
   * Constructs a new `Logger`.
   *
   * @param optionsOrName A set of `LoggerOptions` or name to use with the default options.
   *
   * **Throws** *{@link SfdxError}{ name: 'RedundantRootLogger' }* More than one attempt is made to construct the root
   * `Logger`.
   */
  constructor(optionsOrName) {
    this.uncaughtExceptionHandler = err => {
      // W-7558552
      // Only log uncaught exceptions in root logger
      if (this === Logger$1.rootLogger) {
        // log the exception
        // FIXME: good chance this won't be logged because
        // process.exit was called before this is logged
        // https://github.com/trentm/node-bunyan/issues/95
        this.fatal(err);
      }
    };
    this.exitHandler = () => {
      this.close();
    };
    let options;
    if (typeof optionsOrName === 'string') {
      options = {
        name: optionsOrName,
        level: Logger$1.DEFAULT_LEVEL,
        serializers: bunyan.stdSerializers
      };
    } else {
      options = optionsOrName;
    }
    if (Logger$1.rootLogger && options.name === Logger$1.ROOT_NAME) {
      throw new sfdxError.SfdxError('RedundantRootLogger');
    }
    // Inspect format to know what logging format to use then delete from options to
    // ensure it doesn't conflict with Bunyan.
    this.format = options.format || exports.LoggerFormat.JSON;
    delete options.format;
    // If the log format is LOGFMT, we need to convert any stream(s) into a LOGFMT type stream.
    if (this.format === exports.LoggerFormat.LOGFMT && options.stream) {
      const ls = this.createLogFmtFormatterStream({ stream: options.stream });
      options.stream = ls.stream;
    }
    if (this.format === exports.LoggerFormat.LOGFMT && options.streams) {
      const logFmtConvertedStreams = [];
      options.streams.forEach(ls => {
        logFmtConvertedStreams.push(this.createLogFmtFormatterStream(ls));
      });
      options.streams = logFmtConvertedStreams;
    }
    this.bunyan = new Bunyan(options);
    this.bunyan.name = options.name;
    this.bunyan.filters = [];
    if (!options.streams && !options.stream) {
      this.bunyan.streams = [];
    }
    // all SFDX loggers must filter sensitive data
    this.addFilter((...args) => _filter(...args));
    if (global.Global.getEnvironmentMode() !== global.Mode.TEST) {
      Logger$1.lifecycle.on('uncaughtException', this.uncaughtExceptionHandler);
      Logger$1.lifecycle.on('exit', this.exitHandler);
    }
    this.trace(`Created '${this.getName()}' logger instance`);
  }
  /**
   * Gets the root logger with the default level and file stream.
   */
  static async root() {
    if (this.rootLogger) {
      return this.rootLogger;
    }
    const rootLogger = (this.rootLogger = new Logger$1(Logger$1.ROOT_NAME).setLevel());
    // disable log file writing, if applicable
    if (process.env.SFDX_DISABLE_LOG_FILE !== 'true' && global.Global.getEnvironmentMode() !== global.Mode.TEST) {
      await rootLogger.addLogFileStream(global.Global.LOG_FILE_PATH);
    }
    // The debug library does this for you, but no point setting up the stream if it isn't there
    if (process.env.DEBUG) {
      const debuggers = {};
      debuggers.core = index$2.Debug(`${rootLogger.getName()}:core`);
      rootLogger.addStream({
        name: 'debug',
        stream: new Stream.Writable({
          write: (chunk, encoding, next) => {
            const json = index$1.lib.parseJsonMap(chunk.toString());
            let debuggerName = 'core';
            if (index.lib.isString(json.log)) {
              debuggerName = json.log;
              if (!debuggers[debuggerName]) {
                debuggers[debuggerName] = index$2.Debug(`${rootLogger.getName()}:${debuggerName}`);
              }
            }
            const level = exports.LoggerLevel[index.lib.ensureNumber(json.level)];
            index.lib.ensure(debuggers[debuggerName])(`${level} ${json.msg}`);
            next();
          }
        }),
        // Consume all levels
        level: 0
      });
    }
    return rootLogger;
  }
  /**
   * Destroys the root `Logger`.
   *
   * @ignore
   */
  static destroyRoot() {
    if (this.rootLogger) {
      this.rootLogger.close();
      this.rootLogger = undefined;
    }
  }
  /**
   * Create a child of the root logger, inheriting this instance's configuration such as `level`, `streams`, etc.
   *
   * @param name The name of the child logger.
   * @param fields Additional fields included in all log lines.
   */
  static async child(name, fields) {
    return (await Logger$1.root()).child(name, fields);
  }
  /**
   * Gets a numeric `LoggerLevel` value by string name.
   *
   * @param {string} levelName The level name to convert to a `LoggerLevel` enum value.
   *
   * **Throws** *{@link SfdxError}{ name: 'UnrecognizedLoggerLevelName' }* The level name was not case-insensitively recognized as a valid `LoggerLevel` value.
   * @see {@Link LoggerLevel}
   */
  static getLevelByName(levelName) {
    levelName = levelName.toUpperCase();
    if (!index.lib.isKeyOf(exports.LoggerLevel, levelName)) {
      throw new sfdxError.SfdxError('UnrecognizedLoggerLevelName');
    }
    return exports.LoggerLevel[levelName];
  }
  /**
   * Adds a stream.
   *
   * @param stream The stream configuration to add.
   * @param defaultLevel The default level of the stream.
   */
  addStream(stream, defaultLevel) {
    if (this.format === exports.LoggerFormat.LOGFMT) {
      stream = this.createLogFmtFormatterStream(stream);
    }
    this.bunyan.addStream(stream, defaultLevel);
  }
  /**
   * Adds a file stream to this logger. Resolved or rejected upon completion of the addition.
   *
   * @param logFile The path to the log file.  If it doesn't exist it will be created.
   */
  async addLogFileStream(logFile) {
    try {
      // Check if we have write access to the log file (i.e., we created it already)
      await util_fs.fs.access(logFile, util_fs.fs.constants.W_OK);
    } catch (err1) {
      try {
        await util_fs.fs.mkdirp(path.dirname(logFile), {
          mode: util_fs.fs.DEFAULT_USER_DIR_MODE
        });
      } catch (err2) {
        // noop; directory exists already
      }
      try {
        await util_fs.fs.writeFile(logFile, '', { mode: util_fs.fs.DEFAULT_USER_FILE_MODE });
      } catch (err3) {
        throw sfdxError.SfdxError.wrap(err3);
      }
    }
    // avoid multiple streams to same log file
    if (
      !this.bunyan.streams.find(
        // tslint:disable-next-line:no-any No bunyan typings
        stream => stream.type === 'file' && stream.path === logFile
      )
    ) {
      // TODO: rotating-file
      // https://github.com/trentm/node-bunyan#stream-type-rotating-file
      this.addStream({
        type: 'file',
        path: logFile,
        level: this.bunyan.level()
      });
    }
  }
  /**
   * Gets the name of this logger.
   */
  getName() {
    return this.bunyan.name;
  }
  /**
   * Gets the current level of this logger.
   */
  getLevel() {
    return this.bunyan.level();
  }
  /**
   * Set the logging level of all streams for this logger.  If a specific `level` is not provided, this method will
   * attempt to read it from the environment variable `SFDX_LOG_LEVEL`, and if not found,
   * {@link Logger.DEFAULT_LOG_LEVEL} will be used instead. For convenience `this` object is returned.
   *
   * @param {LoggerLevelValue} [level] The logger level.
   *
   * **Throws** *{@link SfdxError}{ name: 'UnrecognizedLoggerLevelName' }* A value of `level` read from `SFDX_LOG_LEVEL`
   * was invalid.
   *
   * ```
   * // Sets the level from the environment or default value
   * logger.setLevel()
   *
   * // Set the level from the INFO enum
   * logger.setLevel(LoggerLevel.INFO)
   *
   * // Sets the level case-insensitively from a string value
   * logger.setLevel(Logger.getLevelByName('info'))
   * ```
   */
  setLevel(level) {
    if (level == null) {
      level = process.env.SFDX_LOG_LEVEL ? Logger$1.getLevelByName(process.env.SFDX_LOG_LEVEL) : Logger$1.DEFAULT_LEVEL;
    }
    this.bunyan.level(level);
    return this;
  }
  /**
   * Gets the underlying Bunyan logger.
   */
  // tslint:disable-next-line:no-any
  getBunyanLogger() {
    return this.bunyan;
  }
  /**
   * Compares the requested log level with the current log level.  Returns true if
   * the requested log level is greater than or equal to the current log level.
   *
   * @param level The requested log level to compare against the currently set log level.
   */
  shouldLog(level) {
    if (typeof level === 'string') {
      level = levelFromName_1(level);
    }
    return level >= this.getLevel();
  }
  /**
   * Use in-memory logging for this logger instance instead of any parent streams. Useful for testing.
   * For convenience this object is returned.
   *
   * **WARNING: This cannot be undone for this logger instance.**
   */
  useMemoryLogging() {
    this.bunyan.streams = [];
    this.bunyan.ringBuffer = new RingBuffer_1({ limit: 5000 });
    this.addStream({
      type: 'raw',
      stream: this.bunyan.ringBuffer,
      level: this.bunyan.level()
    });
    return this;
  }
  /**
   * Gets an array of log line objects. Each element is an object that corresponds to a log line.
   */
  getBufferedRecords() {
    if (this.bunyan.ringBuffer) {
      return this.bunyan.ringBuffer.records;
    }
    return [];
  }
  /**
   * Reads a text blob of all the log lines contained in memory or the log file.
   */
  readLogContentsAsText() {
    if (this.bunyan.ringBuffer) {
      return this.getBufferedRecords().reduce((accum, line) => {
        accum += JSON.stringify(line) + os$1.EOL;
        return accum;
      }, '');
    } else {
      let content = '';
      // tslint:disable-next-line:no-any No bunyan typings
      this.bunyan.streams.forEach(async stream => {
        if (stream.type === 'file') {
          content += await util_fs.fs.readFile(stream.path, 'utf8');
        }
      });
      return content;
    }
  }
  /**
   * Adds a filter to be applied to all logged messages.
   *
   * @param filter A function with signature `(...args: any[]) => any[]` that transforms log message arguments.
   */
  addFilter(filter) {
    // tslint:disable-line:no-any
    if (!this.bunyan.filters) {
      this.bunyan.filters = [];
    }
    this.bunyan.filters.push(filter);
  }
  /**
   * Close the logger, including any streams, and remove all listeners.
   *
   * @param fn A function with signature `(stream: LoggerStream) => void` to call for each stream with
   *                        the stream as an arg.
   */
  close(fn) {
    if (this.bunyan.streams) {
      try {
        this.bunyan.streams.forEach(entry => {
          if (fn) {
            fn(entry);
          }
          // close file streams, flush buffer to disk
          if (entry.type === 'file' && entry.stream && index.lib.isFunction(entry.stream.end)) {
            entry.stream.end();
          }
        });
      } finally {
        Logger$1.lifecycle.removeListener('uncaughtException', this.uncaughtExceptionHandler);
        Logger$1.lifecycle.removeListener('exit', this.exitHandler);
      }
    }
  }
  /**
   * Create a child logger, typically to add a few log record fields. For convenience this object is returned.
   *
   * @param name The name of the child logger that is emitted w/ log line as `log:<name>`.
   * @param fields Additional fields included in all log lines for the child logger.
   */
  child(name, fields = {}) {
    if (!name) {
      throw new sfdxError.SfdxError('LoggerNameRequired');
    }
    fields.log = name;
    const child = new Logger$1(name);
    // only support including additional fields on log line (no config)
    child.bunyan = this.bunyan.child(fields, true);
    child.bunyan.name = name;
    child.bunyan.filters = this.bunyan.filters;
    this.trace(`Setup child '${name}' logger instance`);
    return child;
  }
  /**
   * Add a field to all log lines for this logger. For convenience `this` object is returned.
   *
   * @param name The name of the field to add.
   * @param value The value of the field to be logged.
   */
  addField(name, value) {
    this.bunyan.fields[name] = value;
    return this;
  }
  /**
   * Logs at `trace` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  // tslint:disable-next-line:no-any
  trace(...args) {
    this.bunyan.trace(this.applyFilters(exports.LoggerLevel.TRACE, ...args));
    return this;
  }
  /**
   * Logs at `debug` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  debug(...args) {
    this.bunyan.debug(this.applyFilters(exports.LoggerLevel.DEBUG, ...args));
    return this;
  }
  /**
   * Logs at `debug` level with filtering applied.
   *
   * @param cb A callback that returns on array objects to be logged.
   */
  debugCallback(cb) {
    if (this.getLevel() === exports.LoggerLevel.DEBUG || process.env.DEBUG) {
      const result = cb();
      if (index.lib.isArray(result)) {
        this.bunyan.debug(this.applyFilters(exports.LoggerLevel.DEBUG, ...result));
      } else {
        this.bunyan.debug(this.applyFilters(exports.LoggerLevel.DEBUG, ...[result]));
      }
    }
  }
  /**
   * Logs at `info` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  info(...args) {
    this.bunyan.info(this.applyFilters(exports.LoggerLevel.INFO, ...args));
    return this;
  }
  /**
   * Logs at `warn` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  warn(...args) {
    this.bunyan.warn(this.applyFilters(exports.LoggerLevel.WARN, ...args));
    return this;
  }
  /**
   * Logs at `error` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  error(...args) {
    this.bunyan.error(this.applyFilters(exports.LoggerLevel.ERROR, ...args));
    return this;
  }
  /**
   * Logs at `fatal` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  fatal(...args) {
    // always show fatal to stderr
    console.error(...args);
    this.bunyan.fatal(this.applyFilters(exports.LoggerLevel.FATAL, ...args));
    return this;
  }
  applyFilters(logLevel, ...args) {
    if (this.shouldLog(logLevel)) {
      // tslint:disable-next-line:no-any No bunyan typings
      this.bunyan.filters.forEach(filter => (args = filter(...args)));
    }
    return args && args.length === 1 ? args[0] : args;
  }
  createLogFmtFormatterStream(loggerStream) {
    const logFmtWriteableStream = new Stream.Writable({
      write: (chunk, enc, cb) => {
        try {
          const parsedJSON = JSON.parse(chunk.toString());
          const keys = Object.keys(parsedJSON);
          let logEntry = '';
          keys.forEach(key => {
            let logMsg = `${parsedJSON[key]}`;
            if (logMsg.trim().includes(' ')) {
              logMsg = `"${logMsg}"`;
            }
            logEntry += `${key}=${logMsg} `;
          });
          if (loggerStream.stream) {
            loggerStream.stream.write(logEntry.trimRight() + '\n');
          }
        } catch (error) {
          if (loggerStream.stream) {
            loggerStream.stream.write(chunk.toString());
          }
        }
        cb(null);
      }
    });
    return Object.assign({}, loggerStream, { stream: logFmtWriteableStream });
  }
}
/**
 * The name of the root sfdx `Logger`.
 */
Logger$1.ROOT_NAME = 'sfdx';
/**
 * The default `LoggerLevel` when constructing new `Logger` instances.
 */
Logger$1.DEFAULT_LEVEL = exports.LoggerLevel.WARN;
/**
 * A list of all lower case `LoggerLevel` names.
 *
 * **See** {@link LoggerLevel}
 */
Logger$1.LEVEL_NAMES = Object.values(exports.LoggerLevel)
  .filter(index.lib.isString)
  .map(v => v.toLowerCase());
// Rollup all instance-specific process event listeners together to prevent global `MaxListenersExceededWarning`s.
Logger$1.lifecycle = (() => {
  const events$1 = new events.EventEmitter();
  events$1.setMaxListeners(0); // never warn on listener counts
  process.on('uncaughtException', err => events$1.emit('uncaughtException', err));
  process.on('exit', () => events$1.emit('exit'));
  return events$1;
})();
// Ok to log clientid
const FILTERED_KEYS = [
  'sid',
  'Authorization',
  // Any json attribute that contains the words "access" and "token" will have the attribute/value hidden
  { name: 'access_token', regex: 'access[^\'"]*token' },
  // Any json attribute that contains the words "refresh" and "token" will have the attribute/value hidden
  { name: 'refresh_token', regex: 'refresh[^\'"]*token' },
  'clientsecret',
  // Any json attribute that contains the words "sfdx", "auth", and "url" will have the attribute/value hidden
  { name: 'sfdxauthurl', regex: 'sfdx[^\'"]*auth[^\'"]*url' }
];
// SFDX code and plugins should never show tokens or connect app information in the logs
const _filter = (...args) => {
  return args.map(arg => {
    if (index.lib.isArray(arg)) {
      return _filter(...arg);
    }
    if (arg) {
      let _arg;
      // Normalize all objects into a string. This include errors.
      if (arg instanceof Buffer) {
        _arg = '<Buffer>';
      } else if (index.lib.isObject(arg)) {
        _arg = JSON.stringify(arg);
      } else if (index.lib.isString(arg)) {
        _arg = arg;
      } else {
        _arg = '';
      }
      const HIDDEN = 'HIDDEN';
      FILTERED_KEYS.forEach(key => {
        let expElement = key;
        let expName = key;
        // Filtered keys can be strings or objects containing regular expression components.
        if (index.lib.isPlainObject(key)) {
          expElement = key.regex;
          expName = key.name;
        }
        const hiddenAttrMessage = `"<${expName} - ${HIDDEN}>"`;
        // Match all json attribute values case insensitive: ex. {" Access*^&(*()^* Token " : " 45143075913458901348905 \n\t" ...}
        const regexTokens = new RegExp(`(['"][^'"]*${expElement}[^'"]*['"]\\s*:\\s*)['"][^'"]*['"]`, 'gi');
        _arg = _arg.replace(regexTokens, `$1${hiddenAttrMessage}`);
        // Match all key value attribute case insensitive: ex. {" key\t"    : ' access_token  ' , " value " : "  dsafgasr431 " ....}
        const keyRegex = new RegExp(
          `(['"]\\s*key\\s*['"]\\s*:)\\s*['"]\\s*${expElement}\\s*['"]\\s*.\\s*['"]\\s*value\\s*['"]\\s*:\\s*['"]\\s*[^'"]*['"]`,
          'gi'
        );
        _arg = _arg.replace(keyRegex, `$1${hiddenAttrMessage}`);
      });
      // This is a jsforce message we are masking. This can be removed after the following pull request is committed
      // and pushed to a jsforce release.
      //
      // Looking  For: "Refreshed access token = ..."
      // Related Jsforce pull requests:
      //  https://github.com/jsforce/jsforce/pull/598
      //  https://github.com/jsforce/jsforce/pull/608
      //  https://github.com/jsforce/jsforce/pull/609
      const jsForceTokenRefreshRegEx = new RegExp('Refreshed(.*)access(.*)token(.*)=\\s*[^\'"\\s*]*');
      _arg = _arg.replace(jsForceTokenRefreshRegEx, `<refresh_token - ${HIDDEN}>`);
      _arg = _arg.replace(/sid=(.*)/, `sid=<${HIDDEN}>`);
      // return an object if an object was logged; otherwise return the filtered string.
      return index.lib.isObject(arg) ? index$1.lib.parseJson(_arg) : _arg;
    } else {
      return arg;
    }
  });
};

exports.Logger = Logger$1;
//# sourceMappingURL=logger.js.map
