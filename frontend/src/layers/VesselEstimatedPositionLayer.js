import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { EstimatedPosition } from '../domain/entities/estimatedPosition'
import { getVesselLastPositionVisibilityDates, Vessel } from '../domain/entities/vessel'
import { Vector } from 'ol/layer'
import { getEstimatedPositionStyle } from './styles/vesselEstimatedPosition.style'

export const OPACITY = 'opacity'

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
      showVesselEstimatedTrack()
    }
  }, [
    vessels,
    selectedBaseLayer,
    showingVesselsEstimatedPositions,
    previewFilteredVesselsMode,
    nonFilteredVesselsAreHidden,
    hideNonSelectedVessels,
    hideVesselsAtPort
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

  function showVesselEstimatedTrack () {
    vectorSourceRef.current.clear(true)
    const isLight = Vessel.iconIsLight(selectedBaseLayer)
    const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)

    function createEstimatedTrack (vesselFeature) {
      const {
        estimatedCurrentLatitude,
        estimatedCurrentLongitude,
        latitude,
        longitude,
        dateTime,
        isAtPort,
        isFiltered,
        filterPreview,
        vesselId
      } = vesselFeature

      if (nonFilteredVesselsAreHidden && !isFiltered) {
        return
      }

      if (previewFilteredVesselsMode && !filterPreview) {
        return
      }

      if (hideVesselsAtPort && isAtPort) {
        return
      }

      if (estimatedCurrentLatitude && estimatedCurrentLongitude && latitude && longitude) {
        return EstimatedPosition.getFeatures(
          [longitude, latitude],
          [estimatedCurrentLongitude, estimatedCurrentLatitude],
          {
            id: vesselId.replace(`${Layers.VESSELS.code}:`, ''),
            isLight,
            dateTime,
            vesselIsHidden,
            vesselIsOpacityReduced,
            hideNonSelectedVessels
          })
      }
    }
    const estimatedCurrentPositionsFeatures = vessels.reduce((features, vessel) => {
      const newFeature = createEstimatedTrack(vessel)
      newFeature && features.push(newFeature)
      return features
    }, [])

    vectorSourceRef.current.addFeatures(estimatedCurrentPositionsFeatures.flat())
  }

  return null
}

export default VesselEstimatedPositionLayer
