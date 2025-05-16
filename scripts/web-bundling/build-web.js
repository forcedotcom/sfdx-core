/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const { polyfillNode } = require('esbuild-plugin-polyfill-node');
const { build } = require('esbuild');
const esbuildPluginTsc = require('esbuild-plugin-tsc');
const { Generator } = require('npm-dts');
const fs = require('fs');
const { outputFilesFolder, webOutputFilesTmpFolder } = require('../constants');

fs.mkdirSync(webOutputFilesTmpFolder, { recursive: true });
new Generator({
  output: `${webOutputFilesTmpFolder}/index.d.ts`,
}).generate();

(async () => {
  const result = await build({
    entryPoints: [`${outputFilesFolder}/index-web.js`],
    bundle: true,
    // minify: true,
    alias: {
      // proper-lockfile uses graceful-fs
      'graceful-fs': 'memfs',
      jsonwebtoken: 'jsonwebtoken-esm',
      '@jsforce/jsforce-node': 'jsforce/browser',
      '@jsforce/jsforce-node/lib': 'jsforce/browser',
    },

    plugins: [
      esbuildPluginTsc({
        tsconfigPath: './tsconfig.json',
      }),
      polyfillNode({
        globals: {
          global: true,
          buffer: true,
          process: true,
        },
        polyfills: {
          _stream_duplex: true,
          _stream_passthrough: true,
          _stream_readable: true,
          _stream_transform: true,
          _stream_writable: true,
          'assert/strict': true,
          assert: true,
          buffer: true,
          child_process: 'empty',
          crypto: true,
          dns: 'empty',
          events: true,
          http: true,
          https: true,
          net: 'empty',
          os: true,
          path: true,
          perf_hooks: true,
          process: true,
          querystring: true,
          stream: true,
          timers: true,
          tls: 'empty',
          url: true,
          util: true,
          fs: true,
        },
      }),
    ],
    treeShaking: true, // only really works wih ESM modules
    format: 'esm',
    minify: false,
    supported: {
      'dynamic-import': false,
    },
    logOverride: {
      'unsupported-dynamic-import': 'error',
    },
    outfile: `${webOutputFilesTmpFolder}/index.js`,
    target: 'es2022',
  });
  console.log(result);
})();
