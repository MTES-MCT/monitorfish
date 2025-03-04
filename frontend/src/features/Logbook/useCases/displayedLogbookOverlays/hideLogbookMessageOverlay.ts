import { logbookActions } from '@features/Logbook/slice'
import { VESSEL_TRACK_VECTOR_SOURCE } from '@features/Vessel/layers/VesselsTracksLayer/constants'

import type { MainAppThunk } from '@store'

export const hideLogbookMessageOverlay =
  (operationNumber: string | undefined): MainAppThunk =>
  async dispatch => {
    if (!operationNumber) {
      return
    }

    await dispatch(logbookActions.hideLogbookOverlay(operationNumber))

    const features = VESSEL_TRACK_VECTOR_SOURCE.getFeatures()

    const featureToRemove = features.find(feature => feature?.getId()?.toString()?.includes(operationNumber))

    if (featureToRemove) {
      VESSEL_TRACK_VECTOR_SOURCE.removeFeature(featureToRemove)
      VESSEL_TRACK_VECTOR_SOURCE.changed()
    }
  }
