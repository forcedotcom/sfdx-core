'use strict';
var c = (t, e) => () => (e || t((e = { exports: {} }).exports, e), e.exports);
var u = c((T, a) => {
  var p = new Function('modulePath', 'return import(modulePath)');
  function l(t) {
    return typeof __non_webpack__require__ == 'function' ? __non_webpack__require__(t) : require(t);
  }
  a.exports = { realImport: p, realRequire: l };
});
var d = c((D, f) => {
  'use strict';
  var { realImport: _, realRequire: n } = u();
  f.exports = m;
  async function m(t) {
    let e;
    try {
      let r = 'file://' + t;
      r.endsWith('.ts') || r.endsWith('.cts')
        ? (process[Symbol.for('ts-node.register.instance')]
            ? n('ts-node/register')
            : process.env && process.env.TS_NODE_DEV && n('ts-node-dev'),
          (e = n(decodeURIComponent(t))))
        : (e = await _(r));
    } catch (r) {
      if (r.code === 'ENOTDIR' || r.code === 'ERR_MODULE_NOT_FOUND') e = n(t);
      else if (r.code === void 0) e = n(decodeURIComponent(t));
      else throw r;
    }
    if ((typeof e == 'object' && (e = e.default), typeof e == 'object' && (e = e.default), typeof e != 'function'))
      throw Error('exported worker is not a function');
    return e;
  }
});
var E = require('events'),
  w = d(),
  { pipeline: R, PassThrough: y } = require('stream');
module.exports = async function ({ targets: t }) {
  let e = await Promise.all(t.map(async (o) => await (await w(o.target))(o.options))),
    r = new E(),
    i = new y({
      autoDestroy: !0,
      destroy(o, s) {
        r.on('error', s), r.on('closed', s);
      },
    });
  return (
    R(i, ...e, function (o) {
      if (o && o.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
        r.emit('error', o);
        return;
      }
      r.emit('closed');
    }),
    i
  );
};
