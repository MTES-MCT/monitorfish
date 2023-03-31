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
      return '#70A5FF'
    case Mission.MissionStatus.IN_PROGRESS:
      return '#4967FD'
    case Mission.MissionStatus.DONE:
      return '#390099'
    case Mission.MissionStatus.CLOSED:
      return '#4E4545'
    default:
      return '#4E4545'
  }
}

export const getMissionPointWebGLStyle = () => ({
  symbol: {
    offset: [0, 19.5],
    size: [34, 39],
    src: 'map-icons/icon_mission_sprite.png',
    symbolType: 'image',
    textureCoord: [
      'case',
      featureHas('isClosed'),
      [0, 0, 0.25, 1],
      featureHas('isDone'),
      [0.25, 0, 0.5, 1],
      featureHas('isInProgress'),
      [0.5, 0, 0.75, 1],
      featureHas('isUpcoming'),
      [0.75, 0, 1, 1],
      [0.5, 0, 1, 0.25]
    ]
  }
})
