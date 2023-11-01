import {Circle} from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Style from 'ol/style/Style'

import {THEME} from "@mtes-mct/monitor-ui";

export const dottedLayerStyle = new Style({
  stroke: new Stroke({
    color: THEME.color.slateGray,
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
