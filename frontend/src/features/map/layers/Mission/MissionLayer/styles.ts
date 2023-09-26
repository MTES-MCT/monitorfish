import { THEME } from '@mtes-mct/monitor-ui'
import { Fill, Stroke, Style } from 'ol/style'

import { Mission } from '../../../../../domain/entities/mission/types'
import { getColorWithAlpha } from '../../styles/utils'
import { featureHas } from '../../styles/utils/webgl'

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

/**
 * The coordinates of the `textureCoord` sprite property are : [x1, y1, x2, y2]
 */
export const getMissionPointWebGLStyle = () => ({
  symbol: {
    offset: [0, 19.5],
    size: [34, 39],
    src: 'map-icons/icon_mission_sprite.png',
    symbolType: 'image',
    // Icons contained in sprite are of size 68x78 pixels
    textureCoord: [
      'case',
      featureHas('isClosed'),
      [
        'case',
        featureHas('isSeaMission'),
        [0, 0, 0.25, 0.25],
        featureHas('isLandMission'),
        [0, 0.25, 0.25, 0.5],
        featureHas('isAirMission'),
        [0, 0.5, 0.25, 0.75],
        featureHas('isMultiMission'),
        [0, 0.75, 0.25, 1],
        [0, 0.75, 0.25, 1]
      ],
      featureHas('isDone'),
      [
        'case',
        featureHas('isSeaMission'),
        [0.25, 0, 0.5, 0.25],
        featureHas('isLandMission'),
        [0.25, 0.25, 0.5, 0.5],
        featureHas('isAirMission'),
        [0.25, 0.5, 0.5, 0.75],
        featureHas('isMultiMission'),
        [0.25, 0.75, 0.5, 1],
        [0.25, 0.75, 0.5, 1]
      ],
      featureHas('isInProgress'),
      [
        'case',
        featureHas('isSeaMission'),
        [0.5, 0, 0.75, 0.25],
        featureHas('isLandMission'),
        [0.5, 0.25, 0.75, 0.5],
        featureHas('isAirMission'),
        [0.5, 0.5, 0.75, 0.75],
        featureHas('isMultiMission'),
        [0.5, 0.75, 0.75, 1],
        [0.5, 0.75, 0.75, 1]
      ],
      featureHas('isUpcoming'),
      [
        'case',
        featureHas('isSeaMission'),
        [0.75, 0, 1, 0.25],
        featureHas('isLandMission'),
        [0.75, 0.25, 1, 0.5],
        featureHas('isAirMission'),
        [0.75, 0.5, 1, 0.75],
        featureHas('isMultiMission'),
        [0.75, 0.75, 1, 1],
        [0.75, 0.75, 1, 1]
      ],
      [0.75, 0.75, 1, 1]
    ]
  }
})
