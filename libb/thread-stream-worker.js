'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) =>
  function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

// node_modules/real-require/src/index.js
var require_src = __commonJS({
  'node_modules/real-require/src/index.js'(exports2, module2) {
    var realImport2 = new Function('modulePath', 'return import(modulePath)');
    function realRequire2(modulePath) {
      if (typeof __non_webpack__require__ === 'function') {
        return __non_webpack__require__(modulePath);
      }
      return require(modulePath);
    }
    module2.exports = { realImport: realImport2, realRequire: realRequire2 };
  },
});

// node_modules/thread-stream/lib/indexes.js
var require_indexes = __commonJS({
  'node_modules/thread-stream/lib/indexes.js'(exports2, module2) {
    'use strict';
    var WRITE_INDEX2 = 4;
    var READ_INDEX2 = 8;
    module2.exports = {
      WRITE_INDEX: WRITE_INDEX2,
      READ_INDEX: READ_INDEX2,
    };
  },
});

// node_modules/thread-stream/lib/wait.js
var require_wait = __commonJS({
  'node_modules/thread-stream/lib/wait.js'(exports2, module2) {
    'use strict';
    var MAX_TIMEOUT = 1e3;
    function wait(state2, index, expected, timeout, done) {
      const max = Date.now() + timeout;
      let current = Atomics.load(state2, index);
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
            current = Atomics.load(state2, index);
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
    function waitDiff2(state2, index, expected, timeout, done) {
      const max = Date.now() + timeout;
      let current = Atomics.load(state2, index);
      if (current !== expected) {
        done(null, 'ok');
        return;
      }
      const check = (backoff) => {
        if (Date.now() > max) {
          done(null, 'timed-out');
        } else {
          setTimeout(() => {
            current = Atomics.load(state2, index);
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
    module2.exports = { wait, waitDiff: waitDiff2 };
  },
});

// node_modules/thread-stream/lib/worker.js
var { realImport, realRequire } = require_src();
var { workerData, parentPort } = require('worker_threads');
var { WRITE_INDEX, READ_INDEX } = require_indexes();
var { waitDiff } = require_wait();
var { dataBuf, filename, stateBuf } = workerData;
var destination;
var state = new Int32Array(stateBuf);
var data = Buffer.from(dataBuf);
async function start() {
  let worker;
  try {
    if (filename.endsWith('.ts') || filename.endsWith('.cts')) {
      if (!process[Symbol.for('ts-node.register.instance')]) {
        realRequire('ts-node/register');
      } else if (process.env.TS_NODE_DEV) {
        realRequire('ts-node-dev');
      }
      worker = realRequire(
        decodeURIComponent(filename.replace(process.platform === 'win32' ? 'file:///' : 'file://', ''))
      );
    } else {
      worker = await realImport(filename);
    }
  } catch (error) {
    if ((error.code === 'ENOTDIR' || error.code === 'ERR_MODULE_NOT_FOUND') && filename.startsWith('file://')) {
      worker = realRequire(decodeURIComponent(filename.replace('file://', '')));
    } else if (error.code === void 0) {
      worker = realRequire(
        decodeURIComponent(filename.replace(process.platform === 'win32' ? 'file:///' : 'file://', ''))
      );
    } else {
      throw error;
    }
  }
  if (typeof worker === 'object') worker = worker.default;
  if (typeof worker === 'object') worker = worker.default;
  destination = await worker(workerData.workerData);
  destination.on('error', function (err) {
    Atomics.store(state, WRITE_INDEX, -2);
    Atomics.notify(state, WRITE_INDEX);
    Atomics.store(state, READ_INDEX, -2);
    Atomics.notify(state, READ_INDEX);
    parentPort.postMessage({
      code: 'ERROR',
      err,
    });
  });
  destination.on('close', function () {
    const end = Atomics.load(state, WRITE_INDEX);
    Atomics.store(state, READ_INDEX, end);
    Atomics.notify(state, READ_INDEX);
    setImmediate(() => {
      process.exit(0);
    });
  });
}
start().then(function () {
  parentPort.postMessage({
    code: 'READY',
  });
  process.nextTick(run);
});
function run() {
  const current = Atomics.load(state, READ_INDEX);
  const end = Atomics.load(state, WRITE_INDEX);
  if (end === current) {
    if (end === data.length) {
      waitDiff(state, READ_INDEX, end, Infinity, run);
    } else {
      waitDiff(state, WRITE_INDEX, end, Infinity, run);
    }
    return;
  }
  if (end === -1) {
    destination.end();
    return;
  }
  const toWrite = data.toString('utf8', current, end);
  const res = destination.write(toWrite);
  if (res) {
    Atomics.store(state, READ_INDEX, end);
    Atomics.notify(state, READ_INDEX);
    setImmediate(run);
  } else {
    destination.once('drain', function () {
      Atomics.store(state, READ_INDEX, end);
      Atomics.notify(state, READ_INDEX);
      run();
    });
  }
}
process.on('unhandledRejection', function (err) {
  parentPort.postMessage({
    code: 'ERROR',
    err,
  });
  process.exit(1);
});
process.on('uncaughtException', function (err) {
  parentPort.postMessage({
    code: 'ERROR',
    err,
  });
  process.exit(1);
});
