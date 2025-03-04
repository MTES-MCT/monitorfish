import { setDefaultVesselTrackDepth } from '@features/Map/slice'

import { updateVesselTracks } from './updateVesselTracks'

import type { SelectableVesselTrackDepth } from '@features/Vessel/components/VesselSidebar/actions/TrackRequest/types'

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
