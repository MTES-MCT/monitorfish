import { flattenDepth } from 'lodash'
import { boundingExtent } from 'ol/extent'
import { GeoJSON } from 'ol/format'

import { OPENLAYERS_PROJECTION } from '../../entities/map/constants'
import { fitToExtent } from '../../shared_slices/Map'

import type { GeoJSON as GeoJSONNamespace } from '../../types/GeoJSON'
import type { Coordinate } from 'ol/coordinate'
import type { MultiPolygon } from 'ol/geom'

export const fitMultiPolygonToExtent = (geometry: GeoJSONNamespace.Geometry | undefined) => dispatch => {
  if (!geometry) {
    return
  }

  const geometryObject = new GeoJSON({
    featureProjection: OPENLAYERS_PROJECTION
  }).readGeometry(geometry)

  const coordinates = (geometryObject as MultiPolygon).getCoordinates()

  dispatch(fitToExtent(boundingExtent(flattenDepth<Coordinate>(coordinates, 2))))
}
