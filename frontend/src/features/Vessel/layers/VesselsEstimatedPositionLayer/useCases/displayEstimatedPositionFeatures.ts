import { VESSELS_ESTIMATED_POSITION_VECTOR_SOURCE } from '@features/Vessel/layers/VesselsEstimatedPositionLayer/constants'
import { getEstimatedPositionFeatures } from '@features/Vessel/layers/VesselsEstimatedPositionLayer/utils'
import { vesselSelectors } from '@features/Vessel/slice'
import { getVesselLastPositionVisibilityDates, VesselFeature, vesselIsShowed } from '@features/Vessel/types/vessel'
import { getVesselCompositeIdentifier } from '@features/Vessel/utils'

import type { MainAppThunk } from '@store'

/**
 * Updates the vessel estimated position features in the map layer.
 */
export const displayEstimatedPositionFeatures = (): MainAppThunk => (_, getState) => {
  const {
    filter: { nonFilteredVesselsAreHidden },
    global: { previewFilteredVesselsMode },
    map: { hideVesselsAtPort, selectedBaseLayer, showingVesselsEstimatedPositions, vesselsLastPositionVisibility },
    vessel: { hideNonSelectedVessels, selectedVesselIdentity, vessels: vesselsSelector, vesselsTracksShowed }
  } = getState()
  const vessels = vesselSelectors.selectAll(vesselsSelector)

  if (!vessels || !showingVesselsEstimatedPositions) {
    VESSELS_ESTIMATED_POSITION_VECTOR_SOURCE.clear(true)

    return
  }
  const isLight = VesselFeature.iconIsLight(selectedBaseLayer)

  const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)

  const estimatedCurrentPositionsFeatures = vessels
    .map(vessel =>
      createEstimatedTrackFeatures(vessel, {
        hideNonSelectedVessels,
        hideVesselsAtPort,
        isLight,
        nonFilteredVesselsAreHidden,
        previewFilteredVesselsMode,
        selectedVesselIdentity,
        vesselIsHidden,
        vesselIsOpacityReduced,
        vesselsTracksShowed
      })
    )
    .flat()
    .filter(feature => feature !== undefined)

  VESSELS_ESTIMATED_POSITION_VECTOR_SOURCE.clear(true)
  VESSELS_ESTIMATED_POSITION_VECTOR_SOURCE.addFeatures(estimatedCurrentPositionsFeatures)
}

/**
 * Creates estimated track features for a vessel based on visibility rules.
 */
function createEstimatedTrackFeatures(vessel, options) {
  const { filterPreview, isAtPort, isFiltered } = vessel
  const {
    hideNonSelectedVessels,
    hideVesselsAtPort,
    nonFilteredVesselsAreHidden,
    previewFilteredVesselsMode,
    selectedVesselIdentity,
    vesselsTracksShowed
  } = options

  if (nonFilteredVesselsAreHidden && !isFiltered) {
    return undefined
  }
  if (previewFilteredVesselsMode && !filterPreview) {
    return undefined
  }
  if (hideVesselsAtPort && isAtPort) {
    return undefined
  }

  const vesselTrackShowed = vesselsTracksShowed[getVesselCompositeIdentifier(vessel)]

  return getEstimatedPositionFeatures(vessel, {
    ...options,
    isHidden: hideNonSelectedVessels && !vesselIsShowed(vessel, vesselTrackShowed, selectedVesselIdentity)
  })
}
