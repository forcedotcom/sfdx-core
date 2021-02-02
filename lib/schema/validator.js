'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('../index-aea73a28.js');
var index$1 = require('../index-ffe6ca9f.js');
var url = require('url');
var path = require('path');
var sfdxError = require('../sfdxError.js');
var util_fs = require('../util/fs.js');
require('../_commonjsHelpers-49936489.js');
require('../messages.js');
require('fs');
require('os');
require('util');
require('crypto');
require('constants');
require('stream');
require('assert');

function _interopDefaultLegacy(e) {
  return e && typeof e === 'object' && 'default' in e ? e : { default: e };
}

var url__default = /*#__PURE__*/ _interopDefaultLegacy(url);

var func = function func() {
  var args = Array.apply(null, arguments),
    name = args.shift(),
    tab = '  ',
    lines = '',
    vars = '',
    ind = 1, // indentation
    bs = '{[', // block start
    be = '}]', // block end
    space = function() {
      var sp = tab,
        i = 0;
      while (i++ < ind - 1) {
        sp += tab;
      }
      return sp;
    },
    add = function(line) {
      lines += space() + line + '\n';
    },
    builder = function(line) {
      var first = line[0],
        last = line[line.length - 1];

      if (be.indexOf(first) > -1 && bs.indexOf(last) > -1) {
        ind--;
        add(line);
        ind++;
      } else if (bs.indexOf(last) > -1) {
        add(line);
        ind++;
      } else if (be.indexOf(first) > -1) {
        ind--;
        add(line);
      } else {
        add(line);
      }

      return builder;
    };

  builder.def = function(id, def) {
    vars += (vars ? ',\n' + tab + '    ' : '') + id + (def !== undefined ? ' = ' + def : '');
    return builder;
  };

  builder.toSource = function() {
    return (
      'function ' +
      name +
      '(' +
      args.join(', ') +
      ') {\n' +
      tab +
      '"use strict"' +
      '\n' +
      (vars ? tab + 'var ' + vars + ';\n' : '') +
      lines +
      '}'
    );
  };

  builder.compile = function(scope) {
    var src = 'return (' + builder.toSource() + ')',
      scp = scope || {},
      keys = Object.keys(scp),
      vals = keys.map(function(key) {
        return scp[key];
      });

    return Function.apply(null, keys.concat(src)).apply(null, vals);
  };

  return builder;
};

function type(obj) {
  var str = Object.prototype.toString.call(obj);
  return str.substr(8, str.length - 9).toLowerCase();
}

function deepEqual(a, b) {
  var keysA = Object.keys(a).sort(),
    keysB = Object.keys(b).sort(),
    i,
    key;

  if (!equal(keysA, keysB)) {
    return false;
  }

  for (i = 0; i < keysA.length; i++) {
    key = keysA[i];

    if (!equal(a[key], b[key])) {
      return false;
    }
  }

  return true;
}

function equal(a, b) {
  // jshint ignore: line
  var typeA = typeof a,
    typeB = typeof b,
    i;

  // get detailed object type
  if (typeA === 'object') {
    typeA = type(a);
  }

  // get detailed object type
  if (typeB === 'object') {
    typeB = type(b);
  }

  if (typeA !== typeB) {
    return false;
  }

  if (typeA === 'object') {
    return deepEqual(a, b);
  }

  if (typeA === 'regexp') {
    return a.toString() === b.toString();
  }

  if (typeA === 'array') {
    if (a.length !== b.length) {
      return false;
    }

    for (i = 0; i < a.length; i++) {
      if (!equal(a[i], b[i])) {
        return false;
      }
    }

    return true;
  }

  return a === b;
}

var equal_1 = equal;

function findIndex(arr, value, comparator) {
  for (var i = 0, len = arr.length; i < len; i++) {
    if (comparator(arr[i], value)) {
      return i;
    }
  }

  return -1;
}

var unique = function unique(arr) {
  return arr.filter(function uniqueOnly(value, index, self) {
    return findIndex(self, value, equal_1) === index;
  });
};

var findIndex_1 = findIndex;
unique.findIndex = findIndex_1;

var id = 'http://json-schema.org/draft-04/schema#';
var $schema = 'http://json-schema.org/draft-04/schema#';
var description = 'Core schema meta-schema';
var definitions = {
  schemaArray: {
    type: 'array',
    minItems: 1,
    items: {
      $ref: '#'
    }
  },
  positiveInteger: {
    type: 'integer',
    minimum: 0
  },
  positiveIntegerDefault0: {
    allOf: [
      {
        $ref: '#/definitions/positiveInteger'
      },
      {
        default: 0
      }
    ]
  },
  simpleTypes: {
    enum: ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string']
  },
  stringArray: {
    type: 'array',
    items: {
      type: 'string'
    },
    minItems: 1,
    uniqueItems: true
  }
};
var type$1 = 'object';
var properties = {
  id: {
    type: 'string',
    format: 'uri'
  },
  $schema: {
    type: 'string',
    format: 'uri'
  },
  title: {
    type: 'string'
  },
  description: {
    type: 'string'
  },
  default: {},
  multipleOf: {
    type: 'number',
    minimum: 0,
    exclusiveMinimum: true
  },
  maximum: {
    type: 'number'
  },
  exclusiveMaximum: {
    type: 'boolean',
    default: false
  },
  minimum: {
    type: 'number'
  },
  exclusiveMinimum: {
    type: 'boolean',
    default: false
  },
  maxLength: {
    $ref: '#/definitions/positiveInteger'
  },
  minLength: {
    $ref: '#/definitions/positiveIntegerDefault0'
  },
  pattern: {
    type: 'string',
    format: 'regex'
  },
  additionalItems: {
    anyOf: [
      {
        type: 'boolean'
      },
      {
        $ref: '#'
      }
    ],
    default: {}
  },
  items: {
    anyOf: [
      {
        $ref: '#'
      },
      {
        $ref: '#/definitions/schemaArray'
      }
    ],
    default: {}
  },
  maxItems: {
    $ref: '#/definitions/positiveInteger'
  },
  minItems: {
    $ref: '#/definitions/positiveIntegerDefault0'
  },
  uniqueItems: {
    type: 'boolean',
    default: false
  },
  maxProperties: {
    $ref: '#/definitions/positiveInteger'
  },
  minProperties: {
    $ref: '#/definitions/positiveIntegerDefault0'
  },
  required: {
    $ref: '#/definitions/stringArray'
  },
  additionalProperties: {
    anyOf: [
      {
        type: 'boolean'
      },
      {
        $ref: '#'
      }
    ],
    default: {}
  },
  definitions: {
    type: 'object',
    additionalProperties: {
      $ref: '#'
    },
    default: {}
  },
  properties: {
    type: 'object',
    additionalProperties: {
      $ref: '#'
    },
    default: {}
  },
  patternProperties: {
    type: 'object',
    additionalProperties: {
      $ref: '#'
    },
    default: {}
  },
  dependencies: {
    type: 'object',
    additionalProperties: {
      anyOf: [
        {
          $ref: '#'
        },
        {
          $ref: '#/definitions/stringArray'
        }
      ]
    }
  },
  enum: {
    type: 'array',
    minItems: 1,
    uniqueItems: true
  },
  type: {
    anyOf: [
      {
        $ref: '#/definitions/simpleTypes'
      },
      {
        type: 'array',
        items: {
          $ref: '#/definitions/simpleTypes'
        },
        minItems: 1,
        uniqueItems: true
      }
    ]
  },
  allOf: {
    $ref: '#/definitions/schemaArray'
  },
  anyOf: {
    $ref: '#/definitions/schemaArray'
  },
  oneOf: {
    $ref: '#/definitions/schemaArray'
  },
  not: {
    $ref: '#'
  }
};
var dependencies = {
  exclusiveMaximum: ['maximum'],
  exclusiveMinimum: ['minimum']
};
var metaschema = {
  id: id,
  $schema: $schema,
  description: description,
  definitions: definitions,
  type: type$1,
  properties: properties,
  dependencies: dependencies,
  default: {}
};

