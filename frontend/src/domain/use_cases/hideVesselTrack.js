import { updateVesselTrackAsToHide } from '../shared_slices/Vessel'
import { Vessel } from '../entities/vessel'

/**
 * Hide a specified vessel track on map
 * @function showVesselTrack
 * @param {VesselIdentity} vesselIdentity
 */
const hideVesselTrack = vesselIdentity => (dispatch, getState) => {
  const {
    vesselsLayerSource
  } = getState().vessel

  const feature = vesselsLayerSource.getFeatureById(Vessel.getVesselIdFromIdentity(vesselIdentity))
  if (feature) {
    feature.set(Vessel.isSelectedProperty, false)
  }
  dispatch(updateVesselTrackAsToHide(vesselIdentity))
}

export default hideVesselTrack
