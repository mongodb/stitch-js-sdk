// based on https://github.com/10gen/mms/blob/master/client/.eslintrc.js
const fs = require('fs');
const path = require('path');

const prettierConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '.prettierrc'), 'utf8'));

module.exports = {
  extends: [
    'airbnb',
    'prettier',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  plugins: ['simple-import-sort', 'replace-relative-imports', 'class-property', 'jest', 'prettier'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    'jest/globals': true,
  },
  overrides: [
    {
      files: ['**/*.tsx', '**/*.ts'],
      rules: {
        'no-undef': 'off',
        'max-classes-per-file': 'off'
      },
    },
  ],
  rules: {
    // disable defaults so simple-import-sort wins
    'sort-imports': 'off',
    'import/order': 'off',
    'simple-import-sort/sort': [
      'error',
      {
        groups: [
          // Side effect imports.
          ['^\\u0000'],
          // Parent imports. Put `..` last.
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          // Other relative imports. Put same-folder imports and `.` last.
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          // Style imports.
          ['^.+\\.(le|c)ss$'],
        ],
      },
    ],

    'arrow-parens': 0,
    'array-bracket-spacing': 1,
    'array-callback-return': 1,
    'arrow-body-style': 0,
    'brace-style': 1,
    camelcase: ['error', { properties: 'never' }],
    'class-property/class-property-semicolon': ['error', 'always'],
    'comma-dangle': 0,
    'comma-spacing': 1,
    'consistent-return': 1,
    'default-case': 1,
    'prefer-destructuring': 0,
    'dot-location': 1,
    'dot-notation': 1,
    eqeqeq: 1,
    'func-names': 0,
    'global-require': 0,
    'guard-for-in': 1,
    'import/newline-after-import': 0,
    'import/no-cycle': 0,
    'import/no-duplicates': 0,
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/__tests__/*', '**/*.test.*', '**/**/testsetup.js', 'src/tests/**'],
      },
    ],
    'key-spacing': 1,
    'keyword-spacing': 2,
    'linebreak-style': 0,
    'max-len': [1, { code: 120, ignoreStrings: true }],
    'new-parens': 1,
    'newline-per-chained-call': 0,
    'no-bitwise': 1,
    'no-case-declarations': 2,
    'no-continue': 0,
    'no-else-return': 1,
    'no-extra-bind': 1,
    'no-extra-boolean-cast': 1,
    'no-inner-declarations': 1,
    'no-lonely-if': 1,
    'no-mixed-operators': 1,
    'no-multi-spaces': 1,
    'no-multi-assign': 1,
    'no-nested-ternary': 1,
    'no-param-reassign': 0,
    'no-restricted-syntax': 1,
    'no-restricted-properties': 1,
    'no-return-assign': 1,
    'no-restricted-modules': [
      2,
      {
        patterns: ['js/common/services/api/*'],
      },
    ],
    'no-shadow': 1,
    'no-template-curly-in-string': 0,
    'no-underscore-dangle': 0,
    'no-unneeded-ternary': 1,
    'no-unused-expressions': [2, { allowShortCircuit: true }],
    'no-use-before-define': 1,
    'no-useless-concat': 1,
    'no-useless-escape': 1,
    'no-var': 1,
    'no-plusplus': 0,
    'object-curly-spacing': 0,
    'object-shorthand': 1,
    'one-var': 1,
    'one-var-declaration-per-line': 1,
    'operator-assignment': 1,
    'padded-blocks': [1, 'never'],
    'prefer-arrow-callback': 1,
    'prefer-arrow-callback': 1,
    'prefer-const': 1,
    'prefer-rest-params': 1,
    'prefer-spread': 1,
    'prefer-template': 1,
    'prefer-template': 1,
    'quote-props': 1,
    radix: 1,
    'space-before-function-paren': [0, 'never'],
    'space-infix-ops': 1,
    'spaced-comment': 1,
    strict: [1, 'safe'],
    'template-curly-spacing': 1,
    'vars-on-top': 0,
    'wrap-iife': 1,
    'prettier/prettier': [2, prettierConfig],
    curly: 1,
    'space-in-parens': 1,
    '@typescript-eslint/camelcase': ['error', { properties: 'never' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': [2, { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-empty-function': 'off',
    'import/extensions': 0,
  },
};
