import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import { LayerProperties } from '../../../../domain/entities/layers/constants'
import { EstimatedPosition } from '../../../../domain/entities/estimatedPosition'
import { getVesselLastPositionVisibilityDates, Vessel, vesselIsShowed } from '../../../../domain/entities/vessel/vessel'
import { Vector } from 'ol/layer'
import { getEstimatedPositionStyle } from '../styles/vesselEstimatedPosition.style'
import { monitorfishMap } from '../../monitorfishMap'

const VesselEstimatedPositionLayer = () => {
  const {
    vessels,
    hideNonSelectedVessels,
    vesselsTracksShowed,
    selectedVesselIdentity
  } = useSelector(state => state.vessel)

  const {
    nonFilteredVesselsAreHidden
  } = useSelector(state => state.filter)

  const {
    previewFilteredVesselsMode
  } = useSelector(state => state.global)

  const {
    selectedBaseLayer,
    showingVesselsEstimatedPositions,
    vesselsLastPositionVisibility,
    hideVesselsAtPort
  } = useSelector(state => state.map)

  const vectorSourceRef = useRef(null)
  const layerRef = useRef(null)

  function getVectorSource () {
    if (vectorSourceRef.current === null) {
      vectorSourceRef.current = new VectorSource({
        features: [],
        wrapX: false
      })
    }
    return vectorSourceRef.current
  }

  function getLayer () {
    if (layerRef.current === null) {
      layerRef.current = new Vector({
        renderBuffer: 4,
        source: getVectorSource(),
        zIndex: LayerProperties.VESSEL_ESTIMATED_POSITION.zIndex,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        style: feature => getEstimatedPositionStyle(feature)
      })
    }
    return layerRef.current
  }

  useEffect(() => {
    function addLayerToMap () {
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
      function createEstimatedTrackFeatures (vessel, options) {
        const {
          isAtPort,
          isFiltered,
          filterPreview
        } = vessel

        if (nonFilteredVesselsAreHidden && !isFiltered) return null
        if (previewFilteredVesselsMode && !filterPreview) return null
        if (hideVesselsAtPort && isAtPort) return null

        options.hideNonSelectedVessels = hideNonSelectedVessels && !vesselIsShowed(vessel.vesselProperties, vesselsTracksShowed, selectedVesselIdentity)
        return EstimatedPosition.getFeatures(vessel, options)
      }

      const isLight = Vessel.iconIsLight(selectedBaseLayer)
      const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)
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
