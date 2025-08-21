/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { build } from 'esbuild';

await build({
  entryPoints: [`lib/index.js`],
  bundle: true,
  minify: true, // external: ['src/logger/transformStream.ts'],
  platform: 'node', // for CJS
  format: 'cjs',
  supported: {
    'dynamic-import': false,
  },
  logOverride: {
    'unsupported-dynamic-import': 'error',
  },
  define: {
    // this prevents the logger from writing to any files, obviating the need for pino-bundling stuff
    'process.env.SF_DISABLE_LOG_FILE': "'true'",
  },
  outdir: 'dist',
});
