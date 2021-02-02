'use strict';

var commonjsGlobal =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
    ? global
    : typeof self !== 'undefined'
    ? self
    : {};

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var a = Object.defineProperty({}, '__esModule', { value: true });
  Object.keys(n).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(
      a,
      k,
      d.get
        ? d
        : {
            enumerable: true,
            get: function() {
              return n[k];
            }
          }
    );
  });
  return a;
}

function createCommonjsModule(fn) {
  var module = { exports: {} };
  return fn(module, module.exports), module.exports;
}

function commonjsRequire(target) {
  throw new Error(
    'Could not dynamically require "' +
      target +
      '". Please configure the dynamicRequireTargets option of @rollup/plugin-commonjs appropriately for this require call to behave properly.'
  );
}

exports.commonjsGlobal = commonjsGlobal;
exports.commonjsRequire = commonjsRequire;
exports.createCommonjsModule = createCommonjsModule;
exports.getAugmentedNamespace = getAugmentedNamespace;
//# sourceMappingURL=_commonjsHelpers-49936489.js.map
