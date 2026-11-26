import { renderVesselFeatures } from '@features/Vessel/useCases/rendering/renderVesselFeatures'
import { getFilteredVesselFeatureIds } from '@features/Vessel/useCases/VesselListV2/getFilteredVesselFeatureIds'
import { Vessel } from '@features/Vessel/Vessel.types'

import { setAreActiveVesselsDisplayed } from '../../../domain/shared_slices/Global'
import { setFilteredVesselsFeatures, setVessels } from '../slice'

import type { MainAppThunk } from '@store'

export const saveActiveVesselsAndDisplayLastPositions =
  (vessels: Vessel.DisplayedVessel[]): MainAppThunk =>
  async (dispatch, getState) => {
    dispatch(setVessels(vessels))

    const filteredVesselFeatureIds = await getFilteredVesselFeatureIds(vessels, getState())

    dispatch(setFilteredVesselsFeatures(filteredVesselFeatureIds))

    dispatch(renderVesselFeatures())

    dispatch(setAreActiveVesselsDisplayed())
  }
