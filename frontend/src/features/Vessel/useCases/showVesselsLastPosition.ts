import { renderVesselFeatures } from '@features/Vessel/useCases/rendering/renderVesselFeatures'
import { Vessel } from '@features/Vessel/Vessel.types'

import { resetIsUpdatingVessels } from '../../../domain/shared_slices/Global'
import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'
import { setFilteredVesselsFeatures, setVessels } from '../slice'

import type { MainAppThunk } from '@store'

export const showVesselsLastPosition =
  (vessels: Vessel.VesselLastPosition[]): MainAppThunk =>
  async (dispatch, getState) => {
    const { listFilterValues } = getState().vessel

    dispatch(setVessels(vessels))

    const filteredVesselFeatureIds = await MonitorFishWorker.getFilteredVessels(vessels, listFilterValues)

    dispatch(setFilteredVesselsFeatures(filteredVesselFeatureIds))

    dispatch(renderVesselFeatures())

    dispatch(resetIsUpdatingVessels())
  }
