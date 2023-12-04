const path = require('path')

module.exports = {
  extends: ['airbnb', 'airbnb/hooks', 'airbnb-typescript', 'prettier'],
  plugins: ['prettier', 'sort-keys-fix', 'sort-destructure-keys', 'typescript-sort-keys'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    project: path.join(__dirname, 'tsconfig.json')
  },
  ignorePatterns: ['.eslintrc.js', '.eslintrc.partial.js', 'scripts/*'],
  env: {
    browser: true
  },
  rules: {
    curly: ['error', 'all'],
    'newline-before-return': 'error',
    'no-console': 'error',

    'import/no-default-export': 'error',
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
    'import/prefer-default-export': 'off',

    'prettier/prettier': 'error',

    'react/jsx-pascal-case': [
      'error',
      {
        ignore: ['LEGACY_*']
      }
    ],
    'react/jsx-no-useless-fragment': 'off',
    'react/jsx-sort-props': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/require-default-props': 'off',

    'sort-destructure-keys/sort-destructure-keys': ['error', { caseSensitive: false }],

    'sort-keys-fix/sort-keys-fix': ['error', 'asc', { caseSensitive: false, natural: false }],

    '@typescript-eslint/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
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
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        name: 'react-redux',
        importNames: ['useSelector', 'useDispatch'],
        message: 'Use typed hooks `useMainAppDispatch` and `useMainAppSelector` instead.'
      }
    ],
    '@typescript-eslint/no-use-before-define': 'off',

    'typescript-sort-keys/interface': 'error',
    'typescript-sort-keys/string-enum': 'error'
  },
  overrides: [
    // Redux
    {
      files: ['src/domain/shared_slices/**/*.ts', 'src/**/slice.ts'],
      rules: {
        'no-param-reassign': 'off'
      }
    },
    {
      files: ['src/domain/types/*.ts', 'src/domain/**/types.ts', 'src/domain/shared_slices/**/*.ts', 'src/**/slice.ts'],
      plugins: ['no-null'],
      rules: {
        'no-param-reassign': 'off'
      }
    },

    // UI
    {
      files: ['src/components/**/*.tsx', 'src/ui/**/*.tsx'],
      rules: {
        'react/jsx-props-no-spreading': 'off'
      }
    },

    // Jest
    {
      files: ['__mocks__/**/*.[j|t]s', '**/*.test.ts', '**/*.test.tsx'],
      plugins: ['jest'],
      env: {
        jest: true
      },
      rules: {
        'jest/no-disabled-tests': 'error',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'error',
        'jest/valid-expect': 'error'
      }
    },

    // Cypress
    {
      files: ['cypress/**/*.js', 'cypress/**/*.ts', 'cypress.config.ts'],
      plugins: ['cypress', 'mocha'],
      rules: {
        // TODO Check why either Prettier or ESLint auto-formatting does that and why this rule is not enabled.
        // 'max-len': ['warn', { code: 120 }],

        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',

        'cypress/assertion-before-screenshot': 'error',
        'cypress/no-assigning-return-values': 'error',
        'cypress/no-async-tests': 'error',
        // TODO Hopefully we'll able to enforce that rule someday.
        'cypress/no-force': 'off',
        'cypress/no-pause': 'error',
        // TODO Hopefully we'll able to enforce that rule someday.
        'cypress/no-unnecessary-waiting': 'off',

        'import/no-default-export': 'off',
        'import/no-extraneous-dependencies': 'off',

        'mocha/no-exclusive-tests': 'error',
        'mocha/no-skipped-tests': 'error'
      }
    },

    // Configs & scripts
    {
      files: [
        '**/*.spec.js',
        './*.cjs',
        './*.js',
        './config/**/*.js',
        './scripts/**/*.js',
        '**/*.spec.ts',
        './config/**/*.ts',
        './scripts/**/*.mjs',
        './scripts/**/*.ts'
      ],
      env: {
        browser: false,
        node: true
      }
    }
  ]
}
