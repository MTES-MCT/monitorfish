import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { VesselTrack } from '../domain/entities/vesselTrack'
import { animateTo } from '../domain/shared_slices/Map'
import { setCircleStyle } from './styles/vesselTrack.style'
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
    renderBuffer: 4,
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
    if (highlightedVesselTrackPosition) {
      updateTrackCircleStyle(previousHighlightedVesselTrackPosition, null)
      updateTrackCircleStyle(highlightedVesselTrackPosition, 7)
    } else {
      updateTrackCircleStyle(previousHighlightedVesselTrackPosition, null)
    }
  }, [highlightedVesselTrackPosition, previousHighlightedVesselTrackPosition])

  function updateTrackCircleStyle (vesselTrackCircle, radius) {
    if (vesselTrackCircle) {
      const feature = vectorSource.getFeatures()
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

    return () => {
      if (map) {
        map.removeLayer(layer)
      }
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