var INVALID_SCHEMA_REFERENCE = 'jsen: invalid schema reference',
  DUPLICATE_SCHEMA_ID = 'jsen: duplicate schema id',
  CIRCULAR_SCHEMA_REFERENCE = 'jsen: circular schema reference';

function get(obj, path) {
  if (!path.length) {
    return obj;
  }

  var key = path.shift(),
    val;

  if (obj && typeof obj === 'object' && obj.hasOwnProperty(key)) {
    val = obj[key];
  }

  if (path.length) {
    if (val && typeof val === 'object') {
      return get(val, path);
    }

    return undefined;
  }

  return val;
}

function refToObj(ref) {
  var index = ref.indexOf('#'),
    ret = {
      base: ref.substr(0, index),
      path: []
    };

  if (index < 0) {
    ret.base = ref;
    return ret;
  }

  ref = ref.substr(index + 1);

  if (!ref) {
    return ret;
  }

  ret.path = ref.split('/').map(function(segment) {
    // Reference: http://tools.ietf.org/html/draft-ietf-appsawg-json-pointer-08#section-3
    return decodeURIComponent(segment)
      .replace(/~1/g, '/')
      .replace(/~0/g, '~');
  });

  if (ref[0] === '/') {
    ret.path.shift();
  }

  return ret;
}

// TODO: Can we prevent nested resolvers and combine schemas instead?
function SchemaResolver(rootSchema, external, missing$Ref, baseId) {
  // jshint ignore: line
  this.rootSchema = rootSchema;
  this.resolvers = null;
  this.resolvedRootSchema = null;
  this.cache = {};
  this.idCache = {};
  this.refCache = { refs: [], schemas: [] };
  this.missing$Ref = missing$Ref;
  this.refStack = [];

  baseId = baseId || '';

  this._buildIdCache(rootSchema, baseId);

  // get updated base id after normalizing root schema id
  baseId = this.refCache.refs[this.refCache.schemas.indexOf(this.rootSchema)] || baseId;

  this._buildResolvers(external, baseId);
}

SchemaResolver.prototype._cacheId = function(id, schema, resolver) {
  if (this.idCache[id]) {
    throw new Error(DUPLICATE_SCHEMA_ID + ' ' + id);
  }

  this.idCache[id] = { resolver: resolver, schema: schema };
};

SchemaResolver.prototype._buildIdCache = function(schema, baseId) {
  var id = baseId,
    ref,
    keys,
    i;

  if (!schema || typeof schema !== 'object') {
    return;
  }

  if (typeof schema.id === 'string' && schema.id) {
    id = url__default['default'].resolve(baseId, schema.id);

    this._cacheId(id, schema, this);
  } else if (schema === this.rootSchema && baseId) {
    this._cacheId(baseId, schema, this);
  }

  if (schema.$ref && typeof schema.$ref === 'string') {
    ref = url__default['default'].resolve(id, schema.$ref);

    this.refCache.schemas.push(schema);
    this.refCache.refs.push(ref);
  }

  keys = Object.keys(schema);

  for (i = 0; i < keys.length; i++) {
    this._buildIdCache(schema[keys[i]], id);
  }
};

SchemaResolver.prototype._buildResolvers = function(schemas, baseId) {
  if (!schemas || typeof schemas !== 'object') {
    return;
  }

  var that = this,
    resolvers = {};

  Object.keys(schemas).forEach(function(key) {
    var id = url__default['default'].resolve(baseId, key),
      resolver = new SchemaResolver(schemas[key], null, that.missing$Ref, id);

    that._cacheId(id, resolver.rootSchema, resolver);

    Object.keys(resolver.idCache).forEach(function(idKey) {
      that.idCache[idKey] = resolver.idCache[idKey];
    });

    resolvers[key] = resolver;
  });

  this.resolvers = resolvers;
};

SchemaResolver.prototype.getNormalizedRef = function(schema) {
  var index = this.refCache.schemas.indexOf(schema);
  return this.refCache.refs[index];
};

