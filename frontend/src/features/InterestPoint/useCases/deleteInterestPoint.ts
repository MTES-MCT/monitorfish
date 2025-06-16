import { interestPointActions } from '@features/InterestPoint/slice'

import { INTEREST_POINT_VECTOR_SOURCE } from '../layers/constants'
import { InterestPointLine } from '../layers/interestPointLine'

export const deleteInterestPoint = (id: string) => (dispatch, getState) => {
  const { interestPointIdEdited } = getState().interestPoint

  const feature = INTEREST_POINT_VECTOR_SOURCE.getFeatureById(id)
  if (feature) {
    INTEREST_POINT_VECTOR_SOURCE.removeFeature(feature)
    INTEREST_POINT_VECTOR_SOURCE.changed()
  }

  const featureLine = INTEREST_POINT_VECTOR_SOURCE.getFeatureById(InterestPointLine.getFeatureId(id))
  if (featureLine) {
    INTEREST_POINT_VECTOR_SOURCE.removeFeature(featureLine)
    INTEREST_POINT_VECTOR_SOURCE.changed()
  }

  dispatch(interestPointActions.interestPointRemoved(id))

  if (id === interestPointIdEdited) {
    dispatch(interestPointActions.interestPointEditionEnded())
  }
}
