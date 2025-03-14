import { drawActions } from '@features/Draw/slice'
import { convertToGeoJSONGeometryObject } from '@features/Map/utils'

import type { MainAppThunk } from '@store'
import type { Geometry as GeoJSONGeometry } from 'geojson'
import type { Geometry } from 'ol/geom'

export const setDrawedGeometry =
  (geometry: Geometry): MainAppThunk =>
  dispatch => {
    const geometryAsGeoJsonGeometry = convertToGeoJSONGeometryObject<GeoJSONGeometry>(geometry)

    dispatch(drawActions.setDrawedGeometry(geometryAsGeoJsonGeometry))
  }
