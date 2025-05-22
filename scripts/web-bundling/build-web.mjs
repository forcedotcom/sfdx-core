/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { polyfillNode } from 'esbuild-plugin-polyfill-node';
import { build } from 'esbuild';
import textReplace from 'esbuild-plugin-text-replace';
import fs from 'node:fs';
import path from 'node:path';

const distDir = 'dist/browser';
fs.mkdirSync(distDir, { recursive: true });

// backup the original package.json because it will be modified
fs.cpSync('./package.json', `./package.json.BAK`);

// Use import.meta.dirname for absolute path resolution (Node.js 22+)
const projectRoot = path.resolve(import.meta.dirname, '../..');
const entryFile = path.join(projectRoot, 'lib/index-web.js');
const outFile = path.join(projectRoot, distDir, 'index.js');

if (!fs.existsSync(entryFile)) {
  console.error(`Error: Entry file ${entryFile} does not exist!`);
  console.error('Make sure the compile step has completed successfully.');
  process.exit(1);
}

const result = await build(
  {
    entryPoints: [entryFile],
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
    outfile: outFile,
    target: 'es2022',
  },
  textReplace(
    {
      include: /lib\/logger\/logger/,
      pattern: [["path.join('..', '..', 'lib', 'logger', 'transformStream')", "'./transformStream'"]],
    },
    {
      include: /lib\/*/,
      pattern: [["Messages('@salesforce/core')", "Messages('@salesforce/core-bundle')"]],
    }
  )
);
console.log(result);

if (fs.existsSync('./package.json.BAK')) {
  // restore the pjs
  fs.copyFileSync('./package.json.BAK', './package.json');
  fs.unlinkSync('./package.json.BAK');
}
