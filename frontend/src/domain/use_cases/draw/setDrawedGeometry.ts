import { convertToGeoJSONGeometryObject } from '../../entities/layers'
import { setDrawedGeometry as setDrawedGeometryGeoJSON } from '../../shared_slices/Draw'

import type { Geometry } from 'ol/geom'

export const setDrawedGeometry = (geometry: Geometry) => dispatch => {
  if (!geometry) {
    return
  }

  const nextGeometry = convertToGeoJSONGeometryObject(geometry)
  dispatch(setDrawedGeometryGeoJSON(nextGeometry))
}
