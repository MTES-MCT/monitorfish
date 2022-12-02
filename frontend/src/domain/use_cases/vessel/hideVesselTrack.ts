import { updateVesselTrackAsToHide } from '../../shared_slices/Vessel'

import type { VesselCompositeIdentifier } from '../../entities/vessel/types'

/**
 * Hide a specified vessel track on map
 */
export const hideVesselTrack = (vesselCompositeIdentifier: VesselCompositeIdentifier) => dispatch => {
  dispatch(updateVesselTrackAsToHide(vesselCompositeIdentifier))
}
