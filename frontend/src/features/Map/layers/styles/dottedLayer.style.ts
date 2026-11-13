import { THEME } from '@mtes-mct/monitor-ui'
import Stroke from 'ol/style/Stroke'
import Style from 'ol/style/Style'

export const dottedLayerStyle = new Style({
  stroke: new Stroke({
    color: THEME.color.slateGray,
    lineDash: [4, 4],
    width: 2
  })
})
