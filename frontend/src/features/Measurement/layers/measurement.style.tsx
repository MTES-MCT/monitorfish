import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import { COLORS } from '@constants/constants'
import CircleStyle from 'ol/style/Circle'
import Point from 'ol/geom/Point'
import { getCenter } from 'ol/extent'

export const measurementStyleWithCenter = new Style({
  image: new CircleStyle({
    radius: 2,
    fill: new Fill({
      color: COLORS.slateGray
    })
  }),
  geometry: feature => {
    if (feature.getGeometry().getType() === 'LineString') {
      return undefined
    }

    const extent = feature.getGeometry().getExtent()
    const center = getCenter(extent)
    return new Point(center)
  }
})

export const measurementStyle = new Style({
  stroke: new Stroke({
    color: COLORS.slateGray,
    lineDash: [4, 4],
    width: 2
  })
})
