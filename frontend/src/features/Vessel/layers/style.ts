import { featureHas, featureHasNot, featurePropertyIsNotEmpty, stateIs } from '@features/Map/layers/styles/utils/webgl'
import {
  VESSEL_ALERT_AND_BEACON_MALFUNCTION,
  VESSEL_ALERT_STYLE,
  VESSEL_BEACON_MALFUNCTION_STYLE,
  VESSEL_INFRACTION_SUSPICION_STYLE,
  VESSEL_SELECTOR_STYLE,
  VesselFeature
} from '@features/Vessel/types/vessel'
import { Icon, Style } from 'ol/style'
import Circle from 'ol/style/Circle'
import Stroke from 'ol/style/Stroke'

import { theme } from '../../../ui/theme'
import { booleanToInt } from '../../../utils'

import type { WebGLStyle } from 'ol/style/webgl'

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
  // if there is a beacon malfunction, do not hide the vessel
  featureHas('hasBeaconMalfunction'),
  true,
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
    stateIs('areVesselsNotInVesselGroupsHidden'),
    ['case', hasGroupColor, true, false],
    true
  ]

  const defaultVesselColor = ['case', stateIs('isLight'), theme.color.lightGray, theme.color.charcoal]
  const booleanFilter = [
    'all',
    hideNonSelectedVesselsCondition,
    hideDeprecatedPositionsCondition,
    featureHas('isFiltered'),
    hideVesselsAtPortCondition,
    vesselsGroupsCondition
  ]

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
    'icon-opacity': [
      'case',
      featureHas('hasBeaconMalfunction'),
      1,
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
  areVesselsNotInVesselGroupsHidden,
  hideNonSelectedVessels,
  hideVesselsAtPort,
  isLight,
  previewFilteredVesselsMode,
  vesselGroupsIdsDisplayed,
  vesselIsHiddenTimeThreshold,
  vesselIsOpacityReducedTimeThreshold
}) => ({
  areVesselsNotInVesselGroupsHidden: booleanToInt(areVesselsNotInVesselGroupsHidden),
  hideNonSelectedVessels: booleanToInt(hideNonSelectedVessels),
  hideVesselsAtPort: booleanToInt(hideVesselsAtPort),
  isFiltered: 0,
  isLight: booleanToInt(isLight),
  previewFilteredVesselsMode: booleanToInt(previewFilteredVesselsMode),
  vesselGroupsIdsDisplayed,
  vesselIsHiddenTimeThreshold,
  vesselIsOpacityReducedTimeThreshold
})

export const getSelectedVesselStyle =
  ({ isLight }) =>
  feature => {
    const course = feature.get('course')
    const vesselStyle = new Style({
      image: new Icon({
        color: isLight ? theme.color.lightGray : theme.color.charcoal,
        offset: [0, 50],
        opacity: 1,
        rotation: degreesToRadian(course),
        scale: 0.8,
        size: [50, 50],
        src: 'map-icons/boat_icons.png'
      }),
      zIndex: VESSEL_SELECTOR_STYLE
    })

    return [vesselStyle]
  }

export function degreesToRadian(course) {
  return (course * Math.PI) / 180
}

const vesselAlertBigCircleStyle = new Style({
  image: new Icon({
    src: 'map-icons/Double-cercle-alertes.png'
  }),
  zIndex: VESSEL_ALERT_STYLE
})

export const getVesselAlertStyle = (resolution: number) => {
  const styles = [vesselAlertBigCircleStyle]

  const scale = Math.min(1, 0.3 + Math.sqrt(200 / resolution))
  styles[0]?.getImage()?.setScale(scale)

  return styles
}

const vesselBeaconMalfunctionBigCircleStyle = new Style({
  image: new Icon({
    src: 'map-icons/Double-cercle_avaries.png'
  }),
  zIndex: VESSEL_BEACON_MALFUNCTION_STYLE
})

export const getVesselBeaconMalfunctionStyle = (resolution: number) => {
  const styles = [vesselBeaconMalfunctionBigCircleStyle]

  const scale = Math.min(1, 0.3 + Math.sqrt(200 / resolution))
  styles[0]?.getImage()?.setScale(scale)

  return styles
}

const vesselAlertAndBeaconMalfunctionBigCircleStyle = new Style({
  image: new Icon({
    src: 'map-icons/Triple-cercle_alerte_et_avarie.png'
  }),
  zIndex: VESSEL_ALERT_AND_BEACON_MALFUNCTION
})

export const getVesselAlertAndBeaconMalfunctionStyle = (resolution: number) => {
  const styles = [vesselAlertAndBeaconMalfunctionBigCircleStyle]

  const scale = Math.min(1, 0.3 + Math.sqrt(200 / resolution))
  styles[0]?.getImage()?.setScale(scale)

  return styles
}

const vesselInfractionSuspicionCircleStyle = new Style({
  image: new Circle({
    fill: undefined,
    radius: 19,
    stroke: new Stroke({
      color: theme.color.maximumRed,
      width: 2
    })
  }),
  zIndex: VESSEL_INFRACTION_SUSPICION_STYLE
})

export const getVesselInfractionSuspicionStyle = (resolution: number) => {
  const styles = [vesselInfractionSuspicionCircleStyle]

  const scale = Math.min(1, 0.3 + Math.sqrt(200 / resolution))
  styles[0]?.getImage()?.setScale(scale)

  return styles
}
