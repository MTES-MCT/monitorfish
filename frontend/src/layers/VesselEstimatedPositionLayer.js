import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { EstimatedPosition } from '../domain/entities/estimatedPosition'
import { VESSELS_UPDATE_EVENT } from './VesselsLayer'
import { Vessel } from '../domain/entities/vessel'
import VectorImageLayer from 'ol/layer/VectorImage'

const VesselEstimatedPositionLayer = ({ map }) => {
  const {
    vesselsLayerSource
  } = useSelector(state => state.vessel)

  const {
    selectedBaseLayer,
    showingVesselsEstimatedPositions
  } = useSelector(state => state.map)

  const [vectorSource] = useState(new VectorSource({
    features: []
  }))
  const [layer] = useState(new VectorImageLayer({
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
    if(vesselsLayerSource && !showingVesselsEstimatedPositions) {
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
  }, [vesselsLayerSource, selectedBaseLayer, showingVesselsEstimatedPositions])

  function addLayerToMap () {
    if (map) {
      map.getLayers().push(layer)
    }
  }

  function showVesselTrack () {
    vectorSource.clear(true)
    const isLight = Vessel.iconIsLight(selectedBaseLayer)

    const estimatedCurrentPositionsFeatures = vesselsLayerSource.getFeatures().map((feature, index) => {
      const estimatedCurrentLatitude = feature.getProperties().estimatedCurrentLatitude
      const estimatedCurrentLongitude = feature.getProperties().estimatedCurrentLongitude
      const latitude = feature.getProperties().latitude
      const longitude = feature.getProperties().longitude

      if(estimatedCurrentLatitude && estimatedCurrentLongitude && latitude && longitude) {
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
