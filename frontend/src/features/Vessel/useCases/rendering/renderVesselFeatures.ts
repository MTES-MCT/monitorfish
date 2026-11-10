import { VESSELS_VECTOR_LAYER, VESSELS_VECTOR_SOURCE } from '@features/Vessel/layers/VesselsLayer/constants'
import { ActivityType } from '@features/Vessel/schemas/ActiveVesselSchema'
import { selectFilteredVesselFeatureIdsSet, vesselSelectors } from '@features/Vessel/slice'
import { getDisplayedVesselGroups } from '@features/Vessel/useCases/rendering/getDisplayedVesselGroups'
import { renderLayersDependingOnVesselLayer } from '@features/Vessel/useCases/rendering/renderLayersDependingOnVesselLayer'
import { buildFeature } from '@features/Vessel/utils'
import { selectVesselGroupsIdsFiltered } from '@features/VesselGroup/slice'
import { customDayjs } from '@mtes-mct/monitor-ui'

import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainAppThunk } from '@store'

export const renderVesselFeatures = (): MainAppThunk => (dispatch, getState) => {
  const { vesselGroupsIdsDisplayed, vesselGroupsIdsPinned } = getState().vesselGroup
  const vesselGroupsIdsFiltered = selectVesselGroupsIdsFiltered(getState())
  const vessels = vesselSelectors.selectAll(getState().vessel.vessels)
  const filteredVesselFeatureIds = selectFilteredVesselFeatureIdsSet(getState())

  const features = vessels
    .filter(
      (vessel): vessel is Vessel.ActiveVesselEmittingPosition => vessel.activityType === ActivityType.POSITION_BASED
    )
    .map(vessel =>
      buildFeature(
        vessel,
        getDisplayedVesselGroups(vessel, vesselGroupsIdsDisplayed, vesselGroupsIdsPinned, vesselGroupsIdsFiltered),
        filteredVesselFeatureIds.has(vessel.vesselFeatureId)
      )
    )
    .filter((feature): feature is NonNullable<typeof feature> => feature !== undefined)

  VESSELS_VECTOR_SOURCE.clear(true)
  VESSELS_VECTOR_SOURCE.addFeatures(features)

  const isOpacityReducedEpochMilli = customDayjs().subtract(3, 'hour').valueOf()
  VESSELS_VECTOR_LAYER.updateStyleVariables({
    isOpacityReducedEpochMilli
  })
  dispatch(renderLayersDependingOnVesselLayer())
}
