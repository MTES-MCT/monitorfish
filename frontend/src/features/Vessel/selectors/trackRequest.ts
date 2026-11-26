import { selectPositionsDateTime } from '@features/PositionReplay/selectors'
import { getReplayedTrackRequest } from '@features/PositionReplay/track'
import { getTrackRequestFromTrackDepth } from '@features/Vessel/types/vesselTrackDepth'

import type { TrackRequest } from '@features/Vessel/types/types'
import type { MainRootState } from '@store'

/**
 * Track request of a vessel track without user customization.
 */
export const selectDefaultTrackRequest = (state: MainRootState): TrackRequest =>
  getReplayedTrackRequest(selectPositionsDateTime(state)) ??
  getTrackRequestFromTrackDepth(state.map.defaultVesselTrackDepth)

/**
 * Track request of the selected vessel: the one customized by the user, except when positions are replayed.
 */
export const selectSelectedVesselTrackRequest = (state: MainRootState): TrackRequest =>
  getReplayedTrackRequest(selectPositionsDateTime(state)) ??
  state.vessel.selectedVesselTrackRequest ??
  getTrackRequestFromTrackDepth(state.map.defaultVesselTrackDepth)
