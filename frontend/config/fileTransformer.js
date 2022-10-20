const path = require('path')

// https://jestjs.io/docs/code-transformation#examples
module.exports = {
  process(_sourceText, sourcePath) {
    const cleanPath = JSON.stringify(path.basename(sourcePath))

    return {
      // code: `module.exports.ReactComponent = require('react').createElement('span', {}, ${cleanPath})`
      code: `module.exports.ReactComponent = ${cleanPath}`
    }
  }
}
