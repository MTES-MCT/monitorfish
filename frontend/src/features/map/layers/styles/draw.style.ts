import { THEME } from '@mtes-mct/monitor-ui'
import MultiPoint from 'ol/geom/MultiPoint'
import { Circle, Icon, Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

import { OpenLayersGeometryType } from '../../../../domain/entities/map/constants'
import { theme } from '../../../../ui/theme'

import type { MultiPolygon } from 'ol/geom'

export const drawStyle = new Style({
  image: new Icon({
    opacity: 1,
    scale: 1.5,
    src: 'Pointeur_selection_zone.svg?react'
  }),
  stroke: new Stroke({
    color: THEME.color.slateGray,
    lineDash: [4, 4],
    width: 2
  })
})

export const editStyle = new Style({
  geometry: feature => {
    if (!feature.getGeometry()) {
      return undefined
    }

    if (feature.getGeometry()?.getType() === OpenLayersGeometryType.POINT) {
      return feature.getGeometry()
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
