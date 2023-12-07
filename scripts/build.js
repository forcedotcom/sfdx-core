/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const { build } = require('esbuild');
const esbuildPluginPino = require('esbuild-plugin-pino');
const { Generator } = require('npm-dts');

new Generator({
  output: 'dist/exported.d.ts',
}).generate();

const sharedConfig = {
  entryPoints: ['src/exported.ts'],
  bundle: true,
  minify: true,
  plugins: [esbuildPluginPino({ transports: ['pino-pretty'] })],
};

build({
  ...sharedConfig,
  platform: 'node', // for CJS
  outdir: 'dist',
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
