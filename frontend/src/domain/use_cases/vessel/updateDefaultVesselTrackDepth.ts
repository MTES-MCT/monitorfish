import { updateVesselTracks } from './updateVesselTracks'
import { setDefaultVesselTrackDepth } from '../../shared_slices/Map'

import type { SelectableVesselTrackDepth } from '@features/VesselSidebar/actions/TrackRequest/types'

/**
 * Update the global vessel track Depth and re-render the rendered vessels tracks
 */
export const updateDefaultVesselTrackDepth = (trackDepth: SelectableVesselTrackDepth | undefined) => dispatch => {
  if (!trackDepth) {
    return
  }

  dispatch(setDefaultVesselTrackDepth(trackDepth))
  dispatch(updateVesselTracks())
}
