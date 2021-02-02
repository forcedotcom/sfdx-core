'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('../index-aea73a28.js');
var crypto = require('crypto');
var _commonjsHelpers = require('../_commonjsHelpers-49936489.js');
var fs$1 = require('fs');
var constants = require('constants');
var Stream$1 = require('stream');
var util = require('util');
var assert = require('assert');
var path = require('path');
var sfdxError = require('../sfdxError.js');
require('../index-ffe6ca9f.js');
require('../messages.js');
require('os');

function _interopDefaultLegacy(e) {
  return e && typeof e === 'object' && 'default' in e ? e : { default: e };
}

var fs__default = /*#__PURE__*/ _interopDefaultLegacy(fs$1);
var constants__default = /*#__PURE__*/ _interopDefaultLegacy(constants);
var Stream__default = /*#__PURE__*/ _interopDefaultLegacy(Stream$1);
var util__default = /*#__PURE__*/ _interopDefaultLegacy(util);
var assert__default = /*#__PURE__*/ _interopDefaultLegacy(assert);
var path__default = /*#__PURE__*/ _interopDefaultLegacy(path);

var origCwd = process.cwd;
var cwd = null;

var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;

process.cwd = function() {
  if (!cwd) cwd = origCwd.call(process);
  return cwd;
};
try {
  process.cwd();
} catch (er) {}

var chdir = process.chdir;
process.chdir = function(d) {
  cwd = null;
  chdir.call(process, d);
};

var polyfills = patch;

