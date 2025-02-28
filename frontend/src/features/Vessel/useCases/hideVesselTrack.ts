import { updateVesselTrackAsToHide } from '@features/Vessel/slice'

import type { Vessel } from '@features/Vessel/Vessel.types'

/**
 * Hide a specified vessel track on map
 */
export const hideVesselTrack = (vesselCompositeIdentifier: Vessel.VesselCompositeIdentifier) => dispatch => {
  dispatch(updateVesselTrackAsToHide(vesselCompositeIdentifier))
}
