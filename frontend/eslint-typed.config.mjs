// Type-aware lint pass, run separately from OxLint.
// OxLint (the primary linter) cannot run type-aware rules here: its tsgolint engine
// requires dropping `baseUrl`, which this codebase's bare-specifier imports rely on.
// This config therefore uses the real TypeScript compiler via @typescript-eslint, and
// only enables a curated set of high-value type-aware rules. It is slow (needs full type
// info), so it is meant for CI / pre-push (`npm run test:lint:types`), not per-save.
//
// All rules are `error`, with the pre-existing backlog recorded in eslint-suppressions.json
// (ESLint native bulk suppressions): any NEW violation fails, per file and per rule. After
// fixing suppressed violations, run `npm run test:lint:types:prune` and commit the shrunken
// suppressions file.
//
// The script runs with `--cache`: the cache is per-file, so a type change in one file does
// not re-lint dependent files — CI always runs cold and stays authoritative.
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
// typescript-sort-keys rules are syntactic, but string-enum crashes OxLint's jsPlugins runner
// (AST shape mismatch on enum members), so they are hosted in this ESLint pass instead.
import tsSortKeys from 'eslint-plugin-typescript-sort-keys'

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
      '@typescript-eslint': tsPlugin,
      'typescript-sort-keys': tsSortKeys
    },
    rules: {
      '@typescript-eslint/await-thenable': 'error',
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
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/require-await': 'error',
      'typescript-sort-keys/string-enum': 'error'
    }
  },
  {
    // These files opt out of string-enum with inline eslint-disable comments (member order is
    // meaningful there, e.g. UI ordering). This pass runs with --no-inline-config, so the
    // opt-outs are replicated here at file level.
    files: [
      'src/constants/seafront.ts',
      'src/features/Logbook/Logbook.types.ts',
      'src/features/Mission/components/MissionList/types.ts',
      'src/features/Mission/missionAction.constants.ts',
      'src/features/Mission/mission.types.ts',
      'src/features/PriorNotification/components/PriorNotificationList/constants.ts'
    ],
    rules: {
      'typescript-sort-keys/string-enum': 'off'
    }
  },
  {
    // The `as any` assertions in these recursive generic utils are deliberate: removing them
    // (as the no-unnecessary-type-assertion fixer does) makes tsc fail with TS2589
    // "type instantiation is excessively deep".
    files: ['src/utils/nullify.ts', 'src/utils/undefinedize.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-type-assertion': 'off'
    }
  }
]
