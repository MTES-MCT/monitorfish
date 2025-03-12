import { hideOrShowNonFilteredVessels } from '@features/VesselFilter/useCases/hideOrShowNonFilteredVessels'

import { MonitorFishWorker } from '../../../../workers/MonitorFishWorker'
import { setFilteredVesselsFeatures, vesselActions, vesselSelectors } from '../../slice'

import type { VesselListFilter } from '@features/Vessel/components/VesselListV2/types'
import type { MainAppThunk } from '@store'

export const filterVessels =
  (updatedListFilterValue: Partial<VesselListFilter>): MainAppThunk =>
  async (dispatch, getState) => {
    await dispatch(vesselActions.setListFilterValues(updatedListFilterValue))
    const monitorFishWorker = await MonitorFishWorker

    const { listFilterValues } = getState().vessel
    const vessels = vesselSelectors.selectAll(getState().vessel.vessels)

    const filteredVesselFeatureIds = await monitorFishWorker.getFilteredVesselsV2(vessels, listFilterValues)

    await dispatch(setFilteredVesselsFeatures(filteredVesselFeatureIds))

    dispatch(hideOrShowNonFilteredVessels(true))
  }