SchemaResolver.prototype._resolveRef = function(ref) {
  var err = new Error(INVALID_SCHEMA_REFERENCE + ' ' + ref),
    idCache = this.idCache,
    externalResolver,
    cached,
    descriptor,
    path,
    dest;

  if (!ref || typeof ref !== 'string') {
    throw err;
  }

  if (ref === metaschema.id) {
    dest = metaschema;
  }

  cached = idCache[ref];

  if (cached) {
    dest = cached.resolver.resolve(cached.schema);
  }

  if (dest === undefined) {
    descriptor = refToObj(ref);
    path = descriptor.path;

    if (descriptor.base) {
      cached = idCache[descriptor.base] || idCache[descriptor.base + '#'];

      if (cached) {
        dest = cached.resolver.resolve(get(cached.schema, path.slice(0)));
      } else {
        path.unshift(descriptor.base);
      }
    }
  }

  if (dest === undefined && this.resolvedRootSchema) {
    dest = get(this.resolvedRootSchema, path.slice(0));
  }

  if (dest === undefined) {
    dest = get(this.rootSchema, path.slice(0));
  }

  if (dest === undefined && path.length && this.resolvers) {
    externalResolver = get(this.resolvers, path);

    if (externalResolver) {
      dest = externalResolver.resolve(externalResolver.rootSchema);
    }
  }

  if (dest === undefined || typeof dest !== 'object') {
    if (this.missing$Ref) {
      dest = {};
    } else {
      throw err;
    }
  }

  if (this.cache[ref] === dest) {
    return dest;
  }

  this.cache[ref] = dest;

  if (dest.$ref !== undefined) {
    dest = this.resolve(dest);
  }

  return dest;
};

SchemaResolver.prototype.resolve = function(schema) {
  if (!schema || typeof schema !== 'object' || schema.$ref === undefined) {
    return schema;
  }

  var ref = this.getNormalizedRef(schema) || schema.$ref,
    resolved = this.cache[ref];

  if (resolved !== undefined) {
    return resolved;
  }

  if (this.refStack.indexOf(ref) > -1) {
    throw new Error(CIRCULAR_SCHEMA_REFERENCE + ' ' + ref);
  }

  this.refStack.push(ref);

  resolved = this._resolveRef(ref);

  this.refStack.pop();

  if (schema === this.rootSchema) {
    // cache the resolved root schema
    this.resolvedRootSchema = resolved;
  }

  return resolved;
};

SchemaResolver.prototype.hasRef = function(schema) {
  var keys = Object.keys(schema),
    len,
    key,
    i,
    hasChildRef;

  if (keys.indexOf('$ref') > -1) {
    return true;
  }

  for (i = 0, len = keys.length; i < len; i++) {
    key = keys[i];

    if (schema[key] && typeof schema[key] === 'object' && !Array.isArray(schema[key])) {
      hasChildRef = this.hasRef(schema[key]);

      if (hasChildRef) {
        return true;
      }
    }
  }

  return false;
};

SchemaResolver.resolvePointer = function(obj, pointer) {
  var descriptor = refToObj(pointer),
    path = descriptor.path;

  if (descriptor.base) {
    path = [descriptor.base].concat(path);
  }

  return get(obj, path);
};

var resolver = SchemaResolver;

var formats = {};

// reference: http://dansnetwork.com/javascript-iso8601rfc3339-date-parser/
formats['date-time'] = /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))/;
// reference: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js#L7
formats.uri = /^([a-zA-Z][a-zA-Z0-9+-.]*:){0,1}\/\/[^\s]*$/;
// reference: http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
//            http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'willful violation')
formats.email = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
// reference: https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
formats.ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
// reference: http://stackoverflow.com/questions/53497/regular-expression-that-matches-valid-ipv6-addresses
formats.ipv6 = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|[fF][eE]80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::([fF]{4}(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
// reference: http://stackoverflow.com/questions/106179/regular-expression-to-match-dns-hostname-or-ip-address#answer-3824105
formats.hostname = /^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]))*$/;

var formats_1 = formats;

// Reference: https://github.com/bestiejs/punycode.js/blob/master/punycode.js#L101`
// Info: https://mathiasbynens.be/notes/javascript-unicode
function ucs2length(string) {
  var ucs2len = 0,
    counter = 0,
    length = string.length,
    value,
    extra;

  while (counter < length) {
    ucs2len++;
    value = string.charCodeAt(counter++);

    if (value >= 0xd800 && value <= 0xdbff && counter < length) {
      // It's a high surrogate, and there is a next character.
      extra = string.charCodeAt(counter++);

      if ((extra & 0xfc00) !== 0xdc00) {
        /* Low surrogate. */ // jshint ignore: line
        counter--;
      }
    }
  }

  return ucs2len;
}

var ucs2length_1 = ucs2length;

