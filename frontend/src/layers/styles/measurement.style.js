import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import { COLORS } from '../../constants/constants'
import CircleStyle from 'ol/style/Circle'
import Point from 'ol/geom/Point'
import { getCenter } from 'ol/extent'

export const measurementStyleWithCenter = new Style({
  image: new CircleStyle({
    radius: 2,
    fill: new Fill({
      color: COLORS.staleGray
    })
  }),
  geometry: (feature) => {
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

export const POIStyle = new Style({
  stroke: new Stroke({
    color: COLORS.slateGray,
    lineDash: [4, 4],
    width: 2
  }),
  image: new CircleStyle({
    radius: 2,
    stroke: new Stroke({
      color: COLORS.orange
    }),
    fill: new Fill({
      color: COLORS.red
    })
  })
})
