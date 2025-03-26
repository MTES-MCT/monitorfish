import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'
import { vesselSelectors } from '../../Vessel/slice'

import type { VesselListFilter } from '@features/Vessel/components/VesselList/types'
import type { MainAppThunk } from '@store'

export const countFilteredVessels =
  (listFilterValues: VesselListFilter): MainAppThunk<Promise<number>> =>
  async (_, getState): Promise<number> => {
    const monitorFishWorker = await MonitorFishWorker

    const vessels = vesselSelectors.selectAll(getState().vessel.vessels)

    const filteredVesselFeatureIds = await monitorFishWorker.getFilteredVesselsV2(vessels, listFilterValues)

    return filteredVesselFeatureIds.length
  }
