import GeoJSON from 'ol/format/GeoJSON'
import { OPENLAYERS_PROJECTION } from '../../entities/map/constants'
import { updateInterestPointKeyBeingDrawed } from '../../shared_slices/InterestPoint'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'

const saveInterestPointFeature = feature => (dispatch, getState) => {
  const {
    interestPointBeingDrawed
  } = getState().interestPoint

  if (interestPointBeingDrawed?.feature) {
    return
  }

  if (!feature) {
    feature = new Feature({
      geometry: new Point(interestPointBeingDrawed.coordinates),
      properties: interestPointBeingDrawed
    })
  }

  if (feature) {
    feature.setId(interestPointBeingDrawed.uuid)
    feature.setProperties(interestPointBeingDrawed)

    const geoJSONFeature = getGeoJSONFromFeature(feature)

    dispatch(updateInterestPointKeyBeingDrawed({
      key: 'feature',
      value: geoJSONFeature
    }))
  }
}

function getGeoJSONFromFeature (feature) {
  const parser = new GeoJSON()
  return parser.writeFeatureObject(feature, { featureProjection: OPENLAYERS_PROJECTION })
}

export default saveInterestPointFeature
