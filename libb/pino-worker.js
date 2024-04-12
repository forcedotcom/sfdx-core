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
    var levelCompSym = Symbol('pino.levelComp');
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
      levelCompSym,
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

// node_modules/pino/lib/constants.js
var require_constants = __commonJS({
  'node_modules/pino/lib/constants.js'(exports2, module2) {
    var DEFAULT_LEVELS = {
      trace: 10,
      debug: 20,
      info: 30,
      warn: 40,
      error: 50,
      fatal: 60,
    };
    var SORTING_ORDER = {
      ASC: 'ASC',
      DESC: 'DESC',
    };
    module2.exports = {
      DEFAULT_LEVELS,
      SORTING_ORDER,
    };
  },
});

// node_modules/pino/lib/levels.js
var require_levels = __commonJS({
  'node_modules/pino/lib/levels.js'(exports2, module2) {
    'use strict';
    var { lsCacheSym, levelValSym, useOnlyCustomLevelsSym, streamSym, formattersSym, hooksSym, levelCompSym } =
      require_symbols();
    var { noop, genLog } = require_tools();
    var { DEFAULT_LEVELS, SORTING_ORDER } = require_constants();
    var levelMethods = {
      fatal: (hook) => {
        const logFatal = genLog(DEFAULT_LEVELS.fatal, hook);
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
      error: (hook) => genLog(DEFAULT_LEVELS.error, hook),
      warn: (hook) => genLog(DEFAULT_LEVELS.warn, hook),
      info: (hook) => genLog(DEFAULT_LEVELS.info, hook),
      debug: (hook) => genLog(DEFAULT_LEVELS.debug, hook),
      trace: (hook) => genLog(DEFAULT_LEVELS.trace, hook),
    };
    var nums = Object.keys(DEFAULT_LEVELS).reduce((o, k) => {
      o[DEFAULT_LEVELS[k]] = k;
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
      const levelComparison = this[levelCompSym];
      const hook = this[hooksSym].logMethod;
      for (const key in values) {
        if (levelComparison(values[key], levelVal) === false) {
          this[key] = noop;
          continue;
        }
        this[key] = isStandardLevel(key, useOnlyCustomLevelsVal) ? levelMethods[key](hook) : genLog(values[key], hook);
      }
      this.emit('level-change', level, levelVal, labels[preLevelVal], preLevelVal, this);
    }
    function getLevel(level) {
      const { levels, levelVal } = this;
      return levels && levels.labels ? levels.labels[levelVal] : '';
    }
    function isLevelEnabled(logLevel) {
      const { values } = this.levels;
      const logLevelVal = values[logLevel];
      return logLevelVal !== void 0 && this[levelCompSym](logLevelVal, this[levelValSym]);
    }
    function compareLevel(direction, current, expected) {
      if (direction === SORTING_ORDER.DESC) {
        return current <= expected;
      }
      return current >= expected;
    }
    function genLevelComparison(levelComparison) {
      if (typeof levelComparison === 'string') {
        return compareLevel.bind(null, levelComparison);
      }
      return levelComparison;
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
        useOnlyCustomLevels ? null : DEFAULT_LEVELS,
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
        useOnlyCustomLevels ? null : DEFAULT_LEVELS,
        customLevels
      );
      if (!(defaultLevel in labels)) {
        throw Error(`default level:${defaultLevel} must be included in custom levels`);
      }
    }
    function assertNoLevelCollisions(levels, customLevels) {
      const { labels, values } = levels;
      for (const k in customLevels) {
        if (k in values) {
          throw Error('levels cannot be overridden');
        }
        if (customLevels[k] in labels) {
          throw Error('pre-existing level values cannot be used for new levels');
        }
      }
    }
    function assertLevelComparison(levelComparison) {
      if (typeof levelComparison === 'function') {
        return;
      }
      if (typeof levelComparison === 'string' && Object.values(SORTING_ORDER).includes(levelComparison)) {
        return;
      }
      throw new Error('Levels comparison should be one of "ASC", "DESC" or "function" type');
    }
    module2.exports = {
      initialLsCache,
      genLsCache,
      levelMethods,
      getLevel,
      setLevel,
      isLevelEnabled,
      mappings,
      assertNoLevelCollisions,
      assertDefaultLevelFound,
      genLevelComparison,
      assertLevelComparison,
    };
  },
});

// node_modules/pino/lib/meta.js
var require_meta = __commonJS({
  'node_modules/pino/lib/meta.js'(exports2, module2) {
    'use strict';
    module2.exports = { version: '8.19.0' };
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
    var { DEFAULT_LEVELS } = require_constants();
    var DEFAULT_INFO_LEVEL = DEFAULT_LEVELS.info;
    function multistream(streamsArray, opts) {
      let counter = 0;
      streamsArray = streamsArray || [];
      opts = opts || { dedupe: false };
      const streamLevels = Object.create(DEFAULT_LEVELS);
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
        return require('path').join(`${process.cwd()}${require('path').sep}libb`.replace(/\\/g, '/'), p);
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
    var { assertDefaultLevelFound, mappings, genLsCache, genLevelComparison, assertLevelComparison } = require_levels();
    var { DEFAULT_LEVELS, SORTING_ORDER } = require_constants();
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
      levelCompSym,
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
      levelComparison: SORTING_ORDER.ASC,
      levels: DEFAULT_LEVELS,
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
        levelComparison,
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
      const levels = mappings(customLevels, useOnlyCustomLevels);
      assertLevelComparison(levelComparison);
      const levelCompFunc = genLevelComparison(levelComparison);
      Object.assign(instance, {
        levels,
        [levelCompSym]: levelCompFunc,
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

// node_modules/pino-abstract-transport/node_modules/split2/index.js
var require_split2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/split2/index.js'(exports2, module2) {
    'use strict';
    var { Transform } = require('stream');
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
      const stream = new Transform(options);
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
var require_primordials = __commonJS({
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
var require_util = __commonJS({
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

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/ours/errors.js
var require_errors = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/ours/errors.js'(exports2, module2) {
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

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/validators.js
var require_validators = __commonJS({
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

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/utils.js
var require_utils = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/utils.js'(exports2, module2) {
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

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/end-of-stream.js
var require_end_of_stream = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/end-of-stream.js'(
    exports2,
    module2
  ) {
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

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/destroy.js
var require_destroy = __commonJS({
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

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/legacy.js
var require_legacy = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/legacy.js'(
    exports2,
    module2
  ) {
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

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/add-abort-signal.js
var require_add_abort_signal = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/add-abort-signal.js'(
    exports2,
    module2
  ) {
    'use strict';
    var { AbortError, codes } = require_errors();
    var { isNodeStream, isWebStream, kControllerErrorFunction } = require_utils();
    var eos = require_end_of_stream();
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
var require_buffer_list = __commonJS({
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

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/state.js
var require_state2 = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/state.js'(exports2, module2) {
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

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/from.js
var require_from = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/from.js'(exports2, module2) {
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

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/readable.js
var require_readable = __commonJS({
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
    } = require_primordials();
    module2.exports = Readable;
    Readable.ReadableState = ReadableState;
    var { EventEmitter: EE } = require('events');
    var { Stream, prependListener } = require_legacy();
    var { Buffer: Buffer2 } = require('buffer');
    var { addAbortSignal } = require_add_abort_signal();
    var eos = require_end_of_stream();
    var debug = require_util().debuglog('stream', (fn) => {
      debug = fn;
    });
    var BufferList = require_buffer_list();
    var destroyImpl = require_destroy();
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

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/writable.js
var require_writable = __commonJS({
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
    } = require_primordials();
    module2.exports = Writable;
    Writable.WritableState = WritableState;
    var { EventEmitter: EE } = require('events');
    var Stream = require_legacy().Stream;
    var { Buffer: Buffer2 } = require('buffer');
    var destroyImpl = require_destroy();
    var { addAbortSignal } = require_add_abort_signal();
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

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/duplexify.js
var require_duplexify = __commonJS({
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
    } = require_utils();
    var eos = require_end_of_stream();
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

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/duplex.js
var require_duplex = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/duplex.js'(
    exports2,
    module2
  ) {
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

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/transform.js
var require_transform = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/transform.js'(
    exports2,
    module2
  ) {
    'use strict';
    var { ObjectSetPrototypeOf, Symbol: Symbol2 } = require_primordials();
    module2.exports = Transform;
    var { ERR_METHOD_NOT_IMPLEMENTED } = require_errors().codes;
    var Duplex = require_duplex();
    var { getHighWaterMark } = require_state2();
    ObjectSetPrototypeOf(Transform.prototype, Duplex.prototype);
    ObjectSetPrototypeOf(Transform, Duplex);
    var kCallback = Symbol2('kCallback');
    function Transform(options) {
      if (!(this instanceof Transform)) return new Transform(options);
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
    Transform.prototype._final = final;
    Transform.prototype._transform = function (chunk, encoding, callback) {
      throw new ERR_METHOD_NOT_IMPLEMENTED('_transform()');
    };
    Transform.prototype._write = function (chunk, encoding, callback) {
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
    Transform.prototype._read = function () {
      if (this[kCallback]) {
        const callback = this[kCallback];
        this[kCallback] = null;
        callback();
      }
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/passthrough.js
var require_passthrough = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/passthrough.js'(
    exports2,
    module2
  ) {
    'use strict';
    var { ObjectSetPrototypeOf } = require_primordials();
    module2.exports = PassThrough;
    var Transform = require_transform();
    ObjectSetPrototypeOf(PassThrough.prototype, Transform.prototype);
    ObjectSetPrototypeOf(PassThrough, Transform);
    function PassThrough(options) {
      if (!(this instanceof PassThrough)) return new PassThrough(options);
      Transform.call(this, options);
    }
    PassThrough.prototype._transform = function (chunk, encoding, cb) {
      cb(null, chunk);
    };
  },
});

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/pipeline.js
var require_pipeline = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/pipeline.js'(
    exports2,
    module2
  ) {
    var process2 = require_process();
    var { ArrayIsArray, Promise: Promise2, SymbolAsyncIterator } = require_primordials();
    var eos = require_end_of_stream();
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

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/compose.js
var require_compose = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/compose.js'(
    exports2,
    module2
  ) {
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
    var eos = require_end_of_stream();
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
var require_operators = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/internal/streams/operators.js'(
    exports2,
    module2
  ) {
    'use strict';
    var AbortController = globalThis.AbortController || require_abort_controller().AbortController;
    var {
      codes: { ERR_INVALID_ARG_VALUE, ERR_INVALID_ARG_TYPE, ERR_MISSING_ARGS, ERR_OUT_OF_RANGE },
      AbortError,
    } = require_errors();
    var { validateAbortSignal, validateInteger, validateObject } = require_validators();
    var kWeakHandler = require_primordials().Symbol('kWeak');
    var { finished } = require_end_of_stream();
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
        async function pump() {
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
        pump();
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
var require_promises = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/stream/promises.js'(exports2, module2) {
    'use strict';
    var { ArrayPrototypePop, Promise: Promise2 } = require_primordials();
    var { isIterable, isNodeStream, isWebStream } = require_utils();
    var { pipelineImpl: pl } = require_pipeline();
    var { finished } = require_end_of_stream();
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
var require_stream = __commonJS({
  'node_modules/pino-abstract-transport/node_modules/readable-stream/lib/stream.js'(exports2, module2) {
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
    var eos = require_end_of_stream();
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

// node_modules/pino-abstract-transport/node_modules/readable-stream/lib/ours/index.js
var require_ours = __commonJS({
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

// node_modules/pino-abstract-transport/index.js
var require_pino_abstract_transport = __commonJS({
  'node_modules/pino-abstract-transport/index.js'(exports2, module2) {
    'use strict';
    var metadata = Symbol.for('pino.metadata');
    var split = require_split2();
    var { Duplex } = require_ours();
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

// node_modules/real-require/src/index.js
var require_src = __commonJS({
  'node_modules/real-require/src/index.js'(exports2, module2) {
    var realImport = new Function('modulePath', 'return import(modulePath)');
    function realRequire(modulePath) {
      if (typeof __non_webpack__require__ === 'function') {
        return __non_webpack__require__(modulePath);
      }
      return require(modulePath);
    }
    module2.exports = { realImport, realRequire };
  },
});

// node_modules/pino/lib/transport-stream.js
var require_transport_stream = __commonJS({
  'node_modules/pino/lib/transport-stream.js'(exports2, module2) {
    'use strict';
    var { realImport, realRequire } = require_src();
    module2.exports = loadTransportStreamBuilder2;
    async function loadTransportStreamBuilder2(target) {
      let fn;
      try {
        const toLoad = 'file://' + target;
        if (toLoad.endsWith('.ts') || toLoad.endsWith('.cts')) {
          if (process[Symbol.for('ts-node.register.instance')]) {
            realRequire('ts-node/register');
          } else if (process.env && process.env.TS_NODE_DEV) {
            realRequire('ts-node-dev');
          }
          fn = realRequire(decodeURIComponent(target));
        } else {
          fn = await realImport(toLoad);
        }
      } catch (error) {
        if (error.code === 'ENOTDIR' || error.code === 'ERR_MODULE_NOT_FOUND') {
          fn = realRequire(target);
        } else if (error.code === void 0) {
          fn = realRequire(decodeURIComponent(target));
        } else {
          throw error;
        }
      }
      if (typeof fn === 'object') fn = fn.default;
      if (typeof fn === 'object') fn = fn.default;
      if (typeof fn !== 'function') throw Error('exported worker is not a function');
      return fn;
    }
  },
});

// node_modules/pino/lib/worker.js
var pino = require_pino();
var build = require_pino_abstract_transport();
var loadTransportStreamBuilder = require_transport_stream();
module.exports = async function ({ targets, levels, dedupe }) {
  targets = await Promise.all(
    targets.map(async (t) => {
      const fn = await loadTransportStreamBuilder(t.target);
      const stream = await fn(t.options);
      return {
        level: t.level,
        stream,
      };
    })
  );
  return build(process2, {
    parse: 'lines',
    metadata: true,
    close(err, cb) {
      let expected = 0;
      for (const transport of targets) {
        expected++;
        transport.stream.on('close', closeCb);
        transport.stream.end();
      }
      function closeCb() {
        if (--expected === 0) {
          cb(err);
        }
      }
    },
  });
  function process2(stream) {
    const multi = pino.multistream(targets, { levels, dedupe });
    stream.on('data', function (chunk) {
      const { lastTime, lastMsg, lastObj, lastLevel } = this;
      multi.lastLevel = lastLevel;
      multi.lastTime = lastTime;
      multi.lastMsg = lastMsg;
      multi.lastObj = lastObj;
      multi.write(chunk + '\n');
    });
  }
};
