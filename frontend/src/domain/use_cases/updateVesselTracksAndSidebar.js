import showVesselTrackAndSidebar from './showVesselTrackAndSidebar'
import showVesselTrack from './showVesselTrack'

const updateVesselTracksAndSidebar = () => (dispatch, getState) => {
  const {
    selectedVesselIdentity,
    vesselsTracksShowed
  } = getState().vessel

  if (selectedVesselIdentity) {
    dispatch(showVesselTrackAndSidebar(selectedVesselIdentity, false, true))
  }

  Object.keys(vesselsTracksShowed)
    .forEach(vesselIdentity => {
      dispatch(showVesselTrack(
        vesselsTracksShowed[vesselIdentity].vessel,
        true,
        vesselsTracksShowed[vesselIdentity].trackDepth))
    })
}

export default updateVesselTracksAndSidebar
