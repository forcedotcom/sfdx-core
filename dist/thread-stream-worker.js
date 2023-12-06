'use strict';
var I = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
var D = I((C, R) => {
  var q = new Function('modulePath', 'return import(modulePath)');
  function N(e) {
    return typeof __non_webpack__require__ == 'function' ? __non_webpack__require__(e) : require(e);
  }
  R.exports = { realImport: q, realRequire: N };
});
var T = I((S, w) => {
  'use strict';
  w.exports = { WRITE_INDEX: 4, READ_INDEX: 8 };
});
var y = I((v, M) => {
  'use strict';
  function U(e, t, r, p, i) {
    let A = Date.now() + p,
      n = Atomics.load(e, t);
    if (n === r) {
      i(null, 'ok');
      return;
    }
    let a = n,
      l = (E) => {
        Date.now() > A
          ? i(null, 'timed-out')
          : setTimeout(() => {
              (a = n),
                (n = Atomics.load(e, t)),
                n === a ? l(E >= 1e3 ? 1e3 : E * 2) : n === r ? i(null, 'ok') : i(null, 'not-equal');
            }, E);
      };
    l(1);
  }
  function g(e, t, r, p, i) {
    let A = Date.now() + p,
      n = Atomics.load(e, t);
    if (n !== r) {
      i(null, 'ok');
      return;
    }
    let a = (l) => {
      Date.now() > A
        ? i(null, 'timed-out')
        : setTimeout(() => {
            (n = Atomics.load(e, t)), n !== r ? i(null, 'ok') : a(l >= 1e3 ? 1e3 : l * 2);
          }, l);
    };
    a(1);
  }
  M.exports = { wait: U, waitDiff: g };
});
var { realImport: k, realRequire: f } = D(),
  { workerData: X, parentPort: _ } = require('worker_threads'),
  { WRITE_INDEX: d, READ_INDEX: s } = T(),
  { waitDiff: O } = y(),
  { dataBuf: W, filename: c, stateBuf: x } = X,
  u,
  o = new Int32Array(x),
  h = Buffer.from(W);
async function j() {
  let e;
  try {
    c.endsWith('.ts') || c.endsWith('.cts')
      ? (process[Symbol.for('ts-node.register.instance')]
          ? process.env.TS_NODE_DEV && f('ts-node-dev')
          : f('ts-node/register'),
        (e = f(decodeURIComponent(c.replace(process.platform === 'win32' ? 'file:///' : 'file://', '')))))
      : (e = await k(c));
  } catch (t) {
    if ((t.code === 'ENOTDIR' || t.code === 'ERR_MODULE_NOT_FOUND') && c.startsWith('file://'))
      e = f(decodeURIComponent(c.replace('file://', '')));
    else if (t.code === void 0)
      e = f(decodeURIComponent(c.replace(process.platform === 'win32' ? 'file:///' : 'file://', '')));
    else throw t;
  }
  typeof e == 'object' && (e = e.default),
    typeof e == 'object' && (e = e.default),
    (u = await e(X.workerData)),
    u.on('error', function (t) {
      Atomics.store(o, d, -2),
        Atomics.notify(o, d),
        Atomics.store(o, s, -2),
        Atomics.notify(o, s),
        _.postMessage({ code: 'ERROR', err: t });
    }),
    u.on('close', function () {
      let t = Atomics.load(o, d);
      Atomics.store(o, s, t),
        Atomics.notify(o, s),
        setImmediate(() => {
          process.exit(0);
        });
    });
}
j().then(function () {
  _.postMessage({ code: 'READY' }), process.nextTick(m);
});
function m() {
  let e = Atomics.load(o, s),
    t = Atomics.load(o, d);
  if (t === e) {
    t === h.length ? O(o, s, t, 1 / 0, m) : O(o, d, t, 1 / 0, m);
    return;
  }
  if (t === -1) {
    u.end();
    return;
  }
  let r = h.toString('utf8', e, t);
  u.write(r)
    ? (Atomics.store(o, s, t), Atomics.notify(o, s), setImmediate(m))
    : u.once('drain', function () {
        Atomics.store(o, s, t), Atomics.notify(o, s), m();
      });
}
process.on('unhandledRejection', function (e) {
  _.postMessage({ code: 'ERROR', err: e }), process.exit(1);
});
process.on('uncaughtException', function (e) {
  _.postMessage({ code: 'ERROR', err: e }), process.exit(1);
});
