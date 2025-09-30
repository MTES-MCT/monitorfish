import { Circle } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Style from 'ol/style/Style'

export const dottedLayerStyle = new Style({
  stroke: new Stroke({
    color: '#ff3392',
    lineDash: [4, 4],
    width: 2
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
