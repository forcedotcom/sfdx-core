'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('../index-aea73a28.js');
var index$1 = require('../index-ffe6ca9f.js');
var events = require('events');
var _commonjsHelpers = require('../_commonjsHelpers-49936489.js');
var driver = require('../driver-39f7bd00.js');
var util = require('util');
var Stream$2 = require('stream');
var net = require('net');
var tls = require('tls');
var crypto = require('crypto');
var url = require('url');
var http = require('http');
var https = require('https');
var os = require('os');
var path = require('path');
var querystring = require('querystring');
var fs = require('fs');
var logger = require('../logger.js');
var sfdxError = require('../sfdxError.js');
require('punycode');
require('assert');
require('domain');
require('buffer');
require('../index-e6d82ffe.js');
require('tty');
require('../global.js');
require('../util/fs.js');
require('constants');
require('../messages.js');

function _interopDefaultLegacy(e) {
  return e && typeof e === 'object' && 'default' in e ? e : { default: e };
}

var util__default = /*#__PURE__*/ _interopDefaultLegacy(util);
var Stream__default = /*#__PURE__*/ _interopDefaultLegacy(Stream$2);
var net__default = /*#__PURE__*/ _interopDefaultLegacy(net);
var tls__default = /*#__PURE__*/ _interopDefaultLegacy(tls);
var crypto__default = /*#__PURE__*/ _interopDefaultLegacy(crypto);
var url__default = /*#__PURE__*/ _interopDefaultLegacy(url);
var http__default = /*#__PURE__*/ _interopDefaultLegacy(http);
var https__default = /*#__PURE__*/ _interopDefaultLegacy(https);
var os__default = /*#__PURE__*/ _interopDefaultLegacy(os);
var path__default = /*#__PURE__*/ _interopDefaultLegacy(path);
var querystring__default = /*#__PURE__*/ _interopDefaultLegacy(querystring);
var fs__default = /*#__PURE__*/ _interopDefaultLegacy(fs);

var constants = {
  VERSION: '1.2.4',

  BAYEUX_VERSION: '1.0',
  ID_LENGTH: 160,
  JSONP_CALLBACK: 'jsonpcallback',
  CONNECTION_TYPES: [
    'long-polling',
    'cross-origin-long-polling',
    'callback-polling',
    'websocket',
    'eventsource',
    'in-process'
  ],

  MANDATORY_CONNECTION_TYPES: ['long-polling', 'callback-polling', 'in-process']
};

// http://assanka.net/content/tech/2009/09/02/json2-js-vs-prototype/

var to_json = function(object) {
  return JSON.stringify(object, function(key, value) {
    return this[key] instanceof Array ? this[key] : value;
  });
};

var Logging = {
  LOG_LEVELS: {
    fatal: 4,
    error: 3,
    warn: 2,
    info: 1,
    debug: 0
  },

  writeLog: function(messageArgs, level) {
    var logger = Logging.logger || (Logging.wrapper || Logging).logger;
    if (!logger) return;

    var args = Array.prototype.slice.apply(messageArgs),
      banner = '[Faye',
      klass = this.className,
      message = args.shift().replace(/\?/g, function() {
        try {
          return to_json(args.shift());
        } catch (error) {
          return '[Object]';
        }
      });

    if (klass) banner += '.' + klass;
    banner += '] ';

    if (typeof logger[level] === 'function') logger[level](banner + message);
    else if (typeof logger === 'function') logger(banner + message);
  }
};

for (var key in Logging.LOG_LEVELS)
  (function(level) {
    Logging[level] = function() {
      this.writeLog(arguments, level);
    };
  })(key);

var logging = Logging;

var forEach = Array.prototype.forEach,
  hasOwn = Object.prototype.hasOwnProperty;

var assign = function(target) {
  forEach.call(arguments, function(source, i) {
    if (i === 0) return;

    for (var key in source) {
      if (hasOwn.call(source, key)) target[key] = source[key];
    }
  });

  return target;
};

var _class = function(parent, methods) {
  if (typeof parent !== 'function') {
    methods = parent;
    parent = Object;
  }

  var klass = function() {
    if (!this.initialize) return this;
    return this.initialize.apply(this, arguments) || this;
  };

  var bridge = function() {};
  bridge.prototype = parent.prototype;

  klass.prototype = new bridge();
  assign(klass.prototype, methods);

  return klass;
};

var PENDING = -1,
  FULFILLED = 0,
  REJECTED = 1;

var Promise$1 = function(task) {
  this._state = PENDING;
  this._value = null;
  this._defer = [];

  execute(this, task);
};

Promise$1.prototype.then = function(onFulfilled, onRejected) {
  var promise = new Promise$1();

  var deferred = {
    promise: promise,
    onFulfilled: onFulfilled,
    onRejected: onRejected
  };

  if (this._state === PENDING) this._defer.push(deferred);
  else propagate(this, deferred);

  return promise;
};

Promise$1.prototype['catch'] = function(onRejected) {
  return this.then(null, onRejected);
};

var execute = function(promise, task) {
  if (typeof task !== 'function') return;

  var calls = 0;

  var resolvePromise = function(value) {
    if (calls++ === 0) resolve(promise, value);
  };

  var rejectPromise = function(reason) {
    if (calls++ === 0) reject(promise, reason);
  };

  try {
    task(resolvePromise, rejectPromise);
  } catch (error) {
    rejectPromise(error);
  }
};

var propagate = function(promise, deferred) {
  var state = promise._state,
    value = promise._value,
    next = deferred.promise,
    handler = [deferred.onFulfilled, deferred.onRejected][state],
    pass = [resolve, reject][state];

  if (typeof handler !== 'function') return pass(next, value);

  driver.asap_1(function() {
    try {
      resolve(next, handler(value));
    } catch (error) {
      reject(next, error);
    }
  });
};

var resolve = function(promise, value) {
  if (promise === value) return reject(promise, new TypeError('Recursive promise chain detected'));

  var then;

  try {
    then = getThen(value);
  } catch (error) {
    return reject(promise, error);
  }

  if (!then) return fulfill(promise, value);

  execute(promise, function(resolvePromise, rejectPromise) {
    then.call(value, resolvePromise, rejectPromise);
  });
};

var getThen = function(value) {
  var type = typeof value,
    then = (type === 'object' || type === 'function') && value && value.then;

  return typeof then === 'function' ? then : null;
};

var fulfill = function(promise, value) {
  settle(promise, FULFILLED, value);
};

var reject = function(promise, reason) {
  settle(promise, REJECTED, reason);
};

var settle = function(promise, state, value) {
  var defer = promise._defer,
    i = 0;

  promise._state = state;
  promise._value = value;
  promise._defer = null;

  if (defer.length === 0) return;
  while (i < defer.length) propagate(promise, defer[i++]);
};

Promise$1.resolve = function(value) {
  try {
    if (getThen(value)) return value;
  } catch (error) {
    return Promise$1.reject(error);
  }

  return new Promise$1(function(resolve, reject) {
    resolve(value);
  });
};

Promise$1.reject = function(reason) {
  return new Promise$1(function(resolve, reject) {
    reject(reason);
  });
};

Promise$1.all = function(promises) {
  return new Promise$1(function(resolve, reject) {
    var list = [],
      n = promises.length,
      i;

    if (n === 0) return resolve(list);

    var push = function(promise, i) {
      Promise$1.resolve(promise).then(function(value) {
        list[i] = value;
        if (--n === 0) resolve(list);
      }, reject);
    };

    for (i = 0; i < n; i++) push(promises[i], i);
  });
};

Promise$1.race = function(promises) {
  return new Promise$1(function(resolve, reject) {
    for (var i = 0, n = promises.length; i < n; i++) Promise$1.resolve(promises[i]).then(resolve, reject);
  });
};

Promise$1.deferred = function() {
  var tuple = {};

  tuple.promise = new Promise$1(function(resolve, reject) {
    tuple.resolve = resolve;
    tuple.reject = reject;
  });
  return tuple;
};

var promise = Promise$1;

var array = {
  commonElement: function(lista, listb) {
    for (var i = 0, n = lista.length; i < n; i++) {
      if (this.indexOf(listb, lista[i]) !== -1) return lista[i];
    }
    return null;
  },

  indexOf: function(list, needle) {
    if (list.indexOf) return list.indexOf(needle);

    for (var i = 0, n = list.length; i < n; i++) {
      if (list[i] === needle) return i;
    }
    return -1;
  },

  map: function(object, callback, context) {
    if (object.map) return object.map(callback, context);
    var result = [];

    if (object instanceof Array) {
      for (var i = 0, n = object.length; i < n; i++) {
        result.push(callback.call(context || null, object[i], i));
      }
    } else {
      for (var key in object) {
        if (!object.hasOwnProperty(key)) continue;
        result.push(callback.call(context || null, key, object[key]));
      }
    }
    return result;
  },

  filter: function(array, callback, context) {
    if (array.filter) return array.filter(callback, context);
    var result = [];
    for (var i = 0, n = array.length; i < n; i++) {
      if (callback.call(context || null, array[i], i)) result.push(array[i]);
    }
    return result;
  },

  asyncEach: function(list, iterator, callback, context) {
    var n = list.length,
      i = -1,
      calls = 0,
      looping = false;

    var iterate = function() {
      calls -= 1;
      i += 1;
      if (i === n) return callback && callback.call(context);
      iterator(list[i], resume);
    };

    var loop = function() {
      if (looping) return;
      looping = true;
      while (calls > 0) iterate();
      looping = false;
    };

    var resume = function() {
      calls += 1;
      loop();
    };
    resume();
  }
};

var validate_options = function(options, validKeys) {
  for (var key in options) {
    if (array.indexOf(validKeys, key) < 0) throw new Error('Unrecognized option: ' + key);
  }
};

var deferrable = {
  then: function(callback, errback) {
    var self = this;
    if (!this._promise)
      this._promise = new promise(function(resolve, reject) {
        self._resolve = resolve;
        self._reject = reject;
      });

    if (arguments.length === 0) return this._promise;
    else return this._promise.then(callback, errback);
  },

  callback: function(callback, context) {
    return this.then(function(value) {
      callback.call(context, value);
    });
  },

  errback: function(callback, context) {
    return this.then(null, function(reason) {
      callback.call(context, reason);
    });
  },

  timeout: function(seconds, message) {
    this.then();
    var self = this;
    this._timer = _commonjsHelpers.commonjsGlobal.setTimeout(function() {
      self._reject(message);
    }, seconds * 1000);
  },

  setDeferredStatus: function(status, value) {
    if (this._timer) _commonjsHelpers.commonjsGlobal.clearTimeout(this._timer);

    this.then();

    if (status === 'succeeded') this._resolve(value);
    else if (status === 'failed') this._reject(value);
    else delete this._promise;
  }
};

