import { renderVesselFeatures } from '@features/Vessel/useCases/rendering/renderVesselFeatures'

import { MonitorFishWorker } from '../../../../workers/MonitorFishWorker'
import { setFilteredVesselsFeatures, vesselActions, vesselSelectors } from '../../slice'

import type { VesselListFilter } from '@features/Vessel/components/VesselList/types'
import type { MainAppThunk } from '@store'

export const filterVessels =
  (updatedListFilterValue: Partial<VesselListFilter>): MainAppThunk =>
  async (dispatch, getState) => {
    dispatch(vesselActions.setListFilterValues(updatedListFilterValue))

    const { listFilterValues } = getState().vessel
    const vessels = vesselSelectors.selectAll(getState().vessel.vessels)

    const filteredVesselFeatureIds = await MonitorFishWorker.getFilteredVessels(vessels, listFilterValues)

    dispatch(setFilteredVesselsFeatures(filteredVesselFeatureIds))

    dispatch(renderVesselFeatures())
  }
