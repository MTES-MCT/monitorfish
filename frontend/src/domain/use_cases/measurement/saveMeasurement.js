import GeoJSON from 'ol/format/GeoJSON'
import Circle from 'ol/geom/Circle'
import { fromCircle } from 'ol/geom/Polygon'
import { batch } from 'react-redux'

import { OPENLAYERS_PROJECTION } from '../../entities/map'
import { setMapToolOpened } from '../../shared_slices/Global'
import { addMeasurementDrawed, resetCircleMeasurementInDrawing } from '../../shared_slices/Measurement'

const saveMeasurement = (feature, measurement) => dispatch => {
  feature.setId(feature.ol_uid)

  if (feature.getGeometry() instanceof Circle) {
    feature.setGeometry(fromCircle(feature.getGeometry()))
  }

  const geoJSONFeature = getGeoJSONFromFeature(feature)

  const tooltipCoordinates = feature.getGeometry().getLastCoordinate()
  batch(() => {
    dispatch(
      addMeasurementDrawed({
        coordinates: tooltipCoordinates,
        feature: geoJSONFeature,
        measurement
      })
    )
    dispatch(resetCircleMeasurementInDrawing())
    dispatch(setMapToolOpened(undefined))
  })
}

function getGeoJSONFromFeature(feature) {
  const parser = new GeoJSON()

  return parser.writeFeatureObject(feature, { featureProjection: OPENLAYERS_PROJECTION })
}

export default saveMeasurement
