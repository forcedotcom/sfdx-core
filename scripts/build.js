/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const { build } = require('esbuild');
const esbuildPluginPino = require('esbuild-plugin-pino');
// const esbuildPluginTsc = require('esbuild-plugin-tsc');
const { Generator } = require('npm-dts');
const fs = require('fs');

new Generator({
  output: 'dist/exported.d.ts',
}).generate();

const sharedConfig = {
  entryPoints: ['src/exported.ts'],
  bundle: true,
  minify: true,
  plugins: [
    esbuildPluginPino({ transports: ['pino-pretty'] }),
    // esbuildPluginTsc({
    //   tsconfigPath: './tsconfig.json',
    // }),
  ],
};

build({
  ...sharedConfig,
  // external: ['src/logger/transformStream.ts'],
  platform: 'node', // for CJS
  outdir: 'dist',
}).then((result) => {
  const filePath = 'dist/exported.js';
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
    }
    const searchString = /\$\{process\.cwd\(\)\}\$\{require\("path"\)\.sep\}dist/g;
    const replacementString = `\${__dirname}\${require("path").sep}`;

    const result = data.replace(searchString, replacementString);
    fs.writeFile(filePath, result, 'utf8', function (err) {
      if (err) console.log(err);
    });
  });
});

build({
  entryPoints: ['src/logger/transformStream.ts'],
  bundle: true,
  minify: true,
  outdir: 'dist',
  platform: 'node', // for CJS
  plugins: [
    // esbuildPluginPino({ transports: ['pino-pretty'] }),
  ],
});
// build({
//   ...sharedConfig,
//   outfile: 'dist/exported.esm.js',
//   platform: 'neutral', // for ESM
//   format: 'esm',
// });

// build({
//   entryPoints: ['src/exported.ts'],
//   outdir: 'dist',
//   bundle: true,
//   platform: 'node',
//   plugins: [esbuildPluginPino({ transports: ['pino-pretty'] })],
// }).catch(() => process.exit(1));
