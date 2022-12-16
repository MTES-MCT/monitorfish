import { Circle } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Style from 'ol/style/Style'

import { COLORS } from '../../../../constants/constants'

export const dottedLayerStyle = new Style({
  fill: new Fill({
    color: 'rgba(31, 120, 180, 0.28)'
  }),
  stroke: new Stroke({
    color: COLORS.charcoal,
    width: 3
  })
})

const fill = new Fill({
  color: 'rgba(255,255,255,0.4)'
})
const stroke = new Stroke({
  color: '#3399CC',
  width: 1.25
})

export const pointLayerStyle = new Style({
  image: new Circle({
    fill,
    radius: 5,
    stroke
  })
})
