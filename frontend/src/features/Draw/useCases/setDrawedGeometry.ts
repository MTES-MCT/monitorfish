import { setDrawedGeometry as setDrawedGeometryGeoJSON } from '@features/Draw/slice'

import { convertToGeoJSONGeometryObject } from '../../MainMap/utils'

import type { Geometry } from 'ol/geom'

export const setDrawedGeometry = (geometry: Geometry) => dispatch => {
  if (!geometry) {
    return
  }

  const nextGeometry = convertToGeoJSONGeometryObject(geometry)
  dispatch(setDrawedGeometryGeoJSON(nextGeometry))
}
