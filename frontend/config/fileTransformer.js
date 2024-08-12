import path from 'path'

// https://jestjs.io/docs/code-transformation#examples
export default {
  process(sourceText, sourcePath) {
    return {
      code: `module.exports = ${JSON.stringify(path.basename(sourcePath))};`
    }
  }
}
