'use strict';
var el = Object.create;
var ht = Object.defineProperty;
var tl = Object.getOwnPropertyDescriptor;
var nl = Object.getOwnPropertyNames;
var rl = Object.getPrototypeOf,
  il = Object.prototype.hasOwnProperty;
var h = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports),
  ol = (e, t) => {
    for (var n in t) ht(e, n, { get: t[n], enumerable: !0 });
  },
  mr = (e, t, n, r) => {
    if ((t && typeof t == 'object') || typeof t == 'function')
      for (let i of nl(t))
        !il.call(e, i) && i !== n && ht(e, i, { get: () => t[i], enumerable: !(r = tl(t, i)) || r.enumerable });
    return e;
  };
var sl = (e, t, n) => (
    (n = e != null ? el(rl(e)) : {}),
    mr(t || !e || !e.__esModule ? ht(n, 'default', { value: e, enumerable: !0 }) : n, e)
  ),
  ll = (e) => mr(ht({}, '__esModule', { value: !0 }), e);
var Qe = h((E) => {
  'use strict';
  Object.defineProperty(E, '__esModule', { value: !0 });
  E.isKeyOf =
    E.isJsonArray =
    E.isJsonMap =
    E.isAnyJson =
    E.isArrayLike =
    E.isArray =
    E.isClassAssignableTo =
    E.isInstance =
    E.isDictionary =
    E.isPlainObject =
    E.isFunction =
    E.isObject =
    E.isBoolean =
    E.isNumber =
    E.isString =
      void 0;
  function tn(e) {
    return typeof e == 'string';
  }
  E.isString = tn;
  function Or(e) {
    return typeof e == 'number';
  }
  E.isNumber = Or;
  function Tr(e) {
    return typeof e == 'boolean';
  }
  E.isBoolean = Tr;
  function pt(e) {
    return e != null && (typeof e == 'object' || typeof e == 'function');
  }
  E.isObject = pt;
  function nn(e) {
    return typeof e == 'function';
  }
  E.isFunction = nn;
  function yt(e) {
    let t = (r) => pt(r) && Object.prototype.toString.call(r) === '[object Object]';
    if (!t(e)) return !1;
    let n = e.constructor;
    return !(!nn(n) || !t(n.prototype) || !n.prototype.hasOwnProperty('isPrototypeOf'));
  }
  E.isPlainObject = yt;
  function al(e) {
    return yt(e);
  }
  E.isDictionary = al;
  function ul(e, t) {
    return e instanceof t;
  }
  E.isInstance = ul;
  function fl(e, t) {
    return e === t || (((r, i) => pt(r) && i in r)(e, 'prototype') && e.prototype instanceof t);
  }
  E.isClassAssignableTo = fl;
  function rn(e) {
    return Array.isArray(e);
  }
  E.isArray = rn;
  function cl(e) {
    let t = (n) => pt(n) && 'length' in n;
    return !nn(e) && (tn(e) || t(e));
  }
  E.isArrayLike = cl;
  function dl(e) {
    return e === null || tn(e) || Or(e) || Tr(e) || yt(e) || rn(e);
  }
  E.isAnyJson = dl;
  function bl(e) {
    return yt(e);
  }
  E.isJsonMap = bl;
  function hl(e) {
    return rn(e);
  }
  E.isJsonArray = hl;
  function pl(e, t) {
    return Object.keys(e).includes(t);
  }
  E.isKeyOf = pl;
});
var Me = h((M) => {
  'use strict';
  Object.defineProperty(M, '__esModule', { value: !0 });
  M.asJsonArray =
    M.asJsonMap =
    M.asFunction =
    M.asArray =
    M.asInstance =
    M.asDictionary =
    M.asPlainObject =
    M.asObject =
    M.asBoolean =
    M.asNumber =
    M.asString =
      void 0;
  var Z = Qe();
  function yl(e, t) {
    return (0, Z.isString)(e) ? e : t;
  }
  M.asString = yl;
  function gl(e, t) {
    return (0, Z.isNumber)(e) ? e : t;
  }
  M.asNumber = gl;
  function _l(e, t) {
    return (0, Z.isBoolean)(e) ? e : t;
  }
  M.asBoolean = _l;
  function wl(e, t) {
    return (0, Z.isObject)(e) ? e : t;
  }
  M.asObject = wl;
  function Sl(e, t) {
    return (0, Z.isPlainObject)(e) ? e : t;
  }
  M.asPlainObject = Sl;
  function El(e, t) {
    return (0, Z.isDictionary)(e) ? e : t;
  }
  M.asDictionary = El;
  function Al(e, t, n) {
    return (0, Z.isInstance)(e, t) ? e : n;
  }
  M.asInstance = Al;
  function Rl(e, t) {
    return (0, Z.isArray)(e) ? e : t;
  }
  M.asArray = Rl;
  function ml(e, t) {
    return (0, Z.isFunction)(e) ? e : t;
  }
  M.asFunction = ml;
  function Ol(e, t) {
    return (0, Z.isJsonMap)(e) ? e : t;
  }
  M.asJsonMap = Ol;
  function Tl(e, t) {
    return (0, Z.isJsonArray)(e) ? e : t;
  }
  M.asJsonArray = Tl;
});
var gt = h((se) => {
  'use strict';
  Object.defineProperty(se, '__esModule', { value: !0 });
  se.JsonCloneError = se.UnexpectedValueTypeError = se.AssertionFailedError = se.NamedError = void 0;
  var $e = class extends Error {
    constructor(t, n) {
      super(n), (this.name = t);
    }
  };
  se.NamedError = $e;
  var on = class extends $e {
    constructor(t) {
      super('AssertionFailedError', t);
    }
  };
  se.AssertionFailedError = on;
  var sn = class extends $e {
    constructor(t) {
      super('UnexpectedValueTypeError', t);
    }
  };
  se.UnexpectedValueTypeError = sn;
  var ln = class extends $e {
    constructor(t) {
      super('JsonCloneError', t.message);
    }
  };
  se.JsonCloneError = ln;
});
var _t = h((Se) => {
  'use strict';
  Object.defineProperty(Se, '__esModule', { value: !0 });
  Se.toJsonArray = Se.toJsonMap = Se.toAnyJson = void 0;
  var xl = gt(),
    xr = Me();
  function an(e, t) {
    try {
      return e !== void 0 ? JSON.parse(JSON.stringify(e)) : t;
    } catch (n) {
      throw new xl.JsonCloneError(n);
    }
  }
  Se.toAnyJson = an;
  function Pl(e, t) {
    return (0, xr.asJsonMap)(an(e)) ?? t;
  }
  Se.toJsonMap = Pl;
  function Ml(e, t) {
    return (0, xr.asJsonArray)(an(e)) ?? t;
  }
  Se.toJsonArray = Ml;
});
var Mr = h((A) => {
  'use strict';
  Object.defineProperty(A, '__esModule', { value: !0 });
  A.assertJsonArray =
    A.assertJsonMap =
    A.assertAnyJson =
    A.assertFunction =
    A.assertArray =
    A.assertInstance =
    A.assertDictionary =
    A.assertPlainObject =
    A.assertObject =
    A.assertBoolean =
    A.assertNumber =
    A.assertString =
    A.assertNonNull =
    A.assert =
      void 0;
  var Dl = gt(),
    X = Me(),
    jl = _t();
  function Pr(e, t) {
    if (!e) throw new Dl.AssertionFailedError(t ?? 'Assertion condition was false');
  }
  A.assert = Pr;
  function U(e, t) {
    Pr(e != null, t ?? 'Value is not defined');
  }
  A.assertNonNull = U;
  function Il(e, t) {
    U((0, X.asString)(e), t ?? 'Value is not a string');
  }
  A.assertString = Il;
  function Nl(e, t) {
    U((0, X.asNumber)(e), t ?? 'Value is not a number');
  }
  A.assertNumber = Nl;
  function vl(e, t) {
    U((0, X.asBoolean)(e), t ?? 'Value is not a boolean');
  }
  A.assertBoolean = vl;
  function ql(e, t) {
    U((0, X.asObject)(e), t ?? 'Value is not an object');
  }
  A.assertObject = ql;
  function Ll(e, t) {
    U((0, X.asPlainObject)(e), t ?? 'Value is not a plain object');
  }
  A.assertPlainObject = Ll;
  function kl(e, t) {
    U((0, X.asDictionary)(e), t ?? 'Value is not a dictionary object');
  }
  A.assertDictionary = kl;
  function Cl(e, t, n) {
    U((0, X.asInstance)(e, t), n ?? `Value is not an instance of ${t.name}`);
  }
  A.assertInstance = Cl;
  function Wl(e, t) {
    U((0, X.asArray)(e), t ?? 'Value is not an array');
  }
  A.assertArray = Wl;
  function Fl(e, t) {
    U((0, X.asFunction)(e), t ?? 'Value is not a function');
  }
  A.assertFunction = Fl;
  function Bl(e, t) {
    U((0, jl.toAnyJson)(e), t ?? 'Value is not a JSON-compatible value type');
  }
  A.assertAnyJson = Bl;
  function $l(e, t) {
    U((0, X.asJsonMap)(e), t ?? 'Value is not a JsonMap');
  }
  A.assertJsonMap = $l;
  function Jl(e, t) {
    U((0, X.asJsonArray)(e), t ?? 'Value is not a JsonArray');
  }
  A.assertJsonArray = Jl;
});
var fn = h((Ee) => {
  'use strict';
  Object.defineProperty(Ee, '__esModule', { value: !0 });
  Ee.coerceJsonArray = Ee.coerceJsonMap = Ee.coerceAnyJson = void 0;
  var Dr = Me(),
    Ul = Qe();
  function un(e, t) {
    return (0, Ul.isAnyJson)(e) ? e : t;
  }
  Ee.coerceAnyJson = un;
  function Vl(e, t) {
    return (0, Dr.asJsonMap)(un(e)) ?? t;
  }
  Ee.coerceJsonMap = Vl;
  function Gl(e, t) {
    return (0, Dr.asJsonArray)(un(e)) ?? t;
  }
  Ee.coerceJsonArray = Gl;
});
var jr = h((m) => {
  'use strict';
  Object.defineProperty(m, '__esModule', { value: !0 });
  m.ensureJsonArray =
    m.ensureJsonMap =
    m.ensureAnyJson =
    m.ensureFunction =
    m.ensureArray =
    m.ensureInstance =
    m.ensureDictionary =
    m.ensurePlainObject =
    m.ensureObject =
    m.ensureBoolean =
    m.ensureNumber =
    m.ensureString =
    m.ensure =
      void 0;
  var Hl = gt(),
    Q = Me(),
    Kl = _t();
  function V(e, t) {
    if (e == null) throw new Hl.UnexpectedValueTypeError(t ?? 'Value is not defined');
    return e;
  }
  m.ensure = V;
  function zl(e, t) {
    return V((0, Q.asString)(e), t ?? 'Value is not a string');
  }
  m.ensureString = zl;
  function Yl(e, t) {
    return V((0, Q.asNumber)(e), t ?? 'Value is not a number');
  }
  m.ensureNumber = Yl;
  function Zl(e, t) {
    return V((0, Q.asBoolean)(e), t ?? 'Value is not a boolean');
  }
  m.ensureBoolean = Zl;
  function Xl(e, t) {
    return V((0, Q.asObject)(e), t ?? 'Value is not an object');
  }
  m.ensureObject = Xl;
  function Ql(e, t) {
    return V((0, Q.asPlainObject)(e), t ?? 'Value is not a plain object');
  }
  m.ensurePlainObject = Ql;
  function ea(e, t) {
    return V((0, Q.asDictionary)(e), t ?? 'Value is not a dictionary object');
  }
  m.ensureDictionary = ea;
  function ta(e, t, n) {
    return V((0, Q.asInstance)(e, t), n ?? `Value is not an instance of ${t.name}`);
  }
  m.ensureInstance = ta;
  function na(e, t) {
    return V((0, Q.asArray)(e), t ?? 'Value is not an array');
  }
  m.ensureArray = na;
  function ra(e, t) {
    return V((0, Q.asFunction)(e), t ?? 'Value is not a function');
  }
  m.ensureFunction = ra;
  function ia(e, t) {
    return V((0, Kl.toAnyJson)(e), t ?? 'Value is not a JSON-compatible value type');
  }
  m.ensureAnyJson = ia;
  function oa(e, t) {
    return V((0, Q.asJsonMap)(e), t ?? 'Value is not a JsonMap');
  }
  m.ensureJsonMap = oa;
  function sa(e, t) {
    return V((0, Q.asJsonArray)(e), t ?? 'Value is not a JsonArray');
  }
  m.ensureJsonArray = sa;
});
var dn = h((O) => {
  'use strict';
  Object.defineProperty(O, '__esModule', { value: !0 });
  O.hasJsonArray =
    O.hasJsonMap =
    O.hasAnyJson =
    O.hasFunction =
    O.hasArray =
    O.hasInstance =
    O.hasDictionary =
    O.hasPlainObject =
    O.hasObject =
    O.hasBoolean =
    O.hasNumber =
    O.hasString =
    O.has =
      void 0;
  var G = Qe();
  function ee(e, t) {
    return (0, G.isObject)(e) && ((0, G.isArray)(t) ? t.every((n) => n in e) : t in e);
  }
  O.has = ee;
  function la(e, t) {
    return ee(e, t) && (0, G.isString)(e[t]);
  }
  O.hasString = la;
  function aa(e, t) {
    return ee(e, t) && (0, G.isNumber)(e[t]);
  }
  O.hasNumber = aa;
  function ua(e, t) {
    return ee(e, t) && (0, G.isBoolean)(e[t]);
  }
  O.hasBoolean = ua;
  function fa(e, t) {
    return ee(e, t) && (0, G.isObject)(e[t]);
  }
  O.hasObject = fa;
  function ca(e, t) {
    return ee(e, t) && (0, G.isPlainObject)(e[t]);
  }
  O.hasPlainObject = ca;
  function da(e, t) {
    return ee(e, t) && (0, G.isDictionary)(e[t]);
  }
  O.hasDictionary = da;
  function ba(e, t, n) {
    return ee(e, t) && e[t] instanceof n;
  }
  O.hasInstance = ba;
  function ha(e, t) {
    return ee(e, t) && (0, G.isArray)(e[t]);
  }
  O.hasArray = ha;
  function pa(e, t) {
    return ee(e, t) && (0, G.isFunction)(e[t]);
  }
  O.hasFunction = pa;
  function cn(e, t) {
    return ee(e, t) && (0, G.isAnyJson)(e[t]);
  }
  O.hasAnyJson = cn;
  function ya(e, t) {
    return cn(e, t) && (0, G.isJsonMap)(e[t]);
  }
  O.hasJsonMap = ya;
  function ga(e, t) {
    return cn(e, t) && (0, G.isJsonArray)(e[t]);
  }
  O.hasJsonArray = ga;
});
var Ir = h((wt) => {
  'use strict';
  Object.defineProperty(wt, '__esModule', { value: !0 });
  wt.valueOrDefault = void 0;
  function _a(e, t) {
    return e != null || t === void 0 ? e : t;
  }
  wt.valueOrDefault = _a;
});
var Nr = h((T) => {
  'use strict';
  Object.defineProperty(T, '__esModule', { value: !0 });
  T.getJsonArray =
    T.getJsonMap =
    T.getAnyJson =
    T.getFunction =
    T.getArray =
    T.getInstance =
    T.getDictionary =
    T.getPlainObject =
    T.getObject =
    T.getBoolean =
    T.getNumber =
    T.getString =
    T.get =
      void 0;
  var te = Me(),
    wa = fn(),
    Sa = dn(),
    H = Ir();
  function ne(e, t, n) {
    return (0, H.valueOrDefault)(
      t
        .split(/['"]/)
        .reduce((r, i, o) => (o % 2 === 1 ? [...r, i] : [...r, ...i.split(/[.[\]]/)]), [])
        .filter((r) => !!r)
        .reduce((r, i) => ((0, Sa.has)(r, i) ? r[i] : void 0), e),
      n
    );
  }
  T.get = ne;
  function Ea(e, t, n) {
    return (0, H.valueOrDefault)((0, te.asString)(ne(e, t)), n);
  }
  T.getString = Ea;
  function Aa(e, t, n) {
    return (0, H.valueOrDefault)((0, te.asNumber)(ne(e, t)), n);
  }
  T.getNumber = Aa;
  function Ra(e, t, n) {
    return (0, H.valueOrDefault)((0, te.asBoolean)(ne(e, t)), n);
  }
  T.getBoolean = Ra;
  function ma(e, t, n) {
    return (0, H.valueOrDefault)((0, te.asObject)(ne(e, t)), n);
  }
  T.getObject = ma;
  function Oa(e, t, n) {
    return (0, H.valueOrDefault)((0, te.asPlainObject)(ne(e, t)), n);
  }
  T.getPlainObject = Oa;
  function Ta(e, t, n) {
    return (0, H.valueOrDefault)((0, te.asDictionary)(ne(e, t)), n);
  }
  T.getDictionary = Ta;
  function xa(e, t, n, r) {
    return (0, H.valueOrDefault)((0, te.asInstance)(ne(e, t), n), r);
  }
  T.getInstance = xa;
  function Pa(e, t, n) {
    return (0, H.valueOrDefault)((0, te.asArray)(ne(e, t)), n);
  }
  T.getArray = Pa;
  function Ma(e, t, n) {
    return (0, H.valueOrDefault)((0, te.asFunction)(ne(e, t)), n);
  }
  T.getFunction = Ma;
  function bn(e, t, n) {
    return (0, H.valueOrDefault)((0, wa.coerceAnyJson)(ne(e, t)), n);
  }
  T.getAnyJson = bn;
  function Da(e, t, n) {
    return (0, H.valueOrDefault)((0, te.asJsonMap)(bn(e, t)), n);
  }
  T.getJsonMap = Da;
  function ja(e, t, n) {
    return (0, H.valueOrDefault)((0, te.asJsonArray)(bn(e, t)), n);
  }
  T.getJsonArray = ja;
});
var qr = h((J) => {
  'use strict';
  Object.defineProperty(J, '__esModule', { value: !0 });
  J.definiteValuesOf = J.definiteKeysOf = J.definiteEntriesOf = J.valuesOf = J.entriesOf = J.keysOf = void 0;
  function Ia(e) {
    return Object.keys(e ?? {});
  }
  J.keysOf = Ia;
  function vr(e) {
    return Object.entries(e ?? {});
  }
  J.entriesOf = vr;
  function Na(e) {
    return Object.values(e ?? {});
  }
  J.valuesOf = Na;
  function hn(e) {
    return vr(e).filter((t) => t[1] != null);
  }
  J.definiteEntriesOf = hn;
  function va(e) {
    return hn(e).map((t) => t[0]);
  }
  J.definiteKeysOf = va;
  function qa(e) {
    return hn(e).map((t) => t[1]);
  }
  J.definiteValuesOf = qa;
});
var Lr = h((C) => {
  'use strict';
  var La =
      (C && C.__createBinding) ||
      (Object.create
        ? function (e, t, n, r) {
            r === void 0 && (r = n);
            var i = Object.getOwnPropertyDescriptor(t, n);
            (!i || ('get' in i ? !t.__esModule : i.writable || i.configurable)) &&
              (i = {
                enumerable: !0,
                get: function () {
                  return t[n];
                },
              }),
              Object.defineProperty(e, r, i);
          }
        : function (e, t, n, r) {
            r === void 0 && (r = n), (e[r] = t[n]);
          }),
    he =
      (C && C.__exportStar) ||
      function (e, t) {
        for (var n in e) n !== 'default' && !Object.prototype.hasOwnProperty.call(t, n) && La(t, e, n);
      };
  Object.defineProperty(C, '__esModule', { value: !0 });
  he(Me(), C);
  he(Mr(), C);
  he(fn(), C);
  he(jr(), C);
  he(Nr(), C);
  he(dn(), C);
  he(Qe(), C);
  he(qr(), C);
  he(_t(), C);
});
var Cr = h((kr) => {
  'use strict';
  Object.defineProperty(kr, '__esModule', { value: !0 });
});
var Fr = h((Wr) => {
  'use strict';
  Object.defineProperty(Wr, '__esModule', { value: !0 });
});
var $r = h((Br) => {
  'use strict';
  Object.defineProperty(Br, '__esModule', { value: !0 });
});
var Ur = h((Jr) => {
  'use strict';
  Object.defineProperty(Jr, '__esModule', { value: !0 });
});
var Gr = h((Vr) => {
  'use strict';
  Object.defineProperty(Vr, '__esModule', { value: !0 });
});
var Kr = h((Hr) => {
  'use strict';
  Object.defineProperty(Hr, '__esModule', { value: !0 });
});
var Yr = h((zr) => {
  'use strict';
  Object.defineProperty(zr, '__esModule', { value: !0 });
});
var Zr = h((K) => {
  'use strict';
  var ka =
      (K && K.__createBinding) ||
      (Object.create
        ? function (e, t, n, r) {
            r === void 0 && (r = n);
            var i = Object.getOwnPropertyDescriptor(t, n);
            (!i || ('get' in i ? !t.__esModule : i.writable || i.configurable)) &&
              (i = {
                enumerable: !0,
                get: function () {
                  return t[n];
                },
              }),
              Object.defineProperty(e, r, i);
          }
        : function (e, t, n, r) {
            r === void 0 && (r = n), (e[r] = t[n]);
          }),
    De =
      (K && K.__exportStar) ||
      function (e, t) {
        for (var n in e) n !== 'default' && !Object.prototype.hasOwnProperty.call(t, n) && ka(t, e, n);
      };
  Object.defineProperty(K, '__esModule', { value: !0 });
  De(Cr(), K);
  De(Fr(), K);
  De($r(), K);
  De(Ur(), K);
  De(Gr(), K);
  De(Kr(), K);
  De(Yr(), K);
});
var Qr = h((Ae) => {
  'use strict';
  var Ca =
      (Ae && Ae.__createBinding) ||
      (Object.create
        ? function (e, t, n, r) {
            r === void 0 && (r = n);
            var i = Object.getOwnPropertyDescriptor(t, n);
            (!i || ('get' in i ? !t.__esModule : i.writable || i.configurable)) &&
              (i = {
                enumerable: !0,
                get: function () {
                  return t[n];
                },
              }),
              Object.defineProperty(e, r, i);
          }
        : function (e, t, n, r) {
            r === void 0 && (r = n), (e[r] = t[n]);
          }),
    Xr =
      (Ae && Ae.__exportStar) ||
      function (e, t) {
        for (var n in e) n !== 'default' && !Object.prototype.hasOwnProperty.call(t, n) && Ca(t, e, n);
      };
  Object.defineProperty(Ae, '__esModule', { value: !0 });
  Xr(Lr(), Ae);
  Xr(Zr(), Ae);
});
var si = h((_h, oi) => {
  'use strict';
  var { Transform: Ga } = require('stream'),
    { StringDecoder: Ha } = require('string_decoder'),
    Re = Symbol('last'),
    St = Symbol('decoder');
  function Ka(e, t, n) {
    let r;
    if (this.overflow) {
      if (((r = this[St].write(e).split(this.matcher)), r.length === 1)) return n();
      r.shift(), (this.overflow = !1);
    } else (this[Re] += this[St].write(e)), (r = this[Re].split(this.matcher));
    this[Re] = r.pop();
    for (let i = 0; i < r.length; i++)
      try {
        ii(this, this.mapper(r[i]));
      } catch (o) {
        return n(o);
      }
    if (((this.overflow = this[Re].length > this.maxLength), this.overflow && !this.skipOverflow)) {
      n(new Error('maximum buffer reached'));
      return;
    }
    n();
  }
  function za(e) {
    if (((this[Re] += this[St].end()), this[Re]))
      try {
        ii(this, this.mapper(this[Re]));
      } catch (t) {
        return e(t);
      }
    e();
  }
  function ii(e, t) {
    t !== void 0 && e.push(t);
  }
  function ri(e) {
    return e;
  }
  function Ya(e, t, n) {
    switch (((e = e || /\r?\n/), (t = t || ri), (n = n || {}), arguments.length)) {
      case 1:
        typeof e == 'function'
          ? ((t = e), (e = /\r?\n/))
          : typeof e == 'object' && !(e instanceof RegExp) && !e[Symbol.split] && ((n = e), (e = /\r?\n/));
        break;
      case 2:
        typeof e == 'function' ? ((n = t), (t = e), (e = /\r?\n/)) : typeof t == 'object' && ((n = t), (t = ri));
    }
    (n = Object.assign({}, n)), (n.autoDestroy = !0), (n.transform = Ka), (n.flush = za), (n.readableObjectMode = !0);
    let r = new Ga(n);
    return (
      (r[Re] = ''),
      (r[St] = new Ha('utf8')),
      (r.matcher = e),
      (r.mapper = t),
      (r.maxLength = n.maxLength),
      (r.skipOverflow = n.skipOverflow || !1),
      (r.overflow = !1),
      (r._destroy = function (i, o) {
        (this._writableState.errorEmitted = !1), o(i);
      }),
      r
    );
  }
  oi.exports = Ya;
});
var N = h((wh, li) => {
  'use strict';
  li.exports = {
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
    ArrayPrototypeSlice(e, t, n) {
      return e.slice(t, n);
    },
    Error,
    FunctionPrototypeCall(e, t, ...n) {
      return e.call(t, ...n);
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
    ObjectDefineProperty(e, t, n) {
      return Object.defineProperty(e, t, n);
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
    PromisePrototypeThen(e, t, n) {
      return e.then(t, n);
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
    StringPrototypeSlice(e, t, n) {
      return e.slice(t, n);
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
    TypedArrayPrototypeSet(e, t, n) {
      return e.set(t, n);
    },
    Uint8Array,
  };
});
var le = h((Sh, gn) => {
  'use strict';
  var Za = require('buffer'),
    Xa = Object.getPrototypeOf(async function () {}).constructor,
    ai = globalThis.Blob || Za.Blob,
    Qa =
      typeof ai < 'u'
        ? function (t) {
            return t instanceof ai;
          }
        : function (t) {
            return !1;
          },
    yn = class extends Error {
      constructor(t) {
        if (!Array.isArray(t)) throw new TypeError(`Expected input to be an Array, got ${typeof t}`);
        let n = '';
        for (let r = 0; r < t.length; r++)
          n += `    ${t[r].stack}
`;
        super(n), (this.name = 'AggregateError'), (this.errors = t);
      }
    };
  gn.exports = {
    AggregateError: yn,
    kEmptyObject: Object.freeze({}),
    once(e) {
      let t = !1;
      return function (...n) {
        t || ((t = !0), e.apply(this, n));
      };
    },
    createDeferredPromise: function () {
      let e, t;
      return {
        promise: new Promise((r, i) => {
          (e = r), (t = i);
        }),
        resolve: e,
        reject: t,
      };
    },
    promisify(e) {
      return new Promise((t, n) => {
        e((r, ...i) => (r ? n(r) : t(...i)));
      });
    },
    debuglog() {
      return function () {};
    },
    format(e, ...t) {
      return e.replace(/%([sdifj])/g, function (...[n, r]) {
        let i = t.shift();
        return r === 'f'
          ? i.toFixed(6)
          : r === 'j'
          ? JSON.stringify(i)
          : r === 's' && typeof i == 'object'
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
        return e instanceof Xa;
      },
      isArrayBufferView(e) {
        return ArrayBuffer.isView(e);
      },
    },
    isBlob: Qa,
  };
  gn.exports.promisify.custom = Symbol.for('nodejs.util.promisify.custom');
});
var _i = h((nt, tt) => {
  'use strict';
  Object.defineProperty(nt, '__esModule', { value: !0 });
  var hi = new WeakMap(),
    _n = new WeakMap();
  function P(e) {
    let t = hi.get(e);
    return console.assert(t != null, "'this' is expected an Event object, but got", e), t;
  }
  function ui(e) {
    if (e.passiveListener != null) {
      typeof console < 'u' &&
        typeof console.error == 'function' &&
        console.error('Unable to preventDefault inside passive event listener invocation.', e.passiveListener);
      return;
    }
    e.event.cancelable && ((e.canceled = !0), typeof e.event.preventDefault == 'function' && e.event.preventDefault());
  }
  function Ue(e, t) {
    hi.set(this, {
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
    let n = Object.keys(t);
    for (let r = 0; r < n.length; ++r) {
      let i = n[r];
      i in this || Object.defineProperty(this, i, pi(i));
    }
  }
  Ue.prototype = {
    get type() {
      return P(this).event.type;
    },
    get target() {
      return P(this).eventTarget;
    },
    get currentTarget() {
      return P(this).currentTarget;
    },
    composedPath() {
      let e = P(this).currentTarget;
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
      return P(this).eventPhase;
    },
    stopPropagation() {
      let e = P(this);
      (e.stopped = !0), typeof e.event.stopPropagation == 'function' && e.event.stopPropagation();
    },
    stopImmediatePropagation() {
      let e = P(this);
      (e.stopped = !0),
        (e.immediateStopped = !0),
        typeof e.event.stopImmediatePropagation == 'function' && e.event.stopImmediatePropagation();
    },
    get bubbles() {
      return !!P(this).event.bubbles;
    },
    get cancelable() {
      return !!P(this).event.cancelable;
    },
    preventDefault() {
      ui(P(this));
    },
    get defaultPrevented() {
      return P(this).canceled;
    },
    get composed() {
      return !!P(this).event.composed;
    },
    get timeStamp() {
      return P(this).timeStamp;
    },
    get srcElement() {
      return P(this).eventTarget;
    },
    get cancelBubble() {
      return P(this).stopped;
    },
    set cancelBubble(e) {
      if (!e) return;
      let t = P(this);
      (t.stopped = !0), typeof t.event.cancelBubble == 'boolean' && (t.event.cancelBubble = !0);
    },
    get returnValue() {
      return !P(this).canceled;
    },
    set returnValue(e) {
      e || ui(P(this));
    },
    initEvent() {},
  };
  Object.defineProperty(Ue.prototype, 'constructor', { value: Ue, configurable: !0, writable: !0 });
  typeof window < 'u' &&
    typeof window.Event < 'u' &&
    (Object.setPrototypeOf(Ue.prototype, window.Event.prototype), _n.set(window.Event.prototype, Ue));
  function pi(e) {
    return {
      get() {
        return P(this).event[e];
      },
      set(t) {
        P(this).event[e] = t;
      },
      configurable: !0,
      enumerable: !0,
    };
  }
  function eu(e) {
    return {
      value() {
        let t = P(this).event;
        return t[e].apply(t, arguments);
      },
      configurable: !0,
      enumerable: !0,
    };
  }
  function tu(e, t) {
    let n = Object.keys(t);
    if (n.length === 0) return e;
    function r(i, o) {
      e.call(this, i, o);
    }
    r.prototype = Object.create(e.prototype, { constructor: { value: r, configurable: !0, writable: !0 } });
    for (let i = 0; i < n.length; ++i) {
      let o = n[i];
      if (!(o in e.prototype)) {
        let l = typeof Object.getOwnPropertyDescriptor(t, o).value == 'function';
        Object.defineProperty(r.prototype, o, l ? eu(o) : pi(o));
      }
    }
    return r;
  }
  function yi(e) {
    if (e == null || e === Object.prototype) return Ue;
    let t = _n.get(e);
    return t == null && ((t = tu(yi(Object.getPrototypeOf(e)), e)), _n.set(e, t)), t;
  }
  function nu(e, t) {
    let n = yi(Object.getPrototypeOf(t));
    return new n(e, t);
  }
  function ru(e) {
    return P(e).immediateStopped;
  }
  function iu(e, t) {
    P(e).eventPhase = t;
  }
  function ou(e, t) {
    P(e).currentTarget = t;
  }
  function fi(e, t) {
    P(e).passiveListener = t;
  }
  var gi = new WeakMap(),
    ci = 1,
    di = 2,
    Et = 3;
  function At(e) {
    return e !== null && typeof e == 'object';
  }
  function et(e) {
    let t = gi.get(e);
    if (t == null) throw new TypeError("'this' is expected an EventTarget object, but got another value.");
    return t;
  }
  function su(e) {
    return {
      get() {
        let n = et(this).get(e);
        for (; n != null; ) {
          if (n.listenerType === Et) return n.listener;
          n = n.next;
        }
        return null;
      },
      set(t) {
        typeof t != 'function' && !At(t) && (t = null);
        let n = et(this),
          r = null,
          i = n.get(e);
        for (; i != null; )
          i.listenerType === Et
            ? r !== null
              ? (r.next = i.next)
              : i.next !== null
              ? n.set(e, i.next)
              : n.delete(e)
            : (r = i),
            (i = i.next);
        if (t !== null) {
          let o = { listener: t, listenerType: Et, passive: !1, once: !1, next: null };
          r === null ? n.set(e, o) : (r.next = o);
        }
      },
      configurable: !0,
      enumerable: !0,
    };
  }
  function wn(e, t) {
    Object.defineProperty(e, `on${t}`, su(t));
  }
  function bi(e) {
    function t() {
      re.call(this);
    }
    t.prototype = Object.create(re.prototype, { constructor: { value: t, configurable: !0, writable: !0 } });
    for (let n = 0; n < e.length; ++n) wn(t.prototype, e[n]);
    return t;
  }
  function re() {
    if (this instanceof re) {
      gi.set(this, new Map());
      return;
    }
    if (arguments.length === 1 && Array.isArray(arguments[0])) return bi(arguments[0]);
    if (arguments.length > 0) {
      let e = new Array(arguments.length);
      for (let t = 0; t < arguments.length; ++t) e[t] = arguments[t];
      return bi(e);
    }
    throw new TypeError('Cannot call a class as a function');
  }
  re.prototype = {
    addEventListener(e, t, n) {
      if (t == null) return;
      if (typeof t != 'function' && !At(t)) throw new TypeError("'listener' should be a function or an object.");
      let r = et(this),
        i = At(n),
        s = (i ? !!n.capture : !!n) ? ci : di,
        l = { listener: t, listenerType: s, passive: i && !!n.passive, once: i && !!n.once, next: null },
        u = r.get(e);
      if (u === void 0) {
        r.set(e, l);
        return;
      }
      let a = null;
      for (; u != null; ) {
        if (u.listener === t && u.listenerType === s) return;
        (a = u), (u = u.next);
      }
      a.next = l;
    },
    removeEventListener(e, t, n) {
      if (t == null) return;
      let r = et(this),
        o = (At(n) ? !!n.capture : !!n) ? ci : di,
        s = null,
        l = r.get(e);
      for (; l != null; ) {
        if (l.listener === t && l.listenerType === o) {
          s !== null ? (s.next = l.next) : l.next !== null ? r.set(e, l.next) : r.delete(e);
          return;
        }
        (s = l), (l = l.next);
      }
    },
    dispatchEvent(e) {
      if (e == null || typeof e.type != 'string') throw new TypeError('"event.type" should be a string.');
      let t = et(this),
        n = e.type,
        r = t.get(n);
      if (r == null) return !0;
      let i = nu(this, e),
        o = null;
      for (; r != null; ) {
        if (
          (r.once ? (o !== null ? (o.next = r.next) : r.next !== null ? t.set(n, r.next) : t.delete(n)) : (o = r),
          fi(i, r.passive ? r.listener : null),
          typeof r.listener == 'function')
        )
          try {
            r.listener.call(this, i);
          } catch (s) {
            typeof console < 'u' && typeof console.error == 'function' && console.error(s);
          }
        else r.listenerType !== Et && typeof r.listener.handleEvent == 'function' && r.listener.handleEvent(i);
        if (ru(i)) break;
        r = r.next;
      }
      return fi(i, null), iu(i, 0), ou(i, null), !i.defaultPrevented;
    },
  };
  Object.defineProperty(re.prototype, 'constructor', { value: re, configurable: !0, writable: !0 });
  typeof window < 'u' &&
    typeof window.EventTarget < 'u' &&
    Object.setPrototypeOf(re.prototype, window.EventTarget.prototype);
  nt.defineEventAttribute = wn;
  nt.EventTarget = re;
  nt.default = re;
  tt.exports = re;
  tt.exports.EventTarget = tt.exports.default = re;
  tt.exports.defineEventAttribute = wn;
});
var mt = h((it, rt) => {
  'use strict';
  Object.defineProperty(it, '__esModule', { value: !0 });
  var Sn = _i(),
    me = class extends Sn.EventTarget {
      constructor() {
        throw (super(), new TypeError('AbortSignal cannot be constructed directly'));
      }
      get aborted() {
        let t = Rt.get(this);
        if (typeof t != 'boolean')
          throw new TypeError(
            `Expected 'this' to be an 'AbortSignal' object, but got ${this === null ? 'null' : typeof this}`
          );
        return t;
      }
    };
  Sn.defineEventAttribute(me.prototype, 'abort');
  function lu() {
    let e = Object.create(me.prototype);
    return Sn.EventTarget.call(e), Rt.set(e, !1), e;
  }
  function au(e) {
    Rt.get(e) === !1 && (Rt.set(e, !0), e.dispatchEvent({ type: 'abort' }));
  }
  var Rt = new WeakMap();
  Object.defineProperties(me.prototype, { aborted: { enumerable: !0 } });
  typeof Symbol == 'function' &&
    typeof Symbol.toStringTag == 'symbol' &&
    Object.defineProperty(me.prototype, Symbol.toStringTag, { configurable: !0, value: 'AbortSignal' });
  var Oe = class {
      constructor() {
        Si.set(this, lu());
      }
      get signal() {
        return wi(this);
      }
      abort() {
        au(wi(this));
      }
    },
    Si = new WeakMap();
  function wi(e) {
    let t = Si.get(e);
    if (t == null)
      throw new TypeError(
        `Expected 'this' to be an 'AbortController' object, but got ${e === null ? 'null' : typeof e}`
      );
    return t;
  }
  Object.defineProperties(Oe.prototype, { signal: { enumerable: !0 }, abort: { enumerable: !0 } });
  typeof Symbol == 'function' &&
    typeof Symbol.toStringTag == 'symbol' &&
    Object.defineProperty(Oe.prototype, Symbol.toStringTag, { configurable: !0, value: 'AbortController' });
  it.AbortController = Oe;
  it.AbortSignal = me;
  it.default = Oe;
  rt.exports = Oe;
  rt.exports.AbortController = rt.exports.default = Oe;
  rt.exports.AbortSignal = me;
});
var W = h((Eh, Ri) => {
  'use strict';
  var { format: uu, inspect: Ot, AggregateError: fu } = le(),
    cu = globalThis.AggregateError || fu,
    du = Symbol('kIsNodeError'),
    bu = ['string', 'function', 'number', 'object', 'Function', 'Object', 'boolean', 'bigint', 'symbol'],
    hu = /^([A-Z][a-z0-9]*)+$/,
    pu = '__node_internal_',
    Tt = {};
  function je(e, t) {
    if (!e) throw new Tt.ERR_INTERNAL_ASSERTION(t);
  }
  function Ei(e) {
    let t = '',
      n = e.length,
      r = e[0] === '-' ? 1 : 0;
    for (; n >= r + 4; n -= 3) t = `_${e.slice(n - 3, n)}${t}`;
    return `${e.slice(0, n)}${t}`;
  }
  function yu(e, t, n) {
    if (typeof t == 'function')
      return (
        je(
          t.length <= n.length,
          `Code: ${e}; The provided arguments length (${n.length}) does not match the required ones (${t.length}).`
        ),
        t(...n)
      );
    let r = (t.match(/%[dfijoOs]/g) || []).length;
    return (
      je(
        r === n.length,
        `Code: ${e}; The provided arguments length (${n.length}) does not match the required ones (${r}).`
      ),
      n.length === 0 ? t : uu(t, ...n)
    );
  }
  function q(e, t, n) {
    n || (n = Error);
    class r extends n {
      constructor(...o) {
        super(yu(e, t, o));
      }
      toString() {
        return `${this.name} [${e}]: ${this.message}`;
      }
    }
    Object.defineProperties(r.prototype, {
      name: { value: n.name, writable: !0, enumerable: !1, configurable: !0 },
      toString: {
        value() {
          return `${this.name} [${e}]: ${this.message}`;
        },
        writable: !0,
        enumerable: !1,
        configurable: !0,
      },
    }),
      (r.prototype.code = e),
      (r.prototype[du] = !0),
      (Tt[e] = r);
  }
  function Ai(e) {
    let t = pu + e.name;
    return Object.defineProperty(e, 'name', { value: t }), e;
  }
  function gu(e, t) {
    if (e && t && e !== t) {
      if (Array.isArray(t.errors)) return t.errors.push(e), t;
      let n = new cu([t, e], t.message);
      return (n.code = t.code), n;
    }
    return e || t;
  }
  var En = class extends Error {
    constructor(t = 'The operation was aborted', n = void 0) {
      if (n !== void 0 && typeof n != 'object') throw new Tt.ERR_INVALID_ARG_TYPE('options', 'Object', n);
      super(t, n), (this.code = 'ABORT_ERR'), (this.name = 'AbortError');
    }
  };
  q('ERR_ASSERTION', '%s', Error);
  q(
    'ERR_INVALID_ARG_TYPE',
    (e, t, n) => {
      je(typeof e == 'string', "'name' must be a string"), Array.isArray(t) || (t = [t]);
      let r = 'The ';
      e.endsWith(' argument') ? (r += `${e} `) : (r += `"${e}" ${e.includes('.') ? 'property' : 'argument'} `),
        (r += 'must be ');
      let i = [],
        o = [],
        s = [];
      for (let u of t)
        je(typeof u == 'string', 'All expected entries have to be of type string'),
          bu.includes(u)
            ? i.push(u.toLowerCase())
            : hu.test(u)
            ? o.push(u)
            : (je(u !== 'object', 'The value "object" should be written as "Object"'), s.push(u));
      if (o.length > 0) {
        let u = i.indexOf('object');
        u !== -1 && (i.splice(i, u, 1), o.push('Object'));
      }
      if (i.length > 0) {
        switch (i.length) {
          case 1:
            r += `of type ${i[0]}`;
            break;
          case 2:
            r += `one of type ${i[0]} or ${i[1]}`;
            break;
          default: {
            let u = i.pop();
            r += `one of type ${i.join(', ')}, or ${u}`;
          }
        }
        (o.length > 0 || s.length > 0) && (r += ' or ');
      }
      if (o.length > 0) {
        switch (o.length) {
          case 1:
            r += `an instance of ${o[0]}`;
            break;
          case 2:
            r += `an instance of ${o[0]} or ${o[1]}`;
            break;
          default: {
            let u = o.pop();
            r += `an instance of ${o.join(', ')}, or ${u}`;
          }
        }
        s.length > 0 && (r += ' or ');
      }
      switch (s.length) {
        case 0:
          break;
        case 1:
          s[0].toLowerCase() !== s[0] && (r += 'an '), (r += `${s[0]}`);
          break;
        case 2:
          r += `one of ${s[0]} or ${s[1]}`;
          break;
        default: {
          let u = s.pop();
          r += `one of ${s.join(', ')}, or ${u}`;
        }
      }
      if (n == null) r += `. Received ${n}`;
      else if (typeof n == 'function' && n.name) r += `. Received function ${n.name}`;
      else if (typeof n == 'object') {
        var l;
        if ((l = n.constructor) !== null && l !== void 0 && l.name)
          r += `. Received an instance of ${n.constructor.name}`;
        else {
          let u = Ot(n, { depth: -1 });
          r += `. Received ${u}`;
        }
      } else {
        let u = Ot(n, { colors: !1 });
        u.length > 25 && (u = `${u.slice(0, 25)}...`), (r += `. Received type ${typeof n} (${u})`);
      }
      return r;
    },
    TypeError
  );
  q(
    'ERR_INVALID_ARG_VALUE',
    (e, t, n = 'is invalid') => {
      let r = Ot(t);
      return (
        r.length > 128 && (r = r.slice(0, 128) + '...'),
        `The ${e.includes('.') ? 'property' : 'argument'} '${e}' ${n}. Received ${r}`
      );
    },
    TypeError
  );
  q(
    'ERR_INVALID_RETURN_VALUE',
    (e, t, n) => {
      var r;
      let i =
        n != null && (r = n.constructor) !== null && r !== void 0 && r.name
          ? `instance of ${n.constructor.name}`
          : `type ${typeof n}`;
      return `Expected ${e} to be returned from the "${t}" function but got ${i}.`;
    },
    TypeError
  );
  q(
    'ERR_MISSING_ARGS',
    (...e) => {
      je(e.length > 0, 'At least one arg needs to be specified');
      let t,
        n = e.length;
      switch (((e = (Array.isArray(e) ? e : [e]).map((r) => `"${r}"`).join(' or ')), n)) {
        case 1:
          t += `The ${e[0]} argument`;
          break;
        case 2:
          t += `The ${e[0]} and ${e[1]} arguments`;
          break;
        default:
          {
            let r = e.pop();
            t += `The ${e.join(', ')}, and ${r} arguments`;
          }
          break;
      }
      return `${t} must be specified`;
    },
    TypeError
  );
  q(
    'ERR_OUT_OF_RANGE',
    (e, t, n) => {
      je(t, 'Missing "range" argument');
      let r;
      return (
        Number.isInteger(n) && Math.abs(n) > 2 ** 32
          ? (r = Ei(String(n)))
          : typeof n == 'bigint'
          ? ((r = String(n)), (n > 2n ** 32n || n < -(2n ** 32n)) && (r = Ei(r)), (r += 'n'))
          : (r = Ot(n)),
        `The value of "${e}" is out of range. It must be ${t}. Received ${r}`
      );
    },
    RangeError
  );
  q('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times', Error);
  q('ERR_METHOD_NOT_IMPLEMENTED', 'The %s method is not implemented', Error);
  q('ERR_STREAM_ALREADY_FINISHED', 'Cannot call %s after a stream was finished', Error);
  q('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable', Error);
  q('ERR_STREAM_DESTROYED', 'Cannot call %s after a stream was destroyed', Error);
  q('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
  q('ERR_STREAM_PREMATURE_CLOSE', 'Premature close', Error);
  q('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF', Error);
  q('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event', Error);
  q('ERR_STREAM_WRITE_AFTER_END', 'write after end', Error);
  q('ERR_UNKNOWN_ENCODING', 'Unknown encoding: %s', TypeError);
  Ri.exports = { AbortError: En, aggregateTwoErrors: Ai(gu), hideStackFrames: Ai, codes: Tt };
});
var ot = h((Ah, Ii) => {
  'use strict';
  var {
      ArrayIsArray: Rn,
      ArrayPrototypeIncludes: xi,
      ArrayPrototypeJoin: Pi,
      ArrayPrototypeMap: _u,
      NumberIsInteger: mn,
      NumberIsNaN: wu,
      NumberMAX_SAFE_INTEGER: Su,
      NumberMIN_SAFE_INTEGER: Eu,
      NumberParseInt: Au,
      ObjectPrototypeHasOwnProperty: Ru,
      RegExpPrototypeExec: Mi,
      String: mu,
      StringPrototypeToUpperCase: Ou,
      StringPrototypeTrim: Tu,
    } = N(),
    {
      hideStackFrames: z,
      codes: {
        ERR_SOCKET_BAD_PORT: xu,
        ERR_INVALID_ARG_TYPE: F,
        ERR_INVALID_ARG_VALUE: Ve,
        ERR_OUT_OF_RANGE: Ie,
        ERR_UNKNOWN_SIGNAL: mi,
      },
    } = W(),
    { normalizeEncoding: Pu } = le(),
    { isAsyncFunction: Mu, isArrayBufferView: Du } = le().types,
    Oi = {};
  function ju(e) {
    return e === (e | 0);
  }
  function Iu(e) {
    return e === e >>> 0;
  }
  var Nu = /^[0-7]+$/,
    vu = 'must be a 32-bit unsigned integer or an octal string';
  function qu(e, t, n) {
    if ((typeof e > 'u' && (e = n), typeof e == 'string')) {
      if (Mi(Nu, e) === null) throw new Ve(t, e, vu);
      e = Au(e, 8);
    }
    return Di(e, t), e;
  }
  var Lu = z((e, t, n = Eu, r = Su) => {
      if (typeof e != 'number') throw new F(t, 'number', e);
      if (!mn(e)) throw new Ie(t, 'an integer', e);
      if (e < n || e > r) throw new Ie(t, `>= ${n} && <= ${r}`, e);
    }),
    ku = z((e, t, n = -2147483648, r = 2147483647) => {
      if (typeof e != 'number') throw new F(t, 'number', e);
      if (!mn(e)) throw new Ie(t, 'an integer', e);
      if (e < n || e > r) throw new Ie(t, `>= ${n} && <= ${r}`, e);
    }),
    Di = z((e, t, n = !1) => {
      if (typeof e != 'number') throw new F(t, 'number', e);
      if (!mn(e)) throw new Ie(t, 'an integer', e);
      let r = n ? 1 : 0,
        i = 4294967295;
      if (e < r || e > i) throw new Ie(t, `>= ${r} && <= ${i}`, e);
    });
  function On(e, t) {
    if (typeof e != 'string') throw new F(t, 'string', e);
  }
  function Cu(e, t, n = void 0, r) {
    if (typeof e != 'number') throw new F(t, 'number', e);
    if ((n != null && e < n) || (r != null && e > r) || ((n != null || r != null) && wu(e)))
      throw new Ie(
        t,
        `${n != null ? `>= ${n}` : ''}${n != null && r != null ? ' && ' : ''}${r != null ? `<= ${r}` : ''}`,
        e
      );
  }
  var Wu = z((e, t, n) => {
    if (!xi(n, e)) {
      let i =
        'must be one of: ' +
        Pi(
          _u(n, (o) => (typeof o == 'string' ? `'${o}'` : mu(o))),
          ', '
        );
      throw new Ve(t, e, i);
    }
  });
  function ji(e, t) {
    if (typeof e != 'boolean') throw new F(t, 'boolean', e);
  }
  function An(e, t, n) {
    return e == null || !Ru(e, t) ? n : e[t];
  }
  var Fu = z((e, t, n = null) => {
      let r = An(n, 'allowArray', !1),
        i = An(n, 'allowFunction', !1);
      if (
        (!An(n, 'nullable', !1) && e === null) ||
        (!r && Rn(e)) ||
        (typeof e != 'object' && (!i || typeof e != 'function'))
      )
        throw new F(t, 'Object', e);
    }),
    Bu = z((e, t) => {
      if (e != null && typeof e != 'object' && typeof e != 'function') throw new F(t, 'a dictionary', e);
    }),
    Tn = z((e, t, n = 0) => {
      if (!Rn(e)) throw new F(t, 'Array', e);
      if (e.length < n) {
        let r = `must be longer than ${n}`;
        throw new Ve(t, e, r);
      }
    });
  function $u(e, t) {
    Tn(e, t);
    for (let n = 0; n < e.length; n++) On(e[n], `${t}[${n}]`);
  }
  function Ju(e, t) {
    Tn(e, t);
    for (let n = 0; n < e.length; n++) ji(e[n], `${t}[${n}]`);
  }
  function Uu(e, t = 'signal') {
    if ((On(e, t), Oi[e] === void 0))
      throw Oi[Ou(e)] !== void 0 ? new mi(e + ' (signals must use all capital letters)') : new mi(e);
  }
  var Vu = z((e, t = 'buffer') => {
    if (!Du(e)) throw new F(t, ['Buffer', 'TypedArray', 'DataView'], e);
  });
  function Gu(e, t) {
    let n = Pu(t),
      r = e.length;
    if (n === 'hex' && r % 2 !== 0) throw new Ve('encoding', t, `is invalid for data of length ${r}`);
  }
  function Hu(e, t = 'Port', n = !0) {
    if (
      (typeof e != 'number' && typeof e != 'string') ||
      (typeof e == 'string' && Tu(e).length === 0) ||
      +e !== +e >>> 0 ||
      e > 65535 ||
      (e === 0 && !n)
    )
      throw new xu(t, e, n);
    return e | 0;
  }
  var Ku = z((e, t) => {
      if (e !== void 0 && (e === null || typeof e != 'object' || !('aborted' in e))) throw new F(t, 'AbortSignal', e);
    }),
    zu = z((e, t) => {
      if (typeof e != 'function') throw new F(t, 'Function', e);
    }),
    Yu = z((e, t) => {
      if (typeof e != 'function' || Mu(e)) throw new F(t, 'Function', e);
    }),
    Zu = z((e, t) => {
      if (e !== void 0) throw new F(t, 'undefined', e);
    });
  function Xu(e, t, n) {
    if (!xi(n, e)) throw new F(t, `('${Pi(n, '|')}')`, e);
  }
  var Qu = /^(?:<[^>]*>)(?:\s*;\s*[^;"\s]+(?:=(")?[^;"\s]*\1)?)*$/;
  function Ti(e, t) {
    if (typeof e > 'u' || !Mi(Qu, e))
      throw new Ve(t, e, 'must be an array or string of format "</styles.css>; rel=preload; as=style"');
  }
  function ef(e) {
    if (typeof e == 'string') return Ti(e, 'hints'), e;
    if (Rn(e)) {
      let t = e.length,
        n = '';
      if (t === 0) return n;
      for (let r = 0; r < t; r++) {
        let i = e[r];
        Ti(i, 'hints'), (n += i), r !== t - 1 && (n += ', ');
      }
      return n;
    }
    throw new Ve('hints', e, 'must be an array or string of format "</styles.css>; rel=preload; as=style"');
  }
  Ii.exports = {
    isInt32: ju,
    isUint32: Iu,
    parseFileMode: qu,
    validateArray: Tn,
    validateStringArray: $u,
    validateBooleanArray: Ju,
    validateBoolean: ji,
    validateBuffer: Vu,
    validateDictionary: Bu,
    validateEncoding: Gu,
    validateFunction: zu,
    validateInt32: ku,
    validateInteger: Lu,
    validateNumber: Cu,
    validateObject: Fu,
    validateOneOf: Wu,
    validatePlainFunction: Yu,
    validatePort: Hu,
    validateSignalName: Uu,
    validateString: On,
    validateUint32: Di,
    validateUndefined: Zu,
    validateUnion: Xu,
    validateAbortSignal: Ku,
    validateLinkHeaderValue: ef,
  };
});
var Te = h((Rh, Ni) => {
  Ni.exports = global.process;
});
var ue = h((mh, zi) => {
  'use strict';
  var { Symbol: xt, SymbolAsyncIterator: vi, SymbolIterator: qi, SymbolFor: Li } = N(),
    ki = xt('kDestroyed'),
    Ci = xt('kIsErrored'),
    xn = xt('kIsReadable'),
    Wi = xt('kIsDisturbed'),
    tf = Li('nodejs.webstream.isClosedPromise'),
    nf = Li('nodejs.webstream.controllerErrorFunction');
  function Pt(e, t = !1) {
    var n;
    return !!(
      e &&
      typeof e.pipe == 'function' &&
      typeof e.on == 'function' &&
      (!t || (typeof e.pause == 'function' && typeof e.resume == 'function')) &&
      (!e._writableState || ((n = e._readableState) === null || n === void 0 ? void 0 : n.readable) !== !1) &&
      (!e._writableState || e._readableState)
    );
  }
  function Mt(e) {
    var t;
    return !!(
      e &&
      typeof e.write == 'function' &&
      typeof e.on == 'function' &&
      (!e._readableState || ((t = e._writableState) === null || t === void 0 ? void 0 : t.writable) !== !1)
    );
  }
  function rf(e) {
    return !!(
      e &&
      typeof e.pipe == 'function' &&
      e._readableState &&
      typeof e.on == 'function' &&
      typeof e.write == 'function'
    );
  }
  function ae(e) {
    return (
      e &&
      (e._readableState ||
        e._writableState ||
        (typeof e.write == 'function' && typeof e.on == 'function') ||
        (typeof e.pipe == 'function' && typeof e.on == 'function'))
    );
  }
  function Fi(e) {
    return !!(
      e &&
      !ae(e) &&
      typeof e.pipeThrough == 'function' &&
      typeof e.getReader == 'function' &&
      typeof e.cancel == 'function'
    );
  }
  function Bi(e) {
    return !!(e && !ae(e) && typeof e.getWriter == 'function' && typeof e.abort == 'function');
  }
  function $i(e) {
    return !!(e && !ae(e) && typeof e.readable == 'object' && typeof e.writable == 'object');
  }
  function of(e) {
    return Fi(e) || Bi(e) || $i(e);
  }
  function sf(e, t) {
    return e == null
      ? !1
      : t === !0
      ? typeof e[vi] == 'function'
      : t === !1
      ? typeof e[qi] == 'function'
      : typeof e[vi] == 'function' || typeof e[qi] == 'function';
  }
  function Dt(e) {
    if (!ae(e)) return null;
    let t = e._writableState,
      n = e._readableState,
      r = t || n;
    return !!(e.destroyed || e[ki] || (r != null && r.destroyed));
  }
  function Ji(e) {
    if (!Mt(e)) return null;
    if (e.writableEnded === !0) return !0;
    let t = e._writableState;
    return t != null && t.errored ? !1 : typeof t?.ended != 'boolean' ? null : t.ended;
  }
  function lf(e, t) {
    if (!Mt(e)) return null;
    if (e.writableFinished === !0) return !0;
    let n = e._writableState;
    return n != null && n.errored
      ? !1
      : typeof n?.finished != 'boolean'
      ? null
      : !!(n.finished || (t === !1 && n.ended === !0 && n.length === 0));
  }
  function af(e) {
    if (!Pt(e)) return null;
    if (e.readableEnded === !0) return !0;
    let t = e._readableState;
    return !t || t.errored ? !1 : typeof t?.ended != 'boolean' ? null : t.ended;
  }
  function Ui(e, t) {
    if (!Pt(e)) return null;
    let n = e._readableState;
    return n != null && n.errored
      ? !1
      : typeof n?.endEmitted != 'boolean'
      ? null
      : !!(n.endEmitted || (t === !1 && n.ended === !0 && n.length === 0));
  }
  function Vi(e) {
    return e && e[xn] != null
      ? e[xn]
      : typeof e?.readable != 'boolean'
      ? null
      : Dt(e)
      ? !1
      : Pt(e) && e.readable && !Ui(e);
  }
  function Gi(e) {
    return typeof e?.writable != 'boolean' ? null : Dt(e) ? !1 : Mt(e) && e.writable && !Ji(e);
  }
  function uf(e, t) {
    return ae(e) ? (Dt(e) ? !0 : !((t?.readable !== !1 && Vi(e)) || (t?.writable !== !1 && Gi(e)))) : null;
  }
  function ff(e) {
    var t, n;
    return ae(e)
      ? e.writableErrored
        ? e.writableErrored
        : (t = (n = e._writableState) === null || n === void 0 ? void 0 : n.errored) !== null && t !== void 0
        ? t
        : null
      : null;
  }
  function cf(e) {
    var t, n;
    return ae(e)
      ? e.readableErrored
        ? e.readableErrored
        : (t = (n = e._readableState) === null || n === void 0 ? void 0 : n.errored) !== null && t !== void 0
        ? t
        : null
      : null;
  }
  function df(e) {
    if (!ae(e)) return null;
    if (typeof e.closed == 'boolean') return e.closed;
    let t = e._writableState,
      n = e._readableState;
    return typeof t?.closed == 'boolean' || typeof n?.closed == 'boolean'
      ? t?.closed || n?.closed
      : typeof e._closed == 'boolean' && Hi(e)
      ? e._closed
      : null;
  }
  function Hi(e) {
    return (
      typeof e._closed == 'boolean' &&
      typeof e._defaultKeepAlive == 'boolean' &&
      typeof e._removedConnection == 'boolean' &&
      typeof e._removedContLen == 'boolean'
    );
  }
  function Ki(e) {
    return typeof e._sent100 == 'boolean' && Hi(e);
  }
  function bf(e) {
    var t;
    return (
      typeof e._consuming == 'boolean' &&
      typeof e._dumped == 'boolean' &&
      ((t = e.req) === null || t === void 0 ? void 0 : t.upgradeOrConnect) === void 0
    );
  }
  function hf(e) {
    if (!ae(e)) return null;
    let t = e._writableState,
      n = e._readableState,
      r = t || n;
    return (!r && Ki(e)) || !!(r && r.autoDestroy && r.emitClose && r.closed === !1);
  }
  function pf(e) {
    var t;
    return !!(e && ((t = e[Wi]) !== null && t !== void 0 ? t : e.readableDidRead || e.readableAborted));
  }
  function yf(e) {
    var t, n, r, i, o, s, l, u, a, c;
    return !!(
      e &&
      ((t =
        (n =
          (r =
            (i =
              (o = (s = e[Ci]) !== null && s !== void 0 ? s : e.readableErrored) !== null && o !== void 0
                ? o
                : e.writableErrored) !== null && i !== void 0
              ? i
              : (l = e._readableState) === null || l === void 0
              ? void 0
              : l.errorEmitted) !== null && r !== void 0
            ? r
            : (u = e._writableState) === null || u === void 0
            ? void 0
            : u.errorEmitted) !== null && n !== void 0
          ? n
          : (a = e._readableState) === null || a === void 0
          ? void 0
          : a.errored) !== null && t !== void 0
        ? t
        : !((c = e._writableState) === null || c === void 0) && c.errored)
    );
  }
  zi.exports = {
    kDestroyed: ki,
    isDisturbed: pf,
    kIsDisturbed: Wi,
    isErrored: yf,
    kIsErrored: Ci,
    isReadable: Vi,
    kIsReadable: xn,
    kIsClosedPromise: tf,
    kControllerErrorFunction: nf,
    isClosed: df,
    isDestroyed: Dt,
    isDuplexNodeStream: rf,
    isFinished: uf,
    isIterable: sf,
    isReadableNodeStream: Pt,
    isReadableStream: Fi,
    isReadableEnded: af,
    isReadableFinished: Ui,
    isReadableErrored: cf,
    isNodeStream: ae,
    isWebStream: of,
    isWritable: Gi,
    isWritableNodeStream: Mt,
    isWritableStream: Bi,
    isWritableEnded: Ji,
    isWritableFinished: lf,
    isWritableErrored: ff,
    isServerRequest: bf,
    isServerResponse: Ki,
    willEmitClose: hf,
    isTransformStream: $i,
  };
});
var pe = h((Oh, In) => {
  var xe = Te(),
    { AbortError: io, codes: gf } = W(),
    { ERR_INVALID_ARG_TYPE: _f, ERR_STREAM_PREMATURE_CLOSE: Yi } = gf,
    { kEmptyObject: Mn, once: Dn } = le(),
    { validateAbortSignal: wf, validateFunction: Sf, validateObject: Ef, validateBoolean: Af } = ot(),
    { Promise: Rf, PromisePrototypeThen: mf } = N(),
    {
      isClosed: Of,
      isReadable: Zi,
      isReadableNodeStream: Pn,
      isReadableStream: Tf,
      isReadableFinished: Xi,
      isReadableErrored: Qi,
      isWritable: eo,
      isWritableNodeStream: to,
      isWritableStream: xf,
      isWritableFinished: no,
      isWritableErrored: ro,
      isNodeStream: Pf,
      willEmitClose: Mf,
      kIsClosedPromise: Df,
    } = ue();
  function jf(e) {
    return e.setHeader && typeof e.abort == 'function';
  }
  var jn = () => {};
  function oo(e, t, n) {
    var r, i;
    if (
      (arguments.length === 2 ? ((n = t), (t = Mn)) : t == null ? (t = Mn) : Ef(t, 'options'),
      Sf(n, 'callback'),
      wf(t.signal, 'options.signal'),
      (n = Dn(n)),
      Tf(e) || xf(e))
    )
      return If(e, t, n);
    if (!Pf(e)) throw new _f('stream', ['ReadableStream', 'WritableStream', 'Stream'], e);
    let o = (r = t.readable) !== null && r !== void 0 ? r : Pn(e),
      s = (i = t.writable) !== null && i !== void 0 ? i : to(e),
      l = e._writableState,
      u = e._readableState,
      a = () => {
        e.writable || p();
      },
      c = Mf(e) && Pn(e) === o && to(e) === s,
      d = no(e, !1),
      p = () => {
        (d = !0), e.destroyed && (c = !1), !(c && (!e.readable || o)) && (!o || b) && n.call(e);
      },
      b = Xi(e, !1),
      f = () => {
        (b = !0), e.destroyed && (c = !1), !(c && (!e.writable || s)) && (!s || d) && n.call(e);
      },
      j = (k) => {
        n.call(e, k);
      },
      x = Of(e),
      R = () => {
        x = !0;
        let k = ro(e) || Qi(e);
        if (k && typeof k != 'boolean') return n.call(e, k);
        if (o && !b && Pn(e, !0) && !Xi(e, !1)) return n.call(e, new Yi());
        if (s && !d && !no(e, !1)) return n.call(e, new Yi());
        n.call(e);
      },
      S = () => {
        x = !0;
        let k = ro(e) || Qi(e);
        if (k && typeof k != 'boolean') return n.call(e, k);
        n.call(e);
      },
      y = () => {
        e.req.on('finish', p);
      };
    jf(e)
      ? (e.on('complete', p), c || e.on('abort', R), e.req ? y() : e.on('request', y))
      : s && !l && (e.on('end', a), e.on('close', a)),
      !c && typeof e.aborted == 'boolean' && e.on('aborted', R),
      e.on('end', f),
      e.on('finish', p),
      t.error !== !1 && e.on('error', j),
      e.on('close', R),
      x
        ? xe.nextTick(R)
        : (l != null && l.errorEmitted) || (u != null && u.errorEmitted)
        ? c || xe.nextTick(S)
        : ((!o && (!c || Zi(e)) && (d || eo(e) === !1)) ||
            (!s && (!c || eo(e)) && (b || Zi(e) === !1)) ||
            (u && e.req && e.aborted)) &&
          xe.nextTick(S);
    let L = () => {
      (n = jn),
        e.removeListener('aborted', R),
        e.removeListener('complete', p),
        e.removeListener('abort', R),
        e.removeListener('request', y),
        e.req && e.req.removeListener('finish', p),
        e.removeListener('end', a),
        e.removeListener('close', a),
        e.removeListener('finish', p),
        e.removeListener('end', f),
        e.removeListener('error', j),
        e.removeListener('close', R);
    };
    if (t.signal && !x) {
      let k = () => {
        let B = n;
        L(), B.call(e, new io(void 0, { cause: t.signal.reason }));
      };
      if (t.signal.aborted) xe.nextTick(k);
      else {
        let B = n;
        (n = Dn((...Be) => {
          t.signal.removeEventListener('abort', k), B.apply(e, Be);
        })),
          t.signal.addEventListener('abort', k);
      }
    }
    return L;
  }
  function If(e, t, n) {
    let r = !1,
      i = jn;
    if (t.signal)
      if (
        ((i = () => {
          (r = !0), n.call(e, new io(void 0, { cause: t.signal.reason }));
        }),
        t.signal.aborted)
      )
        xe.nextTick(i);
      else {
        let s = n;
        (n = Dn((...l) => {
          t.signal.removeEventListener('abort', i), s.apply(e, l);
        })),
          t.signal.addEventListener('abort', i);
      }
    let o = (...s) => {
      r || xe.nextTick(() => n.apply(e, s));
    };
    return mf(e[Df].promise, o, o), jn;
  }
  function Nf(e, t) {
    var n;
    let r = !1;
    return (
      t === null && (t = Mn),
      (n = t) !== null && n !== void 0 && n.cleanup && (Af(t.cleanup, 'cleanup'), (r = t.cleanup)),
      new Rf((i, o) => {
        let s = oo(e, t, (l) => {
          r && s(), l ? o(l) : i();
        });
      })
    );
  }
  In.exports = oo;
  In.exports.finished = Nf;
});
var Ne = h((Th, ho) => {
  'use strict';
  var fe = Te(),
    {
      aggregateTwoErrors: vf,
      codes: { ERR_MULTIPLE_CALLBACK: qf },
      AbortError: Lf,
    } = W(),
    { Symbol: ao } = N(),
    { kDestroyed: kf, isDestroyed: Cf, isFinished: Wf, isServerRequest: Ff } = ue(),
    uo = ao('kDestroy'),
    Nn = ao('kConstruct');
  function fo(e, t, n) {
    e && (e.stack, t && !t.errored && (t.errored = e), n && !n.errored && (n.errored = e));
  }
  function Bf(e, t) {
    let n = this._readableState,
      r = this._writableState,
      i = r || n;
    return (r != null && r.destroyed) || (n != null && n.destroyed)
      ? (typeof t == 'function' && t(), this)
      : (fo(e, r, n),
        r && (r.destroyed = !0),
        n && (n.destroyed = !0),
        i.constructed
          ? so(this, e, t)
          : this.once(uo, function (o) {
              so(this, vf(o, e), t);
            }),
        this);
  }
  function so(e, t, n) {
    let r = !1;
    function i(o) {
      if (r) return;
      r = !0;
      let s = e._readableState,
        l = e._writableState;
      fo(o, l, s),
        l && (l.closed = !0),
        s && (s.closed = !0),
        typeof n == 'function' && n(o),
        o ? fe.nextTick($f, e, o) : fe.nextTick(co, e);
    }
    try {
      e._destroy(t || null, i);
    } catch (o) {
      i(o);
    }
  }
  function $f(e, t) {
    vn(e, t), co(e);
  }
  function co(e) {
    let t = e._readableState,
      n = e._writableState;
    n && (n.closeEmitted = !0),
      t && (t.closeEmitted = !0),
      ((n != null && n.emitClose) || (t != null && t.emitClose)) && e.emit('close');
  }
  function vn(e, t) {
    let n = e._readableState,
      r = e._writableState;
    (r != null && r.errorEmitted) ||
      (n != null && n.errorEmitted) ||
      (r && (r.errorEmitted = !0), n && (n.errorEmitted = !0), e.emit('error', t));
  }
  function Jf() {
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
  function qn(e, t, n) {
    let r = e._readableState,
      i = e._writableState;
    if ((i != null && i.destroyed) || (r != null && r.destroyed)) return this;
    (r != null && r.autoDestroy) || (i != null && i.autoDestroy)
      ? e.destroy(t)
      : t &&
        (t.stack,
        i && !i.errored && (i.errored = t),
        r && !r.errored && (r.errored = t),
        n ? fe.nextTick(vn, e, t) : vn(e, t));
  }
  function Uf(e, t) {
    if (typeof e._construct != 'function') return;
    let n = e._readableState,
      r = e._writableState;
    n && (n.constructed = !1),
      r && (r.constructed = !1),
      e.once(Nn, t),
      !(e.listenerCount(Nn) > 1) && fe.nextTick(Vf, e);
  }
  function Vf(e) {
    let t = !1;
    function n(r) {
      if (t) {
        qn(e, r ?? new qf());
        return;
      }
      t = !0;
      let i = e._readableState,
        o = e._writableState,
        s = o || i;
      i && (i.constructed = !0),
        o && (o.constructed = !0),
        s.destroyed ? e.emit(uo, r) : r ? qn(e, r, !0) : fe.nextTick(Gf, e);
    }
    try {
      e._construct((r) => {
        fe.nextTick(n, r);
      });
    } catch (r) {
      fe.nextTick(n, r);
    }
  }
  function Gf(e) {
    e.emit(Nn);
  }
  function lo(e) {
    return e?.setHeader && typeof e.abort == 'function';
  }
  function bo(e) {
    e.emit('close');
  }
  function Hf(e, t) {
    e.emit('error', t), fe.nextTick(bo, e);
  }
  function Kf(e, t) {
    !e ||
      Cf(e) ||
      (!t && !Wf(e) && (t = new Lf()),
      Ff(e)
        ? ((e.socket = null), e.destroy(t))
        : lo(e)
        ? e.abort()
        : lo(e.req)
        ? e.req.abort()
        : typeof e.destroy == 'function'
        ? e.destroy(t)
        : typeof e.close == 'function'
        ? e.close()
        : t
        ? fe.nextTick(Hf, e, t)
        : fe.nextTick(bo, e),
      e.destroyed || (e[kf] = !0));
  }
  ho.exports = { construct: Uf, destroyer: Kf, destroy: Bf, undestroy: Jf, errorOrDestroy: qn };
});
var Nt = h((xh, yo) => {
  'use strict';
  var { ArrayIsArray: zf, ObjectSetPrototypeOf: po } = N(),
    { EventEmitter: jt } = require('events');
  function It(e) {
    jt.call(this, e);
  }
  po(It.prototype, jt.prototype);
  po(It, jt);
  It.prototype.pipe = function (e, t) {
    let n = this;
    function r(c) {
      e.writable && e.write(c) === !1 && n.pause && n.pause();
    }
    n.on('data', r);
    function i() {
      n.readable && n.resume && n.resume();
    }
    e.on('drain', i), !e._isStdio && (!t || t.end !== !1) && (n.on('end', s), n.on('close', l));
    let o = !1;
    function s() {
      o || ((o = !0), e.end());
    }
    function l() {
      o || ((o = !0), typeof e.destroy == 'function' && e.destroy());
    }
    function u(c) {
      a(), jt.listenerCount(this, 'error') === 0 && this.emit('error', c);
    }
    Ln(n, 'error', u), Ln(e, 'error', u);
    function a() {
      n.removeListener('data', r),
        e.removeListener('drain', i),
        n.removeListener('end', s),
        n.removeListener('close', l),
        n.removeListener('error', u),
        e.removeListener('error', u),
        n.removeListener('end', a),
        n.removeListener('close', a),
        e.removeListener('close', a);
    }
    return n.on('end', a), n.on('close', a), e.on('close', a), e.emit('pipe', n), e;
  };
  function Ln(e, t, n) {
    if (typeof e.prependListener == 'function') return e.prependListener(t, n);
    !e._events || !e._events[t]
      ? e.on(t, n)
      : zf(e._events[t])
      ? e._events[t].unshift(n)
      : (e._events[t] = [n, e._events[t]]);
  }
  yo.exports = { Stream: It, prependListener: Ln };
});
var st = h((Ph, vt) => {
  'use strict';
  var { AbortError: go, codes: Yf } = W(),
    { isNodeStream: _o, isWebStream: Zf, kControllerErrorFunction: Xf } = ue(),
    Qf = pe(),
    { ERR_INVALID_ARG_TYPE: wo } = Yf,
    ec = (e, t) => {
      if (typeof e != 'object' || !('aborted' in e)) throw new wo(t, 'AbortSignal', e);
    };
  vt.exports.addAbortSignal = function (t, n) {
    if ((ec(t, 'signal'), !_o(n) && !Zf(n))) throw new wo('stream', ['ReadableStream', 'WritableStream', 'Stream'], n);
    return vt.exports.addAbortSignalNoValidate(t, n);
  };
  vt.exports.addAbortSignalNoValidate = function (e, t) {
    if (typeof e != 'object' || !('aborted' in e)) return t;
    let n = _o(t)
      ? () => {
          t.destroy(new go(void 0, { cause: e.reason }));
        }
      : () => {
          t[Xf](new go(void 0, { cause: e.reason }));
        };
    return e.aborted ? n() : (e.addEventListener('abort', n), Qf(t, () => e.removeEventListener('abort', n))), t;
  };
});
var Ao = h((Dh, Eo) => {
  'use strict';
  var { StringPrototypeSlice: So, SymbolIterator: tc, TypedArrayPrototypeSet: qt, Uint8Array: nc } = N(),
    { Buffer: kn } = require('buffer'),
    { inspect: rc } = le();
  Eo.exports = class {
    constructor() {
      (this.head = null), (this.tail = null), (this.length = 0);
    }
    push(t) {
      let n = { data: t, next: null };
      this.length > 0 ? (this.tail.next = n) : (this.head = n), (this.tail = n), ++this.length;
    }
    unshift(t) {
      let n = { data: t, next: this.head };
      this.length === 0 && (this.tail = n), (this.head = n), ++this.length;
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
      let n = this.head,
        r = '' + n.data;
      for (; (n = n.next) !== null; ) r += t + n.data;
      return r;
    }
    concat(t) {
      if (this.length === 0) return kn.alloc(0);
      let n = kn.allocUnsafe(t >>> 0),
        r = this.head,
        i = 0;
      for (; r; ) qt(n, r.data, i), (i += r.data.length), (r = r.next);
      return n;
    }
    consume(t, n) {
      let r = this.head.data;
      if (t < r.length) {
        let i = r.slice(0, t);
        return (this.head.data = r.slice(t)), i;
      }
      return t === r.length ? this.shift() : n ? this._getString(t) : this._getBuffer(t);
    }
    first() {
      return this.head.data;
    }
    *[tc]() {
      for (let t = this.head; t; t = t.next) yield t.data;
    }
    _getString(t) {
      let n = '',
        r = this.head,
        i = 0;
      do {
        let o = r.data;
        if (t > o.length) (n += o), (t -= o.length);
        else {
          t === o.length
            ? ((n += o), ++i, r.next ? (this.head = r.next) : (this.head = this.tail = null))
            : ((n += So(o, 0, t)), (this.head = r), (r.data = So(o, t)));
          break;
        }
        ++i;
      } while ((r = r.next) !== null);
      return (this.length -= i), n;
    }
    _getBuffer(t) {
      let n = kn.allocUnsafe(t),
        r = t,
        i = this.head,
        o = 0;
      do {
        let s = i.data;
        if (t > s.length) qt(n, s, r - t), (t -= s.length);
        else {
          t === s.length
            ? (qt(n, s, r - t), ++o, i.next ? (this.head = i.next) : (this.head = this.tail = null))
            : (qt(n, new nc(s.buffer, s.byteOffset, t), r - t), (this.head = i), (i.data = s.slice(t)));
          break;
        }
        ++o;
      } while ((i = i.next) !== null);
      return (this.length -= o), n;
    }
    [Symbol.for('nodejs.util.inspect.custom')](t, n) {
      return rc(this, { ...n, depth: 0, customInspect: !1 });
    }
  };
});
var Lt = h((jh, mo) => {
  'use strict';
  var { MathFloor: ic, NumberIsInteger: oc } = N(),
    { ERR_INVALID_ARG_VALUE: sc } = W().codes;
  function lc(e, t, n) {
    return e.highWaterMark != null ? e.highWaterMark : t ? e[n] : null;
  }
  function Ro(e) {
    return e ? 16 : 16 * 1024;
  }
  function ac(e, t, n, r) {
    let i = lc(t, r, n);
    if (i != null) {
      if (!oc(i) || i < 0) {
        let o = r ? `options.${n}` : 'options.highWaterMark';
        throw new sc(o, i);
      }
      return ic(i);
    }
    return Ro(e.objectMode);
  }
  mo.exports = { getHighWaterMark: ac, getDefaultHighWaterMark: Ro };
});
var Cn = h((Ih, Po) => {
  'use strict';
  var Oo = Te(),
    { PromisePrototypeThen: uc, SymbolAsyncIterator: To, SymbolIterator: xo } = N(),
    { Buffer: fc } = require('buffer'),
    { ERR_INVALID_ARG_TYPE: cc, ERR_STREAM_NULL_VALUES: dc } = W().codes;
  function bc(e, t, n) {
    let r;
    if (typeof t == 'string' || t instanceof fc)
      return new e({
        objectMode: !0,
        ...n,
        read() {
          this.push(t), this.push(null);
        },
      });
    let i;
    if (t && t[To]) (i = !0), (r = t[To]());
    else if (t && t[xo]) (i = !1), (r = t[xo]());
    else throw new cc('iterable', ['Iterable'], t);
    let o = new e({ objectMode: !0, highWaterMark: 1, ...n }),
      s = !1;
    (o._read = function () {
      s || ((s = !0), u());
    }),
      (o._destroy = function (a, c) {
        uc(
          l(a),
          () => Oo.nextTick(c, a),
          (d) => Oo.nextTick(c, d || a)
        );
      });
    async function l(a) {
      let c = a != null,
        d = typeof r.throw == 'function';
      if (c && d) {
        let { value: p, done: b } = await r.throw(a);
        if ((await p, b)) return;
      }
      if (typeof r.return == 'function') {
        let { value: p } = await r.return();
        await p;
      }
    }
    async function u() {
      for (;;) {
        try {
          let { value: a, done: c } = i ? await r.next() : r.next();
          if (c) o.push(null);
          else {
            let d = a && typeof a.then == 'function' ? await a : a;
            if (d === null) throw ((s = !1), new dc());
            if (o.push(d)) continue;
            s = !1;
          }
        } catch (a) {
          o.destroy(a);
        }
        break;
      }
    }
    return o;
  }
  Po.exports = bc;
});
var lt = h((Nh, Bo) => {
  var ie = Te(),
    {
      ArrayPrototypeIndexOf: hc,
      NumberIsInteger: pc,
      NumberIsNaN: yc,
      NumberParseInt: gc,
      ObjectDefineProperties: jo,
      ObjectKeys: _c,
      ObjectSetPrototypeOf: Io,
      Promise: wc,
      SafeSet: Sc,
      SymbolAsyncIterator: Ec,
      Symbol: Ac,
    } = N();
  Bo.exports = g;
  g.ReadableState = Un;
  var { EventEmitter: Rc } = require('events'),
    { Stream: Pe, prependListener: mc } = Nt(),
    { Buffer: Wn } = require('buffer'),
    { addAbortSignal: Oc } = st(),
    Tc = pe(),
    w = le().debuglog('stream', (e) => {
      w = e;
    }),
    xc = Ao(),
    He = Ne(),
    { getHighWaterMark: Pc, getDefaultHighWaterMark: Mc } = Lt(),
    {
      aggregateTwoErrors: Mo,
      codes: {
        ERR_INVALID_ARG_TYPE: Dc,
        ERR_METHOD_NOT_IMPLEMENTED: jc,
        ERR_OUT_OF_RANGE: Ic,
        ERR_STREAM_PUSH_AFTER_EOF: Nc,
        ERR_STREAM_UNSHIFT_AFTER_END_EVENT: vc,
      },
    } = W(),
    { validateObject: qc } = ot(),
    ve = Ac('kPaused'),
    { StringDecoder: No } = require('string_decoder'),
    Lc = Cn();
  Io(g.prototype, Pe.prototype);
  Io(g, Pe);
  var Fn = () => {},
    { errorOrDestroy: Ge } = He;
  function Un(e, t, n) {
    typeof n != 'boolean' && (n = t instanceof ce()),
      (this.objectMode = !!(e && e.objectMode)),
      n && (this.objectMode = this.objectMode || !!(e && e.readableObjectMode)),
      (this.highWaterMark = e ? Pc(this, e, 'readableHighWaterMark', n) : Mc(!1)),
      (this.buffer = new xc()),
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
      (this[ve] = null),
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
      e && e.encoding && ((this.decoder = new No(e.encoding)), (this.encoding = e.encoding));
  }
  function g(e) {
    if (!(this instanceof g)) return new g(e);
    let t = this instanceof ce();
    (this._readableState = new Un(e, this, t)),
      e &&
        (typeof e.read == 'function' && (this._read = e.read),
        typeof e.destroy == 'function' && (this._destroy = e.destroy),
        typeof e.construct == 'function' && (this._construct = e.construct),
        e.signal && !t && Oc(e.signal, this)),
      Pe.call(this, e),
      He.construct(this, () => {
        this._readableState.needReadable && kt(this, this._readableState);
      });
  }
  g.prototype.destroy = He.destroy;
  g.prototype._undestroy = He.undestroy;
  g.prototype._destroy = function (e, t) {
    t(e);
  };
  g.prototype[Rc.captureRejectionSymbol] = function (e) {
    this.destroy(e);
  };
  g.prototype.push = function (e, t) {
    return vo(this, e, t, !1);
  };
  g.prototype.unshift = function (e, t) {
    return vo(this, e, t, !0);
  };
  function vo(e, t, n, r) {
    w('readableAddChunk', t);
    let i = e._readableState,
      o;
    if (
      (i.objectMode ||
        (typeof t == 'string'
          ? ((n = n || i.defaultEncoding),
            i.encoding !== n &&
              (r && i.encoding ? (t = Wn.from(t, n).toString(i.encoding)) : ((t = Wn.from(t, n)), (n = ''))))
          : t instanceof Wn
          ? (n = '')
          : Pe._isUint8Array(t)
          ? ((t = Pe._uint8ArrayToBuffer(t)), (n = ''))
          : t != null && (o = new Dc('chunk', ['string', 'Buffer', 'Uint8Array'], t))),
      o)
    )
      Ge(e, o);
    else if (t === null) (i.reading = !1), Wc(e, i);
    else if (i.objectMode || (t && t.length > 0))
      if (r)
        if (i.endEmitted) Ge(e, new vc());
        else {
          if (i.destroyed || i.errored) return !1;
          Bn(e, i, t, !0);
        }
      else if (i.ended) Ge(e, new Nc());
      else {
        if (i.destroyed || i.errored) return !1;
        (i.reading = !1),
          i.decoder && !n
            ? ((t = i.decoder.write(t)), i.objectMode || t.length !== 0 ? Bn(e, i, t, !1) : kt(e, i))
            : Bn(e, i, t, !1);
      }
    else r || ((i.reading = !1), kt(e, i));
    return !i.ended && (i.length < i.highWaterMark || i.length === 0);
  }
  function Bn(e, t, n, r) {
    t.flowing && t.length === 0 && !t.sync && e.listenerCount('data') > 0
      ? (t.multiAwaitDrain ? t.awaitDrainWriters.clear() : (t.awaitDrainWriters = null),
        (t.dataEmitted = !0),
        e.emit('data', n))
      : ((t.length += t.objectMode ? 1 : n.length),
        r ? t.buffer.unshift(n) : t.buffer.push(n),
        t.needReadable && Ct(e)),
      kt(e, t);
  }
  g.prototype.isPaused = function () {
    let e = this._readableState;
    return e[ve] === !0 || e.flowing === !1;
  };
  g.prototype.setEncoding = function (e) {
    let t = new No(e);
    (this._readableState.decoder = t), (this._readableState.encoding = this._readableState.decoder.encoding);
    let n = this._readableState.buffer,
      r = '';
    for (let i of n) r += t.write(i);
    return n.clear(), r !== '' && n.push(r), (this._readableState.length = r.length), this;
  };
  var kc = 1073741824;
  function Cc(e) {
    if (e > kc) throw new Ic('size', '<= 1GiB', e);
    return e--, (e |= e >>> 1), (e |= e >>> 2), (e |= e >>> 4), (e |= e >>> 8), (e |= e >>> 16), e++, e;
  }
  function Do(e, t) {
    return e <= 0 || (t.length === 0 && t.ended)
      ? 0
      : t.objectMode
      ? 1
      : yc(e)
      ? t.flowing && t.length
        ? t.buffer.first().length
        : t.length
      : e <= t.length
      ? e
      : t.ended
      ? t.length
      : 0;
  }
  g.prototype.read = function (e) {
    w('read', e), e === void 0 ? (e = NaN) : pc(e) || (e = gc(e, 10));
    let t = this._readableState,
      n = e;
    if (
      (e > t.highWaterMark && (t.highWaterMark = Cc(e)),
      e !== 0 && (t.emittedReadable = !1),
      e === 0 && t.needReadable && ((t.highWaterMark !== 0 ? t.length >= t.highWaterMark : t.length > 0) || t.ended))
    )
      return w('read: emitReadable', t.length, t.ended), t.length === 0 && t.ended ? $n(this) : Ct(this), null;
    if (((e = Do(e, t)), e === 0 && t.ended)) return t.length === 0 && $n(this), null;
    let r = t.needReadable;
    if (
      (w('need readable', r),
      (t.length === 0 || t.length - e < t.highWaterMark) && ((r = !0), w('length less than watermark', r)),
      t.ended || t.reading || t.destroyed || t.errored || !t.constructed)
    )
      (r = !1), w('reading, ended or constructing', r);
    else if (r) {
      w('do read'), (t.reading = !0), (t.sync = !0), t.length === 0 && (t.needReadable = !0);
      try {
        this._read(t.highWaterMark);
      } catch (o) {
        Ge(this, o);
      }
      (t.sync = !1), t.reading || (e = Do(n, t));
    }
    let i;
    return (
      e > 0 ? (i = Wo(e, t)) : (i = null),
      i === null
        ? ((t.needReadable = t.length <= t.highWaterMark), (e = 0))
        : ((t.length -= e), t.multiAwaitDrain ? t.awaitDrainWriters.clear() : (t.awaitDrainWriters = null)),
      t.length === 0 && (t.ended || (t.needReadable = !0), n !== e && t.ended && $n(this)),
      i !== null && !t.errorEmitted && !t.closeEmitted && ((t.dataEmitted = !0), this.emit('data', i)),
      i
    );
  };
  function Wc(e, t) {
    if ((w('onEofChunk'), !t.ended)) {
      if (t.decoder) {
        let n = t.decoder.end();
        n && n.length && (t.buffer.push(n), (t.length += t.objectMode ? 1 : n.length));
      }
      (t.ended = !0), t.sync ? Ct(e) : ((t.needReadable = !1), (t.emittedReadable = !0), qo(e));
    }
  }
  function Ct(e) {
    let t = e._readableState;
    w('emitReadable', t.needReadable, t.emittedReadable),
      (t.needReadable = !1),
      t.emittedReadable || (w('emitReadable', t.flowing), (t.emittedReadable = !0), ie.nextTick(qo, e));
  }
  function qo(e) {
    let t = e._readableState;
    w('emitReadable_', t.destroyed, t.length, t.ended),
      !t.destroyed && !t.errored && (t.length || t.ended) && (e.emit('readable'), (t.emittedReadable = !1)),
      (t.needReadable = !t.flowing && !t.ended && t.length <= t.highWaterMark),
      ko(e);
  }
  function kt(e, t) {
    !t.readingMore && t.constructed && ((t.readingMore = !0), ie.nextTick(Fc, e, t));
  }
  function Fc(e, t) {
    for (; !t.reading && !t.ended && (t.length < t.highWaterMark || (t.flowing && t.length === 0)); ) {
      let n = t.length;
      if ((w('maybeReadMore read 0'), e.read(0), n === t.length)) break;
    }
    t.readingMore = !1;
  }
  g.prototype._read = function (e) {
    throw new jc('_read()');
  };
  g.prototype.pipe = function (e, t) {
    let n = this,
      r = this._readableState;
    r.pipes.length === 1 &&
      (r.multiAwaitDrain ||
        ((r.multiAwaitDrain = !0), (r.awaitDrainWriters = new Sc(r.awaitDrainWriters ? [r.awaitDrainWriters] : [])))),
      r.pipes.push(e),
      w('pipe count=%d opts=%j', r.pipes.length, t);
    let o = (!t || t.end !== !1) && e !== ie.stdout && e !== ie.stderr ? l : x;
    r.endEmitted ? ie.nextTick(o) : n.once('end', o), e.on('unpipe', s);
    function s(R, S) {
      w('onunpipe'), R === n && S && S.hasUnpiped === !1 && ((S.hasUnpiped = !0), c());
    }
    function l() {
      w('onend'), e.end();
    }
    let u,
      a = !1;
    function c() {
      w('cleanup'),
        e.removeListener('close', f),
        e.removeListener('finish', j),
        u && e.removeListener('drain', u),
        e.removeListener('error', b),
        e.removeListener('unpipe', s),
        n.removeListener('end', l),
        n.removeListener('end', x),
        n.removeListener('data', p),
        (a = !0),
        u && r.awaitDrainWriters && (!e._writableState || e._writableState.needDrain) && u();
    }
    function d() {
      a ||
        (r.pipes.length === 1 && r.pipes[0] === e
          ? (w('false write response, pause', 0), (r.awaitDrainWriters = e), (r.multiAwaitDrain = !1))
          : r.pipes.length > 1 &&
            r.pipes.includes(e) &&
            (w('false write response, pause', r.awaitDrainWriters.size), r.awaitDrainWriters.add(e)),
        n.pause()),
        u || ((u = Bc(n, e)), e.on('drain', u));
    }
    n.on('data', p);
    function p(R) {
      w('ondata');
      let S = e.write(R);
      w('dest.write', S), S === !1 && d();
    }
    function b(R) {
      if ((w('onerror', R), x(), e.removeListener('error', b), e.listenerCount('error') === 0)) {
        let S = e._writableState || e._readableState;
        S && !S.errorEmitted ? Ge(e, R) : e.emit('error', R);
      }
    }
    mc(e, 'error', b);
    function f() {
      e.removeListener('finish', j), x();
    }
    e.once('close', f);
    function j() {
      w('onfinish'), e.removeListener('close', f), x();
    }
    e.once('finish', j);
    function x() {
      w('unpipe'), n.unpipe(e);
    }
    return (
      e.emit('pipe', n), e.writableNeedDrain === !0 ? r.flowing && d() : r.flowing || (w('pipe resume'), n.resume()), e
    );
  };
  function Bc(e, t) {
    return function () {
      let r = e._readableState;
      r.awaitDrainWriters === t
        ? (w('pipeOnDrain', 1), (r.awaitDrainWriters = null))
        : r.multiAwaitDrain && (w('pipeOnDrain', r.awaitDrainWriters.size), r.awaitDrainWriters.delete(t)),
        (!r.awaitDrainWriters || r.awaitDrainWriters.size === 0) && e.listenerCount('data') && e.resume();
    };
  }
  g.prototype.unpipe = function (e) {
    let t = this._readableState,
      n = { hasUnpiped: !1 };
    if (t.pipes.length === 0) return this;
    if (!e) {
      let i = t.pipes;
      (t.pipes = []), this.pause();
      for (let o = 0; o < i.length; o++) i[o].emit('unpipe', this, { hasUnpiped: !1 });
      return this;
    }
    let r = hc(t.pipes, e);
    return r === -1
      ? this
      : (t.pipes.splice(r, 1), t.pipes.length === 0 && this.pause(), e.emit('unpipe', this, n), this);
  };
  g.prototype.on = function (e, t) {
    let n = Pe.prototype.on.call(this, e, t),
      r = this._readableState;
    return (
      e === 'data'
        ? ((r.readableListening = this.listenerCount('readable') > 0), r.flowing !== !1 && this.resume())
        : e === 'readable' &&
          !r.endEmitted &&
          !r.readableListening &&
          ((r.readableListening = r.needReadable = !0),
          (r.flowing = !1),
          (r.emittedReadable = !1),
          w('on readable', r.length, r.reading),
          r.length ? Ct(this) : r.reading || ie.nextTick($c, this)),
      n
    );
  };
  g.prototype.addListener = g.prototype.on;
  g.prototype.removeListener = function (e, t) {
    let n = Pe.prototype.removeListener.call(this, e, t);
    return e === 'readable' && ie.nextTick(Lo, this), n;
  };
  g.prototype.off = g.prototype.removeListener;
  g.prototype.removeAllListeners = function (e) {
    let t = Pe.prototype.removeAllListeners.apply(this, arguments);
    return (e === 'readable' || e === void 0) && ie.nextTick(Lo, this), t;
  };
  function Lo(e) {
    let t = e._readableState;
    (t.readableListening = e.listenerCount('readable') > 0),
      t.resumeScheduled && t[ve] === !1
        ? (t.flowing = !0)
        : e.listenerCount('data') > 0
        ? e.resume()
        : t.readableListening || (t.flowing = null);
  }
  function $c(e) {
    w('readable nexttick read 0'), e.read(0);
  }
  g.prototype.resume = function () {
    let e = this._readableState;
    return e.flowing || (w('resume'), (e.flowing = !e.readableListening), Jc(this, e)), (e[ve] = !1), this;
  };
  function Jc(e, t) {
    t.resumeScheduled || ((t.resumeScheduled = !0), ie.nextTick(Uc, e, t));
  }
  function Uc(e, t) {
    w('resume', t.reading),
      t.reading || e.read(0),
      (t.resumeScheduled = !1),
      e.emit('resume'),
      ko(e),
      t.flowing && !t.reading && e.read(0);
  }
  g.prototype.pause = function () {
    return (
      w('call pause flowing=%j', this._readableState.flowing),
      this._readableState.flowing !== !1 && (w('pause'), (this._readableState.flowing = !1), this.emit('pause')),
      (this._readableState[ve] = !0),
      this
    );
  };
  function ko(e) {
    let t = e._readableState;
    for (w('flow', t.flowing); t.flowing && e.read() !== null; );
  }
  g.prototype.wrap = function (e) {
    let t = !1;
    e.on('data', (r) => {
      !this.push(r) && e.pause && ((t = !0), e.pause());
    }),
      e.on('end', () => {
        this.push(null);
      }),
      e.on('error', (r) => {
        Ge(this, r);
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
    let n = _c(e);
    for (let r = 1; r < n.length; r++) {
      let i = n[r];
      this[i] === void 0 && typeof e[i] == 'function' && (this[i] = e[i].bind(e));
    }
    return this;
  };
  g.prototype[Ec] = function () {
    return Co(this);
  };
  g.prototype.iterator = function (e) {
    return e !== void 0 && qc(e, 'options'), Co(this, e);
  };
  function Co(e, t) {
    typeof e.read != 'function' && (e = g.wrap(e, { objectMode: !0 }));
    let n = Vc(e, t);
    return (n.stream = e), n;
  }
  async function* Vc(e, t) {
    let n = Fn;
    function r(s) {
      this === e ? (n(), (n = Fn)) : (n = s);
    }
    e.on('readable', r);
    let i,
      o = Tc(e, { writable: !1 }, (s) => {
        (i = s ? Mo(i, s) : null), n(), (n = Fn);
      });
    try {
      for (;;) {
        let s = e.destroyed ? null : e.read();
        if (s !== null) yield s;
        else {
          if (i) throw i;
          if (i === null) return;
          await new wc(r);
        }
      }
    } catch (s) {
      throw ((i = Mo(i, s)), i);
    } finally {
      (i || t?.destroyOnReturn !== !1) && (i === void 0 || e._readableState.autoDestroy)
        ? He.destroyer(e, null)
        : (e.off('readable', r), o());
    }
  }
  jo(g.prototype, {
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
  jo(Un.prototype, {
    pipesCount: {
      __proto__: null,
      get() {
        return this.pipes.length;
      },
    },
    paused: {
      __proto__: null,
      get() {
        return this[ve] !== !1;
      },
      set(e) {
        this[ve] = !!e;
      },
    },
  });
  g._fromList = Wo;
  function Wo(e, t) {
    if (t.length === 0) return null;
    let n;
    return (
      t.objectMode
        ? (n = t.buffer.shift())
        : !e || e >= t.length
        ? (t.decoder
            ? (n = t.buffer.join(''))
            : t.buffer.length === 1
            ? (n = t.buffer.first())
            : (n = t.buffer.concat(t.length)),
          t.buffer.clear())
        : (n = t.buffer.consume(e, t.decoder)),
      n
    );
  }
  function $n(e) {
    let t = e._readableState;
    w('endReadable', t.endEmitted), t.endEmitted || ((t.ended = !0), ie.nextTick(Gc, t, e));
  }
  function Gc(e, t) {
    if (
      (w('endReadableNT', e.endEmitted, e.length), !e.errored && !e.closeEmitted && !e.endEmitted && e.length === 0)
    ) {
      if (((e.endEmitted = !0), t.emit('end'), t.writable && t.allowHalfOpen === !1)) ie.nextTick(Hc, t);
      else if (e.autoDestroy) {
        let n = t._writableState;
        (!n || (n.autoDestroy && (n.finished || n.writable === !1))) && t.destroy();
      }
    }
  }
  function Hc(e) {
    e.writable && !e.writableEnded && !e.destroyed && e.end();
  }
  g.from = function (e, t) {
    return Lc(g, e, t);
  };
  var Jn;
  function Fo() {
    return Jn === void 0 && (Jn = {}), Jn;
  }
  g.fromWeb = function (e, t) {
    return Fo().newStreamReadableFromReadableStream(e, t);
  };
  g.toWeb = function (e, t) {
    return Fo().newReadableStreamFromStreamReadable(e, t);
  };
  g.wrap = function (e, t) {
    var n, r;
    return new g({
      objectMode:
        (n = (r = e.readableObjectMode) !== null && r !== void 0 ? r : e.objectMode) !== null && n !== void 0 ? n : !0,
      ...t,
      destroy(i, o) {
        He.destroyer(e, i), o(i);
      },
    }).wrap(e);
  };
});
var Zn = h((vh, Qo) => {
  var qe = Te(),
    {
      ArrayPrototypeSlice: Uo,
      Error: Kc,
      FunctionPrototypeSymbolHasInstance: Vo,
      ObjectDefineProperty: Go,
      ObjectDefineProperties: zc,
      ObjectSetPrototypeOf: Ho,
      StringPrototypeToLowerCase: Yc,
      Symbol: Zc,
      SymbolHasInstance: Xc,
    } = N();
  Qo.exports = D;
  D.WritableState = ft;
  var { EventEmitter: Qc } = require('events'),
    at = Nt().Stream,
    { Buffer: Wt } = require('buffer'),
    $t = Ne(),
    { addAbortSignal: ed } = st(),
    { getHighWaterMark: td, getDefaultHighWaterMark: nd } = Lt(),
    {
      ERR_INVALID_ARG_TYPE: rd,
      ERR_METHOD_NOT_IMPLEMENTED: id,
      ERR_MULTIPLE_CALLBACK: Ko,
      ERR_STREAM_CANNOT_PIPE: od,
      ERR_STREAM_DESTROYED: ut,
      ERR_STREAM_ALREADY_FINISHED: sd,
      ERR_STREAM_NULL_VALUES: ld,
      ERR_STREAM_WRITE_AFTER_END: ad,
      ERR_UNKNOWN_ENCODING: zo,
    } = W().codes,
    { errorOrDestroy: Ke } = $t;
  Ho(D.prototype, at.prototype);
  Ho(D, at);
  function Hn() {}
  var ze = Zc('kOnFinished');
  function ft(e, t, n) {
    typeof n != 'boolean' && (n = t instanceof ce()),
      (this.objectMode = !!(e && e.objectMode)),
      n && (this.objectMode = this.objectMode || !!(e && e.writableObjectMode)),
      (this.highWaterMark = e ? td(this, e, 'writableHighWaterMark', n) : nd(!1)),
      (this.finalCalled = !1),
      (this.needDrain = !1),
      (this.ending = !1),
      (this.ended = !1),
      (this.finished = !1),
      (this.destroyed = !1);
    let r = !!(e && e.decodeStrings === !1);
    (this.decodeStrings = !r),
      (this.defaultEncoding = (e && e.defaultEncoding) || 'utf8'),
      (this.length = 0),
      (this.writing = !1),
      (this.corked = 0),
      (this.sync = !0),
      (this.bufferProcessing = !1),
      (this.onwrite = fd.bind(void 0, t)),
      (this.writecb = null),
      (this.writelen = 0),
      (this.afterWriteTickInfo = null),
      Bt(this),
      (this.pendingcb = 0),
      (this.constructed = !0),
      (this.prefinished = !1),
      (this.errorEmitted = !1),
      (this.emitClose = !e || e.emitClose !== !1),
      (this.autoDestroy = !e || e.autoDestroy !== !1),
      (this.errored = null),
      (this.closed = !1),
      (this.closeEmitted = !1),
      (this[ze] = []);
  }
  function Bt(e) {
    (e.buffered = []), (e.bufferedIndex = 0), (e.allBuffers = !0), (e.allNoop = !0);
  }
  ft.prototype.getBuffer = function () {
    return Uo(this.buffered, this.bufferedIndex);
  };
  Go(ft.prototype, 'bufferedRequestCount', {
    __proto__: null,
    get() {
      return this.buffered.length - this.bufferedIndex;
    },
  });
  function D(e) {
    let t = this instanceof ce();
    if (!t && !Vo(D, this)) return new D(e);
    (this._writableState = new ft(e, this, t)),
      e &&
        (typeof e.write == 'function' && (this._write = e.write),
        typeof e.writev == 'function' && (this._writev = e.writev),
        typeof e.destroy == 'function' && (this._destroy = e.destroy),
        typeof e.final == 'function' && (this._final = e.final),
        typeof e.construct == 'function' && (this._construct = e.construct),
        e.signal && ed(e.signal, this)),
      at.call(this, e),
      $t.construct(this, () => {
        let n = this._writableState;
        n.writing || zn(this, n), Yn(this, n);
      });
  }
  Go(D, Xc, {
    __proto__: null,
    value: function (e) {
      return Vo(this, e) ? !0 : this !== D ? !1 : e && e._writableState instanceof ft;
    },
  });
  D.prototype.pipe = function () {
    Ke(this, new od());
  };
  function Yo(e, t, n, r) {
    let i = e._writableState;
    if (typeof n == 'function') (r = n), (n = i.defaultEncoding);
    else {
      if (!n) n = i.defaultEncoding;
      else if (n !== 'buffer' && !Wt.isEncoding(n)) throw new zo(n);
      typeof r != 'function' && (r = Hn);
    }
    if (t === null) throw new ld();
    if (!i.objectMode)
      if (typeof t == 'string') i.decodeStrings !== !1 && ((t = Wt.from(t, n)), (n = 'buffer'));
      else if (t instanceof Wt) n = 'buffer';
      else if (at._isUint8Array(t)) (t = at._uint8ArrayToBuffer(t)), (n = 'buffer');
      else throw new rd('chunk', ['string', 'Buffer', 'Uint8Array'], t);
    let o;
    return (
      i.ending ? (o = new ad()) : i.destroyed && (o = new ut('write')),
      o ? (qe.nextTick(r, o), Ke(e, o, !0), o) : (i.pendingcb++, ud(e, i, t, n, r))
    );
  }
  D.prototype.write = function (e, t, n) {
    return Yo(this, e, t, n) === !0;
  };
  D.prototype.cork = function () {
    this._writableState.corked++;
  };
  D.prototype.uncork = function () {
    let e = this._writableState;
    e.corked && (e.corked--, e.writing || zn(this, e));
  };
  D.prototype.setDefaultEncoding = function (t) {
    if ((typeof t == 'string' && (t = Yc(t)), !Wt.isEncoding(t))) throw new zo(t);
    return (this._writableState.defaultEncoding = t), this;
  };
  function ud(e, t, n, r, i) {
    let o = t.objectMode ? 1 : n.length;
    t.length += o;
    let s = t.length < t.highWaterMark;
    return (
      s || (t.needDrain = !0),
      t.writing || t.corked || t.errored || !t.constructed
        ? (t.buffered.push({ chunk: n, encoding: r, callback: i }),
          t.allBuffers && r !== 'buffer' && (t.allBuffers = !1),
          t.allNoop && i !== Hn && (t.allNoop = !1))
        : ((t.writelen = o),
          (t.writecb = i),
          (t.writing = !0),
          (t.sync = !0),
          e._write(n, r, t.onwrite),
          (t.sync = !1)),
      s && !t.errored && !t.destroyed
    );
  }
  function $o(e, t, n, r, i, o, s) {
    (t.writelen = r),
      (t.writecb = s),
      (t.writing = !0),
      (t.sync = !0),
      t.destroyed ? t.onwrite(new ut('write')) : n ? e._writev(i, t.onwrite) : e._write(i, o, t.onwrite),
      (t.sync = !1);
  }
  function Jo(e, t, n, r) {
    --t.pendingcb, r(n), Kn(t), Ke(e, n);
  }
  function fd(e, t) {
    let n = e._writableState,
      r = n.sync,
      i = n.writecb;
    if (typeof i != 'function') {
      Ke(e, new Ko());
      return;
    }
    (n.writing = !1),
      (n.writecb = null),
      (n.length -= n.writelen),
      (n.writelen = 0),
      t
        ? (t.stack,
          n.errored || (n.errored = t),
          e._readableState && !e._readableState.errored && (e._readableState.errored = t),
          r ? qe.nextTick(Jo, e, n, t, i) : Jo(e, n, t, i))
        : (n.buffered.length > n.bufferedIndex && zn(e, n),
          r
            ? n.afterWriteTickInfo !== null && n.afterWriteTickInfo.cb === i
              ? n.afterWriteTickInfo.count++
              : ((n.afterWriteTickInfo = { count: 1, cb: i, stream: e, state: n }),
                qe.nextTick(cd, n.afterWriteTickInfo))
            : Zo(e, n, 1, i));
  }
  function cd({ stream: e, state: t, count: n, cb: r }) {
    return (t.afterWriteTickInfo = null), Zo(e, t, n, r);
  }
  function Zo(e, t, n, r) {
    for (!t.ending && !e.destroyed && t.length === 0 && t.needDrain && ((t.needDrain = !1), e.emit('drain')); n-- > 0; )
      t.pendingcb--, r();
    t.destroyed && Kn(t), Yn(e, t);
  }
  function Kn(e) {
    if (e.writing) return;
    for (let i = e.bufferedIndex; i < e.buffered.length; ++i) {
      var t;
      let { chunk: o, callback: s } = e.buffered[i],
        l = e.objectMode ? 1 : o.length;
      (e.length -= l), s((t = e.errored) !== null && t !== void 0 ? t : new ut('write'));
    }
    let n = e[ze].splice(0);
    for (let i = 0; i < n.length; i++) {
      var r;
      n[i]((r = e.errored) !== null && r !== void 0 ? r : new ut('end'));
    }
    Bt(e);
  }
  function zn(e, t) {
    if (t.corked || t.bufferProcessing || t.destroyed || !t.constructed) return;
    let { buffered: n, bufferedIndex: r, objectMode: i } = t,
      o = n.length - r;
    if (!o) return;
    let s = r;
    if (((t.bufferProcessing = !0), o > 1 && e._writev)) {
      t.pendingcb -= o - 1;
      let l = t.allNoop
          ? Hn
          : (a) => {
              for (let c = s; c < n.length; ++c) n[c].callback(a);
            },
        u = t.allNoop && s === 0 ? n : Uo(n, s);
      (u.allBuffers = t.allBuffers), $o(e, t, !0, t.length, u, '', l), Bt(t);
    } else {
      do {
        let { chunk: l, encoding: u, callback: a } = n[s];
        n[s++] = null;
        let c = i ? 1 : l.length;
        $o(e, t, !1, c, l, u, a);
      } while (s < n.length && !t.writing);
      s === n.length ? Bt(t) : s > 256 ? (n.splice(0, s), (t.bufferedIndex = 0)) : (t.bufferedIndex = s);
    }
    t.bufferProcessing = !1;
  }
  D.prototype._write = function (e, t, n) {
    if (this._writev) this._writev([{ chunk: e, encoding: t }], n);
    else throw new id('_write()');
  };
  D.prototype._writev = null;
  D.prototype.end = function (e, t, n) {
    let r = this._writableState;
    typeof e == 'function' ? ((n = e), (e = null), (t = null)) : typeof t == 'function' && ((n = t), (t = null));
    let i;
    if (e != null) {
      let o = Yo(this, e, t);
      o instanceof Kc && (i = o);
    }
    return (
      r.corked && ((r.corked = 1), this.uncork()),
      i ||
        (!r.errored && !r.ending
          ? ((r.ending = !0), Yn(this, r, !0), (r.ended = !0))
          : r.finished
          ? (i = new sd('end'))
          : r.destroyed && (i = new ut('end'))),
      typeof n == 'function' && (i || r.finished ? qe.nextTick(n, i) : r[ze].push(n)),
      this
    );
  };
  function Ft(e) {
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
  function dd(e, t) {
    let n = !1;
    function r(i) {
      if (n) {
        Ke(e, i ?? Ko());
        return;
      }
      if (((n = !0), t.pendingcb--, i)) {
        let o = t[ze].splice(0);
        for (let s = 0; s < o.length; s++) o[s](i);
        Ke(e, i, t.sync);
      } else Ft(t) && ((t.prefinished = !0), e.emit('prefinish'), t.pendingcb++, qe.nextTick(Gn, e, t));
    }
    (t.sync = !0), t.pendingcb++;
    try {
      e._final(r);
    } catch (i) {
      r(i);
    }
    t.sync = !1;
  }
  function bd(e, t) {
    !t.prefinished &&
      !t.finalCalled &&
      (typeof e._final == 'function' && !t.destroyed
        ? ((t.finalCalled = !0), dd(e, t))
        : ((t.prefinished = !0), e.emit('prefinish')));
  }
  function Yn(e, t, n) {
    Ft(t) &&
      (bd(e, t),
      t.pendingcb === 0 &&
        (n
          ? (t.pendingcb++,
            qe.nextTick(
              (r, i) => {
                Ft(i) ? Gn(r, i) : i.pendingcb--;
              },
              e,
              t
            ))
          : Ft(t) && (t.pendingcb++, Gn(e, t))));
  }
  function Gn(e, t) {
    t.pendingcb--, (t.finished = !0);
    let n = t[ze].splice(0);
    for (let r = 0; r < n.length; r++) n[r]();
    if ((e.emit('finish'), t.autoDestroy)) {
      let r = e._readableState;
      (!r || (r.autoDestroy && (r.endEmitted || r.readable === !1))) && e.destroy();
    }
  }
  zc(D.prototype, {
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
  var hd = $t.destroy;
  D.prototype.destroy = function (e, t) {
    let n = this._writableState;
    return (
      !n.destroyed && (n.bufferedIndex < n.buffered.length || n[ze].length) && qe.nextTick(Kn, n),
      hd.call(this, e, t),
      this
    );
  };
  D.prototype._undestroy = $t.undestroy;
  D.prototype._destroy = function (e, t) {
    t(e);
  };
  D.prototype[Qc.captureRejectionSymbol] = function (e) {
    this.destroy(e);
  };
  var Vn;
  function Xo() {
    return Vn === void 0 && (Vn = {}), Vn;
  }
  D.fromWeb = function (e, t) {
    return Xo().newStreamWritableFromWritableStream(e, t);
  };
  D.toWeb = function (e) {
    return Xo().newWritableStreamFromStreamWritable(e);
  };
});
var cs = h((qh, fs) => {
  var Xn = Te(),
    pd = require('buffer'),
    {
      isReadable: yd,
      isWritable: gd,
      isIterable: es,
      isNodeStream: _d,
      isReadableNodeStream: ts,
      isWritableNodeStream: ns,
      isDuplexNodeStream: wd,
    } = ue(),
    rs = pe(),
    {
      AbortError: us,
      codes: { ERR_INVALID_ARG_TYPE: Sd, ERR_INVALID_RETURN_VALUE: is },
    } = W(),
    { destroyer: Ye } = Ne(),
    Ed = ce(),
    Ad = lt(),
    { createDeferredPromise: os } = le(),
    ss = Cn(),
    ls = globalThis.Blob || pd.Blob,
    Rd =
      typeof ls < 'u'
        ? function (t) {
            return t instanceof ls;
          }
        : function (t) {
            return !1;
          },
    md = globalThis.AbortController || mt().AbortController,
    { FunctionPrototypeCall: as } = N(),
    Le = class extends Ed {
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
  fs.exports = function e(t, n) {
    if (wd(t)) return t;
    if (ts(t)) return Jt({ readable: t });
    if (ns(t)) return Jt({ writable: t });
    if (_d(t)) return Jt({ writable: !1, readable: !1 });
    if (typeof t == 'function') {
      let { value: i, write: o, final: s, destroy: l } = Od(t);
      if (es(i)) return ss(Le, i, { objectMode: !0, write: o, final: s, destroy: l });
      let u = i?.then;
      if (typeof u == 'function') {
        let a,
          c = as(
            u,
            i,
            (d) => {
              if (d != null) throw new is('nully', 'body', d);
            },
            (d) => {
              Ye(a, d);
            }
          );
        return (a = new Le({
          objectMode: !0,
          readable: !1,
          write: o,
          final(d) {
            s(async () => {
              try {
                await c, Xn.nextTick(d, null);
              } catch (p) {
                Xn.nextTick(d, p);
              }
            });
          },
          destroy: l,
        }));
      }
      throw new is('Iterable, AsyncIterable or AsyncFunction', n, i);
    }
    if (Rd(t)) return e(t.arrayBuffer());
    if (es(t)) return ss(Le, t, { objectMode: !0, writable: !1 });
    if (typeof t?.writable == 'object' || typeof t?.readable == 'object') {
      let i = t != null && t.readable ? (ts(t?.readable) ? t?.readable : e(t.readable)) : void 0,
        o = t != null && t.writable ? (ns(t?.writable) ? t?.writable : e(t.writable)) : void 0;
      return Jt({ readable: i, writable: o });
    }
    let r = t?.then;
    if (typeof r == 'function') {
      let i;
      return (
        as(
          r,
          t,
          (o) => {
            o != null && i.push(o), i.push(null);
          },
          (o) => {
            Ye(i, o);
          }
        ),
        (i = new Le({ objectMode: !0, writable: !1, read() {} }))
      );
    }
    throw new Sd(
      n,
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
  function Od(e) {
    let { promise: t, resolve: n } = os(),
      r = new md(),
      i = r.signal;
    return {
      value: e(
        (async function* () {
          for (;;) {
            let s = t;
            t = null;
            let { chunk: l, done: u, cb: a } = await s;
            if ((Xn.nextTick(a), u)) return;
            if (i.aborted) throw new us(void 0, { cause: i.reason });
            ({ promise: t, resolve: n } = os()), yield l;
          }
        })(),
        { signal: i }
      ),
      write(s, l, u) {
        let a = n;
        (n = null), a({ chunk: s, done: !1, cb: u });
      },
      final(s) {
        let l = n;
        (n = null), l({ done: !0, cb: s });
      },
      destroy(s, l) {
        r.abort(), l(s);
      },
    };
  }
  function Jt(e) {
    let t = e.readable && typeof e.readable.read != 'function' ? Ad.wrap(e.readable) : e.readable,
      n = e.writable,
      r = !!yd(t),
      i = !!gd(n),
      o,
      s,
      l,
      u,
      a;
    function c(d) {
      let p = u;
      (u = null), p ? p(d) : d && a.destroy(d);
    }
    return (
      (a = new Le({
        readableObjectMode: !!(t != null && t.readableObjectMode),
        writableObjectMode: !!(n != null && n.writableObjectMode),
        readable: r,
        writable: i,
      })),
      i &&
        (rs(n, (d) => {
          (i = !1), d && Ye(t, d), c(d);
        }),
        (a._write = function (d, p, b) {
          n.write(d, p) ? b() : (o = b);
        }),
        (a._final = function (d) {
          n.end(), (s = d);
        }),
        n.on('drain', function () {
          if (o) {
            let d = o;
            (o = null), d();
          }
        }),
        n.on('finish', function () {
          if (s) {
            let d = s;
            (s = null), d();
          }
        })),
      r &&
        (rs(t, (d) => {
          (r = !1), d && Ye(t, d), c(d);
        }),
        t.on('readable', function () {
          if (l) {
            let d = l;
            (l = null), d();
          }
        }),
        t.on('end', function () {
          a.push(null);
        }),
        (a._read = function () {
          for (;;) {
            let d = t.read();
            if (d === null) {
              l = a._read;
              return;
            }
            if (!a.push(d)) return;
          }
        })),
      (a._destroy = function (d, p) {
        !d && u !== null && (d = new us()),
          (l = null),
          (o = null),
          (s = null),
          u === null ? p(d) : ((u = p), Ye(n, d), Ye(t, d));
      }),
      a
    );
  }
});
var ce = h((Lh, hs) => {
  'use strict';
  var {
    ObjectDefineProperties: Td,
    ObjectGetOwnPropertyDescriptor: ye,
    ObjectKeys: xd,
    ObjectSetPrototypeOf: ds,
  } = N();
  hs.exports = oe;
  var tr = lt(),
    Y = Zn();
  ds(oe.prototype, tr.prototype);
  ds(oe, tr);
  {
    let e = xd(Y.prototype);
    for (let t = 0; t < e.length; t++) {
      let n = e[t];
      oe.prototype[n] || (oe.prototype[n] = Y.prototype[n]);
    }
  }
  function oe(e) {
    if (!(this instanceof oe)) return new oe(e);
    tr.call(this, e),
      Y.call(this, e),
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
  Td(oe.prototype, {
    writable: { __proto__: null, ...ye(Y.prototype, 'writable') },
    writableHighWaterMark: { __proto__: null, ...ye(Y.prototype, 'writableHighWaterMark') },
    writableObjectMode: { __proto__: null, ...ye(Y.prototype, 'writableObjectMode') },
    writableBuffer: { __proto__: null, ...ye(Y.prototype, 'writableBuffer') },
    writableLength: { __proto__: null, ...ye(Y.prototype, 'writableLength') },
    writableFinished: { __proto__: null, ...ye(Y.prototype, 'writableFinished') },
    writableCorked: { __proto__: null, ...ye(Y.prototype, 'writableCorked') },
    writableEnded: { __proto__: null, ...ye(Y.prototype, 'writableEnded') },
    writableNeedDrain: { __proto__: null, ...ye(Y.prototype, 'writableNeedDrain') },
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
  var Qn;
  function bs() {
    return Qn === void 0 && (Qn = {}), Qn;
  }
  oe.fromWeb = function (e, t) {
    return bs().newStreamDuplexFromReadableWritablePair(e, t);
  };
  oe.toWeb = function (e) {
    return bs().newReadableWritablePairFromDuplex(e);
  };
  var er;
  oe.from = function (e) {
    return er || (er = cs()), er(e, 'body');
  };
});
var ir = h((kh, ys) => {
  'use strict';
  var { ObjectSetPrototypeOf: ps, Symbol: Pd } = N();
  ys.exports = ge;
  var { ERR_METHOD_NOT_IMPLEMENTED: Md } = W().codes,
    rr = ce(),
    { getHighWaterMark: Dd } = Lt();
  ps(ge.prototype, rr.prototype);
  ps(ge, rr);
  var ct = Pd('kCallback');
  function ge(e) {
    if (!(this instanceof ge)) return new ge(e);
    let t = e ? Dd(this, e, 'readableHighWaterMark', !0) : null;
    t === 0 &&
      (e = {
        ...e,
        highWaterMark: null,
        readableHighWaterMark: t,
        writableHighWaterMark: e.writableHighWaterMark || 0,
      }),
      rr.call(this, e),
      (this._readableState.sync = !1),
      (this[ct] = null),
      e &&
        (typeof e.transform == 'function' && (this._transform = e.transform),
        typeof e.flush == 'function' && (this._flush = e.flush)),
      this.on('prefinish', jd);
  }
  function nr(e) {
    typeof this._flush == 'function' && !this.destroyed
      ? this._flush((t, n) => {
          if (t) {
            e ? e(t) : this.destroy(t);
            return;
          }
          n != null && this.push(n), this.push(null), e && e();
        })
      : (this.push(null), e && e());
  }
  function jd() {
    this._final !== nr && nr.call(this);
  }
  ge.prototype._final = nr;
  ge.prototype._transform = function (e, t, n) {
    throw new Md('_transform()');
  };
  ge.prototype._write = function (e, t, n) {
    let r = this._readableState,
      i = this._writableState,
      o = r.length;
    this._transform(e, t, (s, l) => {
      if (s) {
        n(s);
        return;
      }
      l != null && this.push(l), i.ended || o === r.length || r.length < r.highWaterMark ? n() : (this[ct] = n);
    });
  };
  ge.prototype._read = function () {
    if (this[ct]) {
      let e = this[ct];
      (this[ct] = null), e();
    }
  };
});
var sr = h((Ch, _s) => {
  'use strict';
  var { ObjectSetPrototypeOf: gs } = N();
  _s.exports = Ze;
  var or = ir();
  gs(Ze.prototype, or.prototype);
  gs(Ze, or);
  function Ze(e) {
    if (!(this instanceof Ze)) return new Ze(e);
    or.call(this, e);
  }
  Ze.prototype._transform = function (e, t, n) {
    n(null, e);
  };
});
var Ht = h((Wh, Rs) => {
  var dt = Te(),
    { ArrayIsArray: Id, Promise: Nd, SymbolAsyncIterator: vd } = N(),
    Gt = pe(),
    { once: qd } = le(),
    Ld = Ne(),
    ws = ce(),
    {
      aggregateTwoErrors: kd,
      codes: {
        ERR_INVALID_ARG_TYPE: hr,
        ERR_INVALID_RETURN_VALUE: lr,
        ERR_MISSING_ARGS: Cd,
        ERR_STREAM_DESTROYED: Wd,
        ERR_STREAM_PREMATURE_CLOSE: Fd,
      },
      AbortError: Bd,
    } = W(),
    { validateFunction: $d, validateAbortSignal: Jd } = ot(),
    {
      isIterable: ke,
      isReadable: ar,
      isReadableNodeStream: Vt,
      isNodeStream: Ss,
      isTransformStream: Xe,
      isWebStream: Ud,
      isReadableStream: ur,
      isReadableEnded: Vd,
    } = ue(),
    Gd = globalThis.AbortController || mt().AbortController,
    fr,
    cr;
  function Es(e, t, n) {
    let r = !1;
    e.on('close', () => {
      r = !0;
    });
    let i = Gt(e, { readable: t, writable: n }, (o) => {
      r = !o;
    });
    return {
      destroy: (o) => {
        r || ((r = !0), Ld.destroyer(e, o || new Wd('pipe')));
      },
      cleanup: i,
    };
  }
  function Hd(e) {
    return $d(e[e.length - 1], 'streams[stream.length - 1]'), e.pop();
  }
  function dr(e) {
    if (ke(e)) return e;
    if (Vt(e)) return Kd(e);
    throw new hr('val', ['Readable', 'Iterable', 'AsyncIterable'], e);
  }
  async function* Kd(e) {
    cr || (cr = lt()), yield* cr.prototype[vd].call(e);
  }
  async function Ut(e, t, n, { end: r }) {
    let i,
      o = null,
      s = (a) => {
        if ((a && (i = a), o)) {
          let c = o;
          (o = null), c();
        }
      },
      l = () =>
        new Nd((a, c) => {
          i
            ? c(i)
            : (o = () => {
                i ? c(i) : a();
              });
        });
    t.on('drain', s);
    let u = Gt(t, { readable: !1 }, s);
    try {
      t.writableNeedDrain && (await l());
      for await (let a of e) t.write(a) || (await l());
      r && t.end(), await l(), n();
    } catch (a) {
      n(i !== a ? kd(i, a) : a);
    } finally {
      u(), t.off('drain', s);
    }
  }
  async function br(e, t, n, { end: r }) {
    Xe(t) && (t = t.writable);
    let i = t.getWriter();
    try {
      for await (let o of e) await i.ready, i.write(o).catch(() => {});
      await i.ready, r && (await i.close()), n();
    } catch (o) {
      try {
        await i.abort(o), n(o);
      } catch (s) {
        n(s);
      }
    }
  }
  function zd(...e) {
    return As(e, qd(Hd(e)));
  }
  function As(e, t, n) {
    if ((e.length === 1 && Id(e[0]) && (e = e[0]), e.length < 2)) throw new Cd('streams');
    let r = new Gd(),
      i = r.signal,
      o = n?.signal,
      s = [];
    Jd(o, 'options.signal');
    function l() {
      b(new Bd());
    }
    o?.addEventListener('abort', l);
    let u,
      a,
      c = [],
      d = 0;
    function p(S) {
      b(S, --d === 0);
    }
    function b(S, y) {
      if ((S && (!u || u.code === 'ERR_STREAM_PREMATURE_CLOSE') && (u = S), !(!u && !y))) {
        for (; c.length; ) c.shift()(u);
        o?.removeEventListener('abort', l), r.abort(), y && (u || s.forEach((L) => L()), dt.nextTick(t, u, a));
      }
    }
    let f;
    for (let S = 0; S < e.length; S++) {
      let y = e[S],
        L = S < e.length - 1,
        k = S > 0,
        B = L || n?.end !== !1,
        Be = S === e.length - 1;
      if (Ss(y)) {
        let $ = function (be) {
          be && be.name !== 'AbortError' && be.code !== 'ERR_STREAM_PREMATURE_CLOSE' && p(be);
        };
        var R = $;
        if (B) {
          let { destroy: be, cleanup: Qt } = Es(y, L, k);
          c.push(be), ar(y) && Be && s.push(Qt);
        }
        y.on('error', $),
          ar(y) &&
            Be &&
            s.push(() => {
              y.removeListener('error', $);
            });
      }
      if (S === 0)
        if (typeof y == 'function') {
          if (((f = y({ signal: i })), !ke(f))) throw new lr('Iterable, AsyncIterable or Stream', 'source', f);
        } else ke(y) || Vt(y) || Xe(y) ? (f = y) : (f = ws.from(y));
      else if (typeof y == 'function') {
        if (Xe(f)) {
          var j;
          f = dr((j = f) === null || j === void 0 ? void 0 : j.readable);
        } else f = dr(f);
        if (((f = y(f, { signal: i })), L)) {
          if (!ke(f, !0)) throw new lr('AsyncIterable', `transform[${S - 1}]`, f);
        } else {
          var x;
          fr || (fr = sr());
          let $ = new fr({ objectMode: !0 }),
            be = (x = f) === null || x === void 0 ? void 0 : x.then;
          if (typeof be == 'function')
            d++,
              be.call(
                f,
                (we) => {
                  (a = we), we != null && $.write(we), B && $.end(), dt.nextTick(p);
                },
                (we) => {
                  $.destroy(we), dt.nextTick(p, we);
                }
              );
          else if (ke(f, !0)) d++, Ut(f, $, p, { end: B });
          else if (ur(f) || Xe(f)) {
            let we = f.readable || f;
            d++, Ut(we, $, p, { end: B });
          } else throw new lr('AsyncIterable or Promise', 'destination', f);
          f = $;
          let { destroy: Qt, cleanup: Qs } = Es(f, !1, !0);
          c.push(Qt), Be && s.push(Qs);
        }
      } else if (Ss(y)) {
        if (Vt(f)) {
          d += 2;
          let $ = Yd(f, y, p, { end: B });
          ar(y) && Be && s.push($);
        } else if (Xe(f) || ur(f)) {
          let $ = f.readable || f;
          d++, Ut($, y, p, { end: B });
        } else if (ke(f)) d++, Ut(f, y, p, { end: B });
        else throw new hr('val', ['Readable', 'Iterable', 'AsyncIterable', 'ReadableStream', 'TransformStream'], f);
        f = y;
      } else if (Ud(y)) {
        if (Vt(f)) d++, br(dr(f), y, p, { end: B });
        else if (ur(f) || ke(f)) d++, br(f, y, p, { end: B });
        else if (Xe(f)) d++, br(f.readable, y, p, { end: B });
        else throw new hr('val', ['Readable', 'Iterable', 'AsyncIterable', 'ReadableStream', 'TransformStream'], f);
        f = y;
      } else f = ws.from(y);
    }
    return ((i != null && i.aborted) || (o != null && o.aborted)) && dt.nextTick(l), f;
  }
  function Yd(e, t, n, { end: r }) {
    let i = !1;
    if (
      (t.on('close', () => {
        i || n(new Fd());
      }),
      e.pipe(t, { end: !1 }),
      r)
    ) {
      let s = function () {
        (i = !0), t.end();
      };
      var o = s;
      Vd(e) ? dt.nextTick(s) : e.once('end', s);
    } else n();
    return (
      Gt(e, { readable: !0, writable: !1 }, (s) => {
        let l = e._readableState;
        s && s.code === 'ERR_STREAM_PREMATURE_CLOSE' && l && l.ended && !l.errored && !l.errorEmitted
          ? e.once('end', n).once('error', n)
          : n(s);
      }),
      Gt(t, { readable: !1, writable: !0 }, n)
    );
  }
  Rs.exports = { pipelineImpl: As, pipeline: zd };
});
var yr = h((Fh, Ms) => {
  'use strict';
  var { pipeline: Zd } = Ht(),
    Kt = ce(),
    { destroyer: Xd } = Ne(),
    {
      isNodeStream: zt,
      isReadable: ms,
      isWritable: Os,
      isWebStream: pr,
      isTransformStream: Ce,
      isWritableStream: Ts,
      isReadableStream: xs,
    } = ue(),
    {
      AbortError: Qd,
      codes: { ERR_INVALID_ARG_VALUE: Ps, ERR_MISSING_ARGS: eb },
    } = W(),
    tb = pe();
  Ms.exports = function (...t) {
    if (t.length === 0) throw new eb('streams');
    if (t.length === 1) return Kt.from(t[0]);
    let n = [...t];
    if ((typeof t[0] == 'function' && (t[0] = Kt.from(t[0])), typeof t[t.length - 1] == 'function')) {
      let b = t.length - 1;
      t[b] = Kt.from(t[b]);
    }
    for (let b = 0; b < t.length; ++b)
      if (!(!zt(t[b]) && !pr(t[b]))) {
        if (b < t.length - 1 && !(ms(t[b]) || xs(t[b]) || Ce(t[b])))
          throw new Ps(`streams[${b}]`, n[b], 'must be readable');
        if (b > 0 && !(Os(t[b]) || Ts(t[b]) || Ce(t[b]))) throw new Ps(`streams[${b}]`, n[b], 'must be writable');
      }
    let r, i, o, s, l;
    function u(b) {
      let f = s;
      (s = null), f ? f(b) : b ? l.destroy(b) : !p && !d && l.destroy();
    }
    let a = t[0],
      c = Zd(t, u),
      d = !!(Os(a) || Ts(a) || Ce(a)),
      p = !!(ms(c) || xs(c) || Ce(c));
    if (
      ((l = new Kt({
        writableObjectMode: !!(a != null && a.writableObjectMode),
        readableObjectMode: !!(c != null && c.writableObjectMode),
        writable: d,
        readable: p,
      })),
      d)
    ) {
      if (zt(a))
        (l._write = function (f, j, x) {
          a.write(f, j) ? x() : (r = x);
        }),
          (l._final = function (f) {
            a.end(), (i = f);
          }),
          a.on('drain', function () {
            if (r) {
              let f = r;
              (r = null), f();
            }
          });
      else if (pr(a)) {
        let j = (Ce(a) ? a.writable : a).getWriter();
        (l._write = async function (x, R, S) {
          try {
            await j.ready, j.write(x).catch(() => {}), S();
          } catch (y) {
            S(y);
          }
        }),
          (l._final = async function (x) {
            try {
              await j.ready, j.close().catch(() => {}), (i = x);
            } catch (R) {
              x(R);
            }
          });
      }
      let b = Ce(c) ? c.readable : c;
      tb(b, () => {
        if (i) {
          let f = i;
          (i = null), f();
        }
      });
    }
    if (p) {
      if (zt(c))
        c.on('readable', function () {
          if (o) {
            let b = o;
            (o = null), b();
          }
        }),
          c.on('end', function () {
            l.push(null);
          }),
          (l._read = function () {
            for (;;) {
              let b = c.read();
              if (b === null) {
                o = l._read;
                return;
              }
              if (!l.push(b)) return;
            }
          });
      else if (pr(c)) {
        let f = (Ce(c) ? c.readable : c).getReader();
        l._read = async function () {
          for (;;)
            try {
              let { value: j, done: x } = await f.read();
              if (!l.push(j)) return;
              if (x) {
                l.push(null);
                return;
              }
            } catch {
              return;
            }
        };
      }
    }
    return (
      (l._destroy = function (b, f) {
        !b && s !== null && (b = new Qd()),
          (o = null),
          (r = null),
          (i = null),
          s === null ? f(b) : ((s = f), zt(c) && Xd(c, b));
      }),
      l
    );
  };
});
var ks = h((Bh, wr) => {
  'use strict';
  var Ns = globalThis.AbortController || mt().AbortController,
    {
      codes: { ERR_INVALID_ARG_VALUE: nb, ERR_INVALID_ARG_TYPE: bt, ERR_MISSING_ARGS: rb, ERR_OUT_OF_RANGE: ib },
      AbortError: de,
    } = W(),
    { validateAbortSignal: We, validateInteger: ob, validateObject: Fe } = ot(),
    sb = N().Symbol('kWeak'),
    { finished: lb } = pe(),
    ab = yr(),
    { addAbortSignalNoValidate: ub } = st(),
    { isWritable: fb, isNodeStream: cb } = ue(),
    {
      ArrayPrototypePush: db,
      MathFloor: bb,
      Number: hb,
      NumberIsNaN: pb,
      Promise: Ds,
      PromiseReject: js,
      PromisePrototypeThen: yb,
      Symbol: vs,
    } = N(),
    Yt = vs('kEmpty'),
    Is = vs('kEof');
  function gb(e, t) {
    if ((t != null && Fe(t, 'options'), t?.signal != null && We(t.signal, 'options.signal'), cb(e) && !fb(e)))
      throw new nb('stream', e, 'must be writable');
    let n = ab(this, e);
    return t != null && t.signal && ub(t.signal, n), n;
  }
  function Zt(e, t) {
    if (typeof e != 'function') throw new bt('fn', ['Function', 'AsyncFunction'], e);
    t != null && Fe(t, 'options'), t?.signal != null && We(t.signal, 'options.signal');
    let n = 1;
    return (
      t?.concurrency != null && (n = bb(t.concurrency)),
      ob(n, 'concurrency', 1),
      async function* () {
        var i, o;
        let s = new Ns(),
          l = this,
          u = [],
          a = s.signal,
          c = { signal: a },
          d = () => s.abort();
        t != null && (i = t.signal) !== null && i !== void 0 && i.aborted && d(),
          t == null || (o = t.signal) === null || o === void 0 || o.addEventListener('abort', d);
        let p,
          b,
          f = !1;
        function j() {
          f = !0;
        }
        async function x() {
          try {
            for await (let y of l) {
              var R;
              if (f) return;
              if (a.aborted) throw new de();
              try {
                y = e(y, c);
              } catch (L) {
                y = js(L);
              }
              y !== Yt &&
                (typeof ((R = y) === null || R === void 0 ? void 0 : R.catch) == 'function' && y.catch(j),
                u.push(y),
                p && (p(), (p = null)),
                !f &&
                  u.length &&
                  u.length >= n &&
                  (await new Ds((L) => {
                    b = L;
                  })));
            }
            u.push(Is);
          } catch (y) {
            let L = js(y);
            yb(L, void 0, j), u.push(L);
          } finally {
            var S;
            (f = !0),
              p && (p(), (p = null)),
              t == null || (S = t.signal) === null || S === void 0 || S.removeEventListener('abort', d);
          }
        }
        x();
        try {
          for (;;) {
            for (; u.length > 0; ) {
              let R = await u[0];
              if (R === Is) return;
              if (a.aborted) throw new de();
              R !== Yt && (yield R), u.shift(), b && (b(), (b = null));
            }
            await new Ds((R) => {
              p = R;
            });
          }
        } finally {
          s.abort(), (f = !0), b && (b(), (b = null));
        }
      }.call(this)
    );
  }
  function _b(e = void 0) {
    return (
      e != null && Fe(e, 'options'),
      e?.signal != null && We(e.signal, 'options.signal'),
      async function* () {
        let n = 0;
        for await (let i of this) {
          var r;
          if (e != null && (r = e.signal) !== null && r !== void 0 && r.aborted)
            throw new de({ cause: e.signal.reason });
          yield [n++, i];
        }
      }.call(this)
    );
  }
  async function qs(e, t = void 0) {
    for await (let n of _r.call(this, e, t)) return !0;
    return !1;
  }
  async function wb(e, t = void 0) {
    if (typeof e != 'function') throw new bt('fn', ['Function', 'AsyncFunction'], e);
    return !(await qs.call(this, async (...n) => !(await e(...n)), t));
  }
  async function Sb(e, t) {
    for await (let n of _r.call(this, e, t)) return n;
  }
  async function Eb(e, t) {
    if (typeof e != 'function') throw new bt('fn', ['Function', 'AsyncFunction'], e);
    async function n(r, i) {
      return await e(r, i), Yt;
    }
    for await (let r of Zt.call(this, n, t));
  }
  function _r(e, t) {
    if (typeof e != 'function') throw new bt('fn', ['Function', 'AsyncFunction'], e);
    async function n(r, i) {
      return (await e(r, i)) ? r : Yt;
    }
    return Zt.call(this, n, t);
  }
  var gr = class extends rb {
    constructor() {
      super('reduce'), (this.message = 'Reduce of an empty stream requires an initial value');
    }
  };
  async function Ab(e, t, n) {
    var r;
    if (typeof e != 'function') throw new bt('reducer', ['Function', 'AsyncFunction'], e);
    n != null && Fe(n, 'options'), n?.signal != null && We(n.signal, 'options.signal');
    let i = arguments.length > 1;
    if (n != null && (r = n.signal) !== null && r !== void 0 && r.aborted) {
      let a = new de(void 0, { cause: n.signal.reason });
      throw (this.once('error', () => {}), await lb(this.destroy(a)), a);
    }
    let o = new Ns(),
      s = o.signal;
    if (n != null && n.signal) {
      let a = { once: !0, [sb]: this };
      n.signal.addEventListener('abort', () => o.abort(), a);
    }
    let l = !1;
    try {
      for await (let a of this) {
        var u;
        if (((l = !0), n != null && (u = n.signal) !== null && u !== void 0 && u.aborted)) throw new de();
        i ? (t = await e(t, a, { signal: s })) : ((t = a), (i = !0));
      }
      if (!l && !i) throw new gr();
    } finally {
      o.abort();
    }
    return t;
  }
  async function Rb(e) {
    e != null && Fe(e, 'options'), e?.signal != null && We(e.signal, 'options.signal');
    let t = [];
    for await (let r of this) {
      var n;
      if (e != null && (n = e.signal) !== null && n !== void 0 && n.aborted)
        throw new de(void 0, { cause: e.signal.reason });
      db(t, r);
    }
    return t;
  }
  function mb(e, t) {
    let n = Zt.call(this, e, t);
    return async function* () {
      for await (let i of n) yield* i;
    }.call(this);
  }
  function Ls(e) {
    if (((e = hb(e)), pb(e))) return 0;
    if (e < 0) throw new ib('number', '>= 0', e);
    return e;
  }
  function Ob(e, t = void 0) {
    return (
      t != null && Fe(t, 'options'),
      t?.signal != null && We(t.signal, 'options.signal'),
      (e = Ls(e)),
      async function* () {
        var r;
        if (t != null && (r = t.signal) !== null && r !== void 0 && r.aborted) throw new de();
        for await (let o of this) {
          var i;
          if (t != null && (i = t.signal) !== null && i !== void 0 && i.aborted) throw new de();
          e-- <= 0 && (yield o);
        }
      }.call(this)
    );
  }
  function Tb(e, t = void 0) {
    return (
      t != null && Fe(t, 'options'),
      t?.signal != null && We(t.signal, 'options.signal'),
      (e = Ls(e)),
      async function* () {
        var r;
        if (t != null && (r = t.signal) !== null && r !== void 0 && r.aborted) throw new de();
        for await (let o of this) {
          var i;
          if (t != null && (i = t.signal) !== null && i !== void 0 && i.aborted) throw new de();
          if (e-- > 0) yield o;
          else return;
        }
      }.call(this)
    );
  }
  wr.exports.streamReturningOperators = {
    asIndexedPairs: _b,
    drop: Ob,
    filter: _r,
    flatMap: mb,
    map: Zt,
    take: Tb,
    compose: gb,
  };
  wr.exports.promiseReturningOperators = { every: wb, forEach: Eb, reduce: Ab, toArray: Rb, some: qs, find: Sb };
});
var Sr = h(($h, Cs) => {
  'use strict';
  var { ArrayPrototypePop: xb, Promise: Pb } = N(),
    { isIterable: Mb, isNodeStream: Db, isWebStream: jb } = ue(),
    { pipelineImpl: Ib } = Ht(),
    { finished: Nb } = pe();
  require('stream');
  function vb(...e) {
    return new Pb((t, n) => {
      let r,
        i,
        o = e[e.length - 1];
      if (o && typeof o == 'object' && !Db(o) && !Mb(o) && !jb(o)) {
        let s = xb(e);
        (r = s.signal), (i = s.end);
      }
      Ib(
        e,
        (s, l) => {
          s ? n(s) : t(l);
        },
        { signal: r, end: i }
      );
    });
  }
  Cs.exports = { finished: Nb, pipeline: vb };
});
var Ks = h((Jh, Hs) => {
  var { Buffer: qb } = require('buffer'),
    { ObjectDefineProperty: _e, ObjectKeys: Bs, ReflectApply: $s } = N(),
    {
      promisify: { custom: Js },
    } = le(),
    { streamReturningOperators: Ws, promiseReturningOperators: Fs } = ks(),
    {
      codes: { ERR_ILLEGAL_CONSTRUCTOR: Us },
    } = W(),
    Lb = yr(),
    { pipeline: Vs } = Ht(),
    { destroyer: kb } = Ne(),
    Gs = pe(),
    Er = Sr(),
    Ar = ue(),
    I = (Hs.exports = Nt().Stream);
  I.isDisturbed = Ar.isDisturbed;
  I.isErrored = Ar.isErrored;
  I.isReadable = Ar.isReadable;
  I.Readable = lt();
  for (let e of Bs(Ws)) {
    let n = function (...r) {
      if (new.target) throw Us();
      return I.Readable.from($s(t, this, r));
    };
    Rr = n;
    let t = Ws[e];
    _e(n, 'name', { __proto__: null, value: t.name }),
      _e(n, 'length', { __proto__: null, value: t.length }),
      _e(I.Readable.prototype, e, { __proto__: null, value: n, enumerable: !1, configurable: !0, writable: !0 });
  }
  var Rr;
  for (let e of Bs(Fs)) {
    let n = function (...i) {
      if (new.target) throw Us();
      return $s(t, this, i);
    };
    Rr = n;
    let t = Fs[e];
    _e(n, 'name', { __proto__: null, value: t.name }),
      _e(n, 'length', { __proto__: null, value: t.length }),
      _e(I.Readable.prototype, e, { __proto__: null, value: n, enumerable: !1, configurable: !0, writable: !0 });
  }
  var Rr;
  I.Writable = Zn();
  I.Duplex = ce();
  I.Transform = ir();
  I.PassThrough = sr();
  I.pipeline = Vs;
  var { addAbortSignal: Cb } = st();
  I.addAbortSignal = Cb;
  I.finished = Gs;
  I.destroy = kb;
  I.compose = Lb;
  _e(I, 'promises', {
    __proto__: null,
    configurable: !0,
    enumerable: !0,
    get() {
      return Er;
    },
  });
  _e(Vs, Js, {
    __proto__: null,
    enumerable: !0,
    get() {
      return Er.pipeline;
    },
  });
  _e(Gs, Js, {
    __proto__: null,
    enumerable: !0,
    get() {
      return Er.finished;
    },
  });
  I.Stream = I;
  I._isUint8Array = function (t) {
    return t instanceof Uint8Array;
  };
  I._uint8ArrayToBuffer = function (t) {
    return qb.from(t.buffer, t.byteOffset, t.byteLength);
  };
});
var zs = h((Uh, _) => {
  'use strict';
  var v = require('stream');
  if (v && process.env.READABLE_STREAM === 'disable') {
    let e = v.promises;
    (_.exports._uint8ArrayToBuffer = v._uint8ArrayToBuffer),
      (_.exports._isUint8Array = v._isUint8Array),
      (_.exports.isDisturbed = v.isDisturbed),
      (_.exports.isErrored = v.isErrored),
      (_.exports.isReadable = v.isReadable),
      (_.exports.Readable = v.Readable),
      (_.exports.Writable = v.Writable),
      (_.exports.Duplex = v.Duplex),
      (_.exports.Transform = v.Transform),
      (_.exports.PassThrough = v.PassThrough),
      (_.exports.addAbortSignal = v.addAbortSignal),
      (_.exports.finished = v.finished),
      (_.exports.destroy = v.destroy),
      (_.exports.pipeline = v.pipeline),
      (_.exports.compose = v.compose),
      Object.defineProperty(v, 'promises', {
        configurable: !0,
        enumerable: !0,
        get() {
          return e;
        },
      }),
      (_.exports.Stream = v.Stream);
  } else {
    let e = Ks(),
      t = Sr(),
      n = e.Readable.destroy;
    (_.exports = e.Readable),
      (_.exports._uint8ArrayToBuffer = e._uint8ArrayToBuffer),
      (_.exports._isUint8Array = e._isUint8Array),
      (_.exports.isDisturbed = e.isDisturbed),
      (_.exports.isErrored = e.isErrored),
      (_.exports.isReadable = e.isReadable),
      (_.exports.Readable = e.Readable),
      (_.exports.Writable = e.Writable),
      (_.exports.Duplex = e.Duplex),
      (_.exports.Transform = e.Transform),
      (_.exports.PassThrough = e.PassThrough),
      (_.exports.addAbortSignal = e.addAbortSignal),
      (_.exports.finished = e.finished),
      (_.exports.destroy = e.destroy),
      (_.exports.destroy = n),
      (_.exports.pipeline = e.pipeline),
      (_.exports.compose = e.compose),
      Object.defineProperty(e, 'promises', {
        configurable: !0,
        enumerable: !0,
        get() {
          return t;
        },
      }),
      (_.exports.Stream = e.Stream);
  }
  _.exports.default = _.exports;
});
var Xs = h((Vh, Zs) => {
  'use strict';
  var Ys = Symbol.for('pino.metadata'),
    Wb = si(),
    { Duplex: Fb } = zs();
  Zs.exports = function (t, n = {}) {
    let r = n.parse === 'lines',
      i = typeof n.parseLine == 'function' ? n.parseLine : JSON.parse,
      o = n.close || Bb,
      s = Wb(
        function (u) {
          let a;
          try {
            a = i(u);
          } catch (c) {
            this.emit('unknown', u, c);
            return;
          }
          if (a === null) {
            this.emit('unknown', u, 'Null value ignored');
            return;
          }
          return (
            typeof a != 'object' && (a = { data: a, time: Date.now() }),
            s[Ys] && ((s.lastTime = a.time), (s.lastLevel = a.level), (s.lastObj = a)),
            r ? u : a
          );
        },
        { autoDestroy: !0 }
      );
    (s._destroy = function (u, a) {
      let c = o(u, a);
      c && typeof c.then == 'function' && c.then(a, a);
    }),
      n.metadata !== !1 && ((s[Ys] = !0), (s.lastTime = 0), (s.lastLevel = 0), (s.lastObj = null));
    let l = t(s);
    if (l && typeof l.catch == 'function')
      l.catch((u) => {
        s.destroy(u);
      }),
        (l = null);
    else if (n.enablePipelining && l) return Fb.from({ writable: s, readable: l, objectMode: !0 });
    return s;
  };
  function Bb(e, t) {
    process.nextTick(t, e);
  }
});
var Vb = {};
ol(Vb, { default: () => Jb });
module.exports = ll(Vb);
var Xt = require('node:stream');
var en = (e) => (Array.isArray(e) && e.length === 1 ? (Array.isArray(e[0]) ? en(e[0]) : e[0]) : e);
var Je = sl(Qr());
var ei = /(00D\w{12,15})![.\w]*/,
  ti = /force:\/\/([a-zA-Z0-9._-]+):([a-zA-Z0-9._-]*):([a-zA-Z0-9._-]+={0,2})@([a-zA-Z0-9._-]+)/;
var Wa = 'HIDDEN',
  Fa = (e) => new RegExp(`(['"][^'"]*${e}[^'"]*['"]\\s*:\\s*)['"][^'"]*['"]`, 'gi'),
  Ba = (e) =>
    RegExp(
      `(['"]\\s*key\\s*['"]\\s*:)\\s*['"]\\s*${e}\\s*['"]\\s*.\\s*['"]\\s*value\\s*['"]\\s*:\\s*['"]\\s*[^'"]*['"]`,
      'gi'
    ),
  $a = [
    { name: 'sid' },
    { name: 'Authorization' },
    { name: 'refresh_token', regex: `refresh[^'"]*token` },
    { name: 'clientsecret' },
  ],
  Ja = $a.map((e) => ({
    ...e,
    regexTokens: Fa(e.regex ?? e.name),
    hiddenAttrMessage: `"<${e.name} - ${Wa}>"`,
    keyRegex: Ba(e.regex ?? e.name),
  })),
  Ua = (...e) => e.reduce((t, n) => (r) => t(n(r))),
  Va = Ja.flatMap((e) => [
    (t) => t.replace(e.regexTokens, `$1${e.hiddenAttrMessage}`),
    (t) => t.replace(e.keyRegex, `$1${e.hiddenAttrMessage}`),
  ]).concat([
    (e) =>
      e
        .replace(new RegExp(ei, 'g'), '<REDACTED ACCESS TOKEN>')
        .replace(new RegExp(ti, 'g'), '<REDACTED AUTH URL TOKEN>'),
  ]),
  ni = Ua(...Va),
  pn = (...e) =>
    e.map(
      (t) =>
        t &&
        ((0, Je.isArray)(t)
          ? pn(...t)
          : t instanceof Buffer
          ? '<Buffer>'
          : (0, Je.isObject)(t)
          ? JSON.parse(ni(JSON.stringify(t)))
          : (0, Je.isString)(t)
          ? ni(t)
          : '')
    );
var $b = Xs();
function Jb() {
  return $b(
    (e) => {
      let t = new Xt.Transform({
        objectMode: !0,
        transform(n, r, i) {
          if (Ub(n)) {
            let o = en(pn([n])),
              s = JSON.stringify(o);
            this.push(
              s.concat(`
`)
            );
          }
          i();
        },
      });
      return (0, Xt.pipeline)(e, t, () => {}), t;
    },
    { enablePipelining: !0 }
  );
}
var Ub = (e) =>
  !!(
    !process.env.DEBUG ||
    process.env.DEBUG === '*' ||
    typeof e.name != 'string' ||
    new RegExp(process.env.DEBUG.replace(/\*/g, '.*')).test(e.name)
  );