var REGEX_ESCAPE_EXPR = /[\/]/g,
  STR_ESCAPE_EXPR = /(")/gim,
  VALID_IDENTIFIER_EXPR = /^[a-z_$][0-9a-z]*$/gi,
  INVALID_SCHEMA = 'jsen: invalid schema object',
  browser = typeof window === 'object' && !!window.navigator, // jshint ignore: line
  regescape = new RegExp('/').source !== '/',
  types = {},
  keywords = {};

function inlineRegex(regex) {
  regex = regex instanceof RegExp ? regex : new RegExp(regex);

  return regescape ? regex.toString() : '/' + regex.source.replace(REGEX_ESCAPE_EXPR, '\\$&') + '/';
}

function encodeStr(str) {
  return '"' + str.replace(STR_ESCAPE_EXPR, '\\$1') + '"';
}

function appendToPath(path, key) {
  VALID_IDENTIFIER_EXPR.lastIndex = 0;

  return VALID_IDENTIFIER_EXPR.test(key) ? path + '.' + key : path + '[' + encodeStr(key) + ']';
}

function type$2(obj) {
  if (obj === undefined) {
    return 'undefined';
  }

  var str = Object.prototype.toString.call(obj);
  return str.substr(8, str.length - 9).toLowerCase();
}

function isInteger(obj) {
  return (obj | 0) === obj; // jshint ignore: line
}

types['null'] = function(path) {
  return path + ' === null';
};

types.boolean = function(path) {
  return 'typeof ' + path + ' === "boolean"';
};

types.string = function(path) {
  return 'typeof ' + path + ' === "string"';
};

types.number = function(path) {
  return 'typeof ' + path + ' === "number"';
};

types.integer = function(path) {
  return 'typeof ' + path + ' === "number" && !(' + path + ' % 1)';
};

types.array = function(path) {
  return 'Array.isArray(' + path + ')';
};

types.object = function(path) {
  return 'typeof ' + path + ' === "object" && ' + path + ' !== null && !Array.isArray(' + path + ')';
};

types.date = function(path) {
  return path + ' instanceof Date';
};

keywords.enum = function(context) {
  var arr = context.schema['enum'];

  context.code('if (!equalAny(' + context.path + ', ' + JSON.stringify(arr) + ')) {');
  context.error('enum');
  context.code('}');
};

keywords.minimum = function(context) {
  if (typeof context.schema.minimum === 'number') {
    context.code('if (' + context.path + ' < ' + context.schema.minimum + ') {');
    context.error('minimum');
    context.code('}');
  }
};

keywords.exclusiveMinimum = function(context) {
  if (context.schema.exclusiveMinimum === true && typeof context.schema.minimum === 'number') {
    context.code('if (' + context.path + ' === ' + context.schema.minimum + ') {');
    context.error('exclusiveMinimum');
    context.code('}');
  }
};

keywords.maximum = function(context) {
  if (typeof context.schema.maximum === 'number') {
    context.code('if (' + context.path + ' > ' + context.schema.maximum + ') {');
    context.error('maximum');
    context.code('}');
  }
};

keywords.exclusiveMaximum = function(context) {
  if (context.schema.exclusiveMaximum === true && typeof context.schema.maximum === 'number') {
    context.code('if (' + context.path + ' === ' + context.schema.maximum + ') {');
    context.error('exclusiveMaximum');
    context.code('}');
  }
};

keywords.multipleOf = function(context) {
  if (typeof context.schema.multipleOf === 'number') {
    var mul = context.schema.multipleOf,
      decimals = mul.toString().length - mul.toFixed(0).length - 1,
      pow = decimals > 0 ? Math.pow(10, decimals) : 1,
      path = context.path;

    if (decimals > 0) {
      context.code(
        'if (+(Math.round((' +
          path +
          ' * ' +
          pow +
          ') + "e+" + ' +
          decimals +
          ') + "e-" + ' +
          decimals +
          ') % ' +
          mul * pow +
          ' !== 0) {'
      );
    } else {
      context.code('if (((' + path + ' * ' + pow + ') % ' + mul * pow + ') !== 0) {');
    }

    context.error('multipleOf');
    context.code('}');
  }
};

keywords.minLength = function(context) {
  if (isInteger(context.schema.minLength)) {
    context.code('if (ucs2length(' + context.path + ') < ' + context.schema.minLength + ') {');
    context.error('minLength');
    context.code('}');
  }
};

keywords.maxLength = function(context) {
  if (isInteger(context.schema.maxLength)) {
    context.code('if (ucs2length(' + context.path + ') > ' + context.schema.maxLength + ') {');
    context.error('maxLength');
    context.code('}');
  }
};

keywords.pattern = function(context) {
  var pattern = context.schema.pattern;

  if (typeof pattern === 'string' || pattern instanceof RegExp) {
    context.code('if (!(' + inlineRegex(pattern) + ').test(' + context.path + ')) {');
    context.error('pattern');
    context.code('}');
  }
};

keywords.format = function(context) {
  if (typeof context.schema.format !== 'string' || !formats_1[context.schema.format]) {
    return;
  }

  context.code('if (!(' + formats_1[context.schema.format] + ').test(' + context.path + ')) {');
  context.error('format');
  context.code('}');
};

keywords.minItems = function(context) {
  if (isInteger(context.schema.minItems)) {
    context.code('if (' + context.path + '.length < ' + context.schema.minItems + ') {');
    context.error('minItems');
    context.code('}');
  }
};

keywords.maxItems = function(context) {
  if (isInteger(context.schema.maxItems)) {
    context.code('if (' + context.path + '.length > ' + context.schema.maxItems + ') {');
    context.error('maxItems');
    context.code('}');
  }
};

keywords.additionalItems = function(context) {
  if (context.schema.additionalItems === false && Array.isArray(context.schema.items)) {
    context.code('if (' + context.path + '.length > ' + context.schema.items.length + ') {');
    context.error('additionalItems');
    context.code('}');
  }
};

keywords.uniqueItems = function(context) {
  if (context.schema.uniqueItems) {
    context.code('if (unique(' + context.path + ').length !== ' + context.path + '.length) {');
    context.error('uniqueItems');
    context.code('}');
  }
};

keywords.items = function(context) {
  var index = context.declare(0),
    i = 0;

  if (type$2(context.schema.items) === 'object') {
    context.code('for (' + index + ' = 0; ' + index + ' < ' + context.path + '.length; ' + index + '++) {');

    context.descend(context.path + '[' + index + ']', context.schema.items);

    context.code('}');
  } else if (Array.isArray(context.schema.items)) {
    for (; i < context.schema.items.length; i++) {
      context.code('if (' + context.path + '.length - 1 >= ' + i + ') {');

      context.descend(context.path + '[' + i + ']', context.schema.items[i]);

      context.code('}');
    }

    if (type$2(context.schema.additionalItems) === 'object') {
      context.code('for (' + index + ' = ' + i + '; ' + index + ' < ' + context.path + '.length; ' + index + '++) {');

      context.descend(context.path + '[' + index + ']', context.schema.additionalItems);

      context.code('}');
    }
  }
};

keywords.maxProperties = function(context) {
  if (isInteger(context.schema.maxProperties)) {
    context.code('if (Object.keys(' + context.path + ').length > ' + context.schema.maxProperties + ') {');
    context.error('maxProperties');
    context.code('}');
  }
};

keywords.minProperties = function(context) {
  if (isInteger(context.schema.minProperties)) {
    context.code('if (Object.keys(' + context.path + ').length < ' + context.schema.minProperties + ') {');
    context.error('minProperties');
    context.code('}');
  }
};

keywords.required = function(context) {
  var required = context.schema.required,
    properties = context.schema.properties,
    i;

  if (!Array.isArray(required)) {
    return;
  }

  for (i = 0; i < required.length; i++) {
    if (properties && properties[required[i]] && typeof properties[required[i]] === 'object') {
      continue;
    }

    context.code('if (' + appendToPath(context.path, required[i]) + ' === undefined) {');
    context.error('required', required[i]);
    context.code('}');
  }
};

keywords.properties = function(context) {
  var props = context.schema.properties,
    propKeys = type$2(props) === 'object' ? Object.keys(props) : [],
    required = Array.isArray(context.schema.required) ? context.schema.required : [],
    prop,
    i,
    nestedPath;

  if (!propKeys.length) {
    return;
  }

  for (i = 0; i < propKeys.length; i++) {
    prop = propKeys[i];
    nestedPath = appendToPath(context.path, prop);

    context.code('if (' + nestedPath + ' !== undefined) {');

    context.descend(nestedPath, props[prop]);

    context.code('}');

    if (required.indexOf(prop) > -1) {
      context.code('else {');
      context.error('required', prop);
      context.code('}');
    }
  }
};

keywords.patternProperties = keywords.additionalProperties = function(context) {
  var propKeys = type$2(context.schema.properties) === 'object' ? Object.keys(context.schema.properties) : [],
    patProps = context.schema.patternProperties,
    patterns = type$2(patProps) === 'object' ? Object.keys(patProps) : [],
    addProps = context.schema.additionalProperties,
    addPropsCheck = addProps === false || type$2(addProps) === 'object',
    props,
    keys,
    key,
    n,
    found,
    pattern,
    i;

  if (!patterns.length && !addPropsCheck) {
    return;
  }

  keys = context.declare('[]');
  key = context.declare('""');
  n = context.declare(0);

  if (addPropsCheck) {
    found = context.declare(false);
  }

  context.code(keys + ' = Object.keys(' + context.path + ')');

  context.code('for (' + n + ' = 0; ' + n + ' < ' + keys + '.length; ' + n + '++) {')(
    key + ' = ' + keys + '[' + n + ']'
  )('if (' + context.path + '[' + key + '] === undefined) {')('continue')('}');

  if (addPropsCheck) {
    context.code(found + ' = false');
  }

  // validate pattern properties
  for (i = 0; i < patterns.length; i++) {
    pattern = patterns[i];

    context.code('if ((' + inlineRegex(pattern) + ').test(' + key + ')) {');

    context.descend(context.path + '[' + key + ']', patProps[pattern]);

    if (addPropsCheck) {
      context.code(found + ' = true');
    }

    context.code('}');
  }

  // validate additional properties
  if (addPropsCheck) {
    if (propKeys.length) {
      props = context.declare(JSON.stringify(propKeys));

      // do not validate regular properties
      context.code('if (' + props + '.indexOf(' + key + ') > -1) {')('continue')('}');
    }

    context.code('if (!' + found + ') {');

    if (addProps === false) {
      // do not allow additional properties
      context.error('additionalProperties', undefined, key);
    } else {
      // validate additional properties
      context.descend(context.path + '[' + key + ']', addProps);
    }

    context.code('}');
  }

  context.code('}');
};

keywords.dependencies = function(context) {
  if (type$2(context.schema.dependencies) !== 'object') {
    return;
  }

  var depKeys = Object.keys(context.schema.dependencies),
    len = depKeys.length,
    key,
    dep,
    i = 0,
    k = 0;

  for (; k < len; k++) {
    key = depKeys[k];
    dep = context.schema.dependencies[key];

    context.code('if (' + appendToPath(context.path, key) + ' !== undefined) {');

    if (type$2(dep) === 'object') {
      //schema dependency
      context.descend(context.path, dep);
    } else {
      // property dependency
      for (i; i < dep.length; i++) {
        context.code('if (' + appendToPath(context.path, dep[i]) + ' === undefined) {');
        context.error('dependencies', dep[i]);
        context.code('}');
      }
    }

    context.code('}');
  }
};

keywords.allOf = function(context) {
  if (!Array.isArray(context.schema.allOf)) {
    return;
  }

  for (var i = 0; i < context.schema.allOf.length; i++) {
    context.descend(context.path, context.schema.allOf[i]);
  }
};

keywords.anyOf = function(context) {
  if (!Array.isArray(context.schema.anyOf)) {
    return;
  }

  var greedy = context.greedy,
    errCount = context.declare(0),
    initialCount = context.declare(0),
    found = context.declare(false),
    i = 0;

  context.code(initialCount + ' = errors.length');

  for (; i < context.schema.anyOf.length; i++) {
    context.code('if (!' + found + ') {');

    context.code(errCount + ' = errors.length');

    context.greedy = true;

    context.descend(context.path, context.schema.anyOf[i]);

    context.code(found + ' = errors.length === ' + errCount)('}');
  }

  context.greedy = greedy;

  context.code('if (!' + found + ') {');

  context.error('anyOf');

  context.code('} else {')('errors.length = ' + initialCount)('}');
};

keywords.oneOf = function(context) {
  if (!Array.isArray(context.schema.oneOf)) {
    return;
  }

  var greedy = context.greedy,
    matching = context.declare(0),
    initialCount = context.declare(0),
    errCount = context.declare(0),
    i = 0;

  context.code(initialCount + ' = errors.length');
  context.code(matching + ' = 0');

  for (; i < context.schema.oneOf.length; i++) {
    context.code(errCount + ' = errors.length');

    context.greedy = true;

    context.descend(context.path, context.schema.oneOf[i]);

    context.code('if (errors.length === ' + errCount + ') {')(matching + '++')('}');
  }

  context.greedy = greedy;

  context.code('if (' + matching + ' !== 1) {');

  context.error('oneOf');

  context.code('} else {')('errors.length = ' + initialCount)('}');
};

keywords.not = function(context) {
  if (type$2(context.schema.not) !== 'object') {
    return;
  }

  var greedy = context.greedy,
    errCount = context.declare(0);

  context.code(errCount + ' = errors.length');

  context.greedy = true;

  context.descend(context.path, context.schema.not);

  context.greedy = greedy;

  context.code('if (errors.length === ' + errCount + ') {');

  context.error('not');

  context.code('} else {')('errors.length = ' + errCount)('}');
};

function decorateGenerator(type, keyword) {
  keywords[keyword].type = type;
  keywords[keyword].keyword = keyword;
}

['minimum', 'exclusiveMinimum', 'maximum', 'exclusiveMaximum', 'multipleOf'].forEach(
  decorateGenerator.bind(null, 'number')
);

['minLength', 'maxLength', 'pattern', 'format'].forEach(decorateGenerator.bind(null, 'string'));

['minItems', 'maxItems', 'additionalItems', 'uniqueItems', 'items'].forEach(decorateGenerator.bind(null, 'array'));

[
  'maxProperties',
  'minProperties',
  'required',
  'properties',
  'patternProperties',
  'additionalProperties',
  'dependencies'
].forEach(decorateGenerator.bind(null, 'object'));

['enum', 'allOf', 'anyOf', 'oneOf', 'not'].forEach(decorateGenerator.bind(null, null));

function groupKeywords(schema) {
  var keys = Object.keys(schema),
    patIndex = keys.indexOf('patternProperties'),
    ret = {
      enum: Array.isArray(schema.enum) && schema.enum.length > 0,
      type: null,
      allType: [],
      perType: {}
    },
    key,
    gen,
    i;

  if (schema.type) {
    if (typeof schema.type === 'string') {
      ret.type = [schema.type];
    } else if (Array.isArray(schema.type) && schema.type.length) {
      ret.type = schema.type.slice(0);
    }
  }

  for (i = 0; i < keys.length; i++) {
    key = keys[i];

    if (key === 'enum' || key === 'type') {
      continue;
    }

    gen = keywords[key];

    if (!gen) {
      continue;
    }

    if (gen.type) {
      if (!ret.perType[gen.type]) {
        ret.perType[gen.type] = [];
      }

      if (!(patIndex > -1 && key === 'additionalProperties')) {
        ret.perType[gen.type].push(key);
      }
    } else {
      ret.allType.push(key);
    }
  }

  return ret;
}

function getPathExpression(path, key) {
  var path_ = path.substr(4),
    len = path_.length,
    tokens = [],
    token = '',
    isvar = false,
    char,
    i;

  for (i = 0; i < len; i++) {
    char = path_[i];

    switch (char) {
      case '.':
        if (token) {
          token += char;
        }
        break;
      case '[':
        if (isNaN(+path_[i + 1])) {
          isvar = true;

          if (token) {
            tokens.push('"' + token + '"');
            token = '';
          }
        } else {
          isvar = false;

          if (token) {
            token += '.';
          }
        }
        break;
      case ']':
        tokens.push(isvar ? token : '"' + token + '"');
        token = '';
        break;
      default:
        token += char;
    }
  }

  if (token) {
    tokens.push('"' + token + '"');
  }

  if (key) {
    tokens.push('"' + key + '"');
  }

  if (tokens.length === 1 && isvar) {
    return '"" + ' + tokens[0] + ' + ""';
  }

  return tokens.join(' + "." + ') || '""';
}

function clone(obj) {
  var cloned = obj,
    objType = type$2(obj),
    keys,
    len,
    key,
    i;

  if (objType === 'object') {
    cloned = {};
    keys = Object.keys(obj);

    for (i = 0, len = keys.length; i < len; i++) {
      key = keys[i];
      cloned[key] = clone(obj[key]);
    }
  } else if (objType === 'array') {
    cloned = [];

    for (i = 0, len = obj.length; i < len; i++) {
      cloned[i] = clone(obj[i]);
    }
  } else if (objType === 'regexp') {
    return new RegExp(obj);
  } else if (objType === 'date') {
    return new Date(obj.toJSON());
  }

  return cloned;
}

function equalAny(obj, options) {
  for (var i = 0, len = options.length; i < len; i++) {
    if (equal_1(obj, options[i])) {
      return true;
    }
  }

  return false;
}

function PropertyMarker() {
  this.objects = [];
  this.properties = [];
}

PropertyMarker.prototype.mark = function(obj, key) {
  var index = this.objects.indexOf(obj),
    prop;

  if (index < 0) {
    this.objects.push(obj);

    prop = {};
    prop[key] = 1;

    this.properties.push(prop);

    return;
  }

  prop = this.properties[index];

  prop[key] = prop[key] ? prop[key] + 1 : 1;
};

PropertyMarker.prototype.deleteDuplicates = function() {
  var props, keys, key, i, j;

  for (i = 0; i < this.properties.length; i++) {
    props = this.properties[i];
    keys = Object.keys(props);

    for (j = 0; j < keys.length; j++) {
      key = keys[j];

      if (props[key] > 1) {
        delete this.objects[i][key];
      }
    }
  }
};

PropertyMarker.prototype.dispose = function() {
  this.objects.length = 0;
  this.properties.length = 0;
};

function build(schema, def, additional, resolver, parentMarker) {
  var defType, defValue, key, i, propertyMarker, props, defProps;

  if (type$2(schema) !== 'object') {
    return def;
  }

  schema = resolver.resolve(schema);

  if (def === undefined && schema.hasOwnProperty('default')) {
    def = clone(schema['default']);
  }

  defType = type$2(def);

  if (defType === 'object' && type$2(schema.properties) === 'object') {
    props = Object.keys(schema.properties);

    for (i = 0; i < props.length; i++) {
      key = props[i];
      defValue = build(schema.properties[key], def[key], additional, resolver);

      if (defValue !== undefined) {
        def[key] = defValue;
      }
    }

    if (additional !== 'always') {
      defProps = Object.keys(def);

      for (i = 0; i < defProps.length; i++) {
        key = defProps[i];

        if (
          props.indexOf(key) < 0 &&
          (schema.additionalProperties === false || (additional === false && !schema.additionalProperties))
        ) {
          if (parentMarker) {
            parentMarker.mark(def, key);
          } else {
            delete def[key];
          }
        }
      }
    }
  } else if (defType === 'array' && schema.items) {
    if (type$2(schema.items) === 'array') {
      for (i = 0; i < schema.items.length; i++) {
        defValue = build(schema.items[i], def[i], additional, resolver);

        if (defValue !== undefined || i < def.length) {
          def[i] = defValue;
        }
      }
    } else if (def.length) {
      for (i = 0; i < def.length; i++) {
        def[i] = build(schema.items, def[i], additional, resolver);
      }
    }
  } else if (type$2(schema.allOf) === 'array' && schema.allOf.length) {
    propertyMarker = new PropertyMarker();

    for (i = 0; i < schema.allOf.length; i++) {
      def = build(schema.allOf[i], def, additional, resolver, propertyMarker);
    }

    propertyMarker.deleteDuplicates();
    propertyMarker.dispose();
  }

  return def;
}

function ValidationContext(options) {
  this.path = 'data';
  this.schema = options.schema;
  this.formats = options.formats;
  this.greedy = options.greedy;
  this.resolver = options.resolver;
  this.id = options.id;
  this.funcache = options.funcache || {};
  this.scope = options.scope || {
    equalAny: equalAny,
    unique: unique,
    ucs2length: ucs2length_1,
    refs: {}
  };
}

ValidationContext.prototype.clone = function(schema) {
  var ctx = new ValidationContext({
    schema: schema,
    formats: this.formats,
    greedy: this.greedy,
    resolver: this.resolver,
    id: this.id,
    funcache: this.funcache,
    scope: this.scope
  });

  return ctx;
};

ValidationContext.prototype.declare = function(def) {
  var variname = this.id();
  this.code.def(variname, def);
  return variname;
};

ValidationContext.prototype.cache = function(cacheKey, schema) {
  var cached = this.funcache[cacheKey],
    context;

  if (!cached) {
    cached = this.funcache[cacheKey] = {
      key: this.id()
    };

    context = this.clone(schema);

    cached.func = context.compile(cached.key);

    this.scope.refs[cached.key] = cached.func;

    context.dispose();
  }

  return 'refs.' + cached.key;
};

ValidationContext.prototype.error = function(keyword, key, additional) {
  var schema = this.schema,
    path = this.path,
    errorPath = path !== 'data' || key ? '(path ? path + "." : "") + ' + getPathExpression(path, key) + ',' : 'path,',
    res = key && schema.properties && schema.properties[key] ? this.resolver.resolve(schema.properties[key]) : null,
    message = res ? res.requiredMessage : schema.invalidMessage;

  if (!message) {
    message = (res && res.messages && res.messages[keyword]) || (schema.messages && schema.messages[keyword]);
  }

  this.code('errors.push({');

  if (message) {
    this.code('message: ' + encodeStr(message) + ',');
  }

  if (additional) {
    this.code('additionalProperties: ' + additional + ',');
  }

  this.code('path: ' + errorPath)('keyword: ' + encodeStr(keyword))('})');

  if (!this.greedy) {
    this.code('return');
  }
};

ValidationContext.prototype.refactor = function(path, schema, cacheKey) {
  var parentPathExp = path !== 'data' ? '(path ? path + "." : "") + ' + getPathExpression(path) : 'path',
    cachedRef = this.cache(cacheKey, schema),
    refErrors = this.declare();

  this.code(refErrors + ' = ' + cachedRef + '(' + path + ', ' + parentPathExp + ', errors)');

  if (!this.greedy) {
    this.code('if (errors.length) { return }');
  }
};

ValidationContext.prototype.descend = function(path, schema) {
  var origPath = this.path,
    origSchema = this.schema;

  this.path = path;
  this.schema = schema;

  this.generate();

  this.path = origPath;
  this.schema = origSchema;
};

ValidationContext.prototype.generate = function() {
  var path = this.path,
    schema = this.schema,
    context = this,
    scope = this.scope,
    encodedFormat,
    format,
    schemaKeys,
    typeKeys,
    typeIndex,
    validatedType,
    i;

  if (type$2(schema) !== 'object') {
    return;
  }

  if (schema.$ref !== undefined) {
    schema = this.resolver.resolve(schema);

    if (this.resolver.hasRef(schema)) {
      this.refactor(path, schema, this.resolver.getNormalizedRef(this.schema) || this.schema.$ref);

      return;
    } else {
      // substitute $ref schema with the resolved instance
      this.schema = schema;
    }
  }

  schemaKeys = groupKeywords(schema);

  if (schemaKeys.enum) {
    keywords.enum(context);

    return; // do not process the schema further
  }

  typeKeys = Object.keys(schemaKeys.perType);

  function generateForKeyword(keyword) {
    keywords[keyword](context); // jshint ignore: line
  }

  var hasType = schemaKeys.type && schemaKeys.type.length;
  if (hasType) {
    this.code(
      'if (!(' +
        schemaKeys.type
          .map(function(type) {
            return types[type] ? types[type](path) : 'true';
          })
          .join(' || ') +
        ')) {'
    );
    this.error('type');
    this.code('}');
  }

  for (i = 0; i < typeKeys.length; i++) {
    validatedType = typeKeys[i];

    this.code((hasType ? 'else ' : '') + 'if (' + types[validatedType](path) + ') {');

    schemaKeys.perType[validatedType].forEach(generateForKeyword);

    this.code('}');

    if (schemaKeys.type) {
      typeIndex = schemaKeys.type.indexOf(validatedType);

      if (typeIndex > -1) {
        schemaKeys.type.splice(typeIndex, 1);
      }
    }
  }

  if (schemaKeys.type && !schemaKeys.type.length) {
    this.code('else {');
    this.error('type');
    this.code('}');
  }

  schemaKeys.allType.forEach(function(keyword) {
    keywords[keyword](context);
  });

  if (schema.format && this.formats) {
    format = this.formats[schema.format];

    if (format) {
      if (typeof format === 'string' || format instanceof RegExp) {
        this.code('if (!(' + inlineRegex(format) + ').test(' + path + ')) {');
        this.error('format');
        this.code('}');
      } else if (typeof format === 'function') {
        (scope.formats || (scope.formats = {}))[schema.format] = format;
        (scope.schemas || (scope.schemas = {}))[schema.format] = schema;

        encodedFormat = encodeStr(schema.format);

        this.code('if (!formats[' + encodedFormat + '](' + path + ', schemas[' + encodedFormat + '])) {');
        this.error('format');
        this.code('}');
      }
    }
  }
};

ValidationContext.prototype.compile = function(id) {
  this.code = func('jsen_compiled' + (id ? '_' + id : ''), 'data', 'path', 'errors');
  this.generate();

  return this.code.compile(this.scope);
};

ValidationContext.prototype.dispose = function() {
  for (var key in this) {
    this[key] = undefined;
  }
};

function jsen(schema, options) {
  if (type$2(schema) !== 'object') {
    throw new Error(INVALID_SCHEMA);
  }

  options = options || {};

  var counter = 0,
    id = function() {
      return 'i' + counter++;
    },
    resolver$1 = new resolver(schema, options.schemas, options.missing$Ref || false),
    context = new ValidationContext({
      schema: schema,
      resolver: resolver$1,
      id: id,
      schemas: options.schemas,
      formats: options.formats,
      greedy: options.greedy || false
    }),
    compiled = func('validate', 'data')('validate.errors = []')('gen(data, "", validate.errors)')(
      'return validate.errors.length === 0'
    ).compile({ gen: context.compile() });

  context.dispose();
  context = null;

  compiled.errors = [];

  compiled.build = function(initial, options) {
    return build(
      schema,
      options && options.copy === false ? initial : clone(initial),
      options && options.additionalProperties,
      resolver$1
    );
  };

  return compiled;
}

jsen.browser = browser;
jsen.clone = clone;
jsen.equal = equal_1;
jsen.unique = unique;
jsen.ucs2length = ucs2length_1;
jsen.SchemaResolver = resolver;
jsen.resolve = resolver.resolvePointer;

var jsen_1 = jsen;

var jsen$1 = jsen_1;

var validator = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.assign(/*#__PURE__*/ Object.create(null), jsen$1, {
    default: jsen$1
  })
);

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * Loads a JSON schema and performs validations against JSON objects.
 */
