const path = require('path')

// https://jestjs.io/docs/code-transformation#examples

module.exports = {
  process(sourceText, sourcePath) {
    return {
      code: `module.exports = ${JSON.stringify(path.basename(sourcePath))};`
    }
  }
}
