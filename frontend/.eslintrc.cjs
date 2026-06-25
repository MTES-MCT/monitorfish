// Slim ESLint config — runs ONLY the rules that OxLint cannot replicate.
// Everything else (correctness, react, jsx-a11y, import/no-default-export, no-unused-vars, sort-keys,
// no-restricted-imports, …) is handled by OxLint via `.oxlintrc.json`, and formatting by Prettier.
//
// These remaining rules are all *syntactic* (no type information needed), so this config deliberately
// does NOT set `parserOptions.project`, which keeps the pass fast.
//
// Intentionally NOT ported (were type-aware → would require the slow type-aware pass):
//   - @typescript-eslint/naming-convention (was `warn`)
//   - @typescript-eslint/prefer-nullish-coalescing (was `error`)
//   - @typescript-eslint/lines-between-class-members (was `error`)
// They can be re-enabled later through OxLint's experimental `--type-aware` mode.
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  plugins: [
    'import',
    'react',
    'sort-keys-fix',
    'sort-destructure-keys',
    'typescript-sort-keys',
    // Loaded (rules left OFF) only so that the existing `eslint-disable` comments for OxLint-owned
    // rules resolve here instead of erroring with "Definition for rule '…' was not found".
    '@typescript-eslint',
    'react-hooks',
    'jsx-a11y',
    'jest',
    'no-null'
  ],
  ignorePatterns: ['/build/*', '/public/*', '.eslintrc.cjs'],
  settings: {
    'import/resolver': {
      node: { extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.d.ts'] }
    },
    react: { version: 'detect' }
  },
  rules: {
    'import/order': [
      'error',
      {
        alphabetize: {
          caseInsensitive: true,
          order: 'asc'
        },
        groups: [['builtin', 'external', 'internal'], ['parent', 'index', 'sibling'], ['type'], ['object']],
        'newlines-between': 'always'
      }
    ],

    'react/jsx-sort-props': ['error', { ignoreCase: true, reservedFirst: true }],

    'sort-destructure-keys/sort-destructure-keys': ['error', { caseSensitive: false }],

    'sort-keys-fix/sort-keys-fix': ['error', 'asc', { caseSensitive: false, natural: false }],

    'typescript-sort-keys/interface': 'error',
    'typescript-sort-keys/string-enum': 'error'
  }
}
