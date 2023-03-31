import { THEME } from '@mtes-mct/monitor-ui'
import { Fill, Stroke, Style } from 'ol/style'

import { Mission } from '../../../../../domain/entities/mission/types'
import { getColorWithAlpha } from '../../styles/utils'
import { featureHas } from '../../styles/utils/webgl'

export const missionZoneStyle = new Style({
  fill: new Fill({
    color: getColorWithAlpha(THEME.color.blueGray[100], 0.25)
  }),
  stroke: new Stroke({
    color: THEME.color.charcoal,
    lineCap: 'square',
    lineDash: [2, 8],
    width: 4
  })
})

export const getMissionColor = (missionStatus: Mission.MissionStatus | undefined) => {
  switch (missionStatus) {
    case Mission.MissionStatus.UPCOMING:
      return '#52B0FF'
    case Mission.MissionStatus.IN_PROGRESS:
      return '#3660FA'
    case Mission.MissionStatus.DONE:
      return '#1400AD'
    case Mission.MissionStatus.CLOSED:
      return '#463939'
    default:
      return '#52B0FF'
  }
}

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
        [0, 0, 0.25, 0.333],
        featureHas('isLandMission'),
        [0, 0.333, 0.25, 0.666],
        featureHas('isAirMission'),
        [0, 0.666, 0.25, 1],
        [0, 0, 0.25, 0.333]
      ],
      featureHas('isDone'),
      [
        'case',
        featureHas('isSeaMission'),
        [0.25, 0, 0.5, 0.333],
        featureHas('isLandMission'),
        [0.25, 0.333, 0.5, 0.666],
        featureHas('isAirMission'),
        [0.25, 0.666, 0.5, 1],
        [0.25, 0, 0.5, 0.333]
      ],
      featureHas('isInProgress'),
      [
        'case',
        featureHas('isSeaMission'),
        [0.5, 0, 0.75, 0.333],
        featureHas('isLandMission'),
        [0.5, 0.333, 0.75, 0.666],
        featureHas('isAirMission'),
        [0.5, 0.666, 0.75, 1],
        [0.5, 0, 0.75, 0.333]
      ],
      featureHas('isUpcoming'),
      [
        'case',
        featureHas('isSeaMission'),
        [0.75, 0, 1, 0.333],
        featureHas('isLandMission'),
        [0.75, 0.333, 1, 0.666],
        featureHas('isAirMission'),
        [0.75, 0.666, 1, 1],
        [0.75, 0, 1, 0.333]
      ],
      [0.75, 0, 1, 0.333]
    ]
  }
})
