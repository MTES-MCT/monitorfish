import { logbookActions } from '@features/Logbook/slice'
import { VESSEL_TRACK_VECTOR_SOURCE } from '@features/Vessel/layers/VesselsTracksLayer/constants'
import { removeFishingActivitiesFeatures } from '@features/Vessel/types/track'

import type { MainAppThunk } from '@store'

export const toggleAndHideLogbookMessageOverlays = (): MainAppThunk => async dispatch => {
  await dispatch(logbookActions.hideAllLogbookOverlays())

  const features = VESSEL_TRACK_VECTOR_SOURCE.getFeatures()

  removeFishingActivitiesFeatures(features, VESSEL_TRACK_VECTOR_SOURCE)

  VESSEL_TRACK_VECTOR_SOURCE.changed()
}