function patch(fs) {
  // (re-)implement some things that are known busted or missing.

  // lchmod, broken prior to 0.6.2
  // back-port the fix here.
  if (constants__default['default'].hasOwnProperty('O_SYMLINK') && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
    patchLchmod(fs);
  }

  // lutimes implementation, or no-op
  if (!fs.lutimes) {
    patchLutimes(fs);
  }

  // https://github.com/isaacs/node-graceful-fs/issues/4
  // Chown should not fail on einval or eperm if non-root.
  // It should not fail on enosys ever, as this just indicates
  // that a fs doesn't support the intended operation.

  fs.chown = chownFix(fs.chown);
  fs.fchown = chownFix(fs.fchown);
  fs.lchown = chownFix(fs.lchown);

  fs.chmod = chmodFix(fs.chmod);
  fs.fchmod = chmodFix(fs.fchmod);
  fs.lchmod = chmodFix(fs.lchmod);

  fs.chownSync = chownFixSync(fs.chownSync);
  fs.fchownSync = chownFixSync(fs.fchownSync);
  fs.lchownSync = chownFixSync(fs.lchownSync);

  fs.chmodSync = chmodFixSync(fs.chmodSync);
  fs.fchmodSync = chmodFixSync(fs.fchmodSync);
  fs.lchmodSync = chmodFixSync(fs.lchmodSync);

  fs.stat = statFix(fs.stat);
  fs.fstat = statFix(fs.fstat);
  fs.lstat = statFix(fs.lstat);

  fs.statSync = statFixSync(fs.statSync);
  fs.fstatSync = statFixSync(fs.fstatSync);
  fs.lstatSync = statFixSync(fs.lstatSync);

  // if lchmod/lchown do not exist, then make them no-ops
  if (!fs.lchmod) {
    fs.lchmod = function(path, mode, cb) {
      if (cb) process.nextTick(cb);
    };
    fs.lchmodSync = function() {};
  }
  if (!fs.lchown) {
    fs.lchown = function(path, uid, gid, cb) {
      if (cb) process.nextTick(cb);
    };
    fs.lchownSync = function() {};
  }

  // on Windows, A/V software can lock the directory, causing this
  // to fail with an EACCES or EPERM if the directory contains newly
  // created files.  Try again on failure, for up to 60 seconds.

  // Set the timeout this long because some Windows Anti-Virus, such as Parity
  // bit9, may lock files for up to a minute, causing npm package install
  // failures. Also, take care to yield the scheduler. Windows scheduling gives
  // CPU to a busy looping process, which can cause the program causing the lock
  // contention to be starved of CPU by node, so the contention doesn't resolve.
  if (platform === 'win32') {
    fs.rename = (function(fs$rename) {
      return function(from, to, cb) {
        var start = Date.now();
        var backoff = 0;
        fs$rename(from, to, function CB(er) {
          if (er && (er.code === 'EACCES' || er.code === 'EPERM') && Date.now() - start < 60000) {
            setTimeout(function() {
              fs.stat(to, function(stater, st) {
                if (stater && stater.code === 'ENOENT') fs$rename(from, to, CB);
                else cb(er);
              });
            }, backoff);
            if (backoff < 100) backoff += 10;
            return;
          }
          if (cb) cb(er);
        });
      };
    })(fs.rename);
  }

  // if read() returns EAGAIN, then just try it again.
  fs.read = (function(fs$read) {
    function read(fd, buffer, offset, length, position, callback_) {
      var callback;
      if (callback_ && typeof callback_ === 'function') {
        var eagCounter = 0;
        callback = function(er, _, __) {
          if (er && er.code === 'EAGAIN' && eagCounter < 10) {
            eagCounter++;
            return fs$read.call(fs, fd, buffer, offset, length, position, callback);
          }
          callback_.apply(this, arguments);
        };
      }
      return fs$read.call(fs, fd, buffer, offset, length, position, callback);
    }

    // This ensures `util.promisify` works as it does for native `fs.read`.
    read.__proto__ = fs$read;
    return read;
  })(fs.read);

  fs.readSync = (function(fs$readSync) {
    return function(fd, buffer, offset, length, position) {
      var eagCounter = 0;
      while (true) {
        try {
          return fs$readSync.call(fs, fd, buffer, offset, length, position);
        } catch (er) {
          if (er.code === 'EAGAIN' && eagCounter < 10) {
            eagCounter++;
            continue;
          }
          throw er;
        }
      }
    };
  })(fs.readSync);

  function patchLchmod(fs) {
    fs.lchmod = function(path, mode, callback) {
      fs.open(path, constants__default['default'].O_WRONLY | constants__default['default'].O_SYMLINK, mode, function(
        err,
        fd
      ) {
        if (err) {
          if (callback) callback(err);
          return;
        }
        // prefer to return the chmod error, if one occurs,
        // but still try to close, and report closing errors if they occur.
        fs.fchmod(fd, mode, function(err) {
          fs.close(fd, function(err2) {
            if (callback) callback(err || err2);
          });
        });
      });
    };

    fs.lchmodSync = function(path, mode) {
      var fd = fs.openSync(
        path,
        constants__default['default'].O_WRONLY | constants__default['default'].O_SYMLINK,
        mode
      );

      // prefer to return the chmod error, if one occurs,
      // but still try to close, and report closing errors if they occur.
      var threw = true;
      var ret;
      try {
        ret = fs.fchmodSync(fd, mode);
        threw = false;
      } finally {
        if (threw) {
          try {
            fs.closeSync(fd);
          } catch (er) {}
        } else {
          fs.closeSync(fd);
        }
      }
      return ret;
    };
  }

  function patchLutimes(fs) {
    if (constants__default['default'].hasOwnProperty('O_SYMLINK')) {
      fs.lutimes = function(path, at, mt, cb) {
        fs.open(path, constants__default['default'].O_SYMLINK, function(er, fd) {
          if (er) {
            if (cb) cb(er);
            return;
          }
          fs.futimes(fd, at, mt, function(er) {
            fs.close(fd, function(er2) {
              if (cb) cb(er || er2);
            });
          });
        });
      };

      fs.lutimesSync = function(path, at, mt) {
        var fd = fs.openSync(path, constants__default['default'].O_SYMLINK);
        var ret;
        var threw = true;
        try {
          ret = fs.futimesSync(fd, at, mt);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs.closeSync(fd);
            } catch (er) {}
          } else {
            fs.closeSync(fd);
          }
        }
        return ret;
      };
    } else {
      fs.lutimes = function(_a, _b, _c, cb) {
        if (cb) process.nextTick(cb);
      };
      fs.lutimesSync = function() {};
    }
  }

  function chmodFix(orig) {
    if (!orig) return orig;
    return function(target, mode, cb) {
      return orig.call(fs, target, mode, function(er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      });
    };
  }

  function chmodFixSync(orig) {
    if (!orig) return orig;
    return function(target, mode) {
      try {
        return orig.call(fs, target, mode);
      } catch (er) {
        if (!chownErOk(er)) throw er;
      }
    };
  }

  function chownFix(orig) {
    if (!orig) return orig;
    return function(target, uid, gid, cb) {
      return orig.call(fs, target, uid, gid, function(er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      });
    };
  }

  function chownFixSync(orig) {
    if (!orig) return orig;
    return function(target, uid, gid) {
      try {
        return orig.call(fs, target, uid, gid);
      } catch (er) {
        if (!chownErOk(er)) throw er;
      }
    };
  }

  function statFix(orig) {
    if (!orig) return orig;
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function(target, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = null;
      }
      function callback(er, stats) {
        if (stats) {
          if (stats.uid < 0) stats.uid += 0x100000000;
          if (stats.gid < 0) stats.gid += 0x100000000;
        }
        if (cb) cb.apply(this, arguments);
      }
      return options ? orig.call(fs, target, options, callback) : orig.call(fs, target, callback);
    };
  }

  function statFixSync(orig) {
    if (!orig) return orig;
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function(target, options) {
      var stats = options ? orig.call(fs, target, options) : orig.call(fs, target);
      if (stats.uid < 0) stats.uid += 0x100000000;
      if (stats.gid < 0) stats.gid += 0x100000000;
      return stats;
    };
  }

  // ENOSYS means that the fs doesn't support the op. Just ignore
  // that, because it doesn't matter.
  //
  // if there's no getuid, or if getuid() is something other
  // than 0, and the error is EINVAL or EPERM, then just ignore
  // it.
  //
  // This specific case is a silent failure in cp, install, tar,
  // and most other unix tools that manage permissions.
  //
  // When running as root, or if other types of errors are
  // encountered, then it's strict.
  function chownErOk(er) {
    if (!er) return true;

    if (er.code === 'ENOSYS') return true;

    var nonroot = !process.getuid || process.getuid() !== 0;
    if (nonroot) {
      if (er.code === 'EINVAL' || er.code === 'EPERM') return true;
    }

    return false;
  }
}

