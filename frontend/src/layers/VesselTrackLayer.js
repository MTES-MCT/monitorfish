import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { VesselTrack } from '../domain/entities/vesselTrack'
import { animateTo } from '../domain/reducers/Map'
import { setCircleStyle } from './styles/featuresStyles'
import { usePrevious } from '../hooks/usePrevious'

const VesselTrackLayer = ({ map }) => {
  const {
    selectedVessel,
    highlightedVesselTrackPosition
  } = useSelector(state => state.vessel)
  const previousHighlightedVesselTrackPosition = usePrevious(highlightedVesselTrackPosition)

  const {
    updatedFromCron
  } = useSelector(state => state.map)

  const dispatch = useDispatch()

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

  useEffect(() => {
    updateTrackCircleStyle(highlightedVesselTrackPosition, 7)
  }, [highlightedVesselTrackPosition])

  useEffect(() => {
    updateTrackCircleStyle(previousHighlightedVesselTrackPosition, null)
  }, [previousHighlightedVesselTrackPosition])

  function updateTrackCircleStyle (vesselTrackCircle, radius) {
    if (vesselTrackCircle) {
      const feature = vectorSource.getFeatures()
        .filter(feature => feature && feature.getId().toString().includes(Layers.VESSEL_TRACK.code))
        .find(feature => feature.getProperties().dateTime === vesselTrackCircle.dateTime)

      if (feature) {
        const featureColor = feature.getStyle().getImage().getFill().getColor()

        setCircleStyle(featureColor, feature, radius)
      }
    }
  }

  function addLayerToMap () {
    if (map) {
      map.getLayers().push(layer)
    }
  }

  function showVesselTrack () {
    vectorSource.clear(true)

    if (map && selectedVessel && selectedVessel.positions && selectedVessel.positions.length) {
      const vesselTrack = new VesselTrack(selectedVessel)

      vectorSource.addFeatures(vesselTrack.features)
      if (!updatedFromCron && vesselTrack.lastPositionCoordinates) {
        dispatch(animateTo(vesselTrack.lastPositionCoordinates))
      }
    }
  }

  return null
}

export default VesselTrackLayer
