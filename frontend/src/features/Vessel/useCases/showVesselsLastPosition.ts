import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { Vessel } from '@features/Vessel/Vessel.types'

import { resetIsUpdatingVessels } from '../../../domain/shared_slices/Global'
import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'
import { setFilteredVesselsFeatures, setVessels } from '../slice'

import type { MainAppThunk } from '@store'

export const showVesselsLastPosition =
  (vessels: Vessel.VesselLastPosition[]): MainAppThunk =>
  async (dispatch, getState) => {
    const monitorFishWorker = await MonitorFishWorker
    const { listFilterValues } = getState().vessel

    await dispatch(setVessels(vessels))

    const filteredVesselFeatureIds = await monitorFishWorker.getFilteredVessels(vessels, listFilterValues)

    await dispatch(setFilteredVesselsFeatures(filteredVesselFeatureIds))

    await dispatch(renderVesselFeatures())

    dispatch(resetIsUpdatingVessels())
  }
