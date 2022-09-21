const path = require('path')

const BOOLEAN_CAMEL_PREFIXES = ['can', 'did', 'is', 'had', 'has', 'must', 'should', 'was', 'will']
const BOOLEAN_UPPER_PREFIXES = ['CAN_', 'DID_', 'IS_', 'HAD_', 'HAS_', 'MUST_', 'SHOULD_', 'WAS_', 'WILL_']

module.exports = {
  extends: '@ivangabriele/eslint-config-typescript-react',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    project: path.join(__dirname, 'tsconfig.json')
  },
  ignorePatterns: ['.eslintrc.js', '.eslintrc.partial.js'],
  env: {
    browser: true
  },
  rules: {
    // We must add PascalCase in formats because ESLint trim the prefix before evaluating the case
    // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/naming-convention.md#format-options
    // > Note: As documented above, the prefix is trimmed before format is validated,
    // > therefore PascalCase must be used to allow variables such as isEnabled using the prefix is.
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE']
      },
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase']
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
        filter: {
          regex: '^LEGACY_',
          match: false
        }
      },
      {
        selector: 'accessor',
        types: ['boolean'],
        format: ['camelCase', 'PascalCase'],
        prefix: BOOLEAN_CAMEL_PREFIXES
      },
      {
        selector: 'classProperty',
        types: ['boolean'],
        format: ['camelCase', 'PascalCase'],
        prefix: BOOLEAN_CAMEL_PREFIXES
      },
      {
        selector: 'objectLiteralProperty',
        types: ['boolean'],
        format: ['camelCase', 'PascalCase'],
        prefix: BOOLEAN_CAMEL_PREFIXES
      },
      {
        selector: 'parameter',
        types: ['boolean'],
        format: ['camelCase', 'PascalCase'],
        prefix: BOOLEAN_CAMEL_PREFIXES
      },
      {
        selector: 'parameterProperty',
        types: ['boolean'],
        format: ['camelCase', 'PascalCase'],
        prefix: BOOLEAN_CAMEL_PREFIXES
      },
      {
        selector: 'variable',
        types: ['boolean'],
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        prefix: [...BOOLEAN_CAMEL_PREFIXES, ...BOOLEAN_UPPER_PREFIXES]
      }
    ],
    '@typescript/no-use-before-define': 'off',
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        name: 'react-redux',
        importNames: ['useSelector', 'useDispatch'],
        message: 'Use typed hooks `useAppDispatch` and `useAppSelector` instead.'
      }
    ],
    '@typescript-eslint/no-use-before-define': 'off',

    // See https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/default_props/#you-may-not-need-defaultprops
    'react/require-default-props': 'off',
    'react/react-in-jsx-scope': 'off'
  },
  overrides: [
    {
      files: ['src/domain/shared_slices/**/*.ts'],
      rules: {
        'no-param-reassign': 'off'
      }
    },
    {
      files: ['src/ui/**/*.tsx'],
      rules: {
        'react/jsx-props-no-spreading': 'off'
      }
    },
    {
      files: ['cypress/**/*.js', 'cypress/**/*.ts', 'cypress.config.ts'],
      plugins: ['cypress'],
      rules: {
        'cypress/no-assigning-return-values': 'error',
        // TODO Hopefully we'll able to enforce that rule someday.
        'cypress/no-unnecessary-waiting': 'off',
        'cypress/assertion-before-screenshot': 'error',
        // TODO Hopefully we'll able to enforce that rule someday.
        'cypress/no-force': 'off',
        'cypress/no-async-tests': 'error',
        'cypress/no-pause': 'error',

        'import/no-default-export': 'off',
        'import/no-extraneous-dependencies': 'off'
      }
    }
  ]
}
