'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) =>
  function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

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

// node_modules/pino/lib/worker-pipeline.js
var EE = require('events');
var loadTransportStreamBuilder = require_transport_stream();
var { pipeline, PassThrough } = require('stream');
module.exports = async function ({ targets }) {
  const streams = await Promise.all(
    targets.map(async (t) => {
      const fn = await loadTransportStreamBuilder(t.target);
      const stream2 = await fn(t.options);
      return stream2;
    })
  );
  const ee = new EE();
  const stream = new PassThrough({
    autoDestroy: true,
    destroy(_, cb) {
      ee.on('error', cb);
      ee.on('closed', cb);
    },
  });
  pipeline(stream, ...streams, function (err) {
    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      ee.emit('error', err);
      return;
    }
    ee.emit('closed');
  });
  return stream;
};
