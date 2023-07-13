/* eslint-disable @typescript-eslint/naming-convention */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],

  rules: {
    // 'array-element-newline': ['warn', 'consistent'],
    // 'array-bracket-newline': ['warn', { multiline: true, minItems: 3 }],
    // 'comma-spacing': ['warn', { before: false, after: true }],
    // indent: ['warn', 2, { ArrayExpression: 1 }],

    'no-console': 'warn',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-useless-escape': 'off',
    'prefer-const': 'warn',
    'no-undef': 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      { selector: 'default', format: ['snake_case'] },
      {
        selector: 'memberLike',
        format: ['camelCase', 'PascalCase', 'snake_case'],
        leadingUnderscore: 'allow',
      },
      { selector: 'typeLike', format: ['PascalCase'] },
      { selector: 'enumMember', format: ['PascalCase'] },
      { selector: 'class', format: ['PascalCase'] },
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
        modifiers: [],
      },
      {
        selector: 'parameter',
        format: ['camelCase', 'PascalCase', 'snake_case'],
      },
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase'],
      },
      { selector: 'interface', format: ['PascalCase'], prefix: ['I'] },
    ],
  },
};
