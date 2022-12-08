# Contributing

- [File Structure](#file-structure)
  - [Frontend](#frontend)
    - [General](#general)
    - [React Components](#react-components)
- [Best Practices](#best-practices)
  - [Javascript / Typescript](#javascript--typescript)
    - [Use `undefined` instead of `null`](#use-undefined-instead-of-null)
    - [Use named exports instead of default ones](#use-named-exports-instead-of-default-ones)
    - [Use `import types` and `export types` for types](#use-import-types-and-export-types-for-types)
  - [React](#react)
    - [Avoid using `useEffect()`](#avoid-using-useeffect)
    - [Avoid using expressions in JSX props](#avoid-using-expressions-in-jsx-props)
    - [Exclusively use Redux instead of local states for horizontal state dependencies](#exclusively-use-redux-instead-of-local-states-for-horizontal-state-dependencies)
    - [Extract component calculation and transformation code into utility functions](#extract-component-calculation-and-transformation-code-into-utility-functions)
    - [Actions should be imported with a domain namespaced `import * as`](#actions-should-be-imported-with-a-domain-namespaced-import--as)
- [Naming Conventions](#naming-conventions)
  - [General](#general-1)
    - [File names should match main function or Class name and case](#file-names-should-match-main-function-or-class-name-and-case)
  - [React](#react-1)
    - [Start uplifter props name with `on`](#start-uplifter-props-name-with-on)
- [Visual Studio Code](#visual-studio-code)
  - [`.vscode/settings.json`](#vscodesettingsjson)

## File Structure

### Frontend

#### General

> ⚠️ In progress.

```txt
src/
  ├ api/                                                    # Tests
  ├ domain/                                                 # Tests
  │   ├ slices/                                             # Redux slices
  │   │   └ aDomain.ts
  │   └ use_cases/                                          # Redux reducers
  │       └ aDomain/
  │          ├ __tests__/                                   # Tests
  │          │   ├ getOne.test.ts
  │          │   └ updateOne.test.ts
  │          │ getOne.ts
  │          └ updateOne.ts
  ├ features/                                               # React components
  ├ libs/                                                   # Shared utility classes (one per file)
  ├ utils/                                                  # Shared utility functions (one per file)
  ├ constants.ts                                            # Shared constants and enums
  └ utils.ts                                                # Utility functions
```

#### React Components

A big component could look like that:

```txt
MySuperComponent/
  ├ __tests__/                                              # Tests
  │   ├ aUtilityFunction.test.ts
  │   └ anotherUtilityFunction.test.ts
  ├ index.tsx                                               # Main code
  └ utils.ts                                                # Utility functions
```

## Best Practices

### Javascript / Typescript

#### Use `undefined` instead of `null`

`null` is considered to be the most expensive mistake in the history of programmation
[by its own creator](https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/).

Sindresorhus [did it](https://github.com/sindresorhus/meta/discussions/7).

#### Use named exports instead of default ones

Names exports enforce a consistent naming accross the database (helping code lookup) and ensures tree shaking.

#### Use `import types` and `export types` for types

Here is a good explanation of [why](https://stackoverflow.com/a/64243357/2736233). In short, it ensures that no type is
being accidentally trasnpiled, it eases refactoring and fasten transpilers work.

### React

#### Avoid using `useEffect()`

Excepted for first data loading and direct DOM manipulation when no better logic is available (nost often events).

#### Avoid using expressions in JSX props

It makes the component logic easier to understand when we separate concerns between JSX rendering / props passing and
the code logic contained above.

Named functions also ease debugging stacks in comparison with expressions in props.

#### Exclusively use Redux instead of local states for horizontal state dependencies

If multiple components must react to common state property and that components' props can't easily be passed,
we must use Redux selectors / dispatches **and only** them to handle that state.

**Local component states must be absolutely isolated.** Excepted during their initialization via the component props
(**and nothing else!**).

If internal component constants must derive from this state value during their initialization, we can use `useRef()`.
If some internal component constants must derive from this state value for each change, we can use `useMemo()`.

#### Extract component calculation and transformation code into utility functions

A React component is a DOM listener and renderer. Its code should only **orchestrate** its state changes in order to
achieve these 2 roles.

Most should be extracted into small utility functions within either a local `utils.ts` file or
within the global `utils/` directory if they are shared by more than one component.

Not only does it lighten our components code but more importantly, it helps us unit-testing component code logic while
avoiding the not-so-fun task of testing the component itself.

#### Actions should be imported with a domain namespaced `import * as`

It helps avoiding naming conflicts with internal functions and easily differenciate what should be called from what
should be dispatched.

Example:

```ts
import * as domainActions from '...'
```

## Naming Conventions

### General

#### File names should match main function or Class name and case

> ⚠️ In progress.

### React

#### Start uplifter props name with `on`

It has been a forever convention for both ECMAScript and Node.js to use `on` for any exposed listening function
expecting a callback. React native uplifter props follow this convention themselves.

# Recommended IDE Configurations

## Visual Studio Code

### `.vscode/settings.json`

```json
{
   "editor.codeActionsOnSave": {
    "source.fixAll": true
  },
  "editor.defaultFormatter": "dbaeumer.vscode-eslint",
  "editor.formatOnSave": true,
  "eslint.codeActionsOnSave.mode": "all",
  "eslint.format.enable": true,
  "eslint.packageManager": "npm",
  "eslint.workingDirectories": ["./frontend"],
  "stylelint.configBasedir": "./frontend",
  "stylelint.validate": [
    "css",
    "html",
    "less",
    "postcss",
    "sass",
    "scss",
    "typescriptreact"
  ],
  "[css]": {
    "editor.defaultFormatter": "stylelint.vscode-stylelint"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```
