// eslint-plugin-typescript-sort-keys, adapted to OxLint jsPlugins: its `string-enum` rule reads enum
// members from `node.members` (typescript-estree < 8), whereas OxLint only exposes `node.body.members`,
// and the resulting crash silently disables every other jsPlugin rule for the file.
import typescriptSortKeysPlugin from 'eslint-plugin-typescript-sort-keys'

const stringEnumRule = typescriptSortKeysPlugin.rules['string-enum']

export default {
  ...typescriptSortKeysPlugin,
  rules: {
    ...typescriptSortKeysPlugin.rules,
    'string-enum': {
      ...stringEnumRule,
      create(context) {
        const { TSEnumDeclaration } = stringEnumRule.create(context)

        return {
          TSEnumDeclaration(node) {
            TSEnumDeclaration(
              new Proxy(node, {
                get: (target, property) =>
                  property === 'members' ? target.body.members : Reflect.get(target, property)
              })
            )
          }
        }
      }
    }
  }
}
