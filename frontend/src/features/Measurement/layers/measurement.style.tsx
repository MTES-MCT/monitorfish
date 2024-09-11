import { THEME } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
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
    assertNotNullish(extent)
    const center = getCenter(extent)

    return new Point(center)
  },
  image: new CircleStyle({
    fill: new Fill({
      color: THEME.color.slateGray
    }),
    radius: 2
  })
})

export const measurementStyle = new Style({
  stroke: new Stroke({
    color: THEME.color.slateGray,
    lineDash: [4, 4],
    width: 2
  })
})
