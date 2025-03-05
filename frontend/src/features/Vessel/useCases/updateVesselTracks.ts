import { updateSelectedVesselTrack } from '@features/Vessel/useCases/updateSelectedVesselTrack'

import { showVesselTrack } from './showVesselTrack'

import type { MainAppThunk } from '@store'

export const updateVesselTracks = (): MainAppThunk => (dispatch, getState) => {
  const { selectedVesselIdentity, vesselsTracksShowed } = getState().vessel

  if (selectedVesselIdentity) {
    dispatch(updateSelectedVesselTrack(selectedVesselIdentity))
  }

  Object.keys(vesselsTracksShowed).forEach(vesselIdentity =>
    updateVesselTracksWithDefaultTrackDepth(dispatch)(vesselsTracksShowed[vesselIdentity])
  )
}

const updateVesselTracksWithDefaultTrackDepth = dispatch => vesselTrack => {
  if (!vesselTrack.isDefaultTrackDepth) {
    return
  }

  dispatch(showVesselTrack(vesselTrack.vesselIdentity, false, null))
}
