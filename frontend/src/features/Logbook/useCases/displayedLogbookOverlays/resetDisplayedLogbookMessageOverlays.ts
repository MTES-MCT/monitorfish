import { logbookActions } from '@features/Logbook/slice'
import { VESSEL_TRACK_VECTOR_SOURCE } from '@features/Vessel/layers/VesselsTracksLayer/constants'
import { removeFishingActivitiesFeatures } from '@features/Vessel/types/track'

import type { MainAppThunk } from '@store'

export const resetDisplayedLogbookMessageOverlays = (): MainAppThunk => async dispatch => {
  const features = VESSEL_TRACK_VECTOR_SOURCE.getFeatures()

  await dispatch(logbookActions.reset())

  removeFishingActivitiesFeatures(features, VESSEL_TRACK_VECTOR_SOURCE)

  VESSEL_TRACK_VECTOR_SOURCE.changed()
}
