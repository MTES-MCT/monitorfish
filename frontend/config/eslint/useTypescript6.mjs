// typescript-eslint needs the TypeScript compiler JS API, which TypeScript 7 (the native port) no
// longer ships: preloaded with `node --import`, this routes every `typescript` import of the ESLint
// process to the TypeScript 6 install (`typescript-6` npm alias).
import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, nextResolve) {
    const isTypescript = specifier === 'typescript' || specifier.startsWith('typescript/')

    return nextResolve(isTypescript ? specifier.replace(/^typescript/, 'typescript-6') : specifier, context)
  }
})
