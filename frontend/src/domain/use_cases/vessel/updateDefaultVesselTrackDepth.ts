import { updateVesselTracks } from './updateVesselTracks'
import { setDefaultVesselTrackDepth } from '../../shared_slices/Map'

import type { VesselTrackDepth } from '../../entities/vesselTrackDepth'

/**
 * Update the global vessel track Depth and re-render the rendered vessels tracks
 */
export const updateDefaultVesselTrackDepth = (trackDepth: VesselTrackDepth) => dispatch => {
  dispatch(setDefaultVesselTrackDepth(trackDepth))
  dispatch(updateVesselTracks())
}
