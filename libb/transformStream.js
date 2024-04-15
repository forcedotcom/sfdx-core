'use strict';
var h = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
var Rr = h((et) => {
  'use strict';
  Object.defineProperty(et, '__esModule', { value: !0 });
  et.unwrapArray = void 0;
  var tl = (e) => (Array.isArray(e) && e.length === 1 ? (Array.isArray(e[0]) ? (0, et.unwrapArray)(e[0]) : e[0]) : e);
  et.unwrapArray = tl;
});
var tt = h((E) => {
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
  function en(e) {
    return typeof e == 'string';
  }
  E.isString = en;
  function mr(e) {
    return typeof e == 'number';
  }
  E.isNumber = mr;
  function Or(e) {
    return typeof e == 'boolean';
  }
  E.isBoolean = Or;
  function yt(e) {
    return e != null && (typeof e == 'object' || typeof e == 'function');
  }
  E.isObject = yt;
  function tn(e) {
    return typeof e == 'function';
  }
  E.isFunction = tn;
  function gt(e) {
    let t = (r) => yt(r) && Object.prototype.toString.call(r) === '[object Object]';
    if (!t(e)) return !1;
    let n = e.constructor;
    return !(!tn(n) || !t(n.prototype) || !n.prototype.hasOwnProperty('isPrototypeOf'));
  }
  E.isPlainObject = gt;
  function nl(e) {
    return gt(e);
  }
  E.isDictionary = nl;
  function rl(e, t) {
    return e instanceof t;
  }
  E.isInstance = rl;
  function il(e, t) {
    return e === t || (((r, i) => yt(r) && i in r)(e, 'prototype') && e.prototype instanceof t);
  }
  E.isClassAssignableTo = il;
  function nn(e) {
    return Array.isArray(e);
  }
  E.isArray = nn;
  function ol(e) {
    let t = (n) => yt(n) && 'length' in n;
    return !tn(e) && (en(e) || t(e));
  }
  E.isArrayLike = ol;
  function sl(e) {
    return e === null || en(e) || mr(e) || Or(e) || gt(e) || nn(e);
  }
  E.isAnyJson = sl;
  function ll(e) {
    return gt(e);
  }
  E.isJsonMap = ll;
  function al(e) {
    return nn(e);
  }
  E.isJsonArray = al;
  function ul(e, t) {
    return Object.keys(e).includes(t);
  }
  E.isKeyOf = ul;
});
var xe = h((D) => {
  'use strict';
  Object.defineProperty(D, '__esModule', { value: !0 });
  D.asJsonArray =
    D.asJsonMap =
    D.asFunction =
    D.asArray =
    D.asInstance =
    D.asDictionary =
    D.asPlainObject =
    D.asObject =
    D.asBoolean =
    D.asNumber =
    D.asString =
      void 0;
  var X = tt();
  function fl(e, t) {
    return (0, X.isString)(e) ? e : t;
  }
  D.asString = fl;
  function cl(e, t) {
    return (0, X.isNumber)(e) ? e : t;
  }
  D.asNumber = cl;
  function dl(e, t) {
    return (0, X.isBoolean)(e) ? e : t;
  }
  D.asBoolean = dl;
  function bl(e, t) {
    return (0, X.isObject)(e) ? e : t;
  }
  D.asObject = bl;
  function hl(e, t) {
    return (0, X.isPlainObject)(e) ? e : t;
  }
  D.asPlainObject = hl;
  function pl(e, t) {
    return (0, X.isDictionary)(e) ? e : t;
  }
  D.asDictionary = pl;
  function yl(e, t, n) {
    return (0, X.isInstance)(e, t) ? e : n;
  }
  D.asInstance = yl;
  function gl(e, t) {
    return (0, X.isArray)(e) ? e : t;
  }
  D.asArray = gl;
  function _l(e, t) {
    return (0, X.isFunction)(e) ? e : t;
  }
  D.asFunction = _l;
  function wl(e, t) {
    return (0, X.isJsonMap)(e) ? e : t;
  }
  D.asJsonMap = wl;
  function Sl(e, t) {
    return (0, X.isJsonArray)(e) ? e : t;
  }
  D.asJsonArray = Sl;
});
var _t = h((le) => {
  'use strict';
  Object.defineProperty(le, '__esModule', { value: !0 });
  le.JsonCloneError = le.UnexpectedValueTypeError = le.AssertionFailedError = le.NamedError = void 0;
  var Ue = class extends Error {
    constructor(t, n) {
      super(n), (this.name = t);
    }
  };
  le.NamedError = Ue;
  var rn = class extends Ue {
    constructor(t) {
      super('AssertionFailedError', t);
    }
  };
  le.AssertionFailedError = rn;
  var on = class extends Ue {
    constructor(t) {
      super('UnexpectedValueTypeError', t);
    }
  };
  le.UnexpectedValueTypeError = on;
  var sn = class extends Ue {
    constructor(t) {
      super('JsonCloneError', t.message);
    }
  };
  le.JsonCloneError = sn;
});
var wt = h((Ee) => {
  'use strict';
  Object.defineProperty(Ee, '__esModule', { value: !0 });
  Ee.toJsonArray = Ee.toJsonMap = Ee.toAnyJson = void 0;
  var El = _t(),
    Tr = xe();
  function ln(e, t) {
    try {
      return e !== void 0 ? JSON.parse(JSON.stringify(e)) : t;
    } catch (n) {
      throw new El.JsonCloneError(n);
    }
  }
  Ee.toAnyJson = ln;
  function Al(e, t) {
    return (0, Tr.asJsonMap)(ln(e)) ?? t;
  }
  Ee.toJsonMap = Al;
  function Rl(e, t) {
    return (0, Tr.asJsonArray)(ln(e)) ?? t;
  }
  Ee.toJsonArray = Rl;
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
  var ml = _t(),
    Q = xe(),
    Ol = wt();
  function Pr(e, t) {
    if (!e) throw new ml.AssertionFailedError(t ?? 'Assertion condition was false');
  }
  A.assert = Pr;
  function V(e, t) {
    Pr(e != null, t ?? 'Value is not defined');
  }
  A.assertNonNull = V;
  function Tl(e, t) {
    V((0, Q.asString)(e), t ?? 'Value is not a string');
  }
  A.assertString = Tl;
  function Pl(e, t) {
    V((0, Q.asNumber)(e), t ?? 'Value is not a number');
  }
  A.assertNumber = Pl;
  function Ml(e, t) {
    V((0, Q.asBoolean)(e), t ?? 'Value is not a boolean');
  }
  A.assertBoolean = Ml;
  function Dl(e, t) {
    V((0, Q.asObject)(e), t ?? 'Value is not an object');
  }
  A.assertObject = Dl;
  function jl(e, t) {
    V((0, Q.asPlainObject)(e), t ?? 'Value is not a plain object');
  }
  A.assertPlainObject = jl;
  function xl(e, t) {
    V((0, Q.asDictionary)(e), t ?? 'Value is not a dictionary object');
  }
  A.assertDictionary = xl;
  function Il(e, t, n) {
    V((0, Q.asInstance)(e, t), n ?? `Value is not an instance of ${t.name}`);
  }
  A.assertInstance = Il;
  function vl(e, t) {
    V((0, Q.asArray)(e), t ?? 'Value is not an array');
  }
  A.assertArray = vl;
  function Nl(e, t) {
    V((0, Q.asFunction)(e), t ?? 'Value is not a function');
  }
  A.assertFunction = Nl;
  function ql(e, t) {
    V((0, Ol.toAnyJson)(e), t ?? 'Value is not a JSON-compatible value type');
  }
  A.assertAnyJson = ql;
  function Ll(e, t) {
    V((0, Q.asJsonMap)(e), t ?? 'Value is not a JsonMap');
  }
  A.assertJsonMap = Ll;
  function Cl(e, t) {
    V((0, Q.asJsonArray)(e), t ?? 'Value is not a JsonArray');
  }
  A.assertJsonArray = Cl;
});
var un = h((Ae) => {
  'use strict';
  Object.defineProperty(Ae, '__esModule', { value: !0 });
  Ae.coerceJsonArray = Ae.coerceJsonMap = Ae.coerceAnyJson = void 0;
  var Dr = xe(),
    kl = tt();
  function an(e, t) {
    return (0, kl.isAnyJson)(e) ? e : t;
  }
  Ae.coerceAnyJson = an;
  function Wl(e, t) {
    return (0, Dr.asJsonMap)(an(e)) ?? t;
  }
  Ae.coerceJsonMap = Wl;
  function Fl(e, t) {
    return (0, Dr.asJsonArray)(an(e)) ?? t;
  }
  Ae.coerceJsonArray = Fl;
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
  var Bl = _t(),
    ee = xe(),
    $l = wt();
  function H(e, t) {
    if (e == null) throw new Bl.UnexpectedValueTypeError(t ?? 'Value is not defined');
    return e;
  }
  m.ensure = H;
  function Jl(e, t) {
    return H((0, ee.asString)(e), t ?? 'Value is not a string');
  }
  m.ensureString = Jl;
  function Ul(e, t) {
    return H((0, ee.asNumber)(e), t ?? 'Value is not a number');
  }
  m.ensureNumber = Ul;
  function Vl(e, t) {
    return H((0, ee.asBoolean)(e), t ?? 'Value is not a boolean');
  }
  m.ensureBoolean = Vl;
  function Hl(e, t) {
    return H((0, ee.asObject)(e), t ?? 'Value is not an object');
  }
  m.ensureObject = Hl;
  function Gl(e, t) {
    return H((0, ee.asPlainObject)(e), t ?? 'Value is not a plain object');
  }
  m.ensurePlainObject = Gl;
  function Kl(e, t) {
    return H((0, ee.asDictionary)(e), t ?? 'Value is not a dictionary object');
  }
  m.ensureDictionary = Kl;
  function zl(e, t, n) {
    return H((0, ee.asInstance)(e, t), n ?? `Value is not an instance of ${t.name}`);
  }
  m.ensureInstance = zl;
  function Yl(e, t) {
    return H((0, ee.asArray)(e), t ?? 'Value is not an array');
  }
  m.ensureArray = Yl;
  function Zl(e, t) {
    return H((0, ee.asFunction)(e), t ?? 'Value is not a function');
  }
  m.ensureFunction = Zl;
  function Xl(e, t) {
    return H((0, $l.toAnyJson)(e), t ?? 'Value is not a JSON-compatible value type');
  }
  m.ensureAnyJson = Xl;
  function Ql(e, t) {
    return H((0, ee.asJsonMap)(e), t ?? 'Value is not a JsonMap');
  }
  m.ensureJsonMap = Ql;
  function ea(e, t) {
    return H((0, ee.asJsonArray)(e), t ?? 'Value is not a JsonArray');
  }
  m.ensureJsonArray = ea;
});
var cn = h((O) => {
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
  var G = tt();
  function te(e, t) {
    return (0, G.isObject)(e) && ((0, G.isArray)(t) ? t.every((n) => n in e) : t in e);
  }
  O.has = te;
  function ta(e, t) {
    return te(e, t) && (0, G.isString)(e[t]);
  }
  O.hasString = ta;
  function na(e, t) {
    return te(e, t) && (0, G.isNumber)(e[t]);
  }
  O.hasNumber = na;
  function ra(e, t) {
    return te(e, t) && (0, G.isBoolean)(e[t]);
  }
  O.hasBoolean = ra;
  function ia(e, t) {
    return te(e, t) && (0, G.isObject)(e[t]);
  }
  O.hasObject = ia;
  function oa(e, t) {
    return te(e, t) && (0, G.isPlainObject)(e[t]);
  }
  O.hasPlainObject = oa;
  function sa(e, t) {
    return te(e, t) && (0, G.isDictionary)(e[t]);
  }
  O.hasDictionary = sa;
  function la(e, t, n) {
    return te(e, t) && e[t] instanceof n;
  }
  O.hasInstance = la;
  function aa(e, t) {
    return te(e, t) && (0, G.isArray)(e[t]);
  }
  O.hasArray = aa;
  function ua(e, t) {
    return te(e, t) && (0, G.isFunction)(e[t]);
  }
  O.hasFunction = ua;
  function fn(e, t) {
    return te(e, t) && (0, G.isAnyJson)(e[t]);
  }
  O.hasAnyJson = fn;
  function fa(e, t) {
    return fn(e, t) && (0, G.isJsonMap)(e[t]);
  }
  O.hasJsonMap = fa;
  function ca(e, t) {
    return fn(e, t) && (0, G.isJsonArray)(e[t]);
  }
  O.hasJsonArray = ca;
});
var xr = h((St) => {
  'use strict';
  Object.defineProperty(St, '__esModule', { value: !0 });
  St.valueOrDefault = void 0;
  function da(e, t) {
    return e != null || t === void 0 ? e : t;
  }
  St.valueOrDefault = da;
});
var Ir = h((T) => {
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
  var ne = xe(),
    ba = un(),
    ha = cn(),
    K = xr();
  function re(e, t, n) {
    return (0, K.valueOrDefault)(
      t
        .split(/['"]/)
        .reduce((r, i, o) => (o % 2 === 1 ? [...r, i] : [...r, ...i.split(/[.[\]]/)]), [])
        .filter((r) => !!r)
        .reduce((r, i) => ((0, ha.has)(r, i) ? r[i] : void 0), e),
      n
    );
  }
  T.get = re;
  function pa(e, t, n) {
    return (0, K.valueOrDefault)((0, ne.asString)(re(e, t)), n);
  }
  T.getString = pa;
  function ya(e, t, n) {
    return (0, K.valueOrDefault)((0, ne.asNumber)(re(e, t)), n);
  }
  T.getNumber = ya;
  function ga(e, t, n) {
    return (0, K.valueOrDefault)((0, ne.asBoolean)(re(e, t)), n);
  }
  T.getBoolean = ga;
  function _a(e, t, n) {
    return (0, K.valueOrDefault)((0, ne.asObject)(re(e, t)), n);
  }
  T.getObject = _a;
  function wa(e, t, n) {
    return (0, K.valueOrDefault)((0, ne.asPlainObject)(re(e, t)), n);
  }
  T.getPlainObject = wa;
  function Sa(e, t, n) {
    return (0, K.valueOrDefault)((0, ne.asDictionary)(re(e, t)), n);
  }
  T.getDictionary = Sa;
  function Ea(e, t, n, r) {
    return (0, K.valueOrDefault)((0, ne.asInstance)(re(e, t), n), r);
  }
  T.getInstance = Ea;
  function Aa(e, t, n) {
    return (0, K.valueOrDefault)((0, ne.asArray)(re(e, t)), n);
  }
  T.getArray = Aa;
  function Ra(e, t, n) {
    return (0, K.valueOrDefault)((0, ne.asFunction)(re(e, t)), n);
  }
  T.getFunction = Ra;
  function dn(e, t, n) {
    return (0, K.valueOrDefault)((0, ba.coerceAnyJson)(re(e, t)), n);
  }
  T.getAnyJson = dn;
  function ma(e, t, n) {
    return (0, K.valueOrDefault)((0, ne.asJsonMap)(dn(e, t)), n);
  }
  T.getJsonMap = ma;
  function Oa(e, t, n) {
    return (0, K.valueOrDefault)((0, ne.asJsonArray)(dn(e, t)), n);
  }
  T.getJsonArray = Oa;
});
var Nr = h((U) => {
  'use strict';
  Object.defineProperty(U, '__esModule', { value: !0 });
  U.definiteValuesOf = U.definiteKeysOf = U.definiteEntriesOf = U.valuesOf = U.entriesOf = U.keysOf = void 0;
  function Ta(e) {
    return Object.keys(e ?? {});
  }
  U.keysOf = Ta;
  function vr(e) {
    return Object.entries(e ?? {});
  }
  U.entriesOf = vr;
  function Pa(e) {
    return Object.values(e ?? {});
  }
  U.valuesOf = Pa;
  function bn(e) {
    return vr(e).filter((t) => t[1] != null);
  }
  U.definiteEntriesOf = bn;
  function Ma(e) {
    return bn(e).map((t) => t[0]);
  }
  U.definiteKeysOf = Ma;
  function Da(e) {
    return bn(e).map((t) => t[1]);
  }
  U.definiteValuesOf = Da;
});
var qr = h((W) => {
  'use strict';
  var ja =
      (W && W.__createBinding) ||
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
    pe =
      (W && W.__exportStar) ||
      function (e, t) {
        for (var n in e) n !== 'default' && !Object.prototype.hasOwnProperty.call(t, n) && ja(t, e, n);
      };
  Object.defineProperty(W, '__esModule', { value: !0 });
  pe(xe(), W);
  pe(Mr(), W);
  pe(un(), W);
  pe(jr(), W);
  pe(Ir(), W);
  pe(cn(), W);
  pe(tt(), W);
  pe(Nr(), W);
  pe(wt(), W);
});
var Cr = h((Lr) => {
  'use strict';
  Object.defineProperty(Lr, '__esModule', { value: !0 });
});
var Wr = h((kr) => {
  'use strict';
  Object.defineProperty(kr, '__esModule', { value: !0 });
});
var Br = h((Fr) => {
  'use strict';
  Object.defineProperty(Fr, '__esModule', { value: !0 });
});
var Jr = h(($r) => {
  'use strict';
  Object.defineProperty($r, '__esModule', { value: !0 });
});
var Vr = h((Ur) => {
  'use strict';
  Object.defineProperty(Ur, '__esModule', { value: !0 });
});
var Gr = h((Hr) => {
  'use strict';
  Object.defineProperty(Hr, '__esModule', { value: !0 });
});
var zr = h((Kr) => {
  'use strict';
  Object.defineProperty(Kr, '__esModule', { value: !0 });
});
var Yr = h((z) => {
  'use strict';
  var xa =
      (z && z.__createBinding) ||
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
    Ie =
      (z && z.__exportStar) ||
      function (e, t) {
        for (var n in e) n !== 'default' && !Object.prototype.hasOwnProperty.call(t, n) && xa(t, e, n);
      };
  Object.defineProperty(z, '__esModule', { value: !0 });
  Ie(Cr(), z);
  Ie(Wr(), z);
  Ie(Br(), z);
  Ie(Jr(), z);
  Ie(Vr(), z);
  Ie(Gr(), z);
  Ie(zr(), z);
});
var Xr = h((Re) => {
  'use strict';
  var Ia =
      (Re && Re.__createBinding) ||
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
    Zr =
      (Re && Re.__exportStar) ||
      function (e, t) {
        for (var n in e) n !== 'default' && !Object.prototype.hasOwnProperty.call(t, n) && Ia(t, e, n);
      };
  Object.defineProperty(Re, '__esModule', { value: !0 });
  Zr(qr(), Re);
  Zr(Yr(), Re);
});
var Qr = h((N) => {
  'use strict';
  Object.defineProperty(N, '__esModule', { value: !0 });
  N.matchesAccessToken =
    N.sfdxAuthUrlRegex =
    N.accessTokenRegex =
    N.validatePathDoesNotContainInvalidChars =
    N.validateSalesforceId =
    N.validateEmail =
    N.validateApiVersion =
    N.trimTo15 =
      void 0;
  function va(e) {
    if (e) return e.length && e.length > 15 ? e.substring(0, 15) : e;
  }
  N.trimTo15 = va;
  var Na = (e) => e == null || /^[1-9]\d\.0$/.test(e);
  N.validateApiVersion = Na;
  var qa = (e) => /^[^.][^@]*@[^.]+(\.[^.\s]+)+$/.test(e);
  N.validateEmail = qa;
  var La = (e) => /[a-zA-Z0-9]{18}|[a-zA-Z0-9]{15}/.test(e) && (e.length === 15 || e.length === 18);
  N.validateSalesforceId = La;
  var Ca = (e) => !/[\["\?<>\|\]]+/.test(e);
  N.validatePathDoesNotContainInvalidChars = Ca;
  N.accessTokenRegex = /(00D\w{12,15})![.\w]*/;
  N.sfdxAuthUrlRegex = /force:\/\/([a-zA-Z0-9._-]+):([a-zA-Z0-9._-]*):([a-zA-Z0-9._-]+={0,2})@([a-zA-Z0-9._-]+)/;
  var ka = (e) => N.accessTokenRegex.test(e);
  N.matchesAccessToken = ka;
});
var ni = h((me) => {
  'use strict';
  Object.defineProperty(me, '__esModule', { value: !0 });
  me.filterSecrets = me.HIDDEN = void 0;
  var hn = Xr(),
    ei = Qr();
  me.HIDDEN = 'HIDDEN';
  var Wa = (e) => new RegExp(`(['"][^'"]*${e}[^'"]*['"]\\s*:\\s*)['"][^'"]*['"]`, 'gi'),
    Fa = (e) =>
      RegExp(
        `(['"]\\s*key\\s*['"]\\s*:)\\s*['"]\\s*${e}\\s*['"]\\s*.\\s*['"]\\s*value\\s*['"]\\s*:\\s*['"]\\s*[^'"]*['"]`,
        'gi'
      ),
    Ba = [
      { name: 'sid' },
      { name: 'Authorization' },
      { name: 'refresh_token', regex: `refresh[^'"]*token` },
      { name: 'clientsecret' },
    ],
    $a = Ba.map((e) => ({
      ...e,
      regexTokens: Wa(e.regex ?? e.name),
      hiddenAttrMessage: `"<${e.name} - ${me.HIDDEN}>"`,
      keyRegex: Fa(e.regex ?? e.name),
    })),
    Ja = (...e) => e.reduce((t, n) => (r) => t(n(r))),
    Ua = $a
      .flatMap((e) => [
        (t) => t.replace(e.regexTokens, `$1${e.hiddenAttrMessage}`),
        (t) => t.replace(e.keyRegex, `$1${e.hiddenAttrMessage}`),
      ])
      .concat([
        (e) =>
          e
            .replace(new RegExp(ei.accessTokenRegex, 'g'), '<REDACTED ACCESS TOKEN>')
            .replace(new RegExp(ei.sfdxAuthUrlRegex, 'g'), '<REDACTED AUTH URL TOKEN>'),
      ]),
    ti = Ja(...Ua),
    Va = (...e) =>
      e.map(
        (t) =>
          t &&
          ((0, hn.isArray)(t)
            ? (0, me.filterSecrets)(...t)
            : t instanceof Buffer
            ? '<Buffer>'
            : (0, hn.isObject)(t)
            ? JSON.parse(ti(JSON.stringify(t)))
            : (0, hn.isString)(t)
            ? ti(t)
            : '')
      );
  me.filterSecrets = Va;
});
var si = h((_h, oi) => {
  'use strict';
  var { Transform: Ha } = require('stream'),
    { StringDecoder: Ga } = require('string_decoder'),
    Oe = Symbol('last'),
    Et = Symbol('decoder');
  function Ka(e, t, n) {
    let r;
    if (this.overflow) {
      if (((r = this[Et].write(e).split(this.matcher)), r.length === 1)) return n();
      r.shift(), (this.overflow = !1);
    } else (this[Oe] += this[Et].write(e)), (r = this[Oe].split(this.matcher));
    this[Oe] = r.pop();
    for (let i = 0; i < r.length; i++)
      try {
        ii(this, this.mapper(r[i]));
      } catch (o) {
        return n(o);
      }
    if (((this.overflow = this[Oe].length > this.maxLength), this.overflow && !this.skipOverflow)) {
      n(new Error('maximum buffer reached'));
      return;
    }
    n();
  }
  function za(e) {
    if (((this[Oe] += this[Et].end()), this[Oe]))
      try {
        ii(this, this.mapper(this[Oe]));
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
    let r = new Ha(n);
    return (
      (r[Oe] = ''),
      (r[Et] = new Ga('utf8')),
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
var v = h((wh, li) => {
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
var ae = h((Sh, yn) => {
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
    pn = class extends Error {
      constructor(t) {
        if (!Array.isArray(t)) throw new TypeError(`Expected input to be an Array, got ${typeof t}`);
        let n = '';
        for (let r = 0; r < t.length; r++)
          n += `    ${t[r].stack}
`;
        super(n), (this.name = 'AggregateError'), (this.errors = t);
      }
    };
  yn.exports = {
    AggregateError: pn,
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
  yn.exports.promisify.custom = Symbol.for('nodejs.util.promisify.custom');
});
var _i = h((it, rt) => {
  'use strict';
  Object.defineProperty(it, '__esModule', { value: !0 });
  var hi = new WeakMap(),
    gn = new WeakMap();
  function M(e) {
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
  function Ve(e, t) {
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
  Ve.prototype = {
    get type() {
      return M(this).event.type;
    },
    get target() {
      return M(this).eventTarget;
    },
    get currentTarget() {
      return M(this).currentTarget;
    },
    composedPath() {
      let e = M(this).currentTarget;
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
      return M(this).eventPhase;
    },
    stopPropagation() {
      let e = M(this);
      (e.stopped = !0), typeof e.event.stopPropagation == 'function' && e.event.stopPropagation();
    },
    stopImmediatePropagation() {
      let e = M(this);
      (e.stopped = !0),
        (e.immediateStopped = !0),
        typeof e.event.stopImmediatePropagation == 'function' && e.event.stopImmediatePropagation();
    },
    get bubbles() {
      return !!M(this).event.bubbles;
    },
    get cancelable() {
      return !!M(this).event.cancelable;
    },
    preventDefault() {
      ui(M(this));
    },
    get defaultPrevented() {
      return M(this).canceled;
    },
    get composed() {
      return !!M(this).event.composed;
    },
    get timeStamp() {
      return M(this).timeStamp;
    },
    get srcElement() {
      return M(this).eventTarget;
    },
    get cancelBubble() {
      return M(this).stopped;
    },
    set cancelBubble(e) {
      if (!e) return;
      let t = M(this);
      (t.stopped = !0), typeof t.event.cancelBubble == 'boolean' && (t.event.cancelBubble = !0);
    },
    get returnValue() {
      return !M(this).canceled;
    },
    set returnValue(e) {
      e || ui(M(this));
    },
    initEvent() {},
  };
  Object.defineProperty(Ve.prototype, 'constructor', { value: Ve, configurable: !0, writable: !0 });
  typeof window < 'u' &&
    typeof window.Event < 'u' &&
    (Object.setPrototypeOf(Ve.prototype, window.Event.prototype), gn.set(window.Event.prototype, Ve));
  function pi(e) {
    return {
      get() {
        return M(this).event[e];
      },
      set(t) {
        M(this).event[e] = t;
      },
      configurable: !0,
      enumerable: !0,
    };
  }
  function eu(e) {
    return {
      value() {
        let t = M(this).event;
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
    if (e == null || e === Object.prototype) return Ve;
    let t = gn.get(e);
    return t == null && ((t = tu(yi(Object.getPrototypeOf(e)), e)), gn.set(e, t)), t;
  }
  function nu(e, t) {
    let n = yi(Object.getPrototypeOf(t));
    return new n(e, t);
  }
  function ru(e) {
    return M(e).immediateStopped;
  }
  function iu(e, t) {
    M(e).eventPhase = t;
  }
  function ou(e, t) {
    M(e).currentTarget = t;
  }
  function fi(e, t) {
    M(e).passiveListener = t;
  }
  var gi = new WeakMap(),
    ci = 1,
    di = 2,
    At = 3;
  function Rt(e) {
    return e !== null && typeof e == 'object';
  }
  function nt(e) {
    let t = gi.get(e);
    if (t == null) throw new TypeError("'this' is expected an EventTarget object, but got another value.");
    return t;
  }
  function su(e) {
    return {
      get() {
        let n = nt(this).get(e);
        for (; n != null; ) {
          if (n.listenerType === At) return n.listener;
          n = n.next;
        }
        return null;
      },
      set(t) {
        typeof t != 'function' && !Rt(t) && (t = null);
        let n = nt(this),
          r = null,
          i = n.get(e);
        for (; i != null; )
          i.listenerType === At
            ? r !== null
              ? (r.next = i.next)
              : i.next !== null
              ? n.set(e, i.next)
              : n.delete(e)
            : (r = i),
            (i = i.next);
        if (t !== null) {
          let o = { listener: t, listenerType: At, passive: !1, once: !1, next: null };
          r === null ? n.set(e, o) : (r.next = o);
        }
      },
      configurable: !0,
      enumerable: !0,
    };
  }
  function _n(e, t) {
    Object.defineProperty(e, `on${t}`, su(t));
  }
  function bi(e) {
    function t() {
      ie.call(this);
    }
    t.prototype = Object.create(ie.prototype, { constructor: { value: t, configurable: !0, writable: !0 } });
    for (let n = 0; n < e.length; ++n) _n(t.prototype, e[n]);
    return t;
  }
  function ie() {
    if (this instanceof ie) {
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
  ie.prototype = {
    addEventListener(e, t, n) {
      if (t == null) return;
      if (typeof t != 'function' && !Rt(t)) throw new TypeError("'listener' should be a function or an object.");
      let r = nt(this),
        i = Rt(n),
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
      let r = nt(this),
        o = (Rt(n) ? !!n.capture : !!n) ? ci : di,
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
      let t = nt(this),
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
        else r.listenerType !== At && typeof r.listener.handleEvent == 'function' && r.listener.handleEvent(i);
        if (ru(i)) break;
        r = r.next;
      }
      return fi(i, null), iu(i, 0), ou(i, null), !i.defaultPrevented;
    },
  };
  Object.defineProperty(ie.prototype, 'constructor', { value: ie, configurable: !0, writable: !0 });
  typeof window < 'u' &&
    typeof window.EventTarget < 'u' &&
    Object.setPrototypeOf(ie.prototype, window.EventTarget.prototype);
  it.defineEventAttribute = _n;
  it.EventTarget = ie;
  it.default = ie;
  rt.exports = ie;
  rt.exports.EventTarget = rt.exports.default = ie;
  rt.exports.defineEventAttribute = _n;
});
var Ot = h((st, ot) => {
  'use strict';
  Object.defineProperty(st, '__esModule', { value: !0 });
  var wn = _i(),
    Te = class extends wn.EventTarget {
      constructor() {
        throw (super(), new TypeError('AbortSignal cannot be constructed directly'));
      }
      get aborted() {
        let t = mt.get(this);
        if (typeof t != 'boolean')
          throw new TypeError(
            `Expected 'this' to be an 'AbortSignal' object, but got ${this === null ? 'null' : typeof this}`
          );
        return t;
      }
    };
  wn.defineEventAttribute(Te.prototype, 'abort');
  function lu() {
    let e = Object.create(Te.prototype);
    return wn.EventTarget.call(e), mt.set(e, !1), e;
  }
  function au(e) {
    mt.get(e) === !1 && (mt.set(e, !0), e.dispatchEvent({ type: 'abort' }));
  }
  var mt = new WeakMap();
  Object.defineProperties(Te.prototype, { aborted: { enumerable: !0 } });
  typeof Symbol == 'function' &&
    typeof Symbol.toStringTag == 'symbol' &&
    Object.defineProperty(Te.prototype, Symbol.toStringTag, { configurable: !0, value: 'AbortSignal' });
  var Pe = class {
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
  Object.defineProperties(Pe.prototype, { signal: { enumerable: !0 }, abort: { enumerable: !0 } });
  typeof Symbol == 'function' &&
    typeof Symbol.toStringTag == 'symbol' &&
    Object.defineProperty(Pe.prototype, Symbol.toStringTag, { configurable: !0, value: 'AbortController' });
  st.AbortController = Pe;
  st.AbortSignal = Te;
  st.default = Pe;
  ot.exports = Pe;
  ot.exports.AbortController = ot.exports.default = Pe;
  ot.exports.AbortSignal = Te;
});
var F = h((Eh, Ri) => {
  'use strict';
  var { format: uu, inspect: Tt, AggregateError: fu } = ae(),
    cu = globalThis.AggregateError || fu,
    du = Symbol('kIsNodeError'),
    bu = ['string', 'function', 'number', 'object', 'Function', 'Object', 'boolean', 'bigint', 'symbol'],
    hu = /^([A-Z][a-z0-9]*)+$/,
    pu = '__node_internal_',
    Pt = {};
  function ve(e, t) {
    if (!e) throw new Pt.ERR_INTERNAL_ASSERTION(t);
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
        ve(
          t.length <= n.length,
          `Code: ${e}; The provided arguments length (${n.length}) does not match the required ones (${t.length}).`
        ),
        t(...n)
      );
    let r = (t.match(/%[dfijoOs]/g) || []).length;
    return (
      ve(
        r === n.length,
        `Code: ${e}; The provided arguments length (${n.length}) does not match the required ones (${r}).`
      ),
      n.length === 0 ? t : uu(t, ...n)
    );
  }
  function L(e, t, n) {
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
      (Pt[e] = r);
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
  var Sn = class extends Error {
    constructor(t = 'The operation was aborted', n = void 0) {
      if (n !== void 0 && typeof n != 'object') throw new Pt.ERR_INVALID_ARG_TYPE('options', 'Object', n);
      super(t, n), (this.code = 'ABORT_ERR'), (this.name = 'AbortError');
    }
  };
  L('ERR_ASSERTION', '%s', Error);
  L(
    'ERR_INVALID_ARG_TYPE',
    (e, t, n) => {
      ve(typeof e == 'string', "'name' must be a string"), Array.isArray(t) || (t = [t]);
      let r = 'The ';
      e.endsWith(' argument') ? (r += `${e} `) : (r += `"${e}" ${e.includes('.') ? 'property' : 'argument'} `),
        (r += 'must be ');
      let i = [],
        o = [],
        s = [];
      for (let u of t)
        ve(typeof u == 'string', 'All expected entries have to be of type string'),
          bu.includes(u)
            ? i.push(u.toLowerCase())
            : hu.test(u)
            ? o.push(u)
            : (ve(u !== 'object', 'The value "object" should be written as "Object"'), s.push(u));
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
          let u = Tt(n, { depth: -1 });
          r += `. Received ${u}`;
        }
      } else {
        let u = Tt(n, { colors: !1 });
        u.length > 25 && (u = `${u.slice(0, 25)}...`), (r += `. Received type ${typeof n} (${u})`);
      }
      return r;
    },
    TypeError
  );
  L(
    'ERR_INVALID_ARG_VALUE',
    (e, t, n = 'is invalid') => {
      let r = Tt(t);
      return (
        r.length > 128 && (r = r.slice(0, 128) + '...'),
        `The ${e.includes('.') ? 'property' : 'argument'} '${e}' ${n}. Received ${r}`
      );
    },
    TypeError
  );
  L(
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
  L(
    'ERR_MISSING_ARGS',
    (...e) => {
      ve(e.length > 0, 'At least one arg needs to be specified');
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
  L(
    'ERR_OUT_OF_RANGE',
    (e, t, n) => {
      ve(t, 'Missing "range" argument');
      let r;
      return (
        Number.isInteger(n) && Math.abs(n) > 2 ** 32
          ? (r = Ei(String(n)))
          : typeof n == 'bigint'
          ? ((r = String(n)), (n > 2n ** 32n || n < -(2n ** 32n)) && (r = Ei(r)), (r += 'n'))
          : (r = Tt(n)),
        `The value of "${e}" is out of range. It must be ${t}. Received ${r}`
      );
    },
    RangeError
  );
  L('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times', Error);
  L('ERR_METHOD_NOT_IMPLEMENTED', 'The %s method is not implemented', Error);
  L('ERR_STREAM_ALREADY_FINISHED', 'Cannot call %s after a stream was finished', Error);
  L('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable', Error);
  L('ERR_STREAM_DESTROYED', 'Cannot call %s after a stream was destroyed', Error);
  L('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
  L('ERR_STREAM_PREMATURE_CLOSE', 'Premature close', Error);
  L('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF', Error);
  L('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event', Error);
  L('ERR_STREAM_WRITE_AFTER_END', 'write after end', Error);
  L('ERR_UNKNOWN_ENCODING', 'Unknown encoding: %s', TypeError);
  Ri.exports = { AbortError: Sn, aggregateTwoErrors: Ai(gu), hideStackFrames: Ai, codes: Pt };
});
var lt = h((Ah, Ii) => {
  'use strict';
  var {
      ArrayIsArray: An,
      ArrayPrototypeIncludes: Pi,
      ArrayPrototypeJoin: Mi,
      ArrayPrototypeMap: _u,
      NumberIsInteger: Rn,
      NumberIsNaN: wu,
      NumberMAX_SAFE_INTEGER: Su,
      NumberMIN_SAFE_INTEGER: Eu,
      NumberParseInt: Au,
      ObjectPrototypeHasOwnProperty: Ru,
      RegExpPrototypeExec: Di,
      String: mu,
      StringPrototypeToUpperCase: Ou,
      StringPrototypeTrim: Tu,
    } = v(),
    {
      hideStackFrames: Y,
      codes: {
        ERR_SOCKET_BAD_PORT: Pu,
        ERR_INVALID_ARG_TYPE: B,
        ERR_INVALID_ARG_VALUE: He,
        ERR_OUT_OF_RANGE: Ne,
        ERR_UNKNOWN_SIGNAL: mi,
      },
    } = F(),
    { normalizeEncoding: Mu } = ae(),
    { isAsyncFunction: Du, isArrayBufferView: ju } = ae().types,
    Oi = {};
  function xu(e) {
    return e === (e | 0);
  }
  function Iu(e) {
    return e === e >>> 0;
  }
  var vu = /^[0-7]+$/,
    Nu = 'must be a 32-bit unsigned integer or an octal string';
  function qu(e, t, n) {
    if ((typeof e > 'u' && (e = n), typeof e == 'string')) {
      if (Di(vu, e) === null) throw new He(t, e, Nu);
      e = Au(e, 8);
    }
    return ji(e, t), e;
  }
  var Lu = Y((e, t, n = Eu, r = Su) => {
      if (typeof e != 'number') throw new B(t, 'number', e);
      if (!Rn(e)) throw new Ne(t, 'an integer', e);
      if (e < n || e > r) throw new Ne(t, `>= ${n} && <= ${r}`, e);
    }),
    Cu = Y((e, t, n = -2147483648, r = 2147483647) => {
      if (typeof e != 'number') throw new B(t, 'number', e);
      if (!Rn(e)) throw new Ne(t, 'an integer', e);
      if (e < n || e > r) throw new Ne(t, `>= ${n} && <= ${r}`, e);
    }),
    ji = Y((e, t, n = !1) => {
      if (typeof e != 'number') throw new B(t, 'number', e);
      if (!Rn(e)) throw new Ne(t, 'an integer', e);
      let r = n ? 1 : 0,
        i = 4294967295;
      if (e < r || e > i) throw new Ne(t, `>= ${r} && <= ${i}`, e);
    });
  function mn(e, t) {
    if (typeof e != 'string') throw new B(t, 'string', e);
  }
  function ku(e, t, n = void 0, r) {
    if (typeof e != 'number') throw new B(t, 'number', e);
    if ((n != null && e < n) || (r != null && e > r) || ((n != null || r != null) && wu(e)))
      throw new Ne(
        t,
        `${n != null ? `>= ${n}` : ''}${n != null && r != null ? ' && ' : ''}${r != null ? `<= ${r}` : ''}`,
        e
      );
  }
  var Wu = Y((e, t, n) => {
    if (!Pi(n, e)) {
      let i =
        'must be one of: ' +
        Mi(
          _u(n, (o) => (typeof o == 'string' ? `'${o}'` : mu(o))),
          ', '
        );
      throw new He(t, e, i);
    }
  });
  function xi(e, t) {
    if (typeof e != 'boolean') throw new B(t, 'boolean', e);
  }
  function En(e, t, n) {
    return e == null || !Ru(e, t) ? n : e[t];
  }
  var Fu = Y((e, t, n = null) => {
      let r = En(n, 'allowArray', !1),
        i = En(n, 'allowFunction', !1);
      if (
        (!En(n, 'nullable', !1) && e === null) ||
        (!r && An(e)) ||
        (typeof e != 'object' && (!i || typeof e != 'function'))
      )
        throw new B(t, 'Object', e);
    }),
    Bu = Y((e, t) => {
      if (e != null && typeof e != 'object' && typeof e != 'function') throw new B(t, 'a dictionary', e);
    }),
    On = Y((e, t, n = 0) => {
      if (!An(e)) throw new B(t, 'Array', e);
      if (e.length < n) {
        let r = `must be longer than ${n}`;
        throw new He(t, e, r);
      }
    });
  function $u(e, t) {
    On(e, t);
    for (let n = 0; n < e.length; n++) mn(e[n], `${t}[${n}]`);
  }
  function Ju(e, t) {
    On(e, t);
    for (let n = 0; n < e.length; n++) xi(e[n], `${t}[${n}]`);
  }
  function Uu(e, t = 'signal') {
    if ((mn(e, t), Oi[e] === void 0))
      throw Oi[Ou(e)] !== void 0 ? new mi(e + ' (signals must use all capital letters)') : new mi(e);
  }
  var Vu = Y((e, t = 'buffer') => {
    if (!ju(e)) throw new B(t, ['Buffer', 'TypedArray', 'DataView'], e);
  });
  function Hu(e, t) {
    let n = Mu(t),
      r = e.length;
    if (n === 'hex' && r % 2 !== 0) throw new He('encoding', t, `is invalid for data of length ${r}`);
  }
  function Gu(e, t = 'Port', n = !0) {
    if (
      (typeof e != 'number' && typeof e != 'string') ||
      (typeof e == 'string' && Tu(e).length === 0) ||
      +e !== +e >>> 0 ||
      e > 65535 ||
      (e === 0 && !n)
    )
      throw new Pu(t, e, n);
    return e | 0;
  }
  var Ku = Y((e, t) => {
      if (e !== void 0 && (e === null || typeof e != 'object' || !('aborted' in e))) throw new B(t, 'AbortSignal', e);
    }),
    zu = Y((e, t) => {
      if (typeof e != 'function') throw new B(t, 'Function', e);
    }),
    Yu = Y((e, t) => {
      if (typeof e != 'function' || Du(e)) throw new B(t, 'Function', e);
    }),
    Zu = Y((e, t) => {
      if (e !== void 0) throw new B(t, 'undefined', e);
    });
  function Xu(e, t, n) {
    if (!Pi(n, e)) throw new B(t, `('${Mi(n, '|')}')`, e);
  }
  var Qu = /^(?:<[^>]*>)(?:\s*;\s*[^;"\s]+(?:=(")?[^;"\s]*\1)?)*$/;
  function Ti(e, t) {
    if (typeof e > 'u' || !Di(Qu, e))
      throw new He(t, e, 'must be an array or string of format "</styles.css>; rel=preload; as=style"');
  }
  function ef(e) {
    if (typeof e == 'string') return Ti(e, 'hints'), e;
    if (An(e)) {
      let t = e.length,
        n = '';
      if (t === 0) return n;
      for (let r = 0; r < t; r++) {
        let i = e[r];
        Ti(i, 'hints'), (n += i), r !== t - 1 && (n += ', ');
      }
      return n;
    }
    throw new He('hints', e, 'must be an array or string of format "</styles.css>; rel=preload; as=style"');
  }
  Ii.exports = {
    isInt32: xu,
    isUint32: Iu,
    parseFileMode: qu,
    validateArray: On,
    validateStringArray: $u,
    validateBooleanArray: Ju,
    validateBoolean: xi,
    validateBuffer: Vu,
    validateDictionary: Bu,
    validateEncoding: Hu,
    validateFunction: zu,
    validateInt32: Cu,
    validateInteger: Lu,
    validateNumber: ku,
    validateObject: Fu,
    validateOneOf: Wu,
    validatePlainFunction: Yu,
    validatePort: Gu,
    validateSignalName: Uu,
    validateString: mn,
    validateUint32: ji,
    validateUndefined: Zu,
    validateUnion: Xu,
    validateAbortSignal: Ku,
    validateLinkHeaderValue: ef,
  };
});
var Me = h((Rh, vi) => {
  vi.exports = global.process;
});
var fe = h((mh, zi) => {
  'use strict';
  var { Symbol: Mt, SymbolAsyncIterator: Ni, SymbolIterator: qi, SymbolFor: Li } = v(),
    Ci = Mt('kDestroyed'),
    ki = Mt('kIsErrored'),
    Tn = Mt('kIsReadable'),
    Wi = Mt('kIsDisturbed'),
    tf = Li('nodejs.webstream.isClosedPromise'),
    nf = Li('nodejs.webstream.controllerErrorFunction');
  function Dt(e, t = !1) {
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
  function jt(e) {
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
  function ue(e) {
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
      !ue(e) &&
      typeof e.pipeThrough == 'function' &&
      typeof e.getReader == 'function' &&
      typeof e.cancel == 'function'
    );
  }
  function Bi(e) {
    return !!(e && !ue(e) && typeof e.getWriter == 'function' && typeof e.abort == 'function');
  }
  function $i(e) {
    return !!(e && !ue(e) && typeof e.readable == 'object' && typeof e.writable == 'object');
  }
  function of(e) {
    return Fi(e) || Bi(e) || $i(e);
  }
  function sf(e, t) {
    return e == null
      ? !1
      : t === !0
      ? typeof e[Ni] == 'function'
      : t === !1
      ? typeof e[qi] == 'function'
      : typeof e[Ni] == 'function' || typeof e[qi] == 'function';
  }
  function xt(e) {
    if (!ue(e)) return null;
    let t = e._writableState,
      n = e._readableState,
      r = t || n;
    return !!(e.destroyed || e[Ci] || (r != null && r.destroyed));
  }
  function Ji(e) {
    if (!jt(e)) return null;
    if (e.writableEnded === !0) return !0;
    let t = e._writableState;
    return t != null && t.errored ? !1 : typeof t?.ended != 'boolean' ? null : t.ended;
  }
  function lf(e, t) {
    if (!jt(e)) return null;
    if (e.writableFinished === !0) return !0;
    let n = e._writableState;
    return n != null && n.errored
      ? !1
      : typeof n?.finished != 'boolean'
      ? null
      : !!(n.finished || (t === !1 && n.ended === !0 && n.length === 0));
  }
  function af(e) {
    if (!Dt(e)) return null;
    if (e.readableEnded === !0) return !0;
    let t = e._readableState;
    return !t || t.errored ? !1 : typeof t?.ended != 'boolean' ? null : t.ended;
  }
  function Ui(e, t) {
    if (!Dt(e)) return null;
    let n = e._readableState;
    return n != null && n.errored
      ? !1
      : typeof n?.endEmitted != 'boolean'
      ? null
      : !!(n.endEmitted || (t === !1 && n.ended === !0 && n.length === 0));
  }
  function Vi(e) {
    return e && e[Tn] != null
      ? e[Tn]
      : typeof e?.readable != 'boolean'
      ? null
      : xt(e)
      ? !1
      : Dt(e) && e.readable && !Ui(e);
  }
  function Hi(e) {
    return typeof e?.writable != 'boolean' ? null : xt(e) ? !1 : jt(e) && e.writable && !Ji(e);
  }
  function uf(e, t) {
    return ue(e) ? (xt(e) ? !0 : !((t?.readable !== !1 && Vi(e)) || (t?.writable !== !1 && Hi(e)))) : null;
  }
  function ff(e) {
    var t, n;
    return ue(e)
      ? e.writableErrored
        ? e.writableErrored
        : (t = (n = e._writableState) === null || n === void 0 ? void 0 : n.errored) !== null && t !== void 0
        ? t
        : null
      : null;
  }
  function cf(e) {
    var t, n;
    return ue(e)
      ? e.readableErrored
        ? e.readableErrored
        : (t = (n = e._readableState) === null || n === void 0 ? void 0 : n.errored) !== null && t !== void 0
        ? t
        : null
      : null;
  }
  function df(e) {
    if (!ue(e)) return null;
    if (typeof e.closed == 'boolean') return e.closed;
    let t = e._writableState,
      n = e._readableState;
    return typeof t?.closed == 'boolean' || typeof n?.closed == 'boolean'
      ? t?.closed || n?.closed
      : typeof e._closed == 'boolean' && Gi(e)
      ? e._closed
      : null;
  }
  function Gi(e) {
    return (
      typeof e._closed == 'boolean' &&
      typeof e._defaultKeepAlive == 'boolean' &&
      typeof e._removedConnection == 'boolean' &&
      typeof e._removedContLen == 'boolean'
    );
  }
  function Ki(e) {
    return typeof e._sent100 == 'boolean' && Gi(e);
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
    if (!ue(e)) return null;
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
              (o = (s = e[ki]) !== null && s !== void 0 ? s : e.readableErrored) !== null && o !== void 0
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
    kDestroyed: Ci,
    isDisturbed: pf,
    kIsDisturbed: Wi,
    isErrored: yf,
    kIsErrored: ki,
    isReadable: Vi,
    kIsReadable: Tn,
    kIsClosedPromise: tf,
    kControllerErrorFunction: nf,
    isClosed: df,
    isDestroyed: xt,
    isDuplexNodeStream: rf,
    isFinished: uf,
    isIterable: sf,
    isReadableNodeStream: Dt,
    isReadableStream: Fi,
    isReadableEnded: af,
    isReadableFinished: Ui,
    isReadableErrored: cf,
    isNodeStream: ue,
    isWebStream: of,
    isWritable: Hi,
    isWritableNodeStream: jt,
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
var ye = h((Oh, xn) => {
  var De = Me(),
    { AbortError: io, codes: gf } = F(),
    { ERR_INVALID_ARG_TYPE: _f, ERR_STREAM_PREMATURE_CLOSE: Yi } = gf,
    { kEmptyObject: Mn, once: Dn } = ae(),
    { validateAbortSignal: wf, validateFunction: Sf, validateObject: Ef, validateBoolean: Af } = lt(),
    { Promise: Rf, PromisePrototypeThen: mf } = v(),
    {
      isClosed: Of,
      isReadable: Zi,
      isReadableNodeStream: Pn,
      isReadableStream: Tf,
      isReadableFinished: Xi,
      isReadableErrored: Qi,
      isWritable: eo,
      isWritableNodeStream: to,
      isWritableStream: Pf,
      isWritableFinished: no,
      isWritableErrored: ro,
      isNodeStream: Mf,
      willEmitClose: Df,
      kIsClosedPromise: jf,
    } = fe();
  function xf(e) {
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
      Tf(e) || Pf(e))
    )
      return If(e, t, n);
    if (!Mf(e)) throw new _f('stream', ['ReadableStream', 'WritableStream', 'Stream'], e);
    let o = (r = t.readable) !== null && r !== void 0 ? r : Pn(e),
      s = (i = t.writable) !== null && i !== void 0 ? i : to(e),
      l = e._writableState,
      u = e._readableState,
      a = () => {
        e.writable || p();
      },
      c = Df(e) && Pn(e) === o && to(e) === s,
      d = no(e, !1),
      p = () => {
        (d = !0), e.destroyed && (c = !1), !(c && (!e.readable || o)) && (!o || b) && n.call(e);
      },
      b = Xi(e, !1),
      f = () => {
        (b = !0), e.destroyed && (c = !1), !(c && (!e.writable || s)) && (!s || d) && n.call(e);
      },
      x = (k) => {
        n.call(e, k);
      },
      P = Of(e),
      R = () => {
        P = !0;
        let k = ro(e) || Qi(e);
        if (k && typeof k != 'boolean') return n.call(e, k);
        if (o && !b && Pn(e, !0) && !Xi(e, !1)) return n.call(e, new Yi());
        if (s && !d && !no(e, !1)) return n.call(e, new Yi());
        n.call(e);
      },
      S = () => {
        P = !0;
        let k = ro(e) || Qi(e);
        if (k && typeof k != 'boolean') return n.call(e, k);
        n.call(e);
      },
      y = () => {
        e.req.on('finish', p);
      };
    xf(e)
      ? (e.on('complete', p), c || e.on('abort', R), e.req ? y() : e.on('request', y))
      : s && !l && (e.on('end', a), e.on('close', a)),
      !c && typeof e.aborted == 'boolean' && e.on('aborted', R),
      e.on('end', f),
      e.on('finish', p),
      t.error !== !1 && e.on('error', x),
      e.on('close', R),
      P
        ? De.nextTick(R)
        : (l != null && l.errorEmitted) || (u != null && u.errorEmitted)
        ? c || De.nextTick(S)
        : ((!o && (!c || Zi(e)) && (d || eo(e) === !1)) ||
            (!s && (!c || eo(e)) && (b || Zi(e) === !1)) ||
            (u && e.req && e.aborted)) &&
          De.nextTick(S);
    let C = () => {
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
        e.removeListener('error', x),
        e.removeListener('close', R);
    };
    if (t.signal && !P) {
      let k = () => {
        let $ = n;
        C(), $.call(e, new io(void 0, { cause: t.signal.reason }));
      };
      if (t.signal.aborted) De.nextTick(k);
      else {
        let $ = n;
        (n = Dn((...Je) => {
          t.signal.removeEventListener('abort', k), $.apply(e, Je);
        })),
          t.signal.addEventListener('abort', k);
      }
    }
    return C;
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
        De.nextTick(i);
      else {
        let s = n;
        (n = Dn((...l) => {
          t.signal.removeEventListener('abort', i), s.apply(e, l);
        })),
          t.signal.addEventListener('abort', i);
      }
    let o = (...s) => {
      r || De.nextTick(() => n.apply(e, s));
    };
    return mf(e[jf].promise, o, o), jn;
  }
  function vf(e, t) {
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
  xn.exports = oo;
  xn.exports.finished = vf;
});
var qe = h((Th, ho) => {
  'use strict';
  var ce = Me(),
    {
      aggregateTwoErrors: Nf,
      codes: { ERR_MULTIPLE_CALLBACK: qf },
      AbortError: Lf,
    } = F(),
    { Symbol: ao } = v(),
    { kDestroyed: Cf, isDestroyed: kf, isFinished: Wf, isServerRequest: Ff } = fe(),
    uo = ao('kDestroy'),
    In = ao('kConstruct');
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
              so(this, Nf(o, e), t);
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
        o ? ce.nextTick($f, e, o) : ce.nextTick(co, e);
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
  function Nn(e, t, n) {
    let r = e._readableState,
      i = e._writableState;
    if ((i != null && i.destroyed) || (r != null && r.destroyed)) return this;
    (r != null && r.autoDestroy) || (i != null && i.autoDestroy)
      ? e.destroy(t)
      : t &&
        (t.stack,
        i && !i.errored && (i.errored = t),
        r && !r.errored && (r.errored = t),
        n ? ce.nextTick(vn, e, t) : vn(e, t));
  }
  function Uf(e, t) {
    if (typeof e._construct != 'function') return;
    let n = e._readableState,
      r = e._writableState;
    n && (n.constructed = !1),
      r && (r.constructed = !1),
      e.once(In, t),
      !(e.listenerCount(In) > 1) && ce.nextTick(Vf, e);
  }
  function Vf(e) {
    let t = !1;
    function n(r) {
      if (t) {
        Nn(e, r ?? new qf());
        return;
      }
      t = !0;
      let i = e._readableState,
        o = e._writableState,
        s = o || i;
      i && (i.constructed = !0),
        o && (o.constructed = !0),
        s.destroyed ? e.emit(uo, r) : r ? Nn(e, r, !0) : ce.nextTick(Hf, e);
    }
    try {
      e._construct((r) => {
        ce.nextTick(n, r);
      });
    } catch (r) {
      ce.nextTick(n, r);
    }
  }
  function Hf(e) {
    e.emit(In);
  }
  function lo(e) {
    return e?.setHeader && typeof e.abort == 'function';
  }
  function bo(e) {
    e.emit('close');
  }
  function Gf(e, t) {
    e.emit('error', t), ce.nextTick(bo, e);
  }
  function Kf(e, t) {
    !e ||
      kf(e) ||
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
        ? ce.nextTick(Gf, e, t)
        : ce.nextTick(bo, e),
      e.destroyed || (e[Cf] = !0));
  }
  ho.exports = { construct: Uf, destroyer: Kf, destroy: Bf, undestroy: Jf, errorOrDestroy: Nn };
});
var Nt = h((Ph, yo) => {
  'use strict';
  var { ArrayIsArray: zf, ObjectSetPrototypeOf: po } = v(),
    { EventEmitter: It } = require('events');
  function vt(e) {
    It.call(this, e);
  }
  po(vt.prototype, It.prototype);
  po(vt, It);
  vt.prototype.pipe = function (e, t) {
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
      a(), It.listenerCount(this, 'error') === 0 && this.emit('error', c);
    }
    qn(n, 'error', u), qn(e, 'error', u);
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
  function qn(e, t, n) {
    if (typeof e.prependListener == 'function') return e.prependListener(t, n);
    !e._events || !e._events[t]
      ? e.on(t, n)
      : zf(e._events[t])
      ? e._events[t].unshift(n)
      : (e._events[t] = [n, e._events[t]]);
  }
  yo.exports = { Stream: vt, prependListener: qn };
});
var at = h((Mh, qt) => {
  'use strict';
  var { AbortError: go, codes: Yf } = F(),
    { isNodeStream: _o, isWebStream: Zf, kControllerErrorFunction: Xf } = fe(),
    Qf = ye(),
    { ERR_INVALID_ARG_TYPE: wo } = Yf,
    ec = (e, t) => {
      if (typeof e != 'object' || !('aborted' in e)) throw new wo(t, 'AbortSignal', e);
    };
  qt.exports.addAbortSignal = function (t, n) {
    if ((ec(t, 'signal'), !_o(n) && !Zf(n))) throw new wo('stream', ['ReadableStream', 'WritableStream', 'Stream'], n);
    return qt.exports.addAbortSignalNoValidate(t, n);
  };
  qt.exports.addAbortSignalNoValidate = function (e, t) {
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
var Ao = h((jh, Eo) => {
  'use strict';
  var { StringPrototypeSlice: So, SymbolIterator: tc, TypedArrayPrototypeSet: Lt, Uint8Array: nc } = v(),
    { Buffer: Ln } = require('buffer'),
    { inspect: rc } = ae();
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
      if (this.length === 0) return Ln.alloc(0);
      let n = Ln.allocUnsafe(t >>> 0),
        r = this.head,
        i = 0;
      for (; r; ) Lt(n, r.data, i), (i += r.data.length), (r = r.next);
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
      let n = Ln.allocUnsafe(t),
        r = t,
        i = this.head,
        o = 0;
      do {
        let s = i.data;
        if (t > s.length) Lt(n, s, r - t), (t -= s.length);
        else {
          t === s.length
            ? (Lt(n, s, r - t), ++o, i.next ? (this.head = i.next) : (this.head = this.tail = null))
            : (Lt(n, new nc(s.buffer, s.byteOffset, t), r - t), (this.head = i), (i.data = s.slice(t)));
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
var Ct = h((xh, mo) => {
  'use strict';
  var { MathFloor: ic, NumberIsInteger: oc } = v(),
    { ERR_INVALID_ARG_VALUE: sc } = F().codes;
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
var Cn = h((Ih, Mo) => {
  'use strict';
  var Oo = Me(),
    { PromisePrototypeThen: uc, SymbolAsyncIterator: To, SymbolIterator: Po } = v(),
    { Buffer: fc } = require('buffer'),
    { ERR_INVALID_ARG_TYPE: cc, ERR_STREAM_NULL_VALUES: dc } = F().codes;
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
    else if (t && t[Po]) (i = !1), (r = t[Po]());
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
  Mo.exports = bc;
});
var ut = h((vh, Bo) => {
  var oe = Me(),
    {
      ArrayPrototypeIndexOf: hc,
      NumberIsInteger: pc,
      NumberIsNaN: yc,
      NumberParseInt: gc,
      ObjectDefineProperties: xo,
      ObjectKeys: _c,
      ObjectSetPrototypeOf: Io,
      Promise: wc,
      SafeSet: Sc,
      SymbolAsyncIterator: Ec,
      Symbol: Ac,
    } = v();
  Bo.exports = g;
  g.ReadableState = Jn;
  var { EventEmitter: Rc } = require('events'),
    { Stream: je, prependListener: mc } = Nt(),
    { Buffer: kn } = require('buffer'),
    { addAbortSignal: Oc } = at(),
    Tc = ye(),
    w = ae().debuglog('stream', (e) => {
      w = e;
    }),
    Pc = Ao(),
    Ke = qe(),
    { getHighWaterMark: Mc, getDefaultHighWaterMark: Dc } = Ct(),
    {
      aggregateTwoErrors: Do,
      codes: {
        ERR_INVALID_ARG_TYPE: jc,
        ERR_METHOD_NOT_IMPLEMENTED: xc,
        ERR_OUT_OF_RANGE: Ic,
        ERR_STREAM_PUSH_AFTER_EOF: vc,
        ERR_STREAM_UNSHIFT_AFTER_END_EVENT: Nc,
      },
    } = F(),
    { validateObject: qc } = lt(),
    Le = Ac('kPaused'),
    { StringDecoder: vo } = require('string_decoder'),
    Lc = Cn();
  Io(g.prototype, je.prototype);
  Io(g, je);
  var Wn = () => {},
    { errorOrDestroy: Ge } = Ke;
  function Jn(e, t, n) {
    typeof n != 'boolean' && (n = t instanceof de()),
      (this.objectMode = !!(e && e.objectMode)),
      n && (this.objectMode = this.objectMode || !!(e && e.readableObjectMode)),
      (this.highWaterMark = e ? Mc(this, e, 'readableHighWaterMark', n) : Dc(!1)),
      (this.buffer = new Pc()),
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
      (this[Le] = null),
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
      e && e.encoding && ((this.decoder = new vo(e.encoding)), (this.encoding = e.encoding));
  }
  function g(e) {
    if (!(this instanceof g)) return new g(e);
    let t = this instanceof de();
    (this._readableState = new Jn(e, this, t)),
      e &&
        (typeof e.read == 'function' && (this._read = e.read),
        typeof e.destroy == 'function' && (this._destroy = e.destroy),
        typeof e.construct == 'function' && (this._construct = e.construct),
        e.signal && !t && Oc(e.signal, this)),
      je.call(this, e),
      Ke.construct(this, () => {
        this._readableState.needReadable && kt(this, this._readableState);
      });
  }
  g.prototype.destroy = Ke.destroy;
  g.prototype._undestroy = Ke.undestroy;
  g.prototype._destroy = function (e, t) {
    t(e);
  };
  g.prototype[Rc.captureRejectionSymbol] = function (e) {
    this.destroy(e);
  };
  g.prototype.push = function (e, t) {
    return No(this, e, t, !1);
  };
  g.prototype.unshift = function (e, t) {
    return No(this, e, t, !0);
  };
  function No(e, t, n, r) {
    w('readableAddChunk', t);
    let i = e._readableState,
      o;
    if (
      (i.objectMode ||
        (typeof t == 'string'
          ? ((n = n || i.defaultEncoding),
            i.encoding !== n &&
              (r && i.encoding ? (t = kn.from(t, n).toString(i.encoding)) : ((t = kn.from(t, n)), (n = ''))))
          : t instanceof kn
          ? (n = '')
          : je._isUint8Array(t)
          ? ((t = je._uint8ArrayToBuffer(t)), (n = ''))
          : t != null && (o = new jc('chunk', ['string', 'Buffer', 'Uint8Array'], t))),
      o)
    )
      Ge(e, o);
    else if (t === null) (i.reading = !1), Wc(e, i);
    else if (i.objectMode || (t && t.length > 0))
      if (r)
        if (i.endEmitted) Ge(e, new Nc());
        else {
          if (i.destroyed || i.errored) return !1;
          Fn(e, i, t, !0);
        }
      else if (i.ended) Ge(e, new vc());
      else {
        if (i.destroyed || i.errored) return !1;
        (i.reading = !1),
          i.decoder && !n
            ? ((t = i.decoder.write(t)), i.objectMode || t.length !== 0 ? Fn(e, i, t, !1) : kt(e, i))
            : Fn(e, i, t, !1);
      }
    else r || ((i.reading = !1), kt(e, i));
    return !i.ended && (i.length < i.highWaterMark || i.length === 0);
  }
  function Fn(e, t, n, r) {
    t.flowing && t.length === 0 && !t.sync && e.listenerCount('data') > 0
      ? (t.multiAwaitDrain ? t.awaitDrainWriters.clear() : (t.awaitDrainWriters = null),
        (t.dataEmitted = !0),
        e.emit('data', n))
      : ((t.length += t.objectMode ? 1 : n.length),
        r ? t.buffer.unshift(n) : t.buffer.push(n),
        t.needReadable && Wt(e)),
      kt(e, t);
  }
  g.prototype.isPaused = function () {
    let e = this._readableState;
    return e[Le] === !0 || e.flowing === !1;
  };
  g.prototype.setEncoding = function (e) {
    let t = new vo(e);
    (this._readableState.decoder = t), (this._readableState.encoding = this._readableState.decoder.encoding);
    let n = this._readableState.buffer,
      r = '';
    for (let i of n) r += t.write(i);
    return n.clear(), r !== '' && n.push(r), (this._readableState.length = r.length), this;
  };
  var Cc = 1073741824;
  function kc(e) {
    if (e > Cc) throw new Ic('size', '<= 1GiB', e);
    return e--, (e |= e >>> 1), (e |= e >>> 2), (e |= e >>> 4), (e |= e >>> 8), (e |= e >>> 16), e++, e;
  }
  function jo(e, t) {
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
      (e > t.highWaterMark && (t.highWaterMark = kc(e)),
      e !== 0 && (t.emittedReadable = !1),
      e === 0 && t.needReadable && ((t.highWaterMark !== 0 ? t.length >= t.highWaterMark : t.length > 0) || t.ended))
    )
      return w('read: emitReadable', t.length, t.ended), t.length === 0 && t.ended ? Bn(this) : Wt(this), null;
    if (((e = jo(e, t)), e === 0 && t.ended)) return t.length === 0 && Bn(this), null;
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
      (t.sync = !1), t.reading || (e = jo(n, t));
    }
    let i;
    return (
      e > 0 ? (i = Wo(e, t)) : (i = null),
      i === null
        ? ((t.needReadable = t.length <= t.highWaterMark), (e = 0))
        : ((t.length -= e), t.multiAwaitDrain ? t.awaitDrainWriters.clear() : (t.awaitDrainWriters = null)),
      t.length === 0 && (t.ended || (t.needReadable = !0), n !== e && t.ended && Bn(this)),
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
      (t.ended = !0), t.sync ? Wt(e) : ((t.needReadable = !1), (t.emittedReadable = !0), qo(e));
    }
  }
  function Wt(e) {
    let t = e._readableState;
    w('emitReadable', t.needReadable, t.emittedReadable),
      (t.needReadable = !1),
      t.emittedReadable || (w('emitReadable', t.flowing), (t.emittedReadable = !0), oe.nextTick(qo, e));
  }
  function qo(e) {
    let t = e._readableState;
    w('emitReadable_', t.destroyed, t.length, t.ended),
      !t.destroyed && !t.errored && (t.length || t.ended) && (e.emit('readable'), (t.emittedReadable = !1)),
      (t.needReadable = !t.flowing && !t.ended && t.length <= t.highWaterMark),
      Co(e);
  }
  function kt(e, t) {
    !t.readingMore && t.constructed && ((t.readingMore = !0), oe.nextTick(Fc, e, t));
  }
  function Fc(e, t) {
    for (; !t.reading && !t.ended && (t.length < t.highWaterMark || (t.flowing && t.length === 0)); ) {
      let n = t.length;
      if ((w('maybeReadMore read 0'), e.read(0), n === t.length)) break;
    }
    t.readingMore = !1;
  }
  g.prototype._read = function (e) {
    throw new xc('_read()');
  };
  g.prototype.pipe = function (e, t) {
    let n = this,
      r = this._readableState;
    r.pipes.length === 1 &&
      (r.multiAwaitDrain ||
        ((r.multiAwaitDrain = !0), (r.awaitDrainWriters = new Sc(r.awaitDrainWriters ? [r.awaitDrainWriters] : [])))),
      r.pipes.push(e),
      w('pipe count=%d opts=%j', r.pipes.length, t);
    let o = (!t || t.end !== !1) && e !== oe.stdout && e !== oe.stderr ? l : P;
    r.endEmitted ? oe.nextTick(o) : n.once('end', o), e.on('unpipe', s);
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
        e.removeListener('finish', x),
        u && e.removeListener('drain', u),
        e.removeListener('error', b),
        e.removeListener('unpipe', s),
        n.removeListener('end', l),
        n.removeListener('end', P),
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
      if ((w('onerror', R), P(), e.removeListener('error', b), e.listenerCount('error') === 0)) {
        let S = e._writableState || e._readableState;
        S && !S.errorEmitted ? Ge(e, R) : e.emit('error', R);
      }
    }
    mc(e, 'error', b);
    function f() {
      e.removeListener('finish', x), P();
    }
    e.once('close', f);
    function x() {
      w('onfinish'), e.removeListener('close', f), P();
    }
    e.once('finish', x);
    function P() {
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
    let n = je.prototype.on.call(this, e, t),
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
          r.length ? Wt(this) : r.reading || oe.nextTick($c, this)),
      n
    );
  };
  g.prototype.addListener = g.prototype.on;
  g.prototype.removeListener = function (e, t) {
    let n = je.prototype.removeListener.call(this, e, t);
    return e === 'readable' && oe.nextTick(Lo, this), n;
  };
  g.prototype.off = g.prototype.removeListener;
  g.prototype.removeAllListeners = function (e) {
    let t = je.prototype.removeAllListeners.apply(this, arguments);
    return (e === 'readable' || e === void 0) && oe.nextTick(Lo, this), t;
  };
  function Lo(e) {
    let t = e._readableState;
    (t.readableListening = e.listenerCount('readable') > 0),
      t.resumeScheduled && t[Le] === !1
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
    return e.flowing || (w('resume'), (e.flowing = !e.readableListening), Jc(this, e)), (e[Le] = !1), this;
  };
  function Jc(e, t) {
    t.resumeScheduled || ((t.resumeScheduled = !0), oe.nextTick(Uc, e, t));
  }
  function Uc(e, t) {
    w('resume', t.reading),
      t.reading || e.read(0),
      (t.resumeScheduled = !1),
      e.emit('resume'),
      Co(e),
      t.flowing && !t.reading && e.read(0);
  }
  g.prototype.pause = function () {
    return (
      w('call pause flowing=%j', this._readableState.flowing),
      this._readableState.flowing !== !1 && (w('pause'), (this._readableState.flowing = !1), this.emit('pause')),
      (this._readableState[Le] = !0),
      this
    );
  };
  function Co(e) {
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
    return ko(this);
  };
  g.prototype.iterator = function (e) {
    return e !== void 0 && qc(e, 'options'), ko(this, e);
  };
  function ko(e, t) {
    typeof e.read != 'function' && (e = g.wrap(e, { objectMode: !0 }));
    let n = Vc(e, t);
    return (n.stream = e), n;
  }
  async function* Vc(e, t) {
    let n = Wn;
    function r(s) {
      this === e ? (n(), (n = Wn)) : (n = s);
    }
    e.on('readable', r);
    let i,
      o = Tc(e, { writable: !1 }, (s) => {
        (i = s ? Do(i, s) : null), n(), (n = Wn);
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
      throw ((i = Do(i, s)), i);
    } finally {
      (i || t?.destroyOnReturn !== !1) && (i === void 0 || e._readableState.autoDestroy)
        ? Ke.destroyer(e, null)
        : (e.off('readable', r), o());
    }
  }
  xo(g.prototype, {
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
  xo(Jn.prototype, {
    pipesCount: {
      __proto__: null,
      get() {
        return this.pipes.length;
      },
    },
    paused: {
      __proto__: null,
      get() {
        return this[Le] !== !1;
      },
      set(e) {
        this[Le] = !!e;
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
  function Bn(e) {
    let t = e._readableState;
    w('endReadable', t.endEmitted), t.endEmitted || ((t.ended = !0), oe.nextTick(Hc, t, e));
  }
  function Hc(e, t) {
    if (
      (w('endReadableNT', e.endEmitted, e.length), !e.errored && !e.closeEmitted && !e.endEmitted && e.length === 0)
    ) {
      if (((e.endEmitted = !0), t.emit('end'), t.writable && t.allowHalfOpen === !1)) oe.nextTick(Gc, t);
      else if (e.autoDestroy) {
        let n = t._writableState;
        (!n || (n.autoDestroy && (n.finished || n.writable === !1))) && t.destroy();
      }
    }
  }
  function Gc(e) {
    e.writable && !e.writableEnded && !e.destroyed && e.end();
  }
  g.from = function (e, t) {
    return Lc(g, e, t);
  };
  var $n;
  function Fo() {
    return $n === void 0 && ($n = {}), $n;
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
        Ke.destroyer(e, i), o(i);
      },
    }).wrap(e);
  };
});
var Yn = h((Nh, Qo) => {
  var Ce = Me(),
    {
      ArrayPrototypeSlice: Uo,
      Error: Kc,
      FunctionPrototypeSymbolHasInstance: Vo,
      ObjectDefineProperty: Ho,
      ObjectDefineProperties: zc,
      ObjectSetPrototypeOf: Go,
      StringPrototypeToLowerCase: Yc,
      Symbol: Zc,
      SymbolHasInstance: Xc,
    } = v();
  Qo.exports = j;
  j.WritableState = dt;
  var { EventEmitter: Qc } = require('events'),
    ft = Nt().Stream,
    { Buffer: Ft } = require('buffer'),
    Jt = qe(),
    { addAbortSignal: ed } = at(),
    { getHighWaterMark: td, getDefaultHighWaterMark: nd } = Ct(),
    {
      ERR_INVALID_ARG_TYPE: rd,
      ERR_METHOD_NOT_IMPLEMENTED: id,
      ERR_MULTIPLE_CALLBACK: Ko,
      ERR_STREAM_CANNOT_PIPE: od,
      ERR_STREAM_DESTROYED: ct,
      ERR_STREAM_ALREADY_FINISHED: sd,
      ERR_STREAM_NULL_VALUES: ld,
      ERR_STREAM_WRITE_AFTER_END: ad,
      ERR_UNKNOWN_ENCODING: zo,
    } = F().codes,
    { errorOrDestroy: ze } = Jt;
  Go(j.prototype, ft.prototype);
  Go(j, ft);
  function Hn() {}
  var Ye = Zc('kOnFinished');
  function dt(e, t, n) {
    typeof n != 'boolean' && (n = t instanceof de()),
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
      $t(this),
      (this.pendingcb = 0),
      (this.constructed = !0),
      (this.prefinished = !1),
      (this.errorEmitted = !1),
      (this.emitClose = !e || e.emitClose !== !1),
      (this.autoDestroy = !e || e.autoDestroy !== !1),
      (this.errored = null),
      (this.closed = !1),
      (this.closeEmitted = !1),
      (this[Ye] = []);
  }
  function $t(e) {
    (e.buffered = []), (e.bufferedIndex = 0), (e.allBuffers = !0), (e.allNoop = !0);
  }
  dt.prototype.getBuffer = function () {
    return Uo(this.buffered, this.bufferedIndex);
  };
  Ho(dt.prototype, 'bufferedRequestCount', {
    __proto__: null,
    get() {
      return this.buffered.length - this.bufferedIndex;
    },
  });
  function j(e) {
    let t = this instanceof de();
    if (!t && !Vo(j, this)) return new j(e);
    (this._writableState = new dt(e, this, t)),
      e &&
        (typeof e.write == 'function' && (this._write = e.write),
        typeof e.writev == 'function' && (this._writev = e.writev),
        typeof e.destroy == 'function' && (this._destroy = e.destroy),
        typeof e.final == 'function' && (this._final = e.final),
        typeof e.construct == 'function' && (this._construct = e.construct),
        e.signal && ed(e.signal, this)),
      ft.call(this, e),
      Jt.construct(this, () => {
        let n = this._writableState;
        n.writing || Kn(this, n), zn(this, n);
      });
  }
  Ho(j, Xc, {
    __proto__: null,
    value: function (e) {
      return Vo(this, e) ? !0 : this !== j ? !1 : e && e._writableState instanceof dt;
    },
  });
  j.prototype.pipe = function () {
    ze(this, new od());
  };
  function Yo(e, t, n, r) {
    let i = e._writableState;
    if (typeof n == 'function') (r = n), (n = i.defaultEncoding);
    else {
      if (!n) n = i.defaultEncoding;
      else if (n !== 'buffer' && !Ft.isEncoding(n)) throw new zo(n);
      typeof r != 'function' && (r = Hn);
    }
    if (t === null) throw new ld();
    if (!i.objectMode)
      if (typeof t == 'string') i.decodeStrings !== !1 && ((t = Ft.from(t, n)), (n = 'buffer'));
      else if (t instanceof Ft) n = 'buffer';
      else if (ft._isUint8Array(t)) (t = ft._uint8ArrayToBuffer(t)), (n = 'buffer');
      else throw new rd('chunk', ['string', 'Buffer', 'Uint8Array'], t);
    let o;
    return (
      i.ending ? (o = new ad()) : i.destroyed && (o = new ct('write')),
      o ? (Ce.nextTick(r, o), ze(e, o, !0), o) : (i.pendingcb++, ud(e, i, t, n, r))
    );
  }
  j.prototype.write = function (e, t, n) {
    return Yo(this, e, t, n) === !0;
  };
  j.prototype.cork = function () {
    this._writableState.corked++;
  };
  j.prototype.uncork = function () {
    let e = this._writableState;
    e.corked && (e.corked--, e.writing || Kn(this, e));
  };
  j.prototype.setDefaultEncoding = function (t) {
    if ((typeof t == 'string' && (t = Yc(t)), !Ft.isEncoding(t))) throw new zo(t);
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
      t.destroyed ? t.onwrite(new ct('write')) : n ? e._writev(i, t.onwrite) : e._write(i, o, t.onwrite),
      (t.sync = !1);
  }
  function Jo(e, t, n, r) {
    --t.pendingcb, r(n), Gn(t), ze(e, n);
  }
  function fd(e, t) {
    let n = e._writableState,
      r = n.sync,
      i = n.writecb;
    if (typeof i != 'function') {
      ze(e, new Ko());
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
          r ? Ce.nextTick(Jo, e, n, t, i) : Jo(e, n, t, i))
        : (n.buffered.length > n.bufferedIndex && Kn(e, n),
          r
            ? n.afterWriteTickInfo !== null && n.afterWriteTickInfo.cb === i
              ? n.afterWriteTickInfo.count++
              : ((n.afterWriteTickInfo = { count: 1, cb: i, stream: e, state: n }),
                Ce.nextTick(cd, n.afterWriteTickInfo))
            : Zo(e, n, 1, i));
  }
  function cd({ stream: e, state: t, count: n, cb: r }) {
    return (t.afterWriteTickInfo = null), Zo(e, t, n, r);
  }
  function Zo(e, t, n, r) {
    for (!t.ending && !e.destroyed && t.length === 0 && t.needDrain && ((t.needDrain = !1), e.emit('drain')); n-- > 0; )
      t.pendingcb--, r();
    t.destroyed && Gn(t), zn(e, t);
  }
  function Gn(e) {
    if (e.writing) return;
    for (let i = e.bufferedIndex; i < e.buffered.length; ++i) {
      var t;
      let { chunk: o, callback: s } = e.buffered[i],
        l = e.objectMode ? 1 : o.length;
      (e.length -= l), s((t = e.errored) !== null && t !== void 0 ? t : new ct('write'));
    }
    let n = e[Ye].splice(0);
    for (let i = 0; i < n.length; i++) {
      var r;
      n[i]((r = e.errored) !== null && r !== void 0 ? r : new ct('end'));
    }
    $t(e);
  }
  function Kn(e, t) {
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
      (u.allBuffers = t.allBuffers), $o(e, t, !0, t.length, u, '', l), $t(t);
    } else {
      do {
        let { chunk: l, encoding: u, callback: a } = n[s];
        n[s++] = null;
        let c = i ? 1 : l.length;
        $o(e, t, !1, c, l, u, a);
      } while (s < n.length && !t.writing);
      s === n.length ? $t(t) : s > 256 ? (n.splice(0, s), (t.bufferedIndex = 0)) : (t.bufferedIndex = s);
    }
    t.bufferProcessing = !1;
  }
  j.prototype._write = function (e, t, n) {
    if (this._writev) this._writev([{ chunk: e, encoding: t }], n);
    else throw new id('_write()');
  };
  j.prototype._writev = null;
  j.prototype.end = function (e, t, n) {
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
          ? ((r.ending = !0), zn(this, r, !0), (r.ended = !0))
          : r.finished
          ? (i = new sd('end'))
          : r.destroyed && (i = new ct('end'))),
      typeof n == 'function' && (i || r.finished ? Ce.nextTick(n, i) : r[Ye].push(n)),
      this
    );
  };
  function Bt(e) {
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
        ze(e, i ?? Ko());
        return;
      }
      if (((n = !0), t.pendingcb--, i)) {
        let o = t[Ye].splice(0);
        for (let s = 0; s < o.length; s++) o[s](i);
        ze(e, i, t.sync);
      } else Bt(t) && ((t.prefinished = !0), e.emit('prefinish'), t.pendingcb++, Ce.nextTick(Vn, e, t));
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
  function zn(e, t, n) {
    Bt(t) &&
      (bd(e, t),
      t.pendingcb === 0 &&
        (n
          ? (t.pendingcb++,
            Ce.nextTick(
              (r, i) => {
                Bt(i) ? Vn(r, i) : i.pendingcb--;
              },
              e,
              t
            ))
          : Bt(t) && (t.pendingcb++, Vn(e, t))));
  }
  function Vn(e, t) {
    t.pendingcb--, (t.finished = !0);
    let n = t[Ye].splice(0);
    for (let r = 0; r < n.length; r++) n[r]();
    if ((e.emit('finish'), t.autoDestroy)) {
      let r = e._readableState;
      (!r || (r.autoDestroy && (r.endEmitted || r.readable === !1))) && e.destroy();
    }
  }
  zc(j.prototype, {
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
  var hd = Jt.destroy;
  j.prototype.destroy = function (e, t) {
    let n = this._writableState;
    return (
      !n.destroyed && (n.bufferedIndex < n.buffered.length || n[Ye].length) && Ce.nextTick(Gn, n),
      hd.call(this, e, t),
      this
    );
  };
  j.prototype._undestroy = Jt.undestroy;
  j.prototype._destroy = function (e, t) {
    t(e);
  };
  j.prototype[Qc.captureRejectionSymbol] = function (e) {
    this.destroy(e);
  };
  var Un;
  function Xo() {
    return Un === void 0 && (Un = {}), Un;
  }
  j.fromWeb = function (e, t) {
    return Xo().newStreamWritableFromWritableStream(e, t);
  };
  j.toWeb = function (e) {
    return Xo().newWritableStreamFromStreamWritable(e);
  };
});
var cs = h((qh, fs) => {
  var Zn = Me(),
    pd = require('buffer'),
    {
      isReadable: yd,
      isWritable: gd,
      isIterable: es,
      isNodeStream: _d,
      isReadableNodeStream: ts,
      isWritableNodeStream: ns,
      isDuplexNodeStream: wd,
    } = fe(),
    rs = ye(),
    {
      AbortError: us,
      codes: { ERR_INVALID_ARG_TYPE: Sd, ERR_INVALID_RETURN_VALUE: is },
    } = F(),
    { destroyer: Ze } = qe(),
    Ed = de(),
    Ad = ut(),
    { createDeferredPromise: os } = ae(),
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
    md = globalThis.AbortController || Ot().AbortController,
    { FunctionPrototypeCall: as } = v(),
    ke = class extends Ed {
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
    if (ts(t)) return Ut({ readable: t });
    if (ns(t)) return Ut({ writable: t });
    if (_d(t)) return Ut({ writable: !1, readable: !1 });
    if (typeof t == 'function') {
      let { value: i, write: o, final: s, destroy: l } = Od(t);
      if (es(i)) return ss(ke, i, { objectMode: !0, write: o, final: s, destroy: l });
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
              Ze(a, d);
            }
          );
        return (a = new ke({
          objectMode: !0,
          readable: !1,
          write: o,
          final(d) {
            s(async () => {
              try {
                await c, Zn.nextTick(d, null);
              } catch (p) {
                Zn.nextTick(d, p);
              }
            });
          },
          destroy: l,
        }));
      }
      throw new is('Iterable, AsyncIterable or AsyncFunction', n, i);
    }
    if (Rd(t)) return e(t.arrayBuffer());
    if (es(t)) return ss(ke, t, { objectMode: !0, writable: !1 });
    if (typeof t?.writable == 'object' || typeof t?.readable == 'object') {
      let i = t != null && t.readable ? (ts(t?.readable) ? t?.readable : e(t.readable)) : void 0,
        o = t != null && t.writable ? (ns(t?.writable) ? t?.writable : e(t.writable)) : void 0;
      return Ut({ readable: i, writable: o });
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
            Ze(i, o);
          }
        ),
        (i = new ke({ objectMode: !0, writable: !1, read() {} }))
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
            if ((Zn.nextTick(a), u)) return;
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
  function Ut(e) {
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
      (a = new ke({
        readableObjectMode: !!(t != null && t.readableObjectMode),
        writableObjectMode: !!(n != null && n.writableObjectMode),
        readable: r,
        writable: i,
      })),
      i &&
        (rs(n, (d) => {
          (i = !1), d && Ze(t, d), c(d);
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
          (r = !1), d && Ze(t, d), c(d);
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
          u === null ? p(d) : ((u = p), Ze(n, d), Ze(t, d));
      }),
      a
    );
  }
});
var de = h((Lh, hs) => {
  'use strict';
  var {
    ObjectDefineProperties: Td,
    ObjectGetOwnPropertyDescriptor: ge,
    ObjectKeys: Pd,
    ObjectSetPrototypeOf: ds,
  } = v();
  hs.exports = se;
  var er = ut(),
    Z = Yn();
  ds(se.prototype, er.prototype);
  ds(se, er);
  {
    let e = Pd(Z.prototype);
    for (let t = 0; t < e.length; t++) {
      let n = e[t];
      se.prototype[n] || (se.prototype[n] = Z.prototype[n]);
    }
  }
  function se(e) {
    if (!(this instanceof se)) return new se(e);
    er.call(this, e),
      Z.call(this, e),
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
  Td(se.prototype, {
    writable: { __proto__: null, ...ge(Z.prototype, 'writable') },
    writableHighWaterMark: { __proto__: null, ...ge(Z.prototype, 'writableHighWaterMark') },
    writableObjectMode: { __proto__: null, ...ge(Z.prototype, 'writableObjectMode') },
    writableBuffer: { __proto__: null, ...ge(Z.prototype, 'writableBuffer') },
    writableLength: { __proto__: null, ...ge(Z.prototype, 'writableLength') },
    writableFinished: { __proto__: null, ...ge(Z.prototype, 'writableFinished') },
    writableCorked: { __proto__: null, ...ge(Z.prototype, 'writableCorked') },
    writableEnded: { __proto__: null, ...ge(Z.prototype, 'writableEnded') },
    writableNeedDrain: { __proto__: null, ...ge(Z.prototype, 'writableNeedDrain') },
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
  var Xn;
  function bs() {
    return Xn === void 0 && (Xn = {}), Xn;
  }
  se.fromWeb = function (e, t) {
    return bs().newStreamDuplexFromReadableWritablePair(e, t);
  };
  se.toWeb = function (e) {
    return bs().newReadableWritablePairFromDuplex(e);
  };
  var Qn;
  se.from = function (e) {
    return Qn || (Qn = cs()), Qn(e, 'body');
  };
});
var rr = h((Ch, ys) => {
  'use strict';
  var { ObjectSetPrototypeOf: ps, Symbol: Md } = v();
  ys.exports = _e;
  var { ERR_METHOD_NOT_IMPLEMENTED: Dd } = F().codes,
    nr = de(),
    { getHighWaterMark: jd } = Ct();
  ps(_e.prototype, nr.prototype);
  ps(_e, nr);
  var bt = Md('kCallback');
  function _e(e) {
    if (!(this instanceof _e)) return new _e(e);
    let t = e ? jd(this, e, 'readableHighWaterMark', !0) : null;
    t === 0 &&
      (e = {
        ...e,
        highWaterMark: null,
        readableHighWaterMark: t,
        writableHighWaterMark: e.writableHighWaterMark || 0,
      }),
      nr.call(this, e),
      (this._readableState.sync = !1),
      (this[bt] = null),
      e &&
        (typeof e.transform == 'function' && (this._transform = e.transform),
        typeof e.flush == 'function' && (this._flush = e.flush)),
      this.on('prefinish', xd);
  }
  function tr(e) {
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
  function xd() {
    this._final !== tr && tr.call(this);
  }
  _e.prototype._final = tr;
  _e.prototype._transform = function (e, t, n) {
    throw new Dd('_transform()');
  };
  _e.prototype._write = function (e, t, n) {
    let r = this._readableState,
      i = this._writableState,
      o = r.length;
    this._transform(e, t, (s, l) => {
      if (s) {
        n(s);
        return;
      }
      l != null && this.push(l), i.ended || o === r.length || r.length < r.highWaterMark ? n() : (this[bt] = n);
    });
  };
  _e.prototype._read = function () {
    if (this[bt]) {
      let e = this[bt];
      (this[bt] = null), e();
    }
  };
});
var or = h((kh, _s) => {
  'use strict';
  var { ObjectSetPrototypeOf: gs } = v();
  _s.exports = Xe;
  var ir = rr();
  gs(Xe.prototype, ir.prototype);
  gs(Xe, ir);
  function Xe(e) {
    if (!(this instanceof Xe)) return new Xe(e);
    ir.call(this, e);
  }
  Xe.prototype._transform = function (e, t, n) {
    n(null, e);
  };
});
var Kt = h((Wh, Rs) => {
  var ht = Me(),
    { ArrayIsArray: Id, Promise: vd, SymbolAsyncIterator: Nd } = v(),
    Gt = ye(),
    { once: qd } = ae(),
    Ld = qe(),
    ws = de(),
    {
      aggregateTwoErrors: Cd,
      codes: {
        ERR_INVALID_ARG_TYPE: br,
        ERR_INVALID_RETURN_VALUE: sr,
        ERR_MISSING_ARGS: kd,
        ERR_STREAM_DESTROYED: Wd,
        ERR_STREAM_PREMATURE_CLOSE: Fd,
      },
      AbortError: Bd,
    } = F(),
    { validateFunction: $d, validateAbortSignal: Jd } = lt(),
    {
      isIterable: We,
      isReadable: lr,
      isReadableNodeStream: Ht,
      isNodeStream: Ss,
      isTransformStream: Qe,
      isWebStream: Ud,
      isReadableStream: ar,
      isReadableEnded: Vd,
    } = fe(),
    Hd = globalThis.AbortController || Ot().AbortController,
    ur,
    fr;
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
  function Gd(e) {
    return $d(e[e.length - 1], 'streams[stream.length - 1]'), e.pop();
  }
  function cr(e) {
    if (We(e)) return e;
    if (Ht(e)) return Kd(e);
    throw new br('val', ['Readable', 'Iterable', 'AsyncIterable'], e);
  }
  async function* Kd(e) {
    fr || (fr = ut()), yield* fr.prototype[Nd].call(e);
  }
  async function Vt(e, t, n, { end: r }) {
    let i,
      o = null,
      s = (a) => {
        if ((a && (i = a), o)) {
          let c = o;
          (o = null), c();
        }
      },
      l = () =>
        new vd((a, c) => {
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
      n(i !== a ? Cd(i, a) : a);
    } finally {
      u(), t.off('drain', s);
    }
  }
  async function dr(e, t, n, { end: r }) {
    Qe(t) && (t = t.writable);
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
    return As(e, qd(Gd(e)));
  }
  function As(e, t, n) {
    if ((e.length === 1 && Id(e[0]) && (e = e[0]), e.length < 2)) throw new kd('streams');
    let r = new Hd(),
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
        o?.removeEventListener('abort', l), r.abort(), y && (u || s.forEach((C) => C()), ht.nextTick(t, u, a));
      }
    }
    let f;
    for (let S = 0; S < e.length; S++) {
      let y = e[S],
        C = S < e.length - 1,
        k = S > 0,
        $ = C || n?.end !== !1,
        Je = S === e.length - 1;
      if (Ss(y)) {
        let J = function (he) {
          he && he.name !== 'AbortError' && he.code !== 'ERR_STREAM_PREMATURE_CLOSE' && p(he);
        };
        var R = J;
        if ($) {
          let { destroy: he, cleanup: Qt } = Es(y, C, k);
          c.push(he), lr(y) && Je && s.push(Qt);
        }
        y.on('error', J),
          lr(y) &&
            Je &&
            s.push(() => {
              y.removeListener('error', J);
            });
      }
      if (S === 0)
        if (typeof y == 'function') {
          if (((f = y({ signal: i })), !We(f))) throw new sr('Iterable, AsyncIterable or Stream', 'source', f);
        } else We(y) || Ht(y) || Qe(y) ? (f = y) : (f = ws.from(y));
      else if (typeof y == 'function') {
        if (Qe(f)) {
          var x;
          f = cr((x = f) === null || x === void 0 ? void 0 : x.readable);
        } else f = cr(f);
        if (((f = y(f, { signal: i })), C)) {
          if (!We(f, !0)) throw new sr('AsyncIterable', `transform[${S - 1}]`, f);
        } else {
          var P;
          ur || (ur = or());
          let J = new ur({ objectMode: !0 }),
            he = (P = f) === null || P === void 0 ? void 0 : P.then;
          if (typeof he == 'function')
            d++,
              he.call(
                f,
                (Se) => {
                  (a = Se), Se != null && J.write(Se), $ && J.end(), ht.nextTick(p);
                },
                (Se) => {
                  J.destroy(Se), ht.nextTick(p, Se);
                }
              );
          else if (We(f, !0)) d++, Vt(f, J, p, { end: $ });
          else if (ar(f) || Qe(f)) {
            let Se = f.readable || f;
            d++, Vt(Se, J, p, { end: $ });
          } else throw new sr('AsyncIterable or Promise', 'destination', f);
          f = J;
          let { destroy: Qt, cleanup: el } = Es(f, !1, !0);
          c.push(Qt), Je && s.push(el);
        }
      } else if (Ss(y)) {
        if (Ht(f)) {
          d += 2;
          let J = Yd(f, y, p, { end: $ });
          lr(y) && Je && s.push(J);
        } else if (Qe(f) || ar(f)) {
          let J = f.readable || f;
          d++, Vt(J, y, p, { end: $ });
        } else if (We(f)) d++, Vt(f, y, p, { end: $ });
        else throw new br('val', ['Readable', 'Iterable', 'AsyncIterable', 'ReadableStream', 'TransformStream'], f);
        f = y;
      } else if (Ud(y)) {
        if (Ht(f)) d++, dr(cr(f), y, p, { end: $ });
        else if (ar(f) || We(f)) d++, dr(f, y, p, { end: $ });
        else if (Qe(f)) d++, dr(f.readable, y, p, { end: $ });
        else throw new br('val', ['Readable', 'Iterable', 'AsyncIterable', 'ReadableStream', 'TransformStream'], f);
        f = y;
      } else f = ws.from(y);
    }
    return ((i != null && i.aborted) || (o != null && o.aborted)) && ht.nextTick(l), f;
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
      Vd(e) ? ht.nextTick(s) : e.once('end', s);
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
var pr = h((Fh, Ds) => {
  'use strict';
  var { pipeline: Zd } = Kt(),
    zt = de(),
    { destroyer: Xd } = qe(),
    {
      isNodeStream: Yt,
      isReadable: ms,
      isWritable: Os,
      isWebStream: hr,
      isTransformStream: Fe,
      isWritableStream: Ts,
      isReadableStream: Ps,
    } = fe(),
    {
      AbortError: Qd,
      codes: { ERR_INVALID_ARG_VALUE: Ms, ERR_MISSING_ARGS: eb },
    } = F(),
    tb = ye();
  Ds.exports = function (...t) {
    if (t.length === 0) throw new eb('streams');
    if (t.length === 1) return zt.from(t[0]);
    let n = [...t];
    if ((typeof t[0] == 'function' && (t[0] = zt.from(t[0])), typeof t[t.length - 1] == 'function')) {
      let b = t.length - 1;
      t[b] = zt.from(t[b]);
    }
    for (let b = 0; b < t.length; ++b)
      if (!(!Yt(t[b]) && !hr(t[b]))) {
        if (b < t.length - 1 && !(ms(t[b]) || Ps(t[b]) || Fe(t[b])))
          throw new Ms(`streams[${b}]`, n[b], 'must be readable');
        if (b > 0 && !(Os(t[b]) || Ts(t[b]) || Fe(t[b]))) throw new Ms(`streams[${b}]`, n[b], 'must be writable');
      }
    let r, i, o, s, l;
    function u(b) {
      let f = s;
      (s = null), f ? f(b) : b ? l.destroy(b) : !p && !d && l.destroy();
    }
    let a = t[0],
      c = Zd(t, u),
      d = !!(Os(a) || Ts(a) || Fe(a)),
      p = !!(ms(c) || Ps(c) || Fe(c));
    if (
      ((l = new zt({
        writableObjectMode: !!(a != null && a.writableObjectMode),
        readableObjectMode: !!(c != null && c.writableObjectMode),
        writable: d,
        readable: p,
      })),
      d)
    ) {
      if (Yt(a))
        (l._write = function (f, x, P) {
          a.write(f, x) ? P() : (r = P);
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
      else if (hr(a)) {
        let x = (Fe(a) ? a.writable : a).getWriter();
        (l._write = async function (P, R, S) {
          try {
            await x.ready, x.write(P).catch(() => {}), S();
          } catch (y) {
            S(y);
          }
        }),
          (l._final = async function (P) {
            try {
              await x.ready, x.close().catch(() => {}), (i = P);
            } catch (R) {
              P(R);
            }
          });
      }
      let b = Fe(c) ? c.readable : c;
      tb(b, () => {
        if (i) {
          let f = i;
          (i = null), f();
        }
      });
    }
    if (p) {
      if (Yt(c))
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
      else if (hr(c)) {
        let f = (Fe(c) ? c.readable : c).getReader();
        l._read = async function () {
          for (;;)
            try {
              let { value: x, done: P } = await f.read();
              if (!l.push(x)) return;
              if (P) {
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
          s === null ? f(b) : ((s = f), Yt(c) && Xd(c, b));
      }),
      l
    );
  };
});
var Cs = h((Bh, _r) => {
  'use strict';
  var vs = globalThis.AbortController || Ot().AbortController,
    {
      codes: { ERR_INVALID_ARG_VALUE: nb, ERR_INVALID_ARG_TYPE: pt, ERR_MISSING_ARGS: rb, ERR_OUT_OF_RANGE: ib },
      AbortError: be,
    } = F(),
    { validateAbortSignal: Be, validateInteger: ob, validateObject: $e } = lt(),
    sb = v().Symbol('kWeak'),
    { finished: lb } = ye(),
    ab = pr(),
    { addAbortSignalNoValidate: ub } = at(),
    { isWritable: fb, isNodeStream: cb } = fe(),
    {
      ArrayPrototypePush: db,
      MathFloor: bb,
      Number: hb,
      NumberIsNaN: pb,
      Promise: js,
      PromiseReject: xs,
      PromisePrototypeThen: yb,
      Symbol: Ns,
    } = v(),
    Zt = Ns('kEmpty'),
    Is = Ns('kEof');
  function gb(e, t) {
    if ((t != null && $e(t, 'options'), t?.signal != null && Be(t.signal, 'options.signal'), cb(e) && !fb(e)))
      throw new nb('stream', e, 'must be writable');
    let n = ab(this, e);
    return t != null && t.signal && ub(t.signal, n), n;
  }
  function Xt(e, t) {
    if (typeof e != 'function') throw new pt('fn', ['Function', 'AsyncFunction'], e);
    t != null && $e(t, 'options'), t?.signal != null && Be(t.signal, 'options.signal');
    let n = 1;
    return (
      t?.concurrency != null && (n = bb(t.concurrency)),
      ob(n, 'concurrency', 1),
      async function* () {
        var i, o;
        let s = new vs(),
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
        function x() {
          f = !0;
        }
        async function P() {
          try {
            for await (let y of l) {
              var R;
              if (f) return;
              if (a.aborted) throw new be();
              try {
                y = e(y, c);
              } catch (C) {
                y = xs(C);
              }
              y !== Zt &&
                (typeof ((R = y) === null || R === void 0 ? void 0 : R.catch) == 'function' && y.catch(x),
                u.push(y),
                p && (p(), (p = null)),
                !f &&
                  u.length &&
                  u.length >= n &&
                  (await new js((C) => {
                    b = C;
                  })));
            }
            u.push(Is);
          } catch (y) {
            let C = xs(y);
            yb(C, void 0, x), u.push(C);
          } finally {
            var S;
            (f = !0),
              p && (p(), (p = null)),
              t == null || (S = t.signal) === null || S === void 0 || S.removeEventListener('abort', d);
          }
        }
        P();
        try {
          for (;;) {
            for (; u.length > 0; ) {
              let R = await u[0];
              if (R === Is) return;
              if (a.aborted) throw new be();
              R !== Zt && (yield R), u.shift(), b && (b(), (b = null));
            }
            await new js((R) => {
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
      e != null && $e(e, 'options'),
      e?.signal != null && Be(e.signal, 'options.signal'),
      async function* () {
        let n = 0;
        for await (let i of this) {
          var r;
          if (e != null && (r = e.signal) !== null && r !== void 0 && r.aborted)
            throw new be({ cause: e.signal.reason });
          yield [n++, i];
        }
      }.call(this)
    );
  }
  async function qs(e, t = void 0) {
    for await (let n of gr.call(this, e, t)) return !0;
    return !1;
  }
  async function wb(e, t = void 0) {
    if (typeof e != 'function') throw new pt('fn', ['Function', 'AsyncFunction'], e);
    return !(await qs.call(this, async (...n) => !(await e(...n)), t));
  }
  async function Sb(e, t) {
    for await (let n of gr.call(this, e, t)) return n;
  }
  async function Eb(e, t) {
    if (typeof e != 'function') throw new pt('fn', ['Function', 'AsyncFunction'], e);
    async function n(r, i) {
      return await e(r, i), Zt;
    }
    for await (let r of Xt.call(this, n, t));
  }
  function gr(e, t) {
    if (typeof e != 'function') throw new pt('fn', ['Function', 'AsyncFunction'], e);
    async function n(r, i) {
      return (await e(r, i)) ? r : Zt;
    }
    return Xt.call(this, n, t);
  }
  var yr = class extends rb {
    constructor() {
      super('reduce'), (this.message = 'Reduce of an empty stream requires an initial value');
    }
  };
  async function Ab(e, t, n) {
    var r;
    if (typeof e != 'function') throw new pt('reducer', ['Function', 'AsyncFunction'], e);
    n != null && $e(n, 'options'), n?.signal != null && Be(n.signal, 'options.signal');
    let i = arguments.length > 1;
    if (n != null && (r = n.signal) !== null && r !== void 0 && r.aborted) {
      let a = new be(void 0, { cause: n.signal.reason });
      throw (this.once('error', () => {}), await lb(this.destroy(a)), a);
    }
    let o = new vs(),
      s = o.signal;
    if (n != null && n.signal) {
      let a = { once: !0, [sb]: this };
      n.signal.addEventListener('abort', () => o.abort(), a);
    }
    let l = !1;
    try {
      for await (let a of this) {
        var u;
        if (((l = !0), n != null && (u = n.signal) !== null && u !== void 0 && u.aborted)) throw new be();
        i ? (t = await e(t, a, { signal: s })) : ((t = a), (i = !0));
      }
      if (!l && !i) throw new yr();
    } finally {
      o.abort();
    }
    return t;
  }
  async function Rb(e) {
    e != null && $e(e, 'options'), e?.signal != null && Be(e.signal, 'options.signal');
    let t = [];
    for await (let r of this) {
      var n;
      if (e != null && (n = e.signal) !== null && n !== void 0 && n.aborted)
        throw new be(void 0, { cause: e.signal.reason });
      db(t, r);
    }
    return t;
  }
  function mb(e, t) {
    let n = Xt.call(this, e, t);
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
      t != null && $e(t, 'options'),
      t?.signal != null && Be(t.signal, 'options.signal'),
      (e = Ls(e)),
      async function* () {
        var r;
        if (t != null && (r = t.signal) !== null && r !== void 0 && r.aborted) throw new be();
        for await (let o of this) {
          var i;
          if (t != null && (i = t.signal) !== null && i !== void 0 && i.aborted) throw new be();
          e-- <= 0 && (yield o);
        }
      }.call(this)
    );
  }
  function Tb(e, t = void 0) {
    return (
      t != null && $e(t, 'options'),
      t?.signal != null && Be(t.signal, 'options.signal'),
      (e = Ls(e)),
      async function* () {
        var r;
        if (t != null && (r = t.signal) !== null && r !== void 0 && r.aborted) throw new be();
        for await (let o of this) {
          var i;
          if (t != null && (i = t.signal) !== null && i !== void 0 && i.aborted) throw new be();
          if (e-- > 0) yield o;
          else return;
        }
      }.call(this)
    );
  }
  _r.exports.streamReturningOperators = {
    asIndexedPairs: _b,
    drop: Ob,
    filter: gr,
    flatMap: mb,
    map: Xt,
    take: Tb,
    compose: gb,
  };
  _r.exports.promiseReturningOperators = { every: wb, forEach: Eb, reduce: Ab, toArray: Rb, some: qs, find: Sb };
});
var wr = h(($h, ks) => {
  'use strict';
  var { ArrayPrototypePop: Pb, Promise: Mb } = v(),
    { isIterable: Db, isNodeStream: jb, isWebStream: xb } = fe(),
    { pipelineImpl: Ib } = Kt(),
    { finished: vb } = ye();
  require('stream');
  function Nb(...e) {
    return new Mb((t, n) => {
      let r,
        i,
        o = e[e.length - 1];
      if (o && typeof o == 'object' && !jb(o) && !Db(o) && !xb(o)) {
        let s = Pb(e);
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
  ks.exports = { finished: vb, pipeline: Nb };
});
var Ks = h((Jh, Gs) => {
  var { Buffer: qb } = require('buffer'),
    { ObjectDefineProperty: we, ObjectKeys: Bs, ReflectApply: $s } = v(),
    {
      promisify: { custom: Js },
    } = ae(),
    { streamReturningOperators: Ws, promiseReturningOperators: Fs } = Cs(),
    {
      codes: { ERR_ILLEGAL_CONSTRUCTOR: Us },
    } = F(),
    Lb = pr(),
    { pipeline: Vs } = Kt(),
    { destroyer: Cb } = qe(),
    Hs = ye(),
    Sr = wr(),
    Er = fe(),
    I = (Gs.exports = Nt().Stream);
  I.isDisturbed = Er.isDisturbed;
  I.isErrored = Er.isErrored;
  I.isReadable = Er.isReadable;
  I.Readable = ut();
  for (let e of Bs(Ws)) {
    let n = function (...r) {
      if (new.target) throw Us();
      return I.Readable.from($s(t, this, r));
    };
    Ar = n;
    let t = Ws[e];
    we(n, 'name', { __proto__: null, value: t.name }),
      we(n, 'length', { __proto__: null, value: t.length }),
      we(I.Readable.prototype, e, { __proto__: null, value: n, enumerable: !1, configurable: !0, writable: !0 });
  }
  var Ar;
  for (let e of Bs(Fs)) {
    let n = function (...i) {
      if (new.target) throw Us();
      return $s(t, this, i);
    };
    Ar = n;
    let t = Fs[e];
    we(n, 'name', { __proto__: null, value: t.name }),
      we(n, 'length', { __proto__: null, value: t.length }),
      we(I.Readable.prototype, e, { __proto__: null, value: n, enumerable: !1, configurable: !0, writable: !0 });
  }
  var Ar;
  I.Writable = Yn();
  I.Duplex = de();
  I.Transform = rr();
  I.PassThrough = or();
  I.pipeline = Vs;
  var { addAbortSignal: kb } = at();
  I.addAbortSignal = kb;
  I.finished = Hs;
  I.destroy = Cb;
  I.compose = Lb;
  we(I, 'promises', {
    __proto__: null,
    configurable: !0,
    enumerable: !0,
    get() {
      return Sr;
    },
  });
  we(Vs, Js, {
    __proto__: null,
    enumerable: !0,
    get() {
      return Sr.pipeline;
    },
  });
  we(Hs, Js, {
    __proto__: null,
    enumerable: !0,
    get() {
      return Sr.finished;
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
  var q = require('stream');
  if (q && process.env.READABLE_STREAM === 'disable') {
    let e = q.promises;
    (_.exports._uint8ArrayToBuffer = q._uint8ArrayToBuffer),
      (_.exports._isUint8Array = q._isUint8Array),
      (_.exports.isDisturbed = q.isDisturbed),
      (_.exports.isErrored = q.isErrored),
      (_.exports.isReadable = q.isReadable),
      (_.exports.Readable = q.Readable),
      (_.exports.Writable = q.Writable),
      (_.exports.Duplex = q.Duplex),
      (_.exports.Transform = q.Transform),
      (_.exports.PassThrough = q.PassThrough),
      (_.exports.addAbortSignal = q.addAbortSignal),
      (_.exports.finished = q.finished),
      (_.exports.destroy = q.destroy),
      (_.exports.pipeline = q.pipeline),
      (_.exports.compose = q.compose),
      Object.defineProperty(q, 'promises', {
        configurable: !0,
        enumerable: !0,
        get() {
          return e;
        },
      }),
      (_.exports.Stream = q.Stream);
  } else {
    let e = Ks(),
      t = wr(),
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
Object.defineProperty(exports, '__esModule', { value: !0 });
var Qs = require('node:stream'),
  $b = Rr(),
  Jb = ni(),
  Ub = Xs();
function Vb() {
  return Ub(
    (e) => {
      let t = new Qs.Transform({
        objectMode: !0,
        transform(n, r, i) {
          if (Hb(n)) {
            let o = (0, $b.unwrapArray)((0, Jb.filterSecrets)([n])),
              s = JSON.stringify(o);
            this.push(
              s.concat(`
`)
            );
          }
          i();
        },
      });
      return (0, Qs.pipeline)(e, t, () => {}), t;
    },
    { enablePipelining: !0 }
  );
}
exports.default = Vb;
var Hb = (e) =>
  !!(
    !process.env.DEBUG ||
    process.env.DEBUG === '*' ||
    typeof e.name != 'string' ||
    new RegExp(process.env.DEBUG.replace(/\*/g, '.*')).test(e.name)
  );
