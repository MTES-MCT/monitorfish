import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { EstimatedPosition } from '../../../../domain/entities/estimatedPosition'
import { LayerProperties } from '../../../../domain/entities/layers/constants'
import { getVesselLastPositionVisibilityDates, Vessel, vesselIsShowed } from '../../../../domain/entities/vessel/vessel'
import { monitorfishMap } from '../../monitorfishMap'
import { getEstimatedPositionStyle } from '../styles/vesselEstimatedPosition.style'

function VesselEstimatedPositionLayer() {
  const { hideNonSelectedVessels, selectedVesselIdentity, vessels, vesselsTracksShowed } = useSelector(
    state => state.vessel
  )

  const { nonFilteredVesselsAreHidden } = useSelector(state => state.filter)

  const { previewFilteredVesselsMode } = useSelector(state => state.mainWindow)

  const { hideVesselsAtPort, selectedBaseLayer, showingVesselsEstimatedPositions, vesselsLastPositionVisibility } =
    useSelector(state => state.map)

  const vectorSourceRef = useRef(null)
  const layerRef = useRef(null)

  function getVectorSource() {
    if (vectorSourceRef.current === null) {
      vectorSourceRef.current = new VectorSource({
        features: [],
        wrapX: false
      })
    }

    return vectorSourceRef.current
  }

  function getLayer() {
    if (layerRef.current === null) {
      layerRef.current = new Vector({
        renderBuffer: 4,
        source: getVectorSource(),
        style: feature => getEstimatedPositionStyle(feature),
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: LayerProperties.VESSEL_ESTIMATED_POSITION.zIndex
      })
    }

    return layerRef.current
  }

  useEffect(() => {
    function addLayerToMap() {
      getLayer().name = LayerProperties.VESSEL_ESTIMATED_POSITION.code
      monitorfishMap.getLayers().push(getLayer())
    }

    addLayerToMap()

    return () => {
      monitorfishMap.removeLayer(getLayer())
    }
  }, [])

  useEffect(() => {
    if (vessels && !showingVesselsEstimatedPositions) {
      getVectorSource().clear(true)
    }

    if (vessels && showingVesselsEstimatedPositions) {
      function createEstimatedTrackFeatures(vessel, options) {
        const { filterPreview, isAtPort, isFiltered } = vessel

        if (nonFilteredVesselsAreHidden && !isFiltered) {
          return null
        }
        if (previewFilteredVesselsMode && !filterPreview) {
          return null
        }
        if (hideVesselsAtPort && isAtPort) {
          return null
        }

        options.hideNonSelectedVessels =
          hideNonSelectedVessels &&
          !vesselIsShowed(vessel.vesselProperties, vesselsTracksShowed, selectedVesselIdentity)

        return EstimatedPosition.getFeatures(vessel, options)
      }

      const isLight = Vessel.iconIsLight(selectedBaseLayer)
      const { vesselIsHidden, vesselIsOpacityReduced } =
        getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)
      const options = {
        isLight,
        vesselIsHidden,
        vesselIsOpacityReduced
      }

      const estimatedCurrentPositionsFeatures = vessels.reduce((features, vessel) => {
        const estimatedTrackFeatureToAdd = createEstimatedTrackFeatures(vessel, options)
        if (estimatedTrackFeatureToAdd) {
          features.push(estimatedTrackFeatureToAdd)
        }

        return features
      }, [])

      getVectorSource().clear(true)
      getVectorSource().addFeatures(estimatedCurrentPositionsFeatures.flat())
    }
  }, [
    vessels,
    selectedBaseLayer,
    vesselsTracksShowed,
    selectedVesselIdentity,
    showingVesselsEstimatedPositions,
    previewFilteredVesselsMode,
    nonFilteredVesselsAreHidden,
    hideNonSelectedVessels,
    hideVesselsAtPort,
    vesselsLastPositionVisibility
  ])

  return null
}

export default React.memo(VesselEstimatedPositionLayer)
