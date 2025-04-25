import { VESSELS_VECTOR_SOURCE } from '@features/Vessel/layers/VesselsLayer/constants'
import { vesselSelectors } from '@features/Vessel/slice'
import { renderLayersDependingOnVesselLayer } from '@features/Vessel/useCases/rendering/renderLayersDependingOnVesselLayer'
import { buildFeature } from '@features/Vessel/utils'

import { MonitorFishWorker } from '../../../../workers/MonitorFishWorker'

import type { VesselGroupDisplayInformation } from '../../../../workers/types'
import type { MainAppThunk } from '@store'

export const renderVesselFeatures = (): MainAppThunk => async (dispatch, getState) => {
  const monitorFishWorker = await MonitorFishWorker

  const { vesselGroupsIdsDisplayed, vesselGroupsIdsPinned } = getState().vesselGroup
  const vessels = vesselSelectors.selectAll(getState().vessel.vessels)

  const displayedVesselsGroups = await monitorFishWorker.getDisplayedVesselsGroups(
    vessels,
    vesselGroupsIdsDisplayed,
    vesselGroupsIdsPinned
  )
  const features = vessels.map((vessel, index) =>
    buildFeature(vessel, displayedVesselsGroups[index] as VesselGroupDisplayInformation)
  )

  VESSELS_VECTOR_SOURCE.clear(true)
  VESSELS_VECTOR_SOURCE.addFeatures(features)
  dispatch(renderLayersDependingOnVesselLayer())
}