/*
Copyright Joyent, Inc. and other Node contributors. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var isArray =
  typeof Array.isArray === 'function'
    ? Array.isArray
    : function(xs) {
        return Object.prototype.toString.call(xs) === '[object Array]';
      };
function indexOf(xs, x) {
  if (xs.indexOf) return xs.indexOf(x);
  for (var i = 0; i < xs.length; i++) {
    if (x === xs[i]) return i;
  }
  return -1;
}

function EventEmitter() {}
var event_emitter = EventEmitter;

EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error || (isArray(this._events.error) && !this._events.error.length)) {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;
  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;
  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {
    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0) delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

var Publisher = {
  countListeners: function(eventType) {
    return this.listeners(eventType).length;
  },

  bind: function(eventType, listener, context) {
    var slice = Array.prototype.slice,
      handler = function() {
        listener.apply(context, slice.call(arguments));
      };

    this._listeners = this._listeners || [];
    this._listeners.push([eventType, listener, context, handler]);
    return this.on(eventType, handler);
  },

  unbind: function(eventType, listener, context) {
    this._listeners = this._listeners || [];
    var n = this._listeners.length,
      tuple;

    while (n--) {
      tuple = this._listeners[n];
      if (tuple[0] !== eventType) continue;
      if (listener && (tuple[1] !== listener || tuple[2] !== context)) continue;
      this._listeners.splice(n, 1);
      this.removeListener(eventType, tuple[3]);
    }
  }
};

assign(Publisher, event_emitter.prototype);
Publisher.trigger = Publisher.emit;

var publisher = Publisher;

var grammar = {
  CHANNEL_NAME: /^\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+(\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+)*$/,
  CHANNEL_PATTERN: /^(\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+)*\/\*{1,2}$/,
  ERROR: /^([0-9][0-9][0-9]:(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)| |\/|\*|\.))*(,(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)| |\/|\*|\.))*)*:(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)| |\/|\*|\.))*|[0-9][0-9][0-9]::(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)| |\/|\*|\.))*)$/,
  VERSION: /^([0-9])+(\.(([a-z]|[A-Z])|[0-9])(((([a-z]|[A-Z])|[0-9])|\-|\_))*)*$/
};

var Channel = _class({
  initialize: function(name) {
    this.id = this.name = name;
  },

  push: function(message) {
    this.trigger('message', message);
  },

  isUnused: function() {
    return this.countListeners('message') === 0;
  }
});

assign(Channel.prototype, publisher);

assign(Channel, {
  HANDSHAKE: '/meta/handshake',
  CONNECT: '/meta/connect',
  SUBSCRIBE: '/meta/subscribe',
  UNSUBSCRIBE: '/meta/unsubscribe',
  DISCONNECT: '/meta/disconnect',

  META: 'meta',
  SERVICE: 'service',

  expand: function(name) {
    var segments = this.parse(name),
      channels = ['/**', name];

    var copy = segments.slice();
    copy[copy.length - 1] = '*';
    channels.push(this.unparse(copy));

    for (var i = 1, n = segments.length; i < n; i++) {
      copy = segments.slice(0, i);
      copy.push('**');
      channels.push(this.unparse(copy));
    }

    return channels;
  },

  isValid: function(name) {
    return grammar.CHANNEL_NAME.test(name) || grammar.CHANNEL_PATTERN.test(name);
  },

  parse: function(name) {
    if (!this.isValid(name)) return null;
    return name.split('/').slice(1);
  },

  unparse: function(segments) {
    return '/' + segments.join('/');
  },

  isMeta: function(name) {
    var segments = this.parse(name);
    return segments ? segments[0] === this.META : null;
  },

  isService: function(name) {
    var segments = this.parse(name);
    return segments ? segments[0] === this.SERVICE : null;
  },

  isSubscribable: function(name) {
    if (!this.isValid(name)) return null;
    return !this.isMeta(name) && !this.isService(name);
  },

  Set: _class({
    initialize: function() {
      this._channels = {};
    },

    getKeys: function() {
      var keys = [];
      for (var key in this._channels) keys.push(key);
      return keys;
    },

    remove: function(name) {
      delete this._channels[name];
    },

    hasSubscription: function(name) {
      return this._channels.hasOwnProperty(name);
    },

    subscribe: function(names, subscription) {
      var name;
      for (var i = 0, n = names.length; i < n; i++) {
        name = names[i];
        var channel = (this._channels[name] = this._channels[name] || new Channel(name));
        channel.bind('message', subscription);
      }
    },

    unsubscribe: function(name, subscription) {
      var channel = this._channels[name];
      if (!channel) return false;
      channel.unbind('message', subscription);

      if (channel.isUnused()) {
        this.remove(name);
        return true;
      } else {
        return false;
      }
    },

    distributeMessage: function(message) {
      var channels = Channel.expand(message.channel);

      for (var i = 0, n = channels.length; i < n; i++) {
        var channel = this._channels[channels[i]];
        if (channel) channel.trigger('message', message);
      }
    }
  })
});

var channel = Channel;

var uri = {
  isURI: function(uri) {
    return uri && uri.protocol && uri.host && uri.path;
  },

  isSameOrigin: function(uri) {
    return uri.protocol === location.protocol && uri.hostname === location.hostname && uri.port === location.port;
  },

  parse: function(url) {
    if (typeof url !== 'string') return url;
    var uri = {},
      parts,
      query,
      pairs,
      i,
      n,
      data;

    var consume = function(name, pattern) {
      url = url.replace(pattern, function(match) {
        uri[name] = match;
        return '';
      });
      uri[name] = uri[name] || '';
    };

    consume('protocol', /^[a-z]+\:/i);
    consume('host', /^\/\/[^\/\?#]+/);

    if (!/^\//.test(url) && !uri.host) url = location.pathname.replace(/[^\/]*$/, '') + url;

    consume('pathname', /^[^\?#]*/);
    consume('search', /^\?[^#]*/);
    consume('hash', /^#.*/);

    uri.protocol = uri.protocol || location.protocol;

    if (uri.host) {
      uri.host = uri.host.substr(2);

      if (/@/.test(uri.host)) {
        uri.auth = uri.host.split('@')[0];
        uri.host = uri.host.split('@')[1];
      }
      parts = uri.host.match(/^\[([^\]]+)\]|^[^:]+/);
      uri.hostname = parts[1] || parts[0];
      uri.port = (uri.host.match(/:(\d+)$/) || [])[1] || '';
    } else {
      uri.host = location.host;
      uri.hostname = location.hostname;
      uri.port = location.port;
    }

    uri.pathname = uri.pathname || '/';
    uri.path = uri.pathname + uri.search;

    query = uri.search.replace(/^\?/, '');
    pairs = query ? query.split('&') : [];
    data = {};

    for (i = 0, n = pairs.length; i < n; i++) {
      parts = pairs[i].split('=');
      data[decodeURIComponent(parts[0] || '')] = decodeURIComponent(parts[1] || '');
    }

    uri.query = data;

    uri.href = this.stringify(uri);
    return uri;
  },

  stringify: function(uri) {
    var auth = uri.auth ? uri.auth + '@' : '',
      string = uri.protocol + '//' + auth + uri.host;

    string += uri.pathname + this.queryString(uri.query) + (uri.hash || '');

    return string;
  },

  queryString: function(query) {
    var pairs = [];
    for (var key in query) {
      if (!query.hasOwnProperty(key)) continue;
      pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(query[key]));
    }
    if (pairs.length === 0) return '';
    return '?' + pairs.join('&');
  }
};

var node_cookies = driver.cookie;

var timeouts = {
  addTimeout: function(name, delay, callback, context) {
    this._timeouts = this._timeouts || {};
    if (this._timeouts.hasOwnProperty(name)) return;
    var self = this;
    this._timeouts[name] = _commonjsHelpers.commonjsGlobal.setTimeout(function() {
      delete self._timeouts[name];
      callback.call(context);
    }, 1000 * delay);
  },

  removeTimeout: function(name) {
    this._timeouts = this._timeouts || {};
    var timeout = this._timeouts[name];
    if (!timeout) return;
    _commonjsHelpers.commonjsGlobal.clearTimeout(timeout);
    delete this._timeouts[name];
  },

  removeAllTimeouts: function() {
    this._timeouts = this._timeouts || {};
    for (var name in this._timeouts) this.removeTimeout(name);
  }
};

var Cookie = node_cookies.Cookie;

var Transport = assign(
  _class({
    className: 'Transport',
    DEFAULT_PORTS: { 'http:': 80, 'https:': 443, 'ws:': 80, 'wss:': 443 },
    MAX_DELAY: 0,

    batching: true,

    initialize: function(dispatcher, endpoint) {
      this._dispatcher = dispatcher;
      this.endpoint = endpoint;
      this._outbox = [];
      this._proxy = assign({}, this._dispatcher.proxy);

      if (!this._proxy.origin) this._proxy.origin = this._findProxy();
    },

    close: function() {},

    encode: function(messages) {
      return '';
    },

    sendMessage: function(message) {
      this.debug('Client ? sending message to ?: ?', this._dispatcher.clientId, this.endpoint.href, message);

      if (!this.batching) return promise.resolve(this.request([message]));

      this._outbox.push(message);
      this._flushLargeBatch();

      if (message.channel === channel.HANDSHAKE) return this._publish(0.01);

      if (message.channel === channel.CONNECT) this._connectMessage = message;

      return this._publish(this.MAX_DELAY);
    },

    _makePromise: function() {
      var self = this;

      this._requestPromise =
        this._requestPromise ||
        new promise(function(resolve) {
          self._resolvePromise = resolve;
        });
    },

    _publish: function(delay) {
      this._makePromise();

      this.addTimeout(
        'publish',
        delay,
        function() {
          this._flush();
          delete this._requestPromise;
        },
        this
      );

      return this._requestPromise;
    },

    _flush: function() {
      this.removeTimeout('publish');

      if (this._outbox.length > 1 && this._connectMessage) this._connectMessage.advice = { timeout: 0 };

      this._resolvePromise(this.request(this._outbox));

      this._connectMessage = null;
      this._outbox = [];
    },

    _flushLargeBatch: function() {
      var string = this.encode(this._outbox);
      if (string.length < this._dispatcher.maxRequestSize) return;
      var last = this._outbox.pop();

      this._makePromise();
      this._flush();

      if (last) this._outbox.push(last);
    },

    _receive: function(replies) {
      if (!replies) return;
      replies = [].concat(replies);

      this.debug(
        'Client ? received from ? via ?: ?',
        this._dispatcher.clientId,
        this.endpoint.href,
        this.connectionType,
        replies
      );

      for (var i = 0, n = replies.length; i < n; i++) this._dispatcher.handleResponse(replies[i]);
    },

    _handleError: function(messages, immediate) {
      messages = [].concat(messages);

      this.debug(
        'Client ? failed to send to ? via ?: ?',
        this._dispatcher.clientId,
        this.endpoint.href,
        this.connectionType,
        messages
      );

      for (var i = 0, n = messages.length; i < n; i++) this._dispatcher.handleError(messages[i]);
    },

    _getCookies: function() {
      var cookies = this._dispatcher.cookies,
        url = this.endpoint.href;

      if (!cookies) return '';
      this.debug('this._dispatcher.cookiesAllowAllPaths: ?', this._dispatcher.cookiesAllowAllPaths);

      const batch = this._dispatcher.cookiesAllowAllPaths
        ? cookies.getCookiesSync(url, { allPaths: true })
        : cookies.getCookiesSync(url);

      if (this._dispatcher.enableRequestResponseLogging) {
        this.debug('cookie batch: ?', batch);
      }

      return array
        .map(batch, function(cookie) {
          return cookie.cookieString();
        })
        .join('; ');
    },

    _storeCookies: function(setCookie) {
      var cookies = this._dispatcher.cookies,
        url = this.endpoint.href,
        cookie;

      if (!setCookie || !cookies) return;
      setCookie = [].concat(setCookie);

      for (var i = 0, n = setCookie.length; i < n; i++) {
        cookie = Cookie.parse(setCookie[i]);
        cookies.setCookieSync(cookie, url);
      }
    },

    _findProxy: function() {
      if (typeof process === 'undefined') return undefined;

      var protocol = this.endpoint.protocol;
      if (!protocol) return undefined;

      var name = protocol.replace(/:$/, '').toLowerCase() + '_proxy',
        upcase = name.toUpperCase(),
        env = process.env,
        keys,
        proxy;

      if (name === 'http_proxy' && env.REQUEST_METHOD) {
        keys = Object.keys(env).filter(function(k) {
          return /^http_proxy$/i.test(k);
        });
        if (keys.length === 1) {
          if (keys[0] === name && env[upcase] === undefined) proxy = env[name];
        } else if (keys.length > 1) {
          proxy = env[name];
        }
        proxy = proxy || env['CGI_' + upcase];
      } else {
        proxy = env[name] || env[upcase];
        if (proxy && !env[name])
          console.warn('The environment variable ' + upcase + ' is discouraged. Use ' + name + '.');
      }
      return proxy;
    }
  }),
  {
    get: function(dispatcher, allowed, disabled, callback, context) {
      var endpoint = dispatcher.endpoint;

      array.asyncEach(
        this._transports,
        function(pair, resume) {
          var connType = pair[0],
            klass = pair[1],
            connEndpoint = dispatcher.endpointFor(connType);

          if (array.indexOf(disabled, connType) >= 0) return resume();

          if (array.indexOf(allowed, connType) < 0) {
            klass.isUsable(dispatcher, connEndpoint, function() {});
            return resume();
          }

          klass.isUsable(dispatcher, connEndpoint, function(isUsable) {
            if (!isUsable) return resume();
            var transport = klass.hasOwnProperty('create')
              ? klass.create(dispatcher, connEndpoint)
              : new klass(dispatcher, connEndpoint);
            callback.call(context, transport);
          });
        },
        function() {
          throw new Error('Could not find a usable connection type for ' + endpoint.href);
        }
      );
    },

    register: function(type, klass) {
      this._transports.push([type, klass]);
      klass.prototype.connectionType = type;
    },

    getConnectionTypes: function() {
      return array.map(this._transports, function(t) {
        return t[0];
      });
    },

    _transports: []
  }
);

assign(Transport.prototype, logging);
assign(Transport.prototype, timeouts);

var transport = Transport;

var copyObject = function(object) {
  var clone, i, key;
  if (object instanceof Array) {
    clone = [];
    i = object.length;
    while (i--) clone[i] = copyObject(object[i]);
    return clone;
  } else if (typeof object === 'object') {
    clone = object === null ? null : {};
    for (key in object) clone[key] = copyObject(object[key]);
    return clone;
  } else {
    return object;
  }
};

var copy_object = copyObject;

var random = function(bitlength) {
  bitlength = bitlength || constants.ID_LENGTH;
  var maxLength = Math.ceil((bitlength * Math.log(2)) / Math.log(36));
  var string = driver.csprng(bitlength, 36);
  while (string.length < maxLength) string = '0' + string;
  return string;
};

var Connection = _class({
  initialize: function(engine, id, options) {
    this._engine = engine;
    this._id = id;
    this._options = options;
    this._inbox = [];
  },

  deliver: function(message) {
    delete message.clientId;
    if (this.socket) return this.socket.send(message);
    this._inbox.push(message);
    this._beginDeliveryTimeout();
  },

  connect: function(options, callback, context) {
    options = options || {};
    var timeout = options.timeout !== undefined ? options.timeout / 1000 : this._engine.timeout;

    this.setDeferredStatus('unknown');
    this.callback(callback, context);

    this._beginDeliveryTimeout();
    this._beginConnectionTimeout(timeout);
  },

  flush: function() {
    this.removeTimeout('connection');
    this.removeTimeout('delivery');

    this.setDeferredStatus('succeeded', this._inbox);
    this._inbox = [];

    if (!this.socket) this._engine.closeConnection(this._id);
  },

  _beginDeliveryTimeout: function() {
    if (this._inbox.length === 0) return;
    this.addTimeout('delivery', this._engine.MAX_DELAY, this.flush, this);
  },

  _beginConnectionTimeout: function(timeout) {
    this.addTimeout('connection', timeout, this.flush, this);
  }
});

assign(Connection.prototype, deferrable);
assign(Connection.prototype, timeouts);

var connection = Connection;

var namespace = _class({
  initialize: function() {
    this._used = {};
  },

  exists: function(id) {
    return this._used.hasOwnProperty(id);
  },

  generate: function() {
    var name = random();
    while (this._used.hasOwnProperty(name)) name = random();
    return (this._used[name] = name);
  },

  release: function(id) {
    delete this._used[id];
  }
});

var set = _class({
  initialize: function() {
    this._index = {};
  },

  add: function(item) {
    var key = item.id !== undefined ? item.id : item;
    if (this._index.hasOwnProperty(key)) return false;
    this._index[key] = item;
    return true;
  },

  forEach: function(block, context) {
    for (var key in this._index) {
      if (this._index.hasOwnProperty(key)) block.call(context, this._index[key]);
    }
  },

  isEmpty: function() {
    for (var key in this._index) {
      if (this._index.hasOwnProperty(key)) return false;
    }
    return true;
  },

  member: function(item) {
    for (var key in this._index) {
      if (this._index[key] === item) return true;
    }
    return false;
  },

  remove: function(item) {
    var key = item.id !== undefined ? item.id : item;
    var removed = this._index[key];
    delete this._index[key];
    return removed;
  },

  toArray: function() {
    var array = [];
    this.forEach(function(item) {
      array.push(item);
    });
    return array;
  }
});

var Memory = function(server, options) {
  this._server = server;
  this._options = options || {};
  this.reset();
};

Memory.create = function(server, options) {
  return new Memory(server, options);
};

