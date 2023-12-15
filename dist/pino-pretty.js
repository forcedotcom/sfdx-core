'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) =>
  function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

// node_modules/colorette/index.cjs
var require_colorette = __commonJS({
  'node_modules/colorette/index.cjs'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    var tty = require('tty');
    function _interopNamespace(e) {
      if (e && e.__esModule) return e;
      var n = /* @__PURE__ */ Object.create(null);
      if (e) {
        Object.keys(e).forEach(function (k) {
          if (k !== 'default') {
            var d = Object.getOwnPropertyDescriptor(e, k);
            Object.defineProperty(
              n,
              k,
              d.get
                ? d
                : {
                    enumerable: true,
                    get: function () {
                      return e[k];
                    },
                  }
            );
          }
        });
      }
      n['default'] = e;
      return Object.freeze(n);
    }
    var tty__namespace = /* @__PURE__ */ _interopNamespace(tty);
    var { env = {}, argv = [], platform = '' } = typeof process === 'undefined' ? {} : process;
    var isDisabled = 'NO_COLOR' in env || argv.includes('--no-color');
    var isForced = 'FORCE_COLOR' in env || argv.includes('--color');
    var isWindows = platform === 'win32';
    var isDumbTerminal = env.TERM === 'dumb';
    var isCompatibleTerminal =
      tty__namespace && tty__namespace.isatty && tty__namespace.isatty(1) && env.TERM && !isDumbTerminal;
    var isCI = 'CI' in env && ('GITHUB_ACTIONS' in env || 'GITLAB_CI' in env || 'CIRCLECI' in env);
    var isColorSupported2 = !isDisabled && (isForced || (isWindows && !isDumbTerminal) || isCompatibleTerminal || isCI);
    var replaceClose = (
      index,
      string,
      close,
      replace,
      head = string.substring(0, index) + replace,
      tail = string.substring(index + close.length),
      next = tail.indexOf(close)
    ) => head + (next < 0 ? tail : replaceClose(next, tail, close, replace));
    var clearBleed = (index, string, open, close, replace) =>
      index < 0 ? open + string + close : open + replaceClose(index, string, close, replace) + close;
    var filterEmpty =
      (open, close, replace = open, at = open.length + 1) =>
      (string) =>
        string || !(string === '' || string === void 0)
          ? clearBleed(('' + string).indexOf(close, at), string, open, close, replace)
          : '';
    var init = (open, close, replace) => filterEmpty(`\x1B[${open}m`, `\x1B[${close}m`, replace);
    var colors2 = {
      reset: init(0, 0),
      bold: init(1, 22, '\x1B[22m\x1B[1m'),
      dim: init(2, 22, '\x1B[22m\x1B[2m'),
      italic: init(3, 23),
      underline: init(4, 24),
      inverse: init(7, 27),
      hidden: init(8, 28),
      strikethrough: init(9, 29),
      black: init(30, 39),
      red: init(31, 39),
      green: init(32, 39),
      yellow: init(33, 39),
      blue: init(34, 39),
      magenta: init(35, 39),
      cyan: init(36, 39),
      white: init(37, 39),
      gray: init(90, 39),
      bgBlack: init(40, 49),
      bgRed: init(41, 49),
      bgGreen: init(42, 49),
      bgYellow: init(43, 49),
      bgBlue: init(44, 49),
      bgMagenta: init(45, 49),
      bgCyan: init(46, 49),
      bgWhite: init(47, 49),
      blackBright: init(90, 39),
      redBright: init(91, 39),
      greenBright: init(92, 39),
      yellowBright: init(93, 39),
      blueBright: init(94, 39),
      magentaBright: init(95, 39),
      cyanBright: init(96, 39),
      whiteBright: init(97, 39),
      bgBlackBright: init(100, 49),
      bgRedBright: init(101, 49),
      bgGreenBright: init(102, 49),
      bgYellowBright: init(103, 49),
      bgBlueBright: init(104, 49),
      bgMagentaBright: init(105, 49),
      bgCyanBright: init(106, 49),
      bgWhiteBright: init(107, 49),
    };
    var createColors = ({ useColor = isColorSupported2 } = {}) =>
      useColor ? colors2 : Object.keys(colors2).reduce((colors3, key) => ({ ...colors3, [key]: String }), {});
    var {
      reset,
      bold,
      dim,
      italic,
      underline,
      inverse,
      hidden,
      strikethrough,
      black,
      red,
      green,
      yellow,
      blue,
      magenta,
      cyan,
      white,
      gray,
      bgBlack,
      bgRed,
      bgGreen,
      bgYellow,
      bgBlue,
      bgMagenta,
      bgCyan,
      bgWhite,
      blackBright,
      redBright,
      greenBright,
      yellowBright,
      blueBright,
      magentaBright,
      cyanBright,
      whiteBright,
      bgBlackBright,
      bgRedBright,
      bgGreenBright,
      bgYellowBright,
      bgBlueBright,
      bgMagentaBright,
      bgCyanBright,
      bgWhiteBright,
    } = createColors();
    exports2.bgBlack = bgBlack;
    exports2.bgBlackBright = bgBlackBright;
    exports2.bgBlue = bgBlue;
    exports2.bgBlueBright = bgBlueBright;
    exports2.bgCyan = bgCyan;
    exports2.bgCyanBright = bgCyanBright;
    exports2.bgGreen = bgGreen;
    exports2.bgGreenBright = bgGreenBright;
    exports2.bgMagenta = bgMagenta;
    exports2.bgMagentaBright = bgMagentaBright;
    exports2.bgRed = bgRed;
    exports2.bgRedBright = bgRedBright;
    exports2.bgWhite = bgWhite;
    exports2.bgWhiteBright = bgWhiteBright;
    exports2.bgYellow = bgYellow;
    exports2.bgYellowBright = bgYellowBright;
    exports2.black = black;
    exports2.blackBright = blackBright;
    exports2.blue = blue;
    exports2.blueBright = blueBright;
    exports2.bold = bold;
    exports2.createColors = createColors;
    exports2.cyan = cyan;
    exports2.cyanBright = cyanBright;
    exports2.dim = dim;
    exports2.gray = gray;
    exports2.green = green;
    exports2.greenBright = greenBright;
    exports2.hidden = hidden;
    exports2.inverse = inverse;
    exports2.isColorSupported = isColorSupported2;
    exports2.italic = italic;
    exports2.magenta = magenta;
    exports2.magentaBright = magentaBright;
    exports2.red = red;
    exports2.redBright = redBright;
    exports2.reset = reset;
    exports2.strikethrough = strikethrough;
    exports2.underline = underline;
    exports2.white = white;
    exports2.whiteBright = whiteBright;
    exports2.yellow = yellow;
    exports2.yellowBright = yellowBright;
  },
});

// node_modules/wrappy/wrappy.js
var require_wrappy = __commonJS({
  'node_modules/wrappy/wrappy.js'(exports2, module2) {
    module2.exports = wrappy;
    function wrappy(fn, cb) {
      if (fn && cb) return wrappy(fn)(cb);
      if (typeof fn !== 'function') throw new TypeError('need wrapper function');
      Object.keys(fn).forEach(function (k) {
        wrapper[k] = fn[k];
      });
      return wrapper;
      function wrapper() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        var ret = fn.apply(this, args);
        var cb2 = args[args.length - 1];
        if (typeof ret === 'function' && ret !== cb2) {
          Object.keys(cb2).forEach(function (k) {
            ret[k] = cb2[k];
          });
        }
        return ret;
      }
    }
  },
});

// node_modules/once/once.js
var require_once = __commonJS({
  'node_modules/once/once.js'(exports2, module2) {
    var wrappy = require_wrappy();
    module2.exports = wrappy(once);
    module2.exports.strict = wrappy(onceStrict);
    once.proto = once(function () {
      Object.defineProperty(Function.prototype, 'once', {
        value: function () {
          return once(this);
        },
        configurable: true,
      });
      Object.defineProperty(Function.prototype, 'onceStrict', {
        value: function () {
          return onceStrict(this);
        },
        configurable: true,
      });
    });
    function once(fn) {
      var f = function () {
        if (f.called) return f.value;
        f.called = true;
        return (f.value = fn.apply(this, arguments));
      };
      f.called = false;
      return f;
    }
    function onceStrict(fn) {
      var f = function () {
        if (f.called) throw new Error(f.onceError);
        f.called = true;
        return (f.value = fn.apply(this, arguments));
      };
      var name = fn.name || 'Function wrapped with `once`';
      f.onceError = name + " shouldn't be called more than once";
      f.called = false;
      return f;
    }
  },
});

// node_modules/end-of-stream/index.js
var require_end_of_stream = __commonJS({
  'node_modules/end-of-stream/index.js'(exports2, module2) {
    var once = require_once();
    var noop = function () {};
    var isRequest = function (stream) {
      return stream.setHeader && typeof stream.abort === 'function';
    };
    var isChildProcess = function (stream) {
      return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3;
    };
    var eos = function (stream, opts, callback) {
      if (typeof opts === 'function') return eos(stream, null, opts);
      if (!opts) opts = {};
      callback = once(callback || noop);
      var ws = stream._writableState;
      var rs = stream._readableState;
      var readable = opts.readable || (opts.readable !== false && stream.readable);
      var writable = opts.writable || (opts.writable !== false && stream.writable);
      var cancelled = false;
      var onlegacyfinish = function () {
        if (!stream.writable) onfinish();
      };
      var onfinish = function () {
        writable = false;
        if (!readable) callback.call(stream);
      };
      var onend = function () {
        readable = false;
        if (!writable) callback.call(stream);
      };
      var onexit = function (exitCode) {
        callback.call(stream, exitCode ? new Error('exited with error code: ' + exitCode) : null);
      };
      var onerror = function (err) {
        callback.call(stream, err);
      };
      var onclose = function () {
        process.nextTick(onclosenexttick);
      };
      var onclosenexttick = function () {
        if (cancelled) return;
        if (readable && !(rs && rs.ended && !rs.destroyed)) return callback.call(stream, new Error('premature close'));
        if (writable && !(ws && ws.ended && !ws.destroyed)) return callback.call(stream, new Error('premature close'));
      };
      var onrequest = function () {
        stream.req.on('finish', onfinish);
      };
      if (isRequest(stream)) {
        stream.on('complete', onfinish);
        stream.on('abort', onclose);
        if (stream.req) onrequest();
        else stream.on('request', onrequest);
      } else if (writable && !ws) {
        stream.on('end', onlegacyfinish);
        stream.on('close', onlegacyfinish);
      }
      if (isChildProcess(stream)) stream.on('exit', onexit);
      stream.on('end', onend);
      stream.on('finish', onfinish);
      if (opts.error !== false) stream.on('error', onerror);
      stream.on('close', onclose);
      return function () {
        cancelled = true;
        stream.removeListener('complete', onfinish);
        stream.removeListener('abort', onclose);
        stream.removeListener('request', onrequest);
        if (stream.req) stream.req.removeListener('finish', onfinish);
        stream.removeListener('end', onlegacyfinish);
        stream.removeListener('close', onlegacyfinish);
        stream.removeListener('finish', onfinish);
        stream.removeListener('exit', onexit);
        stream.removeListener('end', onend);
        stream.removeListener('error', onerror);
        stream.removeListener('close', onclose);
      };
    };
    module2.exports = eos;
  },
});

// node_modules/pump/index.js
var require_pump = __commonJS({
  'node_modules/pump/index.js'(exports2, module2) {
    var once = require_once();
    var eos = require_end_of_stream();
    var fs = require('fs');
    var noop = function () {};
    var ancient = /^v?\.0/.test(process.version);
    var isFn = function (fn) {
      return typeof fn === 'function';
    };
    var isFS = function (stream) {
      if (!ancient) return false;
      if (!fs) return false;
      return (
        (stream instanceof (fs.ReadStream || noop) || stream instanceof (fs.WriteStream || noop)) && isFn(stream.close)
      );
    };
    var isRequest = function (stream) {
      return stream.setHeader && isFn(stream.abort);
    };
    var destroyer = function (stream, reading, writing, callback) {
      callback = once(callback);
      var closed = false;
      stream.on('close', function () {
        closed = true;
      });
      eos(stream, { readable: reading, writable: writing }, function (err) {
        if (err) return callback(err);
        closed = true;
        callback();
      });
      var destroyed = false;
      return function (err) {
        if (closed) return;
        if (destroyed) return;
        destroyed = true;
        if (isFS(stream)) return stream.close(noop);
        if (isRequest(stream)) return stream.abort();
        if (isFn(stream.destroy)) return stream.destroy();
        callback(err || new Error('stream was destroyed'));
      };
    };
    var call = function (fn) {
      fn();
    };
    var pipe = function (from, to) {
      return from.pipe(to);
    };
    var pump2 = function () {
      var streams = Array.prototype.slice.call(arguments);
      var callback = (isFn(streams[streams.length - 1] || noop) && streams.pop()) || noop;
      if (Array.isArray(streams[0])) streams = streams[0];
      if (streams.length < 2) throw new Error('pump requires two streams per minimum');
      var error;
      var destroys = streams.map(function (stream, i) {
        var reading = i < streams.length - 1;
        var writing = i > 0;
        return destroyer(stream, reading, writing, function (err) {
          if (!error) error = err;
          if (err) destroys.forEach(call);
          if (reading) return;
          destroys.forEach(call);
          callback(error);
        });
      });
      return streams.reduce(pipe);
    };
    module2.exports = pump2;
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/ours/primordials.js
var require_primordials = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/ours/primordials.js'(exports2, module2) {
    'use strict';
    module2.exports = {
      ArrayIsArray(self) {
        return Array.isArray(self);
      },
      ArrayPrototypeIncludes(self, el) {
        return self.includes(el);
      },
      ArrayPrototypeIndexOf(self, el) {
        return self.indexOf(el);
      },
      ArrayPrototypeJoin(self, sep) {
        return self.join(sep);
      },
      ArrayPrototypeMap(self, fn) {
        return self.map(fn);
      },
      ArrayPrototypePop(self, el) {
        return self.pop(el);
      },
      ArrayPrototypePush(self, el) {
        return self.push(el);
      },
      ArrayPrototypeSlice(self, start, end) {
        return self.slice(start, end);
      },
      Error,
      FunctionPrototypeCall(fn, thisArgs, ...args) {
        return fn.call(thisArgs, ...args);
      },
      FunctionPrototypeSymbolHasInstance(self, instance) {
        return Function.prototype[Symbol.hasInstance].call(self, instance);
      },
      MathFloor: Math.floor,
      Number,
      NumberIsInteger: Number.isInteger,
      NumberIsNaN: Number.isNaN,
      NumberMAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
      NumberMIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
      NumberParseInt: Number.parseInt,
      ObjectDefineProperties(self, props) {
        return Object.defineProperties(self, props);
      },
      ObjectDefineProperty(self, name, prop) {
        return Object.defineProperty(self, name, prop);
      },
      ObjectGetOwnPropertyDescriptor(self, name) {
        return Object.getOwnPropertyDescriptor(self, name);
      },
      ObjectKeys(obj) {
        return Object.keys(obj);
      },
      ObjectSetPrototypeOf(target, proto) {
        return Object.setPrototypeOf(target, proto);
      },
      Promise,
      PromisePrototypeCatch(self, fn) {
        return self.catch(fn);
      },
      PromisePrototypeThen(self, thenFn, catchFn) {
        return self.then(thenFn, catchFn);
      },
      PromiseReject(err) {
        return Promise.reject(err);
      },
      ReflectApply: Reflect.apply,
      RegExpPrototypeTest(self, value) {
        return self.test(value);
      },
      SafeSet: Set,
      String,
      StringPrototypeSlice(self, start, end) {
        return self.slice(start, end);
      },
      StringPrototypeToLowerCase(self) {
        return self.toLowerCase();
      },
      StringPrototypeToUpperCase(self) {
        return self.toUpperCase();
      },
      StringPrototypeTrim(self) {
        return self.trim();
      },
      Symbol,
      SymbolFor: Symbol.for,
      SymbolAsyncIterator: Symbol.asyncIterator,
      SymbolHasInstance: Symbol.hasInstance,
      SymbolIterator: Symbol.iterator,
      TypedArrayPrototypeSet(self, buf, len) {
        return self.set(buf, len);
      },
      Uint8Array,
    };
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/ours/util.js
var require_util = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/ours/util.js'(exports2, module2) {
    'use strict';
    var bufferModule = require('buffer');
    var AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    var Blob = globalThis.Blob || bufferModule.Blob;
    var isBlob =
      typeof Blob !== 'undefined'
        ? function isBlob2(b) {
            return b instanceof Blob;
          }
        : function isBlob2(b) {
            return false;
          };
    var AggregateError = class extends Error {
      constructor(errors) {
        if (!Array.isArray(errors)) {
          throw new TypeError(`Expected input to be an Array, got ${typeof errors}`);
        }
        let message = '';
        for (let i = 0; i < errors.length; i++) {
          message += `    ${errors[i].stack}
`;
        }
        super(message);
        this.name = 'AggregateError';
        this.errors = errors;
      }
    };
    module2.exports = {
      AggregateError,
      kEmptyObject: Object.freeze({}),
      once(callback) {
        let called = false;
        return function (...args) {
          if (called) {
            return;
          }
          called = true;
          callback.apply(this, args);
        };
      },
      createDeferredPromise: function () {
        let resolve;
        let reject;
        const promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        return {
          promise,
          resolve,
          reject,
        };
      },
      promisify(fn) {
        return new Promise((resolve, reject) => {
          fn((err, ...args) => {
            if (err) {
              return reject(err);
            }
            return resolve(...args);
          });
        });
      },
      debuglog() {
        return function () {};
      },
      format(format, ...args) {
        return format.replace(/%([sdifj])/g, function (...[_unused, type]) {
          const replacement = args.shift();
          if (type === 'f') {
            return replacement.toFixed(6);
          } else if (type === 'j') {
            return JSON.stringify(replacement);
          } else if (type === 's' && typeof replacement === 'object') {
            const ctor = replacement.constructor !== Object ? replacement.constructor.name : '';
            return `${ctor} {}`.trim();
          } else {
            return replacement.toString();
          }
        });
      },
      inspect(value) {
        switch (typeof value) {
          case 'string':
            if (value.includes("'")) {
              if (!value.includes('"')) {
                return `"${value}"`;
              } else if (!value.includes('`') && !value.includes('${')) {
                return `\`${value}\``;
              }
            }
            return `'${value}'`;
          case 'number':
            if (isNaN(value)) {
              return 'NaN';
            } else if (Object.is(value, -0)) {
              return String(value);
            }
            return value;
          case 'bigint':
            return `${String(value)}n`;
          case 'boolean':
          case 'undefined':
            return String(value);
          case 'object':
            return '{}';
        }
      },
      types: {
        isAsyncFunction(fn) {
          return fn instanceof AsyncFunction;
        },
        isArrayBufferView(arr) {
          return ArrayBuffer.isView(arr);
        },
      },
      isBlob,
    };
    module2.exports.promisify.custom = Symbol.for('nodejs.util.promisify.custom');
  },
});

// node_modules/event-target-shim/dist/event-target-shim.js
var require_event_target_shim = __commonJS({
  'node_modules/event-target-shim/dist/event-target-shim.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    var privateData = /* @__PURE__ */ new WeakMap();
    var wrappers = /* @__PURE__ */ new WeakMap();
    function pd(event) {
      const retv = privateData.get(event);
      console.assert(retv != null, "'this' is expected an Event object, but got", event);
      return retv;
    }
    function setCancelFlag(data) {
      if (data.passiveListener != null) {
        if (typeof console !== 'undefined' && typeof console.error === 'function') {
          console.error('Unable to preventDefault inside passive event listener invocation.', data.passiveListener);
        }
        return;
      }
      if (!data.event.cancelable) {
        return;
      }
      data.canceled = true;
      if (typeof data.event.preventDefault === 'function') {
        data.event.preventDefault();
      }
    }
    function Event(eventTarget, event) {
      privateData.set(this, {
        eventTarget,
        event,
        eventPhase: 2,
        currentTarget: eventTarget,
        canceled: false,
        stopped: false,
        immediateStopped: false,
        passiveListener: null,
        timeStamp: event.timeStamp || Date.now(),
      });
      Object.defineProperty(this, 'isTrusted', { value: false, enumerable: true });
      const keys = Object.keys(event);
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        if (!(key in this)) {
          Object.defineProperty(this, key, defineRedirectDescriptor(key));
        }
      }
    }
    Event.prototype = {
      /**
       * The type of this event.
       * @type {string}
       */
      get type() {
        return pd(this).event.type;
      },
      /**
       * The target of this event.
       * @type {EventTarget}
       */
      get target() {
        return pd(this).eventTarget;
      },
      /**
       * The target of this event.
       * @type {EventTarget}
       */
      get currentTarget() {
        return pd(this).currentTarget;
      },
      /**
       * @returns {EventTarget[]} The composed path of this event.
       */
      composedPath() {
        const currentTarget = pd(this).currentTarget;
        if (currentTarget == null) {
          return [];
        }
        return [currentTarget];
      },
      /**
       * Constant of NONE.
       * @type {number}
       */
      get NONE() {
        return 0;
      },
      /**
       * Constant of CAPTURING_PHASE.
       * @type {number}
       */
      get CAPTURING_PHASE() {
        return 1;
      },
      /**
       * Constant of AT_TARGET.
       * @type {number}
       */
      get AT_TARGET() {
        return 2;
      },
      /**
       * Constant of BUBBLING_PHASE.
       * @type {number}
       */
      get BUBBLING_PHASE() {
        return 3;
      },
      /**
       * The target of this event.
       * @type {number}
       */
      get eventPhase() {
        return pd(this).eventPhase;
      },
      /**
       * Stop event bubbling.
       * @returns {void}
       */
      stopPropagation() {
        const data = pd(this);
        data.stopped = true;
        if (typeof data.event.stopPropagation === 'function') {
          data.event.stopPropagation();
        }
      },
      /**
       * Stop event bubbling.
       * @returns {void}
       */
      stopImmediatePropagation() {
        const data = pd(this);
        data.stopped = true;
        data.immediateStopped = true;
        if (typeof data.event.stopImmediatePropagation === 'function') {
          data.event.stopImmediatePropagation();
        }
      },
      /**
       * The flag to be bubbling.
       * @type {boolean}
       */
      get bubbles() {
        return Boolean(pd(this).event.bubbles);
      },
      /**
       * The flag to be cancelable.
       * @type {boolean}
       */
      get cancelable() {
        return Boolean(pd(this).event.cancelable);
      },
      /**
       * Cancel this event.
       * @returns {void}
       */
      preventDefault() {
        setCancelFlag(pd(this));
      },
      /**
       * The flag to indicate cancellation state.
       * @type {boolean}
       */
      get defaultPrevented() {
        return pd(this).canceled;
      },
      /**
       * The flag to be composed.
       * @type {boolean}
       */
      get composed() {
        return Boolean(pd(this).event.composed);
      },
      /**
       * The unix time of this event.
       * @type {number}
       */
      get timeStamp() {
        return pd(this).timeStamp;
      },
      /**
       * The target of this event.
       * @type {EventTarget}
       * @deprecated
       */
      get srcElement() {
        return pd(this).eventTarget;
      },
      /**
       * The flag to stop event bubbling.
       * @type {boolean}
       * @deprecated
       */
      get cancelBubble() {
        return pd(this).stopped;
      },
      set cancelBubble(value) {
        if (!value) {
          return;
        }
        const data = pd(this);
        data.stopped = true;
        if (typeof data.event.cancelBubble === 'boolean') {
          data.event.cancelBubble = true;
        }
      },
      /**
       * The flag to indicate cancellation state.
       * @type {boolean}
       * @deprecated
       */
      get returnValue() {
        return !pd(this).canceled;
      },
      set returnValue(value) {
        if (!value) {
          setCancelFlag(pd(this));
        }
      },
      /**
       * Initialize this event object. But do nothing under event dispatching.
       * @param {string} type The event type.
       * @param {boolean} [bubbles=false] The flag to be possible to bubble up.
       * @param {boolean} [cancelable=false] The flag to be possible to cancel.
       * @deprecated
       */
      initEvent() {},
    };
    Object.defineProperty(Event.prototype, 'constructor', {
      value: Event,
      configurable: true,
      writable: true,
    });
    if (typeof window !== 'undefined' && typeof window.Event !== 'undefined') {
      Object.setPrototypeOf(Event.prototype, window.Event.prototype);
      wrappers.set(window.Event.prototype, Event);
    }
    function defineRedirectDescriptor(key) {
      return {
        get() {
          return pd(this).event[key];
        },
        set(value) {
          pd(this).event[key] = value;
        },
        configurable: true,
        enumerable: true,
      };
    }
    function defineCallDescriptor(key) {
      return {
        value() {
          const event = pd(this).event;
          return event[key].apply(event, arguments);
        },
        configurable: true,
        enumerable: true,
      };
    }
    function defineWrapper(BaseEvent, proto) {
      const keys = Object.keys(proto);
      if (keys.length === 0) {
        return BaseEvent;
      }
      function CustomEvent(eventTarget, event) {
        BaseEvent.call(this, eventTarget, event);
      }
      CustomEvent.prototype = Object.create(BaseEvent.prototype, {
        constructor: { value: CustomEvent, configurable: true, writable: true },
      });
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        if (!(key in BaseEvent.prototype)) {
          const descriptor = Object.getOwnPropertyDescriptor(proto, key);
          const isFunc = typeof descriptor.value === 'function';
          Object.defineProperty(
            CustomEvent.prototype,
            key,
            isFunc ? defineCallDescriptor(key) : defineRedirectDescriptor(key)
          );
        }
      }
      return CustomEvent;
    }
    function getWrapper(proto) {
      if (proto == null || proto === Object.prototype) {
        return Event;
      }
      let wrapper = wrappers.get(proto);
      if (wrapper == null) {
        wrapper = defineWrapper(getWrapper(Object.getPrototypeOf(proto)), proto);
        wrappers.set(proto, wrapper);
      }
      return wrapper;
    }
    function wrapEvent(eventTarget, event) {
      const Wrapper = getWrapper(Object.getPrototypeOf(event));
      return new Wrapper(eventTarget, event);
    }
    function isStopped(event) {
      return pd(event).immediateStopped;
    }
    function setEventPhase(event, eventPhase) {
      pd(event).eventPhase = eventPhase;
    }
    function setCurrentTarget(event, currentTarget) {
      pd(event).currentTarget = currentTarget;
    }
    function setPassiveListener(event, passiveListener) {
      pd(event).passiveListener = passiveListener;
    }
    var listenersMap = /* @__PURE__ */ new WeakMap();
    var CAPTURE = 1;
    var BUBBLE = 2;
    var ATTRIBUTE = 3;
    function isObject(x) {
      return x !== null && typeof x === 'object';
    }
    function getListeners(eventTarget) {
      const listeners = listenersMap.get(eventTarget);
      if (listeners == null) {
        throw new TypeError("'this' is expected an EventTarget object, but got another value.");
      }
      return listeners;
    }
    function defineEventAttributeDescriptor(eventName) {
      return {
        get() {
          const listeners = getListeners(this);
          let node = listeners.get(eventName);
          while (node != null) {
            if (node.listenerType === ATTRIBUTE) {
              return node.listener;
            }
            node = node.next;
          }
          return null;
        },
        set(listener) {
          if (typeof listener !== 'function' && !isObject(listener)) {
            listener = null;
          }
          const listeners = getListeners(this);
          let prev = null;
          let node = listeners.get(eventName);
          while (node != null) {
            if (node.listenerType === ATTRIBUTE) {
              if (prev !== null) {
                prev.next = node.next;
              } else if (node.next !== null) {
                listeners.set(eventName, node.next);
              } else {
                listeners.delete(eventName);
              }
            } else {
              prev = node;
            }
            node = node.next;
          }
          if (listener !== null) {
            const newNode = {
              listener,
              listenerType: ATTRIBUTE,
              passive: false,
              once: false,
              next: null,
            };
            if (prev === null) {
              listeners.set(eventName, newNode);
            } else {
              prev.next = newNode;
            }
          }
        },
        configurable: true,
        enumerable: true,
      };
    }
    function defineEventAttribute(eventTargetPrototype, eventName) {
      Object.defineProperty(eventTargetPrototype, `on${eventName}`, defineEventAttributeDescriptor(eventName));
    }
    function defineCustomEventTarget(eventNames) {
      function CustomEventTarget() {
        EventTarget.call(this);
      }
      CustomEventTarget.prototype = Object.create(EventTarget.prototype, {
        constructor: {
          value: CustomEventTarget,
          configurable: true,
          writable: true,
        },
      });
      for (let i = 0; i < eventNames.length; ++i) {
        defineEventAttribute(CustomEventTarget.prototype, eventNames[i]);
      }
      return CustomEventTarget;
    }
    function EventTarget() {
      if (this instanceof EventTarget) {
        listenersMap.set(this, /* @__PURE__ */ new Map());
        return;
      }
      if (arguments.length === 1 && Array.isArray(arguments[0])) {
        return defineCustomEventTarget(arguments[0]);
      }
      if (arguments.length > 0) {
        const types = new Array(arguments.length);
        for (let i = 0; i < arguments.length; ++i) {
          types[i] = arguments[i];
        }
        return defineCustomEventTarget(types);
      }
      throw new TypeError('Cannot call a class as a function');
    }
    EventTarget.prototype = {
      /**
       * Add a given listener to this event target.
       * @param {string} eventName The event name to add.
       * @param {Function} listener The listener to add.
       * @param {boolean|{capture?:boolean,passive?:boolean,once?:boolean}} [options] The options for this listener.
       * @returns {void}
       */
      addEventListener(eventName, listener, options) {
        if (listener == null) {
          return;
        }
        if (typeof listener !== 'function' && !isObject(listener)) {
          throw new TypeError("'listener' should be a function or an object.");
        }
        const listeners = getListeners(this);
        const optionsIsObj = isObject(options);
        const capture = optionsIsObj ? Boolean(options.capture) : Boolean(options);
        const listenerType = capture ? CAPTURE : BUBBLE;
        const newNode = {
          listener,
          listenerType,
          passive: optionsIsObj && Boolean(options.passive),
          once: optionsIsObj && Boolean(options.once),
          next: null,
        };
        let node = listeners.get(eventName);
        if (node === void 0) {
          listeners.set(eventName, newNode);
          return;
        }
        let prev = null;
        while (node != null) {
          if (node.listener === listener && node.listenerType === listenerType) {
            return;
          }
          prev = node;
          node = node.next;
        }
        prev.next = newNode;
      },
      /**
       * Remove a given listener from this event target.
       * @param {string} eventName The event name to remove.
       * @param {Function} listener The listener to remove.
       * @param {boolean|{capture?:boolean,passive?:boolean,once?:boolean}} [options] The options for this listener.
       * @returns {void}
       */
      removeEventListener(eventName, listener, options) {
        if (listener == null) {
          return;
        }
        const listeners = getListeners(this);
        const capture = isObject(options) ? Boolean(options.capture) : Boolean(options);
        const listenerType = capture ? CAPTURE : BUBBLE;
        let prev = null;
        let node = listeners.get(eventName);
        while (node != null) {
          if (node.listener === listener && node.listenerType === listenerType) {
            if (prev !== null) {
              prev.next = node.next;
            } else if (node.next !== null) {
              listeners.set(eventName, node.next);
            } else {
              listeners.delete(eventName);
            }
            return;
          }
          prev = node;
          node = node.next;
        }
      },
      /**
       * Dispatch a given event.
       * @param {Event|{type:string}} event The event to dispatch.
       * @returns {boolean} `false` if canceled.
       */
      dispatchEvent(event) {
        if (event == null || typeof event.type !== 'string') {
          throw new TypeError('"event.type" should be a string.');
        }
        const listeners = getListeners(this);
        const eventName = event.type;
        let node = listeners.get(eventName);
        if (node == null) {
          return true;
        }
        const wrappedEvent = wrapEvent(this, event);
        let prev = null;
        while (node != null) {
          if (node.once) {
            if (prev !== null) {
              prev.next = node.next;
            } else if (node.next !== null) {
              listeners.set(eventName, node.next);
            } else {
              listeners.delete(eventName);
            }
          } else {
            prev = node;
          }
          setPassiveListener(wrappedEvent, node.passive ? node.listener : null);
          if (typeof node.listener === 'function') {
            try {
              node.listener.call(this, wrappedEvent);
            } catch (err) {
              if (typeof console !== 'undefined' && typeof console.error === 'function') {
                console.error(err);
              }
            }
          } else if (node.listenerType !== ATTRIBUTE && typeof node.listener.handleEvent === 'function') {
            node.listener.handleEvent(wrappedEvent);
          }
          if (isStopped(wrappedEvent)) {
            break;
          }
          node = node.next;
        }
        setPassiveListener(wrappedEvent, null);
        setEventPhase(wrappedEvent, 0);
        setCurrentTarget(wrappedEvent, null);
        return !wrappedEvent.defaultPrevented;
      },
    };
    Object.defineProperty(EventTarget.prototype, 'constructor', {
      value: EventTarget,
      configurable: true,
      writable: true,
    });
    if (typeof window !== 'undefined' && typeof window.EventTarget !== 'undefined') {
      Object.setPrototypeOf(EventTarget.prototype, window.EventTarget.prototype);
    }
    exports2.defineEventAttribute = defineEventAttribute;
    exports2.EventTarget = EventTarget;
    exports2.default = EventTarget;
    module2.exports = EventTarget;
    module2.exports.EventTarget = module2.exports['default'] = EventTarget;
    module2.exports.defineEventAttribute = defineEventAttribute;
  },
});

// node_modules/abort-controller/dist/abort-controller.js
var require_abort_controller = __commonJS({
  'node_modules/abort-controller/dist/abort-controller.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    var eventTargetShim = require_event_target_shim();
    var AbortSignal = class extends eventTargetShim.EventTarget {
      /**
       * AbortSignal cannot be constructed directly.
       */
      constructor() {
        super();
        throw new TypeError('AbortSignal cannot be constructed directly');
      }
      /**
       * Returns `true` if this `AbortSignal`'s `AbortController` has signaled to abort, and `false` otherwise.
       */
      get aborted() {
        const aborted = abortedFlags.get(this);
        if (typeof aborted !== 'boolean') {
          throw new TypeError(
            `Expected 'this' to be an 'AbortSignal' object, but got ${this === null ? 'null' : typeof this}`
          );
        }
        return aborted;
      }
    };
    eventTargetShim.defineEventAttribute(AbortSignal.prototype, 'abort');
    function createAbortSignal() {
      const signal = Object.create(AbortSignal.prototype);
      eventTargetShim.EventTarget.call(signal);
      abortedFlags.set(signal, false);
      return signal;
    }
    function abortSignal(signal) {
      if (abortedFlags.get(signal) !== false) {
        return;
      }
      abortedFlags.set(signal, true);
      signal.dispatchEvent({ type: 'abort' });
    }
    var abortedFlags = /* @__PURE__ */ new WeakMap();
    Object.defineProperties(AbortSignal.prototype, {
      aborted: { enumerable: true },
    });
    if (typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol') {
      Object.defineProperty(AbortSignal.prototype, Symbol.toStringTag, {
        configurable: true,
        value: 'AbortSignal',
      });
    }
    var AbortController = class {
      /**
       * Initialize this controller.
       */
      constructor() {
        signals.set(this, createAbortSignal());
      }
      /**
       * Returns the `AbortSignal` object associated with this object.
       */
      get signal() {
        return getSignal(this);
      }
      /**
       * Abort and signal to any observers that the associated activity is to be aborted.
       */
      abort() {
        abortSignal(getSignal(this));
      }
    };
    var signals = /* @__PURE__ */ new WeakMap();
    function getSignal(controller) {
      const signal = signals.get(controller);
      if (signal == null) {
        throw new TypeError(
          `Expected 'this' to be an 'AbortController' object, but got ${
            controller === null ? 'null' : typeof controller
          }`
        );
      }
      return signal;
    }
    Object.defineProperties(AbortController.prototype, {
      signal: { enumerable: true },
      abort: { enumerable: true },
    });
    if (typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol') {
      Object.defineProperty(AbortController.prototype, Symbol.toStringTag, {
        configurable: true,
        value: 'AbortController',
      });
    }
    exports2.AbortController = AbortController;
    exports2.AbortSignal = AbortSignal;
    exports2.default = AbortController;
    module2.exports = AbortController;
    module2.exports.AbortController = module2.exports['default'] = AbortController;
    module2.exports.AbortSignal = AbortSignal;
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/ours/errors.js
var require_errors = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/ours/errors.js'(exports2, module2) {
    'use strict';
    var { format, inspect, AggregateError: CustomAggregateError } = require_util();
    var AggregateError = globalThis.AggregateError || CustomAggregateError;
    var kIsNodeError = Symbol('kIsNodeError');
    var kTypes = [
      'string',
      'function',
      'number',
      'object',
      // Accept 'Function' and 'Object' as alternative to the lower cased version.
      'Function',
      'Object',
      'boolean',
      'bigint',
      'symbol',
    ];
    var classRegExp = /^([A-Z][a-z0-9]*)+$/;
    var nodeInternalPrefix = '__node_internal_';
    var codes = {};
    function assert(value, message) {
      if (!value) {
        throw new codes.ERR_INTERNAL_ASSERTION(message);
      }
    }
    function addNumericalSeparator(val) {
      let res = '';
      let i = val.length;
      const start = val[0] === '-' ? 1 : 0;
      for (; i >= start + 4; i -= 3) {
        res = `_${val.slice(i - 3, i)}${res}`;
      }
      return `${val.slice(0, i)}${res}`;
    }
    function getMessage(key, msg, args) {
      if (typeof msg === 'function') {
        assert(
          msg.length <= args.length,
          // Default options do not count.
          `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${msg.length}).`
        );
        return msg(...args);
      }
      const expectedLength = (msg.match(/%[dfijoOs]/g) || []).length;
      assert(
        expectedLength === args.length,
        `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${expectedLength}).`
      );
      if (args.length === 0) {
        return msg;
      }
      return format(msg, ...args);
    }
    function E(code, message, Base) {
      if (!Base) {
        Base = Error;
      }
      class NodeError extends Base {
        constructor(...args) {
          super(getMessage(code, message, args));
        }
        toString() {
          return `${this.name} [${code}]: ${this.message}`;
        }
      }
      Object.defineProperties(NodeError.prototype, {
        name: {
          value: Base.name,
          writable: true,
          enumerable: false,
          configurable: true,
        },
        toString: {
          value() {
            return `${this.name} [${code}]: ${this.message}`;
          },
          writable: true,
          enumerable: false,
          configurable: true,
        },
      });
      NodeError.prototype.code = code;
      NodeError.prototype[kIsNodeError] = true;
      codes[code] = NodeError;
    }
    function hideStackFrames(fn) {
      const hidden = nodeInternalPrefix + fn.name;
      Object.defineProperty(fn, 'name', {
        value: hidden,
      });
      return fn;
    }
    function aggregateTwoErrors(innerError, outerError) {
      if (innerError && outerError && innerError !== outerError) {
        if (Array.isArray(outerError.errors)) {
          outerError.errors.push(innerError);
          return outerError;
        }
        const err = new AggregateError([outerError, innerError], outerError.message);
        err.code = outerError.code;
        return err;
      }
      return innerError || outerError;
    }
    var AbortError = class extends Error {
      constructor(message = 'The operation was aborted', options = void 0) {
        if (options !== void 0 && typeof options !== 'object') {
          throw new codes.ERR_INVALID_ARG_TYPE('options', 'Object', options);
        }
        super(message, options);
        this.code = 'ABORT_ERR';
        this.name = 'AbortError';
      }
    };
    E('ERR_ASSERTION', '%s', Error);
    E(
      'ERR_INVALID_ARG_TYPE',
      (name, expected, actual) => {
        assert(typeof name === 'string', "'name' must be a string");
        if (!Array.isArray(expected)) {
          expected = [expected];
        }
        let msg = 'The ';
        if (name.endsWith(' argument')) {
          msg += `${name} `;
        } else {
          msg += `"${name}" ${name.includes('.') ? 'property' : 'argument'} `;
        }
        msg += 'must be ';
        const types = [];
        const instances = [];
        const other = [];
        for (const value of expected) {
          assert(typeof value === 'string', 'All expected entries have to be of type string');
          if (kTypes.includes(value)) {
            types.push(value.toLowerCase());
          } else if (classRegExp.test(value)) {
            instances.push(value);
          } else {
            assert(value !== 'object', 'The value "object" should be written as "Object"');
            other.push(value);
          }
        }
        if (instances.length > 0) {
          const pos = types.indexOf('object');
          if (pos !== -1) {
            types.splice(types, pos, 1);
            instances.push('Object');
          }
        }
        if (types.length > 0) {
          switch (types.length) {
            case 1:
              msg += `of type ${types[0]}`;
              break;
            case 2:
              msg += `one of type ${types[0]} or ${types[1]}`;
              break;
            default: {
              const last = types.pop();
              msg += `one of type ${types.join(', ')}, or ${last}`;
            }
          }
          if (instances.length > 0 || other.length > 0) {
            msg += ' or ';
          }
        }
        if (instances.length > 0) {
          switch (instances.length) {
            case 1:
              msg += `an instance of ${instances[0]}`;
              break;
            case 2:
              msg += `an instance of ${instances[0]} or ${instances[1]}`;
              break;
            default: {
              const last = instances.pop();
              msg += `an instance of ${instances.join(', ')}, or ${last}`;
            }
          }
          if (other.length > 0) {
            msg += ' or ';
          }
        }
        switch (other.length) {
          case 0:
            break;
          case 1:
            if (other[0].toLowerCase() !== other[0]) {
              msg += 'an ';
            }
            msg += `${other[0]}`;
            break;
          case 2:
            msg += `one of ${other[0]} or ${other[1]}`;
            break;
          default: {
            const last = other.pop();
            msg += `one of ${other.join(', ')}, or ${last}`;
          }
        }
        if (actual == null) {
          msg += `. Received ${actual}`;
        } else if (typeof actual === 'function' && actual.name) {
          msg += `. Received function ${actual.name}`;
        } else if (typeof actual === 'object') {
          var _actual$constructor;
          if (
            (_actual$constructor = actual.constructor) !== null &&
            _actual$constructor !== void 0 &&
            _actual$constructor.name
          ) {
            msg += `. Received an instance of ${actual.constructor.name}`;
          } else {
            const inspected = inspect(actual, {
              depth: -1,
            });
            msg += `. Received ${inspected}`;
          }
        } else {
          let inspected = inspect(actual, {
            colors: false,
          });
          if (inspected.length > 25) {
            inspected = `${inspected.slice(0, 25)}...`;
          }
          msg += `. Received type ${typeof actual} (${inspected})`;
        }
        return msg;
      },
      TypeError
    );
    E(
      'ERR_INVALID_ARG_VALUE',
      (name, value, reason = 'is invalid') => {
        let inspected = inspect(value);
        if (inspected.length > 128) {
          inspected = inspected.slice(0, 128) + '...';
        }
        const type = name.includes('.') ? 'property' : 'argument';
        return `The ${type} '${name}' ${reason}. Received ${inspected}`;
      },
      TypeError
    );
    E(
      'ERR_INVALID_RETURN_VALUE',
      (input, name, value) => {
        var _value$constructor;
        const type =
          value !== null &&
          value !== void 0 &&
          (_value$constructor = value.constructor) !== null &&
          _value$constructor !== void 0 &&
          _value$constructor.name
            ? `instance of ${value.constructor.name}`
            : `type ${typeof value}`;
        return `Expected ${input} to be returned from the "${name}" function but got ${type}.`;
      },
      TypeError
    );
    E(
      'ERR_MISSING_ARGS',
      (...args) => {
        assert(args.length > 0, 'At least one arg needs to be specified');
        let msg;
        const len = args.length;
        args = (Array.isArray(args) ? args : [args]).map((a) => `"${a}"`).join(' or ');
        switch (len) {
          case 1:
            msg += `The ${args[0]} argument`;
            break;
          case 2:
            msg += `The ${args[0]} and ${args[1]} arguments`;
            break;
          default:
            {
              const last = args.pop();
              msg += `The ${args.join(', ')}, and ${last} arguments`;
            }
            break;
        }
        return `${msg} must be specified`;
      },
      TypeError
    );
    E(
      'ERR_OUT_OF_RANGE',
      (str, range, input) => {
        assert(range, 'Missing "range" argument');
        let received;
        if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
          received = addNumericalSeparator(String(input));
        } else if (typeof input === 'bigint') {
          received = String(input);
          if (input > 2n ** 32n || input < -(2n ** 32n)) {
            received = addNumericalSeparator(received);
          }
          received += 'n';
        } else {
          received = inspect(input);
        }
        return `The value of "${str}" is out of range. It must be ${range}. Received ${received}`;
      },
      RangeError
    );
    E('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times', Error);
    E('ERR_METHOD_NOT_IMPLEMENTED', 'The %s method is not implemented', Error);
    E('ERR_STREAM_ALREADY_FINISHED', 'Cannot call %s after a stream was finished', Error);
    E('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable', Error);
    E('ERR_STREAM_DESTROYED', 'Cannot call %s after a stream was destroyed', Error);
    E('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
    E('ERR_STREAM_PREMATURE_CLOSE', 'Premature close', Error);
    E('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF', Error);
    E('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event', Error);
    E('ERR_STREAM_WRITE_AFTER_END', 'write after end', Error);
    E('ERR_UNKNOWN_ENCODING', 'Unknown encoding: %s', TypeError);
    module2.exports = {
      AbortError,
      aggregateTwoErrors: hideStackFrames(aggregateTwoErrors),
      hideStackFrames,
      codes,
    };
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/internal/validators.js
var require_validators = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/internal/validators.js'(exports2, module2) {
    'use strict';
    var {
      ArrayIsArray,
      ArrayPrototypeIncludes,
      ArrayPrototypeJoin,
      ArrayPrototypeMap,
      NumberIsInteger,
      NumberIsNaN,
      NumberMAX_SAFE_INTEGER,
      NumberMIN_SAFE_INTEGER,
      NumberParseInt,
      ObjectPrototypeHasOwnProperty,
      RegExpPrototypeExec,
      String: String2,
      StringPrototypeToUpperCase,
      StringPrototypeTrim,
    } = require_primordials();
    var {
      hideStackFrames,
      codes: { ERR_SOCKET_BAD_PORT, ERR_INVALID_ARG_TYPE, ERR_INVALID_ARG_VALUE, ERR_OUT_OF_RANGE, ERR_UNKNOWN_SIGNAL },
    } = require_errors();
    var { normalizeEncoding } = require_util();
    var { isAsyncFunction, isArrayBufferView } = require_util().types;
    var signals = {};
    function isInt32(value) {
      return value === (value | 0);
    }
    function isUint32(value) {
      return value === value >>> 0;
    }
    var octalReg = /^[0-7]+$/;
    var modeDesc = 'must be a 32-bit unsigned integer or an octal string';
    function parseFileMode(value, name, def) {
      if (typeof value === 'undefined') {
        value = def;
      }
      if (typeof value === 'string') {
        if (RegExpPrototypeExec(octalReg, value) === null) {
          throw new ERR_INVALID_ARG_VALUE(name, value, modeDesc);
        }
        value = NumberParseInt(value, 8);
      }
      validateUint32(value, name);
      return value;
    }
    var validateInteger = hideStackFrames((value, name, min = NumberMIN_SAFE_INTEGER, max = NumberMAX_SAFE_INTEGER) => {
      if (typeof value !== 'number') throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
      if (!NumberIsInteger(value)) throw new ERR_OUT_OF_RANGE(name, 'an integer', value);
      if (value < min || value > max) throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
    });
    var validateInt32 = hideStackFrames((value, name, min = -2147483648, max = 2147483647) => {
      if (typeof value !== 'number') {
        throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
      }
      if (!NumberIsInteger(value)) {
        throw new ERR_OUT_OF_RANGE(name, 'an integer', value);
      }
      if (value < min || value > max) {
        throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
      }
    });
    var validateUint32 = hideStackFrames((value, name, positive = false) => {
      if (typeof value !== 'number') {
        throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
      }
      if (!NumberIsInteger(value)) {
        throw new ERR_OUT_OF_RANGE(name, 'an integer', value);
      }
      const min = positive ? 1 : 0;
      const max = 4294967295;
      if (value < min || value > max) {
        throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
      }
    });
    function validateString(value, name) {
      if (typeof value !== 'string') throw new ERR_INVALID_ARG_TYPE(name, 'string', value);
    }
    function validateNumber(value, name, min = void 0, max) {
      if (typeof value !== 'number') throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
      if (
        (min != null && value < min) ||
        (max != null && value > max) ||
        ((min != null || max != null) && NumberIsNaN(value))
      ) {
        throw new ERR_OUT_OF_RANGE(
          name,
          `${min != null ? `>= ${min}` : ''}${min != null && max != null ? ' && ' : ''}${
            max != null ? `<= ${max}` : ''
          }`,
          value
        );
      }
    }
    var validateOneOf = hideStackFrames((value, name, oneOf) => {
      if (!ArrayPrototypeIncludes(oneOf, value)) {
        const allowed = ArrayPrototypeJoin(
          ArrayPrototypeMap(oneOf, (v) => (typeof v === 'string' ? `'${v}'` : String2(v))),
          ', '
        );
        const reason = 'must be one of: ' + allowed;
        throw new ERR_INVALID_ARG_VALUE(name, value, reason);
      }
    });
    function validateBoolean(value, name) {
      if (typeof value !== 'boolean') throw new ERR_INVALID_ARG_TYPE(name, 'boolean', value);
    }
    function getOwnPropertyValueOrDefault(options, key, defaultValue) {
      return options == null || !ObjectPrototypeHasOwnProperty(options, key) ? defaultValue : options[key];
    }
    var validateObject = hideStackFrames((value, name, options = null) => {
      const allowArray = getOwnPropertyValueOrDefault(options, 'allowArray', false);
      const allowFunction = getOwnPropertyValueOrDefault(options, 'allowFunction', false);
      const nullable = getOwnPropertyValueOrDefault(options, 'nullable', false);
      if (
        (!nullable && value === null) ||
        (!allowArray && ArrayIsArray(value)) ||
        (typeof value !== 'object' && (!allowFunction || typeof value !== 'function'))
      ) {
        throw new ERR_INVALID_ARG_TYPE(name, 'Object', value);
      }
    });
    var validateDictionary = hideStackFrames((value, name) => {
      if (value != null && typeof value !== 'object' && typeof value !== 'function') {
        throw new ERR_INVALID_ARG_TYPE(name, 'a dictionary', value);
      }
    });
    var validateArray = hideStackFrames((value, name, minLength = 0) => {
      if (!ArrayIsArray(value)) {
        throw new ERR_INVALID_ARG_TYPE(name, 'Array', value);
      }
      if (value.length < minLength) {
        const reason = `must be longer than ${minLength}`;
        throw new ERR_INVALID_ARG_VALUE(name, value, reason);
      }
    });
    function validateStringArray(value, name) {
      validateArray(value, name);
      for (let i = 0; i < value.length; i++) {
        validateString(value[i], `${name}[${i}]`);
      }
    }
    function validateBooleanArray(value, name) {
      validateArray(value, name);
      for (let i = 0; i < value.length; i++) {
        validateBoolean(value[i], `${name}[${i}]`);
      }
    }
    function validateSignalName(signal, name = 'signal') {
      validateString(signal, name);
      if (signals[signal] === void 0) {
        if (signals[StringPrototypeToUpperCase(signal)] !== void 0) {
          throw new ERR_UNKNOWN_SIGNAL(signal + ' (signals must use all capital letters)');
        }
        throw new ERR_UNKNOWN_SIGNAL(signal);
      }
    }
    var validateBuffer = hideStackFrames((buffer, name = 'buffer') => {
      if (!isArrayBufferView(buffer)) {
        throw new ERR_INVALID_ARG_TYPE(name, ['Buffer', 'TypedArray', 'DataView'], buffer);
      }
    });
    function validateEncoding(data, encoding) {
      const normalizedEncoding = normalizeEncoding(encoding);
      const length = data.length;
      if (normalizedEncoding === 'hex' && length % 2 !== 0) {
        throw new ERR_INVALID_ARG_VALUE('encoding', encoding, `is invalid for data of length ${length}`);
      }
    }
    function validatePort(port, name = 'Port', allowZero = true) {
      if (
        (typeof port !== 'number' && typeof port !== 'string') ||
        (typeof port === 'string' && StringPrototypeTrim(port).length === 0) ||
        +port !== +port >>> 0 ||
        port > 65535 ||
        (port === 0 && !allowZero)
      ) {
        throw new ERR_SOCKET_BAD_PORT(name, port, allowZero);
      }
      return port | 0;
    }
    var validateAbortSignal = hideStackFrames((signal, name) => {
      if (signal !== void 0 && (signal === null || typeof signal !== 'object' || !('aborted' in signal))) {
        throw new ERR_INVALID_ARG_TYPE(name, 'AbortSignal', signal);
      }
    });
    var validateFunction = hideStackFrames((value, name) => {
      if (typeof value !== 'function') throw new ERR_INVALID_ARG_TYPE(name, 'Function', value);
    });
    var validatePlainFunction = hideStackFrames((value, name) => {
      if (typeof value !== 'function' || isAsyncFunction(value))
        throw new ERR_INVALID_ARG_TYPE(name, 'Function', value);
    });
    var validateUndefined = hideStackFrames((value, name) => {
      if (value !== void 0) throw new ERR_INVALID_ARG_TYPE(name, 'undefined', value);
    });
    function validateUnion(value, name, union) {
      if (!ArrayPrototypeIncludes(union, value)) {
        throw new ERR_INVALID_ARG_TYPE(name, `('${ArrayPrototypeJoin(union, '|')}')`, value);
      }
    }
    var linkValueRegExp = /^(?:<[^>]*>)(?:\s*;\s*[^;"\s]+(?:=(")?[^;"\s]*\1)?)*$/;
    function validateLinkHeaderFormat(value, name) {
      if (typeof value === 'undefined' || !RegExpPrototypeExec(linkValueRegExp, value)) {
        throw new ERR_INVALID_ARG_VALUE(
          name,
          value,
          'must be an array or string of format "</styles.css>; rel=preload; as=style"'
        );
      }
    }
    function validateLinkHeaderValue(hints) {
      if (typeof hints === 'string') {
        validateLinkHeaderFormat(hints, 'hints');
        return hints;
      } else if (ArrayIsArray(hints)) {
        const hintsLength = hints.length;
        let result = '';
        if (hintsLength === 0) {
          return result;
        }
        for (let i = 0; i < hintsLength; i++) {
          const link = hints[i];
          validateLinkHeaderFormat(link, 'hints');
          result += link;
          if (i !== hintsLength - 1) {
            result += ', ';
          }
        }
        return result;
      }
      throw new ERR_INVALID_ARG_VALUE(
        'hints',
        hints,
        'must be an array or string of format "</styles.css>; rel=preload; as=style"'
      );
    }
    module2.exports = {
      isInt32,
      isUint32,
      parseFileMode,
      validateArray,
      validateStringArray,
      validateBooleanArray,
      validateBoolean,
      validateBuffer,
      validateDictionary,
      validateEncoding,
      validateFunction,
      validateInt32,
      validateInteger,
      validateNumber,
      validateObject,
      validateOneOf,
      validatePlainFunction,
      validatePort,
      validateSignalName,
      validateString,
      validateUint32,
      validateUndefined,
      validateUnion,
      validateAbortSignal,
      validateLinkHeaderValue,
    };
  },
});

// node_modules/process/index.js
var require_process = __commonJS({
  'node_modules/process/index.js'(exports2, module2) {
    module2.exports = global.process;
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/utils.js
var require_utils = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/utils.js'(exports2, module2) {
    'use strict';
    var { Symbol: Symbol2, SymbolAsyncIterator, SymbolIterator, SymbolFor } = require_primordials();
    var kDestroyed = Symbol2('kDestroyed');
    var kIsErrored = Symbol2('kIsErrored');
    var kIsReadable = Symbol2('kIsReadable');
    var kIsDisturbed = Symbol2('kIsDisturbed');
    var kIsClosedPromise = SymbolFor('nodejs.webstream.isClosedPromise');
    var kControllerErrorFunction = SymbolFor('nodejs.webstream.controllerErrorFunction');
    function isReadableNodeStream(obj, strict = false) {
      var _obj$_readableState;
      return !!(
        obj &&
        typeof obj.pipe === 'function' &&
        typeof obj.on === 'function' &&
        (!strict || (typeof obj.pause === 'function' && typeof obj.resume === 'function')) &&
        (!obj._writableState ||
          ((_obj$_readableState = obj._readableState) === null || _obj$_readableState === void 0
            ? void 0
            : _obj$_readableState.readable) !== false) && // Duplex
        (!obj._writableState || obj._readableState)
      );
    }
    function isWritableNodeStream(obj) {
      var _obj$_writableState;
      return !!(
        obj &&
        typeof obj.write === 'function' &&
        typeof obj.on === 'function' &&
        (!obj._readableState ||
          ((_obj$_writableState = obj._writableState) === null || _obj$_writableState === void 0
            ? void 0
            : _obj$_writableState.writable) !== false)
      );
    }
    function isDuplexNodeStream(obj) {
      return !!(
        obj &&
        typeof obj.pipe === 'function' &&
        obj._readableState &&
        typeof obj.on === 'function' &&
        typeof obj.write === 'function'
      );
    }
    function isNodeStream(obj) {
      return (
        obj &&
        (obj._readableState ||
          obj._writableState ||
          (typeof obj.write === 'function' && typeof obj.on === 'function') ||
          (typeof obj.pipe === 'function' && typeof obj.on === 'function'))
      );
    }
    function isReadableStream(obj) {
      return !!(
        obj &&
        !isNodeStream(obj) &&
        typeof obj.pipeThrough === 'function' &&
        typeof obj.getReader === 'function' &&
        typeof obj.cancel === 'function'
      );
    }
    function isWritableStream(obj) {
      return !!(obj && !isNodeStream(obj) && typeof obj.getWriter === 'function' && typeof obj.abort === 'function');
    }
    function isTransformStream(obj) {
      return !!(obj && !isNodeStream(obj) && typeof obj.readable === 'object' && typeof obj.writable === 'object');
    }
    function isWebStream(obj) {
      return isReadableStream(obj) || isWritableStream(obj) || isTransformStream(obj);
    }
    function isIterable(obj, isAsync) {
      if (obj == null) return false;
      if (isAsync === true) return typeof obj[SymbolAsyncIterator] === 'function';
      if (isAsync === false) return typeof obj[SymbolIterator] === 'function';
      return typeof obj[SymbolAsyncIterator] === 'function' || typeof obj[SymbolIterator] === 'function';
    }
    function isDestroyed(stream) {
      if (!isNodeStream(stream)) return null;
      const wState = stream._writableState;
      const rState = stream._readableState;
      const state = wState || rState;
      return !!(stream.destroyed || stream[kDestroyed] || (state !== null && state !== void 0 && state.destroyed));
    }
    function isWritableEnded(stream) {
      if (!isWritableNodeStream(stream)) return null;
      if (stream.writableEnded === true) return true;
      const wState = stream._writableState;
      if (wState !== null && wState !== void 0 && wState.errored) return false;
      if (typeof (wState === null || wState === void 0 ? void 0 : wState.ended) !== 'boolean') return null;
      return wState.ended;
    }
    function isWritableFinished(stream, strict) {
      if (!isWritableNodeStream(stream)) return null;
      if (stream.writableFinished === true) return true;
      const wState = stream._writableState;
      if (wState !== null && wState !== void 0 && wState.errored) return false;
      if (typeof (wState === null || wState === void 0 ? void 0 : wState.finished) !== 'boolean') return null;
      return !!(wState.finished || (strict === false && wState.ended === true && wState.length === 0));
    }
    function isReadableEnded(stream) {
      if (!isReadableNodeStream(stream)) return null;
      if (stream.readableEnded === true) return true;
      const rState = stream._readableState;
      if (!rState || rState.errored) return false;
      if (typeof (rState === null || rState === void 0 ? void 0 : rState.ended) !== 'boolean') return null;
      return rState.ended;
    }
    function isReadableFinished(stream, strict) {
      if (!isReadableNodeStream(stream)) return null;
      const rState = stream._readableState;
      if (rState !== null && rState !== void 0 && rState.errored) return false;
      if (typeof (rState === null || rState === void 0 ? void 0 : rState.endEmitted) !== 'boolean') return null;
      return !!(rState.endEmitted || (strict === false && rState.ended === true && rState.length === 0));
    }
    function isReadable(stream) {
      if (stream && stream[kIsReadable] != null) return stream[kIsReadable];
      if (typeof (stream === null || stream === void 0 ? void 0 : stream.readable) !== 'boolean') return null;
      if (isDestroyed(stream)) return false;
      return isReadableNodeStream(stream) && stream.readable && !isReadableFinished(stream);
    }
    function isWritable(stream) {
      if (typeof (stream === null || stream === void 0 ? void 0 : stream.writable) !== 'boolean') return null;
      if (isDestroyed(stream)) return false;
      return isWritableNodeStream(stream) && stream.writable && !isWritableEnded(stream);
    }
    function isFinished(stream, opts) {
      if (!isNodeStream(stream)) {
        return null;
      }
      if (isDestroyed(stream)) {
        return true;
      }
      if ((opts === null || opts === void 0 ? void 0 : opts.readable) !== false && isReadable(stream)) {
        return false;
      }
      if ((opts === null || opts === void 0 ? void 0 : opts.writable) !== false && isWritable(stream)) {
        return false;
      }
      return true;
    }
    function isWritableErrored(stream) {
      var _stream$_writableStat, _stream$_writableStat2;
      if (!isNodeStream(stream)) {
        return null;
      }
      if (stream.writableErrored) {
        return stream.writableErrored;
      }
      return (_stream$_writableStat =
        (_stream$_writableStat2 = stream._writableState) === null || _stream$_writableStat2 === void 0
          ? void 0
          : _stream$_writableStat2.errored) !== null && _stream$_writableStat !== void 0
        ? _stream$_writableStat
        : null;
    }
    function isReadableErrored(stream) {
      var _stream$_readableStat, _stream$_readableStat2;
      if (!isNodeStream(stream)) {
        return null;
      }
      if (stream.readableErrored) {
        return stream.readableErrored;
      }
      return (_stream$_readableStat =
        (_stream$_readableStat2 = stream._readableState) === null || _stream$_readableStat2 === void 0
          ? void 0
          : _stream$_readableStat2.errored) !== null && _stream$_readableStat !== void 0
        ? _stream$_readableStat
        : null;
    }
    function isClosed(stream) {
      if (!isNodeStream(stream)) {
        return null;
      }
      if (typeof stream.closed === 'boolean') {
        return stream.closed;
      }
      const wState = stream._writableState;
      const rState = stream._readableState;
      if (
        typeof (wState === null || wState === void 0 ? void 0 : wState.closed) === 'boolean' ||
        typeof (rState === null || rState === void 0 ? void 0 : rState.closed) === 'boolean'
      ) {
        return (
          (wState === null || wState === void 0 ? void 0 : wState.closed) ||
          (rState === null || rState === void 0 ? void 0 : rState.closed)
        );
      }
      if (typeof stream._closed === 'boolean' && isOutgoingMessage(stream)) {
        return stream._closed;
      }
      return null;
    }
    function isOutgoingMessage(stream) {
      return (
        typeof stream._closed === 'boolean' &&
        typeof stream._defaultKeepAlive === 'boolean' &&
        typeof stream._removedConnection === 'boolean' &&
        typeof stream._removedContLen === 'boolean'
      );
    }
    function isServerResponse(stream) {
      return typeof stream._sent100 === 'boolean' && isOutgoingMessage(stream);
    }
    function isServerRequest(stream) {
      var _stream$req;
      return (
        typeof stream._consuming === 'boolean' &&
        typeof stream._dumped === 'boolean' &&
        ((_stream$req = stream.req) === null || _stream$req === void 0 ? void 0 : _stream$req.upgradeOrConnect) ===
          void 0
      );
    }
    function willEmitClose(stream) {
      if (!isNodeStream(stream)) return null;
      const wState = stream._writableState;
      const rState = stream._readableState;
      const state = wState || rState;
      return (
        (!state && isServerResponse(stream)) ||
        !!(state && state.autoDestroy && state.emitClose && state.closed === false)
      );
    }
    function isDisturbed(stream) {
      var _stream$kIsDisturbed;
      return !!(
        stream &&
        ((_stream$kIsDisturbed = stream[kIsDisturbed]) !== null && _stream$kIsDisturbed !== void 0
          ? _stream$kIsDisturbed
          : stream.readableDidRead || stream.readableAborted)
      );
    }
    function isErrored(stream) {
      var _ref,
        _ref2,
        _ref3,
        _ref4,
        _ref5,
        _stream$kIsErrored,
        _stream$_readableStat3,
        _stream$_writableStat3,
        _stream$_readableStat4,
        _stream$_writableStat4;
      return !!(
        stream &&
        ((_ref =
          (_ref2 =
            (_ref3 =
              (_ref4 =
                (_ref5 =
                  (_stream$kIsErrored = stream[kIsErrored]) !== null && _stream$kIsErrored !== void 0
                    ? _stream$kIsErrored
                    : stream.readableErrored) !== null && _ref5 !== void 0
                  ? _ref5
                  : stream.writableErrored) !== null && _ref4 !== void 0
                ? _ref4
                : (_stream$_readableStat3 = stream._readableState) === null || _stream$_readableStat3 === void 0
                ? void 0
                : _stream$_readableStat3.errorEmitted) !== null && _ref3 !== void 0
              ? _ref3
              : (_stream$_writableStat3 = stream._writableState) === null || _stream$_writableStat3 === void 0
              ? void 0
              : _stream$_writableStat3.errorEmitted) !== null && _ref2 !== void 0
            ? _ref2
            : (_stream$_readableStat4 = stream._readableState) === null || _stream$_readableStat4 === void 0
            ? void 0
            : _stream$_readableStat4.errored) !== null && _ref !== void 0
          ? _ref
          : (_stream$_writableStat4 = stream._writableState) === null || _stream$_writableStat4 === void 0
          ? void 0
          : _stream$_writableStat4.errored)
      );
    }
    module2.exports = {
      kDestroyed,
      isDisturbed,
      kIsDisturbed,
      isErrored,
      kIsErrored,
      isReadable,
      kIsReadable,
      kIsClosedPromise,
      kControllerErrorFunction,
      isClosed,
      isDestroyed,
      isDuplexNodeStream,
      isFinished,
      isIterable,
      isReadableNodeStream,
      isReadableStream,
      isReadableEnded,
      isReadableFinished,
      isReadableErrored,
      isNodeStream,
      isWebStream,
      isWritable,
      isWritableNodeStream,
      isWritableStream,
      isWritableEnded,
      isWritableFinished,
      isWritableErrored,
      isServerRequest,
      isServerResponse,
      willEmitClose,
      isTransformStream,
    };
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/end-of-stream.js
var require_end_of_stream2 = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/end-of-stream.js'(exports2, module2) {
    var process2 = require_process();
    var { AbortError, codes } = require_errors();
    var { ERR_INVALID_ARG_TYPE, ERR_STREAM_PREMATURE_CLOSE } = codes;
    var { kEmptyObject, once } = require_util();
    var { validateAbortSignal, validateFunction, validateObject, validateBoolean } = require_validators();
    var { Promise: Promise2, PromisePrototypeThen } = require_primordials();
    var {
      isClosed,
      isReadable,
      isReadableNodeStream,
      isReadableStream,
      isReadableFinished,
      isReadableErrored,
      isWritable,
      isWritableNodeStream,
      isWritableStream,
      isWritableFinished,
      isWritableErrored,
      isNodeStream,
      willEmitClose: _willEmitClose,
      kIsClosedPromise,
    } = require_utils();
    function isRequest(stream) {
      return stream.setHeader && typeof stream.abort === 'function';
    }
    var nop = () => {};
    function eos(stream, options, callback) {
      var _options$readable, _options$writable;
      if (arguments.length === 2) {
        callback = options;
        options = kEmptyObject;
      } else if (options == null) {
        options = kEmptyObject;
      } else {
        validateObject(options, 'options');
      }
      validateFunction(callback, 'callback');
      validateAbortSignal(options.signal, 'options.signal');
      callback = once(callback);
      if (isReadableStream(stream) || isWritableStream(stream)) {
        return eosWeb(stream, options, callback);
      }
      if (!isNodeStream(stream)) {
        throw new ERR_INVALID_ARG_TYPE('stream', ['ReadableStream', 'WritableStream', 'Stream'], stream);
      }
      const readable =
        (_options$readable = options.readable) !== null && _options$readable !== void 0
          ? _options$readable
          : isReadableNodeStream(stream);
      const writable =
        (_options$writable = options.writable) !== null && _options$writable !== void 0
          ? _options$writable
          : isWritableNodeStream(stream);
      const wState = stream._writableState;
      const rState = stream._readableState;
      const onlegacyfinish = () => {
        if (!stream.writable) {
          onfinish();
        }
      };
      let willEmitClose =
        _willEmitClose(stream) &&
        isReadableNodeStream(stream) === readable &&
        isWritableNodeStream(stream) === writable;
      let writableFinished = isWritableFinished(stream, false);
      const onfinish = () => {
        writableFinished = true;
        if (stream.destroyed) {
          willEmitClose = false;
        }
        if (willEmitClose && (!stream.readable || readable)) {
          return;
        }
        if (!readable || readableFinished) {
          callback.call(stream);
        }
      };
      let readableFinished = isReadableFinished(stream, false);
      const onend = () => {
        readableFinished = true;
        if (stream.destroyed) {
          willEmitClose = false;
        }
        if (willEmitClose && (!stream.writable || writable)) {
          return;
        }
        if (!writable || writableFinished) {
          callback.call(stream);
        }
      };
      const onerror = (err) => {
        callback.call(stream, err);
      };
      let closed = isClosed(stream);
      const onclose = () => {
        closed = true;
        const errored = isWritableErrored(stream) || isReadableErrored(stream);
        if (errored && typeof errored !== 'boolean') {
          return callback.call(stream, errored);
        }
        if (readable && !readableFinished && isReadableNodeStream(stream, true)) {
          if (!isReadableFinished(stream, false)) return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE());
        }
        if (writable && !writableFinished) {
          if (!isWritableFinished(stream, false)) return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE());
        }
        callback.call(stream);
      };
      const onclosed = () => {
        closed = true;
        const errored = isWritableErrored(stream) || isReadableErrored(stream);
        if (errored && typeof errored !== 'boolean') {
          return callback.call(stream, errored);
        }
        callback.call(stream);
      };
      const onrequest = () => {
        stream.req.on('finish', onfinish);
      };
      if (isRequest(stream)) {
        stream.on('complete', onfinish);
        if (!willEmitClose) {
          stream.on('abort', onclose);
        }
        if (stream.req) {
          onrequest();
        } else {
          stream.on('request', onrequest);
        }
      } else if (writable && !wState) {
        stream.on('end', onlegacyfinish);
        stream.on('close', onlegacyfinish);
      }
      if (!willEmitClose && typeof stream.aborted === 'boolean') {
        stream.on('aborted', onclose);
      }
      stream.on('end', onend);
      stream.on('finish', onfinish);
      if (options.error !== false) {
        stream.on('error', onerror);
      }
      stream.on('close', onclose);
      if (closed) {
        process2.nextTick(onclose);
      } else if (
        (wState !== null && wState !== void 0 && wState.errorEmitted) ||
        (rState !== null && rState !== void 0 && rState.errorEmitted)
      ) {
        if (!willEmitClose) {
          process2.nextTick(onclosed);
        }
      } else if (
        !readable &&
        (!willEmitClose || isReadable(stream)) &&
        (writableFinished || isWritable(stream) === false)
      ) {
        process2.nextTick(onclosed);
      } else if (
        !writable &&
        (!willEmitClose || isWritable(stream)) &&
        (readableFinished || isReadable(stream) === false)
      ) {
        process2.nextTick(onclosed);
      } else if (rState && stream.req && stream.aborted) {
        process2.nextTick(onclosed);
      }
      const cleanup = () => {
        callback = nop;
        stream.removeListener('aborted', onclose);
        stream.removeListener('complete', onfinish);
        stream.removeListener('abort', onclose);
        stream.removeListener('request', onrequest);
        if (stream.req) stream.req.removeListener('finish', onfinish);
        stream.removeListener('end', onlegacyfinish);
        stream.removeListener('close', onlegacyfinish);
        stream.removeListener('finish', onfinish);
        stream.removeListener('end', onend);
        stream.removeListener('error', onerror);
        stream.removeListener('close', onclose);
      };
      if (options.signal && !closed) {
        const abort = () => {
          const endCallback = callback;
          cleanup();
          endCallback.call(
            stream,
            new AbortError(void 0, {
              cause: options.signal.reason,
            })
          );
        };
        if (options.signal.aborted) {
          process2.nextTick(abort);
        } else {
          const originalCallback = callback;
          callback = once((...args) => {
            options.signal.removeEventListener('abort', abort);
            originalCallback.apply(stream, args);
          });
          options.signal.addEventListener('abort', abort);
        }
      }
      return cleanup;
    }
    function eosWeb(stream, options, callback) {
      let isAborted = false;
      let abort = nop;
      if (options.signal) {
        abort = () => {
          isAborted = true;
          callback.call(
            stream,
            new AbortError(void 0, {
              cause: options.signal.reason,
            })
          );
        };
        if (options.signal.aborted) {
          process2.nextTick(abort);
        } else {
          const originalCallback = callback;
          callback = once((...args) => {
            options.signal.removeEventListener('abort', abort);
            originalCallback.apply(stream, args);
          });
          options.signal.addEventListener('abort', abort);
        }
      }
      const resolverFn = (...args) => {
        if (!isAborted) {
          process2.nextTick(() => callback.apply(stream, args));
        }
      };
      PromisePrototypeThen(stream[kIsClosedPromise].promise, resolverFn, resolverFn);
      return nop;
    }
    function finished(stream, opts) {
      var _opts;
      let autoCleanup = false;
      if (opts === null) {
        opts = kEmptyObject;
      }
      if ((_opts = opts) !== null && _opts !== void 0 && _opts.cleanup) {
        validateBoolean(opts.cleanup, 'cleanup');
        autoCleanup = opts.cleanup;
      }
      return new Promise2((resolve, reject) => {
        const cleanup = eos(stream, opts, (err) => {
          if (autoCleanup) {
            cleanup();
          }
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    module2.exports = eos;
    module2.exports.finished = finished;
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/destroy.js
var require_destroy = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/destroy.js'(exports2, module2) {
    'use strict';
    var process2 = require_process();
    var {
      aggregateTwoErrors,
      codes: { ERR_MULTIPLE_CALLBACK },
      AbortError,
    } = require_errors();
    var { Symbol: Symbol2 } = require_primordials();
    var { kDestroyed, isDestroyed, isFinished, isServerRequest } = require_utils();
    var kDestroy = Symbol2('kDestroy');
    var kConstruct = Symbol2('kConstruct');
    function checkError(err, w, r) {
      if (err) {
        err.stack;
        if (w && !w.errored) {
          w.errored = err;
        }
        if (r && !r.errored) {
          r.errored = err;
        }
      }
    }
    function destroy(err, cb) {
      const r = this._readableState;
      const w = this._writableState;
      const s = w || r;
      if ((w !== null && w !== void 0 && w.destroyed) || (r !== null && r !== void 0 && r.destroyed)) {
        if (typeof cb === 'function') {
          cb();
        }
        return this;
      }
      checkError(err, w, r);
      if (w) {
        w.destroyed = true;
      }
      if (r) {
        r.destroyed = true;
      }
      if (!s.constructed) {
        this.once(kDestroy, function (er) {
          _destroy(this, aggregateTwoErrors(er, err), cb);
        });
      } else {
        _destroy(this, err, cb);
      }
      return this;
    }
    function _destroy(self, err, cb) {
      let called = false;
      function onDestroy(err2) {
        if (called) {
          return;
        }
        called = true;
        const r = self._readableState;
        const w = self._writableState;
        checkError(err2, w, r);
        if (w) {
          w.closed = true;
        }
        if (r) {
          r.closed = true;
        }
        if (typeof cb === 'function') {
          cb(err2);
        }
        if (err2) {
          process2.nextTick(emitErrorCloseNT, self, err2);
        } else {
          process2.nextTick(emitCloseNT, self);
        }
      }
      try {
        self._destroy(err || null, onDestroy);
      } catch (err2) {
        onDestroy(err2);
      }
    }
    function emitErrorCloseNT(self, err) {
      emitErrorNT(self, err);
      emitCloseNT(self);
    }
    function emitCloseNT(self) {
      const r = self._readableState;
      const w = self._writableState;
      if (w) {
        w.closeEmitted = true;
      }
      if (r) {
        r.closeEmitted = true;
      }
      if ((w !== null && w !== void 0 && w.emitClose) || (r !== null && r !== void 0 && r.emitClose)) {
        self.emit('close');
      }
    }
    function emitErrorNT(self, err) {
      const r = self._readableState;
      const w = self._writableState;
      if ((w !== null && w !== void 0 && w.errorEmitted) || (r !== null && r !== void 0 && r.errorEmitted)) {
        return;
      }
      if (w) {
        w.errorEmitted = true;
      }
      if (r) {
        r.errorEmitted = true;
      }
      self.emit('error', err);
    }
    function undestroy() {
      const r = this._readableState;
      const w = this._writableState;
      if (r) {
        r.constructed = true;
        r.closed = false;
        r.closeEmitted = false;
        r.destroyed = false;
        r.errored = null;
        r.errorEmitted = false;
        r.reading = false;
        r.ended = r.readable === false;
        r.endEmitted = r.readable === false;
      }
      if (w) {
        w.constructed = true;
        w.destroyed = false;
        w.closed = false;
        w.closeEmitted = false;
        w.errored = null;
        w.errorEmitted = false;
        w.finalCalled = false;
        w.prefinished = false;
        w.ended = w.writable === false;
        w.ending = w.writable === false;
        w.finished = w.writable === false;
      }
    }
    function errorOrDestroy(stream, err, sync) {
      const r = stream._readableState;
      const w = stream._writableState;
      if ((w !== null && w !== void 0 && w.destroyed) || (r !== null && r !== void 0 && r.destroyed)) {
        return this;
      }
      if ((r !== null && r !== void 0 && r.autoDestroy) || (w !== null && w !== void 0 && w.autoDestroy))
        stream.destroy(err);
      else if (err) {
        err.stack;
        if (w && !w.errored) {
          w.errored = err;
        }
        if (r && !r.errored) {
          r.errored = err;
        }
        if (sync) {
          process2.nextTick(emitErrorNT, stream, err);
        } else {
          emitErrorNT(stream, err);
        }
      }
    }
    function construct(stream, cb) {
      if (typeof stream._construct !== 'function') {
        return;
      }
      const r = stream._readableState;
      const w = stream._writableState;
      if (r) {
        r.constructed = false;
      }
      if (w) {
        w.constructed = false;
      }
      stream.once(kConstruct, cb);
      if (stream.listenerCount(kConstruct) > 1) {
        return;
      }
      process2.nextTick(constructNT, stream);
    }
    function constructNT(stream) {
      let called = false;
      function onConstruct(err) {
        if (called) {
          errorOrDestroy(stream, err !== null && err !== void 0 ? err : new ERR_MULTIPLE_CALLBACK());
          return;
        }
        called = true;
        const r = stream._readableState;
        const w = stream._writableState;
        const s = w || r;
        if (r) {
          r.constructed = true;
        }
        if (w) {
          w.constructed = true;
        }
        if (s.destroyed) {
          stream.emit(kDestroy, err);
        } else if (err) {
          errorOrDestroy(stream, err, true);
        } else {
          process2.nextTick(emitConstructNT, stream);
        }
      }
      try {
        stream._construct((err) => {
          process2.nextTick(onConstruct, err);
        });
      } catch (err) {
        process2.nextTick(onConstruct, err);
      }
    }
    function emitConstructNT(stream) {
      stream.emit(kConstruct);
    }
    function isRequest(stream) {
      return (stream === null || stream === void 0 ? void 0 : stream.setHeader) && typeof stream.abort === 'function';
    }
    function emitCloseLegacy(stream) {
      stream.emit('close');
    }
    function emitErrorCloseLegacy(stream, err) {
      stream.emit('error', err);
      process2.nextTick(emitCloseLegacy, stream);
    }
    function destroyer(stream, err) {
      if (!stream || isDestroyed(stream)) {
        return;
      }
      if (!err && !isFinished(stream)) {
        err = new AbortError();
      }
      if (isServerRequest(stream)) {
        stream.socket = null;
        stream.destroy(err);
      } else if (isRequest(stream)) {
        stream.abort();
      } else if (isRequest(stream.req)) {
        stream.req.abort();
      } else if (typeof stream.destroy === 'function') {
        stream.destroy(err);
      } else if (typeof stream.close === 'function') {
        stream.close();
      } else if (err) {
        process2.nextTick(emitErrorCloseLegacy, stream, err);
      } else {
        process2.nextTick(emitCloseLegacy, stream);
      }
      if (!stream.destroyed) {
        stream[kDestroyed] = true;
      }
    }
    module2.exports = {
      construct,
      destroyer,
      destroy,
      undestroy,
      errorOrDestroy,
    };
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/legacy.js
var require_legacy = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/legacy.js'(exports2, module2) {
    'use strict';
    var { ArrayIsArray, ObjectSetPrototypeOf } = require_primordials();
    var { EventEmitter: EE } = require('events');
    function Stream(opts) {
      EE.call(this, opts);
    }
    ObjectSetPrototypeOf(Stream.prototype, EE.prototype);
    ObjectSetPrototypeOf(Stream, EE);
    Stream.prototype.pipe = function (dest, options) {
      const source = this;
      function ondata(chunk) {
        if (dest.writable && dest.write(chunk) === false && source.pause) {
          source.pause();
        }
      }
      source.on('data', ondata);
      function ondrain() {
        if (source.readable && source.resume) {
          source.resume();
        }
      }
      dest.on('drain', ondrain);
      if (!dest._isStdio && (!options || options.end !== false)) {
        source.on('end', onend);
        source.on('close', onclose);
      }
      let didOnEnd = false;
      function onend() {
        if (didOnEnd) return;
        didOnEnd = true;
        dest.end();
      }
      function onclose() {
        if (didOnEnd) return;
        didOnEnd = true;
        if (typeof dest.destroy === 'function') dest.destroy();
      }
      function onerror(er) {
        cleanup();
        if (EE.listenerCount(this, 'error') === 0) {
          this.emit('error', er);
        }
      }
      prependListener(source, 'error', onerror);
      prependListener(dest, 'error', onerror);
      function cleanup() {
        source.removeListener('data', ondata);
        dest.removeListener('drain', ondrain);
        source.removeListener('end', onend);
        source.removeListener('close', onclose);
        source.removeListener('error', onerror);
        dest.removeListener('error', onerror);
        source.removeListener('end', cleanup);
        source.removeListener('close', cleanup);
        dest.removeListener('close', cleanup);
      }
      source.on('end', cleanup);
      source.on('close', cleanup);
      dest.on('close', cleanup);
      dest.emit('pipe', source);
      return dest;
    };
    function prependListener(emitter, event, fn) {
      if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);
      if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);
      else if (ArrayIsArray(emitter._events[event])) emitter._events[event].unshift(fn);
      else emitter._events[event] = [fn, emitter._events[event]];
    }
    module2.exports = {
      Stream,
      prependListener,
    };
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/add-abort-signal.js
var require_add_abort_signal = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/add-abort-signal.js'(exports2, module2) {
    'use strict';
    var { AbortError, codes } = require_errors();
    var { isNodeStream, isWebStream, kControllerErrorFunction } = require_utils();
    var eos = require_end_of_stream2();
    var { ERR_INVALID_ARG_TYPE } = codes;
    var validateAbortSignal = (signal, name) => {
      if (typeof signal !== 'object' || !('aborted' in signal)) {
        throw new ERR_INVALID_ARG_TYPE(name, 'AbortSignal', signal);
      }
    };
    module2.exports.addAbortSignal = function addAbortSignal(signal, stream) {
      validateAbortSignal(signal, 'signal');
      if (!isNodeStream(stream) && !isWebStream(stream)) {
        throw new ERR_INVALID_ARG_TYPE('stream', ['ReadableStream', 'WritableStream', 'Stream'], stream);
      }
      return module2.exports.addAbortSignalNoValidate(signal, stream);
    };
    module2.exports.addAbortSignalNoValidate = function (signal, stream) {
      if (typeof signal !== 'object' || !('aborted' in signal)) {
        return stream;
      }
      const onAbort = isNodeStream(stream)
        ? () => {
            stream.destroy(
              new AbortError(void 0, {
                cause: signal.reason,
              })
            );
          }
        : () => {
            stream[kControllerErrorFunction](
              new AbortError(void 0, {
                cause: signal.reason,
              })
            );
          };
      if (signal.aborted) {
        onAbort();
      } else {
        signal.addEventListener('abort', onAbort);
        eos(stream, () => signal.removeEventListener('abort', onAbort));
      }
      return stream;
    };
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/buffer_list.js
var require_buffer_list = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/buffer_list.js'(exports2, module2) {
    'use strict';
    var {
      StringPrototypeSlice,
      SymbolIterator,
      TypedArrayPrototypeSet,
      Uint8Array: Uint8Array2,
    } = require_primordials();
    var { Buffer: Buffer2 } = require('buffer');
    var { inspect } = require_util();
    module2.exports = class BufferList {
      constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
      }
      push(v) {
        const entry = {
          data: v,
          next: null,
        };
        if (this.length > 0) this.tail.next = entry;
        else this.head = entry;
        this.tail = entry;
        ++this.length;
      }
      unshift(v) {
        const entry = {
          data: v,
          next: this.head,
        };
        if (this.length === 0) this.tail = entry;
        this.head = entry;
        ++this.length;
      }
      shift() {
        if (this.length === 0) return;
        const ret = this.head.data;
        if (this.length === 1) this.head = this.tail = null;
        else this.head = this.head.next;
        --this.length;
        return ret;
      }
      clear() {
        this.head = this.tail = null;
        this.length = 0;
      }
      join(s) {
        if (this.length === 0) return '';
        let p = this.head;
        let ret = '' + p.data;
        while ((p = p.next) !== null) ret += s + p.data;
        return ret;
      }
      concat(n) {
        if (this.length === 0) return Buffer2.alloc(0);
        const ret = Buffer2.allocUnsafe(n >>> 0);
        let p = this.head;
        let i = 0;
        while (p) {
          TypedArrayPrototypeSet(ret, p.data, i);
          i += p.data.length;
          p = p.next;
        }
        return ret;
      }
      // Consumes a specified amount of bytes or characters from the buffered data.
      consume(n, hasStrings) {
        const data = this.head.data;
        if (n < data.length) {
          const slice = data.slice(0, n);
          this.head.data = data.slice(n);
          return slice;
        }
        if (n === data.length) {
          return this.shift();
        }
        return hasStrings ? this._getString(n) : this._getBuffer(n);
      }
      first() {
        return this.head.data;
      }
      *[SymbolIterator]() {
        for (let p = this.head; p; p = p.next) {
          yield p.data;
        }
      }
      // Consumes a specified amount of characters from the buffered data.
      _getString(n) {
        let ret = '';
        let p = this.head;
        let c = 0;
        do {
          const str = p.data;
          if (n > str.length) {
            ret += str;
            n -= str.length;
          } else {
            if (n === str.length) {
              ret += str;
              ++c;
              if (p.next) this.head = p.next;
              else this.head = this.tail = null;
            } else {
              ret += StringPrototypeSlice(str, 0, n);
              this.head = p;
              p.data = StringPrototypeSlice(str, n);
            }
            break;
          }
          ++c;
        } while ((p = p.next) !== null);
        this.length -= c;
        return ret;
      }
      // Consumes a specified amount of bytes from the buffered data.
      _getBuffer(n) {
        const ret = Buffer2.allocUnsafe(n);
        const retLen = n;
        let p = this.head;
        let c = 0;
        do {
          const buf = p.data;
          if (n > buf.length) {
            TypedArrayPrototypeSet(ret, buf, retLen - n);
            n -= buf.length;
          } else {
            if (n === buf.length) {
              TypedArrayPrototypeSet(ret, buf, retLen - n);
              ++c;
              if (p.next) this.head = p.next;
              else this.head = this.tail = null;
            } else {
              TypedArrayPrototypeSet(ret, new Uint8Array2(buf.buffer, buf.byteOffset, n), retLen - n);
              this.head = p;
              p.data = buf.slice(n);
            }
            break;
          }
          ++c;
        } while ((p = p.next) !== null);
        this.length -= c;
        return ret;
      }
      // Make sure the linked list only shows the minimal necessary information.
      [Symbol.for('nodejs.util.inspect.custom')](_, options) {
        return inspect(this, {
          ...options,
          // Only inspect one level.
          depth: 0,
          // It should not recurse.
          customInspect: false,
        });
      }
    };
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/state.js
var require_state = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/state.js'(exports2, module2) {
    'use strict';
    var { MathFloor, NumberIsInteger } = require_primordials();
    var { ERR_INVALID_ARG_VALUE } = require_errors().codes;
    function highWaterMarkFrom(options, isDuplex, duplexKey) {
      return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
    }
    function getDefaultHighWaterMark(objectMode) {
      return objectMode ? 16 : 16 * 1024;
    }
    function getHighWaterMark(state, options, duplexKey, isDuplex) {
      const hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
      if (hwm != null) {
        if (!NumberIsInteger(hwm) || hwm < 0) {
          const name = isDuplex ? `options.${duplexKey}` : 'options.highWaterMark';
          throw new ERR_INVALID_ARG_VALUE(name, hwm);
        }
        return MathFloor(hwm);
      }
      return getDefaultHighWaterMark(state.objectMode);
    }
    module2.exports = {
      getHighWaterMark,
      getDefaultHighWaterMark,
    };
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/from.js
var require_from = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/from.js'(exports2, module2) {
    'use strict';
    var process2 = require_process();
    var { PromisePrototypeThen, SymbolAsyncIterator, SymbolIterator } = require_primordials();
    var { Buffer: Buffer2 } = require('buffer');
    var { ERR_INVALID_ARG_TYPE, ERR_STREAM_NULL_VALUES } = require_errors().codes;
    function from(Readable, iterable, opts) {
      let iterator;
      if (typeof iterable === 'string' || iterable instanceof Buffer2) {
        return new Readable({
          objectMode: true,
          ...opts,
          read() {
            this.push(iterable);
            this.push(null);
          },
        });
      }
      let isAsync;
      if (iterable && iterable[SymbolAsyncIterator]) {
        isAsync = true;
        iterator = iterable[SymbolAsyncIterator]();
      } else if (iterable && iterable[SymbolIterator]) {
        isAsync = false;
        iterator = iterable[SymbolIterator]();
      } else {
        throw new ERR_INVALID_ARG_TYPE('iterable', ['Iterable'], iterable);
      }
      const readable = new Readable({
        objectMode: true,
        highWaterMark: 1,
        // TODO(ronag): What options should be allowed?
        ...opts,
      });
      let reading = false;
      readable._read = function () {
        if (!reading) {
          reading = true;
          next();
        }
      };
      readable._destroy = function (error, cb) {
        PromisePrototypeThen(
          close(error),
          () => process2.nextTick(cb, error),
          // nextTick is here in case cb throws
          (e) => process2.nextTick(cb, e || error)
        );
      };
      async function close(error) {
        const hadError = error !== void 0 && error !== null;
        const hasThrow = typeof iterator.throw === 'function';
        if (hadError && hasThrow) {
          const { value, done } = await iterator.throw(error);
          await value;
          if (done) {
            return;
          }
        }
        if (typeof iterator.return === 'function') {
          const { value } = await iterator.return();
          await value;
        }
      }
      async function next() {
        for (;;) {
          try {
            const { value, done } = isAsync ? await iterator.next() : iterator.next();
            if (done) {
              readable.push(null);
            } else {
              const res = value && typeof value.then === 'function' ? await value : value;
              if (res === null) {
                reading = false;
                throw new ERR_STREAM_NULL_VALUES();
              } else if (readable.push(res)) {
                continue;
              } else {
                reading = false;
              }
            }
          } catch (err) {
            readable.destroy(err);
          }
          break;
        }
      }
      return readable;
    }
    module2.exports = from;
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/readable.js
var require_readable = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/readable.js'(exports2, module2) {
    var process2 = require_process();
    var {
      ArrayPrototypeIndexOf,
      NumberIsInteger,
      NumberIsNaN,
      NumberParseInt,
      ObjectDefineProperties,
      ObjectKeys,
      ObjectSetPrototypeOf,
      Promise: Promise2,
      SafeSet,
      SymbolAsyncIterator,
      Symbol: Symbol2,
    } = require_primordials();
    module2.exports = Readable;
    Readable.ReadableState = ReadableState;
    var { EventEmitter: EE } = require('events');
    var { Stream, prependListener } = require_legacy();
    var { Buffer: Buffer2 } = require('buffer');
    var { addAbortSignal } = require_add_abort_signal();
    var eos = require_end_of_stream2();
    var debug = require_util().debuglog('stream', (fn) => {
      debug = fn;
    });
    var BufferList = require_buffer_list();
    var destroyImpl = require_destroy();
    var { getHighWaterMark, getDefaultHighWaterMark } = require_state();
    var {
      aggregateTwoErrors,
      codes: {
        ERR_INVALID_ARG_TYPE,
        ERR_METHOD_NOT_IMPLEMENTED,
        ERR_OUT_OF_RANGE,
        ERR_STREAM_PUSH_AFTER_EOF,
        ERR_STREAM_UNSHIFT_AFTER_END_EVENT,
      },
    } = require_errors();
    var { validateObject } = require_validators();
    var kPaused = Symbol2('kPaused');
    var { StringDecoder } = require('string_decoder');
    var from = require_from();
    ObjectSetPrototypeOf(Readable.prototype, Stream.prototype);
    ObjectSetPrototypeOf(Readable, Stream);
    var nop = () => {};
    var { errorOrDestroy } = destroyImpl;
    function ReadableState(options, stream, isDuplex) {
      if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof require_duplex();
      this.objectMode = !!(options && options.objectMode);
      if (isDuplex) this.objectMode = this.objectMode || !!(options && options.readableObjectMode);
      this.highWaterMark = options
        ? getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex)
        : getDefaultHighWaterMark(false);
      this.buffer = new BufferList();
      this.length = 0;
      this.pipes = [];
      this.flowing = null;
      this.ended = false;
      this.endEmitted = false;
      this.reading = false;
      this.constructed = true;
      this.sync = true;
      this.needReadable = false;
      this.emittedReadable = false;
      this.readableListening = false;
      this.resumeScheduled = false;
      this[kPaused] = null;
      this.errorEmitted = false;
      this.emitClose = !options || options.emitClose !== false;
      this.autoDestroy = !options || options.autoDestroy !== false;
      this.destroyed = false;
      this.errored = null;
      this.closed = false;
      this.closeEmitted = false;
      this.defaultEncoding = (options && options.defaultEncoding) || 'utf8';
      this.awaitDrainWriters = null;
      this.multiAwaitDrain = false;
      this.readingMore = false;
      this.dataEmitted = false;
      this.decoder = null;
      this.encoding = null;
      if (options && options.encoding) {
        this.decoder = new StringDecoder(options.encoding);
        this.encoding = options.encoding;
      }
    }
    function Readable(options) {
      if (!(this instanceof Readable)) return new Readable(options);
      const isDuplex = this instanceof require_duplex();
      this._readableState = new ReadableState(options, this, isDuplex);
      if (options) {
        if (typeof options.read === 'function') this._read = options.read;
        if (typeof options.destroy === 'function') this._destroy = options.destroy;
        if (typeof options.construct === 'function') this._construct = options.construct;
        if (options.signal && !isDuplex) addAbortSignal(options.signal, this);
      }
      Stream.call(this, options);
      destroyImpl.construct(this, () => {
        if (this._readableState.needReadable) {
          maybeReadMore(this, this._readableState);
        }
      });
    }
    Readable.prototype.destroy = destroyImpl.destroy;
    Readable.prototype._undestroy = destroyImpl.undestroy;
    Readable.prototype._destroy = function (err, cb) {
      cb(err);
    };
    Readable.prototype[EE.captureRejectionSymbol] = function (err) {
      this.destroy(err);
    };
    Readable.prototype.push = function (chunk, encoding) {
      return readableAddChunk(this, chunk, encoding, false);
    };
    Readable.prototype.unshift = function (chunk, encoding) {
      return readableAddChunk(this, chunk, encoding, true);
    };
    function readableAddChunk(stream, chunk, encoding, addToFront) {
      debug('readableAddChunk', chunk);
      const state = stream._readableState;
      let err;
      if (!state.objectMode) {
        if (typeof chunk === 'string') {
          encoding = encoding || state.defaultEncoding;
          if (state.encoding !== encoding) {
            if (addToFront && state.encoding) {
              chunk = Buffer2.from(chunk, encoding).toString(state.encoding);
            } else {
              chunk = Buffer2.from(chunk, encoding);
              encoding = '';
            }
          }
        } else if (chunk instanceof Buffer2) {
          encoding = '';
        } else if (Stream._isUint8Array(chunk)) {
          chunk = Stream._uint8ArrayToBuffer(chunk);
          encoding = '';
        } else if (chunk != null) {
          err = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
        }
      }
      if (err) {
        errorOrDestroy(stream, err);
      } else if (chunk === null) {
        state.reading = false;
        onEofChunk(stream, state);
      } else if (state.objectMode || (chunk && chunk.length > 0)) {
        if (addToFront) {
          if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());
          else if (state.destroyed || state.errored) return false;
          else addChunk(stream, state, chunk, true);
        } else if (state.ended) {
          errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
        } else if (state.destroyed || state.errored) {
          return false;
        } else {
          state.reading = false;
          if (state.decoder && !encoding) {
            chunk = state.decoder.write(chunk);
            if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);
            else maybeReadMore(stream, state);
          } else {
            addChunk(stream, state, chunk, false);
          }
        }
      } else if (!addToFront) {
        state.reading = false;
        maybeReadMore(stream, state);
      }
      return !state.ended && (state.length < state.highWaterMark || state.length === 0);
    }
    function addChunk(stream, state, chunk, addToFront) {
      if (state.flowing && state.length === 0 && !state.sync && stream.listenerCount('data') > 0) {
        if (state.multiAwaitDrain) {
          state.awaitDrainWriters.clear();
        } else {
          state.awaitDrainWriters = null;
        }
        state.dataEmitted = true;
        stream.emit('data', chunk);
      } else {
        state.length += state.objectMode ? 1 : chunk.length;
        if (addToFront) state.buffer.unshift(chunk);
        else state.buffer.push(chunk);
        if (state.needReadable) emitReadable(stream);
      }
      maybeReadMore(stream, state);
    }
    Readable.prototype.isPaused = function () {
      const state = this._readableState;
      return state[kPaused] === true || state.flowing === false;
    };
    Readable.prototype.setEncoding = function (enc) {
      const decoder = new StringDecoder(enc);
      this._readableState.decoder = decoder;
      this._readableState.encoding = this._readableState.decoder.encoding;
      const buffer = this._readableState.buffer;
      let content = '';
      for (const data of buffer) {
        content += decoder.write(data);
      }
      buffer.clear();
      if (content !== '') buffer.push(content);
      this._readableState.length = content.length;
      return this;
    };
    var MAX_HWM = 1073741824;
    function computeNewHighWaterMark(n) {
      if (n > MAX_HWM) {
        throw new ERR_OUT_OF_RANGE('size', '<= 1GiB', n);
      } else {
        n--;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        n++;
      }
      return n;
    }
    function howMuchToRead(n, state) {
      if (n <= 0 || (state.length === 0 && state.ended)) return 0;
      if (state.objectMode) return 1;
      if (NumberIsNaN(n)) {
        if (state.flowing && state.length) return state.buffer.first().length;
        return state.length;
      }
      if (n <= state.length) return n;
      return state.ended ? state.length : 0;
    }
    Readable.prototype.read = function (n) {
      debug('read', n);
      if (n === void 0) {
        n = NaN;
      } else if (!NumberIsInteger(n)) {
        n = NumberParseInt(n, 10);
      }
      const state = this._readableState;
      const nOrig = n;
      if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
      if (n !== 0) state.emittedReadable = false;
      if (
        n === 0 &&
        state.needReadable &&
        ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)
      ) {
        debug('read: emitReadable', state.length, state.ended);
        if (state.length === 0 && state.ended) endReadable(this);
        else emitReadable(this);
        return null;
      }
      n = howMuchToRead(n, state);
      if (n === 0 && state.ended) {
        if (state.length === 0) endReadable(this);
        return null;
      }
      let doRead = state.needReadable;
      debug('need readable', doRead);
      if (state.length === 0 || state.length - n < state.highWaterMark) {
        doRead = true;
        debug('length less than watermark', doRead);
      }
      if (state.ended || state.reading || state.destroyed || state.errored || !state.constructed) {
        doRead = false;
        debug('reading, ended or constructing', doRead);
      } else if (doRead) {
        debug('do read');
        state.reading = true;
        state.sync = true;
        if (state.length === 0) state.needReadable = true;
        try {
          this._read(state.highWaterMark);
        } catch (err) {
          errorOrDestroy(this, err);
        }
        state.sync = false;
        if (!state.reading) n = howMuchToRead(nOrig, state);
      }
      let ret;
      if (n > 0) ret = fromList(n, state);
      else ret = null;
      if (ret === null) {
        state.needReadable = state.length <= state.highWaterMark;
        n = 0;
      } else {
        state.length -= n;
        if (state.multiAwaitDrain) {
          state.awaitDrainWriters.clear();
        } else {
          state.awaitDrainWriters = null;
        }
      }
      if (state.length === 0) {
        if (!state.ended) state.needReadable = true;
        if (nOrig !== n && state.ended) endReadable(this);
      }
      if (ret !== null && !state.errorEmitted && !state.closeEmitted) {
        state.dataEmitted = true;
        this.emit('data', ret);
      }
      return ret;
    };
    function onEofChunk(stream, state) {
      debug('onEofChunk');
      if (state.ended) return;
      if (state.decoder) {
        const chunk = state.decoder.end();
        if (chunk && chunk.length) {
          state.buffer.push(chunk);
          state.length += state.objectMode ? 1 : chunk.length;
        }
      }
      state.ended = true;
      if (state.sync) {
        emitReadable(stream);
      } else {
        state.needReadable = false;
        state.emittedReadable = true;
        emitReadable_(stream);
      }
    }
    function emitReadable(stream) {
      const state = stream._readableState;
      debug('emitReadable', state.needReadable, state.emittedReadable);
      state.needReadable = false;
      if (!state.emittedReadable) {
        debug('emitReadable', state.flowing);
        state.emittedReadable = true;
        process2.nextTick(emitReadable_, stream);
      }
    }
    function emitReadable_(stream) {
      const state = stream._readableState;
      debug('emitReadable_', state.destroyed, state.length, state.ended);
      if (!state.destroyed && !state.errored && (state.length || state.ended)) {
        stream.emit('readable');
        state.emittedReadable = false;
      }
      state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
      flow(stream);
    }
    function maybeReadMore(stream, state) {
      if (!state.readingMore && state.constructed) {
        state.readingMore = true;
        process2.nextTick(maybeReadMore_, stream, state);
      }
    }
    function maybeReadMore_(stream, state) {
      while (
        !state.reading &&
        !state.ended &&
        (state.length < state.highWaterMark || (state.flowing && state.length === 0))
      ) {
        const len = state.length;
        debug('maybeReadMore read 0');
        stream.read(0);
        if (len === state.length) break;
      }
      state.readingMore = false;
    }
    Readable.prototype._read = function (n) {
      throw new ERR_METHOD_NOT_IMPLEMENTED('_read()');
    };
    Readable.prototype.pipe = function (dest, pipeOpts) {
      const src = this;
      const state = this._readableState;
      if (state.pipes.length === 1) {
        if (!state.multiAwaitDrain) {
          state.multiAwaitDrain = true;
          state.awaitDrainWriters = new SafeSet(state.awaitDrainWriters ? [state.awaitDrainWriters] : []);
        }
      }
      state.pipes.push(dest);
      debug('pipe count=%d opts=%j', state.pipes.length, pipeOpts);
      const doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process2.stdout && dest !== process2.stderr;
      const endFn = doEnd ? onend : unpipe;
      if (state.endEmitted) process2.nextTick(endFn);
      else src.once('end', endFn);
      dest.on('unpipe', onunpipe);
      function onunpipe(readable, unpipeInfo) {
        debug('onunpipe');
        if (readable === src) {
          if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
            unpipeInfo.hasUnpiped = true;
            cleanup();
          }
        }
      }
      function onend() {
        debug('onend');
        dest.end();
      }
      let ondrain;
      let cleanedUp = false;
      function cleanup() {
        debug('cleanup');
        dest.removeListener('close', onclose);
        dest.removeListener('finish', onfinish);
        if (ondrain) {
          dest.removeListener('drain', ondrain);
        }
        dest.removeListener('error', onerror);
        dest.removeListener('unpipe', onunpipe);
        src.removeListener('end', onend);
        src.removeListener('end', unpipe);
        src.removeListener('data', ondata);
        cleanedUp = true;
        if (ondrain && state.awaitDrainWriters && (!dest._writableState || dest._writableState.needDrain)) ondrain();
      }
      function pause() {
        if (!cleanedUp) {
          if (state.pipes.length === 1 && state.pipes[0] === dest) {
            debug('false write response, pause', 0);
            state.awaitDrainWriters = dest;
            state.multiAwaitDrain = false;
          } else if (state.pipes.length > 1 && state.pipes.includes(dest)) {
            debug('false write response, pause', state.awaitDrainWriters.size);
            state.awaitDrainWriters.add(dest);
          }
          src.pause();
        }
        if (!ondrain) {
          ondrain = pipeOnDrain(src, dest);
          dest.on('drain', ondrain);
        }
      }
      src.on('data', ondata);
      function ondata(chunk) {
        debug('ondata');
        const ret = dest.write(chunk);
        debug('dest.write', ret);
        if (ret === false) {
          pause();
        }
      }
      function onerror(er) {
        debug('onerror', er);
        unpipe();
        dest.removeListener('error', onerror);
        if (dest.listenerCount('error') === 0) {
          const s = dest._writableState || dest._readableState;
          if (s && !s.errorEmitted) {
            errorOrDestroy(dest, er);
          } else {
            dest.emit('error', er);
          }
        }
      }
      prependListener(dest, 'error', onerror);
      function onclose() {
        dest.removeListener('finish', onfinish);
        unpipe();
      }
      dest.once('close', onclose);
      function onfinish() {
        debug('onfinish');
        dest.removeListener('close', onclose);
        unpipe();
      }
      dest.once('finish', onfinish);
      function unpipe() {
        debug('unpipe');
        src.unpipe(dest);
      }
      dest.emit('pipe', src);
      if (dest.writableNeedDrain === true) {
        if (state.flowing) {
          pause();
        }
      } else if (!state.flowing) {
        debug('pipe resume');
        src.resume();
      }
      return dest;
    };
    function pipeOnDrain(src, dest) {
      return function pipeOnDrainFunctionResult() {
        const state = src._readableState;
        if (state.awaitDrainWriters === dest) {
          debug('pipeOnDrain', 1);
          state.awaitDrainWriters = null;
        } else if (state.multiAwaitDrain) {
          debug('pipeOnDrain', state.awaitDrainWriters.size);
          state.awaitDrainWriters.delete(dest);
        }
        if ((!state.awaitDrainWriters || state.awaitDrainWriters.size === 0) && src.listenerCount('data')) {
          src.resume();
        }
      };
    }
    Readable.prototype.unpipe = function (dest) {
      const state = this._readableState;
      const unpipeInfo = {
        hasUnpiped: false,
      };
      if (state.pipes.length === 0) return this;
      if (!dest) {
        const dests = state.pipes;
        state.pipes = [];
        this.pause();
        for (let i = 0; i < dests.length; i++)
          dests[i].emit('unpipe', this, {
            hasUnpiped: false,
          });
        return this;
      }
      const index = ArrayPrototypeIndexOf(state.pipes, dest);
      if (index === -1) return this;
      state.pipes.splice(index, 1);
      if (state.pipes.length === 0) this.pause();
      dest.emit('unpipe', this, unpipeInfo);
      return this;
    };
    Readable.prototype.on = function (ev, fn) {
      const res = Stream.prototype.on.call(this, ev, fn);
      const state = this._readableState;
      if (ev === 'data') {
        state.readableListening = this.listenerCount('readable') > 0;
        if (state.flowing !== false) this.resume();
      } else if (ev === 'readable') {
        if (!state.endEmitted && !state.readableListening) {
          state.readableListening = state.needReadable = true;
          state.flowing = false;
          state.emittedReadable = false;
          debug('on readable', state.length, state.reading);
          if (state.length) {
            emitReadable(this);
          } else if (!state.reading) {
            process2.nextTick(nReadingNextTick, this);
          }
        }
      }
      return res;
    };
    Readable.prototype.addListener = Readable.prototype.on;
    Readable.prototype.removeListener = function (ev, fn) {
      const res = Stream.prototype.removeListener.call(this, ev, fn);
      if (ev === 'readable') {
        process2.nextTick(updateReadableListening, this);
      }
      return res;
    };
    Readable.prototype.off = Readable.prototype.removeListener;
    Readable.prototype.removeAllListeners = function (ev) {
      const res = Stream.prototype.removeAllListeners.apply(this, arguments);
      if (ev === 'readable' || ev === void 0) {
        process2.nextTick(updateReadableListening, this);
      }
      return res;
    };
    function updateReadableListening(self) {
      const state = self._readableState;
      state.readableListening = self.listenerCount('readable') > 0;
      if (state.resumeScheduled && state[kPaused] === false) {
        state.flowing = true;
      } else if (self.listenerCount('data') > 0) {
        self.resume();
      } else if (!state.readableListening) {
        state.flowing = null;
      }
    }
    function nReadingNextTick(self) {
      debug('readable nexttick read 0');
      self.read(0);
    }
    Readable.prototype.resume = function () {
      const state = this._readableState;
      if (!state.flowing) {
        debug('resume');
        state.flowing = !state.readableListening;
        resume(this, state);
      }
      state[kPaused] = false;
      return this;
    };
    function resume(stream, state) {
      if (!state.resumeScheduled) {
        state.resumeScheduled = true;
        process2.nextTick(resume_, stream, state);
      }
    }
    function resume_(stream, state) {
      debug('resume', state.reading);
      if (!state.reading) {
        stream.read(0);
      }
      state.resumeScheduled = false;
      stream.emit('resume');
      flow(stream);
      if (state.flowing && !state.reading) stream.read(0);
    }
    Readable.prototype.pause = function () {
      debug('call pause flowing=%j', this._readableState.flowing);
      if (this._readableState.flowing !== false) {
        debug('pause');
        this._readableState.flowing = false;
        this.emit('pause');
      }
      this._readableState[kPaused] = true;
      return this;
    };
    function flow(stream) {
      const state = stream._readableState;
      debug('flow', state.flowing);
      while (state.flowing && stream.read() !== null);
    }
    Readable.prototype.wrap = function (stream) {
      let paused = false;
      stream.on('data', (chunk) => {
        if (!this.push(chunk) && stream.pause) {
          paused = true;
          stream.pause();
        }
      });
      stream.on('end', () => {
        this.push(null);
      });
      stream.on('error', (err) => {
        errorOrDestroy(this, err);
      });
      stream.on('close', () => {
        this.destroy();
      });
      stream.on('destroy', () => {
        this.destroy();
      });
      this._read = () => {
        if (paused && stream.resume) {
          paused = false;
          stream.resume();
        }
      };
      const streamKeys = ObjectKeys(stream);
      for (let j = 1; j < streamKeys.length; j++) {
        const i = streamKeys[j];
        if (this[i] === void 0 && typeof stream[i] === 'function') {
          this[i] = stream[i].bind(stream);
        }
      }
      return this;
    };
    Readable.prototype[SymbolAsyncIterator] = function () {
      return streamToAsyncIterator(this);
    };
    Readable.prototype.iterator = function (options) {
      if (options !== void 0) {
        validateObject(options, 'options');
      }
      return streamToAsyncIterator(this, options);
    };
    function streamToAsyncIterator(stream, options) {
      if (typeof stream.read !== 'function') {
        stream = Readable.wrap(stream, {
          objectMode: true,
        });
      }
      const iter = createAsyncIterator(stream, options);
      iter.stream = stream;
      return iter;
    }
    async function* createAsyncIterator(stream, options) {
      let callback = nop;
      function next(resolve) {
        if (this === stream) {
          callback();
          callback = nop;
        } else {
          callback = resolve;
        }
      }
      stream.on('readable', next);
      let error;
      const cleanup = eos(
        stream,
        {
          writable: false,
        },
        (err) => {
          error = err ? aggregateTwoErrors(error, err) : null;
          callback();
          callback = nop;
        }
      );
      try {
        while (true) {
          const chunk = stream.destroyed ? null : stream.read();
          if (chunk !== null) {
            yield chunk;
          } else if (error) {
            throw error;
          } else if (error === null) {
            return;
          } else {
            await new Promise2(next);
          }
        }
      } catch (err) {
        error = aggregateTwoErrors(error, err);
        throw error;
      } finally {
        if (
          (error || (options === null || options === void 0 ? void 0 : options.destroyOnReturn) !== false) &&
          (error === void 0 || stream._readableState.autoDestroy)
        ) {
          destroyImpl.destroyer(stream, null);
        } else {
          stream.off('readable', next);
          cleanup();
        }
      }
    }
    ObjectDefineProperties(Readable.prototype, {
      readable: {
        __proto__: null,
        get() {
          const r = this._readableState;
          return !!r && r.readable !== false && !r.destroyed && !r.errorEmitted && !r.endEmitted;
        },
        set(val) {
          if (this._readableState) {
            this._readableState.readable = !!val;
          }
        },
      },
      readableDidRead: {
        __proto__: null,
        enumerable: false,
        get: function () {
          return this._readableState.dataEmitted;
        },
      },
      readableAborted: {
        __proto__: null,
        enumerable: false,
        get: function () {
          return !!(
            this._readableState.readable !== false &&
            (this._readableState.destroyed || this._readableState.errored) &&
            !this._readableState.endEmitted
          );
        },
      },
      readableHighWaterMark: {
        __proto__: null,
        enumerable: false,
        get: function () {
          return this._readableState.highWaterMark;
        },
      },
      readableBuffer: {
        __proto__: null,
        enumerable: false,
        get: function () {
          return this._readableState && this._readableState.buffer;
        },
      },
      readableFlowing: {
        __proto__: null,
        enumerable: false,
        get: function () {
          return this._readableState.flowing;
        },
        set: function (state) {
          if (this._readableState) {
            this._readableState.flowing = state;
          }
        },
      },
      readableLength: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState.length;
        },
      },
      readableObjectMode: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.objectMode : false;
        },
      },
      readableEncoding: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.encoding : null;
        },
      },
      errored: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.errored : null;
        },
      },
      closed: {
        __proto__: null,
        get() {
          return this._readableState ? this._readableState.closed : false;
        },
      },
      destroyed: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.destroyed : false;
        },
        set(value) {
          if (!this._readableState) {
            return;
          }
          this._readableState.destroyed = value;
        },
      },
      readableEnded: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.endEmitted : false;
        },
      },
    });
    ObjectDefineProperties(ReadableState.prototype, {
      // Legacy getter for `pipesCount`.
      pipesCount: {
        __proto__: null,
        get() {
          return this.pipes.length;
        },
      },
      // Legacy property for `paused`.
      paused: {
        __proto__: null,
        get() {
          return this[kPaused] !== false;
        },
        set(value) {
          this[kPaused] = !!value;
        },
      },
    });
    Readable._fromList = fromList;
    function fromList(n, state) {
      if (state.length === 0) return null;
      let ret;
      if (state.objectMode) ret = state.buffer.shift();
      else if (!n || n >= state.length) {
        if (state.decoder) ret = state.buffer.join('');
        else if (state.buffer.length === 1) ret = state.buffer.first();
        else ret = state.buffer.concat(state.length);
        state.buffer.clear();
      } else {
        ret = state.buffer.consume(n, state.decoder);
      }
      return ret;
    }
    function endReadable(stream) {
      const state = stream._readableState;
      debug('endReadable', state.endEmitted);
      if (!state.endEmitted) {
        state.ended = true;
        process2.nextTick(endReadableNT, state, stream);
      }
    }
    function endReadableNT(state, stream) {
      debug('endReadableNT', state.endEmitted, state.length);
      if (!state.errored && !state.closeEmitted && !state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.emit('end');
        if (stream.writable && stream.allowHalfOpen === false) {
          process2.nextTick(endWritableNT, stream);
        } else if (state.autoDestroy) {
          const wState = stream._writableState;
          const autoDestroy =
            !wState ||
            (wState.autoDestroy && // We don't expect the writable to ever 'finish'
              // if writable is explicitly set to false.
              (wState.finished || wState.writable === false));
          if (autoDestroy) {
            stream.destroy();
          }
        }
      }
    }
    function endWritableNT(stream) {
      const writable = stream.writable && !stream.writableEnded && !stream.destroyed;
      if (writable) {
        stream.end();
      }
    }
    Readable.from = function (iterable, opts) {
      return from(Readable, iterable, opts);
    };
    var webStreamsAdapters;
    function lazyWebStreams() {
      if (webStreamsAdapters === void 0) webStreamsAdapters = {};
      return webStreamsAdapters;
    }
    Readable.fromWeb = function (readableStream, options) {
      return lazyWebStreams().newStreamReadableFromReadableStream(readableStream, options);
    };
    Readable.toWeb = function (streamReadable, options) {
      return lazyWebStreams().newReadableStreamFromStreamReadable(streamReadable, options);
    };
    Readable.wrap = function (src, options) {
      var _ref, _src$readableObjectMo;
      return new Readable({
        objectMode:
          (_ref =
            (_src$readableObjectMo = src.readableObjectMode) !== null && _src$readableObjectMo !== void 0
              ? _src$readableObjectMo
              : src.objectMode) !== null && _ref !== void 0
            ? _ref
            : true,
        ...options,
        destroy(err, callback) {
          destroyImpl.destroyer(src, err);
          callback(err);
        },
      }).wrap(src);
    };
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/writable.js
var require_writable = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/writable.js'(exports2, module2) {
    var process2 = require_process();
    var {
      ArrayPrototypeSlice,
      Error: Error2,
      FunctionPrototypeSymbolHasInstance,
      ObjectDefineProperty,
      ObjectDefineProperties,
      ObjectSetPrototypeOf,
      StringPrototypeToLowerCase,
      Symbol: Symbol2,
      SymbolHasInstance,
    } = require_primordials();
    module2.exports = Writable;
    Writable.WritableState = WritableState;
    var { EventEmitter: EE } = require('events');
    var Stream = require_legacy().Stream;
    var { Buffer: Buffer2 } = require('buffer');
    var destroyImpl = require_destroy();
    var { addAbortSignal } = require_add_abort_signal();
    var { getHighWaterMark, getDefaultHighWaterMark } = require_state();
    var {
      ERR_INVALID_ARG_TYPE,
      ERR_METHOD_NOT_IMPLEMENTED,
      ERR_MULTIPLE_CALLBACK,
      ERR_STREAM_CANNOT_PIPE,
      ERR_STREAM_DESTROYED,
      ERR_STREAM_ALREADY_FINISHED,
      ERR_STREAM_NULL_VALUES,
      ERR_STREAM_WRITE_AFTER_END,
      ERR_UNKNOWN_ENCODING,
    } = require_errors().codes;
    var { errorOrDestroy } = destroyImpl;
    ObjectSetPrototypeOf(Writable.prototype, Stream.prototype);
    ObjectSetPrototypeOf(Writable, Stream);
    function nop() {}
    var kOnFinished = Symbol2('kOnFinished');
    function WritableState(options, stream, isDuplex) {
      if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof require_duplex();
      this.objectMode = !!(options && options.objectMode);
      if (isDuplex) this.objectMode = this.objectMode || !!(options && options.writableObjectMode);
      this.highWaterMark = options
        ? getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex)
        : getDefaultHighWaterMark(false);
      this.finalCalled = false;
      this.needDrain = false;
      this.ending = false;
      this.ended = false;
      this.finished = false;
      this.destroyed = false;
      const noDecode = !!(options && options.decodeStrings === false);
      this.decodeStrings = !noDecode;
      this.defaultEncoding = (options && options.defaultEncoding) || 'utf8';
      this.length = 0;
      this.writing = false;
      this.corked = 0;
      this.sync = true;
      this.bufferProcessing = false;
      this.onwrite = onwrite.bind(void 0, stream);
      this.writecb = null;
      this.writelen = 0;
      this.afterWriteTickInfo = null;
      resetBuffer(this);
      this.pendingcb = 0;
      this.constructed = true;
      this.prefinished = false;
      this.errorEmitted = false;
      this.emitClose = !options || options.emitClose !== false;
      this.autoDestroy = !options || options.autoDestroy !== false;
      this.errored = null;
      this.closed = false;
      this.closeEmitted = false;
      this[kOnFinished] = [];
    }
    function resetBuffer(state) {
      state.buffered = [];
      state.bufferedIndex = 0;
      state.allBuffers = true;
      state.allNoop = true;
    }
    WritableState.prototype.getBuffer = function getBuffer() {
      return ArrayPrototypeSlice(this.buffered, this.bufferedIndex);
    };
    ObjectDefineProperty(WritableState.prototype, 'bufferedRequestCount', {
      __proto__: null,
      get() {
        return this.buffered.length - this.bufferedIndex;
      },
    });
    function Writable(options) {
      const isDuplex = this instanceof require_duplex();
      if (!isDuplex && !FunctionPrototypeSymbolHasInstance(Writable, this)) return new Writable(options);
      this._writableState = new WritableState(options, this, isDuplex);
      if (options) {
        if (typeof options.write === 'function') this._write = options.write;
        if (typeof options.writev === 'function') this._writev = options.writev;
        if (typeof options.destroy === 'function') this._destroy = options.destroy;
        if (typeof options.final === 'function') this._final = options.final;
        if (typeof options.construct === 'function') this._construct = options.construct;
        if (options.signal) addAbortSignal(options.signal, this);
      }
      Stream.call(this, options);
      destroyImpl.construct(this, () => {
        const state = this._writableState;
        if (!state.writing) {
          clearBuffer(this, state);
        }
        finishMaybe(this, state);
      });
    }
    ObjectDefineProperty(Writable, SymbolHasInstance, {
      __proto__: null,
      value: function (object) {
        if (FunctionPrototypeSymbolHasInstance(this, object)) return true;
        if (this !== Writable) return false;
        return object && object._writableState instanceof WritableState;
      },
    });
    Writable.prototype.pipe = function () {
      errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
    };
    function _write(stream, chunk, encoding, cb) {
      const state = stream._writableState;
      if (typeof encoding === 'function') {
        cb = encoding;
        encoding = state.defaultEncoding;
      } else {
        if (!encoding) encoding = state.defaultEncoding;
        else if (encoding !== 'buffer' && !Buffer2.isEncoding(encoding)) throw new ERR_UNKNOWN_ENCODING(encoding);
        if (typeof cb !== 'function') cb = nop;
      }
      if (chunk === null) {
        throw new ERR_STREAM_NULL_VALUES();
      } else if (!state.objectMode) {
        if (typeof chunk === 'string') {
          if (state.decodeStrings !== false) {
            chunk = Buffer2.from(chunk, encoding);
            encoding = 'buffer';
          }
        } else if (chunk instanceof Buffer2) {
          encoding = 'buffer';
        } else if (Stream._isUint8Array(chunk)) {
          chunk = Stream._uint8ArrayToBuffer(chunk);
          encoding = 'buffer';
        } else {
          throw new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
        }
      }
      let err;
      if (state.ending) {
        err = new ERR_STREAM_WRITE_AFTER_END();
      } else if (state.destroyed) {
        err = new ERR_STREAM_DESTROYED('write');
      }
      if (err) {
        process2.nextTick(cb, err);
        errorOrDestroy(stream, err, true);
        return err;
      }
      state.pendingcb++;
      return writeOrBuffer(stream, state, chunk, encoding, cb);
    }
    Writable.prototype.write = function (chunk, encoding, cb) {
      return _write(this, chunk, encoding, cb) === true;
    };
    Writable.prototype.cork = function () {
      this._writableState.corked++;
    };
    Writable.prototype.uncork = function () {
      const state = this._writableState;
      if (state.corked) {
        state.corked--;
        if (!state.writing) clearBuffer(this, state);
      }
    };
    Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
      if (typeof encoding === 'string') encoding = StringPrototypeToLowerCase(encoding);
      if (!Buffer2.isEncoding(encoding)) throw new ERR_UNKNOWN_ENCODING(encoding);
      this._writableState.defaultEncoding = encoding;
      return this;
    };
    function writeOrBuffer(stream, state, chunk, encoding, callback) {
      const len = state.objectMode ? 1 : chunk.length;
      state.length += len;
      const ret = state.length < state.highWaterMark;
      if (!ret) state.needDrain = true;
      if (state.writing || state.corked || state.errored || !state.constructed) {
        state.buffered.push({
          chunk,
          encoding,
          callback,
        });
        if (state.allBuffers && encoding !== 'buffer') {
          state.allBuffers = false;
        }
        if (state.allNoop && callback !== nop) {
          state.allNoop = false;
        }
      } else {
        state.writelen = len;
        state.writecb = callback;
        state.writing = true;
        state.sync = true;
        stream._write(chunk, encoding, state.onwrite);
        state.sync = false;
      }
      return ret && !state.errored && !state.destroyed;
    }
    function doWrite(stream, state, writev, len, chunk, encoding, cb) {
      state.writelen = len;
      state.writecb = cb;
      state.writing = true;
      state.sync = true;
      if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));
      else if (writev) stream._writev(chunk, state.onwrite);
      else stream._write(chunk, encoding, state.onwrite);
      state.sync = false;
    }
    function onwriteError(stream, state, er, cb) {
      --state.pendingcb;
      cb(er);
      errorBuffer(state);
      errorOrDestroy(stream, er);
    }
    function onwrite(stream, er) {
      const state = stream._writableState;
      const sync = state.sync;
      const cb = state.writecb;
      if (typeof cb !== 'function') {
        errorOrDestroy(stream, new ERR_MULTIPLE_CALLBACK());
        return;
      }
      state.writing = false;
      state.writecb = null;
      state.length -= state.writelen;
      state.writelen = 0;
      if (er) {
        er.stack;
        if (!state.errored) {
          state.errored = er;
        }
        if (stream._readableState && !stream._readableState.errored) {
          stream._readableState.errored = er;
        }
        if (sync) {
          process2.nextTick(onwriteError, stream, state, er, cb);
        } else {
          onwriteError(stream, state, er, cb);
        }
      } else {
        if (state.buffered.length > state.bufferedIndex) {
          clearBuffer(stream, state);
        }
        if (sync) {
          if (state.afterWriteTickInfo !== null && state.afterWriteTickInfo.cb === cb) {
            state.afterWriteTickInfo.count++;
          } else {
            state.afterWriteTickInfo = {
              count: 1,
              cb,
              stream,
              state,
            };
            process2.nextTick(afterWriteTick, state.afterWriteTickInfo);
          }
        } else {
          afterWrite(stream, state, 1, cb);
        }
      }
    }
    function afterWriteTick({ stream, state, count, cb }) {
      state.afterWriteTickInfo = null;
      return afterWrite(stream, state, count, cb);
    }
    function afterWrite(stream, state, count, cb) {
      const needDrain = !state.ending && !stream.destroyed && state.length === 0 && state.needDrain;
      if (needDrain) {
        state.needDrain = false;
        stream.emit('drain');
      }
      while (count-- > 0) {
        state.pendingcb--;
        cb();
      }
      if (state.destroyed) {
        errorBuffer(state);
      }
      finishMaybe(stream, state);
    }
    function errorBuffer(state) {
      if (state.writing) {
        return;
      }
      for (let n = state.bufferedIndex; n < state.buffered.length; ++n) {
        var _state$errored;
        const { chunk, callback } = state.buffered[n];
        const len = state.objectMode ? 1 : chunk.length;
        state.length -= len;
        callback(
          (_state$errored = state.errored) !== null && _state$errored !== void 0
            ? _state$errored
            : new ERR_STREAM_DESTROYED('write')
        );
      }
      const onfinishCallbacks = state[kOnFinished].splice(0);
      for (let i = 0; i < onfinishCallbacks.length; i++) {
        var _state$errored2;
        onfinishCallbacks[i](
          (_state$errored2 = state.errored) !== null && _state$errored2 !== void 0
            ? _state$errored2
            : new ERR_STREAM_DESTROYED('end')
        );
      }
      resetBuffer(state);
    }
    function clearBuffer(stream, state) {
      if (state.corked || state.bufferProcessing || state.destroyed || !state.constructed) {
        return;
      }
      const { buffered, bufferedIndex, objectMode } = state;
      const bufferedLength = buffered.length - bufferedIndex;
      if (!bufferedLength) {
        return;
      }
      let i = bufferedIndex;
      state.bufferProcessing = true;
      if (bufferedLength > 1 && stream._writev) {
        state.pendingcb -= bufferedLength - 1;
        const callback = state.allNoop
          ? nop
          : (err) => {
              for (let n = i; n < buffered.length; ++n) {
                buffered[n].callback(err);
              }
            };
        const chunks = state.allNoop && i === 0 ? buffered : ArrayPrototypeSlice(buffered, i);
        chunks.allBuffers = state.allBuffers;
        doWrite(stream, state, true, state.length, chunks, '', callback);
        resetBuffer(state);
      } else {
        do {
          const { chunk, encoding, callback } = buffered[i];
          buffered[i++] = null;
          const len = objectMode ? 1 : chunk.length;
          doWrite(stream, state, false, len, chunk, encoding, callback);
        } while (i < buffered.length && !state.writing);
        if (i === buffered.length) {
          resetBuffer(state);
        } else if (i > 256) {
          buffered.splice(0, i);
          state.bufferedIndex = 0;
        } else {
          state.bufferedIndex = i;
        }
      }
      state.bufferProcessing = false;
    }
    Writable.prototype._write = function (chunk, encoding, cb) {
      if (this._writev) {
        this._writev(
          [
            {
              chunk,
              encoding,
            },
          ],
          cb
        );
      } else {
        throw new ERR_METHOD_NOT_IMPLEMENTED('_write()');
      }
    };
    Writable.prototype._writev = null;
    Writable.prototype.end = function (chunk, encoding, cb) {
      const state = this._writableState;
      if (typeof chunk === 'function') {
        cb = chunk;
        chunk = null;
        encoding = null;
      } else if (typeof encoding === 'function') {
        cb = encoding;
        encoding = null;
      }
      let err;
      if (chunk !== null && chunk !== void 0) {
        const ret = _write(this, chunk, encoding);
        if (ret instanceof Error2) {
          err = ret;
        }
      }
      if (state.corked) {
        state.corked = 1;
        this.uncork();
      }
      if (err) {
      } else if (!state.errored && !state.ending) {
        state.ending = true;
        finishMaybe(this, state, true);
        state.ended = true;
      } else if (state.finished) {
        err = new ERR_STREAM_ALREADY_FINISHED('end');
      } else if (state.destroyed) {
        err = new ERR_STREAM_DESTROYED('end');
      }
      if (typeof cb === 'function') {
        if (err || state.finished) {
          process2.nextTick(cb, err);
        } else {
          state[kOnFinished].push(cb);
        }
      }
      return this;
    };
    function needFinish(state) {
      return (
        state.ending &&
        !state.destroyed &&
        state.constructed &&
        state.length === 0 &&
        !state.errored &&
        state.buffered.length === 0 &&
        !state.finished &&
        !state.writing &&
        !state.errorEmitted &&
        !state.closeEmitted
      );
    }
    function callFinal(stream, state) {
      let called = false;
      function onFinish(err) {
        if (called) {
          errorOrDestroy(stream, err !== null && err !== void 0 ? err : ERR_MULTIPLE_CALLBACK());
          return;
        }
        called = true;
        state.pendingcb--;
        if (err) {
          const onfinishCallbacks = state[kOnFinished].splice(0);
          for (let i = 0; i < onfinishCallbacks.length; i++) {
            onfinishCallbacks[i](err);
          }
          errorOrDestroy(stream, err, state.sync);
        } else if (needFinish(state)) {
          state.prefinished = true;
          stream.emit('prefinish');
          state.pendingcb++;
          process2.nextTick(finish, stream, state);
        }
      }
      state.sync = true;
      state.pendingcb++;
      try {
        stream._final(onFinish);
      } catch (err) {
        onFinish(err);
      }
      state.sync = false;
    }
    function prefinish(stream, state) {
      if (!state.prefinished && !state.finalCalled) {
        if (typeof stream._final === 'function' && !state.destroyed) {
          state.finalCalled = true;
          callFinal(stream, state);
        } else {
          state.prefinished = true;
          stream.emit('prefinish');
        }
      }
    }
    function finishMaybe(stream, state, sync) {
      if (needFinish(state)) {
        prefinish(stream, state);
        if (state.pendingcb === 0) {
          if (sync) {
            state.pendingcb++;
            process2.nextTick(
              (stream2, state2) => {
                if (needFinish(state2)) {
                  finish(stream2, state2);
                } else {
                  state2.pendingcb--;
                }
              },
              stream,
              state
            );
          } else if (needFinish(state)) {
            state.pendingcb++;
            finish(stream, state);
          }
        }
      }
    }
    function finish(stream, state) {
      state.pendingcb--;
      state.finished = true;
      const onfinishCallbacks = state[kOnFinished].splice(0);
      for (let i = 0; i < onfinishCallbacks.length; i++) {
        onfinishCallbacks[i]();
      }
      stream.emit('finish');
      if (state.autoDestroy) {
        const rState = stream._readableState;
        const autoDestroy =
          !rState ||
          (rState.autoDestroy && // We don't expect the readable to ever 'end'
            // if readable is explicitly set to false.
            (rState.endEmitted || rState.readable === false));
        if (autoDestroy) {
          stream.destroy();
        }
      }
    }
    ObjectDefineProperties(Writable.prototype, {
      closed: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.closed : false;
        },
      },
      destroyed: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.destroyed : false;
        },
        set(value) {
          if (this._writableState) {
            this._writableState.destroyed = value;
          }
        },
      },
      writable: {
        __proto__: null,
        get() {
          const w = this._writableState;
          return !!w && w.writable !== false && !w.destroyed && !w.errored && !w.ending && !w.ended;
        },
        set(val) {
          if (this._writableState) {
            this._writableState.writable = !!val;
          }
        },
      },
      writableFinished: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.finished : false;
        },
      },
      writableObjectMode: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.objectMode : false;
        },
      },
      writableBuffer: {
        __proto__: null,
        get() {
          return this._writableState && this._writableState.getBuffer();
        },
      },
      writableEnded: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.ending : false;
        },
      },
      writableNeedDrain: {
        __proto__: null,
        get() {
          const wState = this._writableState;
          if (!wState) return false;
          return !wState.destroyed && !wState.ending && wState.needDrain;
        },
      },
      writableHighWaterMark: {
        __proto__: null,
        get() {
          return this._writableState && this._writableState.highWaterMark;
        },
      },
      writableCorked: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.corked : 0;
        },
      },
      writableLength: {
        __proto__: null,
        get() {
          return this._writableState && this._writableState.length;
        },
      },
      errored: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._writableState ? this._writableState.errored : null;
        },
      },
      writableAborted: {
        __proto__: null,
        enumerable: false,
        get: function () {
          return !!(
            this._writableState.writable !== false &&
            (this._writableState.destroyed || this._writableState.errored) &&
            !this._writableState.finished
          );
        },
      },
    });
    var destroy = destroyImpl.destroy;
    Writable.prototype.destroy = function (err, cb) {
      const state = this._writableState;
      if (!state.destroyed && (state.bufferedIndex < state.buffered.length || state[kOnFinished].length)) {
        process2.nextTick(errorBuffer, state);
      }
      destroy.call(this, err, cb);
      return this;
    };
    Writable.prototype._undestroy = destroyImpl.undestroy;
    Writable.prototype._destroy = function (err, cb) {
      cb(err);
    };
    Writable.prototype[EE.captureRejectionSymbol] = function (err) {
      this.destroy(err);
    };
    var webStreamsAdapters;
    function lazyWebStreams() {
      if (webStreamsAdapters === void 0) webStreamsAdapters = {};
      return webStreamsAdapters;
    }
    Writable.fromWeb = function (writableStream, options) {
      return lazyWebStreams().newStreamWritableFromWritableStream(writableStream, options);
    };
    Writable.toWeb = function (streamWritable) {
      return lazyWebStreams().newWritableStreamFromStreamWritable(streamWritable);
    };
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/duplexify.js
var require_duplexify = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/duplexify.js'(exports2, module2) {
    var process2 = require_process();
    var bufferModule = require('buffer');
    var {
      isReadable,
      isWritable,
      isIterable,
      isNodeStream,
      isReadableNodeStream,
      isWritableNodeStream,
      isDuplexNodeStream,
    } = require_utils();
    var eos = require_end_of_stream2();
    var {
      AbortError,
      codes: { ERR_INVALID_ARG_TYPE, ERR_INVALID_RETURN_VALUE },
    } = require_errors();
    var { destroyer } = require_destroy();
    var Duplex = require_duplex();
    var Readable = require_readable();
    var { createDeferredPromise } = require_util();
    var from = require_from();
    var Blob = globalThis.Blob || bufferModule.Blob;
    var isBlob =
      typeof Blob !== 'undefined'
        ? function isBlob2(b) {
            return b instanceof Blob;
          }
        : function isBlob2(b) {
            return false;
          };
    var AbortController = globalThis.AbortController || require_abort_controller().AbortController;
    var { FunctionPrototypeCall } = require_primordials();
    var Duplexify = class extends Duplex {
      constructor(options) {
        super(options);
        if ((options === null || options === void 0 ? void 0 : options.readable) === false) {
          this._readableState.readable = false;
          this._readableState.ended = true;
          this._readableState.endEmitted = true;
        }
        if ((options === null || options === void 0 ? void 0 : options.writable) === false) {
          this._writableState.writable = false;
          this._writableState.ending = true;
          this._writableState.ended = true;
          this._writableState.finished = true;
        }
      }
    };
    module2.exports = function duplexify(body, name) {
      if (isDuplexNodeStream(body)) {
        return body;
      }
      if (isReadableNodeStream(body)) {
        return _duplexify({
          readable: body,
        });
      }
      if (isWritableNodeStream(body)) {
        return _duplexify({
          writable: body,
        });
      }
      if (isNodeStream(body)) {
        return _duplexify({
          writable: false,
          readable: false,
        });
      }
      if (typeof body === 'function') {
        const { value, write, final, destroy } = fromAsyncGen(body);
        if (isIterable(value)) {
          return from(Duplexify, value, {
            // TODO (ronag): highWaterMark?
            objectMode: true,
            write,
            final,
            destroy,
          });
        }
        const then2 = value === null || value === void 0 ? void 0 : value.then;
        if (typeof then2 === 'function') {
          let d;
          const promise = FunctionPrototypeCall(
            then2,
            value,
            (val) => {
              if (val != null) {
                throw new ERR_INVALID_RETURN_VALUE('nully', 'body', val);
              }
            },
            (err) => {
              destroyer(d, err);
            }
          );
          return (d = new Duplexify({
            // TODO (ronag): highWaterMark?
            objectMode: true,
            readable: false,
            write,
            final(cb) {
              final(async () => {
                try {
                  await promise;
                  process2.nextTick(cb, null);
                } catch (err) {
                  process2.nextTick(cb, err);
                }
              });
            },
            destroy,
          }));
        }
        throw new ERR_INVALID_RETURN_VALUE('Iterable, AsyncIterable or AsyncFunction', name, value);
      }
      if (isBlob(body)) {
        return duplexify(body.arrayBuffer());
      }
      if (isIterable(body)) {
        return from(Duplexify, body, {
          // TODO (ronag): highWaterMark?
          objectMode: true,
          writable: false,
        });
      }
      if (
        typeof (body === null || body === void 0 ? void 0 : body.writable) === 'object' ||
        typeof (body === null || body === void 0 ? void 0 : body.readable) === 'object'
      ) {
        const readable =
          body !== null && body !== void 0 && body.readable
            ? isReadableNodeStream(body === null || body === void 0 ? void 0 : body.readable)
              ? body === null || body === void 0
                ? void 0
                : body.readable
              : duplexify(body.readable)
            : void 0;
        const writable =
          body !== null && body !== void 0 && body.writable
            ? isWritableNodeStream(body === null || body === void 0 ? void 0 : body.writable)
              ? body === null || body === void 0
                ? void 0
                : body.writable
              : duplexify(body.writable)
            : void 0;
        return _duplexify({
          readable,
          writable,
        });
      }
      const then = body === null || body === void 0 ? void 0 : body.then;
      if (typeof then === 'function') {
        let d;
        FunctionPrototypeCall(
          then,
          body,
          (val) => {
            if (val != null) {
              d.push(val);
            }
            d.push(null);
          },
          (err) => {
            destroyer(d, err);
          }
        );
        return (d = new Duplexify({
          objectMode: true,
          writable: false,
          read() {},
        }));
      }
      throw new ERR_INVALID_ARG_TYPE(
        name,
        [
          'Blob',
          'ReadableStream',
          'WritableStream',
          'Stream',
          'Iterable',
          'AsyncIterable',
          'Function',
          '{ readable, writable } pair',
          'Promise',
        ],
        body
      );
    };
    function fromAsyncGen(fn) {
      let { promise, resolve } = createDeferredPromise();
      const ac = new AbortController();
      const signal = ac.signal;
      const value = fn(
        (async function* () {
          while (true) {
            const _promise = promise;
            promise = null;
            const { chunk, done, cb } = await _promise;
            process2.nextTick(cb);
            if (done) return;
            if (signal.aborted)
              throw new AbortError(void 0, {
                cause: signal.reason,
              });
            ({ promise, resolve } = createDeferredPromise());
            yield chunk;
          }
        })(),
        {
          signal,
        }
      );
      return {
        value,
        write(chunk, encoding, cb) {
          const _resolve = resolve;
          resolve = null;
          _resolve({
            chunk,
            done: false,
            cb,
          });
        },
        final(cb) {
          const _resolve = resolve;
          resolve = null;
          _resolve({
            done: true,
            cb,
          });
        },
        destroy(err, cb) {
          ac.abort();
          cb(err);
        },
      };
    }
    function _duplexify(pair) {
      const r =
        pair.readable && typeof pair.readable.read !== 'function' ? Readable.wrap(pair.readable) : pair.readable;
      const w = pair.writable;
      let readable = !!isReadable(r);
      let writable = !!isWritable(w);
      let ondrain;
      let onfinish;
      let onreadable;
      let onclose;
      let d;
      function onfinished(err) {
        const cb = onclose;
        onclose = null;
        if (cb) {
          cb(err);
        } else if (err) {
          d.destroy(err);
        }
      }
      d = new Duplexify({
        // TODO (ronag): highWaterMark?
        readableObjectMode: !!(r !== null && r !== void 0 && r.readableObjectMode),
        writableObjectMode: !!(w !== null && w !== void 0 && w.writableObjectMode),
        readable,
        writable,
      });
      if (writable) {
        eos(w, (err) => {
          writable = false;
          if (err) {
            destroyer(r, err);
          }
          onfinished(err);
        });
        d._write = function (chunk, encoding, callback) {
          if (w.write(chunk, encoding)) {
            callback();
          } else {
            ondrain = callback;
          }
        };
        d._final = function (callback) {
          w.end();
          onfinish = callback;
        };
        w.on('drain', function () {
          if (ondrain) {
            const cb = ondrain;
            ondrain = null;
            cb();
          }
        });
        w.on('finish', function () {
          if (onfinish) {
            const cb = onfinish;
            onfinish = null;
            cb();
          }
        });
      }
      if (readable) {
        eos(r, (err) => {
          readable = false;
          if (err) {
            destroyer(r, err);
          }
          onfinished(err);
        });
        r.on('readable', function () {
          if (onreadable) {
            const cb = onreadable;
            onreadable = null;
            cb();
          }
        });
        r.on('end', function () {
          d.push(null);
        });
        d._read = function () {
          while (true) {
            const buf = r.read();
            if (buf === null) {
              onreadable = d._read;
              return;
            }
            if (!d.push(buf)) {
              return;
            }
          }
        };
      }
      d._destroy = function (err, callback) {
        if (!err && onclose !== null) {
          err = new AbortError();
        }
        onreadable = null;
        ondrain = null;
        onfinish = null;
        if (onclose === null) {
          callback(err);
        } else {
          onclose = callback;
          destroyer(w, err);
          destroyer(r, err);
        }
      };
      return d;
    }
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/duplex.js
var require_duplex = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/duplex.js'(exports2, module2) {
    'use strict';
    var { ObjectDefineProperties, ObjectGetOwnPropertyDescriptor, ObjectKeys, ObjectSetPrototypeOf } =
      require_primordials();
    module2.exports = Duplex;
    var Readable = require_readable();
    var Writable = require_writable();
    ObjectSetPrototypeOf(Duplex.prototype, Readable.prototype);
    ObjectSetPrototypeOf(Duplex, Readable);
    {
      const keys = ObjectKeys(Writable.prototype);
      for (let i = 0; i < keys.length; i++) {
        const method = keys[i];
        if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
      }
    }
    function Duplex(options) {
      if (!(this instanceof Duplex)) return new Duplex(options);
      Readable.call(this, options);
      Writable.call(this, options);
      if (options) {
        this.allowHalfOpen = options.allowHalfOpen !== false;
        if (options.readable === false) {
          this._readableState.readable = false;
          this._readableState.ended = true;
          this._readableState.endEmitted = true;
        }
        if (options.writable === false) {
          this._writableState.writable = false;
          this._writableState.ending = true;
          this._writableState.ended = true;
          this._writableState.finished = true;
        }
      } else {
        this.allowHalfOpen = true;
      }
    }
    ObjectDefineProperties(Duplex.prototype, {
      writable: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writable'),
      },
      writableHighWaterMark: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableHighWaterMark'),
      },
      writableObjectMode: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableObjectMode'),
      },
      writableBuffer: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableBuffer'),
      },
      writableLength: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableLength'),
      },
      writableFinished: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableFinished'),
      },
      writableCorked: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableCorked'),
      },
      writableEnded: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableEnded'),
      },
      writableNeedDrain: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableNeedDrain'),
      },
      destroyed: {
        __proto__: null,
        get() {
          if (this._readableState === void 0 || this._writableState === void 0) {
            return false;
          }
          return this._readableState.destroyed && this._writableState.destroyed;
        },
        set(value) {
          if (this._readableState && this._writableState) {
            this._readableState.destroyed = value;
            this._writableState.destroyed = value;
          }
        },
      },
    });
    var webStreamsAdapters;
    function lazyWebStreams() {
      if (webStreamsAdapters === void 0) webStreamsAdapters = {};
      return webStreamsAdapters;
    }
    Duplex.fromWeb = function (pair, options) {
      return lazyWebStreams().newStreamDuplexFromReadableWritablePair(pair, options);
    };
    Duplex.toWeb = function (duplex) {
      return lazyWebStreams().newReadableWritablePairFromDuplex(duplex);
    };
    var duplexify;
    Duplex.from = function (body) {
      if (!duplexify) {
        duplexify = require_duplexify();
      }
      return duplexify(body, 'body');
    };
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/transform.js
var require_transform = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/transform.js'(exports2, module2) {
    'use strict';
    var { ObjectSetPrototypeOf, Symbol: Symbol2 } = require_primordials();
    module2.exports = Transform2;
    var { ERR_METHOD_NOT_IMPLEMENTED } = require_errors().codes;
    var Duplex = require_duplex();
    var { getHighWaterMark } = require_state();
    ObjectSetPrototypeOf(Transform2.prototype, Duplex.prototype);
    ObjectSetPrototypeOf(Transform2, Duplex);
    var kCallback = Symbol2('kCallback');
    function Transform2(options) {
      if (!(this instanceof Transform2)) return new Transform2(options);
      const readableHighWaterMark = options ? getHighWaterMark(this, options, 'readableHighWaterMark', true) : null;
      if (readableHighWaterMark === 0) {
        options = {
          ...options,
          highWaterMark: null,
          readableHighWaterMark,
          // TODO (ronag): 0 is not optimal since we have
          // a "bug" where we check needDrain before calling _write and not after.
          // Refs: https://github.com/nodejs/node/pull/32887
          // Refs: https://github.com/nodejs/node/pull/35941
          writableHighWaterMark: options.writableHighWaterMark || 0,
        };
      }
      Duplex.call(this, options);
      this._readableState.sync = false;
      this[kCallback] = null;
      if (options) {
        if (typeof options.transform === 'function') this._transform = options.transform;
        if (typeof options.flush === 'function') this._flush = options.flush;
      }
      this.on('prefinish', prefinish);
    }
    function final(cb) {
      if (typeof this._flush === 'function' && !this.destroyed) {
        this._flush((er, data) => {
          if (er) {
            if (cb) {
              cb(er);
            } else {
              this.destroy(er);
            }
            return;
          }
          if (data != null) {
            this.push(data);
          }
          this.push(null);
          if (cb) {
            cb();
          }
        });
      } else {
        this.push(null);
        if (cb) {
          cb();
        }
      }
    }
    function prefinish() {
      if (this._final !== final) {
        final.call(this);
      }
    }
    Transform2.prototype._final = final;
    Transform2.prototype._transform = function (chunk, encoding, callback) {
      throw new ERR_METHOD_NOT_IMPLEMENTED('_transform()');
    };
    Transform2.prototype._write = function (chunk, encoding, callback) {
      const rState = this._readableState;
      const wState = this._writableState;
      const length = rState.length;
      this._transform(chunk, encoding, (err, val) => {
        if (err) {
          callback(err);
          return;
        }
        if (val != null) {
          this.push(val);
        }
        if (
          wState.ended || // Backwards compat.
          length === rState.length || // Backwards compat.
          rState.length < rState.highWaterMark
        ) {
          callback();
        } else {
          this[kCallback] = callback;
        }
      });
    };
    Transform2.prototype._read = function () {
      if (this[kCallback]) {
        const callback = this[kCallback];
        this[kCallback] = null;
        callback();
      }
    };
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/passthrough.js
var require_passthrough = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/passthrough.js'(exports2, module2) {
    'use strict';
    var { ObjectSetPrototypeOf } = require_primordials();
    module2.exports = PassThrough;
    var Transform2 = require_transform();
    ObjectSetPrototypeOf(PassThrough.prototype, Transform2.prototype);
    ObjectSetPrototypeOf(PassThrough, Transform2);
    function PassThrough(options) {
      if (!(this instanceof PassThrough)) return new PassThrough(options);
      Transform2.call(this, options);
    }
    PassThrough.prototype._transform = function (chunk, encoding, cb) {
      cb(null, chunk);
    };
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/pipeline.js
var require_pipeline = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/pipeline.js'(exports2, module2) {
    var process2 = require_process();
    var { ArrayIsArray, Promise: Promise2, SymbolAsyncIterator } = require_primordials();
    var eos = require_end_of_stream2();
    var { once } = require_util();
    var destroyImpl = require_destroy();
    var Duplex = require_duplex();
    var {
      aggregateTwoErrors,
      codes: {
        ERR_INVALID_ARG_TYPE,
        ERR_INVALID_RETURN_VALUE,
        ERR_MISSING_ARGS,
        ERR_STREAM_DESTROYED,
        ERR_STREAM_PREMATURE_CLOSE,
      },
      AbortError,
    } = require_errors();
    var { validateFunction, validateAbortSignal } = require_validators();
    var {
      isIterable,
      isReadable,
      isReadableNodeStream,
      isNodeStream,
      isTransformStream,
      isWebStream,
      isReadableStream,
      isReadableEnded,
    } = require_utils();
    var AbortController = globalThis.AbortController || require_abort_controller().AbortController;
    var PassThrough;
    var Readable;
    function destroyer(stream, reading, writing) {
      let finished = false;
      stream.on('close', () => {
        finished = true;
      });
      const cleanup = eos(
        stream,
        {
          readable: reading,
          writable: writing,
        },
        (err) => {
          finished = !err;
        }
      );
      return {
        destroy: (err) => {
          if (finished) return;
          finished = true;
          destroyImpl.destroyer(stream, err || new ERR_STREAM_DESTROYED('pipe'));
        },
        cleanup,
      };
    }
    function popCallback(streams) {
      validateFunction(streams[streams.length - 1], 'streams[stream.length - 1]');
      return streams.pop();
    }
    function makeAsyncIterable(val) {
      if (isIterable(val)) {
        return val;
      } else if (isReadableNodeStream(val)) {
        return fromReadable(val);
      }
      throw new ERR_INVALID_ARG_TYPE('val', ['Readable', 'Iterable', 'AsyncIterable'], val);
    }
    async function* fromReadable(val) {
      if (!Readable) {
        Readable = require_readable();
      }
      yield* Readable.prototype[SymbolAsyncIterator].call(val);
    }
    async function pumpToNode(iterable, writable, finish, { end }) {
      let error;
      let onresolve = null;
      const resume = (err) => {
        if (err) {
          error = err;
        }
        if (onresolve) {
          const callback = onresolve;
          onresolve = null;
          callback();
        }
      };
      const wait = () =>
        new Promise2((resolve, reject) => {
          if (error) {
            reject(error);
          } else {
            onresolve = () => {
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            };
          }
        });
      writable.on('drain', resume);
      const cleanup = eos(
        writable,
        {
          readable: false,
        },
        resume
      );
      try {
        if (writable.writableNeedDrain) {
          await wait();
        }
        for await (const chunk of iterable) {
          if (!writable.write(chunk)) {
            await wait();
          }
        }
        if (end) {
          writable.end();
        }
        await wait();
        finish();
      } catch (err) {
        finish(error !== err ? aggregateTwoErrors(error, err) : err);
      } finally {
        cleanup();
        writable.off('drain', resume);
      }
    }
    async function pumpToWeb(readable, writable, finish, { end }) {
      if (isTransformStream(writable)) {
        writable = writable.writable;
      }
      const writer = writable.getWriter();
      try {
        for await (const chunk of readable) {
          await writer.ready;
          writer.write(chunk).catch(() => {});
        }
        await writer.ready;
        if (end) {
          await writer.close();
        }
        finish();
      } catch (err) {
        try {
          await writer.abort(err);
          finish(err);
        } catch (err2) {
          finish(err2);
        }
      }
    }
    function pipeline(...streams) {
      return pipelineImpl(streams, once(popCallback(streams)));
    }
    function pipelineImpl(streams, callback, opts) {
      if (streams.length === 1 && ArrayIsArray(streams[0])) {
        streams = streams[0];
      }
      if (streams.length < 2) {
        throw new ERR_MISSING_ARGS('streams');
      }
      const ac = new AbortController();
      const signal = ac.signal;
      const outerSignal = opts === null || opts === void 0 ? void 0 : opts.signal;
      const lastStreamCleanup = [];
      validateAbortSignal(outerSignal, 'options.signal');
      function abort() {
        finishImpl(new AbortError());
      }
      outerSignal === null || outerSignal === void 0 ? void 0 : outerSignal.addEventListener('abort', abort);
      let error;
      let value;
      const destroys = [];
      let finishCount = 0;
      function finish(err) {
        finishImpl(err, --finishCount === 0);
      }
      function finishImpl(err, final) {
        if (err && (!error || error.code === 'ERR_STREAM_PREMATURE_CLOSE')) {
          error = err;
        }
        if (!error && !final) {
          return;
        }
        while (destroys.length) {
          destroys.shift()(error);
        }
        outerSignal === null || outerSignal === void 0 ? void 0 : outerSignal.removeEventListener('abort', abort);
        ac.abort();
        if (final) {
          if (!error) {
            lastStreamCleanup.forEach((fn) => fn());
          }
          process2.nextTick(callback, error, value);
        }
      }
      let ret;
      for (let i = 0; i < streams.length; i++) {
        const stream = streams[i];
        const reading = i < streams.length - 1;
        const writing = i > 0;
        const end = reading || (opts === null || opts === void 0 ? void 0 : opts.end) !== false;
        const isLastStream = i === streams.length - 1;
        if (isNodeStream(stream)) {
          let onError2 = function (err) {
            if (err && err.name !== 'AbortError' && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
              finish(err);
            }
          };
          var onError = onError2;
          if (end) {
            const { destroy, cleanup } = destroyer(stream, reading, writing);
            destroys.push(destroy);
            if (isReadable(stream) && isLastStream) {
              lastStreamCleanup.push(cleanup);
            }
          }
          stream.on('error', onError2);
          if (isReadable(stream) && isLastStream) {
            lastStreamCleanup.push(() => {
              stream.removeListener('error', onError2);
            });
          }
        }
        if (i === 0) {
          if (typeof stream === 'function') {
            ret = stream({
              signal,
            });
            if (!isIterable(ret)) {
              throw new ERR_INVALID_RETURN_VALUE('Iterable, AsyncIterable or Stream', 'source', ret);
            }
          } else if (isIterable(stream) || isReadableNodeStream(stream) || isTransformStream(stream)) {
            ret = stream;
          } else {
            ret = Duplex.from(stream);
          }
        } else if (typeof stream === 'function') {
          if (isTransformStream(ret)) {
            var _ret;
            ret = makeAsyncIterable((_ret = ret) === null || _ret === void 0 ? void 0 : _ret.readable);
          } else {
            ret = makeAsyncIterable(ret);
          }
          ret = stream(ret, {
            signal,
          });
          if (reading) {
            if (!isIterable(ret, true)) {
              throw new ERR_INVALID_RETURN_VALUE('AsyncIterable', `transform[${i - 1}]`, ret);
            }
          } else {
            var _ret2;
            if (!PassThrough) {
              PassThrough = require_passthrough();
            }
            const pt = new PassThrough({
              objectMode: true,
            });
            const then = (_ret2 = ret) === null || _ret2 === void 0 ? void 0 : _ret2.then;
            if (typeof then === 'function') {
              finishCount++;
              then.call(
                ret,
                (val) => {
                  value = val;
                  if (val != null) {
                    pt.write(val);
                  }
                  if (end) {
                    pt.end();
                  }
                  process2.nextTick(finish);
                },
                (err) => {
                  pt.destroy(err);
                  process2.nextTick(finish, err);
                }
              );
            } else if (isIterable(ret, true)) {
              finishCount++;
              pumpToNode(ret, pt, finish, {
                end,
              });
            } else if (isReadableStream(ret) || isTransformStream(ret)) {
              const toRead = ret.readable || ret;
              finishCount++;
              pumpToNode(toRead, pt, finish, {
                end,
              });
            } else {
              throw new ERR_INVALID_RETURN_VALUE('AsyncIterable or Promise', 'destination', ret);
            }
            ret = pt;
            const { destroy, cleanup } = destroyer(ret, false, true);
            destroys.push(destroy);
            if (isLastStream) {
              lastStreamCleanup.push(cleanup);
            }
          }
        } else if (isNodeStream(stream)) {
          if (isReadableNodeStream(ret)) {
            finishCount += 2;
            const cleanup = pipe(ret, stream, finish, {
              end,
            });
            if (isReadable(stream) && isLastStream) {
              lastStreamCleanup.push(cleanup);
            }
          } else if (isTransformStream(ret) || isReadableStream(ret)) {
            const toRead = ret.readable || ret;
            finishCount++;
            pumpToNode(toRead, stream, finish, {
              end,
            });
          } else if (isIterable(ret)) {
            finishCount++;
            pumpToNode(ret, stream, finish, {
              end,
            });
          } else {
            throw new ERR_INVALID_ARG_TYPE(
              'val',
              ['Readable', 'Iterable', 'AsyncIterable', 'ReadableStream', 'TransformStream'],
              ret
            );
          }
          ret = stream;
        } else if (isWebStream(stream)) {
          if (isReadableNodeStream(ret)) {
            finishCount++;
            pumpToWeb(makeAsyncIterable(ret), stream, finish, {
              end,
            });
          } else if (isReadableStream(ret) || isIterable(ret)) {
            finishCount++;
            pumpToWeb(ret, stream, finish, {
              end,
            });
          } else if (isTransformStream(ret)) {
            finishCount++;
            pumpToWeb(ret.readable, stream, finish, {
              end,
            });
          } else {
            throw new ERR_INVALID_ARG_TYPE(
              'val',
              ['Readable', 'Iterable', 'AsyncIterable', 'ReadableStream', 'TransformStream'],
              ret
            );
          }
          ret = stream;
        } else {
          ret = Duplex.from(stream);
        }
      }
      if (
        (signal !== null && signal !== void 0 && signal.aborted) ||
        (outerSignal !== null && outerSignal !== void 0 && outerSignal.aborted)
      ) {
        process2.nextTick(abort);
      }
      return ret;
    }
    function pipe(src, dst, finish, { end }) {
      let ended = false;
      dst.on('close', () => {
        if (!ended) {
          finish(new ERR_STREAM_PREMATURE_CLOSE());
        }
      });
      src.pipe(dst, {
        end: false,
      });
      if (end) {
        let endFn2 = function () {
          ended = true;
          dst.end();
        };
        var endFn = endFn2;
        if (isReadableEnded(src)) {
          process2.nextTick(endFn2);
        } else {
          src.once('end', endFn2);
        }
      } else {
        finish();
      }
      eos(
        src,
        {
          readable: true,
          writable: false,
        },
        (err) => {
          const rState = src._readableState;
          if (
            err &&
            err.code === 'ERR_STREAM_PREMATURE_CLOSE' &&
            rState &&
            rState.ended &&
            !rState.errored &&
            !rState.errorEmitted
          ) {
            src.once('end', finish).once('error', finish);
          } else {
            finish(err);
          }
        }
      );
      return eos(
        dst,
        {
          readable: false,
          writable: true,
        },
        finish
      );
    }
    module2.exports = {
      pipelineImpl,
      pipeline,
    };
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/compose.js
var require_compose = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/compose.js'(exports2, module2) {
    'use strict';
    var { pipeline } = require_pipeline();
    var Duplex = require_duplex();
    var { destroyer } = require_destroy();
    var { isNodeStream, isReadable, isWritable, isWebStream, isTransformStream, isWritableStream, isReadableStream } =
      require_utils();
    var {
      AbortError,
      codes: { ERR_INVALID_ARG_VALUE, ERR_MISSING_ARGS },
    } = require_errors();
    var eos = require_end_of_stream2();
    module2.exports = function compose(...streams) {
      if (streams.length === 0) {
        throw new ERR_MISSING_ARGS('streams');
      }
      if (streams.length === 1) {
        return Duplex.from(streams[0]);
      }
      const orgStreams = [...streams];
      if (typeof streams[0] === 'function') {
        streams[0] = Duplex.from(streams[0]);
      }
      if (typeof streams[streams.length - 1] === 'function') {
        const idx = streams.length - 1;
        streams[idx] = Duplex.from(streams[idx]);
      }
      for (let n = 0; n < streams.length; ++n) {
        if (!isNodeStream(streams[n]) && !isWebStream(streams[n])) {
          continue;
        }
        if (
          n < streams.length - 1 &&
          !(isReadable(streams[n]) || isReadableStream(streams[n]) || isTransformStream(streams[n]))
        ) {
          throw new ERR_INVALID_ARG_VALUE(`streams[${n}]`, orgStreams[n], 'must be readable');
        }
        if (n > 0 && !(isWritable(streams[n]) || isWritableStream(streams[n]) || isTransformStream(streams[n]))) {
          throw new ERR_INVALID_ARG_VALUE(`streams[${n}]`, orgStreams[n], 'must be writable');
        }
      }
      let ondrain;
      let onfinish;
      let onreadable;
      let onclose;
      let d;
      function onfinished(err) {
        const cb = onclose;
        onclose = null;
        if (cb) {
          cb(err);
        } else if (err) {
          d.destroy(err);
        } else if (!readable && !writable) {
          d.destroy();
        }
      }
      const head = streams[0];
      const tail = pipeline(streams, onfinished);
      const writable = !!(isWritable(head) || isWritableStream(head) || isTransformStream(head));
      const readable = !!(isReadable(tail) || isReadableStream(tail) || isTransformStream(tail));
      d = new Duplex({
        // TODO (ronag): highWaterMark?
        writableObjectMode: !!(head !== null && head !== void 0 && head.writableObjectMode),
        readableObjectMode: !!(tail !== null && tail !== void 0 && tail.writableObjectMode),
        writable,
        readable,
      });
      if (writable) {
        if (isNodeStream(head)) {
          d._write = function (chunk, encoding, callback) {
            if (head.write(chunk, encoding)) {
              callback();
            } else {
              ondrain = callback;
            }
          };
          d._final = function (callback) {
            head.end();
            onfinish = callback;
          };
          head.on('drain', function () {
            if (ondrain) {
              const cb = ondrain;
              ondrain = null;
              cb();
            }
          });
        } else if (isWebStream(head)) {
          const writable2 = isTransformStream(head) ? head.writable : head;
          const writer = writable2.getWriter();
          d._write = async function (chunk, encoding, callback) {
            try {
              await writer.ready;
              writer.write(chunk).catch(() => {});
              callback();
            } catch (err) {
              callback(err);
            }
          };
          d._final = async function (callback) {
            try {
              await writer.ready;
              writer.close().catch(() => {});
              onfinish = callback;
            } catch (err) {
              callback(err);
            }
          };
        }
        const toRead = isTransformStream(tail) ? tail.readable : tail;
        eos(toRead, () => {
          if (onfinish) {
            const cb = onfinish;
            onfinish = null;
            cb();
          }
        });
      }
      if (readable) {
        if (isNodeStream(tail)) {
          tail.on('readable', function () {
            if (onreadable) {
              const cb = onreadable;
              onreadable = null;
              cb();
            }
          });
          tail.on('end', function () {
            d.push(null);
          });
          d._read = function () {
            while (true) {
              const buf = tail.read();
              if (buf === null) {
                onreadable = d._read;
                return;
              }
              if (!d.push(buf)) {
                return;
              }
            }
          };
        } else if (isWebStream(tail)) {
          const readable2 = isTransformStream(tail) ? tail.readable : tail;
          const reader = readable2.getReader();
          d._read = async function () {
            while (true) {
              try {
                const { value, done } = await reader.read();
                if (!d.push(value)) {
                  return;
                }
                if (done) {
                  d.push(null);
                  return;
                }
              } catch {
                return;
              }
            }
          };
        }
      }
      d._destroy = function (err, callback) {
        if (!err && onclose !== null) {
          err = new AbortError();
        }
        onreadable = null;
        ondrain = null;
        onfinish = null;
        if (onclose === null) {
          callback(err);
        } else {
          onclose = callback;
          if (isNodeStream(tail)) {
            destroyer(tail, err);
          }
        }
      };
      return d;
    };
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/operators.js
var require_operators = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/internal/streams/operators.js'(exports2, module2) {
    'use strict';
    var AbortController = globalThis.AbortController || require_abort_controller().AbortController;
    var {
      codes: { ERR_INVALID_ARG_VALUE, ERR_INVALID_ARG_TYPE, ERR_MISSING_ARGS, ERR_OUT_OF_RANGE },
      AbortError,
    } = require_errors();
    var { validateAbortSignal, validateInteger, validateObject } = require_validators();
    var kWeakHandler = require_primordials().Symbol('kWeak');
    var { finished } = require_end_of_stream2();
    var staticCompose = require_compose();
    var { addAbortSignalNoValidate } = require_add_abort_signal();
    var { isWritable, isNodeStream } = require_utils();
    var {
      ArrayPrototypePush,
      MathFloor,
      Number: Number2,
      NumberIsNaN,
      Promise: Promise2,
      PromiseReject,
      PromisePrototypeThen,
      Symbol: Symbol2,
    } = require_primordials();
    var kEmpty = Symbol2('kEmpty');
    var kEof = Symbol2('kEof');
    function compose(stream, options) {
      if (options != null) {
        validateObject(options, 'options');
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, 'options.signal');
      }
      if (isNodeStream(stream) && !isWritable(stream)) {
        throw new ERR_INVALID_ARG_VALUE('stream', stream, 'must be writable');
      }
      const composedStream = staticCompose(this, stream);
      if (options !== null && options !== void 0 && options.signal) {
        addAbortSignalNoValidate(options.signal, composedStream);
      }
      return composedStream;
    }
    function map(fn, options) {
      if (typeof fn !== 'function') {
        throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn);
      }
      if (options != null) {
        validateObject(options, 'options');
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, 'options.signal');
      }
      let concurrency = 1;
      if ((options === null || options === void 0 ? void 0 : options.concurrency) != null) {
        concurrency = MathFloor(options.concurrency);
      }
      validateInteger(concurrency, 'concurrency', 1);
      return async function* map2() {
        var _options$signal, _options$signal2;
        const ac = new AbortController();
        const stream = this;
        const queue = [];
        const signal = ac.signal;
        const signalOpt = {
          signal,
        };
        const abort = () => ac.abort();
        if (
          options !== null &&
          options !== void 0 &&
          (_options$signal = options.signal) !== null &&
          _options$signal !== void 0 &&
          _options$signal.aborted
        ) {
          abort();
        }
        options === null || options === void 0
          ? void 0
          : (_options$signal2 = options.signal) === null || _options$signal2 === void 0
          ? void 0
          : _options$signal2.addEventListener('abort', abort);
        let next;
        let resume;
        let done = false;
        function onDone() {
          done = true;
        }
        async function pump2() {
          try {
            for await (let val of stream) {
              var _val;
              if (done) {
                return;
              }
              if (signal.aborted) {
                throw new AbortError();
              }
              try {
                val = fn(val, signalOpt);
              } catch (err) {
                val = PromiseReject(err);
              }
              if (val === kEmpty) {
                continue;
              }
              if (typeof ((_val = val) === null || _val === void 0 ? void 0 : _val.catch) === 'function') {
                val.catch(onDone);
              }
              queue.push(val);
              if (next) {
                next();
                next = null;
              }
              if (!done && queue.length && queue.length >= concurrency) {
                await new Promise2((resolve) => {
                  resume = resolve;
                });
              }
            }
            queue.push(kEof);
          } catch (err) {
            const val = PromiseReject(err);
            PromisePrototypeThen(val, void 0, onDone);
            queue.push(val);
          } finally {
            var _options$signal3;
            done = true;
            if (next) {
              next();
              next = null;
            }
            options === null || options === void 0
              ? void 0
              : (_options$signal3 = options.signal) === null || _options$signal3 === void 0
              ? void 0
              : _options$signal3.removeEventListener('abort', abort);
          }
        }
        pump2();
        try {
          while (true) {
            while (queue.length > 0) {
              const val = await queue[0];
              if (val === kEof) {
                return;
              }
              if (signal.aborted) {
                throw new AbortError();
              }
              if (val !== kEmpty) {
                yield val;
              }
              queue.shift();
              if (resume) {
                resume();
                resume = null;
              }
            }
            await new Promise2((resolve) => {
              next = resolve;
            });
          }
        } finally {
          ac.abort();
          done = true;
          if (resume) {
            resume();
            resume = null;
          }
        }
      }.call(this);
    }
    function asIndexedPairs(options = void 0) {
      if (options != null) {
        validateObject(options, 'options');
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, 'options.signal');
      }
      return async function* asIndexedPairs2() {
        let index = 0;
        for await (const val of this) {
          var _options$signal4;
          if (
            options !== null &&
            options !== void 0 &&
            (_options$signal4 = options.signal) !== null &&
            _options$signal4 !== void 0 &&
            _options$signal4.aborted
          ) {
            throw new AbortError({
              cause: options.signal.reason,
            });
          }
          yield [index++, val];
        }
      }.call(this);
    }
    async function some(fn, options = void 0) {
      for await (const unused of filter.call(this, fn, options)) {
        return true;
      }
      return false;
    }
    async function every(fn, options = void 0) {
      if (typeof fn !== 'function') {
        throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn);
      }
      return !(await some.call(
        this,
        async (...args) => {
          return !(await fn(...args));
        },
        options
      ));
    }
    async function find(fn, options) {
      for await (const result of filter.call(this, fn, options)) {
        return result;
      }
      return void 0;
    }
    async function forEach(fn, options) {
      if (typeof fn !== 'function') {
        throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn);
      }
      async function forEachFn(value, options2) {
        await fn(value, options2);
        return kEmpty;
      }
      for await (const unused of map.call(this, forEachFn, options));
    }
    function filter(fn, options) {
      if (typeof fn !== 'function') {
        throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn);
      }
      async function filterFn(value, options2) {
        if (await fn(value, options2)) {
          return value;
        }
        return kEmpty;
      }
      return map.call(this, filterFn, options);
    }
    var ReduceAwareErrMissingArgs = class extends ERR_MISSING_ARGS {
      constructor() {
        super('reduce');
        this.message = 'Reduce of an empty stream requires an initial value';
      }
    };
    async function reduce(reducer, initialValue, options) {
      var _options$signal5;
      if (typeof reducer !== 'function') {
        throw new ERR_INVALID_ARG_TYPE('reducer', ['Function', 'AsyncFunction'], reducer);
      }
      if (options != null) {
        validateObject(options, 'options');
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, 'options.signal');
      }
      let hasInitialValue = arguments.length > 1;
      if (
        options !== null &&
        options !== void 0 &&
        (_options$signal5 = options.signal) !== null &&
        _options$signal5 !== void 0 &&
        _options$signal5.aborted
      ) {
        const err = new AbortError(void 0, {
          cause: options.signal.reason,
        });
        this.once('error', () => {});
        await finished(this.destroy(err));
        throw err;
      }
      const ac = new AbortController();
      const signal = ac.signal;
      if (options !== null && options !== void 0 && options.signal) {
        const opts = {
          once: true,
          [kWeakHandler]: this,
        };
        options.signal.addEventListener('abort', () => ac.abort(), opts);
      }
      let gotAnyItemFromStream = false;
      try {
        for await (const value of this) {
          var _options$signal6;
          gotAnyItemFromStream = true;
          if (
            options !== null &&
            options !== void 0 &&
            (_options$signal6 = options.signal) !== null &&
            _options$signal6 !== void 0 &&
            _options$signal6.aborted
          ) {
            throw new AbortError();
          }
          if (!hasInitialValue) {
            initialValue = value;
            hasInitialValue = true;
          } else {
            initialValue = await reducer(initialValue, value, {
              signal,
            });
          }
        }
        if (!gotAnyItemFromStream && !hasInitialValue) {
          throw new ReduceAwareErrMissingArgs();
        }
      } finally {
        ac.abort();
      }
      return initialValue;
    }
    async function toArray(options) {
      if (options != null) {
        validateObject(options, 'options');
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, 'options.signal');
      }
      const result = [];
      for await (const val of this) {
        var _options$signal7;
        if (
          options !== null &&
          options !== void 0 &&
          (_options$signal7 = options.signal) !== null &&
          _options$signal7 !== void 0 &&
          _options$signal7.aborted
        ) {
          throw new AbortError(void 0, {
            cause: options.signal.reason,
          });
        }
        ArrayPrototypePush(result, val);
      }
      return result;
    }
    function flatMap(fn, options) {
      const values = map.call(this, fn, options);
      return async function* flatMap2() {
        for await (const val of values) {
          yield* val;
        }
      }.call(this);
    }
    function toIntegerOrInfinity(number) {
      number = Number2(number);
      if (NumberIsNaN(number)) {
        return 0;
      }
      if (number < 0) {
        throw new ERR_OUT_OF_RANGE('number', '>= 0', number);
      }
      return number;
    }
    function drop(number, options = void 0) {
      if (options != null) {
        validateObject(options, 'options');
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, 'options.signal');
      }
      number = toIntegerOrInfinity(number);
      return async function* drop2() {
        var _options$signal8;
        if (
          options !== null &&
          options !== void 0 &&
          (_options$signal8 = options.signal) !== null &&
          _options$signal8 !== void 0 &&
          _options$signal8.aborted
        ) {
          throw new AbortError();
        }
        for await (const val of this) {
          var _options$signal9;
          if (
            options !== null &&
            options !== void 0 &&
            (_options$signal9 = options.signal) !== null &&
            _options$signal9 !== void 0 &&
            _options$signal9.aborted
          ) {
            throw new AbortError();
          }
          if (number-- <= 0) {
            yield val;
          }
        }
      }.call(this);
    }
    function take(number, options = void 0) {
      if (options != null) {
        validateObject(options, 'options');
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, 'options.signal');
      }
      number = toIntegerOrInfinity(number);
      return async function* take2() {
        var _options$signal10;
        if (
          options !== null &&
          options !== void 0 &&
          (_options$signal10 = options.signal) !== null &&
          _options$signal10 !== void 0 &&
          _options$signal10.aborted
        ) {
          throw new AbortError();
        }
        for await (const val of this) {
          var _options$signal11;
          if (
            options !== null &&
            options !== void 0 &&
            (_options$signal11 = options.signal) !== null &&
            _options$signal11 !== void 0 &&
            _options$signal11.aborted
          ) {
            throw new AbortError();
          }
          if (number-- > 0) {
            yield val;
          } else {
            return;
          }
        }
      }.call(this);
    }
    module2.exports.streamReturningOperators = {
      asIndexedPairs,
      drop,
      filter,
      flatMap,
      map,
      take,
      compose,
    };
    module2.exports.promiseReturningOperators = {
      every,
      forEach,
      reduce,
      toArray,
      some,
      find,
    };
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/stream/promises.js
var require_promises = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/stream/promises.js'(exports2, module2) {
    'use strict';
    var { ArrayPrototypePop, Promise: Promise2 } = require_primordials();
    var { isIterable, isNodeStream, isWebStream } = require_utils();
    var { pipelineImpl: pl } = require_pipeline();
    var { finished } = require_end_of_stream2();
    require('stream');
    function pipeline(...streams) {
      return new Promise2((resolve, reject) => {
        let signal;
        let end;
        const lastArg = streams[streams.length - 1];
        if (
          lastArg &&
          typeof lastArg === 'object' &&
          !isNodeStream(lastArg) &&
          !isIterable(lastArg) &&
          !isWebStream(lastArg)
        ) {
          const options = ArrayPrototypePop(streams);
          signal = options.signal;
          end = options.end;
        }
        pl(
          streams,
          (err, value) => {
            if (err) {
              reject(err);
            } else {
              resolve(value);
            }
          },
          {
            signal,
            end,
          }
        );
      });
    }
    module2.exports = {
      finished,
      pipeline,
    };
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/stream.js
var require_stream = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/stream.js'(exports2, module2) {
    var { Buffer: Buffer2 } = require('buffer');
    var { ObjectDefineProperty, ObjectKeys, ReflectApply } = require_primordials();
    var {
      promisify: { custom: customPromisify },
    } = require_util();
    var { streamReturningOperators, promiseReturningOperators } = require_operators();
    var {
      codes: { ERR_ILLEGAL_CONSTRUCTOR },
    } = require_errors();
    var compose = require_compose();
    var { pipeline } = require_pipeline();
    var { destroyer } = require_destroy();
    var eos = require_end_of_stream2();
    var promises = require_promises();
    var utils = require_utils();
    var Stream = (module2.exports = require_legacy().Stream);
    Stream.isDisturbed = utils.isDisturbed;
    Stream.isErrored = utils.isErrored;
    Stream.isReadable = utils.isReadable;
    Stream.Readable = require_readable();
    for (const key of ObjectKeys(streamReturningOperators)) {
      let fn2 = function (...args) {
        if (new.target) {
          throw ERR_ILLEGAL_CONSTRUCTOR();
        }
        return Stream.Readable.from(ReflectApply(op, this, args));
      };
      fn = fn2;
      const op = streamReturningOperators[key];
      ObjectDefineProperty(fn2, 'name', {
        __proto__: null,
        value: op.name,
      });
      ObjectDefineProperty(fn2, 'length', {
        __proto__: null,
        value: op.length,
      });
      ObjectDefineProperty(Stream.Readable.prototype, key, {
        __proto__: null,
        value: fn2,
        enumerable: false,
        configurable: true,
        writable: true,
      });
    }
    var fn;
    for (const key of ObjectKeys(promiseReturningOperators)) {
      let fn2 = function (...args) {
        if (new.target) {
          throw ERR_ILLEGAL_CONSTRUCTOR();
        }
        return ReflectApply(op, this, args);
      };
      fn = fn2;
      const op = promiseReturningOperators[key];
      ObjectDefineProperty(fn2, 'name', {
        __proto__: null,
        value: op.name,
      });
      ObjectDefineProperty(fn2, 'length', {
        __proto__: null,
        value: op.length,
      });
      ObjectDefineProperty(Stream.Readable.prototype, key, {
        __proto__: null,
        value: fn2,
        enumerable: false,
        configurable: true,
        writable: true,
      });
    }
    var fn;
    Stream.Writable = require_writable();
    Stream.Duplex = require_duplex();
    Stream.Transform = require_transform();
    Stream.PassThrough = require_passthrough();
    Stream.pipeline = pipeline;
    var { addAbortSignal } = require_add_abort_signal();
    Stream.addAbortSignal = addAbortSignal;
    Stream.finished = eos;
    Stream.destroy = destroyer;
    Stream.compose = compose;
    ObjectDefineProperty(Stream, 'promises', {
      __proto__: null,
      configurable: true,
      enumerable: true,
      get() {
        return promises;
      },
    });
    ObjectDefineProperty(pipeline, customPromisify, {
      __proto__: null,
      enumerable: true,
      get() {
        return promises.pipeline;
      },
    });
    ObjectDefineProperty(eos, customPromisify, {
      __proto__: null,
      enumerable: true,
      get() {
        return promises.finished;
      },
    });
    Stream.Stream = Stream;
    Stream._isUint8Array = function isUint8Array(value) {
      return value instanceof Uint8Array;
    };
    Stream._uint8ArrayToBuffer = function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
    };
  },
});

// node_modules/pino-pretty/node_modules/readable-stream/lib/ours/index.js
var require_ours = __commonJS({
  'node_modules/pino-pretty/node_modules/readable-stream/lib/ours/index.js'(exports2, module2) {
    'use strict';
    var Stream = require('stream');
    if (Stream && process.env.READABLE_STREAM === 'disable') {
      const promises = Stream.promises;
      module2.exports._uint8ArrayToBuffer = Stream._uint8ArrayToBuffer;
      module2.exports._isUint8Array = Stream._isUint8Array;
      module2.exports.isDisturbed = Stream.isDisturbed;
      module2.exports.isErrored = Stream.isErrored;
      module2.exports.isReadable = Stream.isReadable;
      module2.exports.Readable = Stream.Readable;
      module2.exports.Writable = Stream.Writable;
      module2.exports.Duplex = Stream.Duplex;
      module2.exports.Transform = Stream.Transform;
      module2.exports.PassThrough = Stream.PassThrough;
      module2.exports.addAbortSignal = Stream.addAbortSignal;
      module2.exports.finished = Stream.finished;
      module2.exports.destroy = Stream.destroy;
      module2.exports.pipeline = Stream.pipeline;
      module2.exports.compose = Stream.compose;
      Object.defineProperty(Stream, 'promises', {
        configurable: true,
        enumerable: true,
        get() {
          return promises;
        },
      });
      module2.exports.Stream = Stream.Stream;
    } else {
      const CustomStream = require_stream();
      const promises = require_promises();
      const originalDestroy = CustomStream.Readable.destroy;
      module2.exports = CustomStream.Readable;
      module2.exports._uint8ArrayToBuffer = CustomStream._uint8ArrayToBuffer;
      module2.exports._isUint8Array = CustomStream._isUint8Array;
      module2.exports.isDisturbed = CustomStream.isDisturbed;
      module2.exports.isErrored = CustomStream.isErrored;
      module2.exports.isReadable = CustomStream.isReadable;
      module2.exports.Readable = CustomStream.Readable;
      module2.exports.Writable = CustomStream.Writable;
      module2.exports.Duplex = CustomStream.Duplex;
      module2.exports.Transform = CustomStream.Transform;
      module2.exports.PassThrough = CustomStream.PassThrough;
      module2.exports.addAbortSignal = CustomStream.addAbortSignal;
      module2.exports.finished = CustomStream.finished;
      module2.exports.destroy = CustomStream.destroy;
      module2.exports.destroy = originalDestroy;
      module2.exports.pipeline = CustomStream.pipeline;
      module2.exports.compose = CustomStream.compose;
      Object.defineProperty(CustomStream, 'promises', {
        configurable: true,
        enumerable: true,
        get() {
          return promises;
        },
      });
      module2.exports.Stream = CustomStream.Stream;
    }
    module2.exports.default = module2.exports;
  },
});

// node_modules/pino-abstract-transport/node_modules/split2/index.js
var require_split2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/split2/index.js'(exports2, module2) {
    'use strict';
    var { Transform: Transform2 } = require('stream');
    var { StringDecoder } = require('string_decoder');
    var kLast = Symbol('last');
    var kDecoder = Symbol('decoder');
    function transform(chunk, enc, cb) {
      let list;
      if (this.overflow) {
        const buf = this[kDecoder].write(chunk);
        list = buf.split(this.matcher);
        if (list.length === 1) return cb();
        list.shift();
        this.overflow = false;
      } else {
        this[kLast] += this[kDecoder].write(chunk);
        list = this[kLast].split(this.matcher);
      }
      this[kLast] = list.pop();
      for (let i = 0; i < list.length; i++) {
        try {
          push(this, this.mapper(list[i]));
        } catch (error) {
          return cb(error);
        }
      }
      this.overflow = this[kLast].length > this.maxLength;
      if (this.overflow && !this.skipOverflow) {
        cb(new Error('maximum buffer reached'));
        return;
      }
      cb();
    }
    function flush(cb) {
      this[kLast] += this[kDecoder].end();
      if (this[kLast]) {
        try {
          push(this, this.mapper(this[kLast]));
        } catch (error) {
          return cb(error);
        }
      }
      cb();
    }
    function push(self, val) {
      if (val !== void 0) {
        self.push(val);
      }
    }
    function noop(incoming) {
      return incoming;
    }
    function split(matcher, mapper, options) {
      matcher = matcher || /\r?\n/;
      mapper = mapper || noop;
      options = options || {};
      switch (arguments.length) {
        case 1:
          if (typeof matcher === 'function') {
            mapper = matcher;
            matcher = /\r?\n/;
          } else if (typeof matcher === 'object' && !(matcher instanceof RegExp) && !matcher[Symbol.split]) {
            options = matcher;
            matcher = /\r?\n/;
          }
          break;
        case 2:
          if (typeof matcher === 'function') {
            options = mapper;
            mapper = matcher;
            matcher = /\r?\n/;
          } else if (typeof mapper === 'object') {
            options = mapper;
            mapper = noop;
          }
      }
      options = Object.assign({}, options);
      options.autoDestroy = true;
      options.transform = transform;
      options.flush = flush;
      options.readableObjectMode = true;
      const stream = new Transform2(options);
      stream[kLast] = '';
      stream[kDecoder] = new StringDecoder('utf8');
      stream.matcher = matcher;
      stream.mapper = mapper;
      stream.maxLength = options.maxLength;
      stream.skipOverflow = options.skipOverflow || false;
      stream.overflow = false;
      stream._destroy = function (err, cb) {
        this._writableState.errorEmitted = false;
        cb(err);
      };
      return stream;
    }
    module2.exports = split;
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/ours/primordials.js
var require_primordials2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/ours/primordials.js'(exports2, module2) {
    'use strict';
    module2.exports = {
      ArrayIsArray(self) {
        return Array.isArray(self);
      },
      ArrayPrototypeIncludes(self, el) {
        return self.includes(el);
      },
      ArrayPrototypeIndexOf(self, el) {
        return self.indexOf(el);
      },
      ArrayPrototypeJoin(self, sep) {
        return self.join(sep);
      },
      ArrayPrototypeMap(self, fn) {
        return self.map(fn);
      },
      ArrayPrototypePop(self, el) {
        return self.pop(el);
      },
      ArrayPrototypePush(self, el) {
        return self.push(el);
      },
      ArrayPrototypeSlice(self, start, end) {
        return self.slice(start, end);
      },
      Error,
      FunctionPrototypeCall(fn, thisArgs, ...args) {
        return fn.call(thisArgs, ...args);
      },
      FunctionPrototypeSymbolHasInstance(self, instance) {
        return Function.prototype[Symbol.hasInstance].call(self, instance);
      },
      MathFloor: Math.floor,
      Number,
      NumberIsInteger: Number.isInteger,
      NumberIsNaN: Number.isNaN,
      NumberMAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
      NumberMIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
      NumberParseInt: Number.parseInt,
      ObjectDefineProperties(self, props) {
        return Object.defineProperties(self, props);
      },
      ObjectDefineProperty(self, name, prop) {
        return Object.defineProperty(self, name, prop);
      },
      ObjectGetOwnPropertyDescriptor(self, name) {
        return Object.getOwnPropertyDescriptor(self, name);
      },
      ObjectKeys(obj) {
        return Object.keys(obj);
      },
      ObjectSetPrototypeOf(target, proto) {
        return Object.setPrototypeOf(target, proto);
      },
      Promise,
      PromisePrototypeCatch(self, fn) {
        return self.catch(fn);
      },
      PromisePrototypeThen(self, thenFn, catchFn) {
        return self.then(thenFn, catchFn);
      },
      PromiseReject(err) {
        return Promise.reject(err);
      },
      ReflectApply: Reflect.apply,
      RegExpPrototypeTest(self, value) {
        return self.test(value);
      },
      SafeSet: Set,
      String,
      StringPrototypeSlice(self, start, end) {
        return self.slice(start, end);
      },
      StringPrototypeToLowerCase(self) {
        return self.toLowerCase();
      },
      StringPrototypeToUpperCase(self) {
        return self.toUpperCase();
      },
      StringPrototypeTrim(self) {
        return self.trim();
      },
      Symbol,
      SymbolFor: Symbol.for,
      SymbolAsyncIterator: Symbol.asyncIterator,
      SymbolHasInstance: Symbol.hasInstance,
      SymbolIterator: Symbol.iterator,
      TypedArrayPrototypeSet(self, buf, len) {
        return self.set(buf, len);
      },
      Uint8Array,
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/ours/util.js
var require_util2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/ours/util.js'(exports2, module2) {
    'use strict';
    var bufferModule = require('buffer');
    var AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    var Blob = globalThis.Blob || bufferModule.Blob;
    var isBlob =
      typeof Blob !== 'undefined'
        ? function isBlob2(b) {
            return b instanceof Blob;
          }
        : function isBlob2(b) {
            return false;
          };
    var AggregateError = class extends Error {
      constructor(errors) {
        if (!Array.isArray(errors)) {
          throw new TypeError(`Expected input to be an Array, got ${typeof errors}`);
        }
        let message = '';
        for (let i = 0; i < errors.length; i++) {
          message += `    ${errors[i].stack}
`;
        }
        super(message);
        this.name = 'AggregateError';
        this.errors = errors;
      }
    };
    module2.exports = {
      AggregateError,
      kEmptyObject: Object.freeze({}),
      once(callback) {
        let called = false;
        return function (...args) {
          if (called) {
            return;
          }
          called = true;
          callback.apply(this, args);
        };
      },
      createDeferredPromise: function () {
        let resolve;
        let reject;
        const promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        return {
          promise,
          resolve,
          reject,
        };
      },
      promisify(fn) {
        return new Promise((resolve, reject) => {
          fn((err, ...args) => {
            if (err) {
              return reject(err);
            }
            return resolve(...args);
          });
        });
      },
      debuglog() {
        return function () {};
      },
      format(format, ...args) {
        return format.replace(/%([sdifj])/g, function (...[_unused, type]) {
          const replacement = args.shift();
          if (type === 'f') {
            return replacement.toFixed(6);
          } else if (type === 'j') {
            return JSON.stringify(replacement);
          } else if (type === 's' && typeof replacement === 'object') {
            const ctor = replacement.constructor !== Object ? replacement.constructor.name : '';
            return `${ctor} {}`.trim();
          } else {
            return replacement.toString();
          }
        });
      },
      inspect(value) {
        switch (typeof value) {
          case 'string':
            if (value.includes("'")) {
              if (!value.includes('"')) {
                return `"${value}"`;
              } else if (!value.includes('`') && !value.includes('${')) {
                return `\`${value}\``;
              }
            }
            return `'${value}'`;
          case 'number':
            if (isNaN(value)) {
              return 'NaN';
            } else if (Object.is(value, -0)) {
              return String(value);
            }
            return value;
          case 'bigint':
            return `${String(value)}n`;
          case 'boolean':
          case 'undefined':
            return String(value);
          case 'object':
            return '{}';
        }
      },
      types: {
        isAsyncFunction(fn) {
          return fn instanceof AsyncFunction;
        },
        isArrayBufferView(arr) {
          return ArrayBuffer.isView(arr);
        },
      },
      isBlob,
    };
    module2.exports.promisify.custom = Symbol.for('nodejs.util.promisify.custom');
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/ours/errors.js
var require_errors2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/ours/errors.js'(exports2, module2) {
    'use strict';
    var { format, inspect, AggregateError: CustomAggregateError } = require_util2();
    var AggregateError = globalThis.AggregateError || CustomAggregateError;
    var kIsNodeError = Symbol('kIsNodeError');
    var kTypes = [
      'string',
      'function',
      'number',
      'object',
      // Accept 'Function' and 'Object' as alternative to the lower cased version.
      'Function',
      'Object',
      'boolean',
      'bigint',
      'symbol',
    ];
    var classRegExp = /^([A-Z][a-z0-9]*)+$/;
    var nodeInternalPrefix = '__node_internal_';
    var codes = {};
    function assert(value, message) {
      if (!value) {
        throw new codes.ERR_INTERNAL_ASSERTION(message);
      }
    }
    function addNumericalSeparator(val) {
      let res = '';
      let i = val.length;
      const start = val[0] === '-' ? 1 : 0;
      for (; i >= start + 4; i -= 3) {
        res = `_${val.slice(i - 3, i)}${res}`;
      }
      return `${val.slice(0, i)}${res}`;
    }
    function getMessage(key, msg, args) {
      if (typeof msg === 'function') {
        assert(
          msg.length <= args.length,
          // Default options do not count.
          `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${msg.length}).`
        );
        return msg(...args);
      }
      const expectedLength = (msg.match(/%[dfijoOs]/g) || []).length;
      assert(
        expectedLength === args.length,
        `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${expectedLength}).`
      );
      if (args.length === 0) {
        return msg;
      }
      return format(msg, ...args);
    }
    function E(code, message, Base) {
      if (!Base) {
        Base = Error;
      }
      class NodeError extends Base {
        constructor(...args) {
          super(getMessage(code, message, args));
        }
        toString() {
          return `${this.name} [${code}]: ${this.message}`;
        }
      }
      Object.defineProperties(NodeError.prototype, {
        name: {
          value: Base.name,
          writable: true,
          enumerable: false,
          configurable: true,
        },
        toString: {
          value() {
            return `${this.name} [${code}]: ${this.message}`;
          },
          writable: true,
          enumerable: false,
          configurable: true,
        },
      });
      NodeError.prototype.code = code;
      NodeError.prototype[kIsNodeError] = true;
      codes[code] = NodeError;
    }
    function hideStackFrames(fn) {
      const hidden = nodeInternalPrefix + fn.name;
      Object.defineProperty(fn, 'name', {
        value: hidden,
      });
      return fn;
    }
    function aggregateTwoErrors(innerError, outerError) {
      if (innerError && outerError && innerError !== outerError) {
        if (Array.isArray(outerError.errors)) {
          outerError.errors.push(innerError);
          return outerError;
        }
        const err = new AggregateError([outerError, innerError], outerError.message);
        err.code = outerError.code;
        return err;
      }
      return innerError || outerError;
    }
    var AbortError = class extends Error {
      constructor(message = 'The operation was aborted', options = void 0) {
        if (options !== void 0 && typeof options !== 'object') {
          throw new codes.ERR_INVALID_ARG_TYPE('options', 'Object', options);
        }
        super(message, options);
        this.code = 'ABORT_ERR';
        this.name = 'AbortError';
      }
    };
    E('ERR_ASSERTION', '%s', Error);
    E(
      'ERR_INVALID_ARG_TYPE',
      (name, expected, actual) => {
        assert(typeof name === 'string', "'name' must be a string");
        if (!Array.isArray(expected)) {
          expected = [expected];
        }
        let msg = 'The ';
        if (name.endsWith(' argument')) {
          msg += `${name} `;
        } else {
          msg += `"${name}" ${name.includes('.') ? 'property' : 'argument'} `;
        }
        msg += 'must be ';
        const types = [];
        const instances = [];
        const other = [];
        for (const value of expected) {
          assert(typeof value === 'string', 'All expected entries have to be of type string');
          if (kTypes.includes(value)) {
            types.push(value.toLowerCase());
          } else if (classRegExp.test(value)) {
            instances.push(value);
          } else {
            assert(value !== 'object', 'The value "object" should be written as "Object"');
            other.push(value);
          }
        }
        if (instances.length > 0) {
          const pos = types.indexOf('object');
          if (pos !== -1) {
            types.splice(types, pos, 1);
            instances.push('Object');
          }
        }
        if (types.length > 0) {
          switch (types.length) {
            case 1:
              msg += `of type ${types[0]}`;
              break;
            case 2:
              msg += `one of type ${types[0]} or ${types[1]}`;
              break;
            default: {
              const last = types.pop();
              msg += `one of type ${types.join(', ')}, or ${last}`;
            }
          }
          if (instances.length > 0 || other.length > 0) {
            msg += ' or ';
          }
        }
        if (instances.length > 0) {
          switch (instances.length) {
            case 1:
              msg += `an instance of ${instances[0]}`;
              break;
            case 2:
              msg += `an instance of ${instances[0]} or ${instances[1]}`;
              break;
            default: {
              const last = instances.pop();
              msg += `an instance of ${instances.join(', ')}, or ${last}`;
            }
          }
          if (other.length > 0) {
            msg += ' or ';
          }
        }
        switch (other.length) {
          case 0:
            break;
          case 1:
            if (other[0].toLowerCase() !== other[0]) {
              msg += 'an ';
            }
            msg += `${other[0]}`;
            break;
          case 2:
            msg += `one of ${other[0]} or ${other[1]}`;
            break;
          default: {
            const last = other.pop();
            msg += `one of ${other.join(', ')}, or ${last}`;
          }
        }
        if (actual == null) {
          msg += `. Received ${actual}`;
        } else if (typeof actual === 'function' && actual.name) {
          msg += `. Received function ${actual.name}`;
        } else if (typeof actual === 'object') {
          var _actual$constructor;
          if (
            (_actual$constructor = actual.constructor) !== null &&
            _actual$constructor !== void 0 &&
            _actual$constructor.name
          ) {
            msg += `. Received an instance of ${actual.constructor.name}`;
          } else {
            const inspected = inspect(actual, {
              depth: -1,
            });
            msg += `. Received ${inspected}`;
          }
        } else {
          let inspected = inspect(actual, {
            colors: false,
          });
          if (inspected.length > 25) {
            inspected = `${inspected.slice(0, 25)}...`;
          }
          msg += `. Received type ${typeof actual} (${inspected})`;
        }
        return msg;
      },
      TypeError
    );
    E(
      'ERR_INVALID_ARG_VALUE',
      (name, value, reason = 'is invalid') => {
        let inspected = inspect(value);
        if (inspected.length > 128) {
          inspected = inspected.slice(0, 128) + '...';
        }
        const type = name.includes('.') ? 'property' : 'argument';
        return `The ${type} '${name}' ${reason}. Received ${inspected}`;
      },
      TypeError
    );
    E(
      'ERR_INVALID_RETURN_VALUE',
      (input, name, value) => {
        var _value$constructor;
        const type =
          value !== null &&
          value !== void 0 &&
          (_value$constructor = value.constructor) !== null &&
          _value$constructor !== void 0 &&
          _value$constructor.name
            ? `instance of ${value.constructor.name}`
            : `type ${typeof value}`;
        return `Expected ${input} to be returned from the "${name}" function but got ${type}.`;
      },
      TypeError
    );
    E(
      'ERR_MISSING_ARGS',
      (...args) => {
        assert(args.length > 0, 'At least one arg needs to be specified');
        let msg;
        const len = args.length;
        args = (Array.isArray(args) ? args : [args]).map((a) => `"${a}"`).join(' or ');
        switch (len) {
          case 1:
            msg += `The ${args[0]} argument`;
            break;
          case 2:
            msg += `The ${args[0]} and ${args[1]} arguments`;
            break;
          default:
            {
              const last = args.pop();
              msg += `The ${args.join(', ')}, and ${last} arguments`;
            }
            break;
        }
        return `${msg} must be specified`;
      },
      TypeError
    );
    E(
      'ERR_OUT_OF_RANGE',
      (str, range, input) => {
        assert(range, 'Missing "range" argument');
        let received;
        if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
          received = addNumericalSeparator(String(input));
        } else if (typeof input === 'bigint') {
          received = String(input);
          if (input > 2n ** 32n || input < -(2n ** 32n)) {
            received = addNumericalSeparator(received);
          }
          received += 'n';
        } else {
          received = inspect(input);
        }
        return `The value of "${str}" is out of range. It must be ${range}. Received ${received}`;
      },
      RangeError
    );
    E('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times', Error);
    E('ERR_METHOD_NOT_IMPLEMENTED', 'The %s method is not implemented', Error);
    E('ERR_STREAM_ALREADY_FINISHED', 'Cannot call %s after a stream was finished', Error);
    E('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable', Error);
    E('ERR_STREAM_DESTROYED', 'Cannot call %s after a stream was destroyed', Error);
    E('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
    E('ERR_STREAM_PREMATURE_CLOSE', 'Premature close', Error);
    E('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF', Error);
    E('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event', Error);
    E('ERR_STREAM_WRITE_AFTER_END', 'write after end', Error);
    E('ERR_UNKNOWN_ENCODING', 'Unknown encoding: %s', TypeError);
    module2.exports = {
      AbortError,
      aggregateTwoErrors: hideStackFrames(aggregateTwoErrors),
      hideStackFrames,
      codes,
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/validators.js
var require_validators2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/validators.js'(exports2, module2) {
    'use strict';
    var {
      ArrayIsArray,
      ArrayPrototypeIncludes,
      ArrayPrototypeJoin,
      ArrayPrototypeMap,
      NumberIsInteger,
      NumberIsNaN,
      NumberMAX_SAFE_INTEGER,
      NumberMIN_SAFE_INTEGER,
      NumberParseInt,
      ObjectPrototypeHasOwnProperty,
      RegExpPrototypeExec,
      String: String2,
      StringPrototypeToUpperCase,
      StringPrototypeTrim,
    } = require_primordials2();
    var {
      hideStackFrames,
      codes: { ERR_SOCKET_BAD_PORT, ERR_INVALID_ARG_TYPE, ERR_INVALID_ARG_VALUE, ERR_OUT_OF_RANGE, ERR_UNKNOWN_SIGNAL },
    } = require_errors2();
    var { normalizeEncoding } = require_util2();
    var { isAsyncFunction, isArrayBufferView } = require_util2().types;
    var signals = {};
    function isInt32(value) {
      return value === (value | 0);
    }
    function isUint32(value) {
      return value === value >>> 0;
    }
    var octalReg = /^[0-7]+$/;
    var modeDesc = 'must be a 32-bit unsigned integer or an octal string';
    function parseFileMode(value, name, def) {
      if (typeof value === 'undefined') {
        value = def;
      }
      if (typeof value === 'string') {
        if (RegExpPrototypeExec(octalReg, value) === null) {
          throw new ERR_INVALID_ARG_VALUE(name, value, modeDesc);
        }
        value = NumberParseInt(value, 8);
      }
      validateUint32(value, name);
      return value;
    }
    var validateInteger = hideStackFrames((value, name, min = NumberMIN_SAFE_INTEGER, max = NumberMAX_SAFE_INTEGER) => {
      if (typeof value !== 'number') throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
      if (!NumberIsInteger(value)) throw new ERR_OUT_OF_RANGE(name, 'an integer', value);
      if (value < min || value > max) throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
    });
    var validateInt32 = hideStackFrames((value, name, min = -2147483648, max = 2147483647) => {
      if (typeof value !== 'number') {
        throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
      }
      if (!NumberIsInteger(value)) {
        throw new ERR_OUT_OF_RANGE(name, 'an integer', value);
      }
      if (value < min || value > max) {
        throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
      }
    });
    var validateUint32 = hideStackFrames((value, name, positive = false) => {
      if (typeof value !== 'number') {
        throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
      }
      if (!NumberIsInteger(value)) {
        throw new ERR_OUT_OF_RANGE(name, 'an integer', value);
      }
      const min = positive ? 1 : 0;
      const max = 4294967295;
      if (value < min || value > max) {
        throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
      }
    });
    function validateString(value, name) {
      if (typeof value !== 'string') throw new ERR_INVALID_ARG_TYPE(name, 'string', value);
    }
    function validateNumber(value, name, min = void 0, max) {
      if (typeof value !== 'number') throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
      if (
        (min != null && value < min) ||
        (max != null && value > max) ||
        ((min != null || max != null) && NumberIsNaN(value))
      ) {
        throw new ERR_OUT_OF_RANGE(
          name,
          `${min != null ? `>= ${min}` : ''}${min != null && max != null ? ' && ' : ''}${
            max != null ? `<= ${max}` : ''
          }`,
          value
        );
      }
    }
    var validateOneOf = hideStackFrames((value, name, oneOf) => {
      if (!ArrayPrototypeIncludes(oneOf, value)) {
        const allowed = ArrayPrototypeJoin(
          ArrayPrototypeMap(oneOf, (v) => (typeof v === 'string' ? `'${v}'` : String2(v))),
          ', '
        );
        const reason = 'must be one of: ' + allowed;
        throw new ERR_INVALID_ARG_VALUE(name, value, reason);
      }
    });
    function validateBoolean(value, name) {
      if (typeof value !== 'boolean') throw new ERR_INVALID_ARG_TYPE(name, 'boolean', value);
    }
    function getOwnPropertyValueOrDefault(options, key, defaultValue) {
      return options == null || !ObjectPrototypeHasOwnProperty(options, key) ? defaultValue : options[key];
    }
    var validateObject = hideStackFrames((value, name, options = null) => {
      const allowArray = getOwnPropertyValueOrDefault(options, 'allowArray', false);
      const allowFunction = getOwnPropertyValueOrDefault(options, 'allowFunction', false);
      const nullable = getOwnPropertyValueOrDefault(options, 'nullable', false);
      if (
        (!nullable && value === null) ||
        (!allowArray && ArrayIsArray(value)) ||
        (typeof value !== 'object' && (!allowFunction || typeof value !== 'function'))
      ) {
        throw new ERR_INVALID_ARG_TYPE(name, 'Object', value);
      }
    });
    var validateDictionary = hideStackFrames((value, name) => {
      if (value != null && typeof value !== 'object' && typeof value !== 'function') {
        throw new ERR_INVALID_ARG_TYPE(name, 'a dictionary', value);
      }
    });
    var validateArray = hideStackFrames((value, name, minLength = 0) => {
      if (!ArrayIsArray(value)) {
        throw new ERR_INVALID_ARG_TYPE(name, 'Array', value);
      }
      if (value.length < minLength) {
        const reason = `must be longer than ${minLength}`;
        throw new ERR_INVALID_ARG_VALUE(name, value, reason);
      }
    });
    function validateStringArray(value, name) {
      validateArray(value, name);
      for (let i = 0; i < value.length; i++) {
        validateString(value[i], `${name}[${i}]`);
      }
    }
    function validateBooleanArray(value, name) {
      validateArray(value, name);
      for (let i = 0; i < value.length; i++) {
        validateBoolean(value[i], `${name}[${i}]`);
      }
    }
    function validateSignalName(signal, name = 'signal') {
      validateString(signal, name);
      if (signals[signal] === void 0) {
        if (signals[StringPrototypeToUpperCase(signal)] !== void 0) {
          throw new ERR_UNKNOWN_SIGNAL(signal + ' (signals must use all capital letters)');
        }
        throw new ERR_UNKNOWN_SIGNAL(signal);
      }
    }
    var validateBuffer = hideStackFrames((buffer, name = 'buffer') => {
      if (!isArrayBufferView(buffer)) {
        throw new ERR_INVALID_ARG_TYPE(name, ['Buffer', 'TypedArray', 'DataView'], buffer);
      }
    });
    function validateEncoding(data, encoding) {
      const normalizedEncoding = normalizeEncoding(encoding);
      const length = data.length;
      if (normalizedEncoding === 'hex' && length % 2 !== 0) {
        throw new ERR_INVALID_ARG_VALUE('encoding', encoding, `is invalid for data of length ${length}`);
      }
    }
    function validatePort(port, name = 'Port', allowZero = true) {
      if (
        (typeof port !== 'number' && typeof port !== 'string') ||
        (typeof port === 'string' && StringPrototypeTrim(port).length === 0) ||
        +port !== +port >>> 0 ||
        port > 65535 ||
        (port === 0 && !allowZero)
      ) {
        throw new ERR_SOCKET_BAD_PORT(name, port, allowZero);
      }
      return port | 0;
    }
    var validateAbortSignal = hideStackFrames((signal, name) => {
      if (signal !== void 0 && (signal === null || typeof signal !== 'object' || !('aborted' in signal))) {
        throw new ERR_INVALID_ARG_TYPE(name, 'AbortSignal', signal);
      }
    });
    var validateFunction = hideStackFrames((value, name) => {
      if (typeof value !== 'function') throw new ERR_INVALID_ARG_TYPE(name, 'Function', value);
    });
    var validatePlainFunction = hideStackFrames((value, name) => {
      if (typeof value !== 'function' || isAsyncFunction(value))
        throw new ERR_INVALID_ARG_TYPE(name, 'Function', value);
    });
    var validateUndefined = hideStackFrames((value, name) => {
      if (value !== void 0) throw new ERR_INVALID_ARG_TYPE(name, 'undefined', value);
    });
    function validateUnion(value, name, union) {
      if (!ArrayPrototypeIncludes(union, value)) {
        throw new ERR_INVALID_ARG_TYPE(name, `('${ArrayPrototypeJoin(union, '|')}')`, value);
      }
    }
    var linkValueRegExp = /^(?:<[^>]*>)(?:\s*;\s*[^;"\s]+(?:=(")?[^;"\s]*\1)?)*$/;
    function validateLinkHeaderFormat(value, name) {
      if (typeof value === 'undefined' || !RegExpPrototypeExec(linkValueRegExp, value)) {
        throw new ERR_INVALID_ARG_VALUE(
          name,
          value,
          'must be an array or string of format "</styles.css>; rel=preload; as=style"'
        );
      }
    }
    function validateLinkHeaderValue(hints) {
      if (typeof hints === 'string') {
        validateLinkHeaderFormat(hints, 'hints');
        return hints;
      } else if (ArrayIsArray(hints)) {
        const hintsLength = hints.length;
        let result = '';
        if (hintsLength === 0) {
          return result;
        }
        for (let i = 0; i < hintsLength; i++) {
          const link = hints[i];
          validateLinkHeaderFormat(link, 'hints');
          result += link;
          if (i !== hintsLength - 1) {
            result += ', ';
          }
        }
        return result;
      }
      throw new ERR_INVALID_ARG_VALUE(
        'hints',
        hints,
        'must be an array or string of format "</styles.css>; rel=preload; as=style"'
      );
    }
    module2.exports = {
      isInt32,
      isUint32,
      parseFileMode,
      validateArray,
      validateStringArray,
      validateBooleanArray,
      validateBoolean,
      validateBuffer,
      validateDictionary,
      validateEncoding,
      validateFunction,
      validateInt32,
      validateInteger,
      validateNumber,
      validateObject,
      validateOneOf,
      validatePlainFunction,
      validatePort,
      validateSignalName,
      validateString,
      validateUint32,
      validateUndefined,
      validateUnion,
      validateAbortSignal,
      validateLinkHeaderValue,
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/utils.js
var require_utils2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/utils.js'(exports2, module2) {
    'use strict';
    var { Symbol: Symbol2, SymbolAsyncIterator, SymbolIterator, SymbolFor } = require_primordials2();
    var kDestroyed = Symbol2('kDestroyed');
    var kIsErrored = Symbol2('kIsErrored');
    var kIsReadable = Symbol2('kIsReadable');
    var kIsDisturbed = Symbol2('kIsDisturbed');
    var kIsClosedPromise = SymbolFor('nodejs.webstream.isClosedPromise');
    var kControllerErrorFunction = SymbolFor('nodejs.webstream.controllerErrorFunction');
    function isReadableNodeStream(obj, strict = false) {
      var _obj$_readableState;
      return !!(
        obj &&
        typeof obj.pipe === 'function' &&
        typeof obj.on === 'function' &&
        (!strict || (typeof obj.pause === 'function' && typeof obj.resume === 'function')) &&
        (!obj._writableState ||
          ((_obj$_readableState = obj._readableState) === null || _obj$_readableState === void 0
            ? void 0
            : _obj$_readableState.readable) !== false) && // Duplex
        (!obj._writableState || obj._readableState)
      );
    }
    function isWritableNodeStream(obj) {
      var _obj$_writableState;
      return !!(
        obj &&
        typeof obj.write === 'function' &&
        typeof obj.on === 'function' &&
        (!obj._readableState ||
          ((_obj$_writableState = obj._writableState) === null || _obj$_writableState === void 0
            ? void 0
            : _obj$_writableState.writable) !== false)
      );
    }
    function isDuplexNodeStream(obj) {
      return !!(
        obj &&
        typeof obj.pipe === 'function' &&
        obj._readableState &&
        typeof obj.on === 'function' &&
        typeof obj.write === 'function'
      );
    }
    function isNodeStream(obj) {
      return (
        obj &&
        (obj._readableState ||
          obj._writableState ||
          (typeof obj.write === 'function' && typeof obj.on === 'function') ||
          (typeof obj.pipe === 'function' && typeof obj.on === 'function'))
      );
    }
    function isReadableStream(obj) {
      return !!(
        obj &&
        !isNodeStream(obj) &&
        typeof obj.pipeThrough === 'function' &&
        typeof obj.getReader === 'function' &&
        typeof obj.cancel === 'function'
      );
    }
    function isWritableStream(obj) {
      return !!(obj && !isNodeStream(obj) && typeof obj.getWriter === 'function' && typeof obj.abort === 'function');
    }
    function isTransformStream(obj) {
      return !!(obj && !isNodeStream(obj) && typeof obj.readable === 'object' && typeof obj.writable === 'object');
    }
    function isWebStream(obj) {
      return isReadableStream(obj) || isWritableStream(obj) || isTransformStream(obj);
    }
    function isIterable(obj, isAsync) {
      if (obj == null) return false;
      if (isAsync === true) return typeof obj[SymbolAsyncIterator] === 'function';
      if (isAsync === false) return typeof obj[SymbolIterator] === 'function';
      return typeof obj[SymbolAsyncIterator] === 'function' || typeof obj[SymbolIterator] === 'function';
    }
    function isDestroyed(stream) {
      if (!isNodeStream(stream)) return null;
      const wState = stream._writableState;
      const rState = stream._readableState;
      const state = wState || rState;
      return !!(stream.destroyed || stream[kDestroyed] || (state !== null && state !== void 0 && state.destroyed));
    }
    function isWritableEnded(stream) {
      if (!isWritableNodeStream(stream)) return null;
      if (stream.writableEnded === true) return true;
      const wState = stream._writableState;
      if (wState !== null && wState !== void 0 && wState.errored) return false;
      if (typeof (wState === null || wState === void 0 ? void 0 : wState.ended) !== 'boolean') return null;
      return wState.ended;
    }
    function isWritableFinished(stream, strict) {
      if (!isWritableNodeStream(stream)) return null;
      if (stream.writableFinished === true) return true;
      const wState = stream._writableState;
      if (wState !== null && wState !== void 0 && wState.errored) return false;
      if (typeof (wState === null || wState === void 0 ? void 0 : wState.finished) !== 'boolean') return null;
      return !!(wState.finished || (strict === false && wState.ended === true && wState.length === 0));
    }
    function isReadableEnded(stream) {
      if (!isReadableNodeStream(stream)) return null;
      if (stream.readableEnded === true) return true;
      const rState = stream._readableState;
      if (!rState || rState.errored) return false;
      if (typeof (rState === null || rState === void 0 ? void 0 : rState.ended) !== 'boolean') return null;
      return rState.ended;
    }
    function isReadableFinished(stream, strict) {
      if (!isReadableNodeStream(stream)) return null;
      const rState = stream._readableState;
      if (rState !== null && rState !== void 0 && rState.errored) return false;
      if (typeof (rState === null || rState === void 0 ? void 0 : rState.endEmitted) !== 'boolean') return null;
      return !!(rState.endEmitted || (strict === false && rState.ended === true && rState.length === 0));
    }
    function isReadable(stream) {
      if (stream && stream[kIsReadable] != null) return stream[kIsReadable];
      if (typeof (stream === null || stream === void 0 ? void 0 : stream.readable) !== 'boolean') return null;
      if (isDestroyed(stream)) return false;
      return isReadableNodeStream(stream) && stream.readable && !isReadableFinished(stream);
    }
    function isWritable(stream) {
      if (typeof (stream === null || stream === void 0 ? void 0 : stream.writable) !== 'boolean') return null;
      if (isDestroyed(stream)) return false;
      return isWritableNodeStream(stream) && stream.writable && !isWritableEnded(stream);
    }
    function isFinished(stream, opts) {
      if (!isNodeStream(stream)) {
        return null;
      }
      if (isDestroyed(stream)) {
        return true;
      }
      if ((opts === null || opts === void 0 ? void 0 : opts.readable) !== false && isReadable(stream)) {
        return false;
      }
      if ((opts === null || opts === void 0 ? void 0 : opts.writable) !== false && isWritable(stream)) {
        return false;
      }
      return true;
    }
    function isWritableErrored(stream) {
      var _stream$_writableStat, _stream$_writableStat2;
      if (!isNodeStream(stream)) {
        return null;
      }
      if (stream.writableErrored) {
        return stream.writableErrored;
      }
      return (_stream$_writableStat =
        (_stream$_writableStat2 = stream._writableState) === null || _stream$_writableStat2 === void 0
          ? void 0
          : _stream$_writableStat2.errored) !== null && _stream$_writableStat !== void 0
        ? _stream$_writableStat
        : null;
    }
    function isReadableErrored(stream) {
      var _stream$_readableStat, _stream$_readableStat2;
      if (!isNodeStream(stream)) {
        return null;
      }
      if (stream.readableErrored) {
        return stream.readableErrored;
      }
      return (_stream$_readableStat =
        (_stream$_readableStat2 = stream._readableState) === null || _stream$_readableStat2 === void 0
          ? void 0
          : _stream$_readableStat2.errored) !== null && _stream$_readableStat !== void 0
        ? _stream$_readableStat
        : null;
    }
    function isClosed(stream) {
      if (!isNodeStream(stream)) {
        return null;
      }
      if (typeof stream.closed === 'boolean') {
        return stream.closed;
      }
      const wState = stream._writableState;
      const rState = stream._readableState;
      if (
        typeof (wState === null || wState === void 0 ? void 0 : wState.closed) === 'boolean' ||
        typeof (rState === null || rState === void 0 ? void 0 : rState.closed) === 'boolean'
      ) {
        return (
          (wState === null || wState === void 0 ? void 0 : wState.closed) ||
          (rState === null || rState === void 0 ? void 0 : rState.closed)
        );
      }
      if (typeof stream._closed === 'boolean' && isOutgoingMessage(stream)) {
        return stream._closed;
      }
      return null;
    }
    function isOutgoingMessage(stream) {
      return (
        typeof stream._closed === 'boolean' &&
        typeof stream._defaultKeepAlive === 'boolean' &&
        typeof stream._removedConnection === 'boolean' &&
        typeof stream._removedContLen === 'boolean'
      );
    }
    function isServerResponse(stream) {
      return typeof stream._sent100 === 'boolean' && isOutgoingMessage(stream);
    }
    function isServerRequest(stream) {
      var _stream$req;
      return (
        typeof stream._consuming === 'boolean' &&
        typeof stream._dumped === 'boolean' &&
        ((_stream$req = stream.req) === null || _stream$req === void 0 ? void 0 : _stream$req.upgradeOrConnect) ===
          void 0
      );
    }
    function willEmitClose(stream) {
      if (!isNodeStream(stream)) return null;
      const wState = stream._writableState;
      const rState = stream._readableState;
      const state = wState || rState;
      return (
        (!state && isServerResponse(stream)) ||
        !!(state && state.autoDestroy && state.emitClose && state.closed === false)
      );
    }
    function isDisturbed(stream) {
      var _stream$kIsDisturbed;
      return !!(
        stream &&
        ((_stream$kIsDisturbed = stream[kIsDisturbed]) !== null && _stream$kIsDisturbed !== void 0
          ? _stream$kIsDisturbed
          : stream.readableDidRead || stream.readableAborted)
      );
    }
    function isErrored(stream) {
      var _ref,
        _ref2,
        _ref3,
        _ref4,
        _ref5,
        _stream$kIsErrored,
        _stream$_readableStat3,
        _stream$_writableStat3,
        _stream$_readableStat4,
        _stream$_writableStat4;
      return !!(
        stream &&
        ((_ref =
          (_ref2 =
            (_ref3 =
              (_ref4 =
                (_ref5 =
                  (_stream$kIsErrored = stream[kIsErrored]) !== null && _stream$kIsErrored !== void 0
                    ? _stream$kIsErrored
                    : stream.readableErrored) !== null && _ref5 !== void 0
                  ? _ref5
                  : stream.writableErrored) !== null && _ref4 !== void 0
                ? _ref4
                : (_stream$_readableStat3 = stream._readableState) === null || _stream$_readableStat3 === void 0
                ? void 0
                : _stream$_readableStat3.errorEmitted) !== null && _ref3 !== void 0
              ? _ref3
              : (_stream$_writableStat3 = stream._writableState) === null || _stream$_writableStat3 === void 0
              ? void 0
              : _stream$_writableStat3.errorEmitted) !== null && _ref2 !== void 0
            ? _ref2
            : (_stream$_readableStat4 = stream._readableState) === null || _stream$_readableStat4 === void 0
            ? void 0
            : _stream$_readableStat4.errored) !== null && _ref !== void 0
          ? _ref
          : (_stream$_writableStat4 = stream._writableState) === null || _stream$_writableStat4 === void 0
          ? void 0
          : _stream$_writableStat4.errored)
      );
    }
    module2.exports = {
      kDestroyed,
      isDisturbed,
      kIsDisturbed,
      isErrored,
      kIsErrored,
      isReadable,
      kIsReadable,
      kIsClosedPromise,
      kControllerErrorFunction,
      isClosed,
      isDestroyed,
      isDuplexNodeStream,
      isFinished,
      isIterable,
      isReadableNodeStream,
      isReadableStream,
      isReadableEnded,
      isReadableFinished,
      isReadableErrored,
      isNodeStream,
      isWebStream,
      isWritable,
      isWritableNodeStream,
      isWritableStream,
      isWritableEnded,
      isWritableFinished,
      isWritableErrored,
      isServerRequest,
      isServerResponse,
      willEmitClose,
      isTransformStream,
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/end-of-stream.js
var require_end_of_stream3 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/end-of-stream.js'(
    exports2,
    module2
  ) {
    var process2 = require_process();
    var { AbortError, codes } = require_errors2();
    var { ERR_INVALID_ARG_TYPE, ERR_STREAM_PREMATURE_CLOSE } = codes;
    var { kEmptyObject, once } = require_util2();
    var { validateAbortSignal, validateFunction, validateObject, validateBoolean } = require_validators2();
    var { Promise: Promise2, PromisePrototypeThen } = require_primordials2();
    var {
      isClosed,
      isReadable,
      isReadableNodeStream,
      isReadableStream,
      isReadableFinished,
      isReadableErrored,
      isWritable,
      isWritableNodeStream,
      isWritableStream,
      isWritableFinished,
      isWritableErrored,
      isNodeStream,
      willEmitClose: _willEmitClose,
      kIsClosedPromise,
    } = require_utils2();
    function isRequest(stream) {
      return stream.setHeader && typeof stream.abort === 'function';
    }
    var nop = () => {};
    function eos(stream, options, callback) {
      var _options$readable, _options$writable;
      if (arguments.length === 2) {
        callback = options;
        options = kEmptyObject;
      } else if (options == null) {
        options = kEmptyObject;
      } else {
        validateObject(options, 'options');
      }
      validateFunction(callback, 'callback');
      validateAbortSignal(options.signal, 'options.signal');
      callback = once(callback);
      if (isReadableStream(stream) || isWritableStream(stream)) {
        return eosWeb(stream, options, callback);
      }
      if (!isNodeStream(stream)) {
        throw new ERR_INVALID_ARG_TYPE('stream', ['ReadableStream', 'WritableStream', 'Stream'], stream);
      }
      const readable =
        (_options$readable = options.readable) !== null && _options$readable !== void 0
          ? _options$readable
          : isReadableNodeStream(stream);
      const writable =
        (_options$writable = options.writable) !== null && _options$writable !== void 0
          ? _options$writable
          : isWritableNodeStream(stream);
      const wState = stream._writableState;
      const rState = stream._readableState;
      const onlegacyfinish = () => {
        if (!stream.writable) {
          onfinish();
        }
      };
      let willEmitClose =
        _willEmitClose(stream) &&
        isReadableNodeStream(stream) === readable &&
        isWritableNodeStream(stream) === writable;
      let writableFinished = isWritableFinished(stream, false);
      const onfinish = () => {
        writableFinished = true;
        if (stream.destroyed) {
          willEmitClose = false;
        }
        if (willEmitClose && (!stream.readable || readable)) {
          return;
        }
        if (!readable || readableFinished) {
          callback.call(stream);
        }
      };
      let readableFinished = isReadableFinished(stream, false);
      const onend = () => {
        readableFinished = true;
        if (stream.destroyed) {
          willEmitClose = false;
        }
        if (willEmitClose && (!stream.writable || writable)) {
          return;
        }
        if (!writable || writableFinished) {
          callback.call(stream);
        }
      };
      const onerror = (err) => {
        callback.call(stream, err);
      };
      let closed = isClosed(stream);
      const onclose = () => {
        closed = true;
        const errored = isWritableErrored(stream) || isReadableErrored(stream);
        if (errored && typeof errored !== 'boolean') {
          return callback.call(stream, errored);
        }
        if (readable && !readableFinished && isReadableNodeStream(stream, true)) {
          if (!isReadableFinished(stream, false)) return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE());
        }
        if (writable && !writableFinished) {
          if (!isWritableFinished(stream, false)) return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE());
        }
        callback.call(stream);
      };
      const onclosed = () => {
        closed = true;
        const errored = isWritableErrored(stream) || isReadableErrored(stream);
        if (errored && typeof errored !== 'boolean') {
          return callback.call(stream, errored);
        }
        callback.call(stream);
      };
      const onrequest = () => {
        stream.req.on('finish', onfinish);
      };
      if (isRequest(stream)) {
        stream.on('complete', onfinish);
        if (!willEmitClose) {
          stream.on('abort', onclose);
        }
        if (stream.req) {
          onrequest();
        } else {
          stream.on('request', onrequest);
        }
      } else if (writable && !wState) {
        stream.on('end', onlegacyfinish);
        stream.on('close', onlegacyfinish);
      }
      if (!willEmitClose && typeof stream.aborted === 'boolean') {
        stream.on('aborted', onclose);
      }
      stream.on('end', onend);
      stream.on('finish', onfinish);
      if (options.error !== false) {
        stream.on('error', onerror);
      }
      stream.on('close', onclose);
      if (closed) {
        process2.nextTick(onclose);
      } else if (
        (wState !== null && wState !== void 0 && wState.errorEmitted) ||
        (rState !== null && rState !== void 0 && rState.errorEmitted)
      ) {
        if (!willEmitClose) {
          process2.nextTick(onclosed);
        }
      } else if (
        !readable &&
        (!willEmitClose || isReadable(stream)) &&
        (writableFinished || isWritable(stream) === false)
      ) {
        process2.nextTick(onclosed);
      } else if (
        !writable &&
        (!willEmitClose || isWritable(stream)) &&
        (readableFinished || isReadable(stream) === false)
      ) {
        process2.nextTick(onclosed);
      } else if (rState && stream.req && stream.aborted) {
        process2.nextTick(onclosed);
      }
      const cleanup = () => {
        callback = nop;
        stream.removeListener('aborted', onclose);
        stream.removeListener('complete', onfinish);
        stream.removeListener('abort', onclose);
        stream.removeListener('request', onrequest);
        if (stream.req) stream.req.removeListener('finish', onfinish);
        stream.removeListener('end', onlegacyfinish);
        stream.removeListener('close', onlegacyfinish);
        stream.removeListener('finish', onfinish);
        stream.removeListener('end', onend);
        stream.removeListener('error', onerror);
        stream.removeListener('close', onclose);
      };
      if (options.signal && !closed) {
        const abort = () => {
          const endCallback = callback;
          cleanup();
          endCallback.call(
            stream,
            new AbortError(void 0, {
              cause: options.signal.reason,
            })
          );
        };
        if (options.signal.aborted) {
          process2.nextTick(abort);
        } else {
          const originalCallback = callback;
          callback = once((...args) => {
            options.signal.removeEventListener('abort', abort);
            originalCallback.apply(stream, args);
          });
          options.signal.addEventListener('abort', abort);
        }
      }
      return cleanup;
    }
    function eosWeb(stream, options, callback) {
      let isAborted = false;
      let abort = nop;
      if (options.signal) {
        abort = () => {
          isAborted = true;
          callback.call(
            stream,
            new AbortError(void 0, {
              cause: options.signal.reason,
            })
          );
        };
        if (options.signal.aborted) {
          process2.nextTick(abort);
        } else {
          const originalCallback = callback;
          callback = once((...args) => {
            options.signal.removeEventListener('abort', abort);
            originalCallback.apply(stream, args);
          });
          options.signal.addEventListener('abort', abort);
        }
      }
      const resolverFn = (...args) => {
        if (!isAborted) {
          process2.nextTick(() => callback.apply(stream, args));
        }
      };
      PromisePrototypeThen(stream[kIsClosedPromise].promise, resolverFn, resolverFn);
      return nop;
    }
    function finished(stream, opts) {
      var _opts;
      let autoCleanup = false;
      if (opts === null) {
        opts = kEmptyObject;
      }
      if ((_opts = opts) !== null && _opts !== void 0 && _opts.cleanup) {
        validateBoolean(opts.cleanup, 'cleanup');
        autoCleanup = opts.cleanup;
      }
      return new Promise2((resolve, reject) => {
        const cleanup = eos(stream, opts, (err) => {
          if (autoCleanup) {
            cleanup();
          }
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    module2.exports = eos;
    module2.exports.finished = finished;
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/destroy.js
var require_destroy2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/destroy.js'(
    exports2,
    module2
  ) {
    'use strict';
    var process2 = require_process();
    var {
      aggregateTwoErrors,
      codes: { ERR_MULTIPLE_CALLBACK },
      AbortError,
    } = require_errors2();
    var { Symbol: Symbol2 } = require_primordials2();
    var { kDestroyed, isDestroyed, isFinished, isServerRequest } = require_utils2();
    var kDestroy = Symbol2('kDestroy');
    var kConstruct = Symbol2('kConstruct');
    function checkError(err, w, r) {
      if (err) {
        err.stack;
        if (w && !w.errored) {
          w.errored = err;
        }
        if (r && !r.errored) {
          r.errored = err;
        }
      }
    }
    function destroy(err, cb) {
      const r = this._readableState;
      const w = this._writableState;
      const s = w || r;
      if ((w !== null && w !== void 0 && w.destroyed) || (r !== null && r !== void 0 && r.destroyed)) {
        if (typeof cb === 'function') {
          cb();
        }
        return this;
      }
      checkError(err, w, r);
      if (w) {
        w.destroyed = true;
      }
      if (r) {
        r.destroyed = true;
      }
      if (!s.constructed) {
        this.once(kDestroy, function (er) {
          _destroy(this, aggregateTwoErrors(er, err), cb);
        });
      } else {
        _destroy(this, err, cb);
      }
      return this;
    }
    function _destroy(self, err, cb) {
      let called = false;
      function onDestroy(err2) {
        if (called) {
          return;
        }
        called = true;
        const r = self._readableState;
        const w = self._writableState;
        checkError(err2, w, r);
        if (w) {
          w.closed = true;
        }
        if (r) {
          r.closed = true;
        }
        if (typeof cb === 'function') {
          cb(err2);
        }
        if (err2) {
          process2.nextTick(emitErrorCloseNT, self, err2);
        } else {
          process2.nextTick(emitCloseNT, self);
        }
      }
      try {
        self._destroy(err || null, onDestroy);
      } catch (err2) {
        onDestroy(err2);
      }
    }
    function emitErrorCloseNT(self, err) {
      emitErrorNT(self, err);
      emitCloseNT(self);
    }
    function emitCloseNT(self) {
      const r = self._readableState;
      const w = self._writableState;
      if (w) {
        w.closeEmitted = true;
      }
      if (r) {
        r.closeEmitted = true;
      }
      if ((w !== null && w !== void 0 && w.emitClose) || (r !== null && r !== void 0 && r.emitClose)) {
        self.emit('close');
      }
    }
    function emitErrorNT(self, err) {
      const r = self._readableState;
      const w = self._writableState;
      if ((w !== null && w !== void 0 && w.errorEmitted) || (r !== null && r !== void 0 && r.errorEmitted)) {
        return;
      }
      if (w) {
        w.errorEmitted = true;
      }
      if (r) {
        r.errorEmitted = true;
      }
      self.emit('error', err);
    }
    function undestroy() {
      const r = this._readableState;
      const w = this._writableState;
      if (r) {
        r.constructed = true;
        r.closed = false;
        r.closeEmitted = false;
        r.destroyed = false;
        r.errored = null;
        r.errorEmitted = false;
        r.reading = false;
        r.ended = r.readable === false;
        r.endEmitted = r.readable === false;
      }
      if (w) {
        w.constructed = true;
        w.destroyed = false;
        w.closed = false;
        w.closeEmitted = false;
        w.errored = null;
        w.errorEmitted = false;
        w.finalCalled = false;
        w.prefinished = false;
        w.ended = w.writable === false;
        w.ending = w.writable === false;
        w.finished = w.writable === false;
      }
    }
    function errorOrDestroy(stream, err, sync) {
      const r = stream._readableState;
      const w = stream._writableState;
      if ((w !== null && w !== void 0 && w.destroyed) || (r !== null && r !== void 0 && r.destroyed)) {
        return this;
      }
      if ((r !== null && r !== void 0 && r.autoDestroy) || (w !== null && w !== void 0 && w.autoDestroy))
        stream.destroy(err);
      else if (err) {
        err.stack;
        if (w && !w.errored) {
          w.errored = err;
        }
        if (r && !r.errored) {
          r.errored = err;
        }
        if (sync) {
          process2.nextTick(emitErrorNT, stream, err);
        } else {
          emitErrorNT(stream, err);
        }
      }
    }
    function construct(stream, cb) {
      if (typeof stream._construct !== 'function') {
        return;
      }
      const r = stream._readableState;
      const w = stream._writableState;
      if (r) {
        r.constructed = false;
      }
      if (w) {
        w.constructed = false;
      }
      stream.once(kConstruct, cb);
      if (stream.listenerCount(kConstruct) > 1) {
        return;
      }
      process2.nextTick(constructNT, stream);
    }
    function constructNT(stream) {
      let called = false;
      function onConstruct(err) {
        if (called) {
          errorOrDestroy(stream, err !== null && err !== void 0 ? err : new ERR_MULTIPLE_CALLBACK());
          return;
        }
        called = true;
        const r = stream._readableState;
        const w = stream._writableState;
        const s = w || r;
        if (r) {
          r.constructed = true;
        }
        if (w) {
          w.constructed = true;
        }
        if (s.destroyed) {
          stream.emit(kDestroy, err);
        } else if (err) {
          errorOrDestroy(stream, err, true);
        } else {
          process2.nextTick(emitConstructNT, stream);
        }
      }
      try {
        stream._construct((err) => {
          process2.nextTick(onConstruct, err);
        });
      } catch (err) {
        process2.nextTick(onConstruct, err);
      }
    }
    function emitConstructNT(stream) {
      stream.emit(kConstruct);
    }
    function isRequest(stream) {
      return (stream === null || stream === void 0 ? void 0 : stream.setHeader) && typeof stream.abort === 'function';
    }
    function emitCloseLegacy(stream) {
      stream.emit('close');
    }
    function emitErrorCloseLegacy(stream, err) {
      stream.emit('error', err);
      process2.nextTick(emitCloseLegacy, stream);
    }
    function destroyer(stream, err) {
      if (!stream || isDestroyed(stream)) {
        return;
      }
      if (!err && !isFinished(stream)) {
        err = new AbortError();
      }
      if (isServerRequest(stream)) {
        stream.socket = null;
        stream.destroy(err);
      } else if (isRequest(stream)) {
        stream.abort();
      } else if (isRequest(stream.req)) {
        stream.req.abort();
      } else if (typeof stream.destroy === 'function') {
        stream.destroy(err);
      } else if (typeof stream.close === 'function') {
        stream.close();
      } else if (err) {
        process2.nextTick(emitErrorCloseLegacy, stream, err);
      } else {
        process2.nextTick(emitCloseLegacy, stream);
      }
      if (!stream.destroyed) {
        stream[kDestroyed] = true;
      }
    }
    module2.exports = {
      construct,
      destroyer,
      destroy,
      undestroy,
      errorOrDestroy,
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/legacy.js
var require_legacy2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/legacy.js'(
    exports2,
    module2
  ) {
    'use strict';
    var { ArrayIsArray, ObjectSetPrototypeOf } = require_primordials2();
    var { EventEmitter: EE } = require('events');
    function Stream(opts) {
      EE.call(this, opts);
    }
    ObjectSetPrototypeOf(Stream.prototype, EE.prototype);
    ObjectSetPrototypeOf(Stream, EE);
    Stream.prototype.pipe = function (dest, options) {
      const source = this;
      function ondata(chunk) {
        if (dest.writable && dest.write(chunk) === false && source.pause) {
          source.pause();
        }
      }
      source.on('data', ondata);
      function ondrain() {
        if (source.readable && source.resume) {
          source.resume();
        }
      }
      dest.on('drain', ondrain);
      if (!dest._isStdio && (!options || options.end !== false)) {
        source.on('end', onend);
        source.on('close', onclose);
      }
      let didOnEnd = false;
      function onend() {
        if (didOnEnd) return;
        didOnEnd = true;
        dest.end();
      }
      function onclose() {
        if (didOnEnd) return;
        didOnEnd = true;
        if (typeof dest.destroy === 'function') dest.destroy();
      }
      function onerror(er) {
        cleanup();
        if (EE.listenerCount(this, 'error') === 0) {
          this.emit('error', er);
        }
      }
      prependListener(source, 'error', onerror);
      prependListener(dest, 'error', onerror);
      function cleanup() {
        source.removeListener('data', ondata);
        dest.removeListener('drain', ondrain);
        source.removeListener('end', onend);
        source.removeListener('close', onclose);
        source.removeListener('error', onerror);
        dest.removeListener('error', onerror);
        source.removeListener('end', cleanup);
        source.removeListener('close', cleanup);
        dest.removeListener('close', cleanup);
      }
      source.on('end', cleanup);
      source.on('close', cleanup);
      dest.on('close', cleanup);
      dest.emit('pipe', source);
      return dest;
    };
    function prependListener(emitter, event, fn) {
      if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);
      if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);
      else if (ArrayIsArray(emitter._events[event])) emitter._events[event].unshift(fn);
      else emitter._events[event] = [fn, emitter._events[event]];
    }
    module2.exports = {
      Stream,
      prependListener,
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/add-abort-signal.js
var require_add_abort_signal2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/add-abort-signal.js'(
    exports2,
    module2
  ) {
    'use strict';
    var { AbortError, codes } = require_errors2();
    var { isNodeStream, isWebStream, kControllerErrorFunction } = require_utils2();
    var eos = require_end_of_stream3();
    var { ERR_INVALID_ARG_TYPE } = codes;
    var validateAbortSignal = (signal, name) => {
      if (typeof signal !== 'object' || !('aborted' in signal)) {
        throw new ERR_INVALID_ARG_TYPE(name, 'AbortSignal', signal);
      }
    };
    module2.exports.addAbortSignal = function addAbortSignal(signal, stream) {
      validateAbortSignal(signal, 'signal');
      if (!isNodeStream(stream) && !isWebStream(stream)) {
        throw new ERR_INVALID_ARG_TYPE('stream', ['ReadableStream', 'WritableStream', 'Stream'], stream);
      }
      return module2.exports.addAbortSignalNoValidate(signal, stream);
    };
    module2.exports.addAbortSignalNoValidate = function (signal, stream) {
      if (typeof signal !== 'object' || !('aborted' in signal)) {
        return stream;
      }
      const onAbort = isNodeStream(stream)
        ? () => {
            stream.destroy(
              new AbortError(void 0, {
                cause: signal.reason,
              })
            );
          }
        : () => {
            stream[kControllerErrorFunction](
              new AbortError(void 0, {
                cause: signal.reason,
              })
            );
          };
      if (signal.aborted) {
        onAbort();
      } else {
        signal.addEventListener('abort', onAbort);
        eos(stream, () => signal.removeEventListener('abort', onAbort));
      }
      return stream;
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/buffer_list.js
var require_buffer_list2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/buffer_list.js'(
    exports2,
    module2
  ) {
    'use strict';
    var {
      StringPrototypeSlice,
      SymbolIterator,
      TypedArrayPrototypeSet,
      Uint8Array: Uint8Array2,
    } = require_primordials2();
    var { Buffer: Buffer2 } = require('buffer');
    var { inspect } = require_util2();
    module2.exports = class BufferList {
      constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
      }
      push(v) {
        const entry = {
          data: v,
          next: null,
        };
        if (this.length > 0) this.tail.next = entry;
        else this.head = entry;
        this.tail = entry;
        ++this.length;
      }
      unshift(v) {
        const entry = {
          data: v,
          next: this.head,
        };
        if (this.length === 0) this.tail = entry;
        this.head = entry;
        ++this.length;
      }
      shift() {
        if (this.length === 0) return;
        const ret = this.head.data;
        if (this.length === 1) this.head = this.tail = null;
        else this.head = this.head.next;
        --this.length;
        return ret;
      }
      clear() {
        this.head = this.tail = null;
        this.length = 0;
      }
      join(s) {
        if (this.length === 0) return '';
        let p = this.head;
        let ret = '' + p.data;
        while ((p = p.next) !== null) ret += s + p.data;
        return ret;
      }
      concat(n) {
        if (this.length === 0) return Buffer2.alloc(0);
        const ret = Buffer2.allocUnsafe(n >>> 0);
        let p = this.head;
        let i = 0;
        while (p) {
          TypedArrayPrototypeSet(ret, p.data, i);
          i += p.data.length;
          p = p.next;
        }
        return ret;
      }
      // Consumes a specified amount of bytes or characters from the buffered data.
      consume(n, hasStrings) {
        const data = this.head.data;
        if (n < data.length) {
          const slice = data.slice(0, n);
          this.head.data = data.slice(n);
          return slice;
        }
        if (n === data.length) {
          return this.shift();
        }
        return hasStrings ? this._getString(n) : this._getBuffer(n);
      }
      first() {
        return this.head.data;
      }
      *[SymbolIterator]() {
        for (let p = this.head; p; p = p.next) {
          yield p.data;
        }
      }
      // Consumes a specified amount of characters from the buffered data.
      _getString(n) {
        let ret = '';
        let p = this.head;
        let c = 0;
        do {
          const str = p.data;
          if (n > str.length) {
            ret += str;
            n -= str.length;
          } else {
            if (n === str.length) {
              ret += str;
              ++c;
              if (p.next) this.head = p.next;
              else this.head = this.tail = null;
            } else {
              ret += StringPrototypeSlice(str, 0, n);
              this.head = p;
              p.data = StringPrototypeSlice(str, n);
            }
            break;
          }
          ++c;
        } while ((p = p.next) !== null);
        this.length -= c;
        return ret;
      }
      // Consumes a specified amount of bytes from the buffered data.
      _getBuffer(n) {
        const ret = Buffer2.allocUnsafe(n);
        const retLen = n;
        let p = this.head;
        let c = 0;
        do {
          const buf = p.data;
          if (n > buf.length) {
            TypedArrayPrototypeSet(ret, buf, retLen - n);
            n -= buf.length;
          } else {
            if (n === buf.length) {
              TypedArrayPrototypeSet(ret, buf, retLen - n);
              ++c;
              if (p.next) this.head = p.next;
              else this.head = this.tail = null;
            } else {
              TypedArrayPrototypeSet(ret, new Uint8Array2(buf.buffer, buf.byteOffset, n), retLen - n);
              this.head = p;
              p.data = buf.slice(n);
            }
            break;
          }
          ++c;
        } while ((p = p.next) !== null);
        this.length -= c;
        return ret;
      }
      // Make sure the linked list only shows the minimal necessary information.
      [Symbol.for('nodejs.util.inspect.custom')](_, options) {
        return inspect(this, {
          ...options,
          // Only inspect one level.
          depth: 0,
          // It should not recurse.
          customInspect: false,
        });
      }
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/state.js
var require_state2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/state.js'(exports2, module2) {
    'use strict';
    var { MathFloor, NumberIsInteger } = require_primordials2();
    var { ERR_INVALID_ARG_VALUE } = require_errors2().codes;
    function highWaterMarkFrom(options, isDuplex, duplexKey) {
      return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
    }
    function getDefaultHighWaterMark(objectMode) {
      return objectMode ? 16 : 16 * 1024;
    }
    function getHighWaterMark(state, options, duplexKey, isDuplex) {
      const hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
      if (hwm != null) {
        if (!NumberIsInteger(hwm) || hwm < 0) {
          const name = isDuplex ? `options.${duplexKey}` : 'options.highWaterMark';
          throw new ERR_INVALID_ARG_VALUE(name, hwm);
        }
        return MathFloor(hwm);
      }
      return getDefaultHighWaterMark(state.objectMode);
    }
    module2.exports = {
      getHighWaterMark,
      getDefaultHighWaterMark,
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/from.js
var require_from2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/from.js'(exports2, module2) {
    'use strict';
    var process2 = require_process();
    var { PromisePrototypeThen, SymbolAsyncIterator, SymbolIterator } = require_primordials2();
    var { Buffer: Buffer2 } = require('buffer');
    var { ERR_INVALID_ARG_TYPE, ERR_STREAM_NULL_VALUES } = require_errors2().codes;
    function from(Readable, iterable, opts) {
      let iterator;
      if (typeof iterable === 'string' || iterable instanceof Buffer2) {
        return new Readable({
          objectMode: true,
          ...opts,
          read() {
            this.push(iterable);
            this.push(null);
          },
        });
      }
      let isAsync;
      if (iterable && iterable[SymbolAsyncIterator]) {
        isAsync = true;
        iterator = iterable[SymbolAsyncIterator]();
      } else if (iterable && iterable[SymbolIterator]) {
        isAsync = false;
        iterator = iterable[SymbolIterator]();
      } else {
        throw new ERR_INVALID_ARG_TYPE('iterable', ['Iterable'], iterable);
      }
      const readable = new Readable({
        objectMode: true,
        highWaterMark: 1,
        // TODO(ronag): What options should be allowed?
        ...opts,
      });
      let reading = false;
      readable._read = function () {
        if (!reading) {
          reading = true;
          next();
        }
      };
      readable._destroy = function (error, cb) {
        PromisePrototypeThen(
          close(error),
          () => process2.nextTick(cb, error),
          // nextTick is here in case cb throws
          (e) => process2.nextTick(cb, e || error)
        );
      };
      async function close(error) {
        const hadError = error !== void 0 && error !== null;
        const hasThrow = typeof iterator.throw === 'function';
        if (hadError && hasThrow) {
          const { value, done } = await iterator.throw(error);
          await value;
          if (done) {
            return;
          }
        }
        if (typeof iterator.return === 'function') {
          const { value } = await iterator.return();
          await value;
        }
      }
      async function next() {
        for (;;) {
          try {
            const { value, done } = isAsync ? await iterator.next() : iterator.next();
            if (done) {
              readable.push(null);
            } else {
              const res = value && typeof value.then === 'function' ? await value : value;
              if (res === null) {
                reading = false;
                throw new ERR_STREAM_NULL_VALUES();
              } else if (readable.push(res)) {
                continue;
              } else {
                reading = false;
              }
            }
          } catch (err) {
            readable.destroy(err);
          }
          break;
        }
      }
      return readable;
    }
    module2.exports = from;
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/readable.js
var require_readable2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/readable.js'(
    exports2,
    module2
  ) {
    var process2 = require_process();
    var {
      ArrayPrototypeIndexOf,
      NumberIsInteger,
      NumberIsNaN,
      NumberParseInt,
      ObjectDefineProperties,
      ObjectKeys,
      ObjectSetPrototypeOf,
      Promise: Promise2,
      SafeSet,
      SymbolAsyncIterator,
      Symbol: Symbol2,
    } = require_primordials2();
    module2.exports = Readable;
    Readable.ReadableState = ReadableState;
    var { EventEmitter: EE } = require('events');
    var { Stream, prependListener } = require_legacy2();
    var { Buffer: Buffer2 } = require('buffer');
    var { addAbortSignal } = require_add_abort_signal2();
    var eos = require_end_of_stream3();
    var debug = require_util2().debuglog('stream', (fn) => {
      debug = fn;
    });
    var BufferList = require_buffer_list2();
    var destroyImpl = require_destroy2();
    var { getHighWaterMark, getDefaultHighWaterMark } = require_state2();
    var {
      aggregateTwoErrors,
      codes: {
        ERR_INVALID_ARG_TYPE,
        ERR_METHOD_NOT_IMPLEMENTED,
        ERR_OUT_OF_RANGE,
        ERR_STREAM_PUSH_AFTER_EOF,
        ERR_STREAM_UNSHIFT_AFTER_END_EVENT,
      },
    } = require_errors2();
    var { validateObject } = require_validators2();
    var kPaused = Symbol2('kPaused');
    var { StringDecoder } = require('string_decoder');
    var from = require_from2();
    ObjectSetPrototypeOf(Readable.prototype, Stream.prototype);
    ObjectSetPrototypeOf(Readable, Stream);
    var nop = () => {};
    var { errorOrDestroy } = destroyImpl;
    function ReadableState(options, stream, isDuplex) {
      if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof require_duplex2();
      this.objectMode = !!(options && options.objectMode);
      if (isDuplex) this.objectMode = this.objectMode || !!(options && options.readableObjectMode);
      this.highWaterMark = options
        ? getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex)
        : getDefaultHighWaterMark(false);
      this.buffer = new BufferList();
      this.length = 0;
      this.pipes = [];
      this.flowing = null;
      this.ended = false;
      this.endEmitted = false;
      this.reading = false;
      this.constructed = true;
      this.sync = true;
      this.needReadable = false;
      this.emittedReadable = false;
      this.readableListening = false;
      this.resumeScheduled = false;
      this[kPaused] = null;
      this.errorEmitted = false;
      this.emitClose = !options || options.emitClose !== false;
      this.autoDestroy = !options || options.autoDestroy !== false;
      this.destroyed = false;
      this.errored = null;
      this.closed = false;
      this.closeEmitted = false;
      this.defaultEncoding = (options && options.defaultEncoding) || 'utf8';
      this.awaitDrainWriters = null;
      this.multiAwaitDrain = false;
      this.readingMore = false;
      this.dataEmitted = false;
      this.decoder = null;
      this.encoding = null;
      if (options && options.encoding) {
        this.decoder = new StringDecoder(options.encoding);
        this.encoding = options.encoding;
      }
    }
    function Readable(options) {
      if (!(this instanceof Readable)) return new Readable(options);
      const isDuplex = this instanceof require_duplex2();
      this._readableState = new ReadableState(options, this, isDuplex);
      if (options) {
        if (typeof options.read === 'function') this._read = options.read;
        if (typeof options.destroy === 'function') this._destroy = options.destroy;
        if (typeof options.construct === 'function') this._construct = options.construct;
        if (options.signal && !isDuplex) addAbortSignal(options.signal, this);
      }
      Stream.call(this, options);
      destroyImpl.construct(this, () => {
        if (this._readableState.needReadable) {
          maybeReadMore(this, this._readableState);
        }
      });
    }
    Readable.prototype.destroy = destroyImpl.destroy;
    Readable.prototype._undestroy = destroyImpl.undestroy;
    Readable.prototype._destroy = function (err, cb) {
      cb(err);
    };
    Readable.prototype[EE.captureRejectionSymbol] = function (err) {
      this.destroy(err);
    };
    Readable.prototype.push = function (chunk, encoding) {
      return readableAddChunk(this, chunk, encoding, false);
    };
    Readable.prototype.unshift = function (chunk, encoding) {
      return readableAddChunk(this, chunk, encoding, true);
    };
    function readableAddChunk(stream, chunk, encoding, addToFront) {
      debug('readableAddChunk', chunk);
      const state = stream._readableState;
      let err;
      if (!state.objectMode) {
        if (typeof chunk === 'string') {
          encoding = encoding || state.defaultEncoding;
          if (state.encoding !== encoding) {
            if (addToFront && state.encoding) {
              chunk = Buffer2.from(chunk, encoding).toString(state.encoding);
            } else {
              chunk = Buffer2.from(chunk, encoding);
              encoding = '';
            }
          }
        } else if (chunk instanceof Buffer2) {
          encoding = '';
        } else if (Stream._isUint8Array(chunk)) {
          chunk = Stream._uint8ArrayToBuffer(chunk);
          encoding = '';
        } else if (chunk != null) {
          err = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
        }
      }
      if (err) {
        errorOrDestroy(stream, err);
      } else if (chunk === null) {
        state.reading = false;
        onEofChunk(stream, state);
      } else if (state.objectMode || (chunk && chunk.length > 0)) {
        if (addToFront) {
          if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());
          else if (state.destroyed || state.errored) return false;
          else addChunk(stream, state, chunk, true);
        } else if (state.ended) {
          errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
        } else if (state.destroyed || state.errored) {
          return false;
        } else {
          state.reading = false;
          if (state.decoder && !encoding) {
            chunk = state.decoder.write(chunk);
            if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);
            else maybeReadMore(stream, state);
          } else {
            addChunk(stream, state, chunk, false);
          }
        }
      } else if (!addToFront) {
        state.reading = false;
        maybeReadMore(stream, state);
      }
      return !state.ended && (state.length < state.highWaterMark || state.length === 0);
    }
    function addChunk(stream, state, chunk, addToFront) {
      if (state.flowing && state.length === 0 && !state.sync && stream.listenerCount('data') > 0) {
        if (state.multiAwaitDrain) {
          state.awaitDrainWriters.clear();
        } else {
          state.awaitDrainWriters = null;
        }
        state.dataEmitted = true;
        stream.emit('data', chunk);
      } else {
        state.length += state.objectMode ? 1 : chunk.length;
        if (addToFront) state.buffer.unshift(chunk);
        else state.buffer.push(chunk);
        if (state.needReadable) emitReadable(stream);
      }
      maybeReadMore(stream, state);
    }
    Readable.prototype.isPaused = function () {
      const state = this._readableState;
      return state[kPaused] === true || state.flowing === false;
    };
    Readable.prototype.setEncoding = function (enc) {
      const decoder = new StringDecoder(enc);
      this._readableState.decoder = decoder;
      this._readableState.encoding = this._readableState.decoder.encoding;
      const buffer = this._readableState.buffer;
      let content = '';
      for (const data of buffer) {
        content += decoder.write(data);
      }
      buffer.clear();
      if (content !== '') buffer.push(content);
      this._readableState.length = content.length;
      return this;
    };
    var MAX_HWM = 1073741824;
    function computeNewHighWaterMark(n) {
      if (n > MAX_HWM) {
        throw new ERR_OUT_OF_RANGE('size', '<= 1GiB', n);
      } else {
        n--;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        n++;
      }
      return n;
    }
    function howMuchToRead(n, state) {
      if (n <= 0 || (state.length === 0 && state.ended)) return 0;
      if (state.objectMode) return 1;
      if (NumberIsNaN(n)) {
        if (state.flowing && state.length) return state.buffer.first().length;
        return state.length;
      }
      if (n <= state.length) return n;
      return state.ended ? state.length : 0;
    }
    Readable.prototype.read = function (n) {
      debug('read', n);
      if (n === void 0) {
        n = NaN;
      } else if (!NumberIsInteger(n)) {
        n = NumberParseInt(n, 10);
      }
      const state = this._readableState;
      const nOrig = n;
      if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
      if (n !== 0) state.emittedReadable = false;
      if (
        n === 0 &&
        state.needReadable &&
        ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)
      ) {
        debug('read: emitReadable', state.length, state.ended);
        if (state.length === 0 && state.ended) endReadable(this);
        else emitReadable(this);
        return null;
      }
      n = howMuchToRead(n, state);
      if (n === 0 && state.ended) {
        if (state.length === 0) endReadable(this);
        return null;
      }
      let doRead = state.needReadable;
      debug('need readable', doRead);
      if (state.length === 0 || state.length - n < state.highWaterMark) {
        doRead = true;
        debug('length less than watermark', doRead);
      }
      if (state.ended || state.reading || state.destroyed || state.errored || !state.constructed) {
        doRead = false;
        debug('reading, ended or constructing', doRead);
      } else if (doRead) {
        debug('do read');
        state.reading = true;
        state.sync = true;
        if (state.length === 0) state.needReadable = true;
        try {
          this._read(state.highWaterMark);
        } catch (err) {
          errorOrDestroy(this, err);
        }
        state.sync = false;
        if (!state.reading) n = howMuchToRead(nOrig, state);
      }
      let ret;
      if (n > 0) ret = fromList(n, state);
      else ret = null;
      if (ret === null) {
        state.needReadable = state.length <= state.highWaterMark;
        n = 0;
      } else {
        state.length -= n;
        if (state.multiAwaitDrain) {
          state.awaitDrainWriters.clear();
        } else {
          state.awaitDrainWriters = null;
        }
      }
      if (state.length === 0) {
        if (!state.ended) state.needReadable = true;
        if (nOrig !== n && state.ended) endReadable(this);
      }
      if (ret !== null && !state.errorEmitted && !state.closeEmitted) {
        state.dataEmitted = true;
        this.emit('data', ret);
      }
      return ret;
    };
    function onEofChunk(stream, state) {
      debug('onEofChunk');
      if (state.ended) return;
      if (state.decoder) {
        const chunk = state.decoder.end();
        if (chunk && chunk.length) {
          state.buffer.push(chunk);
          state.length += state.objectMode ? 1 : chunk.length;
        }
      }
      state.ended = true;
      if (state.sync) {
        emitReadable(stream);
      } else {
        state.needReadable = false;
        state.emittedReadable = true;
        emitReadable_(stream);
      }
    }
    function emitReadable(stream) {
      const state = stream._readableState;
      debug('emitReadable', state.needReadable, state.emittedReadable);
      state.needReadable = false;
      if (!state.emittedReadable) {
        debug('emitReadable', state.flowing);
        state.emittedReadable = true;
        process2.nextTick(emitReadable_, stream);
      }
    }
    function emitReadable_(stream) {
      const state = stream._readableState;
      debug('emitReadable_', state.destroyed, state.length, state.ended);
      if (!state.destroyed && !state.errored && (state.length || state.ended)) {
        stream.emit('readable');
        state.emittedReadable = false;
      }
      state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
      flow(stream);
    }
    function maybeReadMore(stream, state) {
      if (!state.readingMore && state.constructed) {
        state.readingMore = true;
        process2.nextTick(maybeReadMore_, stream, state);
      }
    }
    function maybeReadMore_(stream, state) {
      while (
        !state.reading &&
        !state.ended &&
        (state.length < state.highWaterMark || (state.flowing && state.length === 0))
      ) {
        const len = state.length;
        debug('maybeReadMore read 0');
        stream.read(0);
        if (len === state.length) break;
      }
      state.readingMore = false;
    }
    Readable.prototype._read = function (n) {
      throw new ERR_METHOD_NOT_IMPLEMENTED('_read()');
    };
    Readable.prototype.pipe = function (dest, pipeOpts) {
      const src = this;
      const state = this._readableState;
      if (state.pipes.length === 1) {
        if (!state.multiAwaitDrain) {
          state.multiAwaitDrain = true;
          state.awaitDrainWriters = new SafeSet(state.awaitDrainWriters ? [state.awaitDrainWriters] : []);
        }
      }
      state.pipes.push(dest);
      debug('pipe count=%d opts=%j', state.pipes.length, pipeOpts);
      const doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process2.stdout && dest !== process2.stderr;
      const endFn = doEnd ? onend : unpipe;
      if (state.endEmitted) process2.nextTick(endFn);
      else src.once('end', endFn);
      dest.on('unpipe', onunpipe);
      function onunpipe(readable, unpipeInfo) {
        debug('onunpipe');
        if (readable === src) {
          if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
            unpipeInfo.hasUnpiped = true;
            cleanup();
          }
        }
      }
      function onend() {
        debug('onend');
        dest.end();
      }
      let ondrain;
      let cleanedUp = false;
      function cleanup() {
        debug('cleanup');
        dest.removeListener('close', onclose);
        dest.removeListener('finish', onfinish);
        if (ondrain) {
          dest.removeListener('drain', ondrain);
        }
        dest.removeListener('error', onerror);
        dest.removeListener('unpipe', onunpipe);
        src.removeListener('end', onend);
        src.removeListener('end', unpipe);
        src.removeListener('data', ondata);
        cleanedUp = true;
        if (ondrain && state.awaitDrainWriters && (!dest._writableState || dest._writableState.needDrain)) ondrain();
      }
      function pause() {
        if (!cleanedUp) {
          if (state.pipes.length === 1 && state.pipes[0] === dest) {
            debug('false write response, pause', 0);
            state.awaitDrainWriters = dest;
            state.multiAwaitDrain = false;
          } else if (state.pipes.length > 1 && state.pipes.includes(dest)) {
            debug('false write response, pause', state.awaitDrainWriters.size);
            state.awaitDrainWriters.add(dest);
          }
          src.pause();
        }
        if (!ondrain) {
          ondrain = pipeOnDrain(src, dest);
          dest.on('drain', ondrain);
        }
      }
      src.on('data', ondata);
      function ondata(chunk) {
        debug('ondata');
        const ret = dest.write(chunk);
        debug('dest.write', ret);
        if (ret === false) {
          pause();
        }
      }
      function onerror(er) {
        debug('onerror', er);
        unpipe();
        dest.removeListener('error', onerror);
        if (dest.listenerCount('error') === 0) {
          const s = dest._writableState || dest._readableState;
          if (s && !s.errorEmitted) {
            errorOrDestroy(dest, er);
          } else {
            dest.emit('error', er);
          }
        }
      }
      prependListener(dest, 'error', onerror);
      function onclose() {
        dest.removeListener('finish', onfinish);
        unpipe();
      }
      dest.once('close', onclose);
      function onfinish() {
        debug('onfinish');
        dest.removeListener('close', onclose);
        unpipe();
      }
      dest.once('finish', onfinish);
      function unpipe() {
        debug('unpipe');
        src.unpipe(dest);
      }
      dest.emit('pipe', src);
      if (dest.writableNeedDrain === true) {
        if (state.flowing) {
          pause();
        }
      } else if (!state.flowing) {
        debug('pipe resume');
        src.resume();
      }
      return dest;
    };
    function pipeOnDrain(src, dest) {
      return function pipeOnDrainFunctionResult() {
        const state = src._readableState;
        if (state.awaitDrainWriters === dest) {
          debug('pipeOnDrain', 1);
          state.awaitDrainWriters = null;
        } else if (state.multiAwaitDrain) {
          debug('pipeOnDrain', state.awaitDrainWriters.size);
          state.awaitDrainWriters.delete(dest);
        }
        if ((!state.awaitDrainWriters || state.awaitDrainWriters.size === 0) && src.listenerCount('data')) {
          src.resume();
        }
      };
    }
    Readable.prototype.unpipe = function (dest) {
      const state = this._readableState;
      const unpipeInfo = {
        hasUnpiped: false,
      };
      if (state.pipes.length === 0) return this;
      if (!dest) {
        const dests = state.pipes;
        state.pipes = [];
        this.pause();
        for (let i = 0; i < dests.length; i++)
          dests[i].emit('unpipe', this, {
            hasUnpiped: false,
          });
        return this;
      }
      const index = ArrayPrototypeIndexOf(state.pipes, dest);
      if (index === -1) return this;
      state.pipes.splice(index, 1);
      if (state.pipes.length === 0) this.pause();
      dest.emit('unpipe', this, unpipeInfo);
      return this;
    };
    Readable.prototype.on = function (ev, fn) {
      const res = Stream.prototype.on.call(this, ev, fn);
      const state = this._readableState;
      if (ev === 'data') {
        state.readableListening = this.listenerCount('readable') > 0;
        if (state.flowing !== false) this.resume();
      } else if (ev === 'readable') {
        if (!state.endEmitted && !state.readableListening) {
          state.readableListening = state.needReadable = true;
          state.flowing = false;
          state.emittedReadable = false;
          debug('on readable', state.length, state.reading);
          if (state.length) {
            emitReadable(this);
          } else if (!state.reading) {
            process2.nextTick(nReadingNextTick, this);
          }
        }
      }
      return res;
    };
    Readable.prototype.addListener = Readable.prototype.on;
    Readable.prototype.removeListener = function (ev, fn) {
      const res = Stream.prototype.removeListener.call(this, ev, fn);
      if (ev === 'readable') {
        process2.nextTick(updateReadableListening, this);
      }
      return res;
    };
    Readable.prototype.off = Readable.prototype.removeListener;
    Readable.prototype.removeAllListeners = function (ev) {
      const res = Stream.prototype.removeAllListeners.apply(this, arguments);
      if (ev === 'readable' || ev === void 0) {
        process2.nextTick(updateReadableListening, this);
      }
      return res;
    };
    function updateReadableListening(self) {
      const state = self._readableState;
      state.readableListening = self.listenerCount('readable') > 0;
      if (state.resumeScheduled && state[kPaused] === false) {
        state.flowing = true;
      } else if (self.listenerCount('data') > 0) {
        self.resume();
      } else if (!state.readableListening) {
        state.flowing = null;
      }
    }
    function nReadingNextTick(self) {
      debug('readable nexttick read 0');
      self.read(0);
    }
    Readable.prototype.resume = function () {
      const state = this._readableState;
      if (!state.flowing) {
        debug('resume');
        state.flowing = !state.readableListening;
        resume(this, state);
      }
      state[kPaused] = false;
      return this;
    };
    function resume(stream, state) {
      if (!state.resumeScheduled) {
        state.resumeScheduled = true;
        process2.nextTick(resume_, stream, state);
      }
    }
    function resume_(stream, state) {
      debug('resume', state.reading);
      if (!state.reading) {
        stream.read(0);
      }
      state.resumeScheduled = false;
      stream.emit('resume');
      flow(stream);
      if (state.flowing && !state.reading) stream.read(0);
    }
    Readable.prototype.pause = function () {
      debug('call pause flowing=%j', this._readableState.flowing);
      if (this._readableState.flowing !== false) {
        debug('pause');
        this._readableState.flowing = false;
        this.emit('pause');
      }
      this._readableState[kPaused] = true;
      return this;
    };
    function flow(stream) {
      const state = stream._readableState;
      debug('flow', state.flowing);
      while (state.flowing && stream.read() !== null);
    }
    Readable.prototype.wrap = function (stream) {
      let paused = false;
      stream.on('data', (chunk) => {
        if (!this.push(chunk) && stream.pause) {
          paused = true;
          stream.pause();
        }
      });
      stream.on('end', () => {
        this.push(null);
      });
      stream.on('error', (err) => {
        errorOrDestroy(this, err);
      });
      stream.on('close', () => {
        this.destroy();
      });
      stream.on('destroy', () => {
        this.destroy();
      });
      this._read = () => {
        if (paused && stream.resume) {
          paused = false;
          stream.resume();
        }
      };
      const streamKeys = ObjectKeys(stream);
      for (let j = 1; j < streamKeys.length; j++) {
        const i = streamKeys[j];
        if (this[i] === void 0 && typeof stream[i] === 'function') {
          this[i] = stream[i].bind(stream);
        }
      }
      return this;
    };
    Readable.prototype[SymbolAsyncIterator] = function () {
      return streamToAsyncIterator(this);
    };
    Readable.prototype.iterator = function (options) {
      if (options !== void 0) {
        validateObject(options, 'options');
      }
      return streamToAsyncIterator(this, options);
    };
    function streamToAsyncIterator(stream, options) {
      if (typeof stream.read !== 'function') {
        stream = Readable.wrap(stream, {
          objectMode: true,
        });
      }
      const iter = createAsyncIterator(stream, options);
      iter.stream = stream;
      return iter;
    }
    async function* createAsyncIterator(stream, options) {
      let callback = nop;
      function next(resolve) {
        if (this === stream) {
          callback();
          callback = nop;
        } else {
          callback = resolve;
        }
      }
      stream.on('readable', next);
      let error;
      const cleanup = eos(
        stream,
        {
          writable: false,
        },
        (err) => {
          error = err ? aggregateTwoErrors(error, err) : null;
          callback();
          callback = nop;
        }
      );
      try {
        while (true) {
          const chunk = stream.destroyed ? null : stream.read();
          if (chunk !== null) {
            yield chunk;
          } else if (error) {
            throw error;
          } else if (error === null) {
            return;
          } else {
            await new Promise2(next);
          }
        }
      } catch (err) {
        error = aggregateTwoErrors(error, err);
        throw error;
      } finally {
        if (
          (error || (options === null || options === void 0 ? void 0 : options.destroyOnReturn) !== false) &&
          (error === void 0 || stream._readableState.autoDestroy)
        ) {
          destroyImpl.destroyer(stream, null);
        } else {
          stream.off('readable', next);
          cleanup();
        }
      }
    }
    ObjectDefineProperties(Readable.prototype, {
      readable: {
        __proto__: null,
        get() {
          const r = this._readableState;
          return !!r && r.readable !== false && !r.destroyed && !r.errorEmitted && !r.endEmitted;
        },
        set(val) {
          if (this._readableState) {
            this._readableState.readable = !!val;
          }
        },
      },
      readableDidRead: {
        __proto__: null,
        enumerable: false,
        get: function () {
          return this._readableState.dataEmitted;
        },
      },
      readableAborted: {
        __proto__: null,
        enumerable: false,
        get: function () {
          return !!(
            this._readableState.readable !== false &&
            (this._readableState.destroyed || this._readableState.errored) &&
            !this._readableState.endEmitted
          );
        },
      },
      readableHighWaterMark: {
        __proto__: null,
        enumerable: false,
        get: function () {
          return this._readableState.highWaterMark;
        },
      },
      readableBuffer: {
        __proto__: null,
        enumerable: false,
        get: function () {
          return this._readableState && this._readableState.buffer;
        },
      },
      readableFlowing: {
        __proto__: null,
        enumerable: false,
        get: function () {
          return this._readableState.flowing;
        },
        set: function (state) {
          if (this._readableState) {
            this._readableState.flowing = state;
          }
        },
      },
      readableLength: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState.length;
        },
      },
      readableObjectMode: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.objectMode : false;
        },
      },
      readableEncoding: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.encoding : null;
        },
      },
      errored: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.errored : null;
        },
      },
      closed: {
        __proto__: null,
        get() {
          return this._readableState ? this._readableState.closed : false;
        },
      },
      destroyed: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.destroyed : false;
        },
        set(value) {
          if (!this._readableState) {
            return;
          }
          this._readableState.destroyed = value;
        },
      },
      readableEnded: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.endEmitted : false;
        },
      },
    });
    ObjectDefineProperties(ReadableState.prototype, {
      // Legacy getter for `pipesCount`.
      pipesCount: {
        __proto__: null,
        get() {
          return this.pipes.length;
        },
      },
      // Legacy property for `paused`.
      paused: {
        __proto__: null,
        get() {
          return this[kPaused] !== false;
        },
        set(value) {
          this[kPaused] = !!value;
        },
      },
    });
    Readable._fromList = fromList;
    function fromList(n, state) {
      if (state.length === 0) return null;
      let ret;
      if (state.objectMode) ret = state.buffer.shift();
      else if (!n || n >= state.length) {
        if (state.decoder) ret = state.buffer.join('');
        else if (state.buffer.length === 1) ret = state.buffer.first();
        else ret = state.buffer.concat(state.length);
        state.buffer.clear();
      } else {
        ret = state.buffer.consume(n, state.decoder);
      }
      return ret;
    }
    function endReadable(stream) {
      const state = stream._readableState;
      debug('endReadable', state.endEmitted);
      if (!state.endEmitted) {
        state.ended = true;
        process2.nextTick(endReadableNT, state, stream);
      }
    }
    function endReadableNT(state, stream) {
      debug('endReadableNT', state.endEmitted, state.length);
      if (!state.errored && !state.closeEmitted && !state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.emit('end');
        if (stream.writable && stream.allowHalfOpen === false) {
          process2.nextTick(endWritableNT, stream);
        } else if (state.autoDestroy) {
          const wState = stream._writableState;
          const autoDestroy =
            !wState ||
            (wState.autoDestroy && // We don't expect the writable to ever 'finish'
              // if writable is explicitly set to false.
              (wState.finished || wState.writable === false));
          if (autoDestroy) {
            stream.destroy();
          }
        }
      }
    }
    function endWritableNT(stream) {
      const writable = stream.writable && !stream.writableEnded && !stream.destroyed;
      if (writable) {
        stream.end();
      }
    }
    Readable.from = function (iterable, opts) {
      return from(Readable, iterable, opts);
    };
    var webStreamsAdapters;
    function lazyWebStreams() {
      if (webStreamsAdapters === void 0) webStreamsAdapters = {};
      return webStreamsAdapters;
    }
    Readable.fromWeb = function (readableStream, options) {
      return lazyWebStreams().newStreamReadableFromReadableStream(readableStream, options);
    };
    Readable.toWeb = function (streamReadable, options) {
      return lazyWebStreams().newReadableStreamFromStreamReadable(streamReadable, options);
    };
    Readable.wrap = function (src, options) {
      var _ref, _src$readableObjectMo;
      return new Readable({
        objectMode:
          (_ref =
            (_src$readableObjectMo = src.readableObjectMode) !== null && _src$readableObjectMo !== void 0
              ? _src$readableObjectMo
              : src.objectMode) !== null && _ref !== void 0
            ? _ref
            : true,
        ...options,
        destroy(err, callback) {
          destroyImpl.destroyer(src, err);
          callback(err);
        },
      }).wrap(src);
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/writable.js
var require_writable2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/writable.js'(
    exports2,
    module2
  ) {
    var process2 = require_process();
    var {
      ArrayPrototypeSlice,
      Error: Error2,
      FunctionPrototypeSymbolHasInstance,
      ObjectDefineProperty,
      ObjectDefineProperties,
      ObjectSetPrototypeOf,
      StringPrototypeToLowerCase,
      Symbol: Symbol2,
      SymbolHasInstance,
    } = require_primordials2();
    module2.exports = Writable;
    Writable.WritableState = WritableState;
    var { EventEmitter: EE } = require('events');
    var Stream = require_legacy2().Stream;
    var { Buffer: Buffer2 } = require('buffer');
    var destroyImpl = require_destroy2();
    var { addAbortSignal } = require_add_abort_signal2();
    var { getHighWaterMark, getDefaultHighWaterMark } = require_state2();
    var {
      ERR_INVALID_ARG_TYPE,
      ERR_METHOD_NOT_IMPLEMENTED,
      ERR_MULTIPLE_CALLBACK,
      ERR_STREAM_CANNOT_PIPE,
      ERR_STREAM_DESTROYED,
      ERR_STREAM_ALREADY_FINISHED,
      ERR_STREAM_NULL_VALUES,
      ERR_STREAM_WRITE_AFTER_END,
      ERR_UNKNOWN_ENCODING,
    } = require_errors2().codes;
    var { errorOrDestroy } = destroyImpl;
    ObjectSetPrototypeOf(Writable.prototype, Stream.prototype);
    ObjectSetPrototypeOf(Writable, Stream);
    function nop() {}
    var kOnFinished = Symbol2('kOnFinished');
    function WritableState(options, stream, isDuplex) {
      if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof require_duplex2();
      this.objectMode = !!(options && options.objectMode);
      if (isDuplex) this.objectMode = this.objectMode || !!(options && options.writableObjectMode);
      this.highWaterMark = options
        ? getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex)
        : getDefaultHighWaterMark(false);
      this.finalCalled = false;
      this.needDrain = false;
      this.ending = false;
      this.ended = false;
      this.finished = false;
      this.destroyed = false;
      const noDecode = !!(options && options.decodeStrings === false);
      this.decodeStrings = !noDecode;
      this.defaultEncoding = (options && options.defaultEncoding) || 'utf8';
      this.length = 0;
      this.writing = false;
      this.corked = 0;
      this.sync = true;
      this.bufferProcessing = false;
      this.onwrite = onwrite.bind(void 0, stream);
      this.writecb = null;
      this.writelen = 0;
      this.afterWriteTickInfo = null;
      resetBuffer(this);
      this.pendingcb = 0;
      this.constructed = true;
      this.prefinished = false;
      this.errorEmitted = false;
      this.emitClose = !options || options.emitClose !== false;
      this.autoDestroy = !options || options.autoDestroy !== false;
      this.errored = null;
      this.closed = false;
      this.closeEmitted = false;
      this[kOnFinished] = [];
    }
    function resetBuffer(state) {
      state.buffered = [];
      state.bufferedIndex = 0;
      state.allBuffers = true;
      state.allNoop = true;
    }
    WritableState.prototype.getBuffer = function getBuffer() {
      return ArrayPrototypeSlice(this.buffered, this.bufferedIndex);
    };
    ObjectDefineProperty(WritableState.prototype, 'bufferedRequestCount', {
      __proto__: null,
      get() {
        return this.buffered.length - this.bufferedIndex;
      },
    });
    function Writable(options) {
      const isDuplex = this instanceof require_duplex2();
      if (!isDuplex && !FunctionPrototypeSymbolHasInstance(Writable, this)) return new Writable(options);
      this._writableState = new WritableState(options, this, isDuplex);
      if (options) {
        if (typeof options.write === 'function') this._write = options.write;
        if (typeof options.writev === 'function') this._writev = options.writev;
        if (typeof options.destroy === 'function') this._destroy = options.destroy;
        if (typeof options.final === 'function') this._final = options.final;
        if (typeof options.construct === 'function') this._construct = options.construct;
        if (options.signal) addAbortSignal(options.signal, this);
      }
      Stream.call(this, options);
      destroyImpl.construct(this, () => {
        const state = this._writableState;
        if (!state.writing) {
          clearBuffer(this, state);
        }
        finishMaybe(this, state);
      });
    }
    ObjectDefineProperty(Writable, SymbolHasInstance, {
      __proto__: null,
      value: function (object) {
        if (FunctionPrototypeSymbolHasInstance(this, object)) return true;
        if (this !== Writable) return false;
        return object && object._writableState instanceof WritableState;
      },
    });
    Writable.prototype.pipe = function () {
      errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
    };
    function _write(stream, chunk, encoding, cb) {
      const state = stream._writableState;
      if (typeof encoding === 'function') {
        cb = encoding;
        encoding = state.defaultEncoding;
      } else {
        if (!encoding) encoding = state.defaultEncoding;
        else if (encoding !== 'buffer' && !Buffer2.isEncoding(encoding)) throw new ERR_UNKNOWN_ENCODING(encoding);
        if (typeof cb !== 'function') cb = nop;
      }
      if (chunk === null) {
        throw new ERR_STREAM_NULL_VALUES();
      } else if (!state.objectMode) {
        if (typeof chunk === 'string') {
          if (state.decodeStrings !== false) {
            chunk = Buffer2.from(chunk, encoding);
            encoding = 'buffer';
          }
        } else if (chunk instanceof Buffer2) {
          encoding = 'buffer';
        } else if (Stream._isUint8Array(chunk)) {
          chunk = Stream._uint8ArrayToBuffer(chunk);
          encoding = 'buffer';
        } else {
          throw new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
        }
      }
      let err;
      if (state.ending) {
        err = new ERR_STREAM_WRITE_AFTER_END();
      } else if (state.destroyed) {
        err = new ERR_STREAM_DESTROYED('write');
      }
      if (err) {
        process2.nextTick(cb, err);
        errorOrDestroy(stream, err, true);
        return err;
      }
      state.pendingcb++;
      return writeOrBuffer(stream, state, chunk, encoding, cb);
    }
    Writable.prototype.write = function (chunk, encoding, cb) {
      return _write(this, chunk, encoding, cb) === true;
    };
    Writable.prototype.cork = function () {
      this._writableState.corked++;
    };
    Writable.prototype.uncork = function () {
      const state = this._writableState;
      if (state.corked) {
        state.corked--;
        if (!state.writing) clearBuffer(this, state);
      }
    };
    Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
      if (typeof encoding === 'string') encoding = StringPrototypeToLowerCase(encoding);
      if (!Buffer2.isEncoding(encoding)) throw new ERR_UNKNOWN_ENCODING(encoding);
      this._writableState.defaultEncoding = encoding;
      return this;
    };
    function writeOrBuffer(stream, state, chunk, encoding, callback) {
      const len = state.objectMode ? 1 : chunk.length;
      state.length += len;
      const ret = state.length < state.highWaterMark;
      if (!ret) state.needDrain = true;
      if (state.writing || state.corked || state.errored || !state.constructed) {
        state.buffered.push({
          chunk,
          encoding,
          callback,
        });
        if (state.allBuffers && encoding !== 'buffer') {
          state.allBuffers = false;
        }
        if (state.allNoop && callback !== nop) {
          state.allNoop = false;
        }
      } else {
        state.writelen = len;
        state.writecb = callback;
        state.writing = true;
        state.sync = true;
        stream._write(chunk, encoding, state.onwrite);
        state.sync = false;
      }
      return ret && !state.errored && !state.destroyed;
    }
    function doWrite(stream, state, writev, len, chunk, encoding, cb) {
      state.writelen = len;
      state.writecb = cb;
      state.writing = true;
      state.sync = true;
      if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));
      else if (writev) stream._writev(chunk, state.onwrite);
      else stream._write(chunk, encoding, state.onwrite);
      state.sync = false;
    }
    function onwriteError(stream, state, er, cb) {
      --state.pendingcb;
      cb(er);
      errorBuffer(state);
      errorOrDestroy(stream, er);
    }
    function onwrite(stream, er) {
      const state = stream._writableState;
      const sync = state.sync;
      const cb = state.writecb;
      if (typeof cb !== 'function') {
        errorOrDestroy(stream, new ERR_MULTIPLE_CALLBACK());
        return;
      }
      state.writing = false;
      state.writecb = null;
      state.length -= state.writelen;
      state.writelen = 0;
      if (er) {
        er.stack;
        if (!state.errored) {
          state.errored = er;
        }
        if (stream._readableState && !stream._readableState.errored) {
          stream._readableState.errored = er;
        }
        if (sync) {
          process2.nextTick(onwriteError, stream, state, er, cb);
        } else {
          onwriteError(stream, state, er, cb);
        }
      } else {
        if (state.buffered.length > state.bufferedIndex) {
          clearBuffer(stream, state);
        }
        if (sync) {
          if (state.afterWriteTickInfo !== null && state.afterWriteTickInfo.cb === cb) {
            state.afterWriteTickInfo.count++;
          } else {
            state.afterWriteTickInfo = {
              count: 1,
              cb,
              stream,
              state,
            };
            process2.nextTick(afterWriteTick, state.afterWriteTickInfo);
          }
        } else {
          afterWrite(stream, state, 1, cb);
        }
      }
    }
    function afterWriteTick({ stream, state, count, cb }) {
      state.afterWriteTickInfo = null;
      return afterWrite(stream, state, count, cb);
    }
    function afterWrite(stream, state, count, cb) {
      const needDrain = !state.ending && !stream.destroyed && state.length === 0 && state.needDrain;
      if (needDrain) {
        state.needDrain = false;
        stream.emit('drain');
      }
      while (count-- > 0) {
        state.pendingcb--;
        cb();
      }
      if (state.destroyed) {
        errorBuffer(state);
      }
      finishMaybe(stream, state);
    }
    function errorBuffer(state) {
      if (state.writing) {
        return;
      }
      for (let n = state.bufferedIndex; n < state.buffered.length; ++n) {
        var _state$errored;
        const { chunk, callback } = state.buffered[n];
        const len = state.objectMode ? 1 : chunk.length;
        state.length -= len;
        callback(
          (_state$errored = state.errored) !== null && _state$errored !== void 0
            ? _state$errored
            : new ERR_STREAM_DESTROYED('write')
        );
      }
      const onfinishCallbacks = state[kOnFinished].splice(0);
      for (let i = 0; i < onfinishCallbacks.length; i++) {
        var _state$errored2;
        onfinishCallbacks[i](
          (_state$errored2 = state.errored) !== null && _state$errored2 !== void 0
            ? _state$errored2
            : new ERR_STREAM_DESTROYED('end')
        );
      }
      resetBuffer(state);
    }
    function clearBuffer(stream, state) {
      if (state.corked || state.bufferProcessing || state.destroyed || !state.constructed) {
        return;
      }
      const { buffered, bufferedIndex, objectMode } = state;
      const bufferedLength = buffered.length - bufferedIndex;
      if (!bufferedLength) {
        return;
      }
      let i = bufferedIndex;
      state.bufferProcessing = true;
      if (bufferedLength > 1 && stream._writev) {
        state.pendingcb -= bufferedLength - 1;
        const callback = state.allNoop
          ? nop
          : (err) => {
              for (let n = i; n < buffered.length; ++n) {
                buffered[n].callback(err);
              }
            };
        const chunks = state.allNoop && i === 0 ? buffered : ArrayPrototypeSlice(buffered, i);
        chunks.allBuffers = state.allBuffers;
        doWrite(stream, state, true, state.length, chunks, '', callback);
        resetBuffer(state);
      } else {
        do {
          const { chunk, encoding, callback } = buffered[i];
          buffered[i++] = null;
          const len = objectMode ? 1 : chunk.length;
          doWrite(stream, state, false, len, chunk, encoding, callback);
        } while (i < buffered.length && !state.writing);
        if (i === buffered.length) {
          resetBuffer(state);
        } else if (i > 256) {
          buffered.splice(0, i);
          state.bufferedIndex = 0;
        } else {
          state.bufferedIndex = i;
        }
      }
      state.bufferProcessing = false;
    }
    Writable.prototype._write = function (chunk, encoding, cb) {
      if (this._writev) {
        this._writev(
          [
            {
              chunk,
              encoding,
            },
          ],
          cb
        );
      } else {
        throw new ERR_METHOD_NOT_IMPLEMENTED('_write()');
      }
    };
    Writable.prototype._writev = null;
    Writable.prototype.end = function (chunk, encoding, cb) {
      const state = this._writableState;
      if (typeof chunk === 'function') {
        cb = chunk;
        chunk = null;
        encoding = null;
      } else if (typeof encoding === 'function') {
        cb = encoding;
        encoding = null;
      }
      let err;
      if (chunk !== null && chunk !== void 0) {
        const ret = _write(this, chunk, encoding);
        if (ret instanceof Error2) {
          err = ret;
        }
      }
      if (state.corked) {
        state.corked = 1;
        this.uncork();
      }
      if (err) {
      } else if (!state.errored && !state.ending) {
        state.ending = true;
        finishMaybe(this, state, true);
        state.ended = true;
      } else if (state.finished) {
        err = new ERR_STREAM_ALREADY_FINISHED('end');
      } else if (state.destroyed) {
        err = new ERR_STREAM_DESTROYED('end');
      }
      if (typeof cb === 'function') {
        if (err || state.finished) {
          process2.nextTick(cb, err);
        } else {
          state[kOnFinished].push(cb);
        }
      }
      return this;
    };
    function needFinish(state) {
      return (
        state.ending &&
        !state.destroyed &&
        state.constructed &&
        state.length === 0 &&
        !state.errored &&
        state.buffered.length === 0 &&
        !state.finished &&
        !state.writing &&
        !state.errorEmitted &&
        !state.closeEmitted
      );
    }
    function callFinal(stream, state) {
      let called = false;
      function onFinish(err) {
        if (called) {
          errorOrDestroy(stream, err !== null && err !== void 0 ? err : ERR_MULTIPLE_CALLBACK());
          return;
        }
        called = true;
        state.pendingcb--;
        if (err) {
          const onfinishCallbacks = state[kOnFinished].splice(0);
          for (let i = 0; i < onfinishCallbacks.length; i++) {
            onfinishCallbacks[i](err);
          }
          errorOrDestroy(stream, err, state.sync);
        } else if (needFinish(state)) {
          state.prefinished = true;
          stream.emit('prefinish');
          state.pendingcb++;
          process2.nextTick(finish, stream, state);
        }
      }
      state.sync = true;
      state.pendingcb++;
      try {
        stream._final(onFinish);
      } catch (err) {
        onFinish(err);
      }
      state.sync = false;
    }
    function prefinish(stream, state) {
      if (!state.prefinished && !state.finalCalled) {
        if (typeof stream._final === 'function' && !state.destroyed) {
          state.finalCalled = true;
          callFinal(stream, state);
        } else {
          state.prefinished = true;
          stream.emit('prefinish');
        }
      }
    }
    function finishMaybe(stream, state, sync) {
      if (needFinish(state)) {
        prefinish(stream, state);
        if (state.pendingcb === 0) {
          if (sync) {
            state.pendingcb++;
            process2.nextTick(
              (stream2, state2) => {
                if (needFinish(state2)) {
                  finish(stream2, state2);
                } else {
                  state2.pendingcb--;
                }
              },
              stream,
              state
            );
          } else if (needFinish(state)) {
            state.pendingcb++;
            finish(stream, state);
          }
        }
      }
    }
    function finish(stream, state) {
      state.pendingcb--;
      state.finished = true;
      const onfinishCallbacks = state[kOnFinished].splice(0);
      for (let i = 0; i < onfinishCallbacks.length; i++) {
        onfinishCallbacks[i]();
      }
      stream.emit('finish');
      if (state.autoDestroy) {
        const rState = stream._readableState;
        const autoDestroy =
          !rState ||
          (rState.autoDestroy && // We don't expect the readable to ever 'end'
            // if readable is explicitly set to false.
            (rState.endEmitted || rState.readable === false));
        if (autoDestroy) {
          stream.destroy();
        }
      }
    }
    ObjectDefineProperties(Writable.prototype, {
      closed: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.closed : false;
        },
      },
      destroyed: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.destroyed : false;
        },
        set(value) {
          if (this._writableState) {
            this._writableState.destroyed = value;
          }
        },
      },
      writable: {
        __proto__: null,
        get() {
          const w = this._writableState;
          return !!w && w.writable !== false && !w.destroyed && !w.errored && !w.ending && !w.ended;
        },
        set(val) {
          if (this._writableState) {
            this._writableState.writable = !!val;
          }
        },
      },
      writableFinished: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.finished : false;
        },
      },
      writableObjectMode: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.objectMode : false;
        },
      },
      writableBuffer: {
        __proto__: null,
        get() {
          return this._writableState && this._writableState.getBuffer();
        },
      },
      writableEnded: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.ending : false;
        },
      },
      writableNeedDrain: {
        __proto__: null,
        get() {
          const wState = this._writableState;
          if (!wState) return false;
          return !wState.destroyed && !wState.ending && wState.needDrain;
        },
      },
      writableHighWaterMark: {
        __proto__: null,
        get() {
          return this._writableState && this._writableState.highWaterMark;
        },
      },
      writableCorked: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.corked : 0;
        },
      },
      writableLength: {
        __proto__: null,
        get() {
          return this._writableState && this._writableState.length;
        },
      },
      errored: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._writableState ? this._writableState.errored : null;
        },
      },
      writableAborted: {
        __proto__: null,
        enumerable: false,
        get: function () {
          return !!(
            this._writableState.writable !== false &&
            (this._writableState.destroyed || this._writableState.errored) &&
            !this._writableState.finished
          );
        },
      },
    });
    var destroy = destroyImpl.destroy;
    Writable.prototype.destroy = function (err, cb) {
      const state = this._writableState;
      if (!state.destroyed && (state.bufferedIndex < state.buffered.length || state[kOnFinished].length)) {
        process2.nextTick(errorBuffer, state);
      }
      destroy.call(this, err, cb);
      return this;
    };
    Writable.prototype._undestroy = destroyImpl.undestroy;
    Writable.prototype._destroy = function (err, cb) {
      cb(err);
    };
    Writable.prototype[EE.captureRejectionSymbol] = function (err) {
      this.destroy(err);
    };
    var webStreamsAdapters;
    function lazyWebStreams() {
      if (webStreamsAdapters === void 0) webStreamsAdapters = {};
      return webStreamsAdapters;
    }
    Writable.fromWeb = function (writableStream, options) {
      return lazyWebStreams().newStreamWritableFromWritableStream(writableStream, options);
    };
    Writable.toWeb = function (streamWritable) {
      return lazyWebStreams().newWritableStreamFromStreamWritable(streamWritable);
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/duplexify.js
var require_duplexify2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/duplexify.js'(
    exports2,
    module2
  ) {
    var process2 = require_process();
    var bufferModule = require('buffer');
    var {
      isReadable,
      isWritable,
      isIterable,
      isNodeStream,
      isReadableNodeStream,
      isWritableNodeStream,
      isDuplexNodeStream,
    } = require_utils2();
    var eos = require_end_of_stream3();
    var {
      AbortError,
      codes: { ERR_INVALID_ARG_TYPE, ERR_INVALID_RETURN_VALUE },
    } = require_errors2();
    var { destroyer } = require_destroy2();
    var Duplex = require_duplex2();
    var Readable = require_readable2();
    var { createDeferredPromise } = require_util2();
    var from = require_from2();
    var Blob = globalThis.Blob || bufferModule.Blob;
    var isBlob =
      typeof Blob !== 'undefined'
        ? function isBlob2(b) {
            return b instanceof Blob;
          }
        : function isBlob2(b) {
            return false;
          };
    var AbortController = globalThis.AbortController || require_abort_controller().AbortController;
    var { FunctionPrototypeCall } = require_primordials2();
    var Duplexify = class extends Duplex {
      constructor(options) {
        super(options);
        if ((options === null || options === void 0 ? void 0 : options.readable) === false) {
          this._readableState.readable = false;
          this._readableState.ended = true;
          this._readableState.endEmitted = true;
        }
        if ((options === null || options === void 0 ? void 0 : options.writable) === false) {
          this._writableState.writable = false;
          this._writableState.ending = true;
          this._writableState.ended = true;
          this._writableState.finished = true;
        }
      }
    };
    module2.exports = function duplexify(body, name) {
      if (isDuplexNodeStream(body)) {
        return body;
      }
      if (isReadableNodeStream(body)) {
        return _duplexify({
          readable: body,
        });
      }
      if (isWritableNodeStream(body)) {
        return _duplexify({
          writable: body,
        });
      }
      if (isNodeStream(body)) {
        return _duplexify({
          writable: false,
          readable: false,
        });
      }
      if (typeof body === 'function') {
        const { value, write, final, destroy } = fromAsyncGen(body);
        if (isIterable(value)) {
          return from(Duplexify, value, {
            // TODO (ronag): highWaterMark?
            objectMode: true,
            write,
            final,
            destroy,
          });
        }
        const then2 = value === null || value === void 0 ? void 0 : value.then;
        if (typeof then2 === 'function') {
          let d;
          const promise = FunctionPrototypeCall(
            then2,
            value,
            (val) => {
              if (val != null) {
                throw new ERR_INVALID_RETURN_VALUE('nully', 'body', val);
              }
            },
            (err) => {
              destroyer(d, err);
            }
          );
          return (d = new Duplexify({
            // TODO (ronag): highWaterMark?
            objectMode: true,
            readable: false,
            write,
            final(cb) {
              final(async () => {
                try {
                  await promise;
                  process2.nextTick(cb, null);
                } catch (err) {
                  process2.nextTick(cb, err);
                }
              });
            },
            destroy,
          }));
        }
        throw new ERR_INVALID_RETURN_VALUE('Iterable, AsyncIterable or AsyncFunction', name, value);
      }
      if (isBlob(body)) {
        return duplexify(body.arrayBuffer());
      }
      if (isIterable(body)) {
        return from(Duplexify, body, {
          // TODO (ronag): highWaterMark?
          objectMode: true,
          writable: false,
        });
      }
      if (
        typeof (body === null || body === void 0 ? void 0 : body.writable) === 'object' ||
        typeof (body === null || body === void 0 ? void 0 : body.readable) === 'object'
      ) {
        const readable =
          body !== null && body !== void 0 && body.readable
            ? isReadableNodeStream(body === null || body === void 0 ? void 0 : body.readable)
              ? body === null || body === void 0
                ? void 0
                : body.readable
              : duplexify(body.readable)
            : void 0;
        const writable =
          body !== null && body !== void 0 && body.writable
            ? isWritableNodeStream(body === null || body === void 0 ? void 0 : body.writable)
              ? body === null || body === void 0
                ? void 0
                : body.writable
              : duplexify(body.writable)
            : void 0;
        return _duplexify({
          readable,
          writable,
        });
      }
      const then = body === null || body === void 0 ? void 0 : body.then;
      if (typeof then === 'function') {
        let d;
        FunctionPrototypeCall(
          then,
          body,
          (val) => {
            if (val != null) {
              d.push(val);
            }
            d.push(null);
          },
          (err) => {
            destroyer(d, err);
          }
        );
        return (d = new Duplexify({
          objectMode: true,
          writable: false,
          read() {},
        }));
      }
      throw new ERR_INVALID_ARG_TYPE(
        name,
        [
          'Blob',
          'ReadableStream',
          'WritableStream',
          'Stream',
          'Iterable',
          'AsyncIterable',
          'Function',
          '{ readable, writable } pair',
          'Promise',
        ],
        body
      );
    };
    function fromAsyncGen(fn) {
      let { promise, resolve } = createDeferredPromise();
      const ac = new AbortController();
      const signal = ac.signal;
      const value = fn(
        (async function* () {
          while (true) {
            const _promise = promise;
            promise = null;
            const { chunk, done, cb } = await _promise;
            process2.nextTick(cb);
            if (done) return;
            if (signal.aborted)
              throw new AbortError(void 0, {
                cause: signal.reason,
              });
            ({ promise, resolve } = createDeferredPromise());
            yield chunk;
          }
        })(),
        {
          signal,
        }
      );
      return {
        value,
        write(chunk, encoding, cb) {
          const _resolve = resolve;
          resolve = null;
          _resolve({
            chunk,
            done: false,
            cb,
          });
        },
        final(cb) {
          const _resolve = resolve;
          resolve = null;
          _resolve({
            done: true,
            cb,
          });
        },
        destroy(err, cb) {
          ac.abort();
          cb(err);
        },
      };
    }
    function _duplexify(pair) {
      const r =
        pair.readable && typeof pair.readable.read !== 'function' ? Readable.wrap(pair.readable) : pair.readable;
      const w = pair.writable;
      let readable = !!isReadable(r);
      let writable = !!isWritable(w);
      let ondrain;
      let onfinish;
      let onreadable;
      let onclose;
      let d;
      function onfinished(err) {
        const cb = onclose;
        onclose = null;
        if (cb) {
          cb(err);
        } else if (err) {
          d.destroy(err);
        }
      }
      d = new Duplexify({
        // TODO (ronag): highWaterMark?
        readableObjectMode: !!(r !== null && r !== void 0 && r.readableObjectMode),
        writableObjectMode: !!(w !== null && w !== void 0 && w.writableObjectMode),
        readable,
        writable,
      });
      if (writable) {
        eos(w, (err) => {
          writable = false;
          if (err) {
            destroyer(r, err);
          }
          onfinished(err);
        });
        d._write = function (chunk, encoding, callback) {
          if (w.write(chunk, encoding)) {
            callback();
          } else {
            ondrain = callback;
          }
        };
        d._final = function (callback) {
          w.end();
          onfinish = callback;
        };
        w.on('drain', function () {
          if (ondrain) {
            const cb = ondrain;
            ondrain = null;
            cb();
          }
        });
        w.on('finish', function () {
          if (onfinish) {
            const cb = onfinish;
            onfinish = null;
            cb();
          }
        });
      }
      if (readable) {
        eos(r, (err) => {
          readable = false;
          if (err) {
            destroyer(r, err);
          }
          onfinished(err);
        });
        r.on('readable', function () {
          if (onreadable) {
            const cb = onreadable;
            onreadable = null;
            cb();
          }
        });
        r.on('end', function () {
          d.push(null);
        });
        d._read = function () {
          while (true) {
            const buf = r.read();
            if (buf === null) {
              onreadable = d._read;
              return;
            }
            if (!d.push(buf)) {
              return;
            }
          }
        };
      }
      d._destroy = function (err, callback) {
        if (!err && onclose !== null) {
          err = new AbortError();
        }
        onreadable = null;
        ondrain = null;
        onfinish = null;
        if (onclose === null) {
          callback(err);
        } else {
          onclose = callback;
          destroyer(w, err);
          destroyer(r, err);
        }
      };
      return d;
    }
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/duplex.js
var require_duplex2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/duplex.js'(
    exports2,
    module2
  ) {
    'use strict';
    var { ObjectDefineProperties, ObjectGetOwnPropertyDescriptor, ObjectKeys, ObjectSetPrototypeOf } =
      require_primordials2();
    module2.exports = Duplex;
    var Readable = require_readable2();
    var Writable = require_writable2();
    ObjectSetPrototypeOf(Duplex.prototype, Readable.prototype);
    ObjectSetPrototypeOf(Duplex, Readable);
    {
      const keys = ObjectKeys(Writable.prototype);
      for (let i = 0; i < keys.length; i++) {
        const method = keys[i];
        if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
      }
    }
    function Duplex(options) {
      if (!(this instanceof Duplex)) return new Duplex(options);
      Readable.call(this, options);
      Writable.call(this, options);
      if (options) {
        this.allowHalfOpen = options.allowHalfOpen !== false;
        if (options.readable === false) {
          this._readableState.readable = false;
          this._readableState.ended = true;
          this._readableState.endEmitted = true;
        }
        if (options.writable === false) {
          this._writableState.writable = false;
          this._writableState.ending = true;
          this._writableState.ended = true;
          this._writableState.finished = true;
        }
      } else {
        this.allowHalfOpen = true;
      }
    }
    ObjectDefineProperties(Duplex.prototype, {
      writable: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writable'),
      },
      writableHighWaterMark: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableHighWaterMark'),
      },
      writableObjectMode: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableObjectMode'),
      },
      writableBuffer: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableBuffer'),
      },
      writableLength: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableLength'),
      },
      writableFinished: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableFinished'),
      },
      writableCorked: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableCorked'),
      },
      writableEnded: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableEnded'),
      },
      writableNeedDrain: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableNeedDrain'),
      },
      destroyed: {
        __proto__: null,
        get() {
          if (this._readableState === void 0 || this._writableState === void 0) {
            return false;
          }
          return this._readableState.destroyed && this._writableState.destroyed;
        },
        set(value) {
          if (this._readableState && this._writableState) {
            this._readableState.destroyed = value;
            this._writableState.destroyed = value;
          }
        },
      },
    });
    var webStreamsAdapters;
    function lazyWebStreams() {
      if (webStreamsAdapters === void 0) webStreamsAdapters = {};
      return webStreamsAdapters;
    }
    Duplex.fromWeb = function (pair, options) {
      return lazyWebStreams().newStreamDuplexFromReadableWritablePair(pair, options);
    };
    Duplex.toWeb = function (duplex) {
      return lazyWebStreams().newReadableWritablePairFromDuplex(duplex);
    };
    var duplexify;
    Duplex.from = function (body) {
      if (!duplexify) {
        duplexify = require_duplexify2();
      }
      return duplexify(body, 'body');
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/transform.js
var require_transform2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/transform.js'(
    exports2,
    module2
  ) {
    'use strict';
    var { ObjectSetPrototypeOf, Symbol: Symbol2 } = require_primordials2();
    module2.exports = Transform2;
    var { ERR_METHOD_NOT_IMPLEMENTED } = require_errors2().codes;
    var Duplex = require_duplex2();
    var { getHighWaterMark } = require_state2();
    ObjectSetPrototypeOf(Transform2.prototype, Duplex.prototype);
    ObjectSetPrototypeOf(Transform2, Duplex);
    var kCallback = Symbol2('kCallback');
    function Transform2(options) {
      if (!(this instanceof Transform2)) return new Transform2(options);
      const readableHighWaterMark = options ? getHighWaterMark(this, options, 'readableHighWaterMark', true) : null;
      if (readableHighWaterMark === 0) {
        options = {
          ...options,
          highWaterMark: null,
          readableHighWaterMark,
          // TODO (ronag): 0 is not optimal since we have
          // a "bug" where we check needDrain before calling _write and not after.
          // Refs: https://github.com/nodejs/node/pull/32887
          // Refs: https://github.com/nodejs/node/pull/35941
          writableHighWaterMark: options.writableHighWaterMark || 0,
        };
      }
      Duplex.call(this, options);
      this._readableState.sync = false;
      this[kCallback] = null;
      if (options) {
        if (typeof options.transform === 'function') this._transform = options.transform;
        if (typeof options.flush === 'function') this._flush = options.flush;
      }
      this.on('prefinish', prefinish);
    }
    function final(cb) {
      if (typeof this._flush === 'function' && !this.destroyed) {
        this._flush((er, data) => {
          if (er) {
            if (cb) {
              cb(er);
            } else {
              this.destroy(er);
            }
            return;
          }
          if (data != null) {
            this.push(data);
          }
          this.push(null);
          if (cb) {
            cb();
          }
        });
      } else {
        this.push(null);
        if (cb) {
          cb();
        }
      }
    }
    function prefinish() {
      if (this._final !== final) {
        final.call(this);
      }
    }
    Transform2.prototype._final = final;
    Transform2.prototype._transform = function (chunk, encoding, callback) {
      throw new ERR_METHOD_NOT_IMPLEMENTED('_transform()');
    };
    Transform2.prototype._write = function (chunk, encoding, callback) {
      const rState = this._readableState;
      const wState = this._writableState;
      const length = rState.length;
      this._transform(chunk, encoding, (err, val) => {
        if (err) {
          callback(err);
          return;
        }
        if (val != null) {
          this.push(val);
        }
        if (
          wState.ended || // Backwards compat.
          length === rState.length || // Backwards compat.
          rState.length < rState.highWaterMark
        ) {
          callback();
        } else {
          this[kCallback] = callback;
        }
      });
    };
    Transform2.prototype._read = function () {
      if (this[kCallback]) {
        const callback = this[kCallback];
        this[kCallback] = null;
        callback();
      }
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/passthrough.js
var require_passthrough2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/passthrough.js'(
    exports2,
    module2
  ) {
    'use strict';
    var { ObjectSetPrototypeOf } = require_primordials2();
    module2.exports = PassThrough;
    var Transform2 = require_transform2();
    ObjectSetPrototypeOf(PassThrough.prototype, Transform2.prototype);
    ObjectSetPrototypeOf(PassThrough, Transform2);
    function PassThrough(options) {
      if (!(this instanceof PassThrough)) return new PassThrough(options);
      Transform2.call(this, options);
    }
    PassThrough.prototype._transform = function (chunk, encoding, cb) {
      cb(null, chunk);
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/pipeline.js
var require_pipeline2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/pipeline.js'(
    exports2,
    module2
  ) {
    var process2 = require_process();
    var { ArrayIsArray, Promise: Promise2, SymbolAsyncIterator } = require_primordials2();
    var eos = require_end_of_stream3();
    var { once } = require_util2();
    var destroyImpl = require_destroy2();
    var Duplex = require_duplex2();
    var {
      aggregateTwoErrors,
      codes: {
        ERR_INVALID_ARG_TYPE,
        ERR_INVALID_RETURN_VALUE,
        ERR_MISSING_ARGS,
        ERR_STREAM_DESTROYED,
        ERR_STREAM_PREMATURE_CLOSE,
      },
      AbortError,
    } = require_errors2();
    var { validateFunction, validateAbortSignal } = require_validators2();
    var {
      isIterable,
      isReadable,
      isReadableNodeStream,
      isNodeStream,
      isTransformStream,
      isWebStream,
      isReadableStream,
      isReadableEnded,
    } = require_utils2();
    var AbortController = globalThis.AbortController || require_abort_controller().AbortController;
    var PassThrough;
    var Readable;
    function destroyer(stream, reading, writing) {
      let finished = false;
      stream.on('close', () => {
        finished = true;
      });
      const cleanup = eos(
        stream,
        {
          readable: reading,
          writable: writing,
        },
        (err) => {
          finished = !err;
        }
      );
      return {
        destroy: (err) => {
          if (finished) return;
          finished = true;
          destroyImpl.destroyer(stream, err || new ERR_STREAM_DESTROYED('pipe'));
        },
        cleanup,
      };
    }
    function popCallback(streams) {
      validateFunction(streams[streams.length - 1], 'streams[stream.length - 1]');
      return streams.pop();
    }
    function makeAsyncIterable(val) {
      if (isIterable(val)) {
        return val;
      } else if (isReadableNodeStream(val)) {
        return fromReadable(val);
      }
      throw new ERR_INVALID_ARG_TYPE('val', ['Readable', 'Iterable', 'AsyncIterable'], val);
    }
    async function* fromReadable(val) {
      if (!Readable) {
        Readable = require_readable2();
      }
      yield* Readable.prototype[SymbolAsyncIterator].call(val);
    }
    async function pumpToNode(iterable, writable, finish, { end }) {
      let error;
      let onresolve = null;
      const resume = (err) => {
        if (err) {
          error = err;
        }
        if (onresolve) {
          const callback = onresolve;
          onresolve = null;
          callback();
        }
      };
      const wait = () =>
        new Promise2((resolve, reject) => {
          if (error) {
            reject(error);
          } else {
            onresolve = () => {
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            };
          }
        });
      writable.on('drain', resume);
      const cleanup = eos(
        writable,
        {
          readable: false,
        },
        resume
      );
      try {
        if (writable.writableNeedDrain) {
          await wait();
        }
        for await (const chunk of iterable) {
          if (!writable.write(chunk)) {
            await wait();
          }
        }
        if (end) {
          writable.end();
        }
        await wait();
        finish();
      } catch (err) {
        finish(error !== err ? aggregateTwoErrors(error, err) : err);
      } finally {
        cleanup();
        writable.off('drain', resume);
      }
    }
    async function pumpToWeb(readable, writable, finish, { end }) {
      if (isTransformStream(writable)) {
        writable = writable.writable;
      }
      const writer = writable.getWriter();
      try {
        for await (const chunk of readable) {
          await writer.ready;
          writer.write(chunk).catch(() => {});
        }
        await writer.ready;
        if (end) {
          await writer.close();
        }
        finish();
      } catch (err) {
        try {
          await writer.abort(err);
          finish(err);
        } catch (err2) {
          finish(err2);
        }
      }
    }
    function pipeline(...streams) {
      return pipelineImpl(streams, once(popCallback(streams)));
    }
    function pipelineImpl(streams, callback, opts) {
      if (streams.length === 1 && ArrayIsArray(streams[0])) {
        streams = streams[0];
      }
      if (streams.length < 2) {
        throw new ERR_MISSING_ARGS('streams');
      }
      const ac = new AbortController();
      const signal = ac.signal;
      const outerSignal = opts === null || opts === void 0 ? void 0 : opts.signal;
      const lastStreamCleanup = [];
      validateAbortSignal(outerSignal, 'options.signal');
      function abort() {
        finishImpl(new AbortError());
      }
      outerSignal === null || outerSignal === void 0 ? void 0 : outerSignal.addEventListener('abort', abort);
      let error;
      let value;
      const destroys = [];
      let finishCount = 0;
      function finish(err) {
        finishImpl(err, --finishCount === 0);
      }
      function finishImpl(err, final) {
        if (err && (!error || error.code === 'ERR_STREAM_PREMATURE_CLOSE')) {
          error = err;
        }
        if (!error && !final) {
          return;
        }
        while (destroys.length) {
          destroys.shift()(error);
        }
        outerSignal === null || outerSignal === void 0 ? void 0 : outerSignal.removeEventListener('abort', abort);
        ac.abort();
        if (final) {
          if (!error) {
            lastStreamCleanup.forEach((fn) => fn());
          }
          process2.nextTick(callback, error, value);
        }
      }
      let ret;
      for (let i = 0; i < streams.length; i++) {
        const stream = streams[i];
        const reading = i < streams.length - 1;
        const writing = i > 0;
        const end = reading || (opts === null || opts === void 0 ? void 0 : opts.end) !== false;
        const isLastStream = i === streams.length - 1;
        if (isNodeStream(stream)) {
          let onError2 = function (err) {
            if (err && err.name !== 'AbortError' && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
              finish(err);
            }
          };
          var onError = onError2;
          if (end) {
            const { destroy, cleanup } = destroyer(stream, reading, writing);
            destroys.push(destroy);
            if (isReadable(stream) && isLastStream) {
              lastStreamCleanup.push(cleanup);
            }
          }
          stream.on('error', onError2);
          if (isReadable(stream) && isLastStream) {
            lastStreamCleanup.push(() => {
              stream.removeListener('error', onError2);
            });
          }
        }
        if (i === 0) {
          if (typeof stream === 'function') {
            ret = stream({
              signal,
            });
            if (!isIterable(ret)) {
              throw new ERR_INVALID_RETURN_VALUE('Iterable, AsyncIterable or Stream', 'source', ret);
            }
          } else if (isIterable(stream) || isReadableNodeStream(stream) || isTransformStream(stream)) {
            ret = stream;
          } else {
            ret = Duplex.from(stream);
          }
        } else if (typeof stream === 'function') {
          if (isTransformStream(ret)) {
            var _ret;
            ret = makeAsyncIterable((_ret = ret) === null || _ret === void 0 ? void 0 : _ret.readable);
          } else {
            ret = makeAsyncIterable(ret);
          }
          ret = stream(ret, {
            signal,
          });
          if (reading) {
            if (!isIterable(ret, true)) {
              throw new ERR_INVALID_RETURN_VALUE('AsyncIterable', `transform[${i - 1}]`, ret);
            }
          } else {
            var _ret2;
            if (!PassThrough) {
              PassThrough = require_passthrough2();
            }
            const pt = new PassThrough({
              objectMode: true,
            });
            const then = (_ret2 = ret) === null || _ret2 === void 0 ? void 0 : _ret2.then;
            if (typeof then === 'function') {
              finishCount++;
              then.call(
                ret,
                (val) => {
                  value = val;
                  if (val != null) {
                    pt.write(val);
                  }
                  if (end) {
                    pt.end();
                  }
                  process2.nextTick(finish);
                },
                (err) => {
                  pt.destroy(err);
                  process2.nextTick(finish, err);
                }
              );
            } else if (isIterable(ret, true)) {
              finishCount++;
              pumpToNode(ret, pt, finish, {
                end,
              });
            } else if (isReadableStream(ret) || isTransformStream(ret)) {
              const toRead = ret.readable || ret;
              finishCount++;
              pumpToNode(toRead, pt, finish, {
                end,
              });
            } else {
              throw new ERR_INVALID_RETURN_VALUE('AsyncIterable or Promise', 'destination', ret);
            }
            ret = pt;
            const { destroy, cleanup } = destroyer(ret, false, true);
            destroys.push(destroy);
            if (isLastStream) {
              lastStreamCleanup.push(cleanup);
            }
          }
        } else if (isNodeStream(stream)) {
          if (isReadableNodeStream(ret)) {
            finishCount += 2;
            const cleanup = pipe(ret, stream, finish, {
              end,
            });
            if (isReadable(stream) && isLastStream) {
              lastStreamCleanup.push(cleanup);
            }
          } else if (isTransformStream(ret) || isReadableStream(ret)) {
            const toRead = ret.readable || ret;
            finishCount++;
            pumpToNode(toRead, stream, finish, {
              end,
            });
          } else if (isIterable(ret)) {
            finishCount++;
            pumpToNode(ret, stream, finish, {
              end,
            });
          } else {
            throw new ERR_INVALID_ARG_TYPE(
              'val',
              ['Readable', 'Iterable', 'AsyncIterable', 'ReadableStream', 'TransformStream'],
              ret
            );
          }
          ret = stream;
        } else if (isWebStream(stream)) {
          if (isReadableNodeStream(ret)) {
            finishCount++;
            pumpToWeb(makeAsyncIterable(ret), stream, finish, {
              end,
            });
          } else if (isReadableStream(ret) || isIterable(ret)) {
            finishCount++;
            pumpToWeb(ret, stream, finish, {
              end,
            });
          } else if (isTransformStream(ret)) {
            finishCount++;
            pumpToWeb(ret.readable, stream, finish, {
              end,
            });
          } else {
            throw new ERR_INVALID_ARG_TYPE(
              'val',
              ['Readable', 'Iterable', 'AsyncIterable', 'ReadableStream', 'TransformStream'],
              ret
            );
          }
          ret = stream;
        } else {
          ret = Duplex.from(stream);
        }
      }
      if (
        (signal !== null && signal !== void 0 && signal.aborted) ||
        (outerSignal !== null && outerSignal !== void 0 && outerSignal.aborted)
      ) {
        process2.nextTick(abort);
      }
      return ret;
    }
    function pipe(src, dst, finish, { end }) {
      let ended = false;
      dst.on('close', () => {
        if (!ended) {
          finish(new ERR_STREAM_PREMATURE_CLOSE());
        }
      });
      src.pipe(dst, {
        end: false,
      });
      if (end) {
        let endFn2 = function () {
          ended = true;
          dst.end();
        };
        var endFn = endFn2;
        if (isReadableEnded(src)) {
          process2.nextTick(endFn2);
        } else {
          src.once('end', endFn2);
        }
      } else {
        finish();
      }
      eos(
        src,
        {
          readable: true,
          writable: false,
        },
        (err) => {
          const rState = src._readableState;
          if (
            err &&
            err.code === 'ERR_STREAM_PREMATURE_CLOSE' &&
            rState &&
            rState.ended &&
            !rState.errored &&
            !rState.errorEmitted
          ) {
            src.once('end', finish).once('error', finish);
          } else {
            finish(err);
          }
        }
      );
      return eos(
        dst,
        {
          readable: false,
          writable: true,
        },
        finish
      );
    }
    module2.exports = {
      pipelineImpl,
      pipeline,
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/compose.js
var require_compose2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/compose.js'(
    exports2,
    module2
  ) {
    'use strict';
    var { pipeline } = require_pipeline2();
    var Duplex = require_duplex2();
    var { destroyer } = require_destroy2();
    var { isNodeStream, isReadable, isWritable, isWebStream, isTransformStream, isWritableStream, isReadableStream } =
      require_utils2();
    var {
      AbortError,
      codes: { ERR_INVALID_ARG_VALUE, ERR_MISSING_ARGS },
    } = require_errors2();
    var eos = require_end_of_stream3();
    module2.exports = function compose(...streams) {
      if (streams.length === 0) {
        throw new ERR_MISSING_ARGS('streams');
      }
      if (streams.length === 1) {
        return Duplex.from(streams[0]);
      }
      const orgStreams = [...streams];
      if (typeof streams[0] === 'function') {
        streams[0] = Duplex.from(streams[0]);
      }
      if (typeof streams[streams.length - 1] === 'function') {
        const idx = streams.length - 1;
        streams[idx] = Duplex.from(streams[idx]);
      }
      for (let n = 0; n < streams.length; ++n) {
        if (!isNodeStream(streams[n]) && !isWebStream(streams[n])) {
          continue;
        }
        if (
          n < streams.length - 1 &&
          !(isReadable(streams[n]) || isReadableStream(streams[n]) || isTransformStream(streams[n]))
        ) {
          throw new ERR_INVALID_ARG_VALUE(`streams[${n}]`, orgStreams[n], 'must be readable');
        }
        if (n > 0 && !(isWritable(streams[n]) || isWritableStream(streams[n]) || isTransformStream(streams[n]))) {
          throw new ERR_INVALID_ARG_VALUE(`streams[${n}]`, orgStreams[n], 'must be writable');
        }
      }
      let ondrain;
      let onfinish;
      let onreadable;
      let onclose;
      let d;
      function onfinished(err) {
        const cb = onclose;
        onclose = null;
        if (cb) {
          cb(err);
        } else if (err) {
          d.destroy(err);
        } else if (!readable && !writable) {
          d.destroy();
        }
      }
      const head = streams[0];
      const tail = pipeline(streams, onfinished);
      const writable = !!(isWritable(head) || isWritableStream(head) || isTransformStream(head));
      const readable = !!(isReadable(tail) || isReadableStream(tail) || isTransformStream(tail));
      d = new Duplex({
        // TODO (ronag): highWaterMark?
        writableObjectMode: !!(head !== null && head !== void 0 && head.writableObjectMode),
        readableObjectMode: !!(tail !== null && tail !== void 0 && tail.writableObjectMode),
        writable,
        readable,
      });
      if (writable) {
        if (isNodeStream(head)) {
          d._write = function (chunk, encoding, callback) {
            if (head.write(chunk, encoding)) {
              callback();
            } else {
              ondrain = callback;
            }
          };
          d._final = function (callback) {
            head.end();
            onfinish = callback;
          };
          head.on('drain', function () {
            if (ondrain) {
              const cb = ondrain;
              ondrain = null;
              cb();
            }
          });
        } else if (isWebStream(head)) {
          const writable2 = isTransformStream(head) ? head.writable : head;
          const writer = writable2.getWriter();
          d._write = async function (chunk, encoding, callback) {
            try {
              await writer.ready;
              writer.write(chunk).catch(() => {});
              callback();
            } catch (err) {
              callback(err);
            }
          };
          d._final = async function (callback) {
            try {
              await writer.ready;
              writer.close().catch(() => {});
              onfinish = callback;
            } catch (err) {
              callback(err);
            }
          };
        }
        const toRead = isTransformStream(tail) ? tail.readable : tail;
        eos(toRead, () => {
          if (onfinish) {
            const cb = onfinish;
            onfinish = null;
            cb();
          }
        });
      }
      if (readable) {
        if (isNodeStream(tail)) {
          tail.on('readable', function () {
            if (onreadable) {
              const cb = onreadable;
              onreadable = null;
              cb();
            }
          });
          tail.on('end', function () {
            d.push(null);
          });
          d._read = function () {
            while (true) {
              const buf = tail.read();
              if (buf === null) {
                onreadable = d._read;
                return;
              }
              if (!d.push(buf)) {
                return;
              }
            }
          };
        } else if (isWebStream(tail)) {
          const readable2 = isTransformStream(tail) ? tail.readable : tail;
          const reader = readable2.getReader();
          d._read = async function () {
            while (true) {
              try {
                const { value, done } = await reader.read();
                if (!d.push(value)) {
                  return;
                }
                if (done) {
                  d.push(null);
                  return;
                }
              } catch {
                return;
              }
            }
          };
        }
      }
      d._destroy = function (err, callback) {
        if (!err && onclose !== null) {
          err = new AbortError();
        }
        onreadable = null;
        ondrain = null;
        onfinish = null;
        if (onclose === null) {
          callback(err);
        } else {
          onclose = callback;
          if (isNodeStream(tail)) {
            destroyer(tail, err);
          }
        }
      };
      return d;
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/operators.js
var require_operators2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/operators.js'(
    exports2,
    module2
  ) {
    'use strict';
    var AbortController = globalThis.AbortController || require_abort_controller().AbortController;
    var {
      codes: { ERR_INVALID_ARG_VALUE, ERR_INVALID_ARG_TYPE, ERR_MISSING_ARGS, ERR_OUT_OF_RANGE },
      AbortError,
    } = require_errors2();
    var { validateAbortSignal, validateInteger, validateObject } = require_validators2();
    var kWeakHandler = require_primordials2().Symbol('kWeak');
    var { finished } = require_end_of_stream3();
    var staticCompose = require_compose2();
    var { addAbortSignalNoValidate } = require_add_abort_signal2();
    var { isWritable, isNodeStream } = require_utils2();
    var {
      ArrayPrototypePush,
      MathFloor,
      Number: Number2,
      NumberIsNaN,
      Promise: Promise2,
      PromiseReject,
      PromisePrototypeThen,
      Symbol: Symbol2,
    } = require_primordials2();
    var kEmpty = Symbol2('kEmpty');
    var kEof = Symbol2('kEof');
    function compose(stream, options) {
      if (options != null) {
        validateObject(options, 'options');
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, 'options.signal');
      }
      if (isNodeStream(stream) && !isWritable(stream)) {
        throw new ERR_INVALID_ARG_VALUE('stream', stream, 'must be writable');
      }
      const composedStream = staticCompose(this, stream);
      if (options !== null && options !== void 0 && options.signal) {
        addAbortSignalNoValidate(options.signal, composedStream);
      }
      return composedStream;
    }
    function map(fn, options) {
      if (typeof fn !== 'function') {
        throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn);
      }
      if (options != null) {
        validateObject(options, 'options');
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, 'options.signal');
      }
      let concurrency = 1;
      if ((options === null || options === void 0 ? void 0 : options.concurrency) != null) {
        concurrency = MathFloor(options.concurrency);
      }
      validateInteger(concurrency, 'concurrency', 1);
      return async function* map2() {
        var _options$signal, _options$signal2;
        const ac = new AbortController();
        const stream = this;
        const queue = [];
        const signal = ac.signal;
        const signalOpt = {
          signal,
        };
        const abort = () => ac.abort();
        if (
          options !== null &&
          options !== void 0 &&
          (_options$signal = options.signal) !== null &&
          _options$signal !== void 0 &&
          _options$signal.aborted
        ) {
          abort();
        }
        options === null || options === void 0
          ? void 0
          : (_options$signal2 = options.signal) === null || _options$signal2 === void 0
          ? void 0
          : _options$signal2.addEventListener('abort', abort);
        let next;
        let resume;
        let done = false;
        function onDone() {
          done = true;
        }
        async function pump2() {
          try {
            for await (let val of stream) {
              var _val;
              if (done) {
                return;
              }
              if (signal.aborted) {
                throw new AbortError();
              }
              try {
                val = fn(val, signalOpt);
              } catch (err) {
                val = PromiseReject(err);
              }
              if (val === kEmpty) {
                continue;
              }
              if (typeof ((_val = val) === null || _val === void 0 ? void 0 : _val.catch) === 'function') {
                val.catch(onDone);
              }
              queue.push(val);
              if (next) {
                next();
                next = null;
              }
              if (!done && queue.length && queue.length >= concurrency) {
                await new Promise2((resolve) => {
                  resume = resolve;
                });
              }
            }
            queue.push(kEof);
          } catch (err) {
            const val = PromiseReject(err);
            PromisePrototypeThen(val, void 0, onDone);
            queue.push(val);
          } finally {
            var _options$signal3;
            done = true;
            if (next) {
              next();
              next = null;
            }
            options === null || options === void 0
              ? void 0
              : (_options$signal3 = options.signal) === null || _options$signal3 === void 0
              ? void 0
              : _options$signal3.removeEventListener('abort', abort);
          }
        }
        pump2();
        try {
          while (true) {
            while (queue.length > 0) {
              const val = await queue[0];
              if (val === kEof) {
                return;
              }
              if (signal.aborted) {
                throw new AbortError();
              }
              if (val !== kEmpty) {
                yield val;
              }
              queue.shift();
              if (resume) {
                resume();
                resume = null;
              }
            }
            await new Promise2((resolve) => {
              next = resolve;
            });
          }
        } finally {
          ac.abort();
          done = true;
          if (resume) {
            resume();
            resume = null;
          }
        }
      }.call(this);
    }
    function asIndexedPairs(options = void 0) {
      if (options != null) {
        validateObject(options, 'options');
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, 'options.signal');
      }
      return async function* asIndexedPairs2() {
        let index = 0;
        for await (const val of this) {
          var _options$signal4;
          if (
            options !== null &&
            options !== void 0 &&
            (_options$signal4 = options.signal) !== null &&
            _options$signal4 !== void 0 &&
            _options$signal4.aborted
          ) {
            throw new AbortError({
              cause: options.signal.reason,
            });
          }
          yield [index++, val];
        }
      }.call(this);
    }
    async function some(fn, options = void 0) {
      for await (const unused of filter.call(this, fn, options)) {
        return true;
      }
      return false;
    }
    async function every(fn, options = void 0) {
      if (typeof fn !== 'function') {
        throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn);
      }
      return !(await some.call(
        this,
        async (...args) => {
          return !(await fn(...args));
        },
        options
      ));
    }
    async function find(fn, options) {
      for await (const result of filter.call(this, fn, options)) {
        return result;
      }
      return void 0;
    }
    async function forEach(fn, options) {
      if (typeof fn !== 'function') {
        throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn);
      }
      async function forEachFn(value, options2) {
        await fn(value, options2);
        return kEmpty;
      }
      for await (const unused of map.call(this, forEachFn, options));
    }
    function filter(fn, options) {
      if (typeof fn !== 'function') {
        throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn);
      }
      async function filterFn(value, options2) {
        if (await fn(value, options2)) {
          return value;
        }
        return kEmpty;
      }
      return map.call(this, filterFn, options);
    }
    var ReduceAwareErrMissingArgs = class extends ERR_MISSING_ARGS {
      constructor() {
        super('reduce');
        this.message = 'Reduce of an empty stream requires an initial value';
      }
    };
    async function reduce(reducer, initialValue, options) {
      var _options$signal5;
      if (typeof reducer !== 'function') {
        throw new ERR_INVALID_ARG_TYPE('reducer', ['Function', 'AsyncFunction'], reducer);
      }
      if (options != null) {
        validateObject(options, 'options');
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, 'options.signal');
      }
      let hasInitialValue = arguments.length > 1;
      if (
        options !== null &&
        options !== void 0 &&
        (_options$signal5 = options.signal) !== null &&
        _options$signal5 !== void 0 &&
        _options$signal5.aborted
      ) {
        const err = new AbortError(void 0, {
          cause: options.signal.reason,
        });
        this.once('error', () => {});
        await finished(this.destroy(err));
        throw err;
      }
      const ac = new AbortController();
      const signal = ac.signal;
      if (options !== null && options !== void 0 && options.signal) {
        const opts = {
          once: true,
          [kWeakHandler]: this,
        };
        options.signal.addEventListener('abort', () => ac.abort(), opts);
      }
      let gotAnyItemFromStream = false;
      try {
        for await (const value of this) {
          var _options$signal6;
          gotAnyItemFromStream = true;
          if (
            options !== null &&
            options !== void 0 &&
            (_options$signal6 = options.signal) !== null &&
            _options$signal6 !== void 0 &&
            _options$signal6.aborted
          ) {
            throw new AbortError();
          }
          if (!hasInitialValue) {
            initialValue = value;
            hasInitialValue = true;
          } else {
            initialValue = await reducer(initialValue, value, {
              signal,
            });
          }
        }
        if (!gotAnyItemFromStream && !hasInitialValue) {
          throw new ReduceAwareErrMissingArgs();
        }
      } finally {
        ac.abort();
      }
      return initialValue;
    }
    async function toArray(options) {
      if (options != null) {
        validateObject(options, 'options');
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, 'options.signal');
      }
      const result = [];
      for await (const val of this) {
        var _options$signal7;
        if (
          options !== null &&
          options !== void 0 &&
          (_options$signal7 = options.signal) !== null &&
          _options$signal7 !== void 0 &&
          _options$signal7.aborted
        ) {
          throw new AbortError(void 0, {
            cause: options.signal.reason,
          });
        }
        ArrayPrototypePush(result, val);
      }
      return result;
    }
    function flatMap(fn, options) {
      const values = map.call(this, fn, options);
      return async function* flatMap2() {
        for await (const val of values) {
          yield* val;
        }
      }.call(this);
    }
    function toIntegerOrInfinity(number) {
      number = Number2(number);
      if (NumberIsNaN(number)) {
        return 0;
      }
      if (number < 0) {
        throw new ERR_OUT_OF_RANGE('number', '>= 0', number);
      }
      return number;
    }
    function drop(number, options = void 0) {
      if (options != null) {
        validateObject(options, 'options');
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, 'options.signal');
      }
      number = toIntegerOrInfinity(number);
      return async function* drop2() {
        var _options$signal8;
        if (
          options !== null &&
          options !== void 0 &&
          (_options$signal8 = options.signal) !== null &&
          _options$signal8 !== void 0 &&
          _options$signal8.aborted
        ) {
          throw new AbortError();
        }
        for await (const val of this) {
          var _options$signal9;
          if (
            options !== null &&
            options !== void 0 &&
            (_options$signal9 = options.signal) !== null &&
            _options$signal9 !== void 0 &&
            _options$signal9.aborted
          ) {
            throw new AbortError();
          }
          if (number-- <= 0) {
            yield val;
          }
        }
      }.call(this);
    }
    function take(number, options = void 0) {
      if (options != null) {
        validateObject(options, 'options');
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, 'options.signal');
      }
      number = toIntegerOrInfinity(number);
      return async function* take2() {
        var _options$signal10;
        if (
          options !== null &&
          options !== void 0 &&
          (_options$signal10 = options.signal) !== null &&
          _options$signal10 !== void 0 &&
          _options$signal10.aborted
        ) {
          throw new AbortError();
        }
        for await (const val of this) {
          var _options$signal11;
          if (
            options !== null &&
            options !== void 0 &&
            (_options$signal11 = options.signal) !== null &&
            _options$signal11 !== void 0 &&
            _options$signal11.aborted
          ) {
            throw new AbortError();
          }
          if (number-- > 0) {
            yield val;
          } else {
            return;
          }
        }
      }.call(this);
    }
    module2.exports.streamReturningOperators = {
      asIndexedPairs,
      drop,
      filter,
      flatMap,
      map,
      take,
      compose,
    };
    module2.exports.promiseReturningOperators = {
      every,
      forEach,
      reduce,
      toArray,
      some,
      find,
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/stream/promises.js
var require_promises2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/stream/promises.js'(exports2, module2) {
    'use strict';
    var { ArrayPrototypePop, Promise: Promise2 } = require_primordials2();
    var { isIterable, isNodeStream, isWebStream } = require_utils2();
    var { pipelineImpl: pl } = require_pipeline2();
    var { finished } = require_end_of_stream3();
    require('stream');
    function pipeline(...streams) {
      return new Promise2((resolve, reject) => {
        let signal;
        let end;
        const lastArg = streams[streams.length - 1];
        if (
          lastArg &&
          typeof lastArg === 'object' &&
          !isNodeStream(lastArg) &&
          !isIterable(lastArg) &&
          !isWebStream(lastArg)
        ) {
          const options = ArrayPrototypePop(streams);
          signal = options.signal;
          end = options.end;
        }
        pl(
          streams,
          (err, value) => {
            if (err) {
              reject(err);
            } else {
              resolve(value);
            }
          },
          {
            signal,
            end,
          }
        );
      });
    }
    module2.exports = {
      finished,
      pipeline,
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/stream.js
var require_stream2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/stream.js'(exports2, module2) {
    var { Buffer: Buffer2 } = require('buffer');
    var { ObjectDefineProperty, ObjectKeys, ReflectApply } = require_primordials2();
    var {
      promisify: { custom: customPromisify },
    } = require_util2();
    var { streamReturningOperators, promiseReturningOperators } = require_operators2();
    var {
      codes: { ERR_ILLEGAL_CONSTRUCTOR },
    } = require_errors2();
    var compose = require_compose2();
    var { pipeline } = require_pipeline2();
    var { destroyer } = require_destroy2();
    var eos = require_end_of_stream3();
    var promises = require_promises2();
    var utils = require_utils2();
    var Stream = (module2.exports = require_legacy2().Stream);
    Stream.isDisturbed = utils.isDisturbed;
    Stream.isErrored = utils.isErrored;
    Stream.isReadable = utils.isReadable;
    Stream.Readable = require_readable2();
    for (const key of ObjectKeys(streamReturningOperators)) {
      let fn2 = function (...args) {
        if (new.target) {
          throw ERR_ILLEGAL_CONSTRUCTOR();
        }
        return Stream.Readable.from(ReflectApply(op, this, args));
      };
      fn = fn2;
      const op = streamReturningOperators[key];
      ObjectDefineProperty(fn2, 'name', {
        __proto__: null,
        value: op.name,
      });
      ObjectDefineProperty(fn2, 'length', {
        __proto__: null,
        value: op.length,
      });
      ObjectDefineProperty(Stream.Readable.prototype, key, {
        __proto__: null,
        value: fn2,
        enumerable: false,
        configurable: true,
        writable: true,
      });
    }
    var fn;
    for (const key of ObjectKeys(promiseReturningOperators)) {
      let fn2 = function (...args) {
        if (new.target) {
          throw ERR_ILLEGAL_CONSTRUCTOR();
        }
        return ReflectApply(op, this, args);
      };
      fn = fn2;
      const op = promiseReturningOperators[key];
      ObjectDefineProperty(fn2, 'name', {
        __proto__: null,
        value: op.name,
      });
      ObjectDefineProperty(fn2, 'length', {
        __proto__: null,
        value: op.length,
      });
      ObjectDefineProperty(Stream.Readable.prototype, key, {
        __proto__: null,
        value: fn2,
        enumerable: false,
        configurable: true,
        writable: true,
      });
    }
    var fn;
    Stream.Writable = require_writable2();
    Stream.Duplex = require_duplex2();
    Stream.Transform = require_transform2();
    Stream.PassThrough = require_passthrough2();
    Stream.pipeline = pipeline;
    var { addAbortSignal } = require_add_abort_signal2();
    Stream.addAbortSignal = addAbortSignal;
    Stream.finished = eos;
    Stream.destroy = destroyer;
    Stream.compose = compose;
    ObjectDefineProperty(Stream, 'promises', {
      __proto__: null,
      configurable: true,
      enumerable: true,
      get() {
        return promises;
      },
    });
    ObjectDefineProperty(pipeline, customPromisify, {
      __proto__: null,
      enumerable: true,
      get() {
        return promises.pipeline;
      },
    });
    ObjectDefineProperty(eos, customPromisify, {
      __proto__: null,
      enumerable: true,
      get() {
        return promises.finished;
      },
    });
    Stream.Stream = Stream;
    Stream._isUint8Array = function isUint8Array(value) {
      return value instanceof Uint8Array;
    };
    Stream._uint8ArrayToBuffer = function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/ours/index.js
var require_ours2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/ours/index.js'(exports2, module2) {
    'use strict';
    var Stream = require('stream');
    if (Stream && process.env.READABLE_STREAM === 'disable') {
      const promises = Stream.promises;
      module2.exports._uint8ArrayToBuffer = Stream._uint8ArrayToBuffer;
      module2.exports._isUint8Array = Stream._isUint8Array;
      module2.exports.isDisturbed = Stream.isDisturbed;
      module2.exports.isErrored = Stream.isErrored;
      module2.exports.isReadable = Stream.isReadable;
      module2.exports.Readable = Stream.Readable;
      module2.exports.Writable = Stream.Writable;
      module2.exports.Duplex = Stream.Duplex;
      module2.exports.Transform = Stream.Transform;
      module2.exports.PassThrough = Stream.PassThrough;
      module2.exports.addAbortSignal = Stream.addAbortSignal;
      module2.exports.finished = Stream.finished;
      module2.exports.destroy = Stream.destroy;
      module2.exports.pipeline = Stream.pipeline;
      module2.exports.compose = Stream.compose;
      Object.defineProperty(Stream, 'promises', {
        configurable: true,
        enumerable: true,
        get() {
          return promises;
        },
      });
      module2.exports.Stream = Stream.Stream;
    } else {
      const CustomStream = require_stream2();
      const promises = require_promises2();
      const originalDestroy = CustomStream.Readable.destroy;
      module2.exports = CustomStream.Readable;
      module2.exports._uint8ArrayToBuffer = CustomStream._uint8ArrayToBuffer;
      module2.exports._isUint8Array = CustomStream._isUint8Array;
      module2.exports.isDisturbed = CustomStream.isDisturbed;
      module2.exports.isErrored = CustomStream.isErrored;
      module2.exports.isReadable = CustomStream.isReadable;
      module2.exports.Readable = CustomStream.Readable;
      module2.exports.Writable = CustomStream.Writable;
      module2.exports.Duplex = CustomStream.Duplex;
      module2.exports.Transform = CustomStream.Transform;
      module2.exports.PassThrough = CustomStream.PassThrough;
      module2.exports.addAbortSignal = CustomStream.addAbortSignal;
      module2.exports.finished = CustomStream.finished;
      module2.exports.destroy = CustomStream.destroy;
      module2.exports.destroy = originalDestroy;
      module2.exports.pipeline = CustomStream.pipeline;
      module2.exports.compose = CustomStream.compose;
      Object.defineProperty(CustomStream, 'promises', {
        configurable: true,
        enumerable: true,
        get() {
          return promises;
        },
      });
      module2.exports.Stream = CustomStream.Stream;
    }
    module2.exports.default = module2.exports;
  },
});

// node_modules/pino-abstract-transport/index.js
var require_pino_abstract_transport = __commonJS({
  'node_modules/pino-abstract-transport/index.js'(exports2, module2) {
    'use strict';
    var metadata = Symbol.for('pino.metadata');
    var split = require_split2();
    var { Duplex } = require_ours2();
    module2.exports = function build2(fn, opts = {}) {
      const parseLines = opts.parse === 'lines';
      const parseLine = typeof opts.parseLine === 'function' ? opts.parseLine : JSON.parse;
      const close = opts.close || defaultClose;
      const stream = split(
        function (line) {
          let value;
          try {
            value = parseLine(line);
          } catch (error) {
            this.emit('unknown', line, error);
            return;
          }
          if (value === null) {
            this.emit('unknown', line, 'Null value ignored');
            return;
          }
          if (typeof value !== 'object') {
            value = {
              data: value,
              time: Date.now(),
            };
          }
          if (stream[metadata]) {
            stream.lastTime = value.time;
            stream.lastLevel = value.level;
            stream.lastObj = value;
          }
          if (parseLines) {
            return line;
          }
          return value;
        },
        { autoDestroy: true }
      );
      stream._destroy = function (err, cb) {
        const promise = close(err, cb);
        if (promise && typeof promise.then === 'function') {
          promise.then(cb, cb);
        }
      };
      if (opts.metadata !== false) {
        stream[metadata] = true;
        stream.lastTime = 0;
        stream.lastLevel = 0;
        stream.lastObj = null;
      }
      let res = fn(stream);
      if (res && typeof res.catch === 'function') {
        res.catch((err) => {
          stream.destroy(err);
        });
        res = null;
      } else if (opts.enablePipelining && res) {
        return Duplex.from({ writable: stream, readable: res, objectMode: true });
      }
      return stream;
    };
    function defaultClose(err, cb) {
      process.nextTick(cb, err);
    }
  },
});

// node_modules/pino-pretty/lib/constants.js
var require_constants = __commonJS({
  'node_modules/pino-pretty/lib/constants.js'(exports2, module2) {
    'use strict';
    module2.exports = {
      DATE_FORMAT: 'yyyy-mm-dd HH:MM:ss.l o',
      DATE_FORMAT_SIMPLE: 'HH:MM:ss.l',
      /**
       * @type {K_ERROR_LIKE_KEYS}
       */
      ERROR_LIKE_KEYS: ['err', 'error'],
      MESSAGE_KEY: 'msg',
      LEVEL_KEY: 'level',
      LEVEL_LABEL: 'levelLabel',
      TIMESTAMP_KEY: 'time',
      LEVELS: {
        default: 'USERLVL',
        60: 'FATAL',
        50: 'ERROR',
        40: 'WARN',
        30: 'INFO',
        20: 'DEBUG',
        10: 'TRACE',
      },
      LEVEL_NAMES: {
        fatal: 60,
        error: 50,
        warn: 40,
        info: 30,
        debug: 20,
        trace: 10,
      },
      // Object keys that probably came from a logger like Pino or Bunyan.
      LOGGER_KEYS: ['pid', 'hostname', 'name', 'level', 'time', 'timestamp', 'caller'],
    };
  },
});

// node_modules/pino-pretty/lib/colors.js
var require_colors = __commonJS({
  'node_modules/pino-pretty/lib/colors.js'(exports2, module2) {
    'use strict';
    var { LEVELS, LEVEL_NAMES } = require_constants();
    var nocolor = (input) => input;
    var plain = {
      default: nocolor,
      60: nocolor,
      50: nocolor,
      40: nocolor,
      30: nocolor,
      20: nocolor,
      10: nocolor,
      message: nocolor,
      greyMessage: nocolor,
    };
    var { createColors } = require_colorette();
    var availableColors = createColors({ useColor: true });
    var { white, bgRed, red, yellow, green, blue, gray, cyan } = availableColors;
    var colored = {
      default: white,
      60: bgRed,
      50: red,
      40: yellow,
      30: green,
      20: blue,
      10: gray,
      message: cyan,
      greyMessage: gray,
    };
    function resolveCustomColoredColorizer(customColors) {
      return customColors.reduce(
        function (agg, [level, color]) {
          agg[level] = typeof availableColors[color] === 'function' ? availableColors[color] : white;
          return agg;
        },
        { default: white, message: cyan, greyMessage: gray }
      );
    }
    function colorizeLevel(useOnlyCustomProps) {
      return function (level, colorizer, { customLevels, customLevelNames } = {}) {
        const levels = useOnlyCustomProps ? customLevels || LEVELS : Object.assign({}, LEVELS, customLevels);
        const levelNames = useOnlyCustomProps
          ? customLevelNames || LEVEL_NAMES
          : Object.assign({}, LEVEL_NAMES, customLevelNames);
        let levelNum = 'default';
        if (Number.isInteger(+level)) {
          levelNum = Object.prototype.hasOwnProperty.call(levels, level) ? level : levelNum;
        } else {
          levelNum = Object.prototype.hasOwnProperty.call(levelNames, level.toLowerCase())
            ? levelNames[level.toLowerCase()]
            : levelNum;
        }
        const levelStr = levels[levelNum];
        return Object.prototype.hasOwnProperty.call(colorizer, levelNum)
          ? colorizer[levelNum](levelStr)
          : colorizer.default(levelStr);
      };
    }
    function plainColorizer(useOnlyCustomProps) {
      const newPlainColorizer = colorizeLevel(useOnlyCustomProps);
      const customColoredColorizer = function (level, opts) {
        return newPlainColorizer(level, plain, opts);
      };
      customColoredColorizer.message = plain.message;
      customColoredColorizer.greyMessage = plain.greyMessage;
      return customColoredColorizer;
    }
    function coloredColorizer(useOnlyCustomProps) {
      const newColoredColorizer = colorizeLevel(useOnlyCustomProps);
      const customColoredColorizer = function (level, opts) {
        return newColoredColorizer(level, colored, opts);
      };
      customColoredColorizer.message = colored.message;
      customColoredColorizer.greyMessage = colored.greyMessage;
      return customColoredColorizer;
    }
    function customColoredColorizerFactory(customColors, useOnlyCustomProps) {
      const onlyCustomColored = resolveCustomColoredColorizer(customColors);
      const customColored = useOnlyCustomProps ? onlyCustomColored : Object.assign({}, colored, onlyCustomColored);
      const colorizeLevelCustom = colorizeLevel(useOnlyCustomProps);
      const customColoredColorizer = function (level, opts) {
        return colorizeLevelCustom(level, customColored, opts);
      };
      customColoredColorizer.message = customColoredColorizer.message || customColored.message;
      customColoredColorizer.greyMessage = customColoredColorizer.greyMessage || customColored.greyMessage;
      return customColoredColorizer;
    }
    module2.exports = function getColorizer(useColors = false, customColors, useOnlyCustomProps) {
      if (useColors && customColors !== void 0) {
        return customColoredColorizerFactory(customColors, useOnlyCustomProps);
      } else if (useColors) {
        return coloredColorizer(useOnlyCustomProps);
      }
      return plainColorizer(useOnlyCustomProps);
    };
  },
});

// node_modules/atomic-sleep/index.js
var require_atomic_sleep = __commonJS({
  'node_modules/atomic-sleep/index.js'(exports2, module2) {
    'use strict';
    if (typeof SharedArrayBuffer !== 'undefined' && typeof Atomics !== 'undefined') {
      let sleep = function (ms) {
        const valid = ms > 0 && ms < Infinity;
        if (valid === false) {
          if (typeof ms !== 'number' && typeof ms !== 'bigint') {
            throw TypeError('sleep: ms must be a number');
          }
          throw RangeError('sleep: ms must be a number that is greater than 0 but less than Infinity');
        }
        Atomics.wait(nil, 0, 0, Number(ms));
      };
      const nil = new Int32Array(new SharedArrayBuffer(4));
      module2.exports = sleep;
    } else {
      let sleep = function (ms) {
        const valid = ms > 0 && ms < Infinity;
        if (valid === false) {
          if (typeof ms !== 'number' && typeof ms !== 'bigint') {
            throw TypeError('sleep: ms must be a number');
          }
          throw RangeError('sleep: ms must be a number that is greater than 0 but less than Infinity');
        }
        const target = Date.now() + Number(ms);
        while (target > Date.now()) {}
      };
      module2.exports = sleep;
    }
  },
});

// node_modules/sonic-boom/index.js
var require_sonic_boom = __commonJS({
  'node_modules/sonic-boom/index.js'(exports2, module2) {
    'use strict';
    var fs = require('fs');
    var EventEmitter = require('events');
    var inherits = require('util').inherits;
    var path = require('path');
    var sleep = require_atomic_sleep();
    var BUSY_WRITE_TIMEOUT = 100;
    var kEmptyBuffer = Buffer.allocUnsafe(0);
    var MAX_WRITE = 16 * 1024;
    var kContentModeBuffer = 'buffer';
    var kContentModeUtf8 = 'utf8';
    function openFile(file, sonic) {
      sonic._opening = true;
      sonic._writing = true;
      sonic._asyncDrainScheduled = false;
      function fileOpened(err, fd) {
        if (err) {
          sonic._reopening = false;
          sonic._writing = false;
          sonic._opening = false;
          if (sonic.sync) {
            process.nextTick(() => {
              if (sonic.listenerCount('error') > 0) {
                sonic.emit('error', err);
              }
            });
          } else {
            sonic.emit('error', err);
          }
          return;
        }
        sonic.fd = fd;
        sonic.file = file;
        sonic._reopening = false;
        sonic._opening = false;
        sonic._writing = false;
        if (sonic.sync) {
          process.nextTick(() => sonic.emit('ready'));
        } else {
          sonic.emit('ready');
        }
        if (sonic._reopening || sonic.destroyed) {
          return;
        }
        if ((!sonic._writing && sonic._len > sonic.minLength) || sonic._flushPending) {
          sonic._actualWrite();
        }
      }
      const flags = sonic.append ? 'a' : 'w';
      const mode = sonic.mode;
      if (sonic.sync) {
        try {
          if (sonic.mkdir) fs.mkdirSync(path.dirname(file), { recursive: true });
          const fd = fs.openSync(file, flags, mode);
          fileOpened(null, fd);
        } catch (err) {
          fileOpened(err);
          throw err;
        }
      } else if (sonic.mkdir) {
        fs.mkdir(path.dirname(file), { recursive: true }, (err) => {
          if (err) return fileOpened(err);
          fs.open(file, flags, mode, fileOpened);
        });
      } else {
        fs.open(file, flags, mode, fileOpened);
      }
    }
    function SonicBoom(opts) {
      if (!(this instanceof SonicBoom)) {
        return new SonicBoom(opts);
      }
      let {
        fd,
        dest,
        minLength,
        maxLength,
        maxWrite,
        sync,
        append = true,
        mkdir,
        retryEAGAIN,
        fsync,
        contentMode,
        mode,
      } = opts || {};
      fd = fd || dest;
      this._len = 0;
      this.fd = -1;
      this._bufs = [];
      this._lens = [];
      this._writing = false;
      this._ending = false;
      this._reopening = false;
      this._asyncDrainScheduled = false;
      this._flushPending = false;
      this._hwm = Math.max(minLength || 0, 16387);
      this.file = null;
      this.destroyed = false;
      this.minLength = minLength || 0;
      this.maxLength = maxLength || 0;
      this.maxWrite = maxWrite || MAX_WRITE;
      this.sync = sync || false;
      this.writable = true;
      this._fsync = fsync || false;
      this.append = append || false;
      this.mode = mode;
      this.retryEAGAIN = retryEAGAIN || (() => true);
      this.mkdir = mkdir || false;
      let fsWriteSync;
      let fsWrite;
      if (contentMode === kContentModeBuffer) {
        this._writingBuf = kEmptyBuffer;
        this.write = writeBuffer;
        this.flush = flushBuffer;
        this.flushSync = flushBufferSync;
        this._actualWrite = actualWriteBuffer;
        fsWriteSync = () => fs.writeSync(this.fd, this._writingBuf);
        fsWrite = () => fs.write(this.fd, this._writingBuf, this.release);
      } else if (contentMode === void 0 || contentMode === kContentModeUtf8) {
        this._writingBuf = '';
        this.write = write;
        this.flush = flush;
        this.flushSync = flushSync;
        this._actualWrite = actualWrite;
        fsWriteSync = () => fs.writeSync(this.fd, this._writingBuf, 'utf8');
        fsWrite = () => fs.write(this.fd, this._writingBuf, 'utf8', this.release);
      } else {
        throw new Error(
          `SonicBoom supports "${kContentModeUtf8}" and "${kContentModeBuffer}", but passed ${contentMode}`
        );
      }
      if (typeof fd === 'number') {
        this.fd = fd;
        process.nextTick(() => this.emit('ready'));
      } else if (typeof fd === 'string') {
        openFile(fd, this);
      } else {
        throw new Error('SonicBoom supports only file descriptors and files');
      }
      if (this.minLength >= this.maxWrite) {
        throw new Error(`minLength should be smaller than maxWrite (${this.maxWrite})`);
      }
      this.release = (err, n) => {
        if (err) {
          if (
            (err.code === 'EAGAIN' || err.code === 'EBUSY') &&
            this.retryEAGAIN(err, this._writingBuf.length, this._len - this._writingBuf.length)
          ) {
            if (this.sync) {
              try {
                sleep(BUSY_WRITE_TIMEOUT);
                this.release(void 0, 0);
              } catch (err2) {
                this.release(err2);
              }
            } else {
              setTimeout(fsWrite, BUSY_WRITE_TIMEOUT);
            }
          } else {
            this._writing = false;
            this.emit('error', err);
          }
          return;
        }
        this.emit('write', n);
        this._len -= n;
        if (this._len < 0) {
          this._len = 0;
        }
        this._writingBuf = this._writingBuf.slice(n);
        if (this._writingBuf.length) {
          if (!this.sync) {
            fsWrite();
            return;
          }
          try {
            do {
              const n2 = fsWriteSync();
              this._len -= n2;
              this._writingBuf = this._writingBuf.slice(n2);
            } while (this._writingBuf.length);
          } catch (err2) {
            this.release(err2);
            return;
          }
        }
        if (this._fsync) {
          fs.fsyncSync(this.fd);
        }
        const len = this._len;
        if (this._reopening) {
          this._writing = false;
          this._reopening = false;
          this.reopen();
        } else if (len > this.minLength) {
          this._actualWrite();
        } else if (this._ending) {
          if (len > 0) {
            this._actualWrite();
          } else {
            this._writing = false;
            actualClose(this);
          }
        } else {
          this._writing = false;
          if (this.sync) {
            if (!this._asyncDrainScheduled) {
              this._asyncDrainScheduled = true;
              process.nextTick(emitDrain, this);
            }
          } else {
            this.emit('drain');
          }
        }
      };
      this.on('newListener', function (name) {
        if (name === 'drain') {
          this._asyncDrainScheduled = false;
        }
      });
    }
    function emitDrain(sonic) {
      const hasListeners = sonic.listenerCount('drain') > 0;
      if (!hasListeners) return;
      sonic._asyncDrainScheduled = false;
      sonic.emit('drain');
    }
    inherits(SonicBoom, EventEmitter);
    function mergeBuf(bufs, len) {
      if (bufs.length === 0) {
        return kEmptyBuffer;
      }
      if (bufs.length === 1) {
        return bufs[0];
      }
      return Buffer.concat(bufs, len);
    }
    function write(data) {
      if (this.destroyed) {
        throw new Error('SonicBoom destroyed');
      }
      const len = this._len + data.length;
      const bufs = this._bufs;
      if (this.maxLength && len > this.maxLength) {
        this.emit('drop', data);
        return this._len < this._hwm;
      }
      if (bufs.length === 0 || bufs[bufs.length - 1].length + data.length > this.maxWrite) {
        bufs.push('' + data);
      } else {
        bufs[bufs.length - 1] += data;
      }
      this._len = len;
      if (!this._writing && this._len >= this.minLength) {
        this._actualWrite();
      }
      return this._len < this._hwm;
    }
    function writeBuffer(data) {
      if (this.destroyed) {
        throw new Error('SonicBoom destroyed');
      }
      const len = this._len + data.length;
      const bufs = this._bufs;
      const lens = this._lens;
      if (this.maxLength && len > this.maxLength) {
        this.emit('drop', data);
        return this._len < this._hwm;
      }
      if (bufs.length === 0 || lens[lens.length - 1] + data.length > this.maxWrite) {
        bufs.push([data]);
        lens.push(data.length);
      } else {
        bufs[bufs.length - 1].push(data);
        lens[lens.length - 1] += data.length;
      }
      this._len = len;
      if (!this._writing && this._len >= this.minLength) {
        this._actualWrite();
      }
      return this._len < this._hwm;
    }
    function callFlushCallbackOnDrain(cb) {
      this._flushPending = true;
      const onDrain = () => {
        if (!this._fsync) {
          fs.fsync(this.fd, (err) => {
            this._flushPending = false;
            cb(err);
          });
        } else {
          this._flushPending = false;
          cb();
        }
        this.off('error', onError);
      };
      const onError = (err) => {
        this._flushPending = false;
        cb(err);
        this.off('drain', onDrain);
      };
      this.once('drain', onDrain);
      this.once('error', onError);
    }
    function flush(cb) {
      if (cb != null && typeof cb !== 'function') {
        throw new Error('flush cb must be a function');
      }
      if (this.destroyed) {
        const error = new Error('SonicBoom destroyed');
        if (cb) {
          cb(error);
          return;
        }
        throw error;
      }
      if (this.minLength <= 0) {
        cb?.();
        return;
      }
      if (cb) {
        callFlushCallbackOnDrain.call(this, cb);
      }
      if (this._writing) {
        return;
      }
      if (this._bufs.length === 0) {
        this._bufs.push('');
      }
      this._actualWrite();
    }
    function flushBuffer(cb) {
      if (cb != null && typeof cb !== 'function') {
        throw new Error('flush cb must be a function');
      }
      if (this.destroyed) {
        const error = new Error('SonicBoom destroyed');
        if (cb) {
          cb(error);
          return;
        }
        throw error;
      }
      if (this.minLength <= 0) {
        cb?.();
        return;
      }
      if (cb) {
        callFlushCallbackOnDrain.call(this, cb);
      }
      if (this._writing) {
        return;
      }
      if (this._bufs.length === 0) {
        this._bufs.push([]);
        this._lens.push(0);
      }
      this._actualWrite();
    }
    SonicBoom.prototype.reopen = function (file) {
      if (this.destroyed) {
        throw new Error('SonicBoom destroyed');
      }
      if (this._opening) {
        this.once('ready', () => {
          this.reopen(file);
        });
        return;
      }
      if (this._ending) {
        return;
      }
      if (!this.file) {
        throw new Error('Unable to reopen a file descriptor, you must pass a file to SonicBoom');
      }
      this._reopening = true;
      if (this._writing) {
        return;
      }
      const fd = this.fd;
      this.once('ready', () => {
        if (fd !== this.fd) {
          fs.close(fd, (err) => {
            if (err) {
              return this.emit('error', err);
            }
          });
        }
      });
      openFile(file || this.file, this);
    };
    SonicBoom.prototype.end = function () {
      if (this.destroyed) {
        throw new Error('SonicBoom destroyed');
      }
      if (this._opening) {
        this.once('ready', () => {
          this.end();
        });
        return;
      }
      if (this._ending) {
        return;
      }
      this._ending = true;
      if (this._writing) {
        return;
      }
      if (this._len > 0 && this.fd >= 0) {
        this._actualWrite();
      } else {
        actualClose(this);
      }
    };
    function flushSync() {
      if (this.destroyed) {
        throw new Error('SonicBoom destroyed');
      }
      if (this.fd < 0) {
        throw new Error('sonic boom is not ready yet');
      }
      if (!this._writing && this._writingBuf.length > 0) {
        this._bufs.unshift(this._writingBuf);
        this._writingBuf = '';
      }
      let buf = '';
      while (this._bufs.length || buf) {
        if (buf.length <= 0) {
          buf = this._bufs[0];
        }
        try {
          const n = fs.writeSync(this.fd, buf, 'utf8');
          buf = buf.slice(n);
          this._len = Math.max(this._len - n, 0);
          if (buf.length <= 0) {
            this._bufs.shift();
          }
        } catch (err) {
          const shouldRetry = err.code === 'EAGAIN' || err.code === 'EBUSY';
          if (shouldRetry && !this.retryEAGAIN(err, buf.length, this._len - buf.length)) {
            throw err;
          }
          sleep(BUSY_WRITE_TIMEOUT);
        }
      }
      try {
        fs.fsyncSync(this.fd);
      } catch {}
    }
    function flushBufferSync() {
      if (this.destroyed) {
        throw new Error('SonicBoom destroyed');
      }
      if (this.fd < 0) {
        throw new Error('sonic boom is not ready yet');
      }
      if (!this._writing && this._writingBuf.length > 0) {
        this._bufs.unshift([this._writingBuf]);
        this._writingBuf = kEmptyBuffer;
      }
      let buf = kEmptyBuffer;
      while (this._bufs.length || buf.length) {
        if (buf.length <= 0) {
          buf = mergeBuf(this._bufs[0], this._lens[0]);
        }
        try {
          const n = fs.writeSync(this.fd, buf);
          buf = buf.subarray(n);
          this._len = Math.max(this._len - n, 0);
          if (buf.length <= 0) {
            this._bufs.shift();
            this._lens.shift();
          }
        } catch (err) {
          const shouldRetry = err.code === 'EAGAIN' || err.code === 'EBUSY';
          if (shouldRetry && !this.retryEAGAIN(err, buf.length, this._len - buf.length)) {
            throw err;
          }
          sleep(BUSY_WRITE_TIMEOUT);
        }
      }
    }
    SonicBoom.prototype.destroy = function () {
      if (this.destroyed) {
        return;
      }
      actualClose(this);
    };
    function actualWrite() {
      const release = this.release;
      this._writing = true;
      this._writingBuf = this._writingBuf || this._bufs.shift() || '';
      if (this.sync) {
        try {
          const written = fs.writeSync(this.fd, this._writingBuf, 'utf8');
          release(null, written);
        } catch (err) {
          release(err);
        }
      } else {
        fs.write(this.fd, this._writingBuf, 'utf8', release);
      }
    }
    function actualWriteBuffer() {
      const release = this.release;
      this._writing = true;
      this._writingBuf = this._writingBuf.length ? this._writingBuf : mergeBuf(this._bufs.shift(), this._lens.shift());
      if (this.sync) {
        try {
          const written = fs.writeSync(this.fd, this._writingBuf);
          release(null, written);
        } catch (err) {
          release(err);
        }
      } else {
        fs.write(this.fd, this._writingBuf, release);
      }
    }
    function actualClose(sonic) {
      if (sonic.fd === -1) {
        sonic.once('ready', actualClose.bind(null, sonic));
        return;
      }
      sonic.destroyed = true;
      sonic._bufs = [];
      sonic._lens = [];
      fs.fsync(sonic.fd, closeWrapped);
      function closeWrapped() {
        if (sonic.fd !== 1 && sonic.fd !== 2) {
          fs.close(sonic.fd, done);
        } else {
          done();
        }
      }
      function done(err) {
        if (err) {
          sonic.emit('error', err);
          return;
        }
        if (sonic._ending && !sonic._writing) {
          sonic.emit('finish');
        }
        sonic.emit('close');
      }
    }
    SonicBoom.SonicBoom = SonicBoom;
    SonicBoom.default = SonicBoom;
    module2.exports = SonicBoom;
  },
});

// node_modules/pino-pretty/lib/utils/noop.js
var require_noop = __commonJS({
  'node_modules/pino-pretty/lib/utils/noop.js'(exports2, module2) {
    'use strict';
    module2.exports = function noop() {};
  },
});

// node_modules/on-exit-leak-free/index.js
var require_on_exit_leak_free = __commonJS({
  'node_modules/on-exit-leak-free/index.js'(exports2, module2) {
    'use strict';
    var refs = {
      exit: [],
      beforeExit: [],
    };
    var functions = {
      exit: onExit,
      beforeExit: onBeforeExit,
    };
    var registry = new FinalizationRegistry(clear);
    function install(event) {
      if (refs[event].length > 0) {
        return;
      }
      process.on(event, functions[event]);
    }
    function uninstall(event) {
      if (refs[event].length > 0) {
        return;
      }
      process.removeListener(event, functions[event]);
    }
    function onExit() {
      callRefs('exit');
    }
    function onBeforeExit() {
      callRefs('beforeExit');
    }
    function callRefs(event) {
      for (const ref of refs[event]) {
        const obj = ref.deref();
        const fn = ref.fn;
        if (obj !== void 0) {
          fn(obj, event);
        }
      }
    }
    function clear(ref) {
      for (const event of ['exit', 'beforeExit']) {
        const index = refs[event].indexOf(ref);
        refs[event].splice(index, index + 1);
        uninstall(event);
      }
    }
    function _register(event, obj, fn) {
      if (obj === void 0) {
        throw new Error("the object can't be undefined");
      }
      install(event);
      const ref = new WeakRef(obj);
      ref.fn = fn;
      registry.register(obj, ref);
      refs[event].push(ref);
    }
    function register(obj, fn) {
      _register('exit', obj, fn);
    }
    function registerBeforeExit(obj, fn) {
      _register('beforeExit', obj, fn);
    }
    function unregister(obj) {
      registry.unregister(obj);
      for (const event of ['exit', 'beforeExit']) {
        refs[event] = refs[event].filter((ref) => {
          const _obj = ref.deref();
          return _obj && _obj !== obj;
        });
        uninstall(event);
      }
    }
    module2.exports = {
      register,
      registerBeforeExit,
      unregister,
    };
  },
});

// node_modules/pino-pretty/lib/utils/build-safe-sonic-boom.js
var require_build_safe_sonic_boom = __commonJS({
  'node_modules/pino-pretty/lib/utils/build-safe-sonic-boom.js'(exports2, module2) {
    'use strict';
    module2.exports = buildSafeSonicBoom2;
    var { isMainThread } = require('worker_threads');
    var SonicBoom = require_sonic_boom();
    var noop = require_noop();
    function buildSafeSonicBoom2(opts) {
      const stream = new SonicBoom(opts);
      stream.on('error', filterBrokenPipe);
      if (!process.env.NODE_V8_COVERAGE && !opts.sync && isMainThread) {
        setupOnExit(stream);
      }
      return stream;
      function filterBrokenPipe(err) {
        if (err.code === 'EPIPE') {
          stream.write = noop;
          stream.end = noop;
          stream.flushSync = noop;
          stream.destroy = noop;
          return;
        }
        stream.removeListener('error', filterBrokenPipe);
      }
    }
    function setupOnExit(stream) {
      if (global.WeakRef && global.WeakMap && global.FinalizationRegistry) {
        const onExit = require_on_exit_leak_free();
        onExit.register(stream, autoEnd);
        stream.on('close', function () {
          onExit.unregister(stream);
        });
      }
    }
    function autoEnd(stream, eventName) {
      if (stream.destroyed) {
        return;
      }
      if (eventName === 'beforeExit') {
        stream.flush();
        stream.on('drain', function () {
          stream.end();
        });
      } else {
        stream.flushSync();
      }
    }
  },
});

// node_modules/pino-pretty/lib/utils/is-valid-date.js
var require_is_valid_date = __commonJS({
  'node_modules/pino-pretty/lib/utils/is-valid-date.js'(exports2, module2) {
    'use strict';
    module2.exports = isValidDate;
    function isValidDate(date) {
      return date instanceof Date && !Number.isNaN(date.getTime());
    }
  },
});

// node_modules/pino-pretty/lib/utils/create-date.js
var require_create_date = __commonJS({
  'node_modules/pino-pretty/lib/utils/create-date.js'(exports2, module2) {
    'use strict';
    module2.exports = createDate;
    var isValidDate = require_is_valid_date();
    function createDate(epoch) {
      let date = new Date(epoch);
      if (isValidDate(date)) {
        return date;
      }
      date = /* @__PURE__ */ new Date(+epoch);
      return date;
    }
  },
});

// node_modules/pino-pretty/lib/utils/split-property-key.js
var require_split_property_key = __commonJS({
  'node_modules/pino-pretty/lib/utils/split-property-key.js'(exports2, module2) {
    'use strict';
    module2.exports = splitPropertyKey;
    function splitPropertyKey(key) {
      const result = [];
      let backslash = false;
      let segment = '';
      for (let i = 0; i < key.length; i++) {
        const c = key.charAt(i);
        if (c === '\\') {
          backslash = true;
          continue;
        }
        if (backslash) {
          backslash = false;
          segment += c;
          continue;
        }
        if (c === '.') {
          result.push(segment);
          segment = '';
          continue;
        }
        segment += c;
      }
      if (segment.length) {
        result.push(segment);
      }
      return result;
    }
  },
});

// node_modules/pino-pretty/lib/utils/get-property-value.js
var require_get_property_value = __commonJS({
  'node_modules/pino-pretty/lib/utils/get-property-value.js'(exports2, module2) {
    'use strict';
    module2.exports = getPropertyValue;
    var splitPropertyKey = require_split_property_key();
    function getPropertyValue(obj, property) {
      const props = Array.isArray(property) ? property : splitPropertyKey(property);
      for (const prop of props) {
        if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
          return;
        }
        obj = obj[prop];
      }
      return obj;
    }
  },
});

// node_modules/pino-pretty/lib/utils/delete-log-property.js
var require_delete_log_property = __commonJS({
  'node_modules/pino-pretty/lib/utils/delete-log-property.js'(exports2, module2) {
    'use strict';
    module2.exports = deleteLogProperty;
    var getPropertyValue = require_get_property_value();
    var splitPropertyKey = require_split_property_key();
    function deleteLogProperty(log, property) {
      const props = splitPropertyKey(property);
      const propToDelete = props.pop();
      log = getPropertyValue(log, props);
      if (log !== null && typeof log === 'object' && Object.prototype.hasOwnProperty.call(log, propToDelete)) {
        delete log[propToDelete];
      }
    }
  },
});

// node_modules/fast-copy/dist/cjs/index.cjs
var require_cjs = __commonJS({
  'node_modules/fast-copy/dist/cjs/index.cjs'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    var toStringFunction = Function.prototype.toString;
    var create = Object.create;
    var toStringObject = Object.prototype.toString;
    var LegacyCache =
      /** @class */
      (function () {
        function LegacyCache2() {
          this._keys = [];
          this._values = [];
        }
        LegacyCache2.prototype.has = function (key) {
          return !!~this._keys.indexOf(key);
        };
        LegacyCache2.prototype.get = function (key) {
          return this._values[this._keys.indexOf(key)];
        };
        LegacyCache2.prototype.set = function (key, value) {
          this._keys.push(key);
          this._values.push(value);
        };
        return LegacyCache2;
      })();
    function createCacheLegacy() {
      return new LegacyCache();
    }
    function createCacheModern() {
      return /* @__PURE__ */ new WeakMap();
    }
    var createCache = typeof WeakMap !== 'undefined' ? createCacheModern : createCacheLegacy;
    function getCleanClone(prototype) {
      if (!prototype) {
        return create(null);
      }
      var Constructor = prototype.constructor;
      if (Constructor === Object) {
        return prototype === Object.prototype ? {} : create(prototype);
      }
      if (~toStringFunction.call(Constructor).indexOf('[native code]')) {
        try {
          return new Constructor();
        } catch (_a2) {}
      }
      return create(prototype);
    }
    function getRegExpFlagsLegacy(regExp) {
      var flags = '';
      if (regExp.global) {
        flags += 'g';
      }
      if (regExp.ignoreCase) {
        flags += 'i';
      }
      if (regExp.multiline) {
        flags += 'm';
      }
      if (regExp.unicode) {
        flags += 'u';
      }
      if (regExp.sticky) {
        flags += 'y';
      }
      return flags;
    }
    function getRegExpFlagsModern(regExp) {
      return regExp.flags;
    }
    var getRegExpFlags = /test/g.flags === 'g' ? getRegExpFlagsModern : getRegExpFlagsLegacy;
    function getTagLegacy(value) {
      var type = toStringObject.call(value);
      return type.substring(8, type.length - 1);
    }
    function getTagModern(value) {
      return value[Symbol.toStringTag] || getTagLegacy(value);
    }
    var getTag = typeof Symbol !== 'undefined' ? getTagModern : getTagLegacy;
    var defineProperty = Object.defineProperty;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var getOwnPropertyNames = Object.getOwnPropertyNames;
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var _a = Object.prototype;
    var hasOwnProperty = _a.hasOwnProperty;
    var propertyIsEnumerable = _a.propertyIsEnumerable;
    var SUPPORTS_SYMBOL = typeof getOwnPropertySymbols === 'function';
    function getStrictPropertiesModern(object) {
      return getOwnPropertyNames(object).concat(getOwnPropertySymbols(object));
    }
    var getStrictProperties = SUPPORTS_SYMBOL ? getStrictPropertiesModern : getOwnPropertyNames;
    function copyOwnPropertiesStrict(value, clone, state) {
      var properties = getStrictProperties(value);
      for (
        var index2 = 0, length_1 = properties.length, property = void 0, descriptor = void 0;
        index2 < length_1;
        ++index2
      ) {
        property = properties[index2];
        if (property === 'callee' || property === 'caller') {
          continue;
        }
        descriptor = getOwnPropertyDescriptor(value, property);
        if (!descriptor) {
          clone[property] = state.copier(value[property], state);
          continue;
        }
        if (!descriptor.get && !descriptor.set) {
          descriptor.value = state.copier(descriptor.value, state);
        }
        try {
          defineProperty(clone, property, descriptor);
        } catch (error) {
          clone[property] = descriptor.value;
        }
      }
      return clone;
    }
    function copyArrayLoose(array, state) {
      var clone = new state.Constructor();
      state.cache.set(array, clone);
      for (var index2 = 0, length_2 = array.length; index2 < length_2; ++index2) {
        clone[index2] = state.copier(array[index2], state);
      }
      return clone;
    }
    function copyArrayStrict(array, state) {
      var clone = new state.Constructor();
      state.cache.set(array, clone);
      return copyOwnPropertiesStrict(array, clone, state);
    }
    function copyArrayBuffer(arrayBuffer, _state) {
      return arrayBuffer.slice(0);
    }
    function copyBlob(blob, _state) {
      return blob.slice(0, blob.size, blob.type);
    }
    function copyDataView(dataView, state) {
      return new state.Constructor(copyArrayBuffer(dataView.buffer));
    }
    function copyDate(date, state) {
      return new state.Constructor(date.getTime());
    }
    function copyMapLoose(map, state) {
      var clone = new state.Constructor();
      state.cache.set(map, clone);
      map.forEach(function (value, key) {
        clone.set(key, state.copier(value, state));
      });
      return clone;
    }
    function copyMapStrict(map, state) {
      return copyOwnPropertiesStrict(map, copyMapLoose(map, state), state);
    }
    function copyObjectLooseLegacy(object, state) {
      var clone = getCleanClone(state.prototype);
      state.cache.set(object, clone);
      for (var key in object) {
        if (hasOwnProperty.call(object, key)) {
          clone[key] = state.copier(object[key], state);
        }
      }
      return clone;
    }
    function copyObjectLooseModern(object, state) {
      var clone = getCleanClone(state.prototype);
      state.cache.set(object, clone);
      for (var key in object) {
        if (hasOwnProperty.call(object, key)) {
          clone[key] = state.copier(object[key], state);
        }
      }
      var symbols = getOwnPropertySymbols(object);
      for (var index2 = 0, length_3 = symbols.length, symbol = void 0; index2 < length_3; ++index2) {
        symbol = symbols[index2];
        if (propertyIsEnumerable.call(object, symbol)) {
          clone[symbol] = state.copier(object[symbol], state);
        }
      }
      return clone;
    }
    var copyObjectLoose = SUPPORTS_SYMBOL ? copyObjectLooseModern : copyObjectLooseLegacy;
    function copyObjectStrict(object, state) {
      var clone = getCleanClone(state.prototype);
      state.cache.set(object, clone);
      return copyOwnPropertiesStrict(object, clone, state);
    }
    function copyPrimitiveWrapper(primitiveObject, state) {
      return new state.Constructor(primitiveObject.valueOf());
    }
    function copyRegExp(regExp, state) {
      var clone = new state.Constructor(regExp.source, getRegExpFlags(regExp));
      clone.lastIndex = regExp.lastIndex;
      return clone;
    }
    function copySelf(value, _state) {
      return value;
    }
    function copySetLoose(set, state) {
      var clone = new state.Constructor();
      state.cache.set(set, clone);
      set.forEach(function (value) {
        clone.add(state.copier(value, state));
      });
      return clone;
    }
    function copySetStrict(set, state) {
      return copyOwnPropertiesStrict(set, copySetLoose(set, state), state);
    }
    var isArray = Array.isArray;
    var assign = Object.assign;
    var getPrototypeOf =
      Object.getPrototypeOf ||
      function (obj) {
        return obj.__proto__;
      };
    var DEFAULT_LOOSE_OPTIONS = {
      array: copyArrayLoose,
      arrayBuffer: copyArrayBuffer,
      blob: copyBlob,
      dataView: copyDataView,
      date: copyDate,
      error: copySelf,
      map: copyMapLoose,
      object: copyObjectLoose,
      regExp: copyRegExp,
      set: copySetLoose,
    };
    var DEFAULT_STRICT_OPTIONS = assign({}, DEFAULT_LOOSE_OPTIONS, {
      array: copyArrayStrict,
      map: copyMapStrict,
      object: copyObjectStrict,
      set: copySetStrict,
    });
    function getTagSpecificCopiers(options) {
      return {
        Arguments: options.object,
        Array: options.array,
        ArrayBuffer: options.arrayBuffer,
        Blob: options.blob,
        Boolean: copyPrimitiveWrapper,
        DataView: options.dataView,
        Date: options.date,
        Error: options.error,
        Float32Array: options.arrayBuffer,
        Float64Array: options.arrayBuffer,
        Int8Array: options.arrayBuffer,
        Int16Array: options.arrayBuffer,
        Int32Array: options.arrayBuffer,
        Map: options.map,
        Number: copyPrimitiveWrapper,
        Object: options.object,
        Promise: copySelf,
        RegExp: options.regExp,
        Set: options.set,
        String: copyPrimitiveWrapper,
        WeakMap: copySelf,
        WeakSet: copySelf,
        Uint8Array: options.arrayBuffer,
        Uint8ClampedArray: options.arrayBuffer,
        Uint16Array: options.arrayBuffer,
        Uint32Array: options.arrayBuffer,
        Uint64Array: options.arrayBuffer,
      };
    }
    function createCopier(options) {
      var normalizedOptions = assign({}, DEFAULT_LOOSE_OPTIONS, options);
      var tagSpecificCopiers = getTagSpecificCopiers(normalizedOptions);
      var array = tagSpecificCopiers.Array,
        object = tagSpecificCopiers.Object;
      function copier(value, state) {
        state.prototype = state.Constructor = void 0;
        if (!value || typeof value !== 'object') {
          return value;
        }
        if (state.cache.has(value)) {
          return state.cache.get(value);
        }
        state.prototype = getPrototypeOf(value);
        state.Constructor = state.prototype && state.prototype.constructor;
        if (!state.Constructor || state.Constructor === Object) {
          return object(value, state);
        }
        if (isArray(value)) {
          return array(value, state);
        }
        var tagSpecificCopier = tagSpecificCopiers[getTag(value)];
        if (tagSpecificCopier) {
          return tagSpecificCopier(value, state);
        }
        return typeof value.then === 'function' ? value : object(value, state);
      }
      return function copy(value) {
        return copier(value, {
          Constructor: void 0,
          cache: createCache(),
          copier,
          prototype: void 0,
        });
      };
    }
    function createStrictCopier(options) {
      return createCopier(assign({}, DEFAULT_STRICT_OPTIONS, options));
    }
    var copyStrict = createStrictCopier({});
    var index = createCopier({});
    exports2.copyStrict = copyStrict;
    exports2.createCopier = createCopier;
    exports2.createStrictCopier = createStrictCopier;
    exports2.default = index;
  },
});

// node_modules/pino-pretty/lib/utils/filter-log.js
var require_filter_log = __commonJS({
  'node_modules/pino-pretty/lib/utils/filter-log.js'(exports2, module2) {
    'use strict';
    module2.exports = filterLog;
    var { createCopier } = require_cjs();
    var fastCopy = createCopier({});
    var deleteLogProperty = require_delete_log_property();
    function filterLog({ log, context }) {
      const { ignoreKeys, includeKeys } = context;
      const logCopy = fastCopy(log);
      if (includeKeys) {
        const logIncluded = {};
        includeKeys.forEach((key) => {
          logIncluded[key] = logCopy[key];
        });
        return logIncluded;
      }
      ignoreKeys.forEach((ignoreKey) => {
        deleteLogProperty(logCopy, ignoreKey);
      });
      return logCopy;
    }
  },
});

// node_modules/dateformat/lib/dateformat.js
var require_dateformat = __commonJS({
  'node_modules/dateformat/lib/dateformat.js'(exports2, module2) {
    'use strict';
    function _typeof(obj) {
      '@babel/helpers - typeof';
      if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
        _typeof = function _typeof2(obj2) {
          return typeof obj2;
        };
      } else {
        _typeof = function _typeof2(obj2) {
          return obj2 && typeof Symbol === 'function' && obj2.constructor === Symbol && obj2 !== Symbol.prototype
            ? 'symbol'
            : typeof obj2;
        };
      }
      return _typeof(obj);
    }
    (function (global2) {
      var _arguments = arguments;
      var dateFormat = /* @__PURE__ */ (function () {
        var token = /d{1,4}|D{3,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|W{1,2}|[LlopSZN]|"[^"]*"|'[^']*'/g;
        var timezone =
          /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
        var timezoneClip = /[^-+\dA-Z]/g;
        return function (date, mask, utc, gmt) {
          if (_arguments.length === 1 && kindOf(date) === 'string' && !/\d/.test(date)) {
            mask = date;
            date = void 0;
          }
          date = date || date === 0 ? date : /* @__PURE__ */ new Date();
          if (!(date instanceof Date)) {
            date = new Date(date);
          }
          if (isNaN(date)) {
            throw TypeError('Invalid date');
          }
          mask = String(dateFormat.masks[mask] || mask || dateFormat.masks['default']);
          var maskSlice = mask.slice(0, 4);
          if (maskSlice === 'UTC:' || maskSlice === 'GMT:') {
            mask = mask.slice(4);
            utc = true;
            if (maskSlice === 'GMT:') {
              gmt = true;
            }
          }
          var _ = function _2() {
            return utc ? 'getUTC' : 'get';
          };
          var _d = function d() {
            return date[_() + 'Date']();
          };
          var D = function D2() {
            return date[_() + 'Day']();
          };
          var _m = function m() {
            return date[_() + 'Month']();
          };
          var y = function y2() {
            return date[_() + 'FullYear']();
          };
          var _H = function H() {
            return date[_() + 'Hours']();
          };
          var _M = function M() {
            return date[_() + 'Minutes']();
          };
          var _s = function s() {
            return date[_() + 'Seconds']();
          };
          var _L = function L() {
            return date[_() + 'Milliseconds']();
          };
          var _o = function o() {
            return utc ? 0 : date.getTimezoneOffset();
          };
          var _W = function W() {
            return getWeek(date);
          };
          var _N = function N() {
            return getDayOfWeek(date);
          };
          var flags = {
            d: function d() {
              return _d();
            },
            dd: function dd() {
              return pad(_d());
            },
            ddd: function ddd() {
              return dateFormat.i18n.dayNames[D()];
            },
            DDD: function DDD() {
              return getDayName({
                y: y(),
                m: _m(),
                d: _d(),
                _: _(),
                dayName: dateFormat.i18n.dayNames[D()],
                short: true,
              });
            },
            dddd: function dddd() {
              return dateFormat.i18n.dayNames[D() + 7];
            },
            DDDD: function DDDD() {
              return getDayName({ y: y(), m: _m(), d: _d(), _: _(), dayName: dateFormat.i18n.dayNames[D() + 7] });
            },
            m: function m() {
              return _m() + 1;
            },
            mm: function mm() {
              return pad(_m() + 1);
            },
            mmm: function mmm() {
              return dateFormat.i18n.monthNames[_m()];
            },
            mmmm: function mmmm() {
              return dateFormat.i18n.monthNames[_m() + 12];
            },
            yy: function yy() {
              return String(y()).slice(2);
            },
            yyyy: function yyyy() {
              return pad(y(), 4);
            },
            h: function h() {
              return _H() % 12 || 12;
            },
            hh: function hh() {
              return pad(_H() % 12 || 12);
            },
            H: function H() {
              return _H();
            },
            HH: function HH() {
              return pad(_H());
            },
            M: function M() {
              return _M();
            },
            MM: function MM() {
              return pad(_M());
            },
            s: function s() {
              return _s();
            },
            ss: function ss() {
              return pad(_s());
            },
            l: function l() {
              return pad(_L(), 3);
            },
            L: function L() {
              return pad(Math.floor(_L() / 10));
            },
            t: function t() {
              return _H() < 12 ? dateFormat.i18n.timeNames[0] : dateFormat.i18n.timeNames[1];
            },
            tt: function tt() {
              return _H() < 12 ? dateFormat.i18n.timeNames[2] : dateFormat.i18n.timeNames[3];
            },
            T: function T() {
              return _H() < 12 ? dateFormat.i18n.timeNames[4] : dateFormat.i18n.timeNames[5];
            },
            TT: function TT() {
              return _H() < 12 ? dateFormat.i18n.timeNames[6] : dateFormat.i18n.timeNames[7];
            },
            Z: function Z() {
              return gmt
                ? 'GMT'
                : utc
                ? 'UTC'
                : (String(date).match(timezone) || [''])
                    .pop()
                    .replace(timezoneClip, '')
                    .replace(/GMT\+0000/g, 'UTC');
            },
            o: function o() {
              return (_o() > 0 ? '-' : '+') + pad(Math.floor(Math.abs(_o()) / 60) * 100 + (Math.abs(_o()) % 60), 4);
            },
            p: function p() {
              return (
                (_o() > 0 ? '-' : '+') +
                pad(Math.floor(Math.abs(_o()) / 60), 2) +
                ':' +
                pad(Math.floor(Math.abs(_o()) % 60), 2)
              );
            },
            S: function S() {
              return ['th', 'st', 'nd', 'rd'][_d() % 10 > 3 ? 0 : (((_d() % 100) - (_d() % 10) != 10) * _d()) % 10];
            },
            W: function W() {
              return _W();
            },
            WW: function WW() {
              return pad(_W());
            },
            N: function N() {
              return _N();
            },
          };
          return mask.replace(token, function (match) {
            if (match in flags) {
              return flags[match]();
            }
            return match.slice(1, match.length - 1);
          });
        };
      })();
      dateFormat.masks = {
        default: 'ddd mmm dd yyyy HH:MM:ss',
        shortDate: 'm/d/yy',
        paddedShortDate: 'mm/dd/yyyy',
        mediumDate: 'mmm d, yyyy',
        longDate: 'mmmm d, yyyy',
        fullDate: 'dddd, mmmm d, yyyy',
        shortTime: 'h:MM TT',
        mediumTime: 'h:MM:ss TT',
        longTime: 'h:MM:ss TT Z',
        isoDate: 'yyyy-mm-dd',
        isoTime: 'HH:MM:ss',
        isoDateTime: "yyyy-mm-dd'T'HH:MM:sso",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
        expiresHeaderFormat: 'ddd, dd mmm yyyy HH:MM:ss Z',
      };
      dateFormat.i18n = {
        dayNames: [
          'Sun',
          'Mon',
          'Tue',
          'Wed',
          'Thu',
          'Fri',
          'Sat',
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        monthNames: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ],
        timeNames: ['a', 'p', 'am', 'pm', 'A', 'P', 'AM', 'PM'],
      };
      var pad = function pad2(val, len) {
        val = String(val);
        len = len || 2;
        while (val.length < len) {
          val = '0' + val;
        }
        return val;
      };
      var getDayName = function getDayName2(_ref) {
        var y = _ref.y,
          m = _ref.m,
          d = _ref.d,
          _ = _ref._,
          dayName = _ref.dayName,
          _ref$short = _ref['short'],
          _short = _ref$short === void 0 ? false : _ref$short;
        var today = /* @__PURE__ */ new Date();
        var yesterday = /* @__PURE__ */ new Date();
        yesterday.setDate(yesterday[_ + 'Date']() - 1);
        var tomorrow = /* @__PURE__ */ new Date();
        tomorrow.setDate(tomorrow[_ + 'Date']() + 1);
        var today_d = function today_d2() {
          return today[_ + 'Date']();
        };
        var today_m = function today_m2() {
          return today[_ + 'Month']();
        };
        var today_y = function today_y2() {
          return today[_ + 'FullYear']();
        };
        var yesterday_d = function yesterday_d2() {
          return yesterday[_ + 'Date']();
        };
        var yesterday_m = function yesterday_m2() {
          return yesterday[_ + 'Month']();
        };
        var yesterday_y = function yesterday_y2() {
          return yesterday[_ + 'FullYear']();
        };
        var tomorrow_d = function tomorrow_d2() {
          return tomorrow[_ + 'Date']();
        };
        var tomorrow_m = function tomorrow_m2() {
          return tomorrow[_ + 'Month']();
        };
        var tomorrow_y = function tomorrow_y2() {
          return tomorrow[_ + 'FullYear']();
        };
        if (today_y() === y && today_m() === m && today_d() === d) {
          return _short ? 'Tdy' : 'Today';
        } else if (yesterday_y() === y && yesterday_m() === m && yesterday_d() === d) {
          return _short ? 'Ysd' : 'Yesterday';
        } else if (tomorrow_y() === y && tomorrow_m() === m && tomorrow_d() === d) {
          return _short ? 'Tmw' : 'Tomorrow';
        }
        return dayName;
      };
      var getWeek = function getWeek2(date) {
        var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        targetThursday.setDate(targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3);
        var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);
        firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);
        var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
        targetThursday.setHours(targetThursday.getHours() - ds);
        var weekDiff = (targetThursday - firstThursday) / (864e5 * 7);
        return 1 + Math.floor(weekDiff);
      };
      var getDayOfWeek = function getDayOfWeek2(date) {
        var dow = date.getDay();
        if (dow === 0) {
          dow = 7;
        }
        return dow;
      };
      var kindOf = function kindOf2(val) {
        if (val === null) {
          return 'null';
        }
        if (val === void 0) {
          return 'undefined';
        }
        if (_typeof(val) !== 'object') {
          return _typeof(val);
        }
        if (Array.isArray(val)) {
          return 'array';
        }
        return {}.toString.call(val).slice(8, -1).toLowerCase();
      };
      if (typeof define === 'function' && define.amd) {
        define(function () {
          return dateFormat;
        });
      } else if ((typeof exports2 === 'undefined' ? 'undefined' : _typeof(exports2)) === 'object') {
        module2.exports = dateFormat;
      } else {
        global2.dateFormat = dateFormat;
      }
    })(void 0);
  },
});

// node_modules/pino-pretty/lib/utils/format-time.js
var require_format_time = __commonJS({
  'node_modules/pino-pretty/lib/utils/format-time.js'(exports2, module2) {
    'use strict';
    module2.exports = formatTime;
    var { DATE_FORMAT, DATE_FORMAT_SIMPLE } = require_constants();
    var dateformat = require_dateformat();
    var createDate = require_create_date();
    var isValidDate = require_is_valid_date();
    function formatTime(epoch, translateTime = false) {
      if (translateTime === false) {
        return epoch;
      }
      const instant = createDate(epoch);
      if (!isValidDate(instant)) {
        return epoch;
      }
      if (translateTime === true) {
        return dateformat(instant, DATE_FORMAT_SIMPLE);
      }
      const upperFormat = translateTime.toUpperCase();
      if (upperFormat === 'SYS:STANDARD') {
        return dateformat(instant, DATE_FORMAT);
      }
      const prefix = upperFormat.substr(0, 4);
      if (prefix === 'SYS:' || prefix === 'UTC:') {
        if (prefix === 'UTC:') {
          return dateformat(instant, translateTime);
        }
        return dateformat(instant, translateTime.slice(4));
      }
      return dateformat(instant, `UTC:${translateTime}`);
    }
  },
});

// node_modules/pino-pretty/lib/utils/handle-custom-levels-names-opts.js
var require_handle_custom_levels_names_opts = __commonJS({
  'node_modules/pino-pretty/lib/utils/handle-custom-levels-names-opts.js'(exports2, module2) {
    'use strict';
    module2.exports = handleCustomLevelsNamesOpts;
    function handleCustomLevelsNamesOpts(cLevels) {
      if (!cLevels) return {};
      if (typeof cLevels === 'string') {
        return cLevels.split(',').reduce((agg, value, idx) => {
          const [levelName, levelNum = idx] = value.split(':');
          agg[levelName.toLowerCase()] = levelNum;
          return agg;
        }, {});
      } else if (Object.prototype.toString.call(cLevels) === '[object Object]') {
        return Object.keys(cLevels).reduce((agg, levelName) => {
          agg[levelName.toLowerCase()] = cLevels[levelName];
          return agg;
        }, {});
      } else {
        return {};
      }
    }
  },
});

// node_modules/pino-pretty/lib/utils/handle-custom-levels-opts.js
var require_handle_custom_levels_opts = __commonJS({
  'node_modules/pino-pretty/lib/utils/handle-custom-levels-opts.js'(exports2, module2) {
    'use strict';
    module2.exports = handleCustomLevelsOpts;
    function handleCustomLevelsOpts(cLevels) {
      if (!cLevels) return {};
      if (typeof cLevels === 'string') {
        return cLevels.split(',').reduce(
          (agg, value, idx) => {
            const [levelName, levelNum = idx] = value.split(':');
            agg[levelNum] = levelName.toUpperCase();
            return agg;
          },
          { default: 'USERLVL' }
        );
      } else if (Object.prototype.toString.call(cLevels) === '[object Object]') {
        return Object.keys(cLevels).reduce(
          (agg, levelName) => {
            agg[cLevels[levelName]] = levelName.toUpperCase();
            return agg;
          },
          { default: 'USERLVL' }
        );
      } else {
        return {};
      }
    }
  },
});

// node_modules/pino-pretty/lib/utils/interpret-conditionals.js
var require_interpret_conditionals = __commonJS({
  'node_modules/pino-pretty/lib/utils/interpret-conditionals.js'(exports2, module2) {
    'use strict';
    module2.exports = interpretConditionals;
    var getPropertyValue = require_get_property_value();
    function interpretConditionals(messageFormat, log) {
      messageFormat = messageFormat.replace(/{if (.*?)}(.*?){end}/g, replacer);
      messageFormat = messageFormat.replace(/{if (.*?)}/g, '');
      messageFormat = messageFormat.replace(/{end}/g, '');
      return messageFormat.replace(/\s+/g, ' ').trim();
      function replacer(_, key, value) {
        const propertyValue = getPropertyValue(log, key);
        if (propertyValue && value.includes(key)) {
          return value.replace(new RegExp('{' + key + '}', 'g'), propertyValue);
        } else {
          return '';
        }
      }
    }
  },
});

// node_modules/pino-pretty/lib/utils/is-object.js
var require_is_object = __commonJS({
  'node_modules/pino-pretty/lib/utils/is-object.js'(exports2, module2) {
    'use strict';
    module2.exports = isObject;
    function isObject(input) {
      return Object.prototype.toString.apply(input) === '[object Object]';
    }
  },
});

// node_modules/pino-pretty/lib/utils/join-lines-with-indentation.js
var require_join_lines_with_indentation = __commonJS({
  'node_modules/pino-pretty/lib/utils/join-lines-with-indentation.js'(exports2, module2) {
    'use strict';
    module2.exports = joinLinesWithIndentation;
    function joinLinesWithIndentation({ input, ident = '    ', eol = '\n' }) {
      const lines = input.split(/\r?\n/);
      for (let i = 1; i < lines.length; i += 1) {
        lines[i] = ident + lines[i];
      }
      return lines.join(eol);
    }
  },
});

// node_modules/pino-pretty/lib/utils/parse-factory-options.js
var require_parse_factory_options = __commonJS({
  'node_modules/pino-pretty/lib/utils/parse-factory-options.js'(exports2, module2) {
    'use strict';
    module2.exports = parseFactoryOptions2;
    var { LEVEL_NAMES } = require_constants();
    var colors2 = require_colors();
    var handleCustomLevelsOpts = require_handle_custom_levels_opts();
    var handleCustomLevelsNamesOpts = require_handle_custom_levels_names_opts();
    function parseFactoryOptions2(options) {
      const EOL = options.crlf ? '\r\n' : '\n';
      const IDENT = '    ';
      const {
        customPrettifiers,
        errorLikeObjectKeys,
        hideObject,
        levelFirst,
        levelKey,
        levelLabel,
        messageFormat,
        messageKey,
        minimumLevel,
        singleLine,
        timestampKey,
        translateTime,
      } = options;
      const errorProps = options.errorProps.split(',');
      const useOnlyCustomProps =
        typeof options.useOnlyCustomProps === 'boolean'
          ? options.useOnlyCustomProps
          : options.useOnlyCustomProps === 'true';
      const customLevels = handleCustomLevelsOpts(options.customLevels);
      const customLevelNames = handleCustomLevelsNamesOpts(options.customLevels);
      let customColors;
      if (options.customColors) {
        customColors = options.customColors.split(',').reduce((agg, value) => {
          const [level, color] = value.split(':');
          const condition = useOnlyCustomProps ? options.customLevels : customLevelNames[level] !== void 0;
          const levelNum = condition ? customLevelNames[level] : LEVEL_NAMES[level];
          const colorIdx = levelNum !== void 0 ? levelNum : level;
          agg.push([colorIdx, color]);
          return agg;
        }, []);
      }
      const customProperties = { customLevels, customLevelNames };
      if (useOnlyCustomProps === true && !options.customLevels) {
        customProperties.customLevels = void 0;
        customProperties.customLevelNames = void 0;
      }
      const includeKeys = options.include !== void 0 ? new Set(options.include.split(',')) : void 0;
      const ignoreKeys = !includeKeys && options.ignore ? new Set(options.ignore.split(',')) : void 0;
      const colorizer = colors2(options.colorize, customColors, useOnlyCustomProps);
      const objectColorizer = options.colorizeObjects ? colorizer : colors2(false, [], false);
      return {
        EOL,
        IDENT,
        colorizer,
        customColors,
        customLevelNames,
        customLevels,
        customPrettifiers,
        customProperties,
        errorLikeObjectKeys,
        errorProps,
        hideObject,
        ignoreKeys,
        includeKeys,
        levelFirst,
        levelKey,
        levelLabel,
        messageFormat,
        messageKey,
        minimumLevel,
        objectColorizer,
        singleLine,
        timestampKey,
        translateTime,
        useOnlyCustomProps,
      };
    }
  },
});

// node_modules/fast-safe-stringify/index.js
var require_fast_safe_stringify = __commonJS({
  'node_modules/fast-safe-stringify/index.js'(exports2, module2) {
    module2.exports = stringify;
    stringify.default = stringify;
    stringify.stable = deterministicStringify;
    stringify.stableStringify = deterministicStringify;
    var LIMIT_REPLACE_NODE = '[...]';
    var CIRCULAR_REPLACE_NODE = '[Circular]';
    var arr = [];
    var replacerStack = [];
    function defaultOptions2() {
      return {
        depthLimit: Number.MAX_SAFE_INTEGER,
        edgesLimit: Number.MAX_SAFE_INTEGER,
      };
    }
    function stringify(obj, replacer, spacer, options) {
      if (typeof options === 'undefined') {
        options = defaultOptions2();
      }
      decirc(obj, '', 0, [], void 0, 0, options);
      var res;
      try {
        if (replacerStack.length === 0) {
          res = JSON.stringify(obj, replacer, spacer);
        } else {
          res = JSON.stringify(obj, replaceGetterValues(replacer), spacer);
        }
      } catch (_) {
        return JSON.stringify('[unable to serialize, circular reference is too complex to analyze]');
      } finally {
        while (arr.length !== 0) {
          var part = arr.pop();
          if (part.length === 4) {
            Object.defineProperty(part[0], part[1], part[3]);
          } else {
            part[0][part[1]] = part[2];
          }
        }
      }
      return res;
    }
    function setReplace(replace, val, k, parent) {
      var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k);
      if (propertyDescriptor.get !== void 0) {
        if (propertyDescriptor.configurable) {
          Object.defineProperty(parent, k, { value: replace });
          arr.push([parent, k, val, propertyDescriptor]);
        } else {
          replacerStack.push([val, k, replace]);
        }
      } else {
        parent[k] = replace;
        arr.push([parent, k, val]);
      }
    }
    function decirc(val, k, edgeIndex, stack, parent, depth, options) {
      depth += 1;
      var i;
      if (typeof val === 'object' && val !== null) {
        for (i = 0; i < stack.length; i++) {
          if (stack[i] === val) {
            setReplace(CIRCULAR_REPLACE_NODE, val, k, parent);
            return;
          }
        }
        if (typeof options.depthLimit !== 'undefined' && depth > options.depthLimit) {
          setReplace(LIMIT_REPLACE_NODE, val, k, parent);
          return;
        }
        if (typeof options.edgesLimit !== 'undefined' && edgeIndex + 1 > options.edgesLimit) {
          setReplace(LIMIT_REPLACE_NODE, val, k, parent);
          return;
        }
        stack.push(val);
        if (Array.isArray(val)) {
          for (i = 0; i < val.length; i++) {
            decirc(val[i], i, i, stack, val, depth, options);
          }
        } else {
          var keys = Object.keys(val);
          for (i = 0; i < keys.length; i++) {
            var key = keys[i];
            decirc(val[key], key, i, stack, val, depth, options);
          }
        }
        stack.pop();
      }
    }
    function compareFunction(a, b) {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    }
    function deterministicStringify(obj, replacer, spacer, options) {
      if (typeof options === 'undefined') {
        options = defaultOptions2();
      }
      var tmp = deterministicDecirc(obj, '', 0, [], void 0, 0, options) || obj;
      var res;
      try {
        if (replacerStack.length === 0) {
          res = JSON.stringify(tmp, replacer, spacer);
        } else {
          res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer);
        }
      } catch (_) {
        return JSON.stringify('[unable to serialize, circular reference is too complex to analyze]');
      } finally {
        while (arr.length !== 0) {
          var part = arr.pop();
          if (part.length === 4) {
            Object.defineProperty(part[0], part[1], part[3]);
          } else {
            part[0][part[1]] = part[2];
          }
        }
      }
      return res;
    }
    function deterministicDecirc(val, k, edgeIndex, stack, parent, depth, options) {
      depth += 1;
      var i;
      if (typeof val === 'object' && val !== null) {
        for (i = 0; i < stack.length; i++) {
          if (stack[i] === val) {
            setReplace(CIRCULAR_REPLACE_NODE, val, k, parent);
            return;
          }
        }
        try {
          if (typeof val.toJSON === 'function') {
            return;
          }
        } catch (_) {
          return;
        }
        if (typeof options.depthLimit !== 'undefined' && depth > options.depthLimit) {
          setReplace(LIMIT_REPLACE_NODE, val, k, parent);
          return;
        }
        if (typeof options.edgesLimit !== 'undefined' && edgeIndex + 1 > options.edgesLimit) {
          setReplace(LIMIT_REPLACE_NODE, val, k, parent);
          return;
        }
        stack.push(val);
        if (Array.isArray(val)) {
          for (i = 0; i < val.length; i++) {
            deterministicDecirc(val[i], i, i, stack, val, depth, options);
          }
        } else {
          var tmp = {};
          var keys = Object.keys(val).sort(compareFunction);
          for (i = 0; i < keys.length; i++) {
            var key = keys[i];
            deterministicDecirc(val[key], key, i, stack, val, depth, options);
            tmp[key] = val[key];
          }
          if (typeof parent !== 'undefined') {
            arr.push([parent, k, val]);
            parent[k] = tmp;
          } else {
            return tmp;
          }
        }
        stack.pop();
      }
    }
    function replaceGetterValues(replacer) {
      replacer =
        typeof replacer !== 'undefined'
          ? replacer
          : function (k, v) {
              return v;
            };
      return function (key, val) {
        if (replacerStack.length > 0) {
          for (var i = 0; i < replacerStack.length; i++) {
            var part = replacerStack[i];
            if (part[1] === key && part[0] === val) {
              val = part[2];
              replacerStack.splice(i, 1);
              break;
            }
          }
        }
        return replacer.call(this, key, val);
      };
    }
  },
});

// node_modules/pino-pretty/lib/utils/prettify-error.js
var require_prettify_error = __commonJS({
  'node_modules/pino-pretty/lib/utils/prettify-error.js'(exports2, module2) {
    'use strict';
    module2.exports = prettifyError;
    var joinLinesWithIndentation = require_join_lines_with_indentation();
    function prettifyError({ keyName, lines, eol, ident }) {
      let result = '';
      const joinedLines = joinLinesWithIndentation({ input: lines, ident, eol });
      const splitLines = `${ident}${keyName}: ${joinedLines}${eol}`.split(eol);
      for (let j = 0; j < splitLines.length; j += 1) {
        if (j !== 0) result += eol;
        const line = splitLines[j];
        if (/^\s*"stack"/.test(line)) {
          const matches = /^(\s*"stack":)\s*(".*"),?$/.exec(line);
          if (matches && matches.length === 3) {
            const indentSize = /^\s*/.exec(line)[0].length + 4;
            const indentation = ' '.repeat(indentSize);
            const stackMessage = matches[2];
            result += matches[1] + eol + indentation + JSON.parse(stackMessage).replace(/\n/g, eol + indentation);
          } else {
            result += line;
          }
        } else {
          result += line;
        }
      }
      return result;
    }
  },
});

// node_modules/pino-pretty/lib/utils/prettify-object.js
var require_prettify_object = __commonJS({
  'node_modules/pino-pretty/lib/utils/prettify-object.js'(exports2, module2) {
    'use strict';
    module2.exports = prettifyObject;
    var { LOGGER_KEYS } = require_constants();
    var stringifySafe = require_fast_safe_stringify();
    var joinLinesWithIndentation = require_join_lines_with_indentation();
    var prettifyError = require_prettify_error();
    function prettifyObject({ log, excludeLoggerKeys = true, skipKeys = [], context }) {
      const {
        EOL: eol,
        IDENT: ident,
        customPrettifiers,
        errorLikeObjectKeys: errorLikeKeys,
        objectColorizer,
        singleLine,
      } = context;
      const keysToIgnore = [].concat(skipKeys);
      if (excludeLoggerKeys === true) Array.prototype.push.apply(keysToIgnore, LOGGER_KEYS);
      let result = '';
      const { plain, errors } = Object.entries(log).reduce(
        ({ plain: plain2, errors: errors2 }, [k, v]) => {
          if (keysToIgnore.includes(k) === false) {
            const pretty2 = typeof customPrettifiers[k] === 'function' ? customPrettifiers[k](v, k, log) : v;
            if (errorLikeKeys.includes(k)) {
              errors2[k] = pretty2;
            } else {
              plain2[k] = pretty2;
            }
          }
          return { plain: plain2, errors: errors2 };
        },
        { plain: {}, errors: {} }
      );
      if (singleLine) {
        if (Object.keys(plain).length > 0) {
          result += objectColorizer.greyMessage(stringifySafe(plain));
        }
        result += eol;
        result = result.replace(/\\\\/gi, '\\');
      } else {
        Object.entries(plain).forEach(([keyName, keyValue]) => {
          let lines = typeof customPrettifiers[keyName] === 'function' ? keyValue : stringifySafe(keyValue, null, 2);
          if (lines === void 0) return;
          lines = lines.replace(/\\\\/gi, '\\');
          const joinedLines = joinLinesWithIndentation({ input: lines, ident, eol });
          result += `${ident}${keyName}:${joinedLines.startsWith(eol) ? '' : ' '}${joinedLines}${eol}`;
        });
      }
      Object.entries(errors).forEach(([keyName, keyValue]) => {
        const lines = typeof customPrettifiers[keyName] === 'function' ? keyValue : stringifySafe(keyValue, null, 2);
        if (lines === void 0) return;
        result += prettifyError({ keyName, lines, eol, ident });
      });
      return result;
    }
  },
});

// node_modules/pino-pretty/lib/utils/prettify-error-log.js
var require_prettify_error_log = __commonJS({
  'node_modules/pino-pretty/lib/utils/prettify-error-log.js'(exports2, module2) {
    'use strict';
    module2.exports = prettifyErrorLog;
    var { LOGGER_KEYS } = require_constants();
    var isObject = require_is_object();
    var joinLinesWithIndentation = require_join_lines_with_indentation();
    var prettifyObject = require_prettify_object();
    function prettifyErrorLog({ log, context }) {
      const { EOL: eol, IDENT: ident, errorProps: errorProperties, messageKey } = context;
      const stack = log.stack;
      const joinedLines = joinLinesWithIndentation({ input: stack, ident, eol });
      let result = `${ident}${joinedLines}${eol}`;
      if (errorProperties.length > 0) {
        const excludeProperties = LOGGER_KEYS.concat(messageKey, 'type', 'stack');
        let propertiesToPrint;
        if (errorProperties[0] === '*') {
          propertiesToPrint = Object.keys(log).filter((k) => excludeProperties.includes(k) === false);
        } else {
          propertiesToPrint = errorProperties.filter((k) => excludeProperties.includes(k) === false);
        }
        for (let i = 0; i < propertiesToPrint.length; i += 1) {
          const key = propertiesToPrint[i];
          if (key in log === false) continue;
          if (isObject(log[key])) {
            const prettifiedObject = prettifyObject({
              log: log[key],
              excludeLoggerKeys: false,
              context: {
                ...context,
                IDENT: ident + ident,
              },
            });
            result = `${result}${ident}${key}: {${eol}${prettifiedObject}${ident}}${eol}`;
            continue;
          }
          result = `${result}${ident}${key}: ${log[key]}${eol}`;
        }
      }
      return result;
    }
  },
});

// node_modules/pino-pretty/lib/utils/prettify-level.js
var require_prettify_level = __commonJS({
  'node_modules/pino-pretty/lib/utils/prettify-level.js'(exports2, module2) {
    'use strict';
    module2.exports = prettifyLevel;
    var getPropertyValue = require_get_property_value();
    function prettifyLevel({ log, context }) {
      const { colorizer, customLevels, customLevelNames, levelKey } = context;
      const prettifier = context.customPrettifiers?.level;
      const output = getPropertyValue(log, levelKey);
      if (output === void 0) return void 0;
      return prettifier ? prettifier(output) : colorizer(output, { customLevels, customLevelNames });
    }
  },
});

// node_modules/pino-pretty/lib/utils/prettify-message.js
var require_prettify_message = __commonJS({
  'node_modules/pino-pretty/lib/utils/prettify-message.js'(exports2, module2) {
    'use strict';
    module2.exports = prettifyMessage;
    var { LEVELS } = require_constants();
    var getPropertyValue = require_get_property_value();
    var interpretConditionals = require_interpret_conditionals();
    function prettifyMessage({ log, context }) {
      const { colorizer, customLevels, levelKey, levelLabel, messageFormat, messageKey, useOnlyCustomProps } = context;
      if (messageFormat && typeof messageFormat === 'string') {
        const parsedMessageFormat = interpretConditionals(messageFormat, log);
        const message = String(parsedMessageFormat).replace(/{([^{}]+)}/g, function (match, p1) {
          let level;
          if (p1 === levelLabel && (level = getPropertyValue(log, levelKey)) !== void 0) {
            const condition = useOnlyCustomProps ? customLevels === void 0 : customLevels[level] === void 0;
            return condition ? LEVELS[level] : customLevels[level];
          }
          return getPropertyValue(log, p1) || '';
        });
        return colorizer.message(message);
      }
      if (messageFormat && typeof messageFormat === 'function') {
        const msg = messageFormat(log, messageKey, levelLabel);
        return colorizer.message(msg);
      }
      if (messageKey in log === false) return void 0;
      if (
        typeof log[messageKey] !== 'string' &&
        typeof log[messageKey] !== 'number' &&
        typeof log[messageKey] !== 'boolean'
      )
        return void 0;
      return colorizer.message(log[messageKey]);
    }
  },
});

// node_modules/pino-pretty/lib/utils/prettify-metadata.js
var require_prettify_metadata = __commonJS({
  'node_modules/pino-pretty/lib/utils/prettify-metadata.js'(exports2, module2) {
    'use strict';
    module2.exports = prettifyMetadata;
    function prettifyMetadata({ log, context }) {
      const prettifiers = context.customPrettifiers;
      let line = '';
      if (log.name || log.pid || log.hostname) {
        line += '(';
        if (log.name) {
          line += prettifiers.name ? prettifiers.name(log.name) : log.name;
        }
        if (log.pid) {
          const prettyPid = prettifiers.pid ? prettifiers.pid(log.pid) : log.pid;
          if (log.name && log.pid) {
            line += '/' + prettyPid;
          } else {
            line += prettyPid;
          }
        }
        if (log.hostname) {
          line += `${line === '(' ? 'on' : ' on'} ${
            prettifiers.hostname ? prettifiers.hostname(log.hostname) : log.hostname
          }`;
        }
        line += ')';
      }
      if (log.caller) {
        line += `${line === '' ? '' : ' '}<${prettifiers.caller ? prettifiers.caller(log.caller) : log.caller}>`;
      }
      if (line === '') {
        return void 0;
      } else {
        return line;
      }
    }
  },
});

// node_modules/pino-pretty/lib/utils/prettify-time.js
var require_prettify_time = __commonJS({
  'node_modules/pino-pretty/lib/utils/prettify-time.js'(exports2, module2) {
    'use strict';
    module2.exports = prettifyTime;
    var formatTime = require_format_time();
    function prettifyTime({ log, context }) {
      const { timestampKey, translateTime: translateFormat } = context;
      const prettifier = context.customPrettifiers?.time;
      let time = null;
      if (timestampKey in log) {
        time = log[timestampKey];
      } else if ('timestamp' in log) {
        time = log.timestamp;
      }
      if (time === null) return void 0;
      const output = translateFormat ? formatTime(time, translateFormat) : time;
      return prettifier ? prettifier(output) : `[${output}]`;
    }
  },
});

// node_modules/pino-pretty/lib/utils/index.js
var require_utils3 = __commonJS({
  'node_modules/pino-pretty/lib/utils/index.js'(exports2, module2) {
    'use strict';
    module2.exports = {
      buildSafeSonicBoom: require_build_safe_sonic_boom(),
      createDate: require_create_date(),
      deleteLogProperty: require_delete_log_property(),
      filterLog: require_filter_log(),
      formatTime: require_format_time(),
      getPropertyValue: require_get_property_value(),
      handleCustomLevelsNamesOpts: require_handle_custom_levels_names_opts(),
      handleCustomLevelsOpts: require_handle_custom_levels_opts(),
      interpretConditionals: require_interpret_conditionals(),
      isObject: require_is_object(),
      isValidDate: require_is_valid_date(),
      joinLinesWithIndentation: require_join_lines_with_indentation(),
      noop: require_noop(),
      parseFactoryOptions: require_parse_factory_options(),
      prettifyErrorLog: require_prettify_error_log(),
      prettifyError: require_prettify_error(),
      prettifyLevel: require_prettify_level(),
      prettifyMessage: require_prettify_message(),
      prettifyMetadata: require_prettify_metadata(),
      prettifyObject: require_prettify_object(),
      prettifyTime: require_prettify_time(),
      splitPropertyKey: require_split_property_key(),
    };
  },
});

// node_modules/secure-json-parse/index.js
var require_secure_json_parse = __commonJS({
  'node_modules/secure-json-parse/index.js'(exports2, module2) {
    'use strict';
    var hasBuffer = typeof Buffer !== 'undefined';
    var suspectProtoRx =
      /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/;
    var suspectConstructorRx =
      /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
    function _parse(text, reviver, options) {
      if (options == null) {
        if (reviver !== null && typeof reviver === 'object') {
          options = reviver;
          reviver = void 0;
        }
      }
      if (hasBuffer && Buffer.isBuffer(text)) {
        text = text.toString();
      }
      if (text && text.charCodeAt(0) === 65279) {
        text = text.slice(1);
      }
      const obj = JSON.parse(text, reviver);
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }
      const protoAction = (options && options.protoAction) || 'error';
      const constructorAction = (options && options.constructorAction) || 'error';
      if (protoAction === 'ignore' && constructorAction === 'ignore') {
        return obj;
      }
      if (protoAction !== 'ignore' && constructorAction !== 'ignore') {
        if (suspectProtoRx.test(text) === false && suspectConstructorRx.test(text) === false) {
          return obj;
        }
      } else if (protoAction !== 'ignore' && constructorAction === 'ignore') {
        if (suspectProtoRx.test(text) === false) {
          return obj;
        }
      } else {
        if (suspectConstructorRx.test(text) === false) {
          return obj;
        }
      }
      return filter(obj, { protoAction, constructorAction, safe: options && options.safe });
    }
    function filter(obj, { protoAction = 'error', constructorAction = 'error', safe } = {}) {
      let next = [obj];
      while (next.length) {
        const nodes = next;
        next = [];
        for (const node of nodes) {
          if (protoAction !== 'ignore' && Object.prototype.hasOwnProperty.call(node, '__proto__')) {
            if (safe === true) {
              return null;
            } else if (protoAction === 'error') {
              throw new SyntaxError('Object contains forbidden prototype property');
            }
            delete node.__proto__;
          }
          if (
            constructorAction !== 'ignore' &&
            Object.prototype.hasOwnProperty.call(node, 'constructor') &&
            Object.prototype.hasOwnProperty.call(node.constructor, 'prototype')
          ) {
            if (safe === true) {
              return null;
            } else if (constructorAction === 'error') {
              throw new SyntaxError('Object contains forbidden prototype property');
            }
            delete node.constructor;
          }
          for (const key in node) {
            const value = node[key];
            if (value && typeof value === 'object') {
              next.push(value);
            }
          }
        }
      }
      return obj;
    }
    function parse(text, reviver, options) {
      const stackTraceLimit = Error.stackTraceLimit;
      Error.stackTraceLimit = 0;
      try {
        return _parse(text, reviver, options);
      } finally {
        Error.stackTraceLimit = stackTraceLimit;
      }
    }
    function safeParse(text, reviver) {
      const stackTraceLimit = Error.stackTraceLimit;
      Error.stackTraceLimit = 0;
      try {
        return _parse(text, reviver, { safe: true });
      } catch (_e) {
        return null;
      } finally {
        Error.stackTraceLimit = stackTraceLimit;
      }
    }
    module2.exports = parse;
    module2.exports.default = parse;
    module2.exports.parse = parse;
    module2.exports.safeParse = safeParse;
    module2.exports.scan = filter;
  },
});

// node_modules/pino-pretty/lib/pretty.js
var require_pretty = __commonJS({
  'node_modules/pino-pretty/lib/pretty.js'(exports2, module2) {
    'use strict';
    module2.exports = pretty2;
    var sjs = require_secure_json_parse();
    var isObject = require_is_object();
    var prettifyErrorLog = require_prettify_error_log();
    var prettifyLevel = require_prettify_level();
    var prettifyMessage = require_prettify_message();
    var prettifyMetadata = require_prettify_metadata();
    var prettifyObject = require_prettify_object();
    var prettifyTime = require_prettify_time();
    var filterLog = require_filter_log();
    var { LEVELS, LEVEL_KEY: LEVEL_KEY2, LEVEL_NAMES } = require_constants();
    var jsonParser = (input) => {
      try {
        return { value: sjs.parse(input, { protoAction: 'remove' }) };
      } catch (err) {
        return { err };
      }
    };
    function pretty2(inputData) {
      let log;
      if (!isObject(inputData)) {
        const parsed = jsonParser(inputData);
        if (parsed.err || !isObject(parsed.value)) {
          return inputData + this.EOL;
        }
        log = parsed.value;
      } else {
        log = inputData;
      }
      if (this.minimumLevel) {
        let condition;
        if (this.useOnlyCustomProps) {
          condition = this.customLevels;
        } else {
          condition = this.customLevelNames[this.minimumLevel] !== void 0;
        }
        let minimum;
        if (condition) {
          minimum = this.customLevelNames[this.minimumLevel];
        } else {
          minimum = LEVEL_NAMES[this.minimumLevel];
        }
        if (!minimum) {
          minimum =
            typeof this.minimumLevel === 'string'
              ? LEVEL_NAMES[this.minimumLevel]
              : LEVEL_NAMES[LEVELS[this.minimumLevel].toLowerCase()];
        }
        const level = log[this.levelKey === void 0 ? LEVEL_KEY2 : this.levelKey];
        if (level < minimum) return;
      }
      const prettifiedMessage = prettifyMessage({ log, context: this.context });
      if (this.ignoreKeys || this.includeKeys) {
        log = filterLog({ log, context: this.context });
      }
      const prettifiedLevel = prettifyLevel({
        log,
        context: {
          ...this.context,
          // This is odd. The colorizer ends up relying on the value of
          // `customProperties` instead of the original `customLevels` and
          // `customLevelNames`.
          ...this.context.customProperties,
        },
      });
      const prettifiedMetadata = prettifyMetadata({ log, context: this.context });
      const prettifiedTime = prettifyTime({ log, context: this.context });
      let line = '';
      if (this.levelFirst && prettifiedLevel) {
        line = `${prettifiedLevel}`;
      }
      if (prettifiedTime && line === '') {
        line = `${prettifiedTime}`;
      } else if (prettifiedTime) {
        line = `${line} ${prettifiedTime}`;
      }
      if (!this.levelFirst && prettifiedLevel) {
        if (line.length > 0) {
          line = `${line} ${prettifiedLevel}`;
        } else {
          line = prettifiedLevel;
        }
      }
      if (prettifiedMetadata) {
        if (line.length > 0) {
          line = `${line} ${prettifiedMetadata}:`;
        } else {
          line = prettifiedMetadata;
        }
      }
      if (line.endsWith(':') === false && line !== '') {
        line += ':';
      }
      if (prettifiedMessage !== void 0) {
        if (line.length > 0) {
          line = `${line} ${prettifiedMessage}`;
        } else {
          line = prettifiedMessage;
        }
      }
      if (line.length > 0 && !this.singleLine) {
        line += this.EOL;
      }
      if (log.type === 'Error' && log.stack) {
        const prettifiedErrorLog = prettifyErrorLog({ log, context: this.context });
        if (this.singleLine) line += this.EOL;
        line += prettifiedErrorLog;
      } else if (this.hideObject === false) {
        const skipKeys = [this.messageKey, this.levelKey, this.timestampKey].filter((key) => {
          return typeof log[key] === 'string' || typeof log[key] === 'number' || typeof log[key] === 'boolean';
        });
        const prettifiedObject = prettifyObject({
          log,
          skipKeys,
          context: this.context,
        });
        if (this.singleLine && !/^\s$/.test(prettifiedObject)) {
          line += ' ';
        }
        line += prettifiedObject;
      }
      return line;
    }
  },
});

// node_modules/pino-pretty/index.js
var { isColorSupported } = require_colorette();
var pump = require_pump();
var { Transform } = require_ours();
var abstractTransport = require_pino_abstract_transport();
var colors = require_colors();
var { ERROR_LIKE_KEYS, LEVEL_KEY, LEVEL_LABEL, MESSAGE_KEY, TIMESTAMP_KEY } = require_constants();
var { buildSafeSonicBoom, parseFactoryOptions } = require_utils3();
var pretty = require_pretty();
var defaultOptions = {
  colorize: isColorSupported,
  colorizeObjects: true,
  crlf: false,
  customColors: null,
  customLevels: null,
  customPrettifiers: {},
  errorLikeObjectKeys: ERROR_LIKE_KEYS,
  errorProps: '',
  hideObject: false,
  ignore: 'hostname',
  include: void 0,
  levelFirst: false,
  levelKey: LEVEL_KEY,
  levelLabel: LEVEL_LABEL,
  messageFormat: null,
  messageKey: MESSAGE_KEY,
  minimumLevel: void 0,
  outputStream: process.stdout,
  singleLine: false,
  timestampKey: TIMESTAMP_KEY,
  translateTime: true,
  useOnlyCustomProps: true,
};
function prettyFactory(options) {
  const context = parseFactoryOptions(Object.assign({}, defaultOptions, options));
  return pretty.bind({ ...context, context });
}
function build(opts = {}) {
  const pretty2 = prettyFactory(opts);
  return abstractTransport(
    function (source) {
      const stream = new Transform({
        objectMode: true,
        autoDestroy: true,
        transform(chunk, enc, cb) {
          const line = pretty2(chunk);
          cb(null, line);
        },
      });
      let destination;
      if (typeof opts.destination === 'object' && typeof opts.destination.write === 'function') {
        destination = opts.destination;
      } else {
        destination = buildSafeSonicBoom({
          dest: opts.destination || 1,
          append: opts.append,
          mkdir: opts.mkdir,
          sync: opts.sync,
          // by default sonic will be async
        });
      }
      source.on('unknown', function (line) {
        destination.write(line + '\n');
      });
      pump(source, stream, destination);
      return stream;
    },
    { parse: 'lines' }
  );
}
module.exports = build;
module.exports.prettyFactory = prettyFactory;
module.exports.colorizerFactory = colors;
module.exports.default = build;
