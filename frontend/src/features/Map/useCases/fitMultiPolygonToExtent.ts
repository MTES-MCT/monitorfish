import { fitToExtent } from '@features/Map/slice'
import { flattenDepth } from 'lodash'
import { boundingExtent } from 'ol/extent'
import { GeoJSON } from 'ol/format'

import { OPENLAYERS_PROJECTION } from '../constants'

import type { GeoJSON as GeoJSONNamespace } from 'domain/types/GeoJSON'
import type { Coordinate } from 'ol/coordinate'
import type { MultiPolygon } from 'ol/geom'

export const fitMultiPolygonToExtent = (geometry: GeoJSONNamespace.Geometry | undefined) => dispatch => {
  if (!(geometry as GeoJSONNamespace.MultiPolygon)?.coordinates?.length) {
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
