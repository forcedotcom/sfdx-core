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
  // Allow describe and it
  env: { mocha: true },
  rules: {
    // Allow assert style expressions. i.e. expect(true).to.be.true
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-explicit-any': 'off',

    // Tests usually access private or protected methods/variables
    '@typescript-eslint/ban-ts-ignore': 'off',

    // It is common for tests to stub out method.
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/unbound-method': 'off',

    // Return types are defined by the source code. Allows for quick overwrites.
    '@typescript-eslint/explicit-function-return-type': 'off',
    // Mocked out the methods that shouldn't do anything in the tests.
    '@typescript-eslint/no-empty-function': 'off',
    // Easily return a promise in a mocked method.
    '@typescript-eslint/require-await': 'off',
  },
};
