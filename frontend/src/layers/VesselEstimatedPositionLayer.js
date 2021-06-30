import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { EstimatedPosition } from '../domain/entities/estimatedPosition'
import { VESSELS_UPDATE_EVENT } from './VesselsLayer'

const VesselEstimatedPositionLayer = ({ map }) => {
  const {
    vesselsLayerSource
  } = useSelector(state => state.vessel)

  const [vectorSource] = useState(new VectorSource({
    features: []
  }))
  const [layer] = useState(new Vector({
    className: Layers.VESSEL_ESTIMATION.code,
    source: vectorSource,
    zIndex: Layers.VESSEL_ESTIMATION.zIndex,
    updateWhileAnimating: true,
    updateWhileInteracting: true
  }))

  useEffect(() => {
    addLayerToMap()
  }, [map])

  useEffect(() => {
    if (vesselsLayerSource) {
      vesselsLayerSource.on(VESSELS_UPDATE_EVENT, () => {
        console.log("got vesselS")
        showVesselTrack()
      })
    }
  }, [vesselsLayerSource])

  function addLayerToMap () {
    if (map) {
      map.getLayers().push(layer)
    }
  }

  function showVesselTrack () {
    vectorSource.clear(true)

    console.log(vesselsLayerSource.getFeatures())
    const estimatedCurrentPositionsFeatures = vesselsLayerSource.getFeatures().map((feature, index) => {
      const latitude = feature.getProperties().estimatedCurrentLatitude
      const longitude = feature.getProperties().estimatedCurrentLongitude

      const estimatedCurrentPosition = new EstimatedPosition(latitude, longitude, index)

      return estimatedCurrentPosition.feature
    }).filter(vessel => vessel)

    console.log(estimatedCurrentPositionsFeatures)
    vectorSource.addFeatures(estimatedCurrentPositionsFeatures)
  }


  return null
}

export default VesselEstimatedPositionLayer
