import { updateInterestPointKeyBeingDrawed } from '@features/InterestPoint/slice'
import Feature from 'ol/Feature'
import GeoJSON from 'ol/format/GeoJSON'
import Point from 'ol/geom/Point'

import { OPENLAYERS_PROJECTION } from '../../../features/MainMap/constants'

export const saveInterestPointFeature = (feature?: Feature) => (dispatch, getState) => {
  const { interestPointBeingDrawed } = getState().interestPoint

  if (interestPointBeingDrawed?.feature) {
    return
  }

  if (!feature) {
    // TODO Use an intermediate `let` variable to avoid reassigning the `feature` parameter
    // eslint-disable-next-line no-param-reassign
    feature = new Feature({
      geometry: new Point(interestPointBeingDrawed.coordinates),
      properties: interestPointBeingDrawed
    })
  }

  if (feature) {
    feature.setId(interestPointBeingDrawed.uuid)
    feature.setProperties(interestPointBeingDrawed)

    const geoJSONFeature = getGeoJSONFromFeature(feature)

    dispatch(
      updateInterestPointKeyBeingDrawed({
        key: 'feature',
        value: geoJSONFeature
      })
    )
  }
}

function getGeoJSONFromFeature(feature) {
  const parser = new GeoJSON()

  return parser.writeFeatureObject(feature, { featureProjection: OPENLAYERS_PROJECTION })
}
