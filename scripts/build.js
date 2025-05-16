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
const { outputFilesFolder, outputFilesTmpFolder } = require('./constants');
const outputFolder = outputFilesFolder;
const tmpOutputFolder = outputFilesTmpFolder;

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
    supported: {
      'dynamic-import': false,
    },
    logOverride: {
      'unsupported-dynamic-import': 'error',
    },
    outdir: tmpOutputFolder,
  });
  const filePath = `${tmpOutputFolder}/index.js`;
  let bundledEntryPoint = fs.readFileSync(filePath, 'utf8');

  // There is a wrong reference after bundling due to a bug from esbuild-plugin-pino. We will replace it with the correct one.
  const searchString = /\$\{process\.cwd\(\)\}\$\{require\("path"\)\.sep\}tmp-lib/g;
  const replacementString = `\${__dirname}\${require("path").sep}`;

  if (!searchString.test(bundledEntryPoint)) {
    console.error('Error: the reference to be modified is not detected - Please reach out to IDEx Foundations team.');
    process.exit(1); // Exit with an error code
  }
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
