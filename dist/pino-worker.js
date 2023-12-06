'use strict';
var S = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
var lr = S((tm, ai) => {
  'use strict';
  var Ge = (e) => e && typeof e.message == 'string',
    sr = (e) => {
      if (!e) return;
      let t = e.cause;
      if (typeof t == 'function') {
        let r = e.cause();
        return Ge(r) ? r : void 0;
      } else return Ge(t) ? t : void 0;
    },
    fi = (e, t) => {
      if (!Ge(e)) return '';
      let r = e.stack || '';
      if (t.has(e))
        return (
          r +
          `
causes have become circular...`
        );
      let n = sr(e);
      return n
        ? (t.add(e),
          r +
            `
caused by: ` +
            fi(n, t))
        : r;
    },
    Su = (e) => fi(e, new Set()),
    ui = (e, t, r) => {
      if (!Ge(e)) return '';
      let n = r ? '' : e.message || '';
      if (t.has(e)) return n + ': ...';
      let i = sr(e);
      if (i) {
        t.add(e);
        let o = typeof e.cause == 'function';
        return n + (o ? '' : ': ') + ui(i, t, o);
      } else return n;
    },
    Eu = (e) => ui(e, new Set());
  ai.exports = { isErrorLike: Ge, getErrorCause: sr, stackWithCauses: Su, messageWithCauses: Eu };
});
var fr = S((rm, di) => {
  'use strict';
  var Ru = Symbol('circular-ref-tag'),
    ut = Symbol('pino-raw-err-ref'),
    ci = Object.create(
      {},
      {
        type: { enumerable: !0, writable: !0, value: void 0 },
        message: { enumerable: !0, writable: !0, value: void 0 },
        stack: { enumerable: !0, writable: !0, value: void 0 },
        aggregateErrors: { enumerable: !0, writable: !0, value: void 0 },
        raw: {
          enumerable: !1,
          get: function () {
            return this[ut];
          },
          set: function (e) {
            this[ut] = e;
          },
        },
      }
    );
  Object.defineProperty(ci, ut, { writable: !0, value: {} });
  di.exports = { pinoErrProto: ci, pinoErrorSymbols: { seen: Ru, rawSymbol: ut } };
});
var yi = S((nm, pi) => {
  'use strict';
  pi.exports = ar;
  var { messageWithCauses: Au, stackWithCauses: xu, isErrorLike: hi } = lr(),
    { pinoErrProto: Tu, pinoErrorSymbols: Ou } = fr(),
    { seen: ur } = Ou,
    { toString: vu } = Object.prototype;
  function ar(e) {
    if (!hi(e)) return e;
    e[ur] = void 0;
    let t = Object.create(Tu);
    (t.type = vu.call(e.constructor) === '[object Function]' ? e.constructor.name : e.name),
      (t.message = Au(e)),
      (t.stack = xu(e)),
      Array.isArray(e.errors) && (t.aggregateErrors = e.errors.map((r) => ar(r)));
    for (let r in e)
      if (t[r] === void 0) {
        let n = e[r];
        hi(n) ? r !== 'cause' && !Object.prototype.hasOwnProperty.call(n, ur) && (t[r] = ar(n)) : (t[r] = n);
      }
    return delete e[ur], (t.raw = e), t;
  }
});
var gi = S((im, bi) => {
  'use strict';
  bi.exports = ct;
  var { isErrorLike: cr } = lr(),
    { pinoErrProto: Lu, pinoErrorSymbols: Iu } = fr(),
    { seen: at } = Iu,
    { toString: ku } = Object.prototype;
  function ct(e) {
    if (!cr(e)) return e;
    e[at] = void 0;
    let t = Object.create(Lu);
    (t.type = ku.call(e.constructor) === '[object Function]' ? e.constructor.name : e.name),
      (t.message = e.message),
      (t.stack = e.stack),
      Array.isArray(e.errors) && (t.aggregateErrors = e.errors.map((r) => ct(r))),
      cr(e.cause) && !Object.prototype.hasOwnProperty.call(e.cause, at) && (t.cause = ct(e.cause));
    for (let r in e)
      if (t[r] === void 0) {
        let n = e[r];
        cr(n) ? Object.prototype.hasOwnProperty.call(n, at) || (t[r] = ct(n)) : (t[r] = n);
      }
    return delete e[at], (t.raw = e), t;
  }
});
var Si = S((om, _i) => {
  'use strict';
  _i.exports = { mapHttpRequest: ju, reqSerializer: mi };
  var dr = Symbol('pino-raw-req-ref'),
    wi = Object.create(
      {},
      {
        id: { enumerable: !0, writable: !0, value: '' },
        method: { enumerable: !0, writable: !0, value: '' },
        url: { enumerable: !0, writable: !0, value: '' },
        query: { enumerable: !0, writable: !0, value: '' },
        params: { enumerable: !0, writable: !0, value: '' },
        headers: { enumerable: !0, writable: !0, value: {} },
        remoteAddress: { enumerable: !0, writable: !0, value: '' },
        remotePort: { enumerable: !0, writable: !0, value: '' },
        raw: {
          enumerable: !1,
          get: function () {
            return this[dr];
          },
          set: function (e) {
            this[dr] = e;
          },
        },
      }
    );
  Object.defineProperty(wi, dr, { writable: !0, value: {} });
  function mi(e) {
    let t = e.info || e.socket,
      r = Object.create(wi);
    if (
      ((r.id = typeof e.id == 'function' ? e.id() : e.id || (e.info ? e.info.id : void 0)),
      (r.method = e.method),
      e.originalUrl)
    )
      r.url = e.originalUrl;
    else {
      let n = e.path;
      r.url = typeof n == 'string' ? n : e.url ? e.url.path || e.url : void 0;
    }
    return (
      e.query && (r.query = e.query),
      e.params && (r.params = e.params),
      (r.headers = e.headers),
      (r.remoteAddress = t && t.remoteAddress),
      (r.remotePort = t && t.remotePort),
      (r.raw = e.raw || e),
      r
    );
  }
  function ju(e) {
    return { req: mi(e) };
  }
});
var xi = S((sm, Ai) => {
  'use strict';
  Ai.exports = { mapHttpResponse: Pu, resSerializer: Ri };
  var hr = Symbol('pino-raw-res-ref'),
    Ei = Object.create(
      {},
      {
        statusCode: { enumerable: !0, writable: !0, value: 0 },
        headers: { enumerable: !0, writable: !0, value: '' },
        raw: {
          enumerable: !1,
          get: function () {
            return this[hr];
          },
          set: function (e) {
            this[hr] = e;
          },
        },
      }
    );
  Object.defineProperty(Ei, hr, { writable: !0, value: {} });
  function Ri(e) {
    let t = Object.create(Ei);
    return (
      (t.statusCode = e.headersSent ? e.statusCode : null),
      (t.headers = e.getHeaders ? e.getHeaders() : e._headers),
      (t.raw = e),
      t
    );
  }
  function Pu(e) {
    return { res: Ri(e) };
  }
});
var yr = S((lm, Ti) => {
  'use strict';
  var pr = yi(),
    qu = gi(),
    dt = Si(),
    ht = xi();
  Ti.exports = {
    err: pr,
    errWithCause: qu,
    mapHttpRequest: dt.mapHttpRequest,
    mapHttpResponse: ht.mapHttpResponse,
    req: dt.reqSerializer,
    res: ht.resSerializer,
    wrapErrorSerializer: function (t) {
      return t === pr
        ? t
        : function (n) {
            return t(pr(n));
          };
    },
    wrapRequestSerializer: function (t) {
      return t === dt.reqSerializer
        ? t
        : function (n) {
            return t(dt.reqSerializer(n));
          };
    },
    wrapResponseSerializer: function (t) {
      return t === ht.resSerializer
        ? t
        : function (n) {
            return t(ht.resSerializer(n));
          };
    },
  };
});
var br = S((fm, Oi) => {
  'use strict';
  function Nu(e, t) {
    return t;
  }
  Oi.exports = function () {
    let t = Error.prepareStackTrace;
    Error.prepareStackTrace = Nu;
    let r = new Error().stack;
    if (((Error.prepareStackTrace = t), !Array.isArray(r))) return;
    let n = r.slice(2),
      i = [];
    for (let o of n) o && i.push(o.getFileName());
    return i;
  };
});
var Li = S((um, vi) => {
  'use strict';
  vi.exports = Du;
  function Du(e = {}) {
    let {
      ERR_PATHS_MUST_BE_STRINGS: t = () => 'fast-redact - Paths must be (non-empty) strings',
      ERR_INVALID_PATH: r = (n) => `fast-redact \u2013 Invalid path (${n})`,
    } = e;
    return function ({ paths: i }) {
      i.forEach((o) => {
        if (typeof o != 'string') throw Error(t());
        try {
          if (/〇/.test(o)) throw Error();
          let s =
            (o[0] === '[' ? '' : '.') +
            o
              .replace(/^\*/, '\u3007')
              .replace(/\.\*/g, '.\u3007')
              .replace(/\[\*\]/g, '[\u3007]');
          if (/\n|\r|;/.test(s) || /\/\*/.test(s)) throw Error();
          Function(`
            'use strict'
            const o = new Proxy({}, { get: () => o, set: () => { throw Error() } });
            const \u3007 = null;
            o${s}
            if ([o${s}].length !== 1) throw Error()`)();
        } catch {
          throw Error(r(o));
        }
      });
    };
  }
});
var pt = S((am, Ii) => {
  'use strict';
  Ii.exports = /[^.[\]]+|\[((?:.)*?)\]/g;
});
var ji = S((cm, ki) => {
  'use strict';
  var $u = pt();
  ki.exports = Mu;
  function Mu({ paths: e }) {
    let t = [];
    var r = 0;
    let n = e.reduce(function (i, o, s) {
      var f = o.match($u).map((u) => u.replace(/'|"|`/g, ''));
      let a = o[0] === '[';
      f = f.map((u) => (u[0] === '[' ? u.substr(1, u.length - 2) : u));
      let c = f.indexOf('*');
      if (c > -1) {
        let u = f.slice(0, c),
          h = u.join('.'),
          p = f.slice(c + 1, f.length),
          l = p.length > 0;
        r++, t.push({ before: u, beforeStr: h, after: p, nested: l });
      } else i[o] = { path: f, val: void 0, precensored: !1, circle: '', escPath: JSON.stringify(o), leadingBracket: a };
      return i;
    }, {});
    return { wildcards: t, wcLen: r, secret: n };
  }
});
var qi = S((dm, Pi) => {
  'use strict';
  var Cu = pt();
  Pi.exports = Wu;
  function Wu({ secret: e, serialize: t, wcLen: r, strict: n, isCensorFct: i, censorFctTakesPath: o }, s) {
    let f = Function(
      'o',
      `
    if (typeof o !== 'object' || o == null) {
      ${Vu(n, t)}
    }
    const { censor, secret } = this
    ${Bu(e, i, o)}
    this.compileRestore()
    ${Fu(r > 0, i, o)}
    ${Uu(t)}
  `
    ).bind(s);
    return t === !1 && (f.restore = (a) => s.restore(a)), f;
  }
  function Bu(e, t, r) {
    return Object.keys(e).map((n) => {
      let { escPath: i, leadingBracket: o, path: s } = e[n],
        f = o ? 1 : 0,
        a = o ? '' : '.',
        c = [];
      for (var u; (u = Cu.exec(n)) !== null; ) {
        let [, d] = u,
          { index: g, input: w } = u;
        g > f && c.push(w.substring(0, g - (d ? 0 : 1)));
      }
      var h = c.map((d) => `o${a}${d}`).join(' && ');
      h.length === 0 ? (h += `o${a}${n} != null`) : (h += ` && o${a}${n} != null`);
      let p = `
      switch (true) {
        ${c.reverse().map(
          (d) => `
          case o${a}${d} === censor:
            secret[${i}].circle = ${JSON.stringify(d)}
            break
        `
        ).join(`
`)}
      }
    `,
        l = r ? `val, ${JSON.stringify(s)}` : 'val';
      return `
      if (${h}) {
        const val = o${a}${n}
        if (val === censor) {
          secret[${i}].precensored = true
        } else {
          secret[${i}].val = val
          o${a}${n} = ${t ? `censor(${l})` : 'censor'}
          ${p}
        }
      }
    `;
    }).join(`
`);
  }
  function Fu(e, t, r) {
    return e === !0
      ? `
    {
      const { wildcards, wcLen, groupRedact, nestedRedact } = this
      for (var i = 0; i < wcLen; i++) {
        const { before, beforeStr, after, nested } = wildcards[i]
        if (nested === true) {
          secret[beforeStr] = secret[beforeStr] || []
          nestedRedact(secret[beforeStr], o, before, after, censor, ${t}, ${r})
        } else secret[beforeStr] = groupRedact(o, before, censor, ${t}, ${r})
      }
    }
  `
      : '';
  }
  function Uu(e) {
    return e === !1
      ? 'return o'
      : `
    var s = this.serialize(o)
    this.restore(o)
    return s
  `;
  }
  function Vu(e, t) {
    return e === !0
      ? "throw Error('fast-redact: primitives cannot be redacted')"
      : t === !1
      ? 'return o'
      : 'return this.serialize(o)';
  }
});
var gr = S((hm, Mi) => {
  'use strict';
  Mi.exports = { groupRedact: Gu, groupRestore: zu, nestedRedact: Ku, nestedRestore: Hu };
  function zu({ keys: e, values: t, target: r }) {
    if (r == null) return;
    let n = e.length;
    for (var i = 0; i < n; i++) {
      let o = e[i];
      r[o] = t[i];
    }
  }
  function Gu(e, t, r, n, i) {
    let o = Ni(e, t);
    if (o == null) return { keys: null, values: null, target: null, flat: !0 };
    let s = Object.keys(o),
      f = s.length,
      a = t.length,
      c = i ? [...t] : void 0,
      u = new Array(f);
    for (var h = 0; h < f; h++) {
      let p = s[h];
      (u[h] = o[p]), i ? ((c[a] = p), (o[p] = r(o[p], c))) : n ? (o[p] = r(o[p])) : (o[p] = r);
    }
    return { keys: s, values: u, target: o, flat: !0 };
  }
  function Hu(e) {
    let t = e.length;
    for (var r = 0; r < t; r++) {
      let { key: i, target: o, value: s, level: f } = e[r];
      if (f === 0 || f === 1) {
        if ((qe(o, i) && (o[i] = s), typeof o == 'object')) {
          let a = Object.keys(o);
          for (var n = 0; n < a.length; n++) {
            let c = a[n],
              u = o[c];
            qe(u, i) && (u[i] = s);
          }
        }
      } else $i(i, o, s, f);
    }
  }
  function Ku(e, t, r, n, i, o, s) {
    let f = Ni(t, r);
    if (f == null) return;
    let a = Object.keys(f),
      c = a.length;
    for (var u = 0; u < c; u++) {
      let h = a[u],
        { value: p, parent: l, exists: d, level: g } = Ju(f, h, r, n, i, o, s);
      d === !0 && l !== null && e.push({ key: n[n.length - 1], target: l, value: p, level: g });
    }
    return e;
  }
  function qe(e, t) {
    return e != null ? ('hasOwn' in Object ? Object.hasOwn(e, t) : Object.prototype.hasOwnProperty.call(e, t)) : !1;
  }
  function Ju(e, t, r, n, i, o, s) {
    let f = n.length,
      a = f - 1,
      c = t;
    var u = -1,
      h,
      p,
      l,
      d = null,
      g = !0,
      w = null,
      _,
      y,
      m = !1,
      E = 0;
    if (((l = h = e[t]), typeof h != 'object')) return { value: null, parent: null, exists: g };
    for (; h != null && ++u < f; ) {
      if (((t = n[u]), (d = l), t !== '*' && !w && !(typeof h == 'object' && t in h))) {
        g = !1;
        break;
      }
      if (!(t === '*' && (w === '*' && (m = !0), (w = t), u !== a))) {
        if (w) {
          let x = Object.keys(h);
          for (var R = 0; R < x.length; R++) {
            let L = x[R];
            (y = h[L]),
              (_ = t === '*'),
              m
                ? ((E = u), (l = Di(y, E - 1, t, r, n, i, o, s, c, h, p, l, _, L, u, a, g)))
                : (_ || (typeof y == 'object' && y !== null && t in y)) &&
                  (_ ? (l = y) : (l = y[t]),
                  (p = u !== a ? l : o ? (s ? i(l, [...r, c, ...n]) : i(l)) : i),
                  _
                    ? (h[L] = p)
                    : y[t] === p
                    ? (g = !1)
                    : (y[t] = (p === void 0 && i !== void 0) || (qe(y, t) && p === l) ? y[t] : p));
          }
          w = null;
        } else
          (l = h[t]),
            (p = u !== a ? l : o ? (s ? i(l, [...r, c, ...n]) : i(l)) : i),
            (h[t] = (qe(h, t) && p === l) || (p === void 0 && i !== void 0) ? h[t] : p),
            (h = h[t]);
        if (typeof h != 'object') break;
        (l === d || typeof l > 'u') && (g = !1);
      }
    }
    return { value: l, parent: d, exists: g, level: E };
  }
  function Ni(e, t) {
    for (var r = -1, n = t.length, i = e; i != null && ++r < n; ) i = i[t[r]];
    return i;
  }
  function Di(e, t, r, n, i, o, s, f, a, c, u, h, p, l, d, g, w) {
    if (t === 0)
      return (
        (p || (typeof e == 'object' && e !== null && r in e)) &&
          (p ? (h = e) : (h = e[r]),
          (u = d !== g ? h : s ? (f ? o(h, [...n, a, ...i]) : o(h)) : o),
          p
            ? (c[l] = u)
            : e[r] === u
            ? (w = !1)
            : (e[r] = (u === void 0 && o !== void 0) || (qe(e, r) && u === h) ? e[r] : u)),
        h
      );
    for (let y in e)
      if (typeof e[y] == 'object') {
        var _ = Di(e[y], t - 1, r, n, i, o, s, f, a, c, u, h, p, l, d, g, w);
        return _;
      }
  }
  function $i(e, t, r, n) {
    if (n === 0) {
      qe(t, e) && (t[e] = r);
      return;
    }
    for (let i in t) typeof t[i] == 'object' && $i(e, t[i], r, n - 1);
  }
});
var Wi = S((pm, Ci) => {
  'use strict';
  var { groupRestore: Yu, nestedRestore: Xu } = gr();
  Ci.exports = Qu;
  function Qu({ secret: e, wcLen: t }) {
    return function () {
      if (this.restore) return;
      let n = Object.keys(e),
        i = Zu(e, n),
        o = t > 0,
        s = o ? { secret: e, groupRestore: Yu, nestedRestore: Xu } : { secret: e };
      this.restore = Function('o', ea(i, n, o)).bind(s);
    };
  }
  function Zu(e, t) {
    return t
      .map((r) => {
        let { circle: n, escPath: i, leadingBracket: o } = e[r],
          f = n ? `o.${n} = secret[${i}].val` : `o${o ? '' : '.'}${r} = secret[${i}].val`,
          a = `secret[${i}].val = undefined`;
        return `
      if (secret[${i}].val !== undefined) {
        try { ${f} } catch (e) {}
        ${a}
      }
    `;
      })
      .join('');
  }
  function ea(e, t, r) {
    return `
    const secret = this.secret
    ${
      r === !0
        ? `
    const keys = Object.keys(secret)
    const len = keys.length
    for (var i = len - 1; i >= ${t.length}; i--) {
      const k = keys[i]
      const o = secret[k]
      if (o.flat === true) this.groupRestore(o)
      else this.nestedRestore(o)
      secret[k] = null
    }
  `
        : ''
    }
    ${e}
    return o
  `;
  }
});
var Fi = S((ym, Bi) => {
  'use strict';
  Bi.exports = ta;
  function ta(e) {
    let {
        secret: t,
        censor: r,
        compileRestore: n,
        serialize: i,
        groupRedact: o,
        nestedRedact: s,
        wildcards: f,
        wcLen: a,
      } = e,
      c = [{ secret: t, censor: r, compileRestore: n }];
    return (
      i !== !1 && c.push({ serialize: i }),
      a > 0 && c.push({ groupRedact: o, nestedRedact: s, wildcards: f, wcLen: a }),
      Object.assign(...c)
    );
  }
});
var zi = S((bm, Vi) => {
  'use strict';
  var Ui = Li(),
    ra = ji(),
    na = qi(),
    ia = Wi(),
    { groupRedact: oa, nestedRedact: sa } = gr(),
    la = Fi(),
    fa = pt(),
    ua = Ui(),
    wr = (e) => e;
  wr.restore = wr;
  var aa = '[REDACTED]';
  mr.rx = fa;
  mr.validator = Ui;
  Vi.exports = mr;
  function mr(e = {}) {
    let t = Array.from(new Set(e.paths || [])),
      r = 'serialize' in e && (e.serialize === !1 || typeof e.serialize == 'function') ? e.serialize : JSON.stringify,
      n = e.remove;
    if (n === !0 && r !== JSON.stringify)
      throw Error('fast-redact \u2013 remove option may only be set when serializer is JSON.stringify');
    let i = n === !0 ? void 0 : 'censor' in e ? e.censor : aa,
      o = typeof i == 'function',
      s = o && i.length > 1;
    if (t.length === 0) return r || wr;
    ua({ paths: t, serialize: r, censor: i });
    let { wildcards: f, wcLen: a, secret: c } = ra({ paths: t, censor: i }),
      u = ia({ secret: c, wcLen: a }),
      h = 'strict' in e ? e.strict : !0;
    return na(
      { secret: c, wcLen: a, serialize: r, strict: h, isCensorFct: o, censorFctTakesPath: s },
      la({
        secret: c,
        censor: i,
        compileRestore: u,
        serialize: r,
        groupRedact: oa,
        nestedRedact: sa,
        wildcards: f,
        wcLen: a,
      })
    );
  }
});
var Ne = S((gm, Gi) => {
  'use strict';
  var ca = Symbol('pino.setLevel'),
    da = Symbol('pino.getLevel'),
    ha = Symbol('pino.levelVal'),
    pa = Symbol('pino.useLevelLabels'),
    ya = Symbol('pino.useOnlyCustomLevels'),
    ba = Symbol('pino.mixin'),
    ga = Symbol('pino.lsCache'),
    wa = Symbol('pino.chindings'),
    ma = Symbol('pino.asJson'),
    _a = Symbol('pino.write'),
    Sa = Symbol('pino.redactFmt'),
    Ea = Symbol('pino.time'),
    Ra = Symbol('pino.timeSliceIndex'),
    Aa = Symbol('pino.stream'),
    xa = Symbol('pino.stringify'),
    Ta = Symbol('pino.stringifySafe'),
    Oa = Symbol('pino.stringifiers'),
    va = Symbol('pino.end'),
    La = Symbol('pino.formatOpts'),
    Ia = Symbol('pino.messageKey'),
    ka = Symbol('pino.errorKey'),
    ja = Symbol('pino.nestedKey'),
    Pa = Symbol('pino.nestedKeyStr'),
    qa = Symbol('pino.mixinMergeStrategy'),
    Na = Symbol('pino.msgPrefix'),
    Da = Symbol('pino.wildcardFirst'),
    $a = Symbol.for('pino.serializers'),
    Ma = Symbol.for('pino.formatters'),
    Ca = Symbol.for('pino.hooks'),
    Wa = Symbol.for('pino.metadata');
  Gi.exports = {
    setLevelSym: ca,
    getLevelSym: da,
    levelValSym: ha,
    useLevelLabelsSym: pa,
    mixinSym: ba,
    lsCacheSym: ga,
    chindingsSym: wa,
    asJsonSym: ma,
    writeSym: _a,
    serializersSym: $a,
    redactFmtSym: Sa,
    timeSym: Ea,
    timeSliceIndexSym: Ra,
    streamSym: Aa,
    stringifySym: xa,
    stringifySafeSym: Ta,
    stringifiersSym: Oa,
    endSym: va,
    formatOptsSym: La,
    messageKeySym: Ia,
    errorKeySym: ka,
    nestedKeySym: ja,
    wildcardFirstSym: Da,
    needsMetadataGsym: Wa,
    useOnlyCustomLevelsSym: ya,
    formattersSym: Ma,
    hooksSym: Ca,
    nestedKeyStrSym: Pa,
    mixinMergeStrategySym: qa,
    msgPrefixSym: Na,
  };
});
var Er = S((wm, Yi) => {
  'use strict';
  var Sr = zi(),
    { redactFmtSym: Ba, wildcardFirstSym: yt } = Ne(),
    { rx: _r, validator: Fa } = Sr,
    Hi = Fa({
      ERR_PATHS_MUST_BE_STRINGS: () => 'pino \u2013 redacted paths must be strings',
      ERR_INVALID_PATH: (e) => `pino \u2013 redact paths array contains an invalid path (${e})`,
    }),
    Ki = '[Redacted]',
    Ji = !1;
  function Ua(e, t) {
    let { paths: r, censor: n } = Va(e),
      i = r.reduce((f, a) => {
        _r.lastIndex = 0;
        let c = _r.exec(a),
          u = _r.exec(a),
          h = c[1] !== void 0 ? c[1].replace(/^(?:"|'|`)(.*)(?:"|'|`)$/, '$1') : c[0];
        if ((h === '*' && (h = yt), u === null)) return (f[h] = null), f;
        if (f[h] === null) return f;
        let { index: p } = u,
          l = `${a.substr(p, a.length - 1)}`;
        return (
          (f[h] = f[h] || []),
          h !== yt && f[h].length === 0 && f[h].push(...(f[yt] || [])),
          h === yt &&
            Object.keys(f).forEach(function (d) {
              f[d] && f[d].push(l);
            }),
          f[h].push(l),
          f
        );
      }, {}),
      o = { [Ba]: Sr({ paths: r, censor: n, serialize: t, strict: Ji }) },
      s = (...f) => t(typeof n == 'function' ? n(...f) : n);
    return [...Object.keys(i), ...Object.getOwnPropertySymbols(i)].reduce((f, a) => {
      if (i[a] === null) f[a] = (c) => s(c, [a]);
      else {
        let c = typeof n == 'function' ? (u, h) => n(u, [a, ...h]) : n;
        f[a] = Sr({ paths: i[a], censor: c, serialize: t, strict: Ji });
      }
      return f;
    }, o);
  }
  function Va(e) {
    if (Array.isArray(e)) return (e = { paths: e, censor: Ki }), Hi(e), e;
    let { paths: t, censor: r = Ki, remove: n } = e;
    if (Array.isArray(t) === !1) throw Error('pino \u2013 redact must contain an array of strings');
    return n === !0 && (r = void 0), Hi({ paths: t, censor: r }), { paths: t, censor: r };
  }
  Yi.exports = Ua;
});
var Qi = S((mm, Xi) => {
  'use strict';
  var za = () => '',
    Ga = () => `,"time":${Date.now()}`,
    Ha = () => `,"time":${Math.round(Date.now() / 1e3)}`,
    Ka = () => `,"time":"${new Date(Date.now()).toISOString()}"`;
  Xi.exports = { nullTime: za, epochTime: Ga, unixTime: Ha, isoTime: Ka };
});
var eo = S((_m, Zi) => {
  'use strict';
  function Ja(e) {
    try {
      return JSON.stringify(e);
    } catch {
      return '"[Circular]"';
    }
  }
  Zi.exports = Ya;
  function Ya(e, t, r) {
    var n = (r && r.stringify) || Ja,
      i = 1;
    if (typeof e == 'object' && e !== null) {
      var o = t.length + i;
      if (o === 1) return e;
      var s = new Array(o);
      s[0] = n(e);
      for (var f = 1; f < o; f++) s[f] = n(t[f]);
      return s.join(' ');
    }
    if (typeof e != 'string') return e;
    var a = t.length;
    if (a === 0) return e;
    for (var c = '', u = 1 - i, h = -1, p = (e && e.length) || 0, l = 0; l < p; ) {
      if (e.charCodeAt(l) === 37 && l + 1 < p) {
        switch (((h = h > -1 ? h : 0), e.charCodeAt(l + 1))) {
          case 100:
          case 102:
            if (u >= a || t[u] == null) break;
            h < l && (c += e.slice(h, l)), (c += Number(t[u])), (h = l + 2), l++;
            break;
          case 105:
            if (u >= a || t[u] == null) break;
            h < l && (c += e.slice(h, l)), (c += Math.floor(Number(t[u]))), (h = l + 2), l++;
            break;
          case 79:
          case 111:
          case 106:
            if (u >= a || t[u] === void 0) break;
            h < l && (c += e.slice(h, l));
            var d = typeof t[u];
            if (d === 'string') {
              (c += "'" + t[u] + "'"), (h = l + 2), l++;
              break;
            }
            if (d === 'function') {
              (c += t[u].name || '<anonymous>'), (h = l + 2), l++;
              break;
            }
            (c += n(t[u])), (h = l + 2), l++;
            break;
          case 115:
            if (u >= a) break;
            h < l && (c += e.slice(h, l)), (c += String(t[u])), (h = l + 2), l++;
            break;
          case 37:
            h < l && (c += e.slice(h, l)), (c += '%'), (h = l + 2), l++, u--;
            break;
        }
        ++u;
      }
      ++l;
    }
    return h === -1 ? e : (h < p && (c += e.slice(h)), c);
  }
});
var Ar = S((Sm, Rr) => {
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
    Rr.exports = t;
  } else {
    let e = function (t) {
      if ((t > 0 && t < 1 / 0) === !1)
        throw typeof t != 'number' && typeof t != 'bigint'
          ? TypeError('sleep: ms must be a number')
          : RangeError('sleep: ms must be a number that is greater than 0 but less than Infinity');
      let n = Date.now() + Number(t);
      for (; n > Date.now(); );
    };
    Rr.exports = e;
  }
});
var fo = S((Em, lo) => {
  'use strict';
  var q = require('fs'),
    Xa = require('events'),
    Qa = require('util').inherits,
    to = require('path'),
    xr = Ar(),
    bt = 100,
    gt = Buffer.allocUnsafe(0),
    Za = 16 * 1024,
    ro = 'buffer',
    no = 'utf8';
  function io(e, t) {
    (t._opening = !0), (t._writing = !0), (t._asyncDrainScheduled = !1);
    function r(o, s) {
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
      (t.fd = s),
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
        t.mkdir && q.mkdirSync(to.dirname(e), { recursive: !0 });
        let o = q.openSync(e, n, i);
        r(null, o);
      } catch (o) {
        throw (r(o), o);
      }
    else
      t.mkdir
        ? q.mkdir(to.dirname(e), { recursive: !0 }, (o) => {
            if (o) return r(o);
            q.open(e, n, i, r);
          })
        : q.open(e, n, i, r);
  }
  function K(e) {
    if (!(this instanceof K)) return new K(e);
    let {
      fd: t,
      dest: r,
      minLength: n,
      maxLength: i,
      maxWrite: o,
      sync: s,
      append: f = !0,
      mkdir: a,
      retryEAGAIN: c,
      fsync: u,
      contentMode: h,
      mode: p,
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
      (this.maxWrite = o || Za),
      (this.sync = s || !1),
      (this.writable = !0),
      (this._fsync = u || !1),
      (this.append = f || !1),
      (this.mode = p),
      (this.retryEAGAIN = c || (() => !0)),
      (this.mkdir = a || !1);
    let l, d;
    if (h === ro)
      (this._writingBuf = gt),
        (this.write = rc),
        (this.flush = ic),
        (this.flushSync = sc),
        (this._actualWrite = fc),
        (l = () => q.writeSync(this.fd, this._writingBuf)),
        (d = () => q.write(this.fd, this._writingBuf, this.release));
    else if (h === void 0 || h === no)
      (this._writingBuf = ''),
        (this.write = tc),
        (this.flush = nc),
        (this.flushSync = oc),
        (this._actualWrite = lc),
        (l = () => q.writeSync(this.fd, this._writingBuf, 'utf8')),
        (d = () => q.write(this.fd, this._writingBuf, 'utf8', this.release));
    else throw new Error(`SonicBoom supports "${no}" and "${ro}", but passed ${h}`);
    if (typeof t == 'number') (this.fd = t), process.nextTick(() => this.emit('ready'));
    else if (typeof t == 'string') io(t, this);
    else throw new Error('SonicBoom supports only file descriptors and files');
    if (this.minLength >= this.maxWrite)
      throw new Error(`minLength should be smaller than maxWrite (${this.maxWrite})`);
    (this.release = (g, w) => {
      if (g) {
        if (
          (g.code === 'EAGAIN' || g.code === 'EBUSY') &&
          this.retryEAGAIN(g, this._writingBuf.length, this._len - this._writingBuf.length)
        )
          if (this.sync)
            try {
              xr(bt), this.release(void 0, 0);
            } catch (y) {
              this.release(y);
            }
          else setTimeout(d, bt);
        else (this._writing = !1), this.emit('error', g);
        return;
      }
      if (
        (this.emit('write', w),
        (this._len -= w),
        this._len < 0 && (this._len = 0),
        (this._writingBuf = this._writingBuf.slice(w)),
        this._writingBuf.length)
      ) {
        if (!this.sync) {
          d();
          return;
        }
        try {
          do {
            let y = l();
            (this._len -= y), (this._writingBuf = this._writingBuf.slice(y));
          } while (this._writingBuf.length);
        } catch (y) {
          this.release(y);
          return;
        }
      }
      this._fsync && q.fsyncSync(this.fd);
      let _ = this._len;
      this._reopening
        ? ((this._writing = !1), (this._reopening = !1), this.reopen())
        : _ > this.minLength
        ? this._actualWrite()
        : this._ending
        ? _ > 0
          ? this._actualWrite()
          : ((this._writing = !1), wt(this))
        : ((this._writing = !1),
          this.sync
            ? this._asyncDrainScheduled || ((this._asyncDrainScheduled = !0), process.nextTick(ec, this))
            : this.emit('drain'));
    }),
      this.on('newListener', function (g) {
        g === 'drain' && (this._asyncDrainScheduled = !1);
      });
  }
  function ec(e) {
    e.listenerCount('drain') > 0 && ((e._asyncDrainScheduled = !1), e.emit('drain'));
  }
  Qa(K, Xa);
  function oo(e, t) {
    return e.length === 0 ? gt : e.length === 1 ? e[0] : Buffer.concat(e, t);
  }
  function tc(e) {
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
  function rc(e) {
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
  function so(e) {
    this._flushPending = !0;
    let t = () => {
        this._fsync
          ? ((this._flushPending = !1), e())
          : q.fsync(this.fd, (n) => {
              (this._flushPending = !1), e(n);
            }),
          this.off('error', r);
      },
      r = (n) => {
        (this._flushPending = !1), e(n), this.off('drain', t);
      };
    this.once('drain', t), this.once('error', r);
  }
  function nc(e) {
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
    e && so.call(this, e), !this._writing && (this._bufs.length === 0 && this._bufs.push(''), this._actualWrite());
  }
  function ic(e) {
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
    e && so.call(this, e),
      !this._writing && (this._bufs.length === 0 && (this._bufs.push([]), this._lens.push(0)), this._actualWrite());
  }
  K.prototype.reopen = function (e) {
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
        q.close(t, (r) => {
          if (r) return this.emit('error', r);
        });
    }),
      io(e || this.file, this);
  };
  K.prototype.end = function () {
    if (this.destroyed) throw new Error('SonicBoom destroyed');
    if (this._opening) {
      this.once('ready', () => {
        this.end();
      });
      return;
    }
    this._ending ||
      ((this._ending = !0), !this._writing && (this._len > 0 && this.fd >= 0 ? this._actualWrite() : wt(this)));
  };
  function oc() {
    if (this.destroyed) throw new Error('SonicBoom destroyed');
    if (this.fd < 0) throw new Error('sonic boom is not ready yet');
    !this._writing && this._writingBuf.length > 0 && (this._bufs.unshift(this._writingBuf), (this._writingBuf = ''));
    let e = '';
    for (; this._bufs.length || e; ) {
      e.length <= 0 && (e = this._bufs[0]);
      try {
        let t = q.writeSync(this.fd, e, 'utf8');
        (e = e.slice(t)), (this._len = Math.max(this._len - t, 0)), e.length <= 0 && this._bufs.shift();
      } catch (t) {
        if ((t.code === 'EAGAIN' || t.code === 'EBUSY') && !this.retryEAGAIN(t, e.length, this._len - e.length))
          throw t;
        xr(bt);
      }
    }
    try {
      q.fsyncSync(this.fd);
    } catch {}
  }
  function sc() {
    if (this.destroyed) throw new Error('SonicBoom destroyed');
    if (this.fd < 0) throw new Error('sonic boom is not ready yet');
    !this._writing && this._writingBuf.length > 0 && (this._bufs.unshift([this._writingBuf]), (this._writingBuf = gt));
    let e = gt;
    for (; this._bufs.length || e.length; ) {
      e.length <= 0 && (e = oo(this._bufs[0], this._lens[0]));
      try {
        let t = q.writeSync(this.fd, e);
        (e = e.subarray(t)),
          (this._len = Math.max(this._len - t, 0)),
          e.length <= 0 && (this._bufs.shift(), this._lens.shift());
      } catch (t) {
        if ((t.code === 'EAGAIN' || t.code === 'EBUSY') && !this.retryEAGAIN(t, e.length, this._len - e.length))
          throw t;
        xr(bt);
      }
    }
  }
  K.prototype.destroy = function () {
    this.destroyed || wt(this);
  };
  function lc() {
    let e = this.release;
    if (((this._writing = !0), (this._writingBuf = this._writingBuf || this._bufs.shift() || ''), this.sync))
      try {
        let t = q.writeSync(this.fd, this._writingBuf, 'utf8');
        e(null, t);
      } catch (t) {
        e(t);
      }
    else q.write(this.fd, this._writingBuf, 'utf8', e);
  }
  function fc() {
    let e = this.release;
    if (
      ((this._writing = !0),
      (this._writingBuf = this._writingBuf.length ? this._writingBuf : oo(this._bufs.shift(), this._lens.shift())),
      this.sync)
    )
      try {
        let t = q.writeSync(this.fd, this._writingBuf);
        e(null, t);
      } catch (t) {
        e(t);
      }
    else q.write(this.fd, this._writingBuf, e);
  }
  function wt(e) {
    if (e.fd === -1) {
      e.once('ready', wt.bind(null, e));
      return;
    }
    (e.destroyed = !0), (e._bufs = []), (e._lens = []), q.fsync(e.fd, t);
    function t() {
      e.fd !== 1 && e.fd !== 2 ? q.close(e.fd, r) : r();
    }
    function r(n) {
      if (n) {
        e.emit('error', n);
        return;
      }
      e._ending && !e._writing && e.emit('finish'), e.emit('close');
    }
  }
  K.SonicBoom = K;
  K.default = K;
  lo.exports = K;
});
var Tr = S((Rm, yo) => {
  'use strict';
  var ce = { exit: [], beforeExit: [] },
    uo = { exit: ac, beforeExit: cc },
    ao = new FinalizationRegistry(dc);
  function uc(e) {
    ce[e].length > 0 || process.on(e, uo[e]);
  }
  function co(e) {
    ce[e].length > 0 || process.removeListener(e, uo[e]);
  }
  function ac() {
    ho('exit');
  }
  function cc() {
    ho('beforeExit');
  }
  function ho(e) {
    for (let t of ce[e]) {
      let r = t.deref(),
        n = t.fn;
      r !== void 0 && n(r, e);
    }
  }
  function dc(e) {
    for (let t of ['exit', 'beforeExit']) {
      let r = ce[t].indexOf(e);
      ce[t].splice(r, r + 1), co(t);
    }
  }
  function po(e, t, r) {
    if (t === void 0) throw new Error("the object can't be undefined");
    uc(e);
    let n = new WeakRef(t);
    (n.fn = r), ao.register(t, n), ce[e].push(n);
  }
  function hc(e, t) {
    po('exit', e, t);
  }
  function pc(e, t) {
    po('beforeExit', e, t);
  }
  function yc(e) {
    ao.unregister(e);
    for (let t of ['exit', 'beforeExit'])
      (ce[t] = ce[t].filter((r) => {
        let n = r.deref();
        return n && n !== e;
      })),
        co(t);
  }
  yo.exports = { register: hc, registerBeforeExit: pc, unregister: yc };
});
var bo = S((Am, bc) => {
  bc.exports = {
    name: 'thread-stream',
    version: '2.3.0',
    description: 'A streaming way to send data to a Node.js Worker Thread',
    main: 'index.js',
    types: 'index.d.ts',
    dependencies: { 'real-require': '^0.2.0' },
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
    repository: { type: 'git', url: 'git+https://github.com/mcollina/thread-stream.git' },
    keywords: ['worker', 'thread', 'threads', 'stream'],
    author: 'Matteo Collina <hello@matteocollina.com>',
    license: 'MIT',
    bugs: { url: 'https://github.com/mcollina/thread-stream/issues' },
    homepage: 'https://github.com/mcollina/thread-stream#readme',
  };
});
var wo = S((xm, go) => {
  'use strict';
  function gc(e, t, r, n, i) {
    let o = Date.now() + n,
      s = Atomics.load(e, t);
    if (s === r) {
      i(null, 'ok');
      return;
    }
    let f = s,
      a = (c) => {
        Date.now() > o
          ? i(null, 'timed-out')
          : setTimeout(() => {
              (f = s),
                (s = Atomics.load(e, t)),
                s === f ? a(c >= 1e3 ? 1e3 : c * 2) : s === r ? i(null, 'ok') : i(null, 'not-equal');
            }, c);
      };
    a(1);
  }
  function wc(e, t, r, n, i) {
    let o = Date.now() + n,
      s = Atomics.load(e, t);
    if (s !== r) {
      i(null, 'ok');
      return;
    }
    let f = (a) => {
      Date.now() > o
        ? i(null, 'timed-out')
        : setTimeout(() => {
            (s = Atomics.load(e, t)), s !== r ? i(null, 'ok') : f(a >= 1e3 ? 1e3 : a * 2);
          }, a);
    };
    f(1);
  }
  go.exports = { wait: gc, waitDiff: wc };
});
var _o = S((Tm, mo) => {
  'use strict';
  mo.exports = { WRITE_INDEX: 4, READ_INDEX: 8 };
});
var xo = S((vm, Ao) => {
  'use strict';
  var { version: mc } = bo(),
    { EventEmitter: _c } = require('events'),
    { Worker: Sc } = require('worker_threads'),
    { join: Ec } = require('path'),
    { pathToFileURL: Rc } = require('url'),
    { wait: Ac } = wo(),
    { WRITE_INDEX: U, READ_INDEX: Z } = _o(),
    xc = require('buffer'),
    Tc = require('assert'),
    b = Symbol('kImpl'),
    Oc = xc.constants.MAX_STRING_LENGTH,
    _t = class {
      constructor(t) {
        this._value = t;
      }
      deref() {
        return this._value;
      }
    },
    vc =
      global.FinalizationRegistry ||
      class {
        register() {}
        unregister() {}
      },
    Lc = global.WeakRef || _t,
    So = new vc((e) => {
      e.exited || e.terminate();
    });
  function Ic(e, t) {
    let { filename: r, workerData: n } = t,
      o =
        ('__bundlerPathsOverrides' in globalThis ? globalThis.__bundlerPathsOverrides : {})['thread-stream-worker'] ||
        Ec(__dirname, 'lib', 'worker.js'),
      s = new Sc(o, {
        ...t.workerOpts,
        trackUnmanagedFds: !1,
        workerData: {
          filename: r.indexOf('file://') === 0 ? r : Rc(r).href,
          dataBuf: e[b].dataBuf,
          stateBuf: e[b].stateBuf,
          workerData: { $context: { threadStreamVersion: mc }, ...n },
        },
      });
    return (s.stream = new _t(e)), s.on('message', kc), s.on('exit', Ro), So.register(e, s), s;
  }
  function Eo(e) {
    Tc(!e[b].sync), e[b].needDrain && ((e[b].needDrain = !1), e.emit('drain'));
  }
  function mt(e) {
    let t = Atomics.load(e[b].state, U),
      r = e[b].data.length - t;
    if (r > 0) {
      if (e[b].buf.length === 0) {
        (e[b].flushing = !1), e[b].ending ? kr(e) : e[b].needDrain && process.nextTick(Eo, e);
        return;
      }
      let n = e[b].buf.slice(0, r),
        i = Buffer.byteLength(n);
      i <= r
        ? ((e[b].buf = e[b].buf.slice(r)), St(e, n, mt.bind(null, e)))
        : e.flush(() => {
            if (!e.destroyed) {
              for (Atomics.store(e[b].state, Z, 0), Atomics.store(e[b].state, U, 0); i > e[b].data.length; )
                (r = r / 2), (n = e[b].buf.slice(0, r)), (i = Buffer.byteLength(n));
              (e[b].buf = e[b].buf.slice(r)), St(e, n, mt.bind(null, e));
            }
          });
    } else if (r === 0) {
      if (t === 0 && e[b].buf.length === 0) return;
      e.flush(() => {
        Atomics.store(e[b].state, Z, 0), Atomics.store(e[b].state, U, 0), mt(e);
      });
    } else ee(e, new Error('overwritten'));
  }
  function kc(e) {
    let t = this.stream.deref();
    if (t === void 0) {
      (this.exited = !0), this.terminate();
      return;
    }
    switch (e.code) {
      case 'READY':
        (this.stream = new Lc(t)),
          t.flush(() => {
            (t[b].ready = !0), t.emit('ready');
          });
        break;
      case 'ERROR':
        ee(t, e.err);
        break;
      case 'EVENT':
        Array.isArray(e.args) ? t.emit(e.name, ...e.args) : t.emit(e.name, e.args);
        break;
      default:
        ee(t, new Error('this should not happen: ' + e.code));
    }
  }
  function Ro(e) {
    let t = this.stream.deref();
    t !== void 0 &&
      (So.unregister(t),
      (t.worker.exited = !0),
      t.worker.off('exit', Ro),
      ee(t, e !== 0 ? new Error('the worker thread exited') : null));
  }
  var vr = class extends _c {
    constructor(t = {}) {
      if ((super(), t.bufferSize < 4)) throw new Error('bufferSize must at least fit a 4-byte utf-8 char');
      (this[b] = {}),
        (this[b].stateBuf = new SharedArrayBuffer(128)),
        (this[b].state = new Int32Array(this[b].stateBuf)),
        (this[b].dataBuf = new SharedArrayBuffer(t.bufferSize || 4 * 1024 * 1024)),
        (this[b].data = Buffer.from(this[b].dataBuf)),
        (this[b].sync = t.sync || !1),
        (this[b].ending = !1),
        (this[b].ended = !1),
        (this[b].needDrain = !1),
        (this[b].destroyed = !1),
        (this[b].flushing = !1),
        (this[b].ready = !1),
        (this[b].finished = !1),
        (this[b].errored = null),
        (this[b].closed = !1),
        (this[b].buf = ''),
        (this.worker = Ic(this, t));
    }
    write(t) {
      if (this[b].destroyed) return Lr(this, new Error('the worker has exited')), !1;
      if (this[b].ending) return Lr(this, new Error('the worker is ending')), !1;
      if (this[b].flushing && this[b].buf.length + t.length >= Oc)
        try {
          Or(this), (this[b].flushing = !0);
        } catch (r) {
          return ee(this, r), !1;
        }
      if (((this[b].buf += t), this[b].sync))
        try {
          return Or(this), !0;
        } catch (r) {
          return ee(this, r), !1;
        }
      return (
        this[b].flushing || ((this[b].flushing = !0), setImmediate(mt, this)),
        (this[b].needDrain = this[b].data.length - this[b].buf.length - Atomics.load(this[b].state, U) <= 0),
        !this[b].needDrain
      );
    }
    end() {
      this[b].destroyed || ((this[b].ending = !0), kr(this));
    }
    flush(t) {
      if (this[b].destroyed) {
        typeof t == 'function' && process.nextTick(t, new Error('the worker has exited'));
        return;
      }
      let r = Atomics.load(this[b].state, U);
      Ac(this[b].state, Z, r, 1 / 0, (n, i) => {
        if (n) {
          ee(this, n), process.nextTick(t, n);
          return;
        }
        if (i === 'not-equal') {
          this.flush(t);
          return;
        }
        process.nextTick(t);
      });
    }
    flushSync() {
      this[b].destroyed || (Or(this), Ir(this));
    }
    unref() {
      this.worker.unref();
    }
    ref() {
      this.worker.ref();
    }
    get ready() {
      return this[b].ready;
    }
    get destroyed() {
      return this[b].destroyed;
    }
    get closed() {
      return this[b].closed;
    }
    get writable() {
      return !this[b].destroyed && !this[b].ending;
    }
    get writableEnded() {
      return this[b].ending;
    }
    get writableFinished() {
      return this[b].finished;
    }
    get writableNeedDrain() {
      return this[b].needDrain;
    }
    get writableObjectMode() {
      return !1;
    }
    get writableErrored() {
      return this[b].errored;
    }
  };
  function Lr(e, t) {
    setImmediate(() => {
      e.emit('error', t);
    });
  }
  function ee(e, t) {
    e[b].destroyed ||
      ((e[b].destroyed = !0),
      t && ((e[b].errored = t), Lr(e, t)),
      e.worker.exited
        ? setImmediate(() => {
            (e[b].closed = !0), e.emit('close');
          })
        : e.worker
            .terminate()
            .catch(() => {})
            .then(() => {
              (e[b].closed = !0), e.emit('close');
            }));
  }
  function St(e, t, r) {
    let n = Atomics.load(e[b].state, U),
      i = Buffer.byteLength(t);
    return e[b].data.write(t, n), Atomics.store(e[b].state, U, n + i), Atomics.notify(e[b].state, U), r(), !0;
  }
  function kr(e) {
    if (!(e[b].ended || !e[b].ending || e[b].flushing)) {
      e[b].ended = !0;
      try {
        e.flushSync();
        let t = Atomics.load(e[b].state, Z);
        Atomics.store(e[b].state, U, -1), Atomics.notify(e[b].state, U);
        let r = 0;
        for (; t !== -1; ) {
          if ((Atomics.wait(e[b].state, Z, t, 1e3), (t = Atomics.load(e[b].state, Z)), t === -2)) {
            ee(e, new Error('end() failed'));
            return;
          }
          if (++r === 10) {
            ee(e, new Error('end() took too long (10s)'));
            return;
          }
        }
        process.nextTick(() => {
          (e[b].finished = !0), e.emit('finish');
        });
      } catch (t) {
        ee(e, t);
      }
    }
  }
  function Or(e) {
    let t = () => {
      e[b].ending ? kr(e) : e[b].needDrain && process.nextTick(Eo, e);
    };
    for (e[b].flushing = !1; e[b].buf.length !== 0; ) {
      let r = Atomics.load(e[b].state, U),
        n = e[b].data.length - r;
      if (n === 0) {
        Ir(e), Atomics.store(e[b].state, Z, 0), Atomics.store(e[b].state, U, 0);
        continue;
      } else if (n < 0) throw new Error('overwritten');
      let i = e[b].buf.slice(0, n),
        o = Buffer.byteLength(i);
      if (o <= n) (e[b].buf = e[b].buf.slice(n)), St(e, i, t);
      else {
        for (Ir(e), Atomics.store(e[b].state, Z, 0), Atomics.store(e[b].state, U, 0); o > e[b].buf.length; )
          (n = n / 2), (i = e[b].buf.slice(0, n)), (o = Buffer.byteLength(i));
        (e[b].buf = e[b].buf.slice(n)), St(e, i, t);
      }
    }
  }
  function Ir(e) {
    if (e[b].flushing) throw new Error('unable to flush while flushing');
    let t = Atomics.load(e[b].state, U),
      r = 0;
    for (;;) {
      let n = Atomics.load(e[b].state, Z);
      if (n === -2) throw Error('_flushSync failed');
      if (n !== t) Atomics.wait(e[b].state, Z, n, 1e3);
      else break;
      if (++r === 10) throw new Error('_flushSync took too long (10s)');
    }
  }
  Ao.exports = vr;
});
var qr = S((Lm, To) => {
  'use strict';
  var { createRequire: jc } = require('module'),
    Pc = br(),
    { join: jr, isAbsolute: qc, sep: Nc } = require('path'),
    Dc = Ar(),
    Pr = Tr(),
    $c = xo();
  function Mc(e) {
    Pr.register(e, Wc),
      Pr.registerBeforeExit(e, Bc),
      e.on('close', function () {
        Pr.unregister(e);
      });
  }
  function Cc(e, t, r) {
    let n = new $c({ filename: e, workerData: t, workerOpts: r });
    n.on('ready', i),
      n.on('close', function () {
        process.removeListener('exit', o);
      }),
      process.on('exit', o);
    function i() {
      process.removeListener('exit', o), n.unref(), r.autoEnd !== !1 && Mc(n);
    }
    function o() {
      n.closed || (n.flushSync(), Dc(100), n.end());
    }
    return n;
  }
  function Wc(e) {
    e.ref(),
      e.flushSync(),
      e.end(),
      e.once('close', function () {
        e.unref();
      });
  }
  function Bc(e) {
    e.flushSync();
  }
  function Fc(e) {
    let { pipeline: t, targets: r, levels: n, dedupe: i, options: o = {}, worker: s = {}, caller: f = Pc() } = e,
      a = typeof f == 'string' ? [f] : f,
      c = '__bundlerPathsOverrides' in globalThis ? globalThis.__bundlerPathsOverrides : {},
      u = e.target;
    if (u && r) throw new Error('only one of target or targets can be specified');
    return (
      r
        ? ((u = c['pino-worker'] || jr(__dirname, 'worker.js')),
          (o.targets = r.map((p) => ({ ...p, target: h(p.target) }))))
        : t &&
          ((u = c['pino-pipeline-worker'] || jr(__dirname, 'worker-pipeline.js')),
          (o.targets = t.map((p) => ({ ...p, target: h(p.target) })))),
      n && (o.levels = n),
      i && (o.dedupe = i),
      Cc(h(u), o, s)
    );
    function h(p) {
      if (((p = c[p] || p), qc(p) || p.indexOf('file://') === 0)) return p;
      if (p === 'pino/file') return jr(__dirname, '..', 'file.js');
      let l;
      for (let d of a)
        try {
          let g = d === 'node:repl' ? process.cwd() + Nc : d;
          l = jc(g).resolve(p);
          break;
        } catch {
          continue;
        }
      if (!l) throw new Error(`unable to determine transport target for "${p}"`);
      return l;
    }
  }
  To.exports = Fc;
});
var At = S((Im, $o) => {
  'use strict';
  var Oo = eo(),
    { mapHttpRequest: Uc, mapHttpResponse: Vc } = yr(),
    Dr = fo(),
    vo = Tr(),
    {
      lsCacheSym: zc,
      chindingsSym: ko,
      writeSym: Lo,
      serializersSym: jo,
      formatOptsSym: Io,
      endSym: Gc,
      stringifiersSym: Po,
      stringifySym: qo,
      stringifySafeSym: $r,
      wildcardFirstSym: No,
      nestedKeySym: Hc,
      formattersSym: Do,
      messageKeySym: Kc,
      errorKeySym: Jc,
      nestedKeyStrSym: Yc,
      msgPrefixSym: Et,
    } = Ne(),
    { isMainThread: Xc } = require('worker_threads'),
    Qc = qr();
  function De() {}
  function Zc(e, t) {
    if (!t) return r;
    return function (...i) {
      t.call(this, i, r, e);
    };
    function r(n, ...i) {
      if (typeof n == 'object') {
        let o = n;
        n !== null &&
          (n.method && n.headers && n.socket ? (n = Uc(n)) : typeof n.setHeader == 'function' && (n = Vc(n)));
        let s;
        o === null && i.length === 0 ? (s = [null]) : ((o = i.shift()), (s = i)),
          typeof this[Et] == 'string' && o !== void 0 && o !== null && (o = this[Et] + o),
          this[Lo](n, Oo(o, s, this[Io]), e);
      } else {
        let o = n === void 0 ? i.shift() : n;
        typeof this[Et] == 'string' && o !== void 0 && o !== null && (o = this[Et] + o),
          this[Lo](null, Oo(o, i, this[Io]), e);
      }
    }
  }
  function Nr(e) {
    let t = '',
      r = 0,
      n = !1,
      i = 255,
      o = e.length;
    if (o > 100) return JSON.stringify(e);
    for (var s = 0; s < o && i >= 32; s++)
      (i = e.charCodeAt(s)), (i === 34 || i === 92) && ((t += e.slice(r, s) + '\\'), (r = s), (n = !0));
    return n ? (t += e.slice(r)) : (t = e), i < 32 ? JSON.stringify(e) : '"' + t + '"';
  }
  function ed(e, t, r, n) {
    let i = this[qo],
      o = this[$r],
      s = this[Po],
      f = this[Gc],
      a = this[ko],
      c = this[jo],
      u = this[Do],
      h = this[Kc],
      p = this[Jc],
      l = this[zc][r] + n;
    l = l + a;
    let d;
    u.log && (e = u.log(e));
    let g = s[No],
      w = '';
    for (let y in e)
      if (((d = e[y]), Object.prototype.hasOwnProperty.call(e, y) && d !== void 0)) {
        c[y] ? (d = c[y](d)) : y === p && c.err && (d = c.err(d));
        let m = s[y] || g;
        switch (typeof d) {
          case 'undefined':
          case 'function':
            continue;
          case 'number':
            Number.isFinite(d) === !1 && (d = null);
          case 'boolean':
            m && (d = m(d));
            break;
          case 'string':
            d = (m || Nr)(d);
            break;
          default:
            d = (m || i)(d, o);
        }
        if (d === void 0) continue;
        let E = Nr(y);
        w += ',' + E + ':' + d;
      }
    let _ = '';
    if (t !== void 0) {
      d = c[h] ? c[h](t) : t;
      let y = s[h] || g;
      switch (typeof d) {
        case 'function':
          break;
        case 'number':
          Number.isFinite(d) === !1 && (d = null);
        case 'boolean':
          y && (d = y(d)), (_ = ',"' + h + '":' + d);
          break;
        case 'string':
          (d = (y || Nr)(d)), (_ = ',"' + h + '":' + d);
          break;
        default:
          (d = (y || i)(d, o)), (_ = ',"' + h + '":' + d);
      }
    }
    return this[Hc] && w ? l + this[Yc] + w.slice(1) + '}' + _ + f : l + w + _ + f;
  }
  function td(e, t) {
    let r,
      n = e[ko],
      i = e[qo],
      o = e[$r],
      s = e[Po],
      f = s[No],
      a = e[jo],
      c = e[Do].bindings;
    t = c(t);
    for (let u in t)
      if (
        ((r = t[u]),
        (u !== 'level' &&
          u !== 'serializers' &&
          u !== 'formatters' &&
          u !== 'customLevels' &&
          t.hasOwnProperty(u) &&
          r !== void 0) === !0)
      ) {
        if (((r = a[u] ? a[u](r) : r), (r = (s[u] || f || i)(r, o)), r === void 0)) continue;
        n += ',"' + u + '":' + r;
      }
    return n;
  }
  function rd(e) {
    return e.write !== e.constructor.prototype.write;
  }
  var nd = process.env.NODE_V8_COVERAGE || process.env.V8_COVERAGE;
  function Rt(e) {
    let t = new Dr(e);
    return (
      t.on('error', r),
      !nd &&
        !e.sync &&
        Xc &&
        (vo.register(t, id),
        t.on('close', function () {
          vo.unregister(t);
        })),
      t
    );
    function r(n) {
      if (n.code === 'EPIPE') {
        (t.write = De), (t.end = De), (t.flushSync = De), (t.destroy = De);
        return;
      }
      t.removeListener('error', r), t.emit('error', n);
    }
  }
  function id(e, t) {
    e.destroyed ||
      (t === 'beforeExit'
        ? (e.flush(),
          e.on('drain', function () {
            e.end();
          }))
        : e.flushSync());
  }
  function od(e) {
    return function (r, n, i = {}, o) {
      if (typeof i == 'string') (o = Rt({ dest: i })), (i = {});
      else if (typeof o == 'string') {
        if (i && i.transport) throw Error('only one of option.transport or stream can be specified');
        o = Rt({ dest: o });
      } else if (i instanceof Dr || i.writable || i._writableState) (o = i), (i = {});
      else if (i.transport) {
        if (i.transport instanceof Dr || i.transport.writable || i.transport._writableState)
          throw Error('option.transport do not allow stream, please pass to option directly. e.g. pino(transport)');
        if (
          i.transport.targets &&
          i.transport.targets.length &&
          i.formatters &&
          typeof i.formatters.level == 'function'
        )
          throw Error('option.transport.targets do not allow custom level formatters');
        let a;
        i.customLevels && (a = i.useOnlyCustomLevels ? i.customLevels : Object.assign({}, i.levels, i.customLevels)),
          (o = Qc({ caller: n, ...i.transport, levels: a }));
      }
      if (
        ((i = Object.assign({}, e, i)),
        (i.serializers = Object.assign({}, e.serializers, i.serializers)),
        (i.formatters = Object.assign({}, e.formatters, i.formatters)),
        i.prettyPrint)
      )
        throw new Error(
          'prettyPrint option is no longer supported, see the pino-pretty package (https://github.com/pinojs/pino-pretty)'
        );
      let { enabled: s, onChild: f } = i;
      return (
        s === !1 && (i.level = 'silent'),
        f || (i.onChild = De),
        o || (rd(process.stdout) ? (o = process.stdout) : (o = Rt({ fd: process.stdout.fd || 1 }))),
        { opts: i, stream: o }
      );
    };
  }
  function sd(e, t) {
    try {
      return JSON.stringify(e);
    } catch {
      try {
        return (t || this[$r])(e);
      } catch {
        return '"[unable to serialize, circular reference is too complex to analyze]"';
      }
    }
  }
  function ld(e, t, r) {
    return { level: e, bindings: t, log: r };
  }
  function fd(e) {
    let t = Number(e);
    return typeof e == 'string' && Number.isFinite(t) ? t : e === void 0 ? 1 : e;
  }
  $o.exports = {
    noop: De,
    buildSafeSonicBoom: Rt,
    asChindings: td,
    asJson: ed,
    genLog: Zc,
    createArgsNormalizer: od,
    stringify: sd,
    buildFormatters: ld,
    normalizeDestFileDescriptor: fd,
  };
});
var xt = S((km, Co) => {
  'use strict';
  var {
      lsCacheSym: ud,
      levelValSym: Mr,
      useOnlyCustomLevelsSym: ad,
      streamSym: cd,
      formattersSym: dd,
      hooksSym: hd,
    } = Ne(),
    { noop: pd, genLog: _e } = At(),
    J = { trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60 },
    Mo = {
      fatal: (e) => {
        let t = _e(J.fatal, e);
        return function (...r) {
          let n = this[cd];
          if ((t.call(this, ...r), typeof n.flushSync == 'function'))
            try {
              n.flushSync();
            } catch {}
        };
      },
      error: (e) => _e(J.error, e),
      warn: (e) => _e(J.warn, e),
      info: (e) => _e(J.info, e),
      debug: (e) => _e(J.debug, e),
      trace: (e) => _e(J.trace, e),
    },
    Cr = Object.keys(J).reduce((e, t) => ((e[J[t]] = t), e), {}),
    yd = Object.keys(Cr).reduce((e, t) => ((e[t] = '{"level":' + Number(t)), e), {});
  function bd(e) {
    let t = e[dd].level,
      { labels: r } = e.levels,
      n = {};
    for (let i in r) {
      let o = t(r[i], Number(i));
      n[i] = JSON.stringify(o).slice(0, -1);
    }
    return (e[ud] = n), e;
  }
  function gd(e, t) {
    if (t) return !1;
    switch (e) {
      case 'fatal':
      case 'error':
      case 'warn':
      case 'info':
      case 'debug':
      case 'trace':
        return !0;
      default:
        return !1;
    }
  }
  function wd(e) {
    let { labels: t, values: r } = this.levels;
    if (typeof e == 'number') {
      if (t[e] === void 0) throw Error('unknown level value' + e);
      e = t[e];
    }
    if (r[e] === void 0) throw Error('unknown level ' + e);
    let n = this[Mr],
      i = (this[Mr] = r[e]),
      o = this[ad],
      s = this[hd].logMethod;
    for (let f in r) {
      if (i > r[f]) {
        this[f] = pd;
        continue;
      }
      this[f] = gd(f, o) ? Mo[f](s) : _e(r[f], s);
    }
    this.emit('level-change', e, i, t[n], n, this);
  }
  function md(e) {
    let { levels: t, levelVal: r } = this;
    return t && t.labels ? t.labels[r] : '';
  }
  function _d(e) {
    let { values: t } = this.levels,
      r = t[e];
    return r !== void 0 && r >= this[Mr];
  }
  function Sd(e = null, t = !1) {
    let r = e ? Object.keys(e).reduce((o, s) => ((o[e[s]] = s), o), {}) : null,
      n = Object.assign(Object.create(Object.prototype, { Infinity: { value: 'silent' } }), t ? null : Cr, r),
      i = Object.assign(Object.create(Object.prototype, { silent: { value: 1 / 0 } }), t ? null : J, e);
    return { labels: n, values: i };
  }
  function Ed(e, t, r) {
    if (typeof e == 'number') {
      if (
        ![]
          .concat(
            Object.keys(t || {}).map((o) => t[o]),
            r ? [] : Object.keys(Cr).map((o) => +o),
            1 / 0
          )
          .includes(e)
      )
        throw Error(`default level:${e} must be included in custom levels`);
      return;
    }
    let n = Object.assign(Object.create(Object.prototype, { silent: { value: 1 / 0 } }), r ? null : J, t);
    if (!(e in n)) throw Error(`default level:${e} must be included in custom levels`);
  }
  function Rd(e, t) {
    let { labels: r, values: n } = e;
    for (let i in t) {
      if (i in n) throw Error('levels cannot be overridden');
      if (t[i] in r) throw Error('pre-existing level values cannot be used for new levels');
    }
  }
  Co.exports = {
    initialLsCache: yd,
    genLsCache: bd,
    levelMethods: Mo,
    getLevel: md,
    setLevel: wd,
    isLevelEnabled: _d,
    mappings: Sd,
    levels: J,
    assertNoLevelCollisions: Rd,
    assertDefaultLevelFound: Ed,
  };
});
var Wr = S((jm, Wo) => {
  'use strict';
  Wo.exports = { version: '8.16.2' };
});
var Xo = S((qm, Yo) => {
  'use strict';
  var { EventEmitter: Ad } = require('events'),
    {
      lsCacheSym: xd,
      levelValSym: Td,
      setLevelSym: Fr,
      getLevelSym: Bo,
      chindingsSym: Ur,
      parsedChindingsSym: Od,
      mixinSym: vd,
      asJsonSym: Go,
      writeSym: Ld,
      mixinMergeStrategySym: Id,
      timeSym: kd,
      timeSliceIndexSym: jd,
      streamSym: Ho,
      serializersSym: Se,
      formattersSym: Br,
      errorKeySym: Pd,
      messageKeySym: qd,
      useOnlyCustomLevelsSym: Nd,
      needsMetadataGsym: Dd,
      redactFmtSym: $d,
      stringifySym: Md,
      formatOptsSym: Cd,
      stringifiersSym: Wd,
      msgPrefixSym: Fo,
    } = Ne(),
    {
      getLevel: Bd,
      setLevel: Fd,
      isLevelEnabled: Ud,
      mappings: Vd,
      initialLsCache: zd,
      genLsCache: Gd,
      assertNoLevelCollisions: Hd,
    } = xt(),
    { asChindings: Ko, asJson: Kd, buildFormatters: Uo, stringify: Vo } = At(),
    { version: Jd } = Wr(),
    Yd = Er(),
    Xd = class {},
    Jo = {
      constructor: Xd,
      child: Qd,
      bindings: Zd,
      setBindings: eh,
      flush: ih,
      isLevelEnabled: Ud,
      version: Jd,
      get level() {
        return this[Bo]();
      },
      set level(e) {
        this[Fr](e);
      },
      get levelVal() {
        return this[Td];
      },
      set levelVal(e) {
        throw Error('levelVal is read-only');
      },
      [xd]: zd,
      [Ld]: rh,
      [Go]: Kd,
      [Bo]: Bd,
      [Fr]: Fd,
    };
  Object.setPrototypeOf(Jo, Ad.prototype);
  Yo.exports = function () {
    return Object.create(Jo);
  };
  var zo = (e) => e;
  function Qd(e, t) {
    if (!e) throw Error('missing bindings for child Pino');
    t = t || {};
    let r = this[Se],
      n = this[Br],
      i = Object.create(this);
    if (t.hasOwnProperty('serializers') === !0) {
      i[Se] = Object.create(null);
      for (let u in r) i[Se][u] = r[u];
      let a = Object.getOwnPropertySymbols(r);
      for (var o = 0; o < a.length; o++) {
        let u = a[o];
        i[Se][u] = r[u];
      }
      for (let u in t.serializers) i[Se][u] = t.serializers[u];
      let c = Object.getOwnPropertySymbols(t.serializers);
      for (var s = 0; s < c.length; s++) {
        let u = c[s];
        i[Se][u] = t.serializers[u];
      }
    } else i[Se] = r;
    if (t.hasOwnProperty('formatters')) {
      let { level: a, bindings: c, log: u } = t.formatters;
      i[Br] = Uo(a || n.level, c || zo, u || n.log);
    } else i[Br] = Uo(n.level, zo, n.log);
    if (
      (t.hasOwnProperty('customLevels') === !0 &&
        (Hd(this.levels, t.customLevels), (i.levels = Vd(t.customLevels, i[Nd])), Gd(i)),
      (typeof t.redact == 'object' && t.redact !== null) || Array.isArray(t.redact))
    ) {
      i.redact = t.redact;
      let a = Yd(i.redact, Vo),
        c = { stringify: a[$d] };
      (i[Md] = Vo), (i[Wd] = a), (i[Cd] = c);
    }
    typeof t.msgPrefix == 'string' && (i[Fo] = (this[Fo] || '') + t.msgPrefix), (i[Ur] = Ko(i, e));
    let f = t.level || this.level;
    return i[Fr](f), this.onChild(i), i;
  }
  function Zd() {
    let t = `{${this[Ur].substr(1)}}`,
      r = JSON.parse(t);
    return delete r.pid, delete r.hostname, r;
  }
  function eh(e) {
    let t = Ko(this, e);
    (this[Ur] = t), delete this[Od];
  }
  function th(e, t) {
    return Object.assign(t, e);
  }
  function rh(e, t, r) {
    let n = this[kd](),
      i = this[vd],
      o = this[Pd],
      s = this[qd],
      f = this[Id] || th,
      a;
    e == null
      ? (a = {})
      : e instanceof Error
      ? ((a = { [o]: e }), t === void 0 && (t = e.message))
      : ((a = e), t === void 0 && e[s] === void 0 && e[o] && (t = e[o].message)),
      i && (a = f(a, i(a, r, this)));
    let c = this[Go](a, t, r, n),
      u = this[Ho];
    u[Dd] === !0 &&
      ((u.lastLevel = r), (u.lastObj = a), (u.lastMsg = t), (u.lastTime = n.slice(this[jd])), (u.lastLogger = this)),
      u.write(c);
  }
  function nh() {}
  function ih(e) {
    if (e != null && typeof e != 'function') throw Error('callback must be a function');
    let t = this[Ho];
    typeof t.flush == 'function' ? t.flush(e || nh) : e && e();
  }
});
var rs = S((Hr, ts) => {
  'use strict';
  var { hasOwnProperty: Tt } = Object.prototype,
    Re = Gr();
  Re.configure = Gr;
  Re.stringify = Re;
  Re.default = Re;
  Hr.stringify = Re;
  Hr.configure = Gr;
  ts.exports = Re;
  var oh =
    /[\u0000-\u001f\u0022\u005c\ud800-\udfff]|[\ud800-\udbff](?![\udc00-\udfff])|(?:[^\ud800-\udbff]|^)[\udc00-\udfff]/;
  function de(e) {
    return e.length < 5e3 && !oh.test(e) ? `"${e}"` : JSON.stringify(e);
  }
  function Vr(e) {
    if (e.length > 200) return e.sort();
    for (let t = 1; t < e.length; t++) {
      let r = e[t],
        n = t;
      for (; n !== 0 && e[n - 1] > r; ) (e[n] = e[n - 1]), n--;
      e[n] = r;
    }
    return e;
  }
  var sh = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(Object.getPrototypeOf(new Int8Array())),
    Symbol.toStringTag
  ).get;
  function zr(e) {
    return sh.call(e) !== void 0 && e.length !== 0;
  }
  function Qo(e, t, r) {
    e.length < r && (r = e.length);
    let n = t === ',' ? '' : ' ',
      i = `"0":${n}${e[0]}`;
    for (let o = 1; o < r; o++) i += `${t}"${o}":${n}${e[o]}`;
    return i;
  }
  function lh(e) {
    if (Tt.call(e, 'circularValue')) {
      let t = e.circularValue;
      if (typeof t == 'string') return `"${t}"`;
      if (t == null) return t;
      if (t === Error || t === TypeError)
        return {
          toString() {
            throw new TypeError('Converting circular structure to JSON');
          },
        };
      throw new TypeError('The "circularValue" argument must be of type string or the value null or undefined');
    }
    return '"[Circular]"';
  }
  function Zo(e, t) {
    let r;
    if (Tt.call(e, t) && ((r = e[t]), typeof r != 'boolean'))
      throw new TypeError(`The "${t}" argument must be of type boolean`);
    return r === void 0 ? !0 : r;
  }
  function es(e, t) {
    let r;
    if (Tt.call(e, t)) {
      if (((r = e[t]), typeof r != 'number')) throw new TypeError(`The "${t}" argument must be of type number`);
      if (!Number.isInteger(r)) throw new TypeError(`The "${t}" argument must be an integer`);
      if (r < 1) throw new RangeError(`The "${t}" argument must be >= 1`);
    }
    return r === void 0 ? 1 / 0 : r;
  }
  function Ee(e) {
    return e === 1 ? '1 item' : `${e} items`;
  }
  function fh(e) {
    let t = new Set();
    for (let r of e) (typeof r == 'string' || typeof r == 'number') && t.add(String(r));
    return t;
  }
  function uh(e) {
    if (Tt.call(e, 'strict')) {
      let t = e.strict;
      if (typeof t != 'boolean') throw new TypeError('The "strict" argument must be of type boolean');
      if (t)
        return (r) => {
          let n = `Object can not safely be stringified. Received type ${typeof r}`;
          throw (typeof r != 'function' && (n += ` (${r.toString()})`), new Error(n));
        };
    }
  }
  function Gr(e) {
    e = { ...e };
    let t = uh(e);
    t && (e.bigint === void 0 && (e.bigint = !1), 'circularValue' in e || (e.circularValue = Error));
    let r = lh(e),
      n = Zo(e, 'bigint'),
      i = Zo(e, 'deterministic'),
      o = es(e, 'maximumDepth'),
      s = es(e, 'maximumBreadth');
    function f(p, l, d, g, w, _) {
      let y = l[p];
      switch (
        (typeof y == 'object' && y !== null && typeof y.toJSON == 'function' && (y = y.toJSON(p)),
        (y = g.call(l, p, y)),
        typeof y)
      ) {
        case 'string':
          return de(y);
        case 'object': {
          if (y === null) return 'null';
          if (d.indexOf(y) !== -1) return r;
          let m = '',
            E = ',',
            R = _;
          if (Array.isArray(y)) {
            if (y.length === 0) return '[]';
            if (o < d.length + 1) return '"[Array]"';
            d.push(y),
              w !== '' &&
                ((_ += w),
                (m += `
${_}`),
                (E = `,
${_}`));
            let D = Math.min(y.length, s),
              P = 0;
            for (; P < D - 1; P++) {
              let me = f(String(P), y, d, g, w, _);
              (m += me !== void 0 ? me : 'null'), (m += E);
            }
            let V = f(String(P), y, d, g, w, _);
            if (((m += V !== void 0 ? V : 'null'), y.length - 1 > s)) {
              let me = y.length - s - 1;
              m += `${E}"... ${Ee(me)} not stringified"`;
            }
            return (
              w !== '' &&
                (m += `
${R}`),
              d.pop(),
              `[${m}]`
            );
          }
          let x = Object.keys(y),
            L = x.length;
          if (L === 0) return '{}';
          if (o < d.length + 1) return '"[Object]"';
          let A = '',
            I = '';
          w !== '' &&
            ((_ += w),
            (E = `,
${_}`),
            (A = ' '));
          let C = Math.min(L, s);
          i && !zr(y) && (x = Vr(x)), d.push(y);
          for (let D = 0; D < C; D++) {
            let P = x[D],
              V = f(P, y, d, g, w, _);
            V !== void 0 && ((m += `${I}${de(P)}:${A}${V}`), (I = E));
          }
          if (L > s) {
            let D = L - s;
            (m += `${I}"...":${A}"${Ee(D)} not stringified"`), (I = E);
          }
          return (
            w !== '' &&
              I.length > 1 &&
              (m = `
${_}${m}
${R}`),
            d.pop(),
            `{${m}}`
          );
        }
        case 'number':
          return isFinite(y) ? String(y) : t ? t(y) : 'null';
        case 'boolean':
          return y === !0 ? 'true' : 'false';
        case 'undefined':
          return;
        case 'bigint':
          if (n) return String(y);
        default:
          return t ? t(y) : void 0;
      }
    }
    function a(p, l, d, g, w, _) {
      switch ((typeof l == 'object' && l !== null && typeof l.toJSON == 'function' && (l = l.toJSON(p)), typeof l)) {
        case 'string':
          return de(l);
        case 'object': {
          if (l === null) return 'null';
          if (d.indexOf(l) !== -1) return r;
          let y = _,
            m = '',
            E = ',';
          if (Array.isArray(l)) {
            if (l.length === 0) return '[]';
            if (o < d.length + 1) return '"[Array]"';
            d.push(l),
              w !== '' &&
                ((_ += w),
                (m += `
${_}`),
                (E = `,
${_}`));
            let L = Math.min(l.length, s),
              A = 0;
            for (; A < L - 1; A++) {
              let C = a(String(A), l[A], d, g, w, _);
              (m += C !== void 0 ? C : 'null'), (m += E);
            }
            let I = a(String(A), l[A], d, g, w, _);
            if (((m += I !== void 0 ? I : 'null'), l.length - 1 > s)) {
              let C = l.length - s - 1;
              m += `${E}"... ${Ee(C)} not stringified"`;
            }
            return (
              w !== '' &&
                (m += `
${y}`),
              d.pop(),
              `[${m}]`
            );
          }
          d.push(l);
          let R = '';
          w !== '' &&
            ((_ += w),
            (E = `,
${_}`),
            (R = ' '));
          let x = '';
          for (let L of g) {
            let A = a(L, l[L], d, g, w, _);
            A !== void 0 && ((m += `${x}${de(L)}:${R}${A}`), (x = E));
          }
          return (
            w !== '' &&
              x.length > 1 &&
              (m = `
${_}${m}
${y}`),
            d.pop(),
            `{${m}}`
          );
        }
        case 'number':
          return isFinite(l) ? String(l) : t ? t(l) : 'null';
        case 'boolean':
          return l === !0 ? 'true' : 'false';
        case 'undefined':
          return;
        case 'bigint':
          if (n) return String(l);
        default:
          return t ? t(l) : void 0;
      }
    }
    function c(p, l, d, g, w) {
      switch (typeof l) {
        case 'string':
          return de(l);
        case 'object': {
          if (l === null) return 'null';
          if (typeof l.toJSON == 'function') {
            if (((l = l.toJSON(p)), typeof l != 'object')) return c(p, l, d, g, w);
            if (l === null) return 'null';
          }
          if (d.indexOf(l) !== -1) return r;
          let _ = w;
          if (Array.isArray(l)) {
            if (l.length === 0) return '[]';
            if (o < d.length + 1) return '"[Array]"';
            d.push(l), (w += g);
            let A = `
${w}`,
              I = `,
${w}`,
              C = Math.min(l.length, s),
              D = 0;
            for (; D < C - 1; D++) {
              let V = c(String(D), l[D], d, g, w);
              (A += V !== void 0 ? V : 'null'), (A += I);
            }
            let P = c(String(D), l[D], d, g, w);
            if (((A += P !== void 0 ? P : 'null'), l.length - 1 > s)) {
              let V = l.length - s - 1;
              A += `${I}"... ${Ee(V)} not stringified"`;
            }
            return (
              (A += `
${_}`),
              d.pop(),
              `[${A}]`
            );
          }
          let y = Object.keys(l),
            m = y.length;
          if (m === 0) return '{}';
          if (o < d.length + 1) return '"[Object]"';
          w += g;
          let E = `,
${w}`,
            R = '',
            x = '',
            L = Math.min(m, s);
          zr(l) && ((R += Qo(l, E, s)), (y = y.slice(l.length)), (L -= l.length), (x = E)), i && (y = Vr(y)), d.push(l);
          for (let A = 0; A < L; A++) {
            let I = y[A],
              C = c(I, l[I], d, g, w);
            C !== void 0 && ((R += `${x}${de(I)}: ${C}`), (x = E));
          }
          if (m > s) {
            let A = m - s;
            (R += `${x}"...": "${Ee(A)} not stringified"`), (x = E);
          }
          return (
            x !== '' &&
              (R = `
${w}${R}
${_}`),
            d.pop(),
            `{${R}}`
          );
        }
        case 'number':
          return isFinite(l) ? String(l) : t ? t(l) : 'null';
        case 'boolean':
          return l === !0 ? 'true' : 'false';
        case 'undefined':
          return;
        case 'bigint':
          if (n) return String(l);
        default:
          return t ? t(l) : void 0;
      }
    }
    function u(p, l, d) {
      switch (typeof l) {
        case 'string':
          return de(l);
        case 'object': {
          if (l === null) return 'null';
          if (typeof l.toJSON == 'function') {
            if (((l = l.toJSON(p)), typeof l != 'object')) return u(p, l, d);
            if (l === null) return 'null';
          }
          if (d.indexOf(l) !== -1) return r;
          let g = '';
          if (Array.isArray(l)) {
            if (l.length === 0) return '[]';
            if (o < d.length + 1) return '"[Array]"';
            d.push(l);
            let E = Math.min(l.length, s),
              R = 0;
            for (; R < E - 1; R++) {
              let L = u(String(R), l[R], d);
              (g += L !== void 0 ? L : 'null'), (g += ',');
            }
            let x = u(String(R), l[R], d);
            if (((g += x !== void 0 ? x : 'null'), l.length - 1 > s)) {
              let L = l.length - s - 1;
              g += `,"... ${Ee(L)} not stringified"`;
            }
            return d.pop(), `[${g}]`;
          }
          let w = Object.keys(l),
            _ = w.length;
          if (_ === 0) return '{}';
          if (o < d.length + 1) return '"[Object]"';
          let y = '',
            m = Math.min(_, s);
          zr(l) && ((g += Qo(l, ',', s)), (w = w.slice(l.length)), (m -= l.length), (y = ',')),
            i && (w = Vr(w)),
            d.push(l);
          for (let E = 0; E < m; E++) {
            let R = w[E],
              x = u(R, l[R], d);
            x !== void 0 && ((g += `${y}${de(R)}:${x}`), (y = ','));
          }
          if (_ > s) {
            let E = _ - s;
            g += `${y}"...":"${Ee(E)} not stringified"`;
          }
          return d.pop(), `{${g}}`;
        }
        case 'number':
          return isFinite(l) ? String(l) : t ? t(l) : 'null';
        case 'boolean':
          return l === !0 ? 'true' : 'false';
        case 'undefined':
          return;
        case 'bigint':
          if (n) return String(l);
        default:
          return t ? t(l) : void 0;
      }
    }
    function h(p, l, d) {
      if (arguments.length > 1) {
        let g = '';
        if (
          (typeof d == 'number' ? (g = ' '.repeat(Math.min(d, 10))) : typeof d == 'string' && (g = d.slice(0, 10)),
          l != null)
        ) {
          if (typeof l == 'function') return f('', { '': p }, [], l, g, '');
          if (Array.isArray(l)) return a('', p, [], fh(l), g, '');
        }
        if (g.length !== 0) return c('', p, [], g, '');
      }
      return u('', p, []);
    }
    return h;
  }
});
var os = S((Nm, is) => {
  'use strict';
  var Kr = Symbol.for('pino.metadata'),
    { levels: ns } = xt(),
    ah = ns.info;
  function ch(e, t) {
    let r = 0;
    (e = e || []), (t = t || { dedupe: !1 });
    let n = Object.create(ns);
    (n.silent = 1 / 0),
      t.levels &&
        typeof t.levels == 'object' &&
        Object.keys(t.levels).forEach((u) => {
          n[u] = t.levels[u];
        });
    let i = { write: o, add: f, flushSync: s, end: a, minLevel: 0, streams: [], clone: c, [Kr]: !0, streamLevels: n };
    return Array.isArray(e) ? e.forEach(f, i) : f.call(i, e), (e = null), i;
    function o(u) {
      let h,
        p = this.lastLevel,
        { streams: l } = this,
        d = 0,
        g;
      for (let w = hh(l.length, t.dedupe); yh(w, l.length, t.dedupe); w = ph(w, t.dedupe))
        if (((h = l[w]), h.level <= p)) {
          if (d !== 0 && d !== h.level) break;
          if (((g = h.stream), g[Kr])) {
            let { lastTime: _, lastMsg: y, lastObj: m, lastLogger: E } = this;
            (g.lastLevel = p), (g.lastTime = _), (g.lastMsg = y), (g.lastObj = m), (g.lastLogger = E);
          }
          g.write(u), t.dedupe && (d = h.level);
        } else if (!t.dedupe) break;
    }
    function s() {
      for (let { stream: u } of this.streams) typeof u.flushSync == 'function' && u.flushSync();
    }
    function f(u) {
      if (!u) return i;
      let h = typeof u.write == 'function' || u.stream,
        p = u.write ? u : u.stream;
      if (!h) throw Error('stream object needs to implement either StreamEntry or DestinationStream interface');
      let { streams: l, streamLevels: d } = this,
        g;
      typeof u.levelVal == 'number'
        ? (g = u.levelVal)
        : typeof u.level == 'string'
        ? (g = d[u.level])
        : typeof u.level == 'number'
        ? (g = u.level)
        : (g = ah);
      let w = { stream: p, level: g, levelVal: void 0, id: r++ };
      return l.unshift(w), l.sort(dh), (this.minLevel = l[0].level), i;
    }
    function a() {
      for (let { stream: u } of this.streams) typeof u.flushSync == 'function' && u.flushSync(), u.end();
    }
    function c(u) {
      let h = new Array(this.streams.length);
      for (let p = 0; p < h.length; p++) h[p] = { level: u, stream: this.streams[p].stream };
      return { write: o, add: f, minLevel: u, streams: h, clone: c, flushSync: s, [Kr]: !0 };
    }
  }
  function dh(e, t) {
    return e.level - t.level;
  }
  function hh(e, t) {
    return t ? e - 1 : 0;
  }
  function ph(e, t) {
    return t ? e - 1 : e + 1;
  }
  function yh(e, t, r) {
    return r ? e >= 0 : e < t;
  }
  is.exports = ch;
});
var ws = S((Dm, z) => {
  function He(e) {
    try {
      return require('path').join(`${process.cwd()}${require('path').sep}dist`.replace(/\\/g, '/'), e);
    } catch {
      return new Function('p', 'return new URL(p, import.meta.url).pathname')(e);
    }
  }
  globalThis.__bundlerPathsOverrides = {
    ...(globalThis.__bundlerPathsOverrides || {}),
    'thread-stream-worker': He('./thread-stream-worker.js'),
    'pino-worker': He('./pino-worker.js'),
    'pino-pipeline-worker': He('./pino-pipeline-worker.js'),
    'pino/file': He('./pino-file.js'),
    'pino-pretty': He('./pino-pretty.js'),
  };
  var bh = require('os'),
    hs = yr(),
    gh = br(),
    wh = Er(),
    ps = Qi(),
    mh = Xo(),
    ys = Ne(),
    { configure: _h } = rs(),
    { assertDefaultLevelFound: Sh, mappings: bs, genLsCache: Eh, levels: Rh } = xt(),
    {
      createArgsNormalizer: Ah,
      asChindings: xh,
      buildSafeSonicBoom: ss,
      buildFormatters: Th,
      stringify: Jr,
      normalizeDestFileDescriptor: ls,
      noop: Oh,
    } = At(),
    { version: vh } = Wr(),
    {
      chindingsSym: fs,
      redactFmtSym: Lh,
      serializersSym: us,
      timeSym: Ih,
      timeSliceIndexSym: kh,
      streamSym: jh,
      stringifySym: as,
      stringifySafeSym: Yr,
      stringifiersSym: cs,
      setLevelSym: Ph,
      endSym: qh,
      formatOptsSym: Nh,
      messageKeySym: Dh,
      errorKeySym: $h,
      nestedKeySym: Mh,
      mixinSym: Ch,
      useOnlyCustomLevelsSym: Wh,
      formattersSym: ds,
      hooksSym: Bh,
      nestedKeyStrSym: Fh,
      mixinMergeStrategySym: Uh,
      msgPrefixSym: Vh,
    } = ys,
    { epochTime: gs, nullTime: zh } = ps,
    { pid: Gh } = process,
    Hh = bh.hostname(),
    Kh = hs.err,
    Jh = {
      level: 'info',
      levels: Rh,
      messageKey: 'msg',
      errorKey: 'err',
      nestedKey: null,
      enabled: !0,
      base: { pid: Gh, hostname: Hh },
      serializers: Object.assign(Object.create(null), { err: Kh }),
      formatters: Object.assign(Object.create(null), {
        bindings(e) {
          return e;
        },
        level(e, t) {
          return { level: t };
        },
      }),
      hooks: { logMethod: void 0 },
      timestamp: gs,
      name: void 0,
      redact: null,
      customLevels: null,
      useOnlyCustomLevels: !1,
      depthLimit: 5,
      edgeLimit: 100,
    },
    Yh = Ah(Jh),
    Xh = Object.assign(Object.create(null), hs);
  function Xr(...e) {
    let t = {},
      { opts: r, stream: n } = Yh(t, gh(), ...e),
      {
        redact: i,
        crlf: o,
        serializers: s,
        timestamp: f,
        messageKey: a,
        errorKey: c,
        nestedKey: u,
        base: h,
        name: p,
        level: l,
        customLevels: d,
        mixin: g,
        mixinMergeStrategy: w,
        useOnlyCustomLevels: _,
        formatters: y,
        hooks: m,
        depthLimit: E,
        edgeLimit: R,
        onChild: x,
        msgPrefix: L,
      } = r,
      A = _h({ maximumDepth: E, maximumBreadth: R }),
      I = Th(y.level, y.bindings, y.log),
      C = Jr.bind({ [Yr]: A }),
      D = i ? wh(i, C) : {},
      P = i ? { stringify: D[Lh] } : { stringify: C },
      V =
        '}' +
        (o
          ? `\r
`
          : `
`),
      me = xh.bind(null, { [fs]: '', [us]: s, [cs]: D, [as]: Jr, [Yr]: A, [ds]: I }),
      or = '';
    h !== null && (p === void 0 ? (or = me(h)) : (or = me(Object.assign({}, h, { name: p }))));
    let li = f instanceof Function ? f : f ? gs : zh,
      mu = li().indexOf(':') + 1;
    if (_ && !d) throw Error('customLevels is required if useOnlyCustomLevels is set true');
    if (g && typeof g != 'function') throw Error(`Unknown mixin type "${typeof g}" - expected "function"`);
    if (L && typeof L != 'string') throw Error(`Unknown msgPrefix type "${typeof L}" - expected "string"`);
    Sh(l, d, _);
    let _u = bs(d, _);
    return (
      Object.assign(t, {
        levels: _u,
        [Wh]: _,
        [jh]: n,
        [Ih]: li,
        [kh]: mu,
        [as]: Jr,
        [Yr]: A,
        [cs]: D,
        [qh]: V,
        [Nh]: P,
        [Dh]: a,
        [$h]: c,
        [Mh]: u,
        [Fh]: u ? `,${JSON.stringify(u)}:{` : '',
        [us]: s,
        [Ch]: g,
        [Uh]: w,
        [fs]: or,
        [ds]: I,
        [Bh]: m,
        silent: Oh,
        onChild: x,
        [Vh]: L,
      }),
      Object.setPrototypeOf(t, mh()),
      Eh(t),
      t[Ph](l),
      t
    );
  }
  z.exports = Xr;
  z.exports.destination = (e = process.stdout.fd) =>
    typeof e == 'object' ? ((e.dest = ls(e.dest || process.stdout.fd)), ss(e)) : ss({ dest: ls(e), minLength: 0 });
  z.exports.transport = qr();
  z.exports.multistream = os();
  z.exports.levels = bs();
  z.exports.stdSerializers = Xh;
  z.exports.stdTimeFunctions = Object.assign({}, ps);
  z.exports.symbols = ys;
  z.exports.version = vh;
  z.exports.default = Xr;
  z.exports.pino = Xr;
});
var Es = S(($m, Ss) => {
  'use strict';
  var { Transform: Qh } = require('stream'),
    { StringDecoder: Zh } = require('string_decoder'),
    he = Symbol('last'),
    Ot = Symbol('decoder');
  function ep(e, t, r) {
    let n;
    if (this.overflow) {
      if (((n = this[Ot].write(e).split(this.matcher)), n.length === 1)) return r();
      n.shift(), (this.overflow = !1);
    } else (this[he] += this[Ot].write(e)), (n = this[he].split(this.matcher));
    this[he] = n.pop();
    for (let i = 0; i < n.length; i++)
      try {
        _s(this, this.mapper(n[i]));
      } catch (o) {
        return r(o);
      }
    if (((this.overflow = this[he].length > this.maxLength), this.overflow && !this.skipOverflow)) {
      r(new Error('maximum buffer reached'));
      return;
    }
    r();
  }
  function tp(e) {
    if (((this[he] += this[Ot].end()), this[he]))
      try {
        _s(this, this.mapper(this[he]));
      } catch (t) {
        return e(t);
      }
    e();
  }
  function _s(e, t) {
    t !== void 0 && e.push(t);
  }
  function ms(e) {
    return e;
  }
  function rp(e, t, r) {
    switch (((e = e || /\r?\n/), (t = t || ms), (r = r || {}), arguments.length)) {
      case 1:
        typeof e == 'function'
          ? ((t = e), (e = /\r?\n/))
          : typeof e == 'object' && !(e instanceof RegExp) && !e[Symbol.split] && ((r = e), (e = /\r?\n/));
        break;
      case 2:
        typeof e == 'function' ? ((r = t), (t = e), (e = /\r?\n/)) : typeof t == 'object' && ((r = t), (t = ms));
    }
    (r = Object.assign({}, r)), (r.autoDestroy = !0), (r.transform = ep), (r.flush = tp), (r.readableObjectMode = !0);
    let n = new Qh(r);
    return (
      (n[he] = ''),
      (n[Ot] = new Zh('utf8')),
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
  Ss.exports = rp;
});
var $ = S((Mm, Rs) => {
  'use strict';
  Rs.exports = {
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
var te = S((Cm, Zr) => {
  'use strict';
  var np = require('buffer'),
    ip = Object.getPrototypeOf(async function () {}).constructor,
    As = globalThis.Blob || np.Blob,
    op =
      typeof As < 'u'
        ? function (t) {
            return t instanceof As;
          }
        : function (t) {
            return !1;
          },
    Qr = class extends Error {
      constructor(t) {
        if (!Array.isArray(t)) throw new TypeError(`Expected input to be an Array, got ${typeof t}`);
        let r = '';
        for (let n = 0; n < t.length; n++)
          r += `    ${t[n].stack}
`;
        super(r), (this.name = 'AggregateError'), (this.errors = t);
      }
    };
  Zr.exports = {
    AggregateError: Qr,
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
        return e instanceof ip;
      },
      isArrayBufferView(e) {
        return ArrayBuffer.isView(e);
      },
    },
    isBlob: op,
  };
  Zr.exports.promisify.custom = Symbol.for('nodejs.util.promisify.custom');
});
var qs = S((Ye, Je) => {
  'use strict';
  Object.defineProperty(Ye, '__esModule', { value: !0 });
  var Is = new WeakMap(),
    en = new WeakMap();
  function k(e) {
    let t = Is.get(e);
    return console.assert(t != null, "'this' is expected an Event object, but got", e), t;
  }
  function xs(e) {
    if (e.passiveListener != null) {
      typeof console < 'u' &&
        typeof console.error == 'function' &&
        console.error('Unable to preventDefault inside passive event listener invocation.', e.passiveListener);
      return;
    }
    e.event.cancelable && ((e.canceled = !0), typeof e.event.preventDefault == 'function' && e.event.preventDefault());
  }
  function $e(e, t) {
    Is.set(this, {
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
      i in this || Object.defineProperty(this, i, ks(i));
    }
  }
  $e.prototype = {
    get type() {
      return k(this).event.type;
    },
    get target() {
      return k(this).eventTarget;
    },
    get currentTarget() {
      return k(this).currentTarget;
    },
    composedPath() {
      let e = k(this).currentTarget;
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
      return k(this).eventPhase;
    },
    stopPropagation() {
      let e = k(this);
      (e.stopped = !0), typeof e.event.stopPropagation == 'function' && e.event.stopPropagation();
    },
    stopImmediatePropagation() {
      let e = k(this);
      (e.stopped = !0),
        (e.immediateStopped = !0),
        typeof e.event.stopImmediatePropagation == 'function' && e.event.stopImmediatePropagation();
    },
    get bubbles() {
      return !!k(this).event.bubbles;
    },
    get cancelable() {
      return !!k(this).event.cancelable;
    },
    preventDefault() {
      xs(k(this));
    },
    get defaultPrevented() {
      return k(this).canceled;
    },
    get composed() {
      return !!k(this).event.composed;
    },
    get timeStamp() {
      return k(this).timeStamp;
    },
    get srcElement() {
      return k(this).eventTarget;
    },
    get cancelBubble() {
      return k(this).stopped;
    },
    set cancelBubble(e) {
      if (!e) return;
      let t = k(this);
      (t.stopped = !0), typeof t.event.cancelBubble == 'boolean' && (t.event.cancelBubble = !0);
    },
    get returnValue() {
      return !k(this).canceled;
    },
    set returnValue(e) {
      e || xs(k(this));
    },
    initEvent() {},
  };
  Object.defineProperty($e.prototype, 'constructor', { value: $e, configurable: !0, writable: !0 });
  typeof window < 'u' &&
    typeof window.Event < 'u' &&
    (Object.setPrototypeOf($e.prototype, window.Event.prototype), en.set(window.Event.prototype, $e));
  function ks(e) {
    return {
      get() {
        return k(this).event[e];
      },
      set(t) {
        k(this).event[e] = t;
      },
      configurable: !0,
      enumerable: !0,
    };
  }
  function sp(e) {
    return {
      value() {
        let t = k(this).event;
        return t[e].apply(t, arguments);
      },
      configurable: !0,
      enumerable: !0,
    };
  }
  function lp(e, t) {
    let r = Object.keys(t);
    if (r.length === 0) return e;
    function n(i, o) {
      e.call(this, i, o);
    }
    n.prototype = Object.create(e.prototype, { constructor: { value: n, configurable: !0, writable: !0 } });
    for (let i = 0; i < r.length; ++i) {
      let o = r[i];
      if (!(o in e.prototype)) {
        let f = typeof Object.getOwnPropertyDescriptor(t, o).value == 'function';
        Object.defineProperty(n.prototype, o, f ? sp(o) : ks(o));
      }
    }
    return n;
  }
  function js(e) {
    if (e == null || e === Object.prototype) return $e;
    let t = en.get(e);
    return t == null && ((t = lp(js(Object.getPrototypeOf(e)), e)), en.set(e, t)), t;
  }
  function fp(e, t) {
    let r = js(Object.getPrototypeOf(t));
    return new r(e, t);
  }
  function up(e) {
    return k(e).immediateStopped;
  }
  function ap(e, t) {
    k(e).eventPhase = t;
  }
  function cp(e, t) {
    k(e).currentTarget = t;
  }
  function Ts(e, t) {
    k(e).passiveListener = t;
  }
  var Ps = new WeakMap(),
    Os = 1,
    vs = 2,
    vt = 3;
  function Lt(e) {
    return e !== null && typeof e == 'object';
  }
  function Ke(e) {
    let t = Ps.get(e);
    if (t == null) throw new TypeError("'this' is expected an EventTarget object, but got another value.");
    return t;
  }
  function dp(e) {
    return {
      get() {
        let r = Ke(this).get(e);
        for (; r != null; ) {
          if (r.listenerType === vt) return r.listener;
          r = r.next;
        }
        return null;
      },
      set(t) {
        typeof t != 'function' && !Lt(t) && (t = null);
        let r = Ke(this),
          n = null,
          i = r.get(e);
        for (; i != null; )
          i.listenerType === vt
            ? n !== null
              ? (n.next = i.next)
              : i.next !== null
              ? r.set(e, i.next)
              : r.delete(e)
            : (n = i),
            (i = i.next);
        if (t !== null) {
          let o = { listener: t, listenerType: vt, passive: !1, once: !1, next: null };
          n === null ? r.set(e, o) : (n.next = o);
        }
      },
      configurable: !0,
      enumerable: !0,
    };
  }
  function tn(e, t) {
    Object.defineProperty(e, `on${t}`, dp(t));
  }
  function Ls(e) {
    function t() {
      Y.call(this);
    }
    t.prototype = Object.create(Y.prototype, { constructor: { value: t, configurable: !0, writable: !0 } });
    for (let r = 0; r < e.length; ++r) tn(t.prototype, e[r]);
    return t;
  }
  function Y() {
    if (this instanceof Y) {
      Ps.set(this, new Map());
      return;
    }
    if (arguments.length === 1 && Array.isArray(arguments[0])) return Ls(arguments[0]);
    if (arguments.length > 0) {
      let e = new Array(arguments.length);
      for (let t = 0; t < arguments.length; ++t) e[t] = arguments[t];
      return Ls(e);
    }
    throw new TypeError('Cannot call a class as a function');
  }
  Y.prototype = {
    addEventListener(e, t, r) {
      if (t == null) return;
      if (typeof t != 'function' && !Lt(t)) throw new TypeError("'listener' should be a function or an object.");
      let n = Ke(this),
        i = Lt(r),
        s = (i ? !!r.capture : !!r) ? Os : vs,
        f = { listener: t, listenerType: s, passive: i && !!r.passive, once: i && !!r.once, next: null },
        a = n.get(e);
      if (a === void 0) {
        n.set(e, f);
        return;
      }
      let c = null;
      for (; a != null; ) {
        if (a.listener === t && a.listenerType === s) return;
        (c = a), (a = a.next);
      }
      c.next = f;
    },
    removeEventListener(e, t, r) {
      if (t == null) return;
      let n = Ke(this),
        o = (Lt(r) ? !!r.capture : !!r) ? Os : vs,
        s = null,
        f = n.get(e);
      for (; f != null; ) {
        if (f.listener === t && f.listenerType === o) {
          s !== null ? (s.next = f.next) : f.next !== null ? n.set(e, f.next) : n.delete(e);
          return;
        }
        (s = f), (f = f.next);
      }
    },
    dispatchEvent(e) {
      if (e == null || typeof e.type != 'string') throw new TypeError('"event.type" should be a string.');
      let t = Ke(this),
        r = e.type,
        n = t.get(r);
      if (n == null) return !0;
      let i = fp(this, e),
        o = null;
      for (; n != null; ) {
        if (
          (n.once ? (o !== null ? (o.next = n.next) : n.next !== null ? t.set(r, n.next) : t.delete(r)) : (o = n),
          Ts(i, n.passive ? n.listener : null),
          typeof n.listener == 'function')
        )
          try {
            n.listener.call(this, i);
          } catch (s) {
            typeof console < 'u' && typeof console.error == 'function' && console.error(s);
          }
        else n.listenerType !== vt && typeof n.listener.handleEvent == 'function' && n.listener.handleEvent(i);
        if (up(i)) break;
        n = n.next;
      }
      return Ts(i, null), ap(i, 0), cp(i, null), !i.defaultPrevented;
    },
  };
  Object.defineProperty(Y.prototype, 'constructor', { value: Y, configurable: !0, writable: !0 });
  typeof window < 'u' &&
    typeof window.EventTarget < 'u' &&
    Object.setPrototypeOf(Y.prototype, window.EventTarget.prototype);
  Ye.defineEventAttribute = tn;
  Ye.EventTarget = Y;
  Ye.default = Y;
  Je.exports = Y;
  Je.exports.EventTarget = Je.exports.default = Y;
  Je.exports.defineEventAttribute = tn;
});
var kt = S((Qe, Xe) => {
  'use strict';
  Object.defineProperty(Qe, '__esModule', { value: !0 });
  var rn = qs(),
    pe = class extends rn.EventTarget {
      constructor() {
        throw (super(), new TypeError('AbortSignal cannot be constructed directly'));
      }
      get aborted() {
        let t = It.get(this);
        if (typeof t != 'boolean')
          throw new TypeError(
            `Expected 'this' to be an 'AbortSignal' object, but got ${this === null ? 'null' : typeof this}`
          );
        return t;
      }
    };
  rn.defineEventAttribute(pe.prototype, 'abort');
  function hp() {
    let e = Object.create(pe.prototype);
    return rn.EventTarget.call(e), It.set(e, !1), e;
  }
  function pp(e) {
    It.get(e) === !1 && (It.set(e, !0), e.dispatchEvent({ type: 'abort' }));
  }
  var It = new WeakMap();
  Object.defineProperties(pe.prototype, { aborted: { enumerable: !0 } });
  typeof Symbol == 'function' &&
    typeof Symbol.toStringTag == 'symbol' &&
    Object.defineProperty(pe.prototype, Symbol.toStringTag, { configurable: !0, value: 'AbortSignal' });
  var ye = class {
      constructor() {
        Ds.set(this, hp());
      }
      get signal() {
        return Ns(this);
      }
      abort() {
        pp(Ns(this));
      }
    },
    Ds = new WeakMap();
  function Ns(e) {
    let t = Ds.get(e);
    if (t == null)
      throw new TypeError(
        `Expected 'this' to be an 'AbortController' object, but got ${e === null ? 'null' : typeof e}`
      );
    return t;
  }
  Object.defineProperties(ye.prototype, { signal: { enumerable: !0 }, abort: { enumerable: !0 } });
  typeof Symbol == 'function' &&
    typeof Symbol.toStringTag == 'symbol' &&
    Object.defineProperty(ye.prototype, Symbol.toStringTag, { configurable: !0, value: 'AbortController' });
  Qe.AbortController = ye;
  Qe.AbortSignal = pe;
  Qe.default = ye;
  Xe.exports = ye;
  Xe.exports.AbortController = Xe.exports.default = ye;
  Xe.exports.AbortSignal = pe;
});
var B = S((Wm, Cs) => {
  'use strict';
  var { format: yp, inspect: jt, AggregateError: bp } = te(),
    gp = globalThis.AggregateError || bp,
    wp = Symbol('kIsNodeError'),
    mp = ['string', 'function', 'number', 'object', 'Function', 'Object', 'boolean', 'bigint', 'symbol'],
    _p = /^([A-Z][a-z0-9]*)+$/,
    Sp = '__node_internal_',
    Pt = {};
  function Ae(e, t) {
    if (!e) throw new Pt.ERR_INTERNAL_ASSERTION(t);
  }
  function $s(e) {
    let t = '',
      r = e.length,
      n = e[0] === '-' ? 1 : 0;
    for (; r >= n + 4; r -= 3) t = `_${e.slice(r - 3, r)}${t}`;
    return `${e.slice(0, r)}${t}`;
  }
  function Ep(e, t, r) {
    if (typeof t == 'function')
      return (
        Ae(
          t.length <= r.length,
          `Code: ${e}; The provided arguments length (${r.length}) does not match the required ones (${t.length}).`
        ),
        t(...r)
      );
    let n = (t.match(/%[dfijoOs]/g) || []).length;
    return (
      Ae(
        n === r.length,
        `Code: ${e}; The provided arguments length (${r.length}) does not match the required ones (${n}).`
      ),
      r.length === 0 ? t : yp(t, ...r)
    );
  }
  function W(e, t, r) {
    r || (r = Error);
    class n extends r {
      constructor(...o) {
        super(Ep(e, t, o));
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
      (n.prototype[wp] = !0),
      (Pt[e] = n);
  }
  function Ms(e) {
    let t = Sp + e.name;
    return Object.defineProperty(e, 'name', { value: t }), e;
  }
  function Rp(e, t) {
    if (e && t && e !== t) {
      if (Array.isArray(t.errors)) return t.errors.push(e), t;
      let r = new gp([t, e], t.message);
      return (r.code = t.code), r;
    }
    return e || t;
  }
  var nn = class extends Error {
    constructor(t = 'The operation was aborted', r = void 0) {
      if (r !== void 0 && typeof r != 'object') throw new Pt.ERR_INVALID_ARG_TYPE('options', 'Object', r);
      super(t, r), (this.code = 'ABORT_ERR'), (this.name = 'AbortError');
    }
  };
  W('ERR_ASSERTION', '%s', Error);
  W(
    'ERR_INVALID_ARG_TYPE',
    (e, t, r) => {
      Ae(typeof e == 'string', "'name' must be a string"), Array.isArray(t) || (t = [t]);
      let n = 'The ';
      e.endsWith(' argument') ? (n += `${e} `) : (n += `"${e}" ${e.includes('.') ? 'property' : 'argument'} `),
        (n += 'must be ');
      let i = [],
        o = [],
        s = [];
      for (let a of t)
        Ae(typeof a == 'string', 'All expected entries have to be of type string'),
          mp.includes(a)
            ? i.push(a.toLowerCase())
            : _p.test(a)
            ? o.push(a)
            : (Ae(a !== 'object', 'The value "object" should be written as "Object"'), s.push(a));
      if (o.length > 0) {
        let a = i.indexOf('object');
        a !== -1 && (i.splice(i, a, 1), o.push('Object'));
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
            let a = i.pop();
            n += `one of type ${i.join(', ')}, or ${a}`;
          }
        }
        (o.length > 0 || s.length > 0) && (n += ' or ');
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
            let a = o.pop();
            n += `an instance of ${o.join(', ')}, or ${a}`;
          }
        }
        s.length > 0 && (n += ' or ');
      }
      switch (s.length) {
        case 0:
          break;
        case 1:
          s[0].toLowerCase() !== s[0] && (n += 'an '), (n += `${s[0]}`);
          break;
        case 2:
          n += `one of ${s[0]} or ${s[1]}`;
          break;
        default: {
          let a = s.pop();
          n += `one of ${s.join(', ')}, or ${a}`;
        }
      }
      if (r == null) n += `. Received ${r}`;
      else if (typeof r == 'function' && r.name) n += `. Received function ${r.name}`;
      else if (typeof r == 'object') {
        var f;
        if ((f = r.constructor) !== null && f !== void 0 && f.name)
          n += `. Received an instance of ${r.constructor.name}`;
        else {
          let a = jt(r, { depth: -1 });
          n += `. Received ${a}`;
        }
      } else {
        let a = jt(r, { colors: !1 });
        a.length > 25 && (a = `${a.slice(0, 25)}...`), (n += `. Received type ${typeof r} (${a})`);
      }
      return n;
    },
    TypeError
  );
  W(
    'ERR_INVALID_ARG_VALUE',
    (e, t, r = 'is invalid') => {
      let n = jt(t);
      return (
        n.length > 128 && (n = n.slice(0, 128) + '...'),
        `The ${e.includes('.') ? 'property' : 'argument'} '${e}' ${r}. Received ${n}`
      );
    },
    TypeError
  );
  W(
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
  W(
    'ERR_MISSING_ARGS',
    (...e) => {
      Ae(e.length > 0, 'At least one arg needs to be specified');
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
  W(
    'ERR_OUT_OF_RANGE',
    (e, t, r) => {
      Ae(t, 'Missing "range" argument');
      let n;
      return (
        Number.isInteger(r) && Math.abs(r) > 2 ** 32
          ? (n = $s(String(r)))
          : typeof r == 'bigint'
          ? ((n = String(r)), (r > 2n ** 32n || r < -(2n ** 32n)) && (n = $s(n)), (n += 'n'))
          : (n = jt(r)),
        `The value of "${e}" is out of range. It must be ${t}. Received ${n}`
      );
    },
    RangeError
  );
  W('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times', Error);
  W('ERR_METHOD_NOT_IMPLEMENTED', 'The %s method is not implemented', Error);
  W('ERR_STREAM_ALREADY_FINISHED', 'Cannot call %s after a stream was finished', Error);
  W('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable', Error);
  W('ERR_STREAM_DESTROYED', 'Cannot call %s after a stream was destroyed', Error);
  W('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
  W('ERR_STREAM_PREMATURE_CLOSE', 'Premature close', Error);
  W('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF', Error);
  W('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event', Error);
  W('ERR_STREAM_WRITE_AFTER_END', 'write after end', Error);
  W('ERR_UNKNOWN_ENCODING', 'Unknown encoding: %s', TypeError);
  Cs.exports = { AbortError: nn, aggregateTwoErrors: Ms(Rp), hideStackFrames: Ms, codes: Pt };
});
var Ze = S((Bm, Ks) => {
  'use strict';
  var {
      ArrayIsArray: sn,
      ArrayPrototypeIncludes: Us,
      ArrayPrototypeJoin: Vs,
      ArrayPrototypeMap: Ap,
      NumberIsInteger: ln,
      NumberIsNaN: xp,
      NumberMAX_SAFE_INTEGER: Tp,
      NumberMIN_SAFE_INTEGER: Op,
      NumberParseInt: vp,
      ObjectPrototypeHasOwnProperty: Lp,
      RegExpPrototypeExec: zs,
      String: Ip,
      StringPrototypeToUpperCase: kp,
      StringPrototypeTrim: jp,
    } = $(),
    {
      hideStackFrames: G,
      codes: {
        ERR_SOCKET_BAD_PORT: Pp,
        ERR_INVALID_ARG_TYPE: F,
        ERR_INVALID_ARG_VALUE: Me,
        ERR_OUT_OF_RANGE: xe,
        ERR_UNKNOWN_SIGNAL: Ws,
      },
    } = B(),
    { normalizeEncoding: qp } = te(),
    { isAsyncFunction: Np, isArrayBufferView: Dp } = te().types,
    Bs = {};
  function $p(e) {
    return e === (e | 0);
  }
  function Mp(e) {
    return e === e >>> 0;
  }
  var Cp = /^[0-7]+$/,
    Wp = 'must be a 32-bit unsigned integer or an octal string';
  function Bp(e, t, r) {
    if ((typeof e > 'u' && (e = r), typeof e == 'string')) {
      if (zs(Cp, e) === null) throw new Me(t, e, Wp);
      e = vp(e, 8);
    }
    return Gs(e, t), e;
  }
  var Fp = G((e, t, r = Op, n = Tp) => {
      if (typeof e != 'number') throw new F(t, 'number', e);
      if (!ln(e)) throw new xe(t, 'an integer', e);
      if (e < r || e > n) throw new xe(t, `>= ${r} && <= ${n}`, e);
    }),
    Up = G((e, t, r = -2147483648, n = 2147483647) => {
      if (typeof e != 'number') throw new F(t, 'number', e);
      if (!ln(e)) throw new xe(t, 'an integer', e);
      if (e < r || e > n) throw new xe(t, `>= ${r} && <= ${n}`, e);
    }),
    Gs = G((e, t, r = !1) => {
      if (typeof e != 'number') throw new F(t, 'number', e);
      if (!ln(e)) throw new xe(t, 'an integer', e);
      let n = r ? 1 : 0,
        i = 4294967295;
      if (e < n || e > i) throw new xe(t, `>= ${n} && <= ${i}`, e);
    });
  function fn(e, t) {
    if (typeof e != 'string') throw new F(t, 'string', e);
  }
  function Vp(e, t, r = void 0, n) {
    if (typeof e != 'number') throw new F(t, 'number', e);
    if ((r != null && e < r) || (n != null && e > n) || ((r != null || n != null) && xp(e)))
      throw new xe(
        t,
        `${r != null ? `>= ${r}` : ''}${r != null && n != null ? ' && ' : ''}${n != null ? `<= ${n}` : ''}`,
        e
      );
  }
  var zp = G((e, t, r) => {
    if (!Us(r, e)) {
      let i =
        'must be one of: ' +
        Vs(
          Ap(r, (o) => (typeof o == 'string' ? `'${o}'` : Ip(o))),
          ', '
        );
      throw new Me(t, e, i);
    }
  });
  function Hs(e, t) {
    if (typeof e != 'boolean') throw new F(t, 'boolean', e);
  }
  function on(e, t, r) {
    return e == null || !Lp(e, t) ? r : e[t];
  }
  var Gp = G((e, t, r = null) => {
      let n = on(r, 'allowArray', !1),
        i = on(r, 'allowFunction', !1);
      if (
        (!on(r, 'nullable', !1) && e === null) ||
        (!n && sn(e)) ||
        (typeof e != 'object' && (!i || typeof e != 'function'))
      )
        throw new F(t, 'Object', e);
    }),
    Hp = G((e, t) => {
      if (e != null && typeof e != 'object' && typeof e != 'function') throw new F(t, 'a dictionary', e);
    }),
    un = G((e, t, r = 0) => {
      if (!sn(e)) throw new F(t, 'Array', e);
      if (e.length < r) {
        let n = `must be longer than ${r}`;
        throw new Me(t, e, n);
      }
    });
  function Kp(e, t) {
    un(e, t);
    for (let r = 0; r < e.length; r++) fn(e[r], `${t}[${r}]`);
  }
  function Jp(e, t) {
    un(e, t);
    for (let r = 0; r < e.length; r++) Hs(e[r], `${t}[${r}]`);
  }
  function Yp(e, t = 'signal') {
    if ((fn(e, t), Bs[e] === void 0))
      throw Bs[kp(e)] !== void 0 ? new Ws(e + ' (signals must use all capital letters)') : new Ws(e);
  }
  var Xp = G((e, t = 'buffer') => {
    if (!Dp(e)) throw new F(t, ['Buffer', 'TypedArray', 'DataView'], e);
  });
  function Qp(e, t) {
    let r = qp(t),
      n = e.length;
    if (r === 'hex' && n % 2 !== 0) throw new Me('encoding', t, `is invalid for data of length ${n}`);
  }
  function Zp(e, t = 'Port', r = !0) {
    if (
      (typeof e != 'number' && typeof e != 'string') ||
      (typeof e == 'string' && jp(e).length === 0) ||
      +e !== +e >>> 0 ||
      e > 65535 ||
      (e === 0 && !r)
    )
      throw new Pp(t, e, r);
    return e | 0;
  }
  var ey = G((e, t) => {
      if (e !== void 0 && (e === null || typeof e != 'object' || !('aborted' in e))) throw new F(t, 'AbortSignal', e);
    }),
    ty = G((e, t) => {
      if (typeof e != 'function') throw new F(t, 'Function', e);
    }),
    ry = G((e, t) => {
      if (typeof e != 'function' || Np(e)) throw new F(t, 'Function', e);
    }),
    ny = G((e, t) => {
      if (e !== void 0) throw new F(t, 'undefined', e);
    });
  function iy(e, t, r) {
    if (!Us(r, e)) throw new F(t, `('${Vs(r, '|')}')`, e);
  }
  var oy = /^(?:<[^>]*>)(?:\s*;\s*[^;"\s]+(?:=(")?[^;"\s]*\1)?)*$/;
  function Fs(e, t) {
    if (typeof e > 'u' || !zs(oy, e))
      throw new Me(t, e, 'must be an array or string of format "</styles.css>; rel=preload; as=style"');
  }
  function sy(e) {
    if (typeof e == 'string') return Fs(e, 'hints'), e;
    if (sn(e)) {
      let t = e.length,
        r = '';
      if (t === 0) return r;
      for (let n = 0; n < t; n++) {
        let i = e[n];
        Fs(i, 'hints'), (r += i), n !== t - 1 && (r += ', ');
      }
      return r;
    }
    throw new Me('hints', e, 'must be an array or string of format "</styles.css>; rel=preload; as=style"');
  }
  Ks.exports = {
    isInt32: $p,
    isUint32: Mp,
    parseFileMode: Bp,
    validateArray: un,
    validateStringArray: Kp,
    validateBooleanArray: Jp,
    validateBoolean: Hs,
    validateBuffer: Xp,
    validateDictionary: Hp,
    validateEncoding: Qp,
    validateFunction: ty,
    validateInt32: Up,
    validateInteger: Fp,
    validateNumber: Vp,
    validateObject: Gp,
    validateOneOf: zp,
    validatePlainFunction: ry,
    validatePort: Zp,
    validateSignalName: Yp,
    validateString: fn,
    validateUint32: Gs,
    validateUndefined: ny,
    validateUnion: iy,
    validateAbortSignal: ey,
    validateLinkHeaderValue: sy,
  };
});
var be = S((Fm, Js) => {
  Js.exports = global.process;
});
var ne = S((Um, cl) => {
  'use strict';
  var { Symbol: qt, SymbolAsyncIterator: Ys, SymbolIterator: Xs, SymbolFor: Qs } = $(),
    Zs = qt('kDestroyed'),
    el = qt('kIsErrored'),
    an = qt('kIsReadable'),
    tl = qt('kIsDisturbed'),
    ly = Qs('nodejs.webstream.isClosedPromise'),
    fy = Qs('nodejs.webstream.controllerErrorFunction');
  function Nt(e, t = !1) {
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
  function Dt(e) {
    var t;
    return !!(
      e &&
      typeof e.write == 'function' &&
      typeof e.on == 'function' &&
      (!e._readableState || ((t = e._writableState) === null || t === void 0 ? void 0 : t.writable) !== !1)
    );
  }
  function uy(e) {
    return !!(
      e &&
      typeof e.pipe == 'function' &&
      e._readableState &&
      typeof e.on == 'function' &&
      typeof e.write == 'function'
    );
  }
  function re(e) {
    return (
      e &&
      (e._readableState ||
        e._writableState ||
        (typeof e.write == 'function' && typeof e.on == 'function') ||
        (typeof e.pipe == 'function' && typeof e.on == 'function'))
    );
  }
  function rl(e) {
    return !!(
      e &&
      !re(e) &&
      typeof e.pipeThrough == 'function' &&
      typeof e.getReader == 'function' &&
      typeof e.cancel == 'function'
    );
  }
  function nl(e) {
    return !!(e && !re(e) && typeof e.getWriter == 'function' && typeof e.abort == 'function');
  }
  function il(e) {
    return !!(e && !re(e) && typeof e.readable == 'object' && typeof e.writable == 'object');
  }
  function ay(e) {
    return rl(e) || nl(e) || il(e);
  }
  function cy(e, t) {
    return e == null
      ? !1
      : t === !0
      ? typeof e[Ys] == 'function'
      : t === !1
      ? typeof e[Xs] == 'function'
      : typeof e[Ys] == 'function' || typeof e[Xs] == 'function';
  }
  function $t(e) {
    if (!re(e)) return null;
    let t = e._writableState,
      r = e._readableState,
      n = t || r;
    return !!(e.destroyed || e[Zs] || (n != null && n.destroyed));
  }
  function ol(e) {
    if (!Dt(e)) return null;
    if (e.writableEnded === !0) return !0;
    let t = e._writableState;
    return t != null && t.errored ? !1 : typeof t?.ended != 'boolean' ? null : t.ended;
  }
  function dy(e, t) {
    if (!Dt(e)) return null;
    if (e.writableFinished === !0) return !0;
    let r = e._writableState;
    return r != null && r.errored
      ? !1
      : typeof r?.finished != 'boolean'
      ? null
      : !!(r.finished || (t === !1 && r.ended === !0 && r.length === 0));
  }
  function hy(e) {
    if (!Nt(e)) return null;
    if (e.readableEnded === !0) return !0;
    let t = e._readableState;
    return !t || t.errored ? !1 : typeof t?.ended != 'boolean' ? null : t.ended;
  }
  function sl(e, t) {
    if (!Nt(e)) return null;
    let r = e._readableState;
    return r != null && r.errored
      ? !1
      : typeof r?.endEmitted != 'boolean'
      ? null
      : !!(r.endEmitted || (t === !1 && r.ended === !0 && r.length === 0));
  }
  function ll(e) {
    return e && e[an] != null
      ? e[an]
      : typeof e?.readable != 'boolean'
      ? null
      : $t(e)
      ? !1
      : Nt(e) && e.readable && !sl(e);
  }
  function fl(e) {
    return typeof e?.writable != 'boolean' ? null : $t(e) ? !1 : Dt(e) && e.writable && !ol(e);
  }
  function py(e, t) {
    return re(e) ? ($t(e) ? !0 : !((t?.readable !== !1 && ll(e)) || (t?.writable !== !1 && fl(e)))) : null;
  }
  function yy(e) {
    var t, r;
    return re(e)
      ? e.writableErrored
        ? e.writableErrored
        : (t = (r = e._writableState) === null || r === void 0 ? void 0 : r.errored) !== null && t !== void 0
        ? t
        : null
      : null;
  }
  function by(e) {
    var t, r;
    return re(e)
      ? e.readableErrored
        ? e.readableErrored
        : (t = (r = e._readableState) === null || r === void 0 ? void 0 : r.errored) !== null && t !== void 0
        ? t
        : null
      : null;
  }
  function gy(e) {
    if (!re(e)) return null;
    if (typeof e.closed == 'boolean') return e.closed;
    let t = e._writableState,
      r = e._readableState;
    return typeof t?.closed == 'boolean' || typeof r?.closed == 'boolean'
      ? t?.closed || r?.closed
      : typeof e._closed == 'boolean' && ul(e)
      ? e._closed
      : null;
  }
  function ul(e) {
    return (
      typeof e._closed == 'boolean' &&
      typeof e._defaultKeepAlive == 'boolean' &&
      typeof e._removedConnection == 'boolean' &&
      typeof e._removedContLen == 'boolean'
    );
  }
  function al(e) {
    return typeof e._sent100 == 'boolean' && ul(e);
  }
  function wy(e) {
    var t;
    return (
      typeof e._consuming == 'boolean' &&
      typeof e._dumped == 'boolean' &&
      ((t = e.req) === null || t === void 0 ? void 0 : t.upgradeOrConnect) === void 0
    );
  }
  function my(e) {
    if (!re(e)) return null;
    let t = e._writableState,
      r = e._readableState,
      n = t || r;
    return (!n && al(e)) || !!(n && n.autoDestroy && n.emitClose && n.closed === !1);
  }
  function _y(e) {
    var t;
    return !!(e && ((t = e[tl]) !== null && t !== void 0 ? t : e.readableDidRead || e.readableAborted));
  }
  function Sy(e) {
    var t, r, n, i, o, s, f, a, c, u;
    return !!(
      e &&
      ((t =
        (r =
          (n =
            (i =
              (o = (s = e[el]) !== null && s !== void 0 ? s : e.readableErrored) !== null && o !== void 0
                ? o
                : e.writableErrored) !== null && i !== void 0
              ? i
              : (f = e._readableState) === null || f === void 0
              ? void 0
              : f.errorEmitted) !== null && n !== void 0
            ? n
            : (a = e._writableState) === null || a === void 0
            ? void 0
            : a.errorEmitted) !== null && r !== void 0
          ? r
          : (c = e._readableState) === null || c === void 0
          ? void 0
          : c.errored) !== null && t !== void 0
        ? t
        : !((u = e._writableState) === null || u === void 0) && u.errored)
    );
  }
  cl.exports = {
    kDestroyed: Zs,
    isDisturbed: _y,
    kIsDisturbed: tl,
    isErrored: Sy,
    kIsErrored: el,
    isReadable: ll,
    kIsReadable: an,
    kIsClosedPromise: ly,
    kControllerErrorFunction: fy,
    isClosed: gy,
    isDestroyed: $t,
    isDuplexNodeStream: uy,
    isFinished: py,
    isIterable: cy,
    isReadableNodeStream: Nt,
    isReadableStream: rl,
    isReadableEnded: hy,
    isReadableFinished: sl,
    isReadableErrored: by,
    isNodeStream: re,
    isWebStream: ay,
    isWritable: fl,
    isWritableNodeStream: Dt,
    isWritableStream: nl,
    isWritableEnded: ol,
    isWritableFinished: dy,
    isWritableErrored: yy,
    isServerRequest: wy,
    isServerResponse: al,
    willEmitClose: my,
    isTransformStream: il,
  };
});
var le = S((Vm, yn) => {
  var ge = be(),
    { AbortError: _l, codes: Ey } = B(),
    { ERR_INVALID_ARG_TYPE: Ry, ERR_STREAM_PREMATURE_CLOSE: dl } = Ey,
    { kEmptyObject: dn, once: hn } = te(),
    { validateAbortSignal: Ay, validateFunction: xy, validateObject: Ty, validateBoolean: Oy } = Ze(),
    { Promise: vy, PromisePrototypeThen: Ly } = $(),
    {
      isClosed: Iy,
      isReadable: hl,
      isReadableNodeStream: cn,
      isReadableStream: ky,
      isReadableFinished: pl,
      isReadableErrored: yl,
      isWritable: bl,
      isWritableNodeStream: gl,
      isWritableStream: jy,
      isWritableFinished: wl,
      isWritableErrored: ml,
      isNodeStream: Py,
      willEmitClose: qy,
      kIsClosedPromise: Ny,
    } = ne();
  function Dy(e) {
    return e.setHeader && typeof e.abort == 'function';
  }
  var pn = () => {};
  function Sl(e, t, r) {
    var n, i;
    if (
      (arguments.length === 2 ? ((r = t), (t = dn)) : t == null ? (t = dn) : Ty(t, 'options'),
      xy(r, 'callback'),
      Ay(t.signal, 'options.signal'),
      (r = hn(r)),
      ky(e) || jy(e))
    )
      return $y(e, t, r);
    if (!Py(e)) throw new Ry('stream', ['ReadableStream', 'WritableStream', 'Stream'], e);
    let o = (n = t.readable) !== null && n !== void 0 ? n : cn(e),
      s = (i = t.writable) !== null && i !== void 0 ? i : gl(e),
      f = e._writableState,
      a = e._readableState,
      c = () => {
        e.writable || p();
      },
      u = qy(e) && cn(e) === o && gl(e) === s,
      h = wl(e, !1),
      p = () => {
        (h = !0), e.destroyed && (u = !1), !(u && (!e.readable || o)) && (!o || l) && r.call(e);
      },
      l = pl(e, !1),
      d = () => {
        (l = !0), e.destroyed && (u = !1), !(u && (!e.writable || s)) && (!s || h) && r.call(e);
      },
      g = (R) => {
        r.call(e, R);
      },
      w = Iy(e),
      _ = () => {
        w = !0;
        let R = ml(e) || yl(e);
        if (R && typeof R != 'boolean') return r.call(e, R);
        if (o && !l && cn(e, !0) && !pl(e, !1)) return r.call(e, new dl());
        if (s && !h && !wl(e, !1)) return r.call(e, new dl());
        r.call(e);
      },
      y = () => {
        w = !0;
        let R = ml(e) || yl(e);
        if (R && typeof R != 'boolean') return r.call(e, R);
        r.call(e);
      },
      m = () => {
        e.req.on('finish', p);
      };
    Dy(e)
      ? (e.on('complete', p), u || e.on('abort', _), e.req ? m() : e.on('request', m))
      : s && !f && (e.on('end', c), e.on('close', c)),
      !u && typeof e.aborted == 'boolean' && e.on('aborted', _),
      e.on('end', d),
      e.on('finish', p),
      t.error !== !1 && e.on('error', g),
      e.on('close', _),
      w
        ? ge.nextTick(_)
        : (f != null && f.errorEmitted) || (a != null && a.errorEmitted)
        ? u || ge.nextTick(y)
        : ((!o && (!u || hl(e)) && (h || bl(e) === !1)) ||
            (!s && (!u || bl(e)) && (l || hl(e) === !1)) ||
            (a && e.req && e.aborted)) &&
          ge.nextTick(y);
    let E = () => {
      (r = pn),
        e.removeListener('aborted', _),
        e.removeListener('complete', p),
        e.removeListener('abort', _),
        e.removeListener('request', m),
        e.req && e.req.removeListener('finish', p),
        e.removeListener('end', c),
        e.removeListener('close', c),
        e.removeListener('finish', p),
        e.removeListener('end', d),
        e.removeListener('error', g),
        e.removeListener('close', _);
    };
    if (t.signal && !w) {
      let R = () => {
        let x = r;
        E(), x.call(e, new _l(void 0, { cause: t.signal.reason }));
      };
      if (t.signal.aborted) ge.nextTick(R);
      else {
        let x = r;
        (r = hn((...L) => {
          t.signal.removeEventListener('abort', R), x.apply(e, L);
        })),
          t.signal.addEventListener('abort', R);
      }
    }
    return E;
  }
  function $y(e, t, r) {
    let n = !1,
      i = pn;
    if (t.signal)
      if (
        ((i = () => {
          (n = !0), r.call(e, new _l(void 0, { cause: t.signal.reason }));
        }),
        t.signal.aborted)
      )
        ge.nextTick(i);
      else {
        let s = r;
        (r = hn((...f) => {
          t.signal.removeEventListener('abort', i), s.apply(e, f);
        })),
          t.signal.addEventListener('abort', i);
      }
    let o = (...s) => {
      n || ge.nextTick(() => r.apply(e, s));
    };
    return Ly(e[Ny].promise, o, o), pn;
  }
  function My(e, t) {
    var r;
    let n = !1;
    return (
      t === null && (t = dn),
      (r = t) !== null && r !== void 0 && r.cleanup && (Oy(t.cleanup, 'cleanup'), (n = t.cleanup)),
      new vy((i, o) => {
        let s = Sl(e, t, (f) => {
          n && s(), f ? o(f) : i();
        });
      })
    );
  }
  yn.exports = Sl;
  yn.exports.finished = My;
});
var Te = S((zm, Ll) => {
  'use strict';
  var ie = be(),
    {
      aggregateTwoErrors: Cy,
      codes: { ERR_MULTIPLE_CALLBACK: Wy },
      AbortError: By,
    } = B(),
    { Symbol: Al } = $(),
    { kDestroyed: Fy, isDestroyed: Uy, isFinished: Vy, isServerRequest: zy } = ne(),
    xl = Al('kDestroy'),
    bn = Al('kConstruct');
  function Tl(e, t, r) {
    e && (e.stack, t && !t.errored && (t.errored = e), r && !r.errored && (r.errored = e));
  }
  function Gy(e, t) {
    let r = this._readableState,
      n = this._writableState,
      i = n || r;
    return (n != null && n.destroyed) || (r != null && r.destroyed)
      ? (typeof t == 'function' && t(), this)
      : (Tl(e, n, r),
        n && (n.destroyed = !0),
        r && (r.destroyed = !0),
        i.constructed
          ? El(this, e, t)
          : this.once(xl, function (o) {
              El(this, Cy(o, e), t);
            }),
        this);
  }
  function El(e, t, r) {
    let n = !1;
    function i(o) {
      if (n) return;
      n = !0;
      let s = e._readableState,
        f = e._writableState;
      Tl(o, f, s),
        f && (f.closed = !0),
        s && (s.closed = !0),
        typeof r == 'function' && r(o),
        o ? ie.nextTick(Hy, e, o) : ie.nextTick(Ol, e);
    }
    try {
      e._destroy(t || null, i);
    } catch (o) {
      i(o);
    }
  }
  function Hy(e, t) {
    gn(e, t), Ol(e);
  }
  function Ol(e) {
    let t = e._readableState,
      r = e._writableState;
    r && (r.closeEmitted = !0),
      t && (t.closeEmitted = !0),
      ((r != null && r.emitClose) || (t != null && t.emitClose)) && e.emit('close');
  }
  function gn(e, t) {
    let r = e._readableState,
      n = e._writableState;
    (n != null && n.errorEmitted) ||
      (r != null && r.errorEmitted) ||
      (n && (n.errorEmitted = !0), r && (r.errorEmitted = !0), e.emit('error', t));
  }
  function Ky() {
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
  function wn(e, t, r) {
    let n = e._readableState,
      i = e._writableState;
    if ((i != null && i.destroyed) || (n != null && n.destroyed)) return this;
    (n != null && n.autoDestroy) || (i != null && i.autoDestroy)
      ? e.destroy(t)
      : t &&
        (t.stack,
        i && !i.errored && (i.errored = t),
        n && !n.errored && (n.errored = t),
        r ? ie.nextTick(gn, e, t) : gn(e, t));
  }
  function Jy(e, t) {
    if (typeof e._construct != 'function') return;
    let r = e._readableState,
      n = e._writableState;
    r && (r.constructed = !1),
      n && (n.constructed = !1),
      e.once(bn, t),
      !(e.listenerCount(bn) > 1) && ie.nextTick(Yy, e);
  }
  function Yy(e) {
    let t = !1;
    function r(n) {
      if (t) {
        wn(e, n ?? new Wy());
        return;
      }
      t = !0;
      let i = e._readableState,
        o = e._writableState,
        s = o || i;
      i && (i.constructed = !0),
        o && (o.constructed = !0),
        s.destroyed ? e.emit(xl, n) : n ? wn(e, n, !0) : ie.nextTick(Xy, e);
    }
    try {
      e._construct((n) => {
        ie.nextTick(r, n);
      });
    } catch (n) {
      ie.nextTick(r, n);
    }
  }
  function Xy(e) {
    e.emit(bn);
  }
  function Rl(e) {
    return e?.setHeader && typeof e.abort == 'function';
  }
  function vl(e) {
    e.emit('close');
  }
  function Qy(e, t) {
    e.emit('error', t), ie.nextTick(vl, e);
  }
  function Zy(e, t) {
    !e ||
      Uy(e) ||
      (!t && !Vy(e) && (t = new By()),
      zy(e)
        ? ((e.socket = null), e.destroy(t))
        : Rl(e)
        ? e.abort()
        : Rl(e.req)
        ? e.req.abort()
        : typeof e.destroy == 'function'
        ? e.destroy(t)
        : typeof e.close == 'function'
        ? e.close()
        : t
        ? ie.nextTick(Qy, e, t)
        : ie.nextTick(vl, e),
      e.destroyed || (e[Fy] = !0));
  }
  Ll.exports = { construct: Jy, destroyer: Zy, destroy: Gy, undestroy: Ky, errorOrDestroy: wn };
});
var Wt = S((Gm, kl) => {
  'use strict';
  var { ArrayIsArray: eb, ObjectSetPrototypeOf: Il } = $(),
    { EventEmitter: Mt } = require('events');
  function Ct(e) {
    Mt.call(this, e);
  }
  Il(Ct.prototype, Mt.prototype);
  Il(Ct, Mt);
  Ct.prototype.pipe = function (e, t) {
    let r = this;
    function n(u) {
      e.writable && e.write(u) === !1 && r.pause && r.pause();
    }
    r.on('data', n);
    function i() {
      r.readable && r.resume && r.resume();
    }
    e.on('drain', i), !e._isStdio && (!t || t.end !== !1) && (r.on('end', s), r.on('close', f));
    let o = !1;
    function s() {
      o || ((o = !0), e.end());
    }
    function f() {
      o || ((o = !0), typeof e.destroy == 'function' && e.destroy());
    }
    function a(u) {
      c(), Mt.listenerCount(this, 'error') === 0 && this.emit('error', u);
    }
    mn(r, 'error', a), mn(e, 'error', a);
    function c() {
      r.removeListener('data', n),
        e.removeListener('drain', i),
        r.removeListener('end', s),
        r.removeListener('close', f),
        r.removeListener('error', a),
        e.removeListener('error', a),
        r.removeListener('end', c),
        r.removeListener('close', c),
        e.removeListener('close', c);
    }
    return r.on('end', c), r.on('close', c), e.on('close', c), e.emit('pipe', r), e;
  };
  function mn(e, t, r) {
    if (typeof e.prependListener == 'function') return e.prependListener(t, r);
    !e._events || !e._events[t]
      ? e.on(t, r)
      : eb(e._events[t])
      ? e._events[t].unshift(r)
      : (e._events[t] = [r, e._events[t]]);
  }
  kl.exports = { Stream: Ct, prependListener: mn };
});
var et = S((Hm, Bt) => {
  'use strict';
  var { AbortError: jl, codes: tb } = B(),
    { isNodeStream: Pl, isWebStream: rb, kControllerErrorFunction: nb } = ne(),
    ib = le(),
    { ERR_INVALID_ARG_TYPE: ql } = tb,
    ob = (e, t) => {
      if (typeof e != 'object' || !('aborted' in e)) throw new ql(t, 'AbortSignal', e);
    };
  Bt.exports.addAbortSignal = function (t, r) {
    if ((ob(t, 'signal'), !Pl(r) && !rb(r))) throw new ql('stream', ['ReadableStream', 'WritableStream', 'Stream'], r);
    return Bt.exports.addAbortSignalNoValidate(t, r);
  };
  Bt.exports.addAbortSignalNoValidate = function (e, t) {
    if (typeof e != 'object' || !('aborted' in e)) return t;
    let r = Pl(t)
      ? () => {
          t.destroy(new jl(void 0, { cause: e.reason }));
        }
      : () => {
          t[nb](new jl(void 0, { cause: e.reason }));
        };
    return e.aborted ? r() : (e.addEventListener('abort', r), ib(t, () => e.removeEventListener('abort', r))), t;
  };
});
var $l = S((Jm, Dl) => {
  'use strict';
  var { StringPrototypeSlice: Nl, SymbolIterator: sb, TypedArrayPrototypeSet: Ft, Uint8Array: lb } = $(),
    { Buffer: _n } = require('buffer'),
    { inspect: fb } = te();
  Dl.exports = class {
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
      if (this.length === 0) return _n.alloc(0);
      let r = _n.allocUnsafe(t >>> 0),
        n = this.head,
        i = 0;
      for (; n; ) Ft(r, n.data, i), (i += n.data.length), (n = n.next);
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
    *[sb]() {
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
            : ((r += Nl(o, 0, t)), (this.head = n), (n.data = Nl(o, t)));
          break;
        }
        ++i;
      } while ((n = n.next) !== null);
      return (this.length -= i), r;
    }
    _getBuffer(t) {
      let r = _n.allocUnsafe(t),
        n = t,
        i = this.head,
        o = 0;
      do {
        let s = i.data;
        if (t > s.length) Ft(r, s, n - t), (t -= s.length);
        else {
          t === s.length
            ? (Ft(r, s, n - t), ++o, i.next ? (this.head = i.next) : (this.head = this.tail = null))
            : (Ft(r, new lb(s.buffer, s.byteOffset, t), n - t), (this.head = i), (i.data = s.slice(t)));
          break;
        }
        ++o;
      } while ((i = i.next) !== null);
      return (this.length -= o), r;
    }
    [Symbol.for('nodejs.util.inspect.custom')](t, r) {
      return fb(this, { ...r, depth: 0, customInspect: !1 });
    }
  };
});
var Ut = S((Ym, Cl) => {
  'use strict';
  var { MathFloor: ub, NumberIsInteger: ab } = $(),
    { ERR_INVALID_ARG_VALUE: cb } = B().codes;
  function db(e, t, r) {
    return e.highWaterMark != null ? e.highWaterMark : t ? e[r] : null;
  }
  function Ml(e) {
    return e ? 16 : 16 * 1024;
  }
  function hb(e, t, r, n) {
    let i = db(t, n, r);
    if (i != null) {
      if (!ab(i) || i < 0) {
        let o = n ? `options.${r}` : 'options.highWaterMark';
        throw new cb(o, i);
      }
      return ub(i);
    }
    return Ml(e.objectMode);
  }
  Cl.exports = { getHighWaterMark: hb, getDefaultHighWaterMark: Ml };
});
var Sn = S((Xm, Ul) => {
  'use strict';
  var Wl = be(),
    { PromisePrototypeThen: pb, SymbolAsyncIterator: Bl, SymbolIterator: Fl } = $(),
    { Buffer: yb } = require('buffer'),
    { ERR_INVALID_ARG_TYPE: bb, ERR_STREAM_NULL_VALUES: gb } = B().codes;
  function wb(e, t, r) {
    let n;
    if (typeof t == 'string' || t instanceof yb)
      return new e({
        objectMode: !0,
        ...r,
        read() {
          this.push(t), this.push(null);
        },
      });
    let i;
    if (t && t[Bl]) (i = !0), (n = t[Bl]());
    else if (t && t[Fl]) (i = !1), (n = t[Fl]());
    else throw new bb('iterable', ['Iterable'], t);
    let o = new e({ objectMode: !0, highWaterMark: 1, ...r }),
      s = !1;
    (o._read = function () {
      s || ((s = !0), a());
    }),
      (o._destroy = function (c, u) {
        pb(
          f(c),
          () => Wl.nextTick(u, c),
          (h) => Wl.nextTick(u, h || c)
        );
      });
    async function f(c) {
      let u = c != null,
        h = typeof n.throw == 'function';
      if (u && h) {
        let { value: p, done: l } = await n.throw(c);
        if ((await p, l)) return;
      }
      if (typeof n.return == 'function') {
        let { value: p } = await n.return();
        await p;
      }
    }
    async function a() {
      for (;;) {
        try {
          let { value: c, done: u } = i ? await n.next() : n.next();
          if (u) o.push(null);
          else {
            let h = c && typeof c.then == 'function' ? await c : c;
            if (h === null) throw ((s = !1), new gb());
            if (o.push(h)) continue;
            s = !1;
          }
        } catch (c) {
          o.destroy(c);
        }
        break;
      }
    }
    return o;
  }
  Ul.exports = wb;
});
var tt = S((Qm, rf) => {
  var X = be(),
    {
      ArrayPrototypeIndexOf: mb,
      NumberIsInteger: _b,
      NumberIsNaN: Sb,
      NumberParseInt: Eb,
      ObjectDefineProperties: Gl,
      ObjectKeys: Rb,
      ObjectSetPrototypeOf: Hl,
      Promise: Ab,
      SafeSet: xb,
      SymbolAsyncIterator: Tb,
      Symbol: Ob,
    } = $();
  rf.exports = T;
  T.ReadableState = On;
  var { EventEmitter: vb } = require('events'),
    { Stream: we, prependListener: Lb } = Wt(),
    { Buffer: En } = require('buffer'),
    { addAbortSignal: Ib } = et(),
    kb = le(),
    v = te().debuglog('stream', (e) => {
      v = e;
    }),
    jb = $l(),
    We = Te(),
    { getHighWaterMark: Pb, getDefaultHighWaterMark: qb } = Ut(),
    {
      aggregateTwoErrors: Vl,
      codes: {
        ERR_INVALID_ARG_TYPE: Nb,
        ERR_METHOD_NOT_IMPLEMENTED: Db,
        ERR_OUT_OF_RANGE: $b,
        ERR_STREAM_PUSH_AFTER_EOF: Mb,
        ERR_STREAM_UNSHIFT_AFTER_END_EVENT: Cb,
      },
    } = B(),
    { validateObject: Wb } = Ze(),
    Oe = Ob('kPaused'),
    { StringDecoder: Kl } = require('string_decoder'),
    Bb = Sn();
  Hl(T.prototype, we.prototype);
  Hl(T, we);
  var Rn = () => {},
    { errorOrDestroy: Ce } = We;
  function On(e, t, r) {
    typeof r != 'boolean' && (r = t instanceof oe()),
      (this.objectMode = !!(e && e.objectMode)),
      r && (this.objectMode = this.objectMode || !!(e && e.readableObjectMode)),
      (this.highWaterMark = e ? Pb(this, e, 'readableHighWaterMark', r) : qb(!1)),
      (this.buffer = new jb()),
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
      (this[Oe] = null),
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
      e && e.encoding && ((this.decoder = new Kl(e.encoding)), (this.encoding = e.encoding));
  }
  function T(e) {
    if (!(this instanceof T)) return new T(e);
    let t = this instanceof oe();
    (this._readableState = new On(e, this, t)),
      e &&
        (typeof e.read == 'function' && (this._read = e.read),
        typeof e.destroy == 'function' && (this._destroy = e.destroy),
        typeof e.construct == 'function' && (this._construct = e.construct),
        e.signal && !t && Ib(e.signal, this)),
      we.call(this, e),
      We.construct(this, () => {
        this._readableState.needReadable && Vt(this, this._readableState);
      });
  }
  T.prototype.destroy = We.destroy;
  T.prototype._undestroy = We.undestroy;
  T.prototype._destroy = function (e, t) {
    t(e);
  };
  T.prototype[vb.captureRejectionSymbol] = function (e) {
    this.destroy(e);
  };
  T.prototype.push = function (e, t) {
    return Jl(this, e, t, !1);
  };
  T.prototype.unshift = function (e, t) {
    return Jl(this, e, t, !0);
  };
  function Jl(e, t, r, n) {
    v('readableAddChunk', t);
    let i = e._readableState,
      o;
    if (
      (i.objectMode ||
        (typeof t == 'string'
          ? ((r = r || i.defaultEncoding),
            i.encoding !== r &&
              (n && i.encoding ? (t = En.from(t, r).toString(i.encoding)) : ((t = En.from(t, r)), (r = ''))))
          : t instanceof En
          ? (r = '')
          : we._isUint8Array(t)
          ? ((t = we._uint8ArrayToBuffer(t)), (r = ''))
          : t != null && (o = new Nb('chunk', ['string', 'Buffer', 'Uint8Array'], t))),
      o)
    )
      Ce(e, o);
    else if (t === null) (i.reading = !1), Vb(e, i);
    else if (i.objectMode || (t && t.length > 0))
      if (n)
        if (i.endEmitted) Ce(e, new Cb());
        else {
          if (i.destroyed || i.errored) return !1;
          An(e, i, t, !0);
        }
      else if (i.ended) Ce(e, new Mb());
      else {
        if (i.destroyed || i.errored) return !1;
        (i.reading = !1),
          i.decoder && !r
            ? ((t = i.decoder.write(t)), i.objectMode || t.length !== 0 ? An(e, i, t, !1) : Vt(e, i))
            : An(e, i, t, !1);
      }
    else n || ((i.reading = !1), Vt(e, i));
    return !i.ended && (i.length < i.highWaterMark || i.length === 0);
  }
  function An(e, t, r, n) {
    t.flowing && t.length === 0 && !t.sync && e.listenerCount('data') > 0
      ? (t.multiAwaitDrain ? t.awaitDrainWriters.clear() : (t.awaitDrainWriters = null),
        (t.dataEmitted = !0),
        e.emit('data', r))
      : ((t.length += t.objectMode ? 1 : r.length),
        n ? t.buffer.unshift(r) : t.buffer.push(r),
        t.needReadable && zt(e)),
      Vt(e, t);
  }
  T.prototype.isPaused = function () {
    let e = this._readableState;
    return e[Oe] === !0 || e.flowing === !1;
  };
  T.prototype.setEncoding = function (e) {
    let t = new Kl(e);
    (this._readableState.decoder = t), (this._readableState.encoding = this._readableState.decoder.encoding);
    let r = this._readableState.buffer,
      n = '';
    for (let i of r) n += t.write(i);
    return r.clear(), n !== '' && r.push(n), (this._readableState.length = n.length), this;
  };
  var Fb = 1073741824;
  function Ub(e) {
    if (e > Fb) throw new $b('size', '<= 1GiB', e);
    return e--, (e |= e >>> 1), (e |= e >>> 2), (e |= e >>> 4), (e |= e >>> 8), (e |= e >>> 16), e++, e;
  }
  function zl(e, t) {
    return e <= 0 || (t.length === 0 && t.ended)
      ? 0
      : t.objectMode
      ? 1
      : Sb(e)
      ? t.flowing && t.length
        ? t.buffer.first().length
        : t.length
      : e <= t.length
      ? e
      : t.ended
      ? t.length
      : 0;
  }
  T.prototype.read = function (e) {
    v('read', e), e === void 0 ? (e = NaN) : _b(e) || (e = Eb(e, 10));
    let t = this._readableState,
      r = e;
    if (
      (e > t.highWaterMark && (t.highWaterMark = Ub(e)),
      e !== 0 && (t.emittedReadable = !1),
      e === 0 && t.needReadable && ((t.highWaterMark !== 0 ? t.length >= t.highWaterMark : t.length > 0) || t.ended))
    )
      return v('read: emitReadable', t.length, t.ended), t.length === 0 && t.ended ? xn(this) : zt(this), null;
    if (((e = zl(e, t)), e === 0 && t.ended)) return t.length === 0 && xn(this), null;
    let n = t.needReadable;
    if (
      (v('need readable', n),
      (t.length === 0 || t.length - e < t.highWaterMark) && ((n = !0), v('length less than watermark', n)),
      t.ended || t.reading || t.destroyed || t.errored || !t.constructed)
    )
      (n = !1), v('reading, ended or constructing', n);
    else if (n) {
      v('do read'), (t.reading = !0), (t.sync = !0), t.length === 0 && (t.needReadable = !0);
      try {
        this._read(t.highWaterMark);
      } catch (o) {
        Ce(this, o);
      }
      (t.sync = !1), t.reading || (e = zl(r, t));
    }
    let i;
    return (
      e > 0 ? (i = ef(e, t)) : (i = null),
      i === null
        ? ((t.needReadable = t.length <= t.highWaterMark), (e = 0))
        : ((t.length -= e), t.multiAwaitDrain ? t.awaitDrainWriters.clear() : (t.awaitDrainWriters = null)),
      t.length === 0 && (t.ended || (t.needReadable = !0), r !== e && t.ended && xn(this)),
      i !== null && !t.errorEmitted && !t.closeEmitted && ((t.dataEmitted = !0), this.emit('data', i)),
      i
    );
  };
  function Vb(e, t) {
    if ((v('onEofChunk'), !t.ended)) {
      if (t.decoder) {
        let r = t.decoder.end();
        r && r.length && (t.buffer.push(r), (t.length += t.objectMode ? 1 : r.length));
      }
      (t.ended = !0), t.sync ? zt(e) : ((t.needReadable = !1), (t.emittedReadable = !0), Yl(e));
    }
  }
  function zt(e) {
    let t = e._readableState;
    v('emitReadable', t.needReadable, t.emittedReadable),
      (t.needReadable = !1),
      t.emittedReadable || (v('emitReadable', t.flowing), (t.emittedReadable = !0), X.nextTick(Yl, e));
  }
  function Yl(e) {
    let t = e._readableState;
    v('emitReadable_', t.destroyed, t.length, t.ended),
      !t.destroyed && !t.errored && (t.length || t.ended) && (e.emit('readable'), (t.emittedReadable = !1)),
      (t.needReadable = !t.flowing && !t.ended && t.length <= t.highWaterMark),
      Ql(e);
  }
  function Vt(e, t) {
    !t.readingMore && t.constructed && ((t.readingMore = !0), X.nextTick(zb, e, t));
  }
  function zb(e, t) {
    for (; !t.reading && !t.ended && (t.length < t.highWaterMark || (t.flowing && t.length === 0)); ) {
      let r = t.length;
      if ((v('maybeReadMore read 0'), e.read(0), r === t.length)) break;
    }
    t.readingMore = !1;
  }
  T.prototype._read = function (e) {
    throw new Db('_read()');
  };
  T.prototype.pipe = function (e, t) {
    let r = this,
      n = this._readableState;
    n.pipes.length === 1 &&
      (n.multiAwaitDrain ||
        ((n.multiAwaitDrain = !0), (n.awaitDrainWriters = new xb(n.awaitDrainWriters ? [n.awaitDrainWriters] : [])))),
      n.pipes.push(e),
      v('pipe count=%d opts=%j', n.pipes.length, t);
    let o = (!t || t.end !== !1) && e !== X.stdout && e !== X.stderr ? f : w;
    n.endEmitted ? X.nextTick(o) : r.once('end', o), e.on('unpipe', s);
    function s(_, y) {
      v('onunpipe'), _ === r && y && y.hasUnpiped === !1 && ((y.hasUnpiped = !0), u());
    }
    function f() {
      v('onend'), e.end();
    }
    let a,
      c = !1;
    function u() {
      v('cleanup'),
        e.removeListener('close', d),
        e.removeListener('finish', g),
        a && e.removeListener('drain', a),
        e.removeListener('error', l),
        e.removeListener('unpipe', s),
        r.removeListener('end', f),
        r.removeListener('end', w),
        r.removeListener('data', p),
        (c = !0),
        a && n.awaitDrainWriters && (!e._writableState || e._writableState.needDrain) && a();
    }
    function h() {
      c ||
        (n.pipes.length === 1 && n.pipes[0] === e
          ? (v('false write response, pause', 0), (n.awaitDrainWriters = e), (n.multiAwaitDrain = !1))
          : n.pipes.length > 1 &&
            n.pipes.includes(e) &&
            (v('false write response, pause', n.awaitDrainWriters.size), n.awaitDrainWriters.add(e)),
        r.pause()),
        a || ((a = Gb(r, e)), e.on('drain', a));
    }
    r.on('data', p);
    function p(_) {
      v('ondata');
      let y = e.write(_);
      v('dest.write', y), y === !1 && h();
    }
    function l(_) {
      if ((v('onerror', _), w(), e.removeListener('error', l), e.listenerCount('error') === 0)) {
        let y = e._writableState || e._readableState;
        y && !y.errorEmitted ? Ce(e, _) : e.emit('error', _);
      }
    }
    Lb(e, 'error', l);
    function d() {
      e.removeListener('finish', g), w();
    }
    e.once('close', d);
    function g() {
      v('onfinish'), e.removeListener('close', d), w();
    }
    e.once('finish', g);
    function w() {
      v('unpipe'), r.unpipe(e);
    }
    return (
      e.emit('pipe', r), e.writableNeedDrain === !0 ? n.flowing && h() : n.flowing || (v('pipe resume'), r.resume()), e
    );
  };
  function Gb(e, t) {
    return function () {
      let n = e._readableState;
      n.awaitDrainWriters === t
        ? (v('pipeOnDrain', 1), (n.awaitDrainWriters = null))
        : n.multiAwaitDrain && (v('pipeOnDrain', n.awaitDrainWriters.size), n.awaitDrainWriters.delete(t)),
        (!n.awaitDrainWriters || n.awaitDrainWriters.size === 0) && e.listenerCount('data') && e.resume();
    };
  }
  T.prototype.unpipe = function (e) {
    let t = this._readableState,
      r = { hasUnpiped: !1 };
    if (t.pipes.length === 0) return this;
    if (!e) {
      let i = t.pipes;
      (t.pipes = []), this.pause();
      for (let o = 0; o < i.length; o++) i[o].emit('unpipe', this, { hasUnpiped: !1 });
      return this;
    }
    let n = mb(t.pipes, e);
    return n === -1
      ? this
      : (t.pipes.splice(n, 1), t.pipes.length === 0 && this.pause(), e.emit('unpipe', this, r), this);
  };
  T.prototype.on = function (e, t) {
    let r = we.prototype.on.call(this, e, t),
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
          v('on readable', n.length, n.reading),
          n.length ? zt(this) : n.reading || X.nextTick(Hb, this)),
      r
    );
  };
  T.prototype.addListener = T.prototype.on;
  T.prototype.removeListener = function (e, t) {
    let r = we.prototype.removeListener.call(this, e, t);
    return e === 'readable' && X.nextTick(Xl, this), r;
  };
  T.prototype.off = T.prototype.removeListener;
  T.prototype.removeAllListeners = function (e) {
    let t = we.prototype.removeAllListeners.apply(this, arguments);
    return (e === 'readable' || e === void 0) && X.nextTick(Xl, this), t;
  };
  function Xl(e) {
    let t = e._readableState;
    (t.readableListening = e.listenerCount('readable') > 0),
      t.resumeScheduled && t[Oe] === !1
        ? (t.flowing = !0)
        : e.listenerCount('data') > 0
        ? e.resume()
        : t.readableListening || (t.flowing = null);
  }
  function Hb(e) {
    v('readable nexttick read 0'), e.read(0);
  }
  T.prototype.resume = function () {
    let e = this._readableState;
    return e.flowing || (v('resume'), (e.flowing = !e.readableListening), Kb(this, e)), (e[Oe] = !1), this;
  };
  function Kb(e, t) {
    t.resumeScheduled || ((t.resumeScheduled = !0), X.nextTick(Jb, e, t));
  }
  function Jb(e, t) {
    v('resume', t.reading),
      t.reading || e.read(0),
      (t.resumeScheduled = !1),
      e.emit('resume'),
      Ql(e),
      t.flowing && !t.reading && e.read(0);
  }
  T.prototype.pause = function () {
    return (
      v('call pause flowing=%j', this._readableState.flowing),
      this._readableState.flowing !== !1 && (v('pause'), (this._readableState.flowing = !1), this.emit('pause')),
      (this._readableState[Oe] = !0),
      this
    );
  };
  function Ql(e) {
    let t = e._readableState;
    for (v('flow', t.flowing); t.flowing && e.read() !== null; );
  }
  T.prototype.wrap = function (e) {
    let t = !1;
    e.on('data', (n) => {
      !this.push(n) && e.pause && ((t = !0), e.pause());
    }),
      e.on('end', () => {
        this.push(null);
      }),
      e.on('error', (n) => {
        Ce(this, n);
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
    let r = Rb(e);
    for (let n = 1; n < r.length; n++) {
      let i = r[n];
      this[i] === void 0 && typeof e[i] == 'function' && (this[i] = e[i].bind(e));
    }
    return this;
  };
  T.prototype[Tb] = function () {
    return Zl(this);
  };
  T.prototype.iterator = function (e) {
    return e !== void 0 && Wb(e, 'options'), Zl(this, e);
  };
  function Zl(e, t) {
    typeof e.read != 'function' && (e = T.wrap(e, { objectMode: !0 }));
    let r = Yb(e, t);
    return (r.stream = e), r;
  }
  async function* Yb(e, t) {
    let r = Rn;
    function n(s) {
      this === e ? (r(), (r = Rn)) : (r = s);
    }
    e.on('readable', n);
    let i,
      o = kb(e, { writable: !1 }, (s) => {
        (i = s ? Vl(i, s) : null), r(), (r = Rn);
      });
    try {
      for (;;) {
        let s = e.destroyed ? null : e.read();
        if (s !== null) yield s;
        else {
          if (i) throw i;
          if (i === null) return;
          await new Ab(n);
        }
      }
    } catch (s) {
      throw ((i = Vl(i, s)), i);
    } finally {
      (i || t?.destroyOnReturn !== !1) && (i === void 0 || e._readableState.autoDestroy)
        ? We.destroyer(e, null)
        : (e.off('readable', n), o());
    }
  }
  Gl(T.prototype, {
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
  Gl(On.prototype, {
    pipesCount: {
      __proto__: null,
      get() {
        return this.pipes.length;
      },
    },
    paused: {
      __proto__: null,
      get() {
        return this[Oe] !== !1;
      },
      set(e) {
        this[Oe] = !!e;
      },
    },
  });
  T._fromList = ef;
  function ef(e, t) {
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
  function xn(e) {
    let t = e._readableState;
    v('endReadable', t.endEmitted), t.endEmitted || ((t.ended = !0), X.nextTick(Xb, t, e));
  }
  function Xb(e, t) {
    if (
      (v('endReadableNT', e.endEmitted, e.length), !e.errored && !e.closeEmitted && !e.endEmitted && e.length === 0)
    ) {
      if (((e.endEmitted = !0), t.emit('end'), t.writable && t.allowHalfOpen === !1)) X.nextTick(Qb, t);
      else if (e.autoDestroy) {
        let r = t._writableState;
        (!r || (r.autoDestroy && (r.finished || r.writable === !1))) && t.destroy();
      }
    }
  }
  function Qb(e) {
    e.writable && !e.writableEnded && !e.destroyed && e.end();
  }
  T.from = function (e, t) {
    return Bb(T, e, t);
  };
  var Tn;
  function tf() {
    return Tn === void 0 && (Tn = {}), Tn;
  }
  T.fromWeb = function (e, t) {
    return tf().newStreamReadableFromReadableStream(e, t);
  };
  T.toWeb = function (e, t) {
    return tf().newReadableStreamFromStreamReadable(e, t);
  };
  T.wrap = function (e, t) {
    var r, n;
    return new T({
      objectMode:
        (r = (n = e.readableObjectMode) !== null && n !== void 0 ? n : e.objectMode) !== null && r !== void 0 ? r : !0,
      ...t,
      destroy(i, o) {
        We.destroyer(e, i), o(i);
      },
    }).wrap(e);
  };
});
var qn = S((Zm, yf) => {
  var ve = be(),
    {
      ArrayPrototypeSlice: sf,
      Error: Zb,
      FunctionPrototypeSymbolHasInstance: lf,
      ObjectDefineProperty: ff,
      ObjectDefineProperties: eg,
      ObjectSetPrototypeOf: uf,
      StringPrototypeToLowerCase: tg,
      Symbol: rg,
      SymbolHasInstance: ng,
    } = $();
  yf.exports = j;
  j.WritableState = it;
  var { EventEmitter: ig } = require('events'),
    rt = Wt().Stream,
    { Buffer: Gt } = require('buffer'),
    Jt = Te(),
    { addAbortSignal: og } = et(),
    { getHighWaterMark: sg, getDefaultHighWaterMark: lg } = Ut(),
    {
      ERR_INVALID_ARG_TYPE: fg,
      ERR_METHOD_NOT_IMPLEMENTED: ug,
      ERR_MULTIPLE_CALLBACK: af,
      ERR_STREAM_CANNOT_PIPE: ag,
      ERR_STREAM_DESTROYED: nt,
      ERR_STREAM_ALREADY_FINISHED: cg,
      ERR_STREAM_NULL_VALUES: dg,
      ERR_STREAM_WRITE_AFTER_END: hg,
      ERR_UNKNOWN_ENCODING: cf,
    } = B().codes,
    { errorOrDestroy: Be } = Jt;
  uf(j.prototype, rt.prototype);
  uf(j, rt);
  function In() {}
  var Fe = rg('kOnFinished');
  function it(e, t, r) {
    typeof r != 'boolean' && (r = t instanceof oe()),
      (this.objectMode = !!(e && e.objectMode)),
      r && (this.objectMode = this.objectMode || !!(e && e.writableObjectMode)),
      (this.highWaterMark = e ? sg(this, e, 'writableHighWaterMark', r) : lg(!1)),
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
      (this.onwrite = yg.bind(void 0, t)),
      (this.writecb = null),
      (this.writelen = 0),
      (this.afterWriteTickInfo = null),
      Kt(this),
      (this.pendingcb = 0),
      (this.constructed = !0),
      (this.prefinished = !1),
      (this.errorEmitted = !1),
      (this.emitClose = !e || e.emitClose !== !1),
      (this.autoDestroy = !e || e.autoDestroy !== !1),
      (this.errored = null),
      (this.closed = !1),
      (this.closeEmitted = !1),
      (this[Fe] = []);
  }
  function Kt(e) {
    (e.buffered = []), (e.bufferedIndex = 0), (e.allBuffers = !0), (e.allNoop = !0);
  }
  it.prototype.getBuffer = function () {
    return sf(this.buffered, this.bufferedIndex);
  };
  ff(it.prototype, 'bufferedRequestCount', {
    __proto__: null,
    get() {
      return this.buffered.length - this.bufferedIndex;
    },
  });
  function j(e) {
    let t = this instanceof oe();
    if (!t && !lf(j, this)) return new j(e);
    (this._writableState = new it(e, this, t)),
      e &&
        (typeof e.write == 'function' && (this._write = e.write),
        typeof e.writev == 'function' && (this._writev = e.writev),
        typeof e.destroy == 'function' && (this._destroy = e.destroy),
        typeof e.final == 'function' && (this._final = e.final),
        typeof e.construct == 'function' && (this._construct = e.construct),
        e.signal && og(e.signal, this)),
      rt.call(this, e),
      Jt.construct(this, () => {
        let r = this._writableState;
        r.writing || jn(this, r), Pn(this, r);
      });
  }
  ff(j, ng, {
    __proto__: null,
    value: function (e) {
      return lf(this, e) ? !0 : this !== j ? !1 : e && e._writableState instanceof it;
    },
  });
  j.prototype.pipe = function () {
    Be(this, new ag());
  };
  function df(e, t, r, n) {
    let i = e._writableState;
    if (typeof r == 'function') (n = r), (r = i.defaultEncoding);
    else {
      if (!r) r = i.defaultEncoding;
      else if (r !== 'buffer' && !Gt.isEncoding(r)) throw new cf(r);
      typeof n != 'function' && (n = In);
    }
    if (t === null) throw new dg();
    if (!i.objectMode)
      if (typeof t == 'string') i.decodeStrings !== !1 && ((t = Gt.from(t, r)), (r = 'buffer'));
      else if (t instanceof Gt) r = 'buffer';
      else if (rt._isUint8Array(t)) (t = rt._uint8ArrayToBuffer(t)), (r = 'buffer');
      else throw new fg('chunk', ['string', 'Buffer', 'Uint8Array'], t);
    let o;
    return (
      i.ending ? (o = new hg()) : i.destroyed && (o = new nt('write')),
      o ? (ve.nextTick(n, o), Be(e, o, !0), o) : (i.pendingcb++, pg(e, i, t, r, n))
    );
  }
  j.prototype.write = function (e, t, r) {
    return df(this, e, t, r) === !0;
  };
  j.prototype.cork = function () {
    this._writableState.corked++;
  };
  j.prototype.uncork = function () {
    let e = this._writableState;
    e.corked && (e.corked--, e.writing || jn(this, e));
  };
  j.prototype.setDefaultEncoding = function (t) {
    if ((typeof t == 'string' && (t = tg(t)), !Gt.isEncoding(t))) throw new cf(t);
    return (this._writableState.defaultEncoding = t), this;
  };
  function pg(e, t, r, n, i) {
    let o = t.objectMode ? 1 : r.length;
    t.length += o;
    let s = t.length < t.highWaterMark;
    return (
      s || (t.needDrain = !0),
      t.writing || t.corked || t.errored || !t.constructed
        ? (t.buffered.push({ chunk: r, encoding: n, callback: i }),
          t.allBuffers && n !== 'buffer' && (t.allBuffers = !1),
          t.allNoop && i !== In && (t.allNoop = !1))
        : ((t.writelen = o),
          (t.writecb = i),
          (t.writing = !0),
          (t.sync = !0),
          e._write(r, n, t.onwrite),
          (t.sync = !1)),
      s && !t.errored && !t.destroyed
    );
  }
  function nf(e, t, r, n, i, o, s) {
    (t.writelen = n),
      (t.writecb = s),
      (t.writing = !0),
      (t.sync = !0),
      t.destroyed ? t.onwrite(new nt('write')) : r ? e._writev(i, t.onwrite) : e._write(i, o, t.onwrite),
      (t.sync = !1);
  }
  function of(e, t, r, n) {
    --t.pendingcb, n(r), kn(t), Be(e, r);
  }
  function yg(e, t) {
    let r = e._writableState,
      n = r.sync,
      i = r.writecb;
    if (typeof i != 'function') {
      Be(e, new af());
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
          n ? ve.nextTick(of, e, r, t, i) : of(e, r, t, i))
        : (r.buffered.length > r.bufferedIndex && jn(e, r),
          n
            ? r.afterWriteTickInfo !== null && r.afterWriteTickInfo.cb === i
              ? r.afterWriteTickInfo.count++
              : ((r.afterWriteTickInfo = { count: 1, cb: i, stream: e, state: r }),
                ve.nextTick(bg, r.afterWriteTickInfo))
            : hf(e, r, 1, i));
  }
  function bg({ stream: e, state: t, count: r, cb: n }) {
    return (t.afterWriteTickInfo = null), hf(e, t, r, n);
  }
  function hf(e, t, r, n) {
    for (!t.ending && !e.destroyed && t.length === 0 && t.needDrain && ((t.needDrain = !1), e.emit('drain')); r-- > 0; )
      t.pendingcb--, n();
    t.destroyed && kn(t), Pn(e, t);
  }
  function kn(e) {
    if (e.writing) return;
    for (let i = e.bufferedIndex; i < e.buffered.length; ++i) {
      var t;
      let { chunk: o, callback: s } = e.buffered[i],
        f = e.objectMode ? 1 : o.length;
      (e.length -= f), s((t = e.errored) !== null && t !== void 0 ? t : new nt('write'));
    }
    let r = e[Fe].splice(0);
    for (let i = 0; i < r.length; i++) {
      var n;
      r[i]((n = e.errored) !== null && n !== void 0 ? n : new nt('end'));
    }
    Kt(e);
  }
  function jn(e, t) {
    if (t.corked || t.bufferProcessing || t.destroyed || !t.constructed) return;
    let { buffered: r, bufferedIndex: n, objectMode: i } = t,
      o = r.length - n;
    if (!o) return;
    let s = n;
    if (((t.bufferProcessing = !0), o > 1 && e._writev)) {
      t.pendingcb -= o - 1;
      let f = t.allNoop
          ? In
          : (c) => {
              for (let u = s; u < r.length; ++u) r[u].callback(c);
            },
        a = t.allNoop && s === 0 ? r : sf(r, s);
      (a.allBuffers = t.allBuffers), nf(e, t, !0, t.length, a, '', f), Kt(t);
    } else {
      do {
        let { chunk: f, encoding: a, callback: c } = r[s];
        r[s++] = null;
        let u = i ? 1 : f.length;
        nf(e, t, !1, u, f, a, c);
      } while (s < r.length && !t.writing);
      s === r.length ? Kt(t) : s > 256 ? (r.splice(0, s), (t.bufferedIndex = 0)) : (t.bufferedIndex = s);
    }
    t.bufferProcessing = !1;
  }
  j.prototype._write = function (e, t, r) {
    if (this._writev) this._writev([{ chunk: e, encoding: t }], r);
    else throw new ug('_write()');
  };
  j.prototype._writev = null;
  j.prototype.end = function (e, t, r) {
    let n = this._writableState;
    typeof e == 'function' ? ((r = e), (e = null), (t = null)) : typeof t == 'function' && ((r = t), (t = null));
    let i;
    if (e != null) {
      let o = df(this, e, t);
      o instanceof Zb && (i = o);
    }
    return (
      n.corked && ((n.corked = 1), this.uncork()),
      i ||
        (!n.errored && !n.ending
          ? ((n.ending = !0), Pn(this, n, !0), (n.ended = !0))
          : n.finished
          ? (i = new cg('end'))
          : n.destroyed && (i = new nt('end'))),
      typeof r == 'function' && (i || n.finished ? ve.nextTick(r, i) : n[Fe].push(r)),
      this
    );
  };
  function Ht(e) {
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
  function gg(e, t) {
    let r = !1;
    function n(i) {
      if (r) {
        Be(e, i ?? af());
        return;
      }
      if (((r = !0), t.pendingcb--, i)) {
        let o = t[Fe].splice(0);
        for (let s = 0; s < o.length; s++) o[s](i);
        Be(e, i, t.sync);
      } else Ht(t) && ((t.prefinished = !0), e.emit('prefinish'), t.pendingcb++, ve.nextTick(Ln, e, t));
    }
    (t.sync = !0), t.pendingcb++;
    try {
      e._final(n);
    } catch (i) {
      n(i);
    }
    t.sync = !1;
  }
  function wg(e, t) {
    !t.prefinished &&
      !t.finalCalled &&
      (typeof e._final == 'function' && !t.destroyed
        ? ((t.finalCalled = !0), gg(e, t))
        : ((t.prefinished = !0), e.emit('prefinish')));
  }
  function Pn(e, t, r) {
    Ht(t) &&
      (wg(e, t),
      t.pendingcb === 0 &&
        (r
          ? (t.pendingcb++,
            ve.nextTick(
              (n, i) => {
                Ht(i) ? Ln(n, i) : i.pendingcb--;
              },
              e,
              t
            ))
          : Ht(t) && (t.pendingcb++, Ln(e, t))));
  }
  function Ln(e, t) {
    t.pendingcb--, (t.finished = !0);
    let r = t[Fe].splice(0);
    for (let n = 0; n < r.length; n++) r[n]();
    if ((e.emit('finish'), t.autoDestroy)) {
      let n = e._readableState;
      (!n || (n.autoDestroy && (n.endEmitted || n.readable === !1))) && e.destroy();
    }
  }
  eg(j.prototype, {
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
  var mg = Jt.destroy;
  j.prototype.destroy = function (e, t) {
    let r = this._writableState;
    return (
      !r.destroyed && (r.bufferedIndex < r.buffered.length || r[Fe].length) && ve.nextTick(kn, r),
      mg.call(this, e, t),
      this
    );
  };
  j.prototype._undestroy = Jt.undestroy;
  j.prototype._destroy = function (e, t) {
    t(e);
  };
  j.prototype[ig.captureRejectionSymbol] = function (e) {
    this.destroy(e);
  };
  var vn;
  function pf() {
    return vn === void 0 && (vn = {}), vn;
  }
  j.fromWeb = function (e, t) {
    return pf().newStreamWritableFromWritableStream(e, t);
  };
  j.toWeb = function (e) {
    return pf().newWritableStreamFromStreamWritable(e);
  };
});
var Of = S((e_, Tf) => {
  var Nn = be(),
    _g = require('buffer'),
    {
      isReadable: Sg,
      isWritable: Eg,
      isIterable: bf,
      isNodeStream: Rg,
      isReadableNodeStream: gf,
      isWritableNodeStream: wf,
      isDuplexNodeStream: Ag,
    } = ne(),
    mf = le(),
    {
      AbortError: xf,
      codes: { ERR_INVALID_ARG_TYPE: xg, ERR_INVALID_RETURN_VALUE: _f },
    } = B(),
    { destroyer: Ue } = Te(),
    Tg = oe(),
    Og = tt(),
    { createDeferredPromise: Sf } = te(),
    Ef = Sn(),
    Rf = globalThis.Blob || _g.Blob,
    vg =
      typeof Rf < 'u'
        ? function (t) {
            return t instanceof Rf;
          }
        : function (t) {
            return !1;
          },
    Lg = globalThis.AbortController || kt().AbortController,
    { FunctionPrototypeCall: Af } = $(),
    Le = class extends Tg {
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
  Tf.exports = function e(t, r) {
    if (Ag(t)) return t;
    if (gf(t)) return Yt({ readable: t });
    if (wf(t)) return Yt({ writable: t });
    if (Rg(t)) return Yt({ writable: !1, readable: !1 });
    if (typeof t == 'function') {
      let { value: i, write: o, final: s, destroy: f } = Ig(t);
      if (bf(i)) return Ef(Le, i, { objectMode: !0, write: o, final: s, destroy: f });
      let a = i?.then;
      if (typeof a == 'function') {
        let c,
          u = Af(
            a,
            i,
            (h) => {
              if (h != null) throw new _f('nully', 'body', h);
            },
            (h) => {
              Ue(c, h);
            }
          );
        return (c = new Le({
          objectMode: !0,
          readable: !1,
          write: o,
          final(h) {
            s(async () => {
              try {
                await u, Nn.nextTick(h, null);
              } catch (p) {
                Nn.nextTick(h, p);
              }
            });
          },
          destroy: f,
        }));
      }
      throw new _f('Iterable, AsyncIterable or AsyncFunction', r, i);
    }
    if (vg(t)) return e(t.arrayBuffer());
    if (bf(t)) return Ef(Le, t, { objectMode: !0, writable: !1 });
    if (typeof t?.writable == 'object' || typeof t?.readable == 'object') {
      let i = t != null && t.readable ? (gf(t?.readable) ? t?.readable : e(t.readable)) : void 0,
        o = t != null && t.writable ? (wf(t?.writable) ? t?.writable : e(t.writable)) : void 0;
      return Yt({ readable: i, writable: o });
    }
    let n = t?.then;
    if (typeof n == 'function') {
      let i;
      return (
        Af(
          n,
          t,
          (o) => {
            o != null && i.push(o), i.push(null);
          },
          (o) => {
            Ue(i, o);
          }
        ),
        (i = new Le({ objectMode: !0, writable: !1, read() {} }))
      );
    }
    throw new xg(
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
  function Ig(e) {
    let { promise: t, resolve: r } = Sf(),
      n = new Lg(),
      i = n.signal;
    return {
      value: e(
        (async function* () {
          for (;;) {
            let s = t;
            t = null;
            let { chunk: f, done: a, cb: c } = await s;
            if ((Nn.nextTick(c), a)) return;
            if (i.aborted) throw new xf(void 0, { cause: i.reason });
            ({ promise: t, resolve: r } = Sf()), yield f;
          }
        })(),
        { signal: i }
      ),
      write(s, f, a) {
        let c = r;
        (r = null), c({ chunk: s, done: !1, cb: a });
      },
      final(s) {
        let f = r;
        (r = null), f({ done: !0, cb: s });
      },
      destroy(s, f) {
        n.abort(), f(s);
      },
    };
  }
  function Yt(e) {
    let t = e.readable && typeof e.readable.read != 'function' ? Og.wrap(e.readable) : e.readable,
      r = e.writable,
      n = !!Sg(t),
      i = !!Eg(r),
      o,
      s,
      f,
      a,
      c;
    function u(h) {
      let p = a;
      (a = null), p ? p(h) : h && c.destroy(h);
    }
    return (
      (c = new Le({
        readableObjectMode: !!(t != null && t.readableObjectMode),
        writableObjectMode: !!(r != null && r.writableObjectMode),
        readable: n,
        writable: i,
      })),
      i &&
        (mf(r, (h) => {
          (i = !1), h && Ue(t, h), u(h);
        }),
        (c._write = function (h, p, l) {
          r.write(h, p) ? l() : (o = l);
        }),
        (c._final = function (h) {
          r.end(), (s = h);
        }),
        r.on('drain', function () {
          if (o) {
            let h = o;
            (o = null), h();
          }
        }),
        r.on('finish', function () {
          if (s) {
            let h = s;
            (s = null), h();
          }
        })),
      n &&
        (mf(t, (h) => {
          (n = !1), h && Ue(t, h), u(h);
        }),
        t.on('readable', function () {
          if (f) {
            let h = f;
            (f = null), h();
          }
        }),
        t.on('end', function () {
          c.push(null);
        }),
        (c._read = function () {
          for (;;) {
            let h = t.read();
            if (h === null) {
              f = c._read;
              return;
            }
            if (!c.push(h)) return;
          }
        })),
      (c._destroy = function (h, p) {
        !h && a !== null && (h = new xf()),
          (f = null),
          (o = null),
          (s = null),
          a === null ? p(h) : ((a = p), Ue(r, h), Ue(t, h));
      }),
      c
    );
  }
});
var oe = S((t_, If) => {
  'use strict';
  var {
    ObjectDefineProperties: kg,
    ObjectGetOwnPropertyDescriptor: fe,
    ObjectKeys: jg,
    ObjectSetPrototypeOf: vf,
  } = $();
  If.exports = Q;
  var Mn = tt(),
    H = qn();
  vf(Q.prototype, Mn.prototype);
  vf(Q, Mn);
  {
    let e = jg(H.prototype);
    for (let t = 0; t < e.length; t++) {
      let r = e[t];
      Q.prototype[r] || (Q.prototype[r] = H.prototype[r]);
    }
  }
  function Q(e) {
    if (!(this instanceof Q)) return new Q(e);
    Mn.call(this, e),
      H.call(this, e),
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
  kg(Q.prototype, {
    writable: { __proto__: null, ...fe(H.prototype, 'writable') },
    writableHighWaterMark: { __proto__: null, ...fe(H.prototype, 'writableHighWaterMark') },
    writableObjectMode: { __proto__: null, ...fe(H.prototype, 'writableObjectMode') },
    writableBuffer: { __proto__: null, ...fe(H.prototype, 'writableBuffer') },
    writableLength: { __proto__: null, ...fe(H.prototype, 'writableLength') },
    writableFinished: { __proto__: null, ...fe(H.prototype, 'writableFinished') },
    writableCorked: { __proto__: null, ...fe(H.prototype, 'writableCorked') },
    writableEnded: { __proto__: null, ...fe(H.prototype, 'writableEnded') },
    writableNeedDrain: { __proto__: null, ...fe(H.prototype, 'writableNeedDrain') },
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
  var Dn;
  function Lf() {
    return Dn === void 0 && (Dn = {}), Dn;
  }
  Q.fromWeb = function (e, t) {
    return Lf().newStreamDuplexFromReadableWritablePair(e, t);
  };
  Q.toWeb = function (e) {
    return Lf().newReadableWritablePairFromDuplex(e);
  };
  var $n;
  Q.from = function (e) {
    return $n || ($n = Of()), $n(e, 'body');
  };
});
var Bn = S((r_, jf) => {
  'use strict';
  var { ObjectSetPrototypeOf: kf, Symbol: Pg } = $();
  jf.exports = ue;
  var { ERR_METHOD_NOT_IMPLEMENTED: qg } = B().codes,
    Wn = oe(),
    { getHighWaterMark: Ng } = Ut();
  kf(ue.prototype, Wn.prototype);
  kf(ue, Wn);
  var ot = Pg('kCallback');
  function ue(e) {
    if (!(this instanceof ue)) return new ue(e);
    let t = e ? Ng(this, e, 'readableHighWaterMark', !0) : null;
    t === 0 &&
      (e = {
        ...e,
        highWaterMark: null,
        readableHighWaterMark: t,
        writableHighWaterMark: e.writableHighWaterMark || 0,
      }),
      Wn.call(this, e),
      (this._readableState.sync = !1),
      (this[ot] = null),
      e &&
        (typeof e.transform == 'function' && (this._transform = e.transform),
        typeof e.flush == 'function' && (this._flush = e.flush)),
      this.on('prefinish', Dg);
  }
  function Cn(e) {
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
  function Dg() {
    this._final !== Cn && Cn.call(this);
  }
  ue.prototype._final = Cn;
  ue.prototype._transform = function (e, t, r) {
    throw new qg('_transform()');
  };
  ue.prototype._write = function (e, t, r) {
    let n = this._readableState,
      i = this._writableState,
      o = n.length;
    this._transform(e, t, (s, f) => {
      if (s) {
        r(s);
        return;
      }
      f != null && this.push(f), i.ended || o === n.length || n.length < n.highWaterMark ? r() : (this[ot] = r);
    });
  };
  ue.prototype._read = function () {
    if (this[ot]) {
      let e = this[ot];
      (this[ot] = null), e();
    }
  };
});
var Un = S((n_, qf) => {
  'use strict';
  var { ObjectSetPrototypeOf: Pf } = $();
  qf.exports = Ve;
  var Fn = Bn();
  Pf(Ve.prototype, Fn.prototype);
  Pf(Ve, Fn);
  function Ve(e) {
    if (!(this instanceof Ve)) return new Ve(e);
    Fn.call(this, e);
  }
  Ve.prototype._transform = function (e, t, r) {
    r(null, e);
  };
});
var er = S((i_, Cf) => {
  var st = be(),
    { ArrayIsArray: $g, Promise: Mg, SymbolAsyncIterator: Cg } = $(),
    Zt = le(),
    { once: Wg } = te(),
    Bg = Te(),
    Nf = oe(),
    {
      aggregateTwoErrors: Fg,
      codes: {
        ERR_INVALID_ARG_TYPE: Xn,
        ERR_INVALID_RETURN_VALUE: Vn,
        ERR_MISSING_ARGS: Ug,
        ERR_STREAM_DESTROYED: Vg,
        ERR_STREAM_PREMATURE_CLOSE: zg,
      },
      AbortError: Gg,
    } = B(),
    { validateFunction: Hg, validateAbortSignal: Kg } = Ze(),
    {
      isIterable: Ie,
      isReadable: zn,
      isReadableNodeStream: Qt,
      isNodeStream: Df,
      isTransformStream: ze,
      isWebStream: Jg,
      isReadableStream: Gn,
      isReadableEnded: Yg,
    } = ne(),
    Xg = globalThis.AbortController || kt().AbortController,
    Hn,
    Kn;
  function $f(e, t, r) {
    let n = !1;
    e.on('close', () => {
      n = !0;
    });
    let i = Zt(e, { readable: t, writable: r }, (o) => {
      n = !o;
    });
    return {
      destroy: (o) => {
        n || ((n = !0), Bg.destroyer(e, o || new Vg('pipe')));
      },
      cleanup: i,
    };
  }
  function Qg(e) {
    return Hg(e[e.length - 1], 'streams[stream.length - 1]'), e.pop();
  }
  function Jn(e) {
    if (Ie(e)) return e;
    if (Qt(e)) return Zg(e);
    throw new Xn('val', ['Readable', 'Iterable', 'AsyncIterable'], e);
  }
  async function* Zg(e) {
    Kn || (Kn = tt()), yield* Kn.prototype[Cg].call(e);
  }
  async function Xt(e, t, r, { end: n }) {
    let i,
      o = null,
      s = (c) => {
        if ((c && (i = c), o)) {
          let u = o;
          (o = null), u();
        }
      },
      f = () =>
        new Mg((c, u) => {
          i
            ? u(i)
            : (o = () => {
                i ? u(i) : c();
              });
        });
    t.on('drain', s);
    let a = Zt(t, { readable: !1 }, s);
    try {
      t.writableNeedDrain && (await f());
      for await (let c of e) t.write(c) || (await f());
      n && t.end(), await f(), r();
    } catch (c) {
      r(i !== c ? Fg(i, c) : c);
    } finally {
      a(), t.off('drain', s);
    }
  }
  async function Yn(e, t, r, { end: n }) {
    ze(t) && (t = t.writable);
    let i = t.getWriter();
    try {
      for await (let o of e) await i.ready, i.write(o).catch(() => {});
      await i.ready, n && (await i.close()), r();
    } catch (o) {
      try {
        await i.abort(o), r(o);
      } catch (s) {
        r(s);
      }
    }
  }
  function ew(...e) {
    return Mf(e, Wg(Qg(e)));
  }
  function Mf(e, t, r) {
    if ((e.length === 1 && $g(e[0]) && (e = e[0]), e.length < 2)) throw new Ug('streams');
    let n = new Xg(),
      i = n.signal,
      o = r?.signal,
      s = [];
    Kg(o, 'options.signal');
    function f() {
      l(new Gg());
    }
    o?.addEventListener('abort', f);
    let a,
      c,
      u = [],
      h = 0;
    function p(y) {
      l(y, --h === 0);
    }
    function l(y, m) {
      if ((y && (!a || a.code === 'ERR_STREAM_PREMATURE_CLOSE') && (a = y), !(!a && !m))) {
        for (; u.length; ) u.shift()(a);
        o?.removeEventListener('abort', f), n.abort(), m && (a || s.forEach((E) => E()), st.nextTick(t, a, c));
      }
    }
    let d;
    for (let y = 0; y < e.length; y++) {
      let m = e[y],
        E = y < e.length - 1,
        R = y > 0,
        x = E || r?.end !== !1,
        L = y === e.length - 1;
      if (Df(m)) {
        let A = function (I) {
          I && I.name !== 'AbortError' && I.code !== 'ERR_STREAM_PREMATURE_CLOSE' && p(I);
        };
        var _ = A;
        if (x) {
          let { destroy: I, cleanup: C } = $f(m, E, R);
          u.push(I), zn(m) && L && s.push(C);
        }
        m.on('error', A),
          zn(m) &&
            L &&
            s.push(() => {
              m.removeListener('error', A);
            });
      }
      if (y === 0)
        if (typeof m == 'function') {
          if (((d = m({ signal: i })), !Ie(d))) throw new Vn('Iterable, AsyncIterable or Stream', 'source', d);
        } else Ie(m) || Qt(m) || ze(m) ? (d = m) : (d = Nf.from(m));
      else if (typeof m == 'function') {
        if (ze(d)) {
          var g;
          d = Jn((g = d) === null || g === void 0 ? void 0 : g.readable);
        } else d = Jn(d);
        if (((d = m(d, { signal: i })), E)) {
          if (!Ie(d, !0)) throw new Vn('AsyncIterable', `transform[${y - 1}]`, d);
        } else {
          var w;
          Hn || (Hn = Un());
          let A = new Hn({ objectMode: !0 }),
            I = (w = d) === null || w === void 0 ? void 0 : w.then;
          if (typeof I == 'function')
            h++,
              I.call(
                d,
                (P) => {
                  (c = P), P != null && A.write(P), x && A.end(), st.nextTick(p);
                },
                (P) => {
                  A.destroy(P), st.nextTick(p, P);
                }
              );
          else if (Ie(d, !0)) h++, Xt(d, A, p, { end: x });
          else if (Gn(d) || ze(d)) {
            let P = d.readable || d;
            h++, Xt(P, A, p, { end: x });
          } else throw new Vn('AsyncIterable or Promise', 'destination', d);
          d = A;
          let { destroy: C, cleanup: D } = $f(d, !1, !0);
          u.push(C), L && s.push(D);
        }
      } else if (Df(m)) {
        if (Qt(d)) {
          h += 2;
          let A = tw(d, m, p, { end: x });
          zn(m) && L && s.push(A);
        } else if (ze(d) || Gn(d)) {
          let A = d.readable || d;
          h++, Xt(A, m, p, { end: x });
        } else if (Ie(d)) h++, Xt(d, m, p, { end: x });
        else throw new Xn('val', ['Readable', 'Iterable', 'AsyncIterable', 'ReadableStream', 'TransformStream'], d);
        d = m;
      } else if (Jg(m)) {
        if (Qt(d)) h++, Yn(Jn(d), m, p, { end: x });
        else if (Gn(d) || Ie(d)) h++, Yn(d, m, p, { end: x });
        else if (ze(d)) h++, Yn(d.readable, m, p, { end: x });
        else throw new Xn('val', ['Readable', 'Iterable', 'AsyncIterable', 'ReadableStream', 'TransformStream'], d);
        d = m;
      } else d = Nf.from(m);
    }
    return ((i != null && i.aborted) || (o != null && o.aborted)) && st.nextTick(f), d;
  }
  function tw(e, t, r, { end: n }) {
    let i = !1;
    if (
      (t.on('close', () => {
        i || r(new zg());
      }),
      e.pipe(t, { end: !1 }),
      n)
    ) {
      let s = function () {
        (i = !0), t.end();
      };
      var o = s;
      Yg(e) ? st.nextTick(s) : e.once('end', s);
    } else r();
    return (
      Zt(e, { readable: !0, writable: !1 }, (s) => {
        let f = e._readableState;
        s && s.code === 'ERR_STREAM_PREMATURE_CLOSE' && f && f.ended && !f.errored && !f.errorEmitted
          ? e.once('end', r).once('error', r)
          : r(s);
      }),
      Zt(t, { readable: !1, writable: !0 }, r)
    );
  }
  Cf.exports = { pipelineImpl: Mf, pipeline: ew };
});
var Zn = S((o_, zf) => {
  'use strict';
  var { pipeline: rw } = er(),
    tr = oe(),
    { destroyer: nw } = Te(),
    {
      isNodeStream: rr,
      isReadable: Wf,
      isWritable: Bf,
      isWebStream: Qn,
      isTransformStream: ke,
      isWritableStream: Ff,
      isReadableStream: Uf,
    } = ne(),
    {
      AbortError: iw,
      codes: { ERR_INVALID_ARG_VALUE: Vf, ERR_MISSING_ARGS: ow },
    } = B(),
    sw = le();
  zf.exports = function (...t) {
    if (t.length === 0) throw new ow('streams');
    if (t.length === 1) return tr.from(t[0]);
    let r = [...t];
    if ((typeof t[0] == 'function' && (t[0] = tr.from(t[0])), typeof t[t.length - 1] == 'function')) {
      let l = t.length - 1;
      t[l] = tr.from(t[l]);
    }
    for (let l = 0; l < t.length; ++l)
      if (!(!rr(t[l]) && !Qn(t[l]))) {
        if (l < t.length - 1 && !(Wf(t[l]) || Uf(t[l]) || ke(t[l])))
          throw new Vf(`streams[${l}]`, r[l], 'must be readable');
        if (l > 0 && !(Bf(t[l]) || Ff(t[l]) || ke(t[l]))) throw new Vf(`streams[${l}]`, r[l], 'must be writable');
      }
    let n, i, o, s, f;
    function a(l) {
      let d = s;
      (s = null), d ? d(l) : l ? f.destroy(l) : !p && !h && f.destroy();
    }
    let c = t[0],
      u = rw(t, a),
      h = !!(Bf(c) || Ff(c) || ke(c)),
      p = !!(Wf(u) || Uf(u) || ke(u));
    if (
      ((f = new tr({
        writableObjectMode: !!(c != null && c.writableObjectMode),
        readableObjectMode: !!(u != null && u.writableObjectMode),
        writable: h,
        readable: p,
      })),
      h)
    ) {
      if (rr(c))
        (f._write = function (d, g, w) {
          c.write(d, g) ? w() : (n = w);
        }),
          (f._final = function (d) {
            c.end(), (i = d);
          }),
          c.on('drain', function () {
            if (n) {
              let d = n;
              (n = null), d();
            }
          });
      else if (Qn(c)) {
        let g = (ke(c) ? c.writable : c).getWriter();
        (f._write = async function (w, _, y) {
          try {
            await g.ready, g.write(w).catch(() => {}), y();
          } catch (m) {
            y(m);
          }
        }),
          (f._final = async function (w) {
            try {
              await g.ready, g.close().catch(() => {}), (i = w);
            } catch (_) {
              w(_);
            }
          });
      }
      let l = ke(u) ? u.readable : u;
      sw(l, () => {
        if (i) {
          let d = i;
          (i = null), d();
        }
      });
    }
    if (p) {
      if (rr(u))
        u.on('readable', function () {
          if (o) {
            let l = o;
            (o = null), l();
          }
        }),
          u.on('end', function () {
            f.push(null);
          }),
          (f._read = function () {
            for (;;) {
              let l = u.read();
              if (l === null) {
                o = f._read;
                return;
              }
              if (!f.push(l)) return;
            }
          });
      else if (Qn(u)) {
        let d = (ke(u) ? u.readable : u).getReader();
        f._read = async function () {
          for (;;)
            try {
              let { value: g, done: w } = await d.read();
              if (!f.push(g)) return;
              if (w) {
                f.push(null);
                return;
              }
            } catch {
              return;
            }
        };
      }
    }
    return (
      (f._destroy = function (l, d) {
        !l && s !== null && (l = new iw()),
          (o = null),
          (n = null),
          (i = null),
          s === null ? d(l) : ((s = d), rr(u) && nw(u, l));
      }),
      f
    );
  };
});
var Zf = S((s_, ri) => {
  'use strict';
  var Jf = globalThis.AbortController || kt().AbortController,
    {
      codes: { ERR_INVALID_ARG_VALUE: lw, ERR_INVALID_ARG_TYPE: lt, ERR_MISSING_ARGS: fw, ERR_OUT_OF_RANGE: uw },
      AbortError: se,
    } = B(),
    { validateAbortSignal: je, validateInteger: aw, validateObject: Pe } = Ze(),
    cw = $().Symbol('kWeak'),
    { finished: dw } = le(),
    hw = Zn(),
    { addAbortSignalNoValidate: pw } = et(),
    { isWritable: yw, isNodeStream: bw } = ne(),
    {
      ArrayPrototypePush: gw,
      MathFloor: ww,
      Number: mw,
      NumberIsNaN: _w,
      Promise: Gf,
      PromiseReject: Hf,
      PromisePrototypeThen: Sw,
      Symbol: Yf,
    } = $(),
    nr = Yf('kEmpty'),
    Kf = Yf('kEof');
  function Ew(e, t) {
    if ((t != null && Pe(t, 'options'), t?.signal != null && je(t.signal, 'options.signal'), bw(e) && !yw(e)))
      throw new lw('stream', e, 'must be writable');
    let r = hw(this, e);
    return t != null && t.signal && pw(t.signal, r), r;
  }
  function ir(e, t) {
    if (typeof e != 'function') throw new lt('fn', ['Function', 'AsyncFunction'], e);
    t != null && Pe(t, 'options'), t?.signal != null && je(t.signal, 'options.signal');
    let r = 1;
    return (
      t?.concurrency != null && (r = ww(t.concurrency)),
      aw(r, 'concurrency', 1),
      async function* () {
        var i, o;
        let s = new Jf(),
          f = this,
          a = [],
          c = s.signal,
          u = { signal: c },
          h = () => s.abort();
        t != null && (i = t.signal) !== null && i !== void 0 && i.aborted && h(),
          t == null || (o = t.signal) === null || o === void 0 || o.addEventListener('abort', h);
        let p,
          l,
          d = !1;
        function g() {
          d = !0;
        }
        async function w() {
          try {
            for await (let m of f) {
              var _;
              if (d) return;
              if (c.aborted) throw new se();
              try {
                m = e(m, u);
              } catch (E) {
                m = Hf(E);
              }
              m !== nr &&
                (typeof ((_ = m) === null || _ === void 0 ? void 0 : _.catch) == 'function' && m.catch(g),
                a.push(m),
                p && (p(), (p = null)),
                !d &&
                  a.length &&
                  a.length >= r &&
                  (await new Gf((E) => {
                    l = E;
                  })));
            }
            a.push(Kf);
          } catch (m) {
            let E = Hf(m);
            Sw(E, void 0, g), a.push(E);
          } finally {
            var y;
            (d = !0),
              p && (p(), (p = null)),
              t == null || (y = t.signal) === null || y === void 0 || y.removeEventListener('abort', h);
          }
        }
        w();
        try {
          for (;;) {
            for (; a.length > 0; ) {
              let _ = await a[0];
              if (_ === Kf) return;
              if (c.aborted) throw new se();
              _ !== nr && (yield _), a.shift(), l && (l(), (l = null));
            }
            await new Gf((_) => {
              p = _;
            });
          }
        } finally {
          s.abort(), (d = !0), l && (l(), (l = null));
        }
      }.call(this)
    );
  }
  function Rw(e = void 0) {
    return (
      e != null && Pe(e, 'options'),
      e?.signal != null && je(e.signal, 'options.signal'),
      async function* () {
        let r = 0;
        for await (let i of this) {
          var n;
          if (e != null && (n = e.signal) !== null && n !== void 0 && n.aborted)
            throw new se({ cause: e.signal.reason });
          yield [r++, i];
        }
      }.call(this)
    );
  }
  async function Xf(e, t = void 0) {
    for await (let r of ti.call(this, e, t)) return !0;
    return !1;
  }
  async function Aw(e, t = void 0) {
    if (typeof e != 'function') throw new lt('fn', ['Function', 'AsyncFunction'], e);
    return !(await Xf.call(this, async (...r) => !(await e(...r)), t));
  }
  async function xw(e, t) {
    for await (let r of ti.call(this, e, t)) return r;
  }
  async function Tw(e, t) {
    if (typeof e != 'function') throw new lt('fn', ['Function', 'AsyncFunction'], e);
    async function r(n, i) {
      return await e(n, i), nr;
    }
    for await (let n of ir.call(this, r, t));
  }
  function ti(e, t) {
    if (typeof e != 'function') throw new lt('fn', ['Function', 'AsyncFunction'], e);
    async function r(n, i) {
      return (await e(n, i)) ? n : nr;
    }
    return ir.call(this, r, t);
  }
  var ei = class extends fw {
    constructor() {
      super('reduce'), (this.message = 'Reduce of an empty stream requires an initial value');
    }
  };
  async function Ow(e, t, r) {
    var n;
    if (typeof e != 'function') throw new lt('reducer', ['Function', 'AsyncFunction'], e);
    r != null && Pe(r, 'options'), r?.signal != null && je(r.signal, 'options.signal');
    let i = arguments.length > 1;
    if (r != null && (n = r.signal) !== null && n !== void 0 && n.aborted) {
      let c = new se(void 0, { cause: r.signal.reason });
      throw (this.once('error', () => {}), await dw(this.destroy(c)), c);
    }
    let o = new Jf(),
      s = o.signal;
    if (r != null && r.signal) {
      let c = { once: !0, [cw]: this };
      r.signal.addEventListener('abort', () => o.abort(), c);
    }
    let f = !1;
    try {
      for await (let c of this) {
        var a;
        if (((f = !0), r != null && (a = r.signal) !== null && a !== void 0 && a.aborted)) throw new se();
        i ? (t = await e(t, c, { signal: s })) : ((t = c), (i = !0));
      }
      if (!f && !i) throw new ei();
    } finally {
      o.abort();
    }
    return t;
  }
  async function vw(e) {
    e != null && Pe(e, 'options'), e?.signal != null && je(e.signal, 'options.signal');
    let t = [];
    for await (let n of this) {
      var r;
      if (e != null && (r = e.signal) !== null && r !== void 0 && r.aborted)
        throw new se(void 0, { cause: e.signal.reason });
      gw(t, n);
    }
    return t;
  }
  function Lw(e, t) {
    let r = ir.call(this, e, t);
    return async function* () {
      for await (let i of r) yield* i;
    }.call(this);
  }
  function Qf(e) {
    if (((e = mw(e)), _w(e))) return 0;
    if (e < 0) throw new uw('number', '>= 0', e);
    return e;
  }
  function Iw(e, t = void 0) {
    return (
      t != null && Pe(t, 'options'),
      t?.signal != null && je(t.signal, 'options.signal'),
      (e = Qf(e)),
      async function* () {
        var n;
        if (t != null && (n = t.signal) !== null && n !== void 0 && n.aborted) throw new se();
        for await (let o of this) {
          var i;
          if (t != null && (i = t.signal) !== null && i !== void 0 && i.aborted) throw new se();
          e-- <= 0 && (yield o);
        }
      }.call(this)
    );
  }
  function kw(e, t = void 0) {
    return (
      t != null && Pe(t, 'options'),
      t?.signal != null && je(t.signal, 'options.signal'),
      (e = Qf(e)),
      async function* () {
        var n;
        if (t != null && (n = t.signal) !== null && n !== void 0 && n.aborted) throw new se();
        for await (let o of this) {
          var i;
          if (t != null && (i = t.signal) !== null && i !== void 0 && i.aborted) throw new se();
          if (e-- > 0) yield o;
          else return;
        }
      }.call(this)
    );
  }
  ri.exports.streamReturningOperators = {
    asIndexedPairs: Rw,
    drop: Iw,
    filter: ti,
    flatMap: Lw,
    map: ir,
    take: kw,
    compose: Ew,
  };
  ri.exports.promiseReturningOperators = { every: Aw, forEach: Tw, reduce: Ow, toArray: vw, some: Xf, find: xw };
});
var ni = S((l_, eu) => {
  'use strict';
  var { ArrayPrototypePop: jw, Promise: Pw } = $(),
    { isIterable: qw, isNodeStream: Nw, isWebStream: Dw } = ne(),
    { pipelineImpl: $w } = er(),
    { finished: Mw } = le();
  require('stream');
  function Cw(...e) {
    return new Pw((t, r) => {
      let n,
        i,
        o = e[e.length - 1];
      if (o && typeof o == 'object' && !Nw(o) && !qw(o) && !Dw(o)) {
        let s = jw(e);
        (n = s.signal), (i = s.end);
      }
      $w(
        e,
        (s, f) => {
          s ? r(s) : t(f);
        },
        { signal: n, end: i }
      );
    });
  }
  eu.exports = { finished: Mw, pipeline: Cw };
});
var au = S((f_, uu) => {
  var { Buffer: Ww } = require('buffer'),
    { ObjectDefineProperty: ae, ObjectKeys: nu, ReflectApply: iu } = $(),
    {
      promisify: { custom: ou },
    } = te(),
    { streamReturningOperators: tu, promiseReturningOperators: ru } = Zf(),
    {
      codes: { ERR_ILLEGAL_CONSTRUCTOR: su },
    } = B(),
    Bw = Zn(),
    { pipeline: lu } = er(),
    { destroyer: Fw } = Te(),
    fu = le(),
    ii = ni(),
    oi = ne(),
    N = (uu.exports = Wt().Stream);
  N.isDisturbed = oi.isDisturbed;
  N.isErrored = oi.isErrored;
  N.isReadable = oi.isReadable;
  N.Readable = tt();
  for (let e of nu(tu)) {
    let r = function (...n) {
      if (new.target) throw su();
      return N.Readable.from(iu(t, this, n));
    };
    si = r;
    let t = tu[e];
    ae(r, 'name', { __proto__: null, value: t.name }),
      ae(r, 'length', { __proto__: null, value: t.length }),
      ae(N.Readable.prototype, e, { __proto__: null, value: r, enumerable: !1, configurable: !0, writable: !0 });
  }
  var si;
  for (let e of nu(ru)) {
    let r = function (...i) {
      if (new.target) throw su();
      return iu(t, this, i);
    };
    si = r;
    let t = ru[e];
    ae(r, 'name', { __proto__: null, value: t.name }),
      ae(r, 'length', { __proto__: null, value: t.length }),
      ae(N.Readable.prototype, e, { __proto__: null, value: r, enumerable: !1, configurable: !0, writable: !0 });
  }
  var si;
  N.Writable = qn();
  N.Duplex = oe();
  N.Transform = Bn();
  N.PassThrough = Un();
  N.pipeline = lu;
  var { addAbortSignal: Uw } = et();
  N.addAbortSignal = Uw;
  N.finished = fu;
  N.destroy = Fw;
  N.compose = Bw;
  ae(N, 'promises', {
    __proto__: null,
    configurable: !0,
    enumerable: !0,
    get() {
      return ii;
    },
  });
  ae(lu, ou, {
    __proto__: null,
    enumerable: !0,
    get() {
      return ii.pipeline;
    },
  });
  ae(fu, ou, {
    __proto__: null,
    enumerable: !0,
    get() {
      return ii.finished;
    },
  });
  N.Stream = N;
  N._isUint8Array = function (t) {
    return t instanceof Uint8Array;
  };
  N._uint8ArrayToBuffer = function (t) {
    return Ww.from(t.buffer, t.byteOffset, t.byteLength);
  };
});
var cu = S((u_, O) => {
  'use strict';
  var M = require('stream');
  if (M && process.env.READABLE_STREAM === 'disable') {
    let e = M.promises;
    (O.exports._uint8ArrayToBuffer = M._uint8ArrayToBuffer),
      (O.exports._isUint8Array = M._isUint8Array),
      (O.exports.isDisturbed = M.isDisturbed),
      (O.exports.isErrored = M.isErrored),
      (O.exports.isReadable = M.isReadable),
      (O.exports.Readable = M.Readable),
      (O.exports.Writable = M.Writable),
      (O.exports.Duplex = M.Duplex),
      (O.exports.Transform = M.Transform),
      (O.exports.PassThrough = M.PassThrough),
      (O.exports.addAbortSignal = M.addAbortSignal),
      (O.exports.finished = M.finished),
      (O.exports.destroy = M.destroy),
      (O.exports.pipeline = M.pipeline),
      (O.exports.compose = M.compose),
      Object.defineProperty(M, 'promises', {
        configurable: !0,
        enumerable: !0,
        get() {
          return e;
        },
      }),
      (O.exports.Stream = M.Stream);
  } else {
    let e = au(),
      t = ni(),
      r = e.Readable.destroy;
    (O.exports = e.Readable),
      (O.exports._uint8ArrayToBuffer = e._uint8ArrayToBuffer),
      (O.exports._isUint8Array = e._isUint8Array),
      (O.exports.isDisturbed = e.isDisturbed),
      (O.exports.isErrored = e.isErrored),
      (O.exports.isReadable = e.isReadable),
      (O.exports.Readable = e.Readable),
      (O.exports.Writable = e.Writable),
      (O.exports.Duplex = e.Duplex),
      (O.exports.Transform = e.Transform),
      (O.exports.PassThrough = e.PassThrough),
      (O.exports.addAbortSignal = e.addAbortSignal),
      (O.exports.finished = e.finished),
      (O.exports.destroy = e.destroy),
      (O.exports.destroy = r),
      (O.exports.pipeline = e.pipeline),
      (O.exports.compose = e.compose),
      Object.defineProperty(e, 'promises', {
        configurable: !0,
        enumerable: !0,
        get() {
          return t;
        },
      }),
      (O.exports.Stream = e.Stream);
  }
  O.exports.default = O.exports;
});
var pu = S((a_, hu) => {
  'use strict';
  var du = Symbol.for('pino.metadata'),
    Vw = Es(),
    { Duplex: zw } = cu();
  hu.exports = function (t, r = {}) {
    let n = r.parse === 'lines',
      i = typeof r.parseLine == 'function' ? r.parseLine : JSON.parse,
      o = r.close || Gw,
      s = Vw(
        function (a) {
          let c;
          try {
            c = i(a);
          } catch (u) {
            this.emit('unknown', a, u);
            return;
          }
          if (c === null) {
            this.emit('unknown', a, 'Null value ignored');
            return;
          }
          return (
            typeof c != 'object' && (c = { data: c, time: Date.now() }),
            s[du] && ((s.lastTime = c.time), (s.lastLevel = c.level), (s.lastObj = c)),
            n ? a : c
          );
        },
        { autoDestroy: !0 }
      );
    (s._destroy = function (a, c) {
      let u = o(a, c);
      u && typeof u.then == 'function' && u.then(c, c);
    }),
      r.metadata !== !1 && ((s[du] = !0), (s.lastTime = 0), (s.lastLevel = 0), (s.lastObj = null));
    let f = t(s);
    if (f && typeof f.catch == 'function')
      f.catch((a) => {
        s.destroy(a);
      }),
        (f = null);
    else if (r.enablePipelining && f) return zw.from({ writable: s, readable: f, objectMode: !0 });
    return s;
  };
  function Gw(e, t) {
    process.nextTick(t, e);
  }
});
var bu = S((c_, yu) => {
  var Hw = new Function('modulePath', 'return import(modulePath)');
  function Kw(e) {
    return typeof __non_webpack__require__ == 'function' ? __non_webpack__require__(e) : require(e);
  }
  yu.exports = { realImport: Hw, realRequire: Kw };
});
var wu = S((d_, gu) => {
  'use strict';
  var { realImport: Jw, realRequire: ft } = bu();
  gu.exports = Yw;
  async function Yw(e) {
    let t;
    try {
      let r = 'file://' + e;
      r.endsWith('.ts') || r.endsWith('.cts')
        ? (process[Symbol.for('ts-node.register.instance')]
            ? ft('ts-node/register')
            : process.env && process.env.TS_NODE_DEV && ft('ts-node-dev'),
          (t = ft(decodeURIComponent(e))))
        : (t = await Jw(r));
    } catch (r) {
      if (r.code === 'ENOTDIR' || r.code === 'ERR_MODULE_NOT_FOUND') t = ft(e);
      else if (r.code === void 0) t = ft(decodeURIComponent(e));
      else throw r;
    }
    if ((typeof t == 'object' && (t = t.default), typeof t == 'object' && (t = t.default), typeof t != 'function'))
      throw Error('exported worker is not a function');
    return t;
  }
});
var Xw = ws(),
  Qw = pu(),
  Zw = wu();
module.exports = async function ({ targets: e, levels: t, dedupe: r }) {
  return (
    (e = await Promise.all(
      e.map(async (i) => {
        let s = await (await Zw(i.target))(i.options);
        return { level: i.level, stream: s };
      })
    )),
    Qw(n, {
      parse: 'lines',
      metadata: !0,
      close(i, o) {
        let s = 0;
        for (let a of e) s++, a.stream.on('close', f), a.stream.end();
        function f() {
          --s === 0 && o(i);
        }
      },
    })
  );
  function n(i) {
    let o = Xw.multistream(e, { levels: t, dedupe: r });
    i.on('data', function (s) {
      let { lastTime: f, lastMsg: a, lastObj: c, lastLevel: u } = this;
      (o.lastLevel = u),
        (o.lastTime = f),
        (o.lastMsg = a),
        (o.lastObj = c),
        o.write(
          s +
            `
`
        );
    });
  }
};
