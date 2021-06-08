import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { VesselTrack } from '../domain/entities/vesselTrack'

const VesselTrackLayer = ({ map }) => {
  const {
    selectedVessel
  } = useSelector(state => state.vessel)

  const [vectorSource] = useState(new VectorSource({
    features: []
  }))
  const [layer] = useState(new Vector({
    className: Layers.VESSEL_TRACK.code,
    source: vectorSource,
    zIndex: Layers.VESSEL_TRACK.zIndex,
    updateWhileAnimating: true,
    updateWhileInteracting: true
  }))

  useEffect(() => {
    addLayerToMap()
  }, [map])

  useEffect(() => {
    showVesselTrack()
  }, [selectedVessel])

  function addLayerToMap () {
    if (map) {
      map.getLayers().push(layer)
    }
  }

  function showVesselTrack () {
    vectorSource.clear(true)

    if (map && selectedVessel && selectedVessel.positions && selectedVessel.positions.length) {
      const vesselTrackFeatures = new VesselTrack(selectedVessel).features

      vectorSource.addFeatures(vesselTrackFeatures)
    }
  }

  return null
}

export default VesselTrackLayer
