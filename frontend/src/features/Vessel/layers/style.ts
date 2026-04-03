import { featureHas, featurePropertyIsNotEmpty, stateIs } from '@features/Map/layers/styles/utils/webgl'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { THEME } from '@mtes-mct/monitor-ui'

import { booleanToInt } from '../../../utils'

import type { WebGLStyle } from 'ol/style/webgl'

const hideNonSelectedVesselsCondition = [
  '!',
  // if hideNonSelectedVessels...
  stateIs('hideNonSelectedVessels')
  // selectedVessel is in a dedicated layer
]

export const getWebGLVesselStyle = (): WebGLStyle => {
  const groupColor = [
    'color',
    ['get', 'groupColorRed', 'number'],
    ['get', 'groupColorGreen', 'number'],
    ['get', 'groupColorBlue', 'number']
  ]
  const hasGroupColor = [
    'any',
    featurePropertyIsNotEmpty('groupColorRed'),
    featurePropertyIsNotEmpty('groupColorGreen'),
    featurePropertyIsNotEmpty('groupColorBlue')
  ]
  const vesselsGroupsCondition = [
    'case',
    stateIs('areVesselsNotInVesselGroupsHidden'),
    ['case', hasGroupColor, true, false],
    true
  ]

  const defaultVesselColor = ['case', stateIs('isLight'), THEME.color.lightGray, THEME.color.charcoal]
  const booleanFilter = ['all', hideNonSelectedVesselsCondition, featureHas('isFiltered'), vesselsGroupsCondition]

  return {
    filter: booleanFilter,
    'icon-color': [
      'case',
      stateIs('previewFilteredVesselsMode'),
      defaultVesselColor,
      hasGroupColor,
      groupColor,
      defaultVesselColor
    ],
    'icon-offset': ['case', ['>', ['get', 'speed'], VesselFeature.vesselIsMovingSpeed], [0, 0], [25, 0]],
    'icon-opacity': ['case', ['<', ['get', 'lastPositionSentAt'], ['var', 'isOpacityReducedEpochMilli']], 0.2, 1],
    'icon-rotation': ['*', ['get', 'course'], Math.PI / 180],
    'icon-scale': 0.8,
    'icon-size': [25, 25],
    'icon-src': 'map-icons/boat_icons.png',
    variables: {}
  }
}

export const getWebGLVesselStyleVariables = ({
  areVesselsNotInVesselGroupsHidden,
  hideNonSelectedVessels,
  isLight,
  previewFilteredVesselsMode,
  vesselGroupsIdsDisplayed
}) => ({
  areVesselsNotInVesselGroupsHidden: booleanToInt(areVesselsNotInVesselGroupsHidden),
  hideNonSelectedVessels: booleanToInt(hideNonSelectedVessels),
  isFiltered: 0,
  isLight: booleanToInt(isLight),
  previewFilteredVesselsMode: booleanToInt(previewFilteredVesselsMode),
  vesselGroupsIdsDisplayed
})

export function degreesToRadian(course) {
  return (course * Math.PI) / 180
}