var Stream = Stream__default['default'].Stream;

var legacyStreams = legacy;

function legacy(fs) {
  return {
    ReadStream: ReadStream,
    WriteStream: WriteStream
  };

  function ReadStream(path, options) {
    if (!(this instanceof ReadStream)) return new ReadStream(path, options);

    Stream.call(this);

    var self = this;

    this.path = path;
    this.fd = null;
    this.readable = true;
    this.paused = false;

    this.flags = 'r';
    this.mode = 438; /*=0666*/
    this.bufferSize = 64 * 1024;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.encoding) this.setEncoding(this.encoding);

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.end === undefined) {
        this.end = Infinity;
      } else if ('number' !== typeof this.end) {
        throw TypeError('end must be a Number');
      }

      if (this.start > this.end) {
        throw new Error('start must be <= end');
      }

      this.pos = this.start;
    }

    if (this.fd !== null) {
      process.nextTick(function() {
        self._read();
      });
      return;
    }

    fs.open(this.path, this.flags, this.mode, function(err, fd) {
      if (err) {
        self.emit('error', err);
        self.readable = false;
        return;
      }

      self.fd = fd;
      self.emit('open', fd);
      self._read();
    });
  }

  function WriteStream(path, options) {
    if (!(this instanceof WriteStream)) return new WriteStream(path, options);

    Stream.call(this);

    this.path = path;
    this.fd = null;
    this.writable = true;

    this.flags = 'w';
    this.encoding = 'binary';
    this.mode = 438; /*=0666*/
    this.bytesWritten = 0;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.start < 0) {
        throw new Error('start must be >= zero');
      }

      this.pos = this.start;
    }

    this.busy = false;
    this._queue = [];

    if (this.fd === null) {
      this._open = fs.open;
      this._queue.push([this._open, this.path, this.flags, this.mode, undefined]);
      this.flush();
    }
  }
}

var clone_1 = clone;

function clone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;

  if (obj instanceof Object) var copy = { __proto__: obj.__proto__ };
  else var copy = Object.create(null);

  Object.getOwnPropertyNames(obj).forEach(function(key) {
    Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
  });

  return copy;
}

