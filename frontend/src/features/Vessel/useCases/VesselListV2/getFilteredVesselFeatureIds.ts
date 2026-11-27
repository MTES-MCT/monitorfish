import { selectIsDataAvailablePredicate } from '@features/PositionReplay/replayableData'
import { selectPositionsDateTime } from '@features/PositionReplay/selectors'
import { getApplicableVesselListFilter } from '@features/PositionReplay/vesselListFilter'

import { MonitorFishWorker } from '../../../../workers/MonitorFishWorker'

import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainRootState } from '@store'

export function getFilteredVesselFeatureIds(
  vessels: Vessel.DisplayedVessel[],
  state: MainRootState
): Promise<string[]> {
  return MonitorFishWorker.getFilteredVessels(
    vessels,
    getApplicableVesselListFilter(state.vessel.listFilterValues, selectIsDataAvailablePredicate(state)),
    selectPositionsDateTime(state)
  )
}
