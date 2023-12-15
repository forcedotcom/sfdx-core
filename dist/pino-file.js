'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) =>
  function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

// node_modules/pino-std-serializers/lib/err-helpers.js
var require_err_helpers = __commonJS({
  'node_modules/pino-std-serializers/lib/err-helpers.js'(exports2, module2) {
    'use strict';
    var isErrorLike = (err) => {
      return err && typeof err.message === 'string';
    };
    var getErrorCause = (err) => {
      if (!err) return;
      const cause = err.cause;
      if (typeof cause === 'function') {
        const causeResult = err.cause();
        return isErrorLike(causeResult) ? causeResult : void 0;
      } else {
        return isErrorLike(cause) ? cause : void 0;
      }
    };
    var _stackWithCauses = (err, seen) => {
      if (!isErrorLike(err)) return '';
      const stack = err.stack || '';
      if (seen.has(err)) {
        return stack + '\ncauses have become circular...';
      }
      const cause = getErrorCause(err);
      if (cause) {
        seen.add(err);
        return stack + '\ncaused by: ' + _stackWithCauses(cause, seen);
      } else {
        return stack;
      }
    };
    var stackWithCauses = (err) => _stackWithCauses(err, /* @__PURE__ */ new Set());
    var _messageWithCauses = (err, seen, skip) => {
      if (!isErrorLike(err)) return '';
      const message = skip ? '' : err.message || '';
      if (seen.has(err)) {
        return message + ': ...';
      }
      const cause = getErrorCause(err);
      if (cause) {
        seen.add(err);
        const skipIfVErrorStyleCause = typeof err.cause === 'function';
        return message + (skipIfVErrorStyleCause ? '' : ': ') + _messageWithCauses(cause, seen, skipIfVErrorStyleCause);
      } else {
        return message;
      }
    };
    var messageWithCauses = (err) => _messageWithCauses(err, /* @__PURE__ */ new Set());
    module2.exports = {
      isErrorLike,
      getErrorCause,
      stackWithCauses,
      messageWithCauses,
    };
  },
});

// node_modules/pino-std-serializers/lib/err-proto.js
var require_err_proto = __commonJS({
  'node_modules/pino-std-serializers/lib/err-proto.js'(exports2, module2) {
    'use strict';
    var seen = Symbol('circular-ref-tag');
    var rawSymbol = Symbol('pino-raw-err-ref');
    var pinoErrProto = Object.create(
      {},
      {
        type: {
          enumerable: true,
          writable: true,
          value: void 0,
        },
        message: {
          enumerable: true,
          writable: true,
          value: void 0,
        },
        stack: {
          enumerable: true,
          writable: true,
          value: void 0,
        },
        aggregateErrors: {
          enumerable: true,
          writable: true,
          value: void 0,
        },
        raw: {
          enumerable: false,
          get: function () {
            return this[rawSymbol];
          },
          set: function (val) {
            this[rawSymbol] = val;
          },
        },
      }
    );
    Object.defineProperty(pinoErrProto, rawSymbol, {
      writable: true,
      value: {},
    });
    module2.exports = {
      pinoErrProto,
      pinoErrorSymbols: {
        seen,
        rawSymbol,
      },
    };
  },
});

// node_modules/pino-std-serializers/lib/err.js
var require_err = __commonJS({
  'node_modules/pino-std-serializers/lib/err.js'(exports2, module2) {
    'use strict';
    module2.exports = errSerializer;
    var { messageWithCauses, stackWithCauses, isErrorLike } = require_err_helpers();
    var { pinoErrProto, pinoErrorSymbols } = require_err_proto();
    var { seen } = pinoErrorSymbols;
    var { toString } = Object.prototype;
    function errSerializer(err) {
      if (!isErrorLike(err)) {
        return err;
      }
      err[seen] = void 0;
      const _err = Object.create(pinoErrProto);
      _err.type = toString.call(err.constructor) === '[object Function]' ? err.constructor.name : err.name;
      _err.message = messageWithCauses(err);
      _err.stack = stackWithCauses(err);
      if (Array.isArray(err.errors)) {
        _err.aggregateErrors = err.errors.map((err2) => errSerializer(err2));
      }
      for (const key in err) {
        if (_err[key] === void 0) {
          const val = err[key];
          if (isErrorLike(val)) {
            if (key !== 'cause' && !Object.prototype.hasOwnProperty.call(val, seen)) {
              _err[key] = errSerializer(val);
            }
          } else {
            _err[key] = val;
          }
        }
      }
      delete err[seen];
      _err.raw = err;
      return _err;
    }
  },
});

// node_modules/pino-std-serializers/lib/err-with-cause.js
var require_err_with_cause = __commonJS({
  'node_modules/pino-std-serializers/lib/err-with-cause.js'(exports2, module2) {
    'use strict';
    module2.exports = errWithCauseSerializer;
    var { isErrorLike } = require_err_helpers();
    var { pinoErrProto, pinoErrorSymbols } = require_err_proto();
    var { seen } = pinoErrorSymbols;
    var { toString } = Object.prototype;
    function errWithCauseSerializer(err) {
      if (!isErrorLike(err)) {
        return err;
      }
      err[seen] = void 0;
      const _err = Object.create(pinoErrProto);
      _err.type = toString.call(err.constructor) === '[object Function]' ? err.constructor.name : err.name;
      _err.message = err.message;
      _err.stack = err.stack;
      if (Array.isArray(err.errors)) {
        _err.aggregateErrors = err.errors.map((err2) => errWithCauseSerializer(err2));
      }
      if (isErrorLike(err.cause) && !Object.prototype.hasOwnProperty.call(err.cause, seen)) {
        _err.cause = errWithCauseSerializer(err.cause);
      }
      for (const key in err) {
        if (_err[key] === void 0) {
          const val = err[key];
          if (isErrorLike(val)) {
            if (!Object.prototype.hasOwnProperty.call(val, seen)) {
              _err[key] = errWithCauseSerializer(val);
            }
          } else {
            _err[key] = val;
          }
        }
      }
      delete err[seen];
      _err.raw = err;
      return _err;
    }
  },
});

// node_modules/pino-std-serializers/lib/req.js
var require_req = __commonJS({
  'node_modules/pino-std-serializers/lib/req.js'(exports2, module2) {
    'use strict';
    module2.exports = {
      mapHttpRequest,
      reqSerializer,
    };
    var rawSymbol = Symbol('pino-raw-req-ref');
    var pinoReqProto = Object.create(
      {},
      {
        id: {
          enumerable: true,
          writable: true,
          value: '',
        },
        method: {
          enumerable: true,
          writable: true,
          value: '',
        },
        url: {
          enumerable: true,
          writable: true,
          value: '',
        },
        query: {
          enumerable: true,
          writable: true,
          value: '',
        },
        params: {
          enumerable: true,
          writable: true,
          value: '',
        },
        headers: {
          enumerable: true,
          writable: true,
          value: {},
        },
        remoteAddress: {
          enumerable: true,
          writable: true,
          value: '',
        },
        remotePort: {
          enumerable: true,
          writable: true,
          value: '',
        },
        raw: {
          enumerable: false,
          get: function () {
            return this[rawSymbol];
          },
          set: function (val) {
            this[rawSymbol] = val;
          },
        },
      }
    );
    Object.defineProperty(pinoReqProto, rawSymbol, {
      writable: true,
      value: {},
    });
    function reqSerializer(req) {
      const connection = req.info || req.socket;
      const _req = Object.create(pinoReqProto);
      _req.id = typeof req.id === 'function' ? req.id() : req.id || (req.info ? req.info.id : void 0);
      _req.method = req.method;
      if (req.originalUrl) {
        _req.url = req.originalUrl;
      } else {
        const path = req.path;
        _req.url = typeof path === 'string' ? path : req.url ? req.url.path || req.url : void 0;
      }
      if (req.query) {
        _req.query = req.query;
      }
      if (req.params) {
        _req.params = req.params;
      }
      _req.headers = req.headers;
      _req.remoteAddress = connection && connection.remoteAddress;
      _req.remotePort = connection && connection.remotePort;
      _req.raw = req.raw || req;
      return _req;
    }
    function mapHttpRequest(req) {
      return {
        req: reqSerializer(req),
      };
    }
  },
});

// node_modules/pino-std-serializers/lib/res.js
var require_res = __commonJS({
  'node_modules/pino-std-serializers/lib/res.js'(exports2, module2) {
    'use strict';
    module2.exports = {
      mapHttpResponse,
      resSerializer,
    };
    var rawSymbol = Symbol('pino-raw-res-ref');
    var pinoResProto = Object.create(
      {},
      {
        statusCode: {
          enumerable: true,
          writable: true,
          value: 0,
        },
        headers: {
          enumerable: true,
          writable: true,
          value: '',
        },
        raw: {
          enumerable: false,
          get: function () {
            return this[rawSymbol];
          },
          set: function (val) {
            this[rawSymbol] = val;
          },
        },
      }
    );
    Object.defineProperty(pinoResProto, rawSymbol, {
      writable: true,
      value: {},
    });
    function resSerializer(res) {
      const _res = Object.create(pinoResProto);
      _res.statusCode = res.headersSent ? res.statusCode : null;
      _res.headers = res.getHeaders ? res.getHeaders() : res._headers;
      _res.raw = res;
      return _res;
    }
    function mapHttpResponse(res) {
      return {
        res: resSerializer(res),
      };
    }
  },
});

// node_modules/pino-std-serializers/index.js
var require_pino_std_serializers = __commonJS({
  'node_modules/pino-std-serializers/index.js'(exports2, module2) {
    'use strict';
    var errSerializer = require_err();
    var errWithCauseSerializer = require_err_with_cause();
    var reqSerializers = require_req();
    var resSerializers = require_res();
    module2.exports = {
      err: errSerializer,
      errWithCause: errWithCauseSerializer,
      mapHttpRequest: reqSerializers.mapHttpRequest,
      mapHttpResponse: resSerializers.mapHttpResponse,
      req: reqSerializers.reqSerializer,
      res: resSerializers.resSerializer,
      wrapErrorSerializer: function wrapErrorSerializer(customSerializer) {
        if (customSerializer === errSerializer) return customSerializer;
        return function wrapErrSerializer(err) {
          return customSerializer(errSerializer(err));
        };
      },
      wrapRequestSerializer: function wrapRequestSerializer(customSerializer) {
        if (customSerializer === reqSerializers.reqSerializer) return customSerializer;
        return function wrappedReqSerializer(req) {
          return customSerializer(reqSerializers.reqSerializer(req));
        };
      },
      wrapResponseSerializer: function wrapResponseSerializer(customSerializer) {
        if (customSerializer === resSerializers.resSerializer) return customSerializer;
        return function wrappedResSerializer(res) {
          return customSerializer(resSerializers.resSerializer(res));
        };
      },
    };
  },
});

// node_modules/pino/lib/caller.js
var require_caller = __commonJS({
  'node_modules/pino/lib/caller.js'(exports2, module2) {
    'use strict';
    function noOpPrepareStackTrace(_, stack) {
      return stack;
    }
    module2.exports = function getCallers() {
      const originalPrepare = Error.prepareStackTrace;
      Error.prepareStackTrace = noOpPrepareStackTrace;
      const stack = new Error().stack;
      Error.prepareStackTrace = originalPrepare;
      if (!Array.isArray(stack)) {
        return void 0;
      }
      const entries = stack.slice(2);
      const fileNames = [];
      for (const entry of entries) {
        if (!entry) {
          continue;
        }
        fileNames.push(entry.getFileName());
      }
      return fileNames;
    };
  },
});

// node_modules/fast-redact/lib/validator.js
var require_validator = __commonJS({
  'node_modules/fast-redact/lib/validator.js'(exports2, module2) {
    'use strict';
    module2.exports = validator;
    function validator(opts = {}) {
      const {
        ERR_PATHS_MUST_BE_STRINGS = () => 'fast-redact - Paths must be (non-empty) strings',
        ERR_INVALID_PATH = (s) => `fast-redact \u2013 Invalid path (${s})`,
      } = opts;
      return function validate({ paths }) {
        paths.forEach((s) => {
          if (typeof s !== 'string') {
            throw Error(ERR_PATHS_MUST_BE_STRINGS());
          }
          try {
            if (/〇/.test(s)) throw Error();
            const expr =
              (s[0] === '[' ? '' : '.') +
              s
                .replace(/^\*/, '\u3007')
                .replace(/\.\*/g, '.\u3007')
                .replace(/\[\*\]/g, '[\u3007]');
            if (/\n|\r|;/.test(expr)) throw Error();
            if (/\/\*/.test(expr)) throw Error();
            Function(`
            'use strict'
            const o = new Proxy({}, { get: () => o, set: () => { throw Error() } });
            const \u3007 = null;
            o${expr}
            if ([o${expr}].length !== 1) throw Error()`)();
          } catch (e) {
            throw Error(ERR_INVALID_PATH(s));
          }
        });
      };
    }
  },
});

// node_modules/fast-redact/lib/rx.js
var require_rx = __commonJS({
  'node_modules/fast-redact/lib/rx.js'(exports2, module2) {
    'use strict';
    module2.exports = /[^.[\]]+|\[((?:.)*?)\]/g;
  },
});

