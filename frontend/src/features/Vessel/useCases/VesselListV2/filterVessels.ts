import { renderVesselFeatures } from '@features/Vessel/useCases/rendering/renderVesselFeatures'
import { getFilteredVesselFeatureIds } from '@features/Vessel/useCases/VesselListV2/getFilteredVesselFeatureIds'

import { setFilteredVesselsFeatures, vesselActions, vesselSelectors } from '../../slice'

import type { VesselListFilter } from '@features/Vessel/components/VesselList/types'
import type { MainAppThunk } from '@store'

export const filterVessels =
  (updatedListFilterValue: Partial<VesselListFilter>): MainAppThunk =>
  async (dispatch, getState) => {
    dispatch(vesselActions.setListFilterValues(updatedListFilterValue))

    const vessels = vesselSelectors.selectAll(getState().vessel.vessels)

    const filteredVesselFeatureIds = await getFilteredVesselFeatureIds(vessels, getState())

    dispatch(setFilteredVesselsFeatures(filteredVesselFeatureIds))

    dispatch(renderVesselFeatures())
  }
