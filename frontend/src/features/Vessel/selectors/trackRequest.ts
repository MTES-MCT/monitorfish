import { selectPositionsDateTime } from '@features/PositionReplay/selectors'
import { getReplayedTrackRequest } from '@features/PositionReplay/track'
import { getTrackRequestFromTrackDepth } from '@features/Vessel/types/vesselTrackDepth'

import type { TrackRequest } from '@features/Vessel/types/types'
import type { MainRootState } from '@store'

export const selectDefaultTrackRequest = (state: MainRootState): TrackRequest =>
  getReplayedTrackRequest(selectPositionsDateTime(state)) ??
  getTrackRequestFromTrackDepth(state.map.defaultVesselTrackDepth)

export const selectSelectedVesselTrackRequest = (state: MainRootState): TrackRequest =>
  getReplayedTrackRequest(selectPositionsDateTime(state)) ??
  state.vessel.selectedVesselTrackRequest ??
  getTrackRequestFromTrackDepth(state.map.defaultVesselTrackDepth)
