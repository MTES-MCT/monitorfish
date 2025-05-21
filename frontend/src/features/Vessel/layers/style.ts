import { featureHas, featurePropertyIsNotEmpty, stateIs } from '@features/Map/layers/styles/utils/webgl'
import { VesselFeature } from '@features/Vessel/types/vessel'

import { theme } from '../../../ui/theme'
import { booleanToInt } from '../../../utils'

import type { WebGLStyle } from 'ol/style/webgl'

const hideNonSelectedVesselsCondition = [
  '!',
  // if hideNonSelectedVessels...
  stateIs('hideNonSelectedVessels')
  // selectedVessel is in a dedicated layer
]

const hideDeprecatedPositionsCondition = [
  'case',
  // if lastPosition is older than threshold, hide vessel
  ['<=', ['var', 'vesselIsHiddenTimeThreshold'], ['get', 'lastPositionSentAt']],
  true,
  false
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
    ['all', stateIs('areVesselsNotInVesselGroupsHidden'), stateIs('areVesselGroupsDisplayed')],
    ['case', hasGroupColor, true, false],
    true
  ]

  const defaultVesselColor = ['case', stateIs('isLight'), theme.color.lightGray, theme.color.charcoal]
  const booleanFilter = [
    'all',
    hideNonSelectedVesselsCondition,
    hideDeprecatedPositionsCondition,
    featureHas('isFiltered'),
    vesselsGroupsCondition
  ]

  return {
    filter: booleanFilter,
    'icon-color': [
      'case',
      stateIs('previewFilteredVesselsMode'),
      defaultVesselColor,
      ['all', stateIs('areVesselGroupsDisplayed'), hasGroupColor],
      groupColor,
      defaultVesselColor
    ],
    'icon-offset': ['case', ['>', ['get', 'speed'], VesselFeature.vesselIsMovingSpeed], [0, 0], [25, 0]],
    'icon-opacity': [
      'case',
      ['<', ['get', 'lastPositionSentAt'], ['var', 'vesselIsOpacityReducedTimeThreshold']],
      0.2,
      1
    ],
    'icon-rotation': ['*', ['get', 'course'], Math.PI / 180],
    'icon-scale': 0.8,
    'icon-size': [25, 25],
    'icon-src': 'map-icons/boat_icons.png',
    variables: {}
  }
}

export const getWebGLVesselStyleVariables = ({
  areVesselGroupsDisplayed,
  areVesselsNotInVesselGroupsHidden,
  hideNonSelectedVessels,
  isLight,
  previewFilteredVesselsMode,
  vesselGroupsIdsDisplayed,
  vesselIsHiddenTimeThreshold,
  vesselIsOpacityReducedTimeThreshold
}) => ({
  areVesselGroupsDisplayed: booleanToInt(areVesselGroupsDisplayed),
  areVesselsNotInVesselGroupsHidden: booleanToInt(areVesselsNotInVesselGroupsHidden),
  hideNonSelectedVessels: booleanToInt(hideNonSelectedVessels),
  isFiltered: 0,
  isLight: booleanToInt(isLight),
  previewFilteredVesselsMode: booleanToInt(previewFilteredVesselsMode),
  vesselGroupsIdsDisplayed,
  vesselIsHiddenTimeThreshold,
  vesselIsOpacityReducedTimeThreshold
})

export function degreesToRadian(course) {
  return (course * Math.PI) / 180
}
