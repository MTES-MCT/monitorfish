import { logbookActions } from '@features/Logbook/slice'
import { displayLogbookMessageOverlays } from '@features/Logbook/useCases/displayedLogbookOverlays/displayLogbookMessageOverlays'
import { getVesselLogbookByDates } from '@features/Logbook/useCases/getVesselLogbookByDates'
import { updateSelectedVesselTrack } from '@features/Vessel/useCases/updateSelectedVesselTrack'

import type { TrackRequest } from '@features/Vessel/types/types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainAppThunk } from '@store'

/**
 * Update from the positions panel
 */
export const updateVesselTrackAndLogbookFromDates =
  (vesselIdentity: Vessel.VesselIdentity, trackRequest: TrackRequest): MainAppThunk =>
  async dispatch => {
    dispatch(logbookActions.setIsLoading())
    await dispatch(updateSelectedVesselTrack(vesselIdentity, trackRequest))
    await dispatch(getVesselLogbookByDates(vesselIdentity, trackRequest))
    await dispatch(displayLogbookMessageOverlays())
  }