Memory.prototype = {
  disconnect: function() {
    this.reset();
    this.removeAllTimeouts();
  },

  reset: function() {
    this._namespace = new namespace();
    this._clients = {};
    this._channels = {};
    this._messages = {};
  },

  createClient: function(callback, context) {
    var clientId = this._namespace.generate();
    this._server.debug('Created new client ?', clientId);
    this.ping(clientId);
    this._server.trigger('handshake', clientId);
    callback.call(context, clientId);
  },

  destroyClient: function(clientId, callback, context) {
    if (!this._namespace.exists(clientId)) return;
    var clients = this._clients;

    if (clients[clientId])
      clients[clientId].forEach(function(channel) {
        this.unsubscribe(clientId, channel);
      }, this);

    this.removeTimeout(clientId);
    this._namespace.release(clientId);
    delete this._messages[clientId];
    this._server.debug('Destroyed client ?', clientId);
    this._server.trigger('disconnect', clientId);
    this._server.trigger('close', clientId);
    if (callback) callback.call(context);
  },

  clientExists: function(clientId, callback, context) {
    callback.call(context, this._namespace.exists(clientId));
  },

  ping: function(clientId) {
    var timeout = this._server.timeout;
    if (typeof timeout !== 'number') return;

    this._server.debug('Ping ?, ?', clientId, timeout);
    this.removeTimeout(clientId);
    this.addTimeout(
      clientId,
      2 * timeout,
      function() {
        this.destroyClient(clientId);
      },
      this
    );
  },

  subscribe: function(clientId, channel, callback, context) {
    var clients = this._clients,
      channels = this._channels;

    clients[clientId] = clients[clientId] || new set();
    var trigger = clients[clientId].add(channel);

    channels[channel] = channels[channel] || new set();
    channels[channel].add(clientId);

    this._server.debug('Subscribed client ? to channel ?', clientId, channel);
    if (trigger) this._server.trigger('subscribe', clientId, channel);
    if (callback) callback.call(context, true);
  },

  unsubscribe: function(clientId, channel, callback, context) {
    var clients = this._clients,
      channels = this._channels,
      trigger = false;

    if (clients[clientId]) {
      trigger = clients[clientId].remove(channel);
      if (clients[clientId].isEmpty()) delete clients[clientId];
    }

    if (channels[channel]) {
      channels[channel].remove(clientId);
      if (channels[channel].isEmpty()) delete channels[channel];
    }

    this._server.debug('Unsubscribed client ? from channel ?', clientId, channel);
    if (trigger) this._server.trigger('unsubscribe', clientId, channel);
    if (callback) callback.call(context, true);
  },

  publish: function(message, channels) {
    this._server.debug('Publishing message ?', message);

    var messages = this._messages,
      clients = new set(),
      subs;

    for (var i = 0, n = channels.length; i < n; i++) {
      subs = this._channels[channels[i]];
      if (!subs) continue;
      subs.forEach(clients.add, clients);
    }

    clients.forEach(function(clientId) {
      this._server.debug('Queueing for client ?: ?', clientId, message);
      messages[clientId] = messages[clientId] || [];
      messages[clientId].push(copy_object(message));
      this.emptyQueue(clientId);
    }, this);

    this._server.trigger('publish', message.clientId, message.channel, message.data);
  },

  emptyQueue: function(clientId) {
    if (!this._server.hasConnection(clientId)) return;
    this._server.deliver(clientId, this._messages[clientId]);
    delete this._messages[clientId];
  }
};

assign(Memory.prototype, timeouts);

var memory = Memory;

var Proxy = assign(
  _class({
    className: 'Engine.Proxy',
    MAX_DELAY: 0,
    INTERVAL: 0,
    TIMEOUT: 60,

    initialize: function(options) {
      this._options = options || {};
      this._connections = {};
      this.interval = this._options.interval || this.INTERVAL;
      this.timeout = this._options.timeout || this.TIMEOUT;

      var engineClass = this._options.type || memory;
      this._engine = engineClass.create(this, this._options);

      this.bind(
        'close',
        function(clientId) {
          var self = this;
          driver.asap_1(function() {
            self.flushConnection(clientId);
          });
        },
        this
      );

      this.debug('Created new engine: ?', this._options);
    },

    connect: function(clientId, options, callback, context) {
      this.debug('Accepting connection from ?', clientId);
      this._engine.ping(clientId);
      var conn = this.connection(clientId, true);
      conn.connect(options, callback, context);
      this._engine.emptyQueue(clientId);
    },

    hasConnection: function(clientId) {
      return this._connections.hasOwnProperty(clientId);
    },

    connection: function(clientId, create) {
      var conn = this._connections[clientId];
      if (conn || !create) return conn;
      this._connections[clientId] = new connection(this, clientId);
      this.trigger('connection:open', clientId);
      return this._connections[clientId];
    },

    closeConnection: function(clientId) {
      this.debug('Closing connection for ?', clientId);
      var conn = this._connections[clientId];
      if (!conn) return;
      if (conn.socket) conn.socket.close();
      this.trigger('connection:close', clientId);
      delete this._connections[clientId];
    },

    openSocket: function(clientId, socket) {
      var conn = this.connection(clientId, true);
      conn.socket = socket;
    },

    deliver: function(clientId, messages) {
      if (!messages || messages.length === 0) return false;

      var conn = this.connection(clientId, false);
      if (!conn) return false;

      for (var i = 0, n = messages.length; i < n; i++) {
        conn.deliver(messages[i]);
      }
      return true;
    },

    generateId: function() {
      return random();
    },

    flushConnection: function(clientId, close) {
      if (!clientId) return;
      this.debug('Flushing connection for ?', clientId);
      var conn = this.connection(clientId, false);
      if (!conn) return;
      if (close === false) conn.socket = null;
      conn.flush();
      this.closeConnection(clientId);
    },

    close: function() {
      for (var clientId in this._connections) this.flushConnection(clientId);
      this._engine.disconnect();
    },

    disconnect: function() {
      if (this._engine.disconnect) return this._engine.disconnect();
    },

    publish: function(message) {
      var channels = channel.expand(message.channel);
      return this._engine.publish(message, channels);
    }
  }),
  {
    get: function(options) {
      return new Proxy(options);
    }
  }
);

var METHODS = ['createClient', 'clientExists', 'destroyClient', 'ping', 'subscribe', 'unsubscribe'];

METHODS.forEach(function(method) {
  Proxy.prototype[method] = function() {
    return this._engine[method].apply(this._engine, arguments);
  };
});

assign(Proxy.prototype, publisher);
assign(Proxy.prototype, logging);

var proxy = Proxy;

var Error$1 = _class({
  initialize: function(code, params, message) {
    this.code = code;
    this.params = Array.prototype.slice.call(params);
    this.message = message;
  },

  toString: function() {
    return this.code + ':' + this.params.join(',') + ':' + this.message;
  }
});

Error$1.parse = function(message) {
  message = message || '';
  if (!grammar.ERROR.test(message)) return new Error$1(null, [], message);

  var parts = message.split(':'),
    code = parseInt(parts[0]),
    params = parts[1].split(','),
    message = parts[2];

  return new Error$1(code, params, message);
};

// http://code.google.com/p/cometd/wiki/BayeuxCodes
var errors = {
  versionMismatch: [300, 'Version mismatch'],
  conntypeMismatch: [301, 'Connection types not supported'],
  extMismatch: [302, 'Extension mismatch'],
  badRequest: [400, 'Bad request'],
  clientUnknown: [401, 'Unknown client'],
  parameterMissing: [402, 'Missing required parameter'],
  channelForbidden: [403, 'Forbidden channel'],
  channelUnknown: [404, 'Unknown channel'],
  channelInvalid: [405, 'Invalid channel'],
  extUnknown: [406, 'Unknown extension'],
  publishFailed: [407, 'Failed to publish'],
  serverError: [500, 'Internal server error']
};

for (var name in errors)
  (function(name) {
    Error$1[name] = function() {
      return new Error$1(errors[name][0], arguments, errors[name][1]).toString();
    };
  })(name);

var error = Error$1;

var Extensible = {
  addExtension: function(extension) {
    this._extensions = this._extensions || [];
    this._extensions.push(extension);
    if (extension.added) extension.added(this);
  },

  removeExtension: function(extension) {
    if (!this._extensions) return;
    var i = this._extensions.length;
    while (i--) {
      if (this._extensions[i] !== extension) continue;
      this._extensions.splice(i, 1);
      if (extension.removed) extension.removed(this);
    }
  },

  pipeThroughExtensions: function(stage, message, request, callback, context) {
    this.debug('Passing through ? extensions: ?', stage, message);

    if (!this._extensions) return callback.call(context, message);
    var extensions = this._extensions.slice();

    var pipe = function(message) {
      if (!message) return callback.call(context, message);

      var extension = extensions.shift();
      if (!extension) return callback.call(context, message);

      var fn = extension[stage];
      if (!fn) return pipe(message);

      if (fn.length >= 3) extension[stage](message, request, pipe);
      else extension[stage](message, pipe);
    };
    pipe(message);
  }
};

assign(Extensible, logging);

var extensible = Extensible;

var socket = _class({
  initialize: function(server, socket, request) {
    this._server = server;
    this._socket = socket;
    this._request = request;
  },

  send: function(message) {
    this._server.pipeThroughExtensions(
      'outgoing',
      message,
      this._request,
      function(pipedMessage) {
        if (this._socket) this._socket.send(to_json([pipedMessage]));
      },
      this
    );
  },

  close: function() {
    if (this._socket) this._socket.close();
    delete this._socket;
  }
});

var Server = _class({
  className: 'Server',
  META_METHODS: ['handshake', 'connect', 'disconnect', 'subscribe', 'unsubscribe'],

  initialize: function(options) {
    this._options = options || {};
    var engineOpts = this._options.engine || {};
    engineOpts.timeout = this._options.timeout;
    this._engine = proxy.get(engineOpts);

    this.info('Created new server: ?', this._options);
  },

  close: function() {
    return this._engine.close();
  },

  openSocket: function(clientId, socket$1, request) {
    if (!clientId || !socket$1) return;
    this._engine.openSocket(clientId, new socket(this, socket$1, request));
  },

  closeSocket: function(clientId, close) {
    this._engine.flushConnection(clientId, close);
  },

  process: function(messages, request, callback, context) {
    var local = request === null;

    messages = [].concat(messages);
    this.info('Processing messages: ? (local: ?)', messages, local);

    if (messages.length === 0) return callback.call(context, []);
    var processed = 0,
      responses = [],
      self = this;

    var gatherReplies = function(replies) {
      responses = responses.concat(replies);
      processed += 1;
      if (processed < messages.length) return;

      var n = responses.length;
      while (n--) {
        if (!responses[n]) responses.splice(n, 1);
      }
      self.info('Returning replies: ?', responses);
      callback.call(context, responses);
    };

    var handleReply = function(replies) {
      var assigned = 0,
        expected = replies.length;
      if (expected === 0) gatherReplies(replies);

      for (var i = 0, n = replies.length; i < n; i++) {
        this.debug('Processing reply: ?', replies[i]);
        (function(index) {
          self.pipeThroughExtensions('outgoing', replies[index], request, function(message) {
            replies[index] = message;
            assigned += 1;
            if (assigned === expected) gatherReplies(replies);
          });
        })(i);
      }
    };

    for (var i = 0, n = messages.length; i < n; i++) {
      this.pipeThroughExtensions(
        'incoming',
        messages[i],
        request,
        function(pipedMessage) {
          this._handle(pipedMessage, local, handleReply, this);
        },
        this
      );
    }
  },

  _makeResponse: function(message) {
    var response = {};

    if (message.id) response.id = message.id;
    if (message.clientId) response.clientId = message.clientId;
    if (message.channel) response.channel = message.channel;
    if (message.error) response.error = message.error;

    response.successful = !response.error;
    return response;
  },

  _handle: function(message, local, callback, context) {
    if (!message) return callback.call(context, []);
    this.info('Handling message: ? (local: ?)', message, local);

    var channelName = message.channel,
      error$1 = message.error,
      response;

    if (channel.isMeta(channelName)) return this._handleMeta(message, local, callback, context);

    if (!grammar.CHANNEL_NAME.test(channelName)) error$1 = error.channelInvalid(channelName);

    if (message.data === undefined) error$1 = error.parameterMissing('data');

    if (!error$1) this._engine.publish(message);

    response = this._makeResponse(message);
    if (error$1) response.error = error$1;
    response.successful = !response.error;
    callback.call(context, [response]);
  },

  _handleMeta: function(message, local, callback, context) {
    var method = channel.parse(message.channel)[1],
      response;

    if (array.indexOf(this.META_METHODS, method) < 0) {
      response = this._makeResponse(message);
      response.error = error.channelForbidden(message.channel);
      response.successful = false;
      return callback.call(context, [response]);
    }

    this[method](
      message,
      local,
      function(responses) {
        responses = [].concat(responses);
        for (var i = 0, n = responses.length; i < n; i++) this._advize(responses[i], message.connectionType);
        callback.call(context, responses);
      },
      this
    );
  },

  _advize: function(response, connectionType) {
    if (array.indexOf([channel.HANDSHAKE, channel.CONNECT], response.channel) < 0) return;

    var interval, timeout;
    if (connectionType === 'eventsource') {
      interval = Math.floor(this._engine.timeout * 1000);
      timeout = 0;
    } else {
      interval = Math.floor(this._engine.interval * 1000);
      timeout = Math.floor(this._engine.timeout * 1000);
    }

    response.advice = response.advice || {};
    if (response.error) {
      assign(response.advice, { reconnect: 'handshake' }, false);
    } else {
      assign(
        response.advice,
        {
          reconnect: 'retry',
          interval: interval,
          timeout: timeout
        },
        false
      );
    }
  },

  // MUST contain  * version
  //               * supportedConnectionTypes
  // MAY contain   * minimumVersion
  //               * ext
  //               * id
  handshake: function(message, local, callback, context) {
    var response = this._makeResponse(message);
    response.version = constants.BAYEUX_VERSION;

    if (!message.version) response.error = error.parameterMissing('version');

    var clientConns = message.supportedConnectionTypes,
      commonConns;

    response.supportedConnectionTypes = constants.CONNECTION_TYPES;

    if (clientConns) {
      commonConns = array.filter(clientConns, function(conn) {
        return array.indexOf(constants.CONNECTION_TYPES, conn) >= 0;
      });
      if (commonConns.length === 0) response.error = error.conntypeMismatch(clientConns);
    } else {
      response.error = error.parameterMissing('supportedConnectionTypes');
    }

    response.successful = !response.error;
    if (!response.successful) return callback.call(context, response);

    this._engine.createClient(function(clientId) {
      response.clientId = clientId;
      callback.call(context, response);
    }, this);
  },

  // MUST contain  * clientId
  //               * connectionType
  // MAY contain   * ext
  //               * id
  connect: function(message, local, callback, context) {
    var response = this._makeResponse(message),
      clientId = message.clientId,
      connectionType = message.connectionType;

    this._engine.clientExists(
      clientId,
      function(exists) {
        if (!exists) response.error = error.clientUnknown(clientId);
        if (!clientId) response.error = error.parameterMissing('clientId');

        if (array.indexOf(constants.CONNECTION_TYPES, connectionType) < 0)
          response.error = error.conntypeMismatch(connectionType);

        if (!connectionType) response.error = error.parameterMissing('connectionType');

        response.successful = !response.error;

        if (!response.successful) {
          delete response.clientId;
          return callback.call(context, response);
        }

        if (message.connectionType === 'eventsource') {
          message.advice = message.advice || {};
          message.advice.timeout = 0;
        }
        this._engine.connect(response.clientId, message.advice, function(events) {
          callback.call(context, [response].concat(events));
        });
      },
      this
    );
  },

  // MUST contain  * clientId
  // MAY contain   * ext
  //               * id
  disconnect: function(message, local, callback, context) {
    var response = this._makeResponse(message),
      clientId = message.clientId;

    this._engine.clientExists(
      clientId,
      function(exists) {
        if (!exists) response.error = error.clientUnknown(clientId);
        if (!clientId) response.error = error.parameterMissing('clientId');

        response.successful = !response.error;
        if (!response.successful) delete response.clientId;

        if (response.successful) this._engine.destroyClient(clientId);
        callback.call(context, response);
      },
      this
    );
  },

  // MUST contain  * clientId
  //               * subscription
  // MAY contain   * ext
  //               * id
  subscribe: function(message, local, callback, context) {
    var response = this._makeResponse(message),
      clientId = message.clientId,
      subscription = message.subscription,
      channel$1;

    subscription = subscription ? [].concat(subscription) : [];

    this._engine.clientExists(
      clientId,
      function(exists) {
        if (!exists) response.error = error.clientUnknown(clientId);
        if (!clientId) response.error = error.parameterMissing('clientId');
        if (!message.subscription) response.error = error.parameterMissing('subscription');

        response.subscription = message.subscription || [];

        for (var i = 0, n = subscription.length; i < n; i++) {
          channel$1 = subscription[i];

          if (response.error) break;
          if (!local && !channel.isSubscribable(channel$1)) response.error = error.channelForbidden(channel$1);
          if (!channel.isValid(channel$1)) response.error = error.channelInvalid(channel$1);

          if (response.error) break;
          this._engine.subscribe(clientId, channel$1);
        }

        response.successful = !response.error;
        callback.call(context, response);
      },
      this
    );
  },

  // MUST contain  * clientId
  //               * subscription
  // MAY contain   * ext
  //               * id
  unsubscribe: function(message, local, callback, context) {
    var response = this._makeResponse(message),
      clientId = message.clientId,
      subscription = message.subscription,
      channel$1;

    subscription = subscription ? [].concat(subscription) : [];

    this._engine.clientExists(
      clientId,
      function(exists) {
        if (!exists) response.error = error.clientUnknown(clientId);
        if (!clientId) response.error = error.parameterMissing('clientId');
        if (!message.subscription) response.error = error.parameterMissing('subscription');

        response.subscription = message.subscription || [];

        for (var i = 0, n = subscription.length; i < n; i++) {
          channel$1 = subscription[i];

          if (response.error) break;
          if (!local && !channel.isSubscribable(channel$1)) response.error = error.channelForbidden(channel$1);
          if (!channel.isValid(channel$1)) response.error = error.channelInvalid(channel$1);

          if (response.error) break;
          this._engine.unsubscribe(clientId, channel$1);
        }

        response.successful = !response.error;
        callback.call(context, response);
      },
      this
    );
  }
});

