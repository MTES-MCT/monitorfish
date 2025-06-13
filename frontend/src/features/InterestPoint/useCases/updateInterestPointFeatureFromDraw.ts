import { interestPointActions, interestPointSelectors } from '@features/InterestPoint/slice'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@features/Map/constants'
import { assertNotNullish } from '@utils/assertNotNullish'
import Feature from 'ol/Feature'
import GeoJSON from 'ol/format/GeoJSON'

import type { InterestPoint } from '@features/InterestPoint/types'

export const updateInterestPointFeatureFromDraw = (feature: Feature) => (dispatch, getState) => {
  const { interestPointIdEdited } = getState().interestPoint
  const interestPointEdited = interestPointSelectors.selectById(
    getState().interestPoint.interestPoints,
    interestPointIdEdited
  )
  assertNotNullish(interestPointEdited)

  feature.setId(interestPointIdEdited)
  feature.setProperties(interestPointEdited.properties)

  const geoJSONFeature = getGeoJSONFromFeature(feature)

  dispatch(interestPointActions.interestPointUpdated(geoJSONFeature as InterestPoint))
}

export function getGeoJSONFromFeature(feature: Feature) {
  const parser = new GeoJSON()

  return parser.writeFeatureObject(feature, {
    dataProjection: WSG84_PROJECTION,
    featureProjection: OPENLAYERS_PROJECTION
  })
}
