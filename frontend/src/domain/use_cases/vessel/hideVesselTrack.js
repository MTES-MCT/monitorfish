import { updateVesselTrackAsToHide } from '../../shared_slices/Vessel'

/**
 * Hide a specified vessel track on map
 * @function hideVesselTrack
 * @param {VesselId} vesselId
 */
const hideVesselTrack = vesselId => dispatch => {
  dispatch(updateVesselTrackAsToHide(vesselId))
}

export default hideVesselTrack
