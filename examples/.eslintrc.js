/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Generated - Do not modify. Controlled by @salesforce/dev-scripts
// See more at https://github.com/forcedotcom/sfdx-dev-packages/tree/master/packages/dev-scripts

module.exports = {
  extends: '../.eslintrc.js',
  rules: {
    'no-console': 'off',
  },
  parserOptions: {
    project: [
      './examples/tsconfig.json',
      './examples/test/tsconfig.json',
    ],
    sourceType: 'module',
  },
};
