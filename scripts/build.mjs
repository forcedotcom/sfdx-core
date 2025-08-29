/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
