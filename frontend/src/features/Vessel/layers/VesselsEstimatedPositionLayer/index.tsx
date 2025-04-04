import {
  filterNonSelectedVessels,
  getVesselFeaturesInExtent,
  isVesselGroupColorDefined
} from '@features/Vessel/layers/utils/utils'
import {
  VESSELS_ESTIMATED_POSITION_VECTOR_LAYER,
  VESSELS_ESTIMATED_POSITION_VECTOR_SOURCE
} from '@features/Vessel/layers/VesselsEstimatedPositionLayer/constants'
import { getEstimatedPositionFeatures } from '@features/Vessel/layers/VesselsEstimatedPositionLayer/utils'
import { getVesselLastPositionVisibilityDates, VesselFeature } from '@features/Vessel/types/vessel'
import { Vessel } from '@features/Vessel/Vessel.types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { throttle } from 'lodash-es'
import React, { useEffect } from 'react'

import { monitorfishMap } from '../../../Map/monitorfishMap'
import { vesselSelectors } from '../../slice'

function UnmemoizedVesselEstimatedPositionLayer({ mapMovingAndZoomEvent }) {
  const hideNonSelectedVessels = useMainAppSelector(state => state.vessel.hideNonSelectedVessels)
  const vesselsTracksShowed = useMainAppSelector(state => state.vessel.vesselsTracksShowed)
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const areVesselsNotInVesselGroupsHidden = useMainAppSelector(
    state => state.vesselGroup.areVesselsNotInVesselGroupsHidden
  )
  const numberOfVessels = useMainAppSelector(state => vesselSelectors.selectTotal(state.vessel.vessels))
  const vesselsLastPositionVisibility = useMainAppSelector(state => state.map.vesselsLastPositionVisibility)
  const selectedBaseLayer = useMainAppSelector(state => state.map.selectedBaseLayer)
  const showingVesselsEstimatedPositions = useMainAppSelector(state => state.map.showingVesselsEstimatedPositions)

  const isLight = VesselFeature.iconIsLight(selectedBaseLayer)
  const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)

  useEffect(() => {
    monitorfishMap.getLayers().push(VESSELS_ESTIMATED_POSITION_VECTOR_LAYER)

    return () => {
      monitorfishMap.removeLayer(VESSELS_ESTIMATED_POSITION_VECTOR_LAYER)
    }
  }, [])

  useEffect(() => {
    if (numberOfVessels > 0) {
      const updateFeatures = throttle(() => {
        const vesselsFeaturesInExtent = getVesselFeaturesInExtent()

        const features = vesselsFeaturesInExtent
          .filter(
            feature =>
              showingVesselsEstimatedPositions &&
              feature.get('isFiltered') &&
              (areVesselsNotInVesselGroupsHidden ? isVesselGroupColorDefined(feature) : true) &&
              VesselFeature.getVesselOpacity(feature.get('dateTime'), vesselIsHidden, vesselIsOpacityReduced) !== 0
          )
          .filter(filterNonSelectedVessels(vesselsTracksShowed, hideNonSelectedVessels, selectedVesselIdentity))
          .map(feature => {
            const properties = feature.getProperties()

            return getEstimatedPositionFeatures(properties as Vessel.VesselLastPosition, {
              isLight,
              vesselIsHidden,
              vesselIsOpacityReduced
            })
          })
          .flat()
          .filter(feature => feature !== undefined)

        VESSELS_ESTIMATED_POSITION_VECTOR_SOURCE.clear(true)
        VESSELS_ESTIMATED_POSITION_VECTOR_SOURCE.addFeatures(features)
      }, 250)

      updateFeatures()

      return () => updateFeatures.cancel()
    }

    return undefined

    // vesselsLastPositionVisibility is enough for vesselIsHidden and vesselIsOpacityReduced variables
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    numberOfVessels,
    selectedVesselIdentity,
    isLight,
    vesselsTracksShowed,
    hideNonSelectedVessels,
    mapMovingAndZoomEvent,
    vesselsLastPositionVisibility,
    areVesselsNotInVesselGroupsHidden,
    showingVesselsEstimatedPositions
  ])

  return null
}

export const VesselEstimatedPositionLayer = React.memo(UnmemoizedVesselEstimatedPositionLayer)
