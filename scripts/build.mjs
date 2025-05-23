/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { build } from 'esbuild';
import esbuildPluginPino from 'esbuild-plugin-pino';
import textReplace from 'esbuild-plugin-text-replace';
import fs from 'node:fs';

const distDir = 'dist/node';

// backup the original package.json because it will be modified
fs.copyFileSync('./package.json', `./package.json.BAK`);

const result = await build({
  entryPoints: ['lib/index.js', 'lib/testSetup.js'],
  bundle: true,
  // minify: true,
  plugins: [
    esbuildPluginPino({ transports: ['pino-pretty'] }),
    textReplace(
      {
        include: /lib\/logger\/logger/,
        pattern: [["path.join('..', '..', 'lib', 'logger', 'transformStream')", "'./transformStream'"]],
      },
      {
        include: /lib\/*/,
        pattern: [["Messages('@salesforce/core')", "Messages('@salesforce/core-bundle')"]],
      },
      {
        include: /lib\/index\.js/,
        pattern: [
          ['"use strict";', '"use strict";\nimport * as testSetup from "./testSetup.js";\nexport { testSetup };'],
        ],
      }
    ),
  ],
  platform: 'node',
  supported: {
    'dynamic-import': false,
  },
  logOverride: {
    'unsupported-dynamic-import': 'error',
  },
  outdir: distDir,
});

await build({
  entryPoints: ['lib/logger/transformStream.js'],
  bundle: true,
  minify: true,
  outdir: distDir,
  platform: 'node',
  plugins: [],
});

if (fs.existsSync('./package.json.BAK')) {
  // restore the pjs
  fs.copyFileSync('./package.json.BAK', './package.json');
  fs.unlinkSync('./package.json.BAK');
}
