'use strict';
var _ = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
var Ln = _((R) => {
  'use strict';
  Object.defineProperty(R, '__esModule', { value: !0 });
  var jh = require('tty');
  function Bh(e) {
    if (e && e.__esModule) return e;
    var t = Object.create(null);
    return (
      e &&
        Object.keys(e).forEach(function (r) {
          if (r !== 'default') {
            var n = Object.getOwnPropertyDescriptor(e, r);
            Object.defineProperty(
              t,
              r,
              n.get
                ? n
                : {
                    enumerable: !0,
                    get: function () {
                      return e[r];
                    },
                  }
            );
          }
        }),
      (t.default = e),
      Object.freeze(t)
    );
  }
  var On = Bh(jh),
    { env: Pe = {}, argv: Ll = [], platform: Fh = '' } = typeof process > 'u' ? {} : process,
    $h = 'NO_COLOR' in Pe || Ll.includes('--no-color'),
    Uh = 'FORCE_COLOR' in Pe || Ll.includes('--color'),
    Gh = Fh === 'win32',
    xl = Pe.TERM === 'dumb',
    Hh = On && On.isatty && On.isatty(1) && Pe.TERM && !xl,
    Vh = 'CI' in Pe && ('GITHUB_ACTIONS' in Pe || 'GITLAB_CI' in Pe || 'CIRCLECI' in Pe),
    Ml = !$h && (Uh || (Gh && !xl) || Hh || Vh),
    vl = (e, t, r, n, i = t.substring(0, e) + n, o = t.substring(e + r.length), l = o.indexOf(r)) =>
      i + (l < 0 ? o : vl(l, o, r, n)),
    Kh = (e, t, r, n, i) => (e < 0 ? r + t + n : r + vl(e, t, n, i) + n),
    Yh =
      (e, t, r = e, n = e.length + 1) =>
      (i) =>
        i || !(i === '' || i === void 0) ? Kh(('' + i).indexOf(t, n), i, e, t, r) : '',
    T = (e, t, r) => Yh(`\x1B[${e}m`, `\x1B[${t}m`, r),
    Ol = {
      reset: T(0, 0),
      bold: T(1, 22, '\x1B[22m\x1B[1m'),
      dim: T(2, 22, '\x1B[22m\x1B[2m'),
      italic: T(3, 23),
      underline: T(4, 24),
      inverse: T(7, 27),
      hidden: T(8, 28),
      strikethrough: T(9, 29),
      black: T(30, 39),
      red: T(31, 39),
      green: T(32, 39),
      yellow: T(33, 39),
      blue: T(34, 39),
      magenta: T(35, 39),
      cyan: T(36, 39),
      white: T(37, 39),
      gray: T(90, 39),
      bgBlack: T(40, 49),
      bgRed: T(41, 49),
      bgGreen: T(42, 49),
      bgYellow: T(43, 49),
      bgBlue: T(44, 49),
      bgMagenta: T(45, 49),
      bgCyan: T(46, 49),
      bgWhite: T(47, 49),
      blackBright: T(90, 39),
      redBright: T(91, 39),
      greenBright: T(92, 39),
      yellowBright: T(93, 39),
      blueBright: T(94, 39),
      magentaBright: T(95, 39),
      cyanBright: T(96, 39),
      whiteBright: T(97, 39),
      bgBlackBright: T(100, 49),
      bgRedBright: T(101, 49),
      bgGreenBright: T(102, 49),
      bgYellowBright: T(103, 49),
      bgBlueBright: T(104, 49),
      bgMagentaBright: T(105, 49),
      bgCyanBright: T(106, 49),
      bgWhiteBright: T(107, 49),
    },
    Il = ({ useColor: e = Ml } = {}) => (e ? Ol : Object.keys(Ol).reduce((t, r) => ({ ...t, [r]: String }), {})),
    {
      reset: zh,
      bold: Jh,
      dim: Xh,
      italic: Zh,
      underline: Qh,
      inverse: eb,
      hidden: tb,
      strikethrough: rb,
      black: nb,
      red: ib,
      green: ob,
      yellow: lb,
      blue: sb,
      magenta: ub,
      cyan: fb,
      white: ab,
      gray: cb,
      bgBlack: db,
      bgRed: hb,
      bgGreen: bb,
      bgYellow: pb,
      bgBlue: yb,
      bgMagenta: gb,
      bgCyan: _b,
      bgWhite: wb,
      blackBright: Sb,
      redBright: Eb,
      greenBright: mb,
      yellowBright: Rb,
      blueBright: Ab,
      magentaBright: Tb,
      cyanBright: Ob,
      whiteBright: Lb,
      bgBlackBright: xb,
      bgRedBright: Mb,
      bgGreenBright: vb,
      bgYellowBright: Ib,
      bgBlueBright: Db,
      bgMagentaBright: Nb,
      bgCyanBright: Pb,
      bgWhiteBright: qb,
    } = Il();
  R.bgBlack = db;
  R.bgBlackBright = xb;
  R.bgBlue = yb;
  R.bgBlueBright = Db;
  R.bgCyan = _b;
  R.bgCyanBright = Pb;
  R.bgGreen = bb;
  R.bgGreenBright = vb;
  R.bgMagenta = gb;
  R.bgMagentaBright = Nb;
  R.bgRed = hb;
  R.bgRedBright = Mb;
  R.bgWhite = wb;
  R.bgWhiteBright = qb;
  R.bgYellow = pb;
  R.bgYellowBright = Ib;
  R.black = nb;
  R.blackBright = Sb;
  R.blue = sb;
  R.blueBright = Ab;
  R.bold = Jh;
  R.createColors = Il;
  R.cyan = fb;
  R.cyanBright = Ob;
  R.dim = Xh;
  R.gray = cb;
  R.green = ob;
  R.greenBright = mb;
  R.hidden = tb;
  R.inverse = eb;
  R.isColorSupported = Ml;
  R.italic = Zh;
  R.magenta = ub;
  R.magentaBright = Tb;
  R.red = ib;
  R.redBright = Eb;
  R.reset = zh;
  R.strikethrough = rb;
  R.underline = Qh;
  R.white = ab;
  R.whiteBright = Lb;
  R.yellow = lb;
  R.yellowBright = Rb;
});
var Pl = _((oO, Nl) => {
  Nl.exports = Dl;
  function Dl(e, t) {
    if (e && t) return Dl(e)(t);
    if (typeof e != 'function') throw new TypeError('need wrapper function');
    return (
      Object.keys(e).forEach(function (n) {
        r[n] = e[n];
      }),
      r
    );
    function r() {
      for (var n = new Array(arguments.length), i = 0; i < n.length; i++) n[i] = arguments[i];
      var o = e.apply(this, n),
        l = n[n.length - 1];
      return (
        typeof o == 'function' &&
          o !== l &&
          Object.keys(l).forEach(function (s) {
            o[s] = l[s];
          }),
        o
      );
    }
  }
});
var Mn = _((lO, xn) => {
  var ql = Pl();
  xn.exports = ql(sr);
  xn.exports.strict = ql(Cl);
  sr.proto = sr(function () {
    Object.defineProperty(Function.prototype, 'once', {
      value: function () {
        return sr(this);
      },
      configurable: !0,
    }),
      Object.defineProperty(Function.prototype, 'onceStrict', {
        value: function () {
          return Cl(this);
        },
        configurable: !0,
      });
  });
  function sr(e) {
    var t = function () {
      return t.called ? t.value : ((t.called = !0), (t.value = e.apply(this, arguments)));
    };
    return (t.called = !1), t;
  }
  function Cl(e) {
    var t = function () {
        if (t.called) throw new Error(t.onceError);
        return (t.called = !0), (t.value = e.apply(this, arguments));
      },
      r = e.name || 'Function wrapped with `once`';
    return (t.onceError = r + " shouldn't be called more than once"), (t.called = !1), t;
  }
});
var jl = _((sO, kl) => {
  var Cb = Mn(),
    Wb = function () {},
    kb = function (e) {
      return e.setHeader && typeof e.abort == 'function';
    },
    jb = function (e) {
      return e.stdio && Array.isArray(e.stdio) && e.stdio.length === 3;
    },
    Wl = function (e, t, r) {
      if (typeof t == 'function') return Wl(e, null, t);
      t || (t = {}), (r = Cb(r || Wb));
      var n = e._writableState,
        i = e._readableState,
        o = t.readable || (t.readable !== !1 && e.readable),
        l = t.writable || (t.writable !== !1 && e.writable),
        s = !1,
        f = function () {
          e.writable || u();
        },
        u = function () {
          (l = !1), o || r.call(e);
        },
        c = function () {
          (o = !1), l || r.call(e);
        },
        a = function (y) {
          r.call(e, y ? new Error('exited with error code: ' + y) : null);
        },
        b = function (y) {
          r.call(e, y);
        },
        h = function () {
          process.nextTick(d);
        },
        d = function () {
          if (!s) {
            if (o && !(i && i.ended && !i.destroyed)) return r.call(e, new Error('premature close'));
            if (l && !(n && n.ended && !n.destroyed)) return r.call(e, new Error('premature close'));
          }
        },
        S = function () {
          e.req.on('finish', u);
        };
      return (
        kb(e)
          ? (e.on('complete', u), e.on('abort', h), e.req ? S() : e.on('request', S))
          : l && !n && (e.on('end', f), e.on('close', f)),
        jb(e) && e.on('exit', a),
        e.on('end', c),
        e.on('finish', u),
        t.error !== !1 && e.on('error', b),
        e.on('close', h),
        function () {
          (s = !0),
            e.removeListener('complete', u),
            e.removeListener('abort', h),
            e.removeListener('request', S),
            e.req && e.req.removeListener('finish', u),
            e.removeListener('end', f),
            e.removeListener('close', f),
            e.removeListener('finish', u),
            e.removeListener('exit', a),
            e.removeListener('end', c),
            e.removeListener('error', b),
            e.removeListener('close', h);
        }
      );
    };
  kl.exports = Wl;
});
var $l = _((uO, Fl) => {
  var Bb = Mn(),
    Fb = jl(),
    vn = require('fs'),
    Pt = function () {},
    $b = /^v?\.0/.test(process.version),
    ur = function (e) {
      return typeof e == 'function';
    },
    Ub = function (e) {
      return !$b || !vn
        ? !1
        : (e instanceof (vn.ReadStream || Pt) || e instanceof (vn.WriteStream || Pt)) && ur(e.close);
    },
    Gb = function (e) {
      return e.setHeader && ur(e.abort);
    },
    Hb = function (e, t, r, n) {
      n = Bb(n);
      var i = !1;
      e.on('close', function () {
        i = !0;
      }),
        Fb(e, { readable: t, writable: r }, function (l) {
          if (l) return n(l);
          (i = !0), n();
        });
      var o = !1;
      return function (l) {
        if (!i && !o) {
          if (((o = !0), Ub(e))) return e.close(Pt);
          if (Gb(e)) return e.abort();
          if (ur(e.destroy)) return e.destroy();
          n(l || new Error('stream was destroyed'));
        }
      };
    },
    Bl = function (e) {
      e();
    },
    Vb = function (e, t) {
      return e.pipe(t);
    },
    Kb = function () {
      var e = Array.prototype.slice.call(arguments),
        t = (ur(e[e.length - 1] || Pt) && e.pop()) || Pt;
      if ((Array.isArray(e[0]) && (e = e[0]), e.length < 2)) throw new Error('pump requires two streams per minimum');
      var r,
        n = e.map(function (i, o) {
          var l = o < e.length - 1,
            s = o > 0;
          return Hb(i, l, s, function (f) {
            r || (r = f), f && n.forEach(Bl), !l && (n.forEach(Bl), t(r));
          });
        });
      return e.reduce(Vb);
    };
  Fl.exports = Kb;
});
var U = _((fO, Ul) => {
  'use strict';
  Ul.exports = {
    ArrayIsArray(e) {
      return Array.isArray(e);
    },
    ArrayPrototypeIncludes(e, t) {
      return e.includes(t);
    },
    ArrayPrototypeIndexOf(e, t) {
      return e.indexOf(t);
    },
    ArrayPrototypeJoin(e, t) {
      return e.join(t);
    },
    ArrayPrototypeMap(e, t) {
      return e.map(t);
    },
    ArrayPrototypePop(e, t) {
      return e.pop(t);
    },
    ArrayPrototypePush(e, t) {
      return e.push(t);
    },
    ArrayPrototypeSlice(e, t, r) {
      return e.slice(t, r);
    },
    Error,
    FunctionPrototypeCall(e, t, ...r) {
      return e.call(t, ...r);
    },
    FunctionPrototypeSymbolHasInstance(e, t) {
      return Function.prototype[Symbol.hasInstance].call(e, t);
    },
    MathFloor: Math.floor,
    Number,
    NumberIsInteger: Number.isInteger,
    NumberIsNaN: Number.isNaN,
    NumberMAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
    NumberMIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
    NumberParseInt: Number.parseInt,
    ObjectDefineProperties(e, t) {
      return Object.defineProperties(e, t);
    },
    ObjectDefineProperty(e, t, r) {
      return Object.defineProperty(e, t, r);
    },
    ObjectGetOwnPropertyDescriptor(e, t) {
      return Object.getOwnPropertyDescriptor(e, t);
    },
    ObjectKeys(e) {
      return Object.keys(e);
    },
    ObjectSetPrototypeOf(e, t) {
      return Object.setPrototypeOf(e, t);
    },
    Promise,
    PromisePrototypeCatch(e, t) {
      return e.catch(t);
    },
    PromisePrototypeThen(e, t, r) {
      return e.then(t, r);
    },
    PromiseReject(e) {
      return Promise.reject(e);
    },
    ReflectApply: Reflect.apply,
    RegExpPrototypeTest(e, t) {
      return e.test(t);
    },
    SafeSet: Set,
    String,
    StringPrototypeSlice(e, t, r) {
      return e.slice(t, r);
    },
    StringPrototypeToLowerCase(e) {
      return e.toLowerCase();
    },
    StringPrototypeToUpperCase(e) {
      return e.toUpperCase();
    },
    StringPrototypeTrim(e) {
      return e.trim();
    },
    Symbol,
    SymbolFor: Symbol.for,
    SymbolAsyncIterator: Symbol.asyncIterator,
    SymbolHasInstance: Symbol.hasInstance,
    SymbolIterator: Symbol.iterator,
    TypedArrayPrototypeSet(e, t, r) {
      return e.set(t, r);
    },
    Uint8Array,
  };
});
var de = _((aO, Dn) => {
  'use strict';
  var Yb = require('buffer'),
    zb = Object.getPrototypeOf(async function () {}).constructor,
    Gl = globalThis.Blob || Yb.Blob,
    Jb =
      typeof Gl < 'u'
        ? function (t) {
            return t instanceof Gl;
          }
        : function (t) {
            return !1;
          },
    In = class extends Error {
      constructor(t) {
        if (!Array.isArray(t)) throw new TypeError(`Expected input to be an Array, got ${typeof t}`);
        let r = '';
        for (let n = 0; n < t.length; n++)
          r += `    ${t[n].stack}
`;
        super(r), (this.name = 'AggregateError'), (this.errors = t);
      }
    };
  Dn.exports = {
    AggregateError: In,
    kEmptyObject: Object.freeze({}),
    once(e) {
      let t = !1;
      return function (...r) {
        t || ((t = !0), e.apply(this, r));
      };
    },
    createDeferredPromise: function () {
      let e, t;
      return {
        promise: new Promise((n, i) => {
          (e = n), (t = i);
        }),
        resolve: e,
        reject: t,
      };
    },
    promisify(e) {
      return new Promise((t, r) => {
        e((n, ...i) => (n ? r(n) : t(...i)));
      });
    },
    debuglog() {
      return function () {};
    },
    format(e, ...t) {
      return e.replace(/%([sdifj])/g, function (...[r, n]) {
        let i = t.shift();
        return n === 'f'
          ? i.toFixed(6)
          : n === 'j'
          ? JSON.stringify(i)
          : n === 's' && typeof i == 'object'
          ? `${i.constructor !== Object ? i.constructor.name : ''} {}`.trim()
          : i.toString();
      });
    },
    inspect(e) {
      switch (typeof e) {
        case 'string':
          if (e.includes("'"))
            if (e.includes('"')) {
              if (!e.includes('`') && !e.includes('${')) return `\`${e}\``;
            } else return `"${e}"`;
          return `'${e}'`;
        case 'number':
          return isNaN(e) ? 'NaN' : Object.is(e, -0) ? String(e) : e;
        case 'bigint':
          return `${String(e)}n`;
        case 'boolean':
        case 'undefined':
          return String(e);
        case 'object':
          return '{}';
      }
    },
    types: {
      isAsyncFunction(e) {
        return e instanceof zb;
      },
      isArrayBufferView(e) {
        return ArrayBuffer.isView(e);
      },
    },
    isBlob: Jb,
  };
  Dn.exports.promisify.custom = Symbol.for('nodejs.util.promisify.custom');
});
var es = _((Wt, Ct) => {
  'use strict';
  Object.defineProperty(Wt, '__esModule', { value: !0 });
  var Jl = new WeakMap(),
    Nn = new WeakMap();
  function q(e) {
    let t = Jl.get(e);
    return console.assert(t != null, "'this' is expected an Event object, but got", e), t;
  }
  function Hl(e) {
    if (e.passiveListener != null) {
      typeof console < 'u' &&
        typeof console.error == 'function' &&
        console.error('Unable to preventDefault inside passive event listener invocation.', e.passiveListener);
      return;
    }
    e.event.cancelable && ((e.canceled = !0), typeof e.event.preventDefault == 'function' && e.event.preventDefault());
  }
  function dt(e, t) {
    Jl.set(this, {
      eventTarget: e,
      event: t,
      eventPhase: 2,
      currentTarget: e,
      canceled: !1,
      stopped: !1,
      immediateStopped: !1,
      passiveListener: null,
      timeStamp: t.timeStamp || Date.now(),
    }),
      Object.defineProperty(this, 'isTrusted', { value: !1, enumerable: !0 });
    let r = Object.keys(t);
    for (let n = 0; n < r.length; ++n) {
      let i = r[n];
      i in this || Object.defineProperty(this, i, Xl(i));
    }
  }
  dt.prototype = {
    get type() {
      return q(this).event.type;
    },
    get target() {
      return q(this).eventTarget;
    },
    get currentTarget() {
      return q(this).currentTarget;
    },
    composedPath() {
      let e = q(this).currentTarget;
      return e == null ? [] : [e];
    },
    get NONE() {
      return 0;
    },
    get CAPTURING_PHASE() {
      return 1;
    },
    get AT_TARGET() {
      return 2;
    },
    get BUBBLING_PHASE() {
      return 3;
    },
    get eventPhase() {
      return q(this).eventPhase;
    },
    stopPropagation() {
      let e = q(this);
      (e.stopped = !0), typeof e.event.stopPropagation == 'function' && e.event.stopPropagation();
    },
    stopImmediatePropagation() {
      let e = q(this);
      (e.stopped = !0),
        (e.immediateStopped = !0),
        typeof e.event.stopImmediatePropagation == 'function' && e.event.stopImmediatePropagation();
    },
    get bubbles() {
      return !!q(this).event.bubbles;
    },
    get cancelable() {
      return !!q(this).event.cancelable;
    },
    preventDefault() {
      Hl(q(this));
    },
    get defaultPrevented() {
      return q(this).canceled;
    },
    get composed() {
      return !!q(this).event.composed;
    },
    get timeStamp() {
      return q(this).timeStamp;
    },
    get srcElement() {
      return q(this).eventTarget;
    },
    get cancelBubble() {
      return q(this).stopped;
    },
    set cancelBubble(e) {
      if (!e) return;
      let t = q(this);
      (t.stopped = !0), typeof t.event.cancelBubble == 'boolean' && (t.event.cancelBubble = !0);
    },
    get returnValue() {
      return !q(this).canceled;
    },
    set returnValue(e) {
      e || Hl(q(this));
    },
    initEvent() {},
  };
  Object.defineProperty(dt.prototype, 'constructor', { value: dt, configurable: !0, writable: !0 });
  typeof window < 'u' &&
    typeof window.Event < 'u' &&
    (Object.setPrototypeOf(dt.prototype, window.Event.prototype), Nn.set(window.Event.prototype, dt));
  function Xl(e) {
    return {
      get() {
        return q(this).event[e];
      },
      set(t) {
        q(this).event[e] = t;
      },
      configurable: !0,
      enumerable: !0,
    };
  }
  function Xb(e) {
    return {
      value() {
        let t = q(this).event;
        return t[e].apply(t, arguments);
      },
      configurable: !0,
      enumerable: !0,
    };
  }
  function Zb(e, t) {
    let r = Object.keys(t);
    if (r.length === 0) return e;
    function n(i, o) {
      e.call(this, i, o);
    }
    n.prototype = Object.create(e.prototype, { constructor: { value: n, configurable: !0, writable: !0 } });
    for (let i = 0; i < r.length; ++i) {
      let o = r[i];
      if (!(o in e.prototype)) {
        let s = typeof Object.getOwnPropertyDescriptor(t, o).value == 'function';
        Object.defineProperty(n.prototype, o, s ? Xb(o) : Xl(o));
      }
    }
    return n;
  }
  function Zl(e) {
    if (e == null || e === Object.prototype) return dt;
    let t = Nn.get(e);
    return t == null && ((t = Zb(Zl(Object.getPrototypeOf(e)), e)), Nn.set(e, t)), t;
  }
  function Qb(e, t) {
    let r = Zl(Object.getPrototypeOf(t));
    return new r(e, t);
  }
  function ep(e) {
    return q(e).immediateStopped;
  }
  function tp(e, t) {
    q(e).eventPhase = t;
  }
  function rp(e, t) {
    q(e).currentTarget = t;
  }
  function Vl(e, t) {
    q(e).passiveListener = t;
  }
  var Ql = new WeakMap(),
    Kl = 1,
    Yl = 2,
    fr = 3;
  function ar(e) {
    return e !== null && typeof e == 'object';
  }
  function qt(e) {
    let t = Ql.get(e);
    if (t == null) throw new TypeError("'this' is expected an EventTarget object, but got another value.");
    return t;
  }
  function np(e) {
    return {
      get() {
        let r = qt(this).get(e);
        for (; r != null; ) {
          if (r.listenerType === fr) return r.listener;
          r = r.next;
        }
        return null;
      },
      set(t) {
        typeof t != 'function' && !ar(t) && (t = null);
        let r = qt(this),
          n = null,
          i = r.get(e);
        for (; i != null; )
          i.listenerType === fr
            ? n !== null
              ? (n.next = i.next)
              : i.next !== null
              ? r.set(e, i.next)
              : r.delete(e)
            : (n = i),
            (i = i.next);
        if (t !== null) {
          let o = { listener: t, listenerType: fr, passive: !1, once: !1, next: null };
          n === null ? r.set(e, o) : (n.next = o);
        }
      },
      configurable: !0,
      enumerable: !0,
    };
  }
  function Pn(e, t) {
    Object.defineProperty(e, `on${t}`, np(t));
  }
  function zl(e) {
    function t() {
      le.call(this);
    }
    t.prototype = Object.create(le.prototype, { constructor: { value: t, configurable: !0, writable: !0 } });
    for (let r = 0; r < e.length; ++r) Pn(t.prototype, e[r]);
    return t;
  }
  function le() {
    if (this instanceof le) {
      Ql.set(this, new Map());
      return;
    }
    if (arguments.length === 1 && Array.isArray(arguments[0])) return zl(arguments[0]);
    if (arguments.length > 0) {
      let e = new Array(arguments.length);
      for (let t = 0; t < arguments.length; ++t) e[t] = arguments[t];
      return zl(e);
    }
    throw new TypeError('Cannot call a class as a function');
  }
  le.prototype = {
    addEventListener(e, t, r) {
      if (t == null) return;
      if (typeof t != 'function' && !ar(t)) throw new TypeError("'listener' should be a function or an object.");
      let n = qt(this),
        i = ar(r),
        l = (i ? !!r.capture : !!r) ? Kl : Yl,
        s = { listener: t, listenerType: l, passive: i && !!r.passive, once: i && !!r.once, next: null },
        f = n.get(e);
      if (f === void 0) {
        n.set(e, s);
        return;
      }
      let u = null;
      for (; f != null; ) {
        if (f.listener === t && f.listenerType === l) return;
        (u = f), (f = f.next);
      }
      u.next = s;
    },
    removeEventListener(e, t, r) {
      if (t == null) return;
      let n = qt(this),
        o = (ar(r) ? !!r.capture : !!r) ? Kl : Yl,
        l = null,
        s = n.get(e);
      for (; s != null; ) {
        if (s.listener === t && s.listenerType === o) {
          l !== null ? (l.next = s.next) : s.next !== null ? n.set(e, s.next) : n.delete(e);
          return;
        }
        (l = s), (s = s.next);
      }
    },
    dispatchEvent(e) {
      if (e == null || typeof e.type != 'string') throw new TypeError('"event.type" should be a string.');
      let t = qt(this),
        r = e.type,
        n = t.get(r);
      if (n == null) return !0;
      let i = Qb(this, e),
        o = null;
      for (; n != null; ) {
        if (
          (n.once ? (o !== null ? (o.next = n.next) : n.next !== null ? t.set(r, n.next) : t.delete(r)) : (o = n),
          Vl(i, n.passive ? n.listener : null),
          typeof n.listener == 'function')
        )
          try {
            n.listener.call(this, i);
          } catch (l) {
            typeof console < 'u' && typeof console.error == 'function' && console.error(l);
          }
        else n.listenerType !== fr && typeof n.listener.handleEvent == 'function' && n.listener.handleEvent(i);
        if (ep(i)) break;
        n = n.next;
      }
      return Vl(i, null), tp(i, 0), rp(i, null), !i.defaultPrevented;
    },
  };
  Object.defineProperty(le.prototype, 'constructor', { value: le, configurable: !0, writable: !0 });
  typeof window < 'u' &&
    typeof window.EventTarget < 'u' &&
    Object.setPrototypeOf(le.prototype, window.EventTarget.prototype);
  Wt.defineEventAttribute = Pn;
  Wt.EventTarget = le;
  Wt.default = le;
  Ct.exports = le;
  Ct.exports.EventTarget = Ct.exports.default = le;
  Ct.exports.defineEventAttribute = Pn;
});
var Ue = _((jt, kt) => {
  'use strict';
  Object.defineProperty(jt, '__esModule', { value: !0 });
  var qn = es(),
    qe = class extends qn.EventTarget {
      constructor() {
        throw (super(), new TypeError('AbortSignal cannot be constructed directly'));
      }
      get aborted() {
        let t = cr.get(this);
        if (typeof t != 'boolean')
          throw new TypeError(
            `Expected 'this' to be an 'AbortSignal' object, but got ${this === null ? 'null' : typeof this}`
          );
        return t;
      }
    };
  qn.defineEventAttribute(qe.prototype, 'abort');
  function ip() {
    let e = Object.create(qe.prototype);
    return qn.EventTarget.call(e), cr.set(e, !1), e;
  }
  function op(e) {
    cr.get(e) === !1 && (cr.set(e, !0), e.dispatchEvent({ type: 'abort' }));
  }
  var cr = new WeakMap();
  Object.defineProperties(qe.prototype, { aborted: { enumerable: !0 } });
  typeof Symbol == 'function' &&
    typeof Symbol.toStringTag == 'symbol' &&
    Object.defineProperty(qe.prototype, Symbol.toStringTag, { configurable: !0, value: 'AbortSignal' });
  var Ce = class {
      constructor() {
        rs.set(this, ip());
      }
      get signal() {
        return ts(this);
      }
      abort() {
        op(ts(this));
      }
    },
    rs = new WeakMap();
  function ts(e) {
    let t = rs.get(e);
    if (t == null)
      throw new TypeError(
        `Expected 'this' to be an 'AbortController' object, but got ${e === null ? 'null' : typeof e}`
      );
    return t;
  }
  Object.defineProperties(Ce.prototype, { signal: { enumerable: !0 }, abort: { enumerable: !0 } });
  typeof Symbol == 'function' &&
    typeof Symbol.toStringTag == 'symbol' &&
    Object.defineProperty(Ce.prototype, Symbol.toStringTag, { configurable: !0, value: 'AbortController' });
  jt.AbortController = Ce;
  jt.AbortSignal = qe;
  jt.default = Ce;
  kt.exports = Ce;
  kt.exports.AbortController = kt.exports.default = Ce;
  kt.exports.AbortSignal = qe;
});
var z = _((cO, os) => {
  'use strict';
  var { format: lp, inspect: dr, AggregateError: sp } = de(),
    up = globalThis.AggregateError || sp,
    fp = Symbol('kIsNodeError'),
    ap = ['string', 'function', 'number', 'object', 'Function', 'Object', 'boolean', 'bigint', 'symbol'],
    cp = /^([A-Z][a-z0-9]*)+$/,
    dp = '__node_internal_',
    hr = {};
  function Ge(e, t) {
    if (!e) throw new hr.ERR_INTERNAL_ASSERTION(t);
  }
  function ns(e) {
    let t = '',
      r = e.length,
      n = e[0] === '-' ? 1 : 0;
    for (; r >= n + 4; r -= 3) t = `_${e.slice(r - 3, r)}${t}`;
    return `${e.slice(0, r)}${t}`;
  }
  function hp(e, t, r) {
    if (typeof t == 'function')
      return (
        Ge(
          t.length <= r.length,
          `Code: ${e}; The provided arguments length (${r.length}) does not match the required ones (${t.length}).`
        ),
        t(...r)
      );
    let n = (t.match(/%[dfijoOs]/g) || []).length;
    return (
      Ge(
        n === r.length,
        `Code: ${e}; The provided arguments length (${r.length}) does not match the required ones (${n}).`
      ),
      r.length === 0 ? t : lp(t, ...r)
    );
  }
  function K(e, t, r) {
    r || (r = Error);
    class n extends r {
      constructor(...o) {
        super(hp(e, t, o));
      }
      toString() {
        return `${this.name} [${e}]: ${this.message}`;
      }
    }
    Object.defineProperties(n.prototype, {
      name: { value: r.name, writable: !0, enumerable: !1, configurable: !0 },
      toString: {
        value() {
          return `${this.name} [${e}]: ${this.message}`;
        },
        writable: !0,
        enumerable: !1,
        configurable: !0,
      },
    }),
      (n.prototype.code = e),
      (n.prototype[fp] = !0),
      (hr[e] = n);
  }
  function is(e) {
    let t = dp + e.name;
    return Object.defineProperty(e, 'name', { value: t }), e;
  }
  function bp(e, t) {
    if (e && t && e !== t) {
      if (Array.isArray(t.errors)) return t.errors.push(e), t;
      let r = new up([t, e], t.message);
      return (r.code = t.code), r;
    }
    return e || t;
  }
  var Cn = class extends Error {
    constructor(t = 'The operation was aborted', r = void 0) {
      if (r !== void 0 && typeof r != 'object') throw new hr.ERR_INVALID_ARG_TYPE('options', 'Object', r);
      super(t, r), (this.code = 'ABORT_ERR'), (this.name = 'AbortError');
    }
  };
  K('ERR_ASSERTION', '%s', Error);
  K(
    'ERR_INVALID_ARG_TYPE',
    (e, t, r) => {
      Ge(typeof e == 'string', "'name' must be a string"), Array.isArray(t) || (t = [t]);
      let n = 'The ';
      e.endsWith(' argument') ? (n += `${e} `) : (n += `"${e}" ${e.includes('.') ? 'property' : 'argument'} `),
        (n += 'must be ');
      let i = [],
        o = [],
        l = [];
      for (let f of t)
        Ge(typeof f == 'string', 'All expected entries have to be of type string'),
          ap.includes(f)
            ? i.push(f.toLowerCase())
            : cp.test(f)
            ? o.push(f)
            : (Ge(f !== 'object', 'The value "object" should be written as "Object"'), l.push(f));
      if (o.length > 0) {
        let f = i.indexOf('object');
        f !== -1 && (i.splice(i, f, 1), o.push('Object'));
      }
      if (i.length > 0) {
        switch (i.length) {
          case 1:
            n += `of type ${i[0]}`;
            break;
          case 2:
            n += `one of type ${i[0]} or ${i[1]}`;
            break;
          default: {
            let f = i.pop();
            n += `one of type ${i.join(', ')}, or ${f}`;
          }
        }
        (o.length > 0 || l.length > 0) && (n += ' or ');
      }
      if (o.length > 0) {
        switch (o.length) {
          case 1:
            n += `an instance of ${o[0]}`;
            break;
          case 2:
            n += `an instance of ${o[0]} or ${o[1]}`;
            break;
          default: {
            let f = o.pop();
            n += `an instance of ${o.join(', ')}, or ${f}`;
          }
        }
        l.length > 0 && (n += ' or ');
      }
      switch (l.length) {
        case 0:
          break;
        case 1:
          l[0].toLowerCase() !== l[0] && (n += 'an '), (n += `${l[0]}`);
          break;
        case 2:
          n += `one of ${l[0]} or ${l[1]}`;
          break;
        default: {
          let f = l.pop();
          n += `one of ${l.join(', ')}, or ${f}`;
        }
      }
      if (r == null) n += `. Received ${r}`;
      else if (typeof r == 'function' && r.name) n += `. Received function ${r.name}`;
      else if (typeof r == 'object') {
        var s;
        if ((s = r.constructor) !== null && s !== void 0 && s.name)
          n += `. Received an instance of ${r.constructor.name}`;
        else {
          let f = dr(r, { depth: -1 });
          n += `. Received ${f}`;
        }
      } else {
        let f = dr(r, { colors: !1 });
        f.length > 25 && (f = `${f.slice(0, 25)}...`), (n += `. Received type ${typeof r} (${f})`);
      }
      return n;
    },
    TypeError
  );
  K(
    'ERR_INVALID_ARG_VALUE',
    (e, t, r = 'is invalid') => {
      let n = dr(t);
      return (
        n.length > 128 && (n = n.slice(0, 128) + '...'),
        `The ${e.includes('.') ? 'property' : 'argument'} '${e}' ${r}. Received ${n}`
      );
    },
    TypeError
  );
  K(
    'ERR_INVALID_RETURN_VALUE',
    (e, t, r) => {
      var n;
      let i =
        r != null && (n = r.constructor) !== null && n !== void 0 && n.name
          ? `instance of ${r.constructor.name}`
          : `type ${typeof r}`;
      return `Expected ${e} to be returned from the "${t}" function but got ${i}.`;
    },
    TypeError
  );
  K(
    'ERR_MISSING_ARGS',
    (...e) => {
      Ge(e.length > 0, 'At least one arg needs to be specified');
      let t,
        r = e.length;
      switch (((e = (Array.isArray(e) ? e : [e]).map((n) => `"${n}"`).join(' or ')), r)) {
        case 1:
          t += `The ${e[0]} argument`;
          break;
        case 2:
          t += `The ${e[0]} and ${e[1]} arguments`;
          break;
        default:
          {
            let n = e.pop();
            t += `The ${e.join(', ')}, and ${n} arguments`;
          }
          break;
      }
      return `${t} must be specified`;
    },
    TypeError
  );
  K(
    'ERR_OUT_OF_RANGE',
    (e, t, r) => {
      Ge(t, 'Missing "range" argument');
      let n;
      return (
        Number.isInteger(r) && Math.abs(r) > 2 ** 32
          ? (n = ns(String(r)))
          : typeof r == 'bigint'
          ? ((n = String(r)), (r > 2n ** 32n || r < -(2n ** 32n)) && (n = ns(n)), (n += 'n'))
          : (n = dr(r)),
        `The value of "${e}" is out of range. It must be ${t}. Received ${n}`
      );
    },
    RangeError
  );
  K('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times', Error);
  K('ERR_METHOD_NOT_IMPLEMENTED', 'The %s method is not implemented', Error);
  K('ERR_STREAM_ALREADY_FINISHED', 'Cannot call %s after a stream was finished', Error);
  K('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable', Error);
  K('ERR_STREAM_DESTROYED', 'Cannot call %s after a stream was destroyed', Error);
  K('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
  K('ERR_STREAM_PREMATURE_CLOSE', 'Premature close', Error);
  K('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF', Error);
  K('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event', Error);
  K('ERR_STREAM_WRITE_AFTER_END', 'write after end', Error);
  K('ERR_UNKNOWN_ENCODING', 'Unknown encoding: %s', TypeError);
  os.exports = { AbortError: Cn, aggregateTwoErrors: is(bp), hideStackFrames: is, codes: hr };
});
var Bt = _((dO, bs) => {
  'use strict';
  var {
      ArrayIsArray: kn,
      ArrayPrototypeIncludes: fs,
      ArrayPrototypeJoin: as,
      ArrayPrototypeMap: pp,
      NumberIsInteger: jn,
      NumberIsNaN: yp,
      NumberMAX_SAFE_INTEGER: gp,
      NumberMIN_SAFE_INTEGER: _p,
      NumberParseInt: wp,
      ObjectPrototypeHasOwnProperty: Sp,
      RegExpPrototypeExec: cs,
      String: Ep,
      StringPrototypeToUpperCase: mp,
      StringPrototypeTrim: Rp,
    } = U(),
    {
      hideStackFrames: re,
      codes: {
        ERR_SOCKET_BAD_PORT: Ap,
        ERR_INVALID_ARG_TYPE: J,
        ERR_INVALID_ARG_VALUE: ht,
        ERR_OUT_OF_RANGE: He,
        ERR_UNKNOWN_SIGNAL: ls,
      },
    } = z(),
    { normalizeEncoding: Tp } = de(),
    { isAsyncFunction: Op, isArrayBufferView: Lp } = de().types,
    ss = {};
  function xp(e) {
    return e === (e | 0);
  }
  function Mp(e) {
    return e === e >>> 0;
  }
  var vp = /^[0-7]+$/,
    Ip = 'must be a 32-bit unsigned integer or an octal string';
  function Dp(e, t, r) {
    if ((typeof e > 'u' && (e = r), typeof e == 'string')) {
      if (cs(vp, e) === null) throw new ht(t, e, Ip);
      e = wp(e, 8);
    }
    return ds(e, t), e;
  }
  var Np = re((e, t, r = _p, n = gp) => {
      if (typeof e != 'number') throw new J(t, 'number', e);
      if (!jn(e)) throw new He(t, 'an integer', e);
      if (e < r || e > n) throw new He(t, `>= ${r} && <= ${n}`, e);
    }),
    Pp = re((e, t, r = -2147483648, n = 2147483647) => {
      if (typeof e != 'number') throw new J(t, 'number', e);
      if (!jn(e)) throw new He(t, 'an integer', e);
      if (e < r || e > n) throw new He(t, `>= ${r} && <= ${n}`, e);
    }),
    ds = re((e, t, r = !1) => {
      if (typeof e != 'number') throw new J(t, 'number', e);
      if (!jn(e)) throw new He(t, 'an integer', e);
      let n = r ? 1 : 0,
        i = 4294967295;
      if (e < n || e > i) throw new He(t, `>= ${n} && <= ${i}`, e);
    });
  function Bn(e, t) {
    if (typeof e != 'string') throw new J(t, 'string', e);
  }
  function qp(e, t, r = void 0, n) {
    if (typeof e != 'number') throw new J(t, 'number', e);
    if ((r != null && e < r) || (n != null && e > n) || ((r != null || n != null) && yp(e)))
      throw new He(
        t,
        `${r != null ? `>= ${r}` : ''}${r != null && n != null ? ' && ' : ''}${n != null ? `<= ${n}` : ''}`,
        e
      );
  }
  var Cp = re((e, t, r) => {
    if (!fs(r, e)) {
      let i =
        'must be one of: ' +
        as(
          pp(r, (o) => (typeof o == 'string' ? `'${o}'` : Ep(o))),
          ', '
        );
      throw new ht(t, e, i);
    }
  });
  function hs(e, t) {
    if (typeof e != 'boolean') throw new J(t, 'boolean', e);
  }
  function Wn(e, t, r) {
    return e == null || !Sp(e, t) ? r : e[t];
  }
  var Wp = re((e, t, r = null) => {
      let n = Wn(r, 'allowArray', !1),
        i = Wn(r, 'allowFunction', !1);
      if (
        (!Wn(r, 'nullable', !1) && e === null) ||
        (!n && kn(e)) ||
        (typeof e != 'object' && (!i || typeof e != 'function'))
      )
        throw new J(t, 'Object', e);
    }),
    kp = re((e, t) => {
      if (e != null && typeof e != 'object' && typeof e != 'function') throw new J(t, 'a dictionary', e);
    }),
    Fn = re((e, t, r = 0) => {
      if (!kn(e)) throw new J(t, 'Array', e);
      if (e.length < r) {
        let n = `must be longer than ${r}`;
        throw new ht(t, e, n);
      }
    });
  function jp(e, t) {
    Fn(e, t);
    for (let r = 0; r < e.length; r++) Bn(e[r], `${t}[${r}]`);
  }
  function Bp(e, t) {
    Fn(e, t);
    for (let r = 0; r < e.length; r++) hs(e[r], `${t}[${r}]`);
  }
  function Fp(e, t = 'signal') {
    if ((Bn(e, t), ss[e] === void 0))
      throw ss[mp(e)] !== void 0 ? new ls(e + ' (signals must use all capital letters)') : new ls(e);
  }
  var $p = re((e, t = 'buffer') => {
    if (!Lp(e)) throw new J(t, ['Buffer', 'TypedArray', 'DataView'], e);
  });
  function Up(e, t) {
    let r = Tp(t),
      n = e.length;
    if (r === 'hex' && n % 2 !== 0) throw new ht('encoding', t, `is invalid for data of length ${n}`);
  }
  function Gp(e, t = 'Port', r = !0) {
    if (
      (typeof e != 'number' && typeof e != 'string') ||
      (typeof e == 'string' && Rp(e).length === 0) ||
      +e !== +e >>> 0 ||
      e > 65535 ||
      (e === 0 && !r)
    )
      throw new Ap(t, e, r);
    return e | 0;
  }
  var Hp = re((e, t) => {
      if (e !== void 0 && (e === null || typeof e != 'object' || !('aborted' in e))) throw new J(t, 'AbortSignal', e);
    }),
    Vp = re((e, t) => {
      if (typeof e != 'function') throw new J(t, 'Function', e);
    }),
    Kp = re((e, t) => {
      if (typeof e != 'function' || Op(e)) throw new J(t, 'Function', e);
    }),
    Yp = re((e, t) => {
      if (e !== void 0) throw new J(t, 'undefined', e);
    });
  function zp(e, t, r) {
    if (!fs(r, e)) throw new J(t, `('${as(r, '|')}')`, e);
  }
  var Jp = /^(?:<[^>]*>)(?:\s*;\s*[^;"\s]+(?:=(")?[^;"\s]*\1)?)*$/;
  function us(e, t) {
    if (typeof e > 'u' || !cs(Jp, e))
      throw new ht(t, e, 'must be an array or string of format "</styles.css>; rel=preload; as=style"');
  }
  function Xp(e) {
    if (typeof e == 'string') return us(e, 'hints'), e;
    if (kn(e)) {
      let t = e.length,
        r = '';
      if (t === 0) return r;
      for (let n = 0; n < t; n++) {
        let i = e[n];
        us(i, 'hints'), (r += i), n !== t - 1 && (r += ', ');
      }
      return r;
    }
    throw new ht('hints', e, 'must be an array or string of format "</styles.css>; rel=preload; as=style"');
  }
  bs.exports = {
    isInt32: xp,
    isUint32: Mp,
    parseFileMode: Dp,
    validateArray: Fn,
    validateStringArray: jp,
    validateBooleanArray: Bp,
    validateBoolean: hs,
    validateBuffer: $p,
    validateDictionary: kp,
    validateEncoding: Up,
    validateFunction: Vp,
    validateInt32: Pp,
    validateInteger: Np,
    validateNumber: qp,
    validateObject: Wp,
    validateOneOf: Cp,
    validatePlainFunction: Kp,
    validatePort: Gp,
    validateSignalName: Fp,
    validateString: Bn,
    validateUint32: ds,
    validateUndefined: Yp,
    validateUnion: zp,
    validateAbortSignal: Hp,
    validateLinkHeaderValue: Xp,
  };
});
var X = _((hO, ps) => {
  ps.exports = global.process;
});
var be = _((bO, Is) => {
  'use strict';
  var { Symbol: br, SymbolAsyncIterator: ys, SymbolIterator: gs, SymbolFor: _s } = U(),
    ws = br('kDestroyed'),
    Ss = br('kIsErrored'),
    $n = br('kIsReadable'),
    Es = br('kIsDisturbed'),
    Zp = _s('nodejs.webstream.isClosedPromise'),
    Qp = _s('nodejs.webstream.controllerErrorFunction');
  function pr(e, t = !1) {
    var r;
    return !!(
      e &&
      typeof e.pipe == 'function' &&
      typeof e.on == 'function' &&
      (!t || (typeof e.pause == 'function' && typeof e.resume == 'function')) &&
      (!e._writableState || ((r = e._readableState) === null || r === void 0 ? void 0 : r.readable) !== !1) &&
      (!e._writableState || e._readableState)
    );
  }
  function yr(e) {
    var t;
    return !!(
      e &&
      typeof e.write == 'function' &&
      typeof e.on == 'function' &&
      (!e._readableState || ((t = e._writableState) === null || t === void 0 ? void 0 : t.writable) !== !1)
    );
  }
  function ey(e) {
    return !!(
      e &&
      typeof e.pipe == 'function' &&
      e._readableState &&
      typeof e.on == 'function' &&
      typeof e.write == 'function'
    );
  }
  function he(e) {
    return (
      e &&
      (e._readableState ||
        e._writableState ||
        (typeof e.write == 'function' && typeof e.on == 'function') ||
        (typeof e.pipe == 'function' && typeof e.on == 'function'))
    );
  }
  function ms(e) {
    return !!(
      e &&
      !he(e) &&
      typeof e.pipeThrough == 'function' &&
      typeof e.getReader == 'function' &&
      typeof e.cancel == 'function'
    );
  }
  function Rs(e) {
    return !!(e && !he(e) && typeof e.getWriter == 'function' && typeof e.abort == 'function');
  }
  function As(e) {
    return !!(e && !he(e) && typeof e.readable == 'object' && typeof e.writable == 'object');
  }
  function ty(e) {
    return ms(e) || Rs(e) || As(e);
  }
  function ry(e, t) {
    return e == null
      ? !1
      : t === !0
      ? typeof e[ys] == 'function'
      : t === !1
      ? typeof e[gs] == 'function'
      : typeof e[ys] == 'function' || typeof e[gs] == 'function';
  }
  function gr(e) {
    if (!he(e)) return null;
    let t = e._writableState,
      r = e._readableState,
      n = t || r;
    return !!(e.destroyed || e[ws] || (n != null && n.destroyed));
  }
  function Ts(e) {
    if (!yr(e)) return null;
    if (e.writableEnded === !0) return !0;
    let t = e._writableState;
    return t != null && t.errored ? !1 : typeof t?.ended != 'boolean' ? null : t.ended;
  }
  function ny(e, t) {
    if (!yr(e)) return null;
    if (e.writableFinished === !0) return !0;
    let r = e._writableState;
    return r != null && r.errored
      ? !1
      : typeof r?.finished != 'boolean'
      ? null
      : !!(r.finished || (t === !1 && r.ended === !0 && r.length === 0));
  }
  function iy(e) {
    if (!pr(e)) return null;
    if (e.readableEnded === !0) return !0;
    let t = e._readableState;
    return !t || t.errored ? !1 : typeof t?.ended != 'boolean' ? null : t.ended;
  }
  function Os(e, t) {
    if (!pr(e)) return null;
    let r = e._readableState;
    return r != null && r.errored
      ? !1
      : typeof r?.endEmitted != 'boolean'
      ? null
      : !!(r.endEmitted || (t === !1 && r.ended === !0 && r.length === 0));
  }
  function Ls(e) {
    return e && e[$n] != null
      ? e[$n]
      : typeof e?.readable != 'boolean'
      ? null
      : gr(e)
      ? !1
      : pr(e) && e.readable && !Os(e);
  }
  function xs(e) {
    return typeof e?.writable != 'boolean' ? null : gr(e) ? !1 : yr(e) && e.writable && !Ts(e);
  }
  function oy(e, t) {
    return he(e) ? (gr(e) ? !0 : !((t?.readable !== !1 && Ls(e)) || (t?.writable !== !1 && xs(e)))) : null;
  }
  function ly(e) {
    var t, r;
    return he(e)
      ? e.writableErrored
        ? e.writableErrored
        : (t = (r = e._writableState) === null || r === void 0 ? void 0 : r.errored) !== null && t !== void 0
        ? t
        : null
      : null;
  }
  function sy(e) {
    var t, r;
    return he(e)
      ? e.readableErrored
        ? e.readableErrored
        : (t = (r = e._readableState) === null || r === void 0 ? void 0 : r.errored) !== null && t !== void 0
        ? t
        : null
      : null;
  }
  function uy(e) {
    if (!he(e)) return null;
    if (typeof e.closed == 'boolean') return e.closed;
    let t = e._writableState,
      r = e._readableState;
    return typeof t?.closed == 'boolean' || typeof r?.closed == 'boolean'
      ? t?.closed || r?.closed
      : typeof e._closed == 'boolean' && Ms(e)
      ? e._closed
      : null;
  }
  function Ms(e) {
    return (
      typeof e._closed == 'boolean' &&
      typeof e._defaultKeepAlive == 'boolean' &&
      typeof e._removedConnection == 'boolean' &&
      typeof e._removedContLen == 'boolean'
    );
  }
  function vs(e) {
    return typeof e._sent100 == 'boolean' && Ms(e);
  }
  function fy(e) {
    var t;
    return (
      typeof e._consuming == 'boolean' &&
      typeof e._dumped == 'boolean' &&
      ((t = e.req) === null || t === void 0 ? void 0 : t.upgradeOrConnect) === void 0
    );
  }
  function ay(e) {
    if (!he(e)) return null;
    let t = e._writableState,
      r = e._readableState,
      n = t || r;
    return (!n && vs(e)) || !!(n && n.autoDestroy && n.emitClose && n.closed === !1);
  }
  function cy(e) {
    var t;
    return !!(e && ((t = e[Es]) !== null && t !== void 0 ? t : e.readableDidRead || e.readableAborted));
  }
  function dy(e) {
    var t, r, n, i, o, l, s, f, u, c;
    return !!(
      e &&
      ((t =
        (r =
          (n =
            (i =
              (o = (l = e[Ss]) !== null && l !== void 0 ? l : e.readableErrored) !== null && o !== void 0
                ? o
                : e.writableErrored) !== null && i !== void 0
              ? i
              : (s = e._readableState) === null || s === void 0
              ? void 0
              : s.errorEmitted) !== null && n !== void 0
            ? n
            : (f = e._writableState) === null || f === void 0
            ? void 0
            : f.errorEmitted) !== null && r !== void 0
          ? r
          : (u = e._readableState) === null || u === void 0
          ? void 0
          : u.errored) !== null && t !== void 0
        ? t
        : !((c = e._writableState) === null || c === void 0) && c.errored)
    );
  }
  Is.exports = {
    kDestroyed: ws,
    isDisturbed: cy,
    kIsDisturbed: Es,
    isErrored: dy,
    kIsErrored: Ss,
    isReadable: Ls,
    kIsReadable: $n,
    kIsClosedPromise: Zp,
    kControllerErrorFunction: Qp,
    isClosed: uy,
    isDestroyed: gr,
    isDuplexNodeStream: ey,
    isFinished: oy,
    isIterable: ry,
    isReadableNodeStream: pr,
    isReadableStream: ms,
    isReadableEnded: iy,
    isReadableFinished: Os,
    isReadableErrored: sy,
    isNodeStream: he,
    isWebStream: ty,
    isWritable: xs,
    isWritableNodeStream: yr,
    isWritableStream: Rs,
    isWritableEnded: Ts,
    isWritableFinished: ny,
    isWritableErrored: ly,
    isServerRequest: fy,
    isServerResponse: vs,
    willEmitClose: ay,
    isTransformStream: As,
  };
});
var Ae = _((pO, Kn) => {
  var We = X(),
    { AbortError: Bs, codes: hy } = z(),
    { ERR_INVALID_ARG_TYPE: by, ERR_STREAM_PREMATURE_CLOSE: Ds } = hy,
    { kEmptyObject: Gn, once: Hn } = de(),
    { validateAbortSignal: py, validateFunction: yy, validateObject: gy, validateBoolean: _y } = Bt(),
    { Promise: wy, PromisePrototypeThen: Sy } = U(),
    {
      isClosed: Ey,
      isReadable: Ns,
      isReadableNodeStream: Un,
      isReadableStream: my,
      isReadableFinished: Ps,
      isReadableErrored: qs,
      isWritable: Cs,
      isWritableNodeStream: Ws,
      isWritableStream: Ry,
      isWritableFinished: ks,
      isWritableErrored: js,
      isNodeStream: Ay,
      willEmitClose: Ty,
      kIsClosedPromise: Oy,
    } = be();
  function Ly(e) {
    return e.setHeader && typeof e.abort == 'function';
  }
  var Vn = () => {};
  function Fs(e, t, r) {
    var n, i;
    if (
      (arguments.length === 2 ? ((r = t), (t = Gn)) : t == null ? (t = Gn) : gy(t, 'options'),
      yy(r, 'callback'),
      py(t.signal, 'options.signal'),
      (r = Hn(r)),
      my(e) || Ry(e))
    )
      return xy(e, t, r);
    if (!Ay(e)) throw new by('stream', ['ReadableStream', 'WritableStream', 'Stream'], e);
    let o = (n = t.readable) !== null && n !== void 0 ? n : Un(e),
      l = (i = t.writable) !== null && i !== void 0 ? i : Ws(e),
      s = e._writableState,
      f = e._readableState,
      u = () => {
        e.writable || b();
      },
      c = Ty(e) && Un(e) === o && Ws(e) === l,
      a = ks(e, !1),
      b = () => {
        (a = !0), e.destroyed && (c = !1), !(c && (!e.readable || o)) && (!o || h) && r.call(e);
      },
      h = Ps(e, !1),
      d = () => {
        (h = !0), e.destroyed && (c = !1), !(c && (!e.writable || l)) && (!l || a) && r.call(e);
      },
      S = (m) => {
        r.call(e, m);
      },
      y = Ey(e),
      w = () => {
        y = !0;
        let m = js(e) || qs(e);
        if (m && typeof m != 'boolean') return r.call(e, m);
        if (o && !h && Un(e, !0) && !Ps(e, !1)) return r.call(e, new Ds());
        if (l && !a && !ks(e, !1)) return r.call(e, new Ds());
        r.call(e);
      },
      g = () => {
        y = !0;
        let m = js(e) || qs(e);
        if (m && typeof m != 'boolean') return r.call(e, m);
        r.call(e);
      },
      p = () => {
        e.req.on('finish', b);
      };
    Ly(e)
      ? (e.on('complete', b), c || e.on('abort', w), e.req ? p() : e.on('request', p))
      : l && !s && (e.on('end', u), e.on('close', u)),
      !c && typeof e.aborted == 'boolean' && e.on('aborted', w),
      e.on('end', d),
      e.on('finish', b),
      t.error !== !1 && e.on('error', S),
      e.on('close', w),
      y
        ? We.nextTick(w)
        : (s != null && s.errorEmitted) || (f != null && f.errorEmitted)
        ? c || We.nextTick(g)
        : ((!o && (!c || Ns(e)) && (a || Cs(e) === !1)) ||
            (!l && (!c || Cs(e)) && (h || Ns(e) === !1)) ||
            (f && e.req && e.aborted)) &&
          We.nextTick(g);
    let A = () => {
      (r = Vn),
        e.removeListener('aborted', w),
        e.removeListener('complete', b),
        e.removeListener('abort', w),
        e.removeListener('request', p),
        e.req && e.req.removeListener('finish', b),
        e.removeListener('end', u),
        e.removeListener('close', u),
        e.removeListener('finish', b),
        e.removeListener('end', d),
        e.removeListener('error', S),
        e.removeListener('close', w);
    };
    if (t.signal && !y) {
      let m = () => {
        let v = r;
        A(), v.call(e, new Bs(void 0, { cause: t.signal.reason }));
      };
      if (t.signal.aborted) We.nextTick(m);
      else {
        let v = r;
        (r = Hn((...j) => {
          t.signal.removeEventListener('abort', m), v.apply(e, j);
        })),
          t.signal.addEventListener('abort', m);
      }
    }
    return A;
  }
  function xy(e, t, r) {
    let n = !1,
      i = Vn;
    if (t.signal)
      if (
        ((i = () => {
          (n = !0), r.call(e, new Bs(void 0, { cause: t.signal.reason }));
        }),
        t.signal.aborted)
      )
        We.nextTick(i);
      else {
        let l = r;
        (r = Hn((...s) => {
          t.signal.removeEventListener('abort', i), l.apply(e, s);
        })),
          t.signal.addEventListener('abort', i);
      }
    let o = (...l) => {
      n || We.nextTick(() => r.apply(e, l));
    };
    return Sy(e[Oy].promise, o, o), Vn;
  }
  function My(e, t) {
    var r;
    let n = !1;
    return (
      t === null && (t = Gn),
      (r = t) !== null && r !== void 0 && r.cleanup && (_y(t.cleanup, 'cleanup'), (n = t.cleanup)),
      new wy((i, o) => {
        let l = Fs(e, t, (s) => {
          n && l(), s ? o(s) : i();
        });
      })
    );
  }
  Kn.exports = Fs;
  Kn.exports.finished = My;
});
var Ve = _((yO, zs) => {
  'use strict';
  var pe = X(),
    {
      aggregateTwoErrors: vy,
      codes: { ERR_MULTIPLE_CALLBACK: Iy },
      AbortError: Dy,
    } = z(),
    { Symbol: Gs } = U(),
    { kDestroyed: Ny, isDestroyed: Py, isFinished: qy, isServerRequest: Cy } = be(),
    Hs = Gs('kDestroy'),
    Yn = Gs('kConstruct');
  function Vs(e, t, r) {
    e && (e.stack, t && !t.errored && (t.errored = e), r && !r.errored && (r.errored = e));
  }
  function Wy(e, t) {
    let r = this._readableState,
      n = this._writableState,
      i = n || r;
    return (n != null && n.destroyed) || (r != null && r.destroyed)
      ? (typeof t == 'function' && t(), this)
      : (Vs(e, n, r),
        n && (n.destroyed = !0),
        r && (r.destroyed = !0),
        i.constructed
          ? $s(this, e, t)
          : this.once(Hs, function (o) {
              $s(this, vy(o, e), t);
            }),
        this);
  }
  function $s(e, t, r) {
    let n = !1;
    function i(o) {
      if (n) return;
      n = !0;
      let l = e._readableState,
        s = e._writableState;
      Vs(o, s, l),
        s && (s.closed = !0),
        l && (l.closed = !0),
        typeof r == 'function' && r(o),
        o ? pe.nextTick(ky, e, o) : pe.nextTick(Ks, e);
    }
    try {
      e._destroy(t || null, i);
    } catch (o) {
      i(o);
    }
  }
  function ky(e, t) {
    zn(e, t), Ks(e);
  }
  function Ks(e) {
    let t = e._readableState,
      r = e._writableState;
    r && (r.closeEmitted = !0),
      t && (t.closeEmitted = !0),
      ((r != null && r.emitClose) || (t != null && t.emitClose)) && e.emit('close');
  }
  function zn(e, t) {
    let r = e._readableState,
      n = e._writableState;
    (n != null && n.errorEmitted) ||
      (r != null && r.errorEmitted) ||
      (n && (n.errorEmitted = !0), r && (r.errorEmitted = !0), e.emit('error', t));
  }
  function jy() {
    let e = this._readableState,
      t = this._writableState;
    e &&
      ((e.constructed = !0),
      (e.closed = !1),
      (e.closeEmitted = !1),
      (e.destroyed = !1),
      (e.errored = null),
      (e.errorEmitted = !1),
      (e.reading = !1),
      (e.ended = e.readable === !1),
      (e.endEmitted = e.readable === !1)),
      t &&
        ((t.constructed = !0),
        (t.destroyed = !1),
        (t.closed = !1),
        (t.closeEmitted = !1),
        (t.errored = null),
        (t.errorEmitted = !1),
        (t.finalCalled = !1),
        (t.prefinished = !1),
        (t.ended = t.writable === !1),
        (t.ending = t.writable === !1),
        (t.finished = t.writable === !1));
  }
  function Jn(e, t, r) {
    let n = e._readableState,
      i = e._writableState;
    if ((i != null && i.destroyed) || (n != null && n.destroyed)) return this;
    (n != null && n.autoDestroy) || (i != null && i.autoDestroy)
      ? e.destroy(t)
      : t &&
        (t.stack,
        i && !i.errored && (i.errored = t),
        n && !n.errored && (n.errored = t),
        r ? pe.nextTick(zn, e, t) : zn(e, t));
  }
  function By(e, t) {
    if (typeof e._construct != 'function') return;
    let r = e._readableState,
      n = e._writableState;
    r && (r.constructed = !1),
      n && (n.constructed = !1),
      e.once(Yn, t),
      !(e.listenerCount(Yn) > 1) && pe.nextTick(Fy, e);
  }
  function Fy(e) {
    let t = !1;
    function r(n) {
      if (t) {
        Jn(e, n ?? new Iy());
        return;
      }
      t = !0;
      let i = e._readableState,
        o = e._writableState,
        l = o || i;
      i && (i.constructed = !0),
        o && (o.constructed = !0),
        l.destroyed ? e.emit(Hs, n) : n ? Jn(e, n, !0) : pe.nextTick($y, e);
    }
    try {
      e._construct((n) => {
        pe.nextTick(r, n);
      });
    } catch (n) {
      pe.nextTick(r, n);
    }
  }
  function $y(e) {
    e.emit(Yn);
  }
  function Us(e) {
    return e?.setHeader && typeof e.abort == 'function';
  }
  function Ys(e) {
    e.emit('close');
  }
  function Uy(e, t) {
    e.emit('error', t), pe.nextTick(Ys, e);
  }
  function Gy(e, t) {
    !e ||
      Py(e) ||
      (!t && !qy(e) && (t = new Dy()),
      Cy(e)
        ? ((e.socket = null), e.destroy(t))
        : Us(e)
        ? e.abort()
        : Us(e.req)
        ? e.req.abort()
        : typeof e.destroy == 'function'
        ? e.destroy(t)
        : typeof e.close == 'function'
        ? e.close()
        : t
        ? pe.nextTick(Uy, e, t)
        : pe.nextTick(Ys, e),
      e.destroyed || (e[Ny] = !0));
  }
  zs.exports = { construct: By, destroyer: Gy, destroy: Wy, undestroy: jy, errorOrDestroy: Jn };
});
var Sr = _((gO, Xs) => {
  'use strict';
  var { ArrayIsArray: Hy, ObjectSetPrototypeOf: Js } = U(),
    { EventEmitter: _r } = require('events');
  function wr(e) {
    _r.call(this, e);
  }
  Js(wr.prototype, _r.prototype);
  Js(wr, _r);
  wr.prototype.pipe = function (e, t) {
    let r = this;
    function n(c) {
      e.writable && e.write(c) === !1 && r.pause && r.pause();
    }
    r.on('data', n);
    function i() {
      r.readable && r.resume && r.resume();
    }
    e.on('drain', i), !e._isStdio && (!t || t.end !== !1) && (r.on('end', l), r.on('close', s));
    let o = !1;
    function l() {
      o || ((o = !0), e.end());
    }
    function s() {
      o || ((o = !0), typeof e.destroy == 'function' && e.destroy());
    }
    function f(c) {
      u(), _r.listenerCount(this, 'error') === 0 && this.emit('error', c);
    }
    Xn(r, 'error', f), Xn(e, 'error', f);
    function u() {
      r.removeListener('data', n),
        e.removeListener('drain', i),
        r.removeListener('end', l),
        r.removeListener('close', s),
        r.removeListener('error', f),
        e.removeListener('error', f),
        r.removeListener('end', u),
        r.removeListener('close', u),
        e.removeListener('close', u);
    }
    return r.on('end', u), r.on('close', u), e.on('close', u), e.emit('pipe', r), e;
  };
  function Xn(e, t, r) {
    if (typeof e.prependListener == 'function') return e.prependListener(t, r);
    !e._events || !e._events[t]
      ? e.on(t, r)
      : Hy(e._events[t])
      ? e._events[t].unshift(r)
      : (e._events[t] = [r, e._events[t]]);
  }
  Xs.exports = { Stream: wr, prependListener: Xn };
});
var Ft = _((_O, Er) => {
  'use strict';
  var { AbortError: Zs, codes: Vy } = z(),
    { isNodeStream: Qs, isWebStream: Ky, kControllerErrorFunction: Yy } = be(),
    zy = Ae(),
    { ERR_INVALID_ARG_TYPE: eu } = Vy,
    Jy = (e, t) => {
      if (typeof e != 'object' || !('aborted' in e)) throw new eu(t, 'AbortSignal', e);
    };
  Er.exports.addAbortSignal = function (t, r) {
    if ((Jy(t, 'signal'), !Qs(r) && !Ky(r))) throw new eu('stream', ['ReadableStream', 'WritableStream', 'Stream'], r);
    return Er.exports.addAbortSignalNoValidate(t, r);
  };
  Er.exports.addAbortSignalNoValidate = function (e, t) {
    if (typeof e != 'object' || !('aborted' in e)) return t;
    let r = Qs(t)
      ? () => {
          t.destroy(new Zs(void 0, { cause: e.reason }));
        }
      : () => {
          t[Yy](new Zs(void 0, { cause: e.reason }));
        };
    return e.aborted ? r() : (e.addEventListener('abort', r), zy(t, () => e.removeEventListener('abort', r))), t;
  };
});
var nu = _((SO, ru) => {
  'use strict';
  var { StringPrototypeSlice: tu, SymbolIterator: Xy, TypedArrayPrototypeSet: mr, Uint8Array: Zy } = U(),
    { Buffer: Zn } = require('buffer'),
    { inspect: Qy } = de();
  ru.exports = class {
    constructor() {
      (this.head = null), (this.tail = null), (this.length = 0);
    }
    push(t) {
      let r = { data: t, next: null };
      this.length > 0 ? (this.tail.next = r) : (this.head = r), (this.tail = r), ++this.length;
    }
    unshift(t) {
      let r = { data: t, next: this.head };
      this.length === 0 && (this.tail = r), (this.head = r), ++this.length;
    }
    shift() {
      if (this.length === 0) return;
      let t = this.head.data;
      return this.length === 1 ? (this.head = this.tail = null) : (this.head = this.head.next), --this.length, t;
    }
    clear() {
      (this.head = this.tail = null), (this.length = 0);
    }
    join(t) {
      if (this.length === 0) return '';
      let r = this.head,
        n = '' + r.data;
      for (; (r = r.next) !== null; ) n += t + r.data;
      return n;
    }
    concat(t) {
      if (this.length === 0) return Zn.alloc(0);
      let r = Zn.allocUnsafe(t >>> 0),
        n = this.head,
        i = 0;
      for (; n; ) mr(r, n.data, i), (i += n.data.length), (n = n.next);
      return r;
    }
    consume(t, r) {
      let n = this.head.data;
      if (t < n.length) {
        let i = n.slice(0, t);
        return (this.head.data = n.slice(t)), i;
      }
      return t === n.length ? this.shift() : r ? this._getString(t) : this._getBuffer(t);
    }
    first() {
      return this.head.data;
    }
    *[Xy]() {
      for (let t = this.head; t; t = t.next) yield t.data;
    }
    _getString(t) {
      let r = '',
        n = this.head,
        i = 0;
      do {
        let o = n.data;
        if (t > o.length) (r += o), (t -= o.length);
        else {
          t === o.length
            ? ((r += o), ++i, n.next ? (this.head = n.next) : (this.head = this.tail = null))
            : ((r += tu(o, 0, t)), (this.head = n), (n.data = tu(o, t)));
          break;
        }
        ++i;
      } while ((n = n.next) !== null);
      return (this.length -= i), r;
    }
    _getBuffer(t) {
      let r = Zn.allocUnsafe(t),
        n = t,
        i = this.head,
        o = 0;
      do {
        let l = i.data;
        if (t > l.length) mr(r, l, n - t), (t -= l.length);
        else {
          t === l.length
            ? (mr(r, l, n - t), ++o, i.next ? (this.head = i.next) : (this.head = this.tail = null))
            : (mr(r, new Zy(l.buffer, l.byteOffset, t), n - t), (this.head = i), (i.data = l.slice(t)));
          break;
        }
        ++o;
      } while ((i = i.next) !== null);
      return (this.length -= o), r;
    }
    [Symbol.for('nodejs.util.inspect.custom')](t, r) {
      return Qy(this, { ...r, depth: 0, customInspect: !1 });
    }
  };
});
var Rr = _((EO, ou) => {
  'use strict';
  var { MathFloor: eg, NumberIsInteger: tg } = U(),
    { ERR_INVALID_ARG_VALUE: rg } = z().codes;
  function ng(e, t, r) {
    return e.highWaterMark != null ? e.highWaterMark : t ? e[r] : null;
  }
  function iu(e) {
    return e ? 16 : 16 * 1024;
  }
  function ig(e, t, r, n) {
    let i = ng(t, n, r);
    if (i != null) {
      if (!tg(i) || i < 0) {
        let o = n ? `options.${r}` : 'options.highWaterMark';
        throw new rg(o, i);
      }
      return eg(i);
    }
    return iu(e.objectMode);
  }
  ou.exports = { getHighWaterMark: ig, getDefaultHighWaterMark: iu };
});
var Qn = _((mO, fu) => {
  'use strict';
  var lu = X(),
    { PromisePrototypeThen: og, SymbolAsyncIterator: su, SymbolIterator: uu } = U(),
    { Buffer: lg } = require('buffer'),
    { ERR_INVALID_ARG_TYPE: sg, ERR_STREAM_NULL_VALUES: ug } = z().codes;
  function fg(e, t, r) {
    let n;
    if (typeof t == 'string' || t instanceof lg)
      return new e({
        objectMode: !0,
        ...r,
        read() {
          this.push(t), this.push(null);
        },
      });
    let i;
    if (t && t[su]) (i = !0), (n = t[su]());
    else if (t && t[uu]) (i = !1), (n = t[uu]());
    else throw new sg('iterable', ['Iterable'], t);
    let o = new e({ objectMode: !0, highWaterMark: 1, ...r }),
      l = !1;
    (o._read = function () {
      l || ((l = !0), f());
    }),
      (o._destroy = function (u, c) {
        og(
          s(u),
          () => lu.nextTick(c, u),
          (a) => lu.nextTick(c, a || u)
        );
      });
    async function s(u) {
      let c = u != null,
        a = typeof n.throw == 'function';
      if (c && a) {
        let { value: b, done: h } = await n.throw(u);
        if ((await b, h)) return;
      }
      if (typeof n.return == 'function') {
        let { value: b } = await n.return();
        await b;
      }
    }
    async function f() {
      for (;;) {
        try {
          let { value: u, done: c } = i ? await n.next() : n.next();
          if (c) o.push(null);
          else {
            let a = u && typeof u.then == 'function' ? await u : u;
            if (a === null) throw ((l = !1), new ug());
            if (o.push(a)) continue;
            l = !1;
          }
        } catch (u) {
          o.destroy(u);
        }
        break;
      }
    }
    return o;
  }
  fu.exports = fg;
});
var $t = _((RO, mu) => {
  var se = X(),
    {
      ArrayPrototypeIndexOf: ag,
      NumberIsInteger: cg,
      NumberIsNaN: dg,
      NumberParseInt: hg,
      ObjectDefineProperties: du,
      ObjectKeys: bg,
      ObjectSetPrototypeOf: hu,
      Promise: pg,
      SafeSet: yg,
      SymbolAsyncIterator: gg,
      Symbol: _g,
    } = U();
  mu.exports = O;
  O.ReadableState = oi;
  var { EventEmitter: wg } = require('events'),
    { Stream: ke, prependListener: Sg } = Sr(),
    { Buffer: ei } = require('buffer'),
    { addAbortSignal: Eg } = Ft(),
    mg = Ae(),
    D = de().debuglog('stream', (e) => {
      D = e;
    }),
    Rg = nu(),
    pt = Ve(),
    { getHighWaterMark: Ag, getDefaultHighWaterMark: Tg } = Rr(),
    {
      aggregateTwoErrors: au,
      codes: {
        ERR_INVALID_ARG_TYPE: Og,
        ERR_METHOD_NOT_IMPLEMENTED: Lg,
        ERR_OUT_OF_RANGE: xg,
        ERR_STREAM_PUSH_AFTER_EOF: Mg,
        ERR_STREAM_UNSHIFT_AFTER_END_EVENT: vg,
      },
    } = z(),
    { validateObject: Ig } = Bt(),
    Ke = _g('kPaused'),
    { StringDecoder: bu } = require('string_decoder'),
    Dg = Qn();
  hu(O.prototype, ke.prototype);
  hu(O, ke);
  var ti = () => {},
    { errorOrDestroy: bt } = pt;
  function oi(e, t, r) {
    typeof r != 'boolean' && (r = t instanceof ye()),
      (this.objectMode = !!(e && e.objectMode)),
      r && (this.objectMode = this.objectMode || !!(e && e.readableObjectMode)),
      (this.highWaterMark = e ? Ag(this, e, 'readableHighWaterMark', r) : Tg(!1)),
      (this.buffer = new Rg()),
      (this.length = 0),
      (this.pipes = []),
      (this.flowing = null),
      (this.ended = !1),
      (this.endEmitted = !1),
      (this.reading = !1),
      (this.constructed = !0),
      (this.sync = !0),
      (this.needReadable = !1),
      (this.emittedReadable = !1),
      (this.readableListening = !1),
      (this.resumeScheduled = !1),
      (this[Ke] = null),
      (this.errorEmitted = !1),
      (this.emitClose = !e || e.emitClose !== !1),
      (this.autoDestroy = !e || e.autoDestroy !== !1),
      (this.destroyed = !1),
      (this.errored = null),
      (this.closed = !1),
      (this.closeEmitted = !1),
      (this.defaultEncoding = (e && e.defaultEncoding) || 'utf8'),
      (this.awaitDrainWriters = null),
      (this.multiAwaitDrain = !1),
      (this.readingMore = !1),
      (this.dataEmitted = !1),
      (this.decoder = null),
      (this.encoding = null),
      e && e.encoding && ((this.decoder = new bu(e.encoding)), (this.encoding = e.encoding));
  }
  function O(e) {
    if (!(this instanceof O)) return new O(e);
    let t = this instanceof ye();
    (this._readableState = new oi(e, this, t)),
      e &&
        (typeof e.read == 'function' && (this._read = e.read),
        typeof e.destroy == 'function' && (this._destroy = e.destroy),
        typeof e.construct == 'function' && (this._construct = e.construct),
        e.signal && !t && Eg(e.signal, this)),
      ke.call(this, e),
      pt.construct(this, () => {
        this._readableState.needReadable && Ar(this, this._readableState);
      });
  }
  O.prototype.destroy = pt.destroy;
  O.prototype._undestroy = pt.undestroy;
  O.prototype._destroy = function (e, t) {
    t(e);
  };
  O.prototype[wg.captureRejectionSymbol] = function (e) {
    this.destroy(e);
  };
  O.prototype.push = function (e, t) {
    return pu(this, e, t, !1);
  };
  O.prototype.unshift = function (e, t) {
    return pu(this, e, t, !0);
  };
  function pu(e, t, r, n) {
    D('readableAddChunk', t);
    let i = e._readableState,
      o;
    if (
      (i.objectMode ||
        (typeof t == 'string'
          ? ((r = r || i.defaultEncoding),
            i.encoding !== r &&
              (n && i.encoding ? (t = ei.from(t, r).toString(i.encoding)) : ((t = ei.from(t, r)), (r = ''))))
          : t instanceof ei
          ? (r = '')
          : ke._isUint8Array(t)
          ? ((t = ke._uint8ArrayToBuffer(t)), (r = ''))
          : t != null && (o = new Og('chunk', ['string', 'Buffer', 'Uint8Array'], t))),
      o)
    )
      bt(e, o);
    else if (t === null) (i.reading = !1), qg(e, i);
    else if (i.objectMode || (t && t.length > 0))
      if (n)
        if (i.endEmitted) bt(e, new vg());
        else {
          if (i.destroyed || i.errored) return !1;
          ri(e, i, t, !0);
        }
      else if (i.ended) bt(e, new Mg());
      else {
        if (i.destroyed || i.errored) return !1;
        (i.reading = !1),
          i.decoder && !r
            ? ((t = i.decoder.write(t)), i.objectMode || t.length !== 0 ? ri(e, i, t, !1) : Ar(e, i))
            : ri(e, i, t, !1);
      }
    else n || ((i.reading = !1), Ar(e, i));
    return !i.ended && (i.length < i.highWaterMark || i.length === 0);
  }
  function ri(e, t, r, n) {
    t.flowing && t.length === 0 && !t.sync && e.listenerCount('data') > 0
      ? (t.multiAwaitDrain ? t.awaitDrainWriters.clear() : (t.awaitDrainWriters = null),
        (t.dataEmitted = !0),
        e.emit('data', r))
      : ((t.length += t.objectMode ? 1 : r.length),
        n ? t.buffer.unshift(r) : t.buffer.push(r),
        t.needReadable && Tr(e)),
      Ar(e, t);
  }
  O.prototype.isPaused = function () {
    let e = this._readableState;
    return e[Ke] === !0 || e.flowing === !1;
  };
  O.prototype.setEncoding = function (e) {
    let t = new bu(e);
    (this._readableState.decoder = t), (this._readableState.encoding = this._readableState.decoder.encoding);
    let r = this._readableState.buffer,
      n = '';
    for (let i of r) n += t.write(i);
    return r.clear(), n !== '' && r.push(n), (this._readableState.length = n.length), this;
  };
  var Ng = 1073741824;
  function Pg(e) {
    if (e > Ng) throw new xg('size', '<= 1GiB', e);
    return e--, (e |= e >>> 1), (e |= e >>> 2), (e |= e >>> 4), (e |= e >>> 8), (e |= e >>> 16), e++, e;
  }
  function cu(e, t) {
    return e <= 0 || (t.length === 0 && t.ended)
      ? 0
      : t.objectMode
      ? 1
      : dg(e)
      ? t.flowing && t.length
        ? t.buffer.first().length
        : t.length
      : e <= t.length
      ? e
      : t.ended
      ? t.length
      : 0;
  }
  O.prototype.read = function (e) {
    D('read', e), e === void 0 ? (e = NaN) : cg(e) || (e = hg(e, 10));
    let t = this._readableState,
      r = e;
    if (
      (e > t.highWaterMark && (t.highWaterMark = Pg(e)),
      e !== 0 && (t.emittedReadable = !1),
      e === 0 && t.needReadable && ((t.highWaterMark !== 0 ? t.length >= t.highWaterMark : t.length > 0) || t.ended))
    )
      return D('read: emitReadable', t.length, t.ended), t.length === 0 && t.ended ? ni(this) : Tr(this), null;
    if (((e = cu(e, t)), e === 0 && t.ended)) return t.length === 0 && ni(this), null;
    let n = t.needReadable;
    if (
      (D('need readable', n),
      (t.length === 0 || t.length - e < t.highWaterMark) && ((n = !0), D('length less than watermark', n)),
      t.ended || t.reading || t.destroyed || t.errored || !t.constructed)
    )
      (n = !1), D('reading, ended or constructing', n);
    else if (n) {
      D('do read'), (t.reading = !0), (t.sync = !0), t.length === 0 && (t.needReadable = !0);
      try {
        this._read(t.highWaterMark);
      } catch (o) {
        bt(this, o);
      }
      (t.sync = !1), t.reading || (e = cu(r, t));
    }
    let i;
    return (
      e > 0 ? (i = Su(e, t)) : (i = null),
      i === null
        ? ((t.needReadable = t.length <= t.highWaterMark), (e = 0))
        : ((t.length -= e), t.multiAwaitDrain ? t.awaitDrainWriters.clear() : (t.awaitDrainWriters = null)),
      t.length === 0 && (t.ended || (t.needReadable = !0), r !== e && t.ended && ni(this)),
      i !== null && !t.errorEmitted && !t.closeEmitted && ((t.dataEmitted = !0), this.emit('data', i)),
      i
    );
  };
  function qg(e, t) {
    if ((D('onEofChunk'), !t.ended)) {
      if (t.decoder) {
        let r = t.decoder.end();
        r && r.length && (t.buffer.push(r), (t.length += t.objectMode ? 1 : r.length));
      }
      (t.ended = !0), t.sync ? Tr(e) : ((t.needReadable = !1), (t.emittedReadable = !0), yu(e));
    }
  }
  function Tr(e) {
    let t = e._readableState;
    D('emitReadable', t.needReadable, t.emittedReadable),
      (t.needReadable = !1),
      t.emittedReadable || (D('emitReadable', t.flowing), (t.emittedReadable = !0), se.nextTick(yu, e));
  }
  function yu(e) {
    let t = e._readableState;
    D('emitReadable_', t.destroyed, t.length, t.ended),
      !t.destroyed && !t.errored && (t.length || t.ended) && (e.emit('readable'), (t.emittedReadable = !1)),
      (t.needReadable = !t.flowing && !t.ended && t.length <= t.highWaterMark),
      _u(e);
  }
  function Ar(e, t) {
    !t.readingMore && t.constructed && ((t.readingMore = !0), se.nextTick(Cg, e, t));
  }
  function Cg(e, t) {
    for (; !t.reading && !t.ended && (t.length < t.highWaterMark || (t.flowing && t.length === 0)); ) {
      let r = t.length;
      if ((D('maybeReadMore read 0'), e.read(0), r === t.length)) break;
    }
    t.readingMore = !1;
  }
  O.prototype._read = function (e) {
    throw new Lg('_read()');
  };
  O.prototype.pipe = function (e, t) {
    let r = this,
      n = this._readableState;
    n.pipes.length === 1 &&
      (n.multiAwaitDrain ||
        ((n.multiAwaitDrain = !0), (n.awaitDrainWriters = new yg(n.awaitDrainWriters ? [n.awaitDrainWriters] : [])))),
      n.pipes.push(e),
      D('pipe count=%d opts=%j', n.pipes.length, t);
    let o = (!t || t.end !== !1) && e !== se.stdout && e !== se.stderr ? s : y;
    n.endEmitted ? se.nextTick(o) : r.once('end', o), e.on('unpipe', l);
    function l(w, g) {
      D('onunpipe'), w === r && g && g.hasUnpiped === !1 && ((g.hasUnpiped = !0), c());
    }
    function s() {
      D('onend'), e.end();
    }
    let f,
      u = !1;
    function c() {
      D('cleanup'),
        e.removeListener('close', d),
        e.removeListener('finish', S),
        f && e.removeListener('drain', f),
        e.removeListener('error', h),
        e.removeListener('unpipe', l),
        r.removeListener('end', s),
        r.removeListener('end', y),
        r.removeListener('data', b),
        (u = !0),
        f && n.awaitDrainWriters && (!e._writableState || e._writableState.needDrain) && f();
    }
    function a() {
      u ||
        (n.pipes.length === 1 && n.pipes[0] === e
          ? (D('false write response, pause', 0), (n.awaitDrainWriters = e), (n.multiAwaitDrain = !1))
          : n.pipes.length > 1 &&
            n.pipes.includes(e) &&
            (D('false write response, pause', n.awaitDrainWriters.size), n.awaitDrainWriters.add(e)),
        r.pause()),
        f || ((f = Wg(r, e)), e.on('drain', f));
    }
    r.on('data', b);
    function b(w) {
      D('ondata');
      let g = e.write(w);
      D('dest.write', g), g === !1 && a();
    }
    function h(w) {
      if ((D('onerror', w), y(), e.removeListener('error', h), e.listenerCount('error') === 0)) {
        let g = e._writableState || e._readableState;
        g && !g.errorEmitted ? bt(e, w) : e.emit('error', w);
      }
    }
    Sg(e, 'error', h);
    function d() {
      e.removeListener('finish', S), y();
    }
    e.once('close', d);
    function S() {
      D('onfinish'), e.removeListener('close', d), y();
    }
    e.once('finish', S);
    function y() {
      D('unpipe'), r.unpipe(e);
    }
    return (
      e.emit('pipe', r), e.writableNeedDrain === !0 ? n.flowing && a() : n.flowing || (D('pipe resume'), r.resume()), e
    );
  };
  function Wg(e, t) {
    return function () {
      let n = e._readableState;
      n.awaitDrainWriters === t
        ? (D('pipeOnDrain', 1), (n.awaitDrainWriters = null))
        : n.multiAwaitDrain && (D('pipeOnDrain', n.awaitDrainWriters.size), n.awaitDrainWriters.delete(t)),
        (!n.awaitDrainWriters || n.awaitDrainWriters.size === 0) && e.listenerCount('data') && e.resume();
    };
  }
  O.prototype.unpipe = function (e) {
    let t = this._readableState,
      r = { hasUnpiped: !1 };
    if (t.pipes.length === 0) return this;
    if (!e) {
      let i = t.pipes;
      (t.pipes = []), this.pause();
      for (let o = 0; o < i.length; o++) i[o].emit('unpipe', this, { hasUnpiped: !1 });
      return this;
    }
    let n = ag(t.pipes, e);
    return n === -1
      ? this
      : (t.pipes.splice(n, 1), t.pipes.length === 0 && this.pause(), e.emit('unpipe', this, r), this);
  };
  O.prototype.on = function (e, t) {
    let r = ke.prototype.on.call(this, e, t),
      n = this._readableState;
    return (
      e === 'data'
        ? ((n.readableListening = this.listenerCount('readable') > 0), n.flowing !== !1 && this.resume())
        : e === 'readable' &&
          !n.endEmitted &&
          !n.readableListening &&
          ((n.readableListening = n.needReadable = !0),
          (n.flowing = !1),
          (n.emittedReadable = !1),
          D('on readable', n.length, n.reading),
          n.length ? Tr(this) : n.reading || se.nextTick(kg, this)),
      r
    );
  };
  O.prototype.addListener = O.prototype.on;
  O.prototype.removeListener = function (e, t) {
    let r = ke.prototype.removeListener.call(this, e, t);
    return e === 'readable' && se.nextTick(gu, this), r;
  };
  O.prototype.off = O.prototype.removeListener;
  O.prototype.removeAllListeners = function (e) {
    let t = ke.prototype.removeAllListeners.apply(this, arguments);
    return (e === 'readable' || e === void 0) && se.nextTick(gu, this), t;
  };
  function gu(e) {
    let t = e._readableState;
    (t.readableListening = e.listenerCount('readable') > 0),
      t.resumeScheduled && t[Ke] === !1
        ? (t.flowing = !0)
        : e.listenerCount('data') > 0
        ? e.resume()
        : t.readableListening || (t.flowing = null);
  }
  function kg(e) {
    D('readable nexttick read 0'), e.read(0);
  }
  O.prototype.resume = function () {
    let e = this._readableState;
    return e.flowing || (D('resume'), (e.flowing = !e.readableListening), jg(this, e)), (e[Ke] = !1), this;
  };
  function jg(e, t) {
    t.resumeScheduled || ((t.resumeScheduled = !0), se.nextTick(Bg, e, t));
  }
  function Bg(e, t) {
    D('resume', t.reading),
      t.reading || e.read(0),
      (t.resumeScheduled = !1),
      e.emit('resume'),
      _u(e),
      t.flowing && !t.reading && e.read(0);
  }
  O.prototype.pause = function () {
    return (
      D('call pause flowing=%j', this._readableState.flowing),
      this._readableState.flowing !== !1 && (D('pause'), (this._readableState.flowing = !1), this.emit('pause')),
      (this._readableState[Ke] = !0),
      this
    );
  };
  function _u(e) {
    let t = e._readableState;
    for (D('flow', t.flowing); t.flowing && e.read() !== null; );
  }
  O.prototype.wrap = function (e) {
    let t = !1;
    e.on('data', (n) => {
      !this.push(n) && e.pause && ((t = !0), e.pause());
    }),
      e.on('end', () => {
        this.push(null);
      }),
      e.on('error', (n) => {
        bt(this, n);
      }),
      e.on('close', () => {
        this.destroy();
      }),
      e.on('destroy', () => {
        this.destroy();
      }),
      (this._read = () => {
        t && e.resume && ((t = !1), e.resume());
      });
    let r = bg(e);
    for (let n = 1; n < r.length; n++) {
      let i = r[n];
      this[i] === void 0 && typeof e[i] == 'function' && (this[i] = e[i].bind(e));
    }
    return this;
  };
  O.prototype[gg] = function () {
    return wu(this);
  };
  O.prototype.iterator = function (e) {
    return e !== void 0 && Ig(e, 'options'), wu(this, e);
  };
  function wu(e, t) {
    typeof e.read != 'function' && (e = O.wrap(e, { objectMode: !0 }));
    let r = Fg(e, t);
    return (r.stream = e), r;
  }
  async function* Fg(e, t) {
    let r = ti;
    function n(l) {
      this === e ? (r(), (r = ti)) : (r = l);
    }
    e.on('readable', n);
    let i,
      o = mg(e, { writable: !1 }, (l) => {
        (i = l ? au(i, l) : null), r(), (r = ti);
      });
    try {
      for (;;) {
        let l = e.destroyed ? null : e.read();
        if (l !== null) yield l;
        else {
          if (i) throw i;
          if (i === null) return;
          await new pg(n);
        }
      }
    } catch (l) {
      throw ((i = au(i, l)), i);
    } finally {
      (i || t?.destroyOnReturn !== !1) && (i === void 0 || e._readableState.autoDestroy)
        ? pt.destroyer(e, null)
        : (e.off('readable', n), o());
    }
  }
  du(O.prototype, {
    readable: {
      __proto__: null,
      get() {
        let e = this._readableState;
        return !!e && e.readable !== !1 && !e.destroyed && !e.errorEmitted && !e.endEmitted;
      },
      set(e) {
        this._readableState && (this._readableState.readable = !!e);
      },
    },
    readableDidRead: {
      __proto__: null,
      enumerable: !1,
      get: function () {
        return this._readableState.dataEmitted;
      },
    },
    readableAborted: {
      __proto__: null,
      enumerable: !1,
      get: function () {
        return !!(
          this._readableState.readable !== !1 &&
          (this._readableState.destroyed || this._readableState.errored) &&
          !this._readableState.endEmitted
        );
      },
    },
    readableHighWaterMark: {
      __proto__: null,
      enumerable: !1,
      get: function () {
        return this._readableState.highWaterMark;
      },
    },
    readableBuffer: {
      __proto__: null,
      enumerable: !1,
      get: function () {
        return this._readableState && this._readableState.buffer;
      },
    },
    readableFlowing: {
      __proto__: null,
      enumerable: !1,
      get: function () {
        return this._readableState.flowing;
      },
      set: function (e) {
        this._readableState && (this._readableState.flowing = e);
      },
    },
    readableLength: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._readableState.length;
      },
    },
    readableObjectMode: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._readableState ? this._readableState.objectMode : !1;
      },
    },
    readableEncoding: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._readableState ? this._readableState.encoding : null;
      },
    },
    errored: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._readableState ? this._readableState.errored : null;
      },
    },
    closed: {
      __proto__: null,
      get() {
        return this._readableState ? this._readableState.closed : !1;
      },
    },
    destroyed: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._readableState ? this._readableState.destroyed : !1;
      },
      set(e) {
        this._readableState && (this._readableState.destroyed = e);
      },
    },
    readableEnded: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._readableState ? this._readableState.endEmitted : !1;
      },
    },
  });
  du(oi.prototype, {
    pipesCount: {
      __proto__: null,
      get() {
        return this.pipes.length;
      },
    },
    paused: {
      __proto__: null,
      get() {
        return this[Ke] !== !1;
      },
      set(e) {
        this[Ke] = !!e;
      },
    },
  });
  O._fromList = Su;
  function Su(e, t) {
    if (t.length === 0) return null;
    let r;
    return (
      t.objectMode
        ? (r = t.buffer.shift())
        : !e || e >= t.length
        ? (t.decoder
            ? (r = t.buffer.join(''))
            : t.buffer.length === 1
            ? (r = t.buffer.first())
            : (r = t.buffer.concat(t.length)),
          t.buffer.clear())
        : (r = t.buffer.consume(e, t.decoder)),
      r
    );
  }
  function ni(e) {
    let t = e._readableState;
    D('endReadable', t.endEmitted), t.endEmitted || ((t.ended = !0), se.nextTick($g, t, e));
  }
  function $g(e, t) {
    if (
      (D('endReadableNT', e.endEmitted, e.length), !e.errored && !e.closeEmitted && !e.endEmitted && e.length === 0)
    ) {
      if (((e.endEmitted = !0), t.emit('end'), t.writable && t.allowHalfOpen === !1)) se.nextTick(Ug, t);
      else if (e.autoDestroy) {
        let r = t._writableState;
        (!r || (r.autoDestroy && (r.finished || r.writable === !1))) && t.destroy();
      }
    }
  }
  function Ug(e) {
    e.writable && !e.writableEnded && !e.destroyed && e.end();
  }
  O.from = function (e, t) {
    return Dg(O, e, t);
  };
  var ii;
  function Eu() {
    return ii === void 0 && (ii = {}), ii;
  }
  O.fromWeb = function (e, t) {
    return Eu().newStreamReadableFromReadableStream(e, t);
  };
  O.toWeb = function (e, t) {
    return Eu().newReadableStreamFromStreamReadable(e, t);
  };
  O.wrap = function (e, t) {
    var r, n;
    return new O({
      objectMode:
        (r = (n = e.readableObjectMode) !== null && n !== void 0 ? n : e.objectMode) !== null && r !== void 0 ? r : !0,
      ...t,
      destroy(i, o) {
        pt.destroyer(e, i), o(i);
      },
    }).wrap(e);
  };
});
var di = _((AO, Pu) => {
  var Ye = X(),
    {
      ArrayPrototypeSlice: Tu,
      Error: Gg,
      FunctionPrototypeSymbolHasInstance: Ou,
      ObjectDefineProperty: Lu,
      ObjectDefineProperties: Hg,
      ObjectSetPrototypeOf: xu,
      StringPrototypeToLowerCase: Vg,
      Symbol: Kg,
      SymbolHasInstance: Yg,
    } = U();
  Pu.exports = W;
  W.WritableState = Ht;
  var { EventEmitter: zg } = require('events'),
    Ut = Sr().Stream,
    { Buffer: Or } = require('buffer'),
    Mr = Ve(),
    { addAbortSignal: Jg } = Ft(),
    { getHighWaterMark: Xg, getDefaultHighWaterMark: Zg } = Rr(),
    {
      ERR_INVALID_ARG_TYPE: Qg,
      ERR_METHOD_NOT_IMPLEMENTED: e_,
      ERR_MULTIPLE_CALLBACK: Mu,
      ERR_STREAM_CANNOT_PIPE: t_,
      ERR_STREAM_DESTROYED: Gt,
      ERR_STREAM_ALREADY_FINISHED: r_,
      ERR_STREAM_NULL_VALUES: n_,
      ERR_STREAM_WRITE_AFTER_END: i_,
      ERR_UNKNOWN_ENCODING: vu,
    } = z().codes,
    { errorOrDestroy: yt } = Mr;
  xu(W.prototype, Ut.prototype);
  xu(W, Ut);
  function ui() {}
  var gt = Kg('kOnFinished');
  function Ht(e, t, r) {
    typeof r != 'boolean' && (r = t instanceof ye()),
      (this.objectMode = !!(e && e.objectMode)),
      r && (this.objectMode = this.objectMode || !!(e && e.writableObjectMode)),
      (this.highWaterMark = e ? Xg(this, e, 'writableHighWaterMark', r) : Zg(!1)),
      (this.finalCalled = !1),
      (this.needDrain = !1),
      (this.ending = !1),
      (this.ended = !1),
      (this.finished = !1),
      (this.destroyed = !1);
    let n = !!(e && e.decodeStrings === !1);
    (this.decodeStrings = !n),
      (this.defaultEncoding = (e && e.defaultEncoding) || 'utf8'),
      (this.length = 0),
      (this.writing = !1),
      (this.corked = 0),
      (this.sync = !0),
      (this.bufferProcessing = !1),
      (this.onwrite = l_.bind(void 0, t)),
      (this.writecb = null),
      (this.writelen = 0),
      (this.afterWriteTickInfo = null),
      xr(this),
      (this.pendingcb = 0),
      (this.constructed = !0),
      (this.prefinished = !1),
      (this.errorEmitted = !1),
      (this.emitClose = !e || e.emitClose !== !1),
      (this.autoDestroy = !e || e.autoDestroy !== !1),
      (this.errored = null),
      (this.closed = !1),
      (this.closeEmitted = !1),
      (this[gt] = []);
  }
  function xr(e) {
    (e.buffered = []), (e.bufferedIndex = 0), (e.allBuffers = !0), (e.allNoop = !0);
  }
  Ht.prototype.getBuffer = function () {
    return Tu(this.buffered, this.bufferedIndex);
  };
  Lu(Ht.prototype, 'bufferedRequestCount', {
    __proto__: null,
    get() {
      return this.buffered.length - this.bufferedIndex;
    },
  });
  function W(e) {
    let t = this instanceof ye();
    if (!t && !Ou(W, this)) return new W(e);
    (this._writableState = new Ht(e, this, t)),
      e &&
        (typeof e.write == 'function' && (this._write = e.write),
        typeof e.writev == 'function' && (this._writev = e.writev),
        typeof e.destroy == 'function' && (this._destroy = e.destroy),
        typeof e.final == 'function' && (this._final = e.final),
        typeof e.construct == 'function' && (this._construct = e.construct),
        e.signal && Jg(e.signal, this)),
      Ut.call(this, e),
      Mr.construct(this, () => {
        let r = this._writableState;
        r.writing || ai(this, r), ci(this, r);
      });
  }
  Lu(W, Yg, {
    __proto__: null,
    value: function (e) {
      return Ou(this, e) ? !0 : this !== W ? !1 : e && e._writableState instanceof Ht;
    },
  });
  W.prototype.pipe = function () {
    yt(this, new t_());
  };
  function Iu(e, t, r, n) {
    let i = e._writableState;
    if (typeof r == 'function') (n = r), (r = i.defaultEncoding);
    else {
      if (!r) r = i.defaultEncoding;
      else if (r !== 'buffer' && !Or.isEncoding(r)) throw new vu(r);
      typeof n != 'function' && (n = ui);
    }
    if (t === null) throw new n_();
    if (!i.objectMode)
      if (typeof t == 'string') i.decodeStrings !== !1 && ((t = Or.from(t, r)), (r = 'buffer'));
      else if (t instanceof Or) r = 'buffer';
      else if (Ut._isUint8Array(t)) (t = Ut._uint8ArrayToBuffer(t)), (r = 'buffer');
      else throw new Qg('chunk', ['string', 'Buffer', 'Uint8Array'], t);
    let o;
    return (
      i.ending ? (o = new i_()) : i.destroyed && (o = new Gt('write')),
      o ? (Ye.nextTick(n, o), yt(e, o, !0), o) : (i.pendingcb++, o_(e, i, t, r, n))
    );
  }
  W.prototype.write = function (e, t, r) {
    return Iu(this, e, t, r) === !0;
  };
  W.prototype.cork = function () {
    this._writableState.corked++;
  };
  W.prototype.uncork = function () {
    let e = this._writableState;
    e.corked && (e.corked--, e.writing || ai(this, e));
  };
  W.prototype.setDefaultEncoding = function (t) {
    if ((typeof t == 'string' && (t = Vg(t)), !Or.isEncoding(t))) throw new vu(t);
    return (this._writableState.defaultEncoding = t), this;
  };
  function o_(e, t, r, n, i) {
    let o = t.objectMode ? 1 : r.length;
    t.length += o;
    let l = t.length < t.highWaterMark;
    return (
      l || (t.needDrain = !0),
      t.writing || t.corked || t.errored || !t.constructed
        ? (t.buffered.push({ chunk: r, encoding: n, callback: i }),
          t.allBuffers && n !== 'buffer' && (t.allBuffers = !1),
          t.allNoop && i !== ui && (t.allNoop = !1))
        : ((t.writelen = o),
          (t.writecb = i),
          (t.writing = !0),
          (t.sync = !0),
          e._write(r, n, t.onwrite),
          (t.sync = !1)),
      l && !t.errored && !t.destroyed
    );
  }
  function Ru(e, t, r, n, i, o, l) {
    (t.writelen = n),
      (t.writecb = l),
      (t.writing = !0),
      (t.sync = !0),
      t.destroyed ? t.onwrite(new Gt('write')) : r ? e._writev(i, t.onwrite) : e._write(i, o, t.onwrite),
      (t.sync = !1);
  }
  function Au(e, t, r, n) {
    --t.pendingcb, n(r), fi(t), yt(e, r);
  }
  function l_(e, t) {
    let r = e._writableState,
      n = r.sync,
      i = r.writecb;
    if (typeof i != 'function') {
      yt(e, new Mu());
      return;
    }
    (r.writing = !1),
      (r.writecb = null),
      (r.length -= r.writelen),
      (r.writelen = 0),
      t
        ? (t.stack,
          r.errored || (r.errored = t),
          e._readableState && !e._readableState.errored && (e._readableState.errored = t),
          n ? Ye.nextTick(Au, e, r, t, i) : Au(e, r, t, i))
        : (r.buffered.length > r.bufferedIndex && ai(e, r),
          n
            ? r.afterWriteTickInfo !== null && r.afterWriteTickInfo.cb === i
              ? r.afterWriteTickInfo.count++
              : ((r.afterWriteTickInfo = { count: 1, cb: i, stream: e, state: r }),
                Ye.nextTick(s_, r.afterWriteTickInfo))
            : Du(e, r, 1, i));
  }
  function s_({ stream: e, state: t, count: r, cb: n }) {
    return (t.afterWriteTickInfo = null), Du(e, t, r, n);
  }
  function Du(e, t, r, n) {
    for (!t.ending && !e.destroyed && t.length === 0 && t.needDrain && ((t.needDrain = !1), e.emit('drain')); r-- > 0; )
      t.pendingcb--, n();
    t.destroyed && fi(t), ci(e, t);
  }
  function fi(e) {
    if (e.writing) return;
    for (let i = e.bufferedIndex; i < e.buffered.length; ++i) {
      var t;
      let { chunk: o, callback: l } = e.buffered[i],
        s = e.objectMode ? 1 : o.length;
      (e.length -= s), l((t = e.errored) !== null && t !== void 0 ? t : new Gt('write'));
    }
    let r = e[gt].splice(0);
    for (let i = 0; i < r.length; i++) {
      var n;
      r[i]((n = e.errored) !== null && n !== void 0 ? n : new Gt('end'));
    }
    xr(e);
  }
  function ai(e, t) {
    if (t.corked || t.bufferProcessing || t.destroyed || !t.constructed) return;
    let { buffered: r, bufferedIndex: n, objectMode: i } = t,
      o = r.length - n;
    if (!o) return;
    let l = n;
    if (((t.bufferProcessing = !0), o > 1 && e._writev)) {
      t.pendingcb -= o - 1;
      let s = t.allNoop
          ? ui
          : (u) => {
              for (let c = l; c < r.length; ++c) r[c].callback(u);
            },
        f = t.allNoop && l === 0 ? r : Tu(r, l);
      (f.allBuffers = t.allBuffers), Ru(e, t, !0, t.length, f, '', s), xr(t);
    } else {
      do {
        let { chunk: s, encoding: f, callback: u } = r[l];
        r[l++] = null;
        let c = i ? 1 : s.length;
        Ru(e, t, !1, c, s, f, u);
      } while (l < r.length && !t.writing);
      l === r.length ? xr(t) : l > 256 ? (r.splice(0, l), (t.bufferedIndex = 0)) : (t.bufferedIndex = l);
    }
    t.bufferProcessing = !1;
  }
  W.prototype._write = function (e, t, r) {
    if (this._writev) this._writev([{ chunk: e, encoding: t }], r);
    else throw new e_('_write()');
  };
  W.prototype._writev = null;
  W.prototype.end = function (e, t, r) {
    let n = this._writableState;
    typeof e == 'function' ? ((r = e), (e = null), (t = null)) : typeof t == 'function' && ((r = t), (t = null));
    let i;
    if (e != null) {
      let o = Iu(this, e, t);
      o instanceof Gg && (i = o);
    }
    return (
      n.corked && ((n.corked = 1), this.uncork()),
      i ||
        (!n.errored && !n.ending
          ? ((n.ending = !0), ci(this, n, !0), (n.ended = !0))
          : n.finished
          ? (i = new r_('end'))
          : n.destroyed && (i = new Gt('end'))),
      typeof r == 'function' && (i || n.finished ? Ye.nextTick(r, i) : n[gt].push(r)),
      this
    );
  };
  function Lr(e) {
    return (
      e.ending &&
      !e.destroyed &&
      e.constructed &&
      e.length === 0 &&
      !e.errored &&
      e.buffered.length === 0 &&
      !e.finished &&
      !e.writing &&
      !e.errorEmitted &&
      !e.closeEmitted
    );
  }
  function u_(e, t) {
    let r = !1;
    function n(i) {
      if (r) {
        yt(e, i ?? Mu());
        return;
      }
      if (((r = !0), t.pendingcb--, i)) {
        let o = t[gt].splice(0);
        for (let l = 0; l < o.length; l++) o[l](i);
        yt(e, i, t.sync);
      } else Lr(t) && ((t.prefinished = !0), e.emit('prefinish'), t.pendingcb++, Ye.nextTick(si, e, t));
    }
    (t.sync = !0), t.pendingcb++;
    try {
      e._final(n);
    } catch (i) {
      n(i);
    }
    t.sync = !1;
  }
  function f_(e, t) {
    !t.prefinished &&
      !t.finalCalled &&
      (typeof e._final == 'function' && !t.destroyed
        ? ((t.finalCalled = !0), u_(e, t))
        : ((t.prefinished = !0), e.emit('prefinish')));
  }
  function ci(e, t, r) {
    Lr(t) &&
      (f_(e, t),
      t.pendingcb === 0 &&
        (r
          ? (t.pendingcb++,
            Ye.nextTick(
              (n, i) => {
                Lr(i) ? si(n, i) : i.pendingcb--;
              },
              e,
              t
            ))
          : Lr(t) && (t.pendingcb++, si(e, t))));
  }
  function si(e, t) {
    t.pendingcb--, (t.finished = !0);
    let r = t[gt].splice(0);
    for (let n = 0; n < r.length; n++) r[n]();
    if ((e.emit('finish'), t.autoDestroy)) {
      let n = e._readableState;
      (!n || (n.autoDestroy && (n.endEmitted || n.readable === !1))) && e.destroy();
    }
  }
  Hg(W.prototype, {
    closed: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.closed : !1;
      },
    },
    destroyed: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.destroyed : !1;
      },
      set(e) {
        this._writableState && (this._writableState.destroyed = e);
      },
    },
    writable: {
      __proto__: null,
      get() {
        let e = this._writableState;
        return !!e && e.writable !== !1 && !e.destroyed && !e.errored && !e.ending && !e.ended;
      },
      set(e) {
        this._writableState && (this._writableState.writable = !!e);
      },
    },
    writableFinished: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.finished : !1;
      },
    },
    writableObjectMode: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.objectMode : !1;
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
        return this._writableState ? this._writableState.ending : !1;
      },
    },
    writableNeedDrain: {
      __proto__: null,
      get() {
        let e = this._writableState;
        return e ? !e.destroyed && !e.ending && e.needDrain : !1;
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
      enumerable: !1,
      get() {
        return this._writableState ? this._writableState.errored : null;
      },
    },
    writableAborted: {
      __proto__: null,
      enumerable: !1,
      get: function () {
        return !!(
          this._writableState.writable !== !1 &&
          (this._writableState.destroyed || this._writableState.errored) &&
          !this._writableState.finished
        );
      },
    },
  });
  var a_ = Mr.destroy;
  W.prototype.destroy = function (e, t) {
    let r = this._writableState;
    return (
      !r.destroyed && (r.bufferedIndex < r.buffered.length || r[gt].length) && Ye.nextTick(fi, r),
      a_.call(this, e, t),
      this
    );
  };
  W.prototype._undestroy = Mr.undestroy;
  W.prototype._destroy = function (e, t) {
    t(e);
  };
  W.prototype[zg.captureRejectionSymbol] = function (e) {
    this.destroy(e);
  };
  var li;
  function Nu() {
    return li === void 0 && (li = {}), li;
  }
  W.fromWeb = function (e, t) {
    return Nu().newStreamWritableFromWritableStream(e, t);
  };
  W.toWeb = function (e) {
    return Nu().newWritableStreamFromStreamWritable(e);
  };
});
var Vu = _((TO, Hu) => {
  var hi = X(),
    c_ = require('buffer'),
    {
      isReadable: d_,
      isWritable: h_,
      isIterable: qu,
      isNodeStream: b_,
      isReadableNodeStream: Cu,
      isWritableNodeStream: Wu,
      isDuplexNodeStream: p_,
    } = be(),
    ku = Ae(),
    {
      AbortError: Gu,
      codes: { ERR_INVALID_ARG_TYPE: y_, ERR_INVALID_RETURN_VALUE: ju },
    } = z(),
    { destroyer: _t } = Ve(),
    g_ = ye(),
    __ = $t(),
    { createDeferredPromise: Bu } = de(),
    Fu = Qn(),
    $u = globalThis.Blob || c_.Blob,
    w_ =
      typeof $u < 'u'
        ? function (t) {
            return t instanceof $u;
          }
        : function (t) {
            return !1;
          },
    S_ = globalThis.AbortController || Ue().AbortController,
    { FunctionPrototypeCall: Uu } = U(),
    ze = class extends g_ {
      constructor(t) {
        super(t),
          t?.readable === !1 &&
            ((this._readableState.readable = !1),
            (this._readableState.ended = !0),
            (this._readableState.endEmitted = !0)),
          t?.writable === !1 &&
            ((this._writableState.writable = !1),
            (this._writableState.ending = !0),
            (this._writableState.ended = !0),
            (this._writableState.finished = !0));
      }
    };
  Hu.exports = function e(t, r) {
    if (p_(t)) return t;
    if (Cu(t)) return vr({ readable: t });
    if (Wu(t)) return vr({ writable: t });
    if (b_(t)) return vr({ writable: !1, readable: !1 });
    if (typeof t == 'function') {
      let { value: i, write: o, final: l, destroy: s } = E_(t);
      if (qu(i)) return Fu(ze, i, { objectMode: !0, write: o, final: l, destroy: s });
      let f = i?.then;
      if (typeof f == 'function') {
        let u,
          c = Uu(
            f,
            i,
            (a) => {
              if (a != null) throw new ju('nully', 'body', a);
            },
            (a) => {
              _t(u, a);
            }
          );
        return (u = new ze({
          objectMode: !0,
          readable: !1,
          write: o,
          final(a) {
            l(async () => {
              try {
                await c, hi.nextTick(a, null);
              } catch (b) {
                hi.nextTick(a, b);
              }
            });
          },
          destroy: s,
        }));
      }
      throw new ju('Iterable, AsyncIterable or AsyncFunction', r, i);
    }
    if (w_(t)) return e(t.arrayBuffer());
    if (qu(t)) return Fu(ze, t, { objectMode: !0, writable: !1 });
    if (typeof t?.writable == 'object' || typeof t?.readable == 'object') {
      let i = t != null && t.readable ? (Cu(t?.readable) ? t?.readable : e(t.readable)) : void 0,
        o = t != null && t.writable ? (Wu(t?.writable) ? t?.writable : e(t.writable)) : void 0;
      return vr({ readable: i, writable: o });
    }
    let n = t?.then;
    if (typeof n == 'function') {
      let i;
      return (
        Uu(
          n,
          t,
          (o) => {
            o != null && i.push(o), i.push(null);
          },
          (o) => {
            _t(i, o);
          }
        ),
        (i = new ze({ objectMode: !0, writable: !1, read() {} }))
      );
    }
    throw new y_(
      r,
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
      t
    );
  };
  function E_(e) {
    let { promise: t, resolve: r } = Bu(),
      n = new S_(),
      i = n.signal;
    return {
      value: e(
        (async function* () {
          for (;;) {
            let l = t;
            t = null;
            let { chunk: s, done: f, cb: u } = await l;
            if ((hi.nextTick(u), f)) return;
            if (i.aborted) throw new Gu(void 0, { cause: i.reason });
            ({ promise: t, resolve: r } = Bu()), yield s;
          }
        })(),
        { signal: i }
      ),
      write(l, s, f) {
        let u = r;
        (r = null), u({ chunk: l, done: !1, cb: f });
      },
      final(l) {
        let s = r;
        (r = null), s({ done: !0, cb: l });
      },
      destroy(l, s) {
        n.abort(), s(l);
      },
    };
  }
  function vr(e) {
    let t = e.readable && typeof e.readable.read != 'function' ? __.wrap(e.readable) : e.readable,
      r = e.writable,
      n = !!d_(t),
      i = !!h_(r),
      o,
      l,
      s,
      f,
      u;
    function c(a) {
      let b = f;
      (f = null), b ? b(a) : a && u.destroy(a);
    }
    return (
      (u = new ze({
        readableObjectMode: !!(t != null && t.readableObjectMode),
        writableObjectMode: !!(r != null && r.writableObjectMode),
        readable: n,
        writable: i,
      })),
      i &&
        (ku(r, (a) => {
          (i = !1), a && _t(t, a), c(a);
        }),
        (u._write = function (a, b, h) {
          r.write(a, b) ? h() : (o = h);
        }),
        (u._final = function (a) {
          r.end(), (l = a);
        }),
        r.on('drain', function () {
          if (o) {
            let a = o;
            (o = null), a();
          }
        }),
        r.on('finish', function () {
          if (l) {
            let a = l;
            (l = null), a();
          }
        })),
      n &&
        (ku(t, (a) => {
          (n = !1), a && _t(t, a), c(a);
        }),
        t.on('readable', function () {
          if (s) {
            let a = s;
            (s = null), a();
          }
        }),
        t.on('end', function () {
          u.push(null);
        }),
        (u._read = function () {
          for (;;) {
            let a = t.read();
            if (a === null) {
              s = u._read;
              return;
            }
            if (!u.push(a)) return;
          }
        })),
      (u._destroy = function (a, b) {
        !a && f !== null && (a = new Gu()),
          (s = null),
          (o = null),
          (l = null),
          f === null ? b(a) : ((f = b), _t(r, a), _t(t, a));
      }),
      u
    );
  }
});
var ye = _((OO, zu) => {
  'use strict';
  var {
    ObjectDefineProperties: m_,
    ObjectGetOwnPropertyDescriptor: Te,
    ObjectKeys: R_,
    ObjectSetPrototypeOf: Ku,
  } = U();
  zu.exports = ue;
  var yi = $t(),
    ne = di();
  Ku(ue.prototype, yi.prototype);
  Ku(ue, yi);
  {
    let e = R_(ne.prototype);
    for (let t = 0; t < e.length; t++) {
      let r = e[t];
      ue.prototype[r] || (ue.prototype[r] = ne.prototype[r]);
    }
  }
  function ue(e) {
    if (!(this instanceof ue)) return new ue(e);
    yi.call(this, e),
      ne.call(this, e),
      e
        ? ((this.allowHalfOpen = e.allowHalfOpen !== !1),
          e.readable === !1 &&
            ((this._readableState.readable = !1),
            (this._readableState.ended = !0),
            (this._readableState.endEmitted = !0)),
          e.writable === !1 &&
            ((this._writableState.writable = !1),
            (this._writableState.ending = !0),
            (this._writableState.ended = !0),
            (this._writableState.finished = !0)))
        : (this.allowHalfOpen = !0);
  }
  m_(ue.prototype, {
    writable: { __proto__: null, ...Te(ne.prototype, 'writable') },
    writableHighWaterMark: { __proto__: null, ...Te(ne.prototype, 'writableHighWaterMark') },
    writableObjectMode: { __proto__: null, ...Te(ne.prototype, 'writableObjectMode') },
    writableBuffer: { __proto__: null, ...Te(ne.prototype, 'writableBuffer') },
    writableLength: { __proto__: null, ...Te(ne.prototype, 'writableLength') },
    writableFinished: { __proto__: null, ...Te(ne.prototype, 'writableFinished') },
    writableCorked: { __proto__: null, ...Te(ne.prototype, 'writableCorked') },
    writableEnded: { __proto__: null, ...Te(ne.prototype, 'writableEnded') },
    writableNeedDrain: { __proto__: null, ...Te(ne.prototype, 'writableNeedDrain') },
    destroyed: {
      __proto__: null,
      get() {
        return this._readableState === void 0 || this._writableState === void 0
          ? !1
          : this._readableState.destroyed && this._writableState.destroyed;
      },
      set(e) {
        this._readableState &&
          this._writableState &&
          ((this._readableState.destroyed = e), (this._writableState.destroyed = e));
      },
    },
  });
  var bi;
  function Yu() {
    return bi === void 0 && (bi = {}), bi;
  }
  ue.fromWeb = function (e, t) {
    return Yu().newStreamDuplexFromReadableWritablePair(e, t);
  };
  ue.toWeb = function (e) {
    return Yu().newReadableWritablePairFromDuplex(e);
  };
  var pi;
  ue.from = function (e) {
    return pi || (pi = Vu()), pi(e, 'body');
  };
});
var wi = _((LO, Xu) => {
  'use strict';
  var { ObjectSetPrototypeOf: Ju, Symbol: A_ } = U();
  Xu.exports = Oe;
  var { ERR_METHOD_NOT_IMPLEMENTED: T_ } = z().codes,
    _i = ye(),
    { getHighWaterMark: O_ } = Rr();
  Ju(Oe.prototype, _i.prototype);
  Ju(Oe, _i);
  var Vt = A_('kCallback');
  function Oe(e) {
    if (!(this instanceof Oe)) return new Oe(e);
    let t = e ? O_(this, e, 'readableHighWaterMark', !0) : null;
    t === 0 &&
      (e = {
        ...e,
        highWaterMark: null,
        readableHighWaterMark: t,
        writableHighWaterMark: e.writableHighWaterMark || 0,
      }),
      _i.call(this, e),
      (this._readableState.sync = !1),
      (this[Vt] = null),
      e &&
        (typeof e.transform == 'function' && (this._transform = e.transform),
        typeof e.flush == 'function' && (this._flush = e.flush)),
      this.on('prefinish', L_);
  }
  function gi(e) {
    typeof this._flush == 'function' && !this.destroyed
      ? this._flush((t, r) => {
          if (t) {
            e ? e(t) : this.destroy(t);
            return;
          }
          r != null && this.push(r), this.push(null), e && e();
        })
      : (this.push(null), e && e());
  }
  function L_() {
    this._final !== gi && gi.call(this);
  }
  Oe.prototype._final = gi;
  Oe.prototype._transform = function (e, t, r) {
    throw new T_('_transform()');
  };
  Oe.prototype._write = function (e, t, r) {
    let n = this._readableState,
      i = this._writableState,
      o = n.length;
    this._transform(e, t, (l, s) => {
      if (l) {
        r(l);
        return;
      }
      s != null && this.push(s), i.ended || o === n.length || n.length < n.highWaterMark ? r() : (this[Vt] = r);
    });
  };
  Oe.prototype._read = function () {
    if (this[Vt]) {
      let e = this[Vt];
      (this[Vt] = null), e();
    }
  };
});
var Ei = _((xO, Qu) => {
  'use strict';
  var { ObjectSetPrototypeOf: Zu } = U();
  Qu.exports = wt;
  var Si = wi();
  Zu(wt.prototype, Si.prototype);
  Zu(wt, Si);
  function wt(e) {
    if (!(this instanceof wt)) return new wt(e);
    Si.call(this, e);
  }
  wt.prototype._transform = function (e, t, r) {
    r(null, e);
  };
});
var Pr = _((MO, of) => {
  var Kt = X(),
    { ArrayIsArray: x_, Promise: M_, SymbolAsyncIterator: v_ } = U(),
    Nr = Ae(),
    { once: I_ } = de(),
    D_ = Ve(),
    ef = ye(),
    {
      aggregateTwoErrors: N_,
      codes: {
        ERR_INVALID_ARG_TYPE: Mi,
        ERR_INVALID_RETURN_VALUE: mi,
        ERR_MISSING_ARGS: P_,
        ERR_STREAM_DESTROYED: q_,
        ERR_STREAM_PREMATURE_CLOSE: C_,
      },
      AbortError: W_,
    } = z(),
    { validateFunction: k_, validateAbortSignal: j_ } = Bt(),
    {
      isIterable: Je,
      isReadable: Ri,
      isReadableNodeStream: Dr,
      isNodeStream: tf,
      isTransformStream: St,
      isWebStream: B_,
      isReadableStream: Ai,
      isReadableEnded: F_,
    } = be(),
    $_ = globalThis.AbortController || Ue().AbortController,
    Ti,
    Oi;
  function rf(e, t, r) {
    let n = !1;
    e.on('close', () => {
      n = !0;
    });
    let i = Nr(e, { readable: t, writable: r }, (o) => {
      n = !o;
    });
    return {
      destroy: (o) => {
        n || ((n = !0), D_.destroyer(e, o || new q_('pipe')));
      },
      cleanup: i,
    };
  }
  function U_(e) {
    return k_(e[e.length - 1], 'streams[stream.length - 1]'), e.pop();
  }
  function Li(e) {
    if (Je(e)) return e;
    if (Dr(e)) return G_(e);
    throw new Mi('val', ['Readable', 'Iterable', 'AsyncIterable'], e);
  }
  async function* G_(e) {
    Oi || (Oi = $t()), yield* Oi.prototype[v_].call(e);
  }
  async function Ir(e, t, r, { end: n }) {
    let i,
      o = null,
      l = (u) => {
        if ((u && (i = u), o)) {
          let c = o;
          (o = null), c();
        }
      },
      s = () =>
        new M_((u, c) => {
          i
            ? c(i)
            : (o = () => {
                i ? c(i) : u();
              });
        });
    t.on('drain', l);
    let f = Nr(t, { readable: !1 }, l);
    try {
      t.writableNeedDrain && (await s());
      for await (let u of e) t.write(u) || (await s());
      n && t.end(), await s(), r();
    } catch (u) {
      r(i !== u ? N_(i, u) : u);
    } finally {
      f(), t.off('drain', l);
    }
  }
  async function xi(e, t, r, { end: n }) {
    St(t) && (t = t.writable);
    let i = t.getWriter();
    try {
      for await (let o of e) await i.ready, i.write(o).catch(() => {});
      await i.ready, n && (await i.close()), r();
    } catch (o) {
      try {
        await i.abort(o), r(o);
      } catch (l) {
        r(l);
      }
    }
  }
  function H_(...e) {
    return nf(e, I_(U_(e)));
  }
  function nf(e, t, r) {
    if ((e.length === 1 && x_(e[0]) && (e = e[0]), e.length < 2)) throw new P_('streams');
    let n = new $_(),
      i = n.signal,
      o = r?.signal,
      l = [];
    j_(o, 'options.signal');
    function s() {
      h(new W_());
    }
    o?.addEventListener('abort', s);
    let f,
      u,
      c = [],
      a = 0;
    function b(g) {
      h(g, --a === 0);
    }
    function h(g, p) {
      if ((g && (!f || f.code === 'ERR_STREAM_PREMATURE_CLOSE') && (f = g), !(!f && !p))) {
        for (; c.length; ) c.shift()(f);
        o?.removeEventListener('abort', s), n.abort(), p && (f || l.forEach((A) => A()), Kt.nextTick(t, f, u));
      }
    }
    let d;
    for (let g = 0; g < e.length; g++) {
      let p = e[g],
        A = g < e.length - 1,
        m = g > 0,
        v = A || r?.end !== !1,
        j = g === e.length - 1;
      if (tf(p)) {
        let I = function (P) {
          P && P.name !== 'AbortError' && P.code !== 'ERR_STREAM_PREMATURE_CLOSE' && b(P);
        };
        var w = I;
        if (v) {
          let { destroy: P, cleanup: ee } = rf(p, A, m);
          c.push(P), Ri(p) && j && l.push(ee);
        }
        p.on('error', I),
          Ri(p) &&
            j &&
            l.push(() => {
              p.removeListener('error', I);
            });
      }
      if (g === 0)
        if (typeof p == 'function') {
          if (((d = p({ signal: i })), !Je(d))) throw new mi('Iterable, AsyncIterable or Stream', 'source', d);
        } else Je(p) || Dr(p) || St(p) ? (d = p) : (d = ef.from(p));
      else if (typeof p == 'function') {
        if (St(d)) {
          var S;
          d = Li((S = d) === null || S === void 0 ? void 0 : S.readable);
        } else d = Li(d);
        if (((d = p(d, { signal: i })), A)) {
          if (!Je(d, !0)) throw new mi('AsyncIterable', `transform[${g - 1}]`, d);
        } else {
          var y;
          Ti || (Ti = Ei());
          let I = new Ti({ objectMode: !0 }),
            P = (y = d) === null || y === void 0 ? void 0 : y.then;
          if (typeof P == 'function')
            a++,
              P.call(
                d,
                (C) => {
                  (u = C), C != null && I.write(C), v && I.end(), Kt.nextTick(b);
                },
                (C) => {
                  I.destroy(C), Kt.nextTick(b, C);
                }
              );
          else if (Je(d, !0)) a++, Ir(d, I, b, { end: v });
          else if (Ai(d) || St(d)) {
            let C = d.readable || d;
            a++, Ir(C, I, b, { end: v });
          } else throw new mi('AsyncIterable or Promise', 'destination', d);
          d = I;
          let { destroy: ee, cleanup: te } = rf(d, !1, !0);
          c.push(ee), j && l.push(te);
        }
      } else if (tf(p)) {
        if (Dr(d)) {
          a += 2;
          let I = V_(d, p, b, { end: v });
          Ri(p) && j && l.push(I);
        } else if (St(d) || Ai(d)) {
          let I = d.readable || d;
          a++, Ir(I, p, b, { end: v });
        } else if (Je(d)) a++, Ir(d, p, b, { end: v });
        else throw new Mi('val', ['Readable', 'Iterable', 'AsyncIterable', 'ReadableStream', 'TransformStream'], d);
        d = p;
      } else if (B_(p)) {
        if (Dr(d)) a++, xi(Li(d), p, b, { end: v });
        else if (Ai(d) || Je(d)) a++, xi(d, p, b, { end: v });
        else if (St(d)) a++, xi(d.readable, p, b, { end: v });
        else throw new Mi('val', ['Readable', 'Iterable', 'AsyncIterable', 'ReadableStream', 'TransformStream'], d);
        d = p;
      } else d = ef.from(p);
    }
    return ((i != null && i.aborted) || (o != null && o.aborted)) && Kt.nextTick(s), d;
  }
  function V_(e, t, r, { end: n }) {
    let i = !1;
    if (
      (t.on('close', () => {
        i || r(new C_());
      }),
      e.pipe(t, { end: !1 }),
      n)
    ) {
      let l = function () {
        (i = !0), t.end();
      };
      var o = l;
      F_(e) ? Kt.nextTick(l) : e.once('end', l);
    } else r();
    return (
      Nr(e, { readable: !0, writable: !1 }, (l) => {
        let s = e._readableState;
        l && l.code === 'ERR_STREAM_PREMATURE_CLOSE' && s && s.ended && !s.errored && !s.errorEmitted
          ? e.once('end', r).once('error', r)
          : r(l);
      }),
      Nr(t, { readable: !1, writable: !0 }, r)
    );
  }
  of.exports = { pipelineImpl: nf, pipeline: H_ };
});
var Ii = _((vO, cf) => {
  'use strict';
  var { pipeline: K_ } = Pr(),
    qr = ye(),
    { destroyer: Y_ } = Ve(),
    {
      isNodeStream: Cr,
      isReadable: lf,
      isWritable: sf,
      isWebStream: vi,
      isTransformStream: Xe,
      isWritableStream: uf,
      isReadableStream: ff,
    } = be(),
    {
      AbortError: z_,
      codes: { ERR_INVALID_ARG_VALUE: af, ERR_MISSING_ARGS: J_ },
    } = z(),
    X_ = Ae();
  cf.exports = function (...t) {
    if (t.length === 0) throw new J_('streams');
    if (t.length === 1) return qr.from(t[0]);
    let r = [...t];
    if ((typeof t[0] == 'function' && (t[0] = qr.from(t[0])), typeof t[t.length - 1] == 'function')) {
      let h = t.length - 1;
      t[h] = qr.from(t[h]);
    }
    for (let h = 0; h < t.length; ++h)
      if (!(!Cr(t[h]) && !vi(t[h]))) {
        if (h < t.length - 1 && !(lf(t[h]) || ff(t[h]) || Xe(t[h])))
          throw new af(`streams[${h}]`, r[h], 'must be readable');
        if (h > 0 && !(sf(t[h]) || uf(t[h]) || Xe(t[h]))) throw new af(`streams[${h}]`, r[h], 'must be writable');
      }
    let n, i, o, l, s;
    function f(h) {
      let d = l;
      (l = null), d ? d(h) : h ? s.destroy(h) : !b && !a && s.destroy();
    }
    let u = t[0],
      c = K_(t, f),
      a = !!(sf(u) || uf(u) || Xe(u)),
      b = !!(lf(c) || ff(c) || Xe(c));
    if (
      ((s = new qr({
        writableObjectMode: !!(u != null && u.writableObjectMode),
        readableObjectMode: !!(c != null && c.writableObjectMode),
        writable: a,
        readable: b,
      })),
      a)
    ) {
      if (Cr(u))
        (s._write = function (d, S, y) {
          u.write(d, S) ? y() : (n = y);
        }),
          (s._final = function (d) {
            u.end(), (i = d);
          }),
          u.on('drain', function () {
            if (n) {
              let d = n;
              (n = null), d();
            }
          });
      else if (vi(u)) {
        let S = (Xe(u) ? u.writable : u).getWriter();
        (s._write = async function (y, w, g) {
          try {
            await S.ready, S.write(y).catch(() => {}), g();
          } catch (p) {
            g(p);
          }
        }),
          (s._final = async function (y) {
            try {
              await S.ready, S.close().catch(() => {}), (i = y);
            } catch (w) {
              y(w);
            }
          });
      }
      let h = Xe(c) ? c.readable : c;
      X_(h, () => {
        if (i) {
          let d = i;
          (i = null), d();
        }
      });
    }
    if (b) {
      if (Cr(c))
        c.on('readable', function () {
          if (o) {
            let h = o;
            (o = null), h();
          }
        }),
          c.on('end', function () {
            s.push(null);
          }),
          (s._read = function () {
            for (;;) {
              let h = c.read();
              if (h === null) {
                o = s._read;
                return;
              }
              if (!s.push(h)) return;
            }
          });
      else if (vi(c)) {
        let d = (Xe(c) ? c.readable : c).getReader();
        s._read = async function () {
          for (;;)
            try {
              let { value: S, done: y } = await d.read();
              if (!s.push(S)) return;
              if (y) {
                s.push(null);
                return;
              }
            } catch {
              return;
            }
        };
      }
    }
    return (
      (s._destroy = function (h, d) {
        !h && l !== null && (h = new z_()),
          (o = null),
          (n = null),
          (i = null),
          l === null ? d(h) : ((l = d), Cr(c) && Y_(c, h));
      }),
      s
    );
  };
});
var wf = _((IO, Pi) => {
  'use strict';
  var pf = globalThis.AbortController || Ue().AbortController,
    {
      codes: { ERR_INVALID_ARG_VALUE: Z_, ERR_INVALID_ARG_TYPE: Yt, ERR_MISSING_ARGS: Q_, ERR_OUT_OF_RANGE: ew },
      AbortError: ge,
    } = z(),
    { validateAbortSignal: Ze, validateInteger: tw, validateObject: Qe } = Bt(),
    rw = U().Symbol('kWeak'),
    { finished: nw } = Ae(),
    iw = Ii(),
    { addAbortSignalNoValidate: ow } = Ft(),
    { isWritable: lw, isNodeStream: sw } = be(),
    {
      ArrayPrototypePush: uw,
      MathFloor: fw,
      Number: aw,
      NumberIsNaN: cw,
      Promise: df,
      PromiseReject: hf,
      PromisePrototypeThen: dw,
      Symbol: yf,
    } = U(),
    Wr = yf('kEmpty'),
    bf = yf('kEof');
  function hw(e, t) {
    if ((t != null && Qe(t, 'options'), t?.signal != null && Ze(t.signal, 'options.signal'), sw(e) && !lw(e)))
      throw new Z_('stream', e, 'must be writable');
    let r = iw(this, e);
    return t != null && t.signal && ow(t.signal, r), r;
  }
  function kr(e, t) {
    if (typeof e != 'function') throw new Yt('fn', ['Function', 'AsyncFunction'], e);
    t != null && Qe(t, 'options'), t?.signal != null && Ze(t.signal, 'options.signal');
    let r = 1;
    return (
      t?.concurrency != null && (r = fw(t.concurrency)),
      tw(r, 'concurrency', 1),
      async function* () {
        var i, o;
        let l = new pf(),
          s = this,
          f = [],
          u = l.signal,
          c = { signal: u },
          a = () => l.abort();
        t != null && (i = t.signal) !== null && i !== void 0 && i.aborted && a(),
          t == null || (o = t.signal) === null || o === void 0 || o.addEventListener('abort', a);
        let b,
          h,
          d = !1;
        function S() {
          d = !0;
        }
        async function y() {
          try {
            for await (let p of s) {
              var w;
              if (d) return;
              if (u.aborted) throw new ge();
              try {
                p = e(p, c);
              } catch (A) {
                p = hf(A);
              }
              p !== Wr &&
                (typeof ((w = p) === null || w === void 0 ? void 0 : w.catch) == 'function' && p.catch(S),
                f.push(p),
                b && (b(), (b = null)),
                !d &&
                  f.length &&
                  f.length >= r &&
                  (await new df((A) => {
                    h = A;
                  })));
            }
            f.push(bf);
          } catch (p) {
            let A = hf(p);
            dw(A, void 0, S), f.push(A);
          } finally {
            var g;
            (d = !0),
              b && (b(), (b = null)),
              t == null || (g = t.signal) === null || g === void 0 || g.removeEventListener('abort', a);
          }
        }
        y();
        try {
          for (;;) {
            for (; f.length > 0; ) {
              let w = await f[0];
              if (w === bf) return;
              if (u.aborted) throw new ge();
              w !== Wr && (yield w), f.shift(), h && (h(), (h = null));
            }
            await new df((w) => {
              b = w;
            });
          }
        } finally {
          l.abort(), (d = !0), h && (h(), (h = null));
        }
      }.call(this)
    );
  }
  function bw(e = void 0) {
    return (
      e != null && Qe(e, 'options'),
      e?.signal != null && Ze(e.signal, 'options.signal'),
      async function* () {
        let r = 0;
        for await (let i of this) {
          var n;
          if (e != null && (n = e.signal) !== null && n !== void 0 && n.aborted)
            throw new ge({ cause: e.signal.reason });
          yield [r++, i];
        }
      }.call(this)
    );
  }
  async function gf(e, t = void 0) {
    for await (let r of Ni.call(this, e, t)) return !0;
    return !1;
  }
  async function pw(e, t = void 0) {
    if (typeof e != 'function') throw new Yt('fn', ['Function', 'AsyncFunction'], e);
    return !(await gf.call(this, async (...r) => !(await e(...r)), t));
  }
  async function yw(e, t) {
    for await (let r of Ni.call(this, e, t)) return r;
  }
  async function gw(e, t) {
    if (typeof e != 'function') throw new Yt('fn', ['Function', 'AsyncFunction'], e);
    async function r(n, i) {
      return await e(n, i), Wr;
    }
    for await (let n of kr.call(this, r, t));
  }
  function Ni(e, t) {
    if (typeof e != 'function') throw new Yt('fn', ['Function', 'AsyncFunction'], e);
    async function r(n, i) {
      return (await e(n, i)) ? n : Wr;
    }
    return kr.call(this, r, t);
  }
  var Di = class extends Q_ {
    constructor() {
      super('reduce'), (this.message = 'Reduce of an empty stream requires an initial value');
    }
  };
  async function _w(e, t, r) {
    var n;
    if (typeof e != 'function') throw new Yt('reducer', ['Function', 'AsyncFunction'], e);
    r != null && Qe(r, 'options'), r?.signal != null && Ze(r.signal, 'options.signal');
    let i = arguments.length > 1;
    if (r != null && (n = r.signal) !== null && n !== void 0 && n.aborted) {
      let u = new ge(void 0, { cause: r.signal.reason });
      throw (this.once('error', () => {}), await nw(this.destroy(u)), u);
    }
    let o = new pf(),
      l = o.signal;
    if (r != null && r.signal) {
      let u = { once: !0, [rw]: this };
      r.signal.addEventListener('abort', () => o.abort(), u);
    }
    let s = !1;
    try {
      for await (let u of this) {
        var f;
        if (((s = !0), r != null && (f = r.signal) !== null && f !== void 0 && f.aborted)) throw new ge();
        i ? (t = await e(t, u, { signal: l })) : ((t = u), (i = !0));
      }
      if (!s && !i) throw new Di();
    } finally {
      o.abort();
    }
    return t;
  }
  async function ww(e) {
    e != null && Qe(e, 'options'), e?.signal != null && Ze(e.signal, 'options.signal');
    let t = [];
    for await (let n of this) {
      var r;
      if (e != null && (r = e.signal) !== null && r !== void 0 && r.aborted)
        throw new ge(void 0, { cause: e.signal.reason });
      uw(t, n);
    }
    return t;
  }
  function Sw(e, t) {
    let r = kr.call(this, e, t);
    return async function* () {
      for await (let i of r) yield* i;
    }.call(this);
  }
  function _f(e) {
    if (((e = aw(e)), cw(e))) return 0;
    if (e < 0) throw new ew('number', '>= 0', e);
    return e;
  }
  function Ew(e, t = void 0) {
    return (
      t != null && Qe(t, 'options'),
      t?.signal != null && Ze(t.signal, 'options.signal'),
      (e = _f(e)),
      async function* () {
        var n;
        if (t != null && (n = t.signal) !== null && n !== void 0 && n.aborted) throw new ge();
        for await (let o of this) {
          var i;
          if (t != null && (i = t.signal) !== null && i !== void 0 && i.aborted) throw new ge();
          e-- <= 0 && (yield o);
        }
      }.call(this)
    );
  }
  function mw(e, t = void 0) {
    return (
      t != null && Qe(t, 'options'),
      t?.signal != null && Ze(t.signal, 'options.signal'),
      (e = _f(e)),
      async function* () {
        var n;
        if (t != null && (n = t.signal) !== null && n !== void 0 && n.aborted) throw new ge();
        for await (let o of this) {
          var i;
          if (t != null && (i = t.signal) !== null && i !== void 0 && i.aborted) throw new ge();
          if (e-- > 0) yield o;
          else return;
        }
      }.call(this)
    );
  }
  Pi.exports.streamReturningOperators = {
    asIndexedPairs: bw,
    drop: Ew,
    filter: Ni,
    flatMap: Sw,
    map: kr,
    take: mw,
    compose: hw,
  };
  Pi.exports.promiseReturningOperators = { every: pw, forEach: gw, reduce: _w, toArray: ww, some: gf, find: yw };
});
var qi = _((DO, Sf) => {
  'use strict';
  var { ArrayPrototypePop: Rw, Promise: Aw } = U(),
    { isIterable: Tw, isNodeStream: Ow, isWebStream: Lw } = be(),
    { pipelineImpl: xw } = Pr(),
    { finished: Mw } = Ae();
  require('stream');
  function vw(...e) {
    return new Aw((t, r) => {
      let n,
        i,
        o = e[e.length - 1];
      if (o && typeof o == 'object' && !Ow(o) && !Tw(o) && !Lw(o)) {
        let l = Rw(e);
        (n = l.signal), (i = l.end);
      }
      xw(
        e,
        (l, s) => {
          l ? r(l) : t(s);
        },
        { signal: n, end: i }
      );
    });
  }
  Sf.exports = { finished: Mw, pipeline: vw };
});
var vf = _((NO, Mf) => {
  var { Buffer: Iw } = require('buffer'),
    { ObjectDefineProperty: Le, ObjectKeys: Rf, ReflectApply: Af } = U(),
    {
      promisify: { custom: Tf },
    } = de(),
    { streamReturningOperators: Ef, promiseReturningOperators: mf } = wf(),
    {
      codes: { ERR_ILLEGAL_CONSTRUCTOR: Of },
    } = z(),
    Dw = Ii(),
    { pipeline: Lf } = Pr(),
    { destroyer: Nw } = Ve(),
    xf = Ae(),
    Ci = qi(),
    Wi = be(),
    B = (Mf.exports = Sr().Stream);
  B.isDisturbed = Wi.isDisturbed;
  B.isErrored = Wi.isErrored;
  B.isReadable = Wi.isReadable;
  B.Readable = $t();
  for (let e of Rf(Ef)) {
    let r = function (...n) {
      if (new.target) throw Of();
      return B.Readable.from(Af(t, this, n));
    };
    ki = r;
    let t = Ef[e];
    Le(r, 'name', { __proto__: null, value: t.name }),
      Le(r, 'length', { __proto__: null, value: t.length }),
      Le(B.Readable.prototype, e, { __proto__: null, value: r, enumerable: !1, configurable: !0, writable: !0 });
  }
  var ki;
  for (let e of Rf(mf)) {
    let r = function (...i) {
      if (new.target) throw Of();
      return Af(t, this, i);
    };
    ki = r;
    let t = mf[e];
    Le(r, 'name', { __proto__: null, value: t.name }),
      Le(r, 'length', { __proto__: null, value: t.length }),
      Le(B.Readable.prototype, e, { __proto__: null, value: r, enumerable: !1, configurable: !0, writable: !0 });
  }
  var ki;
  B.Writable = di();
  B.Duplex = ye();
  B.Transform = wi();
  B.PassThrough = Ei();
  B.pipeline = Lf;
  var { addAbortSignal: Pw } = Ft();
  B.addAbortSignal = Pw;
  B.finished = xf;
  B.destroy = Nw;
  B.compose = Dw;
  Le(B, 'promises', {
    __proto__: null,
    configurable: !0,
    enumerable: !0,
    get() {
      return Ci;
    },
  });
  Le(Lf, Tf, {
    __proto__: null,
    enumerable: !0,
    get() {
      return Ci.pipeline;
    },
  });
  Le(xf, Tf, {
    __proto__: null,
    enumerable: !0,
    get() {
      return Ci.finished;
    },
  });
  B.Stream = B;
  B._isUint8Array = function (t) {
    return t instanceof Uint8Array;
  };
  B._uint8ArrayToBuffer = function (t) {
    return Iw.from(t.buffer, t.byteOffset, t.byteLength);
  };
});
var If = _((PO, x) => {
  'use strict';
  var H = require('stream');
  if (H && process.env.READABLE_STREAM === 'disable') {
    let e = H.promises;
    (x.exports._uint8ArrayToBuffer = H._uint8ArrayToBuffer),
      (x.exports._isUint8Array = H._isUint8Array),
      (x.exports.isDisturbed = H.isDisturbed),
      (x.exports.isErrored = H.isErrored),
      (x.exports.isReadable = H.isReadable),
      (x.exports.Readable = H.Readable),
      (x.exports.Writable = H.Writable),
      (x.exports.Duplex = H.Duplex),
      (x.exports.Transform = H.Transform),
      (x.exports.PassThrough = H.PassThrough),
      (x.exports.addAbortSignal = H.addAbortSignal),
      (x.exports.finished = H.finished),
      (x.exports.destroy = H.destroy),
      (x.exports.pipeline = H.pipeline),
      (x.exports.compose = H.compose),
      Object.defineProperty(H, 'promises', {
        configurable: !0,
        enumerable: !0,
        get() {
          return e;
        },
      }),
      (x.exports.Stream = H.Stream);
  } else {
    let e = vf(),
      t = qi(),
      r = e.Readable.destroy;
    (x.exports = e.Readable),
      (x.exports._uint8ArrayToBuffer = e._uint8ArrayToBuffer),
      (x.exports._isUint8Array = e._isUint8Array),
      (x.exports.isDisturbed = e.isDisturbed),
      (x.exports.isErrored = e.isErrored),
      (x.exports.isReadable = e.isReadable),
      (x.exports.Readable = e.Readable),
      (x.exports.Writable = e.Writable),
      (x.exports.Duplex = e.Duplex),
      (x.exports.Transform = e.Transform),
      (x.exports.PassThrough = e.PassThrough),
      (x.exports.addAbortSignal = e.addAbortSignal),
      (x.exports.finished = e.finished),
      (x.exports.destroy = e.destroy),
      (x.exports.destroy = r),
      (x.exports.pipeline = e.pipeline),
      (x.exports.compose = e.compose),
      Object.defineProperty(e, 'promises', {
        configurable: !0,
        enumerable: !0,
        get() {
          return t;
        },
      }),
      (x.exports.Stream = e.Stream);
  }
  x.exports.default = x.exports;
});
var qf = _((qO, Pf) => {
  'use strict';
  var { Transform: qw } = require('stream'),
    { StringDecoder: Cw } = require('string_decoder'),
    je = Symbol('last'),
    jr = Symbol('decoder');
  function Ww(e, t, r) {
    let n;
    if (this.overflow) {
      if (((n = this[jr].write(e).split(this.matcher)), n.length === 1)) return r();
      n.shift(), (this.overflow = !1);
    } else (this[je] += this[jr].write(e)), (n = this[je].split(this.matcher));
    this[je] = n.pop();
    for (let i = 0; i < n.length; i++)
      try {
        Nf(this, this.mapper(n[i]));
      } catch (o) {
        return r(o);
      }
    if (((this.overflow = this[je].length > this.maxLength), this.overflow && !this.skipOverflow)) {
      r(new Error('maximum buffer reached'));
      return;
    }
    r();
  }
  function kw(e) {
    if (((this[je] += this[jr].end()), this[je]))
      try {
        Nf(this, this.mapper(this[je]));
      } catch (t) {
        return e(t);
      }
    e();
  }
  function Nf(e, t) {
    t !== void 0 && e.push(t);
  }
  function Df(e) {
    return e;
  }
  function jw(e, t, r) {
    switch (((e = e || /\r?\n/), (t = t || Df), (r = r || {}), arguments.length)) {
      case 1:
        typeof e == 'function'
          ? ((t = e), (e = /\r?\n/))
          : typeof e == 'object' && !(e instanceof RegExp) && !e[Symbol.split] && ((r = e), (e = /\r?\n/));
        break;
      case 2:
        typeof e == 'function' ? ((r = t), (t = e), (e = /\r?\n/)) : typeof t == 'object' && ((r = t), (t = Df));
    }
    (r = Object.assign({}, r)), (r.autoDestroy = !0), (r.transform = Ww), (r.flush = kw), (r.readableObjectMode = !0);
    let n = new qw(r);
    return (
      (n[je] = ''),
      (n[jr] = new Cw('utf8')),
      (n.matcher = e),
      (n.mapper = t),
      (n.maxLength = r.maxLength),
      (n.skipOverflow = r.skipOverflow || !1),
      (n.overflow = !1),
      (n._destroy = function (i, o) {
        (this._writableState.errorEmitted = !1), o(i);
      }),
      n
    );
  }
  Pf.exports = jw;
});
var G = _((CO, Cf) => {
  'use strict';
  Cf.exports = {
    ArrayIsArray(e) {
      return Array.isArray(e);
    },
    ArrayPrototypeIncludes(e, t) {
      return e.includes(t);
    },
    ArrayPrototypeIndexOf(e, t) {
      return e.indexOf(t);
    },
    ArrayPrototypeJoin(e, t) {
      return e.join(t);
    },
    ArrayPrototypeMap(e, t) {
      return e.map(t);
    },
    ArrayPrototypePop(e, t) {
      return e.pop(t);
    },
    ArrayPrototypePush(e, t) {
      return e.push(t);
    },
    ArrayPrototypeSlice(e, t, r) {
      return e.slice(t, r);
    },
    Error,
    FunctionPrototypeCall(e, t, ...r) {
      return e.call(t, ...r);
    },
    FunctionPrototypeSymbolHasInstance(e, t) {
      return Function.prototype[Symbol.hasInstance].call(e, t);
    },
    MathFloor: Math.floor,
    Number,
    NumberIsInteger: Number.isInteger,
    NumberIsNaN: Number.isNaN,
    NumberMAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
    NumberMIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
    NumberParseInt: Number.parseInt,
    ObjectDefineProperties(e, t) {
      return Object.defineProperties(e, t);
    },
    ObjectDefineProperty(e, t, r) {
      return Object.defineProperty(e, t, r);
    },
    ObjectGetOwnPropertyDescriptor(e, t) {
      return Object.getOwnPropertyDescriptor(e, t);
    },
    ObjectKeys(e) {
      return Object.keys(e);
    },
    ObjectSetPrototypeOf(e, t) {
      return Object.setPrototypeOf(e, t);
    },
    Promise,
    PromisePrototypeCatch(e, t) {
      return e.catch(t);
    },
    PromisePrototypeThen(e, t, r) {
      return e.then(t, r);
    },
    PromiseReject(e) {
      return Promise.reject(e);
    },
    ReflectApply: Reflect.apply,
    RegExpPrototypeTest(e, t) {
      return e.test(t);
    },
    SafeSet: Set,
    String,
    StringPrototypeSlice(e, t, r) {
      return e.slice(t, r);
    },
    StringPrototypeToLowerCase(e) {
      return e.toLowerCase();
    },
    StringPrototypeToUpperCase(e) {
      return e.toUpperCase();
    },
    StringPrototypeTrim(e) {
      return e.trim();
    },
    Symbol,
    SymbolFor: Symbol.for,
    SymbolAsyncIterator: Symbol.asyncIterator,
    SymbolHasInstance: Symbol.hasInstance,
    SymbolIterator: Symbol.iterator,
    TypedArrayPrototypeSet(e, t, r) {
      return e.set(t, r);
    },
    Uint8Array,
  };
});
var _e = _((WO, Bi) => {
  'use strict';
  var Bw = require('buffer'),
    Fw = Object.getPrototypeOf(async function () {}).constructor,
    Wf = globalThis.Blob || Bw.Blob,
    $w =
      typeof Wf < 'u'
        ? function (t) {
            return t instanceof Wf;
          }
        : function (t) {
            return !1;
          },
    ji = class extends Error {
      constructor(t) {
        if (!Array.isArray(t)) throw new TypeError(`Expected input to be an Array, got ${typeof t}`);
        let r = '';
        for (let n = 0; n < t.length; n++)
          r += `    ${t[n].stack}
`;
        super(r), (this.name = 'AggregateError'), (this.errors = t);
      }
    };
  Bi.exports = {
    AggregateError: ji,
    kEmptyObject: Object.freeze({}),
    once(e) {
      let t = !1;
      return function (...r) {
        t || ((t = !0), e.apply(this, r));
      };
    },
    createDeferredPromise: function () {
      let e, t;
      return {
        promise: new Promise((n, i) => {
          (e = n), (t = i);
        }),
        resolve: e,
        reject: t,
      };
    },
    promisify(e) {
      return new Promise((t, r) => {
        e((n, ...i) => (n ? r(n) : t(...i)));
      });
    },
    debuglog() {
      return function () {};
    },
    format(e, ...t) {
      return e.replace(/%([sdifj])/g, function (...[r, n]) {
        let i = t.shift();
        return n === 'f'
          ? i.toFixed(6)
          : n === 'j'
          ? JSON.stringify(i)
          : n === 's' && typeof i == 'object'
          ? `${i.constructor !== Object ? i.constructor.name : ''} {}`.trim()
          : i.toString();
      });
    },
    inspect(e) {
      switch (typeof e) {
        case 'string':
          if (e.includes("'"))
            if (e.includes('"')) {
              if (!e.includes('`') && !e.includes('${')) return `\`${e}\``;
            } else return `"${e}"`;
          return `'${e}'`;
        case 'number':
          return isNaN(e) ? 'NaN' : Object.is(e, -0) ? String(e) : e;
        case 'bigint':
          return `${String(e)}n`;
        case 'boolean':
        case 'undefined':
          return String(e);
        case 'object':
          return '{}';
      }
    },
    types: {
      isAsyncFunction(e) {
        return e instanceof Fw;
      },
      isArrayBufferView(e) {
        return ArrayBuffer.isView(e);
      },
    },
    isBlob: $w,
  };
  Bi.exports.promisify.custom = Symbol.for('nodejs.util.promisify.custom');
});
var Z = _((kO, Bf) => {
  'use strict';
  var { format: Uw, inspect: Br, AggregateError: Gw } = _e(),
    Hw = globalThis.AggregateError || Gw,
    Vw = Symbol('kIsNodeError'),
    Kw = ['string', 'function', 'number', 'object', 'Function', 'Object', 'boolean', 'bigint', 'symbol'],
    Yw = /^([A-Z][a-z0-9]*)+$/,
    zw = '__node_internal_',
    Fr = {};
  function et(e, t) {
    if (!e) throw new Fr.ERR_INTERNAL_ASSERTION(t);
  }
  function kf(e) {
    let t = '',
      r = e.length,
      n = e[0] === '-' ? 1 : 0;
    for (; r >= n + 4; r -= 3) t = `_${e.slice(r - 3, r)}${t}`;
    return `${e.slice(0, r)}${t}`;
  }
  function Jw(e, t, r) {
    if (typeof t == 'function')
      return (
        et(
          t.length <= r.length,
          `Code: ${e}; The provided arguments length (${r.length}) does not match the required ones (${t.length}).`
        ),
        t(...r)
      );
    let n = (t.match(/%[dfijoOs]/g) || []).length;
    return (
      et(
        n === r.length,
        `Code: ${e}; The provided arguments length (${r.length}) does not match the required ones (${n}).`
      ),
      r.length === 0 ? t : Uw(t, ...r)
    );
  }
  function Y(e, t, r) {
    r || (r = Error);
    class n extends r {
      constructor(...o) {
        super(Jw(e, t, o));
      }
      toString() {
        return `${this.name} [${e}]: ${this.message}`;
      }
    }
    Object.defineProperties(n.prototype, {
      name: { value: r.name, writable: !0, enumerable: !1, configurable: !0 },
      toString: {
        value() {
          return `${this.name} [${e}]: ${this.message}`;
        },
        writable: !0,
        enumerable: !1,
        configurable: !0,
      },
    }),
      (n.prototype.code = e),
      (n.prototype[Vw] = !0),
      (Fr[e] = n);
  }
  function jf(e) {
    let t = zw + e.name;
    return Object.defineProperty(e, 'name', { value: t }), e;
  }
  function Xw(e, t) {
    if (e && t && e !== t) {
      if (Array.isArray(t.errors)) return t.errors.push(e), t;
      let r = new Hw([t, e], t.message);
      return (r.code = t.code), r;
    }
    return e || t;
  }
  var Fi = class extends Error {
    constructor(t = 'The operation was aborted', r = void 0) {
      if (r !== void 0 && typeof r != 'object') throw new Fr.ERR_INVALID_ARG_TYPE('options', 'Object', r);
      super(t, r), (this.code = 'ABORT_ERR'), (this.name = 'AbortError');
    }
  };
  Y('ERR_ASSERTION', '%s', Error);
  Y(
    'ERR_INVALID_ARG_TYPE',
    (e, t, r) => {
      et(typeof e == 'string', "'name' must be a string"), Array.isArray(t) || (t = [t]);
      let n = 'The ';
      e.endsWith(' argument') ? (n += `${e} `) : (n += `"${e}" ${e.includes('.') ? 'property' : 'argument'} `),
        (n += 'must be ');
      let i = [],
        o = [],
        l = [];
      for (let f of t)
        et(typeof f == 'string', 'All expected entries have to be of type string'),
          Kw.includes(f)
            ? i.push(f.toLowerCase())
            : Yw.test(f)
            ? o.push(f)
            : (et(f !== 'object', 'The value "object" should be written as "Object"'), l.push(f));
      if (o.length > 0) {
        let f = i.indexOf('object');
        f !== -1 && (i.splice(i, f, 1), o.push('Object'));
      }
      if (i.length > 0) {
        switch (i.length) {
          case 1:
            n += `of type ${i[0]}`;
            break;
          case 2:
            n += `one of type ${i[0]} or ${i[1]}`;
            break;
          default: {
            let f = i.pop();
            n += `one of type ${i.join(', ')}, or ${f}`;
          }
        }
        (o.length > 0 || l.length > 0) && (n += ' or ');
      }
      if (o.length > 0) {
        switch (o.length) {
          case 1:
            n += `an instance of ${o[0]}`;
            break;
          case 2:
            n += `an instance of ${o[0]} or ${o[1]}`;
            break;
          default: {
            let f = o.pop();
            n += `an instance of ${o.join(', ')}, or ${f}`;
          }
        }
        l.length > 0 && (n += ' or ');
      }
      switch (l.length) {
        case 0:
          break;
        case 1:
          l[0].toLowerCase() !== l[0] && (n += 'an '), (n += `${l[0]}`);
          break;
        case 2:
          n += `one of ${l[0]} or ${l[1]}`;
          break;
        default: {
          let f = l.pop();
          n += `one of ${l.join(', ')}, or ${f}`;
        }
      }
      if (r == null) n += `. Received ${r}`;
      else if (typeof r == 'function' && r.name) n += `. Received function ${r.name}`;
      else if (typeof r == 'object') {
        var s;
        if ((s = r.constructor) !== null && s !== void 0 && s.name)
          n += `. Received an instance of ${r.constructor.name}`;
        else {
          let f = Br(r, { depth: -1 });
          n += `. Received ${f}`;
        }
      } else {
        let f = Br(r, { colors: !1 });
        f.length > 25 && (f = `${f.slice(0, 25)}...`), (n += `. Received type ${typeof r} (${f})`);
      }
      return n;
    },
    TypeError
  );
  Y(
    'ERR_INVALID_ARG_VALUE',
    (e, t, r = 'is invalid') => {
      let n = Br(t);
      return (
        n.length > 128 && (n = n.slice(0, 128) + '...'),
        `The ${e.includes('.') ? 'property' : 'argument'} '${e}' ${r}. Received ${n}`
      );
    },
    TypeError
  );
  Y(
    'ERR_INVALID_RETURN_VALUE',
    (e, t, r) => {
      var n;
      let i =
        r != null && (n = r.constructor) !== null && n !== void 0 && n.name
          ? `instance of ${r.constructor.name}`
          : `type ${typeof r}`;
      return `Expected ${e} to be returned from the "${t}" function but got ${i}.`;
    },
    TypeError
  );
  Y(
    'ERR_MISSING_ARGS',
    (...e) => {
      et(e.length > 0, 'At least one arg needs to be specified');
      let t,
        r = e.length;
      switch (((e = (Array.isArray(e) ? e : [e]).map((n) => `"${n}"`).join(' or ')), r)) {
        case 1:
          t += `The ${e[0]} argument`;
          break;
        case 2:
          t += `The ${e[0]} and ${e[1]} arguments`;
          break;
        default:
          {
            let n = e.pop();
            t += `The ${e.join(', ')}, and ${n} arguments`;
          }
          break;
      }
      return `${t} must be specified`;
    },
    TypeError
  );
  Y(
    'ERR_OUT_OF_RANGE',
    (e, t, r) => {
      et(t, 'Missing "range" argument');
      let n;
      return (
        Number.isInteger(r) && Math.abs(r) > 2 ** 32
          ? (n = kf(String(r)))
          : typeof r == 'bigint'
          ? ((n = String(r)), (r > 2n ** 32n || r < -(2n ** 32n)) && (n = kf(n)), (n += 'n'))
          : (n = Br(r)),
        `The value of "${e}" is out of range. It must be ${t}. Received ${n}`
      );
    },
    RangeError
  );
  Y('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times', Error);
  Y('ERR_METHOD_NOT_IMPLEMENTED', 'The %s method is not implemented', Error);
  Y('ERR_STREAM_ALREADY_FINISHED', 'Cannot call %s after a stream was finished', Error);
  Y('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable', Error);
  Y('ERR_STREAM_DESTROYED', 'Cannot call %s after a stream was destroyed', Error);
  Y('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
  Y('ERR_STREAM_PREMATURE_CLOSE', 'Premature close', Error);
  Y('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF', Error);
  Y('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event', Error);
  Y('ERR_STREAM_WRITE_AFTER_END', 'write after end', Error);
  Y('ERR_UNKNOWN_ENCODING', 'Unknown encoding: %s', TypeError);
  Bf.exports = { AbortError: Fi, aggregateTwoErrors: jf(Xw), hideStackFrames: jf, codes: Fr };
});
var zt = _((jO, zf) => {
  'use strict';
  var {
      ArrayIsArray: Ui,
      ArrayPrototypeIncludes: Gf,
      ArrayPrototypeJoin: Hf,
      ArrayPrototypeMap: Zw,
      NumberIsInteger: Gi,
      NumberIsNaN: Qw,
      NumberMAX_SAFE_INTEGER: eS,
      NumberMIN_SAFE_INTEGER: tS,
      NumberParseInt: rS,
      ObjectPrototypeHasOwnProperty: nS,
      RegExpPrototypeExec: Vf,
      String: iS,
      StringPrototypeToUpperCase: oS,
      StringPrototypeTrim: lS,
    } = G(),
    {
      hideStackFrames: ie,
      codes: {
        ERR_SOCKET_BAD_PORT: sS,
        ERR_INVALID_ARG_TYPE: Q,
        ERR_INVALID_ARG_VALUE: Et,
        ERR_OUT_OF_RANGE: tt,
        ERR_UNKNOWN_SIGNAL: Ff,
      },
    } = Z(),
    { normalizeEncoding: uS } = _e(),
    { isAsyncFunction: fS, isArrayBufferView: aS } = _e().types,
    $f = {};
  function cS(e) {
    return e === (e | 0);
  }
  function dS(e) {
    return e === e >>> 0;
  }
  var hS = /^[0-7]+$/,
    bS = 'must be a 32-bit unsigned integer or an octal string';
  function pS(e, t, r) {
    if ((typeof e > 'u' && (e = r), typeof e == 'string')) {
      if (Vf(hS, e) === null) throw new Et(t, e, bS);
      e = rS(e, 8);
    }
    return Kf(e, t), e;
  }
  var yS = ie((e, t, r = tS, n = eS) => {
      if (typeof e != 'number') throw new Q(t, 'number', e);
      if (!Gi(e)) throw new tt(t, 'an integer', e);
      if (e < r || e > n) throw new tt(t, `>= ${r} && <= ${n}`, e);
    }),
    gS = ie((e, t, r = -2147483648, n = 2147483647) => {
      if (typeof e != 'number') throw new Q(t, 'number', e);
      if (!Gi(e)) throw new tt(t, 'an integer', e);
      if (e < r || e > n) throw new tt(t, `>= ${r} && <= ${n}`, e);
    }),
    Kf = ie((e, t, r = !1) => {
      if (typeof e != 'number') throw new Q(t, 'number', e);
      if (!Gi(e)) throw new tt(t, 'an integer', e);
      let n = r ? 1 : 0,
        i = 4294967295;
      if (e < n || e > i) throw new tt(t, `>= ${n} && <= ${i}`, e);
    });
  function Hi(e, t) {
    if (typeof e != 'string') throw new Q(t, 'string', e);
  }
  function _S(e, t, r = void 0, n) {
    if (typeof e != 'number') throw new Q(t, 'number', e);
    if ((r != null && e < r) || (n != null && e > n) || ((r != null || n != null) && Qw(e)))
      throw new tt(
        t,
        `${r != null ? `>= ${r}` : ''}${r != null && n != null ? ' && ' : ''}${n != null ? `<= ${n}` : ''}`,
        e
      );
  }
  var wS = ie((e, t, r) => {
    if (!Gf(r, e)) {
      let i =
        'must be one of: ' +
        Hf(
          Zw(r, (o) => (typeof o == 'string' ? `'${o}'` : iS(o))),
          ', '
        );
      throw new Et(t, e, i);
    }
  });
  function Yf(e, t) {
    if (typeof e != 'boolean') throw new Q(t, 'boolean', e);
  }
  function $i(e, t, r) {
    return e == null || !nS(e, t) ? r : e[t];
  }
  var SS = ie((e, t, r = null) => {
      let n = $i(r, 'allowArray', !1),
        i = $i(r, 'allowFunction', !1);
      if (
        (!$i(r, 'nullable', !1) && e === null) ||
        (!n && Ui(e)) ||
        (typeof e != 'object' && (!i || typeof e != 'function'))
      )
        throw new Q(t, 'Object', e);
    }),
    ES = ie((e, t) => {
      if (e != null && typeof e != 'object' && typeof e != 'function') throw new Q(t, 'a dictionary', e);
    }),
    Vi = ie((e, t, r = 0) => {
      if (!Ui(e)) throw new Q(t, 'Array', e);
      if (e.length < r) {
        let n = `must be longer than ${r}`;
        throw new Et(t, e, n);
      }
    });
  function mS(e, t) {
    Vi(e, t);
    for (let r = 0; r < e.length; r++) Hi(e[r], `${t}[${r}]`);
  }
  function RS(e, t) {
    Vi(e, t);
    for (let r = 0; r < e.length; r++) Yf(e[r], `${t}[${r}]`);
  }
  function AS(e, t = 'signal') {
    if ((Hi(e, t), $f[e] === void 0))
      throw $f[oS(e)] !== void 0 ? new Ff(e + ' (signals must use all capital letters)') : new Ff(e);
  }
  var TS = ie((e, t = 'buffer') => {
    if (!aS(e)) throw new Q(t, ['Buffer', 'TypedArray', 'DataView'], e);
  });
  function OS(e, t) {
    let r = uS(t),
      n = e.length;
    if (r === 'hex' && n % 2 !== 0) throw new Et('encoding', t, `is invalid for data of length ${n}`);
  }
  function LS(e, t = 'Port', r = !0) {
    if (
      (typeof e != 'number' && typeof e != 'string') ||
      (typeof e == 'string' && lS(e).length === 0) ||
      +e !== +e >>> 0 ||
      e > 65535 ||
      (e === 0 && !r)
    )
      throw new sS(t, e, r);
    return e | 0;
  }
  var xS = ie((e, t) => {
      if (e !== void 0 && (e === null || typeof e != 'object' || !('aborted' in e))) throw new Q(t, 'AbortSignal', e);
    }),
    MS = ie((e, t) => {
      if (typeof e != 'function') throw new Q(t, 'Function', e);
    }),
    vS = ie((e, t) => {
      if (typeof e != 'function' || fS(e)) throw new Q(t, 'Function', e);
    }),
    IS = ie((e, t) => {
      if (e !== void 0) throw new Q(t, 'undefined', e);
    });
  function DS(e, t, r) {
    if (!Gf(r, e)) throw new Q(t, `('${Hf(r, '|')}')`, e);
  }
  var NS = /^(?:<[^>]*>)(?:\s*;\s*[^;"\s]+(?:=(")?[^;"\s]*\1)?)*$/;
  function Uf(e, t) {
    if (typeof e > 'u' || !Vf(NS, e))
      throw new Et(t, e, 'must be an array or string of format "</styles.css>; rel=preload; as=style"');
  }
  function PS(e) {
    if (typeof e == 'string') return Uf(e, 'hints'), e;
    if (Ui(e)) {
      let t = e.length,
        r = '';
      if (t === 0) return r;
      for (let n = 0; n < t; n++) {
        let i = e[n];
        Uf(i, 'hints'), (r += i), n !== t - 1 && (r += ', ');
      }
      return r;
    }
    throw new Et('hints', e, 'must be an array or string of format "</styles.css>; rel=preload; as=style"');
  }
  zf.exports = {
    isInt32: cS,
    isUint32: dS,
    parseFileMode: pS,
    validateArray: Vi,
    validateStringArray: mS,
    validateBooleanArray: RS,
    validateBoolean: Yf,
    validateBuffer: TS,
    validateDictionary: ES,
    validateEncoding: OS,
    validateFunction: MS,
    validateInt32: gS,
    validateInteger: yS,
    validateNumber: _S,
    validateObject: SS,
    validateOneOf: wS,
    validatePlainFunction: vS,
    validatePort: LS,
    validateSignalName: AS,
    validateString: Hi,
    validateUint32: Kf,
    validateUndefined: IS,
    validateUnion: DS,
    validateAbortSignal: xS,
    validateLinkHeaderValue: PS,
  };
});
var Se = _((BO, ca) => {
  'use strict';
  var { Symbol: $r, SymbolAsyncIterator: Jf, SymbolIterator: Xf, SymbolFor: Zf } = G(),
    Qf = $r('kDestroyed'),
    ea = $r('kIsErrored'),
    Ki = $r('kIsReadable'),
    ta = $r('kIsDisturbed'),
    qS = Zf('nodejs.webstream.isClosedPromise'),
    CS = Zf('nodejs.webstream.controllerErrorFunction');
  function Ur(e, t = !1) {
    var r;
    return !!(
      e &&
      typeof e.pipe == 'function' &&
      typeof e.on == 'function' &&
      (!t || (typeof e.pause == 'function' && typeof e.resume == 'function')) &&
      (!e._writableState || ((r = e._readableState) === null || r === void 0 ? void 0 : r.readable) !== !1) &&
      (!e._writableState || e._readableState)
    );
  }
  function Gr(e) {
    var t;
    return !!(
      e &&
      typeof e.write == 'function' &&
      typeof e.on == 'function' &&
      (!e._readableState || ((t = e._writableState) === null || t === void 0 ? void 0 : t.writable) !== !1)
    );
  }
  function WS(e) {
    return !!(
      e &&
      typeof e.pipe == 'function' &&
      e._readableState &&
      typeof e.on == 'function' &&
      typeof e.write == 'function'
    );
  }
  function we(e) {
    return (
      e &&
      (e._readableState ||
        e._writableState ||
        (typeof e.write == 'function' && typeof e.on == 'function') ||
        (typeof e.pipe == 'function' && typeof e.on == 'function'))
    );
  }
  function ra(e) {
    return !!(
      e &&
      !we(e) &&
      typeof e.pipeThrough == 'function' &&
      typeof e.getReader == 'function' &&
      typeof e.cancel == 'function'
    );
  }
  function na(e) {
    return !!(e && !we(e) && typeof e.getWriter == 'function' && typeof e.abort == 'function');
  }
  function ia(e) {
    return !!(e && !we(e) && typeof e.readable == 'object' && typeof e.writable == 'object');
  }
  function kS(e) {
    return ra(e) || na(e) || ia(e);
  }
  function jS(e, t) {
    return e == null
      ? !1
      : t === !0
      ? typeof e[Jf] == 'function'
      : t === !1
      ? typeof e[Xf] == 'function'
      : typeof e[Jf] == 'function' || typeof e[Xf] == 'function';
  }
  function Hr(e) {
    if (!we(e)) return null;
    let t = e._writableState,
      r = e._readableState,
      n = t || r;
    return !!(e.destroyed || e[Qf] || (n != null && n.destroyed));
  }
  function oa(e) {
    if (!Gr(e)) return null;
    if (e.writableEnded === !0) return !0;
    let t = e._writableState;
    return t != null && t.errored ? !1 : typeof t?.ended != 'boolean' ? null : t.ended;
  }
  function BS(e, t) {
    if (!Gr(e)) return null;
    if (e.writableFinished === !0) return !0;
    let r = e._writableState;
    return r != null && r.errored
      ? !1
      : typeof r?.finished != 'boolean'
      ? null
      : !!(r.finished || (t === !1 && r.ended === !0 && r.length === 0));
  }
  function FS(e) {
    if (!Ur(e)) return null;
    if (e.readableEnded === !0) return !0;
    let t = e._readableState;
    return !t || t.errored ? !1 : typeof t?.ended != 'boolean' ? null : t.ended;
  }
  function la(e, t) {
    if (!Ur(e)) return null;
    let r = e._readableState;
    return r != null && r.errored
      ? !1
      : typeof r?.endEmitted != 'boolean'
      ? null
      : !!(r.endEmitted || (t === !1 && r.ended === !0 && r.length === 0));
  }
  function sa(e) {
    return e && e[Ki] != null
      ? e[Ki]
      : typeof e?.readable != 'boolean'
      ? null
      : Hr(e)
      ? !1
      : Ur(e) && e.readable && !la(e);
  }
  function ua(e) {
    return typeof e?.writable != 'boolean' ? null : Hr(e) ? !1 : Gr(e) && e.writable && !oa(e);
  }
  function $S(e, t) {
    return we(e) ? (Hr(e) ? !0 : !((t?.readable !== !1 && sa(e)) || (t?.writable !== !1 && ua(e)))) : null;
  }
  function US(e) {
    var t, r;
    return we(e)
      ? e.writableErrored
        ? e.writableErrored
        : (t = (r = e._writableState) === null || r === void 0 ? void 0 : r.errored) !== null && t !== void 0
        ? t
        : null
      : null;
  }
  function GS(e) {
    var t, r;
    return we(e)
      ? e.readableErrored
        ? e.readableErrored
        : (t = (r = e._readableState) === null || r === void 0 ? void 0 : r.errored) !== null && t !== void 0
        ? t
        : null
      : null;
  }
  function HS(e) {
    if (!we(e)) return null;
    if (typeof e.closed == 'boolean') return e.closed;
    let t = e._writableState,
      r = e._readableState;
    return typeof t?.closed == 'boolean' || typeof r?.closed == 'boolean'
      ? t?.closed || r?.closed
      : typeof e._closed == 'boolean' && fa(e)
      ? e._closed
      : null;
  }
  function fa(e) {
    return (
      typeof e._closed == 'boolean' &&
      typeof e._defaultKeepAlive == 'boolean' &&
      typeof e._removedConnection == 'boolean' &&
      typeof e._removedContLen == 'boolean'
    );
  }
  function aa(e) {
    return typeof e._sent100 == 'boolean' && fa(e);
  }
  function VS(e) {
    var t;
    return (
      typeof e._consuming == 'boolean' &&
      typeof e._dumped == 'boolean' &&
      ((t = e.req) === null || t === void 0 ? void 0 : t.upgradeOrConnect) === void 0
    );
  }
  function KS(e) {
    if (!we(e)) return null;
    let t = e._writableState,
      r = e._readableState,
      n = t || r;
    return (!n && aa(e)) || !!(n && n.autoDestroy && n.emitClose && n.closed === !1);
  }
  function YS(e) {
    var t;
    return !!(e && ((t = e[ta]) !== null && t !== void 0 ? t : e.readableDidRead || e.readableAborted));
  }
  function zS(e) {
    var t, r, n, i, o, l, s, f, u, c;
    return !!(
      e &&
      ((t =
        (r =
          (n =
            (i =
              (o = (l = e[ea]) !== null && l !== void 0 ? l : e.readableErrored) !== null && o !== void 0
                ? o
                : e.writableErrored) !== null && i !== void 0
              ? i
              : (s = e._readableState) === null || s === void 0
              ? void 0
              : s.errorEmitted) !== null && n !== void 0
            ? n
            : (f = e._writableState) === null || f === void 0
            ? void 0
            : f.errorEmitted) !== null && r !== void 0
          ? r
          : (u = e._readableState) === null || u === void 0
          ? void 0
          : u.errored) !== null && t !== void 0
        ? t
        : !((c = e._writableState) === null || c === void 0) && c.errored)
    );
  }
  ca.exports = {
    kDestroyed: Qf,
    isDisturbed: YS,
    kIsDisturbed: ta,
    isErrored: zS,
    kIsErrored: ea,
    isReadable: sa,
    kIsReadable: Ki,
    kIsClosedPromise: qS,
    kControllerErrorFunction: CS,
    isClosed: HS,
    isDestroyed: Hr,
    isDuplexNodeStream: WS,
    isFinished: $S,
    isIterable: jS,
    isReadableNodeStream: Ur,
    isReadableStream: ra,
    isReadableEnded: FS,
    isReadableFinished: la,
    isReadableErrored: GS,
    isNodeStream: we,
    isWebStream: kS,
    isWritable: ua,
    isWritableNodeStream: Gr,
    isWritableStream: na,
    isWritableEnded: oa,
    isWritableFinished: BS,
    isWritableErrored: US,
    isServerRequest: VS,
    isServerResponse: aa,
    willEmitClose: KS,
    isTransformStream: ia,
  };
});
var xe = _((FO, Zi) => {
  var Be = X(),
    { AbortError: Sa, codes: JS } = Z(),
    { ERR_INVALID_ARG_TYPE: XS, ERR_STREAM_PREMATURE_CLOSE: da } = JS,
    { kEmptyObject: zi, once: Ji } = _e(),
    { validateAbortSignal: ZS, validateFunction: QS, validateObject: eE, validateBoolean: tE } = zt(),
    { Promise: rE, PromisePrototypeThen: nE } = G(),
    {
      isClosed: iE,
      isReadable: ha,
      isReadableNodeStream: Yi,
      isReadableStream: oE,
      isReadableFinished: ba,
      isReadableErrored: pa,
      isWritable: ya,
      isWritableNodeStream: ga,
      isWritableStream: lE,
      isWritableFinished: _a,
      isWritableErrored: wa,
      isNodeStream: sE,
      willEmitClose: uE,
      kIsClosedPromise: fE,
    } = Se();
  function aE(e) {
    return e.setHeader && typeof e.abort == 'function';
  }
  var Xi = () => {};
  function Ea(e, t, r) {
    var n, i;
    if (
      (arguments.length === 2 ? ((r = t), (t = zi)) : t == null ? (t = zi) : eE(t, 'options'),
      QS(r, 'callback'),
      ZS(t.signal, 'options.signal'),
      (r = Ji(r)),
      oE(e) || lE(e))
    )
      return cE(e, t, r);
    if (!sE(e)) throw new XS('stream', ['ReadableStream', 'WritableStream', 'Stream'], e);
    let o = (n = t.readable) !== null && n !== void 0 ? n : Yi(e),
      l = (i = t.writable) !== null && i !== void 0 ? i : ga(e),
      s = e._writableState,
      f = e._readableState,
      u = () => {
        e.writable || b();
      },
      c = uE(e) && Yi(e) === o && ga(e) === l,
      a = _a(e, !1),
      b = () => {
        (a = !0), e.destroyed && (c = !1), !(c && (!e.readable || o)) && (!o || h) && r.call(e);
      },
      h = ba(e, !1),
      d = () => {
        (h = !0), e.destroyed && (c = !1), !(c && (!e.writable || l)) && (!l || a) && r.call(e);
      },
      S = (m) => {
        r.call(e, m);
      },
      y = iE(e),
      w = () => {
        y = !0;
        let m = wa(e) || pa(e);
        if (m && typeof m != 'boolean') return r.call(e, m);
        if (o && !h && Yi(e, !0) && !ba(e, !1)) return r.call(e, new da());
        if (l && !a && !_a(e, !1)) return r.call(e, new da());
        r.call(e);
      },
      g = () => {
        y = !0;
        let m = wa(e) || pa(e);
        if (m && typeof m != 'boolean') return r.call(e, m);
        r.call(e);
      },
      p = () => {
        e.req.on('finish', b);
      };
    aE(e)
      ? (e.on('complete', b), c || e.on('abort', w), e.req ? p() : e.on('request', p))
      : l && !s && (e.on('end', u), e.on('close', u)),
      !c && typeof e.aborted == 'boolean' && e.on('aborted', w),
      e.on('end', d),
      e.on('finish', b),
      t.error !== !1 && e.on('error', S),
      e.on('close', w),
      y
        ? Be.nextTick(w)
        : (s != null && s.errorEmitted) || (f != null && f.errorEmitted)
        ? c || Be.nextTick(g)
        : ((!o && (!c || ha(e)) && (a || ya(e) === !1)) ||
            (!l && (!c || ya(e)) && (h || ha(e) === !1)) ||
            (f && e.req && e.aborted)) &&
          Be.nextTick(g);
    let A = () => {
      (r = Xi),
        e.removeListener('aborted', w),
        e.removeListener('complete', b),
        e.removeListener('abort', w),
        e.removeListener('request', p),
        e.req && e.req.removeListener('finish', b),
        e.removeListener('end', u),
        e.removeListener('close', u),
        e.removeListener('finish', b),
        e.removeListener('end', d),
        e.removeListener('error', S),
        e.removeListener('close', w);
    };
    if (t.signal && !y) {
      let m = () => {
        let v = r;
        A(), v.call(e, new Sa(void 0, { cause: t.signal.reason }));
      };
      if (t.signal.aborted) Be.nextTick(m);
      else {
        let v = r;
        (r = Ji((...j) => {
          t.signal.removeEventListener('abort', m), v.apply(e, j);
        })),
          t.signal.addEventListener('abort', m);
      }
    }
    return A;
  }
  function cE(e, t, r) {
    let n = !1,
      i = Xi;
    if (t.signal)
      if (
        ((i = () => {
          (n = !0), r.call(e, new Sa(void 0, { cause: t.signal.reason }));
        }),
        t.signal.aborted)
      )
        Be.nextTick(i);
      else {
        let l = r;
        (r = Ji((...s) => {
          t.signal.removeEventListener('abort', i), l.apply(e, s);
        })),
          t.signal.addEventListener('abort', i);
      }
    let o = (...l) => {
      n || Be.nextTick(() => r.apply(e, l));
    };
    return nE(e[fE].promise, o, o), Xi;
  }
  function dE(e, t) {
    var r;
    let n = !1;
    return (
      t === null && (t = zi),
      (r = t) !== null && r !== void 0 && r.cleanup && (tE(t.cleanup, 'cleanup'), (n = t.cleanup)),
      new rE((i, o) => {
        let l = Ea(e, t, (s) => {
          n && l(), s ? o(s) : i();
        });
      })
    );
  }
  Zi.exports = Ea;
  Zi.exports.finished = dE;
});
var rt = _(($O, Ma) => {
  'use strict';
  var Ee = X(),
    {
      aggregateTwoErrors: hE,
      codes: { ERR_MULTIPLE_CALLBACK: bE },
      AbortError: pE,
    } = Z(),
    { Symbol: Aa } = G(),
    { kDestroyed: yE, isDestroyed: gE, isFinished: _E, isServerRequest: wE } = Se(),
    Ta = Aa('kDestroy'),
    Qi = Aa('kConstruct');
  function Oa(e, t, r) {
    e && (e.stack, t && !t.errored && (t.errored = e), r && !r.errored && (r.errored = e));
  }
  function SE(e, t) {
    let r = this._readableState,
      n = this._writableState,
      i = n || r;
    return (n != null && n.destroyed) || (r != null && r.destroyed)
      ? (typeof t == 'function' && t(), this)
      : (Oa(e, n, r),
        n && (n.destroyed = !0),
        r && (r.destroyed = !0),
        i.constructed
          ? ma(this, e, t)
          : this.once(Ta, function (o) {
              ma(this, hE(o, e), t);
            }),
        this);
  }
  function ma(e, t, r) {
    let n = !1;
    function i(o) {
      if (n) return;
      n = !0;
      let l = e._readableState,
        s = e._writableState;
      Oa(o, s, l),
        s && (s.closed = !0),
        l && (l.closed = !0),
        typeof r == 'function' && r(o),
        o ? Ee.nextTick(EE, e, o) : Ee.nextTick(La, e);
    }
    try {
      e._destroy(t || null, i);
    } catch (o) {
      i(o);
    }
  }
  function EE(e, t) {
    eo(e, t), La(e);
  }
  function La(e) {
    let t = e._readableState,
      r = e._writableState;
    r && (r.closeEmitted = !0),
      t && (t.closeEmitted = !0),
      ((r != null && r.emitClose) || (t != null && t.emitClose)) && e.emit('close');
  }
  function eo(e, t) {
    let r = e._readableState,
      n = e._writableState;
    (n != null && n.errorEmitted) ||
      (r != null && r.errorEmitted) ||
      (n && (n.errorEmitted = !0), r && (r.errorEmitted = !0), e.emit('error', t));
  }
  function mE() {
    let e = this._readableState,
      t = this._writableState;
    e &&
      ((e.constructed = !0),
      (e.closed = !1),
      (e.closeEmitted = !1),
      (e.destroyed = !1),
      (e.errored = null),
      (e.errorEmitted = !1),
      (e.reading = !1),
      (e.ended = e.readable === !1),
      (e.endEmitted = e.readable === !1)),
      t &&
        ((t.constructed = !0),
        (t.destroyed = !1),
        (t.closed = !1),
        (t.closeEmitted = !1),
        (t.errored = null),
        (t.errorEmitted = !1),
        (t.finalCalled = !1),
        (t.prefinished = !1),
        (t.ended = t.writable === !1),
        (t.ending = t.writable === !1),
        (t.finished = t.writable === !1));
  }
  function to(e, t, r) {
    let n = e._readableState,
      i = e._writableState;
    if ((i != null && i.destroyed) || (n != null && n.destroyed)) return this;
    (n != null && n.autoDestroy) || (i != null && i.autoDestroy)
      ? e.destroy(t)
      : t &&
        (t.stack,
        i && !i.errored && (i.errored = t),
        n && !n.errored && (n.errored = t),
        r ? Ee.nextTick(eo, e, t) : eo(e, t));
  }
  function RE(e, t) {
    if (typeof e._construct != 'function') return;
    let r = e._readableState,
      n = e._writableState;
    r && (r.constructed = !1),
      n && (n.constructed = !1),
      e.once(Qi, t),
      !(e.listenerCount(Qi) > 1) && Ee.nextTick(AE, e);
  }
  function AE(e) {
    let t = !1;
    function r(n) {
      if (t) {
        to(e, n ?? new bE());
        return;
      }
      t = !0;
      let i = e._readableState,
        o = e._writableState,
        l = o || i;
      i && (i.constructed = !0),
        o && (o.constructed = !0),
        l.destroyed ? e.emit(Ta, n) : n ? to(e, n, !0) : Ee.nextTick(TE, e);
    }
    try {
      e._construct((n) => {
        Ee.nextTick(r, n);
      });
    } catch (n) {
      Ee.nextTick(r, n);
    }
  }
  function TE(e) {
    e.emit(Qi);
  }
  function Ra(e) {
    return e?.setHeader && typeof e.abort == 'function';
  }
  function xa(e) {
    e.emit('close');
  }
  function OE(e, t) {
    e.emit('error', t), Ee.nextTick(xa, e);
  }
  function LE(e, t) {
    !e ||
      gE(e) ||
      (!t && !_E(e) && (t = new pE()),
      wE(e)
        ? ((e.socket = null), e.destroy(t))
        : Ra(e)
        ? e.abort()
        : Ra(e.req)
        ? e.req.abort()
        : typeof e.destroy == 'function'
        ? e.destroy(t)
        : typeof e.close == 'function'
        ? e.close()
        : t
        ? Ee.nextTick(OE, e, t)
        : Ee.nextTick(xa, e),
      e.destroyed || (e[yE] = !0));
  }
  Ma.exports = { construct: RE, destroyer: LE, destroy: SE, undestroy: mE, errorOrDestroy: to };
});
var Yr = _((UO, Ia) => {
  'use strict';
  var { ArrayIsArray: xE, ObjectSetPrototypeOf: va } = G(),
    { EventEmitter: Vr } = require('events');
  function Kr(e) {
    Vr.call(this, e);
  }
  va(Kr.prototype, Vr.prototype);
  va(Kr, Vr);
  Kr.prototype.pipe = function (e, t) {
    let r = this;
    function n(c) {
      e.writable && e.write(c) === !1 && r.pause && r.pause();
    }
    r.on('data', n);
    function i() {
      r.readable && r.resume && r.resume();
    }
    e.on('drain', i), !e._isStdio && (!t || t.end !== !1) && (r.on('end', l), r.on('close', s));
    let o = !1;
    function l() {
      o || ((o = !0), e.end());
    }
    function s() {
      o || ((o = !0), typeof e.destroy == 'function' && e.destroy());
    }
    function f(c) {
      u(), Vr.listenerCount(this, 'error') === 0 && this.emit('error', c);
    }
    ro(r, 'error', f), ro(e, 'error', f);
    function u() {
      r.removeListener('data', n),
        e.removeListener('drain', i),
        r.removeListener('end', l),
        r.removeListener('close', s),
        r.removeListener('error', f),
        e.removeListener('error', f),
        r.removeListener('end', u),
        r.removeListener('close', u),
        e.removeListener('close', u);
    }
    return r.on('end', u), r.on('close', u), e.on('close', u), e.emit('pipe', r), e;
  };
  function ro(e, t, r) {
    if (typeof e.prependListener == 'function') return e.prependListener(t, r);
    !e._events || !e._events[t]
      ? e.on(t, r)
      : xE(e._events[t])
      ? e._events[t].unshift(r)
      : (e._events[t] = [r, e._events[t]]);
  }
  Ia.exports = { Stream: Kr, prependListener: ro };
});
var Jt = _((GO, zr) => {
  'use strict';
  var { AbortError: Da, codes: ME } = Z(),
    { isNodeStream: Na, isWebStream: vE, kControllerErrorFunction: IE } = Se(),
    DE = xe(),
    { ERR_INVALID_ARG_TYPE: Pa } = ME,
    NE = (e, t) => {
      if (typeof e != 'object' || !('aborted' in e)) throw new Pa(t, 'AbortSignal', e);
    };
  zr.exports.addAbortSignal = function (t, r) {
    if ((NE(t, 'signal'), !Na(r) && !vE(r))) throw new Pa('stream', ['ReadableStream', 'WritableStream', 'Stream'], r);
    return zr.exports.addAbortSignalNoValidate(t, r);
  };
  zr.exports.addAbortSignalNoValidate = function (e, t) {
    if (typeof e != 'object' || !('aborted' in e)) return t;
    let r = Na(t)
      ? () => {
          t.destroy(new Da(void 0, { cause: e.reason }));
        }
      : () => {
          t[IE](new Da(void 0, { cause: e.reason }));
        };
    return e.aborted ? r() : (e.addEventListener('abort', r), DE(t, () => e.removeEventListener('abort', r))), t;
  };
});
var Wa = _((VO, Ca) => {
  'use strict';
  var { StringPrototypeSlice: qa, SymbolIterator: PE, TypedArrayPrototypeSet: Jr, Uint8Array: qE } = G(),
    { Buffer: no } = require('buffer'),
    { inspect: CE } = _e();
  Ca.exports = class {
    constructor() {
      (this.head = null), (this.tail = null), (this.length = 0);
    }
    push(t) {
      let r = { data: t, next: null };
      this.length > 0 ? (this.tail.next = r) : (this.head = r), (this.tail = r), ++this.length;
    }
    unshift(t) {
      let r = { data: t, next: this.head };
      this.length === 0 && (this.tail = r), (this.head = r), ++this.length;
    }
    shift() {
      if (this.length === 0) return;
      let t = this.head.data;
      return this.length === 1 ? (this.head = this.tail = null) : (this.head = this.head.next), --this.length, t;
    }
    clear() {
      (this.head = this.tail = null), (this.length = 0);
    }
    join(t) {
      if (this.length === 0) return '';
      let r = this.head,
        n = '' + r.data;
      for (; (r = r.next) !== null; ) n += t + r.data;
      return n;
    }
    concat(t) {
      if (this.length === 0) return no.alloc(0);
      let r = no.allocUnsafe(t >>> 0),
        n = this.head,
        i = 0;
      for (; n; ) Jr(r, n.data, i), (i += n.data.length), (n = n.next);
      return r;
    }
    consume(t, r) {
      let n = this.head.data;
      if (t < n.length) {
        let i = n.slice(0, t);
        return (this.head.data = n.slice(t)), i;
      }
      return t === n.length ? this.shift() : r ? this._getString(t) : this._getBuffer(t);
    }
    first() {
      return this.head.data;
    }
    *[PE]() {
      for (let t = this.head; t; t = t.next) yield t.data;
    }
    _getString(t) {
      let r = '',
        n = this.head,
        i = 0;
      do {
        let o = n.data;
        if (t > o.length) (r += o), (t -= o.length);
        else {
          t === o.length
            ? ((r += o), ++i, n.next ? (this.head = n.next) : (this.head = this.tail = null))
            : ((r += qa(o, 0, t)), (this.head = n), (n.data = qa(o, t)));
          break;
        }
        ++i;
      } while ((n = n.next) !== null);
      return (this.length -= i), r;
    }
    _getBuffer(t) {
      let r = no.allocUnsafe(t),
        n = t,
        i = this.head,
        o = 0;
      do {
        let l = i.data;
        if (t > l.length) Jr(r, l, n - t), (t -= l.length);
        else {
          t === l.length
            ? (Jr(r, l, n - t), ++o, i.next ? (this.head = i.next) : (this.head = this.tail = null))
            : (Jr(r, new qE(l.buffer, l.byteOffset, t), n - t), (this.head = i), (i.data = l.slice(t)));
          break;
        }
        ++o;
      } while ((i = i.next) !== null);
      return (this.length -= o), r;
    }
    [Symbol.for('nodejs.util.inspect.custom')](t, r) {
      return CE(this, { ...r, depth: 0, customInspect: !1 });
    }
  };
});
var Xr = _((KO, ja) => {
  'use strict';
  var { MathFloor: WE, NumberIsInteger: kE } = G(),
    { ERR_INVALID_ARG_VALUE: jE } = Z().codes;
  function BE(e, t, r) {
    return e.highWaterMark != null ? e.highWaterMark : t ? e[r] : null;
  }
  function ka(e) {
    return e ? 16 : 16 * 1024;
  }
  function FE(e, t, r, n) {
    let i = BE(t, n, r);
    if (i != null) {
      if (!kE(i) || i < 0) {
        let o = n ? `options.${r}` : 'options.highWaterMark';
        throw new jE(o, i);
      }
      return WE(i);
    }
    return ka(e.objectMode);
  }
  ja.exports = { getHighWaterMark: FE, getDefaultHighWaterMark: ka };
});
var io = _((YO, Ua) => {
  'use strict';
  var Ba = X(),
    { PromisePrototypeThen: $E, SymbolAsyncIterator: Fa, SymbolIterator: $a } = G(),
    { Buffer: UE } = require('buffer'),
    { ERR_INVALID_ARG_TYPE: GE, ERR_STREAM_NULL_VALUES: HE } = Z().codes;
  function VE(e, t, r) {
    let n;
    if (typeof t == 'string' || t instanceof UE)
      return new e({
        objectMode: !0,
        ...r,
        read() {
          this.push(t), this.push(null);
        },
      });
    let i;
    if (t && t[Fa]) (i = !0), (n = t[Fa]());
    else if (t && t[$a]) (i = !1), (n = t[$a]());
    else throw new GE('iterable', ['Iterable'], t);
    let o = new e({ objectMode: !0, highWaterMark: 1, ...r }),
      l = !1;
    (o._read = function () {
      l || ((l = !0), f());
    }),
      (o._destroy = function (u, c) {
        $E(
          s(u),
          () => Ba.nextTick(c, u),
          (a) => Ba.nextTick(c, a || u)
        );
      });
    async function s(u) {
      let c = u != null,
        a = typeof n.throw == 'function';
      if (c && a) {
        let { value: b, done: h } = await n.throw(u);
        if ((await b, h)) return;
      }
      if (typeof n.return == 'function') {
        let { value: b } = await n.return();
        await b;
      }
    }
    async function f() {
      for (;;) {
        try {
          let { value: u, done: c } = i ? await n.next() : n.next();
          if (c) o.push(null);
          else {
            let a = u && typeof u.then == 'function' ? await u : u;
            if (a === null) throw ((l = !1), new HE());
            if (o.push(a)) continue;
            l = !1;
          }
        } catch (u) {
          o.destroy(u);
        }
        break;
      }
    }
    return o;
  }
  Ua.exports = VE;
});
var Xt = _((zO, rc) => {
  var fe = X(),
    {
      ArrayPrototypeIndexOf: KE,
      NumberIsInteger: YE,
      NumberIsNaN: zE,
      NumberParseInt: JE,
      ObjectDefineProperties: Va,
      ObjectKeys: XE,
      ObjectSetPrototypeOf: Ka,
      Promise: ZE,
      SafeSet: QE,
      SymbolAsyncIterator: em,
      Symbol: tm,
    } = G();
  rc.exports = L;
  L.ReadableState = ao;
  var { EventEmitter: rm } = require('events'),
    { Stream: Fe, prependListener: nm } = Yr(),
    { Buffer: oo } = require('buffer'),
    { addAbortSignal: im } = Jt(),
    om = xe(),
    N = _e().debuglog('stream', (e) => {
      N = e;
    }),
    lm = Wa(),
    Rt = rt(),
    { getHighWaterMark: sm, getDefaultHighWaterMark: um } = Xr(),
    {
      aggregateTwoErrors: Ga,
      codes: {
        ERR_INVALID_ARG_TYPE: fm,
        ERR_METHOD_NOT_IMPLEMENTED: am,
        ERR_OUT_OF_RANGE: cm,
        ERR_STREAM_PUSH_AFTER_EOF: dm,
        ERR_STREAM_UNSHIFT_AFTER_END_EVENT: hm,
      },
    } = Z(),
    { validateObject: bm } = zt(),
    nt = tm('kPaused'),
    { StringDecoder: Ya } = require('string_decoder'),
    pm = io();
  Ka(L.prototype, Fe.prototype);
  Ka(L, Fe);
  var lo = () => {},
    { errorOrDestroy: mt } = Rt;
  function ao(e, t, r) {
    typeof r != 'boolean' && (r = t instanceof me()),
      (this.objectMode = !!(e && e.objectMode)),
      r && (this.objectMode = this.objectMode || !!(e && e.readableObjectMode)),
      (this.highWaterMark = e ? sm(this, e, 'readableHighWaterMark', r) : um(!1)),
      (this.buffer = new lm()),
      (this.length = 0),
      (this.pipes = []),
      (this.flowing = null),
      (this.ended = !1),
      (this.endEmitted = !1),
      (this.reading = !1),
      (this.constructed = !0),
      (this.sync = !0),
      (this.needReadable = !1),
      (this.emittedReadable = !1),
      (this.readableListening = !1),
      (this.resumeScheduled = !1),
      (this[nt] = null),
      (this.errorEmitted = !1),
      (this.emitClose = !e || e.emitClose !== !1),
      (this.autoDestroy = !e || e.autoDestroy !== !1),
      (this.destroyed = !1),
      (this.errored = null),
      (this.closed = !1),
      (this.closeEmitted = !1),
      (this.defaultEncoding = (e && e.defaultEncoding) || 'utf8'),
      (this.awaitDrainWriters = null),
      (this.multiAwaitDrain = !1),
      (this.readingMore = !1),
      (this.dataEmitted = !1),
      (this.decoder = null),
      (this.encoding = null),
      e && e.encoding && ((this.decoder = new Ya(e.encoding)), (this.encoding = e.encoding));
  }
  function L(e) {
    if (!(this instanceof L)) return new L(e);
    let t = this instanceof me();
    (this._readableState = new ao(e, this, t)),
      e &&
        (typeof e.read == 'function' && (this._read = e.read),
        typeof e.destroy == 'function' && (this._destroy = e.destroy),
        typeof e.construct == 'function' && (this._construct = e.construct),
        e.signal && !t && im(e.signal, this)),
      Fe.call(this, e),
      Rt.construct(this, () => {
        this._readableState.needReadable && Zr(this, this._readableState);
      });
  }
  L.prototype.destroy = Rt.destroy;
  L.prototype._undestroy = Rt.undestroy;
  L.prototype._destroy = function (e, t) {
    t(e);
  };
  L.prototype[rm.captureRejectionSymbol] = function (e) {
    this.destroy(e);
  };
  L.prototype.push = function (e, t) {
    return za(this, e, t, !1);
  };
  L.prototype.unshift = function (e, t) {
    return za(this, e, t, !0);
  };
  function za(e, t, r, n) {
    N('readableAddChunk', t);
    let i = e._readableState,
      o;
    if (
      (i.objectMode ||
        (typeof t == 'string'
          ? ((r = r || i.defaultEncoding),
            i.encoding !== r &&
              (n && i.encoding ? (t = oo.from(t, r).toString(i.encoding)) : ((t = oo.from(t, r)), (r = ''))))
          : t instanceof oo
          ? (r = '')
          : Fe._isUint8Array(t)
          ? ((t = Fe._uint8ArrayToBuffer(t)), (r = ''))
          : t != null && (o = new fm('chunk', ['string', 'Buffer', 'Uint8Array'], t))),
      o)
    )
      mt(e, o);
    else if (t === null) (i.reading = !1), _m(e, i);
    else if (i.objectMode || (t && t.length > 0))
      if (n)
        if (i.endEmitted) mt(e, new hm());
        else {
          if (i.destroyed || i.errored) return !1;
          so(e, i, t, !0);
        }
      else if (i.ended) mt(e, new dm());
      else {
        if (i.destroyed || i.errored) return !1;
        (i.reading = !1),
          i.decoder && !r
            ? ((t = i.decoder.write(t)), i.objectMode || t.length !== 0 ? so(e, i, t, !1) : Zr(e, i))
            : so(e, i, t, !1);
      }
    else n || ((i.reading = !1), Zr(e, i));
    return !i.ended && (i.length < i.highWaterMark || i.length === 0);
  }
  function so(e, t, r, n) {
    t.flowing && t.length === 0 && !t.sync && e.listenerCount('data') > 0
      ? (t.multiAwaitDrain ? t.awaitDrainWriters.clear() : (t.awaitDrainWriters = null),
        (t.dataEmitted = !0),
        e.emit('data', r))
      : ((t.length += t.objectMode ? 1 : r.length),
        n ? t.buffer.unshift(r) : t.buffer.push(r),
        t.needReadable && Qr(e)),
      Zr(e, t);
  }
  L.prototype.isPaused = function () {
    let e = this._readableState;
    return e[nt] === !0 || e.flowing === !1;
  };
  L.prototype.setEncoding = function (e) {
    let t = new Ya(e);
    (this._readableState.decoder = t), (this._readableState.encoding = this._readableState.decoder.encoding);
    let r = this._readableState.buffer,
      n = '';
    for (let i of r) n += t.write(i);
    return r.clear(), n !== '' && r.push(n), (this._readableState.length = n.length), this;
  };
  var ym = 1073741824;
  function gm(e) {
    if (e > ym) throw new cm('size', '<= 1GiB', e);
    return e--, (e |= e >>> 1), (e |= e >>> 2), (e |= e >>> 4), (e |= e >>> 8), (e |= e >>> 16), e++, e;
  }
  function Ha(e, t) {
    return e <= 0 || (t.length === 0 && t.ended)
      ? 0
      : t.objectMode
      ? 1
      : zE(e)
      ? t.flowing && t.length
        ? t.buffer.first().length
        : t.length
      : e <= t.length
      ? e
      : t.ended
      ? t.length
      : 0;
  }
  L.prototype.read = function (e) {
    N('read', e), e === void 0 ? (e = NaN) : YE(e) || (e = JE(e, 10));
    let t = this._readableState,
      r = e;
    if (
      (e > t.highWaterMark && (t.highWaterMark = gm(e)),
      e !== 0 && (t.emittedReadable = !1),
      e === 0 && t.needReadable && ((t.highWaterMark !== 0 ? t.length >= t.highWaterMark : t.length > 0) || t.ended))
    )
      return N('read: emitReadable', t.length, t.ended), t.length === 0 && t.ended ? uo(this) : Qr(this), null;
    if (((e = Ha(e, t)), e === 0 && t.ended)) return t.length === 0 && uo(this), null;
    let n = t.needReadable;
    if (
      (N('need readable', n),
      (t.length === 0 || t.length - e < t.highWaterMark) && ((n = !0), N('length less than watermark', n)),
      t.ended || t.reading || t.destroyed || t.errored || !t.constructed)
    )
      (n = !1), N('reading, ended or constructing', n);
    else if (n) {
      N('do read'), (t.reading = !0), (t.sync = !0), t.length === 0 && (t.needReadable = !0);
      try {
        this._read(t.highWaterMark);
      } catch (o) {
        mt(this, o);
      }
      (t.sync = !1), t.reading || (e = Ha(r, t));
    }
    let i;
    return (
      e > 0 ? (i = ec(e, t)) : (i = null),
      i === null
        ? ((t.needReadable = t.length <= t.highWaterMark), (e = 0))
        : ((t.length -= e), t.multiAwaitDrain ? t.awaitDrainWriters.clear() : (t.awaitDrainWriters = null)),
      t.length === 0 && (t.ended || (t.needReadable = !0), r !== e && t.ended && uo(this)),
      i !== null && !t.errorEmitted && !t.closeEmitted && ((t.dataEmitted = !0), this.emit('data', i)),
      i
    );
  };
  function _m(e, t) {
    if ((N('onEofChunk'), !t.ended)) {
      if (t.decoder) {
        let r = t.decoder.end();
        r && r.length && (t.buffer.push(r), (t.length += t.objectMode ? 1 : r.length));
      }
      (t.ended = !0), t.sync ? Qr(e) : ((t.needReadable = !1), (t.emittedReadable = !0), Ja(e));
    }
  }
  function Qr(e) {
    let t = e._readableState;
    N('emitReadable', t.needReadable, t.emittedReadable),
      (t.needReadable = !1),
      t.emittedReadable || (N('emitReadable', t.flowing), (t.emittedReadable = !0), fe.nextTick(Ja, e));
  }
  function Ja(e) {
    let t = e._readableState;
    N('emitReadable_', t.destroyed, t.length, t.ended),
      !t.destroyed && !t.errored && (t.length || t.ended) && (e.emit('readable'), (t.emittedReadable = !1)),
      (t.needReadable = !t.flowing && !t.ended && t.length <= t.highWaterMark),
      Za(e);
  }
  function Zr(e, t) {
    !t.readingMore && t.constructed && ((t.readingMore = !0), fe.nextTick(wm, e, t));
  }
  function wm(e, t) {
    for (; !t.reading && !t.ended && (t.length < t.highWaterMark || (t.flowing && t.length === 0)); ) {
      let r = t.length;
      if ((N('maybeReadMore read 0'), e.read(0), r === t.length)) break;
    }
    t.readingMore = !1;
  }
  L.prototype._read = function (e) {
    throw new am('_read()');
  };
  L.prototype.pipe = function (e, t) {
    let r = this,
      n = this._readableState;
    n.pipes.length === 1 &&
      (n.multiAwaitDrain ||
        ((n.multiAwaitDrain = !0), (n.awaitDrainWriters = new QE(n.awaitDrainWriters ? [n.awaitDrainWriters] : [])))),
      n.pipes.push(e),
      N('pipe count=%d opts=%j', n.pipes.length, t);
    let o = (!t || t.end !== !1) && e !== fe.stdout && e !== fe.stderr ? s : y;
    n.endEmitted ? fe.nextTick(o) : r.once('end', o), e.on('unpipe', l);
    function l(w, g) {
      N('onunpipe'), w === r && g && g.hasUnpiped === !1 && ((g.hasUnpiped = !0), c());
    }
    function s() {
      N('onend'), e.end();
    }
    let f,
      u = !1;
    function c() {
      N('cleanup'),
        e.removeListener('close', d),
        e.removeListener('finish', S),
        f && e.removeListener('drain', f),
        e.removeListener('error', h),
        e.removeListener('unpipe', l),
        r.removeListener('end', s),
        r.removeListener('end', y),
        r.removeListener('data', b),
        (u = !0),
        f && n.awaitDrainWriters && (!e._writableState || e._writableState.needDrain) && f();
    }
    function a() {
      u ||
        (n.pipes.length === 1 && n.pipes[0] === e
          ? (N('false write response, pause', 0), (n.awaitDrainWriters = e), (n.multiAwaitDrain = !1))
          : n.pipes.length > 1 &&
            n.pipes.includes(e) &&
            (N('false write response, pause', n.awaitDrainWriters.size), n.awaitDrainWriters.add(e)),
        r.pause()),
        f || ((f = Sm(r, e)), e.on('drain', f));
    }
    r.on('data', b);
    function b(w) {
      N('ondata');
      let g = e.write(w);
      N('dest.write', g), g === !1 && a();
    }
    function h(w) {
      if ((N('onerror', w), y(), e.removeListener('error', h), e.listenerCount('error') === 0)) {
        let g = e._writableState || e._readableState;
        g && !g.errorEmitted ? mt(e, w) : e.emit('error', w);
      }
    }
    nm(e, 'error', h);
    function d() {
      e.removeListener('finish', S), y();
    }
    e.once('close', d);
    function S() {
      N('onfinish'), e.removeListener('close', d), y();
    }
    e.once('finish', S);
    function y() {
      N('unpipe'), r.unpipe(e);
    }
    return (
      e.emit('pipe', r), e.writableNeedDrain === !0 ? n.flowing && a() : n.flowing || (N('pipe resume'), r.resume()), e
    );
  };
  function Sm(e, t) {
    return function () {
      let n = e._readableState;
      n.awaitDrainWriters === t
        ? (N('pipeOnDrain', 1), (n.awaitDrainWriters = null))
        : n.multiAwaitDrain && (N('pipeOnDrain', n.awaitDrainWriters.size), n.awaitDrainWriters.delete(t)),
        (!n.awaitDrainWriters || n.awaitDrainWriters.size === 0) && e.listenerCount('data') && e.resume();
    };
  }
  L.prototype.unpipe = function (e) {
    let t = this._readableState,
      r = { hasUnpiped: !1 };
    if (t.pipes.length === 0) return this;
    if (!e) {
      let i = t.pipes;
      (t.pipes = []), this.pause();
      for (let o = 0; o < i.length; o++) i[o].emit('unpipe', this, { hasUnpiped: !1 });
      return this;
    }
    let n = KE(t.pipes, e);
    return n === -1
      ? this
      : (t.pipes.splice(n, 1), t.pipes.length === 0 && this.pause(), e.emit('unpipe', this, r), this);
  };
  L.prototype.on = function (e, t) {
    let r = Fe.prototype.on.call(this, e, t),
      n = this._readableState;
    return (
      e === 'data'
        ? ((n.readableListening = this.listenerCount('readable') > 0), n.flowing !== !1 && this.resume())
        : e === 'readable' &&
          !n.endEmitted &&
          !n.readableListening &&
          ((n.readableListening = n.needReadable = !0),
          (n.flowing = !1),
          (n.emittedReadable = !1),
          N('on readable', n.length, n.reading),
          n.length ? Qr(this) : n.reading || fe.nextTick(Em, this)),
      r
    );
  };
  L.prototype.addListener = L.prototype.on;
  L.prototype.removeListener = function (e, t) {
    let r = Fe.prototype.removeListener.call(this, e, t);
    return e === 'readable' && fe.nextTick(Xa, this), r;
  };
  L.prototype.off = L.prototype.removeListener;
  L.prototype.removeAllListeners = function (e) {
    let t = Fe.prototype.removeAllListeners.apply(this, arguments);
    return (e === 'readable' || e === void 0) && fe.nextTick(Xa, this), t;
  };
  function Xa(e) {
    let t = e._readableState;
    (t.readableListening = e.listenerCount('readable') > 0),
      t.resumeScheduled && t[nt] === !1
        ? (t.flowing = !0)
        : e.listenerCount('data') > 0
        ? e.resume()
        : t.readableListening || (t.flowing = null);
  }
  function Em(e) {
    N('readable nexttick read 0'), e.read(0);
  }
  L.prototype.resume = function () {
    let e = this._readableState;
    return e.flowing || (N('resume'), (e.flowing = !e.readableListening), mm(this, e)), (e[nt] = !1), this;
  };
  function mm(e, t) {
    t.resumeScheduled || ((t.resumeScheduled = !0), fe.nextTick(Rm, e, t));
  }
  function Rm(e, t) {
    N('resume', t.reading),
      t.reading || e.read(0),
      (t.resumeScheduled = !1),
      e.emit('resume'),
      Za(e),
      t.flowing && !t.reading && e.read(0);
  }
  L.prototype.pause = function () {
    return (
      N('call pause flowing=%j', this._readableState.flowing),
      this._readableState.flowing !== !1 && (N('pause'), (this._readableState.flowing = !1), this.emit('pause')),
      (this._readableState[nt] = !0),
      this
    );
  };
  function Za(e) {
    let t = e._readableState;
    for (N('flow', t.flowing); t.flowing && e.read() !== null; );
  }
  L.prototype.wrap = function (e) {
    let t = !1;
    e.on('data', (n) => {
      !this.push(n) && e.pause && ((t = !0), e.pause());
    }),
      e.on('end', () => {
        this.push(null);
      }),
      e.on('error', (n) => {
        mt(this, n);
      }),
      e.on('close', () => {
        this.destroy();
      }),
      e.on('destroy', () => {
        this.destroy();
      }),
      (this._read = () => {
        t && e.resume && ((t = !1), e.resume());
      });
    let r = XE(e);
    for (let n = 1; n < r.length; n++) {
      let i = r[n];
      this[i] === void 0 && typeof e[i] == 'function' && (this[i] = e[i].bind(e));
    }
    return this;
  };
  L.prototype[em] = function () {
    return Qa(this);
  };
  L.prototype.iterator = function (e) {
    return e !== void 0 && bm(e, 'options'), Qa(this, e);
  };
  function Qa(e, t) {
    typeof e.read != 'function' && (e = L.wrap(e, { objectMode: !0 }));
    let r = Am(e, t);
    return (r.stream = e), r;
  }
  async function* Am(e, t) {
    let r = lo;
    function n(l) {
      this === e ? (r(), (r = lo)) : (r = l);
    }
    e.on('readable', n);
    let i,
      o = om(e, { writable: !1 }, (l) => {
        (i = l ? Ga(i, l) : null), r(), (r = lo);
      });
    try {
      for (;;) {
        let l = e.destroyed ? null : e.read();
        if (l !== null) yield l;
        else {
          if (i) throw i;
          if (i === null) return;
          await new ZE(n);
        }
      }
    } catch (l) {
      throw ((i = Ga(i, l)), i);
    } finally {
      (i || t?.destroyOnReturn !== !1) && (i === void 0 || e._readableState.autoDestroy)
        ? Rt.destroyer(e, null)
        : (e.off('readable', n), o());
    }
  }
  Va(L.prototype, {
    readable: {
      __proto__: null,
      get() {
        let e = this._readableState;
        return !!e && e.readable !== !1 && !e.destroyed && !e.errorEmitted && !e.endEmitted;
      },
      set(e) {
        this._readableState && (this._readableState.readable = !!e);
      },
    },
    readableDidRead: {
      __proto__: null,
      enumerable: !1,
      get: function () {
        return this._readableState.dataEmitted;
      },
    },
    readableAborted: {
      __proto__: null,
      enumerable: !1,
      get: function () {
        return !!(
          this._readableState.readable !== !1 &&
          (this._readableState.destroyed || this._readableState.errored) &&
          !this._readableState.endEmitted
        );
      },
    },
    readableHighWaterMark: {
      __proto__: null,
      enumerable: !1,
      get: function () {
        return this._readableState.highWaterMark;
      },
    },
    readableBuffer: {
      __proto__: null,
      enumerable: !1,
      get: function () {
        return this._readableState && this._readableState.buffer;
      },
    },
    readableFlowing: {
      __proto__: null,
      enumerable: !1,
      get: function () {
        return this._readableState.flowing;
      },
      set: function (e) {
        this._readableState && (this._readableState.flowing = e);
      },
    },
    readableLength: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._readableState.length;
      },
    },
    readableObjectMode: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._readableState ? this._readableState.objectMode : !1;
      },
    },
    readableEncoding: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._readableState ? this._readableState.encoding : null;
      },
    },
    errored: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._readableState ? this._readableState.errored : null;
      },
    },
    closed: {
      __proto__: null,
      get() {
        return this._readableState ? this._readableState.closed : !1;
      },
    },
    destroyed: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._readableState ? this._readableState.destroyed : !1;
      },
      set(e) {
        this._readableState && (this._readableState.destroyed = e);
      },
    },
    readableEnded: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._readableState ? this._readableState.endEmitted : !1;
      },
    },
  });
  Va(ao.prototype, {
    pipesCount: {
      __proto__: null,
      get() {
        return this.pipes.length;
      },
    },
    paused: {
      __proto__: null,
      get() {
        return this[nt] !== !1;
      },
      set(e) {
        this[nt] = !!e;
      },
    },
  });
  L._fromList = ec;
  function ec(e, t) {
    if (t.length === 0) return null;
    let r;
    return (
      t.objectMode
        ? (r = t.buffer.shift())
        : !e || e >= t.length
        ? (t.decoder
            ? (r = t.buffer.join(''))
            : t.buffer.length === 1
            ? (r = t.buffer.first())
            : (r = t.buffer.concat(t.length)),
          t.buffer.clear())
        : (r = t.buffer.consume(e, t.decoder)),
      r
    );
  }
  function uo(e) {
    let t = e._readableState;
    N('endReadable', t.endEmitted), t.endEmitted || ((t.ended = !0), fe.nextTick(Tm, t, e));
  }
  function Tm(e, t) {
    if (
      (N('endReadableNT', e.endEmitted, e.length), !e.errored && !e.closeEmitted && !e.endEmitted && e.length === 0)
    ) {
      if (((e.endEmitted = !0), t.emit('end'), t.writable && t.allowHalfOpen === !1)) fe.nextTick(Om, t);
      else if (e.autoDestroy) {
        let r = t._writableState;
        (!r || (r.autoDestroy && (r.finished || r.writable === !1))) && t.destroy();
      }
    }
  }
  function Om(e) {
    e.writable && !e.writableEnded && !e.destroyed && e.end();
  }
  L.from = function (e, t) {
    return pm(L, e, t);
  };
  var fo;
  function tc() {
    return fo === void 0 && (fo = {}), fo;
  }
  L.fromWeb = function (e, t) {
    return tc().newStreamReadableFromReadableStream(e, t);
  };
  L.toWeb = function (e, t) {
    return tc().newReadableStreamFromStreamReadable(e, t);
  };
  L.wrap = function (e, t) {
    var r, n;
    return new L({
      objectMode:
        (r = (n = e.readableObjectMode) !== null && n !== void 0 ? n : e.objectMode) !== null && r !== void 0 ? r : !0,
      ...t,
      destroy(i, o) {
        Rt.destroyer(e, i), o(i);
      },
    }).wrap(e);
  };
});
var _o = _((JO, bc) => {
  var it = X(),
    {
      ArrayPrototypeSlice: oc,
      Error: Lm,
      FunctionPrototypeSymbolHasInstance: lc,
      ObjectDefineProperty: sc,
      ObjectDefineProperties: xm,
      ObjectSetPrototypeOf: uc,
      StringPrototypeToLowerCase: Mm,
      Symbol: vm,
      SymbolHasInstance: Im,
    } = G();
  bc.exports = k;
  k.WritableState = er;
  var { EventEmitter: Dm } = require('events'),
    Zt = Yr().Stream,
    { Buffer: en } = require('buffer'),
    nn = rt(),
    { addAbortSignal: Nm } = Jt(),
    { getHighWaterMark: Pm, getDefaultHighWaterMark: qm } = Xr(),
    {
      ERR_INVALID_ARG_TYPE: Cm,
      ERR_METHOD_NOT_IMPLEMENTED: Wm,
      ERR_MULTIPLE_CALLBACK: fc,
      ERR_STREAM_CANNOT_PIPE: km,
      ERR_STREAM_DESTROYED: Qt,
      ERR_STREAM_ALREADY_FINISHED: jm,
      ERR_STREAM_NULL_VALUES: Bm,
      ERR_STREAM_WRITE_AFTER_END: Fm,
      ERR_UNKNOWN_ENCODING: ac,
    } = Z().codes,
    { errorOrDestroy: At } = nn;
  uc(k.prototype, Zt.prototype);
  uc(k, Zt);
  function bo() {}
  var Tt = vm('kOnFinished');
  function er(e, t, r) {
    typeof r != 'boolean' && (r = t instanceof me()),
      (this.objectMode = !!(e && e.objectMode)),
      r && (this.objectMode = this.objectMode || !!(e && e.writableObjectMode)),
      (this.highWaterMark = e ? Pm(this, e, 'writableHighWaterMark', r) : qm(!1)),
      (this.finalCalled = !1),
      (this.needDrain = !1),
      (this.ending = !1),
      (this.ended = !1),
      (this.finished = !1),
      (this.destroyed = !1);
    let n = !!(e && e.decodeStrings === !1);
    (this.decodeStrings = !n),
      (this.defaultEncoding = (e && e.defaultEncoding) || 'utf8'),
      (this.length = 0),
      (this.writing = !1),
      (this.corked = 0),
      (this.sync = !0),
      (this.bufferProcessing = !1),
      (this.onwrite = Um.bind(void 0, t)),
      (this.writecb = null),
      (this.writelen = 0),
      (this.afterWriteTickInfo = null),
      rn(this),
      (this.pendingcb = 0),
      (this.constructed = !0),
      (this.prefinished = !1),
      (this.errorEmitted = !1),
      (this.emitClose = !e || e.emitClose !== !1),
      (this.autoDestroy = !e || e.autoDestroy !== !1),
      (this.errored = null),
      (this.closed = !1),
      (this.closeEmitted = !1),
      (this[Tt] = []);
  }
  function rn(e) {
    (e.buffered = []), (e.bufferedIndex = 0), (e.allBuffers = !0), (e.allNoop = !0);
  }
  er.prototype.getBuffer = function () {
    return oc(this.buffered, this.bufferedIndex);
  };
  sc(er.prototype, 'bufferedRequestCount', {
    __proto__: null,
    get() {
      return this.buffered.length - this.bufferedIndex;
    },
  });
  function k(e) {
    let t = this instanceof me();
    if (!t && !lc(k, this)) return new k(e);
    (this._writableState = new er(e, this, t)),
      e &&
        (typeof e.write == 'function' && (this._write = e.write),
        typeof e.writev == 'function' && (this._writev = e.writev),
        typeof e.destroy == 'function' && (this._destroy = e.destroy),
        typeof e.final == 'function' && (this._final = e.final),
        typeof e.construct == 'function' && (this._construct = e.construct),
        e.signal && Nm(e.signal, this)),
      Zt.call(this, e),
      nn.construct(this, () => {
        let r = this._writableState;
        r.writing || yo(this, r), go(this, r);
      });
  }
  sc(k, Im, {
    __proto__: null,
    value: function (e) {
      return lc(this, e) ? !0 : this !== k ? !1 : e && e._writableState instanceof er;
    },
  });
  k.prototype.pipe = function () {
    At(this, new km());
  };
  function cc(e, t, r, n) {
    let i = e._writableState;
    if (typeof r == 'function') (n = r), (r = i.defaultEncoding);
    else {
      if (!r) r = i.defaultEncoding;
      else if (r !== 'buffer' && !en.isEncoding(r)) throw new ac(r);
      typeof n != 'function' && (n = bo);
    }
    if (t === null) throw new Bm();
    if (!i.objectMode)
      if (typeof t == 'string') i.decodeStrings !== !1 && ((t = en.from(t, r)), (r = 'buffer'));
      else if (t instanceof en) r = 'buffer';
      else if (Zt._isUint8Array(t)) (t = Zt._uint8ArrayToBuffer(t)), (r = 'buffer');
      else throw new Cm('chunk', ['string', 'Buffer', 'Uint8Array'], t);
    let o;
    return (
      i.ending ? (o = new Fm()) : i.destroyed && (o = new Qt('write')),
      o ? (it.nextTick(n, o), At(e, o, !0), o) : (i.pendingcb++, $m(e, i, t, r, n))
    );
  }
  k.prototype.write = function (e, t, r) {
    return cc(this, e, t, r) === !0;
  };
  k.prototype.cork = function () {
    this._writableState.corked++;
  };
  k.prototype.uncork = function () {
    let e = this._writableState;
    e.corked && (e.corked--, e.writing || yo(this, e));
  };
  k.prototype.setDefaultEncoding = function (t) {
    if ((typeof t == 'string' && (t = Mm(t)), !en.isEncoding(t))) throw new ac(t);
    return (this._writableState.defaultEncoding = t), this;
  };
  function $m(e, t, r, n, i) {
    let o = t.objectMode ? 1 : r.length;
    t.length += o;
    let l = t.length < t.highWaterMark;
    return (
      l || (t.needDrain = !0),
      t.writing || t.corked || t.errored || !t.constructed
        ? (t.buffered.push({ chunk: r, encoding: n, callback: i }),
          t.allBuffers && n !== 'buffer' && (t.allBuffers = !1),
          t.allNoop && i !== bo && (t.allNoop = !1))
        : ((t.writelen = o),
          (t.writecb = i),
          (t.writing = !0),
          (t.sync = !0),
          e._write(r, n, t.onwrite),
          (t.sync = !1)),
      l && !t.errored && !t.destroyed
    );
  }
  function nc(e, t, r, n, i, o, l) {
    (t.writelen = n),
      (t.writecb = l),
      (t.writing = !0),
      (t.sync = !0),
      t.destroyed ? t.onwrite(new Qt('write')) : r ? e._writev(i, t.onwrite) : e._write(i, o, t.onwrite),
      (t.sync = !1);
  }
  function ic(e, t, r, n) {
    --t.pendingcb, n(r), po(t), At(e, r);
  }
  function Um(e, t) {
    let r = e._writableState,
      n = r.sync,
      i = r.writecb;
    if (typeof i != 'function') {
      At(e, new fc());
      return;
    }
    (r.writing = !1),
      (r.writecb = null),
      (r.length -= r.writelen),
      (r.writelen = 0),
      t
        ? (t.stack,
          r.errored || (r.errored = t),
          e._readableState && !e._readableState.errored && (e._readableState.errored = t),
          n ? it.nextTick(ic, e, r, t, i) : ic(e, r, t, i))
        : (r.buffered.length > r.bufferedIndex && yo(e, r),
          n
            ? r.afterWriteTickInfo !== null && r.afterWriteTickInfo.cb === i
              ? r.afterWriteTickInfo.count++
              : ((r.afterWriteTickInfo = { count: 1, cb: i, stream: e, state: r }),
                it.nextTick(Gm, r.afterWriteTickInfo))
            : dc(e, r, 1, i));
  }
  function Gm({ stream: e, state: t, count: r, cb: n }) {
    return (t.afterWriteTickInfo = null), dc(e, t, r, n);
  }
  function dc(e, t, r, n) {
    for (!t.ending && !e.destroyed && t.length === 0 && t.needDrain && ((t.needDrain = !1), e.emit('drain')); r-- > 0; )
      t.pendingcb--, n();
    t.destroyed && po(t), go(e, t);
  }
  function po(e) {
    if (e.writing) return;
    for (let i = e.bufferedIndex; i < e.buffered.length; ++i) {
      var t;
      let { chunk: o, callback: l } = e.buffered[i],
        s = e.objectMode ? 1 : o.length;
      (e.length -= s), l((t = e.errored) !== null && t !== void 0 ? t : new Qt('write'));
    }
    let r = e[Tt].splice(0);
    for (let i = 0; i < r.length; i++) {
      var n;
      r[i]((n = e.errored) !== null && n !== void 0 ? n : new Qt('end'));
    }
    rn(e);
  }
  function yo(e, t) {
    if (t.corked || t.bufferProcessing || t.destroyed || !t.constructed) return;
    let { buffered: r, bufferedIndex: n, objectMode: i } = t,
      o = r.length - n;
    if (!o) return;
    let l = n;
    if (((t.bufferProcessing = !0), o > 1 && e._writev)) {
      t.pendingcb -= o - 1;
      let s = t.allNoop
          ? bo
          : (u) => {
              for (let c = l; c < r.length; ++c) r[c].callback(u);
            },
        f = t.allNoop && l === 0 ? r : oc(r, l);
      (f.allBuffers = t.allBuffers), nc(e, t, !0, t.length, f, '', s), rn(t);
    } else {
      do {
        let { chunk: s, encoding: f, callback: u } = r[l];
        r[l++] = null;
        let c = i ? 1 : s.length;
        nc(e, t, !1, c, s, f, u);
      } while (l < r.length && !t.writing);
      l === r.length ? rn(t) : l > 256 ? (r.splice(0, l), (t.bufferedIndex = 0)) : (t.bufferedIndex = l);
    }
    t.bufferProcessing = !1;
  }
  k.prototype._write = function (e, t, r) {
    if (this._writev) this._writev([{ chunk: e, encoding: t }], r);
    else throw new Wm('_write()');
  };
  k.prototype._writev = null;
  k.prototype.end = function (e, t, r) {
    let n = this._writableState;
    typeof e == 'function' ? ((r = e), (e = null), (t = null)) : typeof t == 'function' && ((r = t), (t = null));
    let i;
    if (e != null) {
      let o = cc(this, e, t);
      o instanceof Lm && (i = o);
    }
    return (
      n.corked && ((n.corked = 1), this.uncork()),
      i ||
        (!n.errored && !n.ending
          ? ((n.ending = !0), go(this, n, !0), (n.ended = !0))
          : n.finished
          ? (i = new jm('end'))
          : n.destroyed && (i = new Qt('end'))),
      typeof r == 'function' && (i || n.finished ? it.nextTick(r, i) : n[Tt].push(r)),
      this
    );
  };
  function tn(e) {
    return (
      e.ending &&
      !e.destroyed &&
      e.constructed &&
      e.length === 0 &&
      !e.errored &&
      e.buffered.length === 0 &&
      !e.finished &&
      !e.writing &&
      !e.errorEmitted &&
      !e.closeEmitted
    );
  }
  function Hm(e, t) {
    let r = !1;
    function n(i) {
      if (r) {
        At(e, i ?? fc());
        return;
      }
      if (((r = !0), t.pendingcb--, i)) {
        let o = t[Tt].splice(0);
        for (let l = 0; l < o.length; l++) o[l](i);
        At(e, i, t.sync);
      } else tn(t) && ((t.prefinished = !0), e.emit('prefinish'), t.pendingcb++, it.nextTick(ho, e, t));
    }
    (t.sync = !0), t.pendingcb++;
    try {
      e._final(n);
    } catch (i) {
      n(i);
    }
    t.sync = !1;
  }
  function Vm(e, t) {
    !t.prefinished &&
      !t.finalCalled &&
      (typeof e._final == 'function' && !t.destroyed
        ? ((t.finalCalled = !0), Hm(e, t))
        : ((t.prefinished = !0), e.emit('prefinish')));
  }
  function go(e, t, r) {
    tn(t) &&
      (Vm(e, t),
      t.pendingcb === 0 &&
        (r
          ? (t.pendingcb++,
            it.nextTick(
              (n, i) => {
                tn(i) ? ho(n, i) : i.pendingcb--;
              },
              e,
              t
            ))
          : tn(t) && (t.pendingcb++, ho(e, t))));
  }
  function ho(e, t) {
    t.pendingcb--, (t.finished = !0);
    let r = t[Tt].splice(0);
    for (let n = 0; n < r.length; n++) r[n]();
    if ((e.emit('finish'), t.autoDestroy)) {
      let n = e._readableState;
      (!n || (n.autoDestroy && (n.endEmitted || n.readable === !1))) && e.destroy();
    }
  }
  xm(k.prototype, {
    closed: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.closed : !1;
      },
    },
    destroyed: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.destroyed : !1;
      },
      set(e) {
        this._writableState && (this._writableState.destroyed = e);
      },
    },
    writable: {
      __proto__: null,
      get() {
        let e = this._writableState;
        return !!e && e.writable !== !1 && !e.destroyed && !e.errored && !e.ending && !e.ended;
      },
      set(e) {
        this._writableState && (this._writableState.writable = !!e);
      },
    },
    writableFinished: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.finished : !1;
      },
    },
    writableObjectMode: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.objectMode : !1;
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
        return this._writableState ? this._writableState.ending : !1;
      },
    },
    writableNeedDrain: {
      __proto__: null,
      get() {
        let e = this._writableState;
        return e ? !e.destroyed && !e.ending && e.needDrain : !1;
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
      enumerable: !1,
      get() {
        return this._writableState ? this._writableState.errored : null;
      },
    },
    writableAborted: {
      __proto__: null,
      enumerable: !1,
      get: function () {
        return !!(
          this._writableState.writable !== !1 &&
          (this._writableState.destroyed || this._writableState.errored) &&
          !this._writableState.finished
        );
      },
    },
  });
  var Km = nn.destroy;
  k.prototype.destroy = function (e, t) {
    let r = this._writableState;
    return (
      !r.destroyed && (r.bufferedIndex < r.buffered.length || r[Tt].length) && it.nextTick(po, r),
      Km.call(this, e, t),
      this
    );
  };
  k.prototype._undestroy = nn.undestroy;
  k.prototype._destroy = function (e, t) {
    t(e);
  };
  k.prototype[Dm.captureRejectionSymbol] = function (e) {
    this.destroy(e);
  };
  var co;
  function hc() {
    return co === void 0 && (co = {}), co;
  }
  k.fromWeb = function (e, t) {
    return hc().newStreamWritableFromWritableStream(e, t);
  };
  k.toWeb = function (e) {
    return hc().newWritableStreamFromStreamWritable(e);
  };
});
var Oc = _((XO, Tc) => {
  var wo = X(),
    Ym = require('buffer'),
    {
      isReadable: zm,
      isWritable: Jm,
      isIterable: pc,
      isNodeStream: Xm,
      isReadableNodeStream: yc,
      isWritableNodeStream: gc,
      isDuplexNodeStream: Zm,
    } = Se(),
    _c = xe(),
    {
      AbortError: Ac,
      codes: { ERR_INVALID_ARG_TYPE: Qm, ERR_INVALID_RETURN_VALUE: wc },
    } = Z(),
    { destroyer: Ot } = rt(),
    eR = me(),
    tR = Xt(),
    { createDeferredPromise: Sc } = _e(),
    Ec = io(),
    mc = globalThis.Blob || Ym.Blob,
    rR =
      typeof mc < 'u'
        ? function (t) {
            return t instanceof mc;
          }
        : function (t) {
            return !1;
          },
    nR = globalThis.AbortController || Ue().AbortController,
    { FunctionPrototypeCall: Rc } = G(),
    ot = class extends eR {
      constructor(t) {
        super(t),
          t?.readable === !1 &&
            ((this._readableState.readable = !1),
            (this._readableState.ended = !0),
            (this._readableState.endEmitted = !0)),
          t?.writable === !1 &&
            ((this._writableState.writable = !1),
            (this._writableState.ending = !0),
            (this._writableState.ended = !0),
            (this._writableState.finished = !0));
      }
    };
  Tc.exports = function e(t, r) {
    if (Zm(t)) return t;
    if (yc(t)) return on({ readable: t });
    if (gc(t)) return on({ writable: t });
    if (Xm(t)) return on({ writable: !1, readable: !1 });
    if (typeof t == 'function') {
      let { value: i, write: o, final: l, destroy: s } = iR(t);
      if (pc(i)) return Ec(ot, i, { objectMode: !0, write: o, final: l, destroy: s });
      let f = i?.then;
      if (typeof f == 'function') {
        let u,
          c = Rc(
            f,
            i,
            (a) => {
              if (a != null) throw new wc('nully', 'body', a);
            },
            (a) => {
              Ot(u, a);
            }
          );
        return (u = new ot({
          objectMode: !0,
          readable: !1,
          write: o,
          final(a) {
            l(async () => {
              try {
                await c, wo.nextTick(a, null);
              } catch (b) {
                wo.nextTick(a, b);
              }
            });
          },
          destroy: s,
        }));
      }
      throw new wc('Iterable, AsyncIterable or AsyncFunction', r, i);
    }
    if (rR(t)) return e(t.arrayBuffer());
    if (pc(t)) return Ec(ot, t, { objectMode: !0, writable: !1 });
    if (typeof t?.writable == 'object' || typeof t?.readable == 'object') {
      let i = t != null && t.readable ? (yc(t?.readable) ? t?.readable : e(t.readable)) : void 0,
        o = t != null && t.writable ? (gc(t?.writable) ? t?.writable : e(t.writable)) : void 0;
      return on({ readable: i, writable: o });
    }
    let n = t?.then;
    if (typeof n == 'function') {
      let i;
      return (
        Rc(
          n,
          t,
          (o) => {
            o != null && i.push(o), i.push(null);
          },
          (o) => {
            Ot(i, o);
          }
        ),
        (i = new ot({ objectMode: !0, writable: !1, read() {} }))
      );
    }
    throw new Qm(
      r,
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
      t
    );
  };
  function iR(e) {
    let { promise: t, resolve: r } = Sc(),
      n = new nR(),
      i = n.signal;
    return {
      value: e(
        (async function* () {
          for (;;) {
            let l = t;
            t = null;
            let { chunk: s, done: f, cb: u } = await l;
            if ((wo.nextTick(u), f)) return;
            if (i.aborted) throw new Ac(void 0, { cause: i.reason });
            ({ promise: t, resolve: r } = Sc()), yield s;
          }
        })(),
        { signal: i }
      ),
      write(l, s, f) {
        let u = r;
        (r = null), u({ chunk: l, done: !1, cb: f });
      },
      final(l) {
        let s = r;
        (r = null), s({ done: !0, cb: l });
      },
      destroy(l, s) {
        n.abort(), s(l);
      },
    };
  }
  function on(e) {
    let t = e.readable && typeof e.readable.read != 'function' ? tR.wrap(e.readable) : e.readable,
      r = e.writable,
      n = !!zm(t),
      i = !!Jm(r),
      o,
      l,
      s,
      f,
      u;
    function c(a) {
      let b = f;
      (f = null), b ? b(a) : a && u.destroy(a);
    }
    return (
      (u = new ot({
        readableObjectMode: !!(t != null && t.readableObjectMode),
        writableObjectMode: !!(r != null && r.writableObjectMode),
        readable: n,
        writable: i,
      })),
      i &&
        (_c(r, (a) => {
          (i = !1), a && Ot(t, a), c(a);
        }),
        (u._write = function (a, b, h) {
          r.write(a, b) ? h() : (o = h);
        }),
        (u._final = function (a) {
          r.end(), (l = a);
        }),
        r.on('drain', function () {
          if (o) {
            let a = o;
            (o = null), a();
          }
        }),
        r.on('finish', function () {
          if (l) {
            let a = l;
            (l = null), a();
          }
        })),
      n &&
        (_c(t, (a) => {
          (n = !1), a && Ot(t, a), c(a);
        }),
        t.on('readable', function () {
          if (s) {
            let a = s;
            (s = null), a();
          }
        }),
        t.on('end', function () {
          u.push(null);
        }),
        (u._read = function () {
          for (;;) {
            let a = t.read();
            if (a === null) {
              s = u._read;
              return;
            }
            if (!u.push(a)) return;
          }
        })),
      (u._destroy = function (a, b) {
        !a && f !== null && (a = new Ac()),
          (s = null),
          (o = null),
          (l = null),
          f === null ? b(a) : ((f = b), Ot(r, a), Ot(t, a));
      }),
      u
    );
  }
});
var me = _((ZO, Mc) => {
  'use strict';
  var {
    ObjectDefineProperties: oR,
    ObjectGetOwnPropertyDescriptor: Me,
    ObjectKeys: lR,
    ObjectSetPrototypeOf: Lc,
  } = G();
  Mc.exports = ae;
  var mo = Xt(),
    oe = _o();
  Lc(ae.prototype, mo.prototype);
  Lc(ae, mo);
  {
    let e = lR(oe.prototype);
    for (let t = 0; t < e.length; t++) {
      let r = e[t];
      ae.prototype[r] || (ae.prototype[r] = oe.prototype[r]);
    }
  }
  function ae(e) {
    if (!(this instanceof ae)) return new ae(e);
    mo.call(this, e),
      oe.call(this, e),
      e
        ? ((this.allowHalfOpen = e.allowHalfOpen !== !1),
          e.readable === !1 &&
            ((this._readableState.readable = !1),
            (this._readableState.ended = !0),
            (this._readableState.endEmitted = !0)),
          e.writable === !1 &&
            ((this._writableState.writable = !1),
            (this._writableState.ending = !0),
            (this._writableState.ended = !0),
            (this._writableState.finished = !0)))
        : (this.allowHalfOpen = !0);
  }
  oR(ae.prototype, {
    writable: { __proto__: null, ...Me(oe.prototype, 'writable') },
    writableHighWaterMark: { __proto__: null, ...Me(oe.prototype, 'writableHighWaterMark') },
    writableObjectMode: { __proto__: null, ...Me(oe.prototype, 'writableObjectMode') },
    writableBuffer: { __proto__: null, ...Me(oe.prototype, 'writableBuffer') },
    writableLength: { __proto__: null, ...Me(oe.prototype, 'writableLength') },
    writableFinished: { __proto__: null, ...Me(oe.prototype, 'writableFinished') },
    writableCorked: { __proto__: null, ...Me(oe.prototype, 'writableCorked') },
    writableEnded: { __proto__: null, ...Me(oe.prototype, 'writableEnded') },
    writableNeedDrain: { __proto__: null, ...Me(oe.prototype, 'writableNeedDrain') },
    destroyed: {
      __proto__: null,
      get() {
        return this._readableState === void 0 || this._writableState === void 0
          ? !1
          : this._readableState.destroyed && this._writableState.destroyed;
      },
      set(e) {
        this._readableState &&
          this._writableState &&
          ((this._readableState.destroyed = e), (this._writableState.destroyed = e));
      },
    },
  });
  var So;
  function xc() {
    return So === void 0 && (So = {}), So;
  }
  ae.fromWeb = function (e, t) {
    return xc().newStreamDuplexFromReadableWritablePair(e, t);
  };
  ae.toWeb = function (e) {
    return xc().newReadableWritablePairFromDuplex(e);
  };
  var Eo;
  ae.from = function (e) {
    return Eo || (Eo = Oc()), Eo(e, 'body');
  };
});
var To = _((QO, Ic) => {
  'use strict';
  var { ObjectSetPrototypeOf: vc, Symbol: sR } = G();
  Ic.exports = ve;
  var { ERR_METHOD_NOT_IMPLEMENTED: uR } = Z().codes,
    Ao = me(),
    { getHighWaterMark: fR } = Xr();
  vc(ve.prototype, Ao.prototype);
  vc(ve, Ao);
  var tr = sR('kCallback');
  function ve(e) {
    if (!(this instanceof ve)) return new ve(e);
    let t = e ? fR(this, e, 'readableHighWaterMark', !0) : null;
    t === 0 &&
      (e = {
        ...e,
        highWaterMark: null,
        readableHighWaterMark: t,
        writableHighWaterMark: e.writableHighWaterMark || 0,
      }),
      Ao.call(this, e),
      (this._readableState.sync = !1),
      (this[tr] = null),
      e &&
        (typeof e.transform == 'function' && (this._transform = e.transform),
        typeof e.flush == 'function' && (this._flush = e.flush)),
      this.on('prefinish', aR);
  }
  function Ro(e) {
    typeof this._flush == 'function' && !this.destroyed
      ? this._flush((t, r) => {
          if (t) {
            e ? e(t) : this.destroy(t);
            return;
          }
          r != null && this.push(r), this.push(null), e && e();
        })
      : (this.push(null), e && e());
  }
  function aR() {
    this._final !== Ro && Ro.call(this);
  }
  ve.prototype._final = Ro;
  ve.prototype._transform = function (e, t, r) {
    throw new uR('_transform()');
  };
  ve.prototype._write = function (e, t, r) {
    let n = this._readableState,
      i = this._writableState,
      o = n.length;
    this._transform(e, t, (l, s) => {
      if (l) {
        r(l);
        return;
      }
      s != null && this.push(s), i.ended || o === n.length || n.length < n.highWaterMark ? r() : (this[tr] = r);
    });
  };
  ve.prototype._read = function () {
    if (this[tr]) {
      let e = this[tr];
      (this[tr] = null), e();
    }
  };
});
var Lo = _((eL, Nc) => {
  'use strict';
  var { ObjectSetPrototypeOf: Dc } = G();
  Nc.exports = Lt;
  var Oo = To();
  Dc(Lt.prototype, Oo.prototype);
  Dc(Lt, Oo);
  function Lt(e) {
    if (!(this instanceof Lt)) return new Lt(e);
    Oo.call(this, e);
  }
  Lt.prototype._transform = function (e, t, r) {
    r(null, e);
  };
});
var fn = _((tL, kc) => {
  var rr = X(),
    { ArrayIsArray: cR, Promise: dR, SymbolAsyncIterator: hR } = G(),
    un = xe(),
    { once: bR } = _e(),
    pR = rt(),
    Pc = me(),
    {
      aggregateTwoErrors: yR,
      codes: {
        ERR_INVALID_ARG_TYPE: qo,
        ERR_INVALID_RETURN_VALUE: xo,
        ERR_MISSING_ARGS: gR,
        ERR_STREAM_DESTROYED: _R,
        ERR_STREAM_PREMATURE_CLOSE: wR,
      },
      AbortError: SR,
    } = Z(),
    { validateFunction: ER, validateAbortSignal: mR } = zt(),
    {
      isIterable: lt,
      isReadable: Mo,
      isReadableNodeStream: sn,
      isNodeStream: qc,
      isTransformStream: xt,
      isWebStream: RR,
      isReadableStream: vo,
      isReadableEnded: AR,
    } = Se(),
    TR = globalThis.AbortController || Ue().AbortController,
    Io,
    Do;
  function Cc(e, t, r) {
    let n = !1;
    e.on('close', () => {
      n = !0;
    });
    let i = un(e, { readable: t, writable: r }, (o) => {
      n = !o;
    });
    return {
      destroy: (o) => {
        n || ((n = !0), pR.destroyer(e, o || new _R('pipe')));
      },
      cleanup: i,
    };
  }
  function OR(e) {
    return ER(e[e.length - 1], 'streams[stream.length - 1]'), e.pop();
  }
  function No(e) {
    if (lt(e)) return e;
    if (sn(e)) return LR(e);
    throw new qo('val', ['Readable', 'Iterable', 'AsyncIterable'], e);
  }
  async function* LR(e) {
    Do || (Do = Xt()), yield* Do.prototype[hR].call(e);
  }
  async function ln(e, t, r, { end: n }) {
    let i,
      o = null,
      l = (u) => {
        if ((u && (i = u), o)) {
          let c = o;
          (o = null), c();
        }
      },
      s = () =>
        new dR((u, c) => {
          i
            ? c(i)
            : (o = () => {
                i ? c(i) : u();
              });
        });
    t.on('drain', l);
    let f = un(t, { readable: !1 }, l);
    try {
      t.writableNeedDrain && (await s());
      for await (let u of e) t.write(u) || (await s());
      n && t.end(), await s(), r();
    } catch (u) {
      r(i !== u ? yR(i, u) : u);
    } finally {
      f(), t.off('drain', l);
    }
  }
  async function Po(e, t, r, { end: n }) {
    xt(t) && (t = t.writable);
    let i = t.getWriter();
    try {
      for await (let o of e) await i.ready, i.write(o).catch(() => {});
      await i.ready, n && (await i.close()), r();
    } catch (o) {
      try {
        await i.abort(o), r(o);
      } catch (l) {
        r(l);
      }
    }
  }
  function xR(...e) {
    return Wc(e, bR(OR(e)));
  }
  function Wc(e, t, r) {
    if ((e.length === 1 && cR(e[0]) && (e = e[0]), e.length < 2)) throw new gR('streams');
    let n = new TR(),
      i = n.signal,
      o = r?.signal,
      l = [];
    mR(o, 'options.signal');
    function s() {
      h(new SR());
    }
    o?.addEventListener('abort', s);
    let f,
      u,
      c = [],
      a = 0;
    function b(g) {
      h(g, --a === 0);
    }
    function h(g, p) {
      if ((g && (!f || f.code === 'ERR_STREAM_PREMATURE_CLOSE') && (f = g), !(!f && !p))) {
        for (; c.length; ) c.shift()(f);
        o?.removeEventListener('abort', s), n.abort(), p && (f || l.forEach((A) => A()), rr.nextTick(t, f, u));
      }
    }
    let d;
    for (let g = 0; g < e.length; g++) {
      let p = e[g],
        A = g < e.length - 1,
        m = g > 0,
        v = A || r?.end !== !1,
        j = g === e.length - 1;
      if (qc(p)) {
        let I = function (P) {
          P && P.name !== 'AbortError' && P.code !== 'ERR_STREAM_PREMATURE_CLOSE' && b(P);
        };
        var w = I;
        if (v) {
          let { destroy: P, cleanup: ee } = Cc(p, A, m);
          c.push(P), Mo(p) && j && l.push(ee);
        }
        p.on('error', I),
          Mo(p) &&
            j &&
            l.push(() => {
              p.removeListener('error', I);
            });
      }
      if (g === 0)
        if (typeof p == 'function') {
          if (((d = p({ signal: i })), !lt(d))) throw new xo('Iterable, AsyncIterable or Stream', 'source', d);
        } else lt(p) || sn(p) || xt(p) ? (d = p) : (d = Pc.from(p));
      else if (typeof p == 'function') {
        if (xt(d)) {
          var S;
          d = No((S = d) === null || S === void 0 ? void 0 : S.readable);
        } else d = No(d);
        if (((d = p(d, { signal: i })), A)) {
          if (!lt(d, !0)) throw new xo('AsyncIterable', `transform[${g - 1}]`, d);
        } else {
          var y;
          Io || (Io = Lo());
          let I = new Io({ objectMode: !0 }),
            P = (y = d) === null || y === void 0 ? void 0 : y.then;
          if (typeof P == 'function')
            a++,
              P.call(
                d,
                (C) => {
                  (u = C), C != null && I.write(C), v && I.end(), rr.nextTick(b);
                },
                (C) => {
                  I.destroy(C), rr.nextTick(b, C);
                }
              );
          else if (lt(d, !0)) a++, ln(d, I, b, { end: v });
          else if (vo(d) || xt(d)) {
            let C = d.readable || d;
            a++, ln(C, I, b, { end: v });
          } else throw new xo('AsyncIterable or Promise', 'destination', d);
          d = I;
          let { destroy: ee, cleanup: te } = Cc(d, !1, !0);
          c.push(ee), j && l.push(te);
        }
      } else if (qc(p)) {
        if (sn(d)) {
          a += 2;
          let I = MR(d, p, b, { end: v });
          Mo(p) && j && l.push(I);
        } else if (xt(d) || vo(d)) {
          let I = d.readable || d;
          a++, ln(I, p, b, { end: v });
        } else if (lt(d)) a++, ln(d, p, b, { end: v });
        else throw new qo('val', ['Readable', 'Iterable', 'AsyncIterable', 'ReadableStream', 'TransformStream'], d);
        d = p;
      } else if (RR(p)) {
        if (sn(d)) a++, Po(No(d), p, b, { end: v });
        else if (vo(d) || lt(d)) a++, Po(d, p, b, { end: v });
        else if (xt(d)) a++, Po(d.readable, p, b, { end: v });
        else throw new qo('val', ['Readable', 'Iterable', 'AsyncIterable', 'ReadableStream', 'TransformStream'], d);
        d = p;
      } else d = Pc.from(p);
    }
    return ((i != null && i.aborted) || (o != null && o.aborted)) && rr.nextTick(s), d;
  }
  function MR(e, t, r, { end: n }) {
    let i = !1;
    if (
      (t.on('close', () => {
        i || r(new wR());
      }),
      e.pipe(t, { end: !1 }),
      n)
    ) {
      let l = function () {
        (i = !0), t.end();
      };
      var o = l;
      AR(e) ? rr.nextTick(l) : e.once('end', l);
    } else r();
    return (
      un(e, { readable: !0, writable: !1 }, (l) => {
        let s = e._readableState;
        l && l.code === 'ERR_STREAM_PREMATURE_CLOSE' && s && s.ended && !s.errored && !s.errorEmitted
          ? e.once('end', r).once('error', r)
          : r(l);
      }),
      un(t, { readable: !1, writable: !0 }, r)
    );
  }
  kc.exports = { pipelineImpl: Wc, pipeline: xR };
});
var Wo = _((rL, Gc) => {
  'use strict';
  var { pipeline: vR } = fn(),
    an = me(),
    { destroyer: IR } = rt(),
    {
      isNodeStream: cn,
      isReadable: jc,
      isWritable: Bc,
      isWebStream: Co,
      isTransformStream: st,
      isWritableStream: Fc,
      isReadableStream: $c,
    } = Se(),
    {
      AbortError: DR,
      codes: { ERR_INVALID_ARG_VALUE: Uc, ERR_MISSING_ARGS: NR },
    } = Z(),
    PR = xe();
  Gc.exports = function (...t) {
    if (t.length === 0) throw new NR('streams');
    if (t.length === 1) return an.from(t[0]);
    let r = [...t];
    if ((typeof t[0] == 'function' && (t[0] = an.from(t[0])), typeof t[t.length - 1] == 'function')) {
      let h = t.length - 1;
      t[h] = an.from(t[h]);
    }
    for (let h = 0; h < t.length; ++h)
      if (!(!cn(t[h]) && !Co(t[h]))) {
        if (h < t.length - 1 && !(jc(t[h]) || $c(t[h]) || st(t[h])))
          throw new Uc(`streams[${h}]`, r[h], 'must be readable');
        if (h > 0 && !(Bc(t[h]) || Fc(t[h]) || st(t[h]))) throw new Uc(`streams[${h}]`, r[h], 'must be writable');
      }
    let n, i, o, l, s;
    function f(h) {
      let d = l;
      (l = null), d ? d(h) : h ? s.destroy(h) : !b && !a && s.destroy();
    }
    let u = t[0],
      c = vR(t, f),
      a = !!(Bc(u) || Fc(u) || st(u)),
      b = !!(jc(c) || $c(c) || st(c));
    if (
      ((s = new an({
        writableObjectMode: !!(u != null && u.writableObjectMode),
        readableObjectMode: !!(c != null && c.writableObjectMode),
        writable: a,
        readable: b,
      })),
      a)
    ) {
      if (cn(u))
        (s._write = function (d, S, y) {
          u.write(d, S) ? y() : (n = y);
        }),
          (s._final = function (d) {
            u.end(), (i = d);
          }),
          u.on('drain', function () {
            if (n) {
              let d = n;
              (n = null), d();
            }
          });
      else if (Co(u)) {
        let S = (st(u) ? u.writable : u).getWriter();
        (s._write = async function (y, w, g) {
          try {
            await S.ready, S.write(y).catch(() => {}), g();
          } catch (p) {
            g(p);
          }
        }),
          (s._final = async function (y) {
            try {
              await S.ready, S.close().catch(() => {}), (i = y);
            } catch (w) {
              y(w);
            }
          });
      }
      let h = st(c) ? c.readable : c;
      PR(h, () => {
        if (i) {
          let d = i;
          (i = null), d();
        }
      });
    }
    if (b) {
      if (cn(c))
        c.on('readable', function () {
          if (o) {
            let h = o;
            (o = null), h();
          }
        }),
          c.on('end', function () {
            s.push(null);
          }),
          (s._read = function () {
            for (;;) {
              let h = c.read();
              if (h === null) {
                o = s._read;
                return;
              }
              if (!s.push(h)) return;
            }
          });
      else if (Co(c)) {
        let d = (st(c) ? c.readable : c).getReader();
        s._read = async function () {
          for (;;)
            try {
              let { value: S, done: y } = await d.read();
              if (!s.push(S)) return;
              if (y) {
                s.push(null);
                return;
              }
            } catch {
              return;
            }
        };
      }
    }
    return (
      (s._destroy = function (h, d) {
        !h && l !== null && (h = new DR()),
          (o = null),
          (n = null),
          (i = null),
          l === null ? d(h) : ((l = d), cn(c) && IR(c, h));
      }),
      s
    );
  };
});
var Zc = _((nL, Bo) => {
  'use strict';
  var Yc = globalThis.AbortController || Ue().AbortController,
    {
      codes: { ERR_INVALID_ARG_VALUE: qR, ERR_INVALID_ARG_TYPE: nr, ERR_MISSING_ARGS: CR, ERR_OUT_OF_RANGE: WR },
      AbortError: Re,
    } = Z(),
    { validateAbortSignal: ut, validateInteger: kR, validateObject: ft } = zt(),
    jR = G().Symbol('kWeak'),
    { finished: BR } = xe(),
    FR = Wo(),
    { addAbortSignalNoValidate: $R } = Jt(),
    { isWritable: UR, isNodeStream: GR } = Se(),
    {
      ArrayPrototypePush: HR,
      MathFloor: VR,
      Number: KR,
      NumberIsNaN: YR,
      Promise: Hc,
      PromiseReject: Vc,
      PromisePrototypeThen: zR,
      Symbol: zc,
    } = G(),
    dn = zc('kEmpty'),
    Kc = zc('kEof');
  function JR(e, t) {
    if ((t != null && ft(t, 'options'), t?.signal != null && ut(t.signal, 'options.signal'), GR(e) && !UR(e)))
      throw new qR('stream', e, 'must be writable');
    let r = FR(this, e);
    return t != null && t.signal && $R(t.signal, r), r;
  }
  function hn(e, t) {
    if (typeof e != 'function') throw new nr('fn', ['Function', 'AsyncFunction'], e);
    t != null && ft(t, 'options'), t?.signal != null && ut(t.signal, 'options.signal');
    let r = 1;
    return (
      t?.concurrency != null && (r = VR(t.concurrency)),
      kR(r, 'concurrency', 1),
      async function* () {
        var i, o;
        let l = new Yc(),
          s = this,
          f = [],
          u = l.signal,
          c = { signal: u },
          a = () => l.abort();
        t != null && (i = t.signal) !== null && i !== void 0 && i.aborted && a(),
          t == null || (o = t.signal) === null || o === void 0 || o.addEventListener('abort', a);
        let b,
          h,
          d = !1;
        function S() {
          d = !0;
        }
        async function y() {
          try {
            for await (let p of s) {
              var w;
              if (d) return;
              if (u.aborted) throw new Re();
              try {
                p = e(p, c);
              } catch (A) {
                p = Vc(A);
              }
              p !== dn &&
                (typeof ((w = p) === null || w === void 0 ? void 0 : w.catch) == 'function' && p.catch(S),
                f.push(p),
                b && (b(), (b = null)),
                !d &&
                  f.length &&
                  f.length >= r &&
                  (await new Hc((A) => {
                    h = A;
                  })));
            }
            f.push(Kc);
          } catch (p) {
            let A = Vc(p);
            zR(A, void 0, S), f.push(A);
          } finally {
            var g;
            (d = !0),
              b && (b(), (b = null)),
              t == null || (g = t.signal) === null || g === void 0 || g.removeEventListener('abort', a);
          }
        }
        y();
        try {
          for (;;) {
            for (; f.length > 0; ) {
              let w = await f[0];
              if (w === Kc) return;
              if (u.aborted) throw new Re();
              w !== dn && (yield w), f.shift(), h && (h(), (h = null));
            }
            await new Hc((w) => {
              b = w;
            });
          }
        } finally {
          l.abort(), (d = !0), h && (h(), (h = null));
        }
      }.call(this)
    );
  }
  function XR(e = void 0) {
    return (
      e != null && ft(e, 'options'),
      e?.signal != null && ut(e.signal, 'options.signal'),
      async function* () {
        let r = 0;
        for await (let i of this) {
          var n;
          if (e != null && (n = e.signal) !== null && n !== void 0 && n.aborted)
            throw new Re({ cause: e.signal.reason });
          yield [r++, i];
        }
      }.call(this)
    );
  }
  async function Jc(e, t = void 0) {
    for await (let r of jo.call(this, e, t)) return !0;
    return !1;
  }
  async function ZR(e, t = void 0) {
    if (typeof e != 'function') throw new nr('fn', ['Function', 'AsyncFunction'], e);
    return !(await Jc.call(this, async (...r) => !(await e(...r)), t));
  }
  async function QR(e, t) {
    for await (let r of jo.call(this, e, t)) return r;
  }
  async function eA(e, t) {
    if (typeof e != 'function') throw new nr('fn', ['Function', 'AsyncFunction'], e);
    async function r(n, i) {
      return await e(n, i), dn;
    }
    for await (let n of hn.call(this, r, t));
  }
  function jo(e, t) {
    if (typeof e != 'function') throw new nr('fn', ['Function', 'AsyncFunction'], e);
    async function r(n, i) {
      return (await e(n, i)) ? n : dn;
    }
    return hn.call(this, r, t);
  }
  var ko = class extends CR {
    constructor() {
      super('reduce'), (this.message = 'Reduce of an empty stream requires an initial value');
    }
  };
  async function tA(e, t, r) {
    var n;
    if (typeof e != 'function') throw new nr('reducer', ['Function', 'AsyncFunction'], e);
    r != null && ft(r, 'options'), r?.signal != null && ut(r.signal, 'options.signal');
    let i = arguments.length > 1;
    if (r != null && (n = r.signal) !== null && n !== void 0 && n.aborted) {
      let u = new Re(void 0, { cause: r.signal.reason });
      throw (this.once('error', () => {}), await BR(this.destroy(u)), u);
    }
    let o = new Yc(),
      l = o.signal;
    if (r != null && r.signal) {
      let u = { once: !0, [jR]: this };
      r.signal.addEventListener('abort', () => o.abort(), u);
    }
    let s = !1;
    try {
      for await (let u of this) {
        var f;
        if (((s = !0), r != null && (f = r.signal) !== null && f !== void 0 && f.aborted)) throw new Re();
        i ? (t = await e(t, u, { signal: l })) : ((t = u), (i = !0));
      }
      if (!s && !i) throw new ko();
    } finally {
      o.abort();
    }
    return t;
  }
  async function rA(e) {
    e != null && ft(e, 'options'), e?.signal != null && ut(e.signal, 'options.signal');
    let t = [];
    for await (let n of this) {
      var r;
      if (e != null && (r = e.signal) !== null && r !== void 0 && r.aborted)
        throw new Re(void 0, { cause: e.signal.reason });
      HR(t, n);
    }
    return t;
  }
  function nA(e, t) {
    let r = hn.call(this, e, t);
    return async function* () {
      for await (let i of r) yield* i;
    }.call(this);
  }
  function Xc(e) {
    if (((e = KR(e)), YR(e))) return 0;
    if (e < 0) throw new WR('number', '>= 0', e);
    return e;
  }
  function iA(e, t = void 0) {
    return (
      t != null && ft(t, 'options'),
      t?.signal != null && ut(t.signal, 'options.signal'),
      (e = Xc(e)),
      async function* () {
        var n;
        if (t != null && (n = t.signal) !== null && n !== void 0 && n.aborted) throw new Re();
        for await (let o of this) {
          var i;
          if (t != null && (i = t.signal) !== null && i !== void 0 && i.aborted) throw new Re();
          e-- <= 0 && (yield o);
        }
      }.call(this)
    );
  }
  function oA(e, t = void 0) {
    return (
      t != null && ft(t, 'options'),
      t?.signal != null && ut(t.signal, 'options.signal'),
      (e = Xc(e)),
      async function* () {
        var n;
        if (t != null && (n = t.signal) !== null && n !== void 0 && n.aborted) throw new Re();
        for await (let o of this) {
          var i;
          if (t != null && (i = t.signal) !== null && i !== void 0 && i.aborted) throw new Re();
          if (e-- > 0) yield o;
          else return;
        }
      }.call(this)
    );
  }
  Bo.exports.streamReturningOperators = {
    asIndexedPairs: XR,
    drop: iA,
    filter: jo,
    flatMap: nA,
    map: hn,
    take: oA,
    compose: JR,
  };
  Bo.exports.promiseReturningOperators = { every: ZR, forEach: eA, reduce: tA, toArray: rA, some: Jc, find: QR };
});
var Fo = _((iL, Qc) => {
  'use strict';
  var { ArrayPrototypePop: lA, Promise: sA } = G(),
    { isIterable: uA, isNodeStream: fA, isWebStream: aA } = Se(),
    { pipelineImpl: cA } = fn(),
    { finished: dA } = xe();
  require('stream');
  function hA(...e) {
    return new sA((t, r) => {
      let n,
        i,
        o = e[e.length - 1];
      if (o && typeof o == 'object' && !fA(o) && !uA(o) && !aA(o)) {
        let l = lA(e);
        (n = l.signal), (i = l.end);
      }
      cA(
        e,
        (l, s) => {
          l ? r(l) : t(s);
        },
        { signal: n, end: i }
      );
    });
  }
  Qc.exports = { finished: dA, pipeline: hA };
});
var fd = _((oL, ud) => {
  var { Buffer: bA } = require('buffer'),
    { ObjectDefineProperty: Ie, ObjectKeys: rd, ReflectApply: nd } = G(),
    {
      promisify: { custom: id },
    } = _e(),
    { streamReturningOperators: ed, promiseReturningOperators: td } = Zc(),
    {
      codes: { ERR_ILLEGAL_CONSTRUCTOR: od },
    } = Z(),
    pA = Wo(),
    { pipeline: ld } = fn(),
    { destroyer: yA } = rt(),
    sd = xe(),
    $o = Fo(),
    Uo = Se(),
    F = (ud.exports = Yr().Stream);
  F.isDisturbed = Uo.isDisturbed;
  F.isErrored = Uo.isErrored;
  F.isReadable = Uo.isReadable;
  F.Readable = Xt();
  for (let e of rd(ed)) {
    let r = function (...n) {
      if (new.target) throw od();
      return F.Readable.from(nd(t, this, n));
    };
    Go = r;
    let t = ed[e];
    Ie(r, 'name', { __proto__: null, value: t.name }),
      Ie(r, 'length', { __proto__: null, value: t.length }),
      Ie(F.Readable.prototype, e, { __proto__: null, value: r, enumerable: !1, configurable: !0, writable: !0 });
  }
  var Go;
  for (let e of rd(td)) {
    let r = function (...i) {
      if (new.target) throw od();
      return nd(t, this, i);
    };
    Go = r;
    let t = td[e];
    Ie(r, 'name', { __proto__: null, value: t.name }),
      Ie(r, 'length', { __proto__: null, value: t.length }),
      Ie(F.Readable.prototype, e, { __proto__: null, value: r, enumerable: !1, configurable: !0, writable: !0 });
  }
  var Go;
  F.Writable = _o();
  F.Duplex = me();
  F.Transform = To();
  F.PassThrough = Lo();
  F.pipeline = ld;
  var { addAbortSignal: gA } = Jt();
  F.addAbortSignal = gA;
  F.finished = sd;
  F.destroy = yA;
  F.compose = pA;
  Ie(F, 'promises', {
    __proto__: null,
    configurable: !0,
    enumerable: !0,
    get() {
      return $o;
    },
  });
  Ie(ld, id, {
    __proto__: null,
    enumerable: !0,
    get() {
      return $o.pipeline;
    },
  });
  Ie(sd, id, {
    __proto__: null,
    enumerable: !0,
    get() {
      return $o.finished;
    },
  });
  F.Stream = F;
  F._isUint8Array = function (t) {
    return t instanceof Uint8Array;
  };
  F._uint8ArrayToBuffer = function (t) {
    return bA.from(t.buffer, t.byteOffset, t.byteLength);
  };
});
var ad = _((lL, M) => {
  'use strict';
  var V = require('stream');
  if (V && process.env.READABLE_STREAM === 'disable') {
    let e = V.promises;
    (M.exports._uint8ArrayToBuffer = V._uint8ArrayToBuffer),
      (M.exports._isUint8Array = V._isUint8Array),
      (M.exports.isDisturbed = V.isDisturbed),
      (M.exports.isErrored = V.isErrored),
      (M.exports.isReadable = V.isReadable),
      (M.exports.Readable = V.Readable),
      (M.exports.Writable = V.Writable),
      (M.exports.Duplex = V.Duplex),
      (M.exports.Transform = V.Transform),
      (M.exports.PassThrough = V.PassThrough),
      (M.exports.addAbortSignal = V.addAbortSignal),
      (M.exports.finished = V.finished),
      (M.exports.destroy = V.destroy),
      (M.exports.pipeline = V.pipeline),
      (M.exports.compose = V.compose),
      Object.defineProperty(V, 'promises', {
        configurable: !0,
        enumerable: !0,
        get() {
          return e;
        },
      }),
      (M.exports.Stream = V.Stream);
  } else {
    let e = fd(),
      t = Fo(),
      r = e.Readable.destroy;
    (M.exports = e.Readable),
      (M.exports._uint8ArrayToBuffer = e._uint8ArrayToBuffer),
      (M.exports._isUint8Array = e._isUint8Array),
      (M.exports.isDisturbed = e.isDisturbed),
      (M.exports.isErrored = e.isErrored),
      (M.exports.isReadable = e.isReadable),
      (M.exports.Readable = e.Readable),
      (M.exports.Writable = e.Writable),
      (M.exports.Duplex = e.Duplex),
      (M.exports.Transform = e.Transform),
      (M.exports.PassThrough = e.PassThrough),
      (M.exports.addAbortSignal = e.addAbortSignal),
      (M.exports.finished = e.finished),
      (M.exports.destroy = e.destroy),
      (M.exports.destroy = r),
      (M.exports.pipeline = e.pipeline),
      (M.exports.compose = e.compose),
      Object.defineProperty(e, 'promises', {
        configurable: !0,
        enumerable: !0,
        get() {
          return t;
        },
      }),
      (M.exports.Stream = e.Stream);
  }
  M.exports.default = M.exports;
});
var hd = _((sL, dd) => {
  'use strict';
  var cd = Symbol.for('pino.metadata'),
    _A = qf(),
    { Duplex: wA } = ad();
  dd.exports = function (t, r = {}) {
    let n = r.parse === 'lines',
      i = typeof r.parseLine == 'function' ? r.parseLine : JSON.parse,
      o = r.close || SA,
      l = _A(
        function (f) {
          let u;
          try {
            u = i(f);
          } catch (c) {
            this.emit('unknown', f, c);
            return;
          }
          if (u === null) {
            this.emit('unknown', f, 'Null value ignored');
            return;
          }
          return (
            typeof u != 'object' && (u = { data: u, time: Date.now() }),
            l[cd] && ((l.lastTime = u.time), (l.lastLevel = u.level), (l.lastObj = u)),
            n ? f : u
          );
        },
        { autoDestroy: !0 }
      );
    (l._destroy = function (f, u) {
      let c = o(f, u);
      c && typeof c.then == 'function' && c.then(u, u);
    }),
      r.metadata !== !1 && ((l[cd] = !0), (l.lastTime = 0), (l.lastLevel = 0), (l.lastObj = null));
    let s = t(l);
    if (s && typeof s.catch == 'function')
      s.catch((f) => {
        l.destroy(f);
      }),
        (s = null);
    else if (r.enablePipelining && s) return wA.from({ writable: l, readable: s, objectMode: !0 });
    return l;
  };
  function SA(e, t) {
    process.nextTick(t, e);
  }
});
var De = _((uL, bd) => {
  'use strict';
  bd.exports = {
    DATE_FORMAT: 'yyyy-mm-dd HH:MM:ss.l o',
    DATE_FORMAT_SIMPLE: 'HH:MM:ss.l',
    ERROR_LIKE_KEYS: ['err', 'error'],
    MESSAGE_KEY: 'msg',
    LEVEL_KEY: 'level',
    LEVEL_LABEL: 'levelLabel',
    TIMESTAMP_KEY: 'time',
    LEVELS: { default: 'USERLVL', 60: 'FATAL', 50: 'ERROR', 40: 'WARN', 30: 'INFO', 20: 'DEBUG', 10: 'TRACE' },
    LEVEL_NAMES: { fatal: 60, error: 50, warn: 40, info: 30, debug: 20, trace: 10 },
    LOGGER_KEYS: ['pid', 'hostname', 'name', 'level', 'time', 'timestamp', 'caller'],
  };
});
var Jo = _((fL, _d) => {
  'use strict';
  var { LEVELS: pd, LEVEL_NAMES: yd } = De(),
    Ne = (e) => e,
    Ho = { default: Ne, 60: Ne, 50: Ne, 40: Ne, 30: Ne, 20: Ne, 10: Ne, message: Ne, greyMessage: Ne },
    { createColors: EA } = Ln(),
    Vo = EA({ useColor: !0 }),
    { white: Ko, bgRed: mA, red: RA, yellow: AA, green: TA, blue: OA, gray: Yo, cyan: gd } = Vo,
    bn = { default: Ko, 60: mA, 50: RA, 40: AA, 30: TA, 20: OA, 10: Yo, message: gd, greyMessage: Yo };
  function LA(e) {
    return e.reduce(
      function (t, [r, n]) {
        return (t[r] = typeof Vo[n] == 'function' ? Vo[n] : Ko), t;
      },
      { default: Ko, message: gd, greyMessage: Yo }
    );
  }
  function zo(e) {
    return function (t, r, { customLevels: n, customLevelNames: i } = {}) {
      let o = e ? n || pd : Object.assign({}, pd, n),
        l = e ? i || yd : Object.assign({}, yd, i),
        s = 'default';
      Number.isInteger(+t)
        ? (s = Object.prototype.hasOwnProperty.call(o, t) ? t : s)
        : (s = Object.prototype.hasOwnProperty.call(l, t.toLowerCase()) ? l[t.toLowerCase()] : s);
      let f = o[s];
      return Object.prototype.hasOwnProperty.call(r, s) ? r[s](f) : r.default(f);
    };
  }
  function xA(e) {
    let t = zo(e),
      r = function (n, i) {
        return t(n, Ho, i);
      };
    return (r.message = Ho.message), (r.greyMessage = Ho.greyMessage), r;
  }
  function MA(e) {
    let t = zo(e),
      r = function (n, i) {
        return t(n, bn, i);
      };
    return (r.message = bn.message), (r.greyMessage = bn.greyMessage), r;
  }
  function vA(e, t) {
    let r = LA(e),
      n = t ? r : Object.assign({}, bn, r),
      i = zo(t),
      o = function (l, s) {
        return i(l, n, s);
      };
    return (o.message = o.message || n.message), (o.greyMessage = o.greyMessage || n.greyMessage), o;
  }
  _d.exports = function (t = !1, r, n) {
    return t && r !== void 0 ? vA(r, n) : t ? MA(n) : xA(n);
  };
});
var wd = _((aL, Xo) => {
  'use strict';
  if (typeof SharedArrayBuffer < 'u' && typeof Atomics < 'u') {
    let t = function (r) {
        if ((r > 0 && r < 1 / 0) === !1)
          throw typeof r != 'number' && typeof r != 'bigint'
            ? TypeError('sleep: ms must be a number')
            : RangeError('sleep: ms must be a number that is greater than 0 but less than Infinity');
        Atomics.wait(e, 0, 0, Number(r));
      },
      e = new Int32Array(new SharedArrayBuffer(4));
    Xo.exports = t;
  } else {
    let e = function (t) {
      if ((t > 0 && t < 1 / 0) === !1)
        throw typeof t != 'number' && typeof t != 'bigint'
          ? TypeError('sleep: ms must be a number')
          : RangeError('sleep: ms must be a number that is greater than 0 but less than Infinity');
      let n = Date.now() + Number(t);
      for (; n > Date.now(); );
    };
    Xo.exports = e;
  }
});
var Ld = _((cL, Od) => {
  'use strict';
  var $ = require('fs'),
    IA = require('events'),
    DA = require('util').inherits,
    Sd = require('path'),
    Zo = wd(),
    pn = 100,
    yn = Buffer.allocUnsafe(0),
    NA = 16 * 1024,
    Ed = 'buffer',
    md = 'utf8';
  function Rd(e, t) {
    (t._opening = !0), (t._writing = !0), (t._asyncDrainScheduled = !1);
    function r(o, l) {
      if (o) {
        (t._reopening = !1),
          (t._writing = !1),
          (t._opening = !1),
          t.sync
            ? process.nextTick(() => {
                t.listenerCount('error') > 0 && t.emit('error', o);
              })
            : t.emit('error', o);
        return;
      }
      (t.fd = l),
        (t.file = e),
        (t._reopening = !1),
        (t._opening = !1),
        (t._writing = !1),
        t.sync ? process.nextTick(() => t.emit('ready')) : t.emit('ready'),
        !(t._reopening || t.destroyed) &&
          ((!t._writing && t._len > t.minLength) || t._flushPending) &&
          t._actualWrite();
    }
    let n = t.append ? 'a' : 'w',
      i = t.mode;
    if (t.sync)
      try {
        t.mkdir && $.mkdirSync(Sd.dirname(e), { recursive: !0 });
        let o = $.openSync(e, n, i);
        r(null, o);
      } catch (o) {
        throw (r(o), o);
      }
    else
      t.mkdir
        ? $.mkdir(Sd.dirname(e), { recursive: !0 }, (o) => {
            if (o) return r(o);
            $.open(e, n, i, r);
          })
        : $.open(e, n, i, r);
  }
  function ce(e) {
    if (!(this instanceof ce)) return new ce(e);
    let {
      fd: t,
      dest: r,
      minLength: n,
      maxLength: i,
      maxWrite: o,
      sync: l,
      append: s = !0,
      mkdir: f,
      retryEAGAIN: u,
      fsync: c,
      contentMode: a,
      mode: b,
    } = e || {};
    (t = t || r),
      (this._len = 0),
      (this.fd = -1),
      (this._bufs = []),
      (this._lens = []),
      (this._writing = !1),
      (this._ending = !1),
      (this._reopening = !1),
      (this._asyncDrainScheduled = !1),
      (this._flushPending = !1),
      (this._hwm = Math.max(n || 0, 16387)),
      (this.file = null),
      (this.destroyed = !1),
      (this.minLength = n || 0),
      (this.maxLength = i || 0),
      (this.maxWrite = o || NA),
      (this.sync = l || !1),
      (this.writable = !0),
      (this._fsync = c || !1),
      (this.append = s || !1),
      (this.mode = b),
      (this.retryEAGAIN = u || (() => !0)),
      (this.mkdir = f || !1);
    let h, d;
    if (a === Ed)
      (this._writingBuf = yn),
        (this.write = CA),
        (this.flush = kA),
        (this.flushSync = BA),
        (this._actualWrite = $A),
        (h = () => $.writeSync(this.fd, this._writingBuf)),
        (d = () => $.write(this.fd, this._writingBuf, this.release));
    else if (a === void 0 || a === md)
      (this._writingBuf = ''),
        (this.write = qA),
        (this.flush = WA),
        (this.flushSync = jA),
        (this._actualWrite = FA),
        (h = () => $.writeSync(this.fd, this._writingBuf, 'utf8')),
        (d = () => $.write(this.fd, this._writingBuf, 'utf8', this.release));
    else throw new Error(`SonicBoom supports "${md}" and "${Ed}", but passed ${a}`);
    if (typeof t == 'number') (this.fd = t), process.nextTick(() => this.emit('ready'));
    else if (typeof t == 'string') Rd(t, this);
    else throw new Error('SonicBoom supports only file descriptors and files');
    if (this.minLength >= this.maxWrite)
      throw new Error(`minLength should be smaller than maxWrite (${this.maxWrite})`);
    (this.release = (S, y) => {
      if (S) {
        if (
          (S.code === 'EAGAIN' || S.code === 'EBUSY') &&
          this.retryEAGAIN(S, this._writingBuf.length, this._len - this._writingBuf.length)
        )
          if (this.sync)
            try {
              Zo(pn), this.release(void 0, 0);
            } catch (g) {
              this.release(g);
            }
          else setTimeout(d, pn);
        else (this._writing = !1), this.emit('error', S);
        return;
      }
      if (
        (this.emit('write', y),
        (this._len -= y),
        this._len < 0 && (this._len = 0),
        (this._writingBuf = this._writingBuf.slice(y)),
        this._writingBuf.length)
      ) {
        if (!this.sync) {
          d();
          return;
        }
        try {
          do {
            let g = h();
            (this._len -= g), (this._writingBuf = this._writingBuf.slice(g));
          } while (this._writingBuf.length);
        } catch (g) {
          this.release(g);
          return;
        }
      }
      this._fsync && $.fsyncSync(this.fd);
      let w = this._len;
      this._reopening
        ? ((this._writing = !1), (this._reopening = !1), this.reopen())
        : w > this.minLength
        ? this._actualWrite()
        : this._ending
        ? w > 0
          ? this._actualWrite()
          : ((this._writing = !1), gn(this))
        : ((this._writing = !1),
          this.sync
            ? this._asyncDrainScheduled || ((this._asyncDrainScheduled = !0), process.nextTick(PA, this))
            : this.emit('drain'));
    }),
      this.on('newListener', function (S) {
        S === 'drain' && (this._asyncDrainScheduled = !1);
      });
  }
  function PA(e) {
    e.listenerCount('drain') > 0 && ((e._asyncDrainScheduled = !1), e.emit('drain'));
  }
  DA(ce, IA);
  function Ad(e, t) {
    return e.length === 0 ? yn : e.length === 1 ? e[0] : Buffer.concat(e, t);
  }
  function qA(e) {
    if (this.destroyed) throw new Error('SonicBoom destroyed');
    let t = this._len + e.length,
      r = this._bufs;
    return this.maxLength && t > this.maxLength
      ? (this.emit('drop', e), this._len < this._hwm)
      : (r.length === 0 || r[r.length - 1].length + e.length > this.maxWrite ? r.push('' + e) : (r[r.length - 1] += e),
        (this._len = t),
        !this._writing && this._len >= this.minLength && this._actualWrite(),
        this._len < this._hwm);
  }
  function CA(e) {
    if (this.destroyed) throw new Error('SonicBoom destroyed');
    let t = this._len + e.length,
      r = this._bufs,
      n = this._lens;
    return this.maxLength && t > this.maxLength
      ? (this.emit('drop', e), this._len < this._hwm)
      : (r.length === 0 || n[n.length - 1] + e.length > this.maxWrite
          ? (r.push([e]), n.push(e.length))
          : (r[r.length - 1].push(e), (n[n.length - 1] += e.length)),
        (this._len = t),
        !this._writing && this._len >= this.minLength && this._actualWrite(),
        this._len < this._hwm);
  }
  function Td(e) {
    this._flushPending = !0;
    let t = () => {
        this._fsync
          ? ((this._flushPending = !1), e())
          : $.fsync(this.fd, (n) => {
              (this._flushPending = !1), e(n);
            }),
          this.off('error', r);
      },
      r = (n) => {
        (this._flushPending = !1), e(n), this.off('drain', t);
      };
    this.once('drain', t), this.once('error', r);
  }
  function WA(e) {
    if (e != null && typeof e != 'function') throw new Error('flush cb must be a function');
    if (this.destroyed) {
      let t = new Error('SonicBoom destroyed');
      if (e) {
        e(t);
        return;
      }
      throw t;
    }
    if (this.minLength <= 0) {
      e?.();
      return;
    }
    e && Td.call(this, e), !this._writing && (this._bufs.length === 0 && this._bufs.push(''), this._actualWrite());
  }
  function kA(e) {
    if (e != null && typeof e != 'function') throw new Error('flush cb must be a function');
    if (this.destroyed) {
      let t = new Error('SonicBoom destroyed');
      if (e) {
        e(t);
        return;
      }
      throw t;
    }
    if (this.minLength <= 0) {
      e?.();
      return;
    }
    e && Td.call(this, e),
      !this._writing && (this._bufs.length === 0 && (this._bufs.push([]), this._lens.push(0)), this._actualWrite());
  }
  ce.prototype.reopen = function (e) {
    if (this.destroyed) throw new Error('SonicBoom destroyed');
    if (this._opening) {
      this.once('ready', () => {
        this.reopen(e);
      });
      return;
    }
    if (this._ending) return;
    if (!this.file) throw new Error('Unable to reopen a file descriptor, you must pass a file to SonicBoom');
    if (((this._reopening = !0), this._writing)) return;
    let t = this.fd;
    this.once('ready', () => {
      t !== this.fd &&
        $.close(t, (r) => {
          if (r) return this.emit('error', r);
        });
    }),
      Rd(e || this.file, this);
  };
  ce.prototype.end = function () {
    if (this.destroyed) throw new Error('SonicBoom destroyed');
    if (this._opening) {
      this.once('ready', () => {
        this.end();
      });
      return;
    }
    this._ending ||
      ((this._ending = !0), !this._writing && (this._len > 0 && this.fd >= 0 ? this._actualWrite() : gn(this)));
  };
  function jA() {
    if (this.destroyed) throw new Error('SonicBoom destroyed');
    if (this.fd < 0) throw new Error('sonic boom is not ready yet');
    !this._writing && this._writingBuf.length > 0 && (this._bufs.unshift(this._writingBuf), (this._writingBuf = ''));
    let e = '';
    for (; this._bufs.length || e; ) {
      e.length <= 0 && (e = this._bufs[0]);
      try {
        let t = $.writeSync(this.fd, e, 'utf8');
        (e = e.slice(t)), (this._len = Math.max(this._len - t, 0)), e.length <= 0 && this._bufs.shift();
      } catch (t) {
        if ((t.code === 'EAGAIN' || t.code === 'EBUSY') && !this.retryEAGAIN(t, e.length, this._len - e.length))
          throw t;
        Zo(pn);
      }
    }
    try {
      $.fsyncSync(this.fd);
    } catch {}
  }
  function BA() {
    if (this.destroyed) throw new Error('SonicBoom destroyed');
    if (this.fd < 0) throw new Error('sonic boom is not ready yet');
    !this._writing && this._writingBuf.length > 0 && (this._bufs.unshift([this._writingBuf]), (this._writingBuf = yn));
    let e = yn;
    for (; this._bufs.length || e.length; ) {
      e.length <= 0 && (e = Ad(this._bufs[0], this._lens[0]));
      try {
        let t = $.writeSync(this.fd, e);
        (e = e.subarray(t)),
          (this._len = Math.max(this._len - t, 0)),
          e.length <= 0 && (this._bufs.shift(), this._lens.shift());
      } catch (t) {
        if ((t.code === 'EAGAIN' || t.code === 'EBUSY') && !this.retryEAGAIN(t, e.length, this._len - e.length))
          throw t;
        Zo(pn);
      }
    }
  }
  ce.prototype.destroy = function () {
    this.destroyed || gn(this);
  };
  function FA() {
    let e = this.release;
    if (((this._writing = !0), (this._writingBuf = this._writingBuf || this._bufs.shift() || ''), this.sync))
      try {
        let t = $.writeSync(this.fd, this._writingBuf, 'utf8');
        e(null, t);
      } catch (t) {
        e(t);
      }
    else $.write(this.fd, this._writingBuf, 'utf8', e);
  }
  function $A() {
    let e = this.release;
    if (
      ((this._writing = !0),
      (this._writingBuf = this._writingBuf.length ? this._writingBuf : Ad(this._bufs.shift(), this._lens.shift())),
      this.sync)
    )
      try {
        let t = $.writeSync(this.fd, this._writingBuf);
        e(null, t);
      } catch (t) {
        e(t);
      }
    else $.write(this.fd, this._writingBuf, e);
  }
  function gn(e) {
    if (e.fd === -1) {
      e.once('ready', gn.bind(null, e));
      return;
    }
    (e.destroyed = !0), (e._bufs = []), (e._lens = []), $.fsync(e.fd, t);
    function t() {
      e.fd !== 1 && e.fd !== 2 ? $.close(e.fd, r) : r();
    }
    function r(n) {
      if (n) {
        e.emit('error', n);
        return;
      }
      e._ending && !e._writing && e.emit('finish'), e.emit('close');
    }
  }
  ce.SonicBoom = ce;
  ce.default = ce;
  Od.exports = ce;
});
var Qo = _((dL, xd) => {
  'use strict';
  xd.exports = function () {};
});
var qd = _((hL, Pd) => {
  'use strict';
  var $e = { exit: [], beforeExit: [] },
    Md = { exit: GA, beforeExit: HA },
    vd = new FinalizationRegistry(VA);
  function UA(e) {
    $e[e].length > 0 || process.on(e, Md[e]);
  }
  function Id(e) {
    $e[e].length > 0 || process.removeListener(e, Md[e]);
  }
  function GA() {
    Dd('exit');
  }
  function HA() {
    Dd('beforeExit');
  }
  function Dd(e) {
    for (let t of $e[e]) {
      let r = t.deref(),
        n = t.fn;
      r !== void 0 && n(r, e);
    }
  }
  function VA(e) {
    for (let t of ['exit', 'beforeExit']) {
      let r = $e[t].indexOf(e);
      $e[t].splice(r, r + 1), Id(t);
    }
  }
  function Nd(e, t, r) {
    if (t === void 0) throw new Error("the object can't be undefined");
    UA(e);
    let n = new WeakRef(t);
    (n.fn = r), vd.register(t, n), $e[e].push(n);
  }
  function KA(e, t) {
    Nd('exit', e, t);
  }
  function YA(e, t) {
    Nd('beforeExit', e, t);
  }
  function zA(e) {
    vd.unregister(e);
    for (let t of ['exit', 'beforeExit'])
      ($e[t] = $e[t].filter((r) => {
        let n = r.deref();
        return n && n !== e;
      })),
        Id(t);
  }
  Pd.exports = { register: KA, registerBeforeExit: YA, unregister: zA };
});
var Wd = _((bL, Cd) => {
  'use strict';
  Cd.exports = ZA;
  var { isMainThread: JA } = require('worker_threads'),
    XA = Ld(),
    _n = Qo();
  function ZA(e) {
    let t = new XA(e);
    return t.on('error', r), !process.env.NODE_V8_COVERAGE && !e.sync && JA && QA(t), t;
    function r(n) {
      if (n.code === 'EPIPE') {
        (t.write = _n), (t.end = _n), (t.flushSync = _n), (t.destroy = _n);
        return;
      }
      t.removeListener('error', r);
    }
  }
  function QA(e) {
    if (global.WeakRef && global.WeakMap && global.FinalizationRegistry) {
      let t = qd();
      t.register(e, eT),
        e.on('close', function () {
          t.unregister(e);
        });
    }
  }
  function eT(e, t) {
    e.destroyed ||
      (t === 'beforeExit'
        ? (e.flush(),
          e.on('drain', function () {
            e.end();
          }))
        : e.flushSync());
  }
});
var wn = _((pL, kd) => {
  'use strict';
  kd.exports = tT;
  function tT(e) {
    return e instanceof Date && !Number.isNaN(e.getTime());
  }
});
var el = _((yL, jd) => {
  'use strict';
  jd.exports = nT;
  var rT = wn();
  function nT(e) {
    let t = new Date(e);
    return rT(t) || (t = new Date(+e)), t;
  }
});
var Sn = _((gL, Bd) => {
  'use strict';
  Bd.exports = iT;
  function iT(e) {
    let t = [],
      r = !1,
      n = '';
    for (let i = 0; i < e.length; i++) {
      let o = e.charAt(i);
      if (o === '\\') {
        r = !0;
        continue;
      }
      if (r) {
        (r = !1), (n += o);
        continue;
      }
      if (o === '.') {
        t.push(n), (n = '');
        continue;
      }
      n += o;
    }
    return n.length && t.push(n), t;
  }
});
var Mt = _((_L, Fd) => {
  'use strict';
  Fd.exports = lT;
  var oT = Sn();
  function lT(e, t) {
    let r = Array.isArray(t) ? t : oT(t);
    for (let n of r) {
      if (!Object.prototype.hasOwnProperty.call(e, n)) return;
      e = e[n];
    }
    return e;
  }
});
var tl = _((wL, $d) => {
  'use strict';
  $d.exports = fT;
  var sT = Mt(),
    uT = Sn();
  function fT(e, t) {
    let r = uT(t),
      n = r.pop();
    (e = sT(e, r)), e !== null && typeof e == 'object' && Object.prototype.hasOwnProperty.call(e, n) && delete e[n];
  }
});
var Qd = _((vt) => {
  'use strict';
  Object.defineProperty(vt, '__esModule', { value: !0 });
  var aT = Function.prototype.toString,
    rl = Object.create,
    cT = Object.prototype.toString,
    dT = (function () {
      function e() {
        (this._keys = []), (this._values = []);
      }
      return (
        (e.prototype.has = function (t) {
          return !!~this._keys.indexOf(t);
        }),
        (e.prototype.get = function (t) {
          return this._values[this._keys.indexOf(t)];
        }),
        (e.prototype.set = function (t, r) {
          this._keys.push(t), this._values.push(r);
        }),
        e
      );
    })();
  function hT() {
    return new dT();
  }
  function bT() {
    return new WeakMap();
  }
  var pT = typeof WeakMap < 'u' ? bT : hT;
  function il(e) {
    if (!e) return rl(null);
    var t = e.constructor;
    if (t === Object) return e === Object.prototype ? {} : rl(e);
    if (~aT.call(t).indexOf('[native code]'))
      try {
        return new t();
      } catch {}
    return rl(e);
  }
  function yT(e) {
    var t = '';
    return (
      e.global && (t += 'g'),
      e.ignoreCase && (t += 'i'),
      e.multiline && (t += 'm'),
      e.unicode && (t += 'u'),
      e.sticky && (t += 'y'),
      t
    );
  }
  function gT(e) {
    return e.flags;
  }
  var _T = /test/g.flags === 'g' ? gT : yT;
  function Ud(e) {
    var t = cT.call(e);
    return t.substring(8, t.length - 1);
  }
  function wT(e) {
    return e[Symbol.toStringTag] || Ud(e);
  }
  var ST = typeof Symbol < 'u' ? wT : Ud,
    ET = Object.defineProperty,
    mT = Object.getOwnPropertyDescriptor,
    Gd = Object.getOwnPropertyNames,
    ol = Object.getOwnPropertySymbols,
    Hd = Object.prototype,
    Vd = Hd.hasOwnProperty,
    RT = Hd.propertyIsEnumerable,
    Kd = typeof ol == 'function';
  function AT(e) {
    return Gd(e).concat(ol(e));
  }
  var TT = Kd ? AT : Gd;
  function mn(e, t, r) {
    for (var n = TT(e), i = 0, o = n.length, l = void 0, s = void 0; i < o; ++i)
      if (((l = n[i]), !(l === 'callee' || l === 'caller'))) {
        if (((s = mT(e, l)), !s)) {
          t[l] = r.copier(e[l], r);
          continue;
        }
        !s.get && !s.set && (s.value = r.copier(s.value, r));
        try {
          ET(t, l, s);
        } catch {
          t[l] = s.value;
        }
      }
    return t;
  }
  function OT(e, t) {
    var r = new t.Constructor();
    t.cache.set(e, r);
    for (var n = 0, i = e.length; n < i; ++n) r[n] = t.copier(e[n], t);
    return r;
  }
  function LT(e, t) {
    var r = new t.Constructor();
    return t.cache.set(e, r), mn(e, r, t);
  }
  function Yd(e, t) {
    return e.slice(0);
  }
  function xT(e, t) {
    return e.slice(0, e.size, e.type);
  }
  function MT(e, t) {
    return new t.Constructor(Yd(e.buffer));
  }
  function vT(e, t) {
    return new t.Constructor(e.getTime());
  }
  function zd(e, t) {
    var r = new t.Constructor();
    return (
      t.cache.set(e, r),
      e.forEach(function (n, i) {
        r.set(i, t.copier(n, t));
      }),
      r
    );
  }
  function IT(e, t) {
    return mn(e, zd(e, t), t);
  }
  function DT(e, t) {
    var r = il(t.prototype);
    t.cache.set(e, r);
    for (var n in e) Vd.call(e, n) && (r[n] = t.copier(e[n], t));
    return r;
  }
  function NT(e, t) {
    var r = il(t.prototype);
    t.cache.set(e, r);
    for (var n in e) Vd.call(e, n) && (r[n] = t.copier(e[n], t));
    for (var i = ol(e), o = 0, l = i.length, s = void 0; o < l; ++o)
      (s = i[o]), RT.call(e, s) && (r[s] = t.copier(e[s], t));
    return r;
  }
  var PT = Kd ? NT : DT;
  function qT(e, t) {
    var r = il(t.prototype);
    return t.cache.set(e, r), mn(e, r, t);
  }
  function nl(e, t) {
    return new t.Constructor(e.valueOf());
  }
  function CT(e, t) {
    var r = new t.Constructor(e.source, _T(e));
    return (r.lastIndex = e.lastIndex), r;
  }
  function En(e, t) {
    return e;
  }
  function Jd(e, t) {
    var r = new t.Constructor();
    return (
      t.cache.set(e, r),
      e.forEach(function (n) {
        r.add(t.copier(n, t));
      }),
      r
    );
  }
  function WT(e, t) {
    return mn(e, Jd(e, t), t);
  }
  var kT = Array.isArray,
    ll = Object.assign,
    jT =
      Object.getPrototypeOf ||
      function (e) {
        return e.__proto__;
      },
    Xd = {
      array: OT,
      arrayBuffer: Yd,
      blob: xT,
      dataView: MT,
      date: vT,
      error: En,
      map: zd,
      object: PT,
      regExp: CT,
      set: Jd,
    },
    BT = ll({}, Xd, { array: LT, map: IT, object: qT, set: WT });
  function FT(e) {
    return {
      Arguments: e.object,
      Array: e.array,
      ArrayBuffer: e.arrayBuffer,
      Blob: e.blob,
      Boolean: nl,
      DataView: e.dataView,
      Date: e.date,
      Error: e.error,
      Float32Array: e.arrayBuffer,
      Float64Array: e.arrayBuffer,
      Int8Array: e.arrayBuffer,
      Int16Array: e.arrayBuffer,
      Int32Array: e.arrayBuffer,
      Map: e.map,
      Number: nl,
      Object: e.object,
      Promise: En,
      RegExp: e.regExp,
      Set: e.set,
      String: nl,
      WeakMap: En,
      WeakSet: En,
      Uint8Array: e.arrayBuffer,
      Uint8ClampedArray: e.arrayBuffer,
      Uint16Array: e.arrayBuffer,
      Uint32Array: e.arrayBuffer,
      Uint64Array: e.arrayBuffer,
    };
  }
  function sl(e) {
    var t = ll({}, Xd, e),
      r = FT(t),
      n = r.Array,
      i = r.Object;
    function o(l, s) {
      if (((s.prototype = s.Constructor = void 0), !l || typeof l != 'object')) return l;
      if (s.cache.has(l)) return s.cache.get(l);
      if (
        ((s.prototype = jT(l)),
        (s.Constructor = s.prototype && s.prototype.constructor),
        !s.Constructor || s.Constructor === Object)
      )
        return i(l, s);
      if (kT(l)) return n(l, s);
      var f = r[ST(l)];
      return f ? f(l, s) : typeof l.then == 'function' ? l : i(l, s);
    }
    return function (s) {
      return o(s, { Constructor: void 0, cache: pT(), copier: o, prototype: void 0 });
    };
  }
  function Zd(e) {
    return sl(ll({}, BT, e));
  }
  var $T = Zd({}),
    UT = sl({});
  vt.copyStrict = $T;
  vt.createCopier = sl;
  vt.createStrictCopier = Zd;
  vt.default = UT;
});
var ul = _((EL, eh) => {
  'use strict';
  eh.exports = KT;
  var { createCopier: GT } = Qd(),
    HT = GT({}),
    VT = tl();
  function KT({ log: e, context: t }) {
    let { ignoreKeys: r, includeKeys: n } = t,
      i = HT(e);
    if (n) {
      let o = {};
      return (
        n.forEach((l) => {
          o[l] = i[l];
        }),
        o
      );
    }
    return (
      r.forEach((o) => {
        VT(i, o);
      }),
      i
    );
  }
});
var rh = _((fl, th) => {
  'use strict';
  function It(e) {
    '@babel/helpers - typeof';
    return (
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? (It = function (r) {
            return typeof r;
          })
        : (It = function (r) {
            return r && typeof Symbol == 'function' && r.constructor === Symbol && r !== Symbol.prototype
              ? 'symbol'
              : typeof r;
          }),
      It(e)
    );
  }
  (function (e) {
    var t = arguments,
      r = (function () {
        var f = /d{1,4}|D{3,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|W{1,2}|[LlopSZN]|"[^"]*"|'[^']*'/g,
          u =
            /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
          c = /[^-+\dA-Z]/g;
        return function (a, b, h, d) {
          if (
            (t.length === 1 && s(a) === 'string' && !/\d/.test(a) && ((b = a), (a = void 0)),
            (a = a || a === 0 ? a : new Date()),
            a instanceof Date || (a = new Date(a)),
            isNaN(a))
          )
            throw TypeError('Invalid date');
          b = String(r.masks[b] || b || r.masks.default);
          var S = b.slice(0, 4);
          (S === 'UTC:' || S === 'GMT:') && ((b = b.slice(4)), (h = !0), S === 'GMT:' && (d = !0));
          var y = function () {
              return h ? 'getUTC' : 'get';
            },
            w = function () {
              return a[y() + 'Date']();
            },
            g = function () {
              return a[y() + 'Day']();
            },
            p = function () {
              return a[y() + 'Month']();
            },
            A = function () {
              return a[y() + 'FullYear']();
            },
            m = function () {
              return a[y() + 'Hours']();
            },
            v = function () {
              return a[y() + 'Minutes']();
            },
            j = function () {
              return a[y() + 'Seconds']();
            },
            I = function () {
              return a[y() + 'Milliseconds']();
            },
            P = function () {
              return h ? 0 : a.getTimezoneOffset();
            },
            ee = function () {
              return o(a);
            },
            te = function () {
              return l(a);
            },
            C = {
              d: function () {
                return w();
              },
              dd: function () {
                return n(w());
              },
              ddd: function () {
                return r.i18n.dayNames[g()];
              },
              DDD: function () {
                return i({ y: A(), m: p(), d: w(), _: y(), dayName: r.i18n.dayNames[g()], short: !0 });
              },
              dddd: function () {
                return r.i18n.dayNames[g() + 7];
              },
              DDDD: function () {
                return i({ y: A(), m: p(), d: w(), _: y(), dayName: r.i18n.dayNames[g() + 7] });
              },
              m: function () {
                return p() + 1;
              },
              mm: function () {
                return n(p() + 1);
              },
              mmm: function () {
                return r.i18n.monthNames[p()];
              },
              mmmm: function () {
                return r.i18n.monthNames[p() + 12];
              },
              yy: function () {
                return String(A()).slice(2);
              },
              yyyy: function () {
                return n(A(), 4);
              },
              h: function () {
                return m() % 12 || 12;
              },
              hh: function () {
                return n(m() % 12 || 12);
              },
              H: function () {
                return m();
              },
              HH: function () {
                return n(m());
              },
              M: function () {
                return v();
              },
              MM: function () {
                return n(v());
              },
              s: function () {
                return j();
              },
              ss: function () {
                return n(j());
              },
              l: function () {
                return n(I(), 3);
              },
              L: function () {
                return n(Math.floor(I() / 10));
              },
              t: function () {
                return m() < 12 ? r.i18n.timeNames[0] : r.i18n.timeNames[1];
              },
              tt: function () {
                return m() < 12 ? r.i18n.timeNames[2] : r.i18n.timeNames[3];
              },
              T: function () {
                return m() < 12 ? r.i18n.timeNames[4] : r.i18n.timeNames[5];
              },
              TT: function () {
                return m() < 12 ? r.i18n.timeNames[6] : r.i18n.timeNames[7];
              },
              Z: function () {
                return d
                  ? 'GMT'
                  : h
                  ? 'UTC'
                  : (String(a).match(u) || [''])
                      .pop()
                      .replace(c, '')
                      .replace(/GMT\+0000/g, 'UTC');
              },
              o: function () {
                return (P() > 0 ? '-' : '+') + n(Math.floor(Math.abs(P()) / 60) * 100 + (Math.abs(P()) % 60), 4);
              },
              p: function () {
                return (
                  (P() > 0 ? '-' : '+') +
                  n(Math.floor(Math.abs(P()) / 60), 2) +
                  ':' +
                  n(Math.floor(Math.abs(P()) % 60), 2)
                );
              },
              S: function () {
                return ['th', 'st', 'nd', 'rd'][w() % 10 > 3 ? 0 : (((w() % 100) - (w() % 10) != 10) * w()) % 10];
              },
              W: function () {
                return ee();
              },
              WW: function () {
                return n(ee());
              },
              N: function () {
                return te();
              },
            };
          return b.replace(f, function (E) {
            return E in C ? C[E]() : E.slice(1, E.length - 1);
          });
        };
      })();
    (r.masks = {
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
    }),
      (r.i18n = {
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
      });
    var n = function (u, c) {
        for (u = String(u), c = c || 2; u.length < c; ) u = '0' + u;
        return u;
      },
      i = function (u) {
        var c = u.y,
          a = u.m,
          b = u.d,
          h = u._,
          d = u.dayName,
          S = u.short,
          y = S === void 0 ? !1 : S,
          w = new Date(),
          g = new Date();
        g.setDate(g[h + 'Date']() - 1);
        var p = new Date();
        p.setDate(p[h + 'Date']() + 1);
        var A = function () {
            return w[h + 'Date']();
          },
          m = function () {
            return w[h + 'Month']();
          },
          v = function () {
            return w[h + 'FullYear']();
          },
          j = function () {
            return g[h + 'Date']();
          },
          I = function () {
            return g[h + 'Month']();
          },
          P = function () {
            return g[h + 'FullYear']();
          },
          ee = function () {
            return p[h + 'Date']();
          },
          te = function () {
            return p[h + 'Month']();
          },
          C = function () {
            return p[h + 'FullYear']();
          };
        return v() === c && m() === a && A() === b
          ? y
            ? 'Tdy'
            : 'Today'
          : P() === c && I() === a && j() === b
          ? y
            ? 'Ysd'
            : 'Yesterday'
          : C() === c && te() === a && ee() === b
          ? y
            ? 'Tmw'
            : 'Tomorrow'
          : d;
      },
      o = function (u) {
        var c = new Date(u.getFullYear(), u.getMonth(), u.getDate());
        c.setDate(c.getDate() - ((c.getDay() + 6) % 7) + 3);
        var a = new Date(c.getFullYear(), 0, 4);
        a.setDate(a.getDate() - ((a.getDay() + 6) % 7) + 3);
        var b = c.getTimezoneOffset() - a.getTimezoneOffset();
        c.setHours(c.getHours() - b);
        var h = (c - a) / (864e5 * 7);
        return 1 + Math.floor(h);
      },
      l = function (u) {
        var c = u.getDay();
        return c === 0 && (c = 7), c;
      },
      s = function (u) {
        return u === null
          ? 'null'
          : u === void 0
          ? 'undefined'
          : It(u) !== 'object'
          ? It(u)
          : Array.isArray(u)
          ? 'array'
          : {}.toString.call(u).slice(8, -1).toLowerCase();
      };
    typeof define == 'function' && define.amd
      ? define(function () {
          return r;
        })
      : (typeof fl > 'u' ? 'undefined' : It(fl)) === 'object'
      ? (th.exports = r)
      : (e.dateFormat = r);
  })(void 0);
});
var al = _((mL, nh) => {
  'use strict';
  nh.exports = ZT;
  var { DATE_FORMAT: YT, DATE_FORMAT_SIMPLE: zT } = De(),
    ir = rh(),
    JT = el(),
    XT = wn();
  function ZT(e, t = !1) {
    if (t === !1) return e;
    let r = JT(e);
    if (!XT(r)) return e;
    if (t === !0) return ir(r, zT);
    let n = t.toUpperCase();
    if (n === 'SYS:STANDARD') return ir(r, YT);
    let i = n.substr(0, 4);
    return i === 'SYS:' || i === 'UTC:' ? (i === 'UTC:' ? ir(r, t) : ir(r, t.slice(4))) : ir(r, `UTC:${t}`);
  }
});
var cl = _((RL, ih) => {
  'use strict';
  ih.exports = QT;
  function QT(e) {
    return e
      ? typeof e == 'string'
        ? e.split(',').reduce((t, r, n) => {
            let [i, o = n] = r.split(':');
            return (t[i.toLowerCase()] = o), t;
          }, {})
        : Object.prototype.toString.call(e) === '[object Object]'
        ? Object.keys(e).reduce((t, r) => ((t[r.toLowerCase()] = e[r]), t), {})
        : {}
      : {};
  }
});
var dl = _((AL, oh) => {
  'use strict';
  oh.exports = e0;
  function e0(e) {
    return e
      ? typeof e == 'string'
        ? e.split(',').reduce(
            (t, r, n) => {
              let [i, o = n] = r.split(':');
              return (t[o] = i.toUpperCase()), t;
            },
            { default: 'USERLVL' }
          )
        : Object.prototype.toString.call(e) === '[object Object]'
        ? Object.keys(e).reduce((t, r) => ((t[e[r]] = r.toUpperCase()), t), { default: 'USERLVL' })
        : {}
      : {};
  }
});
var hl = _((TL, lh) => {
  'use strict';
  lh.exports = r0;
  var t0 = Mt();
  function r0(e, t) {
    return (
      (e = e.replace(/{if (.*?)}(.*?){end}/g, r)),
      (e = e.replace(/{if (.*?)}/g, '')),
      (e = e.replace(/{end}/g, '')),
      e.replace(/\s+/g, ' ').trim()
    );
    function r(n, i, o) {
      let l = t0(t, i);
      return l && o.includes(i) ? o.replace(new RegExp('{' + i + '}', 'g'), l) : '';
    }
  }
});
var Rn = _((OL, sh) => {
  'use strict';
  sh.exports = n0;
  function n0(e) {
    return Object.prototype.toString.apply(e) === '[object Object]';
  }
});
var or = _((LL, uh) => {
  'use strict';
  uh.exports = i0;
  function i0({
    input: e,
    ident: t = '    ',
    eol: r = `
`,
  }) {
    let n = e.split(/\r?\n/);
    for (let i = 1; i < n.length; i += 1) n[i] = t + n[i];
    return n.join(r);
  }
});
var ch = _((xL, ah) => {
  'use strict';
  ah.exports = u0;
  var { LEVEL_NAMES: o0 } = De(),
    fh = Jo(),
    l0 = dl(),
    s0 = cl();
  function u0(e) {
    let t = e.crlf
        ? `\r
`
        : `
`,
      r = '    ',
      {
        customPrettifiers: n,
        errorLikeObjectKeys: i,
        hideObject: o,
        levelFirst: l,
        levelKey: s,
        levelLabel: f,
        messageFormat: u,
        messageKey: c,
        minimumLevel: a,
        singleLine: b,
        timestampKey: h,
        translateTime: d,
      } = e,
      S = e.errorProps.split(','),
      y = typeof e.useOnlyCustomProps == 'boolean' ? e.useOnlyCustomProps : e.useOnlyCustomProps === 'true',
      w = l0(e.customLevels),
      g = s0(e.customLevels),
      p;
    e.customColors &&
      (p = e.customColors.split(',').reduce((P, ee) => {
        let [te, C] = ee.split(':'),
          Tl = (y ? e.customLevels : g[te] !== void 0) ? g[te] : o0[te],
          kh = Tl !== void 0 ? Tl : te;
        return P.push([kh, C]), P;
      }, []));
    let A = { customLevels: w, customLevelNames: g };
    y === !0 && !e.customLevels && ((A.customLevels = void 0), (A.customLevelNames = void 0));
    let m = e.include !== void 0 ? new Set(e.include.split(',')) : void 0,
      v = !m && e.ignore ? new Set(e.ignore.split(',')) : void 0,
      j = fh(e.colorize, p, y),
      I = e.colorizeObjects ? j : fh(!1, [], !1);
    return {
      EOL: t,
      IDENT: r,
      colorizer: j,
      customColors: p,
      customLevelNames: g,
      customLevels: w,
      customPrettifiers: n,
      customProperties: A,
      errorLikeObjectKeys: i,
      errorProps: S,
      hideObject: o,
      ignoreKeys: v,
      includeKeys: m,
      levelFirst: l,
      levelKey: s,
      levelLabel: f,
      messageFormat: u,
      messageKey: c,
      minimumLevel: a,
      objectColorizer: I,
      singleLine: b,
      timestampKey: h,
      translateTime: d,
      useOnlyCustomProps: y,
    };
  }
});
var gh = _((ML, yh) => {
  yh.exports = lr;
  lr.default = lr;
  lr.stable = bh;
  lr.stableStringify = bh;
  var An = '[...]',
    dh = '[Circular]',
    ct = [],
    at = [];
  function hh() {
    return { depthLimit: Number.MAX_SAFE_INTEGER, edgesLimit: Number.MAX_SAFE_INTEGER };
  }
  function lr(e, t, r, n) {
    typeof n > 'u' && (n = hh()), bl(e, '', 0, [], void 0, 0, n);
    var i;
    try {
      at.length === 0 ? (i = JSON.stringify(e, t, r)) : (i = JSON.stringify(e, ph(t), r));
    } catch {
      return JSON.stringify('[unable to serialize, circular reference is too complex to analyze]');
    } finally {
      for (; ct.length !== 0; ) {
        var o = ct.pop();
        o.length === 4 ? Object.defineProperty(o[0], o[1], o[3]) : (o[0][o[1]] = o[2]);
      }
    }
    return i;
  }
  function Dt(e, t, r, n) {
    var i = Object.getOwnPropertyDescriptor(n, r);
    i.get !== void 0
      ? i.configurable
        ? (Object.defineProperty(n, r, { value: e }), ct.push([n, r, t, i]))
        : at.push([t, r, e])
      : ((n[r] = e), ct.push([n, r, t]));
  }
  function bl(e, t, r, n, i, o, l) {
    o += 1;
    var s;
    if (typeof e == 'object' && e !== null) {
      for (s = 0; s < n.length; s++)
        if (n[s] === e) {
          Dt(dh, e, t, i);
          return;
        }
      if (typeof l.depthLimit < 'u' && o > l.depthLimit) {
        Dt(An, e, t, i);
        return;
      }
      if (typeof l.edgesLimit < 'u' && r + 1 > l.edgesLimit) {
        Dt(An, e, t, i);
        return;
      }
      if ((n.push(e), Array.isArray(e))) for (s = 0; s < e.length; s++) bl(e[s], s, s, n, e, o, l);
      else {
        var f = Object.keys(e);
        for (s = 0; s < f.length; s++) {
          var u = f[s];
          bl(e[u], u, s, n, e, o, l);
        }
      }
      n.pop();
    }
  }
  function f0(e, t) {
    return e < t ? -1 : e > t ? 1 : 0;
  }
  function bh(e, t, r, n) {
    typeof n > 'u' && (n = hh());
    var i = pl(e, '', 0, [], void 0, 0, n) || e,
      o;
    try {
      at.length === 0 ? (o = JSON.stringify(i, t, r)) : (o = JSON.stringify(i, ph(t), r));
    } catch {
      return JSON.stringify('[unable to serialize, circular reference is too complex to analyze]');
    } finally {
      for (; ct.length !== 0; ) {
        var l = ct.pop();
        l.length === 4 ? Object.defineProperty(l[0], l[1], l[3]) : (l[0][l[1]] = l[2]);
      }
    }
    return o;
  }
  function pl(e, t, r, n, i, o, l) {
    o += 1;
    var s;
    if (typeof e == 'object' && e !== null) {
      for (s = 0; s < n.length; s++)
        if (n[s] === e) {
          Dt(dh, e, t, i);
          return;
        }
      try {
        if (typeof e.toJSON == 'function') return;
      } catch {
        return;
      }
      if (typeof l.depthLimit < 'u' && o > l.depthLimit) {
        Dt(An, e, t, i);
        return;
      }
      if (typeof l.edgesLimit < 'u' && r + 1 > l.edgesLimit) {
        Dt(An, e, t, i);
        return;
      }
      if ((n.push(e), Array.isArray(e))) for (s = 0; s < e.length; s++) pl(e[s], s, s, n, e, o, l);
      else {
        var f = {},
          u = Object.keys(e).sort(f0);
        for (s = 0; s < u.length; s++) {
          var c = u[s];
          pl(e[c], c, s, n, e, o, l), (f[c] = e[c]);
        }
        if (typeof i < 'u') ct.push([i, t, e]), (i[t] = f);
        else return f;
      }
      n.pop();
    }
  }
  function ph(e) {
    return (
      (e =
        typeof e < 'u'
          ? e
          : function (t, r) {
              return r;
            }),
      function (t, r) {
        if (at.length > 0)
          for (var n = 0; n < at.length; n++) {
            var i = at[n];
            if (i[1] === t && i[0] === r) {
              (r = i[2]), at.splice(n, 1);
              break;
            }
          }
        return e.call(this, t, r);
      }
    );
  }
});
var yl = _((vL, _h) => {
  'use strict';
  _h.exports = c0;
  var a0 = or();
  function c0({ keyName: e, lines: t, eol: r, ident: n }) {
    let i = '',
      o = a0({ input: t, ident: n, eol: r }),
      l = `${n}${e}: ${o}${r}`.split(r);
    for (let s = 0; s < l.length; s += 1) {
      s !== 0 && (i += r);
      let f = l[s];
      if (/^\s*"stack"/.test(f)) {
        let u = /^(\s*"stack":)\s*(".*"),?$/.exec(f);
        if (u && u.length === 3) {
          let c = /^\s*/.exec(f)[0].length + 4,
            a = ' '.repeat(c),
            b = u[2];
          i += u[1] + r + a + JSON.parse(b).replace(/\n/g, r + a);
        } else i += f;
      } else i += f;
    }
    return i;
  }
});
var Tn = _((IL, wh) => {
  'use strict';
  wh.exports = p0;
  var { LOGGER_KEYS: d0 } = De(),
    gl = gh(),
    h0 = or(),
    b0 = yl();
  function p0({ log: e, excludeLoggerKeys: t = !0, skipKeys: r = [], context: n }) {
    let { EOL: i, IDENT: o, customPrettifiers: l, errorLikeObjectKeys: s, objectColorizer: f, singleLine: u } = n,
      c = [].concat(r);
    t === !0 && Array.prototype.push.apply(c, d0);
    let a = '',
      { plain: b, errors: h } = Object.entries(e).reduce(
        ({ plain: d, errors: S }, [y, w]) => {
          if (c.includes(y) === !1) {
            let g = typeof l[y] == 'function' ? l[y](w, y, e) : w;
            s.includes(y) ? (S[y] = g) : (d[y] = g);
          }
          return { plain: d, errors: S };
        },
        { plain: {}, errors: {} }
      );
    return (
      u
        ? (Object.keys(b).length > 0 && (a += f.greyMessage(gl(b))), (a += i), (a = a.replace(/\\\\/gi, '\\')))
        : Object.entries(b).forEach(([d, S]) => {
            let y = typeof l[d] == 'function' ? S : gl(S, null, 2);
            if (y === void 0) return;
            y = y.replace(/\\\\/gi, '\\');
            let w = h0({ input: y, ident: o, eol: i });
            a += `${o}${d}:${w.startsWith(i) ? '' : ' '}${w}${i}`;
          }),
      Object.entries(h).forEach(([d, S]) => {
        let y = typeof l[d] == 'function' ? S : gl(S, null, 2);
        y !== void 0 && (a += b0({ keyName: d, lines: y, eol: i, ident: o }));
      }),
      a
    );
  }
});
var _l = _((DL, Sh) => {
  'use strict';
  Sh.exports = S0;
  var { LOGGER_KEYS: y0 } = De(),
    g0 = Rn(),
    _0 = or(),
    w0 = Tn();
  function S0({ log: e, context: t }) {
    let { EOL: r, IDENT: n, errorProps: i, messageKey: o } = t,
      l = e.stack,
      s = _0({ input: l, ident: n, eol: r }),
      f = `${n}${s}${r}`;
    if (i.length > 0) {
      let u = y0.concat(o, 'type', 'stack'),
        c;
      i[0] === '*'
        ? (c = Object.keys(e).filter((a) => u.includes(a) === !1))
        : (c = i.filter((a) => u.includes(a) === !1));
      for (let a = 0; a < c.length; a += 1) {
        let b = c[a];
        if (b in e) {
          if (g0(e[b])) {
            let h = w0({ log: e[b], excludeLoggerKeys: !1, context: { ...t, IDENT: n + n } });
            f = `${f}${n}${b}: {${r}${h}${n}}${r}`;
            continue;
          }
          f = `${f}${n}${b}: ${e[b]}${r}`;
        }
      }
    }
    return f;
  }
});
var wl = _((NL, Eh) => {
  'use strict';
  Eh.exports = m0;
  var E0 = Mt();
  function m0({ log: e, context: t }) {
    let { colorizer: r, customLevels: n, customLevelNames: i, levelKey: o } = t,
      l = t.customPrettifiers?.level,
      s = E0(e, o);
    if (s !== void 0) return l ? l(s) : r(s, { customLevels: n, customLevelNames: i });
  }
});
var Sl = _((PL, Rh) => {
  'use strict';
  Rh.exports = T0;
  var { LEVELS: R0 } = De(),
    mh = Mt(),
    A0 = hl();
  function T0({ log: e, context: t }) {
    let {
      colorizer: r,
      customLevels: n,
      levelKey: i,
      levelLabel: o,
      messageFormat: l,
      messageKey: s,
      useOnlyCustomProps: f,
    } = t;
    if (l && typeof l == 'string') {
      let u = A0(l, e),
        c = String(u).replace(/{([^{}]+)}/g, function (a, b) {
          let h;
          return b === o && (h = mh(e, i)) !== void 0
            ? (f ? n === void 0 : n[h] === void 0)
              ? R0[h]
              : n[h]
            : mh(e, b) || '';
        });
      return r.message(c);
    }
    if (l && typeof l == 'function') {
      let u = l(e, s, o);
      return r.message(u);
    }
    if (s in e && !(typeof e[s] != 'string' && typeof e[s] != 'number' && typeof e[s] != 'boolean'))
      return r.message(e[s]);
  }
});
var El = _((qL, Ah) => {
  'use strict';
  Ah.exports = O0;
  function O0({ log: e, context: t }) {
    let r = t.customPrettifiers,
      n = '';
    if (e.name || e.pid || e.hostname) {
      if (((n += '('), e.name && (n += r.name ? r.name(e.name) : e.name), e.pid)) {
        let i = r.pid ? r.pid(e.pid) : e.pid;
        e.name && e.pid ? (n += '/' + i) : (n += i);
      }
      e.hostname && (n += `${n === '(' ? 'on' : ' on'} ${r.hostname ? r.hostname(e.hostname) : e.hostname}`),
        (n += ')');
    }
    if ((e.caller && (n += `${n === '' ? '' : ' '}<${r.caller ? r.caller(e.caller) : e.caller}>`), n !== '')) return n;
  }
});
var ml = _((CL, Th) => {
  'use strict';
  Th.exports = x0;
  var L0 = al();
  function x0({ log: e, context: t }) {
    let { timestampKey: r, translateTime: n } = t,
      i = t.customPrettifiers?.time,
      o = null;
    if ((r in e ? (o = e[r]) : 'timestamp' in e && (o = e.timestamp), o === null)) return;
    let l = n ? L0(o, n) : o;
    return i ? i(l) : `[${l}]`;
  }
});
var Lh = _((WL, Oh) => {
  'use strict';
  Oh.exports = {
    buildSafeSonicBoom: Wd(),
    createDate: el(),
    deleteLogProperty: tl(),
    filterLog: ul(),
    formatTime: al(),
    getPropertyValue: Mt(),
    handleCustomLevelsNamesOpts: cl(),
    handleCustomLevelsOpts: dl(),
    interpretConditionals: hl(),
    isObject: Rn(),
    isValidDate: wn(),
    joinLinesWithIndentation: or(),
    noop: Qo(),
    parseFactoryOptions: ch(),
    prettifyErrorLog: _l(),
    prettifyError: yl(),
    prettifyLevel: wl(),
    prettifyMessage: Sl(),
    prettifyMetadata: El(),
    prettifyObject: Tn(),
    prettifyTime: ml(),
    splitPropertyKey: Sn(),
  };
});
var Dh = _((kL, Nt) => {
  'use strict';
  var M0 = typeof Buffer < 'u',
    xh =
      /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/,
    Mh =
      /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
  function vh(e, t, r) {
    r == null && t !== null && typeof t == 'object' && ((r = t), (t = void 0)),
      M0 && Buffer.isBuffer(e) && (e = e.toString()),
      e && e.charCodeAt(0) === 65279 && (e = e.slice(1));
    let n = JSON.parse(e, t);
    if (n === null || typeof n != 'object') return n;
    let i = (r && r.protoAction) || 'error',
      o = (r && r.constructorAction) || 'error';
    if (i === 'ignore' && o === 'ignore') return n;
    if (i !== 'ignore' && o !== 'ignore') {
      if (xh.test(e) === !1 && Mh.test(e) === !1) return n;
    } else if (i !== 'ignore' && o === 'ignore') {
      if (xh.test(e) === !1) return n;
    } else if (Mh.test(e) === !1) return n;
    return Ih(n, { protoAction: i, constructorAction: o, safe: r && r.safe });
  }
  function Ih(e, { protoAction: t = 'error', constructorAction: r = 'error', safe: n } = {}) {
    let i = [e];
    for (; i.length; ) {
      let o = i;
      i = [];
      for (let l of o) {
        if (t !== 'ignore' && Object.prototype.hasOwnProperty.call(l, '__proto__')) {
          if (n === !0) return null;
          if (t === 'error') throw new SyntaxError('Object contains forbidden prototype property');
          delete l.__proto__;
        }
        if (
          r !== 'ignore' &&
          Object.prototype.hasOwnProperty.call(l, 'constructor') &&
          Object.prototype.hasOwnProperty.call(l.constructor, 'prototype')
        ) {
          if (n === !0) return null;
          if (r === 'error') throw new SyntaxError('Object contains forbidden prototype property');
          delete l.constructor;
        }
        for (let s in l) {
          let f = l[s];
          f && typeof f == 'object' && i.push(f);
        }
      }
    }
    return e;
  }
  function Rl(e, t, r) {
    let n = Error.stackTraceLimit;
    Error.stackTraceLimit = 0;
    try {
      return vh(e, t, r);
    } finally {
      Error.stackTraceLimit = n;
    }
  }
  function v0(e, t) {
    let r = Error.stackTraceLimit;
    Error.stackTraceLimit = 0;
    try {
      return vh(e, t, { safe: !0 });
    } catch {
      return null;
    } finally {
      Error.stackTraceLimit = r;
    }
  }
  Nt.exports = Rl;
  Nt.exports.default = Rl;
  Nt.exports.parse = Rl;
  Nt.exports.safeParse = v0;
  Nt.exports.scan = Ih;
});
var qh = _((jL, Ph) => {
  'use strict';
  Ph.exports = $0;
  var I0 = Dh(),
    Nh = Rn(),
    D0 = _l(),
    N0 = wl(),
    P0 = Sl(),
    q0 = El(),
    C0 = Tn(),
    W0 = ml(),
    k0 = ul(),
    { LEVELS: j0, LEVEL_KEY: B0, LEVEL_NAMES: Al } = De(),
    F0 = (e) => {
      try {
        return { value: I0.parse(e, { protoAction: 'remove' }) };
      } catch (t) {
        return { err: t };
      }
    };
  function $0(e) {
    let t;
    if (Nh(e)) t = e;
    else {
      let s = F0(e);
      if (s.err || !Nh(s.value)) return e + this.EOL;
      t = s.value;
    }
    if (this.minimumLevel) {
      let s;
      this.useOnlyCustomProps ? (s = this.customLevels) : (s = this.customLevelNames[this.minimumLevel] !== void 0);
      let f;
      if (
        (s ? (f = this.customLevelNames[this.minimumLevel]) : (f = Al[this.minimumLevel]),
        f ||
          (f = typeof this.minimumLevel == 'string' ? Al[this.minimumLevel] : Al[j0[this.minimumLevel].toLowerCase()]),
        t[this.levelKey === void 0 ? B0 : this.levelKey] < f)
      )
        return;
    }
    let r = P0({ log: t, context: this.context });
    (this.ignoreKeys || this.includeKeys) && (t = k0({ log: t, context: this.context }));
    let n = N0({ log: t, context: { ...this.context, ...this.context.customProperties } }),
      i = q0({ log: t, context: this.context }),
      o = W0({ log: t, context: this.context }),
      l = '';
    if (
      (this.levelFirst && n && (l = `${n}`),
      o && l === '' ? (l = `${o}`) : o && (l = `${l} ${o}`),
      !this.levelFirst && n && (l.length > 0 ? (l = `${l} ${n}`) : (l = n)),
      i && (l.length > 0 ? (l = `${l} ${i}:`) : (l = i)),
      l.endsWith(':') === !1 && l !== '' && (l += ':'),
      r !== void 0 && (l.length > 0 ? (l = `${l} ${r}`) : (l = r)),
      l.length > 0 && !this.singleLine && (l += this.EOL),
      t.type === 'Error' && t.stack)
    ) {
      let s = D0({ log: t, context: this.context });
      this.singleLine && (l += this.EOL), (l += s);
    } else if (this.hideObject === !1) {
      let s = [this.messageKey, this.levelKey, this.timestampKey].filter(
          (u) => typeof t[u] == 'string' || typeof t[u] == 'number' || typeof t[u] == 'boolean'
        ),
        f = C0({ log: t, skipKeys: s, context: this.context });
      this.singleLine && !/^\s$/.test(f) && (l += ' '), (l += f);
    }
    return l;
  }
});
var { isColorSupported: U0 } = Ln(),
  G0 = $l(),
  { Transform: H0 } = If(),
  V0 = hd(),
  K0 = Jo(),
  { ERROR_LIKE_KEYS: Y0, LEVEL_KEY: z0, LEVEL_LABEL: J0, MESSAGE_KEY: X0, TIMESTAMP_KEY: Z0 } = De(),
  { buildSafeSonicBoom: Q0, parseFactoryOptions: eO } = Lh(),
  tO = qh(),
  rO = {
    colorize: U0,
    colorizeObjects: !0,
    crlf: !1,
    customColors: null,
    customLevels: null,
    customPrettifiers: {},
    errorLikeObjectKeys: Y0,
    errorProps: '',
    hideObject: !1,
    ignore: 'hostname',
    include: void 0,
    levelFirst: !1,
    levelKey: z0,
    levelLabel: J0,
    messageFormat: null,
    messageKey: X0,
    minimumLevel: void 0,
    outputStream: process.stdout,
    singleLine: !1,
    timestampKey: Z0,
    translateTime: !0,
    useOnlyCustomProps: !0,
  };
function Ch(e) {
  let t = eO(Object.assign({}, rO, e));
  return tO.bind({ ...t, context: t });
}
function Wh(e = {}) {
  let t = Ch(e);
  return V0(
    function (r) {
      let n = new H0({
          objectMode: !0,
          autoDestroy: !0,
          transform(o, l, s) {
            let f = t(o);
            s(null, f);
          },
        }),
        i;
      return (
        typeof e.destination == 'object' && typeof e.destination.write == 'function'
          ? (i = e.destination)
          : (i = Q0({ dest: e.destination || 1, append: e.append, mkdir: e.mkdir, sync: e.sync })),
        r.on('unknown', function (o) {
          i.write(
            o +
              `
`
          );
        }),
        G0(r, n, i),
        n
      );
    },
    { parse: 'lines' }
  );
}
module.exports = Wh;
module.exports.prettyFactory = Ch;
module.exports.colorizerFactory = K0;
module.exports.default = Wh;
