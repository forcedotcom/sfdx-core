/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const { build } = require('esbuild');
const esbuildPluginPino = require('esbuild-plugin-pino');
const textReplace = require('esbuild-plugin-text-replace');
const { Generator } = require('npm-dts');

const distDir = 'dist/node';

new Generator({
  entry: 'lib/index.js',
  output: `${distDir}/index.d.ts`,
}).generate();

(async () => {
  const result = await build({
    entryPoints: [`lib/index.js`],
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
  // const filePath = `${distDir}/index.js`;
  // let bundledEntryPoint = fs.readFileSync(filePath, 'utf8');

  // // There is a wrong reference after bundling due to a bug from esbuild-plugin-pino. We will replace it with the correct one.
  // const searchString = /\$\{process\.cwd\(\)\}\$\{require\("path"\)\.sep\}distDir/g;
  // const replacementString = `\${__dirname}\${require("path").sep}`;

  // if (!searchString.test(bundledEntryPoint)) {
  //   console.error('Error: the reference to be modified is not detected - Please reach out to IDEx Foundations team.');
  //   process.exit(1); // Exit with an error code
  // }
  // bundledEntryPoint = bundledEntryPoint.replace(searchString, replacementString);
  // fs.writeFileSync(filePath, bundledEntryPoint, 'utf8');

  await build({
    entryPoints: [`lib/logger/transformStream.js`],
    bundle: true,
    minify: true,
    outdir: distDir,
    platform: 'node',
    plugins: [],
  });
})();