Server.create = function(options) {
  return new Server(options);
};

assign(Server.prototype, logging);
assign(Server.prototype, extensible);

var server = Server;

var NodeLocal = assign(
  _class(transport, {
    batching: false,

    request: function(messages) {
      messages = copy_object(messages);
      var self = this;

      driver.asap_1(function() {
        self.endpoint.process(messages, null, function(replies) {
          self._receive(copy_object(replies));
        });
      });
    }
  }),
  {
    isUsable: function(client, endpoint, callback, context) {
      callback.call(context, endpoint instanceof server);
    }
  }
);

var node_local = NodeLocal;

var Event = function(eventType, options) {
  this.type = eventType;
  for (var key in options) this[key] = options[key];
};

Event.prototype.initEvent = function(eventType, canBubble, cancelable) {
  this.type = eventType;
  this.bubbles = canBubble;
  this.cancelable = cancelable;
};

Event.prototype.stopPropagation = function() {};
Event.prototype.preventDefault = function() {};

Event.CAPTURING_PHASE = 1;
Event.AT_TARGET = 2;
Event.BUBBLING_PHASE = 3;

var event = Event;

var EventTarget = {
  onopen: null,
  onmessage: null,
  onerror: null,
  onclose: null,

  addEventListener: function(eventType, listener, useCapture) {
    this.on(eventType, listener);
  },

  removeEventListener: function(eventType, listener, useCapture) {
    this.removeListener(eventType, listener);
  },

  dispatchEvent: function(event$1) {
    event$1.target = event$1.currentTarget = this;
    event$1.eventPhase = event.AT_TARGET;

    if (this['on' + event$1.type]) this['on' + event$1.type](event$1);

    this.emit(event$1.type, event$1);
  }
};

var event_target = EventTarget;

var Stream = Stream__default['default'].Stream;

var API = function(options) {
  options = options || {};
  driver.driver.validateOptions(options, ['headers', 'extensions', 'maxLength', 'ping', 'proxy', 'tls', 'ca']);

  this.readable = this.writable = true;

  var headers = options.headers;
  if (headers) {
    for (var name in headers) this._driver.setHeader(name, headers[name]);
  }

  var extensions = options.extensions;
  if (extensions) {
    [].concat(extensions).forEach(this._driver.addExtension, this._driver);
  }

  this._ping = options.ping;
  this._pingId = 0;
  this.readyState = API.CONNECTING;
  this.bufferedAmount = 0;
  this.protocol = '';
  this.url = this._driver.url;
  this.version = this._driver.version;

  var self = this;

  this._driver.on('open', function(e) {
    self._open();
  });
  this._driver.on('message', function(e) {
    self._receiveMessage(e.data);
  });
  this._driver.on('close', function(e) {
    self._beginClose(e.reason, e.code);
  });

  this._driver.on('error', function(error) {
    self._emitError(error.message);
  });
  this.on('error', function() {});

  this._driver.messages.on('drain', function() {
    self.emit('drain');
  });

  if (this._ping)
    this._pingTimer = setInterval(function() {
      self._pingId += 1;
      self.ping(self._pingId.toString());
    }, this._ping * 1000);

  this._configureStream();

  if (!this._proxy) {
    this._stream.pipe(this._driver.io);
    this._driver.io.pipe(this._stream);
  }
};
util__default['default'].inherits(API, Stream);

API.CONNECTING = 0;
API.OPEN = 1;
API.CLOSING = 2;
API.CLOSED = 3;

var instance = {
  write: function(data) {
    return this.send(data);
  },

  end: function(data) {
    if (data !== undefined) this.send(data);
    this.close();
  },

  pause: function() {
    return this._driver.messages.pause();
  },

  resume: function() {
    return this._driver.messages.resume();
  },

  send: function(data) {
    if (this.readyState > API.OPEN) return false;
    if (!(data instanceof Buffer)) data = String(data);
    return this._driver.messages.write(data);
  },

  ping: function(message, callback) {
    if (this.readyState > API.OPEN) return false;
    return this._driver.ping(message, callback);
  },

  close: function() {
    if (this.readyState !== API.CLOSED) this.readyState = API.CLOSING;
    this._driver.close();
  },

  _configureStream: function() {
    var self = this;

    this._stream.setTimeout(0);
    this._stream.setNoDelay(true);

    ['close', 'end'].forEach(function(event) {
      this._stream.on(event, function() {
        self._finalizeClose();
      });
    }, this);

    this._stream.on('error', function(error) {
      self._emitError('Network error: ' + self.url + ': ' + error.message);
      self._finalizeClose();
    });
  },

  _open: function() {
    if (this.readyState !== API.CONNECTING) return;

    this.readyState = API.OPEN;
    this.protocol = this._driver.protocol || '';

    var event$1 = new event('open');
    event$1.initEvent('open', false, false);
    this.dispatchEvent(event$1);
  },

  _receiveMessage: function(data) {
    if (this.readyState > API.OPEN) return false;

    if (this.readable) this.emit('data', data);

    var event$1 = new event('message', { data: data });
    event$1.initEvent('message', false, false);
    this.dispatchEvent(event$1);
  },

  _emitError: function(message) {
    if (this.readyState >= API.CLOSING) return;

    var event$1 = new event('error', { message: message });
    event$1.initEvent('error', false, false);
    this.dispatchEvent(event$1);
  },

  _beginClose: function(reason, code) {
    if (this.readyState === API.CLOSED) return;
    this.readyState = API.CLOSING;

    if (this._stream) {
      this._stream.end();
      if (!this._stream.readable) this._finalizeClose();
    }
    this._closeParams = [reason, code];
  },

  _finalizeClose: function() {
    if (this.readyState === API.CLOSED) return;
    this.readyState = API.CLOSED;

    if (this._pingTimer) clearInterval(this._pingTimer);
    if (this._stream) this._stream.end();

    if (this.readable) this.emit('end');
    this.readable = this.writable = false;

    var reason = this._closeParams ? this._closeParams[0] : '',
      code = this._closeParams ? this._closeParams[1] : 1006;

    var event$1 = new event('close', { code: code, reason: reason });
    event$1.initEvent('close', false, false);
    this.dispatchEvent(event$1);
  }
};

for (var method in instance) API.prototype[method] = instance[method];
for (var key$1 in event_target) API.prototype[key$1] = event_target[key$1];

var api = API;

var DEFAULT_PORTS = { 'http:': 80, 'https:': 443, 'ws:': 80, 'wss:': 443 },
  SECURE_PROTOCOLS = ['https:', 'wss:'];

var Client = function(_url, protocols, options) {
  options = options || {};

  this.url = _url;
  this._driver = driver.driver.client(this.url, { maxLength: options.maxLength, protocols: protocols });

  ['open', 'error'].forEach(function(event) {
    this._driver.on(event, function() {
      self.headers = self._driver.headers;
      self.statusCode = self._driver.statusCode;
    });
  }, this);

  var proxy = options.proxy || {},
    endpoint = url__default['default'].parse(proxy.origin || this.url),
    port = endpoint.port || DEFAULT_PORTS[endpoint.protocol],
    secure = SECURE_PROTOCOLS.indexOf(endpoint.protocol) >= 0,
    onConnect = function() {
      self._onConnect();
    },
    originTLS = options.tls || {},
    socketTLS = proxy.origin ? proxy.tls || {} : originTLS,
    self = this;

  originTLS.ca = originTLS.ca || options.ca;

  this._stream = secure
    ? tls__default['default'].connect(port, endpoint.hostname, socketTLS, onConnect)
    : net__default['default'].connect(port, endpoint.hostname, onConnect);

  if (proxy.origin) this._configureProxy(proxy, originTLS);

  api.call(this, options);
};
util__default['default'].inherits(Client, api);

Client.prototype._onConnect = function() {
  var worker = this._proxy || this._driver;
  worker.start();
};

Client.prototype._configureProxy = function(proxy, originTLS) {
  var uri = url__default['default'].parse(this.url),
    secure = SECURE_PROTOCOLS.indexOf(uri.protocol) >= 0,
    self = this,
    name;

  this._proxy = this._driver.proxy(proxy.origin);

  if (proxy.headers) {
    for (name in proxy.headers) this._proxy.setHeader(name, proxy.headers[name]);
  }

  this._proxy.pipe(
    this._stream,
    { end: false }
  );
  this._stream.pipe(this._proxy);

  this._proxy.on('connect', function() {
    if (secure) {
      var options = { socket: self._stream, servername: uri.hostname };
      for (name in originTLS) options[name] = originTLS[name];
      self._stream = tls__default['default'].connect(options);
      self._configureStream();
    }
    self._driver.io.pipe(self._stream);
    self._stream.pipe(self._driver.io);
    self._driver.start();
  });

  this._proxy.on('error', function(error) {
    self._driver.emit('error', error);
  });
};

var client = Client;

var Stream$1 = Stream__default['default'].Stream;

var EventSource = function(request, response, options) {
  this.writable = true;
  options = options || {};

  this._stream = response.socket;
  this._ping = options.ping || this.DEFAULT_PING;
  this._retry = options.retry || this.DEFAULT_RETRY;

  var scheme = driver.driver.isSecureRequest(request) ? 'https:' : 'http:';
  this.url = scheme + '//' + request.headers.host + request.url;
  this.lastEventId = request.headers['last-event-id'] || '';
  this.readyState = api.CONNECTING;

  var headers = new driver.headers(),
    self = this;

  if (options.headers) {
    for (var key in options.headers) headers.set(key, options.headers[key]);
  }

  if (!this._stream || !this._stream.writable) return;
  process.nextTick(function() {
    self._open();
  });

  this._stream.setTimeout(0);
  this._stream.setNoDelay(true);

  var handshake =
    'HTTP/1.1 200 OK\r\n' +
    'Content-Type: text/event-stream\r\n' +
    'Cache-Control: no-cache, no-store\r\n' +
    'Connection: close\r\n' +
    headers.toString() +
    '\r\n' +
    'retry: ' +
    Math.floor(this._retry * 1000) +
    '\r\n\r\n';

  this._write(handshake);

  this._stream.on('drain', function() {
    self.emit('drain');
  });

  if (this._ping)
    this._pingTimer = setInterval(function() {
      self.ping();
    }, this._ping * 1000);

  ['error', 'end'].forEach(function(event) {
    self._stream.on(event, function() {
      self.close();
    });
  });
};
util__default['default'].inherits(EventSource, Stream$1);

EventSource.isEventSource = function(request) {
  if (request.method !== 'GET') return false;
  var accept = (request.headers.accept || '').split(/\s*,\s*/);
  return accept.indexOf('text/event-stream') >= 0;
};

