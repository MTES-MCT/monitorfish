import { hideVesselTrack } from '@features/Vessel/useCases/hideVesselTrack'

import type { MainAppThunk } from '@store'

export const hideVesselsTracks = (): MainAppThunk => (dispatch, getState) => {
  Object.keys(getState().vessel.vesselsTracksShowed).forEach(vesselCompositeIdentifier =>
    dispatch(hideVesselTrack(vesselCompositeIdentifier))
  )
}
