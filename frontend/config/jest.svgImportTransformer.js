import { createElement } from 'react'

function SvgComponent(props) {
  return createElement('svg', {
    ...props,
    'data-testid': 'svg-mock'
  })
}

module.exports = SvgComponent
module.exports.ReactComponent = SvgComponent