var gracefulFs = _commonjsHelpers.createCommonjsModule(function(module) {
  /* istanbul ignore next - node 0.x polyfill */
  var gracefulQueue;
  var previousSymbol;

  /* istanbul ignore else - node 0.x polyfill */
  if (typeof Symbol === 'function' && typeof Symbol.for === 'function') {
    gracefulQueue = Symbol.for('graceful-fs.queue');
    // This is used in testing by future versions
    previousSymbol = Symbol.for('graceful-fs.previous');
  } else {
    gracefulQueue = '___graceful-fs.queue';
    previousSymbol = '___graceful-fs.previous';
  }

  function noop() {}

  function publishQueue(context, queue) {
    Object.defineProperty(context, gracefulQueue, {
      get: function() {
        return queue;
      }
    });
  }

  var debug = noop;
  if (util__default['default'].debuglog) debug = util__default['default'].debuglog('gfs4');
  else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ''))
    debug = function() {
      var m = util__default['default'].format.apply(util__default['default'], arguments);
      m = 'GFS4: ' + m.split(/\n/).join('\nGFS4: ');
      console.error(m);
    };

  // Once time initialization
  if (!fs__default['default'][gracefulQueue]) {
    // This queue can be shared by multiple loaded instances
    var queue = _commonjsHelpers.commonjsGlobal[gracefulQueue] || [];
    publishQueue(fs__default['default'], queue);

    // Patch fs.close/closeSync to shared queue version, because we need
    // to retry() whenever a close happens *anywhere* in the program.
    // This is essential when multiple graceful-fs instances are
    // in play at the same time.
    fs__default['default'].close = (function(fs$close) {
      function close(fd, cb) {
        return fs$close.call(fs__default['default'], fd, function(err) {
          // This function uses the graceful-fs shared queue
          if (!err) {
            retry();
          }

          if (typeof cb === 'function') cb.apply(this, arguments);
        });
      }

      Object.defineProperty(close, previousSymbol, {
        value: fs$close
      });
      return close;
    })(fs__default['default'].close);

    fs__default['default'].closeSync = (function(fs$closeSync) {
      function closeSync(fd) {
        // This function uses the graceful-fs shared queue
        fs$closeSync.apply(fs__default['default'], arguments);
        retry();
      }

      Object.defineProperty(closeSync, previousSymbol, {
        value: fs$closeSync
      });
      return closeSync;
    })(fs__default['default'].closeSync);

    if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
      process.on('exit', function() {
        debug(fs__default['default'][gracefulQueue]);
        assert__default['default'].equal(fs__default['default'][gracefulQueue].length, 0);
      });
    }
  }

  if (!_commonjsHelpers.commonjsGlobal[gracefulQueue]) {
    publishQueue(_commonjsHelpers.commonjsGlobal, fs__default['default'][gracefulQueue]);
  }

  module.exports = patch(clone_1(fs__default['default']));
  if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs__default['default'].__patched) {
    module.exports = patch(fs__default['default']);
    fs__default['default'].__patched = true;
  }

  function patch(fs) {
    // Everything that references the open() function needs to be in here
    polyfills(fs);
    fs.gracefulify = patch;

    fs.createReadStream = createReadStream;
    fs.createWriteStream = createWriteStream;
    var fs$readFile = fs.readFile;
    fs.readFile = readFile;
    function readFile(path, options, cb) {
      if (typeof options === 'function') (cb = options), (options = null);

      return go$readFile(path, options, cb);

      function go$readFile(path, options, cb) {
        return fs$readFile(path, options, function(err) {
          if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([go$readFile, [path, options, cb]]);
          else {
            if (typeof cb === 'function') cb.apply(this, arguments);
            retry();
          }
        });
      }
    }

    var fs$writeFile = fs.writeFile;
    fs.writeFile = writeFile;
    function writeFile(path, data, options, cb) {
      if (typeof options === 'function') (cb = options), (options = null);

      return go$writeFile(path, data, options, cb);

      function go$writeFile(path, data, options, cb) {
        return fs$writeFile(path, data, options, function(err) {
          if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
            enqueue([go$writeFile, [path, data, options, cb]]);
          else {
            if (typeof cb === 'function') cb.apply(this, arguments);
            retry();
          }
        });
      }
    }

    var fs$appendFile = fs.appendFile;
    if (fs$appendFile) fs.appendFile = appendFile;
    function appendFile(path, data, options, cb) {
      if (typeof options === 'function') (cb = options), (options = null);

      return go$appendFile(path, data, options, cb);

      function go$appendFile(path, data, options, cb) {
        return fs$appendFile(path, data, options, function(err) {
          if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
            enqueue([go$appendFile, [path, data, options, cb]]);
          else {
            if (typeof cb === 'function') cb.apply(this, arguments);
            retry();
          }
        });
      }
    }

    var fs$readdir = fs.readdir;
    fs.readdir = readdir;
    function readdir(path, options, cb) {
      var args = [path];
      if (typeof options !== 'function') {
        args.push(options);
      } else {
        cb = options;
      }
      args.push(go$readdir$cb);

      return go$readdir(args);

      function go$readdir$cb(err, files) {
        if (files && files.sort) files.sort();

        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([go$readdir, [args]]);
        else {
          if (typeof cb === 'function') cb.apply(this, arguments);
          retry();
        }
      }
    }

    function go$readdir(args) {
      return fs$readdir.apply(fs, args);
    }

    if (process.version.substr(0, 4) === 'v0.8') {
      var legStreams = legacyStreams(fs);
      ReadStream = legStreams.ReadStream;
      WriteStream = legStreams.WriteStream;
    }

    var fs$ReadStream = fs.ReadStream;
    if (fs$ReadStream) {
      ReadStream.prototype = Object.create(fs$ReadStream.prototype);
      ReadStream.prototype.open = ReadStream$open;
    }

    var fs$WriteStream = fs.WriteStream;
    if (fs$WriteStream) {
      WriteStream.prototype = Object.create(fs$WriteStream.prototype);
      WriteStream.prototype.open = WriteStream$open;
    }

    Object.defineProperty(fs, 'ReadStream', {
      get: function() {
        return ReadStream;
      },
      set: function(val) {
        ReadStream = val;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(fs, 'WriteStream', {
      get: function() {
        return WriteStream;
      },
      set: function(val) {
        WriteStream = val;
      },
      enumerable: true,
      configurable: true
    });

    // legacy names
    var FileReadStream = ReadStream;
    Object.defineProperty(fs, 'FileReadStream', {
      get: function() {
        return FileReadStream;
      },
      set: function(val) {
        FileReadStream = val;
      },
      enumerable: true,
      configurable: true
    });
    var FileWriteStream = WriteStream;
    Object.defineProperty(fs, 'FileWriteStream', {
      get: function() {
        return FileWriteStream;
      },
      set: function(val) {
        FileWriteStream = val;
      },
      enumerable: true,
      configurable: true
    });

    function ReadStream(path, options) {
      if (this instanceof ReadStream) return fs$ReadStream.apply(this, arguments), this;
      else return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
    }

    function ReadStream$open() {
      var that = this;
      open(that.path, that.flags, that.mode, function(err, fd) {
        if (err) {
          if (that.autoClose) that.destroy();

          that.emit('error', err);
        } else {
          that.fd = fd;
          that.emit('open', fd);
          that.read();
        }
      });
    }

    function WriteStream(path, options) {
      if (this instanceof WriteStream) return fs$WriteStream.apply(this, arguments), this;
      else return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
    }

    function WriteStream$open() {
      var that = this;
      open(that.path, that.flags, that.mode, function(err, fd) {
        if (err) {
          that.destroy();
          that.emit('error', err);
        } else {
          that.fd = fd;
          that.emit('open', fd);
        }
      });
    }

    function createReadStream(path, options) {
      return new fs.ReadStream(path, options);
    }

    function createWriteStream(path, options) {
      return new fs.WriteStream(path, options);
    }

    var fs$open = fs.open;
    fs.open = open;
    function open(path, flags, mode, cb) {
      if (typeof mode === 'function') (cb = mode), (mode = null);

      return go$open(path, flags, mode, cb);

      function go$open(path, flags, mode, cb) {
        return fs$open(path, flags, mode, function(err, fd) {
          if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([go$open, [path, flags, mode, cb]]);
          else {
            if (typeof cb === 'function') cb.apply(this, arguments);
            retry();
          }
        });
      }
    }

    return fs;
  }

  function enqueue(elem) {
    debug('ENQUEUE', elem[0].name, elem[1]);
    fs__default['default'][gracefulQueue].push(elem);
  }

  function retry() {
    var elem = fs__default['default'][gracefulQueue].shift();
    if (elem) {
      debug('RETRY', elem[0].name, elem[1]);
      elem[0].apply(null, elem[1]);
    }
  }
});

const { promisify } = util__default['default'];

const optsArg = opts => {
  if (!opts) opts = { mode: 0o777, fs: fs__default['default'] };
  else if (typeof opts === 'object') opts = { mode: 0o777, fs: fs__default['default'], ...opts };
  else if (typeof opts === 'number') opts = { mode: opts, fs: fs__default['default'] };
  else if (typeof opts === 'string') opts = { mode: parseInt(opts, 8), fs: fs__default['default'] };
  else throw new TypeError('invalid options argument');

  opts.mkdir = opts.mkdir || opts.fs.mkdir || fs__default['default'].mkdir;
  opts.mkdirAsync = promisify(opts.mkdir);
  opts.stat = opts.stat || opts.fs.stat || fs__default['default'].stat;
  opts.statAsync = promisify(opts.stat);
  opts.statSync = opts.statSync || opts.fs.statSync || fs__default['default'].statSync;
  opts.mkdirSync = opts.mkdirSync || opts.fs.mkdirSync || fs__default['default'].mkdirSync;
  return opts;
};
var optsArg_1 = optsArg;

const platform$1 = process.env.__TESTING_MKDIRP_PLATFORM__ || process.platform;
const { resolve, parse } = path__default['default'];
const pathArg = path => {
  if (/\0/.test(path)) {
    // simulate same failure that node raises
    throw Object.assign(new TypeError('path must be a string without null bytes'), {
      path,
      code: 'ERR_INVALID_ARG_VALUE'
    });
  }

  path = resolve(path);
  if (platform$1 === 'win32') {
    const badWinChars = /[*|"<>?:]/;
    const { root } = parse(path);
    if (badWinChars.test(path.substr(root.length))) {
      throw Object.assign(new Error('Illegal characters in path.'), {
        path,
        code: 'EINVAL'
      });
    }
  }

  return path;
};
var pathArg_1 = pathArg;

const { dirname } = path__default['default'];

const findMade = (opts, parent, path = undefined) => {
  // we never want the 'made' return value to be a root directory
  if (path === parent) return Promise.resolve();

  return opts.statAsync(parent).then(
    st => (st.isDirectory() ? path : undefined), // will fail later
    er => (er.code === 'ENOENT' ? findMade(opts, dirname(parent), parent) : undefined)
  );
};

const findMadeSync = (opts, parent, path = undefined) => {
  if (path === parent) return undefined;

  try {
    return opts.statSync(parent).isDirectory() ? path : undefined;
  } catch (er) {
    return er.code === 'ENOENT' ? findMadeSync(opts, dirname(parent), parent) : undefined;
  }
};

var findMade_1 = { findMade, findMadeSync };

const { dirname: dirname$1 } = path__default['default'];

const mkdirpManual = (path, opts, made) => {
  opts.recursive = false;
  const parent = dirname$1(path);
  if (parent === path) {
    return opts.mkdirAsync(path, opts).catch(er => {
      // swallowed by recursive implementation on posix systems
      // any other error is a failure
      if (er.code !== 'EISDIR') throw er;
    });
  }

  return opts.mkdirAsync(path, opts).then(
    () => made || path,
    er => {
      if (er.code === 'ENOENT') return mkdirpManual(parent, opts).then(made => mkdirpManual(path, opts, made));
      if (er.code !== 'EEXIST' && er.code !== 'EROFS') throw er;
      return opts.statAsync(path).then(
        st => {
          if (st.isDirectory()) return made;
          else throw er;
        },
        () => {
          throw er;
        }
      );
    }
  );
};

const mkdirpManualSync = (path, opts, made) => {
  const parent = dirname$1(path);
  opts.recursive = false;

  if (parent === path) {
    try {
      return opts.mkdirSync(path, opts);
    } catch (er) {
      // swallowed by recursive implementation on posix systems
      // any other error is a failure
      if (er.code !== 'EISDIR') throw er;
      else return;
    }
  }

  try {
    opts.mkdirSync(path, opts);
    return made || path;
  } catch (er) {
    if (er.code === 'ENOENT') return mkdirpManualSync(path, opts, mkdirpManualSync(parent, opts, made));
    if (er.code !== 'EEXIST' && er.code !== 'EROFS') throw er;
    try {
      if (!opts.statSync(path).isDirectory()) throw er;
    } catch (_) {
      throw er;
    }
  }
};

var mkdirpManual_1 = { mkdirpManual, mkdirpManualSync };

const { dirname: dirname$2 } = path__default['default'];
const { findMade: findMade$1, findMadeSync: findMadeSync$1 } = findMade_1;
const { mkdirpManual: mkdirpManual$1, mkdirpManualSync: mkdirpManualSync$1 } = mkdirpManual_1;

const mkdirpNative = (path, opts) => {
  opts.recursive = true;
  const parent = dirname$2(path);
  if (parent === path) return opts.mkdirAsync(path, opts);

  return findMade$1(opts, path).then(made =>
    opts
      .mkdirAsync(path, opts)
      .then(() => made)
      .catch(er => {
        if (er.code === 'ENOENT') return mkdirpManual$1(path, opts);
        else throw er;
      })
  );
};

const mkdirpNativeSync = (path, opts) => {
  opts.recursive = true;
  const parent = dirname$2(path);
  if (parent === path) return opts.mkdirSync(path, opts);

  const made = findMadeSync$1(opts, path);
  try {
    opts.mkdirSync(path, opts);
    return made;
  } catch (er) {
    if (er.code === 'ENOENT') return mkdirpManualSync$1(path, opts);
    else throw er;
  }
};

var mkdirpNative_1 = { mkdirpNative, mkdirpNativeSync };

const version = process.env.__TESTING_MKDIRP_NODE_VERSION__ || process.version;
const versArr = version.replace(/^v/, '').split('.');
const hasNative = +versArr[0] > 10 || (+versArr[0] === 10 && +versArr[1] >= 12);

const useNative = !hasNative ? () => false : opts => opts.mkdir === fs__default['default'].mkdir;
const useNativeSync = !hasNative ? () => false : opts => opts.mkdirSync === fs__default['default'].mkdirSync;

var useNative_1 = { useNative, useNativeSync };

const { mkdirpNative: mkdirpNative$1, mkdirpNativeSync: mkdirpNativeSync$1 } = mkdirpNative_1;
const { mkdirpManual: mkdirpManual$2, mkdirpManualSync: mkdirpManualSync$2 } = mkdirpManual_1;
const { useNative: useNative$1, useNativeSync: useNativeSync$1 } = useNative_1;

const mkdirp = (path, opts) => {
  path = pathArg_1(path);
  opts = optsArg_1(opts);
  return useNative$1(opts) ? mkdirpNative$1(path, opts) : mkdirpManual$2(path, opts);
};

const mkdirpSync = (path, opts) => {
  path = pathArg_1(path);
  opts = optsArg_1(opts);
  return useNativeSync$1(opts) ? mkdirpNativeSync$1(path, opts) : mkdirpManualSync$2(path, opts);
};

mkdirp.sync = mkdirpSync;
mkdirp.native = (path, opts) => mkdirpNative$1(pathArg_1(path), optsArg_1(opts));
mkdirp.manual = (path, opts) => mkdirpManual$2(pathArg_1(path), optsArg_1(opts));
mkdirp.nativeSync = (path, opts) => mkdirpNativeSync$1(pathArg_1(path), optsArg_1(opts));
mkdirp.manualSync = (path, opts) => mkdirpManualSync$2(pathArg_1(path), optsArg_1(opts));

var mkdirp_1 = mkdirp;

var mkdirpLib = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.assign(/*#__PURE__*/ Object.create(null), mkdirp_1, {
    default: mkdirp_1
  })
);

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const fs = {
  /**
   * The default file system mode to use when creating directories.
   */
  DEFAULT_USER_DIR_MODE: '700',
  /**
   * The default file system mode to use when creating files.
   */
  DEFAULT_USER_FILE_MODE: '600',
  /**
   * A convenience reference to {@link https://nodejs.org/api/fsLib.html#fs_fs_constants}
   * to reduce the need to import multiple `fs` modules.
   */
  constants: gracefulFs.constants,
  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_readfile_path_options_callback|fsLib.readFile}.
   */
  readFile: util.promisify(gracefulFs.readFile),
  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_readdir_path_options_callback|fsLib.readdir}.
   */
  readdir: util.promisify(gracefulFs.readdir),
  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_writefile_file_data_options_callback|fsLib.writeFile}.
   */
  writeFile: util.promisify(gracefulFs.writeFile),
  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_access_path_mode_callback|fsLib.access}.
   */
  access: util.promisify(gracefulFs.access),
  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_open_path_flags_mode_callback|fsLib.open}.
   */
  open: util.promisify(gracefulFs.open),
  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_unlink_path_callback|fsLib.unlink}.
   */
  unlink: util.promisify(gracefulFs.unlink),
  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_readdir_path_options_callback|fsLib.rmdir}.
   */
  rmdir: util.promisify(gracefulFs.rmdir),
  /**
   * Promisified version of {@link https://nodejs.org/api/fsLib.html#fs_fs_fstat_fd_callback|fsLib.stat}.
   */
  stat: util.promisify(gracefulFs.stat),
  statSync: gracefulFs.statSync,
  /**
   * Promisified version of {@link https://npmjs.com/package/mkdirp|mkdirp}.
   */
  // @ts-ignore TODO: figure out how to bind to correct promisify overload
  mkdirp: (folderPath, mode) => mkdirpLib(folderPath, mode),
  /**
   * Deletes a folder recursively, removing all descending files and folders.
   *
   * **Throws** *PathIsNullOrUndefined* The path is not defined.
   * **Throws** *DirMissingOrNoAccess* The folder or any sub-folder is missing or has no access.
   * @param {string} dirPath The path to remove.
   */
  remove: async dirPath => {
    if (!dirPath) {
      throw new sfdxError.SfdxError('Path is null or undefined.', 'PathIsNullOrUndefined');
    }
    try {
      await fs.access(dirPath, gracefulFs.constants.R_OK);
    } catch (err) {
      throw new sfdxError.SfdxError(`The path: ${dirPath} doesn\'t exist or access is denied.`, 'DirMissingOrNoAccess');
    }
    const files = await fs.readdir(dirPath);
    const stats = await Promise.all(files.map(file => fs.stat(path.join(dirPath, file))));
    const metas = stats.map((value, index) => Object.assign(value, { path: path.join(dirPath, files[index]) }));
    await Promise.all(metas.map(meta => (meta.isDirectory() ? fs.remove(meta.path) : fs.unlink(meta.path))));
    await fs.rmdir(dirPath);
  },
  /**
   * Searches a file path in an ascending manner (until reaching the filesystem root) for the first occurrence a
   * specific file name.  Resolves with the directory path containing the located file, or `null` if the file was
   * not found.
   *
   * @param dir The directory path in which to start the upward search.
   * @param file The file name to look for.
   */
  traverseForFile: async (dir, file) => {
    let foundProjectDir;
    try {
      await fs.stat(path.join(dir, file));
      foundProjectDir = dir;
    } catch (err) {
      if (err && err.code === 'ENOENT') {
        const nextDir = path.resolve(dir, '..');
        if (nextDir !== dir) {
          // stop at root
          foundProjectDir = await fs.traverseForFile(nextDir, file);
        }
      }
    }
    return foundProjectDir;
  },
  /**
   * Searches a file path synchronously in an ascending manner (until reaching the filesystem root) for the first occurrence a
   * specific file name.  Resolves with the directory path containing the located file, or `null` if the file was
   * not found.
   *
   * @param dir The directory path in which to start the upward search.
   * @param file The file name to look for.
   */
  traverseForFileSync: (dir, file) => {
    let foundProjectDir;
    try {
      fs.statSync(path.join(dir, file));
      foundProjectDir = dir;
    } catch (err) {
      if (err && err.code === 'ENOENT') {
        const nextDir = path.resolve(dir, '..');
        if (nextDir !== dir) {
          // stop at root
          foundProjectDir = fs.traverseForFileSync(nextDir, file);
        }
      }
    }
    return foundProjectDir;
  },
  /**
   * Read a file and convert it to JSON. Returns the contents of the file as a JSON object
   *
   * @param jsonPath The path of the file.
   * @param throwOnEmpty Whether to throw an error if the JSON file is empty.
   */
  readJson: async (jsonPath, throwOnEmpty) => {
    const fileData = await fs.readFile(jsonPath, 'utf8');
    return await index.lib.parseJson(fileData, jsonPath, throwOnEmpty);
  },
  /**
   * Read a file and convert it to JSON, throwing an error if the parsed contents are not a `JsonMap`.
   *
   * @param jsonPath The path of the file.
   * @param throwOnEmpty Whether to throw an error if the JSON file is empty.
   */
  readJsonMap: async (jsonPath, throwOnEmpty) => {
    const fileData = await fs.readFile(jsonPath, 'utf8');
    return await index.lib.parseJsonMap(fileData, jsonPath, throwOnEmpty);
  },
  /**
   * Convert a JSON-compatible object to a `string` and write it to a file.
   *
   * @param jsonPath The path of the file to write.
   * @param data The JSON object to write.
   */
  writeJson: async (jsonPath, data) => {
    const fileData = JSON.stringify(data, null, 4);
    await fs.writeFile(jsonPath, fileData, {
      encoding: 'utf8',
      mode: fs.DEFAULT_USER_FILE_MODE
    });
  },
  /**
   * Checks if a file path exists
   *
   * @param filePath the file path to check the existence of
   */
  fileExists: async filePath => {
    try {
      await fs.access(filePath);
      return true;
    } catch (err) {
      return false;
    }
  },
  /**
   * Recursively act on all files or directories in a directory
   *
   * @param dir path to directory
   * @param perform function to be run on contents of dir
   * @param onType optional parameter to specify type to actOn
   * @returns void
   */
  actOn: async (dir, perform, onType = 'file') => {
    for (const file of await fs.readdir(dir)) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      if (stat) {
        if (stat.isDirectory()) {
          await fs.actOn(filePath, perform, onType);
          if (onType === 'dir') {
            await perform(filePath);
          }
        } else if (stat.isFile() && onType === 'file') {
          await perform(filePath, file, dir);
        }
      }
    }
  },
  /**
   * Checks if files are the same
   *
   * @param file1Path the first file path to check
   * @param file2Path the second file path to check
   * @returns boolean
   */
  areFilesEqual: async (file1Path, file2Path) => {
    try {
      const file1Size = (await fs.stat(file1Path)).size;
      const file2Size = (await fs.stat(file2Path)).size;
      if (file1Size !== file2Size) {
        return false;
      }
      const contentA = await fs.readFile(file1Path);
      const contentB = await fs.readFile(file2Path);
      return fs.getContentHash(contentA) === fs.getContentHash(contentB);
    } catch (err) {
      throw new sfdxError.SfdxError(`The path: ${err.path} doesn't exist or access is denied.`, 'DirMissingOrNoAccess');
    }
  },
  /**
   * Creates a hash for the string that's passed in
   * @param contents The string passed into the function
   * @returns string
   */
  getContentHash(contents) {
    return crypto
      .createHash('sha1')
      .update(contents)
      .digest('hex');
  }
};

exports.fs = fs;
//# sourceMappingURL=fs.js.map
