const path = require('path')

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
    'react/jsx-pascal-case': [
      'error',
      {
        ignore: ['LEGACY_*']
      }
    ],

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

    'react/jsx-no-useless-fragment': 'off',
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
        '@typescript-eslint/naming-convention': 'off',

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
