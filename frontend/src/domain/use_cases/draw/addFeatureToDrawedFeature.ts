import { Geometry, MultiPolygon } from 'ol/geom'

import { addGeometryToMultiPolygonGeoJSON, convertToGeoJSONGeometryObject } from '../../entities/layers'
import { OpenLayersGeometryType } from '../../entities/map/constants'
import { setDrawedGeometry } from '../../shared_slices/Draw'

import type Feature from 'ol/Feature'

export const addFeatureToDrawedFeature = (feature: Feature<Geometry>) => (dispatch, getState) => {
  const { drawedGeometry, initialGeometry, listener } = getState().draw
  const currentGeometry = drawedGeometry || initialGeometry
  const geometry = feature.getGeometry()
  if (!geometry || !listener) {
    return
  }

  if (geometry.getType() === OpenLayersGeometryType.POINT) {
    const nextGeometry = convertToGeoJSONGeometryObject(geometry)
    dispatch(setDrawedGeometry(nextGeometry))

    return
  }

  if (!currentGeometry) {
    // @ts-ignore
    const nextGeometry = convertToGeoJSONGeometryObject(new MultiPolygon([geometry]))
    dispatch(setDrawedGeometry(nextGeometry))

    return
  }

  const nextGeometry = addGeometryToMultiPolygonGeoJSON(currentGeometry, geometry)
  if (nextGeometry) {
    dispatch(setDrawedGeometry(nextGeometry))
  }
}
