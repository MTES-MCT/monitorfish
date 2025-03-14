import { fitToExtent } from '@features/Map/slice'
import { flattenDepth } from 'lodash-es'
import { boundingExtent } from 'ol/extent'
import { GeoJSON } from 'ol/format'

import { OPENLAYERS_PROJECTION } from '../constants'

import type { MultiPolygon as GeoJSONMultiPolygon } from 'geojson'
import type { Coordinate } from 'ol/coordinate'
import type { MultiPolygon } from 'ol/geom'

export const fitMultiPolygonToExtent = (geometry: GeoJSONMultiPolygon | undefined) => dispatch => {
  if (!geometry?.coordinates?.length) {
    return
  }

  const geometryObject = new GeoJSON({
    featureProjection: OPENLAYERS_PROJECTION
  }).readGeometry(geometry)

  const coordinates = (geometryObject as MultiPolygon).getCoordinates()
  const extent = boundingExtent(flattenDepth<Coordinate>(coordinates, 2))
  if (!extent) {
    return
  }

  dispatch(fitToExtent(extent))
}
