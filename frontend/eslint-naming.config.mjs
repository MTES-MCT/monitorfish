// `@typescript-eslint/naming-convention` pass, the only rule left on typescript-eslint: it is absent
// from OxLint (type-aware rules run on `oxlint --type-aware`, see .oxlintrc.typed.json) and cannot
// run as an OxLint jsPlugin, which provides no parser services. typescript-eslint needs the
// TypeScript 6 JS API, so `npm run test:lint:naming` preloads config/eslint/useTypescript6.mjs.
//
// The pre-existing backlog is recorded in eslint-suppressions.json (ESLint native bulk
// suppressions): any NEW violation fails, per file and per rule. After fixing suppressed
// violations, run `npm run test:lint:naming:prune` and commit the shrunken suppressions file.
//
// The script runs with `--cache`: the cache is per-file, so a type change in one file does
// not re-lint dependent files — CI always runs cold and stays authoritative.
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      // We must add PascalCase in formats because ESLint trim the prefix before evaluating the case
      // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/naming-convention.md#format-options
      // > Note: As documented above, the prefix is trimmed before format is validated,
      // > therefore PascalCase must be used to allow variables such as isEnabled using the prefix is.
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase']
        },
        {
          selector: 'typeLike',
          format: ['PascalCase']
        },
        {
          selector: 'accessor',
          types: ['boolean'],
          format: ['camelCase', 'PascalCase']
        },
        {
          selector: 'classProperty',
          types: ['boolean'],
          format: ['camelCase', 'PascalCase']
        },
        {
          selector: 'objectLiteralProperty',
          types: ['boolean'],
          format: ['camelCase', 'PascalCase']
        },
        {
          selector: 'parameter',
          types: ['boolean'],
          format: ['camelCase', 'PascalCase']
        },
        {
          selector: 'parameterProperty',
          types: ['boolean'],
          format: ['camelCase', 'PascalCase']
        },
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['camelCase', 'PascalCase', 'UPPER_CASE']
        }
      ]
    }
  }
]