// node_modules/fast-redact/lib/parse.js
var require_parse = __commonJS({
  'node_modules/fast-redact/lib/parse.js'(exports2, module2) {
    'use strict';
    var rx = require_rx();
    module2.exports = parse;
    function parse({ paths }) {
      const wildcards = [];
      var wcLen = 0;
      const secret = paths.reduce(function (o, strPath, ix) {
        var path = strPath.match(rx).map((p) => p.replace(/'|"|`/g, ''));
        const leadingBracket = strPath[0] === '[';
        path = path.map((p) => {
          if (p[0] === '[') return p.substr(1, p.length - 2);
          else return p;
        });
        const star = path.indexOf('*');
        if (star > -1) {
          const before = path.slice(0, star);
          const beforeStr = before.join('.');
          const after = path.slice(star + 1, path.length);
          const nested = after.length > 0;
          wcLen++;
          wildcards.push({
            before,
            beforeStr,
            after,
            nested,
          });
        } else {
          o[strPath] = {
            path,
            val: void 0,
            precensored: false,
            circle: '',
            escPath: JSON.stringify(strPath),
            leadingBracket,
          };
        }
        return o;
      }, {});
      return { wildcards, wcLen, secret };
    }
  },
});

// node_modules/fast-redact/lib/redactor.js
var require_redactor = __commonJS({
  'node_modules/fast-redact/lib/redactor.js'(exports2, module2) {
    'use strict';
    var rx = require_rx();
    module2.exports = redactor;
    function redactor({ secret, serialize, wcLen, strict, isCensorFct, censorFctTakesPath }, state) {
      const redact = Function(
        'o',
        `
    if (typeof o !== 'object' || o == null) {
      ${strictImpl(strict, serialize)}
    }
    const { censor, secret } = this
    ${redactTmpl(secret, isCensorFct, censorFctTakesPath)}
    this.compileRestore()
    ${dynamicRedactTmpl(wcLen > 0, isCensorFct, censorFctTakesPath)}
    ${resultTmpl(serialize)}
  `
      ).bind(state);
      if (serialize === false) {
        redact.restore = (o) => state.restore(o);
      }
      return redact;
    }
    function redactTmpl(secret, isCensorFct, censorFctTakesPath) {
      return Object.keys(secret)
        .map((path) => {
          const { escPath, leadingBracket, path: arrPath } = secret[path];
          const skip = leadingBracket ? 1 : 0;
          const delim = leadingBracket ? '' : '.';
          const hops = [];
          var match;
          while ((match = rx.exec(path)) !== null) {
            const [, ix] = match;
            const { index, input } = match;
            if (index > skip) hops.push(input.substring(0, index - (ix ? 0 : 1)));
          }
          var existence = hops.map((p) => `o${delim}${p}`).join(' && ');
          if (existence.length === 0) existence += `o${delim}${path} != null`;
          else existence += ` && o${delim}${path} != null`;
          const circularDetection = `
      switch (true) {
        ${hops
          .reverse()
          .map(
            (p) => `
          case o${delim}${p} === censor:
            secret[${escPath}].circle = ${JSON.stringify(p)}
            break
        `
          )
          .join('\n')}
      }
    `;
          const censorArgs = censorFctTakesPath ? `val, ${JSON.stringify(arrPath)}` : `val`;
          return `
      if (${existence}) {
        const val = o${delim}${path}
        if (val === censor) {
          secret[${escPath}].precensored = true
        } else {
          secret[${escPath}].val = val
          o${delim}${path} = ${isCensorFct ? `censor(${censorArgs})` : 'censor'}
          ${circularDetection}
        }
      }
    `;
        })
        .join('\n');
    }
    function dynamicRedactTmpl(hasWildcards, isCensorFct, censorFctTakesPath) {
      return hasWildcards === true
        ? `
    {
      const { wildcards, wcLen, groupRedact, nestedRedact } = this
      for (var i = 0; i < wcLen; i++) {
        const { before, beforeStr, after, nested } = wildcards[i]
        if (nested === true) {
          secret[beforeStr] = secret[beforeStr] || []
          nestedRedact(secret[beforeStr], o, before, after, censor, ${isCensorFct}, ${censorFctTakesPath})
        } else secret[beforeStr] = groupRedact(o, before, censor, ${isCensorFct}, ${censorFctTakesPath})
      }
    }
  `
        : '';
    }
    function resultTmpl(serialize) {
      return serialize === false
        ? `return o`
        : `
    var s = this.serialize(o)
    this.restore(o)
    return s
  `;
    }
    function strictImpl(strict, serialize) {
      return strict === true
        ? `throw Error('fast-redact: primitives cannot be redacted')`
        : serialize === false
        ? `return o`
        : `return this.serialize(o)`;
    }
  },
});

// node_modules/fast-redact/lib/modifiers.js
var require_modifiers = __commonJS({
  'node_modules/fast-redact/lib/modifiers.js'(exports2, module2) {
    'use strict';
    module2.exports = {
      groupRedact,
      groupRestore,
      nestedRedact,
      nestedRestore,
    };
    function groupRestore({ keys, values, target }) {
      if (target == null) return;
      const length = keys.length;
      for (var i = 0; i < length; i++) {
        const k = keys[i];
        target[k] = values[i];
      }
    }
    function groupRedact(o, path, censor, isCensorFct, censorFctTakesPath) {
      const target = get(o, path);
      if (target == null) return { keys: null, values: null, target: null, flat: true };
      const keys = Object.keys(target);
      const keysLength = keys.length;
      const pathLength = path.length;
      const pathWithKey = censorFctTakesPath ? [...path] : void 0;
      const values = new Array(keysLength);
      for (var i = 0; i < keysLength; i++) {
        const key = keys[i];
        values[i] = target[key];
        if (censorFctTakesPath) {
          pathWithKey[pathLength] = key;
          target[key] = censor(target[key], pathWithKey);
        } else if (isCensorFct) {
          target[key] = censor(target[key]);
        } else {
          target[key] = censor;
        }
      }
      return { keys, values, target, flat: true };
    }
    function nestedRestore(arr) {
      const length = arr.length;
      for (var i = 0; i < length; i++) {
        const { key, target, value, level } = arr[i];
        if (level === 0 || level === 1) {
          if (has(target, key)) {
            target[key] = value;
          }
          if (typeof target === 'object') {
            const targetKeys = Object.keys(target);
            for (var j = 0; j < targetKeys.length; j++) {
              const tKey = targetKeys[j];
              const subTarget = target[tKey];
              if (has(subTarget, key)) {
                subTarget[key] = value;
              }
            }
          }
        } else {
          restoreNthLevel(key, target, value, level);
        }
      }
    }
    function nestedRedact(store, o, path, ns, censor, isCensorFct, censorFctTakesPath) {
      const target = get(o, path);
      if (target == null) return;
      const keys = Object.keys(target);
      const keysLength = keys.length;
      for (var i = 0; i < keysLength; i++) {
        const key = keys[i];
        const { value, parent, exists, level } = specialSet(
          target,
          key,
          path,
          ns,
          censor,
          isCensorFct,
          censorFctTakesPath
        );
        if (exists === true && parent !== null) {
          store.push({ key: ns[ns.length - 1], target: parent, value, level });
        }
      }
      return store;
    }
    function has(obj, prop) {
      return obj !== void 0 && obj !== null
        ? 'hasOwn' in Object
          ? Object.hasOwn(obj, prop)
          : Object.prototype.hasOwnProperty.call(obj, prop)
        : false;
    }
    function specialSet(o, k, path, afterPath, censor, isCensorFct, censorFctTakesPath) {
      const afterPathLen = afterPath.length;
      const lastPathIndex = afterPathLen - 1;
      const originalKey = k;
      var i = -1;
      var n;
      var nv;
      var ov;
      var oov = null;
      var exists = true;
      var wc = null;
      var kIsWc;
      var wcov;
      var consecutive = false;
      var level = 0;
      ov = n = o[k];
      if (typeof n !== 'object') return { value: null, parent: null, exists };
      while (n != null && ++i < afterPathLen) {
        k = afterPath[i];
        oov = ov;
        if (k !== '*' && !wc && !(typeof n === 'object' && k in n)) {
          exists = false;
          break;
        }
        if (k === '*') {
          if (wc === '*') {
            consecutive = true;
          }
          wc = k;
          if (i !== lastPathIndex) {
            continue;
          }
        }
        if (wc) {
          const wcKeys = Object.keys(n);
          for (var j = 0; j < wcKeys.length; j++) {
            const wck = wcKeys[j];
            wcov = n[wck];
            kIsWc = k === '*';
            if (consecutive) {
              level = i;
              ov = iterateNthLevel(
                wcov,
                level - 1,
                k,
                path,
                afterPath,
                censor,
                isCensorFct,
                censorFctTakesPath,
                originalKey,
                n,
                nv,
                ov,
                kIsWc,
                wck,
                i,
                lastPathIndex,
                exists
              );
            } else {
              if (kIsWc || (typeof wcov === 'object' && wcov !== null && k in wcov)) {
                if (kIsWc) {
                  ov = wcov;
                } else {
                  ov = wcov[k];
                }
                nv =
                  i !== lastPathIndex
                    ? ov
                    : isCensorFct
                    ? censorFctTakesPath
                      ? censor(ov, [...path, originalKey, ...afterPath])
                      : censor(ov)
                    : censor;
                if (kIsWc) {
                  n[wck] = nv;
                } else {
                  if (wcov[k] === nv) {
                    exists = false;
                  } else {
                    wcov[k] = (nv === void 0 && censor !== void 0) || (has(wcov, k) && nv === ov) ? wcov[k] : nv;
                  }
                }
              }
            }
          }
          wc = null;
        } else {
          ov = n[k];
          nv =
            i !== lastPathIndex
              ? ov
              : isCensorFct
              ? censorFctTakesPath
                ? censor(ov, [...path, originalKey, ...afterPath])
                : censor(ov)
              : censor;
          n[k] = (has(n, k) && nv === ov) || (nv === void 0 && censor !== void 0) ? n[k] : nv;
          n = n[k];
        }
        if (typeof n !== 'object') break;
        if (ov === oov || typeof ov === 'undefined') {
          exists = false;
        }
      }
      return { value: ov, parent: oov, exists, level };
    }
    function get(o, p) {
      var i = -1;
      var l = p.length;
      var n = o;
      while (n != null && ++i < l) {
        n = n[p[i]];
      }
      return n;
    }
    function iterateNthLevel(
      wcov,
      level,
      k,
      path,
      afterPath,
      censor,
      isCensorFct,
      censorFctTakesPath,
      originalKey,
      n,
      nv,
      ov,
      kIsWc,
      wck,
      i,
      lastPathIndex,
      exists
    ) {
      if (level === 0) {
        if (kIsWc || (typeof wcov === 'object' && wcov !== null && k in wcov)) {
          if (kIsWc) {
            ov = wcov;
          } else {
            ov = wcov[k];
          }
          nv =
            i !== lastPathIndex
              ? ov
              : isCensorFct
              ? censorFctTakesPath
                ? censor(ov, [...path, originalKey, ...afterPath])
                : censor(ov)
              : censor;
          if (kIsWc) {
            n[wck] = nv;
          } else {
            if (wcov[k] === nv) {
              exists = false;
            } else {
              wcov[k] = (nv === void 0 && censor !== void 0) || (has(wcov, k) && nv === ov) ? wcov[k] : nv;
            }
          }
        }
        return ov;
      }
      for (const key in wcov) {
        if (typeof wcov[key] === 'object') {
          var temp = iterateNthLevel(
            wcov[key],
            level - 1,
            k,
            path,
            afterPath,
            censor,
            isCensorFct,
            censorFctTakesPath,
            originalKey,
            n,
            nv,
            ov,
            kIsWc,
            wck,
            i,
            lastPathIndex,
            exists
          );
          return temp;
        }
      }
    }
    function restoreNthLevel(key, target, value, level) {
      if (level === 0) {
        if (has(target, key)) {
          target[key] = value;
        }
        return;
      }
      for (const objKey in target) {
        if (typeof target[objKey] === 'object') {
          restoreNthLevel(key, target[objKey], value, level - 1);
        }
      }
    }
  },
});

// node_modules/fast-redact/lib/restorer.js
var require_restorer = __commonJS({
  'node_modules/fast-redact/lib/restorer.js'(exports2, module2) {
    'use strict';
    var { groupRestore, nestedRestore } = require_modifiers();
    module2.exports = restorer;
    function restorer({ secret, wcLen }) {
      return function compileRestore() {
        if (this.restore) return;
        const paths = Object.keys(secret);
        const resetters = resetTmpl(secret, paths);
        const hasWildcards = wcLen > 0;
        const state = hasWildcards ? { secret, groupRestore, nestedRestore } : { secret };
        this.restore = Function('o', restoreTmpl(resetters, paths, hasWildcards)).bind(state);
      };
    }
    function resetTmpl(secret, paths) {
      return paths
        .map((path) => {
          const { circle, escPath, leadingBracket } = secret[path];
          const delim = leadingBracket ? '' : '.';
          const reset = circle ? `o.${circle} = secret[${escPath}].val` : `o${delim}${path} = secret[${escPath}].val`;
          const clear = `secret[${escPath}].val = undefined`;
          return `
      if (secret[${escPath}].val !== undefined) {
        try { ${reset} } catch (e) {}
        ${clear}
      }
    `;
        })
        .join('');
    }
    function restoreTmpl(resetters, paths, hasWildcards) {
      const dynamicReset =
        hasWildcards === true
          ? `
    const keys = Object.keys(secret)
    const len = keys.length
    for (var i = len - 1; i >= ${paths.length}; i--) {
      const k = keys[i]
      const o = secret[k]
      if (o.flat === true) this.groupRestore(o)
      else this.nestedRestore(o)
      secret[k] = null
    }
  `
          : '';
      return `
    const secret = this.secret
    ${dynamicReset}
    ${resetters}
    return o
  `;
    }
  },
});

// node_modules/fast-redact/lib/state.js
var require_state = __commonJS({
  'node_modules/fast-redact/lib/state.js'(exports2, module2) {
    'use strict';
    module2.exports = state;
    function state(o) {
      const { secret, censor, compileRestore, serialize, groupRedact, nestedRedact, wildcards, wcLen } = o;
      const builder = [{ secret, censor, compileRestore }];
      if (serialize !== false) builder.push({ serialize });
      if (wcLen > 0) builder.push({ groupRedact, nestedRedact, wildcards, wcLen });
      return Object.assign(...builder);
    }
  },
});

// node_modules/fast-redact/index.js
var require_fast_redact = __commonJS({
  'node_modules/fast-redact/index.js'(exports2, module2) {
    'use strict';
    var validator = require_validator();
    var parse = require_parse();
    var redactor = require_redactor();
    var restorer = require_restorer();
    var { groupRedact, nestedRedact } = require_modifiers();
    var state = require_state();
    var rx = require_rx();
    var validate = validator();
    var noop = (o) => o;
    noop.restore = noop;
    var DEFAULT_CENSOR = '[REDACTED]';
    fastRedact.rx = rx;
    fastRedact.validator = validator;
    module2.exports = fastRedact;
    function fastRedact(opts = {}) {
      const paths = Array.from(new Set(opts.paths || []));
      const serialize =
        'serialize' in opts
          ? opts.serialize === false
            ? opts.serialize
            : typeof opts.serialize === 'function'
            ? opts.serialize
            : JSON.stringify
          : JSON.stringify;
      const remove = opts.remove;
      if (remove === true && serialize !== JSON.stringify) {
        throw Error('fast-redact \u2013 remove option may only be set when serializer is JSON.stringify');
      }
      const censor = remove === true ? void 0 : 'censor' in opts ? opts.censor : DEFAULT_CENSOR;
      const isCensorFct = typeof censor === 'function';
      const censorFctTakesPath = isCensorFct && censor.length > 1;
      if (paths.length === 0) return serialize || noop;
      validate({ paths, serialize, censor });
      const { wildcards, wcLen, secret } = parse({ paths, censor });
      const compileRestore = restorer({ secret, wcLen });
      const strict = 'strict' in opts ? opts.strict : true;
      return redactor(
        { secret, wcLen, serialize, strict, isCensorFct, censorFctTakesPath },
        state({
          secret,
          censor,
          compileRestore,
          serialize,
          groupRedact,
          nestedRedact,
          wildcards,
          wcLen,
        })
      );
    }
  },
});

// node_modules/pino/lib/symbols.js
var require_symbols = __commonJS({
  'node_modules/pino/lib/symbols.js'(exports2, module2) {
    'use strict';
    var setLevelSym = Symbol('pino.setLevel');
    var getLevelSym = Symbol('pino.getLevel');
    var levelValSym = Symbol('pino.levelVal');
    var useLevelLabelsSym = Symbol('pino.useLevelLabels');
    var useOnlyCustomLevelsSym = Symbol('pino.useOnlyCustomLevels');
    var mixinSym = Symbol('pino.mixin');
    var lsCacheSym = Symbol('pino.lsCache');
    var chindingsSym = Symbol('pino.chindings');
    var asJsonSym = Symbol('pino.asJson');
    var writeSym = Symbol('pino.write');
    var redactFmtSym = Symbol('pino.redactFmt');
    var timeSym = Symbol('pino.time');
    var timeSliceIndexSym = Symbol('pino.timeSliceIndex');
    var streamSym = Symbol('pino.stream');
    var stringifySym = Symbol('pino.stringify');
    var stringifySafeSym = Symbol('pino.stringifySafe');
    var stringifiersSym = Symbol('pino.stringifiers');
    var endSym = Symbol('pino.end');
    var formatOptsSym = Symbol('pino.formatOpts');
    var messageKeySym = Symbol('pino.messageKey');
    var errorKeySym = Symbol('pino.errorKey');
    var nestedKeySym = Symbol('pino.nestedKey');
    var nestedKeyStrSym = Symbol('pino.nestedKeyStr');
    var mixinMergeStrategySym = Symbol('pino.mixinMergeStrategy');
    var msgPrefixSym = Symbol('pino.msgPrefix');
    var wildcardFirstSym = Symbol('pino.wildcardFirst');
    var serializersSym = Symbol.for('pino.serializers');
    var formattersSym = Symbol.for('pino.formatters');
    var hooksSym = Symbol.for('pino.hooks');
    var needsMetadataGsym = Symbol.for('pino.metadata');
    module2.exports = {
      setLevelSym,
      getLevelSym,
      levelValSym,
      useLevelLabelsSym,
      mixinSym,
      lsCacheSym,
      chindingsSym,
      asJsonSym,
      writeSym,
      serializersSym,
      redactFmtSym,
      timeSym,
      timeSliceIndexSym,
      streamSym,
      stringifySym,
      stringifySafeSym,
      stringifiersSym,
      endSym,
      formatOptsSym,
      messageKeySym,
      errorKeySym,
      nestedKeySym,
      wildcardFirstSym,
      needsMetadataGsym,
      useOnlyCustomLevelsSym,
      formattersSym,
      hooksSym,
      nestedKeyStrSym,
      mixinMergeStrategySym,
      msgPrefixSym,
    };
  },
});

// node_modules/pino/lib/redaction.js
var require_redaction = __commonJS({
  'node_modules/pino/lib/redaction.js'(exports2, module2) {
    'use strict';
    var fastRedact = require_fast_redact();
    var { redactFmtSym, wildcardFirstSym } = require_symbols();
    var { rx, validator } = fastRedact;
    var validate = validator({
      ERR_PATHS_MUST_BE_STRINGS: () => 'pino \u2013 redacted paths must be strings',
      ERR_INVALID_PATH: (s) => `pino \u2013 redact paths array contains an invalid path (${s})`,
    });
    var CENSOR = '[Redacted]';
    var strict = false;
    function redaction(opts, serialize) {
      const { paths, censor } = handle(opts);
      const shape = paths.reduce((o, str) => {
        rx.lastIndex = 0;
        const first = rx.exec(str);
        const next = rx.exec(str);
        let ns = first[1] !== void 0 ? first[1].replace(/^(?:"|'|`)(.*)(?:"|'|`)$/, '$1') : first[0];
        if (ns === '*') {
          ns = wildcardFirstSym;
        }
        if (next === null) {
          o[ns] = null;
          return o;
        }
        if (o[ns] === null) {
          return o;
        }
        const { index } = next;
        const nextPath = `${str.substr(index, str.length - 1)}`;
        o[ns] = o[ns] || [];
        if (ns !== wildcardFirstSym && o[ns].length === 0) {
          o[ns].push(...(o[wildcardFirstSym] || []));
        }
        if (ns === wildcardFirstSym) {
          Object.keys(o).forEach(function (k) {
            if (o[k]) {
              o[k].push(nextPath);
            }
          });
        }
        o[ns].push(nextPath);
        return o;
      }, {});
      const result = {
        [redactFmtSym]: fastRedact({ paths, censor, serialize, strict }),
      };
      const topCensor = (...args) => {
        return typeof censor === 'function' ? serialize(censor(...args)) : serialize(censor);
      };
      return [...Object.keys(shape), ...Object.getOwnPropertySymbols(shape)].reduce((o, k) => {
        if (shape[k] === null) {
          o[k] = (value) => topCensor(value, [k]);
        } else {
          const wrappedCensor =
            typeof censor === 'function'
              ? (value, path) => {
                  return censor(value, [k, ...path]);
                }
              : censor;
          o[k] = fastRedact({
            paths: shape[k],
            censor: wrappedCensor,
            serialize,
            strict,
          });
        }
        return o;
      }, result);
    }
    function handle(opts) {
      if (Array.isArray(opts)) {
        opts = { paths: opts, censor: CENSOR };
        validate(opts);
        return opts;
      }
      let { paths, censor = CENSOR, remove } = opts;
      if (Array.isArray(paths) === false) {
        throw Error('pino \u2013 redact must contain an array of strings');
      }
      if (remove === true) censor = void 0;
      validate({ paths, censor });
      return { paths, censor };
    }
    module2.exports = redaction;
  },
});

// node_modules/pino/lib/time.js
var require_time = __commonJS({
  'node_modules/pino/lib/time.js'(exports2, module2) {
    'use strict';
    var nullTime = () => '';
    var epochTime = () => `,"time":${Date.now()}`;
    var unixTime = () => `,"time":${Math.round(Date.now() / 1e3)}`;
    var isoTime = () => `,"time":"${new Date(Date.now()).toISOString()}"`;
    module2.exports = { nullTime, epochTime, unixTime, isoTime };
  },
});

// node_modules/quick-format-unescaped/index.js
var require_quick_format_unescaped = __commonJS({
  'node_modules/quick-format-unescaped/index.js'(exports2, module2) {
    'use strict';
    function tryStringify(o) {
      try {
        return JSON.stringify(o);
      } catch (e) {
        return '"[Circular]"';
      }
    }
    module2.exports = format;
    function format(f, args, opts) {
      var ss = (opts && opts.stringify) || tryStringify;
      var offset = 1;
      if (typeof f === 'object' && f !== null) {
        var len = args.length + offset;
        if (len === 1) return f;
        var objects = new Array(len);
        objects[0] = ss(f);
        for (var index = 1; index < len; index++) {
          objects[index] = ss(args[index]);
        }
        return objects.join(' ');
      }
      if (typeof f !== 'string') {
        return f;
      }
      var argLen = args.length;
      if (argLen === 0) return f;
      var str = '';
      var a = 1 - offset;
      var lastPos = -1;
      var flen = (f && f.length) || 0;
      for (var i = 0; i < flen; ) {
        if (f.charCodeAt(i) === 37 && i + 1 < flen) {
          lastPos = lastPos > -1 ? lastPos : 0;
          switch (f.charCodeAt(i + 1)) {
            case 100:
            case 102:
              if (a >= argLen) break;
              if (args[a] == null) break;
              if (lastPos < i) str += f.slice(lastPos, i);
              str += Number(args[a]);
              lastPos = i + 2;
              i++;
              break;
            case 105:
              if (a >= argLen) break;
              if (args[a] == null) break;
              if (lastPos < i) str += f.slice(lastPos, i);
              str += Math.floor(Number(args[a]));
              lastPos = i + 2;
              i++;
              break;
            case 79:
            case 111:
            case 106:
              if (a >= argLen) break;
              if (args[a] === void 0) break;
              if (lastPos < i) str += f.slice(lastPos, i);
              var type = typeof args[a];
              if (type === 'string') {
                str += "'" + args[a] + "'";
                lastPos = i + 2;
                i++;
                break;
              }
              if (type === 'function') {
                str += args[a].name || '<anonymous>';
                lastPos = i + 2;
                i++;
                break;
              }
              str += ss(args[a]);
              lastPos = i + 2;
              i++;
              break;
            case 115:
              if (a >= argLen) break;
              if (lastPos < i) str += f.slice(lastPos, i);
              str += String(args[a]);
              lastPos = i + 2;
              i++;
              break;
            case 37:
              if (lastPos < i) str += f.slice(lastPos, i);
              str += '%';
              lastPos = i + 2;
              i++;
              a--;
              break;
          }
          ++a;
        }
        ++i;
      }
      if (lastPos === -1) return f;
      else if (lastPos < flen) {
        str += f.slice(lastPos);
      }
      return str;
    }
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

// node_modules/thread-stream/package.json
var require_package = __commonJS({
  'node_modules/thread-stream/package.json'(exports2, module2) {
    module2.exports = {
      name: 'thread-stream',
      version: '2.3.0',
      description: 'A streaming way to send data to a Node.js Worker Thread',
      main: 'index.js',
      types: 'index.d.ts',
      dependencies: {
        'real-require': '^0.2.0',
      },
      devDependencies: {
        '@types/node': '^18.0.0',
        '@types/tap': '^15.0.0',
        desm: '^1.3.0',
        fastbench: '^1.0.1',
        husky: '^8.0.1',
        'sonic-boom': '^3.0.0',
        standard: '^17.0.0',
        tap: '^16.2.0',
        'ts-node': '^10.8.0',
        typescript: '^4.7.2',
        'why-is-node-running': '^2.2.2',
      },
      scripts: {
        test: 'standard && npm run transpile && tap test/*.test.*js && tap --ts test/*.test.*ts',
        'test:ci': 'standard && npm run transpile && npm run test:ci:js && npm run test:ci:ts',
        'test:ci:js': 'tap --no-check-coverage --coverage-report=lcovonly "test/**/*.test.*js"',
        'test:ci:ts': 'tap --ts --no-check-coverage --coverage-report=lcovonly "test/**/*.test.*ts"',
        'test:yarn': 'npm run transpile && tap "test/**/*.test.js" --no-check-coverage',
        transpile: 'sh ./test/ts/transpile.sh',
        prepare: 'husky install',
      },
      standard: { ignore: ['test/ts/**/*'] },
      repository: {
        type: 'git',
        url: 'git+https://github.com/mcollina/thread-stream.git',
      },
      keywords: ['worker', 'thread', 'threads', 'stream'],
      author: 'Matteo Collina <hello@matteocollina.com>',
      license: 'MIT',
      bugs: {
        url: 'https://github.com/mcollina/thread-stream/issues',
      },
      homepage: 'https://github.com/mcollina/thread-stream#readme',
    };
  },
});

// node_modules/thread-stream/lib/wait.js
var require_wait = __commonJS({
  'node_modules/thread-stream/lib/wait.js'(exports2, module2) {
    'use strict';
    var MAX_TIMEOUT = 1e3;
    function wait(state, index, expected, timeout, done) {
      const max = Date.now() + timeout;
      let current = Atomics.load(state, index);
      if (current === expected) {
        done(null, 'ok');
        return;
      }
      let prior = current;
      const check = (backoff) => {
        if (Date.now() > max) {
          done(null, 'timed-out');
        } else {
          setTimeout(() => {
            prior = current;
            current = Atomics.load(state, index);
            if (current === prior) {
              check(backoff >= MAX_TIMEOUT ? MAX_TIMEOUT : backoff * 2);
            } else {
              if (current === expected) done(null, 'ok');
              else done(null, 'not-equal');
            }
          }, backoff);
        }
      };
      check(1);
    }
    function waitDiff(state, index, expected, timeout, done) {
      const max = Date.now() + timeout;
      let current = Atomics.load(state, index);
      if (current !== expected) {
        done(null, 'ok');
        return;
      }
      const check = (backoff) => {
        if (Date.now() > max) {
          done(null, 'timed-out');
        } else {
          setTimeout(() => {
            current = Atomics.load(state, index);
            if (current !== expected) {
              done(null, 'ok');
            } else {
              check(backoff >= MAX_TIMEOUT ? MAX_TIMEOUT : backoff * 2);
            }
          }, backoff);
        }
      };
      check(1);
    }
    module2.exports = { wait, waitDiff };
  },
});

// node_modules/thread-stream/lib/indexes.js
var require_indexes = __commonJS({
  'node_modules/thread-stream/lib/indexes.js'(exports2, module2) {
    'use strict';
    var WRITE_INDEX = 4;
    var READ_INDEX = 8;
    module2.exports = {
      WRITE_INDEX,
      READ_INDEX,
    };
  },
});

// node_modules/thread-stream/index.js
var require_thread_stream = __commonJS({
  'node_modules/thread-stream/index.js'(exports2, module2) {
    'use strict';
    var { version } = require_package();
    var { EventEmitter } = require('events');
    var { Worker } = require('worker_threads');
    var { join } = require('path');
    var { pathToFileURL } = require('url');
    var { wait } = require_wait();
    var { WRITE_INDEX, READ_INDEX } = require_indexes();
    var buffer = require('buffer');
    var assert = require('assert');
    var kImpl = Symbol('kImpl');
    var MAX_STRING = buffer.constants.MAX_STRING_LENGTH;
    var FakeWeakRef = class {
      constructor(value) {
        this._value = value;
      }
      deref() {
        return this._value;
      }
    };
    var FinalizationRegistry2 =
      global.FinalizationRegistry ||
      class FakeFinalizationRegistry {
        register() {}
        unregister() {}
      };
    var WeakRef2 = global.WeakRef || FakeWeakRef;
    var registry = new FinalizationRegistry2((worker) => {
      if (worker.exited) {
        return;
      }
      worker.terminate();
    });
    function createWorker(stream, opts) {
      const { filename, workerData } = opts;
      const bundlerOverrides = '__bundlerPathsOverrides' in globalThis ? globalThis.__bundlerPathsOverrides : {};
      const toExecute = bundlerOverrides['thread-stream-worker'] || join(__dirname, 'lib', 'worker.js');
      const worker = new Worker(toExecute, {
        ...opts.workerOpts,
        trackUnmanagedFds: false,
        workerData: {
          filename: filename.indexOf('file://') === 0 ? filename : pathToFileURL(filename).href,
          dataBuf: stream[kImpl].dataBuf,
          stateBuf: stream[kImpl].stateBuf,
          workerData: {
            $context: {
              threadStreamVersion: version,
            },
            ...workerData,
          },
        },
      });
      worker.stream = new FakeWeakRef(stream);
      worker.on('message', onWorkerMessage);
      worker.on('exit', onWorkerExit);
      registry.register(stream, worker);
      return worker;
    }
    function drain(stream) {
      assert(!stream[kImpl].sync);
      if (stream[kImpl].needDrain) {
        stream[kImpl].needDrain = false;
        stream.emit('drain');
      }
    }
    function nextFlush(stream) {
      const writeIndex = Atomics.load(stream[kImpl].state, WRITE_INDEX);
      let leftover = stream[kImpl].data.length - writeIndex;
      if (leftover > 0) {
        if (stream[kImpl].buf.length === 0) {
          stream[kImpl].flushing = false;
          if (stream[kImpl].ending) {
            end(stream);
          } else if (stream[kImpl].needDrain) {
            process.nextTick(drain, stream);
          }
          return;
        }
        let toWrite = stream[kImpl].buf.slice(0, leftover);
        let toWriteBytes = Buffer.byteLength(toWrite);
        if (toWriteBytes <= leftover) {
          stream[kImpl].buf = stream[kImpl].buf.slice(leftover);
          write(stream, toWrite, nextFlush.bind(null, stream));
        } else {
          stream.flush(() => {
            if (stream.destroyed) {
              return;
            }
            Atomics.store(stream[kImpl].state, READ_INDEX, 0);
            Atomics.store(stream[kImpl].state, WRITE_INDEX, 0);
            while (toWriteBytes > stream[kImpl].data.length) {
              leftover = leftover / 2;
              toWrite = stream[kImpl].buf.slice(0, leftover);
              toWriteBytes = Buffer.byteLength(toWrite);
            }
            stream[kImpl].buf = stream[kImpl].buf.slice(leftover);
            write(stream, toWrite, nextFlush.bind(null, stream));
          });
        }
      } else if (leftover === 0) {
        if (writeIndex === 0 && stream[kImpl].buf.length === 0) {
          return;
        }
        stream.flush(() => {
          Atomics.store(stream[kImpl].state, READ_INDEX, 0);
          Atomics.store(stream[kImpl].state, WRITE_INDEX, 0);
          nextFlush(stream);
        });
      } else {
        destroy(stream, new Error('overwritten'));
      }
    }
    function onWorkerMessage(msg) {
      const stream = this.stream.deref();
      if (stream === void 0) {
        this.exited = true;
        this.terminate();
        return;
      }
      switch (msg.code) {
        case 'READY':
          this.stream = new WeakRef2(stream);
          stream.flush(() => {
            stream[kImpl].ready = true;
            stream.emit('ready');
          });
          break;
        case 'ERROR':
          destroy(stream, msg.err);
          break;
        case 'EVENT':
          if (Array.isArray(msg.args)) {
            stream.emit(msg.name, ...msg.args);
          } else {
            stream.emit(msg.name, msg.args);
          }
          break;
        default:
          destroy(stream, new Error('this should not happen: ' + msg.code));
      }
    }
    function onWorkerExit(code) {
      const stream = this.stream.deref();
      if (stream === void 0) {
        return;
      }
      registry.unregister(stream);
      stream.worker.exited = true;
      stream.worker.off('exit', onWorkerExit);
      destroy(stream, code !== 0 ? new Error('the worker thread exited') : null);
    }
    var ThreadStream = class extends EventEmitter {
      constructor(opts = {}) {
        super();
        if (opts.bufferSize < 4) {
          throw new Error('bufferSize must at least fit a 4-byte utf-8 char');
        }
        this[kImpl] = {};
        this[kImpl].stateBuf = new SharedArrayBuffer(128);
        this[kImpl].state = new Int32Array(this[kImpl].stateBuf);
        this[kImpl].dataBuf = new SharedArrayBuffer(opts.bufferSize || 4 * 1024 * 1024);
        this[kImpl].data = Buffer.from(this[kImpl].dataBuf);
        this[kImpl].sync = opts.sync || false;
        this[kImpl].ending = false;
        this[kImpl].ended = false;
        this[kImpl].needDrain = false;
        this[kImpl].destroyed = false;
        this[kImpl].flushing = false;
        this[kImpl].ready = false;
        this[kImpl].finished = false;
        this[kImpl].errored = null;
        this[kImpl].closed = false;
        this[kImpl].buf = '';
        this.worker = createWorker(this, opts);
      }
      write(data) {
        if (this[kImpl].destroyed) {
          error(this, new Error('the worker has exited'));
          return false;
        }
        if (this[kImpl].ending) {
          error(this, new Error('the worker is ending'));
          return false;
        }
        if (this[kImpl].flushing && this[kImpl].buf.length + data.length >= MAX_STRING) {
          try {
            writeSync(this);
            this[kImpl].flushing = true;
          } catch (err) {
            destroy(this, err);
            return false;
          }
        }
        this[kImpl].buf += data;
        if (this[kImpl].sync) {
          try {
            writeSync(this);
            return true;
          } catch (err) {
            destroy(this, err);
            return false;
          }
        }
        if (!this[kImpl].flushing) {
          this[kImpl].flushing = true;
          setImmediate(nextFlush, this);
        }
        this[kImpl].needDrain =
          this[kImpl].data.length - this[kImpl].buf.length - Atomics.load(this[kImpl].state, WRITE_INDEX) <= 0;
        return !this[kImpl].needDrain;
      }
      end() {
        if (this[kImpl].destroyed) {
          return;
        }
        this[kImpl].ending = true;
        end(this);
      }
      flush(cb) {
        if (this[kImpl].destroyed) {
          if (typeof cb === 'function') {
            process.nextTick(cb, new Error('the worker has exited'));
          }
          return;
        }
        const writeIndex = Atomics.load(this[kImpl].state, WRITE_INDEX);
        wait(this[kImpl].state, READ_INDEX, writeIndex, Infinity, (err, res) => {
          if (err) {
            destroy(this, err);
            process.nextTick(cb, err);
            return;
          }
          if (res === 'not-equal') {
            this.flush(cb);
            return;
          }
          process.nextTick(cb);
        });
      }
      flushSync() {
        if (this[kImpl].destroyed) {
          return;
        }
        writeSync(this);
        flushSync(this);
      }
      unref() {
        this.worker.unref();
      }
      ref() {
        this.worker.ref();
      }
      get ready() {
        return this[kImpl].ready;
      }
      get destroyed() {
        return this[kImpl].destroyed;
      }
      get closed() {
        return this[kImpl].closed;
      }
      get writable() {
        return !this[kImpl].destroyed && !this[kImpl].ending;
      }
      get writableEnded() {
        return this[kImpl].ending;
      }
      get writableFinished() {
        return this[kImpl].finished;
      }
      get writableNeedDrain() {
        return this[kImpl].needDrain;
      }
      get writableObjectMode() {
        return false;
      }
      get writableErrored() {
        return this[kImpl].errored;
      }
    };
    function error(stream, err) {
      setImmediate(() => {
        stream.emit('error', err);
      });
    }
    function destroy(stream, err) {
      if (stream[kImpl].destroyed) {
        return;
      }
      stream[kImpl].destroyed = true;
      if (err) {
        stream[kImpl].errored = err;
        error(stream, err);
      }
      if (!stream.worker.exited) {
        stream.worker
          .terminate()
          .catch(() => {})
          .then(() => {
            stream[kImpl].closed = true;
            stream.emit('close');
          });
      } else {
        setImmediate(() => {
          stream[kImpl].closed = true;
          stream.emit('close');
        });
      }
    }
    function write(stream, data, cb) {
      const current = Atomics.load(stream[kImpl].state, WRITE_INDEX);
      const length = Buffer.byteLength(data);
      stream[kImpl].data.write(data, current);
      Atomics.store(stream[kImpl].state, WRITE_INDEX, current + length);
      Atomics.notify(stream[kImpl].state, WRITE_INDEX);
      cb();
      return true;
    }
    function end(stream) {
      if (stream[kImpl].ended || !stream[kImpl].ending || stream[kImpl].flushing) {
        return;
      }
      stream[kImpl].ended = true;
      try {
        stream.flushSync();
        let readIndex = Atomics.load(stream[kImpl].state, READ_INDEX);
        Atomics.store(stream[kImpl].state, WRITE_INDEX, -1);
        Atomics.notify(stream[kImpl].state, WRITE_INDEX);
        let spins = 0;
        while (readIndex !== -1) {
          Atomics.wait(stream[kImpl].state, READ_INDEX, readIndex, 1e3);
          readIndex = Atomics.load(stream[kImpl].state, READ_INDEX);
          if (readIndex === -2) {
            destroy(stream, new Error('end() failed'));
            return;
          }
          if (++spins === 10) {
            destroy(stream, new Error('end() took too long (10s)'));
            return;
          }
        }
        process.nextTick(() => {
          stream[kImpl].finished = true;
          stream.emit('finish');
        });
      } catch (err) {
        destroy(stream, err);
      }
    }
    function writeSync(stream) {
      const cb = () => {
        if (stream[kImpl].ending) {
          end(stream);
        } else if (stream[kImpl].needDrain) {
          process.nextTick(drain, stream);
        }
      };
      stream[kImpl].flushing = false;
      while (stream[kImpl].buf.length !== 0) {
        const writeIndex = Atomics.load(stream[kImpl].state, WRITE_INDEX);
        let leftover = stream[kImpl].data.length - writeIndex;
        if (leftover === 0) {
          flushSync(stream);
          Atomics.store(stream[kImpl].state, READ_INDEX, 0);
          Atomics.store(stream[kImpl].state, WRITE_INDEX, 0);
          continue;
        } else if (leftover < 0) {
          throw new Error('overwritten');
        }
        let toWrite = stream[kImpl].buf.slice(0, leftover);
        let toWriteBytes = Buffer.byteLength(toWrite);
        if (toWriteBytes <= leftover) {
          stream[kImpl].buf = stream[kImpl].buf.slice(leftover);
          write(stream, toWrite, cb);
        } else {
          flushSync(stream);
          Atomics.store(stream[kImpl].state, READ_INDEX, 0);
          Atomics.store(stream[kImpl].state, WRITE_INDEX, 0);
          while (toWriteBytes > stream[kImpl].buf.length) {
            leftover = leftover / 2;
            toWrite = stream[kImpl].buf.slice(0, leftover);
            toWriteBytes = Buffer.byteLength(toWrite);
          }
          stream[kImpl].buf = stream[kImpl].buf.slice(leftover);
          write(stream, toWrite, cb);
        }
      }
    }
    function flushSync(stream) {
      if (stream[kImpl].flushing) {
        throw new Error('unable to flush while flushing');
      }
      const writeIndex = Atomics.load(stream[kImpl].state, WRITE_INDEX);
      let spins = 0;
      while (true) {
        const readIndex = Atomics.load(stream[kImpl].state, READ_INDEX);
        if (readIndex === -2) {
          throw Error('_flushSync failed');
        }
        if (readIndex !== writeIndex) {
          Atomics.wait(stream[kImpl].state, READ_INDEX, readIndex, 1e3);
        } else {
          break;
        }
        if (++spins === 10) {
          throw new Error('_flushSync took too long (10s)');
        }
      }
    }
    module2.exports = ThreadStream;
  },
});

// node_modules/pino/lib/transport.js
var require_transport = __commonJS({
  'node_modules/pino/lib/transport.js'(exports2, module2) {
    'use strict';
    var { createRequire } = require('module');
    var getCallers = require_caller();
    var { join, isAbsolute, sep } = require('path');
    var sleep = require_atomic_sleep();
    var onExit = require_on_exit_leak_free();
    var ThreadStream = require_thread_stream();
    function setupOnExit(stream) {
      onExit.register(stream, autoEnd);
      onExit.registerBeforeExit(stream, flush);
      stream.on('close', function () {
        onExit.unregister(stream);
      });
    }
    function buildStream(filename, workerData, workerOpts) {
      const stream = new ThreadStream({
        filename,
        workerData,
        workerOpts,
      });
      stream.on('ready', onReady);
      stream.on('close', function () {
        process.removeListener('exit', onExit2);
      });
      process.on('exit', onExit2);
      function onReady() {
        process.removeListener('exit', onExit2);
        stream.unref();
        if (workerOpts.autoEnd !== false) {
          setupOnExit(stream);
        }
      }
      function onExit2() {
        if (stream.closed) {
          return;
        }
        stream.flushSync();
        sleep(100);
        stream.end();
      }
      return stream;
    }
    function autoEnd(stream) {
      stream.ref();
      stream.flushSync();
      stream.end();
      stream.once('close', function () {
        stream.unref();
      });
    }
    function flush(stream) {
      stream.flushSync();
    }
    function transport(fullOptions) {
      const { pipeline, targets, levels, dedupe, options = {}, worker = {}, caller = getCallers() } = fullOptions;
      const callers = typeof caller === 'string' ? [caller] : caller;
      const bundlerOverrides = '__bundlerPathsOverrides' in globalThis ? globalThis.__bundlerPathsOverrides : {};
      let target = fullOptions.target;
      if (target && targets) {
        throw new Error('only one of target or targets can be specified');
      }
      if (targets) {
        target = bundlerOverrides['pino-worker'] || join(__dirname, 'worker.js');
        options.targets = targets.map((dest) => {
          return {
            ...dest,
            target: fixTarget(dest.target),
          };
        });
      } else if (pipeline) {
        target = bundlerOverrides['pino-pipeline-worker'] || join(__dirname, 'worker-pipeline.js');
        options.targets = pipeline.map((dest) => {
          return {
            ...dest,
            target: fixTarget(dest.target),
          };
        });
      }
      if (levels) {
        options.levels = levels;
      }
      if (dedupe) {
        options.dedupe = dedupe;
      }
      return buildStream(fixTarget(target), options, worker);
      function fixTarget(origin) {
        origin = bundlerOverrides[origin] || origin;
        if (isAbsolute(origin) || origin.indexOf('file://') === 0) {
          return origin;
        }
        if (origin === 'pino/file') {
          return join(__dirname, '..', 'file.js');
        }
        let fixTarget2;
        for (const filePath of callers) {
          try {
            const context = filePath === 'node:repl' ? process.cwd() + sep : filePath;
            fixTarget2 = createRequire(context).resolve(origin);
            break;
          } catch (err) {
            continue;
          }
        }
        if (!fixTarget2) {
          throw new Error(`unable to determine transport target for "${origin}"`);
        }
        return fixTarget2;
      }
    }
    module2.exports = transport;
  },
});

// node_modules/pino/lib/tools.js
var require_tools = __commonJS({
  'node_modules/pino/lib/tools.js'(exports2, module2) {
    'use strict';
    var format = require_quick_format_unescaped();
    var { mapHttpRequest, mapHttpResponse } = require_pino_std_serializers();
    var SonicBoom = require_sonic_boom();
    var onExit = require_on_exit_leak_free();
    var {
      lsCacheSym,
      chindingsSym,
      writeSym,
      serializersSym,
      formatOptsSym,
      endSym,
      stringifiersSym,
      stringifySym,
      stringifySafeSym,
      wildcardFirstSym,
      nestedKeySym,
      formattersSym,
      messageKeySym,
      errorKeySym,
      nestedKeyStrSym,
      msgPrefixSym,
    } = require_symbols();
    var { isMainThread } = require('worker_threads');
    var transport = require_transport();
    function noop() {}
    function genLog(level, hook) {
      if (!hook) return LOG;
      return function hookWrappedLog(...args) {
        hook.call(this, args, LOG, level);
      };
      function LOG(o, ...n) {
        if (typeof o === 'object') {
          let msg = o;
          if (o !== null) {
            if (o.method && o.headers && o.socket) {
              o = mapHttpRequest(o);
            } else if (typeof o.setHeader === 'function') {
              o = mapHttpResponse(o);
            }
          }
          let formatParams;
          if (msg === null && n.length === 0) {
            formatParams = [null];
          } else {
            msg = n.shift();
            formatParams = n;
          }
          if (typeof this[msgPrefixSym] === 'string' && msg !== void 0 && msg !== null) {
            msg = this[msgPrefixSym] + msg;
          }
          this[writeSym](o, format(msg, formatParams, this[formatOptsSym]), level);
        } else {
          let msg = o === void 0 ? n.shift() : o;
          if (typeof this[msgPrefixSym] === 'string' && msg !== void 0 && msg !== null) {
            msg = this[msgPrefixSym] + msg;
          }
          this[writeSym](null, format(msg, n, this[formatOptsSym]), level);
        }
      }
    }
    function asString(str) {
      let result = '';
      let last = 0;
      let found = false;
      let point = 255;
      const l = str.length;
      if (l > 100) {
        return JSON.stringify(str);
      }
      for (var i = 0; i < l && point >= 32; i++) {
        point = str.charCodeAt(i);
        if (point === 34 || point === 92) {
          result += str.slice(last, i) + '\\';
          last = i;
          found = true;
        }
      }
      if (!found) {
        result = str;
      } else {
        result += str.slice(last);
      }
      return point < 32 ? JSON.stringify(str) : '"' + result + '"';
    }
    function asJson(obj, msg, num, time) {
      const stringify2 = this[stringifySym];
      const stringifySafe = this[stringifySafeSym];
      const stringifiers = this[stringifiersSym];
      const end = this[endSym];
      const chindings = this[chindingsSym];
      const serializers = this[serializersSym];
      const formatters = this[formattersSym];
      const messageKey = this[messageKeySym];
      const errorKey = this[errorKeySym];
      let data = this[lsCacheSym][num] + time;
      data = data + chindings;
      let value;
      if (formatters.log) {
        obj = formatters.log(obj);
      }
      const wildcardStringifier = stringifiers[wildcardFirstSym];
      let propStr = '';
      for (const key in obj) {
        value = obj[key];
        if (Object.prototype.hasOwnProperty.call(obj, key) && value !== void 0) {
          if (serializers[key]) {
            value = serializers[key](value);
          } else if (key === errorKey && serializers.err) {
            value = serializers.err(value);
          }
          const stringifier = stringifiers[key] || wildcardStringifier;
          switch (typeof value) {
            case 'undefined':
            case 'function':
              continue;
            case 'number':
              if (Number.isFinite(value) === false) {
                value = null;
              }
            case 'boolean':
              if (stringifier) value = stringifier(value);
              break;
            case 'string':
              value = (stringifier || asString)(value);
              break;
            default:
              value = (stringifier || stringify2)(value, stringifySafe);
          }
          if (value === void 0) continue;
          const strKey = asString(key);
          propStr += ',' + strKey + ':' + value;
        }
      }
      let msgStr = '';
      if (msg !== void 0) {
        value = serializers[messageKey] ? serializers[messageKey](msg) : msg;
        const stringifier = stringifiers[messageKey] || wildcardStringifier;
        switch (typeof value) {
          case 'function':
            break;
          case 'number':
            if (Number.isFinite(value) === false) {
              value = null;
            }
          case 'boolean':
            if (stringifier) value = stringifier(value);
            msgStr = ',"' + messageKey + '":' + value;
            break;
          case 'string':
            value = (stringifier || asString)(value);
            msgStr = ',"' + messageKey + '":' + value;
            break;
          default:
            value = (stringifier || stringify2)(value, stringifySafe);
            msgStr = ',"' + messageKey + '":' + value;
        }
      }
      if (this[nestedKeySym] && propStr) {
        return data + this[nestedKeyStrSym] + propStr.slice(1) + '}' + msgStr + end;
      } else {
        return data + propStr + msgStr + end;
      }
    }
    function asChindings(instance, bindings) {
      let value;
      let data = instance[chindingsSym];
      const stringify2 = instance[stringifySym];
      const stringifySafe = instance[stringifySafeSym];
      const stringifiers = instance[stringifiersSym];
      const wildcardStringifier = stringifiers[wildcardFirstSym];
      const serializers = instance[serializersSym];
      const formatter = instance[formattersSym].bindings;
      bindings = formatter(bindings);
      for (const key in bindings) {
        value = bindings[key];
        const valid =
          key !== 'level' &&
          key !== 'serializers' &&
          key !== 'formatters' &&
          key !== 'customLevels' &&
          bindings.hasOwnProperty(key) &&
          value !== void 0;
        if (valid === true) {
          value = serializers[key] ? serializers[key](value) : value;
          value = (stringifiers[key] || wildcardStringifier || stringify2)(value, stringifySafe);
          if (value === void 0) continue;
          data += ',"' + key + '":' + value;
        }
      }
      return data;
    }
    function hasBeenTampered(stream) {
      return stream.write !== stream.constructor.prototype.write;
    }
    var hasNodeCodeCoverage = process.env.NODE_V8_COVERAGE || process.env.V8_COVERAGE;
    function buildSafeSonicBoom(opts) {
      const stream = new SonicBoom(opts);
      stream.on('error', filterBrokenPipe);
      if (!hasNodeCodeCoverage && !opts.sync && isMainThread) {
        onExit.register(stream, autoEnd);
        stream.on('close', function () {
          onExit.unregister(stream);
        });
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
        stream.emit('error', err);
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
    function createArgsNormalizer(defaultOptions) {
      return function normalizeArgs(instance, caller, opts = {}, stream) {
        if (typeof opts === 'string') {
          stream = buildSafeSonicBoom({ dest: opts });
          opts = {};
        } else if (typeof stream === 'string') {
          if (opts && opts.transport) {
            throw Error('only one of option.transport or stream can be specified');
          }
          stream = buildSafeSonicBoom({ dest: stream });
        } else if (opts instanceof SonicBoom || opts.writable || opts._writableState) {
          stream = opts;
          opts = {};
        } else if (opts.transport) {
          if (opts.transport instanceof SonicBoom || opts.transport.writable || opts.transport._writableState) {
            throw Error('option.transport do not allow stream, please pass to option directly. e.g. pino(transport)');
          }
          if (
            opts.transport.targets &&
            opts.transport.targets.length &&
            opts.formatters &&
            typeof opts.formatters.level === 'function'
          ) {
            throw Error('option.transport.targets do not allow custom level formatters');
          }
          let customLevels;
          if (opts.customLevels) {
            customLevels = opts.useOnlyCustomLevels
              ? opts.customLevels
              : Object.assign({}, opts.levels, opts.customLevels);
          }
          stream = transport({ caller, ...opts.transport, levels: customLevels });
        }
        opts = Object.assign({}, defaultOptions, opts);
        opts.serializers = Object.assign({}, defaultOptions.serializers, opts.serializers);
        opts.formatters = Object.assign({}, defaultOptions.formatters, opts.formatters);
        if (opts.prettyPrint) {
          throw new Error(
            'prettyPrint option is no longer supported, see the pino-pretty package (https://github.com/pinojs/pino-pretty)'
          );
        }
        const { enabled, onChild } = opts;
        if (enabled === false) opts.level = 'silent';
        if (!onChild) opts.onChild = noop;
        if (!stream) {
          if (!hasBeenTampered(process.stdout)) {
            stream = buildSafeSonicBoom({ fd: process.stdout.fd || 1 });
          } else {
            stream = process.stdout;
          }
        }
        return { opts, stream };
      };
    }
    function stringify(obj, stringifySafeFn) {
      try {
        return JSON.stringify(obj);
      } catch (_) {
        try {
          const stringify2 = stringifySafeFn || this[stringifySafeSym];
          return stringify2(obj);
        } catch (_2) {
          return '"[unable to serialize, circular reference is too complex to analyze]"';
        }
      }
    }
    function buildFormatters(level, bindings, log) {
      return {
        level,
        bindings,
        log,
      };
    }
    function normalizeDestFileDescriptor(destination) {
      const fd = Number(destination);
      if (typeof destination === 'string' && Number.isFinite(fd)) {
        return fd;
      }
      if (destination === void 0) {
        return 1;
      }
      return destination;
    }
    module2.exports = {
      noop,
      buildSafeSonicBoom,
      asChindings,
      asJson,
      genLog,
      createArgsNormalizer,
      stringify,
      buildFormatters,
      normalizeDestFileDescriptor,
    };
  },
});

// node_modules/pino/lib/levels.js
var require_levels = __commonJS({
  'node_modules/pino/lib/levels.js'(exports2, module2) {
    'use strict';
    var { lsCacheSym, levelValSym, useOnlyCustomLevelsSym, streamSym, formattersSym, hooksSym } = require_symbols();
    var { noop, genLog } = require_tools();
    var levels = {
      trace: 10,
      debug: 20,
      info: 30,
      warn: 40,
      error: 50,
      fatal: 60,
    };
    var levelMethods = {
      fatal: (hook) => {
        const logFatal = genLog(levels.fatal, hook);
        return function (...args) {
          const stream = this[streamSym];
          logFatal.call(this, ...args);
          if (typeof stream.flushSync === 'function') {
            try {
              stream.flushSync();
            } catch (e) {}
          }
        };
      },
      error: (hook) => genLog(levels.error, hook),
      warn: (hook) => genLog(levels.warn, hook),
      info: (hook) => genLog(levels.info, hook),
      debug: (hook) => genLog(levels.debug, hook),
      trace: (hook) => genLog(levels.trace, hook),
    };
    var nums = Object.keys(levels).reduce((o, k) => {
      o[levels[k]] = k;
      return o;
    }, {});
    var initialLsCache = Object.keys(nums).reduce((o, k) => {
      o[k] = '{"level":' + Number(k);
      return o;
    }, {});
    function genLsCache(instance) {
      const formatter = instance[formattersSym].level;
      const { labels } = instance.levels;
      const cache = {};
      for (const label in labels) {
        const level = formatter(labels[label], Number(label));
        cache[label] = JSON.stringify(level).slice(0, -1);
      }
      instance[lsCacheSym] = cache;
      return instance;
    }
    function isStandardLevel(level, useOnlyCustomLevels) {
      if (useOnlyCustomLevels) {
        return false;
      }
      switch (level) {
        case 'fatal':
        case 'error':
        case 'warn':
        case 'info':
        case 'debug':
        case 'trace':
          return true;
        default:
          return false;
      }
    }
    function setLevel(level) {
      const { labels, values } = this.levels;
      if (typeof level === 'number') {
        if (labels[level] === void 0) throw Error('unknown level value' + level);
        level = labels[level];
      }
      if (values[level] === void 0) throw Error('unknown level ' + level);
      const preLevelVal = this[levelValSym];
      const levelVal = (this[levelValSym] = values[level]);
      const useOnlyCustomLevelsVal = this[useOnlyCustomLevelsSym];
      const hook = this[hooksSym].logMethod;
      for (const key in values) {
        if (levelVal > values[key]) {
          this[key] = noop;
          continue;
        }
        this[key] = isStandardLevel(key, useOnlyCustomLevelsVal) ? levelMethods[key](hook) : genLog(values[key], hook);
      }
      this.emit('level-change', level, levelVal, labels[preLevelVal], preLevelVal, this);
    }
    function getLevel(level) {
      const { levels: levels2, levelVal } = this;
      return levels2 && levels2.labels ? levels2.labels[levelVal] : '';
    }
    function isLevelEnabled(logLevel) {
      const { values } = this.levels;
      const logLevelVal = values[logLevel];
      return logLevelVal !== void 0 && logLevelVal >= this[levelValSym];
    }
    function mappings(customLevels = null, useOnlyCustomLevels = false) {
      const customNums = customLevels
        ? Object.keys(customLevels).reduce((o, k) => {
            o[customLevels[k]] = k;
            return o;
          }, {})
        : null;
      const labels = Object.assign(
        Object.create(Object.prototype, { Infinity: { value: 'silent' } }),
        useOnlyCustomLevels ? null : nums,
        customNums
      );
      const values = Object.assign(
        Object.create(Object.prototype, { silent: { value: Infinity } }),
        useOnlyCustomLevels ? null : levels,
        customLevels
      );
      return { labels, values };
    }
    function assertDefaultLevelFound(defaultLevel, customLevels, useOnlyCustomLevels) {
      if (typeof defaultLevel === 'number') {
        const values = [].concat(
          Object.keys(customLevels || {}).map((key) => customLevels[key]),
          useOnlyCustomLevels ? [] : Object.keys(nums).map((level) => +level),
          Infinity
        );
        if (!values.includes(defaultLevel)) {
          throw Error(`default level:${defaultLevel} must be included in custom levels`);
        }
        return;
      }
      const labels = Object.assign(
        Object.create(Object.prototype, { silent: { value: Infinity } }),
        useOnlyCustomLevels ? null : levels,
        customLevels
      );
      if (!(defaultLevel in labels)) {
        throw Error(`default level:${defaultLevel} must be included in custom levels`);
      }
    }
    function assertNoLevelCollisions(levels2, customLevels) {
      const { labels, values } = levels2;
      for (const k in customLevels) {
        if (k in values) {
          throw Error('levels cannot be overridden');
        }
        if (customLevels[k] in labels) {
          throw Error('pre-existing level values cannot be used for new levels');
        }
      }
    }
    module2.exports = {
      initialLsCache,
      genLsCache,
      levelMethods,
      getLevel,
      setLevel,
      isLevelEnabled,
      mappings,
      levels,
      assertNoLevelCollisions,
      assertDefaultLevelFound,
    };
  },
});

// node_modules/pino/lib/meta.js
var require_meta = __commonJS({
  'node_modules/pino/lib/meta.js'(exports2, module2) {
    'use strict';
    module2.exports = { version: '8.16.2' };
  },
});

// node_modules/pino/lib/proto.js
var require_proto = __commonJS({
  'node_modules/pino/lib/proto.js'(exports2, module2) {
    'use strict';
    var { EventEmitter } = require('events');
    var {
      lsCacheSym,
      levelValSym,
      setLevelSym,
      getLevelSym,
      chindingsSym,
      parsedChindingsSym,
      mixinSym,
      asJsonSym,
      writeSym,
      mixinMergeStrategySym,
      timeSym,
      timeSliceIndexSym,
      streamSym,
      serializersSym,
      formattersSym,
      errorKeySym,
      messageKeySym,
      useOnlyCustomLevelsSym,
      needsMetadataGsym,
      redactFmtSym,
      stringifySym,
      formatOptsSym,
      stringifiersSym,
      msgPrefixSym,
    } = require_symbols();
    var { getLevel, setLevel, isLevelEnabled, mappings, initialLsCache, genLsCache, assertNoLevelCollisions } =
      require_levels();
    var { asChindings, asJson, buildFormatters, stringify } = require_tools();
    var { version } = require_meta();
    var redaction = require_redaction();
    var constructor = class Pino {};
    var prototype = {
      constructor,
      child,
      bindings,
      setBindings,
      flush,
      isLevelEnabled,
      version,
      get level() {
        return this[getLevelSym]();
      },
      set level(lvl) {
        this[setLevelSym](lvl);
      },
      get levelVal() {
        return this[levelValSym];
      },
      set levelVal(n) {
        throw Error('levelVal is read-only');
      },
      [lsCacheSym]: initialLsCache,
      [writeSym]: write,
      [asJsonSym]: asJson,
      [getLevelSym]: getLevel,
      [setLevelSym]: setLevel,
    };
    Object.setPrototypeOf(prototype, EventEmitter.prototype);
    module2.exports = function () {
      return Object.create(prototype);
    };
    var resetChildingsFormatter = (bindings2) => bindings2;
    function child(bindings2, options) {
      if (!bindings2) {
        throw Error('missing bindings for child Pino');
      }
      options = options || {};
      const serializers = this[serializersSym];
      const formatters = this[formattersSym];
      const instance = Object.create(this);
      if (options.hasOwnProperty('serializers') === true) {
        instance[serializersSym] = /* @__PURE__ */ Object.create(null);
        for (const k in serializers) {
          instance[serializersSym][k] = serializers[k];
        }
        const parentSymbols = Object.getOwnPropertySymbols(serializers);
        for (var i = 0; i < parentSymbols.length; i++) {
          const ks = parentSymbols[i];
          instance[serializersSym][ks] = serializers[ks];
        }
        for (const bk in options.serializers) {
          instance[serializersSym][bk] = options.serializers[bk];
        }
        const bindingsSymbols = Object.getOwnPropertySymbols(options.serializers);
        for (var bi = 0; bi < bindingsSymbols.length; bi++) {
          const bks = bindingsSymbols[bi];
          instance[serializersSym][bks] = options.serializers[bks];
        }
      } else instance[serializersSym] = serializers;
      if (options.hasOwnProperty('formatters')) {
        const { level, bindings: chindings, log } = options.formatters;
        instance[formattersSym] = buildFormatters(
          level || formatters.level,
          chindings || resetChildingsFormatter,
          log || formatters.log
        );
      } else {
        instance[formattersSym] = buildFormatters(formatters.level, resetChildingsFormatter, formatters.log);
      }
      if (options.hasOwnProperty('customLevels') === true) {
        assertNoLevelCollisions(this.levels, options.customLevels);
        instance.levels = mappings(options.customLevels, instance[useOnlyCustomLevelsSym]);
        genLsCache(instance);
      }
      if ((typeof options.redact === 'object' && options.redact !== null) || Array.isArray(options.redact)) {
        instance.redact = options.redact;
        const stringifiers = redaction(instance.redact, stringify);
        const formatOpts = { stringify: stringifiers[redactFmtSym] };
        instance[stringifySym] = stringify;
        instance[stringifiersSym] = stringifiers;
        instance[formatOptsSym] = formatOpts;
      }
      if (typeof options.msgPrefix === 'string') {
        instance[msgPrefixSym] = (this[msgPrefixSym] || '') + options.msgPrefix;
      }
      instance[chindingsSym] = asChindings(instance, bindings2);
      const childLevel = options.level || this.level;
      instance[setLevelSym](childLevel);
      this.onChild(instance);
      return instance;
    }
    function bindings() {
      const chindings = this[chindingsSym];
      const chindingsJson = `{${chindings.substr(1)}}`;
      const bindingsFromJson = JSON.parse(chindingsJson);
      delete bindingsFromJson.pid;
      delete bindingsFromJson.hostname;
      return bindingsFromJson;
    }
    function setBindings(newBindings) {
      const chindings = asChindings(this, newBindings);
      this[chindingsSym] = chindings;
      delete this[parsedChindingsSym];
    }
    function defaultMixinMergeStrategy(mergeObject, mixinObject) {
      return Object.assign(mixinObject, mergeObject);
    }
    function write(_obj, msg, num) {
      const t = this[timeSym]();
      const mixin = this[mixinSym];
      const errorKey = this[errorKeySym];
      const messageKey = this[messageKeySym];
      const mixinMergeStrategy = this[mixinMergeStrategySym] || defaultMixinMergeStrategy;
      let obj;
      if (_obj === void 0 || _obj === null) {
        obj = {};
      } else if (_obj instanceof Error) {
        obj = { [errorKey]: _obj };
        if (msg === void 0) {
          msg = _obj.message;
        }
      } else {
        obj = _obj;
        if (msg === void 0 && _obj[messageKey] === void 0 && _obj[errorKey]) {
          msg = _obj[errorKey].message;
        }
      }
      if (mixin) {
        obj = mixinMergeStrategy(obj, mixin(obj, num, this));
      }
      const s = this[asJsonSym](obj, msg, num, t);
      const stream = this[streamSym];
      if (stream[needsMetadataGsym] === true) {
        stream.lastLevel = num;
        stream.lastObj = obj;
        stream.lastMsg = msg;
        stream.lastTime = t.slice(this[timeSliceIndexSym]);
        stream.lastLogger = this;
      }
      stream.write(s);
    }
    function noop() {}
    function flush(cb) {
      if (cb != null && typeof cb !== 'function') {
        throw Error('callback must be a function');
      }
      const stream = this[streamSym];
      if (typeof stream.flush === 'function') {
        stream.flush(cb || noop);
      } else if (cb) cb();
    }
  },
});

// node_modules/safe-stable-stringify/index.js
var require_safe_stable_stringify = __commonJS({
  'node_modules/safe-stable-stringify/index.js'(exports2, module2) {
    'use strict';
    var { hasOwnProperty } = Object.prototype;
    var stringify = configure();
    stringify.configure = configure;
    stringify.stringify = stringify;
    stringify.default = stringify;
    exports2.stringify = stringify;
    exports2.configure = configure;
    module2.exports = stringify;
    var strEscapeSequencesRegExp =
      /[\u0000-\u001f\u0022\u005c\ud800-\udfff]|[\ud800-\udbff](?![\udc00-\udfff])|(?:[^\ud800-\udbff]|^)[\udc00-\udfff]/;
    function strEscape(str) {
      if (str.length < 5e3 && !strEscapeSequencesRegExp.test(str)) {
        return `"${str}"`;
      }
      return JSON.stringify(str);
    }
    function insertSort(array) {
      if (array.length > 200) {
        return array.sort();
      }
      for (let i = 1; i < array.length; i++) {
        const currentValue = array[i];
        let position = i;
        while (position !== 0 && array[position - 1] > currentValue) {
          array[position] = array[position - 1];
          position--;
        }
        array[position] = currentValue;
      }
      return array;
    }
    var typedArrayPrototypeGetSymbolToStringTag = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(Object.getPrototypeOf(new Int8Array())),
      Symbol.toStringTag
    ).get;
    function isTypedArrayWithEntries(value) {
      return typedArrayPrototypeGetSymbolToStringTag.call(value) !== void 0 && value.length !== 0;
    }
    function stringifyTypedArray(array, separator, maximumBreadth) {
      if (array.length < maximumBreadth) {
        maximumBreadth = array.length;
      }
      const whitespace = separator === ',' ? '' : ' ';
      let res = `"0":${whitespace}${array[0]}`;
      for (let i = 1; i < maximumBreadth; i++) {
        res += `${separator}"${i}":${whitespace}${array[i]}`;
      }
      return res;
    }
    function getCircularValueOption(options) {
      if (hasOwnProperty.call(options, 'circularValue')) {
        const circularValue = options.circularValue;
        if (typeof circularValue === 'string') {
          return `"${circularValue}"`;
        }
        if (circularValue == null) {
          return circularValue;
        }
        if (circularValue === Error || circularValue === TypeError) {
          return {
            toString() {
              throw new TypeError('Converting circular structure to JSON');
            },
          };
        }
        throw new TypeError('The "circularValue" argument must be of type string or the value null or undefined');
      }
      return '"[Circular]"';
    }
    function getBooleanOption(options, key) {
      let value;
      if (hasOwnProperty.call(options, key)) {
        value = options[key];
        if (typeof value !== 'boolean') {
          throw new TypeError(`The "${key}" argument must be of type boolean`);
        }
      }
      return value === void 0 ? true : value;
    }
    function getPositiveIntegerOption(options, key) {
      let value;
      if (hasOwnProperty.call(options, key)) {
        value = options[key];
        if (typeof value !== 'number') {
          throw new TypeError(`The "${key}" argument must be of type number`);
        }
        if (!Number.isInteger(value)) {
          throw new TypeError(`The "${key}" argument must be an integer`);
        }
        if (value < 1) {
          throw new RangeError(`The "${key}" argument must be >= 1`);
        }
      }
      return value === void 0 ? Infinity : value;
    }
    function getItemCount(number) {
      if (number === 1) {
        return '1 item';
      }
      return `${number} items`;
    }
    function getUniqueReplacerSet(replacerArray) {
      const replacerSet = /* @__PURE__ */ new Set();
      for (const value of replacerArray) {
        if (typeof value === 'string' || typeof value === 'number') {
          replacerSet.add(String(value));
        }
      }
      return replacerSet;
    }
    function getStrictOption(options) {
      if (hasOwnProperty.call(options, 'strict')) {
        const value = options.strict;
        if (typeof value !== 'boolean') {
          throw new TypeError('The "strict" argument must be of type boolean');
        }
        if (value) {
          return (value2) => {
            let message = `Object can not safely be stringified. Received type ${typeof value2}`;
            if (typeof value2 !== 'function') message += ` (${value2.toString()})`;
            throw new Error(message);
          };
        }
      }
    }
    function configure(options) {
      options = { ...options };
      const fail = getStrictOption(options);
      if (fail) {
        if (options.bigint === void 0) {
          options.bigint = false;
        }
        if (!('circularValue' in options)) {
          options.circularValue = Error;
        }
      }
      const circularValue = getCircularValueOption(options);
      const bigint = getBooleanOption(options, 'bigint');
      const deterministic = getBooleanOption(options, 'deterministic');
      const maximumDepth = getPositiveIntegerOption(options, 'maximumDepth');
      const maximumBreadth = getPositiveIntegerOption(options, 'maximumBreadth');
      function stringifyFnReplacer(key, parent, stack, replacer, spacer, indentation) {
        let value = parent[key];
        if (typeof value === 'object' && value !== null && typeof value.toJSON === 'function') {
          value = value.toJSON(key);
        }
        value = replacer.call(parent, key, value);
        switch (typeof value) {
          case 'string':
            return strEscape(value);
          case 'object': {
            if (value === null) {
              return 'null';
            }
            if (stack.indexOf(value) !== -1) {
              return circularValue;
            }
            let res = '';
            let join = ',';
            const originalIndentation = indentation;
            if (Array.isArray(value)) {
              if (value.length === 0) {
                return '[]';
              }
              if (maximumDepth < stack.length + 1) {
                return '"[Array]"';
              }
              stack.push(value);
              if (spacer !== '') {
                indentation += spacer;
                res += `
${indentation}`;
                join = `,
${indentation}`;
              }
              const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
              let i = 0;
              for (; i < maximumValuesToStringify - 1; i++) {
                const tmp2 = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
                res += tmp2 !== void 0 ? tmp2 : 'null';
                res += join;
              }
              const tmp = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
              res += tmp !== void 0 ? tmp : 'null';
              if (value.length - 1 > maximumBreadth) {
                const removedKeys = value.length - maximumBreadth - 1;
                res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
              }
              if (spacer !== '') {
                res += `
${originalIndentation}`;
              }
              stack.pop();
              return `[${res}]`;
            }
            let keys = Object.keys(value);
            const keyLength = keys.length;
            if (keyLength === 0) {
              return '{}';
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Object]"';
            }
            let whitespace = '';
            let separator = '';
            if (spacer !== '') {
              indentation += spacer;
              join = `,
${indentation}`;
              whitespace = ' ';
            }
            const maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
            if (deterministic && !isTypedArrayWithEntries(value)) {
              keys = insertSort(keys);
            }
            stack.push(value);
            for (let i = 0; i < maximumPropertiesToStringify; i++) {
              const key2 = keys[i];
              const tmp = stringifyFnReplacer(key2, value, stack, replacer, spacer, indentation);
              if (tmp !== void 0) {
                res += `${separator}${strEscape(key2)}:${whitespace}${tmp}`;
                separator = join;
              }
            }
            if (keyLength > maximumBreadth) {
              const removedKeys = keyLength - maximumBreadth;
              res += `${separator}"...":${whitespace}"${getItemCount(removedKeys)} not stringified"`;
              separator = join;
            }
            if (spacer !== '' && separator.length > 1) {
              res = `
${indentation}${res}
${originalIndentation}`;
            }
            stack.pop();
            return `{${res}}`;
          }
          case 'number':
            return isFinite(value) ? String(value) : fail ? fail(value) : 'null';
          case 'boolean':
            return value === true ? 'true' : 'false';
          case 'undefined':
            return void 0;
          case 'bigint':
            if (bigint) {
              return String(value);
            }
          default:
            return fail ? fail(value) : void 0;
        }
      }
      function stringifyArrayReplacer(key, value, stack, replacer, spacer, indentation) {
        if (typeof value === 'object' && value !== null && typeof value.toJSON === 'function') {
          value = value.toJSON(key);
        }
        switch (typeof value) {
          case 'string':
            return strEscape(value);
          case 'object': {
            if (value === null) {
              return 'null';
            }
            if (stack.indexOf(value) !== -1) {
              return circularValue;
            }
            const originalIndentation = indentation;
            let res = '';
            let join = ',';
            if (Array.isArray(value)) {
              if (value.length === 0) {
                return '[]';
              }
              if (maximumDepth < stack.length + 1) {
                return '"[Array]"';
              }
              stack.push(value);
              if (spacer !== '') {
                indentation += spacer;
                res += `
${indentation}`;
                join = `,
${indentation}`;
              }
              const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
              let i = 0;
              for (; i < maximumValuesToStringify - 1; i++) {
                const tmp2 = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
                res += tmp2 !== void 0 ? tmp2 : 'null';
                res += join;
              }
              const tmp = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
              res += tmp !== void 0 ? tmp : 'null';
              if (value.length - 1 > maximumBreadth) {
                const removedKeys = value.length - maximumBreadth - 1;
                res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
              }
              if (spacer !== '') {
                res += `
${originalIndentation}`;
              }
              stack.pop();
              return `[${res}]`;
            }
            stack.push(value);
            let whitespace = '';
            if (spacer !== '') {
              indentation += spacer;
              join = `,
${indentation}`;
              whitespace = ' ';
            }
            let separator = '';
            for (const key2 of replacer) {
              const tmp = stringifyArrayReplacer(key2, value[key2], stack, replacer, spacer, indentation);
              if (tmp !== void 0) {
                res += `${separator}${strEscape(key2)}:${whitespace}${tmp}`;
                separator = join;
              }
            }
            if (spacer !== '' && separator.length > 1) {
              res = `
${indentation}${res}
${originalIndentation}`;
            }
            stack.pop();
            return `{${res}}`;
          }
          case 'number':
            return isFinite(value) ? String(value) : fail ? fail(value) : 'null';
          case 'boolean':
            return value === true ? 'true' : 'false';
          case 'undefined':
            return void 0;
          case 'bigint':
            if (bigint) {
              return String(value);
            }
          default:
            return fail ? fail(value) : void 0;
        }
      }
      function stringifyIndent(key, value, stack, spacer, indentation) {
        switch (typeof value) {
          case 'string':
            return strEscape(value);
          case 'object': {
            if (value === null) {
              return 'null';
            }
            if (typeof value.toJSON === 'function') {
              value = value.toJSON(key);
              if (typeof value !== 'object') {
                return stringifyIndent(key, value, stack, spacer, indentation);
              }
              if (value === null) {
                return 'null';
              }
            }
            if (stack.indexOf(value) !== -1) {
              return circularValue;
            }
            const originalIndentation = indentation;
            if (Array.isArray(value)) {
              if (value.length === 0) {
                return '[]';
              }
              if (maximumDepth < stack.length + 1) {
                return '"[Array]"';
              }
              stack.push(value);
              indentation += spacer;
              let res2 = `
${indentation}`;
              const join2 = `,
${indentation}`;
              const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
              let i = 0;
              for (; i < maximumValuesToStringify - 1; i++) {
                const tmp2 = stringifyIndent(String(i), value[i], stack, spacer, indentation);
                res2 += tmp2 !== void 0 ? tmp2 : 'null';
                res2 += join2;
              }
              const tmp = stringifyIndent(String(i), value[i], stack, spacer, indentation);
              res2 += tmp !== void 0 ? tmp : 'null';
              if (value.length - 1 > maximumBreadth) {
                const removedKeys = value.length - maximumBreadth - 1;
                res2 += `${join2}"... ${getItemCount(removedKeys)} not stringified"`;
              }
              res2 += `
${originalIndentation}`;
              stack.pop();
              return `[${res2}]`;
            }
            let keys = Object.keys(value);
            const keyLength = keys.length;
            if (keyLength === 0) {
              return '{}';
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Object]"';
            }
            indentation += spacer;
            const join = `,
${indentation}`;
            let res = '';
            let separator = '';
            let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
            if (isTypedArrayWithEntries(value)) {
              res += stringifyTypedArray(value, join, maximumBreadth);
              keys = keys.slice(value.length);
              maximumPropertiesToStringify -= value.length;
              separator = join;
            }
            if (deterministic) {
              keys = insertSort(keys);
            }
            stack.push(value);
            for (let i = 0; i < maximumPropertiesToStringify; i++) {
              const key2 = keys[i];
              const tmp = stringifyIndent(key2, value[key2], stack, spacer, indentation);
              if (tmp !== void 0) {
                res += `${separator}${strEscape(key2)}: ${tmp}`;
                separator = join;
              }
            }
            if (keyLength > maximumBreadth) {
              const removedKeys = keyLength - maximumBreadth;
              res += `${separator}"...": "${getItemCount(removedKeys)} not stringified"`;
              separator = join;
            }
            if (separator !== '') {
              res = `
${indentation}${res}
${originalIndentation}`;
            }
            stack.pop();
            return `{${res}}`;
          }
          case 'number':
            return isFinite(value) ? String(value) : fail ? fail(value) : 'null';
          case 'boolean':
            return value === true ? 'true' : 'false';
          case 'undefined':
            return void 0;
          case 'bigint':
            if (bigint) {
              return String(value);
            }
          default:
            return fail ? fail(value) : void 0;
        }
      }
      function stringifySimple(key, value, stack) {
        switch (typeof value) {
          case 'string':
            return strEscape(value);
          case 'object': {
            if (value === null) {
              return 'null';
            }
            if (typeof value.toJSON === 'function') {
              value = value.toJSON(key);
              if (typeof value !== 'object') {
                return stringifySimple(key, value, stack);
              }
              if (value === null) {
                return 'null';
              }
            }
            if (stack.indexOf(value) !== -1) {
              return circularValue;
            }
            let res = '';
            if (Array.isArray(value)) {
              if (value.length === 0) {
                return '[]';
              }
              if (maximumDepth < stack.length + 1) {
                return '"[Array]"';
              }
              stack.push(value);
              const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
              let i = 0;
              for (; i < maximumValuesToStringify - 1; i++) {
                const tmp2 = stringifySimple(String(i), value[i], stack);
                res += tmp2 !== void 0 ? tmp2 : 'null';
                res += ',';
              }
              const tmp = stringifySimple(String(i), value[i], stack);
              res += tmp !== void 0 ? tmp : 'null';
              if (value.length - 1 > maximumBreadth) {
                const removedKeys = value.length - maximumBreadth - 1;
                res += `,"... ${getItemCount(removedKeys)} not stringified"`;
              }
              stack.pop();
              return `[${res}]`;
            }
            let keys = Object.keys(value);
            const keyLength = keys.length;
            if (keyLength === 0) {
              return '{}';
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Object]"';
            }
            let separator = '';
            let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
            if (isTypedArrayWithEntries(value)) {
              res += stringifyTypedArray(value, ',', maximumBreadth);
              keys = keys.slice(value.length);
              maximumPropertiesToStringify -= value.length;
              separator = ',';
            }
            if (deterministic) {
              keys = insertSort(keys);
            }
            stack.push(value);
            for (let i = 0; i < maximumPropertiesToStringify; i++) {
              const key2 = keys[i];
              const tmp = stringifySimple(key2, value[key2], stack);
              if (tmp !== void 0) {
                res += `${separator}${strEscape(key2)}:${tmp}`;
                separator = ',';
              }
            }
            if (keyLength > maximumBreadth) {
              const removedKeys = keyLength - maximumBreadth;
              res += `${separator}"...":"${getItemCount(removedKeys)} not stringified"`;
            }
            stack.pop();
            return `{${res}}`;
          }
          case 'number':
            return isFinite(value) ? String(value) : fail ? fail(value) : 'null';
          case 'boolean':
            return value === true ? 'true' : 'false';
          case 'undefined':
            return void 0;
          case 'bigint':
            if (bigint) {
              return String(value);
            }
          default:
            return fail ? fail(value) : void 0;
        }
      }
      function stringify2(value, replacer, space) {
        if (arguments.length > 1) {
          let spacer = '';
          if (typeof space === 'number') {
            spacer = ' '.repeat(Math.min(space, 10));
          } else if (typeof space === 'string') {
            spacer = space.slice(0, 10);
          }
          if (replacer != null) {
            if (typeof replacer === 'function') {
              return stringifyFnReplacer('', { '': value }, [], replacer, spacer, '');
            }
            if (Array.isArray(replacer)) {
              return stringifyArrayReplacer('', value, [], getUniqueReplacerSet(replacer), spacer, '');
            }
          }
          if (spacer.length !== 0) {
            return stringifyIndent('', value, [], spacer, '');
          }
        }
        return stringifySimple('', value, []);
      }
      return stringify2;
    }
  },
});

// node_modules/pino/lib/multistream.js
var require_multistream = __commonJS({
  'node_modules/pino/lib/multistream.js'(exports2, module2) {
    'use strict';
    var metadata = Symbol.for('pino.metadata');
    var { levels } = require_levels();
    var DEFAULT_INFO_LEVEL = levels.info;
    function multistream(streamsArray, opts) {
      let counter = 0;
      streamsArray = streamsArray || [];
      opts = opts || { dedupe: false };
      const streamLevels = Object.create(levels);
      streamLevels.silent = Infinity;
      if (opts.levels && typeof opts.levels === 'object') {
        Object.keys(opts.levels).forEach((i) => {
          streamLevels[i] = opts.levels[i];
        });
      }
      const res = {
        write,
        add,
        flushSync,
        end,
        minLevel: 0,
        streams: [],
        clone,
        [metadata]: true,
        streamLevels,
      };
      if (Array.isArray(streamsArray)) {
        streamsArray.forEach(add, res);
      } else {
        add.call(res, streamsArray);
      }
      streamsArray = null;
      return res;
      function write(data) {
        let dest;
        const level = this.lastLevel;
        const { streams } = this;
        let recordedLevel = 0;
        let stream;
        for (
          let i = initLoopVar(streams.length, opts.dedupe);
          checkLoopVar(i, streams.length, opts.dedupe);
          i = adjustLoopVar(i, opts.dedupe)
        ) {
          dest = streams[i];
          if (dest.level <= level) {
            if (recordedLevel !== 0 && recordedLevel !== dest.level) {
              break;
            }
            stream = dest.stream;
            if (stream[metadata]) {
              const { lastTime, lastMsg, lastObj, lastLogger } = this;
              stream.lastLevel = level;
              stream.lastTime = lastTime;
              stream.lastMsg = lastMsg;
              stream.lastObj = lastObj;
              stream.lastLogger = lastLogger;
            }
            stream.write(data);
            if (opts.dedupe) {
              recordedLevel = dest.level;
            }
          } else if (!opts.dedupe) {
            break;
          }
        }
      }
      function flushSync() {
        for (const { stream } of this.streams) {
          if (typeof stream.flushSync === 'function') {
            stream.flushSync();
          }
        }
      }
      function add(dest) {
        if (!dest) {
          return res;
        }
        const isStream = typeof dest.write === 'function' || dest.stream;
        const stream_ = dest.write ? dest : dest.stream;
        if (!isStream) {
          throw Error('stream object needs to implement either StreamEntry or DestinationStream interface');
        }
        const { streams, streamLevels: streamLevels2 } = this;
        let level;
        if (typeof dest.levelVal === 'number') {
          level = dest.levelVal;
        } else if (typeof dest.level === 'string') {
          level = streamLevels2[dest.level];
        } else if (typeof dest.level === 'number') {
          level = dest.level;
        } else {
          level = DEFAULT_INFO_LEVEL;
        }
        const dest_ = {
          stream: stream_,
          level,
          levelVal: void 0,
          id: counter++,
        };
        streams.unshift(dest_);
        streams.sort(compareByLevel);
        this.minLevel = streams[0].level;
        return res;
      }
      function end() {
        for (const { stream } of this.streams) {
          if (typeof stream.flushSync === 'function') {
            stream.flushSync();
          }
          stream.end();
        }
      }
      function clone(level) {
        const streams = new Array(this.streams.length);
        for (let i = 0; i < streams.length; i++) {
          streams[i] = {
            level,
            stream: this.streams[i].stream,
          };
        }
        return {
          write,
          add,
          minLevel: level,
          streams,
          clone,
          flushSync,
          [metadata]: true,
        };
      }
    }
    function compareByLevel(a, b) {
      return a.level - b.level;
    }
    function initLoopVar(length, dedupe) {
      return dedupe ? length - 1 : 0;
    }
    function adjustLoopVar(i, dedupe) {
      return dedupe ? i - 1 : i + 1;
    }
    function checkLoopVar(i, length, dedupe) {
      return dedupe ? i >= 0 : i < length;
    }
    module2.exports = multistream;
  },
});

// node_modules/pino/pino.js
var require_pino = __commonJS({
  'node_modules/pino/pino.js'(exports2, module2) {
    function pinoBundlerAbsolutePath(p) {
      try {
        return require('path').join(`${process.cwd()}${require('path').sep}dist`.replace(/\\/g, '/'), p);
      } catch (e) {
        const f = new Function('p', 'return new URL(p, import.meta.url).pathname');
        return f(p);
      }
    }
    globalThis.__bundlerPathsOverrides = {
      ...(globalThis.__bundlerPathsOverrides || {}),
      'thread-stream-worker': pinoBundlerAbsolutePath('./thread-stream-worker.js'),
      'pino-worker': pinoBundlerAbsolutePath('./pino-worker.js'),
      'pino-pipeline-worker': pinoBundlerAbsolutePath('./pino-pipeline-worker.js'),
      'pino/file': pinoBundlerAbsolutePath('./pino-file.js'),
      'pino-pretty': pinoBundlerAbsolutePath('./pino-pretty.js'),
    };
    var os = require('os');
    var stdSerializers = require_pino_std_serializers();
    var caller = require_caller();
    var redaction = require_redaction();
    var time = require_time();
    var proto = require_proto();
    var symbols = require_symbols();
    var { configure } = require_safe_stable_stringify();
    var { assertDefaultLevelFound, mappings, genLsCache, levels } = require_levels();
    var {
      createArgsNormalizer,
      asChindings,
      buildSafeSonicBoom,
      buildFormatters,
      stringify,
      normalizeDestFileDescriptor,
      noop,
    } = require_tools();
    var { version } = require_meta();
    var {
      chindingsSym,
      redactFmtSym,
      serializersSym,
      timeSym,
      timeSliceIndexSym,
      streamSym,
      stringifySym,
      stringifySafeSym,
      stringifiersSym,
      setLevelSym,
      endSym,
      formatOptsSym,
      messageKeySym,
      errorKeySym,
      nestedKeySym,
      mixinSym,
      useOnlyCustomLevelsSym,
      formattersSym,
      hooksSym,
      nestedKeyStrSym,
      mixinMergeStrategySym,
      msgPrefixSym,
    } = symbols;
    var { epochTime, nullTime } = time;
    var { pid } = process;
    var hostname = os.hostname();
    var defaultErrorSerializer = stdSerializers.err;
    var defaultOptions = {
      level: 'info',
      levels,
      messageKey: 'msg',
      errorKey: 'err',
      nestedKey: null,
      enabled: true,
      base: { pid, hostname },
      serializers: Object.assign(/* @__PURE__ */ Object.create(null), {
        err: defaultErrorSerializer,
      }),
      formatters: Object.assign(/* @__PURE__ */ Object.create(null), {
        bindings(bindings) {
          return bindings;
        },
        level(label, number) {
          return { level: number };
        },
      }),
      hooks: {
        logMethod: void 0,
      },
      timestamp: epochTime,
      name: void 0,
      redact: null,
      customLevels: null,
      useOnlyCustomLevels: false,
      depthLimit: 5,
      edgeLimit: 100,
    };
    var normalize = createArgsNormalizer(defaultOptions);
    var serializers = Object.assign(/* @__PURE__ */ Object.create(null), stdSerializers);
    function pino2(...args) {
      const instance = {};
      const { opts, stream } = normalize(instance, caller(), ...args);
      const {
        redact,
        crlf,
        serializers: serializers2,
        timestamp,
        messageKey,
        errorKey,
        nestedKey,
        base,
        name,
        level,
        customLevels,
        mixin,
        mixinMergeStrategy,
        useOnlyCustomLevels,
        formatters,
        hooks,
        depthLimit,
        edgeLimit,
        onChild,
        msgPrefix,
      } = opts;
      const stringifySafe = configure({
        maximumDepth: depthLimit,
        maximumBreadth: edgeLimit,
      });
      const allFormatters = buildFormatters(formatters.level, formatters.bindings, formatters.log);
      const stringifyFn = stringify.bind({
        [stringifySafeSym]: stringifySafe,
      });
      const stringifiers = redact ? redaction(redact, stringifyFn) : {};
      const formatOpts = redact ? { stringify: stringifiers[redactFmtSym] } : { stringify: stringifyFn };
      const end = '}' + (crlf ? '\r\n' : '\n');
      const coreChindings = asChindings.bind(null, {
        [chindingsSym]: '',
        [serializersSym]: serializers2,
        [stringifiersSym]: stringifiers,
        [stringifySym]: stringify,
        [stringifySafeSym]: stringifySafe,
        [formattersSym]: allFormatters,
      });
      let chindings = '';
      if (base !== null) {
        if (name === void 0) {
          chindings = coreChindings(base);
        } else {
          chindings = coreChindings(Object.assign({}, base, { name }));
        }
      }
      const time2 = timestamp instanceof Function ? timestamp : timestamp ? epochTime : nullTime;
      const timeSliceIndex = time2().indexOf(':') + 1;
      if (useOnlyCustomLevels && !customLevels)
        throw Error('customLevels is required if useOnlyCustomLevels is set true');
      if (mixin && typeof mixin !== 'function')
        throw Error(`Unknown mixin type "${typeof mixin}" - expected "function"`);
      if (msgPrefix && typeof msgPrefix !== 'string')
        throw Error(`Unknown msgPrefix type "${typeof msgPrefix}" - expected "string"`);
      assertDefaultLevelFound(level, customLevels, useOnlyCustomLevels);
      const levels2 = mappings(customLevels, useOnlyCustomLevels);
      Object.assign(instance, {
        levels: levels2,
        [useOnlyCustomLevelsSym]: useOnlyCustomLevels,
        [streamSym]: stream,
        [timeSym]: time2,
        [timeSliceIndexSym]: timeSliceIndex,
        [stringifySym]: stringify,
        [stringifySafeSym]: stringifySafe,
        [stringifiersSym]: stringifiers,
        [endSym]: end,
        [formatOptsSym]: formatOpts,
        [messageKeySym]: messageKey,
        [errorKeySym]: errorKey,
        [nestedKeySym]: nestedKey,
        // protect against injection
        [nestedKeyStrSym]: nestedKey ? `,${JSON.stringify(nestedKey)}:{` : '',
        [serializersSym]: serializers2,
        [mixinSym]: mixin,
        [mixinMergeStrategySym]: mixinMergeStrategy,
        [chindingsSym]: chindings,
        [formattersSym]: allFormatters,
        [hooksSym]: hooks,
        silent: noop,
        onChild,
        [msgPrefixSym]: msgPrefix,
      });
      Object.setPrototypeOf(instance, proto());
      genLsCache(instance);
      instance[setLevelSym](level);
      return instance;
    }
    module2.exports = pino2;
    module2.exports.destination = (dest = process.stdout.fd) => {
      if (typeof dest === 'object') {
        dest.dest = normalizeDestFileDescriptor(dest.dest || process.stdout.fd);
        return buildSafeSonicBoom(dest);
      } else {
        return buildSafeSonicBoom({ dest: normalizeDestFileDescriptor(dest), minLength: 0 });
      }
    };
    module2.exports.transport = require_transport();
    module2.exports.multistream = require_multistream();
    module2.exports.levels = mappings();
    module2.exports.stdSerializers = serializers;
    module2.exports.stdTimeFunctions = Object.assign({}, time);
    module2.exports.symbols = symbols;
    module2.exports.version = version;
    module2.exports.default = pino2;
    module2.exports.pino = pino2;
  },
});

// node_modules/pino/file.js
var pino = require_pino();
var { once } = require('events');
module.exports = async function (opts = {}) {
  const destOpts = Object.assign({}, opts, { dest: opts.destination || 1, sync: false });
  delete destOpts.destination;
  const destination = pino.destination(destOpts);
  await once(destination, 'ready');
  return destination;
};
