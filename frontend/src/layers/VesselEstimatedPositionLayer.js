import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { EstimatedPosition } from '../domain/entities/estimatedPosition'
import { VESSELS_UPDATE_EVENT } from './VesselsLayer'
import { Vessel } from '../domain/entities/vessel'
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

    if (vesselsLayerSource) {
      vesselsLayerSource.on(VESSELS_UPDATE_EVENT, ({ showingVesselsEstimatedPositions }) => {
        if (showingVesselsEstimatedPositions) {
          showVesselEstimatedTrack()
        }
      })
    }
  }, [vesselsLayerSource, selectedBaseLayer, showingVesselsEstimatedPositions, filteredVesselsFeaturesUids, nonFilteredVesselsAreHidden])

  useEffect(() => {
    vectorSource.getFeatures().forEach(feature => {
      const isShowed = !!Vessel.getVesselOpacity(vesselsLastPositionVisibility, feature.getProperties().dateTime)
      feature.set(IS_SHOWED_PROPERTY, isShowed)
    })
  }, [vesselsLastPositionVisibility])

  function addLayerToMap () {
    if (map) {
      map.getLayers().push(layer)
    }
  }

  function showVesselEstimatedTrack () {
    vectorSource.clear(true)
    const isLight = Vessel.iconIsLight(selectedBaseLayer)

    const estimatedCurrentPositionsFeatures = vesselsLayerSource.getFeatures().map((vesselFeature, index) => {
      const {
        estimatedCurrentLatitude,
        estimatedCurrentLongitude,
        latitude,
        longitude,
        dateTime
      } = vesselFeature.getProperties()

      if (nonFilteredVesselsAreHidden && Array.isArray(filteredVesselsFeaturesUids) && filteredVesselsFeaturesUids.length > 0) {
        const featureIndex = filteredVesselsFeaturesUids.indexOf(vesselFeature.ol_uid)

        if (featureIndex === NOT_FOUND) {
          return null
        }
      }

      if (estimatedCurrentLatitude && estimatedCurrentLongitude && latitude && longitude) {
        const estimatedCurrentPosition = new EstimatedPosition(
          [longitude, latitude],
          [estimatedCurrentLongitude, estimatedCurrentLatitude],
          {
            id: index,
            isLight,
            dateTime,
            vesselsLastPositionVisibility
          })

        return estimatedCurrentPosition.features
      }

      return null
    }).filter(vessel => vessel)
      .flat()

    vectorSource.addFeatures(estimatedCurrentPositionsFeatures)
  }

  return null
}

export default VesselEstimatedPositionLayer