var instance$1 = {
  DEFAULT_PING: 10,
  DEFAULT_RETRY: 5,

  _write: function(chunk) {
    if (!this.writable) return false;
    try {
      return this._stream.write(chunk, 'utf8');
    } catch (e) {
      return false;
    }
  },

  _open: function() {
    if (this.readyState !== api.CONNECTING) return;

    this.readyState = api.OPEN;

    var event$1 = new event('open');
    event$1.initEvent('open', false, false);
    this.dispatchEvent(event$1);
  },

  write: function(message) {
    return this.send(message);
  },

  end: function(message) {
    if (message !== undefined) this.write(message);
    this.close();
  },

  send: function(message, options) {
    if (this.readyState > api.OPEN) return false;

    message = String(message).replace(/(\r\n|\r|\n)/g, '$1data: ');
    options = options || {};

    var frame = '';
    if (options.event) frame += 'event: ' + options.event + '\r\n';
    if (options.id) frame += 'id: ' + options.id + '\r\n';
    frame += 'data: ' + message + '\r\n\r\n';

    return this._write(frame);
  },

  ping: function() {
    return this._write(':\r\n\r\n');
  },

  close: function() {
    if (this.readyState > api.OPEN) return false;

    this.readyState = api.CLOSED;
    this.writable = false;
    if (this._pingTimer) clearInterval(this._pingTimer);
    if (this._stream) this._stream.end();

    var event$1 = new event('close');
    event$1.initEvent('close', false, false);
    this.dispatchEvent(event$1);

    return true;
  }
};

for (var method$1 in instance$1) EventSource.prototype[method$1] = instance$1[method$1];
for (var key$2 in event_target) EventSource.prototype[key$2] = event_target[key$2];

var eventsource = EventSource;

// API references:
//
// * http://dev.w3.org/html5/websockets/
// * http://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#interface-eventtarget
// * http://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#interface-event

var WebSocket = function(request, socket, body, protocols, options) {
  options = options || {};

  this._stream = socket;
  this._driver = driver.driver.http(request, { maxLength: options.maxLength, protocols: protocols });

  var self = this;
  if (!this._stream || !this._stream.writable) return;
  if (!this._stream.readable) return this._stream.end();

  var catchup = function() {
    self._stream.removeListener('data', catchup);
  };
  this._stream.on('data', catchup);

  api.call(this, options);

  process.nextTick(function() {
    self._driver.start();
    self._driver.io.write(body);
  });
};
util__default['default'].inherits(WebSocket, api);

WebSocket.isWebSocket = function(request) {
  return driver.driver.isWebSocket(request);
};

WebSocket.validateOptions = function(options, validKeys) {
  driver.driver.validateOptions(options, validKeys);
};

WebSocket.WebSocket = WebSocket;
WebSocket.Client = client;
WebSocket.EventSource = eventsource;

var websocket = WebSocket;

var WS = websocket.Client;

var node_websocket = {
  create: function(url, protocols, options) {
    return new WS(url, protocols, options);
  }
};

var WebSocket$1 = assign(
  _class(transport, {
    UNCONNECTED: 1,
    CONNECTING: 2,
    CONNECTED: 3,

    batching: false,

    isUsable: function(callback, context) {
      this.callback(function() {
        callback.call(context, true);
      });
      this.errback(function() {
        callback.call(context, false);
      });
      this.connect();
    },

    request: function(messages) {
      this._pending = this._pending || new set();
      for (var i = 0, n = messages.length; i < n; i++) this._pending.add(messages[i]);

      var self = this;

      var promise$1 = new promise(function(resolve, reject) {
        self.callback(function(socket) {
          if (!socket || socket.readyState !== 1) return;
          socket.send(to_json(messages));
          resolve(socket);
        });

        self.connect();
      });

      return {
        abort: function() {
          promise$1.then(function(ws) {
            ws.close();
          });
        }
      };
    },

    connect: function() {
      if (WebSocket$1._unloaded) return;

      this._state = this._state || this.UNCONNECTED;
      if (this._state !== this.UNCONNECTED) return;
      this._state = this.CONNECTING;

      var socket = this._createSocket();
      if (!socket) return this.setDeferredStatus('failed');

      var self = this;

      socket.onopen = function() {
        if (socket.headers) self._storeCookies(socket.headers['set-cookie']);
        self._socket = socket;
        self._state = self.CONNECTED;
        self._everConnected = true;
        self._ping();
        self.setDeferredStatus('succeeded', socket);
      };

      var closed = false;
      socket.onclose = socket.onerror = function() {
        if (closed) return;
        closed = true;

        var wasConnected = self._state === self.CONNECTED;
        socket.onopen = socket.onclose = socket.onerror = socket.onmessage = null;

        delete self._socket;
        self._state = self.UNCONNECTED;
        self.removeTimeout('ping');

        var pending = self._pending ? self._pending.toArray() : [];
        delete self._pending;

        if (wasConnected || self._everConnected) {
          self.setDeferredStatus('unknown');
          self._handleError(pending, wasConnected);
        } else {
          self.setDeferredStatus('failed');
        }
      };

      socket.onmessage = function(event) {
        var replies;
        try {
          replies = JSON.parse(event.data);
        } catch (error) {}

        if (!replies) return;

        replies = [].concat(replies);

        for (var i = 0, n = replies.length; i < n; i++) {
          if (replies[i].successful === undefined) continue;
          self._pending.remove(replies[i]);
        }
        self._receive(replies);
      };
    },

    close: function() {
      if (!this._socket) return;
      this._socket.close();
    },

    _createSocket: function() {
      var url = WebSocket$1.getSocketUrl(this.endpoint),
        headers = this._dispatcher.headers,
        extensions = this._dispatcher.wsExtensions,
        cookie = this._getCookies(),
        tls = this._dispatcher.tls,
        options = { extensions: extensions, headers: headers, proxy: this._proxy, tls: tls };

      if (cookie !== '') options.headers['Cookie'] = cookie;

      try {
        return node_websocket.create(url, [], options);
      } catch (e) {
        // catch CSP error to allow transport to fallback to next connType
      }
    },

    _ping: function() {
      if (!this._socket || this._socket.readyState !== 1) return;
      this._socket.send('[]');
      this.addTimeout('ping', this._dispatcher.timeout / 2, this._ping, this);
    }
  }),
  {
    PROTOCOLS: {
      'http:': 'ws:',
      'https:': 'wss:'
    },

    create: function(dispatcher, endpoint) {
      var sockets = (dispatcher.transports.websocket = dispatcher.transports.websocket || {});
      sockets[endpoint.href] = sockets[endpoint.href] || new this(dispatcher, endpoint);
      return sockets[endpoint.href];
    },

    getSocketUrl: function(endpoint) {
      endpoint = copy_object(endpoint);
      endpoint.protocol = this.PROTOCOLS[endpoint.protocol];
      return uri.stringify(endpoint);
    },

    isUsable: function(dispatcher, endpoint, callback, context) {
      this.create(dispatcher, endpoint).isUsable(callback, context);
    }
  }
);

assign(WebSocket$1.prototype, deferrable);

var web_socket = WebSocket$1;

var NodeHttp = assign(
  _class(transport, {
    className: 'NodeHttp',
    SECURE_PROTOCOLS: ['https:', 'wss:'],

    initialize: function() {
      transport.prototype.initialize.apply(this, arguments);

      this._endpointSecure = this.SECURE_PROTOCOLS.indexOf(this.endpoint.protocol) >= 0;
      this._httpClient = this._endpointSecure ? https__default['default'] : http__default['default'];

      var proxy = this._proxy;
      if (!proxy.origin) return;

      this._proxyUri = uri.parse(proxy.origin);
      this._proxySecure = this.SECURE_PROTOCOLS.indexOf(this._proxyUri.protocol) >= 0;

      if (!this._endpointSecure) {
        this._httpClient = this._proxySecure ? https__default['default'] : http__default['default'];
        return;
      }

      var options = assign(
        {
          proxy: {
            host: this._proxyUri.hostname,
            port: this._proxyUri.port || this.DEFAULT_PORTS[this._proxyUri.protocol],
            proxyAuth: this._proxyUri.auth,
            headers: assign({ host: this.endpoint.host }, proxy.headers)
          }
        },
        this._dispatcher.tls
      );

      if (this._proxySecure) {
        assign(options.proxy, proxy.tls);
        this._tunnel = driver.tunnelAgent.httpsOverHttps(options);
      } else {
        this._tunnel = driver.tunnelAgent.httpsOverHttp(options);
      }
    },

    encode: function(messages) {
      return to_json(messages);
    },

    request: function(messages) {
      var content = Buffer.from(this.encode(messages), 'utf8'),
        params = this._buildParams(content),
        request = this._httpClient.request(params),
        self = this;

      if (this._dispatcher.enableRequestResponseLogging) {
        let reqLogLine = `${os__default['default'].EOL}----------------------- Begin Faye Request -----------------`;
        reqLogLine += `${os__default['default'].EOL}params: ${JSON.stringify(params, null, 4)}`;
        reqLogLine += `${os__default['default'].EOL}params: ${JSON.stringify(messages, null, 4)}`;
        reqLogLine += `${os__default['default'].EOL}----------------------- End Faye Request ----------------`;
        this.debug(reqLogLine);
      }

      request.on('response', function(response) {
        self._handleResponse(messages, response);
        self._storeCookies(response.headers['set-cookie']);
      });

      request.on('error', function(error) {
        self.error('HTTP error: ' + error.message);
        self._handleError(messages);
      });

      request.end(content);
      return request;
    },

    _buildParams: function(content) {
      var uri = this.endpoint,
        proxy = this._proxyUri,
        target = this._tunnel ? uri : proxy || uri;

      var headers = {
        'Content-Length': content.length,
        'Content-Type': 'application/json',
        Host: uri.host
      };

      if (uri.auth) headers['Authorization'] = 'Basic ' + Buffer.from(uri.auth, 'utf8').toString('base64');

      var params = {
        method: 'POST',
        host: target.hostname,
        port: target.port || this.DEFAULT_PORTS[target.protocol],
        path: uri.path,
        headers: assign(headers, this._dispatcher.headers)
      };

      var cookie = this._getCookies();
      if (cookie !== '') params.headers['Cookie'] = cookie;

      if (this._tunnel) {
        params.agent = this._tunnel;
      } else if (this._endpointSecure) {
        assign(params, this._dispatcher.tls);
      } else if (proxy) {
        params.path = this.endpoint.href;
        assign(params, this._proxy.tls);
        if (proxy.auth) params.headers['Proxy-Authorization'] = Buffer.from(proxy.auth, 'utf8').toString('base64');
      }

      return params;
    },

    _handleResponse: function(messages, response) {
      var body = '',
        self = this;

      response.setEncoding('utf8');
      response.on('data', function(chunk) {
        body += chunk;
      });

      response.on('end', function() {
        if (self._dispatcher.enableRequestResponseLogging) {
          var respLogLine = `${os__default['default'].EOL}----------------------- Begin Faye Response -----------------`;
          respLogLine += `${os__default['default'].EOL}response headers: ${JSON.stringify(response.headers, null, 4)}`;
          respLogLine += `${os__default['default'].EOL}response: ${body}`;
          respLogLine += `${os__default['default'].EOL}messages: ${JSON.stringify(messages, null, 4)}`;
          respLogLine += `${os__default['default'].EOL}----------------------- End Faye Response ----------------`;
          self.debug(respLogLine);
        }

        var replies;
        try {
          replies = JSON.parse(body);
        } catch (error) {}

        if (replies) self._receive(replies);
        else self._handleError(messages);
      });
    }
  }),
  {
    isUsable: function(dispatcher, endpoint, callback, context) {
      callback.call(context, uri.isURI(endpoint));
    }
  }
);

var node_http = NodeHttp;

transport.register('in-process', node_local);
transport.register('websocket', web_socket);
transport.register('long-polling', node_http);

var node_transports = transport;

var Scheduler = function(message, options) {
  this.message = message;
  this.options = options;
  this.attempts = 0;
};

assign(Scheduler.prototype, {
  getTimeout: function() {
    return this.options.timeout;
  },

  getInterval: function() {
    return this.options.interval;
  },

  isDeliverable: function() {
    var attempts = this.options.attempts,
      made = this.attempts,
      deadline = this.options.deadline,
      now = new Date().getTime();

    if (attempts !== undefined && made >= attempts) return false;

    if (deadline !== undefined && now > deadline) return false;

    return true;
  },

  send: function() {
    this.attempts += 1;
  },

  succeed: function() {},

  fail: function() {},

  abort: function() {}
});

var scheduler = Scheduler;

