import { getCenter } from 'ol/extent'
import Point from 'ol/geom/Point'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Style from 'ol/style/Style'

import { COLORS } from '../../constants/constants'

export const measurementStyleWithCenter = new Style({
  geometry: feature => {
    if (feature.getGeometry().getType() === 'LineString') {
      return undefined
    }

    const extent = feature.getGeometry().getExtent()
    const center = getCenter(extent)

    return new Point(center)
  },
  image: new CircleStyle({
    fill: new Fill({
      color: COLORS.slateGray,
    }),
    radius: 2,
  }),
})

export const measurementStyle = new Style({
  stroke: new Stroke({
    color: COLORS.slateGray,
    lineDash: [4, 4],
    width: 2,
  }),
})
