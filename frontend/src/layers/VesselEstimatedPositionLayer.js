import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { EstimatedPosition } from '../domain/entities/estimatedPosition'
import { VESSELS_UPDATE_EVENT } from './VesselsLayer'
import { getVesselLastPositionVisibilityDates, Vessel } from '../domain/entities/vessel'
import { Vector } from 'ol/layer'
import { getEstimatedPositionStyle } from './styles/vesselEstimatedPosition.style'

const NOT_FOUND = -1
export const IS_SHOWED_PROPERTY = 'isShowed'

const VesselEstimatedPositionLayer = ({ map }) => {
  const {
    vesselsLayerSource,
    filteredVesselsFeaturesUids
  } = useSelector(state => state.vessel)

  const {
    nonFilteredVesselsAreHidden
  } = useSelector(state => state.filter)

  const {
    selectedBaseLayer,
    showingVesselsEstimatedPositions,
    vesselsLastPositionVisibility
  } = useSelector(state => state.map)

  const [vectorSource] = useState(new VectorSource({
    features: []
  }))

  const [layer] = useState(new Vector({
    renderBuffer: 4,
    className: Layers.VESSEL_ESTIMATED_POSITION.code,
    source: vectorSource,
    zIndex: Layers.VESSEL_ESTIMATED_POSITION.zIndex,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: feature => getEstimatedPositionStyle(feature)
  }))

  const vesselUpdateEventKey = useRef()

  useEffect(() => {
    addLayerToMap()
  }, [map])

  useEffect(() => {
    if (vesselsLayerSource && !showingVesselsEstimatedPositions) {
      vectorSource.clear(true)
    }

    if (vesselsLayerSource && showingVesselsEstimatedPositions) {
      showVesselEstimatedTrack()
    }

    if (vesselsLayerSource && !vesselUpdateEventKey.current) {
      vesselUpdateEventKey.current = vesselsLayerSource.on(VESSELS_UPDATE_EVENT, ({ showingVesselsEstimatedPositions }) => {
        if (showingVesselsEstimatedPositions) {
          showVesselEstimatedTrack()
        }
      })
    }
  }, [vesselsLayerSource, selectedBaseLayer, showingVesselsEstimatedPositions, filteredVesselsFeaturesUids, nonFilteredVesselsAreHidden])

  useEffect(() => {
    const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)

    vectorSource.forEachFeature(feature => {
      const isShowed = !!Vessel.getVesselOpacity(feature.estimatedPosition.dateTime, vesselIsHidden, vesselIsOpacityReduced)
      feature.set(EstimatedPosition.isShowedProperty, isShowed)
    })
  }, [vesselsLastPositionVisibility])

  function addLayerToMap () {
    if (map) {
      map.getLayers().push(layer)
    }

    return () => {
      if (map) {
        map.removeLayer(layer)
      }
    }
  }

  // TODO Migrate hard calculus (GIS transform ?) to a worker
  function showVesselEstimatedTrack () {
    vectorSource.clear(true)
    const isLight = Vessel.iconIsLight(selectedBaseLayer)
    const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)

    const estimatedCurrentPositionsFeatures = []
    vesselsLayerSource.forEachFeature(vesselFeature => {
      const {
        estimatedCurrentLatitude,
        estimatedCurrentLongitude,
        latitude,
        longitude,
        dateTime
      } = vesselFeature.vessel

      if (nonFilteredVesselsAreHidden &&
        Array.isArray(filteredVesselsFeaturesUids) &&
        filteredVesselsFeaturesUids.length > 0) {
        const featureIndex = filteredVesselsFeaturesUids.indexOf(vesselFeature.ol_uid)

        if (featureIndex === NOT_FOUND) {
          return null
        }
      }

      if (estimatedCurrentLatitude && estimatedCurrentLongitude && latitude && longitude) {
        estimatedCurrentPositionsFeatures.push(EstimatedPosition.getFeatures(
          [longitude, latitude],
          [estimatedCurrentLongitude, estimatedCurrentLatitude],
          {
            id: vesselFeature.getId(),
            isLight,
            dateTime,
            vesselsLastPositionVisibility,
            vesselIsHidden,
            vesselIsOpacityReduced
          }))
      }
    })

    vectorSource.addFeatures(estimatedCurrentPositionsFeatures.flat())
  }

  return null
}

export default VesselEstimatedPositionLayer
