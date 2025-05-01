import { MonitorFishMap } from '@features/Map/Map.types'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import {
  filterNonSelectedVessels,
  getVesselFeatures,
  isVesselGroupColorDefined
} from '@features/Vessel/layers/utils/utils'
import { VESSELS_ESTIMATED_POSITION_VECTOR_SOURCE } from '@features/Vessel/layers/VesselsEstimatedPositionLayer/constants'
import { getEstimatedPositionFeatures } from '@features/Vessel/layers/VesselsEstimatedPositionLayer/utils'
import { VESSELS_VECTOR_LAYER } from '@features/Vessel/layers/VesselsLayer/constants'
import { vesselSelectors } from '@features/Vessel/slice'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { Vessel } from '@features/Vessel/Vessel.types'

import type { MainAppThunk } from '@store'

export const renderVesselEstimatedPositionFeatures = (): MainAppThunk => async (_, getState) => {
  const isLayerFound = monitorfishMap
    .getLayers()
    .getArray()
    // @ts-ignore
    ?.find(layer => layer.name === MonitorFishMap.MonitorFishLayer.VESSEL_ESTIMATED_POSITION)
  if (!isLayerFound) {
    return
  }

  const { selectedVesselIdentity, vesselsTracksShowed } = getState().vessel
  const { selectedBaseLayer, showingVesselsEstimatedPositions } = getState().map
  const { areVesselGroupsDisplayed } = getState().displayedComponent

  const isLight = VesselFeature.iconIsLight(selectedBaseLayer)

  const numberOfVessels = vesselSelectors.selectTotal(getState().vessel.vessels)
  if (!numberOfVessels) {
    return
  }

  const vesselsFeatures = getVesselFeatures()
  /* eslint-disable no-underscore-dangle */
  const {
    areVesselsNotInVesselGroupsHidden,
    hideNonSelectedVessels,
    vesselIsHiddenTimeThreshold,
    vesselIsOpacityReducedTimeThreshold
    // @ts-ignore there is no other way to access the style variables
  } = VESSELS_VECTOR_LAYER.styleVariables_
  /* eslint-enable no-underscore-dangle */

  const features = vesselsFeatures
    .filter(
      feature =>
        showingVesselsEstimatedPositions &&
        feature.get('isFiltered') &&
        (areVesselsNotInVesselGroupsHidden && areVesselGroupsDisplayed ? isVesselGroupColorDefined(feature) : true) &&
        VesselFeature.getVesselOpacityWithTimestamp(
          feature.get('dateTime'),
          vesselIsHiddenTimeThreshold,
          vesselIsOpacityReducedTimeThreshold
        ) !== 0
    )
    .filter(filterNonSelectedVessels(vesselsTracksShowed, !!hideNonSelectedVessels, selectedVesselIdentity))
    .map(feature => {
      const properties = feature.getProperties()

      return getEstimatedPositionFeatures(properties as Vessel.VesselLastPosition, {
        isLight,
        vesselIsHiddenTimeThreshold,
        vesselIsOpacityReducedTimeThreshold
      })
    })
    .flat()
    .filter(feature => feature !== undefined)

  VESSELS_ESTIMATED_POSITION_VECTOR_SOURCE.clear(true)
  VESSELS_ESTIMATED_POSITION_VECTOR_SOURCE.addFeatures(features)
}