var Dispatcher = _class({
  className: 'Dispatcher',
  MAX_REQUEST_SIZE: 2048,
  DEFAULT_RETRY: 5,

  UP: 1,
  DOWN: 2,

  initialize: function(client, endpoint, options) {
    this._client = client;
    this.endpoint = uri.parse(endpoint);
    this._alternates = options.endpoints || {};

    this.cookies = node_cookies.CookieJar && new node_cookies.CookieJar();
    this._disabled = [];
    this._envelopes = {};
    this.headers = {};
    this.retry = options.retry || this.DEFAULT_RETRY;
    this._scheduler = options.scheduler || scheduler;
    this._state = 0;
    this.transports = {};
    this.wsExtensions = [];
    this.cookiesAllowAllPaths = options.cookiesAllowAllPaths || false;
    this.enableRequestResponseLogging = options.enableRequestResponseLogging || false;

    this.debug('options.cookiesAllowAllPaths: ' + options.cookiesAllowAllPaths);
    this.debug('options.enableRequestResponseLogging: ' + options.enableRequestResponseLogging);

    this.proxy = options.proxy || {};
    if (typeof this._proxy === 'string') this._proxy = { origin: this._proxy };

    var exts = options.websocketExtensions;
    if (exts) {
      exts = [].concat(exts);
      for (var i = 0, n = exts.length; i < n; i++) this.addWebsocketExtension(exts[i]);
    }

    this.tls = options.tls || {};
    this.tls.ca = this.tls.ca || options.ca;

    for (var type in this._alternates) this._alternates[type] = uri.parse(this._alternates[type]);

    this.maxRequestSize = this.MAX_REQUEST_SIZE;
  },

  endpointFor: function(connectionType) {
    return this._alternates[connectionType] || this.endpoint;
  },

  addWebsocketExtension: function(extension) {
    this.wsExtensions.push(extension);
  },

  disable: function(feature) {
    this._disabled.push(feature);
  },

  setHeader: function(name, value) {
    this.headers[name] = value;
  },

  close: function() {
    var transport = this._transport;
    delete this._transport;
    if (transport) transport.close();
  },

  getConnectionTypes: function() {
    return node_transports.getConnectionTypes();
  },

  selectTransport: function(transportTypes) {
    node_transports.get(
      this,
      transportTypes,
      this._disabled,
      function(transport) {
        this.debug('Selected ? transport for ?', transport.connectionType, transport.endpoint.href);

        if (transport === this._transport) return;
        if (this._transport) this._transport.close();

        this._transport = transport;
        this.connectionType = transport.connectionType;
      },
      this
    );
  },

  sendMessage: function(message, timeout, options) {
    options = options || {};

    var id = message.id,
      attempts = options.attempts,
      deadline = options.deadline && new Date().getTime() + options.deadline * 1000,
      envelope = this._envelopes[id],
      scheduler;

    if (!envelope) {
      scheduler = new this._scheduler(message, {
        timeout: timeout,
        interval: this.retry,
        attempts: attempts,
        deadline: deadline
      });
      envelope = this._envelopes[id] = { message: message, scheduler: scheduler };
    }

    this._sendEnvelope(envelope);
  },

  _sendEnvelope: function(envelope) {
    if (!this._transport) return;
    if (envelope.request || envelope.timer) return;

    var message = envelope.message,
      scheduler = envelope.scheduler,
      self = this;

    if (!scheduler.isDeliverable()) {
      scheduler.abort();
      delete this._envelopes[message.id];
      return;
    }

    envelope.timer = _commonjsHelpers.commonjsGlobal.setTimeout(function() {
      self.handleError(message);
    }, scheduler.getTimeout() * 1000);

    scheduler.send();
    envelope.request = this._transport.sendMessage(message);
  },

  handleResponse: function(reply) {
    var envelope = this._envelopes[reply.id];

    if (reply.successful !== undefined && envelope) {
      envelope.scheduler.succeed();
      delete this._envelopes[reply.id];
      _commonjsHelpers.commonjsGlobal.clearTimeout(envelope.timer);
    }

    this.trigger('message', reply);

    if (this._state === this.UP) return;
    this._state = this.UP;
    this._client.trigger('transport:up');
  },

  handleError: function(message, immediate) {
    var envelope = this._envelopes[message.id],
      request = envelope && envelope.request,
      self = this;

    if (!request) return;

    request.then(function(req) {
      if (req && req.abort) req.abort();
    });

    var scheduler = envelope.scheduler;
    scheduler.fail();

    _commonjsHelpers.commonjsGlobal.clearTimeout(envelope.timer);
    envelope.request = envelope.timer = null;

    if (immediate) {
      this._sendEnvelope(envelope);
    } else {
      envelope.timer = _commonjsHelpers.commonjsGlobal.setTimeout(function() {
        envelope.timer = null;
        self._sendEnvelope(envelope);
      }, scheduler.getInterval() * 1000);
    }

    if (this._state === this.DOWN) return;
    this._state = this.DOWN;
    this._client.trigger('transport:down');
  }
});

Dispatcher.create = function(client, endpoint, options) {
  return new Dispatcher(client, endpoint, options);
};

assign(Dispatcher.prototype, publisher);
assign(Dispatcher.prototype, logging);

var dispatcher = Dispatcher;

var publication = _class(deferrable);

var Subscription = _class({
  initialize: function(client, channels, callback, context) {
    this._client = client;
    this._channels = channels;
    this._callback = callback;
    this._context = context;
    this._cancelled = false;
  },

  withChannel: function(callback, context) {
    this._withChannel = [callback, context];
    return this;
  },

  apply: function(context, args) {
    var message = args[0];

    if (this._callback) this._callback.call(this._context, message.data);

    if (this._withChannel) this._withChannel[0].call(this._withChannel[1], message.channel, message.data);
  },

  cancel: function() {
    if (this._cancelled) return;
    this._client.unsubscribe(this._channels, this);
    this._cancelled = true;
  },

  unsubscribe: function() {
    this.cancel();
  }
});

assign(Subscription.prototype, deferrable);

var subscription = Subscription;

var Client$1 = _class({
  className: 'Client',
  UNCONNECTED: 1,
  CONNECTING: 2,
  CONNECTED: 3,
  DISCONNECTED: 4,

  HANDSHAKE: 'handshake',
  RETRY: 'retry',
  NONE: 'none',

  CONNECTION_TIMEOUT: 60,

  DEFAULT_ENDPOINT: '/bayeux',
  INTERVAL: 0,

  initialize: function(endpoint, options) {
    this.info('New client created for ?', endpoint);
    options = options || {};

    validate_options(options, [
      'interval',
      'timeout',
      'endpoints',
      'proxy',
      'retry',
      'scheduler',
      'websocketExtensions',
      'tls',
      'ca',
      'cookiesAllowAllPaths',
      'enableRequestResponseLogging'
    ]);

    this._channels = new channel.Set();
    this._dispatcher = dispatcher.create(this, endpoint || this.DEFAULT_ENDPOINT, options);

    this._messageId = 0;
    this._state = this.UNCONNECTED;

    this._responseCallbacks = {};

    this._advice = {
      reconnect: this.RETRY,
      interval: 1000 * (options.interval || this.INTERVAL),
      timeout: 1000 * (options.timeout || this.CONNECTION_TIMEOUT)
    };
    this._dispatcher.timeout = this._advice.timeout / 1000;

    this._dispatcher.bind('message', this._receiveMessage, this);
  },

  addWebsocketExtension: function(extension) {
    return this._dispatcher.addWebsocketExtension(extension);
  },

  disable: function(feature) {
    return this._dispatcher.disable(feature);
  },

  setHeader: function(name, value) {
    return this._dispatcher.setHeader(name, value);
  },

  // Request
  // MUST include:  * channel
  //                * version
  //                * supportedConnectionTypes
  // MAY include:   * minimumVersion
  //                * ext
  //                * id
  //
  // Success Response                             Failed Response
  // MUST include:  * channel                     MUST include:  * channel
  //                * version                                    * successful
  //                * supportedConnectionTypes                   * error
  //                * clientId                    MAY include:   * supportedConnectionTypes
  //                * successful                                 * advice
  // MAY include:   * minimumVersion                             * version
  //                * advice                                     * minimumVersion
  //                * ext                                        * ext
  //                * id                                         * id
  //                * authSuccessful
  handshake: function(callback, context) {
    if (this._advice.reconnect === this.NONE) return;
    if (this._state !== this.UNCONNECTED) return;

    this._state = this.CONNECTING;
    var self = this;

    this.info('Initiating handshake with ?', this._dispatcher.endpoint.href);
    this._dispatcher.selectTransport(constants.MANDATORY_CONNECTION_TYPES);

    this._sendMessage(
      {
        channel: channel.HANDSHAKE,
        version: constants.BAYEUX_VERSION,
        supportedConnectionTypes: this._dispatcher.getConnectionTypes()
      },
      {},
      function(response) {
        if (response.successful) {
          this._state = this.CONNECTED;
          this._dispatcher.clientId = response.clientId;

          this._dispatcher.selectTransport(response.supportedConnectionTypes);

          this.info('Handshake successful: ?', this._dispatcher.clientId);

          this.subscribe(this._channels.getKeys(), true);
          if (callback)
            driver.asap_1(function() {
              callback.call(context);
            });
        } else {
          this.info('Handshake unsuccessful');
          _commonjsHelpers.commonjsGlobal.setTimeout(function() {
            self.handshake(callback, context);
          }, this._dispatcher.retry * 1000);
          this._state = this.UNCONNECTED;
        }
      },
      this
    );
  },

  // Request                              Response
  // MUST include:  * channel             MUST include:  * channel
  //                * clientId                           * successful
  //                * connectionType                     * clientId
  // MAY include:   * ext                 MAY include:   * error
  //                * id                                 * advice
  //                                                     * ext
  //                                                     * id
  //                                                     * timestamp
  connect: function(callback, context) {
    if (this._advice.reconnect === this.NONE) return;
    if (this._state === this.DISCONNECTED) return;

    if (this._state === this.UNCONNECTED)
      return this.handshake(function() {
        this.connect(callback, context);
      }, this);

    this.callback(callback, context);
    if (this._state !== this.CONNECTED) return;

    this.info('Calling deferred actions for ?', this._dispatcher.clientId);
    this.setDeferredStatus('succeeded');
    this.setDeferredStatus('unknown');

    if (this._connectRequest) return;
    this._connectRequest = true;

    this.info('Initiating connection for ?', this._dispatcher.clientId);

    this._sendMessage(
      {
        channel: channel.CONNECT,
        clientId: this._dispatcher.clientId,
        connectionType: this._dispatcher.connectionType
      },
      {},
      this._cycleConnection,
      this
    );
  },

  // Request                              Response
  // MUST include:  * channel             MUST include:  * channel
  //                * clientId                           * successful
  // MAY include:   * ext                                * clientId
  //                * id                  MAY include:   * error
  //                                                     * ext
  //                                                     * id
  disconnect: function() {
    if (this._state !== this.CONNECTED) return;
    this._state = this.DISCONNECTED;

    this.info('Disconnecting ?', this._dispatcher.clientId);
    var promise = new publication();

    this._sendMessage(
      {
        channel: channel.DISCONNECT,
        clientId: this._dispatcher.clientId
      },
      {},
      function(response) {
        if (response.successful) {
          this._dispatcher.close();
          promise.setDeferredStatus('succeeded');
        } else {
          promise.setDeferredStatus('failed', error.parse(response.error));
        }
      },
      this
    );

    this.info('Clearing channel listeners for ?', this._dispatcher.clientId);
    this._channels = new channel.Set();

    return promise;
  },

  // Request                              Response
  // MUST include:  * channel             MUST include:  * channel
  //                * clientId                           * successful
  //                * subscription                       * clientId
  // MAY include:   * ext                                * subscription
  //                * id                  MAY include:   * error
  //                                                     * advice
  //                                                     * ext
  //                                                     * id
  //                                                     * timestamp
  subscribe: function(channel$1, callback, context) {
    if (channel$1 instanceof Array)
      return array.map(
        channel$1,
        function(c) {
          return this.subscribe(c, callback, context);
        },
        this
      );

    var subscription$1 = new subscription(this, channel$1, callback, context),
      force = callback === true,
      hasSubscribe = this._channels.hasSubscription(channel$1);

    if (hasSubscribe && !force) {
      this._channels.subscribe([channel$1], subscription$1);
      subscription$1.setDeferredStatus('succeeded');
      return subscription$1;
    }

    this.connect(function() {
      this.info('Client ? attempting to subscribe to ?', this._dispatcher.clientId, channel$1);
      if (!force) this._channels.subscribe([channel$1], subscription$1);

      this._sendMessage(
        {
          channel: channel.SUBSCRIBE,
          clientId: this._dispatcher.clientId,
          subscription: channel$1
        },
        {},
        function(response) {
          if (!response.successful) {
            subscription$1.setDeferredStatus('failed', error.parse(response.error));
            return this._channels.unsubscribe(channel$1, subscription$1);
          }

          var channels = [].concat(response.subscription);
          this.info('Subscription acknowledged for ? to ?', this._dispatcher.clientId, channels);
          subscription$1.setDeferredStatus('succeeded');
        },
        this
      );
    }, this);

    return subscription$1;
  },

  // Request                              Response
  // MUST include:  * channel             MUST include:  * channel
  //                * clientId                           * successful
  //                * subscription                       * clientId
  // MAY include:   * ext                                * subscription
  //                * id                  MAY include:   * error
  //                                                     * advice
  //                                                     * ext
  //                                                     * id
  //                                                     * timestamp
  unsubscribe: function(channel$1, subscription) {
    if (channel$1 instanceof Array)
      return array.map(
        channel$1,
        function(c) {
          return this.unsubscribe(c, subscription);
        },
        this
      );

    var dead = this._channels.unsubscribe(channel$1, subscription);
    if (!dead) return;

    this.connect(function() {
      this.info('Client ? attempting to unsubscribe from ?', this._dispatcher.clientId, channel$1);

      this._sendMessage(
        {
          channel: channel.UNSUBSCRIBE,
          clientId: this._dispatcher.clientId,
          subscription: channel$1
        },
        {},
        function(response) {
          if (!response.successful) return;

          var channels = [].concat(response.subscription);
          this.info('Unsubscription acknowledged for ? from ?', this._dispatcher.clientId, channels);
        },
        this
      );
    }, this);
  },

  // Request                              Response
  // MUST include:  * channel             MUST include:  * channel
  //                * data                               * successful
  // MAY include:   * clientId            MAY include:   * id
  //                * id                                 * error
  //                * ext                                * ext
  publish: function(channel, data, options) {
    validate_options(options || {}, ['attempts', 'deadline']);
    var publication$1 = new publication();

    this.connect(function() {
      this.info('Client ? queueing published message to ?: ?', this._dispatcher.clientId, channel, data);

      this._sendMessage(
        {
          channel: channel,
          data: data,
          clientId: this._dispatcher.clientId
        },
        options,
        function(response) {
          if (response.successful) publication$1.setDeferredStatus('succeeded');
          else publication$1.setDeferredStatus('failed', error.parse(response.error));
        },
        this
      );
    }, this);

    return publication$1;
  },

  _sendMessage: function(message, options, callback, context) {
    message.id = this._generateMessageId();

    var timeout = this._advice.timeout ? (1.2 * this._advice.timeout) / 1000 : 1.2 * this._dispatcher.retry;

    this.pipeThroughExtensions(
      'outgoing',
      message,
      null,
      function(message) {
        if (!message) return;
        if (callback) this._responseCallbacks[message.id] = [callback, context];
        this._dispatcher.sendMessage(message, timeout, options || {});
      },
      this
    );
  },

  _generateMessageId: function() {
    this._messageId += 1;
    if (this._messageId >= Math.pow(2, 32)) this._messageId = 0;
    return this._messageId.toString(36);
  },

  _receiveMessage: function(message) {
    var id = message.id,
      callback;

    if (message.successful !== undefined) {
      callback = this._responseCallbacks[id];
      delete this._responseCallbacks[id];
    }

    this.pipeThroughExtensions(
      'incoming',
      message,
      null,
      function(message) {
        if (!message) return;
        if (message.advice) this._handleAdvice(message.advice);
        this._deliverMessage(message);
        if (callback) callback[0].call(callback[1], message);
      },
      this
    );
  },

  _handleAdvice: function(advice) {
    assign(this._advice, advice);
    this._dispatcher.timeout = this._advice.timeout / 1000;

    if (this._advice.reconnect === this.HANDSHAKE && this._state !== this.DISCONNECTED) {
      this._state = this.UNCONNECTED;
      this._dispatcher.clientId = null;
      this._cycleConnection();
    }
  },

  _deliverMessage: function(message) {
    if (!message.channel || message.data === undefined) return;
    this.info('Client ? calling listeners for ? with ?', this._dispatcher.clientId, message.channel, message.data);
    this._channels.distributeMessage(message);
  },

  _cycleConnection: function() {
    if (this._connectRequest) {
      this._connectRequest = null;
      this.info('Closed connection for ?', this._dispatcher.clientId);
    }
    var self = this;
    _commonjsHelpers.commonjsGlobal.setTimeout(function() {
      self.connect();
    }, this._advice.interval);
  }
});

