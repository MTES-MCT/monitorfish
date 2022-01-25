import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { EstimatedPosition } from '../domain/entities/estimatedPosition'
import { getVesselLastPositionVisibilityDates, Vessel } from '../domain/entities/vessel'
import { Vector } from 'ol/layer'
import { getEstimatedPositionStyle } from './styles/vesselEstimatedPosition.style'

const VesselEstimatedPositionLayer = ({ map }) => {
  const {
    vessels,
    hideNonSelectedVessels
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

  const vectorSourceRef = useRef(new VectorSource({
    features: []
  }))

  const layerRef = useRef(new Vector({
    renderBuffer: 4,
    source: vectorSourceRef.current,
    zIndex: Layers.VESSEL_ESTIMATED_POSITION.zIndex,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: feature => getEstimatedPositionStyle(feature)
  }))

  useEffect(() => {
    addLayerToMap()
  }, [map])

  useEffect(() => {
    if (vessels && !showingVesselsEstimatedPositions) {
      vectorSourceRef.current.clear(true)
    }

    if (vessels && showingVesselsEstimatedPositions) {
      function createEstimatedTrackFeatures (vessel) {
        const {
          isAtPort,
          isFiltered,
          filterPreview
        } = vessel

        if (nonFilteredVesselsAreHidden && !isFiltered) return null
        if (previewFilteredVesselsMode && !filterPreview) return null
        if (hideVesselsAtPort && isAtPort) return null

        return EstimatedPosition.getFeatures(vessel, options)
      }

      const isLight = Vessel.iconIsLight(selectedBaseLayer)
      const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)
      const options = {
        isLight,
        vesselIsHidden,
        vesselIsOpacityReduced,
        hideNonSelectedVessels
      }

      const estimatedCurrentPositionsFeatures = vessels.reduce((features, vessel) => {
        const estimatedTrackFeatureToAdd = createEstimatedTrackFeatures(vessel)
        if (estimatedTrackFeatureToAdd) {
          features.push(estimatedTrackFeatureToAdd)
        }

        return features
      }, [])

      vectorSourceRef.current.clear(true)
      vectorSourceRef.current.addFeatures(estimatedCurrentPositionsFeatures.flat())
    }
  }, [
    vessels,
    selectedBaseLayer,
    showingVesselsEstimatedPositions,
    previewFilteredVesselsMode,
    nonFilteredVesselsAreHidden,
    hideNonSelectedVessels,
    hideVesselsAtPort,
    vesselsLastPositionVisibility
  ])

  function addLayerToMap () {
    if (map) {
      layerRef.current.name = Layers.VESSEL_ESTIMATED_POSITION.code
      map.getLayers().push(layerRef.current)
    }

    return () => {
      if (map) {
        map.removeLayer(layerRef.current)
      }
    }
  }

  return null
}

export default VesselEstimatedPositionLayer
