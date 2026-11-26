import { isReplayedVessel } from '@features/PositionReplay/replayedVessel'
import { selectIsPositionReplayActive } from '@features/PositionReplay/selectors'
import { vesselSelectors } from '@features/Vessel/slice'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { createSelector } from '@reduxjs/toolkit'

import type { MainRootState } from '@store'

export type SelectedVesselMarkerPosition = {
  course: number | undefined
  latitude: number
  longitude: number
}

const selectReplayedSelectedVessel = (state: MainRootState) => {
  if (!selectIsPositionReplayActive(state) || !state.vessel.selectedVesselIdentity) {
    return undefined
  }

  const vessel = vesselSelectors.selectById(
    state.vessel.vessels,
    VesselFeature.getVesselFeatureId(state.vessel.selectedVesselIdentity)
  )

  return vessel && isReplayedVessel(vessel) ? vessel : undefined
}

/**
 * The selected vessel data holds its current last position: while replaying, the marker is drawn on the replayed one.
 */
export const selectSelectedVesselMarkerPosition = createSelector(
  [selectIsPositionReplayActive, (state: MainRootState) => state.vessel.selectedVessel, selectReplayedSelectedVessel],
  (isPositionReplayActive, selectedVessel, replayedSelectedVessel): SelectedVesselMarkerPosition | undefined => {
    if (isPositionReplayActive) {
      return replayedSelectedVessel
        ? {
            course: replayedSelectedVessel.course,
            latitude: replayedSelectedVessel.latitude,
            longitude: replayedSelectedVessel.longitude
          }
        : undefined
    }

    if (!selectedVessel?.lastPositionLatitude || !selectedVessel?.lastPositionLongitude) {
      return undefined
    }

    return {
      course: selectedVessel.lastPositionCourse,
      latitude: selectedVessel.lastPositionLatitude,
      longitude: selectedVessel.lastPositionLongitude
    }
  }
)
