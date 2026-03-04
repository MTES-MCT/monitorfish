import { featureHas } from '@features/Map/layers/styles/utils/webgl'
import { THEME } from '@mtes-mct/monitor-ui'
import { Style } from 'ol/style'
import Stroke from 'ol/style/Stroke'

import type { WebGLStyle } from 'ol/style/webgl'

export const reportingWebGLStyle: WebGLStyle = {
  'icon-displacement': [5, 12],
  'icon-height': 184,
  'icon-offset': [
    'case',
    featureHas('isArchived'),
    [
      'case',
      featureHas('isInfractionSuspicion'),
      ['case', featureHas('isHovered'), [124, 0], featureHas('isSelected'), [124, 0], [124, 92]],
      // Observation
      ['case', featureHas('isHovered'), [186, 0], featureHas('isSelected'), [186, 0], [186, 92]]
    ],
    [
      'case',
      featureHas('isInfractionSuspicion'),
      ['case', featureHas('isHovered'), [0, 0], featureHas('isSelected'), [0, 0], [0, 92]],
      // Observation
      ['case', featureHas('isHovered'), [62, 0], featureHas('isSelected'), [62, 0], [62, 92]]
    ]
  ],
  'icon-rotate-with-view': false,
  'icon-scale': [
    'array',
    ['interpolate', ['exponential', 2], ['zoom'], 4, 0.2, 7, 0.5],
    ['interpolate', ['exponential', 2], ['zoom'], 4, 0.2, 7, 0.5]
  ],
  // Icons contained in sprite are of size 62x92 pixels
  'icon-size': [62, 92],

  'icon-src': 'map-icons/icon_reporting_sprite.png',

  'icon-width': 248,
  variables: {}
}

export const reportingLineStyle = new Style({
  stroke: new Stroke({
    color: THEME.color.slateGray,
    lineDash: [4, 4],
    width: 2
  })
})
