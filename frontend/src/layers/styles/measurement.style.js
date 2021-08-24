import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import { COLORS } from '../../constants/constants'
import CircleStyle from 'ol/style/Circle'

export const measurementStyle = new Style({
  stroke: new Stroke({
    color: COLORS.slateGray,
    lineDash: [4, 4],
    width: 2
  }),
  image: new CircleStyle({
    radius: 2,
    stroke: new Stroke({
      color: COLORS.slateGray
    }),
    fill: new Fill({
      color: COLORS.slateGray
    })
  })
})
