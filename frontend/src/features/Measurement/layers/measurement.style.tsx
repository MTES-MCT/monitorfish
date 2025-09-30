import { getCenter } from 'ol/extent'
import Point from 'ol/geom/Point'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Style from 'ol/style/Style'

export const measurementStyleWithCenter = new Style({
  geometry: feature => {
    if (feature.getGeometry()?.getType() === 'LineString') {
      return undefined
    }

    const extent = feature.getGeometry()?.getExtent()
    if (!extent) {
      return undefined
    }

    const center = getCenter(extent)

    return new Point(center)
  },
  image: new CircleStyle({
    fill: new Fill({
      color: '#ff3392'
    }),
    radius: 2
  })
})

export const measurementStyle = new Style({
  stroke: new Stroke({
    color: '#ff3392',
    lineDash: [4, 4],
    width: 2
  })
})
