import { VESSELS_ESTIMATED_POSITION_VECTOR_LAYER } from '@features/Vessel/layers/VesselsEstimatedPositionLayer/constants'
import { displayEstimatedPositionFeatures } from '@features/Vessel/layers/VesselsEstimatedPositionLayer/useCases/displayEstimatedPositionFeatures'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import React, { useEffect } from 'react'

import { monitorfishMap } from '../../../Map/monitorfishMap'
import { vesselSelectors } from '../../slice'

function UnmemoizedVesselEstimatedPositionLayer() {
  const dispatch = useMainAppDispatch()

  const hideNonSelectedVessels = useMainAppSelector(state => state.vessel.hideNonSelectedVessels)
  const vesselsTracksShowed = useMainAppSelector(state => state.vessel.vesselsTracksShowed)
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const vessels = useMainAppSelector(state => vesselSelectors.selectAll(state.vessel.vessels))
  const areVesselsNotInVesselGroupsHidden = useMainAppSelector(
    state => state.vesselGroup.areVesselsNotInVesselGroupsHidden
  )
  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)
  const vesselsLastPositionVisibility = useMainAppSelector(state => state.map.vesselsLastPositionVisibility)
  const selectedBaseLayer = useMainAppSelector(state => state.map.selectedBaseLayer)
  const showingVesselsEstimatedPositions = useMainAppSelector(state => state.map.showingVesselsEstimatedPositions)

  useEffect(() => {
    monitorfishMap.getLayers().push(VESSELS_ESTIMATED_POSITION_VECTOR_LAYER)

    return () => {
      monitorfishMap.removeLayer(VESSELS_ESTIMATED_POSITION_VECTOR_LAYER)
    }
  }, [])

  useEffect(() => {
    dispatch(displayEstimatedPositionFeatures())
  }, [
    dispatch,
    vessels,
    selectedBaseLayer,
    vesselsTracksShowed,
    selectedVesselIdentity,
    showingVesselsEstimatedPositions,
    previewFilteredVesselsMode,
    areVesselsNotInVesselGroupsHidden,
    hideNonSelectedVessels,
    vesselsLastPositionVisibility
  ])

  return null
}

export const VesselEstimatedPositionLayer = React.memo(UnmemoizedVesselEstimatedPositionLayer)
