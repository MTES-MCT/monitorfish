import { Geometry, MultiPolygon } from 'ol/geom'

import { addGeometryToMultiPolygonGeoJSON, convertToGeoJSONGeometryObject } from '../../entities/layers'
import { OpenLayersGeometryType } from '../../entities/map/constants'
import { setGeometry } from '../../shared_slices/Draw'

import type Feature from 'ol/Feature'

export const addFeatureToDrawedFeature = (featureToAdd: Feature<Geometry>) => (dispatch, getState) => {
  const { geometry, listener } = getState().draw
  const geometryToAdd = featureToAdd.getGeometry()
  if (!geometryToAdd || !listener) {
    return
  }

  if (!geometry) {
    if (geometryToAdd.getType() === OpenLayersGeometryType.POINT) {
      const nextGeometry = convertToGeoJSONGeometryObject(geometryToAdd)
      dispatch(setGeometry(nextGeometry))

      return
    }

    // @ts-ignore
    const nextGeometry = convertToGeoJSONGeometryObject(new MultiPolygon([geometryToAdd]))
    dispatch(setGeometry(nextGeometry))

    return
  }

  const nextGeometry = addGeometryToMultiPolygonGeoJSON(geometry, geometryToAdd)
  if (nextGeometry) {
    dispatch(setGeometry(nextGeometry))
  }
}
