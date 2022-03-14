import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'

import { usePrevious } from '../hooks/usePrevious'
import Layers from '../domain/entities/layers'
import {
  fishingActivityIsWithinTrackLineDates,
  getVesselTrackExtent, getVesselTrackLines, removeFishingActivitiesFeatures,
  removeVesselTrackFeatures,
  updateTrackCircleStyle,
  VesselTrack
} from '../domain/entities/vesselTrack'
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
    features: [],
    wrapX: false
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
    function showSelectedVesselTrack () {
      if (map && selectedVessel && selectedVesselPositions?.length) {
        const features = vectorSourceRef.current.getFeatures()
        const identity = getVesselFeatureIdFromVessel(selectedVessel)
        removeVesselTrackFeatures(features, vectorSourceRef.current, identity)

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

    showSelectedVesselTrack()
  }, [selectedVessel, selectedVesselPositions])

  useEffect(() => {
    function hidePreviouslySelectedVessel () {
      if (previousSelectedVessel && !selectedVessel) {
        const features = vectorSourceRef.current.getFeatures()
        const vesselIdentity = getVesselFeatureIdFromVessel(previousSelectedVessel)
        removeVesselTrackFeatures(features, vectorSourceRef.current, vesselIdentity)

        dispatch(updateVesselTrackAsHidden(vesselIdentity))
      }
    }

    hidePreviouslySelectedVessel()
  }, [previousSelectedVessel, selectedVessel])

  useEffect(() => {
    if (!Object.keys(vesselsTracksShowed)?.length || !vectorSourceRef.current) {
      return
    }

    const features = vectorSourceRef.current.getFeatures()
    function showVesselsTracks (features, vesselTracks) {
      vesselTracks
        .filter(positionsAndTrackDepth => positionsAndTrackDepth.toShow)
        .forEach(vesselTrack => {
          removeVesselTrackFeatures(features, vectorSourceRef.current, vesselTrack.identity)

          const vesselTrackFeatures = new VesselTrack(vesselTrack.positions, vesselTrack.identity)
          vectorSourceRef.current.addFeatures(vesselTrackFeatures.features)

          dispatch(updateVesselTrackAsShowed(vesselTrack.identity))
        })
    }

    function hideVesselsTracks (features, vesselTracks) {
      vesselTracks
        .filter(positionsAndTrackDepth => positionsAndTrackDepth.toHide)
        .forEach(vesselTrack => {
          removeVesselTrackFeatures(features, vectorSourceRef.current, vesselTrack.identity)

          dispatch(updateVesselTrackAsHidden(vesselTrack.identity))
        })
    }

    const vesselTracks = Object.keys(vesselsTracksShowed)
      .map(identity => vesselsTracksShowed[identity])

    showVesselsTracks(features, vesselTracks)
    hideVesselsTracks(features, vesselTracks)
  }, [vesselsTracksShowed, vectorSourceRef.current])

  useEffect(() => {
    const features = vectorSourceRef.current.getFeatures()
    if (highlightedVesselTrackPosition) {
      updateTrackCircleStyle(features, previousHighlightedVesselTrackPosition, null)
      updateTrackCircleStyle(features, highlightedVesselTrackPosition, 7)
    } else {
      updateTrackCircleStyle(features, previousHighlightedVesselTrackPosition, null)
    }
  }, [highlightedVesselTrackPosition, previousHighlightedVesselTrackPosition])

  useEffect(() => {
    function showFishingActivities () {
      const features = vectorSourceRef.current.getFeatures()
      if (!fishingActivitiesShowedOnMap?.length) {
        removeFishingActivitiesFeatures(features, vectorSourceRef.current)
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

      const lines = getVesselTrackLines(features)
      const coordinatesFeaturesAndIds = fishingActivitiesShowedOnMap.map(fishingActivity => {
        const fishingActivityDateTimestamp = new Date(fishingActivity.date).getTime()

        const lineOfFishingActivity = lines
          .find(line => fishingActivityIsWithinTrackLineDates(fishingActivityDateTimestamp, line))

        if (lineOfFishingActivity) {
          return getFishingActivityFeatureOnTrackLine(fishingActivity, lineOfFishingActivity, fishingActivityDateTimestamp)
        }
        return null
      }).filter(coordinatesFeaturesAndIds => coordinatesFeaturesAndIds)

      removeFishingActivitiesFeatures(features, vectorSourceRef.current)
      vectorSourceRef.current.addFeatures(coordinatesFeaturesAndIds.map(coordinatesFeatureAndId => coordinatesFeatureAndId.feature))
      vectorSourceRef.current.changed()
      dispatch(updateFishingActivitiesOnMapCoordinates(coordinatesFeaturesAndIds))
    }

    showFishingActivities()
  }, [fishingActivitiesShowedOnMap, selectedVesselPositions, redrawFishingActivitiesOnMap])

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
