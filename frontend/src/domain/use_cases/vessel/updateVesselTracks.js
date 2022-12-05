import { showVesselTrack } from './showVesselTrack'
import { showVessel } from './showVessel'

export const updateVesselTracks = () => (dispatch, getState) => {
  const {
    selectedVesselIdentity,
    vesselsTracksShowed
  } = getState().vessel

  if (selectedVesselIdentity) {
    dispatch(showVessel(selectedVesselIdentity, false, true))
  }

  Object.keys(vesselsTracksShowed)
    .forEach(vesselIdentity => updateVesselTracksWithDefaultTrackDepth(dispatch)(vesselsTracksShowed[vesselIdentity]))
}

const updateVesselTracksWithDefaultTrackDepth = dispatch => vesselTrack => {
  if (!vesselTrack.isDefaultTrackDepth) {
    return
  }

  dispatch(showVesselTrack(
    vesselTrack.vesselIdentity,
    true,
    null))
}
