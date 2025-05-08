import { VESSELS_VECTOR_SOURCE } from '@features/Vessel/layers/VesselsLayer/constants'
import { vesselSelectors } from '@features/Vessel/slice'
import { renderLayersDependingOnVesselLayer } from '@features/Vessel/useCases/rendering/renderLayersDependingOnVesselLayer'
import { buildFeature } from '@features/Vessel/utils'

import { MonitorFishWorker } from '../../../../workers/MonitorFishWorker'

import type { MainAppThunk } from '@store'

export const renderVesselFeatures = (): MainAppThunk => async (dispatch, getState) => {
  const { vesselGroupsIdsDisplayed, vesselGroupsIdsPinned } = getState().vesselGroup
  const vessels = vesselSelectors.selectAll(getState().vessel.vessels)

  const vesselsWithPositionAndDisplayedVesselsGroups =
    await MonitorFishWorker.getActiveVesselsWithPositionAndDisplayedVesselsGroups(
      vessels,
      vesselGroupsIdsDisplayed,
      vesselGroupsIdsPinned
    )

  const features = vesselsWithPositionAndDisplayedVesselsGroups.map(([vessel, displayedGroups]) =>
    buildFeature(vessel, displayedGroups)
  )

  VESSELS_VECTOR_SOURCE.clear(true)
  VESSELS_VECTOR_SOURCE.addFeatures(features)
  dispatch(renderLayersDependingOnVesselLayer())
}
