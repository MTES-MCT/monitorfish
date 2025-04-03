import { convertToGeoJSONGeometryObject } from '@features/Map/utils'
import {
  addMeasurementDrawed,
  resetCircleMeasurementInDrawing,
  resetMeasurementTypeToAdd
} from '@features/Measurement/slice'
import { trackEvent } from '@hooks/useTracking'
import Feature from 'ol/Feature'
import Circle from 'ol/geom/Circle'
import { fromCircle } from 'ol/geom/Polygon'
import { v4 as uuidv4 } from 'uuid'

import { setRightMapBoxOpened } from '../../../domain/shared_slices/Global'

import type { Geometry } from 'geojson'
import type { SimpleGeometry } from 'ol/geom'

export const saveMeasurement = (email?: string | undefined) => (feature: Feature, measurement: string) => dispatch => {
  dispatch(resetMeasurementTypeToAdd())
  if (feature.getGeometry() instanceof Circle) {
    feature.setGeometry(fromCircle(feature.getGeometry() as Circle))
  }

  const geometry = feature.getGeometry()
  if (!geometry) {
    return
  }

  const geojsonGeometry = convertToGeoJSONGeometryObject<Geometry>(geometry)

  dispatch(
    addMeasurementDrawed({
      coordinates: (geometry as SimpleGeometry).getLastCoordinate(),
      geometry: geojsonGeometry,
      id: uuidv4(),
      measurement
    })
  )
  trackEvent({
    action: "Création d'une mesure dessinée sur la carte",
    category: 'MEASURE',
    name: email ?? ''
  })
  dispatch(resetCircleMeasurementInDrawing())
  dispatch(setRightMapBoxOpened(undefined))
}
