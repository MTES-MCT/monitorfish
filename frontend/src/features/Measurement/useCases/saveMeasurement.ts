import { convertToGeoJSONGeometryObject } from '@features/Map/utils'
import { addMeasurementDrawed, resetCircleMeasurementInDrawing } from '@features/Measurement/slice'
import Feature from 'ol/Feature'
import Circle from 'ol/geom/Circle'
import { fromCircle } from 'ol/geom/Polygon'
import { v4 as uuidv4 } from 'uuid'

import { setRightMapBoxOpened } from '../../../domain/shared_slices/Global'

import type { SimpleGeometry } from 'ol/geom'

export const saveMeasurement = (feature: Feature, measurement: string) => dispatch => {
  if (feature.getGeometry() instanceof Circle) {
    feature.setGeometry(fromCircle(feature.getGeometry() as Circle))
  }

  const geometry = feature.getGeometry()
  if (!geometry) {
    return
  }

  const geojsonGeometry = convertToGeoJSONGeometryObject(geometry)

  dispatch(
    addMeasurementDrawed({
      coordinates: (geometry as SimpleGeometry).getLastCoordinate(),
      geometry: geojsonGeometry,
      id: uuidv4(),
      measurement
    })
  )
  dispatch(resetCircleMeasurementInDrawing())
  dispatch(setRightMapBoxOpened(undefined))
}