assign(Client$1.prototype, deferrable);
assign(Client$1.prototype, publisher);
assign(Client$1.prototype, logging);
assign(Client$1.prototype, extensible);

var client$1 = Client$1;

var id_from_messages = function(messages) {
  var connect = array.filter([].concat(messages), function(message) {
    return message.channel === '/meta/connect';
  });
  return connect[0] && connect[0].clientId;
};

var content_types = {
  TYPE_JSON: { 'Content-Type': 'application/json; charset=utf-8' },
  TYPE_SCRIPT: { 'Content-Type': 'text/javascript; charset=utf-8' },
  TYPE_TEXT: { 'Content-Type': 'text/plain; charset=utf-8' }
};

var StaticServer = _class({
  initialize: function(directory, pathRegex) {
    this._directory = directory;
    this._pathRegex = pathRegex;
    this._pathMap = {};
    this._index = {};
  },

  map: function(requestPath, filename) {
    this._pathMap[requestPath] = filename;
  },

  test: function(pathname) {
    return this._pathRegex.test(pathname);
  },

  call: function(request, response) {
    var pathname = url__default['default'].parse(request.url, true).pathname,
      filename = path__default['default'].basename(pathname);

    filename = this._pathMap[filename] || filename;
    this._index[filename] = this._index[filename] || {};

    var cache = this._index[filename],
      fullpath = path__default['default'].join(this._directory, filename);

    try {
      cache.content = cache.content || fs__default['default'].readFileSync(fullpath);
      cache.digest =
        cache.digest ||
        crypto__default['default']
          .createHash('sha1')
          .update(cache.content)
          .digest('hex');
      cache.mtime = cache.mtime || fs__default['default'].statSync(fullpath).mtime;
    } catch (error) {
      response.writeHead(404, {});
      return response.end();
    }

    var type = /\.js$/.test(pathname) ? 'TYPE_SCRIPT' : 'TYPE_JSON',
      ims = request.headers['if-modified-since'];

    var headers = {
      ETag: cache.digest,
      'Last-Modified': cache.mtime.toGMTString()
    };

    if (request.headers['if-none-match'] === cache.digest) {
      response.writeHead(304, headers);
      response.end();
    } else if (ims && cache.mtime <= new Date(ims)) {
      response.writeHead(304, headers);
      response.end();
    } else {
      headers['Content-Length'] = cache.content.length;
      assign(headers, content_types[type]);
      response.writeHead(200, headers);
      response.end(cache.content);
    }
  }
});

var static_server = StaticServer;

var EventSource$1 = websocket.EventSource;

var NodeAdapter = _class({
  className: 'NodeAdapter',
  DEFAULT_ENDPOINT: '/bayeux',
  SCRIPT_PATH: 'faye-browser-min.js',

  VALID_JSONP_CALLBACK: /^[a-z_\$][a-z0-9_\$]*(\.[a-z_\$][a-z0-9_\$]*)*$/i,

  initialize: function(options) {
    this._options = options || {};
    validate_options(this._options, ['engine', 'mount', 'ping', 'timeout', 'extensions', 'websocketExtensions']);

    this._extensions = [];
    this._endpoint = this._options.mount || this.DEFAULT_ENDPOINT;
    this._endpointRe = new RegExp('^' + this._endpoint.replace(/\/$/, '') + '(/[^/]*)*(\\.[^\\.]+)?$');
    this._server = server.create(this._options);

    this._static = new static_server(path__default['default'].join(__dirname, '..', '..', 'client'), /\.(?:js|map)$/);
    this._static.map(path__default['default'].basename(this._endpoint) + '.js', this.SCRIPT_PATH);
    this._static.map('client.js', this.SCRIPT_PATH);

    var extensions = this._options.extensions,
      websocketExtensions = this._options.websocketExtensions,
      i,
      n;

    if (extensions) {
      extensions = [].concat(extensions);
      for (i = 0, n = extensions.length; i < n; i++) this.addExtension(extensions[i]);
    }

    if (websocketExtensions) {
      websocketExtensions = [].concat(websocketExtensions);
      for (i = 0, n = websocketExtensions.length; i < n; i++) this.addWebsocketExtension(websocketExtensions[i]);
    }
  },

  listen: function() {
    throw new Error('The listen() method is deprecated - use the attach() method to bind Faye to an http.Server');
  },

  addExtension: function(extension) {
    return this._server.addExtension(extension);
  },

  removeExtension: function(extension) {
    return this._server.removeExtension(extension);
  },

  addWebsocketExtension: function(extension) {
    this._extensions.push(extension);
  },

  close: function() {
    return this._server.close();
  },

  getClient: function() {
    return (this._client = this._client || new client$1(this._server));
  },

  attach: function(httpServer) {
    this._overrideListeners(httpServer, 'request', 'handle');
    this._overrideListeners(httpServer, 'upgrade', 'handleUpgrade');
  },

  _overrideListeners: function(httpServer, event, method) {
    var listeners = httpServer.listeners(event),
      self = this;

    httpServer.removeAllListeners(event);

    httpServer.on(event, function(request) {
      if (self.check(request)) return self[method].apply(self, arguments);

      for (var i = 0, n = listeners.length; i < n; i++) listeners[i].apply(this, arguments);
    });
  },

  check: function(request) {
    var path = url__default['default'].parse(request.url, true).pathname;
    return !!this._endpointRe.test(path);
  },

  handle: function(request, response) {
    var requestUrl = url__default['default'].parse(request.url, true),
      requestMethod = request.method,
      self = this;

    request.originalUrl = request.url;

    request.on('error', function(error) {
      self._returnError(response, error);
    });
    response.on('error', function(error) {
      self._returnError(null, error);
    });

    if (this._static.test(requestUrl.pathname)) return this._static.call(request, response);

    // http://groups.google.com/group/faye-users/browse_thread/thread/4a01bb7d25d3636a
    if (requestMethod === 'OPTIONS' || request.headers['access-control-request-method'] === 'POST')
      return this._handleOptions(response);

    if (EventSource$1.isEventSource(request)) return this.handleEventSource(request, response);

    if (requestMethod === 'GET') return this._callWithParams(request, response, requestUrl.query);

    if (requestMethod === 'POST')
      return this._concatStream(
        request,
        function(data) {
          var type = (request.headers['content-type'] || '').split(';')[0],
            params = type === 'application/json' ? { message: data } : querystring__default['default'].parse(data);

          request.body = data;
          this._callWithParams(request, response, params);
        },
        this
      );

    this._returnError(response, { message: 'Unrecognized request type' });
  },

  _callWithParams: function(request, response, params) {
    if (!params.message)
      return this._returnError(response, {
        message: 'Received request with no message: ' + this._formatRequest(request)
      });

    try {
      this.debug('Received message via HTTP ' + request.method + ': ?', params.message);

      var message = this._parseJSON(params.message),
        jsonp = params.jsonp || constants.JSONP_CALLBACK,
        isGet = request.method === 'GET',
        type = isGet ? content_types.TYPE_SCRIPT : content_types.TYPE_JSON,
        headers = assign({}, type),
        origin = request.headers.origin;

      if (!this.VALID_JSONP_CALLBACK.test(jsonp))
        return this._returnError(response, { message: 'Invalid JSON-P callback: ' + jsonp });

      headers['Cache-Control'] = 'no-cache, no-store';
      headers['X-Content-Type-Options'] = 'nosniff';

      if (origin) {
        headers['Access-Control-Allow-Credentials'] = 'true';
        headers['Access-Control-Allow-Origin'] = origin;
      }

      this._server.process(
        message,
        request,
        function(replies) {
          var body = to_json(replies);

          if (isGet) {
            body = '/**/' + jsonp + '(' + this._jsonpEscape(body) + ');';
            headers['Content-Disposition'] = 'attachment; filename=f.txt';
          }

          headers['Content-Length'] = Buffer.from(body, 'utf8').length.toString();

          this.debug('HTTP response: ?', body);
          response.writeHead(200, headers);
          response.end(body);
        },
        this
      );
    } catch (error) {
      this._returnError(response, error);
    }
  },

  _jsonpEscape: function(json) {
    return json.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  },

  handleUpgrade: function(request, socket, head) {
    var options = { extensions: this._extensions, ping: this._options.ping },
      ws = new websocket(request, socket, head, [], options),
      clientId = null,
      self = this;

    request.originalUrl = request.url;

    ws.onmessage = function(event) {
      try {
        self.debug('Received message via WebSocket[' + ws.version + ']: ?', event.data);

        var message = self._parseJSON(event.data),
          cid = id_from_messages(message);

        if (clientId && cid && cid !== clientId) self._server.closeSocket(clientId, false);
        self._server.openSocket(cid, ws, request);
        if (cid) clientId = cid;

        self._server.process(message, request, function(replies) {
          if (ws) ws.send(to_json(replies));
        });
      } catch (error) {
        console.log(error.stack);
        self.error(error.message + '\nBacktrace:\n' + error.stack);
      }
    };

    ws.onclose = function(event) {
      self._server.closeSocket(clientId);
      ws = null;
    };
  },

  handleEventSource: function(request, response) {
    var es = new EventSource$1(request, response, { ping: this._options.ping }),
      clientId = es.url.split('/').pop(),
      self = this;

    this.debug('Opened EventSource connection for ?', clientId);
    this._server.openSocket(clientId, es, request);

    es.onclose = function(event) {
      self._server.closeSocket(clientId);
      es = null;
    };
  },

  _handleOptions: function(response) {
    var headers = {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Accept, Authorization, Content-Type, Pragma, X-Requested-With',
      'Access-Control-Allow-Methods': 'POST, GET',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Max-Age': '86400'
    };

    response.writeHead(200, headers);
    response.end('');
  },

  _concatStream: function(stream, callback, context) {
    var chunks = [],
      length = 0;

    stream.on('data', function(chunk) {
      chunks.push(chunk);
      length += chunk.length;
    });

    stream.on('end', function() {
      var buffer = new Buffer.alloc(length),
        offset = 0;

      for (var i = 0, n = chunks.length; i < n; i++) {
        chunks[i].copy(buffer, offset);
        offset += chunks[i].length;
      }
      callback.call(context, buffer.toString('utf8'));
    });
  },

  _parseJSON: function(json) {
    var data = JSON.parse(json);
    if (typeof data === 'object') return data;
    throw new SyntaxError('JSON messages must contain an object or array');
  },

  _formatRequest: function(request) {
    var method = request.method.toUpperCase(),
      string = 'curl -X ' + method;

    string += " 'http://" + request.headers.host + request.url + "'";
    if (method === 'POST') {
      string += " -H 'Content-Type: " + request.headers['content-type'] + "'";
      string += " -d '" + request.body + "'";
    }
    return string;
  },

  _returnError: function(response, error) {
    var message = error.message;
    if (error.stack) message += '\nBacktrace:\n' + error.stack;
    this.error(message);

    if (!response) return;

    response.writeHead(400, content_types.TYPE_TEXT);
    response.end('Bad request');
  }
});

for (var method$2 in publisher)
  (function(method) {
    NodeAdapter.prototype[method] = function() {
      return this._server._engine[method].apply(this._server._engine, arguments);
    };
  })(method$2);

assign(NodeAdapter.prototype, logging);

var node_adapter = NodeAdapter;

var Faye = {
  VERSION: constants.VERSION,

  Client: client$1,
  Scheduler: scheduler,
  NodeAdapter: node_adapter
};

logging.wrapper = Faye;

var faye_node = Faye;

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * Comet client interface. The is to allow for mocking the inner streaming Cometd implementation.
 * The Faye implementation is used by default but it could be used to adapt another Cometd impl.
 */
class CometClient extends events.EventEmitter {}
/**
 * Validation helper
 * @param newTime New Duration to validate.
 * @param existingTime Existing time to validate.
 */
function validateTimeout(newTime, existingTime) {
  if (newTime.milliseconds >= existingTime.milliseconds) {
    return newTime;
  }
  throw sfdxError.SfdxError.create('@salesforce/core', 'streaming', 'waitParamValidValueError', [existingTime.minutes]);
}
/**
 * Api wrapper to support Salesforce streaming. The client contains an internal implementation of a cometd specification.
 *
 * Salesforce client and timeout information
 *
 * Streaming API imposes two timeouts, as supported in the Bayeux protocol.
 *
 * Socket timeout: 110 seconds
 * A client receives events (JSON-formatted HTTP responses) while it waits on a connection. If no events are generated
 * and the client is still waiting, the connection times out after 110 seconds and the server closes the connection.
 * Clients should reconnect before two minutes to avoid the connection timeout.
 *
 * Reconnect timeout: 40 seconds
 * After receiving the events, a client needs to reconnect to receive the next set of events. If the reconnection
 * doesn't happen within 40 seconds, the server expires the subscription and the connection is closed. If this happens,
 * the client must start again and handshake, subscribe, and connect. Each Streaming API client logs into an instance
 * and maintains a session. When the client handshakes, connects, or subscribes, the session timeout is restarted. A
 * client session times out if the client doesn’t reconnect to the server within 40 seconds after receiving a response
 * (an event, subscribe result, and so on).
 *
 * Note that these timeouts apply to the Streaming API client session and not the Salesforce authentication session. If
 * the client session times out, the authentication session remains active until the organization-specific timeout
 * policy goes into effect.
 *
 * ```
 * const streamProcessor = (message: JsonMap): StatusResult => {
 *    const payload = ensureJsonMap(message.payload);
 *    const id = ensureString(payload.id);
 *
 *     if (payload.status !== 'Active') {
 *       return  { completed: false };
 *     }
 *
 *     return {
 *         completed: true,
 *         payload: id
 *     };
 *   };
 *
 * const org = await Org.create({});
 * const options = new StreamingClient.DefaultOptions(org, 'MyPushTopics', streamProcessor);
 *
 * const asyncStatusClient = await StreamingClient.create(options);
 *
 * await asyncStatusClient.handshake();
 *
 * const info: RequestInfo = {
 *     method: 'POST',
 *     url: `${org.getField(OrgFields.INSTANCE_URL)}/SomeService`,
 *     headers: { HEADER: 'HEADER_VALUE'},
 *     body: 'My content'
 * };
 *
 * await asyncStatusClient.subscribe(async () => {
 *    const connection = await org.getConnection();
 *    // Now that we are subscribed, we can initiate the request that will cause the events to start streaming.
 *    const requestResponse: JsonCollection = await connection.request(info);
 *    const id = ensureJsonMap(requestResponse).id;
 *    console.log(`this.id: ${JSON.stringify(ensureString(id), null, 4)}`);
 * });
 * ```
 */
