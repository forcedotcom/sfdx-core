import tsconfigs from 'eslint-config-salesforce-typescript';

const configs = [
  ...tsconfigs,
  {
    files: ['./test/**/*'],
    rules: {
      // Allow assert style expressions. i.e. expect(true).to.be.true
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      // Tests usually access private or protected methods/variables
      '@typescript-eslint/ban-ts-comment': 'off',

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
  },
];

export default configs;
