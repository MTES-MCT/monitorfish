import { THEME } from '@mtes-mct/monitor-ui'
import { Fill, Stroke, Style } from 'ol/style'

import { getColorWithAlpha } from '../../../map/layers/styles/utils'
import { featureHas } from '../../../map/layers/styles/utils/webgl'
import { Mission } from '../../mission.types'

import type { WebGLStyle } from 'ol/style/webgl'

export const missionZoneStyle = new Style({
  fill: new Fill({
    color: getColorWithAlpha(THEME.color.blueGray, 0.25)
  }),
  stroke: new Stroke({
    color: THEME.color.charcoal,
    lineCap: 'square',
    lineDash: [2, 8],
    width: 4
  })
})

export const getMissionColor = (missionStatus: Mission.MissionStatus | undefined, isText?: boolean | undefined) => {
  switch (missionStatus) {
    case Mission.MissionStatus.UPCOMING:
      return THEME.color.yellowGreen
    case Mission.MissionStatus.IN_PROGRESS:
      return THEME.color.mediumSeaGreen
    case Mission.MissionStatus.DONE:
      return THEME.color.charcoal
    case Mission.MissionStatus.CLOSED:
      return isText ? THEME.color.slateGray : THEME.color.white
    default:
      return THEME.color.yellowGreen
  }
}

export const missionPointWebGLStyle: WebGLStyle = {
  'icon-displacement': [0, 19.5],
  'icon-height': 312,
  'icon-offset': [
    'case',
    featureHas('isClosed'),
    [
      'case',
      featureHas('isSeaMission'),
      [0, 0],
      featureHas('isLandMission'),
      [0, 78],
      featureHas('isAirMission'),
      [0, 156],
      featureHas('isMultiMission'),
      [0, 234],
      [0, 234]
    ],
    featureHas('isDone'),
    [
      'case',
      featureHas('isSeaMission'),
      [68, 0],
      featureHas('isLandMission'),
      [68, 78],
      featureHas('isAirMission'),
      [68, 156],
      featureHas('isMultiMission'),
      [68, 234],
      [68, 234]
    ],
    featureHas('isInProgress'),
    [
      'case',
      featureHas('isSeaMission'),
      [136, 0],
      featureHas('isLandMission'),
      [136, 78],
      featureHas('isAirMission'),
      [136, 156],
      featureHas('isMultiMission'),
      [136, 234],
      [136, 234]
    ],
    featureHas('isUpcoming'),
    [
      'case',
      featureHas('isSeaMission'),
      [204, 0],
      featureHas('isLandMission'),
      [204, 78],
      featureHas('isAirMission'),
      [204, 156],
      featureHas('isMultiMission'),
      [204, 234],
      [204, 234]
    ],
    [0, 0]
  ],
  'icon-scale': 0.5,

  // Icons contained in sprite are of size 68x78 pixels
  'icon-size': [68, 78],

  'icon-src': 'map-icons/icon_mission_sprite.png',
  'icon-width': 272
}
