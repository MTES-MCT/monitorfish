// Type-aware lint pass, run separately from OxLint.
// OxLint (the primary linter) cannot run type-aware rules here: its tsgolint engine
// requires dropping `baseUrl`, which this codebase's bare-specifier imports rely on.
// This config therefore uses the real TypeScript compiler via @typescript-eslint, and
// only enables a curated set of high-value type-aware rules. It is slow (needs full type
// info), so it is meant for CI / pre-push (`npm run test:lint:types`), not per-save.
// The script runs with `--cache`: the cache is per-file, so a type change in one file does
// not re-lint dependent files — CI always runs cold and stays authoritative.
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  // typescript-sort-keys/string-enum is syntactic, but it crashes OxLint's jsPlugins runner
  // (AST shape mismatch on enum members), so it is hosted in this ESLint pass instead.
  plugins: ['@typescript-eslint', 'typescript-sort-keys'],
  // Severities are `warn` because of the existing backlog, but the pass is gated: the script
  // runs with `--max-warnings` (see package.json) so any NEW warning fails pre-push and CI.
  // Lower that ratchet as the backlog burns down, and promote rules to `error` as each hits zero.
  rules: {
    '@typescript-eslint/await-thenable': 'warn',
    // We must add PascalCase in formats because ESLint trim the prefix before evaluating the case
    // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/naming-convention.md#format-options
    // > Note: As documented above, the prefix is trimmed before format is validated,
    // > therefore PascalCase must be used to allow variables such as isEnabled using the prefix is.
    '@typescript-eslint/naming-convention': [
      'warn',
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
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-misused-promises': 'warn',
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/require-await': 'warn',
    'typescript-sort-keys/string-enum': 'error'
  },
  overrides: [
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
};
