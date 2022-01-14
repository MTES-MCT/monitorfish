import { Icon, Style } from 'ol/style'
import { Vessel, VESSEL_SELECTOR_STYLE } from '../../domain/entities/vessel'

import { COLORS } from '../../constants/constants'
import { booleanToInt } from '../../utils'

const featureHas = (key) => ['==', ['get', key], 1]
const featureHasNot = (key) => ['==', ['get', key], 0]
const stateIs = (key) => ['==', ['var', key], 1]
// const and = (cond1, cond2) => ['all', cond1, cond2]

const hideVesselsAtPortCondition = [
  'case',
  // if hideVesselsAtPort...
  stateIs('hideVesselsAtPort'),
  // ... hide vessels atPort
  featureHasNot('isAtPort'),
  true
]

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
const showOnlyNonFilteredVessels = [
  'case',
  stateIs('nonFilteredVesselsAreHidden'),
  featureHas('isFiltered'),
  true
]

export const getWebGLVesselStyle = ({
  hideVesselsAtPort,
  hideNonSelectedVessels,
  nonFilteredVesselsAreHidden,
  previewFilteredVesselsMode,
  isLight,
  vesselIsHiddenTimeThreshold,
  vesselIsOpacityReducedTimeThreshold,
  filterColorRed,
  filterColorGreen,
  filterColorBlue
}) => {
  const filterColor = ['color', ['var', 'filterColorRed'], ['var', 'filterColorGreen'], ['var', 'filterColorBlue']]
  const defaultVesselColor = ['case', stateIs('isLight'), COLORS.vesselLightColor, COLORS.vesselColor]
  const booleanFilter = ['case',
    // in preview mode, show only vessels in preview mode
    stateIs('previewFilteredVesselsMode'), featureHas('filterPreview'),
    // default
    ['all',
      hideNonSelectedVesselsCondition,
      hideDeprecatedPositionsCondition,
      showOnlyNonFilteredVessels,
      hideVesselsAtPortCondition
    ]
  ]

  const style = {
    variables: {
      hideVesselsAtPort: booleanToInt(hideVesselsAtPort),
      hideNonSelectedVessels: booleanToInt(hideNonSelectedVessels),
      nonFilteredVesselsAreHidden: booleanToInt(nonFilteredVesselsAreHidden),
      previewFilteredVesselsMode: booleanToInt(previewFilteredVesselsMode),
      isLight: booleanToInt(isLight),
      vesselIsHiddenTimeThreshold,
      vesselIsOpacityReducedTimeThreshold,
      filterColorRed,
      filterColorGreen,
      filterColorBlue
    },
    filter: booleanFilter,
    symbol: {
      symbolType: 'image',
      src: 'boat_icons.png',
      rotation: ['*', ['get', 'course'], Math.PI / 180],
      textureCoord: ['case', ['>', ['get', 'speed'], Vessel.vesselIsMovingSpeed], [0, 0, 0.5, 0.25], [0.5, 0, 1, 0.25]],
      size: 20,
      color: ['case', stateIs('previewFilteredVesselsMode'), defaultVesselColor, featureHas('isFiltered'), filterColor, defaultVesselColor],
      opacity: ['case',
        ['<', ['get', 'lastPositionSentAt'], ['var', 'vesselIsOpacityReducedTimeThreshold']], 0.2,
        1]
    }
  }
  return style
}

export const getSelectedVesselStyle = ({ isLight }) => (feature) => {
  const course = feature.get('course')
  const style = new Style({
    image: new Icon({
      src: 'selecteur_navire_complet.png',
      rotation: degreesToRadian(course),
      scale: 0.5,
      color: isLight ? COLORS.vesselLightColor : COLORS.vesselColor,
      opacity: 1
    }),
    zIndex: VESSEL_SELECTOR_STYLE
  })
  return style
}
// vesselLightColor: cacce0
// vesselColor: 3B4559

export function degreesToRadian (course) {
  return course * Math.PI / 180
}