class SchemaValidator {
  /**
   * Creates a new `SchemaValidator` instance given a logger and path to a schema file.
   *
   * @param logger An {@link Logger} instance on which to base this class's logger.
   * @param schemaPath The path to the schema file to load and use for validation.
   */
  constructor(logger, schemaPath) {
    this.schemaPath = schemaPath;
    this.logger = logger.child('SchemaValidator');
    this.schemasDir = path.dirname(this.schemaPath);
  }
  /**
   * Loads a JSON schema from the `schemaPath` parameter provided at instantiation.
   */
  async load() {
    if (!this.schema) {
      this.schema = await util_fs.fs.readJsonMap(this.schemaPath);
      this.logger.debug(`Schema loaded for ${this.schemaPath}`);
    }
    return this.schema;
  }
  /**
   * Performs validation of JSON data against the schema located at the `schemaPath` value provided
   * at instantiation.
   *
   * **Throws** *{@link SfdxError}{ name: 'ValidationSchemaFieldErrors' }* If there are known validations errors.
   * **Throws** *{@link SfdxError}{ name: 'ValidationSchemaUnknown' }* If there are unknown validations errors.
   * @param json A JSON value to validate against this instance's target schema.
   * @returns The validated JSON data.
   */
  async validate(json) {
    const schema = await this.load();
    const externalSchemas = await this.loadExternalSchemas(schema);
    // TODO: We should default to throw an error when a property is specified
    // that is not in the schema, but the only option to do this right now is
    // to specify "removeAdditional: false" in every object.
    const validate = validator(schema, {
      greedy: true,
      schemas: externalSchemas
    });
    if (!validate(json)) {
      if (validate.errors) {
        const errors = this.getErrorsText(validate.errors, schema);
        throw new sfdxError.SfdxError(`Validation errors:\n${errors}`, 'ValidationSchemaFieldErrors');
      } else {
        throw new sfdxError.SfdxError('Unknown schema validation error', 'ValidationSchemaUnknown');
      }
    }
    return validate.build(json);
  }
  /**
   * Loads local, external schemas from URIs relative to the local schema file.  Does not support loading from
   * remote URIs. Returns a map of external schema local URIs to loaded schema JSON objects.
   *
   * @param schema The main schema to validate against.
   */
  async loadExternalSchemas(schema) {
    const externalSchemas = {};
    const promises = index.lib
      .getJsonValuesByName(schema, '$ref')
      .map(ref => ref && ref.match(/([\w\.]+)#/))
      .map(match => match && match[1])
      .filter(uri => !!uri)
      .map(uri => this.loadExternalSchema(uri));
    (await Promise.all(promises)).forEach(externalSchema => {
      if (index$1.lib.isString(externalSchema.id)) {
        externalSchemas[externalSchema.id] = externalSchema;
      } else {
        throw new sfdxError.SfdxError(
          `Unexpected external schema id type: ${typeof externalSchema.id}`,
          'ValidationSchemaTypeError'
        );
      }
    });
    return externalSchemas;
  }
  /**
   * Load another schema relative to the primary schema when referenced.  Only supports local schema URIs.
   *
   * @param uri The first segment of the $ref schema.
   */
  async loadExternalSchema(uri) {
    const schemaPath = path.join(this.schemasDir, `${uri}.json`);
    try {
      return await util_fs.fs.readJsonMap(schemaPath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new sfdxError.SfdxError(`Schema not found: ${schemaPath}`, 'ValidationSchemaNotFound');
      }
      throw err;
    }
  }
  /**
   * Get a string representation of the schema validation errors.
   *
   * @param errors An array of JsenValidateError objects.
   * @param schema The validation schema.
   */
  getErrorsText(errors, schema) {
    return errors
      .map(error => {
        const property = error.path.match(/^([a-zA-Z0-9\.]+)\.([a-zA-Z0-9]+)$/);
        const getPropValue = prop => {
          const reducer = (obj, name) => {
            if (!index$1.lib.isJsonMap(obj)) return;
            if (index$1.lib.isJsonMap(obj.properties)) return obj.properties[name];
            if (name === '0') return index$1.lib.asJsonArray(obj.items);
            return obj[name] || obj[prop];
          };
          return error.path.split('.').reduce(reducer, schema);
        };
        const getEnumValues = () => {
          const enumSchema = index$1.lib.asJsonMap(getPropValue('enum'));
          return (enumSchema && index$1.lib.getJsonArray(enumSchema, 'enum', []).join(', ')) || '';
        };
        switch (error.keyword) {
          case 'additionalProperties':
            // Missing Typing
            const additionalProperties = index$1.lib.get(error, 'additionalProperties');
            return `${error.path} should NOT have additional properties '${additionalProperties}'`;
          case 'required':
            if (property) {
              return `${property[1]} should have required property ${property[2]}`;
            }
            return `should have required property '${error.path}'`;
          case 'oneOf':
            return `${error.path} should match exactly one schema in oneOf`;
          case 'enum':
            return `${error.path} should be equal to one of the allowed values ${getEnumValues()}`;
          case 'type': {
            const _path = error.path === '' ? 'Root of JSON object' : error.path;
            return `${_path} is an invalid type.  Expected type [${getPropValue('type')}]`;
          }
          default:
            return `${error.path} invalid ${error.keyword}`;
        }
      })
      .join('\n');
  }
}

exports.SchemaValidator = SchemaValidator;
//# sourceMappingURL=validator.js.map
