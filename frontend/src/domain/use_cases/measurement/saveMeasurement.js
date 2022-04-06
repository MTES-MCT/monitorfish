import GeoJSON from 'ol/format/GeoJSON'
import { OPENLAYERS_PROJECTION } from '../../entities/map'
import Circle from 'ol/geom/Circle'
import { fromCircle } from 'ol/geom/Polygon'
import { addMeasurementDrawed, resetCircleMeasurementInDrawing } from '../../shared_slices/Measurement'
import { batch } from 'react-redux'

const saveMeasurement = (feature, measurement) => dispatch => {
  feature.setId(feature.ol_uid)

  if (feature.getGeometry() instanceof Circle) {
    feature.setGeometry(fromCircle(feature.getGeometry()))
  }

  const geoJSONFeature = getGeoJSONFromFeature(feature)

  const tooltipCoordinates = feature.getGeometry().getLastCoordinate()
  batch(() => {
    dispatch(addMeasurementDrawed({
      feature: geoJSONFeature,
      measurement: measurement,
      coordinates: tooltipCoordinates
    }))
    resetCircleMeasurementInDrawing()
  })
}

function getGeoJSONFromFeature (feature) {
  const parser = new GeoJSON()
  return parser.writeFeatureObject(feature, { featureProjection: OPENLAYERS_PROJECTION })
}

export default saveMeasurement
