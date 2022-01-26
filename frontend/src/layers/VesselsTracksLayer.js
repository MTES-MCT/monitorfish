import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { extend } from 'ol/extent'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'

import { usePrevious } from '../hooks/usePrevious'
import Layers from '../domain/entities/layers'
import { VesselTrack } from '../domain/entities/vesselTrack'
import { animateToCoordinates } from '../domain/shared_slices/Map'
import {
  setVesselTrackExtent,
  updateVesselTrackAsHidden,
  updateVesselTrackAsShowed
} from '../domain/shared_slices/Vessel'
import {
  endRedrawFishingActivitiesOnMap,
  updateFishingActivitiesOnMapCoordinates
} from '../domain/shared_slices/FishingActivities'
import { getVesselFeatureIdFromVessel } from '../domain/entities/vessel'
import { getFishingActivityFeatureOnTrackLine } from '../domain/entities/fishingActivities'
import CloseVesselTrackOverlay from '../features/map/overlays/CloseVesselTrackOverlay'
import FishingActivityOverlay from '../features/map/overlays/FishingActivityOverlay'

import { getCircleStyle } from './styles/vesselTrack.style'

const VesselsTracksLayer = ({ map }) => {
  const {
    selectedVessel,
    selectedVesselPositions,
    highlightedVesselTrackPosition,
    vesselsTracksShowed
  } = useSelector(state => state.vessel)
  const {
    /** @type {FishingActivityShowedOnMap[]} fishingActivitiesShowedOnMap */
    fishingActivitiesShowedOnMap,
    redrawFishingActivitiesOnMap
  } = useSelector(state => state.fishingActivities)
  const previousHighlightedVesselTrackPosition = usePrevious(highlightedVesselTrackPosition)
  /** @type {FishingActivityShowedOnMap[]} previousFishingActivitiesShowedOnMap */
  const previousFishingActivitiesShowedOnMap = usePrevious(fishingActivitiesShowedOnMap)
  const previousSelectedVessel = usePrevious(selectedVessel)

  const {
    doNotAnimate
  } = useSelector(state => state.map)

  const dispatch = useDispatch()

  const vectorSourceRef = useRef(new VectorSource({
    features: []
  }))
  const layerRef = useRef(new Vector({
    renderBuffer: 4,
    source: vectorSourceRef.current,
    zIndex: Layers.VESSEL_TRACK.zIndex,
    updateWhileAnimating: true,
    updateWhileInteracting: true
  }))

  useEffect(() => {
    if (map) {
      layerRef.current.name = Layers.VESSEL_TRACK.code
      map.getLayers().push(layerRef.current)
    }

    return () => {
      if (map) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [map])

  useEffect(() => {
    showSelectedVesselTrack()
  }, [selectedVessel, selectedVesselPositions])

  useEffect(() => {
    hidePreviouslySelectedVessel()
  }, [previousSelectedVessel, selectedVessel])

  useEffect(() => {
    if (!Object.keys(vesselsTracksShowed)?.length || !vectorSourceRef.current) {
      return
    }

    const vesselTracks = Object.keys(vesselsTracksShowed)
      .map(identity => vesselsTracksShowed[identity])

    showVesselsTracks(vesselTracks)
    hideVesselsTracks(vesselTracks)
  }, [vesselsTracksShowed, vectorSourceRef.current])

  useEffect(() => {
    if (highlightedVesselTrackPosition) {
      updateTrackCircleStyle(previousHighlightedVesselTrackPosition, null)
      updateTrackCircleStyle(highlightedVesselTrackPosition, 7)
    } else {
      updateTrackCircleStyle(previousHighlightedVesselTrackPosition, null)
    }
  }, [highlightedVesselTrackPosition, previousHighlightedVesselTrackPosition])

  useEffect(() => {
    showFishingActivities()
  }, [fishingActivitiesShowedOnMap, selectedVesselPositions, redrawFishingActivitiesOnMap])

  function showFishingActivities () {
    if (!fishingActivitiesShowedOnMap?.length) {
      removeFishingActivitiesFeatures()
      return
    }

    const noAddedOrRemovedFishingActivities = fishingActivitiesShowedOnMap?.length === previousFishingActivitiesShowedOnMap?.length
    if (noAddedOrRemovedFishingActivities && !redrawFishingActivitiesOnMap) {
      return
    }
    dispatch(endRedrawFishingActivitiesOnMap())

    if (!selectedVesselPositions?.length) {
      return
    }

    const lines = getVesselTrackLines()
    const coordinatesFeaturesAndIds = fishingActivitiesShowedOnMap.map(fishingActivity => {
      const fishingActivityDateTimestamp = new Date(fishingActivity.date).getTime()

      const lineOfFishingActivity = lines
        .find(line => fishingActivityIsWithinTrackLineDates(fishingActivityDateTimestamp, line))

      if (lineOfFishingActivity) {
        return getFishingActivityFeatureOnTrackLine(fishingActivity, lineOfFishingActivity, fishingActivityDateTimestamp)
      }
      return null
    }).filter(coordinatesFeaturesAndIds => coordinatesFeaturesAndIds)

    removeFishingActivitiesFeatures()
    vectorSourceRef.current.addFeatures(coordinatesFeaturesAndIds.map(coordinatesFeatureAndId => coordinatesFeatureAndId.feature))
    vectorSourceRef.current.changed()
    dispatch(updateFishingActivitiesOnMapCoordinates(coordinatesFeaturesAndIds))
  }

  function fishingActivityIsWithinTrackLineDates (fishingActivityDateTimestamp, line) {
    return fishingActivityDateTimestamp > new Date(line.firstPositionDate).getTime() &&
      fishingActivityDateTimestamp < new Date(line.secondPositionDate).getTime()
  }

  function removeFishingActivitiesFeatures () {
    vectorSourceRef.current
      .getFeatures()
      .filter(feature =>
        feature?.getId()?.toString()?.includes(Layers.VESSEL_TRACK.code) &&
        feature?.getId()?.toString()?.includes('ers'))
      .forEach(feature => vectorSourceRef.current.removeFeature(feature))
  }

  function getVesselTrackLines () {
    return vectorSourceRef.current.getFeatures()
      .filter(feature =>
        feature?.getId()?.toString()?.includes(Layers.VESSEL_TRACK.code) &&
        feature?.getId()?.toString()?.includes('line'))
  }

  function removeVesselTrackFeatures (identity) {
    vectorSourceRef.current.getFeatures()
      .filter(feature => feature?.getId()?.toString()?.includes(identity))
      .map(feature => vectorSourceRef.current.removeFeature(feature))
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
        vectorSourceRef.current.addFeatures(vesselTrackFeatures.features)

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
      const feature = vectorSourceRef.current.getFeatures()
        .find(feature => feature.dateTime === vesselTrackCircle.dateTime)

      if (feature) {
        const featureColor = feature?.getStyle()[0].getImage()?.getFill()?.getColor()

        feature.setStyle(getCircleStyle(featureColor, radius))
      }
    }
  }

  function showSelectedVesselTrack () {
    if (map && selectedVessel && selectedVesselPositions?.length) {
      const identity = getVesselFeatureIdFromVessel(selectedVessel)
      removeVesselTrackFeatures(identity)

      const vesselTrack = new VesselTrack(selectedVesselPositions, identity)

      if (vesselTrack.features?.length) {
        vectorSourceRef.current.addFeatures(vesselTrack.features)
        const vesselTrackExtent = getVesselTrackExtent(vesselTrack, identity)

        dispatch(setVesselTrackExtent(vesselTrackExtent))
      }

      if (!doNotAnimate && vesselTrack.lastPositionCoordinates) {
        dispatch(animateToCoordinates(vesselTrack.lastPositionCoordinates))
      }
    }
  }

  function getVesselTrackExtent (vesselTrack, identity) {
    let vesselTrackExtent = vesselTrack.features[0].getGeometry().getExtent().slice(0)

    vesselTrack.features
      .filter(feature => feature.getId().includes(identity))
      .forEach(feature => {
        vesselTrackExtent = extend(vesselTrackExtent, feature.getGeometry().getExtent())
      })

    return vesselTrackExtent
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
      {
        fishingActivitiesShowedOnMap
          .filter(fishingActivity => fishingActivity.coordinates)
          .map(fishingActivity => {
            return <FishingActivityOverlay
              key={fishingActivity.id}
              id={fishingActivity.id}
              map={map}
              name={fishingActivity.name}
              coordinates={fishingActivity.coordinates}
              isDeleted={fishingActivity.isDeleted}
              isNotAcknowledged={fishingActivity.isNotAcknowledged}
            />
          })
      }
    </>
  )
}

export default VesselsTracksLayer
