import { Icon, Style } from 'ol/style'
import Circle from 'ol/style/Circle'
import Stroke from 'ol/style/Stroke'

import { COLORS } from '../../../../constants/constants'
import {
  Vessel,
  VESSEL_ALERT_AND_BEACON_MALFUNCTION,
  VESSEL_ALERT_STYLE,
  VESSEL_BEACON_MALFUNCTION_STYLE,
  VESSEL_INFRACTION_SUSPICION_STYLE,
  VESSEL_SELECTOR_STYLE
} from '../../../../domain/entities/vessel/vessel'
import { theme } from '../../../../ui/theme'
import { booleanToInt } from '../../../../utils'
import { featureHas, featureHasNot, stateIs } from '../styles/utils/webgl'

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

const showOnlyNonFilteredVessels = ['case', stateIs('nonFilteredVesselsAreHidden'), featureHas('isFiltered'), true]

export const getWebGLVesselStyle = ({
  filterColorBlue,
  filterColorGreen,
  filterColorRed,
  hideNonSelectedVessels,
  hideVesselsAtPort,
  isLight,
  nonFilteredVesselsAreHidden,
  previewFilteredVesselsMode,
  vesselIsHiddenTimeThreshold,
  vesselIsOpacityReducedTimeThreshold
}) => {
  const filterColor = ['color', ['var', 'filterColorRed'], ['var', 'filterColorGreen'], ['var', 'filterColorBlue']]
  const defaultVesselColor = ['case', stateIs('isLight'), theme.color.lightGray, COLORS.charcoal]
  const booleanFilter = [
    'case',
    // in preview mode, show only vessels in preview mode
    stateIs('previewFilteredVesselsMode'),
    featureHas('filterPreview'),
    // default
    [
      'all',
      hideNonSelectedVesselsCondition,
      hideDeprecatedPositionsCondition,
      showOnlyNonFilteredVessels,
      hideVesselsAtPortCondition
    ]
  ]

  return {
    filter: booleanFilter,
    symbol: {
      color: [
        'case',
        stateIs('previewFilteredVesselsMode'),
        defaultVesselColor,
        featureHas('isFiltered'),
        filterColor,
        defaultVesselColor
      ],
      opacity: [
        'case',
        featureHas('hasBeaconMalfunction'),
        1,
        ['<', ['get', 'lastPositionSentAt'], ['var', 'vesselIsOpacityReducedTimeThreshold']],
        0.2,
        1
      ],
      rotation: ['*', ['get', 'course'], Math.PI / 180],
      size: 20,
      src: 'boat_icons.png',
      symbolType: 'image',
      textureCoord: ['case', ['>', ['get', 'speed'], Vessel.vesselIsMovingSpeed], [0, 0, 0.5, 0.25], [0.5, 0, 1, 0.25]]
    },
    variables: {
      filterColorBlue,
      filterColorGreen,
      filterColorRed,
      hideNonSelectedVessels: booleanToInt(hideNonSelectedVessels),
      hideVesselsAtPort: booleanToInt(hideVesselsAtPort),
      isLight: booleanToInt(isLight),
      nonFilteredVesselsAreHidden: booleanToInt(nonFilteredVesselsAreHidden),
      previewFilteredVesselsMode: booleanToInt(previewFilteredVesselsMode),
      vesselIsHiddenTimeThreshold,
      vesselIsOpacityReducedTimeThreshold
    }
  }
}

export const getSelectedVesselStyle =
  ({ isLight }) =>
  feature => {
    const course = feature.get('course')
    const selectorStyle = new Style({
      image: new Icon({
        color: isLight ? theme.color.lightGray : COLORS.charcoal,
        opacity: 1,
        scale: 0.5,
        src: 'selecteur_navire.png'
      }),
      zIndex: VESSEL_SELECTOR_STYLE
    })

    const vesselStyle = new Style({
      image: new Icon({
        color: isLight ? theme.color.lightGray : COLORS.charcoal,
        opacity: 1,
        rotation: degreesToRadian(course),
        scale: 0.85,
        src: 'boat.png'
      }),
      zIndex: VESSEL_SELECTOR_STYLE
    })

    return [selectorStyle, vesselStyle]
  }

export function degreesToRadian(course) {
  return (course * Math.PI) / 180
}

const vesselAlertBigCircleStyle = new Style({
  image: new Icon({
    src: 'Double-cercle-alertes.png'
  }),
  zIndex: VESSEL_ALERT_STYLE
})

export const getVesselAlertStyle = (resolution: number) => {
  const styles = [vesselAlertBigCircleStyle]

  const scale = Math.min(1, 0.3 + Math.sqrt(200 / resolution))
  styles[0]?.getImage().setScale(scale)

  return styles
}

const vesselBeaconMalfunctionBigCircleStyle = new Style({
  image: new Icon({
    src: 'Double-cercle_avaries.png'
  }),
  zIndex: VESSEL_BEACON_MALFUNCTION_STYLE
})

export const getVesselBeaconMalfunctionStyle = (resolution: number) => {
  const styles = [vesselBeaconMalfunctionBigCircleStyle]

  const scale = Math.min(1, 0.3 + Math.sqrt(200 / resolution))
  styles[0]?.getImage().setScale(scale)

  return styles
}

const vesselAlertAndBeaconMalfunctionBigCircleStyle = new Style({
  image: new Icon({
    src: 'Triple-cercle_alerte_et_avarie.png'
  }),
  zIndex: VESSEL_ALERT_AND_BEACON_MALFUNCTION
})

export const getVesselAlertAndBeaconMalfunctionStyle = (resolution: number) => {
  const styles = [vesselAlertAndBeaconMalfunctionBigCircleStyle]

  const scale = Math.min(1, 0.3 + Math.sqrt(200 / resolution))
  styles[0]?.getImage().setScale(scale)

  return styles
}

const vesselInfractionSuspicionCircleStyle = new Style({
  image: new Circle({
    fill: undefined,
    radius: 19,
    stroke: new Stroke({
      color: COLORS.maximumRed,
      width: 2
    })
  }),
  zIndex: VESSEL_INFRACTION_SUSPICION_STYLE
})

export const getVesselInfractionSuspicionStyle = (resolution: number) => {
  const styles = [vesselInfractionSuspicionCircleStyle]

  const scale = Math.min(1, 0.3 + Math.sqrt(200 / resolution))
  styles[0]?.getImage().setScale(scale)

  return styles
}
