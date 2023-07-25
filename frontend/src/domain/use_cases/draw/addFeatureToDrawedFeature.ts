import { Geometry, MultiPolygon } from 'ol/geom'

import { addGeometryToMultiPolygonGeoJSON, convertToGeoJSONGeometryObject } from '../../entities/layers'
import { OpenLayersGeometryType } from '../../entities/map/constants'
import { setDrawedGeometry } from '../../shared_slices/Draw'

import type Feature from 'ol/Feature'

export const addFeatureToDrawedFeature = (featureToAdd: Feature<Geometry>) => (dispatch, getState) => {
  const { drawedGeometry, initialGeometry, listener } = getState().draw
  const currentGeometry = drawedGeometry || initialGeometry
  const geometryToAdd = featureToAdd.getGeometry()
  if (!geometryToAdd || !listener) {
    return
  }

  if (geometryToAdd.getType() === OpenLayersGeometryType.POINT) {
    const nextGeometry = convertToGeoJSONGeometryObject(geometryToAdd)
    dispatch(setDrawedGeometry(nextGeometry))

    return
  }

  if (!currentGeometry) {
    // @ts-ignore
    const nextGeometry = convertToGeoJSONGeometryObject(new MultiPolygon([geometryToAdd]))
    dispatch(setDrawedGeometry(nextGeometry))

    return
  }

  const nextGeometry = addGeometryToMultiPolygonGeoJSON(currentGeometry, geometryToAdd)
  if (nextGeometry) {
    dispatch(setDrawedGeometry(nextGeometry))
  }
}
