// ESLint v9 flat config (CommonJS)
const js = require('@eslint/js');
const promise = require('eslint-plugin-promise');

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**']
  },
  {
    ...js.configs.recommended,
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs'
    },
    plugins: { promise },
    rules: {
      'no-unused-vars': ['warn', { args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'all', caughtErrorsIgnorePattern: '^_' }],
      'no-console': 'off',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'dot-notation': 'error'
    }
  }
];
