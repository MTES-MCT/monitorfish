import { updateVesselTrackAsToHide } from '../shared_slices/Vessel'

/**
 * Hide a specified vessel track on map
 * @function hideVesselTrack
 * @param {VesselIdentity} vesselIdentity
 */
const hideVesselTrack = vesselIdentity => (dispatch, getState) => {
  dispatch(updateVesselTrackAsToHide(vesselIdentity))
}

export default hideVesselTrack
