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

  if (geometryToAdd.getType() === OpenLayersGeometryType.POINT) {
    const nextGeometry = convertToGeoJSONGeometryObject(geometryToAdd)
    dispatch(setGeometry(nextGeometry))

    return
  }

  if (!geometry) {
    // @ts-ignore
    const nextGeometry = convertToGeoJSONGeometryObject(new MultiPolygon([geometryToAdd]))
    dispatch(setGeometry(nextGeometry))

    return
  }

  const nextGeometryTwo = addGeometryToMultiPolygonGeoJSON(geometry, geometryToAdd)
  if (nextGeometryTwo) {
    dispatch(setGeometry(nextGeometryTwo))
  }
}