class StreamingClient extends index.lib.AsyncOptionalCreatable {
  /**
   * Constructor
   * @param options Streaming client options
   * {@link AsyncCreatable.create}
   */
  constructor(options) {
    super(options);
    this.options = index$1.lib.ensure(options);
    const instanceUrl = index$1.lib.ensure(this.options.org.getConnection().getAuthInfoFields().instanceUrl);
    /**
     * The salesforce network infrastructure issues a cookie called sfdx-stream if it sees /cometd in the url.
     * Without this cookie request response streams will experience intermittent client session failures.
     *
     * The following cookies should be sent on a /meta/handshake
     *
     * "set-cookie": [
     *    "BrowserId=<ID>;Path=/;Domain=.salesforce.com;Expires=Sun, 13-Jan-2019 20:16:19 GMT;Max-Age=5184000",
     *    "t=<ID>;Path=/cometd/;HttpOnly",
     *    "BAYEUX_BROWSER=<ID>;Path=/cometd/;Secure",
     *    "sfdc-stream=<ID>; expires=Wed, 14-Nov-2018 23:16:19 GMT; path=/"
     * ],
     *
     * Enable SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING to debug potential session problems and to verify cookie
     * exchanges.
     */
    this.targetUrl = url.resolve(instanceUrl, `cometd/${this.options.apiVersion}`);
    this.cometClient = this.options.streamingImpl.getCometClient(this.targetUrl);
    this.options.streamingImpl.setLogger(this.log.bind(this));
    this.cometClient.on('transport:up', () => this.log('Transport up event received'));
    this.cometClient.on('transport:down', () => this.log('Transport down event received'));
    this.cometClient.addExtension({
      incoming: this.incoming.bind(this)
    });
    this.cometClient.disable('websocket');
  }
  /**
   * Asynchronous initializer.
   */
  async init() {
    // get the apiVersion from the connection if not already an option
    const conn = this.options.org.getConnection();
    this.options.apiVersion = this.options.apiVersion || conn.getApiVersion();
    this.logger = await logger.Logger.child(this.constructor.name);
    await this.options.org.refreshAuth();
    const accessToken = conn.getConnectionOptions().accessToken;
    if (accessToken && accessToken.length > 5) {
      this.logger.debug(`accessToken: XXXXXX${accessToken.substring(accessToken.length - 5, accessToken.length - 1)}`);
      this.cometClient.setHeader('Authorization', `OAuth ${accessToken}`);
    } else {
      throw new sfdxError.SfdxError('Missing or invalid access token', 'MissingOrInvalidAccessToken');
    }
    this.log(`Streaming client target url: ${this.targetUrl}`);
    this.log(`options.subscribeTimeout (ms): ${this.options.subscribeTimeout.milliseconds}`);
    this.log(`options.handshakeTimeout (ms): ${this.options.handshakeTimeout.milliseconds}`);
  }
  /**
   * Allows replaying of of Streaming events starting with replayId.
   * @param replayId The starting message id to replay from.
   */
  replay(replayId) {
    this.cometClient.addExtension({
      outgoing: (message, callback) => {
        if (message.channel === '/meta/subscribe') {
          if (!message.ext) {
            message.ext = {};
          }
          const replayFromMap = {};
          replayFromMap[this.options.channel] = replayId;
          // add "ext : { "replay" : { CHANNEL : REPLAY_VALUE }}" to subscribe message
          index.lib.set(message, 'ext.replay', replayFromMap);
        }
        callback(message);
      }
    });
  }
  /**
   * Provides a convenient way to handshake with the server endpoint before trying to subscribe.
   */
  handshake() {
    let timeout;
    return new Promise((resolve, reject) => {
      timeout = setTimeout(() => {
        const timeoutError = sfdxError.SfdxError.create(
          '@salesforce/core',
          'streaming',
          StreamingClient.TimeoutErrorType.HANDSHAKE,
          [this.targetUrl]
        );
        this.doTimeout(timeout, timeoutError);
        reject(timeoutError);
      }, this.options.handshakeTimeout.milliseconds);
      this.cometClient.handshake(() => {
        this.log('handshake completed');
        clearTimeout(timeout);
        this.log('cleared handshake timeout');
        resolve(StreamingClient.ConnectionState.CONNECTED);
      });
    });
  }
  /**
   * Subscribe to streaming events. When the streaming processor that's set in the options completes execution it
   * returns a payload in the StatusResult object. The payload is just echoed here for convenience.
   *
   * **Throws** *{@link SfdxError}{ name: '{@link StreamingClient.TimeoutErrorType.SUBSCRIBE}'}* When the subscribe timeout occurs.
   * @param streamInit This function should call the platform apis that result in streaming updates on push topics.
   * {@link StatusResult}
   */
  subscribe(streamInit) {
    let timeout;
    // This outer promise is to hold the streaming promise chain open until the streaming processor
    // says it's complete.
    return new Promise((subscribeResolve, subscribeReject) => {
      // This is the inner promise chain that's satisfied when the client impl (Faye/Mock) says it's subscribed.
      return new Promise((subscriptionResolve, subscriptionReject) => {
        timeout = setTimeout(() => {
          const timeoutError = sfdxError.SfdxError.create(
            '@salesforce/core',
            'streaming',
            StreamingClient.TimeoutErrorType.SUBSCRIBE
          );
          this.doTimeout(timeout, timeoutError);
          subscribeReject(timeoutError);
        }, this.options.subscribeTimeout.milliseconds);
        // Initialize the subscription.
        const subscription = this.cometClient.subscribe(this.options.channel, message => {
          try {
            // The result of the stream processor determines the state of the outer promise.
            const result = this.options.streamProcessor(message);
            // The stream processor says it's complete. Clean up and resolve the outer promise.
            if (result && result.completed) {
              clearTimeout(timeout);
              this.disconnectClient();
              subscribeResolve(result.payload);
            } // This 'if' is intended to be evaluated until it's completed or until the timeout fires.
          } catch (e) {
            // it's completely valid for the stream processor to throw an error. If it does we will
            // reject the outer promise. Keep in mind if we are here the subscription was resolved.
            clearTimeout(timeout);
            this.disconnectClient();
            subscribeReject(e);
          }
        });
        subscription.callback(() => {
          subscriptionResolve();
        });
        subscription.errback(error => {
          subscriptionReject(error);
        });
      })
        .then(() => {
          // Now that we successfully have a subscription started up we are safe to initialize the function that
          // will affect the streaming events. I.E. create an org or run apex tests.
          return streamInit && streamInit();
        })
        .catch(error => {
          this.disconnect();
          // Need to catch the subscription rejection or it will result in an unhandled rejection error.
          clearTimeout(timeout);
          // No subscription so we can reject the out promise as well.
          subscribeReject(error);
        });
    });
  }
  /**
   * Handler for incoming streaming messages.
   * @param message The message to process.
   * @param cb The callback. Failure to call this can cause the internal comet client to hang.
   */
  incoming(message, cb) {
    this.log(message);
    // Look for a specific error message during the handshake.  If found, throw an error
    // with actions for the user.
    if (
      message &&
      message.channel === '/meta/handshake' &&
      message.error &&
      index$1.lib.ensureString(message.error).includes('400::API version in the URI is mandatory')
    ) {
      const errConfig = new sfdxError.SfdxErrorConfig(
        '@salesforce/core',
        'streaming',
        'handshakeApiVersionError',
        [this.options.apiVersion],
        'handshakeApiVersionErrorAction'
      );
      throw sfdxError.SfdxError.create(errConfig);
    }
    cb(message);
  }
  doTimeout(timeout, error) {
    this.disconnect();
    clearTimeout(timeout);
    this.log(JSON.stringify(error));
    return error;
  }
  disconnectClient() {
    if (this.cometClient) {
      this.cometClient.disconnect();
    }
  }
  disconnect() {
    this.log('Disconnecting the comet client');
    // This is a patch for faye. If Faye encounters errors while attempting to handshake it will keep trying
    // and will prevent the timeout from disconnecting. Here for example we will detect there is no client id but
    // unauthenticated connections are being made to salesforce. Let's close the dispatcher if it exists and
    // has no clientId.
    // @ts-ignore
    if (this.cometClient._dispatcher) {
      this.log('Closing the faye dispatcher');
      // @ts-ignore
      const dispatcher = this.cometClient._dispatcher;
      this.log(`dispatcher.clientId: ${dispatcher.clientId}`);
      if (!dispatcher.clientId) {
        dispatcher.close();
      } else {
        this.disconnectClient();
      }
    }
  }
  /**
   * Simple inner log wrapper
   * @param message The message to log
   */
  log(message) {
    if (this.logger) {
      this.logger.debug(message);
    }
  }
}
(function(StreamingClient) {
  /**
   * Default Streaming Options. Uses Faye as the cometd impl.
   */
  class DefaultOptions {
    /**
     * Constructor for DefaultStreamingOptions
     * @param org The streaming target org
     * @param channel The streaming channel or topic. If the topic is a system topic then api 36.0 is used.
     * System topics are deprecated.
     * @param streamProcessor The function called that can process streaming messages.
     * @see {@link StatusResult}
     */
    constructor(org, channel, streamProcessor, envDep = index.lib.env) {
      if (!streamProcessor) {
        throw new sfdxError.SfdxError('Missing stream processor', 'MissingArg');
      }
      if (!org) {
        throw new sfdxError.SfdxError('Missing org', 'MissingArg');
      }
      if (!channel) {
        throw new sfdxError.SfdxError('Missing streaming channel', 'MissingArg');
      }
      this.envDep = envDep;
      this.org = org;
      this.apiVersion = org.getConnection().getApiVersion();
      if (channel.startsWith('/system')) {
        this.apiVersion = '36.0';
      }
      if (!(parseFloat(this.apiVersion) > 0)) {
        throw sfdxError.SfdxError.create('@salesforce/core', 'streaming', 'invalidApiVersion', [this.apiVersion]);
      }
      this.streamProcessor = streamProcessor;
      this.channel = channel;
      this.subscribeTimeout = StreamingClient.DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT;
      this.handshakeTimeout = StreamingClient.DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT;
      this.streamingImpl = {
        getCometClient: url => {
          const x = this.envDep.getString(StreamingClient.DefaultOptions.SFDX_ENABLE_FAYE_COOKIES_ALLOW_ALL_PATHS);
          return new faye_node.Client(url, {
            // This parameter ensures all cookies regardless of path are included in subsequent requests. Otherwise
            // only cookies with the path "/" and "/cometd" are known to be included.
            // if SFDX_ENABLE_FAYE_COOKIES_ALLOW_ALL_PATHS is *not* set the default to true.
            cookiesAllowAllPaths:
              x === undefined
                ? true
                : this.envDep.getBoolean(StreamingClient.DefaultOptions.SFDX_ENABLE_FAYE_COOKIES_ALLOW_ALL_PATHS),
            // WARNING - The allows request/response exchanges to be written to the log instance which includes
            // header and cookie information.
            enableRequestResponseLogging: this.envDep.getBoolean(
              StreamingClient.DefaultOptions.SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING
            )
          });
        },
        setLogger: logLine => {
          faye_node.logger = {};
          ['info', 'error', 'fatal', 'warn', 'debug'].forEach(element => {
            index.lib.set(faye_node.logger, element, logLine);
          });
        }
      };
    }
    /**
     * Setter for the subscribe timeout.
     *
     * **Throws** An error if the newTime is less than the default time.
     * @param newTime The new subscribe timeout.
     * {@link DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT}
     */
    setSubscribeTimeout(newTime) {
      this.subscribeTimeout = validateTimeout(newTime, DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT);
    }
    /**
     * Setter for the handshake timeout.
     *
     * **Throws** An error if the newTime is less than the default time.
     * @param newTime The new handshake timeout
     * {@link DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT}
     */
    setHandshakeTimeout(newTime) {
      this.handshakeTimeout = validateTimeout(newTime, DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT);
    }
  }
  DefaultOptions.SFDX_ENABLE_FAYE_COOKIES_ALLOW_ALL_PATHS = 'SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING';
  DefaultOptions.SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING = 'SFDX_ENABLE_FAYE_REQUEST_RESPONSE_LOGGING';
  DefaultOptions.DEFAULT_SUBSCRIBE_TIMEOUT = index.lib.Duration.minutes(3);
  DefaultOptions.DEFAULT_HANDSHAKE_TIMEOUT = index.lib.Duration.seconds(30);
  StreamingClient.DefaultOptions = DefaultOptions;
  (function(ConnectionState) {
    /**
     * Used to indicated that the streaming client is connected.
     */
    ConnectionState[(ConnectionState['CONNECTED'] = 0)] = 'CONNECTED';
  })(StreamingClient.ConnectionState || (StreamingClient.ConnectionState = {}));
  (function(TimeoutErrorType) {
    /**
     * To indicate the error occurred on handshake
     */
    TimeoutErrorType['HANDSHAKE'] = 'genericHandshakeTimeoutMessage';
    /**
     * To indicate the error occurred on subscribe
     */
    TimeoutErrorType['SUBSCRIBE'] = 'genericTimeoutMessage';
  })(StreamingClient.TimeoutErrorType || (StreamingClient.TimeoutErrorType = {}));
})(StreamingClient || (StreamingClient = {}));

exports.CometClient = CometClient;
exports.StreamingClient = StreamingClient;
//# sourceMappingURL=streamingClient.js.map
