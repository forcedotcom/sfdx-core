/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const { build } = require('esbuild');
const esbuildPluginPino = require('esbuild-plugin-pino');
const esbuildPluginTsc = require('esbuild-plugin-tsc');
const { Generator } = require('npm-dts');
const fs = require('fs');
const CONSTANTS = require('./constants.json');
const outputFolder = CONSTANTS.outputFilesFolder;
const tmpOutputFolder = CONSTANTS.outputFilesTmpFolder;

new Generator({
  output: `${tmpOutputFolder}/index.d.ts`,
}).generate();

const sharedConfig = {
  entryPoints: [`${outputFolder}/index.js`],
  bundle: true,
  // minify: true,
  plugins: [
    esbuildPluginPino({ transports: ['pino-pretty'] }),
    esbuildPluginTsc({
      tsconfigPath: './tsconfig.json',
    }),
  ],
};

(async () => {
  const result = await build({
    ...sharedConfig,
    // external: ['src/logger/transformStream.ts'],
    platform: 'node', // for CJS
    outdir: tmpOutputFolder,
  });
  const filePath = `${tmpOutputFolder}/index.js`;
  let bundledEntryPoint = fs.readFileSync(filePath, 'utf8');

  const searchString = /\$\{process\.cwd\(\)\}\$\{require\("path"\)\.sep\}tmp-lib/g;
  const replacementString = `\${__dirname}\${require("path").sep}`;

  bundledEntryPoint = bundledEntryPoint.replace(searchString, replacementString);
  fs.writeFileSync(filePath, bundledEntryPoint, 'utf8');

  await build({
    entryPoints: [`${outputFolder}/logger/transformStream.js`],
    bundle: true,
    minify: true,
    outdir: tmpOutputFolder,
    platform: 'node', // for CJS
    plugins: [
      // esbuildPluginPino({ transports: ['pino-pretty'] }),
    ],
  });
})();
