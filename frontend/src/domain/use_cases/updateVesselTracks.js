import showVesselTrack from './showVesselTrack'
import showVessel from './showVessel'

const updateVesselTracks = () => (dispatch, getState) => {
  const {
    selectedVesselIdentity,
    vesselsTracksShowed
  } = getState().vessel

  if (selectedVesselIdentity) {
    dispatch(showVessel(selectedVesselIdentity, false, true))
  }

  Object.keys(vesselsTracksShowed)
    .forEach(vesselIdentity => {
      dispatch(showVesselTrack(
        vesselsTracksShowed[vesselIdentity].vessel,
        true,
        vesselsTracksShowed[vesselIdentity].trackDepth))
    })
}

export default updateVesselTracks
