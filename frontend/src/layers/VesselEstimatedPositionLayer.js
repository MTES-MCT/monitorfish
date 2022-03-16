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
        zIndex: Layers.VESSEL_ESTIMATED_POSITION.zIndex,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        style: feature => getEstimatedPositionStyle(feature)
      })
    }
    return layerRef.current
  }

  useEffect(() => {
    function addLayerToMap () {
      if (map) {
        getLayer().name = Layers.VESSEL_ESTIMATED_POSITION.code
        map.getLayers().push(getLayer())
      }

      return () => {
        if (map) {
          map.removeLayer(getLayer())
        }
      }
    }

    addLayerToMap()
  }, [map])

  useEffect(() => {
    if (vessels && !showingVesselsEstimatedPositions) {
      getVectorSource().clear(true)
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

      getVectorSource().clear(true)
      getVectorSource().addFeatures(estimatedCurrentPositionsFeatures.flat())
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

  return null
}

export default VesselEstimatedPositionLayer
