import { convertToGeoJSONGeometryObject } from '../../entities/layers'
import { setGeometry as setGeometryGeoJSON } from '../../shared_slices/Draw'

import type { Geometry } from 'ol/geom'

export const setGeometry = (geometry: Geometry) => dispatch => {
  if (!geometry) {
    return
  }

  const nextGeometry = convertToGeoJSONGeometryObject(geometry)
  dispatch(setGeometryGeoJSON(nextGeometry))
}
