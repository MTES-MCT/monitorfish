import { featureHas, stateIs } from '@features/Map/layers/styles/utils/webgl'
import { VesselFeature } from '@features/Vessel/types/vessel'

import { booleanToInt } from '../../../../utils'

import type { Rule } from 'ol/style/flat'

const hideNonSelectedVesselsCondition = [
  '!',
  // if hideNonSelectedVessels...
  stateIs('hideNonSelectedVessels')
]

const vesselsGroupsCondition = ['!', stateIs('areVesselsNotInVesselGroupsHidden')]
export const booleanFilter = ['all', hideNonSelectedVesselsCondition, vesselsGroupsCondition]

export const webGLAISVesselRule: Rule = {
  filter: booleanFilter,
  style: {
    'icon-height': 276,
    'icon-offset': [
      'case',
      stateIs('isLight'),
      [
        'case',
        featureHas('isSelected'),
        [0, 184],
        ['case', ['>', ['get', 'speed'], VesselFeature.vesselIsMovingSpeed], [0, 92], [0, 0]]
      ],
      [
        'case',
        featureHas('isSelected'),
        [92, 184],
        ['case', ['>', ['get', 'speed'], VesselFeature.vesselIsMovingSpeed], [92, 92], [92, 0]]
      ]
    ],
    'icon-opacity': [
      'case',
      featureHas('isSelected'),
      1,
      ['case', ['<', ['get', 'lastPositionSentAt'], ['var', 'isOpacityReducedEpochMilli']], 0.2, 1]
    ],
    'icon-rotation': ['*', ['get', 'course'], Math.PI / 180],
    'icon-scale': [
      'array',
      ['interpolate', ['exponential', 2], ['zoom'], 4, 0.2, 7, 0.5],
      ['interpolate', ['exponential', 2], ['zoom'], 4, 0.2, 7, 0.5]
    ],
    'icon-size': [92, 92],
    'icon-src': 'map-icons/ais_vessel_icons.png',
    'icon-width': 184
  }
}

export const getWebGLAISVesselStyleVariables = ({
  areVesselsNotInVesselGroupsHidden,
  hideNonSelectedVessels,
  isLight
}) => ({
  areVesselsNotInVesselGroupsHidden: booleanToInt(areVesselsNotInVesselGroupsHidden),
  hideNonSelectedVessels: booleanToInt(hideNonSelectedVessels),
  isLight: booleanToInt(isLight)
})
