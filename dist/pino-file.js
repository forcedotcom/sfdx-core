'use strict';
var E = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
var pe = E((nf, at) => {
  'use strict';
  var H = (e) => e && typeof e.message == 'string',
    me = (e) => {
      if (!e) return;
      let t = e.cause;
      if (typeof t == 'function') {
        let r = e.cause();
        return H(r) ? r : void 0;
      } else return H(t) ? t : void 0;
    },
    ut = (e, t) => {
      if (!H(e)) return '';
      let r = e.stack || '';
      if (t.has(e))
        return (
          r +
          `
causes have become circular...`
        );
      let n = me(e);
      return n
        ? (t.add(e),
          r +
            `
caused by: ` +
            ut(n, t))
        : r;
    },
    En = (e) => ut(e, new Set()),
    ct = (e, t, r) => {
      if (!H(e)) return '';
      let n = r ? '' : e.message || '';
      if (t.has(e)) return n + ': ...';
      let i = me(e);
      if (i) {
        t.add(e);
        let o = typeof e.cause == 'function';
        return n + (o ? '' : ': ') + ct(i, t, o);
      } else return n;
    },
    xn = (e) => ct(e, new Set());
  at.exports = { isErrorLike: H, getErrorCause: me, stackWithCauses: En, messageWithCauses: xn };
});
var be = E((sf, dt) => {
  'use strict';
  var On = Symbol('circular-ref-tag'),
    Y = Symbol('pino-raw-err-ref'),
    ht = Object.create(
      {},
      {
        type: { enumerable: !0, writable: !0, value: void 0 },
        message: { enumerable: !0, writable: !0, value: void 0 },
        stack: { enumerable: !0, writable: !0, value: void 0 },
        aggregateErrors: { enumerable: !0, writable: !0, value: void 0 },
        raw: {
          enumerable: !1,
          get: function () {
            return this[Y];
          },
          set: function (e) {
            this[Y] = e;
          },
        },
      }
    );
  Object.defineProperty(ht, Y, { writable: !0, value: {} });
  dt.exports = { pinoErrProto: ht, pinoErrorSymbols: { seen: On, rawSymbol: Y } };
});
var mt = E((of, gt) => {
  'use strict';
  gt.exports = Se;
  var { messageWithCauses: vn, stackWithCauses: $n, isErrorLike: yt } = pe(),
    { pinoErrProto: An, pinoErrorSymbols: jn } = be(),
    { seen: we } = jn,
    { toString: Ln } = Object.prototype;
  function Se(e) {
    if (!yt(e)) return e;
    e[we] = void 0;
    let t = Object.create(An);
    (t.type = Ln.call(e.constructor) === '[object Function]' ? e.constructor.name : e.name),
      (t.message = vn(e)),
      (t.stack = $n(e)),
      Array.isArray(e.errors) && (t.aggregateErrors = e.errors.map((r) => Se(r)));
    for (let r in e)
      if (t[r] === void 0) {
        let n = e[r];
        yt(n) ? r !== 'cause' && !Object.prototype.hasOwnProperty.call(n, we) && (t[r] = Se(n)) : (t[r] = n);
      }
    return delete e[we], (t.raw = e), t;
  }
});
var bt = E((lf, pt) => {
  'use strict';
  pt.exports = Z;
  var { isErrorLike: _e } = pe(),
    { pinoErrProto: kn, pinoErrorSymbols: Tn } = be(),
    { seen: Q } = Tn,
    { toString: Rn } = Object.prototype;
  function Z(e) {
    if (!_e(e)) return e;
    e[Q] = void 0;
    let t = Object.create(kn);
    (t.type = Rn.call(e.constructor) === '[object Function]' ? e.constructor.name : e.name),
      (t.message = e.message),
      (t.stack = e.stack),
      Array.isArray(e.errors) && (t.aggregateErrors = e.errors.map((r) => Z(r))),
      _e(e.cause) && !Object.prototype.hasOwnProperty.call(e.cause, Q) && (t.cause = Z(e.cause));
    for (let r in e)
      if (t[r] === void 0) {
        let n = e[r];
        _e(n) ? Object.prototype.hasOwnProperty.call(n, Q) || (t[r] = Z(n)) : (t[r] = n);
      }
    return delete e[Q], (t.raw = e), t;
  }
});
var Et = E((ff, _t) => {
  'use strict';
  _t.exports = { mapHttpRequest: Bn, reqSerializer: St };
  var Ee = Symbol('pino-raw-req-ref'),
    wt = Object.create(
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
            return this[Ee];
          },
          set: function (e) {
            this[Ee] = e;
          },
        },
      }
    );
  Object.defineProperty(wt, Ee, { writable: !0, value: {} });
  function St(e) {
    let t = e.info || e.socket,
      r = Object.create(wt);
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
  function Bn(e) {
    return { req: St(e) };
  }
});
var $t = E((uf, vt) => {
  'use strict';
  vt.exports = { mapHttpResponse: qn, resSerializer: Ot };
  var xe = Symbol('pino-raw-res-ref'),
    xt = Object.create(
      {},
      {
        statusCode: { enumerable: !0, writable: !0, value: 0 },
        headers: { enumerable: !0, writable: !0, value: '' },
        raw: {
          enumerable: !1,
          get: function () {
            return this[xe];
          },
          set: function (e) {
            this[xe] = e;
          },
        },
      }
    );
  Object.defineProperty(xt, xe, { writable: !0, value: {} });
  function Ot(e) {
    let t = Object.create(xt);
    return (
      (t.statusCode = e.headersSent ? e.statusCode : null),
      (t.headers = e.getHeaders ? e.getHeaders() : e._headers),
      (t.raw = e),
      t
    );
  }
  function qn(e) {
    return { res: Ot(e) };
  }
});
var ve = E((cf, At) => {
  'use strict';
  var Oe = mt(),
    In = bt(),
    ee = Et(),
    te = $t();
  At.exports = {
    err: Oe,
    errWithCause: In,
    mapHttpRequest: ee.mapHttpRequest,
    mapHttpResponse: te.mapHttpResponse,
    req: ee.reqSerializer,
    res: te.resSerializer,
    wrapErrorSerializer: function (t) {
      return t === Oe
        ? t
        : function (n) {
            return t(Oe(n));
          };
    },
    wrapRequestSerializer: function (t) {
      return t === ee.reqSerializer
        ? t
        : function (n) {
            return t(ee.reqSerializer(n));
          };
    },
    wrapResponseSerializer: function (t) {
      return t === te.resSerializer
        ? t
        : function (n) {
            return t(te.resSerializer(n));
          };
    },
  };
});
var $e = E((af, jt) => {
  'use strict';
  function Nn(e, t) {
    return t;
  }
  jt.exports = function () {
    let t = Error.prepareStackTrace;
    Error.prepareStackTrace = Nn;
    let r = new Error().stack;
    if (((Error.prepareStackTrace = t), !Array.isArray(r))) return;
    let n = r.slice(2),
      i = [];
    for (let o of n) o && i.push(o.getFileName());
    return i;
  };
});
var kt = E((hf, Lt) => {
  'use strict';
  Lt.exports = Pn;
  function Pn(e = {}) {
    let {
      ERR_PATHS_MUST_BE_STRINGS: t = () => 'fast-redact - Paths must be (non-empty) strings',
      ERR_INVALID_PATH: r = (n) => `fast-redact \u2013 Invalid path (${n})`,
    } = e;
    return function ({ paths: i }) {
      i.forEach((o) => {
        if (typeof o != 'string') throw Error(t());
        try {
          if (/〇/.test(o)) throw Error();
          let f =
            (o[0] === '[' ? '' : '.') +
            o
              .replace(/^\*/, '\u3007')
              .replace(/\.\*/g, '.\u3007')
              .replace(/\[\*\]/g, '[\u3007]');
          if (/\n|\r|;/.test(f) || /\/\*/.test(f)) throw Error();
          Function(`
            'use strict'
            const o = new Proxy({}, { get: () => o, set: () => { throw Error() } });
            const \u3007 = null;
            o${f}
            if ([o${f}].length !== 1) throw Error()`)();
        } catch {
          throw Error(r(o));
        }
      });
    };
  }
});
var re = E((df, Tt) => {
  'use strict';
  Tt.exports = /[^.[\]]+|\[((?:.)*?)\]/g;
});
var Bt = E((yf, Rt) => {
  'use strict';
  var Cn = re();
  Rt.exports = Dn;
  function Dn({ paths: e }) {
    let t = [];
    var r = 0;
    let n = e.reduce(function (i, o, f) {
      var h = o.match(Cn).map((l) => l.replace(/'|"|`/g, ''));
      let d = o[0] === '[';
      h = h.map((l) => (l[0] === '[' ? l.substr(1, l.length - 2) : l));
      let y = h.indexOf('*');
      if (y > -1) {
        let l = h.slice(0, y),
          c = l.join('.'),
          g = h.slice(y + 1, h.length),
          s = g.length > 0;
        r++, t.push({ before: l, beforeStr: c, after: g, nested: s });
      } else i[o] = { path: h, val: void 0, precensored: !1, circle: '', escPath: JSON.stringify(o), leadingBracket: d };
      return i;
    }, {});
    return { wildcards: t, wcLen: r, secret: n };
  }
});
var It = E((gf, qt) => {
  'use strict';
  var zn = re();
  qt.exports = Mn;
  function Mn({ secret: e, serialize: t, wcLen: r, strict: n, isCensorFct: i, censorFctTakesPath: o }, f) {
    let h = Function(
      'o',
      `
    if (typeof o !== 'object' || o == null) {
      ${Vn(n, t)}
    }
    const { censor, secret } = this
    ${Wn(e, i, o)}
    this.compileRestore()
    ${Fn(r > 0, i, o)}
    ${Kn(t)}
  `
    ).bind(f);
    return t === !1 && (h.restore = (d) => f.restore(d)), h;
  }
  function Wn(e, t, r) {
    return Object.keys(e).map((n) => {
      let { escPath: i, leadingBracket: o, path: f } = e[n],
        h = o ? 1 : 0,
        d = o ? '' : '.',
        y = [];
      for (var l; (l = zn.exec(n)) !== null; ) {
        let [, u] = l,
          { index: p, input: b } = l;
        p > h && y.push(b.substring(0, p - (u ? 0 : 1)));
      }
      var c = y.map((u) => `o${d}${u}`).join(' && ');
      c.length === 0 ? (c += `o${d}${n} != null`) : (c += ` && o${d}${n} != null`);
      let g = `
      switch (true) {
        ${y.reverse().map(
          (u) => `
          case o${d}${u} === censor:
            secret[${i}].circle = ${JSON.stringify(u)}
            break
        `
        ).join(`
`)}
      }
    `,
        s = r ? `val, ${JSON.stringify(f)}` : 'val';
      return `
      if (${c}) {
        const val = o${d}${n}
        if (val === censor) {
          secret[${i}].precensored = true
        } else {
          secret[${i}].val = val
          o${d}${n} = ${t ? `censor(${s})` : 'censor'}
          ${g}
        }
      }
    `;
    }).join(`
`);
  }
  function Fn(e, t, r) {
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
  function Kn(e) {
    return e === !1
      ? 'return o'
      : `
    var s = this.serialize(o)
    this.restore(o)
    return s
  `;
  }
  function Vn(e, t) {
    return e === !0
      ? "throw Error('fast-redact: primitives cannot be redacted')"
      : t === !1
      ? 'return o'
      : 'return this.serialize(o)';
  }
});
var Ae = E((mf, Dt) => {
  'use strict';
  Dt.exports = { groupRedact: Un, groupRestore: Jn, nestedRedact: Hn, nestedRestore: Gn };
  function Jn({ keys: e, values: t, target: r }) {
    if (r == null) return;
    let n = e.length;
    for (var i = 0; i < n; i++) {
      let o = e[i];
      r[o] = t[i];
    }
  }
  function Un(e, t, r, n, i) {
    let o = Nt(e, t);
    if (o == null) return { keys: null, values: null, target: null, flat: !0 };
    let f = Object.keys(o),
      h = f.length,
      d = t.length,
      y = i ? [...t] : void 0,
      l = new Array(h);
    for (var c = 0; c < h; c++) {
      let g = f[c];
      (l[c] = o[g]), i ? ((y[d] = g), (o[g] = r(o[g], y))) : n ? (o[g] = r(o[g])) : (o[g] = r);
    }
    return { keys: f, values: l, target: o, flat: !0 };
  }
  function Gn(e) {
    let t = e.length;
    for (var r = 0; r < t; r++) {
      let { key: i, target: o, value: f, level: h } = e[r];
      if (h === 0 || h === 1) {
        if ((J(o, i) && (o[i] = f), typeof o == 'object')) {
          let d = Object.keys(o);
          for (var n = 0; n < d.length; n++) {
            let y = d[n],
              l = o[y];
            J(l, i) && (l[i] = f);
          }
        }
      } else Ct(i, o, f, h);
    }
  }
  function Hn(e, t, r, n, i, o, f) {
    let h = Nt(t, r);
    if (h == null) return;
    let d = Object.keys(h),
      y = d.length;
    for (var l = 0; l < y; l++) {
      let c = d[l],
        { value: g, parent: s, exists: u, level: p } = Xn(h, c, r, n, i, o, f);
      u === !0 && s !== null && e.push({ key: n[n.length - 1], target: s, value: g, level: p });
    }
    return e;
  }
  function J(e, t) {
    return e != null ? ('hasOwn' in Object ? Object.hasOwn(e, t) : Object.prototype.hasOwnProperty.call(e, t)) : !1;
  }
  function Xn(e, t, r, n, i, o, f) {
    let h = n.length,
      d = h - 1,
      y = t;
    var l = -1,
      c,
      g,
      s,
      u = null,
      p = !0,
      b = null,
      w,
      m,
      S = !1,
      _ = 0;
    if (((s = c = e[t]), typeof c != 'object')) return { value: null, parent: null, exists: p };
    for (; c != null && ++l < h; ) {
      if (((t = n[l]), (u = s), t !== '*' && !b && !(typeof c == 'object' && t in c))) {
        p = !1;
        break;
      }
      if (!(t === '*' && (b === '*' && (S = !0), (b = t), l !== d))) {
        if (b) {
          let $ = Object.keys(c);
          for (var O = 0; O < $.length; O++) {
            let v = $[O];
            (m = c[v]),
              (w = t === '*'),
              S
                ? ((_ = l), (s = Pt(m, _ - 1, t, r, n, i, o, f, y, c, g, s, w, v, l, d, p)))
                : (w || (typeof m == 'object' && m !== null && t in m)) &&
                  (w ? (s = m) : (s = m[t]),
                  (g = l !== d ? s : o ? (f ? i(s, [...r, y, ...n]) : i(s)) : i),
                  w
                    ? (c[v] = g)
                    : m[t] === g
                    ? (p = !1)
                    : (m[t] = (g === void 0 && i !== void 0) || (J(m, t) && g === s) ? m[t] : g));
          }
          b = null;
        } else
          (s = c[t]),
            (g = l !== d ? s : o ? (f ? i(s, [...r, y, ...n]) : i(s)) : i),
            (c[t] = (J(c, t) && g === s) || (g === void 0 && i !== void 0) ? c[t] : g),
            (c = c[t]);
        if (typeof c != 'object') break;
        (s === u || typeof s > 'u') && (p = !1);
      }
    }
    return { value: s, parent: u, exists: p, level: _ };
  }
  function Nt(e, t) {
    for (var r = -1, n = t.length, i = e; i != null && ++r < n; ) i = i[t[r]];
    return i;
  }
  function Pt(e, t, r, n, i, o, f, h, d, y, l, c, g, s, u, p, b) {
    if (t === 0)
      return (
        (g || (typeof e == 'object' && e !== null && r in e)) &&
          (g ? (c = e) : (c = e[r]),
          (l = u !== p ? c : f ? (h ? o(c, [...n, d, ...i]) : o(c)) : o),
          g
            ? (y[s] = l)
            : e[r] === l
            ? (b = !1)
            : (e[r] = (l === void 0 && o !== void 0) || (J(e, r) && l === c) ? e[r] : l)),
        c
      );
    for (let m in e)
      if (typeof e[m] == 'object') {
        var w = Pt(e[m], t - 1, r, n, i, o, f, h, d, y, l, c, g, s, u, p, b);
        return w;
      }
  }
  function Ct(e, t, r, n) {
    if (n === 0) {
      J(t, e) && (t[e] = r);
      return;
    }
    for (let i in t) typeof t[i] == 'object' && Ct(e, t[i], r, n - 1);
  }
});
var Mt = E((pf, zt) => {
  'use strict';
  var { groupRestore: Yn, nestedRestore: Qn } = Ae();
  zt.exports = Zn;
  function Zn({ secret: e, wcLen: t }) {
    return function () {
      if (this.restore) return;
      let n = Object.keys(e),
        i = ei(e, n),
        o = t > 0,
        f = o ? { secret: e, groupRestore: Yn, nestedRestore: Qn } : { secret: e };
      this.restore = Function('o', ti(i, n, o)).bind(f);
    };
  }
  function ei(e, t) {
    return t
      .map((r) => {
        let { circle: n, escPath: i, leadingBracket: o } = e[r],
          h = n ? `o.${n} = secret[${i}].val` : `o${o ? '' : '.'}${r} = secret[${i}].val`,
          d = `secret[${i}].val = undefined`;
        return `
      if (secret[${i}].val !== undefined) {
        try { ${h} } catch (e) {}
        ${d}
      }
    `;
      })
      .join('');
  }
  function ti(e, t, r) {
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
var Ft = E((bf, Wt) => {
  'use strict';
  Wt.exports = ri;
  function ri(e) {
    let {
        secret: t,
        censor: r,
        compileRestore: n,
        serialize: i,
        groupRedact: o,
        nestedRedact: f,
        wildcards: h,
        wcLen: d,
      } = e,
      y = [{ secret: t, censor: r, compileRestore: n }];
    return (
      i !== !1 && y.push({ serialize: i }),
      d > 0 && y.push({ groupRedact: o, nestedRedact: f, wildcards: h, wcLen: d }),
      Object.assign(...y)
    );
  }
});
var Jt = E((wf, Vt) => {
  'use strict';
  var Kt = kt(),
    ni = Bt(),
    ii = It(),
    si = Mt(),
    { groupRedact: oi, nestedRedact: li } = Ae(),
    fi = Ft(),
    ui = re(),
    ci = Kt(),
    je = (e) => e;
  je.restore = je;
  var ai = '[REDACTED]';
  Le.rx = ui;
  Le.validator = Kt;
  Vt.exports = Le;
  function Le(e = {}) {
    let t = Array.from(new Set(e.paths || [])),
      r = 'serialize' in e && (e.serialize === !1 || typeof e.serialize == 'function') ? e.serialize : JSON.stringify,
      n = e.remove;
    if (n === !0 && r !== JSON.stringify)
      throw Error('fast-redact \u2013 remove option may only be set when serializer is JSON.stringify');
    let i = n === !0 ? void 0 : 'censor' in e ? e.censor : ai,
      o = typeof i == 'function',
      f = o && i.length > 1;
    if (t.length === 0) return r || je;
    ci({ paths: t, serialize: r, censor: i });
    let { wildcards: h, wcLen: d, secret: y } = ni({ paths: t, censor: i }),
      l = si({ secret: y, wcLen: d }),
      c = 'strict' in e ? e.strict : !0;
    return ii(
      { secret: y, wcLen: d, serialize: r, strict: c, isCensorFct: o, censorFctTakesPath: f },
      fi({
        secret: y,
        censor: i,
        compileRestore: l,
        serialize: r,
        groupRedact: oi,
        nestedRedact: li,
        wildcards: h,
        wcLen: d,
      })
    );
  }
});
var U = E((Sf, Ut) => {
  'use strict';
  var hi = Symbol('pino.setLevel'),
    di = Symbol('pino.getLevel'),
    yi = Symbol('pino.levelVal'),
    gi = Symbol('pino.useLevelLabels'),
    mi = Symbol('pino.useOnlyCustomLevels'),
    pi = Symbol('pino.mixin'),
    bi = Symbol('pino.lsCache'),
    wi = Symbol('pino.chindings'),
    Si = Symbol('pino.asJson'),
    _i = Symbol('pino.write'),
    Ei = Symbol('pino.redactFmt'),
    xi = Symbol('pino.time'),
    Oi = Symbol('pino.timeSliceIndex'),
    vi = Symbol('pino.stream'),
    $i = Symbol('pino.stringify'),
    Ai = Symbol('pino.stringifySafe'),
    ji = Symbol('pino.stringifiers'),
    Li = Symbol('pino.end'),
    ki = Symbol('pino.formatOpts'),
    Ti = Symbol('pino.messageKey'),
    Ri = Symbol('pino.errorKey'),
    Bi = Symbol('pino.nestedKey'),
    qi = Symbol('pino.nestedKeyStr'),
    Ii = Symbol('pino.mixinMergeStrategy'),
    Ni = Symbol('pino.msgPrefix'),
    Pi = Symbol('pino.wildcardFirst'),
    Ci = Symbol.for('pino.serializers'),
    Di = Symbol.for('pino.formatters'),
    zi = Symbol.for('pino.hooks'),
    Mi = Symbol.for('pino.metadata');
  Ut.exports = {
    setLevelSym: hi,
    getLevelSym: di,
    levelValSym: yi,
    useLevelLabelsSym: gi,
    mixinSym: pi,
    lsCacheSym: bi,
    chindingsSym: wi,
    asJsonSym: Si,
    writeSym: _i,
    serializersSym: Ci,
    redactFmtSym: Ei,
    timeSym: xi,
    timeSliceIndexSym: Oi,
    streamSym: vi,
    stringifySym: $i,
    stringifySafeSym: Ai,
    stringifiersSym: ji,
    endSym: Li,
    formatOptsSym: ki,
    messageKeySym: Ti,
    errorKeySym: Ri,
    nestedKeySym: Bi,
    wildcardFirstSym: Pi,
    needsMetadataGsym: Mi,
    useOnlyCustomLevelsSym: mi,
    formattersSym: Di,
    hooksSym: zi,
    nestedKeyStrSym: qi,
    mixinMergeStrategySym: Ii,
    msgPrefixSym: Ni,
  };
});
var Re = E((_f, Yt) => {
  'use strict';
  var Te = Jt(),
    { redactFmtSym: Wi, wildcardFirstSym: ne } = U(),
    { rx: ke, validator: Fi } = Te,
    Gt = Fi({
      ERR_PATHS_MUST_BE_STRINGS: () => 'pino \u2013 redacted paths must be strings',
      ERR_INVALID_PATH: (e) => `pino \u2013 redact paths array contains an invalid path (${e})`,
    }),
    Ht = '[Redacted]',
    Xt = !1;
  function Ki(e, t) {
    let { paths: r, censor: n } = Vi(e),
      i = r.reduce((h, d) => {
        ke.lastIndex = 0;
        let y = ke.exec(d),
          l = ke.exec(d),
          c = y[1] !== void 0 ? y[1].replace(/^(?:"|'|`)(.*)(?:"|'|`)$/, '$1') : y[0];
        if ((c === '*' && (c = ne), l === null)) return (h[c] = null), h;
        if (h[c] === null) return h;
        let { index: g } = l,
          s = `${d.substr(g, d.length - 1)}`;
        return (
          (h[c] = h[c] || []),
          c !== ne && h[c].length === 0 && h[c].push(...(h[ne] || [])),
          c === ne &&
            Object.keys(h).forEach(function (u) {
              h[u] && h[u].push(s);
            }),
          h[c].push(s),
          h
        );
      }, {}),
      o = { [Wi]: Te({ paths: r, censor: n, serialize: t, strict: Xt }) },
      f = (...h) => t(typeof n == 'function' ? n(...h) : n);
    return [...Object.keys(i), ...Object.getOwnPropertySymbols(i)].reduce((h, d) => {
      if (i[d] === null) h[d] = (y) => f(y, [d]);
      else {
        let y = typeof n == 'function' ? (l, c) => n(l, [d, ...c]) : n;
        h[d] = Te({ paths: i[d], censor: y, serialize: t, strict: Xt });
      }
      return h;
    }, o);
  }
  function Vi(e) {
    if (Array.isArray(e)) return (e = { paths: e, censor: Ht }), Gt(e), e;
    let { paths: t, censor: r = Ht, remove: n } = e;
    if (Array.isArray(t) === !1) throw Error('pino \u2013 redact must contain an array of strings');
    return n === !0 && (r = void 0), Gt({ paths: t, censor: r }), { paths: t, censor: r };
  }
  Yt.exports = Ki;
});
var Zt = E((Ef, Qt) => {
  'use strict';
  var Ji = () => '',
    Ui = () => `,"time":${Date.now()}`,
    Gi = () => `,"time":${Math.round(Date.now() / 1e3)}`,
    Hi = () => `,"time":"${new Date(Date.now()).toISOString()}"`;
  Qt.exports = { nullTime: Ji, epochTime: Ui, unixTime: Gi, isoTime: Hi };
});
var tr = E((xf, er) => {
  'use strict';
  function Xi(e) {
    try {
      return JSON.stringify(e);
    } catch {
      return '"[Circular]"';
    }
  }
  er.exports = Yi;
  function Yi(e, t, r) {
    var n = (r && r.stringify) || Xi,
      i = 1;
    if (typeof e == 'object' && e !== null) {
      var o = t.length + i;
      if (o === 1) return e;
      var f = new Array(o);
      f[0] = n(e);
      for (var h = 1; h < o; h++) f[h] = n(t[h]);
      return f.join(' ');
    }
    if (typeof e != 'string') return e;
    var d = t.length;
    if (d === 0) return e;
    for (var y = '', l = 1 - i, c = -1, g = (e && e.length) || 0, s = 0; s < g; ) {
      if (e.charCodeAt(s) === 37 && s + 1 < g) {
        switch (((c = c > -1 ? c : 0), e.charCodeAt(s + 1))) {
          case 100:
          case 102:
            if (l >= d || t[l] == null) break;
            c < s && (y += e.slice(c, s)), (y += Number(t[l])), (c = s + 2), s++;
            break;
          case 105:
            if (l >= d || t[l] == null) break;
            c < s && (y += e.slice(c, s)), (y += Math.floor(Number(t[l]))), (c = s + 2), s++;
            break;
          case 79:
          case 111:
          case 106:
            if (l >= d || t[l] === void 0) break;
            c < s && (y += e.slice(c, s));
            var u = typeof t[l];
            if (u === 'string') {
              (y += "'" + t[l] + "'"), (c = s + 2), s++;
              break;
            }
            if (u === 'function') {
              (y += t[l].name || '<anonymous>'), (c = s + 2), s++;
              break;
            }
            (y += n(t[l])), (c = s + 2), s++;
            break;
          case 115:
            if (l >= d) break;
            c < s && (y += e.slice(c, s)), (y += String(t[l])), (c = s + 2), s++;
            break;
          case 37:
            c < s && (y += e.slice(c, s)), (y += '%'), (c = s + 2), s++, l--;
            break;
        }
        ++l;
      }
      ++s;
    }
    return c === -1 ? e : (c < g && (y += e.slice(c)), y);
  }
});
var qe = E((Of, Be) => {
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
    Be.exports = t;
  } else {
    let e = function (t) {
      if ((t > 0 && t < 1 / 0) === !1)
        throw typeof t != 'number' && typeof t != 'bigint'
          ? TypeError('sleep: ms must be a number')
          : RangeError('sleep: ms must be a number that is greater than 0 but less than Infinity');
      let n = Date.now() + Number(t);
      for (; n > Date.now(); );
    };
    Be.exports = e;
  }
});
var ur = E((vf, fr) => {
  'use strict';
  var A = require('fs'),
    Qi = require('events'),
    Zi = require('util').inherits,
    rr = require('path'),
    Ie = qe(),
    ie = 100,
    se = Buffer.allocUnsafe(0),
    es = 16 * 1024,
    nr = 'buffer',
    ir = 'utf8';
  function sr(e, t) {
    (t._opening = !0), (t._writing = !0), (t._asyncDrainScheduled = !1);
    function r(o, f) {
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
      (t.fd = f),
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
        t.mkdir && A.mkdirSync(rr.dirname(e), { recursive: !0 });
        let o = A.openSync(e, n, i);
        r(null, o);
      } catch (o) {
        throw (r(o), o);
      }
    else
      t.mkdir
        ? A.mkdir(rr.dirname(e), { recursive: !0 }, (o) => {
            if (o) return r(o);
            A.open(e, n, i, r);
          })
        : A.open(e, n, i, r);
  }
  function I(e) {
    if (!(this instanceof I)) return new I(e);
    let {
      fd: t,
      dest: r,
      minLength: n,
      maxLength: i,
      maxWrite: o,
      sync: f,
      append: h = !0,
      mkdir: d,
      retryEAGAIN: y,
      fsync: l,
      contentMode: c,
      mode: g,
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
      (this.maxWrite = o || es),
      (this.sync = f || !1),
      (this.writable = !0),
      (this._fsync = l || !1),
      (this.append = h || !1),
      (this.mode = g),
      (this.retryEAGAIN = y || (() => !0)),
      (this.mkdir = d || !1);
    let s, u;
    if (c === nr)
      (this._writingBuf = se),
        (this.write = ns),
        (this.flush = ss),
        (this.flushSync = ls),
        (this._actualWrite = us),
        (s = () => A.writeSync(this.fd, this._writingBuf)),
        (u = () => A.write(this.fd, this._writingBuf, this.release));
    else if (c === void 0 || c === ir)
      (this._writingBuf = ''),
        (this.write = rs),
        (this.flush = is),
        (this.flushSync = os),
        (this._actualWrite = fs),
        (s = () => A.writeSync(this.fd, this._writingBuf, 'utf8')),
        (u = () => A.write(this.fd, this._writingBuf, 'utf8', this.release));
    else throw new Error(`SonicBoom supports "${ir}" and "${nr}", but passed ${c}`);
    if (typeof t == 'number') (this.fd = t), process.nextTick(() => this.emit('ready'));
    else if (typeof t == 'string') sr(t, this);
    else throw new Error('SonicBoom supports only file descriptors and files');
    if (this.minLength >= this.maxWrite)
      throw new Error(`minLength should be smaller than maxWrite (${this.maxWrite})`);
    (this.release = (p, b) => {
      if (p) {
        if (
          (p.code === 'EAGAIN' || p.code === 'EBUSY') &&
          this.retryEAGAIN(p, this._writingBuf.length, this._len - this._writingBuf.length)
        )
          if (this.sync)
            try {
              Ie(ie), this.release(void 0, 0);
            } catch (m) {
              this.release(m);
            }
          else setTimeout(u, ie);
        else (this._writing = !1), this.emit('error', p);
        return;
      }
      if (
        (this.emit('write', b),
        (this._len -= b),
        this._len < 0 && (this._len = 0),
        (this._writingBuf = this._writingBuf.slice(b)),
        this._writingBuf.length)
      ) {
        if (!this.sync) {
          u();
          return;
        }
        try {
          do {
            let m = s();
            (this._len -= m), (this._writingBuf = this._writingBuf.slice(m));
          } while (this._writingBuf.length);
        } catch (m) {
          this.release(m);
          return;
        }
      }
      this._fsync && A.fsyncSync(this.fd);
      let w = this._len;
      this._reopening
        ? ((this._writing = !1), (this._reopening = !1), this.reopen())
        : w > this.minLength
        ? this._actualWrite()
        : this._ending
        ? w > 0
          ? this._actualWrite()
          : ((this._writing = !1), oe(this))
        : ((this._writing = !1),
          this.sync
            ? this._asyncDrainScheduled || ((this._asyncDrainScheduled = !0), process.nextTick(ts, this))
            : this.emit('drain'));
    }),
      this.on('newListener', function (p) {
        p === 'drain' && (this._asyncDrainScheduled = !1);
      });
  }
  function ts(e) {
    e.listenerCount('drain') > 0 && ((e._asyncDrainScheduled = !1), e.emit('drain'));
  }
  Zi(I, Qi);
  function or(e, t) {
    return e.length === 0 ? se : e.length === 1 ? e[0] : Buffer.concat(e, t);
  }
  function rs(e) {
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
  function ns(e) {
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
  function lr(e) {
    this._flushPending = !0;
    let t = () => {
        this._fsync
          ? ((this._flushPending = !1), e())
          : A.fsync(this.fd, (n) => {
              (this._flushPending = !1), e(n);
            }),
          this.off('error', r);
      },
      r = (n) => {
        (this._flushPending = !1), e(n), this.off('drain', t);
      };
    this.once('drain', t), this.once('error', r);
  }
  function is(e) {
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
    e && lr.call(this, e), !this._writing && (this._bufs.length === 0 && this._bufs.push(''), this._actualWrite());
  }
  function ss(e) {
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
    e && lr.call(this, e),
      !this._writing && (this._bufs.length === 0 && (this._bufs.push([]), this._lens.push(0)), this._actualWrite());
  }
  I.prototype.reopen = function (e) {
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
        A.close(t, (r) => {
          if (r) return this.emit('error', r);
        });
    }),
      sr(e || this.file, this);
  };
  I.prototype.end = function () {
    if (this.destroyed) throw new Error('SonicBoom destroyed');
    if (this._opening) {
      this.once('ready', () => {
        this.end();
      });
      return;
    }
    this._ending ||
      ((this._ending = !0), !this._writing && (this._len > 0 && this.fd >= 0 ? this._actualWrite() : oe(this)));
  };
  function os() {
    if (this.destroyed) throw new Error('SonicBoom destroyed');
    if (this.fd < 0) throw new Error('sonic boom is not ready yet');
    !this._writing && this._writingBuf.length > 0 && (this._bufs.unshift(this._writingBuf), (this._writingBuf = ''));
    let e = '';
    for (; this._bufs.length || e; ) {
      e.length <= 0 && (e = this._bufs[0]);
      try {
        let t = A.writeSync(this.fd, e, 'utf8');
        (e = e.slice(t)), (this._len = Math.max(this._len - t, 0)), e.length <= 0 && this._bufs.shift();
      } catch (t) {
        if ((t.code === 'EAGAIN' || t.code === 'EBUSY') && !this.retryEAGAIN(t, e.length, this._len - e.length))
          throw t;
        Ie(ie);
      }
    }
    try {
      A.fsyncSync(this.fd);
    } catch {}
  }
  function ls() {
    if (this.destroyed) throw new Error('SonicBoom destroyed');
    if (this.fd < 0) throw new Error('sonic boom is not ready yet');
    !this._writing && this._writingBuf.length > 0 && (this._bufs.unshift([this._writingBuf]), (this._writingBuf = se));
    let e = se;
    for (; this._bufs.length || e.length; ) {
      e.length <= 0 && (e = or(this._bufs[0], this._lens[0]));
      try {
        let t = A.writeSync(this.fd, e);
        (e = e.subarray(t)),
          (this._len = Math.max(this._len - t, 0)),
          e.length <= 0 && (this._bufs.shift(), this._lens.shift());
      } catch (t) {
        if ((t.code === 'EAGAIN' || t.code === 'EBUSY') && !this.retryEAGAIN(t, e.length, this._len - e.length))
          throw t;
        Ie(ie);
      }
    }
  }
  I.prototype.destroy = function () {
    this.destroyed || oe(this);
  };
  function fs() {
    let e = this.release;
    if (((this._writing = !0), (this._writingBuf = this._writingBuf || this._bufs.shift() || ''), this.sync))
      try {
        let t = A.writeSync(this.fd, this._writingBuf, 'utf8');
        e(null, t);
      } catch (t) {
        e(t);
      }
    else A.write(this.fd, this._writingBuf, 'utf8', e);
  }
  function us() {
    let e = this.release;
    if (
      ((this._writing = !0),
      (this._writingBuf = this._writingBuf.length ? this._writingBuf : or(this._bufs.shift(), this._lens.shift())),
      this.sync)
    )
      try {
        let t = A.writeSync(this.fd, this._writingBuf);
        e(null, t);
      } catch (t) {
        e(t);
      }
    else A.write(this.fd, this._writingBuf, e);
  }
  function oe(e) {
    if (e.fd === -1) {
      e.once('ready', oe.bind(null, e));
      return;
    }
    (e.destroyed = !0), (e._bufs = []), (e._lens = []), A.fsync(e.fd, t);
    function t() {
      e.fd !== 1 && e.fd !== 2 ? A.close(e.fd, r) : r();
    }
    function r(n) {
      if (n) {
        e.emit('error', n);
        return;
      }
      e._ending && !e._writing && e.emit('finish'), e.emit('close');
    }
  }
  I.SonicBoom = I;
  I.default = I;
  fr.exports = I;
});
var Ne = E(($f, gr) => {
  'use strict';
  var D = { exit: [], beforeExit: [] },
    cr = { exit: as, beforeExit: hs },
    ar = new FinalizationRegistry(ds);
  function cs(e) {
    D[e].length > 0 || process.on(e, cr[e]);
  }
  function hr(e) {
    D[e].length > 0 || process.removeListener(e, cr[e]);
  }
  function as() {
    dr('exit');
  }
  function hs() {
    dr('beforeExit');
  }
  function dr(e) {
    for (let t of D[e]) {
      let r = t.deref(),
        n = t.fn;
      r !== void 0 && n(r, e);
    }
  }
  function ds(e) {
    for (let t of ['exit', 'beforeExit']) {
      let r = D[t].indexOf(e);
      D[t].splice(r, r + 1), hr(t);
    }
  }
  function yr(e, t, r) {
    if (t === void 0) throw new Error("the object can't be undefined");
    cs(e);
    let n = new WeakRef(t);
    (n.fn = r), ar.register(t, n), D[e].push(n);
  }
  function ys(e, t) {
    yr('exit', e, t);
  }
  function gs(e, t) {
    yr('beforeExit', e, t);
  }
  function ms(e) {
    ar.unregister(e);
    for (let t of ['exit', 'beforeExit'])
      (D[t] = D[t].filter((r) => {
        let n = r.deref();
        return n && n !== e;
      })),
        hr(t);
  }
  gr.exports = { register: ys, registerBeforeExit: gs, unregister: ms };
});
var mr = E((Af, ps) => {
  ps.exports = {
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
var br = E((jf, pr) => {
  'use strict';
  function bs(e, t, r, n, i) {
    let o = Date.now() + n,
      f = Atomics.load(e, t);
    if (f === r) {
      i(null, 'ok');
      return;
    }
    let h = f,
      d = (y) => {
        Date.now() > o
          ? i(null, 'timed-out')
          : setTimeout(() => {
              (h = f),
                (f = Atomics.load(e, t)),
                f === h ? d(y >= 1e3 ? 1e3 : y * 2) : f === r ? i(null, 'ok') : i(null, 'not-equal');
            }, y);
      };
    d(1);
  }
  function ws(e, t, r, n, i) {
    let o = Date.now() + n,
      f = Atomics.load(e, t);
    if (f !== r) {
      i(null, 'ok');
      return;
    }
    let h = (d) => {
      Date.now() > o
        ? i(null, 'timed-out')
        : setTimeout(() => {
            (f = Atomics.load(e, t)), f !== r ? i(null, 'ok') : h(d >= 1e3 ? 1e3 : d * 2);
          }, d);
    };
    h(1);
  }
  pr.exports = { wait: bs, waitDiff: ws };
});
var Sr = E((Lf, wr) => {
  'use strict';
  wr.exports = { WRITE_INDEX: 4, READ_INDEX: 8 };
});
var vr = E((Tf, Or) => {
  'use strict';
  var { version: Ss } = mr(),
    { EventEmitter: _s } = require('events'),
    { Worker: Es } = require('worker_threads'),
    { join: xs } = require('path'),
    { pathToFileURL: Os } = require('url'),
    { wait: vs } = br(),
    { WRITE_INDEX: T, READ_INDEX: P } = Sr(),
    $s = require('buffer'),
    As = require('assert'),
    a = Symbol('kImpl'),
    js = $s.constants.MAX_STRING_LENGTH,
    fe = class {
      constructor(t) {
        this._value = t;
      }
      deref() {
        return this._value;
      }
    },
    Ls =
      global.FinalizationRegistry ||
      class {
        register() {}
        unregister() {}
      },
    ks = global.WeakRef || fe,
    _r = new Ls((e) => {
      e.exited || e.terminate();
    });
  function Ts(e, t) {
    let { filename: r, workerData: n } = t,
      o =
        ('__bundlerPathsOverrides' in globalThis ? globalThis.__bundlerPathsOverrides : {})['thread-stream-worker'] ||
        xs(__dirname, 'lib', 'worker.js'),
      f = new Es(o, {
        ...t.workerOpts,
        trackUnmanagedFds: !1,
        workerData: {
          filename: r.indexOf('file://') === 0 ? r : Os(r).href,
          dataBuf: e[a].dataBuf,
          stateBuf: e[a].stateBuf,
          workerData: { $context: { threadStreamVersion: Ss }, ...n },
        },
      });
    return (f.stream = new fe(e)), f.on('message', Rs), f.on('exit', xr), _r.register(e, f), f;
  }
  function Er(e) {
    As(!e[a].sync), e[a].needDrain && ((e[a].needDrain = !1), e.emit('drain'));
  }
  function le(e) {
    let t = Atomics.load(e[a].state, T),
      r = e[a].data.length - t;
    if (r > 0) {
      if (e[a].buf.length === 0) {
        (e[a].flushing = !1), e[a].ending ? Me(e) : e[a].needDrain && process.nextTick(Er, e);
        return;
      }
      let n = e[a].buf.slice(0, r),
        i = Buffer.byteLength(n);
      i <= r
        ? ((e[a].buf = e[a].buf.slice(r)), ue(e, n, le.bind(null, e)))
        : e.flush(() => {
            if (!e.destroyed) {
              for (Atomics.store(e[a].state, P, 0), Atomics.store(e[a].state, T, 0); i > e[a].data.length; )
                (r = r / 2), (n = e[a].buf.slice(0, r)), (i = Buffer.byteLength(n));
              (e[a].buf = e[a].buf.slice(r)), ue(e, n, le.bind(null, e));
            }
          });
    } else if (r === 0) {
      if (t === 0 && e[a].buf.length === 0) return;
      e.flush(() => {
        Atomics.store(e[a].state, P, 0), Atomics.store(e[a].state, T, 0), le(e);
      });
    } else C(e, new Error('overwritten'));
  }
  function Rs(e) {
    let t = this.stream.deref();
    if (t === void 0) {
      (this.exited = !0), this.terminate();
      return;
    }
    switch (e.code) {
      case 'READY':
        (this.stream = new ks(t)),
          t.flush(() => {
            (t[a].ready = !0), t.emit('ready');
          });
        break;
      case 'ERROR':
        C(t, e.err);
        break;
      case 'EVENT':
        Array.isArray(e.args) ? t.emit(e.name, ...e.args) : t.emit(e.name, e.args);
        break;
      default:
        C(t, new Error('this should not happen: ' + e.code));
    }
  }
  function xr(e) {
    let t = this.stream.deref();
    t !== void 0 &&
      (_r.unregister(t),
      (t.worker.exited = !0),
      t.worker.off('exit', xr),
      C(t, e !== 0 ? new Error('the worker thread exited') : null));
  }
  var Ce = class extends _s {
    constructor(t = {}) {
      if ((super(), t.bufferSize < 4)) throw new Error('bufferSize must at least fit a 4-byte utf-8 char');
      (this[a] = {}),
        (this[a].stateBuf = new SharedArrayBuffer(128)),
        (this[a].state = new Int32Array(this[a].stateBuf)),
        (this[a].dataBuf = new SharedArrayBuffer(t.bufferSize || 4 * 1024 * 1024)),
        (this[a].data = Buffer.from(this[a].dataBuf)),
        (this[a].sync = t.sync || !1),
        (this[a].ending = !1),
        (this[a].ended = !1),
        (this[a].needDrain = !1),
        (this[a].destroyed = !1),
        (this[a].flushing = !1),
        (this[a].ready = !1),
        (this[a].finished = !1),
        (this[a].errored = null),
        (this[a].closed = !1),
        (this[a].buf = ''),
        (this.worker = Ts(this, t));
    }
    write(t) {
      if (this[a].destroyed) return De(this, new Error('the worker has exited')), !1;
      if (this[a].ending) return De(this, new Error('the worker is ending')), !1;
      if (this[a].flushing && this[a].buf.length + t.length >= js)
        try {
          Pe(this), (this[a].flushing = !0);
        } catch (r) {
          return C(this, r), !1;
        }
      if (((this[a].buf += t), this[a].sync))
        try {
          return Pe(this), !0;
        } catch (r) {
          return C(this, r), !1;
        }
      return (
        this[a].flushing || ((this[a].flushing = !0), setImmediate(le, this)),
        (this[a].needDrain = this[a].data.length - this[a].buf.length - Atomics.load(this[a].state, T) <= 0),
        !this[a].needDrain
      );
    }
    end() {
      this[a].destroyed || ((this[a].ending = !0), Me(this));
    }
    flush(t) {
      if (this[a].destroyed) {
        typeof t == 'function' && process.nextTick(t, new Error('the worker has exited'));
        return;
      }
      let r = Atomics.load(this[a].state, T);
      vs(this[a].state, P, r, 1 / 0, (n, i) => {
        if (n) {
          C(this, n), process.nextTick(t, n);
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
      this[a].destroyed || (Pe(this), ze(this));
    }
    unref() {
      this.worker.unref();
    }
    ref() {
      this.worker.ref();
    }
    get ready() {
      return this[a].ready;
    }
    get destroyed() {
      return this[a].destroyed;
    }
    get closed() {
      return this[a].closed;
    }
    get writable() {
      return !this[a].destroyed && !this[a].ending;
    }
    get writableEnded() {
      return this[a].ending;
    }
    get writableFinished() {
      return this[a].finished;
    }
    get writableNeedDrain() {
      return this[a].needDrain;
    }
    get writableObjectMode() {
      return !1;
    }
    get writableErrored() {
      return this[a].errored;
    }
  };
  function De(e, t) {
    setImmediate(() => {
      e.emit('error', t);
    });
  }
  function C(e, t) {
    e[a].destroyed ||
      ((e[a].destroyed = !0),
      t && ((e[a].errored = t), De(e, t)),
      e.worker.exited
        ? setImmediate(() => {
            (e[a].closed = !0), e.emit('close');
          })
        : e.worker
            .terminate()
            .catch(() => {})
            .then(() => {
              (e[a].closed = !0), e.emit('close');
            }));
  }
  function ue(e, t, r) {
    let n = Atomics.load(e[a].state, T),
      i = Buffer.byteLength(t);
    return e[a].data.write(t, n), Atomics.store(e[a].state, T, n + i), Atomics.notify(e[a].state, T), r(), !0;
  }
  function Me(e) {
    if (!(e[a].ended || !e[a].ending || e[a].flushing)) {
      e[a].ended = !0;
      try {
        e.flushSync();
        let t = Atomics.load(e[a].state, P);
        Atomics.store(e[a].state, T, -1), Atomics.notify(e[a].state, T);
        let r = 0;
        for (; t !== -1; ) {
          if ((Atomics.wait(e[a].state, P, t, 1e3), (t = Atomics.load(e[a].state, P)), t === -2)) {
            C(e, new Error('end() failed'));
            return;
          }
          if (++r === 10) {
            C(e, new Error('end() took too long (10s)'));
            return;
          }
        }
        process.nextTick(() => {
          (e[a].finished = !0), e.emit('finish');
        });
      } catch (t) {
        C(e, t);
      }
    }
  }
  function Pe(e) {
    let t = () => {
      e[a].ending ? Me(e) : e[a].needDrain && process.nextTick(Er, e);
    };
    for (e[a].flushing = !1; e[a].buf.length !== 0; ) {
      let r = Atomics.load(e[a].state, T),
        n = e[a].data.length - r;
      if (n === 0) {
        ze(e), Atomics.store(e[a].state, P, 0), Atomics.store(e[a].state, T, 0);
        continue;
      } else if (n < 0) throw new Error('overwritten');
      let i = e[a].buf.slice(0, n),
        o = Buffer.byteLength(i);
      if (o <= n) (e[a].buf = e[a].buf.slice(n)), ue(e, i, t);
      else {
        for (ze(e), Atomics.store(e[a].state, P, 0), Atomics.store(e[a].state, T, 0); o > e[a].buf.length; )
          (n = n / 2), (i = e[a].buf.slice(0, n)), (o = Buffer.byteLength(i));
        (e[a].buf = e[a].buf.slice(n)), ue(e, i, t);
      }
    }
  }
  function ze(e) {
    if (e[a].flushing) throw new Error('unable to flush while flushing');
    let t = Atomics.load(e[a].state, T),
      r = 0;
    for (;;) {
      let n = Atomics.load(e[a].state, P);
      if (n === -2) throw Error('_flushSync failed');
      if (n !== t) Atomics.wait(e[a].state, P, n, 1e3);
      else break;
      if (++r === 10) throw new Error('_flushSync took too long (10s)');
    }
  }
  Or.exports = Ce;
});
var Ke = E((Rf, $r) => {
  'use strict';
  var { createRequire: Bs } = require('module'),
    qs = $e(),
    { join: We, isAbsolute: Is, sep: Ns } = require('path'),
    Ps = qe(),
    Fe = Ne(),
    Cs = vr();
  function Ds(e) {
    Fe.register(e, Ms),
      Fe.registerBeforeExit(e, Ws),
      e.on('close', function () {
        Fe.unregister(e);
      });
  }
  function zs(e, t, r) {
    let n = new Cs({ filename: e, workerData: t, workerOpts: r });
    n.on('ready', i),
      n.on('close', function () {
        process.removeListener('exit', o);
      }),
      process.on('exit', o);
    function i() {
      process.removeListener('exit', o), n.unref(), r.autoEnd !== !1 && Ds(n);
    }
    function o() {
      n.closed || (n.flushSync(), Ps(100), n.end());
    }
    return n;
  }
  function Ms(e) {
    e.ref(),
      e.flushSync(),
      e.end(),
      e.once('close', function () {
        e.unref();
      });
  }
  function Ws(e) {
    e.flushSync();
  }
  function Fs(e) {
    let { pipeline: t, targets: r, levels: n, dedupe: i, options: o = {}, worker: f = {}, caller: h = qs() } = e,
      d = typeof h == 'string' ? [h] : h,
      y = '__bundlerPathsOverrides' in globalThis ? globalThis.__bundlerPathsOverrides : {},
      l = e.target;
    if (l && r) throw new Error('only one of target or targets can be specified');
    return (
      r
        ? ((l = y['pino-worker'] || We(__dirname, 'worker.js')),
          (o.targets = r.map((g) => ({ ...g, target: c(g.target) }))))
        : t &&
          ((l = y['pino-pipeline-worker'] || We(__dirname, 'worker-pipeline.js')),
          (o.targets = t.map((g) => ({ ...g, target: c(g.target) })))),
      n && (o.levels = n),
      i && (o.dedupe = i),
      zs(c(l), o, f)
    );
    function c(g) {
      if (((g = y[g] || g), Is(g) || g.indexOf('file://') === 0)) return g;
      if (g === 'pino/file') return We(__dirname, '..', 'file.js');
      let s;
      for (let u of d)
        try {
          let p = u === 'node:repl' ? process.cwd() + Ns : u;
          s = Bs(p).resolve(g);
          break;
        } catch {
          continue;
        }
      if (!s) throw new Error(`unable to determine transport target for "${g}"`);
      return s;
    }
  }
  $r.exports = Fs;
});
var he = E((Bf, Pr) => {
  'use strict';
  var Ar = tr(),
    { mapHttpRequest: Ks, mapHttpResponse: Vs } = ve(),
    Je = ur(),
    jr = Ne(),
    {
      lsCacheSym: Js,
      chindingsSym: Tr,
      writeSym: Lr,
      serializersSym: Rr,
      formatOptsSym: kr,
      endSym: Us,
      stringifiersSym: Br,
      stringifySym: qr,
      stringifySafeSym: Ue,
      wildcardFirstSym: Ir,
      nestedKeySym: Gs,
      formattersSym: Nr,
      messageKeySym: Hs,
      errorKeySym: Xs,
      nestedKeyStrSym: Ys,
      msgPrefixSym: ce,
    } = U(),
    { isMainThread: Qs } = require('worker_threads'),
    Zs = Ke();
  function G() {}
  function eo(e, t) {
    if (!t) return r;
    return function (...i) {
      t.call(this, i, r, e);
    };
    function r(n, ...i) {
      if (typeof n == 'object') {
        let o = n;
        n !== null &&
          (n.method && n.headers && n.socket ? (n = Ks(n)) : typeof n.setHeader == 'function' && (n = Vs(n)));
        let f;
        o === null && i.length === 0 ? (f = [null]) : ((o = i.shift()), (f = i)),
          typeof this[ce] == 'string' && o !== void 0 && o !== null && (o = this[ce] + o),
          this[Lr](n, Ar(o, f, this[kr]), e);
      } else {
        let o = n === void 0 ? i.shift() : n;
        typeof this[ce] == 'string' && o !== void 0 && o !== null && (o = this[ce] + o),
          this[Lr](null, Ar(o, i, this[kr]), e);
      }
    }
  }
  function Ve(e) {
    let t = '',
      r = 0,
      n = !1,
      i = 255,
      o = e.length;
    if (o > 100) return JSON.stringify(e);
    for (var f = 0; f < o && i >= 32; f++)
      (i = e.charCodeAt(f)), (i === 34 || i === 92) && ((t += e.slice(r, f) + '\\'), (r = f), (n = !0));
    return n ? (t += e.slice(r)) : (t = e), i < 32 ? JSON.stringify(e) : '"' + t + '"';
  }
  function to(e, t, r, n) {
    let i = this[qr],
      o = this[Ue],
      f = this[Br],
      h = this[Us],
      d = this[Tr],
      y = this[Rr],
      l = this[Nr],
      c = this[Hs],
      g = this[Xs],
      s = this[Js][r] + n;
    s = s + d;
    let u;
    l.log && (e = l.log(e));
    let p = f[Ir],
      b = '';
    for (let m in e)
      if (((u = e[m]), Object.prototype.hasOwnProperty.call(e, m) && u !== void 0)) {
        y[m] ? (u = y[m](u)) : m === g && y.err && (u = y.err(u));
        let S = f[m] || p;
        switch (typeof u) {
          case 'undefined':
          case 'function':
            continue;
          case 'number':
            Number.isFinite(u) === !1 && (u = null);
          case 'boolean':
            S && (u = S(u));
            break;
          case 'string':
            u = (S || Ve)(u);
            break;
          default:
            u = (S || i)(u, o);
        }
        if (u === void 0) continue;
        let _ = Ve(m);
        b += ',' + _ + ':' + u;
      }
    let w = '';
    if (t !== void 0) {
      u = y[c] ? y[c](t) : t;
      let m = f[c] || p;
      switch (typeof u) {
        case 'function':
          break;
        case 'number':
          Number.isFinite(u) === !1 && (u = null);
        case 'boolean':
          m && (u = m(u)), (w = ',"' + c + '":' + u);
          break;
        case 'string':
          (u = (m || Ve)(u)), (w = ',"' + c + '":' + u);
          break;
        default:
          (u = (m || i)(u, o)), (w = ',"' + c + '":' + u);
      }
    }
    return this[Gs] && b ? s + this[Ys] + b.slice(1) + '}' + w + h : s + b + w + h;
  }
  function ro(e, t) {
    let r,
      n = e[Tr],
      i = e[qr],
      o = e[Ue],
      f = e[Br],
      h = f[Ir],
      d = e[Rr],
      y = e[Nr].bindings;
    t = y(t);
    for (let l in t)
      if (
        ((r = t[l]),
        (l !== 'level' &&
          l !== 'serializers' &&
          l !== 'formatters' &&
          l !== 'customLevels' &&
          t.hasOwnProperty(l) &&
          r !== void 0) === !0)
      ) {
        if (((r = d[l] ? d[l](r) : r), (r = (f[l] || h || i)(r, o)), r === void 0)) continue;
        n += ',"' + l + '":' + r;
      }
    return n;
  }
  function no(e) {
    return e.write !== e.constructor.prototype.write;
  }
  var io = process.env.NODE_V8_COVERAGE || process.env.V8_COVERAGE;
  function ae(e) {
    let t = new Je(e);
    return (
      t.on('error', r),
      !io &&
        !e.sync &&
        Qs &&
        (jr.register(t, so),
        t.on('close', function () {
          jr.unregister(t);
        })),
      t
    );
    function r(n) {
      if (n.code === 'EPIPE') {
        (t.write = G), (t.end = G), (t.flushSync = G), (t.destroy = G);
        return;
      }
      t.removeListener('error', r), t.emit('error', n);
    }
  }
  function so(e, t) {
    e.destroyed ||
      (t === 'beforeExit'
        ? (e.flush(),
          e.on('drain', function () {
            e.end();
          }))
        : e.flushSync());
  }
  function oo(e) {
    return function (r, n, i = {}, o) {
      if (typeof i == 'string') (o = ae({ dest: i })), (i = {});
      else if (typeof o == 'string') {
        if (i && i.transport) throw Error('only one of option.transport or stream can be specified');
        o = ae({ dest: o });
      } else if (i instanceof Je || i.writable || i._writableState) (o = i), (i = {});
      else if (i.transport) {
        if (i.transport instanceof Je || i.transport.writable || i.transport._writableState)
          throw Error('option.transport do not allow stream, please pass to option directly. e.g. pino(transport)');
        if (
          i.transport.targets &&
          i.transport.targets.length &&
          i.formatters &&
          typeof i.formatters.level == 'function'
        )
          throw Error('option.transport.targets do not allow custom level formatters');
        let d;
        i.customLevels && (d = i.useOnlyCustomLevels ? i.customLevels : Object.assign({}, i.levels, i.customLevels)),
          (o = Zs({ caller: n, ...i.transport, levels: d }));
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
      let { enabled: f, onChild: h } = i;
      return (
        f === !1 && (i.level = 'silent'),
        h || (i.onChild = G),
        o || (no(process.stdout) ? (o = process.stdout) : (o = ae({ fd: process.stdout.fd || 1 }))),
        { opts: i, stream: o }
      );
    };
  }
  function lo(e, t) {
    try {
      return JSON.stringify(e);
    } catch {
      try {
        return (t || this[Ue])(e);
      } catch {
        return '"[unable to serialize, circular reference is too complex to analyze]"';
      }
    }
  }
  function fo(e, t, r) {
    return { level: e, bindings: t, log: r };
  }
  function uo(e) {
    let t = Number(e);
    return typeof e == 'string' && Number.isFinite(t) ? t : e === void 0 ? 1 : e;
  }
  Pr.exports = {
    noop: G,
    buildSafeSonicBoom: ae,
    asChindings: ro,
    asJson: to,
    genLog: eo,
    createArgsNormalizer: oo,
    stringify: lo,
    buildFormatters: fo,
    normalizeDestFileDescriptor: uo,
  };
});
var de = E((qf, Dr) => {
  'use strict';
  var {
      lsCacheSym: co,
      levelValSym: Ge,
      useOnlyCustomLevelsSym: ao,
      streamSym: ho,
      formattersSym: yo,
      hooksSym: go,
    } = U(),
    { noop: mo, genLog: W } = he(),
    N = { trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60 },
    Cr = {
      fatal: (e) => {
        let t = W(N.fatal, e);
        return function (...r) {
          let n = this[ho];
          if ((t.call(this, ...r), typeof n.flushSync == 'function'))
            try {
              n.flushSync();
            } catch {}
        };
      },
      error: (e) => W(N.error, e),
      warn: (e) => W(N.warn, e),
      info: (e) => W(N.info, e),
      debug: (e) => W(N.debug, e),
      trace: (e) => W(N.trace, e),
    },
    He = Object.keys(N).reduce((e, t) => ((e[N[t]] = t), e), {}),
    po = Object.keys(He).reduce((e, t) => ((e[t] = '{"level":' + Number(t)), e), {});
  function bo(e) {
    let t = e[yo].level,
      { labels: r } = e.levels,
      n = {};
    for (let i in r) {
      let o = t(r[i], Number(i));
      n[i] = JSON.stringify(o).slice(0, -1);
    }
    return (e[co] = n), e;
  }
  function wo(e, t) {
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
  function So(e) {
    let { labels: t, values: r } = this.levels;
    if (typeof e == 'number') {
      if (t[e] === void 0) throw Error('unknown level value' + e);
      e = t[e];
    }
    if (r[e] === void 0) throw Error('unknown level ' + e);
    let n = this[Ge],
      i = (this[Ge] = r[e]),
      o = this[ao],
      f = this[go].logMethod;
    for (let h in r) {
      if (i > r[h]) {
        this[h] = mo;
        continue;
      }
      this[h] = wo(h, o) ? Cr[h](f) : W(r[h], f);
    }
    this.emit('level-change', e, i, t[n], n, this);
  }
  function _o(e) {
    let { levels: t, levelVal: r } = this;
    return t && t.labels ? t.labels[r] : '';
  }
  function Eo(e) {
    let { values: t } = this.levels,
      r = t[e];
    return r !== void 0 && r >= this[Ge];
  }
  function xo(e = null, t = !1) {
    let r = e ? Object.keys(e).reduce((o, f) => ((o[e[f]] = f), o), {}) : null,
      n = Object.assign(Object.create(Object.prototype, { Infinity: { value: 'silent' } }), t ? null : He, r),
      i = Object.assign(Object.create(Object.prototype, { silent: { value: 1 / 0 } }), t ? null : N, e);
    return { labels: n, values: i };
  }
  function Oo(e, t, r) {
    if (typeof e == 'number') {
      if (
        ![]
          .concat(
            Object.keys(t || {}).map((o) => t[o]),
            r ? [] : Object.keys(He).map((o) => +o),
            1 / 0
          )
          .includes(e)
      )
        throw Error(`default level:${e} must be included in custom levels`);
      return;
    }
    let n = Object.assign(Object.create(Object.prototype, { silent: { value: 1 / 0 } }), r ? null : N, t);
    if (!(e in n)) throw Error(`default level:${e} must be included in custom levels`);
  }
  function vo(e, t) {
    let { labels: r, values: n } = e;
    for (let i in t) {
      if (i in n) throw Error('levels cannot be overridden');
      if (t[i] in r) throw Error('pre-existing level values cannot be used for new levels');
    }
  }
  Dr.exports = {
    initialLsCache: po,
    genLsCache: bo,
    levelMethods: Cr,
    getLevel: _o,
    setLevel: So,
    isLevelEnabled: Eo,
    mappings: xo,
    levels: N,
    assertNoLevelCollisions: vo,
    assertDefaultLevelFound: Oo,
  };
});
var Xe = E((If, zr) => {
  'use strict';
  zr.exports = { version: '8.16.2' };
});
var Yr = E((Pf, Xr) => {
  'use strict';
  var { EventEmitter: $o } = require('events'),
    {
      lsCacheSym: Ao,
      levelValSym: jo,
      setLevelSym: Qe,
      getLevelSym: Mr,
      chindingsSym: Ze,
      parsedChindingsSym: Lo,
      mixinSym: ko,
      asJsonSym: Jr,
      writeSym: To,
      mixinMergeStrategySym: Ro,
      timeSym: Bo,
      timeSliceIndexSym: qo,
      streamSym: Ur,
      serializersSym: F,
      formattersSym: Ye,
      errorKeySym: Io,
      messageKeySym: No,
      useOnlyCustomLevelsSym: Po,
      needsMetadataGsym: Co,
      redactFmtSym: Do,
      stringifySym: zo,
      formatOptsSym: Mo,
      stringifiersSym: Wo,
      msgPrefixSym: Wr,
    } = U(),
    {
      getLevel: Fo,
      setLevel: Ko,
      isLevelEnabled: Vo,
      mappings: Jo,
      initialLsCache: Uo,
      genLsCache: Go,
      assertNoLevelCollisions: Ho,
    } = de(),
    { asChindings: Gr, asJson: Xo, buildFormatters: Fr, stringify: Kr } = he(),
    { version: Yo } = Xe(),
    Qo = Re(),
    Zo = class {},
    Hr = {
      constructor: Zo,
      child: el,
      bindings: tl,
      setBindings: rl,
      flush: ol,
      isLevelEnabled: Vo,
      version: Yo,
      get level() {
        return this[Mr]();
      },
      set level(e) {
        this[Qe](e);
      },
      get levelVal() {
        return this[jo];
      },
      set levelVal(e) {
        throw Error('levelVal is read-only');
      },
      [Ao]: Uo,
      [To]: il,
      [Jr]: Xo,
      [Mr]: Fo,
      [Qe]: Ko,
    };
  Object.setPrototypeOf(Hr, $o.prototype);
  Xr.exports = function () {
    return Object.create(Hr);
  };
  var Vr = (e) => e;
  function el(e, t) {
    if (!e) throw Error('missing bindings for child Pino');
    t = t || {};
    let r = this[F],
      n = this[Ye],
      i = Object.create(this);
    if (t.hasOwnProperty('serializers') === !0) {
      i[F] = Object.create(null);
      for (let l in r) i[F][l] = r[l];
      let d = Object.getOwnPropertySymbols(r);
      for (var o = 0; o < d.length; o++) {
        let l = d[o];
        i[F][l] = r[l];
      }
      for (let l in t.serializers) i[F][l] = t.serializers[l];
      let y = Object.getOwnPropertySymbols(t.serializers);
      for (var f = 0; f < y.length; f++) {
        let l = y[f];
        i[F][l] = t.serializers[l];
      }
    } else i[F] = r;
    if (t.hasOwnProperty('formatters')) {
      let { level: d, bindings: y, log: l } = t.formatters;
      i[Ye] = Fr(d || n.level, y || Vr, l || n.log);
    } else i[Ye] = Fr(n.level, Vr, n.log);
    if (
      (t.hasOwnProperty('customLevels') === !0 &&
        (Ho(this.levels, t.customLevels), (i.levels = Jo(t.customLevels, i[Po])), Go(i)),
      (typeof t.redact == 'object' && t.redact !== null) || Array.isArray(t.redact))
    ) {
      i.redact = t.redact;
      let d = Qo(i.redact, Kr),
        y = { stringify: d[Do] };
      (i[zo] = Kr), (i[Wo] = d), (i[Mo] = y);
    }
    typeof t.msgPrefix == 'string' && (i[Wr] = (this[Wr] || '') + t.msgPrefix), (i[Ze] = Gr(i, e));
    let h = t.level || this.level;
    return i[Qe](h), this.onChild(i), i;
  }
  function tl() {
    let t = `{${this[Ze].substr(1)}}`,
      r = JSON.parse(t);
    return delete r.pid, delete r.hostname, r;
  }
  function rl(e) {
    let t = Gr(this, e);
    (this[Ze] = t), delete this[Lo];
  }
  function nl(e, t) {
    return Object.assign(t, e);
  }
  function il(e, t, r) {
    let n = this[Bo](),
      i = this[ko],
      o = this[Io],
      f = this[No],
      h = this[Ro] || nl,
      d;
    e == null
      ? (d = {})
      : e instanceof Error
      ? ((d = { [o]: e }), t === void 0 && (t = e.message))
      : ((d = e), t === void 0 && e[f] === void 0 && e[o] && (t = e[o].message)),
      i && (d = h(d, i(d, r, this)));
    let y = this[Jr](d, t, r, n),
      l = this[Ur];
    l[Co] === !0 &&
      ((l.lastLevel = r), (l.lastObj = d), (l.lastMsg = t), (l.lastTime = n.slice(this[qo])), (l.lastLogger = this)),
      l.write(y);
  }
  function sl() {}
  function ol(e) {
    if (e != null && typeof e != 'function') throw Error('callback must be a function');
    let t = this[Ur];
    typeof t.flush == 'function' ? t.flush(e || sl) : e && e();
  }
});
var rn = E((nt, tn) => {
  'use strict';
  var { hasOwnProperty: ye } = Object.prototype,
    V = rt();
  V.configure = rt;
  V.stringify = V;
  V.default = V;
  nt.stringify = V;
  nt.configure = rt;
  tn.exports = V;
  var ll =
    /[\u0000-\u001f\u0022\u005c\ud800-\udfff]|[\ud800-\udbff](?![\udc00-\udfff])|(?:[^\ud800-\udbff]|^)[\udc00-\udfff]/;
  function z(e) {
    return e.length < 5e3 && !ll.test(e) ? `"${e}"` : JSON.stringify(e);
  }
  function et(e) {
    if (e.length > 200) return e.sort();
    for (let t = 1; t < e.length; t++) {
      let r = e[t],
        n = t;
      for (; n !== 0 && e[n - 1] > r; ) (e[n] = e[n - 1]), n--;
      e[n] = r;
    }
    return e;
  }
  var fl = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(Object.getPrototypeOf(new Int8Array())),
    Symbol.toStringTag
  ).get;
  function tt(e) {
    return fl.call(e) !== void 0 && e.length !== 0;
  }
  function Qr(e, t, r) {
    e.length < r && (r = e.length);
    let n = t === ',' ? '' : ' ',
      i = `"0":${n}${e[0]}`;
    for (let o = 1; o < r; o++) i += `${t}"${o}":${n}${e[o]}`;
    return i;
  }
  function ul(e) {
    if (ye.call(e, 'circularValue')) {
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
  function Zr(e, t) {
    let r;
    if (ye.call(e, t) && ((r = e[t]), typeof r != 'boolean'))
      throw new TypeError(`The "${t}" argument must be of type boolean`);
    return r === void 0 ? !0 : r;
  }
  function en(e, t) {
    let r;
    if (ye.call(e, t)) {
      if (((r = e[t]), typeof r != 'number')) throw new TypeError(`The "${t}" argument must be of type number`);
      if (!Number.isInteger(r)) throw new TypeError(`The "${t}" argument must be an integer`);
      if (r < 1) throw new RangeError(`The "${t}" argument must be >= 1`);
    }
    return r === void 0 ? 1 / 0 : r;
  }
  function K(e) {
    return e === 1 ? '1 item' : `${e} items`;
  }
  function cl(e) {
    let t = new Set();
    for (let r of e) (typeof r == 'string' || typeof r == 'number') && t.add(String(r));
    return t;
  }
  function al(e) {
    if (ye.call(e, 'strict')) {
      let t = e.strict;
      if (typeof t != 'boolean') throw new TypeError('The "strict" argument must be of type boolean');
      if (t)
        return (r) => {
          let n = `Object can not safely be stringified. Received type ${typeof r}`;
          throw (typeof r != 'function' && (n += ` (${r.toString()})`), new Error(n));
        };
    }
  }
  function rt(e) {
    e = { ...e };
    let t = al(e);
    t && (e.bigint === void 0 && (e.bigint = !1), 'circularValue' in e || (e.circularValue = Error));
    let r = ul(e),
      n = Zr(e, 'bigint'),
      i = Zr(e, 'deterministic'),
      o = en(e, 'maximumDepth'),
      f = en(e, 'maximumBreadth');
    function h(g, s, u, p, b, w) {
      let m = s[g];
      switch (
        (typeof m == 'object' && m !== null && typeof m.toJSON == 'function' && (m = m.toJSON(g)),
        (m = p.call(s, g, m)),
        typeof m)
      ) {
        case 'string':
          return z(m);
        case 'object': {
          if (m === null) return 'null';
          if (u.indexOf(m) !== -1) return r;
          let S = '',
            _ = ',',
            O = w;
          if (Array.isArray(m)) {
            if (m.length === 0) return '[]';
            if (o < u.length + 1) return '"[Array]"';
            u.push(m),
              b !== '' &&
                ((w += b),
                (S += `
${w}`),
                (_ = `,
${w}`));
            let L = Math.min(m.length, f),
              R = 0;
            for (; R < L - 1; R++) {
              let M = h(String(R), m, u, p, b, w);
              (S += M !== void 0 ? M : 'null'), (S += _);
            }
            let B = h(String(R), m, u, p, b, w);
            if (((S += B !== void 0 ? B : 'null'), m.length - 1 > f)) {
              let M = m.length - f - 1;
              S += `${_}"... ${K(M)} not stringified"`;
            }
            return (
              b !== '' &&
                (S += `
${O}`),
              u.pop(),
              `[${S}]`
            );
          }
          let $ = Object.keys(m),
            v = $.length;
          if (v === 0) return '{}';
          if (o < u.length + 1) return '"[Object]"';
          let x = '',
            j = '';
          b !== '' &&
            ((w += b),
            (_ = `,
${w}`),
            (x = ' '));
          let k = Math.min(v, f);
          i && !tt(m) && ($ = et($)), u.push(m);
          for (let L = 0; L < k; L++) {
            let R = $[L],
              B = h(R, m, u, p, b, w);
            B !== void 0 && ((S += `${j}${z(R)}:${x}${B}`), (j = _));
          }
          if (v > f) {
            let L = v - f;
            (S += `${j}"...":${x}"${K(L)} not stringified"`), (j = _);
          }
          return (
            b !== '' &&
              j.length > 1 &&
              (S = `
${w}${S}
${O}`),
            u.pop(),
            `{${S}}`
          );
        }
        case 'number':
          return isFinite(m) ? String(m) : t ? t(m) : 'null';
        case 'boolean':
          return m === !0 ? 'true' : 'false';
        case 'undefined':
          return;
        case 'bigint':
          if (n) return String(m);
        default:
          return t ? t(m) : void 0;
      }
    }
    function d(g, s, u, p, b, w) {
      switch ((typeof s == 'object' && s !== null && typeof s.toJSON == 'function' && (s = s.toJSON(g)), typeof s)) {
        case 'string':
          return z(s);
        case 'object': {
          if (s === null) return 'null';
          if (u.indexOf(s) !== -1) return r;
          let m = w,
            S = '',
            _ = ',';
          if (Array.isArray(s)) {
            if (s.length === 0) return '[]';
            if (o < u.length + 1) return '"[Array]"';
            u.push(s),
              b !== '' &&
                ((w += b),
                (S += `
${w}`),
                (_ = `,
${w}`));
            let v = Math.min(s.length, f),
              x = 0;
            for (; x < v - 1; x++) {
              let k = d(String(x), s[x], u, p, b, w);
              (S += k !== void 0 ? k : 'null'), (S += _);
            }
            let j = d(String(x), s[x], u, p, b, w);
            if (((S += j !== void 0 ? j : 'null'), s.length - 1 > f)) {
              let k = s.length - f - 1;
              S += `${_}"... ${K(k)} not stringified"`;
            }
            return (
              b !== '' &&
                (S += `
${m}`),
              u.pop(),
              `[${S}]`
            );
          }
          u.push(s);
          let O = '';
          b !== '' &&
            ((w += b),
            (_ = `,
${w}`),
            (O = ' '));
          let $ = '';
          for (let v of p) {
            let x = d(v, s[v], u, p, b, w);
            x !== void 0 && ((S += `${$}${z(v)}:${O}${x}`), ($ = _));
          }
          return (
            b !== '' &&
              $.length > 1 &&
              (S = `
${w}${S}
${m}`),
            u.pop(),
            `{${S}}`
          );
        }
        case 'number':
          return isFinite(s) ? String(s) : t ? t(s) : 'null';
        case 'boolean':
          return s === !0 ? 'true' : 'false';
        case 'undefined':
          return;
        case 'bigint':
          if (n) return String(s);
        default:
          return t ? t(s) : void 0;
      }
    }
    function y(g, s, u, p, b) {
      switch (typeof s) {
        case 'string':
          return z(s);
        case 'object': {
          if (s === null) return 'null';
          if (typeof s.toJSON == 'function') {
            if (((s = s.toJSON(g)), typeof s != 'object')) return y(g, s, u, p, b);
            if (s === null) return 'null';
          }
          if (u.indexOf(s) !== -1) return r;
          let w = b;
          if (Array.isArray(s)) {
            if (s.length === 0) return '[]';
            if (o < u.length + 1) return '"[Array]"';
            u.push(s), (b += p);
            let x = `
${b}`,
              j = `,
${b}`,
              k = Math.min(s.length, f),
              L = 0;
            for (; L < k - 1; L++) {
              let B = y(String(L), s[L], u, p, b);
              (x += B !== void 0 ? B : 'null'), (x += j);
            }
            let R = y(String(L), s[L], u, p, b);
            if (((x += R !== void 0 ? R : 'null'), s.length - 1 > f)) {
              let B = s.length - f - 1;
              x += `${j}"... ${K(B)} not stringified"`;
            }
            return (
              (x += `
${w}`),
              u.pop(),
              `[${x}]`
            );
          }
          let m = Object.keys(s),
            S = m.length;
          if (S === 0) return '{}';
          if (o < u.length + 1) return '"[Object]"';
          b += p;
          let _ = `,
${b}`,
            O = '',
            $ = '',
            v = Math.min(S, f);
          tt(s) && ((O += Qr(s, _, f)), (m = m.slice(s.length)), (v -= s.length), ($ = _)), i && (m = et(m)), u.push(s);
          for (let x = 0; x < v; x++) {
            let j = m[x],
              k = y(j, s[j], u, p, b);
            k !== void 0 && ((O += `${$}${z(j)}: ${k}`), ($ = _));
          }
          if (S > f) {
            let x = S - f;
            (O += `${$}"...": "${K(x)} not stringified"`), ($ = _);
          }
          return (
            $ !== '' &&
              (O = `
${b}${O}
${w}`),
            u.pop(),
            `{${O}}`
          );
        }
        case 'number':
          return isFinite(s) ? String(s) : t ? t(s) : 'null';
        case 'boolean':
          return s === !0 ? 'true' : 'false';
        case 'undefined':
          return;
        case 'bigint':
          if (n) return String(s);
        default:
          return t ? t(s) : void 0;
      }
    }
    function l(g, s, u) {
      switch (typeof s) {
        case 'string':
          return z(s);
        case 'object': {
          if (s === null) return 'null';
          if (typeof s.toJSON == 'function') {
            if (((s = s.toJSON(g)), typeof s != 'object')) return l(g, s, u);
            if (s === null) return 'null';
          }
          if (u.indexOf(s) !== -1) return r;
          let p = '';
          if (Array.isArray(s)) {
            if (s.length === 0) return '[]';
            if (o < u.length + 1) return '"[Array]"';
            u.push(s);
            let _ = Math.min(s.length, f),
              O = 0;
            for (; O < _ - 1; O++) {
              let v = l(String(O), s[O], u);
              (p += v !== void 0 ? v : 'null'), (p += ',');
            }
            let $ = l(String(O), s[O], u);
            if (((p += $ !== void 0 ? $ : 'null'), s.length - 1 > f)) {
              let v = s.length - f - 1;
              p += `,"... ${K(v)} not stringified"`;
            }
            return u.pop(), `[${p}]`;
          }
          let b = Object.keys(s),
            w = b.length;
          if (w === 0) return '{}';
          if (o < u.length + 1) return '"[Object]"';
          let m = '',
            S = Math.min(w, f);
          tt(s) && ((p += Qr(s, ',', f)), (b = b.slice(s.length)), (S -= s.length), (m = ',')),
            i && (b = et(b)),
            u.push(s);
          for (let _ = 0; _ < S; _++) {
            let O = b[_],
              $ = l(O, s[O], u);
            $ !== void 0 && ((p += `${m}${z(O)}:${$}`), (m = ','));
          }
          if (w > f) {
            let _ = w - f;
            p += `${m}"...":"${K(_)} not stringified"`;
          }
          return u.pop(), `{${p}}`;
        }
        case 'number':
          return isFinite(s) ? String(s) : t ? t(s) : 'null';
        case 'boolean':
          return s === !0 ? 'true' : 'false';
        case 'undefined':
          return;
        case 'bigint':
          if (n) return String(s);
        default:
          return t ? t(s) : void 0;
      }
    }
    function c(g, s, u) {
      if (arguments.length > 1) {
        let p = '';
        if (
          (typeof u == 'number' ? (p = ' '.repeat(Math.min(u, 10))) : typeof u == 'string' && (p = u.slice(0, 10)),
          s != null)
        ) {
          if (typeof s == 'function') return h('', { '': g }, [], s, p, '');
          if (Array.isArray(s)) return d('', g, [], cl(s), p, '');
        }
        if (p.length !== 0) return y('', g, [], p, '');
      }
      return l('', g, []);
    }
    return c;
  }
});
var on = E((Cf, sn) => {
  'use strict';
  var it = Symbol.for('pino.metadata'),
    { levels: nn } = de(),
    hl = nn.info;
  function dl(e, t) {
    let r = 0;
    (e = e || []), (t = t || { dedupe: !1 });
    let n = Object.create(nn);
    (n.silent = 1 / 0),
      t.levels &&
        typeof t.levels == 'object' &&
        Object.keys(t.levels).forEach((l) => {
          n[l] = t.levels[l];
        });
    let i = { write: o, add: h, flushSync: f, end: d, minLevel: 0, streams: [], clone: y, [it]: !0, streamLevels: n };
    return Array.isArray(e) ? e.forEach(h, i) : h.call(i, e), (e = null), i;
    function o(l) {
      let c,
        g = this.lastLevel,
        { streams: s } = this,
        u = 0,
        p;
      for (let b = gl(s.length, t.dedupe); pl(b, s.length, t.dedupe); b = ml(b, t.dedupe))
        if (((c = s[b]), c.level <= g)) {
          if (u !== 0 && u !== c.level) break;
          if (((p = c.stream), p[it])) {
            let { lastTime: w, lastMsg: m, lastObj: S, lastLogger: _ } = this;
            (p.lastLevel = g), (p.lastTime = w), (p.lastMsg = m), (p.lastObj = S), (p.lastLogger = _);
          }
          p.write(l), t.dedupe && (u = c.level);
        } else if (!t.dedupe) break;
    }
    function f() {
      for (let { stream: l } of this.streams) typeof l.flushSync == 'function' && l.flushSync();
    }
    function h(l) {
      if (!l) return i;
      let c = typeof l.write == 'function' || l.stream,
        g = l.write ? l : l.stream;
      if (!c) throw Error('stream object needs to implement either StreamEntry or DestinationStream interface');
      let { streams: s, streamLevels: u } = this,
        p;
      typeof l.levelVal == 'number'
        ? (p = l.levelVal)
        : typeof l.level == 'string'
        ? (p = u[l.level])
        : typeof l.level == 'number'
        ? (p = l.level)
        : (p = hl);
      let b = { stream: g, level: p, levelVal: void 0, id: r++ };
      return s.unshift(b), s.sort(yl), (this.minLevel = s[0].level), i;
    }
    function d() {
      for (let { stream: l } of this.streams) typeof l.flushSync == 'function' && l.flushSync(), l.end();
    }
    function y(l) {
      let c = new Array(this.streams.length);
      for (let g = 0; g < c.length; g++) c[g] = { level: l, stream: this.streams[g].stream };
      return { write: o, add: h, minLevel: l, streams: c, clone: y, flushSync: f, [it]: !0 };
    }
  }
  function yl(e, t) {
    return e.level - t.level;
  }
  function gl(e, t) {
    return t ? e - 1 : 0;
  }
  function ml(e, t) {
    return t ? e - 1 : e + 1;
  }
  function pl(e, t, r) {
    return r ? e >= 0 : e < t;
  }
  sn.exports = dl;
});
var wn = E((Df, q) => {
  function X(e) {
    try {
      return require('path').join(`${process.cwd()}${require('path').sep}dist`.replace(/\\/g, '/'), e);
    } catch {
      return new Function('p', 'return new URL(p, import.meta.url).pathname')(e);
    }
  }
  globalThis.__bundlerPathsOverrides = {
    ...(globalThis.__bundlerPathsOverrides || {}),
    'thread-stream-worker': X('./thread-stream-worker.js'),
    'pino-worker': X('./pino-worker.js'),
    'pino-pipeline-worker': X('./pino-pipeline-worker.js'),
    'pino/file': X('./pino-file.js'),
    'pino-pretty': X('./pino-pretty.js'),
  };
  var bl = require('os'),
    yn = ve(),
    wl = $e(),
    Sl = Re(),
    gn = Zt(),
    _l = Yr(),
    mn = U(),
    { configure: El } = rn(),
    { assertDefaultLevelFound: xl, mappings: pn, genLsCache: Ol, levels: vl } = de(),
    {
      createArgsNormalizer: $l,
      asChindings: Al,
      buildSafeSonicBoom: ln,
      buildFormatters: jl,
      stringify: st,
      normalizeDestFileDescriptor: fn,
      noop: Ll,
    } = he(),
    { version: kl } = Xe(),
    {
      chindingsSym: un,
      redactFmtSym: Tl,
      serializersSym: cn,
      timeSym: Rl,
      timeSliceIndexSym: Bl,
      streamSym: ql,
      stringifySym: an,
      stringifySafeSym: ot,
      stringifiersSym: hn,
      setLevelSym: Il,
      endSym: Nl,
      formatOptsSym: Pl,
      messageKeySym: Cl,
      errorKeySym: Dl,
      nestedKeySym: zl,
      mixinSym: Ml,
      useOnlyCustomLevelsSym: Wl,
      formattersSym: dn,
      hooksSym: Fl,
      nestedKeyStrSym: Kl,
      mixinMergeStrategySym: Vl,
      msgPrefixSym: Jl,
    } = mn,
    { epochTime: bn, nullTime: Ul } = gn,
    { pid: Gl } = process,
    Hl = bl.hostname(),
    Xl = yn.err,
    Yl = {
      level: 'info',
      levels: vl,
      messageKey: 'msg',
      errorKey: 'err',
      nestedKey: null,
      enabled: !0,
      base: { pid: Gl, hostname: Hl },
      serializers: Object.assign(Object.create(null), { err: Xl }),
      formatters: Object.assign(Object.create(null), {
        bindings(e) {
          return e;
        },
        level(e, t) {
          return { level: t };
        },
      }),
      hooks: { logMethod: void 0 },
      timestamp: bn,
      name: void 0,
      redact: null,
      customLevels: null,
      useOnlyCustomLevels: !1,
      depthLimit: 5,
      edgeLimit: 100,
    },
    Ql = $l(Yl),
    Zl = Object.assign(Object.create(null), yn);
  function lt(...e) {
    let t = {},
      { opts: r, stream: n } = Ql(t, wl(), ...e),
      {
        redact: i,
        crlf: o,
        serializers: f,
        timestamp: h,
        messageKey: d,
        errorKey: y,
        nestedKey: l,
        base: c,
        name: g,
        level: s,
        customLevels: u,
        mixin: p,
        mixinMergeStrategy: b,
        useOnlyCustomLevels: w,
        formatters: m,
        hooks: S,
        depthLimit: _,
        edgeLimit: O,
        onChild: $,
        msgPrefix: v,
      } = r,
      x = El({ maximumDepth: _, maximumBreadth: O }),
      j = jl(m.level, m.bindings, m.log),
      k = st.bind({ [ot]: x }),
      L = i ? Sl(i, k) : {},
      R = i ? { stringify: L[Tl] } : { stringify: k },
      B =
        '}' +
        (o
          ? `\r
`
          : `
`),
      M = Al.bind(null, { [un]: '', [cn]: f, [hn]: L, [an]: st, [ot]: x, [dn]: j }),
      ge = '';
    c !== null && (g === void 0 ? (ge = M(c)) : (ge = M(Object.assign({}, c, { name: g }))));
    let ft = h instanceof Function ? h : h ? bn : Ul,
      Sn = ft().indexOf(':') + 1;
    if (w && !u) throw Error('customLevels is required if useOnlyCustomLevels is set true');
    if (p && typeof p != 'function') throw Error(`Unknown mixin type "${typeof p}" - expected "function"`);
    if (v && typeof v != 'string') throw Error(`Unknown msgPrefix type "${typeof v}" - expected "string"`);
    xl(s, u, w);
    let _n = pn(u, w);
    return (
      Object.assign(t, {
        levels: _n,
        [Wl]: w,
        [ql]: n,
        [Rl]: ft,
        [Bl]: Sn,
        [an]: st,
        [ot]: x,
        [hn]: L,
        [Nl]: B,
        [Pl]: R,
        [Cl]: d,
        [Dl]: y,
        [zl]: l,
        [Kl]: l ? `,${JSON.stringify(l)}:{` : '',
        [cn]: f,
        [Ml]: p,
        [Vl]: b,
        [un]: ge,
        [dn]: j,
        [Fl]: S,
        silent: Ll,
        onChild: $,
        [Jl]: v,
      }),
      Object.setPrototypeOf(t, _l()),
      Ol(t),
      t[Il](s),
      t
    );
  }
  q.exports = lt;
  q.exports.destination = (e = process.stdout.fd) =>
    typeof e == 'object' ? ((e.dest = fn(e.dest || process.stdout.fd)), ln(e)) : ln({ dest: fn(e), minLength: 0 });
  q.exports.transport = Ke();
  q.exports.multistream = on();
  q.exports.levels = pn();
  q.exports.stdSerializers = Zl;
  q.exports.stdTimeFunctions = Object.assign({}, gn);
  q.exports.symbols = mn;
  q.exports.version = kl;
  q.exports.default = lt;
  q.exports.pino = lt;
});
var ef = wn(),
  { once: tf } = require('events');
module.exports = async function (e = {}) {
  let t = Object.assign({}, e, { dest: e.destination || 1, sync: !1 });
  delete t.destination;
  let r = ef.destination(t);
  return await tf(r, 'ready'), r;
};
