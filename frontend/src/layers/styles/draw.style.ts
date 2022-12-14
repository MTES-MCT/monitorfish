import MultiPoint from 'ol/geom/MultiPoint'
import { Circle, Icon, Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

import { theme } from '../../ui/theme'

import type { MultiPolygon } from 'ol/geom'

export const drawStyle = new Style({
  fill: new Fill({
    color: 'rgba(31, 120, 180, 0.28)'
  }),
  image: new Icon({
    opacity: 1,
    scale: 1.5,
    src: 'Pointeur_selection_zone.svg'
  }),
  stroke: new Stroke({
    color: theme.color.charcoal,
    width: 5
  })
})

export const editStyle = new Style({
  geometry: feature => {
    if (!feature.getGeometry()) {
      return undefined
    }

    const coordinates = (feature.getGeometry() as MultiPolygon).getCoordinates()
    const points = coordinates.reduce((accumulator, polygon) => {
      const firstPolygonRing = polygon[0]
      if (firstPolygonRing) {
        return accumulator.concat(firstPolygonRing)
      }

      return accumulator
    }, [])

    if (!coordinates) {
      return undefined
    }

    // @ts-ignore
    return new MultiPoint(points)
  },
  image: new Circle({
    fill: new Fill({
      color: theme.color.white
    }),
    radius: 5,
    stroke: new Stroke({
      color: theme.color.charcoal,
      width: 3
    })
  })
})
