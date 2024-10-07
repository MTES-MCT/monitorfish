import { updateVesselTrackAsToHide } from '@features/Vessel/slice'

import type { VesselCompositeIdentifier } from '../../entities/vessel/types'

/**
 * Hide a specified vessel track on map
 */
export const hideVesselTrack = (vesselCompositeIdentifier: VesselCompositeIdentifier) => dispatch => {
  dispatch(updateVesselTrackAsToHide(vesselCompositeIdentifier))
}
