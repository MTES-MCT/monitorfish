import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { EstimatedPosition } from '../domain/entities/estimatedPosition'
import { VESSELS_UPDATE_EVENT } from './VesselsLayer'
import { Vessel } from '../domain/entities/vessel'
import { Vector } from 'ol/layer'

const NOT_FOUND = -1

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
    showingVesselsEstimatedPositions
  } = useSelector(state => state.map)

  const [vectorSource] = useState(new VectorSource({
    features: []
  }))
  const [layer] = useState(new Vector({
    renderBuffer: 7,
    className: Layers.VESSEL_ESTIMATED_POSITION.code,
    source: vectorSource,
    zIndex: Layers.VESSEL_ESTIMATED_POSITION.zIndex,
    updateWhileAnimating: true,
    updateWhileInteracting: true
  }))

  useEffect(() => {
    addLayerToMap()
  }, [map])

  useEffect(() => {
    if (vesselsLayerSource && !showingVesselsEstimatedPositions) {
      vectorSource.clear(true)
    }

    if (vesselsLayerSource && showingVesselsEstimatedPositions) {
      showVesselTrack()
    }

    if (vesselsLayerSource) {
      vesselsLayerSource.on(VESSELS_UPDATE_EVENT, event => {
        if (event.showingVesselsEstimatedPositions) {
          showVesselTrack()
        }
      })
    }
  }, [vesselsLayerSource, selectedBaseLayer, showingVesselsEstimatedPositions, filteredVesselsFeaturesUids, nonFilteredVesselsAreHidden])

  function addLayerToMap () {
    if (map) {
      map.getLayers().push(layer)
    }
  }

  function showVesselTrack () {
    vectorSource.clear(true)
    const isLight = Vessel.iconIsLight(selectedBaseLayer)

    const estimatedCurrentPositionsFeatures = vesselsLayerSource.getFeatures().map((vesselFeature, index) => {
      const estimatedCurrentLatitude = vesselFeature.getProperties().estimatedCurrentLatitude
      const estimatedCurrentLongitude = vesselFeature.getProperties().estimatedCurrentLongitude
      const latitude = vesselFeature.getProperties().latitude
      const longitude = vesselFeature.getProperties().longitude

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
            isLight
          })

        return estimatedCurrentPosition.feature
      }

      return null
    }).filter(vessel => vessel)

    vectorSource.addFeatures(estimatedCurrentPositionsFeatures)
  }

  return null
}

export default VesselEstimatedPositionLayer
