import { THEME } from '@mtes-mct/monitor-ui'
import { Fill, Stroke, Style } from 'ol/style'

import { getColorWithAlpha } from './utils'
import { Mission } from '../../../../domain/entities/mission/types'

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

export const getMissionMarkerColor = (missionStatus: Mission.MissionStatus | undefined) => {
  switch (missionStatus) {
    case Mission.MissionStatus.UPCOMING:
      return THEME.color.blueGray[100]
    case Mission.MissionStatus.IN_PROGRESS:
      return THEME.color.mediumSeaGreen
    case Mission.MissionStatus.DONE:
      return THEME.color.charcoal
    case Mission.MissionStatus.CLOSED:
      return THEME.color.opal
    default:
      return THEME.color.opal
  }
}

export const getMissionPointWebGLStyle = () => {
  const color = ['color', ['get', 'colorRed'], ['get', 'colorGreen'], ['get', 'colorBlue']]

  return {
    symbol: {
      color,
      offset: [0, 10],
      size: 20,
      src: 'map-icons/marker-flag.png',
      symbolType: 'image'
    }
  }
}
