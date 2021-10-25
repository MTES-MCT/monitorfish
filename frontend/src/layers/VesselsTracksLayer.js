import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { VesselTrack } from '../domain/entities/vesselTrack'
import { animateTo } from '../domain/shared_slices/Map'
import { getCircleStyle } from './styles/vesselTrack.style'
import { usePrevious } from '../hooks/usePrevious'
import { updateVesselTrackAsHidden, updateVesselTrackAsShowed } from '../domain/shared_slices/Vessel'
import { getVesselFeatureIdFromVessel } from '../domain/entities/vessel'
import CloseVesselTrackOverlay from '../features/map/overlays/CloseVesselTrackOverlay'

const VesselsTracksLayer = ({ map }) => {
  const {
    selectedVessel,
    highlightedVesselTrackPosition,
    vesselsTracksShowed
  } = useSelector(state => state.vessel)
  const previousHighlightedVesselTrackPosition = usePrevious(highlightedVesselTrackPosition)
  const previousSelectedVessel = usePrevious(selectedVessel)

  const {
    updatedFromCron
  } = useSelector(state => state.map)

  const dispatch = useDispatch()

  const [vectorSource] = useState(new VectorSource({
    features: []
  }))
  const [layer] = useState(new Vector({
    renderBuffer: 4,
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
    hidePreviouslySelectedVessel()
  }, [previousSelectedVessel, selectedVessel])

  useEffect(() => {
    if (!Object.keys(vesselsTracksShowed)?.length) {
      return
    }

    const vesselTracks = Object.keys(vesselsTracksShowed)
      .map(identity => vesselsTracksShowed[identity])

    showVesselsTracks(vesselTracks)
    hideVesselsTracks(vesselTracks)
  }, [vesselsTracksShowed])

  useEffect(() => {
    if (highlightedVesselTrackPosition) {
      updateTrackCircleStyle(previousHighlightedVesselTrackPosition, null)
      updateTrackCircleStyle(highlightedVesselTrackPosition, 7)
    } else {
      updateTrackCircleStyle(previousHighlightedVesselTrackPosition, null)
    }
  }, [highlightedVesselTrackPosition, previousHighlightedVesselTrackPosition])

  function removeVesselTrackFeatures (identity) {
    vectorSource.getFeatures()
      .filter(feature => feature.getId().includes(identity))
      .map(feature => vectorSource.removeFeature(feature))
  }

  function hidePreviouslySelectedVessel () {
    if (previousSelectedVessel && !selectedVessel) {
      const vesselIdentity = getVesselFeatureIdFromVessel(previousSelectedVessel)
      removeVesselTrackFeatures(vesselIdentity)

      dispatch(updateVesselTrackAsHidden(vesselIdentity))
    }
  }

  function showVesselsTracks (vesselTracks) {
    vesselTracks
      .filter(positionsAndTrackDepth => positionsAndTrackDepth.toShow)
      .forEach(vesselTrack => {
        removeVesselTrackFeatures(vesselTrack.identity)

        const vesselTrackFeatures = new VesselTrack(vesselTrack.positions, vesselTrack.identity)
        vectorSource.addFeatures(vesselTrackFeatures.features)

        dispatch(updateVesselTrackAsShowed(vesselTrack.identity))
      })
  }

  function hideVesselsTracks (vesselTracks) {
    vesselTracks
      .filter(positionsAndTrackDepth => positionsAndTrackDepth.toHide)
      .forEach(vesselTrack => {
        removeVesselTrackFeatures(vesselTrack.identity)

        dispatch(updateVesselTrackAsHidden(vesselTrack.identity))
      })
  }

  function updateTrackCircleStyle (vesselTrackCircle, radius) {
    if (vesselTrackCircle) {
      const feature = vectorSource.getFeatures()
        .find(feature => feature.dateTime === vesselTrackCircle.dateTime)

      if (feature) {
        const featureColor = feature?.getStyle()[0].getImage()?.getFill()?.getColor()

        feature.setStyle(getCircleStyle(featureColor, radius))
      }
    }
  }

  function addLayerToMap () {
    if (map) {
      layer.name = Layers.VESSEL_TRACK.code
      map.getLayers().push(layer)
    }

    return () => {
      if (map) {
        map.removeLayer(layer)
      }
    }
  }

  function showVesselTrack () {
    if (map && selectedVessel?.positions?.length) {
      const vesselTrack = new VesselTrack(selectedVessel.positions, getVesselFeatureIdFromVessel(selectedVessel))

      vectorSource.addFeatures(vesselTrack.features)
      if (!updatedFromCron && vesselTrack.lastPositionCoordinates) {
        dispatch(animateTo(vesselTrack.lastPositionCoordinates))
      }
    }
  }

  return (
    <>
      {
        Object.keys(vesselsTracksShowed)
          .map(identity => vesselsTracksShowed[identity])
          .filter(vesselTrack => !vesselTrack.toShow && !vesselTrack.toHide)
          .map(vesselTrack => {
            return <CloseVesselTrackOverlay
              key={vesselTrack.identity}
              identity={vesselTrack.identity}
              map={map}
              coordinates={vesselTrack.coordinates}
            />
          })
      }
    </>
  )
}

export default VesselsTracksLayer
