import GeoJSON from 'ol/format/GeoJSON'
import { OPENLAYERS_PROJECTION } from '../entities/map'
import { updateInterestPointKeyBeingDrawed } from '../reducers/InterestPoint'

const saveInterestPointFeature = feature => (dispatch, getState) => {
  const {
    interestPointBeingDrawed
  } = getState().interestPoint

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
